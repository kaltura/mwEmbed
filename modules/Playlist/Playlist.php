<?php 
return array(
	"mw.Playlist"=> array( 
		'scripts' => "resources/mw.Playlist.js",
		'styles' => "resources/mw.style.playlist.css",
		'dependencies' => array(
			"mw.PlaylistHandlerMediaRss",
			"mw.PlaylistLayoutJQueryUi",
			"mw.PlaylistLayoutMobile"
		)
	),
	"mw.PlaylistHandlerMediaRss" => array( 'scripts' => "resources/mw.PlaylistHandlerMediaRss.js" ),
	"mw.PlaylistLayoutJQueryUi" => array( 'scripts' => "resources/mw.PlaylistLayoutJQueryUi.js" ),
	"mw.PlaylistLayoutMobile" => array( 'scripts' => "resources/mw.PlaylistLayoutMobile.js" ),
);