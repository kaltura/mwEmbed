kWidget.addReadyCallback( function( playerId ){ 
	/**
	 * The main omnitureOnPage object:
	 */
	var omnitureOnPage = function( player ){
		return this.init( player );
	}
	omnitureOnPage.prototype = {
		instanceName: 'omnitureOnPage',
		sCodeLoaded: false,
		entryData: {},
		init: function( player ){
			var _this = this;
			this.kdp = player;
			this.log( 'init' );
			// unbind any existing bindings:
			this.kdp.kUnbind( '.' + this.instanceName );

			// We bind to event
			_this.bindPlayer();

			// Check for on-page s-code that already exists
			this.bind('layoutReady', function(){
				_this.sCodeCheck(function(){
					_this.setupMonitor();
					_this.bindCustomEvents();
				});
			});
		},
		cacheEntryMetadata: function(){
			this.entryData = {
				id: this.kdp.evaluate( '{mediaProxy.entry.id}' ),
				referenceId: this.kdp.evaluate( '{mediaProxy.entry.referenceId}' ),
				mediaType: this.kdp.evaluate( '{mediaProxy.entry.mediaType}' ),
				name: this.kdp.evaluate( '{mediaProxy.entry.name}' ),
				duration: this.kdp.evaluate( '{mediaProxy.entry.duration}' )
			};
		},
		getSCodeName: function(){
			return this.getConfig('s_codeVarName') || 's';
		},
		sCodeCheck: function( callback ){
			var _this = this;

			// Run sCode check once
			if( this.sCodeLoaded ) {
				return ;
			}

			var doneCallback = function() {
                //override the s_account
                if(localConfig && localConfig.s_account){
                    s.un = localConfig.s_account ;
                    s.oun = localConfig.s_account ;
                }
				_this.log( 'sCodeCheck found' );
				// Override s_code object with local configuration
				var configFuncName = _this.getConfig('s_codeConfigFunc');
				if( configFuncName && typeof window[ configFuncName ] == 'function' ) {
					var localConfig = window[ configFuncName ]();
					for( var k in localConfig ) {
						window[ _this.getSCodeName() ][ k ] = localConfig[ k ];
					}
				}

				_this.sCodeLoaded = true;

				if(callback) {
					callback();
				}
			};
			// check if already on the page: 
			if( window[ this.getSCodeName() ] && window[ this.getSCodeName() ]['Media'] ){
				doneCallback();
				return ; 
			}
			
			// check if we have scode
			if( !_this.getConfig('s_codeUrl') ){
				_this.log( "Error: s_codeUrl must be set for Omniture onPage plugin");
				return ;
			}
			kWidget.appendScriptUrl( _this.getConfig('s_codeUrl'), doneCallback );
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
 					var refId = _this.entryData.referenceId;
 					if( !refId ) 
 						refId = _this.entryData.id;
 					return [  this.getCType(), g('SiteSection'), g('PropertyCode'), 
 						g('ContentType'),  g('ShortTitle').substr(0,30), 
 						_this.getDuration(),  refId 
 						].join(':').replace(/\s/g, "_");
 				break;
 			}
			return this.entryData.name;
		},
		getDuration: function(){
			if( !this.entryData.duration ) return '';
			return this.entryData.duration.toString();
		},
		getCurrentTime: function(){
			return Math.floor( parseInt(this.getAttr('video.player.currentTime')) );
		},
		/*
		Support passing global evars to all events
		
		sample attribute config: 
		additionalEvarsAndProps="eVar51,eVar52,eVar53,eVar54,prop44"
		additionalEvarsAndPropsValues="{mediaProxy.entry.creatorId},
			{mediaProxy.entry.createdAt},{configProxy.flashvars.referer},
			{mediaProxy.entry.duration},{configProxy.flashvars.streamerType}" 
		*/
		setupMonitor: function() {
			// Exit if sCode not loaded
			if( !this.sCodeLoaded ) {
				return ;
			}

			var _this = this;
			var extraEvars = [];
			var extraEvarsValues = [];
			
			this.log( 'setupMonitor' );
			
			// get local ref to the sCode s var:
			var s = window[ this.getSCodeName() ];
			
			// Check for additional eVars and eVars values
			var additionalEvarsAndProps = this.getConfig('additionalEvarsAndProps');
			var additionalEvarsAndPropsValues = this.getConfig('additionalEvarsAndPropsValues');
			if( additionalEvarsAndProps ) {
				extraEvars = additionalEvarsAndProps.split(",");
			}
			if( additionalEvarsAndPropsValues ){
				extraEvarsValues = additionalEvarsAndPropsValues.split(",");
			}
			// Compare length between eVars and eVars values
			if( extraEvars.length !== extraEvarsValues.length ) {
				this.log( 'Addtional eVars and Values length does not match' );
			}
			// append the custom evars and props:
			s.Media.trackVars += ',' + additionalEvarsAndProps;
			
			var trackMediaWithExtraEvars = function() {
				for( var i=0; i < extraEvars.length; i++ ) {
					(function(key, val) {
						_this.log('omnitureOnPage:: eVar: ' + key + ' - eValue: ' + val);
						// Set extra eVars and eVars values on s object
						s[ key ] = val;
					})(extraEvars[i], extraEvarsValues[i]);
				}
				// Call s.track method
				s.Media.track( _this.getMediaName() );
			};

			// Check if we have monitor function
			var originalMediaFunc = s.Media.monitor;
			
			// List of events we want to track
			var trackEvents = ['OPEN', 'PLAY', 'STOP', 'SECONDS', 'MILESTONE'];

			var monitorCount = 0;
			var trackedClose = false;
			s.Media.monitor = function ( s, media ) {
				if( trackEvents.indexOf( media.event ) !== -1 ) {
					trackMediaWithExtraEvars();
				}
				if( media.event == 'CLOSE' ){
					if( !trackedClose){
						trackedClose = true;
						trackMediaWithExtraEvars();
					}
				}
				// Special case the MONITOR event.
				if( media.event == 'MONITOR' ){
					monitorCount++;
					if( monitorCount == _this.getConfig( 'monitorEventInterval' ) ){
						monitorCount = 0;
						_this.log( "Track MONITOR" );
						trackMediaWithExtraEvars();
					}
				}
				if( typeof originalMediaFunc == 'function' ) {
					originalMediaFunc( s, media );
				}
			};
		},
		bindPlayer: function(){
			this.log('bindPlayer');
			var _this = this;
			var firstPlay = true;
			var ignoreFirstChangeMedia = true;

			// setup shortcuts:
			var stop = function(){
				_this.runMediaCommand( "stop", _this.getMediaName(), _this.getCurrentTime() );
			};
			var play = function(){
				_this.runMediaCommand( "play", _this.getMediaName(), _this.getCurrentTime() );
			};
			var close = function(){
				// Exit if we already called "close"
				if( firstPlay ){
					return;
				}
				stop();
				_this.runMediaCommand( "close", _this.getMediaName() );
				firstPlay = true;
			};
			this.bind('entryReady', function() {
				kWidget.log( 'omnitureOnPage: entryReady' );
				_this.cacheEntryMetadata();
			});			
			// Run open on first play:
			this.bind( 'playerPlayed', function(){
				if( firstPlay ){
					_this.runMediaCommand( "open", 
						_this.getMediaName(), 
						_this.getDuration(), 
						_this.getMediaPlayerName() 
					)
				}
				firstPlay = false;
				play();
			});
			this.bind( 'playerSeekStart', function() {
				// Ignore HTML5 seek to 0 on PlayerPlayEnd
				if(firstPlay) return;
				stop();
			});
			this.bind( 'playerSeekEnd', function() {
				// Ignore HTML5 seek to 0 on PlayerPlayEnd
				if(firstPlay) return;
				play();
			});
			this.bind( 'doPause', stop );
			this.bind( 'playerPlayEnd', function(){
				close();
			});
			this.bind('changeMedia', function(){
				if(ignoreFirstChangeMedia){
					ignoreFirstChangeMedia = false;
					return;
				}
				close();
			});
			this.bind('onChangeMedia', function(){
				if(ignoreFirstChangeMedia){
					ignoreFirstChangeMedia = false;
					return;
				}
				close();
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
			for( var i = 0; i < customEvents.length; i++ ) {
				(function(eventName) {
					var eventId = _this.getConfig( eventName + 'Event' );
					if( ! eventId ){
						return true; // next
					}
					// Add the binding:
					_this.bind( eventName, function(){
						_this.sendNotification( eventId, eventName );
					});
				}(customEvents[i]));
			}		
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
		/**
		 * Get the media content type
		 */
		getCType: function(){
			// kaltura mediaTypes are defined here: 
			// http://www.kaltura.com/api_v3/testmeDoc/index.php?object=KalturaMediaType
			switch( this.entryData.mediaType ){
				case 1:
					return 'vid';
				break;
				case 5:
					return 'aud';
				break;
				case 2:
					return 'img';
				break;
			}
			// default to video if we can't detect content type from mime
			return 'vid';
	 	},

		runMediaCommand: function(){
			// Exit if sCode is not loaded
			if( !this.sCodeLoaded ) {
				return ;
			}
			// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Functions_and_function_scope/arguments#Description
	 		var args = Array.prototype.slice.call( arguments );
	 		var cmd = args[0];
	 		var argSet = args.slice( 1 );

	 		var s = window[ this.getSCodeName() ];
	 		try {
	 			// When using argSet.join we turn all arguments to string, we need to send them with the same type 
	 			//eval( this.getSCodeName() + '.Media.' + cmd + '("' + argSet.join('","') + '");');
	 			// not working :(
	 			//s.Media[cmd].apply( this, args );
		 		switch( cmd ) {
		 			case 'open': 
		 				s.Media.open(argSet[0], argSet[1], args[2]);
		 			break;
		 			case 'play': 
		 				s.Media.play(argSet[0], argSet[1]);
		 			break;
		 			case 'stop':
		 				s.Media.stop(argSet[0], argSet[1]);
		 			break;
		 			case 'close':
		 				s.Media.close(argSet[0]);
		 			break;
		 		}
		 	} catch( e ) {
	 			this.log( "Error: Omniture, trying to run media command:" + cmd + " failed: \n" + e );
	 		}
	 		// audit if trackEventMonitor is set:
	 		if( this.getConfig( 'trackEventMonitor') ){
		 		try{
		 			if( window[ this.getConfig( 'trackEventMonitor') ] ){
		 				window[ this.getConfig( 'trackEventMonitor') ]( this.getSCodeName() + 
		 					'.Media.' + cmd + '( "' + argSet.join('", "') + '" )' );
		 			}
		 		} catch ( e ){}
	 		}
	 	},

		/**
	 	 * Dispatches an event to omniture via the s.track(); call
	 	 * 
	 	 * This is based on AJAX event tracking docs: 
	 	 * https://microsite.omniture.com/t2/help/en_US/sc/implement/index.html#Implementing_with_AJAX
	 	 *
	 	 * @param {String} eventId The omniture event id
	 	 * @param {=String} eventName Optional eventName for logging ( not used in the omniture beacon )
	 	 * @return
	 	 */
	 	sendNotification: function( eventId, eventName ){
	 		var _this = this;
	 		// get the updated s code mapping for link tracking:
	 		var s = s_gi( s_account );
	 		this.log( "sendNotification: " + eventId + ' ' +  eventName );
	 		// mark everything we updated for logging and audit
	 		var oDebugDispatch = {};
	 		// Get the proprs and evars:
	 		var propsAndEvars = _this.getPropsAndEvars( eventName );

	 		// check if we have associated eVars:
	 		s.linkTrackVars ='';
	 		if( ! kWidget.isEmptyObject( propsAndEvars ) ){
	 			//s.Media.trackEvents += ',eVars';
	 			// Build props and evars
	 			var coma='';
				for ( var key in propsAndEvars ){
					s.linkTrackVars+=coma + key;
					coma = ',';
					s[ key ] = propsAndEvars[ key ];
					// add to log object:
					oDebugDispatch[key] = propsAndEvars[ key ];
				}
	 		}
	 		// append "events" as well:
	 		s.linkTrackVars += ',events';
 			s.events = eventId;
 			s.linkTrackEvents= eventId;
 			oDebugDispatch['events'] = s.events;
	 		
	 		// dispatch the event
	 		s.tl(this, 'o', eventId);
	 		
	 		// Log the event:
	 		try {
	 			var logMethod = this.getConfig( 'trackEventMonitor' );
	 			var logEvent = eventName || '';
	 			window[ logMethod ](
	 				logEvent,
					oDebugDispatch
				);
	 			_this.log( "s.track(), state:" +  logEvent, oDebugDispatch );
	 		} catch ( e ){ }
	 		
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
		log: function( msg ){
			kWidget.log( this.instanceName + ': ' + msg );
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
