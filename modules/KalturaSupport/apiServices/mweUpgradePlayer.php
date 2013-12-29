<?php

require_once( dirname( __FILE__ ) . '/../KalturaCommon.php' );

$wgMwEmbedApiServices['upgradePlayer'] = 'mweUpgradePlayer';

class mweUpgradePlayer {
	function run(){
	    global $container;
	    $uiConfResult = $container['uiconf_result'];
		echo json_encode($uiConfResult->getPlayerConfig());
	}
}