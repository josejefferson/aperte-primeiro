const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const cookieParser = require('cookie-parser')
const routes = require('./helpers/routes')

require('./helpers/sockets')(io)
require('./helpers/routes')

app.use(cookieParser())
app.use(express.static(process.env.NODE_ENV === 'development' ? 'src' : 'dist'))
app.use('/', routes)

const PORT = process.env.PORT || 3000
http.listen(PORT, () => {
	console.log('[SERVIDOR] Iniciado na porta ' + PORT)
})

process.on('uncaughtException', console.error)