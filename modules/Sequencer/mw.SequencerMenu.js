// Wrap in mw closure to avoid global leakage
( function( mw ) {
	
mw.SequencerMenu = function( sequencer ) {
	return this.init( sequencer );
};

// Set up the mvSequencer object
mw.SequencerMenu.prototype = {
		
	init: function( sequencer ){
		this.sequencer = sequencer;
	},
	
	// menuConfig system uses auto-defined msg keys
	// ie "new" mwe-sequenceedit-menu-file-new
	menuConfig : {
		'sequence': {
			'menuItems':{
				'new': {
					'icon' : 'document',
					'shortCut': 'ctrl N',			
					'action' : function( _this ){
						mw.log("SequencerMenu::new sequence");
						_this.sequencer.getActionsSequence().newSequence();
					}
					
				},
				'open': {
					'icon' : 'folder-open',
					'shortCut' : 'ctrl O',
					'action' : function( _this ){
						mw.log("SequencerMenu::open");
						_this.sequencer.getActionsSequence().open();
					}
				},
				'divider': true,
				'save' : {
					'icon' : 'disk',
					'shortCut' : 'ctrl S',
					'action' : function( _this ){
						mw.log("SequencerMenu::save");
						_this.sequencer.getActionsSequence().save();
					}
				},
				'renderdisk' : {
					'icon' : 'gear',
					'action' : function( _this ){
						_this.sequencer.getRender().renderDialog();
					}
				}
			}
		},
		'edit':{
			'menuItems': {
				'undo': {
					'shortCut' : 'ctrl Z',
					'icon' : 'arrowreturnthick-1-w',
					'action': function( _this ){
						mw.log("SequencerMenu::undo");
					}
				},
				'redo' : {
					'shortCut' : 'ctrl Y',
					'icon' : 'arrowreturnthick-1-e',
					'action' : function( _this ){
						mw.log("SequencerMenu::redo");
					}
				},
				'divider': true,
				'selectall': {
					'action' : function( _this ){
						mw.log("SequencerMenu::selectall");
						_this.sequencer.getActionsEdit().selectAll();
					}
				}
			}
		},
		'view': {
			'menuItems': {
				'smilxml': {
					'icon' : 'script',
					'action': function( _this ){
						_this.sequencer.getActionsView().viewXML();
					}
				},
				'history': {	
					'icon' : 'clock',
					'action':function( _this ){
						mw.log("SequencerMenu::history");
					}						
				}
			}
		}
	},
	/**
	 * Draw the sequence menu
	 */
	drawMenu:function(){
		var _this = this;
		var $menuTarget = this.sequencer.getMenuTarget();	
		$menuTarget.empty();

		for( var topMenuKey in this.menuConfig ){			
			// Add the menu target		
			$menuTarget
			.append( 
				$j('<span />')
				.html( gM('mwe-sequenceedit-menu-' + topMenuKey )  )
				.css({
					'padding': '7px',
					'cursor' : 'default'
				})
				.attr( 'id', _this.sequencer.id + '_' + topMenuKey + '_topMenuItem')
				.addClass( 'ui-state-default' )
				.buttonHover()
		    	// Add menu binding: 
		    	.menu({ 
					content: _this.getMenuSet( _this.menuConfig, topMenuKey ),
					showSpeed: 100 
				})
			)
		}		
		
		// Check if we should include kaltura credits
		if( mw.getConfig( 'Sequencer.KalturaAttribution' ) ){
			$menuTarget.append(
				$j('<span />')
				.css({ 
					'float': 'right',
					'font-size': '12px'
				})
				.append( 
					gM('mwe-sequenceedit-sequencer_credit_line',
						'http://kaltura.com',
						'http://wikimedia.org'
					)
				)
			)
		}
	},
	/* return a top menuItem with all its associated menuItems */
	getMenuSet: function( menuConfig, menuKey ){
		var _this = this;
		// Build out the ul for the given menu
		var $menu = $j( '<ul />' )
			.attr({
				'id' : _this.sequencer.id + '_' + menuKey + '_content',
				'title' : gM('mwe-sequenceedit-menu-' + menuKey ) 
			});
		for( var menuItemKey in menuConfig[ menuKey ]['menuItems'] ){
			// Check for special divider key
			if( menuItemKey == 'divider'){
				$menu.append(
					$j('<li />')
					.addClass('divider')
					.append( $j('<hr />').css('width', '80%') )
				);
				continue;
			}			
			$menu.append(				
				_this.getMenuItem( menuKey, menuItemKey )
			)
		}
		return $menu;
	},
	// Get menu item 
	getMenuItem: function( menuKey, menuItemKey ){
		var _this = this;
		var menuItem = this.menuConfig[ menuKey ]['menuItems'][ menuItemKey ];
		$li = $j.getLineItem( 
			gM('mwe-sequenceedit-menu-' + menuKey + '-' + menuItemKey ),
			menuItem.icon, 
			function(){
				if( typeof menuItem.action == 'function'){
					menuItem.action( _this );
					return ;
				}
				mw.log( "Error:: SequencerMenu:: no action item for " + menuKey + '-' + menuItemKey );
			}
		)
		// Set the tooltip / title if provided
		if( mw.Language.isMsgKeyDefined( 'mwe-sequenceedit-menu-' + menuKey + '-' + menuItemKey + '-desc' ) ){
			$li.attr( 'title', gM('mwe-sequenceedit-menu-' + menuKey + '-' + menuItemKey + '-desc') )
		}
		return $li;
	}
	
};

} )( window.mw );