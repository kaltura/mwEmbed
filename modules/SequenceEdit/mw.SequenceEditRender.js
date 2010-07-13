mw.SequenceEditRender = function( sequenceEditor ) {
	return this.init( sequenceEditor );
};

// Set up the mvSequencer object
mw.SequenceEditRender.prototype = {
	init: function( sequenceEditor ){
		this.sequenceEditor = sequenceEditor;
	},
	
	renderDialog: function(){
		var _this = this;
		
		var $renderDialog = mw.addDialog( 
			gM('mwe-sequenceedit-render-sequence'),
			$j('<div />').loadingSpinner()			
		)
		
		mw.load( ['AddMedia.firefogg','mw.FirefoggRender'], function(){
			$renderDialog
			.append( 					
				_this.getEmbedVideoRender()
			)			
		});		
	},
	
	getEmbedVideoRender: function(){
		var _this = this;
		return $j('<video />').css({
			'width': 400,
			'height': 300
		}).attr({
			'id' : 'firefoggRenderVideo',
			'type' : 'application/smil',
			'src' : _this.sequenceEditor.getSmilSource()
		}).embedPlayer(function(){
			// status area
			$j('#firefoggRenderVideo').after( 
				$j('<div />').attr('id', 'targetFoggStatus')		
			)
			
			// update the player smil to the latest from the editor
			$j('#firefoggRenderVideo').smil.$dom = _this.sequenceEditor.smil.$dom;
			// refresh the duration 
			$j('#firefoggRenderVideo').getDuration( true );
	
			// Setup the render 
			var foggRender = $j('#firefoggRenderVideo').firefoggRender({
				'statusTarget': '#targetFoggStatus'
			});
			if( foggRender.doRender() ){
				// stop render button
				$j('#firefoggRenderVideo').after( 
					$j('<div />').text('Stop Render').unbind().click(function(){
						foggRender.stopRender();						
					})
				)					
			}
		})	
	}
}