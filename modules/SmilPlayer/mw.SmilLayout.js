

mw.SmilLayout = function( $layout ){
	return this.init( $layout );
}

mw.SmilLayout.prototype = {
	// Stores the number of assets we are currently loading		
	mediaLoadingCount : 0,
	
	// Stores the callback function for once assets are loaded
	mediaLoadedCallback : null,
	
	// Constructor: 
	init: function( smilObject ){	
		// Setup a pointer to parent smil Object
		this.smil = smilObject;
		
		// Set the smil layout dom: 
		this.$dom = this.smil.getDom().find( 'layout' );
		
		// Reset the htmlDOM cache
		this.$rootLayout = null;
	},	
		
	getHtmlDOM: function( size , time, callback ){
		var _this = this;
		mw.log("SmilLayout:: getHtmlDOM:: " + size.width + ' time: ' + time ); 
		// Setup target Size: 
		this.targetWidth = size.width;
		this.targetHeight = size.height;
		
		if( !time ) {
			time = 0;
		}
		
		// Get the root layout HTML and  append the html regions
		this
			.getRootLayoutHtml()
			.appendHtmlRegions()

		// Get all the draw elements from the body this time: 
		var drawElements = this.smil.getBody().getElementForTime( time );
		
		mw.log(" got " + drawElements.length + " drawElements" );
		
		
		// Reset the media loaded flag
		if( _this.mediaLoadingCount != 0 ) {
			mw.log( "Error: media still loading, possible stacking seeking requests?" );
			_this.mediaLoadingCount = 0;
		}
		
		// Set the media loaded callback
		if( callback ) {
			_this.mediaLoadedCallback = callback;
		}
		
		// Draw layout
		$j.each( drawElements , function(inx, smilElement ) {
			_this.drawElement( smilElement, time );
		} )		
		
				
		return this.$rootLayout;
	},
		
	// Draw the element 
	drawElement: function( smilElement, time ) {		
		var _this = this;
		var regionId =  $j( smilElement ).attr( 'region');
		var nodeName = $j( smilElement ).get(0).nodeName ;		
		mw.log("Draw: " + nodeName + ' into ' + regionId );
		// Check for region target in $rootLayout
		if( this.$rootLayout.find( '#' + regionId ).length == 0 ) {
			mw.log( "Error Could not find region:" + regionId + " for " + nodeName);
			return ;
		}
		
		// Append the transformed Smil to its target region
		this.$rootLayout.find( '#' + regionId ).append(
			this.getSmilElementHtml( smilElement, time)
		)	
	},
	
	/**
	 * Get the transformed smil element in html format
	 */
	getSmilElementHtml: function ( smilElement, time ) {
		var nodeName = $j( smilElement ).get(0).nodeName ;
		mw.log("Get Smil Element Html: " + nodeName );
		switch( nodeName.toLowerCase() ){
			case 'smiltext':
				return this.getSmilTextHtml( smilElement, time);
			break;
			case 'img': 
				return this.getSmilImgHtml( smilElement, time);
			break;			
		}	
		mw.log( "Error: Could not find smil layout transform for element type: " + nodeName );
		return $j('<span />')
					.text( 'Error: unkown type:' + nodeName );
	},
	
	/**
	 * Get a text element per given time
	 * xxx we need to use "relativeTime" 
	 */
	getSmilTextHtml: function( textElement, relativeTime ) {
		var _this = this;
		mw.log( " Get TEXT Html ");	
				
		// Empty initial text value
		var textValue = '';		
		
		// Check if we have child transforms and select the transform that is in range
		if( $j( textElement ).children().length ){
			var bucketText = '';
			var textBuckets = [];
			var clearInx = 0;
			var el = $j( textElement ).get(0);
			for ( var i=0; i < el.childNodes.length; i++ ) {	
				var node = el.childNodes[i];
				// Check for text Node type: 
				if( node.nodeType == 3 ) {					
					bucketText += node.nodeValue;
				} else if( node.nodeName == 'clear'){
					var clearTime = mw.SmilParseTime(  $j( node ).attr( 'begin') );
					// append bucket
					textBuckets.push( {
						'text' : bucketText,
						'clearTime' : clearTime 
					} );
				}
			}			
			// Get the text node in range given time:
			for( var i =0; i < textBuckets.length ; i++){
				var bucket = textBuckets[i];
				if( relativeTime < bucket.clearTime ){
					textValue = bucket.text;
					break;
				}
			}			
		} else {
			textValue = $j( textElement ).text();
			mw.log( 'Direct text value to: ' + textValue);
		}		
		
		var textCss = _this.transformSmilCss( textElement );
		
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
		if( sizeMap[ textCss['font-size'] ] ){
			textCss['font-size'] = sizeMap[ textCss['font-size'] ];
		}
		
		// If the font size is pixel based parent span will have no effect, 
		// directly resize the pixels
		if( textCss['font-size'] && textCss['font-size'].indexOf('px') != -1 ){
			textCss['font-size'] = ( parseFloat( textCss['font-size'] ) 
				* ( this.targetWidth / this.virtualWidth ) ) + 'px';
		}

		// Return the htmlElement 
		return $j('<span />')
			// Wrap in font-size percentage relative to virtual size
			.css( 'font-size',  ( ( this.targetWidth / this.virtualWidth )*100 ) + '%' )
			.append(  
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
	getSmilImgHtml: function( imgElement, relativeTime ) {
		// Check if we have child transforms and select the transform that is in range		
		var panZoom = null;
		if( $j( imgElement ).children().length ){
			$j( imgElement ).children().each(function(inx, childNode ){
				if( childNode.nodeName == 'animate' ){
					// add begin / duration to animation bucket ( computed value )					
					
					// get panZoom value									
				}
			})
			// calculate animation position 
		} else {
			// Set pan zoom from imgElement ( if set )
			if( $j( imgElement ).attr('panZoom') ){
				panZoom = this.parsePanZoom( $j( imgElement ).attr('panZoom') );
			}			
		}
		mw.log( "Add image:" + this.smil.getAssetUrl( $j( imgElement ).attr( 'src' ) ) );
		// XXX get context of smil document for relative or absolute paths: 
		return $j('<img />')
				.attr( {
					'src' : this.smil.getAssetUrl( $j( imgElement ).attr( 'src' ) )
				} )
				.css( {
					'width': '100%',
					'height' : '100%'
				})
	},
	
	/**
	 *  Parse pan zoom attribute string 
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
	appendHtmlRegions: function(){
		var _this = this;		
		this.$dom.find( 'region' ).each( function( inx, regionElement ) {			
			_this.$rootLayout.append( 
				$j( '<div />' )
				.attr('rel', 'region' )
				.css( 'position', 'absolute' )
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
		return this;
	},
	
	/**
	* Get the root layout object with updated html properties 
	*/	
	getRootLayoutHtml: function(){
		// Set the in
		this.$rootLayout = $j('<div />' )
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
			this.$rootLayout.css( rootLayoutCss );			
		}
		
		return this;
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
		// Translate rootLayout properties into div 
		return cssAttributes;
	}
}