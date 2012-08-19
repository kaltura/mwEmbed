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
	
	// TODO special case test pages that have to do with player selection
	if( localStorage.kdoc_player == 'html5' ){
		mw.setConfig("forceMobileHTML5", true);
		$('#playbackModeSelector').append(
			$( '<span>Forcing <i>HTML5</i> player, </span>' ),
			$( '<a href="#">restore browser default</a>').click(function(){
				localStorage.kdoc_player = 'default';
				location.reload()
			}),
			$( '<span>( flash if enabled )</span>' )
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
					 	'<div class="tab-pane active" id="tab-flashvars-' + id + '"> fv </div>' +
					 	'<div class="tab-pane active" id="tab-uiconf-' + id + '"> uiconf </div>' +
					 	'<div class="tab-pane active" id="tab-pstudio-' + id + '"> ui vars</div>' +
					'</div>' +
				'</div>'
				)
			);
		});
	}
})( jQuery );

