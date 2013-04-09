(function (mw, $) {
	"use strict";

	mw.Peer5 = function (embedPlayer, callback) {
		return this.init(embedPlayer, callback);
	};

	mw.Peer5.prototype = {
		bindPostfix:'.Peer5',
		peer5_vid:null,
		peer5_type:null,
		peer5_options:null,

		init:function (embedPlayer, callback) {
			var _this = this;
			this.embedPlayer = embedPlayer;
			// Load Peer5
			this.peer5_vid = this.getConfig('url');
			this.peer5_type = this.getConfig('type');
			this.peer5_overlayUI = this.getConfig('overlayUI');
			this.peer5_proxy = this.getConfig('proxy');
			kWidget.appendScriptUrl(_this.getConfig('peer5libUrl'), function () {
				// bind player
				_this.bindPlayer();
				// continue player build out:
				callback();
			}, document);
		},
		bindPlayer:function (event, embedPlayer) {
            // if not specified otherwise, use highest BR
            if (!this.embedPlayer.evaluate('{mediaProxy.preferedFlavorBR}')) {
                // update the source to highest quality mp4
                $(this.embedPlayer.mediaElement).bind('onSelectSource', function () {
                    var playableSources = this.getPlayableSources();
                    var maxBr = 0;
                    var selectedSource = null;
                    $.each(playableSources, function (inx, source) {
                        if (source.bandwidth) {
                            // We only look at sources that can be played with "native" player
                            var player = mw.EmbedTypes.getMediaPlayers().defaultPlayer(source.mimeType);
                            if (!player || player.library != 'Native') {
                                // continue
                                return true;
                            }
                            if (source.bandwidth > maxBr) {
                                selectedSource = source;
                            }
                        }
                    });
                    if (selectedSource) {
                        mw.log("Peer5: selected source via max bitrate: " + selectedSource.width + 'x' + selectedSource.height + ' bitrate:' + selectedSource.bandwidth);
                        _this.embedPlayer.mediaElement.selectedSource = selectedSource;
                    }
                });
            }

			// checkPlayerSourcesEvent ( add peer5 mediaStream source )
			var _this = this;
			$(this.embedPlayer).bind('playerReady', function (event, callback) {
				var vid = this.getPlayerElement();
				var url = _this.peer5_vid;
//				var type = (this.getSource() && this.getSource().mimeType == 'mp4')?'video/mp4; codecs="avc1.64001f,mp4a.40.2"':null;

                var type = vid.mimeType; //custom attribute for future use
                if (!type) {
                    type = 'video/mp4; codecs="avc1.64001f,mp4a.40.2"';
                }
				var options = {};
				var overlay = {
					chunks_area_style:'position: absolute; top: 399px;left: 40px;width: 563px;'
				};

				if (_this.peer5_overlayUI) {
					options.overlayUI = overlay;
				}

				if (_this.peer5_proxy == false) {
					options.proxy = false;
				} else {
                    options.proxy = true;
                }

				peer5.create(vid, url, type, options);

//
//					peer5.create(vid, 'http://commondatastorage.googleapis.com/peer5_vod/wind2.mp4', 'video/mp4; codecs="avc1.64001f,mp4a.40.2"',
//						{overlayUI:{
//							chunks_area_style:'position: absolute; top: 399px;left: 40px;width: 563px;'
//						}});
				this.mediaElement.selectedSource.src = vid.src;
				$( this.getInterface()).find('.ui-widget.source-switch').text('Peer5 HD');
                $( this.getInterface()).find('.ui-widget.source-switch').unbind('click');
//                $( this.getInterface()).find('.ui-widget.source-switch').click(function(){ /* todo: toggle overlay */ return false; } );

            });
		},
		getConfig:function (propId) {
			// return the attribute value
			return this.embedPlayer.getKalturaConfig('peer5', propId);
		}
	}

})
	(window.mw, window.jQuery);
