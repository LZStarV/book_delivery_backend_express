const auditDB = require('../databases/auditDB');
const User = require('./user');
const File = require('./file');

/**
 * 审核操作类型常量
 */
const OPERATION_TYPE = {
    FILE_APPROVE: 1,      // 文件审核通过
    FILE_REJECT: 2,       // 文件审核拒绝
    USER_BAN: 3,          // 用户封禁
    USER_TYPE_CHANGE: 4,  // 用户类型变更
    USER_DELETE: 5,       // 用户删除
    FILE_BAN: 6,          // 文件封禁
    FILE_UNBAN: 7         // 文件解封
};

class AuditRecord {
    constructor(data) {
        this.id = data.id;
        this.fileId = data.file_id;
        this.userId = data.user_id;
        this.oldStatus = data.old_status;
        this.newStatus = data.new_status;
        this.operationType = data.operation_type;
        this.remark = data.remark;
        this.operationTime = data.operation_time;
        this.auditor = null;
        this.file = null;
    }

    /**
     * 获取文件的审核记录
     */
    static async getByFileId(fileId) {
        const recordsData = await auditDB.getAuditRecordsByFile(fileId);
        const records = recordsData.map(data => new AuditRecord(data));

        // 批量加载审核员信息
        const userIds = [...new Set(records.map(record => record.userId))];
        const users = await Promise.all(userIds.map(id => User.getById(id)));
        const userMap = users.reduce((map, user) => {
            if (user) map[user.id] = user;
            return map;
        }, {});

        // 关联审核员信息
        records.forEach(record => {
            record.auditor = userMap[record.userId];
        });

        return records;
    }

    /**
     * 获取所有审核记录
     */
    static async getAll(page = 1, limit = 10) {
        const recordsData = await auditDB.getAllAuditRecords(page, limit);
        const records = recordsData.map(data => new AuditRecord(data));

        // 批量加载审核员和文件信息
        const userIds = [...new Set(records.map(record => record.userId))];
        const fileIds = [...new Set(records.map(record => record.fileId))];

        const [users, files] = await Promise.all([
            Promise.all(userIds.map(id => User.getById(id))),
            Promise.all(fileIds.map(id => File.getById(id)))
        ]);

        const userMap = users.reduce((map, user) => {
            if (user) map[user.id] = user;
            return map;
        }, {});

        const fileMap = files.reduce((map, file) => {
            if (file) map[file.id] = file;
            return map;
        }, {});

        // 关联审核员和文件信息
        records.forEach(record => {
            record.auditor = userMap[record.userId];
            record.file = fileMap[record.fileId];
        });

        return records;
    }

    /**
     * 获取操作类型名称
     */
    getOperationTypeName() {
        const typeNames = {
            [OPERATION_TYPE.FILE_APPROVE]: '审核通过',
            [OPERATION_TYPE.FILE_REJECT]: '审核拒绝',
            [OPERATION_TYPE.USER_BAN]: '用户封禁',
            [OPERATION_TYPE.USER_TYPE_CHANGE]: '用户类型变更',
            [OPERATION_TYPE.USER_DELETE]: '用户删除',
            [OPERATION_TYPE.FILE_BAN]: '文件封禁',
            [OPERATION_TYPE.FILE_UNBAN]: '文件解封'
        };
        return typeNames[this.operationType] || '未知操作';
    }

    /**
     * 转换为JSON对象
     */
    toJSON() {
        return {
            id: this.id,
            fileId: this.fileId,
            userId: this.userId,
            oldStatus: this.oldStatus,
            newStatus: this.newStatus,
            operationType: this.operationType,
            operationTypeName: this.getOperationTypeName(),
            remark: this.remark,
            operationTime: this.operationTime,
            auditor: this.auditor ? this.auditor.toSafeJSON() : null,
            file: this.file ? this.file.toJSON() : null
        };
    }
}

AuditRecord.OPERATION_TYPE = OPERATION_TYPE;

module.exports = AuditRecord;