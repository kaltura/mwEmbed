/* simple plugin that sends up hammer events via iframe bridge */
( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'hammerEvents', mw.KBasePlugin.extend({
		defaultConfig: {
			"on": "",
			"options": ""
		},
		setup: function(){
			var _this = this;
			new Hammer(this.getPlayer(), this.getConfig("options") ).on( this.getConfig("on"),  function( hammerEvent ){
				_this.getPlayer().sendNotification('hammerEvent', hammerEvent);
			});
		}
		
	}));

} )( window.mw, window.jQuery );		