// Add a jQuery plugin for pretty kaltura docs
(function( $ ){
	$.fn.prettyKalturaConfig = function( pluginName, flashVars, flashvarCallback ){
		var manifestData = {};
		
		return this.each(function() {
			/**
			 * Init
			 */
			// setup _this pointer
			var _this = this;
			// setup master id for ( this )
			var id = $(this).attr('id');
			// set the target to loading while documentation is loaded
			$( this ).html('Loading <span class="blink">...</span>');
			var _this = this;
			/**
			 * get a var object from plugin style location or from top level var 
			 */
			function getVarObj( attrName ){
				// check for plugin config: 
				if(  manifestData[pluginName].attributes &&  
						manifestData[pluginName].attributes[ attrName ] ){
					return manifestData[pluginName].attributes[ attrName ];
				}
				// check for raw value object: 
				if( manifestData[attrName] ){
					return manifestData[attrName]; 
				}
				return {};
			}
			/**
			 * set an attr value
			 */
			function setAttrValue( attrName, attrValue ){
				if( manifestData[pluginName].attributes &&  
						manifestData[pluginName].attributes[ attrName ] ){
					manifestData[pluginName].attributes[ attrName ].value = attrValue;
					// refresh the value
					manifestData[pluginName].attributes[ attrName ].$editVal.getEditValue( attrName );
				} else if( manifestData[attrName] ){
					manifestData[attrName].value = attrValue;
					// refresh the value
					manifestData[attrName].$editVal.getEditValue( attrName );
				}
			};
			
			/**
			 * Local getter methods
			 */
			function getJsonQuoteValue( attrName ){
				var val = getAttrValue( attrName )
				if( val === 'true' || val == 'false' ){
					return val
				}
				return '"' + val + '"';
			}
			function getAttrValue( attrName ){
				var attrValue = getVarObj( attrName ).value || null;
				if( attrValue === true )
					attrValue = 'true';
				if( attrValue === false )
					attrValue = 'false';
				return attrValue;
			}
			function getAttrType( attrName ){
				return getVarObj( attrName )['type'] || 'string';
			}
			// jQuery method to support editing attributes
			$.fn.getEditValue = function( attrName ){
				// switch on edit types: 
				switch( getAttrType( attrName ) ){
					case 'boolean':
						$( this ).html( 
							$('<div class="btn-group" />').append(
								$('<a class="btn dropdown-toggle" data-toggle="dropdown" href="#" />' ).append(
									getAttrValue( attrName ) + ' ' +
									'<span class="caret"></span>'
								), 
								$('<ul class="dropdown-menu" />').append(
									$('<li />').append(
										$('<a href="#">true</a>').click(function(){
											// activate button
											$('#btn-update-player-' + id ).removeClass('disabled');
											setAttrValue(attrName, 'true' );
										})
									),
									$('<li />').append(
										$('<a href="#">false</a>').click(function(){
											// activate button
											$('#btn-update-player-' + id ).removeClass('disabled');
											setAttrValue(attrName, 'false' );
										})
									)
								)
							)
						)
						$( this ).find('a').dropdown();
					break;
					case 'enum':
						var $enumUlList = $('<ul class="dropdown-menu" />');
						var valueObj = getVarObj( attrName );
						var enumList = valueObj['enum'];
						$.each( enumList, function( inx, eVal ){
							$enumUlList.append(
								$('<a href="#" />')
								.text( eVal )
								.click(function(){
									// activate button
									$('#btn-update-player-' + id ).removeClass('disabled');
									setAttrValue( attrName, eVal );
								})	
							)
						});
						$( this ).html(
							$('<div class="btn-group" />').append(
								$('<a class="btn dropdown-toggle" data-toggle="dropdown" href="#" />' ).append(
									getAttrValue( attrName ) + ' ' +
									'<span class="caret"></span>'
								), 
								$enumUlList
							)
						);
						$( this ).find('a').dropdown();
					break;
					case 'string':
					default:
						var activeEdit = false;
						var editHolder = this;
						
						var getValueDispaly = function( attrName ){
							var attrValue = getAttrValue( attrName ) || '<i>null</i>';
							if( getAttrType( attrName ) == 'url'  &&  getAttrValue( attrName ) !== null ){
								attrValue = $('<span />').append(
									$('<a />').attr({
										'href': getAttrValue( attrName ),
										'target' : "_new"
									}).append(
										$('<i />').addClass('icon-share')
									),
									attrValue
								)
							}
							return attrValue
						}
						$( this ).css('overflow-x', 'hidden').html( getValueDispaly( attrName ) ).click(function(){
							if( activeEdit ){
								return ;
							}
							activeEdit = true;
							$( this ).html( 
								$('<input type="text" style="width:100px" />').val( getAttrValue( attrName ) )
							);
							$( this ).find('input').focus()
							.bind('keyup', function(e){
								// de-blur on enter:
								if( e.keyCode == '13' ){
									$(this).blur();
								}
							})
							.blur( function() {
								// activate button
								$('#btn-update-player-' + id ).removeClass('disabled');
								setAttrValue( attrName, $(this).val() );
								$( editHolder ).html(  getValueDispaly( attrName ) );
								activeEdit = false;
							} );
						});
					break;
				}
				return $( this );
				
			}; // end $.fn.getEditValue plugin
			
			function getAttrDesc( attrName ){
				if( getVarObj(  attrName )[ 'doc' ] ){
					return getVarObj(  attrName )[ 'doc' ];
				}
			}
			function getAttrEdit(){
				var $tbody = $('<tbody />');
				// for each setting get config
				$.each( manifestData[pluginName].attributes, function( attrName, attr){
					// only list "editable" attributes: 
					if( !attr.hideEdit ){
						// setup local pointer to $editVal:
						attr.$editVal = $('<div />').getEditValue( attrName ) ;
						$tbody.append( 
							$('<tr />').append( 
								$('<td />').text( attrName ),
								$('<td />').addClass('tdValue').append( attr.$editVal ),
								$('<td />').html( getAttrDesc( attrName ) )
							)
						)
					}
				});
				
				// Check for flashvars: 
				var $fvBody = '';
				var $fvTbody = $('<tbody />');
				$.each( manifestData, function( attrName, attr){
					// skip the plugin
					if( attrName == pluginName ){
						return true;
					}
					if( $fvBody == '' ){
						$fvBody = $('<div />').append( $( '<b />').text( 'flashvars / uiConf vars:' ) );
					}
					attr.$editVal = $('<div />').getEditValue( attrName );
				
					$fvTbody.append(
						$('<tr />').append( 
								$('<td />').text( attrName ),
								$('<td class="tdValue" />').append( attr.$editVal ),
								$('<td />').html( getAttrDesc( attrName ) )
							)
					);
				});
				var $tableHead = $('<thead />').append(
					$('<tr><th style="width:140px">Attribute</th><th style="width:160px">Value</th><th>Description</th></tr>')
				);
				if( $fvBody != '' ){
					$fvBody.append(
						$('<table />')
						.addClass('table table-bordered table-striped')
						.append( 
							$tableHead.clone(),
							$fvTbody 
						)
					)
				} else {
					$fvBody = $();
				}
				
				// Check for flashvar callback; 
				var $updatePlayerBtn = flashvarCallback ? 
						$( '<a id="btn-update-player-' + id +'" class="btn disabled">' )
						.addClass('kdocUpdatePlayer')
						.text( 'Update player' )
						.click( function(){
							var flashvars = {};
							$.each( manifestData, function( pName, attr ){
								if( pName == pluginName ){
									$.each( manifestData[pName].attributes, function( attrName, attr ){
										flashvars[ pluginName +'.' + attrName ] = getAttrValue( attrName );
									} )
								} else {
									flashvars[ pName ] = attr.value;
								}
							});
							flashvarCallback( flashvars );
							// restore disabled class ( now that the player is up-to-date )
							$( this ).addClass( 'disabled')
				} ): $();
				
				return $('<div />').append( 
							$('<table />')
							.addClass('table table-bordered table-striped')
							.append(
								$tableHead,
								$tbody
							),
							$fvBody,
							$updatePlayerBtn,
							$('<p>&nbsp;</p>')
						)
				
			}
			function getFlashvarConfig(){
				var fvText = "flashvars: {\n";
				$.each( manifestData, function( pName, attr ){
					if( pName == pluginName ){
						$.each( manifestData[ pluginName].attributes, function( attrName, attr ){
							if( !attr.hideEdit && getAttrValue( attrName) !== null ){
								fvText += "\t\"" + pluginName +'.' + attrName + '\" : ' + getJsonQuoteValue( attrName ) + "\n";
							}
						})
					} else {
						fvText += "\t\"" + pName + "\" : " + getJsonQuoteValue( pName ) + "\n";
					}
				});
				fvText+="}\n";
				return $('<div />').append( 
							$('<pre class="prettyprint linenums" />').text( fvText ),
							$('<span>Flashvar JSON can be used with <a target="top" href="../../../docs/index.php?path=Embeding#kwidget">kWidget.embed</a>:</span>') 
						);
			}
			function getUiConfConfig(){
				var uiText = '<Plugin id="' + pluginName + '" ';
				$.each( manifestData[ pluginName].attributes, function( attrName, attr){
					if( attrName != 'plugin' && getAttrValue( attrName) !== null ){
						uiText+= "\n\t" + attrName + '="' +  getAttrValue( attrName )  + '" ';
					}
				});
				// should be moved and or check for override
				uiText +="\n/>";
				
				// add uiConf vars
				$.each( manifestData, function( pAttrName, attr ){
					if( pAttrName == pluginName ){
						return true;
					}
					uiText += "\n" + '<var key="' + pAttrName + '" value="' + getAttrValue( pAttrName ) +'" />';
				});
				
				return $('<div />').append( 
						$('<pre class="prettyprint linenums" />').text( uiText ),
						$('<span>UiConf XML can be inserted via <a target="top" href="http://www.kaltura.org/modifying-kdp-editing-uiconf-xml">KMC api</a>:</span>') 
					);
			}
			function getPlayerStudioLine(){
				var plText ='';
				$.each( manifestData[ pluginName].attributes, function( attrName, attr){
					// only for override ( only included edit attr ):
					if( !attr.hideEdit ){
						plText += '&' + pluginName + '.' + attrName + '=' + getAttrValue( attrName );
					}
				})
				// add top level flash vars: 
				$.each( manifestData, function( pAttrName, attr ){
					if( pAttrName == pluginName ){
						return true;
					}
					plText += '&' + pAttrName + '=' + getAttrValue( pAttrName );
				});
				
				return $('<div />').append( 
						$('<pre />').text( plText ),
						$( '<span>Can be used with the player studio <i>"additional paramaters"</i> plug-in line</span>')
					)
			}
			
			// build the list of basevars
			var baseVarsList = '';
			$.each( flashVars, function( fvKey, fvValue ){
				baseVarsList+= fvKey + ',';
			})
			// get the attributes from the manifest for this plugin: 
			// testing files always ../../ from test
			var request = '../../../docs/configManifest.php?plugin_id=' + 
							pluginName + '&vars=' + baseVarsList;
			
			$.getJSON( request, function( data ){
				// check for error: 
				if( data.error ){
					$( _this ).html( data.error );
					return ;
				}
				
				manifestData = data;
				// merge in player config values into manifestData
				$.each( flashVars, function( fvKey, fvValue ){
					if( fvKey == pluginName  ){
						for( var pk in fvValue ){
							if( ! manifestData[ pluginName ].attributes[ pk ] ){
								manifestData[ pluginName ].attributes[ pk ] = {};
							}
							manifestData[ pluginName ].attributes[ pk ].value = fvValue[pk];
						}
						// continue
						return true;
					}
					// Check for prefixed vars ( pluginName.varKey )
					if( fvKey.indexOf( pluginName ) === 0 ){ 
						var fvParts = fvKey.split('.');
						manifestData[ pluginName ].attributes[ fvParts[1] ] = fvValue;
						// continue
						return true;
					} 
					manifestData[ fvKey ].value = fvValue;
				});
				$textDesc = '';
				if( manifestData[ pluginName ]['description'] ){
					$textDesc = $('<div />').html( manifestData[ pluginName ]['description'] );
				}
				$( _this ).empty().append(
					$textDesc,
					// output tabs:
					$('<div class="tabbable tabs-left" />')
					.css('width', '780px')
					.append(
						$('<ul class="nav nav-tabs" />').append(
							'<li><a data-getter="getAttrEdit" href="#tab-docs-' + id +'" data-toggle="tab">edit</a></li>' +
							'<li><a data-getter="getFlashvarConfig" href="#tab-flashvars-' + id +'" data-toggle="tab">flashvars</a></li>' +
							'<li><a data-getter="getUiConfConfig" href="#tab-uiconf-' + id + '" data-toggle="tab">uiConf</a></li>' +
							'<li><a data-getter="getPlayerStudioLine" href="#tab-pstudio-'+ id +'" data-toggle="tab">player studio line</a></li>'
						),
						$('<div class="tab-content" />').append(
							$('<div class="tab-pane active" id="tab-docs-' + id + '" />'),
						 	$('<div class="tab-pane active" id="tab-flashvars-' + id + '" />'),
						 	$('<div class="tab-pane active" id="tab-uiconf-' + id + '" />'),
						 	$('<div class="tab-pane active" id="tab-pstudio-' + id + '" />')
						)
					)
				); 
				// setup show bindings
				$( _this ).find('a[data-toggle="tab"]').on('show', function( e ){
					$( $( this ).attr( 'href' ) ).html(
						eval( $( this ).attr( 'data-getter' ) + '()' )
					)
					// make the code pretty
					window.prettyPrint && prettyPrint();
					// make sure ( if in an iframe ) the content size is insync:
					if( parent && parent['sycnIframeContentHeight'] ) {
						 parent.sycnIframeContentHeight();
					}
				});
				// show the first tab:
				$( _this ).find('.nav-tabs a:first').tab('show');
				
			});
			
		}); // each plugin closure
	}
})( jQuery );