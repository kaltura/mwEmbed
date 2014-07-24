( function( mw, $ ) {"use strict";

mw.PluginManager.add( 'actionForm', mw.KBaseScreen.extend({

	defaultConfig: {
		displayOn: 'start', // start, <time>, <percent>%, end
		displayOnce: true,
		submitRequired: false,
		description: 'For more information, please enter your details and we will get back to you',
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

	formDisplayed: false,
	formSubmitted: false,
	duringSeek: false,
	displayTime: false,
	error: false,

	setup: function() {

		this.log('Setup -- displayOn: ' + this.getConfig('displayOn'));

		var showScreen = $.proxy( this.showScreen, this);

		if( this.getConfig('displayOn') == 0 ) {
			this.setConfig('displayOn', 'start');
		}

		// Show screen at right time
		switch( this.getConfig('displayOn') ) {
			case 'start':
				this.bind( 'playing', showScreen );
				break;
			case 'end':
				this.bind( 'onEndedDone', showScreen );
				break;
			default:
				this.bind( 'monitorEvent', $.proxy( this.displayOnTime, this ) );
				break;
		}

		this.bind( 'preSeek', $.proxy(function(){
			this.duringSeek = true;
		},this));
		this.bind( 'seeked', $.proxy(function(){
			this.duringSeek = false;
			if( this.getConfig('displayOn') == 'start' ){
				setTimeout(function() {
					showScreen();
				}, 0);
			}
		},this));
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
		/**
		 * Do not show form when:
		 * 1. during seek
		 * 2. there's an error
		 * 3. form already submitted
		 * 4. form should be displayed once and already been displayed
		 */
		if( this.getPlayer().currentTime >= this.getDisplayTime() && 
			!this.duringSeek && !this.error && !this.formSubmitted && !(this.getConfig('displayOnce') && this.formDisplayed) ) {
			var _this = this;
			setTimeout(function() {
				_this.showScreen();
			}, 0);
		}
	},

	showScreen: function() {
		this.log('showScreen');
		// Do not show form during seek, or if already submitted
		if( this.duringSeek || this.formSubmitted ){
			this.log('exit due duringSeek or formSubmitted');
			return ;
		}

		// Show only once
		if( this.getConfig('displayOnce') ) {
			if( this.formDisplayed ) {
				this.log('exit due formDisplayed');
				return ;
			}
			this.formDisplayed = true;
		}

		this.getPlayer().ignoreNextNativeEvent = true;
		this.getPlayer().disablePlayControls();
		// Disable key binding
		this.getPlayer().triggerHelper( 'onDisableKeyboardBinding' );
		this._super();	
	},

	hideScreen: function() {
		this.log('hideForm');
		this.getPlayer().enablePlayControls();
		// restore key binding
		 this.getPlayer().triggerHelper( 'onEnableKeyboardBinding' );
		this._super();
	},

	processForm: function( e ) {
		var $form = $(e.target);
		this.getPlayer().triggerHelper('actionFormSubmitted', [$form.serializeObject()]);
		this.formSubmitted = true;
		this.hideScreen();
	}
}));

} )( window.mw, window.jQuery );