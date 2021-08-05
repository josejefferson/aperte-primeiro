const EventEmitter = require('events')
const Player = require('./Player')
const { randomString, randomColor } = require('../helpers/index')

const COLORS = ['red', 'green', 'blue', 'orange', 'purple', 'pink', 'aqua', 'lime', 'maroon', 'teal']
class Room extends EventEmitter {
	constructor(owner, id, players) {
		super()
		this.id = id || randomString(6).toLowerCase()
		this.owner = owner
		this.hittable = true
		this.players = players || []
	}

	connectedPlayer(sessionID, socket) {
		const existentPlayer = this.getPlayer(sessionID)
		const player = existentPlayer || new Player(sessionID)
		player.__proto__.socket = socket
		if (!existentPlayer) {
			player.setColor(this.availableColors()[0] || randomColor())
			this.players.push(player)
		}

		player.on('connect', () => this.emit('playerConnected', player))
		player.on('disconnect', () => this.emit('playerDisconnected', sessionID))
		player.on('buttonPress', () => this.emit('buttonPressed', sessionID))
		player.on('change', () => this.emit('playerChanged', player))
		return player
	}

	getPlayer(sessionID) {
		return this.players.find(player => {
			return player.sessionID === sessionID
		})
	}

	addPlayer(player) {
		this.players.push(player)
		this.emit('playerConnected', player)
	}

	rmPlayer(sessionID) {
		const index = this.players.findIndex(player => {
			return player.sessionID === sessionID
		})
		if (index > -1) {
			const player = this.players.splice(index, 1)[0]
			player.socket?.disconnect()
			this.emit('playerRemoved', player)
		}
	}

	buttonPress(sessionID) {
		if (this.hittable) {
			this.hittable = false
			setTimeout(() => {
				this.hittable = true
			}, 3000)
			this.getPlayer(sessionID).buttonPress()
		}
	}

	availableColors() {
		return COLORS.reduce((acc, color) => {
			if (this.players.some(p => p.color === color)) return acc
			acc.push(color)
			return acc
		}, [])
	}

	closeRoom() {
		this.emit('close')
	}
}

module.exports = Room