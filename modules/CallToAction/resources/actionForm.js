( function( mw, $ ) {"use strict";

mw.PluginManager.add( 'actionForm', mw.KBaseScreen.extend({

	defaultConfig: {
		displayOn: "start", // start, <time>, <percent>%, end
		submitRequired: true,
		templatePath: '../CallToAction/templates/collect-form.tmpl.html'
	},

	triggered: false,

	setup: function() {

		this.log('Setup -- displayOn: ' + this.getConfig('displayOn'));

		var showScreen = $.proxy( this.showScreen, this);

		// Show screen at right time
		switch( this.getConfig('displayOn') ) {
			case 'start':
				this.bind( 'playerReady', showScreen );
				break;
			case 'end':
				this.bind( 'onEndedDone', showScreen );
				break;
			default:
				this.bindByTimeOrPercent( this.getConfig('displayOn') );
				break;
		}
	},

	bindCleanScreen: function() {
		this.bind('onChangeMedia', $.proxy(function(){
			this.templateData = null;
			this.removeScreen();
		}, this));
	},

	bindByTimeOrPercent: function( time ) {
		// Normalize percent to time in seconds
		if( typeof time === 'string' && time.charAt(time.length-1) === '%' ) {
			time = (parseInt(time.substr(time.length -1)) / 100 ) * this.getPlayer().getDuration();
		} else {
			// Make sure it a number
			time = parseInt( time );
		}

		if( isNaN( time ) ) return;

		this.bind( 'monitorEvent', $.proxy(function( ct ){
			if( ct >= time ) {
				this.showScreen();
			}
		}, this));
	},

	showScreen: function() {
		// Show form only once
		if( this.triggered ){
			return ;
		}
		this.triggered = true;

		this._super();
	},

	processForm: function( e ) {
		
	}
}));

} )( window.mw, window.jQuery );