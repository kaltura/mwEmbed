/*
* DolStatistics plugin
*/
mw.DolStatistics = function( embedPlayer, callback ){
	this.init( embedPlayer, callback );
};

mw.DolStatistics.prototype = {

	pluginVersion: "1.1",
	bindPostFix: '.DolStatistics',
	appName: 'KDP',

	// Number of seconds between playhead event dispatches
	playheadFrequency: 5,
	playheadInterval: 0,

	// Entry duration
	duration: 0,

	// hold list of cue points per 10% of video duration
	percentCuePoints: {},
	// hold the indexed percent values
	percentCuePointsMap: {}, 

	init: function( embedPlayer, callback ){
		var _this = this;
		this.embedPlayer = embedPlayer;

		// List of all attributes we need from plugin configuration (flashVars/uiConf)
		var attributes = [
			'listenTo',
			'playheadFrequency',
			'jsFunctionName',
			'protocol',
			'host',
			'ASSETNAME',
			'GENURL',
			'GENTITLE',
			'DEVID',
			'USRAGNT',
			'ASSETID'
		];
		this.playheadFrequency = this.getConfig( 'playheadFrequency' ) || 5;

		// List of events we need to track
		var eventList = this.getConfig( 'listenTo' );
		this.eventsList = eventList.split(",");
		
		mw.log( 'DolStatistics:: eventList:' + this.eventsList );
		
		// Setup player counter, ( used global, because on change media we re-initialize the plugin and reset all vars )
		if( typeof $( embedPlayer ).data('DolStatisticsCounter') == 'undefined' ) {
			if( embedPlayer['data-playerError'] ){
				$( embedPlayer ).data('DolStatisticsCounter', 0 ) 
			} else {
				$( embedPlayer ).data('DolStatisticsCounter', 1 );
			}
		}
		mw.log('DolStatistics:: Init plugin :: Plugin config: ', this.embedPlayer.getKalturaConfig( 'dolStatistics') );

		// Add player binding
		this.addPlayerBindings( callback );
	},
	getConfig: function( attr ){
		return this.embedPlayer.getKalturaConfig( 'dolStatistics', attr );
	},
	addPlayerBindings: function( callback ) {
		var _this = this;
		var embedPlayer = this.embedPlayer;
		var $embedPlayer = $( embedPlayer );

		// Unbind any existing bindings
		this.destroy();
		
		// Increment counter during replays: 
		embedPlayer.bindHelper('replayEvent' + this.bindPostFix, function(){
			// reset the percentage reached counter: 
			_this.calcCuePoints();
			var curVal = $( embedPlayer ).data('DolStatisticsCounter' );
			 $( embedPlayer ).data('DolStatisticsCounter', curVal+1 );
			 mw.log( 'DolStatistics:: replayEvent> reset cuePoints and increment counter: ' + $( embedPlayer ).data('DolStatisticsCounter' ) );
		});
		
		// On change media remove any existing bindings:
		embedPlayer.bindHelper( 'onChangeMediaDone' + _this.bindPostFix, function(){
			if( ! embedPlayer['data-playerError'] ){
				$embedPlayer.data('DolStatisticsCounter', $embedPlayer.data('DolStatisticsCounter') + 1 );
			}
		});
		// Register to our events
		$.each(this.eventsList, function(k, eventName) {
			switch( eventName ) {
				// Special events
				case 'percentReached':
					embedPlayer.bindHelper( 'playerReady', function(){
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

		for( var i=0; i<=100; i=i+10 ) {
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
		if( this.embedPlayer.getPlayerElement() ){
			var rawDur = this.embedPlayer.getPlayerElement().duration
			if( ! isNaN( rawDur ) ){
				return rawDur;
			}
		}
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
		
		// Setup event params
		var params = {};
		// App name
		params['app'] = _this.getConfig('APP') || this.appName;
		// The asset id: 
		params['ASSETNAME'] = _this.getConfig('ASSETNAME');
		// Kaltura Event name
		params['KDPEVNT'] = eventName;
		// KDP Event Data
		if( eventData !== '' ){
			params['KDPDAT_VALUE'] = eventData.toString();
		}
		// Flavor Bitrate
		params['BITRATE'] = this.getBitrate();
		// Always include the current time: 
		params['KDPDAT_PLAYHEAD'] = Math.round( this.embedPlayer.currentTime * 1000 ) / 1000;
		// The auto played property; 
		params['AUTO'] = embedPlayer.autoplay;
		// Current Timestamp
		params['GENTIME'] = new Date().getTime();
		// Asset Id
		params['ASSETID'] = _this.getConfig( 'ASSETID' );
		// Kaltura Player ID
		params['KDPID'] = this.embedPlayer.kuiconfid;
		// Video length
		params['VIDLEN'] = this.getDuration();
		// Widget ID
		params['WIGID'] = this.embedPlayer.kwidgetid;
		// Kaltura session Seq 
		params['KSESSIONSEQ'] = $( this.embedPlayer ).data('DolStatisticsCounter');
		// Kaltura Session ID
		params['KSESSIONID'] = this.embedPlayer.evaluate('{configProxy.sessionId}');
		// User Agent
		params['USRAGNT'] =  _this.getConfig('USRAGNT') || window.navigator.userAgent;
		// Embedded Page URL
		params['GENURL'] =  _this.getConfig('GENURL') || window.kWidgetSupport.getHostPageUrl();
		// Kaltura Playback ID ( kSessionId + playbackCounter )
		params['KPLAYBACKID'] = this.embedPlayer.evaluate('{configProxy.sessionId}') + $( this.embedPlayer ).data('DolStatisticsCounter');

		// Embedded Page Title:
		try{
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
				params[i] == '';
			}
		}
		
		mw.log('DolStatistics:: Send Stats Data ' + statsUrl, params);
		
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
		var statsUrl = this.getConfig( 'protocol' ) + '://' + this.getConfig( 'host' ) + '?' + $.param(params);
		$('body').append(
			$( '<img />' ).attr({
				'src' : statsUrl,
				'width' : 0,
				'height' : 0
			})
		);
	},

	destroy: function() {
		clearInterval( this.playheadInterval );
		this.playheadInterval = 0;
		this.embedPlayer.unbindHelper( this.bindPostFix );
		this.percentCuePoints = {};
		this.percentCuePointsMap = {};
		this.duration = 0;
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