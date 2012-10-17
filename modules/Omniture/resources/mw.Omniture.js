/**
 * Omniture plugin
 * @param embedPlayer
 * @param config
 */
( function( mw, $ ) { "use strict";
// set default Omniture sCode path: 
mw.setDefaultConfig('Omniture.ScodePath', mw.getMwEmbedPath() + '/modules/Omniture/s_code.js' );

mw.Omniture = function( embedPlayer, pluginName,  callback ){
 	return this.init( embedPlayer,  pluginName, callback );
};
mw.Omniture.prototype = {
 	init: function( embedPlayer, pluginName, callback ){
		var _this = this;
		this.pluginName = pluginName;
		// Setup reference to embedPlayer
		this.embedPlayer = embedPlayer;
 		
 		if( !this.getConfig('trackingServer') ){
 			mw.log( "Error:: mw.Omniture missing tracking server" );
 		}
 		if( !this.getConfig('account') ){
 			mw.log( "Error: mw.Omniture missing account name" );
 		}
 		this.loadSCode( function(){
 			// Setup the omniture page code
 			_this.addPageCode();
 			
 			// Add omniture events that require conditional mapping 
 			_this.addProceduralEvents();
 			
 			// Add any bindings related to directly listed configuration events
 			_this.addNamedEvents();
 			
 	 		// After all bindings are setup issue the callback
 	  		callback();
 		});
 	},
 	getConfig: function( key ){
 		// Make sure all the config takes flash override values or what's in the uiconf
 		return this.embedPlayer.getKalturaConfig( this.pluginName, key );
 	},
 	loadSCode: function( callback ){
 		var sCodePath = this.getConfig ( 'sCodePath' ) || mw.getConfig('Omniture.ScodePath');
 		$.getScript(sCodePath, function(){
 			callback();
 		});
 	},
 	/**
 	 * Adds the omniture "page code" 
 	 */
 	addPageCode: function(){
 		var directMapingVars = [ 'trackingServer', 'account', 'charSet', 'currencyCode'];
 		var _this = this;
 		$.each( directMapingVars, function( inx, key ){
 			if( _this.getConfig( key ) ){
 	 			s[ key ] = _this.getConfig( key );
 	 		}
 		});
		// Namespace can include * that needs to be changed to "."
		var vnp = this.getConfig('visitorNamespace');
		if( vnp ){
			if( vnp.indexOf( "*" ) != -1 ){
				vpn = vnp.split( "*" ).join( "." );
			}
			s.visitorNamespace = vnp;
		}
		// Try to access parent iframe data else use flashvars
		try {
			s.pageName = window.parent.document.title;
			s.pageUrl = window.parent.location;
		} catch ( e ){
			// could not access parent 
		}
		s.Media.trackWhilePlaying = true;
		s.Media.segmentByMilestones = this.getConfig( 'segmentByMilestones' );
		s.Media.contextDataMapping = this.getMediaMapping();
		
		s.Media.playerName = this.getUiConfName();
		
 	},
 	getUiConfName: function(){
 		// NOTE: the KDP version access cp.vo.kuiConf.name ... We don't have that in html5. 
 		return 'localPlayer'
 	},
 	getMediaMapping: function(){
 		var _this = this;
 		var contextObj = {
			'a': { 
				'media': {}
			}
		};
 		var a = contextObj.a;
 		var media = a.media;
 		if( this.getConfig( 'contentType') ){
 			a.contentType = this.getConfig( 'contentType');
 		}
 		if( this.getConfig( 'timePlayed' ) ){
 			media.timePlayed = this.getConfig( 'timePlayed' )
 		}
 		var directMediaMap = ['mediaName', 'mediaSegment', 'mediaSegmentView',
 		                      'mediaView', 'mediaComplete'
 		                      ]
 		$.each( directMediaMap, function( inx, mKey ) {
 			if( _this.getConfig( mKey ) ){
 				var catKey = mKey.replace( 'media', '' );
 				catKey = catKey.charAt(0).toLowerCase() + catKey.slice(1);
 				media[ catKey ] = _this.getConfig( mKey );
 			}
 		});
 		
 		if( this.getConfig( 'milestonesEvents' ) && this.getConfig( 'trackMilestones') ){
 			var milestones = this.getConfig( 'milestonesEvents' ).split( ',' );
 			var trackMilestones = this.getConfig( 'trackMilestones' ).split( ',' );
 			var mObject = {};
 			for( var i = 0 ; i < milestones.length ; i++){
 				mObject[ milestones[i] ] = trackMilestones[i];
 			}
 			media['milestones'] = mObject; 
 		}
 		return contextObj;
 	},
 	/**
 	 * Adds all the base player tracking events supported by the omniture Media module
 	 */
 	addProceduralEvents: function(){
 		var embedPlayer = this.embedPlayer;
 		var _this = this;
 		// Add the respective binding per config options: 
 		var proceduralConfig = [ 
 		                         'mediaView',
 		                         'mediaComplete',
 		                         'trackMilestones'
 		                         ]
 		$.each(proceduralConfig, function( inx, pcKey ){
 			if( _this.getConfig( pcKey ) ){
 				_this[ pcKey + 'Bind' ]();
 			}
 		} )
 		// Add the media ready binding: 
 		embedPlayer.addJsListener( 'mediaReady', function(){
 			_this.runMediaCommand( 'open',
				embedPlayer.evaluate( '{mediaProxy.entry.name}' ),
				embedPlayer.duration, 
				_this.getUiConfName()
 			);
 		});
 		embedPlayer.addJsListener( 'playerSeekEnd', function(){
 			// kdp includes a "media.play" call on seek end. 
 			_this.runMediaCommand( 'play',
				embedPlayer.evaluate( '{mediaProxy.entry.name}' ),
				_this.getCurrentTime()
 			);
 		});
 		embedPlayer.addJsListener( 'pause', function(){
 			_this.runMediaCommand( 'stop',
				embedPlayer.evaluate( '{mediaProxy.entry.name}' ),
				_this.getCurrentTime()
 			);
 		});
 	},
 	trackMilestonesBind: function(){
 		var _this = this;
 		var embedPlayer = this.embedPlayer;
 		var trackMilestones = this.getConfig( 'trackMilestones').split(','); // i.e: '25,50,75'
 		var milestonesEvents = this.getConfig( 'milestonesEvents').split(','); // i.e: 'event25,event50,event75'
 		
 		var percEvents = {}
 		// use a try catch in lue of lots of array value checks 
 		try{
	 		for( var i=0; i < trackMilestones.length ; i++ ){
	 			percEvents[ trackMilestones[i] ] = milestonesEvents[i];
	 		}
 		} catch ( e ){
 			mw.log("Error: omniture error in milestoe mapping" );
 		}
 		var completedMilestones = [];
 		var playTime = 0;
 		var lastTime = 0;
 		// Add playhead progress check 
 		embedPlayer.addJsListener( 'playerUpdatePlayhead', function(){
 			var curPerc = ( _this.getCurrentTime() / embedPlayer.duration ) * 100;
 			$.each( percEvents, function( perc, eventId ){
 				if( curPerc > parseInt( perc ) && $.inArray( perc, completedMilestones ) === -1 ){
 					// send notification for the current percentage reached: i.e event25 for 25 
 					var percEventId = eventId;
 					percEventId+= ',' + _this.getConfig( 'mediaSegmentView' ) || '';
 					percEventId+= ',' + parseInt( playTime ) + '=' + _this.getCurrentTime();
 						
 					_this.sendNotification( percEventId, 'percentageReached' );
 					completedMilestones.push( perc );
 				}
 			});
 		});
 	},
 	/**
 	 * Only carry 3 significant digits 
 	 */
 	getCurrentTime: function(){
 		return Math.round( this.embedPlayer.currentTime * 1000 ) / 1000;
 	},
 	mediaCompleteBind: function(){
 		var embedPlayer = this.embedPlayer;
 		embedPlayer.addJsListener( 'playerPlayEnd', function(){
 			_this.runMediaCommand( 'stop',
 				embedPlayer.evaluate( '{mediaProxy.entry.name}' ),
 				_this.getCurrentTime()
 			); 
 			_this.runMediaCommand( 'close',
				embedPlayer.evaluate( '{mediaProxy.entry.name}' )
			);
 		});
 	},
 	mediaViewBind: function(){
 		var _this = this;
 		var embedPlayer = this.embedPlayer;
			
 		// Only triggered after the sequence proxy is done and content is playing:  
 		embedPlayer.addJsListener( 'playerPlayed', function(){
 			// Send start of media "play"
 			_this.runMediaCommand( 'play',
 					embedPlayer.evaluate( '{mediaProxy.entry.name}' ), 
 					0
			);
 			if( embedPlayer.autoplay ){
 				_this.sendNotification( _this.getConfig( 'mediaView' ), "videoAutoPlay" );
 			} else {
 				_this.sendNotification( _this.getConfig( 'mediaView' ), "videoView" );
 			}
 			
 			// bind "resume" ( after initial play )
 	 		embedPlayer.addJsListener( 'doPlay', function(){
 	 			_this.runMediaCommand( 'play',
 					embedPlayer.evaluate( '{mediaProxy.entry.name}' ), 
 					_this.getCurrentTime()
 				);
 	 		});
 		});
 		
 		embedPlayer.addJsListener( 'preSequenceComplete', function(e, slotType){
 			// Segment support? 
 			/*if( slotType == 'midroll'){
 				// issue the media play call for segment resume: 
 				_this.runMediaCommand( 'play',
 					embedPlayer.evaluate( '{mediaProxy.entry.name}' ), 
 					_this.getCurrentTime()
	 			);
 			}*/
 		});
 	},
 	/**
 	 * Adds any player config based event tracking
 	 */
 	addNamedEvents: function(){
 		var _this = this;
 		var omintureEvents = [
 		    'playerLoaded',
 			'openFullscreen',
			'closefullscreen',
 		                      
			'share',
			'save',
			'replay',
			'seek',
			
			'changeMedia',
			'mediaReady',
			'watermarkClick',
			'playerPlayEnd',
		    'adStart',
 		    'adEnd'
		];
 		var customEvents = this.getConfig( 'customEvents' );
 		if( customEvents ){
 			customEvents = customEvents.split( ',' );
 			// merge any custom events:
 			omintureEvents = $.merge( omintureEvents, customEvents );
 		}
 		
		var embedPlayer = this.embedPlayer;
		// Get all the plugin config for all the omniture events 
		$.each( omintureEvents , function( inx, eventName){
			var eventId = _this.getConfig( eventName + 'Event' );
			if( ! eventId ){						
				return true; // next
			}
			var propsAndEvars = _this.getPropsAndEvars( eventName );
			// Add the binding: 
			var kEventName = eventName.replace( 'Event', '');
			embedPlayer.addJsListener( kEventName, function(){
				_this.sendNotification( eventId, kEventName );
			});
		});
 	},
 	getPropsAndEvars: function( eventName ){
 		var _this = this;
 		var propsAndEvars = {};
 		// all event keys are postfixed with Event
 		eventName+= 'Event';
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
 	runMediaCommand: function(){
 		var args = $.makeArray( arguments );
 		var cmd = args[0];
 		var argSet = args.slice( 1 );
 		try{
 			eval( 's.Media.' + cmd + '("' + argSet.join('","') + '");');
 			// not working :( 
 			//s.Media[cmd].apply( this, args );
 		}catch( e ){
 			mw.log("Error: Omniture, trying to run media command:" + cmd + ' does not exist');
 		}
 		
 		// for audit: 
 		try{
 			window.parent.omnitureLogMediaCall( args );
 		} catch ( e ){ }
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
 		s.Media.trackEvents = "events";

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
 			window.parent[logMethod](
				eventName || '', 
				oDebugDispatch 
			);
 		} catch ( e ){ }
 		// dispatch the event
 		s.track();
 	}
};

} )( mw, jQuery );