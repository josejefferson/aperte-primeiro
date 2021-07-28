const $main = document.querySelector('main')
const $button = $main.querySelector('.button')

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

$button.addEventListener('mousedown', click)
$button.addEventListener('touchstart', click)

function click() {
	socket.emit('press')
}

let hitTime = null
socket.on('hit', () => {
	clearTimeout(hitTime)
	$main.classList.add('hit')
	hitTime = setTimeout(() => {
		$main.classList.remove('hit')
	}, 3000)
	navigator.vibrate(1000)
})
