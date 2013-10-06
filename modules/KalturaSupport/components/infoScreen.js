( function( mw, $ ) {"use strict";

	mw.PluginManager.add( 'infoScreen', mw.KBaseComponent.extend({

		defaultConfig: {
			parent: "topBarContainer",
         	order: 3,
         	align: "right",
         	minWidth: 400,
         	minWidthClass: 'infoScreenSmall',
         	template: "<div class='pull-right details'> \
         		<div class='created'>Uploaded on {mediaProxy.entry.createdAt|dateFormat}</div> \
         		<div class='description'>{mediaProxy.entry.description}</div></div> \
         		<div class='pull-left panel'><div class='videoPreview'></div> \
         		<div class='views'>{mediaProxy.entry.views|numberWithCommas} Views</div> \
         		</div>"
		},
		oldVidCss: null,
		canResizeVideo: false,
		setup: function(){
			var _this = this;
			this.bind('playerReady', function(){
				_this.removeInfoScreen();
			});
			
			this.bind('onplay', function(){
				_this.canResizeVideo = true;
				if( _this.isInfoScreenVisible() ){
					_this.resizePlayer();
				}
				if( _this.isSmallView && _this.isInfoScreenVisible() ){
					_this.hideInfoScreen();
				}
			});

			this.bind('updateLayout', function(){
				if( $(window).width() <= _this.getConfig('minWidth') ){
					_this.isSmallView = true;
					_this.getPlayer().getInterface().addClass( _this.getConfig('minWidthClass') );
				} else {
					_this.isSmallView = false;
					_this.getPlayer().getInterface().removeClass( _this.getConfig('minWidthClass') );
				}
			});
		},
		removeInfoScreen: function(){
			if( this.$infoScreen ){
				this.$infoScreen.remove();
			}
		},
		toggleInfoScreen: function(){
			// show info screen
			if( this.isInfoScreenVisible() ){
				this.hideInfoScreen();
			} else {
				this.showInfoScreen();
			}
			return;
		},
		isInfoScreenVisible: function(){
			return (!this.$infoScreen) ? false : this.getInfoScreen().is(':visible');
		},
		getPreviewCss: function(){
			if( !this.previewCss ){
				var $preview = this.$infoScreen.find('.videoPreview');
				var baseCss = {
					'position': 'absolute',
					'z-index': 4
				};
				this.previewCss = $.extend(baseCss, $preview.position());
				this.previewCss.width = $preview.width();
				this.previewCss.height = $preview.height();
			}
			return this.previewCss;
		},
		repositionExpandBtn: function(){
			this.getPlayer().getVideoHolder().find('.expand-player').css({
				top: this.getPreviewCss().top + 10,
				left: this.getPreviewCss().left + 10
			});
		},
		resizePlayer: function(){
			if( this.isSmallView ) return;
			var vid = this.getPlayer().getPlayerElement();
			if( !this.oldVidCss ){
				this.oldVidCss = vid.style.cssText;
			}
			$( vid ).css( this.getPreviewCss() );
		},
		restorePlayer: function(){
			if( this.isSmallView ) return;
			var vid = this.getPlayer().getPlayerElement();
			vid.style.cssText = this.oldVidCss;
		},
		showInfoScreen: function(){

			// Show info screen
			this.getPlayer().disableComponentsHover();
			this.getInfoScreen().show();

			// Pause video if playing and in small view
			this.wasPlaying = this.getPlayer().isPlaying();
			if( this.isSmallView && this.wasPlaying ){
				this.getPlayer().pause();
			}

			// Decide if to show thumbnail or resize the video
			var $preview = this.getInfoScreen().find('.videoPreview');
			if( this.canResizeVideo ){
				$preview.find('img').hide();
				this.resizePlayer();
			} else {
				if( $preview.find('img').length ){
					$preview.find('img').show();
				} else {
					$preview.append(
						$('<img />').attr('src', this.getThumbUrl())
					);
				}
			}

			// Position & Show expand player button
			this.repositionExpandBtn();
			this.getPlayer().getVideoHolder().find('.expand-player').show();
		},
		hideInfoScreen: function(){
			this.getPlayer().getVideoHolder().find('.expand-player').hide();
			this.getPlayer().restoreComponentsHover();
			// Resume playing if small view and was playing
			if( this.isSmallView && this.wasPlaying ) {
				this.getPlayer().play();
			}			
			this.restorePlayer();
			this.getInfoScreen().hide();
		},
		getThumbUrl: function(){
			return kWidget.getKalturaThumbUrl({
				'width': 230,
				'partner_id': this.getPlayer().kpartnerid,
				'uiconf_id': this.getPlayer().kuiconfid,
				'entry_id': this.getPlayer().kentryid
			});
		},		
		getInfoScreen: function(){
			if( ! this.$infoScreen ){
				var _this = this;
				var $template = $( $.parseHTML( this.getConfig('template') ) );
				var $expandBtn = [];
				// If we have player preview
				if( $template.find('.videoPreview').length ){
					$expandBtn = $( '<i />' )
									.addClass( 'expand-player icon-expand2' )
									.click(function(){
										_this.hideInfoScreen();
									});
				}

				this.$infoScreen = $('<div />')
									.addClass( 'screen ' + this.pluginName )
									.append( 
										$('<div class="screen-content" /> ').append(
											$template
										)
									)
									.hide();

				this.getPlayer().getVideoHolder().append( this.$infoScreen, $expandBtn );
			}
			return this.$infoScreen;
		},		
		getComponent: function() {
			if( !this.$el ) {	
				var _this = this;
				this.$el = $( '<button />' )
							.attr( 'title', this.playTitle )
							.addClass( "btn icon-info" + this.getCssClass() )
							.click( function(){
								_this.toggleInfoScreen();
							});
				
			}
			return this.$el;
		}
	}));

} )( window.mw, window.jQuery );