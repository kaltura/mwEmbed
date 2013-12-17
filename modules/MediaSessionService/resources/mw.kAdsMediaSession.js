( function( mw, $ ) { "use strict";
	mw.kAdsMediaSession = function( embedPlayer, callback) {
		// Create a Player Manager
		return this.init( embedPlayer, callback );
	};
	
	mw.kAdsMediaSession.prototype = {
		mediaSessionRequest:null,
		
		init: function( embedPlayer, callback ){
			var _this = this;
			// Inherit KAds TODO refactor to use "Class.js" 
			mw.inherit( this, mw.KAds.prototype );
			
			// clear mediaSessionRequest:
			this.mediaSessionRequest = {};
			$.each(this.namedAdTimelineTypes, function(inx, adType){
				_this.mediaSessionRequest[adType] = [];
			});
					
			// media session needs all ad data ahead of time: 
			//mw.getMwEmbedPath()
			return this.parent_init( embedPlayer, callback );
		},
		loadAds:function( callback ){
			var _this = this;
			// check if MediaSessionService is active and has a guid
			if( !this.getGuid() ){
				return this.parent_loadAds( callback );
			}
			// else chain the parent load ads:
			return this.parent_loadAds( function(){
				// load into sequence here: 
				//_this.mediaSessionRequest;
			});
		},
		addSequenceProxyBinding: function( adType, adConfigSet, sequenceIndex ){
			var _this = this;
			if( adType == 'overlay' ){
				return this.parent_addSequenceProxyBinding( adType, adConfigSet, sequenceIndex );
			}
			// add to  mediaSessionRequest, ad urls 
			// all other properties operate with existing infrastructure. 
			if( adConfigSet[ adType ].ads ){
				for(var i in adConfigSet[ adType ].ads ){
					var ad = adConfigSet[ adType ].ads[i];
					if( ad.videoFiles ){
						var largetsBr = 0;
						var targetSrc = null;
						// get the highest quality url, by size or bitrate 
						for( var j in ad.videoFiles ){
							var source = ad.videoFiles[j];
							if( source['data-bandwith'] && source['data-bandwith'] > largetsBr ){
								largetsBr = source['data-bandwith'];
								targetSrc = source['src'];
							}
						}
						var largestWidth = 0;
						if( !targetSrc){
							for( var j in ad.videoFiles ){
								var source = ad.videoFiles[j];
								if( source['data-width'] && source['data-width'] > largestWidth ){
									largestWidth = source['data-width'];
									targetSrc = source['src'];
								}
							}
						}
						if( !targetSrc ){
							// take the first source: 
							for( var j in ad.videoFiles ){
								targetSrc = ad.videoFiles[j];
								break;
							}
						}
						_this.mediaSessionRequest[adType].push( targetSrc );
					}
				};
			}
			//this.mediaSessionRequest
			// add bindings to update state based on time: 
			$( _this.embedPlayer ).bind( 'AdSupport_' + adType + _this.bindPostfix, function( event, sequenceProxy ){
				debugger;
			});
		},
		getGuid: function(){
			return this.embedPlayer.evaluate('{mediaSessionService.guid}');
		}
	}

})( window.mw, window.jQuery );