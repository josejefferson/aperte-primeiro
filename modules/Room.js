const EventEmitter = require('events')
const Player = require('./Player')
const { randomString, randomColor } = require('../helpers/index')

const COLORS = ['red', 'green', 'blue', 'orange', 'purple', 'pink']
class Room extends EventEmitter {
	constructor(id, players) {
		super()
		this.id = id || randomString(6).toLowerCase()
		this.hittable = true
		this.players = players || []
	}

	connectedPlayer(sessionID) {
		const existentPlayer = this.getPlayer(sessionID)
		const player = existentPlayer || new Player(sessionID)
		if (!existentPlayer) {
			player.setColor(this.availableColors()[0] || randomColor())
			this.players.push(player)
		}

		player.on('connect', () => this.emit('playerConnected', player))
		player.on('disconnect', () => this.emit('playerDisconnected', sessionID))
		player.on('buttonPress', () => this.emit('buttonPressed', sessionID))
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

	rmPlayer(playerID) {
		const index = this.players.findIndex(player => {
			return player.playerID === playerID
		})
		if (index > -1) {
			const player = this.players.splice(index, 1)[0]
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
}

module.exports = Room