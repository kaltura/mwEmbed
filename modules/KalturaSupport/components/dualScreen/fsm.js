(function ( mw ) {
	"use strict";
	mw.dualScreen = mw.dualScreen || {};
	mw.dualScreen.StateMachine = function( states, context, fsmTransitionHandlers ) {
		this.states = states;
		this.context = context;
		this.fsmTransitionHandlers = fsmTransitionHandlers;
		this.indexes = {}; //just for convinience
		for ( var i = 0; i < this.states.length; i++ ) {
			this.indexes[this.states[i].name] = i;
			if ( this.states[i].initial ) {
				this.currentState = this.states[i];
			}
		}
		this.consumeEvent = function ( e ) {
			if ( this.currentState.events[e] ) {
				this.fsmTransitionHandlers(this.currentState.name, e);
				this.currentState.events[e].action.call(this.context);
				this.currentState = this.states[this.indexes[this.currentState.events[e].name]];
			}
		};
		this.canConsumeEvent = function ( e ) {
			return !!this.currentState.events[e];
		};
		this.getStatus = function () {
			return this.currentState.name;
		};
	};
}

)( window.mw );