/**
 * Created by asafrobinovich on 4/21/15.
 */
(function (mw, $) {
    "use strict";
    ko.subscribable.fn.qnaTimestamp = function (currentTime) {
        return ko.pureComputed(function () {

            //var unused = ko.unwrap(currentTime);

            var minutesText = " " + gM('qna-timestamp-minutes-text');
            var nowText = gM('qna-timestamp-now-text');
            var multipleHoursText = gM('qna-timestamp-multi-hours-text');
            var singleHourText = gM('qna-timestamp-single-hour-text');

            var nowInSeconds = ko.unwrap(currentTime) / 1000;
            var secondsSinceTimestamp = nowInSeconds - this();

            var hours = parseInt( secondsSinceTimestamp / 3600 );
            var minutes = parseInt( secondsSinceTimestamp / 60 ) % 60;
            var seconds = secondsSinceTimestamp % 60;

            if (hours === 0) {
                //Between 1 to 2 minutes
                if (minutes <= 1) {
                    return "Now";
                }
                return minutes + " " + minutesText;
            }
            //Assumption: >= than 1 hour ago.
            if(hours < 24){
                return hours + ((hours === 1) ? " " + singleHourText : " " + multipleHoursText);
            }
            else{
                var date = new Date(this()*1000);
                return date.toLocaleDateString();
            }

        }, this);
    };

})(window.mw, window.jQuery);
