(function ( mw, $ ) {
	"use strict";
	mw.dualScreen = mw.dualScreen || {};

	mw.dualScreen.imagePlayer = mw.KBaseComponent.extend({
		defaultConfig: {
			cuePointType: [{
				"main": mw.KCuePoints.TYPE.THUMB,
				"sub": [mw.KCuePoints.THUMB_SUB_TYPE.SLIDE]
			}],
			prefetch: {
				'durationPercentageUntilNextSequence': 60,
				'minimumSequenceDuration': 2
			}
		},
		latestPreviewCuepoint : null,
		cuePointsManager : null,
		cuePoints: [],
		showFirstSlideOnLoad : true,
		forcedFirstCuePoint: false,
		syncEnabled: true,
		slidesCuePointTypes : null,
		setup: function() {
			this.addBinding();
			this.initializeSlidesCuePointTypes();
		},
		initializeSlidesCuePointTypes : function()
		{
			// This function takes the filter configuration and map it to relevent structure (backward competability issues)
			var cuePointTypes = this.getConfig("cuePointType");
			var slidesCuePointTypes = [];

			if (cuePointTypes && cuePointTypes.length > 0)
			{
				$.each(cuePointTypes, function (index, cuePointType) {
					if (cuePointType.sub && cuePointType.sub.length > 0) {
						$.each(cuePointType.sub,function(sindex, subType)
						{
							slidesCuePointTypes.push({main : cuePointType.main, sub : subType});
						});
					}
				});
			}

			if (slidesCuePointTypes.length > 0)
			{
				this.slidesCuePointTypes = slidesCuePointTypes;
			}else {
				this.slidesCuePointTypes = null;
			}
		},

		initializeCuePointsManager:function()
		{
			var _this = this;

			if ((_this.getPlayer().isLive() && mw.getConfig("EmbedPlayer.LiveCuepoints")) || _this.getPlayer().kCuePoints) {
				// handle cue points only if either live or we have cue points loaded from the server
				setTimeout(function()
				{
					if (!_this.cuePointsManager) {
						_this.cuePointsManager = new mw.webcast.CuePointsManager(_this.getPlayer(), function () {
						}, "imagePlayer_CuePointsManager");

						_this.cuePointsManager.onCuePointsReached = function (args) {
							_this.cuePointsReached(args);
						};
					}
				},1000);
			}
		},
		destroyCuePointsManager:function()
		{
			if (this.cuePointsManager) {
				mw.log("imagePlayer.destroyCuePointsManager(): removing existing instance of cue points manager");
				this.cuePointsManager.destroy();
				this.cuePointsManager = null;
			}
		},
		cuePointsReached : function(context) {
			var cuePoints = context.filter({tags: ['remove-selected-thumb']});
			cuePoints = cuePoints.concat(context.filter({types: this.slidesCuePointTypes}));

			cuePoints.sort(function (a, b) {
				return (b.startTime - a.startTime);
			});

			var mostUpdatedCuePointToHandle = cuePoints.length > 0 ? cuePoints[0] : null; // since we ordered the relevant cue points descending - the first cue point is the most updated

			if (mostUpdatedCuePointToHandle) {
				this.sync(mostUpdatedCuePointToHandle)
			} else if (context.reason === 'reconstructState') {
				this.sync(null);
			}
		},
		canRender: function () {
			var cuePoints = this.getCuePoints();
			var cuePointsExist = (cuePoints.length > 0);
			return (!this.getPlayer().useNativePlayerControls() &&
				(
					( this.getPlayer().isLive() && this.getPlayer().isDvrSupported() && mw.getConfig("EmbedPlayer.LiveCuepoints") ) ||
					( !this.getPlayer().isLive() && cuePointsExist )
				)
			);
		},
		addBinding: function(){
			var _this = this;
			this.bind('onId3Tag' , function(event,id3tag){
				// if we got to this code - we are on a live session
				if(_this.latestPreviewCuepoint){
					// if we stored a preview thumb-cuepoint - restore and clear it
					_this.sync(_this.latestPreviewCuepoint);
					_this.latestPreviewCuepoint = null;
				}
			});

			// listen to push cuepoint API
			this.bind('KalturaSupport_PushCuePointsReceived' , function(event,cuepoint){
				if( !cuepoint.length && cuepoint && cuepoint.tags
					&& _this.embedPlayer.isLive()
					&& cuepoint.tags.indexOf("__PREVIEW_CUEPOINT_TAG__") > -1
					&& cuepoint.tags.indexOf("select-a-thumb") > -1
				){
					// this is a slide that is received on preview mode - store latestPreviewCuepoint
					_this.latestPreviewCuepoint =  cuepoint;
				}
			});

			this.bind('KalturaSupport_ThumbCuePointsReady' , function(){
				if (_this.getPlayer().isLive()){
					//Forcing 1st slide is only on VOD entry
					return;
				}
				// on non-autoplayed player - check if required to force-show the 1st CP
				var chaptersRawData = _this.getCuePoints();
				if(chaptersRawData && chaptersRawData.length
					&& _this.showFirstSlideOnLoad && !_this.embedPlayer.getFlashvars().autoPlay ){
					var firstSlide = chaptersRawData[0];
					_this.sync(firstSlide);
					_this.forcedFirstCuePoint = true;
				}
			})


			if (this.getPlayer().playerReadyFlag) {
				this.initializeCuePointsManager();
			} else {
				this.bind('playerReady', function () {
					_this.initializeCuePointsManager();
				});
			}

			this.bind( 'onplay', function () {
				if(_this.forcedFirstCuePoint){
					// in case we forced-loaded the 1st cuepoint - remove it on play.
					_this.sync(null);
					_this.forcedFirstCuePoint = false;
				}
				_this.loadAdditionalAssets();
			} );

			this.bind("onChangeMedia", function(){
				if (_this.syncEnabled) {
					_this.destroyCuePointsManager();

					//Clear the current slide before loading the new media
					_this.getComponent().attr("src", "");
				}
			});

			this.bind("onChangeStream", function(){
				_this.syncEnabled = false;
			});

			this.bind("onChangeStreamDone", function(){
				_this.syncEnabled = true;
			});

			this.bind( 'postDualScreenTransition displayRepainted', function () {
				_this.applyIntrinsicAspect();
			});
		},
		getComponent: function() {
			if (!this.$el) {
				this.$el =
					$( '<img>' )
						.attr( 'id', 'SynchImg' )
						.addClass( "imagePlayer" );
			}
			return this.$el;
		},
		applyIntrinsicAspect: function(){
			// Check if a image thumbnail is present:
			var $img = this.getComponent();
			var imgContainer = this.getComponent().parent();
			//Make sure both image player and display are initialized
			if( $img.length && imgContainer.length/*&& this.viewInitialized*/){
				var pHeight = imgContainer.height();
				// Check for intrinsic width and maintain aspect ratio
				var pWidth = parseInt( $img.naturalWidth() / $img.naturalHeight() * pHeight, 10);
				var pClass = 'fill-height';
				if( pWidth > imgContainer.width() ){
					pClass = 'fill-width';
				}
				$img.removeClass('fill-width fill-height').addClass(pClass);
			}
		},
		getCuePoints: function(){
			var cuePoints = [];
			var _this = this;
			if ( this.getPlayer().kCuePoints ) {
				$.each( _this.getConfig("cuePointType"), function ( i, cuePointType ) {
					$.each( cuePointType.sub, function ( j, cuePointSubType ) {
						var filteredCuePoints = _this.getPlayer().kCuePoints.getCuePointsByType( cuePointType.main, cuePointSubType );
						cuePoints = cuePoints.concat( filteredCuePoints );
					} );
				} );
			}

			cuePoints.sort(function (a, b) {
				return a.startTime - b.startTime;
			});
			return cuePoints;
		},
		sync: function(cuePoint){
			if (this.syncEnabled) {

				if (!cuePoint)
				{
					this.getComponent().attr('src','');
				}else if (cuePoint.cuePointType === 'thumbCuePoint.Thumb') {
					this.loadAdditionalAssets();
					var _this = this;
					var callCallback = function () {
						_this.applyIntrinsicAspect();
					};
					if (cuePoint) {
						var myImg = this.getComponent();
						if (cuePoint.loaded && cuePoint.thumbnailUrl) {
							myImg.attr('src', cuePoint.thumbnailUrl);
							callCallback();
						} else {
							this.loadNext(cuePoint, function (url) {
								myImg.attr('src', url);
								callCallback();
							});
						}
					}
				}else if (cuePoint && cuePoint.cuePointType === 'codeCuePoint.Code')
				{
					// remove slide if requested
					if ( (cuePoint.tags || '').indexOf('remove-selected-thumb') !== -1)
					{
						this.getComponent().attr('src','');
					}
				}
			}
			this.latestPreviewCuepoint = cuePoint;
		},
		//Prefetch
		loadAdditionalAssets: function () {
			if ( this.cuePoints ) {
				this.cancelPrefetch();
				var currentTime = this.getPlayer().currentTime;
				var nextCuePoint = this.getNextCuePoint( currentTime * 1000 );
				if ( nextCuePoint ) {
					if (!nextCuePoint.loaded) {
						var nextCuePointTime = nextCuePoint.startTime / 1000;
						var prefetch = this.getConfig("prefetch");
						var delta = nextCuePointTime - currentTime;

						var _this = this;

						if ( nextCuePointTime > currentTime && prefetch.minimumSequenceDuration <= delta ) {

							var timeOutDuration = delta * (prefetch.durationPercentageUntilNextSequence / 100) * 1000;
							this.prefetchTimeoutId = setTimeout( function () {
									_this.loadNext( nextCuePoint );
									_this.prefetchTimeoutId = null;
								}, timeOutDuration
							);
						} else if ( prefetch.minimumSequenceDuration > delta ){
							this.loadNext( nextCuePoint );
						} else {
							mw.log('Dual screen::: Too late, bail out!!!');
						}
					} else {
						mw.log('Dual screen:: Asset already loaded, aborting...');
					}
				}
			}
		},
		cancelPrefetch: function () {
			if ( typeof( this.prefetchTimeoutId ) === 'number' ) {
				mw.log( 'Dual screen:: Cancel pending prefetch(' + this.prefetchTimeoutId + ')' );
				window.clearTimeout( this.prefetchTimeoutId );
				this.prefetchTimeoutId = null;
			}
		},
		loadNext: function (nextCuePoint, callback) {
			if (nextCuePoint.thumbnailUrl){
				if (!nextCuePoint.loaded){
					this.loadImage(nextCuePoint.thumbnailUrl, nextCuePoint, callback);
				}
			} else if (callback || (!nextCuePoint.loading && !nextCuePoint.loaded)) {
				nextCuePoint.loading = true;
				var assetId = nextCuePoint.assetId;

				var _this = this;
				// do the api request
				this.getKalturaClient().doRequest( {
					'service': 'thumbAsset',
					'action': 'getUrl',
					'id': assetId
				}, function ( data ) {
					// Validate result
					if ( !_this.isValidResult( data ) ) {
						return;
					}
					// Preload the next image
					_this.loadImage(data, nextCuePoint, callback);
				} );
			}
		},
		loadImage: function(src, cuePoint, callback){
			var _this = this;
			var img = new Image();
			img.onload = function () {
				cuePoint.loaded = true;
				cuePoint.loading = false;
				cuePoint.thumbnailUrl = src;
				if ( callback && typeof(callback) === "function" ) {
					callback.apply( _this, [src] );
				}
			};
			img.onerror = function () {
				cuePoint.loaded = false;
				cuePoint.loading = false;
				cuePoint.thumbnailUrl = null;
			};
			img.src = src;
		},
		isValidResult: function( data ){
			// Check if we got error
			if( !data
				||
				( data.code && data.message )
			){
				//this.log('Error getting related items: ' + data.message);
				//this.getBtn().hide();
				this.error = true;
				return false;
			}
			this.error = false;
			return true;
		},
		getNextCuePoint: function ( time ) {
			var cuePoints = this.getCuePoints();

			// Start looking for the cue point via time, return first match:
			for ( var i = 0; i < cuePoints.length; i++ ) {

				if ( cuePoints[i].startTime >= time ) {
					return cuePoints[i];
				}
			}
			// No cue point found in range return false:
			return false;
		},
		getCurrentCuePoint: function ( ) {
			var currentTime = this.getPlayer().currentTime *1000;
			var cuePoints = this.getCuePoints();
			var cuePoint;
			var duration=this.getPlayer().isLive() ? 0 : this.getPlayer().getDuration() * 1000;

			//assume sortedCuePoints array
			for ( var i = 0; i < cuePoints.length; i++ ) {

				var startTime = cuePoints[i].startTime;

				if ( (startTime > currentTime) ||  //stop once we found a future slide (or out of range slide)
					(duration>0 && startTime>duration)) {
					break;
				}

				cuePoint=cuePoints[i];

			}
			return cuePoint;
		},
        getPoster: function(){
            return this.getCuePoints()[0].thumbnailUrl;
        },

        destroy: function ( ) {
			this.latestPreviewCuepoint = null;
            this.getComponent().remove();
            this.destroyCuePointsManager();
            this._super();
        }
	} );
}

)( window.mw, window.jQuery );
