<?php 
	// Some includes for output of configuration options
	require_once( realpath( dirname( __FILE__ ) )  . '/doc-base.php' );
?><div class="navbar">
		<div class="navbar-inner">
		  <div class="container-fluid">
			 <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
			 </a>
			 <a href="http://player.kaltura.com" class="brand"><img src="<?php echo $pathPrefix ?>images/logo-145.png" alt="Kaltura" width="149" height="79"></a>
			<div class="search-container pull-right">
				 <form class="navbar-search pull-right">
					<input id="kdoc-search" type="text" class="search-query" placeholder="Search" data-provide="typeahead" data-items="4" autocomplete="off"
						data-source='[<?php 
							$featureList = include( 'featureList.php' );
							$coma = '';
							foreach( $featureList as $featureCategoryKey => $featureCateogry ){
								foreach( $featureCateogry['featureSets'] as $featureSetKey => $featureSet ){
									foreach( $featureSet['testfiles'] as $testFile ){
										echo $coma . '"' . $testFile['title'] . '"';
										$coma = ',';
									}
								}
							}
						?>]'
					>
					<i class="icon-search" style="position:relative;left:-24px;top:-1px;"></i>
					<a href="http://corp.kaltura.com/free-trial" target="_new">
						<img alt="free trial" style="width:120px;position:relative;top:-5px;" src="images/free-trial.png">
					</a>
				</form>
			</div>

			 <div class="nav-collapse pull-right">
				<ul class="nav">
				  <li class="main"><a href="index.php?path=main">Overview</a></li>
				  <li class="features"><a href="index.php?path=autoEmbed">Features</a></li>
				  <li class="resources"><a href="index.php?path=resources">Developer Resources</a></li>
				  <li class="contact"><a href="index.php?path=contact">Contact Us</a></li>
				</ul>
				<script>
					$('#kdoc-search').change( function(){
						var tval = $(this).val();
						$('#kdoc-navbarcontainer a').each(function(){
							if( tval == $(this).text() ){
								$(this).click();
							}	
						});
					});
				</script>
			 </div><!--/.nav-collapse -->
		  </div>
		</div>
	 </div>
