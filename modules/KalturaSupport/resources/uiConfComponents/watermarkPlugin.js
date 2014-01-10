( function( mw, $ ) { "use strict";
	mw.PluginManager.add( 'watermark', mw.KBaseComponent.extend({

		defaultConfig: {
			"parent": "videoHolder",
			"order": "3",
			"cssClass": "bottomLeft",
			"img": null,
			"href": null,
			"padding": null
		},
		isSafeEnviornment: function(){
			return !!this.getConfig('img');
		},
		setup: function(){
			var _this = this;
			this.bind('AdSupport_StartAdPlayback', function(){
				_this.getComponent().hide();
			});
			this.bind('AdSupport_EndAdPlayback', function(){
				_this.getComponent().show();
			});
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
		}
	}));

})( window.mw, jQuery );
