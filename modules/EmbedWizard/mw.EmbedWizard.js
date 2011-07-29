/**
* EmbedWizard interface  
*/
( function( mw, $ ) {
	
	// can be removed once we move to new resource loader:
	mw.includeAllModuleMessages();
	
	
	mw.EmbedWizard = function( target, options ){
		return this.init( target, options );
	};
	mw.EmbedWizard.prototype = {
		init: function( target, options ){
			var _this = this;
			this.$target = $( target );
			// direct mapping of options to EmbedWizard prototype
			for(var i in options){
				this[i] = options[i];
			}
			this.drawUi();
		},
		drawUi :function(){
			// get the two main interface components
			this.$target.append(
				this.getPlayerInputs(),
				this.getPlayerCodePreivew()
			);
			$('.playerInputs')
				.css({
					'float' : 'left',
					'width' : '40%',
					'height' : '100%'
				})
				.accordion({
					fillSpace: true
				});
			$('.playerCodePreview')
				.css({
					'float' : 'left',
					'margin-left': '5px',
					'width' : '58%',
					'height' : '98%'
				})
				.tabs();
			
			this.updatePlayerCodePreview();
		},
		getPlayerCodePreivew: function(){
			return $('<div />')
				.addClass('playerCodePreview')
				.append(
					$('<ul />').append(
						$('<li />').append(
								$('<a />')
									.attr( 'href', '#mweew-tab-player' )
									.text( gM('mwe-embedwizard-player') )
						),
						$('<li />').append(
							$('<a />')
								.attr( 'href', '#mweew-tab-code' )
								.text( gM('mwe-embedwizard-embedcode') )
						)
					),
					$('<div />').attr('id', 'mweew-tab-player').append(
						$('<p />').text( gM('mwe-embedwizard-player-desc')),
						$('<div />')
							.addClass("videoContainer")
							.css('overflow', 'hidden')
						
					),
					$('<div />').attr('id', 'mweew-tab-code').append(
						$('<p />').text( gM('mwe-embedwizard-embedcode-desc') ),
						$('<textarea />')
						.css({
							'width' : '90%',
							'height' : '40%'
						})
					)
				);
		},
		updatePlayerCodePreview:function(){
			// update the textarea: 
			this.$target.find('.playerCodePreview textarea').val(
				'<script type="text/javascript" src="http://html5.kaltura.org/js"></script>' + 
				$('<div />').append( 
					this.getTag()
				).html()
			);
			this.$target.find('.videoContainer').empty().append(
				this.getTag()
			);
			this.getTag().embedPlayer();
		},
		getPlayerInputs: function(){
			if( this.$target.find( '.playerInputs').length == 0 ){
				this.$target.append(
					this.getPlayerInputSet()
						.addClass('playerInputs')
				);
			}
			return this.$target.find( '.playerInputs' );
		},
		getPlayerInputSet: function(){
			var _this = this;
			var $pSet = $('<div />');
			$.each( this.playerInputSet, function( inputKey, inputObject ){
				$pSet.append(
					$('<h3 />').append( 
						$('<a />')
						.attr('href','#')
						.text( gM('mwe-embedwizard-' + inputKey + '-title' ) )
					),
					$('<div />').append(
						$('<p />').html( gM('mwe-embedwizard-' + inputKey + '-desc' ) ),
						_this.getInputSet( inputObject )
					)
				);	
			});
			// make sure links point to a new target:
			$pSet.find('a').attr('target', '_new');
			return $pSet;
		},
		/**
		 * Gets the master tag we use for building out the player embed
		 */
		getTag: function(){
			var _this = this;
			if( ! _this.$media ){
				_this.$media = $('<video />');
				// Set all the defaults
				$.each(this.playerInputSet, function( inx, inputSet ) {
					$.each( inputSet.inputTypes, function( inputKey, inputObj ){
						inputObj.cb( _this, inputObj.d );
					});
				});
				/*
				var sizePosterInput = this.playerInputSet.sizeposter.inputTypes
				// TODO replace with a loop over default values
				var poster =  sizePosterInput.poster.d;
				if( poster )
					_this.$media.attr('poster', poster);
				
				var width =  sizePosterInput.width.d;
				if( width )
					_this.$media.css('width', width);
				
				var height =  sizePosterInput.height.d;
				if( width )
					_this.$media.css('height', height);
				
				var sourcesObj = this.playerInputSet.sources.inputTypes.src; 
				for(var i = 0 ; i < sourcesObj.count; i++){
					_this.$media.append(
						$('<source />').attr('src', sourcesObj.d[i] )
					);
				} */
			}
			return _this.$media;
		},
		getInputSet: function( inputObject ){
			var _this = this;
			var $inputSet = $( '<table />' ).addClass( 'playerInput' );
			$.each( inputObject.inputTypes, function( key, conf){
				var inputConf = $.extend( {}, _this.defaultInputConf, conf );
				// check if we need to duplicate the input set
				for( var i=0; i < inputConf.count; i++){
					$inputSet.append(
						_this.getInputRow( key, inputConf, i )
					);
				}
			});

			return $inputSet;
		},
		getInputRow:function( key, conf, inx ){
			var _this = this;
			
			return $('<tr />').append(
						$('<td />').text(
							gM( 'mwe-embedwizard-' + key )
						),
						$('<td />').append(
							$('<input />').attr({
								'size' : conf.s,
								'type' : conf.type,
								'name' : key + inx,
								'value' : ( typeof conf.d == 'object' )? conf.d[inx] : conf.d
							}).change(function(){
								conf.cb( _this, $(this).val(), inx );
								_this.updatePlayerCodePreview();
							})
						)
					);
		},
		/**
		 * Defines the default input type and all its settings:
		 */
		defaultInputConf: {
			'count' : 1,
			's' : 10,
			'type' :'text',
			'cb' : function( _this, val ){
				_this.getTag().attr( key, val );
			}
		},
		playerInputSet: {
			'size': {
				'inputTypes': {
					'width' : {
						's' : 4,
						'd' : 400,
						'cb' : function(_this,  val ){
							_this.getTag().css('width',  val);
						}
					},
					'height' : {
						's' : 4,
						'd' : 300,
						'cb' : function( _this, val ){
							_this.getTag().css('height', val);
						}
					}
				}				
			},
			'sources': {		
				'inputTypes': {
					'poster' : {
						's' : 10,
						'd' : 'http://html5video.org/players/media/folgers.jpg',
						'cb':function( _this, val){
							_this.getTag().attr('poster', val );
						}
					},
					'src' : {
						'count' : 3,
						'd' : [
						       'http://html5video.org/players/media/folgers.mp4',
						       'http://html5video.org/players/media/folgers.ogv',
						       'http://html5video.org/players/media/folgers.webm'
						],
						's' : 10,
						'cb' : function( _this, val, inx ){
							var setObj = {};
							if( ! inx )
								inx = 0;
							if( typeof val != 'object' ){
								setObj[ inx ]= val;
							}
							//_this.getTag().find('source').gt(inx).attr('src', val );
							//console.log(jQuery(_this.getTag().find('source')[0]).attr('src', 'source'));
							//console.log(inx);
							$.each( val, function( i, valItem ){
								if( $(_this.getTag() ).find('source')[i] ) ){
									$( _this.getTag() ).find( 'source' )[i];
									debugger;
									$( _this.getTag() ).find( 'source' )[i].attr('src', valItem );
								} else {
									$( '<source />' ).attr( 'src', valItem).appendTo( _this.getTag() );
								}
							});
						}
					}
				}
			}
		}
	};
		
})( mw, window.jQuery );
