( function( mw, $ ) {"use strict";

mw.PluginManager.add( 'actionForm', mw.KBaseScreen.extend({

	defaultConfig: {
		displayOn: 'start', // start, <time>, <percent>%, end
		submitRequired: false,
		fields: [
			{
				name: 'name',
				placeholder: 'Name',
				type: 'text',
				required: true
			},
			{
				name: 'email',
				placeholder: 'Email',
				type: 'email',
				required: true
			},
			{
				name: 'phone',
				placeholder: 'Phone Number',
				type: 'text'
			}
		],
		templatePath: '../CallToAction/templates/collect-form.tmpl.html'
	},

	triggered: false,
	displayTime: false,
	error: false,

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
				this.bind( 'monitorEvent', $.proxy( this.displayOnTime, this ) );
				break;
		}
	},

	bindCleanScreen: function() {
		this.bind('onChangeMedia', $.proxy(function(){
			this.templateData = null;
			this.removeScreen();
		}, this));
	},

	getDisplayTime: function() {
		if( this.displayTime === false ) {
			this.log('calc displayTime');
			var time = this.getConfig('displayOn');
			// Normalize percent to time in seconds
			if( typeof time === 'string' && time.charAt(time.length-1) === '%' ) {
				time = (parseInt(time.substr(0, time.length -1)) / 100 ) * this.getPlayer().getDuration();
			} else {
				// Make sure it a number
				time = parseInt( time );
			}
			if( isNaN( time ) ) {
				this.log('Unable to calculate displayTime: ' + this.getConfig('displayOn'));
				this.error = true;
				return ;
			}
			this.displayTime = time;
		}
		return this.displayTime;
	},

	displayOnTime: function() {
		if( !this.error && this.getPlayer().currentTime >= this.getDisplayTime() ) {
			this.showScreen();
		}
	},

	showScreen: function() {
		// Show form only once
		if( this.triggered ){
			return ;
		}
		this.triggered = true;
		this.getPlayer().disablePlayControls();
		// Disable key binding
		 this.getPlayer().triggerHelper( 'onDisableKeyboardBinding' );
		this._super();
	},

	hideScreen: function() {
		this.getPlayer().enablePlayControls();
		// restore key binding
		 this.getPlayer().triggerHelper( 'onEnableKeyboardBinding' );
		this._super();
	},

	processForm: function( e ) {
		var $form = $(e.target);
		this.getPlayer().triggerHelper('actionFormSubmitted', [$form.serializeObject()]);
		this.hideScreen();
	}
}));

} )( window.mw, window.jQuery );