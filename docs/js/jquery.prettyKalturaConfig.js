// Add a jQuery plugin for pretty kaltura docs
(function( $ ){
	$.fn.prettyKalturaConfig = function( pluginName, pluginConfig, flashvarCallback ){
		var pluginManifest = {};
		
		return this.each(function() {
			var _this = this;
			
			/**
			 * Local getter methods
			 */
			function getAttrValue( attrName ){
				var attrValue = pluginManifest.attributes[ attrName ]['value'] || null;
				if( attrValue === true )
					attrValue = 'true';
				if( attrValue === false )
					attrValue = 'false';
				return attrValue;
			}
			function getAttrType( attrName ){
				return pluginManifest.attributes[ attrName ]['type'] || 'string';
			}
			function setAttrValue( attrName, attrValue ){
				pluginManifest.attributes[ attrName ]['value'] = attrValue;
				// refresh the $editVal
				pluginManifest.attributes[ attrName ].$editVal.getEditValue( attrName );
			}
			// jquery method to support editing attributes
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
							    			setAttrValue(attrName, 'true' );
							    		})
							    	),
							    	$('<li />').append(
							    		$('<a href="#">false</a>').click(function(){
							    			setAttrValue(attrName, 'false' );
							    		})
							    	)
							    )
						    )
						)
						$( this ).find('a').dropdown();
					break;
					case 'string':
					default:
						var activeEdit = false;
						var editHolder = this;
						var attrValue = getAttrValue( attrName ) || '<i>null</i>';
						$( this ).html( attrValue ).click(function(){
							if( activeEdit ){
								return ;
							}
							activeEdit = true;
							$( this ).html( '<input type="text" style="width:40px" />');
							$( this ).find('input').focus()
							.blur( function() {
								$( editHolder ).html( getAttrValue( attrName ) );
								activeEdit = false;
							} );
						});
					break;
				}
				return $( this );
				
			}; // end $.fn.getEditValue plugin
			
			function getAttrDesc( attrName ){
				if( pluginManifest.attributes[ attrName ][ 'doc' ] ){
					return pluginManifest.attributes[ attrName ][ 'doc' ];
				}
			}
			function getAttrEdit(){
				var $tbody = $('<tbody />');
				// for each setting get config
				$.each( pluginManifest.attributes, function( attrName, attr){
					// only list "editable" attributes: 
					if( attr.edit ){
						// setup local pointer to $editVal:
						attr.$editVal = $('<div />').getEditValue( attrName ) ;
						$tbody.append( 
							$('<tr />').append( 
								$('<td />').text( attrName ),
								$('<td />').append( attr.$editVal ),
								$('<td />').text( getAttrDesc( attrName ) )
							)
						)
						// Setup a pointer to the editVal
						
					}
				});
				// Check for flashvar callback; 
				var $updatePlayerBtn = flashvarCallback ? $( '<a class="btn">Update player</a>').click( function(){
					var flashvars = {};
					$.each( pluginManifest.attributes, function( attrName, attr ){
						flashvars[ pluginName +'.' + attrName ] = getAttrValue( attrName );
					});
					flashvarCallback( flashvars );
				} ): $();
				
				return $('<div />').append( 
							$('<table />')
							.addClass('table table-bordered table-striped')
							.append(
								$('<thead />').append(
									$('<tr><th>Attribute</th><th>Value</th><th>Description</th></tr>')
								),
								$tbody
							),
							$updatePlayerBtn
						)
				
			}
			function getFlashvarConfig(){
				var fvText = "flashvars: {\n";
				$.each( pluginManifest.attributes, function( attrName, attr ){
					// flashvar is only for override ( only included edit attr ):
					if( attr.edit ){
						fvText+="\t\"" + pluginName +'.' + attrName + '\" : ' + getAttrValue( attrName ) + "\n";
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
				$.each( pluginManifest.attributes, function( attrName, attr){
					if( attrName != 'plugin' ){
						uiText+= "\n\t" + attrName + '="' +  getAttrValue( attrName )  + '" ';
					}
				});
				// should be moved and or check for override
				uiText +="\n/>";
				
				return $('<div />').append( 
						$('<pre class="prettyprint linenums" />').text( uiText ),
						$('<span>UiConf XML can be inserted via <a target="top" href="http://www.kaltura.org/modifying-kdp-editing-uiconf-xml">KMC api</a>:</span>') 
					);
			}
			function getPlayerStudioLine(){
				var plText ='';
				$.each( pluginManifest.attributes, function( attrName, attr){
					// only for override ( only included edit attr ):
					if( attr.edit ){
						plText += '&' + pluginName + '.' + attrName + '=' + getAttrValue( attrName );
					}
				})
				return $('<div />').append( 
						$('<pre />').text( plText ),
						$( '<span>Can be used with the player studio <i>"additional paramaters"</i> plug-in line</span>')
					)
			}
			
			/**
			 * Init
			 */
			var id = $(this).attr('id');
			// set the target to loading while documentation is loaded
			$( this ).html('Loading <span class="blink">...</span>');
			var _this = this;
			// get the attributes from the manifest for this plugin: 
			// testing files always ../../ from test
			$.getJSON( '../../../pluginManifest.php?plugin_id=' + pluginName , function( pluginData ){
			
				// update the pluginManifest
				pluginManifest = pluginData;
				// merge in player config values:
				for( var key in pluginManifest.attributes ){
					if( pluginConfig[ key ] ){
						pluginManifest.attributes[ key ]['value'] = pluginConfig[ key ];
					}
				}
				
				$( _this ).empty().append(
					// output tabs:
					$('<div class="tabbable tabs-left" />')
					.css('width', '650px')
					.append(
						$('<ul class="nav nav-tabs" />').append(
							'<li><a href="#tab-docs-' + id +'" data-toggle="tab">edit</a></li>' +
							'<li><a href="#tab-flashvars-' + id +'" data-toggle="tab">flashvars</a></li>' +
							'<li><a href="#tab-uiconf-' + id + '" data-toggle="tab">uiConf</a></li>' +
							'<li><a href="#tab-pstudio-'+ id +'" data-toggle="tab">player studio line</a></li>'
						),
						$('<div class="tab-content" />').append(
							$('<div class="tab-pane active" id="tab-docs-' + id + '" />').append(
									getAttrEdit()
								),
						 	$('<div class="tab-pane active" id="tab-flashvars-' + id + '" />').append(
						 			getFlashvarConfig()
						 		),
						 	$('<div class="tab-pane active" id="tab-uiconf-' + id + '" />').append(
						 			getUiConfConfig()
						 		),
						 	$('<div class="tab-pane active" id="tab-pstudio-' + id + '" />').append(
						 			getPlayerStudioLine()
						 		)
						)
					)
				); 
				// show the first tab:
				$( _this ).find('a:first').tab('show');
			});
			
		}); // each plugin closure
	}
})( jQuery );