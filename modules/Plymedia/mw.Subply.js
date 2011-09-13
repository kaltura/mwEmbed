/**
* Subply hooks into the pyMedia html5 library
*/
mw.Subply = {	
	bindPlayer: function( embedPlayer ){
	var intializeRestUrl = "http://services.plymedia.com/jsinitialize?platform=kaltura&video=http://www.kaltura.com/extservices/plymedia?movie=entry_";
	var entryId	= "";
	var currentVideoUrl = "";
	var defaultlang =  "eng";
	var currentlang =  "off";
	var totalMenuHeight =  0;
	var videoDetails = null;
	var currentCaptions = null;
	var languages = null;
	var activeElements = [];

	function openMenuHandler(e)
	{
        if (!e) e   = window.event;
        var target;
        if (e.target)
            target = e.target;
        else if (e.srcElement)
            target = e.srcElement;

	    var h = embedPlayer.$interface.find( '#captionMenu').height();

	    openMenu();

	};

	function openMenu() {
	    var h = embedPlayer.$interface.find( '#captionMenu').height() ;

	    if (h <= totalMenuHeight)
	    {
	        embedPlayer.$interface.find( '#captionMenu').height(h + 3);
	        window.setTimeout(openMenu, 0);
	    }
	
	};

	function closeMenuHandler(e) {

        if (!e) e   = window.event;
        var target;
        if (e.target)
            target = e.target;
        else if (e.srcElement)
            target = e.srcElement;

	    var h = embedPlayer.$interface.find( '#captionMenu').height();

	    closeMenu();

	};
	
	function closeMenu() {

	    var h = embedPlayer.$interface.find( '#captionMenu').height();

	    if (h >= 20) {
	        embedPlayer.$interface.find('#captionMenu').height(h - 3);
	        window.setTimeout(closeMenu, 0);
	    }else{
	        if (h < 20)
	            embedPlayer.$interface.find( '#captionMenu').height(20);
	    }
	};
	
	function markLangSelected(elem, bol)
	{
	    if (bol==true)
	        elem.className = "captionMenuItem selMenuItem";
	    else
	        elem.className = "captionMenuItem gradient";    
	};

	function markLangRolledOver(elem, bol)
	{
	    if (bol==true)
	        elem.className = "captionMenuItem rolledover";
	    else
	        elem.className = "captionMenuItem gradient";

	    var curr = getLangTextByCode(currentlang) + "MenuItem";

	    if (curr==elem.id)
	        elem.className = "captionMenuItem selMenuItem";
	};
	
	function getLangTextByCode(code)
	{
	    var name = "";
	    var key = 0;
	    for (key in languages)
	    {
	        if (languages[key].code==code)
	            name = languages[key].text;
	    }    

	    return name;
	};

	function getLangCodeByText(txt)
	{
	    var name = "";
	    var key = 0;
	    for (key in languages)
	    {
	        if (languages[key].text==txt)
	            name = languages[key].code;
	    }    

	    return name;
	};

	function languageControlOverHandler(e)
	{
		markLangRolledOver(e.target, true);
	};
	
	function languageControlUpHandler(e)
	{
	    closeMenu();

	    // Deselect old language
		
		if (currentlang!="off")
		{
		    var menuitem = document.getElementById( getLangTextByCode(currentlang) + "MenuItem");
		    markLangSelected(menuitem, false);
		
			currentCaptions = null;
		}

	    // Select new language

	    currentlang = e.data.lang;

	    markLangSelected(e, true);
	
		if (currentlang!="off")
			setupCaptionsBylanguageCode(currentlang);
	};
	
	function setupCaptionsBylanguageCode(langcode)
	{
		mw.log("Subply::[setupCaptionsBylanguageCode] "+langcode);
			
		// Find js url by language code in languages array
		var counter;
		var url;
		for (counter=0; counter < languages.length; counter++)
		{
			if (languages[counter].code==langcode)
			{
				url = languages[counter].url;
				break;
			};
		};
		
		// Load js from url
		
		if (url!=undefined && url.length > 0)
		{
			mw.log("Subply::[setupCaptionsBylanguageCode] loading "+url);
							
			$.getScript(url, function(data, textStatus){
				captionsFileLoadedHandler();
			});
		};
	};
	
	function captionsFileLoadedHandler()
	{
		mw.log("Subply::[captionsFileLoadedHandler] ");
			
		currentCaptions = mw.Subply.loadedData;
	};
	
	function languageControlOutHandler(e)
	{
		markLangRolledOver(e.target, false);
	};	
	
	function addLanguageControl(lang, code, elem)
	{    
	    var langOption      = document.createElement("a");
	    var langOptionId    =  lang + "MenuItem";
	    var menuitem        = createCaptionMenuItem(lang, langOptionId, (code==currentlang));
	    langOption.appendChild( menuitem );

		activeElements.push( {id:langOptionId,code:code} );
		
	    elem.appendChild( menuitem );
	};
	
	function createCaptionMenuItem(txt,id,selectedFlag)
	{
	    var captionmenuitem = document.createElement("div");
	    captionmenuitem.setAttribute("id", id);
	    if (selectedFlag==true)
	        captionmenuitem.setAttribute("class", "captionMenuItem selMenuItem");
	    else
	        captionmenuitem.setAttribute("class", "captionMenuItem gradient");

	    captionmenuitem.appendChild( document.createTextNode(txt) );

	    return captionmenuitem;
	};
	
	function drawCaptionsMenu()
	{
	    //Draw Menu
	    var captionMenu = document.createElement("div");
	    captionMenu.setAttribute("id", "captionMenu");
	    captionMenu.setAttribute("class", "captionMenuDim captionMenuPos captionMenuText");

	    // Populate Menu
	    captionMenu.appendChild( createCaptionMenuItem("Captions","captionMenuTitle") );

	    var controls = document.createElement("span");
	    controls.setAttribute("class", "languageControlsArea");
	    controls.innerText = "";
	    captionMenu.appendChild(controls);

	    var key = 0;
	    var counter = key;
	    for (key in languages)
	    {
	        var langitem = languages[key];
	        addLanguageControl(langitem.language,langitem.code,controls);
	        counter++;
	    };

	    totalMenuHeight = 21 * (counter+1);

		return captionMenu;
	};	
	
		function clearCaptionsMenu()
		{
			if ( embedPlayer.$interface.find('#captionMenu').length > 0 )
			{
				embedPlayer.$interface.find('#captionMenu').empty().remove();
				
				activeElements = [];
			};	
		};
		
		function createCaptionsMenu()
		{
			embedPlayer.$interface.append( drawCaptionsMenu() );
			
			embedPlayer.$interface.find('#captionMenu').mouseenter(openMenuHandler);
			embedPlayer.$interface.find('#captionMenu').mouseleave(closeMenuHandler);
			
			var eid;
			var ecode;
			for(var i = 0; i < activeElements.length; i++)
			{
				eid = activeElements[i].id;
				ecode = activeElements[i].code;
				embedPlayer.$interface.find('#'+eid).mouseenter(languageControlOverHandler);
				embedPlayer.$interface.find('#'+eid).mouseup({lang:ecode}, languageControlUpHandler);
				embedPlayer.$interface.find('#'+eid).mouseleave(languageControlOutHandler);
			};
		};
		
		function initializeByEntryId(eid)
		{
			// For testing !!! :
			//eid = "entry_1_qmk1pnre";
			
			mw.log("Subply::[initializeByEntryId] for "+intializeRestUrl+eid);
			
			$.getScript(intializeRestUrl+eid, function(data, textStatus){
				videoDetailsLoadedHandler();
			});
		};
		
		function videoDetailsLoadedHandler()
		{
			videoDetails = mw.Subply.loadedData;
			
			clearCaptionsMenu();
			
			languages = videoDetails.Subtitles;
			
			if (languages.length > 0)
			{
				mw.log("Subply::[videoDetailsLoadedHandler] have captions. Will create menu. ");
									
				createCaptionsMenu();				
			};
		};

		function getInterfaceSizeTextCss( size ) {
			return {
				'font-size' : getInterfaceSizePercent( size ) + '%',
				'width' : size.width + 'px'
			};
		};
		
		function getInterfaceSizePercent( size ) {
			var textSize = size.width / 5.2;
			if( textSize < 95 ) textSize = 95;
			if( textSize > 200 ) textSize = 200;
			return textSize;
		};		
		
		mw.ready(function(){
 
		});	

		$j( embedPlayer ).bind( 'onplay', function(){

		});

		$j( embedPlayer ).bind( 'firstPlay', function(){

		});

		$j( embedPlayer ).bind( 'pause', function(){
			
		});		
		
		$j( embedPlayer ).bind( 'playerReady', function(){
			
			currentVideoUrl = embedPlayer.getSrc();
			entryId = embedPlayer.kentryid;

			initializeByEntryId(entryId);
		});		

		$j( embedPlayer ).bind( 'onResizePlayer', function(e, size, animate){

			if (animate) {
				embedPlayer.$interface.find( '.subplySubtitles' ).animate( getInterfaceSizeTextCss( size ) );
			} else {
				embedPlayer.$interface.find( '.subplySubtitles' ).css( getInterfaceSizeTextCss( size ) );
			};		
		});		
		
		$j( embedPlayer ).bind( 'monitorEvent', function(){
			
			var currentTime = embedPlayer.currentTime;

			if( embedPlayer.$interface.find('.subplySubtitles').length == 0 )
			{
				embedPlayer.$interface.append( '<div class="subplySubtitles"></div> ');
				
				var w = embedPlayer.getPlayerWidth().toString() + "px";
				
				embedPlayer.$interface.find( '.subplySubtitles').css('width', w);
				embedPlayer.$interface.find( '.subplySubtitles').css('bottom', '40px');
				embedPlayer.$interface.find( '.subplySubtitles').css('left', '0px');				
			};
			
		    var text = "";
		    var time = currentTime;
			
		    if (currentCaptions != null)
			{
		        for (var i = 0; i < currentCaptions.length; i++)
				{
		            var start = new Number(currentCaptions[i].From);
		            var end = start + new Number(currentCaptions[i].Duration);
		
		            if (time >= start && time <= end)
					{
		                text = currentCaptions[i].Text;
		                break;
		            };
		        };
		        embedPlayer.$interface.find('.subplySubtitles').text( text );
		    };			
			
		});
	
	}		
};
