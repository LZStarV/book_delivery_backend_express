const express = require('express');
const router = express.Router();
const {
    uploadFile,
    getFileById,
    getMyFiles,
    browseFiles,
    updateFileStatus,
    deleteFile,
    uploadCoverImage,
    likeFile,
    downloadFile
} = require('../controllers/fileController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/files:
 *   get:
 *     tags:
 *       - 文件
 *     summary: 浏览文件 (公共)
 *     parameters:
 *       - name: categoryId
 *         in: query
 *         type: integer
 *         description: "分类ID"
 *       - name: tag
 *         in: query
 *         type: string
 *         description: "标签"
 *       - name: page
 *         in: query
 *         type: integer
 *         default: 1
 *       - name: limit
 *         in: query
 *         type: integer
 *         default: 10
 *       - name: sort
 *         in: query
 *         type: string
 *         enum: [newest, popular, oldest]
 *         default: newest
 *     responses:
 *       200:
 *         description: "成功返回文件列表"
 */
router.get('/', browseFiles);

/**
 * @swagger
 * /api/v1/files/square:
 *   get:
 *     tags:
 *       - 文件
 *     summary: 获取广场文件 (审核通过的公开文件)
 *     parameters:
 *       - name: categoryId
 *         in: query
 *         type: integer
 *         description: "分类ID"
 *       - name: tag
 *         in: query
 *         type: string
 *         description: "标签"
 *       - name: page
 *         in: query
 *         type: integer
 *         default: 1
 *       - name: limit
 *         in: query
 *         type: integer
 *         default: 10
 *       - name: sort
 *         in: query
 *         type: string
 *         enum: [newest, popular, oldest]
 *         default: newest
 *     responses:
 *       200:
 *         description: "成功返回广场文件列表"
 */
router.get('/square', browseFiles);

/**
 * @swagger
 * /api/v1/files/category/{categoryId}:
 *   get:
 *     tags:
 *       - 文件
 *     summary: 按分类浏览文件 (公共)
 *     parameters:
 *       - name: categoryId
 *         in: path
 *         required: true
 *         type: integer
 *       - name: tag
 *         in: query
 *         type: string
 *         description: "标签"
 *       - name: page
 *         in: query
 *         type: integer
 *         default: 1
 *       - name: limit
 *         in: query
 *         type: integer
 *         default: 10
 *       - name: sort
 *         in: query
 *         type: string
 *         enum: [newest, popular, oldest]
 *         default: newest
 *     responses:
 *       200:
 *         description: "成功返回分类下的文件列表"
 *       404:
 *         description: "分类不存在"
 */
router.get('/category/:categoryId', browseFiles);

/**
 * @swagger
 * /api/v1/files/tag/{tag}:
 *   get:
 *     tags:
 *       - 文件
 *     summary: 按标签浏览文件 (公共)
 *     parameters:
 *       - name: tag
 *         in: path
 *         required: true
 *         type: string
 *       - name: categoryId
 *         in: query
 *         type: integer
 *         description: "分类ID"
 *       - name: page
 *         in: query
 *         type: integer
 *         default: 1
 *       - name: limit
 *         in: query
 *         type: integer
 *         default: 10
 *       - name: sort
 *         in: query
 *         type: string
 *         enum: [newest, popular, oldest]
 *         default: newest
 *     responses:
 *       200:
 *         description: "成功返回标签相关的文件列表"
 */
router.get('/tag/:tag', browseFiles);

/**
 * @swagger
 * /api/v1/files/{id}:
 *   get:
 *     tags:
 *       - 文件
 *     summary: 获取文件详情 (公共)
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: "成功返回文件详情"
 *       404:
 *         description: "文件不存在或不可访问"
 */
router.get('/:id', getFileById);

/**
 * @swagger
 * /api/v1/files/upload:
 *   post:
 *     tags:
 *       - 文件
 *     summary: 上传文件 (普通用户)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: "上传的文件"
 *               title:
 *                 type: string
 *                 description: "文件标题"
 *               description:
 *                 type: string
 *                 description: "文件描述"
 *               categoryId:
 *                 type: integer
 *                 description: "分类ID"
 *               tags:
 *                 type: string
 *                 description: "标签(逗号分隔)"
 *     responses:
 *       201:
 *         description: "上传成功，等待审核"
 *       400:
 *         description: "缺少必填字段或文件类型不支持"
 */
router.post('/upload', protect, uploadFile);

/**
 * @swagger
 * /api/v1/files/cover/upload:
 *   post:
 *     tags:
 *       - 文件
 *     summary: 上传封面图片 (普通用户)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cover:
 *                 type: string
 *                 format: binary
 *                 description: "封面图片"
 *               fileId:
 *                 type: integer
 *                 description: "文件ID"
 *     responses:
 *       201:
 *         description: "封面图片上传成功"
 *       400:
 *         description: "缺少必填字段或图片类型不支持"
 *       403:
 *         description: "无权限操作"
 */
router.post('/cover/upload', protect, uploadCoverImage);

/**
 * @swagger
 * /api/v1/files/my:
 *   get:
 *     tags:
 *       - 文件
 *     summary: 获取我的上传文件 (普通用户)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         type: integer
 *         default: 1
 *       - name: limit
 *         in: query
 *         type: integer
 *         default: 10
 *     responses:
 *       200:
 *         description: "成功返回我的文件列表"
 */
router.get('/my', protect, getMyFiles);

/**
 * @swagger
 * /api/v1/files/{id}/like:
 *   put:
 *     tags:
 *       - 文件
 *     summary: 点赞文件 (普通用户)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: "点赞或取消点赞成功"
 *       404:
 *         description: "文件不存在"
 */
router.put('/:id/like', protect, likeFile);

/**
 * @swagger
 * /api/v1/files/{id}/download:
 *   get:
 *     tags:
 *       - 文件
 *     summary: 下载文件 (普通用户)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: "开始下载文件"
 *       403:
 *         description: "文件不可下载"
 *       404:
 *         description: "文件不存在"
 */
router.get('/:id/download', protect, downloadFile);

/**
 * @swagger
 * /api/v1/files/{id}/status:
 *   put:
 *     tags:
 *       - 文件
 *     summary: 更新文件状态 (志愿者/管理员)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 description: "操作类型(approve/reject/ban/unban)"
 *               remark:
 *                 type: string
 *                 description: "操作备注"
 *     responses:
 *       200:
 *         description: "状态更新成功"
 *       400:
 *         description: "无效的操作"
 *       403:
 *         description: "无权限操作"
 *       404:
 *         description: "文件不存在"
 */
router.put('/:id/status', protect, authorize(2, 3), updateFileStatus);

/**
 * @swagger
 * /api/v1/files/{id}:
 *   delete:
 *     tags:
 *       - 文件
 *     summary: 删除文件 (管理员)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: "文件删除成功"
 *       403:
 *         description: "无权限操作"
 *       404:
 *         description: "文件不存在"
 */
router.delete('/:id', protect, authorize(3), deleteFile);

module.exports = router;