( function( mw, $ ) {"use strict";

mw.PlaylistHandlerKaltura = function( playlist, options ){
	return this.init( playlist, options );
};
// For players playlist that don't have layout information
mw.setConfig('KalturaSupport.PlaylistDefaultItemRenderer', '<hbox id="irCont" height="100%" width="100%" x="10" y="10" verticalalign="top" stylename="Button_upSkin_default"> <img id="irImageIrScreen" url="{this.thumbnailUrl}" source="{this.thumbnailUrl}" height="48" width="72"> <vbox height="100%" width="100%" id="labelsHolder" verticalgap="0"> <hbox id="nameAndDuration" width="100%" height="18"> <label id="irLinkIrScreen" height="18" width="100%" text="{this.name}" stylename="itemRendererLabel" label="{this.name}" prefix="" font="Arial"></label> <label id="irDurationIrScreen" height="18" width="70" text="{formatDate(this.duration, \'NN:SS\')}" stylename="itemRendererLabel" prefix="" font="Arial"></label> </hbox> <label id="irDescriptionIrScreen" width="240" height="18" text="{this.description}" stylename="itemRendererLabel" prefix="" font="Arial"></label> </vbox> </hbox>');

mw.PlaylistHandlerKaltura.prototype = {

	clipList: null,
	widget_id: null,
	playlist_id: null,
	mrssHandler: null,

	playlistSet : [],

	titleHeight : 0, // Kaltura playlist include title via player ( not playlist )

	// ui conf data
	$uiConf : null,
	includeInLayout: true,

	// flag to store the current loading entry
	loadingEntry: null,

	bindPostFix: '.playlistHandlerKaltura',

	// store any playlist loading errors:
	errorMsg: null,

	init: function ( playlist, options ){
		this.playlist = playlist;
		// set all the options:
		for( var i in options){
			this[i] = options[i];
		}
	},
	getConfig: function( key ){
		return this.playlist.embedPlayer.getKalturaConfig( 'playlistAPI', key );
	},
	loadPlaylist: function ( callback ){
		var _this = this;
		var embedPlayer = this.playlist.embedPlayer;
		var $uiConf = embedPlayer.$uiConf;

		mw.log( "mw.PlaylistHandlerKaltura:: loadPlaylist > ");

		// check if we have playlist data
		if( !embedPlayer.kalturaPlaylistData ) {
			mw.log('Error: no playlists were found in embedPlayer.kalturaPlaylistData.');
			return false;
		}

		_this.playlistSet = [];
		// Populate playlist set with kalturaPlaylistData
		for (var playlistId in embedPlayer.kalturaPlaylistData ) {
		    if (embedPlayer.kalturaPlaylistData.hasOwnProperty(playlistId)) {
		       _this.playlistSet.push( embedPlayer.kalturaPlaylistData[ playlistId ] );
		    }
		}
		// Check if we have playlists
		if( _this.playlistSet.length == 0 ){
			mw.log( "Error: could not find any playlists." );
			return false;
		}		

		var plConf = _this.playlist.embedPlayer.getKalturaConfig(
				'playlist',
				[ 'includeInLayout', 'width', 'height' ]
		);
		// Check for autoContinue
		_this.autoContinue = _this.getConfig( 'autoContinue' );
		mw.log("mw.PlaylistHandlerKaltura::loadPlaylist > autoContinue: " + _this.autoContinue );

		// Set autoPlay
		_this.autoPlay =_this.getConfig( 'autoPlay' );

		// Check for loop
		_this.loop =_this.getConfig( 'loop' );

		// Set width:
		_this.videolistWidth = ( plConf.width )?  plConf.width : $uiConf.find('#playlist').attr('width');

		// Set height:
		_this.videolistHeight = ( plConf.height )?  plConf.height : $uiConf.find('#playlist').attr('height');

		if( plConf.includeInLayout === false || parseInt( $uiConf.find( '#playlistHolder' ).attr('width') ) == 0 ){
			_this.includeInLayout = false;
		} else if( parseInt( _this.videolistWidth ) == 0 ){
			_this.videolistWidth  = 250;
		}

		// Store all the playlist item render information:
		_this.$playlistItemRenderer = $uiConf.find('#playlistItemRenderer');
		if( _this.$playlistItemRenderer.children().length == 0  ){
			// No layout info use default
			_this.$playlistItemRenderer = $( mw.getConfig('KalturaSupport.PlaylistDefaultItemRenderer') );
		}

		// Force autoContoinue if there is no interface
		if( !_this.includeInLayout ){
			_this.autoContinue = true;
		}

		mw.log( "PlaylistHandlerKaltura:: got  " +  _this.playlistSet.length + ' playlists ' );
		// Set the playlist to the first playlist
		_this.setPlaylistIndex( 0 );

		// Load playlist by Id
		_this.loadCurrentPlaylist(function(){
			// Check if clipIndex should be updated
			var initItemEntryId = _this.getConfig( 'initItemEntryId' );
			if( initItemEntryId ){
				$.each( _this.getClipList(), function( inx, clip ){
					if( clip.id == initItemEntryId ){
						// Update the clipInx
						_this.playlist.clipIndex = inx;
					}
				});
			}
			if( $.isFunction( callback ) ){
				callback();
			}
		});
	},
	getPlaylistSize: function() {
		var embedPlayer =  this.playlist.getEmbedPlayer();

		// Get Width
		var pWidth = embedPlayer.getKalturaConfig('playlistHolder', 'width');
		if( ! pWidth ) {
			pWidth = embedPlayer.getKalturaConfig('playlist', 'width');
		}
		// Get Height
		var pHeight = embedPlayer.getKalturaConfig('playlistHolder', 'height');
		if( ! pHeight ) {
			pHeight = embedPlayer.getKalturaConfig('playlist', 'height');
		}

		// Add px if not percentage
		if( typeof pWidth == 'string' && pWidth.indexOf('%') == -1 ) {
			pWidth = pWidth + 'px';
		}
		if( typeof pHeight == 'string' && pHeight.indexOf('%') == -1 ) {
			pHeight = pHeight + 'px';
		}

		return {
			width: pWidth,
			height: pHeight
		};
	},
	setupPlaylistMode: function( layout ) {
		var _this = this;
		var embedPlayer =  this.playlist.getEmbedPlayer();

		// Hide our player if not needed
		var playerHolder = embedPlayer.getKalturaConfig('PlayerHolder', ["visible", "includeInLayout"]);
		if( ( playerHolder.visible === false  || playerHolder.includeInLayout === false ) && !embedPlayer.useNativePlayerControls() ) {
			embedPlayer.displayPlayer = false;
		}

		var updateLayout = function() {
			mw.log( "PlaylistHandlerKaltura:: updateLayout:" );
			var playlistSize = _this.getPlaylistSize();
			if( layout == 'vertical' ){
				if( playlistSize.height == '100%' ) {
					// iOS window.innerHeight return the height of the entire content and not the window so we get the iframe height
					var windowHeight  = (mw.isIOS()) ? $( window.parent.document.getElementById( embedPlayer.id ) ).height() : window.innerHeight;
					playlistSize.height = ( windowHeight - embedPlayer.getComponentsHeight() );
				}
				_this.playlist.getVideoListWrapper().height( playlistSize.height );
			} else {
				_this.playlist.getVideoListWrapper().width( playlistSize.width );
			}
		};
		updateLayout();
		embedPlayer.bindHelper( 'updateLayout' + this.bindPostFix, function(){
			updateLayout()
		});
	},
	hasMultiplePlaylists: function(){
		return ( this.playlistSet.length > 1 );
	},
	hasPlaylistUi: function(){
		return this.includeInLayout;
	},
	isNextButtonDisplayed: function(){
		return !!this.playlist.getEmbedPlayer().$uiConf.find( 'button#nextBtnControllerScreen' ).length;
	},
	isPreviousButtonDisplayed: function(){
		return !!this.playlist.getEmbedPlayer().$uiConf.find( 'button#previousBtnControllerScreen' ).length;
	},
	getPlaylistSet: function(){
		return this.playlistSet;
	},
	getVideoListWidth: function(){
		// we have to add a bit for spacing ( should fix css files )
		return parseInt( this.videolistWidth ) + 10;
	},
	setPlaylistIndex: function( playlistIndex ){
		this.playlist_id = this.playlistSet[ playlistIndex ].id;
		var embedPlayer =  this.playlist.getEmbedPlayer();
		// Update the player data ( if we can )
		if( embedPlayer.kalturaPlaylistData ){
			embedPlayer.kalturaPlaylistData.currentPlaylistId = this.playlist_id;
		}
	},
	setClipIndex: function( clipIndex ){
		var embedPlayer =  this.playlist.getEmbedPlayer();
		// Update the player data ( if we can )
		if( embedPlayer.kalturaPlaylistData ){
			embedPlayer.kalturaPlaylistData.currentPlaylistId = this.playlist_id;
			embedPlayer.setKalturaConfig( 'playlistAPI', 'dataProvider', {'selectedIndex' : clipIndex} );
		}
	},
	loadCurrentPlaylist: function( callback ){
		this.loadPlaylistById( this.playlist_id, callback );
	},
	loadPlaylistById: function( playlist_id, loadedCallback ){
		var _this = this;
		mw.log("PlaylistHandlerKaltura::loadPlaylistById> " + playlist_id );
		var embedPlayer = this.playlist.embedPlayer;

		if( ! embedPlayer.kalturaPlaylistData ) {
			embedPlayer.kalturaPlaylistData = {};
		}

		// Local ready callback  to trigger playlistReady
		var callback = function(){
			// Check if player is ready before issuing playlist ready event
			if( embedPlayer.playerReadyFlag ) {
				embedPlayer.triggerHelper( 'playlistReady' );
			} else {
				embedPlayer.bindHelper('playerReady.playlistReady', function(){
					$( embedPlayer ).unbind( 'playerReady.playlistReady' );
					embedPlayer.triggerHelper( 'playlistReady' );
				});
			}
			// Issue the callback if set:
			if( $.isFunction( loadedCallback ) ){
				loadedCallback();
			}
		};

		// Check if the playlist is mrss url ( and use the mrss handler )
		if( mw.isUrl( playlist_id ) ){
			this.playlist.src = playlist_id;
			this.mrssHandler = new mw.PlaylistHandlerKalturaRss( this.playlist );
			this.mrssHandler.loadPlaylist( function(){
				_this.clipList = _this.mrssHandler.getClipList();
				callback();
			});
			return ;
		}

		// Check for playlist cache
		if( embedPlayer.kalturaPlaylistData[ playlist_id ] 
			&& embedPlayer.kalturaPlaylistData[ playlist_id ].items
			&& embedPlayer.kalturaPlaylistData[ playlist_id ].items.length ){
			_this.clipList = embedPlayer.kalturaPlaylistData[ playlist_id ].items;
			embedPlayer.setKalturaConfig( 'playlistAPI', 'dataProvider', {'content' : _this.clipList} );
			callback();
			return ;
		}

		var playlistRequest = {
			'service' : 'playlist',
			'action' : 'execute',
			'id': playlist_id
		};
		this.getKClient().doRequest( playlistRequest, function( playlistDataResult ) {
			// Empty the clip list
			_this.clipList = [];
			var playlistData;
			// The api does strange things with multi-playlist vs single playlist
			if( playlistDataResult[0] && playlistDataResult[0].id ){
				playlistData = playlistDataResult;
			} else if( playlistDataResult[0] && playlistDataResult[0][0].id ){
				playlistData = playlistDataResult[0];
			} else {
				mw.log("Error: kaltura playlist:" + playlist_id + " could not load:" + playlistDataResult.code);
				_this.errorMsg = "Error loading playlist:" + playlistDataResult.code;
				callback();
				return ;
			}
			mw.log( 'PlaylistHandlerKaltura::Got playlist of length::' +   playlistData.length );
			if( playlistData.length > mw.getConfig( "Playlist.MaxClips" ) ){
				playlistData = playlistData.splice(0, mw.getConfig( "Playlist.MaxClips" ) );
			}
			// Add it to the cache:
			embedPlayer.kalturaPlaylistData[ playlist_id ].items = playlistData;
			embedPlayer.setKalturaConfig( 'playlistAPI', 'dataProvider', {'content' : playlistData} );
			// update the clipList:
			_this.clipList = playlistData;
			callback();
		});
	},

	getKClient: function(){
		if( !this.kClient ){
			this.kClient = mw.kApiGetPartnerClient( this.widget_id );
		}
		return this.kClient;
	},

	/**
	 * Get clip count
	 * @return {number} Number of clips in playlist
	 */
	getClipCount: function(){
		return this.getClipList().length;
	},

	getClip: function( clipIndex ){
		return this.getClipList()[ clipIndex ];
	},
	getClipList: function(){
		return this.clipList;
	},
	playClip: function( embedPlayer, clipIndex, callback ){
		var _this = this
		if( !embedPlayer ){
			mw.log("Error:: PlaylistHandlerKaltura:playClip > no embed player");
			if( $.isFunction( callback ) ){
				callback();
			}
			return ;
		}
		// Send notifications per play request
		if( clipIndex == 0 ) {
			embedPlayer.triggerHelper( 'playlistFirstEntry' );
		} else if( clipIndex == (_this.getClipCount()-1) ) {
			embedPlayer.triggerHelper( 'playlistLastEntry' );
		} else {
			embedPlayer.triggerHelper( 'playlistMiddleEntry' );
		}

		// Check if entry id already matches ( and is loaded )
		if( embedPlayer.kentryid == this.getClip( clipIndex ).id ){
			if( this.loadingEntry ){
				mw.log("Error: PlaylistHandlerKaltura is loading Entry, possible double playClip request");
			}else {
				embedPlayer.play();
			}
			if( $.isFunction( callback ) ){
				callback();
			}
			return ;
		}
		// Update the loadingEntry flag:
		this.loadingEntry = this.getClip( clipIndex ).id;


		// Listen for change media done
		var bindName = 'onChangeMediaDone' + this.bindPostFix;
		$( embedPlayer).unbind( bindName ).bind( bindName, function(){
			mw.log( 'mw.PlaylistHandlerKaltura:: onChangeMediaDone' );
			_this.loadingEntry = false;
			// Sync player size
			/*embedPlayer.bindHelper( 'loadeddata', function() {
				embedPlayer.controlBuilder.syncPlayerSize();
			});*/
			embedPlayer.play();
			if( $.isFunction( callback ) ){
				callback();
			}
		});
		mw.log("PlaylistHandlerKaltura::playClip::changeMedia entryId: " + this.getClip( clipIndex ).id);

		// Make sure its in a playing state when change media is called if we are autoContinuing:
		if( this.autoContinue && !embedPlayer.firstPlay ){
			embedPlayer.stopped = embedPlayer.paused = false;
		}
		// Update the playlist data selectedIndex ( before issuing change media call )
	 	_this.setClipIndex( clipIndex );
		// Use internal changeMedia call to issue all relevant events
		embedPlayer.sendNotification( "changeMedia", {'entryId' : this.getClip( clipIndex ).id, 'playlistCall': true} );
	},
	drawEmbedPlayer: function( clipIndex, callback ){
		var _this = this;
		var $target = _this.playlist.getVideoPlayerTarget();
		mw.log( "PlaylistHandlerKaltura::drawEmbedPlayer:" + clipIndex );
		// Get the embed
		var embedPlayer = _this.playlist.getEmbedPlayer();
		embedPlayer.doUpdateLayout();
		// update the selected index:
		_this.setClipIndex( clipIndex );

		// check if player already ready:
		if( embedPlayer.playerReadyFlag ){
			callback();
		} else {
			// Set up ready binding (for ready )
			$( embedPlayer ).bind('playerReady' + this.bindPostFix, function(){
				callback();
			});
		}

		// Call changeMedia
		if( embedPlayer.kentryid != this.getClip( clipIndex ).id ){
			embedPlayer.sendNotification( 'changeMedia', { entryId: this.getClip( clipIndex ).id} );
		}

	},
	updatePlayerUi: function( clipIndex ){
		// no updates need since kaltura player interface components are managed by the player
	},
	addEmbedPlayerBindings: function( embedPlayer ){
		var _this = this;
		mw.log( 'PlaylistHandlerKaltura:: addEmbedPlayerBindings');
		// remove any old bindings;
		$( embedPlayer ).unbind( this.bindPostFix );
		// add the binding:
		$( embedPlayer ).bind( 'Kaltura_SetKDPAttribute' + this.bindPostFix, function( event, componentName, property, value ){
			mw.log("PlaylistHandlerKaltura::Kaltura_SetKDPAttribute:" + property + ' value:' + value);
			switch( componentName ){
				case "playlistAPI.dataProvider":
					_this.doDataProviderAction( property, value );
				break;
				case 'tabBar':
					_this.switchTab( property, value )
				break;
			}
		});

		$( embedPlayer ).bind( 'Kaltura_SendNotification'+ this.bindPostFix , function( event, notificationName, notificationData){
			switch( notificationName ){
				case 'playlistPlayNext':
				case 'playlistPlayPrevious':
					mw.log( "PlaylistHandlerKaltura:: trigger: " + notificationName );
					$( embedPlayer ).trigger( notificationName );
					break;
			}
		});
	},
	switchTab:function( property, value ){
		if( property == 'selectedIndex' ){
			this.playlist.switchTab( value );
		}
	},
	doDataProviderAction: function ( property, value ){
		 switch( property ){
		 	case 'selectedIndex':
		 		// Update the selected clip ( and actually play it )
		 		this.playlist.playClip( parseInt( value ) );
			break;
		 }
	},
	/**
	* Get an items poster image ( return missing thumb src if not found )
	*/
	getClipPoster: function ( clipIndex, size ){
		if( this.mrssHandler ){
			return this.mrssHandler.getClipPoster( clipIndex, size );
		}
		var clip = this.getClip( clipIndex );
		if( !size ){
			return clip.thumbnailUrl;
		}
		return kWidget.getKalturaThumbUrl({
			'width': size.width,
			'height': size.height,
			'entry_id' : clip.id,
			'partner_id' : clip.partnerId
		});
	},
	/**
	* Get an item title from the $rss source
	*/
	getClipTitle: function( clipIndex ){
		if( this.mrssHandler ){
			return this.mrssHandler.getClipTitle( clipIndex );
		}
		return this.getClip( clipIndex ).name;
	},

	getClipDesc: function( clipIndex ){
		if( this.mrssHandler ){
			return this.mrssHandler.getClipDesc( clipIndex );
		}
		return this.getClip( clipIndex ).description;
	},
	getClipDuration: function ( clipIndex ) {
		if( this.mrssHandler ){
			return this.mrssHandler.getClipDuration( clipIndex );
		}
		// In case of image entry get the real duration
		if( this.getClip( clipIndex).mediaType == 2 ) {
			var embedPlayer = this.playlist.embedPlayer;
			var imageDuration = embedPlayer.getKalturaConfig( '', 'imageDefaultDuration' ) ? embedPlayer.getKalturaConfig( '', 'imageDefaultDuration' ) : mw.getConfig( "EmbedPlayer.DefaultImageDuration" );
			return parseFloat( imageDuration );
		}
		return this.getClip( clipIndex ).duration;
	},
	getPlaylistItem: function( clipIndex ){
		var _this = this;

		var $item = $('<div />');
		$item.append(
			this.getBoxLayout(clipIndex, this.$playlistItemRenderer)
		);
		$item.find('.nameAndDuration')
			.after( $('<div />').css({'display': 'block', 'height': '20px'} ) )
			//.find( 'div span:last' ).css('float', 'right')

		// check for decendent margin-left
		$item.find('.hasMarginLeft' ).slice(1).css('margin-left', '');

		return $item;
	},
	adjustTextWidthAfterDisplay: function( $clipList ){
		var textWidth = $clipList.width() - $clipList.find('img').width();
		// there is about 64 pixles of padding involved;
		textWidth = textWidth - 64;
		$clipList.find( '.irDescriptionIrScreen' ).css( 'width', textWidth );
	},
	getBoxLayout: function(  clipIndex, $currentBox ){
		var _this = this;
		var offsetLeft = 0;
		var $boxContainer = $('<div />');
		$.each( $currentBox.children(), function( inx, boxItem ){
			switch( boxItem.nodeName.toLowerCase() ){
				case 'img':
					var $node = $('<img />');
					// Custom html based alt tag ( not described in uiConf
					$node.attr('alt', _this.getClipTitle( clipIndex ) );
					break;
				case 'vbox':
				case 'hbox':
				case 'canvas':
					var $node = $('<div />');
					if( offsetLeft ){
						$node.css( 'margin-left', offsetLeft )
							.addClass("hasMarginLeft")
					}
					$node.append(
						_this.getBoxLayout( clipIndex, $(boxItem) )
					);
					break;
				case 'spacer':
					// spacers do nothing for now.
					$node = $('<div />').css('display','inline');
					break;
				case 'label':
					// Avoid duplicate labels - Skip nodes with common id's that differ 
					// only by the hover prefix, i.e hoverNameLabel and nameLabel
					if ( $( boxItem ).siblings() && $( boxItem ).siblings().length && 
							$( boxItem ).siblings()[0].id.toLowerCase() == 'hover' + 
							$( boxItem )[0].id.toLowerCase() ) 
					{
						break;
					}
				case 'text':
					var $node = $('<span />').css('display','block');
					break;
				default:
					var $node = false;
					break;
			}

			if( $node && $node.length ){
				$node.addClass( boxItem.nodeName.toLowerCase() );
				_this.applyUiConfAttributes(clipIndex, $node, boxItem);
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
						//$("<div />").css( 'height', $node.css('height') )
					);
				}
			}
		});

		// check for box model ("100%" single line float right, left );
		if( $boxContainer.find('span').length == 2 && $boxContainer.find('span').slice(0).css('width') == '100%'){
			 $boxContainer.find('span').slice(0).css({'width':'', 'float':'left'});
			 $boxContainer.find('span').slice(1).css('float', 'right');
		} else if ( $boxContainer.find('span').length > 1 ){ // check for multiple spans
			$boxContainer.find('span').each(function(inx, node){
				if( $(node).css('float') != 'right'){
					$(node).css('float', 'left');
				}
			} );
		}
		// and adjust 100% width to 95% ( handles edge cases of child padding )
		$boxContainer.find('div,span').each(function( inx, node){
			//if( $(node).css('width') == '100%')
			$(node).css('width', '');
			// and box layout does crazy things with virtual margins :( remove width for irDescriptionIrScreen
			if( $(node).data('id') == 'irDescriptionIrScreen' || $(node).data('id') == 'irDescriptionIrText'  ){
				$(node).css({
					'height': '',
					'float': 'left'
				});
			}
			if( $(node).hasClass('hbox') || $(node).hasClass('vbox') || $(node).hasClass('canvas') ){
				$(node).css('height', '');
			}

			if( $(node).hasClass('itemRendererLabel')
				&& $(node).css('float') == 'left'
				&& ( $(node).siblings().hasClass('hbox') || $(node).siblings().hasClass('vbox')  )
			){
				$(node).css({
					'display': 'block'
				});
			}

			if( $(node).hasClass('irDurationIrScreen')  ){
				$( node ).css( 'float', 'right');
			}
		});
		return $boxContainer;
	},

	applyUiConfAttributes:function(clipIndex, $target, confTag ){
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
					$target.data('id', idName);
					$target.addClass(idName);
					break;
				case 'stylename':
					styleName = attr.nodeValue;
					$target.addClass(styleName);
					break;
				case 'url':
					$target.attr('src',  _this.uiConfValueLookup( clipIndex, attr.nodeValue ) );
					break;
				case 'width':
				case 'height':
					var appendPx = '';
					if( attr.nodeValue.indexOf('%') == -1 ){
						appendPx= 'px';
					}
					$target.css( attr.nodeName, attr.nodeValue + appendPx );
					break;
				case 'paddingright':
					$target.css( 'padding-right', attr.nodeValue);
					break;
				case 'text':
					var val = _this.uiConfValueLookup( clipIndex, attr.nodeValue ) || '';
					$target.text( val );
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
		// Styles enforce some additional constraints
		switch( styleName ){
			case 'itemRendererLabel':
				// XXX should use .playlist.formatTitle and formatDescription ( once we fix .playlist ref )
				// hack to read common description id ( no other way to tell layout size )
				$target.attr('title', $target.text());
				if( idName =='irDescriptionIrScreen' || idName == 'irDescriptionIrText' ){
					$target.text( _this.playlist.formatDescription( $target.text() ) );
				} else{
					$target.text( _this.playlist.formatTitle( $target.text() ) );
				}
				if( $target.text() == 'null' ){
					$target.text( '' );
				}
				break;
		}
	},
	uiConfValueLookup: function(clipIndex, objectString ){
		var parsedString = objectString.replace( /\{|\}/g, '' );
		var objectPath = parsedString.split('.');
		//mw.log("mw.Playlist:: uiConfValueLookup >: " + objectPath[0]);
		switch( objectPath[0] ){
			case 'div10002(this':
				return this.uiConfValueLookup(clipIndex, 'this.' + objectPath[1].replace( /\)/, '' ) );
				break;
			// XXX todo a more complete parser and ui-conf evaluate property / text emulator
			case 'formatDate(this':
				// xxx should use suggested formating
				return mw.seconds2npt( this.getClipDuration( clipIndex ) );
			break;
			case 'this':
				// some named properties:
				switch( objectPath[1] ){
					case 'thumbnailUrl':
						return this.getClipPoster( clipIndex );
						break;
					case 'name':
						return this.getClipTitle( clipIndex );
						break;
					case 'description':
						return this.getClipDesc( clipIndex );
					break;
				};
				if( this.getClip( clipIndex )[ objectPath[1] ] ){
					return this.getClip( clipIndex )[ objectPath[1] ];
				} else {
					mw.log("Error: Kaltura Playlist Handler could not find property:" + objectPath[1] );
				}

			break;
			default:
				return objectString;
		}
	}
};

} )( window.mediaWiki, window.jQuery );
