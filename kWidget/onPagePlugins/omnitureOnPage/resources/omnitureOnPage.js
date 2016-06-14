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
		
		// event queues
		mediaQueue:[], 
		notificationQueue: [],
		
		// track waiting for scode propagation 
		_startWaitTime: null,
		// flasg to make sure we setup monitor only once
		layoutReadyCalled: false,

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
				// check that plugin is enabled: 
				if( _this.getConfig('plugin') == false ){
					return ;
				}
				if ( !_this.layoutReadyCalled ){
					_this.sCodeCheck(function(){
						// process any queued events now that sCode is available:
						_this.proccessMediaQueue();
						_this.proccessNotificationQueue();
					});
					// bind for events as soon as layout is Ready ( proxy events while player checks for sCode )
					_this.bindCustomEvents();
					_this.layoutReadyCalled = true;
				}
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
		sCodeCheck: function( callback, faliedCallback ){
			var _this = this;
			
			// Only run sCode check once
			if( this.sCodeLoaded ) {
				return ;
			}
			// will check for scode in a loop for sCodeAvailableTimeout time
			this.checkForScodeAndLoad( function(){
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
				// once sCode is ready setup the monitor
				_this.setupMonitor();

				if(callback) {
					callback();
				}
			}, function(){
				// failed to load scode:
				_this.kdp.sendNotification("omnitureScodeError");
				_this.log( "Error: failed to load s-code")
			})
		},
		isScodeReady: function(){
			return ( window[ this.getSCodeName() ] && window[ this.getSCodeName() ]['Media']);
		},
		checkForScodeAndLoad: function( readyCallback, failedCallback ){
			var _this = this;
			if(  this.isScodeReady() ){
				readyCallback();
				return ;
			}
			// init startWaitTime
			if( !this._startWaitTime){
				this._startWaitTime = new Date().getTime();
			}
			var waitedTime = new Date().getTime() - this._startWaitTime
			// check if we are waiting: 
			if( waitedTime > this.getTimeoutMs() ){
				// failed waitTime is > then sCodeAvailableTimeout load local copy: 
				kWidget.appendScriptUrl( _this.getConfig('s_codeUrl'), function(){
					if( _this.isScodeReady() ){
						readyCallback();
					} else {
						failedCallback();
					}
				} );
				// kWidget does not have a failed timeout, give it 10 seconds to load
				setTimeout(function(){
					// only issue a fail if we never got success callback: 
					// Note this will result in two fails where s_codeUrl is invalid )
					if( !_this.isScodeReady() ){
						failedCallback();
					}
				},10000 );
				return ;
			}
			// else loop
			setTimeout(function(){
				_this.checkForScodeAndLoad( readyCallback, failedCallback );
			}, 50 );
		},
		// get timeout in Ms: 
		getTimeoutMs: function(){
			return ( this.getConfig( 'sCodeAvailableTimeout' ) ) ? 
					this.getConfig( 'sCodeAvailableTimeout' ) * 1000 :
					5000;
		},
		/** Getters **/
		getMediaPlayerName: function(){
			return 'Kaltura Omniture OnPage v' + mw.getConfig('version'); 
		},

		trimSpaces: function(str) {
			// shortcut to custom data with trimming spaces if exists
			str = str.replace(/^\s+/, '');
			for (var i = str.length - 1; i >= 0; i--) {
				if (/\S/.test(str.charAt(i))) {
					str = str.substring(0, i + 1);
					break;
				}
			}
			return str;
		},

		getMediaName: function(){
	 		var _this = this;
	 		var g = function( key ){
	 			return _this.trimSpaces(_this.getAttr( 'mediaProxy.entryMetadata.' + key ) || '_');
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
			// this allows to override the media name by configuration E.G. MY_PREFIX_{mediaProxy.entry.id}
			// will output a media name with prefix.
			if(_this.getConfig( 'mediaName' )) {
				return _this.kdp.evaluate(_this.getConfig( 'mediaName' ));
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

		setupEvarsAndProps : function(){
			var extraEvars = [];
			var extraEvarsValues = [];
			var s = window[ this.getSCodeName() ];

			this.log( 'setupMonitor' );

			// get local ref to the sCode s var:

			// Check for additional eVars and eVars values
			var additionalEvarsAndProps = this.getConfig('additionalEvarsAndProps');
			var additionalEvarsAndPropsValues = this.getConfig('additionalEvarsAndPropsValues');
			if( additionalEvarsAndProps ) {
				extraEvars = additionalEvarsAndProps.split(",");
			}
			if( additionalEvarsAndPropsValues ){
				// custom delimiter is used in situations when
				// some evaluated extraValues contain comma character
				// because this.getConfig('additionalEvarsAndPropsValues')
				// returns already evaluated values
				var extraEvarsValuesDelimiter = this.getConfig('additionalEvarsAndPropsValuesDelimiter') || ',';
				extraEvarsValues = additionalEvarsAndPropsValues.split(extraEvarsValuesDelimiter);
				for( var j=0; j < extraEvarsValues.length; j++ ) {
					extraEvarsValues[j] = this.kdp.evaluate(extraEvarsValues[j]);
				}
			}
			// Compare length between eVars and eVars values
			if( extraEvars.length !== extraEvarsValues.length ) {
				this.log( 'Addtional eVars and Values length does not match' );
			}
			// append the custom evars and props:
			s.Media.trackVars = undefined;
			s.Media.trackVars += ',' + additionalEvarsAndProps;
			var _this = this;

			this.trackMediaWithExtraEvars = function() {
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
			if( !this.sCodeLoaded) {
				return ;
			}
			var s = window[ this.getSCodeName() ];

			this.setupEvarsAndProps();

			// Check if we have monitor function
			var originalMediaFunc = s.Media.monitor;
			
			// List of events we want to track
			var trackEvents = ['OPEN', 'PLAY', 'STOP', 'SECONDS', 'MILESTONE'];
			var monitorCount = 0;
			var trackedClose = false;
			s.Media.autoTrack= typeof this.getConfig('autoTrack') == 'undefined' ? true : this.getConfig('autoTrack') ;
			s.Media.trackWhilePlaying = typeof this.getConfig('trackWhilePlaying')  == 'undefined' ? true : this.getConfig('trackWhilePlaying');
			if(this.getConfig("trackMilestones")){
				s.Media = this.getConfig("trackMilestones");
			}else{
				s.Media.trackMilestones="25,50,75";
			}
			var _this = this;
			s.Media.monitor = function ( s, media ) {
				var inArray = false;
				for (var i = 0; i < trackEvents.length; i++){
					if(media.event ===  trackEvents[i]){
						inArray = true;
						break;
					}
				}
				if( inArray ) {
					_this.trackMediaWithExtraEvars();
				}
				if( media.event == 'OPEN' ){
					trackedClose = false;
				}
				if( media.event == 'CLOSE' ){
					if( !trackedClose){
						trackedClose = true;
						_this.trackMediaWithExtraEvars();
					}
				}
				// Special case the MONITOR event.
				if( media.event == 'MONITOR' ){
					monitorCount++;
					if( monitorCount == _this.getConfig( 'monitorEventInterval' ) ){
						monitorCount = 0;
						_this.log( "Track MONITOR" );
						_this.trackMediaWithExtraEvars();
					}
				}
				if (media.mediaEvent == "MILESTONE"){
					_this.runMediaCommand( "monitor", _this.getMediaName(), media.mediaEvent);
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
				_this.runMediaCommand( "close", _this.getMediaName() );
				firstPlay = true;
			};
			var adOpen = function(adID, adSystem, type, adIndex){
				if ( type !== "overlay" ){
					_this.runMediaCommand( "openAd",adID, -1, adSystem, _this.getMediaName(), type, adIndex);
				}
			};
			var complete = function(adID, position, type){
				if ( type !== "overlay" ){
					_this.runMediaCommand( "complete",adID, position);
					_this.runMediaCommand( "stop",adID, position);
					_this.runMediaCommand( "close",adID);
				}
			};

			this.bind('entryReady', function() {
				kWidget.log( 'omnitureOnPage: entryReady' );
				_this.cacheEntryMetadata();
			});
			// Run open on first play and replay:
			this.bind( 'firstPlay replayEvent', function(){
				if( firstPlay ){
					if ( _this.getConfig( 'triggerPlayFirst' ) === true ){
						play();
						_this.runMediaCommand( "open", _this.getMediaName(), _this.getDuration(), _this.getMediaPlayerName() );
					}else{
						_this.runMediaCommand( "open", _this.getMediaName(), _this.getDuration(), _this.getMediaPlayerName() );
						play();
					}
				}
				firstPlay = false;
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
			this.bind( 'userInitiatedPlay', function(){
				if (!firstPlay){
					play();
				}
			} );
			this.bind( 'AdSupport_midSequenceComplete', play );
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
			this.bind('onAdOpen', adOpen);
			this.bind('onAdComplete', complete);
			this.bind('onAdPlay', function(adName, adSystem, type, adIndex){
				if ( type !== "overlay" ){
					_this.runMediaCommand( "play",adName, 0);
				}
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
				}(_this.trimSpaces(customEvents[i])));
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
			// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Functions_and_function_scope/arguments#Description
	 		var args = Array.prototype.slice.call( arguments );
	 		// always push event to queue: 
	 		this.mediaQueue.push( args );
	 		// Exit if sCode is not loaded exit
			if( !this.sCodeLoaded ) {
				return ;
			}
			// process queue: 
			this.proccessMediaQueue();
		},
		proccessMediaQueue: function(){
			if( ! this.mediaQueue.length ){
				return ;
			}
			var x;
			while(x = this.mediaQueue.shift()){ 
				this.runMediaCommandWithArgs( x );
			}
		},
		runMediaCommandWithArgs: function( args ){
			var eventsTimeout = 0; //eventsTimeout is a new configuration, delay time in seconds
			if (this.getConfig("eventsTimeout")){
					eventsTimeout = this.getConfig("eventsTimeout")*1000;
			}
			var _this = this;
			var _args = args;
			if(eventsTimeout){
				setTimeout(function(){
					_this.executeMediaCommandWithArgs(_args);
				} , eventsTimeout )
			}else{
				this.executeMediaCommandWithArgs(args);
			}
	 	},
		executeMediaCommandWithArgs : function(args){
			var s = window[ this.getSCodeName() ];
			var cmd = args[0];
			var argSet = args.slice( 1 );
			try {
				// When using argSet.join we turn all arguments to string, we need to send them with the same type
				//eval( this.getSCodeName() + '.Media.' + cmd + '("' + argSet.join('","') + '");');
				// not working :(
				//s.Media[cmd].apply( this, args );

				if(this.getConfig("overridePlayerName") != undefined ){
					s.Media.playerName = String(this.getConfig("overridePlayerName"));
				}
				if ( !s.inAd && cmd !== 'openAd') {
					// re-evaluate mediaName even it it was already pushed to the stack
					argSet[0] = this.getMediaName();
				}
				switch( cmd ) {
					case 'open':
						this.setupEvarsAndProps();
						s.Media.open(argSet[0], argSet[1], argSet[2]);
						this.previousName = argSet[0];
						break;
					case 'play':
						s.Media.play(argSet[0], argSet[1]);
						break;
					case 'stop':
						s.Media.stop(argSet[0], argSet[1]);
						break;
					case 'close':
						if(this.getConfig("dynamicMediaName") == true){
							s.Media.close(this.previousName);
						}else{
							s.Media.close(argSet[0]);
						}
						s.inAd = false;
						break;
					case 'openAd':
						s.inAd = true;
						s.Media.openAd(argSet[0], argSet[1], argSet[2],argSet[3], argSet[4], argSet[5]);
						break;
					case 'complete':
						s.Media.complete(argSet[0], argSet[1]);
						break;
					case 'monitor':
						s.Media.monitor(argSet[0], argSet[1]);
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
	 		// always add: 
	 		this.notificationQueue.push( [eventId, eventName ] );
	 		// exit if sCode is not ready
	 		if( !this.isScodeReady() ){
	 			return ;
	 		}
	 		this.proccessNotificationQueue();
	 	},
	 	proccessNotificationQueue: function(){
	 		if( !this.notificationQueue.length ){
	 			return ;
	 		}
	 		var x;
			while( x = this.notificationQueue.shift() ){ 
				this.sendNotificationBeacon( x[0], x[1] );
			}
	 	},
	 	sendNotificationBeacon: function( eventId, eventName){
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
