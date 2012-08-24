<?php 
/**
 * The comscore plugin manifest
 */
$str = <<<'EOD'
<a href="http://www.comscore.com">comScore</a>
is an Internet marketing research company providing marketing data and 
services to many of the Internet's largest businesses. comScore tracks all
internet data on its surveyed computers in order to study online behavior. 
comScore's experienced analysts work closely with clients to identify their 
business objectives and determine how they can best apply and benefit from 
comScore's vast databases of consumer behavior. comScore maintains massive 
proprietary databases that provide a continuous, real-time measurement of the
myriad ways in which the Internet is used and the wide variety of activities 
that are occurring online. source: 
<a href="http://www.crunchbase.com/company/comscore">http://www.crunchbase.com/company/comscore</a><p></p>
EOD;

return array(
	'comscore' => array(
		'description' => $str,
		'attributes'=> array(
			'cTagsMap'=>array(
				'doc' => "Url to a comscore xml tag mapping file",
				'type' => 'url',
				'edit' => true
			),
			'trackEventMonitor'=> array(
						'doc' => 'Function called on parent page for every event',
						'type' => 'string',
						'edit' => true,
			),
			'c2' => array(
				'doc' => "Party who delivered the content",
				'type' => 'url',
				'edit' => true
			),
			
			'c3' => array(
				'doc' => "Owner of the content (Content producer)",
				'type' => 'url',
				'edit' => true
			),
			'c3attributeKey' => array(
				'doc' => "Mapping file attribute key for content owner",
				'type' => 'string',
				'edit' => true
			),
			'c3Value' => array(
				'doc' => "value key  for content owner",
				'type' => 'string',
				'edit' => true
			),
			'c4' => array(
				'doc' => "Location/site where content was viewed",
				'type' => 'url',
				'edit' => true
			),
			'c4attributeKey' => array(
				'doc' => "Mapping file attribute key for site /location",
				'type' => 'string',
				'edit' => true
			),
			'c4Value' => array(
				'doc' => "value key for  site /location",
				'type' => 'string',
				'edit' => true
			),
			'c5' => array(
				'doc' => "Genre and type of content",
				'type' => 'url',
				'edit' => true
			),
			'c5attributeKey' => array(
				'doc' => "Mapping file attribute key for Genre and type",
				'type' => 'string',
				'edit' => true
			),
			'c5Value' => array(
				'doc' => "value key for site / location",
				'type' => 'string',
				'edit' => true
			),
			'c6' => array(
				'doc' => "Show level reporting; campaign reporting; episode reporting",
				'type' => 'url',
				'edit' => true
			),

		)
	)
);