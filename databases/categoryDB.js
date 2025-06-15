const db = require('./db');

/**
 * 获取所有分类
 */
exports.getAllCategories = () => {
    const sql = 'SELECT * FROM categories ORDER BY sort_order ASC, id ASC';
    return db.executeQuery(sql);
};

/**
 * 根据ID获取分类
 */
exports.getCategoryById = (id) => {
    const sql = 'SELECT * FROM categories WHERE id = ? LIMIT 1';
    return db.executeQuery(sql, [id]).then(rows => rows[0] || null);
};

/**
 * 创建新分类
 */
exports.createCategory = (data) => {
    const sql = 'INSERT INTO categories SET ?';
    return db.executeQuery(sql, data).then(result => result.insertId);
};

/**
 * 更新分类信息
 */
exports.updateCategory = (id, data) => {
    const sql = 'UPDATE categories SET ? WHERE id = ?';
    return db.executeQuery(sql, [data, id]).then(result => result.affectedRows);
};

/**
 * 删除分类
 */
exports.deleteCategory = (id) => {
    const sql = 'DELETE FROM categories WHERE id = ?';
    return db.executeQuery(sql, [id]).then(result => result.affectedRows);
};

/**
 * 检查分类是否存在
 */
exports.checkCategoryExists = (id) => {
    const sql = 'SELECT 1 FROM categories WHERE id = ? LIMIT 1';
    return db.executeQuery(sql, [id]).then(rows => rows.length > 0);
};

/**
 * 根据名称获取分类
 */
exports.getCategoryByName = (name) => {
    const sql = 'SELECT * FROM categories WHERE name = ? LIMIT 1';
    return db.executeQuery(sql, [name]).then(rows => rows[0] || null);
};

/**
 * 获取子分类数量
 */
exports.getChildCategoryCount = (parentId) => {
    const sql = 'SELECT COUNT(*) as count FROM categories WHERE parent_id = ?';
    return db.executeQuery(sql, [parentId]).then(rows => rows[0].count);
};

/**
 * 获取分类下的文件
 */
exports.getFilesByCategoryId = (categoryId, page = 1, limit = 10, sort = 'newest') => {
    const offset = (page - 1) * limit;
    let orderBy = 'f.created_at DESC';

    if (sort === 'popular') {
        orderBy = 'f.download_count DESC, f.view_count DESC';
    } else if (sort === 'oldest') {
        orderBy = 'f.created_at ASC';
    }

    const sql = `
      SELECT f.*, u.username as uploader_name, c.name as category_name
      FROM files f
      JOIN users u ON f.user_id = u.id
      JOIN categories c ON f.category_id = c.id
      WHERE f.category_id = ? AND f.audit_status = 1
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    return db.executeQuery(sql, [categoryId, limit, offset]);
};