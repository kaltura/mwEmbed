// Add support for html5 / mwEmbed elements to IE
// For discussion and comments, see: http://remysharp.com/2009/01/07/html5-enabling-script/
'video audio source track'.replace(/\w+/g,function( n ){ document.createElement( n ) } );

/**
 * MwEmbedSupport includes shared mwEmbed utilities that either
 * wrap core mediawiki functionality or support legacy mwEmbed module code
 *
 * @license
 * mwEmbed
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * @copyright (C) 2010 Kaltura
 * @author Michael Dale ( michael.dale at kaltura.com )
 *
 * @url http://www.kaltura.org/project/HTML5_Video_Media_JavaScript_Library
 *
 * Libraries used include code license in headers
 *
 * @dependencies
 */

( function( mw, $ ) {

	/**
	 * Enables javascript modules and pages to target a "interfaces ready" state.
	 *
	 * This is different from jQuery(document).ready() ( jQuery ready is not
	 * friendly with dynamic includes and not friendly with core interface
	 * asynchronous build out. ) This allows core interface components to do async conditional
	 * load calls, and trigger a ready event once the javascript interface build out is complete
	 *
	 * For example making <video> tags on the page have a video api even if the browser
	 * does not support html5 requires dynamic loading that can only happen once the page dom is
	 * ready
	 *
	 * @param {Function}
	 *            callback Function to run once DOM and jQuery are ready
	 */
	// mw.interfacesReadyFlag ( set to true once interfaces are ready )
	mw.interfacesReadyFlag = false;

	mw.ready = function( callback ) {
		if( mw.interfacesReadyFlag  === false ) {
			// Add the callbcak to the onLoad function stack
			$( mw ).bind( 'InterfacesReady', callback );
		} else {
			// If mwReadyFlag is already "true" issue the callback directly:
			callback();
		}
	};

	// Check for pre-mwEmbed ready functions
	if( typeof window.preMwEmbedReady != 'undefined'){
		while( window.preMwEmbedReady.length ){
			mw.ready( window.preMwEmbedReady.pop() );
		}
	}

	/**
	 * Aliased functions
	 *
	 * Wrap mediaWiki functionality while we port over the libraries
	 */
	window.gM = function(){
		return mw.msg.apply(this, $.makeArray( arguments ) );
	};
	/**
	 * Aliased manual message adding
	 */
	mw.addMessages = function( msgOb ){
		mw.messages.set( msgOb );
	}
	mw.setConfig = function( name, value ){
		mw.config.set( name, value );
	};
	mw.getConfig = function( name, value ){
		return mw.config.get( name, value );
	};
	mw.setDefaultConfig = function( name, value ){
		if( mw.config.get( name ) === null ){
			mw.config.set( name, value );
		}
	};
	/*duplicated function
	 * TODO: remove or test
	mw.mergeConfig = function( name, value ){
		if( mw.getConfig( name ) != null ){
			var value = $.extend( {}, mw.getConfig( name ), value );
		}
		return mw.setConfig( name, value );
	};
	*/
	/**
	 * Set any pre-mwEmbed embed configuration overrides
	 */
	if( typeof window.preMwEmbedConfig != 'undefined') {
		mw.setConfig( window.preMwEmbedConfig );
	}


	/**
	 * Aliased load function
	 */
	mw.load = function( resources, callback ){
		mw.loader.using( resources, callback, function(){
			// failed to load
			mw.log("Failed to load resources:"  + resources );
		});
	};

	mw.getEmbedPlayerPath = function(){
		if(  mw.config.get( 'wgExtensionAssetsPath' ) ){
			return mw.config.get( 'wgExtensionAssetsPath' ) + '/TimedMediaHandler/MwEmbedModules/EmbedPlayer'
		} else if ( mw.config.get( 'wgLoadScript' ) ){
			return mw.getMwEmbedPath() + 'modules/EmbedPlayer'
		}
	};

	/**
	 * Legacy support for bind helper
	 */
	mw.bindHelper = function( name, callback ){
		$( this ).bind( name, callback );
		return this;
	};

	/**
	 * legacy support to get the mwEmbed resource path:
	 */
	mw.getMwEmbedPath = function(){
		// check for wgExtensionAssetsPath path ( running in mw instance )
		if ( mw.config.get( 'wgLoadScript' ) ){
			return mw.config.get( 'wgLoadScript' ).replace('load.php', '');
		}
		return false;
	};

	/**
	 * Merge in a configuration value:
	 */

	mw.mergeConfig = function( name, value ){
		if( typeof name == 'object' ) {
			$.each( name, function( inx, val) {
				mw.mergeConfig( inx, val );
			});
			return ;
		}
		var existingValue = mw.config.get( name );
		if( !existingValue || typeof existingValue == 'string'){
			mw.setConfig( name, value );
			return ;
		}
		if( typeof mw.config.get( name ) == 'object' ){
			if( $.isArray( existingValue) && $.isArray( value ) ){
				for( var i =0; i <  value.length ; i ++ ){
					existingValue.push( value[i] );
				}
				mw.setConfig( name, $.unique( existingValue ) );
			} else {
				mw.setConfig( name, $.extend( {}, existingValue, value) );
			}
			return ;
		}
	};


	/**
	 * Simple inheritance. We will move to something like
	 * http://javascriptmvc.com/docs.html#&who=jQuery.Class
	 * in the near future. This is just a stop gap.
	 */
	mw.inherit = function( _this, inhertParent ){
		for ( var method in inhertParent ) {
			if ( _this[ method ] ) {
				_this['parent_' + method] = inhertParent[method];
			} else {
				_this[ method ] = inhertParent[method];
			}
		}
	};


	/**
	 * Utility Functions
	 */

	/**
	 * Checks if a string is a url ( parsed success by mw.Uri )
	 * @param {String}
	 * 		Url url version to be checked with mw.Uri
	 */
	mw.isUrl = function( url ){
		try {
			new mw.Uri( url );
			return true;
		} catch ( e ){
			// no error
		}
		return false;
	};

	/**
	 * A version comparison utility function Handles version of types
	 * {Major}.{MinorN}.{Patch}
	 *
	 * Note this just handles version numbers not patch letters.
	 *
	 * @param {String}
	 *            minVersion Minimum version needed
	 * @param {String}
	 *            clientVersion Client version to be checked
	 *
	 * @return true if the version is at least of minVersion false if the
	 *         version is less than minVersion
	 */
	mw.versionIsAtLeast = function( minVersion, clientVersion ) {
		if( typeof clientVersion == 'undefined' ){
			clientVersion = window.MWEMBED_VERSION;
		}
		var minVersionParts = minVersion.split('.');
		var clientVersionParts = clientVersion.split('.');
		for( var i =0; i < minVersionParts.length; i++ ) {
			if( parseInt( clientVersionParts[i] ) > parseInt( minVersionParts[i] ) ) {
				return true;
			}
			if( parseInt( clientVersionParts[i] ) < parseInt( minVersionParts[i] ) ) {
				return false;
			}
		}
		// Same version:
		return true;
	};

	// An event once mwEmbedSupport is Ready,
	$( mw ).trigger( 'MwEmbedSupportReady' );

	// Once interfaces are ready update the mwReadyFlag
	$( mw ).bind( 'InterfacesReady', function(){ mw.interfacesReadyFlag  = true; } );

	// Once the DOM is ready start setting up interfaces
	$( document ).ready( function(){
		$( mw ).triggerQueueCallback( 'SetupInterface', function(){
			// All interfaces have been setup trigger InterfacesReady event
			$( mw ).trigger( 'InterfacesReady' );
		});
	});

	/**
	 * Convert Hexadecimal string to HTML color code
	 *
	 * @param {String} Color code in hexadecimal notation
	 */
	mw.getHexColor = function( color ) {
		if( typeof color == 'string' && color.substr(0,2) == "0x" ) {
			return color.replace('0x', '#');
		} else {
			color = parseInt( color );
			color = color.toString(16);
			var len = 6 - color.length;
			if( len > 0 ) {
				var pre = '';
				for( var i=0; i<len; i++) {
					pre += '0';
				}
				color = pre + color;
			}
			return '#' + color;
		}
	};

	/*
	 * Send beacon ( used by ads and analytics plugins )
	 * @param {String} Beacon URL to load
	 */
	mw.sendBeaconUrl = function( beaconUrl ){
		var beacon = new Image();
		beacon.src = beaconUrl;
	};

} )( mediaWiki, jQuery );