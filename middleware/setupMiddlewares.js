const path = require('path');
const cors = require('cors');

module.exports.setupMiddlewares = (app) => {
    // 中间件
    app.use(require('express').json());
    app.use(require('express').urlencoded({ extended: false }));
    app.use(cors());

    // 静态资源目录
    app.use('/public', require('express').static(path.join(__dirname, '../public')));
};