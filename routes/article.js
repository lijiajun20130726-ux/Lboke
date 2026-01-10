const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const ResponseHelper = require('../utils/response');

// 参数验证规则
const articleValidation = [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('标题长度应为1-200个字符'),
    body('content').notEmpty().withMessage('文章内容不能为空')
];

// 创建文章
router.post('/', authMiddleware, articleValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ResponseHelper.error(res, errors.array()[0].msg);
        }

        const { title, content, summary, cover_image, category_id, tags, status = 'draft', is_top = 0 } = req.body;
        const authorId = req.user.id;

        // 开始事务
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 生成摘要（如果未提供）
            const articleSummary = summary || content.replace(/<[^>]+>/g, '').substring(0, 200);
            
            // 设置发布时间
            const publishedAt = status === 'published' ? new Date() : null;

            // 插入文章
            const [result] = await connection.query(
                `INSERT INTO articles (title, content, summary, cover_image, category_id, author_id, status, is_top, published_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [title, content, articleSummary, cover_image || null, category_id || null, authorId, status, is_top, publishedAt]
            );

            const articleId = result.insertId;

            // 处理标签
            if (tags && tags.length > 0) {
                for (const tagName of tags) {
                    // 查找或创建标签
                    let [existingTags] = await connection.query(
                        'SELECT id FROM tags WHERE name = ?',
                        [tagName]
                    );

                    let tagId;
                    if (existingTags.length > 0) {
                        tagId = existingTags[0].id;
                    } else {
                        const [tagResult] = await connection.query(
                            'INSERT INTO tags (name) VALUES (?)',
                            [tagName]
                        );
                        tagId = tagResult.insertId;
                    }

                    // 关联文章和标签
                    await connection.query(
                        'INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)',
                        [articleId, tagId]
                    );
                }
            }

            await connection.commit();
            ResponseHelper.created(res, { articleId }, '文章创建成功');
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 更新文章
router.put('/:id', authMiddleware, articleValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ResponseHelper.error(res, errors.array()[0].msg);
        }

        const { id } = req.params;
        const { title, content, summary, cover_image, category_id, tags, status, is_top } = req.body;

        // 检查文章是否存在及权限
        const [articles] = await pool.query(
            'SELECT author_id, status as old_status FROM articles WHERE id = ?',
            [id]
        );

        if (articles.length === 0) {
            return ResponseHelper.error(res, '文章不存在', 404);
        }

        // 非管理员只能编辑自己的文章
        if (req.user.role !== 'admin' && articles[0].author_id !== req.user.id) {
            return ResponseHelper.error(res, '无权编辑此文章', 403);
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 生成摘要
            const articleSummary = summary || content.replace(/<[^>]+>/g, '').substring(0, 200);

            // 如果状态从非发布变为发布，设置发布时间
            let publishedAt = null;
            if (status === 'published' && articles[0].old_status !== 'published') {
                publishedAt = new Date();
            }

            // 更新文章
            let updateSql = `UPDATE articles SET title = ?, content = ?, summary = ?, 
                            cover_image = ?, category_id = ?`;
            let updateParams = [title, content, articleSummary, cover_image || null, category_id || null];

            if (status) {
                updateSql += ', status = ?';
                updateParams.push(status);
            }

            if (is_top !== undefined) {
                updateSql += ', is_top = ?';
                updateParams.push(is_top);
            }

            if (publishedAt) {
                updateSql += ', published_at = ?';
                updateParams.push(publishedAt);
            }

            updateSql += ' WHERE id = ?';
            updateParams.push(id);

            await connection.query(updateSql, updateParams);

            // 更新标签关联
            if (tags !== undefined) {
                // 删除旧的标签关联
                await connection.query('DELETE FROM article_tags WHERE article_id = ?', [id]);

                // 添加新的标签关联
                if (tags && tags.length > 0) {
                    for (const tagName of tags) {
                        let [existingTags] = await connection.query(
                            'SELECT id FROM tags WHERE name = ?',
                            [tagName]
                        );

                        let tagId;
                        if (existingTags.length > 0) {
                            tagId = existingTags[0].id;
                        } else {
                            const [tagResult] = await connection.query(
                                'INSERT INTO tags (name) VALUES (?)',
                                [tagName]
                            );
                            tagId = tagResult.insertId;
                        }

                        await connection.query(
                            'INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)',
                            [id, tagId]
                        );
                    }
                }
            }

            await connection.commit();
            ResponseHelper.success(res, null, '文章更新成功');
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 删除文章
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // 检查文章是否存在及权限
        const [articles] = await pool.query(
            'SELECT author_id FROM articles WHERE id = ?',
            [id]
        );

        if (articles.length === 0) {
            return ResponseHelper.error(res, '文章不存在', 404);
        }

        // 非管理员只能删除自己的文章
        if (req.user.role !== 'admin' && articles[0].author_id !== req.user.id) {
            return ResponseHelper.error(res, '无权删除此文章', 403);
        }

        // 软删除（将状态改为deleted）
        await pool.query(
            "UPDATE articles SET status = 'deleted' WHERE id = ?",
            [id]
        );

        ResponseHelper.success(res, null, '文章删除成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 彻底删除文章（管理员）
router.delete('/:id/force', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query('DELETE FROM articles WHERE id = ?', [id]);

        ResponseHelper.success(res, null, '文章已彻底删除');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 获取文章列表（后台管理）
router.get('/list', authMiddleware, async (req, res) => {
    try {
        const { page = 1, pageSize = 10, keyword, category_id, status, tag } = req.query;
        const offset = (page - 1) * pageSize;

        let sql = `
            SELECT a.id, a.title, a.summary, a.cover_image, a.view_count, a.like_count, 
                   a.status, a.is_top, a.created_at, a.published_at,
                   c.id as category_id, c.name as category_name,
                   u.id as author_id, u.nickname as author_name
            FROM articles a
            LEFT JOIN categories c ON a.category_id = c.id
            LEFT JOIN users u ON a.author_id = u.id
            WHERE a.status != 'deleted'
        `;
        let countSql = `
            SELECT COUNT(DISTINCT a.id) as total 
            FROM articles a
            LEFT JOIN article_tags at ON a.id = at.article_id
            LEFT JOIN tags t ON at.tag_id = t.id
            WHERE a.status != 'deleted'
        `;
        const params = [];
        const countParams = [];

        // 非管理员只能看到自己的文章
        if (req.user.role !== 'admin') {
            sql += ' AND a.author_id = ?';
            countSql += ' AND a.author_id = ?';
            params.push(req.user.id);
            countParams.push(req.user.id);
        }

        if (keyword) {
            sql += ' AND (a.title LIKE ? OR a.content LIKE ?)';
            countSql += ' AND (a.title LIKE ? OR a.content LIKE ?)';
            const likeKeyword = `%${keyword}%`;
            params.push(likeKeyword, likeKeyword);
            countParams.push(likeKeyword, likeKeyword);
        }

        if (category_id) {
            sql += ' AND a.category_id = ?';
            countSql += ' AND a.category_id = ?';
            params.push(category_id);
            countParams.push(category_id);
        }

        if (status) {
            sql += ' AND a.status = ?';
            countSql += ' AND a.status = ?';
            params.push(status);
            countParams.push(status);
        }

        if (tag) {
            sql = `
                SELECT DISTINCT a.id, a.title, a.summary, a.cover_image, a.view_count, a.like_count, 
                       a.status, a.is_top, a.created_at, a.published_at,
                       c.id as category_id, c.name as category_name,
                       u.id as author_id, u.nickname as author_name
                FROM articles a
                LEFT JOIN categories c ON a.category_id = c.id
                LEFT JOIN users u ON a.author_id = u.id
                LEFT JOIN article_tags at ON a.id = at.article_id
                LEFT JOIN tags t ON at.tag_id = t.id
                WHERE a.status != 'deleted' AND t.name = ?
            `;
            params.unshift(tag);
            countSql += ' AND t.name = ?';
            countParams.push(tag);
        }

        sql += ' ORDER BY a.is_top DESC, a.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(pageSize), parseInt(offset));

        const [articles] = await pool.query(sql, params);
        const [countResult] = await pool.query(countSql, countParams);

        // 获取每篇文章的标签
        for (let article of articles) {
            const [tags] = await pool.query(
                `SELECT t.id, t.name FROM tags t
                 INNER JOIN article_tags at ON t.id = at.tag_id
                 WHERE at.article_id = ?`,
                [article.id]
            );
            article.tags = tags;
        }

        ResponseHelper.paginate(res, articles, countResult[0].total, page, pageSize);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 获取文章详情（后台管理）
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const [articles] = await pool.query(
            `SELECT a.*, c.name as category_name, u.nickname as author_name
             FROM articles a
             LEFT JOIN categories c ON a.category_id = c.id
             LEFT JOIN users u ON a.author_id = u.id
             WHERE a.id = ?`,
            [id]
        );

        if (articles.length === 0) {
            return ResponseHelper.error(res, '文章不存在', 404);
        }

        const article = articles[0];

        // 非管理员只能查看自己的文章或已发布的文章
        if (req.user.role !== 'admin' && article.author_id !== req.user.id && article.status !== 'published') {
            return ResponseHelper.error(res, '无权查看此文章', 403);
        }

        // 获取文章标签
        const [tags] = await pool.query(
            `SELECT t.id, t.name FROM tags t
             INNER JOIN article_tags at ON t.id = at.tag_id
             WHERE at.article_id = ?`,
            [id]
        );
        article.tags = tags;

        ResponseHelper.success(res, article);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 发布/取消发布文章
router.put('/:id/publish', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { publish } = req.body; // true: 发布, false: 取消发布

        // 检查文章权限
        const [articles] = await pool.query(
            'SELECT author_id FROM articles WHERE id = ?',
            [id]
        );

        if (articles.length === 0) {
            return ResponseHelper.error(res, '文章不存在', 404);
        }

        if (req.user.role !== 'admin' && articles[0].author_id !== req.user.id) {
            return ResponseHelper.error(res, '无权操作此文章', 403);
        }

        if (publish) {
            await pool.query(
                "UPDATE articles SET status = 'published', published_at = NOW() WHERE id = ?",
                [id]
            );
        } else {
            await pool.query(
                "UPDATE articles SET status = 'draft' WHERE id = ?",
                [id]
            );
        }

        ResponseHelper.success(res, null, publish ? '发布成功' : '已取消发布');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 设置/取消置顶
router.put('/:id/top', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { is_top } = req.body;

        await pool.query(
            'UPDATE articles SET is_top = ? WHERE id = ?',
            [is_top ? 1 : 0, id]
        );

        ResponseHelper.success(res, null, is_top ? '已置顶' : '已取消置顶');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

module.exports = router;
