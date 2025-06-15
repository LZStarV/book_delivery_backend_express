const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     tags:
 *       - 认证
 *     summary: 用户注册
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: "用户名"
 *               email:
 *                 type: string
 *                 description: "邮箱"
 *               password:
 *                 type: string
 *                 description: "密码"
 *               realName:
 *                 type: string
 *                 description: "真实姓名"
 *               phone:
 *                 type: string
 *                 description: "电话号码"
 *     responses:
 *       201:
 *         description: "注册成功，返回用户信息和Token"
 *       400:
 *         description: "缺少必填字段或用户已存在"
 */
router.post('/register', register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - 认证
 *     summary: 用户登录
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: "邮箱"
 *               password:
 *                 type: string
 *                 description: "密码"
 *     responses:
 *       200:
 *         description: "登录成功，返回用户信息和Token"
 *       401:
 *         description: "认证失败"
 */
router.post('/login', login);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     tags:
 *       - 认证
 *     summary: 用户登出
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "登出成功"
 */
router.post('/logout', protect, logout);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     tags:
 *       - 认证
 *     summary: 获取当前用户信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "成功返回当前用户信息"
 *       401:
 *         description: "未授权"
 */
router.get('/me', protect, getMe);

module.exports = router;