const db = require('../databases/userDB');
const fileDB = require('../databases/fileDB');
const auditDB = require('../databases/auditDB');
const { protect, authorize } = require('../middleware/auth');

/**
 * @desc    获取当前用户资料
 * @route   GET /api/v1/users/me
 * @access  私有
 */
exports.getUserProfile = async (req, res) => {
    try {
        const user = await db.getUserById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: '用户不存在' });
        }

        // 移除敏感信息
        delete user.password;

        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                realName: user.real_name,
                phone: user.phone,
                userType: user.user_type,
                avatar: user.avatar,
                uploadCount: user.upload_count,
                bannedFiles: user.banned_files,
                status: user.status,
                registerTime: user.register_time,
                lastLoginTime: user.last_login_time
            }
        });
    } catch (error) {
        console.error('获取用户资料错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    更新当前用户资料
 * @route   PUT /api/v1/users/me
 * @access  私有
 */
exports.updateUserProfile = async (req, res) => {
    try {
        const { username, email, realName, phone, avatar } = req.body;
        const userId = req.user.id;

        // 检查邮箱是否已被使用（排除当前用户）
        if (email) {
            const existingUser = await db.getUserByEmail(email);
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({ success: false, message: '邮箱已被其他用户使用' });
            }
        }

        // 更新用户资料
        const updatedUser = await db.updateUser(userId, {
            username,
            email,
            real_name: realName,
            phone,
            avatar,
            updated_at: new Date()
        });

        res.status(200).json({
            success: true,
            message: '用户资料更新成功',
            data: updatedUser
        });
    } catch (error) {
        console.error('更新用户资料错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    获取所有用户 (志愿者/管理员)
 * @route   GET /api/v1/users
 * @access  私有/志愿者/管理员
 */
exports.getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, userType } = req.query;
        const offset = (page - 1) * limit;

        const users = await db.getAllUsers({ status, userType, offset, limit });
        const totalCount = await db.getUserCount({ status, userType });

        res.status(200).json({
            success: true,
            count: users.length,
            total: totalCount,
            pages: Math.ceil(totalCount / limit),
            data: users.map(user => ({
                id: user.id,
                username: user.username,
                email: user.email,
                realName: user.real_name,
                phone: user.phone,
                userType: user.user_type,
                avatar: user.avatar,
                uploadCount: user.upload_count,
                bannedFiles: user.banned_files,
                status: user.status,
                registerTime: user.register_time
            }))
        });
    } catch (error) {
        console.error('获取所有用户错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    获取单个用户详情 (志愿者/管理员)
 * @route   GET /api/v1/users/:id
 * @access  私有/志愿者/管理员
 */
exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await db.getUserById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: '用户不存在' });
        }

        // 获取用户上传文件统计
        const [uploadCount, bannedFiles] = await Promise.all([
            fileDB.getFileCountByUserId(userId),
            fileDB.getBannedFileCountByUserId(userId)
        ]);

        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                realName: user.real_name,
                phone: user.phone,
                userType: user.user_type,
                avatar: user.avatar,
                uploadCount,
                bannedFiles,
                status: user.status,
                registerTime: user.register_time,
                lastLoginTime: user.last_login_time
            }
        });
    } catch (error) {
        console.error('获取用户详情错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    更新用户状态 (志愿者/管理员)
 * @route   PUT /api/v1/users/:id/status
 * @access  私有/志愿者/管理员
 */
exports.updateUserStatus = async (req, res) => {
    try {
        const userId = req.params.id;
        const { status } = req.body;
        const operatorId = req.user.id;

        // 验证用户存在
        const user = await db.getUserById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: '用户不存在' });
        }

        // 防止操作权限更高的用户
        if (user.user_type >= req.user.user_type) {
            return res.status(403).json({ success: false, message: '无权操作该用户' });
        }

        // 更新用户状态
        await db.updateUser(userId, { status, updated_at: new Date() });

        // 记录操作日志
        await auditDB.logUserOperation(operatorId, userId, 3, user.status, status, '更新用户状态');

        res.status(200).json({
            success: true,
            message: '用户状态更新成功',
            data: { userId, status }
        });
    } catch (error) {
        console.error('更新用户状态错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    获取用户上传状态 (志愿者)
 * @route   GET /api/v1/users/:id/upload-status
 * @access  私有/志愿者
 */
exports.getUploadStatus = async (req, res) => {
    try {
        const userId = req.params.id;

        // 验证用户存在
        const user = await db.getUserById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: '用户不存在' });
        }

        // 获取用户上传统计
        const [uploadCount, pendingCount, approvedCount, rejectedCount, bannedCount] = await Promise.all([
            fileDB.getFileCountByUserId(userId),
            fileDB.getFileCountByUserIdAndStatus(userId, 0),
            fileDB.getFileCountByUserIdAndStatus(userId, 1),
            fileDB.getFileCountByUserIdAndStatus(userId, 2),
            fileDB.getFileCountByUserIdAndStatus(userId, 4)
        ]);

        res.status(200).json({
            success: true,
            data: {
                userId,
                username: user.username,
                uploadStatus: user.status,
                uploadCount,
                pendingCount,
                approvedCount,
                rejectedCount,
                bannedCount
            }
        });
    } catch (error) {
        console.error('获取用户上传状态错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    封禁用户上传权限 (志愿者)
 * @route   PUT /api/v1/users/:id/ban-upload
 * @access  私有/志愿者
 */
exports.banUpload = async (req, res) => {
    try {
        const userId = req.params.id;
        const { remark } = req.body;
        const operatorId = req.user.id;

        // 验证用户存在
        const user = await db.getUserById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: '用户不存在' });
        }

        // 防止操作权限更高的用户
        if (user.user_type >= req.user.user_type) {
            return res.status(403).json({ success: false, message: '无权操作该用户' });
        }

        // 检查是否已被封禁
        if (user.status === 0) {
            return res.status(400).json({ success: false, message: '用户已被封禁' });
        }

        // 封禁用户上传权限
        await db.updateUser(userId, { status: 0, updated_at: new Date() });

        // 记录操作日志
        await auditDB.logUserOperation(operatorId, userId, 1, user.status, 0, remark || '封禁上传权限');

        res.status(200).json({
            success: true,
            message: '用户上传权限已封禁',
            data: { userId, status: 0 }
        });
    } catch (error) {
        console.error('封禁用户上传权限错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    解封用户上传权限 (志愿者)
 * @route   PUT /api/v1/users/:id/unban-upload
 * @access  私有/志愿者
 */
exports.unbanUpload = async (req, res) => {
    try {
        const userId = req.params.id;
        const { remark } = req.body;
        const operatorId = req.user.id;

        // 验证用户存在
        const user = await db.getUserById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: '用户不存在' });
        }

        // 防止操作权限更高的用户
        if (user.user_type >= req.user.user_type) {
            return res.status(403).json({ success: false, message: '无权操作该用户' });
        }

        // 检查是否已被解封
        if (user.status === 1) {
            return res.status(400).json({ success: false, message: '用户上传权限已解封' });
        }

        // 解封用户上传权限
        await db.updateUser(userId, { status: 1, updated_at: new Date() });

        // 记录操作日志
        await auditDB.logUserOperation(operatorId, userId, 2, user.status, 1, remark || '解封上传权限');

        res.status(200).json({
            success: true,
            message: '用户上传权限已解封',
            data: { userId, status: 1 }
        });
    } catch (error) {
        console.error('解封用户上传权限错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    更新用户类型 (管理员)
 * @route   PUT /api/v1/users/:id/type
 * @access  私有/管理员
 */
exports.updateUserType = async (req, res) => {
    try {
        const userId = req.params.id;
        const { userType } = req.body;
        const operatorId = req.user.id;

        // 验证用户存在
        const user = await db.getUserById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: '用户不存在' });
        }

        // 防止操作同级别用户
        if (user.user_type >= req.user.user_type) {
            return res.status(403).json({ success: false, message: '无权操作该用户' });
        }

        // 验证用户类型
        const validUserTypes = [1, 2, 3];
        if (!validUserTypes.includes(userType)) {
            return res.status(400).json({ success: false, message: '无效的用户类型' });
        }

        // 更新用户类型
        await db.updateUser(userId, { user_type: userType, updated_at: new Date() });

        // 记录操作日志
        await auditDB.logUserOperation(operatorId, userId, 4, user.user_type, userType, '更新用户类型');

        res.status(200).json({
            success: true,
            message: '用户类型更新成功',
            data: { userId, userType }
        });
    } catch (error) {
        console.error('更新用户类型错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    删除用户 (管理员)
 * @route   DELETE /api/v1/users/:id
 * @access  私有/管理员
 */
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const operatorId = req.user.id;

        // 验证用户存在
        const user = await db.getUserById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: '用户不存在' });
        }

        // 防止删除同级别或更高级别用户
        if (user.user_type >= req.user.user_type) {
            return res.status(403).json({ success: false, message: '无权删除该用户' });
        }

        // 开始事务
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 删除用户文件
            await fileDB.deleteFilesByUserId(userId, connection);

            // 删除用户
            await db.deleteUser(userId, connection);

            // 记录操作日志
            await auditDB.logUserOperation(operatorId, userId, 5, user.status, null, '删除用户', connection);

            await connection.commit();

            res.status(200).json({
                success: true,
                message: '用户已删除',
                data: { userId }
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('删除用户错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};