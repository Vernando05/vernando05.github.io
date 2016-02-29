(function () {
	'use strict';
	var timeout;		

	Modernizr.addTest('mix-blend-mode', function(){
		return Modernizr.testProp('mixBlendMode');
	});
	function loadPageStatus() {
		window.onload = function () {
			window.loaded = true;
			if (timeout) {
				onCompleteLoad();
			}
		};

		setTimeout( function () {
			if (window.loaded) {
				onCompleteLoad();
			}
			timeout = true;
		}, 2010);
	}
	loadPageStatus();
	function onCompleteLoad() {
		$("#load-screen").slideUp(1500, "easeInOutCubic", function () {
			$('body').addClass('animate-init');
			if (Modernizr.smil) {
				logoAnimation.run(false);
			}
		});
	}
	function animationEndCheck() {
		$('.triangle-inverted3').one("webkitAnimationEnd oanimationend msAnimationEnd animationend", function (event) {
			animationEnd = true;
		});
	}
	$(document).ready( function () {
		
		transformicons.add('.tcon');
		$('.tcon-menu--xcross').click(function () {
			$('body').toggleClass('show-nav');
			$('.main-menu').toggleClass('animate-main-menu');
		});
		
		$(function () {
			var $main = $('#main-content'),
				$body = $('body'),
				$nav = $('#main-nav a'),
				everPushed = false;

			$nav.click(function () {
				$body.removeClass('show-nav');
				$('.main-menu').removeClass('animate-main-menu');
				transformicons.toggle('.tcon-menu--xcross');
				var toLoad = $(this).attr("href");
				history.pushState(null, '', toLoad);
				everPushed = true;
				loadContent(toLoad);
				return false;
			});

			$(window).bind('popstate', function () {
				if (everPushed) {
					$.getScript(location.href);
				}
				everPushed = true;
			});

			function loadContent(href) {
				if (Modernizr.smil) {
					logoAnimation.run(true);
				}
				$('#load-screen').slideDown(1500, "easeInOutCubic", function () {
					$main.load(href + ' .main-page', function () {
						onCompleteLoad();
						contactForm();
					});
				});
			}
			return false;
		});
		$('.message-pop').click(function () {
			$(this).fadeTo("slow", 0, function () {
				$(this).hide();
			});
			$('#contact-form .form-group').fadeTo("slow", 1);
		});
		// Contact Validation
		var contactForm = function () {
			$("#contact-form").validate({
				rules: {
					name: {
						required: true,
						minlength: 2
					},
					_replyto: {
						required: true,
						minlength: 3,
						email: true,
					},
					message:  {
						required: true,
						minlength: 2
					}
				},
				messages: {
					name: {
						required: "Please enter your name",
						minlength: "Your name must consist of at least 2 characters"
					},
					_replyto: {
						required: "Please enter a valid email address",
						minlength: "Please enter a valid email address"
					},
					message: {
						required: "Please enter your message",
						minlength: "Your message must consist of at least 2 characters"
					},
				},
				submitHandler: function (form) {
					$('#contact-form .form-group').fadeTo("slow", 0.5, function() {
						$(this).find(':input').prop('disabled', true);
						$(this).find('label').css('cursor','default');
					});
					$.ajax({
						url: "//formspree.io/vernan@vernandosimbolon.com",
						method: "POST",
						data: $("#contact-form").serialize(),
						dataType: "json",
						success: function () {
							$('#success-message').fadeTo("slow", 1);
							$('#contact-form .form-group').fadeTo( "slow", 0.5, function() {
								$(this).find(':input').removeAttr('disabled');
								$(this).find('label').css('cursor','default');
							});
						},
						error: function (XMLHttpRequest, textStatus, errorThrown) {
							$('#error-message').fadeTo("slow", 1);
							$('#contact-form .form-group').fadeTo( "slow", 0.5, function () {
								$(this).find(':input').removeAttr('disabled');
								$(this).find('label').css('cursor','default');
							});
							//alert(errorThrown);
						} 
					});
				}
			});
		};
		contactForm();
		$( "body" ).mousemove(function( event ) {
			$(".bg-page").css('transform', 'translate(' + event.pageY /100 + 'px,' + -event.pageX /100 + 'px)');
		});
	});
})();
