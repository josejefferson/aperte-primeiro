const $main = document.querySelector('main')
const $button = $main.querySelector('.button')
const siren = new Audio('../sounds/siren.mp3')
siren.loop = true

const options = {
	sound: localStorage.getItem('apertePrimeiro.option.sound') !== 'false',
	vibration: localStorage.getItem('apertePrimeiro.option.sound') !== 'false'
}

const socket = io(`${window.location.origin}/room`, {
	query: {
		room: new URL(location).pathname.split('/')[2]
	}
})

socket.onAny(console.log)

socket.on('connect', () => {
	$main.classList.add('connected')
})

socket.on('disconnect', () => {
	$main.classList.remove('connected')
})

socket.on('preparation', data => {
	$main.style.setProperty('--color-primary', chroma(data.color))
	$main.style.setProperty('--color-side', chroma(data.color).darken())
	$main.style.setProperty('--color-secondary', chroma(data.color).brighten(3))

	if (data.name === undefined) {
		setName()
	}
})

socket.on('name', ({ name } = {}) => {
	if (name === undefined) {
		setName()
	}
})

function setName() {
	Swal.fire({
		title: 'Digite seu nome',
		input: 'text',
		showCancelButton: true,
		cancelButtonText: 'Cancelar'
	}).then(result => {
		if (result.isConfirmed && result.value) {
			socket.emit('setName', result.value)
		} else {
			socket.emit('setName', null)
		}
	})
}

$main.addEventListener('mousedown', click)
$main.addEventListener('touchstart', click)

function click() {
	socket.emit('buttonPress')
}

let hitTime = null
socket.on('buttonPressed', () => {
	clearTimeout(hitTime)
	siren.currentTime = 0
	if (options.sound) siren.play()
	$main.classList.add('hit')
	hitTime = setTimeout(() => {
		$main.classList.remove('hit')
		siren.pause()
	}, 3000)
	if (options.vibration) navigator.vibrate(1000)
})

socket.on('roomClosed', () => {
	location.href = '/'
})