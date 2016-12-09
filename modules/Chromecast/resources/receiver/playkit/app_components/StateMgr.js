function StateManager() {
    this.currState = null;
    this.idleManager = new IdleManager();
}

StateManager.State = {
    LAUNCHING: 'LAUNCHING',
    LOADING: "LOADING",
    BUFFERING: 'BUFFERING',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    IDLE: 'IDLE'
};

StateManager.prototype.setState = function ( state ) {
    AppLogger.log( "AppState", "Setting new state for receiver: " + state );
    receiverWrapper.setAttribute( "state", state.toLowerCase() );
    this.idleManager.setIdleTimeout( state );
    this.currState = state;
};

StateManager.prototype.getState = function () {
    return this.currState;
};
