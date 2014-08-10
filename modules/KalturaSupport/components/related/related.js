( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'related', mw.KBaseScreen.extend({

		defaultConfig: {
			parent: "topBarContainer",
			order: 4,
			align: "right",
			tooltip: 'Related',
			showTooltip: true,
			//visible: false,
			itemsLimit: 12,
			displayOnPlaybackDone: true,
			autoContinueEnabled: true,
			autoContinueTime: null,
			templatePath: 'components/related/related.tmpl.html',
			playlistId: null,
			formatCountdown : false,
			clickUrl : null,
			enableAccessControlExclusion:false
		},
		viewedEntries: [],
		iconBtnClass: 'icon-related',


		setup: function(){
			var _this = this;
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
					_this.resizeThumbs();
				},200)

			});
			this.bind('onCloseFullScreen', function() {
				setTimeout(function(){
					$('.item-inner img').each(function() {
						$(this).css("margin-top", 0 +"px");
						$(this).css("margin-left", 0 +"px");
						$(this).width("100%");
						$(this).height("100%");
					});
					_this.resizeThumbs();
				},200)
			});

			if( this.getConfig('displayOnPlaybackDone') ){
				this.bind('onEndedDone', function(){
					if ( _this.error ) {
						return;
					}
					_this.showScreen();
					if( _this.getConfig('autoContinueEnabled') && _this.getConfig('autoContinueTime') ){
						_this.startTimer();
					}
				});
			}

			this.bind('replayEvent', function(){
				_this.stopTimer();
			});
		},

		showScreen: function(){
			this._super(); // this is an override of showScreen in mw.KBaseScreen.js - call super
			this.resizeThumbs();
		},

		resizeThumbs: function(){
			// resize and crop from center all thumbnails
			$('.item-inner').each(function() {
				// set css class according to image aspect ratio
				console.log( $(this).width() / $(this).height());
				var cssClass = $(this).width() / $(this).height() > 1.45 ? 'wide' : 'square';
				$(this).find("img").removeClass().addClass(cssClass);
				var img = $(this).find("img")[0];

				var divWidth = $(this).width();    // save img div container width for cropping logic
				var divHeight = $(this).height();  // save img div container height for cropping logic

				// crop image from center. use a timeout to make sure the image is already resized before changing its margins
				setTimeout(function(){
					if (cssClass == 'wide'){
						var heightOffset = ($(img).height()-divHeight)/2;
						if (heightOffset > 0){
							$(img).css("margin-top", heightOffset * (-1) + 'px');
						}else{
							$(img).width($(img).width()*divHeight/$(img).height());
							$(img).height(divHeight);
							var widthOffset = ($(img).width()-divWidth)/2;
							$(img).css("margin-left", widthOffset * (-1) + 'px');
						}
					}else{
						var widthOffset = ($(img).width()-divWidth)/2;
						if (widthOffset > 0){
							$(img).css("margin-left", widthOffset * (-1) + 'px');
						}else{
							$(img).height($(img).height()*divWidth/$(img).width());
							$(img).width(divWidth);
							var heightOffset = ($(img).height()-divHeight)/2;
							$(img).css("margin-top", heightOffset * (-1) + 'px');
						}
					}

				},200);
			});
		},

		startTimer: function(){
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
						_this.changeMedia( null, {entryId: _this.templateData.nextItem.id} );
						_this.viewedEntries.push(_this.templateData.nextItem.id);
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
					// Get data from event
					if( args ){
						_this.templateData = args[0];
						callback();
						return ;
					}
					_this.getDataFromApi( function(data){
						// make sure entries that were already viewed are the last in the data array
						for (var i = 0; i < _this.viewedEntries.length; i++){
							for (var j = 0; j < data.length; j++){
								if (data[j].id === _this.viewedEntries[i]){ // entry was already viewed - move it to the last place in the data array
									var entry = data.splice(j,1)[0];
									data.push(entry);
								}
							}
						}
						_this.templateData = {
							nextItem: data.splice(0,1)[0],
							moreItems: data
						};
					});
				});
				return;
			}
			callback();
			return;
		},
		getDataFromApi: function( callback ){
			var _this = this;
			// check for valid playlist id:
			if( this.getConfig( 'playlistId' ) ){
				return this.getEntriesFromPlaylistId( this.getConfig( 'playlistId' ), callback);
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
			if( !data
				||
				( data.code && data.message )
				){
				this.log('Error getting related items: ' + data.message);
				this.getBtn().hide();
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
					for(var j in data){
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
			this.getKalturaClient().doRequest( requestObject, function( data ){
				// Validate result, don't issue callback if not valid.
				if( ! _this.isValidResult( data ) ) {
					return ;
				}
				if  (_this.getConfig("enableAccessControlExclusion") ) {
					_this.filterAccessControl(data ).then(function(acData){
						callback(acData);
					})

				} else {
					callback( data );
				}

			});
		},

		changeMedia: function( e, data ){
			this.stopTimer();
			var _this = this;
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

			this.getPlayer().sendNotification('relatedVideoSelect', data);

			if(this.getConfig('clickUrl')){
				try {
					window.parent.location.href = this.getConfig('clickUrl');
					return;
				}catch(err){
					window.open(this.getConfig('clickUrl'));
					return;
				}
			}

			this.getPlayer().sendNotification('changeMedia', data);
			this.bind('onChangeMediaDone', function(){
				_this.getPlayer().play();
				_this.unbind('onChangeMediaDone');
			});
			this.hideScreen();
		},
		onConfigChange: function( property, value ){
			this._super( property, value );
			if( !this.isScreenVisible() ) {
				return;
			}

			if( property == 'timeRemaining' ){
				if( this.getConfig('formatCountdown')){
					var timeFormat = mw.KDPMapping.prototype.formatFunctions.timeFormat;
					this.getScreen().find('.remaining').html(timeFormat(value));
				}else{
					this.getScreen().find('.remaining').html(value);
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
		}
	}));

} )( window.mw, window.jQuery );