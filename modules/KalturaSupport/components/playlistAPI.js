( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'playlistAPI', mw.KBaseMediaList.extend({

		defaultConfig: {
			'templatePath': 'components/mediaList/mediaList.tmpl.html',
			'initItemEntryId': null,
			'autoContinue': false,
			'autoPlay': false,
			'kpl0Name': null,
			'kpl0Url': null,
			'kpl0Id': null,
			'titleLimit': 29,
			'descriptionLimit': 80,
			'thumbnailWidth' : 62,
			'horizontalMediaItemWidth': 290,
			'includeThumbnail': true,
			'includeItemNumberPattern': false,
			'includeMediaItemDuration': true,
			'loop': false,
			'overflow': true,
			'cssPath': 'playList.css',
			'selectedIndex': 0
		},


		loadingEntry: null,      // flag to store the current loading entry
		firstLoad: true,         // Flag for setting initial entry in first load
		kClient: null,           // kClient for API calls
		firstPlay: true,         // firstPlay is used to check if we need to check for autoMute or keep the player volume from previous clip

		currentClipIndex: null,  // currently playing clip index
		currentPlaylistIndex: 0, // current playlist index (when we have more than 1 play lists)
		playlistSet : [],        // array holding all the play lists returned from the server

		videoWidth: null,        // used to save the video width when exiting to full screen and returning

		setup: function( embedPlayer ) {
			if ( this.getConfig( 'includeInLayout' ) === false){ // support hidden playlists - force onPage and hide its div.
				this.setConfig( 'onPage', true );
			}
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

			$( this.embedPlayer ).bind( 'playNextClip', function( event){
				_this.playNext();
			});

			$( this.embedPlayer ).bind( 'playPreviousClip', function( event){
				_this.playPrevious();
			});

			$( this.embedPlayer ).bind( 'mediaListLayoutReady', function( event){
				_this.embedPlayer.triggerHelper( 'playlistReady' );
			});
		},

		// called from KBaseMediaList when a media item is clicked - trigger clip play
		mediaClicked: function(index){
			if (this.getConfig('onPage')){
				try{
					var doc = window['parent'].document;
					$(doc).find(".chapterBox").removeClass( 'active');
				}catch(e){};
			}else{
				$(".chapterBox").removeClass( 'active');
			}
			$(".chapterBox").find("[data-chapter-index='"+ index +"']" ).addClass( 'active');
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
		addMediaItems: function(itemsArr){
			for (var i = 0; i < itemsArr.length; i++){
				var item = itemsArr[i];
				var customData = (item.partnerData  && item.adminTags !== 'image') ? JSON.parse(item.partnerData) :  {};
				var title = item.name || customData.title;
				var description = item.description || customData.desc;
				var thumbnailUrl = item.thumbnailUrl || customData.thumbUrl || this.getThumbUrl(item);
				var thumbnailRotatorUrl = this.getConfig( 'thumbnailRotator' ) ? this.getThumRotatorUrl() : '';

				item.order = i;
				item.title = title;
				item.description = description;
				item.width = this.getConfig( 'mediaItemWidth' );
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
			var eventToTrigger = "";
			if( clipIndex == 0 ) {
				eventToTrigger = 'playlistFirstEntry';
			} else if( clipIndex == (this.mediaList.length-1) ) {
				eventToTrigger = 'playlistLastEntry';
			} else {
				eventToTrigger = 'playlistMiddleEntry';
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
				embedPlayer.triggerHelper( eventToTrigger );
				_this.loadingEntry = false; // Update the loadingEntry flag
				if( _this.firstPlay && embedPlayer.getKalturaConfig( '', 'autoMute' ) === null ){
					embedPlayer.toggleMute( true );
					_this.firstPlay = false;
				}
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
			if( this.getConfig("loop") == true && this.currentClipIndex != null && this.currentClipIndex === this.mediaList.length - 1 ){ // support loop
				this.currentClipIndex = -1;
			}
			if (this.currentClipIndex != null && this.currentClipIndex < this.mediaList.length-1){
				this.currentClipIndex++;
				this.setSelectedMedia(this.currentClipIndex);
				this.playMedia(this.currentClipIndex, true);
			}
			$( this.embedPlayer ).trigger( 'playlistPlayNext');
		},

		playPrevious: function(){
			if (this.currentClipIndex != null && this.currentClipIndex > 0){
				this.currentClipIndex--;
				this.setSelectedMedia(this.currentClipIndex);
				this.playMedia(this.currentClipIndex, true);
			}
			$( this.embedPlayer ).trigger( 'playlistPlayPrevious' );
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
			this.mediaList = [];
			this.addMediaItems(this.playlistSet[playlistIndex].items);   // prepare the data to be compatible with KBaseMediaList
			this.renderMediaList();  // set the media list in KBaseMediaList
			// support initial selectedIndex or initItemEntryId
			if (this.firstLoad){
				if ( this.getConfig( 'initItemEntryId' ) ){ // handle initItemEntryId
					// find selected item index
					var items = this.playlistSet[this.currentPlaylistIndex].items;
					var found = false;
					for (var i=0; i<items.length; i++){
						if (items[i].id === this.getConfig( 'initItemEntryId' )){
							this.playMedia(i, this.getConfig( 'autoPlay' ));
							found = true;
							break;
						}
					}
				}
				if ( (this.getConfig( 'initItemEntryId' ) && !found) || !(this.getConfig( 'initItemEntryId' )) ){
					this.playMedia( this.getConfig('selectedIndex'), this.getConfig('autoPlay'));
				}
				this.firstLoad = false;
			}
			if (this.playlistSet.length > 1){
				this.setMultiplePlayLists(); // support multiple play lists
			}
		}
	})

);

} )( window.mw, window.jQuery );