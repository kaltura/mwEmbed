<?php
/**
 * Peer5 plugin manifest 
*/

return array (
	/** Playlist */
	'peer5' => array(
		'description' => 'The Peer5 P2P distribution <a title="Peer5" href="http://peer5.com" target="_new">learn more</a>. <br>		
		Requirements: Google Chrome version (M26+) Other browsers will just use http progressive streaming. <br>
		The highest bitrate available will be used, unless specified otherwise using mediaProxy.preferedFlavorBR param <br>',
		'attributes' => array(
			'peer5libUrl' => array(
				'doc' => "The URL to Peer5 SaaS",
				'type' => 'string'
			),

			'url' => array(
				'doc' => "Video URL to override the existing url loaded from Kaltura",
   				'type' => 'string'
			),

			'overlayUI' => array(
				'doc' => "Flag to enable a visualization overlay",
				'type' => 'boolean'
			),

			'proxy' => array(
				'doc' => "Flag to enable the Peer5 proxy. Set false only if you are sure your content is compatible (default is true)",
				'type' => 'boolean'
			),

		)
	)
);