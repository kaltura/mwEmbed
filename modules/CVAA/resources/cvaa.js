( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'cvaa', mw.KBaseScreen.extend({

		defaultConfig: {
			parent: "topBarContainer",
			templatePath: '../Cvaa/resources/cvaa.tmpl.html',
			usePreviewPlayer: false,
			previewPlayerEnabled: false,
			optionsBtnName:  gM( 'mwe-cvaa-options' ),
			optionsEvent: "openCvaaOptions",
			cvaaBtnPosition: "first",
			cvaaDefaultSettings: {
				fontFamily: "Arial, Roboto, Arial Unicode Ms, Helvetica, Verdana, PT Sans Caption, sans-serif",
				fontColor: "rgba(255,255,255,1)", //color and opacity
				fontSize: 12,
				backgroundColor: "rgba(0,0,0,0.75)", //color and opacity
				windowColor: "transparent", //color and opacity
				edgeStyle: "none"
			},
			cvaaOptions: 	{
				"options":{
					"fontFamily": {
						"label": gM('mwe-cvaa-fontFamily'),
						"selector": "kFontFamily",
						"event": "change"
					},
					"fontColor":{
						"label": gM( 'mwe-cvaa-fontColor' ),
						"selector": "kFontColor",
						"event": "change"
					},
					"fontSize": {
						"label": gM('mwe-cvaa-fontSize'),
						"selector": "kFontSize",
						"event": "change"
					},
					"fontOpacity":{
						"label": gM( 'mwe-cvaa-fontOpacity' ),
						"selector": "kFontOpacity",
						"event": "change"
					},
					"backgroundOpacity":{
						"label": gM( 'mwe-cvaa-backgroundOpacity' ),
						"selector": "kBackgroundOpacity",
						"event": "change"
					},
					"backgroundColor":{
						"label": gM( 'mwe-cvaa-backgroundColor' ),
						"selector": "kBackgroundColor",
						"event": "change"
					},
					"windowColor":{
						"label": gM( 'mwe-cvaa-windowColor' ),
						"selector": "kWindowColor",
						"event": "change"
					},
					"windowOpacity":{
						"label": gM( 'mwe-cvaa-windowOpacity' ),
						"selector": "kWindowOpacity",
						"event": "change"
					},
					"edgeStyle": {
						"label": gM('mwe-cvaa-edgeStyle'),
						"selector": "kEdgeStyle",
						"event": "change"
					}
				},
				"edgeStyle":[
						{"prop": 1, "text":"None", 			"value":	"none"},
						{"prop": 2, "text":"Drop shadow",	"value":	"rgb(34, 34, 34) 2px 2px 3px, rgb(34, 34, 34) 2px 2px 4px, rgb(34, 34, 34) 2px 2px 5px"},
						{"prop": 3, "text":"Raised", 		"value":	"rgb(34, 34, 34) 1px 1px, rgb(34, 34, 34) 2px 2px, rgb(34, 34, 34) 3px 3px"},
						{"prop": 4, "text":"Depressed", 	"value":	"rgb(204, 204, 204) 1px 1px, rgb(204, 204, 204) 0px 1px, rgb(34, 34, 34) -1px -1px, rgb(34, 34, 34) 0px -1px"},
						{"prop": 5, "text":"Outlined",		"value":	"rgb(34, 34, 34) 0px 0px 4px, rgb(34, 34, 34) 0px 0px 4px, rgb(34, 34, 34) 0px 0px 4px, rgb(34, 34, 34) 0px 0px 4px"}
				],
				"opacity":[
						{"prop": 1, "text":"0%", 	"value":	0},
						{"prop": 2, "text":"25%",	"value":	0.25},
						{"prop": 3, "text":"50%", 	"value":	0.5},
						{"prop": 4, "text":"75%", 	"value":	0.75},
						{"prop": 5, "text":"100%",	"value":	1}
				],
				"color":[
						{"prop": 1, "text":"White", 	"value":	"#ffffff"},
						{"prop": 2, "text":"Yellow",	"value":	"#ffff00"},
						{"prop": 3, "text":"Green",		"value":	"#00ff00"},
						{"prop": 4, "text":"Cyan",		"value":	"#00ffff"},
						{"prop": 5, "text":"Blue",		"value":	"#0000ff"},
						{"prop": 6, "text":"Magenta",	"value":	"#ff00ff"},
						{"prop": 7, "text":"Red",		"value":	"#ff0000"},
						{"prop": 8, "text":"Black",		"value":	"#000000"}
				],
				//size in pixels
				"size": [
						{"prop": 1, "text":"50%",	"value":	6},
						{"prop": 2, "text":"75%",	"value":	9},
						{"prop": 3, "text":"100%",	"value":	12},
						{"prop": 4, "text":"150%",	"value":	18},
						{"prop": 5, "text":"200%",	"value":	24}
				],
				"family": [
					{"prop": 1, "text":"Monospaced Serif",			"value":	"Courier New, Courier, Nimbus Mono L, Cutive Mono, monospace"},
					{"prop": 2, "text":"Proportional Serif",		"value":	"Times New Roman, Times, Georgia, Cambria, PT Serif Caption, serif"},
					{"prop": 3, "text":"Monospaced Sans-Serif", 	"value":	"Lucida Console, Deja Vu Sans Mono, Monaco, Consolas, PT Mono, monospace"},
					{"prop": 4, "text":"Proportional Sans-Serif",	"value":	"Arial, Roboto, Arial Unicode Ms, Helvetica, Verdana, PT Sans Caption, sans-serif"},
					{"prop": 5, "text":"Casual", 					"value":	"Comic Sans MS, Impact, Handlee, fantasy"},
					{"prop": 6, "text":"Cursive", 					"value":	"Monotype Corsiva, URW Chancery L, Apple Chancery, Dancing Script, cursive"},
					{"prop": 7, "text":"Small Capitals",			"value":	"Verdana ,Arial Unicode Ms, Arial, Helvetica, Marcellus SC, sans-serif"}
				]
			}
		},
		cvaaSettingsObj: null,
		cvaaSettings: {},
		currentFontFamily:null,
		currentFontColor:null,
		currentFontOpacity:null,
		currentFontSize:null,
		currentBackgroundColor:null,
		currentBackgroundOpacity:null,
		currentWindowColor:null,
		currentWindowOpacity:null,
		currentEdgeStyle:null,

		setup: function () {
			this.cvaaSettingsObj = this.getConfig("cvaaOptions");
			this.addBindings();
		},
		addBindings: function () {
			var _this = this;
			var embedPlayer = this.getPlayer();

			this.bind('openCvaaOptions', function () {
				_this.getScreen();
				setTimeout(function(){ _this.showScreen(); }, 0);
			});

			if(_this.getConfig('cvaaBtnPosition')=="first"){
				this.bind('captionsMenuEmpty', function () {
					_this.addOptionsBtn();
				});
			} else if(_this.getConfig('cvaaBtnPosition')=="last"){
				this.bind('captionsMenuReady', function () {
					_this.addOptionsBtn();
				});
			}

			this.bind('preShowScreen', function (event, screenName) {

				_this.cvaaSettings = $.cookie('cvaaSettings') ?
									 JSON.parse($.cookie('cvaaSettings')) :
									 _this.getConfig("cvaaDefaultSettings");

				//set default font family
				_this.currentFontFamily = _this.cvaaSettings.fontFamily;
				_this.updatePreview("text", "font-family", _this.currentFontFamily);

				//set default font color and opacity
				_this.currentFontColor = _this.cvaaSettings.fontColor;
				_this.updatePreview("text", "color", _this.currentFontColor);

				//set default font size
				_this.currentFontSize = _this.cvaaSettings.fontSize;
				_this.updatePreview("text", "font-size", _this.currentFontSize);

				//set default background color and opacity
				_this.currentBackgroundColor = _this.cvaaSettings.backgroundColor;
				_this.updatePreview("text", "background-color", _this.currentBackgroundColor);

				//set default window color and opacity
				_this.currentWindowColor = _this.cvaaSettings.windowColor;
				_this.updatePreview("window", "background-color", _this.currentWindowColor);

				//set default edge style - text shadow
				_this.currentEdgeStyle = _this.cvaaSettings.edgeStyle;
				_this.updatePreview("text", "text-shadow", _this.currentEdgeStyle);

				//send styles to captions plugin
				embedPlayer.triggerHelper("newCaptionsStyles", _this.cvaaSettings);

				if ( screenName === "cvaa" ){
					_this.getScreen().then(function(screen){
						screen.addClass('semiTransparentBkg');
						embedPlayer.triggerHelper("cvaaScreenOpen");
					});
				}
			});

			this.bind('showScreen', function (event, screenName) {
				if ( screenName === "cvaa" ){
					_this.getScreen().then(function(screen){
						$(embedPlayer.getPlayerElement()).addClass("blur");
						embedPlayer.getPlayerPoster().addClass("blur");
					});

					//map json to array
					var optionsArr = $.map(_this.cvaaSettingsObj.options, function(el) { return el });
					//bind options to events
					optionsArr.map(function(option){
						$("#" + option.selector).on(option.event, function () {
							_this.updateSettingsAndPreview($(this)[0].id, $(this).val());
						});

						//$("#" + option.selector).val(function(){
						//
						//});

					});

					embedPlayer.getInterface().find(".saveCvaaSettings").click(function(){
						_this.saveCvaaSettings();
					});

					embedPlayer.getInterface().find(".resetCvaaSettings").click(function(){
						_this.resetCvaaSettings();
					});
				}
			});

			this.bind('preHideScreen', function (event, screenName) {
				if ( screenName === "cvaa" ){
					if (_this.getPlayer().getPlayerElement()) {
						$( "#" + _this.getPlayer().getPlayerElement().id ).removeClass( "blur" );
						_this.getPlayer().getPlayerPoster().removeClass( "blur" );
					}
					embedPlayer.enablePlayControls();
					_this.showControls();
				}
			});

		},
		updateSettingsAndPreview: function(option, value){
			//if (!value && value !== 0) { return; }

			switch (option) {
				//font family
				case this.cvaaSettingsObj.options.fontFamily.selector:
					var selectedFamily = this.getOptionValue("family", value);
					this.updatePreview("text", "font-family", selectedFamily);
					this.cvaaSettings.fontFamily = selectedFamily;
					break;
				//font color
				case this.cvaaSettingsObj.options.fontColor.selector:
					this.currentFontColor = this.hex2rgb(this.getOptionValue("color", value));
					var selectedFontColor = this.rgb2rgba(this.currentFontColor, this.currentFontOpacity);
					this.updatePreview("text", "color", selectedFontColor);
					this.cvaaSettings.fontColor = selectedFontColor;
					break;
				//font opacity
				case this.cvaaSettingsObj.options.fontOpacity.selector:
					this.currentFontOpacity = this.getOptionValue("opacity", value);
					var selectedFontOpacity = this.rgb2rgba(this.currentFontColor, this.currentFontOpacity);
					this.updatePreview("text", "color", selectedFontOpacity);
					this.cvaaSettings.fontColor = selectedFontOpacity;
					break;
				//font size
				case this.cvaaSettingsObj.options.fontSize.selector:
					this.currentFontSize = this.getOptionValue("size", value);
					this.updatePreview("text", "font-size", this.getFontSize(this.currentFontSize));
					this.cvaaSettings.fontSize = this.currentFontSize;
					break;
				//background color
				case this.cvaaSettingsObj.options.backgroundColor.selector:
					this.currentBackgroundColor = this.hex2rgb(this.getOptionValue("color", value));
					var selectedBackgroundColor = this.rgb2rgba(this.currentBackgroundColor, this.currentBackgroundOpacity);
					this.updatePreview("text", "background-color", selectedBackgroundColor);
					this.cvaaSettings.backgroundColor = selectedBackgroundColor;
					break;
				//background opacity
				case this.cvaaSettingsObj.options.backgroundOpacity.selector:
					this.currentBackgroundOpacity = this.getOptionValue("opacity", value);
					var selectedBackgroundOpacity = this.rgb2rgba(this.currentBackgroundColor, this.currentBackgroundOpacity);
					this.updatePreview("text", "background-color", selectedBackgroundOpacity);
					this.cvaaSettings.backgroundColor = selectedBackgroundOpacity;
					break;
				//window color
				case this.cvaaSettingsObj.options.windowColor.selector:
					this.currentWindowColor = this.hex2rgb(this.getOptionValue("color", value));
					var selectedWindowColor = this.rgb2rgba(this.currentWindowColor, this.currentWindowOpacity);
					this.updatePreview("window", "background-color", selectedWindowColor);
					this.cvaaSettings.windowColor = selectedWindowColor;
					break;
				//window opacity
				case this.cvaaSettingsObj.options.windowOpacity.selector:
					this.currentWindowOpacity = this.getOptionValue("opacity", value);
					var selectedWindowOpacity = this.rgb2rgba(this.currentWindowColor, this.currentWindowOpacity);
					this.updatePreview("window", "background-color", selectedWindowOpacity);
					this.cvaaSettings.windowColor = selectedWindowOpacity;
					break;
				//font text shadow - edge style
				case this.cvaaSettingsObj.options.edgeStyle.selector:
					var selectedEdgeStyle = this.getOptionValue("edgeStyle", value);
					this.updatePreview("text", "text-shadow", selectedEdgeStyle);
					this.cvaaSettings.edgeStyle = selectedEdgeStyle;
					break;
			}
		},
		getOptionValue: function(option, propValue){
			for(var i=0; i<this.cvaaSettingsObj[option].length; i++){
				if(this.cvaaSettingsObj[option][i].prop == propValue){
					return this.cvaaSettingsObj[option][i].value;
				}
			}
		},
		updatePreview: function(element, option, value){
			switch(element){
				case "window":
					this.getPlayer().getInterface().find("#previewWindow").css(option, value);
					break;
				case "text":
					this.getPlayer().getInterface().find("#previewText").css(option, value);
					break;
			}
		},
		hex2rgb: function(hex){
			hex = hex.replace('#','');
			return [parseInt(hex.substring(0,2), 16), parseInt(hex.substring(2,4), 16), parseInt(hex.substring(4,6), 16)];
		},
		rgb2rgba: function(color, opacity){
			if(opacity){
				return 'rgba(' + color.join(',') + ',' + opacity + ')';
			} else {
				return 'rgb(' + color.join(',') + ')';
			}
		},
		getFontSize: function(fontsize){
			// Translate to em size so that font-size parent percentage
			// base on http://pxtoem.com/
			var emFontMap = {
				'6': .5, '7': .583, '8': .666, '9': .75, '10': .833, '11': .916,
				'12': 1, '13': 1.083, '14': 1.166, '15': 1.25, '16': 1.333, '17': 1.416, '18': 1.5, '19': 1.583,
				'20': 1.666, '21': 1.75, '22': 1.833, '23': 1.916, '24': 2
			};
			return ( emFontMap[fontsize] ) ?
			emFontMap[fontsize] + 'em' :
				(  fontsize > 24 ) ? emFontMap[24] + 'em' : emFontMap[6];
		},
		saveCvaaSettings: function(){
			$.cookie('cvaaSettings', JSON.stringify(this.cvaaSettings), {
				expires : 356,
				path : '/',
				domain : ''
			});
		},
		resetCvaaSettings: function(){
			this.cvaaSettings = this.getConfig("cvaaDefaultSettings");

			$.cookie('cvaaSettings', null, {
				expires : -1,
				path : '/',
				domain : ''
			});
		},
		addOptionsBtn: function(){
			this.getPlayer().triggerHelper("addOptionsToCaptions",{
				"optionsLabel": this.getConfig('optionsBtnName'),
				"optionsEvent": this.getConfig('optionsEvent')
			});
		},
		getTemplateData: function () {
			return {
				'cvaa': this,
				'cvaaOptions': this.cvaaSettingsObj
			};
		},
		isSafeEnviornment: function() {

		}

	}));

} )( window.mw, window.jQuery );