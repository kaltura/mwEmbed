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
		return ( mw.parseUri( inputString ).protocol ) ;
	},
	
	/**
	 * Try to add media via url and present a dialog if failed 
	 *  or user input is required
	 *  
	 *  Uses remoteSearchDriver to help in retrieving entry info
	 *  @param  {Object} remoteSearchDriver The remote search driver
	 */ 
	addByUrlDialog: function( remoteSearchDriver, url ){		
		var _this = this;		
		var $dialog = mw.addLoaderDialog( gM( 'mwe-sequencer-loading-asset' ) );
		
		// Close / empty the toolWindow
		_this.sequencer.getTools().setDefaultText();		
		
		var foundImportUrl = false;
		// See if the asset matches the detailsUrl key type of any enabled content provider: 
		$j.each( remoteSearchDriver.getEnabledProviders(), function(providerName, provider){
			if( mw.parseUri( provider.detailsUrl ).host  ==  mw.parseUri( url).host ){	
				foundImportUrl = true ;
				
				mw.log("addByUrlDialog: matching host getResourceFromUrl::"
						+ mw.parseUri( provider.detailsUrl ).host 
						+ ' == ' + mw.parseUri( url).host );				
				
				// Do special check for mediawiki templates and pages as 'special' smil types 
				if( provider.lib == 'mediaWiki' ){
					// xxx we should do a query to the  api to determine namespace instead of hard coded checks
					remoteSearchDriver.loadSearchLib( provider, function( provider ){
						var titleKey = provider.sObj.getTitleKeyFromMwUrl( url );
						if( !titleKey ){
							// continue for loop ( if we can't get a title from the mediaWiki url )
							return true;
						}
						// Check the title type 
						// xxx should use wgFormattedNamespacess
						if( titleKey.indexOf('File:') == 0 ){
							// Asset is a file import resource as a file: 
							remoteSearchDriver.getResourceFromUrl( provider, url, function( resource ){
								if( ! resource ){
									$dialog.html( 'Error loading asset');
									return ; 
								}
								// Get convert resource to smilClip and insert into the timeline
								_this
								.sequencer
								.getAddMedia()
								.getSmilClipFromResource( resource, function( smilClip ) {
									_this.sequencer.getTimeline().insertSmilClipEdit( smilClip );
									mw.closeLoaderDialog();
								});			 						
							});	
						} else {
							// xxx special Template resource import goes here
						}
										
					});
				} else {
					mw.log(" only MediaWiki URLs supported as resources right now");					
				}				
			}
		});	
		
		if( ! foundImportUrl ){
			mw.closeLoaderDialog();
		}
		// xxx support direct asset include
		if( mw.getConfig( 'Sequencer.AddAssetByUrl' )){
			// try directly adding the asset
		}
	}	
}

} )( window.mw );	