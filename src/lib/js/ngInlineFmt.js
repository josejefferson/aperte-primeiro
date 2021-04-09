angular.module('ngInlineFmt', [])
angular.module('ngInlineFmt').filter('inlineFmt', () => {
	return input => {
		return input
			.replace(/\*(\**[^*\n]+\**)\*/g, '<b>$1</b>')
			.replace(/\|(\|*[^\|\n]+\|*)\|/g, '<i>$1</i>')
			.replace(/_(_*[^_\n]+_*)_/g, '<u>$1</u>')
			.replace(/~(~*[^~\n]+~*)~/g, '<s>$1</s>')
			.replace(/`{3}(`*[^`\n]+`*)`{3}/g, '<code>$1</code>')
			.replace(/-{2}(-*[^-\n]+-*)-{2}/g, '<small>$1</small>')
			.replace(/\^(\^*[^\^\n]+\^*)\^/g, '<big>$1</big>')
	}
})