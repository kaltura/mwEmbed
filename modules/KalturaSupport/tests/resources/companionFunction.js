var kdp;
var adContainers;
var originalContent;
function jsCallbackReady ()
{
	kdp = document.getElementByName("kaltura_player");
	
}
function showCompanions(param){
	adContainers = new Array();
	originalContent = new Object();
	var obj = param[0];
	// id of the div to which we inject content	
	var divid;	
	// ad data
	var ad;
	// HTML content to be injected
	var content;
	for (divid in obj){
		
		if(!divid)
			alert('empty divid!');
		ad = obj[divid];
		
		adContainers.push(divid);
		
		if (ad.staticResource != null && ad.staticResource != ""){
			// uri of image or swf.
			if (ad.creativeType.indexOf("image") > -1){
				content = '<img src="'+ ad.staticResource +'" width="'+ ad.width +'" height="'+ ad.height +'" />';
				// if "clickthrough" exists, wrap the resource with <a> tag.
				if (ad.companionClickThrough != ""){
					content = '<a href="' + ad.companionClickThrough + '" target="_blank">' + content + '</a>';
				} 
				//alert(content);
			}
			else if (ad.creativeType == "application/x-shockwave-flash"){
					content = 
					'<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'+
						'id="ad" width="'+ ad.width +'" height="'+ ad.height +'"'+
						'codebase="http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab">'+
						'<param name="movie" value="'+ ad.staticResource +'"/>'+
						'<param name="quality" value="high"/>'+
						'<param name="bgcolor" value="0xffffff"/>'+
						'<param name="allowScriptAccess" value="sameDomain"/>'+
						'<embed src="'+ ad.staticResource +'" quality="high" bgcolor="0xffffff"'+
							'width="'+ ad.width +'" height="'+ ad.height +'" name="ad"'+
							'align="middle" play="true" loop="false" quality="high"'+
							'allowScriptAccess="sameDomain"'+
							'type="application/x-shockwave-flash"'+
							'pluginspage="http://www.adobe.com/go/getflashplayer">'+
						'</embed>'+
					'</object>';
			}
		}
		else if (ad.iframeResource != null && ad.iframeResource != "") {
			content = '<iframe src="' + ad.iframeResource + '" width="' + ad.width + '" height="' + ad.height + '" />'; 
		}
		else if (ad.htmlResource != null && ad.htmlResource != "") {
			content = ad.htmlResource;
		}
	
		
		if(divid){
			originalContent[divid] = document.getElementById(divid).innerHTML;
			document.getElementById(divid).innerHTML = content;
		}
		
	}
	kdp.addJsListener("sequenceItemPlayEnd", "onAdEnd");
	
}
function onAdEnd (){
		var index;
		for (index in adContainers){
			document.getElementById(adContainers[index]).innerHTML = originalContent[adContainers[index]];
		}
		
		kdp.removeJsListener("sequenceItemPlayEnd","onAdEnd" );
}