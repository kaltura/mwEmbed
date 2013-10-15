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
         	nextItemText: "Next: {mediaProxy.entry.name} in <span class='time'>{related.timeRemaining|timeFormat}</span>",
         	template: '<% _.each(items, function(item, idx) { %> \
         					<% if( idx == 0 ) { var className = "medium"; } else { var className = "small"; } %> \
         					<div class="item <%=className%>" data-entryid="<%=item.id%>"><div class="item-inner"> \
         					<div class="title"><%=item.name%></div> \
         					<img src="<%=item.thumbnailUrl%>/width/350" /></div></div><% }); %>',
         	playlistId: null,         	
		},
		$screen: null,
		setup: function(){
			var _this = this;

			// Underscore templates
			this.template = _.template( this.getConfig('template', true) );

			this.bind('playerReady', function(){
				_this.itemsData = null;
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
					//_this.startTimer();
				});				
			}
		},
		getItemsData: function( callback ){
			if( !this.itemsData ){
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
					_this.itemsData = data;					
					callback();
				});
				return;
			}
			callback();
			return;
		},
		getItems: function(){
			return this.template({items: this.itemsData});
		},
		selectItem: function( $item ){
			if( !$item.find('.title').is(':visible') ){
				this.getScreen().find('.item').removeClass('hover');
				$item.addClass('hover');
				return false;
			}
			var entryId = $item.data('entryid');
			this.getPlayer().sendNotification('relatedVideoSelect', {entryId: entryId});
			this.getPlayer().sendNotification('changeMedia', {entryId: entryId});
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

				this.$screen.find('.item').hover(function(){
					$( this ).addClass('hover');
				},function(){
					$( this ).removeClass('hover');
				});

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