<?php 
$featureSet = include( 'featureManifest.php' );

if( ! isset( $featureSet[ $_REQUEST['path'] ] ) ){
	echo "feature set path ". htmlspecialchars( $_REQUEST['path'] ) . " not found "; 
	return ;
} else{
	$feature = $featureSet[ $_REQUEST['path'] ];
}
// output the title: 
?>
<h3><?php echo $feature['title'] ?></h3>
<p> <?php echo $feature['desc'] ?></p>
<script>
	function autoResizeIframe( id ){
		$('#' + id ).css(
			'height', 
			$('#' + id )[0].contentWindow.document .body.scrollHeight
		)
	}
</script>
<?php 
foreach( $feature as $testFile ){
	if( !is_array( $testFile ) ){
		continue;
	}
	$iframeId = 'ifid_' + $testFile['hash'];
	?>
	<a name="<?php echo $testFile['hash'] ?>"></a><h3><?php echo $testFile['title'] ?></h3>
	<iframe style="border:none;width:100%;height:0px" 
		id="<?php echo $iframeId ?>" 
		onload="autoResizeIframe('<?php echo $iframeId ?>')" 
		src="../modules/<?php echo $testFile['path'] ?>">
	</iframe>
	<?php 
}
?>
