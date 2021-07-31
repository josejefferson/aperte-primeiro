const cookie = require('cookie')
const { sessions, rooms } = require('./data')

module.exports = io => {
	// Verify session and room
	io.of('/room').use(a)
	io.of('/admin').use(a)
	
	function a(socket, next) {
		const cookies = cookie.parse(socket.handshake.headers.cookie || '')
		const sessionID = cookies.session_id
		if (!sessionID || !sessions[sessionID]) return socket.disconnect()
	
		const roomID = socket.handshake.query.room.toLowerCase()
		const room = rooms[roomID]
		if (!roomID || !room) return socket.disconnect()
		socket.join(roomID)
	
		socket.sessionID = sessionID
		socket.roomID = roomID
		socket.room = room
	
		next()
	}


	io.of('/room').on('connection', socket => {
		const player = socket.room.connectedPlayer(socket.sessionID)

		player.once('connect', () => {
			socket.emit('preparation', { color: player.color })
		})

		player.on('hit', () => {
			socket.emit('hit')
			io.of('/admin').to(socket.roomID).emit('hit', { id: socket.sessionID })
		})

		player.connect()
		socket.on('press', () => socket.room.buttonPress(socket.sessionID))
		socket.on('disconnect', () => player.disconnect())
	})


	io.of('/admin').on('connection', socket => {
		const room = socket.room
		socket.emit('preparation', room)

		room.on('playerConnected', player => {
			socket.emit('playerConnected', player)
		})
		
		room.on('playerDisconnected', player => {
			socket.emit('playerDisconnected', player)
		})

		room.on('playerRemoved', player => {
			socket.emit('playerRemoved', player)
		})
	})
}