mw.PluginManager.add( 'trControls', mw.KBasePlugin.extend({

	defaultConfig: {
		targetId: 'playerControlsContainer',
		templatePath: '../tr/templates/player-controls.tmpl.html'
	},

	setup: function() {
		this.updateTargetWithTemplate();
		this.applyBehavior();
	},

	applyBehavior: function() {
		var doc = window['parent'].document;
		var $parentContainer = $(doc.getElementById('topContainer'));
		var $playerInterface = this.getPlayer().getInterface();
		var player = this.getPlayer();

		// Do fullscreen
		$(doc).find(".player-mode").click(function(){
			$parentContainer.addClass("enhanced");
			$playerInterface.addClass('fullscreen');
		});

		// Restore to normal mode
		$(doc).find(".enhanced-mode").click(function(){
			$parentContainer.removeClass("enhanced");
			$playerInterface.removeClass('fullscreen');
		});

		$(doc).find(".share-copy").click(function(){
			player.sendNotification('toggleScreen', 'share');
		});

		$(doc).find(".share-email").click(function(){
			player.sendNotification('doShare');
		});

		this.bind('shareEvent', function(e, shareData){
			var entryName = player.evaluate('{mediaProxy.entry.name}');
			var mailToUrl = 'mailto:?subject=Check out ' + entryName + '&body=Check out ' + entryName + ': ' + shareData.shareLink;
			window.open(mailToUrl);
		});


	},
	hasValidTargetElement: function() {
		if( !mw.getConfig('EmbedPlayer.IsFriendlyIframe') ){
			return false;
		}
		var parentTarget = null;
		try {
			parentTarget = window['parent'].document.getElementById( this.getConfig('targetId') );
		} catch (e) {
			this.log('Unable to find element with id of: ' + this.getConfig('targetId') + ' on the parent document');
			return false;
		}

		if( parentTarget ) {
			return true;
		}
	},

	getTargetElement: function() {
		return window['parent'].document.getElementById( this.getConfig('targetId') );
	},

	updateTargetWithTemplate: function() {
		if( this.hasValidTargetElement() ) {
			var target = this.getTargetElement();
			target.innerHTML = this.getTemplateHTML().html();
		}
	}

}));