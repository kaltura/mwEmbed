<?php
/* 
 * This file will handle the download procedure based on user agent.
 *
 * @author ran
 */
// Include configuration: ( will include LocalSettings.php )
require_once( dirname( __FILE__ ) . '/DownloadEntryClass.php' );
// TODO replace me with a 'download' service or entry point in the sessionUrls 
$download = new downloadEntryClass();
$download->redirectDownload();