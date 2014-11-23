( function( mw, $, kWidget ) {"use strict";

	mw.PluginManager.add( 'streamSelector', mw.KBaseComponent.extend({

		defaultConfig: {
			"parent": "controlsContainer",
			"order": 61,
			"displayImportance": 'low',
			"align": "right",
			"showTooltip": true,
			"defaultStream": 1,
			"enableKeyboardShortcuts": true
		},

		isDisabled: false,
		streams: [],
		streamsReady: false,
		streamEnded: false,

		setup: function(){
			this.addBindings();
		},
		destroy: function(){
			this._super();
			this.getComponent().remove();
		},
		addBindings: function(){
			var _this = this;

			this.bind( 'playerReady', function(){
				if (!_this.streamsReady) {
					_this.onDisable();
					_this.getSources();
				}
			});

			this.bind( 'streamsReady', function(){
				//Indicate that the streams are ready to enable spinning animation on source switching
				_this.streamsReady = true;
				//Insert original entry to streams
				_this.streams.splice(0, 0 ,{
					id: _this.getPlayer().kentryid,
					data: {
						meta: _this.getPlayer().kalturaPlayerMetaData,
						contextData: _this.getPlayer().kalturaContextData
					}
				});
				//Set default stream
				if ( ( _this.getConfig("defaultStream") < 1) || ( _this.getConfig("defaultStream") > _this.streams.length ) ){
					mw.log("streamSelector:: Error - default stream id is out of bounds, setting to 1");
					_this.setConfig("defaultStream", 1);
				}
				_this.currentStream = _this.getDefaultStream();
				//TODO: handle default stream selection???
				if (_this.getPlayer().kentryid != _this.currentStream.id) {
					_this.setStream( _this.currentStream );
				}
				_this.buildMenu();
				_this.onEnable();
			});

			this.bind( 'sourceSwitchingEnd SourceChange', function(){
				if (_this.streamsReady){
					_this.onEnable();
				}
			});

			this.bind( 'sourceSwitchingStarted', function(){
				_this.onDisable();
			});

			this.bind("ended", function(){
				_this.streamEnded = true;
			});

			this.bind("onplay", function(){
				_this.streamEnded = false;
			});

			this.bind( 'changeStream', function(e, arg ){
				_this.setStreamFromApi( arg );
			});

			if( this.getConfig('enableKeyboardShortcuts') ){
				this.bind( 'addKeyBindCallback', function( e, addKeyCallback ){
					_this.addKeyboardShortcuts( addKeyCallback );
				});
			}
		},
		getSources: function(){
			var _this = this;
			// do the api request
			this.getKalturaClient().doRequest( {
				'service': 'baseEntry',
				'action': 'list',
				'filter:objectType': 'KalturaBaseEntryFilter',
				'filter:parentEntryIdEqual': this.getPlayer().kentryid
			}, function ( data ) {
				// Validate result
				if ( _this.isValidResult( data ) ) {
					_this.getSourcesFlavours(data.objects);
				} else {
					mw.log('streamSelector::Error retrieving additional streams, disabling component');
					_this.getBtn().hide();
				}
			} );
		},
		getSourcesFlavours: function(sources){
			var _this = this;
			var requestArray = [];
			$.each(sources, function(index, source) {
				requestArray.push(
					{
						'service': 'flavorAsset',
						'action': 'list',
						'filter:entryIdEqual': source.id
					}
				);
				_this.streams.push({ id: source.id, data: {meta: source, contextData: null}});
			});
			// do the api request
			if (requestArray.length){
				// do the api request
				this.getKalturaClient().doRequest( requestArray, function ( data ) {
					// Validate result
					$.each(data, function(index, res) {
						if ( !_this.isValidResult( res ) ) {
							data[index] = null;
						}
					});
					$.each(_this.streams, function(index, stream){
						stream.data.contextData = {flavorAssets: data[index].objects};
					});
					_this.embedPlayer.triggerHelper( 'streamsReady' );
				} );
			} else {
				mw.log('streamSelector::No streams data to request, disabling component');
				this.getBtn().hide();
			}
		},
		isValidResult: function( data ){
			// Check if we got error
			if( !data
				||
				( data.code && data.message )
				){
				mw.log('streamSelector::Error, invalid result: ' + data.message);
				this.error = true;
				return false;
			}
			this.error = false;
			return true;
		},
		addKeyboardShortcuts: function( addKeyCallback ){
			var _this = this;
			// Add ] Sign for next stream
			addKeyCallback( 221, function(){
				_this.setStream( _this.getNextStream() );
			});
			// Add [ Sigh for previous stream
			addKeyCallback( 219, function(){
				_this.setStream( _this.getPrevStream() );
			});
			// Add \ Sigh for normal speed
			addKeyCallback( 220, function(){
				_this.setStream( _this.getDefaultStream() );
			});
		},
		getNextStream: function(){
			if( this.streams[this.getCurrentStreamIndex()+1] ){
				return this.streams[this.getCurrentStreamIndex()+1];
			}
			return this.streams[this.getCurrentStreamIndex()];
		},
		getPrevStream: function(){
			if( this.streams[this.getCurrentStreamIndex()-1] ){
				return this.streams[this.getCurrentStreamIndex()-1];
			}
			return this.streams[this.getCurrentStreamIndex()];
		},
		getDefaultStream: function(){
			return this.streams[(this.getConfig('defaultStream') - 1)];
		},
		getCurrentStreamIndex: function(){
			var _this = this;
			var index = null;
			$.each(this.streams, function( idx, stream){
				if( _this.currentStream == stream ){
					index = idx;
					return false;
				}
			});
			return index;
		},
		buildMenu: function(){
			var _this = this;

			// Destroy old menu
			this.getMenu().destroy();

			if( ! this.streams.length ){
				mw.log("streamSelector:: Error with getting streams");
				//this.destroy();
				return ;
			}

			$.each( this.streams, function( streamIndex, stream ) {
				_this.addStreamToMenu( streamIndex, stream );
			});
			this.getMenu().setActive({'key': 'id', 'val': this.getCurrentStreamIndex()});
		},
		addStreamToMenu: function( id, stream ){
			var _this = this;
			var active = (this.getCurrentStreamIndex() == id);
			this.getMenu().addItem({
				'label': "Cam " + (id + 1),
				'attributes': {
					'id': id//stream.getAssetId()
				},
				'callback': function(){
					_this.setStream( stream );
				},
				'active': active
			});
		},
		setStreamFromApi: function(id){
			var stream = this.streams[id];
			if (stream){
				this.setStream(stream);
			} else {
				mw.log("streamSelector:: Error - invalid stream id");
			}
		},
		setStream: function(stream){
			mw.log("streamSelector:: set stream");
			if (this.currentStream != stream) {
				var _this = this;
				var embedPlayer = this.getPlayer();
				//Set reference to active stream
				this.currentStream = stream;
				//Get reference for current time for setting timeline after source switch
				var currentTime = embedPlayer.getPlayerElementTime();
				//Check if stream ended, and ignore current time data if so
				if (this.streamEnded){
					currentTime = 0;
				}
				//Save current autoplay state to return it after switching
				var origAutoplay = embedPlayer.autoplay;
				//When switching stream always start playing
				embedPlayer.autoplay = true;

				//Freeze scrubber and time labels to exhibit seamless transition between streams
				if (currentTime > 0) {
					embedPlayer.triggerHelper( "freezeTimeIndicators", [true] );
				}

				var checkPlayerSourcesFunction = function(callback) {
					//Create source data from raw data
					var sources = kWidgetSupport.getEntryIdSourcesFromPlayerData( embedPlayer.kpartnerid, stream.data );
					//handle player data mappings to embedPlayer and check for errors
					kWidgetSupport.handlePlayerData( embedPlayer, stream.data );
					//Replace sources
					embedPlayer.replaceSources( sources );

					//Update player metadata and poster/thumbnail urls
					embedPlayer.kalturaPlayerMetaData = stream.data.meta;
					//Do not show poster on switch to avoid poster flashing
					mw.setConfig( 'EmbedPlayer.HidePosterOnStart', true );
					embedPlayer.triggerHelper( 'KalturaSupport_EntryDataReady', embedPlayer.kalturaPlayerMetaData );
					callback();
				};

				var changeMediaCallback = function () {
					//Return autoplay state to original
					embedPlayer.autoplay = origAutoplay;
					// issue a seek
					if (currentTime > 0) {
						_this.bind("seeked", function(){
							_this.unbind("seeked");
							//Unfreeze scrubber and time labels after transition between streams
							embedPlayer.triggerHelper("freezeTimeIndicators", [false]);
							//emove the black screen afteer seek has ended
							embedPlayer.removeBlackScreen();
							//Return poster to allow display of poster on clip done
							mw.setConfig( 'EmbedPlayer.HidePosterOnStart', false );
						});
						//Add black screen before seek to avoid flashing of video
						embedPlayer.addBlackScreen();
						embedPlayer.sendNotification( 'doSeek', currentTime );
					} else {
						//Return poster to allow display of poster on clip done
						mw.setConfig( 'EmbedPlayer.HidePosterOnStart', false );
					}
				};

				embedPlayer.changeMedia(changeMediaCallback , checkPlayerSourcesFunction, true );
			} else {
				mw.log("streamSelector:: selected stream is already the active stream");
			}
		},
		toggleMenu: function(){
			if ( this.isDisabled ) {
				return;
			}
			this.getMenu().toggle();
		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				var $menu = $( '<ul />' );
				//TODO: need icon from Shlomit!
				var $button = $( '<button />' )
					.addClass( 'btn icon-switchSource' )
					.attr('title', gM( 'mwe-embedplayer-select_stream' ))
					.click( function(e){
						_this.toggleMenu();
					});
				this.setAccessibility($button, gM( 'mwe-embedplayer-select_stream' ));
				this.$el = $( '<div />' )
					.addClass( 'dropup' + this.getCssClass() )
					.append( $button, $menu );
			}
			return this.$el;
		},
		getMenu: function(){
			if( !this.menu ) {
				this.menu = new mw.KMenu(this.getComponent().find('ul'), {
					tabIndex: this.getBtn().attr('tabindex')
				});
			}
			return this.menu;
		},
		getBtn: function(){
			return this.getComponent().find( 'button' );
		},
		onEnable: function(){
			this.isDisabled = false;
			this.updateTooltip( gM( 'mwe-embedplayer-select_stream' ) );
			this.getComponent().find('button').removeClass( 'rotate' );
			this.getBtn().removeClass( 'disabled' );
		},
		onDisable: function(){
			this.isDisabled = true;
			this.updateTooltip( gM( 'mwe-embedplayer-switch_stream' ) );
			this.getComponent().find('button').addClass( 'rotate' );
			this.getComponent().removeClass( 'open' );
			this.getBtn().addClass( 'disabled' );
		}
	}));

} )( window.mw, window.jQuery, kWidget );