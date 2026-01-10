const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const ResponseHelper = require('../utils/response');

// 创建标签（管理员）
router.post('/', authMiddleware, adminMiddleware, [
    body('name').trim().isLength({ min: 1, max: 50 }).withMessage('标签名称长度应为1-50个字符')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ResponseHelper.error(res, errors.array()[0].msg);
        }

        const { name } = req.body;

        // 检查标签名是否已存在
        const [existing] = await pool.query(
            'SELECT id FROM tags WHERE name = ?',
            [name]
        );

        if (existing.length > 0) {
            return ResponseHelper.error(res, '标签名称已存在');
        }

        const [result] = await pool.query(
            'INSERT INTO tags (name) VALUES (?)',
            [name]
        );

        ResponseHelper.created(res, { tagId: result.insertId }, '标签创建成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 更新标签（管理员）
router.put('/:id', authMiddleware, adminMiddleware, [
    body('name').trim().isLength({ min: 1, max: 50 }).withMessage('标签名称长度应为1-50个字符')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ResponseHelper.error(res, errors.array()[0].msg);
        }

        const { id } = req.params;
        const { name } = req.body;

        // 检查标签是否存在
        const [existing] = await pool.query(
            'SELECT id FROM tags WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return ResponseHelper.error(res, '标签不存在', 404);
        }

        // 检查名称是否与其他标签重复
        const [duplicate] = await pool.query(
            'SELECT id FROM tags WHERE name = ? AND id != ?',
            [name, id]
        );

        if (duplicate.length > 0) {
            return ResponseHelper.error(res, '标签名称已存在');
        }

        await pool.query(
            'UPDATE tags SET name = ? WHERE id = ?',
            [name, id]
        );

        ResponseHelper.success(res, null, '标签更新成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 删除标签（管理员）
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // 删除标签（会自动删除关联关系）
        await pool.query('DELETE FROM tags WHERE id = ?', [id]);

        ResponseHelper.success(res, null, '标签删除成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 获取标签列表
router.get('/', async (req, res) => {
    try {
        const { withCount } = req.query;

        let sql;
        if (withCount === 'true') {
            // 包含文章数量统计
            sql = `
                SELECT t.*, COUNT(at.article_id) as article_count
                FROM tags t
                LEFT JOIN article_tags at ON t.id = at.tag_id
                LEFT JOIN articles a ON at.article_id = a.id AND a.status = 'published'
                GROUP BY t.id
                ORDER BY article_count DESC, t.created_at DESC
            `;
        } else {
            sql = 'SELECT * FROM tags ORDER BY created_at DESC';
        }

        const [tags] = await pool.query(sql);

        ResponseHelper.success(res, tags);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 获取单个标签
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [tags] = await pool.query(
            'SELECT * FROM tags WHERE id = ?',
            [id]
        );

        if (tags.length === 0) {
            return ResponseHelper.error(res, '标签不存在', 404);
        }

        ResponseHelper.success(res, tags[0]);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 批量创建标签（管理员）
router.post('/batch', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { names } = req.body;

        if (!names || !Array.isArray(names) || names.length === 0) {
            return ResponseHelper.error(res, '请提供标签名称数组');
        }

        const createdTags = [];
        const existingTags = [];

        for (const name of names) {
            const trimmedName = name.trim();
            if (!trimmedName) continue;

            const [existing] = await pool.query(
                'SELECT id, name FROM tags WHERE name = ?',
                [trimmedName]
            );

            if (existing.length > 0) {
                existingTags.push(existing[0]);
            } else {
                const [result] = await pool.query(
                    'INSERT INTO tags (name) VALUES (?)',
                    [trimmedName]
                );
                createdTags.push({ id: result.insertId, name: trimmedName });
            }
        }

        ResponseHelper.success(res, { createdTags, existingTags }, '批量创建完成');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

module.exports = router;
