// 统一响应格式
class ResponseHelper {
    // 成功响应
    static success(res, data = null, message = '操作成功') {
        return res.json({
            code: 200,
            message,
            data
        });
    }

    // 创建成功响应
    static created(res, data = null, message = '创建成功') {
        return res.status(201).json({
            code: 201,
            message,
            data
        });
    }

    // 错误响应
    static error(res, message = '操作失败', code = 400) {
        return res.status(code).json({
            code,
            message,
            data: null
        });
    }

    // 服务器错误
    static serverError(res, error) {
        console.error('服务器错误:', error);
        return res.status(500).json({
            code: 500,
            message: '服务器内部错误',
            data: null
        });
    }

    // 分页数据响应
    static paginate(res, list, total, page, pageSize, message = '获取成功') {
        return res.json({
            code: 200,
            message,
            data: {
                list,
                pagination: {
                    total,
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    totalPages: Math.ceil(total / pageSize)
                }
            }
        });
    }
}

module.exports = ResponseHelper;
