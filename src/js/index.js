angular.module('apertePrimeiro', []).controller('apertePrimeiroCtrl', ['$scope', ($scope) => {
	const socket = io()
	let penaltyTime, hitTime
	
	$scope.state = {
		preparation: true,
		color: null,
		locked: true,
		penalty: false,
		hit: false
	}
	
	$scope.selectColor = (color) => {
		socket.emit('selectColor', color)
		socket.on('selectColor', () => {
			socket.off('selectColor')
			$scope.state.preparation = false
			$scope.state.color = color
			$scope.$apply()
		})
	}
	
	$scope.press = () => {
		socket.emit('press', $scope.state.color)
	}
	
	socket.on('locked', (locked) => {
		$scope.state.locked = locked
		$scope.$apply()
	})
	
	socket.on('penalty', (time) => {
		clearTimeout(penaltyTime)
		$scope.state.penalty = true
		penaltyTime = setTimeout(() => {
			$scope.state.penalty = false
			$scope.$apply()
		}, time)
		$scope.$apply()
	})
	
	socket.on('hit', () => {
		clearTimeout(hitTime)
		$scope.state.hit = true
		hitTime = setTimeout(() => {
			$scope.state.hit = false
			$scope.$apply()
		}, 3000)
		$scope.$apply()
	})

	document.querySelector('.main').addEventListener('mousedown', $scope.press)
	document.querySelector('.main').addEventListener('touchstart', $scope.press)
}])