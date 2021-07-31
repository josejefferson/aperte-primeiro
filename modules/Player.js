const EventEmitter = require('events')

class Player extends EventEmitter {
	constructor(id, color) {
		super()
		this.sessionID = id
		this.color = color
		this.connected = true
	}

	connect() {
		this.connected = true
		this.emit('connect')
	}

	disconnect() {
		this.connected = false
		this.emit('disconnect')
		this.removeAllListeners()
	}

	setColor(color) {
		this.color = color
		this.emit('color', color)
	}

	buttonPress() {
		this.emit('buttonPress')
	}
}

module.exports = Player