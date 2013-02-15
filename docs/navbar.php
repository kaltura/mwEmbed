<?php 
	$featureSet = include( 'featureList.php' );
	$o = '<ul id="kdoc-navbar">';
	foreach( $featureSet as $featureCategoryKey => $featureCategory ){
		// output a top level li
		$o.='<li class="nav-header nav-category">' .
			'<a title="' . $featureCategory['title'] . '" ' . 
				'class="link-category" ' .
				'data-toggle="collapse" ' .
				'data-parent="#kdoc-navbar" ' .
				'href="#kdoc-nav-' . $featureCategoryKey . '" '.
			'>' .
				'<i class="kicon-'. strtolower( $featureCategoryKey ) . '"></i>' .
				'<span>'. str_replace('_', ' ', $featureCategory['title']  ) .'</span>' .
		'	</a>'; 
		$o.='<ul id="kdoc-nav-' . $featureCategoryKey . '" class="nav nav-list" style="height:0px;overflow:hidden;">';
		foreach( $featureCategory['featureSets'] as $featureSetKey => $featureSet){
			$o .='<li class="nav-header nav-feature-category" >' .
					'<a style="color:#999" ' .
						'title="' . $featureSet['title'] . '" ' . 
						'data-toggle="collapse" '.
						'onClick="javascript:$(this).parent().parent().css(\'height\',\'auto\');" '.
						'href="#kdoc-nav-' . $featureSetKey . '" ' .
					'>' . 
							str_replace('_', ' ', $featureSetKey ) . 
					'</a>' . 
				'</li>';
			$o .= '<div id="kdoc-nav-' . $featureSetKey .'" style="height:0px;overflow:hidden;">';
			foreach( $featureSet['testfiles'] as $testfileKey =>  $testfile ){
				$o.= '<li style="line-height: 24px"><a href="index.php?path=' . $featureCategoryKey. 
					'/'. $featureSetKey . '/' .$testfileKey . '">' . $testfile['title'] . '</a></li>';
			}
			$o .= '</div>';
		}		
		$o.='</ul>';
		$o.='</li>';
	}
	$o.= '</ul>';
	echo $o;
?>

<!--  build out automatically.
              <li class="nav-header">Embeding</li>
              <li><a href="#">Object rewrite</a></li>
              <li><a href="#">kWidget embed</a></li>
              <li><a href="#">kWidget thumb embed</a></li>
              <li><a href="#">Kwidget Playlist</a></li>
              <li class="nav-header">Analytics</li>
              <li><a href="#">Nielsen Combined</a></li>
              <li><a href="#">Nielsen Video Sensus</a></li>
              <li><a href="#">Kaltura Analytics</a></li>
              <li><a href="#">Omniture</a></li>
              <li><a href="#">Conviva</a></li>
              <li class="nav-header">Ads</li>
              <li><a href="#">Kaltura Vast ads</a></li>
              <li><a href="#">Double Click</a></li>
              <li><a href="#">Freewheel</a></li>
              <li class="nav-header">Player Features</li>
              <li><a href="#">Playlist</a></li>
              <li><a href="#">Access controls</a></li>
              <li><a href="#">Bumper etc.</a></li>
 -->