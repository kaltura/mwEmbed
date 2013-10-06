( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'related', mw.KBaseComponent.extend({

		defaultConfig: {
			parent: "topBarContainer",
         	order: 4,
         	align: "right",
         	template: "<li class='relatedItems'></li>",
         	itemTemplate: "<li>{name}<img src='{thumbnailUrl}' /></li>",
         	playlistId: "0_dk33j8kb",         	
		},
		$screen: null,
		setup: function(){
			var _this = this;

			// Add template (mw.TemplateManager.js)
			mw.tm.register('related_item', this.getConfig('itemTemplate', true));

			this.bind('playerReady', function(){
				_this.getItemsData(function(){
					if( _this.$screen ){
						_this.$screen.remove();
					}
				});
			});
		},
		getItemsData: function( callback ){
			if( !this.itemsData ){
				var _this = this;
				this.getKalturaClient().doRequest( {
					'service' : 'playlist',
					'action' : 'execute',
					'id' : this.getConfig( 'playlistId' )
				}, function( data ){
					_this.itemsData = data;
					callback();
				});
				return;
			}
			callback();
			return;
		},
		getItems: function(){
			var itemsHTML = '';
			$.each(this.itemsData, function(){
				itemsHTML += mw.tm.compile( 'related_item', this);
			})
			return itemsHTML;
		},
		hide: function(){
			this.opened = false;
			this.getScreen().hide();
		},
		show: function(){
			this.opened = true;
			this.getScreen().show();
		},
		toggle: function(){
			if( this.opened ){
				this.hide();
			} else {
				this.show();
			}
		},		
		getScreen: function(){
			if( ! this.$screen ){
				var _this = this;
				this.$screen = $('<div />')
									.addClass( 'screen ' + this.pluginName )
									.append( 
										$('<div class="screen-content" /> ').append(
											$('<ul />').append( _this.getItems() )
										)
									)
									.hide();

				this.getPlayer().getVideoHolder().append( this.$screen );
			}
			return this.$screen;
		},
		getComponent: function() {
			if( !this.$el ) {	
				var _this = this;
				this.$el = $( '<button />' )
							.attr( 'title', this.playTitle )
							.addClass( "btn icon-related" + this.getCssClass() )
							.click( function(){
								_this.toggle();
							});
				
			}
			return this.$el;
		}
	}));

} )( window.mw, window.jQuery );