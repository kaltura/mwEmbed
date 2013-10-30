/**
 * dependencies: [ mw ]
 */
( function( mw ) {

	/**
	 * Given a float number of seconds, returns npt format response. ( ignore
	 * days for now )
	 *
	 * @param {Float}
	 *			sec Seconds
	 * @param {Boolean}
	 *			show_ms If milliseconds should be displayed.
	 * @param {Boolean}
	 *			mm_format if you want to show 2 digits for minutes
	 * @return {Float} String npt format
	 */
	mw.seconds2npt = function( sec, show_ms , mm_format ) {
		if ( isNaN( sec ) ) {
			mw.log("Warning: mediawiki.UtilitiesTime, trying to get npt time on NaN:" + sec);
			return '0:00:00';
		}

		var tm = mw.seconds2Measurements( sec );

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
			if (mm_format && tm.minutes < 10)
				tm.minutes = '0' + tm.minutes;
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
	 *			sec Seconds to be converted into time measurements
	 */
	mw.seconds2Measurements = function ( sec ){
		var tm = {};
		tm.days = Math.floor( sec / ( 3600 * 24 ) );
		tm.hours = Math.floor( Math.round( sec ) / 3600 );
		tm.minutes = Math.floor( ( Math.round( sec ) / 60 ) % 60 );
		tm.seconds = Math.round(sec) % 60;
		return tm;
	};
	/**
	* Given a timeMeasurements object return the number of seconds
	* @param {object} timeMeasurements
	*/
	mw.measurements2seconds = function( timeMeasurements ){
		var seconds = 0;
		if( timeMeasurements.days ){
			seconds += parseInt( timeMeasurements.days, 10 ) * 24 * 3600;
		}
		if( timeMeasurements.hours ){
			seconds += parseInt( timeMeasurements.hours, 10 ) * 3600;
		}
		if( timeMeasurements.minutes ){
			seconds += parseInt( timeMeasurements.minutes, 10 ) * 60;
		}
		if( timeMeasurements.seconds ){
			seconds += parseInt( timeMeasurements.seconds, 10 );
		}
		if( timeMeasurements.milliseconds ){
			seconds += parseInt( timeMeasurements.milliseconds, 10 ) / 1000;
		}
		return seconds;
	};

	/**
	 * Take hh:mm:ss,ms or hh:mm:ss.ms input, return the number of seconds
	 *
	 * @param {String}
	 *			npt_str NPT time string
	 * @return {Float} Number of seconds
	 */
	mw.npt2seconds = function ( npt_str ) {
		if ( !npt_str ) {
			// mw.log('npt2seconds:not valid ntp:'+ntp);
			return 0;
		}
		// Strip {npt:}01:02:20 or 32{s} from time if present
		npt_str = npt_str.replace( /npt:|s/g, '' );

		var hour = 0;
		var min = 0;
		var sec = 0;

		times = npt_str.split( ':' );
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

} )( window.mediaWiki );