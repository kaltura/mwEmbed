( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'id3Tag', mw.KBasePlugin.extend({

		defaultConfig: {

		},

        isSafeEnviornment: function () {
            if( this.getPlayer().isLive() && !this.getPlayer().isDVR() ){
                return true;
            }
            return false;
        },

		setup: function(){
			var _this = this;

			this.bind('onId3Tag', function(e, tag){
                //flash tag: {"id":"ac1d4fd80c79bf7807f6c33061833a784ff5ce62","timestamp":1.447225650123E12,"offset":1431918.0,"objectType":"KalturaSyncPoint"}
                tag = tag.substring(tag.indexOf('{'), tag.length);
                var timestamp = tag.match(/timestamp\"\:([0-9|\.|A-F]+)/);
                var time = parseFloat( timestamp[1] );
                mw.log( "--------------- timestamp "+time );

                _this.getPlayer().setCurrentTime(time/1000);
			});


		}

	}));

} )( window.mw, window.jQuery );