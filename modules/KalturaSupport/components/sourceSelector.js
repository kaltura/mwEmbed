( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'sourceSelector', mw.KBaseComponent.extend({

		defaultConfig: {
			"parent": "controlsContainer",
			"order": 61,
			"displayImportance": 'low',
			"align": "right",
			"showTooltip": true,
			"switchOnResize": false,
			"simpleFormat": true
		},

		isDisabled: false,

		setup: function(){
			var _this = this;

			this.bind( 'playerReady sourcesReplaced', function(){
				_this.buildMenu();
			});

			this.bind( 'SourceChange', function(){
				var selectedSrcId = _this.getPlayer().mediaElement.selectedSource.getAssetId();
				_this.getMenu().setActive({'key': 'id', 'val': selectedSrcId});
				_this.onEnable();
			});	

			this.bind( 'sourceSwitchingStarted', function(){
				_this.onDisable();
			});
			
			// Check for switch on resize option
			if( this.getConfig( 'switchOnResize' ) ){
				this.bind( 'updateLayout', function(){
					// TODO add additional logic for "auto" where multiple bitrates 
					// exist at the same resolution. 
					var selectedSource = _this.embedPlayer.mediaElement.autoSelectSource();
					_this.embedPlayer.switchSrc( selectedSource );
				});
			}
		},
		getSources: function(){
			return this.getPlayer().mediaElement.getPlayableSources();
		},

		buildMenu: function(){	
			var _this = this;

			// Destroy old menu
			this.getMenu().destroy();

			var sources = this.getSources();
			
			if( ! sources.length ){
				_this.log("Error with getting sources");
				return ;
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
					if( _this.getSourceSizeName( prevSource ) 
							== 
						_this.getSourceSizeName( source ) 
					){
						if( twice ){
							// don't skip if this is the default source:
							if( !_this.isSourceSelected( source ) ){
								// skip this source
								source.skip = true
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
					}
				}
			});
		},
		isSourceSelected: function( source ){
			var _this = this;
			return ( _this.getPlayer().mediaElement.selectedSource && source.getSrc() 
					== 
					_this.getPlayer().mediaElement.selectedSource.getSrc() 
				);
		},
		addSourceToMenu: function( source ){
			var _this = this;;
			this.getMenu().addItem({
				'label': this.getSourceTitle( source ),
				'attributes': {
					'id': source.getAssetId()
				},
				'callback': function(){
					_this.getPlayer().switchSrc( source );
				},
				'active': _this.isSourceSelected( source )
			});
		},
		getSourceSizeName: function( source ){
			if( source.getHeight() < 255 ){
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
			if( this.getMIMEType() == 'application/vnd.apple.mpegurl' ) {
				return 'Auto';
			}
			var title = '';			
			if( source.getHeight() ){
				title+= this.getSourceSizeName( source );
			} else if ( source.getBitrate() ) {
					var bits = ( Math.round( source.getBitrate() / 1024 * 10 ) / 10 ) + '';
					if( bits[0] == '0' ){
						bits = bits.substring(1);
					}
					title+= ' ' + bits + 'Mbs ';
			}
			if( this.getConfig( 'simpleFormat' ) ){
				if( source.hq ){
					title += ' HQ';
				}
			} else {
				// include type if not simple format
				title += ' ' + source.getMIMEType().replace('video/', '');
			}
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
								.attr('title', 'Quality Settings')
								.click( function(e){
									_this.toggleMenu();
								});

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
			this.getBtn().removeClass( 'disabled' );
		},
		onDisable: function(){
			this.isDisabled = true;
			this.getComponent().removeClass( 'open' );
			this.getBtn().addClass( 'disabled' );
		},
	}));

} )( window.mw, window.jQuery );		