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
		this.consumeEvent = function ( state ) {
			var action;
			var mainDisplayType;
			if (typeof state === 'object')
			{
				action = state.action;
				mainDisplayType = state.mainDisplayType;
			}else
			{
				action = state;
				mainDisplayType = null;
			}

			if (action === 'switchView')
			{
				action = this.currentState.name;
				mainDisplayType = (this.context.getPrimary() === this.context.getAuxDisplay()) ? 'video' : 'presentation';
			}

			if ( this.states[this.indexes[action]] ) {
				this.fsmTransitionHandlers(this.currentState.name, action);

				var previousState = this.currentState.name;
				var currentMainDisplayType = (this.context.getPrimary() === this.context.getAuxDisplay()) ? 'presentation' : 'video';
				this.currentState = this.states[this.indexes[action]];
				this.currentState.invoke.call(this.context, {
					previousState :previousState,
					currentMainDisplayType :currentMainDisplayType ,
					targetMainDisplayType : mainDisplayType});
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