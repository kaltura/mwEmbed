<?php 
/**
 * The kaltura plugin manifest
 */
return array(
	/** statistics has global flashvar based configuration:  **/
	'statistics' => array(
		'description' => "Kaltura Analytics plugin",
		'attributes'=> array(
			'plugin' => array(
				'doc' => 'If the plugin should be enabled',
				'edit' => true,
				'type' => 'boolean'
			)
		)
	),
	// top level properties: 
	'playbackContext' => array(
		'doc' => "The playback context sent to kaltura analytics"
	),
	'originFeature' => array(
		'doc' => "The featureType var sent to kaltura analytics"
	),
	'applicationName' => array(
		'doc' => "For registering the application with  kaltura analytics",
	),
	'userId' => array( 
		'doc' => "For associating a userId with kaltura analytics"
	)
);
