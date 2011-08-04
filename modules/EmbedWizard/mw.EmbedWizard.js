/**
* EmbedWizard interface  
*/
( function( mw, $ ) {
	
	// Can be removed once we move to new resource loader:
	mw.includeAllModuleMessages();

	mw.setDefaultConfig( 'EmbedWizard.DefaultAttributes', {
		'poster': 'http://html5video.org/players/media/folgers.jpg',
		'width' : 400,
		'height': 300,
		'durationHint' : 60,
		'src' : [
		       'http://html5video.org/players/media/folgers.mp4',
		       'http://html5video.org/players/media/folgers.ogv',
		       'http://html5video.org/players/media/folgers.webm'
		]
	});
	
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
						$('<pre />')
						.addClass('brush: html')
						.css({
							'white-space' : 'pre-wrap !important',
							'width' : '90%',
							'height' : '400'
						})
					)
				);
		},
		updatePlayerCodePreview:function(){
			var _this = this;
			// Update the textarea: 
			this.$target.find( '.playerCodePreview pre' ).text(
				'<script type="text/javascript" src="http://html5.kaltura.org/js"></script>' + "\n" +
				$('<div />').append( 
					this.getTag()
				).html().replace( />/g, ">\n").replace( /" /g, "\"\n" )
			).syntaxHighlighter( function(){
				// hide the command_help button
				setTimeout(function(){
					_this.$target.find( '.toolbar' ).hide();
				},1000);
			});
			
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
				
				// Get the default tag setup:
				var defaultAttributes = mw.getConfig('EmbedWizard.DefaultAttributes');
				// Set all the defaults
				$.each(this.playerInputSet, function( inx, inputSet ) {
					$.each( inputSet.inputTypes, function( inputKey, inputObj ){
						inputObj.cb( _this, defaultAttributes[ inputKey ] );
					});
				});
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
			// Get the default tag setup:
			var defaultAttributes = mw.getConfig('EmbedWizard.DefaultAttributes');
			
			return $('<tr />').append(
						$('<td />').text(
							gM( 'mwe-embedwizard-' + key )
						),
						$('<td />').append(
							$('<input />').attr({
								'size' : conf.s,
								'type' : conf.type,
								'name' : key + inx,
								'value' : ( typeof defaultAttributes[key] == 'object' )? defaultAttributes[key][inx] : defaultAttributes[key]
							}).change( function(){
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
						'cb' : function(_this,  val ){
							_this.getTag().attr('width',  val);
						}
					},
					'height' : {
						's' : 4,
						'cb' : function( _this, val ){
							_this.getTag().attr('height', val);
						}
					}
				}				
			},
			'sources': {		
				'inputTypes': {
					'poster' : {
						's' : 15,
						'cb': function( _this, val ){
							_this.getTag().attr('poster', val );
						}
					},
					'durationHint': {
						's' : 4,
						'cb': function( _this, val ){
							_this.getTag().attr( 'durationHint', val );
						}
					},
					'src' : {
						'count' : 3,
						's' : 15,
						'cb' : function( _this, val, inx ){
							var setObj = {};
							if( ! inx )
								inx = 0;
							if( typeof val != 'object' ){
								setObj[ inx ]= val;
							}

							//console.log(jQuery(_this.getTag().find('source')[0]).attr('src', 'source'));
							//console.log(inx);
							$.each( val, function( i, valItem ){
								if( $( _this.getTag() ).find( 'source' )[i] ){
									$( _this.getTag() ).find( 'source' )[i];
									$( _this.getTag() ).find( 'source' )[i].attr('src', valItem );
								} else {
									$( '<source />' ).attr( 'src', valItem)
									.appendTo( _this.getTag() );
								}
							});
						}
					}
				}
			}
		}
	};
		
})( mw, window.jQuery );
