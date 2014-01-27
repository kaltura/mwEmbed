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
            switch( property ) {
                case 'buttonsSize':
                    if( value ) {
                        $("body").css("font-size",value + "px");
                    }
                    break;
                case 'buttonsColor':
                    if( value ) {
                        $(".btn").attr("style","background-color:" + value + " !important");
                    }
                    break;
                case 'buttonsIconColor':
                    if( value ) {
                        $(".btn").attr("style","color:" + value + " !important");
                    }
                    break;
                case 'sliderColor':
                    if( value ) {
                        $(".ui-slider").attr("style","background-color:" + value + " !important");
                    }
                    break;
                case 'controlsBkgColor':
                    if( value ) {
                        $(".controlsContainer").attr("style","background-color:" + value + " !important");
                        $(".controlsContainer").attr("style","background:" + value + " !important");
                    }
                    break;
                case 'scrubberColor':
                    if( value ) {
                        $(".playHead").attr("style","background-color:" + value + " !important");
                        $(".playHead").attr("style","background:" + value + " !important");
                    }
                    break;
            }
        }
	})

	);

} )( window.mw, window.jQuery );