const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const ResponseHelper = require('../utils/response');

// 获取公告列表
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        
        let whereClause = '';
        let params = [];
        
        if (status !== undefined) {
            whereClause = 'WHERE status = ?';
            params.push(parseInt(status));
        }
        
        const [announcements] = await pool.query(
            `SELECT * FROM announcements ${whereClause} ORDER BY sort_order DESC, created_at DESC LIMIT ${limitNum} OFFSET ${offset}`,
            params
        );
        
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM announcements ${whereClause}`,
            params
        );
        
        ResponseHelper.paginate(res, announcements, countResult[0].total, pageNum, limitNum);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 获取单个公告
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [announcements] = await pool.execute('SELECT * FROM announcements WHERE id = ?', [id]);
        
        if (announcements.length === 0) {
            return ResponseHelper.error(res, '公告不存在', 404);
        }
        
        ResponseHelper.success(res, announcements[0]);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 创建公告（管理员）
router.post('/', 
    authMiddleware,
    adminMiddleware,
    (req, _res, next) => {
        ['content', 'link', 'link_text', 'start_time', 'end_time'].forEach((key) => {
            if (req.body?.[key] === '') req.body[key] = undefined;
        });
        next();
    },
    [
        body('title').notEmpty().withMessage('标题不能为空').isLength({ max: 200 }).withMessage('标题长度不能超过200字符'),
        body('type').optional().isIn(['info', 'warning', 'success', 'error']).withMessage('类型无效'),
        body('content').optional({ checkFalsy: true, nullable: true }).isLength({ max: 5000 }).withMessage('内容长度不能超过5000字符'),
        body('link').optional({ checkFalsy: true, nullable: true }).isURL().withMessage('链接格式无效'),
        body('link_text').optional({ checkFalsy: true, nullable: true }).isLength({ max: 50 }).withMessage('链接文本长度不能超过50字符'),
        body('sort_order').optional().isInt({ min: 0 }).withMessage('排序必须为非负整数'),
        body('start_time').optional({ checkFalsy: true, nullable: true }).isISO8601().withMessage('开始时间格式无效'),
        body('end_time').optional({ checkFalsy: true, nullable: true }).isISO8601().withMessage('结束时间格式无效')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return ResponseHelper.error(res, '参数验证失败', 400, errors.array());
            }
            
            const payload = req.body || {};
            const { title, content, type = 'info', link, link_text, sort_order = 0, start_time, end_time } = payload;
            const contentVal = content ?? null;
            const linkVal = link ?? null;
            const linkTextVal = link_text ?? null;
            const startTimeVal = start_time ?? null;
            const endTimeVal = end_time ?? null;
            const sortOrderVal = Number.isFinite(Number(sort_order)) ? Number(sort_order) : 0;
            
            const insertValues = [title ?? null, contentVal, (type ?? 'info'), linkVal, linkTextVal, (sortOrderVal ?? 0), startTimeVal, endTimeVal]
                .map(value => (value === undefined ? null : value));
            const [result] = await pool.execute(
                'INSERT INTO announcements (title, content, type, link, link_text, sort_order, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                insertValues
            );
            
            ResponseHelper.success(res, { id: result.insertId }, '创建成功');
        } catch (error) {
            ResponseHelper.serverError(res, error);
        }
    }
);

// 更新公告（管理员）
router.put('/:id',
    authMiddleware,
    adminMiddleware,
    (req, _res, next) => {
        ['content', 'link', 'link_text', 'start_time', 'end_time'].forEach((key) => {
            if (req.body?.[key] === '') req.body[key] = undefined;
        });
        next();
    },
    [
        body('title').optional().notEmpty().withMessage('标题不能为空').isLength({ max: 200 }).withMessage('标题长度不能超过200字符'),
        body('type').optional().isIn(['info', 'warning', 'success', 'error']).withMessage('类型无效'),
        body('content').optional({ checkFalsy: true, nullable: true }).isLength({ max: 5000 }).withMessage('内容长度不能超过5000字符'),
        body('link').optional({ checkFalsy: true, nullable: true }).isURL().withMessage('链接格式无效'),
        body('link_text').optional({ checkFalsy: true, nullable: true }).isLength({ max: 50 }).withMessage('链接文本长度不能超过50字符'),
        body('sort_order').optional().isInt({ min: 0 }).withMessage('排序必须为非负整数'),
        body('status').optional().isIn([0, 1]).withMessage('状态值无效'),
        body('start_time').optional({ checkFalsy: true, nullable: true }).isISO8601().withMessage('开始时间格式无效'),
        body('end_time').optional({ checkFalsy: true, nullable: true }).isISO8601().withMessage('结束时间格式无效')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return ResponseHelper.error(res, '参数验证失败', 400, errors.array());
            }
            
            const { id } = req.params;
            const allowed = new Set(['title','type','content','link','link_text','sort_order','status','start_time','end_time']);
            const updateData = Object.fromEntries(
                Object.entries(req.body)
                    .filter(([key, value]) => allowed.has(key) && value !== undefined)
                    .map(([key, value]) => [key, value === '' ? null : value])
            );
            
            // 检查公告是否存在
            const [existing] = await pool.execute('SELECT id FROM announcements WHERE id = ?', [id]);
            if (existing.length === 0) {
                return ResponseHelper.error(res, '公告不存在', 404);
            }
            
            // 构建更新语句
            const fields = Object.keys(updateData);
            const values = Object.values(updateData);
            const setClause = fields.map(field => `${field} = ?`).join(', ');

            if (!fields.length) {
                return ResponseHelper.success(res, null, '更新成功');
            }
            
            await pool.execute(
                `UPDATE announcements SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [...values, id]
            );
            
            ResponseHelper.success(res, null, '更新成功');
        } catch (error) {
            ResponseHelper.serverError(res, error);
        }
    }
);

// 删除公告（管理员）
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.execute('DELETE FROM announcements WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return ResponseHelper.error(res, '公告不存在', 404);
        }
        
        ResponseHelper.success(res, null, '删除成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 批量更新公告状态（管理员）
router.put('/batch/status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { ids, status } = req.body;
        
        if (!Array.isArray(ids) || ids.length === 0) {
            return ResponseHelper.error(res, 'ids必须为非空数组', 400);
        }
        
        if (![0, 1].includes(status)) {
            return ResponseHelper.error(res, '状态值无效', 400);
        }
        
        const placeholders = ids.map(() => '?').join(',');
        await pool.execute(
            `UPDATE announcements SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
            [status, ...ids]
        );
        
        ResponseHelper.success(res, null, '批量更新成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

module.exports = router;
