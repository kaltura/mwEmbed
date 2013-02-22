<?php 
	// Some includes for output of configuration options
	require_once( realpath( dirname( __FILE__ ) ) . '/doc-config.php' );
?>
<div id="hps-resources"></div>
	<div class="hero-unit">
		<a id="githublink" href="https://github.com/kaltura/mwEmbed"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://s3.amazonaws.com/github/ribbons/forkme_right_darkblue_121621.png" alt="Fork me on GitHub"></a>
		<h2>Developer Resources</h2>
		<p style="margin-right: 40px;">Kaltura Players Framework Developmer Resources. Learn how to build plugins, customize the player, use the API, test and tweak performance. Check us out <a href="http://github.com/kaltura/mwEmbed">on GitHub</a> and join the project. <br>
		<!-- This documentation covers version 
			<strong><i><?php global $wgMwEmbedVersion; echo $wgMwEmbedVersion ?></i></strong> of the html5 library.   -->
		</p>
		<script>  </script>
		<p>
		<a href="#Getting Started" class="btn btn btn-info btn-large">Getting Started &raquo;</a>
		<a href="https://github.com/kaltura/mwEmbed/issues/new" class="btn btn btn-info btn-large">Report an Issue &raquo;</a>
		<a href="http://www.kaltura.org/forums/html5-video/html5-video" class="btn btn btn-info btn-large">Questions & Feedback &raquo;</a>
		<a href="index.php?path=readme" class="btn btn btn-info btn-large">Readme &raquo;</a>
		</p>
   </div>
		<div class="row-fluid">
			<div class="span8">
			  <h2>Library documentation</h2>
			  <ul>
			  	<li><a href="http://html5video.org/wiki/Kaltura_HTML5_Configuration">Kaltura HTML5 FAQ</a> A detailed list of frequenly used configuration options</li>
			  	<li><a href="http://html5video.org/wiki/Kaltura_OnPage_Plugins">OnPage Plugins</a> Documentation about building on page plugins</li>
			  </ul>
				<p><a class="btn" href="http://html5video.org/wiki/HTML5_Video_Wiki">Kaltura Knowledge Center&raquo;</a></p>
			</div><!--/span-->
		</div>
		<div class="row-fluid">
			<div class="span9">
				<a name="Overview"></a>
				<h2>Overview</h2>
				<ul>
					<li>Unified Flash and HTML5 API</li>
					<li>Intelligent per-platform player selection</li>
					<li>Open Source and Widely Used.</li>
				</ul>
				<img src="<?php echo $pathPrefix; ?>images/Kaltura_Player_Plugins_Overview.png">
				<h3>Kaltura Flash Player – aka KDP3</h3>
				<ul>
					<li>Kaltura Dynamic Player is a Flash based media player</li>
					<li>An XML configuration file defines its layout, behavior
						and visual elements/skin. The XML is dubbed uiConf</li>
					<li>Flash KDP is based Open Source Standards:</li>
					<ul>
						<li>Adobe OSMF</li>
						<li>PureMVC</li>
						<li>Yahoo! Astra</li>
						<li>Fl Components</li>
						<li>Kaltura ActionScript 3 Client Library</li>
					</ul>
				</ul>
				<h3>Kaltura HTML5 Player</h3>
				<ul>
					<li>HTML5 (JavaScript, CSS and HTML) based media player</li>
					<li>Intelligent per-platform video flavor and feature selection</li>
					<li>Based on Open Source / Web standards:</li>
					<ul>
						<li>jQuery</li>
						<li>MediaWiki Resource Loader</li>
						<li>CSS Based Skins</li>
					</ul>
				</ul>
				<a name="Getting Started"></a>
				<h2>Getting Started</h2>
				<a name="Setup and Embed"></a>
				<h3>Setup and Embed</h3>
				<ul>
					<li>AutoEmbed – Single line embedding:
						<pre class="prettyprint linenums">
