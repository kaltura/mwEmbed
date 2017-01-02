(function ( mw, $ ) {
	"use strict";
	var plugin = mw.KBaseScreen.extend( {
		defaultConfig:{
			templatePath: 'purchaseSubscription',
			purchaseOfferItems: []
		},
		setup: function(){
			//Plugin setup, all actions which needs to be done on plugin loaded and before playerReady event
			this.addBindings();
			this.setConfig("purchaseOfferItems", [
				{
					title: "Start Wars",
					synopsis: "The story begins thirty years after the events of Star Wars: Episode VI Return of the Jedi. The First Order has risen from the ashes of the Galactic Empire and is opposed by General Leia Organa and the Resistance, both of which seek to find the missing Jedi Master Luke Skywalker.",
					"imageUrl": "http://preprod-mediago.s3.amazonaws.com/hackaton2016/super.jpg",
					linkBack: "http://preprod-mediago.s3.amazonaws.com/hackaton2016/watchmovie.html"
				},
				{
					title: "Stranger Things",
					synopsis: "\"Stranger Things\" has become Netflix's latest smash hit. The first season of the series, set in the 1980s, from brothers Matt and Ross Duffer (\"Wayward Pines\"), which is set to return for a second season in 2017, follows the disappearance of a young boy and the monstrous chain of events it launches in the small town.",
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
					synopsis: "\"Stranger Things\" has become Netflix's latest smash hit. The first season of the series, set in the 1980s, from brothers Matt and Ross Duffer (\"Wayward Pines\"), which is set to return for a second season in 2017, follows the disappearance of a young boy and the monstrous chain of events it launches in the small town.",
					"imageUrl": "http://preprod-mediago.s3.amazonaws.com/hackaton2016/rick.png",
					linkBack: "http://preprod-mediago.s3.amazonaws.com/hackaton2016/watchmovie.html"
				},
				{
					title: "Westworld",
					synopsis: "Westworld is an American science fiction western thriller television series created by Jonathan Nolan and Lisa Joy for HBO. It is based on the 1973 film of the same name, which was written and directed by American novelist Michael Crichton, and to a lesser extent on the 1976 sequel Futureworld. It is the second TV series based on the two films",
					"imageUrl": "http://preprod-mediago.s3.amazonaws.com/hackaton2016/westworld.jpg",
					linkBack: "http://preprod-mediago.s3.amazonaws.com/hackaton2016/watchmovie.html"
				}
			]);
		},
		isSafeEnviornment: function(){

		},

		addBindings:function(){
			var _this = this;
			this.bind("onEndedDone", function(){
				setTimeout(function(){_this.show();},100);

			});
		},

		show: function(){
			this.toggleScreen();
			$(this.$screen).find(".content").slick({
				slidesToShow: 1,
				autoplay: true,
				autoplaySpeed: 2000,
				pauseOnHover: true,
				infinite: true
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