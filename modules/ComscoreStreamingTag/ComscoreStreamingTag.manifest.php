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

			'include' => array(
				'doc' => "Advanced configuration setting! Used to specify media metadata fields which should be automatically included in the collected data. Expects a comma-separated list of field names. To include all metadata fields, use value '_all_'. Please note that any included fields might eventually be excluded by the 'exclude' and 'exclude_prefixes' configuration settings, which take precedence over the 'include' configuration setting. Please do not use this setting unless you are explicitly instructed to do so by your comScore client account representative.",
				'label' => 'Include metadata fields',
				'type' => 'String',
			),

			'exclude' => array(
				'doc' => "Advanced configuration setting! Used to specify media metadata fields which should not be automatically included in the collected data. Expects a comma-separated list of field names. Takes precedence over the 'include' and 'include prefixes' configuration settings. Please do not use this setting unless you are explicitly instructed to do so by your comScore client account representative.",
				'label' => 'Exclude metadata fields',
				'type' => 'String',
			),

			'includePrefixes' => array(
				'doc' => "Advanced configuration setting! Used to specify prefixes of media metadata fields which should be automatically included in the collected data. Expects a comma-separated list of field name prefixes. Please note that any fields that are included because they match the supplied prefixes might eventually be excluded by the 'exclude' and 'exclude_prefixes' configuration settings, which take precedence over the 'include' configuration setting. Please do not use this setting unless you are explicitly instructed to do so by your comScore client account representative.",
				'label' => 'Include metadata field prefixes',
				'type' => 'String',
			),

			'excludePrefixes' => array(
				'doc' => "Advanced configuration setting! Used to specify prefixes of media metadata fields which should not be automatically included in the collected data. Expects a comma-separated list of field name prefixes. Takes precedence over the 'include' and 'include prefixes' configuration settings. Please do not use this setting unless you are explicitly instructed to do so by your comScore client account representative.",
				'label' => 'Exclude metadata field prefixes',
				'type' => 'String',
			),

			'pageView' => array(
				'doc' => "Advanced configuration setting! Used to instruct the plugin to send a page impression measurement when loaded. Please do not use this setting unless you are explicitly instructed to do so by your comScore client account representative.",
				'label' => 'Send page impression',
				'type' => 'boolean',
			),
		)
	)
);
