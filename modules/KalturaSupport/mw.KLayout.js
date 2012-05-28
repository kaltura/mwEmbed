/**
* Adds flex style layout for HTML
*
* Should look at:
* http://developer.yahoo.com/flash/articles/flex-layout.html
*/
( function( mw, $ ) { "use strict";

mw.KLayout = function( options ){
	this.init( options );
};
mw.KLayout.prototype = {

	// Default length for titles
	titleLength: 45,

	// Default length for descriptions
	descriptionLength: 75,

	/**
	 *
	 * @param {Object} options
	 * 		'$layoutBox' {jQuery} top level layoutbox
	 * 		'embedPlayer' {optional} an embedPlayer object can be used for evaluate properties
	 * 		'evaluateCallback' {optional|Function} a callback overrides embedPlayer evaluate, should accept
	 * 									an evaluation string as an argument and return its value
	 * 		'getEmbedPlayerCallback' {function} a callback for displaying the player
	 * @return
	 */
	init: function( options ){
		var _this = this;
		var validOptions = ['$layoutBox', 'embedPlayer', 'evaluateCallback', 'getEmbedPlayerCallback',
		                    'titleLength', 'descriptionLength' ];
		$.each( validOptions, function(inx, optionName ){
			if( options[ optionName ] ){
				_this[ optionName ] = options[ optionName ];
			}
		});
	},
	getLayout: function( $uiConfBox ){
		if( !$uiConfBox ){
			$uiConfBox = this.$layoutBox;
		}
		var _this = this;
		var offsetLeft = 0;
		var $boxContainer = $('<div />');
		$j.each( $uiConfBox.children(), function( inx, boxItem ){
			var $node = $('<div />');
			switch( boxItem.nodeName.toLowerCase() ){
				case 'video':
					if( _this.getEmbedPlayerCallback ){
						$node.append(
							_this.getEmbedPlayerCallback()
						);
					}
					break;
				case 'img':
					var $node = $('<img />');
					break;
				case 'vbox':
				case 'hbox':
				case 'canvas':
					if( offsetLeft )
						$node.css('margin-left', offsetLeft );

					$node.append(
						_this.getLayout( $(boxItem) )
					);
					break;
				case 'spacer':
					// spacers do nothing for now.
					$node.css( 'display', 'inline' );
					break;
				case 'label':
				case 'text':
					var $node = $('<span />').css('display','block');
					break;
				default:
					// non layout item
					return [];
					break;
			}
			mw.log( "KLayout::getLayout > " + boxItem.nodeName.toLowerCase() );
			$node.addClass( boxItem.nodeName.toLowerCase() );
			if( $node && $node.length ){
				_this.applyUiConfAttributes( $node, boxItem);
				// add offset if not a percentage:
				if( $node.css('width').indexOf('%') === -1 ){
					offsetLeft+= $node.width();
				}
				// Box model! containers should not have width:
				if( $node[0].nodeName.toLowerCase() == 'div' ){
					$node.css('width', '');
				}
				$boxContainer.append( $node );
				// For hboxes add another div with the given height to block out any space represented by inline text types
				if(  boxItem.nodeName.toLowerCase() == 'hbox' ){
					$boxContainer.append(
						$("<div />").css( 'height', $node.css('height') )
					);
				}
			}
		});
		// Apply props to the outer box:
		this.applyUiConfAttributes( $boxContainer, $uiConfBox[0] );

		return $boxContainer;
	},
	applyUiConfAttributes:function( $target, confTag ){
		var _this = this;
		if( ! confTag ){
			return ;
		}
		var styleName = null;
		var idName = null;
		$.each( confTag.attributes, function( inx , attr){
			switch(  attr.nodeName.toLowerCase() ){
				case 'id':
					idName = attr.nodeValue;
					$target
						.data('id', idName)
						.addClass( idName );
					break;
				case 'stylename':
					styleName = attr.nodeValue;
					$target.addClass(styleName);
					break;
				case 'url':
					$target.attr('src',  _this.uiConfValueLookup( attr.nodeValue ) );
					break;
				case 'width':
				case 'height':
					var appendPx = '';
					if( attr.nodeValue.indexOf('%') == -1 ){
						appendPx= 'px';
					}
					$target.css( attr.nodeName, attr.nodeValue + appendPx );
					break;
				case 'paddingtop':
					$target.css( 'padding-top', attr.nodeValue);
					break;
				case 'paddingright':
					$target.css( 'padding-right', attr.nodeValue);
					break;
				case 'text':
					$target.text( _this.uiConfValueLookup( attr.nodeValue ) );
					break;
				case 'font':
					var str = attr.nodeValue;
					if( str.indexOf('bold') !== -1 ){
						$target.css('font-weight', 'bold');
						str = str.replace('bold', '');
					}
					var f = str.charAt(0).toUpperCase();
					$target.css('font-family', f + str.substr(1) );
					break;
				case 'x':
					$target.css({
						'left' :  attr.nodeValue
					});
					break;
				case 'y':
					$target.css({
						'top' :  attr.nodeValue
					});
					break;
			}
		});
		mw.log( "KLayout:: applyUiConfAttributes > style: " + styleName );
		// Styles enforce some additional constraints
		switch( styleName ){
			case 'itemRendererLabel':
			case 'alertBodyText':
				// XXX should use .playlist.formatTitle and formatDescription ( once we fix .playlist ref )
				// hack to read common description id ( no other way to tell layout size )
				if( idName == 'movieDescription' || idName =='irDescriptionIrScreen' || idName == 'irDescriptionIrText' ){
					$target.text( _this.formatDescription( $target.text() ) );
				} else{
					$target.text( _this.formatTitle( $target.text() ) );
				}
				break;
		}
	},
	uiConfValueLookup: function( objectString ){
		if( this.evaluateCallback ){
			return this.evaluateCallback( objectString );
		}
		// Else evaluate via embedPlayer:
		return this.embedPlayer.evaluate( objectString );
	},
	formatTitle: function( text ){
		if( text.length > this.titleLength )
			return text.substr(0, this.titleLength-3) + ' ...';
		return text;
	},
	formatDescription: function( text ){
		if( text.length > this.descriptionLength )
			return text.substr(0, this.descriptionLength-3) + ' ...';
		return text;
	}
};

} )( window.mw, jQuery );