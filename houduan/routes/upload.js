const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/auth');

// 确保上传目录存在
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 配置存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // 生成文件名: 时间戳 + 随机数 + 原扩展名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('只允许上传图片文件 (jpg, jpeg, png, gif, webp)'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 限制 5MB
    },
    fileFilter: fileFilter
});

/**
 * @route   POST /api/upload/image
 * @desc    上传单张图片
 * @access  Private
 */
router.post('/image', authMiddleware, (req, res, next) => {
    console.log('收到图片上传请求');
    upload.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer错误:', err);
            return res.status(400).json({ code: 400, message: '文件上传失败: ' + err.message });
        } else if (err) {
            console.error('上传错误:', err);
            return res.status(400).json({ code: 400, message: err.message });
        }
        
        try {
            if (!req.file) {
                return res.status(400).json({ code: 400, message: '请选择要上传的图片' });
            }

            // 生成访问URL (返回相对路径，配合前端代理使用)
            const imageUrl = `/uploads/${req.file.filename}`;
            console.log('图片上传成功:', imageUrl);

            res.json({
                code: 200,
                message: '图片上传成功',
                data: {
                    url: imageUrl,
                    filename: req.file.filename
                }
            });
        } catch (err) {
            console.error('处理上传失败:', err);
            res.status(500).json({ code: 500, message: '服务器错误', data: null });
        }
    });
});

module.exports = router;
