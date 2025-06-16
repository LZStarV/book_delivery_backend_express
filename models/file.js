// models/file.js
const db = require('../databases/fileDB');
const auditDB = require('../databases/auditDB');
const categoryDB = require('../databases/categoryDB');
const tagDB = require('../databases/tagDB');
const fs = require('fs');
const path = require('path');

/**
 * 文件状态常量
 */
const FILE_STATUS = {
    PENDING: 0,      // 待审核
    APPROVED: 1,     // 已通过
    REJECTED: 2,     // 已拒绝
    DELETED: 3,      // 已删除
    BANNED: 4        // 已封禁
};

/**
 * 文件类型常量
 */
const FILE_TYPE = {
    PDF: 'pdf',
    IMAGE: 'image',
    EPUB: 'epub',
    MOBI: 'mobi'
};

class File {
    constructor(data) {
        this.id = data.id;
        this.fileName = data.file_name;
        this.fileUuid = data.file_uuid;
        this.filePath = data.file_path;
        this.fileType = data.file_type;
        this.fileSize = data.file_size;
        this.fileExt = data.file_ext;
        this.title = data.title;
        this.description = data.description;
        this.coverImage = data.cover_image || 'default_cover.jpg';
        this.categoryId = data.category_id;
        this.userId = data.user_id;
        this.tags = data.tags;
        this.auditStatus = data.audit_status;
        this.auditUserId = data.audit_user_id;
        this.auditTime = data.audit_time;
        this.auditRemark = data.audit_remark;
        this.viewCount = data.view_count || 0;
        this.downloadCount = data.download_count || 0;
        this.likeCount = data.like_count || 0;
        this.status = data.status || 1;
        this.createdAt = data.created_at;
        this.updatedAt = data.updated_at;
    }

    /**
     * 创建新文件
     */
    static async create(data) {
        const fileId = await fileDB.createFile(data);
        return new File({ id: fileId, ...data });
    }

    /**
     * 根据ID获取文件
     */
    static async getById(fileId) {
        const fileData = await fileDB.getFileById(fileId);
        if (!fileData) return null;
        return new File(fileData);
    }

    /**
     * 获取用户上传的文件
     */
    static async getByUserId(userId, page = 1, limit = 10) {
        const filesData = await fileDB.getFilesByUserId(userId, page, limit);
        return filesData.map(data => new File(data));
    }

    /**
     * 获取待审核文件列表
     */
    static async getPendingFiles(page = 1, limit = 10) {
        const filesData = await fileDB.getPendingFiles(page, limit);
        return filesData.map(data => new File(data));
    }

    /**
     * 更新文件状态
     */
    async updateStatus(newStatus, userId, remark) {
        const oldStatus = this.auditStatus;
        const auditTime = new Date();

        // 更新文件状态
        await db.updateFileStatus(
            this.id,
            newStatus,
            userId,
            auditTime,
            remark
        );

        // 记录审核日志
        await auditDB.createAuditRecord(
            this.id,
            userId,
            oldStatus,
            newStatus,
            this.getOperationType(oldStatus, newStatus),
            remark
        );

        // 更新当前实例状态
        this.auditStatus = newStatus;
        this.auditUserId = userId;
        this.auditTime = auditTime;
        this.auditRemark = remark;

        return this;
    }

    /**
     * 增加浏览次数
     */
    async incrementViewCount() {
        await db.incrementViewCount(this.id);
        this.viewCount += 1;
        return this;
    }

    /**
     * 增加下载次数
     */
    async incrementDownloadCount() {
        await db.incrementDownloadCount(this.id);
        this.downloadCount += 1;
        return this;
    }

    /**
     * 获取文件完整路径
     */
    getFullPath() {
        return path.join(__dirname, '../public', this.filePath);
    }

    /**
     * 获取文件URL
     */
    getUrl() {
        return `/public${this.filePath}`;
    }

    /**
     * 获取封面图片URL
     */
    getCoverUrl() {
        return `/public/uploads/covers/${this.coverImage}`;
    }

    /**
     * 获取文件大小的友好显示
     */
    getSizeText() {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = this.fileSize;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    }

    /**
     * 获取操作类型
     */
    getOperationType(oldStatus, newStatus) {
        if (oldStatus === 0 && newStatus === 1) return 1; // 审核通过
        if (oldStatus === 0 && newStatus === 2) return 2; // 审核拒绝
        if (oldStatus === 1 && newStatus === 4) return 5; // 封禁
        if (oldStatus === 4 && newStatus === 1) return 6; // 解封
        return 0; // 未知操作
    }

    /**
     * 删除物理文件
     */
    deletePhysicalFile() {
        return new Promise((resolve, reject) => {
            const filePath = this.getFullPath();
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`删除文件失败: ${filePath}`, err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * 转换为JSON对象
     */
    toJSON() {
        return {
            id: this.id,
            fileName: this.fileName,
            fileUuid: this.fileUuid,
            filePath: this.getUrl(),
            fileType: this.fileType,
            fileSize: this.getSizeText(),
            fileExt: this.fileExt,
            title: this.title,
            description: this.description,
            coverImage: this.getCoverUrl(),
            categoryId: this.categoryId,
            userId: this.userId,
            tags: this.tags,
            auditStatus: this.auditStatus,
            auditUserId: this.auditUserId,
            auditTime: this.auditTime,
            auditRemark: this.auditRemark,
            viewCount: this.viewCount,
            downloadCount: this.downloadCount,
            likeCount: this.likeCount,
            status: this.status,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

File.FILE_STATUS = FILE_STATUS;
File.FILE_TYPE = FILE_TYPE;

module.exports = File;