/*
* omtk media player supports ogg vorbis playback.
* omtk is not feature complete and fails on some ogg vorbis streams.
*
* This script will be depreciated unless the omtk flash applet improves in quality 
*/
var omtkEmbed = {
	
	// Instance name
	instanceOf:'omtkEmbed',
	
	// Supported player features  
	supports: {
		'pause' : true,
		'timeDisplay' : true
	},
	
	/**
	* Wrap the embed code
	*/
	doEmbedHTML : function () {
	 	var _this = this;
	 	var playerPath = mw.getMwEmbedPath() + 'modules/EmbedPlayer/binPlayers/omtk-fx/omtkp.swf';
		$j( this ).html(
			'<object id="' + this.pid + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="1" height="1">' +
				'<param name="movie" value="' + playerPath + '" />' + "\n" +
				'<!--[if !IE]>-->' + "\n" +
					'<object id="' + this.pid + '_ie" type="application/x-shockwave-flash" data="' + playerPath + '" width="1" height="1">' + "\n" +
				'<!--<![endif]-->' + "\n" +
					  '<p>Error with Display of Flash Plugin</p>' + "\n" +
				'<!--[if !IE]>-->' + "\n" +
					'</object>' + "\n" +
				'<!--<![endif]-->' + "\n" +
			  '</object>'
		)
		// omtk  needs to fire an onReady event.
		setTimeout( function() {
			_this.postEmbedJS();
		}, 2000 );
		return embed_code;
	},	
	
	/**
	* Run post embed javascript
	*/ 
	postEmbedJS:function() {
		this.getPlayerElement();
		// play the url: 
		mw.log( "play: pid:" + this.pid + ' src:' + this.src );
				
		this.playerElement.play( this.src );
		
		this.monitor();
		// $j('#omtk_player').get(0).play(this.src);
		// $j('#'+this.pid).get(0).play( this.src );
	},
	
	/**
	* omtk does not support pause, issue the "stop" request
	*/
	pause:function() {
		this.stop();
	},
	
	/**
	* Get the embed player time
	*/
	getPlayerElementTime: function() {
		this.getPlayerElement();
		if ( this.playerElement.getPosition ){
			return currentTime = this.playerElement.getPosition() / 1000;
		}		
	},
	
	/**
	* Update the playerElement pointer
	*/
	getPlayerElement : function () {
		this.playerElement = $j( '#' + this.pid ).get( 0 );
		if ( !this.playerElement.play )
			this.playerElement = $j( '#' + this.pid + '_ie' ).get( 0 );
		
		if ( this.playerElement.play ) {
			// mw.log('omtk obj is missing .play (probably not omtk obj)');
		}
	}
}
// Some auto-called globals (bad) 
function OMTK_P_complete() {
	mw.log( 'OMTK_P_complete' );
}

function OMTK_P_metadataUpdate() {
	mw.log( 'OMTK_P_metadataUpdate' );
}
