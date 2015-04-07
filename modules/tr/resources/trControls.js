mw.PluginManager.add( 'trControls', mw.KBasePlugin.extend({

	defaultConfig: {
		maxResults: 2,
		targetId: 'playerControlsContainer',
		templatePath: '../tr/templates/player-controls.tmpl.html'
	},

	setup: function() {
		this.updateTargetWithTemplate();
		var _this = this;
		setTimeout(function(){
				_this.applyBehavior();
			}
		,100)
	},

	applyBehavior: function() {
		var doc = window['parent'].document;
		var $parentContainer = $(doc.getElementById('topContainer'));
		var $playerInterface = this.getPlayer().getInterface();
		var player = this.getPlayer();

		var _this = this;
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

		$(doc).find(".playlist-test").click(function(){
			var params = {
				"service":"playlist" ,
				"action":"executefromfilters" ,
				"ks":"Y2U4NWM1NWU5MThjMzVlY2RiNDFjZmQyNzJmY2ViYWY5MDhhYThlN3wyNzAxNzsyNzAxNzsxNDI4NTE0NTc2OzI7MTQyODQyODE3Ni41OTQ2O19fQURNSU5fXzI2Njg3Ozs7" ,
				'filters:item0:tagsMultiLikeOr' : "noa" , 	// search term here
				'filters:item0:idNotIn' : "0_0g8l44yy" , 	// dont fetch current entry
				"totalResults" : _this.getConfig("maxResults")
			}
			player.sendNotification('loadExternalPlaylist', params);
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

	//			this.bind('loadExternalPlaylist', function (e,params) {


}));