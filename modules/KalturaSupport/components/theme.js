( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'theme', mw.KBaseComponent.extend({

		defaultConfig: {
			'buttonsSize': null,
			'buttonsColor': null,
			'buttonsIconColor': null,
			'sliderColor': null,
			'controlsBkgColor': null,
			'scrubberColor': null,
			'watchedSliderColor':null,
			'bufferedSliderColor':null,
			'timeLabelColor':null,
			'buttonsIconColorDropShadow': null,
			'dropShadowColor': null,
			'applyToLargePlayButton': true
		},

		setup: function( embedPlayer ) {
			this.addBindings();
		},
		addBindings: function() {
			var _this = this;
			// update drop shadow after the layout is ready
			this.bind('layoutBuildDone', function(){
				for (var prop in _this.defaultConfig){
					_this.onConfigChange(prop, _this.getConfig(prop));
				}
				if ( mw.isIE() ){
					$(".btn").not(".playHead").css({'margin-left': 1+'px','margin-right': 1+'px'});
				}
			});
		},
		onConfigChange: function( property, value ){
			if (value != null){
				if (mw.getConfig("EmbedPlayer.EnableMobileSkin") &&  mw.isMobileDevice() && property !== 'buttonsIconColor' && property !== 'applyToLargePlayButton'){
					return;
				}
				switch( property ) {
					case 'applyToLargePlayButton':
						if (!this.getConfig('applyToLargePlayButton')) {
							$(".largePlayBtn").attr("style", "background-color: #222222 !important; color: #ffffff !important");
						} else {
							$(".largePlayBtn").attr("style", "background-color: " + this.getConfig('buttonsColor') + " !important; color: " + this.getConfig('buttonsIconColor') + " !important");
						}
						break;
					case 'buttonsSize':
						$(".controlsContainer, .topBarContainer").css("font-size",value + "px");
						break;
					case 'buttonsColor':
						$(".btn").not(".playHead").attr("style","background-color: " + value + " !important; color: "+ this.getConfig('buttonsIconColor') +" !important; text-shadow: "+ this.getConfig('dropShadowColor') +" !important");
						if (this.getConfig('applyToLargePlayButton')) {
							$(".largePlayBtn").attr("style", "background-color: " + value + " !important; color: "+ this.getConfig('buttonsIconColor') +" !important;");
						}
						break;
					case 'buttonsIconColor':
						if (mw.isMobileDevice()){
							$(".btn:visible").not(".playHead").attr("style","color: " + value + " !important");
							if (this.getConfig('applyToLargePlayButton')) {
								$(".largePlayBtn ").attr("style", "color: " + value + " !important");
							}
						}else{
							$(".btn").not(".playHead").attr("style","color: " + value + " !important; background-color: "+ this.getConfig('buttonsColor') +" !important; text-shadow: "+ this.getConfig('dropShadowColor') +" !important");
							if (this.getConfig('applyToLargePlayButton')) {
								$(".largePlayBtn ").attr("style", "color: " + value + " !important; background-color: " + this.getConfig('buttonsColor') + " !important");
							}
						}
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
					case 'watchedSliderColor':
						$(".watched").attr("style","background-color: " + value + " !important");
						$(".watched").attr("style","background:"  + value + " !important");
						break;
					case 'bufferedSliderColor':
						$(".buffered").attr("style","background-color: " + value + " !important");
						$(".buffered").attr("style","background:"  + value + " !important");
						break;
					case 'timeLabelColor':
						$(".currentTimeLabel").attr("style","color: " + value + " !important");
						$(".durationLabel").attr("style","color:"  + value + " !important");
						break;
					case 'buttonsIconColorDropShadow':
						if (value == true){
							$(".btn").not(".playHead").attr("style","background-color: " + this.getConfig('buttonsColor') + " !important; color: "+ this.getConfig('buttonsIconColor') +" !important; text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8) !important");
							this.dropShadowColor = '1px 1px 1px rgba(0, 0, 0, 0.8)';
						}else{
							$(".btn").not(".playHead").attr("style","background-color: " + this.getConfig('buttonsColor') + " !important; color: "+ this.getConfig('buttonsIconColor') +" !important; text-shadow: 0px 0px 0px rgba(0, 0, 0, 0) !important");
							this.dropShadowColor = '0px 0px 0px rgba(0, 0, 0, 0)';
						}

						break;
				}
			}
		}
	})

	);

} )( window.mw, window.jQuery );