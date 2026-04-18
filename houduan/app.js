const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection, ensureSchema } = require('./config/database');
const ResponseHelper = require('./utils/response');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const userRouter = require('./routes/user');
const { wechatAuthorizeHandler, wechatCallbackHandler } = userRouter;
const articleRouter = require('./routes/article');
const categoryRouter = require('./routes/category');
const tagRouter = require('./routes/tag');
const commentRouter = require('./routes/comment');
const friendlinkRouter = require('./routes/friendlink');
const announcementRouter = require('./routes/announcement');
const subscriptionRouter = require('./routes/subscription');
const messageRouter = require('./routes/message');
const frontendRouter = require('./routes/frontend');
const uploadRouter = require('./routes/upload');

app.get('/api/user/wechat/authorize', wechatAuthorizeHandler);
app.get('/api/user/wechat/callback', wechatCallbackHandler);
app.use('/api/user', userRouter);
app.use('/api/article', articleRouter);
app.use('/api/category', categoryRouter);
app.use('/api/tag', tagRouter);
app.use('/api/comment', commentRouter);
app.use('/api/friendlink', friendlinkRouter);
app.use('/api/announcement', announcementRouter);
app.use('/api/subscription', subscriptionRouter);
app.use('/api/message', messageRouter);
app.use('/api/front', frontendRouter);
app.use('/api/upload', uploadRouter);

// 404 handler
app.use((req, res) => {
    ResponseHelper.error(res, '接口不存在', 404);
});

// Error handler
app.use((err, req, res, next) => {
    if (err?.type === 'entity.parse.failed' || (err instanceof SyntaxError && err.status === 400 && 'body' in err)) {
        return ResponseHelper.error(res, '请求体JSON格式错误', 400);
    }

    console.error(err.stack);
    ResponseHelper.serverError(res, err);
});

const PORT = process.env.PORT || 3000;

testConnection().then(async success => {
    if (success) {
        try {
            await ensureSchema();
        } catch (error) {
            console.error('数据库初始化失败:', error.message);
            process.exit(1);
        }
        app.listen(PORT, () => {
            console.log(`欢迎使用李嘉骏博客系统，如有报错，可联系邮箱：lijiajun130726@163.com.服务器运行在端口: ${PORT}`);
        });
    } else {
        console.error('数据库连接失败，服务器启动终止');
        process.exit(1);
    }
});
