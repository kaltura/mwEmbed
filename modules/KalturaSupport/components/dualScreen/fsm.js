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
			var targetEvents = [];

			if (typeof e === 'string')
			{
				// backward compatibility: the event args contains the event name only
				targetEvents.push(e);
			}else if (typeof e === 'object' && e.action === 'switchView')
			{
				// backward compatibility: the event args action equals 'switchView' which is a special event
				targetEvents.push(e.action);
			}else if (typeof e === 'object' && e.action)
			{
				// the event args contains an action and (optionally) main display type

				// push the action as first state transition
				targetEvents.push(e.action);

				// check if need to invoke 'switchView' on the new state
				var targetMainDisplayType = e.mainDisplayType;
				var currentMainDisplayType = (this.context.getPrimary() === this.context.getMainDisplay()) ? mw.dualScreen.display.TYPE.PRIMARY : mw.dualScreen.display.TYPE.SECONDARY;

				if (targetMainDisplayType && currentMainDisplayType !== targetMainDisplayType)
				{
					// the user want to switch between primary <-> secondary - use 'switchView' event if exists
					targetEvents.push('switchView');
				}
			}

			for(var i = 0; i<targetEvents.length;i++)
			{
				var targetEvent = targetEvents[i];

				if ( this.currentState.events[targetEvent] ) {
					var nextStateName = this.currentState.events[targetEvent].name;
					mw.log('fsm.consumeEvent(): transition from state ' + this.currentState.name + ' to state ' + nextStateName + ' with event name ' + targetEvent);
					this.fsmTransitionHandlers(this.currentState.name, targetEvent);
					this.currentState.events[targetEvent].action.call(this.context);
					this.currentState = this.states[this.indexes[nextStateName]];
				}

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