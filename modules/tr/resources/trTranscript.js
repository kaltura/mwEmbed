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
		this.mainDoc = $(window['parent'].document);
		this.updateTargetWithTemplate();
		this.setBindings();
		this.applyFilterBehavior();
		this.applyTabsBehavior();
		this.applyMetionedTermsBehavior();
	},

	applyMetionedTermsBehavior : function (){
		var _this = this;
		this.mainDoc.find(".mentioned-terms-switch-btn").click(function(e){
			if($(this).parent().parent().hasClass("collapsed")){
				$(this).parent().parent().removeClass("collapsed");
			} else {
				$(this).parent().parent().addClass("collapsed");
			}
		})
	},
	applyTabsBehavior : function (){

		var _this = this;
		this.mainDoc.find(".btn.transcript").click(function(e){
			_this.mainDoc.find("#transcript-tab").removeClass("hide");
			_this.mainDoc.find("#info-tab").addClass("hide");
			_this.mainDoc.find(".btn.transcript").addClass("active");
			_this.mainDoc.find(".btn.info").removeClass("active");
		})
		this.mainDoc.find(".btn.info").click(function(e){
			_this.mainDoc.find("#transcript-tab").addClass("hide");
			_this.mainDoc.find("#info-tab").removeClass("hide");
			_this.mainDoc.find(".btn.transcript").removeClass("active");
			_this.mainDoc.find(".btn.info").addClass("active");
		})


		this.mainDoc.find(".transcript-tab")
	},
	applyFilterBehavior : function (){
		var _this = this;
		//hook enter key
		this.mainDoc.find(".search-input").keyup(function(e){
			if (e.keyCode === 13) {
				_this.getPlayer().sendNotification('trLocalSearch', _this.mainDoc.find(".search-input").val());
			}
		});
		//hook search icon
		this.mainDoc.find(".search-btn").click(function(e){
			_this.getPlayer().sendNotification('trLocalSearch', _this.mainDoc.find(".search-input").val());
		})
		//hook clear button
		this.mainDoc.find(".btn-filter").click(function(e){
			_this.mainDoc.find(".transcript-filter").removeClass("active");
			this.mainDoc.find(".ri-transcript-filter-txt").removeClass("active");
			_this.mainDoc.find(".search-input").val("");
		})

	},
	setBindings : function (){
		this.bind('newClosedCaptionsData', $.proxy(function(event,source){
			this.clearData();
			this.setTranscript(source.captions);
			this.setMentionedTerms();
			//Experimental :) // render the mentioned terms to the transcript
			try{
				this.renderHighlightedWords();
				this.applyBehavior();
			}catch(e){
				mw.log("Error applying highlighted words " + e)
			}
		},this));
		this.bind('playerReady', $.proxy(function(){
			this.clearData();
		},this));
		this.bind('trLocalSearch', $.proxy(function(e,searchString){
			//show filter box
			this.localSearch(searchString)
		},this));
	},


	localSearch : function(searchString){
		this.mainDoc.find(".transcript-filter").addClass("active");
	},


	clearData : function () {
		//clear UI on transcript and mentioned terms
		var doc = window['parent'].document;
		$(doc).find("#"+this.getConfig('transcriptTargetId')).text("");
		$(doc).find("#peopleTerms").text("");
		$(doc).find("#companiesTerms").text("");
		$(doc).find("#locationsTerms").text("");
		$(doc).find("#keywordsTerms").text("");

	},
	applyBehavior : function (){
		//apply to transcript
		var _this = this;
		this.mainDoc.find("#"+this.getConfig('transcriptTargetId')).find("[trtime]").click(function(e){
			var seekTime = $(this).attr("trtime");
			_this.getPlayer().sendNotification("doSeek" , seekTime);
		});
		//this.mainDoc.find("#"+this.getConfig('transcriptTargetId')).find("[trdata]").click(function(e){
		//
		//});
		//apply behavior to the mentioned terms
		this.mainDoc.find(".mentioned-terms-categories").find("[trdata]").click($.proxy(function(event,source){
			this.mainDoc.find(".search-input").val($(this).attr("trdata"));
			this.mainDoc.find(".ri-transcript-filter-term").text($(event.target).attr("trdata"));
			this.mainDoc.find(".ri-transcript-filter-txt").addClass("active");
			this.getPlayer().sendNotification('trLocalSearch',$(event.target).attr("trdata"));
		},this));
	},
	renderHighlightedWords : function (){
		var _this = this;
		var doc = window['parent'].document;
		var markMyWords = this.markMyWords;

		//TODO replace with regexp later
		var currentText = $(doc).find("#"+this.getConfig('transcriptTargetId')).html();

		function replaceAllTemp(str,find, replace) {
			var ignoreCase=true;
			var _token;
			var token=find;
			var newToken=replace;
			var i = -1;

			if ( typeof token === "string" ) {

				if ( ignoreCase ) {

					_token = token.toLowerCase();

					while( (
						i = str.toLowerCase().indexOf(
							token, i >= 0 ? i + newToken.length : 0
						) ) !== -1
						) {
						str = str.substring( 0, i ) +
						newToken +
						str.substring( i + token.length );
					}

				} else {
					return this.split( token ).join( newToken );
				}

			}
			return str;
		};

		for (var i=0;i<markMyWords.length;i++){
			mw.log(" processiong ::: " + markMyWords[i])
			currentText = replaceAllTemp(currentText ,markMyWords[i], '<span class="highlight">' +markMyWords[i]+'</span>')
		}

		$(doc).find("#"+this.getConfig('transcriptTargetId')).html(currentText);
		//$(doc).find("#"+this.getConfig('transcriptTargetId')).append(newOutput);

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
			htmlString+="<span trdata="+dataArr[i].string+"> "+ dataArr[i].key +"</span>,";
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
				//debugger;
				var timeStamp = captions[property].start
				htmlString+='<span index="'+property+'" trtime="'+timeStamp+'">'+captions[property]["content"]+' </span>';
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