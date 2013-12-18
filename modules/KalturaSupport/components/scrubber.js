( function( mw, $, kWidget ) {"use strict";

	mw.PluginManager.add( 'scrubber', mw.KBaseComponent.extend({

		defaultConfig: {
			'parent': 'controlBarContainer',
			'insertMode': 'firstChild',
			'order': 1,
			'sliderPreview': true,
			'thumbSlices': 100,
			'thumbWidth': 100
		},

		isSliderPreviewEnabled: function(){
		  return this.getConfig("sliderPreview") && !this.isDisabled;
		},
		setup: function( embedPlayer ) {
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

			// Update buffer bar
			this.bind( 'updateBufferPercent', function( e, bufferedPercent ){
				_this.updateBufferUI(bufferedPercent);				
			});
			var lastPlayheadUpdate = 0;
			this.bind( 'updatePlayHeadPercent', function( e, perc ){
				var val = parseInt( perc * 1000 );
				if( lastPlayheadUpdate !== val ){
					lastPlayheadUpdate = val;
					_this.updatePlayheadUI(val);
				}
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
			});
		},
		updateBufferUI: function( percent ){
			this.getComponent().find( '.buffered' ).css({
				"width" : ( percent * 100 ) + '%'
			});
		},
		updatePlayheadUI: function( val ){
			this.getComponent().slider( 'value', val );
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
						x: e.clientX,
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
			if (data.x  < previewWidth /2) {
				sliderLeft =  0 ;
			}

			if (data.x > data.width - previewWidth/2) {
				sliderLeft = data.width - previewWidth ;
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
					var perc = ui.value / 1000;
					// always update the title 
					$( this ).find('.ui-slider-handle').attr('data-title', mw.seconds2npt( perc * embedPlayer.getDuration() ) );
				},
				change: function( event, ui ) {
					alreadyChanged = true;
					var perc = ui.value / 1000;
					// always update the title 
					$( this ).find('.ui-slider-handle').attr('data-title', mw.seconds2npt( perc * embedPlayer.getDuration() ) );
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
								'role' : 'slider',
							})
							.addClass ( "scrubber" )
							.slider( this.getSliderConfig() );
				// Up the z-index of the default status indicator:
				this.$el.find( '.ui-slider-handle' )
					.addClass('playHead PIE')
					.wrap( '<div class="handle-wrapper" />' )
					.attr({
						'tabindex': '-1',						
						'data-title': mw.seconds2npt( 0 )
					});

				this.$el.find( '.ui-slider-range-min' ).addClass( 'watched' );
				// Add buffer:
				this.$el.append(
					$('<div />').addClass( "buffered")
				);

			}

			return this.$el;
		}
	}));
	
} )( window.mw, window.jQuery, kWidget );
