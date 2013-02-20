<?php echo '<?xml version="1.0" encoding="ISO-8859-1" ?>' . "\n";
// Path to local git binnary
$kgGitBinPath = '/usr/bin/git';

/* get the config */
require_once( realpath( dirname( __FILE__ ) )  . '/doc-config.php' );

/* load kalturaCache helper */
require_once( dirname( __FILE__ ) . '/../modules/KalturaSupport/KalturaCache.php');
$cache = new KalturaCache( 'file_cache_adapter' );
/* check the cache */

/* poulate the cache */ 

// not from cache, give 5 min to generate:
set_time_limit( 300 );

echo generate_docs_rss();

function generate_docs_rss(){
	global $wgGitRepoPath ;
	$baseUrl = 'http://' . $_SERVER['HTTP_HOST'] . str_replace('rss.php', '', $_SERVER['REQUEST_URI']);
	ob_start();
?>
<rss version="2.0">
<channel>
	<title>Kaltura Feature Hub</title>
	<link><?php echo $baseUrl ?></link>
	<description>Demos, Configuration Options and Tools for Integrating the Kaltura Player</description>
<?php 
$featureSet = include( 'featureList.php' );
foreach( $featureSet as $featureCategoryKey => $featureCategory ){
	foreach( $featureCategory['featureSets'] as $featureSetKey => $featureSet){
		foreach( $featureSet['testfiles'] as $testfileKey =>  $testfile ){
			$filePath = realpath( dirname( __FILE__ ) . '/../modules/' . $testfile['path'] );
			$pageLink = $baseUrl . $featureCategoryKey .
					 '/' . $featureSetKey . '/' . $testfileKey;
			list( $description, $content ) = parseTestPage( $filePath );
			if( !$description ){
				$description = $testfile['title'];
			}
			
			if( $wgGitRepoPath ){
				$dateHR = trim( execGit( 'log -1 --format="%ad" -- ' . $filePath ) );
				$authorName = trim( execGit( 'log -1 --format="%an" -- ' . $filePath ) );
			} else {
				$dateHR = date( DATE_RFC822, filemtime($filePath) );
				$authorName = "kaltura";
			}
			echo "\n";
			?>
			<item>
				<title><?php echo $testfile['title'] ?></title>
				<link><?php echo $pageLink ?></link>
				<dc:creator><?php echo $authorName ?></dc:creator>
				<guid isPermaLink="true"><?php echo $pageLink ?></guid>
				<category domain="<?php echo $baseUrl . $featureCategoryKey?>"><?php echo $featureCategory['title'] ?></category>
				<pubDate><?php echo $dateHR ?></pubDate>
				<description><?php  echo $description ?></description>
				<content><?php echo $content ?></content>
			</item><?php 
		}
	}
}
?>
</channel>
</rss>
<?php 
	return ob_get_clean();
}
function parseTestPage( $filePath ){
	$description = '';
	$contet = '';
	// attempt to parse the flashvar for the description 
	$htmlContent = @file_get_contents( $filePath );
	preg_match('/\t\'flashvars\'\: \{([^\:]*)/', $htmlContent, $matches );
	if( isset($matches[1]) ){
		$pluginId = str_replace('\'', '', trim( $matches[1]) );
		$_REQUEST['plugin_id' ] = $pluginId;
		ob_start();
		include( dirname( __FILE__ ) . '/configManifest.php');
		$pluginJSON = ob_get_clean();
		$configObj = @json_decode( $pluginJSON );
		if( isset( $configObj->$pluginId->description ) ){
			$description = $configObj->$pluginId->description;
		} else {
			//die($filePath);
		}
	}
	return array( $description, strip_tags( $htmlContent) );
}

function execGit( $args ){
	global $wgGitRepoPath, $kgGitBinPath;

	// Make sure we are "in the repo" dir:
	if( is_dir( $wgGitRepoPath ) ){
		chdir( $wgGitRepoPath );
	}
	$gitOutput = shell_exec( $kgGitBinPath . ' ' . $args );
	return $gitOutput;
}
