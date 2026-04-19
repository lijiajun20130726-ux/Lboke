const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const ResponseHelper = require('../utils/response');

// 获取友链列表（后台管理）
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        
        let whereClause = '';
        let params = [];
        
        if (status !== undefined && status !== '') {
            whereClause = 'WHERE status = ?';
            params.push(parseInt(status));
        }
        
        const [links] = await pool.query(
            `SELECT * FROM friend_links ${whereClause} ORDER BY sort_order DESC, created_at DESC LIMIT ${limitNum} OFFSET ${offset}`,
            params
        );
        
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM friend_links ${whereClause}`,
            params
        );
        
        ResponseHelper.paginate(res, links, countResult[0].total, pageNum, limitNum);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 获取单个友链
router.get('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const [links] = await pool.execute('SELECT * FROM friend_links WHERE id = ?', [id]);
        
        if (links.length === 0) {
            return ResponseHelper.error(res, '友链不存在', 404);
        }
        
        ResponseHelper.success(res, links[0]);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

router.post('/apply', async (req, res) => {
    try {
        const name = (req.body?.name || '').trim();
        const url = (req.body?.url || '').trim();
        const logo = (req.body?.logo || '').trim();
        const description = (req.body?.description || '').trim();

        if (!name || !url) {
            return ResponseHelper.error(res, '网站名称和网站地址不能为空', 400);
        }

        if (name.length > 100) {
            return ResponseHelper.error(res, '名称不能超过100字符', 400);
        }

        if (description && description.length > 255) {
            return ResponseHelper.error(res, '描述不能超过255字符', 400);
        }

        try {
            new URL(url);
        } catch {
            return ResponseHelper.error(res, '请输入有效的URL', 400);
        }

        if (logo) {
            try {
                new URL(logo);
            } catch {
                return ResponseHelper.error(res, 'Logo必须是有效的URL', 400);
            }
        }

        const [existing] = await pool.execute('SELECT id FROM friend_links WHERE url = ?', [url]);
        if (existing.length > 0) {
            return ResponseHelper.error(res, '该网站已存在或已提交申请', 400);
        }

        const [result] = await pool.execute(
            'INSERT INTO friend_links (name, url, logo, description, status, sort_order) VALUES (?, ?, ?, ?, 0, 0)',
            [name, url, logo || null, description || null]
        );

        ResponseHelper.success(res, { id: result.insertId }, '申请已提交，等待审核');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 创建友链（管理员）
router.post('/', 
    authMiddleware,
    adminMiddleware,
    [
        body('name').notEmpty().withMessage('网站名称不能为空').isLength({ max: 100 }).withMessage('名称不能超过100字符'),
        body('url').notEmpty().withMessage('网站地址不能为空').isURL().withMessage('请输入有效的URL'),
        body('logo').optional({ checkFalsy: true }).isURL().withMessage('Logo必须是有效的URL'),
        body('description').optional().isLength({ max: 255 }).withMessage('描述不能超过255字符'),
        body('sort_order').optional().isInt({ min: 0 }).withMessage('排序必须为非负整数')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return ResponseHelper.error(res, '参数验证失败', 400, errors.array());
            }
            
            const { name, url, logo, description, sort_order = 0 } = req.body;
            
            // 检查是否已存在相同URL
            const [existing] = await pool.execute('SELECT id FROM friend_links WHERE url = ?', [url]);
            if (existing.length > 0) {
                return ResponseHelper.error(res, '该网站已存在', 400);
            }
            
            const [result] = await pool.execute(
                'INSERT INTO friend_links (name, url, logo, description, sort_order) VALUES (?, ?, ?, ?, ?)',
                [name, url, logo || null, description || null, sort_order]
            );
            
            ResponseHelper.success(res, { id: result.insertId }, '创建成功');
        } catch (error) {
            ResponseHelper.serverError(res, error);
        }
    }
);

// 更新友链（管理员）
router.put('/:id',
    authMiddleware,
    adminMiddleware,
    [
        body('name').optional().notEmpty().withMessage('网站名称不能为空').isLength({ max: 100 }),
        body('url').optional({ checkFalsy: true }).isURL().withMessage('请输入有效的URL'),
        body('logo').optional({ checkFalsy: true }).isURL().withMessage('Logo必须是有效的URL'),
        body('description').optional().isLength({ max: 255 }),
        body('sort_order').optional().isInt({ min: 0 }),
        body('status').optional().isIn([0, 1])
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return ResponseHelper.error(res, '参数验证失败', 400, errors.array());
            }
            
            const { id } = req.params;
            
            // 检查友链是否存在
            const [existing] = await pool.execute('SELECT id FROM friend_links WHERE id = ?', [id]);
            if (existing.length === 0) {
                return ResponseHelper.error(res, '友链不存在', 404);
            }
            
            const updateData = req.body;
            const fields = Object.keys(updateData).filter(k => updateData[k] !== undefined);
            
            if (fields.length === 0) {
                return ResponseHelper.error(res, '没有需要更新的字段', 400);
            }
            
            const values = fields.map(f => updateData[f]);
            const setClause = fields.map(field => `${field} = ?`).join(', ');
            
            await pool.execute(
                `UPDATE friend_links SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                [...values, id]
            );
            
            ResponseHelper.success(res, null, '更新成功');
        } catch (error) {
            ResponseHelper.serverError(res, error);
        }
    }
);

// 删除友链（管理员）
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.execute('DELETE FROM friend_links WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return ResponseHelper.error(res, '友链不存在', 404);
        }
        
        ResponseHelper.success(res, null, '删除成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 批量更新状态（管理员）
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
            `UPDATE friend_links SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
            [status, ...ids]
        );
        
        ResponseHelper.success(res, null, '批量更新成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

module.exports = router;
