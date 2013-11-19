	<div id="hps-main"></div>
	<div class="hero-unit">
			<div class="tagline" >
				<h1>Kaltura Player ToolKit</h1>
				<p>Demos, Configuration Options and Tools for Creating Kaltura Player Experiences<p>
			</div>
			<div class="player-container">
			 	<!--  maintain 16/9 aspect ratio: -->
			 	<div id="dummy" style="margin-top: 57%;"></div>
			 	<div class="player-container-absolute">
					<div id="kaltura_player" style="width:100%;height:100%"></div>
				</div>
			</div>
			<script>
				kWidget.embed({
					'targetId' : 'kaltura_player',
					'wid' : '_243342',
					'uiconf_id' : '20540612',
					'entry_id' : '1_sf5ovm7u',
					'flashvars':{
						'loop':true,
						// set player css file to overide play button: 
						'mediaProxy.preferedFlavorBR': 1600
					}
				});
			</script>
	</div>
	<br>
	<br>
	<strong>The Kaltura Player</strong> leads the industry in <a href="#KeyFeatures" title="Key Features">flexibility</a>, 
	<a href="#Integration" title="Customization">ease of customization</a>, 
	<a href="#Plugins">plug-in offerings</a> and 
	<a href="#Performance">loading speed.</a> 
	<br>
	<br>
	<div id="playbackModeSelector" style="float:right"></div>
	<script>
	updatePlaybackModeSelector( $('#playbackModeSelector') );
	</script>
	Every feature is supported for both both HTML5 and Flash with 
	the same configuration, bringing <strong>unparalleled</strong> ease of feature integration across platforms.
	We invite to explore the vast feature set of the Kaltura Player on your Tablets and Mobile Devices, 
	and use the HTML5 / Flash player switch tool present on almost all feature pages. 
	<br><br>
	<i>Note this site does not represent every feature available for the Kalura player. </i>
	<br>
	<a name="HTML5"></a>
	<div class="blurb-left">
		<div class="blurb-img" >
			<a http://blog.kaltura.org/kaltura-html5-update-brings-new-features-and-best-in-class-performance" target="_blank">
				<img class="shadow" style="padding-top:22px; background:white" src="images/platforms.jpg" />
			</a>
		</div>
		<div class="blurb-txt">
		<h2>Multi-Platform Support</h2>
		<p>Our HTML5 video library provides you with the most advanced mobile delivery technology stack available today. 
		Our smart-player technology delivers the right player, stream, and advertising to 
		the right device anywhere, with just a single embed code.  
		<br><br>
		You can extend the functionality of both Flash and HTML5
		 players with our <a href="index.php?path=resources">Unified development API</a>.<br><br>
		 Check out the <a href="http://html5video.org/wiki/Kaltura_Video_Library_Compatibility_Chart" target="_new">detailed feature chart</a> for what features are supported in what platofmrs
		 </p>
		 
		</div>
		<div style="clear:both"></div>
	</div>

	<a name="Performance"></a>
	<br>
	<div class="blurb-right">
		<div class="blurb-img">
			<a http://blog.kaltura.org/kaltura-html5-update-brings-new-features-and-best-in-class-performance" target="_blank">
				<img class="shadow" style="padding-top:22px; background:white; width:440px;" src="images/player-load-play-time.png" />
			</a>
		</div>
		<div class="blurb-txt">
		<h2>Unparalleled Robust Performance</h2>
		<p>Our player library features an advanced resource loader developed in collaboration with Wikimedia Foundation.
		The resource loader supports
		dynamically packing of modules, features and player metadata. It minimizes, gizpis and packages, CSS, images,
		HTML, JavaScript, metadata, and per player features into a single non-blocking payload. 
		This, combined with Kaltura's <a href="autoEmbed">AutoEmbed</a> embed code, enables the player rendering to 
		take full advantage <i>fetch ahead</i> parallel 
		JavaScript resource loading in modern browsers. This delivers fast player rendering even on sites 
		with many other active script includes. 
		<br><br>
		This means you get 
		<a href="http://blog.kaltura.org/kaltura-html5-update-brings-new-features-and-best-in-class-performance" target="_blank">best in class performance</a> 
		of all your features, with out the delays in traditional feature rich player build out.
		
		</div>
		<div style="clear:both"></div>
	</div>
	
	<a name="Plugins"></a>
	<br>
	<div class="blurb-left">
		<div class="blurb-img">
			<div class="logos">
				<a href="index.php?path=kvast"><img src="images/icon.vast.jpg" style="height:50px"></a>
				<a href="index.php?path=DoubleClick"><img src="images/dfp.logo.png" ></a>
				<a href="index.php?path=FreeWheel"><img src="images/freewheel.logo.jpg"></a>
				<a href="index.php?path=Tremor"><img src="images/tremor.logo.jpg"></a>
				<a href="index.php?path=GoogleAnalytics"><img src="images/googleanalytics.logo.png"></a>
				<a href="index.php?path=NielsenCombined"><img src="images/nielsenlogo.jpg"></a>
				<a href="index.php?path=ComscoreAnalytics"><img src="images/comscore.logo.jpg"></a>
				<a href="index.php?path=OmnitureOnPage"><img src="images/omniture.logo.jpg"></a>
			</div>
		</div>
		<div class="blurb-txt" >
		<h2>Advertising and Analytics</h2>
		<p>Kalturas flexible player platform integrates with all the major Ad networks and Analytics providers.
		
		Kaltura supports a wide range of video ad formats including <a href="index.php?path=VastAdPods">VAST 3.0</a>, 
		and integrated plugins 
		for numerous video ad networks, such as <a href="index.php?path=DoubleClick">Google DoubleClick DFP</a>, 
		<a href="index.php?path=FreeWheel">FreeWheel</a>, 
		<a target="_blank" href="http://knowledge.kaltura.com/kaltura%E2%80%99s-generic-ads-player-plugin-vast">Ad Tech</a>, 
		<a target="_blank" href="http://knowledge.kaltura.com/kaltura%E2%80%99s-generic-ads-player-plugin-vast">Eye Wonder</a>, 
		<a target="_blank" href="http://knowledge.kaltura.com/faq/how-configure-adaptv-plugin">AdapTV</a>, 
		<a href="index.php?path=Tremor">Tremor Video</a> and more.
		This enables you to target viewers with ads on VOD or live videos, 
		across multiple devices  including mobile, PC’s, and set-top-boxes.
		<br><br>
		Every Kaltura account includes <a href="index.php?path=KalturaAnalytics">analytics fully integrated into the Kaltura platform</a>.
		Additionally Kaltura supports integrations with numerous analytics providers such as
		<a href="index.php?path=GoogleAnalytics">Google Analytics</a>, 
		<a href="index.php?path=NielsenVideoCensus">Nielsen Video Census</a>, 
		<a href="index.php?path=NielsenCombined">Nielsen Combined</a>,
		<a href="index.php?path=ComscoreAnalytics">Comscore</a> and
		<a href="index.php?path=OmnitureOnPage">Omniture SiteCatalyst 15</a>. 
		<br><br>
		Kalturas robust set of partners shortens time to market on integrating with your Ad and Anlytics partners.
		<a href="index.php?path=advertising">See a high level overview of Ad features</a>
		</p></div>
		<div style="clear:both"></div>
		
	</div>
	
	<a name="KeyFeatures"></a><br>
	<div class="blurb-right">
	<div class="blurb-img">
		<a title="studio" rel="lightbox[27]" href="http://central.kaltura.com/wp-content/uploads/2012/11/studio.png" class="cboxElement">
			<img class="shadow" title="studio" src="images/player.desing.jpg">
		</a>
	</div>
		<div class="blurb-txt" >
		<h2>Player Studio &amp; Templates</h2>
		<p>You can easily create customized cross browser/cross device players in the Kaltura player Studio from a variety of great looking, light-weight video player templates.</p>
		<p><a href="./index.php?path=templates">See working template examples »</a>
		<p>More technical users can leverage the player APIs, or even modify the fully open source framework directly.</p>
		<p><a href="./index.php?path=resources">See the player developer resources section »</a>
		</p></div>
		<div style="clear:both"></div>
	</div>

	
	<a name="Integration"></a>
	<br>
	<div class="blurb-left">
	<div class="blurb-img"><img src="images/customer.players.png" title="customer_players"></div>
	<div class="blurb-txt">
	<h2>Customer Player Samples</h2>
	<p>The KDP can be modified with the Studio, with the UIconf or with the API. See examples of how our customers have themselves (or in collaboration with Kaltura) made their player unique to their brand and business.</p>
	<p><a href="./index.php?path=customersamples">Read more »</a>
	</p></div>
	<div style="clear:both"></div>
	</div>
	
	
	<a name="WhitePaper"></a><br>
	<div class="blurb-right">
		<div class="blurb-img" style="margin-top:20px">
			<a title="studio" rel="lightbox[27]" href="http://site.kaltura.com/Select_the_Best_Video_Player.html" class="cboxElement">
				<img class="shadow" title="whitepaper" src="images/whitepaper.jpg">
			</a>
		</div>
		<div class="blurb-img" style="margin-top:40px;float:left;">
			<a title="studio" rel="lightbox[27]" href="http://site.kaltura.com/Select_the_Best_Video_Player.html" class="cboxElement">
				<img title="whitepaper" src="images/Whitepaper-download-button.gif">
			</a>
		</div>
		<div class="blurb-txt" style="margin-top:-180px;">
		<h2>Kaltura Whitepaper: How to Select the Best Video Player</h2>
		This white paper offers a unique way of looking at your online video strategy. The strategy is usually comprised of many parts:
		 content, branding, monetization, user engagement, social capabilities etc. In this paper we take a look at all these strategic 
		 elements through the lens of the player experience.  If you are able to present a powerful video player that is both feature-rich
		 and quick to load and respond -- you are going to be successful.
		<br><br>
		Think of the player as a brick-and-mortar store: beautiful glass storefront with a well-branded skin, convenient buttons 
		and a beautiful thumbnail will help lure the viewers.
		
		Once they click "Play" it is like they walked inside.  This is where the player's technology lights up to deliver 
		a smooth video experience that will impress users regardless of their location or device. The player capabilities 
		should inspire the user to take action, based on the strategy goals: watch more videos, click on ads, answer an 
		interactive survey, upload UGC content or share your content with the world.  If done correctly, the player will be
		 the incarnation of your video strategy.
		<BR><BR>
		<a href="http://site.kaltura.com/Select_the_Best_Video_Player.html">In this whitepaper</a> we will discuss the crucial questions to ask when looking for the right video platform 
		to build that player.
		</div>
		<div style="clear:both"></div>
	</div>
	
