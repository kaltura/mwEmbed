( function( mw, $ ) { "use strict";
	mw.kAdsMediaSession = function( embedPlayer, callback) {
		// Create a Player Manager
		return this.init( embedPlayer, callback );
	};
	
	mw.kAdsMediaSession.prototype = {
		sequenceAds:null,
		
		init: function( embedPlayer, callback ){
			var _this = this;
			// Inherit KAds TODO refactor to use "Class.js" 
			mw.inherit( this, mw.KAds.prototype );

			this.sequenceAds = {};
			$.each(this.namedAdTimelineTypes, function(inx, adType){
				_this.sequenceAds[ adType ] = [];
			});
					
			// media session needs all ad data ahead of time: 
			//mw.getMwEmbedPath()
			return this.parent_init( embedPlayer, callback );
		},
		loadAds:function( callback ){
			var _this = this;
			
			// Setup the ad player, done after init to not duplicate the class 
			this.adPlayer = new mw.kAdMediaSessionPlayer( this.embedPlayer );
			
			// check if MediaSessionService is active and has a guid
			if( !this.getGuid() ){
				return this.parent_loadAds( callback );
			}
			// else chain the parent load ads:
			return this.parent_loadAds( function(){
				// load into sequence here: 
				_this.requestMediaSessionSequence( callback ) ;
			});
		},
		requestMediaSessionSequence: function( callback ){
			var _this = this;
			var params = {
				'service': 'mediaSequence',
				'wid': this.embedPlayer.kwidgetid,
				'uiconf_id': this.embedPlayer.kuiconfid,
				'entry_id': this.embedPlayer.kentryid,
				// the urls to be sequenced and respective positions: 
				'ads': this.sequenceAds
			};
			var globalRequestName = 'kAdSequenceRequest' + _this.getGuid().replace(/-/g,'');
			params['callback'] = globalRequestName;
			window[globalRequestName] = function( data ){
				// break out of jQuery try catch for clean debug errors: 
				setTimeout(function(){
					_this.handleSequenceResult( data );
					callback();
				},0);
			}
			// send a request to get back the HLS url with ads stitched in:
			$.getScript( mw.getMwEmbedPath() + 'services.php?' + $.param( params ) );
		},
		handleSequenceResult:function( data ){
			var _this = this;
			// add the hls source: 
			var kAdsSource = this.embedPlayer.mediaElement.tryAddSource(
				$('<soruce>').attr({
					'src' : data['url'],
					'type': 'application/vnd.apple.mpegurl'
				})
			);
			// change source to HLS
			$(this.embedPlayer.mediaElement).bind('onSelectSource', function () {
				// select our m3u8 source: 
				_this.embedPlayer.selectedSource = kAdsSource;
			});
			// tell the ad player about the sequence:
			_this.adPlayer.setSequence( data['sequence'] );
		},
		addSequenceProxyBinding: function( adType, adConfigSet, sequenceIndex ){
			var _this = this;
			// no need to request ads for overlays: 
			if( adType == 'overlay' ){
				return this.parent_addSequenceProxyBinding( adType, adConfigSet, sequenceIndex );
			}
			// add to  adUrls, ad urls 
			// all other properties operate with existing infrastructure. 
			if( adConfigSet[ adType ].ads ){
			
				for(var i in adConfigSet[ adType ].ads ){
					var ad = adConfigSet[ adType ].ads[i];
					if( ad.videoFiles ){
						_this.sequenceAds[adType].push({
							'src' : _this.getLargestSrc( ad.videoFiles ),
							'vastId': ad.id
						});
					}
				};
			}
			// do the normal binding we override via KAdMediaSessionPlayer
			return this.parent_addSequenceProxyBinding( adType, adConfigSet, sequenceIndex );
		},
		getLargestSrc: function( adFiles ){
			var largetsBr = 0;
			var targetSrc = null;
			// get the highest quality url, by size or bitrate 
			for( var j in adFiles ){
				var source = adFiles[j];
				if( source['data-bandwith'] && source['data-bandwith'] > largetsBr ){
					largetsBr = source['data-bandwith'];
					targetSrc = source['src'];
				}
			}
			var largestWidth = 0;
			if( !targetSrc){
				for( var j in adFiles ){
					var source = adFiles[j];
					if( source['data-width'] && source['data-width'] > largestWidth ){
						largestWidth = source['data-width'];
						targetSrc = source['src'];
					}
				}
			}
			if( !targetSrc ){
				// take the first source: 
				for( var j in adFiles ){
					targetSrc = adFiles[j];
					break;
				}
			}
			return targetSrc;
		},
		getGuid: function(){
			return this.embedPlayer.evaluate('{mediaSessionService.guid}');
		}
	}

})( window.mw, window.jQuery );