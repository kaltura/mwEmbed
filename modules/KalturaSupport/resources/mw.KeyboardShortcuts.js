( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'keyboardShortcuts', mw.KBasePlugin.extend({

		defaultConfig: {
			"volumePercentChange": 0.1,
			"shortSeekTime": 5,
			"longSeekTime": 10,

			"volumeUpKey": 38,
			"volumeDownKey": 40,
			"togglePlaybackKey": 32,
			"shortSeekBackKey": 37,
			"longSeekBackKey": 'ctrl+37',
			"shortSeekForwardKey": 39,
			"longSeekForwardKey": 'ctrl+39',
			"percentageSeekKeys": [49,50,51,52,53,54,55,56,57],
			"openFullscreenKey": 70,
			"closeFullscreenkey": 27,
			"gotoBeginingKey": 36,
			"gotoEndKey": 35
		},

		configKeyNames: [
			'volumeUpKey', 'volumeDownKey', 'togglePlaybackKey', 'shortSeekBackKey',
			'longSeekBackKey', 'shortSeekForwardKey', 'longSeekForwardKey',
			'percentageSeekKeys', 'openFullscreenKey', 'closeFullscreenkey', 
			'gotoBeginingKey', 'gotoEndKey'
		],

		SHIFT_KEY_CODE: 16,
		CTRL_KEY_CODE: 17,
		ALT_KEY_CODE: 18,

		enableKeyBindings: true,
		canSeek: false,

		setup: function(){
			var _this = this;

			this.singleKeys = {};
			this.combinationKeys = {
				'ctrl': {},
				'alt': {},
				'shift': {}
			};

			// Map config keys into single-key, keys-combination, multiple-keys
			$.each(this.configKeyNames, function(idx, configKey){
				var keyVal = _this.getConfig( configKey );
				switch( typeof keyVal ){
					case "number":
						_this.singleKeys[ keyVal ] = configKey;
					break;
					case "string":
						var parts = keyVal.split("+");
						if( parts.length != 2){
							_this.log('Combination keys must be: "{ctrl/alt/shift}+{keyCode}"');
							break;
						}
						var validSpecialKeys = ['ctrl', 'alt', 'shift'];
						if( $.inArray(parts[0], validSpecialKeys) != -1 ){
							_this.combinationKeys[parts[0]][parts[1]] = configKey;
						} else {
							_this.log('First key must be one of: ' + validSpecialKeys.join(","));
						}
					break;
					case "object":
						$.each(keyVal, function(keyIdx, keyCode){
							_this.singleKeys[keyCode] = configKey;
						});
					break;
				}
			});

			// Enable/Disable keyboard bindings
			this.bind('onEnableKeyboardBinding', function(){
				_this.enableKeyBindings = true;
			});
			this.bind('onDisableKeyboardBinding', function(){
				_this.enableKeyBindings = false;
			});

			this.bind('updateBufferPercent', function(){
				_this.canSeek = true;
			});

			$(document).keydown(function(e){
				if( _this.enableKeyBindings ){
					_this.onKeyDown( e );
				}
			});
		},
		onKeyDown: function( e ){

			var ranCallback = false;
			var keyCode = e.keyCode || e.which;

			// Handle combinations
			if( e.altKey && keyCode != this.ALT_KEY_CODE ){
				ranCallback = this.runCallbackByKeysArr( keyCode, this.combinationKeys['alt'] );
			} else if( e.ctrlKey && keyCode != this.CTRL_KEY_CODE && !ranCallback ) {
				ranCallback = this.runCallbackByKeysArr( keyCode, this.combinationKeys['ctrl'] );
			} else if( e.shiftKey && keyCode != this.SHIFT_KEY_CODE && !ranCallback ) {
				ranCallback = this.runCallbackByKeysArr( keyCode, this.combinationKeys['shift'] );
			}
			// Handle single keys
			if( !ranCallback ) {
				this.runCallbackByKeysArr( keyCode, this.singleKeys );
			}
		},

		runCallbackByKeysArr: function( keyCode, keysArr ){
			var keyName = keysArr[ keyCode ];
			var keyCallback = keyName + 'Callback';
			if( keyName && typeof this[ keyCallback ] === 'function' ){
				this[ keyCallback ]( keyCode );
				return true;
			}
			return false;
		},

		volumeUpKeyCallback: function(){
			var currentVolume = this.getPlayer().getPlayerElementVolume();
			var volumePercentChange = this.getConfig('volumePercentChange');
			var newVolumeVal = (currentVolume + volumePercentChange).toFixed(2);
			if( newVolumeVal > 1 ){
				newVolumeVal = 1;
			}
			this.getPlayer().setVolume( newVolumeVal, true );
		},
		volumeDownKeyCallback: function(){
			var currentVolume = this.getPlayer().getPlayerElementVolume();
			var volumePercentChange = this.getConfig('volumePercentChange');
			var newVolumeVal = (currentVolume - volumePercentChange).toFixed(2);
			if( newVolumeVal < 0 ) {
				newVolumeVal = 0;
			}
			this.getPlayer().setVolume( newVolumeVal, true );
		},
		togglePlaybackKeyCallback: function(){
			if( $('.btn').is(":focus") ){
				return false;
			}
			this.getPlayer().togglePlayback();
			return false;
		},
		seek: function( seekType, direction ){
			if( !this.canSeek ){
				return false;
			}
			var seekTimeConfig = (seekType == 'short') ? 'shortSeekTime' : 'longSeekTime';
			var seekTime = this.getConfig(seekTimeConfig);
			var currentTime = this.getPlayer().currentTime;
			var newCurrentTime = 0;
			if( direction == 'back' ){
				newCurrentTime = currentTime - seekTime;
				if( newCurrentTime < 0 ){
					newCurrentTime = 0;
				}
			} else {
				newCurrentTime = currentTime + seekTime;
				if( newCurrentTime > this.getPlayer().getDuration() ){
					newCurrentTime = this.getPlayer().getDuration();
				}
			}		
			this.getPlayer().setCurrentTime( newCurrentTime );
		},	
		shortSeekBackKeyCallback: function(){
			this.seek( 'short', 'back' );
		},
		longSeekBackKeyCallback: function(){
			this.seek( 'long', 'back' );
		},
		shortSeekForwardKeyCallback: function(){
			this.seek( 'short', 'forward' );
		},
		longSeekForwardKeyCallback: function(){
			this.seek( 'long', 'forward' );
		},
		percentageSeekKeysCallback: function( keyCode ){
			if( !this.canSeek ) {
				return false;
			}
			var _this = this;
			var getPercentage = function(){
				var percentArr = _this.getConfig('percentageSeekKeys');
				var idx = $.inArray(keyCode, percentArr);
				return ((idx + 1) * 0.1 ).toFixed(2);
			};
			this.getPlayer().seek( getPercentage() );
		},
		openFullscreenKeyCallback: function(){
			if( !this.getPlayer().getInterface().hasClass('fullscreen') ){
				this.getPlayer().toggleFullscreen();
			}
		},
		closeFullscreenkeyCallback: function(){
			if( this.getPlayer().getInterface().hasClass('fullscreen') ){
				this.getPlayer().toggleFullscreen();
			}
		},
		gotoBeginingKeyCallback: function(){
			if( !this.canSeek ) {
				return false;
			}
			this.getPlayer().seek(0);
		},
		gotoEndKeyCallback: function(){
			if( !this.canSeek ) {
				return false;
			}
			this.getPlayer().seek(1);
		}
	}));

} )( window.mw, window.jQuery );