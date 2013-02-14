<?php 
	require_once( realpath( dirname( __FILE__ ) )  . '/doc-config.php' );
?>
<!DOCTYPE html>
<html lang="en">
  <head>
	<meta charset="utf-8">
	<title>Kaltura Player Features -- mwEmbed version <?php echo $wgMwEmbedVersion ?></title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="description" content="">
	<meta name="author" content="">

	<?php if( $wgKalturaGoogleAnalyticsUA ){
		?>
		<script type="text/javascript">
			var _gaq = _gaq || [];
			_gaq.push(['_setAccount', '<?php echo $wgKalturaGoogleAnalyticsUA?>']);
			_gaq.push(['_trackPageview']);
			
			(function() {
				var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
				ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
				var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
			})();
		</script>
		<?php 
	}
	?>
	<link href="<?php echo $pathPrefix; ?>bootstrap/docs/assets/css/bootstrap.css" rel="stylesheet">
	<style type="text/css">
	  body {
		padding-top: 60px;
		padding-bottom: 40px;
	  }
	  .sidebar-nav {
		padding: 9px 0;
	  }
	</style>
	<link href="<?php echo $pathPrefix; ?>bootstrap/docs/assets/css/bootstrap-responsive.css" rel="stylesheet">

	<!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
	<!--[if lt IE 9]>
	  <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->

	<!-- Le fav and touch icons -->
	<link rel="shortcut icon" href="<?php echo $pathPrefix; ?>images/ico/favicon.ico">
	<!--  
	<link rel="apple-touch-icon-precomposed" sizes="144x144" href="<?php echo $pathPrefix; ?>images/ico/apple-touch-icon-144-precomposed.png">
	<link rel="apple-touch-icon-precomposed" sizes="114x114" href="<?php echo $pathPrefix; ?>images/ico/apple-touch-icon-114-precomposed.png">
	<link rel="apple-touch-icon-precomposed" sizes="72x72" href="<?php echo $pathPrefix; ?>images/ico/apple-touch-icon-72-precomposed.png">
	<link rel="apple-touch-icon-precomposed" href="<?php echo $pathPrefix; ?>images/ico/apple-touch-icon-57-precomposed.png">
	 -->
	<link href="<?php echo $pathPrefix; ?>css/kdoc.css" rel="stylesheet">
	
	<script src="<?php echo $pathPrefix; ?>bootstrap/docs/assets/js/jquery.js"></script>
	<script src="<?php echo $pathPrefix; ?>../mwEmbedLoader.php"></script>
	<script src="<?php echo $pathPrefix; ?>js/doc-bootstrap.js"></script>
	
	<script>
	// Output the exported configuration:
	mw.setConfig( 'KalutraDocUseRewriteUrls', <?php echo $wgUseRewriteUrls ? 'true' : 'false' ?> );
	// A configuration var for autodetecting kaltura docs context in child frames. 
	mw.setConfig( "KalutraDocContext", true );
	</script>
	
	
	<!-- Le javascript
	================================================== -->
	<!-- Placed at the end of the document so the pages load faster -->
	<script src="<?php echo $pathPrefix; ?>bootstrap/docs/assets/js/bootstrap-transition.js"></script>
	<script src="<?php echo $pathPrefix; ?>bootstrap/docs/assets/js/bootstrap-alert.js"></script>
	<script src="<?php echo $pathPrefix; ?>bootstrap/docs/assets/js/bootstrap-modal.js"></script>
	<script src="<?php echo $pathPrefix; ?>bootstrap/docs/assets/js/bootstrap-dropdown.js"></script>
	<script src="<?php echo $pathPrefix; ?>bootstrap/docs/assets/js/bootstrap-scrollspy.js"></script>
	<script src="<?php echo $pathPrefix; ?>bootstrap/docs/assets/js/bootstrap-tab.js"></script>
	<script src="<?php echo $pathPrefix; ?>bootstrap/docs/assets/js/bootstrap-tooltip.js"></script>
	<script src="<?php echo $pathPrefix; ?>bootstrap/docs/assets/js/bootstrap-popover.js"></script>
	<script src="<?php echo $pathPrefix; ?>bootstrap/docs/assets/js/bootstrap-button.js"></script>
	<script src="<?php echo $pathPrefix; ?>bootstrap/docs/assets/js/bootstrap-collapse.js"></script>
	<script src="<?php echo $pathPrefix; ?>bootstrap/docs/assets/js/bootstrap-carousel.js"></script>
	<script src="<?php echo $pathPrefix; ?>bootstrap/docs/assets/js/bootstrap-typeahead.js"></script>
	
	<!--  some additional utilities -->
	<script src="<?php echo $pathPrefix; ?>jquery/jquery.ba-hashchange.js"></script>
	<script src="<?php echo $pathPrefix; ?>pagedown/showdown.js"></script>
	
  </head>

  <body class="kdoc">
	<script> 
	function kDocGetBasePath(){
		// if we are an index.php url return empty base path:
		if( document.URL.indexOf('index.php') !== -1 ){
			return '';
		}
  		var urlParts = document.URL.split( '/' );
  		basePath = '';
		if( urlParts[ urlParts.length - 3 ] == 'docs' ){
			basePath = '../';
		} else if( urlParts[ urlParts.length - 4 ] == 'docs' ){
			basePath = '../../';
		} 
		return basePath;
  	}
	</script>
	<?php include 'header.php' ?>
	<?php 
	$featureList = include( 'featureList.php' );
	$path = ( isset( $_GET['path'] ) )?$_GET['path'] : 'main';
	$pathParts = explode('/', $path );
	$bgGradientType = 'landing';
	
	if( isset( $featureList[ $pathParts[0] ] ) && isset( $pathParts[1] ) ){
		$bgGradientType = 'featurepage';
	}
	?>
	<div id="page-bg-gradient" class="page-bg-gradient <?php echo $bgGradientType ?>"></div>
	<div class="container-fluid content-body">
	  <div class="row-fluid">
		<div id="kdoc-navbarcontainer" class="span3" style="display:none">
		  <div class="well sidebar-nav">
			  <?php include "navbar.php"; ?>
		  </div><!--/.well -->
		</div><!--/span-->
		<div id="contentHolder">
			<?php 
				// check for key:
				if( isset( $featureList[ $pathParts[0] ] ) ){
					include( 'features.php');
				} else {
					// content pages: 
					switch( $path ){
						case 'resources':
							include 'resources.php';
						break;
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
				// if empty hash .. ignore
				if( key == '' ){
					return ;
				}
				var pathName = key || 'main';
				// Update the active nav bar menu item: 
				$( '.navbar li' ).removeClass("active")
				.find( "a[href='index.php?path=" + pathName + "']" ).parent().addClass("active" );

				// Highlight sidebar item
				var $container = $('#kdoc-navbarcontainer').find('li').removeClass('active')
				.find( "a[href='index.php?path=" + pathName + "']" ).parent().addClass("active" )
				.parent();

				if( $container.css('height') == '0px' ){
					$('#kdoc-navbarcontainer')
					.find( '.nav-header a[href="#' + $container.attr('id') +'"]' )
					.click();
				}
				
				// Check if we need to update contnet ( check page for history push state key );
				if( document.getElementById( 'hps-' + pathName ) ){
					if( console ) console.log( "KalturaDoc:: " + pathName + " already present " ) ;
					return true;
				}
				var basePath = kDocGetBasePath();
				var showPageBgGradient = true; 
				// Check for main menu hash changes: 
				switch( key ){
					case 'main':
						$.get( basePath + 'main.php', function( data ){
							$( '#contentHolder' ).html( data );
						});
						break;
					case 'readme':
						$.get( basePath + '../README.markdown', function( data ){
							var converter = new Showdown.converter();
							$( '#contentHolder' ).html(
								converter.makeHtml( data ) 
							);
						});
						break;
					case 'performance':
						$.get( basePath + 'performance.php', function( data ){
							$( '#contentHolder' ).html( data );
						});
						break;
					case 'resources':
						$.get( basePath + 'resources.php', function( data ){
							$( '#contentHolder' ).html( data );
						});
						break;
					case 'contact':
						$.get( basePath + 'contact.php', function( data ){
							$( '#contentHolder' ).html( data );
						});
						break;
					case '':
					default:
						showPageBgGradient = false;
						$.get( basePath + 'features.php?path=' + key, function( data ){
							$( '#contentHolder' ).html( data );
						});
						break;
				}
				if( showPageBgGradient || pathName.split('/').length == 1 ){
					$('.page-bg-gradient').removeClass('featurepage').addClass('landing');
				} else {
					$('.page-bg-gradient').removeClass('landing').addClass('featurepage');
				}
			 }
	
			// On page load trigger state check: 
			$(function(){
				var path = document.URL.substr( document.URL.indexOf('docs/' ) + 5 );
				handleStateUpdate( { 'key' : path } );
			});

			// Check hash changes: 
			window.onpopstate = function ( data ) {
				handleStateUpdate( data );
			};

			$("a").click(function(){
				var href = $(this).attr( "href" );
				if( mw.getConfig( 'KalutraDocUseRewriteUrls' ) ){ 
					href = href.replace('index.php?path=', '' );
				}
				var title = $(this).attr( "title" );
				if( href.indexOf('http') == 0 || href.indexOf('../') == 0 
						|| 
					href.substr(0,1) == '#' ){
					// follow the link
					return true;
				} else {
					var stateData = { 'key':  href };
					history.pushState( stateData , 'Kaltura player docs -- ' + href, kDocGetBasePath() + href );
					handleStateUpdate( stateData );
					return false;
				}
			});
			
		</script>
	  </div><!--/row-->
	  <hr>
	  <footer>
		This page reflects <a target="_new" href="http://html5video.org/wiki/Kaltura_HTML5_Release_Notes">Kaltura HTML5 v<?php 
			 $_pos = strpos( $wgMwEmbedVersion, '__' );
			 $prettyVersion = $wgMwEmbedVersion;
			 if( $_pos !== false ){
			 	$prettyVersion = substr( $prettyVersion, 0, $_pos);
			 }
			 echo $prettyVersion;
			 ?></a>
		<p>&copy; Kaltura 2012</p>
	  </footer>

	</div><!--/.fluid-container-->
  </body>
</html>
