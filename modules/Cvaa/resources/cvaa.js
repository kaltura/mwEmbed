( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'cvaa', mw.KBaseScreen.extend({

		defaultConfig: {
			parent: "topBarContainer",
			templatePath: '../Cvaa/resources/cvaa.tmpl.html',
			usePreviewPlayer: false,
			previewPlayerEnabled: false,
			optionsEvent: "openCvaaOptions",
			cvaaBtnPosition: "first",
			cvaaDefaultSettings: {
				fontFamily: "Arial, Roboto, Arial Unicode Ms, Helvetica, Verdana, PT Sans Caption, sans-serif",
				fontColor: "#ffffff",
				fontOpacity: 100,
				fontSize: 12,
				backgroundColor: "#000000",
				backgroundOpacity: 75,
				windowColor: "#ffffff",
				windowOpacity: 0,
				edgeStyle: "none"
			},
			cvaaOptions:{
				"sliders": {
					"fontSize": {
						"min": 6,
						"max": 24,
						"default": "fontSize",
						"selector": "kFontSize"
					},
					"fontOpacity": {
						"min": 0,
						"max": 100,
						"default": "fontOpacity",
						"selector": "kFontOpacity"
					},
					"backgroundOpacity": {
						"min": 0,
						"max": 100,
						"default": "backgroundOpacity",
						"selector": "kBackgroundOpacity"
					},
					"windowOpacity": {
						"min": 0,
						"max": 100,
						"default": "windowOpacity",
						"selector": "kWindowOpacity"
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
		locale:{
			"fontSizelabel": gM('mwe-cvaa-fontSize'),
			"fontOplabel": gM('mwe-cvaa-fontOpacity'),
			"backgroundOpLabel": gM('mwe-cvaa-backgroundOpacity'),
			"windowOplabel": gM('mwe-cvaa-windowOpacity'),
			"fontColorlabel": gM('mwe-cvaa-fontColor' ),
			"backgroundColorlabel": gM('mwe-cvaa-backgroundColor'),
			"windowColorlabel": gM('mwe-cvaa-windowColor'),
			"fontFamilylabel": gM('mwe-cvaa-fontFamily'),
			"edgeStylelabel": gM('mwe-cvaa-edgeStyle'),
			"optionsBtnLabel": gM( 'mwe-cvaa-options' ),
			"captionsPreviewText": gM( 'mwe-cvaa-previewText' )
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
				_this.toggleScreen();
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
						embedPlayer.disablePlayControls(["cvaa"]);
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
					// re-enable player controls
					if ( !embedPlayer.isInSequence() ){
						embedPlayer.enablePlayControls();
					}
				}
			});

		},
		updateSettingsAndPreview: function(option, value){
			var selectedItem;
			switch (option) {
				case "kFontFamily":
					selectedItem = this.getValueByProp("family", value);
					this.updatePreview("text", "font-family", selectedItem);
					this.cvaaSentSettings.fontFamily = selectedItem;
					this.cvaaSavedSettings.fontFamily = selectedItem;
					break;
				case "kFontColor":
					this.currentFontColor = this.getValueByProp("color", value);
					selectedItem = this.rgb2rgba(this.hex2rgb(this.currentFontColor), this.currentFontOpacity);
					this.updatePreview("text", "color", selectedItem);
					this.cvaaSentSettings.fontColor = selectedItem;
					this.cvaaSavedSettings.fontColor = this.currentFontColor;
					break;
				case "kFontOpacity":
					this.currentFontOpacity = value;
					selectedItem = this.rgb2rgba(this.hex2rgb(this.currentFontColor), this.currentFontOpacity);
					this.updatePreview("text", "color", selectedItem);
					this.cvaaSentSettings.fontColor = selectedItem;
					this.cvaaSavedSettings.fontOpacity = this.currentFontOpacity;
					break;
				case "kFontSize":
					this.currentFontSize = value;
					this.updatePreview("text", "font-size", this.getFontSize(this.currentFontSize));
					this.cvaaSentSettings.fontSize = this.getFontSize(this.currentFontSize);
					this.cvaaSavedSettings.fontSize = this.currentFontSize;
					break;
				case "kBackgroundColor":
					this.currentBackgroundColor = this.getValueByProp("color", value);
					selectedItem = this.rgb2rgba(this.hex2rgb(this.currentBackgroundColor), this.currentBackgroundOpacity);
					this.updatePreview("text", "background-color", selectedItem);
					this.cvaaSentSettings.backgroundColor = selectedItem;
					this.cvaaSavedSettings.backgroundColor = this.currentBackgroundColor;
					break;
				case "kBackgroundOpacity":
					this.currentBackgroundOpacity = value;
					selectedItem = this.rgb2rgba(this.hex2rgb(this.currentBackgroundColor), this.currentBackgroundOpacity);
					this.updatePreview("text", "background-color", selectedItem);
					this.cvaaSentSettings.backgroundColor = selectedItem;
					this.cvaaSavedSettings.backgroundOpacity = this.currentBackgroundOpacity;
					break;
				case "kWindowColor":
					this.currentWindowColor = this.getValueByProp("color", value);
					selectedItem = this.rgb2rgba(this.hex2rgb(this.currentWindowColor), this.currentWindowOpacity);
					this.updatePreview("window", "background-color", selectedItem);
					this.cvaaSentSettings.windowColor = selectedItem;
					this.cvaaSavedSettings.windowColor = this.currentWindowColor;
					break;
				case "kWindowOpacity":
					this.currentWindowOpacity = value;
					selectedItem = this.rgb2rgba(this.hex2rgb(this.currentWindowColor), this.currentWindowOpacity);
					this.updatePreview("window", "background-color", selectedItem);
					this.cvaaSentSettings.windowColor = selectedItem;
					this.cvaaSavedSettings.windowOpacity = this.currentWindowOpacity;
					break;
				case "kEdgeStyle":
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
			$("#kFontFamily").val(_this.getPropByValue("family", _this.cvaaSentSettings.fontFamily));
			_this.updatePreview("text", "font-family", _this.cvaaSentSettings.fontFamily);

			//set default font color and opacity
			_this.currentFontColor = _this.cvaaSavedSettings.fontColor;
			_this.currentFontOpacity = _this.cvaaSavedSettings.fontOpacity;
			_this.cvaaSentSettings.fontColor = _this.rgb2rgba(_this.hex2rgb(_this.currentFontColor), _this.currentFontOpacity);
			$("#kFontColor[value='" + _this.getPropByValue("color", _this.cvaaSavedSettings.fontColor) + "']").addClass('active').siblings().removeClass('active');
			_this.updatePreview("text", "color", _this.cvaaSentSettings.fontColor);

			//set default font size
			_this.currentFontSize = _this.cvaaSavedSettings.fontSize;
			_this.cvaaSentSettings.fontSize = this.getFontSize(_this.currentFontSize);
			_this.updatePreview("text", "font-size", _this.cvaaSentSettings.fontSize);

			//set default background color and opacity
			_this.currentBackgroundColor = _this.cvaaSavedSettings.backgroundColor;
			_this.currentBackgroundOpacity = _this.cvaaSavedSettings.backgroundOpacity;
			_this.cvaaSentSettings.backgroundColor = _this.rgb2rgba(_this.hex2rgb(_this.currentBackgroundColor), _this.currentBackgroundOpacity);
			$("#kBackgroundColor[value='" + _this.getPropByValue("color", _this.cvaaSavedSettings.backgroundColor) + "']").addClass('active').siblings().removeClass('active');
			_this.updatePreview("text", "background-color", _this.cvaaSentSettings.backgroundColor);

			//set default window color and opacity
			_this.currentWindowColor = _this.cvaaSavedSettings.windowColor;
			_this.currentWindowOpacity = _this.cvaaSavedSettings.windowOpacity;
			_this.cvaaSentSettings.windowColor = _this.rgb2rgba(_this.hex2rgb(_this.currentWindowColor), _this.currentWindowOpacity);
			$("#kWindowColor[value='" + _this.getPropByValue("color", _this.cvaaSavedSettings.windowColor) + "']").addClass('active').siblings().removeClass('active');
			_this.updatePreview("window", "background-color", _this.cvaaSentSettings.windowColor);

			//set default edge style - text shadow
			_this.currentEdgeStyle = _this.cvaaSavedSettings.edgeStyle;
			$("#kEdgeStyle").val(_this.getPropByValue("edgeStyle", _this.cvaaSentSettings.edgeStyle));
			_this.updatePreview("text", "text-shadow", _this.cvaaSentSettings.edgeStyle);

			//send styles to captions plugin
			_this.getPlayer().triggerHelper("newCaptionsStyles", _this.cvaaSentSettings);
		},
		setUpHandlers: function(){
			var _this = this;
			_this.handlersAreSet = true;
			var dropdowns = ["kFontFamily","kEdgeStyle"];

			//set sliders
			$.map(_this.cvaaSettingsObj.sliders, function(el) { return el })
				.map(function(element){
					var sliderHolder = $( "#" + element.selector );
					sliderHolder.slider({
						value:	_this.cvaaSavedSettings[element.default],
						min:	element.min,
						max:	element.max,
						slide: function( event, ui ) {
							$( "#" + element.selector + "Val" ).val( ui.value );
							_this.updateSettingsAndPreview(element.selector, ui.value);
						}
					});
					//set initial value
					$( "#" + element.selector + "Val" ).val(sliderHolder.slider( "value" ));
				});

			//set color pickers
			$(".colorContainer li").on('click', function () {
				$(this).addClass('active').siblings().removeClass('active');
				_this.updateSettingsAndPreview($(this)[0].id, $(this).val());
			});

			//set dropdowns
			dropdowns.map(function(option){
				$("#" + option).on("change", function () {
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
			this.hideScreen();
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
			this.resetSliders();

			this.getPlayer().triggerHelper("newCaptionsStyles", this.cvaaSentSettings);
		},
		resetSliders: function(){
			//reset sliders and sliders labels
			$("#kFontOpacity").slider("option","value",this.currentFontOpacity);
			$("#kFontOpacityVal").val(this.currentFontOpacity);

			$("#kBackgroundOpacity").slider("option","value",this.currentBackgroundOpacity);
			$("#kBackgroundOpacityVal").val(this.currentBackgroundOpacity);

			$("#kWindowOpacity").slider("option","value",this.currentWindowOpacity);
			$("#kWindowOpacityVal").val(this.currentWindowOpacity);

			$("#kFontSize").slider("option","value",this.currentFontSize);
			$("#kFontSizeVal").val(this.currentFontSize);
		},
		addOptionsBtn: function(){
			this.getPlayer().triggerHelper("addOptionsToCaptions",{
				"optionsLabel": this.locale.optionsBtnLabel,
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
			!mw.isIphone();
		}
	}));

} )( window.mw, window.jQuery );