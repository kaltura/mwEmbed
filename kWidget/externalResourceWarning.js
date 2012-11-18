var warning = "External resources can't set via flashvars";
if( console && console.warn ){
	console.warn( warning );
} else {
	alert( warning );
}