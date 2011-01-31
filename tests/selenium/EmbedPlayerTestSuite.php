<?php
/*
 * Sample test suite. 
 * Two ways to configure MW for these tests
 * 1) If you are running multiple test suites, add the following in LocalSettings.php
 * require_once("tests/selenium/SimpleSeleniumConfig.php");
 * $wgSeleniumTestConfigs['SimpleSeleniumTestSuite'] = 'SimpleSeleniumConfig::getSettings';
 * OR
 * 2) Add the following to your Localsettings.php
 * $wgDefaultSkin = 'chick';
 */
class EmbedPlayerTestSuite extends SeleniumTestSuite
{
	public function setUp() {
		parent::setUp();
	} 
	public function addTests() {
		$testFiles = array(
			'selenium/EmbedPlayerLoadsTestCase.php'
		);
		parent::addTestFiles( $testFiles );
	}


}
