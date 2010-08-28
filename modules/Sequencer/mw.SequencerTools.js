/**
 * Handles the "tools" window top level component driver 
 */

//Wrap in mw closure to avoid global leakage
( function( mw ) {
	
mw.SequencerTools = function( sequencer ) {
	return this.init( sequencer );
};

// Set up the mvSequencer object
mw.SequencerTools.prototype = {
	init: function(	sequencer ){
		this.sequencer = sequencer;
	},
	tools:{
		'trim':{
			'title': gM('mwe-sequencer-cliptool-trim'),
			'editWidgets' : [ 'trimTimeline' ], 
			'editableAttributes' : ['clipBegin','dur' ],			
			'editActions' : ['preview', 'cancel']
		},
		'duration':{
			'title': gM('mwe-sequencer-cliptool-duration'),			 
			'editableAttributes' : [ 'dur' ],
			'editActions' : ['preview', 'cancel']
		}
	},
	editableAttributes:{
		'clipBegin':{
			'type': 'time',
			'title' : gM('mwe-sequencer-start-time' ),			
		},
		'dur' :{
			'type': 'time',
			'title' : gM('mwe-sequencer-clip-duration' ),			
		}
	},
	editableTypes: {
		'time' : {
			update : function( _this, smilClip, attributeName, value){
				// Validate time
				var seconds = _this.sequencer.getSmil().parseTime( value );
				$j( smilClip ).attr( attributeName, mw.seconds2npt( seconds ) );
				// Update the clip duration :
				_this.sequencer.getEmbedPlayer().getDuration( true );
				
				// Seek to "this clip" 
				_this.sequencer.getEmbedPlayer().setCurrentTime( 
					$j( smilClip ).data('startOffset')
				);								
			},			
			getSmilVal : function( _this, smilClip, attributeName ){
				var smil = _this.sequencer.getSmil();	
				return mw.seconds2npt( 
						smil.parseTime( 
							$j( smilClip ).attr( attributeName ) 
						)
					);
			}
		}
	},
	editActions: {
		'preview' : {
			'icon' : 'play',
			'title' : gM('mwe-sequencer-preview'),
			'action': function( _this, smilClip, toolId ){				
				_this.sequencer.getPlayer().previewClip( smilClip );
				// xxx todo  update preview button to "pause" / "play" 
			}
		},
		'cancel':{
			'icon': 'close',
			'title' : gM('mwe-cancel'),
			'action' : function( _this, smilClip, toolId ){
				var tool = _this.tools[toolId];
				for( var i=0; i < tool.editableAttributes.length ; i++ ){
					var attributeName = tool.editableAttributes[i]; 
					var $editToolInput = $j('#' + _this.getEditToolId( toolId, attributeName ) );  					
					// Restore all original attribute values
					smilClip.attr( attributeName, $editToolInput.data('initialValue') );
				}
				
				// Update the clip duration :
				_this.sequencer.getEmbedPlayer().getDuration( true );
				
				// Update the embed player
				_this.sequencer.getEmbedPlayer().setCurrentTime( 
					$j( smilClip ).data('startOffset')
				);

				// Close / empty the toolWindow
				_this.sequencer.getEditToolTarget().html(
					_this.getDefaultText() 
				)
			}
		}
	},
	editWidgets: {
		'trimTimeline':{
			'update': function( _this, target, smilClip ){				
				var smil = _this.sequencer.getSmil();
				// Update the preview thumbs
				var clipBeginTime = $j('#editTool_trim_clipBegin').val();
				if( !clipBeginTime ){
					$j(target).find('.trimStartThumb').hide();
				} else {
					mw.log("Should update trimStartThumb::" +  $j(smilClip).attr('clipBegin') );
					// Render a thumbnail for relative start time = 0  
					smil.getLayout().drawElementThumb( 
						$j( target ).find('.trimStartThumb'), 
						smilClip, 
						0
					)
				}
				// Check the duration:
				var clipDur = $j('#editTool_trim_dur').val();
				if( clipDur ){
					mw.log("Should update trimStartThumb::" +  $j(smilClip).attr('clipBegin') );
					// Render a thumbnail for the updated duration  
					smil.getLayout().drawElementThumb( 
						$j( target ).find('.trimEndThumb'),
						smilClip,
						clipDur
					);
				}
				
				mw.log( "editWidgets::trimTimeline:update:: " + clipBeginTime + ' dur: ' + clipDur);
			},
			// Return the trimTimeline edit widget
			'draw': function( _this, target, smilClip ){
				var smil = _this.sequencer.getSmil();
				// check if thumbs are supported 
				if( _this.sequencer.getSmil().getRefType( smilClip ) == 'video' ){ 
					$j(target).append(
						$j('<div />')					
						.addClass( 'trimStartThumb ui-corner-all' ),					
						$j('<div />')					
						.addClass( 'trimEndThumb ui-corner-all' ),
						$j('<div />').addClass('ui-helper-clearfix') 
					)			
				}
				
				// Add a trim binding: 
				$j('#editTool_trim_clipBegin,#editTool_trim_dur').change(function(){
					_this.editWidgets.trimTimeline.update( _this, target, smilClip);
				})
				// Update the thumbnails:
				_this.editWidgets.trimTimeline.update( _this, target, smilClip);
				
				// Get the clip full duration to build out the timeline selector
				smil.getBody().getClipAssetDuration( smilClip, function( fullClipDuration ) {
					
					var sliderToTime = function( sliderval ){
						return parseInt( fullClipDuration * ( sliderval / 1000 ) );
					}
					var timeToSlider = function( time ){
						return parseInt( ( time / fullClipDuration ) * 1000 );
					}
					var startSlider = timeToSlider( smil.parseTime( $j('#editTool_trim_clipBegin').val() ) );
					var sliderValues = [
					    startSlider,
					    startSlider + timeToSlider( smil.parseTime( $j('#editTool_trim_dur').val() ) )
					];										
					// Return a trim tool binded to smilClip id update value events. 
					$j(target).append(
						$j('<div />')
						.attr( 'id', _this.sequencer.id + '_trimTimeline' )
						.css({
							'width': '100%',
							'margin': '5px'
						})
						.slider({
							range: true,
							min: 0,
							max: 1000,
							values: sliderValues,
							slide: function(event, ui) {															
								$j('#editTool_trim_clipBegin').val( 
									mw.seconds2npt( sliderToTime( ui.values[0] ), true ) 
								);
								$j('#editTool_trim_dur').val(  
									mw.seconds2npt( sliderToTime( ui.values[1] - ui.values[0] ), true )
								);
							},
							change: function( event, ui ) {
								var attributeValue = 0, sliderIndex  = 0;
								if( sliderValues[0] != ui.values[0] ){
									var attributeChanged = 'clipBegin';				
									sliderIndex = 0;
									attributeValue = sliderToTime( ui.values[ 0 ] )
								} else {
									var attributeChanged = 'dur';
									sliderIndex = 1;
									attributeValue = sliderToTime( ui.values[ 1 ]- ui.values[0] )
								}																
								sliderValues[ sliderIndex ] = ui.values[ sliderIndex ];
								
								// update start and end time: 
								_this.editableTypes['time'].update( _this, smilClip, attributeChanged, attributeValue)			

								// update the widget 
								_this.editWidgets.trimTimeline.update( _this, target, smilClip);
								
								// Register the edit state for undo / redo 
								_this.sequencer.getActionsEdit().registerEdit();
								
							}
						})
					);
				});
				// On resize event
				
				// Fill in timeline images
				
			}
		}
	},
	getDefaultText: function(){
		return  gM('mwe-sequencer-no_selected_resource');
	},
	getEditToolId: function( toolId, attributeName){
		return 'editTool_' + toolId + '_' + attributeName;
	},	
	
	drawClipEditTools: function( $target, smilClip){
	
		var toolId = '';
		// get the toolId based on what "ref type" smilClip is:
		switch( this.sequencer.getSmil().getRefType( smilClip ) ){
			case 'video':
			case 'audio':
				toolId = 'trim';
			break;
			default:
				toolId = 'duration';
			break;
		}
		
		
		// Make sure the toolid exists
		if( !this.tools[ toolId ] ){
			mw.log("Error: tool " + toolId + ' not found');
			return ;
		}
		var tool = this.tools[ toolId ];
		
		// Append the title: 
		$target.empty().append(
			$j('<div />').addClass( 'editToolsContainer' )
			,
			$j('<h3 />' ).append( 
				tool.title 
			)
		);
						
		// Build out the attribute  list:
		for( var i=0; i < tool.editableAttributes.length ; i++ ){
			attributeName = tool.editableAttributes[i];
			$target.append( 
				this.getEditableAttribute( smilClip, toolId, attributeName )
			);
		}
		
		// output a float divider: 
		$target.append( $j('<div />').addClass('ui-helper-clearfix') );
		
		// Build out widgets 
		if( tool.editWidgets ){
			for( var i =0 ; i < tool.editWidgets.length ; i ++ ){
				var editWidgetId = tool.editWidgets[i];
				if( ! this.editWidgets[editWidgetId] ){
					mw.log("Error: not recogonized widget: " + editWidgetId);
					continue;
				}
				// Append a target for the edit widget:
				$target.append( 
					$j('<div />')
					.attr('id', 'editWidgets_' + editWidgetId)
				);			
				// Draw the binded widget:
				this.editWidgets[editWidgetId].draw( 
					this, 
					$j( '#editWidgets_' + editWidgetId ),
					smilClip
				)
				// Output a float divider: 
				$target.append( $j('<div />').addClass( 'ui-helper-clearfix' ) );
			}	
		}				
		
		// Build out edit Actions buttons		
		for( var i=0; i < tool.editActions.length ; i++){
			var editActionId = tool.editActions[i];
			$target.append( 
				this.getEditAction( smilClip, toolId, editActionId )
			)	
		}
	},
	getEditAction: function( smilClip, toolId, editActionId ){		
		if(! this.editActions[ editActionId ]){
			mw.log("Error: getEditAction: " + editActionId + ' not found ');
			return ;
		}
		var _this = this;
		var editAction = this.editActions[ editActionId ];
		$actionButton = $j.button({
				icon: editAction.icon, 
				text: editAction.title
			})
			.css({
				'float': 'left',
				'margin': '5px'
			})
			.click( function(){
				editAction.action( _this, smilClip, toolId );
			})
		return $actionButton;
	},
	getEditableAttribute: function( smilClip, toolId, attributeName ){
		if( ! this.editableAttributes[ attributeName ] ){
			mw.log("Error: editableAttributes : " + attributeName + ' not found');
			return; 
		}
		var _this = this;
		var editAttribute = this.editableAttributes[ attributeName ];
		var editType = editAttribute.type;
		
		var initialValue =  _this.editableTypes[ editType ].getSmilVal(
			_this, 
			smilClip, 
			attributeName
		);
		return $j( '<div />' )
			.css({
				'float': 'left',
				'font-size': '12px',
				'width': '160px',
				'border': 'solid thin #999',
				'background-color': '#EEE',
				'padding' : '2px',
				'margin' : '5px'
			})
			.addClass('ui-corner-all')
			.append( 
				$j('<span />')
				.css('margin', '5px')
				.text( editAttribute.title ),
				
				$j('<input />')
				.attr( {
					'id' : _this.getEditToolId( toolId, attributeName),
					'size': 6
				})
				.data('initialValue', initialValue )
				.sequencerInput( _this.sequencer )
				.val( initialValue )
				.change(function(){					
					// Run the editableType update function: 
					_this.editableTypes[ editType ].update( 
							_this, 
							smilClip, 
							attributeName, 
							$j( this ).val() 
					);				
					// widgets can bind directly to this change action. 					
				})
			);
	}		
}

} )( window.mw );