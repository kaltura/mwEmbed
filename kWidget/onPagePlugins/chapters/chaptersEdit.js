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
		
		// flag to control seeking on playhead updates:
		seekOnPlayHeadUpdate: false,
		
		// The current active cuePoint
		activeCuePoint: null,
		
		// Current time of the playhead
		currentTime: 0,
		
		init: function( kdp ){
			var _this = this;
			this.kdp = kdp;
			// init the cuePoints data controller with the current entryId:
			this.cuePoints = new kWidget.cuePointsDataController({
				'wid' : this.getAttr( 'configProxy.kw.id' ),
				'entryId' : this.getAttr( 'mediaProxy.entry.id' ),
				'tags' : this.getConfig('tags') || 'chaptering', // default cuePoint name
				'ks' : this.getConfig('ks'),
				// pass in customDataFields array
				'customDataFields': this.getConfig( 'customDataFields' ) ? 
					this.getConfig( 'customDataFields' ).split(',') : 
					[]
			});
				
			// setup app targets:
			this.$prop = this.getConfig( 'editPropId') ? 
					$('#' + this.getConfig( 'editPropId') ) : 
					$('<div>').insertAfter( kdp );
			
			this.$timeline =  this.getConfig( 'editTimelineId' ) ?
					$( '#' + this.getConfig( 'editTimelineId' ) ) : 
					$('<div>').insertAfter( this.$prop );
					
			// Add classes for css styles:
			this.$prop.addClass( 'k-prop' ).text('loading');
			this.$timeline.addClass( 'k-timeline' ).text('loading');
			
			// Add in default metadata: 
			this.cuePoints.load(function( status ){
				if( status.code ){
					_this.$timeline.empty();
					_this.$prop.empty();
					_this.handleDataError( status );
					return ;
				}
				
				_this.displayPropEdit();
				_this.refreshTimeline();
				_this.addTimelineBindings();
				// set the playhead at zero for startup ( without a seek )
				_this.updatePlayheadUi( 0 );
			});
		},
		displayPropEdit: function(){
			var _this = this;
			// check if we have a KS ( required for edit and display ) 
			// check if we have an active cuePoint
			if( this.activeCuePoint){
				this.showEditCuePoint(); 
			} else{
				this.showAddCuePoint();
			}
		},
		showEditCuePoint: function(){
			var _this = this;
			var cueTilte = this.activeCuePoint.get('text') ? 
					this.activeCuePoint.get('text').substr( 0, 20 ) : 
					this.activeCuePoint.get('id');
			this.$prop.empty().append(
				$('<h3>').text('Edit Chapter: ' + cueTilte ),
				this.getEditCuePoint( this.activeCuePoint ),
				$('<a>').addClass( "btn" ).text( "Update" ).click( function(){
					var _saveButton = this;
					$( this ).addClass( "disabled" ).text( 'saving ...' ).siblings('.btn').addClass( "disabled" );
					_this.cuePoints.update( _this.activeCuePoint.get(), function( data ){
						if( !_this.handleDataError( data ) ){
							return ;
						}
						// refresh timeline and re-display edit: :
						_this.setActiveEditCuePoint( data.id );
					});
				}),
				$( '<span>').text(' '),
				$('<a>').addClass( "btn" ).text( "Remove" ).click(function(){
					// update text to removing, disable self and sibling buttons
					$( this ).addClass( "disabled" ).text( 'removing ...' ).siblings('.btn').addClass( "disabled" );
					// issue a delete api call: 
					_this.cuePoints.remove( _this.activeCuePoint, function( data ){
						if( ! _this.handleDataError( data ) ){
							return ;
						}
						// refresh timeline:
						_this.refreshTimeline();
						// show add:
						_this.showAddCuePoint();
					});
				})
			);
		},
		showAddCuePoint: function(){
			var _this = this;
			var curCuePoint =  this.cuePoints.newCuePoint( {} );
			this.$prop.empty().append(
				$('<h3>').text( 'Add Chapter:' ),
				this.getEditCuePoint( curCuePoint ),
				$('<a>').addClass( "btn" ).text( "Add" ).click(function(){
					var _addButton = this;
					$( this ).addClass( "disabled" ).text( 'adding ...' );
					// insert the current cuePoint
					_this.cuePoints.add({
						'entryId': _this.getAttr( 'mediaProxy.entry.id' ),
						// Get direct mapping data:
						'startTime': curCuePoint.get( 'startTime' ),
						'partnerData': curCuePoint.get( 'partnerData' ),
						'text': curCuePoint.get('text')
					} , function( data ){
						if( ! _this.handleDataError( data ) ){
							return ;
						}
						_this.setActiveEditCuePoint( data.id );
					})
				})
			);
		},
		setActiveEditCuePoint: function( id ){
			this.deselectCuePoint();
			// set active: 
			this.activeCuePoint = this.cuePoints.getById( id );
			// refresh timeline:
			this.refreshTimeline();
			// switch to "edit" 
			this.showEditCuePoint();
			this.updatePlayhead( 
				this.activeCuePoint.get( 'startTime' ) / 1000
			);
		},
		handleDataError: function( data ){
			// check for errors; 
			if( !data || data.code ){
				this.$prop.find('.alert-error').remove();
				this.$prop.append(
					this.getError( data )
				);
				return false;
			}
			return true;
		},
		getError: function( errorData ){
			var error = {
				'title': "Error",
				'msg': "Unknown error"
			}
			switch( errorData.code ){
				case "SERVICE_FORBIDDEN":
					var win = ( self == top ) ? window : top;
					if( win.location.hash.indexOf( 'uiconf_id') ){
						error.title = "URL includes uiconf_id #config";
						error.msg = " Kaltura Secret can not be used with uiConf URL based config." +
								"Please save settings, and remove url based config"
						break;
					}
					error.title = "Missing Kaltura Secret";
					error.msg = "The chapters editor appears to be missing a valid kaltura secret." +
							" Please login."
					break;
				default:
					if( errorData.message ){
						error.msg = errorData.message
					}
					break;
			}
			return $('<div class="alert alert-error">' +
			  //'<button type="button" class="close" data-dismiss="alert">x</button>' +
			  '<h4>' + error.title + '</h4> ' +
			  error.msg  + 
			'</div>' );
		},
		getEditCuePoint: function( curCuePoint ){
			var _this = this;
			// get the edit table for the cuePoint
			$editTable = curCuePoint.getEditTable();
			// add special binding for time update: 
			$editTable.find( '.k-currentTime' )
			.off('blur')
			.on('blur', function(){
				// check if "editing a cue point" 
				if( _this.activeCuePoint ){
					_this.refreshTimeline();
				}
				_this.updatePlayhead( 
					kWidget.npt2seconds( $( this ).val() )
				);
			})
			return $editTable;
		},
		addTimelineBindings: function(){
			var _this = this;
			this.$timeline.click(function( event ){
				var clickTime;
				if( event.offsetX < _this.leftOffset ){
					clickTime = 0;
				} else{
					if( !event.offsetX ){
						event.offsetX = event.pageX - _this.$timeline.offset().left;
					}
					// update the playhead tracker
					clickTime = ( (event.offsetX - _this.leftOffset ) / _this.getTimelineWidth() ) *  _this.getAttr('mediaProxy.entry.duration');
				}
				_this.deselectCuePoint();
				// show add new 
				_this.showAddCuePoint();
				// update playhead
				_this.updatePlayhead( clickTime );
			});
			// add playhead tracker
			kdp.kBind('playerUpdatePlayhead', function( ct ){
				_this.updatePlayheadUi( ct );
			} )
		},
		updatePlayhead: function( time ){
			// update the current time: 
			this.currentTime = time;
			// seek to that time
			kdp.sendNotification( 'doSeek', time );
			// do the ui update
			this.updatePlayheadUi( time );
		},
		updatePlayheadUi: function( time ) {
			// time target:
			var timeTarget = (  time /  this.getAttr('mediaProxy.entry.duration') ) * this.getTimelineWidth();
			// update playhead on timeline:
			this.$timeline.find( '.k-playhead' ).css({
				'left': (  this.leftOffset + timeTarget)  + 'px'
			});
			// Check if we can update current time: 
			this.$prop.find( '.k-currentTime' ).val(
				kWidget.seconds2npt( time, true  )
			).trigger('change');
		},
		getTimelineWidth: function(){
			return ( this.$timeline.width() - this.leftOffset );
		},
		refreshTimeline: function(){
			this.$timeline.empty();
			var numOfTimeIncludes = 8;
			// have a max of 10 time listings across the width
			var listingWidth = this.$timeline.width() / numOfTimeIncludes;
			
			var docstext = "Click anywhere!!! within the timeline area to add a new chapter";
			
			console.log("cuePoints: "+this.cuePoints);
			if (this.cuePoints.length > 0) {
				docstext += ". Click any chapter marker to edit a chapter";
			}
			
			// draw main top level timeline
			this.$timeline.append(
				$('<div>').addClass( 'k-timeline-background' ),
				$('<div>').addClass( 'k-baseline'),
				$('<span>').addClass('k-timeline-docs').text(docstext)
			).css({
				'position': 'relative',
				'height': '100px'
			})
			
			// draw the playhead marker 
			this.$timeline.append( 
				$('<div>')
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
			
			// Draw all vertical measurement lines:
			var j =0; 
			for( var i = this.leftOffset; i< this.$timeline.width(); i+= ( listingWidth / 4 ) ){
				if( j == 0 ){
					var curMarker = i - this.leftOffset;
					var markerTime = ( curMarker / this.getTimelineWidth() ) * this.getAttr('mediaProxy.entry.duration');
					// append large marker
					this.$timeline.append(
						$('<div>').css({
							'position': 'absolute',
							'top': '25px',
							'left': i + 'px',
							'width' : '3px',
							'height': '14px',
							'background':'black'
						}),
						$('<span>').css({
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
						$('<div>').css({
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
			// draw the cuePoints: 
			this.drawCuePoints();
		},
		deselectCuePoint: function(){
			// make sure no other cuePoint is active: 
			this.$timeline.find( '.k-cuepoint').removeClass('active');
			this.displayPropEdit();
			this.activeCuePoint = null;
		},
		selectCuePoint: function( cuePoint ){
			var _this = this;
			// unselect other cuePoints:
			_this.deselectCuePoint();
			// activate the current :
			_this.activeCuePoint = cuePoint;
			$( '#k-cuepoint-' + cuePoint.get('id') ).addClass( 'active' );
			// update the cue point editor: 
			_this.displayPropEdit();
			// select the current cueTime 
			_this.updatePlayhead( cuePoint.get('startTime') / 1000 );
		},
		/**
		 * Draw all the cuePoints to the screen.
		 */
		drawCuePoints: function(){
			var _this = this;
			// remove all old cue points
			_this.$timeline.find( '.k-cuepoint').remove();
			$.each( this.cuePoints.get(), function( inx, curCuePoint){
				var cueTime = curCuePoint.get( 'startTime' ) / 1000;
				var timeTarget = (  cueTime /  _this.getAttr('mediaProxy.entry.duration') ) * _this.getTimelineWidth();
				var $cuePoint = $('<div>')
					.addClass( 'k-cuepoint' )
					.attr( 'id', 'k-cuepoint-' + curCuePoint.get('id') )
					.css({
						'left': (  _this.leftOffset + timeTarget)  + 'px'
					})
					.attr('title', curCuePoint.get('text') )
					.click(function(){
						// select the current cuePoint
						_this.selectCuePoint( curCuePoint );
						// don't propagate down to parent timeline:
						return false;
					})
				if( _this.activeCuePoint && _this.activeCuePoint.get('id') == curCuePoint.get('id') ){
					$cuePoint.addClass('active');
				}
				_this.$timeline.append(
					$cuePoint
				)
			});
		},
		getAttr: function( attr ){
			return this.kdp.evaluate( '{' + attr + '}' );
		},
		getConfig : function( attr ){
			return this.kdp.evaluate('{chaptersEdit.' + attr + '}' );
		}
	}

	/*****************************************************************
	 * Application initialization
	 ****************************************************************/
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
