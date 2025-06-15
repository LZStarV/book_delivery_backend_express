const db = require('./db');

/**
 * 创建文件审核记录
 */
exports.createAuditRecord = (fileId, userId, oldStatus, newStatus, operationType, remark) => {
    return new Promise((resolve, reject) => {
        const query = `
      INSERT INTO audit_records 
      (file_id, user_id, old_status, new_status, operation_type, remark, operation_time)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

        db.query(query, [fileId, userId, oldStatus, newStatus, operationType, remark], (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results.insertId);
        });
    });
};

/**
 * 获取文件的审核记录
 */
exports.getAuditRecordsByFile = (fileId) => {
    return new Promise((resolve, reject) => {
        const query = `
      SELECT ar.*, u.username AS auditor_name 
      FROM audit_records ar
      JOIN users u ON ar.user_id = u.id
      WHERE ar.file_id = ?
      ORDER BY ar.operation_time DESC
    `;

        db.query(query, [fileId], (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
        });
    });
};

/**
 * 获取所有审核记录
 */
exports.getAllAuditRecords = (page = 1, limit = 10) => {
    return new Promise((resolve, reject) => {
        const offset = (page - 1) * limit;
        const query = `
      SELECT ar.*, u.username AS auditor_name, f.title AS file_title 
      FROM audit_records ar
      JOIN users u ON ar.user_id = u.id
      JOIN files f ON ar.file_id = f.id
      ORDER BY ar.operation_time DESC
      LIMIT ? OFFSET ?
    `;

        db.query(query, [limit, offset], (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
        });
    });
};

/**
 * 获取审核记录总数
 */
exports.getAuditRecordsCount = () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) AS count FROM audit_records';

        db.query(query, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results[0].count);
        });
    });
};

/**
 * 记录用户操作日志
 */
exports.logUserOperation = (operatorId, targetUserId, operationType, oldStatus, newStatus, remark, connection = db) => {
    return new Promise((resolve, reject) => {
        const query = `
      INSERT INTO user_operation_logs 
      (user_id, target_user_id, operation_type, old_status, new_status, remark, operation_time)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

        connection.query(query, [operatorId, targetUserId, operationType, oldStatus, newStatus, remark], (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results.insertId);
        });
    });
};

/**
 * 获取审核员统计
 */
exports.getAuditorStats = () => {
    const sql = `
      SELECT 
        u.id, 
        u.username, 
        COUNT(ar.id) as audit_count,
        SUM(CASE WHEN ar.operation_type = 1 THEN 1 ELSE 0 END) as approve_count,
        SUM(CASE WHEN ar.operation_type = 2 THEN 1 ELSE 0 END) as reject_count
      FROM audit_records ar
      JOIN users u ON ar.user_id = u.id
      WHERE ar.operation_type IN (1, 2)
      GROUP BY u.id
      ORDER BY audit_count DESC
    `;
    return db.executeQuery(sql);
};

/**
 * 获取分类总数
 */
exports.getCategoryCount = () => {
    const sql = 'SELECT COUNT(*) as count FROM categories';
    return db.executeQuery(sql).then(rows => rows[0].count);
};