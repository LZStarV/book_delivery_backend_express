const db = require('./db');

/**
 * 根据邮箱或用户名获取用户
 */
exports.getUserByEmailOrUsername = (email, username) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1';
        db.query(query, [email, username], (error, results) => {
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