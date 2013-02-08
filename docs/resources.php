<?php 
	// Some includes for output of configuration options
	require_once( realpath( dirname( __FILE__ ) ) . '/../includes/DefaultSettings.php' );
	
	$pathPrefix = ( $wgUseRewriteUrls 
				&& 
			count( $pathParts ) > 1
				&&
			strrpos( $_SERVER['REQUEST_URI'], 'index.php' ) === false 
		) ? '../' : '';
		
?><div id="hps-resources"></div>
	<div class="hero-unit">
            <h2>Dev Resources</h2>
            <p>Welcome to the Kaltura player dev hub. Here you will find
            documentation on Kaltura front end library features, test files, benchmarks 
            and other tools. <br>
            This documentation covers version 
            	<strong><i><?php global $wgMwEmbedVersion; echo $wgMwEmbedVersion ?></i></strong> of the html5 library. 
            </p>
            <script>  </script>
            <p><a href="index.php?path=readme" class="btn btn btn-info btn-large">Learn more &raquo;</a></p>
          </div>
          <div class="row-fluid">
            <div class="span6">
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
            <div class="span6">
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
            <div class="span6">
              <h2>Performance tools</h2>
              <p>Compare performance of the kaltura html5 library with other popular html5 libraries</p>
              <p><a class="btn" href="index.php?path=performance">Performace page &raquo;</a></p>
            </div><!--/span-->
            <div class="span6">
              <h2>Kaltura and Open source</h2>
              <p>Learn more about kaltura and open source</p>
              <p><a class="btn" href="http://www.kaltura.org">Kaltura.org &raquo;</a></p>
            </div><!--/span-->
           <div class="row-fluid">
          <div class="span6">
              <h2>Library documentation</h2>
              <ul>
              	<li><a href="http://html5video.org/wiki/Kaltura_HTML5_Configuration">Kaltura HTML5 FAQ</a></li>
             	<li><a href="http://html5video.org/wiki/Kaltura_KDP_API_Compatibility">KDP API Compatibility</a></li> 
              	<li><a href="http://html5video.org/wiki/Kaltura_OnPage_Plugins">OnPage Plugins</a></li>
              	<li><a href="http://html5video.org/wiki/Kaltura_InPlayer_HTML5_Plugins">InPlayer Plugins</a></li>              	
              </ul>
              <p><a class="btn" href="http://html5video.org/wiki/HTML5_Video_Wiki">Kaltura HTML5 wiki &raquo;</a></p>
                <p><a class="btn" href="http://html5video.org/wiki/HTML5_Video_Wiki">Kaltura Knowledge Center&raquo;</a></p>
            </div><!--/span-->
            <div class="span6">
              <h2>HTML5Video.org blog</h2>
              <p>Lean more about html5video on html5video.org</p>
              <p><a class="btn" href="http://html5video.org/blog/">HTML5Video.org Blog&raquo;</a></p>
            </div><!--/span-->
          </div><!--/row-->
 		</div><!--/row-->