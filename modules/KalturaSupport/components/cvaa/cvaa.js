(function (mw, $) {
    "use strict";

    mw.closedCaptions = mw.closedCaptions || {};

    mw.closedCaptions.cvaa = mw.KBaseScreen.extend({

        defaultConfig: {
            templatePath: 'components/cvaa/cvaa.tmpl.html',
            usePreviewPlayer: false,
            previewPlayerEnabled: false,
            useCookie: true,
            cvaaDefault: {
                fontFamily: "Arial, Roboto, Arial Unicode Ms, Helvetica, Verdana, PT Sans Caption, sans-serif",
                fontColor: "rgba(255,255,255,1)",
                fontHexColor: "#ffffff",
                fontOpacity: 100,
                fontSize: "1em",
                fontPxSize: 12,
                backgroundColor: "rgba(0,0,0,0)",
                backgroundHexColor: "#000000",
                backgroundOpacity: 0,
                edgeStyle: "none",
                currentPreset: "cvaaDefault"
            },
            cvaaPreset1: {
                fontFamily: "Arial, Roboto, Arial Unicode Ms, Helvetica, Verdana, PT Sans Caption, sans-serif",
                fontColor: "rgba(0,0,0,1)",
                fontHexColor: "#000000",
                fontOpacity: 100,
                fontSize: "1em",
                fontPxSize: 12,
                backgroundColor: "rgba(255,255,255,1)",
                backgroundHexColor: "#ffffff",
                backgroundOpacity: 100,
                edgeStyle: "none",
                currentPreset: "cvaaPreset1"
            },
            cvaaPreset2: {
                fontFamily: "Arial, Roboto, Arial Unicode Ms, Helvetica, Verdana, PT Sans Caption, sans-serif",
                fontColor: "rgba(255,255,0,1)",
                fontHexColor: "#ffff00",
                fontOpacity: 100,
                fontSize: "1em",
                fontPxSize: 12,
                backgroundColor: "rgba(0,0,0,1)",
                backgroundHexColor: "#000000",
                backgroundOpacity: 100,
                edgeStyle: "none",
                currentPreset: "cvaaPreset2"
            },
            cvaaOptions: {
                "size":[
                    {"prop": 1, "value": "12", "text": "Small",       "labelClass": "",                    "btnClass": "cvaa-size__small-btn" },
                    {"prop": 2, "value": "16", "text": "Medium",      "labelClass": "",                    "btnClass": "cvaa-size__medium-btn" },
                    {"prop": 3, "value": "20", "text": "Large",       "labelClass": "",                    "btnClass": "cvaa-size__large-btn" },
                    {"prop": 4, "value": "25", "text": "Extra Large", "labelClass": "cvaa-size__xl-label", "btnClass": "cvaa-size__exlarge-btn" }
                ],
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
                ],
                "opacity": [
                    {"prop": 1, "text": "Opacity 0%", "value": 0},
                    {"prop": 2, "text": "Opacity 25%", "value": 25},
                    {"prop": 3, "text": "Opacity 50%", "value": 50},
                    {"prop": 4, "text": "Opacity 75%", "value": 75},
                    {"prop": 5, "text": "Opacity 100%", "value": 100}
                ],
                "presets": [
                    {"prop": 1, "text": "Default", "value": "cvaaDefault"},
                    {"prop": 2, "text": "Sample", "value": "cvaaPreset1"},
                    {"prop": 3, "text": "Sample", "value": "cvaaPreset2"},
                    {"prop": 4, "text": "Custom", "value": "custom"}
                ]
            }
        },
        locale: {
            "fontSizelabel": gM('mwe-cvaa-fontSize'),
            "fontOplabel": gM('mwe-cvaa-fontOpacity'),
            "backgroundOpLabel": gM('mwe-cvaa-backgroundOpacity'),
            "fontColorlabel": gM('mwe-cvaa-fontColor'),
            "backgroundColorlabel": gM('mwe-cvaa-backgroundColor'),
            "fontFamilylabel": gM('mwe-cvaa-fontFamily'),
            "edgeStylelabel": gM('mwe-cvaa-edgeStyle'),
            "optionsBtnLabel": gM('mwe-cvaa-options'),
            "captionsPreviewText": gM('mwe-cvaa-previewText')
        },
        previousScreen: "cvaa-main",
        currentScreen: "cvaa-main",

        cvaaSettings: {},
        currentFontFamily: "",
        currentFontColor: "",
        currentFontHexColor: "",
        currentFontOpacity: null,
        currentFontSize: null,
        currentFontPxSize: null,
        currentBackgroundColor: "",
        currentBackgroundHexColor: "",
        currentBackgroundOpacity: null,
        currentEdgeStyle: "",

        setup: function () {
            this.addBindings();
        },

        addScreenBindings: function () {
            var _this = this;

            var cvaaMenus = [
                { name: "cvaa-adv",   btnClass: "cvaa-main__advoptions-btn" },
                { name: "cvaa-cstm",  btnClass: "cvaa-adv__cstmoptions-btn" },
                { name: "cvaa-size",  btnClass: "cvaa-cstm__size-btn" },
                { name: "cvaa-font",  btnClass: "cvaa-cstm__font-btn" },
                { name: "cvaa-bg",    btnClass: "cvaa-cstm__bg-btn" },
                { name: "cvaa-color", btnClass: "cvaa-cstm__color-btn" }];

            $(".cvaa .icon-arrow").on("mousedown", function () {
                _this.cvaaMenuChanged(_this.previousScreen);
            });

            $(".cvaa .icon-close").on("mousedown", function () {
                _this.cvaaMenuChanged("cvaa-main");
            });

            $.each(cvaaMenus, function (index, menu) {
                $(".cvaa ." + menu.btnClass).on("mousedown", function () {
                    _this.cvaaMenuChanged(menu.name);
                });
            });
        },

        addBindings: function () {
            var _this = this;
            var embedPlayer = this.getPlayer();

            this.bind('playerReady', function () {
               _this.getCurrentSettings();
            });

            this.bind('openCvaaOptions', function () {
                _this.getScreen().then(function (screen) {
                    _this.toggleScreen();
                });
            });

            this.bind('preShowScreen', function (event, screenName) {

                _this.getCurrentSettings();
                _this.setUpHandlers();

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

        getCurrentSettings: function () {
            var currentPreset = {};

            if (this.getConfig('useCookie') && $.cookie('cvaaSettings')) {
                this.cvaaSettings = JSON.parse($.cookie('cvaaSettings'));
                this.initUpdatePreviewBtn(this.cvaaSettings);
                currentPreset = this.getCurrentPreset(this.cvaaSettings.currentPreset);
            } else {
                currentPreset = $.extend(true, {}, this.getConfig("cvaaDefault"));
            }

            this.initPreviewUpdate(currentPreset);
        },

        getCurrentPreset: function (preset) {
            if (preset === "custom") {
                return this.cvaaSettings;
            } else {
                return $.extend(true, {}, this.getConfig(preset));
            }
        },

        cvaaMenuChanged: function (newScreen) {
            this.previousScreen = this.currentScreen;
            this.currentScreen = newScreen;

            //show preview
            this.showHidePreview(newScreen);

            //show back button only if it is not the main screen
            this.showHideBackBtn();

            //hide current screen and show new screen
            this.showHideScreens();

            //set correct previous screen for general screens
            switch (newScreen) {
                case "cvaa-adv":
                    this.previousScreen = "cvaa-main";
                    break;

                case "cvaa-cstm":
                    this.previousScreen = "cvaa-adv";
                    break;
            }
        },

        showHidePreview: function (currentMenu) {
            if (currentMenu !== "cvaa-main" && currentMenu !== "cvaa-adv" ) {
                this.getPlayer().getInterface().find(".cvaa-footer").show();
            } else {
                this.getPlayer().getInterface().find(".cvaa-footer").hide();
            }
        },

        showHideScreens: function () {
            $(".cvaa ." + this.previousScreen).removeClass("cvaa--show");
            $(".cvaa ." + this.currentScreen).addClass("cvaa--show");
        },

        showHideBackBtn: function () {
            if (this.currentScreen !== "cvaa-main") {
                $(".cvaa-container .icon-arrow").addClass("cvaa--show");
            } else {
                $(".cvaa-container .icon-arrow").removeClass("cvaa--show");
            }
        },

        setUpHandlers: function () {
            var _this = this;

            var presets = [ "cvaaDefault", "cvaaPreset1", "cvaaPreset2", "custom"];

            //presets
            $.each(presets, function (index, preset) {
                $(".cvaa-adv ." + preset).on("click keydown", function () {
                    if (event.which === 32 || event.which === 13 || event.type == "click") {
                        $(this).parent().addClass('icvaa-check').siblings().removeClass('icvaa-check');
                        _this.cvaaSettings.currentPreset = preset;
                        _this.initPreviewUpdate(_this.getCurrentPreset(_this.cvaaSettings.currentPreset));
                        _this.saveCvaaSettings();
                    }
                });
            });

            //size buttons
            $(".cvaa-size .cvaa-btn").on('click keydown', function (event) {
                if (event.which === 32 || event.which === 13 || event.type == "click") {
                    $(this).parent().addClass('icvaa-check').siblings().removeClass('icvaa-check');
                    _this.updateSettingsAndPreview(this.name, $(this).val());
                    _this.saveCvaaSettings();
                }
            });
            //color and bg-color buttons
            $(".cvaa-color .cvaa-btn, .cvaa-bg .cvaa-btn").on('click keydown', function (event) {
                if (event.which === 32 || event.which === 13 || event.type == "click") {
                    $(this).addClass('icvaa-check').siblings().removeClass('icvaa-check');
                    _this.updateSettingsAndPreview(this.name, $(this).val());
                    _this.saveCvaaSettings();
                }
            });

            //font-family
            $(".cvaa-color .cvaa-dropdown, .cvaa-bg .cvaa-dropdown, .cvaa-font .cvaa-dropdown").on("change keydown", function (event) {
                if (event.which === 32 || event.which === 13 || event.type == "change") {
                    _this.updateSettingsAndPreview(this.name, $(this).val());
                    _this.saveCvaaSettings();
                }
            });
        },

        updateSettingsAndPreview: function (option, value) {

            this.setDefaultCustomSettings();
            this.initUpdatePreviewBtn(this.cvaaSettings);

            switch (option) {
                case "cvaa-font":
                    this.cvaaSettings.fontFamily = this.getValueOrProp("family", value, "prop");
                    this.updatePreview("custom", "font-family", this.cvaaSettings.fontFamily);
                    break;
                case "cvaa-style":
                    this.cvaaSettings.edgeStyle = this.getValueOrProp("edgeStyle", value, "prop");
                    this.updatePreview("custom", "text-shadow", this.cvaaSettings.edgeStyle);
                    break;
                case "cvaa-color":
                    this.currentFontHexColor = this.getValueOrProp("color", value, "prop");
                    this.currentFontColor = this.rgb2rgba(this.hex2rgb(this.currentFontHexColor), this.currentFontOpacity);
                    this.cvaaSettings.fontColor = this.currentFontColor;
                    this.cvaaSettings.fontHexColor = this.currentFontHexColor;
                    this.updatePreview("custom", "color", this.currentFontColor);
                    break;
                case "cvaa-color-opacity":
                    this.currentFontOpacity = this.getValueOrProp("opacity", value, "prop");
                    this.currentFontColor = this.rgb2rgba(this.hex2rgb(this.currentFontColor), this.currentFontOpacity);
                    this.cvaaSettings.fontColor = this.currentFontColor ;
                    this.cvaaSettings.fontOpacity = this.currentFontOpacity;
                    this.updatePreview("custom", "color", this.currentFontColor );
                    break;
                case "cvaa-bg":
                    this.currentBackgroundHexColor = this.getValueOrProp("color", value, "prop");
                    this.currentBackgroundColor = this.rgb2rgba(this.hex2rgb(this.currentBackgroundHexColor), this.currentBackgroundOpacity);
                    this.cvaaSettings.backgroundColor = this.currentBackgroundColor;
                    this.cvaaSettings.backgroundHexColor = this.currentBackgroundHexColor;
                    this.updatePreview("custom", "background-color", this.currentBackgroundColor);
                    break;
                case "cvaa-bg-opacity":
                    this.currentBackgroundOpacity = this.getValueOrProp("opacity", value, "prop");
                    this.currentBackgroundColor = this.rgb2rgba(this.hex2rgb(this.currentBackgroundHexColor), this.currentBackgroundOpacity);
                    this.cvaaSettings.backgroundColor = this.currentBackgroundColor;
                    this.cvaaSettings.backgroundOpacity = this.currentBackgroundOpacity;
                    this.updatePreview("custom", "background-color", this.currentBackgroundColor);
                    break;
                case "cvaa-size":
                    this.currentFontPxSize = this.getValueOrProp("size", value, "prop");
                    this.currentFontSize = this.getFontSize(this.currentFontPxSize);
                    this.cvaaSettings.fontSize = this.currentFontSize;
                    this.cvaaSettings.fontPxSize = this.currentFontPxSize;
                    this.updatePreview("custom", "font-size", this.currentFontSize);
                    break;
            }
        },

        setDefaultCustomSettings: function () {
            this.cvaaSettings.fontFamily = this.cvaaSettings.fontFamily || this.currentFontFamily;
            this.cvaaSettings.edgeStyle = this.cvaaSettings.edgeStyle || this.currentEdgeStyle;
            this.cvaaSettings.fontColor = this.cvaaSettings.fontColor || this.currentFontColor;
            this.cvaaSettings.fontHexColor = this.cvaaSettings.fontHexColor || this.currentFontHexColor;
            this.cvaaSettings.fontOpacity = this.cvaaSettings.fontOpacity || this.currentFontOpacity;
            this.cvaaSettings.backgroundColor = this.cvaaSettings.backgroundColor || this.currentBackgroundColor;
            this.cvaaSettings.backgroundHexColor = this.cvaaSettings.backgroundHexColor || this.currentBackgroundHexColor;
            this.cvaaSettings.backgroundOpacity = this.cvaaSettings.backgroundOpacity || this.currentBackgroundOpacity;
            this.cvaaSettings.fontSize = this.cvaaSettings.fontSize || this.currentFontSize;
            this.cvaaSettings.fontPxSize = this.cvaaSettings.fontPxSize || this.currentFontPxSize;
        },

        initPreviewUpdate: function (currentPreset) {
            //set default font family
            this.currentFontFamily = currentPreset.fontFamily;
            $(".cvaa-font .cvaa-family").val(this.getValueOrProp("family", this.currentFontFamily, "value"));
            this.updatePreview(currentPreset.currentPreset, "font-family", this.currentFontFamily);

            //set default edge style - text shadow
            this.currentEdgeStyle = currentPreset.edgeStyle;
            $(".cvaa-font .cvaa-style").val(this.getValueOrProp("edgeStyle", this.currentEdgeStyle, "value"));
            this.updatePreview(currentPreset.currentPreset, "text-shadow", this.currentEdgeStyle);

            //set default font color and opacity
            this.currentFontHexColor = currentPreset.fontHexColor;
            this.currentFontOpacity = currentPreset.fontOpacity;
            this.currentFontColor = currentPreset.fontColor;
            $(".cvaa-color .cvaa-color-opacity").val(this.getValueOrProp("opacity", this.currentFontOpacity, "value"));
            $(".cvaa-color .cvaa-btn[value='" + this.getValueOrProp("color", this.currentFontHexColor, "value") + "']").addClass('icvaa-check').siblings().removeClass('icvaa-check');
            this.updatePreview(currentPreset.currentPreset, "color", this.currentFontColor);

            //set default background color and opacity
            this.currentBackgroundHexColor = currentPreset.backgroundHexColor;
            this.currentBackgroundOpacity = currentPreset.backgroundOpacity;
            this.currentBackgroundColor = currentPreset.backgroundColor;
            $(".cvaa-bg .cvaa-bg-opacity").val(this.getValueOrProp("opacity", this.currentBackgroundOpacity, "value"));
            $(".cvaa-bg .cvaa-btn[value='" + this.getValueOrProp("color", this.currentBackgroundHexColor, "value") + "']").addClass('icvaa-check').siblings().removeClass('icvaa-check');
            this.updatePreview(currentPreset.currentPreset, "background-color", this.currentBackgroundColor);

            //set default font size
            this.currentFontSize = currentPreset.fontSize;
            this.currentFontPxSize = currentPreset.fontPxSize;
            $(".cvaa-size .cvaa-btn[value='" + this.getValueOrProp("size", this.currentFontPxSize, "value") + "']").parent().addClass('icvaa-check').siblings().removeClass('icvaa-check');
            this.updatePreview(currentPreset.currentPreset, "font-size", this.currentFontSize);

            //set current preset btn
            $(".cvaa-adv .cvaa-btn[value='" + this.getValueOrProp("presets", currentPreset.currentPreset, "value") + "']").parent().addClass('icvaa-check').siblings().removeClass('icvaa-check');

            //send styles to captions plugin
            this.getPlayer().triggerHelper("newCaptionsStyles", currentPreset);
        },

        updatePreview: function (preset, option, value) {
            if (preset == "custom") {
                this.getPlayer().getInterface().find(".cvaa-adv .custom").css(option, value);
            }

            this.getPlayer().getInterface().find(".cvaa-footer__preview").css(option, value);
        },

        initUpdatePreviewBtn: function (cvaaSettings) {
            if (Object.keys(cvaaSettings).length > 1) {
                this.getPlayer().getInterface().find(".cvaa-adv .custom").show();
                $(".cvaa-adv .cvaa-adv__cstmoptions-btn").html("Edit custom captions");
            }
            this.getPlayer().getInterface().find(".cvaa-adv .custom").css({
                'font-family': cvaaSettings.fontFamily,
                'text-shadow': cvaaSettings.edgeStyle,
                'color': cvaaSettings.fontColor,
                'background-color': cvaaSettings.backgroundColor
            });
        },

        getValueOrProp: function (option, property, type) {
            var cvaaSettings = this.getConfig("cvaaOptions");
            var cvaaOptions = cvaaSettings[option];

            for (var i = 0; i < cvaaOptions.length; i++) {
                if (cvaaOptions && cvaaOptions[i][type] == property) {
                    return type == "prop" ? cvaaOptions[i].value : cvaaOptions[i].prop;
                }
            }
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
            this.getPlayer().setCookie('cvaaSettings', JSON.stringify(this.cvaaSettings), {
                expires: 356,
                path: '/',
                domain: ''
            });
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
                'cvaaOptions': this.getConfig("cvaaOptions")
            };
        },

        isSafeEnviornment: function () {
            return !mw.isIphone() && !mw.isIE8();
        }
    });

})(window.mw, window.jQuery);