&lt;script src=&quot;http://[server-<br/>url]/p/[partner_id]/sp/[partner_id]00/embedIframeJs/uiconf_id/[uiconf_id]/partner_id/[par<br/>tner_id]?autoembed=true&amp;entry_id=[entry_id]&amp;playerId=kaltura_player&amp;width=400&amp;height<br/>=330&quot;&gt;&lt;/script&gt;
						</pre>
					<li>Robust Embedding Options:
						<ul>
							<li><a href="index.php?path=Tools/Embedding/autoEmbed">AutoEmbed</a>: Single line of script! Great for quickly getting a
							player on the page.</li>
							<li><a href="index.php?path=Tools/Embedding/kwidget">Dynamic Embed</a>: Great for code integration in web apps.
							Responsive web-design friendly. Cleaner configuration.</li>
							<li><a href="index.php?path=Tools/Embedding/thumb">Thumbnail embed</a>: Fast loading, great for pages with lots of
							players. Best used in video-blogs.</li>
							<li>Iframe: Single line of HTML! Great for when JS is not allowed.
							Best option for Share/Embed players.</li>
						</ul>
					</li>
				</ul>
				<a name="kWidget API"></a>
				<h3>kWidget API</h3>
				<ul>
					<li>kWidget.embed – Dynamic Embed</li>
					<li>kWidget.thumbEmbed – Thumbnail Embed</li>
					<li>kWidget.getKalturaThumbUrl – Get thumbnail URL</li>
					<li>kWidget.addReadyCallback – Add event listener, listen to when players on the page are ready for JS binding</li>
					<li>kWidget.destory – Removes the player from the DOM</li>
				</ul>
				<a name="Player JavaScript API"></a>
				<h3>Player JavaScript API - Basic Example</h3>
				Log Player Id to Console, once Player is Ready to Play
				<pre class="prettyprint linenums">kWidget.embed({<br/>		'targetId': 'myVideoTarget',<br/>		'wid': '_243342',<br/>		'uiconf_id' : '2877502',<br/>		'entry_id' : '0_uka1msg4',<br/>		'readyCallback': function( playerId ){<br/>			console.log( &quot;Hello World, playerId: &quot; + playerId );<br/>		}<br/>});</pre>
				
			</div><!--/span-->
		</div>
		<div class="row-fluid">
		<div class="span8">
			  <h2>Kaltura and Open source</h2>
			  <p>Learn more about kaltura and open source</p>
			  <p><a class="btn" href="http://www.kaltura.org">Kaltura.org &raquo;</a></p>
			</div><!--/span-->
		</div>
		<div class="row-fluid">
			<div class="span8">
			  <h2>HTML5Video.org blog</h2>
			  <p>Lean more about html5video on html5video.org</p>
			  <p><a class="btn" href="http://html5video.org/blog/">HTML5Video.org Blog&raquo;</a></p>
			</div><!--/span-->
 		</div><!--/row-->
 		<div class="row-fluid">
			<div class="span8">
			  <h2>Performance tools</h2>
			  <p>Compare performance of the kaltura html5 library with other popular html5 libraries</p>
			  <p><a class="btn" href="index.php?path=performance">Performace page &raquo;</a></p>
			</div><!--/span-->
		</div><!--/row-->
 		<div class="row-fluid">
 			<div class="span8">
				  <h2>Automated Testing</h2>
				  <p id="testswarm-status"> loading ... </p>
				  <p><a class="btn" href="http://html5video.org/testswarm/user/kbot">View automated tests&raquo;</a></p>
				<script>
					$(function(){
						$.getJSON('http://html5video.org/testswarm/api.php?action=user&item=kbot&format=jsonp&callback=?', function( data ){
							$ul = $('<ul />');
							$.each( data.user.recentJobs, function( inx, job ){
								$ul.append(
									$('<li />').append(
										$( '<a />')
											.text( 'Job ' + job.id )
											.attr('href', 'http://html5video.org/testswarm/job/'+ job.id ),
										$('<span />').text( ' -- '),
										job.name 
									)
								)	
							});
							$('#testswarm-status').empty().append( $ul );
						});
					});
				</script>
			</div><!--/span-->
		</div><!--/row-->
 		<div class="row-fluid">
 			<div class="span8">
			  <h2>Recent Commits</h2>
			  <p id="github-commits"></p>
			  <p><a class="btn" href="http://github.com/kaltura/mwEmbed/">Commits on github &raquo;</a></p>
			 <script src="<?php echo $pathPrefix; ?>js/github.commits.widget.js"></script>
			 <script> 
				 $(function() {
					 $('#github-commits').githubInfoWidget(
						 { user: 'kaltura', repo: 'mwEmbed', branch: 'master' });
				 });
			 </script>
			</div>
		</div><!--/row-->
