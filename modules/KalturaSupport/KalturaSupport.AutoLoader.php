<?php 
// define any autoLoading classes:
return array(
	// Add Kaltura api services: ( should be part of kaltura module config)
	'ServiceKSTest' => 'apiServices/ServiceKSTest.php',
	'ServiceUiconfJs' => 'apiServices/ServiceUiconfJs.php',
	'ServiceSleepTest' => 'apiServices/ServiceSleepTest.php',
	'ServiceFeaturesList' => 'apiServices/ServiceFeaturesList.php',
		
	'KalturaSources' => 'KalturaSources.php',
		
	'RequestHelper' => 'RequestHelper.php',
	// Include the kaltura client
	'KalturaClientHelper' => 'Client/KalturaClientHelper.php',
	// Include Kaltura Logger
	'KalturaLogger' => 'KalturaLogger.php',
	// Include Kaltura Cache
	'kFileSystemCacheWrapper' => 'Cache/kFileSystemCacheWrapper.php',
	'kNoCacheWrapper' =>  'Cache/kNoCacheWrapper.php',
	'KalturaCache' => 'KalturaCache.php',
	'KalturaUtils' => 'KalturaUtils.php',
);