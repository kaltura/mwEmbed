( function( mw, $ ) {"use strict";

mw.PluginManager.add( 'related', mw.KBaseScreen.extend({

	defaultConfig: {
		parent: "topBarContainer",
		order: 4,
		align: "right",
		tooltip: 'Related',
		//visible: false,
		itemsLimit: 12,
		displayOnPlaybackDone: true,
		autoContinueEnabled: true,		
		autoContinueTime: null,
		templatePath: 'components/related/related.tmpl.html',
		playlistId: null,
		formatCountdown : false
	},
	iconBtnClass: 'icon-related',
	setup: function(){
		var _this = this;

		this.bind('playerReady', function(){
			// Stop timer
			_this.stopTimer();

			// Reset our items data
			_this.templateData = null;

			// Load items data
			_this.getItemsData();
		});

		if( this.getConfig('displayOnPlaybackDone') ){
			this.bind('onEndedDone', function(){
				if ( _this.error ) {
					return;
				}
				_this.showScreen();
 				if( _this.getConfig('autoContinueEnabled') && _this.getConfig('autoContinueTime') ){
					_this.startTimer();
				}
			});
		}

		this.bind('replayEvent', function(){
			_this.stopTimer();
		});
	},
	startTimer: function(){
		var _this = this;
		var updateTimeRemaining = function(){
			var ct = _this.getConfig('timeRemaining');
			if( ct > 0 ){
				_this.setConfig('timeRemaining', --ct);
				_this.timeRemainingMonitor = setTimeout(updateTimeRemaining, 1000);
			} else {
				_this.stopTimer();
				// Make sure we change media only if related is visible and we have next item
				if( _this.isScreenVisible() && _this.templateData && _this.templateData.nextItem ){
					_this.changeMedia( null, {entryId: _this.templateData.nextItem.id} );
				}
			}
		};
		setTimeout(updateTimeRemaining, 1000);
	},
	pauseTimer: function(){
		// Clear our interval
		clearTimeout(this.timeRemainingMonitor);
		this.timeRemainingMonitor = null;
	},
    disableAutoContinue: function() {
        this.setConfig('autoContinueEnabled', false);
        this.pauseTimer();
    },
    enableAutoContinue: function(){
        this.setConfig('autoContinueEnabled', true);
        this.startTimer();
    },
    toggleAutoContinue: function(){
        if( this.getConfig('autoContinueEnabled') ){
            this.disableAutoContinue();
        } else {
            this.enableAutoContinue();
        }
    },
	stopTimer: function(){
		this.pauseTimer();
		// Set remaining time to auto continue time
		this.setConfig('timeRemaining', this.getConfig('autoContinueTime'));
	},
	getItemsData: function( callback ){
		callback = callback || function(){};
		if( !this.templateData ){
			var _this = this;

			// Allow other plugins to inject data
			this.getPlayer().triggerQueueCallback( 'relatedData', function( args ){
				// Get data from event
				if( args ){
					_this.templateData = args[0];
					callback();
					return ;
				}
				_this.getDataFromApi( callback );
			});					
			return;
		}
		callback();
		return;
	},
	getDataFromApi: function( callback ){
		var _this = this;
		this.getKalturaClient().doRequest( {
			'service' : 'playlist',
			'action' : 'execute',
			'id' : this.getConfig( 'playlistId' ),
			'filter:objectType': 'KalturaMediaEntryFilterForPlaylist',
			'filter:idNotIn': this.getPlayer().kentryid,
			'filter:limit': this.getConfig('itemsLimit')
		}, function( data ){
			// Check if we got error
			if(  data.code && data.message ){
				_this.log('Error getting related items: ' + data.message);
				_this.getBtn().hide();
				_this.error = true;
				return ;
			}
			_this.error = false;
			var nextItem = data.splice(0,1);
			_this.templateData = {
				nextItem: nextItem[0],
				moreItems: data
			};
			callback();
		});
	},
	changeMedia: function( e, data ){
		this.stopTimer();
		var _this = this;
		this.getPlayer().sendNotification('relatedVideoSelect', data);
		this.getPlayer().sendNotification('changeMedia', data);
		this.bind('onChangeMediaDone', function(){
			_this.getPlayer().play();
			_this.unbind('onChangeMediaDone');
		});
		this.hideScreen();
	},
	onConfigChange: function( property, value ){
		this._super( property, value );
		if( !this.isScreenVisible() ) {
			return;
		}

		if( property == 'timeRemaining' ){
            if( this.getConfig('formatCountdown')){
                var timeFormat = mw.KDPMapping.prototype.formatFunctions.timeFormat;
                this.getScreen().find('.remaining').html(timeFormat(value));
            }else{
                this.getScreen().find('.remaining').html(value);
            }

		}
	}
}));

} )( window.mw, window.jQuery );