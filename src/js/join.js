// JOIN OU CREATE ROOM
const $roomID = document.querySelector('.room-id')
const $joinRoom = document.querySelector('.join')
const $newRoom = document.querySelector('.new')
const $roomNotFound = document.querySelector('.room-not-found')
const $accessRestrict = document.querySelector('.access-restrict')

// Room not found
if (new URLSearchParams(location.search).get('roomNotFound') === '') {
	$roomNotFound.classList.remove('hidden')
}

// Access restrict
if (new URLSearchParams(location.search).get('accessRestrict') === '') {
	$accessRestrict.classList.remove('hidden')
}

// Join room
$joinRoom.addEventListener('click', enterRoom)
$roomID.addEventListener('keypress', e => {
	if (e.key === 'Enter') enterRoom()
})

function enterRoom() {
	$roomID.reportValidity()
	if (!$roomID.checkValidity()) return
	location.href = '/room/' + $roomID.value
}

// Create room
$newRoom.addEventListener('click', e => {
	location.href = '/newroom'
})


// OPTIONS
const $optionSound = document.querySelector('.options .option.sound input')
const $optionVibration = document.querySelector('.options .option.vibration input')
$optionSound.checked = localStorage.getItem('apertePrimeiro.option.sound') !== 'false'
$optionVibration.checked = localStorage.getItem('apertePrimeiro.option.vibration') !== 'false'

$optionSound.addEventListener('change', function () {
	localStorage.setItem('apertePrimeiro.option.sound', this.checked)
})

$optionVibration.addEventListener('change', function () {
	localStorage.setItem('apertePrimeiro.option.vibration', this.checked)
})