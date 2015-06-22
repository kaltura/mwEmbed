mw.PluginManager.add( 'trTranscript', mw.KBasePlugin.extend({

	// This plugin will load the transcript data, parse it and inject it to a dedicated div
	// as HTML. The HTML will hold times attributes for seeking the player
	// in addition it will load mentioned terms and
	// TBD - highlight words
	// TBD if the plugin also needs to injects its HTML or not. We might decide that
	// another plugin will do that

	defaultConfig: {
		'targetId': 'transcriptContainer',
		'templatePath': '../tr/templates/transcript.tmpl.html',
		'transcriptTargetId': 'transcript-body',
		'responseProfile' : null
	},

	setup: function() {
		this.mainDoc = $(window['parent'].document);
		this.updateTargetWithTemplate();
		this.setBindings();
		this.applyFilterBehavior();
		this.applyTabsBehavior();
		this.applyMetionedTermsBoxBehavior();
		this.loadMentionedTerms();
	},

	setBindings : function (){
		var _this = this;
		this.bind('changeMedia', $.proxy(function(){
				this.setConfig("transcriptLoaded",false);
				this.setConfig("mentionedTermsLoaded",false);
			}));
		this.bind('forcedCaptionLoaded', $.proxy(function(event,source){
			this.setTranscript(source.captions);
			this.applyBehavior();
			this.setConfig("transcriptLoaded",true);
			this.renderHighlightedWords(this.getConfig("mentionedTerms"));
		},this));

		this.bind('playerReady', $.proxy(function(){
			this.clearData();
		},this));

		this.bind('trLocalSearch', $.proxy(function(e,searchString){
			//show filter box
			this.localSearch(searchString)
		},this));
	},
	loadMentionedTerms : function (){
		var _this = this;
		var myRequest = {
			'service': 'baseentry',
			'action': 'list',
			'filter:metadataObjectTypeEqual': 1,
			'filter:idIn' : this.embedPlayer.evaluate('{mediaProxy.entry.id}')
		};
		//retrieve response profile attribute
		if(typeof this.getConfig('responseProfile') == 'number'){
			myRequest['responseProfile[id]'] = this.getConfig('responseProfile');
		}else{
			myRequest['responseProfile[systemName]'] = this.getConfig('responseProfile');
		}
		this.getKClient().doRequest(myRequest, function (dataResult) {
			_this.setConfig("mentionedTermsLoaded",true);
			_this.handleMentionedTerms(dataResult);
			_this.applyMentionedTermsItemBehavior();
			_this.setConfig("mentionedTerms" , dataResult.objects[0].relatedObjects.mentionedTerm.objects )
			_this.renderHighlightedWords(_this.getConfig("mentionedTerms"));
			//set transcript type
			//TODO connect to new caption asset enhancment once ready.
			if(dataResult.objects[0].relatedObjects.captionAsset.objects[0].tags.indexOf('') == 'verified'){
				_this.mainDoc.find(".ri-transcript-type--verified").addClass("active");
			}else{
				_this.mainDoc.find(".ri-transcript-type--automatic").addClass("active");
			}

		});
	},
	handleMentionedTerms : function (dataResult) {
		//handle resault for mentioned terms
		var _this = this;
		var metadataObjects = dataResult['objects'][0]['relatedObjects']['metadata']['objects'];

		//iterate on all recieved metadata objects fro the response profile
		for(var i=0 ; i < metadataObjects.length ; i++ ){
			//detect share metadata node
			if(metadataObjects[i].xml.indexOf("ShareLink") > 0 && metadataObjects[i].xml.indexOf("AllowShare") > 0 ){
				var sharedLink = $(metadataObjects[i].xml).find("sharelink").text();
				var allowShare = $(metadataObjects[i].xml).find("AllowShare").text();
				continue;
			}
			//detect mentioned terms and parsing data
			//companies
			if(metadataObjects[i].relatedObjects.companies){
				for (var k=0; k<metadataObjects[i].relatedObjects.companies.objects.length ; k++){
					var companyXML = metadataObjects[i].relatedObjects.companies.objects[k].xml;
					var newCompany = {
						companyPermId : this.trimSpaces($(companyXML).find("PermID").text()),
						companyName : this.trimSpaces($(companyXML).find("Name").text()),
						primaryRIC : this.trimSpaces($(companyXML).find("PrimaryRIC").text()),
						primaryTicker : this.trimSpaces($(companyXML).find("PrimaryTicker").text())
					}
					this.getCompanies().push(newCompany);
				}
			}
			//persons
			if(metadataObjects[i].relatedObjects.persons){
				for (var k=0; k<metadataObjects[i].relatedObjects.persons.objects.length ; k++){
					var personXML = metadataObjects[i].relatedObjects.persons.objects[k].xml;
					var newPerson = {
						FirstName : this.trimSpaces($(personXML).find("FirstName").text()),
						LastName : this.trimSpaces($(personXML).find("LastName").text()),
						MiddleName : this.trimSpaces($(personXML).find("MiddleName").text()),
						PermID : this.trimSpaces($(personXML).find("PermID").text()),
						Prefix : this.trimSpaces($(personXML).find("Prefix").text())
					}
					newPerson.displayString = (newPerson.Prefix="" ? "" : newPerson.Prefix+" ")+newPerson.FirstName + (newPerson.MiddleName="" ? "" : " "+newPerson.MiddleName+" ") + " "+newPerson.LastName;
					this.getPeople().push(newPerson);
				}
			}
			//keywords
			var keywordsArr = $(metadataObjects[i].xml).find("Keyword");
			for (var k=0; k<keywordsArr.length ; k++){
				this.getKeywords().push($(keywordsArr[k]).text())
			}

			//stab
			this.getGeography().push("USA");
			this.getGeography().push("Asia");


			//hooking to UI:
			//setting companies string and click
			var companies = this.getCompanies();
			if(companies.length){
				var companiesString = "";
				for (var j=0;j<companies.length;j++){
					companiesString+='<span class="mentioned-term company" permId="'+companies[j].companyPermId+'" ric="'+companies[j].primaryRIC+'" ticker="'+companies[j].primaryTicker+'">'+companies[j].companyName+'</span>,';
				}
				if(companiesString.length>1){
					companiesString = companiesString.substring(0, companiesString.length - 1)
					this.mainDoc.find("#companiesTerms").html(companiesString);
				}
			}else{
				//no keywords found
				this.mainDoc.find("#companiesTerms").parent().hide();
			}
			//setting keywords string and click
			var keywords = this.getKeywords();
			if(keywords.length){
				var kwString = "";
				for (var j=0;j<keywords.length;j++){
					kwString+='<span class="mentioned-term keyword"> '+keywords[j]+'</span>,';
				}
				if(kwString.length>1){
					kwString = kwString.substring(0, kwString.length - 1)
					this.mainDoc.find("#keywordsTerms").html(kwString);
				}
			}else{
				//no keywords found
				this.mainDoc.find("#keywordsTerms").parent().hide();
			}
			//setting people string
			var people = this.getPeople();
			if(people.length){
				var peopleString = "";
				for (var j=0;j<people.length;j++){
					peopleString+='<span class="mentioned-term people" fname="'+people[j].FirstName+'" lname="'+people[j].LastName+'" mname="'+people[j].MiddleName+'" prefix="'+people[j].Prefix+'" permId="'+people[j].PermID+'" > '+people[j].displayString+'</span>,';
				}
				if(peopleString.length>1){
					peopleString = peopleString.substring(0, peopleString.length - 1)
					this.mainDoc.find("#peopleTerms").html(peopleString);
				}
			}else{
				//no keywords found
				this.mainDoc.find("#peopleTerms").parent().hide();
			}

			//setting geography string and click
			var geography = this.getGeography();
			if(geography.length){
				var geographyString = "";
				for (var j=0;j<geography.length;j++){
					geographyString+='<span class="mentioned-term geography"> '+geography[j]+'</span>,';
				}
				if(geographyString.length>1){
					geographyString = geographyString.substring(0, geographyString.length - 1)
					this.mainDoc.find("#geographyTerms").html(geographyString);
				}
			}else{
				//no keywords found
				this.mainDoc.find("#geographyTerms").parent().hide();
			}
		}
	},
	trimSpaces : function (str){
		return $.trim(str.replace(/\s{2,}/g,' '));
	},
	applyMentionedTermsItemBehavior : function (){
		var _this = this;
		this.mainDoc.find(".mentioned-term").click(function(e){
			var scope = _this;
			if($(this).hasClass("company")){
				//alert("This is a company")
			}
			if($(this).hasClass("people")){
				//alert("This is a people")
			}
			if($(this).hasClass("geography")){
				//alert("This is a geography")
			}
			if($(this).hasClass("keyword")){
				//alert("This is a keyword")
			}
		})
	},
	applyMetionedTermsBoxBehavior : function (){
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
			_this.mainDoc.find(".ri-transcript-filter-txt").removeClass("active");
			_this.mainDoc.find(".search-input").val("");
			_this.mainDoc.find("#transcript-body").html(_this.getConfig("originalHTML") );
			_this.mainDoc.find(".transcript-wrapper").parent().removeClass("no-results");
			_this.applyBehavior(true);
		})

	},
	localSearch : function(searchString){
		this.mainDoc.find(".transcript-filter").addClass("active");

		// store local transcript only if there was no previous search, so we can re-assign it to
		// transcript box in case of
		if(this.getConfig("originalHTML")){
			this.mainDoc.find("#transcript-body").html(this.getConfig("originalHTML") );
		}else{
			this.setConfig("originalHTML" ,this.mainDoc.find("#transcript-body").html())
		}

		// TODO optimize:
		// in-case-sensitivity (the will also find The, ceo will find CEO)
		// only full words ('the' will not fine therfore)
		// maybe use regexp instead of jquery
		// fix bugs


		var matchingSentences = this.mainDoc.find("#transcript-body span:contains('"+searchString+"')");
		var searchHtml= $('<div />');


		if(!matchingSentences.length){
			this.mainDoc.find(".transcript-wrapper").parent().addClass("no-results");
		}else{
			this.mainDoc.find(".transcript-wrapper").parent().removeClass("no-results");
		}

		for(var i=0;i<matchingSentences.length;i++){
			//find time to display
			var timeToShow;
			if($(matchingSentences[i]).prev().prev().length){
				//there is a previous sibling, use its duration
				timeToShow = $(matchingSentences[i]).prev().prev().attr("trtime");
			} else if($(matchingSentences[i]).prev().length){
				timeToShow = $(matchingSentences[i]).prev().attr("trtime");
			}else{
				timeToShow = $(matchingSentences[i]).attr("trtime");
			}
			timeToShow = mw.seconds2npt( parseInt(timeToShow));

			var nextSentence = $(matchingSentences[i]).next();
			var next2Sentence = $(matchingSentences[i]).next().next();

			var sentence = $(matchingSentences[i]);
			sentence = sentence.text().replace( searchString , '<span class="block-highlight">'+searchString+'</span>');

			var currentSentence= $('<div class="tr-search-item" />');
			currentSentence.append($('<div class="tr-time-search" />').append($('<span>'+timeToShow+' </span> ')));
			currentSentence.append($('<div class="tr-content-search" />')
				.append($(matchingSentences[i]).prev().prev())
				.append($(matchingSentences[i]).prev())
				.append(sentence)
				.append(nextSentence)
				.append(next2Sentence)
			)


			//var sentences3 = $.merge($.merge($(matchingSentences[i]).prev(),$(matchingSentences[i])),$(matchingSentences[i]).next());
			//searchHtml+=sentences3;
			searchHtml.append(currentSentence)
			searchHtml.append($('<br/>'));
		}
		this.mainDoc.find("#transcript-body").html(searchHtml);
		this.applyBehavior(true);
	},
	clearData : function () {
		//clear UI on transcript and mentioned terms
		var doc = window['parent'].document;
		$(doc).find("#"+this.getConfig('transcriptTargetId')).text("");
		$(doc).find("#peopleTerms").text("");
		$(doc).find("#companiesTerms").text("");
		$(doc).find("#geographyTerms").text("");
		$(doc).find("#keywordsTerms").text("");
	},
	applyBehavior : function (onlyOnTranscript){
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
		if(onlyOnTranscript){
			return;
		}

		this.mainDoc.find(".mentioned-terms-categories").find("[trdata]").click($.proxy(function(event,source){
			this.mainDoc.find(".search-input").val($(this).attr("trdata"));
			this.mainDoc.find(".ri-transcript-filter-term").text($(event.target).attr("trdata"));
			this.mainDoc.find(".ri-transcript-filter-txt").addClass("active");
			//this.getPlayer().sendNotification('trLocalSearch',$(event.target).attr("trdata"));
		},this));
	},
	renderHighlightedWords : function (mentionedTerms){
		//race condition captions and mentioned terms data loading - both async load
		if(!this.getConfig("transcriptLoaded") || !this.getConfig("mentionedTermsLoaded") ){
			return;
		}
		var doc = window['parent'].document;
		for (var i=0;i<mentionedTerms.length;i++){
			var textToReplace = mentionedTerms[i].text;

			var rep = $(doc).find("#"+this.getConfig('transcriptTargetId')+" span:contains('"+textToReplace+"')");

			for(var j=0;j<rep.length;j++){
				//2 sec accuracy
				if( Math.abs(mentionedTerms[i].startTime-$(rep[j]).attr('trtime')*1000) < 2000 ){
					var output = $(rep[j]).text().replace( textToReplace , '<span class="highlight">'+textToReplace+'</span>');
					$(rep[j]).html(output)
				}
			}
		}
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
	getCompanies : function (){
		if(!this.getConfig("companies")){
			this.setConfig("companies",[]);
		}
		return this.getConfig("companies");
	},
	getKeywords : function (){
		if(!this.getConfig("keywords")){
			this.setConfig("keywords",[]);
		}
		return this.getConfig("keywords");
	},
	getPeople : function (){
		if(!this.getConfig("people")){
			this.setConfig("people",[]);
		}
		return this.getConfig("people");
	},
	getGeography : function (){
		if(!this.getConfig("geography")){
			this.setConfig("geography",[]);
		}
		return this.getConfig("geography");
	},
	updateTargetWithTemplate: function() {
		if( this.hasValidTargetElement() ) {
			var target = this.getTargetElement();
			this.getTemplateHTML().then(function(html) {
				target.innerHTML = html.html();
			});
		}
	},
	getKClient: function () {
		if (!this.kClient) {
			this.kClient = mw.kApiGetPartnerClient(this.embedPlayer.kwidgetid);
		}
		return this.kClient;
	}
}));