<?php 
// Include configuration: ( will include LocalSettings.php, and all the extension hooks )
require(  dirname( __FILE__ ) . '/../../../../includes/DefaultSettings.php' );
session_start();

function getKs(){
	global $wgKalturaUserSecret, $wgKalturaServiceUrl, $wgKalturaServiceBase;
	
	$conf = new KalturaConfiguration( '243342' );
	$conf->serviceUrl = $wgKalturaServiceUrl;
	$conf->serviceBase = $wgKalturaServiceBase;
	$client = new KalturaClient( $conf );
	
	return $client->session->start ( $wgKalturaUserSecret,
		$_SERVER['REMOTE_ADDR'],
		KalturaSessionType::USER,
		'243342',
		3600, // expire in one hour
		"sview:0_mjbelixh" // give permission to "view" a given entry
	);
}
?><!DOCTYPE HTML>
<html>
<head>
<title>ExternalAuth post message page</title>
</head>
<body>
<?php 
	// check if this request has the log in stub: 
	if( isset( $_REQUEST['action'] ) ){
		switch( $_REQUEST['action'] ){
			case 'login':
				$_COOKIE['isAuthenticated'] = true;
				setcookie("isAuthenticated", true, time() + 3600*24);
				// close the window after the user logs in
				?>
				User is login, window will close in 1 second:
				<script>
				setTimeout(function(){
					self.close();
				},1000);
				</script>
				<?php 
			break;
			case 'logout':
				$_COOKIE['isAuthenticated'] = false;
				setcookie("isAuthenticated", false, time() + 3600*24);
			break;
		}
	}
?>
<div id="login" >
	<form method="get" action="ksPostMessageFrame.php">
		<input type="hidden" name="action" value="login">
		Demonstrates external Authentication flow for Kaltura player plugin, input any login value.
		<p><input type="text" name="login" value="" placeholder="Username or Email"></p>
		<p><input type="password" name="password" value="" placeholder="Password"></p>
		<p class="submit"><input type="submit" name="commit" value="Login"></p>
	</form>
</div>
<div id="authenticated">
	<form method="get" action="ksPostMessageFrame.php">
		<input type="hidden" name="action" value="logout">
		<p class="submit"><input type="submit" name="commit" value="Logout"></p>
	</form>
</div>
<script>
	// if users is logged in output "KS"
	var ks = <?php
		if( isset( $_COOKIE['isAuthenticated'] ) && $_COOKIE['isAuthenticated'] == true ){
			echo '"' . getKs() . '";';
		} else {
			echo 'null;';
		}
	?>
	
	if( ks ){
		document.getElementById('login').innerHTML = '';
	} else {
		document.getElementById('authenticated').innerHTML = '';
	}
	var isValidDomain = function( domain ){
		// domain list is just for "demo" URLs. Prodcution implementation 
		// would check secure Kaltura iframe server: https://cdnapisec.kaltura.com
		var domainList = ["localhost", "kgit.html5video.org", "player.kaltura.com"];
		for( var i=0; i < domainList.length; i++){
			if( domain == domainList[i] ){
				return true;
			}
		}
		return false;
	}
	// listen to login respond with ks, error login or error domain: 
	window.addEventListener("message", function( event ){
		if( event.data == 'kaltura-externalAuth-check' ){
			var originDomain  = event.origin.split('/').slice(2,3)[0];
			if( isValidDomain( originDomain ) ){
				if( ks ){
					event.source.postMessage( JSON.stringify( {'ks': ks}),  event.origin);
				} else {
					event.source.postMessage( JSON.stringify( {'error': 'login'}),  event.origin);
				}
			} else {
				event.source.postMessage( JSON.stringify( {'error': 'domain'}),  event.origin);
			}
		}
	});
</script>
</body>
</html>