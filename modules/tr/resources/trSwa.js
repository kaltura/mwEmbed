mw.PluginManager.add( 'trSwa', mw.KBasePlugin.extend({

	defaultConfig: {
		maxResults: 50,
		targetId: 'k-medialist-header',
		templatePath: '../tr/templates/swa.tmpl.html',
		headerTitle: 'Top News',
		selectedTag: 'news'
	},

	setup: function() {
		//this.updateTargetWithTemplate();
		var _this = this;
		this.setBinginge();
	},

	setBinginge: function() {
		var _this = this;
		this.bind('playerReady', $.proxy(function(){
			setTimeout(function(){
				var playlistHeader = $('.'+_this.getConfig('targetId'));
				playlistHeader.empty();
				_this.updateTargetWithTemplate();

			},1400)
		},this));
	},
	applyBehavior: function() {


	},
	hasValidTargetElement: function() {
		var playlistElement = this.embedPlayer.getPluginInstance('playlistAPI').getComponent();
		if( !mw.getConfig('EmbedPlayer.IsFriendlyIframe') ){
			return false;
		}
		var parentTarget = null;
		try {
			parentTarget = $(playlistElement).find("."+this.getConfig('targetId'))[0];
		} catch (e) {
			this.log('Unable to find element with id of: ' + this.getConfig('targetId') + ' on the parent document');
			return false;
		}
		if( parentTarget ) {
			return true;
		}
	},

	getTargetElement: function() {
		return $(this.embedPlayer.getPluginInstance('playlistAPI').getComponent()).find("."+this.getConfig('targetId'))[0];
	},

	updateTargetWithTemplate: function() {
		if( this.hasValidTargetElement() ) {
			var target = this.getTargetElement();
			this.getTemplateHTML().then(function(html) {
				target.innerHTML = html.html();
			});
		}
	}


}));