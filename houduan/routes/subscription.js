const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const ResponseHelper = require('../utils/response');

// 订阅
router.post('/subscribe', [
    body('email').trim().isEmail().withMessage('邮箱格式不正确')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ResponseHelper.error(res, errors.array()[0].msg);
        }

        const { email } = req.body;
        const ip = req.ip;

        // 检查是否已订阅
        const [existing] = await pool.query('SELECT id, status FROM subscriptions WHERE email = ?', [email]);
        
        if (existing.length > 0) {
            if (existing[0].status === 1) {
                return ResponseHelper.error(res, '该邮箱已订阅');
            } else {
                // 重新激活
                await pool.query('UPDATE subscriptions SET status = 1, ip = ? WHERE id = ?', [ip, existing[0].id]);
                return ResponseHelper.success(res, null, '订阅成功');
            }
        }

        await pool.query('INSERT INTO subscriptions (email, ip, status) VALUES (?, ?, 1)', [email, ip]);
        ResponseHelper.success(res, null, '订阅成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 退订
router.post('/unsubscribe', [
    body('email').trim().isEmail().withMessage('邮箱格式不正确')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ResponseHelper.error(res, errors.array()[0].msg);
        }

        const { email } = req.body;

        const [existing] = await pool.query('SELECT id FROM subscriptions WHERE email = ?', [email]);
        if (existing.length === 0) {
            return ResponseHelper.error(res, '该邮箱未订阅');
        }

        await pool.query('UPDATE subscriptions SET status = 0 WHERE email = ?', [email]);
        ResponseHelper.success(res, null, '已退订');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 获取订阅列表（后台）
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 10, email, status } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const offset = (pageNum - 1) * limitNum;

        let whereClause = 'WHERE 1=1';
        let params = [];

        if (email) {
            whereClause += ' AND email LIKE ?';
            params.push(`%${email}%`);
        }

        if (status !== undefined) {
            whereClause += ' AND status = ?';
            params.push(parseInt(status));
        }

        const [subscriptions] = await pool.query(
            `SELECT * FROM subscriptions ${whereClause} ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset}`,
            params
        );

        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total FROM subscriptions ${whereClause}`,
            params
        );

        ResponseHelper.paginate(res, subscriptions, countResult[0].total, pageNum, limitNum);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 获取订阅统计（后台）
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM subscriptions');
        const [activeResult] = await pool.query('SELECT COUNT(*) as active FROM subscriptions WHERE status = 1');
        
        // 获取最近7天的订阅趋势
        const [trendResult] = await pool.query(`
            SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM subscriptions 
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        ResponseHelper.success(res, {
            total: totalResult[0].total,
            active: activeResult[0].active,
            trend: trendResult
        });
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 删除订阅（后台）
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM subscriptions WHERE id = ?', [id]);
        ResponseHelper.success(res, null, '删除成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 批量删除订阅（后台）
router.delete('/batch/delete', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return ResponseHelper.error(res, '参数错误', 400);
        }

        const placeholders = ids.map(() => '?').join(',');
        await pool.query(`DELETE FROM subscriptions WHERE id IN (${placeholders})`, ids);
        ResponseHelper.success(res, null, '批量删除成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 导出订阅列表（后台）
router.get('/export', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.query;
        let sql = 'SELECT email, status, ip, created_at FROM subscriptions';
        let params = [];

        if (status !== undefined) {
            sql += ' WHERE status = ?';
            params.push(parseInt(status));
        }

        sql += ' ORDER BY created_at DESC';
        const [subscriptions] = await pool.query(sql, params);
        
        ResponseHelper.success(res, subscriptions);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

module.exports = router;
