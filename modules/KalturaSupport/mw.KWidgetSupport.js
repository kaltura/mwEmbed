mw.KWidgetSupport = function( options ) {
	// Create KWidgetSupport instance
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
		$j( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ) {
			// Add hook for check player sources to use local kEntry ID source check:
			$j( embedPlayer ).bind( 'checkPlayerSourcesEvent', function( event, callback ) {				
				mw.log(" KWidgetSupport::checkPlayerSourcesEvent for " + embedPlayer.id);
				_this.checkPlayerSources( embedPlayer, function(){					
					// We can only enable kaltura analytics if we have a session if we have a client										
					if( mw.getConfig( 'Kaltura.EnableAnalytics' ) == true && _this.kClient ) {
						mw.addKAnalytics( embedPlayer, _this.kClient );
					}
					callback();
				} );	
			} );						
		} );		
	},
	
	/** 
	* kEntry Check player sources function
	* @param {Object} embedPlayer The player object
	* @param {Function} callback Function called once player sources have been checked
	*/ 
	checkPlayerSources: function( embedPlayer, callback ){
		var _this = this;	
		mw.log(' kWidgetSupport::check for sources: ' + $j( embedPlayer ).attr( 'kentryid' ) );
		// Check if entry id is a url ( add the source directly ) 
		if( $j( embedPlayer ).attr( 'kentryid' ) 
				&& 
			$j( embedPlayer ).attr( 'kentryid' ).indexOf('://') != -1 )
		{
			embedPlayer.mediaElement.tryAddSource(
				$j('<source />')
				.attr( {
					'src' : $j( embedPlayer ).attr( 'kentryid' )
				} )
				.get( 0 )
			)
			callback();
			return ;
		};
		
		// Make sure we have a widget id: 		 
		if( !$j( embedPlayer ).attr( 'kwidgetid' ) ){
			callback();
			return ;
		}
		
		// Setup Kaltura session:
		_this.getKalturaSession ( $j( embedPlayer ).attr( 'kwidgetid' ), function( ) {			
			// Get the main entry id sources
			_this.addEntryIdSource( embedPlayer, function(){
				// Load uiConf config request 
				_this.checkUiConf( embedPlayer, function(){
					callback();
				} );	
			});			
											
		} );
	},
	/**
	 * Adds the bindings for the uiConf 
	 */
	checkUiConf: function( embedPlayer, callback ){
		var _this = this;
		
		this.loadUiConfData( embedPlayer, function( uiConf ) {			
			if( !uiConf ){
				mw.log("Could not get uiConf for emmbed:" + embedPlayer.kwidgetid );
				callback();
				return; 
			}
		
			mw.log( uiConf.confFile );
			mw.log("\n\n" );
			mw.log( uiConf.confFileFeatures );

			// Check for the bumper plugin ( note we should probably have a separate uiConf js class )
			var $uiConf = $j( uiConf.confFile );
			
			// Trigger the check kaltura uiConf event
			$j( embedPlayer ).triggerQueueCallback( 'KalturaSupport.checkUiConf', $uiConf, callback);					
		
		})	
	},
	
	/**
	 * Load the ui Conf data
	 */
	loadUiConfData: function( embedPlayer, callback ){		
		// Check for uiconf data is already loaded
		if( $j( embedPlayer ).data( 'kuiconf' ) ){
			callback( $j( embedPlayer ).data( 'kuiconf' ) );
			return ; 
		}
		var uiConfId = ( embedPlayer.kuiconfid ) ? embedPlayer.kuiconfid : false; 
		if( !uiConfId && embedPlayer.kwidgetid ) {
			uiConfId = embedPlayer.kwidgetid.replace( '_', '' );
		}
		// Add the kuiconf data as an attribute: 
		var uiconfGrabber = new KalturaUiConfService(  this.kClient );		
		uiconfGrabber.get( function( status, data ) {	
			if( status ){
				$j( embedPlayer ).data( 'kuiconf', data );
				callback( $j( embedPlayer ).data( 'kuiconf' ) );
			} else{
				mw.log( "Error: loadUiConfData: failed to load uiConf data");	
				callback( )
			}
		}, uiConfId);
		return false;		
	},	
	/**
	* Get the entry ID sources and apply them to the embedPlayer
	* @param {Object} embedPlayer Player object to apply sources to
	* @param {Function} callback Function to be called once sources are ready 
	*/ 
	addEntryIdSource: function( embedPlayer, callback ) {
		var _this = this;
		var kEntryId = $j( embedPlayer ).attr( 'kentryid' );
		// Assign the partnerId from the widgetId
		mw.log( 'KWidgetSupport::addEntryIdSource:' + kEntryId);
		
		// Assign the partnerId from the widgetId ( for thumbnail )
		var widgetId =  $j( embedPlayer ).attr( 'kwidgetid' );
		this.kPartnerId = widgetId.replace(/_/g, '');	
		
		// Set the poster ( if not already set ) 
		if( !embedPlayer.poster ){
			embedPlayer.poster = mw.getConfig( 'Kaltura.CdnUrl' ) + '/p/' + this.kPartnerId + '/sp/' +
				this.kPartnerId + '00/thumbnail/entry_id/' + kEntryId + '/width/' +
				embedPlayer.getWidth() + '/height/' + embedPlayer.getHeight();
		}
		
		// local function to add sources and run callback
		var addSourcesCallback = function( sources ){
			for( var i=0;i < sources.length ; i++){
				mw.log( 'kEntryId::addSource::' + embedPlayer.id + ' : ' +  sources[i].src + ' type: ' +  sources[i].type);
				embedPlayer.mediaElement.tryAddSource(
					$j('<source />')
					.attr( {
						'src' : sources[i].src,
						'type' : sources[i].type
					} )
					.get( 0 )
				);
			}
			callback();
		}
		
		
		// Check existing sources have kaltura specific data-flavorid attribute ) 
		var sources = embedPlayer.mediaElement.getSources();
		if( sources[0] && sources[0]['data-flavorid'] ){
			// Not so clean ... will refactor once we add another source
			var deviceSources = [];
			for(var i=0; i< sources.length;i++){
				deviceSources[ sources[i]['data-flavorid'] ] = sources[i].src;
			}
			// Unset existing DOM source children ( so that html5 video hacks work better ) 
			$j('#' + embedPlayer.pid).find('source').remove();
			// Empty the embedPlayers sources ( we don't want iPad h.264 being used for iPhone devices ) 
			embedPlayer.mediaElement.sources = [];
			// Update the set of sources in the embedPlayer ( might cause issues with other plugins ) 
			addSourcesCallback( _this.getSourcesForDevice( deviceSources ) );
			return ;
		}
		
		// Get device flavors ( if not already set )
		this.getEntryIdSourcesFromApi( kEntryId, function( sources ){
			mw.log( "kEntryId:: getEntryIdSourcesFromApi::" + embedPlayer.id + " found " + sources.length + ' for entryid: ' + kEntryId + ' ' + ' partner id: ' + _this.kPartnerId );
			addSourcesCallback( sources );
		});
		
	},
	
	/**
	 * Get client entry id sources: 
	 */
	getEntryIdSourcesFromApi: function( kEntryId, callback ){
		var _this = this;
		var flavorGrabber = new KalturaFlavorAssetService( this.kClient );
		flavorGrabber.getByEntryId ( function( success, data ) {			
			if( ! success || ! data.length ) {				
				mw.log( "Error flavorGrabber getByEntryId:" + kEntryId + " no sources found ");				
				callback([]);
				return false;
			}			
			
			// Setup the src defines
			var deviceSources = {};		
			
			// Find a compatible stream
			for( var i = 0 ; i < data.length; i ++ ) {				
				var asset = data[i];			
				
				/*
				* The template of downloading a direct flavor is
				*/
				// Set up the current src string:
				var src = mw.getConfig('Kaltura.CdnUrl') + '/p/' + _this.kPartnerId +
						'/sp/' +  _this.kPartnerId + '00/flvclipper/entry_id/' +
						kEntryId + '/flavor/' + asset.id ;
								
				
				// Check the tags to read what type of mp4 source
				if( data[i].fileExt == 'mp4' && data[i].tags.indexOf('ipad') != -1 ){					
					deviceSources['iPad'] = src + '/a.mp4?novar=0';
				}
				
				// Check for iPhone src
				if( data[i].fileExt == 'mp4' && data[i].tags.indexOf('iphone') != -1 ){
					deviceSources['iPhone'] = src + '/a.mp4?novar=0';
				}
				
				// Check for ogg source
				if( data[i].fileExt == 'ogg' || data[i].fileExt == 'ogv'){
					deviceSources['ogg'] = src + '/a.ogg?novar=0';
				}				
				
				// Check for 3gp source
				if( data[i].fileExt == '3gp' ){
					deviceSources['3gp'] = src + '/a.ogg?novar=0';
				}
			}
			callback( _this.getSourcesForDevice( deviceSources ) );
		},
		/*getByEntryId @arg kEntryId */
		kEntryId );
	},
	
	getSourcesForDevice: function(  deviceSources ){
		var sources = [];
		var addSource = function ( src, type ){
			sources.push( {
				'src': src,
				'type': type
			} );
		}
		
		
		// If on an iPad or iPhone4 use iPad Source
		if( mw.isIpad() || mw.isIphone4() ) {
			mw.log( "KwidgetSupport:: Add iPad / iPhone4 source");
			// Note it would be nice to detect if the iPhone was on wifi or 3g
			if( deviceSources['iPad'] ){ 
				addSource( deviceSources['iPad'] , 'video/h264' );
				return sources;
			} else if ( deviceSources['iPhone']) {
				addSource( deviceSources['iPhone'], 'video/h264' );
				return sources;
			}
		}
		
		// If on iPhone or Android or iPod use iPhone src
		if( ( mw.isIphone() || mw.isAndroid2() || mw.isIpod() ) ){			
			if( deviceSources['iPhone'] ) {
				addSource( deviceSources['iPhone'], 'video/h264' );	
			} else if( deviceSources['3gp'] ){
				addSource( deviceSources['3gp'], 'video/3gp' );	
			}
			return sources;
		} else {
			// use h264 source for flash fallback:
			mw.log( "KwidgetSupport:: Add from flash h264 fallback" );
			if( deviceSources['iPad'] ) {
				addSource( deviceSources['iPad'], 'video/h264' );
			} else if( deviceSources['iPhone'] ) {
				addSource( deviceSources['iPhone'], 'video/h264' );
			}
		}
		
		// Add the 3gp source if available
		if( deviceSources['3gp'] ){
			addSource( deviceSources['3gp'] );
		}
		
		// Always add the oggSrc if we got to this point
		if( deviceSources['ogg'] ) {
			addSource( deviceSources['ogg'], 'video/ogg' );
		}
		return sources;
	},
	
	/**
	*  Setup The kaltura session
	* @param {Function} callback Function called once the function is setup
	*/ 
	getKalturaSession: function(widgetId,  callback ) {				 		
		var _this = this;		
		mw.log( 'KWidgetSupport::getKalturaSession: widgetId:' + widgetId );
		
		// if Kaltura session is ready jump directly to callback
		if( _this.kalturaSessionState == 'ready' ){
			// Check for entry id directly
			callback();
			return ;
		}		
		// Add the player and callback to the callback Queue
		_this.sessionReadyCallbackQueue.push( callback );
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
		this.kPartnerId = widgetId.replace(/_/, '');
		
		// Setup the kConfig		
		var kConfig = new KalturaConfiguration( parseInt( this.kPartnerId ) );
		
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
		mw.log( "KWidgetSupport::sessionSetupDone" );
		
		this.kalturaSessionState = 'ready';
		// check if the session setup failed. 
		if( !status ){
			return false;
		}
		// Once the session has been setup run the sessionReadyCallbackQueue
		while( _this.sessionReadyCallbackQueue.length ) {
			 _this.sessionReadyCallbackQueue.shift()();
		}
	}
}

//Setup the kWidgetSupport global if not already set
if( !window.kWidgetSupport ){
	window.kWidgetSupport = new mw.KWidgetSupport();
}


// Add player Manager binding ( if playerManager not ready bind to when its ready )
// NOTE we may want to move this into the loader since its more "action/loader" code
if( mw.playerManager ){	
	kWidgetSupport.addPlayerHooks();
} else {
	mw.log( 'KWidgetSupport::bind:EmbedPlayerManagerReady');
	$j( mw ).bind( 'EmbedPlayerManagerReady', function(){	
		mw.log( "KWidgetSupport::EmbedPlayerManagerReady" );	
		kWidgetSupport.addPlayerHooks();
	});	
}

/**
 * Register a global shortcuts for the kaltura client session creation 
 */
mw.getKalturaClientSession = function( widgetid, callback ){
	
	kWidgetSupport.getKalturaSession( widgetid, function(){
		// return the kClient: 
		callback( kWidgetSupport.kClient )
	});
}
mw.getEntryIdSourcesFromApi = function( entryId, callback ){
	kWidgetSupport.getEntryIdSourcesFromApi( entryId, callback);
}

