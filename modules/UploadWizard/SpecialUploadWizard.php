<?php
/**
 * Special:UploadWizard
 *
 * Usability Initiative multi-file upload page.
 *
 * @file
 * @ingroup SpecialPage
 * @ingroup Upload
 */

class SpecialUploadWizard extends SpecialPage {

	// $request is the request (usually wgRequest)
	// $par is everything in the URL after Special:UploadWizard. Not sure what we can use it for
    public function __construct( $request=null ) {
		global $wgEnableJS2, $wgEnableAPI, $wgRequest;

		if (! $wgEnableJS2) {
			// XXX complain
		}

		if (! $wgEnableAPI) {
			// XXX complain
		}

		// here we would configure ourselves based on stuff in $request and $wgRequest, but so far, we
		// don't have such things

		parent::__construct( 'UploadWizard', 'upload' );

		$this->simpleForm = new UploadWizardSimpleForm();
		$this->simpleForm->setTitle( $this->getTitle() );
    }

	public function execute() {
		global $wgUser, $wgOut, $wgMessageCache;

		# Check uploading enabled
		if( !UploadBase::isEnabled() ) {
			$wgOut->showErrorPage( 'uploaddisabled', 'uploaddisabledtext' );
			return;
		}

		# Check permissions
		global $wgGroupPermissions;
		if( !$wgUser->isAllowed( 'upload' ) ) {
			if( !$wgUser->isLoggedIn() && ( $wgGroupPermissions['user']['upload']
				|| $wgGroupPermissions['autoconfirmed']['upload'] ) ) {
				// Custom message if logged-in users without any special rights can upload
				$wgOut->showErrorPage( 'uploadnologin', 'uploadnologintext' );
			} else {
				$wgOut->permissionRequired( 'upload' );
			}
			return;
		}

		# Check blocks
		if( $wgUser->isBlocked() ) {
			$wgOut->blockedPage();
			return;
		}

		# Check whether we actually want to allow changing stuff
		if( wfReadOnly() ) {
			$wgOut->readOnlyPage();
			return;
		}


		$wgMessageCache->loadAllMessages();

		$this->setHeaders();
		$this->outputHeader();

		$wgOut->addHTML(
			'<div id="upload-licensing" class="upload-section" style="display: none;">Licensing tutorial</div>'
			. '<div id="upload-wizard" class="upload-section"><div class="loadingSpinner"></div></div>'
		);

		$wgOut->addHTML('<noscript>');
		$this->simpleForm->show();
		$wgOut->addHTML('</noscript>');


		//$j('#firstHeading').html("Upload wizard");

		$this->addJS();
	}

	/**
	 * Adds some global variables for our use, as well as initializes the UploadWizard
	 */
	public function addJS() {
		global $wgUser, $wgOut;
		global $wgUseAjax, $wgAjaxLicensePreview, $wgEnableAPI;
		global $wgEnableFirefogg, $wgFileExtensions, $wgCanonicalNamespaceNames;

		$wgOut->addScript( Skin::makeVariablesScript( array(
			// uncertain if this is relevant. Can we do license preview with API?
			'wgAjaxLicensePreview' => $wgUseAjax && $wgAjaxLicensePreview,

			'wgEnableFirefogg' => (bool)$wgEnableFirefogg,

			// what is acceptable in this wiki
			'wgFileExtensions' => $wgFileExtensions,

			// our edit token
			'wgEditToken' => $wgUser->editToken(),

			// URL prefixes in this MediaWiki, e.g. images under Image:
			'wgCanonicalNamespaceNames' => $wgCanonicalNamespaceNames 

			// 'wgFilenamePrefixBlacklist' => UploadBase::getFilenamePrefixBlacklist();


			// in the future, we ought to be telling JS land other things,
			// like: requirements for publication, acceptable licenses, etc.

			) )
		);


//
//		$initScript = <<<EOD
//EOD;
//		$wgOut->addScript( Html::inlineScript( $initScript ) );
		// not sure why -- can we even load libraries with an included script, or does that cause things to be out of order?
		global $wgScriptPath;
		$wgOut->addNamedResource( 'UploadWizardPage', 'page');


		// XXX unlike other vars this is specific to the file being uploaded -- re-upload context, for instance
		// Recorded here because we may probably need to
		// bring it back in some form later. Reupload forms may be special, only one file allowed
		/*
		$scriptVars = array(
			'wgUploadAutoFill' => !$this->mForReUpload,
			'wgUploadSourceIds' => $this->mSourceIds,
		);
		*/


	}

}


/**
 * This is a hack on UploadForm.
 * Normally, UploadForm adds its own Javascript.
 * We wish to prevent this, because we want to control the case where we have Javascript.
 * So, we subclass UploadForm, and make the addUploadJS a no-op.
 */
class UploadWizardSimpleForm extends UploadForm {
	protected function addUploadJS( ) { }

}

/*
// XXX UploadWizard extension, do this in the normal SpecialPage way once JS2 issue resolved
function wfSpecialUploadWizard( $par ) {
	global $wgRequest;
	// can we obtain $request from here?
	// $this->loadRequest( is_null( $request ) ? $wgRequest : $request );
	$o = new SpecialUploadWizard( $wgRequest, $par );
	$o->execute();
}
*/
