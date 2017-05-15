<?php 
/**
 * The ComScoreStreamingTag plugin manifest
 */

return array(
	'comScoreStreamingTag' => array(
		'description' => "Supports sending Streaming tag player analytics events to comScore.",
		'label' => "comScoreStreamingTag",
		'attributes'=> array(
			'c2' => array(
				'doc' => "Used to specify the comScore client ID (also called 'Customer C2') which identifies the comScore account for which the data should be collected. Expects a number with 7 or 8 digit.",
				'label' => 'comScore client ID',
				'type' => 'String',
			),

			'persistentLabels' => array(
				'doc' => "Advanced configuration setting! Used to specify 'persistent labels' which are added to all measurements. Expects a comma-separated list of 'name=value' assignments. Please do not use this setting unless you are explicitly instructed to do so by your comScore client account representative. Evaluations are supported",
				'label' => "Persistent labels",
				'type' => 'String',
			),

			'labelMapping' => array(
				'doc' => "Used to map metadata values to specific labels. The mapping is applied to the collected data whenever the player loads new media. Expects a comma-separated list of 'label=mapped-source' assignments. The 'mapped-source' can be a dynamic value - i.e., the usual substitutions like {mediaProxy.entry.name} - or a static value (which needs to be enclosed in quote characters). Please contact your comScore client account representative for more instructions on proper use of this configuration setting.",
				'label' => 'Label mapping',
				'type' => 'String',
			),

			'logUrl' => array(
				'doc' => "Advanced configuration setting! Used to override the automatically determined base measurement URL. Misuse of this setting can prevent data from being collected properly. Expects a URL. Please do not use this setting unless you are explicitly instructed to do so by your comScore client account representative.",
				'label' => 'Base measurement URL',
				'type' => 'url',
			),

			'debug' => array(
				'doc' => "Advanced configuration setting! Used to instruct the plugin to send log output to the web browser console (if available). Please do not use this setting unless you are explicitly instructed to do so by your comScore client account representative.",
				'label' => 'Enable debug logging',
				'type' => 'boolean',
			),

			'pageView' => array(
				'doc' => "Advanced configuration setting! Used to instruct the plugin to send a page impression measurement when loaded. Please do not use this setting unless you are explicitly instructed to do so by your comScore client account representative.",
				'label' => 'Send page impression',
				'type' => 'boolean',
			),
		)
	)
);
