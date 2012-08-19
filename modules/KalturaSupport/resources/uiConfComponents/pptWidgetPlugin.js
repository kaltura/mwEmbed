/**
* Adds restrictUserAgent plugin support
* <Plugin id="restrictUserAgent" />
*/
( function( mw, $ ) {"use strict";

	var pptWidgetPlugin = function( embedPlayer ){
		// Init once
		if( $('#PlayerHolderWrapper').length == 0 ) {
			this.init( embedPlayer );
		}
	};

	pptWidgetPlugin.prototype = {

		pluginName: 'pptWidgetAPI',

		init: function( embedPlayer) {
			this.embedPlayer = embedPlayer;
			this.drawLayout();
			this.loadEntry();
		},

		drawLayout: function() {
			var embedPlayer = this.embedPlayer;
			var $uiConf = embedPlayer.$uiConf;
			var $pptWidgetWrapper = $uiConf.find('#PlayerHolderWrapper').find('#pptWidgetScreenWrapper');

			var pptWidgetWidth = $pptWidgetWrapper.attr('width');
			var playerWidth = $pptWidgetWrapper.next().attr('width');

			$('#container').prepend( this.getWidgetContainer( pptWidgetWidth ) );

			$('#playerContainer').css({
				'float': 'right',
				'width': playerWidth
			});
		},

		getWidgetContainer: function( width ) {
			var $message = $('<div />')
					.text('Presentation slides are not supported on mobile devices.')
					.css({
						'position': 'absolute',
						'text-align': 'center',
						'font-size': '18px',
						'width': '100%',
						'top': '48%'
					});
			return $('<div />')
					.attr('id', 'PlayerHolderWrapper')
					.css({
						'float': 'left',
						'width': width,
						'position': 'relative',
						'height': '100%'
					})
					.append( $message );
		},

		loadEntry: function() {
			var embedPlayer = this.embedPlayer;
			var presentationEntryId = this.embedPlayer.getFlashvars( 'videoPresentationEntryId' );
			var client = mw.kApiGetPartnerClient( this.embedPlayer.kwidgetid );
			client.doRequest({
					 'service' : 'baseentry',
					 'action' : 'get',
					 'version' : '-1',
					 'entryId' : presentationEntryId
			}, function( result ) {
				if( result.dataContent ) {
					var dataContent = $.parseXML( result.dataContent );
					var entryId = $( dataContent ).find('entryId').text();
					embedPlayer.sendNotification('changeMedia', {entryId: entryId});
				}
			});
		},

		getConfig: function( attr ) {
			return this.embedPlayer.getKalturaConfig(this.pluginName, attr);
		}
	};

	mw.addKalturaPlugin( 'pptWidgetAPI', function( embedPlayer, callback ){
		new pptWidgetPlugin( embedPlayer );
		// Continue player build-out
		callback();
	});

})( window.mw, window.jQuery );