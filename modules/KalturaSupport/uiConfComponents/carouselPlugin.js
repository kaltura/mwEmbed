/* Carousel Plugin:
<Plugin id="carousel" ... />
*/

( function( mw, $ ) {
	// Bind to new player event
	$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
		embedPlayer.bindHelper( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
			// Check if plugin exists
			if( embedPlayer.isPluginEnabled( 'carousel' ) ) {
                window[ 'carouselPlugin' ].init( embedPlayer );
			}

			// Continue player build-out
			callback();
		});
	});

    window[ 'carouselPlugin' ] = {
        
        init: function( embedPlayer ) {
            this.embedPlayer = embedPlayer;
            this.addPlayerBindings();
			this.removeAll();
        },
		
		addPlayerBindings: function() {
			var _this = this;
            var embedPlayer = this.embedPlayer;
			// Add carousel when player is ready
			embedPlayer.bindHelper( 'playerReady', function() {
				_this.addCarousel();
			} );
			
			// Add carousel when pausing
            embedPlayer.bindHelper( 'pause', function() {
                _this.addCarousel();
            });
			
			// Remove carousel when playing
			embedPlayer.bindHelper( 'onplay', function() {
				_this.removeAll();
			});
		},
		
		// Add the video name and duration on top of the player
		addTitle: function() {
			var embedPlayer = this.embedPlayer;
			var videoName = embedPlayer.kalturaPlayerMetaData.name;
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
        addCarousel: function() {
			var _this = this;
            var embedPlayer = this.embedPlayer;
			
			// Remove any previous carousel
			_this.removeCarousel();
			
			// Get all entries in the playlist
            var entriesArray = embedPlayer.kalturaPlaylistData[ embedPlayer.getKalturaConfig('carousel','playlist_id') ];
			
			// Carousel Container
			var $carouselContainer = $( '<div />')
				.addClass( 'carouselContainer' );
				
			// Carousel main component
            var $carousel = $( '<div />' )
				.addClass( 'carousel' )
                .append( '<ul />' );
			
			// TODO: make thumbnails size configurable
			var imgHeight = 60;
			var imgWidth = 100;
			
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
						'width' : imgWidth + 'px',
						'height' : imgHeight + 'px'
					} )
					.css( {
						'margin-right' : '15px',
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
			embedPlayer.$interface.prepend( $carouselContainer );
			$carouselContainer.append( $prevButton )
				.append( $nextButton );
			$carouselContainer.after( $imgTitle );
			// Place the next/previous buttons in the middle of the thumbnails vertically
			$prevButton.css( 'bottom', parseInt( ( imgHeight / 2 ) ) - parseInt( ( $prevButton.height() / 2 ) ) + 2 + 'px' );
			$nextButton.css( 'bottom', parseInt( ( imgHeight / 2 ) ) - parseInt( ( $nextButton.height() / 2 ) ) + 2 + 'px' );
			$carousel.jCarouselLite( {
				btnNext: "#next",
				btnPrev: "#prev",
				circular: false,
				// TODO: make number of visible thumbnails configurable or computed (i.e how many that fit)
				visible: 3,
				scroll: 1
			} );
			$carouselContainer.css( { 
				'position' : 'absolute', 
				'bottom' : ( embedPlayer.controlBuilder.getHeight() + 30 ) + 'px',
				'width' : '100%',
				'z-index' : 100
			} );
			$carousel.css( {
				'left' : '30px'
			} );
			return true;
        },
        
		removeCarousel: function() {
			var embedPlayer = this.embedPlayer;
			if ( embedPlayer.$interface ) {
				if ( embedPlayer.$interface.find( ".carouselContainer" ).length	) {
					embedPlayer.$interface.find( ".carouselContainer" ).remove();
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
		}
              
    };
})( window.mw, window.jQuery );