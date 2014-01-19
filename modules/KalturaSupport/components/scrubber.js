( function( mw, $, kWidget ) {"use strict";

	mw.PluginManager.add( 'scrubber', mw.KBaseComponent.extend({

		defaultConfig: {
			'parent': 'controlBarContainer',
			'insertMode': 'firstChild',
			'order': 25,
			'sliderPreview': true,
			'thumbSlices': 100,
			'thumbWidth': 100,
			'minWidth': 100,
			'displayImportance': "medium"
		},

		isSliderPreviewEnabled: function(){
			return this.getConfig("sliderPreview") && !this.isDisabled && !this.embedPlayer.isLive();
		},
		setup: function( embedPlayer ) {
			// make sure insert mode reflects parent type:
			if( this.getConfig('parent') == 'controlsContainer' ){
				this.setConfig('insertMode', 'lastChild');
			}
			this.addBindings();
			if ( this.isSliderPreviewEnabled() ){
				this.setupThumbPreview();
			}
		},
		addBindings: function() {
			var _this = this;
			this.bind( 'durationChange', function(event, duration){
				_this.duration = duration;
			});

			// check if parent is controlsContainer
			if( this.getConfig('parent') == 'controlsContainer' ){
				// need to add
				this.bind('updateComponentsVisibilityStart', function(){
					// take minWidth, so that normal display Importance rules work: 
					_this.getComponent().css('width', _this.getConfig('minWidth') );
				})
				this.bind( 'updateComponentsVisibilityDone', function(){
					var $container = _this.getComponent().parent();
					// get remaining space:
					var compSize = _this.embedPlayer.layoutBuilder.getComponentsWidthForContainer(
							$container
					) - _this.getComponent().width();
					var targetSize = $container.width() - compSize;
					if( targetSize <  _this.getConfig('minWidth') ){
						targetSize = _this.getConfig('minWidth');
					}
					_this.getComponent().css('width', ( targetSize ) + 'px' );
				});
			}
			
			// Update buffer bar
			this.bind( 'updateBufferPercent', function( e, bufferedPercent ){
				_this.updateBufferUI(bufferedPercent);				
			});

			this.bindUpdatePlayheadPercent();
			this.bind( 'externalUpdatePlayHeadPercent', function(e, perc) {
				_this.updatePlayheadPercentUI( perc );
			});
			//will stop listening to updatePlayheadPercent events
			this.bind( 'detachTimeUpdate', function() {
				_this.unbind( 'updatePlayHeadPercent' );
			});
			//will re-listen to updatePlayheadPercent events
			this.bind( 'reattachTimeUpdate', function() {
				_this.bindUpdatePlayheadPercent();
			});
			this.bind( 'playerReady' ,function(event){
				//Load the strip only if the configuration allows preview. It gets a 404 if you do not have a local flavor
				if(_this.getConfig("sliderPreview")){
					_this.thumbnailsLoaded = _this.loadedThumb =  false;
					//We put this into a timeout to avoid stacking resource requests in video autoplay and player build out setups
					setTimeout( function() {
						_this.loadThumbnails(function(){
							_this.thumbnailsLoaded = true;
						});
					},1000);
				}
			} );
		},
		bindUpdatePlayheadPercent: function() {
			var _this = this;
			this.bind( 'updatePlayHeadPercent', function( e, perc ){
				_this.updatePlayheadPercentUI( perc );
			});
		},
		updatePlayheadPercentUI: function( perc ) {
			var val = parseInt( perc * 1000 );
			this.updatePlayheadUI(val);
		},
		updateBufferUI: function( percent ){
			this.getComponent().find( '.buffered' ).css({
				"width" : ( parseInt(percent * 100) ) + '%'
			});
		},
		updatePlayheadUI: function( val ){
			this.getComponent().slider( 'option', 'value', val );
		},
		setupThumbPreview: function(){
			var _this = this;
			this.thumbnailsLoaded = false;

			this.getComponent().on({
				'mousemove touchmove touchstart': function(e) {
					if (e.toElement && e.toElement.className.indexOf("sliderPreview") > -1){
						_this.hideThumbnailPreview();
						return;
					}

					var $this = $(this);
					var width = $this.width();
					var offset = $this.offset();
					var options = $this.slider('option');
					var value = Math.round(((e.clientX - offset.left) / width) *
						(options.max - options.min)) + options.min;

					_this.showThumbnailPreview({
						offset: offset,
						x: e.clientX - offset.left,
						val: value,
						width:width
					});
				},
				'mouseleave touchend': function() {
					_this.hideThumbnailPreview();
				}
			}).append(
				$("<div/>")
					.hide()
					.addClass( "sliderPreview")
					.append( $("<div/>").addClass("arrow") )
					.append( $("<span/>").addClass( "sliderPreviewTime" ) )
			);
		},
		onEnable: function() {
			this.isDisabled = false;
			this.getComponent().toggleClass('disabled');
			this.getComponent().slider( "option", "disabled", false );
		},
		onDisable: function() {
			this.isDisabled = true;
			this.getComponent().slider( "option", "disabled", true );
			this.getComponent().toggleClass('disabled');
		},
		getSliceCount: function( duration ) {
			//return kWidget.getSliceCount(this.duration);
			return this.getConfig("thumbSlices") || 100;
		},
		loadThumbnails : function(callback) {
			var _this = this;
			if (!this.loadedThumb)  {
				this.loadedThumb = true;
				var baseThumbSettings = {
					'partner_id': this.embedPlayer.kpartnerid,
					'uiconf_id': this.embedPlayer.kuiconfid,
					'entry_id': this.embedPlayer.kentryid,
					'width': this.getConfig("thumbWidth")
				};

				this.imageSlicesUrl = kWidget.getKalturaThumbUrl(
					$.extend( {}, baseThumbSettings, {
						'vid_slices': this.getSliceCount(this.duration)
					})
				);

				// preload the image slices:
				var img = new Image();
				img.onload = function() {
					callback();
				};
				img.src = _this.imageSlicesUrl ;
			} else {
				callback();
			}

		},

		showThumbnailPreview: function(data) {
			if ( !this.isSliderPreviewEnabled() || !this.thumbnailsLoaded ){
				return;
			}
			if (!(data.val >=0 && this.duration >=0) ){
				return;
			}
			//cache jqeury objects
			var $sliderPreview  = this.getComponent().find(".sliderPreview");
			var $sliderPreviewTime = this.getComponent().find(".sliderPreview .sliderPreviewTime");

			var sliderTop = 0;
			var sliderLeft = 0;
			var previewWidth = $sliderPreview.width();
			var previewHeight = $sliderPreview.height();
			var top = $(".slider").position().top - previewHeight - 30;
			sliderLeft = data.x - previewWidth/2;
			if ( ( data.x + data.offset.left ) < previewWidth /2) {
				sliderLeft =  0 ;
			}
			if ( data.x >  data.offset.left + data.width - previewWidth/2) {
				sliderLeft = data.offset.left + data.width - previewWidth ;
			}

			var perc = data.val / 1000;
			var currentTime = this.duration* perc;
			var thumbWidth =  this.getConfig("thumbWidth");
			$sliderPreview.css({top:top,left:sliderLeft });
			$sliderPreview.css({'background-image': 'url(\'' + this.imageSlicesUrl + '\')',
				'background-position': kWidget.getThumbSpriteOffset( thumbWidth, currentTime  , this.duration , this.getSliceCount( this.duration ) ),
				'background-size': ( thumbWidth * this.getSliceCount( this.duration ) ) + 'px 100%'
			});
			$(".playHead .arrow").css("left",thumbWidth / 2 -  6);
			$sliderPreviewTime.text(kWidget.seconds2npt( currentTime ));
			$sliderPreviewTime.css({bottom:2,left:thumbWidth/2 - $sliderPreviewTime.width()/2});
			$sliderPreview.css("width",thumbWidth);

			if (kWidget.isIE8()) {
				$sliderPreview.css("height",43);
			}
			$sliderPreview.show();
		},
		hideThumbnailPreview: function() {
			this.getComponent().find(".sliderPreview").hide();
		},
		getSliderConfig: function() {
			var _this = this;
			var embedPlayer = this.getPlayer();
			var alreadyChanged = false;
			var updateAttr = function(event, ui, slider){
				var perc = ui.value / 1000;
				// always update the title
				$( slider ).find('.ui-slider-handle').attr('data-title', mw.seconds2npt( perc * embedPlayer.getDuration() ) );
				$( slider ).find('.ui-slider-handle').attr('aria-valuetext', mw.seconds2npt( perc * embedPlayer.getDuration() ));
				$( slider ).find('.ui-slider-handle').attr('aria-valuenow',parseInt(perc*100) +'%' );
			}
			return {
				range: "min",
				value: 0,
				min: 0,
				max: 1000,
				// we want less than monitor rate for smoth animation
				animate: mw.getConfig( 'EmbedPlayer.MonitorRate' ) - ( mw.getConfig( 'EmbedPlayer.MonitorRate' ) / 30 ) ,
				start: function( event, ui ) {
					embedPlayer.userSlide = true;
					// Release the mouse when player is not focused
					$( _this.getPlayer() ).one('hidePlayerControls', function(){
						$(document).trigger('mouseup');
					});
				},
				slide: function( event, ui ) {
					updateAttr(event,ui,this);
				},
				change: function( event, ui ) {
					alreadyChanged = true;
					var perc = ui.value / 1000;
					// always update the title 
					updateAttr(event,ui,this);
					// Only run the onChange event if done by a user slide
					// (otherwise it runs times it should not)
					if ( embedPlayer.userSlide ) {
						embedPlayer.userSlide = false;
						embedPlayer.seeking = true;

						if( embedPlayer.isStopped() ){
							embedPlayer.play();
						}
						embedPlayer.seek( perc );
					}
				}

			};
		},	
		getComponent: function() {
			var _this = this;
			if( !this.$el ) {
				this.$el = $( '<div />' )
							.attr({
								'role' : 'slider'
							})
							.addClass( this.getCssClass() + " scrubber" )
							.slider( this.getSliderConfig() );
				// Up the z-index of the default status indicator:
				this.$el.find( '.ui-slider-handle' )
					.addClass('playHead PIE btn')
					.wrap( '<div class="handle-wrapper" />' )
					.attr({
						'aria-valuetext': mw.seconds2npt( 0 ),
						'aria-valuenow':'0 %',
						'data-title': mw.seconds2npt( 0 )
					});

				this.$el.find( '.ui-slider-range-min' ).addClass( 'watched' );
				// Add buffer:
				this.$el.append(
					$('<div />').addClass( "buffered")
				);
				// if parent is controlsContainer set to zero width and update at update layout time. 
				if( this.getConfig('parent') == 'controlsContainer' ){
					this.$el.css({
						'width': this.getConfig('minWidth')
					});
					this.$el.addClass()
				}
			}
			return this.$el;
		}
	}));
	
} )( window.mw, window.jQuery, kWidget );
