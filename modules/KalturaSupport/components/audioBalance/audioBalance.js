( function( mw, $ ) {"use strict";
	
	mw.PluginManager.add( 'audioBalance', mw.KBaseComponent.extend({
			
		defaultConfig: {
			"align": "right",
			"parent": "controlsContainer",
			"order": 61,
			"showTooltip": true,
			"displayImportance": "high",
			"step": "0.05",
			"value": "0"
		},
		context:null,
		panner:null,
		source:null,
		isSafeEnviornment: function () {
			return !( mw.isIE() || mw.isIphone() || mw.isIOS() || mw.isDesktopSafari() );
		},
		setup: function() {
			this.addBindings();
		},
		addBindings: function() {
			var _this = this;
			this.bind('firstPlay', function(){
				var video = $(_this.getPlayer().getVideoDisplay()).find('video')[0];
				_this.audioBalance(video);
			});
			
		},
		
		audioBalance:function (video) {
			var _this = this;
			
			if (!this.context || !this.panner || !this.source) {
				this.context = new (window.AudioContext || window.webkitAudioContext)();
				this.panner = this.context.createStereoPanner();
				this.source = this.context.createMediaElementSource(video);
			}
			var balanceSlider = this.getComponent().find('.balanceSlider')[0];
			this.source.connect(this.panner);
			this.panner.connect(this.context.destination);
			this.panner.pan.value = balanceSlider.value;
			balanceSlider.oninput = function() {
				_this.panner.pan.value = this.value;
			};
		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				var input = $( '<input />' )
					.attr({
						type:'range',
						min:'-1',
						max:'1',
						value:_this.getConfig('value'),
						step:_this.getConfig('step')
					}).addClass('balanceSlider');
				var left = $('<span />').addClass('balancePosition').append('L');
				var right = $('<span />').addClass('balancePosition').append('R');
				
				this.$el = $( '<div />' ).addClass(this.getCssClass())
							.append( left, input, right );
			}
			return this.$el;
		}
	})
);
	
} )( window.mw, window.jQuery );
