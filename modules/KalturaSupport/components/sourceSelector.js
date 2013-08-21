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

			this.bind( 'KalturaSupport_EntryDataReady PlayerLoaded sourcesReplaced', function(){
				_this.getComponent().find( 'ul' ).empty().append( _this.getSourcesItems() );
			});

			this.bind( 'SourceChange', function(){
				_this.getComponent().find( 'ul' ).addClass( 'disabled' );
				var selectedSrc = _this.getPlayer().mediaElement.selectedSource.getAssetId();
				var lis = _this.getComponent().find( 'ul' ).children();
				$.each( lis, function( index, li ) {
					if ( selectedSrc == li.id ) {
						$( li ).addClass ('active' )
					} else {
						$( li ).removeClass( 'active' )
					}
				});
				_this.onEnable();
			});	

			this.bind( 'sourceSwitchingStarted', function(){
				_this.onDisable();
			});

			this.bind( 'hoverOutPlayer', function(){
				_this.getComponent().removeClass( 'open' );
			});
		},
		getSources: function(){
			return this.getPlayer().mediaElement.getPlayableSources();
		},

		getSourcesItems: function(){	
			var _this = this;
			var embedPlayer = this.getPlayer();
			var $listItems = [];
			var sources = this.getSources();
			var activeClass = '';
			// sort by bitrate if possible:
			if( sources.length && sources[0].getBitrate() ){
				sources.sort(function(a,b){
					return a.getBitrate() - b.getBitrate();
				});
			}

			// Returns flavor title based on height
			var getTitle = function( source ){
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
			};

			$.each( sources, function( sourceIndex, source ) {
				var activeClass = ( embedPlayer.mediaElement.selectedSource && source.getSrc() == embedPlayer.mediaElement.selectedSource.getSrc() ) ? 'active' : '';
				// Output the player select code:
				var supportingPlayers = mw.EmbedTypes.getMediaPlayers().getMIMETypePlayers( source.getMIMEType() );
				for ( var i = 0; i < supportingPlayers.length ; i++ ) {
					if( (embedPlayer.selectedPlayer === undefined && supportingPlayers[i].library == 'Native' ) ||
						(embedPlayer.selectedPlayer !== undefined && supportingPlayers[i].library == embedPlayer.selectedPlayer.library )){
						$listItems.push( 
							$( '<li />' )
								.attr({ 
									'id': source.getAssetId()
								})
								.append(
								$( '<a />' )
									.attr({
										'href': '#'
									})
									.click(function(){
										embedPlayer.switchSrc( source , sourceIndex );
									})
									.html( getTitle(source) )
								)
								.addClass( activeClass )
						);
						if( sourceIndex !== sources.length-1 ) {
							$listItems.push( $( '<li />').addClass('divider') );
						}	
						break;					
					}
				}
			});
			return $listItems;
		},
		toggleMenu: function(){
			if ( this.isDisabled ) {
				return;
			}
			this.getComponent().toggleClass( 'open' );
		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				var $dropDownMenu = $( '<ul />' )
										.addClass( 'dropdown-menu' )
										.attr({
											'role': 'menu',
											'aria-labelledby': 'dLabel'
										});
				var $button = $( '<button />' )
								.addClass( 'btn icon-cog' )
								.attr('title', 'Quality Settings')
								.click( function(){
									_this.toggleMenu();
								});

				this.$el = $( '<div />' )
								.addClass( 'dropup' + this.getCssClass() )
								.append( $button, $dropDownMenu );
			}
			return this.$el;
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