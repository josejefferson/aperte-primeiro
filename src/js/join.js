const $roomID = document.querySelector('.roomID')
const $joinRoom = document.querySelector('.joinRoom')

$joinRoom.onclick = () => {
	location.href = '/room/' + $roomID.value
}