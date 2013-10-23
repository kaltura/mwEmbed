( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'related', mw.KBaseComponent.extend({

		defaultConfig: {
			parent: "topBarContainer",
			order: 4,
			align: "right",
			//visible: false,
			itemsLimit: 12,
			displayOnPlaybackDone: true,
			autoContinueTime: null,
			template: '<div class="item featured" data-entryid="<%=nextItem.id%>"><div class="item-inner"> \
						<div class="title"><% if( plugin.getConfig(\'autoContinueTime\') ) { %>Next <span class="time">in: <span class="remaining">{related.timeRemaining|timeFormat}</span></span><br /><% } %><%=nextItem.name%></div> \
						<img src="<%=nextItem.thumbnailUrl%>/width/350" /></div></div> \
						<% $.each(moreItems, function(idx, item) { %> \
						<div class="item small" data-entryid="<%=item.id%>"><div class="item-inner"> \
						<div class="title"><%=item.name%></div> \
						<img src="<%=item.thumbnailUrl%>/width/350" /></div></div><% }); %>',
			playlistId: null,
		},
		$screen: null,
		setup: function(){
			var _this = this;

			this.bind('playerReady', function(){
				// Set remaining time to auto continue time
				_this.setConfig('timeRemaining', _this.getConfig('autoContinueTime'));

				// Reset our items data
				_this.templateData = null;

				// Load items data
				_this.getItemsData(function(){
					if( _this.$screen ){
						_this.$screen.remove();
						_this.$screen = null;
					}
				});
			});

			this.bind('onplay', function(){
				_this.hide();
			});

			if( this.getConfig('displayOnPlaybackDone') ){
				this.bind('onEndedDone', function(){
					_this.show();
					if( _this.getConfig('autoContinueTime') ){
						_this.setupTimer();
					}
				});				
			}
		},
		setupTimer: function(){
			var _this = this;
			var timer = setInterval(function(){
				var ct = _this.getConfig('timeRemaining');
				if( ct > 0 ){
					_this.setConfig('timeRemaining', --ct);
				} else {
					clearInterval(timer);
					_this.changeMedia( _this.templateData.nextItem.id );
				}
			}, 1000);
		},
		getItemsData: function( callback ){
			if( !this.templateData ){
				var _this = this;
				this.getKalturaClient().doRequest( {
					'service' : 'playlist',
					'action' : 'execute',
					'id' : this.getConfig( 'playlistId' ),
					'filter:objectType': 'KalturaMediaEntryFilterForPlaylist',
					'filter:idNotIn': this.getPlayer().kentryid,
					'filter:limit': this.getConfig('itemsLimit')
				}, function( data ){
					// Check if we got error
					if( data.code && data.message ){
						_this.log('Error getting related items: ' + data.message);
						_this.getBtn().hide();
					}
					var nextItem = data.splice(0,1);
					_this.templateData = {
						nextItem: nextItem[0],
						moreItems: data
					};
					callback();
				});
				return;
			}
			callback();
			return;
		},
		getItems: function(){
			return this.getTemplateHTML('template', this.templateData);
		},
		selectItem: function( $item ){
			if( !$item.find('.title').is(':visible') ){
				this.getScreen().find('.item').removeClass('hover');
				$item.addClass('hover');
				return false;
			}

			this.changeMedia( $item.data('entryid') );
		},
		changeMedia: function( entryId ){
			var _this = this;
			this.getPlayer().sendNotification('relatedVideoSelect', {entryId: entryId});
			this.getPlayer().sendNotification('changeMedia', {entryId: entryId});
			this.bind('onChangeMediaDone', function(){
				_this.getPlayer().play();
				_this.unbind('onChangeMediaDone');
			})
			this.hide();
		},
		hide: function(){
			this.opened = false;
			this.getScreen().hide();
			if( this.wasPlaying ){
				this.getPlayer().play();
				this.wasPlaying = false;
			}
			this.getPlayer().restoreComponentsHover();
		},
		show: function(){
			this.opened = true;
			this.wasPlaying = this.getPlayer().isPlaying();
			if( this.wasPlaying ) {
				this.getPlayer().pause();
			}
			this.getPlayer().disableComponentsHover();
			this.getScreen().show();
		},
		toggle: function(){
			if( this.opened ){
				this.hide();
			} else {
				this.show();
			}
		},
		onConfigChange: function( property, value ){
			if( property == 'timeRemaining' ){
				var timeFormat = mw.KDPMapping.prototype.formatFunctions.timeFormat;
				this.getScreen().find('.remaining').html(timeFormat(value));
			}
			this._super( property, value );
		},
		getScreen: function(){
			if( ! this.$screen ){
				var _this = this;
				this.$screen = $('<div />')
									.addClass( 'screen ' + this.pluginName )
									.append( 
										$('<div class="screen-content" /> ').append(
											_this.getItems()
										)
									)
									.hide();

				var $items = this.$screen.find('.item').click(function(){
					_this.selectItem( $(this) );
				});

				// Add hover events only if device support mouse events
				if( mw.hasMouseEvents() ){
					$items.hover(function(){
						$( this ).addClass('hover');
					},function(){
						$( this ).removeClass('hover');
					});
				}

				this.getPlayer().getVideoHolder().append( this.$screen );
			}
			return this.$screen;
		},
		getComponent: function() {
			if( !this.$el ) {	
				var _this = this;
				this.$el = $( '<button />' )
							.attr( 'title', 'Related' )
							.addClass( "btn icon-related" + this.getCssClass() )
							.click( function(){
								_this.toggle();
							});
				
			}
			return this.$el;
		}
	}));

} )( window.mw, window.jQuery );