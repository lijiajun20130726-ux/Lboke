const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');

// 导入路由模块
const userRoutes = require('./routes/user');
const articleRoutes = require('./routes/article');
const categoryRoutes = require('./routes/category');
const tagRoutes = require('./routes/tag');
const uploadRoutes = require('./routes/upload');
const commentRoutes = require('./routes/comment');
const frontendRoutes = require('./routes/frontend');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务（用于上传的文件）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API 路由
// 后台管理接口
app.use('/api/user', userRoutes);           // 用户管理
app.use('/api/article', articleRoutes);     // 文章管理
app.use('/api/category', categoryRoutes);   // 分类管理
app.use('/api/tag', tagRoutes);             // 标签管理
app.use('/api/upload', uploadRoutes);        // 文件上传
app.use('/api/comment', commentRoutes);      // 评论管理

// 前台展示接口
app.use('/api/front', frontendRoutes);      // 前台数据接口

// 健康检查接口
app.get('/api/health', (req, res) => {
    res.json({ code: 200, message: 'OK', data: { status: 'healthy' } });
});

// API 文档信息
app.get('/api', (req, res) => {
    res.json({
        code: 200,
        message: '博客系统 API',
        data: {
            version: '1.0.0',
            endpoints: {
                user: {
                    'POST /api/user/register': '用户注册',
                    'POST /api/user/login': '用户登录',
                    'GET /api/user/profile': '获取当前用户信息',
                    'PUT /api/user/profile': '更新用户信息',
                    'PUT /api/user/password': '修改密码',
                    'GET /api/user/list': '获取用户列表（管理员）',
                    'PUT /api/user/:id/status': '更新用户状态（管理员）',
                    'DELETE /api/user/:id': '删除用户（管理员）'
                },
                article: {
                    'POST /api/article': '创建文章',
                    'PUT /api/article/:id': '更新文章',
                    'DELETE /api/article/:id': '删除文章（软删除）',
                    'DELETE /api/article/:id/force': '彻底删除文章（管理员）',
                    'GET /api/article/list': '获取文章列表',
                    'GET /api/article/:id': '获取文章详情',
                    'PUT /api/article/:id/publish': '发布/取消发布文章',
                    'PUT /api/article/:id/top': '置顶/取消置顶文章（管理员）'
                },
                category: {
                    'POST /api/category': '创建分类（管理员）',
                    'PUT /api/category/:id': '更新分类（管理员）',
                    'DELETE /api/category/:id': '删除分类（管理员）',
                    'GET /api/category': '获取分类列表',
                    'GET /api/category/:id': '获取分类详情'
                },
                tag: {
                    'POST /api/tag': '创建标签（管理员）',
                    'PUT /api/tag/:id': '更新标签（管理员）',
                    'DELETE /api/tag/:id': '删除标签（管理员）',
                    'GET /api/tag': '获取标签列表',
                    'GET /api/tag/:id': '获取标签详情',
                    'POST /api/tag/batch': '批量创建标签（管理员）'
                },
                frontend: {
                    'GET /api/front/articles': '获取首页文章列表',
                    'GET /api/front/articles/:id': '获取文章详情',
                    'POST /api/front/articles/:id/like': '文章点赞',
                    'GET /api/front/search': '搜索文章',
                    'GET /api/front/archives': '获取归档列表',
                    'GET /api/front/archives/:month': '获取归档文章',
                    'GET /api/front/site-info': '获取网站配置',
                    'PUT /api/front/site-info': '更新网站配置（管理员）',
                    'GET /api/front/statistics': '获取统计数据',
                    'GET /api/front/hot-articles': '获取热门文章',
                    'GET /api/front/latest-articles': '获取最新文章'
                }
            }
        }
    });
});

// 404 处理
app.use((req, res) => {
    res.status(404).json({ code: 404, message: '接口不存在', data: null });
});

// 全局错误处理
app.use((err, req, res, next) => {
    console.error('全局错误:', err);
    res.status(500).json({ code: 500, message: '服务器内部错误', data: null });
});

// 启动服务器
async function startServer() {
    // 测试数据库连接
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
        console.error('数据库连接失败，请检查配置');
        console.log('请先执行 database/init.sql 初始化数据库');
        process.exit(1);
    }

    const server = app.listen(PORT, () => {
        console.log(`\n========================================`);
        console.log(`李嘉骏博客系统后端服务已启动`);
        console.log(`服务地址: http://localhost:${PORT}`);
        console.log(`API文档: http://localhost:${PORT}/api`);
        console.log(`========================================\n`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`端口 ${PORT} 已被占用，请尝试更改 .env 中的 PORT 配置`);
        } else {
            console.error('服务器启动错误:', err);
        }
        process.exit(1);
    });
}

startServer();
