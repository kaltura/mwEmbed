( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'id3Tag', mw.KBasePlugin.extend({

        defaultConfig: {
            updateTimeIntervalSec: 1 // 1 second interval for update live time between id3 tags events (as for now we get id3 tag each 8 seconds)
        },
        timeIntervalSec: 1,
        updatedTime: 0,
        intervalCounter: 4, //default interval counter will be 4 (updateTimeInterval = 1 second / this.embedPlayer.monitorRate = 250 milliseconds)
        counter: 0,

        isSafeEnviornment: function () {
            if( this.getPlayer().isLive() && !this.getPlayer().isDVR() ){
                return true;
            }
            return false;
        },

		setup: function() {
            this.timeIntervalSec = this.getConfig('updateTimeIntervalSec');
            this.intervalCounter = this.timeIntervalSec / (this.embedPlayer.monitorRate/1000);
            this.addBinding();
        },
        addBinding: function () {
			var _this = this;

            this.bind('monitorEvent', function() {
                if( _this.updatedTime > 0 ){
                    _this.updateTime();
                }
            });

			this.bind('onId3Tag', function(e, tag){
                _this.parseTag(tag);
			});
		},

        updateTime: function(){
            this.counter++;
            if ( this.counter === this.intervalCounter ) {
                this.counter = 0;
                this.updatedTime = this.updatedTime + this.timeIntervalSec;
                this.getPlayer().setCurrentTime(this.updatedTime);
                this.sendTrackEventMonitor(mw.seconds2npt(this.updatedTime), false);
            }
        },

        parseTag: function(tag){
            var time;
            switch(this.getPlayer().instanceOf){
                case "Native":
                    time = JSON.parse(tag).timestamp / 1000;
                    break;
                case "Kplayer":
                case "Silverlight":
                    //id3 tag: {"id":"ac1d4fd80c79bf7807f6c33061833a784ff5ce62","timestamp":1.447225650123E12,"offset":1431918.0,"objectType":"KalturaSyncPoint"}
                    try{
                        var timestamp = tag.match(/timestamp\"\:([0-9|\.|A-F]+)/);
                        time = parseFloat(timestamp[1]) / 1000;
                    }catch(e){
                        mw.log("id3Tag plugin :: ERROR parsing tag : " + tag);
                    }
                    break;
            }
            if(time) {
                this.updatedTime = time;
                this.counter = 0; //reset time update interval counter
                this.getPlayer().setCurrentTime(time);
                this.sendTrackEventMonitor(mw.seconds2npt(time), true);
            }
        },

        sendTrackEventMonitor: function(time, isId3TagTime) {
            var traceString = "id3Tag plugin :: ";
            if(isId3TagTime) {
                traceString = traceString + "id3 tag time = ";
            }else{
                traceString = traceString + "updated monitor time = ";
            }
            mw.log(traceString + time);
            // Send the id3Tag info to the trackEventMonitor
            if( this.getConfig( 'trackEventMonitor' ) ) {
                try {
                    window.parent[this.getConfig('trackEventMonitor')](
                        traceString + time
                    );
                } catch (e) {}
            }
        }
	}));

} )( window.mw, window.jQuery );