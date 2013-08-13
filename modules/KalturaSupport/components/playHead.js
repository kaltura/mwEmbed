( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'playHead', mw.KBaseComponent.extend({
		defaultConfig: {
            'disableable': true,
            'parent': 'controlBarContainer',
			'insertMode': 'firstChild',
			'order': 1,
            'sliderPreview':1,
            'thumbWidth': 100

		},
        isSliderPreviewEnabled: function(){
          return this.getConfig("sliderPreview") && !this.isDisabled;
        },
		setup: function( embedPlayer ) {
			this.addBindings();
            if (this.isSliderPreviewEnabled())
            {
                var _this = this;
                _this.thumbnailsLoaded =false;
                setTimeout( function() {
                    _this.loadThumbnails(function(){
                        _this.thumbnailsLoaded = true;
                    });
                },1000)
            }
		},
		addBindings: function() {
			var _this = this;
            this.bind( 'durationChange', function(event, duration){
                    _this.duration = duration;
            });

			// Update buffer bar
			this.bind( 'updateBufferPercent', function( e, bufferedPercent ){
				_this.getComponent().find( '.buffered' ).css({
					"width" : ( bufferedPercent * 100 ) + '%'
				});				
			});
			var lastPlayheadUpdate = 0;
			this.bind( 'updatePlayHeadPercent', function( e, perc ){
				var val = parseInt( perc * 1000 );
				if( lastPlayheadUpdate !== val ){
					lastPlayheadUpdate = val;
					_this.getComponent().slider( 'value', val );
				}
			});
		},
		onEnable: function() {
            this.isDisabled = false;
            this.getComponent().slider( "option", "disabled", false );
		},
		onDisable: function() {
            this.isDisabled = true;
            this.getComponent().slider( "option", "disabled", true );
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
                }

                this.imageSlicesUrl = kWidget.getKalturaThumbUrl(
                    $.extend( {}, baseThumbSettings, {
                        'vid_slices': kWidget.getSliceCount(this.duration)
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
            if ( !this.isSliderPreviewEnabled() && this.thumbnailsLoaded ){
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

            $sliderPreview.css({top:top,left:sliderLeft });
            $sliderPreview.css({'background-image': 'url(\'' + this.imageSlicesUrl + '\')',
                'background-position': kWidget.getThumbSpriteOffset( this.getConfig("thumbWidth"), currentTime  , this.duration),
                'background-size': ( this.getConfig("thumbWidth") * kWidget.getSliceCount(this.duration) ) + 'px 100%'
            });
            $(".playHead .arrow").css("left",this.getConfig("thumbWidth") / 2 -  6);
            $sliderPreviewTime.text(kWidget.seconds2npt( currentTime ));
            $sliderPreviewTime.css({bottom:2,left:this.getConfig("thumbWidth")/2 - $sliderPreviewTime.width()/2})
            $sliderPreview.css("width",this.getConfig("thumbWidth"));
            $sliderPreview.show();
        },
        hideThumbnailPreview: function() {
            $(".sliderPreview").hide();
        },
		getSliderConfig: function() {
			var _this = this;
			var embedPlayer = this.getPlayer();
			return {
				range: "min",
				value: 0,
				min: 0,
				max: 1000,
				// we want less than monitor rate for smoth animation
				animate: mw.getConfig( 'EmbedPlayer.MonitorRate' ) - ( mw.getConfig( 'EmbedPlayer.MonitorRate' ) / 30 ) ,
				start: function( event, ui ) {
					embedPlayer.userSlide = true;
				},
				slide: function( event, ui ) {
					var perc = ui.value / 1000;
					// always update the title 
					$( this ).find('.ui-slider-handle').attr('data-title', mw.seconds2npt( perc * embedPlayer.getDuration() ) );
					
					// Update the thumbnail / frame
					if ( embedPlayer.isPlaying == false ) {
						embedPlayer.updateThumbPerc( perc );
					}
				},
				change: function( event, ui ) {
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
				this.$el = $( '<div />' ).addClass ( "playHead" ).slider( this.getSliderConfig())
                    .on({
                    'mousemove touchmove touchstart': function(e) {
                        if (e.toElement && e.toElement.className.indexOf("sliderPreview") > -1)
                        {
                            _this.clearHover();
                            return;
                        }
                        var width = $(this).width();
                        var offset = $(this).offset();
                        var options = $(this).slider('option');
                        var value = Math.round(((e.clientX - offset.left) / width) *
                            (options.max - options.min)) + options.min;

                        _this.showThumbnailPreview({
                            x: e.clientX,
                            val: value,
                            width:width
                        });
                    },'mouseleave touchend':function() {
                            _this.hideThumbnailPreview();
                    }
                }).append($("<div/>").hide().addClass( "sliderPreview").append($("<div/>").addClass("arrow")).
                        append($("<span/>").addClass( "sliderPreviewTime" ))
                    );
				// Up the z-index of the default status indicator:
				this.$el.find( '.ui-slider-handle' ).attr('data-title', mw.seconds2npt( 0 ) );
				this.$el.find( '.ui-slider-range-min' ).addClass( 'watched' );
				// Add buffer:
				this.$el.append(
					$('<div />').addClass( "buffered")
				);

            }
			return this.$el;
		}
	})
	);
	
} )( window.mw, window.jQuery );