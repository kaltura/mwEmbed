mw.PluginManager.add( 'trControls', mw.KBasePlugin.extend({

	defaultConfig: {
		shareOutput: "AAA",
		maxResults: 50,
		targetId: 'playerControlsContainer',
		templatePath: '../tr/templates/player-controls.tmpl.html'
	},

	setup: function() {
		this.updateTargetWithTemplate();
		var _this = this;
		setTimeout(function(){
				_this.applyBehavior();
			}
		,100);
		this.loadShortUrl(); //TODO connect to bitly later
	},

	loadShortUrl: function() {

		var _this = this;

		var url = "http://tinyurl.com/api-create.php?url=https://www.google.com/#safe=off";

		$.getJSON('http://json-tinyurl.appspot.com/?url=' + url + '&callback=?',
			function(data)
			{
				alert(data.tinyurl);
			}
		);
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

		$(doc).find(".playlist-test1").click(function(){
			var params = {
				"playlistParams" : {
				"service":"playlist" ,
				"action":"executefromfilters" ,
				'filters:item0:freeText' : "ted" , 	// search term here
				'filters:item0:idNotIn' : _this.embedPlayer.evaluate('{mediaProxy.entry.id}') , 	// don't fetch current entry
				"totalResults" : _this.getConfig("maxResults")
				},
				'autoInsert' : false,
				'playlistName' : "new name"
			}

			player.sendNotification('trLoadNewPlaylist', params );
		});
		$(doc).find(".playlist-test2").click(function(){
			var params = {
				'playlistParams' : {
					'service':'playlist' ,
					'action':'execute' ,
					'id' : '_KDP_CTXPL' ,
					'filter:objectType' : 'KalturaMediaEntryFilterForPlaylist' ,
					'filter:mediaTypeEqual' : '1' ,
					'filter:idNotIn' : _this.embedPlayer.evaluate('{mediaProxy.entry.id}') , 	// dont fetch current entry
					'playlistContext:objectType':'KalturaEntryContext',
					'playlistContext:entryId': _this.embedPlayer.evaluate('{mediaProxy.entry.id}'),
					'totalResults' : 50
				},
				'autoInsert' : true, //if this is set to true the player will load and switch the current video to the new playlist
				//'initItemEntryId' : '1_cvsg4ghm', // player start playing a specific entry if exist
				'playlistName' : 'new playlist' // override the displayed playlist name
			}

			player.sendNotification('trLoadNewPlaylist', params );
		});
		$(doc).find(".playlist-test3").click(function(){
			//implement search here
			player.sendNotification('trLoadPlaylistBySearch', "shachar");
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
			this.getTemplateHTML().then(function(html) {
				target.innerHTML = html.html();
			});
		}
	}
}));