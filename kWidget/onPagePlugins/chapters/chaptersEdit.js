kWidget.addReadyCallback( function( playerId ){
	var kdp = document.getElementById( playerId );
	/**
	 * The main chaptersEdit object:
	 */
	var chaptersEdit = function(kdp){
		return this.init(kdp);
	}
	chaptersEdit.prototype = {
		init: function( kdp ){
			this.kdp = kdp;
			// setup app targets: 
			this.$prop = this.getConfig( 'editPropId') ? 
					$('#' + this.getConfig( 'editPropId') ) : 
					$('<div />').insertAfter( kdp );
			
			this.$timeline =  this.getConfig( 'editTimelineId' )?
					$('#' + this.getConfig('editTimelineId') ) : 
					$('<div />').insertAfter( this.$prop );
					
			// Add classes for css styles:
			this.$prop.addClass( 'k-prop' );
			this.$timeline.addClass( 'k-timeline' );
			
			// Add in default metadata: 
			this.$prop.empty().append( 
				$('<span />').text( 'Select a chapter to edit it' )	
			)
			this.refreshTimeline();
		},
		refreshTimeline: function(){
			this.$timeline.empty();
			var numOfTimeIncludes = 8;
			// have a max of 10 time listings across the width
			var listingWidth = this.$timeline.width() / numOfTimeIncludes;
			// draw main top level timeline
			this.$timeline.append(
				$('<div />').addClass( 'k-baseline').css({
					'position': 'absolute',
					'top': '25px',
					'width' : '100%',
					'height': '2px',
					'background':'black'
				})
			).css({
				'position': 'relative',
				'height': '100px'
			})
			// draw all measurement lines
		},
		getConfig : function( attr ){
			return kdp.evaluate('{chaptersEdit.' + attr + '}' );
		}
	}
	
	// make sure we have jQuery, and invoke the plugin at media ready time::
	window['chaptersEditMediaReady'] = function(){
		// make sure we have jQuery
		if( !window.jQuery ){
			kWidget.appendScriptUrl( '//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js', function(){
				new chaptersEdit(kdp) 
			});
			return ;
		}
		new chaptersEdit(kdp);
	};
	kdp.addJsListener( "mediaReady", "chaptersEditMediaReady" );
});