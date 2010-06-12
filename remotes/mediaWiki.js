/**
 * This file exposes the functionality of mwEmbed to wikis
 * that do not yet have mwEmbed enabled
 */
var urlparts = getRemoteEmbedPath();
var mwEmbedHostPath = urlparts[0];
var mwRemoteVersion = 'r130';
var mwUseScriptLoader = true;

// Log the mwRemote version makes it easy to debug cache issues
if( window.console ){
	window.console.log( 'mwEmbed:remote:' + mwRemoteVersion );
}


// Setup up request Params: 
var reqParts = urlparts[1].substring( 1 ).split( '&' );
var mwReqParam = { };
for ( var i = 0; i < reqParts.length; i++ ) {
	var p = reqParts[i].split( '=' );
	if ( p.length == 2 ) {
		mwReqParam[ p[0] ] = p[1];
	}
}

// Check if debug mode and disable script grouping  
if( mwReqParam['debug'] ) {
	mwUseScriptLoader = false;
}

// Setup up some globals to wrap mwEmbed mw.ready and mw.setConfig functions

//Setup preMwEmbedReady queue
if( !preMwEmbedReady ){
	var preMwEmbedReady = [];
}
// Wrap mw.ready to preMwEmbedReady values
if( !mw.ready){
	mw.ready = function( fn ){
		preMwEmbedReady.push( fn );
	}
}
// Setup a preMwEmbedConfig var
if( ! preMwEmbedConfig ) {
	var preMwEmbedConfig = [];
}
if( !mw.setConfig ){
	mw.setConfig = function( set, value ){
		var valueQueue = {};
		if( typeof value != 'undefined' ) {			
			preMwEmbedConfig[ set	] = value;
		} else if ( typeof set == 'object' ){
			for( var i in set ){
				preMwEmbedConfig[ i ] = set[i];
			}
		}
	}
}


// Use wikibits onLoad hook: ( since we don't have js2 / mw object loaded ) 
addOnloadHook( function() {
	doPageSpecificRewrite();
} );


