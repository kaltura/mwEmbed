<?php 
	// Some includes for output of configuration options
	require_once( realpath( dirname( __FILE__ ) ) . '/../includes/DefaultSettings.php' );
?><div id="hps-main"></div>
	<div class="hero-unit">
            <h1>Kaltura Player Features</h1>
            <p>Welcome to the Kaltura player feature hub. Here you will find
            documentation on Kaltura front end library features, test files, benchmarks 
            and other tools. <br>
            This documentation covers version 
            	<strong><i><?php global $wgMwEmbedVersion; echo $wgMwEmbedVersion ?></i></strong> of the html5 library. 
            </p>
            <script>  </script>
            <p><a href="index.php?path=readme" class="btn btn btn-info btn-large">Learn more &raquo;</a></p>
          </div>
          <div class="row-fluid">
            <div class="span4">
              <h2>Recent Commits</h2>
              <p id="github-commits"></p>
              <p><a class="btn" href="http://github.com/kaltura/mwEmbed/">Commits on github &raquo;</a></p>
            </div><!--/span-->
            <div class="span4">
              <h2>Automated Testing</h2>
              <p>Automated testing results</p>
              <p><a class="btn" href="#">View test details &raquo;</a></p>
            </div><!--/span-->
            <div class="span4">
              <h2>Kaltura and Open source</h2>
              <p>Learn more about kaltura and open source</p>
              <p><a class="btn" href="#">kaltura.org &raquo;</a></p>
            </div><!--/span-->
          </div><!--/row-->
          
           <div class="row-fluid">
            <div class="span4">
              <h2>Performace tools</h2>
              <p>Compare performace of the kaltura html5 library with other popular html5 libraries</p>
              <p><a class="btn" href="performance">Performace page &raquo;</a></p>
            </div><!--/span-->
            <div class="span4">
              <h2>Plugin skeleton</h2>
              <p>Tools for building your own plugin</p>
              <p><a class="btn" href="#">View test details &raquo;</a></p>
            </div><!--/span-->
            <div class="span4">
              <h2>html5video.org blog</h2>
              <p>Lean more about html5video on html5video.org</p>
              <p><a class="btn" href="#">Knolege Center &raquo;</a></p>
            </div><!--/span-->
          </div><!--/row-->
      
     <script src="js/github.commits.widget.js"></script>
     <script> 
	     $(function() {
	         $('#github-commits').githubInfoWidget(
	             { user: 'kaltura', repo: 'mwEmbed', branch: 'develop' });
	     });
	 </script>
