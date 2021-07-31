const express = require('express')
const routes = express.Router()
const Room = require('../modules/Room')
const { randomString } = require('../helpers/index')
const { sessions, rooms } = require('./data')

routes.use((req, res, next) => {
	let sessionID = req.cookies.session_id
	if (!sessionID || !sessions[sessionID]) {
		sessionID = randomString(64)
		sessions[sessionID] = {}
		res.cookie('session_id', sessionID, { maxAge: 100000000000 })
	}
	req.session = sessions[sessionID]
	next()
})

routes.get('/', (req, res) => {
	res.sendFile('src/pages/join.html', { root: '.' })
})

routes.get('/room/:id', (req, res) => {
	if (!rooms[req.params.id.toLowerCase()]) {
		return res.redirect('/?roomNotFound')
	}
	res.sendFile('src/pages/button.html', { root: '.' })
})

routes.get('/admin/:id', (req, res) => {
	if (!rooms[req.params.id.toLowerCase()]) {
		return res.redirect('/?roomNotFound')
	}
	res.sendFile('src/pages/admin.html', { root: '.' })
})

routes.get('/newroom', (req, res) => {
	const room = new Room()
	rooms[room.id] = room
	res.redirect('/admin/' + room.id)
})

routes.get('/debug', (req, res) => {
	res.json({ rooms, sessions })
})

module.exports = routes