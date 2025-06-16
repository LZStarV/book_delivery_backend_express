const db = require('./db');

/**
 * 根据用户ID获取用户
 */
exports.getUserById = (id) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE id = ? LIMIT 1';
        db.query(query, [id], (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results[0] || null);
        });
    });
};

/**
 * 根据用户名获取用户
 */
exports.getUserByUsername = (username) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE username = ? LIMIT 1';
        db.query(query, [username], (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results[0] || null);
        });
    });
};

/**
 * 根据邮箱获取用户
 */
exports.getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE email = ? LIMIT 1';
        db.query(query, [email], (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results[0] || null);
        });
    });
};

/**
 * 获取所有用户
 */
exports.getAllUsers = ({ status, userType, offset, limit }) => {
    return new Promise((resolve, reject) => {
        let query = 'SELECT * FROM users WHERE 1=1';
        const params = [];

        if (status !== undefined) {
            query += ' AND status = ?';
            params.push(status);
        }

        if (userType !== undefined) {
            query += ' AND user_type = ?';
            params.push(userType);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        db.query(query, params, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
        });
    });
};

/**
 * 获取用户总数
 */
exports.getUserCount = ({ status, userType }) => {
    return new Promise((resolve, reject) => {
        let query = 'SELECT COUNT(*) as count FROM users WHERE 1=1';
        const params = [];

        if (status !== undefined) {
            query += ' AND status = ?';
            params.push(status);
        }

        if (userType !== undefined) {
            query += ' AND user_type = ?';
            params.push(userType);
        }

        db.query(query, params, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results[0].count);
        });
    });
};

/**
 * 更新用户信息
 */
exports.updateUser = (userId, data) => {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE users SET ? WHERE id = ?';
        db.query(query, [data, userId], (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            // 返回更新后的用户信息
            exports.getUserById(userId)
                .then(user => resolve(user))
                .catch(err => reject(err));
        });
    });
};

/**
 * 删除用户 (带事务支持)
 */
exports.deleteUser = (userId, connection = db) => {
    return new Promise((resolve, reject) => {
        const query = 'DELETE FROM users WHERE id = ?';
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
 * 获取数据库连接 (用于事务处理)
 */
exports.getConnection = () => {
    return new Promise((resolve, reject) => {
        db.getConnection((error, connection) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(connection);
        });
    });
};

/**
 * 获取用户总数
 */
exports.getUserCount = () => {
    const sql = 'SELECT COUNT(*) as count FROM users';
    return db.executeQuery(sql).then(rows => rows[0].count);
};

/**
 * 获取今日注册用户数量
 */
exports.getTodayRegisterCount = () => {
    const sql = 'SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()';
    return db.executeQuery(sql).then(rows => rows[0].count);
};

/**
 * 获取标签总数
 */
exports.getTagCount = () => {
    const sql = 'SELECT COUNT(*) as count FROM fixed_tags';
    return db.executeQuery(sql).then(rows => rows[0].count);
};

/**
 * 创建新用户
 */
exports.createUser = (user) => {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO users SET ?';
        db.query(query, user, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results.insertId);
        });
    });
};