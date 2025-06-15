const fs = require('fs');
const path = require('path');

/**
 * 动态加载并注册路由
 * @param {Express} app - Express应用实例
 * @param {string} routesPath - 路由文件路径
 * @returns {void}
 */
const loadRoutes = (app, routesPath = path.join(__dirname, '../routes')) => {
    try {
        // 读取路由目录下的所有文件
        const routeFiles = fs.readdirSync(routesPath)
            .filter(file => file.endsWith('.js') && !file.startsWith('index'));

        // 注册每个路由
        routeFiles.forEach(file => {
            const routeName = file.replace('.js', '');
            const router = require(path.join(routesPath, file));

            // 生成基础路由路径（例如：userRoutes.js -> /user）
            const basePath = `/${routeName.replace('Routes', '').toLowerCase()}`;

            console.log(`[路由加载] 注册路由: ${basePath} -> ${file}`);
            app.use(basePath, router);
        });
    } catch (error) {
        console.error('[路由加载错误]', error);
        throw error;
    }
};

module.exports = {
    loadRoutes
};