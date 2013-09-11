 ( function( mw, $ ) {"use strict";
    
    mw.KMenu = function( $element, options ) {

    	// Set some defaults
    	var defaults = {
            cssClass: "dropdown-menu",
            tabIndex: 1,
            closeOnFocusOut: true,
            attributes: {
				'role': 'menu',
				'aria-labelledby': 'dLabel'
			},
			dividerClass: 'divider',
        };

        this.bindPostfix = '.kMenu';
        this.$el = $element;
        this.options = $.extend( {}, defaults, options) ;

        this.itemIdx = 0;
        this.init();
        return this;
    }

    mw.KMenu.prototype = {
        init: function(){
            var _this = this;
            // Add CSS class
            if( this.options.cssClass ){
            	this.$el.addClass(this.options.cssClass);
            }
            // Add attributes
            if( $.isPlainObject(this.options.attributes) ){
            	this.$el.attr(this.options.attributes);
            }
            // Add unique id
            this.$el.uniqueId();
        },
        addItem: function( item ){

        	var _this = this;
        	var tabIndex = this.options.tabIndex;  
        	item.idx = this.itemIdx;
            var attrs = item.attributes || {};
            var $item = $('<li />')
						.addClass(item.cssClass)
                        .attr(attrs)
						.append( 
							$('<a />')
							.attr({
								'href': '#', 
								'tabindex': tabIndex + '.' + (this.itemIdx + 1)
							})
							.text( item.label )
							.click(function(e){
								e.preventDefault();
								_this.setActive( item.idx );
								if( $.isFunction( item.callback ) ){
									item.callback();
								}								
								_this.close();
							})
						);
			this.$el.append( $item );
			if( item.divider ){
				this.addDivider();
			}
            if( item.active ){
                $item.addClass('active');
            }
			// Incrase out counter ( for tab index )						
			this.itemIdx++;
        },
        addDivider: function(){
        	this.$el.append( $( '<li />').addClass( this.options.dividerClass ) );
        },
        isOpen: function(){
        	return this.$el.hasClass('open');
        },
        open: function(){
        	var _this = this;
        	this.$el.addClass('open');
        	// Bind to click event and close the menu
            if( this.options.closeOnFocusOut ) {
                setTimeout(function(){
            	$(document).on('click' + _this.bindPostfix + _this.$el.attr('id'), function(){
            		_this.close();
            	});
                },0);
            }
        },
        close: function(){
        	this.$el.removeClass('open');
			if( this.options.closeOnFocusOut ){
        		$(document).off('click' + this.bindPostfix + this.$el.attr('id'));
        	}        	
        },
        toggle: function(){
        	if( this.isOpen() ){
        		this.close();
        	} else {
        		this.open();
        	}
        },
        disable: function(){
            this.$el.addClass('disabled');
        },
        setActive: function( idx ){
            // Clear all other items
            this.clearActive();
            // Set active
            var selector = null;
            if( typeof idx == 'number' ){
                selector = 'li:not(.' + this.options.dividerClass + '):eq(' + idx + ')';
            } else {
                selector = 'li[' + idx.key + '=' + idx.val + ']';
            }
            this.$el.find( selector ).addClass( 'active' );
        },
        clearActive: function(){
        	this.$el.find('li').removeClass('active');
        },
        destroy: function(){
            this.$el.empty();
            this.itemIdx = 0;
        }
    };

} )( window.mw, window.jQuery );