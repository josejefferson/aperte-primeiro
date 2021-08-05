const EventEmitter = require('events')

class Player extends EventEmitter {
	constructor(id, color, name) {
		super()
		this.sessionID = id
		this.color = color
		this.name = name
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
		this.emit('change', this)
	}
	
	setName(name) {
		this.name = name
		this.emit('name', name)
		this.emit('change', this)
	}

	buttonPress() {
		this.emit('buttonPress')
	}
}

module.exports = Player