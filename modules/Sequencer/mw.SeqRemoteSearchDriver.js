/* the sequence remote search driver
*	extends the base remote search driver for use in the sequencer 
*/

mw.SeqRemoteSearchDriver = function( mySequence ) {
	return this.init( mySequence )
}

mw.SeqRemoteSearchDriver.prototype = {
	sequence_add_target:false,
	init:function( mySequence ) {
		var _this = this;
		mw.log( "init:seqRemoteSearchDriver" );
		
		// Setup remote search driver with a seq parent:
		this.pSeq = mySequence;
		var options = {
			'target_container'	: '#cliplib_ic',
			'instance_name'		: mySequence.instance_name + '.mySearch',
			'default_query'		: this.pSeq.plObj.title
		}
		
		// Extend the options with any sequencer provided add-media-wizard config
		if ( typeof mySequence.amw_conf != 'undefined' )
			$j.extend( options,  mySequence.amw_conf );
			
	
		// Inherit the remoteSearchDriver properties:n
		var tmpRemoteSearchDriver = new mw.RemoteSearchDriver( options );
		for ( var i in tmpRemoteSearchDriver ) {
			if ( this[i] ) {
				this['parent_' + i] = tmpRemoteSearchDriver[i];
			} else {
				this[i] = tmpRemoteSearchDriver[i];
			}
		}
		
		// Extend parent_do_refresh_timeline actions:
		if ( !this.pSeq.parent_do_refresh_timeline ) {
			this.pSeq.parent_do_refresh_timeline = this.pSeq.do_refresh_timeline;
			this.pSeq.do_refresh_timeline = function() {
				mw.log( "seqRemoteSearchDriver::" + _this.pSeq.disp_menu_item );
				// call the parent
				_this.pSeq.parent_do_refresh_timeline();
				//Add our local bindings
				_this.addResultBindings();
				return true;
			}
		}
	},
	addResultBindings:function() {
		// set up seq:
		var _this = this;
		// setup parent bindings:
		this.parent_addResultBindings();

		// Add an additional click binding
		$j( '.rsd_res_item' ).click( function() {
			mw.log( 'SeqRemoteSearch: rsd_res_item: click (remove sequence_add_target)' );
			_this.sequence_add_target = false;
		} );

		// Add an additional drag binding
		$j( '.rsd_res_item' ).draggable( 'destroy' ).draggable( {
			helper:function() {
				return $j( this ). clone ().appendTo( 'body' ).css( { 'z-index':9999 } ).get( 0 );
			},
			revert:'invalid',
			start:function() {
				mw.log( 'start drag' );
			}
		} );
		$j( ".mv_clip_drag" ).droppable( 'destroy' ).droppable( {
			accept: '.rsd_res_item',
			over:function( event, ui ) {
				// mw.log("over : mv_clip_drag: " + $j(this).attr('id') );
				$j( this ).css( 'border-right', 'solid thick red' );
			},
			out:function( event, ui ) {
				$j( this ).css( 'border-right', 'solid thin white' );
			},
			drop: function( event, ui ) {
				$j( this ).css( 'border-right', 'solid thin white' );
				mw.log( "Droped: " + $j( ui.draggable ).attr( 'id' ) + ' on ' +  $j( this ).attr( 'id' ) );
				_this.sequence_add_target =  $j( this ).attr( 'id' );
				// load the original draged item
				var rObj = _this.getResourceFromId( $j( ui.draggable ).attr( 'id' ) );
				_this.showResourceEditor( rObj, ui.draggable );
			}
		} );

	},
	insertResource:function( rObj ) {
		var _this = this;
		mw.log( "SEQ insert resource after:" + _this.sequence_add_target  + ' of type: ' + rObj.mime );
		if ( _this.sequence_add_target ) {
			var tClip = _this.pSeq.getClipFromSeqID( _this.sequence_add_target );
			var target_order = false;
			if ( tClip )
				var target_order = tClip.order;
		}
				
		// Check if the file is already Available
		this.isFileLocallyAvailable( rObj, function( status ) {

			var clipConfig = {
				'type' 	 : rObj.mime,
				'uri' 	 : _this.fileNS + ':' + rObj.target_resource_title,
				'title'	 : rObj.title
			};
			
			// Set via local properties if available 
			clipConfig['src'] = ( rObj.local_src ) ? rObj.local_src : rObj.src;
			clipConfig['poster'] = ( rObj.local_poster ) ? rObj.local_poster : rObj.poster;

			if ( rObj.start_time && rObj.end_time ) {
				clipConfig['dur'] = mw.npt2seconds( rObj.end_time ) - mw.npt2seconds( rObj.start_time );
			} else {
				// Provide a default duration if none set
				clipConfig['dur'] = 4;
			}

			// Create the media element (target order+1 (since we insert (after)
			_this.pSeq.plObj.tryAddMediaObj( clipConfig, ( parseInt( target_order ) + 1 ) );
			
			// Refresh the timeline:
			_this.pSeq.do_refresh_timeline();
			mw.log( "run close all: " );
			_this.closeAll();
		} );
	},
	getClipEditControlActions:function() {
		var _this = this;
		return {
			'insert_seq':function( rObj ) {
				_this.insertResource( rObj )
			},
			'cancel':function( rObj ) {
				_this.cancelClipEditCB( rObj )
			}
		};
	},
	showResourceEditor:function( rObj, rsdElement ) {
		var _this = this;
		// Open up a new target_contaienr:
		if ( $j( '#seq_resource_import' ).length == 0 )
			$j( 'body' ).append( '<div id="seq_resource_import" style="position:relative"></div>' );
			
		var buttons = { };
		buttons[ gM( 'mwe-cancel' ) ] = function() {
			$j( this ).dialog( "close" );
		}
		
		$j( '#seq_resource_import' ).dialog( 'destroy' ).dialog( {
			bgiframe: true,
			width:750,
			height:480,
			modal: true,
			buttons: buttons
		} );
		_this.target_container = '#seq_resource_import';
		// do parent resource edit (with updated target)
		this.parent_showResourceEditor( rObj, rsdElement );
	},
	closeAll:function() {
		mw.log( 'should close: seq_resource_import' );
		$j( '#seq_resource_import' ).dialog( 'close' ).dialog( 'destroy' ).remove();
		// Unhide the results container
		$j( '#rsd_results_container' ).show();
		//this.parent_closeAll();
	},
	getEditToken:function( callback ) {
		if ( this.pSeq.sequenceEditToken ) {
			callback( this.pSeq.sequenceEditToken )
		} else {
			this.parent_getEditToken( callback );
		}
	},
	cancelClipEditCB:function() {
		mw.log( 'seqRSD:cancelClipEditCB' );
		$j( '#seq_resource_import' ).dialog( 'close' ).dialog( 'destroy' ).remove();
	}
};

