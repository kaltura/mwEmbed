/**
 * @param	id	int		The id of the Access Control Profile (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	name	string		The name of the Access Control Profile.
 * @param	description	string		The description of the Access Control Profile.
 * @param	createdAt	int		Creation date as Unix timestamp (In seconds)  (readOnly).
 * @param	isDefault	int		True if this Conversion Profile is the default.
 * @param	restrictions	array		Array of Access Control Restrictions.
 */
function KalturaAccessControl(){
	this.id = null;
	this.partnerId = null;
	this.name = null;
	this.description = null;
	this.createdAt = null;
	this.isDefault = null;
	this.restrictions = null;
}
KalturaAccessControl.inheritsFrom (KalturaObjectBase);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 */
function KalturaAccessControlFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
}
KalturaAccessControlFilter.inheritsFrom (KalturaFilter);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaAccessControlListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaAccessControlListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	password	string		 (readOnly).
 * @param	email	string		 (readOnly).
 * @param	screenName	string		.
 */
function KalturaAdminUser(){
	this.password = null;
	this.email = null;
	this.screenName = null;
}
KalturaAdminUser.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	string		Auto generated 10 characters alphanumeric string (readOnly).
 * @param	name	string		Entry name (Min 1 chars).
 * @param	description	string		Entry description.
 * @param	partnerId	int		 (readOnly).
 * @param	userId	string		The ID of the user who is the owner of this entry .
 * @param	tags	string		Entry tags.
 * @param	adminTags	string		Entry admin tags can be updated only by administrators.
 * @param	categories	string		.
 * @param	status	int		 (readOnly).
 * @param	moderationStatus	int		Entry moderation status (readOnly).
 * @param	moderationCount	int		Number of moderation requests waiting for this entry (readOnly).
 * @param	type	int		The type of the entry, this is auto filled by the derived entry object (readOnly).
 * @param	createdAt	int		Entry creation date as Unix timestamp (In seconds) (readOnly).
 * @param	rank	float		Calculated rank (readOnly).
 * @param	totalRank	int		The total (sum) of all votes (readOnly).
 * @param	votes	int		Number of votes (readOnly).
 * @param	groupId	int		.
 * @param	partnerData	string		Can be used to store various partner related data as a string .
 * @param	downloadUrl	string		Download URL for the entry (readOnly).
 * @param	searchText	string		Indexed search text for full text search (readOnly).
 * @param	licenseType	int		License type used for this entry.
 * @param	version	int		Version of the entry data (readOnly).
 * @param	thumbnailUrl	string		Thumbnail URL (readOnly).
 * @param	accessControlId	int		The Access Control ID assigned to this entry (null when not set, send -1 to remove)  .
 * @param	startDate	int		Entry scheduling start date (null when not set, send -1 to remove).
 * @param	endDate	int		Entry scheduling end date (null when not set, send -1 to remove).
 */
function KalturaBaseEntry(){
	this.id = null;
	this.name = null;
	this.description = null;
	this.partnerId = null;
	this.userId = null;
	this.tags = null;
	this.adminTags = null;
	this.categories = null;
	this.status = null;
	this.moderationStatus = null;
	this.moderationCount = null;
	this.type = null;
	this.createdAt = null;
	this.rank = null;
	this.totalRank = null;
	this.votes = null;
	this.groupId = null;
	this.partnerData = null;
	this.downloadUrl = null;
	this.searchText = null;
	this.licenseType = null;
	this.version = null;
	this.thumbnailUrl = null;
	this.accessControlId = null;
	this.startDate = null;
	this.endDate = null;
}
KalturaBaseEntry.inheritsFrom (KalturaObjectBase);


/**
 * @param	idEqual	string		This filter should be in use for retrieving only a specific entry (identified by its entryId).
 *	@var strin.
 * @param	idIn	string		This filter should be in use for retrieving few specific entries (string should include comma separated list of entryId strings).
 *	@var strin.
 * @param	nameLike	string		This filter should be in use for retrieving specific entries while applying an SQL 'LIKE' pattern matching on entry names. It should include only one pattern for matching entry names against.
 *	@var strin.
 * @param	nameMultiLikeOr	string		This filter should be in use for retrieving specific entries, while applying an SQL 'LIKE' pattern matching on entry names. It could include few (comma separated) patterns for matching entry names against, while applying an OR logic to retrieve entries that match at least one input pattern.
 *	@var strin.
 * @param	nameMultiLikeAnd	string		This filter should be in use for retrieving specific entries, while applying an SQL 'LIKE' pattern matching on entry names. It could include few (comma separated) patterns for matching entry names against, while applying an AND logic to retrieve entries that match all input patterns.
 *	@var strin.
 * @param	nameEqual	string		This filter should be in use for retrieving entries with a specific name.
 *	@var strin.
 * @param	partnerIdEqual	int		This filter should be in use for retrieving only entries which were uploaded by/assigned to users of a specific Kaltura Partner (identified by Partner ID).
 *	@var in.
 * @param	partnerIdIn	string		This filter should be in use for retrieving only entries within Kaltura network which were uploaded by/assigned to users of few Kaltura Partners  (string should include comma separated list of PartnerIDs)
 *	@var strin.
 * @param	userIdEqual	string		This filter parameter should be in use for retrieving only entries, uploaded by/assigned to a specific user (identified by user Id).
 *	@var strin.
 * @param	tagsLike	string		This filter should be in use for retrieving specific entries while applying an SQL 'LIKE' pattern matching on entry tags. It should include only one pattern for matching entry tags against.
 *	@var strin.
 * @param	tagsMultiLikeOr	string		This filter should be in use for retrieving specific entries, while applying an SQL 'LIKE' pattern matching on tags.  It could include few (comma separated) patterns for matching entry tags against, while applying an OR logic to retrieve entries that match at least one input pattern.
 *	@var strin.
 * @param	tagsMultiLikeAnd	string		This filter should be in use for retrieving specific entries, while applying an SQL 'LIKE' pattern matching on tags.  It could include few (comma separated) patterns for matching entry tags against, while applying an AND logic to retrieve entries that match all input patterns.
 *	@var strin.
 * @param	adminTagsLike	string		This filter should be in use for retrieving specific entries while applying an SQL 'LIKE' pattern matching on entry tags, set by an ADMIN user. It should include only one pattern for matching entry tags against.
 *	@var strin.
 * @param	adminTagsMultiLikeOr	string		This filter should be in use for retrieving specific entries, while applying an SQL 'LIKE' pattern matching on tags, set by an ADMIN user.  It could include few (comma separated) patterns for matching entry tags against, while applying an OR logic to retrieve entries that match at least one input pattern.
 *	@var strin.
 * @param	adminTagsMultiLikeAnd	string		This filter should be in use for retrieving specific entries, while applying an SQL 'LIKE' pattern matching on tags, set by an ADMIN user.  It could include few (comma separated) patterns for matching entry tags against, while applying an AND logic to retrieve entries that match all input patterns.
 *	@var strin.
 * @param	categoriesMatchAnd	string		.
 * @param	categoriesMatchOr	string		.
 * @param	statusEqual	int		This filter should be in use for retrieving only entries, at a specific {@link ?object=KalturaEntryStatus KalturaEntryStatus}.
 *	@var KalturaEntryStatu.
 * @param	statusNotEqual	int		This filter should be in use for retrieving only entries, not at a specific {@link ?object=KalturaEntryStatus KalturaEntryStatus}.
 *	@var KalturaEntryStatu.
 * @param	statusIn	string		This filter should be in use for retrieving only entries, at few specific {@link ?object=KalturaEntryStatus KalturaEntryStatus} (comma separated).
 *	@var strin.
 * @param	statusNotIn	int		This filter should be in use for retrieving only entries, not at few specific {@link ?object=KalturaEntryStatus KalturaEntryStatus} (comma separated).
 *	@var KalturaEntryStatu.
 * @param	moderationStatusEqual	int		.
 * @param	moderationStatusNotEqual	int		.
 * @param	moderationStatusIn	string		.
 * @param	moderationStatusNotIn	int		.
 * @param	typeEqual	int		.
 * @param	typeIn	string		This filter should be in use for retrieving entries of few {@link ?object=KalturaEntryType KalturaEntryType} (string should include a comma separated list of {@link ?object=KalturaEntryType KalturaEntryType} enumerated parameters).
 *	@var strin.
 * @param	createdAtGreaterThanOrEqual	int		This filter parameter should be in use for retrieving only entries which were created at Kaltura system after a specific time/date (standard timestamp format).
 *	@var in.
 * @param	createdAtLessThanOrEqual	int		This filter parameter should be in use for retrieving only entries which were created at Kaltura system before a specific time/date (standard timestamp format).
 *	@var in.
 * @param	groupIdEqual	int		.
 * @param	searchTextMatchAnd	string		This filter should be in use for retrieving specific entries while search match the input string within all of the following metadata attributes: name, description, tags, adminTags.
 *	@var strin.
 * @param	searchTextMatchOr	string		This filter should be in use for retrieving specific entries while search match the input string within at least one of the following metadata attributes: name, description, tags, adminTags.
 *	@var strin.
 * @param	accessControlIdEqual	int		.
 * @param	accessControlIdIn	string		.
 * @param	startDateGreaterThanOrEqual	int		.
 * @param	startDateLessThanOrEqual	int		.
 * @param	startDateGreaterThanOrEqualOrNull	int		.
 * @param	startDateLessThanOrEqualOrNull	int		.
 * @param	endDateGreaterThanOrEqual	int		.
 * @param	endDateLessThanOrEqual	int		.
 * @param	endDateGreaterThanOrEqualOrNull	int		.
 * @param	endDateLessThanOrEqualOrNull	int		.
 * @param	tagsNameMultiLikeOr	string		.
 * @param	tagsAdminTagsMultiLikeOr	string		.
 * @param	tagsAdminTagsNameMultiLikeOr	string		.
 * @param	tagsNameMultiLikeAnd	string		.
 * @param	tagsAdminTagsMultiLikeAnd	string		.
 * @param	tagsAdminTagsNameMultiLikeAnd	string		.
 */
function KalturaBaseEntryFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.nameLike = null;
	this.nameMultiLikeOr = null;
	this.nameMultiLikeAnd = null;
	this.nameEqual = null;
	this.partnerIdEqual = null;
	this.partnerIdIn = null;
	this.userIdEqual = null;
	this.tagsLike = null;
	this.tagsMultiLikeOr = null;
	this.tagsMultiLikeAnd = null;
	this.adminTagsLike = null;
	this.adminTagsMultiLikeOr = null;
	this.adminTagsMultiLikeAnd = null;
	this.categoriesMatchAnd = null;
	this.categoriesMatchOr = null;
	this.statusEqual = null;
	this.statusNotEqual = null;
	this.statusIn = null;
	this.statusNotIn = null;
	this.moderationStatusEqual = null;
	this.moderationStatusNotEqual = null;
	this.moderationStatusIn = null;
	this.moderationStatusNotIn = null;
	this.typeEqual = null;
	this.typeIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.groupIdEqual = null;
	this.searchTextMatchAnd = null;
	this.searchTextMatchOr = null;
	this.accessControlIdEqual = null;
	this.accessControlIdIn = null;
	this.startDateGreaterThanOrEqual = null;
	this.startDateLessThanOrEqual = null;
	this.startDateGreaterThanOrEqualOrNull = null;
	this.startDateLessThanOrEqualOrNull = null;
	this.endDateGreaterThanOrEqual = null;
	this.endDateLessThanOrEqual = null;
	this.endDateGreaterThanOrEqualOrNull = null;
	this.endDateLessThanOrEqualOrNull = null;
	this.tagsNameMultiLikeOr = null;
	this.tagsAdminTagsMultiLikeOr = null;
	this.tagsAdminTagsNameMultiLikeOr = null;
	this.tagsNameMultiLikeAnd = null;
	this.tagsAdminTagsMultiLikeAnd = null;
	this.tagsAdminTagsNameMultiLikeAnd = null;
}
KalturaBaseEntryFilter.inheritsFrom (KalturaFilter);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaBaseEntryListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaBaseEntryListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		 (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	createdAt	int		 (readOnly).
 * @param	updatedAt	int		 (readOnly).
 * @param	deletedAt	int		 (readOnly).
 * @param	processorExpiration	int		 (readOnly).
 * @param	executionAttempts	int		 (readOnly).
 */
function KalturaBaseJob(){
	this.id = null;
	this.partnerId = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.deletedAt = null;
	this.processorExpiration = null;
	this.executionAttempts = null;
}
KalturaBaseJob.inheritsFrom (KalturaObjectBase);


/**
 * @param	idEqual	int		.
 * @param	idGreaterThanOrEqual	int		.
 * @param	partnerIdEqual	int		.
 * @param	partnerIdIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 */
function KalturaBaseJobFilter(){
	this.idEqual = null;
	this.idGreaterThanOrEqual = null;
	this.partnerIdEqual = null;
	this.partnerIdIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
}
KalturaBaseJobFilter.inheritsFrom (KalturaFilter);


/**
 */
function KalturaBaseRestriction(){
}
KalturaBaseRestriction.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	string		 (readOnly).
 * @param	feedUrl	string		 (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	playlistId	string		link a playlist that will set what content the feed will include
 *	if empty, all content will be included in feed.
 * @param	name	string		feed name.
 * @param	status	int		feed status (readOnly).
 * @param	type	int		feed type (readOnly).
 * @param	landingPage	string		Base URL for each video, on the partners site
 *	This is required by all syndication types..
 * @param	createdAt	int		Creation date as Unix timestamp (In seconds) (readOnly).
 * @param	allowEmbed	bool		allow_embed tells google OR yahoo weather to allow embedding the video on google OR yahoo video results
 *	or just to provide a link to the landing page.
 *	it is applied on the video-player_loc property in the XML (google)
 *	and addes media-player tag (yahoo).
 * @param	playerUiconfId	int		Select a uiconf ID as player skin to include in the kwidget url.
 * @param	flavorParamId	int		.
 * @param	transcodeExistingContent	bool		.
 * @param	addToDefaultConversionProfile	bool		.
 * @param	categories	string		.
 */
function KalturaBaseSyndicationFeed(){
	this.id = null;
	this.feedUrl = null;
	this.partnerId = null;
	this.playlistId = null;
	this.name = null;
	this.status = null;
	this.type = null;
	this.landingPage = null;
	this.createdAt = null;
	this.allowEmbed = null;
	this.playerUiconfId = null;
	this.flavorParamId = null;
	this.transcodeExistingContent = null;
	this.addToDefaultConversionProfile = null;
	this.categories = null;
}
KalturaBaseSyndicationFeed.inheritsFrom (KalturaObjectBase);


/**
 */
function KalturaBaseSyndicationFeedFilter(){
}
KalturaBaseSyndicationFeedFilter.inheritsFrom (KalturaFilter);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaBaseSyndicationFeedListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaBaseSyndicationFeedListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	entryId	string		.
 * @param	entryName	string		.
 * @param	jobType	int		 (readOnly).
 * @param	jobSubType	int		.
 * @param	onStressDivertTo	int		.
 * @param	data	KalturaJobData		.
 * @param	status	int		.
 * @param	abort	int		.
 * @param	checkAgainTimeout	int		.
 * @param	progress	int		.
 * @param	message	string		.
 * @param	description	string		.
 * @param	updatesCount	int		.
 * @param	priority	int		.
 * @param	workGroupId	int		.
 * @param	twinJobId	int		The id of identical job.
 * @param	bulkJobId	int		The id of the bulk upload job that initiated this job.
 * @param	parentJobId	int		When one job creates another - the parent should set this parentJobId to be its own id..
 * @param	rootJobId	int		The id of the root parent job.
 * @param	queueTime	int		The time that the job was pulled from the queue.
 * @param	finishTime	int		The time that the job was finished or closed as failed.
 * @param	errType	int		.
 * @param	errNumber	int		.
 * @param	fileSize	int		.
 * @param	lastWorkerRemote	bool		.
 * @param	schedulerId	int		.
 * @param	workerId	int		.
 * @param	batchIndex	int		.
 * @param	lastSchedulerId	int		.
 * @param	lastWorkerId	int		.
 * @param	dc	int		.
 */
function KalturaBatchJob(){
	this.entryId = null;
	this.entryName = null;
	this.jobType = null;
	this.jobSubType = null;
	this.onStressDivertTo = null;
	this.data = null;
	this.status = null;
	this.abort = null;
	this.checkAgainTimeout = null;
	this.progress = null;
	this.message = null;
	this.description = null;
	this.updatesCount = null;
	this.priority = null;
	this.workGroupId = null;
	this.twinJobId = null;
	this.bulkJobId = null;
	this.parentJobId = null;
	this.rootJobId = null;
	this.queueTime = null;
	this.finishTime = null;
	this.errType = null;
	this.errNumber = null;
	this.fileSize = null;
	this.lastWorkerRemote = null;
	this.schedulerId = null;
	this.workerId = null;
	this.batchIndex = null;
	this.lastSchedulerId = null;
	this.lastWorkerId = null;
	this.dc = null;
}
KalturaBatchJob.inheritsFrom (KalturaBaseJob);


/**
 * @param	entryIdEqual	string		.
 * @param	jobTypeEqual	int		.
 * @param	jobTypeIn	string		.
 * @param	jobTypeNotIn	int		.
 * @param	jobSubTypeEqual	int		.
 * @param	jobSubTypeIn	string		.
 * @param	onStressDivertToIn	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	workGroupIdIn	string		.
 * @param	queueTimeGreaterThanOrEqual	int		.
 * @param	queueTimeLessThanOrEqual	int		.
 * @param	finishTimeGreaterThanOrEqual	int		.
 * @param	finishTimeLessThanOrEqual	int		.
 * @param	errTypeIn	string		.
 * @param	fileSizeLessThan	int		.
 * @param	fileSizeGreaterThan	int		.
 */
function KalturaBatchJobFilter(){
	this.entryIdEqual = null;
	this.jobTypeEqual = null;
	this.jobTypeIn = null;
	this.jobTypeNotIn = null;
	this.jobSubTypeEqual = null;
	this.jobSubTypeIn = null;
	this.onStressDivertToIn = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.workGroupIdIn = null;
	this.queueTimeGreaterThanOrEqual = null;
	this.queueTimeLessThanOrEqual = null;
	this.finishTimeGreaterThanOrEqual = null;
	this.finishTimeLessThanOrEqual = null;
	this.errTypeIn = null;
	this.fileSizeLessThan = null;
	this.fileSizeGreaterThan = null;
}
KalturaBatchJobFilter.inheritsFrom (KalturaBaseJobFilter);


/**
 * @param	jobTypeAndSubTypeIn	string		.
 */
function KalturaBatchJobFilterExt(){
	this.jobTypeAndSubTypeIn = null;
}
KalturaBatchJobFilterExt.inheritsFrom (KalturaBatchJobFilter);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaBatchJobListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaBatchJobListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	entryIds	string		Comma separated list of entry ids.
 * @param	flavorParamsId	int		Flavor params id to use for conversion.
 * @param	puserId	string		The id of the requesting user.
 */
function KalturaBulkDownloadJobData(){
	this.entryIds = null;
	this.flavorParamsId = null;
	this.puserId = null;
}
KalturaBulkDownloadJobData.inheritsFrom (KalturaJobData);


/**
 * @param	id	int		.
 * @param	uploadedBy	string		.
 * @param	uploadedOn	int		.
 * @param	numOfEntries	int		.
 * @param	status	int		.
 * @param	logFileUrl	string		.
 * @param	csvFileUrl	string		.
 * @param	results	array		.
 */
function KalturaBulkUpload(){
	this.id = null;
	this.uploadedBy = null;
	this.uploadedOn = null;
	this.numOfEntries = null;
	this.status = null;
	this.logFileUrl = null;
	this.csvFileUrl = null;
	this.results = null;
}
KalturaBulkUpload.inheritsFrom (KalturaObjectBase);


/**
 * @param	userId	int		.
 * @param	uploadedBy	string		The screen name of the user.
 * @param	conversionProfileId	int		Selected profile id for all bulk entries.
 * @param	csvFilePath	string		Created by the API.
 * @param	resultsFileLocalPath	string		Created by the API.
 * @param	resultsFileUrl	string		Created by the API.
 * @param	numOfEntries	int		Number of created entries.
 * @param	csvVersion	string		The version of the csv file.
 */
function KalturaBulkUploadJobData(){
	this.userId = null;
	this.uploadedBy = null;
	this.conversionProfileId = null;
	this.csvFilePath = null;
	this.resultsFileLocalPath = null;
	this.resultsFileUrl = null;
	this.numOfEntries = null;
	this.csvVersion = null;
}
KalturaBulkUploadJobData.inheritsFrom (KalturaJobData);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaBulkUploadListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaBulkUploadListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		The id of the result (readOnly).
 * @param	bulkUploadJobId	int		The id of the parent job.
 * @param	lineIndex	int		The index of the line in the CSV.
 * @param	partnerId	int		.
 * @param	entryId	string		.
 * @param	entryStatus	int		.
 * @param	rowData	string		The data as recieved in the csv.
 * @param	title	string		.
 * @param	description	string		.
 * @param	tags	string		.
 * @param	url	string		.
 * @param	contentType	string		.
 * @param	conversionProfileId	int		.
 * @param	accessControlProfileId	int		.
 * @param	category	string		.
 * @param	scheduleStartDate	int		.
 * @param	scheduleEndDate	int		.
 * @param	thumbnailUrl	string		.
 * @param	thumbnailSaved	bool		.
 * @param	partnerData	string		.
 * @param	errorDescription	string		.
 */
function KalturaBulkUploadResult(){
	this.id = null;
	this.bulkUploadJobId = null;
	this.lineIndex = null;
	this.partnerId = null;
	this.entryId = null;
	this.entryStatus = null;
	this.rowData = null;
	this.title = null;
	this.description = null;
	this.tags = null;
	this.url = null;
	this.contentType = null;
	this.conversionProfileId = null;
	this.accessControlProfileId = null;
	this.category = null;
	this.scheduleStartDate = null;
	this.scheduleEndDate = null;
	this.thumbnailUrl = null;
	this.thumbnailSaved = null;
	this.partnerData = null;
	this.errorDescription = null;
}
KalturaBulkUploadResult.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	string		 (readOnly).
 * @param	partnerId	int		.
 * @param	browser	string		.
 * @param	serverIp	string		.
 * @param	serverOs	string		.
 * @param	phpVersion	string		.
 * @param	ceAdminEmail	string		.
 * @param	type	string		.
 * @param	description	string		.
 * @param	data	string		.
 */
function KalturaCEError(){
	this.id = null;
	this.partnerId = null;
	this.browser = null;
	this.serverIp = null;
	this.serverOs = null;
	this.phpVersion = null;
	this.ceAdminEmail = null;
	this.type = null;
	this.description = null;
	this.data = null;
}
KalturaCEError.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		The id of the Category (readOnly).
 * @param	parentId	int		.
 * @param	depth	int		 (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	name	string		The name of the Category. 
 *	The following characters are not allowed: '<', '>', ','.
 * @param	fullName	string		The full name of the Category (readOnly).
 * @param	entriesCount	int		Number of entries in this Category (including child categories) (readOnly).
 * @param	createdAt	int		Creation date as Unix timestamp (In seconds) (readOnly).
 */
function KalturaCategory(){
	this.id = null;
	this.parentId = null;
	this.depth = null;
	this.partnerId = null;
	this.name = null;
	this.fullName = null;
	this.entriesCount = null;
	this.createdAt = null;
}
KalturaCategory.inheritsFrom (KalturaObjectBase);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	parentIdEqual	int		.
 * @param	parentIdIn	string		.
 * @param	depthEqual	int		.
 * @param	fullNameEqual	string		.
 * @param	fullNameStartsWith	string		.
 */
function KalturaCategoryFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.parentIdEqual = null;
	this.parentIdIn = null;
	this.depthEqual = null;
	this.fullNameEqual = null;
	this.fullNameStartsWith = null;
}
KalturaCategoryFilter.inheritsFrom (KalturaFilter);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaCategoryListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaCategoryListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	url	string		The URL where the notification should be sent to .
 * @param	data	string		The serialized notification data to send.
 */
function KalturaClientNotification(){
	this.url = null;
	this.data = null;
}
KalturaClientNotification.inheritsFrom (KalturaObjectBase);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	createdByIdEqual	int		.
 * @param	typeEqual	int		.
 * @param	typeIn	string		.
 * @param	targetTypeEqual	int		.
 * @param	targetTypeIn	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 */
function KalturaControlPanelCommandFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.createdByIdEqual = null;
	this.typeEqual = null;
	this.typeIn = null;
	this.targetTypeEqual = null;
	this.targetTypeIn = null;
	this.statusEqual = null;
	this.statusIn = null;
}
KalturaControlPanelCommandFilter.inheritsFrom (KalturaFilter);


/**
 * @param	srcFileSyncLocalPath	string		.
 * @param	srcFileSyncRemoteUrl	string		.
 * @param	flavorParamsOutputId	int		.
 * @param	flavorParamsOutput	KalturaFlavorParamsOutput		.
 * @param	mediaInfoId	int		.
 */
function KalturaConvartableJobData(){
	this.srcFileSyncLocalPath = null;
	this.srcFileSyncRemoteUrl = null;
	this.flavorParamsOutputId = null;
	this.flavorParamsOutput = null;
	this.mediaInfoId = null;
}
KalturaConvartableJobData.inheritsFrom (KalturaJobData);


/**
 * @param	id	int		The id of the Conversion Profile (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	name	string		The name of the Conversion Profile.
 * @param	description	string		The description of the Conversion Profile.
 * @param	createdAt	int		Creation date as Unix timestamp (In seconds)  (readOnly).
 * @param	flavorParamsIds	string		List of included flavor ids (comma separated).
 * @param	isDefault	int		True if this Conversion Profile is the default.
 * @param	cropDimensions	KalturaCropDimensions		Cropping dimensions.
 * @param	clipStart	int		Clipping start position (in miliseconds).
 * @param	clipDuration	int		Clipping duration (in miliseconds).
 */
function KalturaConversionProfile(){
	this.id = null;
	this.partnerId = null;
	this.name = null;
	this.description = null;
	this.createdAt = null;
	this.flavorParamsIds = null;
	this.isDefault = null;
	this.cropDimensions = null;
	this.clipStart = null;
	this.clipDuration = null;
}
KalturaConversionProfile.inheritsFrom (KalturaObjectBase);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 */
function KalturaConversionProfileFilter(){
	this.idEqual = null;
	this.idIn = null;
}
KalturaConversionProfileFilter.inheritsFrom (KalturaFilter);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaConversionProfileListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaConversionProfileListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	destFileSyncLocalPath	string		.
 * @param	destFileSyncRemoteUrl	string		.
 * @param	logFileSyncLocalPath	string		.
 * @param	flavorAssetId	string		.
 * @param	remoteMediaId	string		.
 */
function KalturaConvertJobData(){
	this.destFileSyncLocalPath = null;
	this.destFileSyncRemoteUrl = null;
	this.logFileSyncLocalPath = null;
	this.flavorAssetId = null;
	this.remoteMediaId = null;
}
KalturaConvertJobData.inheritsFrom (KalturaConvartableJobData);


/**
 * @param	inputFileSyncLocalPath	string		.
 * @param	thumbHeight	int		The height of last created thumbnail, will be used to comapare if this thumbnail is the best we can have.
 * @param	thumbBitrate	int		The bit rate of last created thumbnail, will be used to comapare if this thumbnail is the best we can have.
 */
function KalturaConvertProfileJobData(){
	this.inputFileSyncLocalPath = null;
	this.thumbHeight = null;
	this.thumbBitrate = null;
}
KalturaConvertProfileJobData.inheritsFrom (KalturaJobData);


/**
 * @param	countryRestrictionType	int		Country restriction type (Allow or deny).
 * @param	countryList	string		Comma separated list of country codes to allow to deny .
 */
function KalturaCountryRestriction(){
	this.countryRestrictionType = null;
	this.countryList = null;
}
KalturaCountryRestriction.inheritsFrom (KalturaBaseRestriction);


/**
 * @param	left	int		Crop left point.
 * @param	top	int		Crop top point.
 * @param	width	int		Crop width.
 * @param	height	int		Crop height.
 */
function KalturaCropDimensions(){
	this.left = null;
	this.top = null;
	this.width = null;
	this.height = null;
}
KalturaCropDimensions.inheritsFrom (KalturaObjectBase);


/**
 * @param	dataContent	string		The data of the entry.
 */
function KalturaDataEntry(){
	this.dataContent = null;
}
KalturaDataEntry.inheritsFrom (KalturaBaseEntry);


/**
 */
function KalturaDataEntryFilter(){
}
KalturaDataEntryFilter.inheritsFrom (KalturaBaseEntryFilter);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaDataListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaDataListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	directoryRestrictionType	int		Kaltura directory restriction type.
 */
function KalturaDirectoryRestriction(){
	this.directoryRestrictionType = null;
}
KalturaDirectoryRestriction.inheritsFrom (KalturaBaseRestriction);


/**
 * @param	documentType	int		The type of the document (insertOnly).
 */
function KalturaDocumentEntry(){
	this.documentType = null;
}
KalturaDocumentEntry.inheritsFrom (KalturaBaseEntry);


/**
 * @param	documentTypeEqual	int		.
 * @param	documentTypeIn	string		.
 */
function KalturaDocumentEntryFilter(){
	this.documentTypeEqual = null;
	this.documentTypeIn = null;
}
KalturaDocumentEntryFilter.inheritsFrom (KalturaBaseEntryFilter);


/**
 * @param	referrer	string		.
 */
function KalturaEntryContextDataParams(){
	this.referrer = null;
}
KalturaEntryContextDataParams.inheritsFrom (KalturaObjectBase);


/**
 * @param	isSiteRestricted	bool		.
 * @param	isCountryRestricted	bool		.
 * @param	isSessionRestricted	bool		.
 * @param	previewLength	int		.
 * @param	isScheduledNow	bool		.
 * @param	isAdmin	bool		.
 */
function KalturaEntryContextDataResult(){
	this.isSiteRestricted = null;
	this.isCountryRestricted = null;
	this.isSessionRestricted = null;
	this.previewLength = null;
	this.isScheduledNow = null;
	this.isAdmin = null;
}
KalturaEntryContextDataResult.inheritsFrom (KalturaObjectBase);


/**
 * @param	flavorAssetId	string		.
 */
function KalturaExtractMediaJobData(){
	this.flavorAssetId = null;
}
KalturaExtractMediaJobData.inheritsFrom (KalturaConvartableJobData);


/**
 * @param	id	int		 (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	objectType	int		 (readOnly).
 * @param	objectId	string		 (readOnly).
 * @param	version	string		 (readOnly).
 * @param	objectSubType	int		 (readOnly).
 * @param	dc	string		 (readOnly).
 * @param	original	int		 (readOnly).
 * @param	createdAt	int		 (readOnly).
 * @param	updatedAt	int		 (readOnly).
 * @param	readyAt	int		 (readOnly).
 * @param	syncTime	int		 (readOnly).
 * @param	status	int		 (readOnly).
 * @param	fileType	int		 (readOnly).
 * @param	linkedId	int		 (readOnly).
 * @param	linkCount	int		 (readOnly).
 * @param	fileRoot	string		 (readOnly).
 * @param	filePath	string		 (readOnly).
 * @param	fileSize	int		 (readOnly).
 * @param	fileUrl	string		 (readOnly).
 * @param	fileContent	string		 (readOnly).
 */
function KalturaFileSync(){
	this.id = null;
	this.partnerId = null;
	this.objectType = null;
	this.objectId = null;
	this.version = null;
	this.objectSubType = null;
	this.dc = null;
	this.original = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.readyAt = null;
	this.syncTime = null;
	this.status = null;
	this.fileType = null;
	this.linkedId = null;
	this.linkCount = null;
	this.fileRoot = null;
	this.filePath = null;
	this.fileSize = null;
	this.fileUrl = null;
	this.fileContent = null;
}
KalturaFileSync.inheritsFrom (KalturaObjectBase);


/**
 * @param	partnerIdEqual	int		.
 * @param	objectTypeEqual	int		.
 * @param	objectTypeIn	string		.
 * @param	objectIdEqual	string		.
 * @param	objectIdIn	string		.
 * @param	versionEqual	string		.
 * @param	versionIn	string		.
 * @param	objectSubTypeEqual	int		.
 * @param	objectSubTypeIn	string		.
 * @param	dcEqual	string		.
 * @param	dcIn	string		.
 * @param	originalEqual	int		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 * @param	readyAtGreaterThanOrEqual	int		.
 * @param	readyAtLessThanOrEqual	int		.
 * @param	syncTimeGreaterThanOrEqual	int		.
 * @param	syncTimeLessThanOrEqual	int		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	fileTypeEqual	int		.
 * @param	fileTypeIn	string		.
 * @param	linkedIdEqual	int		.
 * @param	linkCountGreaterThanOrEqual	int		.
 * @param	linkCountLessThanOrEqual	int		.
 * @param	fileSizeGreaterThanOrEqual	int		.
 * @param	fileSizeLessThanOrEqual	int		.
 */
function KalturaFileSyncFilter(){
	this.partnerIdEqual = null;
	this.objectTypeEqual = null;
	this.objectTypeIn = null;
	this.objectIdEqual = null;
	this.objectIdIn = null;
	this.versionEqual = null;
	this.versionIn = null;
	this.objectSubTypeEqual = null;
	this.objectSubTypeIn = null;
	this.dcEqual = null;
	this.dcIn = null;
	this.originalEqual = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
	this.readyAtGreaterThanOrEqual = null;
	this.readyAtLessThanOrEqual = null;
	this.syncTimeGreaterThanOrEqual = null;
	this.syncTimeLessThanOrEqual = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.fileTypeEqual = null;
	this.fileTypeIn = null;
	this.linkedIdEqual = null;
	this.linkCountGreaterThanOrEqual = null;
	this.linkCountLessThanOrEqual = null;
	this.fileSizeGreaterThanOrEqual = null;
	this.fileSizeLessThanOrEqual = null;
}
KalturaFileSyncFilter.inheritsFrom (KalturaFilter);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaFileSyncListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaFileSyncListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	orderBy	string		.
 */
function KalturaFilter(){
	this.orderBy = null;
}
KalturaFilter.inheritsFrom (KalturaObjectBase);


/**
 * @param	pageSize	int		The number of objects to retrieve. (Default is 30, maximum page size is 500)..
 * @param	pageIndex	int		The page number for which {pageSize} of objects should be retrieved (Default is 1)..
 */
function KalturaFilterPager(){
	this.pageSize = null;
	this.pageIndex = null;
}
KalturaFilterPager.inheritsFrom (KalturaObjectBase);


/**
 */
function KalturaFlattenJobData(){
}
KalturaFlattenJobData.inheritsFrom (KalturaJobData);


/**
 * @param	id	string		The ID of the Flavor Asset (readOnly).
 * @param	entryId	string		The entry ID of the Flavor Asset (readOnly).
 * @param	partnerId	string		 (readOnly).
 * @param	status	int		The status of the Flavor Asset (readOnly).
 * @param	flavorParamsId	int		The Flavor Params used to create this Flavor Asset (readOnly).
 * @param	version	int		The version of the Flavor Asset (readOnly).
 * @param	width	int		The width of the Flavor Asset  (readOnly).
 * @param	height	int		The height of the Flavor Asset (readOnly).
 * @param	bitrate	int		The overall bitrate (in KBits) of the Flavor Asset  (readOnly).
 * @param	frameRate	int		The frame rate (in FPS) of the Flavor Asset (readOnly).
 * @param	size	int		The size (in KBytes) of the Flavor Asset (readOnly).
 * @param	isOriginal	bool		True if this Flavor Asset is the original source.
 * @param	tags	string		Tags used to identify the Flavor Asset in various scenarios.
 * @param	isWeb	bool		True if this Flavor Asset is playable in KDP.
 * @param	fileExt	string		The file extension.
 * @param	containerFormat	string		The container format.
 * @param	videoCodecId	string		The video codec.
 * @param	createdAt	int		.
 * @param	updatedAt	int		.
 * @param	deletedAt	int		.
 * @param	description	string		.
 */
function KalturaFlavorAsset(){
	this.id = null;
	this.entryId = null;
	this.partnerId = null;
	this.status = null;
	this.flavorParamsId = null;
	this.version = null;
	this.width = null;
	this.height = null;
	this.bitrate = null;
	this.frameRate = null;
	this.size = null;
	this.isOriginal = null;
	this.tags = null;
	this.isWeb = null;
	this.fileExt = null;
	this.containerFormat = null;
	this.videoCodecId = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.deletedAt = null;
	this.description = null;
}
KalturaFlavorAsset.inheritsFrom (KalturaObjectBase);


/**
 * @param	flavorAsset	KalturaFlavorAsset		The Flavor Asset (Can be null when there are params without asset).
 * @param	flavorParams	KalturaFlavorParams		The Flavor Params.
 * @param	entryId	string		The entry id.
 */
function KalturaFlavorAssetWithParams(){
	this.flavorAsset = null;
	this.flavorParams = null;
	this.entryId = null;
}
KalturaFlavorAssetWithParams.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		The id of the Flavor Params (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	name	string		The name of the Flavor Params.
 * @param	description	string		The description of the Flavor Params.
 * @param	createdAt	int		Creation date as Unix timestamp (In seconds) (readOnly).
 * @param	isSystemDefault	int		True if those Flavor Params are part of system defaults (readOnly).
 * @param	tags	string		The Flavor Params tags are used to identify the flavor for different usage (e.g. web, hd, mobile).
 * @param	format	string		The container format of the Flavor Params.
 * @param	videoCodec	string		The video codec of the Flavor Params.
 * @param	videoBitrate	int		The video bitrate (in KBits) of the Flavor Params.
 * @param	audioCodec	string		The audio codec of the Flavor Params.
 * @param	audioBitrate	int		The audio bitrate (in KBits) of the Flavor Params.
 * @param	audioChannels	int		The number of audio channels for "downmixing".
 * @param	audioSampleRate	int		The audio sample rate of the Flavor Params.
 * @param	width	int		The desired width of the Flavor Params.
 * @param	height	int		The desired height of the Flavor Params.
 * @param	frameRate	int		The frame rate of the Flavor Params.
 * @param	gopSize	int		The gop size of the Flavor Params.
 * @param	conversionEngines	string		The list of conversion engines (comma separated).
 * @param	conversionEnginesExtraParams	string		The list of conversion engines extra params (separated with "|").
 * @param	twoPass	bool		.
 */
function KalturaFlavorParams(){
	this.id = null;
	this.partnerId = null;
	this.name = null;
	this.description = null;
	this.createdAt = null;
	this.isSystemDefault = null;
	this.tags = null;
	this.format = null;
	this.videoCodec = null;
	this.videoBitrate = null;
	this.audioCodec = null;
	this.audioBitrate = null;
	this.audioChannels = null;
	this.audioSampleRate = null;
	this.width = null;
	this.height = null;
	this.frameRate = null;
	this.gopSize = null;
	this.conversionEngines = null;
	this.conversionEnginesExtraParams = null;
	this.twoPass = null;
}
KalturaFlavorParams.inheritsFrom (KalturaObjectBase);


/**
 * @param	isSystemDefaultEqual	int		.
 */
function KalturaFlavorParamsFilter(){
	this.isSystemDefaultEqual = null;
}
KalturaFlavorParamsFilter.inheritsFrom (KalturaFilter);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaFlavorParamsListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaFlavorParamsListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	flavorParamsId	int		.
 * @param	commandLinesStr	string		.
 * @param	flavorParamsVersion	string		.
 * @param	flavorAssetId	string		.
 * @param	flavorAssetVersion	string		.
 */
function KalturaFlavorParamsOutput(){
	this.flavorParamsId = null;
	this.commandLinesStr = null;
	this.flavorParamsVersion = null;
	this.flavorAssetId = null;
	this.flavorAssetVersion = null;
}
KalturaFlavorParamsOutput.inheritsFrom (KalturaFlavorParams);


/**
 * @param	flavorParamsIdEqual	int		.
 * @param	flavorParamsVersionEqual	string		.
 * @param	flavorAssetIdEqual	string		.
 * @param	flavorAssetVersionEqual	string		.
 */
function KalturaFlavorParamsOutputFilter(){
	this.flavorParamsIdEqual = null;
	this.flavorParamsVersionEqual = null;
	this.flavorAssetIdEqual = null;
	this.flavorAssetVersionEqual = null;
}
KalturaFlavorParamsOutputFilter.inheritsFrom (KalturaFlavorParamsFilter);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaFlavorParamsOutputListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaFlavorParamsOutputListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	adultContent	string		.
 */
function KalturaGoogleVideoSyndicationFeed(){
	this.adultContent = null;
}
KalturaGoogleVideoSyndicationFeed.inheritsFrom (KalturaBaseSyndicationFeed);


/**
 */
function KalturaGoogleVideoSyndicationFeedFilter(){
}
KalturaGoogleVideoSyndicationFeedFilter.inheritsFrom (KalturaBaseSyndicationFeedFilter);


/**
 * @param	feedDescription	string		feed description.
 * @param	language	string		feed language.
 * @param	feedLandingPage	string		feed landing page (i.e publisher website).
 * @param	ownerName	string		author/publisher name.
 * @param	ownerEmail	string		publisher email.
 * @param	feedImageUrl	string		podcast thumbnail.
 * @param	category	string		 (readOnly).
 * @param	adultContent	string		.
 * @param	feedAuthor	string		.
 */
function KalturaITunesSyndicationFeed(){
	this.feedDescription = null;
	this.language = null;
	this.feedLandingPage = null;
	this.ownerName = null;
	this.ownerEmail = null;
	this.feedImageUrl = null;
	this.category = null;
	this.adultContent = null;
	this.feedAuthor = null;
}
KalturaITunesSyndicationFeed.inheritsFrom (KalturaBaseSyndicationFeed);


/**
 */
function KalturaITunesSyndicationFeedFilter(){
}
KalturaITunesSyndicationFeedFilter.inheritsFrom (KalturaBaseSyndicationFeedFilter);


/**
 * @param	srcFileUrl	string		.
 * @param	destFileLocalPath	string		.
 * @param	flavorAssetId	string		.
 */
function KalturaImportJobData(){
	this.srcFileUrl = null;
	this.destFileLocalPath = null;
	this.flavorAssetId = null;
}
KalturaImportJobData.inheritsFrom (KalturaJobData);


/**
 */
function KalturaJobData(){
}
KalturaJobData.inheritsFrom (KalturaObjectBase);


/**
 * @param	mailType	int		.
 * @param	mailPriority	int		.
 * @param	status	int		.
 * @param	recipientName	string		.
 * @param	recipientEmail	string		.
 * @param	recipientId	int		kuserId  .
 * @param	fromName	string		.
 * @param	fromEmail	string		.
 * @param	bodyParams	string		.
 * @param	subjectParams	string		.
 * @param	templatePath	string		.
 * @param	culture	int		.
 * @param	campaignId	int		.
 * @param	minSendDate	int		.
 */
function KalturaMailJob(){
	this.mailType = null;
	this.mailPriority = null;
	this.status = null;
	this.recipientName = null;
	this.recipientEmail = null;
	this.recipientId = null;
	this.fromName = null;
	this.fromEmail = null;
	this.bodyParams = null;
	this.subjectParams = null;
	this.templatePath = null;
	this.culture = null;
	this.campaignId = null;
	this.minSendDate = null;
}
KalturaMailJob.inheritsFrom (KalturaBaseJob);


/**
 * @param	mailType	int		.
 * @param	mailPriority	int		.
 * @param	status	int		.
 * @param	recipientName	string		.
 * @param	recipientEmail	string		.
 * @param	recipientId	int		kuserId  .
 * @param	fromName	string		.
 * @param	fromEmail	string		.
 * @param	bodyParams	string		.
 * @param	subjectParams	string		.
 * @param	templatePath	string		.
 * @param	culture	int		.
 * @param	campaignId	int		.
 * @param	minSendDate	int		.
 * @param	isHtml	bool		.
 */
function KalturaMailJobData(){
	this.mailType = null;
	this.mailPriority = null;
	this.status = null;
	this.recipientName = null;
	this.recipientEmail = null;
	this.recipientId = null;
	this.fromName = null;
	this.fromEmail = null;
	this.bodyParams = null;
	this.subjectParams = null;
	this.templatePath = null;
	this.culture = null;
	this.campaignId = null;
	this.minSendDate = null;
	this.isHtml = null;
}
KalturaMailJobData.inheritsFrom (KalturaJobData);


/**
 */
function KalturaMailJobFilter(){
}
KalturaMailJobFilter.inheritsFrom (KalturaBaseJobFilter);


/**
 * @param	mediaType	int		The media type of the entry (insertOnly).
 * @param	conversionQuality	string		Override the default conversion quality   (insertOnly).
 * @param	sourceType	int		The source type of the entry  (readOnly).
 * @param	searchProviderType	int		The search provider type used to import this entry (readOnly).
 * @param	searchProviderId	string		The ID of the media in the importing site (readOnly).
 * @param	creditUserName	string		The user name used for credits.
 * @param	creditUrl	string		The URL for credits.
 * @param	mediaDate	int		The media date extracted from EXIF data (For images) as Unix timestamp (In seconds) (readOnly).
 * @param	dataUrl	string		The URL used for playback. This is not the download URL. (readOnly).
 * @param	flavorParamsIds	string		Comma separated flavor params ids that exists for this media entry (readOnly).
 */
function KalturaMediaEntry(){
	this.mediaType = null;
	this.conversionQuality = null;
	this.sourceType = null;
	this.searchProviderType = null;
	this.searchProviderId = null;
	this.creditUserName = null;
	this.creditUrl = null;
	this.mediaDate = null;
	this.dataUrl = null;
	this.flavorParamsIds = null;
}
KalturaMediaEntry.inheritsFrom (KalturaPlayableEntry);


/**
 * @param	mediaTypeEqual	int		.
 * @param	mediaTypeIn	string		.
 * @param	mediaDateGreaterThanOrEqual	int		.
 * @param	mediaDateLessThanOrEqual	int		.
 * @param	flavorParamsIdsMatchOr	string		.
 * @param	flavorParamsIdsMatchAnd	string		.
 */
function KalturaMediaEntryFilter(){
	this.mediaTypeEqual = null;
	this.mediaTypeIn = null;
	this.mediaDateGreaterThanOrEqual = null;
	this.mediaDateLessThanOrEqual = null;
	this.flavorParamsIdsMatchOr = null;
	this.flavorParamsIdsMatchAnd = null;
}
KalturaMediaEntryFilter.inheritsFrom (KalturaPlayableEntryFilter);


/**
 * @param	limit	int		.
 */
function KalturaMediaEntryFilterForPlaylist(){
	this.limit = null;
}
KalturaMediaEntryFilterForPlaylist.inheritsFrom (KalturaMediaEntryFilter);


/**
 * @param	id	int		The id of the media info (readOnly).
 * @param	flavorAssetId	string		The id of the related flavor asset.
 * @param	fileSize	int		The file size.
 * @param	containerFormat	string		The container format.
 * @param	containerId	string		The container id.
 * @param	containerProfile	string		The container profile.
 * @param	containerDuration	int		The container duration.
 * @param	containerBitRate	int		The container bit rate.
 * @param	videoFormat	string		The video format.
 * @param	videoCodecId	string		The video codec id.
 * @param	videoDuration	int		The video duration.
 * @param	videoBitRate	int		The video bit rate.
 * @param	videoBitRateMode	int		The video bit rate mode.
 * @param	videoWidth	int		The video width.
 * @param	videoHeight	int		The video height.
 * @param	videoFrameRate	float		The video frame rate.
 * @param	videoDar	float		The video display aspect ratio (dar).
 * @param	videoRotation	int		.
 * @param	audioFormat	string		The audio format.
 * @param	audioCodecId	string		The audio codec id.
 * @param	audioDuration	int		The audio duration.
 * @param	audioBitRate	int		The audio bit rate.
 * @param	audioBitRateMode	int		The audio bit rate mode.
 * @param	audioChannels	int		The number of audio channels.
 * @param	audioSamplingRate	int		The audio sampling rate.
 * @param	audioResolution	int		The audio resolution.
 * @param	writingLib	string		The writing library.
 * @param	rawData	string		The data as returned by the mediainfo command line.
 */
function KalturaMediaInfo(){
	this.id = null;
	this.flavorAssetId = null;
	this.fileSize = null;
	this.containerFormat = null;
	this.containerId = null;
	this.containerProfile = null;
	this.containerDuration = null;
	this.containerBitRate = null;
	this.videoFormat = null;
	this.videoCodecId = null;
	this.videoDuration = null;
	this.videoBitRate = null;
	this.videoBitRateMode = null;
	this.videoWidth = null;
	this.videoHeight = null;
	this.videoFrameRate = null;
	this.videoDar = null;
	this.videoRotation = null;
	this.audioFormat = null;
	this.audioCodecId = null;
	this.audioDuration = null;
	this.audioBitRate = null;
	this.audioBitRateMode = null;
	this.audioChannels = null;
	this.audioSamplingRate = null;
	this.audioResolution = null;
	this.writingLib = null;
	this.rawData = null;
}
KalturaMediaInfo.inheritsFrom (KalturaObjectBase);


/**
 * @param	flavorAssetIdEqual	string		.
 */
function KalturaMediaInfoFilter(){
	this.flavorAssetIdEqual = null;
}
KalturaMediaInfoFilter.inheritsFrom (KalturaFilter);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaMediaInfoListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaMediaInfoListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaMediaListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaMediaListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	hasRealThumbnail	bool		Indicates whether the user has submited a real thumbnail to the mix (Not the one that was generated automaticaly) (readOnly).
 * @param	editorType	int		The editor type used to edit the metadata.
 * @param	dataContent	string		The xml data of the mix.
 */
function KalturaMixEntry(){
	this.hasRealThumbnail = null;
	this.editorType = null;
	this.dataContent = null;
}
KalturaMixEntry.inheritsFrom (KalturaPlayableEntry);


/**
 */
function KalturaMixEntryFilter(){
}
KalturaMixEntryFilter.inheritsFrom (KalturaPlayableEntryFilter);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaMixListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaMixListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		Moderation flag id (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	userId	string		The user id that added the moderation flag (readOnly).
 * @param	moderationObjectType	int		The type of the moderation flag (entry or user) (readOnly).
 * @param	flaggedEntryId	string		If moderation flag is set for entry, this is the flagged entry id.
 * @param	flaggedUserId	string		If moderation flag is set for user, this is the flagged user id.
 * @param	status	int		The moderation flag status (readOnly).
 * @param	comments	string		The comment that was added to the flag.
 * @param	flagType	int		.
 * @param	createdAt	int		 (readOnly).
 * @param	updatedAt	int		 (readOnly).
 */
function KalturaModerationFlag(){
	this.id = null;
	this.partnerId = null;
	this.userId = null;
	this.moderationObjectType = null;
	this.flaggedEntryId = null;
	this.flaggedUserId = null;
	this.status = null;
	this.comments = null;
	this.flagType = null;
	this.createdAt = null;
	this.updatedAt = null;
}
KalturaModerationFlag.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaModerationFlagListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaModerationFlagListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	puserId	string		.
 * @param	type	int		.
 * @param	objectId	string		.
 * @param	status	int		.
 * @param	notificationData	string		.
 * @param	numberOfAttempts	int		.
 * @param	notificationResult	string		.
 * @param	objType	int		.
 */
function KalturaNotification(){
	this.puserId = null;
	this.type = null;
	this.objectId = null;
	this.status = null;
	this.notificationData = null;
	this.numberOfAttempts = null;
	this.notificationResult = null;
	this.objType = null;
}
KalturaNotification.inheritsFrom (KalturaBaseJob);


/**
 */
function KalturaNotificationFilter(){
}
KalturaNotificationFilter.inheritsFrom (KalturaBaseJobFilter);


/**
 * @param	userId	string		.
 * @param	type	int		.
 * @param	typeAsString	string		.
 * @param	objectId	string		.
 * @param	status	int		.
 * @param	data	string		.
 * @param	numberOfAttempts	int		.
 * @param	notificationResult	string		.
 * @param	objType	int		.
 */
function KalturaNotificationJobData(){
	this.userId = null;
	this.type = null;
	this.typeAsString = null;
	this.objectId = null;
	this.status = null;
	this.data = null;
	this.numberOfAttempts = null;
	this.notificationResult = null;
	this.objType = null;
}
KalturaNotificationJobData.inheritsFrom (KalturaJobData);


/**
 * @param	id	int		 (readOnly).
 * @param	name	string		.
 * @param	website	string		.
 * @param	notificationUrl	string		.
 * @param	appearInSearch	int		.
 * @param	createdAt	string		 (readOnly).
 * @param	adminName	string		.
 * @param	adminEmail	string		.
 * @param	description	string		.
 * @param	commercialUse	string		.
 * @param	landingPage	string		.
 * @param	userLandingPage	string		.
 * @param	contentCategories	string		.
 * @param	type	int		.
 * @param	phone	string		.
 * @param	describeYourself	string		.
 * @param	adultContent	bool		.
 * @param	defConversionProfileType	string		.
 * @param	notify	int		.
 * @param	status	int		 (readOnly).
 * @param	allowQuickEdit	int		.
 * @param	mergeEntryLists	int		.
 * @param	notificationsConfig	string		.
 * @param	maxUploadSize	int		.
 * @param	partnerPackage	int		 (readOnly).
 * @param	secret	string		 (readOnly).
 * @param	adminSecret	string		 (readOnly).
 * @param	cmsPassword	string		 (readOnly).
 * @param	allowMultiNotification	int		 (readOnly).
 */
function KalturaPartner(){
	this.id = null;
	this.name = null;
	this.website = null;
	this.notificationUrl = null;
	this.appearInSearch = null;
	this.createdAt = null;
	this.adminName = null;
	this.adminEmail = null;
	this.description = null;
	this.commercialUse = null;
	this.landingPage = null;
	this.userLandingPage = null;
	this.contentCategories = null;
	this.type = null;
	this.phone = null;
	this.describeYourself = null;
	this.adultContent = null;
	this.defConversionProfileType = null;
	this.notify = null;
	this.status = null;
	this.allowQuickEdit = null;
	this.mergeEntryLists = null;
	this.notificationsConfig = null;
	this.maxUploadSize = null;
	this.partnerPackage = null;
	this.secret = null;
	this.adminSecret = null;
	this.cmsPassword = null;
	this.allowMultiNotification = null;
}
KalturaPartner.inheritsFrom (KalturaObjectBase);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	nameLike	string		.
 * @param	nameMultiLikeOr	string		.
 * @param	nameMultiLikeAnd	string		.
 * @param	nameEqual	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	partnerNameDescriptionWebsiteAdminNameAdminEmailLike	string		.
 */
function KalturaPartnerFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.nameLike = null;
	this.nameMultiLikeOr = null;
	this.nameMultiLikeAnd = null;
	this.nameEqual = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.partnerNameDescriptionWebsiteAdminNameAdminEmailLike = null;
}
KalturaPartnerFilter.inheritsFrom (KalturaFilter);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaPartnerListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaPartnerListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	hostingGB	float		 (readOnly).
 * @param	Percent	float		 (readOnly).
 * @param	packageBW	int		 (readOnly).
 * @param	usageGB	int		 (readOnly).
 * @param	reachedLimitDate	int		 (readOnly).
 * @param	usageGraph	string		 (readOnly).
 */
function KalturaPartnerUsage(){
	this.hostingGB = null;
	this.Percent = null;
	this.packageBW = null;
	this.usageGB = null;
	this.reachedLimitDate = null;
	this.usageGraph = null;
}
KalturaPartnerUsage.inheritsFrom (KalturaObjectBase);


/**
 * @param	plays	int		Number of plays (readOnly).
 * @param	views	int		Number of views (readOnly).
 * @param	width	int		The width in pixels (readOnly).
 * @param	height	int		The height in pixels (readOnly).
 * @param	duration	int		The duration in seconds (readOnly).
 * @param	durationType	string		The duration type (short for 0-4 mins, medium for 4-20 mins, long for 20+ mins) (readOnly).
 */
function KalturaPlayableEntry(){
	this.plays = null;
	this.views = null;
	this.width = null;
	this.height = null;
	this.duration = null;
	this.durationType = null;
}
KalturaPlayableEntry.inheritsFrom (KalturaBaseEntry);


/**
 * @param	durationLessThan	int		.
 * @param	durationGreaterThan	int		.
 * @param	durationLessThanOrEqual	int		.
 * @param	durationGreaterThanOrEqual	int		.
 * @param	durationTypeMatchOr	string		.
 */
function KalturaPlayableEntryFilter(){
	this.durationLessThan = null;
	this.durationGreaterThan = null;
	this.durationLessThanOrEqual = null;
	this.durationGreaterThanOrEqual = null;
	this.durationTypeMatchOr = null;
}
KalturaPlayableEntryFilter.inheritsFrom (KalturaBaseEntryFilter);


/**
 * @param	playlistContent	string		Content of the playlist - 
 *	XML if the playlistType is dynamic 
 *	text if the playlistType is static 
 *	url if the playlistType is mRss .
 * @param	filters	array		.
 * @param	totalResults	int		.
 * @param	playlistType	int		Type of playlist  .
 * @param	plays	int		Number of plays (readOnly).
 * @param	views	int		Number of views (readOnly).
 * @param	duration	int		The duration in seconds (readOnly).
 */
function KalturaPlaylist(){
	this.playlistContent = null;
	this.filters = null;
	this.totalResults = null;
	this.playlistType = null;
	this.plays = null;
	this.views = null;
	this.duration = null;
}
KalturaPlaylist.inheritsFrom (KalturaBaseEntry);


/**
 */
function KalturaPlaylistFilter(){
}
KalturaPlaylistFilter.inheritsFrom (KalturaBaseEntryFilter);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaPlaylistListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaPlaylistListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	srcFileSyncLocalPath	string		.
 * @param	flavorAssetId	string		.
 * @param	createThumb	bool		Indicates if a thumbnail should be created.
 * @param	thumbPath	string		The path of the created thumbnail.
 * @param	thumbOffset	int		The position of the thumbnail in the media file.
 * @param	thumbHeight	int		The height of the movie, will be used to comapare if this thumbnail is the best we can have.
 * @param	thumbBitrate	int		The bit rate of the movie, will be used to comapare if this thumbnail is the best we can have.
 * @param	flavorParamsOutputId	int		.
 */
function KalturaPostConvertJobData(){
	this.srcFileSyncLocalPath = null;
	this.flavorAssetId = null;
	this.createThumb = null;
	this.thumbPath = null;
	this.thumbOffset = null;
	this.thumbHeight = null;
	this.thumbBitrate = null;
	this.flavorParamsOutputId = null;
}
KalturaPostConvertJobData.inheritsFrom (KalturaJobData);


/**
 * @param	previewLength	int		The preview restriction length .
 */
function KalturaPreviewRestriction(){
	this.previewLength = null;
}
KalturaPreviewRestriction.inheritsFrom (KalturaSessionRestriction);


/**
 * @param	srcFileUrl	string		.
 * @param	destFileLocalPath	string		.
 */
function KalturaPullJobData(){
	this.srcFileUrl = null;
	this.destFileLocalPath = null;
}
KalturaPullJobData.inheritsFrom (KalturaJobData);


/**
 * @param	srcFileUrl	string		.
 * @param	destFileUrl	string		Should be set by the API.
 */
function KalturaRemoteConvertJobData(){
	this.srcFileUrl = null;
	this.destFileUrl = null;
}
KalturaRemoteConvertJobData.inheritsFrom (KalturaConvartableJobData);


/**
 * @param	id	string		.
 * @param	data	string		.
 */
function KalturaReportGraph(){
	this.id = null;
	this.data = null;
}
KalturaReportGraph.inheritsFrom (KalturaObjectBase);


/**
 * @param	fromDate	int		.
 * @param	toDate	int		.
 * @param	keywords	string		.
 * @param	searchInTags	bool		.
 * @param	searchInAdminTags	bool		.
 * @param	categories	string		.
 */
function KalturaReportInputFilter(){
	this.fromDate = null;
	this.toDate = null;
	this.keywords = null;
	this.searchInTags = null;
	this.searchInAdminTags = null;
	this.categories = null;
}
KalturaReportInputFilter.inheritsFrom (KalturaObjectBase);


/**
 * @param	header	string		 (readOnly).
 * @param	data	string		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaReportTable(){
	this.header = null;
	this.data = null;
	this.totalCount = null;
}
KalturaReportTable.inheritsFrom (KalturaObjectBase);


/**
 * @param	header	string		.
 * @param	data	string		.
 */
function KalturaReportTotal(){
	this.header = null;
	this.data = null;
}
KalturaReportTotal.inheritsFrom (KalturaObjectBase);


/**
 * @param	keyWords	string		.
 * @param	searchSource	int		.
 * @param	mediaType	int		.
 * @param	extraData	string		Use this field to pass dynamic data for searching
 *	For example - if you set this field to "mymovies_$partner_id"
 *	The $partner_id will be automatically replcaed with your real partner Id.
 * @param	authData	string		.
 */
function KalturaSearch(){
	this.keyWords = null;
	this.searchSource = null;
	this.mediaType = null;
	this.extraData = null;
	this.authData = null;
}
KalturaSearch.inheritsFrom (KalturaObjectBase);


/**
 * @param	authData	string		The authentication data that further should be used for search.
 * @param	loginUrl	string		Login URL when user need to sign-in and authorize the search.
 * @param	message	string		Information when there was an error.
 */
function KalturaSearchAuthData(){
	this.authData = null;
	this.loginUrl = null;
	this.message = null;
}
KalturaSearchAuthData.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	string		.
 * @param	title	string		.
 * @param	thumbUrl	string		.
 * @param	description	string		.
 * @param	tags	string		.
 * @param	url	string		.
 * @param	sourceLink	string		.
 * @param	credit	string		.
 * @param	licenseType	int		.
 * @param	flashPlaybackType	string		.
 */
function KalturaSearchResult(){
	this.id = null;
	this.title = null;
	this.thumbUrl = null;
	this.description = null;
	this.tags = null;
	this.url = null;
	this.sourceLink = null;
	this.credit = null;
	this.licenseType = null;
	this.flashPlaybackType = null;
}
KalturaSearchResult.inheritsFrom (KalturaSearch);


/**
 * @param	objects	array		 (readOnly).
 * @param	needMediaInfo	bool		 (readOnly).
 */
function KalturaSearchResultResponse(){
	this.objects = null;
	this.needMediaInfo = null;
}
KalturaSearchResultResponse.inheritsFrom (KalturaObjectBase);


/**
 */
function KalturaSessionRestriction(){
}
KalturaSessionRestriction.inheritsFrom (KalturaBaseRestriction);


/**
 * @param	siteRestrictionType	int		The site restriction type (allow or deny).
 * @param	siteList	string		Comma separated list of sites (domains) to allow or deny.
 */
function KalturaSiteRestriction(){
	this.siteRestrictionType = null;
	this.siteList = null;
}
KalturaSiteRestriction.inheritsFrom (KalturaBaseRestriction);


/**
 * @param	partnerId	int		 (readOnly).
 * @param	ks	string		 (readOnly).
 * @param	userId	string		 (readOnly).
 */
function KalturaStartWidgetSessionResponse(){
	this.partnerId = null;
	this.ks = null;
	this.userId = null;
}
KalturaStartWidgetSessionResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	clientVer	string		.
 * @param	eventType	int		.
 * @param	eventTimestamp	float		the client's timestamp of this event.
 * @param	sessionId	string		a unique string generated by the client that will represent the client-side session: the primary component will pass it on to other components that sprout from it.
 * @param	partnerId	int		.
 * @param	entryId	string		.
 * @param	uniqueViewer	string		the UV cookie - creates in the operational system and should be passed on ofr every event .
 * @param	widgetId	string		.
 * @param	uiconfId	int		.
 * @param	userId	string		the partner's user id .
 * @param	currentPoint	int		the timestamp along the video when the event happend .
 * @param	duration	int		the duration of the video in milliseconds - will make it much faster than quering the db for each entry .
 * @param	userIp	string		will be retrieved from the request of the user  (readOnly).
 * @param	processDuration	int		the time in milliseconds the event took.
 * @param	controlId	string		the id of the GUI control - will be used in the future to better understand what the user clicked.
 * @param	seek	bool		true if the user ever used seek in this session .
 * @param	newPoint	int		timestamp of the new point on the timeline of the video after the user seeks .
 * @param	referrer	string		the referrer of the client.
 * @param	isFirstInSession	bool		will indicate if the event is thrown for the first video in the session.
 */
function KalturaStatsEvent(){
	this.clientVer = null;
	this.eventType = null;
	this.eventTimestamp = null;
	this.sessionId = null;
	this.partnerId = null;
	this.entryId = null;
	this.uniqueViewer = null;
	this.widgetId = null;
	this.uiconfId = null;
	this.userId = null;
	this.currentPoint = null;
	this.duration = null;
	this.userIp = null;
	this.processDuration = null;
	this.controlId = null;
	this.seek = null;
	this.newPoint = null;
	this.referrer = null;
	this.isFirstInSession = null;
}
KalturaStatsEvent.inheritsFrom (KalturaObjectBase);


/**
 * @param	clientVer	string		.
 * @param	kmcEventActionPath	string		.
 * @param	kmcEventType	int		.
 * @param	eventTimestamp	float		the client's timestamp of this event.
 * @param	sessionId	string		a unique string generated by the client that will represent the client-side session: the primary component will pass it on to other components that sprout from it.
 * @param	partnerId	int		.
 * @param	entryId	string		.
 * @param	widgetId	string		.
 * @param	uiconfId	int		.
 * @param	userId	string		the partner's user id .
 * @param	userIp	string		will be retrieved from the request of the user  (readOnly).
 */
function KalturaStatsKmcEvent(){
	this.clientVer = null;
	this.kmcEventActionPath = null;
	this.kmcEventType = null;
	this.eventTimestamp = null;
	this.sessionId = null;
	this.partnerId = null;
	this.entryId = null;
	this.widgetId = null;
	this.uiconfId = null;
	this.userId = null;
	this.userIp = null;
}
KalturaStatsKmcEvent.inheritsFrom (KalturaObjectBase);


/**
 * @param	totalEntryCount	int		the total count of entries that should appear in the feed without flavor filtering.
 * @param	actualEntryCount	int		count of entries that will appear in the feed (including all relevant filters).
 * @param	requireTranscodingCount	int		count of entries that requires transcoding in order to be included in feed.
 */
function KalturaSyndicationFeedEntryCount(){
	this.totalEntryCount = null;
	this.actualEntryCount = null;
	this.requireTranscodingCount = null;
}
KalturaSyndicationFeedEntryCount.inheritsFrom (KalturaObjectBase);


/**
 * @param	host	string		.
 * @param	cdnHost	string		.
 * @param	maxBulkSize	int		.
 * @param	partnerPackage	string		.
 */
function KalturaSystemPartnerConfiguration(){
	this.host = null;
	this.cdnHost = null;
	this.maxBulkSize = null;
	this.partnerPackage = null;
}
KalturaSystemPartnerConfiguration.inheritsFrom (KalturaObjectBase);


/**
 * @param	fromDate	int		Date range from.
 * @param	toDate	int		Date range to.
 */
function KalturaSystemPartnerUsageFilter(){
	this.fromDate = null;
	this.toDate = null;
}
KalturaSystemPartnerUsageFilter.inheritsFrom (KalturaFilter);


/**
 * @param	partnerId	int		Partner ID.
 * @param	partnerName	string		Partner name.
 * @param	partnerStatus	int		Partner status.
 * @param	partnerPackage	string		Partner package.
 * @param	partnerCreatedAt	int		Partner creation date (Unix timestamp).
 * @param	views	int		Number of player loads in the specific date range.
 * @param	plays	int		Number of plays in the specific date range.
 * @param	entriesCount	int		Number of new entries created during specific date range.
 * @param	totalEntriesCount	int		Total number of entries.
 * @param	videoEntriesCount	int		Number of new video entries created during specific date range.
 * @param	imageEntriesCount	int		Number of new image entries created during specific date range.
 * @param	audioEntriesCount	int		Number of new audio entries created during specific date range.
 * @param	mixEntriesCount	int		Number of new mix entries created during specific date range.
 * @param	bandwidth	float		The total bandwidth usage during the given date range (in MB).
 * @param	totalStorage	float		The total storage consumption (in MB).
 * @param	storage	float		The change in storage consumption (new uploads) during the given date range (in MB).
 */
function KalturaSystemPartnerUsageItem(){
	this.partnerId = null;
	this.partnerName = null;
	this.partnerStatus = null;
	this.partnerPackage = null;
	this.partnerCreatedAt = null;
	this.views = null;
	this.plays = null;
	this.entriesCount = null;
	this.totalEntriesCount = null;
	this.videoEntriesCount = null;
	this.imageEntriesCount = null;
	this.audioEntriesCount = null;
	this.mixEntriesCount = null;
	this.bandwidth = null;
	this.totalStorage = null;
	this.storage = null;
}
KalturaSystemPartnerUsageItem.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		.
 * @param	totalCount	int		.
 */
function KalturaSystemPartnerUsageListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaSystemPartnerUsageListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		 (readOnly).
 * @param	email	string		.
 * @param	firstName	string		.
 * @param	lastName	string		.
 * @param	password	string		.
 * @param	createdBy	int		 (readOnly).
 * @param	status	int		.
 * @param	statusUpdatedAt	int		 (readOnly).
 * @param	createdAt	int		 (readOnly).
 */
function KalturaSystemUser(){
	this.id = null;
	this.email = null;
	this.firstName = null;
	this.lastName = null;
	this.password = null;
	this.createdBy = null;
	this.status = null;
	this.statusUpdatedAt = null;
	this.createdAt = null;
}
KalturaSystemUser.inheritsFrom (KalturaObjectBase);


/**
 */
function KalturaSystemUserFilter(){
}
KalturaSystemUserFilter.inheritsFrom (KalturaFilter);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaSystemUserListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaSystemUserListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	category	string		 (readOnly).
 */
function KalturaTubeMogulSyndicationFeed(){
	this.category = null;
}
KalturaTubeMogulSyndicationFeed.inheritsFrom (KalturaBaseSyndicationFeed);


/**
 */
function KalturaTubeMogulSyndicationFeedFilter(){
}
KalturaTubeMogulSyndicationFeedFilter.inheritsFrom (KalturaBaseSyndicationFeedFilter);


/**
 * @param	id	int		 (readOnly).
 * @param	name	string		Name of the uiConf, this is not a primary key.
 * @param	description	string		.
 * @param	partnerId	int		 (readOnly).
 * @param	objType	int		.
 * @param	objTypeAsString	string		 (readOnly).
 * @param	width	int		.
 * @param	height	int		.
 * @param	htmlParams	string		.
 * @param	swfUrl	string		.
 * @param	confFilePath	string		 (readOnly).
 * @param	confFile	string		.
 * @param	confFileFeatures	string		.
 * @param	confVars	string		.
 * @param	useCdn	bool		.
 * @param	tags	string		.
 * @param	swfUrlVersion	string		.
 * @param	createdAt	int		Entry creation date as Unix timestamp (In seconds) (readOnly).
 * @param	updatedAt	int		Entry creation date as Unix timestamp (In seconds) (readOnly).
 * @param	creationMode	int		.
 */
function KalturaUiConf(){
	this.id = null;
	this.name = null;
	this.description = null;
	this.partnerId = null;
	this.objType = null;
	this.objTypeAsString = null;
	this.width = null;
	this.height = null;
	this.htmlParams = null;
	this.swfUrl = null;
	this.confFilePath = null;
	this.confFile = null;
	this.confFileFeatures = null;
	this.confVars = null;
	this.useCdn = null;
	this.tags = null;
	this.swfUrlVersion = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.creationMode = null;
}
KalturaUiConf.inheritsFrom (KalturaObjectBase);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	nameLike	string		.
 * @param	objTypeEqual	int		.
 * @param	tagsMultiLikeOr	string		.
 * @param	tagsMultiLikeAnd	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 */
function KalturaUiConfFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.nameLike = null;
	this.objTypeEqual = null;
	this.tagsMultiLikeOr = null;
	this.tagsMultiLikeAnd = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
}
KalturaUiConfFilter.inheritsFrom (KalturaFilter);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaUiConfListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaUiConfListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	uploadTokenId	string		.
 * @param	fileSize	int		.
 * @param	errorCode	int		.
 * @param	errorDescription	string		.
 */
function KalturaUploadResponse(){
	this.uploadTokenId = null;
	this.fileSize = null;
	this.errorCode = null;
	this.errorDescription = null;
}
KalturaUploadResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	string		.
 * @param	partnerId	int		 (readOnly).
 * @param	screenName	string		.
 * @param	fullName	string		.
 * @param	email	string		.
 * @param	dateOfBirth	int		.
 * @param	country	string		.
 * @param	state	string		.
 * @param	city	string		.
 * @param	zip	string		.
 * @param	thumbnailUrl	string		.
 * @param	description	string		.
 * @param	tags	string		.
 * @param	adminTags	string		Admin tags can be updated only by using an admin session.
 * @param	gender	int		.
 * @param	status	int		.
 * @param	createdAt	int		Creation date as Unix timestamp (In seconds) (readOnly).
 * @param	updatedAt	int		Last update date as Unix timestamp (In seconds) (readOnly).
 * @param	partnerData	string		Can be used to store various partner related data as a string .
 * @param	indexedPartnerDataInt	int		.
 * @param	indexedPartnerDataString	string		.
 * @param	storageSize	int		 (readOnly).
 */
function KalturaUser(){
	this.id = null;
	this.partnerId = null;
	this.screenName = null;
	this.fullName = null;
	this.email = null;
	this.dateOfBirth = null;
	this.country = null;
	this.state = null;
	this.city = null;
	this.zip = null;
	this.thumbnailUrl = null;
	this.description = null;
	this.tags = null;
	this.adminTags = null;
	this.gender = null;
	this.status = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.partnerData = null;
	this.indexedPartnerDataInt = null;
	this.indexedPartnerDataString = null;
	this.storageSize = null;
}
KalturaUser.inheritsFrom (KalturaObjectBase);


/**
 * @param	idEqual	string		.
 * @param	idIn	string		.
 * @param	partnerIdEqual	int		.
 * @param	screenNameLike	string		.
 * @param	screenNameStartsWith	string		.
 * @param	emailLike	string		.
 * @param	emailStartsWith	string		.
 * @param	tagsMultiLikeOr	string		.
 * @param	tagsMultiLikeAnd	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 */
function KalturaUserFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.partnerIdEqual = null;
	this.screenNameLike = null;
	this.screenNameStartsWith = null;
	this.emailLike = null;
	this.emailStartsWith = null;
	this.tagsMultiLikeOr = null;
	this.tagsMultiLikeAnd = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
}
KalturaUserFilter.inheritsFrom (KalturaFilter);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaUserListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaUserListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	string		 (readOnly).
 * @param	sourceWidgetId	string		.
 * @param	rootWidgetId	string		 (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	entryId	string		.
 * @param	uiConfId	int		.
 * @param	securityType	int		.
 * @param	securityPolicy	int		.
 * @param	createdAt	int		 (readOnly).
 * @param	updatedAt	int		 (readOnly).
 * @param	partnerData	string		Can be used to store various partner related data as a string .
 * @param	widgetHTML	string		 (readOnly).
 */
function KalturaWidget(){
	this.id = null;
	this.sourceWidgetId = null;
	this.rootWidgetId = null;
	this.partnerId = null;
	this.entryId = null;
	this.uiConfId = null;
	this.securityType = null;
	this.securityPolicy = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.partnerData = null;
	this.widgetHTML = null;
}
KalturaWidget.inheritsFrom (KalturaObjectBase);


/**
 * @param	idEqual	string		.
 * @param	idIn	string		.
 * @param	sourceWidgetIdEqual	string		.
 * @param	rootWidgetIdEqual	string		.
 * @param	partnerIdEqual	int		.
 * @param	entryIdEqual	string		.
 * @param	uiConfIdEqual	int		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 * @param	partnerDataLike	string		.
 */
function KalturaWidgetFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.sourceWidgetIdEqual = null;
	this.rootWidgetIdEqual = null;
	this.partnerIdEqual = null;
	this.entryIdEqual = null;
	this.uiConfIdEqual = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
	this.partnerDataLike = null;
}
KalturaWidgetFilter.inheritsFrom (KalturaFilter);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaWidgetListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaWidgetListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	category	string		 (readOnly).
 * @param	adultContent	string		.
 * @param	feedDescription	string		feed description.
 * @param	feedLandingPage	string		feed landing page (i.e publisher website).
 */
function KalturaYahooSyndicationFeed(){
	this.category = null;
	this.adultContent = null;
	this.feedDescription = null;
	this.feedLandingPage = null;
}
KalturaYahooSyndicationFeed.inheritsFrom (KalturaBaseSyndicationFeed);


/**
 */
function KalturaYahooSyndicationFeedFilter(){
}
KalturaYahooSyndicationFeedFilter.inheritsFrom (KalturaBaseSyndicationFeedFilter);


