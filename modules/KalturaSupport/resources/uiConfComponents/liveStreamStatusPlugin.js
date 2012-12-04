( function( mw, $ ) {"use strict";
	mw.addKalturaConfCheck( function( embedPlayer, callback ) {
		if ( embedPlayer.isLive() ) {
			var liveStreamStatusPlugin = {

				bindPostFix : '.liveStatus',

				liveStreamStatus : false,
				
				// API requests interval for updating live stream status (seconds).
				// Default is 30 seconds, to match server's cache expiration
				liveStreamStatusInterval : 30,

				init: function( embedPlayer ) {
					this.embedPlayer = embedPlayer;
					// Get status at init
					this.updateLiveStreamStatus();
					this.addPlayerBindings();
					this.addLiveStreamStatusMonitor();
					this.addLiveStreamStatus();
				},

				addPlayerBindings: function() {
					var _this = this;
					var embedPlayer = this.embedPlayer;

					embedPlayer.unbindHelper( _this.bindPostFix );
					
					embedPlayer.bindHelper( 'liveStreamStatusChanged' + this.bindPostFix, function() {
						_this.updateLiveStreamStatusText();
					} );
					
				},
				
				addLiveStreamStatusMonitor: function() {
					var _this = this;
					
					this.liveStreamStatusMonitor = setInterval( function() { _this.updateLiveStreamStatus() }, this.liveStreamStatusInterval * 1000);	
				},
				
				addLiveStreamStatus: function() {
					var _this = this;
					var embedPlayer = this.embedPlayer;
					
					embedPlayer.bindHelper( 'addControlBarComponent', function(event, controlBar ) {
						var $liveStreamStatus = {
							'w': 28,
							'o': function( ctrlObj ) {
								var $textButton = $( '<div />' )
								.attr( 'title', 'Live Streaming Status' )
								.addClass( "ui-state-default ui-corner-all liveStreamStatus rButton" )
								.append( $( '<span />' ).addClass( "liveStreamStatus-text" ).text( _this.getLiveStreamStatusText() ) );
								return $textButton;
							}
						};

						// Add the button to control bar
						controlBar.supportedComponents[ 'liveStreamStatus' ] = true;
						controlBar.components[ 'liveStreamStatus' ] = $liveStreamStatus;
					} );
				},

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

				updateLiveStreamStatusText: function() {
					var _this = this;
					var embedPlayer = this.embedPlayer;
					
					embedPlayer.getInterface().find( '.liveStreamStatus-text' ).text( _this.getLiveStreamStatusText() );
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