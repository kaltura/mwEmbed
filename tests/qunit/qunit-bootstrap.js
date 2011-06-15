if( document.URL.indexOf('runQunitTests') != -1 ){		
	document.write('<link rel="stylesheet" href="http://code.jquery.com/qunit/git/qunit.css" type="text/css" media="screen" /><script src="http://code.jquery.com/jquery-latest.js"></script><script type="text/javascript" src="http://code.jquery.com/qunit/git/qunit.js"></script><script type="text/javascript" src="http://staging.html5video.org/testswarm/js/inject.js"></script>');
	document.write('<h1 id="qunit-header">QUnit Test Runner</h1><h2 id="qunit-banner"></h2><div id="qunit-testrunner-toolbar"></div><h2 id="qunit-userAgent"></h2><ol id="qunit-tests"></ol><div id="qunit-fixture">test markup, will be hidden</div>');
}

var qunitSetup = function() {
	if( document.URL.indexOf('runQunitTests') != -1 ){		
		QUnit.config.autostart = false;
		$(document).ready(function(){
			queueTests();
		});
	}
}


// jqueryless domready from http://www.javascriptkit.com/dhtmltutors/domready.shtml

if( document.URL.indexOf('runQunitTests') != -1 ){		
	var alreadyrunflag=0 //flag to indicate whether target function has already been run

	if (document.addEventListener)
		document.addEventListener("DOMContentLoaded", function(){alreadyrunflag=1; qunitSetup()}, false)
	else if (document.all && !window.opera){
		document.write('<script type="text/javascript" id="contentloadtag" defer="defer" src="javascript:void(0)"><\/script>');
		var contentloadtag=document.getElementById("contentloadtag");
		contentloadtag.onreadystatechange=function(){
			if (this.readyState=="complete"){
				alreadyrunflag=1;
				qunitSetup();
			}
		}
	}

	window.onload=function(){
		setTimeout("if (!alreadyrunflag) qunitSetup()", 0)
	}
}
