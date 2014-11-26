var warning = "External resources can't set via flashvars, please set in uiConf instead.";
if( console && console.warn ){
	console.warn( warning );
} else {
	//alert( warning );
}