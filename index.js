console.clear()
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.use(express.static('src'))

http.listen(process.env.PORT || 3000, () => {
	console.log('[SERVIDOR] Iniciado na porta 3000')
})

process.on('uncaughtException', console.error)

let hittable = true
io.on('connection', socket => {
	socket.on('selectColor', (color) => {
		if (!['green', 'red'].includes(color)) return
		socket.join(color)
		socket.emit('selectColor', '')
		socket.emit('locked', false)
	})

	socket.on('press', (color) => {
		if (!hittable) return
		hittable = false
		io.to(color).emit('hit')
		setTimeout(() => {
			hittable = true
		}, 3000)
	})
})