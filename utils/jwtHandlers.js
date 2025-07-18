const jwt = require('jsonwebtoken')
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/constants')

// 生成 Token
const generateToken = (payload) => {
    return jwt.sign({ payload }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}


module.exports = { generateToken }