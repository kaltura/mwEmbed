mw.kalturaPluginWrapper(function(){
	mw.util.formaters().register({
		'escape': function( value ){
			return escape( value );
		},
		'reverse': function( value){
			return value.split("").reverse().join("");
		}
	});
});