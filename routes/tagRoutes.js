const express = require('express');
const router = express.Router();
const {
    getAllTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag,
    getHotTags
} = require('../controllers/tagController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/tags:
 *   get:
 *     tags:
 *       - 标签
 *     summary: 获取所有固定标签
 *     description: "获取所有固定标签（不含用户自定义标签）。"
 *     responses:
 *       200:
 *         description: "成功返回所有固定标签"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data: { type: array, items: { type: object } }
 */
router.get('/', getAllTags);

/**
 * @swagger
 * /api/v1/tags/{id}:
 *   get:
 *     tags:
 *       - 标签
 *     summary: 获取标签详情
 *     description: "根据标签ID获取标签详情及被使用的文件数量。"
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *         description: "标签ID"
 *     responses:
 *       200:
 *         description: "成功返回标签详情"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: object }
 *       404:
 *         description: "标签不存在"
 */
router.get('/:id', getTagById);

/**
 * @swagger
 * /api/v1/tags:
 *   post:
 *     tags:
 *       - 标签
 *     summary: 创建固定标签 (志愿者/管理员)
 *     description: "创建新的固定标签，标签名称不可重复。"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, description: "标签名称" }
 *               description: { type: string, description: "标签描述" }
 *               status: { type: integer, description: "状态(1:启用,0:禁用)" }
 *     responses:
 *       201:
 *         description: "标签创建成功"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { type: object }
 *       400:
 *         description: "缺少必填字段或标签已存在"
 */
router.post('/', protect, authorize(2, 3), createTag);

/**
 * @swagger
 * /api/v1/tags/{id}:
 *   put:
 *     tags:
 *       - 标签
 *     summary: 更新固定标签 (志愿者/管理员)
 *     description: "更新指定ID的固定标签信息。"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *         description: "标签ID"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, description: "标签名称" }
 *               description: { type: string, description: "标签描述" }
 *               status: { type: integer, description: "状态(1:启用,0:禁用)" }
 *     responses:
 *       200:
 *         description: "标签更新成功"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { type: object }
 *       404:
 *         description: "标签不存在"
 */
router.put('/:id', protect, authorize(2, 3), updateTag);

/**
 * @swagger
 * /api/v1/tags/{id}:
 *   delete:
 *     tags:
 *       - 标签
 *     summary: 删除固定标签 (管理员)
 *     description: "删除指定ID的固定标签，若标签被文件使用则无法删除。"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: integer
 *         description: "标签ID"
 *     responses:
 *       200:
 *         description: "标签删除成功"
 *       400:
 *         description: "标签正在被使用，无法删除"
 *       404:
 *         description: "标签不存在"
 */
router.delete('/:id', protect, authorize(3), deleteTag);

/**
 * @swagger
 * /api/v1/tags/hot:
 *   get:
 *     tags:
 *       - 标签
 *     summary: 获取热门标签
 *     description: "获取被使用次数最多的标签。"
 *     parameters:
 *       - name: limit
 *         in: query
 *         type: integer
 *         default: 10
 *         description: "返回数量限制"
 *     responses:
 *       200:
 *         description: "成功返回热门标签列表"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data: { type: array, items: { type: object } }
 */
router.get('/hot', getHotTags);

module.exports = router;