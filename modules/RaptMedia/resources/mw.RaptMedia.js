/**
 * The RaptMedia plugin adds RaptMedia capabilities to Kaltura.
 * RaptMedia adds clickable interactive layer that accompanies your video content and can do things like:
 * cue or launch different media plays, jump to specific timecode, trigger an event on your webpage and launch a new web page or an app.
 * Learn more at http://docs.raptmedia.com/
 *
 * This plugins is only usable for raptmedia.com accounts who enabled integration with Kaltura.
 * If you don't have a RaptMedia account or need to enable the Kaltura integration, please contact support@raptmedia.com
 * 
 * This plugin is only activated when the entryId provided is a Playlist Entry with partnerData == "raptmedia;projectId".
 * This plugin also makes use of accompanying plugin RaptMediaScrubber plugin to override the default scrubber behavior to fit a Rapt Media experience.
 * With RaptMediaScrubber plugin the scrubber can interact within the context of a single RaptMedia clip instead of just the entire stitched playlist.
 */
(function ( mw, $ ) {
	"use strict";

	mw.PluginManager.add( 'raptMedia', mw.KBaseComponent.extend( {

		defaultConfig: {
			'raptMediaScriptUrl': 'https://cdn1.raptmedia.com/system/player/v1/engine.min.js',
			'behaviorOnEnd': 'pause' //replay | pause
		},

		setup: function(){
			this.raptMediaEngine = null;
			this.raptCleanup();
			this.addBindings();
			this.loadNewEntry();
		},

		parseRaptMediaTags: function () {
			var partnerData = this.getPlayer().evaluate('{mediaProxy.entry.partnerData}');
			if (partnerData != null && partnerData.indexOf("raptmedia") > -1) {
				var partnerDataArr = partnerData.split(';');
				this.raptMediaProjectId = partnerDataArr[1];
				return true;
			}
			return false;
		},

		loadNewEntry: function () {
			this.raptMediaPlaylistEntry = this.parseRaptMediaTags();	

			if (this.raptMediaPlaylistEntry == false) {
				//this is not a rapt media entry - let the player behave normally
				this.getPlayer().sendNotification('reattachTimeUpdate');
				return;
			}
			
			//control time from this plugin (allow update the player's time label and scrubber from here)
			this.getPlayer().sendNotification('detachTimeUpdate');

			var raptMediaScriptUrl = this.getConfig( 'raptMediaScriptUrl' );
			var _this = this;
			var raptPlaylistEntries = _this.getPlayer().evaluate('{mediaProxy.entry.playlistContent}');
			this.raptPlaylistContent = raptPlaylistEntries.split(',');
			var requestsArray = Array();
			this.raptPlaylistContent.forEach(function (entryId) {
				requestsArray.push({
					'service': 'media',
					'action': 'get',
					'entryId': entryId
				});
				requestsArray.push({
					'service': 'flavorasset',
					'action': 'getbyentryid',
					'entryId': entryId
				});
			});
			
			_this.getKalturaClient().doRequest(requestsArray, function (data) {
				
				if (!_this.isValidApiResult(data))
					return;

				var accumulativeFrames = 0;
				var defaul_fps = 24;
				var fps = null;
				var entry = null;
				var flavorAssets = null;

				for (var i = 0; i < data.length; ++i) { 
					entry = data[i];
					flavorAssets = data[i+1];
				    if ( document.URL.indexOf( 'debugKalturaPlayer' ) !== -1 )
						console.log('raptMediaPlugin::[init]', entry, flavorAssets);

					if (Array.isArray(flavorAssets) && flavorAssets.length > 0 && flavorAssets[0].frameRate > 0)
						fps = flavorAssets[0].frameRate;
					else
						fps = defaul_fps;
					
					var segemtFrames = Math.ceil(entry.msDuration / 1000 * fps);

					var segment = {
						msStartTime: (accumulativeFrames / fps) * 1000,
						msDuration: entry.msDuration,
						frames: segemtFrames,
						width: entry.width, 
						height: entry.height,
						entryId: entry.id
					};
					_this.raptSegments[entry.id] = segment;
					_this.raptSequence.push(segment);
					accumulativeFrames += segemtFrames;
					++i;
				}
				
				$.ajax({ dataType: 'script', url: raptMediaScriptUrl, cache: true })
				.done(function() {
					_this.log('Loaded script successfuly: ' + raptMediaScriptUrl);
				})
				.fail(function( jqxhr, settings, exception ) {
					_this.log('Failed to load script: ' + raptMediaScriptUrl + ', ' + exception);
				})
				.then(function() {
					_this.log('Then, setup the rapt engine');
					_this.getComponent();
					_this.$el.show();
					_this.setupRaptMediaPlugin();
				})
				.then(function(){
					_this.log('And then, continue player init');
					_this.initCompleteCallback();
				});
			});
		},

		addBindings: function() {
			var _this = this;
            this.bind('onChangeMediaDone', function(event) { 
            	_this.raptCleanup();
				_this.loadNewEntry();
			});
		},

		getComponent: function () {
			
			if ( ! this.$el) {
				this.$el = $( "<div></div>" ).attr( 'id', 'raptMediaOverlay' ).addClass( this.getCssClass() );
			}

			return this.$el;
		},

		raptCleanup: function() {
			if (this.$el)
				this.$el.hide();
			this.unbind('updateLayout');
			this.unbind('monitorEvent');
			this.unbind('playerPlayEnd');
			this.unbind('seeked');
			this.unbind('playerPlayed');
			this.unbind('replayEvent');
			this.getPlayer().sendNotification('enableGui', { 'guiEnabled': true });
			this.raptMediaPlaylistEntry = false;
			this.engineCurrentSegment = null;
			this.playbackEnded = false;
			this.playlistContent = null;
			this.raptPlaylistContent = null;
			this.raptSegments = Array();
			this.raptSequence = Array();
		},

		setupRaptMediaPlugin: function () {
			
			var _this = this;

			if ( ! this.raptDelegate) {

				this.raptDelegate = {
					
					element: this.$el[0],

					load: function(media, flags) {
						if (_this.raptSequence.length == 0) return;
						var currentEntryId = media.sources[0].src;
						_this.engineCurrentSegment = _this.raptSegments[currentEntryId];
						_this.getPlayer().sendNotification("doSeek", (_this.engineCurrentSegment.msStartTime / 1000));
						_this.getPlayer().sendNotification("raptMedia_newSegment", _this.engineCurrentSegment);
						_this.getPlayer().sendNotification('enableGui', { 'guiEnabled': true });
						_this.log('load: ' + _this.engineCurrentSegment);
					},
					
					play: function() {
						_this.getPlayer().sendNotification("doPlay");
						_this.getPlayer().sendNotification('enableGui', { 'guiEnabled': true });
					},
					
					pause: function() {
						_this.getPlayer().sendNotification("doPause");
					},
					
					seek: function(time) {
						_this.getPlayer().sendNotification("doSeek", time);
						_this.getPlayer().sendNotification('enableGui', { 'guiEnabled': true });
					},

					event: function(event) {
						_this.log('caught rapt event: ' + event.type);
						switch (event.type) {
							case 'project:ended':
								var behaviorOnEnd = _this.getConfig( 'behaviorOnEnd' );
								_this.log('project:ended - ' + behaviorOnEnd);
								if (behaviorOnEnd == 'replay') {
									_this.raptMediaEngine.replay();
									_this.getPlayer().sendNotification('enableGui', { 'guiEnabled': true });
								}
								break;
						}
					},
					
					error: function(error){
						_this.log('Engine error: ' + error);
					}
				};

				var config = _this.getConfig('raptEngine');
				this.raptMediaEngine = new Rapt.Engine(this.raptDelegate, config);
			}

			this.raptMediaEngine.load(this.raptMediaProjectId);

			this.bind('updateLayout', function(){ _this.raptMediaResize(); });

			this.bind('monitorEvent', function(){ _this.raptMediaUpdate(); });
			
			this.bind('playerPlayEnd', function() {
				_this.raptMediaUpdate(null);
			});
			
			this.bind('seeked', function() {
				//anything here?
			});
			
			this.bind('playerPlayed', function(){
				_this.getPlayer().sendNotification('enableGui', { 'guiEnabled': true });
			});
			
			this.bind('replayEvent', function(){
				_this.raptMediaEngine.replay();
				_this.log('Replay the RAPT project');
			});

			this.raptMediaResize();
			this.raptMediaUpdate();

			this.log('Engine setup complete');
		},

		raptMediaUpdate: function(){
			
			if (this.engineCurrentSegment == null) 
				return;

			this.playbackEnded = false;

			var currentTimeMillis = ((parseFloat(this.getPlayer().currentTime).toFixed(3) * 1000) - this.engineCurrentSegment.msStartTime);
			if (currentTimeMillis < 0) currentTimeMillis = 0;
			var currentTimeSec = (currentTimeMillis / 1000).toFixed(3);

			var segmentDurationMillis = this.engineCurrentSegment.msDuration - 550;
			var segmentDurationSec = (this.engineCurrentSegment.msDuration / 1000).toFixed(3);

			if (currentTimeMillis >= segmentDurationMillis) {
				this.playbackEnded = true;
				currentTimeSec = segmentDurationSec;
				this.getPlayer().sendNotification('doPause');
				this.getPlayer().sendNotification('raptMedia_pausedDecisionPoint');
				this.getPlayer().sendNotification('enableGui', { 'guiEnabled': false, 'enableType': 'controls' });
			}

			this.log(currentTimeSec + ", " + segmentDurationSec + " , " + this.playbackEnded);
			
			this.raptMediaEngine.update({
				currentTime: currentTimeSec,
				duration: segmentDurationSec,
				ended: this.playbackEnded,
				videoWidth: this.engineCurrentSegment.width,
				videoHeight: this.engineCurrentSegment.height
			});

			this.getPlayer().sendNotification('externalTimeUpdate', currentTimeSec);
		},

		raptMediaResize: function() {
			this.$el.width(this.getPlayer().getVideoHolder().width());
			this.$el.height(this.getPlayer().getVideoHolder().height());
			this.raptMediaEngine.resize({
				width: this.getPlayer().getVideoHolder().width(),
				height: this.getPlayer().getVideoHolder().height() 
			});
		},

		isValidApiResult: function (data) {
			if (!data){
				this.error = true;
				this.log("API Error retrieving data");
				return false;
			} else if ( data.code && data.message ) {
				this.error = true;
				this.log("API Error code: " + data.code + ", error message: " + data.message);
				return false;
			}
			this.error = false;
			return true;
		},
		
	} ) );
} ) ( window.mw, window.jQuery );	