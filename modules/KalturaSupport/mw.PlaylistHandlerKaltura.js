mw.PlaylistHandlerKaltura = function( playlist, options ){
	return this.init( playlist, options );
};
// for players that don't have layout information
mw.setConfig('KalturaSupport.PlaylistDefaultItemRenderer', '<hbox id="irCont" height="100%" width="100%" x="10" y="10" verticalalign="top" stylename="Button_upSkin_default"> <img id="irImageIrScreen" url="{this.thumbnailUrl}" source="{this.thumbnailUrl}" height="48" width="72"> <vbox height="100%" width="100%" id="labelsHolder" verticalgap="0"> <hbox id="nameAndDuration" width="100%" height="18"> <label id="irLinkIrScreen" height="18" width="100%" text="{this.name}" stylename="itemRendererLabel" label="{this.name}" prefix="" font="Arial"></label> <label id="irDurationIrScreen" height="18" width="70" text="{formatDate(this.duration, \'NN:SS\')}" stylename="itemRendererLabel" prefix="" font="Arial"></label> </hbox> <label id="irDescriptionIrScreen" width="240" height="18" text="{this.description}" stylename="itemRendererLabel" prefix="" font="Arial"></label> </vbox> </hbox>');

mw.PlaylistHandlerKaltura.prototype = {
		
	clipList:null,
	
	uiconf_id: null,
	widget_id: null,
	playlist_id: null,
	mrssHandler: null,
	
	playlistSet : [],
	
	// ui conf data
	uiConfData : null,
	includeInLayout: false,
	
	init: function ( playlist, options ){
		this.playlist = playlist;
		// set all the options: 
		for( var i in options){
			this[i] = options[i];
		}
	},
	
	loadPlaylist: function ( callback ){
		var _this = this;
		
		// Get the kaltura client:
		this.getKClient().playerLoader({
			'uiconf_id' : this.uiconf_id
		}, function( playerData ){
			mw.log("PlaylistHandlerKaltura:: loadPlaylist: got playerData" );
			
			_this.playlistSet = [];
			// @@TODO clean up with getConf option
			
			// Add in flashvars playlist id if present:
			if( _this.playlist_id !== null ){
				_this.playlistSet.push({
					'playlist_id' : _this.playlist_id 
				});
			}
			// Add all playlists to playlistSet
			var $uiConf = $j( playerData.uiConf );
			
			// Check for autoContinue ( we check false state so that by default we autoContinue ) 
			var $ac = $uiConf.find("uivars [key='playlistAPI.autoContinue']");
			_this.autoContinue = ( $ac.length && $ac.get(0).getAttribute('value') == 'false' )? false: true;
			
			// Check for flash var override: 
			if( _this.flashvars['playlistAPI.autoContinue'] == 'true' ){
				_this.autoContinue = true;
			}
			
			var $ap = $uiConf.find("uivars [key='playlistAPI.autoPlay']");
			_this.autoPlay = ( $ap.length && $ap.get(0).getAttribute('value') == 'false' )? false: true;
			// Check for flash var override: 
			if( _this.flashvars['playlistAPI.autoPlay'] == 'true' ){
				_this.autoPlay = true;
			}
			
			var $il = $uiConf.find("uivars [key='playlist.includeInLayout']");
			_this.includeInLayout = ( $il.length && $il.get(0).getAttribute('value') == 'false' )? false : true;
			
			if( $uiConf.find('#playlist').get(0) ){
				// Check for videolist width
				_this.videolistWidth = $uiConf.find('#playlist').get(0).getAttribute('width');
			} else {
				_this.videolistWidth = 250;
			}
			
			// Store all the playlist item render information:
			_this.$playlistItemRenderer = $uiConf.find('#playlistItemRenderer');
			if( _this.$playlistItemRenderer.children().length == 0  ){
				// No layout info use default
				_this.$playlistItemRenderer = $j( mw.getConfig('KalturaSupport.PlaylistDefaultItemRenderer') );
			}
			// Force autoContoinue if there is no interface 
			if( !_this.includeInLayout ){
				_this.autoContinue = true;
			}
			
			// Find all the playlists by number  
			for( var i=0; i < 50 ; i ++ ){
				var playlist_id = playlistName = null;
				var idElm = $uiConf.find("uivars var[key='kpl" + i +"EntryId']").get(0);
				if( idElm ){
					playlist_id  = idElm.getAttribute('value');
					var nameElm = $uiConf.find("uiVars var[key='playlistAPI.kpl" + i + "Name']").get(0);
					if( nameElm ){
						playlistName = nameElm.getAttribute('value');
					}
				}
				// Check if flashvars override or set value:
				if( _this.flashvars['playlistAPI.kpl' +i + 'Url' ] ){
					var kplUrl = _this.flashvars['playlistAPI.kpl' +i + 'Url' ];
					if( kplUrl ){
						// check for name
						if( _this.flashvars['playlistAPI.kpl' + i + 'Name'] ){
							playlistName = _this.flashvars['playlistAPI.kpl' + i + 'Name'].replace(/\+/gi, ' ');
						}
						var plId =  mw.parseUri( kplUrl ).queryKey['playlist_id'];
						// Make sure we are loading from kaltura.com
						if( plId && mw.parseUri( kplUrl ).host.replace('www.', '') == 'kaltura.com'){
							playlist_id = plId;
						} else {
							playlist_id = kplUrl;
						}
					}
				}
				
				if( playlist_id ){
					_this.playlistSet[i] = { 
						'playlist_id' : playlist_id
					};
					if( playlistName  ){
						_this.playlistSet[i]['name'] = playlistName;
					}
				} else {
					// stop looking for playlists
					break;
				}
			}		
			
			// Allow plugins to add extra playlists to the playlist set:
			$j( mw ).trigger( 'KalturaPlaylist_AddToPlaylistSet', [ _this.playlistSet ] );
			
			if( !_this.playlistSet[0] ){
				mw.log( "Error could not get playlist entry id in the following player data::" + $uiConf.html() );
				return false;
			}
			
			mw.log( "PlaylistHandlerKaltura:: got  " +  _this.playlistSet.length + ' playlists ' );	
			// Set the playlist to the first playlist
			_this.setPlaylistIndex( 0 );
			
			// Load playlist by Id 
			_this.loadCurrentPlaylist( callback );
		});
	},
	hasMultiplePlaylists: function(){
		return ( this.playlistSet.length > 1 );
	},
	hasPlaylistUi: function(){
		return this.includeInLayout;
	},
	getPlaylistSet: function(){
		return this.playlistSet;
	},
	getVideoListWidth: function(){
		// we have to add a bit for spacing ( should fix css files )
		return parseInt( this.videolistWidth ) + 10;
	},
	setPlaylistIndex: function( playlistIndex ){
		this.playlist_id = this.playlistSet[ playlistIndex ].playlist_id;
		mw.log( "PlaylistHandlerKalutra::setPlaylistIndex: playlist id: " + this.playlist_id);
	},
	loadCurrentPlaylist: function( callback ){
		this.loadPlaylistById( this.playlist_id, callback );
	},
	loadPlaylistById: function( playlist_id, callback ){
		var _this = this;
		// Check if the playlist is mrss url ( and use the mrss handler )
		if( mw.isUrl( playlist_id ) ){
			this.playlist.src = playlist_id;
			this.mrssHandler = new mw.PlaylistHandlerKalturaRss( this.playlist );
			this.mrssHandler.loadPlaylist( function(){
				_this.clipList = _this.mrssHandler.getClipList();
				if( callback ) 
					callback();
			});
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
			
			// The api does strange things with multi-playlist vs single playlist
			if( playlistDataResult[0].id ){
				playlistData = playlistDataResult;
			} else if( playlistDataResult[0][0].id ){
				playlistData = playlistDataResult[0];
			} else {
				mw.log("Error: kaltura playlist:" + playlist_id + " could not load:" + playlistData.code);
			}			
			mw.log( 'kPlaylistGrabber::Got playlist of length::' +   playlistData.length );
			if( playlistData.length > mw.getConfig( "Playlist.MaxClips" ) ){
				playlistData = playlistData.splice(0, mw.getConfig( "Playlist.MaxClips" ) );
			}
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
	
	getClipSources: function( clipIndex, callback ){
		mw.log("PlaylistHandlerKaltura:: getClipSources: " + clipIndex);
		var _this = this;
		if( this.mrssHandler ){
			this.mrssHandler.getClipSources(clipIndex, callback);
			return ;
		}
		mw.getEntryIdSourcesFromApi( this.getKClient().getPartnerId(),  this.getClipList()[ clipIndex ].id, function( sources ){
			// Add the durationHint to the sources: 
			for( var i in sources){
				sources[i].durationHint = _this.getClipDuration( clipIndex );
			}
			callback( sources );
		});
	},

	getCustomAttributes: function( clipIndex ){
		// Clear out custom data ( as to not pre-set custom attributes )
		mw.setConfig("KalturaSupport.IFramePresetPlayerData", false);
		return { 
			'kentryid' : this.getClip( clipIndex ).id,
			'kwidgetid' : this.widget_id
		};
	},
	
	/**
	* Get an items poster image ( return missing thumb src if not found )
	*/ 
	getClipPoster: function ( clipIndex, size ){
		if( this.mrssHandler ){
			return this.mrssHandler.getClipPoster( clipIndex, size );
		}
		var clip = this.getClip( clipIndex );
		if(!size){
			return clip.thumbnailUrl;
		}
		return mw.getKalturaThumbUrl({
			'width': size.width,
			'height': size.height,
			'entry_id' : clip.id,
			'partner_id' : this.getKClient().getPartnerId()
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
		return this.getClip( clipIndex ).duration;
	},
	getPlaylistItem: function( clipIndex ){
		var _this = this;

		var $item = $j('<div />');
		$item.append( 
			this.getBoxLayout(clipIndex, this.$playlistItemRenderer) 
		);
		return $item;
	},
	getBoxLayout: function(  clipIndex, $currentBox ){
		var _this = this;
		var offsetLeft = 0;
		var $boxContainer = $j('<div />');
		$j.each( $currentBox.children(), function( inx, boxItem ){
			switch( boxItem.nodeName.toLowerCase() ){
				case 'img':
					var $node = $j('<img />');
					// Custom html based alt tag ( not described in uiConf
					$node.attr('alt', _this.getClipTitle( clipIndex ) );
					break;
				case 'vbox':
				case 'hbox':
				case 'canvas':
					var $node = $j('<div />'); 
					if( offsetLeft )
						$node.css('margin-left', offsetLeft );
					
					$node.append( 
						_this.getBoxLayout( clipIndex, $j(boxItem) ) 
					);
					break;
				case 'spacer':
					// spacers do nothing for now.
					$node = $j('<div />').css('display','inline');
					break;
				case 'label':
				case 'text':
					var $node = $j('<span />').css('display','block');
					break;
			}
			$node.addClass( boxItem.nodeName.toLowerCase() );
			if( $node && $node.length ){
				_this.applyUiConfAttributes(clipIndex, $node, boxItem);
				// add offset if not a percentage:
				if( $node.css('width').indexOf('%') === -1 ){
					offsetLeft+= $node.width();
				}
				// Box model! containers should not have width:
				if( $node.get(0).nodeName.toLowerCase() == 'div' ){
					$node.css('width', '');
				}
				$boxContainer.append( $node );
				// For hboxes add another div with the given height to block out any space represented by inline text types
				if(  boxItem.nodeName.toLowerCase() == 'hbox' ){
					$boxContainer.append( 
						$j("<div />").css( 'height', $node.css('height') ) 
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
				if( $j(node).css('float') != 'right'){
					$j(node).css('float', 'left');
				}
			} );
		}
		// and adjust 100% width to 95% ( handles edge cases of child padding )
		$boxContainer.find('div,span').each(function( inx, node){
			if( $j(node).css('width') == '100%')
				$j(node).css('width', '95%'); 
			
			// and box layout does crazy things with virtual margins :( remove width for irDescriptionIrScreen
			if( $j(node).data('id') == 'irDescriptionIrScreen' || $j(node).data('id') == 'irDescriptionIrText'  ){
				$j(node).css('width', '');
			}
			if( $j(node).hasClass('hbox') || $j(node).hasClass('vbox') || $j(node).hasClass('canvas') ){
				$j(node).css('height', '');
			}

			if( $j(node).hasClass('itemRendererLabel') 
				&& $j(node).css('float') == 'left'
				&& ( $j(node).siblings().hasClass('hbox') || $j(node).siblings().hasClass('vbox')  )
			){
				$j(node).css({
					'float': '',
					'display': 'inline'
				});
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
		$j.each( confTag.attributes, function( inx , attr){
			switch(  attr.nodeName.toLowerCase() ){
				case 'id':
					idName = attr.nodeValue;
					$target.data('id', idName);
					break;
				case 'stylename': 
					styleName = attr.nodeValue;
					$target.addClass(styleName);
					break;
				case 'url':
					$target.attr('src',  _this.uiConfValueLookup(clipIndex, attr.nodeValue ) );
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
					$target.text( _this.uiConfValueLookup(clipIndex, attr.nodeValue ) );
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
				if( idName =='irDescriptionIrScreen' || idName == 'irDescriptionIrText' ){
					$target.text( _this.playlist.formatDescription( $target.text() ) );
				} else{
					$target.text( _this.playlist.formatTitle( $target.text() ) );
				}
				break;
		}
	},
	uiConfValueLookup: function(clipIndex, objectString ){
		var parsedString = objectString.replace( /\{|\}/g, '' );
		var objectPath = parsedString.split('.');
		switch( objectPath[0] ){
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
