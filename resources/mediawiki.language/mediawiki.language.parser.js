/**
* Mediawiki language text parser for handling mediawiki style {{PLURAL}} i81n template substitution
* and basic [$1 link text] substitution.
*/

/**
* MediaWiki wikitext "Parser" constructor
*
* @param {String} wikiText the wikitext to be parsed
* @return {Object} parserObj returns a parser object that has methods:
*	getHtml() which returns the html representation of the text
*/
mediaWiki.language.parser = function( wikiText, options) {
	// return the parserObj
	this.init( wikiText, options );
};

mediaWiki.language.parser.prototype = {
	// The parser output string ( lazy init )
	'_htmlOutput': false,

	// The wiki text to be parsed ( required parameter of the constructor )
	'_wikiText' : '',

	// The default parser options
	'_defaultParserOptions' : {
		/**
		 * Name template processors ( like PLURAL, GENDER )
		 *
		 * Magic named templates are passed off to their associated function
		 *
		 * Dependent functions should be defined BEFORE the parser is included, or
		 * passed into the parser as part of the runtime options
		 */
		'templateProcessors' : {
			'PLURAL' :  mw.language.pluralProcessor
		}
	},

	// Internal parser options ( set via parserOptions argument and default parser options )
	'_options' : {},

	/**
	 * constructor
	 */
	'init' : function( wikiText, parserOptions ) {
		this._wikiText = wikiText;
		this.options = $.extend( this._defaultParserOptions, parserOptions);
	},

	/**
	 * Update the wiki text value and invalidate the cache
	 *
	 * @param {string} wikiText
	 * 		The wiki text string the parser works on.
	 */
	'updateText' : function( wikiText ) {
		this._wikiText = wikiText;

		// Invalidate the output ( will force a re-parse )
		this._htmlOutput = false;
	},

	/**
	 * Recursively parse out template:
	 *
	 * contains a few local scope helper functions:
	 */
	'parse': function() {
		var _this = this;

		// Setup local swap string constants
		var JQUERY_SWAP_STRING = 'ZjQuerySwapZ';
		var LINK_SWAP_STRING = 'ZreplaceZ';

		// Local scope functions for parser:

		/**
		 * Recurse through text and tokenize the open and close templates into "node" objects
		 */
		function recurseTokenizeNodes ( text ) {
			var node = { };
			mw.log( 'recurseTokenizeNodes:' + text );
			// Inspect each char
			for ( var a = 0; a < text.length; a++ ) {
				if ( text.charAt(a) == '{' && text.charAt(a + 1) == '{' ) {
					a = a + 2;
					node['parent'] = node;
					if ( !node['child'] ) {
						node['child'] = new Array();
					}

					node['child'].push( recurseTokenizeNodes( text.substr( a ) ) );
				} else if ( text.charAt(a) == '}' && text.charAt(a + 1) == '}' ) {
					a++;
					if ( !node['parent'] ) {
						return node;
					}
					node = node['parent'];
				}
				if ( !node['text'] ) {
					node['text'] = '';
				}
				// Don't put }} closures into output:
				if ( text.charAt(a) &&  text.charAt(a) != '}' ) {
					node['text'] += text.charAt(a);
				}
			}
			return node;
		}

		/**
		 * Parse template text as template name and named params
		 * @param {String} templateString Template String to be parsed
		 */
		function parseTemplateText( templateString ) {
			var templateObject = { };

			mw.log( 'parseTemplateText:' + templateString );

			// Get template name:
			templateName = templateString.split( '\|' ).shift() ;
			templateName = templateName.split( '\{' ).shift() ;
			templateName = templateName.replace( /^\s+|\s+$/g, "" ); //trim

			// Check for arguments:
			if ( templateName.split( ':' ).length == 1 ) {
				templateObject["name"] = templateName;
			} else {
				templateObject["name"] = templateName.split( ':' ).shift();
				templateObject["arg"] = templateName.split( ':' ).pop();
			}

			var paramSet = templateString.split( '\|' );
			paramSet.splice( 0, 1 );
			if ( paramSet.length ) {
				templateObject.parameters = new Array();
				for ( var pInx in paramSet ) {
					var paramString = paramSet[ pInx ];
					// check for empty param
					if ( paramString == '' ) {
						templateObject.parameters[ pInx ] = '';
						continue;
					}
					for ( var b = 0 ; b < paramString.length ; b++ ) {
						if ( paramString[b] == '=' && b > 0 && b < paramString.length && paramString[b - 1] != '\\' ) {
							// named param
							templateObject.parameters[ paramString.split( '=' ).shift() ] =	paramString.split( '=' ).pop();
						} else {
							// indexed param
							templateObject.parameters[ pInx ] = paramString;
						}
					}
				}
			}
			return templateObject;
		}

		/**
		 * Get template text using the templateProcesors
		 */
		function getTextFromTemplateNode( node ) {
			node.templateObject = parseTemplateText ( node.text );
			// Do magic swap if template key found in this.options.templateProcessors
			if ( node.templateObject.name in _this.options.templateProcessors ) {
				var nodeText = _this.options.templateProcessors[ node.templateObject.name ]( node.templateObject );
				return nodeText;
			} else {
				// don't swap just return text
				return node.text;
			}
		};

		/**
		 * recurse_magic_swap
		 *
		 * Go the inner most child first then swap upward:
		 */
		var parentNode = null;
		function recurse_magic_swap( node ) {
			if ( !parentNode )
				parentNode = node;

			if ( node['child'] ) {
				// swap all the children:
				for ( var i in node['child'] ) {
					var nodeText = recurse_magic_swap( node['child'][i] );
					// swap it into current
					if ( node.text ) {
						node.text = node.text.replace( node['child'][i].text, nodeText );
					}
					// swap into parent
					parentNode.text  = parentNode.text.replace( node['child'][i].text, nodeText );
				}
				// Get the updated node text
				var nodeText = getTextFromTemplateNode( node );
				parentNode.text = parentNode.text.replace( node.text , nodeText );

				// Return the node text
				return node.text;
			} else {
				return getTextFromTemplateNode( node );
			}
		}

		// Parse out the template node structure:
		this.parentNode = recurseTokenizeNodes ( this._wikiText );

		// Strip out the parent from the root
		this.parentNode['parent'] = null;

		// Do the recursive magic swap on the node structure
		this._htmlOutput = recurse_magic_swap( this.parentNode );

		// Do link swap
		this._htmlOutput = this._htmlOutput;
	},

	/**
	 * Returns the transformed wikitext
	 *
	 * Build output from swappable index
	 * 		(all transforms must be expanded in parse stage and linearly rebuilt)
	 *
	 * @@NOTE
	 * Alternatively we could build output using a place-holder & replace system
	 * 		(this lets us be slightly more sloppy with ordering and indexes, but probably slower)
	 *
	 * Ideal: we build a 'wiki DOM'
	 * 		When editing you update the data structure directly
	 * 		Then in output time you just go DOM->html-ish output without re-parsing the whole thing
	 */
	'getHTML': function() {
		// wikiText updates should invalidate _htmlOutput
		if ( ! this._htmlOutput ) {
			this.parse();
		}
		return this._htmlOutput;
	}
};