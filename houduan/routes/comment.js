const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { optionalAuthMiddleware } = require('../middleware/auth');
const ResponseHelper = require('../utils/response');

// 获取文章评论列表
router.get('/article/:articleId', async (req, res) => {
    try {
        const { articleId } = req.params;
        const [comments] = await pool.query(
            `SELECT c.*, u.nickname as user_nickname, u.avatar as user_avatar
             FROM comments c
             LEFT JOIN users u ON c.user_id = u.id
             WHERE c.article_id = ? AND c.status = 1
             ORDER BY c.created_at DESC`,
            [articleId]
        );

        // 格式化为树形结构（如果需要）
        const commentList = comments.map(comment => ({
            ...comment,
            nickname: comment.user_nickname || comment.nickname || '匿名用户',
            avatar: comment.user_avatar || '/uploads/default-avatar.jpg'
        }));

        ResponseHelper.success(res, commentList);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 发表评论
router.post('/', optionalAuthMiddleware, async (req, res) => {
    try {
        const { article_id, content, parent_id, nickname, email } = req.body;
        
        if (!article_id || !content) {
            return ResponseHelper.error(res, '文章ID和内容不能为空', 400);
        }

        let userId = null;
        let finalNickname = nickname;
        let finalEmail = email;

        if (req.user) {
            userId = req.user.id;
            // 如果已登录，优先使用用户信息
            const [users] = await pool.query('SELECT nickname, email FROM users WHERE id = ?', [userId]);
            if (users.length > 0) {
                finalNickname = users[0].nickname;
                finalEmail = users[0].email;
            }
        }

        if (!userId && !finalNickname) {
            finalNickname = '匿名用户';
        }

        const [result] = await pool.query(
            `INSERT INTO comments (article_id, user_id, nickname, email, content, parent_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [article_id, userId, finalNickname, finalEmail, content, parent_id || null]
        );

        ResponseHelper.created(res, { id: result.insertId }, '评论发表成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

module.exports = router;
