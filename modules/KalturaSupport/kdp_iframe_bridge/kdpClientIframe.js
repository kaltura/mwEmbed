// Simple kdpClientIframe

kdpClientIframe = function( replaceTargetId, kEmbedSettings , options ){
	// Create a Player Manager
	return this.init(replaceTargetId, kEmbedSettings , options);
};

kdpClientIframe.prototype = {
	// similar to jQuery.fn.kalturaIframePlayer in KalturaSupport/loader.js
	init: function( replaceTargetId, kEmbedSettings , options ){
	
		var iframeSrc = SCRIPT_LOADER_URL.replace( 'ResourceLoader.php', 'mwEmbedFrame.php' );
		var kalturaAttributeList = { 'uiconf_id':1, 'entry_id':1, 'wid':1, 'p':1};
		for(var attrKey in kEmbedSettings ){
			if( attrKey in kalturaAttributeList ){
				iframeSrc+= '/' + attrKey + '/' + encodeURIComponent( kEmbedSettings[attrKey] );  
			}
		}
		// Add configuration to the hash tag:
		iframeSrc+= mw.getKalturaIframeHash();
		
		// Update options via target size if not set
		options.width = (options.width) ? options.width : $j( '#' + replaceTargetId ).width();
		options.height = (options.height) ? options.height : $j( '#' + replaceTargetId ).height();

		
		
		$j( '#' + replaceTargetId ).replaceWith( this.getIframe() );
		
		// Now add proxy by replaceTargetId
		this.$iFrameProxy = $j('<div />').attr( 'id', replaceTargetId );
		
		this.addIframeMethods();
	},
	getIframe: function(){
		if(!this.$iframe ){
			this.$iframe = $j('<iframe />').attr({
				'src' : iframeSrc,
				'id' : replaceTargetId + '_iframe',
				'width' : options.width,
				'height' : 	options.height
			})
			.css('border', '0px');
		}
		return this.$iframe;
		
	},
	addIframeMethods: function(){
	}
}