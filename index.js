const express = require('express')
const app = express()

const http = require('http').Server(app)
const io = require('socket.io')(http)
const cookieParser = require('cookie-parser')
const routes = require('./helpers/routes')

require('./helpers/sockets')(io)
require('./helpers/routes')

app.use(cookieParser())
app.use(express.static('src'))
app.use('/', routes)

http.listen(process.env.PORT || 3000, () => {
	console.log('[SERVIDOR] Iniciado na porta 3000')
})

process.on('uncaughtException', console.error)