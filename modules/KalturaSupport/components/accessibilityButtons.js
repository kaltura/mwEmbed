( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'accessibilityButtons', mw.KBaseComponent.extend({

		defaultConfig: {
			'parent': 'controlsContainer',
			'order': 2,
			'showTooltip': false,
			'displayImportance': "high",
			'layout': "horizontal",
			'seekTime': 5,
			'canSeek': false,
			'positionBtn': true,
			'forwardBtn': true,
			'backwardBtn': true
		},

		seekForward: gM( 'mwe-embedplayer-seek_forward' ),
		seekBackward: gM( 'mwe-embedplayer-seek_backward' ),
		currentTime: gM( 'mwe-embedplayer-current_time' ),

		setup: function( embedPlayer ) {
			this.addBindings();
		},
		addBindings: function() {
			var _this = this;
			if (this.getConfig('positionBtn')){
				this.bind( 'updatePlayHeadPercent', function( e, perc ){
					var positionButton = _this.getAccessibilityBtn('positionBtn');
					positionButton.attr('title', _this.currentTime + mw.seconds2npt( perc * _this.embedPlayer.getDuration()));
					_this.setAccessibility(positionButton, _this.currentTime + mw.seconds2npt( perc * _this.embedPlayer.getDuration()));
				});
			}
			this.bind('updateBufferPercent', function(){
				_this.canSeek = true;
			});
		},
		seek: function( direction ){
			// TODO: should be consolidated with the seek method in mw.keyboardShortcuts plugin
			if( !this.canSeek ){
				return false;
			}
			var currentTime = parseFloat(this.getPlayer().currentTime);
			var newCurrentTime = 0;
			if( direction == 'back' ){
				newCurrentTime = currentTime - this.getConfig('seekTime');
				if( newCurrentTime < 0 ){
					newCurrentTime = 0;
				}
			} else {
				newCurrentTime = currentTime + this.getConfig('seekTime');
				if( newCurrentTime > parseFloat(this.getPlayer().getDuration()) ){
					newCurrentTime = parseFloat(this.getPlayer().getDuration());
				}
			}
			this.getPlayer().seek( newCurrentTime / this.getPlayer().getDuration() );
		},
		getCssClass: function() {
			var cssClass = ' comp ' + this.pluginName + ' ';
			switch( this.getConfig( 'align' ) ) {
				case 'right':
					cssClass += " pull-right";
					break;
				case 'left':
					cssClass += " pull-left";
					break;
			}
			if( this.getConfig('cssClass') ) {
				cssClass += ' ' + this.getConfig('cssClass');
			}
			if( this.getConfig('displayImportance') ){
				var importance = this.getConfig('displayImportance').toLowerCase();
				if( $.inArray(importance, ['low', 'medium', 'high']) !== -1 ){
					cssClass += ' display-' + importance;
				}
			}
			return cssClass;
		},
		getAccessibilityBtn : function(id){
			return this.getComponent().find( '.'+id );
		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				var layoutClass = ' ' + this.getConfig('layout');
				this.$el = $('<div />')
					.addClass(this.getCssClass() + layoutClass);

				if (this.getConfig('positionBtn')){
					var positionButton = $( '<button />' )
						.attr( 'title', 'position' )
						.addClass( "btn positionBtn accessibilityButton");
					this.$el.append(positionButton);
				}

				if (this.getConfig('forwardBtn')){
					var forwardButton = $( '<button />' )
						.attr( 'title', _this.seekForward )
						.addClass( "btn accessibilityButton")
						.click( function() {
							_this.seek( 'forward' );
						});
					this.setAccessibility(forwardButton, _this.seekForward);
					this.$el.append(forwardButton);
				}

				if (this.getConfig('backwardBtn')){
					var backwardButton = $( '<button />' )
						.attr( 'title', _this.seekBackward )
						.addClass( "btn accessibilityButton")
						.click( function() {
							_this.seek( 'back' );
						});
					this.setAccessibility(backwardButton, _this.seekBackward);
					this.$el.append(backwardButton);
				}
			}
			return this.$el;
		}
	}));

} )( window.mw, window.jQuery );