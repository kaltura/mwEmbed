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
		cuePoints: [],
		syncEnabled: true,
		setup: function(){
			this.addBinding();
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
			this.bind( 'onplay', function () {
				_this.loadAdditionalAssets();
			} );
			//In live mode wait for first updatetime that is bigger then 0 for syncing initial slide
			if (mw.getConfig("EmbedPlayer.LiveCuepoints") && this.getPlayer().isLive()) {
				this.bind( 'timeupdate', function ( ) {
					if (_this.getPlayer().currentTime > 0) {
						_this.unbind('timeupdate');
					}
					var cuePoint = _this.getCurrentCuePoint();
					_this.sync( cuePoint );
				} );
			}

			this.bind( 'KalturaSupport_ThumbCuePointsReady', function () {
				var currentCuepoint = _this.getCurrentCuePoint() || _this.getCuePoints()[0];
				_this.sync(currentCuepoint);
			} );
			this.bind( 'KalturaSupport_CuePointReached', function ( e, cuePointObj ) {
				var cuePoint;
				$.each(_this.getConfig("cuePointType"), function(i, cuePointType){
					var main = $.isArray(cuePointType.main) ? cuePointType.main : [cuePointType.main];
					var sub = $.isArray(cuePointType.sub) ? cuePointType.sub : [cuePointType.sub];
					if ( ( $.inArray( cuePointObj.cuePoint.cuePointType, main ) > -1 ) &&
						( $.inArray( cuePointObj.cuePoint.subType, sub ) > -1 ) ) {
						cuePoint = cuePointObj.cuePoint;
						return false;
					}
				});
				if (!cuePoint){
					cuePoint = _this.getCurrentCuePoint();
				}
				_this.sync( cuePoint );
			} );
			this.bind("onChangeMedia", function(){
				if (_this.syncEnabled) {
					//Clear the current slide before loading the new media
					_this.getComponent().attr("src", "");
				}
			});
			this.bind("onChangeStream", function(){
				_this.syncEnabled = false;
			});
			this.bind("onChangeStreamDone", function(){
				_this.syncEnabled = true;
				var cuePoint = _this.getCurrentCuePoint();
				_this.sync( cuePoint );
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
		sync: function(cuePoint, callback){
			if (this.syncEnabled) {
				this.loadAdditionalAssets();
				var _this = this;
				var callCallback = function () {
					_this.applyIntrinsicAspect();
					if ( callback && typeof(callback) === "function" ) {
						callback();
					}
				};
				if ( cuePoint ) {
					var myImg = this.getComponent();
					if ( cuePoint.thumbnailUrl ) {
						myImg.attr( 'src', cuePoint.thumbnailUrl );
						callCallback();
					} else {
						this.loadNext( cuePoint, function ( url ) {
							myImg.attr( 'src', url );
							callCallback();
						} );
					}
				}
			}
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
				} else {
					mw.log( 'Dual screen:: No more cuepoints!' );
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
		}
	} );
}

)( window.mw, window.jQuery );