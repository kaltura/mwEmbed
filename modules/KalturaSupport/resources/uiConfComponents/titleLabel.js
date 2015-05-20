( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'titleLabel', mw.KBaseComponent.extend({
		defaultConfig: {
			"parent": "topBarContainer",
			"order": 1,
			"align": "left",
			"text": '{mediaProxy.entry.name}',
			"truncateLongTitles": true
		},
		setup: function(){
			var _this = this;
			this.bind('playerReady', function(){
				// Update title to entry name
				_this.getComponent().text( 
					_this.getConfig('text')
				);
				var availableWidth = _this.getAvailableWidth(); // available width for title including buttons space and extra space for clarity
				if (_this.getConfig('truncateLongTitles') && _this.getComponent().width() >= availableWidth) {
					_this.getComponent()
						.attr('title', _this.getConfig('text'))
						.width(availableWidth)
						.addClass('truncateText');
				}
			});

			this.bind('layoutBuildDone', function(){
					var availableWidth = _this.getAvailableWidth(); // available width for title including buttons space and extra space for clarity
					if (_this.getConfig('truncateLongTitles') && _this.getComponent().width() >= availableWidth) {
						_this.getComponent()
							.attr('title', _this.getConfig('text'))
							.width(availableWidth)
							.css('text-align',_this.getConfig('align'))
							.addClass('truncateText');
					} else {
						_this.getComponent()
							.attr('title', _this.getConfig('text'))
							.width(availableWidth)
							.css('text-align',_this.getConfig('align'))
							.removeClass('truncateText');
					}
				}
			);
		},
		getAvailableWidth:function(){
			return this.embedPlayer.getWidth() - ($('.' + this.getConfig('parent') + ' .btn').length + 1) * 30;
		},
		getComponent: function() {
			if( !this.$el ) {
				this.$el = $( '<div />' )
							.addClass ( this.getCssClass() );
			}
			return this.$el;
		}
	}));

})( window.mw, window.jQuery );