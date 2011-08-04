/**
* EmbedWizard interface  
*/
( function( mw, $ ) {
	
	// Can be removed once we move to new resource loader:
	mw.includeAllModuleMessages();

	mw.setDefaultConfig( 'EmbedWizard.DefaultAttributes', {
		'width' : 400,
		'height': 300,
		// Raw source:
		'poster': 'http://html5video.org/players/media/folgers.jpg',
		'durationHint' : 60,
		'src' : [
		       'http://html5video.org/players/media/folgers.mp4',
		       'http://html5video.org/players/media/folgers.ogv',
		       'http://html5video.org/players/media/folgers.webm'
		],
		// Kaltura based sources
		'kentryid' : '0_uka1msg4',
		'kwidgetid' : '243342'
	});
	
	mw.EmbedWizard = function( target, options ){
		return this.init( target, options );
	};
	
	mw.EmbedWizard.prototype = {
		init: function( target, options ){
			var _this = this;
			this.$target = $( target );
			// direct mapping of options to EmbedWizard prototype
			for(var i in options){
				this[i] = options[i];
			}
			this.drawUi();
		},
		drawUi :function(){
			var _this = this;
			// get the two main interface components
			this.$target.append(
				this.getPlayerInputs(),
				this.getPlayerCodePreivew()
			);
			this.$target.find('.playerInputs')
				.css({
					'float' : 'left',
					'width' : '40%',
					'height' : '100%'
				})
				.accordion({
					fillSpace: true
				});
			this.$target.find('.playerCodePreview')
				.css({
					'float' : 'left',
					'margin-left': '5px',
					'width' : '58%',
					'height' : '98%'
				})
				.tabs();
			
			var firstShow = true;
			// Add tab to tabInputPannel class
			this.$target.find('.tabInputPannel').tabs({
				'show':function(e, ui ){
					if( !firstShow ){
						_this.upatePlayerTabSelect( $( this ).data('inputSetId') );
					}
					firstShow = false;
				}
			});
			
			this.updatePlayerCodePreview();
		},
		getPlayerCodePreivew: function(){
			return $('<div />')
				.addClass('playerCodePreview')
				.append(
					$('<ul />').append(
						$('<li />').append(
								$('<a />')
									.attr( 'href', '#mweew-tab-player' )
									.text( gM('mwe-embedwizard-player') )
						),
						$('<li />').append(
							$('<a />')
								.attr( 'href', '#mweew-tab-code' )
								.text( gM('mwe-embedwizard-embedcode') )
						)
					),
					$('<div />').attr('id', 'mweew-tab-player').append(
						$('<p />').text( gM('mwe-embedwizard-player-desc')),
						$('<div />')
							.addClass("videoContainer")
							.css('overflow', 'hidden')
						
					),
					$('<div />').attr('id', 'mweew-tab-code').append(
						$('<p />').text( gM('mwe-embedwizard-embedcode-desc') ),
						$('<pre />')
						.addClass('brush: html')
						.css({
							'white-space' : 'pre-wrap !important',
							'width' : '90%',
							'height' : '400'
						})
					)
				);
		},
		upatePlayerTabSelect: function( inputSetId ){
			var _this = this;
			var inputTabs = this.getPlayerInputSet()[ inputSetId ].inputTabs;
			// check which tab is enabled: 
			$.each( inputTabs , function( tabKey, inputTypes ){
				var isActive = ( _this.$target.find('.tabInputPannel .ui-state-active a[href="#tabPanel-' + tabKey + '"]' ).length );
				$.each( inputTypes, function( key, conf){
					// Check if multiple count
					if( conf.count > 1){
						for( var i = 0; i < conf.count ; i++ ){
							mw.log("Set value: " + key + i + ' val: ' + $('#' + key +i ).val()  );
							var value = ( isActive )? $('#' + key +i ).val() : null;
							conf.update( _this, key, value, i );
						}
					} else {
						mw.log("clear value: " +key + ' target: ' + $('#' + key + '0' ) + ' isActive:' + isActive );
						var value = ( isActive )? $('#' + key + '0' ).val() : null;
						conf.update( _this, key, value, i);
					}
				});
			});
			_this.updatePlayerCodePreview();
		},
		updatePlayerCodePreview:function(){
			var _this = this;
			var playerString = $('<div />')
				.append( this.getTag() )
				.html()
				.replace( />/g, ">\n")
				.replace( /" /g, "\"\n" );

			// Update the textarea: 
			this.$target.find( '.playerCodePreview pre' ).text(
					'<script type="text/javascript" src="http://html5.kaltura.org/js"></script>' + "\n" + playerString
			).syntaxHighlighter();
			
			this.$target.find('.videoContainer').empty().append(
				playerString
			).find('video').embedPlayer();
		},
		getPlayerInputs: function(){
			if( this.$target.find( '.playerInputs').length == 0 ){
				this.$target.append(
					this.getPlayerInputTags()
						.addClass('playerInputs')
				);
			}
			return this.$target.find( '.playerInputs' );
		},
		getPlayerInputTags: function(){
			var _this = this;
			var $pSet = $('<div />');
			$.each( this.getPlayerInputSet(), function( inputKey, inputObject ){
				$pSet.append(
					$('<h3 />').append( 
						$('<a />')
						.attr('href','#')
						.text( gM('mwe-embedwizard-' + inputKey + '-title' ) )
					),
					_this.getInputPanel(inputKey, inputObject)
				);
			});
			// Make sure links point to a new target:
			$pSet.find('a').attr('target', '_new');
			return $pSet;
		},
		getInputPanel: function( inputKey, inputObject ){
			var _this = this;
			
			if( inputObject.inputTypes ){
				return $('<div />')
						.append(
								$('<p />').html( gM('mwe-embedwizard-' + inputKey + '-desc' ) ),
								_this.getInputSet( inputObject.inputTypes ) 
						);
			}
			
			// check if handling multiple tabs:
			if( inputObject.inputTabs ){
				$inputPanel = $('<div />')
					.addClass('tabInputPannel')
					.data( 'inputSetId', inputKey);
				$tabUl = $('<ul />').appendTo( $inputPanel );
				$.each(inputObject.inputTabs, function( tabKey, inputTypes ){
					var tabId =  'tabPanel-' + tabKey;
					// add the tab header
					$tabUl.append( 
						$('<li />').append(
							$('<a />')
							.attr( 'href', '#' + tabId )
							.text( gM('mwe-embedwizard-tabpanel-' + tabKey ) )
						)
					);
					$inputPanel.append(
						$('<div />')
						.attr( 'id', tabId )
						.append( 
							$('<p />').html( gM( 'mwe-embedwizard-tabpanel-' + tabKey + '-desc')  ),
							_this.getInputSet( inputTypes )
						)
					);
				});
				// add the tabUL and enable tabs:
				return $inputPanel;
			}
		},
		/**
		 * Gets the master tag we use for building out the player embed
		 */
		getTag: function(){
			var _this = this;
			if( ! _this.$media ){
				_this.$media = $('<video />');
				
				// Get the default tag setup:
				var defaultAttributes = mw.getConfig('EmbedWizard.DefaultAttributes');
				// Set all the defaults
				$.each( this.getPlayerInputSet(), function( inx, inputObject ) {
					if( inputObject.inputTypes ){
						$.each( inputObject.inputTypes, function( inputKey, inputItem ){
							inputItem.update( _this, inputKey, defaultAttributes[ inputKey ] );
						});
						return ;
					}
					if ( inputObject.inputTabs ){
						$.each( inputObject.inputTabs, function( tabKey, inputTypes ){
							if( _this.$target.find('.tabInputPannel .ui-state-active a[href="#tabPanel-' + tabKey + '"]' ).length ){
								// key is active set children
								$.each( inputTypes, function( inputKey, inputItem ){
									inputItem.update( _this, inputKey, defaultAttributes[ inputKey ] );
								});
							}
						});
					}
				});
			}
			return _this.$media;
		},
		getInputSet: function( inputTypes ){
			var _this = this;
			var $inputSet = $( '<table />' ).addClass( 'playerInput' );
			$.each( inputTypes, function( key, conf){
				var inputConf = $.extend( {}, _this.defaultInputConf, conf );
				// check if we need to duplicate the input set
				for( var i=0; i < inputConf.count; i++){
					$inputSet.append(
						_this.getInputRow( key, inputConf, i )
					);
				}
			});

			return $inputSet;
		},
		getInputRow:function( key, conf, inx ){
			var _this = this;
			// Get the default tag setup:
			var defaultAttributes = mw.getConfig('EmbedWizard.DefaultAttributes');
			
			return $('<tr />').append(
						$('<td />')
						.css('width', '10em' )
						.text(
							gM( 'mwe-embedwizard-' + key )
						),
						$('<td />').append(
							$('<input />').attr({
								'size' : conf.size,
								'type' : conf.type,
								'name' : key + inx,
								'id' :  key + inx,
								'value' : ( typeof defaultAttributes[key] == 'object' ) ? 
										defaultAttributes[ key ][ inx ] : defaultAttributes[ key ]
							})
							.data({
								'key' : key,
								'inx' : inx
							})
							.keyup(function(){
								// Don't enter non numeric values into int fields: 
								if( conf.format == 'int' ){
									 $(this).val( parseInt( $(this).val() ) );
								}
							})
							.change( function(){
								if( _this.validateInput( $(this).val(), conf.format ) ){
									// hide error
									$(this).siblings('.ui-state-error').remove();
									conf.update( _this, $(this).data('key'), $(this).val(), inx );
									_this.updatePlayerCodePreview();
								} else {
									$(this).siblings('.ui-state-error').remove();
									// show an error
									$(this).before(
										_this.getErrorMsg( 'mwe-embedwizard-error-input-' + conf.format )
									);
								}
							})
						)
					);
		},
		getErrorMsg: function( msgKey ){
			return $('<div />')
				.addClass("ui-state-error ui-corner-all")
				.css("padding", '0 .7em' )
				.append( 
					$('<p />')
					.append( 
						$('<span />')
						.addClass('ui-icon ui-icon-alert')
						.css({
							'float': 'left',
							'margin-right' : '.3em'
						}),
						gM( msgKey )
					)
				);
		},
		/**
		 * Validate input
		 */
		validateInput: function( value, format ){
			switch( format ){
				case 'string':
					return true;
					break;
				case 'int':
					return !isNaN( parseFloat( value)  );
					break;
				case 'time': 
					return ( mw.npt2seconds( value ) > 0 );
					break;
				case 'url': 
					return ( mw.isUrl( value ) );
					break;
			}
			return false;
		},
		/**
		 * Defines the default input type and all its settings:
		 */
		getDefaultInputConf: function() {
			return {
				'count' : 1,
				'format' : 'string',
				'size' : 10,
				'type' :'text',
				'update' : function( _this, attrName, val ){
					if( val == null ){
						_this.getTag().removeAttr( attrName );
					} else {
						_this.getTag().attr( attrName, val );
					}
				}
			};
		},
		getPlayerInputSet: function(){
			var _this = this;
			return {
				'sources': {
					'inputTabs':{
						'kaltura':{
							'kentryid' : _this.getDefaultInputConf(),
							'kwidgetid' : _this.getDefaultInputConf()
						},
						'httpsource':{
							'poster' : $.extend( {}, _this.getDefaultInputConf(),{
								'format' : 'url',
								'size' : 15
							}),
							'durationHint': $.extend( {}, _this.getDefaultInputConf(),{
								'format' : 'time',
								'size' : 4
							}),
							'src' : {
								'format': 'url',
								'count' : 3,
								'size' : 15,
								'update' : function( _this, attrName, val, inx ){
									var setObj = {};
									if( typeof val == 'string' ){
										if( $( _this.getTag() ).find( 'source' )[inx] ){
											$( $( _this.getTag() ).find( 'source' )[inx] ).attr('src', val );
										} else {
											$( '<source />' ).attr( 'src', val)
											.appendTo( _this.getTag() );
										}
										return ;
									} 
									if ( val == null && inx != null && $( _this.getTag() ).find( 'source' ).length ){
										$( $( _this.getTag() ).find( 'source' )[inx] ).remove();
										return ;
									}
									$.each( val, function( i, valItem ){
										if( $( _this.getTag() ).find( 'source' )[i] ){
											if( valItem == null ){
												$( $( _this.getTag() ).find( 'source' )[i] ).remove();
											} else {
												$( $( _this.getTag() ).find( 'source' )[i] ).attr('src', valItem );
											}
										} else if( valItem ) {
											$( '<source />' ).attr( 'src', valItem)
											.appendTo( _this.getTag() );
										}
									});
								}
							}
						}
					}
				},
				'size': {
					'inputTypes': {
						'width' : $.extend( {}, _this.getDefaultInputConf(),{
							'size' : 4,
							'format' : 'int'
						}),
						'height' : $.extend( {}, _this.getDefaultInputConf(),{
							'format' : 'int'
						})
					}				
				}
			};
	}
}
})( mw, window.jQuery );
