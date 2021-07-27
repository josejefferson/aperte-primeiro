console.clear()
const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const cookie = require('cookie')
const http = require('http').Server(app)
const io = require('socket.io')(http)
let hittable = true
const rooms = {}

app.use(cookieParser())
app.use((req, res, next) => {
	let sessionID = req.cookies.session_id
	if (!sessionID || !sessions[sessionID]) {
		sessionID = randomString(64)
		sessions[sessionID] = {}
		res.cookie('session_id', sessionID, { maxAge: 100000000000 })
	}
	req.session = sessions[sessionID]
	next()
})
app.use(express.static('src'))

app.get('/room/:id', (req, res) => {
	if (!rooms[req.params.id]) return res.redirect('/')
	res.sendFile('pages/index.html', {root: '.'})
})

http.listen(process.env.PORT || 3000, () => {
	console.log('[SERVIDOR] Iniciado na porta 3000')
})

process.on('uncaughtException', console.error)

io.on('connection', socket => {
	socket.color = 'red'
	socket.emit('preparation', {
		color: 'red'
	})

	socket.on('press', () => {
		if (!hittable) return
		hittable = false
		io.emit('hit')
		setTimeout(() => {
			hittable = true
		}, 3000)
	})
})