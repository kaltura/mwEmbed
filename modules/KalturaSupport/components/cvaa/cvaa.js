(function (mw, $) {
    "use strict";

    mw.closedCaptions = mw.closedCaptions || {};

    mw.closedCaptions.cvaa = mw.KBaseScreen.extend({

        defaultConfig: {
            templatePath: 'components/cvaa/cvaa.tmpl.html',
            usePreviewPlayer: false,
            previewPlayerEnabled: false,
            useCookie: true,
            cvaaPresetDefault: {
                fontFamily: "Arial, Roboto, Arial Unicode Ms, Helvetica, Verdana, PT Sans Caption, sans-serif",
                fontColor: "#ffffff",
                fontOpacity: 100,
                fontSize: 12,
                backgroundColor: "#000000",
                backgroundOpacity: 0,
                edgeStyle: "none"
            },
            cvaaPreset1: {
                fontFamily: "Arial, Roboto, Arial Unicode Ms, Helvetica, Verdana, PT Sans Caption, sans-serif",
                fontColor: "#000000",
                fontOpacity: 100,
                fontSize: 12,
                backgroundColor: "#ffffff",
                backgroundOpacity: 100,
                edgeStyle: "none"
            },
            cvaaPreset2: {
                fontFamily: "Arial, Roboto, Arial Unicode Ms, Helvetica, Verdana, PT Sans Caption, sans-serif",
                fontColor: "#ffff00",
                fontOpacity: 100,
                fontSize: 12,
                backgroundColor: "#000000",
                backgroundOpacity: 100,
                edgeStyle: "none"
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
        firstInit: true,

        cvaaSavedSettings: {},
        cvaaSentSettings: {},

        currentFontFamily: "",
        currentFontColor: "",
        currentFontOpacity: null,
        currentFontSize: null,
        currentBackgroundColor: "",
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
                _this.initPreviewUpdate();
            });

            this.bind('openCvaaOptions', function () {
                _this.getScreen().then(function (screen) {
                    _this.toggleScreen();
                });
            });

            this.bind('preShowScreen', function (event, screenName) {

                _this.initPreviewUpdate();
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

        getCurrentSettings: function (template) {
            if ( this.getConfig('useCookie') && $.cookie('cvaaSavedSettings') ) {
                this.cvaaSentSettings = JSON.parse($.cookie('cvaaSavedSettings'));
            } else {
                var currentTemplate = template ? this.getConfig(template) : this.getConfig("cvaaPresetDefault");
                this.cvaaSentSettings = $.extend(true, {}, currentTemplate);
            }

            if ( this.firstInit ) {
                this.firstInit = false;
                this.cvaaSavedSettings = $.extend(true, {}, this.cvaaSentSettings);
            }
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
                    this.previousScreen = "cvaa-main";
                    break;

                case "cvaa-cstm":
                    this.previousScreen = "cvaa-adv";
                    break;
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

            var presets = [
                { name: "cvaaPresetDefault", btnClass: "default"},
                { name: "cvaaPreset1", btnClass: "preset1"},
                { name: "cvaaPreset2", btnClass: "preset2"}];

            //presets
            $.each(presets, function (index, preset) {
                $(".cvaa-adv ." + preset.btnClass).on("click keydown", function () {
                    if (event.which === 32 || event.which === 13 || event.type == "click") {
                        $(this).addClass('icvaa-check').siblings().removeClass('icvaa-check');
                        _this.templateCvaaSettings(preset.name);
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
            var selectedItem;
            switch (option) {
                case "cvaa-font":
                    selectedItem = this.getValueOrProp("family", value, "prop");
                    this.updatePreview("text", "font-family", selectedItem);
                    this.cvaaSentSettings.fontFamily = selectedItem;
                    this.cvaaSavedSettings.fontFamily = selectedItem;
                    break;
                case "cvaa-style":
                    selectedItem = this.getValueOrProp("edgeStyle", value, "prop");
                    this.updatePreview("text", "text-shadow", selectedItem);
                    this.cvaaSentSettings.edgeStyle = selectedItem;
                    this.cvaaSavedSettings.edgeStyle = selectedItem;
                    break;
                case "cvaa-color":
                    this.currentFontColor = this.getValueOrProp("color", value, "prop");
                    selectedItem = this.rgb2rgba(this.hex2rgb(this.currentFontColor), this.currentFontOpacity);
                    this.updatePreview("text", "color", selectedItem);
                    this.cvaaSentSettings.fontColor = selectedItem;
                    this.cvaaSavedSettings.fontColor = this.currentFontColor;
                    break;
                case "cvaa-color-opacity":
                    this.currentFontOpacity = this.getValueOrProp("opacity", value, "prop");
                    selectedItem = this.rgb2rgba(this.hex2rgb(this.currentFontColor), this.currentFontOpacity);
                    this.updatePreview("text", "color", selectedItem);
                    this.cvaaSentSettings.fontColor = selectedItem;
                    this.cvaaSavedSettings.fontOpacity = this.currentFontOpacity;
                    break;
                case "cvaa-bg":
                    this.currentBackgroundColor = this.getValueOrProp("color", value, "prop");
                    selectedItem = this.rgb2rgba(this.hex2rgb(this.currentBackgroundColor), this.currentBackgroundOpacity);
                    this.updatePreview("text", "background-color", selectedItem);
                    this.cvaaSentSettings.backgroundColor = selectedItem;
                    this.cvaaSavedSettings.backgroundColor = this.currentBackgroundColor;
                    break;
                case "cvaa-bg-opacity":
                    this.currentBackgroundOpacity = this.getValueOrProp("opacity", value, "prop");
                    selectedItem = this.rgb2rgba(this.hex2rgb(this.currentBackgroundColor), this.currentBackgroundOpacity);
                    this.updatePreview("text", "background-color", selectedItem);
                    this.cvaaSentSettings.backgroundColor = selectedItem;
                    this.cvaaSavedSettings.backgroundOpacity = this.currentBackgroundOpacity;
                    break;
                case "cvaa-size":
                    this.currentFontSize = this.getValueOrProp("size", value, "prop");
                    this.updatePreview("text", "font-size", this.getFontSize(this.currentFontSize));
                    this.cvaaSentSettings.fontSize = this.getFontSize(this.currentFontSize);
                    this.cvaaSavedSettings.fontSize = this.currentFontSize;
                    break;
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

        initPreviewUpdate: function () {
            var _this = this;

            //set default font family
            _this.currentFontFamily = _this.cvaaSavedSettings.fontFamily;
            $(".cvaa-font .cvaa-family").val(_this.getValueOrProp("family", _this.cvaaSentSettings.fontFamily, "value"));
            _this.updatePreview("text", "font-family", _this.cvaaSentSettings.fontFamily);

            //set default edge style - text shadow
            _this.currentEdgeStyle = _this.cvaaSavedSettings.edgeStyle;
            $(".cvaa-font .cvaa-style").val(_this.getValueOrProp("edgeStyle", _this.cvaaSentSettings.edgeStyle, "value"));
            _this.updatePreview("text", "text-shadow", _this.cvaaSentSettings.edgeStyle);

            //set default font color and opacity
            _this.currentFontColor = _this.cvaaSavedSettings.fontColor;
            _this.currentFontOpacity = _this.cvaaSavedSettings.fontOpacity;
            $(".cvaa-color .cvaa-color-opacity").val(_this.getValueOrProp("opacity", _this.currentFontOpacity, "value"));
            _this.cvaaSentSettings.fontColor = _this.rgb2rgba(_this.hex2rgb(_this.currentFontColor), _this.currentFontOpacity);
            $(".cvaa-color .cvaa-btn[value='" + _this.getValueOrProp("color", _this.cvaaSavedSettings.fontColor, "value") + "']").addClass('icvaa-check').siblings().removeClass('icvaa-check');
            _this.updatePreview("text", "color", _this.cvaaSentSettings.fontColor);

            //set default background color and opacity
            _this.currentBackgroundColor = _this.cvaaSavedSettings.backgroundColor;
            _this.currentBackgroundOpacity = _this.cvaaSavedSettings.backgroundOpacity;
            $(".cvaa-bg .cvaa-bg-opacity").val(_this.getValueOrProp("opacity", _this.currentBackgroundOpacity, "value"));
            _this.cvaaSentSettings.backgroundColor = _this.rgb2rgba(_this.hex2rgb(_this.currentBackgroundColor), _this.currentBackgroundOpacity);
            $(".cvaa-bg .cvaa-btn[value='" + _this.getValueOrProp("color", _this.cvaaSavedSettings.backgroundColor, "value") + "']").addClass('icvaa-check').siblings().removeClass('icvaa-check');
            _this.updatePreview("text", "background-color", _this.cvaaSentSettings.backgroundColor);

            //set default font size
            _this.currentFontSize = _this.cvaaSavedSettings.fontSize;
            _this.cvaaSentSettings.fontSize = this.getFontSize(_this.currentFontSize);
            $(".cvaa-size .cvaa-btn[value='" + _this.getValueOrProp("size", _this.cvaaSavedSettings.fontSize, "value") + "']").parent().addClass('icvaa-check').siblings().removeClass('icvaa-check');
            _this.updatePreview("text", "font-size", _this.cvaaSentSettings.fontSize);

            //send styles to captions plugin
            _this.getPlayer().triggerHelper("newCaptionsStyles", _this.cvaaSentSettings);
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
            this.getPlayer().setCookie('cvaaSavedSettings', JSON.stringify(this.cvaaSavedSettings), {
                expires: 356,
                path: '/',
                domain: ''
            });

            this.getPlayer().triggerHelper("newCaptionsStyles", this.cvaaSentSettings);
        },

        templateCvaaSettings: function(template){
            this.getPlayer().setCookie( 'cvaaSavedSettings' ,null , {
                expires : -1,
                path : '/',
                domain : ''
            });

            this.firstInit = true;
            this.getCurrentSettings(template);
            this.initPreviewUpdate();
            this.getPlayer().triggerHelper("newCaptionsStyles", this.cvaaSentSettings);
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