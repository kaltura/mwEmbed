<?php 
return array(
	"chromecast" => array(
		'scripts' => array( 'resources/chromecastLib.js', 'resources/chromecast.js' ),
		'dependencies' => 'mw.KBaseComponent',
		'kalturaPluginName' => 'chromecast',
		'styles' => 'resources/chromecast.css',
		'messageFile' => 'Chromecast.i18n.php',
	),
	"mw.EmbedPlayerChromecast"	=> array( 'scripts'=> "resources/mw.EmbedPlayerChromecast.js" ),
);