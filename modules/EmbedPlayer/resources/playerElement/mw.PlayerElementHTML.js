( function( mw, $ ) {"use strict";

// Class defined in resources/class/class.js
	mw.PlayerElementHTML = mw.PlayerElement.extend({
		nativeEvents : [
			'loadstart',
			'progress',
			'suspend',
			'abort',
			'error',
			'emptied',
			'stalled',
			'play',
			'pause',
			'loadedmetadata',
			'loadeddata',
			'waiting',
			'playing',
			'canplay',
			'canplaythrough',
			'seeking',
			'seeked',
			'timeupdate',
			'ended',
			'ratechange',
			'durationchange',
			'volumechange'
		],
		init: function( containerId , playerId  ){

			//check if we already have the video id
			var $videoElement = $("#" + playerId);
			if ( !$videoElement.length ) {

				// Create new video tag and append to container
				$videoElement = $( '<video />' )
				.attr({
					'id' : playerId
				}).css({
					'-webkit-transform-style': 'preserve-3d',
					'position': 'relative',
					'width': '100%',
					'height': '100%'
				});
				$( '#' + containerId ).append( $videoElement );
			}  else {

			}
			this.element = $videoElement[0];
			this.$element = $(this.element);
			this.bindPlayer();

			return this;
		},
		bindPlayer: function(){
			var _this = this;
			$.each( _this.nativeEvents, function( inx, eventName ){
				_this.$element.unbind( eventName + '.embedPlayerHTML').bind( eventName + '.embedPlayerHTML', function(){
						var argArray = $.makeArray( arguments );
						$( _this ).trigger( eventName, argArray );
				});
			});
		},
		eventFunction: function(){

		},
		unbindPlayer:function(){

		},
		setNativePlayer: function(){
			this.$element.html(this.getNativePlayerHtml());
		},
		empty:function(){
			this.$element.empty();
		},
		getSrc:function(){
			return this.$element.attr('src');
		},
		setSrc:function( src ){
			this.$element.attr('src',src);
		},
		mute:function(){
			this.$element.attr('muted',true);
		},
		unmute:function(){
			this.$element.attr('muted',false);
		},
		enableAirPlay: function(){
			this.$element.attr( 'x-webkit-airplay', "allow" );
		},
		show:function (){
			this.$element.show();
		},
		play: function(){
			this.element.play();
		},
		pause: function(){
			this.element.pause();
		},
		seek: function( val ){
			mw.log('PlayerElement::Error: function seek should be implemented by playerElement interface ');
		},
		load: function(){
			this.element.src = this.src;
			this.element.load();
		},
		changeVolume: function( val ){
			this.element.volume = val;
		},
		getCurrentTime:function(){
			return this.element.currentTime;
		},
		setCurrentTime:function( time ){
			this.currentTime = time;
			this.element.currentTime = time;
		},
		getElement: function(){
			return this.element;
		},

		/**
		 * Get the native player embed code.
		 *
		 * @param {object} playerAttribtues Attributes to be override in function call
		 * @return {object} cssSet css to apply to the player
		 */
		getNativePlayerHtml: function( playerAttribtues, cssSet ){
			if( !playerAttribtues) {
				playerAttribtues = {};
			}
			// Update required attributes
			if( !playerAttribtues['id'] ){
				playerAttribtues['id'] = this.pid;
			}
			if( !playerAttribtues['src'] ){
				playerAttribtues['src'] = this.getSrc( this.currentTime);
			}

			// If autoplay pass along to attribute ( needed for iPad / iPod no js autoplay support
			if( this.autoplay ) {
				playerAttribtues['autoplay'] = 'true';
			}

			if( !cssSet ){
				cssSet = {};
			}

			// Set default width height to 100% of parent container
			if( !cssSet['width'] ) cssSet['width'] = '100%';
			if( !cssSet['height'] ) cssSet['height'] = '100%';

			// Also need to set the loop param directly for iPad / iPod
			if( this.loop ) {
				playerAttribtues['loop'] = 'true';
			}

			var tagName = this.isAudio() ? 'audio' : 'video';

			return	$( '<' + tagName + ' />' )
				// Add the special nativeEmbedPlayer to avoid any rewrites of of this video tag.
				.addClass( 'nativeEmbedPlayerPid' )
				.attr( playerAttribtues )
				.css( cssSet )
		}

	});

} )( window.mw, window.jQuery );