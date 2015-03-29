mw.PluginManager.add( 'trControls', mw.KBasePlugin.extend({

	defaultConfig: {
		targetId: 'playerControlsContainer',
		templatePath: 'templates/player-controls.tmpl.html'
	},

	setup: function() {
		this.updateTargetWithTemplate();
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
			var target = this.getTargetElement();debugger;
			target.innerHTML = this.getTemplateHTML();
		}
	}

}));