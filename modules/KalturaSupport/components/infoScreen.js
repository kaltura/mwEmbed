( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'infoScreen', mw.KBaseComponent.extend({

		defaultConfig: {
			parent: "topBarContainer",
         	order: 3,
         	align: "right",
         	template: "<div class='pull-left panel'> \
         		<div class='preview'>[PLAYER_PREVIEW]</div> \
         		<div class='views'>{mediaProxy.entry.views|numberWithCommas} Views</div> \
         		</div><div class='pull-left details'> \
         		<div class='created'>Uploaded on {mediaProxy.entry.createdAt|dateFormat}</div> \
         		<div class='description'>{mediaProxy.entry.description}</div></div>"
		},
		setup: function(){
			var _this = this;
			this.bind('playerReady', function(){
				if( _this.$infoScreen ){
					_this.$infoScreen.remove();
				}
			});
		},
		toggleInfoScreen: function(){
			var _this = this;
			var getThumbUrl = function(){
				return kWidget.getKalturaThumbUrl({
					'width': 230,
					'vid_sec': _this.getPlayer().currentTime,
					'partner_id': _this.getPlayer().kpartnerid,
					'uiconf_id': _this.getPlayer().kuiconfid,
					'entry_id': _this.getPlayer().kentryid
				});				
			};

			if( !this.$infoScreen ){
				var template = this.getConfig('template');
				// If we have player preview
				if( template.indexOf('[PLAYER_PREVIEW]') != -1 ){
					var img = '<img class="preview" src="' + getThumbUrl() + '" />';
					template  = template.replace('[PLAYER_PREVIEW]', img);
				}

				this.$infoScreen = $('<div />')
									.addClass( 'screen ' + this.pluginName )
									.append( 
										$('<div class="screen-content" /> ').append(
											$.parseHTML( template )
										)
									)
									.hide();

				this.getPlayer().getVideoHolder().append( this.$infoScreen );				
			}
			// Update thubmbnail url
			if( this.$infoScreen.find('img.preview').length ){
				this.$infoScreen.find('img.preview').attr('src', getThumbUrl());
			}
			// show info screen
			if( this.$infoScreen.is(':visible') ){
				this.getPlayer().restoreComponentsHover();
				this.$infoScreen.hide();
			} else {
				this.getPlayer().disableComponentsHover();
				this.$infoScreen.show();
			}
			return;
		},
		getComponent: function() {
			if( !this.$el ) {			
				this.$el = $( '<button />' )
							.attr( 'title', this.playTitle )
							.addClass( "btn icon-info" + this.getCssClass() )
							.click( this.toggleInfoScreen.bind(this) );
				
			}
			return this.$el;
		}
	}));

} )( window.mw, window.jQuery );