const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const ResponseHelper = require('../utils/response');

// 获取留言列表（前台公开 - 只返回已审核的）
router.get('/public', async (req, res) => {
    try {
        const { limit = 100 } = req.query;
        const limitNum = Math.min(parseInt(limit) || 100, 200);
        
        const [messages] = await pool.query(
            `SELECT id, nickname, content, color, created_at 
             FROM messages WHERE status = 1 
             ORDER BY created_at DESC LIMIT ${limitNum}`
        );
        
        ResponseHelper.success(res, messages);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 发送留言（前台公开）
router.post('/send',
    [
        body('nickname').notEmpty().withMessage('昵称不能为空').isLength({ max: 50 }).withMessage('昵称不能超过50字符'),
        body('content').notEmpty().withMessage('内容不能为空').isLength({ max: 500 }).withMessage('内容不能超过500字符'),
        body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/).withMessage('颜色格式无效')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return ResponseHelper.error(res, errors.array()[0].msg, 400);
            }
            
            const { nickname, content, color = '#1d1d1f' } = req.body;
            const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            
            const [result] = await pool.execute(
                'INSERT INTO messages (nickname, content, color, ip) VALUES (?, ?, ?, ?)',
                [nickname, content, color, ip]
            );
            
            // 返回新创建的留言
            const [newMessage] = await pool.execute(
                'SELECT id, nickname, content, color, created_at FROM messages WHERE id = ?',
                [result.insertId]
            );
            
            ResponseHelper.success(res, newMessage[0], '留言成功！');
        } catch (error) {
            ResponseHelper.serverError(res, error);
        }
    }
);

// 获取留言列表（后台管理）
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 20, status, keyword } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;
        
        let whereClause = '1=1';
        let params = [];
        
        if (status !== undefined && status !== '') {
            whereClause += ' AND status = ?';
            params.push(parseInt(status));
        }
        
        if (keyword) {
            whereClause += ' AND (nickname LIKE ? OR content LIKE ?)';
            params.push(`%${keyword}%`, `%${keyword}%`);
        }
        
        const [messages] = await pool.query(
            `SELECT * FROM messages WHERE ${whereClause} ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset}`,
            params
        );
        
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM messages WHERE ${whereClause}`,
            params
        );
        
        ResponseHelper.paginate(res, messages, countResult[0].total, pageNum, limitNum);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 更新留言状态（后台管理）
router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (![0, 1].includes(status)) {
            return ResponseHelper.error(res, '状态值无效', 400);
        }
        
        const [result] = await pool.execute(
            'UPDATE messages SET status = ? WHERE id = ?',
            [status, id]
        );
        
        if (result.affectedRows === 0) {
            return ResponseHelper.error(res, '留言不存在', 404);
        }
        
        ResponseHelper.success(res, null, '状态更新成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 删除留言（后台管理）
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await pool.execute('DELETE FROM messages WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return ResponseHelper.error(res, '留言不存在', 404);
        }
        
        ResponseHelper.success(res, null, '删除成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 批量删除（后台管理）
router.delete('/batch/delete', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { ids } = req.body;
        
        if (!Array.isArray(ids) || ids.length === 0) {
            return ResponseHelper.error(res, 'ids必须为非空数组', 400);
        }
        
        const placeholders = ids.map(() => '?').join(',');
        await pool.execute(`DELETE FROM messages WHERE id IN (${placeholders})`, ids);
        
        ResponseHelper.success(res, null, '批量删除成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 批量更新状态（后台管理）
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
            `UPDATE messages SET status = ? WHERE id IN (${placeholders})`,
            [status, ...ids]
        );
        
        ResponseHelper.success(res, null, '批量更新成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 获取统计（后台管理）
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const [total] = await pool.execute('SELECT COUNT(*) as count FROM messages');
        const [visible] = await pool.execute('SELECT COUNT(*) as count FROM messages WHERE status = 1');
        const [today] = await pool.execute(
            'SELECT COUNT(*) as count FROM messages WHERE DATE(created_at) = CURDATE()'
        );
        
        ResponseHelper.success(res, {
            total: total[0].count,
            visible: visible[0].count,
            hidden: total[0].count - visible[0].count,
            today: today[0].count
        });
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

module.exports = router;
