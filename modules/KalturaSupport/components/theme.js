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
		isSafeEnviornment: function(){
			return !this.embedPlayer.isMobileSkin();
		},
		addBindings: function() {
			var _this = this;
			// update drop shadow after the layout is ready
			this.bind('layoutBuildDone', function(){
				for (var prop in _this.defaultConfig){
					_this.onConfigChange(prop, _this.getConfig(prop));
				}
				if ( mw.isIE() ){
					$(".btn").not(".playHead").css({'margin-left': 0.2 + 'px','margin-right': 0.2 + 'px'});
				}
			});
		},
		onConfigChange: function( property, value ){
			if (value != null){
				switch( property ) {
					case 'applyToLargePlayButton':
						if (!this.getConfig('applyToLargePlayButton')) {
							$(".largePlayBtn").attr("style", "background-color: #222222 !important; color: #ffffff !important");
						} else {
							$(".largePlayBtn").attr("style", "background-color: " + this.getConfig('buttonsColor') + " !important; color: " + this.getConfig('buttonsIconColor') + " !important");
						}
						break;
					case 'buttonsSize':
						if (!this.embedPlayer.isMobileSkin()){
							$(".controlsContainer, .topBarContainer").css("font-size",value + "px");
						}
						break;
					case 'buttonsColor':
						if (!this.embedPlayer.isMobileSkin()){
							$(".btn").not(".playHead").attr("style","background-color: " + value + " !important; color: "+ this.getConfig('buttonsIconColor') +" !important; text-shadow: "+ this.getConfig('dropShadowColor') +" !important");
						}
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
							$(".btn").not(".playHead").attr("style","color: " + value + " !important; text-shadow: "+ this.getConfig('dropShadowColor') +" !important");
							if (!this.embedPlayer.isMobileSkin()){
								$(".btn").not(".playHead").attr("style","background-color: "+ this.getConfig('buttonsColor') +" !important;" +"color: " + value + " !important; text-shadow: "+ this.getConfig('dropShadowColor') +" !important");
							}
							if (this.getConfig('applyToLargePlayButton')) {
								$(".largePlayBtn ").attr("style", "color: " + value + " !important; background-color: " + this.getConfig('buttonsColor') + " !important");
							}
						}
						break;
					case 'sliderColor':
						$(".ui-slider").attr("style","background-color: " + value + " !important");
						break;
					case 'controlsBkgColor':
						$(".mwPlayerContainer:not(.mobileSkin)").find(".controlsContainer").css({
							"background": value,
							"background-color": value,
						});
						break;
					case 'scrubberColor':
						$(".mwPlayerContainer:not(.mobileSkin)").find(".playHead").attr("style","background-color: " + value + " !important");
						$(".mwPlayerContainer:not(.mobileSkin)").find(".playHead").attr("style","background:"  + value + " !important");
						$(".mwPlayerContainer.mobileSkin").find(".playHead").attr("style","background: radial-gradient(ellipse at center, "  + value.replace('rgb','rgba').replace(')',',1)') + "0%," + value.replace('rgb','rgba').replace(')',',1)') + "30%," + value.replace('rgb','rgba').replace(')',',0)') + "31%," + value.replace('rgb','rgba').replace(')',',0)') +  "100% !important");
						$(".mwPlayerContainer.mobileSkin").find(".playHead.ui-state-active").attr("style","background: radial-gradient(ellipse at center, "  + value.replace('rgb','rgba').replace(')',',1)') + "0%," + value.replace('rgb','rgba').replace(')',',1)') + "30%," + value.replace('rgb','rgba').replace(')',',0.3)') + "31%," + value.replace('rgb','rgba').replace(')',',0.3)') +  "100% !important");
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
							$(".btn").not(".playHead").attr("style","color: "+ this.getConfig('buttonsIconColor') +" !important; text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8) !important");
							if (!this.embedPlayer.isMobileSkin()){
								$(".btn").not(".playHead").attr("style","background-color: " + this.getConfig('buttonsColor') + " !important; color: "+ this.getConfig('buttonsIconColor') +" !important; text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8) !important");
							}
							this.dropShadowColor = '1px 1px 1px rgba(0, 0, 0, 0.8)';
						}else{
							$(".btn").not(".playHead").attr("style","color: "+ this.getConfig('buttonsIconColor') +" !important; text-shadow: 0px 0px 0px rgba(0, 0, 0, 0) !important");
							if (!this.embedPlayer.isMobileSkin()){
								$(".btn").not(".playHead").attr("style","background-color: " + this.getConfig('buttonsColor') + " !important; color: "+ this.getConfig('buttonsIconColor') +" !important; text-shadow: 0px 0px 0px rgba(0, 0, 0, 0) !important");
							}
							this.dropShadowColor = '0px 0px 0px rgba(0, 0, 0, 0)';
						}

						break;
				}
			}
		}
	})

	);

} )( window.mw, window.jQuery );
