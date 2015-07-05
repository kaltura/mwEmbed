/**
* Setups up basic players.js receiver
*/
( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'playersJsReceiver', mw.KBasePlugin.extend({
		setup:function(){
			this.receiver = new playerjs.Receiver();
	
			this.addBindings();
			
			this.receiver.ready();
		},
		addBindings:function(){
			var receiver = this.receiver;
			var player = this.getPlayer();
			
			// handle methods:"
			receiver.on('play', function(){
				player.play();
			});
			receiver.on('pause', function(){
				player.pause();
			});
			receiver.on('getPaused', function( callback ){
				callback( ! player.isPlaying() ); 
			});
			receiver.on('mute', function(){
				if( ! player.muted ){
					player.toggleMute();
				}
			});
			receiver.on('unmute', function(){
				if( player.muted ){
					player.toggleMute();
				}
			});
			receiver.on('getMuted', function( callback ){
				callback( player.muted );
			})
			receiver.on('setVolume', function( value ){
				player.setVolume( value );
			});
			receiver.on('getVolume', function( callback ){
				callback( player.volume );
			})
			receiver.on('getDuration', function( callback ){
				callback( player.getDuration() );
			})
			receiver.on('setCurrentTime', function(value){
				player.seek( value );
			});
			receiver.on('getCurrentTime', function( callback ){
				callback( player.currentTime );
			})
			receiver.on('setLoop', function( value ){
				player.loop = value
			});
			receiver.on('getLoop', function( callback ){
				callback( player.loop );
			})
			// handle events:
			this.bind('onplay', function(){
				receiver.emit('play');
			});
			this.bind('onpause', function(){
				receiver.emit('pause');
			});
			this.bind('progress', function(progressData){
				receiver.emit('progress', {
					'percent': progressData
				});
			});
			this.bind('monitorEvent', function(){
				receiver.emit('timeupdate', {
					'seconds': player.currentTime,
					'duration': player.duration
				});
			});
			// use "postEnded" not onEndDone, because when loop is active onEndDone is not triggered.
			this.bind('postEnded', function(){
				receiver.emit('ended');
			});
			this.bind('seeked', function(){
				receiver.emit('seeked')
			})
			this.bind('mediaError', function(){
				receiver.emit('error')
			});
		}
	}));
	
} )( window.mw, window.jQuery );
