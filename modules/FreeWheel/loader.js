mw.addResourcePaths({
	"mw.freeWheelController": "mw.freeWheelController.js",
	"tv.freewheel.SDK" : "freeWheelAdMannager.js"
		
});

mw.addModuleLoader( 'FreeWheel', [
    'mw.freeWheelController',
]);

mw.setConfig( 'FreeWheel.AdManagerUrl', 'http://adm.fwmrm.net/p/release/latest-JS/adm/prd/AdManager.js');