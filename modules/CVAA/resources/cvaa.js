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
				fontColor: "#ffffff",
				fontOpacity: 100,
				fontSize: 12,
				backgroundColor: "#000000",
				backgroundOpacity: 75,
				windowColor: "transparent",
				windowOpacity: 0,
				edgeStyle: "none"
			},
			cvaaOptions:{
				"options":{
					"sliders":{
						"fontSize":{
							"label": gM('mwe-cvaa-fontSize'),
							"selector": "kFontSize",
							"valueSelector": "kFontSizeVal",
							"min": 6,
							"max": 24,
							"default": "fontSize"
						},
						"fontOpacity":{
							"label": gM( 'mwe-cvaa-fontOpacity' ),
							"selector": "kFontOpacity",
							"valueSelector": "kFontOpacityVal",
							"min": 0,
							"max": 100,
							"default": "fontOpacity"
						},
						"backgroundOpacity":{
							"label": gM( 'mwe-cvaa-backgroundOpacity' ),
							"selector": "kBackgroundOpacity",
							"valueSelector": "kBackgroundOpacityVal",
							"min": 0,
							"max": 100,
							"default": "backgroundOpacity"
						},
						"windowOpacity":{
							"label": gM( 'mwe-cvaa-windowOpacity' ),
							"selector": "kWindowOpacity",
							"valueSelector": "kWindowOpacityVal",
							"min": 0,
							"max": 100,
							"default": "windowOpacity"
						}
					},
					"colors":{
						"fontColor":{
							"label": gM( 'mwe-cvaa-fontColor' ),
							"selector": "kFontColor"
						},
						"backgroundColor":{
							"label": gM( 'mwe-cvaa-backgroundColor' ),
							"selector": "kBackgroundColor"
						},
						"windowColor":{
							"label": gM( 'mwe-cvaa-windowColor' ),
							"selector": "kWindowColor"
						}
					},
					"dropdowns":{
						"fontFamily":{
							"label": gM('mwe-cvaa-fontFamily'),
							"selector": "kFontFamily"
						},
						"edgeStyle":{
							"label": gM('mwe-cvaa-edgeStyle'),
							"selector": "kEdgeStyle"
						}
					}
				},
				"edgeStyle":[
						{"prop": 1, "text":"None", 			"value":	"none"},
						{"prop": 2, "text":"Drop shadow",	"value":	"rgb(34, 34, 34) 2px 2px 3px, rgb(34, 34, 34) 2px 2px 4px, rgb(34, 34, 34) 2px 2px 5px"},
						{"prop": 3, "text":"Raised", 		"value":	"rgb(34, 34, 34) 1px 1px, rgb(34, 34, 34) 2px 2px, rgb(34, 34, 34) 3px 3px"},
						{"prop": 4, "text":"Depressed", 	"value":	"rgb(204, 204, 204) 1px 1px, rgb(204, 204, 204) 0px 1px, rgb(34, 34, 34) -1px -1px, rgb(34, 34, 34) 0px -1px"},
						{"prop": 5, "text":"Outlined",		"value":	"rgb(34, 34, 34) 0px 0px 4px, rgb(34, 34, 34) 0px 0px 4px, rgb(34, 34, 34) 0px 0px 4px, rgb(34, 34, 34) 0px 0px 4px"}
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
				"family":[
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
		cvaaSavedSettings:null,
		cvaaSentSettings:null,
		currentFontFamily:null,
		currentFontColor:null,
		currentFontOpacity:null,
		currentFontSize:null,
		currentBackgroundColor:null,
		currentBackgroundOpacity:null,
		currentWindowColor:null,
		currentWindowOpacity:null,
		currentEdgeStyle:null,
		firstInit: true,
		handlersAreSet: false,

		setup: function () {
			this.cvaaSettingsObj = this.getConfig("cvaaOptions");
			this.addBindings();
		},
		addBindings: function () {
			var _this = this;
			var embedPlayer = this.getPlayer();

			this.bind('playerReady', function () {
				_this.getCurrentSettings();
				_this.initPreviewUpdate();
			});

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

				_this.initPreviewUpdate();
				if(!_this.handlersAreSet) {
					_this.setUpHandlers();
				}

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
			var selectedItem;
			switch (option) {
				//font family
				case this.cvaaSettingsObj.options.dropdowns.fontFamily.selector:
					selectedItem = this.getValueByProp("family", value);
					this.updatePreview("text", "font-family", selectedItem);
					this.cvaaSentSettings.fontFamily = selectedItem;
					this.cvaaSavedSettings.fontFamily = selectedItem;
					break;
				//font color
				case this.cvaaSettingsObj.options.colors.fontColor.selector:
					this.currentFontColor = this.getValueByProp("color", value);
					selectedItem = this.rgb2rgba(this.hex2rgb(this.currentFontColor), this.currentFontOpacity);
					this.updatePreview("text", "color", selectedItem);
					this.cvaaSentSettings.fontColor = selectedItem;
					this.cvaaSavedSettings.fontColor = this.currentFontColor;
					break;
				//font opacity
				case this.cvaaSettingsObj.options.sliders.fontOpacity.selector:
					this.currentFontOpacity = value;
					selectedItem = this.rgb2rgba(this.hex2rgb(this.currentFontColor), this.currentFontOpacity);
					this.updatePreview("text", "color", selectedItem);
					this.cvaaSentSettings.fontColor = selectedItem;
					this.cvaaSavedSettings.fontOpacity = this.currentFontOpacity;
					break;
				//font size
				case this.cvaaSettingsObj.options.sliders.fontSize.selector:
					this.currentFontSize = value;
					this.updatePreview("text", "font-size", this.getFontSize(this.currentFontSize));
					this.cvaaSentSettings.fontSize = this.currentFontSize;
					this.cvaaSavedSettings.fontSize = this.currentFontSize;
					break;
				//background color
				case this.cvaaSettingsObj.options.colors.backgroundColor.selector:
					this.currentBackgroundColor = this.getValueByProp("color", value);
					selectedItem = this.rgb2rgba(this.hex2rgb(this.currentBackgroundColor), this.currentBackgroundOpacity);
					this.updatePreview("text", "background-color", selectedItem);
					this.cvaaSentSettings.backgroundColor = selectedItem;
					this.cvaaSavedSettings.backgroundColor = this.currentBackgroundColor;
					break;
				//background opacity
				case this.cvaaSettingsObj.options.sliders.backgroundOpacity.selector:
					this.currentBackgroundOpacity = value;
					selectedItem = this.rgb2rgba(this.hex2rgb(this.currentBackgroundColor), this.currentBackgroundOpacity);
					this.updatePreview("text", "background-color", selectedItem);
					this.cvaaSentSettings.backgroundColor = selectedItem;
					this.cvaaSavedSettings.backgroundOpacity = this.currentBackgroundOpacity;
					break;
				//window color
				case this.cvaaSettingsObj.options.colors.windowColor.selector:
					this.currentWindowColor = this.getValueByProp("color", value);
					selectedItem = this.rgb2rgba(this.hex2rgb(this.currentWindowColor), this.currentWindowOpacity);
					this.updatePreview("window", "background-color", selectedItem);
					this.cvaaSentSettings.windowColor = selectedItem;
					this.cvaaSavedSettings.windowColor = this.currentWindowColor;
					break;
				//window opacity
				case this.cvaaSettingsObj.options.sliders.windowOpacity.selector:
					this.currentWindowOpacity = value;
					selectedItem = this.rgb2rgba(this.hex2rgb(this.currentWindowColor), this.currentWindowOpacity);
					this.updatePreview("window", "background-color", selectedItem);
					this.cvaaSentSettings.windowColor = selectedItem;
					this.cvaaSavedSettings.windowOpacity = this.currentWindowOpacity;
					break;
				//font text shadow - edge style
				case this.cvaaSettingsObj.options.dropdowns.edgeStyle.selector:
					selectedItem = this.getValueByProp("edgeStyle", value);
					this.updatePreview("text", "text-shadow", selectedItem);
					this.cvaaSentSettings.edgeStyle = selectedItem;
					this.cvaaSavedSettings.edgeStyle = selectedItem;
					break;
			}
		},
		getValueByProp: function(option, propValue){
			for(var i=0; i<this.cvaaSettingsObj[option].length; i++){
				if(this.cvaaSettingsObj[option][i].prop == propValue){
					return this.cvaaSettingsObj[option][i].value;
				}
			}
		},
		getPropByValue: function(option,value){
			for(var i=0; i<this.cvaaSettingsObj[option].length; i++){
				if(this.cvaaSettingsObj[option][i].value == value){
					return this.cvaaSettingsObj[option][i].prop;
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
		getCurrentSettings: function(){
			var _this = this;

			_this.cvaaSentSettings = $.cookie('cvaaSavedSettings') ?
				JSON.parse($.cookie('cvaaSavedSettings')) :
				JSON.parse(JSON.stringify(_this.getConfig("cvaaDefaultSettings")));

			if(_this.firstInit){
				_this.firstInit = false;
				_this.cvaaSavedSettings = JSON.parse(JSON.stringify(_this.cvaaSentSettings));
			}
		},
		initPreviewUpdate: function(){
			var _this = this;

			//set default font family
			_this.currentFontFamily = _this.cvaaSavedSettings.fontFamily;
			$("#" + _this.cvaaSettingsObj.options.dropdowns.fontFamily.selector).val(_this.getPropByValue("family", _this.cvaaSentSettings.fontFamily));
			_this.updatePreview("text", "font-family", _this.cvaaSentSettings.fontFamily);

			//set default font color and opacity
			_this.currentFontColor = _this.cvaaSavedSettings.fontColor;
			_this.currentFontOpacity = _this.cvaaSavedSettings.fontOpacity;
			_this.cvaaSentSettings.fontColor = _this.rgb2rgba(_this.hex2rgb(_this.currentFontColor), _this.currentFontOpacity);
			$("#" + _this.cvaaSettingsObj.options.colors.fontColor.selector + "[value='" + _this.getPropByValue("color", _this.cvaaSavedSettings.fontColor) + "']").addClass('active').siblings().removeClass('active');
			_this.updatePreview("text", "color", _this.cvaaSentSettings.fontColor);

			//set default font size
			_this.currentFontSize = _this.cvaaSavedSettings.fontSize;
			_this.updatePreview("text", "font-size", _this.cvaaSentSettings.fontSize);

			//set default background color and opacity
			_this.currentBackgroundColor = _this.cvaaSavedSettings.backgroundColor;
			_this.currentBackgroundOpacity = _this.cvaaSavedSettings.backgroundOpacity;
			_this.cvaaSentSettings.backgroundColor = _this.rgb2rgba(_this.hex2rgb(_this.currentBackgroundColor), _this.currentBackgroundOpacity);
			$("#" + _this.cvaaSettingsObj.options.colors.backgroundColor.selector + "[value='" + _this.getPropByValue("color", _this.cvaaSavedSettings.backgroundColor) + "']").addClass('active').siblings().removeClass('active');
			_this.updatePreview("text", "background-color", _this.cvaaSentSettings.backgroundColor);

			//set default window color and opacity
			_this.currentWindowColor = _this.cvaaSavedSettings.windowColor;
			_this.currentWindowOpacity = _this.cvaaSavedSettings.windowOpacity;
			_this.cvaaSentSettings.windowColor = _this.currentWindowColor == "transparent" ?
												 _this.currentWindowColor:
												 _this.rgb2rgba(_this.hex2rgb(_this.currentWindowColor), _this.currentWindowOpacity);
			$("#" + _this.cvaaSettingsObj.options.colors.windowColor.selector + "[value='" + _this.getPropByValue("color", _this.cvaaSavedSettings.windowColor) + "']").addClass('active').siblings().removeClass('active');
			_this.updatePreview("window", "background-color", _this.cvaaSentSettings.windowColor);

			//set default edge style - text shadow
			_this.currentEdgeStyle = _this.cvaaSavedSettings.edgeStyle;
			$("#" + _this.cvaaSettingsObj.options.dropdowns.edgeStyle.selector).val(_this.getPropByValue("edgeStyle", _this.cvaaSentSettings.edgeStyle));
			_this.updatePreview("text", "text-shadow", _this.cvaaSentSettings.edgeStyle);

			//send styles to captions plugin
			_this.getPlayer().triggerHelper("newCaptionsStyles", _this.cvaaSentSettings);
		},
		setUpHandlers: function(){
			var _this = this;
			_this.handlersAreSet = true;
			//set sliders
			$.map(this.cvaaSettingsObj.options.sliders, function(el) { return el })
				.map(function(element){
					var sliderHolder = $( "#" + element.selector );
					sliderHolder.slider({
						value:	_this.cvaaSentSettings[element.default],
						min:	element.min,
						max:	element.max,
						slide: function( event, ui ) {
							$( "#" + element.valueSelector ).val( ui.value );
							_this.updateSettingsAndPreview(element.selector, ui.value);
						}
					});
					//set initial value
					$( "#" + element.valueSelector ).val(sliderHolder.slider( "value" ));
				});

			//set color pickers
			$(".colorContainer li").on('click', function () {
				$(this).addClass('active').siblings().removeClass('active');
				_this.updateSettingsAndPreview($(this)[0].id, $(this).val());
			});

			//set dropdowns
			$.map(_this.cvaaSettingsObj.options.dropdowns, function(el) { return el })
				.map(function(option){
					$("#" + option.selector).on("change", function () {
						_this.updateSettingsAndPreview($(this)[0].id, $(this).val());
					});
				});

			//set save button
			_this.getPlayer().getInterface().find(".saveCvaaSettings").click(function(){
				_this.saveCvaaSettings();
			});

			//set reset button
			_this.getPlayer().getInterface().find(".resetCvaaSettings").click(function(){
				_this.resetCvaaSettings();
			});
		},
		hex2rgb: function(hex){
			hex = hex.replace('#','');
			return [parseInt(hex.substring(0,2), 16), parseInt(hex.substring(2,4), 16), parseInt(hex.substring(4,6), 16)];
		},
		rgb2rgba: function(color, opacity){
			if(opacity !== undefined){
				return 'rgba(' + color.join(',') + ',' + opacity/100 + ')';
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
			$.cookie('cvaaSavedSettings', JSON.stringify(this.cvaaSavedSettings), {
				expires : 356,
				path : '/',
				domain : ''
			});
			this.getPlayer().triggerHelper("newCaptionsStyles", this.cvaaSentSettings);
		},
		resetCvaaSettings: function(){
			this.firstInit = true;

			$.cookie('cvaaSavedSettings', null, {
				expires : -1,
				path : '/',
				domain : ''
			});

			this.getCurrentSettings();
			this.initPreviewUpdate();

			//reset sliders and sliders labels
			$("#" + this.cvaaSettingsObj.options.sliders.fontOpacity.selector).slider("option","value",this.currentFontOpacity);
			$("#" + this.cvaaSettingsObj.options.sliders.fontOpacity.valueSelector).val(this.currentFontOpacity);

			$("#" + this.cvaaSettingsObj.options.sliders.backgroundOpacity.selector).slider("option","value",this.currentBackgroundOpacity);
			$("#" + this.cvaaSettingsObj.options.sliders.backgroundOpacity.valueSelector).val(this.currentBackgroundOpacity);

			$("#" + this.cvaaSettingsObj.options.sliders.windowOpacity.selector).slider("option","value",this.currentWindowOpacity);
			$("#" + this.cvaaSettingsObj.options.sliders.windowOpacity.valueSelector).val(this.currentWindowOpacity);

			$("#" + this.cvaaSettingsObj.options.sliders.fontSize.selector).slider("option","value",this.currentFontSize);
			$("#" + this.cvaaSettingsObj.options.sliders.fontSize.valueSelector).val(this.currentFontSize);

			this.getPlayer().triggerHelper("newCaptionsStyles", this.cvaaSentSettings);
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