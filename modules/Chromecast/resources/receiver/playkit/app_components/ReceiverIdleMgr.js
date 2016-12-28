function IdleManager() {
    this.idleTimerId = null;
    this.CLASS_NAME = "ReceiverIdleManager";
}

/**
 * The idle durations for each of the possible states.
 * @type {{LAUNCHING: number, LOADING: number, PAUSED: number, IDLE: number}}
 */
IdleManager.IDLE_TIMEOUT = {
    LAUNCHING: 1000 * 60 * 5, // 5 minutes
    LOADING: 1000 * 60 * 5,  // 5 minutes
    PAUSED: 1000 * 60 * 20,  // 20 minutes
    IDLE: 1000 * 60 * 5      // 5 minutes
};

/**
 * Sets the timeout for a given state.
 * @param state
 */
IdleManager.prototype.setIdleTimeout = function ( state ) {
    var time = IdleManager.IDLE_TIMEOUT[ state ];
    if ( time ) {
        ReceiverLogger.log( this.CLASS_NAME, "Setting timeout for state " + state + ". Timeout is " + (IdleManager.IDLE_TIMEOUT[ state ] / 60000) + " minutes." );
        if ( this.idleTimerId !== null ) {
            clearTimeout( this.idleTimerId );
            this.idleTimerId = null;
        }
        this.idleTimerId = setTimeout( function () {
            ReceiverLogger.log( "IdleManager", "Timeout has been passed! stopping receiver." );
            receiverManager.stop();
        }, time );
    }
};