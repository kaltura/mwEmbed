( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'sourceSelector', mw.KBaseComponent.extend({

		defaultConfig: {
			"parent": "controlsContainer",
         	"order": 61,
         	"align": "right",
         	"showTooltip": true
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
		},
		getSources: function(){
			return this.getPlayer().mediaElement.getPlayableSources();
		},

		buildMenu: function(){	
			var _this = this;

			// Destroy old menu
			this.getMenu().destroy();

			var sources = this.getSources();
			// sort by bitrate if possible:
			if( sources.length && sources[0].getBitrate() ){
				sources.sort(function(a,b){
					return a.getBitrate() - b.getBitrate();
				});
			}

			$.each( sources, function( sourceIndex, source ) {
				var active = ( _this.getPlayer().mediaElement.selectedSource && source.getSrc() == _this.getPlayer().mediaElement.selectedSource.getSrc() ) ? true : false;
				// Output the player select code:
				var supportingPlayers = mw.EmbedTypes.getMediaPlayers().getMIMETypePlayers( source.getMIMEType() );
				for ( var i = 0; i < supportingPlayers.length ; i++ ) {
					if( (_this.getPlayer().selectedPlayer === undefined && supportingPlayers[i].library == 'Native' ) ||
						(_this.getPlayer().selectedPlayer !== undefined && supportingPlayers[i].library == _this.getPlayer().selectedPlayer.library )){

						_this.getMenu().addItem({
							'label': _this.getSourceTitle(source),
							'attributes': { 
								'id': source.getAssetId()
							},
							'callback': function(){
								_this.getPlayer().switchSrc( source , sourceIndex );
							},
							'active': active,
							'divider': ( sourceIndex !== sources.length-1 )
						});				
					}
				}
			});
		},
		getSourceTitle: function( source ){
			var title = '';
			if( source.getHeight() ){
				if( source.getHeight() < 255 ){
					title+= '240P ';
				} else if( source.getHeight() < 370 ){
					title+= '360P ';
				} else if( source.getHeight() < 500 ){
					title+= '480P ';
				} else if( source.getHeight() < 800 ){
					title+= '720P ';
				} else {
					title+= '1080P ';
				}
			} else if ( source.getBitrate() ) {
					var bits = ( Math.round( source.getBitrate() / 1024 * 10 ) / 10 ) + '';
					if( bits[0] == '0' ){
						bits = bits.substring(1);
					}
					title+= ' ' + bits + 'Mbs ';
			}

			title += source.getMIMEType().replace('video/', '');
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