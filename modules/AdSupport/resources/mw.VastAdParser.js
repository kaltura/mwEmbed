/**
 * VAST ad parser ( presently just works with VAST once there are more ad formats
 * we could abstract common parts of this parser process.
 */
( function( mw, $ ) { "use strict";

mw.VastAdParser = {
	/**
	 * VAST support
	 * Convert the vast ad display format into a display conf:
	 */
	parse: function( xmlObject, callback ){
		var _this = this;
		var adConf = {};
		var $vast = $( xmlObject );

		// Check for Vast Wrapper response
		if( $vast.find('Wrapper').length && $vast.find('VASTAdTagURI').length) {
			var adUrl = $vast.find('VASTAdTagURI').text();
			mw.log('VastAdParser:: Found vast wrapper, load ad: ' + adUrl);
			mw.AdLoader.load( adUrl, callback, true );
			return ;
		}

		// Get the basic set of sequences
		adConf.ads = [];
		$vast.find( 'Ad' ).each( function( inx, node ){
			mw.log( 'VastAdParser:: getVastAdDisplayConf: ' + node );
			var $ad = $( node );

			// Set a local pointer to the current sequence:
			var currentAd = { 'id' : $ad.attr('id') };
			//get ad sequence
			var sequence = $ad.attr('sequence');
			if (sequence!==undefined){
			    currentAd.sequence = parseInt(sequence);
			}

			// Set duration
			if( $ad.find('duration') ){
				currentAd.duration = mw.npt2seconds( $ad.find( 'duration' ).text() );
			}

			// Set impression urls
			currentAd.impressions = [];
			$ad.find( 'Impression' ).each( function(na, node){
				// Check if there is lots of impressions or just one:
				if( $(node).find('URL').length ){
					$ad.find('URL').each( function( na, urlNode ){
						currentAd.impressions.push({
							'beaconUrl' : _this.getURLFromNode( urlNode ),
							'idtype' : $( urlNode ).attr('id')
						});
					});
				} else {
					currentAd.impressions.push({
						'beaconUrl' : _this.getURLFromNode( node )
					});
				}
			});

			// Set Non Linear Ads
			currentAd.nonLinear = [];
			$ad.find( 'NonLinearAds NonLinear' ).each( function( na, nonLinearNode ){
				var staticResource = _this.getResourceObject( nonLinearNode );
				if( staticResource ){
					// Add the staticResource to the ad config:
					currentAd.nonLinear.push( staticResource );
				}
			});

			// Set tracking events:
			currentAd.trackingEvents = [];
			// Check for Linear descendant ( double click vast XML has multiple trackingEvents per Linear and non-Linear and
			var selector = 'trackingEvents Tracking';
			var $inlineLinear = $ad.find( 'InLine Linear');
			if( $inlineLinear.length ){
			    selector = 'InLine Linear ' + selector;
			    currentAd.skipoffset = $inlineLinear.attr('skipoffset');
			}
			$ad.find( selector ).each( function( na, trackingNode ){
				currentAd.trackingEvents.push({
					'eventName' : $( trackingNode ).attr('event'),
					'beaconUrl' : _this.getURLFromNode( trackingNode )
				});
			});

			currentAd.videoFiles = [];
			// Set the media file:
			$ad.find('MediaFiles MediaFile').each( function( na, mediaFile ){
				// Add the video source ( if an html5 compatible type )
				var type  = $( mediaFile ).attr('type');
				// Normalize mp4 into h264 format:
				if( type  == 'video/x-mp4' || type == 'video/mp4' ){
					type = 'video/h264';
				}

				if(  type == 'video/h264' || type == 'video/ogg' || type == 'video/webm' ){
					var source = {
							'src' :_this.getURLFromNode( mediaFile ),
							'type' : type
						};
					if( $( mediaFile ).attr('bitrate') ){
						source['data-bandwith']  = $( mediaFile ).attr('bitrate')* 1024;
					}
					if( $( mediaFile ).attr('width') ){
						source['data-width'] =  $( mediaFile ).attr('width');
					}
					if( $( mediaFile ).attr('height') ){
						source['data-height'] =  $( mediaFile ).attr('height');
					}
					// Add the source object:
					currentAd.videoFiles.push( source );
					mw.log( "VastAdParser::add MediaFile:" + _this.getURLFromNode( mediaFile ) );
				}
			});

			// Look for video click through:
			$ad.find('VideoClicks ClickThrough').each( function(na, clickThrough){
				currentAd.clickThrough = _this.getURLFromNode( clickThrough );
			});

			// Skip if no videoFile set:
			if( currentAd.videoFiles.length == 0 ){
				mw.log( 'Error:; VastAdParser::MISSING videoFile no video url: ( skip ) ');
				//currentAd.videoFiles = mw.getConfig( 'Kaltura.MissingFlavorSources');
			}
			// Set the CompanionAds if present:
			currentAd.companions = [];
			$ad.find('CompanionAds Companion').each( function( na, companionNode ){
				var staticResource = _this.getResourceObject( companionNode );
				if( staticResource ){
					// Add the staticResourceto the ad config:
					currentAd.companions.push( staticResource );
				}
			});
			adConf.ads.push( currentAd );
		});
		// Run callback we adConf data
		callback( adConf );
	},

	// Return a static resource object
	getResourceObject: function( resourceNode ){
		var _this = this;
		// Build the curentCompanion
		var resourceObj = {};
		var companionAttr = [ 'width', 'height', 'id', 'expandedWidth', 'expandedHeight' ];
		$j.each( companionAttr, function(na, attr){
			if( $( resourceNode ).attr( attr ) ){
				resourceObj[ attr ] = $( resourceNode ).attr( attr );
			}
		});

		// Check for attribute based static resource:
		if( $( resourceNode ).attr('creativeType')  && $( resourceNode ).attr('resourceType') == 'static' ){
			var link = _this.getURLFromNode ( $( resourceNode ).find('NonLinearClickThrough') );
			resourceObj.$html = $('<a />')
			.attr({
				'href' : link,
				'target' : '_new'
			}).append(
				$( '<img/>').attr({
					'src': _this.getURLFromNode ( resourceNode ),
					'width' : resourceObj['width'],
					'height' : resourceObj['height']
				})
			);
		};

		// Check for companion type:
		if( $( resourceNode ).find( 'StaticResource' ).length ) {
			if( $( resourceNode ).find( 'StaticResource' ).attr('creativeType') ) {
				resourceObj.$html = _this.getStaticResourceHtml( resourceNode, resourceObj );
				mw.log("VastAdParser::getResourceObject: StaticResource \n" + $('<div />').append( resourceObj.$html ).html() );
			}
		}

		// Check for iframe type
		if( $( resourceNode ).find('IFrameResource').length ){
			mw.log("VastAdParser::getResourceObject: IFrameResource \n" + _this.getURLFromNode ( $( resourceNode ).find('IFrameResource') ) );
			resourceObj.$html =
				$('<iframe />').attr({
					'src' : _this.getURLFromNode ( $( resourceNode ).find('IFrameResource') ),
					'width' : resourceObj['width'],
					'height' : resourceObj['height'],
					'border' : '0px'
				});
		}

		// Check for html type
		if( $( resourceNode ).find('HTMLResource').length ){
			mw.log("VastAdParser::getResourceObject:  HTMLResource \n" + _this.getURLFromNode ( $( resourceNode ).find('HTMLResource') ) );
			// Wrap the HTMLResource in a jQuery call:
			resourceObj.$html = $( _this.getURLFromNode ( $( resourceNode ).find('HTMLResource') ) );
		}
		// If no resource html was built out return false
		if( !resourceObj.$html){
			return false;
		}
		// Export the html to static representation:
		resourceObj.html = $('<div />').html( resourceObj.$html ).html();

		return resourceObj;
	},
	/**
	 * Get html for a static resource
	 * @param {Object}
	 * 		companionNode the xml node to grab companion info from
	 * @param {Object}
	 * 		companionObj the object which stores parsed companion data
	 */
	getStaticResourceHtml: function( companionNode, companionObj ){
		var _this = this;
		companionObj['contentType'] = $( companionNode ).find( 'StaticResource' ).attr('creativeType');
		companionObj['resourceUri'] = _this.getURLFromNode(
			$( companionNode ).find( 'StaticResource' )
		);

		// Build companionObj html
		var $companionHtml = $('<div />');
		switch( companionObj['contentType'] ){
			case 'image/gif':
			case 'image/jpeg':
			case 'image/png':
				var $img = $('<img />').attr({
					'src' : companionObj['resourceUri']
				})
				.css({
					'width' : companionObj['width'] + 'px',
					'height' : companionObj['height'] + 'px'
				});

				if( $( companionNode ).find('AltText').text() != '' ){
					$img.attr('alt', _this.getURLFromNode(
							 $( companionNode ).find('AltText')
						)
					);
				}
				// Add the image to the $companionHtml
				if( $( companionNode ).find('CompanionClickThrough').text() != '' ){
					$companionHtml = $('<a />')
						.attr({
							'href' : _this.getURLFromNode(
								$( companionNode ).find('CompanionClickThrough,NonLinearClickThrough')[0]
							)
						}).append( $img );
				} else {
					$companionHtml = $img;
				}
			break;
			case 'application/x-shockwave-flash':
				var flashObjectId = $( companionNode ).attr('id') + '_flash';
				// @@FIXME we have to A) load this via a proxy
				// and B) use smokescreen.js or equivalent to "try" and render on iPad
				$companionHtml =  $('<OBJECT />').attr({
						'classid' : "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
						'codebase' : "http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,40,0",
						'WIDTH' : companionObj['width'] ,
						"HEIGHT" :  companionObj['height'],
						"id" : flashObjectId
					})
					.append(
						$('<PARAM />').attr({
							'NAME' : 'movie',
							'VALUE' : companionObj['resourceUri']
						}),
						$('<PARAM />').attr({
							'NAME' : 'quality',
							'VALUE' : 'high'
						}),
						$('<PARAM />').attr({
							'NAME' : 'bgcolor',
							'VALUE' : '#FFFFFF'
						}),
						$('<EMBED />').attr({
							'href' : companionObj['resourceUri'],
							'quality' : 'high',
							'bgcolor' :  '#FFFFFF',
							'WIDTH' : companionObj['width'],
							'HEIGHT' : companionObj['height'],
							'NAME' : flashObjectId,
							'TYPE' : "application/x-shockwave-flash",
							'PLUGINSPAGE' : "http://www.macromedia.com/go/getflashplayer"
						})
					);
			break;
		}
		return $companionHtml;
	},
	/**
	 * There does no seem to be a clean way to get CDATA node text via jquery or
	 * via native browser functions. So here we just strip the CDATA tags and
	 * return the text value
	 */
	getURLFromNode: function ( node ){
		if( $( node ).find('URL').length ){
			// use the first url we find:
			node = $( node ).find( 'URL' )[0];
		}
		return $j.trim( decodeURIComponent( $( node ).text() )  )
			.replace( /^\<\!\-?\-?\[CDATA\[/, '' )
			.replace(/\]\]\-?\-?\>/, '');
	}
};

} )( window.mw, window.jQuery );
