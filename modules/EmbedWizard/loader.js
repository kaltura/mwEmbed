( function( mw, $ ) {
	// Add class file paths
	mw.addResourcePaths( {
		"mw.EmbedWizard" : "mw.EmbedWizard.js"
	});
	var EmbedWizardRequestSet = [
	     "EmbedPlayer",
         "mw.EmbedWizard",
         "$j.ui",
     	 "$j.widget",
     	 
         "$j.ui.accordion",
         "$j.ui.tabs"
    ];
	$.fn.embedWizard = function( options, callback ){
		var _this = this;
		$(this).loadingSpinner();
		mw.load( EmbedWizardRequestSet, function(){
			$(_this).find('.loadingSpinner').remove();
			$(_this).each( function( inx, node) {
				 node.embedWizard = new mw.EmbedWizard(node, options);
			 });
			 if( callback )
				 callback();
		});
		return this;
	};
})( mw, window.jQuery );