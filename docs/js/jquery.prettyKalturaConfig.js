// Add a jQuery plugin for pretty kaltura docs
(function( $ ){
	// this is an embarrassing large list of params, should consolidate once feature config wraps everything. 
	$.fn.prettyKalturaConfig = function( pluginName, flashvars, flashvarCallback, showSettingsTab, pageEmbed ){
		var manifestData = {};
		
		return this.each(function() {
			/**
			 * Init
			 */
			// Setup _this pointer
			var _this = this;
			// setup master id for ( this )
			var id = $(this).attr('id');
			// set the target to loading while documentation is loaded
			$( this ).html('Loading <span class="blink">...</span>');
			var _this = this;
			/**
			 * Get a var object from plugin style location or from top level var 
			 */
			function getVarObj( attrName ){
				
				// Check for plugin config: 
				if(  manifestData[pluginName] && manifestData[pluginName].attributes &&  
						manifestData[pluginName].attributes[ attrName ] )
				{
					return manifestData[pluginName].attributes[ attrName ];
				}
				
				// Check other plugins
				for( var pid in manifestData ){
					if( manifestData[ pid ] && manifestData[ pid ].attributes &&
							manifestData[ pid ].attributes[ attrName ]	)
					{
						return manifestData[ pid ].attributes[ attrName ];
					}
				}
				
				// Check for raw value object: 
				if( manifestData[attrName] ){
					return manifestData[attrName]; 
				}
				
				return {};
			}
			/**
			 * Set an attr value
			 */
			function setAttrValue( attrName, attrValue ){
				if( manifestData[pluginName] && manifestData[pluginName].attributes &&  
						manifestData[pluginName].attributes[ attrName ] ){
					manifestData[pluginName].attributes[ attrName ].value = attrValue;
					// refresh the value
					manifestData[pluginName].attributes[ attrName ].$editVal.getEditValue( attrName );
				} else if( manifestData[attrName] ){
					manifestData[attrName].value = attrValue;
					// refresh the value
					manifestData[attrName].$editVal.getEditValue( attrName );
				} else {
					// look for other plugins with this property:
					for( var pid in manifestData ){
						if( manifestData[pid].attributes ){
							for( var pAttrName in manifestData[pid].attributes ){
								if( pAttrName == attrName ){
									manifestData[pid].attributes[ attrName ].value = attrValue;
									// refresh the value
									manifestData[pid].attributes[ attrName ].$editVal.getEditValue( attrName );
								}
							}
						}
					}
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
				var attrValue = ( typeof getVarObj( attrName ).value != 'undefined' ) ? 
									getVarObj( attrName ).value :
									null;
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
					case 'list':
						$( this ).empty();
						$listBtnGroup = $('<div class="btn-group">').append(
							'<a class="btn dropdown-toggle" data-toggle="dropdown" href="#">' +
								'Set active' +
								'<span class="caret"></span>' +
							'</a>'
						);
						$listUl =$( '<ul class="dropdown-menu">');
						var valueObj = getVarObj( attrName );
						var list = valueObj[ 'list' ];
						var valueSet = getAttrValue( attrName ).split(',');
						$.each( list, function( key, title){
							var valueIndex = $.inArray( key, valueSet );
							$li = $( '<li> ')
								.append( 
									$('<a>')
									.css('cursor', 'pointer')
									.text( title )
									.click(function( event ){
										valueSet = getAttrValue( attrName ).split(',');
										valueIndex = $.inArray( key, valueSet );
										if( valueIndex == -1 ){
											$( this ).prepend( $('<i class="icon-ok">' ) );	
											setAttrValue( attrName, valueSet.join( ',' ) + ',' + key );
										} else {
											$( this ).find('i').remove();
											valueSet.splice( valueIndex, 1 );
											setAttrValue( attrName, valueSet.join( ',' ) );
										}
										// set update player button to active
										$('#btn-update-player-' + id ).removeClass('disabled');
									})
								)
							if( valueIndex != -1 ){
								$li.find('a').prepend( $('<i class="icon-ok">' ) );
							}
							$listUl.append( $li );
						});
						// add to this target:
						$( this ).append( 
								$listBtnGroup.append( $listUl )
						)
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
					case 'color':
						var getHtmlColor = function(){
							return ( getAttrValue( attrName ) + "" ).replace('0x', '#' );
						}
						
						var $colorSelector =  $('<div />')
							.css({
								'width': '20px',
								'height': '20px',
								'border': 'solid thin black',
								'backgroundColor' : getHtmlColor(),
								'float' : 'left'
							})
							.addClass('colorSelector')
						$( this ).empty().append( 
							$colorSelector,
							$('<span />')
								.css( 'margin-left', '10px' )
								.text( getHtmlColor() )
						)
						$colorSelector.ColorPicker({
							color: getHtmlColor(),
							onShow: function ( colpkr ) {
								$( colpkr ).fadeIn( 500 );
								return false;
							},
							onHide: function (colpkr) {
								$( colpkr ).fadeOut( 500 );
								return false;
							},
							onChange: function (hsb, hex, rgb) {
								$colorSelector.css('backgroundColor', '#' + hex);
								// activate button
								$('#btn-update-player-' + id ).removeClass('disabled');
								setAttrValue( attrName, '0x' + hex );
							}
						});
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
			function getTableHead(){
				return $('<thead />').append(
						$('<tr><th style="width:140px">Attribute</th><th style="width:160px">Value</th><th>Description</th></tr>')
				);
			}
			/**
			 * Get the set of configured flashvars
			 */
			function getConfiguredFlashvars(){
				var configuredFlashvars = $.extend( {}, flashvars );
				$.each( manifestData, function( pName, attr ){
					if( pName == pluginName || attr.attributes ){
						$.each( manifestData[pName].attributes, function( attrName, attr ){
							if( ! configuredFlashvars[ pName ] ){
								configuredFlashvars[ pName ] = {};
							}
							configuredFlashvars[ pName ] [ attrName ] = getAttrValue( attrName );
						} )
					} else {
						configuredFlashvars[ pName ] = attr.value;
					}
				});
				return configuredFlashvars;
			}
			
			function getAttrEdit(){
				
				var $mainPlugin = '';
				
				var $tbody = $('<tbody />');
				// for each setting get config
				if( manifestData[pluginName] ){
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
					// add to main plugin:
					$mainPlugin = $('<table />')
						.addClass('table table-bordered table-striped')
						.append(
							getTableHead(),
							$tbody
						);
				}
				
				var $otherPlugins = $( '<div />' );
				// Check for secondary plugins:
				$.each( manifestData, function( otherPluginId, pluginObject ){
					if( pluginObject.attributes && pluginName != otherPluginId  ){
						$otherPlugins.append( 
								$('<span />').text( pluginObject.description )
							);
						var $otherPluginTB =  $('<tbody />');
						$.each( pluginObject.attributes, function( attrName, attr ){
							// for secondary plugins we only ad stuff for which we have fv
							// setup local pointer to $editVal:
							if( !attr.hideEdit && flashvars[ otherPluginId ][ attrName ] ){
								attr.$editVal = $('<div />').getEditValue( attrName ) ;
								$otherPluginTB.append( 
									$('<tr />').append( 
										$('<td />').text( attrName ),
										$('<td />').addClass('tdValue').append( attr.$editVal ),
										$('<td />').html( getAttrDesc( attrName ) )
									)
								)
							}
						});
						$otherPlugins.append( 
								$('<table />')
								.addClass('table table-bordered table-striped')
								.append( 
									getTableHead(),
									$otherPluginTB
								)
						);
					}
				});
				
				// Check for flashvars: 
				var $fvBody = '';
				var $fvTbody = $('<tbody />');
				$.each( manifestData, function( attrName, attr){
					// check if we should skip the plugin
					if( attrName == pluginName || attr.attributes || attr.hideEdit ){
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
			
				if( $fvBody != '' ){
					$fvBody.append(
						$('<table />')
						.addClass('table table-bordered table-striped')
						.append( 
							getTableHead(),
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
							// update hash url with settings:
							var win = ( self == top ) ? window : top;
							win.location.hash = 'config=' + JSON.stringify(
								getChangedSettingsHash()
							);
							
							flashvarCallback( getConfiguredFlashvars() );
							// restore disabled class ( now that the player is up-to-date )
							$( this ).addClass( 'disabled')
				} ) : $();
				
				return $('<div />').append( 
							$mainPlugin,
							$otherPlugins,
							$fvBody,
							$updatePlayerBtn,
							$('<p>&nbsp;</p>')
						)
			}
			function noramlizeValue( val ){
				// normalize boolean: 
				if( val == "true" )
					val = true;
				if( val == "false" )
					val = false;
				return val;
			}
			function getObjectDiff( obj1, obj2 ){
				var settingsChanged = {};
				$.each( obj1, function( pKey, pVal ){
					pVal = noramlizeValue( pVal );
					if( !obj2[ pKey ] || pVal != obj2[ pKey ] ){
						if( typeof obj1[ pKey ] == 'object' 
							&& 
							typeof obj2[ pKey ] == 'object' )
						{
							$.each( obj1[ pKey ], function( spKey, spVal ){
								spVal = noramlizeValue( spVal );
								if( spVal !=  obj2[ pKey ][ spKey ] ){
									if( typeof settingsChanged[ pKey ] == 'undefined' ){
										settingsChanged[ pKey ] = {};
									}
									settingsChanged[ pKey ][ spKey ]  = spVal;
								}
							})
						} else {
							settingsChanged[pKey] = pVal;
						}
					}
				});
				return settingsChanged;
			}
			function getChangedSettingsHash(){
				// get all the edit values that changed ( single config depth )
				var flashVarsChanged = getObjectDiff( getConfiguredFlashvars(),  pageEmbed.flashvars );
				// remove any flashvars that had hidden edit or ks:
				$.each( manifestData, function( pName, attr ){
					if( attr.attributes){
						$.each( attr.attributes, function( subKey, subAttr){
							// never include the ks in what we hand off to others: 
							if( subKey == 'ks'  && flashVarsChanged[ pName ][subKey] ){
								delete( flashVarsChanged[ pName ][subKey] );
							}
							if( subAttr.hideEdit ){
								delete( flashVarsChanged[ pName ][ subKey ] );
							}
						} )
					} else {
						if( attr.hideEdit ){
							delete( flashVarsChanged[ pName ] );
						}
						// never include the ks in what we hand off to others: 
						if( pName == 'ks'  && flashVarsChanged[ pName ] ){
							delete( flashVarsChanged[ pName ] );
						}
					}
				})
				
				// remove empty objects
				$.each( flashVarsChanged, function( inx, value ){
					if( typeof value == 'object' && $.isEmptyObject( value ) ){
						delete( flashVarsChanged[inx] );
					}
				})
				// get any local settings overides: 
				var settingsChanged = getObjectDiff( kWidget.getLocalFeatureConfig( pageEmbed ), pageEmbed ); 
				// update settings flashvars chaged 
				settingsChanged.flashvars = flashVarsChanged;
				return settingsChanged;
			}
			function getShare(){
				$shareDiv = $('<div>').append(
					$('<span>')
						.text( 'Share your current integration settings for this page:' ),
					$('<br>'),$('<br>')
				);
				
				
				var shareUrl = '';
				// check if we are in an iframe or top level page: 
				var doc = ( self == top ) ? document : top.document;
				shareUrl = doc.URL.split( '#' )[0] + '#config=' + JSON.stringify(
					getChangedSettingsHash()
				);
				
				// add input box:
				$shareDiv.append( 
					$('<input>')
						.attr('type', 'text')
						.css('width', '600px')
						.val( shareUrl )
						.click( function(){
							$(this)[0].select() 
						}),
					$('<br>'),
					$('<a>')
						.attr({
							'href': shareUrl,
							'target': '_new'
						})
						.text( "Open in a new tab" )
				)
				
				
				return $shareDiv;
			}
			
			function getEmbed(){
				var kdp = $('#' + pageEmbed.targetId )[0];
				// get config short-cut:
				var gC = function( attr ){
					return kdp.evaluate( '{' + attr + '}' );
				}
				// check if done loading yet 
				if( !kdp || !kdp.evaluate || gC( 'playerStatusProxy.kdpStatus' )!= 'ready' ){
					return 'Player is not ready';
				}
				// add main values:  
				var partner_id =gC( 'configProxy.kw.partnerId' ),
				wid = gC( 'configProxy.kw.id' ),
				uiconf_id = gC( 'configProxy.kw.uiConfId' ),
				entry_id = gC( 'mediaProxy.entry.id' ); // can be null ( playlist for example )
				// setup metadata:
				var metaHTML = "\t" + '<!-- Search engine metadata, based on schema.org/VideoObject -->' + "\n";
				var entryDirectMap = ['description', 'name', 'duration', 'thumbnailUrl' ];
				$.each( entryDirectMap, function(inx, key ){
					if( gC( 'mediaProxy.entry.' + key ) ){
						metaHTML+= "\t" + '<span itemprop="' + key + '" ' + 
							'content="' +gC( 'mediaProxy.entry.' + key ) + '"></span>' + "\n";
					}
				})
				// add height & width: 
				metaHTML+= "\t" + '<span itemprop="width" content="' + $(kdp).width() + '"></span>' + "\n" +
					"\t" + '<span itemprop="height" content="' + $(kdp).height() + '"></span>' + "\n";
				
				// get the playerId
				var playerId = 'kaltura_player_' + new Date().getTime();
				
				// the kWidget embed line: 
				var kWidgetEmbedCall = '<script>' + "\n" +
					"\t" + 'kWidget.embed({' + "\n" +
					"\t\t" + 'targetId: "' + playerId + "\",\n" + 
					"\t\t" + 'wid: "' +  wid + "\",\n" +
					"\t\t" + 'uiconf_id: "' + uiconf_id + "\",\n";
				if( entry_id ){
					kWidgetEmbedCall+= "\t\t" + 'entry_id: "' + entry_id + "\",\n";
				}
				// add flashvars:
				kWidgetEmbedCall+= getFlashvarConfig("\t\t");
				
				kWidgetEmbedCall+='})' + "\n" +
					'</script>';
				
				// get the script url
				var scriptUrl = mw.getConfig('Kaltura.ServiceUrl') + '/p/' + partner_id + '/sp/' + partner_id + 
					'00/embedIframeJs/uiconf_id/' + uiconf_id + '/partner_id/' + partner_id;
				// TODO do an ajax check against the version of the library
				// this way we won't need all the comments
				//var api = new kWidget.api( { 'wid' : '_' + partner_id });
				
				var currentUrl = kWidget.getPath() + 'mwEmbedLoader.php' +
					'/partner_id/' + partner_id + '/uiconf_id/' + uiconf_id;
				
				$embedCode = $( '<div>' )
				.append(
					$('<span>').html( "For production embeds, " +
						"its recommended you copy settings into your uiConf"
					),
					$('<br>'),
					$('<span>').html( 
						'Also production library urls should be used, more info on <a href="http://html5video.org/wiki/Kaltura_HTML5_Configuration#Controlling_the_HTML5_library_version_for_.com_uiConf_urls">' + 
							'setting production library versions' + 
						'</a>' ), 
					/*$('<pre>').addClass( 'prettyprint linenums' )
					.text(
						'<script src="' + scriptUrl + '"></script>' + "\n"
					),*/
					$('<br>'),
					$('<b>').text( "Testing embed: "),
					$('<span>').text( "production embeds should use production script urls:"),
					$('<pre>')
					.addClass( 'prettyprint linenums' )
					.text(
						'<!-- Testing URL, production usage should use production urls! -->' + "\n"+
						'<script src="' + currentUrl + '"></script>' + "\n\n" +
						'<script>' + "\n" +
						"// You can improve performance, by coping settings to your uiConf, and removing this flag\n" +
						"\t" + 'mw.setConfig(\'Kaltura.EnableEmbedUiConfJs\', true);' + "\n" +
						'</script>' + "\n" +
						'<div id="' + playerId + '" ' + 
							'style="width:' + $(kdp).width() + 'px;' + 
								'height:' + $(kdp).height() + 'px;" ' +
							'itemprop="video" itemscope itemtype="http://schema.org/VideoObject" >' + "\n" +
							metaHTML + 
						'</div>' + "\n" +
						kWidgetEmbedCall
					)
				)
				return $embedCode;
			}
			
			
			/**
			 * Flashvar config tab:
			 */
			function getFlashvarConfig( baseTabs ){
				if( ! baseTabs ){
					baseTabs ='';
				}
				var fvText = baseTabs + "flashvars: {\n";
				var mCount =0;
				$.each( manifestData, function( pName, attr ){
					mCount++;
				});
				var inx = 0;
				$.each( manifestData, function( pName, attr ){
					var coma = ',';
					inx++;
					if( inx == mCount ){
						coma = '';
					}
					if( manifestData[ pName ].attributes){
						fvText+= baseTabs + "\t\"" + pName +'": {' + "\n";
						var aCount =0;
						$.each( manifestData[ pName ].attributes, function( attrName, attr ){
							if( getAttrValue( attrName) !== null ){
								aCount++;
							}
						});
						var aInx =0;
						$.each( manifestData[ pName ].attributes, function( attrName, attr ){
							if( getAttrValue( attrName) !== null ){
								var aComa = ',';
								aInx++;
								if( aInx == aCount ){
									aComa = '';
								}
								
								fvText += baseTabs + "\t\t\"" + attrName + '\" : ' + getJsonQuoteValue( attrName ) + aComa +"\n";
							}
						})
						fvText+= baseTabs + "\t}" + coma + "\n";
					} else {
						fvText += baseTabs +  "\t\"" + pName + "\" : " + getJsonQuoteValue( pName ) + coma +"\n";
					}
				});
				fvText+= baseTabs +  "}\n";
				return fvText;
			}
			function getFlashvarConfigHTML(){
				return $('<div />').append( 
					$('<pre class="prettyprint linenums" />').text( getFlashvarConfig() ),
					$('<span>Flashvar JSON can be used with <a target="top" href="../../../docs/index.php?path=Embeding#kwidget">kWidget.embed</a>:</span>') 
				);
			}
			/**
			 * UiConf tab
			 */
			function getUiConfConfig(){
				var uiText = '';
				// add uiConf vars
				$.each( manifestData, function( pAttrName, attr ){
					if( manifestData[ pAttrName ].attributes ){
						uiText += '<Plugin id="' + pAttrName + '" ';
						$.each( manifestData[ pAttrName ].attributes, function( attrName, attr){
							if( attrName != 'plugin' && getAttrValue( attrName) !== null ){
								uiText+= "\n\t" + attrName + '="' +  getAttrValue( attrName )  + '" ';
							}
						});
						uiText +="\n/>\n";
						return true;
					}
					uiText += "\n" + '<var key="' + pAttrName + '" value="' + getAttrValue( pAttrName ) +'" />';
				});
				
				return $('<div />').append( 
						$('<pre class="prettyprint linenums" />').text( uiText ),
						$('<span>UiConf XML can be inserted via <a target="top" href="http://www.kaltura.org/modifying-kdp-editing-uiconf-xml">KMC api</a>:</span>') 
					);
			}
			/**
			 * player studio tab
			 */
			function getPlayerStudioLine(){
				var plText ='';
				var and = '';
				// add top level flash vars: 
				$.each( manifestData, function( pAttrName, attr ){
					if( manifestData[ pAttrName ].attributes ){
						$.each( manifestData[ pAttrName ].attributes, function( attrName, attr){
							plText += and + pAttrName + '.' + attrName + '=' + getAttrValue( attrName );
							and ='&';
						})
						return true;
					}
					// else flat attribute:
					plText += and + pAttrName + '=' + getAttrValue( pAttrName );
					and ='&';
				});
				
				return $('<div />').append( 
						$('<pre />').text( plText ),
						$( '<span>Can be used with the player studio <i>"additional paramaters"</i> plug-in line</span>')
					)
			}
			
			
			// build the list of basevars
			var baseVarsList = '';
			$.each( flashvars, function( fvKey, fvValue ){
				baseVarsList+= fvKey + ',';
			})
			// get the attributes from the manifest for this plugin: 
			// testing files always ../../ from test
			var request = window.kDocPath + 'configManifest.php?plugin_id=' +
							pluginName + '&vars=' + baseVarsList;
			$.getJSON( request, function( data ){
				// check for error: 
				if( data.error ){
					$( _this ).html( data.error );
					return ;
				}
				
				manifestData = data;
				// merge in player config values into manifestData
				$.each( flashvars, function( fvKey, fvValue ){
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
					if( typeof fvValue == 'object' ){
						for( var pk in fvValue ){
							if( ! manifestData[ fvKey ].attributes[ pk ] ){
								manifestData[ fvKey ].attributes[ pk ] = {};
							}
							manifestData[ fvKey ].attributes[ pk ].value = fvValue[pk];
						}
					} else {
						if( !manifestData[ fvKey ] ){
							manifestData[ fvKey ] = {};
						}
						manifestData[ fvKey ].value = fvValue;
					}
				});
				$textDesc = '';
				if( manifestData[ pluginName ] && manifestData[ pluginName ]['description'] ){
					$textDesc = $('<div />').html( manifestData[ pluginName ]['description'] );
				}
				
				function getEditTabs(){
					// conditionally include liShare and liEmbed
					var	$liShare = $();
					var $liEmbed = $();
					if( showSettingsTab ){
						$liShare = $('<li><a data-getter="getShare" href="#tab-share-'+ id +'" data-toggle="tab">Share</a></li>');
						$liEmbed = $( '<li><a data-getter="getEmbed" href="#tab-embed-'+ id +'" data-toggle="tab">Embed</a></li>' );
					}
					
					// only add share 
					// output tabs:
					return $('<div class="tabbable tabs-left" />')
					.css('width', '800px')
					.append(
						$('<ul class="nav nav-tabs" />').append(
							$('<li><a data-getter="getAttrEdit" href="#tab-docs-' + id +'" data-toggle="tab">Edit</a></li>'),
							$liShare,
							$liEmbed,
							// disable flashvars ( not needed when we have 'embed' tab ) 
							// '<li><a data-getter="getFlashvarConfigHTML" href="#tab-flashvars-' + id +'" data-toggle="tab">flashvars</a></li>' +
							$('<li><a data-getter="getUiConfConfig" href="#tab-uiconf-' + id + '" data-toggle="tab">uiConf xml</a></li>'),
							$('<li><a data-getter="getPlayerStudioLine" href="#tab-pstudio-'+ id +'" data-toggle="tab">Player Studio Line</a></li>')
						),
						$('<div class="tab-content" />').append(
							$('<div class="tab-pane active" id="tab-docs-' + id + '" />'),
							$('<div class="tab-pane active" id="tab-share-' + id + '" />'),
							$('<div class="tab-pane active" id="tab-embed-' + id + '" />'),
						 	//$('<div class="tab-pane active" id="tab-flashvars-' + id + '" />'),
						 	$('<div class="tab-pane active" id="tab-uiconf-' + id + '" />'),
						 	$('<div class="tab-pane active" id="tab-pstudio-' + id + '" />')
						)
					)
				}
				/** 
				 * Outputs the settings file
				 */
				function getSettings(){
					$settings = $('<div>').append(
						'Global settings, will be saved to your browsers session.'
					);
					// add a kWidget login button:
					$settings.append( 
						$('<br>'), $('<br>'),
						$('<div>').attr( "id", "hostedAuthWidget" ),
						$('<br>'), $('<br>')
					)
					// Supports edit ks ( most important ) 
					var $tbody = $('<tbody />');

					function getInput( key ){
						var fullKey = 'kdoc-embed-' + key;
						return $('<input>')
						.data('key', fullKey )
						.attr('type',"text")
						.css("width","100px")
						.val( 
							localStorage[ fullKey ] ? localStorage[ fullKey ] : ''
						)
					}
					
					// ( if the pretty widget config was called with kWidget settings )
					$tbody.append(
						$('<tr>').append(
							$('<td>').text( 'Kaltura secret key' ),
							$('<td>').append(
								getInput( 'ks' )
							),
							$('<td>').html( "<b>Kaltura secret key</b> used for plugins that require a KS for authenticated actions." +
								"<br><i>Note:</i> You must set widget and entries to pull from your account to conduct respective admin actions"
							)
						)
					)

					// Supports setting diffrent "wid" / partner
					$tbody.append(
						$('<tr>').append(
							$('<td>').text( 'wid id'),
							$('<td>').append( 
								getInput( 'wid' )
							),
							$('<td>').html( "<b>wid</b> A widget for associating the player with " +
								"your account. This value is usually is an underscore ( _ ) " +
								"followed by your partner id."
							)
						)
					)
					// Supports setting diffrent uiconf
					$tbody.append(
						$('<tr>').append(
							$('<td>').text( 'uiconf id'),
							$('<td>').append( 
								getInput( 'uiconf_id' )
							),
							$('<td>').html( "<b>uiconf id</b> The player id. " +
								"Customizing this value, enables you to test integrations on custom players"
							)
						)
					)
					// Supports settings diffrent entryid ( where applicable )
					$tbody.append(
						$('<tr>').append(
							$('<td>').text( 'entry id'),
							$('<td>').append( 
								getInput( 'entry_id' )
							),
							$('<td>').html( "<b>entry id</b> The media entry id. " +
								"Customizing this value, enables you to test integrations on a given entry. " + 
								"For edit actions be sure the entry is from your acccount."
							)
						)
					)
					
					// Add the settings table:
					$settings.append(
						$('<table />')
						.addClass('table table-bordered table-striped')
						.append(
							getTableHead(),
							$tbody
						)
					)
					// Add the "save" button
					$settings.append(
						$( '<a id="btn-update-player-' + id +'" class="btn">' )
						.text( 'Save settings' )
						.click(function(){
							var saveBtn = this;
							// remove alerts(
							$settings.find('.alert-info').fadeOut();
							$settings.find('input').each(function( inx, input){
								// update respective local storage:
								localStorage[ $(input).data('key') ] = $(input).val();
							});
							// saved locally there is no cost ( but create appearnce of time passing )
							$(this).text('saving...').addClass('disabled');
							// update the embed player
							flashvarCallback( flashvars );
							// update the edit tabs:
							getAttrEdit();
							// just put in a timeout
							setTimeout(function(){
								$( saveBtn).text( 'Save settings' ).removeClass( 'disabled' );
							},1000);
						}),
						$('<span>').text(' '),
						$( '<a id="btn-update-player-' + id +'" class="btn">' )
						.text( 'Clear settings' )
						.click(function(){
							var clearBtn = this;
							$settings.find('input').each(function( inx, input){
								// update respective local storage:
								delete( localStorage[ $(input).data('key') ] );
								$(input).val('');
							});
							// cleared locally there is no cost ( but create appearnce of time passing )
							$(this).text('clearing...').addClass('disabled');
							// update the embed player
							flashvarCallback( flashvars );
							// update the edit tabs:
							getAttrEdit();
							// Clear settings
							setTimeout(function(){
								$( clearBtn).text( 'Clear settings' ).removeClass( 'disabled' );
							},1000);
						})
					);
					return $settings;
				}
				/***
				 * A tool to list all uiConfs assoicated with a given account.
				 */
				function getUiConfUpdateHelper( input, userObject ){
					var $uiConfIcon = $('<span>').addClass( 'icon-cog' )
					.click( function(){
						// 
						var pos = $(this).position()
						
						var $uiConfList = $('<div>')
						.css({
							'position': 'absolute',
							'top' : pos.top,
							'left': pos.left
						})
						.text( 'loading ...' )
						.insertAfter( this )
					})
					.insertAfter( input );
				}
				
				
				var once = false;
				function showEditTab(){
					if( !once ){
						$( _this ).find( 'a[data-getter="getAttrEdit"]' ).click();
					}
					once = true;
				}
				var settingTabHtml = ( showSettingsTab ) ? 
						'<li><a data-getter="getSettings" href="#tab-settings-' + id +'" data-toggle="tab">Settings</a></li>' :
						'';
				$( _this ).empty().append(
					$('<div />')
					.css({
						'width': '800px',
						'margin-bottom': '10px'
					})
					.append(
						$('<ul class="nav nav-tabs" />').append(
							'<li><a href="#tab-desc-' + id +'" data-toggle="tab">Description</a></li>' +
							'<li><a data-getter="showEditTab" href="#tab-edit-' + id +'" data-toggle="tab">Integrate</a></li>' +
							settingTabHtml
						),
						$('<div class="tab-content" />').append(
							$('<div class="tab-pane active" id="tab-desc-' + id + '" />').append( $textDesc ),
						 	$('<div class="tab-pane active" id="tab-edit-' + id + '" />').append( getEditTabs() ),
						 	$('<div class="tab-pane active" id="tab-settings-' + id + '" />')
						)
					)
				);
				// setup show bindings
				$( _this ).find('a[data-toggle="tab"]').on('show', function( e ){
					var $tabTarget = $( $( this ).attr( 'href' ) );
					// Check for data-getter:
					if( $( this ).attr( 'data-getter' ) ){
						$tabTarget.html(
							eval( $( this ).attr( 'data-getter' ) + '()' )
						)
					}
					// update settings from global settings if set:
					if( $('#hostedAuthWidget').length ){
						var $authDoc = $('<span>').text(' Login to kaltura to auto-populate wid and ks settings' )
						$('#hostedAuthWidget').after( 
							$authDoc
						).css('display', 'inline');
						// add widget binding
						kWidget.auth.getWidget( "hostedAuthWidget", function( userObject ){
							if( !userObject.ks || !userObject.partnerId ){
								$authDoc.text( " Login error." );
								return ;
							}
							$authDoc.text( " Set wid and ks from login " );
							$updatedWarn = $('<div>')
								.addClass( 'alert alert-info' )
								.text(
									'Updated from login'
								)
							$tabTarget.find('input').each(function( inx, input){
								// update ks:
								if( $( input ).data('key') == 'kdoc-embed-ks' ){
									if( $( input ).val() != userObject.ks ){
										$( input ).val( userObject.ks ).after( $updatedWarn.clone() )
									}
								}
								// update wid
								if( $( input ).data('key') == 'kdoc-embed-wid' ){
									if( $( input ).val() != '_' + userObject.partnerId ){
										$( input ).val( '_' + userObject.partnerId ).after( $updatedWarn.clone() )
									}
								}
								// update uiconf_id with select tool: 
								if( $( input ).data('key') == 'kdoc-embed-uiconf_id' ){
									getUiConfUpdateHelper( input, userObject );
								}
								// re-embed the player: 
								$('#btn-update-player-' + id ).click();
							});
						});	
					}
					
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
