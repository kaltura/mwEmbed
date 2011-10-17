/**
* NielsenPlugin implemented per document outlined here: 
* https://portal.kaltura.com/product/Shared%20Documents/Solution%20Architects/_Generic%20PRDs/Nielsen/KDP%20Nielsen%20Plugin%20PRD.docx
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
			_this.addPlayerBindings( gg );
			callback();
		});
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
					  clientid: "us-200124"
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
	},
	/**
	 * Adds player bindings:
	 */
	addPlayerBindings: function(){
		var _this = this;
		var embedPlayer = this.embedPlayer;
		
		// setup a shortcut to bind call ( including bindPostFix )
		var b = function( bindName, callback ){
			$( embedPlayer ).bind( bindName + _this.bindPostFix, callback);
		}
		
		// Bind the "onMeta" to player ready: 
		b('playerReady', function(){
			_this.onMediaMeta();
		})
		// on play:
		b('onplay', function(){
			_this.dispatchEvent( 5, embedPlayer.currentTime );
		});
		// on pause:
		b( 'onpause', function(){
			_this.dispatchEvent( 6, embedPlayer.currentTime);
		});
		// on complete: 
		b( 'ended', function(){
			_this.dispatchEvent( 7, embedPlayer.currentTime);
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
		b( 'volumeChanged', function(){
			_this.dispatchEvent( 11, String(embedPlayer.volume) );
		});
		
		// Kaltura HTML5 does not really have an idle state:
		//sender.onIdle(function(args) {ggCom1.onCurrentStateChanged(args)});
		
		// Monitor:
		var lastTime = 0;
		b( 'monitorEvent' + _this.bindPostFix, function(){
			var posDelta  = Math.abs( embedPlayer.currentTime - lastTime );
			// Check for position changed more than "3" 
			// NOTE: changed Nielsen example of 2 seconds to 3 since progress query interval is 
			// also set to 2 it would appear as if there were seeks all the time. 
			if( posDelta > 3 ){
				_this.dispatchEvent( 8, String(lastTime), String(embedPlayer.currentTime) );
			}
			// Dispatch player progress every 2 seconds:
			if( posDelta > _this.queryInterval ){
				lastTime = embedPlayer.currentTime;
				_this.dispatchEvent( 49, embedPlayer.currentTime );
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
	/**
	 * Triggered on playerReady where all metaData is loaded:
	 */
	onMediaMeta : function() {
		var _this = this;
		// TODO support "ads type" events.
		// TODO find out the string type name for "ads" or "preroll", "postroll" etc. 
		var type = "content";
		
		// What is the diff between 15 and 3? What does "video played" mean at meta data ready time? 
		// AutoPlay? embedPlayer.isPlaying() ? 
		if( this.embedPlayer.autoPlay ) {
			this.dispatchEvent( 15, this.getCurrentVideoSrc() , type, _this.getMetaXmlString() );
		} else {
			this.dispatchEvent( 3, this.getCurrentVideoSrc(), type, _this.getMetaXmlString());
		}
	},
	// Gets the "raw" current source ( works with ad assets )  
	getCurrentVideoSrc: function(){
		var vid = this.embedPlayer.getPlayerElement(); 
		if( vid && vid.src ){
			return vid.src;
		}
		// else just return the normal content source: 
		this.embedPlayer.getSrc();
	},
	// Gets the "raw" video duration ( works with ad assets ) 
	getCurrentVideoDuration: function(){
		var vid = this.embedPlayer.getPlayerElement(); 
		if( vid && vid.duration ){
			return vid.duration;
		}
		// else try normal embedPlayer duration: 
		this.embedPlayer.getDuration();
	},
	/**
	 * Get the Nielsen xml string: 
	 */
	getMetaXmlString: function(){
		var meta = ''+
			"<title>"+
				this.getConfig('tag_title') +
			"</title>" +
			"<uurl>"+
				this.getCurrentVideoSrc() +
			"</uurl>" +
			"<length>"+
				this.getCurrentVideoDuration() + 
			"</length>";
		// TODO Get all the  "tag" props  
		
		return meta;
	},
	/**
	 * Get a configuration value with full expression evaluation: 
	 */
	getConfig: function( propAttr ){
		return this.embedPlayer.getKalturaConfig('NielsenPlugin', propAttr );
	}
}
