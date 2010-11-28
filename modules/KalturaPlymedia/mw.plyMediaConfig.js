/**
* PyMediaSubsConfig hooks into the pyMedia html5 libray
*/
mw.PyMediaSubsConfig = {
	bindPlayer: function( embedPlayer ){
		// add the pymedia ui to the player: 
		embedPlayer.$interface.append( /* py media absolute layout interface */ );
		
		// add any play event actions :
		$j( embedPlayer ).bind( 'play', function(){
		})
		
		// add any pause event actions :
		$j( embedPlayer ).bind( 'pause', function(){
			
		})
		
		// Add any time monitor event actions ( happens about 4 times a second )
		// if you need finer grain control you can setup your own timer  		
		$j( embedPlayer ).bind( 'monitorEvent', function(){
			// display something current time: 
			var currentTime = embedPlayer.currentTime;
		});
	
	}		
}