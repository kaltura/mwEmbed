/**
 * ComscoreStreamingTag loader
 */
( function( mw ) { "use strict";
	mw.addKalturaPlugin( ["comscorestreamingtag"], 'comscorestreamingtag', function( embedPlayer, callback ){
		new mw.ComscoreStreamingTag( embedPlayer, callback );
	});
})( window.mw);

// New architecture
//( function( mw, $ ) {"use strict";
//	mw.PluginManager.add( 'ComscoreStreamingTag', mw.KBaseComponent.extend({
//		defaultConfig: {
//			cTagsMap:''
//		},
//		setup: function( embedPlayer ) {
//			var cTags = this.getConfig("cTagsMap") ;
//		}
//	}));
//} )( window.mw, window.jQuery );