/**
 * dependencies: [ mw ]
 */
( function( mw ) {

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
	mw.seconds2npt = function( sec, show_ms ) {
		if ( isNaN( sec ) ) {
			mw.log("Warning: trying to get npt time on NaN:" + sec);			
			return '0:00:00';
		}
		
		var tm = mw.seconds2Measurements( sec );
				
		// Round the number of seconds to the required number of significant
		// digits
		if ( show_ms ) {
			tm.seconds = Math.round( tm.seconds * 1000 ) / 1000;
		} else {
			roundedSec = Math.round( tm.seconds );
			if( roundedSec == 60 ){
				tm.seconds = 0;
				tm.minutes = parseInt( tm.minutes ) + 1;
			}
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
	 * Given a timeMeasurements object return the number of seconds
	 * @param {object} timeMeasurements
	 */
	mw.measurements2seconds( timeMeasurements ){
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
	}
	/**
	 * Given seconds return array with 'days', 'hours', 'min', 'seconds'
	 * 
	 * @param {float}
	 *            sec Seconds to be converted into time measurements
	 */
	mw.seconds2Measurements = function ( sec ){
		var tm = {};
		tm.days = Math.floor( sec / ( 3600 * 24 ) );
		tm.hours = Math.floor( sec / 3600 );
		tm.minutes = Math.floor( ( sec / 60 ) % 60 );
		tm.seconds = sec % 60;
		return tm;
	};
	
	/**
	 * Take hh:mm:ss,ms or hh:mm:ss.ms input, return the number of seconds
	 * 
	 * @param {String}
	 *            nptString NPT time string
	 * @return {Float} Number of seconds
	 */
	mw.npt2seconds = function ( nptString ) {
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
	
} )( window.mediaWiki );