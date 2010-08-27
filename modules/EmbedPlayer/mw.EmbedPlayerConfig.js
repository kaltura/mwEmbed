mw.EmbedPlayerEmbedConfig = true;

mw.setDefaultConfig( {		
		// If the player controls should be overlaid on top of the video ( if supported by playback method)
		// can be set to false per embed player via overlayControls attribute 
		'EmbedPlayer.OverlayControls' : true,
		
		// A default apiProvider ( ie where to lookup subtitles, video properties etc )
		// NOTE: Each player instance can also specify a specific provider  
		"EmbedPlayer.ApiProvider" : "commons",
		
		// What tags will be re-written to video player by default
		// Set to empty string or null to avoid automatic video tag rewrites to embedPlayer 	
		"EmbedPlayer.RewriteTags" : "video,audio,playlist",
	
		// Default video size ( if no size provided )	
		"EmbedPlayer.DefaultSize" : "400x300",
	
		// If the video player should attribute kaltura	
		"EmbedPlayer.KalturaAttribution" : true,
		 
		 // Set the browser player warning flag to true by default ( applies to all players so its not part of attribute defaults above ) 
		"EmbedPlayer.ShowNativeWarning" : true,
		
		// If fullscreen is global enabled. 
		"EmbedPlayer.EnableFullscreen" : true,
		
		// If mwEmbed should use the Native player controls
		// this will prevent video tag rewriting and skinning
		// useful for devices such as iPad / iPod that
		// don't fully support DOM overlays or don't expose full-screen 
		// functionality to javascript  
		"EmbedPlayer.NativeControls" : false,
		
		// If mwEmbed should use native controls on mobile safari
		"EmbedPlayer.NativeControlsMobileSafari" : true,
		
		
		// The z-index given to the player interface during full screen ( high z-index )  
		"EmbedPlayer.fullScreenZIndex" : 999998,
		
		// The default share embed mode ( can be "object" or "videojs" )
		//
		// "object" will provide a <object tag pointing to mwEmbedFrame.php
		// 		Object embedding should be much more compatible with sites that
		//		let users embed flash applets
		// "videojs" will include the source javascript and video tag to
		//	 	rewrite the player on the remote page DOM  
		//		Video tag embedding is much more mash-up friendly but exposes
		//		the remote site to the mwEmbed javascript and can be a xss issue. 
		"EmbedPlayer.ShareEmbedMode" : 'object',
		
		// Default player skin name
		"EmbedPlayer.SkinName" : "mvpcf",	
		
		// Number of milliseconds between interface updates 		
		'EmbedPlayer.MonitorRate' : 250
	} );