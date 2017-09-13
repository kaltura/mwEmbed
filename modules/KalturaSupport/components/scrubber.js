(function (mw, $, kWidget) {
	"use strict";

	mw.PluginManager.add('scrubber', mw.KBaseComponent.extend({

		defaultConfig: {
			'parent': 'controlBarContainer',
			'insertMode': 'firstChild',
			'order': 25,
			'sliderPreview': true,
			'thumbSlices': 100,
			'thumbWidth': 100,
			'minWidth': 100,
			'displayImportance': "medium",
			'disableUntilFirstPlay': false,
			'showOnlyTime': false,
			'thumbSlicesUrl': null
		},

		waitForFirstPlay: false,
		updateEnabled: true,
        liveEdge: 98,

		isSliderPreviewEnabled: function () {
			return this.getConfig("sliderPreview") && !this.isDisabled;
		},
		setup: function (embedPlayer) {
			if ( this.embedPlayer.isMobileSkin() ){
				this.setConfig('parent','controlsContainer');
				this.setConfig('showOnlyTime',true);
			}
			// make sure insert mode reflects parent type:
			if (this.getConfig('parent') == 'controlsContainer') {
				this.setConfig('insertMode', 'lastChild');
			}
            //new DVR layout: no time label, only negative live edge offset at the mousemove over the scrubber
            if(this.embedPlayer.isDVR()){
                this.setConfig('showOnlyTime',true);
            }
			this.addBindings();
            if (this.isSliderPreviewEnabled()) {
				this.setupThumbPreview();
			}
		},
		addBindings: function () {
			var _this = this;
			this.bind('durationChange', function (event, duration) {
                _this.duration = duration;
			});
            this.bind('seeked', function () {
                _this.justSeeked = true;
            });

			// check if parent is controlsContainer
			if (this.getConfig('parent') == 'controlsContainer') {
				// need to add
				this.bind('updateComponentsVisibilityStart', function () {
					// take minWidth, so that normal display Importance rules work:
					_this.getComponent().css('width', _this.getConfig('minWidth'));
				});
				this.bind('updateComponentsVisibilityDone', function () {
					var $container = _this.getComponent().parent();
					// get remaining space:
					var compSize = _this.embedPlayer.layoutBuilder.getComponentsWidthForContainer(
						$container
					) - _this.getComponent().width();
					var targetSize = $container.width() - compSize;
					if (targetSize < _this.getConfig('minWidth')) {
						targetSize = _this.getConfig('minWidth');
					}
					_this.getComponent().css('width', ( targetSize ) + 'px');
				});
			}
			// Update buffer bar
			this.bind('updateBufferPercent', function (e, bufferedPercent) {
				_this.updateBufferUI(bufferedPercent);
			});

			this.bindUpdatePlayheadPercent();
			this.bind('externalUpdatePlayHeadPercent', function (e, perc) {
				_this.updatePlayheadPercentUI(perc);
			});
			//will stop listening to updatePlayheadPercent events
			this.bind('detachTimeUpdate', function () {
				_this.unbind('updatePlayHeadPercent');
			});
			//will re-listen to updatePlayheadPercent events
			this.bind('reattachTimeUpdate', function () {
				_this.bindUpdatePlayheadPercent();
			});

			this.bind('onOpenFullScreen', function () {
				// check if IE11 and iframe (KMS-4606)
                if( mw.isIE11() && ( mw.getConfig('EmbedPlayer.IsIframeServer' ) || mw.getConfig('EmbedPlayer.IsFriendlyIframe') ) ) {
                    window["resizeScrubberIE11"] = true; // global var for jquery.ui.slider.js - fix jquery defect inside IE11 iframe fullscreen element.outerWidth()
                }
			});
			this.bind('onCloseFullScreen', function () {
				if( window["resizeScrubberIE11"]===true )
                    window["resizeScrubberIE11"] = null; //clear global var used only by jquery in IE11 iframe fullscreen
			});

			this.bind('playerReady', function (event) {
				//Load the strip only if the configuration allows preview. It gets a 404 if you do not have a local flavor
				if (_this.getConfig("sliderPreview")) {
					_this.thumbnailsLoaded = _this.loadedThumb = false;
					//We put this into a timeout to avoid stacking resource requests in video autoplay and player build out setups
					setTimeout(function () {
						_this.loadThumbnails(function () {
							_this.thumbnailsLoaded = true;
						});
					}, 1000);
				}

				if (_this.getConfig('disableUntilFirstPlay')) {
					_this.waitForFirstPlay = true;
					_this.onDisable();
				}
			});

			// If we need to disable the plugin until first play, bind to first play
			if (this.getConfig('disableUntilFirstPlay')) {
				this.waitForFirstPlay = true;
				this.bind('firstPlay', function () {
					_this.waitForFirstPlay = false;
					_this.onEnable();
				});
			}
			this.bind("freezeTimeIndicators", function (e, state) {
				if (state === true) {
					_this.updateEnabled = false;
				} else {
					_this.updateEnabled = true;
				}
			});
            this.bind("onPlayerStateChange", function (e, newState, oldState) {
                if(newState === 'pause') {
                    _this.paused = true;
                }
            });
		},
		bindUpdatePlayheadPercent: function () {
			var _this = this;
			this.bind('updatePlayHeadPercent', function (e, perc) {
				_this.updatePlayheadPercentUI(perc);
			});
		},
		updatePlayheadPercentUI: function (perc) {
			if (this.updateEnabled) {
				var val = parseInt(perc * 1000);
				this.updatePlayheadUI(val);
			}
		},
		updateBufferUI: function (percent) {
			this.getComponent().find('.buffered').css({
				"width": ( parseInt(percent * 100) ) + '%'
			});
		},
		updatePlayheadUI: function (val) {
            if( this.getPlayer().isPlaying() && !this.paused && this.embedPlayer.isDVR() ) {
				this.checkForLiveEdge();
                if( !this.getPlayer().isLiveOffSynch()) {
                    this.getComponent().slider('option', 'value', 999);
                    return;
                }
            }
			if( this.embedPlayer.isDVR() && this.duration < 1800 ) {
				var relativeEdge = this.calculateRelativeLiveEdge(val);
				if ( !relativeEdge ) {
					this.getComponent().slider('option', 'value', val);
				}
			} else {
				this.getComponent().slider('option', 'value', val);
			}
            if(this.paused && this.getPlayer().isPlaying()){
                this.paused = false;
            }
		},
        checkForLiveEdge: function (){
            if(this.justSeeked){
                this.justSeeked = false;
                return;
            }
            var playHeadPercent = (this.getPlayHeadComponent().position().left + this.getPlayHeadComponent().width()/2) / this.getComponent().width();
            playHeadPercent = parseInt(playHeadPercent*100);
            if( this.getPlayer().isLiveOffSynch() && ( playHeadPercent >= this.liveEdge || this.embedPlayer.getLiveEdgeOffset() < 10 )){
                this.getPlayer().setLiveOffSynch(false);
            }
        },
		calculateRelativeLiveEdge: function ( val ) {
			if ( this.duration < 50 ) {
				return val > 700;
			}
			if ( this.duration < 100 ) {
				return val > 800;
			}
			if ( this.duration < 200 ) {
				return val > 850;
			}
			if ( this.duration < 500 ) {
				return val > 900;
			}
			if ( this.duration < 900 ) {
				return val > 950;
			}
			if ( this.duration < 1200 ) {
				return val > 970;
			}
			if ( this.duration < 1400 ) {
				return val > 980;
			}
			if ( this.duration < 1650 ) {
				return val > 990;
			}
		},
		setupThumbPreview: function () {
			var _this = this;
			this.thumbnailsLoaded = false;

			this.getComponent().on({
				'mousemove touchmove touchstart': function (e) {
					if (e.toElement && e.toElement.className.indexOf("sliderPreview") > -1) {
						_this.hideThumbnailPreview();
						return;
					}
					var $this = $(this);
					var width = $this.width();
					var offset = $this.offset();
					var options = $this.slider('option');
					var value = Math.round(((e.clientX - offset.left) / width) *
						(options.max - options.min)) + options.min;

					_this.showThumbnailPreview({
						offset: offset,
						x: e.clientX - offset.left,
						val: value,
						width: width
					});
				},
				'mouseleave touchend': function () {
					_this.hideThumbnailPreview();
				}
			}).append(
					$("<div/>")
						.hide()
						.addClass("sliderPreview")
						.append($("<div/>").addClass("arrow"))
						.append($("<span/>").addClass("sliderPreviewTime"))
				);
		},
		onEnable: function () {
			if (this.waitForFirstPlay) return;
			this.isDisabled = false;
			this.getComponent().removeClass('disabled');
			this.getComponent().slider("option", "disabled", false);
		},
		onDisable: function () {
			if (this.isDisabled) return; // do not disable twice
			this.isDisabled = true;
			this.getComponent().slider("option", "disabled", true);
			this.getComponent().addClass('disabled');
		},
		getSliceCount: function (duration) {
			//return kWidget.getSliceCount(this.duration);
			return this.getConfig("thumbSlices") || 100;
		},
		loadThumbnails: function (callback) {
			var _this = this;
			if ( this.embedPlayer.isLive() || this.getConfig("showOnlyTime")) {
				this.loadedThumb = true;
			}
			if (!this.loadedThumb) {
				this.loadedThumb = true;
				
				
				// preload the image slices:
				var img = new Image();
				img.onload = function () {
					callback();
				};
				img.src = this.getThumbSlicesUrl();
			} else {
				callback();
			}

		},
		getThumbSlicesUrl: function(){
			// check for config override: 
			if( this.getConfig('thumbSlicesUrl')  ){
				return this.getConfig('thumbSlicesUrl');
			}
			var thumbReq = {
				'partner_id': this.embedPlayer.kpartnerid,
				'uiconf_id': this.embedPlayer.kuiconfid,
				'entry_id': this.embedPlayer.kentryid,
				'width': this.getConfig("thumbWidth"),
				'vid_slices': this.getSliceCount(this.duration)
			}
			if ( this.getPlayer().getFlashvars( 'loadThumbnailWithKs' )  ){
				thumbReq[ 'ks' ] = this.getPlayer().getFlashvars('ks');
			}
			// else get thumb slices from helper:
			return kWidget.getKalturaThumbUrl( thumbReq );
		},
		showThumbnailPreview: function (data) {
			var showOnlyTime = this.getConfig("showOnlyTime");
			if (!this.isSliderPreviewEnabled() || !this.thumbnailsLoaded) {
				return;
			}
			if (!(data.val >= 0 && this.duration >= 0)) {
				return;
			}
			// make sure the slider is in the dom:
			var $slider = $(".scrubber");
			if (!$slider.length) {
				this.log('.scrubber class not in DOM');
				return;
			}
			//cache jqeury objects
			var $sliderPreview = this.getComponent().find(".sliderPreview");
			var $sliderPreviewTime = this.getComponent().find(".sliderPreview .sliderPreviewTime");

			var sliderTop = 0;
			var sliderLeft = 0;
			var previewWidth = $sliderPreview.width();
			var previewHeight = $sliderPreview.height();
			var top = $(".scrubber").position().top - previewHeight - 10;
			if ( this.embedPlayer.isMobileSkin() ){
				top -= 25;
			}

			if (!showOnlyTime) {
				sliderLeft = data.x - previewWidth / 2;
				if (( data.x + data.offset.left ) < previewWidth / 2) {
					sliderLeft = 0;
				}
				if (data.x > data.offset.left + data.width - previewWidth / 2) {
					sliderLeft = data.offset.left + data.width - previewWidth;
				}
			} else {
				sliderLeft = data.x - $sliderPreviewTime.width() / 2;
				previewWidth = $sliderPreviewTime.width();
				if (( data.x + data.offset.left ) < $sliderPreviewTime.width() / 2) {
					sliderLeft = 0;
				}
				if (data.x > data.offset.left + data.width - $sliderPreviewTime.width() / 2) {
					sliderLeft = data.offset.left + data.width - $sliderPreviewTime.width() - 5;
				}
				$(".arrow").hide();
			}

            var perc = data.val / 1000;
			perc = perc > 1 ? 1 : perc;
			var currentTime = Math.floor(this.duration * perc);
			var thumbWidth = showOnlyTime ? $sliderPreviewTime.width() : this.getConfig("thumbWidth");
			$sliderPreview.css({top: top, left: sliderLeft });
			if (!showOnlyTime) {
				$sliderPreview.css({'background-image': 'url(\'' + this.getThumbSlicesUrl() + '\')',
					'background-position': kWidget.getThumbSpriteOffset(thumbWidth, currentTime, this.duration, this.getSliceCount(this.duration)),
					'background-size': ( thumbWidth * this.getSliceCount(this.duration) ) + 'px 100%'
				});
			} else {
				$sliderPreview.css("border", "0px");
			}
			$(".scrubber .arrow").css("left", thumbWidth / 2 - 4);

            var timeText;
            if( this.embedPlayer.isDVR() ){
                if( this.getPlayer().isLiveOffSynch() && parseInt(perc*100) > this.liveEdge ){
                    timeText = 'LIVE';
                }else {
                    timeText = "-" + kWidget.seconds2npt(this.duration - currentTime);
                }
            }else{
                timeText = kWidget.seconds2npt(currentTime);
            }
            $sliderPreviewTime.text(timeText);
			$sliderPreviewTime.css({bottom: 2, left: thumbWidth / 2 - $sliderPreviewTime.width() / 2 + 3});
			$sliderPreview.css("width", thumbWidth);

			if (kWidget.isIE8()) {
				$sliderPreview.css("height", 43);
			}
			if ($sliderPreview.width() > 0){
				$sliderPreview.css("visibility","visible");
			}else{
				$sliderPreview.css("visibility","hidden");
			}
			$sliderPreview.show();
		},
		hideThumbnailPreview: function () {
			this.getComponent().find(".sliderPreview").hide();
		},
		getSliderConfig: function () {
			var _this = this;
			var embedPlayer = this.getPlayer();
			var alreadyChanged = false;
			return {
				range: "min",
				value: 0,
				min: 0,
				max: 1000,
				// we want less than monitor rate for smoth animation
				animate: mw.getConfig('EmbedPlayer.MonitorRate') - ( mw.getConfig('EmbedPlayer.MonitorRate') / 30 ),
				start: function (event, ui) {
					embedPlayer.userSlide = true;
					// Release the mouse when player is not focused
					$(_this.getPlayer()).one('hidePlayerControls onFocusOutOfIframe', function () {
						$(document).trigger('mouseup');
					});
				},
				slide: function (event, ui) {
					_this.updateAttr(ui);
				},
				change: function (event, ui) {
					alreadyChanged = true;
					var seekTime = (ui.value / 1000) * embedPlayer.getDuration();
					// always update the title
					_this.updateAttr(ui);
					// Only run the onChange event if done by a user slide
					// (otherwise it runs times it should not)
					if (embedPlayer.userSlide) {
						embedPlayer.userSlide = false;
						embedPlayer.seeking = true;
						embedPlayer.triggerHelper("userInitiatedSeek", seekTime);
						embedPlayer.seek(seekTime);
					}
				}
			};
		},
		updateAttr: function (ui) {
			var perc = ui.value / 1000;
			var $slider = this.$el;
			var title = mw.seconds2npt(perc * this.embedPlayer.getDuration());
			var totalDuration = mw.seconds2npt(this.embedPlayer.getDuration());
			var duration = isNaN(this.embedPlayer.getDuration()) ? 0 : this.embedPlayer.getDuration();
			var attributes = {
				'data-title': title,
				'aria-label': gM( 'mwe-embedplayer-seek' ),
				'aria-valuetext': title + " of " + totalDuration,
				'aria-valuenow': parseInt(perc * 100) + '%',
				'aria-valuemax' : duration,
				'aria-valuemin' : 0
			};
			$slider.attr(attributes);
		},
        getPlayHeadComponent: function () {
            return this.getComponent().find('.playHead');
        },
		getComponent: function () {
			var _this = this;
			if (!this.$el) {
				this.$el = $('<div />')
					.attr({
						'role': 'slider'
					})
					.addClass(this.getCssClass() + " scrubber")
					.slider(this.getSliderConfig());
				// Up the z-index of the default status indicator:
				this.$el.find('.ui-slider-handle')
					.addClass('playHead PIE btn')
					.wrap('<div class="handle-wrapper" />');
				// Update attributes: 
				this.updateAttr({ 'value': 0 });

				this.$el.find('.ui-slider-range-min').addClass('watched');
				// Add buffer:
				this.$el.append(
					$('<div />').addClass("buffered")
				);
				// if parent is controlsContainer set to zero width and update at update layout time.
				if (this.getConfig('parent') == 'controlsContainer') {
					this.$el.css({
						'width': this.getConfig('minWidth')
					});
				}
				this.$el.on("mouseup", function(){
					_this.hideThumbnailPreview();
				});
			}
			return this.$el;
		}
	}));

})(window.mw, window.jQuery, kWidget);
