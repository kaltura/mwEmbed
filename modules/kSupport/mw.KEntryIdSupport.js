mw.KEntryIdSupport = function( options ) {
	// Create a Player Manage
	return this.init( options );
};
mw.KEntryIdSupport.prototype = {

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
		mw.log(  'addPlayerHooks:: bind: swapedPlayerIdEvent' );
		$j( mw.playerManager ).bind( 'swapedPlayerIdEvent', function( event, swapedPlayerId ) {		
			var embedPlayer = $j( '#' + swapedPlayerId ).get(0);
			
			// Add hook for check player sources to use local kEntry ID source check:
			$j( embedPlayer ).bind( 'checkPlayerSourcesEvent', function( event, callback ) {
				mw.log(" entryId:: checkPlayerSourcesEvent ");
				_this.checkPlayerSources( embedPlayer, callback );
			} );
			
			// Check for enableKalturaAnalytics and enable Analytics
			if( mw.getConfig( 'enableKalturaAnalytics' ) == true ) {
				mw.addKAnalytics( embedPlayer ) ;
			}
		});
	},
	
	/** 
	* kEntry Check player sources function
	* @param {Object} embedPlayer The player object
	* @param {Function} callback Function called once player sources have been checked
	*/ 
	checkPlayerSources: function( embedPlayer, callback ){
		var _this = this;	
		
		// Make sure we have an entry id:
		var kentryId = $j( embedPlayer ).attr( 'kentryid' ); 
		if( ! kentryid ){
			// Run the callback empty handed
			callback( false );
			return ;
		}
		// Make sure we have a widget id: 
		var widgetId
		
		// if Kaltura session is ready jump directly to entryId lookup
		if( _this.kalturaSessionState == 'ready' ){
			// Check for entry id directly
			_this.addEntryIdSources( embedPlayer, callback ) ;
		} else {		
			// Add the player and callback to the callback Queue
			_this.sessionReadyCallbackQueue.push( { 
				'player' : embedPlayer,
				'callback' : callback
			} );
			
			if( _this.kalturaSessionState == 'inprogress' ){
				mw.log( 'kaltura session setup in progress' );
			}
			
			if( ! _this.kalturaSessionState ) {
				_this.kalturaSessionState = 'inprogress'; 
				// Setup global Kaltura session:
				_this.setupSession ( widgetId, function( status ) {
					// @@TODO check if session was successful
					if( !status ){
						// No sources added ( error ) 
						callback();
					}
					// Once the session has been setup run the sessionReadyCallbackQueue
					while( _this.sessionReadyCallbackQueue.length ){
						var sessionPlayerSetup =  _this.sessionReadyCallbackQueue.shift();
						_this.addEntryIdSources( embedPlayer, callback ) ;
					}
				} );
			}
		}
	},
	
	/**
	* Get the entry ID sources and apply them to the embedPlayer
	* @param {Object} embedPlayer Player object to apply sources to
	* @param {Function} callback Function to be called once sources are ready 
	*/ 
	addEntryIdSources: function ( embedPlayer, callback ) {
		
		var kEntryId = $j( embedPlayer ).attr( 'kentryid' ); 
		
		var widgetId =  $j( embedPlayer ).attr( 'widgetid' );
		
		// Assing the partnerId from the wdigetid
		var kPartnerId = widgetId.replace(/_/, '');
		
		var flaverGrabber = new KalturaFlavorAssetService( this.kClient ); 
		flaverGrabber.getByEntryId ( function( success, data ) {
			if( ! success || ! data.length ) {
				mw.log( "Error flaverGrabber getByEntryId:: no sources found ");
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
						kentryId + '/flavor/' + asset.id ;
								
				
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
		// Assing the partnerId from the wdigetid
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
					mw.log( "Error in request ");
					callback( false );
					return ;
				}
				if( data.code ){
					mw.log( "Error:: " +data.code + ' ' + data.message );
					callback( false );
					return ;
				}
				_this.kClient.setKs( data );
				// update the kalturaKS var
				mw.setConfig( 'kalturaKS', data ),
				mw.log('New session created::' + data);
								
				// Run the callback 
				callback( true );
			}, 
			// @arg "widgetId" 
			widgetId
		);
		
	}
	
	
}
		
// Add player Mannager binding ( if playerManager not ready bind to when its ready )
// @@NOTE we may want to move this into the loader since its more "action/loader" code
if( mw.playerManager ){
	var kEntrySupport = new mw.KEntryIdSupport();
	kEntrySupport.addPlayerHooks();
} else {
	mw.log( 'bind:EmbedPlayerManagerReady');
	$j( mw ).bind( 'EmbedPlayerManagerReady', function(){	
		mw.log("RUN::EmbedPlayerManagerReady");
		var kEntrySupport = new mw.KEntryIdSupport();
		kEntrySupport.addPlayerHooks();
	});	
}


