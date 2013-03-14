(function(){
	kWidget.addReadyCallback( function( playerId ){
		var kdp = $('#' + playerId ).get(0);
		kdp.kBind( 'mediaReady.wuFooPlayerForm', function() {
			if( kdp.evaluate( '{wuFooPlayerForm.plugin}' ) ){
				new wuFooPlayerForm( playerId );
			}
		});
	});
 
	//define the [pseudo] class for our plugin:
	wuFooPlayerForm = function( playerId ){
		return this.init( playerId );
	};
	
	wuFooPlayerForm.prototype = {
		pluginName: 'wuFooPlayerForm', //used to reference our 'class' name
		playerId: null, //used to reference the hosting player id, will be set in init with the given player id
		
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
			var formData = JSON.parse( cuePoint.partnerData );
			
			// Add a form to the player:
			var pos = $(this.kdp).position();
			// remove any old form:
			$( '#' + this.getFormContainerId() ).remove();
			$(this.kdp).after(
				$('<div>')
				.attr('id', this.getFormContainerId() )
				.css({
					'background-color': 'rgba(255, 255, 255, .9)',
					'position': 'absolute',
					'top' : pos.top,
					'left': pos.left,
					'width': $(_this.kdp ).width(),
					'height': $(_this.kdp).height() - 30
				}).append(
					$('<iframe>')
					.css({
						'width':'100%',
						'height': '100%'
					})
					.attr('src', "http://www.kaltura.org/survey/index.php/864467/lang-en?orgin=" + window.URL )
				)
			)
			window.addEventListener("message", function(event){
				if (event.origin !== "http://www.kaltura.org"){
					return;
				}
				if( event.data == 'ok' ){
					$( '#' + _this.getFormContainerId() ).fadeOut('fast');
					_this.kdp.sendNotification('doPlay');
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
					'filter:tagsLike' : this.getConfig('tags') || 'wuFoo'
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
		}
	}
})();
