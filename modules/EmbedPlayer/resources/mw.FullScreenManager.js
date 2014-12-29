( function( mw, $ ) { "use strict";

mw.FullScreenManager = function( embedPlayer ) {
	return this.init( embedPlayer );
};

mw.FullScreenManager.prototype = {

	// Flag to store the current fullscreen mode
	inFullScreen: false,

	parentsAbsoluteList : [],
	parentsRelativeList: [],
	parentsFixedList: [],
	bindPostfix: '.fullscreenManager',

	init: function( embedPlayer ) {
		this.embedPlayer = embedPlayer;
		return this;
	},

	/**
	 * Check if we're in Fullscreen
	 * @return {boolean)
	 */
	isInFullScreen: function() {
		return this.inFullScreen;
	},

	/**
	 * Toggles full screen by calling
	 *  doFullScreenPlayer to enable fullscreen mode
	 *  restoreWindowPlayer to restore window mode
	 */
	toggleFullscreen: function() {
		// Do normal in-page fullscreen handling:
		if( this.isInFullScreen() ){
			this.restoreWindowPlayer();
		}else {
			this.doFullScreenPlayer();
		}
	},
    openNewWindow: function() {
        var embedPlayer = this.embedPlayer;

        // Iframe configuration
        var iframeMwConfig = {
            'EmbedPlayer.IsFullscreenIframe': true,
            'EmbedPlayer.IframeCurrentTime': embedPlayer.currentTime,
            'EmbedPlayer.IframeIsPlaying': embedPlayer.isPlaying(),
            'EmbedPlayer.IframeParentUrl': document.URL
        };

        var url = embedPlayer.getIframeSourceUrl() + '#' + encodeURIComponent(
            JSON.stringify({
                'mwConfig' :iframeMwConfig,
                'playerId' : embedPlayer.id
            })
        );
        embedPlayer.pause();
        // try and do a browser popup:
        // Name argument for window.open in IE8 must be from supported set: _blank for example
		// http://msdn.microsoft.com/en-us/library/ms536651%28v=vs.85%29.aspx
        var newwin = window.open(
            url,
            '_blank',
            // Fullscreen window params:
            'width=' + screen.width +
                ', height=' + ( screen.height - 90 ) +
                ', top=0, left=0' +
                ', fullscreen=yes'
        );

        if ( window.focus ) {
            newwin.focus();
        }
    },
	/**
	* Do full-screen mode
	*/
	doFullScreenPlayer: function( callback ) {
		mw.log("FullScreenManager:: doFullScreenPlayer" );
        if( mw.getConfig('EmbedPlayer.NewWindowFullscreen') && !screenfull &&
            !(mw.getConfig('EmbedPlayer.EnableIpadNativeFullscreen') && mw.isIpad())){
            this.openNewWindow();
            return;
        }
		// Setup pointer to control builder :
		var _this = this;
		// Setup local reference to embed player:
		var embedPlayer = this.embedPlayer;
		// Setup a local reference to the player interface:
		var $interface = embedPlayer.getInterface();
		// Check fullscreen state ( if already true do nothing )
		if( this.isInFullScreen() == true ){
			return ;
		}
		this.inFullScreen = true;
		// store the verticalScrollPosition
		var isIframe = (mw.getConfig('EmbedPlayer.IsIframeServer' ) && mw.getConfig('EmbedPlayer.IsFriendlyIframe')),
        doc = isIframe ? window['parent'].document : window.document,
		context = isIframe ? window['parent'] : window;
		this.verticalScrollPosition = (doc.all ? doc.scrollTop : context.pageYOffset);
		// Add fullscreen class to interface:
		$interface.addClass( 'fullscreen' );

		// Check for native support for fullscreen and we are in an iframe server
		if( !this.fullScreenApiExcludes() && !mw.isAndroidChromeNativeBrowser() && screenfull && screenfull.enabled(doc) ) {
			var fullscreenHeight = null;
			var fsTarget = this.getFsTarget();
			var escapeFullscreen = function( event ) {
				// grab the correct document target to check for fullscreen
				var doc = ( mw.getConfig('EmbedPlayer.IsIframeServer' ) && mw.getConfig('EmbedPlayer.IsFriendlyIframe'))?
						window['parent'].document:
						window.document;
				if ( ! screenfull.isFullscreen(doc) ) {
					_this.restoreWindowPlayer();
				}
			}
			// remove any old binding:
			doc.removeEventListener(screenfull.raw.fullscreenchange, escapeFullscreen );
			// Add a binding to catch "escape" fullscreen
			doc.addEventListener(screenfull.raw.fullscreenchange, escapeFullscreen );
			// Make the iframe fullscreen:
			screenfull.request(fsTarget, doc);
		} else {
			// Check for hybrid html controls / native fullscreen support:
			var vid = this.embedPlayer.getPlayerElement();
			if( mw.getConfig('EmbedPlayer.EnableIpadNativeFullscreen')
					&&
				vid && vid.webkitSupportsFullscreen
			){
				this.doHybridNativeFullscreen();
				return ;
			} else {
				// make the player target or iframe fullscreen
				this.doContextTargetFullscreen();
			}
		}

		// Bind escape to restore in page clip ( IE9 needs a secondary escape binding )
		$( window ).keyup( function( event ) {
			// Escape check
			if( event.keyCode == 27 ){
				_this.restoreWindowPlayer();
			}
		} );

		// prevent scrolling when in fullscreen
		$( document ).bind('touchmove' + this.bindPostfix, function( e ){
			e.preventDefault();
		});		

		// trigger the open fullscreen event:
		$( embedPlayer ).trigger( 'onOpenFullScreen' );
	},

	/**
	 * Make the target player interface or iframe fullscreen
	 */
	doContextTargetFullscreen: function() {
		var isIframe = mw.getConfig('EmbedPlayer.IsIframeServer' );

		var
		_this = this,
		doc = isIframe ? window['parent'].document : window.document,
		$doc = $( doc ),
		$target = $( this.getFsTarget() ),
		context = isIframe ? window['parent'] : window;

		// update / reset local restore properties
		this.parentsAbsoluteList = [];
		this.parentsRelativeList = [];
		this.parentsFixedList = [];

		// Set the original parent page scale if possible:
		this.orginalParnetViewPortContent = $doc.find( 'meta[name="viewport"]' ).attr( 'content' );

		if( !this.orginalParnetViewPortContent ) {
			this.orginalParnetViewPortContent = $doc.find('meta[name="viewport"]').attr('content', 'width=device-width, user-scalable=yes');
		}

		this.orginalTargetElementLayout = {
			'style' : $target[0].style.cssText,
			'width' : $target.width(),
			'height' : $target.height()
		};
		mw.log("PlayerControls:: doParentIframeFullscreen> verticalScrollPosition:" + this.verticalScrollPosition);

        this.doNativeScroll(context, 0, 0);

		// Make sure the parent page page has a zoom of 1:
		if( ! $doc.find('meta[name="viewport"]').length ){
			$doc.find('head').append( $( '<meta />' ).attr('name', 'viewport') );
		}
		$doc.find('meta[name="viewport"]').attr('content', 'width=1024, user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1' );

		// iPad 5 supports fixed position in a bad way, use absolute pos for iOS
		var playerCssPosition = ( mw.isIOS() ) ? 'absolute': 'fixed';

		// Remove absolute css of the $target's parents
		$target.parents().each( function() {
			var $parent = $( this );
			if( $parent.css( 'position' ) == 'absolute' ) {
				_this.parentsAbsoluteList.push( $parent );
				$parent.css( 'position', 'static' );
			}
			if( $parent.css( 'position' ) == 'relative' ) {
				_this.parentsRelativeList.push( $parent );
				$parent.css( 'position', 'static' );
			}
			if( $parent.css( 'position' ) == 'fixed' ) {
				_this.parentsFixedList.push( $parent );
				$parent.css( 'position', 'static' );
			}
		});

		// Make the $target fullscreen
		$target
			.css({
				'z-index': mw.getConfig( 'EmbedPlayer.FullScreenZIndex' ),
				'position': playerCssPosition,
				'top' : '0px',
				'left' : '0px',
				'margin': 0
			})
			.data(
				'isFullscreen', true
			)
		.after(
			// add a placeholder div to retain page layout in float / block based pages.  
			$('<div>').addClass('player-placeholder').css({
				'width': this.orginalTargetElementLayout.width,
				'height': this.orginalTargetElementLayout.height
			})
		);

		var updateTargetSize = function() {
            _this.doNativeScroll(context, 0, 0);
			var innerWidth = context.innerWidth || context.document.documentElement.clientWidth || context.document.body.clientWidth;
			var innerHeight = context.innerHeight || context.document.documentElement.clientHeight || context.document.body.clientHeight;
			// mobile android chrome has an off by one bug for inner window size: 
			if( mw.isMobileChrome() ){
				innerHeight+=1;
			}

			// Set innerHeight respective of Android pixle ratio
			if( ( mw.isAndroid41() || mw.isAndroid42() || ( mw.isAndroid() && mw.isFirefox() ) ) && !mw.isMobileChrome() 
					&& 
				context.devicePixelRatio
			) {
				innerHeight = context.outerHeight / context.devicePixelRatio;
			}

			$target.css({
				'width' : innerWidth,
				'height' : innerHeight
			});

			if ( mw.isAndroid() && !mw.isMobileChrome() ) {
				$target.trigger( 'resize' ); // make sure we have a resize event on target
			}
			
			// update player size if needed:
			_this.embedPlayer.applyIntrinsicAspect();
		};

		var updateSizeByDevice = function() {
			if ( mw.isAndroid() ) {
				setTimeout(updateTargetSize, 10);
			} else if (mw.isIOS8()){
				setTimeout(updateTargetSize, 500);
			} else{
				updateTargetSize();
			}
		};

		updateSizeByDevice();

		// Android fires orientationchange too soon, i.e width and height are wrong
		var eventName = mw.isAndroid() ? 'resize' : 'orientationchange';
		eventName += this.bindPostfix;

		// Bind orientation change to resize player ( if fullscreen )
		$( context ).bind( eventName, function(){
			if( _this.isInFullScreen() ){
				updateSizeByDevice();
			}
		});
		
		// prevent scrolling when in fullscreen: ( both iframe and dom target use document )
		document.ontouchmove = function( e ){
			if( _this.isInFullScreen() ){
				e.preventDefault();
			}
		};
	},
	/**
	 * Restore the player interface or iframe to a window player
	 */
	restoreContextPlayer: function(){
		var isIframe = mw.getConfig('EmbedPlayer.IsIframeServer' );
		var _this = this;
		var doc = window.document;
		if (isIframe) {
			try {
				doc = window['parent'].document;
			} catch (e) {
				mw.log("FullScreenManager:: Security error when accessing window parent document: " + e.message);
			}
		}
		var $doc = $(doc);
		var $target = $(this.getFsTarget());
		var context = isIframe ? window['parent'] : window;

		mw.log("FullScreenManager:: restoreContextPlayer> verticalScrollPosition:" + this.verticalScrollPosition );

		// Restore document zoom:
		if( this.orginalParnetViewPortContent ){
			$doc.find('meta[name="viewport"]').attr('content', this.orginalParnetViewPortContent );
		} else {
			// Restore user zoom: ( NOTE, there does not appear to be a way to know the
			// initial scale, so we just restore to 1 in the absence of explicit viewport tag )
			// In order to restore zoom, we must set maximum-scale to a valid value
			$doc.find('meta[name="viewport"]').attr('content', 'initial-scale=1, maximum-scale=8, minimum-scale=1, user-scalable=yes' );
			// Initial scale of 1 is too high. Restoring default scaling.
			if ( mw.isMobileChrome() ) {
				$doc.find('meta[name="viewport"]').attr('content', 'user-scalable=yes' );
			}
		}
		if( this.orginalTargetElementLayout ) {
			$target[0].style.cssText = this.orginalTargetElementLayout.style;
			$target.attr({
				'width': this.orginalTargetElementLayout.width,
				'height': this.orginalTargetElementLayout.height
			}).trigger( 'resize' );
			// update player size if needed:
			_this.embedPlayer.applyIntrinsicAspect();
			// remove placeholder
			$target.siblings( '.player-placeholder').remove();
		}
		
		// Restore any parent absolute pos:
		$.each( _this.parentsAbsoluteList, function(inx, $elm) {
			$elm.css( 'position', 'absolute' );
		} );
		$.each( _this.parentsRelativeList, function(inx, $elm) {
			$elm.css( 'position', 'relative' );
		} );
		$.each( _this.parentsFixedList, function(inx, $elm) {
			$elm.css( 'position', 'fixed' );
		} );
		// Scroll back to the previews position ( in a timeout to allow dom to update )
		setTimeout( function(){
            _this.doNativeScroll( context, 0, _this.verticalScrollPosition );
		},100)
	},

    /**
     * Use correct native browser scroll method in case native method is overriden
     */
    doNativeScroll: function(context, top, left){
        if (context) {
            $.each(['scroll', 'scrollTo'], function (i, funcName) {
	            try {
		            if ($.isFunction(context[funcName])) {
			            context[funcName](top, left);
			            return false;
		            }
	            } catch (e) {
		            mw.log("FullScreenManager:: Security error when accessing context: " + e.message);
	            }
            });
        }
    },

	/**
	 * Supports hybrid native fullscreen, player html controls, and fullscreen is native
	 */
	doHybridNativeFullscreen: function(){
		var vid = this.embedPlayer.getPlayerElement();
		var _this = this;
		vid.webkitEnterFullscreen();
		// start to pull for exit fullscreen:
		this.fsIntervalID = setInterval( function(){
			var currentFS = vid.webkitDisplayingFullscreen;
			// Check if we have entered fullscreen but the player
			// has exited fullscreen with native controls click
			if( _this.isInFullScreen() && !currentFS ){
				// restore non-fullscreen player state
				_this.inFullScreen = false;
				// Trigger the onCloseFullscreen event:
				$( _this.embedPlayer ).trigger( 'onCloseFullScreen' );
				// Remove fullscreen class
				_this.embedPlayer.getInterface().removeClass( 'fullscreen' );
				// stop polling for state change.
				clearInterval( _this.fsIntervalID );
			}
		}, 250 );
	},

	doDomFullscreen: function(){
		var _this = this;
		var embedPlayer = this.embedPlayer;
		var $interface = embedPlayer.getInterface();
		// Remove any old mw-fullscreen-overlay
		$( '.mw-fullscreen-overlay' ).remove();

		// Add the css fixed fullscreen black overlay as a sibling to the video element
		// iOS4 does not respect z-index
		$interface.after(
			$( '<div />' )
			.addClass( 'mw-fullscreen-overlay' )
			// Set some arbitrary high z-index
			.css('z-index', mw.getConfig( 'EmbedPlayer.FullScreenZIndex' ) )
			.hide()
			.fadeIn("slow")
		);

		// get the original interface to absolute positioned:
		if( ! this.windowPositionStyle  ){
			this.windowPositionStyle = $interface.css( 'position' );
		}
		if( !this.windowZindex ){
			this.windowZindex = $interface.css( 'z-index' );
		}
		// Get the base offset:
		this.windowOffset = this.getWindowOffset();

		// Change the z-index of the interface
		$interface.css( {
			'position' : 'fixed',
			'z-index' : mw.getConfig( 'EmbedPlayer.FullScreenZIndex' ) + 1,
			'top' : this.windowOffset.top,
			'left' : this.windowOffset.left
		} );

		// If native persistent native player update z-index:
		if( embedPlayer.isPersistentNativePlayer() ){
			$( embedPlayer.getPlayerElement() ).css( {
				'z-index': mw.getConfig( 'EmbedPlayer.FullScreenZIndex' ) + 1,
				'position': 'absolute'
			});
		}

		// Empty out the parent absolute index
		_this.parentsAbsolute = [];

		// Hide the body scroll bar
		$('body').css( 'overflow', 'hidden' );

		var topOffset = '0px';
		var leftOffset = '0px';

		// Check if we have an offsetParent
		if( $interface.offsetParent()[0].tagName
				&&
			$interface.offsetParent()[0].tagName.toLowerCase() != 'body' )
		{
			topOffset = -this.windowOffset.top + 'px';
			leftOffset = -this.windowOffset.left + 'px';
		}

		// Overflow hidden in fullscreen:
		$interface.css( 'overlow', 'hidden' );

		// Remove absolute css of the interface parents
		$interface.parents().each( function() {
			//mw.log(' parent : ' + $( this ).attr('id' ) + ' class: ' + $( this ).attr('class') + ' pos: ' + $( this ).css( 'position' ) );
			if( $( this ).css( 'position' ) == 'absolute' ) {
				_this.parentsAbsolute.push( $( this ) );
				$( this ).css( 'position', null );
				mw.log( 'PlayerLayoutBuilder::  should update position: ' + $( this ).css( 'position' ) );
			}
		});

		// Bind escape to restore in page clip
		$( window ).keyup( function( event ) {
			// Escape check
			if( event.keyCode == 27 ){
				_this.restoreWindowPlayer();
			}
		} );
	},

	getWindowOffset: function(){
		var windowOffset = this.embedPlayer.getInterface().offset();
		windowOffset.top = windowOffset.top - $(document).scrollTop();
		windowOffset.left = windowOffset.left - $(document).scrollLeft();
		this.windowOffset = windowOffset;
		return this.windowOffset;
	},

	getFsTarget: function(){
		if( mw.getConfig('EmbedPlayer.IsIframeServer' ) && mw.getConfig('EmbedPlayer.IsFriendlyIframe')){
			// For desktops that supports native fullscreen api, give iframe as a target
			var targetId;
			if( screenfull && screenfull.enabled() ) {
				targetId = this.embedPlayer.id + '_ifp';
			} else {
				// For dom based fullscreen, use iframe container div
				targetId = this.embedPlayer.id;
			}
			return window['parent'].document.getElementById( targetId );
		} else {
			var	$interface = this.embedPlayer.getInterface();
			return $interface[0];
		}
	},
	getDocTarget: function(){
		if( mw.getConfig('EmbedPlayer.IsIframeServer' ) && mw.getConfig('EmbedPlayer.IsFriendlyIframe')){
			return window['parent'].document;
		} else {
			return document;
		}
	},
	/**
	* Restore the window player
	*/
	restoreWindowPlayer: function() {
		var _this = this;
		mw.log("FullScreenManager :: restoreWindowPlayer" );
		var embedPlayer = this.embedPlayer;

		// Check if fullscreen mode is already restored:
		if( this.isInFullScreen() === false ){
			return ;
		}
		// Set fullscreen mode to false
		this.inFullScreen = false;

		// remove the fullscreen interface
		embedPlayer.getInterface().removeClass( 'fullscreen' );

		// Check for native support for fullscreen and support native fullscreen restore
		var docTarget = this.getDocTarget();		
		if ( !this.fullScreenApiExcludes() && screenfull && screenfull.enabled(docTarget) ) {
			screenfull.exit(docTarget);
		}

		// Restore the iFrame context player
		this.restoreContextPlayer();

		// Unbind events
		$( document ).unbind( this.bindPostfix );

		// Trigger the onCloseFullscreen event:
		$( embedPlayer ).trigger( 'onCloseFullScreen' );
	},

	fullScreenApiExcludes: function(){
		if (mw.isSilk()){
			return true;
		}
		return false;
	}

};

})( window.mw, window.jQuery );