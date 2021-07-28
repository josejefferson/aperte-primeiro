const $roomID = document.querySelector('.room-id')
const $joinRoom = document.querySelector('.join')
const $newRoom = document.querySelector('.new')
const $roomNotFound = document.querySelector('.room-not-found')

if (new URLSearchParams(location.search).get('roomNotFound') === '') {
	$roomNotFound.classList.remove('hidden')
}

$joinRoom.addEventListener('click', e => {
	$roomID.reportValidity()
	if (!$roomID.checkValidity()) return
	location.href = '/room/' + $roomID.value
})

$newRoom.addEventListener('click', e => {
	location.href = '/newroom'
})