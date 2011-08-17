/**
* Adds Power Point Widget Support
*/
( function( mw, $ ) {


mw.KPPTWidget = function(){
	this.init.apply( this, $.makeArray( arguments ) );
};
mw.KPPTWidget.prototype = {
	// The playerId
	playerId : null,
	
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
		this.$uiConf = $( uiConf );
		this.$target = $( widgetTarget );

		// update the playerId mapping: 
		this.playerId = this.$target.attr('id');
		this.$target.attr('id', this.playerId + '_pptContainer' );
		
		
		this.flashvar = $( widgetTarget ).data( 'flashvars' );
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
		
		// hack the layout with "fixed" layout for now: 
		this.addFixedLayout();
		// Update embed player
		this.$target.find( 'video' ).embedPlayer( function(){
			// Add bindings
			_this.addBindings();
			if( callback )
				callback();
		});
				
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
				'bottom' : $ControllerScreenHolder.attr( 'height' ),
				'position' : 'absolute',
				'left': '0px'
			})
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
			// Todo look up style based on 'styleName' attribute
			.css({
				'height' : $ControllerScreenHolder.attr( 'height' ),
				'position' : 'absolute',
				'bottom' : '0px',
				'left' : '0px',
				'right' : '0px',
				'background-color' : '#DDD',
				'background-image' : '-webkit-gradient(linear, left top, left bottom, from(#FFF), to(#CCC))',
				'background-image' : '-moz-linear-gradient(top, #FFF, #CCC)'
			})
		);
		// Check for Scrubber
		var $scrubContainer = $ControllerScreenHolder.find('#scrubberContainer');
		if( $scrubContainer.length ){
			this.addScrubber( this.$target.find( '.ControllerScreenHolder' ), $scrubContainer );
		}
		
		// Add the play and slide jump buttons
		this.getSyncPlayButtons( this.$target.find( '.ControllerScreenHolder' ), $ControllerScreenHolder )
		
	},
	getSyncPlayButtons: function( $target, $syncButtonsConfig){
		// Add a center div
		var $syncButtonsContainer = $('<div />').css({
				'position' : 'absolute',
				'top' : '20px',
				'left' : ( this.$target.width() / 2 )- 100,
				'width': '300px'
			})
			.addClass( 'syncButtonsContainer' )
		var baseButtonCss = {
			'cursor' : 'pointer',
			'position' : 'relative',
			'border' : 'solid thin #666',
			'-moz-border-radius' : '3px',
			'border-radius' : '3px',
			'margin' : '5px',
			'float' : 'left',
			'background-image' : '-webkit-gradient(linear, left top, left bottom, from(#FFF), to(#BBB))',
			'background-image' : '-moz-linear-gradient(top, #FFF, #BBB)'
		};
		// check for prev 
		$prvConf = $syncButtonsConfig.find('#syncPrevButton');
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
			)
		}
		
		// Check for play 
		$playConf =  $syncButtonsConfig.find('#playBtnControllerScreen')
		if( $playConf.length ){
			$syncButtonsContainer.append( 
				$('<div />')
				.css( baseButtonCss )
				.css({
					'width' : $playConf.attr('minWidth'),
					'height' : $playConf.attr('minHeight')
				})
				.append( 
					$('<img />').attr('src',  this.getIconSrc( 'PlayArrow' ) )
					.css({
						'position' : 'absolute',
						'top' : '8px',
						'left':'22px'
					})
				)
			)
		}
		
		// check for next 
		$nextConf = $syncButtonsConfig.find('#syncNextButton');
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
			)
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
		var baseSliderCss = {
			'width' : 'auto',
			'margin-left': '5px',
			'margin-right' : '10px'
		};
		$progressBar = $('<div />').css({
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
				'height' : '5px',
				'border' : 'solid thin #333',
				'background-color' : '#AAA',
				'background-image' : '-webkit-gradient(linear, left top, left bottom, from(#AAA), to(#666))',
				'background-image' : '-moz-linear-gradient(top, #AAA, #666)',
				'-moz-border-radius' : '3px',
				'border-radius' : '3px'
			})
		);
		return $progressBar;
	},
	addBindings: function(){
		var embedPlayer = $('#' + this.getEmbedPlayerId() ).get(0);
		// force duration 
		embedPlayer.duration = 30;
		// add some sample tags
		this.addSlideTag( 2 );
		this.addSlideTag( 10 );
		
		// Run any player ready bindings: 
		$.each( this.readyBindings, function(inx, readyCallback){
			readyCallback( embedPlayer );
		});
			
		// Setup the monitor bindings
		$( embedPlayer ).bind( 'monitorEvent', function(){
			$.each( this.progressBindings, function(inx, progressCallback){
				progressCallback( embedPlayer );
			});
		});
	},
	addSlideTag: function( time ){
		// Get the left offset for the time: 
		var sliderWidth = this.$target.find('.slideTagsContainer').width();
		var offsetLeft = parseInt( time * ( sliderWidth / this.getEmbedPlayer().getDuration() ) );
		this.$target.find( '.slideTagsContainer' ).append( 
			$('<div />').append( 
				$('<img />')
				.attr('src', this.getIconSrc( 'YelloTag') )
			)
			.css({
				'position' :'absolute',
				'top' : '1px',
				'left' : offsetLeft + 'px'
			})
			.click( function(){
				mw.log( 'seek to :' + time );
			})
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
					+ leadZero( tm.seconds );
		}
		if( formatParts.length == 3){
			return leadZero( ( tm.days * 24 ) + tm.hours ) + ':' + leadZero( tm.minutes ) + ':'
					+  leadZero( tm.seconds );
		}
	},
	getEmbedPlayer: function(){
		return  $('#' + this.getEmbedPlayerId() ).get(0);
	},
	getEmbedPlayerId: function(){
		return this.playerId;
	},
	getVideoTag: function(){
		// get entryId
		var entryId = this.flashvar[ 'videoPresentationEntryId' ];
		var widgetId = this.$target.get(0).kwidgetid;
		return $('<video />').attr({ 
			'id' : this.getEmbedPlayerId(),
			'kentryid': entryId,
			'kwidgetid' : widgetId
		});
	},
	evaluateProperty: function( objectString ){
		mw.log( "KPPTWidget: Eval:" + objectString );
		return objectString;
	}
};

} )( window.mw, jQuery );