// databases/fileDB.js
const db = require('./db'); // 数据库连接

/**
 * 创建新文件记录
 */
exports.createFile = (fileData) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO files SET ?';

        db.query(query, fileData, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results.insertId);
        });
    });
};

/**
 * 根据ID获取文件
 */
exports.getFileById = (fileId) => {
    return new Promise((resolve, reject) => {
        const query = `
      SELECT f.*, u.username AS uploader_name, c.name AS category_name 
      FROM files f
      JOIN users u ON f.user_id = u.id
      JOIN categories c ON f.category_id = c.id
      WHERE f.id = ?
    `;

        db.query(query, [fileId], (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results[0] || null);
        });
    });
};

/**
 * 获取用户上传的文件列表
 */
exports.getFilesByUserId = (userId, page = 1, limit = 10) => {
    return new Promise((resolve, reject) => {
        const offset = (page - 1) * limit;
        const query = `
      SELECT f.*, c.name AS category_name 
      FROM files f
      JOIN categories c ON f.category_id = c.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `;

        db.query(query, [userId, limit, offset], (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
        });
    });
};

/**
 * 获取待审核文件列表（审核大厅）
 */
exports.getPendingFiles = (page = 1, limit = 10) => {
    return new Promise((resolve, reject) => {
        const offset = (page - 1) * limit;
        const query = `
      SELECT f.*, u.username AS uploader_name, c.name AS category_name 
      FROM files f
      JOIN users u ON f.user_id = u.id
      JOIN categories c ON f.category_id = c.id
      WHERE f.audit_status = 0
      ORDER BY f.created_at ASC
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
 * 更新文件状态
 */
exports.updateFileStatus = (fileId, auditStatus, auditUserId, auditTime, auditRemark) => {
    return new Promise((resolve, reject) => {
        const query = `
      UPDATE files 
      SET audit_status = ?, audit_user_id = ?, audit_time = ?, audit_remark = ?, updated_at = NOW()
      WHERE id = ?
    `;

        db.query(query, [auditStatus, auditUserId, auditTime, auditRemark, fileId], (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results.affectedRows);
        });
    });
};

/**
 * 更新文件下载次数
 */
exports.incrementDownloadCount = (fileId) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE files SET download_count = download_count + 1 WHERE id = ?';

        db.query(query, [fileId], (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results.affectedRows);
        });
    });
};

/**
 * 更新文件浏览次数
 */
exports.incrementViewCount = (fileId) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE files SET view_count = view_count + 1 WHERE id = ?';

        db.query(query, [fileId], (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results.affectedRows);
        });
    });
};

/**
 * 根据用户ID获取文件数量
 */
exports.getFileCountByUserId = (userId) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) AS count FROM files WHERE user_id = ?';

        db.query(query, [userId], (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results[0].count);
        });
    });
};

/**
 * 根据用户ID和状态获取文件数量
 */
exports.getFileCountByUserIdAndStatus = (userId, status) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT COUNT(*) AS count FROM files WHERE user_id = ? AND audit_status = ?';

        db.query(query, [userId, status], (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results[0].count);
        });
    });
};

/**
 * 删除用户的所有文件（带事务支持）
 */
exports.deleteFilesByUserId = (userId, connection = db) => {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM files WHERE user_id = ?';

        connection.query(query, [userId], (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results.affectedRows);
        });
    });
};

/**
 * 获取文件总数
 */
exports.getFileCount = () => {
    const sql = 'SELECT COUNT(*) as count FROM files';
    return db.executeQuery(sql).then(rows => rows[0].count);
};

/**
 * 获取今日上传文件数量
 */
exports.getTodayUploadCount = () => {
    const sql = 'SELECT COUNT(*) as count FROM files WHERE DATE(created_at) = CURDATE()';
    return db.executeQuery(sql).then(rows => rows[0].count);
};

/**
 * 获取文件状态分布
 */
exports.getFileStatusDistribution = () => {
    const sql = `
      SELECT audit_status as status, COUNT(*) as count 
      FROM files 
      GROUP BY audit_status
    `;
    return db.executeQuery(sql);
};

/**
 * 获取分类文件数量
 */
exports.getFileCountByCategory = () => {
    const sql = `
      SELECT c.id, c.name, COUNT(f.id) as file_count 
      FROM categories c
      LEFT JOIN files f ON c.id = f.category_id AND f.audit_status = 1
      GROUP BY c.id
      ORDER BY file_count DESC
    `;
    return db.executeQuery(sql);
};

/**
 * 获取月度上传统计
 */
exports.getMonthlyUploadCount = (months) => {
    const sql = `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count
      FROM files
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      GROUP BY month
      ORDER BY month ASC
    `;
    return db.executeQuery(sql, [months]);
};

/**
 * 获取热门文件
 */
exports.getHotFiles = (limit) => {
    const sql = `
      SELECT f.*, u.username as uploader_name, c.name as category_name
      FROM files f
      JOIN users u ON f.user_id = u.id
      JOIN categories c ON f.category_id = c.id
      WHERE f.audit_status = 1
      ORDER BY f.download_count DESC, f.view_count DESC
      LIMIT ?
    `;
    return db.executeQuery(sql, [limit]);
};