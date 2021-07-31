function randomString(length = 10, characters = 'abcdefghijklmnopqrstuvwxyz0123456789') {
	const charactersLength = characters.length
	let result = ''
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength))
	}
	return result
}

function randomColor() {
	return { h: Math.floor(Math.random() * 360), s: 1, l: 0.5 }
}

module.exports = {
	randomString,
	randomColor
}