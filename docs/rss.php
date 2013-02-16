<?php echo '<?xml version="1.0" encoding="ISO-8859-1" ?>' . "\n";

$baseUrl = 'http://' . $_SERVER['HTTP_HOST'] . str_replace('rss.php', '', $_SERVER['REQUEST_URI']);

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
			?>
			<item>
				<title><?php echo $testfile['title'] ?></title>
				<link><?php echo $baseUrl . $featureCategoryKey .
					 '/' . $featureSetKey . '/' . $testfileKey ?></link>
				<description><?php 
				// for now just [re]output the title: 
				echo $testfile['title'];
				?></description>
			</item>
			<?php 
		}
	}
}
?>
</channel>
</rss>