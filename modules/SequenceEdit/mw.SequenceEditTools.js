/**
 * Handles the "tools" window top level component driver 
 */

//Wrap in mw closure to avoid global leakage
( function( mw ) {
	
mw.SequenceEditTools = function( sequenceEdit ) {
	return this.init( sequenceEdit );
};

// Set up the mvSequencer object
mw.SequenceEditTools.prototype = {
	init: function(	sequenceEdit ){
		this.sequenceEdit = sequenceEdit;
	},
	defaultText : gM('mwe-sequenceedit-no_selected_resource'),
	tools:{
		'trim':{
			'title': gM('mwe-sequenceedit-cliptool-trim'),
			'editWidgets' : [ 'trimTimeline' ], 
			'editableAttributes' : ['clipBegin','dur' ],			
			'editActions' : ['preview', 'cancel']
		},
		'duration':{
			'title': gM('mwe-sequenceedit-cliptool-duration'),			 
			'editableAttributes' : [ 'dur' ],
			'editActions' : ['preview', 'cancel']
		}
	},
	editableAttributes:{
		'clipBegin':{
			'type': 'time',
			'title' : gM('mwe-sequenceedit-start-time' ),			
		},
		'dur' :{
			'type': 'time',
			'title' : gM('mwe-sequenceedit-clip-duration' ),			
		}
	},
	editableTypes: {
		'time' : {
			update : function( _this, smilClip, attributeName, value){
				// Validate time
				var seconds = _this.sequenceEdit.getSmil().parseTime( value );
				$j( smilClip ).attr( attributeName, mw.seconds2npt( seconds ) );
				// Update the clip duration :
				_this.sequenceEdit.getEmbedPlayer().getDuration( true );
				
				// Seek to "this clip" 
				_this.sequenceEdit.getEmbedPlayer().setCurrentTime( 
					$j( smilClip ).data('startOffset')
				);								
			},			
			getSmilVal : function( _this, smilClip, attributeName ){
				var smil = _this.sequenceEdit.getSmil();	
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
			'title' : gM('mwe-sequenceedit-preview'),
			'action': function( _this, smilClip, toolId){				
				_this.sequenceEdit.getPlayer().previewClip( smilClip );
			}
		},
		'cancel':{
			'icon': 'close',
			'title' : gM('mwe-cancel'),
			'action' : function( _this, smilClip, toolId){
				var tool = _this.tools[toolId];
				for( var i=0; i < tool.editableAttributes.length ; i++ ){
					var attributeName = tool.editableAttributes[i]; 
					var $editToolInput = $j('#' + _this.getEditToolId( toolId, attributeName ) );  					
					// Restore all original attribute values
					smilClip.attr( attributeName, $editToolInput.data('initialValue') );
				}
				
				// Update the clip duration :
				_this.sequenceEdit.getEmbedPlayer().getDuration( true );
				
				// Update the embed player
				_this.sequenceEdit.getEmbedPlayer().setCurrentTime( 
					$j( smilClip ).data('startOffset')
				);

				// Close / empty the toolWindow
				_this.sequenceEdit.getEditToolTarget().html(
					_this.defaultText
				)
			}
		}
	},
	editWidgets: {
		'trimTimeline':{
			'update': function( _this, target, smilClip ){				
				var smil = _this.sequenceEdit.getSmil();
				// Update the preview thumbs
				var clipBeginTime = $j('#editTool_trim_clipBegin').val();
				if( !clipBeginTime ){
					$j(target).find('.trimStartThumb').hide();
				} else {
					mw.log("Should update trimStartThumb::" +  $j(smilClip).attr('clipBegin') );
					// Render a thumbnail for relative start time = 0  
					smil.getLayout().drawElementThumb( 
						$j(target).find('.trimStartThumb'), 
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
						$j(target).find('.trimEndThumb'),
						smilClip,
						clipDur
					);
				}
				
				mw.log( "editWidgets::trimTimeline:update:: " + clipBeginTime + ' dur: ' + clipDur);
			},
			// Return the trimTimeline edit widget
			'draw': function( _this, target, smilClip ){
				var smil = _this.sequenceEdit.getSmil();
				// For now just have a thumbnail and a slider 
				$j(target).append(
					$j('<div />')					
					.addClass( 'trimStartThumb ui-corner-all' ),					
					$j('<div />')					
					.addClass( 'trimEndThumb ui-corner-all' ),
					$j('<div />').addClass('ui-helper-clearfix') 
				)			
				
				// Add a trim binding: 
				$j('#editTool_trim_clipBegin,#editTool_trim_dur').change(function(){
					_this.editWidgets.trimTimeline.update( _this, target, smilClip);
				})
				// Update the thumbnails:
				_this.editWidgets.trimTimeline.update( _this, target, smilClip);
				
				// get the clip full duration to build out the timeline selector
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
						.attr( 'id', _this.sequenceEdit.id + '_trimTimeline' )
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
								mw.log( 'slider1: ' +  ui.values[0] + ' - sldier two' + ui.values[1] + ' t: ' +  sliderToTime( ui.values[0] ) + ' t2: ' +  sliderToTime( ui.values[1]) );								
								$j('#editTool_trim_clipBegin').val( 
									mw.seconds2npt( sliderToTime( ui.values[0] ), true ) 
								);
								$j('#editTool_trim_dur').val(  
									mw.seconds2npt( sliderToTime( ui.values[1] ), true )
								);
							},
							change: function( event, ui ) {
								if( sliderValues[0] != ui.values[0] ){
									var attributeChanged = 'clipBegin';				
									sliderIndex = 0;							
								} else {
									var attributeChanged = 'dur';
									sliderIndex = 1;
								}								
								var attributeValue = sliderToTime( ui.values[ sliderIndex ] )
								sliderValues[ sliderIndex ] = ui.values[ sliderIndex ];
								
								// update start and end time: 
								_this.editableTypes['time'].update( _this, smilClip, attributeChanged, attributeValue)			

								// update the widget 
								_this.editWidgets.trimTimeline.update( _this, target, smilClip);
							}
						})
					);
				});
				// On resize event
				
				// Fill in timeline images
				
			}
		}
	},
	getEditToolId: function( toolId, attributeName){
		return 'editTool_' + toolId + '_' + attributeName;
	},
	drawClipEditTool: function( smilClip ){
		$target = this.sequenceEdit.getEditToolTarget();
 
		var toolId = '';
		// get the toolId based on what "ref type" smilClip is:
		switch( this.sequenceEdit.getSmil().getRefType( smilClip ) ){
			case 'video':
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
				icon_id: editAction.icon, 
				text: editAction.title
			})
			.css({
				'float': 'left',
				'margin': '5px'
			})
			.buttonHover()		
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
				'width': '150px',
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
				.sequenceEditInput( _this.sequenceEdit )
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