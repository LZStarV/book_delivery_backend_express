const config = require('../config/constants');

/**
 * 全局错误处理中间件
 */
exports.errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // 打印错误堆栈（开发环境）
    if (config.env === 'development') {
        console.error('Error:', err);
    }

    // MySQL 错误处理
    if (typeof err.code === 'string' && err.code.startsWith('ER_')) {
        switch (err.code) {
            // 唯一约束错误
            case 'ER_DUP_ENTRY':
                const field = Object.keys(err.sqlMessage.match(/key '(\w+)'/)[1]);
                error = { code: 400, message: `${field} 已存在` };
                break;
            // 外键约束错误
            case 'ER_NO_REFERENCED_ROW_2':
                error = { code: 400, message: '外键引用的记录不存在' };
                break;
            // 无效的 SQL 语法错误
            case 'ER_PARSE_ERROR':
                error = { code: 400, message: '无效的 SQL 语法' };
                break;
            default:
                error = { code: 500, message: '数据库操作错误' };
        }
    }

    // JWT 验证错误
    if (err.name === 'JsonWebTokenError') {
        error = { code: 401, message: '无效的 token' };
    }

    // JWT 过期错误
    if (err.name === 'TokenExpiredError') {
        error = { code: 401, message: 'token 已过期' };
    }

    // 默认错误响应
    res.status(error.code || 500).json({
        success: false,
        message: error.message || '服务器内部错误'
    });
};

/**
 * 404 错误处理
 */
exports.notFound = (req, res, next) => {
    const error = new Error(`未找到路由: ${req.originalUrl}`);
    error.code = 404;
    next(error);
};