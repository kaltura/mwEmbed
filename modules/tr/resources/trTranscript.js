mw.PluginManager.add( 'trTranscript', mw.KBasePlugin.extend({

	// This plugin will load the transcript data, parse it and inject it to a dedicated div
	// as HTML. The HTML will hold times attributes for seeking the player
	// TBD - highlight words
	// TBD if the plugin also needs to injects its HTML or not. We might decide that
	// another plugin will do that

	defaultConfig: {
		'targetId': 'transcriptContainer',
		'templatePath': '../tr/templates/transcript.tmpl.html',
		'transcriptTargetId': 'transcript-body'

	},

	setup: function() {

		this.updateTargetWithTemplate();
		this.bind('newClosedCaptionsData', $.proxy(function(event,source){
			this.setTranscript(source.captions);
			this.setMentionedTerms();
			//Experimental :) // render the mentioned terms to the transcript
			try{
				this.renderHighlightedWords();
			}catch(e){
				mw.log("Error applying highlighted words " + e)
			}
		},this));

	},
	renderHighlightedWords : function (){

		var doc = window['parent'].document;
		var markMyWords = this.markMyWords;
		newOutput = $(doc).find("#"+this.getConfig('transcriptTargetId')).text();

		for (var i=0;i<markMyWords.length;i++){
			var reg = new RegExp (markMyWords[i] , "g")
			newOutput = newOutput.replace(reg,'<span class="highlight">'+markMyWords[i]+'</span>');
		}
		$(doc).find("#"+this.getConfig('transcriptTargetId')).text("");
		$(doc).find("#"+this.getConfig('transcriptTargetId')).append(newOutput);
	},
	setMentionedTerms : function (){
		//TODO replace this with real data once I get it
		var mentionedTerms = this.embedPlayer.evaluate("{mediaProxy.entryMetadata}");
		var people = this.buildMentionedTermsObject(mentionedTerms.People);
		var company = this.buildMentionedTermsObject(mentionedTerms.Company);
		var geography = this.buildMentionedTermsObject(mentionedTerms.Geography);
		var keywords = this.buildMentionedTermsObject(mentionedTerms.Keywords);

		this.renderToHtml(people , "peopleTerms");
		this.renderToHtml(company , "companiesTerms");
		this.renderToHtml(geography , "locationsTerms");
		this.renderToHtml(keywords , "keywordsTerms");

		//Experimental :) Scan all words needs to be marked and pass them to an array
		var markMyWords = [];
		if(keywords){
			for (var i=0;i<keywords.length;i++){
				markMyWords.push(keywords[i].string);
			}
		}
		if(people){
			for (var i=0;i<people.length;i++){
				markMyWords.push(people[i].string);
			}
		}
		if(company){
			for (var i=0;i<company.length;i++){
				markMyWords.push(company[i].string);
			}
		}
		if(geography){
			for (var i=0;i<geography.length;i++){
				markMyWords.push(geography[i].string);
			}
		}
		this.markMyWords = markMyWords ;
	},
	// build data with the mentioned term and the string for the free search
	// the object will have items with keys for the mentioned term, and string for the search;
	buildMentionedTermsObject: function(str){
		if(!str){
			return;
		}
		var arr = str.split(",");
		var returnArr = [];
		for (var i=0;i<arr.length;i++){
			// assumption that each item has a key|string structure
			var item = {
				"key" : arr[i].split("|")[0],
				"string" : arr[i].split("|")[1]
			};
			returnArr.push(item);
		};
		return returnArr;
	},


	renderToHtml : function(dataArr,targetClass){
		var doc = window['parent'].document;
		
		if (!dataArr){
			$(doc).find("#"+targetClass).parent().hide();
			return;
		}
		$(doc).find("#"+targetClass).parent().show();

		$(doc).find("#"+targetClass).text("");
		var htmlString = "";
		for (var i=0;i<dataArr.length;i++){
			// need to add the click mechanism later
			htmlString+="<a> "+ dataArr[i].key +"</a>,";
		};
		// remove last string
		$(doc).find("#"+targetClass).append(htmlString.slice(0,htmlString.length-1));
	},


	setTranscript : function (captions){
		// copy the transcript data to an object, parse and manipulate it and then inject it
		// to the dedicated div
		var doc = window['parent'].document;
		// construct HTML here

		var string = "";
		var htmlString = "";

		for (var property in captions) {
			if (captions.hasOwnProperty(property)) {
				string += captions[property]["content"]+" ";
				htmlString+='<span index="'+property+'">'+captions[property]["content"]+' </span>';
			}
		}
		$(doc).find("#"+this.getConfig('transcriptTargetId')).text("");
		$(doc).find("#"+this.getConfig('transcriptTargetId')).append(htmlString);
	},



	hasValidTargetElement: function() {
		if( !mw.getConfig('EmbedPlayer.IsFriendlyIframe') ){
			return false;
		}
		var parentTarget = null;
		try {
			parentTarget = window['parent'].document.getElementById( this.getConfig('targetId') );
		} catch (e) {
			this.log('Unable to find element with id of: ' + this.getConfig('targetId') + ' on the parent document');
			return false;
		}

		if( parentTarget ) {
			return true;
		}
	},

	getTargetElement: function() {
		return window['parent'].document.getElementById( this.getConfig('targetId') );
	},
	updateTargetWithTemplate: function() {
		if( this.hasValidTargetElement() ) {
			var target = this.getTargetElement();
			target.innerHTML = this.getTemplateHTML().html();
		}
	}

}));