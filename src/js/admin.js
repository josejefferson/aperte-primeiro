const room = new URL(location).pathname.split('/')[2]
const roomURL = location.origin + '/room/' + room

const socket = io(`${location.origin}/admin`, {
	query: { room }
})

const $roomCode = document.querySelector('.room-details .room-code .code')
const $roomURL = document.querySelector('.room-details .url-box .url')
const $players = document.querySelector('.players .players-container')
const $playerTemplate = document.querySelector('.templates .player')
const $button = document.querySelector('.last-press .button')
const $buttonPlayerName = document.querySelector('.last-press .name')
const $recentColors = document.querySelector('.last-press .recent-colors')

$roomCode.innerText = room
$roomURL.innerText = roomURL

socket.onAny(console.log)

let players = []
socket.on('preparation', data => {
	players = []
	$players.innerHTML = ''
	data.players.forEach(makePlayer)
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

socket.on('buttonPressed', id => {
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

function makePlayer(player, update = false) {
	player.points = player.points || 0
	player.el = player.el || $playerTemplate.cloneNode(true)
	player.el.querySelector('.color').style.setProperty('--color', chroma(player.color))
	player.el.querySelector('.name').innerText = player.name || 'Jogador'
	player.el.querySelector('.points').innerText = player.points
	if (!player.connected) player.el.classList.add('disconnected')

	player.el.querySelector('.options .rename').addEventListener('click', () => {
		Swal.fire({
			title: `Renomear "${player.name}"`,
			input: 'text',
			inputValue: player.name,
			showCancelButton: true,
			cancelButtonText: 'Cancelar'
		}).then(result => {
			if (result.isConfirmed && result.value) {
				socket.emit('setPlayerName', { sessionID: player.sessionID, name: result.value })
			}
		})
	})
	player.el.querySelector('.options .change-color').addEventListener('click', () => {
		Swal.fire({
			title: `Mudar cor de "${player.name}"`,
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
			text: `Tem certeza que deseja remover o jogador "${player.name}"?`,
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