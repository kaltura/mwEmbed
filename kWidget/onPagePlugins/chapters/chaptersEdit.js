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
			this.cuePoints = new cuePointsDataController({
				'wid' : this.getAttr( 'configProxy.kw.id' ),
				'entryId' : this.getAttr( 'mediaProxy.entry.id' ),
				'systemName' : this.getConfig('systemName') || 'chaptering', // default cuePoint name
				'ks' : this.getConfig('ks')
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
				// set the playhead at zero for startup:
				_this.updatePlayhead( 0 );
				// activate playhead seek: 
				_this.seekOnPlayHeadUpdate = true;
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
				$('<a>').addClass( "btn" ).text( "Save Changes" ).click( function(){
					var _saveButton = this;
					$( this ).addClass( "disabled" ).text( 'saving ...' ).siblings('.btn').addClass( "disabled" );
					_this.cuePoints.update( _this.activeCuePoint.get(), function( data ){
						if( !_this.handleDataError( data ) ){
							return ;
						}
					} );
				}),
				$( '<span>').text(' '),
				$('<a>').addClass( "btn" ).text( "Remove Chapter" ).click(function(){
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
			var curCuePoint =  new cuePoint( {} );
			this.$prop.empty().append(
				$('<h3>').text( 'Add Chapter:' ),
				this.getEditCuePoint( curCuePoint ),
				$('<a>').addClass( "btn" ).text( "Add" ).click(function(){
					var _addButton = this;
					$( this ).addClass( "disabled" ).text( 'adding ...' );
					// insert the current cuePoint
					_this.cuePoints.add({
						'entryId': _this.getAttr( 'mediaProxy.entry.id' ),
						'systemName': _this.getConfig( 'systemName' ),
						// Get direct mapping data:
						'startTime': curCuePoint.get( 'startTime' ),
						'partnerData': curCuePoint.get( 'partnerData' ),
						'text': curCuePoint.get('text')
					} , function( data ){
						if( ! _this.handleDataError( data ) ){
							return ;
						}
						_this.activeCuePoint = _this.cuePoints.getById( data.id );
						// refresh timeline:
						_this.refreshTimeline();
						// switch to "edit" 
						_this.showEditCuePoint();
					})
				})
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
					error.title = "Missing Kaltura Secret";
					error.msg = "The chapters editor appears to be missing a valid kaltura secret." +
							" Please retrive one from the <a target=\"_new\" href=\"http://www.kaltura.com/api_v3/testme/index.php\">api</a>," +
							"and add it to this widgets settings"
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
			$editTable.find( '.k-currentTime' ).blur(function(){
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
					// update the playhead tracker
					clickTime = ( (event.offsetX - _this.leftOffset ) / _this.getTimelineWidth() ) *  _this.getAttr('duration');
				}
				_this.deselectCuePoint();
				// show add new 
				_this.showAddCuePoint();
				// update playhead
				_this.updatePlayhead( clickTime );
			});
			// add playhead tracker
			kdp.kBind('playerUpdatePlayhead', function( ct ){
				_this.updatePlayhead( ct );
			} )
		},
		updatePlayhead: function( time ){
			// update the current time: 
			this.currentTime = time;
			// seek to that time
			if( this.seekOnPlayHeadUpdate ){
				kdp.sendNotification( 'doSeek', time );
			}
			// time target:
			var timeTarget = (  time /  this.getAttr('duration') ) * this.getTimelineWidth();
			// update playhead on timeline:
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
				$('<div>').addClass( 'k-baseline').css({
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
					var markerTime = ( curMarker / this.getTimelineWidth() ) * this.getAttr('duration');
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
			// select the current cueTime 
			_this.updatePlayhead( cuePoint.get('startTime') / 1000 );
			$( '#k-cuepoint-' + cuePoint.get('id') ).addClass( 'active' );
			// update the cue point editor: 
			_this.displayPropEdit();
		},
		/**
		 * Draw all the cuePoints to the screen.
		 */
		drawCuePoints: function(){
			var _this = this;
			// remove all old cue points
			_this.$timeline.find( '.k-cuepoint').remove();
			$.each( this.cuePoints.get(), function( inx, cuePoint){
				var cueTime = cuePoint.get( 'startTime' ) / 1000;
				var timeTarget = (  cueTime /  _this.getAttr('duration') ) * _this.getTimelineWidth();
				var $cuePoint = $('<div>')
					.addClass( 'k-cuepoint' )
					.attr( 'id', 'k-cuepoint-' + cuePoint.get('id') )
					.css({
						'left': (  _this.leftOffset + timeTarget)  + 'px'
					})
					.click(function(){
						// select the current cuePoint
						_this.selectCuePoint( cuePoint );
						// don't propagate down to parent timeline:
						return false;
					})
				if( _this.activeCuePoint && _this.activeCuePoint.get('id') == cuePoint.get('id') ){
					$cuePoint.addClass('active');
				}
				_this.$timeline.append(
					$cuePoint
				)
			});
		},
		getAttr: function( attr ){
			return kdp.evaluate( '{' + attr + '}' );
		},
		getConfig : function( attr ){
			return kdp.evaluate('{chaptersEdit.' + attr + '}' );
		}
	}
	
	/*****************************************************************
	 * Cue Points Data Controller
	 * 
	 * Keeps server, cuePoints in sync
	 ****************************************************************/
	
	/**
	 * Init the cuePointsDataController 
	 * @param entryId {string} The media entry id
	 * @param systemName {string} The controller cuePoint filter name
	 */
	var cuePointsDataController = function( settings ){
		return this.init( settings );
	}
	cuePointsDataController.prototype = {
		cuePoints: [],
		init: function( settings ){
			$.extend( this, settings);
			// setup api object
			this.api = new kWidget.api( this.wid, this.ks );
		},
		remove: function( removeCuePoint, callback ){
			var _this = this;
			var request = {
				'service': 'cuepoint_cuepoint',
				'action': 'delete',
				'id': removeCuePoint.get('id')
			}
			this.api.doRequest( request, function(data){
				// strange empty "success" 
				if( data.objectType == 'KalturaJsonSerializer' ){
					
				}
				for(var i=0; _this.cuePoints.length; i++ ){
					var curCuePoint = _this.cuePoints[i];
					if( curCuePoint.get( 'id' ) == removeCuePoint.get('id') ){
						 _this.cuePoints.splice( i, 1 );
						 break;
					}
				}
				callback( data );
			});
		},
		add: function( cuePointData, callback ){
			var _this = this;
			this.api.doRequest( $.extend( {}, this.getBaseRequest( cuePointData ), {
				'action': 'add',
			}), function( data ){
				if( !data.code && data.id ){
					_this.addCuePoint( data );
				}
				callback( data );
			});
		},
		update: function( cuePointData, callback ){
			this.api.doRequest( $.extend( {}, this.getBaseRequest( cuePointData ), {
				'action': 'update',
				'id' : cuePointData.id
			}), callback );
		},
		getBaseRequest: function( cuePointData ){
			var baseRequest = {
				'service': 'cuepoint_cuepoint', 
				'cuePoint:objectType':  'KalturaAnnotation',
				'cuePoint:tags': '',
			};
			// Add all local cuepoint data:
			$.each( cuePointData, function( key, val ){
				// make sure its a value we can edit: 
				if( $.inArray( key, ['createdAt'] ) !== -1 ){
					return true;
				}
				baseRequest[ 'cuePoint:' + key ] = val;
			});
			return baseRequest;
		},
		/**
		 * gets all active cuepoints
		 */
		get: function(){
			return this.cuePoints;
		},
		getById: function( id ){
			for(var i=0; this.cuePoints.length; i++ ){
				var curCuePoint = this.cuePoints[i];
				if( curCuePoint.get( 'id' ) == id ){
					return curCuePoint;
				}
			}
		},
		addCuePoint: function( rawCuePoint ){
			var newCuePoint =  new cuePoint( rawCuePoint)
			this.cuePoints.push( newCuePoint );
			return newCuePoint;
		},
		/**
		 * loads cuepoints from server
		 */
		load: function( callback ){
			var _this = this;
			// do an api request
			this.api.doRequest({
				'service': 'cuepoint_cuepoint',
				'action': 'list',
				'filter:entryIdEqual': this.entryId,
				'filter:objectType':'KalturaCuePointFilter',
				'filter:cuePointTypeEqual':	'annotation.Annotation'
			}, function( data ){
				if(  data.objects ){
					$.each( data.objects, function(inx, rawCuePoint){
						_this.addCuePoint( rawCuePoint );
					});
				}
				if( callback ) {
					callback( data );
				}
			})
		}
	}
	/**
	 * The cuePoint object, created with a raw db entry, supports edit views  
	 */
	var cuePoint =  function( rawCuePoint ){
		return this.init( rawCuePoint );
	}
	cuePoint.prototype = {
		init: function( rawCuePoint ){
			this.rawCuePoint = rawCuePoint;
		},
		inputMap: {
			'startTime': {
				'w': '100px',
				'msg': 'Start Time',
				'type': 'time',
				'getVal': function(){
					return kWidget.npt2seconds( this.$input.val() ) * 1000;
				}
			},
			'text':{
				'w': '150px',
				'msg': "Chapter title",
				'type': 'string',
				'getVal': function(){
					return this.$input.val();
				}
			},
			'partnerData': {
				'w': '150px',
				'msg': "JSON Custom data",
				'type': 'customData',
				'getVal': function(){
					return this.$input.val();
				}
			}
		},
		/**
		 * get a cuePoint property
		 */
		get: function( attr ){
			var _this = this;
			// sync input values if present: 
			$.each( this.inputMap, function( inputKey, inputMap ){
				_this.rawCuePoint[inputKey] = inputMap.getVal();
			});
			if(! attr ){
				return this.rawCuePoint;
			}
			return this.rawCuePoint[ attr ];
		},
		getInput: function( inputKey ){
			var _this = this;
			$input = $('<input>')
				.css( 'width', this.inputMap[ inputKey ].w )
				.attr({
					'type': 'text',
				})
				.val( this.rawCuePoint[ inputKey ] )
			// add any per type customizations 
			switch( inputKey ){
				case 'startTime':
					$input
					.addClass( 'k-currentTime' )
					.val( kWidget.seconds2npt( this.rawCuePoint[ inputKey ] / 1000, true ) )
				break;
			}
			return $input;
		},
		/**
		 * Get a series of edit rows
		 */
		getEditTable: function(){
			var _this = this;
			$table = $( '<table class="table table-bordered table-striped" >' );
			// map all input types:
			$.each( this.inputMap, function( inputKey, inputMap ){
				inputMap.$input = _this.getInput( inputKey );
				$table.append(
					$('<tr>').append(
						$( '<td>' ).text( inputMap.msg ),
						$( '<td>').append(
							inputMap.$input
						)
					)
				)
			});
			return $table;
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