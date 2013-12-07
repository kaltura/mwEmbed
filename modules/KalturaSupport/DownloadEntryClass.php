<?php 
require_once( dirname( __FILE__ ) . '/KalturaSources.php' );
// TODO replace me with a 'download' service or entry point in the sessionUrls

class DownloadEntryClass extends KalturaSources{
	var $forceDownload = false;

	/**
	 * Default constructor - Sets the forceDownload flag accordingly
	 */
	function __construct() {
		if( isset( $_GET[ 'forceDownload' ] ) ) {
			$this->forceDownload = true;
		}
	}
	
	function redirectDownload() {
		$flavorUrl = $this->getSourceForUserAgent();
		// Redirect to flavor
		header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
		header("Pragma: no-cache");
		header("Expires: Sat, 26 Jul 1997 05:00:00 GMT"); // Date in the past
		if ( $this->forceDownload ) {
			header( "Content-Description: File Transfer" );
			header( "Content-Type: application/force-download" );
			$extension = strrchr( substr( $flavorUrl, 0, strpos( $flavorUrl, "?ks=" ) ), '.' );
			$flavorId = substr( strrchr( strstr( $flavorUrl, "/format/", true ), '/' ), 1 );
			$filename = $flavorId . $extension;
			header( "Content-Disposition: attachment; filename=$filename" );
			readfile( $flavorUrl );
		}
		else {
			header("Location: " . $flavorUrl );
		}
	}
}