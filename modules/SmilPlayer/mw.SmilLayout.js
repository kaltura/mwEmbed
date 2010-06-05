


mw.SmilLayout = function( $layout ){
	return this.init( $layout );
}

mw.SmilLayout.prototype = {
	init: function( $layout ){
		this.$dom = $layout;		
	},
	
	getHtmlDOM: function( size ){
		mw.log("SmilLayout:: getHtmlDOM:: " ); 
		this.targetWidth = size.width;
		this.targetHeight = size.height;
		
		//Setup the root layout
		$rootLayout = this.getRootLayout();
		
		// Add all the other layout items to the root
		this.appendRegions( $rootLayout );
		
		return $rootLayout
	},
	
	/**
	* Add all the regiions to the root layout 
	*/
	appendRegions: function( $rootLayout ){
		var _this = this;		
		this.$dom.find( 'region' ).each( function( inx, regionElement ) {
					
			$rootLayout.append( 
				$j( '<div />' )
				.attr('rel', 'region')
				.css( 'position', 'absolute')				
				// transofrm the smil attributes into html attributes
				.attr( _this.transformSmilAttributes( regionElement ) )
				// transform the css attributes into percentages
				.css( 
					_this.transformVirtualPixleToPercent(
						_this.transformSmilCss( regionElement )
					) 
				)
			);							
		});		
	},
	
	/**
	* get the root layout object with updated html properties 
	*/	
	getRootLayout: function(){
		var $rootLayout = $j('<div />' )
						.attr('rel', 'root-layout' )
						.css( {
							'position': 'absolute',
							'width' : '100%',
							'height' : '100%'
						});
						
		if( this.$dom.find( 'root-layout').length ) {			
			if( this.$dom.find( 'root-layout').length > 1 ) {
				mw.log( "Error document should only contain one root-layout element" );
				return ;
			} 
			mw.log("getRootLayout:: Found root layout" );

			// Get the root layout in css
			var rootLayoutCss = this.transformSmilCss( this.$dom.find( 'root-layout') );
			
			if( rootLayoutCss['width'] ) {
				this.virtualWidth = rootLayoutCss['width'];
			}
			if( rootLayoutCss['height'] ) {
				this.virtualHeight = rootLayoutCss['height'];
			}
						
			// Merge in transform size to target  
			$j.extend( rootLayoutCss, this.transformSizeToTarget() );
			
			// Update the layout css			
			$rootLayout.css( rootLayoutCss );			
		}
		
		return $rootLayout;
	},
	
	/**
	* Translate a root layout pixel point into a percent location
	* using all percentages instead of pixels lets us scale internal 
	* layout browser side transforms ( instead of a lot javascript css updates )
	* 
	* @param {object} smilLayout css layout to be translated from virtualWidth & virtualHeight
	*/
	transformVirtualPixleToPercent: function( layout ){		
		var percent = { };		
		if( layout['width'] ) {
			percent['width'] =  ( layout['width'] / this.virtualWidth )*100 + '%';
		}
		if( layout['left'] ){
			percent['left'] = ( layout['left'] / this.virtualWidth )*100 + '%'; 
		}		 
		if( layout['height'] ) {
			percent['height'] = ( layout['height'] /  this.virtualHeight )*100 + '%';
		}
		if( layout['top'] ){
			percent['top'] = ( layout['top'] /  this.virtualHeight )*100 + '%'; 
		}		
		return percent;
	},
	
	/**
	* Transform virtual height width into target size
	*/
	transformSizeToTarget: function(){
				
		// Setup target height width based on max window size	
		var fullWidth = this.targetWidth - 2 ;
		var fullHeight =  this.targetHeight ;
		
		// Set target width
		var targetWidth = fullWidth;
		var targetHeight = targetWidth * ( this.virtualHeight / this.virtualWidth  ) 
		
		// Check if it exceeds the height constraint: 
		if( targetHeight >  fullHeight ){		
			targetHeight = fullHeight;				
			targetWidth = targetHeight * ( this.virtualWidth  / this.virtualHeight  );
		}
		
		var offsetTop = ( targetHeight < fullHeight )? ( fullHeight- targetHeight ) / 2 : 0;
		var offsetLeft = ( targetWidth < fullWidth )? ( fullWidth- targetWidth ) / 2 : 0;
				
		//mw.log(" targetWidth: " + targetWidth + ' fullwidth: ' + fullWidth + ' :: ' +  ( fullWidth- targetWidth ) / 2 );
		return {
			'height': targetHeight,
			'width' : targetWidth,
			'top' : offsetTop,
			'left': offsetLeft
		};
		
	},
	/**
	* Transform smil attributes into html attributes 
	*/
	transformSmilAttributes: function ( smilElement ){
		$smilElement = $j( smilElement );
		var smilAttributes = {		
			'xml:id' : 'id',
			'id' : 'id'
		}	
		var attributes = {};
		// Map all the "smil" properties to css
		for( var attr in smilAttributes ){
			if( $smilElement.attr( attr ) ){
				attributes[ smilAttributes[  attr ] ] = $smilElement.attr( attr );
			}
		}
		// Translate rootLayout properties into div 
		return attributes;		
	},
	
	/**
	* Transform smil attributes into css attributes 
	* @param {object} $smilElement The smil element to be transformed 
	*/
	transformSmilCss: function( smilElement ){
		$smilElement = $j( smilElement );
		var smilAttributeToCss = {		
			'backgroundColor' : 'background-color',
			'backgroundOpacity' : 'opacity',
			'z-index' : 'z-index',
			'width' : 'width',
			'height' : 'height', 
			'top' : 'top',
			'right' : 'right',
			'left' : 'left'
		}				
		var cssAttributes = {};
		// Map all the "smil" properties to css
		for( var attr in smilAttributeToCss ){
			if( $smilElement.attr( attr ) ){
				cssAttributes[ smilAttributeToCss[  attr ] ] = $smilElement.attr( attr );
			}
		}
		// Translate rootLayout properties into div 
		return cssAttributes;
	}
}