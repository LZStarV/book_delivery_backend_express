const express = require('express');
const router = express.Router();
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryFiles
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     tags:
 *       - 分类
 *     summary: 获取所有分类
 *     description: "获取所有分类信息。"
 *     responses:
 *       200:
 *         description: "成功返回所有分类"
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
 *                       id: { type: integer }
 *                       name: { type: string }
 *                       description: { type: string }
 *                       parentId: { type: integer }
 *                       sortOrder: { type: integer }
 *                       status: { type: integer }
 */
router.get('/', getAllCategories);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     tags:
 *       - 分类
 *     summary: 获取分类详情
 *     description: "根据分类ID获取分类详情。"
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: "分类ID"
 *     responses:
 *       200:
 *         description: "成功返回分类详情"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     name: { type: string }
 *                     description: { type: string }
 *                     parentId: { type: integer }
 *                     sortOrder: { type: integer }
 *                     status: { type: integer }
 *       404:
 *         description: "分类不存在"
 */
router.get('/:id', getCategoryById);

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     tags:
 *       - 分类
 *     summary: 创建分类 (志愿者/管理员)
 *     description: "创建新分类，分类名称不可重复。"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, description: "分类名称" }
 *               description: { type: string, description: "分类描述" }
 *               parentId: { type: integer, description: "父分类ID" }
 *               sortOrder: { type: integer, description: "排序顺序" }
 *               status: { type: integer, description: "状态(1:启用,0:禁用)" }
 *     responses:
 *       201:
 *         description: "创建成功"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { type: object }
 *       400:
 *         description: "缺少必填字段或分类已存在"
 */
router.post('/', protect, authorize(2, 3), createCategory);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     tags:
 *       - 分类
 *     summary: 更新分类 (志愿者/管理员)
 *     description: "更新指定ID的分类信息。"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: "分类ID"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, description: "分类名称" }
 *               description: { type: string, description: "分类描述" }
 *               parentId: { type: integer, description: "父分类ID" }
 *               sortOrder: { type: integer, description: "排序顺序" }
 *               status: { type: integer, description: "状态(1:启用,0:禁用)" }
 *     responses:
 *       200:
 *         description: "更新成功"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { type: object }
 *       404:
 *         description: "分类不存在"
 */
router.put('/:id', protect, authorize(2, 3), updateCategory);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     tags:
 *       - 分类
 *     summary: 删除分类 (管理员)
 *     description: "删除指定ID的分类，若分类下有子分类或文件则无法删除。"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
 *         description: "分类ID"
 *     responses:
 *       200:
 *         description: "删除成功"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *       400:
 *         description: "分类下存在子分类或文件"
 *       404:
 *         description: "分类不存在"
 */
router.delete('/:id', protect, authorize(3), deleteCategory);

/**
 * @swagger
 * /api/v1/categories/{id}/files:
 *   get:
 *     tags:
 *       - 分类
 *     summary: 获取分类下的文件
 *     description: "分页获取指定分类下的文件。"
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         type: string
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
 *         description: "成功返回分类下的文件列表"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 data: { type: array, items: { type: object } }
 *       404:
 *         description: "分类不存在"
 */
router.get('/:id/files', getCategoryFiles);

module.exports = router;