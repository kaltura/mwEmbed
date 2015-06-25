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
						this.hideMonitor( );
					}
				},
				'switchView': {
					name: 'PiP',
					action: function () {
						this.disableUserActions( );
						this.toggleMainMonitor();
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
						this.hideMonitor( );
					}
				},
				'switchView': {
					name: 'SbS',
					action: function () {
						this.toggleSideBySideView();
						this.toggleMainMonitor();
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
						this.showMonitor( );
					}
				},
				'switchView': {
					name: 'hide',
					action: function () {
						this.showMonitor( );
						this.toggleMainMonitor();
						this.hideMonitor( );

					}
				},
				'SbS': {
					name: 'SbS',
					action: function () {
						this.enableSideBySideView();
						this.showMonitor( );
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
						this.hideMonitor( );
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
						if (this.getPrimary() === this.getSecondMonitor()) {
							this.showMonitor( );
							this.toggleMainMonitor();

						}
						this.enableUserActions();
						this.showMonitor( );
					}
				},
				'switchView': {
					name: 'hide',
					action: function () {
						this.showMonitor( );
						this.toggleMainMonitor();
						this.hideMonitor( );

					}
				}
			}
		}
	];
}

)( window.mw );