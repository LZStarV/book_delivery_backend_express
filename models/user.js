// models/user.js
const db = require('../databases/userDB');
const userDB = require('../databases/userDB');
const fileDB = require('../databases/fileDB');
const auditDB = require('../databases/auditDB');
const bcrypt = require('bcryptjs');

/**
 * 用户类型常量
 */
const USER_TYPE = {
    NORMAL: 1,       // 普通用户
    VOLUNTEER: 2,    // 志愿者
    ADMIN: 3         // 管理员
};

/**
 * 用户状态常量
 */
const USER_STATUS = {
    BANNED: 0,       // 已封禁
    NORMAL: 1        // 正常
};

class User {
    constructor(data) {
        this.id = data.id;
        this.username = data.username;
        this.email = data.email;
        this.password = data.password;
        this.realName = data.real_name;
        this.phone = data.phone;
        this.userType = data.user_type;
        this.avatar = data.avatar || 'default_avatar.png';
        this.uploadCount = data.upload_count || 0;
        this.bannedFiles = data.banned_files || 0;
        this.status = data.status || 1;
        this.registerTime = data.register_time || data.created_at;
        this.lastLoginTime = data.last_login_time;
        this.updatedAt = data.updated_at;
    }

    /**
     * 根据ID获取用户
     */
    static async getById(userId) {
        const userData = await db.getUserById(userId);
        if (!userData) return null;

        // 获取用户上传统计
        const [uploadCount, bannedFiles] = await Promise.all([
            fileDB.getFileCountByUserId(userId),
            fileDB.getFileCountByUserIdAndStatus(userId, 4)
        ]);

        return new User({ ...userData, upload_count: uploadCount, banned_files: bannedFiles });
    }

    /**
     * 根据邮箱获取用户
     */
    static async getByEmail(email) {
        const userData = await db.getUserByEmail(email);
        return userData ? new User(userData) : null;
    }

    /**
     * 根据用户名获取用户
     */
    static async getByUsername(username) {
        const userData = await db.getUserByUsername(username);
        return userData ? new User(userData) : null;
    }

    /**
     * 创建新用户
     */
    static async create(data) {
        // 加密密码
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        const userData = {
            ...data,
            password: hashedPassword,
            user_type: USER_TYPE.NORMAL,
            created_at: new Date(),
            updated_at: new Date()
        };

        const userId = await userDB.createUser(userData);
        return new User({ id: userId, ...userData });
    }

    /**
     * 验证密码
     */
    async verifyPassword(password) {
        return await bcrypt.compare(password, this.password);
    }

    /**
     * 更新用户信息
     */
    async update(data) {
        // 如果更新了密码，需要加密
        if (data.password) {
            const salt = await bcrypt.genSalt(10);
            data.password = await bcrypt.hash(data.password, salt);
        }

        const updatedData = {
            ...data,
            updated_at: new Date()
        };

        const updatedUser = await db.updateUser(this.id, updatedData);
        Object.assign(this, updatedUser);
        return this;
    }

    /**
     * 更新用户状态
     */
    async updateStatus(newStatus, operatorId, remark) {
        const oldStatus = this.status;

        // 更新用户状态
        await this.update({ status: newStatus });

        // 记录操作日志
        await auditDB.logUserOperation(
            operatorId,
            this.id,
            newStatus === USER_STATUS.BANNED ? 1 : 2,
            oldStatus,
            newStatus,
            remark
        );

        return this;
    }

    /**
     * 更新用户类型
     */
    async updateType(newType, operatorId, remark) {
        const oldType = this.userType;

        // 更新用户类型
        await this.update({ user_type: newType });

        // 记录操作日志
        await auditDB.logUserOperation(
            operatorId,
            this.id,
            4,
            oldType,
            newType,
            remark || `用户类型从 ${oldType} 更新为 ${newType}`
        );

        return this;
    }

    /**
     * 获取用户上传的文件
     */
    async getUploadedFiles(page = 1, limit = 10) {
        return await fileDB.getFilesByUserId(this.id, page, limit);
    }

    /**
     * 检查用户是否为管理员
     */
    isAdmin() {
        return this.userType === USER_TYPE.ADMIN;
    }

    /**
     * 检查用户是否为志愿者
     */
    isVolunteer() {
        return this.userType === USER_TYPE.VOLUNTEER || this.userType === USER_TYPE.ADMIN;
    }

    /**
     * 检查用户是否被封禁
     */
    isBanned() {
        return this.status === USER_STATUS.BANNED;
    }

    /**
     * 获取用户类型名称
     */
    getUserTypeName() {
        const typeNames = {
            [USER_TYPE.NORMAL]: '普通用户',
            [USER_TYPE.VOLUNTEER]: '志愿者',
            [USER_TYPE.ADMIN]: '管理员'
        };
        return typeNames[this.userType] || '未知类型';
    }

    /**
     * 获取用户状态名称
     */
    getStatusName() {
        const statusNames = {
            [USER_STATUS.NORMAL]: '正常',
            [USER_STATUS.BANNED]: '已封禁'
        };
        return statusNames[this.status] || '未知状态';
    }

    /**
     * 转换为安全的JSON对象（不含密码）
     */
    toSafeJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            realName: this.realName,
            phone: this.phone,
            userType: this.userType,
            userTypeName: this.getUserTypeName(),
            avatar: this.avatar,
            uploadCount: this.uploadCount,
            bannedFiles: this.bannedFiles,
            status: this.status,
            statusName: this.getStatusName(),
            registerTime: this.registerTime,
            lastLoginTime: this.lastLoginTime,
            updatedAt: this.updatedAt
        };
    }
}

User.USER_TYPE = USER_TYPE;
User.USER_STATUS = USER_STATUS;

module.exports = User;