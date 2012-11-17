/**
 * Some utility functions useful for on page plugins
 * 
 * We should use this on both sides of the iframe
 * If it gets to large we will have to do some dep mapping 
*/
(function(kWidget){
	/**
	 * Given a float number of seconds, returns npt format response. ( ignore
	 * days for now )
	 *
	 * @param {Float}
	 *            sec Seconds
	 * @param {Boolean}
	 *            show_ms If milliseconds should be displayed.
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
	 * Given seconds return array with 'days', 'hours', 'min', 'seconds'
	 *
	 * @param {float}
	 *            sec Seconds to be converted into time measurements
	 */
	kWidget.seconds2Measurements = function ( sec ){
		var tm = {};
		tm.days = Math.floor( sec / ( 3600 * 24 ) );
		tm.hours = Math.floor( Math.round( sec ) / 3600 );
		tm.minutes = Math.floor( ( Math.round( sec ) / 60 ) % 60 );
		tm.seconds = sec % 60;
		return tm;
	};
	
})(window.kWidget);