<?php 
	$featureSet = include( 'featureList.php' );
	
	$o = '<ul id="kdoc-navbar" class="nav nav-list">';
	foreach( $featureSet as $key => $set ){
		$titleStr = ( isset( $set['title'] ) )? 'title="' . $set['title'] . '" ' : '';
		$o .= '<li class="nav-header" ' . $titleStr . ' >' .
				'<a style="color:#999" data-toggle="collapse" data-parent="#kdoc-navbar" href="#kdoc-navbar-' . $key . '" >'. str_replace('_', ' ', $key ) . '</a>' . 
			'</li>';
		$o .= '<div id="kdoc-navbar-' . $key .'" style="height:0px;overflow:hidden;">';
		foreach( $set['testfiles'] as $testfeature ){
			if( is_array( $testfeature ) ){
				$o.= '<li style="line-height: 24px"><a href="index.php?path=' . $key. '/'. $testfeature['hash'] . '">' . $testfeature['title'] . '</a></li>';
			}
		}
		$o .= '</div>';
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