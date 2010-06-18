/*
* Sequencer loader
*/
mw.addResourcePaths( {
	
	"mw.Sequencer"			: "mw.Sequencer.js",
	"mw.SeqRemoteSearchDriver" : "mw.SeqRemoteSearchDriver.js",	
	"mw.TimedEffectsEdit"	: "mvTimedEffectsEdit.js",
	"mw.FirefoggRender"		: "mw.FirefoggRender.js",
	
	"RemoteMwSequencer" :	"remotes/RemoteMwSequencer.js",
	
	"playlistEmbed" : "playlistEmbed.js"
} );


mw.addModuleLoader( 'FirefoggRender', function( callback) {
	mw.load( [
		'mw.Firefogg', 
		'mw.FirefoggRender',
		'mw.UploadInterface'
	], function() {
		callback( 'FirefoggRender' );
	});
});

mw.addModuleLoader( 'Sequencer', function( callback ) {
	//Get sequencer style sheet	
	mw.getStyleSheet( mw.getMwEmbedPath() + 'css/mv_sequence.css' );
	// Make sure we have the required mwEmbed libs:			
	mw.load( [
		[	// Load the EmbedPlayer Module ( includes lots of dependent classes )   
			'EmbedPlayer'
		],		
		[										
			// Load playlist and its dependencies
			'mw.PlayList',
			'$j.ui',
			'$j.contextMenu',
			'JSON',
			'mw.Sequencer'
		],
		[
			// Ui components used in the sequencer interface: 
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
	], function() {
		callback( 'Sequencer' );
	});

});