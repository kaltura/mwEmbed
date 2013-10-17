( function( mw, $ ) { "use strict";

	mw.PluginManager.add( 'captureThumbnail', mw.KBaseComponent.extend({
		defaultConfig: {
			"parent": "controlsContainer",
		 	"order": 63,
		 	"displayImportance": "low",
		 	"align": "right",
		 	"showTooltip": true,

		 	"tooltip": "Capture Thumbnail"
		 },

		 captureThumbnail: function() {
			var _this = this;
			// Save current playback state
			var isPlaying = this.getPlayer().isPlaying();
			// Pause and add Spinner
			this.getPlayer().pause();
			this.getPlayer().addPlayerSpinner();
			// Get current time
			var roundedTime = ( parseFloat( this.getPlayer().currentTime ) ).toFixed( 3 );
			// Make API request
			this.getKalturaClient().doRequest( {
				'service' : 'thumbasset',
				'action' : 'generate',
				'entryId' : this.getPlayer().kentryid,
				'thumbParams:quality': 75,
				'thumbParams:videoOffset': roundedTime,
				'thumbParams:objectType': 'KalturaThumbParams',
				'thumbParams:requiredPermissions:-': ''
			}, function( data ) {
				// In case of error, print an error message
				if ( data.message && data.message.indexOf( "Error" ) != -1 ) {
					_this.drawModal( isPlaying, true );
					return false;
				}
				var thumbId = data.id;
				if ( thumbId ) {
					_this.kClient.doRequest( {
						'service' : 'thumbasset',
						'action' : 'setAsDefault',
						'thumbAssetId' : thumbId
					}, function() {
						_this.drawModal( isPlaying );
					} );
				}
				return true;
			} );
		},

		drawModal: function( wasPlaying, isError ) {
			var _this = this;
			var alertObj = {
				'title': 'Capture Thumbnail',
				'message': 'New thumbnail has been set',
				'buttons': [],
				'callbackFunction': function() {
					if ( wasPlaying ) {
						_this.getPlayer().play();
					}
				},
				'isExternal': false, // KDP defaults to false
				'isModal': true,
				'props': {
					'buttonRowSpacing': '5px'
				}
			};
			if ( isError ) {
				alertObj.message = 'An error occurred while trying to capture thumbnail'
			}
			this.getPlayer().hideSpinner();
			this.getPlayer().layoutBuilder.displayAlert( alertObj );
		},

		 getComponent: function(){
			var _this = this;
			if( !this.$el ){
				this.$el = $( '<button />' )
								.addClass( 'btn icon-camera' + this.getCssClass() )
								.attr({
									'title': this.getConfig('tooltip')
								})
								.click( function(){
									_this.captureThumbnail();
								});
			}
			return this.$el;
		}
	}));

} )( window.mw, window.jQuery );