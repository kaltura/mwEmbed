<?php 
$featureSet = include( 'featureList.php' );
$featureKey = htmlspecialchars( $_REQUEST['path'] );
if( ! isset( $featureSet[$featureKey ] ) ){
	echo "feature set path ". $featureKey . " not found "; 
	return ;
} else{
	$feature = $featureSet[ $featureKey ];
}
// output the title: 
?>
<h2 id="hps-<?php echo $featureKey; ?>"><?php echo $feature['title'] ?></h2>
<p> <?php echo $feature['desc'] ?></p>
<script>
	var iframeLoadCount =0; 
	function handleLoadedIframe( id ){
		$('#loading_' + id ).remove();
		iframeLoadCount++;
		doSync = true;
		if( iframeLoadCount == <?php  echo count( $feature['testfiles'] ) ?> ){
			// done loading get correct offset for hash
			var aNode = $('body').find('a[name="' + location.hash.replace('#', '') +'"]')[0];
			aNode.scrollIntoView();
		}
	}
	var doSync = false;
	function sycnIframeContentHeight(){
		doSync = true;
	}
	setInterval( function(){
		if( doSync ){
			doSync = false;
			$('iframe').each(function(){
				$( this ).css(
					'height', 
					$( $( this )[0].contentWindow.document ).height()
				)
			});
		}
	}, 200 );
	
	
</script>
<?php 
foreach( $feature['testfiles'] as $testFile ){
	$iframeId = 'ifid_' . $testFile['hash'];
	?>
	<br>
	<a name="<?php echo $testFile['hash'] ?>" href="../modules/<?php echo  $testFile['path']; ?>" target="_new" >
		<span style="text-transform: lowercase; padding-top: 50px; margin-top: -50px;font-size:x-small"> <?php echo $testFile['title'] ?> test page >>> </span>
	</a>
	<br>
	<iframe style="border:none;width:100%;height:0px" 
		id="<?php echo $iframeId ?>" 
		onload="handleLoadedIframe('<?php echo $iframeId ?>')" 
		src="../modules/<?php echo $testFile['path'] ?>">
	</iframe>
	<span id="loading_<?php echo $iframeId ?>">Loading <?php echo $testFile['hash']?><span class="blink">...</span> </span> 
	<?php 
}
?>
