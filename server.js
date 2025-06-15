const server = require('./app')

const PORT = 8080

server.listen(PORT, () => {
    console.log(`server is running at localhost:${PORT}`)
})