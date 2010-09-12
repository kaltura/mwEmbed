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
	
	// The current smil clip ( lazy init )
	currentsmilElement: null,
	
	// The current selected tool ( lazy init )
	currentToolId: null,
	
	// JSON tools config
	tools:{
		'trim':{
			'editWidgets' : [ 'trimTimeline' ], 
			'editableAttributes' : ['clipBegin','dur' ],			
			'contentTypes': ['video', 'audio']
		},			
		'duration':{			 
			'editableAttributes' : [ 'dur' ],
			'contentTypes': ['img', 'cdata_html', 'mwtemplate']
		},
		'panzoom' : {
			'editWidgets' : ['panzoom'],
			'editableAttributes' : [ 'panZoom' ],
			'contentTypes': [ 'img'], // xxx todo add video support
			'animate' : 'true'
		},
		'templateedit':{
			'editWidgets' : ['edittemplate'],
			'editableAttributes' : [ 'apititlekey' ],
			'contentTypes' : ['mwtemplate']
		},
		'transitions' : {
			'editableAttributes' : [ 'transIn', 'transOut' ],
			'contentTypes': ['video', 'img', 'mwtemplate' ]
		}
	},
	editableAttributes:{		
		'clipBegin':{
			'type': 'time',
			'title' : gM('mwe-sequencer-start-time' )		
		},
		'dur' :{
			'type': 'time',
			'title' : gM('mwe-sequencer-clip-duration' )
		},
		'panZoom' :{
			'type' : 'string',
			'inputSize' : 15,
			'title' : gM('mwe-sequencer-clip-panzoom' ),
			'defaultValue' : '0%, 0%, 100%, 100%'
		},
		'apititlekey' : {
			'type' : 'string',
			'inputSize' : 30,
			'title' : gM('mwe-sequencer-template-name' )
		},
		'transIn' : {
			'type' : 'select',
			'selectValues' : [ 'fadeFromColor' ]
		}, 
		'transOut' : {
			'type' : 'select',
			'selectValues' : [ 'fadeFromColor', 'crossfade' ]
		},
		// Special child node type
		'param' : {
			'type' : 'childParam',
			'inputSize' : 30
		}
	},
	editableTypes: {
		'childParam': {
			update: function( _this, smilElement, paramName, value){				
				// Check if the param already exists
				$paramNode = $j( smilElement ).find( "[name='"+ paramName + "']" );				
				if( $paramNode.length == 0){
					$j( smilElement ).append(
						$j('<param />').attr({
							'name': paramName,
							'value' : value
						})
					)
				} else {
					// Update the param value
					$paramNode.attr( 'value', value);
				}
				mw.log("editableTypes::Should have updated smilElement param: " + paramName 
						+ ' to : ' + $j( smilElement ).find( "[name='"+ paramName + '"]' ).attr( 'value') );				
			},
			getSmilVal: function( _this, smilElement, paramName ){							
				$paramNode =  $j( smilElement ).find( "[name='"+ paramName + "']" );
				if( $paramNode.length == 0){
					return '';
				}
				return $paramNode.attr('value');
			}
		},
		'string': {
			update: function( _this, smilElement, attributeName, value){
				$j( smilElement ).attr( attributeName, value);
				// update the display
			},
			getSmilVal : function( _this, smilElement, attributeName ){
				if( $j( smilElement ).attr( attributeName ) ){
					return $j( smilElement ).attr( attributeName ) 
				}
				// Check for a default value
				if( _this.editableAttributes[ attributeName ].defaultValue  ){
					return _this.editableAttributes[ attributeName ].defaultValue;
				}
				return '';
			}
		},
		'time' : {
			update : function( _this, smilElement, attributeName, value){
				// Validate time
				var seconds = _this.sequencer.getSmil().parseTime( value );
				$j( smilElement ).attr( attributeName, mw.seconds2npt( seconds ) );
				// Update the clip duration :
				_this.sequencer.getEmbedPlayer().getDuration( true );
				
				// Seek to "this clip" 
				_this.sequencer.getEmbedPlayer().setCurrentTime( 
					$j( smilElement ).data('startOffset')
				);								
			},			
			getSmilVal : function( _this, smilElement, attributeName ){
				var smil = _this.sequencer.getSmil();	
				return mw.seconds2npt( 
						smil.parseTime( 
							$j( smilElement ).attr( attributeName ) 
						)
					);
			}
		}
	},
	editActions: {
		'sourcePage':{
			'displayCheck': function( _this, smilElement ){
				if( _this.sequencer.getSmil().getTitleKey( smilElement ) 
					&& 
					_this.sequencer.getServer().isConfigured() 
				){
					return true;
				}
				return false;							
			},
			'icon': 'info',
			'title': gM('mwe-sequencer-asset-source'),
			'action' : function( clickButton, _this, smilElement ){				
				// Update the link
				$j( clickButton )
				.attr({
					'href': _this.sequencer.getServer().getAssetViewUrl(
							$j(smilElement).find("param[name='apiTitleKey']").attr('value')
							)
					,
					'target' : '_new'
				})
				// follow the link the link
				return true;
			}	
		},			
		'preview' : {
			'icon' : 'play',
			'title' : gM('mwe-sequencer-preview'),
			'action': function( clickButton, _this, smilElement ){				
				_this.sequencer.getPlayer().previewClip( smilElement, function(){
					// preview done, restore original state:
					$j(clickButton).replaceWith ( 
						_this.getEditAction( smilElement, 'preview' ) 
					)
				});
				// xxx todo  update preview button to "pause" / "play" 
				var doPause = function(){
					$j( clickButton ).find( '.ui-icon')
						.removeClass( 'ui-icon-pause' )
						.addClass( 'ui-icon-play' )
					$j( clickButton ).find('.btnText').text(
						gM('mwe-sequencer-preview-continue')
					)
					_this.sequencer.getEmbedPlayer().pause();
				}
				var doPlay = function(){
					// setup pause button: 
					$j( clickButton ).find( '.ui-icon')
						.removeClass( 'ui-icon-play' )
						.addClass( 'ui-icon-pause' )
					$j( clickButton ).find('.btnText').text(
						gM('mwe-sequencer-preview-pause')
					)
					// keep the target preview end time: 
					// xxx should probably refactor this.. a bit of abstraction leak here: 
					_this.sequencer.getEmbedPlayer().play(
						_this.sequencer.getEmbedPlayer().playSegmentEndTime
					);
				}
				$j( clickButton ).unbind().click(function(){
					if( _this.sequencer.getEmbedPlayer().paused ){
						doPlay();
					} else {
						doPause();						
					}					
				})
				doPlay();
			}
		},		
		'cancel' : {
			'icon': 'close',
			'title' : gM('mwe-sequencer-clip-cancel-edit'),
			'action' : function(clickButton,  _this, smilElement ){
				$j.each( 
					_this.getToolSet( 
						_this.sequencer.getSmil().getRefType( smilElement ) 
					), 
					function( inx, toolId ){
						var tool = _this.tools[toolId];
						for( var i=0; i < tool.editableAttributes.length ; i++ ){
							var attributeName = tool.editableAttributes[i]; 
							var $editToolInput = $j('#' + _this.getEditToolInputId( toolId, attributeName ) );  					
							// Restore all original attribute values
							smilElement.attr( attributeName, $editToolInput.data('initialValue') );
						}				
					}
				);
								
				// Update the clip duration :
				_this.sequencer.getEmbedPlayer().getDuration( true );
				
				// Update the embed player
				_this.sequencer.getEmbedPlayer().setCurrentTime( 
					$j( smilElement ).data('startOffset')
				);

				// Close / empty the toolWindow
				_this.setDefaultText();
			}
		}
	},
	editWidgets: {
		'edittemplate':{
			'onChange' : function( _this, smilElement, target ){
				// Clear the smilElement template cache: 
				$j( smilElement ).data('templateHtmlCache', null);
				// Re draw the smilElement in the player
				var smil = _this.sequencer.getSmil();
				$playerTarget = $j('#' + smil.getSmilElementPlayerID( smilElement ) );
				$playerTarget.loadingSpinner();
				smil.getLayout().getSmilTemplateHtml( smilElement, $playerTarget, function(){
					mw.log("SequencerTools::editWidgets: smil template updated");
				});
			},
			'draw': function( _this, target, smilElement ){
				// Parse the set of templates from the template text cache
				$j( target ).loadingSpinner();
			
				if( ! $j( smilElement).attr('apititlekey') ){
					mw.log("Error: can't grab template without title key")
					return ;
				}
				// Get the template wikitext 
				_this.sequencer
				.getServer()
				.getTemplateText( $j( smilElement).attr('apititlekey'), function( templateText ){
					mw.log("GotTemplateText: " + templateText );
					if( ! templateText || typeof templateText != 'string' ){
						mw.log("Error: could not get wikitext form titlekey: " +  $j( smilElement).attr('apititlekey'))
						return ;
					}
					$j( target ).empty().append( 
						$j('<h3 />').text( gM('mwe-sequencer-edittemplate-params') )
					)
					
					// This is not supposed to be perfect .. 
					// just get you 'most' of the input vars 'most' of the time via the greedy regEx:
					var templateVars = templateText.match(/\{\{\{([^\}]*)\}\}\}/gi);							
					var cleanTemplateParams = {};		
					
					for( i =0;i<templateVars.length; i++ ){
						var tVar = templateVars[i];
						// Remove all {{{ and }}}
						tVar = tVar.replace(/\{\{\{/, '' ).replace( /\}\}\}/, '');
						// Check for | operator
						if( tVar.indexOf("|") != -1 ){
							// Only the first version of the template var
							tVar = tVar.split( '|')[0];
						}
						cleanTemplateParams[ tVar ] = true;
					}					
					// Output input boxes for each template var as a param
					for( var paramName in cleanTemplateParams ){
						$j( target ).append( 
							_this.getEditableAttribute(
									smilElement, 
									'edittemplate', 
									'param',  
									paramName
							)
							.find('input')
							// Bind the change event:
							.change(function(){
								_this.editWidgets.edittemplate.onChange(
									_this, 
									smilElement, 
									target
								)
							})
							.parent()
							,							
							$j('<div />')
							.css('clear', 'both')
						)
					}
					
					
				});
			}
		},
		'panzoom' : {
			'onChange': function( _this, smilElement, target ){
				var panZoomVal = $j('#' +_this.getEditToolInputId( 'panzoom', 'panZoom')).val();
				mw.log("panzoom change:" + panZoomVal );
				
				// Update on the current smil clip display:
				_this.sequencer.getSmil()
				.getLayout()
				.panZoomLayout(
					smilElement
				);
				var $thumbTraget  = $j( '#' + _this.sequencer.getTimeline().getTimelineClipId( smilElement ) ).find('.thumbTraget');
				// Update the timeline clip display
				// xxx this should be abstracted to timeline handler for clip updates
				_this.sequencer.getSmil()
				.getLayout()
				.panZoomLayout(
					smilElement, 
					$thumbTraget,
					$thumbTraget.find('img').get(0)
				)
				// Register the change for undo redo
				_this.sequencer.getActionsEdit().registerEdit();
			},
			'draw': function( _this, target, smilElement ){				
				var orginalHelperCss = {
					'position' : 'absolute',
					'width' : 100,
					'height' : 75,
					'top' : 50,
					'left' : 70,
					'font-size' : 'x-small'
				};				
				// Add a input box binding: 				
				$j('#' +_this.getEditToolInputId( 'panzoom', 'panZoom'))
				.change(function(){
					_this.editWidgets.panzoom.onChange( _this, smilElement, target );
				})
				
				$j( target ).append( 
					$j('<h3 />').html( 
						gM('mwe-sequencer-tools-panzoomhelper-desc')
					)
					,
					/*xxx Keep aspect button ?*/
					// Rest layout button ( restores default position )
					$j.button({						
						'icon' : 'arrow-4',
						'text' : gM( 'mwe-sequencer-tools-panzoomhelper-resetlayout' )
					})
					.attr('id', 'panzoomResetLayout')
					.css('float', 'left')
					.hide()
					.click(function(){
						// Restore default SMIL setting
						_this.editableTypes['display'].update(
							_this, 
							smilElement, 
							'panzoom',
							_this.editableAttributes['panzoom'].defaultValue
						)
					})
					,
					$j('<div />')				
					.css({
						'border' : '1px solid #DDDDDD',
						'float' : 'left',
						'position' : 'relative',
						'width': '240px',
						'height' : '180px',
						'overflow' : 'hidden'
					})
					.append( 
						$j('<div />')
						.css( orginalHelperCss )					
						.attr({
							'id': "panzoomHelper" 
						})					
						.addClass("ui-widget-content")
						.text( gM('mwe-sequencer-tools-panzoomhelper') )
					)					
				);
				var startPanZoomVal = '';
				var setStartPanZoomVal = function(){
					 startPanZoomVal = $j( smilElement ).attr( 'panZoom');
					if(! startPanZoomVal ){
						startPanZoomVal = _this.editableAttributes['panZoom'].defaultValue;
					}	
				}
				
				var updatePanZoomFromUiValue = function( layout ){							
					var pz = startPanZoomVal.split(',');
					// Set the new percent offset to x/2 
					if( layout.left ){
						pz[0] = ( parseInt( pz[0] ) - ( layout.left / 4 ) ) + '%';
					}
					
					if( layout.top ){
						pz[1] = ( parseInt( pz[1] ) - ( layout.top / 4 ) )+ '%';
					}
					
					if( layout.width ) {						
						pz[2] = ( parseInt( pz[2] ) - ( layout.width / 2) ) + '%' 
					
						// right now only keep aspect is supported do size hack::
						pz[3] = parseInt( pz[2] )  * _this.sequencer.getSmil().getLayout().getTargetAspectRatio();
						// only have 2 significant digits
										
					}					
					// Trim and round all % values
					for(var i=0; i < pz.length; i++){
						pz[i] = ( Math.round( parseInt( pz[i] ) * 1000 ) / 1000 ) + '%';		
						pz[i] = $j.trim( pz[i] );
					}
					var smilPanZoomValue = pz.join(', ');					
					
					// Update the smil DOM: 
					$j( smilElement ).attr( 'panZoom', smilPanZoomValue );
					
					// Update the user input tool input value:
					$j('#' +_this.getEditToolInputId( 'panzoom', 'panZoom')).val( smilPanZoomValue );
					
					// Animate the update on the current smil clip display:
					_this.sequencer.getSmil()
					.getLayout()
					.panZoomLayout(
						smilElement						
					);
				}
				// Add bindings
				$j('#panzoomHelper')
				.draggable({ 
					containment: 'parent',
					start: function( event, ui){
						setStartPanZoomVal();
					},
					drag: function( event, ui){
						updatePanZoomFromUiValue({
							'top' : ( orginalHelperCss.top - ui.position.top ), 
							'left' : ( orginalHelperCss.left -  ui.position.left )
						});							
					},
					stop: function( event, ui){
						// run the onChange ?
						// Restore original css for the layout helper 
						$j(this).css( orginalHelperCss )
						// trigger the 'change'
						_this.editWidgets.panzoom.onChange( _this, smilElement, target );
					}
				})
				.css('cursor', 'move')
				.resizable({
					handles : 'all',
					maxWidth : 170,
					maxHeight: 130,					
					aspectRatio: 4/3,
					start: function( event, ui){
						setStartPanZoomVal();
					},
					resize : function(event, ui){				
						updatePanZoomFromUiValue({
							'width' : ( orginalHelperCss.width - ui.size.width ), 
							'height' : ( orginalHelperCss.top - ui.size.height )
						});									
					},
					stop: function( event, ui){						
						// Restore original css
						$j(this).css( orginalHelperCss )
						// trigger the change
						_this.editWidgets.panzoom.onChange( _this, smilElement, target );
					}
				})
				
			}
		},
		'trimTimeline' : {
			'onChange': function( _this, smilElement, target){				
				var smil = _this.sequencer.getSmil();
				// Update the preview thumbs
				
				// (local function so it can be updated after the start time is done with its draw ) 
				var updateDurationThumb = function(){
					// Check the duration:
					var clipDur = $j('#editTool_trim_dur').val();
					if( clipDur ){
						// Render a thumbnail for the updated duration  
						smil.getLayout().drawSmilElementToTarget( 							
							smilElement,
							$j( target ).find('.trimEndThumb'),
							clipDur
						);
					}
				}
				
				var clipBeginTime = $j('#editTool_trim_clipBegin').val();
				if( !clipBeginTime ){
					$j(target).find('.trimStartThumb').hide();
				} else {
					mw.log("Should update trimStartThumb::" +  $j(smilElement).attr('clipBegin') );
					// Render a thumbnail for relative start time = 0  
					smil.getLayout().drawSmilElementToTarget( 						
						smilElement, 
						$j( target ).find('.trimStartThumb'),
						0,
						updateDurationThumb()
					)
				}
			},
			// Return the trimTimeline edit widget
			'draw': function( _this, target, smilElement ){
				var smil = _this.sequencer.getSmil();
				// check if thumbs are supported 
				if( _this.sequencer.getSmil().getRefType( smilElement ) == 'video' ){ 
					$j(target).append(
						$j('<div />')					
						.addClass( 'trimStartThumb ui-corner-all' ),					
						$j('<div />')					
						.addClass( 'trimEndThumb ui-corner-all' ),
						$j('<div />').addClass('ui-helper-clearfix') 
					)			
				}
				// The local scope fullClipDuration
				var fullClipDuration = null;
				
				// Some slider functions
				var sliderToTime = function( sliderval ){
					return parseInt( fullClipDuration * ( sliderval / 1000 ) );
				}
				var timeToSlider = function( time ){					
					return parseInt( ( time / fullClipDuration ) * 1000 );
				}
				
				
				var onInputChange = function( sliderIndex, timeValue ){
					// Register the change
					_this.editWidgets.trimTimeline.onChange( _this, smilElement, target);
					// Update the slider
					if( fullClipDuration ){
						$j('#'+_this.sequencer.id + '_trimTimeline' )
							.slider( 
									"values", 
									sliderIndex, 
									timeToSlider( timeValue )
							);					
					}
				}
				
				// Add a trim binding: 				 
				$j('#' + _this.getEditToolInputId( 'trim', 'clipBegin') )
				.change( function(){					
					var timeValue = smil.parseTime(  $j(this).val() );
					onInputChange( 0, timeValue);
				});
				
				 $j('#' + _this.getEditToolInputId( 'trim', 'dur') ) 
				.change( function(){			
					var timeValue = smil.parseTime(  $j(this).val() ) + 
					 smil.parseTime( $j('#' + _this.getEditToolInputId( 'trim', 'clipBegin') ).val() );
					onInputChange( 1, timeValue );
				});
				 
				// Update the thumbnails:				
				_this.editWidgets.trimTimeline.onChange( _this, smilElement, target);
				
				// Get the clip full duration to build out the timeline selector
				smil.getBody().getClipAssetDuration( smilElement, function( clipDuration ) {
					// update the local scope global 
					fullClipDuration = clipDuration;
				
					var startSlider = timeToSlider( smil.parseTime( $j('#editTool_trim_clipBegin').val() ) );
					var sliderValues = [
					    startSlider,
					    startSlider + timeToSlider( smil.parseTime( $j('#editTool_trim_dur').val() ) )
					];								
					// Return a trim tool binded to smilElement id update value events. 
					$j(target).append(
						$j('<div />')
						.attr( 'id', _this.sequencer.id + '_trimTimeline' )
						.css({
							'position': 'absolute',
							'left' : '25px',
							'right' : '35px',
							'margin': '5px'
						})
						.slider({
							range: true,
							min: 0,
							max: 1000,
							values: sliderValues,
							slide: function(event, ui) {	
							
								$j('#' + _this.getEditToolInputId( 'trim', 'clipBegin') ).val( 
									mw.seconds2npt( sliderToTime( ui.values[0] ), true ) 
								);
								$j('#' + _this.getEditToolInputId( 'trim', 'dur') ).val(  
									mw.seconds2npt( sliderToTime( ui.values[1] - ui.values[0] ), true )
								);
							},
							change: function( event, ui ) {
								var attributeValue = 0, sliderIndex  = 0;
								
								// Update clipBegin 
								_this.editableTypes['time'].update( _this, smilElement, 'clipBegin',  sliderToTime( ui.values[ 0 ] ) );
								
								// Update dur
								_this.editableTypes['time'].update( _this, smilElement, 'dur',   sliderToTime( ui.values[ 1 ]- ui.values[0] ) );
																				
								// update the widget display
								_this.editWidgets.trimTimeline.onChange( _this, smilElement, target);
								
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
	setDefaultText: function(){
		this.sequencer.getEditToolTarget().html(
			this.getDefaultText() 
		)
	},
	getEditToolInputId: function( toolId, attributeName){
		return 'editTool_' + toolId + '_' + attributeName.replace('/\s/', '');
	},
	/**
	 * update the current displayed tool ( when an undo, redo or history jump changes smil state ) 
	 */
	updateToolDisplay: function(){
		var _this = this;
	
		// If tools are displayed update them 
		if( this.sequencer.getEditToolTarget().find('.editToolsContainer').lenght ){			
			this.drawClipEditTools()
		}
		
	},
	getToolSet: function( refType ){
		var toolSet = [];		
		for( var toolId in this.tools){		
			if( this.tools[ toolId ].contentTypes){
				if( $j.inArray( refType, this.tools[ toolId ].contentTypes) != -1 ){
					toolSet.push( toolId );
				}
			}
		}
		return toolSet;
	},
	drawClipEditTools: function( smilElement, selectedToolId ){
		var _this = this;
		
		// Update the current clip and tool :
		if( smilElement ){
			this.setCurrentsmilElement( smilElement );
		}
		if( selectedToolId ){
			this.setCurrentToolId( selectedToolId );
		}				
		
		$toolsContainer = $j('<div />')
		.addClass( 'editToolsContainer' )
		.css( {
			'height': '80%',
			'overflow': 'auto'
		})
		.append( 
			$j('<ul />') 
		);
				
		this.sequencer.getEditToolTarget().empty().append(
			$toolsContainer
		);
		// Get the entire tool set based on what "ref type" smilElement is:
		var toolSet =  this.getToolSet(  
							this.sequencer.getSmil().getRefType( 
								this.getCurrentsmilElement() 
							) 
						);
		mw.log( 'Adding ' + toolSet.length + ' tools for ' + this.sequencer.getSmil().getRefType( this.getCurrentsmilElement() ) );
		
		$j.each( toolSet, function( inx, toolId ){
			
			var tool = _this.tools[ toolId ];
			
			// set the currentTool if not already set 
			if(!_this.currentToolId){
				_this.currentToolId = toolId;
			}
			
			// Append the title to the ul list
			$toolsContainer.find( 'ul').append( 
				$j('<li />').append( 
					$j('<a />')
					.attr('href', '#tooltab_' + toolId )
					.text( gM('mwe-sequencer-tools-' + toolId) ) 
				)
			);
			
			// Append the tooltab container
			$toolsContainer.append(
				$j('<div />')
				.css({'height' : '100%' })
				.attr('id', 'tooltab_' + toolId )		
				.append(
					$j('<h3 />').text( gM('mwe-sequencer-tools-' + toolId + '-desc') )
				)
			)
			var $toolContainer = $toolsContainer.find( '#tooltab_' + toolId );
			
			// Build out the attribute list for the given tool: 
			for( var i=0; i < tool.editableAttributes.length ; i++ ){
				attributeName = tool.editableAttributes[i];
				$toolContainer.append(
					_this.getEditableAttribute( smilElement, toolId, attributeName )
				);
			}
			
			// Output a float divider: 
			$toolContainer.append( $j('<div />').addClass('ui-helper-clearfix') );
			
			// Build out tool widgets 
			if( tool.editWidgets ){
				for( var i =0 ; i < tool.editWidgets.length ; i ++ ){
					var editWidgetId = tool.editWidgets[i];
					if( ! _this.editWidgets[editWidgetId] ){
						mw.log("Error: not recogonized widget: " + editWidgetId);
						continue;
					}
					// Append a target for the edit widget:
					$toolContainer.append( 
						$j('<div />')
						.attr('id', 'editWidgets_' + editWidgetId)
					);			
					// Draw the binded widget:
					_this.editWidgets[editWidgetId].draw( 
						_this, 
						$j( '#editWidgets_' + editWidgetId ),
						smilElement
					)
					// Output a float divider: 
					$toolContainer.append( $j('<div />').addClass( 'ui-helper-clearfix' ) );
				}	
			}				
		});
		
		// Add tab bindings
		$toolsContainer.tabs();
		
		// Build out global edit Actions buttons after the container
		for( var editActionId in this.editActions ){		
			// Check if the edit action has a conditional display:
			var displayEidtAction = true;
			
			if( this.editActions[ editActionId ].displayCheck ){
				displayEidtAction =  this.editActions[ editActionId ].displayCheck( _this,  smilElement );
			}			
			if( displayEidtAction ){
				$toolsContainer.after( 
					this.getEditAction( smilElement, editActionId )
				)	
			}
		}
	},
	getCurrentsmilElement: function(){
		return this.currentsmilElement;
	},
	setCurrentsmilElement: function( smilElement ){
		this.currentsmilElement = smilElement;
	},
	getCurrentToolId: function(){
		return this.currentToolId;
	},
	setCurrentToolId: function( toolId ){
		this.currentToolId = toolId;
	},
	
	getEditAction: function( smilElement, editActionId ){		
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
				return editAction.action( this, _this, smilElement );
			})
		return $actionButton;
	},
	/* get the editiable attribute input html */
	getEditableAttribute: function( smilElement, toolId, attributeName, paramName ){
		if( ! this.editableAttributes[ attributeName ] ){
			mw.log("Error: editableAttributes : " + attributeName + ' not found');
			return; 
		}
		var _this = this;
		var editAttribute = this.editableAttributes[ attributeName ];
		var editType = editAttribute.type;
		if( !_this.editableTypes[ editType ] ){
			mw.log(" Error: No editableTypes interface for " + editType);
			return ;	
		}
		// Set the update key to the paramName if provided:
		var updateKey = ( paramName ) ? paramName : attributeName;
		
		var initialValue =  _this.editableTypes[ editType ].getSmilVal(
			_this, 
			smilElement, 
			updateKey
		);
		// Set the default input size 
		var inputSize = ( _this.editableAttributes[ attributeName ].inputSize)? 
				_this.editableAttributes[ attributeName ].inputSize : 6;

		// Set paramName based attributes: 
		var attributeTitle = ( editAttribute.title ) ? editAttribute.title : paramName + ':';

		return $j( '<div />' )
			.css({
				'float': 'left',
				'font-size': '12px',				
				'border': 'solid thin #999',
				'background-color': '#EEE',
				'padding' : '2px',
				'margin' : '5px'
			})
			.addClass('ui-corner-all')
			.append( 
				$j('<span />')
				.css('margin', '5px')
				.text( attributeTitle ),
				
				$j('<input />')
				.attr( {
					'id' : _this.getEditToolInputId( toolId, updateKey ),
					'size': inputSize
				})
				.data('initialValue', initialValue )
				.sequencerInput( _this.sequencer )
				.val( initialValue )
				.change(function(){							
					// Run the editableType update function: 
					_this.editableTypes[ editType ].update( 
							_this, 
							smilElement, 
							updateKey, 
							$j( this ).val() 
					);				
					// widgets can bind directly to this change action. 					
				})
			);
	}		
}

} )( window.mw );