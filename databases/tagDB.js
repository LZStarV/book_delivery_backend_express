const db = require('./db');

/**
 * 获取所有固定标签
 */
exports.getFixedTags = () => {
    const sql = 'SELECT * FROM fixed_tags ORDER BY sort_order ASC, id ASC';
    return db.executeQuery(sql);
};

/**
 * 根据ID获取固定标签
 */
exports.getFixedTagById = (id) => {
    const sql = 'SELECT * FROM fixed_tags WHERE id = ? LIMIT 1';
    return db.executeQuery(sql, [id]).then(rows => rows[0] || null);
};

/**
 * 创建新固定标签
 */
exports.createFixedTag = (data) => {
    const sql = 'INSERT INTO fixed_tags SET ?';
    return db.executeQuery(sql, data).then(result => result.insertId);
};

/**
 * 更新固定标签信息
 */
exports.updateFixedTag = (id, data) => {
    const sql = 'UPDATE fixed_tags SET ? WHERE id = ?';
    return db.executeQuery(sql, [data, id]).then(result => result.affectedRows);
};

/**
 * 删除固定标签
 */
exports.deleteFixedTag = (id) => {
    const sql = 'DELETE FROM fixed_tags WHERE id = ?';
    return db.executeQuery(sql, [id]).then(result => result.affectedRows);
};

/**
 * 获取文件关联的标签
 */
exports.getTagsByFileId = (fileId) => {
    const sql = `
    SELECT t.* 
    FROM file_tags ft
    JOIN tags t ON ft.tag_id = t.id
    WHERE ft.file_id = ?
  `;
    return db.executeQuery(sql, [fileId]);
};

/**
 * 为文件添加标签
 */
exports.addTagsToFile = async (fileId, tagIds) => {
    if (!tagIds || tagIds.length === 0) return;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 先删除已有的标签关联
        const deleteSql = 'DELETE FROM file_tags WHERE file_id = ?';
        await connection.execute(deleteSql, [fileId]);

        // 添加新的标签关联
        const insertSql = 'INSERT INTO file_tags (file_id, tag_id) VALUES ?';
        const values = tagIds.map(tagId => [fileId, tagId]);
        await connection.execute(insertSql, [values]);

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

/**
 * 根据名称获取固定标签
 */
exports.getFixedTagByName = (name) => {
    const sql = 'SELECT * FROM fixed_tags WHERE name = ? LIMIT 1';
    return db.executeQuery(sql, [name]).then(rows => rows[0] || null);
};

/**
 * 获取热门标签
 */
exports.getHotTags = (limit) => {
    const sql = `
      SELECT t.*, COUNT(ft.file_id) as file_count 
      FROM file_tags ft
      JOIN tags t ON ft.tag_id = t.id
      GROUP BY ft.tag_id
      ORDER BY file_count DESC
      LIMIT ?
    `;
    return db.executeQuery(sql, [limit]);
};

/**
 * 根据标签ID获取文件数量
 */
exports.getFileCountByTagId = (tagId) => {
    const sql = 'SELECT COUNT(*) as count FROM file_tags WHERE tag_id = ?';
    return db.executeQuery(sql, [tagId]).then(rows => rows[0].count);
};