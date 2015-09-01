/**
 * Created by galensilvestri on 5/21/14.
 */
/**
 * super simple carousel
 * animation between panes happens with css transitions
 */
function Carousel(element, playerElement ){
	var self = this;
	element = $(element);

	var container = $(">ul", element);
	var panes = $(">ul>li", element);

	var pane_width = 0;
	var pane_count = panes.length;

	var current_pane = 0;

	/**
	 * initial
	 */
	this.init = function() {
		setPaneDimensions();

		$(window).on("load resize orientationchange", function() {
			setPaneDimensions();
		})
	};


	/**
	 * set the pane dimensions and scale the container
	 */
	function setPaneDimensions() {
		pane_width = element.width();
		panes.each(function() {
			$(this).width(pane_width);
		});
		container.width(pane_width*pane_count);
	};


	/**
	 * show pane by index
	 */
	this.showPane = function(index, animate) {
		// between the bounds
		index = Math.max(0, Math.min(index, pane_count-1));
		current_pane = index;

		var offset = -((100/pane_count)*current_pane);
		setContainerOffset(offset, animate);
	};


	function setContainerOffset(percent, animate) {
		container.removeClass("animate");

		if(animate) {
			container.addClass("animate");
		}

		if(Modernizr.csstransforms3d) {
			container.css("transform", "translate3d("+ percent +"%,0,0) scale3d(1,1,1)");
		}
		else if(Modernizr.csstransforms) {
			container.css("transform", "translate("+ percent +"%,0)");
		}
		else {
			var px = ((pane_width*pane_count) / 100) * percent;
			container.css("left", px+"px");
		}
	}

	this.next = function() { return this.showPane(current_pane+1, true); };
	this.prev = function() { return this.showPane(current_pane-1, true); };

	this.handleHammer = function(ev) {
		// disable browser scrolling
		ev.preventDefault();
		switch(ev.type) {
			case 'dragright':
			case 'dragleft':
				// stick to the finger
				var pane_offset = -(100/pane_count)*current_pane;
				var drag_offset = ((100/pane_width)*ev.deltaX) / pane_count;

				// slow down at the first and last pane
				if((current_pane == 0 && ev.direction == "right") ||
					(current_pane == pane_count-1 && ev.direction == "left")) {
					drag_offset *= .4;
				}

				setContainerOffset(drag_offset + pane_offset);
				break;

			case 'swipeleft':
				self.next();
				break;

			case 'swiperight':
				self.prev();
				break;

			case 'release':
				// more then 50% moved, navigate
				if(Math.abs(ev.deltaX) > pane_width/2) {
					if(ev.direction == 'right') {
						self.prev();
					} else {
						self.next();
					}
				}
				else {
					self.showPane(current_pane, true);
				}
				break;
		}
	}
	new Hammer(element[0], { dragLockToAxis: true }).on("release dragleft dragright swipeleft swiperight", this.handleHammer);
}