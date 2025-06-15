const logger = require('../config/log4js.config');

// 请求日志中间件
exports.requestLogger = (req, res, next) => {
    logger.info(`Request: ${req.method} ${req.url}`);
    next();
};