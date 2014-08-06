(function ( mw, $ ) {
	"use strict";

	mw.PluginManager.add( 'mediaList', mw.KBaseComponent.extend( {

			defaultConfig: {
				'parent': 'sideBarContainer',
				'containerPosition': null,//'after',
				'order': 2,
				'showTooltip': false,
				"displayImportance": 'high',
				'templatePath': 'components/mediaList/mediaList.tmpl.html',
				'cuePointType': ['thumbCuePoint.Thumb'],
				'oneSecRotatorSlidesLimit': 61,
				'twoSecRotatorSlidesLimit': 250,
				'maxRotatorSlides': 125,
				'mediaItemWidth': 290,
				'titleLimit': 25,
				'descriptionLimit': 70,
				'thumbnailWidth' : 100,
				'horizontalChapterBoxWidth': 290,
				'overflow': false,
				'includeThumbnail': true,
				'includeChapterStartTime': true,
				'includeChapterNumberPattern': false,
				'includeChapterDuration': true
			},
			mediaList: [],

			isDisabled: true,

			setup: function ( embedPlayer ) {
				this.baseThumbSettings = {
					'partner_id': this.getPlayer().kpartnerid,
					'uiconf_id': this.getPlayer().kuiconfid,
					'entry_id': this.getPlayer().kentryid,
					'width': this.getConfig( "thumbWidth" )
				};
				if (this.getConfig('containerPosition')){
					this.getListContainer();
				}
				this.addBindings();
			},
			addBindings: function () {
				var _this = this;

				this.bind( 'KalturaSupport_ThumbCuePointsReady', function () {
					_this.mediaList.meta = {};
					//Init data provider
					var cuePoints = _this.getPlayer().kCuePoints.getCuePoints();
					//Generate data transfer object
					var filteredCuePoints = $.grep(cuePoints, function(cuePoint){
						var found = false;
						$.each(_this.getConfig('cuePointType'), function(i, cuePointType){
							if (cuePointType == cuePoint.cuePointType) {
								found = true;
								return false;
							}
						});
						return found;
					});

					filteredCuePoints.sort( function ( a, b ) {
						return a.startTime - b.startTime;
					} );

					$.each(filteredCuePoints, function(i, filteredCuePoint){
						_this.addMediaItem(filteredCuePoint, i);
					});

					//Need to recalc all durations after we have all the items startTime values
					_this.setMediaItemTime();

					_this.getComponent().append(
						_this.getTemplateHTML( {meta: _this.getMetaData(), mediaList: _this.getTemplateData()})
					);

					if (_this.getConfig('containerPosition')) {
						_this.$chaptersContainer.append(_this.getTemplateHTML( {meta: _this.getMetaData(), mediaList: _this.getTemplateData()} ));
					}
					_this.dataIntialized = true;
					_this.shouldAddScroll(_this.addScroll);
				} );

				this.bind( 'playerReady', function ( e, newState ) {
					if (_this.dataIntialized) {
						_this.updateActiveItem();
					}
				});

				this.bind('updateLayout', function(){
					if (_this.dataIntialized) {
						_this.getComponent().empty().append(
							_this.getTemplateHTML( {meta: _this.getMetaData(), mediaList: _this.getTemplateData()})
						);
						_this.shouldAddScroll(_this.addScroll);
						//_this.shouldAddScroll(_this.initScroll);
					}
				});

				this.bind( 'onChangeMedia', function(){
					_this.destroy();
					// redraw the list
					_this.shouldAddScroll(_this.addScroll);
				});

				this.bind('updatePlayHeadPercent', function( ct ){
					if (_this.dataIntialized) {
						_this.updateActiveItem();
					}
				});
			},
			isSafeEnviornment: function(){
				var _this = this;
				var res = false;
				if (this.getPlayer().kCuePoints){
					var cuePoints = this.getPlayer().kCuePoints.getCuePoints();
					var filteredCuePoints = $.grep(cuePoints, function(cuePoint){
						var found = false;
						$.each(_this.getConfig('cuePointType'), function(i, cuePointType){
							if (cuePointType == cuePoint.cuePointType) {
								found = true;
								return false;
							}
						});
						return found;
					});
					res =  (filteredCuePoints.length > 0) ? true : false;
				}
				return res;
			},
			getComponent: function(){
				if( ! this.$el ){
					this.$el = $( '<div />' )
						.addClass(this.pluginName + " k-chapters-container k-" + this.getLayout() /*+ this.getCssClass()*/);
						/*.append(
							this.getTemplateHTML( {meta: this.getMetaData(), mediaList: this.getTemplateData()})
					);*/
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
					includeChapterStartTime: this.getConfig('includeChapterStartTime'),
					includeChapterNumberPattern: this.getConfig('includeChapterNumberPattern'),
					includeChapterDuration:this.getConfig('includeChapterDuration'),
					titleLimit: this.getConfig('titleLimit'),
					descLimit: this.getConfig('descriptionLimit'),
					layout: this.getLayout()
				}
			},
			getListContainer: function(){
				// remove any existing k-chapters-container for this player
				$('.k-player-' + this.getPlayer().id + '.k-chapters-container').remove();
				// Build new chapters container
				var $chaptersContainer = this.$chaptersContainer = $('<div>').addClass( 'k-player-' + this.getPlayer().id + ' k-chapters-container');
				// check for where it should be appended:
				var targetRef = $('#'+this.getPlayer().id, parent.document.body );//$( this.getPlayer().getInterface() );
				switch( this.getConfig('containerPosition') ){
					case 'before':
						$chaptersContainer.css('clear', 'both');
						targetRef
							.css( 'float', 'left')
							.before( $chaptersContainer );
						break;
					case 'left':
						$chaptersContainer.css('float', 'left').insertBefore( targetRef );
						$( this.getPlayer() ).css('float', 'left');
						break;
					case 'right':
						$chaptersContainer.css('float', 'left').insertAfter( targetRef );
						$( targetRef ).css('float', 'left' );
						break;
					case 'after':
					default:
						targetRef
							.css( 'float', 'none')
							.after( $chaptersContainer );
						break;
				};
				// set size based on layout
				// set sizes:
				if( this.getConfig('overflow') != true ){
					$chaptersContainer.css('width', targetRef.width() )
					if( this.getLayout() == 'vertical' ){
						$chaptersContainer.css( 'height', targetRef.height() )
					}
				} else {
					if( this.getLayout() == 'horizontal' ){
						$chaptersContainer.css('width', '100%' );
					} else if( this.getLayout() == 'vertical' ){
						$chaptersContainer.css( 'width', targetRef.width() );
					}
				}
				// special conditional for vertical chapter width
				if(
					this.getLayout() == 'vertical'
					&&
					this.getConfig('horizontalChapterBoxWidth')
					&&
					(
						this.getConfig('containerPosition') == 'right'
						||
						this.getConfig('containerPosition') == 'left'
						)
					){
					$chaptersContainer.css('width', this.getConfig('horizontalChapterBoxWidth') );
				}
				return $chaptersContainer;
			},
			//Media Item
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
					chapterNumber: this.getItemNumber(index)

				}
				this.mediaList.push(mediaItem);
			},
			getMediaItemThumbs: function(callback){
				var _this = this;
				var requestArray = [];
				var response = [];
				$.each(this.mediaList, function(index, item) {
					requestArray.push(
						{
							'service': 'thumbAsset',
							'action': 'getUrl',
							'id': item.thumbnail.thumbAssetId
						}
					);
					response[index] = { id: item.id, url: null};
				});

				// do the api request
				this.getKalturaClient().doRequest( requestArray, function ( data ) {
					// Validate result
					if ( !_this.isValidResult( data ) ) {
						return;
					}
					$.each(data, function(index, url) {
						response[index]['url'] = url;

					});
					callback.apply(_this, [response]);
				} );
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
				var chapterVal = ( index + 1 ).toString();
				if( typeof this.getConfig('includeChapterNumberPattern' ) == 'string' ){
					chapterVal =  this.getConfig('includeChapterNumberPattern' ).replace( '$1', chapterVal );
				}
				// replace spaces with '&nbsp;'
				chapterVal = chapterVal.replace(/\s/g, '&nbsp;' );
				return chapterVal;
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
			isValidResult: function( data ){
				// Check if we got error
				if( !data
					||
					( data.code && data.message )
					){
					//this.log('Error getting related items: ' + data.message);
					//this.getBtn().hide();
					this.error = true;
					return false;
				}
				this.error = false;
				return true;
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
				this.attachChapterBoxHandlers();
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
			attachChapterBoxHandlers: function(){
				var _this = this;
				var hoverInterval = null;
				var chapterBox = this.getComponent().find('.chapterBox');
				chapterBox
					.off('click' )
					.on('click', function(){
						var index = $(this).data( 'chapterIndex' );
						// Check if the current chapter is already active, set skipPause flag accordingly.
						_this.skipPauseFlag = !$( this ).hasClass( 'active');
						// start playback
						_this.getPlayer().sendNotification( 'doPlay' );
						// see to start time and play ( +.1 to avoid highlight of prev chapter )
						_this.getPlayer().sendNotification( 'doSeek', ( _this.mediaList[index].startTime ) + .1 );
					});
				if (this.getConfig('thumbnailRotator')) {
					chapterBox
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
				var chaptersVisible = this.calculateVisibleScrollItems();
				var dimensions = this.getLargestBoxDimensions();
				if( this.getLayout() == 'horizontal' ){
					// set container height if horizontal
					$cc.css( 'height', dimensions.largetsBoxHeight );
				}

				// Add scrolling carousel to clip list ( once dom sizes are up-to-date )
				$cc.find('.k-carousel').jCarouselLite({
					btnNext: /*'.k-player-' + this.getPlayer().id +*/' .k-next',
					btnPrev: /*'.k-player-' + this.getPlayer().id +*/' .k-prev',
					visible: chaptersVisible,
					mouseWheel: true,
					circular: false,
					vertical: ( this.getLayout() == 'vertical' ),
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
					// set width to horizontalChapterBoxWidth
					$cc.find('.chapterBox').css( 'width', this.getChapterBoxWidth() );
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

				// Add chapter hover to hide show play buttons:
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

				var chaptersVisible = 3;

				// Get rough estimates for number of chapter visible.
				var dimensions = this.getLargestBoxDimensions();
				var largestBoxWidth = dimensions.largestBoxWidth;
				var largestBoxHeight = dimensions.largestBoxHeight;

				if( this.getLayout() == 'horizontal' ){
					// set container height if horizontal
					$cc.css( 'height', largestBoxHeight );
					// calculate number of visible chapters
					chaptersVisible = Math.floor( $cc.find( '.k-carousel' ).width() / largestBoxWidth );
				} else {
					// calculate number of visible for vertical chapters
					chaptersVisible = Math.floor( $cc.height() / largestBoxHeight );
				}
				// don't show more chapters then we have available:
				if( chaptersVisible >  this.mediaList.length ){
					chaptersVisible = this.mediaList.length
				}

				return chaptersVisible;
			},
			getLargestBoxDimensions: function(){
				var $cc = this.getComponent();
				// Get rough estimates for number of chapter visible.
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
					var totalWidth = this.getChapterBoxWidth()
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
				// search chapter for current active
				var activeIndex = 0;
				var time = this.getPlayer().currentTime;
				$.each( this.mediaList, function( inx, item){
					if( time > ( item.startTime ) ){
						activeIndex = inx;
					}
				});
				var $activeChapter =  this.getComponent().find( '.active' );
				var actualActiveIndex = $activeChapter.data( 'chapterIndex' );
				// Check if active is not already set:
				if( actualActiveIndex == activeIndex ){
					// update duration count down:
					var item = this.mediaList[ activeIndex ];
					if( item ){
						$activeChapter.addClass('active');
						item.active = true;
						var endTime = item.endTime;
						var countDown =  Math.abs( time - endTime );
						$activeChapter.find('.k-duration span').text(
							kWidget.seconds2npt( countDown )
						);
					}
				} else {
					var item = _this.mediaList[ actualActiveIndex ];
					if ( item ) {
						item.active = false;
						var startTime = item.startTime ;
						var endTime = item.endTime;
						$activeChapter
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
		} )
	);

})( window.mw, window.jQuery );