/**
* Page specific rewrites for mediaWiki
*/ 
function doPageSpecificRewrite() {
	// Deal with multiple doPageSpecificRewrite
	if( typeof window.ranMwRewrites != 'undefined'){
		return ;
	}
	window.ranMwRewrites = 'done';
	
	// Add media wizard
	if ( wgAction == 'edit' || wgAction == 'submit' ) {
		loadMwEmbed( [ 
			'mw.RemoteSearchDriver',
			'$j.fn.textSelection', 
			'$j.ui', 
			'$j.ui.sortable' 
		], function() {
			mw.load( mwEmbedHostPath + '/remotes/AddMediaWizardEditPage.js?' + mwGetReqArgs() );
		} );
		return ;
	}
	
	// Timed text display:
	if ( wgPageName.indexOf( "TimedText:" ) === 0 ) {
		if( wgAction == 'view' ){
			var orgBody = mwSetPageToLoading();
			//load the "player" ( includes call to  loadMwEmbed )
			mwLoadPlayer(function(){
				// Now load MediaWiki TimedText Remote:
				mw.load( 'RemoteMwTimedText',function(){
					//Setup the remote configuration
					var myRemote = new RemoteMwTimedText( {
						'action': wgAction,
						'title' : wgTitle,
						'target': '#bodyContent',
						'orgBody': orgBody
					});	
					// Update the UI
					myRemote.updateUI();
				} );
			} );
			return ;
		}
	}
	
	// Remote Sequencer
	if( wgPageName.indexOf( "Sequence:" ) === 0 ){		
		//console.log( 'spl: ' + typeof mwSetPageToLoading );
		// If on a view page set content to "loading" 
		mwSetPageToLoading();
		// Loading with loadMwEmbed not so big a deal since "sequencer is huge
		loadMwEmbed( function(){
			$j('#bodyContent').text ( 'Sequencer interface under development ');
			/*
			mw.load( 'Sequencer', function(){
				mw.load( 'RemoteMwSequencer', function(){
					mw.log('RemoteMwSequencer loaded' ); 
						var myRemote = new RemoteMwSequencer( {
							'action': wgAction,
							'title' : wgTitle,
							'target': '#bodyContent'
						});	
						// Update the UI
						myRemote.updateUI();
				} );
			} );
			*/
		} );
		return ;
	}
	
	
	// Upload page -> Firefogg / upload API / uploadWizard integration
	if ( wgPageName == "Special:Upload" ) {
		var scriptUrl = null;
		var scriptName = null;
		var libraries = [];		
		scriptName = 'uploadPage.js';
   		libraries = [
			'mw.UploadHandler',
			'mw.UploadInterface',
			'mw.Firefogg', 
			'$j.ui',
			'$j.ui.progressbar', 
			'$j.ui.dialog', 
			'$j.ui.draggable'
		];
		var scriptUrl = mwEmbedHostPath + '/remotes/' + scriptName + '?' + mwGetReqArgs();
		loadMwEmbed(libraries, function() { 
			mw.load( scriptUrl ) 
		} );
		return ;
	}
	
	// Special api proxy page
	if ( wgPageName == 'MediaWiki:ApiProxy' ) {
		var wgEnableIframeApiProxy = true;		
		loadMwEmbed( [ 'mw.ApiProxy' ], function() {
			mw.load( mwEmbedHostPath + '/remotes/apiProxyPage.js?' + mwGetReqArgs() );
		} );
		return ;
	}
	
	// Special api proxy page for nested callback of hash url
	// Can be replaced with: 
	if ( wgPageName == 'MediaWiki:ApiProxyNestedCb' ) {
		// Note top.mw.ApiProxy.nested frame needs to be on the same domain
		top.mw.ApiProxy.nested( window.location.href.split("#")[1] || false );	
		return ;
	}
		
	// OggHandler rewrite for view pages:
	var vidIdList = [];
	var divs = document.getElementsByTagName( 'div' );
	for ( var i = 0; i < divs.length; i++ ) {
		if ( divs[i].id && divs[i].id.substring( 0, 11 ) == 'ogg_player_' ) {
			vidIdList.push( divs[i].getAttribute( "id" ) );
		}
	}	
	if ( vidIdList.length > 0 ) {
		// Reverse order the array so videos at the "top" get swapped first:
		vidIdList = vidIdList.reverse();
		mwLoadPlayer( function(){
			//Load the "EmbedPlayer" module: 
			// All the actual code was requested in our single script-loader call 
			//  but the "load" request applies the setup.
			mw.load( 'EmbedPlayer', function() {
				// Do utility rewrite of OggHandler content:
				rewrite_for_OggHandler( vidIdList );
			} );
		} );	
		return ;
	}
	
	// IF we did not match any rewrite ( but we do have a ready function ) load mwEmbed
	if( preMwEmbedReady.length ){
		loadMwEmbed( function(){
			// mwEmbed loaded
		});
	}	
}
/*
* Sets the mediaWiki content to "loading" 
*/
function mwSetPageToLoading(){
	importStylesheetURI( mwEmbedHostPath + '/skins/mvpcf/EmbedPlayer.css?' + mwGetReqArgs() );
	var body = document.getElementById('bodyContent');
	var oldBodyHTML = body.innerHTML;
	body.innerHTML = '<div class="loadingSpinner"></div>';
	return oldBodyHTML;
}
/**
* Similar to the player loader in /modules/embedPlayer/loader.js
* ( front-loaded to avoid extra requests )
*/
function mwLoadPlayer( callback ){

	// The jsPlayerRequest includes both javascript and style sheets for the embedPlayer 
	var jsPlayerRequest = [	 
		'mw.style.mwCommon',	                       
		'mw.EmbedPlayer', 
		'mw.style.EmbedPlayer',
		'$j.ui', 
		'mw.PlayerControlBuilder', 
		'$j.fn.hoverIntent',		
		'$j.cookie', 
		'JSON',
		'$j.ui.slider', 
		
		'mw.PlayerSkinKskin',
		'mw.style.PlayerSkinKskin',
		
		'$j.fn.menu',
		'mw.style.jquerymenu',
		
		// Timed Text module
		'mw.TimedText',
		'mw.style.TimedText',
		
		// mwSwarmTransport module
		'mw.SwarmTransport'
		
	];		
	// Quick sniff use java if IE and native if firefox 
	// ( other browsers will run detect and get on-demand )
	if (navigator.userAgent.indexOf("MSIE") != -1){
		jsPlayerRequest.push( 'mw.EmbedPlayerJava' );
	}
		
	if ( navigator.userAgent &&  navigator.userAgent.indexOf("Firefox") != -1 ){
		jsPlayerRequest.push( 'mw.EmbedPlayerNative' );
	}
	
	loadMwEmbed( jsPlayerRequest, function() {
		callback();
	});
}

