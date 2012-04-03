/*
* DolStatistics plugin
*/
(function( mw, $ ) {

mw.DolStatistics = function( embedPlayer, callback ){
	this.init( embedPlayer, callback );
};

mw.DolStatistics.prototype = {

	pluginName: 'dolStatistics',
	pluginVersion: "1.1",
	bindPostFix: '.DolStatistics',
	appName: 'KDP',

	// Number of seconds between playhead event dispatches
	playheadFrequency: 5,
	playheadInterval: 0,
	
	duringChangeMediaFlag: false,

	// hold list of cue points per 10% of video duration
	percentCuePoints: {},
	// hold the indexed percent values
	percentCuePointsMap: {}, 

	init: function( embedPlayer, callback ){
		var _this = this;
		this.embedPlayer = embedPlayer;
		
		this.playheadFrequency = this.getConfig( 'playheadFrequency' ) || 5;

		// List of events we need to track
		var eventList = this.getConfig( 'listenTo' );
		this.eventsList = eventList.split(",");
		
		mw.log( 'DolStatistics:: eventList:' + this.eventsList );

		//Setup player counter, ( used global, because on change media we re-initialize the plugin and reset all vars
		if( typeof this.getConfig('playbackCounter') == 'undefined' ) {
			if( embedPlayer['data-playerError'] ){
				this.setConfig( 'playbackCounter', 0 );
			} else {
				this.setConfig( 'playbackCounter', 1 );
			}
		}
		mw.log('DolStatistics:: Init plugin :: Plugin config: ', this.getConfig() );

		// Add player binding
		this.addPlayerBindings( callback );
	},
	getConfig: function( attr ){
		return this.embedPlayer.getKalturaConfig( this.pluginName, attr );
	},
	setConfig: function( attr, value ) {
		this.embedPlayer.setKalturaConfig( this.pluginName, attr, value );
	},
	addPlayerBindings: function( callback ) {
		var _this = this;
		var embedPlayer = this.embedPlayer;

		// Unbind any existing bindings
		this.destroy();
		
		// Increment counter during replays: 
		embedPlayer.bindHelper('replayEvent' + this.bindPostFix, function(){
			// reset the percentage reached counter: 
			_this.calcCuePoints();
			_this.setConfig( 'playbackCounter', _this.getConfig('playbackCounter') + 1 );
			mw.log( 'DolStatistics:: replayEvent> reset cuePoints and increment counter: ' + _this.getConfig('playbackCounter') );
		});
		
		// On change media remove any existing bindings:
		embedPlayer.bindHelper( 'onChangeMedia' + _this.bindPostFix, function(){
			if( ! embedPlayer['data-playerError'] ){
				_this.duringChangeMediaFlag = true;
				_this.setConfig( 'playbackCounter', _this.getConfig('playbackCounter') + 1 );
			}
			_this.destroy();
		});
		// make sure we always fire 100% at end time
		embedPlayer.bindHelper( 'ended' + _this.bindPostFix, function(){
			// check if the last cue point was fired: 
			var dur = Math.round( _this.getDuration() );
			if( ! _this.percentCuePoints[ dur ] ){
				mw.log("DolStatistics: Used backup 'ended' event");
				_this.percentCuePoints[ dur ] = true;
				_this.sendStatsData( 'percentReached', _this.percentCuePointsMap[ dur ] );
			}
		});
		
		// Set the local autoplay flag: 
		embedPlayer.bindHelper( 'Playlist_PlayClip' + _this.bindPostFix, function(event, clipIndex, autoPlay){
			$( embedPlayer ).data('playlistAutoPlayFlag',  autoPlay);
		});
		
		// Register to our events
		$.each(this.eventsList, function(k, eventName) {
			switch( eventName ) {
				// Special events
				case 'percentReached':
					embedPlayer.bindHelper( 'KalturaSupport_EntryDataReady' + _this.bindPostFix, function(){
						_this.calcCuePoints();
						embedPlayer.bindHelper( 'monitorEvent' + _this.bindPostFix, function() {
							_this.monitorPercentage();
						});
					})
				break;
				case 'changeVolume': 
				case 'volumeChanged':
					embedPlayer.addJsListener(eventName + _this.bindPostFix, function( eventData ) {
						_this.sendStatsData( eventName, eventData.newVolume );
					});
				break;
				// Change playerUpdatePlayhead event to send events on playheadFrequency
				case 'playerUpdatePlayhead':
					_this.addMonitorBindings();
				break;
				// Use addJsListener for all other events
				default:
					embedPlayer.addJsListener(eventName + _this.bindPostFix, function( argValue ) {
						var eventData = '';
						if( typeof argValue == 'object' ){ 
							eventData = JSON.stringify( argValue );
							eventData = eventData.replace(/\"/g,'');
						} else {
							// check if argValue is the id in which case send nothing. 
							if( argValue != embedPlayer.id ){
								eventData = argValue;
							}
						}
						_this.sendStatsData( eventName, eventData );
					});
				break;
			}
			
		});
		mw.log('DolStatistics:: addPlayerBindings:: Events list: ', this.eventsList);
		// Continue player build out
		callback();
	},

	/* Create Index of Cue Points per 10% of video duration */
	calcCuePoints: function() {
		var _this = this;
		var duration = this.getDuration();

		for( var i=0; i<=100; i =i+10 ) {
			var cuePoint = Math.round( duration / 100 * i );
			// if on the last cuePoint subtract 1 second to ensure event, 
			// ( because of monitor interval checks an end event can be triggered before the 
			// last second gets a chance to be monitored ) 
			if( i == 100 ){
				cuePoint = cuePoint -1 ;
			}
			_this.percentCuePoints[ cuePoint ] = false;
			_this.percentCuePointsMap[ cuePoint ] = i;
		}

		mw.log('DolStatistics:: calcCuePoints:: ', _this.percentCuePoints);
	},

	/* Custom percentReached event */
	monitorPercentage: function() {
		var _this = this;
		var duration = this.getDuration();
		var percentCuePoints = this.percentCuePoints;
		var currentTime = Math.round( this.embedPlayer.currentTime );
		//mw.log( 'DolStatistics:: monitorPercentage>' + currentTime );
		
		// make sure 0% is fired 
		if( currentTime > 0 && percentCuePoints[ 0 ] === false ){
			percentCuePoints[ 0 ] = true;
			_this.sendStatsData( 'percentReached', 0 );
		}
			
		if( percentCuePoints[ currentTime ] === false ) {
			percentCuePoints[ currentTime ] = true;
			_this.sendStatsData( 'percentReached', _this.percentCuePointsMap[ currentTime ] );
		}
	},

	/* Custom playerUpdatePlayhead event */
	addMonitorBindings: function() {
		var _this = this;
		var embedPlayer = this.embedPlayer;
		var intervalTime = this.playheadFrequency * 1000;
		
		// Start monitor
		embedPlayer.bindHelper('onplay' + _this.bindPostFix, function() {
			if( ! _this.playheadInterval ) {
				_this.playheadInterval = setInterval( function(){
					_this.sendStatsData( 'playerUpdatePlayhead', Math.round( embedPlayer.currentTime ) );
				}, intervalTime );
			}
		});

		// Stop monitor
		embedPlayer.bindHelper('doStop' + _this.bindPostFix + ' onpause' + _this.bindPostFix + ' onChangeMedia' + _this.bindPostFix, function() {
			clearInterval( _this.playheadInterval );
			_this.playheadInterval = 0;
		});
	},

	/* Retrive video duration */
	getDuration: function() {
		// try to get the "raw" duration 
		/*if( this.embedPlayer.getPlayerElement() ){
			var rawDur = this.embedPlayer.getPlayerElement().duration;
			if( ! isNaN( rawDur ) ){
				return rawDur;
			}
		}*/
		return this.embedPlayer.evaluate('{duration}');
	},

	getBitrate: function() {
		if( this.embedPlayer.mediaElement.selectedSource ) {
			return this.embedPlayer.mediaElement.selectedSource.getBitrate() || 0;
		}
		return 0;
	},

	/* Send stats data using Beacon or jsCallback */
	sendStatsData: function( eventName, eventData ) {
		var _this = this;
		var embedPlayer = this.embedPlayer;
		// If event name not in our event list, exit
		if( this.eventsList.indexOf( eventName ) === -1 ) {
			return ;
		}
		// if flagged a change media call disregard everything until changeMedia
		if( _this.duringChangeMediaFlag && eventName != 'changeMedia' ){
			return ;
		}
		// If no event data for percentReached, exit
		if( eventName === 'percentReached' && ! eventData ) {
			return ;
		}
		_this.duringChangeMediaFlag = false;
		
		
		// Setup event params
		var params = {};
		// App name
		params['app'] = _this.getConfig('APP') || this.appName;
		// The asset id: 
		params['ASSETNAME'] = _this.getMediaType() + _this.getConfig('ASSETNAME');
		// Kaltura Event name
		params['KDPEVNT'] = eventName;
		// KDP Event Data
		if( eventData !== '' && eventData !== undefined ){
			params['KDPDAT_VALUE'] = eventData.toString();
		}
		// Flavor Bitrate
		params['BITRATE'] = this.getBitrate();
		// Hack: use duration to send the actual data instead of 0
		if( eventName == 'playerPlayEnd' ) {
			params['KDPDAT_PLAYHEAD'] = _this.getDuration().toFixed(2);
		} else {
			// Always include the current time: 
			params['KDPDAT_PLAYHEAD'] = Math.round( embedPlayer.currentTime * 1000 ) / 1000;
		}
		// The auto played property; 
		params['AUTO'] = this.getAutoPlayFlag();
		// Current Timestamp
		params['GENTIME'] = new Date().getTime();
		// Asset Id
		params['ASSETID'] = this.getConfig( 'ASSETID' );
		// Kaltura Player ID
		params['KDPID'] = embedPlayer.kuiconfid;
		// Video length
		params['VIDLEN'] = this.getDuration();
		// Widget ID
		params['WIGID'] = embedPlayer.kwidgetid;
		// Kaltura session Seq 
		params['KSESSIONSEQ'] = this.getConfig( 'playbackCounter' );
		// Kaltura Session ID
		params['KSESSIONID'] = embedPlayer.evaluate('{configProxy.sessionId}');
		// User Agent
		params['USRAGNT'] =  _this.getConfig('USRAGNT') || window.navigator.userAgent;
		// Embedded Page URL
		params['GENURL'] =  _this.getConfig('GENURL') || window.kWidgetSupport.getHostPageUrl();
		// Kaltura Playback ID ( kSessionId + playbackCounter )
		params['KPLAYBACKID'] = embedPlayer.evaluate('{configProxy.sessionId}') + this.getConfig( 'playbackCounter' );

		// Embedded Page Title:
		try {
			params['GENTITLE'] = parent.document.title;
		} catch( e ){
			// no title at all if we can't access the parent
		}
		// Device id
		params['DEVID'] =  _this.getConfig( 'DEVID' );
		// Player protocol ( hard coded to html5 )
		params['KDPPROTO'] = 'html5'; //mw.parseUri( mw.getConfig( 'Kaltura.ServiceUrl' ) ).protocol;
		
		// Add custom params
		for( var i =0; i < 10; i++ ){
			// Check for custom data key value pairs ( up to 9 ) 
			if( _this.getConfig( 'customDataKey' + i ) &&  _this.getConfig( 'customDataValue' + i ) ){
				params[ _this.getConfig( 'customDataKey' + i ) ] =  _this.getConfig( 'customDataValue' + i );
			}
		}
		
		// filter out undefined == NULL 
		// TODO this is kind of an ugly hack we should have 
		// evaluate support fallback names for undefined properties 
		for( var i in params ){
			if( typeof params[i] == 'string' ){
				// Find undefined with no space on either side
				params[i] = params[i].replace( /undefined/g, '' );
			} else if( typeof params[i] == 'undefined' ){
				params[i] = '';
			}
		}
		
		mw.log( 'DolStatistics:: Send Stats Data ' + statsUrl, params);
		
		// If we have access to parent, call the jsFunction provided
		if( this.getConfig( 'jsFunctionName' ) && window.parent ) {
			var callbackName = this.getConfig( 'jsFunctionName' );
			var executeSuccess = this._executeFunctionByName( callbackName, window.parent, params);
			// Check that the function executes correctly, else call the fallback statsUrl
			if( executeSuccess !== false ){
				return ;
			}
		}
		// Use beacon to send event data
		var statsUrl = this.getConfig( 'host' ) + '?' + $.param(params);
		$('body').append(
			$( '<img />' ).attr({
				'src' : statsUrl,
				'width' : 0,
				'height' : 0
			})
		);
	},
	/**
	 * get a media type string acorrding to dol mapping. 
	 */
	getMediaType: function(){
		// Get the media type: 
		var mediaType = this.embedPlayer.evaluate('{mediaProxy.entry.mediaType}');
		switch( mediaType ){
			case 5:
				return 'aud';
			break;
			case 2:
				return 'img';
			break;
		}
		// By default return video
		return 'vid';
	},
	getAutoPlayFlag: function(){
		var embedPlayer = this.embedPlayer;
		// Check if in playlist mode: 
		if( typeof $( embedPlayer ).data('playlistAutoPlayFlag') != 'undefined' ){
			return $( embedPlayer ).data('playlistAutoPlayFlag');
		}
		return embedPlayer.autoplay;
	},
	destroy: function() {
		clearInterval( this.playheadInterval );
		this.playheadInterval = 0;
		this.embedPlayer.unbindHelper( this.bindPostFix );
		this.percentCuePoints = {};
		this.percentCuePointsMap = {};
	},

	/* Execute function like: "cto.trackVideo" */
	_executeFunctionByName: function( functionName, context /*, args */) {
		var args = Array.prototype.slice.call(arguments).splice(2);
		var namespaces = functionName.split(".");
		var func = namespaces.pop();
		for(var i = 0; i < namespaces.length; i++) {
			context = context[namespaces[i]];
		}
		try {
			return context[func].apply( this, args );
		} catch( e ){
			mw.log("DolStatistics:: Error could not find function: " + functionName );
			return false;
		}
	}
};
}( window.mw, window.jQuery ));