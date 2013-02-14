function getBootStrapPath(){
	var scripts = document.getElementsByTagName('script');
	for(var i=0; i < scripts.length ; i++ ){
		var script = scripts[i];
		if( script.src && script.src.indexOf( 'doc-bootstrap.js') !== -1 ){
			return script.src.replace( 'doc-bootstrap.js', '' );
		}
	}
}
// Shows a top level menu for all test files if ( not running an automated test and not part of doc page )
if( !window.QUnit ){
	// find the current path: 
	var baseBootStrapUrl = getBootStrapPath();
	window.kDocPath = baseBootStrapUrl + '../../docs/';
	// output any blocking scripts that need to be ready before dom ready: 
	document.write( '<script src="' + kDocPath + 'bootstrap/js/bootstrap-tab.js"></script>' );
	document.write( '<script src="' + kDocPath + 'bootstrap/js/bootstrap-dropdown.js"></script>' );
	document.write( '<script src="' + kDocPath + 'js/jquery.prettyKalturaConfig.js"></script>' );
	document.write( '<script src="' + kDocPath + 'js/kWidget.featureConfig.js"></script>' );
	// kwidget auth: 
	document.write( '<script src="' + kDocPath + '../kWidget/kWidget.auth.js"></script>' );
	
	// inject all the twitter bootstrap css and js ( ok to be injected after page is rendering )
	$( 'head' ).append(
		$( '<link rel="shortcut icon" href="' + kDocPath + 'css/favicon.ico">' ),
		$( '<link href="' + kDocPath + 'bootstrap/docs/assets/css/bootstrap.css" rel="stylesheet">' ),
		$( '<link href="' + kDocPath + 'css/kdoc.css" rel="stylesheet">'),
		// bootstrap-modal
		$( '<script type="text/javascript" src="' + kDocPath + 'bootstrap/js/bootstrap-modal.js"></script>' ),
		// pretify: 
		$( '<script src="' + kDocPath + 'bootstrap/docs/assets/js/google-code-prettify/prettify.js"></script>' ),
		$( '<link href="' + kDocPath + 'bootstrap/docs/assets/js/google-code-prettify/prettify.css" rel="stylesheet">' ),
		// color picker:
		$( '<link rel="stylesheet" media="screen" type="text/css" href="' + kDocPath + 'js/colorPicker/css/colorpicker.css" />' ),
		$( '<script type="text/javascript" src="' + kDocPath + 'js/colorPicker/js/colorpicker.js"></script>' ),
		// dialog box: 
		$( '<script type="text/javascript" src="' + kDocPath + 'js/bootbox.min.js"></script>' )
	);
	// check if we should enable google analytics: 
	// TODO remove dependency on mw
	if( typeof mw != 'undefined' && mw.getConfig( 'Kaltura.PageGoogleAalytics' ) ) {
		var _gaq = _gaq || [];
		_gaq.push(['_setAccount', mw.getConfig( 'Kaltura.PageGoogleAalytics' ) ]);
		_gaq.push(['_trackPageview']);
		(function() {
			var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
			ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
			var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
		})();
	}
} else{
	// provide a stub for prettyKalturaConfig so that tests don't have javascript errors:
	$.fn.prettyKalturaConfig = function( pluginName, flashVars, flashvarCallback ){
		$(this).text( 'running qunit test');
	};
	// provide a stub for featureConfig for running tests ( just directly map to kWidget.embed )
	kWidget.featureConfig = function( embedOptions ){
		kWidget.embed( embedOptions );
	}
	// hide all prettyconfig: 
	$(function(){
		$('pre.prettyprint').hide();
	});
}
window.isKalturaDocsIframe = false;
// Detect if in an doc iframe:
if( window.parent && window.parent['mw'] && window.parent.mw.getConfig('KalutraDocContext') ){
	window.isKalturaDocsIframe = true;
} else {
	// if not in an iframe add some padding
	$('head').append(
		$('<style>body{padding:15px}</style>')
	);
}
// Set kdocEmbedPlayer to html5 by default:
if( ! localStorage.kdocEmbedPlayer ){
	localStorage.kdocEmbedPlayer = 'html5';
}


// don't set flag if any special properties are set: 
if( localStorage.kdocEmbedPlayer == 'html5' && window['mw'] && 
		mw.getConfig( 'Kaltura.LeadWithHTML5') == null &&
		mw.getConfig( 'disableForceMobileHTML5') == null 
){
	mw.setConfig('Kaltura.LeadWithHTML5', true);
}
// clock player render time
var kdocPlayerStartTime = new Date().getTime();
if( typeof kWidget != 'undefined' && kWidget.addReadyCallback ){
	var alreadyRun = false;
	kWidget.addReadyCallback( function( pId ){
		$( '#' + pId )[0].kBind("mediaReady.pTimeReady", function(){
			if( alreadyRun ){
				return ;
			}
			alreadyRun = true;
			// note kUnbind seems to unbind all mediaReady
			//$( '#' + pId )[0].kUnbind(".pTimeReady");
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
	// Add header styles:
	// add some classes 
	if( isKalturaDocsIframe ){
		$('h2').first().wrap( 
			$('<div>').addClass('page-bg-gradient kdoc-header')
		)
	}
	
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
	
	$('#playbackModeSelector').append(
		$('<span>').addClass('divider'),
		$('<a>').attr({
			'href': '#',
			'title': "Lead with the HTML5 player"
		}).append(
			$('<i>').addClass('kpcicon-html5'),
			$('<span>').text("HTML5 Player")
		).click(function(){
			localStorage.kdocEmbedPlayer = 'html5';
			location.reload();
			return false;
		}),
		$('<a>').attr({
			'href': '#',
			'title': "Lead with Flash player where available"
		}).append(
			$('<i>').addClass('kpcicon-flash'),
			$('<span>').text( "Flash Player")
		).click(function(){
			localStorage.kdocEmbedPlayer = 'flash';
			location.reload()
			return false;
		})
	)
	// TODO special case test pages that have to do with player selection
	if( localStorage.kdocEmbedPlayer == 'html5' ){
		$('#playbackModeSelector').find( '.kpcicon-html5' ).parent().addClass('active');
	} else {
		$('#playbackModeSelector').find( '.kpcicon-flash' ).parent().addClass('active');
	};
	
	// make code pretty
	window.prettyPrint && prettyPrint();

});


