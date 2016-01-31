( function( mw, $ , Hls ) {"use strict";

	// Add HLS Logic player:
	mw.setConfig("streamerType","hls");
	mw.supportsFlash = function(){return false;};
	$( mw ).bind('EmbedPlayerUpdateMediaPlayers', function( event, mediaPlayers ){
		if (Hls.isSupported()){
			//application/vnd.apple.mpegurl
			var hlsPlayer = new mw.MediaPlayer( 'hlsPlayer', ['video/h264', 'video/mp4','application/vnd.apple.mpegurl'], 'Native' );
		    mediaPlayers.addPlayer(hlsPlayer);
			mw.EmbedTypes.mediaPlayers.defaultPlayers['application/vnd.apple.mpegurl'] = ['Native'];

		}

	});

	mw.PluginManager.add( 'hlsjs', mw.KBasePlugin.extend({

		defaultConfig: {

		},


		setup: function( embedPlayer ) {
			var _this = this;
			this.addBindings();
			this.hls =  new Hls();


		},

		addBindings: function() {
			var $this = this;
			this.bind("onSelectSource", function(event,sources){
				$.each(sources,function(index,item){
					if (item.mimeType === "application/vnd.apple.mpegurl") {
						$this.getPlayer().mediaElement.selectedSource = item;

					}
				});
			});
			this.bind("playerReady",function(){
				$this.getPlayer().skipUpdateSource = true;
				$this.hls.attachMedia($this.getPlayer().getPlayerElement());
				$this.hls.loadSource($this.getPlayer().getSrc());

				$this.getPlayer().play = function(){
					var vid = this.getPlayerElement();
					var _this = this;

					// if starting playback from stoped state and not in an ad or otherise blocked controls state:
					// restore player:
					if (this.isStopped() && this._playContorls) {
						this.restorePlayerOnScreen();
					}

					var doPlay = function () {
						// Run parent play:
						if (_this.parent_play()) {
							if (_this.getPlayerElement() && _this.getPlayerElement().play) {
								_this.log(" issue native play call:");
								// make sure the source is set:
								_this.hideSpinnerOncePlaying();
								// make sure the video tag is displayed:
								$(_this.getPlayerElement()).show();
								// Remove any poster div ( that would overlay the player )
								if (!_this.isAudio()) {
									_this.removePoster();
								}
								// if using native controls make sure the inteface does not block the native controls interface:
								if (_this.useNativePlayerControls() && $(_this).find('video ').length == 0) {
									$(_this).hide();
								}
								// issue a play request
									var video = vid;

								//	$this.hls.on(Hls.Events.MANIFEST_PARSED,function() {
											vid.play();
								//	});
								_this.mobilePlayed = true;
								// re-start the monitor:
								_this.monitor();
							}
						} else {
							_this.log(" parent play returned false, don't issue play on native element");
						}
					};
					doPlay();
				};


			});


		}



	}));
} )( window.mw, window.jQuery ,window.Hls);