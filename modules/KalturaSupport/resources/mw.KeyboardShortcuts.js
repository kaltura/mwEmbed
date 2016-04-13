( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'keyboardShortcuts', mw.KBasePlugin.extend({

		defaultConfig: {
			"volumePercentChange": 0.1,
			"shortSeekTime": 5,
			"longSeekTime": 10,

			"arrowUpKey": 38,
			"arrowDownKey": 40,
			"togglePlaybackKey": 32,
			"shortSeekBackKey": 37,
			"longSeekBackKey": 'ctrl+37',
			"shortSeekForwardKey": 39,
			"longSeekForwardKey": 'ctrl+39',
			"percentageSeekKeys": "49,50,51,52,53,54,55,56,57",
			"openFullscreenKey": 70,
			"escapeKey": 27,
			"gotoBeginingKey": 36,
			"gotoEndKey": 35
		},

		configKeyNames: [
			'arrowUpKey', 'arrowDownKey', 'togglePlaybackKey', 'shortSeekBackKey',
			'longSeekBackKey', 'shortSeekForwardKey', 'longSeekForwardKey',
			'openFullscreenKey', 'escapeKey', 'gotoBeginingKey', 'gotoEndKey'
		],

		SHIFT_KEY_CODE: 16,
		CTRL_KEY_CODE: 17,
		ALT_KEY_CODE: 18,

		enableKeyBindings: true,
		enableSingleKeyBindings: true,
		enableComboKeyBindings: true,
		canSeek: false,

		// Will hold our single keys mapping
		singleKeys: {},
		// Will hold
		combinationKeys: {
			'ctrl': {},
			'alt': {},
			'shift': {},
			'alt+ctrl': {},
			'alt+shift': {},
			'ctrl+shift': {}
		},

		setup: function(){
			var _this = this;

			// Map config keys into single-key, keys-combination, multiple-keys
			$.each(this.configKeyNames, function(idx, configKey){
				var keyVal = _this.getConfig( configKey );
				_this.mapKeyByType( keyVal, configKey );
			});

			// Special case percentageSeekKeys
			var percentageArr = this.getConfig('percentageSeekKeys').split(",");
			$.each(percentageArr, function(keyIdx, keyCode){
				_this.singleKeys[keyCode] = 'percentageSeekKeys';
			});

			// Allow other plugins to register their keys
			var addKeyCallback = function( keyCode, callback ){
				_this.mapKeyByType( keyCode, callback );
			};
			this.bind('pluginsReady', function(){
				_this.getPlayer().triggerHelper( 'addKeyBindCallback', addKeyCallback );
			});

			// Enable/Disable keyboard bindings
			this.bind('onEnableKeyboardBinding', function(){
				_this.enableKeyBindings = true;
				_this.enableSingleKeyBindings = true;
				_this.enableComboKeyBindings = true;
			});
			this.bind('onDisableKeyboardBinding', function(e, options){
					if (options){
						_this.enableSingleKeyBindings = options.disableSingle ? !(!!options.disableSingle) : true;
						_this.enableComboKeyBindings = options.disableCombo ? !(!!options.disableCombo) : true;
						_this.enableKeyBindings = _this.enableSingleKeyBindings || _this.enableComboKeyBindings;
					} else {
						_this.enableKeyBindings = false;
						_this.enableSingleKeyBindings = false;
						_this.enableComboKeyBindings = false;
					}
			});

			this.bind('updateBufferPercent', function(){
				_this.canSeek = true;
			});

			$(document).keydown(function(e){
				if( _this.enableKeyBindings ){
					return _this.onKeyDown( e );
				}
			});
		},
		mapKeyByType: function( key, callback ){
			switch( typeof key ){
				case "number":
					this.singleKeys[ key ] = callback;
				break;
				case "string":
					var parts = key.split("+");
                    // in case we got the key code as a string instead of a number without a special key
                    if( parts.length == 1){
                        this.singleKeys[ key ] = callback;
                        break;
                    }
					var validSpecialKeys = ['ctrl', 'alt', 'shift'];
					if( parts.length === 2) {
						if( $.inArray(parts[0], validSpecialKeys) !== -1 ){
							this.combinationKeys[parts[0]][parts[1]] = callback;
						} else {
							this.log('First key must be one of: ' + validSpecialKeys.join(","));
						}
					}
					if( parts.length === 3) {
						if(( $.inArray(parts[0], validSpecialKeys) !== -1 ) && ($.inArray(parts[1], validSpecialKeys) !== -1)){
							var comboKey = parts.slice(0,2 ).sort(function(a, b){
								if ( a.toLowerCase().charAt(0) > b.toLowerCase().charAt(0)){ return 1; }
								if ( a.toLowerCase().charAt(0) < b.toLowerCase().charAt(0)){ return -1; }
								return 0;
							});
							this.combinationKeys[comboKey[0] + "+" + comboKey[1]][parts[2]] = callback;
						} else {
							this.log('First and second keys must be one of: ' + validSpecialKeys.join(","));
						}
					}
				break;
			}
		},
		onKeyDown: function( e ){
			var ranCallback = false;
			var keyCode = e.keyCode || e.which;

			//we need to ignore shortcuts if text area or input have input (space, P are not support to be triggered)
			if ( $("*:focus").is("textarea, input") ) {
				return true;
			}
			// Handle combinations
			if (this.enableComboKeyBindings) {
				if ( e.ctrlKey && e.altKey && keyCode !== this.CTRL_KEY_CODE && keyCode !== this.ALT_KEY_CODE && !ranCallback ) {
					ranCallback = this.runCallbackByKeysArr( keyCode, this.combinationKeys['alt+ctrl'] );
				} else if ( e.ctrlKey && e.shiftKey && keyCode !== this.CTRL_KEY_CODE && keyCode !== this.SHIFT_KEY_CODE && !ranCallback ) {
					ranCallback = this.runCallbackByKeysArr( keyCode, this.combinationKeys['ctrl+shift'] );
				} else if ( e.shiftKey && e.altKey && keyCode !== this.SHIFT_KEY_CODE && keyCode !== this.ALT_KEY_CODE && !ranCallback ) {
					ranCallback = this.runCallbackByKeysArr( keyCode, this.combinationKeys['alt+shift'] );
				} else if ( e.altKey && keyCode !== this.ALT_KEY_CODE ) {
					ranCallback = this.runCallbackByKeysArr( keyCode, this.combinationKeys['alt'] );
				} else if ( e.ctrlKey && keyCode !== this.CTRL_KEY_CODE && !ranCallback ) {
					ranCallback = this.runCallbackByKeysArr( keyCode, this.combinationKeys['ctrl'] );
				} else if ( e.shiftKey && keyCode !== this.SHIFT_KEY_CODE && !ranCallback ) {
					ranCallback = this.runCallbackByKeysArr( keyCode, this.combinationKeys['shift'] );
				}
			}

			// Handle single keys
			if( !ranCallback && this.enableSingleKeyBindings) {
				ranCallback = this.runCallbackByKeysArr( keyCode, this.singleKeys );
			}
			if( ranCallback ){
				// Prevent the default behavior
				e.preventDefault();				
				return false;
			}
		},

		runCallbackByKeysArr: function( keyCode, keysArr ){
			var keyName = keysArr[ keyCode ];
			// Support anonymus callbacks
			if( $.isFunction(keyName) ){
				keyName( keyCode );
				this.log('ran callback for key: ' + keyCode);
				return true;
			}
			var keyCallback = keyName + 'Callback';
			if( keyName && typeof this[ keyCallback ] === 'function' ){
				this[ keyCallback ]( keyCode );
				this.log('ran callback: ' + keyCallback + ' for key: ' + keyCode);
				return true;
			}
			return false;
		},

		arrowUpKeyCallback: function(){
			if (this.getOpenedMenu() != null){
				this.getOpenedMenu().previousItem();
			}else{
				this.volumeUpKeyCallback();
			}
		},
		arrowDownKeyCallback: function(){
			if (this.getOpenedMenu() != null){
				this.getOpenedMenu().nextItem();
			}else{
				this.volumeDownKeyCallback();
			}
		},
		escapeKeyCallback: function(){
			if (this.getOpenedMenu() != null){
				this.getOpenedMenu().close();
			}else{
				this.closeFullscreenkeyCallback();
			}
		},
		volumeUpKeyCallback: function(){
			var currentVolume = parseFloat(this.getPlayer().getPlayerElementVolume());
			var volumePercentChange = parseFloat(this.getConfig('volumePercentChange'));
			var newVolumeVal = (currentVolume + volumePercentChange).toFixed(2);
			if( newVolumeVal > 1 ){
				newVolumeVal = 1;
			}
			this.getPlayer().setVolume( newVolumeVal, true );
		},
		volumeDownKeyCallback: function(){
			var currentVolume = parseFloat(this.getPlayer().getPlayerElementVolume());
			var volumePercentChange = parseFloat(this.getConfig('volumePercentChange'));
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
			var notificationName = ( this.getPlayer().isPlaying() ) ? 'doPause' : 'doPlay';
			this.getPlayer().sendNotification( notificationName,{'userInitiated': true} );
			return false;
		},
		seek: function( seekType, direction ){
			if( !this.canSeek ){
				return false;
			}
			var seekTimeConfig = (seekType == 'short') ? 'shortSeekTime' : 'longSeekTime';
			var seekTime = parseFloat(this.getConfig(seekTimeConfig));
			var currentTime = parseFloat(this.getPlayer().currentTime);
			var newCurrentTime = 0;
			if( direction == 'back' ){
				newCurrentTime = currentTime - seekTime;
				if( newCurrentTime < 0 ){
					newCurrentTime = 0;
				}
			} else {
				newCurrentTime = currentTime + seekTime;
				if( newCurrentTime > parseFloat(this.getPlayer().getDuration()) ){
					newCurrentTime = parseFloat(this.getPlayer().getDuration());
				}
			}
			this.getPlayer().seek( newCurrentTime );
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
				var percentArr = _this.getConfig('percentageSeekKeys').split(",");
				var idx = $.inArray(keyCode.toString(), percentArr);
				return ((idx + 1) * 0.1 ).toFixed(2);
			};
			var seekTime = getPercentage() * this.getPlayer().getDuration();
			this.getPlayer().seek( seekTime );
		},
		openFullscreenKeyCallback: function(){
			if( !this.getPlayer().getInterface().hasClass('fullscreen') ){
				this.getPlayer().toggleFullscreen();
			}
		},
		closeFullscreenkeyCallback: function(){
			if( this.getPlayer().getInterface().hasClass('fullscreen') && this.getPlayer().layoutBuilder.fullScreenManager.inFullScreen ){
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
			if( !this.canSeek || this.getPlayer().currentState === 'end') {
				return false;
			}
			this.getPlayer().seek(this.getPlayer().getDuration()-1);
		},
		getOpenedMenu: function(){
			var openedMenu = null;
			for (var pluginID in this.getPlayer().plugins){
				var plugin = this.getPlayer().plugins[pluginID];
				if ($.isFunction( plugin.getMenu ) && plugin.getMenu().isOpen()){
					openedMenu = plugin.getMenu();
					break;
				}
			}
			return openedMenu;
		}

	}));

} )( window.mw, window.jQuery );