( function( mw, $ ) {"use strict";

// Class defined in resources/class/class.js
mw.KBasePlugin = Class.extend({
	asyncInit: false,
	init: function( embedPlayer, callback, pluginName ){

		// Save to local scope
		this.embedPlayer = embedPlayer;
		this.initCompleteCallback = callback;
		this.pluginName = pluginName;
		this.safe = true;

		this.bindPostFix = '.' + pluginName;

		this.setDefaults();

		var safeEnviornment = this.isSafeEnviornment();
		var _this = this;

		// Check if jQuery Deferrer
		if( typeof safeEnviornment == 'object' && safeEnviornment.promise ){
			safeEnviornment.done(function(isSafe){
				if( !isSafe ){
					_this.safe = false;
					_this.destroy();
				}
			});
		} else if( typeof safeEnviornment == 'boolean' && ! safeEnviornment ) {
			this.safe = false;
			this.initCompleteCallback();
			return false;
		}

		// Add onConfigChange binding
		this.bindConfigChangeEvent();
		
		// Call plugin setup method
		this.setup();

		// Run initCompleteCallback
		if( this.asyncInit === false ) {
			this.initCompleteCallback();
		}

		return this;
	},
	setDefaults: function( obj ){
		obj = obj || this.defaultConfig;
		var _this = this;
		// Set default configuration for the plugin
		if( $.isPlainObject(obj) ) {
			$.each( obj, function( key, value ) {
				if( _this.getConfig( key ) === undefined ) {
					_this.setConfig( key, value, true );
				}
			});
		}
	},
	isSafeEnviornment: function(){
		return true;
	},
	setup: function() {},
	getPlayer: function() {
		return this.embedPlayer;
	},
	getConfig: function( attr, raw ) {
		if( raw ){
			return this.embedPlayer.getRawKalturaConfig( this.pluginName, attr );
		}
		return this.embedPlayer.getKalturaConfig( this.pluginName, attr );
	},
	setConfig: function( attr, value, quiet ) {
		this.embedPlayer.setKalturaConfig( this.pluginName, attr, value, quiet );
	},
	getTemplateHTML: function( data ){
		var _this = this;
		// Setup empty object
		data = data || {};
		// Add out plugin instance
		data.self = this;
		data.player = this.embedPlayer;
		data.entry = this.embedPlayer.kalturaPlayerMetaData;
		data.entryMetadata = this.embedPlayer.kalturaEntryMetaData;
		data.formaters = mw.util.formaters().getAll();

		var defer = $.Deferred();

		var parseTemplate = function(rawHTML){
			var transformedHTML = mw.util.tmpl( rawHTML );
			transformedHTML = transformedHTML(data);
			var evaluatedHTML = $.trim( _this.embedPlayer.evaluate( transformedHTML ) );
			var $templateHtml = $( '<span class="tmpl">' + evaluatedHTML + '</span>' );

			$templateHtml
				.find('[data-click],[data-notification]')
				.click(function(e){
					var data = $(this).data();
					return _this.handleClick( e, data );
				});

			// Handle form submission
			$templateHtml.find('[data-submit]').submit(function(e){
				var cb = $(this).data('submit');
				if( $.isFunction( _this[cb] ) ) {
					_this[cb](e);
				}
				return false;
			});
			defer.resolve($templateHtml);
		}

		// First get template from 'template' config
		var rawHTML = this.getConfig( 'template', true );
		if( !rawHTML ){
			var templatePath = this.getConfig( 'templatePath' );
			if( !window.kalturaIframePackageData.templates[ templatePath ]) {
				this.log('getTemplateHTML:: Template not found in payload - trying async loading');
				if ( templatePath && templatePath.indexOf("http") === 0 ){
					$.ajax({
						url: templatePath
					}).done(function(data) {
							window.kalturaIframePackageData.templates[ templatePath ] = rawHTML = data;
							parseTemplate(rawHTML);
						}).fail(function(data) {
							defer.reject("mw.KBasePlugin::Error occur when trying to load external template from: " + templatePath);
						});
				}else{
					defer.reject("mw.KBasePlugin::Could not load external template: " + templatePath + ". Must be a full url starting with http.");
				}
			}else{
				rawHTML = window.kalturaIframePackageData.templates[ templatePath ];
				parseTemplate(rawHTML);
			}
		}else{
			parseTemplate(rawHTML);
		}
		return defer;
	},
	getTemplatePartialHTML: function( partialName, settings ){
		// First get template from 'template' config
		var rawHTML = this.getConfig( 'template', true );
		if( !rawHTML ){
			if( !partialName || !window.kalturaIframePackageData.templates[ partialName ]) {
				this.log('getTemplateHTML:: Template not found');
				return '';
			}
			rawHTML = window.kalturaIframePackageData.templates[ partialName ];
		}
		var transformedHTML = mw.util.tmpl( rawHTML, settings );

		return transformedHTML;
	},
	handleClick: function( e, data ){

		e.preventDefault();

		// Trigger local callback for data-click property
		if( data.click && $.isFunction(this[data.click]) ){
			this[data.click]( e, data );
		}

		if( data.notification ){
			this.getPlayer().sendNotification( data.notification, data );
		}

		return false;
	},
	once: function(eventName,callback) {
		return this.bind( eventName , callback , true );
	},
	bind: function( eventName, callback , once ){
		var bindEventsString = '',
			events = eventName.split(" "),
			totalEvents = events.length,
			i = 0,
			space = ' ';

		for( i; i<totalEvents; i++ ){
			if( i == (totalEvents-1) ){
				space = '';
			}
			bindEventsString += events[ i ] + this.bindPostFix + space;
		}
		if (once){
			return this.embedPlayer.bindOnceHelper( bindEventsString, callback);
		}
		return this.embedPlayer.bindHelper( bindEventsString, callback);
	},
	unbind: function( eventName ){
		var fullEventName = eventName + this.bindPostFix;
		if (eventName === null || eventName === undefined){
			fullEventName = this.bindPostFix;
		}
		return this.embedPlayer.unbindHelper( fullEventName );
	},
	log: function( msg ){
		mw.log( this.pluginName + '::' + msg );
	},
	bindConfigChangeEvent: function(){
		var _this = this;
		if( typeof this.onConfigChange !== 'function' ){
			return ;
		}
		this.bind('Kaltura_ConfigChanged', function(event, pluginName, property, value){
			if( pluginName === _this.pluginName ){
				_this.onConfigChange( property, value );
			}
		});
	},
	getKalturaClient: function() {
		if( ! this.kClient ) {
			this.kClient = mw.kApiGetPartnerClient( this.embedPlayer.kwidgetid );
		}
		return this.kClient;
	},
	destroy: function(){
		this.unbind();
	}
});

} )( window.mw, window.jQuery );
