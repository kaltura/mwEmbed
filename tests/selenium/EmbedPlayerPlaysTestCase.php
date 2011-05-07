<?php
/* 
 * This test case is part of the SimpleSeleniumTestSuite.
 * Configuration for these tests are documented as part of SimpleSeleniumTestSuite.php
 */
class EmbedPlayerPlaysTestCase extends SeleniumTestCase {
	public $name = "Embed Player Playback Test";

	public function testBasic()
	{
    global $wgSeleniumTestsWikiUrl;
    $this->open($wgSeleniumTestsWikiUrl.'/modules/EmbedPlayer/tests/Player_Themable.html');
    //$this->open($wgSeleniumTestsWikiUrl.'/modules/EmbedPlayer/tests/Player_IncludeJQuery.html');
    
    $this->waitForPageToLoad(10000);
     
    $elementsPresent = array(
        "//div[@class='mwplayer_interface mv-player']",
        "//div[@class='play-btn-large']");
    $elementsResult = array();
    for ($i = 0; $i < count($elementsPresent); $i++) {
      $elementsResult[$i] = $this->isElementPresent($elementsPresent[$i], 10000);
      $this->assertEquals( $elementsResult[$i], true );
    }


	}


}
