<?php
/**
 * Dash plugin manifest 
*/

return array (
	'dash' => array(
		'description' => 'Support mpeg-dash transport for browsers which support it. (Dash-Industry-Forum) implementation',
		'attributes' => array(
			'sourceUrl' => array(
				'doc' => "The DASH manifest URL, default null, if set overrides platform sources",
				'type' => 'url'
			),
		)
	)
);