/**
 * Get a user agent player rules 
 * @param {Object} config Object containing the rule set and actions
 * @return {String} What player should the browser lead with:
 * 		 'flash' ( default, lead with flash) | leadWithHTML5 | forceFlash | forceMsg Raw html message string to be displayed ( instead of player ) 
 */
window.checkUserAgentPlayerRules = function( config ){
	var ua = navigator.userAgent;
	// Check for current user agent rules
	if( !config.rules ){
		// No rules, lead with flash
		return 'flash';
	}
	var getAction = function( inx ){
		if( config.action && config.action[ inx ] ){
			return config.action;
		}
		// No defined action for this rule, lead with flash
		return 'flash';
	};
	for( var i=0; i < config.rules.length; i++){
		if( rule.match ){
			if( ua.indexOf( rule.match ) !== -1 )
				return getAction( i );
		} else if( rule.regMatch  ){
			// Do a regex match
			var pattern = new RegExp( rule.regMatch );
			if( pattern.test( ua ) )
				return getAction( i );
		}
	}
	// No rules applied, lead with flash
	return 'falsh';
};