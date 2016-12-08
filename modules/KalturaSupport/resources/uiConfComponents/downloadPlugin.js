( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'download', mw.KBaseComponent.extend({

		defaultConfig: {
			align: "right",
			"parent": mw.isMobileDevice() ? 'topBarContainer' : 'controlsContainer',
			smartContainer: 'morePlugins',
			smartContainerCloseEvent: 'downloadMedia',
			displayImportance: "low",
			downloadName: '{mediaProxy.entry.name}',
			showTooltip: true,
			preferredBitrate: '',
			flavorID: '',
			title: gM('mwe-embedplayer-download_clip'),
		 	order: 53
		},
		isSafeEnviornment: function(){
			return !mw.isIOS();
		},
		setup: function(){
			var _this = this;
			this.bind( 'downloadMedia', function() {
				_this.downloadMedia();
			});
		},
		downloadMedia: function() {
			var ks =  this.getKalturaClient().getKs();
			var downloadUrl = mw.getMwEmbedPath() + '/modules/KalturaSupport/download.php/wid/';
				downloadUrl += this.getPlayer().kwidgetid + '/uiconf_id/' + this.getPlayer().kuiconfid;
				downloadUrl += '/entry_id/' + this.getPlayer().kentryid + '?forceDownload=true';
				downloadUrl += '&downloadName=' + encodeURIComponent(this.getConfig('downloadName'));
				if( this.getConfig('flavorParamsId') ){
					downloadUrl += '&flavorParamsId=' + encodeURIComponent( this.getConfig('flavorParamsId') );
				}
				if ( this.getConfig( 'preferredBitrate' ) != '' && this.getConfig( 'preferredBitrate' ) != null ){
					downloadUrl += '&preferredBitrate=' + encodeURIComponent( this.getConfig( 'preferredBitrate' ));
				}
			    if ( this.getConfig( 'flavorID' ) != '' && this.getConfig( 'flavorID' ) != null ){
					downloadUrl += '&flavorID=' + encodeURIComponent( this.getConfig( 'flavorID' ));
				}

				if( ks ){
					downloadUrl += '&ks=' + ks;
				}
			
			window.open( downloadUrl );
		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				this.$el = $( '<button />' )
							.attr( 'title', this.getConfig('title') )
							.addClass( "btn icon-download" + this.getCssClass() )
							.click( function() {
								if( _this.isDisabled ) return ;
								_this.getPlayer().triggerHelper('downloadMedia');
							});
			}
			return this.$el;
		}
	}));

} )( window.mw, window.jQuery );
