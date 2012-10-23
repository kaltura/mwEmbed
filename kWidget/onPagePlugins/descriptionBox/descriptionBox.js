kWidget.addReadyCallback( function( playerId ){
	var kdp = document.getElementById(playerId);
	// Shortcut to get config:
	var gc = function( attr ){
		return kdp.evaluate('{descriptionBox.' + attr + '}' );
	}
	//var $ = kWidget.getJQuery();
	kdp.kBind( "mediaReady", function(){
		var descriptionTitle	= gc( 'descriptionLabel') || kdp.evaluate('{mediaProxy.entry.name}');
		// check for target:
		var boxTargetID= gc( 'boxTargetId' ) || 'descriptionBox_' + playerId;

		// if no box target ( remove )
		if( ! gc( 'boxTargetId' ) ){
			$( '#' + boxTargetID ).remove();
		}
		// Add box target if missing from page:
		if( !$('#' + boxTargetID ).length ){
			var $descBox = $("<div>")
				.attr("id", boxTargetID )
				.css({
					"height" : gc( 'boxHeight' ),
					'width' : gc( 'boxWidth' ) || null
				})
				// for easy per site theme add kWidget class:
				.addClass('kWidget-descriptionBox');
			// check for where it should be appended:
			switch( gc('boxLocation') ){
				case 'before':
					$(kdp)
						.css( 'float', 'none')
						.before( $descBox );
				break;
				case 'left':
					$descBox.css('float', 'left').insertBefore(kdp);
					$(kdp).css('float', 'left');
				break;
				case 'right':
					$descBox.css('float', 'left').insertAfter( kdp );
					$(kdp).css('float', 'left' );
				break;
				case 'after':
				default:
					$(kdp)
						.css( 'float', 'none')
						.after( $descBox );
				break;
			};
		}
		// Empty any old description box
		$( '#' + boxTargetID )
			.empty()
			.append(
				$( "<h2>" ).text( descriptionTitle ),
				$( "<p>" ).html( kdp.evaluate('{mediaProxy.entry.description}') )
			)
	});
});