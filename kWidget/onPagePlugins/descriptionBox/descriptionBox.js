kWidget.addReadyCallback( function( playerId ){
	var kdp = document.getElementById(playerId);
	//var $ 	= kWidget.getJQuery();
	kdp.kBind( "mediaReady", function(){
		var descriptionTitle	= kdp.evaluate('{descriptionBox.descriptionLabel}') || kdp.evaluate('{mediaProxy.entry.name}'); 
		$("#descriptionBox_"+playerId).remove();
		$(kdp).after( 
			$("<div>")
			.css("height", kdp.evaluate('{descriptionBox.boxHeight}') )
			.attr("id", "descriptionBox_"+playerId)
			.append( 
				$("<h2>")
				.text(descriptionTitle),
				$("<p>")
				.html(kdp.evaluate('{mediaProxy.entry.description}') )
			)
		)
	});

});