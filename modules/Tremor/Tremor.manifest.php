<?php
/**
 * Tremor plugin manifest 
*/

return array (
	/** Playlist */
	'tremor' => array(
		'description' => 'Tremor Video is a digital video technology company that serves the complementary needs of the media community. 
		Tremor VideoHub Server offers advertisers massive reach and proven engagement with their marketing messages in 
		100% brand-safe environments, while the Acudeo income engine provides publishers easy access to multiple sources 
		of revenue and the ability to manage and monetize every video impression. <a target="_new" href="http://tremorvideo.com/">More about Tremor</a>
		<br> 
		Kaltura supports a full Acudeo ad module integration for both HTML5 and flash',
		'attributes' => array(
			'displayAdCountdown' => array(
				'doc' => "If the ad countdown should be displayed",
				'initvalue' => 'true',
				'type' => 'string'
			),
			'progId' =>array(
				'doc' => "The Tremor policy id",
				'label' => 'Tremor policy id',
				'type' => 'string'
			),
			'banner' => array(
				'doc' => "The banner id",
				'label' => 'Banner id',
				'type' => 'string'
			),
			'timeout' => array(
				'doc' => "Time in seconds to load the tremor ad, default 10 seconds",
				'initvalue' => 10,
				'type' => 'number'
			)
		)
	)
);