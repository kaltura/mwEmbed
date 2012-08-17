<?php 
	// Some includes for output of configuration options
	require_once( realpath( dirname( __FILE__ ) ) . '/../includes/DefaultSettings.php' );
	/**
	 * Docs configuration 
	 */
	$wgUseRewriteUrls = false;
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Kaltura Player Features -- mwEmbed version <?php echo $wgMwEmbedVersion ?></title>
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
    <link rel="shortcut icon" href="css/favicon.ico">
    <!--  
    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="bootstrap/docs/assets/ico/apple-touch-icon-144-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="bootstrap/docs/assets/ico/apple-touch-icon-114-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="bootstrap/docs/assets/ico/apple-touch-icon-72-precomposed.png">
    <link rel="apple-touch-icon-precomposed" href="bootstrap/docs/assets/ico/apple-touch-icon-57-precomposed.png">
     -->
    <link href="css/kdoc.css" rel="stylesheet">
    
    <script src="bootstrap/docs/assets/js/jquery.js"></script>
    <script src="../mwEmbedLoader.php"></script>
    
    <script>
    // Output the exported configuration:
    mw.setConfig( 'DocsUseRewriteUrls', <?php echo $wgUseRewriteUrls ? 'true' : 'false' ?> );
    // A configuration var for autodetecting kaltura docs context in child frames. 
    mw.setConfig( "KalutraDocContext", true );
    </script>
    
    
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

    <?php include 'header.php' ?>

    <div class="container-fluid content-body">
      <div class="row-fluid">
        <div class="span3">
          <div class="well sidebar-nav">
            <ul class="nav nav-list">
              <?php include "navbar.php"; ?>
            </ul>
          </div><!--/.well -->
        </div><!--/span-->
        <div id="contentHolder" class="span9">
        	<?php 
        		$path = ( isset( $_GET['path'] ) )?$_GET['path'] : 'main';
        		// check for key:
        		if( isset( $featureSet[ $path ] ) ){
        			include( 'features.php');
        		} else {
					// content pages: 
        			switch( $path ){
	        			case 'contact':
	        				include 'contact.php';
	        				break;
	        			case 'main':
	        			default:
	        				// insert content based on url ( same logic as JS bellow )
	        				include 'main.php';
	        				break;
	        		}
        		}
        	?>
        </div><!--/span-->
          <script>
          	var handleStateUpdate = function( data ){
	          	var key = ( data && data.key ) ? data.key : location.search.substring(1);
				// replace out index.php?path= part of url:
				key = key.replace( 'index.php?', '' );
				key = key.replace( 'path=', '');
				// strip # vars
				key = /[^#]*/.exec( key)[0];

				var pathName = key || 'main';
	        	// Update the active nav bar menu item: 
	    		$( '.navbar li' ).removeClass("active")
				.find( "a[href='index.php?path=" + pathName + "']" ).parent().addClass("active" );
				// Check if we need to update contnet ( check page for history push state key );
				
				if( $('#hps-' + pathName ).length ){
					if( console ) console.log( "KalturaDoc:: " + pathName + " already present " ) ;
					return true;
				}
	        	
				// Check for main menu hash changes: 
	        	switch( key ){
					// get navbar redirects:
					<?php 
					$featureSet = include( 'featureManifest.php' );
					foreach($featureSet as $featureKey => $set ){?>
					case '<?php echo $featureKey?>':
					$.get( 'features.php?path=<?php echo $featureKey ?>', function( data ){
						$( '#contentHolder' ).html( data ); 	
					});
					break;
						<?php 
					}
					?> 
	        		case 'readme':
	        			$.get( '../README.markdown', function( data ){
	        				var converter = new Showdown.converter();
	        				$( '#contentHolder' ).html(
	                			converter.makeHtml( data ) 
	                		);
	        			});
	            		break;
	            	case 'performance':
		            	$.get('performance.php', function( data ){
		            		$( '#contentHolder' ).html( data );
		            	});
		            	break;
	        		case 'contact':
		        		$.get( 'contact.php', function( data ){
		        			$( '#contentHolder' ).html( data );
		        		});
		        		break;
	            	case '':
	              	default:
	            	  $.get( 'main.php', function( data ){
		        			$( '#contentHolder' ).html( data );
		        		});
		                break;
	        	}
	         }

			// Check hash changes: 
			window.onpopstate = function ( data ) {
				handleStateUpdate(data);
			};

			$("a").click(function(){
				var href = $(this).attr( "href" );
				if( mw.getConfig( 'DocsUseRewriteUrls' ) ){ 
					href = href.replace('index.php?path=', '' );
				}
				var title = $(this).attr( "title" );
				if( href.indexOf('http') == -1 ){
					var stateData = { 'key':  href };
					history.pushState( stateData , title, href );
					return handleStateUpdate( stateData );
				} else {
					return true;
				}
			});
          	
          </script>
      </div><!--/row-->

      <hr>

      <footer>
        <p>&copy; Kaltura 2012</p>
      </footer>

    </div><!--/.fluid-container-->
  </body>
</html>
