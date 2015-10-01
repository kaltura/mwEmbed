(function ( mw, $ ) {
	"use strict";
	mw.PluginManager.add( 'Paint', mw.KBaseScreen.extend( {
		setup: function(){
			//Plugin setup, all actions which needs to be done on plugin loaded and before playerReady event
			this.addBindings();
		},
		isSafeEnviornment: function(){

		},
		addBindings:function(){

		},
		
		addKeyboardShortcuts: function(){

		}
		
	} ) );
} ) ( window.mw, window.jQuery );	