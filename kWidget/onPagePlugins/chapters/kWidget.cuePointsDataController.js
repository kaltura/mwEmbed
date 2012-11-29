/*****************************************************************
 * Cue Points Data Controller
 * 
 * Keeps server, cuePoints in sync
 ****************************************************************/
/**
 * Init the cuePointsDataController 
 * @param settings {object} Settings object includes wid, ks, entryId
 */
(function(kWidget){ "use strict"
	kWidget.cuePointsDataController = function( settings ){
		return this.init( settings );
	}
	kWidget.cuePointsDataController.prototype = {
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
				if( data && !data.code ){
					_this._removeCuePointById( removeCuePoint.get('id') )
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
					_this._addCuePoint( data );
				}
				callback( data );
			});
		},
		newCuePoint: function( rawCuePoint ){
			return new cuePoint( rawCuePoint );
		},
		update: function( cuePointData, callback ){
			var _this = this;
			this.api.doRequest( $.extend( {}, this.getBaseRequest( cuePointData ), {
				'action': 'update',
				'id' : cuePointData.id
			}), function( data ){
				if( !data.code && data.id ){
					_this._updateCuePoint( data );
				}
				callback( data );
			} );
		},
		getBaseRequest: function( cuePointData ){
			var baseRequest = {
				'service': 'cuepoint_cuepoint', 
				'cuePoint:objectType':  'KalturaAnnotation',
				'cuePoint:tags': this.tags
			};
			// List of cuePoint properties we don't send in api request:
			var excludeList = ['systemName', 'parentId','userId','updatedAt', 'createdAt', 'endTime'];
			// Add all local cuepoint data:
			$.each( cuePointData, function( key, val ){
				// make sure its a value we can edit: 
				if( $.inArray( key, excludeList  ) !== -1 ){
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
		/**
		 * Private methods to modify this.cuePoints should not be called outside 
		 * of cuePointsDataController
		 */
		_addCuePoint: function( rawCuePoint ){
			var newCuePoint =  new cuePoint( rawCuePoint)
			this.cuePoints.push( newCuePoint );
			return newCuePoint;
		},
		_updateCuePoint: function( rawCuePoint ){
			// update in place:
			for(var i=0; i < this.cuePoints.length; i++ ){
				var curCuePoint = this.cuePoints[i];
				if( curCuePoint && curCuePoint.get( 'id' ) == rawCuePoint.id ){
					curCuePoint.updateRawCuepoint( rawCuePoint );
					return true;
				}
			}
			// create "new" with updated data:
			return newCuePoint;
		},
		_removeCuePointById: function( id ){
			for(var i=0; i < this.cuePoints.length; i++ ){
				var curCuePoint = this.cuePoints[i];
				if( curCuePoint && curCuePoint.get( 'id' ) == id ){
					 this.cuePoints.splice( i, 1 );
					 return true;
				}
			}
			// could not find the target cuepoint
			return false;
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
				'filter:cuePointTypeEqual':	'annotation.Annotation',
				'filter:tagsLike' : this.tags
			}, function( data ){
				if(  data.objects ){
					$.each( data.objects, function(inx, rawCuePoint){
						_this._addCuePoint( rawCuePoint );
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
	 * Only exposed via cuePointsDataController ( no global define )
	 */
	var cuePoint =  function( rawCuePoint ){
		return this.init( rawCuePoint );
	}
	cuePoint.prototype = {
		/**
		 * The base input class ( extended by input map values ) 
		 */
		baseInput: {
			'w': '150px',
			'type': 'string',
			'getHR': function(val){
				return ( val == null || val == 'null' )? '': val ;
			},
			'getVal': function(){
				return this.$input.val();
			}
		},
		/**
		 * Input mape for all cuePoints special classes
		 */
		inputMap: {
			'startTime': {
				'w': '100px',
				'msg': 'Start Time',
				'type': 'time',
				'getHR': function( val ){
					return kWidget.seconds2npt( val / 1000, true );
				},
				'getVal': function(){
					return kWidget.npt2seconds( this.$input.val() ) * 1000;
				}
			},
			'text':{
				'msg': "Chapter title",
			},
			'partnerData': {
				'msg': "Aditional Data",
				'multiInput': true,
				'defaultSet': {
					'desc': 'Chapter description'
				}
			}
		},
		init: function( rawCuePoint ){
			var _this = this;
			this.rawCuePoint = rawCuePoint;
			
			// Buid out the inputMap objects
			$.each( this.inputMap, function( inputKey, inputObj ){
				_this.inputMap[inputKey] = $.extend( {}, _this.baseInput, inputObj );
			})
		},
		updateRawCuepoint: function( rawCuePoint ){
			this.rawCuePoint = rawCuePoint;
		},
		/**
		 * get a cuePoint property
		 */
		get: function( attr ){
			var _this = this;
			if(! attr ){
				return this.rawCuePoint;
			}
			return this.rawCuePoint[ attr ];
		},
		getInput: function( inputKey ){
			var _this = this;
			var $input = $('<input>')
				.css( 'width', this.inputMap[ inputKey ].w )
				.attr({
					'type': 'text',
				})
				.val( this.inputMap[ inputKey ].getHR( _this.rawCuePoint[ inputKey ] ) )
				.change(function(){
					_this.rawCuePoint[ inputKey ]  = _this.inputMap[ inputKey ].getVal(); 
				})
			// add class for startTime
			if( inputKey == 'startTime' ){
				$input.addClass('k-currentTime');
			}
			return $input;
		},
		/**
		 * Get a series of edit rows
		 */
		getEditTable: function(){
			var _this = this;
			var $table = $( '<table class="table table-bordered table-striped" >' );
			// map all input types:
			$.each( this.inputMap, function( inputKey, inputMap ){
				if( inputMap.multiInput ){
					// append a description row:
					$table.append(
						$('<tr>').append(
							$( '<td>' ).attr('colspan', 2).text( inputMap.msg )
						)
					)
				} else {
					inputMap.$input = _this.getInput( inputKey );
					$table.append(
						$('<tr>').append(
							$( '<td>' ).text( inputMap.msg ),
							$( '<td>').append(
								inputMap.$input
							)
						)
					)
				}
			});
			return $table;
		}
	}
})( window.kWidget );