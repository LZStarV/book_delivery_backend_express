const express = require('express');
const { setupMiddlewares } = require('./middleware/setupMiddlewares');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const swaggerInstall = require("./utils/swagger");
const { requestLogger } = require('./middleware/requestLogger');

// 静态导入各个路由
const auditRoutes = require('./routes/auditRoutes');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const fileRoutes = require('./routes/fileRoutes');
const statsRoutes = require('./routes/statsRoutes');
const tagRoutes = require('./routes/tagRoutes');
const userRoutes = require('./routes/userRoutes');
// 如有其它路由，请继续添加

const app = express();

// 安装 Swagger
swaggerInstall(app);

// 日志中间件
app.use(requestLogger);

// 设置中间件
setupMiddlewares(app);

// 静态注册路由
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/category', categoryRoutes);
app.use('/api/v1/file', fileRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/tag', tagRoutes);
app.use('/api/v1/user', userRoutes);
// 如有其它路由，请继续添加

// 404 处理
app.use(notFound);

// 错误处理
app.use(errorHandler);

module.exports = app;