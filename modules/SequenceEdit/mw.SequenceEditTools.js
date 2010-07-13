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
		/*'apply' :{
			'icon' : 'check',
			'title' : gM('mwe-sequenceedit-apply-changes'),
			'action': function( _this, smilClip, toolId){
				mw.log( "editActions:: changes already applied" );
				_this.sequenceEdit.getEditToolTarget().html(
					_this.defaultText
				)
			}
		},*/
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
					// close / empty the toolWindow
				}
				_this.sequenceEdit.getEditToolTarget().html(
					_this.defaultText
				)
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
				toolId = 'trim'
			break;
			default:
				toolId = 'duration'
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
		
		// Build out widgets 
		//if( tool.editWidgets ){
		//for( var i =0 ; i < tool.editWidgets.length ; i ++ ){			
		//}	
		//}
		
		// Build out the attribute  list:
		for( var i=0; i < tool.editableAttributes.length ; i++ ){
			attributeName = tool.editableAttributes[i];
			$target.append( 
				this.getEditableAttribute( smilClip, toolId, attributeName )
			);
		}
		// output a float divider: 
		$target.append( $j('<div />').addClass('ui-helper-clearfix') );
		
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
			.append( 
				$j('<span />')
				.css('margin', '5px')
				.text( editAttribute.title ),
				
				$j('<input />')		
				.attr( {
					'id' : _this.getEditToolId( toolId, attributeName),
					'size': 5
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
				})
			);
	},	
	
	/*drawTrimClipTool: function( clipNode ){
		$target = this.sequenceEdit.getToolTarget();
		$target.empty().append(
			$j('<div />')
			.addClass("toolTarget")
			.append( 
				$j('<h3 />').text( 
					
				),	
				// Width of the container images thumbs set-in-out
				
				$j('<div />')
				.addClass("ui-helper-clearfix"),
				// Start time and end time text:
				$j( '<div />' )
					.css({
						'float': 'left',
						'width': '200px',
						'background-color': '#AAA'
					})
					.append( 
						$j('<span />')
						.text( gM('mwe-sequenceedit-start-time') ),
						$j('<input />')
						.attr('size', 5)
					)
				)
			)			
		)
	}*/
}

} )( window.mw );