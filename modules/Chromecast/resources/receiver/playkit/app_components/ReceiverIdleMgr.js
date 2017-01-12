function IdleManager() {
    this.idleTimerId = null;
    this.CLASS_NAME = "ReceiverIdleManager";
}

/**
 *
 * @type {number}
 */
IdleManager.MINUTE_MULT = 1000 * 60;

/**
 * The idle durations for each of the possible states.
 * @type {{LAUNCHING: number, LOADING: number, PAUSED: number, IDLE: number}}
 */
IdleManager.IDLE_TIMEOUT = {
    LAUNCHING: IdleManager.MINUTE_MULT * 5, // 5 minutes
    LOADING: IdleManager.MINUTE_MULT * 5,  // 5 minutes
    PAUSED: IdleManager.MINUTE_MULT * 20,  // 20 minutes
    IDLE: IdleManager.MINUTE_MULT * 5      // 5 minutes
};

/**
 * Sets the timeout for a given state.
 * @param state
 */
IdleManager.prototype = {

    configure: function ( config ) {
        if ( config.loadingTimeout && $.isNumeric( config.loadingTimeout ) ) {
            IdleManager.IDLE_TIMEOUT.LOADING = config.loadingTimeout * IdleManager.MINUTE_MULT;
            if ( ReceiverStateManager.getState() === StateManager.State.LOADING ) {
                this.setIdleTimeout( StateManager.State.LOADING );
            }
        }
        if ( config.pausedTimeout && $.isNumeric( config.pausedTimeout ) ) {
            IdleManager.IDLE_TIMEOUT.PAUSED = config.pausedTimeout * IdleManager.MINUTE_MULT;
            if ( ReceiverStateManager.getState() === StateManager.State.PAUSED ) {
                this.setIdleTimeout( StateManager.State.PAUSED );
            }
        }
        if ( config.idleTimeout && $.isNumeric( config.idleTimeout ) ) {
            IdleManager.IDLE_TIMEOUT.IDLE = config.idleTimeout * IdleManager.MINUTE_MULT;
            if ( ReceiverStateManager.getState() === StateManager.State.IDLE ) {
                this.setIdleTimeout( StateManager.State.IDLE );
            }
        }
    },

    setIdleTimeout: function ( state ) {
        var _this = this;
        var time = IdleManager.IDLE_TIMEOUT[ state ];
        if ( this.idleTimerId !== null ) {
            clearTimeout( this.idleTimerId );
            this.idleTimerId = null;
        }
        if ( time ) {
            ReceiverLogger.log( this.CLASS_NAME, "Setting timeout for state " + state + ". Timeout is " + (IdleManager.IDLE_TIMEOUT[ state ] / 60000) + " minutes." );
            this.idleTimerId = setTimeout( function () {
                ReceiverLogger.log( _this.CLASS_NAME, "Timeout has been passed! stopping receiver." );
                receiverManager.stop();
            }, time );
        }
    }
};