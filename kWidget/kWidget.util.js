/**
 * Some utility functions useful for on page plugins
 * 
 * We should use this on both sides of the iframe
 * If it gets to large we will have to do some dep mapping 
*/
(function(kWidget) {
	/**
	 * Given a float number of seconds, returns npt format response. ( ignore
	 * days for now )
	 *
	 * @param {Float}
	 *			sec Seconds
	 * @param {Boolean}
	 *			show_ms If milliseconds should be displayed.
	 * @return {Float} String npt format
	 */
	kWidget.seconds2npt = function( sec, show_ms ) {
		if ( isNaN( sec ) ) {
			kWidget.log("Warning: mediawiki.UtilitiesTime, trying to get npt time on NaN:" + sec);
			return '0:00:00';
		}

		var tm = kWidget.seconds2Measurements( sec );

		// Round the number of seconds to the required number of significant
		// digits
		if ( show_ms ) {
			tm.seconds = Math.round( tm.seconds * 1000 ) / 1000;
		} else {
			tm.seconds = Math.round( tm.seconds );
		}
		if ( tm.seconds < 10 ){
			tm.seconds = '0' +	tm.seconds;
		}
		if( tm.hours == 0 ){
			hoursStr = '';
		} else {
			if ( tm.minutes < 10 )
				tm.minutes = '0' + tm.minutes;

			hoursStr = tm.hours + ":";
		}
		return hoursStr + tm.minutes + ":" + tm.seconds;
	};
	
	/**
	 * Take hh:mm:ss,ms or hh:mm:ss.ms input, return the number of seconds
	 *
	 * @param {String}
	 *			nptString NPT time string
	 * @return {Float} Number of seconds
	 */
	kWidget.npt2seconds = function ( nptString ) {
		if ( !nptString ) {
			// mw.log('npt2seconds:not valid ntp:'+ntp);
			return 0;
		}
		// Strip {npt:}01:02:20 or 32{s} from time if present
		nptString = nptString.replace( /npt:|s/g, '' );

		var hour = 0;
		var min = 0;
		var sec = 0;

		times = nptString.split( ':' );
		if ( times.length == 3 ) {
			sec = times[2];
			min = times[1];
			hour = times[0];
		} else if ( times.length == 2 ) {
			sec = times[1];
			min = times[0];
		} else {
			sec = times[0];
		}
		// Sometimes a comma is used instead of period for ms
		sec = sec.replace( /,\s?/, '.' );
		// Return seconds float
		return parseInt( hour * 3600 ) + parseInt( min * 60 ) + parseFloat( sec );
	};
	/**
	 * Given seconds return array with 'days', 'hours', 'min', 'seconds'
	 *
	 * @param {float}
	 *			sec Seconds to be converted into time measurements
	 */
	kWidget.seconds2Measurements = function ( sec ){
		var tm = {};
		tm.days = Math.floor( sec / ( 3600 * 24 ) );
		tm.hours = Math.floor( Math.round( sec ) / 3600 );
		tm.minutes = Math.floor( ( Math.round( sec ) / 60 ) % 60 );
		tm.seconds = sec % 60;
		return tm;
	};

    kWidget.getSliceCount =  function( duration ){
        if( duration < 60 ){
            return Math.round( duration ) +1; // every second
        }
        if( duration < 120 ){
            return Math.round( duration / 1.5 ) +1; // every second
        }
        if( duration < 240 ){
            return Math.round( duration / 2 ) +1; // every 2 seconds
        }

        // max slice count 200
        return 200;
    };

    kWidget.getThumbSpriteOffset = function( thumbWidth, time , duration ){
        var sliceIndex = kWidget.getSliceIndexForTime( time , duration );
        return - ( sliceIndex * thumbWidth ) + 'px 0px';
    };
    kWidget.getSliceIndexForTime =  function( time , duration ){
        var sliceCount = this.getSliceCount(duration);
        var perc = time / duration;
        var sliceIndex = Math.ceil( sliceCount * perc );
        return sliceIndex;
    };

	
})(window.kWidget);