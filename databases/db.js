const mysql = require('mysql2');
const config = require('../config/constants').db;

const pool = mysql.createPool(config);

/**
 * 执行SQL查询
 */
async function executeQuery(sql, values = []) {
    try {
        const [rows] = await pool.execute(sql, values);
        return rows;
    } catch (error) {
        console.error('数据库查询错误:', error);
        throw error;
    }
}

/**
 * 执行事务
 */
async function executeTransaction(transactionHandler) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await transactionHandler(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        console.error('数据库事务错误:', error);
        throw error;
    } finally {
        connection.release();
    }
}

/**
 * 分页查询
 */
async function paginateQuery(sql, values = [], page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const countSql = `SELECT COUNT(*) as total FROM (${sql}) as subquery`;

    const [countResult, rows] = await Promise.all([
        executeQuery(countSql, values),
        executeQuery(`${sql} LIMIT ? OFFSET ?`, [...values, limit, offset])
    ]);

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    return {
        data: rows,
        page,
        limit,
        total,
        totalPages
    };
}

module.exports = {
    executeQuery,
    executeTransaction,
    paginateQuery,
    getConnection: () => pool.getConnection()
};