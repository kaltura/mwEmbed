( function( mw, $ ) {"use strict";

	var pluginName = 'playHead';
		// Check if the plugin is enabled:
	mw.addKalturaPlugin( pluginName, function( embedPlayer, callback ){
		new playHeadPlugin( embedPlayer, pluginName );
		// Continue player build-out
		callback();
	});

	var playHeadPlugin = mw.KBaseComponent.extend({
		setup: function( embedPlayer ) {
			// Do stuff
		},
		getSliderConfig: function() {
			var embedPlayer = this.getPlayer();
			return {
				range: "min",
				value: 0,
				min: 0,
				max: 1000,
				// we want less than monitor rate for smoth animation
				animate: mw.getConfig( 'EmbedPlayer.MonitorRate' ) - ( mw.getConfig( 'EmbedPlayer.MonitorRate' ) / 30 ) ,
				start: function( event, ui ) {
					var id = ( embedPlayer.pc != null ) ? embedPlayer.pc.pp.id:embedPlayer.id;
					embedPlayer.userSlide = true;
					$( id + ' .play-btn-large' ).fadeOut( 'fast' );
					// If playlist always start at 0
					embedPlayer.startTimeSec = ( embedPlayer.instanceOf == 'mvPlayList' ) ? 0:
									mw.npt2seconds( embedPlayer.getTimeRange().split( '/' )[0] );
				},
				slide: function( event, ui ) {
					var perc = ui.value / 1000;
					// always update the title 
					$( this ).find('.ui-slider-handle').attr('data-title', mw.seconds2npt( perc * embedPlayer.getDuration() ) );
					
					embedPlayer.jumpTime = mw.seconds2npt( parseFloat( parseFloat( embedPlayer.getDuration() ) * perc ) + embedPlayer.startTimeSec );
					// mw.log('perc:' + perc + ' * ' + embedPlayer.getDuration() + ' jt:'+ this.jumpTime);
					if ( _this.longTimeDisp ) {
						ctrlObj.setStatus( gM( 'mwe-embedplayer-seek_to', embedPlayer.jumpTime ) );
					} else {
						ctrlObj.setStatus( embedPlayer.jumpTime );
					}
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

						// set seek time (in case we have to do a url seek)
						embedPlayer.seekTimeSec = mw.npt2seconds( embedPlayer.jumpTime, true );
						mw.log( 'PlayerLayoutBuilder:: seek to: ' + embedPlayer.jumpTime + ' perc:' + perc + ' sts:' + embedPlayer.seekTimeSec );
						ctrlObj.setStatus( gM( 'mwe-embedplayer-seeking' ) );
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
				this.$el = $( '<div />' ).addClass ( "Slider" ).slider( this.getSliderConfig() );
				// Up the z-index of the default status indicator:
				this.$el.find( '.ui-slider-handle' ).attr('data-title', mw.seconds2npt( 0 ) );
				// Add buffer and watched html:
				this.$el.append(
					$('<div />').addClass( "buffered"),
					$('<div />').addClass( "watched")
				);				
			}
			return this.$el;
		}
	});

} )( window.mw, window.jQuery );