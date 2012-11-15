( function( mw, $ ) { "use strict";

/* refrence players look like this: 
 * 
 * <video id="player" width="400" height="300" preload="none"
					 src="http://demo.tremormedia.com/~agrant/html5test.mp4"> 
		</video> 
		
		<div class="compBanner" id="content_300"></div>
		
		<script type="text/javascript">
			ACUDEO.Player({player: "player",
					banner: "content_300",
					policy: "4fd898ffb18e7",
					contentData: {
					id: "id",
					url: "http://url",
					title: "title",
					descriptionUrl: "http://descriptionurl",
					description: "description"}
					});
		</script>
 */
// Set the Tremor config:
mw.setDefaultConfig({
	// The url for the ad Manager
	// for debugging we use the following AdManager url: 'http://localhost/html5.kaltura/mwEmbed/modules/Tremor/AdManager.js'
	'Tremor.acudeoUrl': 'http://objects.tremormedia.com/embed/sjs/acudeo.js'
});

mw.Tremor = function( embedPlayer, callback ){
	return this.init( embedPlayer, callback );
};

mw.Tremor.prototype = {
	bindPostfix: '.tremor',
	
	// The current ad slot type:
	currentAdSlotType: null,
	
	init: function(  embedPlayer, callback){
		var _this = this;
		// Inherit BaseAdPlugin
		mw.inherit( this, new mw.BaseAdPlugin( embedPlayer, callback ) );

		// unbind any existing bindings:
		_this.embedPlayer.unbindHelper( _this.bindPostfix );
		// Load the Tremor ad manager then setup the ads
		if( !window['ACUDEO'] ){
			$.getScript( _this.getAdManagerUrl(), function(){
				_this.setupAds();
				callback();
			});
		} else{
			_this.setupAds();
			callback();
		}
	},
	getAdManagerUrl: function(){
		return mw.getConfig( 'Tremor.acudeoUrl' );
	},
	setupAds: function(){
		var _this = this;
		var embedPlayer = this.embedPlayer;
		
		// add a hidden banner: 
		if( this.getConfig( 'banner' ) ){
			$('<div />')
				.attr('id', this.getConfig( 'banner' ) )
				.css({
					'position':'absolute',
					'top': '0px',
					'left': '-4048px',
					'width': '300px', 
					'height': '250px'
				})
				.appendTo( 'body' )
		}
		// setup the ACUDEO player:
		ACUDEO.Player({
			player: embedPlayer.pid,
			banner: this.getConfig( 'banner' ),
			policy: this.getConfig( 'progId' ),
			contentData: {
				id: embedPlayer.evaluate("{mediaProxy.entry.id}"),
				url: "http://url",
				title: embedPlayer.evaluate("{mediaProxy.entry.name}"),
				descriptionUrl: "http://descriptionurl",
				description: "description"
			}
		});
		embedPlayer.bindHelper('onpause', function(){
			$( embedPlayer.getPlayerElement() ).removeAttr( "controls" );
		});
		
		// bind player preSequence to trigger ACUDEO click
		embedPlayer.bindHelper( 'AdSupport_preroll' + _this.bindPostfix, function( event, sequenceProxy ){
			// Add Tremor to the sequence proxy:
			var doneWithPreroll = false;
			sequenceProxy[ _this.getSequenceIndex( 'preroll' ) ] = function( callback ){
				_this.currentAdCallback = callback;
				// no apparent api to trigger playback, and click event is async, so we need to .load
				$( _this.getAcudeoVid() )[0].load();
				// then call .click: 
				$('#click-to-play').click();
				// no API for what ad we are playing? assume preroll
				_this.currentAdSlotType = 'preroll';
				_this.startAd()

				// setup ad complete event:
				$( _this.getAcudeoVid() ).bind( 'ended' + _this.bindPostfix, function(){
					_this.stopAd()
					if( _this.currentAdSlotType == 'preroll' ){
						_this.currentAdSlotType = 'midroll';
					}
				});
				// No api for midrolls just listen for another play after preroll is done
				$( _this.getAcudeoVid() ).bind( 'play' + _this.bindPostfix, function(){
					if( _this.currentAdSlotType == 'midroll' ){
						_this.startAd();
					}
				});
			};
		})
	},
	startAd: function(){
		var _this = this;
		// Started add playback
		_this.embedPlayer.adTimeline.updateUiForAdPlayback( _this.currentAdSlotType );
		// start monitoring the ad:
		_this.monitorAd();
		// show the loading spinner until we start ad playback
		_this.embedPlayer.addPlayerSpinner();
		// remove width and height styles ( so it can inheret our videoHolder rules ) 
		_this.getAcudeoVid().style.cssText = '';
		
		// listen for playing
		$( _this.getAcudeoVid() ).bind( 'playing' + _this.bindPostfix, function(){
			// hide spinner:
			_this.embedPlayer.hideSpinnerAndPlayBtn();
		});
		var adPlay = false;
		$( _this.getAcudeoVid() ).bind( 'play' + _this.bindPostfix, function(){
			adPlay = true;
			// started ad playback check for banner and send content across the iframe
			if( $('#' + _this.getConfig( 'banner' ) ).html() != '' ){
				parent.document.getElementById( _this.getConfig( 'banner' ) ).innerHTML = 
					 $('#' + _this.getConfig( 'banner' ) ).html();
			}
		});
		var timeout = this.getConfig( 'timeout' ) || 10;
		setTimeout(function(){
			if( !adPlay ){
				// ad skip
				_this.stopAd( true );
			}
		}, timeout * 1000 )
	},
	stopAd: function( adSkip ){
		var _this = this;
		// remove true player: 
		// stop ad monitoring:
		_this.stopAdMonitor();
		// restore player:
		/*_this.embedPlayer.adTimeline.restorePlayer( _this.currentAdSlotType, !adSkip );
		// ACUDEO adds controls to player :(
		$( _this.embedPlayer.getPlayerElement() ).removeAttr( 'controls' );
		// Restore the player via adSequence callback:
		if( $.isFunction( _this.currentAdCallback ) ){
			_this.currentAdCallback();
			_this.currentAdCallback = null;
		}*/
	},
	getAcudeoVid: function(){
		return $( this.embedPlayer ).parent().find( 'video' ).not( '#' + this.embedPlayer.pid )[0];
	},
	monitorAd: function(){
		var _this = this;
		var embedPlayer = _this.embedPlayer
		// get the content video: 
		var vid = embedPlayer.getPlayerElement();
		// find the ad ( ACUDEO preAppends ) 
		var vidACUDEO = _this.getAcudeoVid()
		
		// apparently ACUDEO issues a .play on the target?  and blocks events?
		if( !vid.paused ){
			// ACUDEO adds controls to player :(
			$( _this.embedPlayer.getPlayerElement() ).removeAttr( 'controls' );
			vid.pause();
		}
		// add some bindings to vidACUDEO
		if( vidACUDEO.currentTime && vidACUDEO.duration ){
			embedPlayer.adTimeline.updateSequenceProxy( 'timeRemaining',  vidACUDEO.currentTime -vidACUDEO.duration  );
			embedPlayer.adTimeline.updateSequenceProxy( 'duration', vidACUDEO.duration );
			
			embedPlayer.triggerHelper( 'AdSupport_AdUpdatePlayhead', vidACUDEO.currentTime );

			// TODO player interface updates should be configurable see Mantis 14076 and 14019
			embedPlayer.controlBuilder.setStatus(
				mw.seconds2npt( vidACUDEO.currentTime ) + '/' + mw.seconds2npt( vidACUDEO.duration )
			);
			// update ad playhead
			_this.embedPlayer.updatePlayHead( vidACUDEO.currentTime / vidACUDEO.duration );
		}
		_this.embedPlayer.sequenceProxy.isInSequence = true;
		
		// Keep monitoring ad progress at MonitorRate as long as ad is playing:
		if( !this.adMonitorInterval ){
			this.adMonitorInterval = setInterval( function(){
				_this.monitorAd();
			}, mw.getConfig( 'EmbedPlayer.MonitorRate' ) );
		}
	},
	stopAdMonitor: function(){
		window.clearInterval( this.adMonitorInterval );
		this.adMonitorInterval = 0;
	},
	getConfig: function( propId ){
		// return the attribute value
		return this.embedPlayer.getKalturaConfig( 'tremor', propId );
	},
}

} )( window.mw, window.jQuery );