(function( mw, $ ) {"use strict";

mw.Layout = {
	// Components constructors
	Components: {},
	init: function( components, options ) {
		this.components = components;
		this.options = options;
		return this;
	},
	getComponent: function( component ) {
		if( this.Components[component.type] ) 
			return new this.Components[component.type]( component ).get();

		return false;
	},
	addComponent: function( $component, $container, insertMode ) {
		switch( insertMode ) {
			case 'firstChild': 
				$container.prepend( $component );
				break;
			case 'lastChild':
				$container.append( $component );
				break;
			case 'before':
				$container.before( $component );
				break;
			case 'after':
				$container.after( $component );
				break;				
		}
	},
	draw: function() {
		var _this = this;
		var totalComponents = this.components.length;
		var addedComponents = 0;
		var lastRunAddedComponents = 0;
		var firstRun = true;
		var i = 0;
		var $parentContainer = this.options.container;

		while( totalComponents > 0 && addedComponents < totalComponents 
			&& ( lastRunAddedComponents > 0 || firstRun ) ) {

			firstRun = false;
			lastRunAddedComponents = 0;
			var addedItems = [];

			// Go over components
			for( i=0; i<this.components.length; i++) { (function( idx, component ) {

				// Set default DOM container and position
				if( ! component.relativeTo ) {
					component.relativeTo = 'VideoHolder';
				}
				if( ! component.position ) {
					component.position = 'lastChild';
				}
				
				var $container = $parentContainer.find('#' + component.relativeTo );
				// Check if we found a container
				if( ! $container.length ) {
					console.log('Container: #' + component.relativeTo + ' not found');
					return true;
				}

				// Get component DOM element
				var $component = _this.getComponent(component);

				// Add component to DOM if we got a component
				if( $component ) {
					_this.addComponent( $component, $container, component.position );
					addedItems.push(idx);
					lastRunAddedComponents++;
				}
			}) ( i, this.components[i] ); }

			// Delete components that were added
			for( i=0; i < addedItems.length; i++ ) { (function(itemIdx) {
				_this.components.splice(itemIdx, 1);
			}) (addedItems[i]); }

			addedComponents += lastRunAddedComponents;
		}
	}
};

})( window.mw, window.jQuery );