mw.PluginManager.add( 'trPlaylistServices', mw.KBasePlugin.extend({

	defaultConfig: {
		'maxResults' : 50
	},

	setup: function() {
		this.setBindings();
		this.getRelatedPlaylistId();
	},
	getRelatedPlaylistId : function(){
		var _this = this;

		var myRequest = {
			'service': 'playlist',
			'action': 'list',
			'filter:referenceIdEqual': "TR_RELATED_PLAYLIST"
		};
		this.getKClient().doRequest(myRequest, function (dataResult) {
			_this.setConfig( "relatedPlaylistId",dataResult.objects[0].id);
		});
	},
	setBindings : function(){
		this.setConfig("ks" ,  this.getKalturaClient().ks);
		var _this = this;
		this.bind('trLoadNewPlaylist', $.proxy(function(e,params){
			_this.loadPlaylist(params);
		}));
		this.bind('mediaListLayoutReady', $.proxy(function(e,params){
		}));
		this.bind('playbackComplete', function(e){
			_this.embedPlayer.sendNotification('playNextClip' );
		});

		this.bind('playerReady', $.proxy(function(){
			//in case there is a playlisr plugin but no kpl0Url nor kpl0id - the player needs to load a related playlist
			if( typeof _this.embedPlayer.evaluate("{playlistAPI}") == 'object'
				&& _this.embedPlayer.evaluate("{playlistAPI.kpl0Id}") != undefined) {
					// do not load related if there is a playlist
					return;
				}
				setTimeout(function(){
					_this.setConfig("loadedOnce",true);
					_this.loadRelatedPlaylist();
				},11)

		},this));

		this.bind('trLoadPlaylistBySearch', $.proxy(function(e,search){
			this.loadSearchPlaylist(search)
		},this));

	},
	loadRelatedPlaylist : function (){
		if(this.getConfig("loadedOnce") && this.getConfig("relatedPlaylistId")){
			var ks= this.getConfig("ks");
			var params = {
				'playlistParams': {
					'service': 'playlist',
					'action': 'execute',
					'ks': ks,
					'id': this.getConfig("relatedPlaylistId"),
					'filter:objectType': 'KalturaMediaEntryFilterForPlaylist',
					'filter:mediaTypeEqual': '1',
					'filter:idNotIn': this.embedPlayer.evaluate('{mediaProxy.entry.id}'), 	// dont fetch current entry
					'playlistContext:objectType': 'KalturaEntryContext',
					'playlistContext:entryId': this.embedPlayer.evaluate('{mediaProxy.entry.id}'),
					'totalResults': 50
				},
				'autoInsert': false, //if this is set to true the player will load and switch the current video to the new playlist
				//'initItemEntryId' : '1_cvsg4ghm', // player start playing a specific entry if exist
				'playlistName': 'new playlist' // override the displayed playlist name
			}
			this.embedPlayer.sendNotification('loadExternalPlaylist', params );
		}
	},

	loadSearchPlaylist : function (search){
		var ks= this.getConfig("ks");
		var params = {
			"playlistParams" : {
				"service":"playlist" ,
				"action":"executefromfilters" ,
				'ks' : ks,
				'filters:item0:freeText' : search ,
				'filters:item0:idNotIn' : this.embedPlayer.evaluate('{mediaProxy.entry.id}') , 	// don't fetch current entry
				"totalResults" : this.getConfig("maxResults")
			},
			'autoInsert' : false,
			'playlistName' : "new name"
		}
		this.embedPlayer.sendNotification('loadExternalPlaylist', params );
	},
	loadPlaylist : function (params){
		if(!params.ks){
			params.ks = this.getConfig("ks")
		}
		this.embedPlayer.sendNotification('loadExternalPlaylist', params );
	},
	getKClient: function () {
		if (!this.kClient) {
			this.kClient = mw.kApiGetPartnerClient(this.embedPlayer.kwidgetid);
		}
		return this.kClient;
	}


}));