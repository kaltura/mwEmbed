/**
 * Generates a miro subs config also see:
 * http://dev.universalsubtitles.org/widget/api_demo.html
 * <script type="text/javascript" src="mirosubs/mirosubs-api.min.js"></script>
 */
kWidget.addReadyCallback( function( playerId ){
	/**
	 * The main omnitureOnPage object:
	 */
	var miroSubsOnPage = function( player ){
		return this.init( player );
	}
	miroSubsOnPage.prototype = {
		instanceName: 'miroSubsOnPage',
		miroLoaded: false,
		init: function( player ){
			var _this = this;
			this.kdp = player;
			// on ready bind
			this.kdp.kBind('mediaReady', function(){
				if( $( '#' + _this.getConfig( 'targetInvokeEditor') ) ){
					$( '#' + _this.getConfig( 'targetInvokeEditor') ) .click(function(){
						_this.loadAndDisplayEditor();
					});
				}
			});
		},
		loadAndDisplayEditor: function(){
			var _this = this;
			// We always need to load the miro payload: 
			kWidget.appendScriptUrl( this.getBasePath() + 'mirosubs-api.min.js', function(){
				_this.mirosubs = mirosubs.api.openDialog( _this.getMiroConfig() );
			});
			// append css:
			kWidget.appendCssUrl( this.getBasePath() + 'media/css/mirosubs-widget.css' );
		},
		getBasePath:function(){
			return kWidget.getPath() + 'kWidget/onPagePlugins/miroSubsOnPage/mirosubs/';
		},
		getVideoURL: function(){
			var $iframe = $('#' + this.kdp.id + '_ifp').contents();
			return $iframe.find( '#' +  this.kdp.id)[0].getSource().getSrc();
		},
		getSubsInMiroFormat: function(){
			// here we should load existing subtitles: 
			return [{
				'subtitle_id': 'sub_' + 1,
				'text': 'my existing kaltura caption text',
				'sub_order': 1,
				'start_time': 1, // seconds
				'end_time': 10
			}];
		},
		getMiroConfig: function(){
			var _this = this;
			return {
				'username' : 'userName',
				'subtitles': _this.getSubsInMiroFormat(),
				// By default the config status is 'ok'
				'status' : 'ok',

				'closeListener': function(){
					// close event refresh page?
					// make sure any close dialog is 'closed'
					//mw.closeLoaderDialog();
					alert( 'close dialog');
				},
				'videoURL' : _this.getVideoURL(),
				'save': function( miroSubs, doneSaveCallback, cancelCallback) {
					alert( 'save subtitles');
					/*
					// Close down the editor
					doneSaveCallback();
					// Close the miro subs widget:
					_this.mirosubs.close();

					// Convert the miroSubs to srt
					// again strange issues with miroSubs give it time to close
					setTimeout( function(){
						var srtText = _this.miroSubs2Srt( miroSubs );
						$saveDialog = _this.getSaveDialogSummary( function( summary ){
							if( summary === false ){
								// Return to current page without saving the text
								location.reload(true);
								return ;
							}
							_this.saveSrtText( srtText, summary, function(status){
								// No real error handling right now
								// refresh page regardless of save or cancel

								if( status ){
									$saveDialog
									.dialog("option", 'title', gM('mwe-mirosubs-subs-saved') )
									.html( gM('mwe-mirosubs-thankyou-contribution') );
								} else {
									$saveDialog
									.dialog("option", 'title', gM('mwe-mirosubs-subs-saved-error') )
									.html( gM('mwe-mirosubs-subs-saved-error') );
								}
								// Either way the only button is OK and it refreshes the page:
								var button = {};
								button[ gM('mwe-ok') ] = function(){
									location.reload(true);
								};
								$saveDialog.dialog("option", "buttons", button );
							});
						});
					}, 100 );
					*/
				},
				'mediaURL': _this.getBasePath() + '/media/',
				'permalink': 'http://commons.wikimedia.org',
				// not sure if this is needed
				'login': function( ){
					 mirosubs.api.loggedIn( 'user name' );
				},
				'embedCode' : 'some code to embed'
			};
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
		bind: function( eventName, callback ){
			// postfix the instanceName to namespace all the bindings
			this.kdp.kBind( eventName + '.' + this.instanceName, callback );
		},
		getAttr: function( attr ){
			return this.normalizeAttrValue(
				this.kdp.evaluate( '{' + attr + '}' )
			);
		},
		getConfig : function( attr ){
			return this.normalizeAttrValue(
				this.kdp.evaluate( '{' + this.instanceName + '.' + attr + '}' )
			);
		}
	}
	/**********************************
	 * Initialization of miroSubsOnPage:
	 **********************************/
	new miroSubsOnPage( document.getElementById( playerId ) );
});
