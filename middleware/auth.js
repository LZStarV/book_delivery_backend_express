const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config/constants');

/**
 * 保护路由 - 需要登录
 */
exports.protect = async (req, res, next) => {
    let token;

    // 从请求头或Cookie中获取token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    // 验证token是否存在
    if (!token) {
        return res.status(401).json({ success: false, message: '未授权，需要登录' });
    }

    try {
        // 验证token
        const decoded = jwt.verify(token, config.jwt.secret);

        // 获取用户信息
        const user = await User.getById(decoded.id);

        if (!user) {
            return res.status(401).json({ success: false, message: '未授权，用户不存在' });
        }

        // 将用户信息添加到请求对象
        req.user = user;

        next();
    } catch (error) {
        console.error('身份验证错误:', error);
        return res.status(401).json({ success: false, message: '未授权，无效的token' });
    }
};

/**
 * 授权角色 - 限制访问权限
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.userType)) {
            return res.status(403).json({
                success: false,
                message: `权限不足，需要 ${roles.join(' 或 ')} 角色`
            });
        }

        next();
    };
};

/**
 * 检查用户是否已登录
 */
exports.isLoggedIn = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        const user = await User.getById(decoded.id);

        if (!user) {
            req.user = null;
            return next();
        }

        req.user = user;
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};