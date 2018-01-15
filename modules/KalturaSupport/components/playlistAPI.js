(function (mw, $) {
	"use strict";

	mw.PluginManager.add('playlistAPI', mw.KBaseMediaList.extend({

		defaultConfig: {
			'templatePath': 'components/playlist/playList.tmpl.html',
			'initItemEntryId': null,
			'autoContinue': false,
			'autoPlay': false,
			'kpl0Name': null,
			'kpl0Url': null,
			'kpl0Id': null,
			'titleLimit': 36,
			'descriptionLimit': 32,
			'resizeThumbnails': true,
			'thumbnailWidth': 86,
			'thumbnailHeight': 48,
			'mediaItemWidth': null,
			'mediaItemHeight': 70,
			'includeThumbnail': true,
			'includeItemNumberPattern': false,
			'includeMediaItemDuration': true,
			'horizontalHeaderHeight': 43,
			'verticalHeaderHeight': 65,
			'hideClipPoster': true,
			'loop': false,
			'overflow': false,
			'cssFileName': 'modules/KalturaSupport/components/playlist/playList.css',
			'showControls': true,
			'MinClips': 2,
			'MaxClips': 25,
			'selectedIndex': 0,
			'includeHeader': true,
			'renderWhenEmpty': false,
			'paging': false,
			'pageSize': 25,
			'showEmptyPlaylistError': true
		},


		loadingEntry: null,      // flag to store the current loading entry
		firstLoad: true,         // Flag for setting initial entry in first load
		kClient: null,           // kClient for API calls
		firstPlay: true,         // firstPlay is used to check if we need to check for autoMute or keep the player volume from previous clip

		currentClipIndex: null,  // currently playing clip index
		currentPlaylistIndex: 0, // current playlist index (when we have more than 1 play lists)
		playlistSet: [],        // array holding all the play lists returned from the server

		videoWidth: null,        // used to save the video width when exiting to full screen and returning
		minClips: null,          // saves the MinClips Flashvar when we switch playlists
		multiplePlayListsReady: false, //Indicate if multiplaylist selector is ready
		playerIsReady: false,
		redrawOnResize: true,
		widthSetByUser: true,    // assuming the user specified the required playlist width. Will be changed if needed in the setup function
		page: 1,                 // start page for paging
		pagingInProgress: false, // flag to block paging call during previous paging
		pagingDone: false,       // flag for when there are no more entries in the next page so no need to load it
		playlistInterfaceHeight: null,

		setup: function (embedPlayer) {
			if ( $(".playlistInterface").length === 0 ){
				$(".mwPlayerContainer").wrap('<div class="playlistInterface" style="position: relative; width: 100%; height: 100%"></div>');
			}
			this.playlistInterfaceHeight = $(".playlistInterface").height();
			if (this.getConfig('includeInLayout') === false) { // support hidden playlists - force onPage and hide its div.
				this.setConfig('onPage', true);
			}
			this.minClips = parseInt(this.getConfig('MinClips'));
			//Backward compatibility setting - set autoplay on embedPlayer instead of playlist
			this.getPlayer().autoplay = (this.getConfig('autoPlay') == true);
			mw.setConfig("autoPlay", this.getPlayer().autoplay);

			if ( !this.getConfig( 'mediaItemWidth') ){
				this.widthSetByUser = false;           // user did not specify a required width. We will set to 320 and apply responsive logic on resizeEvent event
				if ( this.getLayout() === "horizontal" ){
					var width = this.getConfig("fixedControls") ? $( ".playlistInterface" ).width() - this.getConfig("horizontalControlsWidth")*2 : $( ".playlistInterface" ).width();
					this.setConfig( 'mediaItemWidth', Math.floor(width / this.getConfig("MinClips")) );
				}else{
					this.setConfig( 'mediaItemWidth',320); // set default width to 320 if not defined by user
				}
			}

			if (!this.getConfig("includeHeader")){
				this.setConfig('horizontalHeaderHeight', 0);
				this.setConfig('verticalHeaderHeight', 0);
			}
			this.embedPlayer.playlist = true;
			this.addBindings();
			this.loadPlaylists();
			if ( this.getConfig("renderWhenEmpty") ){
				this.getComponent();
			}
		},
		addBindings: function () {
			var _this = this;

			$(this.embedPlayer).unbind(this.bindPostFix);
			this.bind('playerReady', function (e, newState) {
				_this.playerIsReady = true;
				if (_this.playlistSet.length > 0) {
					_this.selectPlaylist(_this.currentPlaylistIndex);
					//Revert block player display after selecting playlist entry
					_this.getPlayer()['data-blockPlayerDisplay'] = false;
				}

				// prevent iframe resize layout refresh  on iOS8
				if ( mw.isIOSAbove7() ){
					_this.redrawOnResize = false;
				}

				_this.unbind('playerReady'); // we want to select the playlist only the first time the player loads
			});

			this.bind('mediaError', function (e) {
				_this.loadingEntry = null; // reset loadingEntry if we got a media error (also media loading error will trigger this event)
				_this.onEnable();
			});

			this.bind('updateLayout', function () {
				if (_this.firstLoad){
					_this.redrawPlaylist();
				}
			});

			// API support + backward compatibility
			$(this.embedPlayer).bind('Kaltura_SetKDPAttribute' + this.bindPostFix, function (event, componentName, property, value) {
				mw.log("PlaylistAPI::Kaltura_SetKDPAttribute:" + property + ' value:' + value);
				switch (componentName) {
					case "playlistAPI.dataProvider":
					case "playlistAPI":
						if (property == "selectedIndex") {
							_this.playMedia(value);
						}
						break;
					case 'tabBar':
					case 'playList':
						if (property == "selectedIndex" && value < _this.playlistSet.length) {
							_this.switchPlaylist(value);
						}
						break;
				}
			});

			$(this.embedPlayer).bind('Kaltura_SendNotification' + this.bindPostFix, function (event, notificationName, notificationData) {
				switch (notificationName) {
					case 'playlistPlayNext':
						_this.playNext();
						break;
					case 'playlistPlayPrevious':
						_this.playPrevious();
						break;
					case 'playlistPlayMediaById':
						_this.playMediaById(notificationData);
						break;
				}
			});

			$(this.embedPlayer).bind('playNextClip', function (event) {
				_this.playNext(true);
			});

			$(this.embedPlayer).bind('playPreviousClip', function (event) {
				_this.playPrevious(true);
			});

			$( this.embedPlayer ).bind('onOpenFullScreen', function() {
				$( ".playlistInterface").height("100%");
				_this.redrawOnResize = false;
				clearTimeout(window.redrawTimeOutID);
			});

			$( this.embedPlayer ).bind('onCloseFullScreen', function() {
				window.redrawTimeOutID = setTimeout(function(){_this.redrawOnResize = true;},2000);
			});

			$( this.embedPlayer ).bind("scrollEnd", function(){
				if ( _this.getConfig('paging') ===  true && !_this.pagingDone && !_this.pagingInProgress ){
					_this.pagingInProgress = true;
					_this.page++; // move to next page
					mw.log("Playlist:: scrollEnd event. paging: true: trying to load next playlist page: page="+_this.page+", pageSize"+_this.getConfig('pageSize'));

					var playlistRequest;
					if (_this.playlistSet[_this.currentPlaylistIndex].playlistParams) {
						// use saved params and extend them with paging params
						playlistRequest = $.extend(_this.playlistSet[_this.currentPlaylistIndex].playlistParams, {
							'pager:objectType': 'KalturaFilterPager',
							'pager:pageIndex': _this.page,
							'pager:pageSize': _this.getConfig('pageSize')
						});
					} else {
						// create params
						playlistRequest = {
							'service': 'playlist',
							'action': 'execute',
							'pager:objectType': 'KalturaFilterPager',
							'pager:pageIndex': _this.page,
							'pager:pageSize': _this.getConfig('pageSize'),
							'id': _this.playlistSet[_this.currentPlaylistIndex].id
						};
					}

					_this.getKClient().doRequest(playlistRequest, function (playlistDataResult) {
						if (playlistDataResult.length){
							_this.addMediaItems(playlistDataResult);
							_this.getTemplateHTML( {meta: _this.getMetaData(), mediaList: playlistDataResult})
								.then(function(medialist) {
									_this.getMedialistComponent().find("ul").append(medialist.find("li"));
									// update "data-mediabox-index" attribute
									_this.getMedialistComponent().find("li").each(function(index, elm){
										$(elm).attr("data-mediabox-index", index);
									});

									if (_this.getLayout() === "horizontal"){
										_this.getMedialistComponent().find('ul').width((_this.getMediaItemBoxWidth()+1)*_this.mediaList.length);
										_this.getMedialistComponent().find('.k-carousel').css('width', _this.getMedialistComponent().width() );
										if (_this.getConfig('fixedControls')){
											var width = _this.getComponent().width() - _this.getConfig("horizontalControlsWidth") *2 ;
											_this.getComponent().find('.k-carousel').css("margin-left",_this.getConfig("horizontalControlsWidth")).width(width);
										}
										var scrollLeft = Math.abs(parseInt(_this.getComponent().find("ul").css("left")));
										var hiddenItems = parseInt(scrollLeft / _this.getConfig( 'mediaItemWidth'));
									}else{
										_this.$scroll.nanoScroller();
									}
									_this.configMediaListFeatures(true);
									_this.getMedialistComponent().find('ul').trigger("refresh",[hiddenItems]);

									$( _this.embedPlayer ).trigger( "mediaListLayoutReady" );
								}, function(msg) {
									_this.page--; // go back to previous page is paging action failed
									mw.log( msg );
								});
						}else{
							_this.pagingDone = true;
						}
						_this.pagingInProgress = false;
					},false,function(){
						mw.log("Error: Playlist:: Playlist paging failed.");
						_this.page--; // go back to previous page is paging action failed
					});
				}
			});

			// set responsiveness
			if ( !mw.isIOS7()) {
				this.bind( 'resizeEvent' , function () {
					$( ".playlistInterface").height("100%");
					_this.redrawPlaylist();
				} );
			}

			$(this.embedPlayer).bind('mediaListLayoutReady', function (event) {
				_this.embedPlayer.triggerHelper('playlistReady');
				_this.setMultiplePlayLists();
				_this.getComponent().find(".k-description-container").dotdotdot();
				// keep aspect ratio of thumbnails - crop and center
				if ( _this.getConfig("resizeThumbnails") ){
					_this.getComponent().find('.k-thumb').not('.resized').each(function () {
						var img = $(this)[0];
						img.onload = function () {
							if (img.naturalWidth / img.naturalHeight > 16 / 9) {
								$(this).height(_this.getConfig('thumbnailHeight'));
								$(this).width(img.naturalHeight * 16 / 9);
								var deltaWidth = ($(this).width() - _this.getConfig('thumbnailWidth')) / 2 * -1;
								$(this).css("margin-left", deltaWidth)
							}
							if (img.naturalWidth / img.naturalHeight < 16 / 9) {
								$(this).width(_this.getConfig('thumbnailWidth'));
								$(this).height(img.naturalWidth * 9 / 16);
								var deltaHeight = ($(this).height() - _this.getConfig('thumbnailHeight')) / 2 * -1;
								$(this).css("margin-top", deltaHeight)
							}
							$(this).addClass('resized');
						};
					});
				}
			});


			// This API is to allow external plugin to replace the current playlist content.
			// Previous content is not saved. player will switch to new playlist when autoInsert is set to true
			// params will have inner objects for playlistParams, autoInsert, playerName and initItemEntryId
			this.bind('loadExternalPlaylist', function (e,params) {
				if(params.initItemEntryId){
					_this.firstLoad = true;
					_this.setConfig("initItemEntryId" ,params.initItemEntryId )
				}
				_this.getKClient().doRequest(params.playlistParams, function (playlistDataResult) {
					if (_this.playlistSet.length === 0){
						_this.playlistSet.push({});
					}
					_this.playlistSet[_this.currentPlaylistIndex].items = playlistDataResult; //apply data to the correct playlist in the playlistSet
					_this.playlistSet[_this.currentPlaylistIndex].playlistParams = params.playlistParams; // save current playlis params for paging

					// reset paging if available
					if (params.playlistParams['pager:pageIndex']) {
						_this.page = params.playlistParams['pager:pageIndex'];
						_this.pagingDone = false;
						_this.pagingInProgress = false;
					}
					if(params.playlistName){
						_this.playlistSet[_this.currentPlaylistIndex].name = params.playlistName; //apply data to the correct playlist in the playlistSet
					}
					_this.selectPlaylist(_this.currentPlaylistIndex);
					_this.redrawPlaylist();
					_this.currentClipIndex = -1; //reset index of current clip so "next" will play the first item of the new loaded playlist
					if(params.autoInsert){
						_this.playNext();
					}else{
						_this.getMedialistComponent().find("li").removeClass("active");
					}
				})
			});



		},
		redrawPlaylist: function(){
			var _this = this;
			if (!this.getPlayer().layoutBuilder.isInFullScreen() && this.redrawOnResize && this.playlistSet.length > 0) {
				// decide the width of the items. For vertical layout: 3rd of the container. For horizontal: according to MinClips value
				if ( this.getLayout() === "vertical" ){
					var saveScrollTop = this.getMedialistComponent().find(".nano-content").scrollTop(); // save scrollTop
					if ( !this.widthSetByUser ){
						if ( $( ".playlistInterface" ).width() / 3 > this.getConfig( 'mediaItemWidth' ) ) {
							this.setConfig( 'mediaItemWidth', $( ".playlistInterface" ).width() / 3 );
						}else{
							this.setConfig( 'mediaItemWidth',320);
						}
					}
				}else{
					var width = this.getConfig("fixedControls") ? $( ".playlistInterface" ).width() - this.getConfig("horizontalControlsWidth")*2 : $( ".playlistInterface" ).width();
					// if the number of items in the playlist is lower than MinClips, calculate mediaItemWidth according to it, else according to MinClips settings
					var itemsNumber = this.playlistSet.length ? this.playlistSet[this.currentPlaylistIndex].items.length : this.getConfig('MinClips');
					var clipsNumber = itemsNumber < this.getConfig('MinClips') ? itemsNumber : this.minClips;
					this.setConfig('mediaItemWidth', Math.floor(width / clipsNumber));
				}
				if ( this.getConfig('onPage') !== true ){ // do not refresh mediaListContainer on page
					this.$mediaListContainer = null;
					this.getMedialistContainer();
				}
				this.renderMediaList(function(){
					if ( _this.getLayout() === "vertical" ){
						_this.getMedialistComponent().find(".nano-content").scrollTop(saveScrollTop); // restore scrollTop
					}
				});
			}
		},
		// called from KBaseMediaList when a media item is clicked - trigger clip play
		mediaClicked: function (index) {
			if (this.getConfig('onPage')) {
				try {
					this.getComponent().find(".chapterBox").removeClass('active');
				} catch (e) {
				}
				;
			} else {
				$(".chapterBox").removeClass('active');
			}
			this.getComponent().find(".chapterBox").find("[data-mediaBox-index='" + index + "']").addClass('active');
			if ( mw.isMobileDevice() ){
				this.embedPlayer.mobilePlayed = true; // since the user clicked the screen, we can set mobilePlayed to true to enable canAutoPlay
			}
			this.playMedia(index, true);
		},

		loadPlaylists: function () {
			var embedPlayer = this.embedPlayer;
			// Populate playlist set with kalturaPlaylistData
			for (var playlistId in embedPlayer.kalturaPlaylistData) {
				if (embedPlayer.kalturaPlaylistData.hasOwnProperty(playlistId)) {
					this.playlistSet.push(embedPlayer.kalturaPlaylistData[ playlistId ]);
				}
			}
			// update playlist names if set in Flashvars
			for (var i = 0; i < this.playlistSet.length; i++) {
				if (this.getConfig('kpl' + i + 'Name')) {
					this.playlistSet[i].name = this.getConfig('kpl' + i + 'Name');
				}
			}
		},

		// prepare the data to be compatible with KBaseMediaList
		addMediaItems: function (itemsArr) {
			for (var i = 0; i < itemsArr.length; i++) {
				var item = itemsArr[i];
				var customData = (item.partnerData && item.adminTags !== 'image') ? mw.parseJSON(item.partnerData, {}) : {};
				var title = item.name || customData.title;
				var description = item.description || customData.desc;

				// sanitize
				title = kWidget.sanitize( title );
				description = kWidget.sanitize( description );

				var thumbnailUrl = item.thumbnailUrl || customData.thumbUrl || this.getThumbUrl(item);
				var thumbnailRotatorUrl = this.getConfig('thumbnailRotator') ? this.getThumRotatorUrl() : '';

				item.order = i;
				item.title = title;
				item.description = description;
				item.width = this.getConfig('mediaItemWidth');
				item.thumbnail = {
					url: thumbnailUrl,
					thumbAssetId: item.assetId,
					rotatorUrl: thumbnailRotatorUrl,
					width: this.getThumbWidth(),
					height: this.getThumbHeight()
				};
				item.durationDisplay = kWidget.seconds2npt(item.duration);
				item.chapterNumber = this.getItemNumber(i);
				this.mediaList.push(item);
			}
		},

		playMediaById: function(id){
			var items = this.playlistSet[this.currentPlaylistIndex].items;
			for ( var i = 0; i < items.length; i++ ) {
				if ( items[i].id === id ) {
					this.playMedia( i, false, true );
					break;
				}
			}
		},

		// play a clip according to the passed index. If autoPlay is set to false - the clip will be loaded but not played
		playMedia: function (clipIndex, load, autoScrollToMedia) {
			this.setSelectedMedia(clipIndex);              // this will highlight the selected clip in the UI
			if ( autoScrollToMedia ){
				if (this.getLayout() === "vertical") {
					this.getMedialistComponent().find(".nano-content").scrollTop(clipIndex * this.getConfig("mediaItemHeight"));
				}else{
					this.getMedialistComponent().find( '.k-carousel' )[0].jCarouselLiteGo(clipIndex);
				}
			}
			this.setConfig("selectedIndex", clipIndex);    // save it to the config so it can be retrieved using the API
			this.embedPlayer.setKalturaConfig('playlistAPI', 'dataProvider', {'content': this.playlistSet, 'selectedIndex': this.getConfig('selectedIndex')}); // for API backward compatibility
			this.currentClipIndex = clipIndex; // save clip index for next / previous calls
			var embedPlayer = this.embedPlayer;

			var _this = this;
			var id = _this.mediaList[clipIndex].id;
			var referenceId = _this.mediaList[clipIndex].referenceId ? _this.mediaList[clipIndex].referenceId : null;
			if (!embedPlayer) {
				mw.log("Error: Playlist:: playClip called with null embedPlayer ");
				return;
			}

			// Check if entry id already matches ( and is loaded )
			if (embedPlayer.kentryid == id) {
				if (this.loadingEntry) {
					mw.log("Error: PlaylistAPI is loading Entry, possible double playClip request");
					return;
				}
			}

			var mobileAutoPlay = true;
			// mobile devices have a autoPlay restriction, we issue a raw play call on
			// the video tag to "capture the user gesture" so that future
			// javascript play calls can work
			if (mw.isMobileDevice() && load) {
				mw.log("Playlist:: issue load call to capture click for iOS");
				try {
					embedPlayer.getPlayerElement().load();
				} catch (e) {
					mobileAutoPlay = false;
					mw.log("Playlist:: could not load video - possibly restricted video");
				}
			}

			// Send notifications per play request
			var eventToTrigger = "";
			if (clipIndex == 0) {
				eventToTrigger = 'playlistFirstEntry';
			} else if (clipIndex == (this.mediaList.length - 1)) {
				eventToTrigger = 'playlistLastEntry';
			} else {
				eventToTrigger = 'playlistMiddleEntry';
			}

			// Listen for change media done
			$(embedPlayer).unbind('onChangeMediaDone' + this.bindPostFix).bind('onChangeMediaDone' + this.bindPostFix, function () {
				mw.log('mw.PlaylistAPI:: onChangeMediaDone');
				embedPlayer.triggerHelper(eventToTrigger);
				_this.loadingEntry = false; // Update the loadingEntry flag//

				if ( ( mobileAutoPlay && embedPlayer.canAutoPlay() && !embedPlayer.isInSequence()) || embedPlayer.casting) {
					setTimeout(function(){
						embedPlayer.play();
					},500); // timeout is required when loading live entries
				}

				if (mw.isMobileDevice() && !mobileAutoPlay){
					mw.setConfig('EmbedPlayer.HidePosterOnStart', false);
					embedPlayer.updatePosterHTML();
				}
			});
			mw.log("PlaylistAPI::playClip::changeMedia entryId: " + id);
			//Need to enable the controls if the previous entry was an offline live stream, liveCore.js handles the controls logic for live stream entries.
			this.getPlayer().enablePlayControls();

			if (!this.firstPlay && this.getConfig('hideClipPoster') === true && !mw.isIphone()) {
				mw.setConfig('EmbedPlayer.HidePosterOnStart', true);
			}

			// Use internal changeMedia call to issue all relevant events
			//embedPlayer.changeMediaStarted = false;
			if (!this.firstPlay) {
				this.loadingEntry = id; // Update the loadingEntry flag
				embedPlayer.sendNotification("changeMedia", {'entryId': id, 'playlistCall': true, 'referenceId': referenceId});
			} else {
				embedPlayer.triggerHelper(eventToTrigger);
			}

			// Add playlist specific bindings:
			_this.addClipBindings(clipIndex);

			// Restore onDoneInterfaceFlag
			embedPlayer.onDoneInterfaceFlag = true;

			if (this.firstPlay) {
				this.firstPlay = false;
			}
		},

		addClipBindings: function (clipIndex) {
			var _this = this;
			mw.log("PlaylistAPI::addClipBindings");
			// Setup postEnded event binding to play next clip
			$(this.embedPlayer).unbind('postEnded' + this.bindPostFix).bind('postEnded' + this.bindPostFix, function () {
				if (_this.getConfig("autoContinue") == true) {
					mw.log("PlaylistAPI:: postEnded > on inx: " + clipIndex);
					_this.playNext(true);
				}
			});
		},

		playNext: function (autoScrollToMedia) {
			if (this.isDisabled || this.loadingEntry) {
				return;
			}
			if (this.getConfig("loop") == true && this.currentClipIndex != null && parseInt(this.currentClipIndex) == this.mediaList.length - 1) { // support loop
				this.currentClipIndex = -1;
			}
			if (this.currentClipIndex != null && this.currentClipIndex < this.mediaList.length - 1) {
				this.currentClipIndex++;
				this.setSelectedMedia(this.currentClipIndex);
				this.playMedia(this.currentClipIndex, true, autoScrollToMedia);
			}
			$(this.embedPlayer).trigger('playlistPlayNext');
		},

		playPrevious: function (autoScrollToMedia) {
			if (this.isDisabled || this.loadingEntry) {
				return;
			}
			if (this.currentClipIndex != null && this.currentClipIndex > 0) {
				this.currentClipIndex--;
				this.setSelectedMedia(this.currentClipIndex);
				this.playMedia(this.currentClipIndex, true, autoScrollToMedia);
			}
			$(this.embedPlayer).trigger('playlistPlayPrevious');
		},

		// when we have multiple play lists - build the UI to represent it: combobox for playlist selector
		setMultiplePlayLists: function () {
			if ( this.playerIsReady && this.playlistSet.length > 1 ) {
				var _this = this;
				if ( this.getComponent().find( ".playlistSelector" ).length == 0 ) { // UI wasn't not created yet
					this.getComponent().find( ".k-vertical" ).find( ".playlistTitle, .playlistDescription" ).addClass( "multiplePlaylists" );
					this.getComponent().find( ".dropDownIcon" ).on( "click", function () {
						if ( _this.getComponent().find( ".playlistSelector" ).height() > 0 ) {
							_this.closePlaylistDropdown();
						} else {
							_this.openPlaylistDropdown();
						}
					} );
					this.getMedialistComponent().prepend( '<div class="playlistSelector"></div>' );
					$.each( this.playlistSet, function ( i, el ) {
						if ( _this.getLayout() === "vertical" ) {
							_this.getComponent().find( ".playlistSelector" ).append( '<br><div data-index="' + i + '" class="playlistItem"><span class="k-playlistTitle"> ' + el.name + '</span></div>' );
						} else {
							_this.getComponent().find( ".playlistSelector" ).append( '<div data-index="' + i + '" class="playlistItem k-horizontal"><span class="k-playlistTitle"> ' + el.name + '</span></div>' );
						}
					} );
					this.getComponent().find( ".playlistItem" ).on( "click", function () {
						_this.switchPlaylist( $( this ).attr( 'data-index' ) );
					} );
				}
				setTimeout(function(){
					_this.getComponent().find(".dropDownIcon").show();
				},250);

			}
		},

		openPlaylistDropdown: function () {
			var _this = this;
			this.onDisable();
			this.getComponent().find(".playlistSelector").show();
			var dropdownHeight = this.getLayout() === "vertical" ? 200 : this.getConfig("mediaItemHeight") - 20;
			this.getComponent().find(".playlistSelector").height(dropdownHeight);
			setTimeout(function () {
				_this.getComponent().find(".playlistSelector").css("overflow", "auto");
			}, 300);
		},

		closePlaylistDropdown: function () {
			var _this = this;
			this.onEnable();
			this.getComponent().find(".playlistSelector").height(0);
			this.getComponent().find(".playlistSelector").css("overflow", "hidden");
			setTimeout(function () {
				_this.getComponent().find(".playlistSelector").hide();
			}, 300);
		},

		switchPlaylist: function (index) {
			this.firstLoad = true;                  // reset firstLoad to support initial clip selectedIndex
			this.setConfig("selectedIndex", 0);     // set selectedIndex to 0 so we will always load the first clip in the playlist after palylist switch
			this.currentPlaylistIndex = index;      // save the currently selected playlist index
			this.embedPlayer.pause();               // pause playback to prevent IE8 from crashing (OMG!)
			this.loadPlaylistFromAPI();             // load the playlist data from the API
			this.onEnable();
		},

		loadPlaylistFromAPI: function () {
			var _this = this;
			if (this.playlistSet[_this.currentPlaylistIndex].items.length > 0) {
				// playlist data is already in memory
				this.selectPlaylist(_this.currentPlaylistIndex);
			} else {
				// load the playlist from API
				var playlistRequest = {
					'service': 'playlist',
					'action': 'execute',
					'id': this.playlistSet[_this.currentPlaylistIndex].id
				};
				if (this.getConfig('paging')){
					playlistRequest['pager:objectType'] = 'KalturaFilterPager';
					playlistRequest['pager:pageIndex'] = this.page;
					playlistRequest['pager:pageSize'] = this.getConfig('pageSize');
				}
				this.getKClient().doRequest(playlistRequest, function (playlistDataResult) {
					_this.playlistSet[_this.currentPlaylistIndex].items = playlistDataResult; // save the loaded data to the correct playlist in the playlistSet
					_this.selectPlaylist(_this.currentPlaylistIndex);
				});
			}
		},

		getKClient: function () {
			if (!this.kClient) {
				this.kClient = mw.kApiGetPartnerClient(this.embedPlayer.kwidgetid);
			}
			return this.kClient;
		},

		// select playlist
		selectPlaylist: function (playlistIndex) {
			var _this = this;
			this.embedPlayer.setKalturaConfig('playlistAPI', 'dataProvider', {'content': this.playlistSet, 'selectedIndex': this.getConfig('selectedIndex')}); // for API backward compatibility
			this.mediaList = [];
			var items = this.playlistSet[playlistIndex].items;
			items = items.length > parseInt( this.getConfig( 'MaxClips' ) ) ? items.slice( 0, parseInt( this.getConfig( 'MaxClips' ) ) ) : items; // support MaxClips Flashvar
			this.setConfig('MinClips', this.minClips);
			if (items.length < this.minClips){              // support the MinClips Flashvar
				this.setConfig('MinClips', items.length);	// set MinClips Flashvar to the number of items in the playlist
			}
			if (!this.getConfig( 'onPage' ) && this.getLayout() === 'vertical' && (this.getConfig( 'containerPosition' ) == 'top' || this.getConfig( 'containerPosition' ) == 'bottom')){
				// make sure we leave enough space for the video
				while (this.$mediaListContainer.height() - parseInt(this.getConfig('MinClips')) * this.getConfig("mediaItemHeight") < 200){
					this.setConfig('MinClips',parseInt(this.getConfig('MinClips'))-1);
				}
				this.$mediaListContainer = null;            // remove currently rendered media items so it will re re-calculated on the renderMediaList() call
				this.getMedialistContainer();
			}
			this.addMediaItems( items );   // prepare the data to be compatible with KBaseMediaList
			this.getMedialistHeaderComponent().empty();
			// First playlist will always have items in it, other playlists will populate the items array after selection.
			var numOfClips = this.playlistSet[playlistIndex].items.length;
			if ( this.getLayout() === "vertical" ) {
				this.getMedialistHeaderComponent().prepend( '<span class="playlistTitle">' + this.playlistSet[playlistIndex].name + '</span><span class="playlistDescription">' + numOfClips + ' ' + gM( 'mwe-embedplayer-videos' ) + '</span>' );
				this.getMedialistHeaderComponent().prepend( '<div class="dropDownIcon" title="' + gM( 'mwe-embedplayer-select_playlist' ) + '"></div>' );
				this.getMedialistHeaderComponent().height(this.getConfig('verticalHeaderHeight'));
			} else {
				this.getMedialistHeaderComponent().prepend( '<div class="horizontalHeaderLables"><span class="playlistTitle horizontalHeader">' + this.playlistSet[playlistIndex].name + '</span><span class="playlistDescription horizontalHeader">(' + numOfClips + ' ' + gM( 'mwe-embedplayer-videos' ) + ')</span></div>' );
				this.getMedialistHeaderComponent().prepend( '<div class="dropDownIcon" title="' + gM( 'mwe-embedplayer-select_playlist' ) + '"></div>' );
				this.getMedialistHeaderComponent().height(this.getConfig('horizontalHeaderHeight'));
			}
			if ( this.getConfig( 'showControls' ) === true && !this.embedPlayer.isMobileSkin() ) {
				this.getMedialistHeaderComponent().prepend( '<div class="playlistControls k-' + this.getLayout() + '"><div class="prevBtn playlistBtn"></div><div class="nextBtn playlistBtn"></div></div>' );
				this.getMedialistHeaderComponent().find( ".playlistControls .nextBtn" ).on( "click", function () {
					_this.playNext(true)
				} );
				this.getMedialistHeaderComponent().find( ".playlistControls .prevBtn" ).on( "click", function () {
					_this.playPrevious(true)
				} );
			}

			if (items.length === 0 && this.getConfig('showEmptyPlaylistError')){
				//If no items then show error message
				this.showEmptyPlaylistError();
				this.configMediaListFeatures();
			} else {
				this.clearEmptyPlaylistError();
				if (this.playlistInterfaceHeight){
					$( ".playlistInterface").height(this.playlistInterfaceHeight);
				}
				this.renderMediaList();  // set the media list in KBaseMediaList

				// support initial selectedIndex or initItemEntryId
				if ( this.firstLoad ) {
					if ( this.getConfig( 'initItemEntryId' ) ) { // handle initItemEntryId
						// find selected item index
						var found = false;
						for ( var i = 0; i < items.length; i++ ) {
							if ( items[i].id === this.getConfig( 'initItemEntryId' ) ) {
								this.playMedia( i, false, true );
								found = true;
								break;
							}
						}
					}
					if ( (this.getConfig( 'initItemEntryId' ) && !found) || !(this.getConfig( 'initItemEntryId' )) ) {
						this.playMedia( this.getConfig( 'selectedIndex' ), false, true );
					}
				}
			}
			if ( this.firstLoad ) {
				this.setMultiplePlayLists(); // support multiple play lists
				this.firstLoad = false;
			}
			this.embedPlayer.triggerHelper('playlistSelected');
		},
		showEmptyPlaylistError: function () {
			var $this = $(this);
			var errorObj = this.embedPlayer.getKalturaMsgObject('mwe-embedplayer-empty_playlist');
			this.emptyPlaylistSelected = true;
			this.getPlayer()['data-blockPlayerDisplay'] = false;
			// Support no sources custom error msg:
			$this.trigger('EmptyPlaylistCustomError', function (customErrorMsg) {
				if (customErrorMsg) {
					errorObj.message = customErrorMsg;
				}
			});
			// set the error object:
			this.embedPlayer.setError(errorObj);
			// Add the no sources error:
			this.embedPlayer.showErrorMsg(errorObj);
		},
		clearEmptyPlaylistError : function(){
			if (this.emptyPlaylistSelected){
				this.emptyPlaylistSelected = false;
				this.embedPlayer.getInterface().find('.error').remove();
				this.embedPlayer.setError(null);
				this.embedPlayer.layoutBuilder.closeAlert();
				this.embedPlayer.layoutBuilder.closeMenuOverlay();
			}
		},
		onDisable: function(){
			//Only disable if ad is being displayed
			if (this.getPlayer().isInSequence()){
				this.getMedialistHeaderComponent().find(".playlistBtn").addClass("disabled");
				this._super();
			}
		},
		onEnable: function(){
			this.getMedialistHeaderComponent().find(".playlistBtn").removeClass("disabled");
			this._super();
		}
	})
	);
})(window.mw, window.jQuery);