/**
 * The RaptMediaPlayPauseBtn adds enhances the playPauseBtn component to trigger doReplay 
 * if it's currently in a replay state instead of just continue playback at the end of the playback
 *
 * See the RaptMedia plugin for more information. 
 */
(function ( mw, $ ) {
	"use strict";
	mw.PluginManager.add('raptMediaPlayPauseBtn', mw.PluginManager.getClass('playPauseBtn').extend({
		
		addBindings: function() {
			this._super();
			
			var _this = this;
			this.bind('mediaLoaded', function(event) { 
				_this.raptCleanup();
				var partnerData = _this.getPlayer().evaluate('{mediaProxy.entry.partnerData}');
				_this.raptMediaPlaylistEntry = (partnerData != null && partnerData.indexOf("raptmedia") > -1);

				if (_this.raptMediaPlaylistEntry == true) {
					//rapt entry
					_this.addBindingsRapt();
				} else {
					//regular entry
				}
			});
		},

		addBindingsRapt: function () {
			var _this = this;
			
			this.bind('raptMedia_newSegment', function(e, raptEngineCurrentSegment) {
				_this.raptCurrentSegment = raptEngineCurrentSegment;
				_this.raptMediaProjectEnd = false;
			});
			this.bind('seeked', function() {
				var segCurrentTime = parseFloat(_this.getPlayer().currentTime.toFixed(3)) * 1000 - _this.raptCurrentSegment.msStartTime;
				if (!_this.isEndOfRaptSegment(segCurrentTime)) {
					_this.raptMediaProjectEnd = false;
					_this.getPlayer().donePlayingCount = 0;
				} else {
					if (_this.raptMediaProjectEnd)
						_this.updateUI('end', _this.getPlayer().currentState);
				}
			});
			this.getPlayer().bindHelper( 'userInitiatedPlay' , function () {
				//handle user-action play events not from this plugin (such as clicking spacebar)
				_this.togglePlayback2(true);
			});
			this.bind('raptMedia_projectEnd', function () {
				_this.raptMediaProjectEnd = true;
				_this.updateUI('end', _this.getPlayer().currentState);
			});
		},

		raptCleanup: function () {
			this.unbind('raptMedia_newSegment');
			this.getPlayer().unbindHelper('seeked');
			this.unbind('raptMedia_projectEnd');
			this.unbind('userInitiatedPlay');
			this.raptCurrentSegment = null;
			this.raptMediaPlaylistEntry = false;
			this.raptMediaProjectEnd = false;
		},

		updateUI: function( newState, oldState ){
			//regular entry
			if (!this.raptMediaPlaylistEntry){
				this._super(newState, oldState);
				return;
			} 
			//rapt media entry
			var removeIconClasses = this.playIconClass + ' ' + this.pauseIconClass + ' ' + this.replayIconClass;
			var newIconClass = null;
			var title = null;
			var ignoreChange = false;

			switch( newState ) {
				case 'play':
					title = this.pauseTitle;
					newIconClass = this.pauseIconClass;
				    break;
				case 'start':
					title = this.playTitle;
					newIconClass = this.playIconClass;
					break;
				case 'pause':
					if ( oldState && oldState!='end' ) {
						title = this.playTitle;
						newIconClass = this.playIconClass;
					} else {   	//if we get 'paused' after 'end' state - leave 'replay' icon
						ignoreChange = true;
					}
				    break;
				case 'end': 
					title = this.replayTitle;
					newIconClass = this.replayIconClass;
				    break;
				default:
					// On other states do nothing
					ignoreChange = true;
				break;
			}

			//override state if we're at the end of the project, just show replay
			if (this.raptMediaProjectEnd) {
				title = this.replayTitle;
				newIconClass = this.replayIconClass;
			}

			if( ignoreChange ){
				return;
			} else {
				ignoreChange = false;
				this.updateTooltip(title);
                this.setAccessibility(this.$el,title);
				this.getComponent()
					.removeClass( removeIconClasses )
					.addClass( newIconClass );
			}
		},

		isEndOfRaptSegment: function (seekTimeMillis) {
			if (seekTimeMillis < 0) seekTimeMillis = 0;
			var segmentDurationMillis = this.raptCurrentSegment.msDuration - 550;
			var isSegmentEnd = (seekTimeMillis >= segmentDurationMillis);
			return isSegmentEnd;
		},

		togglePlayback: function() {
			//regular entry
			if (!this.raptMediaPlaylistEntry){
				this._super();
				return;
			} 

			//rapt media entry
			this.togglePlayback2(false);
		},

		togglePlayback2: function(notUserInitiatedPlay) {
			//rapt media entry
			if( this.isDisabled ) return ;

			var segCurrentTime = parseFloat(this.getPlayer().currentTime.toFixed(3)) * 1000 - this.raptCurrentSegment.msStartTime;
			var isSegmentReplay = this.isEndOfRaptSegment(segCurrentTime);
			var isFullReplay = this.raptMediaProjectEnd;
			var isReplay = isSegmentReplay || isFullReplay;
			var notificationName = ( this.getPlayer().isPlaying() ) ? 'doPause' : 'doPlay';
			
			if (!isReplay) {
				if (notUserInitiatedPlay)
					this.getPlayer().sendNotification( notificationName );
				else
					this.getPlayer().sendNotification( notificationName, {'userInitiated': true} );
			} else {
				if (isFullReplay) {
					this.getPlayer().triggerHelper('replayEvent');
				} else {
					var seekTo = parseFloat((this.raptCurrentSegment.msStartTime / 1000).toFixed(2));
					var _this = this;
					this.bind('seeked.segmentReplay', function () {
						_this.unbind('seeked.segmentReplay');
						_this.getPlayer().play();
					});
					this.getPlayer().seek(seekTo, false);
				}
			}
		}
	} ) );
} ) ( window.mw, window.jQuery );	