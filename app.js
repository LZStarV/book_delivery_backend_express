const express = require('express');
const { loadRoutes } = require('./utils/routeLoader');
const { setupMiddlewares } = require('./middleware/setupMiddlewares');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const swaggerInstall = require("./utils/swagger");
const { requestLogger } = require('./middleware/requestLogger');

const app = express();

// 安装 Swagger
swaggerInstall(app);

// 日志中间件
app.use(requestLogger);

// 设置中间件
setupMiddlewares(app);

// 动态加载路由
loadRoutes(app);

// 404 处理
app.use(notFound);

// 错误处理
app.use(errorHandler);

module.exports = app;