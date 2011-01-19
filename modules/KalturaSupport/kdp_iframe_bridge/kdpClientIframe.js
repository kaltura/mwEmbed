// Simple kdpClientIframe
var kdpClientIframe = function( replaceTargetId, kEmbedSettings , options ){
	// Create a Player Manager
	return this.init(replaceTargetId, kEmbedSettings , options);
};
kdpClientIframe.prototype = {
	// Similar to jQuery.fn.kalturaIframePlayer in KalturaSupport/loader.js
	init: function( replaceTargetId, kEmbedSettings , options ){
		// Update options via target size if not set
		this.width = (options.width) ? options.width : $j( '#' + replaceTargetId ).width();
		this.height = (options.height) ? options.height : $j( '#' + replaceTargetId ).height();
		this.kEmbedSettings = kEmbedSettings;	
		this.targetId = replaceTargetId;
		
		// Now add the player proxy
		this.$iFrameProxy = $j('<div />').attr( 'id', this.targetId ).after( '#' + replaceTargetId );
		
		// Replace the target with an iframe player:
		$j( '#' + replaceTargetId ).replaceWith( this.getIframe() );
			
		
		this.addIframeMethods();
	},
	
	getIframe: function(){
		if(!this.$iframe ){

			var iframeSrc = SCRIPT_LOADER_URL.replace( 'ResourceLoader.php', 'mwEmbedFrame.php' );
			var kalturaAttributeList = { 'uiconf_id':1, 'entry_id':1, 'wid':1, 'p':1};
			for(var attrKey in this.kEmbedSettings ){
				if( attrKey in kalturaAttributeList ){
					iframeSrc+= '/' + attrKey + '/' + encodeURIComponent( this.kEmbedSettings[attrKey] );  
				}
			}
			alert( 'scr:'+ iframeSrc);
			
			// Add configuration to the hash tag:
			iframeSrc+= mw.getKalturaIframeHash();
			
			this.$iframe = $j('<iframe />').attr({
				'src' : iframeSrc,
				'id' :  this.targetId + '_iframe',
				'width' : this.width,
				'height' : 	this.height
			})
			.css('border', '0px');
		}
		return this.$iframe;
		
	},
	addIframeMethods: function(){
		
	}
}