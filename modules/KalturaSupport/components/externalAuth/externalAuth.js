( function( mw, $ ) {"use strict";
	mw.PluginManager.add( 'externalAuth', mw.KBasePlugin.extend({
		defaultConfig: {
			"authFrameUrl": null,
			"authFrameTimeout": 10
		},

		setup: function() {
			var _this = this;
			if( ! this.getConfig('authFrameUrl') ){
				this.log( "error authFrameUrl missing");
				return ;
			}
			
			// Somehow we don't have an event for "player errors" :( :( :( 
			this.bind( 'playerReady', function ( e, data ) {
				var errorObj = _this.getPlayer().getError();
				if( errorObj.code == "NO_KS" ){
					_this.handleAuth();
				}
			});
			
		},
		handleAuth: function(){
			var _this = this;
			// set player into loader mode: 
			_this.getPlayer().removePlayerError();
			_this.getPlayer().addPlayerSpinner();
			
			_this.addIframeKsPage();
			
			// Receive messages: 
			window.addEventListener("message", function( event){
				// parse data: 
				var messageObj = JSON.parse( event.data );
				if( messageObj.error ){
					return _this.handleError( messageObj.error );
				}
				if( messageObj.ks ){
					// Update player KS: 
					_this.getPlayer().setKDPAttribute( 'servicesProxy.kalturaClient', 'ks', messageObj.ks );
					_this.getPlayer().enablePlayControls();
				}
			}, false );
		},
		addIframeKsPage: function(){
			var _this = this;
			var authFrame = null;
			// remove any existing auth-frame:
			$('#auth-frame').remove();
			// load the authentication iframe:
			$('body').append(
				$( '<iframe style="width:0px;height:0px;border:none;overflow:hidden;" id="auth-frame">' )
				.attr('src', _this.getConfig('authFrameUrl') )
				.load( function(){
					authFrame = this;
					// give it 250ms for DOM to be ready
					setTimeout(function(){
						_this.log( 'Send Auth check to iframe: ' + _this.getConfig('authFrameUrl') );
						$( authFrame )[0].contentWindow.postMessage( 'kaltura-externalAuth-check',  '*');
					}, 250);
				})
			);
			// check for overall timeout: 
			setTimeout(function(){
				if( !authFrame ){
					_this.getPlayer().showErrorMsg(
						_this.getPlayer().getKalturaMsgObject('ks-externalAuth-error-timeout')
					);
				}
			},this.getConfig('authFrameTimeout') * 1000 );
			
		},
		handleError:function(errorType){
			switch( errorType ){
				case 'login':
					// present login form
					this.showLogin();
					break;
				case 'domain':
					// present player hosted on not approved domain error
					this.getPlayer().showErrorMsg(
						this.getPlayer().getKalturaMsgObject('externalAuth-error-domain')
					);
					break;
			}
		},
		showLogin:function(){
			var _this = this;
			// show please login alert: 
			var alertObj = {
				'title': gM('ks-externalAuth-login-title'),
				'message':  gM('ks-externalAuth-login'),
				'isModal': true,
				'isExternal': false,
				'buttons': [ gM('ks-externalAuth-login-btn') ],
				'callbackFunction': function (eventObj) {
					var authPage = (window.open( _this.getConfig('authFrameUrl'), 
						'kalturaauth',
						 "menubar=no,location=yes,resizable=no,scrollbars=no,status=no" +
						 "left=50,top=100,width=400,height=250" 
					));
					var interval = window.setInterval(function() {
						try {
							if (authPage == null || authPage.closed) {
								window.clearInterval(interval);
								_this.addIframeKsPage();
							}
						}
						catch (e) {
						}
					}, 250);
					return false;
				}
			};
			this.getPlayer().layoutBuilder.displayAlert(alertObj);
		}
	}));

} )( window.mw, window.jQuery );