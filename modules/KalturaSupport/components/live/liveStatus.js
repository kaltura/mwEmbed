( function( mw, $ ) {"use strict";
	mw.PluginManager.add( 'liveStatus', mw.KBaseComponent.extend({
		onAirStatus: false,

		defaultConfig: {
			'parent': 'controlsContainer',
			'order': 22,
			'displayImportance': 'high',
			'showTooltip': true
		},

		offlineIconClass: 'icon-off-air live-icon offline-icon not-clickable',
		onAirIconClass: 'icon-on-air live-icon online-icon not-clickable',
		unsyncIConClass: 'icon-off-air live-icon live-off-sync-icon',
		noThumbClass: 'not-clickable',

        stringsReady: false,
		liveText: '',
		offlineText: '',
		tooltip: '',

		prevIconClass: undefined,
		bindPostfix: '.LiveStatus',

		setup: function() {
			this.setLiveStatusButtonDefaultState();
            var _this = this;
            this.bind( 'playerReady', function() {
                if(!_this.stringsReady){
                    _this.initStrings();
                    _this.setLiveStreamStatus();
                }
                if( _this.getPlayer().isLive() ) {
                    _this.addBindings();
                }
            });
			this.bind( 'onChangeMedia', function() {
                _this.removeBindings();
				_this.setLiveStatusButtonDefaultState();
			});
			this.bind( 'onChangeMediaDone', function() {
				if( _this.getPlayer().isLive() ) {
					//Reset UI state on change media and liveStatus button
					_this.getBtn().show();
				}
			});
		},
        initStrings: function(){
            this.liveText = gM( 'mwe-embedplayer-player-on-air' );
            this.offlineText = gM( 'mwe-embedplayer-player-off-air' );
            this.tooltip = gM( 'mwe-embedplayer-player-jump-to-live' );
            this.stringsReady = true;
        },
		addBindings: function() {
			var _this = this;
			this.bind( 'liveStreamStatusUpdate' + _this.bindPostfix, function( e, onAirObj ) {
				if ( onAirObj.onAirStatus != _this.onAirStatus ) {
					_this.onAirStatus = onAirObj.onAirStatus;
					_this.setLiveStreamStatus();
				}
			} );
			this.bind( 'movingBackToLive' + _this.bindPostfix, function() {
				if ( _this.onAirStatus ) {
					_this.setLiveUI();
					_this.prevIconClass = _this.onAirIconClass ;
				}
			} );
			this.bind( 'liveOnline' + _this.bindPostfix, function() {
				_this.setLiveStatusButtonDefaultState();
			} );
			this.once('playing' + _this.bindPostfix,function() {
				_this.bind( 'seeked' + _this.bindPostfix + ' seeking' + _this.bindPostfix + ' onpause' + _this.bindPostfix + ' onLiveOffSynchChanged' + _this.bindPostfix , function ( e , param ) {
					if (!_this.getPlayer().goingBackToLive) {
						if ( e.type === 'onLiveOffSynchChanged' && param === false ) {
							// synch with Live edge
							_this.backToLive();
						} else {
							// live is off-synch
							_this.getPlayer().setLiveOffSynch( true );
							if ( _this.onAirStatus ) {
								_this.setOffSyncUI();
							}
							_this.prevIconClass = _this.unsyncIConClass;
						}
					}
				} );
			});
            this.bind( 'onplay' + _this.bindPostfix, function() {
                if ( !_this.getPlayer().isDVR() && !_this.embedPlayer.changeMediaStarted) {
                    // synch with Live edge
                    _this.getPlayer().setLiveOffSynch(false);
                }
            });
		},

        removeBindings: function(){
            this.unbind(  this.bindPostfix );
        },

		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				var $btnText = $( '<div />')
					.addClass( 'back-to-live-text timers ' + this.noThumbClass + this.getCssClass() )
					.text( this.offlineText );


				var $icon  =$( '<div />' )
                    .addClass( 'btn timers '+ this.offlineIconClass + this.getCssClass() )
                    .click( function() {
                        if ( _this.onAirStatus && _this.prevIconClass !== _this.onAirIconClass ) {
                            _this.getPlayer().setLiveOffSynch(false);
                        }else{
                            _this.getPlayer().setLiveOffSynch(true);
                        }
                    });

				this.$el = $( '<div />')
					.addClass( 'back-to-live' + this.getCssClass() )
					.append( $icon, $btnText );
			}
			return this.$el;
		},

		backToLive: function() {
			if ( this.getPlayer().firstPlay )  {
				this.getPlayer().play();
			}  else {
				this.getPlayer().removePoster();
				this.getPlayer().backToLive();
			}
		},

		setLiveStatusButtonDefaultState: function () {
			this.prevIconClass = this.onAirIconClass;
		},

		setOffSyncUI: function() {
			this.getComponent().find('.live-icon').removeClass( this.offlineIconClass + " " + this.onAirIconClass ).addClass( this.unsyncIConClass );
			this.getComponent().find('.back-to-live-text').text( this.liveText );
			this.updateTooltip( this.tooltip );
		},

		setLiveUI: function() {
			this.getComponent().find('.live-icon').removeClass( this.offlineIconClass + " " + this.unsyncIConClass ).addClass( this.onAirIconClass );
			this.getComponent().find('.back-to-live-text').text( this.liveText );
			this.updateTooltip( "" );
		},

		setLiveStreamStatus: function() {
			if ( this.onAirStatus ) {
				if ( this.prevIconClass == this.unsyncIConClass ) {
					this.setOffSyncUI();
				} else {
					this.setLiveUI();
				}
			}
			else {
				this.getComponent().find('.live-icon').removeClass( this.onAirIconClass + " " + this.unsyncIConClass ).addClass( this.offlineIconClass );
				this.getComponent().find('.back-to-live-text').text( this.offlineText );
				this.updateTooltip( "" );
			}
		}
	}))
} )( window.mw, window.jQuery );

