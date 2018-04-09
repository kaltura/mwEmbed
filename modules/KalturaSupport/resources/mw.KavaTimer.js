(function (mw, $) {
    "use strict";

    var SECOND = 1000;
    var RESET_COUNTER = 30;
    var EVENT_COUNTER = 10;

    mw.KavaTimer = function (kava) {
        this._kava = kava;
    };

    mw.KavaTimer.Event = {
        TICK: "tick",
        RESET: "reset",
        REPORT: "report"
    };

    mw.KavaTimer.prototype = {
        start: function () {
            this._clearTimeout();
            this._stopped = false;
            this._resetCounter = 0;
            this._eventCounter = 0;
            this._intervalId = setInterval(this._monitor.bind(this), SECOND);
        },

        continue: function () {
            this._stopped = false;
            this._resetCounter = 0;
        },

        stop: function () {
            this._stopped = true;
        },

        isStopped: function () {
            return this._stopped;
        },

        destroy: function () {
            this._clearTimeout();
        },

        _clearTimeout: function () {
            if (this._intervalId) {
                clearInterval(this._intervalId);
                this._intervalId = null;
            }
        },

        _monitor: function () {
            if (this._stopped) {
                if (this._resetCounter === RESET_COUNTER) {
                    this._kava.timerReset();
                    this._resetCounter = 0;
                    this._eventCounter = 0;
                }
                this._resetCounter++;
            } else {
                this._kava.timerTick();
                if (this._eventCounter === EVENT_COUNTER) {
                    this._kava.timerReport();
                    this._eventCounter = 0;
                }
                this._eventCounter++;
            }
        }
    };
})(window.mw, jQuery);