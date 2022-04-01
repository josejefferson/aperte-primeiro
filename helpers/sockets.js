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
		const player = socket.room.connectedPlayer(socket.sessionID, socket)

		player.once('connect', () => {
			socket.emit('preparation', player)
		})

		player.on('ping', (id) => {
			socket.emit('ping', id)
		})

		player.on('buttonPress', () => {
			socket.emit('buttonPressed')
		})

		player.on('color', () => {
			socket.emit('preparation', player)
		})

		player.on('name', name => {
			socket.emit('name', { name })
		})

		player.on('disconnect', () => {
			socket.disconnect()
		})

		socket.room.on('close', () => {
			socket.emit('roomClosed')
			socket.disconnect()
		})

		socket.on('pong', id => player.emit('pong', id))
		socket.on('setName', name => player.setName(name))
		socket.on('buttonPress', () => socket.room.buttonPress(socket.sessionID))
		socket.on('disconnect', () => player.disconnect())
		player.connect()
	})


	io.of('/admin').on('connection', socket => {
		if (socket.room.owner && (socket.sessionID !== socket.room.owner)) {
			return socket.disconnect()
		}

		const room = socket.room
		socket.emit('preparation', room)

		room.on('playerConnected', player => {
			socket.emit('playerConnected', player)
		})

		room.on('playerDisconnected', sessionID => {
			socket.emit('playerDisconnected', sessionID)
		})

		room.on('playerRemoved', player => {
			socket.emit('playerRemoved', player.sessionID)
		})

		room.on('playerChanged', player => {
			socket.emit('playerChanged', player)
		})

		room.on('buttonPressed', sessionID => {
			socket.emit('buttonPressed', sessionID)
		})

		room.on('close', () => {
			socket.emit('roomClosed')
			socket.disconnect()
		})

		socket.on('setPlayerColor', playerData => {
			const player = room.getPlayer(playerData.sessionID)
			if (player) player.setColor(playerData.color)
		})

		socket.on('setPlayerName', playerData => {
			const player = room.getPlayer(playerData.sessionID)
			if (player) player.setName(playerData.name)
		})

		socket.on('rmPlayer', sessionID => {
			room.rmPlayer(sessionID)
		})

		socket.on('closeRoom', () => {
			room.closeRoom()
			delete rooms[socket.roomID]
		})

		socket.on('disconnect', () => room.removeAllListeners())
	})
}