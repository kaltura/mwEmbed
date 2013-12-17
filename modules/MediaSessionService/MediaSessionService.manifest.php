<?php 
return array (
	'mediaSessionService' => array(
		'description' => 'Media Session Service enables content and ad stitching services on a per-user basis. 
			This enables one to one ad targeting, and gapless ad insertion with adaptive streaming, in live and VOD content.
			Ad stitching is configured with standard Kaltura ad plugin configuration. This component demonstrates hybrid 
			Ad stitching mode, where the player retains all benefits client side ad and anlytics requests 
			( with associated user tracking cookie ), while benefiting form the performance of server side stitching.
			It adds extra immunities to ad block or failed ad request, with server side ad fulfillment where needed.
			<br>',
		'attributes' => array(
			'playlist_id' => array(
				'doc' => "The id of the playlist to be displayed",
				'type' => 'string'
			)
		)
	)
);