const Tag = require('../models/tag');
const tagDB = require('../databases/tagDB');
const fileDB = require('../databases/fileDB');
const { protect, authorize } = require('../middleware/auth');

/**
 * @desc    获取所有固定标签
 * @route   GET /api/v1/tags
 * @access  公开
 */
exports.getAllTags = async (req, res) => {
    try {
        const tags = await Tag.getAllFixedTags();

        res.status(200).json({
            success: true,
            count: tags.length,
            data: tags.map(tag => tag.toJSON())
        });
    } catch (error) {
        console.error('获取标签错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    获取标签详情
 * @route   GET /api/v1/tags/:id
 * @access  公开
 */
exports.getTagById = async (req, res) => {
    try {
        const tagId = req.params.id;
        const tag = await Tag.getById(tagId);

        if (!tag) {
            return res.status(404).json({ success: false, message: '标签不存在' });
        }

        // 获取使用该标签的文件数量
        const fileCount = await fileDB.getFileCountByTagId(tagId);

        res.status(200).json({
            success: true,
            data: {
                ...tag.toJSON(),
                fileCount
            }
        });
    } catch (error) {
        console.error('获取标签详情错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    创建新标签
 * @route   POST /api/v1/tags
 * @access  私有/志愿者/管理员
 */
exports.createTag = async (req, res) => {
    try {
        const { name, description, status } = req.body;

        // 验证必填字段
        if (!name) {
            return res.status(400).json({ success: false, message: '标签名称是必填项' });
        }

        // 检查标签是否已存在
        const existingTag = await tagDB.getFixedTagByName(name);
        if (existingTag) {
            return res.status(400).json({ success: false, message: '该标签名称已存在' });
        }

        // 创建标签
        const newTag = await Tag.create({
            name,
            description,
            is_fixed: 1,
            status: status || 1,
            created_at: new Date()
        });

        res.status(201).json({
            success: true,
            message: '标签创建成功',
            data: newTag.toJSON()
        });
    } catch (error) {
        console.error('创建标签错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    更新标签
 * @route   PUT /api/v1/tags/:id
 * @access  私有/志愿者/管理员
 */
exports.updateTag = async (req, res) => {
    try {
        const tagId = req.params.id;
        const { name, description, status } = req.body;

        // 验证标签存在
        const tag = await Tag.getById(tagId);
        if (!tag) {
            return res.status(404).json({ success: false, message: '标签不存在' });
        }

        // 检查新名称是否已存在
        if (name && name !== tag.name) {
            const existingTag = await tagDB.getFixedTagByName(name);
            if (existingTag) {
                return res.status(400).json({ success: false, message: '该标签名称已存在' });
            }
        }

        // 更新标签
        const updatedTag = await tag.update({
            name,
            description,
            status,
            updated_at: new Date()
        });

        res.status(200).json({
            success: true,
            message: '标签更新成功',
            data: updatedTag.toJSON()
        });
    } catch (error) {
        console.error('更新标签错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    删除标签
 * @route   DELETE /api/v1/tags/:id
 * @access  私有/管理员
 */
exports.deleteTag = async (req, res) => {
    try {
        const tagId = req.params.id;

        // 验证标签存在
        const tag = await Tag.getById(tagId);
        if (!tag) {
            return res.status(404).json({ success: false, message: '标签不存在' });
        }

        // 检查标签是否被使用
        const fileCount = await fileDB.getFileCountByTagId(tagId);
        if (fileCount > 0) {
            return res.status(400).json({ success: false, message: '该标签正在被使用，无法删除' });
        }

        // 删除标签
        await tag.delete();

        res.status(200).json({
            success: true,
            message: '标签删除成功'
        });
    } catch (error) {
        console.error('删除标签错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};

/**
 * @desc    获取热门标签
 * @route   GET /api/v1/tags/hot
 * @access  公开
 */
exports.getHotTags = async (req, res) => {
    try {
        const limit = req.query.limit || 10;
        const hotTags = await tagDB.getHotTags(limit);

        res.status(200).json({
            success: true,
            count: hotTags.length,
            data: hotTags
        });
    } catch (error) {
        console.error('获取热门标签错误:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    }
};