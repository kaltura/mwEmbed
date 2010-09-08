// Setup the jquery binding

/** 
* Define mw.PlayerThemer object:
* 
*  @@todo we need to do some updates to some mwEmbedPlayer bindings to make this work properly 
*   for now just target raw 'html5' 
*/
mw.PlayerThemer = function( themeContainer, options ) {
	return this.init( themeContainer, options);
}
mw.PlayerThemer.prototype = {
	/**
	 * Master Theme Config: 
	 */
	defaultComponentConfig: {
		/**
		 * Component config has the following items:
		 * 
		 * @@todo we need tighter integration with controlBuilder / remaping
		 * 
		 * 'selector' target selector
		 * 'visible' visible states:
		 * 	 'parent'[ default ] 'stop', 'playing', 'playerFocus', 'playerNoFocus' 
		 */
	
		'centerPlayButton': {			
			'show' : ['stop', 'paused'],
			'hide' : ['playing'],
			'doBind' : function( _this ){
				_this.$getCompoent( 'centerPlayButton' ).click(function(){
					// Fade away the button
					$j(this).fadeOut( 'fast' );
					_this.embedPlayer.play();
				})
			},
		},
		'widgetOverlay' : {
			'show' : ['stop', 'paused'],
			'hide' : ['playing']		
		},
		'bottomTitle' : {
			'show' : ['stop'],
			'customShow' : function( _this ){
				_this.$getCompoent('bottomTitle').show('slow');
			},
			'customHide' : function( _this ){
				_this.$getCompoent('bottomTitle').hide('slow');
			}
		},
		// The minimal control bar status
		'playControlMin' : {
			'show' : ['playing', 'playerNoFocus'],
			'hide' : ['stop', 'playerFocus'],
			'doBind' : function( _this ){
				// bind the progress bar
			}
		},
		// The full progress bar with sub components: 
		'playControlFull': {
			'show' : ['playerFocus'],
			'hide' : ['playerNoFocus'],
			'doBind' : function( _this ){
				// Bind the progress bar time and buffer update
				$j( _this.embedPlayer ).bind( 'updatePlayHeadPercent', function( event, perc ){		
					_this.$getCompoent( 'playHandle' ).css('left', ( perc * 100 ) + '%' );		
					_this.$getCompoent( 'playProgress' ).css('width', ( perc * 100 ) + '%' );					
				})
				$j( _this.embedPlayer ).bind('updateBufferPercent', function(event, perc ){
					_this.$getCompoent( 'bufferProgress' ).css('width', ( perc * 100 ) + '%' );
				});
			}
		},
		'playHandle' : {
			'show' : ['stop']
		},
		'bufferProgress' :{
			'show' : ['stop']
		},
		'playButton': {
			'show' : ['stop', 'paused'],
			'hide' : ['playing'],
			'doBind' : function( _this ){
				_this.$getCompoent( 'playButton' ).click(function(){
					_this.embedPlayer.play();
					_this.setDisplayState('playing');
				});
			}
		},
		'pauseButton' : {
			'show' : ['playing'],
			'hide' : ['paused', 'stop'],
			'doBind' : function( _this ){
				_this.$getCompoent( 'pauseButton' ).click(function(){
					_this.embedPlayer.pause();
					_this.setDisplayState('paused');
				})
			}	
		}		
		
	},
	// Stores a json config set of components ( setup at init ) 
	components: {},
	
	
	defaultConfig:{
		'classPrefix' : ''
	},
	config: {},	
	
	init: function( themeContainer, options){
		var _this = this;
		if( $j( themeContainer ).length == 0 ){
			mw.log("Error: PlayerThemer can't them empty target")
		}
		this.$target = $j( themeContainer );
		
		var playerId = this.$target.find('video').attr('id');
		if( !playerId ){
			playerId = 'vid_' + Math.random();
			this.$target.find('video').attr('id', playerId)
		}
		mw.load('EmbedPlayer', function(){
			_this.$target.find('video').embedPlayer(function(){
				// Bind to the embedPlayer library:
				_this.embedPlayer = $j('#' + playerId).get(0);				
				// Merge in the components 
				if(! options.components )
					 options.components = {};
				
				_this.components = $j.extend( true, _this.defaultComponentConfig, options.components);
				
				// Merge in config ( everything but the components ) 
				delete options.components;
				_this.config = $j.extend( true, _this.defaultConfig, options);
						
				// Rewrite the player with the 'stop' state 
				_this.setDisplayState( 'stop' );
				
				// Bind all buttons
				_this.bindActions();
				
				// Bind player events that update the interface
				_this.bindPlayerDisplayState();
				
				// Check for 'ready' callback
				if( options.ready ){			
					options.ready();
				}			
			})		
		})
	},
	/**
	 * return the query object of the component
	 */
	$getCompoent: function( componentId ){
		if( this.components[componentId] && this.components[componentId].selector ){
			return this.$target.find( this.components[componentId].selector );
		}
		// Return with classPrefix: 
		return this.$target.find( '.' + this.config.classPrefix + componentId );
	},
	
	/**
	 * Hide all the elements that are not part of the default state:
	 */
	setDisplayState:function( displayState ){
		_this = this;
		for( var componentId in this.components ){
			component = this.components[ componentId ];		
			if( $j.inArray( displayState, component.show ) != -1 ){
				// checkfor custom animation: 
				if( component.customShow ){
					component.customShow( _this );
				} else { 
					this.$getCompoent(componentId).show();
				}
			} 
			
			if( $j.inArray( displayState, component.hide ) != -1 ){
				if( component.customHide ){
					component.customHide( _this );
				} else {
					this.$getCompoent(componentId).hide();
				}
			}
		}
	},
	
	/**
	 * Set up player bindings for updating the interface
	 */
	bindPlayerDisplayState: function(){
		var _this = this;
		
		$j( this.embedPlayer ).bind('play', function(){
			_this.setDisplayState('playing')
		});
		
		$j( this.embedPlayer ).bind('paused', function(){
			_this.setDisplayState('paused');
		});
		
		$j( this.embedPlayer ).bind('ended', function(){
			_this.setDisplayState('ended');
		});
		
		// show stuff on player touch: 
		_this.$target.bind('touchstart', function() {
			_this.setDisplayState('playerFocus');	
		} );
		
		// 'player focus'
		var shouldDeFocus = true;		
		/*_this.$target.hoverIntent({
			'sensitivity': 4,
			'timeout' : 2000,
			'over' : function(){			
				_this.setDisplayState('playerFocus');
			},
			'out' : function(){
				_this.setDisplayState('playerNoFocus');
			}
		});	*/	
	},
	
	/**
	 * Binds all the button actions 
	 */
	bindActions: function(){
		var _this = this;
		$j.each(this.components, function(componentKey, component){
			if( component.doBind ){
				component.doBind( _this );
			}
		});
	},
	
}