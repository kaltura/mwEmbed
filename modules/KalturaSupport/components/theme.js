( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'theme', mw.KBaseComponent.extend({

		defaultConfig: {
			'buttonsSize': null,
			'buttonsColor': null,
            'buttonsIconColor': null,
			'sliderColor': null,
			'controlsBkgColor': null,
			'scrubberColor': null
		},

		setup: function( embedPlayer ) {
			//setup
		},
        onConfigChange: function( property, value ){
            if (value){
                switch( property ) {
                    case 'buttonsSize':
                        $("body").css("font-size",value + "px");
                        break;
                    case 'buttonsColor':
                        $(".btn").attr("style","background-color: " + value + " !important; color: "+ this.getConfig('buttonsIconColor') +" !important");
                        break;
                    case 'buttonsIconColor':
                        $(".btn").attr("style","color: " + value + " !important; background-color: "+ this.getConfig('buttonsColor') +" !important");
                        break;
                    case 'sliderColor':
                        $(".ui-slider").attr("style","background-color: " + value + " !important");
                        break;
                    case 'controlsBkgColor':
                        $(".controlsContainer").attr("style","background-color: " + value + " !important");
                        $(".controlsContainer").attr("style","background: " + value + " !important");
                        break;
                    case 'scrubberColor':
                        $(".playHead").attr("style","background-color: " + value + " !important");
                        $(".playHead").attr("style","background:"  + value + " !important");
                        break;
                }
            }
        }
	})

	);

} )( window.mw, window.jQuery );