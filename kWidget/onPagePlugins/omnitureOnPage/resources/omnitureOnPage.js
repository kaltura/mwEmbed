kWidget.addReadyCallback( function( playerId ){
	/**
	 * The main omnitureOnPage object:
	 */
	var omnitureOnPage = function(kdp){
		return this.init(kdp);
	}
	omnitureOnPage.prototype = {
		init:function( kdp ){
			var _this = this;
			this.kdp = kdp;
			// Check for on-page s-code that already exists
			this.sCodeCheck(function(){
				_this.bindPlayer();
			})
		},
		sCodeCheck: function( callback ){
			// check if already on the page: 
			if(window['s'] && window['s']['Media'] ){
				callback();
				return ; 
			}
			// check if we have
			if( !this.getConfig('s_codeUrl') ){
				kWidget.log( "Error: s_codeUrl must be set for Omniture onPage plugin");
				return ;
			}
			kWidget.appendScriptUrl( this.getConfig('s_codeUrl'), callback );
		},
		/** Getters **/
		getMediaPlayerName: function(){
			return 'Kaltura Omniture OnPage v' + mw.getConfig('version'); 
		},
		getMediaName: function(){
			return this.getAttr('mediaProxy.entry.name');
		},
		getDuration: function(){
			return Math.floor( this.getAttr('duration') );
		},
		getCurrentTime: function(){
			return Math.floor( this.getAttr('video.player.currentTime') );
		},
		bindPlayer: function(){
			var _this = this;
			var firstPlay = true;
			// setup shortcuts:
			var stop = function(){
				_this.runMediaCommand( "stop", _this.getMediaName(), _this.getCurrentTime() );
			}
			var play = function(){
				_this.runMediaCommand( "play", _this.getMediaName(), _this.getCurrentTime() );
			}
			// Run open on first play:
			this.kdp.kBind( 'doPlay', function(){
				if( firstPlay ){
					_this.runMediaCommand( "open", 
						_this.getMediaName(), 
						_this.getDuration(), 
						_this.getMediaPlayerName() 
					)
				}
				_this.runMediaCommand( "play", _this.getMediaName(), _this.getCurrentTime() );
				firstPlay = false;
			})
			this.kdp.kBind( 'playerSeekStart', stop );
			this.kdp.kBind( 'playerSeekEnd', play );
			this.kdp.kBind( 'doPause', stop );
			this.kdp.kBind( 'playerPlayEnd', function(){
				stop();
				_this.runMediaCommand( "close", _this.getMediaName() )
			});
		},
		
		runMediaCommand: function(){
	 		var args = $.makeArray( arguments );
	 		var cmd = args[0];
	 		var argSet = args.slice( 1 );
	 		try{
	 			eval( 's.Media.' + cmd + '("' + argSet.join('","') + '");');
	 			// not working :(
	 			//s.Media[cmd].apply( this, args );
	 		}catch( e ){
	 			kWidget.log( "Error: Omniture, trying to run media command:" + cmd + ' does not exist' );
	 		}

	 		// audit if trackEventMonitor is set:
	 		if( this.getConfig( 'trackEventMonitor') ){
		 		try{
		 			window.parent[ this.getConfig( 'trackEventMonitor') ]( 's.Media.' + cmd + '( ' + argSet.join(', ') + ' )' );
		 		} catch ( e ){}
	 		}
	 	},
		normalizeAttrValue: function( attrValue ){
			// normalize flash kdp string values
			switch( attrValue ){
				case "null":
					return null;
				break;
				case "true":
					return true;
				break;
				case "false":
					return false;
				break;
			}
			return attrValue;
		},
		getAttr: function( attr ){
			return this.normalizeAttrValue(
				this.kdp.evaluate( '{' + attr + '}' )
			);
		},
		getConfig : function( attr ){
			return this.normalizeAttrValue(
				this.kdp.evaluate('{omnitureOnPage.' + attr + '}' )
			);
		}
	}
	
	/**********************************
	 * Initialization of omnitureOnpage:
	 **********************************/
	new omnitureOnPage( document.getElementById( playerId ) );
});
