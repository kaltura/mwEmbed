( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'playHead', mw.KBaseComponent.extend({
		defaultConfig: {
			'parent': 'controlBarContainer',
			'insertMode': 'firstChild',
			'order': 1
		},
		setup: function( embedPlayer ) {
			this.addBindings();
		},
		addBindings: function() {
			var _this = this;
			// Update buffer bar
			this.bind( 'updateBufferPercent', function( e, bufferedPercent ){
				_this.getComponent().find( '.buffered' ).css({
					"width" : ( bufferedPercent * 100 ) + '%'
				});				
			});
			var lastPlayheadUpdate = 0;
			this.bind( 'updatePlayHeadPercent', function( e, perc ){
				var val = parseInt( perc * 1000 );
				if( lastPlayheadUpdate !== val ){
					lastPlayheadUpdate = val;
					_this.getComponent().slider( 'value', val );
				}
			});
		},
		onEnable: function() {
			this.getComponent().slider( "option", "disabled", false );
		},
		onDisable: function() {
			this.getComponent().slider( "option", "disabled", true );
		},
		getSliderConfig: function() {
			var _this = this;
			var embedPlayer = this.getPlayer();
			return {
				range: "min",
				value: 0,
				min: 0,
				max: 1000,
				// we want less than monitor rate for smoth animation
				animate: mw.getConfig( 'EmbedPlayer.MonitorRate' ) - ( mw.getConfig( 'EmbedPlayer.MonitorRate' ) / 30 ) ,
				start: function( event, ui ) {
					embedPlayer.userSlide = true;
				},
				slide: function( event, ui ) {
					var perc = ui.value / 1000;
					// always update the title 
					$( this ).find('.ui-slider-handle').attr('data-title', mw.seconds2npt( perc * embedPlayer.getDuration() ) );
					
					// Update the thumbnail / frame
					if ( embedPlayer.isPlaying == false ) {
						embedPlayer.updateThumbPerc( perc );
					}
				},
				change: function( event, ui ) {
					var perc = ui.value / 1000;
					// always update the title 
					$( this ).find('.ui-slider-handle').attr('data-title', mw.seconds2npt( perc * embedPlayer.getDuration() ) );
					// Only run the onChange event if done by a user slide
					// (otherwise it runs times it should not)
					if ( embedPlayer.userSlide ) {
						embedPlayer.userSlide = false;
						embedPlayer.seeking = true;

						if( embedPlayer.isStopped() ){
							embedPlayer.play();
						}
						embedPlayer.seek( perc );
					}
				}
			};
		},	
		getComponent: function() {
			if( !this.$el ) {
				this.$el = $( '<div />' ).addClass ( "playHead" ).slider( this.getSliderConfig() );
				// Up the z-index of the default status indicator:
				this.$el.find( '.ui-slider-handle' ).attr('data-title', mw.seconds2npt( 0 ) );
				this.$el.find( '.ui-slider-range-min' ).addClass( 'watched' );
				// Add buffer:
				this.$el.append(
					$('<div />').addClass( "buffered")
				);				
			}
			return this.$el;
		}
	})
	);
	
} )( window.mw, window.jQuery );