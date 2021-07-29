const socket = io(`${window.location.origin}/admin`, {
	query: {
		room: new URL(location).pathname.split('/')[2]
	}
})

socket.on('preparation', console.log)
socket.on('hit', console.log)
socket.on('player', console.log)