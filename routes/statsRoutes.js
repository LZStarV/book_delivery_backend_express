const express = require('express');
const router = express.Router();
const {
    getSystemOverview,
    getTodayStatistics,
    getWeekStatistics,
    getMonthStatistics,
    getAllStatistics,
    getUserStatistics,
    getAuditStatistics,
    getBanRecordStatistics,
    getFileStatusDistribution,
    getCategoryFileCount,
    getMonthlyUploads,
    getAuditorStats,
    getHotFiles
} = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/stats/overview:
 *   get:
 *     tags:
 *       - 统计
 *     summary: 获取系统总览统计 (管理员)
 *     description: "获取用户、文件、分类、标签等系统总览数据。"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "成功返回系统总览统计数据"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers: { type: integer }
 *                     totalFiles: { type: integer }
 *                     totalCategories: { type: integer }
 *                     totalTags: { type: integer }
 *                     todayUploads: { type: integer }
 *                     todayUsers: { type: integer }
 */
router.get('/overview', protect, authorize(3), getSystemOverview);

/**
 * @swagger
 * /api/v1/stats/today:
 *   get:
 *     tags:
 *       - 统计
 *     summary: 获取今日统计数据 (管理员)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "成功返回今日统计数据"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUploads: { type: integer }
 *                     totalUsers: { type: integer }
 *                     newFiles: { type: integer }
 *                     newUsers: { type: integer }
 */
router.get('/today', protect, authorize(3), getTodayStatistics);

/**
 * @swagger
 * /api/v1/stats/week:
 *   get:
 *     tags:
 *       - 统计
 *     summary: 获取本周统计数据 (管理员)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "成功返回本周统计数据"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUploads: { type: integer }
 *                     totalUsers: { type: integer }
 *                     newFiles: { type: integer }
 *                     newUsers: { type: integer }
 */
router.get('/week', protect, authorize(3), getWeekStatistics);

/**
 * @swagger
 * /api/v1/stats/month:
 *   get:
 *     tags:
 *       - 统计
 *     summary: 获取本月统计数据 (管理员)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "成功返回本月统计数据"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUploads: { type: integer }
 *                     totalUsers: { type: integer }
 *                     newFiles: { type: integer }
 *                     newUsers: { type: integer }
 */
router.get('/month', protect, authorize(3), getMonthStatistics);

/**
 * @swagger
 * /api/v1/stats/all:
 *   get:
 *     tags:
 *       - 统计
 *     summary: 获取所有统计数据 (管理员)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "成功返回所有统计数据"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers: { type: integer }
 *                     totalFiles: { type: integer }
 *                     totalCategories: { type: integer }
 *                     totalTags: { type: integer }
 *                     todayUploads: { type: integer }
 *                     todayUsers: { type: integer }
 */
router.get('/all', protect, authorize(3), getAllStatistics);

/**
 * @swagger
 * /api/v1/stats/users:
 *   get:
 *     tags:
 *       - 统计
 *     summary: 获取用户统计数据 (管理员)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "成功返回用户统计数据"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalUsers: { type: integer }
 *                     activeUsers: { type: integer }
 *                     suspendedUsers: { type: integer }
 *                     deletedUsers: { type: integer }
 */
router.get('/users', protect, authorize(3), getUserStatistics);

/**
 * @swagger
 * /api/v1/stats/files/audit:
 *   get:
 *     tags:
 *       - 统计
 *     summary: 获取文件审核统计数据 (管理员)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "成功返回文件审核统计数据"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalAudits: { type: integer }
 *                     passedAudits: { type: integer }
 *                     failedAudits: { type: integer }
 *                     pendingAudits: { type: integer }
 */
router.get('/files/audit', protect, authorize(3), getAuditStatistics);

/**
 * @swagger
 * /api/v1/stats/ban-record:
 *   get:
 *     tags:
 *       - 统计
 *     summary: 获取封禁记录统计数据 (管理员)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "成功返回封禁记录统计数据"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalBans: { type: integer }
 *                     activeBans: { type: integer }
 *                     expiredBans: { type: integer }
 */
router.get('/ban-record', protect, authorize(3), getBanRecordStatistics);

/**
 * @swagger
 * /api/v1/stats/file-status:
 *   get:
 *     tags:
 *       - 统计
 *     summary: 获取文件状态分布 (管理员)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "成功返回文件状态分布数据"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalFiles: { type: integer }
 *                     statusDistribution:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 */
router.get('/file-status', protect, authorize(3), getFileStatusDistribution);

/**
 * @swagger
 * /api/v1/stats/category-files:
 *   get:
 *     tags:
 *       - 统计
 *     summary: 获取分类文件数量 (管理员)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "成功返回分类文件数量数据"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCategories: { type: integer }
 *                     categoryFileCount:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 */
router.get('/category-files', protect, authorize(3), getCategoryFileCount);

/**
 * @swagger
 * /api/v1/stats/monthly-uploads:
 *   get:
 *     tags:
 *       - 统计
 *     summary: 获取月度上传统计 (管理员)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: months
 *         in: query
 *         type: integer
 *         default: 12
 *         description: "获取的月数"
 *     responses:
 *       200:
 *         description: "成功返回月度上传统计数据"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       month: { type: string }
 *                       year: { type: integer }
 *                       totalUploads: { type: integer }
 */
router.get('/monthly-uploads', protect, authorize(3), getMonthlyUploads);

/**
 * @swagger
 * /api/v1/stats/auditors:
 *   get:
 *     tags:
 *       - 统计
 *     summary: 获取审核员统计 (管理员)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "成功返回审核员统计数据"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalAuditors: { type: integer }
 *                     activeAuditors: { type: integer }
 *                     suspendedAuditors: { type: integer }
 */
router.get('/auditors', protect, authorize(3), getAuditorStats);

/**
 * @swagger
 * /api/v1/stats/hot-files:
 *   get:
 *     tags:
 *       - 统计
 *     summary: 获取热门文件 (公开)
 *     parameters:
 *       - name: limit
 *         in: query
 *         type: integer
 *         default: 10
 *         description: "返回数量限制"
 *     responses:
 *       200:
 *         description: "成功返回热门文件数据"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fileId: { type: string }
 *                       fileName: { type: string }
 *                       uploadDate: { type: string }
 *                       uploader: { type: string }
 */
router.get('/hot-files', getHotFiles);

module.exports = router;