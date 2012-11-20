kWidget.addReadyCallback( function( playerId ){
	var kdp = document.getElementById( playerId );
	/**
	 * The main chaptersEdit object:
	 */
	var chaptersEdit = function(kdp){
		return this.init(kdp);
	}
	chaptersEdit.prototype = {
		// the left offset of the cuepoint 
		leftOffset: 20,
		
		init: function( kdp ){
			this.kdp = kdp;
			// setup app targets: 
			this.$prop = this.getConfig( 'editPropId') ? 
					$('#' + this.getConfig( 'editPropId') ) : 
					$('<div />').insertAfter( kdp );
			
			this.$timeline =  this.getConfig( 'editTimelineId' )?
					$( '#' + this.getConfig( 'editTimelineId' ) ) : 
					$('<div />').insertAfter( this.$prop );
					
			// Add classes for css styles:
			this.$prop.addClass( 'k-prop' );
			this.$timeline.addClass( 'k-timeline' );
			
			// Add in default metadata: 
			this.displayPropEdit();
			this.refreshTimeline();
			this.addTimelineBindings();
			
			// set the playhead at zero for startup:
			this.updatePlayhead( 0 );
		},
		displayPropEdit: function(){
			// check if we have a KS 
			
			
			this.$prop.empty().append( 
				$('<h3 />').text( 'Add Chapter at:' ),
				$('<input type="text" size="15"/>')
					.addClass('k-currentTime'),
				$('<br />'),
				$('<button />').addClass('btn').text( 'Add')
			)
		},
		addTimelineBindings: function(){
			var _this = this;
			this.$timeline.click(function( event ){
				var clickTime;
				if( event.offsetX < _this.leftOffset ){
					clickTime = 0;
				} else{
					// update the playhead tracker
					clickTime = ( (event.offsetX - _this.leftOffset ) / _this.getTimelineWidth() ) *  _this.getAttr('duration');
				}
				// seek to that time
				kdp.sendNotification( 'doSeek', clickTime );
				// update playhead
				_this.updatePlayhead( clickTime );
			});
			// add playhead tracker
			kdp.kBind('playerUpdatePlayhead', function( ct ){
				_this.updatePlayhead( ct );
			} )
		},
		updatePlayhead: function( time ){
			var timeTarget = (  time /  this.getAttr('duration') ) * this.getTimelineWidth();
			this.$timeline.find( '.k-playhead' ).css({
				'left': (  this.leftOffset + timeTarget)  + 'px'
			})
			// Check if we can update current time: 
			this.$prop.find( '.k-currentTime' ).val(
				kWidget.seconds2npt( time, true  )
			)
		},
		getTimelineWidth: function(){
			return ( this.$timeline.width() - this.leftOffset );
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
					'top': '30px',
					'width' : '100%',
					'height': '2px',
					'background':'black'
				})
			).css({
				'position': 'relative',
				'height': '100px'
			})
			
			// draw the playhead marker 
			this.$timeline.append( 
				$('<div />')
				.addClass('k-playhead')
				.css({
					'position': 'absolute',
					'top': '25px',
					'left': this.leftOffset + 'px',
					'width' : '1px',
					'height': '60px',
					'background':'red'
				})	
			)
			
			// draw all vertical measurement lines
			var j =0; 
			for( var i = this.leftOffset; i< this.$timeline.width(); i+= ( listingWidth / 4 ) ){
				if( j == 0 ){
					var curMarker = i - this.leftOffset;
					var markerTime = ( curMarker / this.getTimelineWidth() ) * this.getAttr('duration');
					// append large marker
					this.$timeline.append(
						$('<div />').css({
							'position': 'absolute',
							'top': '25px',
							'left': i + 'px',
							'width' : '3px',
							'height': '14px',
							'background':'black'
						}),
						$('<span />').css({
							'position': 'absolute',
							'top': '5px',
							'margin-left': '-10px',
							'left': i + 'px',
							'width' : '70px',
							'height': '14px',
						}).text(
							kWidget.seconds2npt( markerTime )
						)
					);
				} else {
					this.$timeline.append(
						$('<div />').css({
							'position': 'absolute',
							'top': '30px',
							'left': i + 'px',
							'width' : '2px',
							'height': '8px',
							'background':'gray'
						})
					);
				}
				j++;
				if( j == 6 ){
					j= 0;
				}
			}
			// add buttons for adding a cuePoint
			
			// add cuePoint details:
			
			
		},
		getAttr: function( attr ){
			return kdp.evaluate( '{' + attr + '}' );
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