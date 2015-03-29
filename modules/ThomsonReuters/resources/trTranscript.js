mw.PluginManager.add( 'trTranscript', mw.KBasePlugin.extend({

	// This plugin will load the transcript data, parse it and inject it to a dedicated div
	// as HTML. The HTML will hold times attributes for seeking the player
	// TBD - highlight words
	// TBD if the plugin also needs to injects its HTML or not. We might decide that
	// another plugin will do that

	defaultConfig: {
		'targetId': 'transcriptContainer'
	},

	setup: function() {
		this.bind('newClosedCaptionsData', $.proxy(function(event,source){
			this.setTranscript(source.captions)
		},this));
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

		$(doc).find("#"+this.getConfig('transcriptDivId')).text("");
		$(doc).find("#"+this.getConfig('transcriptDivId')).append(htmlString);

	}

}));