/**
* This will be depreciated when we update to OggHandler
* @param {Object} vidIdList List of video ids to process
*/
function rewrite_for_OggHandler( vidIdList ) {
	function procVidId( vidId ) {		
		// Don't process empty vids
		if ( !vidId ){
			return ;
		}			
			
		tag_type = 'video';
				
		// Check type:
		var pwidth = $j( '#' + vidId ).width();
		var $pimg = $j( '#' + vidId + ' img:first' );
		var imgSring = $pimg.attr('src').split('/').pop();		
		if(  $pimg.attr('src') &&  imgSring == 'play.png' || imgSring == 'fileicon-ogg.png' ){
			tag_type = 'audio';
			poster_attr = '';		
			pheight = 0;
		}else{
			var poster_attr = 'poster = "' + $pimg.attr( 'src' ) + '" ';
			var pheight = $pimg.attr( 'height' );
		}
		
		// Parsed values:
		var src = '';
		var duration_attr = '';
		var rewriteHTML = $j( '#' + vidId ).html();
		
		if( rewriteHTML == ''){
			mw.log( "Error: empty rewrite html" );
			return ;
		}else{
			//mw.log(" rewrite: " + rewriteHTML + "\n of type: " + typeof rewriteHTML);
		}		
		var re = new RegExp( /videoUrl(&quot;:?\s*)*([^&]*)/ );
		src = re.exec( rewriteHTML )[2];

		var apiTitleKey = src.split( '/' );
		apiTitleKey = decodeURI( apiTitleKey[ apiTitleKey.length - 1 ] );

		var re = new RegExp( /length(&quot;:?\s*)*([^,]*)/ );
		var dv = parseFloat( re.exec( rewriteHTML )[2] );
		duration_attr = ( dv )? 'durationHint="' + dv + '" ': '';

		var re = new RegExp( /offset(&quot;:?\s*)*([^,&]*)/ );
		offset = re.exec( rewriteHTML );
		var offset_attr = ( offset && offset[2] )? 'startOffset="' + offset[2] + '" ' : '';
		
		// Check if file is from commons and therefore should explicitly set apiProvider to commons: 
		var apiProviderAttr = ( src.indexOf( 'wikipedia\/commons' ) != -1 )?'apiProvider="commons" ': '';		
		
		// If in a gallery box we will be displaying the video larger in a lightbox
		if( $j( '#' + vidId ).parents( '.gallerybox' ).length ){
			// Update the width to 400 and keep scale
			pwidth = 400;
			if( pheight != 0 ) {
				pheight = pwidth * ( $j( '#' + vidId ).height() / $j( '#' + vidId ).width() );
			}			
		}
		
		if ( src ) {
			var html_out = '';
			
			var common_attr = ' id="mwe_' + vidId + '" ' +
				'apiTitleKey="' + apiTitleKey + '" ' +
				'src="' + src + '" ' + 
				apiProviderAttr + 
				duration_attr +
				offset_attr + ' ' +
				'class="kskin" ';
								
			if ( tag_type == 'audio' ) {
				if( pwidth < 250 ){
					pwidth = 250;
				}
				html_out = '<audio' + common_attr + ' ' +
						'style="width:' + pwidth + 'px;height:0px;"></audio>';
			} else {
				html_out = '<video' + common_attr +
				poster_attr + ' ' +
				'style="width:' + pwidth + 'px;height:' + pheight + 'px;">' +
				'</video>';
			}
			
					
			// If the video is part of a "gallery box" use light-box linker instead
			if( $j( '#' + vidId ).parents( '.gallerybox' ).length ){				
				$j( '#' + vidId ).after(
					 $j( '<div />')
					.css( { 
						'width' : $pimg.attr('width' ), 
						'height' :$pimg.attr( 'height' ),
						'position' : 'relative'
					})
					.addClass( 'k-player' )
					.append(
						// The poster image 
						$j( '<img />' )
						.css( {
							'width' : '100%',
							'height' : '100%'
						})
						.attr( 'src', $pimg.attr('src') ),
						
						// A play button:
						$j( '<div />' )
						.css( {
							'position' : 'absolute',
							'top' : ( parseInt( $pimg.attr( 'height' ) ) /2 ) -25,
							'maring-left' : 'auto',
							'maring-right' : 'auto'
						}) 
						
						.addClass( 'play-btn-large' )
						.buttonHover()
						.click( function(){		
							var _this = this;
									
							var dialogHeight = ( pheight == 0 	)? 175 :
												( pheight - 25 );
							var buttons = {};
							buttons[ gM( 'mwe-ok' ) ] = function(){
								var embedPlayer = $j( '#mwe_' + $j( _this ).data( 'playerId' ) ).get(0);
								// stop the player ( more healthy way to remove the video from the dom )
								if( embedPlayer ) {
									embedPlayer.stop();
								}
								// close the dialog
								$j(this).dialog( 'close' ).remove();
							};
							mw.addDialog( 					
								decodeURIComponent( apiTitleKey.replace(/_/g, ' ') ),
								html_out,
								buttons
							)
							// Dialog size setup is a bit strange:							
							.css( {
								'height' : dialogHeight + 'px'
							})
							.parent().css( {
								// we hard code the default resolution to 400 above
								'width' : '435px',							
							} )							
							
							// Update the embed code to use the mwEmbed player: 		
							$j( '#mwe_' + vidId ).embedPlayer( function(){								
								var embedPlayer = $j( '#mwe_' + vidId ).get(0);
								embedPlayer.play();
								// Show the control bar for two seconds (auto play is confusing without it )
								embedPlayer.controlBuilder.showControlBar();
								// hide the controls if they should they are overlayed on the video
								if( embedPlayer.controlBuilder.checkOverlayControls() ){
									setTimeout( function(){												
										embedPlayer.controlBuilder.hideControlBar();
									}, 4000 ); 
								}
							});															
						})						
					)			
				).remove();
					
			} else {
				// Set the video tag inner html remove extra player
				$j( '#' + vidId ).after( html_out ).remove();		
				$j( '#mwe_' + vidId ).embedPlayer();	 
			}			

			// Issue an async request to rewrite the next clip
			if ( vidIdList.length != 0 ) {
				setTimeout( function() {					
					procVidId( vidIdList.pop() )
				}, 1 );
			}
		}		
	};
	// Process current top item in vidIdList
	procVidId( vidIdList.pop() );
}

