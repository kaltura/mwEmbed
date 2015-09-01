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
			return !!this.getConfig('img');
		},
		setup: function(){
			var _this = this;
			// support legacy position config: 
			if( this.getConfig('watermarkPosition') ){
				this.setConfig('cssClass', this.getConfig('watermarkPosition'));
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

			};
		},
		getComponent: function(){
			var _this = this;
			if(!this.$el){
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
								.append(
									$('<img />').attr({
										'src': this.getConfig('img')
									})
								)
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
