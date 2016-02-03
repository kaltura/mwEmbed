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
				$this.LoadHLS = false;
				$.each(sources,function(index,item){
					if (item.mimeType === "application/vnd.apple.mpegurl") {
						$this.getPlayer().mediaElement.selectedSource = item;
						$this.LoadHLS = true;

					}
				});
			});
			this.bind("playerReady",function(){
				if ($this.LoadHLS) {
					$this.getPlayer().skipUpdateSource = true;
					$this.hls.attachMedia( $this.getPlayer().getPlayerElement() );
					$this.hls.loadSource( $this.getPlayer().getSrc() );
					$this.getPlayer().backToLive = function () {
						var _this = this;
						var vid = this.getPlayerElement();
						vid.currentTime = vid.duration;
						setTimeout( function () {
							_this.triggerHelper( 'movingBackToLive' ); //for some reason on Mac the isLive client response is a little bit delayed, so in order to get update liveUI properly, we need to delay "movingBackToLive" helper
						} , 1000 );
					};
				}
			});
		}
	}));
} )( window.mw, window.jQuery ,window.Hls);