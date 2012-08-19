// Shows a top level menu for all test files if ( not running an automated test and not part of doc page )
if( !window.QUnit ){
	var docPath = '../../../docs/';
	// inject all the twitter bootstrap css and js: 
	$('head').append(
			$( '<link rel="shortcut icon" href="' + docPath + 'css/favicon.ico">' ),
			$( '<link href="' + docPath + 'bootstrap/docs/assets/css/bootstrap.css" rel="stylesheet">' ),
			$( '<link href="' + docPath + 'css/kdoc.css" rel="stylesheet">'),
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
	
	$('#playbackModeSelector').html(
		'To view the <b>HTML5</b> player <a class="adjust-your-preferences" href="#">adjust your preferences.</a>'
	);
	// make code pretty
	window.prettyPrint && prettyPrint()	

});

// Add a jQuery plugin for pretty kaltura docs
(function( $ ){
	$.fn.prettyKalturaConfig = function( pluginName, options ){
		var settings = $.extend( {
			'plugin'	: true,
		}, options);			
		
		function getFlashvarConfig(){
			
		}
		function getUiConfConfig(){
			
		}
		function getPlayerStudioLine(){
			
		}
		
		return this.each(function() {
			var id = $(this).attr('id');
			$( this ).empty().append(
				// output tabs:
				$('<div class="tabbable tabs-left">' +
					'<ul class="nav nav-tabs">' +
						'<li class="active"><a href="#tab-flashvars-' + id +'">flashvars</a></li>' +
						'<li><a href="#tab-uiconf-' + id + '">uiConf</a></li>' +
						'<li><a href="#tab-pstudio-'+ id +'">player studio line</a></li>' +
					'</ul>' +
					'<div class="tab-content">' +
					 	'<div class="tab-pane active" id="tab-flashvars-' + id + '"></div>' +
					 	'<div class="tab-pane active" id="tab-uiconf-' + id + '"></div>' +
					 	'<div class="tab-pane active" id="tab-pstudio-' + id + '"></div>' +
					'</div>' +
				'</div>'
				)
			);
		});
	}
})( jQuery );

