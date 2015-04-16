mw.PluginManager.add( 'trTitle', mw.KBaseComponent.extend({

	defaultConfig: {
		'parent': 'topBarContainer',
		'insertMode': 'firstChild',
		'order': 1,
		'createTopBar': true,
		'popupSize': '900x500',
		'popupPage': 'popup.html',
		'injectCssToParent': false
	},

	setup: function() {
		// Add our plugin name as class on player
		this.getPlayer().getInterface().addClass(this.pluginName);
		this.setPopupSize();
		this.registerTemplateHelper();
		this.bindChangeMedia();
		this.injectCssToParent();
	},

	// Set popup object
	setPopupSize: function() {
		var sizes = this.getConfig('popupSize').split("x");

		if( sizes.length !== 2 ) {
			this.log('Wrong popupSize parameter value.');
			this.popup = {width: 0, height: 0};
			return ;
		}

		this.popup = {
			width: sizes[0],
			height: sizes[1]
		};
	},

	registerTemplateHelper: function() {
		mw.util.registerTemplateHelper('trDateFormat', function( unixTimestamp ){
			var d = new Date(unixTimestamp*1000);
			var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
			var year = d.getFullYear();
			var month = months[d.getMonth()];
			var day = d.getDate();
			var hour = d.getHours();
			var min = d.getMinutes();
			var sec = d.getSeconds();
			return day + '-' + month + '-' + year + ' ' + hour + ':' + min;
		});
	},

	bindChangeMedia: function() {
		this.bind('onChangeMedia', $.proxy(function(){
			this.getPlayer().setFlashvars('mediaProxy.mediaPlayFrom', 0);
		},this));
	},

	openPopup: function() {
		this.getPlayer().sendNotification('doPause');
		// popup position
		var left = (screen.width/2)-(this.popup.width/2);
		var top = (screen.height/2)-(this.popup.height/2);
		// player config

//		var config = {
//			pid: this.getPlayer().kpartnerid,
//			flashvars: {
//				"mediaProxy.mediaPlayFrom": this.getPlayer().currentTime,
//				"playlistAPI": {
//					"initItemEntryId": this.getPlayer().kentryid,
//					"kpl0Id": this.getPlayer().getKalturaConfig('playlistAPI', 'kpl0Id')
//				}
//			}
//		};

		//this is simulating JUST entryId pop-up. the play
		var config = {
			pid: this.getPlayer().kpartnerid,
			mid: this.getPlayer().kentryid,
			startFrom:this.getPlayer().currentTime,
			uuid: "omnitureUser",
			pn: "pmniturePn",
			pn: "pmniturePn",
			bitrate: 400,
			eud : "omnitureEud",
			wtype : "omnitureWtype"
		};





		var jsonConfig = JSON.stringify(config);
		window.open( this.getConfig('popupPage')+'#' + jsonConfig, 'trPopup', "width=" + this.popup.width + ",height=" + this.popup.height + ",top=" + top + ",left=" + left );
	},

	injectCssToParent: function() {
		if( this.getConfig('injectCssToParent') ) {
			var cssFilePath = kWidget.getPath() + '/modules/tr/resources/popup.css';
			kWidget.appendCssUrl(cssFilePath, window['parent'].document);
		}
	},

	getComponent: function() {
		if(!this.$topBar) {
			// In popup, we don't need the topBar
			if( !this.getConfig('createTopBar') ) {
				return this.$topBar = $('<div />');
			}

			this.$topBar = $('<div />')
							.addClass('tr-top-bar')
							.append(
								$('<div />')
									.addClass('tr-top-logo')
									.html('REUTERS&nbsp;<span class="tr-logo-sub">INSIDER</span>'),
								$('<div />')
									.addClass('tr-top-btn tr-top-refresh'),
								$('<div />')
									.addClass('tr-top-btn tr-top-popup')
									.click($.proxy(this.openPopup, this))
							);
		}
		return this.$topBar;
	}

}));