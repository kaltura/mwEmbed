mw.SequencerRender = function( sequenceror ) {
	return this.init( sequenceror );
};

mw.SequencerRender.prototype = {
	init: function( sequenceror ){
		this.sequenceror = sequenceror;
	},
	
	renderDialog: function(){
		var _this = this;
		
		var $renderDialog = mw.addDialog( {
			'title' : gM('mwe-sequenceedit-render-sequence'),
			'content' : $j('<div />').loadingSpinner()			
		} )
		
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
			'src' : _this.sequenceror.getSmilSource()
		}).embedPlayer(function(){
			// status area
			$j('#firefoggRenderVideo').after( 
				$j('<div />').attr('id', 'targetFoggStatus')		
			)
			
			// update the player smil to the latest from the editor
			$j('#firefoggRenderVideo').smil.$dom = _this.sequenceror.smil.$dom;
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