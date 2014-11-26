<?php
/**
 * Peer5 plugin manifest 
*/

return array (
	/** Playlist */
	'peer5' => array(
		'description' => 'The Peer5 P2P distribution <a title="Peer5" href="http://peer5.com" target="_new">learn more</a>. <br>		
		Requirements: Google Chrome version (M26+) Other browsers use HTTP progressive streaming. <br>
		The highest bitrate available is used, unless specified otherwise using mediaProxy.preferedFlavorBR param <br>',
		'attributes' => array(
			'peer5libUrl' => array(
				'doc' => "The URL to Peer5 SaaS.",
				'type' => 'string'
			),

			'url' => array(
				'doc' => "The video URL to override the existing URL loaded from Kaltura.",
   				'type' => 'string'
			),

			'overlayUI' => array(
				'doc' => "Flag to enable a visualization overlay.",
				'type' => 'boolean'
			),

			'proxy' => array(
				'doc' => "Flag to enable the Peer5 proxy. Set to false only if you are certain your content is compatible. (The default is true.)",
				'type' => 'boolean'
			),

		)
	)
);
