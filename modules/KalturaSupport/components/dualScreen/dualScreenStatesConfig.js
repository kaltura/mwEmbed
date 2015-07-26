(function ( mw ) {
	"use strict";
	mw.dualScreen = mw.dualScreen || {};
	mw.dualScreen.states = [
		{
			'name': 'PiP',
			'initial': true,
			'events': {
				'SbS': {
					name: 'SbS',
					action: function () {
						this.disableUserActions( );
						this.enableSideBySideView();

					}
				},
				'hide': {
					name: 'hide',
					action: function (  ) {
						this.disableUserActions( );
						this.hideDisplay( );
					}
				},
				'switchView': {
					name: 'PiP',
					action: function () {
						this.disableUserActions( );
						this.toggleMainDisplay();
						this.enableUserActions( );
					}
				}
			}
		},
		{
			'name': 'SbS',
			'events': {
				'PiP': {
					name: 'PiP',
					action: function () {
						this.enableUserActions( );
						this.disableSideBySideView();
					}
				},
				'hide': {
					name: 'hide',
					action: function () {
						this.disableSideBySideView();
						this.hideDisplay( );
					}
				},
				'switchView': {
					name: 'SbS',
					action: function () {
						this.toggleSideBySideView();
						this.toggleMainDisplay();
					}
				}
			}
		},
		{
			'name': 'hide',
			'events': {
				'PiP': {
					name: 'PiP',
					action: function () {
						this.enableUserActions( );
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
				},
				'SbS': {
					name: 'SbS',
					action: function () {
						this.enableSideBySideView();
						this.showDisplay( );
					}
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
					action: function (  ) {
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
					action: function () {
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