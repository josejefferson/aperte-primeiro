const $roomCode = document.querySelector('.room-details .room-code .code')
const $roomURL = document.querySelector('.room-details .url-box .url')
const $copyCode = document.querySelector('.room-details .room-code .copy-code')
const $copyURL = document.querySelector('.room-details .room-code .copy-url')
const $players = document.querySelector('.players .players-container')
const $playerTemplate = document.querySelector('.templates .player')
const $button = document.querySelector('.last-press .button')
const $buttonPlayerName = document.querySelector('.last-press .name')
const $recentColors = document.querySelector('.last-press .recent-colors')
const $qrCode = document.querySelector('.room-details .qr-code')
const $closeRoom = document.querySelector('.room-details .close-room')

$closeRoom.addEventListener('click', () => {
	Swal.fire({
		title: 'Fechar sala',
		text: 'Tem certeza que deseja fechar a sala? Todos os jogadores serão desconectados e a sala será excluída!',
		showDenyButton: true,
		confirmButtonText: 'Sim',
		denyButtonText: 'Não',
		focusDeny: true
	}).then(result => {
		if (result.isConfirmed) socket.emit('closeRoom')
	})
})

const siren = new Audio('../sounds/siren.mp3')
siren.loop = true

const options = {
	sound: localStorage.getItem('apertePrimeiro.option.sound') !== 'false',
	vibration: localStorage.getItem('apertePrimeiro.option.sound') !== 'false'
}

const room = new URL(location).pathname.split('/')[2]
const roomURL = location.origin + '/room/' + room
$roomCode.innerText = room
$roomURL.innerText = roomURL
new QRCode($qrCode, {
	text: roomURL,
	colorDark: '#000',
	colorLight: 'transparent',
	correctLevel: QRCode.CorrectLevel.L
})

let players = []
const socket = io(`${location.origin}/admin`, {
	query: { room }
})

socket.onAny(console.log)

socket.on('preparation', data => {
	players = []
	$players.innerHTML = ''
	data.players.forEach(player => makePlayer(player))
})

socket.on('playerConnected', player => {
	const play = players.find(p => {
		return p.sessionID === player.sessionID
	})
	if (!play) makePlayer(player)
	else {
		play.el.classList.remove('disconnected')
	}
})

socket.on('playerDisconnected', id => {
	const play = players.find(p => {
		return p.sessionID === id
	})
	if (play) play.el.classList.add('disconnected')
})

socket.on('playerRemoved', id => {
	const index = players.findIndex(player => player.sessionID === id)
	if (index > -1) {
		players[index].el.remove()
		players.splice(index, 1)
	}
})

socket.on('playerChanged', player => {
	const play = players.find(p => {
		return p.sessionID === player.sessionID
	})
	if (play) {
		Object.assign(play, player)
		makePlayer(play, true)
	}
})

let hitTime
socket.on('buttonPressed', id => {
	clearTimeout(hitTime)
	siren.currentTime = 0
	if (options.sound) siren.play()
	if (options.vibration) navigator.vibrate(1000)
	hitTime = setTimeout(() => {
		siren.pause()
	}, 3000)

	const play = players.find(p => {
		return p.sessionID === id
	})
	if (play) {
		$button.style.setProperty('--button-color', chroma(play.color))
		$button.style.setProperty('--shadow-color', chroma(play.color).alpha(0.5))
		$button.classList.remove('animated')
		void $button.offsetWidth
		$button.classList.add('animated')
		$buttonPlayerName.innerText = play.name || 'Player'
		makeRecentColors(play.color)

		play.points++
		play.el.querySelector('.points').innerText = play.points
		players.forEach(player => player.el.classList.remove('press'))
		void play.el.offsetWidth
		play.el.classList.add('press')
	}
})

socket.on('roomClosed', () => {
	location.href = '/'
})

function makePlayer(player, update = false) {
	player.points = player.points || 0
	player.pingTime = player.pingTime >= 1000 ? '+999ms' : (player.pingTime ? player.pingTime + 'ms' : '')
	player.el = player.el || $playerTemplate.cloneNode(true)
	player.el.querySelector('.color').style.setProperty('--color', chroma(player.color))
	player.el.querySelector('.name').innerText = player.name || '[Jogador]'
	player.el.querySelector('.points').innerText = player.points
	player.el.querySelector('.ping').innerText = player.pingTime
	if (!player.connected) player.el.classList.add('disconnected')

	player.el.querySelector('.options .rename').addEventListener('click', () => {
		Swal.fire({
			title: `Renomear "${player.name || '[Jogador]'}"`,
			input: 'text',
			inputValue: player.name || '',
			showCancelButton: true,
			cancelButtonText: 'Cancelar'
		}).then(result => {
			if (result.isConfirmed) {
				socket.emit('setPlayerName', { sessionID: player.sessionID, name: result.value || undefined })
			}
		})
	})
	player.el.querySelector('.options .change-color').addEventListener('click', () => {
		Swal.fire({
			title: `Mudar cor de "${player.name || '[Jogador]'}"`,
			input: 'text',
			showCancelButton: true,
			cancelButtonText: 'Cancelar'
		}).then(result => {
			if (result.isConfirmed && result.value) {
				socket.emit('setPlayerColor', { sessionID: player.sessionID, color: result.value })
			}
		})
	})
	player.el.querySelector('.options .remove').addEventListener('click', () => {
		Swal.fire({
			title: 'Remover jogador',
			text: `Tem certeza que deseja remover o jogador "${player.name || '[Jogador]'}"?`,
			showDenyButton: true,
			confirmButtonText: 'Sim',
			denyButtonText: 'Não',
			focusDeny: true
		}).then(result => {
			if (result.isConfirmed) socket.emit('rmPlayer', player.sessionID)
		})
	})
	player.el.querySelector('.options .decrease-score').addEventListener('click', () => {
		player.points--
		player.el.querySelector('.points').innerText = player.points
	})
	player.el.querySelector('.options .increase-score').addEventListener('click', () => {
		player.points++
		player.el.querySelector('.points').innerText = player.points
	})


	if (!update) {
		$players.appendChild(player.el)
		players.push(player)
	}
}

let recentColors = []
function makeRecentColors(newColor) {
	recentColors.unshift(newColor)
	recentColors = recentColors.slice(0, 6)
	$recentColors.innerHTML = '';
	([...recentColors]).reverse().forEach((color, i) => {
		if (i === recentColors.length - 1) return
		const $el = document.createElement('div')
		$el.classList.add('color')
		$el.style.setProperty('--color', chroma(color))
		$recentColors.appendChild($el)
	})
}

$copyCode.addEventListener('click', () => { copy(room) })
$copyURL.addEventListener('click', () => { copy(roomURL) })

function copy(text) {
	const el = document.createElement('textarea')
	el.value = text
	document.body.appendChild(el)
	el.select()
	document.execCommand('copy')
	document.body.removeChild(el)
}