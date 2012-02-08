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

	init: function( embedPlayer, callback ){
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

		// On change media remove any existing ads:
		embedPlayer.bindHelper( 'onChangeMediaDone' + _this.bindPostFix, function(){
			if( ! embedPlayer['data-playerError'] ){
				$embedPlayer.data('DolStatisticsCounter', $embedPlayer.data('DolStatisticsCounter') + 1 );
			}
			_this.destroy();
		});

		// Register to our events
		$.each(this.eventsList, function(k, eventName) {
			switch( eventName ) {
				// Special event
				case 'percentReached':
					_this.calcCuePoints();
					embedPlayer.bindHelper( 'monitorEvent' + _this.bindPostFix, function() {
						_this.monitorPercentage();
					});
				break;
				// Change playerUpdatePlayhead event to send events on playheadFrequency
				case 'playerUpdatePlayhead':
					_this.addMonitorBindings();
				break;
				// Use addJsListener for all other events
				default:
					embedPlayer.addJsListener(eventName + _this.bindPostFix, function() {
						var eventData = '';
						var argSet = $.makeArray( arguments );
						$.each( argSet, function( inx, argValue ){
							eventData += argValue + ",";
						});
						eventData = eventData.substr( 0, eventData.length-1 );
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
			if( cuePoint === 0 ) continue;
			_this.percentCuePoints[ cuePoint ] = false;
		}

		mw.log('DolStatistics:: calcCuePoints:: ', _this.percentCuePoints);
	},

	/* Custom percentReached event */
	monitorPercentage: function() {
		var _this = this;
		var duration = this.getDuration();
		var percentCuePoints = this.percentCuePoints;
		var currentTime = Math.round( this.embedPlayer.currentTime );

		if( percentCuePoints[ currentTime ] === false ) {
			percentCuePoints[ currentTime ] = true;
			var percent = Math.round(currentTime * 100 / duration );
			_this.sendStatsData( 'percentReached', percent );
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
					_this.sendStatsData( 'playerUpdatePlayhead' , embedPlayer.currentTime);
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
		if( ! this.duration ){
			this.duration = this.embedPlayer.evaluate('{duration}');
		}
		return this.duration;
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
		params['app'] = this.appName;
		// Grab from plugin config
		var configAttrs = [ 'DEVID', 'ASSETNAME', 'ASSETID' ];
		for( var x=0; x<configAttrs.length; x++) {
			params[ configAttrs[x] ] = _this.getConfig( configAttrs[x] ) || '';
		}
		// Embedded Page URL
		params['GENURL'] =  _this.getConfig('GENURL') || window.kWidgetSupport.getHostPageUrl();
		// Embedded Page Title
		params['GENTITLE'] =  _this.getConfig('GENTITLE') || mw.getConfig( 'EmbedPlayer.IframeParentTitle' );
		// User Agent
		params['USRAGNT'] =  _this.getConfig('USRAGNT') || window.navigator.userAgent;
		// Current Timestamp
		params['GENTIME'] = new Date().getTime();
		// Widget ID
		params['WIGID'] = this.embedPlayer.kwidgetid;
		// Flavor Bitrate
		params['BITRATE'] = this.getBitrate();
		// Video length
		params['VIDLEN'] = this.getDuration();
		// Player protocol
		params['KDPPROTO'] = mw.parseUri( mw.getConfig( 'Kaltura.ServiceUrl' ) ).protocol;
		// Kaltura Player ID
		params['KDPID'] = this.embedPlayer.kuiconfid;
		// Kaltura Session ID
		params['KSESSIONID'] = this.embedPlayer.evaluate('{configProxy.sessionId}');
		// Kaltura Playback ID ( kSessionId + playbackCounter )
		params['KPLAYBACKID'] = this.embedPlayer.evaluate('{configProxy.sessionId}') + $( this.embedPlayer ).data('DolStatisticsCounter');
		// Kaltura session Seq 
		params['KSESSIONSEQ'] = $( this.embedPlayer ).data('DolStatisticsCounter');
		// Kaltura Event name
		params['KDPEVNT'] = eventName;
		// KDP Event Data
		params['KDPDAT_VALUE'] = eventData.toString();
		// Always include the current time: 
		params['KDPDAT_PLAYHEAD'] = this.embedPlayer.currentTime;
		
		// Add custom params
		for( var i =0; i < 10; i++ ){
			// Check for custom data key value pairs ( up to 9 ) 
			if( _this.getConfig( 'customDataKey' + i ) &&  _this.getConfig( 'customDataValue' + i ) ){
				params[  _this.getConfig( 'customDataKey' + i )  ] =  _this.getConfig( 'customDataValue' + i );
			}
		}
		
		mw.log('DolStatistics:: Send Stats Data ' + statsUrl, params);
		
		// If we have access to parent, call the jsFunction provided
		if( this.getConfig( 'jsFunctionName' ) && window.parent ) {
			var callbackName = this.getConfig( 'jsFunctionName' );
			this._executeFunctionByName( callbackName, window.parent, params);
		} else {
			// Use beacon to send event data
			var statsUrl = this.getConfig( 'protocol' ) + '://' + this.getConfig( 'host' ) + '?' + $.param(params);
			$('body').append(
				$( '<img />' ).attr({
					'src' : statsUrl,
					'width' : 0,
					'height' : 0
				})
			);
		}
	},

	destroy: function() {
		clearInterval( this.playheadInterval );
		this.playheadInterval = 0;
		this.embedPlayer.unbindHelper( this.bindPostFix );
		this.percentCuePoints = {};
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
		return context[func].apply(this, args);
	}
};
