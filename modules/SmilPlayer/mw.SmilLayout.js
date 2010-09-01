

mw.SmilLayout = function( $layout ){
	return this.init( $layout );
}

mw.SmilLayout.prototype = {
	// Stores the number of assets we are currently loading
	mediaLoadingCount : 0,
	
	// Stores the callback function for once assets are loaded
	mediaLoadedCallback : null,
	
	// Stores the current top z-index for "putting things on top"
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
	 * Setup the layout if not already setup
	 */
	setupLayout: function( $renderTarget ){
		if( ! $renderTarget.find( '.smilRootLayout').length ) {
			$renderTarget.append( this.getRootLayout() );
		}
	},
	
	getTargetAspectRatio:function(){
		return this.smil.embedPlayer.getHeight() / this.smil.embedPlayer.getWidth();
	},
	
	/*
	 * Get layout
	 */
	getRootLayout: function(){
		var _this = this;
		mw.log( "SmilLayout::getRootLayout:" );
		if( !this.$rootLayout ){						
			// Setup target Size:
			this.targetWidth = this.smil.embedPlayer.getWidth();
			this.targetHeight = this.smil.embedPlayer.getHeight();		
			
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
	 * Get and increment the top z-index counter:
	 */
	getTopZIndex: function(){
		return this.topZindex++;	
	},
	
	/**
	 * Draw a smilElement to the layout.
	 * 
	 * If the element does not exist in the html dom add it.
	 * 
	 * @parma {Element} smilElement to be drawn.
	 */ 
	drawElement: function( smilElement ) {
		var _this = this;		
		// Check for quick "show" path:
		var $targetElement = $j( '#' + this.smil.getPageDomId( smilElement ) );
		if( $targetElement.length ){
			$targetElement.show();
			return ;
		}
		
		// Else draw the node into the regionTarget
							
		// mw.log( "SmilLayout::drawElement: " + nodeName + '.' + $j(
		// smilElement ).attr('id' ) + ' into ' + regionId );
		var $regionTarget = this.getRegionTarget( smilElement );
		
		// Make sure we have a $regionTarget
		if( !$regionTarget ){
			return ;
		}
							
		// Append the Smil element to the target region
		_this.addSmilElementHtml($regionTarget, smilElement )			
		mw.log( "addSmilElementHtml Added " + 
				this.smil.getPageDomId( smilElement ) +
				' to target: ' + 
				$j( '#' + this.smil.getPageDomId( smilElement ) ).length );
	},
	
	drawElementThumb: function( $target, $node, relativeTime, callback){
		var _this = this;
		mw.log('SmilLayout::drawElementThumb: ' + $node.attr('id') + ' relative time:' + relativeTime );	
		if( $target.length == 0 ){
			mw.log("Error drawElementThumb to empty target");
			return ;
		}
		// parse the time in case it came in as human input
		relativeTime = this.smil.parseTime( relativeTime );
		
		if( this.smil.getRefType( $node ) == 'video' ){
			this.getVideoCanvasThumb($target,  $node, relativeTime, callback )		
			return ;
		}
		switch ( this.smil.getRefType( $node )  ){		
			case 'img':
				// xxx we should use canvas here but for now just hack it up:		
				var $playerImage = this.getSmilImgHtml( $node );				
				$target.html(
					$j('<img />')
					.attr({
						'src' : this.smil.getAssetUrl( $node.attr( 'src' ) )
					})
				);
				var img = $target.find('img').get(0)
				_this.getNaturalSize( img, function( natrualSize ){
					_this.fitMeetBest( 
						img,
						natrualSize, 
						{
							'width' : $target.width(),
							'height' : $target.height()
						}
					)
				}); 
			break;
			case 'cdata_html':
				// Scale down the html into the target width
				$target.html( 
					this.getSmilCDATAHtml( $node, $target.width() )
				)
			break;
			case 'audio':			
				var titleStr = ( $node.attr('title') )?  $node.attr('title') : gM( 'mwe-sequencer-untitled-audio' )
				// draw an audio icon / title the target
				$target.append(
					$j('<span />')
					.addClass( 'ui-icon ui-icon-volume-on')
					.attr('title', titleStr)
					.css( 'position', 'absolute')
					,
					$j('<span />')
					.attr('title', titleStr)
					.css({
						'position': 'absolute', 
						'left':'16px',
						'font-size' : 'x-small'
					})
					.text( titleStr )
				)
			break;
		}
		if( callback )
			callback();
	},
	
	getVideoCanvasThumb: function($target, $node, relativeTime, callback ){
		var _this = this;
		var naturaSize = {};					
		var drawElement = $j( '#' + this.smil.getPageDomId( $node ) ).get(0);	
		
		var drawFrame = function( drawElement ){
			if( !drawElement ){
				mw.log( 'Error: SmilLayout::getVideoCanvasThumb:Draw element not loaded or defined')
				return ;
			}
			naturaSize.height = drawElement.videoHeight;
			naturaSize.width = drawElement.videoWidth;
	
			// Draw the thumb via canvas grab
			// NOTE canvas scale issue prevents redraw at thumb resolution
			// xxx should revisit thumb size issue:
			try{
				$target.html( $j('<canvas />')				
					.attr({
						height: naturaSize.height,
						width : naturaSize.width
					}).css( {
						height:'100%',
						widht:'100%'
					})
					.addClass("ui-corner-all")
				)
				.find( 'canvas')
					.get(0)	
					.getContext('2d')
					.drawImage( drawElement, 0, 0)				
			} catch (e){
				mw.log("Error:: getVideoCanvasThumb : could not draw canvas image");
			}
			if( callback )
				callback();
		}
		
		// check if relativeTime transform matches current absolute time then
		// render directly:
		var drawTime = ( relativeTime + this.smil.parseTime( $j( $node ).attr('clipBegin') ) );
		if( this.smil.isSameFrameTime( drawElement.currentTime, drawTime ) ) {
			mw.log("getVideoCanvasThumb: Draw time:" + drawTime + " matches video time drawFrame:" +drawElement.currentTime );
			drawFrame( drawElement );
		} else {
			// check if we need to spawn a video copy for the draw request
			mw.log( 'getVideoCanvasThumb: Clone object' );
			// span new draw element
			var $tmpFrameNode = $node.clone();
			$tmpFrameNode.attr('id', $node.attr('id') + '_tmpFrameNode' );				
			this.smil.getBuffer().bufferedSeekRelativeTime( $tmpFrameNode, relativeTime, function(){
				// update the drawElement
				drawElement = $j( '#' + _this.smil.getPageDomId( $tmpFrameNode ) ).get(0);
				drawFrame( drawElement );
				// Remove the temporary node from dom
				$j( drawElement ).remove();
			})			
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
		var $targetElement = this.$rootLayout.find( '#' + this.smil.getPageDomId( smilElement ) );
		if( $targetElement.length ){
			// Issue a quick hide request
			$targetElement.hide();
		}
	},
	
	/**
	 * Add the transformed smil element to the $regionTarget
	 * 
	 * @param
	 */
	addSmilElementHtml: function( $regionTarget, smilElement ) {
		var _this = this;
		var smilType = this.smil.getRefType( smilElement )		
		switch( smilType ){
			// Not part of strict smil, but saves time being able have an "html"
			// display mode
			case 'cdata_html': 
				$regionTarget.append( this.getSmilCDATAHtml( smilElement ) );
				return ;
			break;
			case 'video': 
				$regionTarget.append( this.getSmilVideoHtml( smilElement ) );
				return ;
			break;
			case 'img': 
				$regionTarget.append( this.getSmilImgHtml( smilElement ) );
				// Update the asset layout ( only img supports layout atm )
				_this.doSmilElementLayout( smilElement );
				return ;
			break;
			case 'audio':
				$regionTarget.append( this.getSmilAudioHtml( smilElement ) );
				return ;
			break;
			// Smil Text: http://www.w3.org/TR/SMIL/smil-text.html 
			// We support a subset
			case 'smiltext':
				$regionTarget.append( this.getSmilTextHtml( smilElement ) ) ;
				return ;
			break;					
		}
		
		mw.log( "Error: Could not find smil layout transform for element type: " +
				smilType + ' of type ' + $j( smilElement ).attr( 'type' ) );				
		$regionTarget.append( $j('<span />')
				.attr( 'id' , this.smil.getPageDomId( smilElement ) )				
				.text( 'Error: unknown type:' + smilType )
		)
	},		
	
	/**
	 * Return the video
	 */
	getSmilVideoHtml: function( smilElement ){
		return $j('<video />')
			.attr( {
				'id' : this.smil.getPageDomId( smilElement ), 
				'src' : this.smil.getAssetUrl( $j( smilElement ).attr( 'src' ) )
			} )
			.addClass( 'smilFillWindow' )
	},
	
	/**
	 * Return audio element ( by default audio tracks are hidden )
	 */
	getSmilAudioHtml: function ( smilElement ){
		return $j('<audio />')
		.attr( {
			'id' : this.smil.getPageDomId( smilElement ), 
			'src' : this.smil.getAssetUrl( $j( smilElement ).attr( 'src' ) )
		} )
		.css( 'display', 'none');
	},
	
	/**
	 * Get Smil CDATA ( passed through jQuery .clean as part of fragment
	 * creation ) XXX Security XXX Here we are parsing in SMIL -> HTML should be
	 * careful about XSS or script elevation
	 * 
	 * @@TODO check all sources are "local" only smil and enforce domain on all
	 *        asset sources
	 */
	getSmilCDATAHtml: function( smilElement, targetWidth ){	
		// Default target width if unset:
		if( ! targetWidth )
			targetWidth  = this.targetWidth;
		
		mw.log("getSmilCDATAHtml:" + $j( smilElement ).attr('id') +' :' + targetWidth );
		
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
		
		var textCss = this.transformSmilCss( smilElement , targetWidth);	
		
		// We pass the xmlCdata via jQuery fragment creation, this runs
		// jquery.clean()
		// and filters the result html.
		var $cdataHtml = $j( '<div />' ).append( 
				$j( xmlCdata )
			)

		// See if we need to scale
		var scalePercent = ( targetWidth / this.getVirtualWidth() );
			
		// Links go to a new window and are disable scale down.
		$cdataHtml.find('a').each( function(inx, link ){
			if( scalePercent < 1 ){
				$j(link).attr('href', '#');
			} else {
				$j(link).attr('target', '_new');
			}
		});		
				
		if( scalePercent != 1 ){			
			$cdataHtml.find('img').each( function(inx, image ){
				// make sure each image is loaded before we transform,
				// AND via the magic of closures this updates $cdataHtml output
				// in-place
				$j( image ).load(function(){
					// if the image has an height or width scale by scalePercent
					if ( $j( image ).width() ){
						var imageTargetWidth = scalePercent*  $j( image ).width();
						var imageTargetHeight =  scalePercent*  $j( image ).height()
					} else if( image.naturalWidth ){
						// check natural width?
						imageTargetWidth = scalePercent * image.naturalWidth;
						imageTargetHeight = scalePercent * image.naturalHeight;  
					}
					// scale the image:
					$j( image ).css({
						 'width' : imageTargetWidth,
						 'height' :imageTargetHeight
					})
				});					
			})
		}
		
		// Return the cdata
		return $j('<div />')
			.attr( 'id' , this.smil.getPageDomId( smilElement ) )
			// Wrap in font-size percentage relative to virtual size
			.css( {
				'font-size': ( scalePercent *100 ) + '%' 
			})
			.append(
				$cdataHtml.css( textCss )
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
		// ( if has child nodes, text will be selected by time in
		// SmilAnimate.transformTextForTime )
		if( $j( textElement ).children().length == 0 ){
			mw.log( 'Direct text value to: ' + textValue);
			textValue = $j( textElement ).text();				
		}
		
		var textCss = _this.transformSmilCss( textElement );			

		// Return the htmlElement
		return $j('<span />')
			.attr( 'id' , this.smil.getPageDomId( textElement ) )
			// Wrap in font-size percentage relative to virtual size
			.css( 'font-size',  ( ( this.targetWidth / this.getVirtualWidth() )*100 ) + '%' )
			.html(  
				$j('<span />')
				// Transform smil css into html css:
				.css( textCss	)
				// Add the text value
				.text( textValue )			
			);
	},
	
	/**
	 * Get Image html per given smil element
	 * 
	 * @param {element}
	 *            imgElement The image tag element to be updated
	 */
	getSmilImgHtml: function( smilImg ) {
		var _this = this;
		var $image = $j('<img />')
		.attr( {
			'id' : this.smil.getPageDomId( smilImg ), 
			'src' : this.smil.getAssetUrl( $j( smilImg ).attr( 'src' ) )
		} )
		// default width 100%
		.css('width', '100%')
			
		return $image;	
	},
	doSmilElementLayout: function( smilElement ){
		var _this = this;
		
		var img = $j( '#' + this.smil.getPageDomId( smilElement ) ).get(0);
		_this.getNaturalSize( img, function( naturalSize) {
			_this.doAssetLayout( smilElement , naturalSize);			
		});
	},
	// xxx should really use a callback instead of failing if the media is not
	// loaded
	getNaturalSize: function( img , callback){
		// note this just works for images atm		
		if( !img ){
			mw.log("Error getNaturalSize for null image ");
			callback( false );
		}
		if( img.naturalWidth ){
			callback(  {
				'width' : img.naturalWidth,
				'height' : img.naturalHeight,
			} )
		} else {
			$j( img ).load(function(){
				callback( {
					'width' : this.naturalWidth,
					'height' : this.naturalHeight,
				} )
			});
		}
	},
	/**
	 * Layout an asset
	 */
	doAssetLayout: function( smilElement, naturalSize  ){
		var _this = this;
		// We default smil layout to meetBest
		var fitMode = $j( smilElement).attr('fit');
		if( !fitMode ){
			fitMode = 'meetBest'
		}		
		if( fitMode == 'meetBest' ){
			var targetSize = {
				'width' : this.smil.embedPlayer.getWidth(),
				'height' : this.smil.embedPlayer.getHeight()
			}			
			this.fitMeetBest( 
					$j( '#' + this.smil.getPageDomId( smilElement ) ).get(0), 
					naturalSize, 
					targetSize
				); 
		} else {
			mw.log("Layout mode: " + fitMode + ' not yet supported');
		}
		
		// Check for panZoom attribute ( if animation is set it will override this value ) 
		if( $j( smilElement).attr('panZoom') ){
			_this.panZoomLayout( smilElement );
		}
	},
		
	// http://www.w3.org/TR/SMIL/smil-layout.html#adef-fit
	// xxx should add the other fitting modes
	fitMeetBest: function( element, natrualSize, targetSize ){
		var _this = this;
		
		// xxx Should read smil "imgElement" fill type
		var imageCss = _this.getDominateAspectTransform( natrualSize,  targetSize, 100 );
			
		// update the layout of the element
		$j( element ).css( imageCss );		
	},
	
	getDominateAspectTransform: function(natrualSize, targetSize, transformPercent ){
		var _this = this;
		var transformCss = {}
		if( ! targetSize ){
			targetSize = {
				'width' : this.smil.embedPlayer.getWidth(),
				'height' : this.smil.embedPlayer.getHeight()
			};
		}
		// Fit the image per the provided targetWidth closure
		if( natrualSize.width / natrualSize.height > targetSize.width / targetSize.height ){			
			transformCss.width = transformPercent + '%';
			transformCss.height = ( transformPercent * ( 
					( natrualSize.height  /  natrualSize.width ) /
						_this.getTargetAspectRatio()
					) 
				) + '%';
		}
		
		// Fit vertically
		if(! transformCss.height || natrualSize.width / natrualSize.height < targetSize.width / targetSize.height  ){
			transformCss.height =  transformPercent + '%';
			transformCss.width = ( transformPercent * 
					(  natrualSize.width / natrualSize.height ) / 
					_this.getTargetAspectRatio() 
				) + '%';
		}
		return transformCss;
	},
	
	/**
	 * layout function
	 */
	panZoomLayout: function( smilElement ){
		var _this = this;		
		var panZoom = $j( smilElement).attr('panZoom').split(',');
		var img = $j( '#' + this.smil.getPageDomId( smilElement ) ).get(0);
		
		_this.getNaturalSize( img, function( natrualSize ){
			// Check if the transfrom is needed:
			if( parseInt( panZoom.left ) == 0 
				&& 
				parseInt( panZoom.top ) == 0
				&&
				( parseInt( panZoom.width ) == 100 && panZoom.width.indexOf('%') != -1 )
				&&
				( parseInt( panZoom.height ) == 100 && panZoom.height.indexOf('%') != -1 ) 
			){
				// no transform is needed
				return ;
			}
			// Get percent values			
			var percentValues = _this.smil.getAnimate().getPercentFromPanZoomValues( panZoom, natrualSize );
		
			// Update the layout via the animation engine updateElementLayout method
			_this.smil.getAnimate().updateElementLayout( smilElement, percentValues );
		});
	},
	/**
	 * Parse pan zoom attribute string
	 * 
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
			} else {
				this.virtualWidth = this.smil.getEmbedPlayer().getWidth();
			}
			if( rootLayoutCss['height'] ) {
				this.virtualHeight = rootLayoutCss['height'];
			} else {
				this.virtualHeight = this.smil.getEmbedPlayer().getHeight();	
			}
						
			// Merge in transform size to target
			$j.extend( rootLayoutCss, this.transformSizeToTarget() );
			
			// Update the layout css
			return rootLayoutCss;			
		}		
		return {};
	},
	getVirtualWidth: function(){
		if( !this.virtualWidth ){
			this.virtualWidth = this.smil.getEmbedPlayer().getWidth();
		}
		return this.virtualWidth; 
	},
	getVirtualHeight: function(){
		if( !this.virtualHeight ){
			this.virtualHeight = this.smil.getEmbedPlayer().getHeight();
		}
		return this.virtualHeight;
	},
	
	/**
	 * Translate a root layout pixel point into a percent location using all
	 * percentages instead of pixels lets us scale internal layout browser side
	 * transforms ( instead of a lot javascript css updates )
	 * 
	 * @param {object}
	 *            layout Css layout to be translated from virtualWidth &
	 *            virtualHeight
	 */
	transformVirtualPixleToPercent: function( layout, virtualLayout ){		
		var percent = { };		
		if( !virtualLayout){
			virtualLayout = { 'width' : this.virtualWidth, 'height' : this.virtualHeight };
		}
		if( layout['width'] ) {
			percent['width'] =  ( layout['width'] / virtualLayout.width )*100 + '%';
		}
		if( layout['left'] ){
			percent['left'] = ( layout['left'] / virtualLayout.width )*100 + '%'; 
		}		 
		if( layout['height'] ) {
			percent['height'] = ( layout['height'] /  virtualLayout.height )*100 + '%';
		}
		if( layout['top'] ){
			percent['top'] = ( layout['top'] /  virtualLayout.height )*100 + '%'; 
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
				
		// mw.log(" targetWidth: " + targetWidth + ' fullwidth: ' + fullWidth +
		// ' :: ' + ( fullWidth- targetWidth ) / 2 );
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
	 * 
	 * @param {object}
	 *            $smilElement The smil element to be transformed
	 */
	transformSmilCss: function( smilElement, targetWidth ){
		$smilElement = $j( smilElement );
		
		// Set target with to master targetWidth if unset.
		if( ! targetWidth ){
			targetWidth = this.targetWidth
		}
		
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
		// based on:
		// http://style.cleverchimp.com/font_size_intervals/altintervals.html
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
				* ( targetWidth / this.getVirtualWidth() ) ) + 'px';
		}
		
		
		// Translate rootLayout properties into div
		return cssAttributes;
	}
}