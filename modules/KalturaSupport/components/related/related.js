( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'related', mw.KBaseScreen.extend({

		defaultConfig: {
			parent: "topBarContainer",
			order: 4,
			align: "right",
			tooltip: gM('mwe-embedplayer-related'),
			title: gM('mwe-embedplayer-related'),
			smartContainer: 'morePlugins',
			smartContainerCloseEvent: 'hideScreen',
			showTooltip: true,
			itemsLimit: 12,
			displayOnPlaybackDone: true,
			autoContinueEnabled: true,
			autoContinueTime: null,
			sendContextWithPlaylist: false,
			templatePath: 'components/related/related.tmpl.html',
			playlistId: null,
			formatCountdown : false,
			clickUrl : null,
			enableAccessControlExclusion:false,
			storeSession: false,
			openInNewTab: false
		},
		viewedEntries: [],
		iconBtnClass: 'icon-related',
		confPrefix: 'related',
		timerRunning:false,
		loadedThumbnails: 0,
		numOfEntries: 0,
		updateStoredSession: true,

		setup: function(){
			var _this = this;
			// check for storedSession of viewed entries:
			if( this.getConfig('storeSession') ){
				var rawViewed = $.cookie( this.confPrefix + '_viewedEntries' );
				if( rawViewed ){
					this.viewedEntries = JSON.parse( rawViewed );
				}
			}
			
			this.bind('playerReady', function(){
				// Stop timer
				_this.stopTimer();

				// Reset our items data
				_this.templateData = null;

				// Load items data
				_this.getItemsData();
			});

			this.bind('onOpenFullScreen', function() {
				setTimeout(function(){
					$('.item-inner img').each(function() {
						$(this).css("margin-top", 0 +"px");
						$(this).css("margin-left", 0 +"px");
						$(this).width("100%");
						$(this).height("100%");
					});
				},200);

			});
			this.bind('onCloseFullScreen', function() {
				setTimeout(function(){
					$('.item-inner img').each(function() {
						$(this).css("margin-top", 0 +"px");
						$(this).css("margin-left", 0 +"px");
						$(this).width("100%");
						$(this).height("100%");
					});
				},200);
			});

			if( this.getConfig('displayOnPlaybackDone') ){
				this.bind('onEndedDone', function(){
					if ( _this.error ) {
						return;
					}
					_this.showScreen(true);
					if( _this.getConfig('autoContinueEnabled') && _this.getConfig('autoContinueTime') ){
						_this.embedPlayer.playlist = true;
						_this.startTimer();
					}
				});
			}

			this.bind('replayEvent preSequence', function(){
				_this.stopTimer();
			});

			this.bind('preShowScreen', function (event, screenName) {
				if ( screenName === "related" ){
					_this.embedPlayer.disablePlayControls(['playPauseBtn']);
				}
			});
			this.bind('preHideScreen', function (event, screenName) {
				if ( screenName === "related" ){
					_this.embedPlayer.enablePlayControls();
					_this.embedPlayer.triggerHelper("showLargePlayBtn");
				}
			});
		},

		showScreen: function(auto){
			var _this = this;
			if ( auto !== true){
				this.embedPlayer.triggerHelper("relatedOpen");
			}
			this._super(); // this is an override of showScreen in mw.KBaseScreen.js - call super
			if (this.numOfEntries > 0 && this.loadedThumbnails < this.numOfEntries) { // related data was loaded but thumbnails were not loaded yet
				$('.item-inner').each(function () {
					var img = $(this).find("img")[0];
					img.onload = function () {
						_this.loadedThumbnails++;
						if (_this.loadedThumbnails == _this.numOfEntries) { // check if all thumbnails were loaded
							_this.resizeThumbs(); // resize thumbnails according to aspect ratio
						}
					}
				});
			} else { // all thumbnails were loaded - we can resize according to aspect ratio
				this.resizeThumbs();
			}
		},

		resizeThumbs: function(){
			// resize and crop from center all thumbnails
			$('.item-inner').each(function() {
				// set css class according to image aspect ratio
				var cssClass = $(this).width() / $(this).height() > 1.45 ? 'wide' : 'square';
				$(this).find("img").removeClass().addClass(cssClass);
				var img = $(this).find("img")[0];
				var divWidth = $(this).width();    // save img div container width for cropping logic
				var divHeight = $(this).height();  // save img div container height for cropping logic
				// crop image from center
				var heightOffset, widthOffset;
				var $img = $(img);
				if (cssClass === 'wide') {
					heightOffset = ($img.height() - divHeight) / 2;
					if (heightOffset > 0) {
						$img.css("margin-top", heightOffset * (-1) + 'px');
					} else {
						$img.height(divHeight);
						$img.width($img.width() * divHeight / $img.height());
						widthOffset = ($img.width() - divWidth) / 2;
						$img.css("margin-left", widthOffset * (-1) + 'px');
					}
				} else {
					widthOffset = ($img.width() - divWidth) / 2;
					if (widthOffset > 0) {
						$img.css("margin-left", widthOffset * (-1) + 'px');
					} else {
						$img.width(divWidth);
						$img.height($img.height() * divWidth / $img.width());
						heightOffset = ($img.height() - divHeight) / 2;
						$img.css("margin-top", heightOffset * (-1) + 'px');
					}
				}
			});
		},

		startTimer: function(){
			if (this.timerRunning){
				return;
			}
			this.timerRunning = true;
			var _this = this;
			var updateTimeRemaining = function(){
				var ct = _this.getConfig('timeRemaining');
				if( ct > 0 ){
					_this.setConfig('timeRemaining', --ct);
					_this.timeRemainingMonitor = setTimeout(updateTimeRemaining, 1000);
				} else {
					_this.stopTimer();
					// Make sure we change media only if related is visible and we have next item
					if( _this.isScreenVisible() && _this.templateData && _this.templateData.nextItem ){
						_this.changeMedia( null, {entryId: _this.templateData.nextItem.id},true );
					}
				}
			};
			setTimeout(updateTimeRemaining, 1000);
		},
		pauseTimer: function(){
			// Clear our interval
			clearTimeout(this.timeRemainingMonitor);
			this.timeRemainingMonitor = null;
		},
		disableAutoContinue: function() {
			this.setConfig('autoContinueEnabled', false);
			this.pauseTimer();
		},
		enableAutoContinue: function(){
			this.setConfig('autoContinueEnabled', true);
			this.startTimer();
		},
		toggleAutoContinue: function(){
			if( this.getConfig('autoContinueEnabled') ){
				this.disableAutoContinue();
			} else {
				this.enableAutoContinue();
			}
		},
		stopTimer: function(){
			this.timerRunning = false;
			this.pauseTimer();
			// Set remaining time to auto continue time
			this.setConfig('timeRemaining', this.getConfig('autoContinueTime'));
		},
		getItemsData: function( callback ){
			callback = callback || function(){};
			if( !this.templateData ){
				var _this = this;

				// Allow other plugins to inject data
				this.getPlayer().triggerQueueCallback( 'relatedData', function( args ){
					// See if the data from event will work:
					if( args && args[0] && args[0].length ){
						_this.updateTemplateData( args[0] );
						callback();
						return ;
					}
					_this.getDataFromApi( function(data){
						_this.updateTemplateData( data );
						callback();
					});
				});
			}
		},
		updateTemplateData: function( data ){
			this.numOfEntries = data.length;
			// make sure entries that were already viewed are the last in the data array
			if ( this.viewedEntries.length < data.length ){
				for (var i = 0; i < this.viewedEntries.length; i++){
					for (var j = 0; j < data.length; j++){
						if (data[j].id === this.viewedEntries[i]){ // entry was already viewed - move it to the last place in the data array
							var entry = data.splice(j,1)[0];
							data.push(entry);
						}
					}
				}
			}else{
				this.viewedEntries = [];
				this.updateStoredSession = false;
			}
			this.templateData = {
				nextItem: data.splice(0,1)[0],
				moreItems: data
			};
		},
		getDataFromApi: function( callback ){
			var _this = this;
			// check for valid playlist id:
			if( this.getConfig( 'playlistId' ) ){
				return this.getEntriesFromPlaylistId( this.getConfig( 'playlistId' ), callback , this.getConfig( 'sendContextWithPlaylist' ) );
			}
			// check for entry list:
			if( this.getConfig( 'entryList' ) ){
				return this.getEntriesFromList( this.getConfig( 'entryList' ), callback );
			}
			// if no playlist is defined used the magic related video playlistd id:
			return this.getEntriesFromPlaylistId( '_KDP_CTXPL', callback, true);
		},
		isValidResult: function( data ){
			// Check if we got error
			if( !data || data.length === 0	||( data.code && data.message )	){
				var errMsg = data.message ? data.message : 'No related items were found.';
				this.log('Error getting related items: ' + errMsg );
				this.updateTooltip(gM('mwe-embedplayer-related-errMsg'));
				this.onDisable();
				this.error = true;
				return false;
			}
			this.error = false;
			return true;
		},
		getEntriesFromList: function( entryList, callback){
			var _this =this;
			this.getKalturaClient().doRequest( {
				'service': 'baseEntry',
				'action': 'getbyids',
				'entryIds': entryList
			}, function( data ){
				// Validate result
				if( ! _this.isValidResult( data ) ) {
					return ;
				}

				// restore "entryList" order
				var orderedData = [];
				var entrylistArry = entryList.split(',');
				for(var i in entrylistArry){
					if (i >= parseInt(_this.getConfig('itemsLimit'))){
						break;
					}
					var entryId = entrylistArry[i];
					for(var j = 0; j < data.length; j++){
						if( data[j]['id'] == entryId){
							orderedData.push( data.splice( j, 1)[0] );
						}
					}
				}
				if  (_this.getConfig("enableAccessControlExclusion") ) {
					_this.filterAccessControl(orderedData ).then(function(acData){
						callback(acData);
					})

				} else {
					callback( orderedData );
				}

			});
		},
		getEntriesFromPlaylistId: function( playlistId, callback, sendContext ){
			var _this = this;
			var requestObject = {
				'service' : 'playlist',
				'action' : 'execute',
				'id' : playlistId,
				'filter:objectType': 'KalturaMediaEntryFilterForPlaylist',
				'filter:idNotIn': this.getPlayer().kentryid,
				'filter:limit': this.getConfig('itemsLimit')
			}
			if ( sendContext ) {
				requestObject['playlistContext:objectType'] = 'KalturaEntryContext';
				requestObject['playlistContext:entryId'] = this.getPlayer().kentryid;
			}
			this.getKalturaClient().doRequest( requestObject, function( data ) {
				// Validate result, don't issue callback if not valid.
				if ( !_this.isValidResult( data ) ) {
					return;
				}
				// Work around for PLAT-1680 limit not being respected:
				if ( data.length > parseInt( _this.getConfig( 'itemsLimit' ) ) ) {
					data = data.slice( 0 , parseInt( _this.getConfig( 'itemsLimit' ) ) );
				}
				if ( _this.getConfig( "enableAccessControlExclusion" ) ) {
					_this.filterAccessControl( data ).then( function ( acData ) {
						callback( acData );
					});
				} else {
					callback( data );
				}

			});
		},

		updateViewedEntries: function (entryId) {
			if ($.inArray(entryId, this.viewedEntries) == -1) {
				this.viewedEntries.push(entryId)
			}
			// update the session var if storing sessions:
			if ( this.updateStoredSession && this.getConfig('storeSession') ) {
				$.cookie(this.confPrefix + '_viewedEntries', JSON.stringify(this.viewedEntries));
			}
		},

		changeMedia: function( e, data, auto ){
			this.stopTimer();
			var _this = this;
			// update the selected entry:
			if( data && data.entryId ){
				this.setConfig('selectedEntryId', data.entryId );
			}
			this.updateViewedEntries(data.entryId);
			//look for the entry in case this is a click
			if(this.getConfig('clickUrl')){
				if(this.templateData.nextItem.id && this.templateData.nextItem.id == data.entryId ){
					//search in the next item
					data = this.templateData.nextItem;
					this.setConfig('selectedEntry',this.templateData.nextItem);
				} else if(this.templateData.moreItems) {
					// look for the entry in the other items
					for (var i = 0; i < this.templateData.moreItems.length;  i++) {
						if(data.entryId == this.templateData.moreItems[i].id ){
							data = this.templateData.moreItems[i];
							this.setConfig('selectedEntry',this.templateData.moreItems[i]);
						}
					}
				}
			}
			data["autoSelected"] = (auto === true);
			this.getPlayer().sendNotification('relatedVideoSelect', data);

			if( this.getConfig('clickUrl') ){

				try {
					if( this.getConfig( 'openInNewTab' ) === true ) {
						window.open(this.getConfig('clickUrl'), '_blank');
					}
					else {
						window.parent.location.href = this.getConfig('clickUrl');
					}
					return;
				}catch(err){
					window.open(this.getConfig('clickUrl'));
					return;
				}

			}

			this.getPlayer().sendNotification('changeMedia', data);
			this.bind('onChangeMediaDone', function(){
				if (_this.getPlayer().canAutoPlay()) {
					_this.getPlayer().play();
				}
				_this.unbind('onChangeMediaDone');
			});
			this.hideScreen();
		},
		onConfigChange: function( property, value ){
			this._super( property, value );
			if ( property === 'entryList' ){
				var _this = this;
				this.getEntriesFromList( value, function(data){
					_this.updateTemplateData(data);
					var keepScreenOpen = _this.isScreenVisible(); // save screen status so we can reopen it after switching entryList
					_this.removeScreen(); // we must remove screen to clear the DOM from old entryList thumbnails
					if (keepScreenOpen){
						_this.showScreen(); // reopen screen if needed
					}
				} );
			}
			if( !this.isScreenVisible() ) {
				return;
			}

			if( property == 'timeRemaining' ){
				if( this.getConfig('formatCountdown')){
					var timeFormat = mw.util.formaters().get('timeFormat');
					this.getScreen().then(function(screen){
						screen.find('.remaining').html(timeFormat(value));
					});
				}else{
					this.getScreen().then(function(screen){
						screen.find('.remaining').html(value);
					});
				}
			}
		},
		filterAccessControl:function(data) {
			var defer = $.Deferred();
			var acList = {};
			var acIndex = [];
			for (var i in data){
				if ( !acList[ data[i].accessControlId ] ) {
					acList[ data[i].accessControlId ] = data[i].id;
					acIndex[ acIndex.length ] = data[i].accessControlId;
				}
			}
			var requestArray = [];
			for(var i in acList) {
				var requestObject = {
					'service' : 'baseEntry',
					'action' : 'getContextData',
					'contextDataParams':{
						'referrer' : window.kWidgetSupport.getHostPageUrl(),
						'objectType' : 'KalturaEntryContextDataParams',
						'flavorTags': "all"},
					'streamerType': "http",
					"entryId": acList[i]
				};
				requestArray.push( requestObject );
			}
			if ( requestArray.length ) {
				this.getKalturaClient().doRequest( requestArray, function( EntryContextDataArray ) {
					$.each( EntryContextDataArray , function( index , EntryContextData ) {
						var isRestricted = false;
						var checkFalse = ['isCountryRestricted','isIpAddressRestricted','isSessionRestricted','isSiteRestricted','isUserAgentRestricted'];
						var checkTrue = ['isScheduledNow'];
						$.each(checkFalse,function(index,item){
							if ( EntryContextData[item] ){
								isRestricted = true;
							}
						});
						$.each(checkTrue,function(index,item){
							if ( !EntryContextData[item] ){
								isRestricted = true;
							}
						});
						for (var i in acList){
							if (acList[i] === requestArray[index].entryId){
								acList[i] = isRestricted;
							}
						}
					});
					var verifiedEntryList = [];
					$.each(data,function(index,entry){
						if ( !acList[entry.accessControlId] ){
							verifiedEntryList.push(entry);
						}
					});
					defer.resolve(verifiedEntryList);
				});
			}
			return defer;
		},
		closeScreen: function(){
			this.hideScreen();
		}
	}));

} )( window.mw, window.jQuery );