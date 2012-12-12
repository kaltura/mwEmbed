( function( mw, $ ) {"use strict";
	mw.addKalturaConfCheck( function( embedPlayer, callback ) {
		if ( embedPlayer.isLive() && embedPlayer.isDVR() ) {
			var liveStreamDVRPlugin = {

				bindPostFix : '.liveDVR',
				
				startTime : null,
				
				startClockTime : null,
				
				monitorRate : mw.getConfig( 'EmbedPlayer.MonitorRate' ),
				
				// Default DVR Window (Seconds)
				defaultDVRWindow : 1800,
				
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

					embedPlayer.unbindHelper( _this.bindPostFix );
					
					embedPlayer.bindHelper( 'firstPlay' + _this.bindPostFix, function() {
						var vid = embedPlayer.getPlayerElement();
						_this.startTime = vid.currentTime;
						_this.startClockTime = new Date().getTime();
						_this.setLive();
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
											_this.setLive();
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
											jumpToTime = _this.getLiveTime();
											embedPlayer.getInterface().find( '.play_head_dvr .ui-slider-handle' ).attr( 'data-title', 'Live' );
										}
										else {
											embedPlayer.getInterface().find( '.play_head_dvr .ui-slider-handle' ).attr( 'data-title', mw.seconds2npt( jumpToTime ) );
										}
										// Only run the onChange event if done by a user slide
										// (otherwise it runs times it should not)
										if ( _this.userSlide ) {
											_this.userSlide = false;
											_this.setCurrentTime( jumpToTime );
										}
									}
								};
								
								// Right offset for the scrubber = ( Total width - non used space - Pause button width ) + ( Time display width + Live Stream Status Width ) - 3px
								var rightOffset = embedPlayer.getPlayerWidth() - ctrlObj.availableWidth - ctrlObj.components.pause.w + ctrlObj.components.timeDisplay.w + ctrlObj.components.liveStreamStatus.w - 3;
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
				
				setTimeDisplay: function( value ) {
					if( this.embedPlayer.getInterface() ) {
						this.embedPlayer.getInterface().find( '.time-disp-dvr' ).removeClass( 'time-disp-dvr-live' ).html( value );
					}
				},
				
				/**
				 * Set Live indication
				 */
				setLive: function() {
					if( this.embedPlayer.getInterface() ) {
						this.embedPlayer.getInterface().find( '.time-disp-dvr' ).addClass( 'time-disp-dvr-live' ).html( 'Live' );
					}
				},
				
				/**
				 * Live time = Video currentTime at first play (startTime) + Time passed since first play
				 */
				getLiveTime: function() {
					return this.startTime + ( ( new Date().getTime() - this.startClockTime ) / 1000 );
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