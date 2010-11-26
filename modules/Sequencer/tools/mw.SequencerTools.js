/**
 * Handles the "tools" window top level component driver
 */

// Wrap in mw closure to avoid global leakage
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
			'contentTypes': [ 'img', 'video' ], 
			'supportsKeyFrames' : 'true'
		},
		'templateedit' : {
			'editWidgets' : ['editTemplate'],
			'editableAttributes' : [ 'apititlekey' ],
			'contentTypes' : ['mwtemplate']
		},
		'transitions' : {
			'editWidgets' : ['editTransitions'],
			'contentTypes': ['video', 'img', 'cdata_html', 'mwtemplate' ]
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
				$paramNode = $j( smilElement ).find( "[name='"+ paramName + "']" );
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
				if( _this.editableAttributes[ attributeName ].defaultValue ){
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
							_this.sequencer.getSmil().getTitleKey( smilElement )
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
				// xxx todo update preview button to "pause" / "play"
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
			'action' : function(clickButton, _this, smilElement ){
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
		'editTransitions' : {
			'transitionTypes' : {
				'fade':{
					'type' : {
						'value' : 'fade',
						'editType' : 'hidden'
					},
					'dur' : {
						'value' : '0:02',
						'editType' : 'time'
					}
				},
				'fadeColor':{
					'extends':'fade',
					'fadeColor' : {
						'value' : '#000',
						'editType' : 'color'
					}
				},
				// Set high level select attribute default
				'fadeFromColor' : {
					'extends': 'fadeColor',
					'selectable' : ['transIn'],
					'subtype' : {
						'value' : 'fadeFromColor',
						'editType' : 'hidden'
					}
				},
				'fadeToColor' : {
					'extends': 'fadeColor',
					'selectable' : ['transOut'],
					'subtype' : {
						'value' : 'fadeToColor',
						'editType' : 'hidden'
					}
				}
				// crossfade presently not supported
				/*,
				'crossfade' : {
					'extends': 'fade',
					'selectable' : ['transIn', 'transOut'],
					'subtype' : {
						'value' : 'crossfade',
						'editType' : 'hidden'
					}
				}*/
			},
			buildAttributeSet: function( transitionType ){
				var attributes = {};
				for( var i in this.transitionTypes[ transitionType ] ){
					if( i == 'extends' ){
						$j.extend( attributes, this.buildAttributeSet( this.transitionTypes[ transitionType ][i] ) );
					} else {
						attributes[ i ] = this.transitionTypes[ transitionType ][i];
					}
				}
				return attributes;
			},

			getTransitionId: function( smilElement, transitionType ){
				// Transition name is packed from attributeValue via striping the smilElement id
				// This is a consequence of smil's strange transition dom placement in the head of the
				// document instead of as child nodes. The idea with smil is the transition can be 'reused'
				// but in the sequencer context we want unique transitions so that each can be customized
				// independently.
				return $j( smilElement ).attr('id') + '_' + transitionType;
			},

			// Get a transition element ( if it does not exist add it )
			getTransitionElement: function( _this, smilElement, transitionType ){
				var $smilDom = _this.sequencer.getSmil().$dom;
				var transId = this.getTransitionId( smilElement, transitionType );
				if( $smilDom.find( '#' + transId ).length == 0 ){
					$smilDom.find('head').append(
						$j('<transition />')
						.attr('id', transId )
					);
				}
				return $smilDom.find( '#' + transId );
			},

			getSelectedTransitionType: function(smilElement, transitionDirection ){
				var attributeValue = $j( smilElement ).attr( transitionDirection );
				if( !attributeValue )
					return '';
				return attributeValue.replace( $j( smilElement ).attr('id') + '_', '' );
			},

			getBindedTranstionEdit: function( _this, smilElement, transitionType ){
				var _editTransitions = this;
				var $editTransitionsSet = $j('<div />');
				// Return the empty div on empty transtionType
				if( transitionType == '' ){
					return $editTransitionsSet
				}

				// Get the smil transition element
				var $smilTransitionElement = this.getTransitionElement( _this, smilElement, transitionType )
				// Get all the editable attributes for transitionName
				var attributeSet = this.buildAttributeSet( transitionType );

				$j.each( attributeSet, function( attributeKey, transitionAttribute ){
					// Skip setup attributes
					if( attributeKey == 'extends' || attributeKey == 'selectable' ){
						return true;
					}
					var initialValue = $smilTransitionElement.attr( attributeKey );
					// Set to the default value if the transition attribute has no attribute key
					if( !initialValue){
						initialValue = transitionAttribute.value
						$smilTransitionElement.attr( attributeKey, transitionAttribute.value )
					}

					if( transitionAttribute.editType == 'time' ){
						$editTransitionsSet.append(
							_this.getInputBox({
								'title' : gM('mwe-sequencer-tools-duration'),
								'inputSize' : 5,
								'initialValue' :initialValue,
								'change': function(){
									// parse smil time
									var time = _this.sequencer.getSmil().parseTime( $j(this).val() );

									// Check if time > clip duration
									if( time > $j( smilElement ).attr('dur') ){
										time = $j( smilElement ).attr('dur');
									}
									if( time < 0 )
										time = 0;

									// Update the input value
									$j( this ).val( mw.seconds2npt( time ) );
									// Update the smil attribute
									$smilTransitionElement.attr( attributeKey, time );
									// run the onChange action
									_editTransitions.onChange( _this, smilElement );
								}
							})
						)
					} else if ( transitionAttribute.editType == 'color' ){
						// Add the color picker:
						$editTransitionsSet.append(
							_this.getInputBox({
								'title' : gM('mwe-sequencer-tools-transitions-color'),
								'inputSize' : 8,
								'initialValue' : initialValue
							})
							.addClass("jColorPicker")
						);
						$editTransitionsSet.find('.jColorPicker input').jPicker(
								_editTransitions.colorPickerConfig,
								function(color){
									// commit color ( update undo / redo )

								},
								function(color){
									// live preview of selection ( update player )
									//mw.log('update: ' + attributeKey + ' set to: #' + color.val('hex'));
									$smilTransitionElement.attr( attributeKey, '#' + color.val('hex') );
									_editTransitions.onChange( _this, smilElement );
								}
							)
						// adjust the position of the color button:
						$editTransitionsSet.find('.jColorPicker .Icon').css('top', '-5px');
					}
				})
				return $editTransitionsSet;
			},
			/**
			 * Could move to a more central location if we use the color picker other places
			 */
			colorPickerConfig: {
				'window' : {
				 	'expandable': true,
					'effects' : {
						'type' : 'show'
					},
					'position' : {
						'x' : '10px',
						'y' : 'bottom'
					}
				},
				'images' : {
					'clientPath' : mw.getMwEmbedPath() + 'modules/Sequencer/tools/jPicker/images/'
				},
				'localization' : {
					 'text' : {
						'title' : gM('mwe-sequencer-color-picker-title'),
						'newColor' : gM('mwe-sequencer-menu-sequence-new'),
						'currentColor' : gM('mwe-sequencer-color-picker-current'),
						'ok' : gM('mwe-ok'),
						'cancel': gM('mwe-cancel')
					},
					'tooltips':{
						'colors':
						{
							'newColor': gM('mwe-sequencer-color-picker-new-color'),
							'currentColor': gM('mwe-sequencer-color-picker-currentColor')
						},
						'buttons':
						{
							ok: gM('mwe-sequencer-color-picker-commit' ),
							cancel: gM('mwe-sequencer-color-picker-cancel-desc')
						},
						'hue':
						{
							radio: gM('mwe-sequencer-color-picker-hue-desc'),
							textbox: gM('mwe-sequencer-color-picker-hue-textbox')
						},
						'saturation':
						{
							radio: gM('mwe-sequencer-color-picker-saturation-desc'),
							textbox: gM('mwe-sequencer-color-picker-saturation-textbox')
						},
						'value':
						{
							radio: gM('mwe-sequencer-color-picker-value-desc'),
							textbox: gM('mwe-sequencer-color-picker-value-textbox')
						},
						'red':
						{
							radio: gM('mwe-sequencer-color-picker-red-desc'),
							textbox: gM('mwe-sequencer-color-picker-red-textbox')
						},
						'green':
						{
							radio: gM('mwe-sequencer-color-picker-green-desc'),
							textbox: gM('mwe-sequencer-color-picker-green-textbox')
						},
						'blue':
						{
							radio: gM('mwe-sequencer-color-picker-blue-desc'),
							textbox: gM('mwe-sequencer-color-picker-blue-textbox')
						},
						'alpha':
						{
							radio: gM('mwe-sequencer-color-picker-alpha-desc'),
							textbox: gM('mwe-sequencer-color-picker-alpha-textbox')
						},
						'hex':
						{
							textbox: gM('mwe-sequencer-color-picker-hex-desc'),
							alpha: gM('mwe-sequencer-color-picker-hex-textbox')
						}
					}
				}
			},
			'onChange': function( _this, smilElement ){
				// Update the sequence duration :
				_this.sequencer.getEmbedPlayer().getDuration( true );

				// xxx we should re-display the current time
				_this.sequencer.getEmbedPlayer().setCurrentTime(
					$j( smilElement ).data('startOffset')
				);
			},
			'draw': function( _this, target, smilElement ){
				// draw the two attribute types
				var _editTransitions = this;
				var $transitionWidget = $j('<div />');

				var transitionDirections = ['transIn', 'transOut'];
				$j.each(transitionDirections, function( inx, transitionDirection ){
					$transitionWidget.append(
						$j('<div />').css('clear', 'both')
						,
						$j('<h3 />').text( gM('mwe-sequencer-tools-transitions-' + transitionDirection ))
					)
					// Output the top level empty select
					$transSelect = $j('<select />').append(
						$j('<option />')
						.attr('value', '')
					);
					var selectedTransitionType = _editTransitions.getSelectedTransitionType( smilElement, transitionDirection);
					for( var transitionType in _editTransitions.transitionTypes ){
						if( _editTransitions.transitionTypes[ transitionType ].selectable
							&&
							$j.inArray( transitionDirection, _editTransitions.transitionTypes[transitionType].selectable ) !== -1 )
						{
							// Output the item if its selectable for the current transitionType
							var $option = $j("<option />")
							.attr('value', transitionType )
							.text( transitionType )
							// Add selected attribute if selected:
							if( selectedTransitionType == transitionType ){
								$option.attr('selected', 'true');
							}
							$transSelect.append( $option );
						}
					}
					$transSelect.change( function(){
						var transitionType = $j(this).val();
						$transitionWidget.find( '#' + transitionDirection + '_attributeContainer' ).html(
							_editTransitions.getBindedTranstionEdit(
								_this, smilElement, transitionType
							)
						)
						// Update the smil attribute:
						$j( smilElement ).attr(
							transitionDirection,
							_editTransitions.getTransitionId( smilElement, transitionType )
						)
						// Update the player on select change
						_editTransitions.onChange( _this, smilElement );
					});

					// Add the select to the $transitionWidget
					$transitionWidget.append( $transSelect );

					// Set up the transConfig container:
					var $transConfig = $j('<span />')
						.attr('id', transitionDirection + '_attributeContainer');

					// If a given transition type is selected output is editable attributes
					if( selectedTransitionType != '' ) {
						$transConfig.append(
							_editTransitions.getBindedTranstionEdit(
								_this, smilElement, selectedTransitionType
							)
						)
					}
					$transitionWidget.append( $transConfig );

					// update the player for the default selected set.
					_editTransitions.onChange( _this, smilElement );
				});
				// add the transition widget to the target
				$j( target ).append( $transitionWidget );
			}
		},
		'editTemplate':{
			'onChange' : function( _this, smilElement ){
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
					//mw.log("GotTemplateText: " + templateText );
					if( ! templateText || typeof templateText != 'string' ){
						mw.log("Error: could not get wikitext form titlekey: " + $j( smilElement).attr('apititlekey'))
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
									'editTemplate',
									'param',
									paramName
							)
							.find('input')
							// Bind the change event:
							.change(function(){
								_this.editWidgets.editTemplate.onChange(
									_this,
									smilElement
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
			'onChange': function( _this, smilElement ){
				var panZoomVal = $j('#' +_this.getEditToolInputId( 'panzoom', 'panZoom')).val();
				mw.log("panzoom change:" + panZoomVal );

				// Update on the current smil clip display:
				_this.sequencer.getSmil()
				.getLayout()
				.panZoomLayout(
					smilElement
				);
				var $thumbTraget = $j( '#' + _this.sequencer.getTimeline().getTimelineClipId( smilElement ) ).find('.thumbTraget');
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
					'width' : 120,
					'height' : 100,				
					'color' : 'red',
					'font-size' : 'x-small',
					'opacity' : .6,
					'border' : 'dashed',
					'left' : _this.sequencer.getEmbedPlayer().getPlayerWidth()/2 - 60,
					'top' : _this.sequencer.getEmbedPlayer().getPlayerHeight()/2 - 50
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
				);				
				var $playerUI = _this.sequencer.getEmbedPlayer().$interface;
				// Remove any old layout helper:
				$playerUI.find('.panzoomHelper').remove();
				
				// Append the resize helper as an overlay on the player:
				$playerUI.append(
					$j('<div />')
					.css( orginalHelperCss )
					.addClass("ui-widget-content panzoomHelper")
					.text( gM('mwe-sequencer-tools-panzoomhelper') )				
				);
				
				// Only show when the panzoom tool is selected
				if( _this.getCurrentToolId() != 'panzoom'){
					$playerUI.find('.panzoomHelper').hide()
				}				
				$j(_this).bind('toolSelect', function(){
					if( _this.getCurrentToolId() == 'panzoom'){
						$playerUI.find('.panzoomHelper').fadeIn('fast')
					} else {
						$playerUI.find('.panzoomHelper').fadeOut('fast')
					}
				});	
				// Bind to resize player events to keep the helper centered
				$j( _this.sequencer.getEmbedPlayer() ).bind('onResizePlayer', function(event, size){
					$playerUI.find('.panzoomHelper').css( {
						'left' : size.width/2 - 60,
						'top' : size.height/2 - 50
					});
				});
				
				
				/*xxx Keep aspect button ?*/
				// Rest layout button ( restores default position )
				/*$j.button({
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
				})*/
								
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
						pz[3] = parseInt( pz[2] ) * _this.sequencer.getSmil().getLayout().getTargetAspectRatio();
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
				$playerUI.find('.panzoomHelper')
				.draggable({
					containment: 'parent',
					start: function( event, ui){
						setStartPanZoomVal();
					},
					drag: function( event, ui){
						updatePanZoomFromUiValue({
							'top' : ( orginalHelperCss.top - ui.position.top ),
							'left' : ( orginalHelperCss.left - ui.position.left )
						});
					},
					stop: function( event, ui){
						// run the onChange ?
						// Restore original css for the layout helper
						$j(this).css( orginalHelperCss )
						// trigger the 'change'
						_this.editWidgets.panzoom.onChange( _this, smilElement );
					}
				})
				.css('cursor', 'move')
				.resizable({
					handles : 'all',
					maxWidth : 250,
					maxHeight: 180,
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
						_this.editWidgets.panzoom.onChange( _this, smilElement);
					}
				})

			}
		},
		'trimTimeline' : {
			'onChange': function( _this, smilElement ){
				var smil = _this.sequencer.getSmil();
				// Update the preview thumbs
				var $target = $j( '#editWidgets_trimTimeline' );
				// (local function so it can be updated after the start time is done with its draw )
				/*var updateDurationThumb = function(){
					// Check the duration:
					var clipDur = $j('#editTool_trim_dur').val();
					if( clipDur ){
						// Render a thumbnail for the updated duration
						smil.getLayout().drawSmilElementToTarget(
							smilElement,
							$target.find('.trimEndThumb'),
							clipDur
						);
					}
				}

				var clipBeginTime = $j('#editTool_trim_clipBegin').val();
				if( !clipBeginTime ){
					$target.find('.trimStartThumb').hide();
				} else {
					mw.log("Should update trimStartThumb::" + $j(smilElement).attr('clipBegin') );
					// Render a thumbnail for relative start time = 0
					smil.getLayout().drawSmilElementToTarget(
						smilElement,
						$target.find('.trimStartThumb'),
						0,
						updateDurationThumb()
					)
				}
				*/

				// Register the edit state for undo / redo
				_this.sequencer.getActionsEdit().registerEdit();
			},
			// Return the trimTimeline edit widget
			'draw': function( _this, target, smilElement ){
				var smil = _this.sequencer.getSmil();
				var sliderScale = 2000 // assume slider is never more than 2000 pixles wide.
				// check if thumbs are supported
				/*if( _this.sequencer.getSmil().getRefType( smilElement ) == 'video' ){
					$j(target).append(
						$j('<div />')
						.addClass( 'trimStartThumb ui-corner-all' ),
						$j('<div />')
						.addClass( 'trimEndThumb ui-corner-all' ),
						$j('<div />').addClass('ui-helper-clearfix')
					)
				}*/
				// The local scope fullClipDuration
				var fullClipDuration = null;

				// Some slider functions
				var sliderToTime = function( sliderval ){
					return parseInt( fullClipDuration * ( sliderval / sliderScale ) );
				}
				var timeToSlider = function( time ){
					return parseInt( ( time / fullClipDuration ) * sliderScale );
				}

				// Special flag to prevent slider updates from propgating if the change was based on user input
				var onInputChangeFlag = false;
				var onInputChange = function( sliderIndex, timeValue ){
					onInputChangeFlag = true;
					if( fullClipDuration ){
						// Update the slider
						var sliderTime = ( sliderIndex == 0 )? timeToSlider( timeValue ) :
							timeToSlider( timeValue + smil.parseTime( $j('#' + _this.getEditToolInputId( 'trim', 'clipBegin') ).val() ) );

						$j('#'+_this.sequencer.id + '_trimTimeline' )
							.slider(
								"values",
								sliderIndex,
								sliderTime
							);
					}
					// restore the onInputChangeFlag
					onInputChangeFlag = false;

					// Directly update the smil xml from the user Input
					if( sliderIndex == 0 ){
						// Update clipBegin
						_this.editableTypes['time'].update( _this, smilElement, 'clipBegin', timeValue );
					} else {
						// Update dur
						_this.editableTypes['time'].update( _this, smilElement, 'dur', timeValue );
					}
					mw.log(' should update inx:' + sliderIndex + ' set to: ' + timeValue);

					// Register the change
					_this.editWidgets.trimTimeline.onChange( _this, smilElement );
				}

				// Add a trim binding:
				$j('#' + _this.getEditToolInputId( 'trim', 'clipBegin') )
				.change( function(){
					var timeValue = smil.parseTime( $j(this).val() );
					onInputChange( 0, timeValue);
				});

				 $j('#' + _this.getEditToolInputId( 'trim', 'dur') )
				.change( function(){
					var timeValue = smil.parseTime( $j(this).val() );
					onInputChange( 1, timeValue );
				});

				// Update the thumbnails:
				_this.editWidgets.trimTimeline.onChange( _this, smilElement );

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
							max: sliderScale,
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
								if( ! onInputChangeFlag ){
									// Update clipBegin
									_this.editableTypes['time'].update( _this, smilElement, 'clipBegin', sliderToTime( ui.values[ 0 ] ) );

									// Update dur
									_this.editableTypes['time'].update( _this, smilElement, 'dur', sliderToTime( ui.values[ 1 ]- ui.values[0] ) );

									// update the widget display
									_this.editWidgets.trimTimeline.onChange( _this, smilElement );
								}
							}
						})
					);
				});
			}
		}
	},
	getDefaultText: function(){
		return gM('mwe-sequencer-no_selected_resource');
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
			'overflow': 'auto',
			'position':'absolute',
			'top' : '0px',
			'left': '0px',
			'right': '0px',
			'bottom': '37px'
		})
		.append(
			$j('<ul />')
		);

		this.sequencer.getEditToolTarget().empty().append(
			$toolsContainer
		);
		// Get the entire tool set based on what "ref type" smilElement is:
		var toolSet = this.getToolSet(
							this.sequencer.getSmil().getRefType(
								this.getCurrentsmilElement()
							)
						);
		mw.log( 'Adding ' + toolSet.length + ' tools for ' +
				this.sequencer.getSmil().getRefType( this.getCurrentsmilElement() ) +
				' current tool: ' + _this.getCurrentToolId()
			);

		var toolTabIndex = 0;
		$j.each( toolSet, function( inx, toolId ){

			var tool = _this.tools[ toolId ];
			if( _this.getCurrentToolId() == toolId){
				toolTabIndex = inx;
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
				.attr('id', 'tooltab_' + toolId )
				.append(
					$j('<h3 />').text( gM('mwe-sequencer-tools-' + toolId + '-desc') )
				)
			)
			var $toolContainer = $toolsContainer.find( '#tooltab_' + toolId );

			// Build out the attribute list for the given tool ( if the tool has directly editable attributes )
			if( tool.editableAttributes ){
				for( var i=0; i < tool.editableAttributes.length ; i++ ){
					attributeName = tool.editableAttributes[i];
					$toolContainer.append(
						_this.getEditableAttribute( smilElement, toolId, attributeName )
					);
				}
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
		$toolsContainer.tabs({
			select: function(event, ui) {
				_this.setCurrentToolId( $j( ui.tab ).attr('href').replace('#tooltab_', '') );
				// trigger select tool event: 
				$j( _this ).trigger( 'toolSelect' );
			},
			selected : toolTabIndex
		});

		var $editActions = $j('<div />')
		.css({
			'position' : 'absolute',
			'bottom' : '0px',
			'height' : '37px',
			'left' : '0px',
			'right' : '0px',
			'overflow' : 'auto'
		});
		// Build out global edit Actions buttons after the container
		for( var editActionId in this.editActions ){
			// Check if the edit action has a conditional display:
			var displayEidtAction = true;

			if( this.editActions[ editActionId ].displayCheck ){
				displayEidtAction = this.editActions[ editActionId ].displayCheck( _this, smilElement );
			}
			if( displayEidtAction ){
				$editActions.append(
					this.getEditAction( smilElement, editActionId )
				)
			}
		}
		$j( this.sequencer.getEditToolTarget() ).append( $editActions )
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

		var initialValue = _this.editableTypes[ editType ].getSmilVal(
			_this,
			smilElement,
			updateKey
		);
		// Set the default input size
		var inputSize = ( _this.editableAttributes[ attributeName ].inputSize)?
				_this.editableAttributes[ attributeName ].inputSize : 6;

		// Set paramName based attributes:
		var attributeTitle = ( editAttribute.title ) ? editAttribute.title : paramName + ':';

		return _this.getInputBox({
			'title' : attributeTitle,
			'inputId' : _this.getEditToolInputId( toolId, updateKey ),
			'inputSize': inputSize,
			'initialValue' : initialValue,
			'change': function(){
				// Run the editableType update function:
				_this.editableTypes[ editType ].update(
						_this,
						smilElement,
						updateKey,
						$j( this ).val()
				);
			}
		})
	},
	getInputBox: function( config ){
		var _this = this;
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
			.text( config.title ),

			$j('<input />')
			.attr( {
				'id' : config.inputId ,
				'size': config.inputSize
			})
			.data('initialValue', config.initialValue )
			.sequencerInput( _this.sequencer )
			.val( config.initialValue )
			.change( config.change )
		);
	}
}

} )( window.mw );
