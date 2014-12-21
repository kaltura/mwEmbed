(function ( mw, $ ) {
	"use strict";

	mw.PluginManager.add( 'search', mw.KBaseMediaList.extend( {

		defaultConfig: {
			'parent': 'sideBarContainer',
			'containerPosition': null,
			'order': 1,
			'showTooltip': false,
			"displayImportance": 'high',
			'templatePath': 'components/search/search.tmpl.html',
			'cuePointType': [{
				"main": mw.KCuePoints.TYPE.THUMB,
				"sub": [mw.KCuePoints.THUMB_SUB_TYPE.SLIDE,
					mw.KCuePoints.THUMB_SUB_TYPE.CHAPTER]
			}],
			'oneSecRotatorSlidesLimit': 61,
			'twoSecRotatorSlidesLimit': 250,
			'maxRotatorSlides': 125,
			'mediaItemWidth': null,
			'mediaItemHeight': 30,
			'titleLimit': 40,
			'descriptionLimit': 80,
			'overflow': false,
			'includeThumbnail': false,
			'includeItemStartTime': true,
			'includeItemNumberPattern': false,
			'includeMediaItemDuration': false,
			'onPage': false,
			'includeHeader': true,
			'cssFileName': 'search.css',
			'animationSupported': false,
			'searchApi': ''
		},

		mediaList: [],
		cache: [],
		dataSet: null,
		searchExpression: "",

		isDisabled: true,

		setup: function ( embedPlayer ) {
			this.checkAnimationSupport();
			this.addBindings();
		},
		addBindings: function () {
			var _this = this;

			this.bind( 'playerReady', function ( e, newState ) {
				_this.renderSearchBar();
			});

			this.bind( 'onChangeMedia', function(){
				_this.destroy();
				// redraw the list
				_this.shouldAddScroll();
			});
		},
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
					_this.addItems([obj.value.cuepoint]);
					_this.renderMediaList();
				} ).
				on("keyup", function(event){
					if(event.keyCode == 13) {
						typeahead.typeahead("close");
					}
				});

		},
		checkAnimationSupport: function ( elm ) {
			elm = elm || document.body || document.documentElement;
			var animation = false,
				animationstring = 'animation',
				keyframeprefix = '',
				domPrefixes = 'Webkit Moz O ms Khtml'.split( ' ' ),
				pfx = '';

			if ( elm.style.animationName !== undefined ) {
				animation = true;
			}

			if ( animation === false ) {
				for ( var i = 0; i < domPrefixes.length; i++ ) {
					if ( elm.style[ domPrefixes[i] + 'AnimationName' ] !== undefined ) {
						pfx = domPrefixes[ i ];
						animationstring = pfx + 'Animation';
						keyframeprefix = '-' + pfx.toLowerCase() + '-';
						animation = true;
						break;
					}
				}
			}

			this.setConfig( 'animationSupported', animation );
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
								data: res.title,
								cuepoint: res
							},{
								id: res.id,
								data: res.description,
								cuepoint: res
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
		addItems: function(items){
			var _this = this;
			$.each(items, function(index, item){
				var mediaItem;
				var customData = item.partnerData ? JSON.parse(item.partnerData) :  {};
				var title = item.title || customData.title;
				var description = item.description || customData.desc;
				var thumbnailUrl = item.thumbnailUrl || customData.thumbUrl || _this.getThumbUrl(item);
				var thumbnailRotatorUrl = _this.getConfig( 'thumbnailRotator' ) ? _this.getThumRotatorUrl() : '';

				mediaItem = {
					order: index,
					id: item.id,
					title: title,
					description: description,
					width: _this.getConfig( 'mediaItemWidth' ),
					height: _this.getConfig( 'mediaItemHeight' ),
					thumbnail: {
						url: thumbnailUrl,
						thumbAssetId: item.assetId,
						rotatorUrl: thumbnailRotatorUrl
					},
					startTime: item.startTime / 1000,
					startTimeDisplay: _this.formatTimeDisplayValue(kWidget.seconds2npt( item.startTime / 1000 )),
					endTime: null,
					durationDisplay: null,
					chapterNumber: _this.getItemNumber(index)

				};
				_this.mediaList.push(mediaItem);
			});
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
		}
	}));
})( window.mw, window.jQuery );