/**
* Get the remote embed Path
*/
function getRemoteEmbedPath() {
	//debugger;
	for ( var i = 0; i < document.getElementsByTagName( 'script' ).length; i++ ) {
		var s = document.getElementsByTagName( 'script' )[i];
		if ( s.src.indexOf( '/mediaWiki.js' ) != - 1 ) {
			var reqStr = '';
			var scriptPath = '';
			if ( s.src.indexOf( '?' ) != - 1 ) {
				reqStr = s.src.substr( s.src.indexOf( '?' ) );
				scriptPath = s.src.substr( 0,  s.src.indexOf( '?' ) ).replace( '/mediaWiki.js', '' );
			} else {
				scriptPath = s.src.replace( '/mediaWiki.js', '' )
			}
			// Use the external_media_wizard path:
			return [scriptPath + '/..', reqStr];
		}
	}
}

/**
* Get the request arguments
*/ 
function mwGetReqArgs() {
	var rurl = '';
	if ( mwReqParam['debug'] ){
		rurl += 'debug=true&';
	}

	if ( mwReqParam['uselang'] ){
		rurl += 'uselang=' + mwReqParam['uselang'] + '&';
	}

	if ( mwReqParam['urid'] ) {
		rurl += 'urid=' + mwReqParam['urid'];
	} else {
		// Make sure to use an urid 
		// This way remoteMwEmbed can control version of code being requested
		rurl += 'urid=' + mwRemoteVersion;
	}
	return rurl;
}

