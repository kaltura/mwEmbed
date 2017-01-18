(function (mw, $) {
    "use strict";

    mw.closedCaptions = mw.closedCaptions || {};

    mw.closedCaptions.cvaa = mw.KBaseScreen.extend({

        defaultConfig: {
            templatePath: 'components/cvaa/cvaa.tmpl.html',
            usePreviewPlayer: false,
            previewPlayerEnabled: false,
            useCookie: true,
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
            cvaaPreset1: {
                fontFamily: "Arial, Roboto, Arial Unicode Ms, Helvetica, Verdana, PT Sans Caption, sans-serif",
                fontColor: "#000000",
                fontOpacity: 100,
                fontSize: 12,
                backgroundColor: "#ffffff",
                backgroundOpacity: 75,
                windowColor: "#ffffff",
                windowOpacity: 0,
                edgeStyle: "none"
            },
            cvaaPreset2: {
                fontFamily: "Arial, Roboto, Arial Unicode Ms, Helvetica, Verdana, PT Sans Caption, sans-serif",
                fontColor: "#ffff00",
                fontOpacity: 100,
                fontSize: 12,
                backgroundColor: "#000000",
                backgroundOpacity: 75,
                windowColor: "#ffffff",
                windowOpacity: 0,
                edgeStyle: "none"
            },
            cvaaMenus: {
                main: "cvaa-main",
                adv: "cvaa-adv",
                cstm: "cvaa-cstm",
                size: "cvaa-size",
                font: "cvaa-font",
                bg: "cvaa-bg",
                color: "cvaa-color"
            },
            cvaaOptions: {
                "edgeStyle": [
                    {
                        "prop": 1,
                        "text": "None",
                        "value": "none"
                    },
                    {
                        "prop": 2,
                        "text": "Drop shadow",
                        "value": "rgb(34, 34, 34) 2px 2px 3px, rgb(34, 34, 34) 2px 2px 4px, rgb(34, 34, 34) 2px 2px 5px"
                    },
                    {
                        "prop": 3,
                        "text": "Raised",
                        "value": "rgb(34, 34, 34) 1px 1px, rgb(34, 34, 34) 2px 2px, rgb(34, 34, 34) 3px 3px"
                    },
                    {
                        "prop": 4,
                        "text": "Depressed",
                        "value": "rgb(204, 204, 204) 1px 1px, rgb(204, 204, 204) 0px 1px, rgb(34, 34, 34) -1px -1px, rgb(34, 34, 34) 0px -1px"
                    },
                    {
                        "prop": 5,
                        "text": "Outlined",
                        "value": "rgb(34, 34, 34) 0px 0px 4px, rgb(34, 34, 34) 0px 0px 4px, rgb(34, 34, 34) 0px 0px 4px, rgb(34, 34, 34) 0px 0px 4px"
                    }
                ],
                "color": [
                    {"prop": 1, "text": "White", "value": "#ffffff"},
                    {"prop": 2, "text": "Yellow", "value": "#ffff00"},
                    {"prop": 3, "text": "Green", "value": "#00ff00"},
                    {"prop": 4, "text": "Cyan", "value": "#00ffff"},
                    {"prop": 5, "text": "Blue", "value": "#0000ff"},
                    {"prop": 6, "text": "Magenta", "value": "#ff00ff"},
                    {"prop": 7, "text": "Red", "value": "#ff0000"},
                    {"prop": 8, "text": "Black", "value": "#000000"}
                ],
                "family": [
                    {
                        "prop": 1,
                        "text": "Monospaced Serif",
                        "value": "Courier New, Courier, Nimbus Mono L, Cutive Mono, monospace"
                    },
                    {
                        "prop": 2,
                        "text": "Proportional Serif",
                        "value": "Times New Roman, Times, Georgia, Cambria, PT Serif Caption, serif"
                    },
                    {
                        "prop": 3,
                        "text": "Monospaced Sans-Serif",
                        "value": "Lucida Console, Deja Vu Sans Mono, Monaco, Consolas, PT Mono, monospace"
                    },
                    {
                        "prop": 4,
                        "text": "Proportional Sans-Serif",
                        "value": "Arial, Roboto, Arial Unicode Ms, Helvetica, Verdana, PT Sans Caption, sans-serif"
                    },
                    {"prop": 5, "text": "Casual", "value": "Comic Sans MS, Impact, Handlee, fantasy"},
                    {
                        "prop": 6,
                        "text": "Cursive",
                        "value": "Monotype Corsiva, URW Chancery L, Apple Chancery, Dancing Script, cursive"
                    },
                    {
                        "prop": 7,
                        "text": "Small Capitals",
                        "value": "Verdana ,Arial Unicode Ms, Arial, Helvetica, Marcellus SC, sans-serif"
                    }
                ]
            }
        },
        locale: {
            "fontSizelabel": gM('mwe-cvaa-fontSize'),
            "fontOplabel": gM('mwe-cvaa-fontOpacity'),
            "backgroundOpLabel": gM('mwe-cvaa-backgroundOpacity'),
            "windowOplabel": gM('mwe-cvaa-windowOpacity'),
            "fontColorlabel": gM('mwe-cvaa-fontColor'),
            "backgroundColorlabel": gM('mwe-cvaa-backgroundColor'),
            "windowColorlabel": gM('mwe-cvaa-windowColor'),
            "fontFamilylabel": gM('mwe-cvaa-fontFamily'),
            "edgeStylelabel": gM('mwe-cvaa-edgeStyle'),
            "optionsBtnLabel": gM('mwe-cvaa-options'),
            "captionsPreviewText": gM('mwe-cvaa-previewText')
        },
        previousScreen: "",
        currentScreen: "",

        cvaaSettingsObj: null,
        cvaaMenus: null,
        cvaaSavedSettings: null,
        cvaaSentSettings: null,

        firstInit: true,
        handlersAreSet: false,

        currentFontFamily: null,
        currentFontColor: null,
        currentFontOpacity: null,
        currentFontSize: null,
        currentBackgroundColor: null,
        currentBackgroundOpacity: null,
        currentWindowColor: null,
        currentWindowOpacity: null,
        currentEdgeStyle: null,

        setup: function () {
            this.cvaaMenus = this.getConfig("cvaaMenus");
            this.currentScreen = this.cvaaMenus["main"];
            this.previousScreen = this.cvaaMenus["main"];

            this.cvaaSettingsObj = this.getConfig("cvaaOptions");
            this.addBindings();
        },

        addScreenBindings: function () {
            var _this = this;

            $(".cvaa .icon-arrow").on("mousedown", function () {
                _this.cvaaMenuChanged(_this.previousScreen);
            });

            $(".cvaa .cvaa-main__advoptions-btn").on("mousedown", function () {
                _this.cvaaMenuChanged(_this.cvaaMenus["adv"]);
            });

            $(".cvaa .cvaa-adv__cstmoptions-btn").on("mousedown", function () {
                _this.cvaaMenuChanged(_this.cvaaMenus["cstm"]);
            });

            $(".cvaa .cvaa-cstm__size-btn").on("mousedown", function () {
                _this.cvaaMenuChanged(_this.cvaaMenus["size"]);
            });

            $(".cvaa .cvaa-cstm__font-btn").on("mousedown", function () {
                _this.cvaaMenuChanged(_this.cvaaMenus["font"]);
            });

            $(".cvaa .cvaa-cstm__bg-btn").on("mousedown", function () {
                _this.cvaaMenuChanged(_this.cvaaMenus["bg"]);
            });

            $(".cvaa .cvaa-cstm__color-btn").on("mousedown", function () {
                _this.cvaaMenuChanged(_this.cvaaMenus["color"]);
            });
        },

        addBindings: function () {
            var _this = this;
            var embedPlayer = this.getPlayer();

            this.bind('playerReady', function () {
                _this.getCurrentSettings();
                _this.initPreviewUpdate();
            });

            this.bind('openCvaaOptions', function () {
                _this.getScreen().then(function (screen) {
                    _this.toggleScreen();
                });
            });

            this.bind('onChangeMedia', function () {
                _this.handlersAreSet = false;
            });

            this.bind('preShowScreen', function (event, screenName) {

                _this.initPreviewUpdate();
                if (!_this.handlersAreSet) {
                    _this.setUpHandlers();
                }

                if (screenName === "cvaa") {
                    _this.getScreen().then(function (screen) {
                        screen.addClass('semiTransparentBkg');
                        // prevent keyboard key actions to allow typing in share screen fields
                        embedPlayer.triggerHelper('onDisableKeyboardBinding');
                        embedPlayer.triggerHelper("cvaaScreenOpen");
                        embedPlayer.disablePlayControls(["cvaa"]);
                    });
                }
            });

            this.bind('showScreen', function (event, screenName) {
                if (screenName === "cvaa") {
                    _this.getScreen().then(function (screen) {
                        $(embedPlayer.getPlayerElement()).addClass("blur");
                        embedPlayer.getPlayerPoster().addClass("blur");
                    });
                }
            });

            this.bind('preHideScreen', function (event, screenName) {
                if (screenName === "cvaa") {
                    if (_this.getPlayer().getPlayerElement()) {
                        $("#" + _this.getPlayer().getPlayerElement().id).removeClass("blur");
                        _this.getPlayer().getPlayerPoster().removeClass("blur");
                    }
                    // restore keyboard actions
                    embedPlayer.triggerHelper('onEnableKeyboardBinding');
                    // re-enable player controls
                    if (!embedPlayer.isInSequence()) {
                        embedPlayer.enablePlayControls();
                    }
                }
            });
        },

        cvaaMenuChanged: function (newScreen) {
            this.previousScreen = this.currentScreen;
            this.currentScreen = newScreen;

            //show back button only if it is not the main screen
            this.showHideBackBtn();

            //hide current screen and show new screen
            this.showHideScreens();

            //set correct previous screen for general screens
            switch (newScreen) {
                case "cvaa-adv":
                    this.previousScreen = this.cvaaMenus["main"];
                    break;

                case "cvaa-cstm":
                    this.previousScreen = this.cvaaMenus["adv"];
                    break;
            }

        },

        showHideScreens: function () {
            $(".cvaa ." + this.previousScreen).removeClass("cvaa--show");
            $(".cvaa ." + this.currentScreen).addClass("cvaa--show");
        },

        showHideBackBtn: function () {
            if (this.currentScreen !== this.cvaaMenus["main"]) {
                $(".cvaa-container .icon-arrow").addClass("cvaa--show");
            } else {
                $(".cvaa-container .icon-arrow").removeClass("cvaa--show");
            }
        },

        updateSettingsAndPreview: function (option, value) {
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
        getValueByProp: function (option, propValue) {
            var cvaaOptions = this.cvaaSettingsObj[option];

            for (var i = 0; i < cvaaOptions.length; i++) {
                if (cvaaOptions && cvaaOptions[i].prop == propValue) {
                    return cvaaOptions[i].value;
                }
            }
        },
        getPropByValue: function (option, value) {
            var cvaaOptions = this.cvaaSettingsObj[option];

            for (var i = 0; i < cvaaOptions.length; i++) {
                if (cvaaOptions && cvaaOptions[i].value == value) {
                    return cvaaOptions[i].prop;
                }
            }
        },
        updatePreview: function (element, option, value) {
            switch (element) {
                case "window":
                    this.getPlayer().getInterface().find("#previewWindow").css(option, value);
                    break;
                case "text":
                    this.getPlayer().getInterface().find("#previewText").css(option, value);
                    break;
            }
        },
        getCurrentSettings: function () {
            var _this = this;

            _this.cvaaSentSettings = _this.getConfig('useCookie') && $.cookie('cvaaSavedSettings') ?
                JSON.parse($.cookie('cvaaSavedSettings')) :
                $.extend(true, {}, _this.getConfig("cvaaDefaultSettings"));

            if (_this.firstInit) {
                _this.firstInit = false;
                _this.cvaaSavedSettings = $.extend(true, {}, _this.cvaaSentSettings);
            }
        },
        initPreviewUpdate: function () {
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
        setUpHandlers: function () {
            var _this = this;
            _this.handlersAreSet = true;
            var dropdowns = ["kFontFamily", "kEdgeStyle"];

            //set sliders
            // $.map(_this.cvaaSettingsObj.sliders, function(el) { return el })
            // 	.map(function(element){
            // 		var sliderHolder = $( "#" + element.selector );
            // 		sliderHolder.slider({
            // 			value:	_this.cvaaSavedSettings[element["default"]],
            // 			min:	element.min,
            // 			max:	element.max,
            // 			slide: function( event, ui ) {
            // 				$( "#" + element.selector + "Val" ).val( ui.value );
            // 				_this.updateSettingsAndPreview(element.selector, ui.value);
            // 			}
            // 		});
            // 		//set initial value
            // 		$( "#" + element.selector + "Val" ).val(sliderHolder.slider( "value" ));
            // 	});

            //set color pickers
            // $(".colorContainer li").on('click keydown', function (event) {
            // 	if(event.which === 32 || event.which === 13 || event.type == "click"){
            // 		$(this).addClass('active').siblings().removeClass('active');
            // 		_this.updateSettingsAndPreview($(this)[0].id, $(this).val());
            // 	}
            // });

            //set dropdowns
            // dropdowns.map(function(option){
            // 	$("#" + option).on("change keydown", function (event) {
            // 		if(event.which === 32 ||event.which === 13 || event.type == "change"){
            // 			_this.updateSettingsAndPreview($(this)[0].id, $(this).val());
            // 		}
            // 	});
            // });

            //set save button
            _this.getPlayer().getInterface().find(".saveCvaaSettings").click(function () {
                _this.saveCvaaSettings();
            });

            //set reset button
            _this.getPlayer().getInterface().find(".resetCvaaSettings").click(function () {
                _this.resetCvaaSettings();
            });
        },
        hex2rgb: function (hex) {
            hex = hex.replace('#', '');
            return [parseInt(hex.substring(0, 2), 16), parseInt(hex.substring(2, 4), 16), parseInt(hex.substring(4, 6), 16)];
        },
        rgb2rgba: function (color, opacity) {
            if (opacity !== undefined) {
                return 'rgba(' + color.join(',') + ',' + opacity / 100 + ')';
            } else {
                return 'rgb(' + color.join(',') + ')';
            }
        },
        getFontSize: function (fontsize) {
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
        saveCvaaSettings: function () {
            this.getPlayer().setCookie('cvaaSavedSettings', JSON.stringify(this.cvaaSavedSettings), {
                expires: 356,
                path: '/',
                domain: ''
            });

            this.getPlayer().triggerHelper("newCaptionsStyles", this.cvaaSentSettings);
            this.hideScreen();
        },
        addOptionsBtn: function () {
            return {
                "optionsLabel": this.locale.optionsBtnLabel,
                "optionsEvent": "openCvaaOptions"
            }
        },
        getTemplateData: function () {
            return {
                'cvaa': this,
                'cvaaOptions': this.cvaaSettingsObj
            };
        },
        isSafeEnviornment: function () {
            return !mw.isIphone() && !mw.isIE8();
        }
    });

})(window.mw, window.jQuery);