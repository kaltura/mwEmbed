/**
 * Omniture SiteCatalyst15 plugin
 * @param embedPlayer
 * @param config
 */
( function( mw, $ ) { "use strict";

// set default SiteCatalyst15 sCode path: 
mw.setDefaultConfig('SiteCatalyst15.ScodePath', mw.getMwEmbedPath() + '/modules/SiteCatalyst15/s_code.js' );

mw.SiteCatalyst15 = function( embedPlayer, config ){
 	return this.init( embedPlayer, config );
};
mw.SiteCatalyst15.prototype = {
	config: null, 
 	init: function( embedPlayer, callback ){
		var _this = this;
		// Setup reference to embedPlayer
		this.embedPlayer = embedPlayer;
 		
 		if( !this.getConfig('trackingServer') ){
 			mw.log( "Error:: mw.SiteCatalyst15 missing tracking server" );
 		}
 		if( !this.getConfig('account' ) ){
 			mw.log( "Error: mw.SiteCatalyst15 missing account name" );
 		}
 		this.loadSCode(function(){
 			// Setup the ominit
 			_this.addPageCode();
 			
 			// Add the player bindings for tracking player events
 			_this.addPlayerBindings();
 			
 	 		// After all bindings are setup issue the callback
 	  		callback();
 		});
 	},
 	getConfig: function( key ){
 		// Make sure all the config takes flash override values or whats in the uiconf
 		return this.embedPlayer.getKalturaConfig( this.pluginName, key );
 	},
 	loadSCode: function( callback ){
 		var sCodePath = this.getConfig ( 'sCodePath' ) || mw.getConfig('SiteCatalyst15.ScodePath');
 		$.getScript(sCodePath, function(){
 			callback();
 		})
 	},
 	/**
 	 * Adds the omniture "page code" 
 	 */
 	addPageCode: function(){
 		var directMapingVars = [ 'trackingServer', 'account', 'charSet', 'currencyCode'];
 		var _this = this;
 		$.each( directMapingVars, function( inx, key ){
 			if( _this.getConfig( key ) ){
 	 			s[ key ] = _this.getConfig( key );
 	 		}
 		});
		// Namespace can include * that needs to be changed to "."
		var vnp = this.getConfig('visitorNamespace')
		if( vnp ){
			if( vnp.indexOf( "*" ) != -1 ){
				vpn = vnp.split( "*" ).join( "." );
			}
			s.visitorNamespace = vpn;
		}
		// Try to access parent iframe data else use flashvars
		try{
			s.pageName = window.parent.document.title;
			s.pageUrl = window.parent.location;
		} catch ( e ){
			// could not access parent 
		}
		s.Media.trackWhilePlaying = true;
		s.Media.segmentByMilestones = this.getConfig( 'segmentByMilestones' );
		s.Media.contextDataMapping = this.getMediaMapping();
		
		// Note the KDP version access cp.vo.kuiConf.name ... We don't have that in html5. 
		s.Media.playerName = 'localPlayer';
 	},
 	getMediaMapping: function(){
 		var _this = this;
 		var contextObj = {
 							'a': { 
 								'media': {}
 							}
 						};
 		var a = contextObj.a;
 		var media = a.media;
 		if( this.getConfig( 'contentType') ){
 			a.contentType = this.getConfig( 'contentType');
 		}
 		if( this.getConfig( 'timePlayed' ) ){
 			media.timePlayed = this.getConfig( 'timePlayed' )
 		}
 		var directMediaMap = ['mediaName', 'mediaSegment', 'mediaSegmentView',
 		                      'mediaView', 'mediaComplete'
 		                      ]
 		$.each( directMediaMap, function( inx, mKey ) {
 			if( this.getConfig( mKey ) ){
 				var catKey = mKey.replace( 'media', '' );
 				catKey = catKey.charAt(0).toLowerCase() + catKey.slice(1);
 				media[ catKey ] = this.getConfig( mKey );
 			}
 		});
 		
 		if( this.getConfig( 'milestonesEvents' ) && this.getConfig( 'trackMilestones') ){
 			var milestones = this.getConfig( 'milestonesEvents' ).split( ',' );
 			var trackMilestones = this.getConfig( 'trackMilestones' ).split( ',' );
 			var mObject = {};
 			for( i = 0 ; i < milestones.length ; i++){
 				mObject[ milestones[i] ] = trackMilestones[i];
 			}
 			media['milestones'] = mObject; 
 		}
 		return contextObj;
 	},
 	addPlayerBindings: function(){
 		var _this = this;
 		var omintureEvents = [
		    'videoViewEvent' ,
			'shareEvent',
			'saveEvent',
			'openFullscreenEvent',
			'closefullscreenEvent',
			'saveEvent',
			'replayEvent',
			'seekEvent',
			'changeMediaEvent',
			'gotoContributorWindowEvent',
			'gotoEditorWindowEvent',
			'playerPlayEndEvent',
			'mediaReadyEvent'
		];
		var embedPlayer = this.embedPlayer;
		var gP = function( eventName ){
			return embedPlayer.getKalturaConfig( 'omniture', eventName )
		};
		// Get all the plugin config for all the omniture events 
		$.each( omintureEvents , function( inx, eventName){
			var eventId = gP( eventName );
			if( ! eventId ){						
				return true; // next
			}
			var eVars = [];
			var props = [];
			
			// Look for up-to 10 associated eVars
			for( var i = 1 ; i < 10; i++ ){
				var eVarId = gP( eventName + 'Evar' + i ); 
				var eVarVal = gP( eventName + 'Evar' + i + 'Value' );
				// Stop looking for more eVars if we did not find one:
				if( ! eVarId ){
					break;
				}
				var v = {};
				v[eVarId] = embedPlayer.evaluate( eVarVal );
				eVars.push( v );
			}
			// Look for up-to 10 associated Props
			for( var i = 1 ; i < 10; i++ ){
				var ePropId = gP( eventName + 'Prop' + i );
				var ePropVal = gP( eventName + 'Prop' + i + 'Value' );
				if( !ePropId )
					break;
				var v = {};
				v[ePropId] = embedPlayer.evaluate( ePropVal );
				props.push( v );
				
			}
			// Add the binding: 
			var kEventName = eventName.replace( 'Event', '');
			embedPlayer.addJsListener( kEventName, function(){
				_this.dispatchEvent( eventId, eVars, props, kEventName);
			});
		});
 	},
 	/**
 	 * Dispatches an event to  
 	 * 
 	 * @param {String} eventId The omniture event id
 	 * @param {Object} eVars The set of eVar name value pairs
 	 * @param {Object} props The set of omniture props
 	 * @param {=String} eventName Optional eventName for logging ( not used in the omniture beacon )
 	 * @return
 	 */
 	dispatchEvent: function( eventId, eVars, props, eventName ){
 		// Dispatch the event across the iframe ( for debug )
 		$( this.embedPlayer ).trigger( 'Omniture_DispatchEvent', $.makeArray( arguments ) );
 		
 	}
};

} )( mw, jQuery );