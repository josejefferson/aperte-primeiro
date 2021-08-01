class Player {
	constructor(id, color, connected, name) {
		this.sessionID = id
		this.color = color
		this.connected = connected
		this.name = name || 'Player'
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
