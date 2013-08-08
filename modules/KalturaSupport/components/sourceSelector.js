( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'sourceSelector', mw.KBaseComponent.extend({

		defaultConfig: {
			"parent": "controlsContainer",
         	"order": 61
		},

		setup: function(){
			var _this = this;
			this.bind( 'KalturaSupport_EntryDataReady', function(){
				_this.getComponent().find( 'ul' ).empty().append( _this.getSourcesItems() );
			});
		},
		getSourcesItems: function(){	
			var _this = this;
			var embedPlayer = this.getPlayer();
			var $listItems = [];
			var sources = embedPlayer.mediaElement.getPlayableSources();
			var activeClass = '';
			// sort by bitrate if possible:
			if( sources[0].getBitrate() ){
				sources.sort(function(a,b){
					return a.getBitrate() - b.getBitrate();
				});
			}
			$.each( sources, function( sourceIndex, source ) {
				var activeClass = ( embedPlayer.mediaElement.selectedSource && source.getSrc() == embedPlayer.mediaElement.selectedSource.getSrc() ) ? 'active' : '';
				// Output the player select code:
				var supportingPlayers = mw.EmbedTypes.getMediaPlayers().getMIMETypePlayers( source.getMIMEType() );
				for ( var i = 0; i < supportingPlayers.length ; i++ ) {
					if( supportingPlayers[i].library == 'Native' ){
						$listItems.push( 
							$( '<li />' )
								.append(
								$( '<a />' )
									.attr({
										'href': '#'
									})
									.click(function(){
										_this.switchSrc( source );
									})
									.html( source.getShortTitle() )
								)
								.addClass( activeClass )
						);
						if( sourceIndex !== sources.length-1 ) {
							$listItems.push( $( '<li />').addClass('divider') );
						}						
					}
				}
			});
			return $listItems;
		},
		switchSrc: function( source ){
			// TODO this logic should be in mw.EmbedPlayer
			var _this = this;
			this.getPlayer().mediaElement.setSource( source );
			if( ! this.getPlayer().isStopped() ){
				// Get the exact play time from the video element ( instead of parent embed Player )
				var oldMediaTime = this.getPlayer().getPlayerElement().currentTime;
				var oldPaused =  this.getPlayer().paused;
				// Do a live switch
				this.getPlayer().playerSwitchSource( source, function( vid ){
					// issue a seek
					_this.getPlayer().setCurrentTime( oldMediaTime, function(){
						// reflect pause state
						if( oldPaused ){
							_this.getPlayer().pause();
						}
					} );
				});
			}
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