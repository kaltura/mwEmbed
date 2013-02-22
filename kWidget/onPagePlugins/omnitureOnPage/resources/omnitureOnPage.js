kWidget.addReadyCallback( function( playerId ){
	/**
	 * The main omnitureOnPage object:
	 */
	var omnitureOnPage = function(kdp){
		return this.init(kdp);
	}
	omnitureOnPage.prototype = {
		init:function( kdp ){
			var _this = this;
			this.kdp = kdp;
			// Check for on-page s-code that already exists
			this.sCodeCheck(function(){
				_this.bindPlayer();
			})
		},
		bindPlayer: function(){
			this.kdp.kbind( 'doPlay', function(){
				
			})
			myvideo.addEventListener('play',myHandler,false);
			myvideo.addEventListener('seeked',myHandler,false);
			myvideo.addEventListener('seeking',myHandler,false);
			myvideo.addEventListener('pause',myHandler,false);
			myvideo.addEventListener('ended',myHandler,false);
			myvideo.addEventListener("playing", play, false);
			myvideo.addEventListener("mousedown", mouseDown, false);
			myvideo.addEventListener("mouseup", mouseUp, false);
		},
		
		normalizeAttrValue: function( attrValue ){
			// normalize flash kdp string values
			switch( attrValue ){
				case "null":
					return null;
				break;
				case "true":
					return true;
				break;
				case "false":
					return false;
				break;
			}
			return attrValue;
		},
		getAttr: function( attr ){
			return this.normalizeAttrValue(
				this.kdp.evaluate( '{' + attr + '}' )
			);
		},
		getConfig : function( attr ){
			return this.normalizeAttrValue(
				this.kdp.evaluate('{chaptersView.' + attr + '}' )
			);
		}
	}
	
	/**********************************
	 * Initialization of omnitureOnpage:
	 **********************************/
	new omnitureOnPage( document.getElmentById( playerId ) );
});
