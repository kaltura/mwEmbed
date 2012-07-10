<?php 
return array(
	"mw.MwEmbedSupport" => array( 
		'scripts' => array( 
			"mw.MwEmbedSupport.js",
		),
		'debugRaw' => false,
		'dependencies' => array(
			// jQuery dependencies:
			'jquery.triggerQueueCallback',
			'Spinner',
			'jquery.loadingSpinner',
			'jquery.mwEmbedUtil',
			'mw.MwEmbedSupport.style',
		),
		'messageFile' => 'MwEmbedSupport.i18n.php',
	),
	"Spinner" => array(
		'scripts' => 'jquery.loadingSpinner/Spinner.js',
	),
	'iScroll' => array(
		'scripts' => 'iscroll/src/iscroll.js',
	),
	"jquery.loadingSpinner" => array(
		'scripts' => 'jquery.loadingSpinner/jquery.loadingSpinner.js',
	),
	'mw.MwEmbedSupport.style' => array(
		// NOTE we add the loadingSpinner.css as a work around to the resource loader register
		// of modules as "ready" even though only the "script" part of the module was included.
		'styles'=> array( 'skins/common/MwEmbedCommonStyle.css' ),
		'skinStyles' => array(
			/* shared jQuery ui skin styles */
			'darkness' => 'skins/jquery.ui.themes/darkness/jquery-ui-1.7.2.css',
			'kaltura-dark' => 'skins/jquery.ui.themes/kaltura-dark/jquery-ui-1.7.2.css',
			'le-frog' => 'skins/jquery.ui.themes/le-frog/jquery-ui-1.7.2.css',
			'redmond' => 'skins/jquery.ui.themes/redmond/jquery-ui-1.7.2.css',
			'start' => 'skins/jquery.ui.themes/start/jquery-ui-1.7.2.css',
			'sunny' => 'skins/jquery.ui.themes/sunny/jquery-ui-1.7.2.css',	
		),
	),	
	'mediawiki.UtilitiesTime' => array( 'scripts' => 'mediawiki/mediawiki.UtilitiesTime.js' ),
	'mediawiki.client' => array( 'scripts' => 'mediawiki/mediawiki.client.js' ),
	'mediawiki.absoluteUrl' => array( 'scripts' => 'mediawiki/mediawiki.absoluteUrl.js',
		'dependancies' => array( 'mediawiki.Uri' ),
	),
	
	'mediawiki.language.parser' => array( 
		'scripts'=> 'mediawiki/mediawiki.language.parser.js',
		'debugRaw' => false,
		'dependencies' => array( 'mediawiki.language', 'mediawiki.util' ),
	),
	'fullScreenApi'=> array(
		'scripts' => 'fullScreenApi/fullScreenApi.js'
	),
	'jquery.menu' => array(
		'scripts' => 'jquery.menu/jquery.menu.js',
		'styles' => 'jquery.menu/jquery.menu.css'
	),
	'jquery.ui.touchPunch' => array(
		'scripts' => 'jquery/jquery.ui.touchPunch.js',
		'dependencies' => array(
			'jquery.ui.core'
		)
	),
	// Startup modules must set debugRaw to false
	"jquery.triggerQueueCallback"	=> array( 
		'scripts'=> "jquery/jquery.triggerQueueCallback.js",
		'debugRaw' => false
	),
	"jquery.mwEmbedUtil" => array( 
		'scripts' => "jquery/jquery.mwEmbedUtil.js",
		'debugRaw' => false,
		'dependencies' => array(
			'jquery.ui.dialog'
		)
	),
);
