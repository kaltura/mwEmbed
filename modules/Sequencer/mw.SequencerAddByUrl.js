/**
* Sequencer add by url support ( ties into mwEmbed AddMedia remoteSearchDriver module )
*/

//Wrap in mw closure
( function( mw ) {
	
mw.SequencerAddByUrl = function( sequencer ) {
	return this.init( sequencer );
};
mw.SequencerAddByUrl.prototype = {
	init: function( sequencer ){
		this.sequencer = sequencer;
	},
	
	/**
	 * Does a basic parseUri check to see if a string is likely a url:
	 */
	isUrl: function( inputString ){
		return ( mw.parseUri( inputString ).authority != mw.parseUri( inputString ).host ) ;
	},
	
	/**
	 * Try to add media via url and present a dialog if failed 
	 *  or user input is required
	 *  
	 *  Uses remoteSearchDriver to help in retrieving entry info
	 *  @param  {Object} remoteSearchDriver The remote search driver
	 */ 
	addByUrlDialog: function( remoteSearchDriver, url ){
		// See if the asset matches the detailsUrl key type of any enabled content provider: 
		$j.each( remoteSearchDriver.getEnabledProviders(), function(providerName, provider){
			
		});	
		
		if( mw.getConfig( 'Sequencer.AddAssetByUrl' )){
			// try directly adding the asset
		}
	}	
}

} )( window.mw );	