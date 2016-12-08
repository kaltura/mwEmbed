(function (mw, $, THREE) {
	"use strict";

	mw.PluginManager.add('video360', mw.KBasePlugin.extend({

		defaultConfig: {
			manualControl:false,
			moveMultiplier:0.3,
			demo:false
		},
		setup: function() {
			mw.setConfig("disableOnScreenClick",true);
			var renderer;
			var _this = this;
			this.bind("playing play pause seek seeked" , function(){
				$(_this.getPlayer().getPlayerElement() ).hide();
			});
			this.bind("updateLayout", function(){
				renderer.setSize(window.innerWidth, window.innerHeight);
			});
			this.bind("hidePlayerControls", function(){
				_this.manualControl = false;
			});
			this.bind("playerReady" , function(){
				_this.getPlayer().layoutBuilder.removePlayerClickBindings();
				var player = _this.getPlayer();
				var video = player.getPlayerElement();
				var container = player.getVideoDisplay();
				var longitude = 180;
				var latitude = 0;
				var savedX;
				var savedY;
				var savedLongitude;
				var savedLatitude;
				var texture;
				_this.manualControl = _this.getConfig("manualControl");
				$(_this.getPlayer().getPlayerElement() ).css('z-index','-1');
				// setting up the renderer
				renderer = new THREE.WebGLRenderer();
				renderer.setSize(window.innerWidth, window.innerHeight);
				container.append(renderer.domElement);
				video.setAttribute('crossorigin', 'anonymous');
				// creating a new scene
				var scene = new THREE.Scene();

				// adding a camera
				var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
				camera.target = new THREE.Vector3(0, 0, 0);

				// creation of a big sphere geometry
				var sphere = new THREE.SphereGeometry(100, 100, 40);
				sphere.applyMatrix(new THREE.Matrix4().makeScale(-1, 1, 1));
				texture = new THREE.Texture(video);
				texture.minFilter = THREE.LinearFilter;
				texture.magFilter = THREE.LinearFilter;

				// creation of the sphere material
				var sphereMaterial = new THREE.MeshBasicMaterial();
				sphereMaterial.map = texture;

				// geometry + material = mesh (actual object)
				var sphereMesh = new THREE.Mesh(sphere, sphereMaterial);
				scene.add(sphereMesh);
				function render(){
					if ( video.readyState === video.HAVE_ENOUGH_DATA ) {
						if ( texture ) texture.needsUpdate = true;
					}
					requestAnimationFrame(render);

					//if(!_this.manualControl){
					//	longitude += _this.getConfig("moveMultiplier");
					//}

					// limiting latitude from -85 to 85 (cannot point to the sky or under your feet)
					latitude = Math.max(-85, Math.min(85, latitude));

					// moving the camera according to current latitude (vertical movement) and longitude (horizontal movement)
					camera.target.x = 500 * Math.sin(THREE.Math.degToRad(90 - latitude)) * Math.cos(THREE.Math.degToRad(longitude));
					camera.target.y = 500 * Math.cos(THREE.Math.degToRad(90 - latitude));
					camera.target.z = 500 * Math.sin(THREE.Math.degToRad(90 - latitude)) * Math.sin(THREE.Math.degToRad(longitude));
					camera.lookAt(camera.target);

					// calling again render function
					renderer.render(scene, camera);

					if (_this.getConfig("demo")){
						if (!_this.demoStep){
							_this.demoStep = 1;
						}
						if (_this.demoStep < 500 ){
							_this.demoStep++;
							longitude += _this.getConfig("moveMultiplier");

						}  else if (_this.demoStep < 1000) {
							_this.demoStep++;
							longitude -= _this.getConfig("moveMultiplier");

						}  else {
							_this.setConfig("demo",false)
						}
					}

				}

				// when the mouse is pressed, we switch to manual control and save current coordinates
				function onDocumentMouseDown(event){
					//event.preventDefault();
					_this.manualControl = true;
					savedX = event.clientX || event.originalEvent.touches[0].pageX;
					savedY = event.clientY || event.originalEvent.touches[0].pageY;
					savedLongitude = longitude;
					savedLatitude = latitude;
				}

				// when the mouse moves, if in manual contro we adjust coordinates
				function onDocumentMouseMove(event){
					if(_this.manualControl){
						longitude = (savedX - (event.clientX || event.originalEvent.touches[0].pageX)) * _this.getConfig("moveMultiplier") + savedLongitude;
						latitude = ((event.clientY || event.originalEvent.touches[0].pageY) - savedY) * _this.getConfig("moveMultiplier") + savedLatitude;
					}
				}

				// when the mouse is released, we turn manual control off
				function onDocumentMouseUp(event){
					_this.manualControl = false;
				}

				// listeners
				$(document).on("mousedown touchstart", onDocumentMouseDown);
				$(document).on("mousemove touchmove", onDocumentMouseMove);
				$(document).on("mouseup touchend", onDocumentMouseUp    );
				render();
			});
		}
	}));
})(window.mw, window.jQuery, window.THREE);