const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const https = require('https');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { generateToken, authMiddleware, adminMiddleware } = require('../middleware/auth');
const { sendVerifyCode, sendRegisterVerifyCode } = require('../config/email');
const ResponseHelper = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const fetchJson = (url) =>
    new Promise((resolve, reject) => {
        https
            .get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => (data += chunk));
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (err) {
                        reject(err);
                    }
                });
            })
            .on('error', reject);
    });

const createWeChatState = () =>
    jwt.sign({ type: 'wechat', nonce: crypto.randomBytes(8).toString('hex') }, JWT_SECRET, { expiresIn: '10m' });

const isValidWeChatState = (state) => {
    try {
        const decoded = jwt.verify(state, JWT_SECRET);
        return decoded?.type === 'wechat';
    } catch (error) {
        return false;
    }
};

// 参数验证规则
const registerValidation = [
    body('username').trim().isLength({ min: 3, max: 50 }).withMessage('用户名长度应为3-50个字符'),
    body('password').isLength({ min: 6 }).withMessage('密码长度至少6个字符'),
    body('email').trim().isEmail().withMessage('邮箱格式不正确'),
    body('code').trim().isLength({ min: 6, max: 6 }).withMessage('验证码为6位数字')
];

const loginValidation = [
    body('account').trim().notEmpty().withMessage('用户名或邮箱不能为空'),
    body('password').notEmpty().withMessage('密码不能为空')
];

