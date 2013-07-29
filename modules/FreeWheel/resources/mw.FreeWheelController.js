( function( mw, $ ) { "use strict";

// Set the FreeWheel config:
mw.setDefaultConfig({
	// The url for the ad Manager
	// for debugging we use the following AdManager url: 'http://localhost/html5.kaltura/mwEmbed/modules/FreeWheel/AdManager.js'
	'FreeWheel.AdManagerUrl': 'http://adm.fwmrm.net/p/release/latest-JS/adm/prd/AdManager.js'
});

mw.FreeWheelController = function( embedPlayer, callback ){
	return this.init( embedPlayer, callback );
};

mw.FreeWheelController.prototype = {

	// The freeWheel adManager
	adManager: null,

	// The ad Context:
	adContext: null,

	// The ad data requested
	adDataRequested : false,

	// The pre video url
	contentVideoURL : null,

	// Allows overide of the video asset id from a updateVideoAssetId notification
	videoAssetIdOverride: null,

	// local slot storage for preroll, midroll, postroll
	slots : {
		'preroll' : [],
		'postroll' : [],
		'overlay' : [],
		'midroll' : [],
		// An unknown or unsupported type
		'unknown_type': []
	},

	// The done callback for current active slot
	currentSlotDoneCb: null,

	// The current active slot
	activeSlot: null,

	// if an overlay slot is active:
	overlaySlotActive: false,

	// Local storage of ad freewheel ad metadata indexed by ad Id
	fwAdParams: {},

	// bindPostfix enables namespacing the plugin binding
	bindPostfix: '.freeWheel',

	/**
	 * Initialize the adMannager javascript and setup adds
	 *
	 * @param {Object} embedPlayer
	 * @param {Function} callback
	 * @return
	 */
	init: function( embedPlayer, callback ){
		var _this = this;
		// Inherit BaseAdPlugin
		mw.inherit( this, new mw.BaseAdPlugin( embedPlayer, callback ) );

		// unbind any existing bindings:
		_this.embedPlayer.unbindHelper( _this.bindPostfix );

		// Load the freewheel ad manager then setup the ads
		if( !window['tv'] || !tv.freewheel ){
			$.getScript( _this.getAdManagerUrl(), function(){
				_this.setupAds();
				callback();
			});
		} else{
			_this.setupAds();
			callback();
		}
	},
	getAdManagerUrl: function(){
		return ( this.getConfig( 'adManagerJsUrl' ) ) ?
				this.getConfig( 'adManagerJsUrl' )  :
				mw.getConfig( 'FreeWheel.AdManagerUrl' );
	},
	/**
	 * Setup ads, main freeWheel control flow
	 * @return
	 */
	setupAds: function(){
		var _this = this;
		// Add support for getting videoAssetId from a notification:

		_this.embedPlayer.bindHelper( 'Kaltura_SendNotification' + _this.bindPostfix, function( event, notificationName, notificationData ){
			if( notificationName == 'updateVideoAssetId' && notificationData['videoAssetId'] ){
				_this.videoAssetIdOverride = notificationData['videoAssetId'];
			}
		});

		_this.embedPlayer.bindHelper( 'AdSupport_OnPlayAdLoad' + _this.bindPostfix, function( event, callback ){
			// Add key-values for ad targeting.
			_this.addContextKeyValues();

			// Listen to AdManager Events
			_this.addContextListners();

			// Set context timeout
			_this.setContextTimeout();

			// Add the temporal slots for this "player"
			if( _this.getConfig( 'useKalturaTemporalSlots') === true ){
				_this.addTemporalSlots();
			}

			// XXX FreeWheel sets SVLads003 as the response?
			window[ 'SVLads003' ] = true;

			// Load add data ( will call onRequestComplete once ready )
			mw.log( "FreeWheelController::submitRequest>" );
			// set the inSequence flag while loading ads:
			_this.embedPlayer.sequenceProxy.isInSequence = true;

			// Get Freewheel ads:
			_this.getContext().submitRequest();
			// set the callback
			_this.callback  = callback;
		});
	},
	/**
	 * Called on the completion of freeWheel add loading, continue playback
	 * @param event
	 * @return
	 */
	onRequestComplete: function( event ){
		var _this = this;
		mw.log("FreeWheelController::onRequestComplete>");
		if ( event.success && _this.getContext().getTemporalSlots().length ){
			var slotSet = _this.getContext().getTemporalSlots();
			for( var i =0;i < slotSet.length;i++){
				var slot = slotSet[i];
				this.addSlot( slot );
			};
			// Add the freeWheel bindings:
			this.addSlotBindings();
		} else {
			mw.log("FreeWheelController:: no freewheel ads avaliable");
		}
		_this.callback();
	},
	/*	Returns freewheel ad parameters by ad Id
	 *
	 * The adMetadata object is as follows:
	 *
	 * ID The unique identifier of the ad unit adId
	 * width The width of the ad unit width
	 * height The height of the ad unit height
	 * mimeType The MIME type of the ad unit: ‘text’, ‘video’, ‘image’, ‘flash’ contentType
	 * url The URL origin of the ad unit defined as an absolute path url
	 * duration The duration in seconds (float) of the ad unit duration
	 * type The type of ad unit: timePositionClass
	 * name The name of the advertiser ‘Freewheel’
	 * title The ad unit title name
	 * iabCategory The ad unit IAB category -
	 * CampaignID Holds the unique ID/Name of the campaign that the ad is part of. creativeId
	 */
	getFwAdMetaData: function( slot ){
		var _this = this;
		try{
			var ad = null;
			if ( slot.getAdInstances ) {
				ad = slot.getAdInstances()[0];
			} else {
				ad = slot._adInstances[0];	
			}
			var rendition = ad.getAllCreativeRenditions()[0]; // primary creative rendition is the first object in the rendition array.
			var asset = rendition.getPrimaryCreativeRenditionAsset();
		} catch( e ){
			mw.log( "Error could not get Freewheel ad metadata " + e );
			return {};
		}
		
		var metaData = {
			'ID': ad.getAdId(),
			'width': rendition.getWidth(),
			'height': rendition.getHeight(),
			'mimeType': asset.getMimeType(),
			'url': asset.getUrl(),
			'duration': rendition.getDuration(),
			'type': slot.getTimePositionClass(), // value could be preroll/midroll/postroll/display/overlay
			'name': 'FreeWheel',
			'title': asset.getName(),
			'iabCategory': null, // not sure what's expected here.
			'CampaignID': null, // not available via SDK API now, what exactly do you need here? 
		}
		//if( creative._parameters._fw_advertiser_name ){
		//	metaData['advertiser'] = creative._parameters._fw_advertiser_name;
		//}
		return metaData;
	},
	addSlotBindings: function(){
		mw.log("FreeWheelControl:: addSlotBindings");
		var _this = this;

		$.each(_this.slots, function( slotType, slotSet){
			if( slotType == 'midroll' || slotType == 'overlay' ){
				// Add cue point binding:
				_this.embedPlayer.bindHelper( 'KalturaSupport_AdOpportunity' + _this.bindPostfix, function( event, kalturaCuePoint ){
					_this.playAdCuePoint( slotSet, kalturaCuePoint.cuePoint );
				});
				return true;
			}

			// Else set of preroll or postroll clips setup normal binding:
			_this.embedPlayer.bindHelper( 'AdSupport_' + slotType + _this.bindPostfix, function( event, sequenceProxy ){
				// Check that the freewheel slotSet actually includes an ad:
				var adInstancesPresent = false;
				$.each( slotSet, function( inx, slot ){
					if( slot.getAdCount() != 0 ){
						adInstancesPresent = true;
					}
				})
				if( adInstancesPresent ){
					sequenceProxy[ _this.getSequenceIndex( slotType ) ] = function( callback ){
						// Run the freewheel slot add, then run the callback once done
						_this.displayFreeWheelSlots( slotType, 0, function(){
							_this.restorePlayState();
							// Run the callback:
							callback();
						});
					};
				}

			});
		});
	},
	playAdCuePoint: function( slotSet, cuePoint ){
		var _this = this;
		var embedPlayer = this.embedPlayer;
		$.each(slotSet, function( inx, slot ){
			var slotType =  _this.getSlotType( slot );
			var slotTimePosition = slot.getTimePosition();
			if( slotTimePosition == cuePoint.startTime / 1000 ){
				mw.log("FreeWheel:: AdOpertunity play cuePoint: " + slotTimePosition+ ' == ' + cuePoint.startTime / 1000  );
				// try to play the midroll or display the overlay:
				if( _this.playSlot( slot ) ){
					// If type is midroll ( and the slot is not yet donePlaying )
					if( slotType == 'midroll' && ! slot.donePlaying){
						_this.embedPlayer.adTimeline.updateUiForAdPlayback( slotType );
					}

					// overlay has special handling:
					if( slotType == 'overlay' && _this.overlaySlotActive == false ){
						// TODO handle close caption layout conflict
						var bottom = parseInt( $('#fw_ad_container_div').css( 'bottom' ) );
						var ctrlBarBottom  = bottom;
						if( bottom < embedPlayer.layoutBuilder.getControlBarHeight() ){
							ctrlBarBottom = bottom + embedPlayer.layoutBuilder.getControlBarHeight();
						}
						// Check if we are overlaying controls ( move the banner up )
						if( embedPlayer.isOverlayControls() ){
							_this.embedPlayer.bindHelper( 'onShowControlBar', function(){
								$('#fw_ad_container_div').animate({'bottom': ctrlBarBottom + 'px'}, 'fast');
							});
							_this.embedPlayer.bindHelper( 'onHideControlBar', function(){
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
		var _this = this;
		if( slot.alreadyPlayed ){
			return false;
		}
		// Set the slot played flag:
		slot.alreadyPlayed = true;
		// Set the "done playing" flag to false:
		slot.donePlaying = false;

		mw.log( 'mw.FreeWheelController:: playSlot:' + this.getSlotType( slot ) + ' adInstances: ' +  slot.getAdCount() );
		
		// if no ad slots are available return
		if( slot.getAdCount() == 0 ){
			return false;
		}
		var vid = _this.embedPlayer.getPlayerElement();
		// make sure we remove preload attr
		$( vid ).removeAttr( 'preload' );
		
		var adMetaData = this.getFwAdMetaData( slot ) ;
		// Update ad Meta data:
		_this.embedPlayer.adTimeline.updateSequenceProxy(
			'activePluginMetadata',
			adMetaData
		);
		// Update the ad duration ( may change once the media is loaded )
		_this.embedPlayer.adTimeline.updateSequenceProxy( 'duration', adMetaData.duration );

		// Update the player ad playback mode:
		_this.embedPlayer.adTimeline.updateUiForAdPlayback( _this.getSlotType( slot ) );
		// Play the slot
		slot.play();
		// Update the active slot
		this.activeSlot = slot;
		// Monitor ad progress ( for sequence proxy )
		this.monitorAdProgress();
		// Suppress freewheel controls attribute change on pause:
		var vid = _this.embedPlayer.getPlayerElement();
		$( vid ).bind( 'pause' + _this.bindPostfix, function(){
			// Do a async call to remove controls on pause
			setTimeout(function(){
				var vid = _this.embedPlayer.getPlayerElement();
				vid.controls = false;
			},0);

			// force display the control bar ( in case it was hiddedn )
			_this.embedPlayer.disableComponentsHover();

			// a click we want to  enable play button:
			_this.embedPlayer._playContorls = true;
			// play interface update:
			_this.embedPlayer.pauseInterfaceUpdate();
			$( vid ).bind( 'play.fwPlayBind', function(){
				$( vid ).unbind( 'play.fwPlayBind' );
				// Restore hover property if set
				_this.embedPlayer.restoreComponentsHover();
				// a restore _playControls restriction if in an ad )
				if( _this.embedPlayer.sequenceProxy.isInSequence ){
					_this.embedPlayer._playContorls = false;
				}
				_this.embedPlayer.playInterfaceUpdate();
			});
		} );

		// setup original interface height
		if( !_this.orginalInterfaceHeight ){
			_this.orginalInterfaceHeight = _this.embedPlayer.$interface.css( 'height' )
		}

		return true;
	},
	restorePlayState: function(){
		var _this = this;
		mw.log("FreeWheelControl::restorePlayState" );
		this.getContext().setVideoState( tv.freewheel.SDK.VIDEO_STATE_PLAYING );

		// Restore interface size:
		_this.embedPlayer.$interface.css( {
			'height':  _this.orginalInterfaceHeight,
			'bottom' : 0,
			'top' : 0,
			'left': 0
		});

		// remove pause binding:
		var vid = this.embedPlayer.getPlayerElement();
		$( vid ).unbind( 'pause' + this.bindPostfix );
		// trigger onplay now that we have restored the player:
		setTimeout(function(){
			$( _this.embedPlayer ).trigger('onplay');
		},0);
	},
	monitorAdProgress: function(){
		var _this = this;
		// Don't monitor ad progress if active slot done.
		if( !this.activeSlot ){
			_this.embedPlayer.adTimeline.updateSequenceProxy( 'timeRemaining', null );
			_this.embedPlayer.adTimeline.updateSequenceProxy( 'duration',  null );
			return ;
		}
		// Update the timeRemaining ( if not an overlay )
		if(  this.getSlotType( this.activeSlot ) != 'overlay' ){
			var vid = _this.getAdVideoElement();
			_this.embedPlayer.adTimeline.updateSequenceProxy( 'timeRemaining', parseInt( vid.duration - vid.currentTime ) );
			_this.embedPlayer.adTimeline.updateSequenceProxy( 'duration',  vid.duration );
			_this.embedPlayer.triggerHelper( 'AdSupport_AdUpdatePlayhead', vid.currentTime );
			
			// TODO player interface updates should be configurable see Mantis 14076 and 14019
			_this.embedPlayer.layoutBuilder.setStatus(
				mw.seconds2npt( vid.currentTime ) + '/' + mw.seconds2npt( vid.duration )
			);
			_this.embedPlayer.updatePlayHead( vid.currentTime / vid.duration );
		}

		// Keep monitoring ad progress at MonitorRate
		setTimeout( function(){
			_this.monitorAdProgress();
		}, mw.getConfig( 'EmbedPlayer.MonitorRate' ) );
	},
	getAdVideoElement: function(){
		// Freewheel adds a video element to the dom for midrolls,
		// We want this ad video element ( not the original pid getPlayerElement()
		var $siblingVid = $( this.embedPlayer.getPlayerElement() ).siblings('video');
		if( $siblingVid.length ){
			return $siblingVid[0];
		}
		return this.embedPlayer.getPlayerElement();
	},
	displayFreeWheelSlots: function( slotType, inx, doneCallback ){
		var _this = this;
		var slotSet = this.slots[ slotType ];
		// Make sure we have a slot to be displayed:
		if( !slotSet[ inx ] ){
			if( doneCallback ){
				doneCallback();
			} else {
				mw.log("Error:: FreeWheelController displayFreeWheelSlots missing doneCallback ");
			}
			return ;
		}
		mw.log( "FreeWheelController::displayFreeWheelSlots> " + slotType + ' index:' + inx );
		// Setup the active slots
		this.curentSlotIndex = inx;
		this.currentSlotDoneCB = doneCallback;

		// Display the current slot:
		if( ! _this.playSlot( slotSet[ inx ] ) ){
			// if we did not play it, jump directly to slot done:
			this.onSlotEnded({ 'slot' : slotSet[ inx ] });
		}
	},
	onSlotEnded: function ( event ){
		var _this = this;
		mw.log( "FreeWheelController::onSlotEnded> " + event.slot.getTimePositionClass() );
		// Update slot event:
		event.slot.donePlaying = true;
		var slotType =_this.getSlotType( event.slot );
		if( slotType == 'overlay'  ){
			_this.overlaySlotActive = false;
			return ;
		}
		if( $.inArray( slotType, ['preroll', 'postroll', 'midroll' ] ) === -1 ){
			mw.log( 'FreeWheelController:: non sequence slot ended: ' + slotType );
			return ;
		}
		// Set the active sequence slot to null:
		this.activeSlot = null;

		if( slotType== 'preroll' ){
			_this.getContext().setVideoState( tv.freewheel.SDK.VIDEO_STATE_PLAYING );
		}
		if( slotType == 'postroll' ){
			_this.getContext().setVideoState( tv.freewheel.SDK.VIDEO_STATE_COMPLETED) ;
		}
		// play the next slot in the series if present
		if( slotType == 'preroll' || slotType=='postroll' ){
			_this.curentSlotIndex++;
			_this.displayFreeWheelSlots( slotType, _this.curentSlotIndex, _this.currentSlotDoneCB );
		}
		if( slotType=='midroll' ){
			_this.restorePlayState();
			// midroll done
			_this.embedPlayer.adTimeline.restorePlayer();
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
		mw.log( "FreeWheelController::getSlotType: could not get slot type: ( skip ) " + slot.getTimePositionClass() );
		return 'unknown_type';
	},

	/**
	 * Gets a property from config
	 * @param propId
	 * @return
	 */
	getConfig: function( propId ){
		// Dynamic values:
		if( propId == 'videoDuration' ){
			return this.embedPlayer.evaluate('{mediaProxy.entry.duration}');
		}
		// return the live attribute value
		return this.embedPlayer.getKalturaConfig( 'freeWheel', propId );
	},
	getAdManager: function(){
		if( !this.adManager ){
			this.adManager = new tv.freewheel.SDK.AdManager();
			this.adManager.setNetwork(
				parseInt( this.getConfig( 'networkId' ) )
			);
			var serverUrl = this.getConfig( 'serverUrlHTML5' ) ;
			if( ! serverUrl ){
				serverUrl = this.getConfig( 'serverUrl' ) ;
			}
			this.adManager.setServer( serverUrl );
		}
		return this.adManager;
	},
	getContext: function(){
		if( !this.adContext ){
			mw.log( "FreeWheelController:: getContext> " );
			this.adContext = this.getAdManager().newContext();
			// give the video holder an id that freewheel can see:
			$( this.embedPlayer.getVideoHolder() ).attr( 'id', 'fwVidoeHolder_' + this.embedPlayer.id );
			this.adContext.registerVideoDisplayBase( 'fwVidoeHolder_' +this.embedPlayer.id );

			// Check for "html5" player profile:
			if( this.getConfig("playerProfileHTML5")){
				this.adContext.setProfile(
					this.getConfig('playerProfileHTML5')
				);
			} else if( this.getConfig( 'playerProfile' ) ){
				this.adContext.setProfile( this.getConfig( 'playerProfile' ) );
			}

			// Check if we have a visitorId
			if( this.getConfig('visitorId') ){
				this.adContext.setVisitor( this.getConfig('visitorId') );
			}
			var videoAssetId = ( this.videoAssetIdOverride )? this.videoAssetIdOverride  : this.getConfig( 'videoAssetId' );
			this.adContext.setVideoAsset(
				videoAssetId,
				this.getConfig( 'videoDuration' ),
				this.getConfig( 'networkId' ),
				this.embedPlayer.getSrc(),
				( this.embedPlayer.autoplay ) ? 'true' : 'false',
				this.rand(),
				tv.freewheel.SDK.ID_TYPE_CUSTOM,
				this.getConfig( 'videoAssetFallbackId' )
			);

			this.adContext.setSiteSection(
				this.getConfig('siteSectionId') ,
				this.getConfig( 'networkId' ),
				this.rand(),
				tv.freewheel.SDK.ID_TYPE_CUSTOM,
				this.getConfig( 'siteSectionFallbackId' )
			);
		}
		return this.adContext;
	},
	rand: function(){
		return Math.floor( Math.random() * 10000 );
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
			_this.embedPlayer.freeWheel.onRequestComplete( event );
		});
		this.getContext().addEventListener( tv.freewheel.SDK.EVENT_SLOT_ENDED, function( event ){
			// Use the embedPlayer instance of FreeWheel ads so that the non-prototype methods are not lost in
			// freewheels callback
			_this.embedPlayer.freeWheel.onSlotEnded( event );
		});
	},
	setContextTimeout: function(){
		mw.log("FreeWheelController::setContextTimeout>" );
		// To make sure video ad playback in poor network condition, set video ad timeout parameters.
		this.getContext().setParameter(tv.freewheel.SDK.PARAMETER_RENDERER_VIDEO_START_DETECT_TIMEOUT,10000,tv.freewheel.SDK.PARAMETER_LEVEL_GLOBAL);
		this.getContext().setParameter(tv.freewheel.SDK.PARAMETER_RENDERER_VIDEO_PROGRESS_DETECT_TIMEOUT,10000,tv.freewheel.SDK.PARAMETER_LEVEL_GLOBAL);
	},
	addTemporalSlots: function(){
		mw.log("FreeWheelController::addTemporalSlots>");
		var context = this.getContext();
		var embedPlayer = this.embedPlayer;
		var slotCounts = {
			'pre': 0,
			'post': 0,
			'mid': 0,
			'over': 0
		};

		// Check for number of prerolls from config:
		if( parseInt( this.getConfig( 'preSequence' ) ) ){
			slotCounts['pre']++;
			context.addTemporalSlot("Preroll_" + slotCounts['pre'], tv.freewheel.SDK.ADUNIT_PREROLL, 0);
		}
		// Check for post rolls:
		if( parseInt( this.getConfig( 'postSequence' ) ) ){
			slotCounts['post']++;
			context.addTemporalSlot("Postroll_" + slotCounts['post'], tv.freewheel.SDK.ADUNIT_POSTROLL, 0);
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
			if( cuePoint.protocolType === 0 && cuePoint.cuePointType == 'adCuePoint.Ad' ){

				// Check if we have a provider filter:
				var providerFilter = this.getConfig('provider');
				if( providerFilter && cuePoint.tags.toLowerCase().indexOf( providerFilter.toLowerCase() ) === -1 ){
					// skip the cuepoint that did not match the provider filter
					mw.log( "mw.FreeWheelController:: skip cuePoint with tag: " + cuePoint.tags + ' != ' + providerFilter );
					continue;
				}

				var adType = embedPlayer.kCuePoints.getRawAdSlotType( cuePoint );
				mw.log("FreeWheel:: context.addCuePointSlots: " + adType );
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
	}
};

} )( window.mw, window.jQuery );