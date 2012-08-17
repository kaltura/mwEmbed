// Shows a top level menu for all test files if ( not running an automated test and not part of doc page )
if( !window.QUnit ){
	var docPath = '../../../docs/';
	// inject all the twitter bootstrap css and js: 
	$('head').append(
			$( '<link rel="shortcut icon" href="' + docPath + 'css/favicon.ico">' ),
			$( '<link href="' + docPath + 'bootstrap/docs/assets/css/bootstrap.css" rel="stylesheet">' ),
			$( '<link href="' + docPath + 'css/kdoc.css" rel="stylesheet">')
	);
}

// detect if in an doc iframe:
if( window.parent && window.parent['mw'] && window.parent.mw.getConfig('KalutraDocContext') ){
	window.isKalturaDocsIframe =  true;
}