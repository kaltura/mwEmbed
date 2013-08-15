( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'sourceSelector', mw.KBaseComponent.extend({

		defaultConfig: {
			"parent": "controlsContainer",
         	"order": 61,
         	"align": "right",
         	"showTooltip": true
		},

		setup: function(){
			var _this = this;
			this.bind( 'KalturaSupport_EntryDataReady', function(){
				_this.getComponent().find( 'ul' ).empty().append( _this.getSourcesItems() );
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
			if( sources[0].getBitrate() ){
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
				}

				title += source.getMIMEType().replace('video/', '');
				return title;
			};

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
									.html( getTitle(source) )
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
			return this.getComponent().find('button');
		}
	}));

} )( window.mw, window.jQuery );		