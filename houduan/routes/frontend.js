const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { authMiddleware, optionalAuthMiddleware, adminMiddleware } = require('../middleware/auth');
const ResponseHelper = require('../utils/response');

// 获取首页文章列表（已发布）
router.get('/articles', async (req, res) => {
    try {
        const { page = 1, pageSize = 10, category_id, tag, keyword, order } = req.query;
        const offset = (page - 1) * pageSize;

        const params = [];
        const countParams = [];

        let sql;
        let countSql;

        if (tag) {
            sql = `
                SELECT DISTINCT a.id, a.title, a.summary, a.cover_image, a.view_count, a.like_count, 
                       a.is_top, a.created_at, a.published_at,
                       c.id as category_id, c.name as category_name,
                       u.id as author_id, u.nickname as author_name, u.avatar as author_avatar
                FROM articles a
                LEFT JOIN categories c ON a.category_id = c.id
                LEFT JOIN users u ON a.author_id = u.id
                INNER JOIN article_tags at ON a.id = at.article_id
                INNER JOIN tags t ON at.tag_id = t.id
                WHERE a.status = 'published' AND t.name = ?
            `;
            countSql = `
                SELECT COUNT(DISTINCT a.id) as total 
                FROM articles a
                INNER JOIN article_tags at ON a.id = at.article_id
                INNER JOIN tags t ON at.tag_id = t.id
                WHERE a.status = 'published' AND t.name = ?
            `;
            params.push(tag);
            countParams.push(tag);
        } else {
            sql = `
                SELECT a.id, a.title, a.summary, a.cover_image, a.view_count, a.like_count, 
                       a.is_top, a.created_at, a.published_at,
                       c.id as category_id, c.name as category_name,
                       u.id as author_id, u.nickname as author_name, u.avatar as author_avatar
                FROM articles a
                LEFT JOIN categories c ON a.category_id = c.id
                LEFT JOIN users u ON a.author_id = u.id
                WHERE a.status = 'published'
            `;
            countSql = `SELECT COUNT(DISTINCT a.id) as total FROM articles a WHERE a.status = 'published'`;
        }

        if (category_id) {
            sql += ' AND a.category_id = ?';
            countSql += ' AND a.category_id = ?';
            params.push(category_id);
            countParams.push(category_id);
        }

        if (keyword) {
            const likeKeyword = `%${keyword}%`;
            sql += ' AND (a.title LIKE ? OR a.summary LIKE ? OR a.content LIKE ?)';
            countSql += ' AND (a.title LIKE ? OR a.summary LIKE ? OR a.content LIKE ?)';
            params.push(likeKeyword, likeKeyword, likeKeyword);
            countParams.push(likeKeyword, likeKeyword, likeKeyword);
        }

        const orderDir = order === 'asc' ? 'ASC' : 'DESC';
        const orderBy = order ? `a.published_at ${orderDir}` : 'a.is_top DESC, a.published_at DESC';
        sql += ` ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
        params.push(parseInt(pageSize), parseInt(offset));

        const [articles] = await pool.query(sql, params);
        const [countResult] = await pool.query(countSql, countParams);

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

// 取消点赞
router.delete('/articles/:id/like', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const [existingLikes] = await pool.query(
            'SELECT id FROM article_likes WHERE article_id = ? AND user_id = ?',
            [id, userId]
        );

        if (existingLikes.length === 0) {
            return ResponseHelper.success(res, null, '已取消点赞');
        }

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            await connection.query(
                'DELETE FROM article_likes WHERE article_id = ? AND user_id = ?',
                [id, userId]
            );

            await connection.query(
                'UPDATE articles SET like_count = GREATEST(like_count - 1, 0) WHERE id = ? AND status = ?',
                [id, 'published']
            );

            await connection.commit();
            ResponseHelper.success(res, null, '已取消点赞');
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

// 获取文章详情（前台）
router.get('/articles/:id', optionalAuthMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const [articles] = await pool.query(
            `SELECT a.*, c.name as category_name, 
                    u.nickname as author_name, u.avatar as author_avatar, u.id as author_id
             FROM articles a
             LEFT JOIN categories c ON a.category_id = c.id
             LEFT JOIN users u ON a.author_id = u.id
             WHERE a.id = ? AND a.status = 'published'`,
            [id]
        );

        if (articles.length === 0) {
            return ResponseHelper.error(res, '文章不存在', 404);
        }

        const article = articles[0];

        // 增加浏览量
        await pool.query(
            'UPDATE articles SET view_count = view_count + 1 WHERE id = ?',
            [id]
        );
        article.view_count += 1;

        // 获取文章标签
        const [tags] = await pool.query(
            `SELECT t.id, t.name FROM tags t
             INNER JOIN article_tags at ON t.id = at.tag_id
             WHERE at.article_id = ?`,
            [id]
        );
        article.tags = tags;

        // 获取上一篇和下一篇文章
        const [prevArticle] = await pool.query(
            `SELECT id, title FROM articles 
             WHERE status = 'published' AND published_at < ? 
             ORDER BY published_at DESC LIMIT 1`,
            [article.published_at]
        );

        const [nextArticle] = await pool.query(
            `SELECT id, title FROM articles 
             WHERE status = 'published' AND published_at > ? 
             ORDER BY published_at ASC LIMIT 1`,
            [article.published_at]
        );

        article.prev_article = prevArticle[0] || null;
        article.next_article = nextArticle[0] || null;

        // 获取相关文章（同分类或同标签）
        const [relatedArticles] = await pool.query(
            `SELECT DISTINCT a.id, a.title, a.cover_image, a.published_at
             FROM articles a
             LEFT JOIN article_tags at ON a.id = at.article_id
             WHERE a.status = 'published' AND a.id != ?
             AND (a.category_id = ? OR at.tag_id IN (
                 SELECT tag_id FROM article_tags WHERE article_id = ?
             ))
             ORDER BY a.published_at DESC LIMIT 5`,
            [id, article.category_id, id]
        );
        article.related_articles = relatedArticles;

        if (req.user?.id) {
            const [likedRows] = await pool.query(
                'SELECT id FROM article_likes WHERE article_id = ? AND user_id = ? LIMIT 1',
                [id, req.user.id]
            );
            article.is_liked = likedRows.length > 0;
        } else {
            article.is_liked = false;
        }

        ResponseHelper.success(res, article);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 文章点赞
router.post('/articles/:id/like', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { action } = req.body || {};

        // 检查是否已经点过赞
        const [existingLikes] = await pool.query(
            'SELECT id FROM article_likes WHERE article_id = ? AND user_id = ?',
            [id, userId]
        );

        if (action === 'unlike') {
            if (existingLikes.length === 0) {
                return ResponseHelper.success(res, null, '已取消点赞');
            }
            const connection = await pool.getConnection();
            try {
                await connection.beginTransaction();
                await connection.query(
                    'DELETE FROM article_likes WHERE article_id = ? AND user_id = ?',
                    [id, userId]
                );
                await connection.query(
                    'UPDATE articles SET like_count = GREATEST(like_count - 1, 0) WHERE id = ? AND status = ?',
                    [id, 'published']
                );
                await connection.commit();
                return ResponseHelper.success(res, null, '已取消点赞');
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        }

        if (existingLikes.length > 0) {
            return ResponseHelper.success(res, null, '已点赞');
        }

        // 开启事务
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 插入点赞记录
            await connection.query(
                'INSERT INTO article_likes (article_id, user_id) VALUES (?, ?)',
                [id, userId]
            );

            // 更新文章点赞数
            await connection.query(
                'UPDATE articles SET like_count = like_count + 1 WHERE id = ? AND status = ?',
                [id, 'published']
            );

            await connection.commit();
            ResponseHelper.success(res, null, '点赞成功');
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

// 搜索文章
router.get('/search', async (req, res) => {
    try {
        const { keyword, page = 1, pageSize = 10 } = req.query;

        if (!keyword) {
            return ResponseHelper.error(res, '请输入搜索关键词');
        }

        const offset = (page - 1) * pageSize;
        const likeKeyword = `%${keyword}%`;

        const sql = `
            SELECT a.id, a.title, a.summary, a.cover_image, a.view_count, 
                   a.published_at, c.name as category_name,
                   u.nickname as author_name
            FROM articles a
            LEFT JOIN categories c ON a.category_id = c.id
            LEFT JOIN users u ON a.author_id = u.id
            WHERE a.status = 'published' 
            AND (a.title LIKE ? OR a.content LIKE ?)
            ORDER BY a.published_at DESC
            LIMIT ? OFFSET ?
        `;

        const countSql = `
            SELECT COUNT(*) as total FROM articles a
            WHERE a.status = 'published' 
            AND (a.title LIKE ? OR a.content LIKE ?)
        `;

        const [articles] = await pool.query(sql, [likeKeyword, likeKeyword, parseInt(pageSize), parseInt(offset)]);
        const [countResult] = await pool.query(countSql, [likeKeyword, likeKeyword]);

        ResponseHelper.paginate(res, articles, countResult[0].total, page, pageSize);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 获取归档列表（按月份分组）
router.get('/archives', async (req, res) => {
    try {
        const [archives] = await pool.query(`
            SELECT 
                DATE_FORMAT(published_at, '%Y-%m') as month,
                COUNT(*) as count
            FROM articles
            WHERE status = 'published'
            GROUP BY DATE_FORMAT(published_at, '%Y-%m')
            ORDER BY month DESC
        `);

        ResponseHelper.success(res, archives);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 获取归档文章列表
router.get('/archives/:month', async (req, res) => {
    try {
        const { month } = req.params;

        const [articles] = await pool.query(`
            SELECT id, title, published_at
            FROM articles
            WHERE status = 'published' 
            AND DATE_FORMAT(published_at, '%Y-%m') = ?
            ORDER BY published_at DESC
        `, [month]);

        ResponseHelper.success(res, articles);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 获取网站配置（个人简介、联系方式等）
router.get('/site-info', async (req, res) => {
    try {
        const [configs] = await pool.query('SELECT config_key, config_value FROM site_config');

        // 转换为对象格式
        const siteInfo = {};
        configs.forEach(config => {
            siteInfo[config.config_key] = config.config_value;
        });

        ResponseHelper.success(res, siteInfo);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 更新网站配置（管理员）
router.put('/site-info', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const configs = req.body;

        for (const [key, value] of Object.entries(configs)) {
            // 使用 INSERT ON DUPLICATE KEY UPDATE 语法，确保不存在的配置项会被创建
            await pool.query(
                'INSERT INTO site_config (config_key, config_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_value = ?',
                [key, value, value]
            );
        }

        ResponseHelper.success(res, null, '配置更新成功');
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 获取统计数据
router.get('/statistics', async (req, res) => {
    try {
        // 文章总数
        const [articleCount] = await pool.query(
            "SELECT COUNT(*) as count FROM articles WHERE status = 'published'"
        );

        // 分类总数
        const [categoryCount] = await pool.query(
            'SELECT COUNT(*) as count FROM categories'
        );

        // 标签总数
        const [tagCount] = await pool.query(
            'SELECT COUNT(*) as count FROM tags'
        );

        // 总浏览量
        const [viewCount] = await pool.query(
            "SELECT SUM(view_count) as count FROM articles WHERE status = 'published'"
        );

        ResponseHelper.success(res, {
            articles: articleCount[0].count,
            categories: categoryCount[0].count,
            tags: tagCount[0].count,
            views: viewCount[0].count || 0
        });
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 获取热门文章
router.get('/hot-articles', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const [articles] = await pool.query(`
            SELECT id, title, view_count, like_count, published_at
            FROM articles
            WHERE status = 'published'
            ORDER BY view_count DESC, like_count DESC
            LIMIT ?
        `, [parseInt(limit)]);

        ResponseHelper.success(res, articles);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 获取最新文章
router.get('/latest-articles', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const [articles] = await pool.query(`
            SELECT id, title, summary, cover_image, published_at
            FROM articles
            WHERE status = 'published'
            ORDER BY published_at DESC
            LIMIT ?
        `, [parseInt(limit)]);

        ResponseHelper.success(res, articles);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

// 获取友情链接列表（前台）
router.get('/friend-links', async (req, res) => {
    try {
        const [links] = await pool.query(
            'SELECT id, name, url, logo, description FROM friend_links WHERE status = 1 ORDER BY sort_order DESC, created_at DESC'
        );
        ResponseHelper.success(res, links);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

router.post('/friend-links/apply', async (req, res) => {
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

// 获取公告列表（前台）
router.get('/announcements', async (req, res) => {
    try {
        const [announcements] = await pool.query(
            `
            SELECT id, title, content, type, link, link_text
            FROM announcements
            WHERE status = 1
              AND (start_time IS NULL OR start_time <= NOW())
              AND (end_time IS NULL OR end_time >= NOW())
            ORDER BY sort_order DESC, created_at DESC
            `
        );
        ResponseHelper.success(res, announcements);
    } catch (error) {
        ResponseHelper.serverError(res, error);
    }
});

module.exports = router;