/**
* Load the mwEmbed library:
*
* @param {mixed} function or classSet to preload
* 	classSet saves round trips to the server by grabbing things we will likely need in the first request. 
* @param {callback} function callback to be called once mwEmbed is ready
*/
function loadMwEmbed( classSet, callback ) {	
	if( typeof classSet == 'function') {
		callback = classSet;
	}	
	// Inject mwEmbed if needed
	if ( typeof MW_EMBED_VERSION == 'undefined' ) {
		if ( mwUseScriptLoader ) {
			var rurl = mwEmbedHostPath + '/jsScriptLoader.php?class=';
			
			var coma = '';
			// Add jQuery too if we need it: 
			if ( typeof window.jQuery == 'undefined' ) {
				rurl += 'window.jQuery';
				coma = ',';
			}	
			// Add Core mwEmbed lib ( if not already defined )
			if( typeof MW_EMBED_VERSION == 'undefined' ){ 
				rurl += coma + 'mwEmbed';
				coma = ',';
			}
								
			// Add requested classSet to scriptLoader request
			for( var i=0; i < classSet.length; i++ ){
				var cName =  classSet[i];
				if( !mwCheckObjectPath( cName ) ){
					rurl +=  ',' + cName;
				}
			}
			
			// Add the remaining arguments
			rurl += '&' + mwGetReqArgs();
			importScriptURI( rurl );
		} else { 
			// load mwEmbed js
			importScriptURI( mwEmbedHostPath + '/mwEmbed.js?' + mwGetReqArgs() );
			
			// Load the class set as part of mwReady callback
			var instanceCallback = callback;
			var callback = function(){
				mw.load( classSet, function(){
					instanceCallback();
				})
			}
			
		}
	}
	waitMwEmbedReady( callback );
}

/**
* Waits for mwEmbed to be ready
* @param callback
*/
function waitMwEmbedReady( callback ) {
	if( ! mwCheckObjectPath( 'mw.version' ) ){
		setTimeout( function() {
			waitMwEmbedReady( callback );
		}, 10 );
	} else {
		// Make sure mwEmbed is "setup" by using the addOnLoadHook: 
		mw.ready( function(){
			callback();
			
			// All enabled pages should check if we have the gadget already installed 
			// if not offer a convenient button
			mwCheckForGadget();
		})
	}
}
/**
 * Check if the gadget is installed 
 * run after mwEmbed setup so $j and mw interface is available: 
 */
