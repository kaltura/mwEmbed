/*
* DolStatistics plugin
*/

mw.DolStatistics = function( embedPlayer, callback ){
	this.init( embedPlayer, callback );
};

mw.DolStatistics.prototype = {

	pluginVersion: "1.0",
	bindPostfix: '.DolStatistics',

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
		
		this.pluginConfig = this.embedPlayer.getKalturaConfig( 'dolStatistics', attributes );

		// List of events we need to track
		this.eventsList = this.pluginConfig.listenTo.split(",");

		mw.log('DolStatistics:: Init plugin :: Plugin config: ', this.pluginConfig);

		// Add player binding
		this.addPlayerBindings( callback );
	},

	addPlayerBindings: function( callback ) {
		var _this = this;
		var embedPlayer = this.embedPlayer;

		// On change media remove any existing ads:
		$( embedPlayer ).bind( 'onChangeMedia' + _this.bindPostfix, function(){
			_this.destroy();
		});

		// Register to our events
		for( var i=0; i<_this.eventsList.length; i++ ) {
			var eventName = _this.eventsList[i];
			embedPlayer.addJsListener(eventName, function() {
				var eventData = '';
				for( var x = 0; x < arguments.length; x++ ) {
					eventData += arguments[x] + ",";
				}
				eventData = eventData.substr(0, eventData.length-1);
				_this.sendStatsData(eventName, eventData);
			});
		}

		mw.log('DolStatistics:: addPlayerBindings:: Events list: ', this.eventsList);

		// release the player
		callback();
	},

	sendStatsData: function( eventName, eventData ) {
		var _this = this;
		// If event name not in our event list, exit
		if( this.pluginConfig.listenTo.indexOf(eventName) === -1 ) {
			return ;
		}
		
		// Setup event params
		var params = {};
		// Grab from plugin config
		var configAttrs = [ 'GENURL', 'GENTITLE', 'DEVID', 'USRAGNT', 'ASSETNAME', 'BITRATE', 'ASSETID' ];
		for(var x=0; x<configAttrs.length; x++) {
			params[ configAttrs[x] ] = _this.pluginConfig[ configAttrs[x] ] || '';
		}
		// Current Timestamp
		params['GENTIME'] = new Date().getTime();
		// Widget ID
		params['WIGID'] = this.embedPlayer.kwidgetid;
		// Video length
		params['VIDLEN'] = this.embedPlayer.evaluate('{duration}');
		// Player protocol
		params['KDPPROTO'] = this.pluginConfig.protocol;
		// Kaltura Player ID
		params['KDPID'] = this.embedPlayer.kuiconfid;
		// Kaltura Event name
		params['KDPEVNT'] = eventName;
		// KDP Event Data
		if( eventData )
			params['KDPDAT_VALUE'] = eventData.toString();


		if( window.parent ) {
			// If we have acess to parent, call the jsFunction provided
			var callbackName = this.pluginConfig.jsFunctionName;
			this._executeFunctionByName( callbackName, window.parent, params);
		} else {
			// Use beacon to send event data
			var statsUrl = this.pluginConfig.protocol + '://' + this.pluginConfig.host + '/cp?app=KDP&' + $.param(params);
			mw.log('DolStatistics:: Send Stats Data ' + statsUrl, params);
		}
	},

	destroy: function() {
		$( this.embedPlayer ).unbind( this.bindPostfix );
	},

	_executeFunctionByName: function(functionName, context /*, args */) {
		var args = Array.prototype.slice.call(arguments).splice(2);
		var namespaces = functionName.split(".");
		var func = namespaces.pop();
		for(var i = 0; i < namespaces.length; i++) {
			context = context[namespaces[i]];
		}
		return context[func].apply(this, args);
	}
};