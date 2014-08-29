<?php
	$methods = array(
		'doPause' => array(
			'params' => 'None',
			'desc' => 'Command the player to pause.'
		),
		'doPlay' => array(
			'params' => 'None',
			'desc' => 'Command the player to play.'
		),
		'doStop' => array(
			'params' => 'None',
			'desc' => 'Command the player to stop. Pause and move the playhead to 0.'
		),
		'doSeek' => array(
			'params' => 'Position to seek to',
			'desc' => 'Command the player to seek.'
		),
		'doSwitch' => array(
			'params' => 'New stream bitrate',
			'desc' => 'Command the player to manually switch between streams within the resource.'
		),
		'cleanMedia' => array(
			'params' => 'None',
			'desc' => 'Cleans the media from the player.'
		),
		'doReplay' => array(
			'params' => 'None',
			'desc' => 'Notification fired when the player started replaying the video'
		),
		'alert' => array(
			'params' => 'message: alert message, title: alert title',
			'desc' => 'Pop up an alert'
		),
		'showUiElement' => array(
			'params' => 'id: ID of the element, show: true / false',
			'desc' => 'Show/hide an element from the layout',
			'availability' => 'kdp'
		),
		'changeMedia' => array(
			'params' => 'entryId: new entry ID / referenceId: new reference ID, flavorId: new flavor ID, if exists',
			'desc' => 'Start the init of change media macro commands'
		),
		'changeVolume' => array(
			'params' => 'New volume value',
			'desc' => 'An action to change the volume'
		),
		'removeAlerts' => array(
			'params' => 'None',
			'desc' => 'Fired when all alerts popped by the player need to be removed',
			'availability' => 'kdp'
		),
		'enableGui' => array(
			'params' => 'guiEnabled: true / false, enableType: full / controls',
			'desc' => 'Enable/disable GUI',
			'availability' => 'kdp'
		),
		'cancelAlerts' => array(
			'params' => 'None',
			'desc' => 'Hide Alerts at the Alerts Mediator',
			'availability' => 'kdp'
		),
		'changePreferredBitrate' => array(
			'params' => 'The new preferred bitrate',
			'desc' => 'Change the preferedFlavorBR on mediaProxy.vo object'
		),
		'liveEntry' => array(
			'params' => 'The URL resource of the played entry',
			'desc' => 'Call the LiveStream command which tests whether the stream is currently on air',
			'availability' => 'kdp'
		)
	);
	
	/* should ideally auto generate or be in a separate file */
	$methodDocs = array(
			'kWidget.embed' => array(
					'desc'=>'Used to embed the Kaltura player against an element target in the DOM',
					'params' => array(
							'targetId' => array(
									'type' => 'String', // assumed
									'optional' => true,
									'desc' => 'The DOM player target id attribute string. ( if not included, you must include targetId in "settings" object )',
							),
							'settings'=> array(
									'type' => 'kWidget.settingsObject',
									'desc' => 'Object of settings to be used in embedding.'
							)
					),
					'returns' => array(
							'type' => 'boolean|null',
							'desc' => 'Returns boolean false if id not found'
					),
					'examples' => array(
							array(
									// either doc name or path can be defined ( for feature listed files vs non-feature listed )
									'type' => 'link',
									'name' => 'kWidget.embed',
									'docPath' => 'kwidget'
							),
							array(
									'type' => 'link',
									'name' => 'kWidget.embed playlist',
									'docFullPath' => 'modules/KalturaSupport/tests/kWidget.embed.playlist.qunit.html '
							)
					)
			),
			'kWidget.thumbEmbed' => array(
					'desc'=>'Used to embed a thumbnail player. When the user clicks on the thumbnail kWidget.embed will be called with the provided settings.',
					'params' => array(
							'targetId' => array(
									'type' => 'String', // assumed
									'optional' => true,
									'desc' => 'The DOM player target id attribute string. ( if not included, you must include targetId in "settings" object',
							),
							'settings'=> array(
									'type' => 'kWidget.settingsObject',
									'desc' => 'Object of settings to be used in embedding.'
							)
					),
					'examples' => array(
							array(
									// either doc name or path can be defined ( for feature listed files vs non-feature listed )
									'type' => 'link',
									'name' => 'kWidget.thumbEmbed',
									'docPath' => 'thumb'
							)
					)
			),
			'kWidget.getKalturaThumbUrl' => array(
					'desc'=>'Get video thumbnail URL.',
					'params' => array(
							'settings'=> array(
									'type' => 'kWidget.settingsObject',
									'desc' => 'Object of settings to be used in embedding.'
							)
					)
			),
			'kWidget.addReadyCallback' => array(
					'desc'=>'Adds a ready callback to be called after the KDP or HTML5 player is ready.',
					'params' => array(
							'readyCallback' => array(
									'type' => 'String',
									'desc' => 'Function to call after a player or widget is ready on the page.',
							)
					),
					'examples' => array(
							array(
									'type' => 'link',
									'name' => 'kWidget.addReadyCallback',
									'docFullPath' => 'modules/KalturaSupport/tests/ChangeMediaEntry.qunit.html '
							)
					)
			),
			'kWidget.destroy' => array(
				 'desc'=>'Removes the player from the DOM.',
				 'params' => array(
				 		'target' => array(
				 				'type' => 'String',
				 				'desc' => 'The target element or element ID to destroy.',
				 		)
				 ),
				 'examples' => array(
				 		array(
				 				'type' => 'link',
				 				'name' => 'kWidget.embed',
				 				'docPath' => 'kwidget'
				 		)
				 )
			),
			'kWidget.api' => array(
					'desc' => 'The kWidget API object, used to create new instances of Kaltura API request.',
					'params' => array(
							'apiObject'=> array(
									'type' => 'kWidget.apiOptions',
									'desc' => 'Object of API settings to be used in API requests.'
							)
					),
					'methods'=> array(
							'doRequest' => array(
									'type' => 'function',
									'desc' => "( RequestObject, callback ) Run the API request, issue callback with API response data."
							)
					),
					'returns' => array(
							'type' => 'kWidget.api',
							'desc' => 'Returns an instance of the kWidget API object.'
					),
					'examples' => array(
							array(
									'name' => 'kWidget.api',
									'docFullPath' => 'kWidget/tests/kWidget.api.html'
							),
							array(
									'name' => 'kWidget.getSources',
									'docFullPath' => 'modules/KalturaSupport/tests/kWidget.getSources.html'
							)
					)
			),
			'sendNotification' => array(
					'desc'=>'Call a KDP notification (perform actions using this API, for example: play, pause, changeMedia, etc.)',
					'params' => array(
							'notificationName' => array(
									'type' => 'String',
									'desc' => 'The name of notification to call.',
							),
							'notificationData'=> array(
									'type' => 'Object',
									'optional' => true,
									'desc' => 'The custom data to pass with the notification.'
							)
					)
			),
			'addJsListener' => array(
					'desc'=>'Register a javascript handler function for a KDP notification',
					'params' => array(
							'listenerString' => array(
									'type' => 'String',
									'desc' => 'The name of the notification to listen to.',
							),
							'jsFunctionName'=> array(
									'type' => 'String',
									'desc' => 'The name of the JavaScript handler function.'
							)
					)
			),
			'evaluate' => array(
					'desc'=>"Retrieves the value of a KDP model property or component's property, using the standard OOP dot notation inside curly braces",
					'params' => array(
							'object.property.properties' => array(
									'type' => 'String',
									'desc' => 'The reference to the component object with data that you want to extract. Enclose the reference in curly braces within single or double quotation marks.',
							)
					)
			),
			'setKDPAttribute' => array(
					'desc'=>"Change a value of a player configuration property or component's property using the standard OOP dot notation.",
					'params' => array(
							'object' => array(
									'type' => 'String',
									'desc' => 'A string that represents the object you want to modify. Use standard dot notation to specify sub-objects, for example, configProxy.flashvars'
							),'property' => array(
									'type' => 'String',
									'desc' => 'The player property that you want to modify.'
							),'value' => array(
									'type' => 'String',
									'desc' => 'The new value that you want to set for the player property.'
							)
					)
			),
			'jsCallbackReady' => array(
					'desc'=>"A JavaScript function on the hosting web page that is called by KDP when the setup of externalInterface APIs is completed.",
					'params' => array(
							'objectId' => array(
									'type' => 'String',
									'desc' => 'Represents the identifier of the player that is embedded.'
							)
					)
			)
	);
	$objectDefinitions = array(
			'kWidget.apiOptions' => array(
					'wid'=> array(
							'desc' => "The partner id to be used in the API request."
					),
					'ks' => array(
							'desc' => "The Kaltura secret to be used in the request, if not supplied an anonymous KS will be generated and used."
					),
					'serviceUrl' => array(
							'desc' => 'Can be overwritten to target a different Kaltura server.',
							'default' => 'http://cdnapi.kaltura.com'
					),
					'serviceBase' => array(
							'desc' => "Can be overwritten to alternate Kaltura service path.",
							'default' => '/api_v3/index.php?service='
					),
					'statsServiceUrl' => array(
							'desc' => "Default supplied via Kaltura library include, can be overwritten to alternate URL for core analytics events.",
							'default' => 'http://stats.kaltura.com'
					),
					'disableCache' => array(
							'desc' => "Sends no-cache param to API, for a fresh result. Can hurt performance and CDN cachability should be used sparingly.",
							'default' => 'false'
					)
			),
			'kWidget.settingsObject' => array(
					'targetId' => array(
							'desc' => 'The DOM player target id attribute string if not defined as top level param.'
					),
					'wid' => array(
							'desc' => 'Widget id, usually the partner id prefixed by underscore.'
					),
					'uiconf_id' => array(
							'type' => 'Number',
							'optional' => true,
							'desc' => 'The player uiconf_id'
					),
					'entry_id' => array(
							'desc' => 'The content entry id. Can be left empty for a JavaScript based entry id.'
					),
					'flashvars' => array(
							'type' => 'Object',
							'desc' => 'Runtime configuration object, can override arbitrary uiVars and plugin config.'
					),
					'params' => array(
							'type' => 'Object',
							'desc' => 'Runtime configuration object, can override arbitrary uiVars and plugin config.'
					),
					'cache_st' => array(
							'optional'=> true,
							'desc' => 'String to burst player cache'
					)
			)
	);
	
?>