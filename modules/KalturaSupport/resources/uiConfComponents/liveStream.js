( function( mw, $ ) { "use strict";
	mw.addKalturaConfCheck( function( embedPlayer, callback ) {
		if ( embedPlayer.isLive() ) {
			var liveStreamPlugin = {

				bindPostFix : '.liveStream',
				
				firstPlay : false,
				/**
				 * API requests interval for updating live stream status (Seconds).
				 * Default is 30 seconds, to match server's cache expiration
				 */
				liveStreamStatusInterval : 30,
				
				// Default DVR Window (Seconds)
				defaultDVRWindow : 30 * 60,
				
				// Minimal broadcast time before allowing DVR playback (Seconds)
				minDVRTime : 30,
				
				minDVRReached : false,
				
				vidStartTime : null,
				
				clockStartTime : null,
				
				lastTimeDisplayed : 0,
						
				init: function( embedPlayer ) {
					this.log( "Init" );
					this.embedPlayer = embedPlayer;
					
					this.addLiveStreamStatusMonitor();
					this.addLiveStreamStatus();
					if ( this.isDVR() ) {
						this.dvrWindow = embedPlayer.evaluate( '{mediaProxy.entry.dvrWindow}' ) * 60;
						if ( !this.dvrWindow ) {
							this.dvrWindow = this.defaultDVRWindow;
						}
						// Setting DVR UI
						this.addScrubber();
						this.addTimeDisplay();
						this.addBackToLiveButton();
					}
					this.addPlayerBindings();
					this.extendApi();
				},
				
				isDVR: function(){
					return this.embedPlayer.evaluate( '{mediaProxy.entry.dvrStatus}' );
				},
				
				addPlayerBindings: function() {
					this.log( "Adding player bindings" );
					var _this = this;
					var embedPlayer = this.embedPlayer;

					embedPlayer.unbindHelper( _this.bindPostFix );
					
					embedPlayer.bindHelper( 'playerReady' + this.bindPostFix, function() {
						if ( _this.isDVR() ) {
							// Hiding DVR UI until first play
							_this.hideLiveStreamStatus();
							_this.hideScrubber();
							_this.hideBackToLive();
							_this.disableLiveControls();
							embedPlayer.addPlayerSpinner();
							_this.getLiveStreamStatusFromAPI( function( onAirStatus ) {
								_this.showLiveStreamStatus();
								embedPlayer.hideSpinner();
							} );
						}
					} );
					
					embedPlayer.bindHelper( 'onplay' + this.bindPostFix, function() {
						if ( _this.isDVR() ) {
							_this.hideLiveStreamStatus();
							_this.removePausedMonitor();
						}
					} );
					
					embedPlayer.bindHelper( 'onpause' + this.bindPostFix, function() {
						if ( _this.isDVR() ) {
							_this.disableLiveControls();
							_this.unsetLiveIndicator();
							embedPlayer.addPlayerSpinner();
							_this.getLiveStreamStatusFromAPI( function( onAirStatus ) {
								_this.showLiveStreamStatus();
								if ( onAirStatus ) {
									_this.showBackToLive();
									_this.addPausedMonitor();
								}
								_this.enableLiveControls();
							} );
						}
					} );
					
					embedPlayer.bindHelper( 'liveStreamStatusUpdate' + this.bindPostFix, function( e, onAirObj ) {
						_this.setLiveStreamStatus( _this.getLiveStreamStatusText() );
						if ( !_this.firstPlay || !_this.isDVR() ) {
							_this.toggleLiveControls( onAirObj.onAirStatus );
						}
						if ( _this.isDVR() && !onAirObj.onAirStatus ) {
							_this.hideBackToLive();
						}
					} );
					
					embedPlayer.bindHelper( 'firstPlay' + this.bindPostFix, function() {
						_this.firstPlay = true;
						if ( _this.isDVR() ) {
							var vid = embedPlayer.getPlayerElement();
							// Binding to video playing to make sure we have updated vid.currentTime
							$( vid ).bind( 'playing' + _this.bindPostFix, function() {
								// Only bind once, at first play
								$( vid ).unbind( 'playing' + _this.bindPostFix );
								_this.setLiveIndicator();
								_this.disableScrubber();
								_this.showScrubber();
								_this.vidStartTime = _this.getCurrentTime();
								_this.clockStartTime = Date.now();
								if ( _this.vidStartTime < _this.minDVRTime ) {
									_this.addMinDVRMonitor();
									return ;
								}
								_this.minDVRReached = true;
								_this.enableScrubber();
							} );	
						}
					} );

				},
				
				/**
				 * Making sure we have more than <minDVRTime> content
				 */
				addMinDVRMonitor: function() {
					this.log( "addMinDVRMonitor : " + _this.minDVRTime );
					var _this = this;
					var currTime = this.getCurrentTime();
					this.minDVRMonitor = setInterval( function() {
						if ( currTime >= _this.minDVRTime ) {
							_this.minDVRReached = true;
							_this.enableScrubber();
							_this.removeMinDVRMonitor();
							return ;
						}
						currTime = _this.getCurrentTime();
					}, 1000 )
				},
				
				removeMinDVRMonitor: function() {
					this.log( "removeMinDVRMonitor" );
					this.minDVRMonitor = clearInterval( this.minDVRMonitor );
				},
				
				/**
				 * API Requests to update on/off air status
				 */
				addLiveStreamStatusMonitor: function() {
					this.log( "addLiveStreamStatusMonitor" );
					var _this = this;
					this.liveStreamStatusMonitor = setInterval( function() {
						_this.getLiveStreamStatusFromAPI();
					}, _this.liveStreamStatusInterval * 1000 );
				},
				
				removeLiveStreamStatusMonitor: function() {
					this.log( "removeLiveStreamStatusMonitor" );
					this.liveStreamStatusMonitor = clearInterval( this.liveStreamStatusMonitor );
				},
				
				/**
				 * Updating display time & scrubber while in paused state
				 */
				addPausedMonitor: function() {
					var _this = this;
					var embedPlayer = this.embedPlayer;
					var vid = embedPlayer.getPlayerElement();
					var pauseTime = vid.currentTime;
					var pauseClockTime = Date.now();
					var scrubberPosition = this.getCurrentScrubberPosition() / 1000;
					var totalTime = _this.dvrWindow;
					if ( scrubberPosition < .99 ) {
						// If scrubber is positioned < .99 (DVR Content) - Calculate total time based on scrubber position
						var sliderPos = 1 - scrubberPosition;
						var currentTime = mw.npt2seconds( this.getTimeDisplay() );
						totalTime = currentTime / sliderPos;
					} 
					else {
						// Otherwise (Live state), take the minimum from DVR Window and video currentTime
						if ( pauseTime < totalTime ) {
							totalTime = pauseTime;
						}
					}
					this.log( "addPausedMonitor : totalTime = " + totalTime + ", Monitor rate = " + mw.getConfig( 'EmbedPlayer.MonitorRate' ) );
					this.pausedMonitor = setInterval( function() {
						var timePassed = ( Date.now() - pauseClockTime ) / 1000;
						var updateTime = _this.lastTimeDisplayed + timePassed;
						var perc = updateTime / totalTime;
						if ( updateTime > totalTime ) {
							perc = 1;
						}
						_this.updateScrubber( 1 - perc );
						_this.setTimeDisplay( '-' + mw.seconds2npt( updateTime ) );
					}, mw.getConfig( 'EmbedPlayer.MonitorRate' ) );
				},
				
				removePausedMonitor: function() {
					this.lastTimeDisplayed = mw.npt2seconds( this.getTimeDisplay() );
					this.log( "removePausedMonitor : Last time displayed = " + this.lastTimeDisplayed );
					this.pausedMonitor = clearInterval( this.pausedMonitor );
				},
				
				/**
				 * Add on/off air status to the control bar
				 */
				addLiveStreamStatus: function() {
					var embedPlayer = this.embedPlayer;
					embedPlayer.bindHelper( 'addControlBarComponent', function(event, controlBar ) {
						var $liveStreamStatus = {
							'w': 28,
							'o': function( ctrlObj ) {
								return $( '<div />' ).addClass( "ui-widget live-stream-status" );
							}
						};
						
						// Add the button to control bar
						controlBar.supportedComponents[ 'liveStreamStatus' ] = true;
						controlBar.components[ 'liveStreamStatus' ] = $liveStreamStatus;
					} );
				},
				
				/**
				 * Add DVR Scrubber, to enable seeking within the DVR window
				 */
				addScrubber: function() {
					var _this = this;
					var embedPlayer = this.embedPlayer;
					
					embedPlayer.bindHelper( 'addControlBarComponent', function(event, controlBar ) {
						var $liveStreamDVRScrubber = {
							'w':0, // special case (takes up remaining space)
							'o': function( ctrlObj ) {
								
								var sliderConfig = {
									range: "max",
									// Start at the end
									value: 1000,
									min: 0,
									max: 1000,
									// we want less than monitor rate for smoth animation
									animate: mw.getConfig( 'EmbedPlayer.MonitorRate' ) - ( mw.getConfig( 'EmbedPlayer.MonitorRate' ) / 30 ),
									start: function( event, ui ) {
										_this.userSlide = true;
										embedPlayer.getInterface().find( '.play-btn-large' ).fadeOut( 'fast' );
									},
									slide: function( event, ui ) {
										var perc = ui.value / 1000;
										var totalVidTime = _this.vidStartTime + ( ( Date.now() - _this.clockStartTime ) / 1000 );
										var totalTime = ( totalVidTime < _this.dvrWindow ) ? totalVidTime : _this.dvrWindow;
										// always update the title 
										if ( perc > .99 ) { 
											// Sliding to the rightmost side: Go back to live broadcast with matching indication
											embedPlayer.getInterface().find( '.play_head_dvr .ui-slider-handle' ).attr( 'data-title', 'Live' );
											_this.setLiveIndicator();
											return ;
										}
										// Slider percentage is calculated based on a left-to-right slider. We need the opposite
										var jumpToTime = ( 1 - perc ) * totalTime;
										embedPlayer.getInterface().find( '.play_head_dvr .ui-slider-handle' ).attr( 'data-title', mw.seconds2npt( jumpToTime ) );
										// Show negative time indication (How much time we seek backwards from current, "live", position
										_this.setTimeDisplay( '-' + mw.seconds2npt( jumpToTime ) )
									},
									change: function( event, ui ) {
										var perc = ui.value / 1000;
										var totalVidTime = _this.vidStartTime + ( ( Date.now() - _this.clockStartTime ) / 1000 );
										var totalTime = ( totalVidTime < _this.dvrWindow ) ? totalVidTime : _this.dvrWindow;
										var jumpToTime = perc * totalTime;
										// always update the title 
										if ( perc > .99 ) {
											embedPlayer.getInterface().find( '.play_head_dvr .ui-slider-handle' ).attr( 'data-title', 'Live' );
										}
										else {
											embedPlayer.getInterface().find( '.play_head_dvr .ui-slider-handle' ).attr( 'data-title', mw.seconds2npt( jumpToTime ) );
											_this.showBackToLive();
										}
										// Only run the onChange event if done by a user slide
										// (otherwise it runs times it should not)
										if ( _this.userSlide ) {
											_this.userSlide = false;
											if ( perc > .99 ) {
												_this.backToLive();
												return ;
											}
											_this.setCurrentTime( jumpToTime );
											_this.lastTimeDisplayed = ( 1 - perc ) * totalTime;
										}
									}
								};
								
								// Right offset for the scrubber = 
								// ( Total width - non used space - Pause button width ) + ( Time display width + Live Stream Status Width )
								var rightOffset = ( embedPlayer.getPlayerWidth() - ctrlObj.availableWidth - ctrlObj.components.pause.w )
								var $playHead = $( '<div />' )
									.addClass ( "play_head_dvr" )
									.css( {
										"position" : 'absolute',
										"left" : ( ctrlObj.components.pause.w + 4 ) + 'px',
										"right" : rightOffset + 'px'
									} )
									// Playhead binding
									.slider( sliderConfig );

								// Up the z-index of the default status indicator:
								$playHead.find( '.ui-slider-handle' )
									.attr('data-title', mw.seconds2npt( 0 ) );
								$playHead.find( '.ui-slider-range' ).addClass( 'ui-corner-all' ).css( 'z-index', 2 );

								return $playHead;
							}
						}

						// Add the scrubber to control bar
						controlBar.supportedComponents[ 'liveStreamDVRScrubber' ] = true;
						controlBar.components[ 'liveStreamDVRScrubber' ] = $liveStreamDVRScrubber;
					} );
				},
				
				/**
				 * Show time display / Live indicator
				 */
				addTimeDisplay: function() {
					var _this = this;
					var embedPlayer = this.embedPlayer;
					
					embedPlayer.bindHelper( 'addControlBarComponent', function(event, controlBar ) {
						var $liveStreamTimeDisplay = {
							'w' : mw.getConfig( 'EmbedPlayer.TimeDisplayWidth' ),
							'o' : function( ctrlObj ) {
								return $( '<div />' ).addClass( "ui-widget time-disp-dvr" );
							}
						}

						// Add the scrubber to control bar
						controlBar.supportedComponents[ 'liveStreamDVRStatus' ] = true;
						controlBar.components[ 'liveStreamDVRStatus' ] = $liveStreamTimeDisplay;
					} );
				},
				
				addBackToLiveButton: function() {
					var _this = this;
					var embedPlayer = this.embedPlayer;
					
					embedPlayer.bindHelper( 'addControlBarComponent', function(event, controlBar ) {
						var $backToLiveWrapper = 
							$( '<div />' )
								.addClass( 'back-to-live-icon' )
								.after( 
									$( '<div />')
										.addClass( 'back-to-live-text' )
										.text( 'Live' ) 
								);
						var $backToLiveButton = 
							$( '<div />')
								.addClass( 'ui-widget back-to-live' )
								.html( $backToLiveWrapper )
								.click( function() {
									_this.backToLive();
								} );
						var $backToLive = {
							'w' : 28,
							'o' : function( ctrlObj ) {
								return $backToLiveButton;
							}
						}

						// Add the scrubber to control bar
						controlBar.supportedComponents[ 'backToLive' ] = true;
						controlBar.components[ 'backToLive' ] = $backToLive;
					} );
				},
				
				/**
				 * Set live indication
				 */
				setLiveIndicator: function() {
					this.log( "setLiveIndicator" );
					if( this.embedPlayer.getInterface() && !embedPlayer.isOffline() ) {
						this.embedPlayer.getInterface().find( '.time-disp-dvr' ).addClass( 'time-disp-dvr-live' ).html( 'Live' );
					}
					this.lastTimeDisplayed = 0;
				},
				
				/**
				 * Unset live indication
				 */
				unsetLiveIndicator: function() {
					this.log( "unsetLiveIndicator" );
					if( this.embedPlayer.getInterface() && this.embedPlayer.getInterface().find( '.time-disp-dvr' ).hasClass( 'time-disp-dvr-live' ) ) {
						this.embedPlayer.getInterface().find( '.time-disp-dvr' ).removeClass( 'time-disp-dvr-live' ).html( '' );
					}					
				},
				
				setTimeDisplay: function( value ) {
					this.log( "setTimeDisplay : " + value );
					this.unsetLiveIndicator();
					if( this.embedPlayer.getInterface() ) {
						this.embedPlayer.getInterface().find( '.time-disp-dvr' ).html( value );
					}
				},
				
				getTimeDisplay: function() {
					if ( this.embedPlayer.getInterface() ) {
						// Currently viewing live content
						if ( this.embedPlayer.getInterface().find( '.time-disp-dvr' ).hasClass( 'time-disp-dvr-live' ) ) {
							return 0;
						}
						return this.embedPlayer.getInterface().find( '.time-disp-dvr' ).text().substr( 1 );
					}
					return null;
				},
				
				showBackToLive: function() {
					this.hideLiveStreamStatus();
					var embedPlayer = this.embedPlayer;
					var $backToLive = embedPlayer.getInterface().find( '.back-to-live' );
					if ( $backToLive.length && $backToLive.is( ':hidden' ) ) {
						this.log( "showBackToLive" );
						embedPlayer.getInterface().find( '.back-to-live' ).show();
					}
				},
				
				hideBackToLive: function() {
					this.log( "hideBackToLive" );
					var embedPlayer = this.embedPlayer;
					
					if ( embedPlayer.getInterface().find( '.back-to-live' ).length ) {
						embedPlayer.getInterface().find( '.back-to-live' ).hide();
					}
				},
				
				backToLive: function() {
					var _this = this;
					var embedPlayer = this.embedPlayer;
					this.disableLiveControls();
					embedPlayer.addPlayerSpinner();
					this.hideTimeDisplay();
					this.hideBackToLive();
					this.updateScrubber( 1 );
					this.lastTimeDisplayed = 0;
					var vid = embedPlayer.getPlayerElement();
					$( vid ).bind( 'playing' + this.bindPostFix, function() {
						$( vid ).unbind( 'playing' + _this.bindPostFix );
						embedPlayer.hideSpinner();
						_this.setLiveIndicator();
						_this.enableLiveControls( true );
					} );
					vid.load();
					vid.play();
				},
				
				hideTimeDisplay: function() {
					this.log( "hideTimeDisplay" );
					this.setTimeDisplay( '' );
				},

				/**
				 * Hide on/off air status from the control bar
				 */
				hideLiveStreamStatus: function() {
					var embedPlayer = this.embedPlayer;
					var $liveStatus = embedPlayer.getInterface().find( '.live-stream-status' );
					if ( $liveStatus.length && !$liveStatus.is( ':hidden' ) ) {
						this.log( "hideLiveStreamStatus" );
						this.embedPlayer.getInterface().find( '.live-stream-status' ).hide();
					}
				},
				
				/**
				 * Restore hidden on/off air status
				 */
				showLiveStreamStatus: function() {
					this.log( "showLiveStreamStatus" );
					this.embedPlayer.getInterface().find( '.live-stream-status' ).show();
				},
				
				/**
				 * Get on/off air status based on the API and update locally
				 */
				getLiveStreamStatusFromAPI: function( callback ) {
					var _this = this;
					var embedPlayer = this.embedPlayer;
					
					_this.getKalturaClient().doRequest( {
						'service' : 'liveStream',
						'action' : 'islive',
						'id' : embedPlayer.kentryid,
						'protocol' : 'hls',
						'timestamp' : Date.now()
					}, function( data ) {
						_this.onAirStatus = false;
						if ( data === true ) {
							_this.onAirStatus = true;
						}
						if ( callback ) {
							callback( _this.onAirStatus );
						}
						_this.log( "Trigger liveStreamStatusUpdate : " + _this.onAirStatus );
						embedPlayer.triggerHelper( 'liveStreamStatusUpdate', { 'onAirStatus' : _this.onAirStatus } );
					} );
				},
				
				getLiveStreamStatusText: function() {
					if ( this.onAirStatus ) {
						return 'On Air';
					}
					return 'Off Air';
				},
				
				setLiveStreamStatus: function( value ) {
					this.log( "setLiveStreamStatus : " + value );
					var embedPlayer = this.embedPlayer;
					
					var $liveStatus = embedPlayer.getInterface().find( '.live-stream-status' );
					$liveStatus.html( value );
					if ( this.onAirStatus ) {
						$liveStatus.removeClass( 'live-off-air' ).addClass( 'live-on-air' );
					}
					else {
						$liveStatus.removeClass( 'live-on-air' ).addClass( 'live-off-air' );
					}
				},
								
				/**
				 * Updates the scrubber to the requested percentage
				 */
				updateScrubber: function( perc ) {
					//this.log( "updateScrubber : " + perc );
					var $playHead = this.embedPlayer.getInterface().find( '.play_head_dvr' );
					
					if ( $playHead.length ) {
						$playHead.slider( 'value', perc * 1000 );
					}
				},
				
				/**
				 * Returns current scrubber position (Value 0-1000)
				 */
				getCurrentScrubberPosition: function() {
					var $playHead = this.embedPlayer.getInterface().find( '.play_head_dvr' );
					
					if ( $playHead.length ) {
						var val = $playHead.slider( "value" );
						this.log( "getCurrentScrubberPosition : " + val );
						return val;
					}
					return null;
				},
				
				
				/**
				 * Disable DVR scrubber
				 */
				disableScrubber: function() {
					this.log( "disableScrubber" );
					var embedPlayer = this.embedPlayer;
					if ( this.isDVR() ) {
						var $playHead = embedPlayer.getInterface().find( ".play_head_dvr" );
						if( $playHead.length ){
							$playHead.slider( "option", "disabled", true );
						}
					}
				},
				
				/**
				 * Enable DVR scrubber
				 */				
				enableScrubber: function() {
					this.log( "enableScrubber" );
					var embedPlayer = this.embedPlayer;
					if ( this.isDVR() ) {
						var $playHead = embedPlayer.getInterface().find( ".play_head_dvr" );
						if( $playHead.length ){
							$playHead.slider( "option", "disabled", false);
						}
					}
				},
				
				/**
				 * Hide DVR scrubber off control bar
				 */
				hideScrubber: function() {
					var embedPlayer = this.embedPlayer;
					if ( this.isDVR() ) {
						var $playHead = embedPlayer.getInterface().find( ".play_head_dvr" );
						if( $playHead.length ){
							$playHead.hide();
						}
					}					
				},

				/**
				 * Show DVR scrubber off control bar
				 */
				showScrubber: function() {
					var embedPlayer = this.embedPlayer;
					if ( this.isDVR() ) {
						var $playHead = embedPlayer.getInterface().find( ".play_head_dvr" );
						if( $playHead.length ){
							$playHead.show();
						}
					}					
				},
				
				/**
				 * While the stream is off air we disable the play controls and the scrubber
				 */
				disableLiveControls: function() {
					// Only disable enabled controls
					if ( typeof this.liveControls == 'undefined' || this.liveControls === true ) {
						var embedPlayer = this.embedPlayer;
						embedPlayer.hideLargePlayBtn();
						embedPlayer.disablePlayControls();
						embedPlayer.controlBuilder.removePlayerClickBindings();
						embedPlayer.getInterface().find( '.play-btn' )
							.unbind('click')
							.click( function( ) {
								if( embedPlayer._playContorls ){
									embedPlayer.play();
								}
							} );
						this.disableScrubber();
						this.liveControls = false;
					}
				},
				
				enableLiveControls: function( hidePlayBtn ) {
					// Only enable disabled controls
					if ( this.liveControls === false ) {
						var embedPlayer = this.embedPlayer;
						embedPlayer.hideSpinner();
						if ( !hidePlayBtn ) {
							embedPlayer.addLargePlayBtn();
						}
						embedPlayer.enablePlayControls();
						embedPlayer.controlBuilder.addPlayerClickBindings();
						if ( this.minDVRReached ) {
							this.enableScrubber();
						}
						this.liveControls = true;
					}
				},
				
				toggleLiveControls: function( onAirStatus ) {
					if ( onAirStatus ) {
						this.enableLiveControls();
						return ;
					}
					this.disableLiveControls();
				},
				
				getCurrentTime: function() {
					return this.embedPlayer.getPlayerElement().currentTime;
				},
				
				setCurrentTime: function( sec ) {
					try {
						this.embedPlayer.getPlayerElement().currentTime = sec;
					} catch ( e ) {
						this.log("Error : Could not set video currentTime");
					}
				},				

				/**
				 * Extend JS API to match the KDP
				 */
				extendApi: function() {
					var _this = this;
					var embedPlayer = this.embedPlayer;
					
					embedPlayer.isOffline = function() {
						return !_this.onAirStatus;
					}
				},

				getKalturaClient: function() {
					if( ! this.kClient ) {
						this.kClient = mw.kApiGetPartnerClient( this.embedPlayer.kwidgetid );
					}
					return this.kClient;
				},
				
				log: function( msg ) {
					mw.log( "LiveStream :: " + msg);
				}
			}
			
			liveStreamPlugin.init( embedPlayer );
		}

		callback();
	});

} )( window.mw, window.jQuery );
