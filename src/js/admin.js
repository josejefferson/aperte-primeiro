window.addEventListener('load', () => {
	document.body.classList.remove('preload')
})

const socket = io(`${window.location.origin}/admin`, {
	query: {
		room: new URL(location).pathname.split('/')[2]
	}
})

socket.onAny(console.log)