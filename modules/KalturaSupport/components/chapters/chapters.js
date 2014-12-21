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
			'titleLimit': 150,
			'descriptionLimit': 80,
			'overflow': false,
			'includeThumbnail': true,
			'includeItemStartTime': true,
			'includeItemNumberPattern': false,
			'includeMediaItemDuration': true,
			'onPage': false,
			'includeHeader': true,
			'cssFileName': 'modules/KalturaSupport/components/chapters/chapters.css',
			'minDisplayWidth': 0,
			'minDisplayHeight': 0
		},

		mediaList: [],
		renderOnData: false,
		freezeTimeIndicators: false,

		setup: function (embedPlayer) {
			this.addBindings();
			if (this.getPlayer().isLive() && mw.getConfig("EmbedPlayer.LiveCuepoints")) {
				this.setConfig("includeMediaItemDuration", false);
			}
		},
		addBindings: function () {
			var _this = this;

			this.bind('KalturaSupport_ThumbCuePointsReady', function () {
				//Get chapters data from cuepoints
				var chaptersRawData = _this.getCuePoints();
				//Create media items from raw data
				_this.addMediaItems(chaptersRawData);
				_this.markMediaItemsAsDisplayed(_this.mediaList);
				//Need to recalc all durations after we have all the items startTime values
				_this.setMediaItemTime();
				//Set data initialized flag for handlers to start working
				_this.dataIntialized = true;
				if (_this.renderOnData) {
					_this.renderOnData = false;
					_this.renderMediaList();
					_this.updateActiveItem();
				}
			});

			this.bind('KalturaSupport_ThumbCuePointsUpdated', function (e, cuepoints) {
				if (!_this.dataIntialized) {
					_this.dataIntialized = true;
				}
				cuepoints.sort(function (a, b) {
					return a.startTime - b.startTime;
				});
				_this.addMediaItems(cuepoints);

				_this.setMediaItemTime();
			});

			this.bind("freezeTimeIndicators", function(e, val){
				_this.freezeTimeIndicators = val;
			});

			this.bind("monitorEvent", function (e, time) {
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

			this.bind('playerReady', function (e, newState) {
				if (_this.dataIntialized) {
					_this.renderMediaList();
					_this.updateActiveItem();
				} else {
					_this.renderOnData = true;
				}
				_this.renderSearchBar();
			});

			this.bind('hide', function (e, newState) {
				_this.getComponent().hide();
			});
			this.bind('show', function (e, newState) {
				_this.getComponent().show();
			});

			this.bind('updatePlayHeadPercent', function (e, newState) {
				if (_this.dataIntialized) {
					_this.updateActiveItem();
				}
			});

			this.bind('onChangeMedia', function () {
				_this.dataIntialized = false;
				_this.mediaList = [];
			});
		},
		isSafeEnviornment: function () {
			var cuePoints = this.getCuePoints();
			var cuePointsExist = (cuePoints.length > 0) ? true : false;
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
			var templateData = this.getTemplateHTML({meta: this.getMetaData(), mediaList: mediaListItems});
			var items = $(templateData).find("li");

			return items;
		},
		addMediaItems: function (items) {
			var _this = this;
			$.each(items, function (index, item) {
				var mediaItem;
				var customData = item.partnerData ? JSON.parse(item.partnerData) : {};
				var title = item.title || customData.title;
				var description = item.description || customData.desc;
				var thumbnailUrl = item.thumbnailUrl || customData.thumbUrl || _this.getThumbUrl(item);
				var thumbnailRotatorUrl = _this.getConfig('thumbnailRotator') ? _this.getThumRotatorUrl() : '';
				var mediaItemId = _this.mediaList.length;

				mediaItem = {
					order: mediaItemId,
					id: item.id,
					title: title,
					description: description,
					width: _this.getConfig('mediaItemWidth'),
					height: _this.getConfig('mediaItemHeight'),
					thumbnail: {
						url: thumbnailUrl,
						thumbAssetId: item.assetId,
						rotatorUrl: thumbnailRotatorUrl
					},
					startTime: item.startTime / 1000,
					startTimeDisplay: _this.formatTimeDisplayValue(kWidget.seconds2npt(item.startTime / 1000)),
					endTime: null,
					durationDisplay: null,
					chapterNumber: _this.getItemNumber(mediaItemId)

				};
				_this.mediaList.push(mediaItem);
			});
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
					response[index]['url'] = url;

				});
				callback.apply(_this, [response]);
			});
		},
		setMediaItemTime: function () {
			var _this = this;
			$.each(this.mediaList, function (index, item) {
				if (_this.mediaList[index + 1]) {
					item.endTime = _this.mediaList[index + 1].startTime;
				} else {
					item.endTime = _this.getPlayer().duration;
				}

				item.durationDisplay = kWidget.seconds2npt((item.endTime - item.startTime));
			});
		},
		formatTimeDisplayValue: function (time) {
			// Add 0 padding to start time min
			var timeParts = time.split(':');
			if (timeParts.length == 2 && timeParts[0].length == 1) {
				time = '0' + time;
			}
			return time;
		},

		dataSet: null,
		searchExpression: "",

		renderSearchBar: function(){
			var _this = this;

			var searchFormWrapper = $("<div/>", {"class": "searchFormWrapper"} )
				.append($("<div id='searchBoxIcon' class='searchIcon icon-magnifyGlass'>"))

				.append($("<div id='searchBoxCancelIcon' class='searchIcon icon-clear'>")
					.on("click touchend", function(){
						$("#searchBox" ).val("" ).focus();
						$('#searchBox').typeahead("val", "").typeahead("close");
						$( "#searchBoxCancelIcon" ).css( "visibility", "hidden" );
					})
			)
				.append($("<div id='middle'/>" )
					.append($("<input id='searchBox' type='text' placeholder='Search' required>" )
						.on('change keyup paste input', function(e) {
							if (this.value.length > 0) {
								$( "#searchBoxCancelIcon" ).css( "visibility", "visible" );
							} else {
								$( "#searchBoxCancelIcon" ).css( "visibility", "hidden" );
							}
						})
						.on("focus", function(){
							_this.getPlayer().triggerHelper("onDisableKeyboardBinding");
						})
						.on("blur", function(){
							_this.getPlayer().triggerHelper("onEnableKeyboardBinding");
						}))
			);


			this.getMedialistHeaderComponent().append(searchFormWrapper);

			function findMatches(q, cb) {
				_this.getSearchData(q, function(strs){
					var matches, substrRegex;

					// an array that will be populated with substring matches
					matches = [];

					// regex used to determine if a string contains the substring `q`
					substrRegex = new RegExp(escape(q), 'i');

					// iterate through the pool of strings and for any string that
					// contains the substring `q`, add it to the `matches` array
					$.each(strs, function(i, str) {
						if (substrRegex.test(str.data)) {
							// the typeahead jQuery plugin expects suggestions to a
							// JavaScript object, refer to typeahead docs for more info
							matches.push({ value: str });
						}
					});

					cb(matches);
				});
			};

			var parseData = function(obj){
				var startOfMatch = obj.value.data.toLowerCase().indexOf(_this.searchExpression.toLowerCase());
				if (startOfMatch > -1) {
					var expLen = _this.searchExpression.length;
					var dataLen = obj.value.data.length;
					var restOfExpLen = dataLen - (startOfMatch + expLen);
					var hintLen = Math.floor( restOfExpLen * 0.2 );
					return obj.value.data.substr( startOfMatch, expLen + hintLen );
				} else {
					return obj.value.data;
				}
			};

			var typeahead = $('#searchBox').typeahead({
					minLength: 3,
					highlight: true
				},
				{
					name: 'label',
					displayKey: function(obj){
						return parseData(obj);
					},
					templates:{
						suggestion: function(obj){
							return parseData(obj) + "..."
						}
					},
					source: findMatches
				} ).
				on("typeahead:selected", function(e, obj, label){
					var mediaBoxes = _this.getMediaListDomElements();
					mediaBoxes.css("display", "none");
					mediaBoxes.parent().find("[data-obj-id='" + obj.value.id + "']").css("display", "");
				} ).
				on("keyup", function(event){
					if(event.keyCode == 13) {
						typeahead.typeahead("close");
					}
				});

		},
		getSearchData: function(expression, callback){
			this.searchExpression = expression;
			if (expression.length == 3){
				this.dataSet = null
			}
			if (expression.length > 3 && this.dataSet){
				return callback(this.dataSet);
			}

			var _this = this;

			var type = this.getConfig("cuePointType" )[0].main;
			var subType = 1;//this.getConfig("cuePointType" )[0].sub.toString();

			this.getKalturaClient().doRequest({
					'service': 'cuepoint_cuepoint',
					'action': 'list',
					'filter:entryIdEqual': _this.embedPlayer.kentryid,
					'filter:objectType': 'KalturaCuePointFilter',
//					'filter:cuePointTypeIn': type,
//					'filter:subTypeIn': subType,
					'filter:freeText': expression + "*"

				},
				function (data) {
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

					if (callback) {
						callback(results);
					}
				}
			);
		},
		isValidResult: function (data) {
			// Check if we got error
			if (!data
				||
				( data.code && data.message )
				) {
				//this.log('Error getting related items: ' + data.message);
				//this.getBtn().hide();
				this.error = true;
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
			this.getPlayer().sendNotification('doSeek', ( this.mediaList[mediaIndex].startTime ) + .1);
		},
		updateActiveItem: function () {
			var _this = this;
			// search chapter for current active
			var activeIndex = 0;
			var time = this.getPlayer().currentTime;
			$.each(this.mediaList, function (inx, item) {
				if (time > ( item.startTime )) {
					activeIndex = inx;
				}
			});
			var $activeChapter = this.getActiveItem();
			var actualActiveIndex = this.selectedMediaItemIndex;
			// Check if active is not already set:
			if (actualActiveIndex == activeIndex) {
				// update duration count down:
				var item = this.mediaList[ activeIndex ];
				if (item) {
					if (!item.active) {
						this.setSelectedMedia(activeIndex);
						item.active = true;
					}
					var endTime = item.endTime;
					var countDown = Math.abs(time - endTime);
					this.updateActiveItemDuration(countDown);
				}
			} else {
				var item = _this.mediaList[ actualActiveIndex ];
				if (item && item.active) {
					item.active = false;
					var startTime = item.startTime;
					var endTime = item.endTime;
					this.updateActiveItemDuration(endTime - startTime);
				}

				// Check if we should pause on chapter update:
				if (this.getConfig('pauseAfterChapter') && !this.skipPauseFlag) {
					this.getPlayer().sendNotification('doPause');
				}
				// restore skip pause flag:
				this.skipPauseFlag = false;

				if (this.mediaList[ activeIndex ]) {
					this.setSelectedMedia(activeIndex);
				}
			}
		}
	}));
})(window.mw, window.jQuery);