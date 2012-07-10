<?php 
	// Some includes for output of configuration options
	require_once( realpath( dirname( __FILE__ ) ) . '/../includes/DefaultSettings.php' );
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Kaltura HTML5 library v<?php echo $wgMwEmbedVersion ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- Le styles -->
    <link href="bootstrap/docs/assets/css/bootstrap.css" rel="stylesheet">
    <style type="text/css">
      body {
        padding-top: 60px;
        padding-bottom: 40px;
      }
      .sidebar-nav {
        padding: 9px 0;
      }
    </style>
    <link href="bootstrap/docs/assets/css/bootstrap-responsive.css" rel="stylesheet">

    <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->

    <!-- Le fav and touch icons -->
    <link rel="shortcut icon" href="bootstrap/docs/assets/ico/favicon.ico">
    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="bootstrap/docs/assets/ico/apple-touch-icon-144-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="bootstrap/docs/assets/ico/apple-touch-icon-114-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="bootstrap/docs/assets/ico/apple-touch-icon-72-precomposed.png">
    <link rel="apple-touch-icon-precomposed" href="bootstrap/docs/assets/ico/apple-touch-icon-57-precomposed.png">
    
    <link href="css/kdoc.css" rel="stylesheet">
    
    <script src="bootstrap/docs/assets/js/jquery.js"></script>
    <script src="../mwEmbedLoader.php"></script>
    
    
    <!-- Le javascript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
    <script src="bootstrap/docs/assets/js/bootstrap-transition.js"></script>
    <script src="bootstrap/docs/assets/js/bootstrap-alert.js"></script>
    <script src="bootstrap/docs/assets/js/bootstrap-modal.js"></script>
    <script src="bootstrap/docs/assets/js/bootstrap-dropdown.js"></script>
    <script src="bootstrap/docs/assets/js/bootstrap-scrollspy.js"></script>
    <script src="bootstrap/docs/assets/js/bootstrap-tab.js"></script>
    <script src="bootstrap/docs/assets/js/bootstrap-tooltip.js"></script>
    <script src="bootstrap/docs/assets/js/bootstrap-popover.js"></script>
    <script src="bootstrap/docs/assets/js/bootstrap-button.js"></script>
    <script src="bootstrap/docs/assets/js/bootstrap-collapse.js"></script>
    <script src="bootstrap/docs/assets/js/bootstrap-carousel.js"></script>
    <script src="bootstrap/docs/assets/js/bootstrap-typeahead.js"></script>
    
    <!--  some additional utilities -->
    <script src="jquery/jquery.ba-hashchange.js"></script>
    <script src="pagedown/showdown.js"></script>
    
  </head>

  <body>

    <div class="navbar navbar-fixed-top">
      <div class="navbar-inner">
        <div class="container-fluid">
          <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </a>
          
          <a class="brand" href="http://html5video.org">Kaltura HTML5 v<?php echo $wgMwEmbedVersion ?></a> 
          	
          <div class="btn-group pull-right">
            <a class="btn dropdown-toggle" data-toggle="dropdown" href="#">
              <i class="icon-adjust"></i> Settings
              <span class="caret"></span>
            </a>
            <ul class="dropdown-menu">
              <li><a href="#">Force HTML5 mode</a></li>
               <li><a href="#">Flash mode</a></li>
              <li class="divider"></li>
              <li><a href="#">About</a></li>
            </ul>
          </div>
          <div class="nav-collapse">
            <ul class="nav">
              <li class="active"><a href="#">Home</a></li>
              <li><a href="#readme">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div><!--/.nav-collapse -->
        </div>
      </div>
    </div>

    <div class="container-fluid content-body">
      <div class="row-fluid">
        <div class="span3">
          <div class="well sidebar-nav">
            <ul class="nav nav-list">
              <li class="nav-header">Embeding</li>
              <li><a href="#">Object rewrite</a></li>
              <li><a href="#">kWidget embed</a></li>
              <li><a href="#">kWidget thumb embed</a></li>
              <li><a href="#">Kwidget Playlist</a></li>
              <li class="nav-header">Analytics</li>
              <li><a href="#">Nielsen Combined</a></li>
              <li><a href="#">Nielsen Video Sensus</a></li>
              <li><a href="#">Kaltura Analytics</a></li>
              <li><a href="#">Omniture</a></li>
              <li><a href="#">Conviva</a></li>
              <li class="nav-header">Ads</li>
              <li><a href="#">Kaltura Vast ads</a></li>
              <li><a href="#">Double Click</a></li>
              <li><a href="#">Freewheel</a></li>
              <li class="nav-header">Player Features</li>
              <li><a href="#">Playlist</a></li>
              <li><a href="#">Access controls</a></li>
              <li><a href="#">Bumper etc.</a></li>
            </ul>
          </div><!--/.well -->
        </div><!--/span-->
        <div id="contentHolder" class="span9">
        </div><!--/span-->
        <?php 
        		// inline content -> JSON hack ;)
        		function getContentSet(){
        			$contentSet = array();
        			ob_start();
        			?>
        			<div class="hero-unit">
            <h1>Kaltura HTML5 Docs</h1>
            <p>Welcome to the Kaltura front end feature hub. Here you will find
            documentation on Kaltura front end library features, test files, benchmarks 
            and other tools. <br>
            Your are looking at the feature test files for
            	<strong></b><i><?php global $wgMwEmbedVersion; echo $wgMwEmbedVersion ?></i></strong> of the html5 library. 
            </p>
            <script>  </script>
            <p><a href="#readme" class="btn btn btn-info btn-large">Learn more &raquo;</a></p>
          </div>
          <div class="row-fluid">
            <div class="span4">
              <h2>Recent Commits</h2>
              <p> list commits to mater </p>
              <p><a class="btn" href="#">Commits on github &raquo;</a></p>
            </div><!--/span-->
            <div class="span4">
              <h2>Automated Testing</h2>
              <p>Automated testing results</p>
              <p><a class="btn" href="#">View test details &raquo;</a></p>
            </div><!--/span-->
            <div class="span4">
              <h2>Knolege Center Activity</h2>
              <p></p>
              <p><a class="btn" href="#">Knolege Center &raquo;</a></p>
            </div><!--/span-->
          </div><!--/row-->
        			<?php 
        			$contentSet['main'] = ob_get_clean();
        			
        			return $contentSet;
        		}
        	?>
        	
          <script>
          	var mainContent = <?php 
          		echo json_encode( getContentSet() );
          	?>
          	// Check hash changes: 
          	$(window).hashchange( function(){
				var hash = location.hash ? location.hash.substr(1) : '';
              	// Update the active nav bar menu item: 
          		$('.navbar li').removeClass("active")
				.find( "a[href='#" + hash + "']" ).parent().addClass("active" );
              	
				// Check for main menu hash changes: 
              	switch( hash ){
              		case 'readme':
              			$.get( '../README.markdown', function( data ){
              				var converter = new Showdown.converter();
              				$('#contentHolder').html(
                      			converter.makeHtml(data) 
                      		);
              			});
                  		break;
	              	case '':
	                default:
	                	$('#contentHolder').html( mainContent['main'] );
		                break;
              	}
				
         	 	
          	});
          	// fire the hash change at startup
          	$(window).hashchange();
          </script>
      </div><!--/row-->

      <hr>

      <footer>
        <p>&copy; Kaltura 2012</p>
      </footer>

    </div><!--/.fluid-container-->
  </body>
</html>
