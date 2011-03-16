<?php
/* 
 * This test case is part of the SimpleSeleniumTestSuite.
 * Configuration for these tests are documented as part of SimpleSeleniumTestSuite.php
 */
class EmbedPlayerLoadsTestCase extends SeleniumTestCase {
	public $name = "Embed Player Loading Test";

	public function testBasic()
	{
    global $wgSeleniumTestsWikiUrl;
    $this->open($wgSeleniumTestsWikiUrl.'/modules/EmbedPlayer/tests/Player_Themable.html');
    
    $this->waitForPageToLoad(10000);
    
    $this->isElementPresent("//div[@class='mwplayer_interface k-player']", 10000);
    $this->isElementPresent("//div[@class='mwplayer_interface mv-player']", 10000);
    $this->isElementPresent("//div[@class='ui-state-default play-btn-large']", 10000);

	}


}
