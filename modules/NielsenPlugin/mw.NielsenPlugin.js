/**
* NielsenPlugin implemented per document outlined here: 
* https://portal.kaltura.com/product/Shared%20Documents/Solution%20Architects/_Generic%20PRDs/Nielsen/KDP%20Nielsen%20Plugin%20PRD.docx
* 
* Basic player flow: 
* 
* 	load player meta data ready:

	send "3" to designate the content metadata ( with first segment length ) sequence index "1" 
	15 for preroll with "ad" type
		send "7" to end the ad
		send "4" unload ad
	5 of type "content" content playback 
	"7" stop content 
	"15" load midroll "ad" type
		send "7" to end the ad
		send "4" unload ad
	15 second segment of content as a "load play" 
		"7" stop "content" 
		"4" unload "content"
	15 postroll 
		send "7" to end the ad
		send "4" unload ad
* 
*/

mw.NielsenPlugin = function( embedPlayer, callback ){
	this.init( embedPlayer, callback );
};

mw.NielsenPlugin.prototype = {
		
	// Binding postfix ( enables us to "clear out" the plugins bindings 
	bindPostFix: '.NielsenPlugin',
	
	// The query interval to send progress updates to Nielsen 
	queryInterval: 2,
		
	init: function( embedPlayer, callback ){
		var _this = this;
		this.embedPlayer = embedPlayer;
		
		this.getGg( function( gg ){
			$( embedPlayer ).bind( 'playerReady' + _this.bindPostFix, function(){
				_this.onContentMeta();
				_this.addPlayerBindings();
			});
			callback();
		});
	},
	/**
	 * Triggered on playerReady where all metaData is loaded:
	 */
	onContentMeta : function() {
		var _this = this;
		// Dispatch a "preLoad" event ( will finish with a 5 once we have actual content playing ) 
		this.dispatchEvent( 3, this.getCurrentVideoSrc() , "content", _this.getMetaXmlString(), 1 );
	},
	/**
	 * Adds player bindings for either ads or players
	 */
	addPlayerBindings: function( player ){
		var _this = this;
		var embedPlayer = this.embedPlayer;
		
		// Setup a shortcut to bind call ( including bindPostFix )
		var b = function( bindName, callback ){
			$( embedPlayer ).bind( bindName + _this.bindPostFix, callback);
		}
		
		// on play:
		b('onplay', function(){
			_this.dispatchEvent( 5, _this.getRelativeTime('currentTime') );
		});
		// on pause:
		b( 'onpause', function(){
			_this.dispatchEvent( 6, _this.getRelativeTime('currentTime'));
		});
		// on complete: 
		b( 'ended', function(){
			_this.dispatchEvent( 7, _this.getRelativeTime('currentTime'));
		});
		// Fullscreen: 
		b( 'onOpenFullScreen', function(){
			_this.dispatchEvent( 10, "true");			
		})
		b( 'onCloseFullScreen', function(){
			_this.dispatchEvent( 10, "false");			
		})
		// Mute:
		b( 'onToggleMute', function(){
			_this.dispatchEvent( 9, String(embedPlayer.mute) );
		})
		// Volume change: 
		b( 'volumechange', function(){
			_this.dispatchEvent( 11, String(embedPlayer.volume) );
		});
		
		// Kaltura HTML5 does not really have an idle state:
		//sender.onIdle(function(args) {ggCom1.onCurrentStateChanged(args)});
		
		// Monitor:
		var lastTime = 0;
		b( 'progress' + _this.bindPostFix, function(){
			var posDelta  = Math.abs( embedPlayer.currentTime - lastTime );
			// Check for position changed more than "3" 
			// NOTE: changed Nielsen example of 2 seconds to 3 since progress query interval is 
			// also set to 2 it would appear as if there were seeks all the time. 
			if( posDelta > 3 ){
				_this.dispatchEvent( 8, String( lastTime ), String( _this.getRelativeTime('currentTime') ) );
			}
			// Dispatch player progress every 2 seconds:
			if( posDelta > _this.queryInterval ){
				lastTime = embedPlayer.currentTime;
				_this.dispatchEvent( 49, String( _this.getRelativeTime('currentTime') ) );
			}
		});
	},
	/**
	 * Dispatches a Nielsen event via the gg.ggPM call.  
	 * if debug is enabled we log this event to the console
	 */
	dispatchEvent: function(){
		var args = $.makeArray( arguments ); 
		var eventString = args.join(', '); 
		mw.log("NielsenPlugin:: dispatchEvent: " + eventString);
		this.gg.ggPM.apply( this, args);
	},
	// Gets the "raw" current source ( works with ad assets )  
	getCurrentVideoSrc: function(){
		var vid = this.embedPlayer.getPlayerElement(); 
		if( vid && vid.src ){
			return vid.src;
		}
		// else just return the normal content source: 
		return this.embedPlayer.getSrc();
	},
	/**
	 * Get video duration: includes relative 
	 */
	getRelativeTime: function( type ){
		var embedPlayer = this.embedPlayer;
		if( type != 'duration' && type != 'currentTime' ){
			mw.log("Error:: calling getRelativeTime with invalid type: " + type );
			return 0;
		}
		// Check if we are in an Ad and return the raw player duration or time: 
		if( this.inAd() ){
			var vid = this.embedPlayer.getPlayerElement(); 
			if( vid && vid[type]){
				return vid[type];
			}
		}
		// Check if we have cuepoints
		
		// @@TODO we should probably keep track of cuePoint segments in the sequence proxy
		// because "seeks" are not 100% accurate across all platforms and we don't want to send 
		// the wrong metadata. 
		if( embedPlayer.rawCuePoints ){
			var absolutePlayerTime = embedPlayer.currentTime;
			for( var i =0; i < embedPlayer.rawCuePoints.length; i++ ){
				var cuePoint = embedPlayer.rawCuePoints[i];
				// See which relative segment time duration we should return 
			}
		}
		// If no cuePoints are found return normal embedPlayer currentTime or duration:  
		return embedPlayer[type];
	},
	inAd:function(){
		return this.embedPlayer.evaluate('{sequenceProxy.isInSequence}'); 
	},
	/**
	 * Get the Nielsen xml string: 
	 */
	getMetaXmlString: function(){
		// These won't change 
		var meta = ''+
			"<uurl>"+
				this.getCurrentVideoSrc() +
			"</uurl>" +
			"<length>"+
				this.getRelativeTime( 'duration' ) + 
			"</length>";
		// Get all tags: 
		var allConfig = this.embedPlayer.getKalturaConfig('NielsenPlugin');
		
		return meta;
	},
	getAdMetaXmlString: function(){
		// most of these are overrides. ~ 
	},
	/**
	 * Get a configuration value with full expression evaluation: 
	 */
	getConfig: function( propAttr ){
		return this.embedPlayer.getKalturaConfig('NielsenPlugin', propAttr );
	},
	/**
	 * Get the gg com object: 
	 */
	getGg: function( callback ){
		var _this = this;
		if( !this.gg ){
			$.getScript( this.getGgCmbUrl(), function(){
				// Nielsen specific global param option: 
				var nolggGlobalParams = {
					  clientid: _this.getConfig( "clientId" )
				};	
				_this.gg = new gg();
				var uid = 0; // "provided by Nielsen"
				var oldFlashDetect = false; // no longer used (dummy placeholder for legacy implementations)
				var detectBrowser = true; //optional -- used to disable window object call for non-browser use
				_this.gg.ggInitialize( nolggGlobalParams, uid, oldFlashDetect, detectBrowser); 
				callback( _this.gg );
			})
		} else {
			callback( this.gg );
		}
	},
	// Return the ggcmb370 url ( for now hard coded should be moved to config )
	getGgCmbUrl:function(){
		return 'http://secure-us.imrworldwide.com/novms/js/2/ggcmb370.js';
	}
}
