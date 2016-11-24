( function( mw, $ ) { "use strict";
	mw.PluginManager.add( 'watermark', mw.KBaseComponent.extend({

		defaultConfig: {
			"parent": "videoHolder",
			"order": "3",
			"cssClass": "bottomLeft",
			"img": null,
			"href": null,
			"padding": null,
			"hideTimeout": 0
		},
		isSafeEnviornment: function(){
			return this.getConfig('img') || this.getConfig('watermarkPath');
		},
		setup: function(){
			var _this = this;
			// support legacy position config: 
			if( this.getConfig('watermarkPosition') ){
				this.setConfig('cssClass', this.getConfig('watermarkPosition'));
			}
			// support legacy path config:
			if( this.getConfig('watermarkPath') ){
				this.setConfig('img', this.getConfig('watermarkPath'));
			}
			this.bind('AdSupport_StartAdPlayback', function(){
				_this.getComponent().hide();
			});
			this.bind('AdSupport_EndAdPlayback', function(){
				_this.getComponent().show();
			});

			if( this.getConfig('hideTimeout') != 0 ){

				this.bind('onChangeMediaDone playerReady', function(){
					_this.getComponent().show();
						_this.timeoutWatermark();
				});

			}
		},
		watermarkLoaded: function(){
			this.getPlayer().triggerHelper("waterMarkLoaded", [this.getComponent().get(0)]);
		},
		getComponent: function(){
			var _this = this;
			if(!this.$el){
				var img = $('<img />')
					.one("load", function(){
						_this.watermarkLoaded();
					})
					.attr({
						'src': this.getConfig('img')
					});
				this.$el = $('<div />')
							.addClass ( this.getCssClass() )
							.append(
								$('<a />').attr({
									'href' : this.getConfig('href'),
									'target' : '_blank'
								})
								.click( function(){
									_this.getPlayer().sendNotification( 'watermarkClick' );
									return true;
								})
								.append(img)
							);
				if( this.getConfig('padding') ){
					this.$el.css('padding', this.getConfig('padding') );
				}
			}
			return this.$el;
		},
		timeoutWatermark: function(){
			var _this = this;
			this.bind('firstPlay', function() {
				setTimeout(function () {
					_this.$el.fadeOut("slow");
				}, _this.getConfig('hideTimeout') * 1000)
			});
		}
	}));

})( window.mw, jQuery );
