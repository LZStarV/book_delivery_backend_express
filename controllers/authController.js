const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { generateToken } = require('../utils/jwtHandlers');
const { protect } = require('../middleware/auth');

/**
 * @desc    用户注册
 * @route   POST /api/v1/auth/register
 * @access  公开
 */
exports.register = async (req, res) => {
    try {
        const { username, email, password, realName, phone } = req.body;

        // 验证必填字段
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: '用户名、邮箱和密码是必填项'
            });
        }

        // 检查用户是否已存在
        const existingUser = await User.getByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: '该邮箱已被注册'
            });
        }

        // 检查用户名是否已存在
        const usernameExists = await User.getByUsername(username);
        if (usernameExists) {
            return res.status(400).json({
                success: false,
                message: '该用户名已被使用'
            });
        }

        // 创建用户
        const newUser = await User.create({
            username,
            email,
            password,
            real_name: realName,
            phone,
            user_type: 1, // 默认普通用户
            created_at: new Date()
        });

        // 生成 JWT Token
        const token = generateToken(newUser.id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                realName: newUser.realName,
                phone: newUser.phone,
                userType: newUser.userType
            }
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

/**
 * @desc    用户登录
 * @route   POST /api/v1/auth/login
 * @access  公开
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 验证必填字段
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: '邮箱和密码是必填项'
            });
        }

        // 获取用户信息
        const user = await User.getByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: '用户不存在或密码错误'
            });
        }

        // 检查用户是否被封禁
        if (user.isBanned()) {
            return res.status(403).json({
                success: false,
                message: '账号已被封禁，请联系管理员'
            });
        }

        // 验证密码
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: '密码错误'
            });
        }


        // 更新最后登录时间
        await user.update({ last_login_time: new Date() });

        // 生成 JWT Token
        const token = generateToken(user.id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                realName: user.realName,
                phone: user.phone,
                userType: user.userType,
                avatar: user.avatar,
                status: user.status
            }
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

/**
 * @desc    用户登出
 * @route   POST /api/v1/auth/logout
 * @access  私有
 */
exports.logout = (req, res) => {
    try {
        // 注意：JWT是无状态的，服务器端无需主动失效Token
        // 客户端只需清除本地存储的Token即可
        res.status(200).json({
            success: true,
            message: '登出成功'
        });
    } catch (error) {
        console.error('登出错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};

/**
 * @desc    获取当前用户信息
 * @route   GET /api/v1/auth/me
 * @access  私有
 */
exports.getMe = async (req, res) => {
    try {
        // req.user 已由auth中间件填充
        const user = await User.getById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        res.status(200).json({
            success: true,
            user: user.toSafeJSON()
        });
    } catch (error) {
        console.error('获取用户信息错误:', error);
        res.status(500).json({
            success: false,
            message: '服务器内部错误'
        });
    }
};