(function ( mw, $ ) {
	"use strict";

	mw.PluginManager.add( 'mediaList', mw.KBaseMediaList.extend( {

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
				'titleLimit': 29,
				'descriptionLimit': 80,
				'thumbnailWidth' : 100,
				'horizontalMediaItemWidth': 290,
				'overflow': false,
				'includeThumbnail': true,
				'includeItemStartTime': true,
				'includeItemNumberPattern': false,
				'includeMediaItemDuration': true
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
			//General
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
			//UI Handlers
			mediaClicked: function(mediaIndex){
				// start playback
				this.getPlayer().sendNotification( 'doPlay' );
				// see to start time and play ( +.1 to avoid highlight of prev chapter )
				this.getPlayer().sendNotification( 'doSeek', ( this.mediaList[mediaIndex].startTime ) + .1 );
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