( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'id3Tag', mw.KBasePlugin.extend({

        defaultConfig: {
            updateTimeInterval: 1 // 1 second interval for update live time between id3 tags events (as for now we get id3 tag each 8 seconds)
        },
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
            this.addBinding();
            this.timeInterval = this.getConfig('updateTimeInterval');
            this.intervalCounter = this.timeInterval / (this.embedPlayer.monitorRate/1000);
        },
        addBinding: function () {
			var _this = this;

            this.bind('monitorEvent', function() {
                if( _this.updatedTime > 0 ){
                    _this.counter++;
                    if ( _this.counter === _this.intervalCounter ) {
                        _this.counter = 0;
                        _this.updatedTime = _this.updatedTime + _this.timeInterval;
                        _this.getPlayer().setCurrentTime(_this.updatedTime);
                        _this.sendTrackEventMonitor(mw.seconds2npt(_this.updatedTime), false);
                    }
                }
            });

			this.bind('onId3Tag', function(e, tag){
                _this.parseTag(tag);
			});
		},

        parseTag: function(tag){
            var time;
            switch(this.getPlayer().instanceOf){
                case "Native":
                    time = JSON.parse(tag).timestamp / 1000;
                    break;
                case "Kplayer":
                    //flash tag: gibrish{"id":"ac1d4fd80c79bf7807f6c33061833a784ff5ce62","timestamp":1.447225650123E12,"offset":1431918.0,"objectType":"KalturaSyncPoint"}
                    try{
                        tag = tag.substring(tag.indexOf('{'), tag.length); //remove unreadable gibrish from the tag string
                        var timestamp = tag.match(/timestamp\"\:([0-9|\.|A-F]+)/);
                        time = parseFloat(timestamp[1]) / 1000;
                    }catch(e){
                        mw.log("id3Tag plugin :: ERROR parsing tag : " + tag);
                    }
                    break;
                case "splayer":
                    //add code for Silverlight player
                    break;
            }
            if(time) {
                this.updatedTime = time;
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