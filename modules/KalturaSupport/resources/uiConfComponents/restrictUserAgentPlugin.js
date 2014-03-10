/**
* Adds restrictUserAgent plugin support
*/
( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'restrictUserAgent', mw.KBasePlugin.extend({
		setup: function(){
			var _this = this;
			this.bind('KalturaSupport_EntryDataReady', function(){
				if( _this.isRestricted() ) {
					_this.getPlayer().setError( _this.getMsgObject() );
				}
			});
		},
		isRestricted: function() {
			var restrictedStrings = this.getConfig( 'restrictedUserAgents' );
			var isRestricted = false;
			if( restrictedStrings ) {
				var ua = navigator.userAgent.toLowerCase();
				restrictedStrings = restrictedStrings.toLowerCase();
				restrictedStrings = restrictedStrings.split(",");
				$.each( restrictedStrings, function() {
					var find = this.replace(".*", '');
					find = $.trim( find );
					if( ua.indexOf(find) !== -1 ) {
						isRestricted = true;
					}
				});
			}
			return isRestricted;
		},
		getMsgObject: function() {
			if( this.getConfig( 'restrictedUserAgentTitle' ) && this.getConfig( 'restrictedUserAgentMessage' ) ) {
				return {
					'message' : this.getConfig( 'restrictedUserAgentMessage' ),
					'title': this.getConfig( 'restrictedUserAgentTitle' )
				}
			} else {
				return this.embedPlayer.getKalturaMsgObject( 'USER_AGENT_RESTRICTED' );
			}
		}
	}));

})( window.mw, window.jQuery );