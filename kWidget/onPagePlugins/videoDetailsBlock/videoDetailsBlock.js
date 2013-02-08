(function(){
	//to get started with any on-page plugin, you must register to the onReadyCallback
	//onReadyCallback indicates that the player is ready for JavaScript bindings 
	kWidget.addReadyCallback( function( playerId ){
		var kdp = $('#' + playerId ).get(0);
 		kWidget.log('videoDetailsBlock plugin was loaded!');
		// We're only checking and instantiating the plugin on mediaReady notification, 
		// 		to make sure all configurations are properly lodaded.
		kdp.kBind( 'mediaReady.videoDetailsBlock', function() {
			// Here you can check player configuration ( if needed )
			// in this case we are checking if our plugin is enabled
			// For example you may have one uiConf defined onPage plugin resource
			// but turn off a given plugin on a particular with flashvars:
			// flashvars="&fooBar.plugin=false"
	 		// Also keep in mind you could have multiple players on a page. 
			if( kdp.evaluate( '{videoDetailsBlock.plugin}' ) ){
				//instantiate your plugin -
				new videoDetailsBlock( playerId );
				kWidget.log('plugin was instantiated!');
			}
		});
	});
 
	//define the [pseudo] class for our plugin:
	videoDetailsBlock = function( playerId ){
		return this.init( playerId );
	};
	
	videoDetailsBlock.prototype = {
		pluginName: 'videoDetailsBlock', //used to reference our 'class' name
		playerId: null, //used to reference the hosting player id, will be set in init with the given player id
		
		//this will be called upon instantiation - 
		init:function( player_id ){
			this.playerId = player_id;
			this.kdp = $('#' + this.playerId ).get(0);
			this.addVideoDetailsBlock();
			this.addPlayerBindings();
		},
		
		// this will add the video details block appended to the player -
		addVideoDetailsBlock:function(){
			var vidTitle = this.getConfig('customTitle') || this.getAttr('mediaProxy.entry.name');
			var vidDescription = this.getAttr('mediaProxy.entry.description');
			var vidTags = this.getAttr('mediaProxy.entry.tags');
			var tagsArr = vidTags ? vidTags.split(",") : [];
			kWidget.log('video details: ', vidTitle, vidDescription, vidTags);
			
			//remove the old one (in case we're being called again for the same player) -
			$('#videoDetailsBlock-' + this.playerId).remove();
			
			//create a new block for that player -
			var $block = $('<div class="videoDetailsBlock" id="videoDetailsBlock-' + this.playerId + '">'+
								'<h1 id="video-title-' + this.playerId + '"></h1>'+
								'<p id="video-desc-' + this.playerId + '"></p>'+
								'<ul class="tags" id="tags-' + this.playerId + '"></ul>'+
								'<div style="clear:both;"></div>'+
							'</div>');
			
			//if we have a target div - replace it's contents with the details block
			//that way our details block will inherit the css from its parent target div
			var targetDivId = this.getConfig('targetDiv');
			if (targetDivId) {
				$('#' + targetDivId).html($block);
			} else {
				//if we don't have a target div - add the details block relative to the player's position
				switch( this.getConfig('blockRelativePosition') ){
					case 'before':
						$(this.kdp).css( 'float', 'none').before($block);
					break;
					case 'left':
						$(this.kdp).css('float', 'left');
						$block.css('float', 'left').insertBefore(this.kdp);
					break;
					case 'right':
						$block.css('float', 'left').insertAfter(this.kdp);
						$(this.kdp).css('float', 'left' );
					break;
					case 'after':
					default:
						$(this.kdp).css( 'float', 'none').after($block);
					break;
				}
				//and set it's width to fit the player's width
				var paddingLeft = parseFloat($('#videoDetailsBlock-' + this.playerId).css('paddingLeft').replace("px", ""));
				$('#videoDetailsBlock-' + this.playerId).css('maxWidth', $(this.kdp).width()-(paddingLeft*2)-2);
			}
			
			//render the tags to the page -
			_playerId = this.playerId;
			$.each(tagsArr, function(index, value) {
				$('#videoDetailsBlock-' + _playerId + ' .tags').append('<li><a>'+$.trim(value)+'</a></li>');
			});
			
			$('#video-title-' + this.playerId).text(vidTitle);
			$('#video-desc-' + this.playerId).text(vidDescription);
			
			if (this.getConfig('showTransition')) {
				$block.css('display', 'none');
				var showDuration = parseInt(this.getConfig('showTransitionDuration'));
				$block.slideDown(showDuration > 0 ? showDuration : 300);
			}
		},
		
		// Register listeners to kdp notifications:
		// List of supported listeners across html5 and kdp is available here:
		// http://html5video.org/wiki/Kaltura_KDP_API_Compatibility
		addPlayerBindings:function(){
			
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
