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
	var menuItemHeight	= 28;
	var videoDetails = null;
	var currentCaptions = null;
	var languages = null;
	var activeElements = [];

	var anchorWidth = 0;
	var menuIsOpened = false;
	var currCaptionText = "";
	var currCaptionWidth = 0;
	var currPlayerWidth = 0;
	var currCaptionLeft = 0;
	var captionLeftCalculatedByAnchor = true;

	function toggleMenuHandler(e)
	{
		if (menuIsOpened)
		{
			closeMenu();
		}
		else
		{
			openMenu();
		};

		menuIsOpened = !menuIsOpened;
	};

	function openMenuHandler(e)
	{
		if (!e) e   = window.event;
		var target;
		if (e.target)
			target = e.target;
		else if (e.srcElement)
			target = e.srcElement;

		//embedPlayer.$interface.find( '#captionMenu').height(totalMenuHeight);

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

		//embedPlayer.$interface.find( '#captionMenu').height(menuItemHeight);

		closeMenu();
	};

	function closeMenu() {

		var h = embedPlayer.$interface.find( '#captionMenu').height();

		if (h >= menuItemHeight) {
			embedPlayer.$interface.find('#captionMenu').height(h - 3);
			window.setTimeout(closeMenu, 0);
		}else{
			if (h < menuItemHeight)
				embedPlayer.$interface.find( '#captionMenu').height(menuItemHeight);
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
			//mw.log("Subply::[getLangTextByCode] code ? "+ code + " languages[key].code ? " + languages[key].code + " languages[key].language ? " + languages[key].language);
			if (languages[key].code==code)
				name = languages[key].language;
		}

		return name;
	};

	function getLangCodeByText(txt)
	{
		var name = "";
		var key = 0;
		for (key in languages)
		{
			if (languages[key].language==txt)
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

		mw.log("Subply::[languageControlUpHandler] currentlang: "+ currentlang + " e.data.lang: " + e.data.lang);

		// Deselect old language

		if (currentlang!="off")
		{
			var menuitem = document.getElementById( getLangTextByCode(currentlang) + "MenuItem");

			markLangSelected(menuitem, false);

			currentCaptions = null;
		}

		// Select new language

		if (currentlang == e.data.lang)
		{
			currentlang = 'off';

			markLangSelected(e, false);
		}
		else
		{
			currentlang = e.data.lang;

			markLangSelected(e, true);
		};

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
		var langOption	  = document.createElement("a");
		var langOptionId	=  lang + "MenuItem";
		var menuitem		= createCaptionMenuItem(lang, langOptionId, (code==currentlang));
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

		totalMenuHeight = (menuItemHeight + 1) * (counter+1);

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
			mw.log("Subply::[createCaptionsMenu]");

			embedPlayer.$interface.append( drawCaptionsMenu() );

			//embedPlayer.$interface.find('#captionMenu').mouseenter(openMenuHandler);
			//embedPlayer.$interface.find('#captionMenu').mouseleave(closeMenuHandler);

			embedPlayer.$interface.find('#captionMenu').click(toggleMenuHandler);

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

		function createSubtitlesArea()
		{
			mw.log("Subply::[createSubtitlesArea] player height: "+embedPlayer.getPlayerHeight()+" Plymedia.subpos "+mw.getConfig( 'Plymedia.subpos' ));

			var confpos = mw.getConfig( 'Plymedia.subpos' );
			var subbuttompos = 9;
			var csspostype = 'bottom';

			// pos over 50 - will calculate for css 'bottom'. under 50 - will calculate for css 'top'
			if ( confpos >= 50)
			{
				subbuttompos = 100 - confpos;
				if (subbuttompos < 9)
					subbuttompos = 9;
			}
			else
			{
				csspostype = 'top';
				subbuttompos = confpos;
			};

			mw.log("Subply::[createSubtitlesArea] positioning at: " + csspostype + " " + subbuttompos + "%");

			if( embedPlayer.$interface.find('.subplySubtitles').length == 0 )
			{
				embedPlayer.getVideoHolder().append( '<div class="subplySubtitles"></div> ');
				embedPlayer.$interface.find('.subplySubtitles').hide();

				embedPlayer.$interface.find('.subplySubtitles').css( csspostype, (subbuttompos + '%') );

				if (mw.getConfig( 'Plymedia.showbackground' ) == false)
					embedPlayer.$interface.find('.subplySubtitles').css( 'background', 'none' );
			};
		}

		function initializeByEntryId(eid)
		{
			// For testing !!! :
			//eid = "entry_1_qmk1pnre";

			mw.log("Subply::[initializeByEntryId] for "+intializeRestUrl+eid);
			mw.log("Subply::[initializeByEntryId] config params: Plymedia.subpos "+mw.getConfig( 'Plymedia.subpos' )+" Plymedia.deflang "+mw.getConfig( 'Plymedia.deflang' )+" Plymedia.showbackground "+mw.getConfig( 'Plymedia.showbackground' ) );

			// Setup currentlang to Plymedia.deflang

			currentlang = mw.getConfig( 'Plymedia.deflang' );

			if (currentlang == null || currentlang == 'none' || currentlang == 'null')
				currentlang = 'off';

			$.getScript(intializeRestUrl+eid, function(data, textStatus){
				videoDetailsLoadedHandler();
			});
		};

		function videoDetailsLoadedHandler()
		{
			videoDetails = mw.Subply.loadedData;

			clearCaptionsMenu();

			languages = videoDetails.Subtitles;

			// For resize

			anchorWidth = embedPlayer.getPlayerWidth() / 100;

			if (languages.length > 0)
			{
				mw.log("Subply::[videoDetailsLoadedHandler] have captions. Will create menu. deflang? "+currentlang);

				createCaptionsMenu();
				createSubtitlesArea();

				// Load default subtitles

				if (currentlang!="off")
					setupCaptionsBylanguageCode(currentlang);
			};
		};

		function getInterfaceSizeTextCss( size ) {
			mw.log("Subply::[getInterfaceSizeTextCss] "+getInterfaceSizePercent( size ) +" currCaptionWidth: "+currCaptionWidth+" anchorWidth: "+anchorWidth);

			var pr = getInterfaceSizePercent( size );
			var prevPr = getInterfaceSizePercent( {width:currPlayerWidth} );



			var cw = (captionLeftCalculatedByAnchor)? currCaptionWidth*(pr/100) : currCaptionWidth/(prevPr/100);
			var wx = (size.width - cw )/2;
			var lx = wx;
			mw.log("Subply::[getInterfaceSizeTextCss]  captionLeftCalculatedByAnchor: "+captionLeftCalculatedByAnchor+" lx: "+lx+" pr: "+pr+" prevPr: "+prevPr+" cw: "+cw+" wx: "+wx);
			//pw:656 sw:351 x:149.5px
			//pw:1440 sw:526 x:454px
			return {
				'font-size' : pr + '%',
				'left': lx + "px"
				//'width' : size.width + 'px'
			};
		};

		function getInterfaceSizePercent( size ) {
			var textSize = size.width / anchorWidth;
			if( textSize < 95 ) textSize = 95;
			if( textSize > 150 ) textSize = 150;
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
			mw.log("Subply::[onResizePlayer] size "+size);

			if (animate) {
				embedPlayer.$interface.find( '.subplySubtitles' ).animate( getInterfaceSizeTextCss( size ) );
			} else {
				embedPlayer.$interface.find( '.subplySubtitles' ).css( getInterfaceSizeTextCss( size ) );
			};

			currPlayerWidth = size.width;
		});

		$j( embedPlayer ).bind( 'monitorEvent', function(){

			if (embedPlayer.$interface.find( '.subplySubtitles').length == 0 || currentCaptions == null)
				return;

			var currentTime = embedPlayer.currentTime;

			var text = "";
			var time = currentTime;

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

			if (text==""){
				embedPlayer.$interface.find( '.subplySubtitles').hide();
			} else {
				if (currCaptionText != text)
				{
					embedPlayer.$interface.find( '.subplySubtitles').hide();
					embedPlayer.$interface.find( '.subplySubtitles').css('left', "0px");
					embedPlayer.$interface.find('.subplySubtitles').text( text );

					// 6 is padding

					currCaptionWidth = embedPlayer.$interface.find('.subplySubtitles').width() + 6;

					if (currPlayerWidth > 0 && currPlayerWidth != embedPlayer.getPlayerWidth())
						captionLeftCalculatedByAnchor = false;
					else
						captionLeftCalculatedByAnchor = true;

					var ww = (currPlayerWidth > 0)? currPlayerWidth : embedPlayer.getPlayerWidth();
					currCaptionLeft = (ww - currCaptionWidth )/2;
					var cx = currCaptionLeft + "px";

					mw.log("Subply::[monitorEvent] new caption stats: pw:" +ww + " sw:" +embedPlayer.$interface.find('.subplySubtitles').width() + " x:" + cx);

					embedPlayer.$interface.find( '.subplySubtitles').css('left', cx);

					embedPlayer.$interface.find( '.subplySubtitles').show();
				}
			};

			currCaptionText = text;
		});

	}
};
