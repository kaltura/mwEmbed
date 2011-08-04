( function( mw, $ ) {

mw.addFreeWheelControler = function( embedPlayer, config, callback ) {
	embedPlayer.freeWheelAds = new mw.freeWheelControler({ 
		'embedPlayer' : embedPlayer,
		'config' : config,
		'callback' :  callback
	});	
	mw.freeWheelGlobalContextInstance = embedPlayer.freeWheelAds;
};

mw.freeWheelControler = function( opt ){
	return this.init( opt );
};

mw.freeWheelControler.prototype = {
	
	// The freeWheel adManager 
	adManager: null,
	
	// The ad Context:
	adContext: null,
	
	// The ad data requested
	adDataRequested : false,
	
	// The pre video url
	contentVideoURL : null, 
	
	// prerollSlots
	prerollSlots : [],
	
	// midroll_overlaySlots
	midroll_overlaySlots : [],
	
	// postrollSlots
	postrollSlots: [],
	
	// slotPlaying 
	slotPlaying: false,
	
	/**
	 * Initialize the adMannager javascript and setup adds
	 * 
	 * @param {Object} opt Object 
	 * {
	 * 	'embedPlayer' {object} the embedPlayer instance
	 * 	'config' {object} any freewheel configuration
	 * 	'callback' {function} called on load complete
	 * }
	 * @return
	 */
	init: function( opt ){
		var _this = this;
		$.extend( this, opt);
		
		// XXX temporary override config for testing
		this.config = {
			'networkId': 96749,
			'serverUrl' : 'http://sdnyadvip1-d.fwmrm.net/ad/g/1',
			'videoAssetId' : 'DemoVideoGroup.01',
			'videoDuration' : 500
		};
		
		
		// Load the ad manager url:
		// XXX todo we should be able to read this from "adManagerUrl"
		var AdManagerUrl = mw.getConfig( 'FreeWheel.AdManagerUrl' );
		
		//$.getScript(AdManagerUrl, function(){
		// For debugging use local copy: 
		mw.load( 'tv.freewheel.SDK', function(){
			_this.setupAds();
		});
	},
	/**
	 * Setup ads, main freeWheel control flow
	 * @return
	 */
	setupAds: function(){
		var _this = this;
		
		// Add key-values for ad targeting.
		this.addContextKeyValues();
		
		// Listen to AdManager Events
		this.addContextListners();
		
		// Set context timeout
		this.setContextTimeout();

		// Add the temporal slots for this "player"
		this.addTemporalSlots();

		// Add local companion targets
		this.addCompanionBindings();
		
		// XXX FreeWheel sets SVLads003 as the response? 
		window['SVLads003'] = true;
		
		// Load add data ( will call onRequestComplete once ready )
		mw.log("freeWheelController::submitRequest>");
		this.getContext().submitRequest();
	},
	/**
	 * Called on the completion of freeWheel add loading
	 * @param event
	 * @return
	 */
	onRequestComplete: function( event ){
		var _this = this;
		mw.log("freeWheelController::onRequestComplete>");
		if ( event.success ){
			var fwTemporalSlots = _this.getContext().getTemporalSlots();
			for (var i=0; i < fwTemporalSlots.length; i++){
				var slot = fwTemporalSlots[i];
				switch ( slot.getTimePositionClass() ){
					case tv.freewheel.SDK.TIME_POSITION_CLASS_PREROLL:
						_this.prerollSlots.push(slot);
						break;
					case tv.freewheel.SDK.TIME_POSITION_CLASS_MIDROLL:
					case tv.freewheel.SDK.TIME_POSITION_CLASS_OVERLAY:
						_this.midroll_overlaySlots.push(slot);
						break;
					case tv.freewheel.SDK.TIME_POSITION_CLASS_POSTROLL:
						_this.postrollSlots.push(slot);
						break;
				}
			}
			if( _this.prerollSlots[0] )
				_this.prerollSlots[0].play();
		}
		// issue the "ready callback"
		_this.callback();
	},
	/**
	 * Adds local companion targets ( if they  exists ) for easy passing across iframe 
	 * @return
	 */
	addCompanionBindings: function(){
		var _this = this;
		mw.log("freeWheelController::addCompanionBindings>");
		// Add some hidden companion targets if we are running in an iframe
		if( !mw.getConfig('EmbedPlayer.IsIframeServer') ){
			return ;
		}
		// Setup the embedPlayer server setFreeWheelAddCompanions method
		this.embedPlayer.setFreeWheelAddCompanions = function( companionSet ){
			_this.addCompanionTargets( companionSet );
		};
		
		// Trigger the adding of any server side bindings: 
		$( this.embedPlayer ).trigger( 'FreeWheel_GetAddCompanions' );
		// we now monitor for companion html changes and pass that across the iframe 
		this.monitorForCompanionChanges();
	},
	monitorForCompanionChanges: function(){
		var _this = this;
		var companionStateCache = {};
		setInterval(function(){
			$('#fw_companion_container').find( '._fwph').each(function(inx, node){
				var id = $(node).attr('id');
				var curHtml = $('#_fw_container_' + id ).html(); 
				if( curHtml && companionStateCache[ id ] != curHtml){
					$( _this.embedPlayer ).trigger('FreeWheel_UpdateCompanion', {
						'id' : id,
						'content' : curHtml
					});
					companionStateCache[ id ] = curHtml;
				}
			});
		},1000);
	},
	/**
	 * Add hidden companion targets for companions to be passed overt the iframe
	 * @param companionSet
	 * @return
	 */
	addCompanionTargets: function( companionSet ){
		if(! $('#fw_companion_container').length ){
			$('body').append( $('<div />').attr('id', 'fw_companion_container' ) );
		}
			
		$.each(companionSet, function(inx, companion){
			var id =  companion.id;
			$('#fw_companion_container').append( 
				$('<span />').attr('id', id ).addClass( '_fwph' )
				.css('display', 'none')
				.append(
					$('<form />').attr('id', '_fw_form_' + id )
					.append(
						$('<input type="hidden"/>').attr({
							'name' : '_fw_input_' + id,
							'id' : '_fw_input_' + id
						})
					),
					$('<span />').attr('id', '_fw_container_' + id )
				)
			);
		});
		mw.log( 'freeWheelController:: addCompanionTargets: Added:' + $('#fw_companion_container ._fwph').length + ' targets' );
	},
	/**
	 * Gets a property from config if possible
	 * @param propId
	 * @return
	 */
	getProperty: function( propId ){
		// Check if the property was set in config: 
		if( this.config[propId] ){
			return this.config[propId];
		}
		mw.log( "freeWheelController:: getProperty: " + propId + ' unset' );
		// XXX some default copied from freeWheelSample.html
		// TODO don't use these values! 
		switch( propId ){
			case 'profileId':
				return 'global-js';
				break;
			case 'displayBaseId':
				return 'displayBase';
				break;
			case 'siteSectionId' :
				return 'DemoSiteGroup.01';
				default: 
				
			break;
		}
	},
	getAdManager: function(){
		if( !this.adManager ){
			this.adManager = new tv.freewheel.SDK.AdManager();
			this.adManager.setNetwork( parseInt( this.getProperty( 'networkId' ) ) );
			this.adManager.setServer( this.getProperty('serverUrl') );
		}
		return this.adManager;
	},
	getContext: function(){
		if( !this.adContext ){
			this.adContext = this.getAdManager().newContext();
			
			this.adContext.registerVideoDisplayBase( 'videoContainer' );
			this.adContext.setProfile( this.getProperty( 'profileId' ) );
			
			this.adContext.setVideoAsset( 
					this.getProperty( 'videoAssetId' ),
					this.getProperty( 'videoDuration' ),
					this.getProperty( 'networkId' )
			);
			this.adContext.setSiteSection( 
					this.getProperty('siteSectionId') , 
					this.getProperty( 'networkId' ) 
			);
		}
		return this.adContext;
	},
	addContextKeyValues: function(){
		mw.log("freeWheelController::freeWheelController>")
		// XXX todo read key value pairs from plugin config ?
		var context = this.getContext();
		context.addKeyValue("module","DemoPlayer");
		context.addKeyValue("feature","trackingURLs");
		context.addKeyValue("feature", "simpleAds");
		
	},
	addContextListners: function(){
		var _this = this;
		mw.log("freeWheelController::addContextListners>" );
		this.getContext().addEventListener( tv.freewheel.SDK.EVENT_REQUEST_COMPLETE, function( event ){
			_this.onRequestComplete( event );
		});
		this.getContext().addEventListener( tv.freewheel.SDK.EVENT_SLOT_ENDED, this.onSlotEnded );
	},
	setContextTimeout: function(){
		mw.log("freeWheelController::setContextTimeout>" );
		// To make sure video ad playback in poor network condition, set video ad timeout parameters.
		this.getContext().setParameter(tv.freewheel.SDK.PARAMETER_RENDERER_VIDEO_START_DETECT_TIMEOUT,10000,tv.freewheel.SDK.PARAMETER_LEVEL_GLOBAL);
		this.getContext().setParameter(tv.freewheel.SDK.PARAMETER_RENDERER_VIDEO_PROGRESS_DETECT_TIMEOUT,10000,tv.freewheel.SDK.PARAMETER_LEVEL_GLOBAL);
	},
	addTemporalSlots: function(){
		mw.log("freeWheelController::addTemporalSlots>")
		var context = this.getContext();
		//Add 1 preroll, 1 midroll, 2 overlay, 1 postroll slot
		context.addTemporalSlot("Preroll_1", tv.freewheel.SDK.ADUNIT_PREROLL, 0);
		context.addTemporalSlot("Midroll_1", tv.freewheel.SDK.ADUNIT_MIDROLL, 5);
		context.addTemporalSlot("Overlay_1", tv.freewheel.SDK.ADUNIT_OVERLAY, 10);
		context.addTemporalSlot("Overlay_2", tv.freewheel.SDK.ADUNIT_OVERLAY, 15);
		context.addTemporalSlot("Postroll_1", tv.freewheel.SDK.ADUNIT_POSTROLL, 60);
	},
	onSlotEnded: function ( event ){
		var _this = this;
		var slotTimePositionClass = event.slot.getTimePositionClass();
		mw.log("freeWheelControl:: onSlotEnded slotTimePositionClass: " + slotTimePositionClass );
		switch (slotTimePositionClass)
		{
			case tv.freewheel.SDK.TIME_POSITION_CLASS_PREROLL:
				if ( this.prerollSlots.length ){
					this.prerollSlots.shift();
					if ( this.prerollSlots.length )
						this.prerollSlots[0].play();
					else{
						// restore player
						/*
						$('#videoPlayer').bind('ended', onContentVideoEnded);
						$('#videoPlayer').bind('timeupdate', onContentVideoTimeUpdated);
						$('#videoPlayer').attr('controls', true);
						$('#videoPlayer').attr('src', contentVideoURL);
						$('#videoPlayer')[0].play();
						*/
						this.getContext().setVideoState(tv.freewheel.SDK.VIDEO_STATE_PLAYING);
					}
				}
				break;
			case tv.freewheel.SDK.TIME_POSITION_CLASS_MIDROLL:
			case tv.freewheel.SDK.TIME_POSITION_CLASS_OVERLAY:
				this.slotPlaying = false;
				break;
			case tv.freewheel.SDK.TIME_POSITION_CLASS_POSTROLL:
				if ( this.postrollSlots.length ){
					this.postrollSlots.shift();
					if ( this.postrollSlots.length ){
						postrollSlots[0].play();
					} else {
						_this.getContext().setVideoState(tv.freewheel.SDK.VIDEO_STATE_COMPLETED);
						$("#start").attr('disabled', false);
					}
				}
				break;
		}
	}
};

} )( window.mw, window.jQuery );