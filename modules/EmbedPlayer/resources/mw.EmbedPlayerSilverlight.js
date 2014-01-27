/*
 * The "kaltura player" embedPlayer interface for fallback h.264 and flv video format support
 */
( function( mw, $ ) { "use strict";

	mw.EmbedPlayerSilverlight = {
		// Instance name:
		instanceOf : 'Silverlight',

		bindPostfix: '.sPlayer',
		containerId: null,
		// List of supported features:
		supports : {
			'playHead' : true,
			'pause' : true,
			'stop' : true,
			'sourceSwitch': true,
			'timeDisplay' : true,
			'volumeControl' : true,
			'overlays' : true,
			'fullscreen' : true
		},
		// Create our player element
		setup: function( readyCallback ) {
			mw.log('EmbedPlayerSilverlight:: Setup');

			// Check if we created the kPlayer container
			var $container = this.getPlayerContainer();
			// If container exists, show the player and exit
			if( $container.length ){
				this.enablePlayerObject( true );
				$container.css('visibility', 'visible');
				readyCallback();
				return;
			}

			// Create the container
			this.getVideoDisplay().prepend(
				$('<div />')
					.attr('id', this.containerId)
					.addClass('maximize')
			);

			var _this = this;
			//this.updateSources();
			 //multicastPlayer=true,streamAddress=239.1.1.1:10000,autoplay=true,playerId=kplayer,jsCallBackReadyFunc=ready
			//smoothStreamPlayer=true,debug=true,autoplay=true,licenseURL=http://playready.directtaps.net/pr/svc/rightsmanager.asmx?PlayRight=1&UseSimpleNonPersistentLicense=1,playerId=kplayer,entryURL=http://playready.directtaps.net/smoothstreaming/SSWSS720H264PR/SuperSpeedway_720.ism/Manifest,jsCallBackReadyFunc=ready
			var flashvars = {
				smoothStreamPlayer:true,
				autoplay:true,
				licenseURL:"http://playready.directtaps.net/pr/svc/rightsmanager.asmx?PlayRight=1&UseSimpleNonPersistentLicense=1",
				entryURL:"http://playready.directtaps.net/smoothstreaming/SSWSS720H264PR/SuperSpeedway_720.ism/Manifest"

			};


			flashvars.flavorId = this.getFlashvars( 'flavorId' );
			if ( ! flashvars.flavorId && this.mediaElement.selectedSource ) {
				flashvars.flavorId = this.mediaElement.selectedSource.getAssetId();
				//this workaround saves the last real flavorId (usefull for example in widevine_mbr replay )
				this.setFlashvars( 'flavorId', flashvars.flavorId );
			}

			if ( this.streamerType != 'http' && this.selectedFlavorIndex != 0 ) {
				flashvars.selectedFlavorIndex = this.selectedFlavorIndex;
			}

			//will contain flash plugins we need to load
			var kdpVars = this.getKalturaConfig( 'kdpVars', null );
			$.extend ( flashvars, kdpVars );
			var playerElement = new mw.PlayerElementSilverlight( this.containerId, 'splayer_' + this.pid, flashvars, this, function() {
				var bindEventMap = {
					'playerPaused' : 'onPause',
					'playerPlayed' : 'onPlay',
					'durationChange' : 'onDurationChange',
					'playerPlayEnd' : 'onClipDone',
					'playerUpdatePlayhead' : 'onUpdatePlayhead',
					'bytesTotalChange' : 'onBytesTotalChange',
					'bytesDownloadedChange' : 'onBytesDownloadedChange',
					'playerSeekEnd': 'onPlayerSeekEnd',
					'alert': 'onAlert',
					'switchingChangeStarted': 'onSwitchingChangeStarted',
					'switchingChangeComplete' : 'onSwitchingChangeComplete',
					'flavorsListChanged' : 'onFlavorsListChanged',
					'enableGui' : 'onEnableGui'  ,
					'liveStreamOffline': 'onLiveEntryOffline',
					'liveStreamReady': 'onLiveStreamReady'
				};
				_this.playerObject = playerElement.playerProxy;
				$.each( bindEventMap, function( bindName, localMethod ) {
					_this.playerObject.addJsListener(  bindName, localMethod );
				});
				readyCallback();

			});
		},

		/**
		 * Get the embed flash object player Element
		 */
		getPlayerElement: function(){
			return this.playerObject;
		},

		getPlayerContainer: function(){
			if( !this.containerId ){
				this.containerId = 'splayer_' + this.id;
			}
			return $( '#' +  this.containerId );
		}

	}

} )( mediaWiki, jQuery );