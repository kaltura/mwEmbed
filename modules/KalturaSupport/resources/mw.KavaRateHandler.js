(function (mw, $) {
    "use strict";

    mw.KavaRateHandler = function () {
        this._rates = [];
        this._isSwitchedToAbrMode = false;
    };

    mw.KavaRateHandler.prototype = {
        setRates: function (rates) {
            this._rates = [];
            for (var i = 0; i < rates.length; i++) {
                var rate = rates[i];
                this._rates.push({
                    rate: rate,
                    active: false,
                    duration: 0
                });
            }
        },

        hasRates: function () {
            return this._rates.length !== 0;
        },

        setCurrent: function (rate) {
            if (rate === 0) {
                this._isSwitchedToAbrMode = true;
            } else {
                var i;
                for (i = 0; i < this._rates.length; i++) {
                    this._rates[i].active = false;
                }
                for (i = 0; i < this._rates.length; i++) {
                    if (this._rates[i].rate === rate) {
                        this._rates[i].active = true;
                        break;
                    }
                }
            }
        },

        countCurrent: function () {
            var current = null;
            for (var i = 0; i < this._rates.length; i++) {
                if (this._rates[i].active) {
                    current = this._rates[i];
                    break;
                }
            }
            if (current) {
                current.duration++;
            }
        },

        getAverage: function () {
            var totalDuration = 0;
            var sum = 0;
            for (var i = 0; i < this._rates.length; i++) {
                var rate = this._rates[i];
                sum += (rate.rate * rate.duration);
                totalDuration += rate.duration;
            }
            return totalDuration ? sum / totalDuration : 0;
        },

        reset: function () {
            for (var i = 0; i < this._rates.length; i++) {
                this._rates[i].duration = 0;
            }
        },

        destroy: function () {
            this._rates = [];
        }
    };
})(window.mw, jQuery);