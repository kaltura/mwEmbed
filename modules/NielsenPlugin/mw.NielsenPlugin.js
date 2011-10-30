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
	
	contentSource: null,
		
	init: function( embedPlayer, callback ){
		var _this = this;
		this.embedPlayer = embedPlayer;
		
		this.getGg( function( gg ){
			$( embedPlayer ).bind( 'playerReady' + _this.bindPostFix, function(){
				_this.addSequenceBinding();
			});
			callback();
		});
		
		// on change media remove any existing bindings ( the next clip will re-invoke the plugin )
		$( embedPlayer ).bind( 'onChangeMedia' + _this.bindPostfix, function(){
			$( embedPlayer ).unbind( _this.bindPostfix );
		});
	},
	/**
	 * called on player ready sets up all the bindings and fires the initial content beacon. 
	 */
	addSequenceBinding: function(){
		var _this = this;
		var embedPlayer = this.embedPlayer;
		// Dispatch a "preLoad" event ( will finish with a 5 once we have actual content playing ) 
		this.dispatchEvent( 3, this.getCurrentVideoSrc() , "content", _this.getMetaXmlString(), 1 );
		
		// Bind ad Playback
		var adOpenUrl = false;
		var dispachedAdStart = false;
		$( embedPlayer ).bind( 'AdSupport_StartAdPlayback' + _this.bindPostFix, function( event, slotType ){
			var vid = _this.embedPlayer.getPlayerElement(); 
			// We are in an ad:
			adOpenUrl = _this.getCurrentVideoSrc();
			// wait for duration change event 
			$( vid ).bind( 'durationchange.nielsenAd', function(e){
				// unbind our duration change event: 
				$( vid ).unbind( '.nielsenAd' );
				// Make sure we are still in an ad ( if not don't send anything and unset adOpenUrl ) 
				if( !_this.inAd() ){
					adOpenUrl = false;
					return ;
				}
				dispachedAdStart = true;
				// Playing an ad fire a 15 with all ad Meatadata
				_this.dispatchEvent( 15, _this.getCurrentVideoSrc() , "ad", _this.getMetaXmlString() );
				// add event bindings: 
				_this.addPlayerBindings( vid, 'ad' );
			});
		});
		$( embedPlayer ).bind( 'AdSupport_EndAdPlayback' + _this.bindPostFix, function( event, slotType ){
			// close the current ad: 
			if( adOpenUrl && dispachedAdStart ){
				// Ad fire a 4 to 'unload' the ad ( always called even if we don't get to "ended" event )
				_this.dispatchEvent( 4, adOpenUrl, 'ad' );
				adOpenUrl = false;
			}
		});
		var firstNonAdPlay = true;
		// When starting content finish up content beacon and add content bindings
		$( embedPlayer ).bind( 'onplay'  + _this.bindPostFix, function(){
			// Check if the play event is content or "inAdSequence" 
			if( !_this.inAd() && firstNonAdPlay ){
				firstNonAdPlay = false;
				// Playing content fire the 5 content beacon and start content tracking
				_this.dispatchEvent( 5, _this.getCurrentVideoSrc() , "content", _this.getMetaXmlString(), 1 );
				// Add player "raw" player bindings:
				_this.addPlayerBindings( _this.embedPlayer.getPlayerElement(), "content" );
			}
		});
		// on player "ended" send end event 7
		$( embedPlayer ).bind( 'ended' + _this.bindPostFix, function(){
			_this.dispatchEvent( 7, _this.getCurrentVideoSrc(), "content", _this.getMetaXmlString(), 1 );
		});

	},
	/**
	 * Adds player bindings for either ads or players
	 */
	addPlayerBindings: function( player, type ){
		var _this = this;
		var embedPlayer = this.embedPlayer;
		var trackerPostFix = '.nielsenPlayerTracker';
		// unbind any existing bindings: : 
		$( embedPlayer ).unbind( trackerPostFix );
		$( player ).unbind( trackerPostFix );
		
		// Non-native events: ( have to bind against embedPlayer instead of the video instance )
		$( embedPlayer ).bind( 'onOpenFullScreen' + trackerPostFix, function(){
			_this.dispatchEvent( 10, "true", type);
		})
		$( embedPlayer ).bind( 'onCloseFullScreen' + trackerPostFix, function(){
			_this.dispatchEvent( 10, "false", type);			
		})
		// Mute:
		$( embedPlayer ).bind( 'onToggleMute' + trackerPostFix, function(){
			_this.dispatchEvent( 9, String(embedPlayer.muted), type );
		})
		
		// Setup a shortcut to bind call ( including bindPostFix )
		var b = function( bindName, callback ){
			$( player ).bind( bindName + trackerPostFix, callback);
		}
		
		// on play:
		b('play', function(){
			_this.dispatchEvent( 5, _this.getRelativeTime('currentTime') );
		});
		// on pause:
		b( 'pause', function(){
			_this.dispatchEvent( 6, _this.getRelativeTime('currentTime'), type);
		});
		// on complete: 
		b( 'ended', function(){
			_this.dispatchEvent( 7, _this.getRelativeTime('currentTime'), type);
		});
		// Volume change: 
		b( 'volumechange', function(){
			_this.dispatchEvent( 11, String(player.volume), type );
		});
		
		// Kaltura HTML5 does not really have an idle state:
		// sender.onIdle(function(args) {ggCom1.onCurrentStateChanged(args)});
		
		// Monitor:
		var lastTime = 0;
		b( 'timeupdate', function(){
			var posDelta  = Math.abs( player.currentTime - lastTime );
			// Check for position changed more than "3" 
			// NOTE: changed Nielsen example of 2 seconds to 3 since progress query interval is 
			// also set to 2 it would appear as if there were seeks all the time. 
			if( posDelta > 3 ){
				_this.dispatchEvent( 8, String( lastTime ), String( _this.getRelativeTime('currentTime') ), type );
			}
			// Dispatch player progress every 2 seconds:
			if( posDelta > _this.queryInterval ){
				lastTime = embedPlayer.currentTime;
				_this.dispatchEvent( 49, String( _this.getRelativeTime('currentTime') ), type );
			}
		});
	},
	/**
	 * Dispatches a Nielsen event via the gg.ggPM call.  
	 * if debug is enabled we log this event to the console
	 */
	dispatchEvent: function(){
		var args = $.makeArray( arguments ); 
		var eventString = args.join("\n\n"); 
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
				// TODO see which relative segment time duration we should return 
			}
		}
		// If no cuePoints are found return normal embedPlayer currentTime or duration:  
		return embedPlayer[type];
	},
	inAd:function(){
		return !! this.embedPlayer.evaluate('{sequenceProxy.isInSequence}'); 
	},
	/**
	 * Get the Nielsen xml string: 
	 */
	getMetaXmlString: function(){
		var _this = this;
		// These won't change 
		var meta = ''+
			"<uurl>"+
				this.getCurrentVideoSrc() +
			"</uurl>\n" +
			"<length>"+
				this.getRelativeTime( 'duration' ) + 
			"</length>\n";
		// A tag map that allows for ads to override content values
		var tagMap = {};
		// Get the current config evaluated expressions: 
		var evalConfig = this.embedPlayer.getKalturaConfig('NielsenPlugin');
		$.each( evalConfig, function( attr, evalValue ){
			// set the tag value 
			if( attr.indexOf('tag_') === 0 ){
				// When in an Ad check if the tag already exists
				if( _this.inAd() && tagMap[ attr.substr( 4 ) ] ){
					// don't override ad tags 
				} else {
					// set the content tag:
					tagMap[ attr.substr( 4 ) ] = evalValue;
				}
			}
			// if in an ad override the tagMap with ad_ tag value:
			if( _this.inAd() && attr.indexOf('ad_') === 0 && evalValue ){
				tagMap[ attr.substr( 3 ) ] = evalValue;
			}
		});
		
		// output the final tag map: 
		$.each( tagMap, function(attr, evalValue){
			meta += '<' + attr + '>' + evalValue + '</' + attr + '>' + "\n";
		})
		return meta;
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
					  clientid: _this.getConfig( "clientid" )
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
