/**
* Adds restrictUserAgent plugin support
* <Plugin id="restrictUserAgent" />
*/
( function( mw, $ ) {"use strict";

	var restrictUserAgent = function( embedPlayer ){
		this.init( embedPlayer );
	};
	
	restrictUserAgent.prototype = {
		
		pluginName: 'restrictUserAgent',
		
		init: function( embedPlayer) {
			this.embedPlayer = embedPlayer;
			this.bindPlayer();
		},
		
		bindPlayer: function() {
			var embedPlayer = this.embedPlayer;
			embedPlayer.bindHelper( 'KalturaSupport_EntryDataReady', function() {
				var acStatus = kWidgetSupport.getAccessControlStatus( embedPlayer.kalturaAccessControl, embedPlayer );
				if( acStatus !== true ){
					embedPlayer.setError( acStatus );
					return ;
				}
				
				if( this.isRestricted() ) {
					embedPlayer.setError( this.getMsg() );
				}
			});
		},
		
		isRestricted: function() {
			var restrictedStrings = this.getConfig( 'restrictedUserAgents' );
			var isRestricted = false;
			if( restrictedStrings ) {
				var ua = navigator.userAgent;
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
		
		getMsg: function() {
			if( this.getConfig( 'restrictedUserAgentTitle' ) && this.getConfig( 'restrictedUserAgentMessage' ) ) {
				return this.getConfig( 'restrictedUserAgentTitle' ) + "\n" + this.getConfig( 'restrictedUserAgentMessage' );
			} else {
				return this.embedPlayer.getKalturaMsg( 'USER_AGENT_RESTRICTED' );
			}
		},
		
		getConfig: function( attr ) {
			return this.embedPlayer.getKalturaConfig(this.pluginName, attr);
		}
	};
	
	mw.addKalturaPlugin( 'restrictUserAgent', function( embedPlayer, callback ){
		new restrictUserAgent( embedPlayer );
		// Continue player build-out
		callback();
	});	

})( window.mw, window.jQuery );