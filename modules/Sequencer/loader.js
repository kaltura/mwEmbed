/*
* Sequencer loader
*/
mw.addClassFilePaths( {
	"mw.PlayList"			: "mw.PlayList.js",
	"mw.Sequencer"			: "mw.Sequencer.js",
	"mw.SeqRemoteSearchDriver" : "mw.SeqRemoteSearchDriver.js",	
	"mw.TimedEffectsEdit"	: "mvTimedEffectsEdit.js",
	"mw.FirefoggRender"		: "mw.FirefoggRender.js",
	
	"RemoteMwSequencer" :	"remotes/RemoteMwSequencer.js",
	
	"playlistEmbed" : "playlistEmbed.js"
} );


// Add the mw.SmilPlayer to the embedPlayer loader:
$j( mw ).bind( 'LoaderEmbedPlayerUpdateRequest', function( event, playerElement, classRequest ) {
	
	// Check if the playerElement includes a smil source.
	var includeSmilPlayer = false;
	if( $j( playerElement ).attr('type' ) == 'application/smil' ) {
		includeSmilPlayer = true;
	} else { 
		// check child sources
		$( playerElement ).find( 'source' )
	}
	
		
	// If the swarm transport is enabled add mw.SwarmTransport to the request.   	
	if( $j.inArray( 'mw.SwarmTransport', classRequest ) == -1 )  {
		classRequest.push( 'mw.SwarmTransport' );
	}
});

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