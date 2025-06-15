const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const File = require('../models/file');
const User = require('../models/user');
const Category = require('../models/category');
const { protect, authorize } = require('../middleware/auth');

/**
 * @desc    上传文件
 * @route   POST /api/v1/files/upload
 * @access  私有/普通用户
 */
exports.uploadFile = async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ success: false, message: '请上传文件' });
        }

        const file = req.files.file;
        const { title, description, categoryId, tags } = req.body;

        // 验证分类存在且启用
        const category = await Category.getById(categoryId);
        if (!category || category.status !== 1) {
            return res.status(400).json({ success: false, message: '无效的分类' });
        }

        // 验证文件类型
        const allowedFileTypes = ['pdf', 'epub', 'mobi'];
        const allowedImageTypes = ['jpg', 'jpeg', 'png', 'gif'];
        const fileExt = file.name.split('.').pop().toLowerCase();

        if (!allowedFileTypes.includes(fileExt) && !allowedImageTypes.includes(fileExt)) {
            return res.status(400).json({
                success: false,
                message: `不支持的文件类型，允许: ${[...allowedFileTypes, ...allowedImageTypes].join(', ')}`
            });
        }

        // 生成唯一文件标识
        const fileUuid = uuidv4();
        const fileName = `${fileUuid}.${fileExt}`;
        const uploadPath = path.join(__dirname, '../public/uploads/files/', fileName);

        // 移动文件到上传目录
        await new Promise((resolve, reject) => {
            file.mv(uploadPath, (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        // 创建文件记录
        const newFile = await File.create({
            file_name: file.name,
            file_uuid: fileUuid,
            file_path: `/uploads/files/${fileName}`,
            file_type: allowedFileTypes.includes(fileExt) ? 'document' : 'image',
            file_size: file.size,
            file_ext: fileExt,
            title,
            description,
            cover_image: 'default_cover.jpg',
            category_id: categoryId,
            user_id: req.user.id,
            tags: tags || '',
            audit_status: 0, // 待审核
            created_at: new Date()
        });

        // 更新用户上传计数
        await User.incrementUploadCount(req.user.id);

        res.status(201).json({
            success: true,
            message: '文件上传成功，等待审核',
            data: {
                id: newFile.id,
                title,
                categoryId,
                userId: req.user.id
            }
        });
    } catch (error) {
        console.error('文件上传错误:', error);
        // 清理上传的文件
        if (req.files && req.files.file) {
            const uploadPath = path.join(__dirname, '../public/uploads/files/', req.files.file.name);
            if (fs.existsSync(uploadPath)) {
                fs.unlinkSync(uploadPath);
            }
        }
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

/**
 * @desc    获取文件详情
 * @route   GET /api/v1/files/:id
 * @access  公开
 */
exports.getFileById = async (req, res) => {
    try {
        const fileId = req.params.id;
        const file = await File.getById(fileId);

        if (!file) {
            return res.status(404).json({ success: false, message: '文件不存在' });
        }

        // 检查文件状态
        if (file.audit_status !== 1 || file.status !== 1) {
            return res.status(403).json({ success: false, message: '文件不可访问' });
        }

        // 增加浏览计数
        await file.incrementViewCount();

        res.status(200).json({
            success: true,
            data: file.toPublicJSON()
        });
    } catch (error) {
        console.error('获取文件详情错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

/**
 * @desc    获取我的上传文件
 * @route   GET /api/v1/files/my
 * @access  私有/普通用户
 */
exports.getMyFiles = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user.id;

        const files = await File.getByUserId(userId, page, limit);
        const total = await File.countByUserId(userId);

        res.status(200).json({
            success: true,
            count: files.length,
            total,
            pages: Math.ceil(total / limit),
            data: files.map(file => file.toJSON())
        });
    } catch (error) {
        console.error('获取我的文件错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

/**
 * @desc    浏览文件（广场/分类/标签）
 * @route   GET /api/v1/files
 * @route   GET /api/v1/files/square
 * @route   GET /api/v1/files/category/:categoryId
 * @route   GET /api/v1/files/tag/:tag
 * @access  公开
 */
exports.browseFiles = async (req, res) => {
    try {
        const { categoryId, tag, page = 1, limit = 10, sort = 'newest' } = req.query;
        const offset = (page - 1) * limit;
        let filter = {};

        // 处理分类过滤
        if (categoryId) {
            const category = await Category.getById(categoryId);
            if (!category || category.status !== 1) {
                return res.status(404).json({ success: false, message: '分类不存在或已禁用' });
            }
            filter.categoryId = categoryId;
        }

        // 处理标签过滤
        if (tag) {
            filter.tags = tag;
        }

        // 处理排序
        let orderBy = 'createdAt DESC';
        if (sort === 'popular') orderBy = 'viewCount DESC, downloadCount DESC';
        else if (sort === 'oldest') orderBy = 'createdAt ASC';

        const files = await File.browse(
            filter,
            page,
            limit,
            orderBy
        );

        const total = await File.count(filter);

        res.status(200).json({
            success: true,
            count: files.length,
            total,
            pages: Math.ceil(total / limit),
            data: files
        });
    } catch (error) {
        console.error('浏览文件错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

/**
 * @desc    更新文件状态（审核/封禁）
 * @route   PUT /api/v1/files/:id/status
 * @access  私有/志愿者/管理员
 */
exports.updateFileStatus = async (req, res) => {
    try {
        const fileId = req.params.id;
        const { action, remark } = req.body;
        const file = await File.getById(fileId);

        if (!file) {
            return res.status(404).json({ success: false, message: '文件不存在' });
        }

        let newStatus, operationType, message;
        const oldStatus = file.audit_status;

        // 根据操作类型设置新状态和操作类型
        switch (action) {
            case 'approve':
                newStatus = 1; // 已通过
                operationType = 1; // 审核通过
                message = '文件审核通过';
                break;
            case 'reject':
                newStatus = 2; // 已拒绝
                operationType = 2; // 审核拒绝
                message = '文件审核拒绝';
                break;
            case 'ban':
                newStatus = 4; // 已封禁
                operationType = 5; // 封禁
                message = '文件已封禁';
                break;
            case 'unban':
                newStatus = 1; // 解封后设为已通过
                operationType = 6; // 解封
                message = '文件已解封';
                break;
            default:
                return res.status(400).json({ success: false, message: '无效的操作' });
        }

        // 执行状态更新
        await file.updateStatus(
            newStatus,
            req.user.id,
            remark || message
        );

        res.status(200).json({
            success: true,
            message,
            data: {
                id: fileId,
                auditStatus: newStatus
            }
        });
    } catch (error) {
        console.error('更新文件状态错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

/**
 * @desc    删除文件
 * @route   DELETE /api/v1/files/:id
 * @access  私有/管理员
 */
exports.deleteFile = async (req, res) => {
    try {
        const fileId = req.params.id;
        const file = await File.getById(fileId);

        if (!file) {
            return res.status(404).json({ success: false, message: '文件不存在' });
        }

        // 删除文件物理资源
        const filePath = path.join(__dirname, '..', file.file_path);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // 删除数据库记录
        await file.delete();

        res.status(200).json({
            success: true,
            message: '文件删除成功'
        });
    } catch (error) {
        console.error('删除文件错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

/**
 * @desc    上传封面图片
 * @route   POST /api/v1/files/cover/upload
 * @access  私有/普通用户
 */
exports.uploadCoverImage = async (req, res) => {
    try {
        if (!req.files || !req.files.cover) {
            return res.status(400).json({ success: false, message: '请上传封面图片' });
        }

        const cover = req.files.cover;
        const { fileId } = req.body;
        const file = await File.getById(fileId);

        if (!file || file.user_id !== req.user.id) {
            return res.status(403).json({ success: false, message: '无权限操作' });
        }

        // 验证图片类型
        const allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
        const fileExt = cover.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(fileExt)) {
            return res.status(400).json({
                success: false,
                message: `不支持的图片类型，允许: ${allowedTypes.join(', ')}`
            });
        }

        // 生成唯一文件名
        const coverUuid = uuidv4();
        const coverName = `${coverUuid}.${fileExt}`;
        const uploadPath = path.join(__dirname, '../public/uploads/covers/', coverName);

        // 移动文件到上传目录
        await new Promise((resolve, reject) => {
            cover.mv(uploadPath, (err) => {
                if (err) reject(err);
                resolve();
            });
        });

        // 更新封面图片路径
        await file.update({
            cover_image: `/uploads/covers/${coverName}`,
            updated_at: new Date()
        });

        res.status(201).json({
            success: true,
            message: '封面图片上传成功',
            data: {
                id: fileId,
                coverImage: `/uploads/covers/${coverName}`
            }
        });
    } catch (error) {
        console.error('上传封面图片错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

/**
 * @desc    点赞文件
 * @route   PUT /api/v1/files/:id/like
 * @access  私有/普通用户
 */
exports.likeFile = async (req, res) => {
    try {
        const fileId = req.params.id;
        const userId = req.user.id;
        const file = await File.getById(fileId);

        if (!file) {
            return res.status(404).json({ success: false, message: '文件不存在' });
        }

        // 检查是否已点赞
        const hasLiked = await file.hasUserLiked(userId);

        if (hasLiked) {
            // 取消点赞
            await file.removeLike(userId);
            return res.status(200).json({
                success: true,
                message: '已取消点赞',
                data: {
                    id: fileId,
                    likes: file.like_count - 1,
                    liked: false
                }
            });
        } else {
            // 添加点赞
            await file.addLike(userId);
            return res.status(200).json({
                success: true,
                message: '点赞成功',
                data: {
                    id: fileId,
                    likes: file.like_count + 1,
                    liked: true
                }
            });
        }
    } catch (error) {
        console.error('点赞文件错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};

/**
 * @desc    下载文件
 * @route   GET /api/v1/files/:id/download
 * @access  私有/普通用户
 */
exports.downloadFile = async (req, res) => {
    try {
        const fileId = req.params.id;
        const file = await File.getById(fileId);

        if (!file) {
            return res.status(404).json({ success: false, message: '文件不存在' });
        }

        // 检查文件状态
        if (file.audit_status !== 1 || file.status !== 1) {
            return res.status(403).json({ success: false, message: '文件不可下载' });
        }

        // 增加下载计数
        await file.incrementDownloadCount();

        // 发送文件下载
        const filePath = path.join(__dirname, '..', file.file_path);
        res.download(filePath, file.file_name, (err) => {
            if (err) {
                console.error('文件下载错误:', err);
                res.status(500).json({ success: false, message: '文件下载失败' });
            }
        });
    } catch (error) {
        console.error('下载文件错误:', error);
        res.status(500).json({ success: false, message: '服务器错误' });
    }
};