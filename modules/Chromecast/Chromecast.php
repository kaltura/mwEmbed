<?php 
return array(
	"chromecast" => array(
		'scripts' => array( 'resources/chromecastLib.js', 'resources/chromecast.js' ),
		'dependencies' => 'mw.KBaseComponent',
		'kalturaPluginName' => 'chromecast',
		'styles' => 'resources/chromecast.css'
	),
	"mw.EmbedPlayerChromecast"	=> array( 'scripts'=> "resources/mw.EmbedPlayerChromecast.js" ),
);