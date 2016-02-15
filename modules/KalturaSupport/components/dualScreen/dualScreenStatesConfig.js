(function ( mw ) {
	"use strict";
	mw.dualScreen = mw.dualScreen || {};
	mw.dualScreen.states = [
		{
			'name': 'PiP',
			'initial': true,
			'invoke' : function(context)
			{
				if (context.previousState !== 'PiP')
				{
					this.enableUserActions();
					this.showDisplay();
					this.disableSideBySideView();
				}

				if (context.targetMainDisplayType && context.currentMainDisplayType !== context.targetMainDisplayType)
				{
					this.toggleMainDisplay();
				}

			}
		},
		{
			'name': 'SbS',
			'invoke' : function(context)
			{
				if (context.previousState !== 'SbS')
				{
					this.disableUserActions( );
					this.showDisplay();
					this.enableSideBySideView();
				}

				if (context.targetMainDisplayType && context.currentMainDisplayType !== context.targetMainDisplayType)
				{
					this.toggleSideBySideView();
					this.toggleMainDisplay();
				}
			}
		},
		{
			'name': 'hide',
			'invoke' : function(context)
			{
				if (context.previousState !== 'hide')
				{
					this.disableUserActions( );
					this.disableSideBySideView();
					this.hideDisplay( );
				}

				if (context.targetMainDisplayType && context.currentMainDisplayType !== context.targetMainDisplayType)
				{
					this.showDisplay( );
					this.toggleMainDisplay();
					this.hideDisplay( );
				}
			}
		}
	];

	mw.dualScreen.nativeAppStates = [
		{
			'name': 'PiP',
			'initial': true,
			'events': {
				'hide': {
					name: 'hide',
					action: function () {
						this.disableUserActions();
						this.hideDisplay( );
					}
				}
			}
		},
		{
			'name': 'hide',
			'events': {
				'PiP': {
					name: 'PiP',
					action: function (context) {
						if (this.getPrimary() === this.getAuxDisplay()) {
							this.showDisplay( );
							this.toggleMainDisplay();

						}
						this.enableUserActions();
						this.showDisplay( );
					}
				},
				'switchView': {
					name: 'hide',
					action: function () {
						this.showDisplay( );
						this.toggleMainDisplay();
						this.hideDisplay( );

					}
				}
			}
		}
	];
}

)( window.mw );