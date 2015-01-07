(function (mw, $) {
	"use strict";

	mw.PluginManager.add('chapters', mw.KBaseMediaList.extend({

		defaultConfig: {
			'parent': 'sideBarContainer',
			'containerPosition': null,
			'order': 2,
			'showTooltip': false,
			"displayImportance": 'high',
			'templatePath': 'components/chapters/chapters.tmpl.html',
			'cuePointType': [{
				"main": mw.KCuePoints.TYPE.THUMB,
				"sub": [mw.KCuePoints.THUMB_SUB_TYPE.SLIDE,
					mw.KCuePoints.THUMB_SUB_TYPE.CHAPTER]
			}],
			'oneSecRotatorSlidesLimit': 61,
			'twoSecRotatorSlidesLimit': 250,
			'maxRotatorSlides': 125,
			'mediaItemWidth': null,
			'mediaItemHeight': null,
			'overflow': false,
			'onPage': false,
			'includeHeader': true,
			'enableSearch': true,
			'cssFileName': 'modules/KalturaSupport/components/chapters/chapters.css',
			'minDisplayWidth': 0,
			'minDisplayHeight': 0,
			'chapterSlideBoxRatio': (2/3)
		},

		mediaList: [], //Hold the medialist items
		cache: [], //Hold the search data cache
		dataSet: null, //Hold current dataset returnd from API
		renderOnData: false, //Indicate if to wait for data before rendering layout
		freezeTimeIndicators: false,
		chaptersMap: [],

		setup: function () {
			this.addBindings();
			if (this.getPlayer().isLive() && mw.getConfig("EmbedPlayer.LiveCuepoints")) {
				this.setConfig("includeMediaItemDuration", false);
			}
		},
		addBindings: function () {
			var _this = this;

			this.bind('KalturaSupport_ThumbCuePointsReady', function () {
				if (!_this.maskChangeStreamEvents) {
					//Get chapters data from cuepoints
					var chaptersRawData = _this.getCuePoints();
					if ( chaptersRawData.length ) {
						//Sort by time and/or cuepoint type
						chaptersRawData.sort( function ( a, b ) {
							if (a.startTime - b.startTime > 0){
								return 1;
							} else if (a.startTime - b.startTime < 0){
								return -1;
							} else if (a.startTime - b.startTime === 0){
								if (b.subType === mw.KCuePoints.THUMB_SUB_TYPE.CHAPTER){
									return 1;
								}
								if (a.subType === mw.KCuePoints.THUMB_SUB_TYPE.CHAPTER){
									return -1;
								}
								return 0;
							}
						} );
						//Create media items from raw data
						_this.addMediaItems( chaptersRawData );
						_this.markMediaItemsAsDisplayed( _this.mediaList );
						//Need to recalc all durations after we have all the items startTime values
						_this.setMediaItemTime();
						//Set data initialized flag for handlers to start working
						_this.dataIntialized = true;
						if ( _this.renderOnData ) {
							_this.renderOnData = false;
							_this.renderMediaList();
							_this.updateActiveItem();
						}
					}
				}
			});

			this.bind('KalturaSupport_ThumbCuePointsUpdated', function (e, cuepoints) {
				if (!_this.dataIntialized) {
					_this.dataIntialized = true;
				}
				cuepoints.sort(function(a, b){
					return (a.startTime - b.startTime > 0) ||
						(a.startTime === b.startTime && b.subType ===2  );
				});
				_this.addMediaItems(cuepoints);

				_this.setMediaItemTime();
			});

			this.bind("freezeTimeIndicators", function(e, val){
				_this.freezeTimeIndicators = val;
			});

			this.bind("monitorEvent", function () {
				if (_this.dataIntialized) {
					var items = [];
					//Check for items that weren't displayed yet
					$.each(_this.mediaList, function (index, item) {
						if (item.startTime <= _this.getPlayer().getPlayerElementTime() && !item.displayed) {
							items.push(item);
						}
					});
					if (items.length > 0) {
						//Set items as displayed
						_this.markMediaItemsAsDisplayed(items);
						//Create DOM markup and append to list
						var mediaItems = _this.createMediaItems(items);
						if (_this.renderOnData) {
							_this.renderOnData = false;
							_this.renderMediaList();
						} else {
							_this.getComponent().find("ul").append(mediaItems);
						}
						//Mark current added items index as the index to start scroll from and re-init the scroll logic
						_this.startFrom = _this.mediaList.length - _this.mediaItemVisible;
						_this.configMediaListFeatures();
						_this.updateActiveItem();
						$( _this.embedPlayer ).trigger( "mediaListLayoutUpdated" );
					}
				}
			});

			this.bind('playerReady', function () {
				if (!_this.maskChangeStreamEvents) {
					if ( _this.dataIntialized ) {
						_this.renderMediaList();
						_this.updateActiveItem();
					} else {
						_this.renderOnData = true;
					}
					_this.renderSearchBar();
				}
			});

			this.bind('hide', function () {
				_this.getComponent().hide();
			});
			this.bind('show', function () {
				_this.getComponent().show();
			});

			this.bind('updatePlayHeadPercent', function () {
				if (_this.dataIntialized) {
					_this.updateActiveItem();
				}
			});

			this.bind('onChangeStream', function () {
				_this.maskChangeStreamEvents = true;
			});
			this.bind('onChangeStreamDone', function () {
				_this.maskChangeStreamEvents = true;
			});

			this.bind('onChangeMedia', function () {
				if (!_this.maskChangeStreamEvents){
					_this.dataIntialized = false;
					_this.mediaList = [];
					_this.chaptersMap = [];
				}
			});

			this.bind('mediaListLayoutReady', function () {
				_this.getComponent().find(".mediaBoxText").dotdotdot();
			});
		},
		isSafeEnviornment: function () {
			var cuePoints = this.getCuePoints();
			var cuePointsExist = (cuePoints.length > 0);
			return (!this.getPlayer().useNativePlayerControls() &&
				( ( this.getPlayer().isLive() && mw.getConfig("EmbedPlayer.LiveCuepoints") ) || cuePointsExist));
		},
		getCuePoints: function(){
			var cuePoints = [];
			var _this = this;
			if ( this.getPlayer().kCuePoints ) {
				$.each( _this.getConfig( 'cuePointType' ), function ( i, cuePointType ) {
					$.each( cuePointType.sub, function ( j, cuePointSubType ) {
						var filteredCuePoints = _this.getPlayer().kCuePoints.getCuePointsByType( cuePointType.main, cuePointSubType );
						cuePoints = cuePoints.concat( filteredCuePoints );
					} );
				} );
			}
			cuePoints.sort(function (a, b) {
				return a.startTime - b.startTime;
			});
			return cuePoints;
		},
		getMedialistContainer: function () {
			//Only support external onPage medialist container
			if (this.getConfig('onPage')) {
				return this._super();
			}
		},
		createMediaItems: function (mediaListItems) {
			//Fetch slides template
			var slideTemplate = this.getTemplatePartialHTML("slides");
			//Generate slide from each new medialist item
			var mediaList = $.map(mediaListItems, function(mediaListItem){
				return slideTemplate({mediaItem: mediaListItem});
			});
			//Concat the template strings array to a full string
			var mediaListString = mediaList.join("");
			//Return DOM
			return $(mediaListString );
		},
		getTemplateHTML: function(data){
			//Fetch templates
			var chapterTemplate = this.getTemplatePartialHTML("chapters");
			var slideTemplate = this.getTemplatePartialHTML("slides");
			var listTemplate = this.getTemplatePartialHTML("list");
			//Return new list HTML string
			return listTemplate({
				renderChapter: chapterTemplate,
				renderSlide: slideTemplate,
				meta: data.meta,
				mediaList: data.mediaList
			});
		},
		addMediaItems: function (items) {
			var _this = this;

			//Get current item number
			var orderId = this.mediaList.length;
			//Map items to mediaList items
			var mediaList = $.map(items, function (item) {
				var mediaItem;
				var customData = item.partnerData ? JSON.parse(item.partnerData) : {};
				var title = item.title || customData.title;
				var description = item.description || customData.desc;
				var thumbnailUrl = item.thumbnailUrl || customData.thumbUrl || _this.getThumbUrl(item);
				var thumbnailRotatorUrl = _this.getConfig('thumbnailRotator') ? _this.getThumRotatorUrl() : '';

				mediaItem = {
					order: orderId++,
					id: item.id,
					type: item.subType,
					title: title,
					description: description,
					thumbnail: {
						url: thumbnailUrl,
						thumbAssetId: item.assetId,
						rotatorUrl: thumbnailRotatorUrl
					},
					startTime: item.startTime / 1000,
					startTimeDisplay: _this.formatTimeDisplayValue(mw.seconds2npt(item.startTime / 1000)),
					endTime: null,
					durationDisplay: null

				};
				if (mediaItem.type === mw.KCuePoints.THUMB_SUB_TYPE.CHAPTER) {
					//Save reference to chapters in chapter map object
					_this.chaptersMap.push({
						id: mediaItem.id,
						data: mediaItem,
						children: []
					});
					//Set chapter number
					mediaItem.chapterNumber = _this.chaptersMap.length - 1;
				} else if (mediaItem.type === mw.KCuePoints.THUMB_SUB_TYPE.SLIDE){
					//Reference child elements of chapter if it exist
					var currentChapter = _this.chaptersMap[_this.chaptersMap.length - 1];
					if (currentChapter) {
						currentChapter.children.push( mediaItem );
						currentChapter.data.hasChildren = true;
						mediaItem.hasParent = true;
						mediaItem.slideNumber = currentChapter.children.length - 1;
						mediaItem.chapterNumber = currentChapter.data.chapterNumber;
					} else {
						mediaItem.chapterNumber = -1;
					}
				}
				return mediaItem;
			});
			//Add media items to mediaList cache - need to concat here new to existing list in
			//order to support live cuepoints which adds up as stream progress
			this.mediaList = this.mediaList.concat(mediaList);
		},
		getMediaBoxHeight: function(mediaItem){
			//Get media box height by mediaItemRatio and by media item type (Chapter/Slide)
			var	width = this.getMedialistComponent().width();
			var	newHeight = width * (1 / this.getConfig("mediaItemRatio"));
			newHeight = (mediaItem.type === mw.KCuePoints.THUMB_SUB_TYPE.CHAPTER)?
				newHeight :
				(newHeight * this.getConfig('chapterSlideBoxRatio'));
			return newHeight;
		},
		getMediaBoxWidth: function(){
			//Get media box width by mediaItemRatio and by media item type (Chapter/Slide)
			var	height = this.getMedialistComponent().height();
			var	newWidth = height * (1 / this.getConfig("mediaItemRatio"));
			newWidth = (mediaItem.type === mw.KCuePoints.THUMB_SUB_TYPE.CHAPTER)?
				newWidth :
				(newWidth * this.getConfig('chapterSlideBoxRatio'));
			return newWidth;
		},
		disableChapterToggle: function(){
			this.getMediaListDomElements().filter(".chapterBox").addClass("disableChapterToggle").attr("data-chapter-collapsed", true);
		},
		enableChapterToggle: function(){
			this.getMediaListDomElements().filter(".chapterBox").removeClass("disableChapterToggle");
		},
		markMediaItemsAsDisplayed: function (mediaItems) {
			$.each(mediaItems, function (index, item) {
				item.displayed = true;
			});
		},
		getMediaItemThumbs: function (callback) {
			var _this = this;
			var requestArray = [];
			var response = [];
			$.each(this.mediaList, function (index, item) {
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
			this.getKalturaClient().doRequest(requestArray, function (data) {
				// Validate result
				if (!_this.isValidResult(data)) {
					return;
				}
				$.each(data, function (index, url) {
					response[index].url = url;

				});
				callback.apply(_this, [response]);
			});
		},
		setMediaItemTime: function () {
			var _this = this;
			$.each(this.chaptersMap, function (index, item) {
				if (_this.chaptersMap[index + 1]) {
					item.data.endTime = _this.chaptersMap[index + 1].data.startTime;
				} else {
					item.data.endTime = _this.getPlayer().duration;
				}

				item.data.durationDisplay = mw.seconds2npt((item.data.endTime - item.data.startTime));
			});
			$.each(this.mediaList, function (index, item) {
				if (item.type !== mw.KCuePoints.THUMB_SUB_TYPE.SLIDE){
					return true;
				}
				var runningIndex = index + 1;
				while (_this.mediaList[runningIndex]){
					if (_this.mediaList[runningIndex].type === mw.KCuePoints.THUMB_SUB_TYPE.SLIDE){
						break;
					}
					runningIndex++;
				}
				if (_this.mediaList[runningIndex]) {
					item.endTime = _this.mediaList[runningIndex].startTime;
				} else {
					item.endTime = _this.getPlayer().duration;
				}

				item.durationDisplay = mw.seconds2npt((item.endTime - item.startTime));
			});
		},
		formatTimeDisplayValue: function (time) {
			// Add 0 padding to start time min
			var timeParts = time.split(':');
			if (timeParts.length === 2 && timeParts[0].length === 1) {
				time = '0' + time;
			}
			return time;
		},
		renderSearchBar: function(){
			if (this.getConfig('enableSearch')) {
				var _this = this;
				// Clear search bar before adding
				this.getMedialistHeaderComponent().empty();
				// Build the search element
				var searchFormWrapper = this.$searchFormWrapper = $( "<div/>", {"class": "searchFormWrapper"} )
					//Magnifying glass icon
					.append( $( "<div/>", {"class": "searchIcon icon-magnifyGlass", id: 'searchBoxIcon'} ) )
					//Search input box
					.append( $( "<div/>", {"id": "searchBoxWrapper"} )
						.append( $( "<input/>", {id: 'searchBox', type: 'text', placeholder: gM('ks-chapters-search-placeholder'), required: true} )
							.on( 'change keyup paste input', function ( ) {
								var searchBoxCancelIcon = $( "#searchBoxCancelIcon" );
								var searchBoxIcon = $( "#searchBoxIcon" );
								switch ( this.value.length ) {
									case 0:
										searchBoxCancelIcon.removeClass("active");
										searchBoxIcon.removeClass("active");
										_this.resetSearchResults();
										break;
									case 1:
									case 2:
										searchBoxCancelIcon.addClass("active");
										searchBoxIcon.addClass("active");
										_this.resetSearchResults();
										break;
									default:
										searchBoxCancelIcon.addClass("active");
										searchBoxIcon.addClass("active");
								}
							} )
							.keydown(function(e) {
								var nodeName = e.target.nodeName.toLowerCase();

								if (e.which === 8) {
									if ((nodeName === 'input' && e.target.type === 'text') ||
										nodeName === 'textarea') {
										// do nothing
									} else {
										e.preventDefault();
									}
								}
							})
							.on( "focus", function () {
								_this.getPlayer().triggerHelper( "onDisableKeyboardBinding" );
								//On each focus render width of dropdown menu
								searchFormWrapper.find(".tt-dropdown-menu" ).width(searchFormWrapper.width());
								_this.maximizeSearchBar();
							} )
							.on( "blur", function () {
								_this.getPlayer().triggerHelper( "onEnableKeyboardBinding" );
							} )
						)
					)
					//clear icon
					.append( $( "<div/>",
						{
							'class': 'searchIcon icon-clear tooltipBelow',
							'id': 'searchBoxCancelIcon',
							'title': gM('ks-chapters-search-clear'),
							'data-show-tooltip': true
						} )
						.on( "click touchend", function () {
							$( "#searchBox" ).val( "" ).focus();
							$( '#searchBox' ).typeahead( "val", "" ).typeahead( "close" );
							$( "#searchBoxCancelIcon" ).removeClass("active");
							$( "#searchBoxIcon" ).removeClass("active");
							_this.resetSearchResults();
						} )
					);

				//Add tooltip
				this.getPlayer().layoutBuilder.setupTooltip(searchFormWrapper.find("#searchBoxCancelIcon"), "arrowTop");

				// Add the searchbar to the medialist header
				this.getMedialistHeaderComponent().append( searchFormWrapper );

				// Helper function for autocomplete
				var findMatches = function ( q, cb ) {
					// Fetch results from API
					_this.getSearchData( q, function ( strs ) {
						var matches, substrRegex;
						// an array that will be populated with substring matches
						matches = [];
						// regex used to determine if a string contains the substring `q`
						var regexExp = q.replace(/^\s+/, '').replace(/\s+$/, '').replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
						substrRegex = new RegExp( regexExp, 'i' );
						// iterate through the pool of strings and for any string that
						// contains the substring `q`, add it to the `matches` array
						$.each( strs, function ( i, str ) {
							if ( substrRegex.test( str.data ) ) {
								// the typeahead jQuery plugin expects suggestions to a
								// JavaScript object, refer to typeahead docs for more info
								matches.push( { value: str } );
							}
						} );
						cb( matches );
					} );
				};

				// Helper function for parsing search result length
				var parseData = function ( obj, searchTerm ) {
					var startOfMatch = obj.value.data.toLowerCase().indexOf( searchTerm.toLowerCase() );
					if ( startOfMatch > -1 ) {
						var expLen = searchTerm.length;
						var dataLen = obj.value.data.length;
						var restOfExpLen = dataLen - (startOfMatch + expLen);
						var hintLen = Math.floor( restOfExpLen * 0.2 );
						if (hintLen === 0 || hintLen/dataLen > 0.7 || hintLen < 40){
							hintLen = restOfExpLen;
						}
						return obj.value.data.substr( startOfMatch, expLen + hintLen );
					} else {
						return obj.value.data;
					}
				};

				var typeahead = searchFormWrapper.find( '#searchBox' )
					.typeahead( {
						minLength: 3,
						highlight: true,
						hint: false
					},
					{
						name: 'label',
						displayKey: function ( obj ) {
							return parseData( obj, typeahead.val() );
						},
						templates: {
							suggestion: function ( obj ) {
								return parseData( obj, typeahead.val() );
							}
						},
						source: findMatches
					} ).
					on( "typeahead:selected", function ( e, obj ) {
						_this.showSearchResults( obj.value.id );
					} ).
					on( "keyup", function ( event ) {
						// On enter key press:
						// 1. If multiple suggestions and none was chosen - display results for all suggestions
						// 2. Close dropdown menu
						if ( event.keyCode === 13 ) {
							var dropdown = typeahead.data( 'ttTypeahead' ).dropdown;
							var objIds = [];
							var suggestionsElms = dropdown._getSuggestions();
							// Only update if there are available suggestions
							if ( suggestionsElms.length ) {
								suggestionsElms.each( function ( i, suggestionsElm ) {
									var suggestionsData = dropdown.getDatumForSuggestion( $( suggestionsElm ) );
									objIds.push( suggestionsData.raw.value.id );
								} );
								_this.showSearchResults( objIds );
							}
							typeahead.typeahead( "close" );
						}
					}
				);
			}
		},
		minimizeSearchBar: function(){
			this.$searchFormWrapper.addClass("minimized");
		},
		maximizeSearchBar: function(){
			this.$searchFormWrapper.removeClass("minimized");
		},
		getSearchData: function(expression, callback){
			var liveCheck = this.getPlayer().isLive() && mw.getConfig("EmbedPlayer.LiveCuepoints");
			// If results are cached then return from cache, unless in live session
			expression = expression.replace(/^\s+/, '').replace(/\s+$/, '');
			var cacheExp = expression.substr(0,3);
			if (!liveCheck && this.cache[cacheExp]){
				return callback(this.cache[cacheExp]);
			}
			// If query length is 3 then clear current dataset and query against API again
			if (expression.length === 3){
				this.dataSet = null;
			}
			// If query length greater then 3 chars then don't query API anymore - use initial dataset
			if (expression.length > 3 && this.dataSet){
				return callback(this.dataSet);
			}

			var _this = this;
			var request = {
				'service': 'cuepoint_cuepoint',
				'action': 'list',
				'filter:entryIdEqual': _this.embedPlayer.kentryid,
				'filter:objectType': 'KalturaCuePointFilter',
				'filter:freeText': expression + "*"
			};
			// If in live mode, then search only in cuepoints which are already available at current live timeline
			if (liveCheck){
				request['filter:updatedAtLessThanOrEqual'] = this.getPlayer().kCuePoints.getLastUpdateTime();
			}

			this.getKalturaClient().doRequest(request,
				function (data) {
					if (!_this.isValidResult(data)) {
						return;
					}
					// Validate result
					var results = [];
					$.each(data.objects, function (index, res) {
						if (!_this.isValidResult(res)) {
							data[index] = null;
						}

						results.push(
							{
								id: res.id,
								data: res.title
							},{
								id: res.id,
								data: res.description
							}
						);
					});

					_this.dataSet = results;
					_this.cache[expression] = results;

					if (callback) {
						callback(results);
					}
				}
			);
		},
		showSearchResults: function(searchResults){
			this.searchResultShown = true;
			if ( !$.isArray(searchResults)){
				searchResults = [searchResults];
			}
			this.disableChapterToggle();
			var mediaBoxes = this.getMediaListDomElements();
			mediaBoxes.each(function(i, mediaBox){
				var objId = $(mediaBox).attr("data-obj-id");
				if ( $.inArray(objId, searchResults) > -1){
					var mediaBoxObj = $(mediaBox);
					mediaBoxObj.removeClass("resultNoMatch collapsed");
				} else{
					$(mediaBox).addClass("resultNoMatch");
				}
			});
			//Recalac scroller height
			this.renderScroller();
		},
		resetSearchResults: function(){
			if (this.searchResultShown) {
				this.searchResultShown = false;
				this.enableChapterToggle();
				var mediaBoxes = this.getMediaListDomElements();
				mediaBoxes.removeClass( "resultNoMatch" );
				mediaBoxes.filter("[data-chapter-index!=-1]").addClass( "collapsed" );
				//Recalac scroller height
				this.renderScroller();
			}

		},
		renderScroller: function(options){
			if (this.$scroll){
				//Fix bug with nanoScroller dynamic elements rendering by resetting z-index
				this.$scroll.find(".nano-content" ).css("z-index", -1);
				if (options) {
					this.$scroll.nanoScroller( options );
				} else {
					this.$scroll.nanoScroller( );
				}
				this.$scroll.find(".nano-content" ).css("z-index", "");
			}
		},
		isValidResult: function (data) {
			// Check if we got error
			if (!data){
				this.error = true;
				this.log("Error retrieving data");
				return false;
			} else if ( data.code && data.message ) {
				this.error = true;
				this.log("Error code: " + data.code + ", error message: " + data.message);
				return false;
			}
			this.error = false;
			return true;
		},
		//UI Handlers
		mediaClicked: function (mediaIndex) {
			// start playback
			this.getPlayer().sendNotification('doPlay');
			// see to start time and play ( +.1 to avoid highlight of prev chapter )
			this.getPlayer().sendNotification('doSeek', ( this.mediaList[mediaIndex].startTime ) + 0.1);
		},
		doOnScrollerUpdate: function(data){
			//If maximum scroll has changed then reset last position
			if (this.maximumScroll !== data.maximum){
				this.lastPosition = data.position;
			}
			this.maximumScroll = data.maximum;
			if (data.direction === "up"){
				//On up maximize searchbar
				this.maximizeSearchBar();
				//Reset last location of scroll bar
				this.lastPosition = -1;
			} else {
				//On scroll down minimize searchbar after 10% scroll from max scroll height
				if (this.lastPosition === -1){
					//Set initial location of scroll bar
					this.lastPosition = data.position;
				}
				if (((data.position - this.lastPosition) / this.maximumScroll) > 0.1){
					this.minimizeSearchBar();
				}
			}
			//Remove focus from searchbox to enable maximize on focus
			this.$searchFormWrapper.blur();
			this.$searchFormWrapper.find("#searchBox").blur();
		},
		updateActiveItem: function () {
			if (!this.freezeTimeIndicators) {
				// search chapter for current active
				var activeIndex = 0;
				var time = this.getPlayer().currentTime;
				$.each( this.chaptersMap, function ( inx, item ) {
					if ( time > ( item.data.startTime ) ) {
						activeIndex = item.data.order;
					}
				} );

				var actualActiveIndex = this.selectedMediaItemIndex;
				// Check if active is not already set:
				var item;
				var endTime;
				if ( actualActiveIndex === activeIndex ) {
					// update duration count down:
					item = this.mediaList[ activeIndex ];
					if ( item ) {
						if ( !item.active ) {
							this.setSelectedMedia( activeIndex );
							item.active = true;
						}
						endTime = item.endTime;
						var countDown = Math.abs( time - endTime );
						this.updateActiveItemDuration( countDown );
					}
				} else {
					item = this.mediaList[ actualActiveIndex ];
					if ( item && item.active ) {
						item.active = false;
						var startTime = item.startTime;
						endTime = item.endTime;
						this.updateActiveItemDuration( endTime - startTime );
					}

					// Check if we should pause on chapter update:
					if ( this.getConfig( 'pauseAfterChapter' ) && !this.skipPauseFlag ) {
						this.getPlayer().sendNotification( 'doPause' );
					}
					// restore skip pause flag:
					this.skipPauseFlag = false;

					if ( this.mediaList[ activeIndex ] ) {
						this.setSelectedMedia( activeIndex );
					}
				}
			}
		},
		attachMediaListHandlers: function(){
			var _this = this;
			this._super();
			var delay = 0.1;
			var transitionsToBeFired = 0;
			var animationSupported = mw.getConfig( 'EmbedPlayer.AnimationSupported');
			var slideBoxes = this.getComponent().find(".slideBox" );
			slideBoxes.on('transitionend webkitTransitionEnd', function(e){
				var $target = $( e.target ); // target letter transitionend fired on
				if ( /transform/i.test( e.originalEvent.propertyName ) ) { // check event fired on "transform" prop
					transitionsToBeFired -= 1;
					$target.css( {transitionDelay: '0ms'} ); // set transition delay to 0 so when 'dropped' class is removed, letter appears instantly
					if ( !transitionsToBeFired ) { // all transitions on characters have completed?
						delay = 0.1;
						_this.renderScroller({stop: false});
					}
				}
			});

			this.getComponent().find(".slideBoxToggle")
				.on("click", function(e){
					e.stopPropagation();
					var toggleChapter = $( this ).parent();
					toggleChapter.toggleClass( "collapsed" );
					var chapterToggleId = parseInt( toggleChapter.attr( "data-chapter-index" ), 10 );
					var targets = _this.getComponent().find( ".slideBox[data-chapter-index=" + chapterToggleId + "]" );
					transitionsToBeFired = targets.length;
					_this.renderScroller({stop: true});
					if (toggleChapter.attr("data-chapter-collapsed") === "true") {
						toggleChapter.attr("data-chapter-collapsed", false);
						delay = 0.1;
						if (animationSupported) {
							targets.each( function () {
								$( this ).css( {transitionDelay: delay + 's'} ); // apply sequential trans delay to each character
								delay += 0.1;
							} );
						} else {
							setTimeout(function(){
								_this.renderScroller({stop: false});
							}, 500);
						}
					} else {
						toggleChapter.attr("data-chapter-collapsed", true);
					}
					targets.toggleClass( "collapsed" );
				});
		}
	}));
})(window.mw, window.jQuery);