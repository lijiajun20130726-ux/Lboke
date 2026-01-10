const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { generateToken, authMiddleware, adminMiddleware } = require('../middleware/auth');
const ResponseHelper = require('../utils/response');

// 参数验证规则
const registerValidation = [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('用户名长度应为3-50个字符'),
    body('password').isLength({ min: 6 }).withMessage('密码长度至少6个字符'),
    body('email').optional().isEmail().withMessage('邮箱格式不正确')
];

const loginValidation = [
    body('username').trim().notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空')
];

// 用户注册
router.post('/register', registerValidation, async (req, res) => {
    try {
        // 验证参数
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ResponseHelper.error(res, errors.array()[0].msg);
        }

        const { username, password, email, nickname } = req.body;

        // 检查用户名是否已存在
        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existingUsers.length > 0) {
            return ResponseHelper.error(res, '用户名已存在');
        }

        // 检查邮箱是否已存在
        if (email) {
            const [existingEmails] = await pool.query(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );
            if (existingEmails.length > 0) {
                return ResponseHelper.error(res, '邮箱已被注册');
            }
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建用户
        const [result] = await pool.query(
            'INSERT INTO users (username, password, email, nickname, role) VALUES (?, ?, ?, ?, ?)',
            [username, hashedPassword, email || null, nickname || username, 'user']
        );

        ResponseHelper.created(res, { userId: result.insertId }, '注册成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 用户登录
router.post('/login', loginValidation, async (req, res) => {
    try {
        // 验证参数
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ResponseHelper.error(res, errors.array()[0].msg);
        }

        const { username, password } = req.body;

        // 查询用户
        const [users] = await pool.query(
            'SELECT id, username, password, email, nickname, avatar, role, status FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return ResponseHelper.error(res, '用户名或密码错误');
        }

        const user = users[0];

        // 检查用户状态
        if (user.status === 0) {
            return ResponseHelper.error(res, '账户已被禁用');
        }

        // 验证密码
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return ResponseHelper.error(res, '用户名或密码错误');
        }

        // 生成Token
        const token = generateToken({
            id: user.id,
            username: user.username,
            role: user.role
        });

        // 返回用户信息（不包含密码）
        const { password: _, ...userInfo } = user;

        ResponseHelper.success(res, { token, user: userInfo }, '登录成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 获取当前用户信息
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, username, email, nickname, avatar, role, status, created_at FROM users WHERE id = ?',
            [req.user.id]
        );

        if (users.length === 0) {
            return ResponseHelper.error(res, '用户不存在', 404);
        }

        ResponseHelper.success(res, users[0]);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 更新当前用户信息
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { nickname, email, avatar } = req.body;
        const userId = req.user.id;

        // 如果更新邮箱，检查是否已被使用
        if (email) {
            const [existingEmails] = await pool.query(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, userId]
            );
            if (existingEmails.length > 0) {
                return ResponseHelper.error(res, '邮箱已被其他用户使用');
            }
        }

        await pool.query(
            'UPDATE users SET nickname = COALESCE(?, nickname), email = COALESCE(?, email), avatar = COALESCE(?, avatar) WHERE id = ?',
            [nickname, email, avatar, userId]
        );

        // 获取更新后的用户信息
        const [users] = await pool.query(
            'SELECT id, username, email, nickname, avatar, role, status, created_at FROM users WHERE id = ?',
            [userId]
        );

        ResponseHelper.success(res, users[0], '更新成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 修改密码
router.put('/password', authMiddleware, [
    body('oldPassword').notEmpty().withMessage('请输入原密码'),
    body('newPassword').isLength({ min: 6 }).withMessage('新密码长度至少6个字符')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ResponseHelper.error(res, errors.array()[0].msg);
        }

        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        // 获取用户当前密码
        const [users] = await pool.query(
            'SELECT password FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return ResponseHelper.error(res, '用户不存在', 404);
        }

        // 验证原密码
        const isValidPassword = await bcrypt.compare(oldPassword, users[0].password);
        if (!isValidPassword) {
            return ResponseHelper.error(res, '原密码错误');
        }

        // 更新密码
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        ResponseHelper.success(res, null, '密码修改成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// ==================== 管理员接口 ====================

// 获取用户列表（管理员）
router.get('/list', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { page = 1, pageSize = 10, keyword, role, status } = req.query;
        const offset = (page - 1) * pageSize;

        let sql = 'SELECT id, username, email, nickname, avatar, role, status, created_at FROM users WHERE 1=1';
        let countSql = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
        const params = [];
        const countParams = [];

        if (keyword) {
            sql += ' AND (username LIKE ? OR nickname LIKE ? OR email LIKE ?)';
            countSql += ' AND (username LIKE ? OR nickname LIKE ? OR email LIKE ?)';
            const likeKeyword = `%${keyword}%`;
            params.push(likeKeyword, likeKeyword, likeKeyword);
            countParams.push(likeKeyword, likeKeyword, likeKeyword);
        }

        if (role) {
            sql += ' AND role = ?';
            countSql += ' AND role = ?';
            params.push(role);
            countParams.push(role);
        }

        if (status !== undefined) {
            sql += ' AND status = ?';
            countSql += ' AND status = ?';
            params.push(status);
            countParams.push(status);
        }

        sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(pageSize), parseInt(offset));

        const [users] = await pool.query(sql, params);
        const [countResult] = await pool.query(countSql, countParams);

        ResponseHelper.paginate(res, users, countResult[0].total, page, pageSize);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 更新用户状态（管理员）
router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // 不能禁用自己
        if (parseInt(id) === req.user.id) {
            return ResponseHelper.error(res, '不能禁用自己的账户');
        }

        await pool.query(
            'UPDATE users SET status = ? WHERE id = ?',
            [status, id]
        );

        ResponseHelper.success(res, null, '状态更新成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 删除用户（管理员）
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // 不能删除自己
        if (parseInt(id) === req.user.id) {
            return ResponseHelper.error(res, '不能删除自己的账户');
        }

        await pool.query('DELETE FROM users WHERE id = ?', [id]);

        ResponseHelper.success(res, null, '删除成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

module.exports = router;
