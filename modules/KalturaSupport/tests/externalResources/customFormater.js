mw.kalturaPluginWrapper(function(){
	mw.util.formaters().register({
		'reverse': function( value){
			return value.split("").reverse().join("");
		}
	});
});