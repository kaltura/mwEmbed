

mw.SmilLayout = function( $layout ){
	return this.init( $layout );
}

mw.SmilLayout.prototype = {
	// Stores the number of assets we are currently loading		
	mediaLoadingCount : 0,
	
	// Stores the callback function for once assets are loaded
	mediaLoadedCallback : null,
	
	//Stores the current top z-index for "putting things on top" 
	topZindex: 1,
	
	// Constructor: 
	init: function( smilObject ){	
		// Setup a pointer to parent smil Object
		this.smil = smilObject;
		
		// Set the smil layout dom: 
		this.$dom = this.smil.getDom().find( 'layout' );
		
		// Reset the htmlDOM cache
		this.$rootLayout = null;
	},	
	
	/**
	* Get Html DOM
	*/
	getHtml: function(){
		var _this = this;		
				
		// Setup target Size: 
		this.targetWidth = this.smil.embedPlayer.getWidth();
		this.targetHeight = this.smil.embedPlayer.getHeight();		
		
		mw.log("SmilLayout:: getHtml:: " + this.targetWidth  );
										
		return this.getRootLayout();
	},
	
	/*
	* Get layout
	*/
	getRootLayout: function(){
		var _this = this;
		mw.log( "SmilLayout::getRootLayout:" );  
		if( !this.$rootLayout ){
			this.$rootLayout = $j('<div />' )
				.attr( 'id', _this.smil.embedPlayer.id + '_smil-root-layout' )
				.addClass( 'smilRootLayout' ) 
				.css( {
					'position': 'absolute',
					'width' : '100%',
					'height' : '100%',
					'overflow': 'hidden'
				});
				
			// Update the root layout css 
			this.$rootLayout.css( _this.getRootLayoutCss() );
			
			// Update the root layout html
			this.$rootLayout.html( _this.getRootLayoutHtml() );
		}
		return this.$rootLayout;	
	},
	
	/**
	 * Get and increment the top zindex counter: 
	 */
	getTopZIndex: function(){
		return this.topZindex++;	
	},
	
	/**
	* Draw a smilElement to the layout. 
	*  
	* If the element does not exist in the html dom add it.	
	*/ 
	drawElement: function( smilElement ) {
		var _this = this;		
		// Check for quick "show" path:
		var $targetElement = this.$rootLayout.find( '#' + this.smil.getAssetId( smilElement ) ) 
		if( $targetElement.length ){
			$targetElement.show();
			return ;
		}
		
		// Else draw the node into the regionTarget 
							
		//mw.log( "SmilLayout::drawElement: " + nodeName + '.' + $j( smilElement ).attr('id' ) + ' into ' + regionId );
		var $regionTarget = this.getRegionTarget( smilElement );
		
		// Make sure we have a $regionTarget
		if( !$regionTarget ){
			return ;
		}
		
		// Check that the element is already in the dom
		var $targetElement =  $regionTarget.find( '#' + this.smil.getAssetId( smilElement ) );
		if( $targetElement.length == 0 ){
			mw.log(" drawElement:: " + this.smil.getAssetId( smilElement ) );				
			// Append the Smil to the target region
			$regionTarget.append( 
				_this.getSmilElementHtml( smilElement )
			)
		} else {
			// Make sure the element is visible ( may be faster to just call show directly)  
			if( $targetElement.is(':hidden') ) {
				$targetElement.show();
			}
		}
	},
	
	/**
	 * Get a region target for a given smilElement 
	 */
	getRegionTarget: function( smilElement ){
		var regionId =  $j( smilElement ).attr( 'region');
		if( regionId ){
			var $regionTarget =  this.$rootLayout.find( '#' + regionId );		
			// Check for region target in $rootLayout
			if( $regionTarget.length == 0 ) {
				mw.log( "Error in SmilLayout::renderElement, Could not find region:" + regionId );
				return false;
			}
		} else {
			// No region provided use the rootLayout: 
			$regionTarget = this.$rootLayout;
		}
		return $regionTarget;
	},
	
	/**
	* Hide a smilElement in the layout
	*/	
	hideElement: function( smilElement ){
		// Check that the element is already in the dom
		var $targetElement = this.$rootLayout.find( '#' + this.smil.getAssetId( smilElement ) );
		if( $targetElement.length ){
			// Issue a quick hide request
			$targetElement.hide();
		}
	},
	
	/**
	 * Get the transformed smil element in html format
	 * @param 
	 */
	getSmilElementHtml: function( smilElement ) {	
		var smilType = this.smil.getRefType( smilElement )				
		switch( smilType ){
			// Not part of strict smil, but saves time being able have an "html" display mode
			case 'cdata_html': 
				return this.getSmilCDATAHtml( smilElement );
			break;
			case 'video': 
				return this.getSmilVideoHtml( smilElement );
			break;
			// Smil Text: http://www.w3.org/TR/SMIL/smil-text.html ( obviously we support a subset )
			case 'smiltext':
				return this.getSmilTextHtml( smilElement );
			break;
			case 'img': 
				return this.getSmilImgHtml( smilElement );
			break;			
		}
		mw.log( "Error: Could not find smil layout transform for element type: " +
				smilType + ' of type ' + $j( smilElement ).attr( 'type' ) );
				
		return $j('<span />')
				.attr( 'id' , this.smil.getAssetId( smilElement ) )
				.css( {
					'position' : 'absolute',
					'zindex' : 9999 // xxx need to clean up z-index system
				})
				.text( 'Error: unknown type:' + smilType );
	},	
	
	/**
	* Return the video
	*/
	getSmilVideoHtml: function( videoElement ){
		return $j('<video />')
			.attr( {
				'id' : this.smil.getAssetId( videoElement ), 
				'src' : this.smil.getAssetUrl( $j( videoElement ).attr( 'src' ) )
			} )
			.addClass( 'smilFillWindow' )
	},
	
	/**
	 * Get Smil CDATA ( passed through jQuery .clean as part of fragment creation )
	 * XXX Security XXX 
	 * Here we are parsing in SMIL -> HTML should be careful about XSS or script elevation 
	 *
	 * @@TODO check all sources are "local" only smil and enforce domain on all asset sources
	 */
	getSmilCDATAHtml: function( smilElement ){
		// Get "clean" smil data
		var el = $j( smilElement ).get(0);	
		var xmlCdata = '';
		for ( var i=0; i < el.childNodes.length; i++ ) {	
			var node = el.childNodes[i];
			// Check for text cdata Node type: 
			if( node.nodeType == 4 ) {					
				xmlCdata += node.nodeValue;
			}
		}
		
		var textCss = this.transformSmilCss( smilElement );		
		
		// Return the cdata		
		return $j('<div />')
			.attr( 'id' , this.smil.getAssetId( smilElement ) )
			// Wrap in font-size percentage relative to virtual size
			.css( 'font-size',  ( ( this.targetWidth / this.virtualWidth )*100 ) + '%' )
			.append(
				// We pass the xmlCdata via jQuery fragment creation, this runs jquery.clean()  
				// and filters the result html. 				
				$j( xmlCdata )
				.css( textCss )
			);
			
	},
	
	/**
	 * Get a text element html	 
	 */
	getSmilTextHtml: function( textElement ) {
		var _this = this;			
				
		// Empty initial text value				
		var textValue = '';
		
		// If the textElement has no child node directly set the text value 
		// 	( if has child nodes, text will be selected by time in SmilAnimate.transformTextForTime ) 
		if( $j( textElement ).children().length == 0 ){
			mw.log( 'Direct text value to: ' + textValue);
			textValue = $j( textElement ).text();				
		}
		
		var textCss = _this.transformSmilCss( textElement );			

		// Return the htmlElement 
		return $j('<span />')
			.attr( 'id' , this.smil.getAssetId( textElement ) )
			// Wrap in font-size percentage relative to virtual size
			.css( 'font-size',  ( ( this.targetWidth / this.virtualWidth )*100 ) + '%' )
			.html(  
				$j('<span />')
				// Transform smil css into html css: 
				.css( textCss	)
				// Add the text value
				.text( textValue )			
			);
	},
	
	/**
	 * Get Image html per given smil element and requested time 
	 * @param {element} imgElement The image tag element to be updated
	 */
	getSmilImgHtml: function( imgElement ) {
		// Check if we have child transforms and select the transform that is in range		
		var panZoom = null;		
		mw.log( "Add image:" + this.smil.getAssetUrl( $j( imgElement ).attr( 'src' ) ) );
		// XXX get context of smil document for relative or absolute paths: 
		return $j('<img />')
				.attr( {
					'id' : this.smil.getAssetId( imgElement ), 
					'src' : this.smil.getAssetUrl( $j( imgElement ).attr( 'src' ) )
				} )
				.addClass( 'smilFillWindow' )
	},
	
	/**
	 * Parse pan zoom attribute string 
	 * @param panZoomString
	 */
	parsePanZoom: function( panZoomString ){
		var pz = panZoomString.split(',');
		if( pz.length != 4){
			mw.log("Error Could not parse panZoom Attribute: "  + panZoomString);
			return {};
		}
		return {
			'left' : pz[0],
			'top' : pz[1],
			'width' : pz[2],
			'height': pz[3]			            
		}
	},
	
	/**
	* Add all the regions to the root layout 
	*/
	getRootLayoutHtml: function(){
		var _this = this;
		var $layoutContainer = $j( '<div />' );
		this.$dom.find( 'region' ).each( function( inx, regionElement ) {			
			$layoutContainer.append( 
				$j( '<div />' )
				.addClass('smilRegion' )				
				.css({ 
					'position' : 'absolute'
				})
				// Transform the smil attributes into html attributes
				.attr( _this.transformSmilAttributes( regionElement ) )
				// Transform the css attributes into percentages
				.css( 
					_this.transformVirtualPixleToPercent(
						_this.transformSmilCss( regionElement )
					) 
				)
			);							
		});		
		return $layoutContainer.children();
	},
	
	/**
	* Get the root layout object with updated html properties 
	*/	
	getRootLayoutCss: function( ){
			
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
			return rootLayoutCss;			
		}		
		return {};
	},

	
	/**
	* Translate a root layout pixel point into a percent location
	* using all percentages instead of pixels lets us scale internal 
	* layout browser side transforms ( instead of a lot javascript css updates )
	* 
	* @param {object} layout Css layout to be translated from virtualWidth & virtualHeight
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
		// XXX TODO Locally scope all ids into embedPlayer.id + _id 
		
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
			'left' : 'left',
			
			'textColor' : 'color',
			'textFontSize' : 'font-size',
			'textFontStyle' : 'font-style'			
		}		 
		
		var cssAttributes = {};
		for(var i =0; i < $smilElement[0].attributes.length; i++ ){
			var attr = $smilElement[0].attributes[i];			
			if( smilAttributeToCss[ attr.nodeName ] ){
				cssAttributes[ smilAttributeToCss[ attr.nodeName ]] = attr.nodeValue;	
			}
		}		
		
		// Make the font size fixed so it can be scaled
		// based on: http://style.cleverchimp.com/font_size_intervals/altintervals.html
		var sizeMap = {
			'xx-small' : '.57em',				
			'x-small' : '.69em',
			'small' : '.83em', 
			'medium' : '1em',
			'large' : '1.2em',
			'x-large' : '1.43em',
			'xx-large' : '1.72em'
		}				
		if( sizeMap[ cssAttributes['font-size'] ] ){
			cssAttributes['font-size'] = sizeMap[ cssAttributes['font-size'] ];
		}
		
		// If the font size is pixel based parent span will have no effect, 
		// directly resize the pixels
		if( cssAttributes['font-size'] && cssAttributes['font-size'].indexOf('px') != -1 ){
			cssAttributes['font-size'] = ( parseFloat( cssAttributes['font-size'] ) 
				* ( this.targetWidth / this.virtualWidth ) ) + 'px';
		}
		
		
		// Translate rootLayout properties into div 
		return cssAttributes;
	}
}