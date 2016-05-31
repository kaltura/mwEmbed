(function (mw, $) {
	"use strict";

	mw.PluginManager.add('currentTimeLabel', mw.KBaseComponent.extend({

		defaultConfig: {
			"parent": "controlsContainer",
			"order": 21,
			"displayImportance": "high",
			"countDownMode": false
		},

		updateEnabled: true,
		labelWidth: null,

		setup: function () {
			var _this = this;
			if ( this.embedPlayer.isMobileSkin() ){
				this.setConfig("order", 26);
				this.setConfig('parent','videoHolder');
				this.setConfig("countDownMode", true);
				this.bind('firstPlay', function(){
					// move current time label from video holder back to controlBar container.
					var currentTimeLabel = $('.currentTimeLabel').detach();
					$('.controlsContainer .scrubber').after(currentTimeLabel);
					setTimeout(function(){
						_this.embedPlayer.triggerHelper("updateComponentsVisibilityDone");  // redraw components to calculate their size and location. Set in a timeout so the component width will get updated by CSS rules before calculation
					},0);

				});
			}
			this.bindTimeUpdate();
			this.bind('externalTimeUpdate', function (e, newTime) {
				if (newTime != undefined) {
					_this.updateUI(newTime);
				}
			});
			// zero the current time when changing media
			this.bind('onChangeMediaDone', function () {
				_this.updateUI(0);
			});
			//will stop listening to native timeupdate events
			this.bind('detachTimeUpdate', function () {
				_this.unbind('timeupdate');
			});
			//will re-listen to native timeupdate events
			this.bind('reattachTimeUpdate', function () {
				_this.bindTimeUpdate();
			});
			// Bind to Ad events
			this.bind('AdSupport_AdUpdatePlayhead', function (e, currentTime) {
				if (_this.getPlayer().isInSequence()) {
					_this.updateUI(currentTime);
				}
			});
			this.bind('AdSupport_EndAdPlayback', function () {
				_this.updateUI(_this.getCurrentTime());
			});
			this.bind('seeked', function () {
				_this.updateUI(_this.getCurrentTime());
			});
			this.bind("freezeTimeIndicators", function (e, state) {
				if (state === true) {
					_this.updateEnabled = false;
				} else {
					_this.updateEnabled = true;
				}
			});
		},
		bindTimeUpdate: function () {
			var _this = this;
			this.bind('timeupdate', function () {
				if (!_this.getPlayer().isInSequence()) {
					_this.updateUI(_this.getCurrentTime());
				}
			});
		},
		updateUI: function (time) {
			if (this.updateEnabled) {
				time = Math.floor(time);
				if (this.getConfig("countDownMode")){
					time = this.embedPlayer.getDuration() - time;
				}
				this.getComponent().text(mw.seconds2npt(time));
				// check if the time change caused the label width to change (got to 10 minutes or 1 hour) and recalculate components position if needed
				var currentWidth = this.$el.width();
				if ( currentWidth !== this.labelWidth ){
					this.embedPlayer.layoutBuilder.updateComponentsVisibility();
					this.labelWidth = currentWidth;
				}
			}
		},
		getCurrentTime: function () {
			var ct = this.getPlayer().getPlayerElementTime() - this.getPlayer().startOffset;
			if (ct < 0) {
				ct = 0;
			}
			return parseFloat(ct);
		},
		getComponent: function () {
			if (!this.$el) {
				this.$el = $('<div />')
					.addClass("timers" + this.getCssClass())
					.text('0:00');
			}
			if (this.getConfig("countDownMode")){
				this.$el.text(mw.seconds2npt(this.embedPlayer.getDuration()));
			}
			this.labelWidth = this.$el.width();
			return this.$el;
		},
		show: function () {
			this.getComponent().css('display', 'inline').removeData('forceHide');
		}
	}));

})(window.mw, window.jQuery);