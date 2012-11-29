kWidget.addReadyCallback( function( playerId ){
	var kdp = document.getElementById( playerId );
	/**
	 * The main chaptersView object:
	 */
	var chaptersView = function(kdp){
		return this.init(kdp);
	}
	chaptersView.prototype = {
		init: function( kdp ){
			this.kdp = kdp;
			var _this = this;
			this.cuePoints = new kWidget.cuePointsDataController({
				'wid' : this.getAttr( 'configProxy.kw.id' ),
				'entryId' : this.getAttr( 'mediaProxy.entry.id' ),
				'tags' : this.getConfig('tags') || 'chaptering' // default cuePoint name
			});
			// setup the app target:
			this.$chapterContainer = this.getConfig( 'containerId') ? 
					$('#' + this.getConfig( 'containerId') ) : 
					this.getChapterContainer();

			this.$chapterContainer.text( 'loading ...' );
			
			// if we added the chapterContainer set respective layout
			this.cuePoints.load(function( status ){
				// if an error pop out:
				if( ! _this.handleDataError( status ) ){
					return ;
				}
				// draw chapters
				_this.drawChapters();
				// add bindings once ready:
				_this.addBindingsWhenMediaReady();
			});
		},
		drawChapters: function(){
			var _this = this;
			_this.$chapterContainer.empty();
			$.each( this.cuePoints.get(), function( inx, cuePoint ){
				_this.$chapterContainer.append( 
					$('<span />').css({
						'margin': '5px'
					}).text( cuePoint.get('text') )
				);
			});
		},
		addBindingsWhenMediaReady: function(){
			var _this = this;
			if( this.getAttr('playerStatusProxy.kdpStatus') == 'ready' ){
				this.addBindings();
			} else {
				this.kdp.kBind( 'mediaReady', function(){
					_this.addBindings();
				})
			}
		},
		addBindings: function(){
			//debugger;
		},
		// get the chapter container with respective layout
		getChapterContainer: function(){
			// remove any existing k-chapters-container
			$('.k-chapters-container').remove();
			// Build new chapters container
			$chapterContainer = $('<div>').addClass( 'k-chapters-container');
			// check for where it should be appended:
			switch( this.getConfig('position') ){
				case 'before':
					$( this.kdp )
						.css( 'float', 'none')
						.before( $chapterContainer );
				break;
				case 'left':
					$chapterContainer.css('float', 'left').insertBefore( this.kdp );
					$( this.kdp ).css('float', 'left');
				break;
				case 'right':
					$chapterContainer.css('float', 'left').insertAfter( this.kdp );
					$( this.kdp ).css('float', 'left' );
				break;
				case 'after':
				default:
					$( this.kdp )
						.css( 'float', 'none')
						.after( $chapterContainer );
				break;
			};
			// set size based on layout
			// set sizes:
			if( this.getConfig('overflow') != true ){
				if( this.getConfig( 'layout' ) == 'horizontal' ){
					$chapterContainer.css('width', $( this.kdp ).width() )
				} else if( this.getConfig( 'layout' ) == 'vertical' ){
					$chapterContainer.css( 'height', $( this.kdp ).height() )
				}
			}
			// temp give a border to help with layout
			$chapterContainer.css('border', 'solid thin black');
			
			return $chapterContainer;
		},
		
		/**
		 * Almost generic onPage plugin code: 
		 */
		handleDataError: function( data ){
			// check for errors; 
			if( !data || data.code ){
				this.$chapterContainer.empty().append(
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
					error.title = "Missing Kaltura Secret";
					error.msg = "The chapters editor appears to be missing a valid kaltura secret." +
							" Please retrive one from the <a target=\"_new\" href=\"http://www.kaltura.com/api_v3/testme/index.php\">api</a>," +
							"and add it to this widgets settings"
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
		getAttr: function( attr ){
			return this.kdp.evaluate( '{' + attr + '}' );
		},
		getConfig : function( attr ){
			return this.kdp.evaluate('{chaptersView.' + attr + '}' );
		}
	}
	/*****************************************************************
	 * Application initialization
	 ****************************************************************/
	// We start build out before mediaReady to accelerate display of chapters
	// Once media is loaded and kdp can accept clicks, we add bindings
	if( !window.jQuery ){
		kWidget.appendScriptUrl( '//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js', function(){
			new chaptersView( kdp );
		});
		return ;
	} else {
		new chaptersView( kdp );
	}
});