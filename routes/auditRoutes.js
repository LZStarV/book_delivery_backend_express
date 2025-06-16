const express = require('express');
const router = express.Router();
const {
    getAuditHall,
    approveFile,
    rejectFile,
    banFile,
    unbanFile,
    getAuditRecords,
    getAuditRecordsByFile
} = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/audit/hall:
 *   get:
 *     tags:
 *       - 审核
 *     summary: 获取审核大厅文件列表 (志愿者)
 *     description: "分页获取所有待审核文件。"
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
 *         description: "成功"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id: { type: string, description: "文件ID" }
 *                       fileName: { type: string, description: "文件名称" }
 *                       filePath: { type: string, description: "文件路径" }
 *                       fileSize: { type: integer, description: "文件大小 (字节)" }
 *                       fileType: { type: string, description: "文件类型" }
 *                       status: { type: integer, description: "审核状态：0-待审核，1-审核通过，2-审核拒绝" }
 *                       createdAt: { type: string, format: "date-time", description: "创建时间" }
 *                       updatedAt: { type: string, format: "date-time", description: "更新时间" }
 */
router.get('/hall', protect, authorize(2), getAuditHall);

/**
 * @swagger
 * /api/v1/audit/approve/{fileId}:
 *   put:
 *     tags:
 *       - 审核
 *     summary: 审核通过文件 (志愿者)
 *     description: "将指定文件审核通过。"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: fileId
 *         in: path
 *         required: true
 *         type: string
 *         description: "文件ID"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remark: { type: string, description: "审核备注" }
 *     responses:
 *       200:
 *         description: "成功"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id: { type: string, description: "文件ID" }
 *                     fileName: { type: string, description: "文件名称" }
 *                     filePath: { type: string, description: "文件路径" }
 *                     fileSize: { type: integer, description: "文件大小 (字节)" }
 *                     fileType: { type: string, description: "文件类型" }
 *                     status: { type: integer, description: "审核状态：0-待审核，1-审核通过，2-审核拒绝" }
 *                     createdAt: { type: string, format: "date-time", description: "创建时间" }
 *                     updatedAt: { type: string, format: "date-time", description: "更新时间" }
 */
router.put('/approve/:fileId', protect, authorize(2), approveFile);

/**
 * @swagger
 * /api/v1/audit/reject/{fileId}:
 *   put:
 *     tags:
 *       - 审核
 *     summary: 审核拒绝文件 (志愿者)
 *     description: "将指定文件审核拒绝。"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: fileId
 *         in: path
 *         required: true
 *         type: string
 *         description: "文件ID"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               remark: { type: string, description: "审核备注" }
 *     responses:
 *       200:
 *         description: "成功"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id: { type: string, description: "文件ID" }
 *                     fileName: { type: string, description: "文件名称" }
 *                     filePath: { type: string, description: "文件路径" }
 *                     fileSize: { type: integer, description: "文件大小 (字节)" }
 *                     fileType: { type: string, description: "文件类型" }
 *                     status: { type: integer, description: "审核状态：0-待审核，1-审核通过，2-审核拒绝" }
 *                     createdAt: { type: string, format: "date-time", description: "创建时间" }
 *                     updatedAt: { type: string, format: "date-time", description: "更新时间" }
 */
router.put('/reject/:fileId', protect, authorize(2), rejectFile);

/**
 * @swagger
 * /api/v1/audit/ban/{fileId}:
 *   put:
 *     tags:
 *       - 审核
 *     summary: 封禁文件 (管理员)
 *     description: "封禁指定文件。"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: fileId
 *         in: path
 *         required: true
 *         type: string
 *         description: "文件ID"
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
 *         description: "成功"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id: { type: string, description: "文件ID" }
 *                     fileName: { type: string, description: "文件名称" }
 *                     filePath: { type: string, description: "文件路径" }
 *                     fileSize: { type: integer, description: "文件大小 (字节)" }
 *                     fileType: { type: string, description: "文件类型" }
 *                     status: { type: integer, description: "审核状态：0-待审核，1-审核通过，2-审核拒绝" }
 *                     createdAt: { type: string, format: "date-time", description: "创建时间" }
 *                     updatedAt: { type: string, format: "date-time", description: "更新时间" }
 */
router.put('/ban/:fileId', protect, authorize(3), banFile);

/**
 * @swagger
 * /api/v1/audit/unban/{fileId}:
 *   put:
 *     tags:
 *       - 审核
 *     summary: 解封文件 (管理员)
 *     description: "解封指定已被封禁的文件。"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: fileId
 *         in: path
 *         required: true
 *         type: string
 *         description: "文件ID"
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
 *         description: "成功"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id: { type: string, description: "文件ID" }
 *                     fileName: { type: string, description: "文件名称" }
 *                     filePath: { type: string, description: "文件路径" }
 *                     fileSize: { type: integer, description: "文件大小 (字节)" }
 *                     fileType: { type: string, description: "文件类型" }
 *                     status: { type: integer, description: "审核状态：0-待审核，1-审核通过，2-审核拒绝" }
 *                     createdAt: { type: string, format: "date-time", description: "创建时间" }
 *                     updatedAt: { type: string, format: "date-time", description: "更新时间" }
 */
router.put('/unban/:fileId', protect, authorize(3), unbanFile);

/**
 * @swagger
 * /api/v1/audit/records:
 *   get:
 *     tags:
 *       - 审核
 *     summary: 获取所有审核记录 (志愿者/管理员)
 *     description: "分页获取所有文件的审核记录。"
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
 *         description: "成功"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id: { type: string, description: "记录ID" }
 *                       fileId: { type: string, description: "文件ID" }
 *                       fileName: { type: string, description: "文件名称" }
 *                       action: { type: string, description: "操作类型：approve/reject/ban/unban" }
 *                       remark: { type: string, description: "审核备注" }
 *                       status: { type: integer, description: "审核状态：0-待审核，1-审核通过，2-审核拒绝" }
 *                       createdAt: { type: string, format: "date-time", description: "创建时间" }
 *                       updatedAt: { type: string, format: "date-time", description: "更新时间" }
 */
router.get('/records', protect, authorize(2, 3), getAuditRecords);

/**
 * @swagger
 * /api/v1/audit/records/file/{fileId}:
 *   get:
 *     tags:
 *       - 审核
 *     summary: 获取文件审核记录 (志愿者/管理员)
 *     description: "获取指定文件的所有审核记录。"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: fileId
 *         in: path
 *         required: true
 *         type: string
 *         description: "文件ID"
 *     responses:
 *       200:
 *         description: "成功"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id: { type: string, description: "记录ID" }
 *                       fileId: { type: string, description: "文件ID" }
 *                       fileName: { type: string, description: "文件名称" }
 *                       action: { type: string, description: "操作类型：approve/reject/ban/unban" }
 *                       remark: { type: string, description: "审核备注" }
 *                       status: { type: integer, description: "审核状态：0-待审核，1-审核通过，2-审核拒绝" }
 *                       createdAt: { type: string, format: "date-time", description: "创建时间" }
 *                       updatedAt: { type: string, format: "date-time", description: "更新时间" }
 */
router.get('/records/file/:fileId', protect, authorize(2, 3), getAuditRecordsByFile);

module.exports = router;