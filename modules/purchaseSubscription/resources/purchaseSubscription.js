(function ( mw, $ ) {
	"use strict";
	var plugin = mw.KBaseScreen.extend( {
		defaultConfig:{
			templatePath: 'purchaseSubscription',
			purchaseOfferItems: []
		},
		initializedView: false,
		setup: function(){
			//Plugin setup, all actions which needs to be done on plugin loaded and before playerReady event
			this.addBindings();
			this.setConfig("purchaseOfferItems", [
				{
					title: "Star Wars: The Force Awakens",
					synopsis: "Thirty years after defeating the Galactic Empire, Han Solo and his allies face a new threat from the evil Kylo Ren and his army of Stormtroopers.",
					"imageUrl": "https://fanart.tv/fanart/movies/140607/moviebackground/star-wars-episode-vii-564773e6d85f8.jpg",
					linkBack: "https://mediagowebdemo.ott.kaltura.com/movie/star-wars-the-force-awakens/445090"
				},
				{
					title: "Finding Dory",
					synopsis: "Dory is reunited with her friends Nemo and Marlin in the search for answers about her past. What can she remember? Who are her parents? And where did she learn to speak Whale?",
					"imageUrl": "https://fanart.tv/fanart/movies/127380/moviebackground/finding-dory-574ee5493d840.jpg",
					linkBack: "https://mediagowebdemo.ott.kaltura.com/movie/finding-dory/428755"
				},
				{
					title: "Family Guy",
					synopsis: "Sick, twisted, politically incorrect and Freakin' Sweet animated series featuring the adventures of the dysfunctional Griffin family. Bumbling Peter and long-suffering Lois have three kids...",
					"imageUrl": "https://fanart.tv/fanart/tv/75978/showbackground/family-guy-57f111ef8dc5a.jpg",
					linkBack: "https://mediagowebdemo.ott.kaltura.com/series/family-guy/445222"
				}
			]);
		},
		isSafeEnviornment: function(){

		},

		addBindings:function(){
			var _this = this;
			this.bind("onEndedDone onpause", function(){
				setTimeout(function(){_this.showScreen();},100);
			});
			this.bind("onChangeMedia", function(){
				_this.initializedView = false;
			});
			this.bind('showScreen', function (event, screenName) {
				if ( screenName === _this.pluginName ){
					_this.getScreen().then(function(screen){
						$(screen).find(".content").slick({
							slidesToShow: 1,
							autoplay: true,
							autoplaySpeed: 2000,
							pauseOnHover: true,
							infinite: true
						});
					});
				}
			});
			this.bind('hideScreen', function (event, screenName) {
				if ( screenName === _this.pluginName ){
					_this.getScreen().then(function(screen){
						$(screen).find(".content").slick('unslick');
					});
				}
			});
		},

		getTemplateData: function () {
			return {
				'purchaseItems': this.getConfig("purchaseOfferItems"),
				'settings': {"imgHeight":this.getPlayer().height}
			};
		},
		
		addKeyboardShortcuts: function(){

		}
		
	} );
	mw.PluginManager.add( 'purchaseSubscription', plugin);
} ) ( window.mw, window.jQuery );	