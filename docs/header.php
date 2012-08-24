<?php 
	// Some includes for output of configuration options
	require_once( realpath( dirname( __FILE__ ) ) . '/../includes/DefaultSettings.php' );
?><div class="navbar navbar-fixed-top">
      <div class="navbar-inner">
        <div class="container-fluid">
          <a class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </a>
          <a class="brand" href="http://html5video.org">Kaltura HTML5 v<?php echo $wgMwEmbedVersion ?></a> 
          <div class="btn-group pull-right kdoc-settings">
            <a class="btn dropdown-toggle" data-toggle="dropdown" href="#">
              <i class="icon-wrench"></i>Settings
              <span class="caret"></span>
            </a>
            <ul class="dropdown-menu">
              <li><a data-mode="html5" href="#">Force HTML5 mode</a></li>
               <li><a data-mode="flash" href="#">Flash / browser default</a></li>
              <li class="divider"></li>
            </ul>
          </div>
          <script >
			// add the active checkbox to the mode:
			if( localStorage.kdoc_player == 'html5' ){
				$('.kdoc-settings [data-mode="html5"]')
				.prepend( '<i class="icon-ok" />&nbsp;' )
			} else {
				$('.kdoc-settings [data-mode="flash"]')
				.prepend( '<i class="icon-ok" />&nbsp;' )
			}
			$('.kdoc-settings .dropdown-menu a').click( function(){
				if( !$(this).find('.icon-ok').length ){
					localStorage.kdoc_player = $(this).attr('data-mode');
					// refresh page 
					location.reload();
				}
				return false;
			})
          </script>

          <div class="nav-collapse">
            <ul class="nav">
              <li class="active"><a href="index.php?path=main">All Features</a></li>
              <li><a href="index.php?path=readme">README</a></li>
              <li><a href="index.php?path=contact">Contact</a></li>
            </ul>
            
        <form class="navbar-search pull-left">
		  <input type="text" class="search-query" placeholder="Search">
		</form>
		
          </div><!--/.nav-collapse -->
        </div>
      </div>
    </div>