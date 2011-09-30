( function( mw, $ ) {

mw.addFreeWheelControler = function( embedPlayer, callback ) {
	embedPlayer.freeWheelAds = new mw.FreeWheelControler(embedPlayer, callback);	
	mw.freeWheelGlobalContextInstance = embedPlayer.freeWheelAds;
};

mw.FreeWheelControler = function( embedPlayer, callback ){
	return this.init( embedPlayer, callback );
};

mw.FreeWheelControler.prototype = {
	
	// The freeWheel adManager 
	adManager: null,
	
	// The ad Context:
	adContext: null,
	
	// The ad data requested
	adDataRequested : false,
	
	// The pre video url
	contentVideoURL : null, 
	
	// local slot storage for preroll, midroll, postroll
	slots : {
		'preroll' : [],
		'postroll' : [],
		'overlay' : [],
		'midroll' : [],
		// an unknown or unsupported type
		'unknown_type': []
	},
	
	// The current active slot
	currentSlotDoneCb: null,
		
	// if an overlay slot is active:
	overlaySlotActive: false,

	// bindPostfix enables namespacing the plugin binding
	bindPostfix: '.freeWheel',
	
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
	init: function( embedPlayer, callback  ){
		var _this = this;
		// Inherit BaseAdPlugin
		mw.inherit( this, new mw.BaseAdPlugin(  embedPlayer, callback ) );
		
		// setp local pointer to callback: 
		this.callback = callback;
		
		// Get the freewheel configuration
		this.config = this.embedPlayer.getKalturaConfig(
			'FreeWheel',
			[ 'plugin', 'preSequence', 'postSequence', 'width', 'height', 'asyncInit',
			 'adManagerUrl','adManagerJsUrl', 'serverUrl', 'networkId', 'videoAssetId',  
			 'videoAssetIdType', 'playerProfile', 'playerProfileHTML5', 'videoAssetNetworkId', 
			 'siteSectionId', 'visitorId'  ]
		);
		// XXX todo we should read "adManagerUrl" from uiConf config
		var adManagerUrl = ( this.config[ 'adManagerJsUrl' ] ) ? 
							this.config[ 'adManagerJsUrl' ] : 
							mw.getConfig( 'FreeWheel.AdManagerUrl' );
							
		// Load the freewheel ad mannager then setup the ads
		$.getScript(adManagerUrl, function(){
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
		if( mw.getConfig( 'FreeWheel.PostMessageIframeCompanions' ) ){
			this.addCompanionBindings();
		}
		
		// XXX FreeWheel sets SVLads003 as the response? 
		window['SVLads003'] = true;
		
		// Load add data ( will call onRequestComplete once ready )
		mw.log("FreeWheelController::submitRequest>");
		this.getContext().submitRequest();
	},
	addPlayerBindings: function(){
		mw.log("FreeWheelControl:: addPlayerBindings");
		var _this = this;
	
		$.each(_this.slots, function( slotType, slotSet){
			if( slotType == 'midroll' || slotType == 'overlay' ){
				$( _this.embedPlayer ).bind( 'monitorEvent' + _this.bindPostfix, function( event ){
					_this.playSlotsInRange( slotSet );
				});
				return true;
			}
			
			// Else set of preroll or postroll clips setup normal binding: 
			$( _this.embedPlayer ).bind( 'AdSupport_' + slotType + _this.bindPostfix, function( event, sequenceProxy ){
				sequenceProxy[ _this.getSequenceIndex( slotType ) ] = function( callback ){
					// Run the freewheel slot add, then run the callback once done 
					_this.displayFreeWheelSlots( slotType, 0, function(){
						// Restore the player:
						_this.getContext().setVideoState( tv.freewheel.SDK.VIDEO_STATE_PLAYING );
						// Run the callback: 
						callback();
					});
				};
			});
		});
		
		// Add the "unload" binding for playlists
		$( _this.embedPlayer ).bind( 'changeMedia' + _this.bindPostfix, function() {
			_this.destory();
		}); 
		// Run the player callback once we have added player bindings
		this.callback();
	},
	playSlotsInRange: function( slotSet ){
		var _this = this;
		var embedPlayer = this.embedPlayer;
		$.each(slotSet, function(inx, slot){
			var slotTimePosition = slot.getTimePosition();
			if ( _this.embedPlayer.currentTime - slotTimePosition >= 0 && 
				_this.embedPlayer.currentTime - slotTimePosition <= 1 && 
				!_this.overlaySlotActive 
			){
				if( _this.playSlot( slot ) ){
					if(  _this.getSlotType( slot ) == 'overlay' ){
						// @@TODO handle close caption layout conflict
						var bottom = parseInt( $('#fw_ad_container_div').css('bottom') );
						var ctrlBarBottom  = bottom;
						if( bottom < embedPlayer.controlBuilder.height ){
							ctrlBarBottom = bottom + embedPlayer.controlBuilder.height ;
						}
						// Check if we are overlaying controls ( move the banner up ) 
						if( embedPlayer.controlBuilder.isOverlayControls() ){
							$( embedPlayer ).bind( 'onShowControlBar', function(){
								$('#fw_ad_container_div').animate({'bottom': ctrlBarBottom + 'px'}, 'fast');
							});
							$( embedPlayer ).bind( 'onHideControlBar', function(){
								$('#fw_ad_container_div').animate({'bottom': bottom + 'px'}, 'fast');
							});
						} else {
							$('#fw_ad_container_div').css('bottom', ctrlBarBottom + 'px');
						}
						_this.overlaySlotActive = true;
					}
				}
			}
		});
	},
	playSlot: function( slot ){
		if( slot.alreadyPlayed ){
			return false;
		}
		mw.log('mw.FreeWheelControl:: playSlot:' + this.getSlotType( slot ) );
		slot.play();
		slot.alreadyPlayed = true;
		return true;
	},
	displayFreeWheelSlots: function( slotType, inx, doneCallback ){
		var _this = this;
		var slotSet = this.slots[ slotType ];
		// Make sure we have a slot to be displayed:
		if( !slotSet[ inx ] ){
			if( doneCallback )
				doneCallback();
			return ;
		}
		
		// Setup the active slots
		this.curentSlotIndex = inx;
		this.currentSlotDoneCB = doneCallback;
		
		// Display the current slot:
		if( ! _this.playSlot( slotSet[ inx ] ) ){
			// if we did not play it, jump directly to slot done:
			this.onSlotEnded( {  'slot' : slotSet[ inx ] });
		}
	},
	onSlotEnded: function ( event ){
		var _this = this;
		var slotType =_this.getSlotType( event.slot );
		if( slotType == 'overlay'  ){
			_this.overlaySlotActive = false;
			return ;
		}
		if( slotType== 'preroll' ){
			_this.getContext().setVideoState( tv.freewheel.SDK.VIDEO_STATE_PLAYING );
		}
		if( slotType == 'postroll' ){
			_this.getContext().setVideoState( tv.freewheel.SDK.VIDEO_STATE_COMPLETED) ;
		}
		// play the next slot in the series if present
		this.curentSlotIndex++;
		_this.displayFreeWheelSlots( slotType, this.curentSlotIndex, this.currentSlotDoneCB );
	},
	/**
	 * Called on the completion of freeWheel add loading
	 * @param event
	 * @return
	 */
	onRequestComplete: function( event ){
		var _this = this;
		mw.log("FreeWheelController::onRequestComplete>");
		if ( event.success ){
			$.each( _this.getContext().getTemporalSlots(), function(inx, slot ){
				_this.addSlot( slot );
			});
		} 
		// Check if we found freewheel ads: 
		if( _this.getContext().getTemporalSlots().length ){
			// Add the freeWheel bindings:
			_this.addPlayerBindings();
		} else {
			mw.log("FreeWheelController:: no freewheel ads avaliable");
			// No adds issue callback directly
			this.callback();
		}
	},
	addSlot: function( slot ){
		mw.log("FreeWheelControl:: addSlot of type:" +  this.getSlotType( slot ) );
		this.slots[ this.getSlotType( slot ) ].push( slot );
	},
	getSlotType: function( slot ){
		switch (  slot.getTimePositionClass() ){
			case tv.freewheel.SDK.TIME_POSITION_CLASS_PREROLL:
				return 'preroll';
				break;
			case tv.freewheel.SDK.TIME_POSITION_CLASS_MIDROLL:
				return 'midroll';
				break;
			case tv.freewheel.SDK.TIME_POSITION_CLASS_OVERLAY:
				return 'overlay';
				break;
			case tv.freewheel.SDK.TIME_POSITION_CLASS_POSTROLL:
				return 'postroll';
				break;
		}
		mw.log("Error: freeWheel Control could not get slot type: " + slot.getTimePositionClass() );
		return 'unknown_type';
	},
	
	/**
	 * Gets a property from config
	 * @param propId
	 * @return
	 */
	getConfig: function( propId ){
		// Check if the property was set in config: 
		if( this.config[propId] ){
			return this.config[propId];
		}
		// Dynamic values: 
		if( propId == 'videoDuration' ){
			return this.embedPlayer.evaluate('{mediaProxy.entry.duration}');
		}
		// XXX some default copied from freeWheelSample.html
		// TODO make these values dynamic! 
		switch( propId ){
			case 'profileId':
				return 'global-js';
				break;
		}		
		return null;
	},
	getAdManager: function(){
		if( !this.adManager ){
			this.adManager = new tv.freewheel.SDK.AdManager();
			this.adManager.setNetwork( parseInt( this.getConfig( 'networkId' ) ) );
			this.adManager.setServer( this.getConfig('serverUrl') );
		}
		return this.adManager;
	},
	getContext: function(){
		if( !this.adContext ){
			this.adContext = this.getAdManager().newContext();
			
			this.adContext.registerVideoDisplayBase( 'videoContainer' );

			this.adContext.setProfile( this.getConfig( 'profileId' ) );

			// Check if we have a visitorId 
			if( this.getConfig('visitorId') ){
				this.adContext.setVisitor( this.getConfig('visitorId') );
			}
			
			// Check for "html5" player profile: 
			if( this.getConfig('playerProfileHTML5') ){
				this.adContext.setPlayerProfile( this.getConfig('playerProfileHTML5') );
			}
			
			this.adContext.setVideoAsset( 
					this.getConfig( 'videoAssetId' ),
					this.getConfig( 'videoDuration' ),
					this.getConfig( 'networkId' )
			);
			this.adContext.setSiteSection(
				this.getConfig('siteSectionId') , 
				this.getConfig( 'networkId' ) 
			);
		}
		return this.adContext;
	},
	addContextKeyValues: function(){
		mw.log("FreeWheelController::freeWheelController>")
		// XXX todo read key value pairs from plugin config ?
		var context = this.getContext();
		var keyValueSet = this.getConfig('keyValues');
		if( !keyValueSet){
			return ;
		}
		// Add some generic key value pairs:
		var autoPlay = ( this.embedPlayer.autoplay )? 'true' : 'false';
		context.addKeyValue( 'autoplay', autoPlay );
		
		$.each( keyValueSet.split( '&' ), function(inx, set){
			var kv = set.split('=');
			if( kv[0] && kv[1] ){
				context.addKeyValue( kv[0], kv[1] );
			}
		});
		
	},
	addContextListners: function(){
		var _this = this;
		mw.log("FreeWheelController::addContextListners>" );
		this.getContext().addEventListener( tv.freewheel.SDK.EVENT_REQUEST_COMPLETE, function( event ){
			_this.onRequestComplete( event );
		});
		this.getContext().addEventListener( tv.freewheel.SDK.EVENT_SLOT_ENDED, function( event ){
			_this.onSlotEnded( event );
		})
	},
	setContextTimeout: function(){
		mw.log("FreeWheelController::setContextTimeout>" );
		// To make sure video ad playback in poor network condition, set video ad timeout parameters.
		this.getContext().setParameter(tv.freewheel.SDK.PARAMETER_RENDERER_VIDEO_START_DETECT_TIMEOUT,10000,tv.freewheel.SDK.PARAMETER_LEVEL_GLOBAL);
		this.getContext().setParameter(tv.freewheel.SDK.PARAMETER_RENDERER_VIDEO_PROGRESS_DETECT_TIMEOUT,10000,tv.freewheel.SDK.PARAMETER_LEVEL_GLOBAL);
	},
	addTemporalSlots: function(){
		mw.log("FreeWheelController::addTemporalSlots>")
		var context = this.getContext();
		var embedPlayer = this.embedPlayer;
		var slotCounts = {
			'pre':0,
			'post':0,
			'mid':0,
			'over':0
		};
			
		// Check for number of prerolls from config: 
		if( parseInt( this.config.preSequence ) ){
			slotCounts['pre']++;
			context.addTemporalSlot("Preroll_" + slotCounts['pre'], tv.freewheel.SDK.ADUNIT_PREROLL, 0);
		}
		// Check for post rolls: 
		if( parseInt( this.config.postSequence ) ){
			slotCounts['post']++;
			context.addTemporalSlot("Postroll_" + slotCounts['post'], tv.freewheel.SDK.ADUNIT_PREROLL, 0);
		}
		// Add CuePoint slots: 
		if( this.embedPlayer.rawCuePoints ){
			this.addCuePointSlots( this.embedPlayer.rawCuePoints, slotCounts );
		}
	},
	addCuePointSlots: function( cuePoints, slotCounts ){
		var embedPlayer = this.embedPlayer;
		var context = this.getContext();
		for( var i=0; i < cuePoints.length; i++){
			var cuePoint =  cuePoints[i];
			// Add ads for each cuePoint type: 
			if( cuePoint.cuePointType == 'adCuePoint.Ad' ){
				var adType = embedPlayer.kCuePoints.getAdType( cuePoint );
				switch( adType ){
					case 'preroll':
						slotCounts['pre']++;
						context.addTemporalSlot("Preroll_" + slotCounts['pre'], tv.freewheel.SDK.ADUNIT_PREROLL, 0);
						break;
					case 'postroll':
						slotCounts['post']++;
						context.addTemporalSlot("Postroll_" + slotCounts['post'], tv.freewheel.SDK.ADUNIT_PREROLL, 0);
						break;
					case 'overlay':
						slotCounts['over']++;
						context.addTemporalSlot("Overlay_" + slotCounts['over'], tv.freewheel.SDK.ADUNIT_OVERLAY, 
							cuePoint.startTime / 1000
						);
						break;
					case 'midroll':
						slotCounts['mid']++;
						context.addTemporalSlot("Midroll_" + slotCounts['mid'], tv.freewheel.SDK.ADUNIT_MIDROLL, 
							cuePoint.startTime / 1000
						);
						break;
				}
			}
		}
	},
	/**
	 * Adds local companion targets ( if they  exists ) for easy passing across iframe 
	 * @return
	 */
	addCompanionBindings: function(){
		var _this = this;
		mw.log("FreeWheelController::addCompanionBindings>");
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
		}, 1000);
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
		mw.log( 'FreeWheelController:: addCompanionTargets: Added:' + $('#fw_companion_container ._fwph').length + ' targets' );
	}
};

} )( window.mw, window.jQuery );