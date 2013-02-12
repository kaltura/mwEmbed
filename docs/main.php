	<div id="hps-contact"></div>
	<div class="hero-unit">
			<div class="tagline" >
				<h1>Player Features</h1>
				<p>Demos, Configuration Options and Tools for Integration into the Kaltura Player<p>
			</div>
			<div class="player-container">
			 	<!--  maintain 16/9 aspect ratio: -->
			 	<div id="dummy" style="margin-top: 56.25%;"></div>
			 	<div class="player-container-absolute">
					<div id="kaltura_player" style="width:100%;height:100%"></div>
				</div>
			</div>
			<script>
				kWidget.embed({
					'targetId' : 'kaltura_player',
					'wid' : '_243342',
					'uiconf_id' : '2877502',
					'entry_id' : '1_zm1lgs13'
				});
			</script>
	</div>
	<div class="feature-list">
	<?php 
	$featureSet = include( 'featureList.php' );
	$twoPerRow =0;
	foreach($featureSet as $featureCategoryKey => $featureCategory){
		if( $twoPerRow == 0 ){
			?><div class="row-fluid"><?php 
		}
		// output spans: 
		?>
		<div class="span6">
			<a href="index.php?path=<?php echo $featureCategoryKey?>">
				<h2><i style="margin-top:7px;margin-right:4px;" class="kicon-<?php echo $featureCategoryKey?>"></i><?php echo $featureCategory['title'] ?></h2>
			</a>
			<p><?php echo $featureCategory['desc']  ?></p>
			<ul>
				<?php foreach( $featureCategory['featureSets'] as $featureSetKey => $featureSet ){
					?><li><a href="index.php?path=<?php echo $featureCategoryKey . "/" . $featureSetKey?>">
						<?php echo $featureSet['title'] ?></a>
					</li><?php 
				}?>
			</ul>
		</div>
		<?php 
		
		if( $twoPerRow == 0 ){
			?><div><?php 
		}
		$twoPerRow+1;
		if( $twoPerRow == 2 ){
			$twoPerRow =0;
		}
	}
	?>
	</div>
	