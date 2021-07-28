console.clear()
const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const cookie = require('cookie')
const http = require('http').Server(app)
const io = require('socket.io')(http)
let hittable = true
const rooms = { a: { hittable: true, players: [] } }
const sessions = {}
const COLORS = ['red', 'green', 'blue', 'orange', 'purple', 'pink']

app.use(cookieParser())
app.use((req, res, next) => {
	let sessionID = req.cookies.session_id
	if (!sessionID || !sessions[sessionID]) {
		sessionID = randomString(64)
		sessions[sessionID] = {}
		res.cookie('session_id', sessionID, { maxAge: 100000000000 })
	}
	req.session = sessions[sessionID]
	next()
})
app.use(express.static('src'))

app.get('/room/:id', (req, res) => {
	if (!rooms[req.params.id]) return res.redirect('/?roomNotFound')
	res.sendFile('pages/index.html', { root: '.' })
})

app.get('/admin/:id', (req, res) => {
	if (!rooms[req.params.id]) return res.redirect('/?roomNotFound')
	res.sendFile('pages/admin.html', { root: '.' })
})

app.get('/newroom', (req, res) => {
	const roomID = randomString(6)
	rooms[roomID] = {
		hittable: true, players: [{
			sessionID: 'adsdsadsadsad',
			color: 'asdsadas',
			connected: true
		}]
	}
	res.redirect('/admin/' + roomID)
})

app.get('/debug', (req, res) => {
	res.json({rooms, sessions})
})

http.listen(process.env.PORT || 3000, () => {
	console.log('[SERVIDOR] Iniciado na porta 3000')
})

process.on('uncaughtException', console.error)

io.of('/room').on('connection', socket => {
	const cookies = cookie.parse(socket.handshake.headers.cookie || '')
	const sessionID = cookies.session_id
	const roomID = socket.handshake.query.room
	if (!sessionID || !roomID) return socket.disconnect()
	const room = rooms[roomID]
	if (!room) return socket.disconnect()
	socket.sessionID = sessionID
	socket.roomID = roomID
	socket.room = room
	socket.join(roomID)

	const oldRoom = room.players.find(e => e.sessionID === sessionID)
	if (oldRoom) {
		socket.color = oldRoom.color
	} else {
		const availableColors = COLORS.reduce((acc, color) => {
			const used = room.players.some(p => {
				return p.color === color
			})
			if (used) return acc
			acc.push(color)
			return acc
		}, [])
		if (!availableColors[0]) {
			socket.color = { h: Math.floor(Math.random() * 360), s: 1, l: 0.5 }
		} else {
			socket.color = availableColors[0]
		}
	}

	const player = oldRoom || {
		sessionID: sessionID,
		color: socket.color,
		connected: true
	}
	player.connected = true
	if (!oldRoom) room.players.push(player)

	socket.emit('preparation', {
		color: socket.color
	})

	socket.on('press', () => {
		if (!room.hittable) return
		room.hittable = false
		socket.emit('hit')
		setTimeout(() => {
			room.hittable = true
		}, 3000)
	})

	socket.on('disconnect', () => {
		player.connected = false
	})
})

io.of('/admin').on('connection', socket => {

})

function randomString(length = 10, characters = 'abcdefghijklmnopqrstuvwxyz0123456789') {
	const charactersLength = characters.length
	let result = ''
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength))
	}
	return result
}