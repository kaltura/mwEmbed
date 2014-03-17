mw.kalturaPluginWrapper(function(){
	
	mw.PluginManager.add( 'mirriadMarkers', mw.KBaseComponent.extend({
		defaultConfig: {
			'visible': false,
			'cueTargets':null, // the cuepoint files and entries
			'cueType': null	// the current cuepoint type
		},
		setup:function(){
			var _this = this;
			// on player ready import cuePoint files and display on player
			this.bind("playerReady", function(){
				_this.handleCues();
			})
			
			this.bind( "monitorEvent", function(){
				if( !_this.currentItems ){
					return ;
				}
				$.each( _this.currentItems, function(na, item){
					var itemObj = _this.parseItem( item );
					if( parseInt( itemObj.start ) == parseInt( _this.embedPlayer.currentTime ) ){
						_this.embedPlayer.triggerHelper( 'mirriadMarker', [ itemObj ] );
					}
				});
			});
		},
		onConfigChange: function(attr, value){
			this.handleCues();
		},
		handleCues: function(){
			var _this = this;
			// remove any existing mirriadMarker
			$('.scrubber').find('.mirriadMarker').remove();
			var cueFiles = this.getConfig('cueTargets');
			var cueSet = cueFiles[ this.getConfig( 'cueType') ];
			if( cueSet ){
				// make sure media is aligned: 
				// TODO should just issue backed HLS call. 
				if( cueSet.entry && this.embedPlayer.kentryid != cueSet.entry){
					// get current time: 
					var isPlaying = this.embedPlayer.isPlaying();
					var ct = this.embedPlayer.currentTime;
					this.embedPlayer.setKDPAttribute('mediaProxy', 'mediaPlayFrom', ct );
					this.bind('onChangeMediaDone', function(){
						_this.unbind('onChangeMediaDone');
						_this.loadAndDrawCueSet( cueSet.cueFile );
						if( isPlaying ){
							_this.embedPlayer.play();
						}
					})
					this.embedPlayer.sendNotification( 'changeMedia', { 'entryId': cueSet.entry } );
					return ;
				}
				// load the and draw cue file: 
				this.loadAndDrawCueSet( cueSet.cueFile );
			}
		},
		loadAndDrawCueSet:function( cueFile ){
			var _this = this;
			$.get( cueFile, function(data){
				var segmentItems = $(data).find('embedSegments item');
				if( segmentItems ){
					_this.currentItems = segmentItems;
					_this.drawItems();
				}
			});
		},
		drawItems:function( items ){
			var _this = this;
			var $scrubber = $('.scrubber');
			$.each( this.currentItems, function(na, item){
				var itemObj = _this.parseItem( item );
				// check for a non-zero defined duration
				if( !itemObj.duration ){
					// continue;
					return true;
				}
				// map to pixel in scrubber
				var left = ( itemObj.start / _this.embedPlayer.duration ) * 100;
				var width = ( itemObj.duration / _this.embedPlayer.duration ) * 100;
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