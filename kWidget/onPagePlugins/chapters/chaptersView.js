// always disable adaptive for accurate seeks. 
mw.setConfig('Kaltura.UseAppleAdaptive', false);

kWidget.addReadyCallback( function( playerId ){
	var kdp = document.getElementById( playerId );
	/**
	 * The main chaptersView object:
	 */
	var chaptersView = function(kdp, configOverride){
		return this.init(kdp, configOverride);
	};
	chaptersView.prototype = {
		// a flag to skip pausing when pauseAfterChapter is enabled
		skipPauseFlag: false,
		init: function( kdp, configOverride ){
			if( configOverride ){
				this.configOverride = configOverride;
			}
			this.kdp = kdp;
			var _this = this;
			// setup api object
			this.api = new kWidget.api( { 'wid' : this.getAttr( 'configProxy.kw.id' ) } );
			// Use KS from player ( in case admin ks was provided ) 
			if(  this.getAttr('ks') ){
				this.api.setKs( this.getAttr('ks')  )
			}
			// setup the app target:
			this.$chaptersContainer = this.getConfig( 'containerId') ? 
					$('#' + this.getConfig( 'containerId') ) : 
					this.getChapterContainer();

			this.$chaptersContainer.empty().append( 
				$('<div>').css('padding', '10px').text('')
			);
			// add layout helper to container:
			this.$chaptersContainer
				.addClass( 'k-chapters-container' )
				.addClass( 'k-' + _this.getLayout() );
			
			// load cue points
			_this.loadCuePoints(function(){
				// don't draw cuePoints until player is ready 
				_this.checkMediaReady( function(){
					// draw chapters
					_this.drawChapters();
					_this.addBindings();
				});
			});
		},
		addBindings: function(){
			var _this = this;
			var postFix = '.chaptersView_' + this.kdp.id;
			// remove any old bindings:
			$(window).unbind( postFix )
			.bind('resize' + postFix + ' ' + 'orientationchange' + postFix, function(){
				// redraw the chapters
				_this.drawChapters();
			});
			// check for resize or orientation change, and re-draw chapters. 
			// monitor player 
			// add playhead tracker
			kdp.kBind('playerUpdatePlayhead', function( ct ){
				_this.updateActiveChapter( ct );
			});
		},
		checkMediaReady:function( callback ){
			if ( this.isReady ){
				callback();
			} else {
				this.mediaReady = callback;
			}
		},
		updateActiveChapter: function( time ){
			var _this = this;
			// search chapter for current active
			var activeIndex = this.getChapterInxForTime( time );
			$.each( this.getCuePoints(), function( inx, cuePoint){
				if( time > ( cuePoint.startTime / 1000 ) ){
					activeIndex = inx;
				}
			});
			var $activeChapter =  this.$chaptersContainer.find( '.active' );
			// Check if active is not already set: 
			if( $activeChapter.data('index') == activeIndex ){
				// update duration count down:
                var cuePoint = this.getCuePoints()[ activeIndex ];
				if( this.getCuePoints()[ activeIndex ] ){
					var endTime = _this.getChapterEndTimeByInx( activeIndex );
					var countDown =  Math.abs( time - endTime );
					$activeChapter.find('.k-duration span').text(
						kWidget.seconds2npt( countDown )
					);
				}
				// nothing to do, active chapter already set. 
				return ;
			}
			// Check if we should pause on chapter update: 
			if( this.getConfig( 'pauseAfterChapter' ) && !this.skipPauseFlag ){
				this.kdp.sendNotification( 'doPause');
			}
			// restore skip pause flag: 
			this.skipPauseFlag = false;
			
			// remove 'active' from other chapters: 
			this.$chaptersContainer.find( '.chapterBox' ).each(function(inx, chapterBox){
				var cuePoint = _this.getCuePoints()[ inx ];
				var startTime =  cuePoint.startTime / 1000;
				var endTime = _this.getChapterEndTimeByInx( inx );
				$( chapterBox )
				.removeClass( 'active' )
				.find('.k-duration span').text(
					kWidget.seconds2npt( endTime - startTime )	
				)
			});

			if( this.getCuePoints()[ activeIndex ] ){
				this.getCuePoints()[ activeIndex ].$chapterBox.addClass('active');
				this.$chaptersContainer.find('.k-carousel')[0].jCarouselLiteGo( activeIndex );
			}
		},
		getChapterInxForTime: function( time ){
			var activeIndex = null;
			$.each( this.getCuePoints(), function( inx, cuePoint){
				if( time > ( cuePoint.startTime / 1000 ) ){
					activeIndex = inx;
				}
			});
			return activeIndex;
		},
		setCuePoints: function( rawCuePoints ){
			var _this = this;
			this.cuePoints = rawCuePoints;
			// sort the cuePoitns by startTime:
			this.cuePoints.sort( function( a, b){
				return a.startTime - b.startTime;
			});
			// draw cuePoint
			$.each( this.cuePoints, function( inx, cuePoint ){
				// update a local customData property
				_this.cuePoints[inx].customData = {};
				if( cuePoint['partnerData']  && cuePoint['partnerData'] != "null" ){
					_this.cuePoints[inx].customData = JSON.parse( cuePoint['partnerData'] );
				}
			});
		},
		getCuePoints: function(){
			return this.cuePoints;
		},
		loadCuePoints: function( callback ){
			var _this = this;
			// do the api request
			this.api.doRequest({
					'service': 'cuepoint_cuepoint',
					'action': 'list',
					'filter:entryIdEqual': this.getAttr( 'mediaProxy.entry.id' ),
					'filter:objectType':'KalturaCuePointFilter',
					'filter:cuePointTypeEqual':	'annotation.Annotation',
					'filter:tagsLike' : this.getConfig('tags') || 'chaptering'
				},
				function( data ){
					// if an error pop out:
					if( ! _this.handleDataError( data ) ){
						return ;
					}
					_this.setCuePoints( data.objects );
					callback();
				}
			);
		},
		drawChapters: function( rawCuePoints ){
			var _this = this;
			var $ul = $( '<ul>' );
			_this.$chaptersContainer.empty().append( $ul );
			// draw cuePoints
			$.each( this.getCuePoints(), function( inx, cuePoint ){
				cuePoint.$chapterBox = _this.getChaptersBox( inx, cuePoint );
				cuePoint.$chapterBox.appendTo( $ul );
			});
			// only add overflow true
			if( _this.checkAddScroll() ){
				// if chapters  jcarousellite
				_this.addChaptersScroll();
			} else{
				var largetsBoxHeight = 0;
				_this.$chaptersContainer.find('.chapterBox').each( function(inx, box){
					var pad =parseInt( $(box).css('padding-top') ) + parseInt( $(box).css( 'padding-bottom') );
					if( $(box).height() + pad > largetsBoxHeight ){
						largetsBoxHeight = $(box).height() + pad;
					}
				});
				_this.$chaptersContainer.find('.chapterBox').css( 'height', largetsBoxHeight );
				if( this.getLayout() == 'vertical' ){
					// give the box a height: 
					_this.$chaptersContainer.css('height',
						_this.$chaptersContainer.find('.chapterBox').length * largetsBoxHeight
					)
				}
			}
			// once chapters are done trigger event if set:
			this.triggerConfigCallback( 'chaptersRenderDone', [ _this.$chaptersContainer ] );
		},
		checkAddScroll: function(){
			if( ! this.getConfig('overflow') && this.getCuePoints().length ){
				return true;
			}
			// for horizontal layouts fix to parent size fitting in area:
			if( this.getLayout() == 'horizontal' ){
				var totalWidth = this.getChapterBoxWidth()
					* this.getCuePoints().length;
				// Check if width is 100%, add boxes > than width
				if( this.$chaptersContainer.width() <  totalWidth ){
					return true;
				}
			}
			return false;
		},
		getChapterEndTimeByInx: function( inx ){
			return ( this.getCuePoints()[ inx + 1 ] ) ? 
					this.getCuePoints()[ inx + 1 ].startTime / 1000 :
					this.getAttr( 'mediaProxy.entry.duration' );
		},
		getChaptersBox: function( inx, cuePoint ){
			var _this = this;
			// Basic chapter build out:
			var fullDesc = cuePoint.customData['desc'] || '';
			var chapterDesc = fullDesc;
			var chapterTitle = cuePoint['text'];
			
			// get limits:
			var titleLimit = this.getConfig('titleLimit') ? this.getConfig('titleLimit') : 25;
			var descLimit = this.getConfig('descriptionLimit') ? this.getConfig('descriptionLimit') : 70;
			
			// check limits: 
			if( chapterTitle && chapterTitle.length > titleLimit ){
				chapterTitle = chapterTitle.substr(0, titleLimit-4 ) + ' ...';
			}
			if( chapterDesc && chapterDesc.length > descLimit ){
				chapterDesc = chapterDesc.substr(0, descLimit-4 ) + ' ...';
			}
			
			var $chapterInner = $('<div />')
			.addClass('chapterBoxInner')
			.append( 
				$('<span>')
				.addClass('k-title-container')
				.append( 
					$('<span>')
					.attr('title', cuePoint['text'])
					.addClass('k-title')
					.text(
						chapterTitle 
					)
				),
				$('<span>')
				.attr( 'title', fullDesc )
				.addClass('k-description')
				.text( chapterDesc )
			)
			
			if( this.getConfig('includeChapterDuration') ){
				var startTime =  cuePoint.startTime / 1000;
				var endTime = _this.getChapterEndTimeByInx( inx ) 
				$chapterInner.append(
					$('<span>').addClass('k-duration').append(
						$('<div />').addClass('icon-time'),
						$('<span>').text( kWidget.seconds2npt( endTime - startTime ) )
					)
				)
			}
			// check if we should include chapter duration:
			if( this.getConfig('includeChapterStartTime') ){
				// Add 0 padding to start time min
				var st = kWidget.seconds2npt( cuePoint.startTime / 1000 );
				var stParts = st.split(':');
				if( stParts.length == 2 && stParts[0].length == 1 ){
					st = '0' + st;
				}
				var $timeDisp = $('<span>').addClass( 'k-start-time');
				$timeDisp.prepend(
					$('<span>').html( st )
				)
				// Append timeDisp box:
				$chapterInner.find('.k-title-container').prepend(
					$timeDisp
				);
			}
			
			// check if we should have a chapter prefix: 
			if( this.getConfig('includeChapterNumberPattern' ) ){
				var chapterVal = ( inx + 1 );
				if( typeof this.getConfig('includeChapterNumberPattern' ) == 'string' ){
					chapterVal =  this.getConfig('includeChapterNumberPattern' ).replace( '$1', chapterVal );
				}
				// escape any html: 
				chapterVal = $('<span>').text( chapterVal ).text();
				// replace spaces with '&nbsp;'
				chapterVal = chapterVal.replace(/\s/g, '&nbsp;' );
				$capterText = $('<span>').addClass('chapterNumber').html( chapterVal );
				$chapterInner.find('.k-title-container').prepend( 
					$capterText
				)
			}
			
			// check if thumbnail should be displayed
			if( this.getConfig('includeThumbnail') ){
				$chapterInner.prepend( 
					_this.getThumbnail( cuePoint ) 
				)
			}
			// Add to chapter box:
			var $chapterBox = $('<li />')
			.data('index', inx )
			.addClass( 'chapterBox' )
			.attr( 'data-chapter-index', inx )
			.append(
				$chapterInner
			)
			if( this.getLayout() == 'horizontal'){
				$chapterBox.css('width', this.getChapterBoxWidth() );
			}
				
			// Only add the chapter divider ( after the first chapter )
			if( inx != 0 ){
				var $chapterDivider = $('<div />')
					.addClass( 'chapterDivider' )
				// if horizontal set to thumb height
				if( this.getLayout() == 'horizontal' ){
					$chapterDivider.css('height', this.getThumbHeight() );
				}
				$chapterBox.prepend( 
					$chapterDivider
				)
			}

			// Add click binding:
			$chapterBox.click( function(){
				// Check if the media is ready:
				if( _this.getAttr( 'playerStatusProxy.kdpStatus' ) != 'ready' ){
					kWidget.log( "Error: chapterView:: click before chapter ready" );
					return ;
				}
				// Check if the current chapter is already active, set skipPause flag accordingly. 
				_this.skipPauseFlag = !$( this ).hasClass( 'active');
				// start playback 
				_this.kdp.sendNotification( 'doPlay' );
				// see to start time and play ( +.1 to avoid highlight of prev chapter ) 
				_this.kdp.sendNotification( 'doSeek', ( cuePoint.startTime / 1000 ) + .1 );
			});
			
			// check for client side render function, can override or extend chapterBox
			this.triggerConfigCallback( 'chapterRenderer', [ cuePoint, $chapterBox ] );
			
			return $chapterBox;
		},
		getThumbWidth: function(){
			return parseInt( this.getConfig( 'thumbnailWidth' ) ) || 100;
		},
		getThumbHeight: function(){
			var entry = this.getAttr( 'mediaProxy.entry' );
			var nativeAspect =  entry.height / entry.width;
			var thumbWidth = this.getThumbWidth();
			var thumbHeight = parseInt( thumbWidth * nativeAspect );
			return thumbHeight;
		},
		getThumbnail: function( cuePoint ){
			var _this = this;
			var thumbWidth = this.getThumbWidth();
			var thumbHeight = this.getThumbHeight();
			var baseImageCss= {
					'width':thumbWidth,
					'height': thumbHeight,
					'background-repeat': 'no-repeat',
					'background-position': 'center',
					'background-size' : 'auto 100%'
				}
			// Check for custom var override of cuePoint
			var $divImage = $('<div>').addClass('k-thumb').attr({
				'alt': "Thumbnail for " + cuePoint.text
			}).css( baseImageCss );
			
			var baseThumbSettings = {
				'partner_id': this.getAttr( 'configProxy.kw.partnerId' ),
				'uiconf_id': this.getAttr('configProxy.kw.uiConfId'),
				'entry_id': this.getAttr( 'mediaProxy.entry.id' ),
				'width': thumbWidth
			}
			// check for customData:
			var thumbUrl = cuePoint.customData['thumbUrl'] ? 
					cuePoint.customData['thumbUrl'] :
					kWidget.getKalturaThumbUrl(
						$.extend( {}, baseThumbSettings, {
							'vid_sec': parseInt( cuePoint.startTime / 1000 )
						})
					);
			
			// Check if NOT using "rotator" ( just return the target time directly )
			$divImage.addClass('k-thumb')
			.css({
				'background-image': 'url(\'' + thumbUrl + '\')'
			});
			
			// if not using thumbnail rotator we are done:
			if( !this.getConfig( 'thumbnailRotator' ) ){
				return $divImage;
			}
			var imageSlicesUrl = kWidget.getKalturaThumbUrl(
					$.extend( {}, baseThumbSettings, {
						'vid_slices': _this.getSliceCount()
					})
				);
			// preload the image slices: 
			(new Image()).src = imageSlicesUrl;
			
			// set image to sprite image thumb mapping: 
			var hoverInterval = null;
			$divImage
			.hover( function(){
				// update base css: 
				$(this).css({
					'width': thumbWidth, 
					'height': thumbHeight,
					'background-image': 'url(\'' + imageSlicesUrl + '\')',
					'background-position': _this.getThumbSpriteOffset( thumbWidth, ( cuePoint.startTime / 1000 ) ),
					// fix aspect ratio on bad Kaltura API returns
					'background-size': ( thumbWidth * _this.getSliceCount() ) + 'px 100%'
				});
				
				var startTime =  cuePoint.startTime / 1000;
				var endTime = ( _this.getCuePoints()[ cuePoint.$chapterBox.data('index') + 1 ] ) ? 
						_this.getCuePoints()[ cuePoint.$chapterBox.data('index') + 1 ].startTime / 1000 :
						_this.getAttr( 'mediaProxy.entry.duration' );
				// on hover sequence thumbs in range 
				var stepInx = _this.getSliceIndexForTime( startTime );
				var doStepIndex = function(){ 
					// update background-position' per current step index:
					$divImage.css('background-position', - ( stepInx * thumbWidth ) + 'px 0px' );
					stepInx++;
					if( stepInx >= _this.getSliceIndexForTime( endTime ) ){
						stepInx =  _this.getSliceIndexForTime( startTime );
					}
				};
				hoverInterval = setInterval( doStepIndex, 500 );
				doStepIndex();
			}, function(){
				clearInterval( hoverInterval );
				// retore to orginal image: 
				$divImage
				.css( baseImageCss )
				.css({
					'background-image': 'url(\'' + thumbUrl + '\')'
				});
			});
				
			return $divImage;
		},
		/**
		 * TODO abstract into kWidget rotator, so we can use the same code in scrubber. 
		 */
		getThumbSpriteOffset: function( thumbWidth, time ){
			var sliceIndex = this.getSliceIndexForTime( time );
			return - ( sliceIndex * thumbWidth ) + 'px 0px';
		},
		getSliceIndexForTime: function( time ){
			var sliceCount = this.getSliceCount();
			var perc = time / this.getAttr(  'mediaProxy.entry.duration' );
			var sliceIndex = Math.ceil( sliceCount * perc ); 
			return sliceIndex;
		},
		/**
		 * TODO make universal method, so that things like scrubber can use the same sprite slice cache
		 */
		getSliceCount: function(){
			var duration = this.getAttr( 'mediaProxy.entry.duration' );
			if( duration < 61 ){
				return Math.round( duration ); // every second
			}
			if( duration < 250 ){
				return Math.round( duration / 2 ); // every 2 seconds
			}
			// max slice count 125
			return 125;
		},
		// get the chapter container with respective layout
		getChapterContainer: function(){
			// remove any existing k-chapters-container for this player
			$('.k-player-' + this.kdp.id + '.k-chapters-container').remove();
			// Build new chapters container
			$chaptersContainer = $('<div>').addClass( 'k-player-' + this.kdp.id + ' k-chapters-container');
			// check for where it should be appended:
			switch( this.getConfig('containerPosition') ){
				case 'before':
					$chaptersContainer.css('clear', 'both');
					$( this.kdp )
						.css( 'float', 'left')
						.before( $chaptersContainer );
				break;
				case 'left':
					$chaptersContainer.css('float', 'left').insertBefore( this.kdp );
					$( this.kdp ).css('float', 'left');
				break;
				case 'right':
					$chaptersContainer.css('float', 'left').insertAfter( this.kdp );
					$( this.kdp ).css('float', 'left' );
				break;
				case 'after':
				default:
					$( this.kdp )
						.css( 'float', 'none')
						.after( $chaptersContainer );
				break;
			};
			// set size based on layout
			// set sizes:
			if( this.getConfig('overflow') != true ){
				$chaptersContainer.css('width', $( this.kdp ).width() )
				if( this.getLayout() == 'vertical' ){
					$chaptersContainer.css( 'height', $( this.kdp ).height() )
				}
			} else {
				if( this.getLayout() == 'horizontal' ){
					$chaptersContainer.css('width', '100%' );
				} else if( this.getLayout() == 'vertical' ){
					$chaptersContainer.css( 'width', $( this.kdp ).width() );
				}
			}
			// special conditional for vertical chapter width
			if( 
				this.getLayout() == 'vertical'
					&&
				this.getConfig('horizontalChapterBoxWidth')
					&&
				( 
				this.getConfig('containerPosition') == 'right' 
					||
				this.getConfig('containerPosition') == 'left' 
				)
			){
				$chaptersContainer.css('width', this.getConfig('horizontalChapterBoxWidth') );
			}
			return $chaptersContainer;
		},
		getChapterBoxWidth: function(){
			return this.getConfig('horizontalChapterBoxWidth') || 290;
		},
		addChaptersScroll: function(){
			var $cc = this.$chaptersContainer;
			var chaptersVisible = 3;
			
			$cc.find('ul').wrap(
				$( '<div>' ).addClass('k-carousel')
			);
			// Add scroll buttons
			$cc.find('.k-carousel').before(
				$( '<a />' )
				.addClass( "k-scroll k-prev" )
			)
			$cc.find('.k-carousel').after(
				$( '<a />' )
				.addClass( "k-scroll k-next" )
			)
			// Get rough estimates for number of chapter visable.  
			var largestBoxWidth =0;
			var largetsBoxHeight = 0;
			$cc.find('.chapterBox').each( function(inx, box){
				if( $( box ).width() > largestBoxWidth ){
					largestBoxWidth = $( box ).width()
				}
				if( $(box).height() > largetsBoxHeight ){
					largetsBoxHeight = $(box).height() + ( 
						parseInt( $(box).css('padding-top') ) + parseInt( $(box).css( 'padding-bottom') )
					)
				}
			});
			if( this.getLayout() == 'horizontal' ){
				// set container height if horizontal
				$cc.css( 'height', largetsBoxHeight );
				// calculate number of visible chapters
				chaptersVisible = Math.floor( $cc.find( '.k-carousel' ).width() / largestBoxWidth );
			} else {
				// calculate number of visible for vertical chapters
				chaptersVisible = Math.floor( this.$chaptersContainer.height() / largetsBoxHeight );
			}
			// don't show more chapters then we have available: 
			if( chaptersVisible >  this.getCuePoints().length ){
				chaptersVisible = this.getCuePoints().length
			}
			// Add scrolling carousel to clip list ( once dom sizes are up-to-date )
			$cc.find('.k-carousel').jCarouselLite({
				btnNext: '.k-player-' + this.kdp.id +' .k-next',
				btnPrev: '.k-player-' + this.kdp.id +' .k-prev',
				visible: chaptersVisible,
				mouseWheel: true,
				circular: false,
				vertical: ( this.getLayout() == 'vertical' )
			});
			// make sure vertical height matches target:
			if( this.getLayout() == 'vertical' ){
				$cc.find('.k-carousel').css('height', $cc.height() )
			}
			
			// give more height if needed 
			if( this.getLayout() == 'horizontal' ){
				// fit to container:
				$cc.find('.k-carousel').css('width', $cc.width() )
				// set width to horizontalChapterBoxWidth 
				$cc.find('.chapterBox').css( 'width', this.getChapterBoxWidth() );
				//set to auto to discover height:
				$cc.find('.chapterBox').css('height', 'auto');
				var largetsBoxHeight = 0;
				$cc.find('.chapterBox').each( function(inx, box){
					if( $(box).height() > largetsBoxHeight ){
						largetsBoxHeight = $(box).height() + ( 
							parseInt( $(box).css('padding-top') ) + parseInt( $(box).css( 'padding-bottom') )
						)
					}
				});
				$cc.css( 'height', largetsBoxHeight )
				.find( '.chapterBox' ).css( 'height', largetsBoxHeight )
				
				var totalWidth = 0;
				$cc.find('.chapterBox').each( function(inx, box){
					totalWidth+= $(box).width() + parseInt( $(box).css('padding-left') ) +  
					 parseInt( $(box).css('padding-right') )
				});
				$cc.find('ul').css( 'width', totalWidth );
			}
			// sort ul elements:
			$cc.find('.chapterBox').sortElements(function(a, b){
				return $(a).data('index') > $(b).data('index') ? 1 : -1;
			});
			// start at clip zero ( should be default ) 
			$cc.find('.k-carousel')[0].jCarouselLiteGo( 0 );
			
			// Add chapter hover to hide show play buttons:
			var inKBtn = false;
			var inContainer = false;
			var checkHideBtn = function(){
				setTimeout(function(){
					if( !inKBtn && !inContainer ){
						$cc.find('.k-prev,.k-next').animate({'opacity':0});	
					}
				},0)
			}
			var showBtn = function(){
				$cc.find('.k-prev,.k-next').animate({'opacity':1});
			}
			// check for knext 
			$cc.find('.k-prev,.k-next')
			.hover(function(){
				showBtn();
				inKBtn = true;
			},function(){ 
				inKBtn = false;
				checkHideBtn();
			})
			$cc.find('.k-carousel').hover( function(){
				showBtn();
				inContainer = true;
			}, function(){
				inContainer = false;
				checkHideBtn();
			})
			// hide the arrows to start with ( with an animation so users know they are there )
			$cc.find('.k-prev,.k-next').animate({'opacity':0});	
		},
		getLayout: function(){
			return  this.getConfig( 'layout' ) || 'horizontal';
		},
		/**
		 * Almost generic onPage plugin code: 
		 */
		handleDataError: function( data ){
			// check for errors; 
			if( !data || data.code ){
				this.$chaptersContainer.empty().append(
					this.getError( data )
				);
				return false;
			}
			return true;
		},
		getError: function( errorData ){
			var error = {
				'title': "Error",
				'msg': "Unknown error"
			}
			switch( errorData.code ){
				case "SERVICE_FORBIDDEN":
					error.title = "Invalid Kaltura Secret";
					error.msg = "please check player configuration";
					break;
				default:
					if( errorData.message ){
						error.msg = errorData.message
					}
					break;
			}
			return $('<div class="alert alert-error">' +
			  //'<button type="button" class="close" data-dismiss="alert">x</button>' +
			  '<h4>' + error.title + '</h4> ' +
			  error.msg  + 
			'</div>' );
		},
		triggerConfigCallback: function( callbackName, argumentList ){
			if( this.getConfig( callbackName ) ) {
				try{
					if( typeof this.getConfig( callbackName ) == 'function' ){
						this.getConfig( callbackName ).apply(this, argumentList);
					} else { 
						if( window[ this.getConfig( callbackName ) ] ) {
							window[ this.getConfig( callbackName ) ].apply( this, argumentList );
						}
					}
				} catch( e ){
					if( console ){
						console.warn( "Error with config callback: " +  this.getConfig( callbackName )  + ' ' + e);
					}
				}
			}
		},
		normalizeAttrValue: function( attrValue ){
			// normalize flash kdp string values
			switch( attrValue ){
				case "null":
					return null;
				break;
				case "true":
					return true;
				break;
				case "false":
					return false;
				break;
			}
			return attrValue;
		},
		getAttr: function( attr ){
			return this.normalizeAttrValue(
				this.kdp.evaluate( '{' + attr + '}' )
			);
		},
		getConfig : function( attr ){
			if( this.configOverride && typeof this.configOverride[ attr ] !== 'undefind' ){
				return this.configOverride[ attr ];
			}
			return this.normalizeAttrValue(
				this.kdp.evaluate('{chaptersView.' + attr + '}' )
			);
		}
	}
	/*****************************************************************
	 * Application initialization
	 ****************************************************************/
	// We start build out at chaneMedia time, will clear out old chapters 
	// in cases for playlists with entries without chapters.
	var instance;
	kdp.kBind( 'changeMedia', function(){
		instance = new chaptersView( kdp );
	});
	kdp.kBind( 'mediaReady', function(){
		if( instance.mediaReady ){
			instance.mediaReady();
		}
		instance.isReady = true;
	});
});
