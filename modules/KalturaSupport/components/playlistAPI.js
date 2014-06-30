( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'playlistAPI', mw.KBaseMediaList.extend({

		defaultConfig: {
			'initItemEntryId': null,
			'autoContinue': false,
			'autoPlay': false,
			'kpl0Name': null,
			'kpl0Url': null,
			'kpl0Id': null,
			'includeInLayout': null,
			'parent': null,//'sideBarContainer',
			'mediaItemWidth': 290,
			'defaultPlaylistHeight': 190,
			'titleLimit': 30,
			'descriptionLimit': 80,
			'thumbnailWidth' : 62,
			'horizontalMediaItemWidth': 290,
			'includeThumbnail': true,
			'includeItemNumberPattern': false,
			'includeMediaItemDuration': true,
			'loop': false,
			'overflow': true,
			'selectedIndex': 0,
			'containerPosition':  'left'
		},


		loadingEntry: null,      // flag to store the current loading entry
		firstLoad: true,         // Flag for setting initial entry in first load
		kClient: null,           // kClient for API calls

		currentClipIndex: null,  // currently playing clip index
		currentPlaylistIndex: 0, // current playlist index (when we have more than 1 play lists)
		playlistSet : [],        // array holding all the play lists returned from the server

		videoWidth: null,        // used to save the video width when exiting to full screen and returning

		getConfig: function( key ){
			return this.embedPlayer.getKalturaConfig( 'playlistAPI', key );
		},

		setup: function( embedPlayer ) {
			this.addBindings();
			this.loadPlaylists();
		},
		addBindings: function() {
			var _this = this;

			$( this.embedPlayer ).unbind( this.bindPostFix );
			this.bind( 'playerReady', function ( e, newState ) {
				if (_this.playlistSet.length > 0){
					_this.selectPlaylist(_this.currentPlaylistIndex);
				}
				_this.unbind( 'playerReady'); // we want to select the playlist only the first time the player loads
			});

			// handle fullscreen entering resize
			$( this.embedPlayer ).bind('onOpenFullScreen', function() {
				if (_this.getConfig('containerPosition') == 'right' || _this.getConfig('containerPosition') == 'left'){
					if (_this.getConfig('containerPosition') == 'left'){
						$(".mwPlayerContainer").css("margin-left",0);
					}
					$(".videoHolder, .mwPlayerContainer").width("100%");
				}
			});

			// handle fullscreen exit resize
			$( this.embedPlayer ).bind('onCloseFullScreen', function() {
				if (_this.getConfig('containerPosition') == 'right' || _this.getConfig('containerPosition') == 'left'){
					if (_this.getConfig('containerPosition') == 'left'){
						$(".mwPlayerContainer").css("margin-left",_this.getConfig("mediaItemWidth")+"px");
					}
					$(".videoHolder, .mwPlayerContainer").width(_this.videoWidth);
				}
			});

			// API support + backward compatibility
			$( this.embedPlayer ).bind( 'Kaltura_SetKDPAttribute' + this.bindPostFix, function( event, componentName, property, value ){
				mw.log("PlaylistAPI::Kaltura_SetKDPAttribute:" + property + ' value:' + value);
				switch( componentName ){
					case "playlistAPI.dataProvider":
					case "playlistAPI":
						if ( property == "selectedIndex"){
							_this.playMedia(value, true);
						}
						break;
					case 'tabBar':
					case 'playList':
						if (property == "selectedIndex" && value < _this.playlistSet.length){
							_this.switchPlaylist(value);
						}
						break;
				}
			});

			$( this.embedPlayer ).bind( 'Kaltura_SendNotification'+ this.bindPostFix , function( event, notificationName, notificationData){
				switch( notificationName ){
					case 'playlistPlayNext':
						_this.playNext();
						break;
					case 'playlistPlayPrevious':
						_this.playPrevious();
						break;
				}
			});
		},

		// called from KBaseMediaList when a media item is clicked - trigger clip play
		mediaClicked: function(index){
			this.playMedia( index, true);
		},

		loadPlaylists: function(){
			var embedPlayer = this.embedPlayer;
			// Populate playlist set with kalturaPlaylistData
			for (var playlistId in embedPlayer.kalturaPlaylistData ) {
				if (embedPlayer.kalturaPlaylistData.hasOwnProperty(playlistId)) {
					this.playlistSet.push( embedPlayer.kalturaPlaylistData[ playlistId ] );
				}
			}
		},

		// prepare the data to be compatible with KBaseMediaList
		prepareData: function(itemsArr){
			for (var i = 0; i < itemsArr.length; i++){
				var item = itemsArr[i];
				var customData = item.partnerData ? JSON.parse(item.partnerData) :  {};
				var title = item.name || customData.title;
				var description = item.description || customData.desc;
				item.order = i;
				item.title = title;
				item.description = description;
				item.width = this.getConfig( 'mediaItemWidth' );
				item.durationDisplay = kWidget.seconds2npt(item.duration);
			}
		},

		// set the play list container according to the selected position
		getMedialistContainer: function(){
			this.$mediaListContainer =  $(".playlistInterface");

			// resize the video to make place for the playlist according to its position (left, top, right, bottom)
			if (this.getConfig('containerPosition') == 'right' || this.getConfig('containerPosition') == 'left'){
				$(".videoHolder, .mwPlayerContainer").css("width", this.$mediaListContainer.width() - this.getConfig("mediaItemWidth") +"px");
				this.videoWidth = (this.$mediaListContainer.width() - this.getConfig("mediaItemWidth"));
			}
			if (this.getConfig('containerPosition') == 'left'){
				$(".mwPlayerContainer").css({"margin-left": this.getConfig("mediaItemWidth") +"px", "float": "right"});
			}
			if (this.getConfig('containerPosition') == 'top' || this.getConfig('containerPosition') == 'bottom'){
				$(".videoHolder, .mwPlayerContainer").css("height", this.$mediaListContainer.height() - this.getConfig("defaultPlaylistHeight") +"px");
			}
			return this.$mediaListContainer;
		},

		// set the size of the playlist container and the video
		setMedialistContainerSize: function(){
			// resize the video to make place for the playlist according to its position (left, top, right, bottom)
			if (this.getConfig('containerPosition') == 'right' || this.getConfig('containerPosition') == 'left'){
				$(".medialistContainer").width(this.getConfig("mediaItemWidth"));
				$(".medialistContainer").height("100%");
				$(".medialistContainer").css("position","absolute");
			}
			if (this.getConfig('containerPosition') == 'right'){
				$(".medialistContainer").css("float","right");
				$(".mwPlayerContainer").css("float","left");
			}
			if (this.getConfig('containerPosition') == 'top' || this.getConfig('containerPosition') == 'bottom'){
				$(".medialistContainer").height(this.getConfig("defaultPlaylistHeight"));
				$(".medialistContainer").css("display","block");
			}
			return this.$mediaListContainer;
		},

		// play a clip according to the passed index. If autoPlay is set to false - the clip will be loaded but not played
		playMedia: function(clipIndex, autoPlay){
			this.setSelectedMedia(clipIndex);              // this will highlight the selected clip in the UI
			this.setConfig("selectedIndex", clipIndex);    // save it to the config so it can be retrieved using the API
			this.embedPlayer.setKalturaConfig( 'playlistAPI', 'dataProvider', {'content' : this.playlistSet, 'selectedIndex': this.getConfig('selectedIndex')} ); // for API backward compatibility
			this.currentClipIndex = clipIndex; // save clip index for next / previous calls
			var embedPlayer = this.embedPlayer;

			var _this = this;
			var id = _this.mediaList[clipIndex].id;
			if( !embedPlayer ){
				mw.log("Error: Playlist:: playClip called with null embedPlayer ");
				return ;
			}

			// iOS devices have a autoPlay restriction, we issue a raw play call on
			// the video tag to "capture the user gesture" so that future
			// javascript play calls can work
			if( embedPlayer.getPlayerElement() && embedPlayer.getPlayerElement().load ){
				mw.log("Playlist:: issue load call to capture click for iOS");
				embedPlayer.getPlayerElement().load();
			}

			// Send notifications per play request
			if( clipIndex == 0 ) {
				embedPlayer.triggerHelper( 'playlistFirstEntry' );
			} else if( clipIndex == (this.mediaList.length-1) ) {
				embedPlayer.triggerHelper( 'playlistLastEntry' );
			} else {
				embedPlayer.triggerHelper( 'playlistMiddleEntry' );
			}

			// Check if entry id already matches ( and is loaded )
			if( embedPlayer.kentryid == id ){
				if( this.loadingEntry ){
					mw.log("Error: PlaylistAPI is loading Entry, possible double playClip request");
					return ;
				}
			}

			this.loadingEntry = id; // Update the loadingEntry flag
			// Listen for change media done
			$( embedPlayer).unbind( 'onChangeMediaDone' + this.bindPostFix ).bind( 'onChangeMediaDone' + this.bindPostFix, function(){
				mw.log( 'mw.PlaylistAPI:: onChangeMediaDone' );
				_this.loadingEntry = false; // Update the loadingEntry flag:
				if (autoPlay){
					embedPlayer.play();     // auto play
				}
			});
			mw.log("PlaylistAPI::playClip::changeMedia entryId: " + id);

			// Make sure its in a playing state when change media is called if we are autoContinuing:
			if( this.getConfig('autoContinue') && !embedPlayer.firstPlay ){
				embedPlayer.stopped = embedPlayer.paused = false;
			}

			// Use internal changeMedia call to issue all relevant events
			embedPlayer.sendNotification( "changeMedia", {'entryId' : id, 'playlistCall': true} );

			// Add playlist specific bindings:
			_this.addClipBindings(clipIndex);

			// Restore onDoneInterfaceFlag
			embedPlayer.onDoneInterfaceFlag = true;
		},

		addClipBindings: function( clipIndex ){
			var _this = this;
			mw.log( "PlaylistAPI::addClipBindings" );
			// Setup postEnded event binding to play next clip (if autoContinue is true )
			if( this.getConfig("autoContinue") == true ){
				$( this.embedPlayer ).unbind( 'postEnded').bind( 'postEnded', function(){
					mw.log("PlaylistAPI:: postEnded > on inx: " + clipIndex );
					_this.playNext();
				});
			}
		},

		playNext: function(){
			if (this.currentClipIndex != null && this.currentClipIndex < this.mediaList.length-1){
				this.currentClipIndex++;
				this.setSelectedMedia(this.currentClipIndex);
				this.playMedia(this.currentClipIndex, true);
			}
		},

		playPrevious: function(){
			if (this.currentClipIndex != null && this.currentClipIndex > 0){
				this.currentClipIndex--;
				this.setSelectedMedia(this.currentClipIndex);
				this.playMedia(this.currentClipIndex, true);
			}
		},

		// when we have multiple play lists - build the UI to represent it: combobox for playlist selector
		setMultiplePlayLists: function(){
			var _this = this;
			if ($(".playListSelector").length == 0){ // UI wasn't not created yet
				var combo = $("<select class='playListSelector'></select>");
				$.each(this.playlistSet, function (i, el) {
					// add the selected attribute the the currently selected play list so it will be shown as the selected one in the combo box
					if (i == _this.currentPlaylistIndex){
						combo.append('<option selected="selected" value="' + i +'">' + el.name + '</option>');
					}else{
						combo.append('<option value="' + i +'">' + el.name + '</option>');
					}
				});
				$(".medialistContainer").prepend(combo).prepend("<span class='playListSelector'>" + gM( 'mwe-embedplayer-select_playlist' ) + "</span>");
				// set the combo box change event to load the selected play list by its index
				combo.on("change",function(e){
					_this.switchPlaylist(this.value);
				});
			}
		},

		switchPlaylist: function(index){
			this.firstLoad = true;                  // reset firstLoad to support initial clip selectedIndex
			this.setConfig("selectedIndex", 0);     // set selectedIndex to 0 so we will always load the first clip in the playlist after palylist switch
			this.currentPlaylistIndex = index;      // save the currently selected playlist index
			this.loadPlaylistFromAPI();             // load the playlist data from the API
		},

		loadPlaylistFromAPI: function(){
			var _this = this;
			if (this.playlistSet[_this.currentPlaylistIndex].items.length > 0){
				// playlist data is already in memory
				this.selectPlaylist( _this.currentPlaylistIndex );
			}else{
				// load the playlist from API
				var playlistRequest = {
					'service' : 'playlist',
					'action' : 'execute',
					'id': this.playlistSet[_this.currentPlaylistIndex].id
				};
				this.getKClient().doRequest( playlistRequest, function( playlistDataResult ) {
					_this.playlistSet[_this.currentPlaylistIndex].items = playlistDataResult; // save the loaded data to the correct playlist in the playlistSet
					_this.selectPlaylist( _this.currentPlaylistIndex );
				});
			}
		},

		getKClient: function(){
			if( !this.kClient ){
				this.kClient = mw.kApiGetPartnerClient( this.embedPlayer.kwidgetid );
			}
			return this.kClient;
		},

		// select playlist
		selectPlaylist: function(playlistIndex){
			$(".medialistContainer").empty();  // empty the playlist UI container so we can build a new UI
			this.embedPlayer.setKalturaConfig( 'playlistAPI', 'dataProvider', {'content' : this.playlistSet, 'selectedIndex': this.getConfig('selectedIndex')} ); // for API backward compatibility
			this.prepareData(this.playlistSet[playlistIndex].items);   // prepare the data to be compatible with KBaseMediaList
			this.setMediaList(this.playlistSet[playlistIndex].items);  // set the media list in KBaseMediaList
			// support initial selectedIndex
			if (this.firstLoad){
				this.playMedia( this.getConfig('selectedIndex'), this.getConfig('autoPlay'));
				this.firstLoad = false;
			}
			if (this.playlistSet.length > 1){
				this.setMultiplePlayLists(); // support multiple play lists
			}
		}

/*
		// add bindings for playlist playback ( disable playlist item selection during ad Playback )
		addPlaylistAdBindings: function(){
			var _this = this;
			var embedPlayer = this.embedPlayer;
			$( embedPlayer ).bind('AdSupport_StartAdPlayback' + this.bindPostfix, function(){
				_this.blockPlaylist();
			});
			$( embedPlayer ).bind('AdSupport_EndAdPlayback' + this.bindPostfix, function(){
				_this.restorePlaylist();
			});
		},
		blockPlaylist: function(){
			var _this = this;
			var embedPlayer = this.embedPlayer;
			// Add the Disable clip switch flag:
			_this.enableClipSwitch = false;

			// Add a gray overlay
			var $listwrap = this.$target.find( '.video-list-wrapper' );
			var cssPops = ['width','height', 'position', 'bottom', 'right', 'left', 'top'];
			var cssObj = {};

			// Copy in all the settings:
			$.each( cssPops, function(inx, prop){
				cssObj[ prop ] = $listwrap.css(prop);
			});
			// make sure we are not in fullscreen ( and there is nothing to cover up )
			if( ! this.$target.find( '.playlist-block-list' ).length ){
				$listwrap.before(
					$('<div />').css( cssObj )
						.addClass('playlist-block-list')
						.css({
							'z-index': 2,
							'background-color' : '#FFF',
							'opacity' : '0.7',
							'filter' : 'alpha(opacity=70)'
						})
						.click(function(){
							// don't let event propagate
							return false;
						})
				);
			}
			// if in fullscreen hide the listwrap
			if( embedPlayer.layoutBuilder.isInFullScreen() ){
				_this.$target.find( '.playlist-block-list' ).hide();
			}
		},
		restorePlaylist: function(){
			// Restore clip switch:
			this.enableClipSwitch = true;
			this.$target.find( '.playlist-block-list' ).remove();
		},

		playNext: function(clipIndex) {
			var _this = this;
			if( _this.enableClipSwitch &&  (clipIndex + 1) < _this.mediaList.length && (clipIndex + 1) <= parseInt( mw.getConfig( 'Playlist.MaxClips' ) ) ){
				_this.playClip( clipIndex+1 );
				return ;
			}
			mw.log( "Error: mw.playlist can't next: current: " + _this.clipIndex );
		},

		playPrevious: function(clipIndex) {
			var _this = this;
			if( _this.enableClipSwitch && clipIndex - 1 >= 0 ){
				_this.playClip( clipIndex-1 );
				return ;
			}
			mw.log("Cant prev: cur:" + clipIndex-1 );
		}*/

	})

	);

} )( window.mw, window.jQuery );