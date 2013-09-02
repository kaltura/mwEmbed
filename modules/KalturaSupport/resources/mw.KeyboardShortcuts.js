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
			"longSeekBackKey": 'shift+37',
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
						}
						var validSpecialKeys = ['ctrl', 'alt', 'shift'];
						if( validSpecialKeys.indexOf(parts[0]) != -1 ){
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

			document.onkeydown = function( e ) {
				_this.onKeyDown( e );
			};
		},
		onKeyDown: function( e ){

			var ranCallback = false;
			var keyCode = e.keyCode || e.which;

			// Handle combinations
			if( e.altKey && keyCode != 18 ){
				ranCallback = this.runCallbackByKeysArr( keyCode, this.combinationKeys['alt'] );
			} else if( e.ctrlKey && keyCode != 17 && !ranCallback ) {
				ranCallback = this.runCallbackByKeysArr( keyCode, this.combinationKeys['ctrl'] );
			} else if( e.shiftKey && keyCode != 16 && !ranCallback ) {
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
			console.log('volume up');
		},
		volumeDownKeyCallback: function(){
			console.log('volume down');
		},
		longSeekBackKeyCallback: function(){
			console.log('longSeekBackKey');
		},
		percentageSeekKeysCallback: function( keyCode ){
			var _this = this;
			var getPercentage = function(){
				var percentArr = _this.getConfig('percentageSeekKeys');
				var idx = percentArr.indexOf( keyCode );
				return (idx + 1) * 10;
			};
			console.log( 'Seek to: '+ getPercentage());
		}

	}));

} )( window.mw, window.jQuery );