/**
 * Master default configuration for sequencer
 * 
 * Do not modify this file rather after including mwEmbed 
 * set any of these configuration values via
 * the mw.setConfig() method 
 * 
 */

// Define the class name 
mw.SequencerConfig = true;

mw.setDefaultConfig({
	// If the sequencer should attribute kaltura
	"Sequencer.KalturaAttribution" : true,
	
	// If a the sequencer should open new windows 
	"Sequencer.SpawnNewWindows" : true,
	
	// If a the sequencer should include withJS=MediaWiki:mwEmbed in created urls 
	// ( save gards ) against users that are 'trying' the 
	"Sequencer.WithJsMwEmbedUrlHelper" : true,
	
	// The size of the undo stack 
	"Sequencer.NumberOfUndos" : 100,
	
	// Default image duration
	"Sequencer.AddMediaImageDuration" : 2,
	
	// Default image source width
	"Sequencer.AddMediaImageWidth" : 640,	
	
	// If a asset can be directly added to the sequence by url
	// ( if disabled only urls that are part addMedia can be added ) 
	"Sequencer.AddAssetByUrl" : true,
	
	// Default timeline clip timeline track height
	"Sequencer.TimelineTrackHeight" : 100,
	
	// Default timeline audio or collapsed timeline height 
	"Sequencer.TimelineColapsedTrackSize" : 35,

	// Asset domain restriction array of domains or keyword 'none'
	// Before any asset is displayed its domain is checked against this array of wildcard domains
	// Additionally best effort is made to check any text/html asset references  
	// for example [ '*.wikimedia.org', 'en.wikipeida.org']
	"Sequencer.DomainRestriction" : 'none'
})
	