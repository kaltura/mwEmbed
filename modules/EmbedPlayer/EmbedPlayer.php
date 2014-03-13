<?php
	// Register all the EmbedPlayer modules
	return array(
			"mw.MediaElement" => array( 'scripts' => 'resources/mw.MediaElement.js' ),
			"mw.MediaPlayer" => array( 'scripts' => 'resources/mw.MediaPlayer.js' ),
			"mw.MediaPlayers" => array(
				'scripts' => 'resources/mw.MediaPlayers.js',
				'dependencies' => 'mw.MediaPlayer'
			),
			
			"mw.MediaSource" => array( 
					'scripts' => 'resources/mw.MediaSource.js',
					'dependencies' => 'mw.MwEmbedSupport'
			),
			"mw.EmbedTypes" => array(
				'scripts' => 'resources/mw.EmbedTypes.js',
				'dependencies' =>  array(
					'mw.MediaPlayers',
					'mediawiki.Uri'
				)
			),
			"mw.EmbedPlayer" => array(
				'scripts' => array(
					"resources/mw.processEmbedPlayers.js",
					"resources/mw.EmbedPlayer.js",
					"resources/mw.FullScreenManager.js",
					"resources/mw.PlayerLayoutBuilder.js",
				),
				'dependencies' => array(
					// mwEmbed support module
					'mediawiki.client',
					'mediawiki.UtilitiesTime',
					'mediawiki.Uri',
					'mediawiki.UtilitiesUrl',
					'mediawiki.jqueryMsg',
				
					// Browser fullscreen api support:
					'screenfull',

					// We always end up loading native player
					'mw.EmbedPlayerNative',
					// Always load imageOverlay for capturing user gestures in source switches
					'mw.EmbedPlayerImageOverlay',

					// Native player component
					'mw.EmbedPlayerNativeComponent',

					// Sub classes:
					'mw.MediaElement',
					'mw.MediaPlayers',
					'mw.MediaSource',
					'mw.EmbedTypes',
				
					// jQuery dependencies:
					'jquery.client',
					'jquery.hoverIntent',
					'jquery.cookie',
					'jquery.debouncedresize',
					'jquery.ui.touchPunch',
					'jquery.ui.slider',
					'jquery.ui.tooltip',
					'jquery.naturalSize',

					'mw.PlayerElementHTML',
					'mw.PlayerElementFlash',
					'mw.PlayerElementSilverlight',
				),
				'styles' => "resources/EmbedPlayer.css",
				'messageFile' => 'EmbedPlayer.i18n.php',
			),

			'mw.PluginManager' => array(
				'scripts' => 'resources/mw.PluginManager.js'
			),

			"mw.EmbedPlayerSilverlight"	=> array( 'scripts'=> "resources/mw.EmbedPlayerSilverlight.js",
			'dependencies' => array(
				"mw.PlayerElementSilverlight"
			) ),
			"mw.EmbedPlayerKplayer"	=> array( 'scripts'=> "resources/mw.EmbedPlayerKplayer.js" ),
			"mw.EmbedPlayerGeneric"	=> array( 'scripts'=> "resources/mw.EmbedPlayerGeneric.js" ),
			"mw.EmbedPlayerJava" => array( 'scripts'=> "resources/mw.EmbedPlayerJava.js"),
			"mw.EmbedPlayerNative"	=> array( 'scripts'=> "resources/mw.EmbedPlayerNative.js" ),
			"mw.EmbedPlayerChromecast"	=> array( 'scripts'=> "resources/mw.EmbedPlayerChromecast.js" ),
			"mw.EmbedPlayerImageOverlay" => array( 'scripts'=> "resources/mw.EmbedPlayerImageOverlay.js" ),
			"mw.EmbedPlayerNativeComponent" => array( 'scripts' =>  
				array(
					"resources/mw.EmbedPlayerNativeComponent.js"
				),
				'dependencies' => array(
					"nativeBridge"
				)
			),
			'nativeBridge' => array( 'scripts' => "binPlayers/nativeBridge.js" ),

			"mw.EmbedPlayerVlc" => array( 'scripts'=> "resources/mw.EmbedPlayerVlc.js" ),

			"mw.PlayerElement" => array(
				'scripts' => 'resources/playerElement/mw.PlayerElement.js',
				'dependencies' =>  array( 'class' )
			),
			"mw.PlayerElementHTML" => array(
				'scripts' => 'resources/playerElement/mw.PlayerElementHTML.js',
				'dependencies' =>  array( 'mw.PlayerElement' )
			),
			"mw.PlayerElementFlash" => array(
				'scripts' => 'resources/playerElement/mw.PlayerElementFlash.js',
				'dependencies' =>  array( 'mw.PlayerElement' )
			),
			"mw.PlayerElementSilverlight" => array(
				'scripts' => array(
					'resources/playerElement/Silverlight.js',
					'resources/playerElement/mw.PlayerElementSilverlight.js'
				),
				'dependencies' =>  array( 'mw.PlayerElement' )
			)
	);
?>