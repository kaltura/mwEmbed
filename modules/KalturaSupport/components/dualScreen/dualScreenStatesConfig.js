(function ( mw, $ ) {
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
						this.disableMonitorFeatures( );
						this.enableSideBySideView();

					}
				},
				'hide': {
					name: 'hide',
					action: function (  ) {
						this.disableMonitorFeatures( );
						this.hideMonitor( this.getSecondMonitor().obj );
					}
				},
				'switchView': {
					name: 'PiP',
					action: function () {
						this.disableMonitorFeatures( );
						this.toggleMainMonitor();
						this.enableMonitorFeatures( );
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
						this.enableMonitorFeatures( );
						this.disableSideBySideView();
					}
				},
				'hide': {
					name: 'hide',
					action: function () {
						this.disableSideBySideView();
						this.hideMonitor( this.getSecondMonitor().obj );
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
						this.enableMonitorFeatures( );
						this.showMonitor( this.getSecondMonitor().obj );
					}
				},
				'switchView': {
					name: 'hide',
					action: function () {
						this.showMonitor( this.getSecondMonitor().obj );
						this.hideMonitor( this.getFirstMonitor().obj );
						this.toggleMainMonitor();
					}
				},
				'SbS': {
					name: 'SbS',
					action: function () {
						this.enableSideBySideView();
						this.showMonitor( this.getSecondMonitor().obj );
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
						this.disableMonitorFeatures();
						this.hideMonitor( this.getSecondMonitor().obj );
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

							this.toggleMainMonitor();
							this.showMonitor( this.getFirstMonitor().obj );
						}
						this.enableMonitorFeatures();
						this.showMonitor( this.getSecondMonitor().obj );
					}
				},
				'switchView': {
					name: 'hide',
					action: function () {
						this.showMonitor( this.getSecondMonitor().obj );
						this.hideMonitor( this.getFirstMonitor().obj );
						this.toggleMainMonitor();
					}
				}
			}
		}
	];
}

)( window.mw, window.jQuery );