// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    getUserById,
    updateUserStatus,
    getUploadStatus,
    banUpload,
    unbanUpload,
    updateUserType,
    deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     tags:
 *       - 用户
 *     summary: 获取当前用户资料
 *     description: "获取当前登录用户的详细资料。"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "成功返回当前用户资料"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     username: { type: string }
 *                     email: { type: string }
 *                     realName: { type: string }
 *                     phone: { type: string }
 *                     userType: { type: integer }
 *                     avatar: { type: string }
 *                     uploadCount: { type: integer }
 *                     bannedFiles: { type: integer }
 *                     status: { type: integer }
 *                     registerTime: { type: string, format: date-time }
 *                     lastLoginTime: { type: string, format: date-time }
 *       404:
 *         description: "用户不存在"
 */
router.get('/me', protect, getUserProfile);

/**
 * @swagger
 * /api/v1/users/me:
 *   put:
 *     tags:
 *       - 用户
 *     summary: 更新当前用户资料
 *     description: "更新当前登录用户的资料。"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string, description: "用户名" }
 *               email: { type: string, description: "邮箱" }
 *               realName: { type: string, description: "真实姓名" }
 *               phone: { type: string, description: "电话号码" }
 *               avatar: { type: string, description: "头像URL" }
 *     responses:
 *       200:
 *         description: "用户资料更新成功"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { type: object }
 *       400:
 *         description: "邮箱已被使用"
 */
router.put('/me', protect, updateUserProfile);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags:
 *       - 用户
 *     summary: 获取所有用户 (志愿者/管理员)
 *     description: "分页获取所有用户，可按状态和类型过滤。"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         type: integer
 *         default: 1
 *         description: "页码"
 *       - name: limit
 *         in: query
 *         type: integer
 *         default: 10
 *         description: "每页数量"
 *       - name: status
 *         in: query
 *         type: integer
 *         description: "用户状态过滤"
 *       - name: userType
 *         in: query
 *         type: integer
 *         description: "用户类型过滤"
 *     responses:
 *       200:
 *         description: "成功返回用户列表"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 total: { type: integer }
 *                 pages: { type: integer }
 *                 data: { type: array, items: { type: object } }
 */
router.get('/', protect, authorize(2, 3), getAllUsers);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     tags:
 *       - 用户
 *     summary: 获取单个用户详情 (志愿者/管理员)
 *     description: "根据用户ID获取用户详细信息。"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *         description: "用户ID"
 *     responses:
 *       200:
 *         description: "成功返回用户详情"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: object }
 *       404:
 *         description: "用户不存在"
 */
router.get('/:id', protect, authorize(2, 3), getUserById);

/**
 * @swagger
 * /api/v1/users/{id}/status:
 *   put:
 *     tags:
 *       - 用户
 *     summary: 更新用户状态 (志愿者/管理员)
 *     description: "更改指定用户的状态（封禁/解封）。"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *         description: "用户ID"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: integer, description: "用户状态 (0: 封禁, 1: 正常)" }
 *     responses:
 *       200:
 *         description: "用户状态更新成功"
 *       403:
 *         description: "无权操作该用户"
 *       404:
 *         description: "用户不存在"
 */
router.put('/:id/status', protect, authorize(2, 3), updateUserStatus);

/**
 * @swagger
 * /api/v1/users/{id}/upload-status:
 *   get:
 *     tags:
 *       - 用户
 *     summary: 获取用户上传状态 (志愿者)
 *     description: "获取指定用户的上传统计信息。"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *         description: "用户ID"
 *     responses:
 *       200:
 *         description: "成功返回用户上传状态"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: object }
 *       404:
 *         description: "用户不存在"
 */
router.get('/:id/upload-status', protect, authorize(2), getUploadStatus);

/**
 * @swagger
 * /api/v1/users/{id}/ban-upload:
 *   put:
 *     tags:
 *       - 用户
 *     summary: 封禁用户上传权限 (志愿者)
 *     description: "封禁指定用户的上传权限。"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *         description: "用户ID"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remark: { type: string, description: "封禁备注" }
 *     responses:
 *       200:
 *         description: "用户上传权限已封禁"
 *       400:
 *         description: "用户已被封禁"
 *       403:
 *         description: "无权操作该用户"
 *       404:
 *         description: "用户不存在"
 */
router.put('/:id/ban-upload', protect, authorize(2), banUpload);

/**
 * @swagger
 * /api/v1/users/{id}/unban-upload:
 *   put:
 *     tags:
 *       - 用户
 *     summary: 解封用户上传权限 (志愿者)
 *     description: "解封指定用户的上传权限。"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *         description: "用户ID"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remark: { type: string, description: "解封备注" }
 *     responses:
 *       200:
 *         description: "用户上传权限已解封"
 *       400:
 *         description: "用户上传权限已解封"
 *       403:
 *         description: "无权操作该用户"
 *       404:
 *         description: "用户不存在"
 */
router.put('/:id/unban-upload', protect, authorize(2), unbanUpload);

/**
 * @swagger
 * /api/v1/users/{id}/type:
 *   put:
 *     tags:
 *       - 用户
 *     summary: 更新用户类型 (管理员)
 *     description: "更改指定用户的类型（普通用户、志愿者、管理员）。"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *         description: "用户ID"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userType: { type: integer, description: "用户类型 (1: 普通用户, 2: 志愿者, 3: 管理员)" }
 *     responses:
 *       200:
 *         description: "用户类型更新成功"
 *       400:
 *         description: "无效的用户类型"
 *       403:
 *         description: "无权操作该用户"
 *       404:
 *         description: "用户不存在"
 */
router.put('/:id/type', protect, authorize(3), updateUserType);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     tags:
 *       - 用户
 *     summary: 删除用户 (管理员)
 *     description: "删除指定用户及其所有上传文件。"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *         description: "用户ID"
 *     responses:
 *       200:
 *         description: "用户已删除"
 *       403:
 *         description: "无权删除该用户"
 *       404:
 *         description: "用户不存在"
 */
router.delete('/:id', protect, authorize(3), deleteUser);

module.exports = router;