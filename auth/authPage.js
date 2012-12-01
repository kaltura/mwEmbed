/**
* Auth Page js 
* 
* Checks local storage initial iframe postMessage 
*/
var authPage = {
	return this.init();
}
authPage.prototype = {
	// The page attempting to authenticate 
	authRequestPage: null,
	
	// The auth page origin
	authRequestOrigin: null,
	
	inti: function(){
		var _this = this;
		// check if we are login
		if( !this.isAuthenticated() ){
			this.showLoginForm();
			return ;
		}
		// get localStorage payload
		
		// check current domain is authenticated
		
		// provide menu to approve or deny domains
		
		// Receive update messages: 
		window.addEventListener("message", function( event){
			_this.receiveMessage( event )
		}, false);
	},
	/**
	 * Checks if we are authenticated and have a valid ks. 
	 */
	isAuthenticated: function(){
		if( localStorage['kaltura-auth-object'] ){
			this.authObject = JSON.parse( localStorage['kaltura-auth-object'] );
		}
		return false;
	},
	/**
	* Receive messages marked kaltura-auth-handshake and establish origin
	* */
	receiveMessage: function( event ){
		// check for handshake
		if( event.data == 'kaltura-auth-check' ){
			// update auth page
			this.authRequestPage = event.source;
			// update auth domain: 
			this.authRequestOrigin = event.origin;
			if( ! this.isAuthenticated() ){
				this.sendMessage( {
					'code': "LOGIN"
				})
				return ;
			}
			// Check if we are already logged in, and domain is approved, send. 
			if( !this.isDomainApproved() ){
				this.sendMessage( {
					'code': "DOMAIN_DENIED"
				})
				return ;
			}
			// check that cookie ks is valid and active
			this.validateKs( function(){
				
			})
			// if we are all good sendValidAuthMessage
			this.sendValidAuthMessage();
		}
	},
	/**
	 * Send the valid auth message.
	 */
	sendValidAuthMessage: function(){
		var authObject  = {
			'ks' : 'ks'
			'partner_id': 'pid',
			'userName' : 'userName',
			'accountName' : 'account name'
		}
		this.sendMessage( authObject );
	}
	sendMessage: function( message ) {
		// send a message to the auth requesting page:
		this.authRequestPage.postMessage( JSON.stringify( message ), this.authRequestOrigin);
	},
}
// create the authPage:
new authPage();

