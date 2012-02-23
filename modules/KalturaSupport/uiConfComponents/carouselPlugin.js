/* Carousel Plugin
<Plugin id="playlistAPI" width="0%" height="0%" includeInLayout="false"/>
<Plugin id="related" path="http://projects.kaltura.com/nu/wwwCoBSchool/plugins/relatedPlugin.swf" 
	width="100%" height="100" hoverItemName="" styleName="List_background_default" columnWidth="100" 
	rowHeight="100" columnCount="4" direction="horizontal" dataProvider="{playlistAPI.dataProvider}" itemRenderer="playlistItemRenderer" />
*/
( function( mw, $ ) {
	// Bind to new player event
	$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		embedPlayer.bindHelper( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
			// Check if plugin exists
			if( embedPlayer.isPluginEnabled( 'related' ) && embedPlayer.isPluginEnabled( 'playlistAPI' ) ) {
				window[ 'carouselPlugin' ].init( embedPlayer );
			}
			// Continue player build-out
			callback();
		} );
	} );

    window[ 'carouselPlugin' ] = {
        
		bindPostFix: '.carousel',
		// TODO: make thumbnails size configurable based on uiConf
		imgHeight: 60,

		imgWidth: 100,
		
		imgMargin: 15,
		
        init: function( embedPlayer ) {
            this.embedPlayer = embedPlayer;
            this.addPlayerBindings();
			this.removeAll();
        },
		
		addPlayerBindings: function() {
			var _this = this;
            var embedPlayer = this.embedPlayer;
			
			// Add carousel when player is ready
			embedPlayer.unbindHelper( 'playerReady' + _this.bindPostFix );
			embedPlayer.bindHelper( 'playerReady' + _this.bindPostFix, function() {
				_this.addCarousel();
			} );
			
			// Add carousel when pausing
			embedPlayer.unbindHelper( 'pause' + _this.bindPostFix );
            embedPlayer.bindHelper( 'pause' + _this.bindPostFix, function() {
				_this.addCarousel();
            } );
			
			// Remove carousel when playing
			embedPlayer.unbindHelper( 'onplay' + _this.bindPostFix );
			embedPlayer.bindHelper( 'onplay' + _this.bindPostFix, function() {
				_this.removeAll();
			} );
			
			embedPlayer.unbindHelper( 'onOpenFullScreen' + _this.bindPostFix );
			embedPlayer.bindHelper( 'onOpenFullScreen' + _this.bindPostFix, function() {
				_this.removeAll();
				if ( embedPlayer.paused ) {
					_this.addCarousel();
				}
			} );
			
			embedPlayer.unbindHelper( 'onCloseFullScreen' + _this.bindPostFix );
			embedPlayer.bindHelper( 'onCloseFullScreen' + _this.bindPostFix, function() {
				_this.removeAll();
				if ( embedPlayer.paused ) {
					setTimeout( function() {
						_this.addCarousel();
					}, 50 );
				}
			} );
			
			embedPlayer.unbindHelper( 'onResizePlayer' + _this.bindPostFix );
			embedPlayer.bindHelper( 'onResizePlayer' + _this.bindPostFix, function() {
				_this.removeAll();
				if ( embedPlayer.paused ) {
					setTimeout( function() {
						_this.addCarousel();
					}, 50 );
				}				
			} );
		},
		
		// Add the video name and duration on top of the player
		addTitle: function() {
			var embedPlayer = this.embedPlayer;
			var videoName = '';
			if ( embedPlayer.kalturaPlayerMetaData ) {
				videoName = embedPlayer.kalturaPlayerMetaData.name;
			}
			var $titleContainer = $( '<div />' )
				.addClass( 'carouselVideoTitle' )
				.css( {
					'position' : 'absolute',
					'top' : '0px',
					'left' : '0px',
					'width' : '100%',
					'background' : 'rgba(0, 0, 0, 0.8)',
					'color' : 'white',
					'font-size' : 'small',
					'font-weight' : 'bold',
					'z-index' : 5
				} );
			var $title = $( '<div />' )
				.text( videoName )
				.css( {
					'display' : 'block',
					'padding' : '10px 10px 10px 20px'
				} );
			var $duration = $( '<div />' )
				.text( mw.seconds2npt( embedPlayer.duration, false) )
				.css( {
					'position' : 'absolute',
					'top' : '0px',
					'right' : '0px',
					'padding' : '2px',
					'background-color' : '#5A5A5A',
					'color' : '#D9D9D9',
					'font-size' : 'smaller',
					'z-index' : 6
				} );
			$titleContainer.append( $title, $duration );
			// Add the title to the interface
			embedPlayer.$interface.append( $titleContainer );
			return true;
		},
		
		// Add the carousel components
        addCarousel: function( visibleThumbnails ) {
			var _this = this;
            var embedPlayer = this.embedPlayer;
			
			var maxThumbnails = _this.getMaxThumbnails();
			visibleThumbnails = ( ( typeof visibleThumbnails ) !== 'undefined' ) ? visibleThumbnails : maxThumbnails;
			
			// Remove any previous carousel
			_this.removeCarousel();
			
			// Get all entries in the playlist
			var entriesArray = [];

			for ( var playlist_id in embedPlayer.kalturaPlaylistData ) {
				entriesArray = $.merge( entriesArray, embedPlayer.kalturaPlaylistData[ playlist_id ] );
			}
			
			// Carousel Container
			var $carouselContainer = $( '<div />')
				.addClass( 'carouselContainer' );
				
			// Carousel main component
            var $carousel = $( '<div />' )
				.addClass( 'carousel' )
                .append( '<ul />' );
			
			// When hovering over an entry, display entry name below carousel
			var $imgTitle = $( '<div />')
				.addClass( 'carouselImgTitle' )
				.css( {
					'position' : 'absolute',
					'bottom' : embedPlayer.controlBuilder.getHeight() + 10 + 'px',
					'width' : '100%',
					'text-align' : 'center',
					'color' : 'white',
					'font-size' : 'small',
					'background' : 'rgba(0, 0, 0, 0.4)'
				} );

			// Iterate over playlist entries and generate thumbnails
			$.each( entriesArray, function( i, currEntryObj ) {
				var $img = $( '<img />' )
					.attr( {
						'src' : currEntryObj.thumbnailUrl,
						'title' : currEntryObj.name,
						'width' : _this.imgWidth + 'px',
						'height' : _this.imgHeight + 'px'
					} )
					.css( {
						'margin-right' : _this.imgMargin + 'px',
						'border' : '1px solid white'
					} )
					.hover( 
						function() {
							$( this ).css( 'cursor', 'pointer' );
							$imgTitle.text( currEntryObj.name );
						},
						function() {
							$imgTitle.text( '' ) ;
						}
					)
					.bind( 'click', function() {
						$imgTitle.remove();
						_this.removeCarousel();
						embedPlayer.sendNotification( "changeMedia", {'entryId' : currEntryObj.id} ); 
					} );
				// Entry duration is overlayed on the thumbnail
				var $imgOverlay = $( '<span />' )
					.text( mw.seconds2npt( currEntryObj.duration, false) )
					.css( { 
						'position' : 'absolute',
						'top' : '2px',
						'left' : '2px',
						'background' : 'rgba( 0, 0, 0, 0.7 )',
						'color' : 'white',
						'padding' : '1px 6px',
						'font-size' : 'small'
					} );
                var $currentEntry = $( '<li />')
					.css( 'position', 'relative' )
                    .append( $img, $imgOverlay )
                $carousel.find( 'ul' )
                    .append( $currentEntry );
            } );
			
			// Add the carousel main component
			$carouselContainer.append( $carousel );
			
			// Carousel scroll back 
			var $prevButton = $( '<img />' )
				.attr( {
					'id' : 'prev',
					'title' : 'Previous',
					'src' : '../../../skins/common/images/leftarrow-white.png',
					'width' : '15px'
				} )
				.css( { 
					'display' : 'block',
					'position' : 'absolute',
					'left' : '5px'
				} )
				.hover(
					function() {
						$( this ).attr( 'src', '../../../skins/common/images/leftarrow-orange.png' )
							.css( 'cursor', 'pointer' );
					},
					function() {
						$( this ).attr( 'src', '../../../skins/common/images/leftarrow-white.png' );
					}
				);
					
			// Carousel scroll forward
			var $nextButton = $( '<img />' )
				.attr( {
					'id' : 'next',
					'title' : 'Next',
					'src' : '../../../skins/common/images/rightarrow-white.png',
					'width' : '15px'
				} )
				.css( { 
					'position' : 'absolute',
					'right' : '6px',
					'display' : 'block'
				} )
				.hover(
					function() {
						$( this ).attr( 'src', '../../../skins/common/images/rightarrow-orange.png' )
							.css( 'cursor', 'pointer' );
					},
					function() {
						$( this ).attr( 'src', '../../../skins/common/images/rightarrow-white.png' );
					}
				);
					
			_this.addTitle();
			
			// iPhone uses native player so the carousel should be drawn below the player and not on top of it. 
			// In order to avoid resizing the iframe container, only the player is resized
			if ( mw.isIphone() ) {
				_this.resizePlayer( true );
				embedPlayer.$interface.after( $carouselContainer );
			}
			else {
				embedPlayer.$interface.prepend( $carouselContainer );
			}
			$carouselContainer.append( $prevButton )
				.append( $nextButton );
			if ( !mw.isIphone() ) {
				$carouselContainer.after( $imgTitle );
			}
			// Place the next/previous buttons in the middle of the thumbnails vertically
			$prevButton.css( 'bottom', parseInt( ( _this.imgHeight / 2 ) ) - parseInt( ( $prevButton.height() / 2 ) ) + 2 + 'px' );
			$nextButton.css( 'bottom', parseInt( ( _this.imgHeight / 2 ) ) - parseInt( ( $nextButton.height() / 2 ) ) + 2 + 'px' );
			$carousel.jCarouselLite( {
				btnNext: "#next",
				btnPrev: "#prev",
				circular: false,
				// TODO: make number of visible thumbnails configurable or computed (i.e how many that fit)
				visible: visibleThumbnails,
				scroll: 1
			} );
			$carouselContainer.css( { 
				'position' : 'absolute', 
				'bottom' : ( embedPlayer.controlBuilder.getHeight() + 30 ) + 'px',
				'width' : '100%',
				'z-index' : 100
			} );
			if ( mw.isIphone() ) {
				$carouselContainer.css( { 
					'bottom' : '0px'
				} );
			}
			$carousel.css( {
				'left' : '30px'
			} );
			return true;
        },

		removeCarousel: function() {
			var embedPlayer = this.embedPlayer;
			var $searchNode = embedPlayer.$interface;
			if ( $searchNode ) {
				if ( mw.isIphone() ) {
					$searchNode = $searchNode.parent();
				}
				if ( $searchNode.find( ".carouselContainer" ).length ) {
					$searchNode.find( ".carouselContainer" ).remove();
				}
			}
		},
		
		removeImageTitle: function() {
			var embedPlayer = this.embedPlayer;
			if ( embedPlayer.$interface ) {
				if ( embedPlayer.$interface.find( ".carouselImgTitle" ).length	) {
					embedPlayer.$interface.find( ".carouselImgTitle" ).remove();
				}
			}
			return true;
		},
		
		removeVideoTitle: function() {
			var embedPlayer = this.embedPlayer;
			if ( embedPlayer.$interface ) {
				if ( embedPlayer.$interface.find( ".carouselVideoTitle" ).length ) {
					embedPlayer.$interface.find( ".carouselVideoTitle" ).remove();
				}
			}
		},
		
		removeAll: function() {
			this.removeVideoTitle();
			this.removeImageTitle();
			this.removeCarousel();
			if ( mw.isIphone() ) {
				this.resizePlayer();
			}
		},
		
		// Shrink or expand video (When carousel is below the player)
		resizePlayer: function( shrink ) {
			var _this = this;
			var embedPlayer = this.embedPlayer;
			if ( !embedPlayer.$interface ) {
				// Too soon
				return;
			}
			var currentInterfaceHeight = embedPlayer.$interface.height();
			var currentVideoHeight = $( embedPlayer.getPlayerElement() ).height();
			var changeHeight = _this.imgHeight + 12;
			if ( shrink ) {
				embedPlayer.$interface.css( {
					'height' : currentInterfaceHeight - changeHeight
				} );
				$( embedPlayer ).css( {
					'height' : currentInterfaceHeight - changeHeight
				} );
				$( embedPlayer.getPlayerElement() ).css( {
					'height' : currentVideoHeight - changeHeight
				} );
			}
			else {
				embedPlayer.$interface.css( {
					'height' : currentInterfaceHeight + changeHeight
				} );
				$( embedPlayer ).css( {
					'height' : currentInterfaceHeight + changeHeight
				} );
				$( embedPlayer.getPlayerElement() ).css( {
					'height' : currentVideoHeight + changeHeight
				} );}
		},
		
		// Calculate how manu thumbnails can be visible based on player and thumbnails width
		getMaxThumbnails: function() {
			var embedPlayer = this.embedPlayer;
			
			// Available width = (Interface Width) - 30 (Previous/Next arrows)
			var maxThumbnails = Math.floor( ( embedPlayer.$interface.width() - 30 ) / ( this.imgWidth + this.imgMargin ) );
			if ( embedPlayer.controlBuilder.inFullScreen ) {
				maxThumbnails = Math.floor( screen.width / ( this.imgWidth + this.imgMargin ) );
			}
			
			return maxThumbnails;
		}
		
    };
} )( window.mw, window.jQuery );