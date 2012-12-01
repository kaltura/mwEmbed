<?php
// Include configuration 
require_once( realpath( dirname( __FILE__ ) ) . '/../includes/DefaultSettings.php' );

// start gzip compression if avaliable: 
if(!ob_start("ob_gzhandler")) ob_start();

$authPage = new kalturaAuthPage();
$authPage->run();

class kalturaAuthPage {
	/**
	 * Main output page method
	 */
	function run(){
		global $wgKalturaAuthHTTPS, $wgKalturaAuthDomains, $wgHTTPProtocol;
		// Check for must run over https
		if( $wgKalturaAuthHTTPS && $wgHTTPProtocol != 'https' ){
			return $this->outputError( "Error, Kaltura Authentication page must run over <b>https</b>" );
		} 
		// Check Domain restrictions
		if( ! in_array($_SERVER['HTTP_HOST'], $wgKalturaAuthDomains ) ){
			return $this->outputError( "Error, Kaltura page can't run on this domain, " .$_SERVER['HTTP_HOST'] );
		}
		// output the javascript driven frame:
		$this->outputAuthPage();
	}
	function outputAuthPage(){
		$this->outputPageTop();
		// include jQuery & authPage code 
		?>
		<script src="../resources/jquery/jquery.min.js"></script>
		<script src="authPage.js"></script>
		<?php
	}
	function outputError( $msg ){
		$this->outputPageTop();
		echo $msg;
		$this->closePage();
	}
	function getServiceConfig( $name ){
		switch( $name ){
			case 'ServiceUrl' : 
				global $wgKalturaServiceUrl;
				return $wgKalturaServiceUrl;
				break;
			case 'ServiceBase':
				global $wgKalturaServiceBase;
				return $wgKalturaServiceBase;
				break;
		}
	}
	function outputPageTop(){
		// Output a full auth page
		?>
<!DOCTYPE HTML>
<html>
	<head>
	<style>
		body {
			padding: 15px;
		}
		body {
			margin: 0;
			font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
			font-size: 13px;
			line-height: 18px;
			color: #333;
			background-color: white;
		}
		h2 {
			font-size: 24px;
			line-height: 36px;
		}
		h1, h2, h3, h4, h5, h6 {
			margin: 0;
			font-family: inherit;
			font-weight: bold;
			color: inherit;
			text-rendering: optimizelegibility;
		}
	</style>
	</head>
	<body>
<?php 
	}
	
	function closePage(){
	?>
	</body>
</html><?php 
	}
}
	