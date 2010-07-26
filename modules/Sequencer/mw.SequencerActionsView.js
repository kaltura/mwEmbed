
/**
 * Handles actions for view menu 
 * such as view sequence xml 
 */

mw.SequencerActionsView = function( sequencer ) {
	return this.init( sequencer );
};

mw.SequencerActionsView.prototype = {
	init: function( sequencer ) {
		this.sequencer = sequencer; 
	},
	
	/**
	 * Sequencer "viewXml" action
	 * presents a dialog that displays the current smil xml document
	 */
	viewXML: function(){
		var _this = this;
		// For now just show the sequence output
		$viewSmilXmlDialog = mw.addDialog({
			'title' : gM('mwe-sequenceedit-menu-view-smilxml'),
			'dragable': true,	
			'height' : 480,
			'width' : 640,
			'resizable': true,		
			'content' : $j('<div />').append(
				// Add a loading div
				$j('<div />')
				.addClass('syntaxhighlighter_loader')
				.loadingSpinner(),
				
				$j('<pre />')				
				.addClass( 'brush: xml; ruler: true;' )
				.css({
					'display': 'none'
				})
				.html(    
					mw.escapeQuotesHTML( _this.sequencer.smil.getXMLString() ) 
				)
			)			
		})

		// load and run the syntax highlighter:
		$j( $viewSmilXmlDialog.find('pre') ).syntaxHighlighter( function(){
			$viewSmilXmlDialog.find('.syntaxhighlighter_loader').remove();
			$viewSmilXmlDialog.find('pre').fadeIn();
		});
		
	}
}
