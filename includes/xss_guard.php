<?php
/**
 * XSS input guard for mwEmbedFrame and mwEmbedLoader endpoints.
 * Validates request parameters that are embedded verbatim in JavaScript output.
 * Must be included before any output is generated.
 *
 * All output from these endpoints is Content-Type: text/javascript, so
 * htmlspecialchars() is insufficient — we validate by whitelist instead.
 */

function xss_guard_reject( $param ) {
	// Discard any buffered output so the 400 status is not overridden
	while ( ob_get_level() ) {
		ob_end_clean();
	}
	http_response_code( 400 );
	header( 'Content-Type: text/plain' );
	exit( 'Invalid parameter: ' . $param );
}

// callback: JSONP wrapper function name — valid JS identifier (dots allowed for namespacing)
if ( isset( $_REQUEST['callback'] ) && $_REQUEST['callback'] !== '' ) {
	if ( !preg_match( '/^[a-zA-Z_$][a-zA-Z0-9_$.]*$/', $_REQUEST['callback'] ) ) {
		xss_guard_reject( 'callback' );
	}
}

// uiconf_id: Kaltura numeric config ID
if ( isset( $_REQUEST['uiconf_id'] ) && $_REQUEST['uiconf_id'] !== '' ) {
	if ( !ctype_digit( (string)$_REQUEST['uiconf_id'] ) ) {
		xss_guard_reject( 'uiconf_id' );
	}
}

// wid: Kaltura widget ID — underscore-prefixed or partner_id-prefixed alphanumeric (e.g. _1234 or 0_abc123)
if ( isset( $_REQUEST['wid'] ) && $_REQUEST['wid'] !== '' ) {
	if ( !preg_match( '/^[0-9a-zA-Z_]+$/', $_REQUEST['wid'] ) ) {
		xss_guard_reject( 'wid' );
	}
}

// playerId: DOM element ID — alphanumeric, underscore, hyphen
if ( isset( $_REQUEST['playerId'] ) && $_REQUEST['playerId'] !== '' ) {
	if ( !preg_match( '/^[a-zA-Z0-9_-]+$/', $_REQUEST['playerId'] ) ) {
		xss_guard_reject( 'playerId' );
	}
}

// entry_id: Kaltura entry ID — alphanumeric and underscore only
if ( isset( $_REQUEST['entry_id'] ) && $_REQUEST['entry_id'] !== '' ) {
	if ( !preg_match( '/^[a-zA-Z0-9_]+$/', $_REQUEST['entry_id'] ) ) {
		xss_guard_reject( 'entry_id' );
	}
}

// width / height: pixel dimensions — integers only
if ( isset( $_REQUEST['width'] ) && $_REQUEST['width'] !== '' ) {
	if ( !ctype_digit( (string)$_REQUEST['width'] ) ) {
		xss_guard_reject( 'width' );
	}
}
if ( isset( $_REQUEST['height'] ) && $_REQUEST['height'] !== '' ) {
	if ( !ctype_digit( (string)$_REQUEST['height'] ) ) {
		xss_guard_reject( 'height' );
	}
}
