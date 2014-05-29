( function( mw, $ ) {"use strict";

// Class defined in resources/class/class.js
	mw.PlayerElementHTML = mw.PlayerElement.extend({
		init: function( containerId , playerId ){
			// Create new video tag and append to container
			var $vidSibling = $( '<video />' )
				.attr({
					'id' : playerId
				}).css({
					'-webkit-transform-style': 'preserve-3d',
					'position': 'relative',
					'width': '100%',
					'height': '100%'
				});

			$( '#' + containerId ).append( $vidSibling );
			this.element = $vidSibling[0];

			return this;
		},
		play: function(){
			this.element.play();
		},
		pause: function(){
			mw.log('PlayerElement::Error: function pause should be implemented by playerElement interface ');
		},
		seek: function( val ){
			mw.log('PlayerElement::Error: function seek should be implemented by playerElement interface ');
		},
		load: function(){
			this.element.src = this.src;
			this.element.load();
		},
		changeVolume: function( val ){
			this.element.volume = val;
		}
	});

} )( window.mw, window.jQuery );