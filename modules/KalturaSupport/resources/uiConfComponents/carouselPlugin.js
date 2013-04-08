/* Carousel Plugin
<Plugin id="playlistAPI" width="0%" height="0%" includeInLayout="false"/>
<Plugin id="related" path="http://projects.kaltura.com/nu/wwwCoBSchool/plugins/relatedPlugin.swf"
	width="100%" height="100" hoverItemName="" styleName="List_background_default" columnWidth="100"
	rowHeight="100" columnCount="4" direction="horizontal" dataProvider="{playlistAPI.dataProvider}" itemRenderer="playlistItemRenderer" />
*/
( function( mw, $ ) {"use strict";

   var carouselPlugin = {

		bindPostFix: '.carousel',

		numOfEntries: 0,
		// TODO: make thumbnails size configurable based on uiConf
		imgHeight: 60,

		imgWidth: 100,

		imgMargin: 15,

		arrowWidth: 15,

		arrowHeight: 29,

		carouselLeft: 30,

		isCarouselDrawn: false,

		currentEntry: 0,

		visibleThumbnails: 4,

		$carouselElement: null,

		$hoverTitle: '',

        init: function( embedPlayer ) {
            this.embedPlayer = embedPlayer;
            this.addPlayerBindings();
			this.buildCarousel();
        },

		addPlayerBindings: function() {
			var _this = this;
			var embedPlayer = this.embedPlayer;

			embedPlayer.unbindHelper( _this.bindPostFix );
			// Add carousel when player is ready
			embedPlayer.bindHelper( 'playerReady' + _this.bindPostFix, function() {
				// Remove playlist list
				$('.video-list-wrapper').remove();
				_this.drawCarousel();
			} );

			// Add carousel when pausing
            embedPlayer.bindHelper( 'onpause' + _this.bindPostFix, function() {
				_this.toggleAll( true );
            } );

			// Remove all carousel components when playing
			embedPlayer.bindHelper( 'onplay' + _this.bindPostFix, function() {
				_this.toggleAll( false );
			} );

			embedPlayer.bindHelper( 'onOpenFullScreen' + _this.bindPostFix + ' onCloseFullScreen' + _this.bindPostFix, function() {
				_this.toggleAll( false );
				if ( embedPlayer.paused ) {
					_this.toggleAll( true );
					_this.drawCarousel();
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
			if ( !this.isCarouselDrawn ) {
				var $titleContainer = $( '<div />' )
					.addClass( 'carouselVideoTitle' );
				var $title = $( '<div />' )
					.text( videoName )
					.addClass( 'carouselVideoTitleText' );
				var $duration = $( '<div />' )
					.text( mw.seconds2npt( embedPlayer.duration, false) )
					.addClass( 'carouselTitleDuration' );
				$titleContainer.append( $title, $duration );
				// Add the title to the interface
				embedPlayer.$interface.append( $titleContainer );
			}
			else {
				embedPlayer.$interface.find( '.carouselVideoTitleText' ).text( videoName );
				embedPlayer.$interface.find( '.carouselTitleDuration' ).text( mw.seconds2npt( embedPlayer.duration, false) );
			}
			return true;
		},

		// Add the carousel components
        buildCarousel: function() {
			var _this = this;
			var embedPlayer = this.embedPlayer;
			if ( !embedPlayer.kalturaPlaylistData ) {
				return false;
			}
			$('#playlistContainer').hide();
			if ( _this.$carouselElement ) {
				return true;
			}
			// Get all entries in the playlist
			var entriesArray = [];

			for ( var playlist_id in embedPlayer.kalturaPlaylistData ) {
				entriesArray = $.merge( entriesArray, embedPlayer.kalturaPlaylistData[ playlist_id ].items );
			}

			_this.numOfEntries = entriesArray.length;

			// Carousel Container
			var $carouselContainer = $( '<div />')
				.addClass( 'carouselContainer' );

			// Carousel main component
			var $carousel = $( '<div />' )
				.addClass( 'carousel' )
				.append( '<ul />' );

			// When hovering over an entry, display entry name below carousel
			_this.$hoverTitle = $( '<div />')
				.addClass( 'carouselImgTitle' );

			var bindPostFix = '.thumbnailClick';
			embedPlayer.unbindHelper( bindPostFix );
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
						'border' : '1px groove white'
					} )
					.hover(
						function() {
							$( this ).css( 'cursor', 'pointer' );
							_this.$hoverTitle.text( currEntryObj.name );
						},
						function() {
							_this.$hoverTitle.text( '' ) ;
						}
					)
					.unbind( 'click' + bindPostFix )
					.bind( 'click' + bindPostFix, function() {
						embedPlayer.bindHelper( 'onChangeMediaDone' + bindPostFix, function() {
							embedPlayer.play();
						} );
						_this.toggleVideoTitle( false );
						embedPlayer.sendNotification( 'changeMedia', {'entryId' : currEntryObj.id} );
					} );
				// Entry duration is overlayed on the thumbnail
				var $imgOverlay = $( '<span />' )
					.text( mw.seconds2npt( currEntryObj.duration, false) )
					.addClass( 'carouselImgDuration' );
				var $currentEntry = $( '<li />')
					.css( 'position', 'relative' )
					.append( $img, $imgOverlay )
					.addClass( 'carouselThumbnail' );
				$carousel.find( 'ul' )
					.append( $currentEntry );
			} );

			// Add the carousel main component
			$carouselContainer.append( $carousel );

			var imageUrlPath = mw.getEmbedPlayerPath() + '/../MwEmbedSupport/skins/common/images/';
			// Carousel scroll back
			var $prevButton = $( '<div />' )
				.attr( {
					'title' : 'Previous'
				} )
				.addClass( 'carouselPrevButton' )
				.css( {
					'cursor' : 'pointer',
					'background' : 'transparent url("' + imageUrlPath + 'leftarrow.png") no-repeat',
					'background-size' : 'contain',
					'width' : _this.arrowWidth + 'px',
					'height' : _this.arrowHeight + 'px',
					'top' : ( _this.imgHeight / 2 ) - ( _this.arrowHeight / 2 ) + 1 + 'px'
				} )
				.click( function() {
					_this.currentEntry--;
				} );
			// Carousel scroll forward
			var $nextButton = $( '<div />' )
				.attr( {
					'title' : 'Next'
				} )
				.addClass( 'carouselNextButton' )
				.css( {
					'cursor' : 'pointer',
					'background' : 'transparent url("' + imageUrlPath + 'rightarrow.png") no-repeat',
					'background-size' : 'contain',
					'width' : _this.arrowWidth + 'px',
					'height' : _this.arrowHeight + 'px',
					'top' : ( _this.imgHeight / 2 ) - ( _this.arrowHeight / 2 ) + 1 + 'px'
				} )
				.click( function() {
					_this.currentEntry++;
				} );
			$carouselContainer.append( $prevButton )
				.append( $nextButton );

			_this.$carouselElement = $carouselContainer;
			return true;
        },

		drawCarousel: function() {
			var _this = this;
			var embedPlayer = _this.embedPlayer;
			if ( !_this.$carouselElement ) {
				return false;
			}
			_this.positionCarousel();
			if ( !_this.isCarouselDrawn ) {
				// iPhone uses native player so the carousel should be drawn below the player and not on top of it.
				// In order to avoid resizing the iframe container, only the player is resized
				//mw.isIphone = function() { return true; };
				if ( mw.isIphone() ) {
					// First append to body
					embedPlayer.$interface.find('.control-bar').before( _this.$carouselElement );
					// Update css height and add class block to make sure updateLayout will calculate the container
					_this.$carouselElement.addClass('block').css({
						position: 'relative',
						height: _this.$carouselElement.find('.carouselThumbnail').height()
					});
					embedPlayer.doUpdateLayout();
				}
				else {
					embedPlayer.$interface.prepend( _this.$carouselElement );
					_this.$carouselElement.after( _this.$hoverTitle );
					_this.$hoverTitle.css( 'bottom', ( embedPlayer.controlBuilder.getHeight() + 10 ) );
				}
			}
			_this.$carouselElement.find( '.carouselThumbnail' ).css( 'margin-right', _this.imgMargin );

			// Update the start position in case not enough thumbnails are present to cover the screen
			if ( _this.numOfEntries > _this.visibleThumbnails ) {
				var delta = _this.currentEntry + _this.visibleThumbnails - _this.numOfEntries;
				if ( delta >= 0 ) {
					_this.currentEntry -= delta;
				}
			}
			else {
				_this.currentEntry = 0;
			}
			_this.$carouselElement.find( '.carousel' ).jCarouselLite( {
				btnNext: '.carouselNextButton',
				btnPrev: '.carouselPrevButton',
				circular: false,
				visible: _this.visibleThumbnails,
				scroll: 1,
				start: _this.currentEntry
			} );
			if ( mw.isIphone() ) {
				_this.$carouselElement.css( 'bottom', '0px' );
			}
			else {
				_this.$carouselElement.css( 'bottom', embedPlayer.controlBuilder.getHeight() + 30 );
			}
			_this.addTitle();
			_this.$carouselElement.find( '.carousel' ).css( 'left', _this.carouselLeft );
			_this.carouselLeft = 30;
			_this.imgMargin = 15;
			_this.isCarouselDrawn = true;
			return true;
		},

		// Center carousel and update visible thumbnails number
		positionCarousel: function() {
			var _this = this;
			var embedPlayer = _this.embedPlayer;
			var maxThumbnails = _this.getMaxThumbnails();
			// If fixedThumbnails flag is true then try to get number of thumbnails, otherwise default to maximum thumbnails
			if ( embedPlayer.getFlashvars( 'fixedThumbnails' ) && embedPlayer.getFlashvars( 'numOfThumbnails' ) ) {
				var numOfThumbnails = parseInt( embedPlayer.getFlashvars( 'numOfThumbnails' ) );
				if ( numOfThumbnails <= maxThumbnails ) {
					_this.visibleThumbnails = numOfThumbnails;
				}
			}
			else {
				_this.visibleThumbnails = maxThumbnails;
			}
			_this.imgMargin = parseInt( ( embedPlayer.getWidth() - 41 - ( _this.visibleThumbnails * _this.imgWidth ) ) / ( _this.visibleThumbnails + 1 ) );
			_this.carouselLeft += _this.imgMargin - 10;
		},

		// Calculate how manu thumbnails can be visible based on player and thumbnails width
		getMaxThumbnails: function() {
			var embedPlayer = this.embedPlayer;

			// Available width = (Interface Width) - 30 (Previous/Next arrows)
			var maxThumbnails = Math.floor( ( embedPlayer.getWidth() - 30 ) / ( this.imgWidth + this.imgMargin ) );

			return maxThumbnails;
		},

		// Show/hide carousel component
		toggleCarousel: function( show ) {
			var embedPlayer = this.embedPlayer;
			var $searchNode = embedPlayer.$interface;
			if ( $searchNode ) {
				if ( mw.isIphone() ) {
					$searchNode = $searchNode.parent();
				}
				if ( $searchNode.find( '.carouselContainer' ).length ) {
					$searchNode.find( '.carouselContainer' ).toggle( show );
				}
			}
		},

		// Show/hide hovering title component
		toggleImageTitle: function( show ) {
			var embedPlayer = this.embedPlayer;
			if ( embedPlayer.$interface ) {
				if ( embedPlayer.$interface.find( '.carouselImgTitle' ).length	) {
					embedPlayer.$interface.find( '.carouselImgTitle' ).toggle( show );
				}
			}
			return true;
		},

		// Show/hide video title component
		toggleVideoTitle: function( show ) {
			var embedPlayer = this.embedPlayer;
			if ( embedPlayer.$interface ) {
				if ( embedPlayer.$interface.find( '.carouselVideoTitle' ).length ) {
					embedPlayer.$interface.find( '.carouselVideoTitle' ).toggle( show );
				}
			}
		},

		// Show/hide all components
		toggleAll: function( show ) {
			mw.log( "carouselPlugin:: toggleAll: " + show );
			this.toggleVideoTitle( show );
			this.toggleImageTitle( show );
			this.toggleCarousel( show );
		}
    };

	// Bind to new player event
   mw.addKalturaConfCheck( function( embedPlayer, callback){
		// Check if plugin exists
		if( 
			( 
				embedPlayer.isPluginEnabled( 'related' ) 
					||
				embedPlayer.isPluginEnabled( 'carousel' )
			)
				&& embedPlayer.isPluginEnabled( 'playlistAPI' ) 
		) {
			carouselPlugin.init( embedPlayer );
		}
		// Continue player build-out
		callback();
	} );


} )( window.mw, window.jQuery );