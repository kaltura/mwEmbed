<?php
/**
 * Peer5 plugin manifest 
*/

return array (
	/** Playlist */
	'peer5' => array(
		'description' => 'The Peer5 P2P distrabution <a title="Peer5" href="http://peer5.com" target="_new">learn more</a>. <br>
		Note you must use google chrome version 25 or greater to use the p2p transport. Other browsers
		will just use http progressive streaming.',
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
                'type' => 'string'
            ),

		)
	)
);