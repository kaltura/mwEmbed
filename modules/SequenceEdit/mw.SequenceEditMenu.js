// Wrap in mw closure to avoid global leakage
( function( mw ) {
	
mw.SequenceEditMenu = function( sequenceEdit ) {
	return this.init( sequenceEdit );
};

// Set up the mvSequencer object
mw.SequenceEditMenu.prototype = {
		
	init: function( sequenceEdit ){
		this.sequenceEdit = sequenceEdit 
	},
	drawMenu:function(){
		var _this = this;
		var $menuTarget = this.sequenceEdit.getMenuTarget();	
		$menuTarget.empty()
		// check if we should have a save button
		if(false){
			$menuTarget.append(
				$j.button({
					'text' : gM('mwe-sequenceedit-save-sequence'),
					'icon_id': 'disk'
				})
				.buttonHover()
			)
		}
		
		// check if we should have a render button
		if(true){
			$menuTarget.append(
				$j.button({
					'text' : gM('mwe-sequenceedit-render-sequence'),
					'icon_id': 'video'
				})
				.buttonHover()
				.click(function(){
					_this.sequenceEdit.getRender().renderDialog();
				})
			)
		}
		
		// check if we should include credits
		if( mw.getConfig( 'SequenceEdit.KalturaAttribution' ) ){
			if( true ){
				$menuTarget.append(
					$j('<span />')
					.css( 'float', 'right' )
					.append( 
						gM('mwe-sequenceedit-sequencer_credit_line',
							'http://kaltura.com',
							'http://wikimedia.org'
						)
					)
				)
			}
		}
	},
	
};

} )( window.mw );