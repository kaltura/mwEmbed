// Shows a top level menu for all test files if ( not running an automated test and not part of doc page )
if( !window.QUnit ){
	var docPath = '../../../docs/';
	
	// output any blocking scripts that need to be ready before dom ready: 
	document.write( '<script src="' + docPath + 'bootstrap/js/bootstrap-tab.js"></script>' );
	document.write( '<script src="' + docPath + 'bootstrap/js/bootstrap-dropdown.js"></script>' );
	document.write( '<script src="' + docPath + 'js/jquery.prettyKalturaConfig.js"></script>' );
	
	// inject all the twitter bootstrap css and js ( ok to be injected after page is rendering )
	$('head').append(
		$( '<link rel="shortcut icon" href="' + docPath + 'css/favicon.ico">' ),
		$( '<link href="' + docPath + 'bootstrap/docs/assets/css/bootstrap.css" rel="stylesheet">' ),
		$( '<link href="' + docPath + 'css/kdoc.css" rel="stylesheet">'),
		// pretify: 
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
if( localStorage.kdoc_player == 'html5' && window['mw']){
	mw.setConfig("forceMobileHTML5", true);
}
// clock player render time
var kdocPlayerStartTime = new Date().getTime();
if( kWidget && kWidget.addReadyCallback ){
	kWidget.addReadyCallback( function( pId ){
		$( '#' + pId )[0].kBind("mediaReady", function(){
			$('body').append( '<div class="kdocPlayerRenderTime" style="clear:both;"><span style="font-size:11px;">player ready in:<i>' + ( new Date().getTime() - kdocPlayerStartTime )/1000 + '</i> seconds</span></div>');
			if( parent && parent.sycnIframeContentHeight ){
				parent.sycnIframeContentHeight();
			}
		});
	});
}
// the update player button: 
$(document).on('click',  '.kdocUpdatePlayer', function(){
	$('.kdocPlayerRenderTime').empty();
	kdocPlayerStartTime = new Date().getTime();
})

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
				return false;
			}),
			$('<span> to view the html5 player</span>' )
		)
	};
	
	// make code pretty
	window.prettyPrint && prettyPrint()	

});


