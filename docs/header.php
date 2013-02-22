<?php 
	// Some includes for output of configuration options
	require_once( realpath( dirname( __FILE__ ) )  . '/doc-config.php' );
?><div class="navbar">
		<div class="navbar-inner">
		  <div class="container-fluid">
			 <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
			 </a>
			 <a href="index.php?path=main" class="brand"><img src="<?php echo $pathPrefix ?>images/logo-145.png" alt="Kaltura" width="149" height="79"></a>
			 <script >
			// add the active checkbox to the mode:
			if( localStorage.kdocEmbedPlayer == 'html5' ){
				$('.kdoc-settings [data-mode="html5"]')
				.prepend( '<i class="icon-ok" />&nbsp;' )
			} else {
				$('.kdoc-settings [data-mode="flash"]')
				.prepend( '<i class="icon-ok" />&nbsp;' )
			}
			$('.kdoc-settings .dropdown-menu a').click( function(){
				if( !$(this).find('.icon-ok').length ){
					localStorage.kdocEmbedPlayer = $(this).attr('data-mode');
					// refresh page 
					location.reload();
				}
				return false;
			})
			 </script>

			 <div class="nav-collapse pull-right">
				<ul class="nav">
				  <li class="main"><a href="index.php?path=main">Kaltura Player Features</a></li>
				  <li class="resources"><a href="index.php?path=resources">Developer Resources</a></li>
				  <li class="contact"><a href="index.php?path=contact">Contact Us</a></li>
				</ul>
				
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
		<i class="icon-search" style="position:relative;left:-24px;top:2px;"></i>
		</form>
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