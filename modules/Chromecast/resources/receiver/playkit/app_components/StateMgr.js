function StateManager() {
    this.prevState = null;
    this.currState = null;
    this.idleManager = new IdleManager();
}

StateManager.State = {
    LAUNCHING: 'LAUNCHING',
    LOADING: 'LAUNCHING',
    BUFFERING: 'BUFFERING',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    IDLE: 'IDLE'
};

StateManager.prototype.setState = function ( state ) {
    AppLogger.log( "AppState", "Setting new state for receiver: " + state );
    this.idleManager.setIdleTimeout( state );
    this.prevState = this.currState;
    this.currState = state;
};

StateManager.prototype.isInState = function ( state ) {
    return this.currState === state;
};
