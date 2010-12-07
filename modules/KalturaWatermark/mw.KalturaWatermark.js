

mw.KalturaWatermark = {
	'draw' : function( $watermarkConf, embedPlayer ){
		var watermarkCss = this.getCss( $watermarkConf );
		embedPlayer.$interface.append( 
			$j('<span />')
			.css( watermarkCss )
			.append( 
				$j('<a />').attr({
					'href' : $watermarkConf.attr('watermarkClickPath')
				}).append( 
					$j('<img />').attr({
						'src': $watermarkConf.attr('watermarkPath'),
						'id' : embedPlayer.id + '_' + $watermarkConf.attr('id')
					})
				)
			)
		)		
	},
	'getCss' : function( $watermarkConf ){
		var watermarkCss = {
				'position' : 'absolute',
				'z-index':2
				};
		switch( $watermarkConf.attr('watermarkPosition' ) ){
			case 'topRight': 
				watermarkCss.top = watermarkCss.right = '0px';
			break;
		}
		watermarkCss.padding = $watermarkConf.attr('padding') + 'px';
		return watermarkCss;
	}
};
