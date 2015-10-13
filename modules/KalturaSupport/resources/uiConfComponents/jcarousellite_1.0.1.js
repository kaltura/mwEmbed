/*!
 * jCarouselLite - v1.1 - 2014-09-28
 * http://www.gmarwaha.com/jquery/jcarousellite/
 * Copyright (c) 2014 Ganeshji Marwaha
 * Licensed MIT (https://github.com/ganeshmax/jcarousellite/blob/master/LICENSE)
 */

(function($) {                                          // Compliant with jquery.noConflict()
	$.jCarouselLite = {
		version: '1.1'
	};

	$.fn.jCarouselLite = function(options) {

		options = $.extend({}, $.fn.jCarouselLite.options, options || {});

		return this.each(function() {   // Returns the element collection. Chainable.

			var running,
				animCss, sizeCss,
				div = $(this), ul, initialLi, li,
				liSize, ulSize, divSize,
				numVisible, initialItemLength, itemLength, calculatedTo, autoTimeout;

			options.refWindow = $(this).parents('body');
			initVariables();                    // Set the above variables after initial calculations
			initStyles();                       // Set the appropriate styles for the carousel div, ul and li
			initSizes();                        // Set appropriate sizes for the carousel div, ul and li
			attachEventHandlers();              // Attach event handlers for carousel to respond

			function go(to) {
				if(!running) {
					clearTimeout(autoTimeout);  // Prevents multiple clicks while auto-scrolling - edge case
					calculatedTo = to;

					if(options.beforeStart) {   // Call the beforeStart() callback
						options.beforeStart.call(this, visibleItems());
					}

					if(options.circular) {      // If circular, and "to" is going OOB, adjust it
						adjustOobForCircular(to);
					} else {                    // If non-circular and "to" is going OOB, adjust it.
						adjustOobForNonCircular(to);
					}                           // If neither overrides "calculatedTo", we are not in edge cases.

					animateToPosition({         // Animate carousel item to position based on calculated values.
						start: function() {
							running = true;
						},
						done: function() {
							if(options.afterEnd) {
								options.afterEnd.call(this, visibleItems());
							}
							if(options.auto) {
								setupAutoScroll();
							}
							running = false;
						}
					});

					if(!options.circular) {     // Enabling / Disabling buttons is applicable in non-circular mode only.
						disableOrEnableButtons();
					}
				}
				return false;
			}

			function initVariables() {
				running = false;
				animCss = options.vertical ? "top" : "left";
				sizeCss = options.vertical ? "height" : "width";
				ul = div.find(">ul");
				initialLi = ul.find(">li");
				initialItemLength = initialLi.size();

				// To avoid a scenario where number of items is just 1 and visible is 3 for example.
				numVisible = initialItemLength < options.visible ? initialItemLength : options.visible;

				if(options.circular) {
					var $lastItemSet = initialLi.slice(initialItemLength-numVisible).clone();
					var $firstItemSet = initialLi.slice(0,numVisible).clone();

					ul.prepend($lastItemSet)        // Prepend the lis with final items so that the user can click the back button to start with
						.append($firstItemSet);     // Append the lis with first items so that the user can click the next button even after reaching the end

					options.start += numVisible;    // Since we have a few artificial lis in the front, we will have to move the pointer to point to the real first item
				}

				li = $("li", ul);
				itemLength = li.size();
				calculatedTo = options.start;
			}

			function initStyles() {
				div.css("visibility", "visible");   // If the div was set to hidden in CSS, make it visible now

				li.css({
					overflow: "hidden",
					"float": options.vertical ? "none" : "left" // Some minification tools fail if "" is not used
				});

				ul.css({
					margin: "0",
					padding: "0",
					position: "relative",
					"list-style": "none",
					"z-index": "1"
				});

				div.css({
					overflow: "hidden",
					position: "relative",
					"z-index": "2",
					left: "0px"
				});

				// For a non-circular carousel, if the start is 0 and btnPrev is supplied, disable the prev button
				if(!options.circular && options.btnPrev && options.start == 0) {
					$(options.btnPrev).addClass("disabled");
				}
			}

			function initSizes() {

				liSize = options.vertical ?         // Full li size(incl margin)-Used for animation and to set ulSize
					li.outerHeight(true) :
					li.outerWidth(true);
				ulSize = liSize * itemLength;       // size of full ul(total length, not just for the visible items)
				divSize = liSize * numVisible;      // size of entire div(total length for just the visible items)

				// Generally, LI's dimensions should be specified explicitly in a style-sheet
				// But in the case of img (with width and height attr), we can derive LI's dimensions and set here
				// May be applicable for other types of LI children if their dimensions are explicitly specified
				// Individual LI dimensions
				li.css({
					width: li.width(),
					height: li.height()
				});

				// Size of the entire UL. Including hidden and visible elements
				// Will include LI's (width + padding + border + margin) * itemLength - Using outerwidth(true)
				ul.css(sizeCss, ulSize+"px")
					.css(animCss, -(calculatedTo * liSize));

				// Width of the DIV. Only the width of the visible elements
				// Will include LI's (width + padding + border + margin) * numVisible - Using outerwidth(true)
				div.css(sizeCss, divSize+"px");

			}

			function attachEventHandlers() {
				if(options.btnPrev) {
					$(options.btnPrev, options.refWindow).click(function() {
						return go(calculatedTo - options.scroll);
					});
				}

				if(options.btnNext) {
					$(options.btnNext, options.refWindow).click(function() {
						return go(calculatedTo + options.scroll);
					});
				}

				if(options.btnGo) {
					$.each(options.btnGo, function(i, val) {
						$(val).click(function() {
							return go(options.circular ? numVisible + i : i);
						});
					});
				}

				if(options.mouseWheel && div.mousewheel) {
					div.mousewheel(function(e, d) {
						return d > 0 ?
							go(calculatedTo - options.scroll) :
							go(calculatedTo + options.scroll);
					});
				}

				if(options.auto) {
					setupAutoScroll();
				}

				ul.on("refresh", function(e, start){
					options.start = start;
					initVariables();
					disableOrEnableButtons();
					calculatedTo = start;
				})
			}

			function setupAutoScroll() {
				autoTimeout = setTimeout(function() {
					go(calculatedTo + options.scroll);
				}, options.auto);
			}

			function visibleItems() {
				return li.slice(calculatedTo).slice(0,numVisible);
			}

			function adjustOobForCircular(to) {
				var newPosition;

				// If first, then goto last
				if(to <= options.start - numVisible - 1) {
					newPosition = to + initialItemLength + options.scroll;
					ul.css(animCss, -(newPosition * liSize) + "px");
					calculatedTo = newPosition - options.scroll;

					//console.log("Before - Positioned at: " + newPosition + " and Moving to: " + calculatedTo);
				}

				// If last, then goto first
				else if(to >= itemLength - numVisible + 1) {
					newPosition = to - initialItemLength - options.scroll;
					ul.css(animCss, -(newPosition * liSize) + "px");
					calculatedTo = newPosition + options.scroll;

					//console.log("After - Positioned at: " + newPosition + " and Moving to: " + calculatedTo);
				}
			}

			function adjustOobForNonCircular(to) {
				// If user clicks "prev" and tries to go before the first element, reset it to first element.
				if(to < 0) {
					calculatedTo = 0;
				}
				// If "to" is greater than the max index that we can use to show another set of elements
				// it means that we will have to reset "to" to a smallest possible index that can show it

				else if(to > itemLength - numVisible) {
					calculatedTo = itemLength - numVisible;

				}
//				console.log("Item Length: " + itemLength + "; " +
//					"To: " + to + "; " +
//					"CalculatedTo: " + calculatedTo + "; " +
//					"Num Visible: " + numVisible);
			}

			function disableOrEnableButtons() {
				$(options.btnPrev + "," + options.btnNext, options.refWindow).removeClass("disabled");
				if (calculatedTo == 0 && options.btnPrev ){
					$(options.btnPrev, options.refWindow).addClass("disabled");
				}
				if ((calculatedTo + numVisible) >= itemLength && options.btnNext ){
					$(options.btnNext, options.refWindow).addClass("disabled");
				}
				if (calculatedTo+options.scroll > itemLength-numVisible){
					$(options.btnNext, options.refWindow).addClass("disabled");
					div.trigger("complete",{"itemLength": itemLength});
				}
			}

			function animateToPosition(animationOptions) {
				running = true;

				ul.animate(
					animCss == "left" ?
					{ left: -(calculatedTo*liSize) } :
					{ top: -(calculatedTo*liSize) },

					$.extend({
						duration: options.speed,
						easing: options.easing
					}, animationOptions)
				);
			}
			this.jCarouselLiteGo = function( inx ){
				return go( inx );
			};
		});
	};

	$.fn.jCarouselLite.options = {
		btnPrev: null,              // CSS Selector for the previous button
		btnNext: null,              // CSS Selector for the next button
		btnGo: null,                // CSS Selector for the go button
		mouseWheel: false,          // Set "true" if you want the carousel scrolled using mouse wheel
		auto: null,                 // Set to a numeric value (800) in millis. Time period between auto scrolls

		speed: 200,                 // Set to a numeric value in millis. Speed of scroll
		easing: null,               // Set to easing (bounceout) to specify the animation easing

		vertical: false,            // Set to "true" to make the carousel scroll vertically
		circular: true,             // Set to "true" to make it an infinite carousel
		visible: 3,                 // Set to a numeric value to specify the number of visible elements at a time
		start: 0,                   // Set to a numeric value to specify which item to start from
		scroll: 1,                  // Set to a numeric value to specify how many items to scroll for one scroll event

		beforeStart: null,          // Set to a function to receive a callback before every scroll start
		afterEnd: null              // Set to a function to receive a callback after every scroll end
	};

})(jQuery);