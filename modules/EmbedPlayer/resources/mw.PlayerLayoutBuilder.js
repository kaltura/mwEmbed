/**
 * Msg text is inherited from embedPlayer
 */

(function (mw, $) {
    "use strict";
    /**
     * mw.PlayerLayoutBuilder object
     *    @param the embedPlayer element we are targeting
     */
    mw.PlayerLayoutBuilder = function (embedPlayer, options) {
        return this.init(embedPlayer, options);
    };

    /**
     * ControlsBuilder prototype:
     */
    mw.PlayerLayoutBuilder.prototype = {
        //Default Local values:

        // Default control bar height
        height: mw.getConfig('EmbedPlayer.ControlsHeight'),

        // Default supported components is merged with embedPlayer set of supported types
        supportedComponents: {},

        // Flag to store if a warning binding has been added
        addWarningFlag: false,

        // Flag to store state of overlay on player
        displayOptionsMenuFlag: false,

        // Flag to store controls status (disabled/enabled)
        controlsDisabled: false,

        // binding postfix
        bindPostfix: '.layoutBuilder',

        layoutReady: false,

        keepControlsOnScreen: false,

        playingFlag: false,
        // Display importance available values
        importanceSet: ['low', 'medium', 'high'],

	/**
	* Initialization Object for the control builder
	*
	* @param {Object} embedPlayer EmbedPlayer interface
	*/
	init: function( embedPlayer ) {
		var _this = this;
		this.embedPlayer = embedPlayer;
		this.fullScreenManager = new mw.FullScreenManager( embedPlayer );
		var animationSupported = this.checkAnimationSupport();
		mw.setConfig( 'EmbedPlayer.AnimationSupported', animationSupported );
		this.addUserAgentCssClass();
		$(document.body).append($('<div style="display: block" class="cssChecker"></div>'));
		// Return the layoutBuilder Object:
		return this;
	},

        getInterface: function () {
            if (!this.$interface) {

                var embedPlayer = this.embedPlayer,
                    $embedPlayer = $(embedPlayer);

                // build the videoDisplay wrapper if needed
                if ($embedPlayer.parent('.videoDisplay').length == 0) {
                    $embedPlayer.wrap(
                        $('<div />').addClass('videoDisplay')
                    );
                }

                var $videoDisplay = $embedPlayer.parent('.videoDisplay');
                if ($videoDisplay.find('.videoShadow').length == 0) {
                    $(".mwEmbedPlayer").before('<div class="videoShadow"></div>');
                }
                // build the videoHolder wrapper if needed
                if ($videoDisplay.parent('.videoHolder').length == 0) {
                    $videoDisplay.parent('.videoDisplay').wrap(
                        $('<div />').addClass('videoHolder')
                    );
                }

                var $videoHolder = $videoDisplay.parent('.videoHolder');
                if ($videoHolder.parent('.mwPlayerContainer').length == 0) {
                    this.$interface = $videoHolder.wrap(
                        $('<div />')
                            .addClass('mwPlayerContainer')
                    ).parent()

                    // merge in any inherited style if added
                    if (embedPlayer.style.cssText) {
                        this.$interface[0].style.cssText += embedPlayer.style.cssText;
                    }
                } else {
                    this.$interface = $videoHolder.parent('.mwPlayerContainer')
                }

                if (mw.isMobileDevice()) {
                    this.$interface.addClass('mobile');
                }

                if (this.embedPlayer.isMobileSkin()) {
                    this.$interface.addClass('mobileSkin');
                }

                if (mw.isTouchDevice()) {
                    this.$interface.addClass('touch');
                }

                if (mw.isNativeApp()) {
                    this.$interface.addClass('nativeApp');
                }

                if (mw.isIE8()) {
                    this.$interface.addClass('ie8');
                }

                // Add our skin name as css class
                var skinName = embedPlayer.playerConfig.layout.skin;
                if (embedPlayer.getRawKalturaConfig("layout") && embedPlayer.getRawKalturaConfig("layout").skin) {
                    skinName = embedPlayer.getRawKalturaConfig("layout").skin;
                }
                this.$interface.addClass(skinName);

			// clear out base style
			embedPlayer.style.cssText = '';
		}
		return this.$interface;		
	},
	isInFullScreen: function() {
		return this.fullScreenManager.isInFullScreen();
	},
	/**
	* Get the control bar height
	* @return {Number} control bar height
	*/
	getHeight: function(){
		return this.embedPlayer.isMobileSkin() ? mw.getConfig( 'EmbedPlayer.MobileControlsHeight' ) : this.height;
	},

        clearInterface: function () {
            this.getInterface().find('.overlay-win').remove();
        },
        /**
         * Add user agent css classes to player interface
         */
        addUserAgentCssClass: function () {
            if (mw.isTouchDevice())
                this.getInterface().addClass('ua-touch');
            if (mw.hasMouseEvents())
                this.getInterface().addClass('ua-mouse');
            if (mw.isIOS())
                this.getInterface().addClass('ua-ios');
            if (mw.isAndroid())
                this.getInterface().addClass('ua-android');
            if (mw.isMacintosh())
                this.getInterface().addClass('ua-osx');
            if (mw.isWindows())
                this.getInterface().addClass('ua-win');
            if (mw.isChrome())
                this.getInterface().addClass('ua-chrome');
            if (mw.isFirefox())
                this.getInterface().addClass('ua-firefox');
            if (mw.isIE())
                this.getInterface().addClass('ua-ie');
            if (mw.isSafari())
                this.getInterface().addClass('ua-safari');
            if (mw.isEdge())
                this.getInterface().addClass('ua-edge');
            if (mw.isChromeCast())
                this.getInterface().addClass('ua-chromecast');
        },
        /**
         * Add the controls HTML to player interface
         */
        addControls: function () {
            if (this.layoutReady) return;
            // Set up local pointer to the embedPlayer
            var embedPlayer = this.embedPlayer;

            // Set up local layoutBuilder
            var _this = this;

            // Remove any old controls & old overlays:
            this.clearInterface();

            // Reset flags:
            _this.displayOptionsMenuFlag = false;

            // Init tooltips
            if (mw.hasMouseEvents()) {
                this.initToolTips();
            }

            // Supports CSS3 on IE8/IE9
            if (mw.isIE8() || mw.isIE9()) {
                this.embedPlayer.bindHelper('layoutBuildDone', function () {
                    $('.PIE').each(function () {
                        PIE.attach(this);
                    });
                });
            }

            this.addContainers();
            this.mapComponents();

            // check if the layout css was loaded
            if (this.layoutCssLoaded()) {
                this.drawLayoutAndBind();
            } else {
                // wait for layout css to finish loading (race condition)
                var _this = this;
                var counter = 0; // we will wait up to 1 second before we continue.
                var cssCheckInterval = setInterval(function () {
                    if (_this.layoutCssLoaded()) {
                        clearInterval(cssCheckInterval);
                        _this.drawLayoutAndBind();
                    } else {
                        counter++;
                        if (counter == 40) {
                            clearInterval(cssCheckInterval);
                            _this.drawLayoutAndBind();
                            mw.log("failed to load layout.css");
                        }
                    }
                }, 25);
            }
        },

        layoutCssLoaded: function () {
            return ($(".cssChecker").css("display") == "none");
        },

        drawLayoutAndBind: function () {
            this.drawLayout();
            this.addControlBindings(); // Add top level Controls bindings
            $(".cssChecker").remove();
        },

        // Our default layout container which plugins can append their components
        layoutContainers: {
            'topBarContainer': [],
            'sideBarContainer': [],
            'videoHolder': [],
            'smartContainer': [],
            'controlBarContainer': [],
            'controlsContainer': []
        },

        addContainers: function () {
            this.embedPlayer.triggerHelper('addLayoutContainer');
        },

        mapComponents: function () {
            var _this = this;
            // Allow plugins to add their own components ( old event: addControlBarComponent )
            this.embedPlayer.triggerHelper('addLayoutComponent', this);
            //var plugins = this.embedPlayer.playerConfig['plugins'];
            $.each(this.components, function (compId, compConfig) {
                // If we don't have parent, continue
                if (!compConfig.parent) return true;
                // Check if we have this kind of container
                if (_this.layoutContainers[compConfig.parent]) {
                    _this.layoutContainers[compConfig.parent].push({
                        'id': compId,
                        'order': compConfig.order,
                        'insertMode': (compConfig.insertMode) ? compConfig.insertMode : 'lastChild'
                    });
                }
            });

            $.each(this.layoutContainers, function (idx, components) {
                _this.layoutContainers[idx].sort(function (comp1, comp2) {
                    return ((comp1.order < comp2.order) ? -1 : ((comp1.order > comp2.order) ? 1 : 0));
                });
            });
        },

        drawLayout: function () {
            mw.log('PlayerLayoutBuilder:: drawLayout', this.layoutContainers);
            var _this = this;
            // Draw the layout from the root el / components
            var $interface = this.getInterface();
            this.componentsMenus = [];
            $.each(_this.layoutContainers, function (containerId, components) {
                var $parent = $interface.find('.' + containerId);
                if ($parent.length) {
                    _this.drawComponents($parent, components);
                } else {
                    mw.log('PlayerLayoutBuilder:: drawLayout:: container "' + containerId + '" not found in DOM');
                }
            });

            // Add tab-index
            var $buttons = $interface.find('.controlsContainer').find('.btn');
            var tabIndex = 0;
            var rightBtnIndex = 0;
            $buttons.each(function (i) {
                if ($(this).hasClass('pull-right') || $(this).parent().hasClass('pull-right')) {
                    rightBtnIndex++;
                    $(this).attr('tabindex', ($buttons.length - rightBtnIndex));
                } else {
                    tabIndex++;
                    $(this).attr('tabindex', tabIndex);
                }
            });

            // Trigger layoutBuildDone ( old event: controlBarBuildDone )
            this.layoutReady = true;
            this.embedPlayer.triggerHelper('layoutBuildDone');
            try {
                window.parent.postMessage('layoutBuildDone', '*');
            } catch (e) {
            }
        },

        drawComponents: function ($parent, components) {
            var _this = this;
            // Go over components
            $.each(components, function (idx, component) {
                var $component = _this.getDomComponent(component.id);
                if ($component === false) {
                    mw.log('PlayerLayoutBuilder:: drawComponents: component "' + component.id + '" was not defined');
                } else {
                    var dropDownMenu = $component.find('ul.dropdown-menu')[0];
                    if( dropDownMenu ) {
                        _this.componentsMenus.push(dropDownMenu);
                    }
                    if (component.insertMode == 'firstChild') {
                        $parent.prepend($component);
                    } else {
                        $parent.append($component);
                    }
                }
            });
        },

        updateComponentsVisibility: function () {
            var _this = this;
            // start event, so dynamic space components can resize to take min space
            $(this.embedPlayer).trigger('updateComponentsVisibilityStart')
            // Go over containers and update their components
            $.each(this.layoutContainers, function (containerId, components) {
                if (containerId == 'videoHolder' || containerId == 'controlBarContainer' || containerId == 'smartContainer') {
                    return true;
                }
                _this.updateContainerCompsByAvailableSpace(
                    _this.getInterface().find('.' + containerId)
                );
            });

            // once complete trigger and event ( so dynamic space components can resize to take remaining space )
            $(this.embedPlayer).trigger('updateComponentsVisibilityDone')
        },

        updateContainerCompsByAvailableSpace: function ($container) {
            if ( !$container.length || mw.isChromeCast() ) return;

            var _this = this;
            var containerWidth = $container.width();

            var hideOneByImportance = function () {
                for (var i = 0; i < _this.importanceSet.length; i++) {
                    var $s = $container.find('.display-' + _this.importanceSet[i] + ':visible');
                    if ($s.length) {
                        var $first = $s.first();
                        $first.hide();
                        return _this.getComponentWidth($first);
                    }
                }
            };

            var showOneByImportance = function () {
                var reversedImportanceSet = _this.importanceSet.slice(0).reverse();
                for (var i = 0; i < reversedImportanceSet.length; i++) {
                    var $comp = getNextComponentToShow(reversedImportanceSet[i]);
                    if ($comp) {
                        $comp.show();
                        return _this.getComponentWidth($comp);
                    }
                }
            };

            var getNextComponentToShow = function (importanceLevel) {
	            var $s = $container.children('.display-' + importanceLevel).filter(function () {
		            return this.style.display === 'none';
	            });
	            while ($s.length) {
                    var $first = $s.first();
                    if ($first.data('forceHide')) {
                        $s = $s.slice(1);
                    } else {
                        return $s.first();
                    }
                }
            };

            var getNextShowWidth = function () {
                var nextWidth = 0;
                var reversedImportanceSet = _this.importanceSet.slice(0).reverse();
                for (var i = 0; i < reversedImportanceSet.length; i++) {
                    var $comp = getNextComponentToShow(reversedImportanceSet[i]);
                    if ($comp) {
                        $comp.show();
                        nextWidth = _this.getComponentWidth($comp);
                        if (mw.getConfig('EmbedPlayer.IsFriendlyIframe')) {
                            $comp.hide();
                        }
                        break;
                    }
                }
                return nextWidth;
            };

            // add a fail safe for while loops on DOM
            var i = 0;
            var componentsWidthForContainer = this.getComponentsWidthForContainer($container);

            // Hide till fit
            if (containerWidth < componentsWidthForContainer && this.canHideShowContainerComponents($container, true)) {
                while (i++ < 30 && containerWidth < componentsWidthForContainer && this.canHideShowContainerComponents($container, true)) {
                    // Log to console
                    mw.log("hideOneByImportance: " + containerWidth + ' < ' + componentsWidthForContainer);
                    // Hide first by importance and return his length
                    var lengthHided = hideOneByImportance();
                    // If a component is being hide, update the components width, else finish iterate
                    if (!lengthHided) {
                        break;
                    }
                    componentsWidthForContainer = componentsWidthForContainer - lengthHided;
                }
                // break ( only hide or show in one pass )
                return;
            }

            // Show till full
            while (i++ < 30 && $container.find('.comp:hidden').length && this.canHideShowContainerComponents($container, false)
            && containerWidth > (componentsWidthForContainer + getNextShowWidth())) {
                mw.log("showOneByImportance: " + containerWidth + ' > ' + componentsWidthForContainer);
                // Show first by importance and return his length
                var lengthShowed = showOneByImportance();
                // If a component is being showed, update the components width, else finish iterate
                if (!lengthShowed) {
                    break;
                }
                componentsWidthForContainer = componentsWidthForContainer + lengthShowed;
            }
        },

        canHideShowContainerComponents: function ($container, visible) {
            var state = (visible) ? 'visible' : 'hidden';
            var found = false;
            // Much faster then $.each loop
            for (var i = 0; i < this.importanceSet.length; i++) {
                var $s = $container.find('.display-' + this.importanceSet[i] + ':' + state);
                if ($s.length) {
                    found = true;
                    break;
                }
            }
            return found;
        },

        // Special case expandable components (i.e volumeControl)
        getComponentWidth: function ($comp) {
            return $comp.data('width') || $comp.outerWidth(true);
        },

        getComponentsWidthForContainer: function ($container) {
            var _this = this;
            var totalWidth = this.embedPlayer.isMobileSkin() ? 2 : 10; // add some padding
            $container.find('.comp:visible').each(function () {
                totalWidth += _this.getComponentWidth($(this));
            });
            return totalWidth;
        },

        getComponentsHeight: function () {
            var height = 0;
            // Go over all playerContainer direct children with .block class
            this.getInterface().find('.block').each(function () {
                height += $(this).outerHeight(true);
            });
            return height;
        },

        getContainerHeight: function () {
            var height = 0;
            if (mw.isIE11()) {
                height = this.getInterface()[0].clientHeight;
            } else {
                height = this.getInterface().height();
            }
            return height;
        },

        initToolTips: function () {
            var _this = this;
            this.embedPlayer.bindHelper('layoutBuildDone mediaListLayoutReady', function () {
                _this.setupTooltip()
                _this.setupTooltip(_this.getInterface().find(".tooltipBelow"), "arrowTop");
            });
            //Remove tooltip on UI state changes
            this.embedPlayer.bindHelper('hidePlayerControls clearTooltip', function () {
                _this.getInterface().siblings(".ui-tooltip").remove();
            });
        },
        setupTooltip: function (elm, arrowDirection) {
            // exit if not enabled
            if (!this.embedPlayer.enableTooltips || kWidget.isIE8()) {
                return;
            }
            var tooltips = elm ? elm : this.getInterface();
            if (tooltips && tooltips.length > 0) {
                var arrowType = arrowDirection ? arrowDirection : "arrow";
                var myPosition = tooltips.offset().top > 0 ? "center bottom+55" : "center bottom-10";
                tooltips.tooltip({
                    items: '[data-show-tooltip]',
                    "show": {"delay": 1000},
                    "hide": {"duration": 0},
                    "content": function () {
                        return $(this).attr('title');
                    },
                    position: {
                        my: myPosition,
                        at: "center top",
                        using: function (position, feedback) {
                            $(this).css(position);
                            $("<div>")
                                .addClass(arrowType)
                                .addClass(feedback.vertical)
                                .addClass(feedback.horizontal)
                                .appendTo(this);
                        }
                    }
                });
            }
        },
        /**
         * Get minimal width for interface overlay
         */
        getOverlayWidth: function () {
            return ( this.embedPlayer.getPlayerWidth() < 300 ) ? 300 : this.embedPlayer.getPlayerWidth();
        },

        /**
         * Get minimal height for interface overlay
         */
        getOverlayHeight: function () {
            return ( this.embedPlayer.getPlayerHeight() < 200 ) ? 200 : this.embedPlayer.getPlayerHeight();
        },

        /**
         * addControlBindings
         * Adds control hooks once controls are in the DOM
         */
        addControlBindings: function () {
            // Set up local pointer to the embedPlayer
            var _this = this;
            var embedPlayer = this.embedPlayer;
            var $interface = this.getInterface();
            var adPlaybackState = 'adplay-state';

            // Shoutcut for binding
            var b = function (eventName, callback) {
                embedPlayer.bindHelper(eventName + _this.bindPostfix, callback);
            };

            // Decide which bindings to add based on device capabilities
            var addPlaybackBindings = function () {
                if (embedPlayer.getFlashvars('disableOnScreenClick')) {
                    return;
                }
                if (mw.isTouchDevice()) {
                    if (!( mw.isAndroid() && mw.isMobileChrome() )) {
                        _this.addPlayerTouchBindings();
                    }
                }
                //if we're in native app android <=4.3 we dont want to add player click bindings
                if (!(mw.isNativeApp() && ( mw.isAndroid43() || mw.isAndroid41() || mw.isAndroid42() ) )) {
                    _this.addPlayerClickBindings();
                }

            };

            var removePlaybackBindings = function () {
                if (embedPlayer.getFlashvars('disableOnScreenClick')) {
                    return;
                }
                if (mw.isTouchDevice()) {
                    _this.removePlayerTouchBindings();
                }
                _this.removePlayerClickBindings();
            };

            _this.onControlBar = false;

            // Remove any old interface bindings
            embedPlayer.unbindHelper(this.bindPostfix);

            var bindFirstPlay = false;
            _this.addRightClickBinding();

            _this.updateComponentsVisibility();
            _this.updatePlayerSizeClass();
            b('updateLayout', function () {
                _this.updateComponentsVisibility();
                _this.updatePlayerSizeClass();
            });

            // Bind into play.ctrl namespace ( so we can unbind without affecting other play bindings )
            b('onplay', function () { //Only bind once played
                // add right click binding again ( in case the player got swaped )
                _this.addRightClickBinding();
            });

            b('AdSupport_StartAdPlayback', function () {
                $interface.addClass(adPlaybackState);
            });

            b('AdSupport_EndAdPlayback', function () {
                $interface.removeClass(adPlaybackState);
            });

            b('seeking', function () {
                $interface.addClass("seeking-state");
            });

            b('seeked', function () {
                $interface.removeClass("seeking-state");
            });

            // Bind to EnableInterfaceComponents
            b('onEnableInterfaceComponents', function () {
                _this.controlsDisabled = false;
                addPlaybackBindings();
            });

            // Bind to DisableInterfaceComponents
            b('onDisableInterfaceComponents', function () {
                _this.controlsDisabled = true;
                removePlaybackBindings();
            });

            // Add fullscreen bindings to update layout:
            b('onOpenFullScreen', function () {
                setTimeout(function () {
                    embedPlayer.doUpdateLayout();
                }, 100)
            });
            b('onCloseFullScreen', function () {
                // when going fullscreen the browser temporally maximizes in the window space,
                // then goes to true fullscreen, so we need to delay the resize event.
                setTimeout(function () {
                    embedPlayer.doUpdateLayout();
                }, 100)
            });

            // IE8 does not trigger click events on Flash objects
            if ((embedPlayer.adSiblingFlashPlayer || embedPlayer.instanceOf == 'Kplayer') &&
                (mw.isIE8() || mw.isIE9())) {
                embedPlayer.getVideoHolder().bind('mouseup', function () {
                    if (embedPlayer.sequenceProxy && embedPlayer.sequenceProxy.isInSequence) {
                        $(embedPlayer).trigger('click');
                    }
                });
            }

            // add the player click / touch bindings
            addPlaybackBindings();
            this.addControlsVisibilityBindings();

            // if overlaying controls add hide show player binding.
            if (embedPlayer.isOverlayControls() && mw.hasMouseEvents()) {
                this.addMouseMoveBinding(this.getInterface());
                this.addMouseMoveHandler();
            }

            mw.log('trigger::addControlBindingsEvent');
            embedPlayer.triggerHelper('addControlBindingsEvent');
        },
        addPlayerTouchBindings: function () {
            var embedPlayer = this.embedPlayer;
            var _this = this;
            // First remove old bindings
            this.removePlayerTouchBindings();

            // protect against scroll intent
            var touchStartPos, touchEndPos = null;
            $(_this.embedPlayer).bind('touchstart' + this.bindPostfix, function (e) {
                touchStartPos = e.originalEvent.touches[0].pageY; //starting point
            })
                .bind('touchend' + this.bindPostfix, function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    // remove drag binding:
                    if (_this.embedPlayer.isControlsVisible || _this.embedPlayer.useNativePlayerControls()) {
                        touchEndPos = e.originalEvent.changedTouches[0].pageY; //ending point
                        var distance = Math.abs(touchStartPos - touchEndPos);
                        if (distance < 10) {
                            mw.log('PlayerLayoutBuilder::addPlayerTouchBindings:: togglePlayback from touch event');
                            _this.togglePlayback();
                        }
                    }
                });
        },
        removePlayerTouchBindings: function () {
            $(this.embedPlayer).unbind("touchstart" + this.bindPostfix);
            $(this.embedPlayer).unbind("touchend" + this.bindPostfix);
        },

        // Class to add on interface when mouse is out
        outPlayerClass: 'player-out',
        hideControlsTimeout: null,
        showPlayerControls: function () {
            clearTimeout(this.hideControlsTimeout);
            this.getInterface().removeClass(this.outPlayerClass);
            this.removeTouchOverlay();
            if (this.$interface.find(".mwEmbedPlayer").hasClass("noCursor")) {
                this.$interface.find(".mwEmbedPlayer").removeClass("noCursor");
            }
            this.embedPlayer.triggerHelper('showPlayerControls');
        },
        hidePlayerControls: function () {
            if ((!this.embedPlayer.paused || this.embedPlayer.isInSequence())) {
                // track open components menus ( FEC-5623 )
                var areAllCompMenusClosed = true;
                $.each(this.componentsMenus, function (index, dropDownMenu) {
                    return (areAllCompMenusClosed = dropDownMenu.className.indexOf('open') === -1);
                });

                if (areAllCompMenusClosed) {
                    this.getInterface().addClass(this.outPlayerClass);
                    this.addTouchOverlay();
                    if (this.isInFullScreen()) {
                        this.$interface.find(".mwEmbedPlayer").addClass("noCursor");
                    }
                    this.embedPlayer.triggerHelper('hidePlayerControls');
                }
            }
        },

        addControlsVisibilityBindings: function () {
            var embedPlayer = this.embedPlayer;
            var _this = this;
            var $interface = this.getInterface();

            // Add recommend firefox if we have non-native playback:
            if (_this.checkNativeWarning()) {
                _this.addWarningBinding(
                    'EmbedPlayer.ShowNativeWarning',
                    gM('mwe-embedplayer-for_best_experience',
                        $('<a />')
                            .attr({
                                'href': 'http://www.mediawiki.org/wiki/Extension:TimedMediaHandler/Client_download',
                                'target': '_new'
                            })
                    )
                );
            }

            // Check if we should display the interface:
            if (mw.hasMouseEvents()) {
                var hoverIntentConfig = {
                    'sensitivity': 100,
                    'timeout': mw.getConfig('EmbedPlayer.HoverOutTimeout'),
                    'over': function () {
                        _this.showPlayerControls();
                    },
                    'out': function () {
                        _this.hidePlayerControls();
                    }
                };
                $interface.hoverIntent(hoverIntentConfig);
            }

            // Bind a startTouch to show controls
            $(embedPlayer).bind('touchstart', function () {
                _this.showPlayerControls();
                _this.hideControlsTimeout = setTimeout(function () {
                    _this.hidePlayerControls();
                }, 5000);
                return true;
            });
        },

        addMouseMoveBinding: function (elem) {
            if (elem) {
                var _this = this;
                // Bind mouse move in interface to hide control bar
                _this.mouseMovedFlag = false;
                var oldX = 0, oldY = 0;
                $(elem).mousemove(function (event) {
                    // debounce mouse movements
                    if (Math.abs(oldX - event.pageX) > 4 || Math.abs(oldY - event.pageY) > 4) {
                        _this.mouseMovedFlag = true;
                    }
                    oldX = event.pageX;
                    oldY = event.pageY;
                }).mouseout(function (event) {
                    //Clear mouseMoveFlag when moving mouse out of player
                    _this.mouseMovedFlag = false;
                });
            } else {
                mw.log("addMouseMoveBinding: no element supplied");
            }
        },
        addMouseMoveHandler: function () {
            var _this = this;
            // Check every 2 seconds reset flag status if controls are overlay
            var checkMovedMouse = function () {
                if (_this.mouseMovedFlag) {
                    _this.mouseMovedFlag = false;
                    _this.showPlayerControls();
                    // Once we move the mouse keep displayed for 4 seconds
                    _this.checkMovedMouseTimeout = setTimeout(checkMovedMouse, mw.getConfig('EmbedPlayer.MouseMoveTimeout'));
                } else {
                    // Check for mouse movement every 250ms
                    _this.hidePlayerControls();
                    _this.checkMovedMouseTimeout = setTimeout(checkMovedMouse, 250);
                }
            };
            // start monitoring for moving mouse
            checkMovedMouse();
        },
        removeMouseMoveHandler: function () {
            clearTimeout(this.checkMovedMouseTimeout);
            this.checkMovedMouseTimeout = null;
        },
        addTouchOverlay: function () {
            if (mw.isTouchDevice() && !this.keepControlsOnScreen &&
                this.embedPlayer.getKalturaConfig("controlBarContainer", "hover")) {
                var _this = this;
                if (this.getInterface().find('#touchOverlay').length == 0) {
                    var touchOverlay = this.getInterface().find('.controlBarContainer').before(
                        $('<div />')
                            .css({
                                'position': 'absolute',
                                'top': 0,
                                'width': '100%',
                                'height': '100%',
                                'z-index': 1
                            })
                            .attr('id', "touchOverlay")
                            .bind('touchstart click', function (event) {
                                // Don't propogate the event to the document
                                if (event.stopPropagation) {
                                    event.stopPropagation();
                                    if (event.stopImmediatePropagation) {
                                        event.stopImmediatePropagation();
                                    }
                                } else {
                                    event.cancelBubble = true; // IE model
                                }
                                event.preventDefault();
                                _this.removeMouseMoveHandler();
                                _this.mouseMovedFlag = true;
                                _this.showPlayerControls();
                                _this.addMouseMoveHandler();
                                _this.getInterface().find('#touchOverlay').remove();

                            })
                    );
                    this.addMouseMoveBinding(touchOverlay);
                }
            }
        },
        removeTouchOverlay: function () {
            if (mw.isTouchDevice() && this.getInterface().find('#touchOverlay').length != 0) {
                this.getInterface().find('#touchOverlay').remove();
            }
        },

        // Hold the current player size class
        // The value is null so we will trigger playerSizeClassUpdate on first update
        playerSizeClass: null,
        // Adds class to the interface with the current player size and trigger event
        // Triggered by updateLayout event
        updatePlayerSizeClass: function () {
            var width = this.embedPlayer.getVideoHolder().width();
            var playerSizeClass = '';
            if (width < 300) {
                playerSizeClass = 'tiny';
            } else if (width < 450) {
                playerSizeClass = 'small';
            } else if (width < 700) {
                playerSizeClass = 'medium';
            } else {
                playerSizeClass = 'large';
            }
            // Only update if changed
            if (this.playerSizeClass !== playerSizeClass) {
                this.playerSizeClass = playerSizeClass;
                this.getInterface()
                    .removeClass('size-tiny size-small size-medium size-large')
                    .addClass('size-' + this.playerSizeClass);
                this.embedPlayer.triggerHelper('playerSizeClassUpdate', [this.playerSizeClass]);
            }
        },
        removePlayerClickBindings: function () {
            $(this.embedPlayer)
                .unbind("click" + this.bindPostfix)
                .unbind("dblclick" + this.bindPostfix);
        },
        addPlayerClickBindings: function () {

            var _this = this;
            var embedPlayer = this.embedPlayer;

            // Remove old click bindings before adding:
            this.removePlayerClickBindings();

            var didDblClick = false;
            var dblClickTimeout = null;

            $(embedPlayer).bind("dblclick" + _this.bindPostfix, function () {
                didDblClick = true;
            });

            $(embedPlayer).bind("goingtoplay", function () {
                _this.playingFlag = true;
                setTimeout(function () {
                    _this.playingFlag = false;
                }, 1000);
            });
            // check for drag:


            // Check for click
            $(embedPlayer).bind("click" + _this.bindPostfix, function () {
                if (mw.isMobileDevice()) {
                    if (!_this.playingFlag) {
                        _this.togglePlayback();
                    }
                }
                else {
                    var playerStatus = embedPlayer.isPlaying();
                    if (dblClickTimeout) return true;
                    dblClickTimeout = setTimeout(function () {
                        if (didDblClick) {
                            didDblClick = false;
                        } else {
                            mw.log('PlayerLayoutBuilder::addPlayerClickBindings:: togglePlayback from click event');
                            if (embedPlayer.isPlaying() == playerStatus) {
                                if (!_this.playingFlag) {
                                    _this.togglePlayback();
                                }
                            }
                        }
                        clearTimeout(dblClickTimeout);
                        dblClickTimeout = null;
                    }, 300);
                }

                return true;
            });

        },
        addRightClickBinding: function () {
            var embedPlayer = this.embedPlayer;
            // check config:
            if (mw.getConfig('EmbedPlayer.EnableRightClick') === false) {
                document.oncontextmenu = function (e) {
                    return false;
                };
                $(embedPlayer).mousedown(function (e) {
                    if (e.button == 2) {
                        return false;
                    }
                });
            }
        },
        /* Check if the controls are disabled */

        isControlsDisabled: function () {
            return this.controlsDisabled;
        },

        togglePlayback: function () {

            // Do not toggle playback when controls disabled or using native controls
            if (this.isControlsDisabled()) {
                return;
            }

            this.embedPlayer.togglePlayback();
        },
        /**
         * Check if a warning should be issued to non-native playback systems
         *
         * dependent on mediaElement being setup
         */
        checkNativeWarning: function () {
            if (mw.getConfig('EmbedPlayer.ShowNativeWarning') === false) {
                return false;
            }

            // Don't show for imageOverlay player:
            if (this.embedPlayer.instanceOf == 'ImageOverlay') {
                return false;
            }

            // If the resolution is too small don't display the warning
            if (this.embedPlayer.getPlayerHeight() < 199) {
                return false;
            }
            // See if we have we have ogg support
            var supportingPlayers = mw.EmbedTypes.getMediaPlayers().getMIMETypePlayers('video/ogg');
            for (var i = 0; i < supportingPlayers.length; i++) {
                if (supportingPlayers[i].id == 'oggNative') {
                    return false;
                }
            }

            // Chrome's webM support is oky though:
            if (/chrome/.test(navigator.userAgent.toLowerCase()) &&
                mw.EmbedTypes.getMediaPlayers().getMIMETypePlayers('video/webm').length) {
                return false;
            }

            // Check for h264 and or flash/flv source and playback support and don't show warning
            if (
                ( mw.EmbedTypes.getMediaPlayers().getMIMETypePlayers('video/mp4').length
                && this.embedPlayer.mediaElement.getSources('video/mp4').length )
                ||
                ( mw.EmbedTypes.getMediaPlayers().getMIMETypePlayers('video/x-flv').length
                && this.embedPlayer.mediaElement.getSources('video/x-flv').length )
                ||
                ( mw.EmbedTypes.getMediaPlayers().getMIMETypePlayers('application/vnd.apple.mpegurl').length
                && this.embedPlayer.mediaElement.getSources('application/vnd.apple.mpegurl').length )
                ||
                ( mw.EmbedTypes.getMediaPlayers().getMIMETypePlayers('audio/mpeg').length
                && this.embedPlayer.mediaElement.getSources('audio/mpeg').length )
            ) {
                // No firefox link if a h.264 or flash/flv stream is present
                return false;
            }

            // Should issue the native warning
            return true;
        },

        /**
         * Does a native warning check binding to the player on mouse over.
         * @param {string} preferenceId The preference Id
         * @param {object} warningMsg The jQuery object warning message to be displayed.
         *
         */
        /**
         * Display a warning message on the player
         * checks a preference Id to enable or disable it.
         * @param {string} preferenceId The preference Id
         * @param {object} warningMsg The jQuery object warning message to be displayed.
         * @param {boolean} if the hide ui should be exposed
         *
         */
        addWarningBinding: function (preferenceId, warningMsg, hideDisableUi) {
            mw.log('mw.PlayerLayoutBuilder: addWarningBinding: ' + preferenceId + ' wm: ' + warningMsg);
            // Set up local pointer to the embedPlayer
            var embedPlayer = this.embedPlayer;
            var _this = this;
            // make sure the player is large enough
            if (embedPlayer.getWidth() < 200) {
                return false;
            }

            // Can be uncommented to reset hide prefrence
            //$.cookie( preferenceId, '' );

            // Check if a cookie has been set to hide the warning:
            if (mw.getConfig(preferenceId) === true && $.cookie(preferenceId) == 'hidewarning') {
                return;
            }

            var warnId = "warningOverlay_" + embedPlayer.id;
            $('#' + warnId).remove();

            // Add the targetWarning:
            var $targetWarning = $('<div />')
                .attr({
                    'id': warnId
                })
                .addClass('ui-state-highlight ui-corner-all')
                .css({
                    'position': 'absolute',
                    'background': '#333',
                    'color': '#AAA',
                    'top': '10px',
                    'left': '10px',
                    'right': '10px',
                    'padding': '4px',
                    'z-index': 2
                })
                .html(warningMsg);

            embedPlayer.getInterface().append(
                $targetWarning
            );

            $targetWarning.append(
                $('<br />')
            );
            // check if we should show the checkbox
            if (!hideDisableUi) {
                $targetWarning.append(
                    $('<input type="checkbox" />')
                        .attr({
                            'id': 'ffwarn_' + embedPlayer.id,
                            'name': 'ffwarn_' + embedPlayer.id
                        })
                        .click(function () {
                            mw.log("WarningBindinng:: set " + preferenceId + ' to hidewarning ');
                            // Set up a cookie for 30 days:
                            embedPlayer.setCookie(preferenceId, 'hidewarning', {expires: 30})
                            //$.cookie( preferenceId, 'hidewarning', {expires: 30} );
                            // Set the current instance
                            mw.setConfig(preferenceId, false);
                            $('#warningOverlay_' + embedPlayer.id).fadeOut('slow');
                            // set the local preference to false
                            _this.addWarningFlag = false;
                        })
                );
                $targetWarning.append(
                    $('<label />')
                        .text(gM('mwe-embedplayer-do_not_warn_again'))
                        .attr('for', 'ffwarn_' + embedPlayer.id)
                );
            }
            return $targetWarning;
        },

        /**
         * The ctrl builder updates the interface on seeking
         */
        onSeek: function () {
            //mw.log( "layoutBuilder:: onSeek" );
            // add a loading spinner:
            this.embedPlayer.addPlayerSpinner();
            // hide once playing again:
            this.embedPlayer.hideSpinnerOncePlaying();
        },

        /**
         * Updates the player status that displays short text msgs and the play clock
         * @param {String} value Status string value to update
         */
        setStatus: function (value) {
            // update status:
            if (this.embedPlayer.getInterface()) {
                //this.embedPlayer.getInterface().find( '.timers' ).html( value );
            }
        },

        /**
         * Close a menu overlay
         */
        closeMenuOverlay: function () {
            var _this = this;
            var embedPlayer = this.embedPlayer;
            var $overlay = embedPlayer.getInterface().find('.overlay-win,.overlay,.ui-widget-shadow');

            // Only issue enablePlayControls if no close button is present and controls are currently disabled
            if ($overlay.length && !embedPlayer._playContorls && !$overlay.find('.overlayCloseButton').length) {
                embedPlayer.enablePlayControls();
            }

            this.displayOptionsMenuFlag = false;
            //mw.log(' closeMenuOverlay: ' + this.displayOptionsMenuFlag);

            $overlay.fadeOut("slow", function () {
                $overlay.remove();
            });

            // Make sure overlay was removed
            $overlay.remove();

            $(embedPlayer).trigger('closeMenuOverlay');

            return false; // onclick action return false
        },

        /**
         * Generic function to display custom HTML overlay on video.
         *
         * @param {String} overlayContent content to be displayed
         */
        displayMenuOverlay: function (overlayContent, closeCallback, hideCloseButton) {
            var _this = this;
            var embedPlayer = this.embedPlayer;
            mw.log('PlayerLayoutBuilder:: displayMenuOverlay');
            //	set the overlay display flag to true:
            this.displayOptionsMenuFlag = true;

            if (!this.supportedComponents['overlays']) {
                embedPlayer.pause();
            }

            // Check if overlay window is already present:
            if (embedPlayer.getInterface().find('.overlay-win').length != 0) {
                //Update the content
                embedPlayer.getInterface().find('.overlay-content').html(
                    overlayContent
                );
                return;
            }
            // If we don't have close button present, we'll want to keep the control bar for edge case of
            // having overlay on fullscreen - No option to close the overlay
            var $overlayContainer = embedPlayer.getInterface();

            if (hideCloseButton) {
                $overlayContainer = embedPlayer.getVideoHolder();
                embedPlayer.disablePlayControls(['playlistPrevNext']);
                embedPlayer.getInterface().find('.play-btn')
                    .unbind('click')
                    .click(function () {
                        if (embedPlayer._playContorls) {
                            embedPlayer.play();
                        }
                    })
            }

            // Add an overlay
            $overlayContainer.append(
                $('<div />')
                    .addClass('overlay')
                    .css({
                        'height': '100%',
                        'width': '100%',
                        'z-index': mw.isMobileDevice() ? 1000 : 4
                    })
            );

            var $closeButton = [];

            if (!hideCloseButton) {
                // Setup the close button
                var closeMessage = gM("mwe-embedplayer-close_screen");
                $closeButton = $('<button></button>')
                    .addClass('btn icon-close closePluginsScreen')
                    .attr('aria-label', closeMessage)
                    .click(function () {
                        _this.closeMenuOverlay();
                        if (closeCallback) {
                            closeCallback();
                        }
                    });
            }
            var margin = $(".topBarContainer").length === 0 ? '0 10px 10px 0' : '22px 10px 10px 0'; // if we have a topBarContainer - push the content 22 pixels down
            var overlayMenuCss = {
                'height': '100%',
                'width': '100%',
                'position': 'absolute',
                'margin': margin,
                'overflow': 'hidden',
                'z-index': 5
            };
            var $overlayMenu = $('<div />')
                .addClass('overlay-win ui-state-default ui-widget-header ui-corner-all')
                .css(overlayMenuCss)
                .append(
                    $closeButton,
                    $('<div />')
                        .addClass('overlay-content')
                        .append(overlayContent)
                );


            // Append the overlay menu to the player interface
            $overlayContainer.find(".overlay").append(
                $overlayMenu
            )
                .find('.overlay-win')
                .fadeIn("slow");

            // Trigger menu overlay display
            $(embedPlayer).trigger('displayMenuOverlay');

            return false; // onclick action return false
        },

        /**
         * Close an alert
         */
        closeAlert: function (keepOverlay) {
            var embedPlayer = this.embedPlayer;
            var $alert = embedPlayer.getInterface().find('.alert-container');

            mw.log('mw.PlayerLayoutBuilder::closeAlert');
            if (!keepOverlay || ( mw.isIpad() && this.inFullScreen )) {
                this.closeMenuOverlay();
                // not sure why this was here, breaks playback on iPad :(
                /*if ( mw.isIpad() ) {
                 embedPlayer.disablePlayControls();
                 }*/
            }
            $alert.remove();
            return false; // onclick action return false;
        },

        /**
         * Generic function to display custom alert overlay on video.
         *
         * @param (Object) Object which includes:
         *   title Alert Title
         *   body Alert body
         *   buttonSet[label,callback] Array of buttons
         *   style CSS object
         */
        displayAlert: function (alertObj) {
            var _this = this;
            var embedPlayer = this.embedPlayer;
            var callback;
            mw.log('PlayerLayoutBuilder::displayAlert:: ' + alertObj.title);
            // Check if callback is external or internal (Internal by default)

            // Check if overlay window is already present:
            if (embedPlayer.getInterface().find('.overlay-win').length != 0) {
                return;
            }
            // remove error message from kalturaIframeClass.php
            try {
                embedPlayer.getInterface().parent().find('#error').remove();
            } catch (e) {
            }

            if (typeof alertObj.callbackFunction == 'string') {
                if (alertObj.isExternal) {
                    try {
                        callback = window.parent[alertObj.callbackFunction];
                    } catch (e) {
                        // could not call parent method
                    }
                } else {
                    callback = window[alertObj.callbackFunction];
                }
            } else if (typeof alertObj.callbackFunction == 'function') {
                // Make life easier for internal usage of the listener mapping by supporting
                // passing a callback by function ref
                callback = alertObj.callbackFunction;
            } else {
                // don't throw an error; display alert callback is optional
                // mw.log( "PlayerLayoutBuilder :: displayAlert :: Error: bad callback type" );
                callback = function () {
                };
            }

            var $container = $('<div />').addClass('alert-container');
            var $title = $('<div />').text(alertObj.title).addClass('alert-title alert-text');
            var $buttonsContainer = $('<div />').addClass('alert-buttons-container');
            var $message = $('<div />').html(alertObj.message).addClass('alert-message alert-text');
            if (alertObj.isError) {
                $message.addClass('error');
            }

            if (alertObj.props) {

                if (alertObj.props.customAlertContainerCssClass) {
                    $container.removeClass('alert-container');
                    $container.addClass(alertObj.props.customAlertContainerCssClass);
                }

                if (alertObj.props.customAlertTitleCssClass) {
                    $title.removeClass('alert-text alert-title');
                    $title.addClass(alertObj.props.customAlertTitleCssClass);
                }
                if (alertObj.props.titleTextColor) {
                    $title.removeClass('alert-text');
                    $title.css('color', mw.getHexColor(alertObj.props.titleTextColor));
                }

                if (alertObj.props.customAlertMessageCssClass) {
                    $message.removeClass('alert-text alert-message');
                    $message.addClass(alertObj.props.customAlertMessageCssClass);
                }
                if (alertObj.props.textColor) {
                    $message.removeClass('alert-text');
                    $message.css('color', mw.getHexColor(alertObj.props.textColor));
                }

                if (alertObj.props.buttonRowSpacing) {
                    $buttonsContainer.css('margin-top', alertObj.props.buttonRowSpacing);
                }
            }

            var $buttonSet = alertObj.buttons || [];

            // If no button was passed display just OK button
            var buttonsNum = $buttonSet.length;
            if (buttonsNum == 0 && !alertObj.noButtons) {
                $buttonSet = ["OK"];
                buttonsNum++;
            }

            if (buttonsNum > 0) {
                $container.addClass('alert-container-with-buttons');
            }

            $.each($buttonSet, function (i) {
                var label = this.toString();
                var $currentButton = $('<button />')
                    .addClass('alert-button')
                    .text(label)
                    .width(Math.floor(100 / buttonsNum) + "%")
                    .click(function (eventObject) {
                        callback(eventObject);
                        _this.closeAlert(alertObj.keepOverlay);
                    });

                if (alertObj.props) {
                    if (alertObj.props.buttonHeight) {
                        $currentButton.css('height', alertObj.props.buttonHeight);
                    }
                    // Apply buttons spacing only when more than one is present
                    if (buttonsNum > 1) {
                        if (i < buttonsNum - 1) {
                            if (alertObj.props.buttonSpacing) {
                                $currentButton.css('margin-right', alertObj.props.buttonSpacing);
                            }
                        }
                    }
                }
                $buttonsContainer.append($currentButton);
            });
            $container.append($title, $message, $buttonsContainer);
            return this.displayMenuOverlay($container, false, true);
        },

        /**
         * Get component jQuery element
         *
         * @param {String} componentId Component key to grab html output
         */
        getDomComponent: function (componentId) {
            if (this.components[componentId]) {
                return this.components[componentId].o(this);
            } else {
                return false;
            }
        },

        /**
         * Components Object
         * Take in the embedPlayer and return some html for the given component.
         *
         * components can be overwritten by skin javascript
         *
         * Component JSON structure is as follows:
         * 'o' Function to return a binded jQuery object ( accepts the ctrlObject as a parameter )
         * 'w' The width of the component
         * 'h' The height of the component ( if height is undefined the height of the control bar is used )
         */
        components: {},

        checkAnimationSupport: function (elm) {
            elm = elm || document.body || document.documentElement;
            var animation = false,
                animationstring = 'animation',
                keyframeprefix = '',
                domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),
                pfx = '';

            if (elm.style.animationName !== undefined) {
                animation = true;
            }

            if (animation === false) {
                for (var i = 0; i < domPrefixes.length; i++) {
                    if (elm.style[domPrefixes[i] + 'AnimationName'] !== undefined) {
                        pfx = domPrefixes[i];
                        animationstring = pfx + 'Animation';
                        keyframeprefix = '-' + pfx.toLowerCase() + '-';
                        animation = true;
                        break;
                    }
                }
            }

            return animation;
        }
    };

})(window.mediaWiki, window.jQuery);