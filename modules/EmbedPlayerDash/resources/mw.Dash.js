(function ( mw, $ ) {
	"use strict";

	mw.Dash = function(embedPlayer, callback ) {
		return this.init( embedPlayer, callback );
	};

	mw.Dash.prototype = {
		pluginName : 'dash',

		init: function( embedPlayer, callback ){
			if( ! this.isEnvironmentSuported() ){
				callback();
				return ;
			}
			// setup mappings
			var _this = this;
			this.embedPlayer = embedPlayer;
			
			// We load dashjs on demand to avoid increasing payload for players that can't play dash. 
			$.getScript( mw.getMwEmbedPath() + 'modules/EmbedPlayerDash/dash.js/dash.min.js', function(){
				// setup player bindings
				_this.bindPlayer()
				// continue player build out.
				callback();
			})
		},
		isEnvironmentSuported: function(){
			var ua = navigator.userAgent;
			var _this = this;
			deferred = $.Deferred();
			if( !this.isUaSupported() ){
				return false;
			}
			this.bind('playerReady', function(){
				// check if we have sources that can play with dash library:
				deferred.resolve( _this.getDashUrl() );
			});
			mw.log( "Dash:: MediaSource API not present and required for MPEG-Dash playback" )
			return ;
		},
		isEnvironmentSupported: function(){
			if( /chrome/i.test(ua)) {
				var uaArray = ua.split(' ');
				// check chrome browser version >= 26 ( supports mediaSource api )
				if( parseInt( uaArray[uaArray.length - 2].substr(7).split('.')[0] ) >= 26 ){
					return true;
				}
			}
			// Detect IE11:
			if( !!navigator.userAgent.match(/Trident\/7.0/) && navigator.userAgent.indexOf("rv:11.0") != -1 ){
				return true;
			}
			return false;
		},
		getDashJsPath: function(){
			return mw.getEmbedPlayerPath() + 'modules/Dash/dash.js/dash.min.js';
		},
		bindPlayer: function(){
			var _this = this;
			// Build the dash player at player ready time ~for now~
			// TODO tie into early source selection add support for the player type
			// and probably extend mw.EmbedPlayerNative to override embed calls.  
			this.embedPlayer.bindHelper( 'playerReady', function(){
				_this.initDashPlayer();
				// update interface ( disable flavor selector for now )
				_this.embedPlayer.getInterface().find('.ui-widget.source-switch').text('Dash');
				_this.embedPlayer.getInterface().find('.ui-widget.source-switch').unbind('click');
			});
			// TODO check sources for dash type
			return ;
		},
		getDashUrl: function(){
			// check for dash content type in media inject override: 
			
			// else check if we can build a dash url:
		},
		initDashPlayer: function(){
			var dashUrl = null;
			var vid =  this.embedPlayer.getPlayerElement();
			// Check for force source 
			if( this.getConfig( 'forceSourceUrl' ) ) {
				dashUrl = this.getConfig( 'forceSourceUrl' );
			}
			var context = new Dash.di.DashContext();
			var player = new MediaPlayer(context);

			player.startup();

			var debug = player.debug;
			debug.init( console );

			player.autoPlay = true;
			player.attachView( vid );
			
			player.setIsLive( false );
			player.attachSource( dashUrl );
			mw.log("mw.Dash attach source: " + dashUrl );
			
			this.embedPlayer.mediaElement.sources = [];
			this.embedPlayer.mediaElement.selectedSource.src = vid.src;
			this.embedPlayer.play();
		},
		// Should be part of base class. 
		getConfig: function( propId ) {
			// return the attribute value
			return this.embedPlayer.getKalturaConfig( this.pluginName, propId);
		}
	}

})
(window.mw, window.jQuery);
