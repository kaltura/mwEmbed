(function (mw, $) {
	"use strict";

	/**
	 * Youbora analytics implementation based on their open REST API
	 * http://support.youbora.com/hc/en-us/article_attachments/201042582/Youbora_Analytics_-_Player_Plugin_Open_REST_API_-_v2.1.0.pdf
	 */

	var YouboraPlugin = mw.KBasePlugin.extend({
		defaultConfig: {
			haltOnError: false
		},

		setup: function () {
            this.bindLogs();
            if ( !this.getConfig( 'accountCode' ) && this.getConfig( 'accountName' ) ) {
                this.setConfig( 'accountCode', this.getConfig( 'accountName' ) );
            }
            this.youbora = new $YB.plugins.KalturaV2( this, this.getConfig() );
		},

		bindLogs: function () {
			$YB.error = this.log.bind(this);
			$YB.notice = this.log.bind(this);
			$YB.noticeRequest = this.log.bind(this);
			$YB.warn = this.log.bind(this);
			$YB.debug = this.log.bind(this);
			$YB.verbose = function () { };
		}
	})

	mw.PluginManager.add('youbora', YouboraPlugin)

})(window.mw, window.jQuery);
