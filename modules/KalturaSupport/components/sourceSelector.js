( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'sourceSelector', mw.KBaseComponent.extend({

		defaultConfig: {
			"parent": "controlsContainer",
			"order": 61,
			"displayImportance": 'low',
			"align": "right",
			"showTooltip": true,
			"switchOnResize": false,
			"simpleFormat": true,
			"iconClass": "icon-cog",
            "displayMode": "size", //'size' – displays frame size ( default ), 'bitrate' – displays the bitrate, 'sizebitrate' displays size followed by bitrate
            "hideSource": false,
			"title": gM( 'mwe-embedplayer-select_source' ),
			'smartContainer': 'qualitySettings',
			'smartContainerCloseEvent': 'newSourceSelected'
		},

		isDisabled: false,
		inUpdateLayout:false,
		selectSourceTitle: gM( 'mwe-embedplayer-select_source' ),
		switchSourceTitle: gM( 'mwe-embedplayer-switch_source' ),
        AutoTitle: gM( 'mwe-embedplayer-auto_source' ),
		saveBackgroundColor: null, // used to save background color upon disable and rotate and return it when enabled again to prevent rotating box around the icon when custom style is applied

        sourcesList: [],

		setup: function(){
			var _this = this;

			this.bind( 'playerReady sourcesReplaced', function(){
				_this.buildMenu();
			});

			this.bind( 'SourceChange', function(){
				var selectedSrc = _this.getPlayer().mediaElement.selectedSource;
				var selectedId = selectedSrc.getAssetId();

				//if selected source is not part of the menu, show the source before it as the selected one
				//workaround when auto switch with kplayer occurred and the selected source is not part of the menu data provider
				if ( selectedSrc.skip ) {
					var sources = _this.getSources();
					for ( var i = 0; i< sources.length; i++ ) {
						//look for the closest flavor
						if ( selectedSrc.getSrc() == sources[i].getSrc() ) {
							if ( i == 0 && sources.length > 1 ) {
								selectedId = sources[i+1].getAssetId();
							} else {
								selectedId = sources[i-1].getAssetId();
							}
							break;
						}
					}
				}
				_this.getMenu().setActive({'key': 'id', 'val': selectedId});
			});

			this.bind( 'sourceSwitchingStarted', function(){
				_this.getComponent().find('button').addClass( 'in-progress-state' );
				_this.onDisable();
			});
			this.bind( 'sourceSwitchingEnd', function(newIndex){
				_this.getComponent().find('button').removeClass( 'in-progress-state' );
                _this.onEnable();
			});
            this.bind( 'onHideControlBar', function(){
                if ( _this.getMenu().isOpen() )
                    _this.getMenu().close();
            });
			this.bind( 'onChangeMedia', function(){
				_this.sourcesList = [];
			});

			this.bind( 'onDisableInterfaceComponents', function(e, arg ){
				_this.getMenu().close();
			});

			// Check for switch on resize option
			if( this.getConfig( 'switchOnResize' ) && !_this.embedPlayer.isLive() ){
				this.bind( 'resizeEvent', function(){
					// workaround to avoid the amount of 'updateLayout' events
					// !seeking will avoid getting current time equal to 0
					if ( !_this.inUpdateLayout && !_this.embedPlayer.seeking ){
						_this.inUpdateLayout = true;
						_this.updateLayoutTimout = setTimeout(function() {
							_this.inUpdateLayout = false;
						},1000);
						//if we're working with kplayer - mp4 can't be seeked - so disable this feature
						//this only effect native for now
						if (_this.embedPlayer.instanceOf === "Native" && !_this.embedPlayer.isInSequence() ) {
							// TODO add additional logic for "auto" where multiple bitrates
							// exist at the same resolution.
							var selectedSource = _this.embedPlayer.mediaElement.autoSelectSource(_this.embedPlayer.supportsURLTimeEncoding(), _this.embedPlayer.startTime, _this.embedPlayer.pauseTime);
							if ( selectedSource ) { // source was found
								_this.embedPlayer.switchSrc( selectedSource );
							}
						} else {
							mw.log( "sourceSelector - switchOnResize is ignored - Can't switch source since not using native player or during ad playback");
						}
					}
				});
			}

			this.embedPlayer.bindHelper("propertyChangedEvent", function(event, data){
				if ( data.plugin === _this.pluginName ){
					if ( data.property === "sources" ){
						_this.getMenu().$el.find("li a")[data.value].click();
					}
				}
			});
		},
		getSources: function(){
			return this.getPlayer().getSources();
		},

		buildMenu: function(){
			var _this = this;

			// Destroy old menu
			this.getMenu().destroy();
			this.sourcesList = [];

			var sources = this.getSources().slice(0);

			if( ! sources.length ){
				_this.log("Error with getting sources");
				return ;
			}

            //add Auto for addaptive bitrate streams
            if ( !this.handleAdaptiveBitrateAndContinue() )
                return;

            if (this.getConfig('hideSource')) {
                this.getPlayer().mediaElement.removeSourceFlavor(sources);
            }

			if( sources.length == 1 ){
				// no need to do building menu logic. 
				this.addSourceToMenu( sources[0], _this.getSourceTitle(sources[0]) );
				return ;
			}
			// sort by height then bitrate:
			sources.sort(function(a,b){
				var hdiff = b.getHeight() - a.getHeight();
				if( hdiff != 0 ){
					return hdiff;
				}
				return b.getBitrate() - a.getBitrate();
			});

			// if simple format don't include more then two sources per size in menu
			if( _this.getConfig( 'simpleFormat' ) ){
				var prevSource = null;
				var twice = false;
				$.each( sources, function( sourceIndex, source ) {
					if( ! prevSource ){
						prevSource = source;
						return true;
					}
					if( source.getHeight() != 0
						&&
						( _this.getSourceSizeName( prevSource )
							==
							_this.getSourceSizeName( source ) )
						){
						//if the selected source has the same height, skip this source
						var selectedSrc = _this.getPlayer().mediaElement.selectedSource;
						if ( selectedSrc
							&&
							!_this.isSourceSelected( source )
							&&
							!_this.isSourceSelected( prevSource )
							&&
							( _this.getSourceSizeName( source )
								==
								_this.getSourceSizeName( selectedSrc ) )
							){
							source.skip = true;
						}
						else if( twice ){
							// don't skip if this is the default source:
							if( !_this.isSourceSelected( source ) ){
								// skip this source
								source.skip = true;
							} else {
								source.skip = false;
							}
							prevSource = source;
							return true;
						}
						// set the first source as "HQ"
						prevSource.hq = true;
						twice = true;
					} else {
						twice = false;
					}
					// always update prevSource
					prevSource = source;
				});
			}
			var items = [];
			var itemLabels = [];
			var prevSource = null;
			$.each( sources, function( sourceIndex, source ) {
				if( source.skip ){
					return true;
				}
				// Output the player select code:
				var supportingPlayers = mw.EmbedTypes.getMediaPlayers().getMIMETypePlayers( source.getMIMEType() );
				for ( var i = 0; i < supportingPlayers.length ; i++ ) {
					if(
						(
							_this.getPlayer().selectedPlayer === undefined
								&&
								supportingPlayers[i].library == 'Native'
							)
							||
							(
								_this.getPlayer().selectedPlayer !== undefined
									&&
									supportingPlayers[i].library == _this.getPlayer().selectedPlayer.library
								)
						){
						_this.addSourceToMenu( source );
						var label = _this.getSourceTitle( source )
						if ($.inArray(label, itemLabels) === -1){
							itemLabels.push(label)
							items.push({'label':label, 'value':label});
						}
						if (_this.embedPlayer.isMobileSkin() && _this.isSourceSelected(source)){
							_this.getMenu().setActive(sourceIndex);
						}
					}
				}
			});
			// dispatch event to be used by a master plugin if defined
			this.getPlayer().triggerHelper("updatePropertyEvent",{"plugin": this.pluginName, "property": "sources", "items": items, "selectedItem": this.getMenu().$el.find('.active a').text()});

		},
		isSourceSelected: function( source ){
			var _this = this;
			return ( _this.getPlayer().mediaElement.selectedSource && source.getSrc()
				==
				_this.getPlayer().mediaElement.selectedSource.getSrc()
				);
		},
        handleAdaptiveBitrateAndContinue: function (){
			//Silverlight smoothStream
			if( ( this.getPlayer().streamerType === "smoothStream" ) ){
				this.addAutoToMenu();
				return true;
			}

	        //Dash
	        if( ( this.getPlayer().streamerType === "dash" ) ){
		        this.addAutoToMenu();
		        return true;
	        }

	        //HLS, HDS
            if (mw.isNativeApp()) {
            	this.sourcesList = [];
                this.addAutoToMenu();
                return true;
            }

            if ( this.getPlayer().streamerType != "http" && !this.getPlayer().isPlaying() && !this.getPlayer().isInSequence() ){
				if(this.getPlayer().streamerType !== "hls" && !mw.EmbedTypes.getMediaPlayers().isSupportedPlayer('kplayer')){ //If flash disabled, player fallback to http progressive, but the streamerType might still be hdnetwork
                    return true;
                }
                this.addAutoToMenu();
	            if ( this.getPlayer().streamerType == "hls" ) {
		            return true;
	            }
	            return false;
            }

			if ( this.getPlayer().streamerType == "http" ){
				this.addAutoToMenu();
				return false;
			}

			if( this.getPlayer().streamerType != "http" ){ //add and select Auto for adaptive bitrate
                this.addAutoToMenu();
            }
            return true;
        },
        addAutoToMenu: function (){
            var _this = this;
            this.getMenu().addItem({
                'label': _this.AutoTitle,
                'callback': function () {
                    _this.getPlayer().switchSrc(-1);
                },
               'active': true
            });
        },
		addSourceToMenu: function( source ){
			var _this = this;

            var sourceLabel = this.getSourceTitle( source );
            if( $.inArray(sourceLabel, this.sourcesList) == -1 ) {

                this.sourcesList.push(sourceLabel);

                this.getMenu().addItem({
                    'label': sourceLabel,
                    'attributes': {
                        'id': source.getAssetId()
                    },
                    'callback': function () {
	                    _this.getPlayer().triggerHelper("newSourceSelected", source.getAssetId());
                        _this.getPlayer().switchSrc(source);
                    },
                    'active': _this.isSourceSelected(source)
                });
            }
		},
        getSourceSizeName: function( source ){
			if( source.getHeight() == 0 ){
				return gM( 'mwe-embedplayer-audio_source' ) + ( this.getConfig( 'displayMode' ) == 'sizebitrate' ? "" : this.getSourceTitleBitrate(source) );
			} else if( source.getHeight() < 255 ){
				return '240P';
			} else if( source.getHeight() < 370 ){
				return '360P';
			} else if( source.getHeight() < 500 ){
				return '480P';
			} else if( source.getHeight() < 800 ){
				return '720P';
			} else {
				return '1080P';
			}
		},
		getSourceTitle: function( source ){
			// We should return "Auto" for Apple HLS
			if( source.getMIMEType() == 'application/vnd.apple.mpegurl' ) {
				return this.AutoTitle;
			}

            var title = '';
            switch( this.getConfig( 'displayMode' ) ){
                case 'size' :
                    title = this.getSourceTitleSize(source);
                    break;
                case 'bitrate' :
                    title = this.getSourceTitleBitrate(source);
                    break;
                case 'sizebitrate' :
                    title = this.getSourceTitleSizeBitrate(source);
                    break;
            }
            return title;
		},
        getSourceTitleSize: function( source ){
            var title = '';
            if( source.getHeight() ){
                title = this.getSourceSizeName( source );
                if( this.getConfig( 'displayMode' ) === 'size' && this.getConfig( 'simpleFormat' ) && source.hq ){
                    title += ' HQ';
                }
            } else { //fallback for a case we don't have a frame size (height) for the source (for example HLS source)
                title = this.getSourceTitleBitrate(source);
            }
            return title;
        },
        getSourceTitleBitrate: function( source ){
            var title = '';
            if ( source.getBitrate() ) {
                var bits = ( Math.round( source.getBitrate() / 1024 * 10 ) / 10 ) + '';
                if( bits[0] == '0' ){
                    bits = bits.substring(1);
                }
                title+= ' ' + bits + ' Mbs ';
            }
            return title;
        },
        getSourceTitleSizeBitrate: function( source ){
            var title = '';
            if ( source.getHeight() ){
                title = this.getSourceSizeName( source ) + ' ';
            }
			title += this.getSourceTitleBitrate(source);
            return title;
        },
		toggleMenu: function(){
			if ( this.isDisabled ) {
				return;
			}
			this.getMenu().toggle();
		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				var $menu = $( '<ul />' );
				var $button = $( '<button />' )
					.addClass( 'btn icon-cog' )
					.attr('title', _this.selectSourceTitle)
					.click( function(e){
						_this.toggleMenu();
					});
				this.setAccessibility($button,_this.selectSourceTitle);
				this.$el = $( '<div />' )
					.addClass( 'dropup' + this.getCssClass() )
					.append( $button, $menu );
			}
			return this.$el;
		},
		getMenu: function(){
			if( !this.menu ) {
				this.menu = new mw.KMenu(this.getComponent().find('ul'), {
					tabIndex: this.getBtn().attr('tabindex')
				});
			}
			return this.menu;
		},
		getBtn: function(){
			return this.getComponent().find( 'button' );
		},
		onEnable: function(){
			this.isDisabled = false;
			this.updateTooltip( this.selectSourceTitle );
			this.getBtn().removeClass( 'disabled' );
			if (this.saveBackgroundColor){
				this.getComponent().find('button').attr('style', 'background-color: ' + this.saveBackgroundColor + ' !important');
			}
		},
		onDisable: function(){
			this.isDisabled = true;
			this.updateTooltip( this.switchSourceTitle );
			this.saveBackgroundColor = this.getComponent().find('button').css("background-color");
			this.getComponent().find('button').attr('style', 'background-color: null !important');
			this.getComponent().removeClass( 'open' );
			this.getBtn().addClass( 'disabled' );
		}
	}));

} )( window.mw, window.jQuery );		
