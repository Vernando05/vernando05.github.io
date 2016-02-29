(function (logoAnimation, undefined) {
	var animationLoopStart,
	logoPath = [],
	pathClass = ['triangle', 'triangle-bones1', 'triangle-bones2', 'triangle-bones3', 'triangle-inverted1', 'triangle-inverted2', 'triangle-inverted3'];

	function animateLogo(isRun) {
		if (isRun) {
			animationLoopStart = setInterval( function () {
				var pathNode = Array.prototype.slice.call(document.querySelectorAll('path'));
				for (var i = 0; i < pathNode.length; i++) {
					pathNode[i].classList.remove(pathClass[i]);
					document.getElementById('loader').offsetWidth;
					pathNode[i].classList.add(pathClass[i]);
				}
			}, 4010);
		} else {
			clearInterval(animationLoopStart);
		}
	}
	if (Modernizr.smil) {
		animateLogo(true);
	}
	logoAnimation.run = function (isRun) {
		animateLogo(isRun);
	};
})( window.logoAnimation = window.logoAnimation || {} );