(function(){
	kWidget.addReadyCallback( function( playerId ){
		var kdp = $('#' + playerId ).get(0);
		kdp.kBind( 'mediaReady.limeSurveyCuePointForms', function() {
			if( kdp.evaluate( '{limeSurveyCuePointForms.plugin}' ) ){
				new limeSurveyCuePointForms( playerId );
			}
		});
	});
 
	//define the [pseudo] class for our plugin:
	limeSurveyCuePointForms = function( playerId ){
		return this.init( playerId );
	};
	
	limeSurveyCuePointForms.prototype = {
		pluginName: 'limeSurveyCuePointForms', //used to reference our 'class' name
		playerId: null, //used to reference the hosting player id, will be set in init with the given player id
        currentFormData: null,
		
		//this will be called upon instantiation - 
		init:function( player_id ){
			var _this = this;
			this.playerId = player_id;
			this.kdp = $('#' + this.playerId ).get(0);
			this.api = new kWidget.api( { 'wid' : this.getAttr( 'configProxy.kw.id' ) } );
			this.loadCuePoints( function( cuePoints ){
				_this.cuePoints = cuePoints;
				_this.monitorForCuePoint();
			});
		},
		monitorForCuePoint:function(){
			var _this = this;
			this.kdp.kBind('playerUpdatePlayhead', function( time ){
				$.each( _this.cuePoints, function( inx, cuePoint){
					if( time > ( cuePoint.startTime / 1000 ) 
						&&	
						! cuePoint.formDone
					){
						_this.activateFormForCuePoint( cuePoint );
						cuePoint.formDone = true;
					}
				});
			});
		},
		getFormContainerId: function(){
			return 'k-form-container-' + this.kdp.id;
		},
		activateFormForCuePoint: function( cuePoint ){
			var _this = this;
			// pause playback
			this.kdp.sendNotification('doPause');
			this.currentFormData = JSON.parse( cuePoint.partnerData );
			
			// Add a form to the player:
			var pos = $(this.kdp).position();
            
            //Get background color values:
            var bgalpha = this.getConfig('backgroundAlpha');
            var bgcolorRGB = this.hexToRgb(this.getConfig('backgroundHexColor'));
                
			// remove any old form:
			$( '#' + this.getFormContainerId() ).remove();
			$(this.kdp).after(
				$('<div>')
				.attr('id', this.getFormContainerId() )
				.css({
					'background-color': 'rgba('+bgcolorRGB.r+', '+bgcolorRGB.g+', '+bgcolorRGB.b+', '+bgalpha+')',
                    'border' : 'none',
					'position': 'absolute',
					'top' : pos.top,
					'left': pos.left,
					'width': $(_this.kdp ).width(),
					'height': $(_this.kdp).height() - 30 //TODO: change 30 to actual controlbar height using JS 
				}).append(
					$('<iframe>')
					.css({
                        'border' : 'none',
						'width':'100%',
						'height': '100%'
					})
					.attr('src', _this.currentFormData.limeSurveyURL + "?orgin=" + document.domain + "&playerId=" + _this.playerId )
				)
			)
			window.addEventListener("message", function(event){
                var hreflimeUrl = $('<a>').prop('href', _this.currentFormData.limeSurveyURL);
                var limeHostname = hreflimeUrl.prop('protocol') + '//' + hreflimeUrl.prop('hostname');
                if (event.origin !== limeHostname){
					return;
				}
                var messagePayload = JSON.parse(event.data);
				if( messagePayload.status == 'ok' && messagePayload.playerId == _this.playerId){
					setTimeout(function(){
						$( '#' + _this.getFormContainerId() ).fadeOut('fast');
						_this.kdp.sendNotification('doPlay');
					},  _this.currentFormData.fadeOutTimeMs);
				}
			}, false);
			
		},
		loadCuePoints: function( callback ){
			var _this = this;
			// do the api request
			this.api.doRequest({
					'service': 'cuepoint_cuepoint',
					'action': 'list',
					'filter:entryIdEqual': this.getAttr( 'mediaProxy.entry.id' ),
					'filter:objectType':'KalturaCuePointFilter',
					'filter:cuePointTypeEqual':	'annotation.Annotation',
					'filter:tagsLike' : this.getConfig('tags') || 'limeSurvey'
				},
				function( data ){
					// if an error pop out:
					//if( ! _this.handleDataError( data ) ){
					//	return ;
					//}
					callback( data.objects  );
				}
			);
		},
		//// --------------------------------------------
		//// Utility functions below
		//// --------------------------------------------
		
		// normalize flash kdp string values
		// makes flash and html5 return the same values for: null, true and false
		normalizeAttrValue: function( attrValue ){
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
		
		// wraps evaluate for easier access to player attributes 
		getAttr: function( attr ) {
			return this.normalizeAttrValue(
				this.kdp.evaluate( '{' + attr + '}' )
			);
		},
		
		// get any of this plugin configuration values
		getConfig : function( attr ) {
			return this.getAttr(this.pluginName + '.' + attr);
		},
        
        //calculate RGB components from hex color
        hexToRgb : function(hex) {
            // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function(m, r, g, b) {
                return r + r + g + g + b + b;
            });
        
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }
	}
})();
