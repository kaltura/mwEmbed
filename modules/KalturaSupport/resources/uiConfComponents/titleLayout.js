( function( mw, $ ) {"use strict";

	var titleLayout = function( embedPlayer ){
		this.init( embedPlayer );
	};

	titleLayout.prototype = {

		bindPostfix: '.titleLayout',

		init: function( embedPlayer ) {
			this.embedPlayer = embedPlayer;
			this.destroy();
			this.bindPlayer();
		},

		bindPlayer: function() {

			var _this = this;
			var embedPlayer = this.embedPlayer;

			embedPlayer.bindHelper("playerReady" + this.bindPostfix, function(){

				// We add "block" class to tell the player to calculate the element height
				var $titleContainerDiv = $('<div />')
					.addClass('titleContainer block')
					.html(
						_this.getTitleBox()
					);

				embedPlayer.$interface.parent().find('.titleContainer').remove();
				var belowPlayer = embedPlayer.$uiConf.find( '#controlsHolder' ).next( '#TopTitleScreen' ).length;
				if( belowPlayer ){
					embedPlayer.getVideoHolder().after(
						$titleContainerDiv
					);
				}else {
					embedPlayer.$interface.prepend(
						$titleContainerDiv
					);
				}

				// TODO: we should bind to "buildLayout" event and add plugin layout there
				// so that we will only have one call to updateLayout once all plugins finished loaded
				embedPlayer.doUpdateLayout();
			});
		},

		getTitleBox: function(){
			var $titleConfig = this.embedPlayer.$uiConf.find('#TopTitleScreen');
			var titleLayout = new mw.KLayout({
				'$layoutBox' : $titleConfig,
				'embedPlayer' : this.embedPlayer
			});
			var $returnLayout = titleLayout.getLayout();
			if ( $returnLayout.find('span').text() == 'null' ) {
				$returnLayout.find('span').text('');
			}
			return $returnLayout;
		},

		destroy: function() {
			this.embedPlayer.unbindHelper( this.bindPostfix );
		}
	};

	// 	Check for the Title
	mw.addKalturaPlugin('TopTitleScreen', function( embedPlayer, callback ){
		// Bind changeMedia to update title
		new titleLayout( embedPlayer );
		// Continue regardless of title is found or not
		callback();
	});

})( window.mw, window.jQuery );