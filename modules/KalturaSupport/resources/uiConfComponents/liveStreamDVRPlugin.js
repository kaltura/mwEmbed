( function( mw, $ ) {"use strict";
	mw.addKalturaConfCheck( function( embedPlayer, callback ) {
		// Check for configuration override
		if ( embedPlayer.isLive() && embedPlayer.isDVR() && mw.getConfig( 'liveDVREnabled') ) {
			var liveStreamDVRPlugin = {

				bindPostFix : '.liveDVR',
				
				startTime : null,
				
				startClockTime : null,
				
				monitorRate : mw.getConfig( 'EmbedPlayer.MonitorRate' ),
				
				firstPlay : false,
				
				secondsDisplayed : 0,
				
				// Default DVR Window (Seconds)
				defaultDVRWindow : 30 * 60,
				
				init: function( embedPlayer ) {
					this.embedPlayer = embedPlayer;
					this.dvrWindow = embedPlayer.evaluate( '{mediaProxy.entry.dvrWindow}' );
					if ( !this.dvrWindow ) {
						this.dvrWindow = this.defaultDVRWindow;
					}

					this.addPlayerBindings();
					this.addScrubber();
					this.addTimeDisplay();
				},

				addPlayerBindings: function() {
					var _this = this;
					var embedPlayer = this.embedPlayer;

					embedPlayer.unbindHelper( this.bindPostFix );
					
					embedPlayer.bindHelper( 'firstPlay' + this.bindPostFix, function() {
						var vid = embedPlayer.getPlayerElement();
						_this.firstPlay = true;
						_this.startTime = vid.currentTime;
						_this.startClockTime = new Date().getTime();
						_this.setLiveStatus();
					} );
					
					embedPlayer.bindHelper( 'onpause' + this.bindPostFix, function() {
						_this.showBackToLive();
						if ( _this.isLive() ) {
							_this.hideTimeDisplay();
						}
						_this.addMonitor();
					} );
					
					embedPlayer.bindHelper( 'onplay' + this.bindPostFix, function() {
						_this.removeMonitor();
						_this.showTimeDisplay();
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
										
										var totalTime = ( _this.getCurrentTime() < _this.dvrWindow ) ? _this.getCurrentTime() : _this.dvrWindow;
										// always update the title 
										if ( perc > .98 ) { 
											// Sliding to the rightmost side: Go back to live broadcast with matching indication
											embedPlayer.getInterface().find( '.play_head_dvr .ui-slider-handle' ).attr( 'data-title', 'Live' );
											_this.setLiveStatus();
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
										
										var totalTime = ( _this.getCurrentTime() < _this.dvrWindow ) ? _this.getCurrentTime() : _this.dvrWindow;
										var jumpToTime = ( 1 - perc ) * totalTime;
										// always update the title 
										if ( perc > .98 ) {
											ui.value = 1000;
											embedPlayer.getInterface().find( '.play_head_dvr .ui-slider-handle' ).attr( 'data-title', 'Live' );
											_this.setLiveStatus();
											_this.hideBackToLive();
										}
										else {
											embedPlayer.getInterface().find( '.play_head_dvr .ui-slider-handle' ).attr( 'data-title', mw.seconds2npt( jumpToTime ) );
											_this.showBackToLive();
										}
										// Only run the onChange event if done by a user slide
										// (otherwise it runs times it should not)
										if ( _this.userSlide ) {
											_this.userSlide = false;
											if ( perc > .98 ) {
												_this.secondsDisplayed = 0;
												_this.backToLive();
												return ;
											}
											_this.secondsDisplayed = jumpToTime;
											_this.setCurrentTime( jumpToTime );
										}
									}
								};
								
								// Right offset for the scrubber = 
								// ( Total width - non used space - Pause button width ) + ( Time display width + Live Stream Status Width )
								var rightOffset = ( embedPlayer.getPlayerWidth() - ctrlObj.availableWidth - ctrlObj.components.pause.w ) + 
									( ctrlObj.components.timeDisplay.w + ctrlObj.components.liveStreamStatus.w ) - 3;
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
				 * Updates the scrubber to the requested percentage
				 */
				updateScrubber: function( perc ) {
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
						return ( $playHead.slider( "value" ) );
					}
					return null;
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
				
				setTimeDisplay: function( value ) {
					if( this.embedPlayer.getInterface() ) {
						this.embedPlayer.getInterface().find( '.time-disp-dvr' ).removeClass( 'time-disp-dvr-live' ).html( value );
					}
				},
				
				hideTimeDisplay: function() {
					this.embedPlayer.getInterface().find( '.time-disp-dvr' ).hide();
				},
				
				showTimeDisplay: function() {
					this.embedPlayer.getInterface().find( '.time-disp-dvr' ).show();
				},
				
				/**
				 * Set Live indication
				 */
				setLiveStatus: function() {
					if( this.embedPlayer.getInterface() && !embedPlayer.isOffline ) {
						this.embedPlayer.getInterface().find( '.time-disp-dvr' ).addClass( 'time-disp-dvr-live' ).html( 'Live' );
					}
				},
				
				isLive: function() {
					return this.embedPlayer.getInterface().find( '.time-disp-dvr-live' ).length;
				},
				
				getCurrentTime: function() {
					return this.embedPlayer.getPlayerElement().currentTime;
				},
				
				setCurrentTime: function( sec ) {
					try {
						this.embedPlayer.getPlayerElement().currentTime = sec;
					} catch ( e ) {
						mw.log("Error:: liveStreamDVRPlugin: Could not set video tag currentTime");
					}
				},
				
				addBackToLiveButton: function() {
					var _this = this;
					var embedPlayer = this.embedPlayer;
					
					var $timeDisp = embedPlayer.getInterface().find( '.time-disp-dvr' );
					var $backToLive = 
						$( '<div />' )
							.addClass( 'back-to-live-icon' )
							.after( $( '<div />')
										.addClass( 'back-to-live-text' )
										.text( 'Live' ) 
							);
					var $backToLiveButton = 
						$( '<div />')
							.addClass( 'ui-widget back-to-live' )
							.html( $backToLive )
							.click( function() {
								_this.backToLive();
								_this.hideBackToLive();
							} );
					$timeDisp.before( $backToLiveButton );
				},
				
				showBackToLive: function() {
					var _this = this;
					var embedPlayer = this.embedPlayer;
					
					this.addBackToLiveMonitor();
					if ( embedPlayer.isOffline() ) {
						return ;
					}
					if ( !embedPlayer.getInterface().find( '.back-to-live' ).length ) {
						_this.addBackToLiveButton();
						return ;
					}
					embedPlayer.getInterface().find( '.back-to-live' ).show();
				},
				
				hideBackToLive: function() {
					var embedPlayer = this.embedPlayer;
					
					if ( embedPlayer.getInterface().find( '.back-to-live' ).length ) {
						embedPlayer.getInterface().find( '.back-to-live' ).hide();
					}
				},
				
				backToLive: function() {
					this.removeBackToLiveMonitor();
					this.embedPlayer.getPlayerElement().load();
					this.updateScrubber( 1 );
					this.embedPlayer.getPlayerElement().play();
				},
				
				addBackToLiveMonitor: function() {
					var _this = this;
					var embedPlayer = this.embedPlayer;
					
					this.backToLivemonitor = setInterval( function() {
						if ( embedPlayer.isOffline() ) {
							_this.hideBackToLive();
							return ;
						}
						_this.showBackToLive();
					}, this.monitorRate );
				},
				
				removeBackToLiveMonitor: function() {
					if ( this.backToLivemonitor ) {
						clearInterval( this.backToLivemonitor );
					}
				},
				
				addMonitor: function() {
					var _this = this;
					var embedPlayer = this.embedPlayer;
					var vid = embedPlayer.getPlayerElement();
					var pauseTime = vid.currentTime;
					var pauseClockTime = new Date().getTime();
					var totalTime = ( pauseTime < _this.dvrWindow ) ? pauseTime : _this.dvrWindow;
					
					this.monitor = setInterval( function() {
						var timePassed = ( new Date().getTime() - pauseClockTime ) / 1000;
						var perc = timePassed + _this.secondsDisplayed / totalTime;
						if ( perc > 1 ) {
							perc = 1;
						}
						_this.updateScrubber( 1 - perc );
						_this.showTimeDisplay();
						var secondsToDisplay = timePassed + _this.secondsDisplayed;
						if ( secondsToDisplay > totalTime ) {
							secondsToDisplay = totalTime;
						}
						_this.setTimeDisplay( '-' + mw.seconds2npt( secondsToDisplay ) );
					}, this.monitorRate );
				},
				
				removeMonitor: function() {
					if ( this.monitor ) {
						clearInterval( this.monitor );
					}
				},
				
				getKalturaClient: function() {
					if( ! this.kClient ) {
						this.kClient = mw.kApiGetPartnerClient( this.embedPlayer.kwidgetid );
					}
					return this.kClient;
				}				
			}
			
			liveStreamDVRPlugin.init( embedPlayer );
		}

		callback();
	});

} )( window.mw, window.jQuery );