/**
 * Optional kWidget library
 * Get a user agent player rules
 * @param {Object} ruleSet Object containing the rule set and actions
 * @return {String} What player should the browser lead with:
 * 		 'flash' ( default, lead with flash) | leadWithHTML5 | forceFlash | forceMsg Raw html message string to be displayed ( instead of player )
 */
kWidget.getUserAgentPlayerRulesMsg = function( ruleSet ){
	return kWidget.checkUserAgentPlayerRules( ruleSet, true );
};
kWidget.checkUserAgentPlayerRules = function( ruleSet, getMsg ){
	var ua = ( mw.getConfig( 'KalturaSupport_ForceUserAgent' ) )?
			mw.getConfig( 'KalturaSupport_ForceUserAgent' ) : navigator.userAgent;
	var flashMode = {
		mode: 'flash',
		val: true
	};
	// Check for current user agent rules
	if( !ruleSet.rules ){
		// No rules, lead with flash
		return flashMode;
	}
	var getAction = function( inx ){
		if( ruleSet.actions && ruleSet.actions[ inx ] ){
			return ruleSet.actions[ inx ];
		}
		// No defined action for this rule, lead with flash
		return flashMode;
	};
	for( var i in ruleSet.rules ){
		var rule = ruleSet.rules[i];
		if( rule.match ){
			if( ua.indexOf( rule.match ) !== -1 )
				return getAction( i );
		} else if( rule.regMatch  ){
			// Do a regex match
			var regString = rule.regMatch.replace(/(^\/)|(\/$)/g, '');
			if( new RegExp( regString ).test( ua ) ){
				return getAction( i );
			}
		}
	}
	// No rules applied, lead with flash
	return flashMode;
};
