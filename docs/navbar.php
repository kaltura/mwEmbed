<?php 
	$featureSet = include( 'featureList.php' );
	
	$o = '';
	foreach( $featureSet as $key => $set ){
		$titleStr = ( isset( $set['title'] ) )? 'title="' . $set['title'] . '" ' : ''; 
		$o.='<li class="nav-header" ' . $titleStr . ' >' . $key . '</li>';
		foreach( $set['testfiles'] as $testfeature ){
			if( is_array( $testfeature ) ){
				$o.= '<li><a href="index.php?path=' . $key. '#'. $testfeature['hash'] . '">' . $testfeature['title'] . '</a></li>';
			}
		}
	}
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