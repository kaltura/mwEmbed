<?php
/**
* This file enables slow javascript response for testing blocking scripts relative to player embeds
*/
$wgMwEmbedApiServices['languageSupport'] = 'mweLanguageSupport';
$wgMwEmbedApiServices['languageKeys'] = 'mweLanguageKeys';

class mweLanguageSupport {
	function run(){
		global $coreLanguageNames, $messages;
		// get the list of language names
		require_once( dirname( __FILE__ ) . '/../../../includes/languages/Names.php' );
		// get all the message supported in embedPlayer
		$messages = json_decode( file_get_contents(dirname( __FILE__ ) .'/../../EmbedPlayer/EmbedPlayer.i18n.json'), TRUE );
		$embedPlayerMessages = $messages;
		
		// get all the messages supported in KalturaSupport:
		$messages = json_decode( file_get_contents(dirname( __FILE__ ) .'/../KalturaSupport.i18n.json'), TRUE );
		$kMessages = $messages;

		// sort language keys A-Z: 
		ksort( $coreLanguageNames );
		$messageSupport = array();
		// build support list array: 
		foreach( $coreLanguageNames as $key => $name){
			$support = 'none';
			if( isset( $embedPlayerMessages[$key]) ){
				$support = 'partial';
			} 
			if( isset( $kMessages[ $key ] ) ){
				$support = 'full';
			}
			$messageSupport[$key] = array( 
				'name' => $name,
				'support'=> $support
			);
		}
		echo json_encode($messageSupport);
	}
}

class mweLanguageKeys {
	function run(){
		// get all the message supported in embedPlayer
		$messages = json_decode( file_get_contents(dirname( __FILE__ ) .'/../../EmbedPlayer/EmbedPlayer.i18n.json'), TRUE );
		$embedPlayerMessages = $messages['en'];
		// get all the messages supported in KalturaSupport:
		$messages = json_decode( file_get_contents(dirname( __FILE__ ) .'/../KalturaSupport.i18n.json'), TRUE );
        $kMessages = $messages['en'];
        echo json_encode(array_merge($embedPlayerMessages, $kMessages));
	}
}