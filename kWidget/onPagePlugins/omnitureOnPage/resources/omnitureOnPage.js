kWidget.addReadyCallback( function( playerId ){
	/**
	 * The main omnitureOnPage object:
	 */
	var omnitureOnPage = function(kdp){
		return this.init(kdp);
	}
	omnitureOnPage.prototype = {
		instanceName: 'omnitureOnPage',
		init: function( kdp ){
			var _this = this;
			this.kdp = kdp;
			// unbind any existing bindings:
			this.kdp.kUnbind( '.' + this.instanceName );
			// Check for on-page s-code that already exists
			this.sCodeCheck(function(){
				_this.bindPlayer();
				_this.bindCustomEvents();
			})
		},
		getSCodeName: function(){
			return this.getConfig('s_codeVarName') || 's';
		},
		sCodeCheck: function( callback ){
			var _this = this;

			var doneCallback = function() {
				// Override s_code object with local configuration
				var configFuncName = _this.getConfig('s_codeConfigFunc');
				if( configFuncName && typeof window[ configFuncName ] == 'function' ) {
					var localConfig = window[ configFuncName ]();
					for( var k in localConfig ) {
						window[ _this.getSCodeName() ][ k ] = localConfig[ k ];
					}
				}

				if(callback) {
					callback();
				}
			}
			// check if already on the page: 
			if( window[ this.getSCodeName() ] && window[ this.getSCodeName() ]['Media'] ){
				doneCallback();
				return ; 
			}
			
			// check if we have scode
			this.bind( 'kdpReady' , function() {
				if( !_this.getConfig('s_codeUrl') ){
					kWidget.log( "Error: s_codeUrl must be set for Omniture onPage plugin");
					return ;
				}
				kWidget.appendScriptUrl( _this.getConfig('s_codeUrl'), doneCallback );
			});
		},
		/** Getters **/
		getMediaPlayerName: function(){
			return 'Kaltura Omniture OnPage v' + mw.getConfig('version'); 
		},
		getMediaName: function(){
	 		var _this = this;
	 		// shortcut to custom data
	 		var g = function( key ){
	 			return _this.getAttr( 'mediaProxy.entryMetadata.' + key ) || '_';
	 		}
 			switch( _this.getConfig( 'concatMediaName' ) ){
 				case 'doluk':
 					var refId = _this.kdp.evaluate( '{mediaProxy.entry.referenceId}' )
 					if( !refId ) 
 						refId = _this.kdp.evaluate( '{mediaProxy.entry.id}' )
 					return [ g('SiteSection'), g('PropertyCode'), 
 						g('ContentType'),  g('ShortTitle').substr(0,30), 
 						_this.getDuration(),  refId 
 						].join(':').replace(/\s/g, "_");
 				break;
 			}
			return this.getAttr('mediaProxy.entry.name');
		},
		getDuration: function(){
			return Math.floor( this.getAttr('duration') );
		},
		getCurrentTime: function(){
			return Math.floor( this.getAttr('video.player.currentTime') );
		},
		bindPlayer: function(){
			var _this = this;
			var firstPlay = true;
			// setup shortcuts:
			var stop = function(){
				_this.runMediaCommand( "stop", _this.getMediaName(), _this.getCurrentTime() );
			}
			var play = function(){
				_this.runMediaCommand( "play", _this.getMediaName(), _this.getCurrentTime() );
			}
			// Run open on first play:
			this.bind( 'doPlay', function(){
				if( firstPlay ){
					_this.runMediaCommand( "open", 
						_this.getMediaName(), 
						_this.getDuration(), 
						_this.getMediaPlayerName() 
					)
				}
				play();
				firstPlay = false;
			})
			this.bind( 'playerSeekStart', stop );
			this.bind( 'playerSeekEnd', play );
			this.bind( 'doPause', stop );
			this.bind( 'playerPlayEnd', function(){
				stop();
				_this.runMediaCommand( "close", _this.getMediaName() )
			});
		},

		bindCustomEvents: function() {
			var _this = this;
			var customEvents = _this.getConfig( 'customEvents' );
			if( !customEvents ) {
				return ;
			}
			customEvents = customEvents.split( ',' );

			// Get all the plugin config for all the omniture events
			$.each( customEvents , function( inx, eventName){
				var eventId = _this.getConfig( eventName + 'Event' );
				if( ! eventId ){
					return true; // next
				}
				// Add the binding:
				_this.bind( eventName, function(){
					_this.sendNotification( eventId, eventName );
				});
			});			
		},

		getPropsAndEvars: function( eventName ){
	 		var _this = this;
	 		var propsAndEvars = {};
	 		// Look for up-to 10 associated eVars
			for( var i = 1 ; i < 10; i++ ){
				var eVarId = _this.getConfig( eventName + 'Evar' + i );
				var eVarVal = _this.getConfig( eventName + 'Evar' + i + 'Value' );

				// Stop looking for more eVars if we did not find one:
				if( ! eVarId ){
					break;
				}
				propsAndEvars[ eVarId ] = eVarVal;
			}
			// Special Case a few base eVar mappings 
			if( this.getConfig( 'contentType') ){
				propsAndEvars[  this.getConfig( 'contentType') ] = this.getCType();
			}
			// Look for up-to 10 associated Props
			for( var i = 1 ; i < 10; i++ ){
				var ePropId = _this.getConfig( eventName + 'Prop' + i );
				var ePropVal = _this.getConfig( eventName + 'Prop' + i + 'Value' );
				if( !ePropId )
					break;
				propsAndEvars[ ePropId ] = ePropVal;
			}
			return propsAndEvars;
	 	},		
		
		getCType: function(){
	 		if( this.embedPlayer.mediaElement.selectedSource ){
				var ctype = this.embedPlayer.mediaElement.selectedSource.mimeType;
				if( ctype.indexOf('/') != -1 ){
					return ctype.split('/')[0];
				} 
	 		}
			// default to video if we can't detect content type from mime
			return 'video';
	 	},

		runMediaCommand: function(){
	 		var args = $.makeArray( arguments );
	 		var cmd = args[0];
	 		var argSet = args.slice( 1 );
	 		try{
	 			eval( this.getSCodeName() + '.Media.' + cmd + '("' + argSet.join('","') + '");');
	 			// not working :(
	 			//s.Media[cmd].apply( this, args );
	 		}catch( e ){
	 			kWidget.log( "Error: Omniture, trying to run media command:" + cmd + ' does not exist' );
	 		}
	 		// audit if trackEventMonitor is set:
	 		if( this.getConfig( 'trackEventMonitor') ){
		 		try{
		 			window.parent[ this.getConfig( 'trackEventMonitor') ]( this.getSCodeName() + 
		 					'.Media.' + cmd + '( "' + argSet.join('", "') + '" )' );
		 		} catch ( e ){}
	 		}
	 	},

		/**
	 	 * Dispatches an event to omniture via the s.track(); call
	 	 *
	 	 * @param {String} eventId The omniture event id
	 	 * @param {=String} eventName Optional eventName for logging ( not used in the omniture beacon )
	 	 * @return
	 	 */
	 	sendNotification: function( eventId, eventName ){
	 		var _this = this;
	 		// mark everything we updated for logging and audit
	 		var oDebugDispatch = {};
	 		// Get the proprs and evars:
	 		var propsAndEvars = _this.getPropsAndEvars( eventName );
	 		// dispatch the "s" event:
	 		
	 		oDebugDispatch['trackEvents'] = s.Media.trackEvents;
	 		// check if we have associated eVars:
	 		if( ! $.isEmptyObject( propsAndEvars ) ){
	 			s.Media.trackEvents += ',eVars';
	 			// Build props and evars
				for ( var key in propsAndEvars ){
					s[ key ] = propsAndEvars[ key ];
					oDebugDispatch[key] = propsAndEvars[ key ];
				}
	 		}
	 		if( eventId ){
	 			s.events = eventId;
	 			oDebugDispatch['events'] = s.events;
	 		}

	 		try {
	 			var logMethod = this.getConfig( 'trackEventMonitor' );
	 			var logEvent = eventName || '';
	 			window.parent[logMethod](
	 				logEvent,
					oDebugDispatch
				);
	 			mw.log( "Omniture: s.track(), state:" +  logEvent, oDebugDispatch)
	 		} catch ( e ){ }
	 		
	 		
	 		// dispatch the event
	 		if( !s.track ){
	 			// sometimes s.track is not defined? s.t seems to be the replacement :(
	 			s.t();
	 		} else {
	 			s.track();
	 		}
	 	},	 	
		normalizeAttrValue: function( attrValue ){
			// normalize flash kdp string values
			switch( attrValue ){
				case "null":
					return null;
				break;
				case "true":
					return true;
				break;
				case "false":
					return false;
				break;
			}
			return attrValue;
		},
		bind: function( eventName, callback ){
			// postfix the instanceName to namespace all the bindings
			this.kdp.kBind( eventName + '.' + this.instanceName, callback );
		},
		getAttr: function( attr ){
			return this.normalizeAttrValue(
				this.kdp.evaluate( '{' + attr + '}' )
			);
		},
		getConfig : function( attr ){
			return this.normalizeAttrValue(
				this.kdp.evaluate( '{' + this.instanceName + '.' + attr + '}' )
			);
		}
	}
	
	/**********************************
	 * Initialization of omnitureOnpage:
	 **********************************/
	new omnitureOnPage( document.getElementById( playerId ) );
});
