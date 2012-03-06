<?php 
// Quick MwEmbedPoorManSquidProxy implementation

// This does basic file based cache and response reverse proxy for resource loader.
// This is needed in cases where you don't have the resource loader behind a reverse proxy.

class MwEmbedPoorManSquidProxy {
	public static $hash = null;
	public static $debug = null;
	
	public static function checkCacheRespond( ){
		global $wgDefaultSkin, $wgResourceLoaderMaxage, $wgResourceLoaderDebug, $wgRequest;
		$request = $wgRequest;
		self::$debug = $request->getFuzzyBool( 'debug', $wgResourceLoaderDebug ) ;
		
		// Never respond in debug mode getDebug
		if( self::$debug ){
			return ;
		}
		$modules = $request->getVal( 'modules' );		
		$modules = $modules ? explode( '|', $modules ) : array();
		if( count( $modules ) == 0 ){
			$modules[] = 'startup';
		}			
		$skin = $request->getVal( 'skin' );
		if ( !$skin ) {
			$skin = $wgDefaultSkin;
		}		
		$only = $request->getVal( 'only' );
		$version = $request->getVal( 'version' );
		
		// Set the version: 	
		if( !$version ){
			$smaxage = $wgResourceLoaderMaxage['unversioned']['server'];
		} else { 
			$smaxage = $wgResourceLoaderMaxage['versioned']['server'];
		}
		$modulesString = implode( '', $modules);
		self::$hash = md5( implode( '', array( $version, $skin, $only, $modulesString  ) ) );
		
		/**
		 * Handle the response
		 */	
			
		// Check if we have a cached file: 
		if( ! is_file( mweGetFilePathFromKey( self::$hash  ) ) ){
			return ;
		}
		
		// Check file modified time: 
		$fileTime =	wfTimestamp( TS_UNIX, filemtime( mweGetFilePathFromKey( self::$hash  ) ) );
		if( wfTimestamp( TS_UNIX, time() ) - $fileTime > $smaxage){
			// Run the normal resource loader
			return ;
		}
		
		// Check if we can send a 304 to the client:
		// 'If-Modified-Since' and '$version' we can assume there is no modification:
		$ims = $request->getHeader( 'If-Modified-Since' );
		if ( $ims !== false && $version ) {
			for ( $i = 0; $i < ob_get_level(); $i++ ) {
				ob_end_clean();
			}			
			header( 'HTTP/1.0 304 Not Modified' );
			header( 'Status: 304 Not Modified' );
			wfProfileOut( __METHOD__ );
			return;
		}		
		
		// Send the same headers as ResourceLoader:
		if ( $only === 'styles' ) {
			header( 'Content-Type: text/css' );
		} else {
			header( 'Content-Type: text/javascript' );
		}
		header( 'Last-Modified: ' . wfTimestamp( TS_RFC2822, $fileTime ) );
		
		// no private cache in mwEmbed resource loader land ( both smaxage )
		header( "Cache-Control: public, max-age=$smaxage, s-maxage=$smaxage" );
		header( 'Expires: ' . wfTimestamp( TS_RFC2822, $smaxage + time() ) );
		
		// Gzip if possible:
		//ob_start("ob_gzhandler");
		
		echo mweGetFromFileCache( self::$hash  );
				
		// Clear and send the buffer:
		//ob_end_flush();
		// exit ( don't continue resource loader handling ) 
		exit(1);
	}
	public static function saveCacheRespond(& $output){
		global $mwUsePoorManSquidProxy;
		// Don't cache debug output and only cache if squid proxy is enabled: 
		if( !self::$debug && $mwUsePoorManSquidProxy ){
			mweSaveFileToCache( self::$hash, $output);
		}
		// Headers already set in Resource loader ) 
		echo $output;
	}
}
