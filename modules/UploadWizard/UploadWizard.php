<?php
/**
 * Add Media Wizard extension
 *
 * @file
 * @ingroup Extensions
 *
 * This file contains the include file for the Add Media Wizard support
 * The addMediaWizard is dependent on JS2Support and
 * the core "AddMedia" module
 *
 * Usage: Include the following line in your LocalSettings.php
 * require_once( "$IP/extensions/JS2Support/AddMediaWizard/AddMediaWizard.php" );
 *
 * @author Neil Kandalgaonkar <neil@wikimedia.org>
 * @license GPL v2 or later
 * @version 0.1.1
 */

/* Configuration */


// Credits
$wgExtensionCredits['jsModule'][] = array(
	'path' => __FILE__,
	'name' => 'Upload Wizard',
	'author' => 'Neil Kandalgaonkar',
	'version' => '0.1.1',
	'descriptionmsg' => 'uploadwizard-desc',
	'url' => 'http://www.mediawiki.org/wiki/Extension:UploadWizard'
);

// Check for JS2 support
if( ! isset( $wgEnableJS2system ) ){
	throw new MWException( 'UploadWizard requires JS2 Support. Please include the JS2Support extension.');
}


$dir = dirname(__FILE__) . '/';

$wgExtensionMessagesFiles['UploadWizard'] = $dir . 'UploadWizard.i18n.php';
$wgExtensionAliasesFiles['UploadWizard'] = $dir . 'UploadWizard.alias.php';

# Add the special page
$wgAutoloadLocalClasses[ 'SpecialUploadWizard' ] = $dir . 'SpecialUploadWizard.php';
$wgSpecialPages['UploadWizard'] = 'SpecialUploadWizard';
$wgSpecialPageGroups['UploadWizard'] = 'media';

$wgResourceLoaderNamedPaths[ 'UploadWizardPage' ] = 'extensions/UploadWizard/UploadWizardPage.js';

// Set up the javascript path for the loader and localization file.
$wgExtensionJavascriptModules[ 'UploadWizard' ] = 'extensions/UploadWizard';

