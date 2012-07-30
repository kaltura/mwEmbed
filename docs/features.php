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
<?php 
foreach( $feature as $testFile ){
	if( !is_array( $testFile ) ){
		continue;
	}
	?>
	<a name="<?php echo $testFile['hash'] ?>"></a><h3><?php echo $testFile['title'] ?></h3>
	<iframe style="border:none;width:auto;height:auto" src="../modules/<?php echo $testFile['path'] ?>"></iframe>
	<?php 
}
?>
