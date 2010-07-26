/**
* Sequencer loader
*/

// Wrap in mw to not pollute global namespace
( function( mw ) {
	
	mw.addResourcePaths( {
		"mw.Sequencer"	: "mw.Sequencer.js",
		
		"mw.Sequencer"	: "mw.Sequencer.js",		
		"mw.style.Sequencer" : "mw.style.Sequencer.css",
		
		"mw.SequencerPlayer" : "mw.SequencerPlayer.js",
		"mw.SequencerTimeline" : "mw.SequencerTimeline.js",
		"mw.SequencerKeyBindings" : "mw.SequencerKeyBindings.js",
		"mw.SequencerTools" : "mw.SequencerTools.js",
		
		"mw.SequencerMenu" : "mw.SequencerMenu.js", 
		
		"mw.SequencerActionsSequence" : "mw.SequencerActionsSequence.js",
		"mw.SequencerActionsView" : "mw.SequencerActionsView.js",
		"mw.SequencerActionsEdit" : "mw.SequencerActionsEdit.js",
		
		"mw.SequencerRender" : "mw.SequencerRender.js",
		
		"mw.FirefoggRender"	: "mw.FirefoggRender.js",
		"$j.fn.layout"		: "ui.layout/ui.layout-1.2.0.js",
		
		"mw.RemoteSequencer" : "mw.RemoteSequencer.js",
		
		"mw.style.Sequencer" : "css/mw.style.Sequencer.css",
		
		"playlistEmbed" : "playlistEmbed.js"
	} );
	
	mw.setDefaultConfig({
		// If the sequencer should attribute kaltura
		"Sequencer.KalturaAttribution" : true
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
	
	// Sequenceror module loader
	mw.addModuleLoader( 'Sequencer', function( ) {		
		// Make sure we have the required mwEmbed libs:			
		return [
			[	// Load the EmbedPlayer Module ( includes lots of dependent classes )   
				'EmbedPlayer',
				'mw.Sequencer'
			],		
			[										
				'$j.contextMenu',
						
				'mw.SequencerPlayer',
				'mw.SequencerRender',
				
				'mw.SequencerTimeline',
				'mw.SequencerKeyBindings',
				'mw.SequencerTools',
				
				'mw.SequencerMenu',
				'mw.SequencerActionsSequence',
				'mw.SequencerActionsView',		
				'mw.SequencerActionsEdit',
				
				'mw.style.Sequencer'
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
		