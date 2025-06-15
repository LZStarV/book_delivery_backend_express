const server = require('./app')

const PORT = 80

server.listen(PORT, () => {
    console.log(`server is running at localhost:${PORT}`)
})