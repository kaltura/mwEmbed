( function( mw, $ ) { "use strict";

	mw.addKalturaPlugin( ['mw.Peer5'], 'peer5', function( embedPlayer, callback){
		// do user agent checks {
//
//		var getMajorVersionNumber=function(fullVersion){
//          var arr = fullVersion.split('.');
//          var number = parseInt(arr[0]);
//          return number;
//        };
//
//		var detectBrowser=function () {
//            var N = navigator.appName, ua = navigator.userAgent, tem;
//            var M = ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
//            if (M && (tem = ua.match(/version\/([\.\d]+)/i)) != null) M[2] = tem[1];
//            M = M ? [M[1], M[2]] : [N, navigator.appVersion, '-?'];
//            return M;
//        };
//
//		var getMajorVersionNumber=function(fullVersion){
//          var arr = fullVersion.split('.');
//          var number = parseInt(arr[0]);
//          return number;
//        };
//
//		var browserDetails = detectBrowser();
//        var browserName = browserDetails[0].toLowerCase();
//        var browserVersion = getMajorVersionNumber(browserDetails[1]);
//
//		if( browserName == 'chrome' && browserVersion > 25 ){
//			embedPlayer.peer5 = new mw.Peer5( embedPlayer, callback );
//			return ;
//		}
//
		//be sure to issue callback if not running plugin:
    	embedPlayer.peer5 = new mw.Peer5( embedPlayer, callback );

        //callback();
		
	});


})( window.mw, jQuery );
