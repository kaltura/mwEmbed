( function( mw, $ ) {"use strict";

	/**
	 * Base screen component that allow to show overlay on top of the player
	 **/

	mw.KBaseMediaList = mw.KBaseComponent.extend({

		mediaList: [],
		isDisabled: true,

		getBaseConfig: function(){
			var parentConfig = this._super();
			return $.extend({}, parentConfig, {
				'templatePath': 'components/mediaList/mediaList.tmpl.html',
				'oneSecRotatorSlidesLimit': 61,
				'twoSecRotatorSlidesLimit': 250,
				'maxRotatorSlides': 125,
				'mediaItemWidth': 290,
				'titleLimit': 25,
				'descriptionLimit': 70,
				'thumbnailWidth' : 50,
				'horizontalMediaItemWidth': 290,
				'overflow': false,
				'includeThumbnail': true,
				'includeItemStartTime': true,
				'includeItemNumberPattern': false,
				'includeMediaItemDuration': true,
				'layout': 'vertical'
			});
		},

		setDefaults: function(){
			var baseThumbSettings = {
				'partner_id': this.getPlayer().kpartnerid,
				'uiconf_id': this.getPlayer().kuiconfid,
				'entry_id': this.getPlayer().kentryid,
				'width': this.getConfig( "thumbWidth" )
			};
			this._super( {"baseThumbSettings": baseThumbSettings} );
		},

		_addBindings: function () {
			var _this = this;
			this._super()
			this.bind( 'playerReady', function ( e, newState ) {
				if (_this.dataIntialized) {
					_this.updateActiveItem();
				}
			});
		},



		/*
		 setup: function ( embedPlayer ) {

		 if (this.getConfig('containerPosition')){
		 this.getListContainer();
		 }
		 this.addBindings();
		 },
		 */
		getComponent: function(){
			if( ! this.$el ){
				this.$el = $( '<div />' )
					.addClass(this.pluginName + " mediaList k-chapters-container k-" + this.getLayout() /*+ this.getCssClass()*/);
			}
			return this.$el;
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
		getListContainer: function(){
			// remove any existing k-chapters-container for this player
			$('.k-player-' + this.getPlayer().id + '.k-chapters-container').remove();
			// Build new media list container
			var $mediaListContainer = this.$mediaListContainer = $('<div>').addClass( 'k-player-' + this.getPlayer().id + ' k-chapters-container');
			// check for where it should be appended:
			var targetRef = $('#'+this.getPlayer().id, parent.document.body );//$( this.getPlayer().getInterface() );
			switch( this.getConfig('containerPosition') ){
				case 'before':
					$mediaListContainer.css('clear', 'both');
					targetRef
						.css( 'float', 'left')
						.before( $mediaListContainer );
					break;
				case 'left':
					$mediaListContainer.css('float', 'left').insertBefore( targetRef );
					$( this.getPlayer() ).css('float', 'left');
					break;
				case 'right':
					$mediaListContainer.css('float', 'left').insertAfter( targetRef );
					$( targetRef ).css('float', 'left' );
					break;
				case 'after':
				default:
					targetRef
						.css( 'float', 'none')
						.after( $mediaListContainer );
					break;
			};
			// set size based on layout
			// set sizes:
			if( this.getConfig('overflow') != true ){
				$mediaListContainer.css('width', targetRef.width() )
				if( this.getLayout() == 'vertical' ){
					$mediaListContainer.css( 'height', targetRef.height() )
				}
			} else {
				if( this.getLayout() == 'horizontal' ){
					$mediaListContainer.css('width', '100%' );
				} else if( this.getLayout() == 'vertical' ){
					$mediaListContainer.css( 'width', targetRef.width() );
				}
			}
			// special conditional for vertical media list width
			if(
				this.getLayout() == 'vertical'
					&&
					this.getConfig('horizontalMediaItemWidth')
					&&
					(
						this.getConfig('containerPosition') == 'right'
							||
							this.getConfig('containerPosition') == 'left'
						)
				){
				$mediaListContainer.css('width', this.getConfig('horizontalMediaItemWidth') );
			}
			return $mediaListContainer;
		},

		//Media Item
		setMediaList: function(items){
			var _this = this;
			this.mediaList = [];
			$.each(items, function(i, item){
				var customData = item.partnerData ? JSON.parse(item.partnerData) :  {};
				var title = item.name || customData.title;
				var description = item.description || customData.desc;
				var thumbnailUrl = item.thumbnailUrl || customData.thumbUrl || _this.getThumbUrl(item);
				var thumbnailRotatorUrl = _this.getConfig( 'thumbnailRotator' ) ? _this.getThumRotatorUrl() : ''
				item.order = i;
				item.title = title;
				item.description = description;
				item.width = _this.getConfig( 'mediaItemWidth' );
				item.durationDisplay = item.duration;
				item.thumbnail = {
					url: item.thumbnailUrl,
					thumbAssetId: item.assetId,
					rotatorUrl: thumbnailRotatorUrl,
					width: _this.getThumbWidth(),
					height: _this.getThumbHeight()
				};
				item.itemNumber = _this.getItemNumber(i);
				_this.mediaList.push(item);
			});

			if (this.getConfig('containerPosition')){
				this.getListContainer();
			}
			//Need to recalc all durations after we have all the items startTime values
			//_this.setMediaItemTime();

			_this.getComponent().append(
				_this.getTemplateHTML( {meta: _this.getMetaData(), mediaList: _this.getTemplateData()})
			);

			if (_this.getConfig('containerPosition')) {
				_this.$mediaListContainer.append(_this.getTemplateHTML( {meta: _this.getMetaData(), mediaList: _this.getTemplateData()} ));
			}
			_this.dataIntialized = true;
			_this.shouldAddScroll(_this.addScroll);
		},

		addMediaItem: function(obj ,index){
			var mediaItem;
			var customData = obj.partnerData ? JSON.parse(obj.partnerData) :  {};
			var title = obj.title || customData.title;
			var description = obj.description || customData.desc;
			var thumbnailUrl = obj.thumbnailUrl || customData.thumbUrl || this.getThumbUrl(obj);
			var thumbnailRotatorUrl = this.getConfig( 'thumbnailRotator' ) ? this.getThumRotatorUrl() : '';

			mediaItem = {
				order: index,
				id: obj.id,
				title: title,
				description: description,
				width: this.getConfig( 'mediaItemWidth' ),
				thumbnail: {
					url: thumbnailUrl,
					thumbAssetId: obj.assetId,
					rotatorUrl: thumbnailRotatorUrl,
					width: this.getThumbWidth(),
					height: this.getThumbHeight()
				},
				startTime: obj.startTime / 1000,
				startTimeDisplay: this.formatTimeDisplayValue(kWidget.seconds2npt( obj.startTime / 1000 )),
				endTime: null,
				durationDisplay: null,
				itemNumber: this.getItemNumber(index)

			}
			this.mediaList.push(mediaItem);
		},
		setMediaItemTime: function(){
			var _this = this;
			$.each(this.mediaList, function(index, item){
				if (_this.mediaList[index + 1]){
					item.endTime = _this.mediaList[index + 1].startTime;
				} else {
					item.endTime = _this.getPlayer().duration;
				}

				item.durationDisplay = kWidget.seconds2npt((item.endTime - item.startTime) );
			});
		},
		formatTimeDisplayValue: function(time){
			// Add 0 padding to start time min
			var timeParts = time.split(':');
			if( timeParts.length == 2 && timeParts[0].length == 1 ) {
				time = '0' + time;
			}
			return time;
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
			var entry = this.getPlayer().getHeight();
			var nativeAspect =  this.getPlayer().getHeight() / this.getPlayer().getWidth();
			var thumbWidth = this.getThumbWidth();
			var thumbHeight = parseInt( thumbWidth * nativeAspect );
			return thumbHeight;
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
			this.attachMediaListHandlers();
			if( this.checkAddScroll() ){
				handler.apply(this);
			} else{
				var largestBoxHeight = 0;
				this.getComponent().find('.chapterBox').each( function(inx, box){
					var pad =parseInt( $(box).css('padding-top') ) + parseInt( $(box).css( 'padding-bottom') );
					if( $(box).height() + pad > largestBoxHeight ){
						largestBoxHeight = $(box).height() + pad;
					}
				});
				this.getComponent().find('.chapterBox').css( 'height', largestBoxHeight );
				if( this.getLayout() == 'vertical' ){
					// give the box a height:
					this.getComponent().css('height',
						this.getComponent().find('.chapterBox').length * largestBoxHeight
					)
				}
			}
		},
		attachMediaListHandlers: function(){
			var _this = this;
			var hoverInterval = null;
			var chapterBox = this.getComponent().find('.chapterBox');
			chapterBox
				.off('click' )
				.on('click', function(){
					var index = $(this).data( 'mediaItemIndex' );
					// Check if the current media item is already active, set skipPause flag accordingly.
					_this.skipPauseFlag = !$( this ).hasClass( 'active');
					// start playback
					_this.getPlayer().sendNotification( 'doPlay' );
					// see to start time and play ( +.1 to avoid highlight of prev media item )
					_this.getPlayer().sendNotification( 'doSeek', ( _this.mediaList[index].startTime ) + .1 );
				});
			if (this.getConfig('thumbnailRotator')) {
				chapterBox
					.off( 'mouseenter mouseleave', '.k-thumb' )
					.on( {
						mouseenter: function () {
							var index = $( this ).data( 'mediaItemIndex' );
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
							var index = $( this ).data( 'mediaItemIndex' );
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

				$cc.find('.chapterBox').css( 'width', this.getMediaItemBoxWidth() );
				//set to auto to discover height:
				$cc.find('.chapterBox').css('height', 'auto');
				var largetsBoxHeight = 0;
				$cc.find('.chapterBox').each( function(inx, box){
					if( $(box).height() > largetsBoxHeight ){
						largetsBoxHeight = $(box).height() + (
							parseInt( $(box).css('padding-top') ) + parseInt( $(box).css( 'padding-bottom') )
							)
					}
				});
				$cc.css( 'height', largetsBoxHeight )
					.find( '.chapterBox' ).css( 'height', largetsBoxHeight )

				var totalWidth = 0;
				$cc.find('.chapterBox').each( function(inx, box){
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
			var $cc = this.getComponent();
			// Get rough estimates for number of media items visible.
			var largestBoxWidth = 0;
			var largestBoxHeight = 0;
			$cc.find('.chapterBox').each( function(inx, box){
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
		},
		updateActiveItem: function( ){
			var _this = this;
			// search media items for current active
			var activeIndex = 0;
			var time = this.getPlayer().currentTime;
			$.each( this.mediaList, function( inx, item){
				if( time > ( item.startTime ) ){
					activeIndex = inx;
				}
			});
			var $activeMediaItem =  this.getComponent().find( '.active' );
			var actualActiveIndex = $activeMediaItem.data( 'mediaItemIndex' );
			// Check if active is not already set:
			if( actualActiveIndex == activeIndex ){
				// update duration count down:
				var item = this.mediaList[ activeIndex ];
				if( item ){
					$activeMediaItem.addClass('active');
					item.active = true;
					var endTime = item.endTime;
					var countDown =  Math.abs( time - endTime );
					$activeMediaItem.find('.k-duration span').text(
						kWidget.seconds2npt( countDown )
					);
				}
			} else {
				var item = _this.mediaList[ actualActiveIndex ];
				if ( item ) {
					item.active = false;
					var startTime = item.startTime ;
					var endTime = item.endTime;
					$activeMediaItem
						.removeClass( 'active' )
						.find( '.k-duration span' ).text(
							kWidget.seconds2npt( endTime - startTime )
						)
				}

				// Check if we should pause on chapter update:
				if ( this.getConfig( 'pauseAfterChapter' ) && !this.skipPauseFlag ) {
					this.getPlayer().sendNotification( 'doPause' );
				}
				// restore skip pause flag:
				this.skipPauseFlag = false;

				if ( this.mediaList[ activeIndex ] ) {
					this.getComponent().find( "li[data-chapter-index='" + activeIndex + "']" ).addClass( 'active' );
					this.getComponent().find( '.k-carousel' )[0].jCarouselLiteGo( activeIndex );
				}
			}
		}

	});

} )( window.mw, window.jQuery );