/**
* Adds Power Point Widget Support
*/
( function( mw, $ ) { "use strict";
// Temporary location for slide images:
mw.setConfig('Kaltura.PPTWidgetSlidePath', 'http://projects.kaltura.com/thomson-reuters/public/slides/');

mw.KPPTWidget = function(){
	this.init.apply( this, $.makeArray( arguments ) );
};
mw.KPPTWidget.prototype = {
	// The playerId
	playerId : null,

	// The data pay load
	dataEntry: null,
	// Cache of xml parsed the dataEntry.dataContent
	$dataContent : null,

	// The set of functions to run on progress updates ( things like playhead, progress bar, buffer )
	progressBindings: [],

	// Set of functions run once player is "ready"
	readyBindings:[],

	// @@TODO MOVE to css file
	icons: {
		'YelloTag' : 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAPCAYAAADd/14OAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sIEQMPLNv+8wIAAAFRSURBVCjPbY+9SoMxFIaftNGqICoIDnVQFAShgqK4izchiODiBeiud+LuKLhXF6mLIog/gygO/oEWW9t8SZMch7b6tXiWnOR9znveqMbzroh4lHgkekQCIh6JgRg9RI9kh9AS6qieUSCiJKCIIBGIrbdIrfKBDo1vtB5MiQGVApGItTV09AbE/ompgXbvnEH7hiEXbYfD39mM4hKL9j4BsR1QR04JJKaOdtaCuJYYutY3e2MTdMNalNh/s7V/bYxDJ9Y1V6eyqa6BuknQSeJ4e31nZLifXG+mw+2zXKf8ZYkR1OPV/on5fh6ovBwuLhVGfqFK1VG6KDNR2Cpms7lJRauOD1ZlKl8lP9aL94HT82ptvLD9ND23OQuQaYNTCzvFu/sa3gdu7w19Q/NnbQjg1xGgdLQhyl5SNf3F1fXSSlrLpC/5mbWb64ccM8t7g3TVD4Y37QJ7VTGEAAAAAElFTkSuQmCC',
		'RedTag' : 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAPCAYAAADd/14OAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sIEQMREVfXgMwAAAELSURBVCjPlZG/SoJhFMZ/5/MVXwmHloampm/LNQiELiGiLbyB7AqS1pa8gaA1LKgpL6C9KTCHxmyQ6A8I4uF78z0NRjpY2rOew3Oe33OkVRBjhgSIBhEopikJC8oZkBOZOcwJ5IAsBByAzXHT7D+LtkA+DQEXYS7RQDPcyOAXlh8NQ8CNGJP96ZgF3CeQn7OYxYjLzIgRCjLuczpFPxr9+P2ph4tmp9/tFjunJ2vLz2+Tc9FoB9iq12+AdVRVVHXzqrr7epYXu/aJXRbEjkTsttG4U9Wyqi4l3nszs/t0Z6/5slIiYDyJjFYrlfZGrbZvZo/e+8GkguEwaR0evB+X8nZe3e599HrlaaAvYgF21SIff7IAAAAASUVORK5CYII=',
		'PlayArrow' : 'iVBORw0KGgoAAAANSUhEUgAAABEAAAAQCAYAAADwMZRfAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sIEQM5EH2NHvAAAAHFSURBVDjLndRNaxNBGAfw/ywbGCZDLm5eFmS9RGxaDyGJdZPNWupKxpyGvYR67PYL+AlyE/wCxZNH8VpRLy09BlvRHqQVPRgQPahQsYpmN8QdD7XFhualDsxlZp7fPDM8M2i322929/beR1Hkh2F4Hv/RSLlSCQkhYalUileC4EexWLyjlOoCeEsp/TAVcmV+XhFCQAgBAJim2Q2Wl3tCiA2l1CMA25TS3ljkqm2rI+AvFhJCSC6X278pROT7/lPO+RqldHMkUq3V1D8AhkBwziPf97s3PG8nm83eA/CMMRafQGqOo0YBw2Oe5x3cWlp6mMlkOgAecM4PE6i7rpoUPDQWXp6bo61Wa71arQoAINcWFtQ0wGlrLljWy2az2deHJ6YFGGMozM7+ujQz803XNG2q+zjqhmHsuvV6ptFobDLGHgPoHCMTdv+dNozPUsqPjuMEAHoA9tPp9AEA6JqmjQN6hULhk5Ry7WI+v2qa5rvT6kQfkX7ouu7ruuM8yR8GfxlXsSeOk0wmUSmXt6SUnVQqdT+O43OTgGOEMfZTCPH8+uLii0QicdeyrK9necX6ShDs2Lb9qt/v31ZK8cFg8P2sX8Efci6C9dFOwU4AAAAASUVORK5CYII=',
		'DoubleArrowRight' : 'iVBORw0KGgoAAAANSUhEUgAAABUAAAAMCAYAAACNzvbFAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sIEQQBGRaBDCoAAAI2SURBVCjPlZNPbBJBFMa/oRBgiwpshDVRm7ANCUKFNAZaIimp7m7raYuY2MSL8WJMvHrWA7GxHrwZD3rypNnUxMhliZpqbS8mLfHfAaQU00A5eFALLgvjoVChMW19ySTzTd783vcyb0gqlXopy3KZ5/knADIAfmIrgrlcTl5YWDgjSdIzjuMeAPiFfUQfBR6+SKePZLPZUy63e4hzuw8D2ARwoFQqsXdmZ68oihIrl8vC4ODgps1mKwLQdoXyPH+LENJf2dg4pKpqUFXVYL/NNszzfLFSqZxUM5lhQgiTz+ePK4qSXF5ZOc1xnJvjOAD4BoDuhJKzgkABgFK6vQCAYZgvQ4HA23eLi5copZaunDoAi8fjWT6fSMxLkqRQSud7oKIk0W7YTvgeWne5XD8kUbyfSCSWrFbrcwAg0sREj9OdF/dbjGGYr6Io+qdkud7n9XpvAgAhBISQvy20dedsL63rukXTNMHhcBiNBoOhpyIh5L91wO9/dHF6+uoJn6/RbDZh7FTrbqetdZZlV6vV6jEA5u6czj4ej6cvJJPXWJYtNptNaNrWpG077XJRj46OrgmCMFer1Qy3Z2aud8OsVuunc5OT9Vgsdtdutz9ttVp6B9aJbacWi+X7SCSyOj4+/sHhcFymlA4UCoUbhBAzIQQsy65PyfJcKBR6bDKZliilaDQa/xx+o9Pp/BwfG/sdDodfmc3m1wA+6ro+AOAogIM+n+9NNBp9PxKJ3NM0ba39KLt+0z+uDUhLqCoVkAAAAABJRU5ErkJggg==',
		'DoubleArrowLeft' : 'iVBORw0KGgoAAAANSUhEUgAAABUAAAAMCAYAAACNzvbFAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sIEQQBAQXtlHwAAAIHSURBVCjPnZPPixJhGMe/3xmzkfISLLSsWCxKvw4KQaSzLQV22TCKqGOHDkUQ2KHDRvf+gIJYug24bJCZp5YZCVwEt/UQzajtRb1oOA0IgjAzHtQuu8sua+H2wPfwfJ/n+by8vO9D13UxZZwwTfOJqqp3ZFn+GgqFcgD0ndpJAIlGo/Egl8ud9kwB85umeUtRlGeqpkVIStFoNAPAB+AcAFk3jNhqOn3FqFRmSZ76G1QAEP+h6wuKoizpun6NJARBAEkXwDwAU8vnX62m0xd+W1aA5FgQBIkkaNv2ARrJRVVV733KZhebzWYUgEtSIrlbd+OxWLpSrS7Ytn1+x9sTALDf7wMAHMdJZrPZq6qmPbUsyw/Ac6h52rxer+NzLidpmlazbXv+SMMTPADw6Ibx2DCMh47jzP6r+Ui5ZVkQRRE/t7ePfVhbW6nWao/+G7arTqez90iiKKLb7Z75mMm8KxQKS5OuRnIwMzPT6na7Z0l6Jh7QbrcP/ydB8PR6vfvFYvHFl/V1yXGci/uG3ZfLy299Pt8on8/fLW1uBklK++FiKpXCeDw+oNFoNPJ6vdVwOPz+ZiLxPTA3N2i1WgHXdf0kRVmWq4FA4E0kEnktx+NhAiPLsqThcOgjCTabzal21Ov1Br9tbT0vlUqXbyeTv4LB4AqANgACuDQYDK6Xy+UbhY2N438AcC7WrXVdiHwAAAAASUVORK5CYII=',
		'PauseBtn' : 'iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sIEQQTOswSDYsAAAC+SURBVCjPhVExEoMwDJOUDCyM/UDX8o/yoPIL+j22vqBjl27uAAGTBJq7XM6OJdsS731vcKfruuk5jjefewzDa5qmK0kAAElEZIdAk+ckQRJIIoFltjUkCZBtQbYA6OKYM6X3ELzcHdATZKA2hLAj2IBz9rBbqnOx0u9acLZjAkdfTBKqjZrtCKAiTq1jZke548z8ro1aijN7d6qqpI+kyzoVACmE3I6m0vHr6SztaGb/fCysil7+I1VhVkzxA2JzF3YZt9OqAAAAAElFTkSuQmCC'
	},

	init: function( widgetTarget, uiConf, callback ){
		var _this = this;
		mw.log('mw.KPPTWidget::init');
		uiConf = uiConf.replace('[kClick', 'kClick'); // Ugly hack!
		var xml =  $.parseXML( uiConf );
		this.$uiConf = $( xml );
		this.$target = $( widgetTarget );

		// update the playerId mapping:
		this.playerId = this.$target.attr('id');
		this.$target.attr('id', this.playerId + '_pptContainer' );
		if( this.$target.getFlashvars() ){
			this.flashvar = this.$target.getFlashvars();
		}

		// Setup the layout object via KLayout
		/*this.layout = new mw.KLayout({
			'$layoutBox' : this.$uiConf.find('#topLevel'),
			'evaluateCallback' : this.evaluateProperty,
			'getEmbedPlayerCallback' : function(){
				return _this.getEmbedPlayer();
			}
		});
		this.$target.empty().append(
			this.layout.getLayout()
		);*/

		// load the data xml
		this.loadPPTData( function(){
			// Do a "fixed" layout for now:
			_this.addFixedLayout();
			// God knows why we have to do this. ( bug in chrome, this is not needed in firefox)
			jQuery.fn.embedPlayer = window.jQueryEmbedPlayer;
			// Update embed player
			_this.$target.find( 'video' ).embedPlayer( function(){
				// Add slide tags
				// Commented out for now, we can't support slides on mobile
				//_this.addSlideTags();

				// Add Player bindings
				_this.addBindings();

				if( callback )
					callback();
			});
		});
	},

	/**
	 * Loads the PPT data from the data service
	 * @return
	 */
	loadPPTData: function( callback ){
		var _this = this;
		// get the presentation id:
		var widgetId = this.$target[0].kwidgetid;
		// run the api query
		mw.KApiRequest(widgetId, {
			'service': 'data',
			'action' : 'get',
			'entryId' : _this.getDataEntryId()
		}, function( data ){
			_this.dataEntry = data;
			callback();
		});
	},
	getDataEntryId: function(){
		return this.flashvar.videoPresentationEntryId;
	},
	/**
	 * Do some simple checks but mostly hard coded layout
	 * @return layout dom
	 */
	addFixedLayout:function(){
		var _this = this;
		// Setup the container with target
		// Find out if the video is on the left or right
		var $PlayerHolderWrapper = this.$uiConf.find( '#PlayerHolderWrapper');


		var playerFirst = ( $PlayerHolderWrapper.find('Canvas:first-child').attr('id') == 'pptWidgetScreenWrapper' )?
				false : true;

		// Setup up pointers to important layout tags:
		var $ControllerScreenHolder = this.$uiConf.find( '#ControllerScreenHolder' );
		var $pptWidgetScreenWrapper = this.$uiConf.find('#pptWidgetScreenWrapper');
		this.$target.append(
			// Image container:
			$('<div />')
			.addClass( 'pptWidgetScreenWrapper' )
			.css({
				'width' : $pptWidgetScreenWrapper.attr( 'width' ) + '%',
				'top' : '0px',
				'bottom' : $ControllerScreenHolder.attr( 'height' )+ 'px',
				'position' : 'absolute',
				'left': '0px'
			})
		);

		// Add slides message
		var $pptScreenWrapper = this.$target.find('.pptWidgetScreenWrapper');
		$pptScreenWrapper.append(
			$('<div />')
			.css({
				'margin-top': ( ($pptScreenWrapper.height() / 2) - 20),
				'text-align': 'center',
				'font-family': 'Arial'
			})
			.text('Slides currently not supported on mobile devices.')
		);

		// Set up the video player and give it layout size ( give it the max size available,
		// this wont hurt layout since it will be fixed to natural size.
		this.$target.append(
			$('<div />').append(
				this.getVideoTag().attr({
					'width' : this.$target.width() - this.$target.find('.pptWidgetScreenWrapper').width(),
					'height' :  this.$target.height() - $ControllerScreenHolder.attr( 'height' )
				})
			).css({
				'top' : '0px',
				'right' : '0px',
				'position' : 'absolute'
			})
		);

		// Setup the control bar container:
		this.$target.append(
			$('<div />')
			.addClass( 'ControllerScreenHolder' )
			// TODO look up style based on 'styleName' attribute
			.css({
				'height' : $ControllerScreenHolder.attr( 'height' ),
				'position' : 'absolute',
				'bottom' : '0px',
				'left' : '0px',
				'right' : '0px',
				'background-color' : '#DDD',
				'background-image' : '-webkit-gradient(linear, left top, left bottom, from(#FFF), to(#CCC))',
			})
		);
		// Check for Scrubber
		var $scrubContainer = $ControllerScreenHolder.find('#scrubberContainer');
		if( $scrubContainer.length ){
			this.addScrubber( this.$target.find( '.ControllerScreenHolder' ), $scrubContainer );
		}

		// Add the play and slide jump buttons
		this.getSyncPlayButtons( this.$target.find( '.ControllerScreenHolder' ), $ControllerScreenHolder );

	},
	getSyncPlayButtons: function( $target, $syncButtonsConfig){
		var _this = this;
		// Add a center div
		var $syncButtonsContainer = $('<div />').css({
				'position' : 'absolute',
				'top' : '20px',
				'left' : ( this.$target.width() / 2 )- 100,
				'width': '300px'
			})
			.addClass( 'syncButtonsContainer' );
		var baseButtonCss = {
			'cursor' : 'pointer',
			'position' : 'relative',
			'border' : 'solid thin #666',
			'-moz-border-radius' : '3px',
			'border-radius' : '3px',
			'margin' : '5px',
			'float' : 'left',
			'background-image' : '-webkit-gradient(linear, left top, left bottom, from(#FFF), to(#BBB))'
		};
		// check for prev
		var $prvConf = $syncButtonsConfig.find('#syncPrevButton');
		if( $prvConf.length ){
			$syncButtonsContainer.append(
				$('<div />')
				.css( baseButtonCss )
				.css({
					'top' : '5px',
					'width' :$prvConf.attr('minWidth'),
					'height' : $prvConf.attr('minHeight')
				})
				.append(
					$('<img />').attr('src',  this.getIconSrc( 'DoubleArrowLeft' ) )
					.css({
						'position' : 'absolute',
						'top' : '5px',
						'left':'10px'
					})
				)
				.click(function(){
					// Get active tag:
					var $activeTag = _this.$target.find( '.slideTagsContainer .activeTag' );
					if( $activeTag.length  ){
						var $allTags = _this.$target.find( '.slideTagsContainer .slideTag' );
						// check if we can go prev:
						if( $activeTag.data( 'slideInx' ) - 1  >= 0 ){
							_this.activateTag( $activeTag.data( 'slideInx' ) - 1  );
						}
					}
				})
			);
		}

		// Check for play
		var $playConf =  $syncButtonsConfig.find('#playBtnControllerScreen')
		if( $playConf.length ){
			$syncButtonsContainer.append(
				$('<div />')
				.addClass('playBtnControllerScreen')
				.css( baseButtonCss )
				.css({
					'width' : $playConf.attr('minWidth'),
					'height' : $playConf.attr('minHeight')
				})
				.append(
					$('<img />').attr('src',  _this.getIconSrc( 'PlayArrow' ) )
					.css({
						'position' : 'absolute',
						'top' : '8px',
						'left':'22px'
					})
				)
				.click(function(){
					var embedPlayer = _this.getEmbedPlayer();
					if( embedPlayer.paused ){
						embedPlayer.play();
					} else {
						embedPlayer.pause();
					}
				})
			);
			_this.readyBindings.push(function( embedPlayer ){
				$( embedPlayer ).bind('onplay.ppt', function(){
					$syncButtonsContainer.find( '.playBtnControllerScreen img' ).attr('src',
						_this.getIconSrc( 'PauseBtn' )
					);
				});
				$( embedPlayer ).bind('onpause.ppt', function(){
					$syncButtonsContainer.find( '.playBtnControllerScreen img' ).attr('src',
						_this.getIconSrc( 'PlayArrow' )
					);
				});
			});
		}

		// check for next
		var $nextConf = $syncButtonsConfig.find('#syncNextButton');
		if( $nextConf.length ){
			$syncButtonsContainer.append(
				$('<div />')
				.css( baseButtonCss )
				.css({
					'top' : '5px',
					'width' : $nextConf.attr('minWidth') ,
					'height' : $nextConf.attr('minHeight' )
				})
				.append(
					$('<img />').attr('src',  this.getIconSrc( 'DoubleArrowRight' ) )
					.css({
						'position' : 'absolute',
						'top' : '5px',
						'left':'15px'
					})
				)
				.click(function(){
					// Get active tag:
					var $activeTag = _this.$target.find( '.slideTagsContainer .activeTag' );
					if( $activeTag.length  ){
						var $allTags = _this.$target.find( '.slideTagsContainer .slideTag' );
						// check if we can go next:
						if( $activeTag.data( 'slideInx' ) + 1  <  $allTags.length ){
							_this.activateTag( $activeTag.data( 'slideInx' ) + 1  );
						}
						// already at the end
					} else {
						// display the first tag
						_this.activateTag( 0 );
					}
				})
			);
		}
		// add the
		$target.append( $syncButtonsContainer );

	},
	addScrubber: function( $target, $scrubContainer){
		var _this = this;
		var scrubberHeight = $scrubContainer.find('#pptWidgetScrubber').attr('height');
		$target.append(
			$('<div />')
			.addClass( 'scrubberContainer' )
			.css({
				"top": "0px",
				"left": 0,
				"right": 0,
				"position" : 'absolute',
				'height' : scrubberHeight + 'px'
			})
		);
		// Add all the children to the scrubber with blocking horizontal layout
		var componentWidth = 0;
		var $targetScrubberContainer = $target.find('.scrubberContainer');
		$scrubContainer.children().each(function( inx, node){
			var $scrubberNode = _this.getScrubberNode( node );
			componentWidth += $scrubberNode.width();
			$targetScrubberContainer.append(
				$scrubberNode
			);
		});
		// adjust the size of the pptWidgetScrubber
		$targetScrubberContainer.find( '.pptWidgetScrubber' )
			.width( $targetScrubberContainer.width() - componentWidth );

	},
	getScrubberNode:function( node ){
		switch( node.nodeName.toLowerCase() ){
			case 'spacer':
				return	$('<div />' ).css( {
					'width' : $(node).attr('width'),
					'height':  1,
					'float' : 'left'
				})
				break;
			case 'timer':
				return this.getTimmer( node );
				break;
			case 'plugin':
				if( $( node ).attr('id') === 'pptWidgetScrubber' ){
					return this.getProgressBar( node );
				}
				break;
			default:
				mw.log( "Error: KPPTWidget:: unknown nodeType: " +  node.nodeName );
				return $('<span />');
				break;
		}
	},
	getProgressBar: function( node ){
		var _this = this;
		var baseSliderCss = {
			'width' : 'auto',
			'margin-left': '5px',
			'margin-right' : '10px'
		};

		var $progressBar = $('<div />').css({
			'float': 'left',
			// size is set once all the spacers are in place.
			'width' : 0,
			'height': $( node ).attr('height')
		})
		.addClass( 'pptWidgetScrubber' )
		.append(
			// Player tags:
			$('<div />')
			.addClass( 'slideTagsContainer' )
			.css( baseSliderCss )
			.css({
				'height' : '16px',
				'position' : 'relative'
			}),

			// Inner progress bar container:
			$('<div />')
			.addClass( "progressBarContainer" )
			.css( baseSliderCss )
			.css({
				'cursor' : 'pointer',
				'height' : '5px',
				'border' : 'solid thin #333',
				'background-color' : '#AAA',
				'background-image' : '-webkit-gradient(linear, left top, left bottom, from(#AAA), to(#666))',
				'-moz-border-radius' : '3px',
				'border-radius' : '3px'
			})
			.click( function( e ){
				var x = e.pageX - this.offsetLeft;
				var perc = x / $( this ).width();
				mw.log( 'KPPTWidget:: progressbar seek:' + perc );
				_this.getEmbedPlayer().doSeek( perc );
			})
		);
		var $playbackProgress = $('<div />').css({
			'background-color' : '#DDD',
			'border-radius' : '3px',
			'height' : '4px'
		})
		.appendTo( $progressBar.find( '.progressBarContainer' ) );

		_this.progressBindings.push(function( embedPlayer ){
			$playbackProgress.css('width', ( embedPlayer.currentTime / embedPlayer.duration ) *
					$progressBar.find( '.progressBarContainer' ).width() );
		});

		return $progressBar;
	},
	addBindings: function(){
		var _this = this;
		var embedPlayer = $('#' + this.getEmbedPlayerId() )[0];

		// Run any player ready bindings:
		$.each( _this.readyBindings, function(inx, readyCallback){
			readyCallback( embedPlayer );
		});

		// Setup the monitor bindings
		$( embedPlayer ).bind( 'monitorEvent', function(){
			$.each( _this.progressBindings, function(inx, progressCallback){
				progressCallback( embedPlayer );
			});
		});
	},
	addSlideTags: function( time ){
		var _this = this;
		this.getPresentationData().find('times time').each(function(inx, node){
			var videoTime = parseInt( $( node ).find( 'video').text() ) / 1000;
			var slideNum =  $( node ).find( 'slide').text();
			_this.addSlideTag( slideNum, videoTime );
		});
		// on ready display the "first" slide without highlight the marker
		this.readyBindings.push( function( embedPlayer ){
			// make sure we have slides ( to show the first one ) :
			if( _this.$target.find( '.slideTagsContainer .slideTag' ).length ){
				_this.showSlide( 0 );
				// de-activeate the tag:
				$('#' + _this.getSlideTagId( 0) )
				.removeClass( 'activeTag')
				.find( 'img').attr( 'src', _this.getIconSrc( 'YelloTag' ) );
			}
		});
		// Setup a progressBindings to update slides
		this.progressBindings.push( function( embedPlayer ){
			var maxInx = false;
			_this.$target.find( '.slideTagsContainer .slideTag' ).each(function(inx, slideTag){
				// add an extra .25 seconds buffer so that seeks don't result in jumping
				if( embedPlayer.currentTime + .25 > $( slideTag).data( 'videoTime' ) ){
					maxInx = $( slideTag).data( 'slideInx' );
				}
			});
			if( maxInx !== false ){
				_this.showSlide( maxInx );
			}
		});
	},
	addSlideTag: function( slideNum, videoTime ){
		var _this = this;
		// Get the left offset for the time:
		var sliderWidth = this.$target.find('.slideTagsContainer').width();
		var offsetLeft = parseInt( videoTime * ( sliderWidth / this.getEmbedPlayer().getDuration() ) );
		var slideInx = this.$target.find( '.slideTagsContainer .slideTag' ).length;
		this.$target.find( '.slideTagsContainer' ).append(
			$('<div />')
			.attr('id', this.getSlideTagId( slideInx) )
			.addClass( 'slideTag' )
			.css({
				'cursor' : 'pointer',
				'position' :'absolute',
				'top' : '1px',
				'left' : offsetLeft + 'px'
			})
			.data({
				'slideInx' : slideInx,
				'slideNum': slideNum,
				'videoTime' : videoTime
			})
			.click( function(){
				_this.activateTag( slideInx );
			})
			.append(
				$('<img />')
				.attr('src', this.getIconSrc( 'YelloTag') )
			)
		);
	},
	getSlideTagId:function( inx ){
		 return this.$target.attr('id') + '_slideTag_' + inx;
	},
	activateTag: function( inx ){
		var embedPlayer = this.getEmbedPlayer();
		var $tag = $( '#' + this.getSlideTagId( inx ) );
		var videoTime = $tag.data('videoTime');
		// Do video seek
		embedPlayer.doSeek( videoTime / embedPlayer.getDuration() );
		// Show the requested slide
		this.showSlide( inx );
	},
	showSlide: function( tagInx ){
		var _this = this;
		var $slideContainer = this.$target.find( '.slideTagsContainer' );
		// Make sure all tags are yellow:
		$slideContainer.find( '.slideTag' ).each( function( inx, node){
			$( node )
			.removeClass('activeTag')
			.find('img').attr( 'src', _this.getIconSrc( 'YelloTag' ) );
		});

		var $curTag = $('#' + this.getSlideTagId( tagInx) );
		// Make the current slide tag red:
		$curTag
		.addClass('activeTag')
		.find('img').attr('src', _this.getIconSrc( 'RedTag' ) );

		// Update the slide image
		var imageUrl = mw.getConfig('Kaltura.PPTWidgetSlidePath' ) + this.getDataEntryId() +
						'/' + $curTag.data( 'slideNum' ) + '.jpg';
		this.$target.find( '.pptWidgetScreenWrapper' ).empty().append(
			$('<img />')
			.css({
				'height':'100%'
			})
			.attr( 'src' , imageUrl )
		);

	},
	getIconSrc: function( iconId ){
		return 'data:image/png;base64,' + this.icons[ iconId ];
	},
	/**
	 * Get a timer with bindings
	 * @return
	 */
	getTimmer: function( node ){
		var _this = this;
		var $timer = $('<div />').css({
			'float': 'left',
			'text-align' : 'center',
			'color' : '#555',
			'font-size' : '12px',
			'font-weight' : '700',
			'font-family' : 'Arial, Helvetica, sans-serif',
			'width': $(node).attr('width') + 'px'
		});
		var timeFormat =  $(node).attr( 'format' );

		if( $(node).attr('timerType') == 'backwards' ){
			this.progressBindings.push( function( embedPlayer ){
				$timer.text(
					_this.formatTime( embedPlayer.duration - embedPlayer.currentTime, timeFormat)
				);
			});
		}
		// Both timer types are set to duration once player entry id is loaded:
		this.readyBindings.push( function( embedPlayer ){
			$timer.text(
				_this.formatTime( embedPlayer.getDuration(), timeFormat  )
			);
		});
		// Default to 0
		$timer.text(
			_this.formatTime( 0, timeFormat )
		);

		return $timer;
	},
	formatTime: function( seconds, format){
		if( ! seconds ){
			seconds = 0;
		}
		var tm = mw.seconds2Measurements( seconds );
		var formatParts = format.split( ':' );
		var leadZero = function( num ){
			if( parseInt( num ) < 10 )
				return '0' + num;
			return num;
		};
		// @@TODO We need to define what formatParts we need to parse: for now just do part count
		if( formatParts.length == 2 ){
			return leadZero( ( tm.days * 60 * 24 ) + ( tm.hours * 60 ) + tm.minutes ) + ':'
					+ leadZero( parseInt( tm.seconds ) );
		}
		if( formatParts.length == 3){
			return leadZero( ( tm.days * 24 ) + tm.hours ) + ':' + leadZero( tm.minutes ) + ':'
					+  leadZero( parseInt( tm.seconds ) );
		}
	},
	getEmbedPlayer: function(){
		return  $('#' + this.getEmbedPlayerId() )[0];
	},
	getEmbedPlayerId: function(){
		return this.playerId;
	},
	getPresentationData:function(){
		if( !this.$dataContent ){
			this.$dataContent = $( this.dataEntry.dataContent );
		}
		return this.$dataContent;
	},
	getEntryId: function(){
		// find the entry id from the dataEntry
		return this.getPresentationData().find( 'entryId' ).text();
	},
	getVideoTag: function(){
		var widgetId = this.$target[0].kwidgetid;

		return $('<video />').attr({
			'id' : this.getEmbedPlayerId(),
			'kentryid': this.getEntryId(),
			'kwidgetid' : widgetId,
			'controls' : 'false'
		});
	},
	evaluateProperty: function( objectString ){
		mw.log( "KPPTWidget: Eval:" + objectString );
		return objectString;
	}
};

} )( window.mw, window.jQuery );