(function (mw, $) {
	"use strict";

	mw.PluginManager.add('logo', mw.KBaseComponent.extend({

		defaultConfig: {
			parent: "controlsContainer",
			order: 41,
			displayImportance: 'low',
			align: "right",
			cssClass: "kaltura-logo",
			href: null,
			title: null,
			img: null
		},
		getComponent: function () {
			var _this = this;
			if (!this.$el) {
				var $img = [];
				if (this.getConfig('img')) {
					$img = $('<img />')
						.attr({
							alt: this.getConfig('title'),
							src: this.getConfig('img')
						});
				}
				this.$el = $('<div />')
					.addClass(this.getCssClass())
					.addClass('btn')
					.append(
						$('<a />')
							.addClass('btnFixed')
							.click(function (e) {
								if (_this.getConfig('href') || this.href) {
									if (mw.isNativeApp()) {
										_this.openInNativeApp();
									}
									else{
										window.open(_this.getConfig("href") ? _this.getConfig("href") : this.href, "_blank")
									}
								}
								e.preventDefault
								return false;
							})
							.attr({
								'title': this.getConfig('title')
							}).append($img)
					);
			}
			// remove Kaltura logo image if we have a custom logo icon
			if (this.getConfig('img') != null) {
				this.$el.removeClass('kaltura-logo');
			}
			return this.$el;
		},
		openInNativeApp: function () {
			var params = {
				actionType: 'openURL',
				url: this.getConfig('href')
			}
			this.getPlayer().doNativeAction(JSON.stringify(params));
		}

	}));

})(window.mw, window.jQuery);