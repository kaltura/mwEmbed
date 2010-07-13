/**
* SequenceEdit loader
*/

// Wrap in mw to not pollute global namespace
( function( mw ) {
	
	mw.addResourcePaths( {
		"mw.SequenceEdit"	: "mw.SequenceEdit.js",
		
		"mw.SequenceEdit"	: "mw.SequenceEdit.js",		
		"mw.style.SequenceEdit" : "mw.style.SequenceEdit.css",
		"mw.SequenceEditPlayer" : "mw.SequenceEditPlayer.js",
		"mw.SequenceEditTimeline" : "mw.SequenceEditTimeline.js",
		"mw.SequenceEditKeyBindings" : "mw.SequenceEditKeyBindings.js",
		"mw.SequenceEditTools" : "mw.SequenceEditTools.js",
		"mw.SequenceEditMenu" : "mw.SequenceEditMenu.js", 
		"mw.SequenceEditRender" : "mw.SequenceEditRender.js",
		
		"mw.FirefoggRender"	: "mw.FirefoggRender.js",
		"$j.fn.layout"		: "ui.layout/ui.layout-1.2.0.js",
		
		"mw.RemoteSequenceEdit" : "mw.RemoteSequenceEdit.js",
		
		"mw.style.SequenceEdit" : "css/mw.style.SequenceEdit.css",
		
		"playlistEmbed" : "playlistEmbed.js"
	} );
	
	mw.setDefaultConfig({
		// If the sequencer should attribute kaltura
		"SequenceEdit.KalturaAttribution" : true
	})
	
	
	/**
	 * The FirefoggRender sub module 
	 */
	mw.addModuleLoader( 'FirefoggRender', 
		[
			'mw.Firefogg', 
			'mw.FirefoggRender',
			'mw.UploadInterface'
		]
	);
	
	// SequenceEditor module loader
	mw.addModuleLoader( 'SequenceEdit', function( ) {		
		// Make sure we have the required mwEmbed libs:			
		return [
			[	// Load the EmbedPlayer Module ( includes lots of dependent classes )   
				'EmbedPlayer',
				'mw.SequenceEdit'
			],		
			[										
				'$j.contextMenu',
						
				'mw.SequenceEditPlayer',
				'mw.SequenceEditTimeline',
				'mw.SequenceEditKeyBindings',
				'mw.SequenceEditTools',
				'mw.SequenceEditMenu',
				'mw.SequenceEditRender',
				
				'mw.style.SequenceEdit'
			],
			[
			 	'$j.fn.layout',
				// UI components used in the sequencer interface: 
				'$j.ui.accordion',
				'$j.ui.dialog',
				'$j.ui.droppable',
				'$j.ui.draggable',
				'$j.ui.progressbar',
				'$j.ui.sortable',
				'$j.ui.resizable',
				'$j.ui.slider',
				'$j.ui.tabs'
			]
		];	
	});
	
} )( window.mw );	
		