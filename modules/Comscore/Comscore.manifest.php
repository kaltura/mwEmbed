<?php 
/**
 * The comscore plugin manifest
 */
$cAttr = array(
	'cTagsMap'=>array(
		'doc' => "Url to a comscore xml tag mapping file",
		'type' => 'url',
		'edit' => true
	),
	'trackEventMonitor'=> array(
		'doc' => 'Function called on parent page for every event',
		'type' => 'string',
		'edit' => true,
	)
);
// build out c2-c10
for( $i=2; $i <= 6; $i++){
	$cAttr['c'.$i] = array(
		'doc' => 'The comscore c'.$i.' index number',
		'edit' => true
	);
	$cAttr[ 'c'.$i.'attributeKey '] = array(
		'doc' => 'The comscore attribute name',
		'edit' => true
	);
	$cAttr[ 'c'.$i.'attributeValue '] = array(
		'doc' => 'The comscore attribute value',
		'edit' => true
	);
}

return array(
	'comscore' => array(
		'description' => "Comsore Analytics",
		'attributes'=> $cAttr
	)
);