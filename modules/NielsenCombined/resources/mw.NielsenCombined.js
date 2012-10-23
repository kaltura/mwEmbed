/**
* NielsenCombined implemented per document outlined here:
* https://portal.kaltura.com/product/Shared%20Documents/Solution%20Architects/_Generic%20PRDs/Nielsen/KDP%20Nielsen%20Plugin%20PRD.docx
*
* Basic player flow:
*
* 	load player meta data ready:

	"3" to designate the content metadata ( with first segment length ) sequence index "1" and type "content"
	15 load / play preroll with "preroll" type
		send "7" to end the ad
		send "4" unload ad
	5 of type "content" content playback
	"7" stop content
	"15" load / play midroll "midroll" type
		send "7" to end the ad
		send "4" unload ad
	15 second segment of content as a "load play"
		"7" stop "content"
		"4" unload "content"
	15 postroll load / play with "postroll" type
		send "7" to end the ad
		send "4" unload ad

*/
( function( mw, $ ) { "use strict";

	mw.NielsenCombined = function( embedPlayer, callback ){
		this.init( embedPlayer, callback );
	};

	mw.NielsenCombined.prototype = {

		// Binding postfix ( enables us to "clear out" the plugins bindings
		bindPostFix: '.NielsenCombined',

		trackerPostFix: '.nielsenPlayerTracker',

		// The query interval to send progress updates to Nielsen
		queryInterval: 2,

		contentSource: null,

		// store the most recent ad Time ( needed because we don't have good ad skip events, so by
		// the time we get an ad skip we may have already switched sources )
		currentAdTime: null,

		init: function( embedPlayer, callback ){
			var _this = this;
			this.embedPlayer = embedPlayer;

			this.getGg( function( gg ){
				// Add sequence binding
				_this.addSequenceBinding();
				callback();
			});

			// on change media remove any existing bindings ( the next clip will re-invoke the plugin )
			embedPlayer.bindHelper( 'onChangeMedia' + _this.bindPostFix, function(){
				embedPlayer.unbindHelper( _this.bindPostFix );
			});
		},
		// Return the ggcmb370 url ( for now hard coded should be moved to config )
		getGgCmbUrl: function(){
			return mw.getMwEmbedPath() + 'modules/NielsenCombined/ggcmb382.js';
			// temporarily use local copy of ggcmb
			//return 'http://secure-us.imrworldwide.com/novms/js/2/ggcmb370.js';
		},
		/**
		 * called on player ready sets up all the bindings and fires the initial content beacon.
		 */
		addSequenceBinding: function(){
			var _this = this;
			var embedPlayer = this.embedPlayer;

			// Clear out any old bindings
			embedPlayer.unbindHelper( _this.bindPostFix );

			// Bind ad Playback
			var contentPlay = false;
			var adOpenUrl = false;
			var dispachedAdStart = false;
			var currentContentSegmentDuration = 0;
			var lastContentSegmentDuration = 0;
			var contentSegmentCount = 1;
			var currentSlotType = null;

			embedPlayer.bindHelper( 'AdSupport_StartAdPlayback' + _this.bindPostFix, function( event, slotType ){
				var vid = _this.getPlayerElement();
				currentSlotType = slotType;

				// Check if we were playing content before this "adStart"
				if( contentPlay ){
					contentPlay = false;
					// Stop content:
					_this.dispatchEvent( 7, _this.round( currentContentSegmentDuration ), 'content' );
					// Ad fire a 4 to 'unload' the content segment
					_this.dispatchEvent( 4, _this.round( currentContentSegmentDuration ), 'content' );
					lastContentSegmentDuration = currentContentSegmentDuration;
				}

				// We are in an ad:
				adOpenUrl = _this.getCurrentVideoSrc();
				// Wait for duration change event
				$( vid ).bind( 'durationchange.nielsenAd', function( e ){
					currentAdDuration = vid.duration;
					// unbind our duration change event:
					$( vid ).unbind( '.nielsenAd' );
					// Make sure we are still in an ad ( if not don't send anything and unset adOpenUrl )
					if( !_this.inAd() ){
						adOpenUrl = false;
						return ;
					}
					dispachedAdStart = true;
					// Playing an ad fire a 15 with all ad Meatadata
					_this.dispatchEvent( 15, _this.getCurrentVideoSrc() , slotType, _this.getMetaXmlString(), contentSegmentCount);
					// Add event bindings:
					_this.addPlayerTracking( slotType );
				});
			});
			embedPlayer.bindHelper( 'AdSupport_EndAdPlayback' + _this.bindPostFix, function( event ){
				// close the current ad:
				if( adOpenUrl && dispachedAdStart ){
					// Stop the ad:
					_this.dispatchEvent( 7, _this.round( _this.currentAdTime ), currentSlotType );
					// Ad fire a 4 to 'unload' the ad ( always called even if we don't get to "ended" event )
					_this.dispatchEvent( 4, _this.round( _this.currentAdTime ), currentSlotType );
					adOpenUrl = false;
				}
				// unbind tracking ( will be re-instated via addPlayerTracking on subsequent ads or content
				embedPlayer.unbindHelper( _this.trackerPostFix );

				// Restore content tracking after ad end:
				_this.addPlayerTracking( "content" );
			});

			// When starting content finish up content beacon and add content bindings
			embedPlayer.bindHelper( 'onplay'  + _this.bindPostFix, function(){
				var vid = _this.getPlayerElement();
				// Check if the play event is content or "inAdSequence"
				if( !_this.inAd() && !contentPlay ){
					contentPlay = true;

					var sendContentPlayBeacon = function(){
						// Playing content fire the 5 content beacon and start content tracking
						_this.dispatchEvent( 15, _this.getCurrentVideoSrc() , "content", _this.getMetaXmlString(), contentSegmentCount );
						contentSegmentCount++;

						// Add player "raw" player bindings:
						_this.addPlayerTracking( "content" );

						// set the segment update as soon as we have a timeupdate:
						currentContentSegmentDuration = _this.round( _this.getRelativeTime('duration') );
					};

					// check if we have duration before sending the event:
					if( vid.duration ){
						sendContentPlayBeacon();
					} else {
						$( vid ).bind( 'durationchange.nielsenContent', function( e ){
							sendContentPlayBeacon();
							$( vid ).unbind( 'durationchange.nielsenContent' );
						});
					};
				}
			});
			// Watch for 'ended' event for cases where finish all ads post sequence and everything "stop the player"
			embedPlayer.bindHelper( 'onEndedDone' + _this.bindPostFix, function(){
				// Stop the content:
				_this.dispatchEvent( 7, _this.round( _this.getRelativeTime('duration') ), 'content' );
				// unload the content as well.
				_this.dispatchEvent( 4, _this.round( _this.getRelativeTime('duration') ), 'content' );
				// At this point we have reset the player so reset bindings:
				embedPlayer.unbindHelper( _this.bindPostFix );
				_this.unbindPlayerTracking();

				// Reset the bindings for a replay or next clip ( don't stack)
				setTimeout(function(){
					_this.addSequenceBinding();
				},0);
			});
		},
		round: function( floatValue ){
			var roundedValue = Math.round( floatValue * 100 ) / 100;
			var str = '' + roundedValue;
			if( str.split('.').length == 1 ){
				str += '.00';
			} else if(  str.split('.')[1].length == 1){
				str += '0';
			}
			return str;
		},
		unbindPlayerTracking: function(){
			this.embedPlayer.unbindHelper( this.trackerPostFix );
			$( this.embedPlayer.getPlayerElement() ).unbind( this.trackerPostFix );
		},
		getPlayerElement: function(){
			// some ad providers such as freewheel inserts a new video tag into the page
			// ( track that instead of the first video source if present )
			if( $( this.embedPlayer.getPlayerElement() ).siblings('video').length ){
				return $( this.embedPlayer.getPlayerElement() ).siblings('video')[0];
			} else {
				return this.embedPlayer.getPlayerElement();
			}
		},
		/**
		 * Adds player bindings for either ads or players
		 */
		addPlayerTracking: function( type ){
			var _this = this;
			var embedPlayer = this.embedPlayer;
			var vid = _this.getPlayerElement();

			// Unbind any existing bindings::
			this.unbindPlayerTracking();

			// Non-native events: ( have to bind against embedPlayer instead of the video instance )
			embedPlayer.bindHelper( 'onOpenFullScreen' + _this.trackerPostFix, function(){
				_this.dispatchEvent( 10, "true", type);
			})
			embedPlayer.bindHelper( 'onCloseFullScreen' + _this.trackerPostFix, function(){
				_this.dispatchEvent( 10, "false", type);
			})
			// Mute:
			embedPlayer.bindHelper( 'onToggleMute' + _this.trackerPostFix, function(){
				_this.dispatchEvent( 9, String(embedPlayer.muted), type );
			})

			// Setup a shortcut to bind call ( including bindPostFix )
			var b = function( bindName, callback ){
				$( vid ).bind( bindName + _this.trackerPostFix, callback);
			}
			var pauseTime = null;

			// on ended let the player flow take over ( we don't want any of the end trigger events )
			b( 'ended', function(){
				// let the player take over on end:
				_this.unbindPlayerTracking();
			})


			// on pause:
			b( 'pause', function(){
				// pause is triggered as part of player end state ( don't dispatch if eventProgatation is off )
				if( embedPlayer._propagateEvents ){
					pauseTime = _this.round( _this.getRelativeTime('currentTime') );
					_this.dispatchEvent( 6, pauseTime, type );

					// Update paused time on seek
					b('seeked', function(){
						pauseTime = _this.round( _this.getRelativeTime('currentTime') );
					})

					// setup the resume binding:
					b('play', function(){
						// unbind play:
						$( vid ).unbind( 'play' + _this.trackerPostFix );
						if( embedPlayer._propagateEvents ){
							_this.dispatchEvent( 5, pauseTime, type );
						}
					});
				}
			});

			// Volume change:
			b( 'volumechange', function(){
				_this.dispatchEvent( 11, String( vid.volume ) );
			});

			// Kaltura HTML5 does not really have an idle state:
			// sender.onIdle( function( args ) { ggCom1.onCurrentStateChanged( args ) } );

			// Monitor:
			var lastTime = -1;
			b( 'timeupdate', function(){
				var vid = _this.getPlayerElement();

				if( type != 'content' ){
					_this.currentAdTime = vid.currentTime;
				}

				if( lastTime === -1 ){
					lastTime = vid.currentTime;
				}

				var posDelta  = Math.abs( parseFloat( vid.currentTime )  - parseFloat( lastTime ) );
				// Check for position changed more than "3" ( seek )
				if( posDelta > 3 ){
					mw.log("NielsenCombined:: Dispach clip jump, seek delta : " + posDelta );
					_this.dispatchEvent( 8, _this.round( lastTime ), _this.round( _this.getRelativeTime('currentTime') ), type );
				}
				// Dispatch vid progress every 2 seconds:
				if( posDelta > _this.queryInterval ){
					lastTime = vid.currentTime;
					_this.dispatchEvent( 49, _this.round( _this.getRelativeTime( 'currentTime' ) ), type );
				}
			});
		},
		/**
		 * Dispatches a Nielsen event via the gg.ggPM call.
		 * if debug is enabled we log this event to the console
		 */
		dispatchEvent: function(){
			var args = $.makeArray( arguments );
			var eventString = args.join("\n\n");
			mw.log("NielsenCombined:: dispatchEvent: " + eventString);
			// trigger dispatch event for testing
			if( parent && parent[ this.getConfig( 'trackEventMonitor' ) ] ){
				parent[ this.getConfig( 'trackEventMonitor' ) ]( args );
			}
			this.gg.ggPM.apply( this, args);
		},
		// Gets the "raw" current source ( works with ad assets )
		getCurrentVideoSrc: function(){
			// check for content url config
			if( ! this.inAd() && this.getConfig( 'content_url' ) ){
				return this.getConfig( 'content_url' );
			}

			var vid = this.getPlayerElement();
			if( vid && vid.src ){
				return vid.src;
			}
			// else just return the normal content source:
			return this.embedPlayer.getSrc();
		},
		/**
		 * Get video duration: includes relative
		 *
		 * @returns a int value
		 */
		getRelativeTime: function( timeAttribute ){
			var _this = this;
			var embedPlayer = this.embedPlayer;
			var vid = this.getPlayerElement();
			if( timeAttribute != 'duration' && timeAttribute != 'currentTime' ){
				mw.log("Error:: calling getRelativeTime with invalid timeAttribute: " + timeAttribute );
				return 0;
			}
			// Check if we are in an Ad and return the raw player duration or time:
			if( this.inAd() ){
				// if looking for duration first check the sequence proxy
				if( timeAttribute == 'duration'){
					var seqDuration = embedPlayer.evaluate( '{sequenceProxy.activePluginMetadata.duration}' );
					if( seqDuration ){
						return _this.round( seqDuration );
					}
				}
				var vid = this.getPlayerElement();
				if( vid && vid[ timeAttribute ]){
					return _this.round( vid[ timeAttribute ] );
				}
			}
			// Check if we have cuepoints
			if( embedPlayer.rawCuePoints ){
				var segmentDuration = 0;
				var prevCuePointTime = 0;
				var absolutePlayerTime = vid.currentTime * 1000;
				for( var i =0; i < embedPlayer.rawCuePoints.length; i++ ){
					var cuePoint = embedPlayer.rawCuePoints[ i ];
					// Make sure the cue point is an Ad and not an overlay ( adType 2 )
					if( cuePoint.cuePointType != 'adCuePoint.Ad' || cuePoint.adType == 2 ){
						continue;
					}
					// handle relative currentTime:
					if( timeAttribute == 'currentTime' ){
						if( cuePoint.startTime > absolutePlayerTime ){
							return _this.round( ( absolutePlayerTime - prevCuePointTime )  / 1000 );
						}
					} else { // handle duration:
						if( absolutePlayerTime < cuePoint.startTime ){
							return _this.round( ( cuePoint.startTime - prevCuePointTime ) / 1000 );
						}
						// if current Time is > that last cuePoint
						if( i == embedPlayer.rawCuePoints.length
								&&
							absolutePlayerTime > cuePoint.startTime
						){
							return _this.round( vid.duration - ( cuePoint.startTime / 1000 ) )
						}
					}
					prevCuePointTime = cuePoint.startTime;
				}
				// currentTime is in the last segment:
				if( timeAttribute == 'currentTime' ){
					return _this.round( ( absolutePlayerTime - prevCuePointTime )  / 1000 );
				}
			}
			// Should not allow length of 0
			if(  vid[ timeAttribute ]  ){
				return _this.round( vid[ timeAttribute ] );
			} else {
				// else just return embed player duration
				return embedPlayer[timeAttribute];
			}
		},
		inAd:function(){
			return !! this.embedPlayer.evaluate( '{sequenceProxy.isInSequence}' );
		},
		/**
		 * Get the Nielsen xml string:
		 */
		getMetaXmlString: function(){
			var _this = this;
			// These won't change
			var meta = ''+
				"<uurl>"+
					this.getCurrentVideoSrc() +
				"</uurl>\n" +
				"<length>"+
					_this.round( this.getRelativeTime( 'duration' ) )+
				"</length>\n";
			// A tag map that allows for ads to override content values
			var tagMap = {};
			// Get the current config evaluated expressions:
			var evalConfig = this.embedPlayer.getKalturaConfig('nielsenCombined');
			$.each( evalConfig, function( attr, evalValue ){
				// set the tag value
				if( !_this.inAd() && attr.indexOf('tag_') === 0 ){
					// set the content tag:
					tagMap[ attr.substr( 4 ) ] = evalValue;
				}
				// set ad tag value:
				if( _this.inAd() && attr.indexOf('ad_') === 0 ){
					tagMap[ attr.substr( 3 ) ] = evalValue;
				}
			});
			// Output the final tag map:
			$.each( tagMap, function(attr, evalValue){
				evalValue = evalValue || '';
				if( evalValue != ''){
					meta += '<' + attr + '>' + evalValue + '</' + attr + '>' + "\n";
				}
			})
			return meta;
		},
		/**
		 * Get a configuration value with full expression evaluation:
		 */
		getConfig: function( propAttr ){
			return this.embedPlayer.getKalturaConfig('nielsenCombined', propAttr );
		},
		/**
		 * Get the gg com object:
		 */
		getGg: function( callback ){
			var _this = this;
			if( !this.gg ){
				$.getScript( this.getGgCmbUrl(), function(){
					// Nielsen specific global param option:
					var clientId = _this.getConfig( "clientid" );
					if( ! clientId ){
						clientId = '';
					}
					var nolggGlobalParams = {
						  clientid: clientId,
						  vcid: _this.getConfig( "vcid" ),
						  cisuffix: _this.getConfig( "cisuffix" ) || ''
					};
					if( _this.getConfig( 'prod') ){
						nolggGlobalParams['prod'] = _this.getConfig( 'prod');
					}
					_this.gg = new gg();
					var uid = 0; // "provided by Nielsen"
					var oldFlashDetect = false; // no longer used (dummy placeholder for legacy implementations)
					var detectBrowser = true; //optional -- used to disable window object call for non-browser use
					_this.gg.ggInitialize( nolggGlobalParams, uid, oldFlashDetect, detectBrowser);
					callback( _this.gg );
				})
			} else {
				callback( this.gg );
			}
		}
	}

} )( window.mediaWiki, window.jQuery );