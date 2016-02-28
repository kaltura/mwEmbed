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
		this.consumeEvent = function ( args ) {
			var targetState;
			var targetMainDisplayType;
			if (typeof args === 'object')
			{
				// the event args contains a combination of a target state and main display type.
				targetState = args.action;
				targetMainDisplayType = args.mainDisplayType;
			}else
			{
				// backward compatibility: the event args represents the target state only
				targetState = args;
				targetMainDisplayType = null;
			}

			if (targetState === 'switchView')
			{
				// backward compatibility: transform 'switchView' state into relevant state / main display types
				targetState = this.currentState.name;
				targetMainDisplayType = (this.context.getPrimary() === this.context.getAuxDisplay()) ? 'video' : 'presentation';
			}

			if ( this.states[this.indexes[targetState]] ) {
				this.fsmTransitionHandlers(this.currentState.name, targetState);

				var previousState = this.currentState.name;
				var currentMainDisplayType = (this.context.getPrimary() === this.context.getAuxDisplay()) ? 'presentation' : 'video';

				this.currentState = this.states[this.indexes[targetState]];

				this.currentState.invoke.call(this.context, {
					previousState :previousState,
					currentMainDisplayType :currentMainDisplayType ,
					targetMainDisplayType : targetMainDisplayType});
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