const wechatAuthorizeHandler = async (req, res) => {
    try {
        const wechatAppId = process.env.WECHAT_APP_ID || process.env.WECHAT_APPID;
        const wechatRedirectUri = process.env.WECHAT_REDIRECT_URI;
        if (!wechatAppId || !wechatRedirectUri) {
            return ResponseHelper.error(res, '微信登录配置不完整');
        }

        const state = createWeChatState();
        const redirectUri = encodeURIComponent(wechatRedirectUri);
        const scope = (process.env.WECHAT_SCOPE || 'snsapi_login').trim();
        const url = `https://open.weixin.qq.com/connect/qrconnect?appid=${wechatAppId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}#wechat_redirect`;
        ResponseHelper.success(res, { url });
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
};

const wechatCallbackHandler = async (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectWithError = (message) =>
        res.redirect(`${frontendUrl}/login?wechat_error=${encodeURIComponent(message)}`);

    try {
        const wechatAppId = process.env.WECHAT_APP_ID || process.env.WECHAT_APPID;
        const wechatAppSecret = process.env.WECHAT_APP_SECRET || process.env.WECHAT_APPSECRET;
        const { code, state } = req.query;

        if (!wechatAppId || !wechatAppSecret) {
            return redirectWithError('微信登录配置不完整');
        }

        if (!code || !state || !isValidWeChatState(state)) {
            return redirectWithError('微信登录已过期，请重试');
        }

        const tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${wechatAppId}&secret=${wechatAppSecret}&code=${code}&grant_type=authorization_code`;
        const tokenData = await fetchJson(tokenUrl);
        if (tokenData.errcode) {
            return redirectWithError(tokenData.errmsg || '授权失败');
        }

        const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${tokenData.access_token}&openid=${tokenData.openid}`;
        const userInfo = await fetchJson(userInfoUrl);
        if (userInfo.errcode) {
            return redirectWithError(userInfo.errmsg || '获取用户信息失败');
        }

        const [bindings] = await pool.query('SELECT user_id FROM wechat_users WHERE openid = ? LIMIT 1', [
            tokenData.openid
        ]);

        let userId = null;
        if (bindings.length > 0) {
            userId = bindings[0].user_id;
        } else {
            const base = `wx_${tokenData.openid.slice(0, 8)}`;
            let username = base;
            let suffix = 0;

            while (true) {
                const [existing] = await pool.query('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);
                if (existing.length === 0) break;
                suffix += 1;
                username = `${base}_${suffix}`;
                if (suffix > 20) {
                    username = `${base}_${Date.now()}`;
                    break;
                }
            }

            const randomPassword = crypto.randomBytes(16).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            const [userResult] = await pool.query(
                'INSERT INTO users (username, password, email, nickname, avatar, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                    username,
                    hashedPassword,
                    null,
                    userInfo.nickname || username,
                    userInfo.headimgurl || null,
                    'user',
                    1
                ]
            );

            userId = userResult.insertId;

            await pool.query(
                'INSERT INTO wechat_users (user_id, openid, unionid, nickname, avatar) VALUES (?, ?, ?, ?, ?)',
                [userId, tokenData.openid, tokenData.unionid || null, userInfo.nickname || null, userInfo.headimgurl || null]
            );
        }

        const [users] = await pool.query(
            'SELECT id, username, nickname, avatar, role, status FROM users WHERE id = ? LIMIT 1',
            [userId]
        );

        if (users.length === 0) {
            return redirectWithError('用户不存在');
        }

        const token = generateToken({
            id: users[0].id,
            username: users[0].username,
            role: users[0].role
        });

        return res.redirect(`${frontendUrl}/login?token=${encodeURIComponent(token)}`);
    } catch (error) {
        return redirectWithError('服务器异常');
    }
};

router.get('/wechat/authorize', wechatAuthorizeHandler);
router.get('/wechat/callback', wechatCallbackHandler);

// 用户注册
router.post('/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ResponseHelper.error(res, errors.array()[0].msg);
        }

        const { username, password, email, code } = req.body;

        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        if (existingUsers.length > 0) {
            return ResponseHelper.error(res, '用户名或邮箱已被使用');
        }

        const [codes] = await pool.query(
            'SELECT id FROM email_verify_codes WHERE email = ? AND code = ? AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
            [email, code]
        );
        if (codes.length === 0) {
            return ResponseHelper.error(res, '验证码无效或已过期');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (username, password, email, nickname, role, status) VALUES (?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, email, username, 'user', 1]
        );

        await pool.query('DELETE FROM email_verify_codes WHERE email = ?', [email]);

        ResponseHelper.created(res, { id: result.insertId }, '注册成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

router.post('/send-register-code', [
    body('email').trim().isEmail().withMessage('邮箱格式不正确')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ResponseHelper.error(res, errors.array()[0].msg);
        }

        const { email } = req.body;
        if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return ResponseHelper.error(res, '邮件配置不完整');
        }

        const [existingUsers] = await pool.query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        if (existingUsers.length > 0) {
            return ResponseHelper.error(res, '该邮箱已被注册');
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60000);

        await pool.query(
            'INSERT INTO email_verify_codes (email, code, expires_at) VALUES (?, ?, ?)',
            [email, code, expiresAt]
        );

        try {
            await sendRegisterVerifyCode(email, code);
            ResponseHelper.success(res, null, '验证码已发送至邮箱');
        } catch (emailError) {
            console.error('邮件发送失败:', emailError);
            const detail = emailError?.response || emailError?.message || '邮件发送失败';
            const message = process.env.NODE_ENV === 'development' ? `邮件服务异常：${detail}` : '邮件服务异常，请联系管理员或检查配置';
            ResponseHelper.error(res, message);
        }
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 发送登录验证码
router.post('/send-code', async (req, res) => {
    try {
        const { account } = req.body;
        if (!account) return ResponseHelper.error(res, '请输入用户名或邮箱');
        if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return ResponseHelper.error(res, '邮件配置不完整');
        }

        // 1. 查询用户邮箱
        const [users] = await pool.query(
            'SELECT email FROM users WHERE username = ? OR email = ?',
            [account, account]
        );

        if (users.length === 0) {
            return ResponseHelper.error(res, '用户不存在');
        }
        
        const user = users[0];
        if (!user.email) {
            return ResponseHelper.error(res, '用户未绑定邮箱，无法发送验证码');
        }

        // 2. 生成 6 位随机验证码
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60000); // 5 分钟有效

        // 3. 存入数据库
        await pool.query(
            'INSERT INTO email_verify_codes (email, code, expires_at) VALUES (?, ?, ?)',
            [user.email, code, expiresAt]
        );

        // 4. 发送邮件
        try {
            await sendVerifyCode(user.email, code);
            ResponseHelper.success(res, null, '验证码已发送至您的绑定邮箱');
        } catch (emailError) {
            console.error('邮件发送失败:', emailError);
            const detail = emailError?.response || emailError?.message || '邮件发送失败';
            const message = process.env.NODE_ENV === 'development' ? `邮件服务异常：${detail}` : '邮件服务异常，请联系管理员或检查配置';
            ResponseHelper.error(res, message);
        }
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

        const { account, password, code } = req.body;

        // 查询用户 (支持用户名或邮箱)
        const [users] = await pool.query(
            'SELECT id, username, password, email, nickname, avatar, role, status FROM users WHERE username = ? OR email = ?',
            [account, account]
        );

        if (users.length === 0) {
            return ResponseHelper.error(res, '用户名/邮箱或密码错误');
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

        // 管理员登录验证码已移除

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

// 获取用户点赞的文章列表
router.get('/likes', authMiddleware, async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const offset = (page - 1) * pageSize;
        const userId = req.user.id;

        // 查询点赞文章总数
        const [countResult] = await pool.query(
            `SELECT COUNT(*) as total 
             FROM article_likes al
             INNER JOIN articles a ON al.article_id = a.id
             WHERE al.user_id = ? AND a.status = 'published'`,
            [userId]
        );

        // 查询点赞文章列表
        const [articles] = await pool.query(
            `SELECT a.id, a.title, a.summary, a.cover_image, a.view_count, a.like_count, 
                    a.published_at, al.created_at as liked_at,
                    c.name as category_name,
                    u.nickname as author_name
             FROM article_likes al
             INNER JOIN articles a ON al.article_id = a.id
             LEFT JOIN categories c ON a.category_id = c.id
             LEFT JOIN users u ON a.author_id = u.id
             WHERE al.user_id = ? AND a.status = 'published'
             ORDER BY al.created_at DESC
             LIMIT ? OFFSET ?`,
            [userId, parseInt(pageSize), parseInt(offset)]
        );

        ResponseHelper.paginate(res, articles, countResult[0].total, page, pageSize);
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

router.wechatAuthorizeHandler = wechatAuthorizeHandler;
router.wechatCallbackHandler = wechatCallbackHandler;

module.exports = router;
