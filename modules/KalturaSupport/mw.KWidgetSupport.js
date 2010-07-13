mw.KWidgetSupport = function( options ) {
	// Create a Player Manage
	return this.init( options );
};
mw.KWidgetSupport.prototype = {

	// The Kaltura client local reference
	kClient : null,
	
	// The Kaltura session state flag ( Kaltura client ready to take requests )  
	// can be 'null', 'inprogress', 'ready' ( error results in null state ) 
	kalturaSessionState: null,	
	
	// The session Ready Callback Queue
	sessionReadyCallbackQueue : [], 
	
	// Constructor check settings etc
	init: function( options ){
	
	},
	
	/**
	* Add Player hooks for supporting Kaltura api stuff
	*/ 
	addPlayerHooks: function( ){
		var _this = this;		
		// Add the hooks to the player manager
		mw.log(  'KWidgetSupport::addPlayerHooks:: bind: newEmbedPlayerEvent' );
		$j( mw ).bind( 'newEmbedPlayerEvent', function( event, swapedPlayerId ) {		
			var embedPlayer = $j( '#' + swapedPlayerId ).get(0);
			
			// Add hook for check player sources to use local kEntry ID source check:
			$j( embedPlayer ).bind( 'checkPlayerSourcesEvent', function( event, callback ) {	
				mw.log("KWidgetSupport::checkPlayerSourcesEvent ");
				_this.checkPlayerSources( embedPlayer, function(){
					// We can only enable kaltura analytics if we have a session if we have a client										
					if( mw.getConfig( 'enableKalturaAnalytics' ) == true && _this.kClient ) {
						mw.addKAnalytics( embedPlayer, _this.kClient );
					}
					callback();
				} );				
			} );						
		} );
		
		$j( mw ).bind('newPlaylistPlayerEvent', function( event, playlistPlayer ){			
			_this.setupSession( playlistPlayer.widgetId, function(){
				// Add the kClient to the playlist player
				playlistPlayer.kClient = _this.kClient;
				// draw the playlist
				playlistPlayer.drawUI();
			})
		});
	},
	
	/** 
	* kEntry Check player sources function
	* @param {Object} embedPlayer The player object
	* @param {Function} callback Function called once player sources have been checked
	*/ 
	checkPlayerSources: function( embedPlayer, callback ){
		var _this = this;	
		// Make sure we have a widget id: 
		var widgetId = $j( embedPlayer ).attr( 'kwidgetid' ); 
		
		// Setup global Kaltura session:
		_this.setupSession ( widgetId, function( ) {
			this.addKSources( player, callback);
		} );
	},
	
	/**
	* Get the entry ID sources and apply them to the embedPlayer
	* @param {Object} embedPlayer Player object to apply sources to
	* @param {Function} callback Function to be called once sources are ready 
	*/ 
	addEntryIdSource: function( embedPlayer, callback ) {
		var kEntryId = $j( embedPlayer ).attr( 'kentryid' );
		// Assign the partnerId from the widgetId
		
		// Assign the partnerId from the widgetId ( for thumbnail  )
		var widgetId =  $j( embedPlayer ).attr( 'kwidgetid' );
		var kPartnerId = widgetId.replace(/_/g, '');

		var flavorGrabber = new KalturaFlavorAssetService( this.kClient );
		
		flavorGrabber.getByEntryId ( function( success, data ) {			
			if( ! success || ! data.length ) {				
				mw.log( "Error flavorGrabber getByEntryId:" + kEntryId + " no sources found ");				
				callback();
				return false;
			}			
			
			// Setup the src defines
			var iPadSrc = iPhoneSrc = oggSrc = null;
			
			// Set the poster
			embedPlayer.poster = 'http://cdnakmi.kaltura.com/p/' + kPartnerId + '/sp/' +
				kPartnerId + '00/thumbnail/entry_id/' + kEntryId + '/width/' +
				 embedPlayer.getWidth() + '/height/' + embedPlayer.getHeight()
			
			// Find a compatible stream
			for( var i = 0 ; i < data.length; i ++ ) {				
				var asset = data[i];			
				/*
				the template of downloading a direct flavor is
				http://cdn.kaltura.com/p/PARTNER_ID/sp/PARTNER_ID+00/flvclipper/entry_id
				/XXXXXXX/flavor/XXXXXXXX/a.mp4?novar=0
				*/
				// Set up the current src string:
				var src = 'http://cdnakmi.kaltura.com/p/' + kPartnerId +
						'/sp/' +  kPartnerId + '00/flvclipper/entry_id/' +
						kEntryId + '/flavor/' + asset.id ;
								
				
				// Check the tags to read what type of mp4 source
				if( data[i].fileExt == 'mp4' && data[i].tags.indexOf('ipad') != -1 ){					
					iPadSrc = src + '/a.mp4?novar=0';
				}
				
				// Check for iPhone src
				if( data[i].fileExt == 'mp4' && data[i].tags.indexOf('iphone') != -1 ){
					iPhoneSrc = src + '/a.mp4?novar=0';
				}
				
				// Check for ogg source
				if( data[i].fileExt == 'ogg' || data[i].fileExt == 'ogv'){
					oggSrc = src + '/a.ogg?novar=0';
				}				
			}
			
			// Shortcut function to add source
			function addSource( src, type ){
				mw.log( 'kEntryId::addSource::' + src )
				embedPlayer.mediaElement.tryAddSource(
					$j('<source />')
					.attr( {
						'src' : src,
						'type' : type
					} )
					.get( 0 )
				);
			}
			
			// If on an iPad use iPad or iPhone src
			if( navigator.userAgent.indexOf('iPad') != -1 ) {
				if( iPadSrc ){ 
					addSource( iPadSrc, 'video/h264' );
					callback();
					return ;
				} else if ( iPhoneSrc ) {
					addSource( iPhoneSrc, 'video/h264' );
					callback();
					return ;
				}
			}
			
			// If on iPhone just use iPhone src
			if( navigator.userAgent.indexOf('iPhone') != -1 && iPhoneSrc ){
				addSource( iPhoneSrc, 'video/h264' );
				callback();
				return ;
			}
			
			// If not iPhone or iPad add the iPad or iPhone h264 source for flash fallback
			if( navigator.userAgent.indexOf('iPhone') == -1 && 
				navigator.userAgent.indexOf('iPad') == -1 ){
				if( iPadSrc ) {
					addSource( iPadSrc, 'video/h264' );
				} else if( iPhoneSrc ) {
					addSource( iPhoneSrc, 'video/h264' );
				}
			}
			
			// Always add the oggSrc
			if( oggSrc ) {
				addSource( oggSrc, 'video/ogg' );
			}
			
			// Done adding sources run callback
			callback();
				
		},
		/*getByEntryId @arg kEntryId */
		kEntryId );
		
	},
	
	/**
	*  Setup The kaltura session
	* @param {Function} callback Function called once the function is setup
	*/ 
	setupSession: function(widgetId,  callback ) {				 		
		var _this = this;
		
		// if Kaltura session is ready jump directly to callback
		if( _this.kalturaSessionState == 'ready' ){
			// Check for entry id directly
			callback();
			return ;
		}		
		// Add the player and callback to the callback Queue
		_this.sessionReadyCallbackQueue.push( { 
			'player' : embedPlayer,
			'callback' : callback
		} );
		// if setup is in progress return 
		if( _this.kalturaSessionState == 'inprogress' ){
			mw.log( 'kaltura session setup in progress' );
			return;
		}
		// else setup the session: 
		if( ! _this.kalturaSessionState ) {
			_this.kalturaSessionState = 'inprogress'; 
		}
		
		// Assign the partnerId from the wdigetid
		var kPartnerId = widgetId.replace(/_/, '');
		
		// Setup the kConfig		
		var kConfig = new KalturaConfiguration( parseInt( kPartnerId ) );
		
		// Assign the local kClient
		this.kClient = new KalturaClient( kConfig );
		
		// Client session start
		this.kClient.session.startWidgetSession(
			// Callback function once session is ready 
			function ( success, data ) {				
				if( !success ){
					mw.log( "KWidgetSupport:: Error in request ");
					_this.sessionSetupDone( false );
					return ;
				}
				if( data.code ){
					mw.log( "KWidgetSupport:: startWidgetSession:: Error:: " +data.code + ' ' + data.message );
					_this.sessionSetupDone( false );
					return ;
				}				
				// update the kalturaKS var
				mw.setConfig( 'kalturaKS', data.ks ),
				mw.log('New session created::' + data.ks );
				_this.kClient.setKs( data.ks );
				
				// Run the callback 
				_this.sessionSetupDone( true );
			}, 
			// @arg "widgetId" 
			widgetId
		);					
	},
	sessionSetupDone : function( status ){
		var _this = this;
		this.kalturaSessionState = 'ready';
		// check if the session setup failed. 
		if( !status){
			return false;
		}
		// Once the session has been setup run the sessionReadyCallbackQueue
		while( _this.sessionReadyCallbackQueue.length ){
			var sessionItem =  this.sessionReadyCallbackQueue.shift();
			this.addKSources( sessionItem.player, sessionItem.callback ) ;
		}
	}	
}

// Add the playlist binding


		
// Add player Manager binding ( if playerManager not ready bind to when its ready )
// @@NOTE we may want to move this into the loader since its more "action/loader" code
if( mw.playerManager ){	
	var kEntrySupport = new mw.KWidgetSupport();
	kEntrySupport.addPlayerHooks();
} else {
	mw.log( 'KWidgetSupport::bind:EmbedPlayerManagerReady');
	$j( mw ).bind( 'EmbedPlayerManagerReady', function(){	
		mw.log("KWidgetSupport::EmbedPlayerManagerReady");
		var kWidgetSupport = new mw.KWidgetSupport();
		kWidgetSupport.addPlayerHooks();
	});	
}

