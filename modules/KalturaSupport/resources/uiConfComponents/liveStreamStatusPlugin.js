( function( mw, $ ) {"use strict";
	mw.addKalturaConfCheck( function( embedPlayer, callback ) {
		if ( embedPlayer.isLive() ) {
			var liveStreamStatusPlugin = {

				bindPostFix : '.liveStatus',

				firstPlay : false,
				
				/**
				 * API requests interval for updating live stream status (seconds).
				 * Default is 30 seconds, to match server's cache expiration
				 */
				liveStreamStatusInterval : 30,

				init: function( embedPlayer ) {
					this.embedPlayer = embedPlayer;
					
					this.addPlayerBindings();
					// Update status at init
					this.updateLiveStreamStatus();
					this.addLiveStreamStatus();
					this.extendApi();
				},

				addPlayerBindings: function() {
					var _this = this;
					var embedPlayer = this.embedPlayer;

					embedPlayer.unbindHelper( _this.bindPostFix );
					
					embedPlayer.bindHelper( 'playerReady' + this.bindPostFix, function() {
						embedPlayer.addPlayerSpinner();
						_this.disableLiveControls();
						if ( _this.onAirStatus ) {
							_this.enableLiveControls();
						}
						_this.addLiveStreamStatusMonitor();
					} );
									
					embedPlayer.bindHelper( 'onplay' + this.bindPostFix, function() {
						_this.hideLiveStreamStatus();
						_this.removeLiveStreamStatusMonitor();
					} );
					
					embedPlayer.bindHelper( 'onpause' + this.bindPostFix, function() {
						_this.updateLiveStreamStatus();
						if ( !_this.onAirStatus ) {
							_this.showLiveStreamStatus();
						}
						_this.addLiveStreamStatusMonitor();
					} );
					
					embedPlayer.bindHelper( 'liveStreamStatusChanged' + this.bindPostFix, function() {
						embedPlayer.hideSpinner();
						if ( _this.firstPlay ) {
							if ( !_this.onAirStatus ) {
								_this.showLiveStreamStatus();
							}
							else {
								_this.hideLiveStreamStatus();
							}
						}
						_this.setLiveStreamStatus( _this.getLiveStreamStatusText() );
					} );
					
					embedPlayer.bindHelper( 'firstPlay' + this.bindPostFix, function() {
						_this.firstPlay = true;
						// Scrubber is disabled prior to first play
						_this.enableScrubber();
					} );

				},
				
				addLiveStreamStatusMonitor: function() {
					var _this = this;
					
					this.liveStreamStatusMonitor = setInterval( function() { _this.updateLiveStreamStatus() }, this.liveStreamStatusInterval * 1000);	
				},
				
				removeLiveStreamStatusMonitor: function() {
					if ( this.liveStreamStatusMonitor ) {
						clearInterval( this.liveStreamStatusMonitor );
					}
				},
				
				/**
				 * Add on/off air status to the control bar
				 */
				addLiveStreamStatus: function() {
					var _this = this;
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
						_this.updateLiveStreamStatus();
					} );
				},
				
				/**
				 * Hide on/off air status from the control bar
				 */
				hideLiveStreamStatus: function() {
					this.embedPlayer.getInterface().find( '.live-stream-status' ).hide();
				},
				
				/**
				 * Restore hidden on/off air status
				 */
				showLiveStreamStatus: function() {
					this.embedPlayer.getInterface().find( '.live-stream-status' ).show();
				},
				
				/**
				 * Get on/off air status based on the API and update locally
				 */
				updateLiveStreamStatus: function() {
					var _this = this;
					var embedPlayer = this.embedPlayer;
					_this.getKalturaClient().doRequest( {
						'service' : 'liveStream',
						'action' : 'islive',
						'id' : embedPlayer.kentryid,
						'protocol' : 'hls',
						'timestamp' : new Date().getTime()
					}, function( data ) {
						_this.onAirStatus = false;
						if ( data === true ) {
							_this.onAirStatus = true;
							_this.enableLiveControls();
						}
						else {
							// Only disable controls if not in dvr content
							if ( embedPlayer.getInterface().find( '.time-disp-dvr-live' ).length ) {
								_this.disableLiveControls();
							}
						}
						embedPlayer.triggerHelper( 'liveStreamStatusChanged', _this.onAirStatus );
					} );	
				},
				
				getLiveStreamStatusText: function() {
					if ( this.onAirStatus ) {
						return 'On Air';
					}
					return 'Off Air';
				},
				
				setLiveStreamStatus: function( value ) {
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
				 * Disable DVR Scrubber
				 */
				disableScrubber: function() {
					var embedPlayer = this.embedPlayer;
					if ( embedPlayer.isDVR() ) {
						var $playHead = embedPlayer.getInterface().find( ".play_head_dvr" );
						if( $playHead.length ){
							$playHead.slider( "option", "disabled", true );
						}
					}
				},
				
				/**
				 * Enable DVR Scrubber
				 */				
				enableScrubber: function() {
					var embedPlayer = this.embedPlayer;
					if ( embedPlayer.isDVR() ) {
						var $playHead = embedPlayer.getInterface().find( ".play_head_dvr" );
						if( $playHead.length ){
							$playHead.slider( "option", "disabled", false);
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
						embedPlayer.controlBuilder.removePlayerTouchBindings();
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
				
				enableLiveControls: function() {
					// Only enable disabled controls
					if ( this.liveControls === false ) {
						var embedPlayer = this.embedPlayer;
						embedPlayer.addLargePlayBtn();
						embedPlayer.enablePlayControls();
						embedPlayer.controlBuilder.addPlayerTouchBindings();
						embedPlayer.controlBuilder.addPlayerClickBindings();
						if ( this.firstPlay ) {
							this.enableScrubber();
						}
						this.liveControls = true;
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
				}
			}
			
			liveStreamStatusPlugin.init( embedPlayer );
		}

		callback();
	});

} )( window.mw, window.jQuery );