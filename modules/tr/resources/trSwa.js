mw.PluginManager.add('trSwa', mw.KBasePlugin.extend({

	defaultConfig: {
		maxResults: 50,
		targetId: 'k-medialist-header',
		templatePath: '../tr/templates/swa.tmpl.html',
		headerTitle: 'Top News',
		selectedTag: 'news',
		autoNext: true
	},
	setup: function () {
		this.setBindings();
	},
	setBindings: function () {
		var _this = this;
		this.bind('playerReady', $.proxy(function () {
			if (_this.getConfig('loaded')) {
				return;
			}
			_this.setConfig('loaded', true);
			_this.updateTargetWithTemplate();
			_this.loadTopics();
		}, this));
		this.bind('playlistSelected', $.proxy(function () {
			//TODO once move to 2.30 hook this to see how playlist loading effects this UI. Right now it clears the UI
		}))
		this.bind('playerPlayEnd', $.proxy(function () {
			if (_this.getConfig('autoNext')) {
				_this.embedPlayer.sendNotification('trLoadNewPlaylist', params);
			}
		}))
	},
	loadTopics: function () {
		//simulate an a-sync callback to BE to load the topics
		var _this = this;

		var loadPlaylists = {
			'service': 'playlist',
			'action': 'list',
			'filter:tagsLike': this.getConfig("selectedTag")
		};
		this.getKClient().doRequest(loadPlaylists, function (dataResult) {
			//load playlist by a configured tag
			var resultsStabArr = [];
			for (var i = 0; i < dataResult.objects.length; i++) {
				resultsStabArr.push({id: dataResult.objects[i].id, name: dataResult.objects[i].name})
			}
			var $ul = _this.getTargetElement().find(".swa-ul");
			var lis = '';
			$.each(resultsStabArr, function (idx, item) {
				lis += '<li class="swa topics-item" playlist="' + item.id + '">' + item.name + '</li>';
			});
			$ul.append(lis);
			_this.applyBehavior();
		});
	},
	applyBehavior: function () {
		var _this = this;
		var $target = this.getTargetElement();

		$target.find(".search-input").keyup(function(e){
			if (e.keyCode === 13) {
				var searchTerm = $(e.target).parent().parent().find(".search-input").val();
				if(searchTerm){
					_this.embedPlayer.sendNotification('trLoadPlaylistBySearch', searchTerm);
				}
			}
		});


		$target.find(".swa.topics-item").click(function () {
			var params = {
				'playlistParams': {
					'service': 'playlist',
					'action': 'execute',
					'id': $(this).attr('playlist'),
					'filter:idNotIn': _this.embedPlayer.evaluate('{mediaProxy.entry.id}'), 	// dont fetch current entry
					'totalResults': 50
				},
				'autoInsert': false, //if this is set to true the player will load and switch the current video to the new playlist
				'playlistName': 'new playlist' // override the displayed playlist name
			};
			_this.embedPlayer.sendNotification('trLoadNewPlaylist', params);
		});
		$target.find(".swa.search-btn").click(function () {
			var searchTerm = $(this).parent().parent().find(".search-input").val();
			if(searchTerm){
				_this.embedPlayer.sendNotification('trLoadPlaylistBySearch', searchTerm);
			}
		});
		// Disable keyboard shortcuts when using search
		$target.find('.search-input').focus(function () {
			_this.getPlayer().triggerHelper('onDisableKeyboardBinding');
		}).blur(function () {
			_this.getPlayer().triggerHelper('onEnableKeyboardBinding');
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
	hasValidTargetElement: function () {
		return this.getPlayer().isPluginEnabled('playlistAPI');
	},
	getTargetElement: function () {
		return this.embedPlayer.getPluginInstance('playlistAPI').getComponent();
	},
	updateTargetWithTemplate: function () {
		if (!this.hasValidTargetElement()) {
			return;
		}
		this.getTemplateHTML().then($.proxy(function (html) {
			this.getTargetElement().prepend(html.html());
		}, this));
	},
	getKClient: function () {
		if (!this.kClient) {
			this.kClient = mw.kApiGetPartnerClient(this.embedPlayer.kwidgetid);
		}
		return this.kClient;
	}
}));