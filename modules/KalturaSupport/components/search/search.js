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
			'cuePointType': ['thumbCuePoint.Thumb'],
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
			'cssFileName': 'search.css',
			'animationSupported': false,
			'searchApi': ''
		},

		mediaList: [],
		cache: [],

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
			this.searchBarActive = false;
			//Create search bar UI
			var searchFormWrapper = $("<div/>", {"class": "searchFormWrapper"} ).appendTo(this.getMedialistHeaderComponent());
			$("<form>" ).append(
				$("<input id='searchBox' type='text' placeholder='Search...' required>" )

			).append(
				$("<span id='searchBoxIcon' class='icon-magnifyGlass'>")
			).appendTo(searchFormWrapper);
			//Attach search icon handler
			searchFormWrapper.find("#searchBoxIcon" )
				.on('click', function(){
					searchFormWrapper.find("#searchBox" ).val('');
					_this.getMedialistComponent().empty();
				});
			//Attach cancel handler
			$("<span id='searchBoxCancel'>" )
				.html("Cancel")
				.on('click', function(e){
					_this.searchBarActive = false;
					$(this ).hide();
					searchFormWrapper.find("#searchBox" ).val('');
					searchFormWrapper
						.find("form").css("width", "100%" )
						.find("#searchBoxIcon").removeClass("icon-clear" ).addClass("icon-magnifyGlass");

//					debugger;
//					_this.getComponent().css("display", "inline-block");
					_this.getComponent().css({"height": orig});
					_this.getMedialistComponent().css({"height": "0"});
					_this.getMedialistComponent().empty();
					_this.getPlayer().triggerHelper('show');
					e.preventDefault();
				})
				.appendTo(searchFormWrapper);
			//Attach search form handlers
			searchFormWrapper.find("form")
				//Search bar animation
				.on('click', function(){
					if (!_this.searchBarActive) {
						_this.searchBarActive = true;
						var transitionendHandler = function () {
							$( this ).off( 'transitionend webkitTransitionEnd' );
							searchFormWrapper.find( "#searchBoxCancel" ).show();
						};
						if ( _this.getConfig( 'animationSupported' ) ) {
							$( this ).one( 'transitionend webkitTransitionEnd', transitionendHandler );
						} else {
							setTimeout( transitionendHandler, 100 );
						}
						$( this ).width( "80%" )
							.find( "#searchBoxIcon" ).removeClass( "icon-magnifyGlass" ).addClass( "icon-clear" );
					}
				})
				//Prevent submit on form
				.on('submit', function(e){
					e.preventDefault();
					return false;
				});
			//Attach search bar autocomplete
			var orig = _this.getComponent().css("height");
			searchFormWrapper.find('#searchBox').autocomplete({
				appendTo: ".sideBarContainer",
				position: { my : "left top+3", at: "left bottom", of: ".searchFormWrapper" },
				select: function( event, ui ) {
					console.log(ui);
//					debugger;
					_this.getPlayer().triggerHelper('hide');
					_this.getComponent().css({"height": "100%"});
					_this.mediaList = [];
					_this.addItems(ui.item.results);
					_this.renderMediaList();
				},
				minLength: 2,
				source1: function( request, response ) {
					var term = request.term;
					if ( term in _this.cache ) {
						response( _this.cache[ term ] );
						return;
					}

					$.getJSON( _this.getConfig('searchApi'), request, function( data, status, xhr ) {
						//TODO::Validate response
						//TODO::parse response to autocomplete format
						_this.cache[ term ] = data;
						response( data );
					});
				},
				source: [
					{"label": "ActionScript", "value": "ActionScript", "results": [{id:1, title: "Title", startTime: "147"}, {id:1, title: "Title", startTime: "147"}]},
					{"label": "AppleScript", "value": "AppleScript", "results": [{id:1, title: "Title", startTime: "147"}, {id:1, title: "Title", startTime: "147"}]},
					{"label": "Asp", "value": "ActionScript", "results": [{id:1, title: "Title", startTime: "147"}, {id:1, title: "Title", startTime: "147"}]},
					{"label": "BASIC", "value": "ActionScript", "results": [{id:1, title: "Title", startTime: "147"}, {id:1, title: "Title", startTime: "147"}]},
					{"label": "C", "value": "ActionScript", "results": [{id:1, title: "Title", startTime: "147"}, {id:1, title: "Title", startTime: "147"}]},
					{"label": "C++", "value": "ActionScript", "results": [{id:1, title: "Title", startTime: "147"}, {id:1, title: "Title", startTime: "147"}]},
					{"label": "Clojure", "value": "ActionScript", "results": [{id:1, title: "Title", startTime: "147"}, {id:1, title: "Title", startTime: "147"}]},
					{"label": "COBOL", "value": "ActionScript", "results": [{id:1, title: "Title", startTime: "147"}, {id:1, title: "Title", startTime: "147"}]},
					{"label": "ColdFusion", "value": "ActionScript", "results": [{id:1, title: "Title", startTime: "147"}, {id:1, title: "Title", startTime: "147"}]},
					{"label": "Erlang", "value": "ActionScript", "results": [{id:1, title: "Title", startTime: "147"}, {id:1, title: "Title", startTime: "147"}]},
					{"label": "Fortran", "value": "ActionScript", "results": [{id:1, title: "Title", startTime: "147"}, {id:1, title: "Title", startTime: "147"}]},
					{"label": "Groovy", "value": "ActionScript", "results": [{id:1, title: "Title", startTime: "147"}, {id:1, title: "Title", startTime: "147"}]},
					{"label": "Haskell", "value": "ActionScript", "results": [{id:1, title: "Title", startTime: "147"}, {id:1, title: "Title", startTime: "147"}]},
					{"label": "Java", "value": "ActionScript", "results": [{id:1, title: "Title", startTime: "147"}, {id:1, title: "Title", startTime: "147"}]},
					{"label": "JavaScript", "value": "ActionScript", "results": [{id:1, title: "Title", startTime: "147"}, {id:1, title: "Title", startTime: "147"}]},
					{"label": "Lisp", "value": "ActionScript", "results": [{id:1, title: "Title", startTime: "147"}, {id:1, title: "Title", startTime: "147"}]},
					{"label": "Perl", "value": "ActionScript", "results": [{id:1, title: "Title", startTime: "147"}, {id:1, title: "Title", startTime: "147"}]},
					{"label": "PHP", "value": "ActionScript", "results": [{id:1, title: "Title", startTime: "147"}, {id:1, title: "Title", startTime: "147"}]},
					{"label": "Python", "value": "ActionScript", "results": [{id:1, title: "Title", startTime: "147"}, {id:1, title: "Title", startTime: "147"}]},
					{"label": "Ruby", "value": "ActionScript", "results": [{id:1, title: "Title", startTime: "147"}, {id:1, title: "Title", startTime: "147"}]},
					{"label": "Scala", "value": "ActionScript", "results": [{id:1, title: "Title", startTime: "147"}, {id:1, title: "Title", startTime: "147"}]},
					{"label": "Scheme", "value": "ActionScript", "results": [{id:1, title: "Title", startTime: "147"}, {id:1, title: "Title", startTime: "147"}]}]
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
		getSearchData: function(){
			var _this = this;
			//Init data provider
			var cuePoints = this.getPlayer().kCuePoints.getCuePoints();
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
			return filteredCuePoints;
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