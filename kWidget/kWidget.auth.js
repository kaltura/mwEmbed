/**
* A simple authentication api for consuming KS from kaltura authenticated api provider
*/
(function(kWidget){ "use strict"
	
	if( !kWidget ){
		return ;
	}
	
	kWidget.getAuthWidget = function( targetId, callback ){
		var authPageUrl = kWidget.getPath() + 'auth/authPage.php';
		var authOrgin = kWidget.getPath().split('/').slice(0,3).join('/');
		var $userIcon = $('<div>')
		.addClass( 'kaltura-user-icon' )
		.css({
			'display': 'inline',
			'float': 'left',
			'margin-right': 5,
			'width': 33,
			'height': 24,
			'background-image': 'url(\'' + kWidget.getPath() + 'auth/kaltura-user-icon-gray.png\')',
			'background-repeat':'no-repeat',
			'background-position':'bottom left'
		});
		
		$('#' + targetId ).append( 
			$( '<a>' )
			.addClass('btn')
			.append( 
				$userIcon,
				$('<span>')
				.text( "Login to Kaltura")
			).click( function(){
				var authPage = window.open( authPageUrl +'?ui=1' , 
						'kaltura-auth',
						 "menubar=no,location=yes,resizable=no,scrollbars=no,status=no" +
						 "left=50,top=100,width=400,height=250" 
				);
			})
		)
		// add the communication iframe ( IE can't communicate with postMessage to popups :(
		$('#' + targetId ).after(
			$( '<iframe style="width:1px;height:1px;border:none;" id="iframe_"' + targetId + '>' ).attr('src', authPageUrl ).load( function(){
				$(this)[0].contentWindow.postMessage( 'kaltura-auth-check',  '*');
			})
		);		
		// await postMessage response:
		window.addEventListener("message", function( event ){
			// check for correct event origin:
			if( event.origin != authOrgin ){
				// error origin mismatch
				return ;
			}
			if( event.data ){
				var userData = JSON.parse( event.data );
				if( userData.code ){
					var $icon =$('#' + targetId ).find('a div');
					var grayIconUrl = 'url(\'' + kWidget.getPath() + 'auth/kaltura-user-icon-gray.png\')';
					if( grayIconUrl != $icon.css('background-image') ){
						$icon.css({
							'background-image': grayIconUrl
						});
					}
					if( userData.code == 'LOGIN' ){
						$('#' + targetId ).find('a span').text( "Login to Kaltura");
					}
					if(  userData.code == 'DOMAIN_DENY'){
						$('#' + targetId ).find('a span').text( "Domain Not Allowed");
					}
					// error check:
					return ;
				}
				// check for data:
				// update the icon to "kaltura light" 
				$('#' + targetId ).find('a').empty()
				.append(
					$userIcon.css({
						'background-image': 'url(\'' + kWidget.getPath() + 'auth/kaltura-user-icon.png\')'
					}),
					$('<span>').text( userData.fullName )
				);
				callback( userData ); 
			}
		}, false);
	}

})( window.kWidget );