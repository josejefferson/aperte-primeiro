const cookie = require('cookie')
const { sessions, rooms } = require('./data')

module.exports = io => {
	io.of('/room').use(middleware)
	io.of('/admin').use(middleware)

	function middleware(socket, next) {
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
			socket.emit('preparation', player)
		})

		player.on('buttonPress', () => {
			socket.emit('buttonPressed')
		})

		socket.on('buttonPress', () => socket.room.buttonPress(socket.sessionID))
		socket.on('disconnect', () => player.disconnect())
		player.connect()
	})


	io.of('/admin').on('connection', socket => {
		const room = socket.room
		socket.emit('preparation', room)

		room.on('playerConnected', player => {
			socket.emit('playerConnected', player)
		})

		room.on('playerDisconnected', sessionID => {
			socket.emit('playerDisconnected', sessionID)
		})

		room.on('playerRemoved', sessionID => {
			socket.emit('playerRemoved', sessionID)
		})
		
		room.on('buttonPressed', sessionID => {
			socket.emit('buttonPressed', sessionID)
		})

		socket.on('disconnect', () => room.removeAllListeners())
	})
}