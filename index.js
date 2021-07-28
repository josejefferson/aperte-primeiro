console.clear()
const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const cookie = require('cookie')
const http = require('http').Server(app)
const io = require('socket.io')(http)
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
		hittable: true,
		players: []
	}
	res.redirect('/admin/' + roomID)
})

app.get('/debug', (req, res) => {
	res.json({ rooms, sessions })
})

http.listen(process.env.PORT || 3000, () => {
	console.log('[SERVIDOR] Iniciado na porta 3000')
})

process.on('uncaughtException', console.error)

io.of('/room').on('connection', socket => {
	// Verify session
	const cookies = cookie.parse(socket.handshake.headers.cookie || '')
	const sessionID = cookies.session_id
	if (!sessionID || !sessions[sessionID]) return socket.disconnect()

	// Verify room
	const roomID = socket.handshake.query.room
	const room = rooms[roomID]
	if (!roomID || !room) return socket.disconnect()

	socket.sessionID = sessionID
	socket.roomID = roomID
	socket.room = room

	socket.join(roomID)

	const existentPlayer = room.players.find(player => {
		return player.sessionID === socket.sessionID
	})

	const player = existentPlayer || {
		sessionID: sessionID,
		color: null,
		connected: true
	}
	player.connected = true

	// Set color and save new player
	if (!existentPlayer) {
		const availableColors = COLORS.reduce((acc, color) => {
			if (room.players.some(p => p.color === color)) return acc
			acc.push(color)
			return acc
		}, [])
		
		player.color = availableColors[0] || { h: randomInt(359), s: 1, l: 0.5 }
		room.players.push(player)
	}

	socket.emit('preparation', {
		color: player.color
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

function randomInt(max = 100, min = 0) {
	return Math.floor(Math.random() * (max - min + 1)) + min
}