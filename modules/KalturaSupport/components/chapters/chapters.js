(function (mw, $) {
	"use strict";

	mw.PluginManager.add('chapters', mw.KBaseMediaList.extend({

		defaultConfig: {
			'parent': 'sideBarContainer',
			'closeOnClick': false,
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
			'chapterSlideBoxRatio': (2/3),
			enableKeyboardShortcuts: true,
			"keyboardShortcutsMap": {
				"goToActiveTile": "shift+73",   // Add Shift+I Sign for go to active tile
				"expend": "190",                // Add > Sign for expend current chapter slides
				"collapse": "188",              // Add < Sign for collapse current chapter slides
				"expendAll": "shift+190",       // Add Shift+> Sign for expend all slides
				"collapseAll": "shift+188"      // Add Shift+< Sign for collapse all slides

			}
		},

		mediaList: [], //Hold the medialist items
		chaptersMap: [],
		slidesMap: [],
		pendingMediaItems: [], //Hold the medialist items that are pending to be displayed in live stream
		cache: {}, //Hold the search data cache
		dataSet: null, //Hold current dataset returned from API
		renderOnData: false, //Indicate if to wait for data before rendering layout
		freezeTimeIndicators: false,
		activeItem: 0,
		selectedChapterIndex: 0,
		selectedSlideIndex: 0,
		inSlideAnimation: false,
		barsMinimized: false,
		searchResultShown: false,
		chapterToggleEnabled: true,
		maskKeyboardShortcuts: true,

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
					if (_this.getPlayer().isLive()){
						//Live mode doesn't support chapters so disable toggling
						_this.disableChapterToggle();
					}
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
						var mediaItems = _this.createMediaItems(chaptersRawData);
						_this.addMediaItems( mediaItems );
						_this.markMediaItemsAsDisplayed( _this.mediaList );
						//If no chapters or only chapters then disable chapter toggling
						if (_this.chaptersMap.length === 0 || _this.mediaList.length === _this.chaptersMap.length){
							_this.disableChapterToggle();
						}
						//Need to recalc all durations after we have all the items startTime values
						_this.setMediaItemTime(_this.slidesMap);
						_this.setChaptersTime(_this.chaptersMap);
						//Set data initialized flag for handlers to start working
						_this.dataIntialized = true;
						if ( _this.renderOnData ) {
							_this.show();
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

				var mediaItems = _this.createMediaItems(cuepoints);
				_this.addMediaItems(mediaItems);
				_this.pendingMediaItems = _this.pendingMediaItems.concat(mediaItems);

				_this.log("Total pending items: " + _this.pendingMediaItems.length);

				//Last cuepoint duration is the entry duration minus cuepoint start time, 
				//but in live we don't have duration so last cuepoint doesn't have duration.
				//So in live cuepoints whenever a new cupoint arrives we can calculate the previous last cuepoint
				//duration using the new cuepoint, e.g. new cuepoint strat time minus previous cuepoint start time
				//so we add to the new cuepoints that arrived the last previous cuepoint before calling setMediaItemTime
				mediaItems.unshift(_this.mediaList[_this.mediaList.length-1-mediaItems.length]);
				_this.setMediaItemTime(mediaItems);
			});

			this.bind("seeked", function(){
				var item = _this.mediaList[ _this.selectedMediaItemIndex ];
				if ( item && item.active ) {
					item.active = false;
				}

				var activeDomObj = _this.getActiveItem();
				activeDomObj.find(".slideOverlay").removeClass("watched");

				_this.resetChapterProgress(_this.selectedChapterIndex);

				//On seek reset the active item index so we can find items even if seek is to past time(e.g. rewind)
				_this.selectedMediaItemIndex = 0;
				_this.selectedSlideIndex = 0;
				_this.selectedChapterIndex = 0;
			});

			this.bind("freezeTimeIndicators", function(e, val){
				_this.freezeTimeIndicators = val;
			});

			this.bind("updatePlayHeadPercent", function () {
				if (_this.dataIntialized) {
					_this.handlePendingItems();
					_this.updateActiveItem();
				}
			});

			this.bind('playerReady', function () {
				if (!_this.maskChangeStreamEvents) {
					if ( _this.dataIntialized ) {
						_this.show();
						_this.renderMediaList();
						_this.updateActiveItem();
					} else {
						_this.hide();
						_this.renderOnData = true;
					}
					_this.renderSearchBar();
					_this.renderBottomBar();
				}
				if(_this.embedPlayer.isDVR() ==1){
                    $(_this.embedPlayer.getInterface()).addClass("dvr");
                    _this.dvrWindow = this.evaluate("{mediaProxy.entry.dvrWindow}");
				}
			});

			this.bind('hide', function () {
				_this.hide();
			});
			this.bind('show', function () {
				_this.show();
			});

			this.bind('onChangeStream', function () {
				_this.maskChangeStreamEvents = true;
			});
			this.bind('onChangeStreamDone', function () {
				_this.maskChangeStreamEvents = false;
			});

			this.bind('onChangeMedia', function () {
				if (!_this.maskChangeStreamEvents){
					_this.dataIntialized = false;
					_this.mediaList = [];
					_this.chaptersMap = [];
					_this.slidesMap = [];
					_this.cache = {};
					_this.dataSet = null;
					_this.renderOnData = false;
					_this.selectedChapterIndex = 0;
					_this.selectedSlideIndex= 0;
					_this.selectedMediaItemIndex= 0;
				}
			});

			this.bind('mediaListLayoutReady slideAnimationEnded updateLayout', function () {
				setTimeout(function(){
					_this.getComponent()
						.find(".k-title-container.mediaBoxText, .k-description-container.mediaBoxText").dotdotdot();
				}, 100);
			});

			this.bind('onShowSideBar', function(){
				//Enable keyboard bindings when menu is visible
				_this.maskKeyboardShortcuts = false;
				_this.focusSearchBar();
			});
			this.bind('onHideSideBar', function(){
				_this.blurSearchBar();
				//Prevent keyboard bindings when menu is hidden
				_this.maskKeyboardShortcuts = true;
			});
			//key bindings
			if (this.getConfig('enableKeyboardShortcuts')) {
				this.bind('addKeyBindCallback', function (e, addKeyCallback) {
					_this.addKeyboardShortcuts(addKeyCallback);
				});
			}
		},
		addKeyboardShortcuts: function (addKeyCallback) {
			var _this = this;
			function toggleItemChapter(toState) {
				if ( !_this.maskKeyboardShortcuts ) {
					var chapter;
					var currentSelectedItem = document.activeElement;
					var currentSelectedObj = $( currentSelectedItem );
					var currentSelectedObjType = currentSelectedObj.data( "boxType" );
					if ( currentSelectedObjType === mw.KCuePoints.THUMB_SUB_TYPE.CHAPTER ) {
						chapter = currentSelectedItem;
					} else if ( currentSelectedObjType === mw.KCuePoints.THUMB_SUB_TYPE.SLIDE ) {
						var slideChapterIndex = currentSelectedObj.data( "chapterIndex" );
						chapter = _this.getMediaListDomElements()
								.filter( ".chapterBox[data-chapter-index=" + slideChapterIndex + "]" );
					}
					chapter = $(chapter);
					var chapterCollapsed = (chapter.attr("data-chapter-collapsed") === "true");
					if ((chapterCollapsed && toState === "expand") || (!chapterCollapsed && toState === "collapse")) {
						_this.toggleChapter( chapter );
					}
					if (!chapterCollapsed && toState === "collapse"){
						chapter.focus();
					}
				}
			}
			// Add Shift+I for open side bar
			addKeyCallback(this.getConfig("keyboardShortcutsMap").goToActiveTile, function () {
				if (!_this.maskKeyboardShortcuts) {
					_this.scrollToActiveItem();
				}
			});
			// Add shift+> for expend all slides
			addKeyCallback(this.getConfig("keyboardShortcutsMap").expendAll, function () {
				if (!_this.maskKeyboardShortcuts) {
					_this.expendAll();
				}
			});
			// Add shift+< for collapse all slides
			addKeyCallback(this.getConfig("keyboardShortcutsMap").collapseAll, function () {
				if (!_this.maskKeyboardShortcuts) {
					_this.collapseAll();
				}
			});
			// Add > for expend current chapter slides
			addKeyCallback(this.getConfig("keyboardShortcutsMap").expend, function () {
				toggleItemChapter("expand");
			});
			// Add > for collapse current chapter slides
			addKeyCallback(this.getConfig("keyboardShortcutsMap").collapse, function () {
				toggleItemChapter("collapse");
			});
		},
		isSafeEnviornment: function () {
			return (!this.getPlayer().useNativePlayerControls() &&
				(
					this.isLiveCuepoints() ||
					this.isPlaylistPersistent() ||
					this.isVodCuepoints()
				)
			);
		},
		isLiveCuepoints: function(){
			return this.getPlayer().isLive() && this.getPlayer().isDvrSupported() && mw.getConfig("EmbedPlayer.LiveCuepoints");
		},
		isPlaylistPersistent: function(){
			return (this.getPlayer().playerConfig &&
			this.getPlayer().playerConfig.plugins &&
			this.getPlayer().playerConfig.plugins.playlistAPI &&
			this.getPlayer().playerConfig.plugins.playlistAPI.plugin !== false);
		},
		isVodCuepoints: function(){
			var cuePoints = this.getCuePoints();
			var cuePointsExist = (cuePoints.length > 0);
			return !this.getPlayer().isLive() && cuePointsExist;

		},
		handlePendingItems: function(){
			if (this.pendingMediaItems.length > 0) {
				var itemsToBeDisplayed = this.getPendingItemsToDisplay();
				if (itemsToBeDisplayed.length > 0) {
					this.log("Selected " + itemsToBeDisplayed.length + " pending item(s) to be displayed, " + this.pendingMediaItems.length + " remaining");
					//Set items as displayed
					this.markMediaItemsAsDisplayed(itemsToBeDisplayed);
					this.displayPendingItems(itemsToBeDisplayed);
					//Mark current added items index as the index to start scroll from and re-init the scroll logic
					this.startFrom = this.mediaList.length - this.mediaItemVisible;
					this.configMediaListFeatures();
					this.renderScroller();
					$(this.embedPlayer).trigger("mediaListLayoutUpdated");
				}
			}
		},
		getPendingItemsToDisplay: function(){
			var items = [];
			var itemsToRemoveIndexes = [];

			var currentTime = this.getPlayer().getPlayerElementTime();

			//Check for items that weren't displayed yet
			$.each(this.pendingMediaItems, function (index, item) {
				if (item.startTime <= currentTime && !item.displayed) {
					items.push(item);
					itemsToRemoveIndexes.push(index);
				}
			});
			var _this = this;
			$.each(itemsToRemoveIndexes, function (index) {
				_this.pendingMediaItems.splice(index, 1);
			});
			return items;
		},
		displayPendingItems: function(itemsToBeDisplayed){
			if (this.renderOnData) {
				this.show();
				this.renderOnData = false;
				//Render only items that are in the DVR window, and save future items in temp list
				var tempList = this.mediaList;
				this.mediaList = itemsToBeDisplayed;
				//Render the items to be shown
				this.renderMediaList();
				//Return all items to media list
				this.mediaList = tempList;
			} else {
				//Create DOM markup and append to list
				var mediaItems = this.renderMediaItems(itemsToBeDisplayed);
				this.getComponent().find("ul").append(mediaItems);
			}
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
		renderMediaItems: function (mediaListItems) {
			var _this = this;
			//Fetch slides template
			var slideTemplate = this.getTemplatePartialHTML("slides");
			//Generate slide from each new medialist item
			var mediaList = $.map(mediaListItems, function(mediaListItem){
				return slideTemplate({mediaItem: mediaListItem, meta: _this.getMetaData()});
			});
			//Concat the template strings array to a full string
			var mediaListString = mediaList.join("");
			//Return DOM
			return $(mediaListString );
		},
		getTemplateHTML: function(data){
			var defer = $.Deferred();
			//Fetch templates
			var chapterTemplate = this.getTemplatePartialHTML("chapters");
			var slideTemplate = this.getTemplatePartialHTML("slides");
			var listTemplate = this.getTemplatePartialHTML("list");
			//Return new list HTML string
			var $templateHtml = listTemplate({
				renderChapter: chapterTemplate,
				renderSlide: slideTemplate,
				meta: data.meta,
				mediaList: data.mediaList
			});
			return defer.resolve($templateHtml);
		},
		getMetaData: function(){
			var metaData = this._super();
			metaData.titles = {
				chapterNumber: gM("ks-chapters-chapterNumber"),
				chapterStartTime: gM("ks-chapters-chapter-start-time"),
				chapterDuration: gM("ks-chapters-chapter-duration"),
				chapterToggle: gM("ks-chapters-toggle-chapter"),
				slideNumber: gM("ks-chapters-slideNumber"),
				slideStartTime: gM("ks-chapters-slide-start-time"),
				slideDuration: gM("ks-chapters-slide-duration")

			};
			return metaData;
		},
		createMediaItems: function (items) {
			var _this = this;

			//Get current item number
			var orderId = this.mediaList.length;
			//Map items to mediaList items
			var mediaItems = $.map(items, function (item) {
				var mediaItem;
				var customData = item.partnerData ? JSON.parse(item.partnerData) : {};
				var title = item.title || customData.title;
				var description = item.description || customData.desc;
				var thumbnailUrl = item.thumbnailUrl || customData.thumbUrl || _this.getThumbUrl(item);
				var thumbnailRotatorUrl = _this.getConfig('thumbnailRotator') ? _this.getThumRotatorUrl() : '';

				mediaItem = {
					order: orderId++,
					tabIndex: 100 + orderId + 1,
					id: item.id,
					type: item.subType,
					title: title,
					collapsed: true,
					description: description,
					thumbnail: {
						url: thumbnailUrl,
						thumbAssetId: item.assetId,
						rotatorUrl: thumbnailRotatorUrl
					},
					startTime: item.startTime / 1000,
					endTime: null,
					durationDisplay: null

				};
				//apply time only in VOD or in live if DVR is supported
				if ((_this.getPlayer().isLive() && _this.getPlayer().isDVR()) || !_this.getPlayer().isLive()) {
					mediaItem.startTimeDisplay = _this.formatTimeDisplayValue(mw.seconds2npt(item.startTime / 1000));
				}
				if (mediaItem.type === mw.KCuePoints.THUMB_SUB_TYPE.CHAPTER) {
					//Save reference to chapters in chapter map object
					mediaItem.children = [];
					_this.chaptersMap.push(mediaItem);
					//Set chapter number
					mediaItem.chapterNumber = _this.chaptersMap.length - 1;
				} else if (mediaItem.type === mw.KCuePoints.THUMB_SUB_TYPE.SLIDE){
					_this.slidesMap.push(mediaItem);
					//Reference child elements of chapter if it exist
					var currentChapter = _this.chaptersMap[_this.chaptersMap.length - 1];
					if (currentChapter) {
						currentChapter.children.push( mediaItem );
						currentChapter.hasChildren = true;
						mediaItem.hasParent = true;
						mediaItem.slideNumber = currentChapter.children.length - 1;
						mediaItem.chapterNumber = currentChapter.chapterNumber;
					} else {
						mediaItem.chapterNumber = -1;
					}
				}
				return mediaItem;
			});
			return mediaItems;
		},
		addMediaItems: function(mediaItems){
			//Add media items to mediaList cache - need to concat here new to existing list in
			//order to support live cuepoints which adds up as stream progress
			this.log("Adding " + mediaItems.length + " new item(s)");
			this.mediaList = this.mediaList.concat(mediaItems);
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
		getMediaBoxWidth: function(mediaItem){
			//Get media box width by mediaItemRatio and by media item type (Chapter/Slide)
			var	height = this.getMedialistComponent().height();
			var	newWidth = height * (1 / this.getConfig("mediaItemRatio"));
			newWidth = (mediaItem.type === mw.KCuePoints.THUMB_SUB_TYPE.CHAPTER)?
				newWidth :
				(newWidth * this.getConfig('chapterSlideBoxRatio'));
			return newWidth;
		},
		disableChapterToggle: function(){
			this.chapterToggleEnabled = false;
			this.getMediaListDomElements()
				.filter(".chapterBox")
				.addClass("disableChapterToggle" )
				.attr("data-chapter-collapsed", true);
			this.getMedialistFooterComponent().find(".toggleAll").addClass("disabled");
		},
		enableChapterToggle: function(){
			this.chapterToggleEnabled = true;
			this.getMediaListDomElements()
				.filter(".chapterBox")
				.removeClass("disableChapterToggle");
			this.getMedialistFooterComponent().find(".toggleAll").removeClass("disabled");
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
		setMediaItemTime: function (mediaItem) {
			var duration = this.getPlayer().duration;
			$.each(mediaItem, function (index, item) {
				if (item.type !== mw.KCuePoints.THUMB_SUB_TYPE.SLIDE){
					return true;
				}
				var runningIndex = index + 1;
				while (mediaItem[runningIndex]){
					if (mediaItem[runningIndex].type === mw.KCuePoints.THUMB_SUB_TYPE.SLIDE){
						break;
					}
					runningIndex++;
				}
				if (mediaItem[runningIndex]) {
					item.endTime = mediaItem[runningIndex].startTime;
				} else {
					item.endTime = duration;
				}

				item.durationDisplay = mw.seconds2npt((item.endTime - item.startTime));
			});
		},
		setChaptersTime: function(chapters){
			var duration = this.getPlayer().duration;
			$.each(chapters, function (index, item) {
				if (chapters[index + 1]) {
					item.endTime = chapters[index + 1].startTime;
				} else {
					item.endTime = duration;
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
				var magnifyGlassContainer = $( "<div/>", {"class": "searchIcon icon-magnifyGlass", id: 'searchBoxIcon'} );
				var searchBox = $( "<input/>", {
					id: 'searchBox',
					type: 'text',
					tabindex: 100,
					placeholder: gM('ks-chapters-search-placeholder'),
					autocapitalize: "off",
					autocorrect :"off",

				}).
				attr("autocomplete", "off");
				var searchBoxWrapper = $( "<div/>", {"id": "searchBoxWrapper"} )
					.append( searchBox );
				var clearSearchBoxContainer = $( "<div/>", {
						'class': 'searchIcon icon-clear tooltipBelow',
						'id': 'searchBoxCancelIcon',
						'title': gM('ks-chapters-search-clear'),
						'data-show-tooltip': true
					} )
					.on( "click touchend", function (e) {
						e.preventDefault();
						e.stopPropagation();
						document.activeElement.blur();
						updateSearchUI("");
						typeahead.typeahead( "val", "" ).focus();
						return false;
					} );
				var searchFormWrapper = this.$searchFormWrapper = $( "<div/>", {"class": "searchFormWrapper"} )
				//Magnifying glass icon
					.append( magnifyGlassContainer )
					//Search input box
					.append( searchBoxWrapper )
					//clear icon
					.append( clearSearchBoxContainer );

				//Cache searchBox jquery pointer
				this.searchBox = searchBox;

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
						$.each( strs, function ( index, str ) {
							if ( substrRegex.test( str ) ) {
								// the typeahead jQuery plugin expects suggestions to a
								// JavaScript object, refer to typeahead docs for more info
								matches.push( { value: str } );
							}
						} );
						cb( matches );
					} );
				};

				// Helper function for parsing search result length
				var parseData = function ( data, searchTerm ) {
					var startOfMatch = data.toLowerCase().indexOf( searchTerm.toLowerCase() );
					if ( startOfMatch > -1 ) {
						var expLen = searchTerm.length;
						var dataLen = data.length;
						var restOfExpLen = dataLen - (startOfMatch + expLen);
						var hintLen = Math.floor( restOfExpLen * 0.2 );
						if (hintLen === 0 || hintLen/dataLen > 0.7 || hintLen < 40){
							hintLen = restOfExpLen;
						}
						return data.substr( startOfMatch, expLen + hintLen );
					} else {
						return data;
					}
				};

				//Update icon state and dropdown menu state
				var updateSearchUI = function(expression){
					switch ( expression.length ) {
						case 0:
							clearSearchBoxContainer.removeClass("active");
							magnifyGlassContainer.removeClass("active");
							_this.resetSearchResults();
							break;
						case 1:
						case 2:
							clearSearchBoxContainer.addClass("active");
							magnifyGlassContainer.addClass("active");
							_this.resetSearchResults();
							break;
						default:
							clearSearchBoxContainer.addClass("active");
							magnifyGlassContainer.addClass("active");
					}
				};

				//Get all search results for current search term
				var getDropdownResults = function(){
					//Untill typeahead expose event or API to query this data we need to use this HACK to access inner
					//objects and data inside the lib
					var dropdown = typeahead.data( 'ttTypeahead' ).dropdown;
					var objIds = [];
					var suggestionsElms = dropdown._getSuggestions();
					// Only update if there are available suggestions
					if ( suggestionsElms.length ) {
						suggestionsElms.each( function ( i, suggestionsElm ) {
							var suggestionsData = dropdown.getDatumForSuggestion( $( suggestionsElm ) );
							objIds = objIds.concat( _this.dataSet[suggestionsData.raw.value] );
						} );
					}
					return objIds;
				};

				//Init typeahead lib
				var typeahead = searchBox.typeahead( {
							minLength: 3,
							highlight: true,
							hint: false
						},
					{
						name: 'label',
						displayKey: function ( obj ) {
							return parseData( obj.value, typeahead.val() );
						},
						templates: {
							suggestion: function ( obj ) {
								return parseData( obj.value, typeahead.val() );
							},
							empty: [
								'<div class="empty-message">',
								gM("ks-chapters-search-empty-result"),
								'</div>'
							].join('\n')
						},
						source: findMatches
					} )
					.on( "typeahead:selected", function ( e, obj ) {
						e.preventDefault();
						e.stopPropagation();
						_this.showSearchResults( _this.dataSet[obj.value] );
						return false;
					} )
					.on( 'change keyup paste input', function (e) {
						updateSearchUI(this.value);
						// On "enter" key press:
						// 1. If multiple suggestions and none was chosen - display results for all suggestions
						// 2. Close dropdown menu
						if ( e.type === "keyup" && e.keyCode === 13 ) {
							var results = getDropdownResults();
							_this.showSearchResults( results );
							typeahead.typeahead( "close" );
						}
					} )
					.on( "focus", function () {
						_this.getPlayer().triggerHelper( "onDisableKeyboardBinding" );
						//On each focus render width of dropdown menu
						searchBoxWrapper.find(".tt-dropdown-menu" ).width(searchFormWrapper.width());
						_this.maximizeSearchBar();
					} )
					.on( "blur", function () {
							_this.getPlayer().triggerHelper( "onEnableKeyboardBinding" );
						} );
			}
		},
		focusSearchBar: function(){
			if (this.searchBox && !mw.isMobileDevice()){
				this.searchBox.focus();
			}

		},
		blurSearchBar: function(){
			if (this.searchBox && !mw.isMobileDevice()){
				this.searchBox.blur();
			}

		},
		minimizeSearchBar: function(){
			this.$searchFormWrapper.addClass("minimized");
			this.getMedialistFooterComponent().addClass("minimized");
			if (this.scrollUpdateTimeout){
				clearTimeout(this.scrollUpdateTimeout);
				this.scrollUpdateTimeout = null;
			}
			var _this = this;
			this.scrollUpdateTimeout = setTimeout(function(){
				_this.scrollUpdateTimeout = null;
				_this.setMedialistComponentHeight();
			}, 100);

		},
		maximizeSearchBar: function(){
			this.$searchFormWrapper.removeClass("minimized");
			this.getMedialistFooterComponent().removeClass("minimized");
			this.setMedialistComponentHeight();
		},
		getSearchData: function(expression, callback){
			var liveCheck = this.getPlayer().isLive() && mw.getConfig("EmbedPlayer.LiveCuepoints");
			// If results are cached then return from cache, unless in live session
			expression = expression.replace(/^\s+/, '').replace(/\s+$/, '' ).toLowerCase();
			var cacheExp = expression.substr(0,3);
			if (!liveCheck && this.cache[cacheExp]){
				this.dataSet = this.cache[cacheExp].hash;
				return callback(this.cache[cacheExp].sortedKeys);
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
						var results = {
							hash: {},
							sortedKeys: []
						};

						$.each(data.objects, function (index, res) {
							if (!_this.isValidResult(res)) {
								data[index] = null;
							}

							var searchData = [res.title, res.description];
							//Check if res tags is not empty before adding data
							if (res.tags) {
								var tags = res.tags.split( "," );
								tags = $.grep( tags, function ( n ) {
									return(n);
								} );

								searchData = searchData.concat( tags );
							}

							$.each(searchData, function(index, data){
								if (results.hash[data]) {
									results.hash[data].push(res.id);
								} else {
									results.hash[data] = [res.id];
									results.sortedKeys.push(data);
								}
							});
						});
						results.sortedKeys.sort();

						_this.dataSet = results.hash;
						_this.cache[expression] = results;

						if (callback) {
							callback(results.sortedKeys);
						}
					}
			);
		},
		showSearchResults: function(searchResults){
			this.searchResultShown = true;
			if ( !$.isArray( searchResults ) ) {
				searchResults = [searchResults];
			}
			if (searchResults.length > 0) {
				this.disableChapterToggle();
				var mediaBoxes = this.getMediaListDomElements();

				mediaBoxes.each( function ( i, mediaBox ) {
					var mediaBoxObj = $( mediaBox );
					var objId = mediaBoxObj.attr( "data-obj-id" );
					if ( $.inArray( objId, searchResults ) > -1 ) {
						mediaBoxObj.removeClass( "resultNoMatch" );
					} else {
						mediaBoxObj
								.addClass( "resultNoMatch" )
								.filter("[data-chapter-index!=-1]" ) //Only collapse slides under chapters
								.addClass("collapsed");
					}
				} );
				var _this = this;

				//Remove search results slide collapsed state
				var slidesSearchResults = mediaBoxes.filter( ":not(.resultNoMatch).slideBox.collapsed" );
				_this.inSlideAnimation = slidesSearchResults.length ? true : false;
				if ( _this.inSlideAnimation ) {
					_this.transitionsToBeFired = slidesSearchResults.length;
					_this.initSlideAnimation( slidesSearchResults );
					slidesSearchResults.removeClass( "collapsed" );
				}
			}
		},
		resetSearchResults: function(){
			if (this.searchResultShown) {
				this.searchResultShown = false;
				this.enableChapterToggle();
				var mediaBoxes = this.getMediaListDomElements();
				//Remove search results slide collapsed state (only to slides under chapters)
				var slidesSearchResults = mediaBoxes.filter(":not(.resultNoMatch.collapsed).slideBox[data-chapter-index!=-1]");
				this.inSlideAnimation = slidesSearchResults.length ? true : false;
				this.transitionsToBeFired = slidesSearchResults.length;
				slidesSearchResults.addClass("collapsed");
				mediaBoxes.filter(".chapterBox" ).addClass( "resultNoMatch" );
				this.doOnSlideAnimationEnded(function() {
					mediaBoxes.removeClass( "resultNoMatch" );
					var chapters = this.getMediaListDomElements().filter( ".chapterBox" );
					var expandedChapters = chapters.filter( "[data-chapter-collapsed=false]" );
					this.toggleChapter( expandedChapters );
				});
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
		getMedialistFooterComponent: function(){
			if (!this.$bottomBar){
				this.$bottomBar = $("<div/>", {"class": "footer"});
				this.getComponent().append(this.$bottomBar);
			}
			return this.$bottomBar;
		},
		renderBottomBar: function(){
			this.getMedialistFooterComponent().empty();
			var bottomBar = $("<div/>", {"class": "footerWrapper"} )
					.append($("<span/>", {"class": "slideLocator icon-locator", "title": gM("ks-chapters-locate-active-media")}))
					.append($("<span/>", {"class": "toggleAll icon-toggleAll", "title": gM("ks-chapters-toggle-all-chapter")}));
			this.getMedialistFooterComponent().append(bottomBar);
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
			if (this.getConfig("closeOnClick") && (this.getConfig('parent') === 'sideBarContainer')){
				this.getPlayer().triggerHelper("closeSideBarContainer");
			}
			//disable on items out of DVR - TODO manage this is the data and not in dom
			if(this.getComponent().find( "li[data-mediaBox-index='" + mediaIndex + "']" ).hasClass("out-of-dvr")){
				return;
			}
			//Only apply seek in VOD or in live if DVR is supported
			if ((this.getPlayer().isLive() && this.getPlayer().isDVR()) ||
					!this.getPlayer().isLive()) {
				//Send play request on first click for devices that don't have autoplay, e.g. mobile devices
				if (!this.getPlayer().canAutoPlay() && this.getPlayer().firstPlay){
					this.getPlayer().sendNotification('doPlay');
				}
				if(this.embedPlayer.isDVR() == 1){
                 	var seekTo =  this.mediaList[mediaIndex].startTime-this.embedPlayer.evaluate( '{mediaProxy.entry.firstBroadcast}');
					this.getPlayer().sendNotification('doSeek', seekTo);
				}else{
					// see to start time and play ( +.1 to avoid highlight of prev chapter )
					this.getPlayer().sendNotification('doSeek', ( this.mediaList[mediaIndex].startTime ) + 0.1);

				}
			}
		},
		doOnScrollerUpdate: function(data){
			//If maximum scroll has changed then reset last position
			if (this.maximumScroll !== data.maximum ||
					this.previousDirection !== data.direction){
				this.lastScrollPosition = data.position;
			}
			//Save data for comparison on next iteration
			this.maximumScroll = data.maximum;
			this.previousDirection = data.direction;
			//Set anchor position after maximize/minimize was performed
			if (this.lastScrollPosition === -1){
				//Set initial location of scroll bar
				this.lastScrollPosition = data.position;
			}
			if ((data.direction === "up") || (data.position === 0)){
				//On scroll up maximize searchbar after 10% scroll from max scroll height
				//or when scroll to top
				if (this.barsMinimized && ((this.lastScrollPosition - data.position) / this.maximumScroll) > 0.05){
					this.barsMinimized = false;
					this.maximizeSearchBar();
					this.lastScrollPosition = -1;
				}
			} else {
				//On scroll down minimize searchbar after 20% scroll from max scroll height
				//or when scroll to bottom
				if ((!this.barsMinimized &&
						((data.position - this.lastScrollPosition) / this.maximumScroll) > 0.1) ||
						(data.position === data.maximum)){
					this.barsMinimized = true;
					this.minimizeSearchBar();
					this.lastScrollPosition = -1;
				}
			}
			//Remove focus from searchbox to enable maximize on focus
			this.$searchFormWrapper.blur();
			this.$searchFormWrapper.find("#searchBox").blur();
		},
		findActiveItem: function(data, startIndex){
			var activeItemIndex = -1;
			var time = this.getPlayer().currentTime;
			var item;
			var i = (startIndex > -1) ? startIndex : 0;

			for (i; i < data.length; i++){
				item = data[i];
				if ((time >= item.startTime ) && (time < item.endTime )){
					activeItemIndex = i;
					break;
				}
			}
			return activeItemIndex;
		},
		updateActiveItem: function () {
			if (!this.freezeTimeIndicators) {
				this.updateActiveChapter();
				this.updateActiveSlide();
				if(this.dvrWindow){
					this.disableWindowDvrSlides()
				}
			}
		},
        disableWindowDvrSlides: function(){
            var currentTime = Math.ceil(this.getPlayer().LiveCurrentTime+ this.embedPlayer.getLiveEdgeOffset());
			var dvrWindow = 30*60;//this.dvrWindow

			if(isNaN(currentTime)){
				//no ID3 data yet - disable all slides until we have timestamp data
                for(var i=0;i<this.slidesMap.length;i++){
                    var slide =  this.getComponent().find( "li[data-mediaBox-index='" + i + "']" );
					$(slide).addClass("out-of-dvr");
                }
                return;
			}
			for(var i=0;i<this.slidesMap.length;i++){
                var slide =  this.getComponent().find( "li[data-mediaBox-index='" + i + "']" );
				if(currentTime && this.slidesMap[i].endTime < currentTime-dvrWindow ){
					$(slide).addClass("out-of-dvr");
				}else{
					$(slide).removeClass("out-of-dvr");
				}
				//handle edge cae of last item
                if(i==this.slidesMap.length-1){
					$(slide).removeClass("out-of-dvr");
				}
			}

        },
		updateActiveSlide: function(){
			var activeSlideIndex = this.findActiveItem(this.slidesMap, this.selectedSlideIndex);
			if (activeSlideIndex < 0 && this.isLiveCuepoints()){
				activeSlideIndex = this.slidesMap[this.slidesMap.length-1].order;
			}

			if (activeSlideIndex >= 0) {
				var activeDomObj;
				// Check if active is not already set:
				var item;
				if (this.selectedSlideIndex === activeSlideIndex) {
					// update state current active slide:
					item = this.slidesMap[activeSlideIndex];
					if (item && !item.active) {
						this.setSelectedMedia(item.order);
						item.active = true;
						activeDomObj = this.getActiveItem();
						activeDomObj.find(".slideOverlay").addClass("watched");
					}
				} else {
					// update state of previous active slide:
					item = this.slidesMap[this.selectedSlideIndex];
					if (item && item.active) {
						item.active = false;
					}
					activeDomObj = this.getActiveItem();
					activeDomObj.find(".slideOverlay").removeClass("watched");

					// Check if we should pause on chapter update:
					if (this.getConfig('pauseAfterChapter') && !this.skipPauseFlag) {
						this.getPlayer().sendNotification('doPause');
					}
					// restore skip pause flag:
					this.skipPauseFlag = false;
				}
			}
			this.selectedSlideIndex = activeSlideIndex;
		},
		updateActiveChapter: function(){
			if(this.chaptersMap.length > 0){
				var activeChapterNumber = this.findActiveItem(this.chaptersMap, this.selectedChapterIndex);
				var actualActiveIndex = this.selectedChapterIndex;
				if ((activeChapterNumber > -1) && (actualActiveIndex === activeChapterNumber)) {
					this.updateChapterProgress(activeChapterNumber);
				} else if (actualActiveIndex > -1){
					this.resetChapterProgress(actualActiveIndex);
				}

				this.selectedChapterIndex = activeChapterNumber;
			}
		},
		updateChapterProgress: function(index){
			if (index > -1 && index < this.chaptersMap.length) {
				var chapterObj = this.chaptersMap[index];
				var endTime = chapterObj.endTime;
				var countDown = endTime - this.getPlayer().currentTime;
				this.updateActiveChapterDuration(chapterObj.order, countDown);
			} else{
				this.log("error - tried to access chapters out of index bound");
			}
		},
		resetChapterProgress: function(index){
			if (index > -1 && index < this.chaptersMap.length) {
				var chapterObj = this.chaptersMap[index];
				var endTime = chapterObj.endTime;
				var startTime = chapterObj.startTime;
				this.updateActiveChapterDuration(chapterObj.order, endTime - startTime);
			} else {
				this.log("error - tried to access chapters out of index bound");
			}
		},
		updateActiveChapterDuration: function(chapterNumber, remainingDuration){
			var actualMediaBoxIndex = this.selectedMediaItemIndex;
			this.setSelectedMedia( chapterNumber );
			this.updateActiveItemDuration( remainingDuration );
			this.setSelectedMedia( actualMediaBoxIndex );
		},
		attachMediaListHandlers: function(){
			var _this = this;
			this._super();
			var delay = 0.1;
			this.transitionsToBeFired = 0;
			var slideBoxes = this.getComponent().find(".slideBox" );
			slideBoxes
					.off('transitionend webkitTransitionEnd' )
					.on('transitionend webkitTransitionEnd', function(e){
						var $target = $( e.target ); // target letter transitionend fired on
						if ( /transform/i.test( e.originalEvent.propertyName ) ) { // check event fired on "transform" prop
							_this.transitionsToBeFired -= 1;
							_this.transitionsToBeFired = _this.transitionsToBeFired < 0 ? 0 : _this.transitionsToBeFired;
							$target.css( {transitionDelay: '0ms'} ); // set transition delay to 0 so when 'dropped' class is removed, letter appears instantly
							if ( _this.transitionsToBeFired === 0 ) { // all transitions on characters have completed?
								delay = 0.1;
								_this.renderScroller({stop: false});
								_this.inSlideAnimation = false;
								_this.getPlayer().triggerHelper("slideAnimationEnded");
							}
						}
					})
					//Set handler for TAB between chapters and slides
					.off('focus').on('focus', function(e){
				//Calculate if TAB forward or TAB backward(SHIFT+TAB)
				var prev = $(e.relatedTarget ).data("mediaboxIndex");
				var cur = $(this).data("mediaboxIndex");
				var direction = (cur-prev) === 1 ? 1 : 0;
				//Get the associated chapter of the slide
				var slideChapterIndex = $(this).data( "chapterIndex" );
				var chapter = _this.getMediaListDomElements()
						.filter( ".chapterBox[data-chapter-index=" + slideChapterIndex + "]" );
				chapter = $(chapter);
				//If slide is under a collapsed chapter then go to associated chapter
				var chapterCollapsed = (chapter.attr("data-chapter-collapsed") === "true");
				if (chapterCollapsed){
					var targetChapter = _this.getMediaListDomElements()
							.filter( ".chapterBox[data-chapter-index=" + (slideChapterIndex + direction ) + "]" );
					if (targetChapter) {
						targetChapter.focus();
					}
				}
			});

			var mediaBoxes = this.getMediaListDomElements();
			mediaBoxes.on('mousedown mouseup mouseout', function(){
				this.blur();
			});

			this.getComponent().find(".slideBoxToggle")
					.off("click").on("click", function(e){
				e.stopPropagation();
				var chapter = $( this ).parent();
				_this.toggleChapter(chapter);
			});

			this.getMedialistFooterComponent()
					.find(".toggleAll" )
					.off("click").on("click", function(){
				if (_this.chapterToggleEnabled) {
					var chapters = _this.getMediaListDomElements().filter( ".chapterBox" );
					var collapsedChapters = chapters.filter( "[data-chapter-collapsed=true]" );
					var expandedChapters = chapters.filter( "[data-chapter-collapsed=false]" );
					if ( chapters.length === collapsedChapters.length || chapters.length === expandedChapters.length ) {
						_this.toggleChapter( chapters );
					} else if ( collapsedChapters.length >= expandedChapters.length ) {
						_this.toggleChapter( expandedChapters );
					} else {
						_this.toggleChapter( collapsedChapters );
					}
				}
			});

			this.getMedialistFooterComponent()
					.find(".slideLocator" )
					.off("click").on("click", function(){
				_this.scrollToActiveItem();
			});
		},
		collapseAll: function(){
			if (this.chapterToggleEnabled) {
				var expandedChapters = this.getMediaListDomElements().filter( ".chapterBox[data-chapter-collapsed=false]" );
				this.toggleChapter( expandedChapters );
			}
		},
		expendAll: function(){
			if (this.chapterToggleEnabled) {
				var collapsedChapters = this.getMediaListDomElements().filter( ".chapterBox[data-chapter-collapsed=true]" );
				this.toggleChapter( collapsedChapters );
			}
		},
		toggleChapter: function(chapters){
			var _this = this;
			$.each(chapters, function(index, chapter){
				chapter = $(chapter);
				chapter.toggleClass( "collapsed" );
				var chapterToggleId = parseInt( chapter.attr( "data-chapter-index" ), 10 );
				var targets = _this.getComponent().find( ".slideBox[data-chapter-index=" + chapterToggleId + "]" );
				_this.renderScroller({stop: true});
				_this.inSlideAnimation = true;
				_this.transitionsToBeFired = targets.length;
				if (chapter.attr("data-chapter-collapsed") === "true") {
					chapter.attr("data-chapter-collapsed", false);
					_this.initSlideAnimation(targets);
					targets.removeClass( "collapsed" );
				} else {
					chapter.attr("data-chapter-collapsed", true);
					targets.addClass( "collapsed" );
				}
			});
		},
		initSlideAnimation: function(slides){
			var _this = this;
			var delay = 0.1;
			if (mw.getConfig( 'EmbedPlayer.AnimationSupported')) {
				slides.each( function () {
					$( this ).css( {transitionDelay: delay + 's'} ); // apply sequential trans delay to each character
					delay += 0.1;
				} );
			} else {
				setTimeout(function(){
					_this.inSlideAnimation = false;
					_this.renderScroller({stop: false});
					_this.getPlayer().triggerHelper("slideAnimationEnded");
				}, 500);
			}
		},
		scrollToItem: function(index){
			var item = this.mediaList[index];
			var _this = this;
			if (item) {
				this.resetSearchResults();
				this.doOnSlideAnimationEnded(function(){
					var mediaBox = _this.getMediaListDomElements()
							.filter( ".mediaBox[data-mediaBox-index=" + item.order + "]" );
					if ( item.type === mw.KCuePoints.THUMB_SUB_TYPE.SLIDE ) {
						if ( item.hasParent ) {
							if ( mediaBox.hasClass( "collapsed" ) ) {
								var chapter = _this.getMediaListDomElements()
										.filter( ".chapterBox[data-chapter-index=" + item.chapterNumber + "]" );
								_this.toggleChapter( chapter );
							}
						}
					}
					_this.doOnSlideAnimationEnded(function(){
						_this.lastScrollPosition = -1;
						_this.$scroll.nanoScroller( { scrollTo: mediaBox, flash: true } );
					});
				});
			}
		},
		scrollToActiveItem: function(){
			this.scrollToItem(this.selectedMediaItemIndex);
		},
		doOnSlideAnimationEnded: function(fn){
			if (this.inSlideAnimation){
				var _this = this;
				this.bind("slideAnimationEnded", function(){
					_this.unbind("slideAnimationEnded");
					fn.apply(_this);
				});
			} else {
				fn.apply(this);
			}
		},
		show: function(){
			this.getComponent().show();
			this.getComponent().attr("data-visibility", "visible");
			this.getPlayer().triggerHelper("layoutChange." + this.getConfig("parent"));
		},
		hide: function(){
			this.getComponent().hide();
			this.getComponent().attr("data-visibility", "hidden");
			this.getPlayer().triggerHelper("layoutChange." + this.getConfig("parent"));
		}
	}));
})(window.mw, window.jQuery);
