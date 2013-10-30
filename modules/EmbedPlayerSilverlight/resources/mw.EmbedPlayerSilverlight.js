/**
* Native embed library:
*
* Enables embedPlayer support for native html5 browser playback system
*/
( function( mw, $ ) { "use strict";

mw.EmbedPlayerSilverlight = {
	//Instance Name
	instanceOf: 'Silverlight',
	// Get the Xaml content id
	getXamlId: function(){
		return 'xamlContent' + this.pid;
	},
	oldCurrentTime: 0,
	// flag to register ready state: 
	silverlightPlayerLoaded: false,
	/*
	 * Embed player HTML
	 */
	embedPlayerHTML : function() {
		var _this = this;
		// Setup the Xaml player: 
		this.embedXamlContent();
		// reset old current time: 
		this.oldCurrentTime =0;
		
		// remove any existing pid ( if present )
		$( '#' + this.pid ).remove();
		
		// do the silverlight embed
		Silverlight.createObjectEx({
			source: '#' + this.getXamlId(),			// Source property value, referencing an ID in the HTML DOM.
			parentElement: $( this )[0],		// DOM reference to hosting DIV tag.
			id: this.pid,					// Unique plug-in ID value.
			properties: {					// Plug-in properties.
				width:'100%',				// Width of rectangular region of plug-in, in pixels.
				height:'100%',				// Height of rectangular region of plug-in, in pixels.
				background:'#000000',		// Background color of plug-in.
				version:'1.0'				// Plug-in version.
			},
			events: {
				onLoad:function(){
					 // OnLoad property value -- event handler function name.
					_this.silverlightPlayerLoaded = true;
					// start monitoring: 
					_this.monitor();
				}
			}
		});
		
	},
	embedXamlContent: function(){
		var _this = this;
		// setup the silverlight callbacks: 
		//http://msdn.microsoft.com/en-us/library/system.windows.controls.mediaelement_events(v=vs.95).aspx
		var eventHandlers = [
			'BufferingProgressChanged',
			'CurrentStateChanged',
			'DownloadProgressChanged',
			'LogReady',
			'MarkerReached',
			'MediaEnded',
			'MediaFailed',
			'MediaOpened',
			'RateChanged'
		];
		
		// Embed the silverlight xml if not already present:
		if( $('#xamlContent' + this.pid ).length ){
			return ;
		}
		var xamlScript = '' +
			'<script type="text/xaml" id="' + this.getXamlId() + '">' + 
			' <?xml version="1.0"?><Grid xmlns="http://schemas.microsoft.com/client/2007">' + 
			'<MediaElement Name="media" Stretch="Uniform" VerticalAlignment="Top" ';
		// output all media events mappings
		$.each( eventHandlers, function( inx, eventName ){
			var gCallbackName = 'slp_' + eventName + '_cb_' + _this.id.replace(/[^a-zA-Z 0-9]+/g,'');
			// Add mapping to xml: 
			xamlScript += eventName + '="' + gCallbackName + '" ';
			
			window[ gCallbackName ] = function( sender, args ){
				// check for local event: 
				if( _this[ 'on' + eventName ] ){
					_this[ 'on' + eventName ]( sender, args )
				}
				mw.log( 'EmbedPlayerSilverlight:: callback event: ' + eventName );
			}
		});
		// Set the initial source: 
		xamlScript+= 'Source="' + this.getSrc() + '" /> ' ;
		// close out grid and script tags:
		xamlScript+='</Grid> ' +
		'</script>';
		// add xamlScript script
		$('body').append( xamlScript );
	},
	// Silverlight has no  timeupdate event, tack onto monitor where time changes
	monitor: function(){
		if( this.getPlayerElementTime() != this.oldCurrentTime ){
			$( this ).trigger( 'timeupdate' );
		}
		this.parent_monitor();
	},
	/*
	 * Action methods 
	 */
	play: function() {
		if ( this.silverlightPlayerLoaded ) {
			this.getPlayerElement().play();
		}
		this.parent_play();
	},
	pause: function(){
		if ( this.silverlightPlayerLoaded ) {
			this.getPlayerElement().pause();
		}
		this.parent_pause();
	},
	/**
	 * Getters
	 */
	/**
	* Get the embed player time
	*/
	getPlayerElementTime: function() {
		var _this = this;
		if ( !this.getPlayerElement() ) {
			mw.log( 'EmbedPlayerSilverlight::getPlayerElementTime: ' + this.id + ' not in dom ( stop monitor)' );
			return false;
		}
		// Return the playerElement currentTime
		return this.getPlayerElement().Position.Seconds;
	},
	getPlayerElement: function () {
		var slp = $( '#' + this.pid )[0];
		if( slp && slp.content ){
			this.playerElement = $( '#' + this.pid )[0].content.findName("media");
			return this.playerElement;
		}
	},
	/**
	 * Event handlers: 
	 */
	onCurrentStateChanged: function(){
		var state = this.playerElement.CurrentState;
		switch( this.playerElement.CurrentState ){
			case 'Opening':
			break;
			case 'AcquiringLicense':
			break;
			case 'Playing':
				this.onPlay();
			break;
			case 'Paused':
				this.onPause();
			break;
		}
	},
	/**
	 * on Pause callback from the kaltura flash player calls parent_pause to
	 * update the interface
	 */
	onPause : function() {
		this.updatePlayheadStatus();
		$( this ).trigger( "onpause" );
	},
	/**
	 * Seeked is done
	 */
	onPlayerSeekEnd : function () {
		$( this ).trigger( 'seeked' );
		if( seekInterval  ) {
			clearInterval( seekInterval );
		}
	},
	/**
	 * onPlay function callback from the kaltura flash player directly call the
	 * parent_play
	 */
	onPlay : function() {
		this.updatePlayheadStatus();
		$( this ).trigger( "playing" );
		if ( this.seeking == true ) {
			this.onPlayerSeekEnd();
		}
	},
	onBufferingProgressChanged: function(sender, args){
		//debugger;
	},
	onDownloadProgressChanged: function( sender, args ){
		//debugger;
	},
	/**
	* Local method for progress event
	* fired as the video is downloaded / buffered
	*
	* Used to update the bufferedPercent
	*
	* Note: this way of updating buffer was only supported in Firefox 3.x and
	* not supported in Firefox 4.x
	*/
	_onprogress: function( event ) {
		var e = event.originalEvent;
		if( e && e.loaded && e.total ) {
			this.updateBufferStatus( e.loaded / e.total );
			this.progressEventData = e.loaded;
		}
	}
};

} )( mediaWiki, jQuery );