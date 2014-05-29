( function( mw, $ ) {"use strict";

// Class defined in resources/class/class.js
	mw.PlayerElement = Class.extend({
		element: null,
		src: null,
		/**
		 * Creates a new player element and appends it to the given holder
		 * @param holder player holder
		 * @param playerId element ID
		 */
		init: function( containerId , playerId ){
			mw.log('PlayerElement::Error: function init should be implemented by playerElement interface ');
		},
		getElement: function() {
			return this.element;
		},
		play: function(){
			mw.log('PlayerElement::Error: function play should be implemented by playerElement interface ');
		},
		pause: function(){
			mw.log('PlayerElement::Error: function pause should be implemented by playerElement interface ');
		},
		seek: function( val ){
			mw.log('PlayerElement::Error: function seek should be implemented by playerElement interface ');
		},
		load: function(){
			mw.log('PlayerElement::Error: function load should be implemented by playerElement interface ');
		},
		changeVolume: function( val ){
			mw.log('PlayerElement::Error: function changeVolume should be implemented by playerElement interface ');
		}
	});

} )( window.mw, window.jQuery );