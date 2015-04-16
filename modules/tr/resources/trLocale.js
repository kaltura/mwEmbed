mw.PluginManager.add( 'trLocale', mw.KBasePlugin.extend({

	defaultConfig: {

	},
	locale:{
		trPlayerMode: gM( 'tr-player-mode' ),
		trEnhancedMode: gM( 'tr-enhanced-mode' ),
		trTranscript: gM( 'Transcript' ),
		trMoreInfo: gM( 'tr-more-info' ),
		trEnterSearchTerms: gM( 'tr-enter-search-terms' ),
		trAutomaticallyGenerated: gM( 'tr-automatically-generated' ),
		trReviewForAccuracy: gM( 'tr-review-for-accuracy' ),
		tMentioneTerms: gM( 'tr-mentioned-terms' ),
		trCompanies: gM( 'tr-companies' ),
		trKeywords: gM( 'tr-keywords' ),
		trGeography: gM( 'tr-geography' ),
		trPeople: gM( 'tr-people' ),
		trSeries: gM( 'tr-series' ),
		trTags: gM( 'tr-tags' ),
		trSource: gM( 'tr-source' ),
		trClearFilter: gM( 'tr-clear-filter' ),
		trFilteredBy: gM( 'tr-filtered-by' )
	},
	setup: function() {
	}
}));
