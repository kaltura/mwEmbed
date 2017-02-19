(function (mw, $, THREE) {
	"use strict";

	mw.PluginManager.add('video360', mw.KBasePlugin.extend({

		defaultConfig: {
			moveMultiplier: 0.3,
			mobileVibrationValue: (mw.isIOS() ? 0.0365 : 1),
			cameraOptions:{
				fov: 75,
				aspect: window.innerWidth / window.innerHeight,
				near: 0.1,
				far: 1000
			}
		},
		manualControl: false,
		longitude: 180,
		latitude: 0,
		savedX: 0,
		savedY: 0,
		savedLongitude: 0,
		savedLatitude: 0,
		enableKeyboardShortcuts: true,
		keyboardShortcutsMap: {
			"left":  "65",  // 'A'
			"up":    "87",  // 'W'
			"right": "68",  // 'D'
			"down":  "83"   // 'S'
		},

		isSafeEnviornment: function () {
			return !( mw.isIE8() || mw.isIE9() || mw.isIE10Comp() || // old IEs
				(mw.isIE11() && (mw.getUserOS() === 'Windows 7' || mw.getUserOS() === 'Windows 8')) || // ie11 on win7/8
				(mw.isIphone() && mw.isIOSBelow10()) || // iPhone and IOS < 10 - doesn't support inline playback
				mw.isIOSBelow9() ); // IOS < 9 doesn't support webgl
		},

		setup: function () {
			this.set360Config();
			this.addBindings();
		},

		set360Config:function(){
			//Get user configuration
			var userCameraOptions = this.getConfig("cameraOptions");
			//Deep extend custom config
			this.cameraOptions = $.extend({}, this.defaultConfig.cameraOptions, userCameraOptions);
		},

		addBindings: function () {
			this.bind("playerReady", function () {
				this.moveMultiplier = this.getConfig("moveMultiplier");
				this.mobileVibrationValue = this.getConfig("mobileVibrationValue");
				this.video = this.getPlayer().getPlayerElement();
				this.video.setAttribute('crossorigin', 'anonymous');
				if (mw.isIE11()) {
					// a workaround for ie11 texture issue
					// see https://github.com/mrdoob/three.js/issues/7560
					this.overrideVideoTextureMethod();
				}
				this.initComponents();
			}.bind(this));

			this.bind("firstPlay", function () {
				this.attachMotionListeners();
				this.getPlayer().layoutBuilder.removePlayerClickBindings();
				$(this.canvas).css('z-index', '2');
				this.add360logo();
			}.bind(this));

			this.bind("playing", function () {
				$(this.video).hide();
				$(this.getPlayer()).css('z-index', '-1');
				var canvasSize = this.getCanvasSize();
				this.renderer.setSize(canvasSize.width, canvasSize.height);
				this.render();
			}.bind(this));

			this.bind("doStop", function () {
				cancelAnimationFrame(this.requestId)
			}.bind(this));

			this.bind("onChangeMedia", function () {
				this.clean();
			}.bind(this));

			this.bind("updateLayout", function () {
				if(this.renderer){
					var canvasSize = this.getCanvasSize();
					this.renderer.setSize(canvasSize.width, canvasSize.height);
				}
			}.bind(this));

			this.bind('addKeyBindCallback', function (e, addKeyCallback) {
				this.addKeyboardShortcuts(addKeyCallback);
			}.bind(this));
		},

		initComponents: function () {
			// setting up the renderer
			this.renderer = new THREE.WebGLRenderer();
			this.canvas = this.renderer.domElement;
			this.getPlayer().getVideoDisplay().append(this.canvas);
			$(this.canvas).addClass("canvas360");

			// creating a new scene
			this.scene = new THREE.Scene();

			// adding a camera
			this.camera = new THREE.PerspectiveCamera(this.cameraOptions.fov, this.cameraOptions.aspect, this.cameraOptions.near, this.cameraOptions.far);
			this.camera.target = new THREE.Vector3(0, 0, 0);

			// creation of a big sphere geometry
			var sphere = new THREE.SphereGeometry(100, 100, 40);
			sphere.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
			this.texture = new THREE.VideoTexture(this.video);
			this.texture.minFilter = THREE.LinearFilter;
			this.texture.magFilter = THREE.LinearFilter;

			// creation of the sphere material
			var sphereMaterial = new THREE.MeshBasicMaterial();
			sphereMaterial.map = this.texture;

			// geometry + material = mesh (actual object)
			var sphereMesh = new THREE.Mesh(sphere, sphereMaterial);
			this.scene.add(sphereMesh);
		},

		overrideVideoTextureMethod: function () {
			THREE.VideoTexture = function (video, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy) {
				var scope = this;

				scope.video = video;
				scope.ctx2d = document.createElement('canvas').getContext('2d');
				var canvas = scope.ctx2d.canvas;
				canvas.width = video.width;
				canvas.height = video.height;

				scope.ctx2d.drawImage(scope.video, 0, 0, scope.width, scope.height);
				THREE.Texture.call(scope, scope.ctx2d.canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy);

				scope.generateMipmaps = false;

				function update() {
					requestAnimationFrame(update);
					if (video.readyState >= video.HAVE_CURRENT_DATA) {
						scope.ctx2d.drawImage(scope.video, 0, 0, scope.video.width, scope.video.height);
						scope.needsUpdate = true;
					}
				}

				update();
			};

			THREE.VideoTexture.prototype = Object.create(THREE.Texture.prototype);
			THREE.VideoTexture.prototype.constructor = THREE.VideoTexture;
		},

		getCanvasSize: function(){
			var videoDisplayWidth = this.getPlayer().getVideoDisplay().width();
			var videoDisplayHeight = this.getPlayer().getVideoDisplay().height();
			var pWidth = parseInt(this.video.videoWidth / this.video.videoHeight * videoDisplayHeight);
			var videoRatio;
			if(videoDisplayWidth < pWidth) {
				videoRatio = this.video.videoHeight / this.video.videoWidth;
				return {
					width: videoDisplayWidth,
					height: videoRatio * videoDisplayWidth
				};
			} else {
				videoRatio = this.video.videoWidth / this.video.videoHeight;
				return {
					width: videoRatio * videoDisplayHeight,
					height: videoDisplayHeight
				};
			}
		},

		updateCamera: function () {
			// limiting latitude from -85 to 85 (cannot point to the sky or under your feet)
			this.latitude = Math.max(-85, Math.min(85, this.latitude));

			// moving the camera according to current latitude (vertical movement) and longitude (horizontal movement)
			this.camera.target.x = 500 * Math.sin(THREE.Math.degToRad(90 - this.latitude)) * Math.cos(THREE.Math.degToRad(this.longitude));
			this.camera.target.y = 500 * Math.cos(THREE.Math.degToRad(90 - this.latitude));
			this.camera.target.z = 500 * Math.sin(THREE.Math.degToRad(90 - this.latitude)) * Math.sin(THREE.Math.degToRad(this.longitude));
			this.camera.lookAt(this.camera.target);
		},

		render: function () {
			if (this.texture && this.video.readyState >= this.video.HAVE_CURRENT_DATA) {
				this.texture.needsUpdate = true;
			}
			this.requestId = requestAnimationFrame(this.render.bind(this));

			this.updateCamera();

			// calling again render function
			this.renderer.render(this.scene, this.camera);
		},

		// when the mouse is pressed, we switch to manual control and save current coordinates
		onDocumentMouseDown: function (event) {
			this.manualControl = true;
			this.savedX = event.clientX || event.originalEvent.touches[0].pageX;
			this.savedY = event.clientY || event.originalEvent.touches[0].pageY;
			this.savedLongitude = this.longitude;
			this.savedLatitude = this.latitude;
			if( event.type === "touchstart" ) {
				$("#touchOverlay").trigger("touchstart");
			}
		},

		// when the mouse moves, if in manual control we adjust coordinates
		onDocumentMouseMove: function (event) {
			if (this.manualControl) {
				if (event.clientX || event.originalEvent.touches) {
					this.longitude = (this.savedX - (event.clientX || event.originalEvent.touches[0].pageX)) * this.moveMultiplier + this.savedLongitude;
				}
				if (event.clientY || event.originalEvent.touches) {
					this.latitude = ((event.clientY || event.originalEvent.touches[0].pageY) - this.savedY) * this.moveMultiplier + this.savedLatitude;
				}
				event.preventDefault();
				event.stopPropagation();
			}
		},

		// when the mouse is released, we turn manual control off
		onDocumentMouseUp: function (event) {
			this.manualControl = false;
		},

		onMobileOrientation: function (event) {
			if (event.rotationRate) {
				var x = event.rotationRate.alpha;
				var y = event.rotationRate.beta;
				var portrait = $(top).height() > $(top).width();
				var orientation = event.orientation || window.orientation;

				if (portrait) {
					this.longitude = this.longitude - y * this.mobileVibrationValue;
					this.latitude = this.latitude + x * this.mobileVibrationValue;
				} else { // landscape
					var orientationDegree = -90;
					if (typeof orientation != "undefined") {
						orientationDegree = orientation;
					}
					this.longitude = (orientationDegree == -90) ? this.longitude + x * this.mobileVibrationValue : this.longitude - x * this.mobileVibrationValue;
					this.latitude = (orientationDegree == -90) ? this.latitude + y * this.mobileVibrationValue : this.latitude - y * this.mobileVibrationValue;
				}
			}
		},

		attachMotionListeners: function () {
			$(this.canvas).on("mousedown touchstart", this.onDocumentMouseDown.bind(this));
			$(this.canvas).on("mousemove touchmove", this.onDocumentMouseMove.bind(this));
			$(document).on("mouseup touchend", this.onDocumentMouseUp.bind(this));
			window.addEventListener('devicemotion', this.onMobileOrientation.bind(this));
		},

		addKeyboardShortcuts: function (addKeyCallback) {
			addKeyCallback(this.keyboardShortcutsMap.left, function () {
				this.longitude -= 10 * this.moveMultiplier;
			}.bind(this));
			addKeyCallback(this.keyboardShortcutsMap.up, function () {
				this.latitude += 10 * this.moveMultiplier;
			}.bind(this));
			addKeyCallback(this.keyboardShortcutsMap.right, function () {
				this.longitude += 10 * this.moveMultiplier;
			}.bind(this));
			addKeyCallback(this.keyboardShortcutsMap.down, function () {
				this.latitude -= 10 * this.moveMultiplier;
			}.bind(this));
		},

		clean: function(){
			cancelAnimationFrame(this.requestId);
			$(this.canvas).remove();
		},

		add360logo: function () {
			var logo = $('<div />').addClass('logo360 bottomRight');
			this.getPlayer().getVideoHolder().append(logo);
		}
	}));

	// set EmbedPlayer.WebKitPlaysInline true for iPhone inline playback
	var playerConfig = window.kalturaIframePackageData.playerConfig;
	if (playerConfig) {
		if (!playerConfig.vars) {
			playerConfig.vars = {};
		}
		playerConfig.vars["EmbedPlayer.WebKitPlaysInline"] = true;
		mw.setConfig('KalturaSupport.PlayerConfig', playerConfig);
	}

})(window.mw, window.jQuery, window.THREE);