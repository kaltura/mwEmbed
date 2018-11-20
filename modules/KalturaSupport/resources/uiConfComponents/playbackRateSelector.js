( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'playbackRateSelector', mw.KBaseComponent.extend({

		defaultConfig: {
			"parent": "controlsContainer",
		 	"order": 61,
		 	"displayImportance": "medium",
		 	"align": "right",
		 	"showTooltip": true,
		 	'defaultSpeed': '1',
			'speeds': ".5,.75,1,1.5,2",
			'enableKeyboardShortcuts': true,
			'serverSpeedPlayback': false,
			'title': gM( 'mwe-embedplayer-speed' ),
			'smartContainer': 'qualitySettings',
			'smartContainerCloseEvent': 'updatedPlaybackRate'
		},

		playbackSpeedAccessibility: gM('mwe-embedplayer-speed-accessibility'),
		isDisabled: false,
		currentSpeed: 1,
		manifestSource: null,

		isSafeEnviornment: function(){
			var _this = this,
			deferred = $.Deferred();
			if ( mw.isMobileDevice() && !this.getConfig("serverSpeedPlayback")){
				return false;
			}
			this.bind('playerReady', function(){
				if ( _this.getConfig("serverSpeedPlayback") === true && _this.manifestSource ){
					deferred.resolve(true);
				}
				if ( _this.embedPlayer.isLive() ){
					deferred.resolve(false);
				}
				// check if we have sources that can play with Native library:
				if (_this.embedPlayer.mediaElement.getNativePlayableSources().length > 0){
					deferred.resolve(document.createElement( "video" ).playbackRate && !mw.isMobileDevice());
				}
			});
			return deferred.promise();
		},

		setup: function(){
			this.currentSpeed = Math.abs(this.getConfig('defaultSpeed')) || 1;
			this.speedSet = this.getConfig('speeds').split(',');
			var i;
			for ( i=0; i < this.speedSet.length; i++) {
				this.speedSet[i] = Math.abs( this.speedSet[i] );
			}
			this.addBindings();
		},

		addBindings: function(){
			var _this = this;
			this.bind( 'playerReady', function(){
				_this.buildMenu();
			});

			this.bind( 'onChangeMedia', function(){
				_this.currentSpeed = 1;
				if ( !_this.embedPlayer.isMobileSkin() ){
					_this.getBtn().text( '1x' );
				}
				_this.buildMenu();

				_this.manifestSource = null;
			});

			this.bind( 'SourceSelected', function(e, source){
				if (source.src.indexOf("playManifest") !== -1 && (source.src.indexOf("/a.f4m") !== -1 || source.src.indexOf("/a.m3u8") !==-1)){
					_this.manifestSource = source.src;
				}
			});

			this.bind( 'onRemovePlayerSpinner', function(){
				 if ( _this.getPlayer().getPlayerElement() && !_this.getConfig("serverSpeedPlayback")) {
					 if (_this.getPlayer().instanceOf === 'Native') {
						 _this.getPlayer().getPlayerElement().playbackRate = _this.currentSpeed;
					 }
					 //Unfortunately until we transform the DASH player API to be same as native
					 //we have to do this
					 if (_this.getPlayer().instanceOf === 'MultiDRM'){
						 _this.getPlayer().getPlayerElement().setPlaybackRate(_this.currentSpeed);
					 }
				 }
			});
			this.bind( 'playbackRateChangeSpeed', function(e, arg ){
				_this.setSpeedFromApi( arg );
			});

			this.bind( 'onDisableInterfaceComponents', function(e, arg ){
				_this.getMenu().close();
			});

			if( this.getConfig('enableKeyboardShortcuts') ){
				this.bind( 'addKeyBindCallback', function( e, addKeyCallback ){
					_this.addKeyboardShortcuts( addKeyCallback );
				});
			}
		},
		// API for this plugin. With this API any external plugin or JS code will be able to set 
		// a specific speed, or a faster/slower/fastest/slowest 
		setSpeedFromApi: function( arg ) {
			var newSpeed;
			switch(arg){
				case 'faster':
					newSpeed = this.getFasterSpeed();
				break;
				case 'fastest':
					newSpeed = this.speedSet[this.speedSet.length-1] ;
				break;
				case 'slower':
					newSpeed = this.getSlowerSpeed();
				break;
				case 'slowest':
					newSpeed = this.speedSet[0] ;
				break;
				default:
					newSpeed = arg;
				break
			}
			this.setSpeed(newSpeed);
		},
		addKeyboardShortcuts: function( addKeyCallback ){
			var _this = this;
			//key code for the +,-,=
			var fasterSpeed = 'shift+187';
			var slowerSpeed = 189;
			var startSpeed = 187;

			//FF has different key code for +,-,=
			if ( mw.isFirefox() ) {
				fasterSpeed = 'shift+61';
				slowerSpeed = 173;
				startSpeed = 61;
			}
			// Add + Sign for faster speed
			addKeyCallback( fasterSpeed, function(){
				_this.setSpeed( _this.getFasterSpeed() );
			});
			// Add - Sigh for slower speed
			addKeyCallback( slowerSpeed, function(){
				_this.setSpeed( _this.getSlowerSpeed() );
			});
			// Add = Sigh for normal speed
			addKeyCallback( startSpeed, function(){
				_this.setSpeed( _this.getConfig('defaultSpeed') );
			});
		},		

		getFasterSpeed: function(){
			if( this.speedSet[this.getCurrentSpeedIndex()+1] ){
				return this.speedSet[this.getCurrentSpeedIndex()+1];
			}
			return this.speedSet[this.getCurrentSpeedIndex()];
		},
		getSlowerSpeed: function(){
			if( this.speedSet[this.getCurrentSpeedIndex()-1] ){
				return this.speedSet[this.getCurrentSpeedIndex()-1];
			}
			return this.speedSet[this.getCurrentSpeedIndex()];
		},

		buildMenu: function(){	
			var _this = this;

			// Destroy old menu
			this.getMenu().destroy();

			$.each( this.speedSet, function( idx, speedFloat ){
				var active = ( _this.currentSpeed == speedFloat );
				_this.getMenu().addItem({
					'label': speedFloat + 'x',
					'callback': function(){
						_this.setSpeed( speedFloat );
					},
					'active': active,
					'accessibility': speedFloat + " " + _this.playbackSpeedAccessibility
				});
				if (_this.embedPlayer.isMobileSkin() && active){
					_this.getMenu().setActive(idx);
				}
			});
		},
		setSpeed: function( newSpeed ){
			var _this = this;
			this.log('Set Speed to: ' + newSpeed);
			var previousSpeed = this.currentSpeed;
			this.currentSpeed = newSpeed;
			// check if we need to switch interfaces: 
			if( (this.getPlayer().instanceOf != 'Native' && this.getPlayer().instanceOf != 'MultiDRM') || (mw.isMobileDevice() && !this.getConfig("serverSpeedPlayback") && this.manifestSource)){
				this.handlePlayerInstanceUpdate( newSpeed, previousSpeed );
				return ;
			}
			this.updatePlaybackRate( newSpeed );
		},
		handlePlayerInstanceUpdate: function( newSpeed, previousSpeed ){
			var _this = this;
			var currentPlayTime = this.getPlayer().currentTime;
			this.currentSpeed = newSpeed;
			if (this.getConfig("serverSpeedPlayback") && this.currentSpeed <= 2 && (this.getPlayer().instanceOf === 'Kplayer' || mw.isMobileDevice())){
				this.switchServerSideSpeed(newSpeed, previousSpeed, currentPlayTime);
			}else{
				this.switchClientSideSpeed(newSpeed, previousSpeed, currentPlayTime);
			}
		},
		switchServerSideSpeed: function(newSpeed, previousSpeed, currentPlayTime){
			this.log('Set Speed on the server side to: ' + newSpeed);
			var _this = this;
			// for decimal numbers, make sure we have only one digit after the dot (server limitation)
			if ( this.currentSpeed % 1 !== 0 ){
				this.currentSpeed = this.currentSpeed.toFixed(1);
			}
			var source = this.manifestSource;
			if (this.manifestSource){ // for HLS and HDS, since the movie duration changes, we need to recalculate the position
				currentPlayTime = currentPlayTime * previousSpeed / this.currentSpeed;
			}
			var fileName = source.substr(source.lastIndexOf("/"));
			var base = source.substr(0,source.lastIndexOf("/"));
			if (fileName.indexOf("/a.f4m") === 0){
				base = base.substr(0,base.length-3);
			}
			if (source.indexOf("playbackRate") !== -1){
				base = base.substr(0,base.lastIndexOf("playbackRate")-1);
			}
			var newSrc = base + "/playbackRate/" + this.currentSpeed + fileName;
			this.updatePlaybackRate( newSpeed );

			if (mw.isMobileDevice()){
				this.getPlayer().getPlayerElement().src = newSrc;
				this.getPlayer().mediaElement.selectedSource.src = newSrc;
				if (mw.isIOS()){
					this.getPlayer().getPlayerElement().load();
				}
			}else{
				this.embedPlayer.playerObject.sendNotification("changeMedia", { "entryUrl" : newSrc});
				this.embedPlayer.play();
			}

			if ( currentPlayTime > 0 ){
				this.embedPlayer.stopMonitor();
				$(this.embedPlayer).bind("playing", function(){
					$(_this.embedPlayer).unbind("playing");
					setTimeout(function(){
						if (mw.isIOS()){
							_this.getPlayer().getPlayerElement().currentTime =  currentPlayTime ;
						}else{
							_this.embedPlayer.seek( currentPlayTime );
						}
						_this.embedPlayer.startMonitor();
					},0);
				});
			}
		},
		switchClientSideSpeed: function(newSpeed, previousSpeed, currentPlayTime){
			this.log('Set Speed on the client side to: ' + newSpeed);
			var _this = this;
			// look for native sources and send them to the autoSelectSource function
			var nativeSources = [];
			var playableSources = this.getPlayer().mediaElement.getPlayableSources();
			$.each( playableSources, function(i, source ){
				if ( source.mimeType == 'video/mp4' || source.mimeType == 'video/h264' ) {
					nativeSources.push( source );
				}
			});
			var options = nativeSources.length ? { 'sources' : nativeSources } : {};
			var source = this.getPlayer().mediaElement.autoSelectSource(options);
			var player = mw.EmbedTypes.getMediaPlayers().getNativePlayer( source.mimeType );
			this.getPlayer().selectPlayer ( player );
			this.getPlayer().updatePlaybackInterface( function(){
				// update playback rate:
				if( currentPlayTime == 0 ){
					_this.updatePlaybackRate( newSpeed );
				}else{
					setTimeout(function(){
						_this.bind("seeked", function(){
							_this.updatePlaybackRate( newSpeed );
							_this.unbind("seeked");
						});
						_this.getPlayer().seek( currentPlayTime ); // issue a seek if given new seek time
					}, 200);
				}
			});
		},
		/**
		 * updatePlaybackRate issues a call to native player element to update playbackRate to target speed.
		 * @param {float} newSpeed target playback rate in float 1.0 = normal playback rate. 
		 */
		updatePlaybackRate: function( newSpeed ){
			// workaround for Firefox and IE - changing playbackRate before media loads causes player to stuck
			if (this.getPlayer().mediaLoadedFlag){
				if (this.getPlayer().instanceOf === 'Native') {
					this.getPlayer().getPlayerElement().playbackRate = newSpeed;
				}
				//Unfortunately until we transform the DASH player API to be same as native
				//we have to do this
				if (this.getPlayer().instanceOf === 'MultiDRM'){
					this.getPlayer().getPlayerElement().setPlaybackRate(newSpeed);
				}
			}
			if (!this.embedPlayer.isMobileSkin()){
				this.getBtn().text( newSpeed + 'x' );
			}
			this.getPlayer().triggerHelper( 'updatedPlaybackRate', newSpeed);
		},
		getCurrentSpeedIndex: function(){
			var _this = this;
			var index = null;
			$.each(this.speedSet, function( idx, speed){
				if( _this.currentSpeed == speed ){
					index = idx;
					return true;
				}
			});
			return index;
		},
		toggleMenu: function(){
			if ( this.isDisabled ) {
				return;
			}
			this.getMenu().toggle();
		},
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				var $menu = $( '<ul />' );
				var text = this.embedPlayer.isMobileSkin() ? '' : this.currentSpeed + 'x';
				var classes = this.embedPlayer.isMobileSkin() ? 'btn icon-speedrate' : 'btn';
				var $button = $( '<button />' )
								.addClass( classes )
								.attr({
									'title': this.getConfig('title'),
									'aria-haspopup':'true',
									'aria-label': this.getConfig('title')
								})
								.text( text )
								.click( function(e){
									_this.toggleMenu();
								});

				this.$el = $( '<div />' )
								.addClass( 'dropup' + this.getCssClass() )
								.append( $button, $menu );
			}
			return this.$el;
		},
		getMenu: function(){
			if( !this.menu ) {
				this.menu = new mw.KMenu(this.getComponent().find('ul'), {
					tabIndex: this.getBtn().attr('tabindex'),
					menuName: this.getConfig("title")
				});
			}
			return this.menu;			
		},
		getBtn: function(){
			return this.getComponent().find( 'button' );
		},
		onEnable: function(){
			this.isDisabled = false;
			this.getBtn().removeClass( 'disabled' );
		},
		onDisable: function(){
			this.isDisabled = true;
			this.getComponent().removeClass( 'open' );
			this.getBtn().addClass( 'disabled' );
		}
	}));

} )( window.mw, window.jQuery );