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
			this.cuePoints = new cuePointsDataController(
				this.getAttr( 'configProxy.kw.id' ),
				this.getAttr( 'mediaProxy.entry.id' ),
				this.getConfig('parentName') || 'chaptering'
			);
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
			this.cuePoints.load(function(){
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
			this.$prop.empty().append(
				$('<h3>').text('Edit CuePoint:'),
				this.getEditCuePoint()
			);
		},
		showAddCuePoint: function(){
			var _this = this;
			this.activeCuePoint = null;
			this.$prop.empty().append( 
				$('<h3>').text( 'Add Chapter:' ),
				this.getEditCuePoint(),
			);
		},
		getEditCuePoint: function(){
			var _this = this;
			var curCuePoint = this.activeCuePoint || new cuePoint( {} )
			// get the edit table for the cuePoint
			$editTable = curCuePoint.getEditTable();
			// add special binding for time update: 
			$editTable.find( 'k-currentTime' ).blur(function(){
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
			
			// add buttons for adding a cuePoint
			
			// add cuePoint details:
			
		},
		deselectCuePoint: function(){
			// make sure no other cuePoint is active: 
			this.$timeline.find( '.k-cuepoint').removeClass('active');
			this.displayPropEdit();
			this.activeCuePoint = null
		},
		selectCuePoint: function( cuePoint ){
			var _this = this;
			// unselect other cuePoints:
			_this.deselectCuePoint();
			// activate the current :
			_this.activeCuePoint = cuePoint;
			// select the current cueTime 
			_this.updatePlayhead( cuePoint.get('startTime') / 1000 );
			$( '#k-cuepoint-' + cuePoint.id ).addClass( 'active' );
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
				console.log('cuePoint at: ' + cueTime);
				_this.$timeline.append(
					$('<div>')
					.addClass( 'k-cuepoint' )
					.attr( 'id', 'k-cuepoint-' + cuePoint.id )
					.css({
						'left': (  _this.leftOffset + timeTarget)  + 'px'
					})
					.click(function(){
						// select the current cuePoint
						_this.selectCuePoint( cuePoint );
						// don't propagate down to parent timeline:
						return false;
					})
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
	 * @param parentName {string} The controller cuePoint filter name
	 */
	var cuePointsDataController = function(wid, entryId, parentName ){
		return this.init( wid, entryId, parentName );
	}
	cuePointsDataController.prototype = {
		cuePoints: [],
		init: function( wid, entryId, parentName ){
			this.wid = wid;
			this.entryId = entryId;
			this.parentName = parentName;
			
			// setup api object
			this.api = new kWidget.api( this.wid );
		},
		add: function( cuePoint ){
			cuePoints.push( cuePoint );
		},
		/**
		 * gets all active cuepoints
		 */
		get: function(){
			return this.cuePoints;
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
				//'filter:cuePointTypeEqual':	'annotation.Annotation'
			}, function( data ){
				$.each( data.objects, function(inx, rawCuePoint){
					_this.cuePoints.push( new cuePoint( rawCuePoint) );
				});
				if( callback ) {
					callback();
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
		/**
		 * get a cuePoint property
		 */
		get: function( attr ){
			if(! attr ){
				return this.rawCuePoint;
			}
			return this.rawCuePoint[ attr ];
		},
		inputMap: {
			'startTime': {
				'w': '100px',
				'msg': 'Start Time',
				'type': 'time'
			},
			'text':{
				'w': '150px',
				'msg': "Chapter title",
				'type': 'string'
			},
			'partnerData': {
				'w': '150px',
				'msg': "JSON Custom data",
				'type': 'customData'
			}
		},
		getInput: function( inputKey ){
			var _this = this;
			$input = $('<input>')
				.css( 'width', this.inputMap[ inputKey ].w )
				.attr({
					'type': 'text',
				})
				.addClass( )
				.blur(function(){
					// Update the given input
					_this.rawCuePoint[inputKey] = $( this ).val();
				});
			// add any per type customizations 
			switch( inputKey ){
				case 'startTime':
					$input
					.addClass( 'k-currentTime' )
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
				$table.append(
					$('<tr>').append(
						$( '<td>' ).text( inputMap.msg ),
						$( '<td>').append(
							_this.getInput( inputKey )
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