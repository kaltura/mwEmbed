<?php
	global $wgVideoPlayerSkinModule;
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
					"resources/skins/mw.PlayerControlBuilder.js",
				),
				'dependencies' => array(
					// mwEmbed support module
					'mediawiki.client',
					'mediawiki.UtilitiesTime',
					'mediawiki.Uri',
					'mediawiki.UtilitiesUrl',
					'mediawiki.jqueryMsg',
				
					// Browser fullscreen api support:
					'fullScreenApi',

					// We always end up loading native player
					'mw.EmbedPlayerNative',
					// Always load imageOverlay for capturing user gestures in source switches
					'mw.EmbedPlayerImageOverlay',

					// Sub classes:
					'mw.MediaElement',
					'mw.MediaPlayers',
					'mw.MediaSource',
					'mw.EmbedTypes',
				
					// jQuery dependencies:
					'jquery.client',
					'jquery.hoverIntent',
					'jquery.cookie',
					'jquery.ui.mouse',
					'jquery.debouncedresize',
					'jquery.menu',
					'jquery.ui.slider',
					'jquery.ui.touchPunch',
					
					// Set to mw.PlayerSkinKskin or mw.PlayerSkinMvpcf in config
					$wgVideoPlayerSkinModule
				),
				'styles' => "resources/skins/EmbedPlayer.css",
				'messageFile' => 'EmbedPlayer.i18n.php',
			),
				
			"mw.EmbedPlayerKplayer"	=> array( 'scripts'=> "resources/mw.EmbedPlayerKplayer.js" ),
			"mw.EmbedPlayerGeneric"	=> array( 'scripts'=> "resources/mw.EmbedPlayerGeneric.js" ),
			"mw.EmbedPlayerJava" => array( 'scripts'=> "resources/mw.EmbedPlayerJava.js"),
			"mw.EmbedPlayerNative"	=> array( 'scripts'=> "resources/mw.EmbedPlayerNative.js" ),
			"mw.EmbedPlayerImageOverlay" => array( 'scripts'=> "resources/mw.EmbedPlayerImageOverlay.js" ),

			"mw.EmbedPlayerVlc" => array( 'scripts'=> "resources/mw.EmbedPlayerVlc.js" ),

			"mw.PlayerSkinKskin" => array(
				'scripts' => "resources/skins/kskin/mw.PlayerSkinKskin.js",
				'styles' => "resources/skins/kskin/PlayerSkinKskin.css"
			),

			"mw.PlayerSkinMvpcf" => array(
				'scripts'=> "resources/skins/mvpcf/mw.PlayerSkinMvpcf.js",
				'styles'=> "resources/skins/mvpcf/PlayerSkinMvpcf.css"
			),
	);
?>