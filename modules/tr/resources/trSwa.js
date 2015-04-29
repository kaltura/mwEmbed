mw.PluginManager.add( 'trSwa', mw.KBasePlugin.extend({

	defaultConfig: {
		maxResults: 50,
		targetId: 'k-medialist-header',
		templatePath: '../tr/templates/swa.tmpl.html',
		headerTitle: 'Top News',
		selectedTag: 'news',
		autoNext: true
	},

	setup: function() {
		this.setBinginge();
	},

	setBinginge: function() {
		var _this = this;
		this.bind('playerReady', $.proxy(function(){
			if(_this.getConfig('loaded')){
				return;
			}
			_this.setConfig('loaded' , true);
			setTimeout(function(){
				var playlistHeader = $('.'+_this.getConfig('targetId'));
				playlistHeader.empty();
				_this.updateTargetWithTemplate();
				_this.loadTopics();
			},1000)
		},this));
		this.bind('playlistSelected', $.proxy(function(){
			//TODO once move to 2.30 hook this to see how playlist loading effects this UI. Right now it clears the UI
		}))
		this.bind('playerPlayEnd', $.proxy(function(){
			if(_this.getConfig('autoNext')){
				_this.embedPlayer.sendNotification('trLoadNewPlaylist', params );
			}
		}))

	},
	loadTopics: function() {
		//simulate an a-sync callback to BE to load the topics
		var _this = this;
		setTimeout(function(){
			var resultsStabArr = [
				{id: "1_vjb6n80x", name: "My Playlist Name 1"},
				{id: "1_kvvdd4ar", name: "My Playlist Name 2"},
				{id: "0_fxk53kis", name: "My Playlist Name 3"},
				{id: "0_lsanyawn", name: "My Playlist Name 4"}
			];
			var $ul = $(_this.getTargetElement()).find(".swa-ul");
			var lis = '';
			$.each(resultsStabArr, function(idx, item){
				lis += '<li class="swa topics-item" playlist="'+item.id+'">'+item.name+'</li>';
			});
			$ul.append(lis);
			_this.applyBehavior();

		},450)
	},
	applyBehavior: function() {
		var _this = this;
		var $target = $(this.getTargetElement());
		$target.find(".swa.topics-item").click(function(){
			var params = {
				'playlistParams' : {
					'service':'playlist' ,
					'action':'execute' ,
					'id' : $(this).attr('playlist'),
					'filter:idNotIn' : _this.embedPlayer.evaluate('{mediaProxy.entry.id}') , 	// dont fetch current entry
					'totalResults' : 50
				},
				'autoInsert' : false, //if this is set to true the player will load and switch the current video to the new playlist
				'playlistName' : 'new playlist' // override the displayed playlist name
			};
			_this.embedPlayer.sendNotification('trLoadNewPlaylist', params );
		});
		$target.find(".swa.search-btn").click(function(){
			debugger;

			var params = {
				'playlistParams' : {
					'service':'playlist' ,
					'action':'execute' ,
					'id' : $(this).attr('playlist'),
					'filter:idNotIn' : _this.embedPlayer.evaluate('{mediaProxy.entry.id}') , 	// dont fetch current entry
					'totalResults' : 50
				},
				'autoInsert' : false, //if this is set to true the player will load and switch the current video to the new playlist
				'playlistName' : 'new playlist' // override the displayed playlist name
			};
			_this.embedPlayer.sendNotification('trLoadNewPlaylist', params );
		});

		$target.find('.jcarousel').jCarouselLite({
			btnNext: '.next',
			btnPrev: '.prev',
			height: 20,
			mediaItemVisible: 3.5,
			mouseWheel: true,
			circular: false
		});
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