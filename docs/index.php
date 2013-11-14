<?php 
	require_once( realpath( dirname( __FILE__ ) )  . '/doc-base.php' );
?>
<!DOCTYPE html>
<html lang="en">
  <head>
	<meta charset="utf-8">
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
	<link href="<?php echo $pathPrefix; ?>bootstrap/build/css/bootstrap.min.css" rel="stylesheet">
	<link href="<?php echo $pathPrefix; ?>bootstrap/build/css/bootstrap-responsive.min.css" rel="stylesheet">

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
	<script src="<?php echo $pathPrefix; ?>../resources/jquery/jquery.min.js"></script>
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
	<!--<script src="<?php echo $pathPrefix; ?>bootstrap/build/js/bootstrap.min.js"></script> -->
	<!-- bootstrap plugins -->
	<script src="<?php echo $pathPrefix; ?>bootstrap/docs/assets/js/bootstrap-typeahead.js"></script>
	<script src="<?php echo $pathPrefix; ?>bootstrap/docs/assets/js/bootstrap-collapse.js"></script>
	
	<!--  some additional utilities -->
	<script src="<?php echo $pathPrefix; ?>jquery/jquery.ba-hashchange.js"></script>
	<script src="<?php echo $pathPrefix; ?>pagedown/showdown.js"></script>
	
	<title>Kaltura - <?php echo $kdocPageTitle; ?></title>
  </head>

  <body class="kdoc">
	<script> 
	// make sure the body is at least as tall as the window:
	$('body').css('min-height', $(window).height() - parseInt( $('body').css('padding-bottom') ) + 150 );
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
	<div id="page-bg-gradient" class="page-bg-gradient <?php echo $kdocPageType ?>">
		<?php 
		if( $kdocPageType == 'featurepage' && $path != 'readme' 
			&& isset( $featureList[ $pathParts[0] ] )
			&& isset( $featureList[ $pathParts[0] ]['featureSets'][ $pathParts[1] ] )
			&& isset( $featureList[ $pathParts[0] ]['featureSets'][ $pathParts[1] ]['testfiles'][ $pathParts[2] ] )
		){
		?>
			<h2><span><?php echo $featureList[ $pathParts[0] ]['title'] ?></span> > 
				<?php echo $featureList[ $pathParts[0] ]['featureSets'][ $pathParts[1] ]['testfiles'][ $pathParts[2] ]['title']?></h2>
		<?php 
		}
		?>
	</div>
	<div class="container-fluid content-body">
	  <div class="row-fluid kdoc-content <?php echo $kdocPageType ?>">
	  	<div id="kdoc-navbarcontainer" class="span3">
			<?php include "navbar.php"; ?>
			<script>
			$('#kdoc-navbar li').on( 'click', function(){
				var $curli = $( this );
				// if a top level colapse others
				if( $curli.hasClass('nav-category') ){
					$curli.addClass('active').siblings().each(function(){
						$(this).removeClass('active').find('ul:first').css('height', '0px');
					})
					$curli.find('ul:first').css('height', 'auto');
					// don't trigger events on top level nav click:
					return false;
				}
				if( $curli.hasClass('nav-featureset' ) ){
					$curli.addClass('active').siblings('li').each(function(){
						$(this).removeClass('active').next().css('height', '0px');
					})
					$curli.next().css('height', 'auto');
				}
				
			});
			</script>
		</div>
		<div id="contentHolder">
			<?php 
				// check for key:
				if( isset( $featureList[ $pathParts[0] ] ) ){
					include( 'features.php');
				} else {
					// content pages: 
					switch( $path ){
						case 'resources':
							include 'resources_content.php';
							break;
						case 'contact':
							include 'contact_content.php';
							break;
						case 'templates':
							include 'marketing_templates.php';
							break;
						case 'customersamples':
							include 'marketing_customersamples.php';
							break;
						case 'advertising':
							include 'marketing_customersamples.php';
							break;
						case 'main':
						default:
							// insert content based on url ( same logic as JS bellow )
							include 'main_content.php';
							break;
					}
				}
			?>
		</div><!--/span-->
		<script>
			var previusKey = null;
			var handleStateUpdate = function( data ){
				var key = ( data && data.key ) ? data.key : location.search.substring(1);
				// check for null key ( back button ) 
				if( key == '' && !data.key ){
					var urlParts = location.href.split('docs/');
					if( urlParts[1] ){
						key = urlParts[1];
					}
				}
				// replace out index.php?path= part of url:
				key = key.replace( 'index.php?', '' );
				key = key.replace( 'path=', '');
				// strip # vars
				key = /[^#]*/.exec( key)[0];
				// if empty hash .. ignore
				if( key == '' || previusKey == key || key.indexOf('=') !== -1 ){
					return ;
				}
				
				previusKey = key;
				var pathName = key || 'main';
				
				// handle top nav updates:
				$('.nav-collapse li' ).removeClass('active');
				if( $('.nav-collapse .' + pathName ).length ) {
					$('.nav-collapse .' + pathName ).addClass('active');
				} else{
					$('.nav-collapse .features' ).addClass('active');
				}
				
				var $selected = $('#kdoc-navbarcontainer').find( "a[href='index.php?path=" + pathName + "']" );
				// update title: 
				$( '#page-bg-gradient' ).empty();
				
				$('title').text( 'Kaltura Player - ' + pathName );
				
				if( pathName != 'main' && $selected.length ){
					$( '#page-bg-gradient' ).append(
						$('<h2>').append(
							$('<span>').text(
								$selected.parents('.nav-category').find('.link-category').text()
							),
							$('<i>').addClass('kdoc-blue-arrow'),
							$selected.parent().parent().prev().text(),
							$('<i>').addClass('kdoc-white-arrow')
						)
					)
					// update the page title: 
					$('title').text( 'Kaltura Player - ' + $selected.text() );
				}
				// unset all active siblings of nav-category
				$selected.parents('.nav-category').siblings().removeClass('active').find('.active').removeClass('active');
				// be sure category parent is active / selected
				if( $selected.length && !$selected.parents('.nav-category').hasClass('active') ){
					$selected.parents('.nav-category').addClass('active').find('a:first').click();
				}
				// remove sibling selected:
				$selected.parent().siblings().removeClass('active');
				// Be sure the featureset parent is active:
				if( $selected.length && !$selected.parent().parent().prev().hasClass('active') ){
					$selected.parent().parent().prev().addClass('active');
					// only "click" if not already open:
					if( $selected.parent().parent().css('height') == '0px'){
						$selected.parent().parent().prev().find('a:first').click();
					}
				}
				
				// check if key already active:
				$selected.parent().addClass('active');
				
				// Check if we need to update contnet ( check page for history push state key );
				if( document.getElementById( 'hps-' + pathName ) ){
					if( console ) console.log( "KalturaDoc:: " + pathName + " already present " ) ;
					return true;
				}
				var basePath = kDocGetBasePath();
				var pageClassType = 'contentpage';
				// Check for main menu hash changes: 
				switch( key ){
					case 'main':
						pageClassType = 'landing';
						$.get( basePath + 'main_content.php', function( data ){
							$( '#contentHolder' ).html( data );
						});
						break;
					case 'readme':
						showPageBgGradient = false;
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
						$.get( basePath + 'resources_content.php', function( data ){
							$( '#contentHolder' ).html( data );
						});
						break;
					case 'contact':
						$.get( basePath + 'contact_content.php', function( data ){
							$( '#contentHolder' ).html( data );
						});
						break;
					case 'templates':
						$.get( basePath + 'marketing_templates.php', function( data ){
							$( '#contentHolder' ).html( data );
						});
						break;
					case 'customersamples':
						$.get( basePath + 'marketing_customersamples.php', function( data ){
							$( '#contentHolder' ).html( data );
						});
						break;
					case 'advertising':
						$.get( basePath + 'marketing_advertising.php', function( data ){
							$( '#contentHolder' ).html( data );
						});
						break;
					case '':
					default:
						pageClassType = 'featurepage';
						$.get( basePath + 'features.php?path=' + key, function( data ){
							$( '#contentHolder' ).html( data );
						});
						break;
				}
				
				$('.featurepage,.landing,.contentpage')
					.removeClass('featurepage landing contentpage')
					.addClass( pageClassType );
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
				if( !href ){
					return ;
				}
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
					if( history &&  history.pushState ){
						var stateData = { 'key':  href };
						history.pushState( stateData , 'Kaltura player docs -- ' + href, kDocGetBasePath() + href );
						<?php if( $wgKalturaGoogleAnalyticsUA ){
							?>
						// include google log for pushState views:
						_gaq.push(['_trackPageview', '/docs/' + href ]);
						<?php } 
						?>
						handleStateUpdate( stateData );
						return false;
					}
					// No history push state just go to the url: 
					if( mw.getConfig('KalutraDocUseRewriteUrls') ){
						window.location.href = href;
						return false;
					}
					// follow the base ( no path rewrite link ) link
					return true;
				}
			});

			/*$('.btn.btn-navbar').click(function(){
			});*/
		</script>
	  </div><!--/row-->
	</div><!--/.fluid-container-->
	
	<footer>
		<div class="footer-content">
			<div class="social-links">
				<h2>Stay in Touch</h2>
				<ul>
				<li><a class="twitter" title="twitter" href="https://twitter.com/@kaltura" target="_blank">Kaltura on Twitter</a></li>
				<li><a class="chat" title="blog" href="http://blog.kaltura.org/" target="_blank">Kaltura Blog</a></li>
				<li><a class="linkedin" title="linkedin" href="http://www.linkedin.com/groups/Open-Video-Kaltura-2179100" target="_blank">Kaltura on Linkedin</a></li>
				<li><a class="facebook" title="facebook" href="http://www.facebook.com/pages/Kaltura/6839024691" target="_blank">Kaltura on Facebook</a></li>
				</ul>
			</div>
			<p class="footer-top">Kaltura is the world's first Open Source Online Video Platform, providing both enterprise level commercial
			software and services, fully supported and maintained by Kaltura, as well as free open-source community 
			supported solutions, for video publishing, management, syndication and monetization.
			</p>
			<div class="divider"></div>
			<div class="footer-bottom">
				<img src="images/logo-footer.png">
				This page reflects <a target="_new" href="http://html5video.org/wiki/Kaltura_HTML5_Release_Notes">Kaltura HTML5 v<?php 
				 $_pos = strpos( $wgMwEmbedVersion, '__' );
				 $prettyVersion = $wgMwEmbedVersion;
				 if( $_pos !== false ){
				 	$prettyVersion = substr( $prettyVersion, 0, $_pos);
				 }
				 echo $prettyVersion;
				 ?></a>
				Copyright © 2012 Kaltura Inc. All Rights Reserved. Designated trademarks and brands 
				are the property of their respective owners, Use of this web site constitutes acceptance 
				of the <a href="http://corp.kaltura.com/terms-of-use">Terms of Use</a> and 
				<a href="http://corp.kaltura.com/privacy-policy">Privacy Policy</a>, 
				User submitted media on this site is licensed under: <a href="http://creativecommons.org/licenses/by-sa/3.0/" target="_blank">
					Creative Commons Attribution-Share Alike 3.0 Unported License</a>.
			</div>
		</div>	
	</footer>
  </body>
</html>
