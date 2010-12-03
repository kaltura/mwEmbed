/*
 * Add full kaltura mapping support to html5 based players
 * Based on the 'kdp3 javascript api'
 * http://www.kaltura.org/demos/kdp3/docs.html#jsapi
 */

// scope in mw
( function( mw ) {
 
	mw.KDPMapping = function( options ) {
		// Create a Player Manage
		return this.init( options );
	};
	mw.KDPMapping.prototype = {
		/**
		* Add Player hooks for supporting Kaltura api stuff
		*/ 
		init: function( ){
			this.addGlobalReadyHook();
			this.addPlayerHooks();		 	
		},
		
		addGlobalReadyHook: function(){
			mw.playerManager.addCallback(function(){
				// Fire the global ready
				if( window.jsCallbackReady ){
					window.jsCallbackReady();
				}			
			})
		},
		
		addPlayerHooks: function(){
			var _this = this;
			// Add the hooks to the player manager			
			$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ) {						
				// Add the addJsListener and sendNotification maps
				embedPlayer.addJsListener = function(listenerString, callback){
					_this.bindListenEvent( embedPlayer, listenerString, callback )
				}
				
				embedPlayer.sendNotification = function( notificationName, notificationData ){
					_this.sendNotification( embedPlayer, notificationName, notificationData)
				}
			});
		},
		
		/**
		 * Master event list
		 */
		bindListenEvent: function( embedPlayer, eventName, callback ){
			switch( eventName ){
				case 'volumeChanged': 
					$j( embedPlayer ).bind('volumeChanged', function(percent){
						callback( {'newVolume' : percent }, embedPlayer.id );
					});
					break;
				case 'playerStateChange':
					
					// Kind of tricky should do a few bindings to 'pause', 'play', 'ended', 'buffering/loading'
					$j( embedPlayer ).bind('pause', function(){						
						callback( 'pause', embedPlayer.id );
					});
					
					$j( embedPlayer ).bind('play', function(){
						mw.log('PLAYBIND:: mw.KDPMapping ');
						callback( 'play', embedPlayer.id );
					});
					
					break;
				case 'durationChange': 
					// TODO add in duration change support
					break;
				case 'playerUpdatePlayhead':
					$j( embedPlayer).bind('monitorEvent', function(){
						callback( embedPlayer.currentTime,  embedPlayer.id );
					})
					break;				
			}
				
		},
		
		/**
		 * Master send action list: 
		 */
		sendNotification: function( embedPlayer, notificationName, notificationData ){			
			switch( notificationName ){
				case 'doPlay':
					embedPlayer.play();
					break;
				case 'doPause':
					embedPlayer.pause();
					break;
				case 'doStop':
					embedPlayer.stop();
					break;
				case 'doSeek':
					// Kaltura doSeek is in seconds rather than percentage:
					var percent = parseFloat( notificationData ) / embedPlayer.getDuration();
					embedPlayer.doSeek( percent );
					break;
				case 'changeVolume':
					embedPlayer.setVolume( parseFloat( notificationData ) );
					break;
				
			}
		}
	};	
		
	// Setup the KDPMapping
	if( mw.playerManager ){	
		window.KDPMapping = new mw.KDPMapping();	
	} else {
		mw.log( 'KDPMapping::bind:EmbedPlayerManagerReady');		
		$j( mw ).bind( 'EmbedPlayerManagerReady', function(){									
			if(!window.KDPMapping ){
				mw.log( "KDPMapping::EmbedPlayerManagerReady" );	
				window.KDPMapping = new mw.KDPMapping();	
			}
		});	
	}

	
} )( window.mw );