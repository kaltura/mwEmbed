/**
 * Created by itayk on 8/18/14.
 */
( function( mw, $ ) {"use strict";
	mw.PluginManager.add( 'mapplaymanifestdata', mw.KBasePlugin.extend({
		setup: function(){
			this.addBindings();
		},
		addBindings: function(){
			var _this = this;
			this.bind("SourceSelected", function(event,source){
				if (  source.src && source.src.toLowerCase().indexOf("playmanifest") > -1 ) {
					var partnerMatch = source.src.match(/\/p\/([0-9]*)/);
					if (partnerMatch && partnerMatch.length >1){
						_this.embedPlayer.kpartnerid = partnerMatch[1];
					}
					var entryMatch = source.src.match(/\/entryId\/([0-9_a-zA-Z]*)/);
					if (entryMatch && entryMatch.length >1){
						_this.embedPlayer.kentryid = entryMatch[1];
					}
				}
			});
		}
	}));
} )( window.mw, window.jQuery );