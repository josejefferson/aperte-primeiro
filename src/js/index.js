const $main = document.querySelector('main')
const $button = $main.querySelector('.button')
const siren = new Audio('../sounds/siren.mp3')
siren.loop = true

const socket = io(`${window.location.origin}/room`, {
	query: {
		room: new URL(location).pathname.split('/')[2]
	}
})

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
})

$main.addEventListener('mousedown', click)
$main.addEventListener('touchstart', click)

function click() {
	socket.emit('press')
}

let hitTime = null
socket.on('hit', () => {
	clearTimeout(hitTime)
	siren.play()
	$main.classList.add('hit')
	hitTime = setTimeout(() => {
		$main.classList.remove('hit')
		siren.pause()
		siren.currentTime = 0
	}, 3000)
	navigator.vibrate(1000)
})
