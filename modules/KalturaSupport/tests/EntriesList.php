<?php 
 
// Load Kaltura API v3
include_once(  dirname( __FILE__ ) . '/../kaltura_client_v3/KalturaClient.php' );

class EntriesList {
	
	var $perPage = 25;
	var $totalEntries = 0;
	
	function createKs( $partnerId, $secret, $email, $password ) {
		
		$userId = 0;
		$type = 2;
		$expiry = 43200;
		$privileges = null;
		
		$conf = new KalturaConfiguration( $partnerId );
		$client = new KalturaClient( $conf );
		
		if( $partnerId && $secret ) {
			$session = $client->session->start($secret, $userId, $type, $partnerId, $expiry, $privileges);
		} elseif( !( empty($email) && empty($password) ) ) {
			$session = $client->adminUser->login($email, $password);
		} else {
			die('Some fields are missing');
		}
		return $session;		
	}
	
	function getClient( $partnerId, $ks ) {
		
		$conf = new KalturaConfiguration( $partnerId );
		$client = new KalturaClient( $conf );
		
		$client->setKS( $ks );
		return $client;
	}
	
	function getEntriesByKs( $partnerId, $ks, $page = 1 ) {
	
		// Get Client
		$client = $this->getClient( $partnerId, $ks );
		
		// Set Filter		
		$filter = new KalturaMediaEntryFilter();
		//$filter->partnerIdEqual = $partnerId;
		$filter->mediaTypeEqual = '1';
		
		// Set Pager
		$pager = new KalturaFilterPager();
		$pager->pageSize = $this->perPage;
		$pager->pageIndex = $page;
	
		// Get Results	
		$results = $client->baseEntry->listAction($filter, $pager);	
		$this->totalEntries = $results->totalCount;
		
		return $results;
	}
	
}

if( (isset($_POST['partnerId']) && isset($_POST['adminSecret'])) ||
 (isset($_POST['email']) && isset($_POST['password']))
 ) {
	// Create KS
	$partnerId = intval($_POST['partnerId']);
	$Entries = new EntriesList;
	$ks = $Entries->createKs( $partnerId, $_POST['adminSecret'], $_POST['email'], $_POST['password'] );
	
	// Create URL
	$url = 'http://' . $_SERVER['SERVER_NAME'] . '/' . $_SERVER['SCRIPT_NAME'] . '?ks=' . $ks;
	header("location: ". $url);
	exit();
	
}

if( isset($_GET['ks']) ) {
	
	$url = 'http://' . $_SERVER['SERVER_NAME'] . '/' . $_SERVER['SCRIPT_NAME'] . '?ks=' . $_GET['ks'];
	
	$splitKs = explode(";", base64_decode($_GET['ks']));
	$partnerId = $splitKs[1];

	// Set the page
	$page = (isset($_GET['page'])) ? intval($_GET['page']) : 1;
	$page = ( $page < 2 ) ? 1 : $page;
		
	// Get Results
	$Entries = new EntriesList;		
	$results = $Entries->getEntriesByKs( $partnerId, $_GET['ks'], $page );
	$results = $results->objects;
	
	// Get Max Pages
	$maxPages = ceil($Entries->totalEntries / $Entries->perPage);
	
}

?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
	<title>Entries List</title>    
	<script type="text/javascript" src="../../../mwEmbedLoader.js"></script> 
	<script type="text/javascript">
	var partnerId = <?php echo $partnerId; ?>;
	var page = <?php echo $page; ?>;
	var maxPages = <?php echo $maxPages; ?>;
	var prevUrl = '<?php echo $url . '&page=' . ($page - 1); ?>';
	var nextUrl = '<?php echo $url . '&page=' . ($page + 1); ?>';
	
	mw.ready( function(){
		
		mw.setConfig( 'EmbedPlayer.OverlayControls', false );	
	
		mw.load(["MD5", 'mw.KApi'], function(){});
		
		$j('.entry').click( function(){
			var entryId = this.hash.slice(1);
			$j( '#videoContainer' ).loadingSpinner();				
			mw.load( 'EmbedPlayer', function(){
				
				$j( '#videoContainer' ).html(
					$j('<video />')
					.css({
						'width' : 400,
						'height' : 300
					})
					.attr({
						'kentryid' : entryId,
						'kwidgetid' : '_' + partnerId
					})			
				);
				
				// Rewrite all the players on the page
				$j.embedPlayers();
			});
		});

		if( page <= 1) {
			$j( '.navigation a[hash=#prev]' ).css('display', 'none');
		} else {
			$j( '.navigation a[hash=#prev]' ).click( function() {
				window.location.href=prevUrl;
			} );
		}

		if( page >= maxPages) {
			$j( '.navigation a[hash=#next]' ).css('display', 'none');
		} else {
			$j( '.navigation a[hash=#next]' ).click( function() {
				window.location.href=nextUrl;
			} );
		}
		
	} );
	</script>
	<style>
	.clear { clear: both; }
	.left { float: left; }
	.right { float: right; }
	#wrapper { width: 400px; }
	#videoContainer { width:400px; text-align: center; }
	.navigation { clear: both; }
	ul { list-style-type: none; margin: 0; padding: 0; }
	li { clear: both; padding: 0 0 20px 0; }
	li img { float: left; margin: 0 10px 4px 0; }
	li h4 { padding: 30px 0 0 0; }	
	</style>
</head>
<body>
<div id="wrapper">
	<h2> Kaltura HTML5 Player Demo </h2>
	<?php if( !isset($_GET['ks']) ) { ?>
	<form method="post">
		<span style="width:300px;float:left">
			Partner Id: <input name="partnerId" size="15" /><br />
			Admin Secret: <input name="adminSecret" size="15" /><br />
			<strong>OR:</strong><br />
			Email: <input name="email" size="15" /><br />
			Password: <input name="password" type="password" size="15" /><br />			
			<input type="submit" value="Create URL" />
		</span>
	</form>
	<?php }  else {
	
		if( empty($results) ) { 
			echo 'No videos were found.';
		 } else { 
	?>
	<div id="videoContainer">Please Choose Video</div>
	<div class="clear"></div>
	<div class="navigation">
		<a class="left" href="#prev">Prev</a>
		<a class="right" href="#next">Next</a>
	</div>
	<ul>
	<?php 
			foreach($results as $res) {
				//print_r($res);
				$entry = '<li><a class="entry" href="#' . $res->id .'">';
				$entry .= '<img src="' . $res->thumbnailUrl . '" />';
				$entry .= '<h4>' . $res->name . '</h4></a></li>';
				echo $entry;
			}
	?>
	</ul>
	<div class="navigation">
		<a class="left" href="#prev">Prev</a>
		<a class="right" href="#next">Next</a>
	</div>
	<?php	
		 } 
	}
	?>
</div>
</body>
</html>
