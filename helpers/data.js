const Room = require('../modules/Room')

const data = {
	rooms: {},
	sessions: {}
}

if (process.env.NODE_ENV === 'development') {
	data.rooms['aaaaaa'] = new Room(null, 'aaaaaa')
}

module.exports = data
