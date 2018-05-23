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
            var _this = this;
            this._intervalId = setInterval(function () {
                if (_this._stopped) {
                    if (_this._resetCounter === RESET_COUNTER) {
                        _this._kava.timerReset();
                        _this._resetCounter = 0;
                        _this._eventCounter = 0;
                    }
                    _this._resetCounter++;
                } else {
                    _this._kava.timerTick();
                    if (_this._eventCounter === EVENT_COUNTER) {
                        _this._kava.timerReport();
                        _this._eventCounter = 0;
                    }
                    _this._eventCounter++;
                }
            }, SECOND);
        },

        resume: function () {
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
        }
    };
})(window.mw, jQuery);