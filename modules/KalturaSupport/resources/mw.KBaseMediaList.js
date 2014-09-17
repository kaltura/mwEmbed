( function( mw, $ ) {"use strict";

	/**
	 * Base screen component that allow to show overlay on top of the player
	 **/

	mw.KBaseMediaList = mw.KBaseComponent.extend({

		mediaList: [],
		isDisabled: false,
		$mediaListContainer: null,
		selectedMediaItemIndex: 0,

		getBaseConfig: function(){
			var parentConfig = this._super();
			return $.extend({}, parentConfig, {
				'oneSecRotatorSlidesLimit': 61,
				'twoSecRotatorSlidesLimit': 250,
				'maxRotatorSlides': 125,
				'layout': 'vertical',
				'mediaItemWidth': 290,
				'mediaItemHeight': 70,
				'onPage': false,
				'includeInLayout': true,
				'clipListTargetId': null,
				'containerPosition':  'left',
				'parent': null//'sideBarContainer',
			});
		},

		setDefaults: function(){
			this.baseThumbSettings = {
				'partner_id': this.getPlayer().kpartnerid,
				'uiconf_id': this.getPlayer().kuiconfid,
				'entry_id': this.getPlayer().kentryid,
				'width': this.getConfig( "thumbWidth" )
			};
			this._super( );
		},

		_addBindings: function () {
			var _this = this;
			this._super();

			this.bind('updateLayout', function(){
				_this.renderMediaList();
			});
			// handle fullscreen entering resize
			$( this.embedPlayer ).bind('onOpenFullScreen', function() {
				if ( !_this.getConfig( 'parent') ){
					$(".medialistContainer").hide();
				}
			});

			// handle fullscreen exit resize
			$( this.embedPlayer ).bind('onCloseFullScreen', function() {
				if ( !_this.getConfig( 'parent') ){
					$(".medialistContainer").show();
				}
			});

		},

		getComponent: function(){
			if( ! this.$el ){
				this.$el = $( '<div />' )
					.addClass( this.pluginName + " medialistContainer k-chapters-container k-" + this.getLayout() );
				if (!this.getConfig('parent')){
					if ( this.getConfig( 'containerPosition' ) == 'top' && !this.getConfig( 'onPage' ) ) {
						this.getMedialistContainer().prepend(this.$el);
					} else {
						this.getMedialistContainer().append(this.$el);
					}
				}
			}
			return this.$el;
		},

		// set the play list container according to the selected position
		getMedialistContainer: function(){
			if (!this.$mediaListContainer) {
				if ( this.getConfig( 'onPage' ) ) {
					var iframeID = this.embedPlayer.id + '_ifp';
					try {
						//Try to apply css on parent frame
						var cssLink = $("link[href$='"+this.getConfig('cssFileName')+"']").attr("href");
						$('head', window.parent.document ).append('<link type="text/css" rel="stylesheet" href="'+cssLink+'"/>');

						$( window['parent'].document ).find( '.onpagePlaylistInterface' ).remove(); // remove any previously created playlists
						var iframeParent = window['parent'].document.getElementById( this.embedPlayer.id );
						if ( this.getConfig( 'clipListTargetId' ) && $( iframeParent ).parent().find( "#" + this.getConfig( 'clipListTargetId' ) ).length > 0 ) {
							$( iframeParent ).parent().find( "#" + this.getConfig( 'clipListTargetId' ) ).html( "<div class='onpagePlaylistInterface'></div>" );
							this.$mediaListContainer = $( iframeParent ).parent().find( ".onpagePlaylistInterface" );
						} else {
							$( iframeParent ).after( "<div class='onpagePlaylistInterface'></div>" );
							this.$mediaListContainer = $( iframeParent ).parent().find( ".onpagePlaylistInterface" );
							$( this.$mediaListContainer ).width( $( iframeParent ).width() - 2 );
							var containerHeight = this.getLayout() === "vertical" ? this.getConfig( "mediaItemHeight" ) * 3 : this.getConfig( "mediaItemHeight" ) + 20;
							$( this.$mediaListContainer ).height( containerHeight );
						}
						// support hidden playlists
						if ( this.getConfig( 'includeInLayout' ) === false ) {
							this.$mediaListContainer.hide();
						}
						this.$mediaListContainer.addClass( "k-" + this.getLayout() );
					} catch ( e ) {
						mw.log( "Error: "+ this.pluginName +" could not access parent iframe" );
					}
				} else {
					this.$mediaListContainer = $( ".playlistInterface" );
					// resize the video to make place for the playlist according to its position (left, top, right, bottom)
					if ( this.getConfig( 'containerPosition' ) == 'right' || this.getConfig( 'containerPosition' ) == 'left' ) {
						$( ".videoHolder, .mwPlayerContainer" ).css( "width", this.$mediaListContainer.width() - this.getConfig( "mediaItemWidth" ) + "px" );
						this.videoWidth = (this.$mediaListContainer.width() - this.getConfig( "mediaItemWidth" ));
					}
					if ( this.getConfig( 'containerPosition' ) == 'left' ) {
						$( ".mwPlayerContainer" ).css( {"margin-left": this.getConfig( "mediaItemWidth" ) + "px", "float": "right"} );
					}

					if ( this.getConfig( 'containerPosition' ) == 'top' || this.getConfig( 'containerPosition' ) == 'bottom' ) {
						var playlistHeight = this.getLayout() === "vertical" ? this.getConfig( "mediaItemHeight" ) * 2 : this.getConfig( "mediaItemHeight" ) + 20;
						$( ".mwPlayerContainer" ).css( "height", this.$mediaListContainer.height() - playlistHeight + "px" );
						$( ".videoHolder" ).css( "height", this.$mediaListContainer.height() - playlistHeight - $( ".controlBarContainer" ).height() + "px" );
					}
				}
			}
			return this.$mediaListContainer;
		},

		// set the size of the playlist container and the video
		setMedialistContainerSize: function(){
			if (!this.getConfig('onPage')) {
				// resize the video to make place for the playlist according to its position (left, top, right, bottom)
				if ( this.getConfig( 'containerPosition' ) == 'right' || this.getConfig( 'containerPosition' ) == 'left' ) {
					this.getComponent().width( this.getConfig( "mediaItemWidth" ) );
					this.getComponent().height( "100%" );
					this.getComponent().css( "position", "absolute" );
				}
				if ( this.getConfig( 'containerPosition' ) == 'right' ) {
					this.getComponent().css( "right", "0px" );
					$( ".mwPlayerContainer" ).css( "float", "left" );
				}
				if ( this.getConfig( 'containerPosition' ) == 'top' || this.getConfig( 'containerPosition' ) == 'bottom' ) {
					this.getComponent().height( this.getConfig( "mediaItemHeight" ) * 2 - 2 );
					this.getComponent().css( "display", "block" );
				}
			}
			if (this.getLayout() === "horizontal" ){
				this.getComponent().find("ul").width(this.getConfig("mediaItemWidth")*this.mediaList.length).height(this.getConfig("mediaItemHeight")+18);
				this.getComponent().find("span").height(this.getConfig("mediaItemHeight")+18);
			}
		},

		getMediaListDomElements: function(){
			return this.getComponent().find(".chapterBox");
		},

		destroy: function(){
			this.unbind();
			this.getComponent.empty();
		},

		//General
		getLayout: function(){
			return  this.getConfig( 'layout' ) || 'horizontal';
		},

		getTemplateData: function(){
			return this.mediaList;
		},

		getMetaData: function(){
			return {
				includeThumbnail: this.getConfig('includeThumbnail'),
				includeItemStartTime: this.getConfig('includeItemStartTime'),
				includeItemNumberPattern: this.getConfig('includeItemNumberPattern'),
				includeMediaItemDuration:this.getConfig('includeMediaItemDuration'),
				titleLimit: this.getConfig('titleLimit'),
				descLimit: this.getConfig('descriptionLimit'),
				layout: this.getLayout()
			}
		},
		//Media Item
		renderMediaList: function(){
			//Generate new list template data
			var medialist = this.getTemplateHTML( {meta: this.getMetaData(), mediaList: this.getTemplateData()});
			//Only render if medialist item are present
			if (this.getTemplateData().length > 0) {
				//Clear previous list
				this.getComponent().empty();
				this.getComponent().append( medialist );

				if ( this.getLayout() === "horizontal" ) {
					this.getMediaListDomElements().width( this.getConfig( "mediaItemWidth" ) );
				}

				this.setMedialistContainerSize();
				this.attachMediaListHandlers();
				this.shouldAddScroll( );
				$( this.embedPlayer ).trigger( "mediaListLayoutReady" );
			}
		},

		onDisable: function(){
			this.isDisabled = true;
			var mediaBoxes = this.getMediaListDomElements();
			mediaBoxes.addClass("disabled");
			mediaBoxes.find("*").addClass("disabled");
		},

		onEnable: function(){
			this.isDisabled = false;
			var mediaBoxes = this.getMediaListDomElements();
			mediaBoxes.removeClass("disabled");
			mediaBoxes.find("*").removeClass("disabled");
		},

		getItemNumber: function(index){
			var itemVal = ( index + 1 ).toString();
			if( typeof this.getConfig('includeItemNumberPattern' ) == 'string' ){
				itemVal =  this.getConfig('includeItemNumberPattern' ).replace( '$1', itemVal );
			}
			// replace spaces with '&nbsp;'
			itemVal = itemVal.replace(/\s/g, '&nbsp;' );
			return itemVal;
		},
		getMediaItemById: function(id){
			var mediaItem = null;
			mediaItem = $.grep(this.mediaList, function(mediaItem){
				return (mediaItem.id == id);
			});
			return mediaItem;
		},
		getThumbUrl: function(item) {
			var time = item.thumbOffset || item.startTime;
			var thumbUrl = kWidget.getKalturaThumbUrl(
				$.extend( {}, this.baseThumbSettings, {
					'vid_sec': parseInt( time / 1000 )
				} )
			);
			return thumbUrl;
		},
		getThumbWidth: function(){
			return parseInt( this.getConfig( 'thumbnailWidth' ) ) ;
		},
		getThumbHeight: function(){
			var nativeAspect =  this.getPlayer().getHeight() / this.getPlayer().getWidth();
			var thumbWidth = this.getThumbWidth();
			var thumbHeight = parseInt( thumbWidth * nativeAspect );
			return thumbWidth * 3 / 4;
		},
		getThumRotatorUrl: function(){
			var _this = this;
			var imageSlicesUrl = kWidget.getKalturaThumbUrl(
				$.extend( {}, this.baseThumbSettings, {
					'vid_slices': _this.getSliceCount()
				})
			);
			// preload the image slices:
			(new Image()).src = imageSlicesUrl;

			return imageSlicesUrl;
		},

		//UI Handlers
		shouldAddScroll: function(handler){
			if( this.checkAddScroll() ){
				this.addScroll();
			} else{
				if (!this.getConfig('containerPosition')){
					var largestBoxHeight = 0;
					var mediaBoxes = this.getMediaListDomElements();
					mediaBoxes.each( function ( inx, box ) {
						var pad = parseInt( $( box ).css( 'padding-top' ) ) + parseInt( $( box ).css( 'padding-bottom' ) );
						if ( $( box ).height() + pad > largestBoxHeight ) {
							largestBoxHeight = $( box ).height() + pad;
						}
					} );
					mediaBoxes.css( 'height', largestBoxHeight );
					if ( this.getLayout() == 'vertical' ) {
						// give the box a height:
						this.getComponent().css( 'height',
								mediaBoxes.length * largestBoxHeight
						)
					}
				}
			}
		},
		attachMediaListHandlers: function(){
			var _this = this;
			var hoverInterval = null;
			var mediaBoxes = this.getMediaListDomElements();
			mediaBoxes
				.off('click' )
				.on('click', function(){
					if ( !_this.isDisabled ){
						// set active media item
						var index = $(this).data( 'chapterIndex' );
						// Check if the current chapter is already active, set skipPause flag accordingly.
						_this.skipPauseFlag = !$( this ).hasClass( 'active');
						// call mediaClicked with the media index (implemented in component level)
						_this.mediaClicked(index);
					}
				});
			if (this.getConfig('thumbnailRotator')) {
				mediaBoxes
					.off( 'mouseenter mouseleave', '.k-thumb' )
					.on( {
						mouseenter: function () {
							var index = $( this ).data( 'chapterIndex' );
							var item = _this.mediaList[index];
							// update base css:

							$( this ).css( {
								'width': item.thumbnail.width,
								'height': item.thumbnail.height,
								'background-image': 'url(\'' + item.thumbnail.rotatorUrl + '\')',
								'background-position': _this.getThumbSpriteOffset( item.thumbnail.width, ( item.startTime ) ),
								// fix aspect ratio on bad Kaltura API returns
								'background-size': ( item.thumbnail.width * _this.getSliceCount() ) + 'px 100%'
							} );

							var startTime = item.startTime;
							var endTime = item.endTime;
							// on hover sequence thumbs in range
							var stepInx = _this.getSliceIndexForTime( startTime );
							var imageDiv = $( this );
							var doStepIndex = function () {
								// update background-position' per current step index:
								imageDiv.css( 'background-position', -( stepInx * item.thumbnail.width ) + 'px 0px' );
								stepInx++;
								if ( stepInx >= _this.getSliceIndexForTime( endTime ) ) {
									stepInx = _this.getSliceIndexForTime( startTime );
								}
							};
							hoverInterval = setInterval( doStepIndex, 500 );
							doStepIndex();
						},
						mouseleave: function () {
							clearInterval( hoverInterval );
							// retore to orginal image:
							var index = $( this ).data( 'chapterIndex' );
							var item = _this.mediaList[index];
							$( this )
								.css( {
									'background-repeat': 'no-repeat',
									'background-position': 'center',
									'background-size': 'auto 100%'
								} )
								.css( {
									'background-image': 'url(\'' + item.thumbnail.url + '\')'
								} );
						}
					}, ".k-thumb" );
			}
		},

		mediaClicked: function(){
			// should be implemented by component;
		},

		setSelectedMedia: function(mediaIndex){
			var mediaBoxes = this.getMediaListDomElements();
			mediaBoxes.removeClass( 'active');
			this.selectedMediaItemIndex = mediaIndex;
			$( mediaBoxes[mediaIndex] ).addClass( 'active'); //li[data-chapter-index='" + activeIndex + "']
			if (!this.getConfig('overflow')) {
				this.getComponent().find( '.k-carousel' )[0].jCarouselLiteGo( mediaIndex );
			}
		},
		getActiveItem: function(){
			return this.getComponent().find( "li[data-chapter-index='" + this.selectedMediaItemIndex + "']" );
		},
		updateActiveItemDuration: function(duration){
			this.getActiveItem().find('.k-duration span').text(
				kWidget.seconds2npt( duration )
			);
		},
		getThumbSpriteOffset: function( thumbWidth, time ){
			var sliceIndex = this.getSliceIndexForTime( time );
			return - ( sliceIndex * thumbWidth ) + 'px 0px';
		},
		getSliceCount: function(){
			var duration = this.getPlayer().getDuration();
			if( duration < this.getConfig('oneSecRotatorSlidesLimit') ){
				return Math.round( duration ); // every second
			}
			if( duration < this.getConfig('twoSecRotatorSlidesLimit') ){
				return Math.round( duration / 2 ); // every 2 seconds
			}
			// max slice count 125
			return this.getConfig('maxRotatorSlides');
		},
		getSliceIndexForTime: function( time ){
			var sliceCount = this.getSliceCount();
			var perc = time / this.getPlayer().getDuration();
			var sliceIndex = Math.ceil( sliceCount * perc );
			return sliceIndex;
		},
		addScroll: function(){
			this.addScrollUiComponents();
			this.initScroll();
			// sort ul elements:
			/*$cc.find('.chapterBox').map(function(a, b){
			 return $(a).data('index') > $(b).data('index') ? 1 : -1;
			 });*/
			// start at clip zero ( should be default )
			//$cc.find('.k-carousel')[0].jCarouselLiteGo( 0 );
		},
		initScroll: function(){
			var _this = this;
			var $cc = this.getComponent();
			var mediaBoxes = this.getMediaListDomElements();
			var mediaItemVisible = this.calculateVisibleScrollItems();
			var dimensions = this.getLargestBoxDimensions();
			if( this.getLayout() == 'horizontal' ){
				// set container height if horizontal
				$cc.css( 'height', dimensions.largetsBoxHeight );
			}
			var isVertical = ( _this.getLayout() == 'vertical' );

			// Add scrolling carousel to clip list ( once dom sizes are up-to-date )
			$cc.find('.k-carousel').jCarouselLite({
				btnNext: /*'.k-player-' + this.getPlayer().id +*/' .k-next',
				btnPrev: /*'.k-player-' + this.getPlayer().id +*/' .k-prev',
				visible: mediaItemVisible,
				mouseWheel: true,
				circular: false,
				vertical: isVertical,
				start: 0,
				scroll: 1
			});

			// make sure vertical height matches target:
			if( this.getLayout() == 'vertical' ){
				$cc.find('.k-carousel').css('height', $cc.height() )
			}

			// give more height if needed
			if( this.getLayout() == 'horizontal' ){
				// fit to container:
				$cc.find('.k-carousel').css('width', $cc.width() )
				// set width to horizontalMediaItemWidth

				mediaBoxes.css( 'width', this.getMediaItemBoxWidth() );
				//set to auto to discover height:
				mediaBoxes.css('height', 'auto');
				var largetsBoxHeight = 0;
				mediaBoxes.each( function(inx, box){
					if( $(box).height() > largetsBoxHeight ){
						largetsBoxHeight = $(box).height() + (
							parseInt( $(box).css('padding-top') ) + parseInt( $(box).css( 'padding-bottom') )
							)
					}
				});
				$cc.css( 'height', largetsBoxHeight );
				mediaBoxes.css( 'height', largetsBoxHeight );

				var totalWidth = 0;
				mediaBoxes.each( function(inx, box){
					totalWidth+= $(box).width() + parseInt( $(box).css('padding-left') ) +
						parseInt( $(box).css('padding-right') )
				});
				$cc.find('ul').css( 'width', totalWidth );
			}
		},
		getMediaItemBoxWidth: function(){
			return this.getConfig('horizontalMediaItemWidth') || 290;
		},
		addScrollUiComponents: function(){
			var $cc = this.getComponent();
			$cc.find('ul').wrap(
				$( '<div>' ).addClass('k-carousel')
			);
			// Add scroll buttons
			$cc.find('.k-carousel').before(
				$( '<a />' )
					.addClass( "k-scroll k-prev" )
			);
			$cc.find('.k-carousel').after(
				$( '<a />' )
					.addClass( "k-scroll k-next" )
			);

			// Add media item hover to hide show play buttons:
			var inKBtn = false;
			var inContainer = false;
			var checkHideBtn = function(){
				setTimeout(function(){
					if( !inKBtn && !inContainer ){
						$cc.find('.k-prev,.k-next').animate({'opacity':0});
					}
				},0)
			}
			var showBtn = function(){
				$cc.find('.k-prev,.k-next').animate({'opacity':1});
			}
			// check for knext
			$cc.find('.k-prev,.k-next')
				.hover(function(){
					showBtn();
					inKBtn = true;
				},function(){
					inKBtn = false;
					checkHideBtn();
				})
			$cc.find('.k-carousel').hover( function(){
				showBtn();
				inContainer = true;
			}, function(){
				inContainer = false;
				checkHideBtn();
			})
			// hide the arrows to start with ( with an animation so users know they are there )
			$cc.find('.k-prev,.k-next').animate({'opacity':0});
		},
		calculateVisibleScrollItems: function(){
			var $cc = this.getComponent();

			var mediaItemVisible = 3;

			// Get rough estimates for number of media items visible.
			var dimensions = this.getLargestBoxDimensions();
			var largestBoxWidth = dimensions.largestBoxWidth;
			var largestBoxHeight = dimensions.largestBoxHeight;

			if( this.getLayout() == 'horizontal' ){
				// set container height if horizontal
				$cc.css( 'height', largestBoxHeight );
				// calculate number of visible media items
				mediaItemVisible = Math.floor( $cc.find( '.k-carousel' ).width() / largestBoxWidth );
			} else {
				// calculate number of visible for vertical media items
				mediaItemVisible = Math.floor( $cc.height() / largestBoxHeight );
			}
			// don't show more media items then we have available:
			if( mediaItemVisible >  this.mediaList.length ){
				mediaItemVisible = this.mediaList.length
			}

			return mediaItemVisible;
		},
		getLargestBoxDimensions: function(){
			// Get rough estimates for number of media items visible.
			var largestBoxWidth = 0;
			var largestBoxHeight = 0;
			this.getMediaListDomElements().each( function(inx, box){
				if( $( box ).width() > largestBoxWidth ){
					largestBoxWidth = $( box ).width()
				}
				if( $(box).height() > largestBoxHeight ){
					largestBoxHeight = $(box).height() + (
						parseInt( $(box).css('padding-top') ) + parseInt( $(box).css( 'padding-bottom') )
						);
				}
			});

			return {largestBoxWidth: largestBoxWidth, largestBoxHeight: largestBoxHeight}
		},
		checkAddScroll: function(){
			if( ! this.getConfig('overflow') && this.mediaList.length ){
				return true;
			}
			// for horizontal layouts fix to parent size fitting in area:
			if( this.getLayout() == 'horizontal' ){
				var totalWidth = this.getMediaItemBoxWidth()
					* this.mediaList.length;
				// Check if width is 100%, add boxes > than width
				if( this.getComponent().width() <  totalWidth ){
					return true;
				}
			}
			return false;
		}

	});

} )( window.mw, window.jQuery );