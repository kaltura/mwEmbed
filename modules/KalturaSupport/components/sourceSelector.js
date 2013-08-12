( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'sourceSelector', mw.KBaseComponent.extend({

		defaultConfig: {
			"parent": "controlsContainer",
         	"order": 61
		},

		setup: function(){
			var _this = this;
			///////////////////////////////
			//TODO: check if we need it
			//////////////////////////////
			/*this.bind( 'KalturaSupport_EntryDataReady', function(){
				debugger;
				_this.getComponent().find( 'ul' ).empty().append( _this.getSourcesItems() );
			});*/

			this.bind( 'PlayerLoaded', function(){
				_this.getComponent().find( 'ul' ).empty().append( _this.getSourcesItems() );
			});
			this.bind( 'SourceChange', function(){
				_this.getComponent().find( 'ul' ).addClass( 'disabled' );
				var selectedSrc = _this.getPlayer().mediaElement.selectedSource.getSrc();
				var lis = _this.getComponent().find( 'ul' ).children();
				$.each( lis, function( index, li ) {
					if ( selectedSrc == li.id ) {
						$( li ).addClass ('active' )
					} else {
						$( li ).removeClass( 'active' )
					}
				});
				////////////////////////////////////
				// TODO: enable source selector now
				////////////////////////////////////

			});	
			this.bind( 'SourceSwitchingStarted', function(){
				_this.getComponent().find( 'ul' ).addClass( 'disabled' );
				////////////////////////////////////
				// TODO: disable source selector now
				////////////////////////////////////
			});

		},
		getSourcesItems: function(){	
			var _this = this;
			var embedPlayer = this.getPlayer();
			var $listItems = [];
			var sources = embedPlayer.mediaElement.getPlayableSources();
			if (embedPlayer.selectedPlayer !== undefined) {
				sources = embedPlayer.getSourcesByTags( sources );
			}

			var activeClass = '';
			// sort by bitrate if possible:
			if( sources.length && sources[0].getBitrate() ){
				sources.sort(function(a,b){
					return a.getBitrate() - b.getBitrate();
				});
			}
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
									'id': source.getSrc() 
								})
								.append(
								$( '<a />' )
									.attr({
										'href': '#'
									})
									.click(function(){
										embedPlayer.switchSrc( source , sourceIndex );
									})
									.html( source.getShortTitle() )
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
								.addClass( 'btn icon-cog pull-right' )
								.click( function(){
									_this.toggleMenu();
								});

				this.$el = $( '<div />' )
								.addClass( 'dropup pull-right' )
								.append( $button, $dropDownMenu );
			}
			return this.$el;
		}
	}));

} )( window.mw, window.jQuery );		