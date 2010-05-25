/*
* mvTimedEffectsEdit
*
* for now just simple single stack transition control
*
*/

// Add our local msgs
mw.addMessages( {
	"mwe-transition_in" : "Transition in",
	"mwe-transition_out" : "Transition out",
	"mwe-effects" : "Effects stack",
	"mwe-remove_transition" : "Remove transition",
	"mwe-edit_transin" : "Edit transition into clip",
	"mwe-edit_transout" : "Edit transition out of clip",
	"mwe-add-transition" : "Add a transition"
} );

var default_timed_effect_values = {

	// The Resource Object
	'rObj':	null,
			 
	// Target Display Clip	
	'clip_disp_ct':null, 
	
	// Control container
	'control_ct':null,	 

	// Parent container
	'parent_ct': null,
		 
	// Parent sequence Object
	'pSeq': null,	 

	// The requested edit action
	'edit_action': null
}

mw.TimedEffectsEdit = function( options ) {
	return this.init( options );
};

// Set up the TimedEffectsEdit object
mw.TimedEffectsEdit.prototype = {
	
	// Menu_items Object contains: default html, js setup/loader functions
	menu_items : {
		'transin': {
			'title':gM( 'mwe-transition_in' ),
			'clip_attr':'transIn',
			'doEdit':function( _this ) {
				_this.doTransitionDisplayEdit( 'transin' );
			}
		},
		'transout': {
			'title':gM( 'mwe-transition_out' ),
			'clip_attr':'transOut',
			'doEdit':function( _this ) {
				_this.doTransitionDisplayEdit( 'transout' );
			}
		},
		'effects': {
			'title':gM( 'mwe-effects' ),
			'clip_attr':'Effects',
			'doEdit':function( _this ) {
				// display
				_this.doEditEffectDisplayEdit();
			}
		}
	},
	init:function( options ) {
		// Init object:
		for ( var i in default_timed_effect_values ) {
			if ( options[i] ) {
				this[i] = options[i];
			}
		}
		this.doEditMenu();
	},
	doEditMenu:function() {
		mw.log( 'mvTimedEffects : doEditMenu::' );
		var _this = this;
		// add in subMenus if set
		// check for submenu and add to item container

		// update the default edit display (if we have a target)
		var tTarget = 'transin';
		if ( this.rObj.transOut )
			tTarget = 'transout';
		if ( this.rObj.effects )
			tTarget = 'effects';

		var o = '';
		var tabc = '';
		o += '<div id="mv_submenu_timedeffect">';
		o += '<ul>';
		var inx = 0;
		var selected_tab = 0;
		$j.each( this.menu_items, function( sInx, mItem ) {
			if ( sInx == tTarget ) {
				selected_tab = inx;
			}
			// check if the given editType is valid for our given media type
			o +=	'<li>' +
					'<a id="mv_te_' + sInx + '" href="#te_' + sInx + '">' + mItem.title + '</a>' +
				'</li>';
			tabc += '<div id="te_' + sInx + '" style="overflow:auto;" ></div>';
			inx++;
		} );
		o += '</ul>' + tabc;
		o += '</div>';
		// add sub menu container with menu html:
		$j( '#' + this.control_ct ).html( o ) ;
		mw.log( 'should have set: #' + this.control_ct + ' to: ' + o );
		// set up bindins:
		$j( '#mv_submenu_timedeffect' ).tabs( {
			selected: selected_tab,
			select: function( event, ui ) {
				_this.showEditUI( $j( ui.tab ).attr( 'id' ).replace( 'mv_te_', '' ) );
			}
		} ).addClass( 'ui-tabs-vertical ui-helper-clearfix' );
		// close left:
		$j( "#mv_submenu_clipedit li" ).removeClass( 'ui-corner-top' ).addClass( 'ui-corner-left' );
		_this.showEditUI( tTarget );
	},
	showEditUI:function( tab_id ) {
		// @@todo fix the double display of showEditUI
		mw.log( "showEditUI::" );
		if ( !this.menu_items[ tab_id ] ) {
			mw.log( 'error: showEditUI missing item:' + tab_id );
		} else {
			// use the menu_item config to map to function display
			this.menu_items[tab_id].doEdit( this );
		}
	},
	doEditEffectDisplayEdit:function() {
		var _this = this;
		var appendTarget = '#te_effects';
		mw.log( 'type:' + _this.rObj['type'] );
		$j( appendTarget ).html( gM( 'mwe-loading_txt' ) );
		// @@todo integrate into core and loading system:
		loadExternalJs( mw.getMwEmbedPath() + 'libClipEdit/pixastic-editor/editor.js?' + getMwReqParam() );
		loadExternalJs( mw.getMwEmbedPath() + 'libClipEdit/pixastic-editor/pixastic.all.js?' + getMwReqParam() );
		loadExternalJs( mw.getMwEmbedPath() + 'libClipEdit/pixastic-editor/ui.js?' + getMwReqParam() );
		loadExternalJs( mw.getMwEmbedPath() + 'libClipEdit/pixastic-editor/uidata.js?' + getMwReqParam() );
		mw.getStyleSheet( mw.getMwEmbedPath() + 'libClipEdit/pixastic-editor/pixastic.all.js?' + getMwReqParam() );

		var isPixasticReady = function() {
			if ( typeof PixasticEditor != 'undefined' ) {
				$j( appendTarget ).html( '<a href="#" class="run_effect_demo">Run Pixastic Editor Demo</a> (not yet fully integrated/ super alpha)<br> best to view <a href="http://www.pixastic.com/editor-test/">stand alone</a>' );
				$j( appendTarget + ' .run_effect_demo' ).click( function() {
					var cat = _this;
					var imgElm = $j( '.clip_container:visible  img' ).get( 0 );
					PixasticEditor.load( imgElm );
				} );
			} else {
				setTimeout( isPixasticReady, 100 )
			}
		}
		isPixasticReady();
	},
	doTransitionDisplayEdit:function( target_item ) {
		var _this = this;
		mw.log( "doTransitionDisplayEdit: " + target_item );
		var apendTarget = '#te_' + target_item;
		// check if we have a transition of type clip_attr
		if ( !this.rObj[ this.menu_items[ target_item ].clip_attr ] ) {
			// empty append the transition list:
			this.getTransitionListControl( apendTarget );
			return ;
		}
		var cTran = this.rObj[ this.menu_items[ target_item ].clip_attr ];
		var o = '<h3>' + gM( 'mwe-edit_' + target_item ) + '</h3>';
		o += 'Type: ' +
			'<select class="te_select_type">';
		for ( var typeKey in mvTransLib.type ) {
			var selAttr = ( cTran.type == typeKey ) ? ' selected':'';
			o += '<option	value="' + typeKey + '"' + selAttr + '>' + typeKey + '</option>';
		}
		o += '</select><br>';
		o += '<span class="te_subtype_container"></span>';

		// add html and select bindings
		$j( apendTarget ).html( o ).children( '.te_select_type' )
			.change( function() {
				var selectedType = $j( this ).val();
				// update subtype listing:
				_this.getSubTypeControl( target_item, selectedType, apendTarget + ' .te_subtype_container' );
			} );
		// add subtype control
		_this.getSubTypeControl( target_item, cTran.type, apendTarget + ' .te_subtype_container' );

		// add remove transition button:
		$j( apendTarget ).append( '<br><br>' + $j.btnHtml( gM( 'mwe-remove_transition' ), 'te_remove_transition', 'close'  ) )
			.children( '.te_remove_transition' )
			.click( function() {
				// remove the transtion from the playlist
				_this.pSeq.plObj.transitions[cTran.id] = null;
				// remove the transtion from the clip:
				_this.rObj[ _this.menu_items[ target_item ].clip_attr ] = null;
				// update the interface:
				_this.doTransitionDisplayEdit( target_item );
				// update the sequence
				_this.pSeq.do_refresh_timeline();
			} );
	},
	getSubTypeControl:function( target_item, transition_type, htmlTarget ) {
		var _this = this;
		var cTran = this.rObj[ this.menu_items[ target_item ].clip_attr ];
		var o = 'Sub Type:<select class="te_subtype_select">';
		for ( var subTypeKey in mvTransLib.type[ transition_type ] ) {
			var selAttr = ( cTran.subtype == subTypeKey ) ? ' selected' : '';
			o += '<option	value="' + subTypeKey + '"' + selAttr + '>' + subTypeKey + '</option>';
		}
		o += '</select><br>';
		$j( htmlTarget ).html( o )
			.children( '.te_subtype_select' )
			.change( function() {
				// update the property
				cTran.subtype = $j( this ).val();
				// re-gen timeline / playlist
				_this.pSeq.do_refresh_timeline();
				// (re-select self?)
				_this.getSubTypeControl( target_item, transition_type, htmlTarget );
		} );
		var o = '';
		// check for extra properties control:
		for ( var i = 0; i < mvTransLib.type[ transition_type ][ cTran.subtype ].attr.length; i++ ) {
			var tAttr = mvTransLib.type[ transition_type ][ cTran.subtype ].attr[i]
			switch( tAttr ) {
				case 'fadeColor':
					var cColor = ( cTran['fadeColor'] ) ? cTran['fadeColor']:'';
					$j( htmlTarget ).append( 'Select Color: <div class="colorSelector"><div class="colorIndicator" style="background-color: ' + cColor + '"></div></div>' );
					mw.log( 'cs target: ' + htmlTarget + ' .colorSelector' );


					$j( htmlTarget + ' .colorSelector' ).ColorPicker( {
						color: cColor,
						onShow: function ( colpkr ) {
							// make sure its ontop:
							$j( colpkr ).css( "zIndex", "12" );
							$j( colpkr ).fadeIn( 500 );
							return false;
						},
						onHide: function ( colpkr ) {
							$j( colpkr ).fadeOut( 500 );
							_this.pSeq.plObj.setCurrentTime( 0, function() {
								mw.log( "render ready" );
							} );
							return false;
						},
						onChange: function ( hsb, hex, rgb ) {
							$j( htmlTarget + ' .colorIndicator' ).css( 'backgroundColor', '#' + hex );
							// update the transition
							cTran['fadeColor'] =  '#' + hex;
						}
					} )
				break;
			}
		}
		// and finally add effect timeline scruber (for timed effects this also stores keyframes)

	},
	getTransitionListControl : function( target_out ) {
		mw.log( "getTransitionListControl" );
		var o = '<h3>' + gM( 'mwe-add-transition' ) + '</h3>';
		for ( var type in mvTransLib['type'] ) {
			mw.log( 'on tran type: ' + type );			
			var tLibSet = mvTransLib['type'][ type ];
			for ( var subtype in tLibSet ) {
				o += '<img style="float:left;padding:10px;" ' +
					'src="' + mvTransLib.getTransitionIcon( type, subtype ) + '">';
			}
		}
		$j( target_out ).html( o );
	}
};
