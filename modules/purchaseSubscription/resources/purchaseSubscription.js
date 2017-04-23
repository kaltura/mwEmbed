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
					title: "Star Wars",
					synopsis: "The story begins thirty years after the events of Star Wars: Episode VI Return of the Jedi. The First Order has risen from the ashes of the Galactic Empire and is opposed by General Leia Organa and the Resistance, both of which seek to find the missing Jedi Master Luke Skywalker.",
					"imageUrl": "http://preprod-mediago.s3.amazonaws.com/hackaton2016/super.jpg",
					linkBack: "http://preprod-mediago.s3.amazonaws.com/hackaton2016/watchmovie.html"
				},
				{
					title: "Stranger Things",
					synopsis: "\"Stranger Things\" has become Netflix's latest smash hit. The first season of the series, set in the 1980s, from brothers Matt and Ross Duffer (\"Wayward Pines\"), which is set to return for a second season in 2017.",
					"imageUrl": "http://preprod-mediago.s3.amazonaws.com/hackaton2016/stranger.jpg",
					linkBack: "http://preprod-mediago.s3.amazonaws.com/hackaton2016/watchmovie.html"
				},
				{
					title: "Deadpool",
					synopsis: "Wade Wilson (Ryan Reynolds) is a former Special Forces operative who now works as a mercenary. His world comes crashing down when evil scientist Ajax (Ed Skrein) tortures, disfigures and transforms him into Deadpool.",
					"imageUrl": "http://preprod-mediago.s3.amazonaws.com/hackaton2016/deadpool.jpg",
					linkBack: "http://preprod-mediago.s3.amazonaws.com/hackaton2016/watchmovie.html"
				},
				{
					title: "Rick & Morti",
					synopsis: "Rick Sanchez (voiced by Justin Roiland) – An eccentric and alcoholic mad scientist who is the father of Beth, the father-in-law of Jerry, and the maternal grandfather of Morty and Summer. His irresponsible tendencies lead Beth and Jerry to worry about the safety of their son Morty.",
					"imageUrl": "http://preprod-mediago.s3.amazonaws.com/hackaton2016/rick.png",
					linkBack: "http://preprod-mediago.s3.amazonaws.com/hackaton2016/watchmovie.html"
				},
				{
					title: "Westworld",
					synopsis: "Westworld is an American science fiction western thriller television series created by Jonathan Nolan and Lisa Joy for HBO.",
					"imageUrl": "http://preprod-mediago.s3.amazonaws.com/hackaton2016/westworld.jpg",
					linkBack: "http://preprod-mediago.s3.amazonaws.com/hackaton2016/watchmovie.html"
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