function mwCheckForGadget(){
	//mw.log('mwCheckForGadget');	
	if( $j('#mwe-gadget-button').length != 0){
		//Gadget button already in dom
		return false;
	}
	
	
	var scripts = document.getElementsByTagName( 'script' );
	
	// Check for document paramater withJS and ignore found gadget
	if( typeof getParamValue == 'undefined' && typeof getURLParamValue == 'undefined'){
		return false;
	}
		
	for( var i = 0 ; i < scripts.length ; i++ ){
		if (
			scripts[i].src 
			&& scripts[i].src.indexOf( 'MediaWiki:Gadget-mwEmbed.js' ) !== -1 
		){
			//mw.log( 'gadget already installed: ' + scripts[i].src );
			// Gadget found / enabled
			return false;
		}		
	}
	
	// No gadget found add enable button: 
	mw.log('gadget not installed, show install menu');	
	var $gadgetBtn = $j.button({
			'text' : gM( 'mwe-enable-gadget' ),
			'icon_id': 'check'
		})
		.css({
			'font-size': '90%'
		})
		.buttonHover()
		.click(function (){
			if( !wgUserName ){
				$j( this )
				.after( gM('mwe-must-login-gadget', 
					wgArticlePath.replace(
						'$1', 'Special:UserLogin?returnto=' + wgPageName ) )
					)
				.remove();
				return false;
			}
			
			// Else Add loader
			$j( this )
			.after( 
				$j('<div />')
				.attr( 'id', 'gadget-form-loader' )
				.loadingSpinner() 
			)
			.remove();
			// Load gadgets form:
			mwSubmitGadgetPref( 'mwEmbed' );
			
			// return false to not follow link
			return false;
		} );
		
	// Add the $gadgetBtn before the first heading: 
	$j('#firstHeading').before(
		$j('<div />')
		.attr('id','mwe-gadget-button')
		.css({
			'margin': '10px'
		}).html(	
			$gadgetBtn
		)
	);
}
function mwSubmitGadgetPref( gadget_id ){
	$j.get( wgArticlePath.replace('$1', 'Special:Preferences'), function( pageHTML ){
		// get the form	
		var form = mwGetFormFromPage ( pageHTML );
		if(!form){
			return false;
		}
		if( mwCheckFormDatagadget( form.data, gadget_id ) ){
			mw.log( gadget_id + ' is already enabled' );
			return false;
		}
		
		// add mwEmbed to the formData 
		form.data.push( {
			'name' : 'wpgadgets[]',
			'value' : gadget_id
		} );
				
		// Submit the preferences
		$j.post( form.url, form.data, function( pageHTML ){
			var form = mwGetFormFromPage ( pageHTML );
			if(!form){
				return false;
			}
			if( mwCheckFormDatagadget(form.data, gadget_id ) ){
				//update the loader
				$j('#gadget-form-loader')
				.text( gM( 'mwe-enable-gadget-done' ) );
			}
		} )
	})
}
function mwGetFormFromPage( pageHTML ){
	var form = {};
	$j( pageHTML ).find('form').each( function( ){
		form.url = $j( this ).attr('action');
		if( form.url.indexOf( 'Special:Preferences') !== -1 ){
			form.data =  $j( this ).serializeArray();
			// break out of loop
			return false;
		}
	});
	if( form.data )
		return form;
	mw.log("Error: could not get form data");
	return false;
}
function mwCheckFormDatagadget( formData, gadget_id ){
	for(var i =0; i < formData.length ; i ++ ){
		if( formData[i].name == 'wpgadgets[]' ){
			if( formData[i].value == gadget_id ){
				return true;
			}
		}	
	}	
	return false;
}

/**
* Checks an object path to see if its defined
* @param {String} libVar The objectPath to be checked
*/
function mwCheckObjectPath ( libVar ) {
	if ( !libVar )
		return false;
	var objPath = libVar.split( '.' )
	var cur_path = '';
	for ( var p = 0; p < objPath.length; p++ ) {
		cur_path = ( cur_path == '' ) ? cur_path + objPath[p] : cur_path + '.' + objPath[p];
		eval( 'var ptest = typeof ( ' + cur_path + ' ); ' );
		if ( ptest == 'undefined' ) {
			this.missing_path = cur_path;
			return false;
		}
	}
	this.cur_path = cur_path;
	return true;
};
