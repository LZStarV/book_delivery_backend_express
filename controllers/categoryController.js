const Category = require('../models/category');
const fileDB = require('../databases/fileDB');
const { protect, authorize } = require('../middleware/auth');

/**
 * @desc    获取所有分类
 * @route   GET /api/v1/categories
 * @access  公开
 */
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.getAll();

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories.map(category => category.toJSON())
        });
    } catch (error) {
        console.error('获取分类错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    获取分类详情
 * @route   GET /api/v1/categories/:id
 * @access  公开
 */
exports.getCategoryById = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.getById(categoryId);

        if (!category) {
            return res.status(404).json({ success: false, message: '分类不存在' });
        }

        res.status(200).json({
            success: true,
            data: category.toJSON()
        });
    } catch (error) {
        console.error('获取分类详情错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    创建新分类
 * @route   POST /api/v1/categories
 * @access  私有/志愿者/管理员
 */
exports.createCategory = async (req, res) => {
    try {
        const { name, description, parentId, sortOrder, status } = req.body;

        // 验证必填字段
        if (!name) {
            return res.status(400).json({ success: false, message: '分类名称是必填项' });
        }

        // 检查分类是否已存在
        const existingCategory = await Category.getByName(name);
        if (existingCategory) {
            return res.status(400).json({ success: false, message: '该分类名称已存在' });
        }

        // 检查父分类是否存在
        if (parentId && !(await Category.exists(parentId))) {
            return res.status(400).json({ success: false, message: '父分类不存在' });
        }

        // 创建分类
        const newCategory = await Category.create({
            name,
            description,
            parent_id: parentId || null,
            sort_order: sortOrder || 0,
            status: status || 1,
            created_at: new Date()
        });

        res.status(201).json({
            success: true,
            message: '分类创建成功',
            data: newCategory.toJSON()
        });
    } catch (error) {
        console.error('创建分类错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    更新分类
 * @route   PUT /api/v1/categories/:id
 * @access  私有/志愿者/管理员
 */
exports.updateCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { name, description, parentId, sortOrder, status } = req.body;

        // 验证分类存在
        const category = await Category.getById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: '分类不存在' });
        }

        // 检查新名称是否已存在
        if (name && name !== category.name) {
            const existingCategory = await Category.getByName(name);
            if (existingCategory) {
                return res.status(400).json({ success: false, message: '该分类名称已存在' });
            }
        }

        // 检查父分类是否存在
        if (parentId !== undefined && parentId !== null && !(await Category.exists(parentId))) {
            return res.status(400).json({ success: false, message: '父分类不存在' });
        }

        // 更新分类
        const updatedCategory = await category.update({
            name,
            description,
            parent_id: parentId,
            sort_order: sortOrder,
            status,
            updated_at: new Date()
        });

        res.status(200).json({
            success: true,
            message: '分类更新成功',
            data: updatedCategory.toJSON()
        });
    } catch (error) {
        console.error('更新分类错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    删除分类
 * @route   DELETE /api/v1/categories/:id
 * @access  私有/管理员
 */
exports.deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;

        // 验证分类存在
        const category = await Category.getById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: '分类不存在' });
        }

        // 检查是否有子分类
        const childCount = await categoryDB.getChildCategoryCount(categoryId);
        if (childCount > 0) {
            return res.status(400).json({ success: false, message: '该分类下有子分类，无法删除' });
        }

        // 检查分类下是否有文件
        const fileCount = await fileDB.getFileCountByCategoryId(categoryId);
        if (fileCount > 0) {
            return res.status(400).json({ success: false, message: '该分类下有文件，无法删除' });
        }

        // 删除分类
        await category.delete();

        res.status(200).json({
            success: true,
            message: '分类删除成功'
        });
    } catch (error) {
        console.error('删除分类错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    获取分类下的文件
 * @route   GET /api/v1/categories/:id/files
 * @access  公开
 */
exports.getCategoryFiles = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { page = 1, limit = 10, sort = 'newest' } = req.query;

        // 验证分类存在
        const category = await Category.getById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: '分类不存在' });
        }

        // 获取分类下的文件
        const files = await fileDB.getFilesByCategoryId(
            categoryId,
            page,
            limit,
            sort
        );

        res.status(200).json({
            success: true,
            count: files.length,
            data: files
        });
    } catch (error) {
        console.error('获取分类下的文件错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};