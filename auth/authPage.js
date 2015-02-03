/**
* Auth Page js 
* 
* Checks local storage initial iframe postMessage 
*/

var authPage = function(){
	return this.init();
};
authPage.prototype = {
	// The page attempting to authenticate 
	authRequestPage: null,
	
	// store the session user id entered into the input form
	sessionLoginId: null,
	sessionPassword: null,
	sessionPartnerId: null,
	
	// The auth page origin
	authRequestOrigin: null,
	
	init: function(){
		var _this = this;
		// always reset validKsFlag on init: 
		this.setValidKsFlag( "reset" );
		// Receive messages: 
		window.addEventListener("message", function( event){
			_this.receiveMessage( event )
		}, false );
		
		// Handle no GUI: 
		if( window.location.search.indexOf( 'ui=1' ) === -1){
			$('body').append( 'waiting for postMessage' );
			return ;
		}
		// we are displaying a gui ( probably won't get a postMessage with origin use refer )
		var ref = (document.referrer.length > 0) ? document.referrer : window.opener.location.href;
		this.authRequestOrigin  = ref.split('/').slice(0,3).join('/');
		// Check if user is logged in: 
		if( !_this.isAuthenticated() ){
			this.showLoginForm();
			return ;
		}
		// if authenticated, validate the ks: 
		this.validateKs( function( isValidKs ){
			if( !isValidKs ){
				_this.showLoginForm(
					"Your session has expired, please login"
				);
				return ;
			}
			_this.showPartnerAndDomainUi();
		});
	},
	/**
	 * Shows the login ui
	 */
	showPartnerAndDomainUi: function(){
		var _this = this;
		// check if the user has access to multiple accounts: 
		this.api.doRequest( {
			'ks': this.getAuthData( 'ks' ),
			'service': 'partner',
			'action' : 'listpartnersforuser'
		}, function( result ){
			_this.showDomainAproval();
			// Check if we should add per-account pull down: 
			if( result && result.objects.length > 1 ){
				$('.login-form').prepend(
					"For partner: ",
					_this.getAccountSelect( result.objects ),
					"<br>"
				)
			}
		});
	},
	// a self contained partner selector: 
	getAccountSelect: function( partnerList ){
		var _this = this;
		var $select = $('<select>');
		$.each( partnerList, function( inx, partner){
			var $option = $("<option>").attr({
				'value': partner.id
			}).text( partner.name );
			// if its the current selected partner highlight
			if( partner.id == _this.getAuthData( 'partnerId' ) ){
				$option.attr('selected', "selected");
			}
			$option.appendTo( $select );
		})
		$select.change( function(){
			$('.login-form').text('loading');
			var newPartnerId = $(this).val();
			if( newPartnerId != _this.getAuthData( 'partnerId' ) ){
				if( _this.sessionLoginId && _this.sessionPassword ){
					// we have valid user id and password for this session: 
					//just re-login with updated partner id. 
					_this.loginByLoginId(  _this.sessionLoginId, _this.sessionPassword, newPartnerId )
				} else{
					// show login form ( set session partner )
					_this.sessionPartnerId = newPartnerId;
					_this.showLoginForm(
						"You have changed to partner: <b>" + 
							$(this).find(':selected').text() + 
						"</b>, please login"
					);
				}
			}
		})
		return $select;
	},
	showDomainAproval: function(){
		var _this = this;
		if( !this.authRequestOrigin ){
			$('body').empty().append(
				"Error: no referrer domain authentication request"
			)
			return;
		}
		
		$('body').empty().append(
			$('<div>')
			.addClass('login-header')
			.append(
				$("<img>").attr('src','kaltura-user-icon.png'),
				$('<span>').text( 'Hello, ' + this.getAuthData( 'fullName' ) )
			),
			$('<div>')
			.addClass( 'login-form' )
			.append(
				$('<span>').html(
					'Please approve or deny access to <b>' + this.authRequestOrigin +'</b>'
				),
				$('<form>' +
					'<input type="radio" id="authPageAllow" name="authPage" value="allow">Allow access<br>' +
					'<input type="radio" id="authPageDeny" name="authPage" value="deny">Deny access' +
				'</form>')
			),
			$('<div>').addClass('login-foot').append(
				$('<a>')
				.addClass('btn')
				.attr('href', '#')
				.text( "Log out")
				.click( function(){
					_this.logout();
				}),
				
				$('<a>')
				.addClass('btn')
				.attr('href', '#')
				.text( "Save and Close")
				.click( function(){
					if( $('#authPageAllow' ).is(':checked') ){
						_this.addApprovedDomain( _this.authRequestOrigin );
					} else {
						_this.removeDomain( _this.authRequestOrigin );
					}
					window.close();
				})
			)
		)
		// check if the current domain is approved, and check box:
		if( this.getDomainAproveState() == 'ALLOW' ){
			$('#authPageAllow')[0].checked = true;
			$('#authPageDeny')[0].checked = false;
		} else{
			$('#authPageDeny')[0].checked = true;
			$('#authPageAllow')[0].checked = false;
		}
	},
	showLoginForm: function( loginMsg ){
		if( ! loginMsg ){
			var refer = ( this.authRequestOrigin )?  this.authRequestOrigin : document.referrer;
			if(!refer){
				$('body').empty().append( 
					$('<div>').html( "No referrer or auth domain set, <b>your browser may not be compatible</b>" )
				)
				return ;
			}
			loginMsg = 'Please login to approve or deny <b>' + document.referrer.split('/')[2] + '</b>';
		}
		var _this = this;
		$('body').empty().append(
			$('<div>')
			.addClass('login-header')
			.append(
				$("<img>").attr('src','kaltura-user-icon.png'),
				$('<span>').text( 'Login to ' + document.domain )
			),
			$('<div>')
			.addClass( 'login-form' )
			.append(
				$('<span>').html(
					loginMsg
				),
				$('<table>')
				.append(
					this.getEmailInputRow(),
					$('<tr>').append(
						$('<td>').append(
							$('<label>').attr({
								'for': "password"
							})
							.text( "Password:" )
						),
						$('<td>').append(
							$('<input>').attr({
								'type': 'password',
								'id': "password"
							})
						)
					)
				)
			),
			// buttons
			$('<div>').addClass('login-foot').append(
				$('<a>')
				.attr('href', '#')
				.text( "Forgot Password?")
				.click( function(){
					_this.showForgotPassword()
				}),
				
				$('<div>').addClass("divider"),
				
				$('<a>')
				.attr({
					'target' : "_new",
					'href': 'http://corp.kaltura.com/free-trial'
				})
				.text( "Sign up"),
				
				$( '<a>' ).addClass('btn login').text("Login").click(function(){
					var _thisBtn = this;
					$( this ).addClass( 'disabled' ).text('logging in');
					// update session vars: 
					_this.sessionLoginId = $('#email').val();
					_this.sessionPassword = $('#password').val();
					_this.loginByLoginId( 
						_this.sessionLoginId, 
						_this.sessionPassword,
						_this.sessionPartnerId
					)
					return false;
				})
			)
		);
	},
	handleLoginResult: function( data ){
		var _this = this;
		if( data.code ){
			_this.addFormError( data.message  );
			return ;
		}
		var ks = data;
		// success set the ks
		_this.api.setKs( ks );
		// now get all the user data:
		_this.loadUserData( 
			_this.sessionLoginId,
			ks,
			function( data ){
				if( data.code ){
					_this.addFormError( data.message );
					return ;
				};
				_this.setAuthData( data );
				// set to valid KS since its "fresh user data"
				_this.setValidKsFlag( true );
				_this.showPartnerAndDomainUi();
			}
		)
	},
	addFormError: function( msg ){
		$('.login-form').find('.alert-error').remove();
		$('.login-form').append(
			$('<div class="alert alert-error">').text( 
				msg
			)
		);
		// reset the form button:
		$('.login-foot').find('.btn').text("Login").removeClass( 'disabled' );
	},
	getEmailInputRow:function(){
		return $('<tr>').append(
				$('<td>')
				.css( 'width', '100px' )
				.append(
					$('<label>').attr({
						'for': "email"
					})
					.text( "Email:" )
				),
				$('<td>').append(
					$('<input>').attr({
						'type': 'text',
						'id': "email"
					})
				)
			)
	},
	showForgotPassword: function(){
		$('.login-form').empty.append(
			this.getEmailInputRow()
		)
		$('.login-foot .btn').text( 'Reset Password' ).off('click').on('click', function(){
			// do api request to rest password
		});
	},
	loginByLoginId: function( loginId, password, partnerId ){
		var _this = this;
		var request = {
			'service': 'user',
			'action': 'loginbyloginid',
			'loginId' : loginId,
			'password' : password
		};
		if( partnerId ){
			request['partnerId'] = partnerId;
		}
		this.getApi(function(){
			_this.api.doRequest( request, function( data ){
				_this.handleLoginResult( data )
			});
		})
	},
	/**
	 * Validates the stored ks against the api, by re-loading ( private ) user data.
	 */
	requestingKS: false,
	validateKs: function( callback ){
		var _this = this;
		// check if we already have a valid KS:
		if( _this.getAuthData('validKsFlag') !== "reset" ){
			callback( _this.getAuthData('validKsFlag') );
			return ;
		}
		if( this.requestingKS ){
			// ks is not yet valid, ( try again later ) 
			callback( false );
			return 
		}
		// check if we have params to validate against: 
		if( !this.getAuthData( 'email' ) && !this.getAuthData( 'ks' ) ){
			callback( false );
			return;
		}
		this.requestingKS = true;
		this.loadUserData(
			this.getAuthData( 'email' ),
			this.getAuthData( 'ks' ),
			function( data ){
				// update ks flag state:
				_this.setValidKsFlag( !data.code );
				// done requesting KS ( but won't be checked because we set validKsFlag anyway )
				_this.requestingKS = false;
				// covert code defined into boolean and issue callback 
				callback( !data.code  );
			}
		);
	},
	getApi: function( callback ){
		var _this = this;
		if( ! window['kWidget'] || !kWidget.api || !this.api ){
			// load kWidget.api: 
			$.getScript( "../mwEmbedLoader.php", function(){
				_this.api = new kWidget.api();
				callback();
			});
		} else {
			callback();
		}
	},
	/**
	 * Once we have logged in, load user data about current user
	 */
	loadUserData: function ( userId, ks, callback ){
		var _this = this;
		// get an api object 
		this.getApi( function(){
			_this.api.doRequest( {
				'service': 'user',
				'action': 'getbyloginid',
				'loginId': userId,
				'ks': ks
			}, function( data ){
				 if( !data.code ){
					// if data is valid ( add ks )
					data['ks'] = ks;
				}
				callback( data );
			});
		});
	},
	// reset the "validKsFlag"
	setValidKsFlag: function( value ){
		var authData = this.getAuthData();
		if( !authData ){
			authData = {};
		}
		authData['validKsFlag'] = value;
		this.setAuthData( authData );
	},
	logout: function(){
		// clear the local storage:
		delete( localStorage['kaltura-auth-object'] );
		// show the login form:
		this.showLoginForm();
	},
	getDomainAproveState: function(){
		var domainList = this.getDomainList();
		if( domainList.length == 0 ){
			return 'DENY';
		}
		return ( $.inArray( this.authRequestOrigin, domainList) !== -1 ) ? 'ALLOW': 'DENY';
	},
	getDomainList: function(){
		var domainList = localStorage['kaltura-auth-domainList'];
		if( domainList ){
			domainList = JSON.parse( domainList );
		} else {
			domainList = [];
		}
		return domainList;
	},
	removeDomain: function( domain ){
		var domainList = this.getDomainList();
		var inx =$.inArray(domain,  domainList);
		if( inx !== -1 ){
			domainList.splice( inx, 1 );
		}
		// update the local storage domain list: 
		localStorage['kaltura-auth-domainList'] = JSON.stringify( domainList );
	},
	addApprovedDomain: function( domain ){
		var domainList = this.getDomainList();
		// if the domain is not already in the list, add it: 
		if( $.inArray(domain,  domainList) === -1 ){
			domainList.push( domain );
		}
		// update the local storage:
		localStorage['kaltura-auth-domainList'] = JSON.stringify( domainList );
		// send the updated data to client: 
		this.setAuthData();
	},
	setAuthData: function( userData ){
		if( !userData ){
			var userData = this.getAuthData();
		}
		//console.log( 'setAuthData::' + JSON.stringify( userData ) );
		localStorage['kaltura-auth-object'] = JSON.stringify( userData );
	},
	getAuthData: function( attr ){
		var authObject = null;
		if( localStorage && localStorage['kaltura-auth-object'] ){
			try{
				var authObject = JSON.parse( localStorage['kaltura-auth-object'] );
			} catch ( e ){
				// could not parse ( probably undeinfed )
			}
		}
		if( ! authObject ){
			return null;
		}
		if( attr ){
			return authObject[ attr  ];
		}
		return authObject;
	},
	/**
	 * Checks if we are authenticated and have a valid ks. 
	 */
	isAuthenticated: function(){
		// boolean of get user data:
		return !! this.getAuthData();
	},
	/**
	* Receive messages marked kaltura-auth-handshake and establish origin
	* */
	receiveMessage: function( event ){
		var _this = this;
		// check for the only message we receive: "kaltura-auth-check"
		if( event.data != 'kaltura-auth-check' ){
			return ;
		}
		//console.log("AuthPage:: ReceiveMessage: ", event);
		// update auth page
		this.authRequestPage = event.source;
		// update auth domain: 
		this.authRequestOrigin = event.origin;
		
		var sentValidFlag = false;
		// Poll every 250ms user data 
		var	 userAuthPoll =	setInterval(function(){
			//console.log("check on auth page:" + _this.isAuthenticated() );
			// If not yet authenticated send login status
			if( ! _this.isAuthenticated() ){
				_this.sendMessage({
					'code': "LOGIN"
				})
				return ;
			}
			// Once we login, poll for valid domain:
			if( _this.getDomainAproveState() != 'ALLOW' ){
				_this.sendMessage( {
					'code': "DOMAIN_" + _this.getDomainAproveState()
				})
				return ;
			}
			// Check that KS has been validated: 
			if( _this.getAuthData( 'validKsFlag' ) === true ){
				clearInterval( userAuthPoll );
				_this.sendUserObject();
				return; 
			}
			// Else Validate KS:
			_this.validateKs( function( isKsValid ){
				if( isKsValid ){
					clearInterval( userAuthPoll );
					// success send user object:
					_this.sendUserObject();
					return ;
				}
			});
		}, 250);
	},
	/**
	 * Send the user object to the target authRequestPage
	 */
	sendUserObject: function(){
		this.sendMessage( {
			'ks' : this.getAuthData( 'ks' ),
			'partnerId':  this.getAuthData( 'partnerId' ),
			'email': this.getAuthData( 'email' ),
			'firstName': this.getAuthData( 'firstName' ),
			'fullName': this.getAuthData( 'fullName')
		} );
	},
	sendMessage: function( message ) {
		// send a message to the auth requesting page:
		this.authRequestPage.postMessage( JSON.stringify( message ), this.authRequestOrigin );
	}
};
// create the authPage:
new authPage();

