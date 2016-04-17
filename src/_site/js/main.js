(function () {
	'use strict';
	var timeout;		

	Modernizr.addTest('mix-blend-mode', function(){
		return Modernizr.testProp('mixBlendMode');
	});
	function loadPageStatus() {
		window.onload = function () {
			window.loaded = true;
			if(document.getElementById("particles-object")){
				particleSquare();
			}		
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
	function particleSquare() {
		var container;
		var camera, scene, renderer, particles, geometry, materials = [], parameters, i, h, color, size;
		var mouseX = 0, mouseY = 0;
		var windowHalfX = window.innerWidth / 2;
		var windowHalfY = window.innerHeight / 2;
		var objImg = document.getElementById('particles-object');
		var objImgHeight = objImg.clientHeight;
		var objImgWidth = objImg.clientWidth;

		init();

		animate();

		function init() {
			container = document.createElement('div');
			container.id = 'bg-particles';
			document.getElementById('particles-wrap').appendChild(container);
			camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
			camera.position.z = 1000;
			scene = new THREE.Scene();
			scene.fog = new THREE.FogExp2(0xffffff, 0);
			geometry = new THREE.Geometry();
			for (i = 0; i < 1000; i ++) {
				var vertex = new THREE.Vector3();
				vertex.x = Math.random() * 2000 - 1000;
				vertex.y = Math.random() * 2000 - 1000;
				vertex.z = Math.random() * 2000 - 1000;
				geometry.vertices.push(vertex);
			}
			parameters = [
				[0.30, 5],
				[0.45, 4],
				[0.60, 3],
				[0.75, 2],
				[0.80, 1]
			];
			for (i = 0; i < parameters.length; i ++) {
				color = parameters[i][0];
				size  = parameters[i][1];
				materials[i] = new THREE.PointsMaterial({ size: size });
				particles = new THREE.Points(geometry, materials[i]);
				particles.rotation.x = Math.random() * 6;
				particles.rotation.y = Math.random() * 6;
				particles.rotation.z = Math.random() * 6;
				scene.add(particles);
			}
			renderer = new THREE.WebGLRenderer({alpha: true});
			renderer.setClearColor(0xffffff, 0);
			renderer.setPixelRatio(window.devicePixelRatio);
			renderer.setSize(objImgWidth, objImgHeight);
			container.appendChild(renderer.domElement);
			document.addEventListener('mousemove', onDocumentMouseMove, false);
			document.addEventListener('touchstart', onDocumentTouchStart, false);
			document.addEventListener('touchmove', onDocumentTouchMove, false);		
			window.addEventListener('resize', onWindowResize, false);
		}
		function onWindowResize() {
			windowHalfX = window.innerWidth / 2;
			windowHalfY = window.innerHeight / 2;
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			objImgWidth = objImg.clientHeight;
			objImgHeight = objImg.clientWidth;
			renderer.setSize(objImgWidth, objImgHeight);
		}
		function onDocumentMouseMove(event) {
			mouseX = event.clientX - windowHalfX;
			mouseY = event.clientY - windowHalfY;
		}
		function onDocumentTouchStart(event) {
			if ( event.touches.length === 1 ) {
				event.preventDefault();
				mouseX = event.touches[ 0 ].pageX - windowHalfX;
				mouseY = event.touches[ 0 ].pageY - windowHalfY;
			}
		}
		function onDocumentTouchMove(event) {
			if (event.touches.length === 1) {
				event.preventDefault();
				mouseX = event.touches[0].pageX - windowHalfX;
				mouseY = event.touches[0].pageY - windowHalfY;
			}
		}
		function animate() {
			requestAnimationFrame(animate);
			render();
		}
		function render() {
			var time = Date.now() * 0.00005;
			camera.position.x += (mouseX - camera.position.x) * 0.05;
			camera.position.y += (-mouseY - camera.position.y) * 0.05;
			camera.lookAt(scene.position);
			for (i = 0; i < scene.children.length; i ++) {
				var object = scene.children[i];
				if (object instanceof THREE.Points) {
					object.rotation.y = time * (i < 4 ? i + 1 : - ( i + 1 ));
				}
			}
			for (i = 0; i < materials.length; i ++) {
				color = parameters[i][0];
				//h = ( 360 * ( color[0] + time ) % 360 ) / 360;
				materials[i].color.setHSL(0, 0, color);
			}
			renderer.render(scene, camera);
		}
	}
	$(document).ready(function () {
		
		transformicons.add('.tcon');
		$('.tcon-menu--xcross').click(function () {
			$('body').toggleClass('show-nav');
			$('.main-menu').toggleClass('animate-main-menu');
		});
		
		$(function () {
			var $main = $('#main-content'),
				$body = $('body'),
				$nav = $('.link-internal'),
				$tcon = $('.tcon'),
				everPushed = false;

			$nav.click(function () {
				$body.removeClass('show-nav');
				$body.removeClass('animate-init');
				$('.main-menu').removeClass('animate-main-menu');
				if ($tcon.hasClass('tcon-transform')) {
					transformicons.revert('.tcon-menu--xcross');				
				}	
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
						if(document.getElementById("particles-object")){
							particleSquare();
						}
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
		jQuery.validator.prototype.hideErrors = function() {
			this.addWrapper(this.toHide).fadeOut();
		};
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
				showErrors: function () {
					var i, elements;
					for ( i = 0; this.errorList[i]; i++ ) {
						var error = this.errorList[i];
						if ( this.settings.highlight ) {
							this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
						}
						this.showLabel( error.element, error.message );
					}
					if ( this.errorList.length ) {
						this.toShow = this.toShow.add( this.containers );
					}
					if ( this.settings.success ) {
						for ( i = 0; this.successList[i]; i++ ) {
							this.showLabel( this.successList[i] );
						}
					}
					if ( this.settings.unhighlight ) {
						for ( i = 0, elements = this.validElements(); elements[i]; i++ ) {
							this.settings.unhighlight.call( this, elements[i], this.settings.errorClass, this.settings.validClass );
						}
					}
					this.toHide = this.toHide.not( this.toShow );
					this.hideErrors();
					this.addWrapper( this.toShow ).fadeIn();
				},
				errorPlacement: function(error, element) {
					error.hide().appendTo(element.parent());
				},
				submitHandler: function (form) {
					$('#contact-form .form-group').fadeTo("slow", 0.5, function() {
						$(this).find(':input, :button').prop('disabled', true);
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
								$(this).find(':input, :button').removeAttr('disabled');
								$(this).find('label').css('cursor','default');
							});
						},
						error: function (XMLHttpRequest, textStatus, errorThrown) {
							$('#error-message').fadeTo("slow", 1);
							$('#contact-form .form-group').fadeTo( "slow", 0.5, function () {
								$(this).find(':input, :button').removeAttr('disabled');
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
			var x, y,
				pageY = event.pageY / 100,
				pageX = -event.pageX / 100,
				countBackY = pageY - 5,
				countBackX = Math.abs(pageX) - 5;

			x = pageY > 5 ? 5 - countBackY : x = pageY;
			y = pageX < -5 ? -5 + countBackX : y = pageX;
			$(".bg-page").css('transform', 'translate(' + x + 'px,' + y + 'px)');
		});
	});
})();
