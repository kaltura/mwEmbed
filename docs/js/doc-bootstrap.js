// Shows a top level menu for all test files if ( not running an automated test and not part of doc page )
if( !window.QUnit ){
	var docPath = '../../../docs/';
	// inject all the twitter bootstrap css and js: 
	$('head').append(
			$( '<link rel="shortcut icon" href="' + docPath + 'css/favicon.ico">' ),
			$( '<link href="' + docPath + 'bootstrap/docs/assets/css/bootstrap.css" rel="stylesheet">' ),
			$( '<link href="' + docPath + 'css/kdoc.css" rel="stylesheet">'),
			
			$( '<script src="' + docPath + 'bootstrap/js/bootstrap-tab.js"></script>' ),
			
			// prettify: 
			$( '<script src="' + docPath + 'bootstrap/docs/assets/js/google-code-prettify/prettify.js"></script>' ),
			$( '<link href="' + docPath + 'bootstrap/docs/assets/js/google-code-prettify/prettify.css" rel="stylesheet">' )
	);
}

// detect if in an doc iframe:
if( window.parent && window.parent['mw'] && window.parent.mw.getConfig('KalutraDocContext') ){
	window.isKalturaDocsIframe =  true;
} else {
	// if not in an iframe add some padding
	$('head').append(
		$('<style>body{padding:15px}</style>')
	);
}
// document ready events:
$(function(){
	// Do any configuration substitutions
	if( localStorage.kdoc_html5url ){
		$('pre.prettyprint').each(function(){
			$(this).html( $(this).html().replace('{{HTML5LibraryURL}}', localStorage.kdoc_html5url) )
		})
	}
	
	// make active all the pref links:
	$('.adjust-your-preferences').click(function(){
		// invoke the pref menu
		return false;
	})
	
	// TODO special case test pages that have to do with player selection
	if( localStorage.kdoc_player == 'html5' ){
		mw.setConfig("forceMobileHTML5", true);
		$('#playbackModeSelector').append(
			$( '<span>Forcing <i>HTML5 player</i>, </span>' ),
			$( '<a href="#">restore browser default</a>').click(function(){
				localStorage.kdoc_player = 'default';
				location.reload()
			}),
			$( '<span> ( flash if enabled ) </span>' )
		)
	} else {
		$('#playbackModeSelector').append(
			$('<a href="#">Force HTML5</a> ').click( function(){
				localStorage.kdoc_player = 'html5';
				location.reload()
			}),
			$('<span> to view the html5 player</span>' )
		)
	};
	
	// make code pretty
	window.prettyPrint && prettyPrint()	

});

// Add a jQuery plugin for pretty kaltura docs
(function( $ ){
	$.fn.prettyKalturaConfig = function( pluginName, options ){
		var settings = $.extend( {
			'plugin'	: true,
		}, options);			
		
		return this.each(function() {
			var _this = this;
			/**
			 * Local getter methods
			 */
			function getAttrValue( attrName ){
				var attrValue = settings[ attrName ] || '<i>null</i>';
				if( attrValue === true )
					attrValue = 'true';
				if( attrValue === false )
					attrValue = 'false';
				return attrValue;
			}
			function getAttrDocumentation(){
				var $tbody = $('<tbody />');
				// for each setting get config
				$.each( settings.attrData, function( attrName, attrDesc){
					$tbody.append( 
						$('<tr />').append( 
							$('<td />').text( attrName ),
							$('<td />').html( getAttrValue( attrName ) ),
							$('<td />').text( attrDesc )
						)
					)
				});
				
				return $('<table />')
						.addClass('table table-bordered table-striped')
						.append(
						$('<thead />').append(
							$('<tr><th>Attribute</th><th>Value</th><th>Description</th></tr>')
						),
						$tbody
					)				
			}
			function getFlashvarConfig(){
				var fvText = "flashvars: {\n";
				$.each( settings.attrData, function( attrName, attrDesc){
					fvText+="\t\"" + pluginName +'.' + attrName + '\" : ' + getAttrValue( attrName ) + "\n";
				});
				fvText+="}\n";
				return $('<div />').append( 
							$('<pre class="prettyprint linenums" />').text( fvText ),
							$('<span>Flashvar JSON can be used with <a target="top" href="../../../docs/index.php?path=Embeding#kwidget">kWidget.embed</a>:</span>') 
						);
			}
			function getUiConfConfig(){
				var uiText = '<Plugin id="' + pluginName + '" ';
				$.each( settings.attrData, function( attrName, attrDesc){
					if( attrName != 'plugin' ){
						uiText+= attrName + '="' +  getAttrValue( attrName )  + '" ' + "\n";
					}
				});
				// should be moved and or check for override
				uiText +=' width="0%" height="0%" includeInLayout="false" />';
				
				return $('<div />').append( 
						$('<pre class="prettyprint linenums" />').text( uiText ),
						$('<span>UiConf XML can be inserted via <a target="top" href="http://www.kaltura.org/modifying-kdp-editing-uiconf-xml">KMC api</a>:</span>') 
					);
			}
			function getPlayerStudioLine(){
				var plText ='';
				$.each( settings.attrData, function( attrName, attrDesc){
					plText += '&' + pluginName + '.' + attrName + '=' + getAttrValue( attrName );
				})
				return $('<pre />').text( plText );
			}
			
			/**
			 * Init
			 */
			var id = $(this).attr('id');
			// set the target to loading while documentation is loaded
			$( this ).html('Loading <span class="blink">...</span>');
			
			// get the attributes
			//$.get()
			settings.attrData = {
					'plugin': 'If the anlytics plugin is enabled'
			}
			
			$( this ).empty().append(
				// output tabs:
				$('<div class="tabbable tabs-left" />')
				.css('width', '800px')
				.append(
					$('<ul class="nav nav-tabs" />').append(
						'<li><a href="#tab-docs-' + id +'" data-toggle="tab">docs</a></li>' +
						'<li><a href="#tab-flashvars-' + id +'" data-toggle="tab">flashvars</a></li>' +
						'<li><a href="#tab-uiconf-' + id + '" data-toggle="tab">uiConf</a></li>' +
						'<li><a href="#tab-pstudio-'+ id +'" data-toggle="tab">player studio line</a></li>'
					),
					$('<div class="tab-content" />').append(
						$('<div class="tab-pane active" id="tab-docs-' + id + '" />').append(
								getAttrDocumentation()
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
			$( this ).find('a:first').tab('show');
			
		}); // each closure
	}
})( jQuery );

