mw.kalturaPluginWrapper(function(){
	
	mw.PluginManager.add( 'mirriadMarkers', mw.KBaseComponent.extend({
		defaultConfig: {
			'visible': false,
			'cueTargets':null, // the cuepoint files and enntries
			'cueType': null	// the current cuepoint type
		},
		setup:function(){
			var _this = this;
			// on player ready import cuePoint files and display on player
			this.bind("playerReady", function(){
				_this.handleCues();
			})
		},
		onConfigChange: function(attr, value){
			this.handleCues();
		},
		handleCues: function(){
			var _this = this;
			var cueFiles = this.getConfig('cueTargets');
			var cueSet = cueFiles[ this.getConfig( 'cueType') ];
			if( cueSet ){
				// load the cue file: 
				$.get( cueSet.cueFile, function(data){
					var segmentItems = $(data).find('embedSegments item');
					if( segmentItems ){
						_this.drawItems( segmentItems );
					}
				});
			}
		},
		drawItems:function( items ){
			var _this = this;
			var $scrubber = $('.scrubber');
			// remove any existing mirriadMarker
			$scrubber.find('.mirriadMarker').remove();
			$.each( items, function(na, item){
				var itemObj = _this.parseItem( item );
				// check for start time
				if( ! itemObj.start ){
					// continue;
					return true;
				}
				// map to pixel in scrubber
				var left = ( itemObj.start / _this.embedPlayer.duration )*100;
				var width = ( itemObj.duration / _this.embedPlayer.duration )*100;
				$scrubber.append(
					$('<div>')
					.addClass("mirriadMarker")
					.css({
						'left': left + '%',
						'width': width + '%'
					}).hover(function(){
						// update parent page
						_this.embedPlayer.triggerHelper( 'mirriadMarker', [ itemObj ]);
					})
				);
			})
		},
		parseItem: function( item){
			return {
				'start': parseFloat( $(item).find('startSeconds').text() ),
				'duration':  parseFloat( $(item).find('durationSeconds').text() ),
				'brand': $.trim( $(item).find("brand item").text() ),
				'target': $.trim( $(item).find("targets item").text() ),
			}
		}
	}))
});