const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const ResponseHelper = require('../utils/response');

// ==================== 分类管理 ====================

// 创建分类（管理员）
router.post('/', authMiddleware, adminMiddleware, [
    body('name').trim().isLength({ min: 1, max: 50 }).withMessage('分类名称长度应为1-50个字符')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ResponseHelper.error(res, errors.array()[0].msg);
        }

        const { name, description, sort_order = 0 } = req.body;

        // 检查分类名是否已存在
        const [existing] = await pool.query(
            'SELECT id FROM categories WHERE name = ?',
            [name]
        );

        if (existing.length > 0) {
            return ResponseHelper.error(res, '分类名称已存在');
        }

        const [result] = await pool.query(
            'INSERT INTO categories (name, description, sort_order) VALUES (?, ?, ?)',
            [name, description || null, sort_order]
        );

        ResponseHelper.created(res, { categoryId: result.insertId }, '分类创建成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 更新分类（管理员）
router.put('/:id', authMiddleware, adminMiddleware, [
    body('name').trim().isLength({ min: 1, max: 50 }).withMessage('分类名称长度应为1-50个字符')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ResponseHelper.error(res, errors.array()[0].msg);
        }

        const { id } = req.params;
        const { name, description, sort_order } = req.body;

        // 检查分类是否存在
        const [existing] = await pool.query(
            'SELECT id FROM categories WHERE id = ?',
            [id]
        );

        if (existing.length === 0) {
            return ResponseHelper.error(res, '分类不存在', 404);
        }

        // 检查名称是否与其他分类重复
        const [duplicate] = await pool.query(
            'SELECT id FROM categories WHERE name = ? AND id != ?',
            [name, id]
        );

        if (duplicate.length > 0) {
            return ResponseHelper.error(res, '分类名称已存在');
        }

        await pool.query(
            'UPDATE categories SET name = ?, description = ?, sort_order = ? WHERE id = ?',
            [name, description || null, sort_order || 0, id]
        );

        ResponseHelper.success(res, null, '分类更新成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 删除分类（管理员）
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // 检查是否有文章使用该分类
        const [articles] = await pool.query(
            'SELECT COUNT(*) as count FROM articles WHERE category_id = ?',
            [id]
        );

        if (articles[0].count > 0) {
            return ResponseHelper.error(res, '该分类下还有文章，无法删除');
        }

        await pool.query('DELETE FROM categories WHERE id = ?', [id]);

        ResponseHelper.success(res, null, '分类删除成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 获取分类列表
router.get('/', async (req, res) => {
    try {
        const { withCount } = req.query;

        let sql;
        if (withCount === 'true') {
            // 包含文章数量统计
            sql = `
                SELECT c.*, COUNT(a.id) as article_count
                FROM categories c
                LEFT JOIN articles a ON c.id = a.category_id AND a.status = 'published'
                GROUP BY c.id
                ORDER BY c.sort_order ASC, c.created_at DESC
            `;
        } else {
            sql = 'SELECT * FROM categories ORDER BY sort_order ASC, created_at DESC';
        }

        const [categories] = await pool.query(sql);

        ResponseHelper.success(res, categories);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 获取单个分类
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [categories] = await pool.query(
            'SELECT * FROM categories WHERE id = ?',
            [id]
        );

        if (categories.length === 0) {
            return ResponseHelper.error(res, '分类不存在', 404);
        }

        ResponseHelper.success(res, categories[0]);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

module.exports = router;
