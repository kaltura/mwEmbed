// shows a top level menu for all test files if ( not running an automated test and not part of doc page )
if( !window.QUnit ){
	var docPath = '../../../docs/';
	// inject all the twiter bootstrap css and js: 
	document.write( "" + 
			'<link rel="shortcut icon" href="' + docPath + 'css/favicon.ico">' + 
			'<link href="' + docPath + 'css/kdoc.css" rel="stylesheet">'
	);
	// output the top nav: 
}