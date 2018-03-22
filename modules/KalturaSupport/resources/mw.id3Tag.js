( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'id3Tag', mw.KBasePlugin.extend({

        defaultConfig: {
            updateTimeIntervalSec: 1 // 1 second interval for update live time between id3 tags events (as for now we get id3 tag each 8 seconds)
        },
        timeIntervalSec: 1,
        updatedTime: 0,
        intervalCounter: 4, //default interval counter will be 4 (updateTimeInterval = 1 second / this.embedPlayer.monitorRate = 250 milliseconds)
        counter: 0,
        bindPostfix: '.id3Tag',

        isSafeEnviornment: function () {
            return true;
        },

		setup: function() {
            var _this = this;
            this.timeIntervalSec = this.getConfig('updateTimeIntervalSec');
            this.intervalCounter = this.timeIntervalSec / (this.embedPlayer.monitorRate/1000);

            this.bind( 'playerReady', function() {
                 if( _this.getPlayer().isLive() ) {
                    _this.addBinding();
                 }
            });
            this.bind( 'onChangeMedia', function() {
                _this.removeBindings();
            });
        },

        removeBindings: function(){
            this.unbind(  this.bindPostfix );
        },

        addBinding: function () {
			var _this = this;
			// in case player fallback to another player (E.G. Multicast fallback to Unicast) we want to prevent
            // duplicate events handling
            this.removeBindings();
            this.bind('monitorEvent' + _this.bindPostfix, function() {
                if( _this.updatedTime > 0 && !_this.getPlayer().buffering){
                    _this.updateTime();
                }
            });

            this.bind('seeking' + _this.bindPostfix, function(){
                _this.preSeekTime = _this.getPlayer().getPlayerElement().currentTime;
            });

            this.bind('seeked' + _this.bindPostfix, function(){
                var delta = _this.preSeekTime - _this.getPlayer().getPlayerElement().currentTime;
                _this.updatedTime -= delta;
            });

			this.bind('onId3Tag' + _this.bindPostfix, function(e, tag){
                _this.parseTag(tag);
			});
		},

        updateTime: function(){
            this.counter++;
            if ( this.counter === this.intervalCounter ) {
                this.counter = 0;
                this.updatedTime = this.updatedTime + this.timeIntervalSec;
                this.getPlayer().LiveCurrentTime = this.updatedTime;
                this.getPlayer().flashLiveCurrentTime = this.updatedTime; // for flash player
                this.sendTrackEventMonitor(mw.seconds2npt(this.updatedTime), false);
            }
        },

        parseTag: function(tag){
            var time;
            if ( tag ) {
                // on IE the tag needs to be parsed
                time = tag.timestamp / 1000;
                if(!time){
                    //Some browsers do not parse the JSON well
	                time = JSON.parse(tag).timestamp / 1000;
                }
            } else {
                mw.log("id3Tag plugin :: ERROR parsing tag.");
            }
            if(time) {
                var d = new Date(0); // The 0 there is the key, which sets the date to the epoch
                d.setUTCSeconds(time);
	            this.log("Update time from id3 tag: " + d.toUTCString());
                this.updatedTime = time;
                this.counter = 0; //reset time update interval counter
                this.getPlayer().LiveCurrentTime = time;
                if(this.getPlayer().isMulticast){
	                //set the current time for MC from the ID3 tag and not from the SL element that has always 0
	                this.getPlayer().currentTime = time
                }
                this.getPlayer().flashLiveCurrentTime = time; // for flash player
                // Calculate the start time of the video in absolute time for dvr
                // set this once - no need to do this rapidly
                if(this.getPlayer().isDVR() && !this.getPlayer().dvrAbsoluteStartTime && this.getPlayer().currentTime != 0){
					this.getPlayer().dvrAbsoluteStartTime = time-this.getPlayer().currentTime;
                }
                this.sendTrackEventMonitor(mw.seconds2npt(time), true);
            }
        },
        sendTrackEventMonitor: function(time, isId3TagTime) {
            var traceString = "id3Tag plugin :: id3 tag time = ";
            if(isId3TagTime) {
                mw.log(traceString + time);

                // Send the id3Tag info to the trackEventMonitor
                if (this.getConfig('trackEventMonitor')) {
                    try {
                        window.parent[this.getConfig('trackEventMonitor')](
                            traceString + time
                        );
                    } catch (e) {
                    }
                }
            }
        }
	}));

} )( window.mw, window.jQuery );