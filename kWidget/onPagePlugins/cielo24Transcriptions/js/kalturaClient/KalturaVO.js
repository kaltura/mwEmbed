// ===================================================================================================
//                           _  __     _ _
//                          | |/ /__ _| | |_ _  _ _ _ __ _
//                          | ' </ _` | |  _| || | '_/ _` |
//                          |_|\_\__,_|_|\__|\_,_|_| \__,_|
//
// This file is part of the Kaltura Collaborative Media Suite which allows users
// to do with audio, video, and animation what Wiki platfroms allow them to do with
// text.
//
// Copyright (C) 2006-2011  Kaltura Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//
// @ignore
// ===================================================================================================
/**
 */
function KalturaBaseRestriction(){
}
KalturaBaseRestriction.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		The id of the Access Control Profile
 *		  (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	name	string		The name of the Access Control Profile
 *		 .
 * @param	systemName	string		System name of the Access Control Profile
 *		 .
 * @param	description	string		The description of the Access Control Profile
 *		 .
 * @param	createdAt	int		Creation date as Unix timestamp (In seconds) 
 *		  (readOnly).
 * @param	isDefault	int		True if this Conversion Profile is the default
 *		 .
 * @param	restrictions	array		Array of Access Control Restrictions
 *		 .
 * @param	containsUnsuportedRestrictions	bool		Indicates that the access control profile is new and should be handled using KalturaAccessControlProfile object and accessControlProfile service
 *		  (readOnly).
 */
function KalturaAccessControl(){
	this.id = null;
	this.partnerId = null;
	this.name = null;
	this.systemName = null;
	this.description = null;
	this.createdAt = null;
	this.isDefault = null;
	this.restrictions = null;
	this.containsUnsuportedRestrictions = null;
}
KalturaAccessControl.inheritsFrom (KalturaObjectBase);


/**
 * @param	type	string		The type of the condition context
 *		 .
 */
function KalturaContextTypeHolder(){
	this.type = null;
}
KalturaContextTypeHolder.inheritsFrom (KalturaObjectBase);


/**
 */
function KalturaAccessControlContextTypeHolder(){
}
KalturaAccessControlContextTypeHolder.inheritsFrom (KalturaContextTypeHolder);


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
 * @param	type	string		The type of the action
 *		  (readOnly).
 */
function KalturaRuleAction(){
	this.type = null;
}
KalturaRuleAction.inheritsFrom (KalturaObjectBase);


/**
 * @param	type	string		The type of the access control condition
 *		  (readOnly).
 * @param	description	string		.
 * @param	not	bool		.
 */
function KalturaCondition(){
	this.type = null;
	this.description = null;
	this.not = null;
}
KalturaCondition.inheritsFrom (KalturaObjectBase);


/**
 * @param	message	string		Message to be thrown to the player in case the rule is fulfilled
 *		 .
 * @param	actions	array		Actions to be performed by the player in case the rule is fulfilled
 *		 .
 * @param	conditions	array		Conditions to validate the rule
 *		 .
 * @param	contexts	array		Indicates what contexts should be tested by this rule 
 *		 .
 * @param	stopProcessing	bool		Indicates that this rule is enough and no need to continue checking the rest of the rules 
 *		 .
 */
function KalturaRule(){
	this.message = null;
	this.actions = null;
	this.conditions = null;
	this.contexts = null;
	this.stopProcessing = null;
}
KalturaRule.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		The id of the Access Control Profile
 *		  (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	name	string		The name of the Access Control Profile
 *		 .
 * @param	systemName	string		System name of the Access Control Profile
 *		 .
 * @param	description	string		The description of the Access Control Profile
 *		 .
 * @param	createdAt	int		Creation time as Unix timestamp (In seconds) 
 *		  (readOnly).
 * @param	updatedAt	int		Update time as Unix timestamp (In seconds) 
 *		  (readOnly).
 * @param	isDefault	int		True if this access control profile is the partner default
 *		 .
 * @param	rules	array		Array of access control rules
 *		 .
 */
function KalturaAccessControlProfile(){
	this.id = null;
	this.partnerId = null;
	this.name = null;
	this.systemName = null;
	this.description = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.isDefault = null;
	this.rules = null;
}
KalturaAccessControlProfile.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaAccessControlProfileListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaAccessControlProfileListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	key	string		.
 * @param	value	string		.
 */
function KalturaKeyValue(){
	this.key = null;
	this.value = null;
}
KalturaKeyValue.inheritsFrom (KalturaObjectBase);


/**
 * @param	referrer	string		URL to be used to test domain conditions.
 *		 .
 * @param	ip	string		IP to be used to test geographic location conditions.
 *		 .
 * @param	ks	string		Kaltura session to be used to test session and user conditions.
 *		 .
 * @param	userAgent	string		Browser or client application to be used to test agent conditions.
 *		 .
 * @param	time	int		Unix timestamp (In seconds) to be used to test entry scheduling, keep null to use now.
 *		 .
 * @param	contexts	array		Indicates what contexts should be tested. No contexts means any context.
 *		 .
 * @param	hashes	array		Array of hashes to pass to the access control profile scope
 *		 .
 */
function KalturaAccessControlScope(){
	this.referrer = null;
	this.ip = null;
	this.ks = null;
	this.userAgent = null;
	this.time = null;
	this.contexts = null;
	this.hashes = null;
}
KalturaAccessControlScope.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	string		 (readOnly).
 * @param	cuePointType	string		 (readOnly).
 * @param	status	int		 (readOnly).
 * @param	entryId	string		 (insertOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	createdAt	int		 (readOnly).
 * @param	updatedAt	int		 (readOnly).
 * @param	tags	string		.
 * @param	startTime	int		Start time in milliseconds
 *		 .
 * @param	userId	string		 (readOnly).
 * @param	partnerData	string		.
 * @param	partnerSortValue	int		.
 * @param	forceStop	int		.
 * @param	thumbOffset	int		.
 * @param	systemName	string		.
 */
function KalturaCuePoint(){
	this.id = null;
	this.cuePointType = null;
	this.status = null;
	this.entryId = null;
	this.partnerId = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.tags = null;
	this.startTime = null;
	this.userId = null;
	this.partnerData = null;
	this.partnerSortValue = null;
	this.forceStop = null;
	this.thumbOffset = null;
	this.systemName = null;
}
KalturaCuePoint.inheritsFrom (KalturaObjectBase);


/**
 * @param	parentId	string		 (insertOnly).
 * @param	text	string		.
 * @param	endTime	int		End time in milliseconds
 *		 .
 * @param	duration	int		Duration in milliseconds
 *		  (readOnly).
 * @param	depth	int		Depth in the tree
 *		  (readOnly).
 * @param	childrenCount	int		Number of all descendants
 *		  (readOnly).
 * @param	directChildrenCount	int		Number of children, first generation only.
 *		  (readOnly).
 */
function KalturaAnnotation(){
	this.parentId = null;
	this.text = null;
	this.endTime = null;
	this.duration = null;
	this.depth = null;
	this.childrenCount = null;
	this.directChildrenCount = null;
}
KalturaAnnotation.inheritsFrom (KalturaCuePoint);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaAnnotationListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaAnnotationListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	string		The ID of the Flavor Asset
 *		  (readOnly).
 * @param	entryId	string		The entry ID of the Flavor Asset
 *		  (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	version	int		The version of the Flavor Asset
 *		  (readOnly).
 * @param	size	int		The size (in KBytes) of the Flavor Asset
 *		  (readOnly).
 * @param	tags	string		Tags used to identify the Flavor Asset in various scenarios
 *		 .
 * @param	fileExt	string		The file extension
 *		  (insertOnly).
 * @param	createdAt	int		 (readOnly).
 * @param	updatedAt	int		 (readOnly).
 * @param	deletedAt	int		 (readOnly).
 * @param	description	string		System description, error message, warnings and failure cause.
 *		  (readOnly).
 * @param	partnerData	string		Partner private data
 *		 .
 * @param	partnerDescription	string		Partner friendly description
 *		 .
 * @param	actualSourceAssetParamsIds	string		Comma separated list of source flavor params ids
 *		 .
 */
function KalturaAsset(){
	this.id = null;
	this.entryId = null;
	this.partnerId = null;
	this.version = null;
	this.size = null;
	this.tags = null;
	this.fileExt = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.deletedAt = null;
	this.description = null;
	this.partnerData = null;
	this.partnerDescription = null;
	this.actualSourceAssetParamsIds = null;
}
KalturaAsset.inheritsFrom (KalturaObjectBase);


/**
 */
function KalturaAssetDistributionCondition(){
}
KalturaAssetDistributionCondition.inheritsFrom (KalturaObjectBase);


/**
 * @param	validationError	string		The validation error description that will be set on the "data" property on KalturaDistributionValidationErrorMissingAsset if rule was not fulfilled
 *		 .
 * @param	assetDistributionConditions	array		An array of asset distribution conditions
 *		 .
 */
function KalturaAssetDistributionRule(){
	this.validationError = null;
	this.assetDistributionConditions = null;
}
KalturaAssetDistributionRule.inheritsFrom (KalturaObjectBase);


/**
 * @param	value	string		.
 */
function KalturaString(){
	this.value = null;
}
KalturaString.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		The id of the Flavor Params
 *		  (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	name	string		The name of the Flavor Params
 *		 .
 * @param	systemName	string		System name of the Flavor Params
 *		 .
 * @param	description	string		The description of the Flavor Params
 *		 .
 * @param	createdAt	int		Creation date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	isSystemDefault	int		True if those Flavor Params are part of system defaults
 *		  (readOnly).
 * @param	tags	string		The Flavor Params tags are used to identify the flavor for different usage (e.g. web, hd, mobile)
 *		 .
 * @param	requiredPermissions	array		Array of partner permisison names that required for using this asset params
 *		 .
 * @param	sourceRemoteStorageProfileId	int		Id of remote storage profile that used to get the source, zero indicates Kaltura data center
 *		 .
 * @param	remoteStorageProfileIds	int		Comma seperated ids of remote storage profiles that the flavor distributed to, the distribution done by the conversion engine
 *		 .
 * @param	mediaParserType	string		Media parser type to be used for post-conversion validation
 *		 .
 * @param	sourceAssetParamsIds	string		Comma seperated ids of source flavor params this flavor is created from
 *		 .
 */
function KalturaAssetParams(){
	this.id = null;
	this.partnerId = null;
	this.name = null;
	this.systemName = null;
	this.description = null;
	this.createdAt = null;
	this.isSystemDefault = null;
	this.tags = null;
	this.requiredPermissions = null;
	this.sourceRemoteStorageProfileId = null;
	this.remoteStorageProfileIds = null;
	this.mediaParserType = null;
	this.sourceAssetParamsIds = null;
}
KalturaAssetParams.inheritsFrom (KalturaObjectBase);


/**
 */
function KalturaResource(){
}
KalturaResource.inheritsFrom (KalturaObjectBase);


/**
 */
function KalturaContentResource(){
}
KalturaContentResource.inheritsFrom (KalturaResource);


/**
 * @param	resource	KalturaContentResource		The content resource to associate with asset params
 *		 .
 * @param	assetParamsId	int		The asset params to associate with the reaource
 *		 .
 */
function KalturaAssetParamsResourceContainer(){
	this.resource = null;
	this.assetParamsId = null;
}
KalturaAssetParamsResourceContainer.inheritsFrom (KalturaResource);


/**
 * @param	filename	string		The filename of the attachment asset content
 *		 .
 * @param	title	string		Attachment asset title
 *		 .
 * @param	format	string		The attachment format
 *		 .
 * @param	status	int		The status of the asset
 *		  (readOnly).
 */
function KalturaAttachmentAsset(){
	this.filename = null;
	this.title = null;
	this.format = null;
	this.status = null;
}
KalturaAttachmentAsset.inheritsFrom (KalturaAsset);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaAttachmentAssetListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaAttachmentAssetListResponse.inheritsFrom (KalturaObjectBase);


/**
 */
function KalturaAuditTrailInfo(){
}
KalturaAuditTrailInfo.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		 (readOnly).
 * @param	createdAt	int		 (readOnly).
 * @param	parsedAt	int		Indicates when the data was parsed
 *		  (readOnly).
 * @param	status	int		 (readOnly).
 * @param	auditObjectType	string		.
 * @param	objectId	string		.
 * @param	relatedObjectId	string		.
 * @param	relatedObjectType	string		.
 * @param	entryId	string		.
 * @param	masterPartnerId	int		 (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	requestId	string		 (readOnly).
 * @param	userId	string		.
 * @param	action	string		.
 * @param	data	KalturaAuditTrailInfo		.
 * @param	ks	string		 (readOnly).
 * @param	context	int		 (readOnly).
 * @param	entryPoint	string		The API service and action that called and caused this audit
 *		  (readOnly).
 * @param	serverName	string		 (readOnly).
 * @param	ipAddress	string		 (readOnly).
 * @param	userAgent	string		 (readOnly).
 * @param	clientTag	string		.
 * @param	description	string		.
 * @param	errorDescription	string		 (readOnly).
 */
function KalturaAuditTrail(){
	this.id = null;
	this.createdAt = null;
	this.parsedAt = null;
	this.status = null;
	this.auditObjectType = null;
	this.objectId = null;
	this.relatedObjectId = null;
	this.relatedObjectType = null;
	this.entryId = null;
	this.masterPartnerId = null;
	this.partnerId = null;
	this.requestId = null;
	this.userId = null;
	this.action = null;
	this.data = null;
	this.ks = null;
	this.context = null;
	this.entryPoint = null;
	this.serverName = null;
	this.ipAddress = null;
	this.userAgent = null;
	this.clientTag = null;
	this.description = null;
	this.errorDescription = null;
}
KalturaAuditTrail.inheritsFrom (KalturaObjectBase);


/**
 * @param	descriptor	string		.
 * @param	oldValue	string		.
 * @param	newValue	string		.
 */
function KalturaAuditTrailChangeItem(){
	this.descriptor = null;
	this.oldValue = null;
	this.newValue = null;
}
KalturaAuditTrailChangeItem.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaAuditTrailListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaAuditTrailListResponse.inheritsFrom (KalturaObjectBase);


/**
 */
function KalturaOperationAttributes(){
}
KalturaOperationAttributes.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	string		Auto generated 10 characters alphanumeric string
 *		  (readOnly).
 * @param	name	string		Entry name (Min 1 chars)
 *		 .
 * @param	description	string		Entry description
 *		 .
 * @param	partnerId	int		 (readOnly).
 * @param	userId	string		The ID of the user who is the owner of this entry 
 *		 .
 * @param	creatorId	string		The ID of the user who created this entry 
 *		  (insertOnly).
 * @param	tags	string		Entry tags
 *		 .
 * @param	adminTags	string		Entry admin tags can be updated only by administrators
 *		 .
 * @param	categories	string		Categories with no entitlement that this entry belongs to.
 *		 .
 * @param	categoriesIds	string		Categories Ids of categories with no entitlement that this entry belongs to
 *		 .
 * @param	status	string		 (readOnly).
 * @param	moderationStatus	int		Entry moderation status
 *		  (readOnly).
 * @param	moderationCount	int		Number of moderation requests waiting for this entry
 *		  (readOnly).
 * @param	type	string		The type of the entry, this is auto filled by the derived entry object
 *		 .
 * @param	createdAt	int		Entry creation date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	updatedAt	int		Entry update date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	rank	float		The calculated average rank. rank = totalRank / votes
 *		  (readOnly).
 * @param	totalRank	int		The sum of all rank values submitted to the baseEntry.anonymousRank action
 *		  (readOnly).
 * @param	votes	int		A count of all requests made to the baseEntry.anonymousRank action
 *		  (readOnly).
 * @param	groupId	int		.
 * @param	partnerData	string		Can be used to store various partner related data as a string 
 *		 .
 * @param	downloadUrl	string		Download URL for the entry
 *		  (readOnly).
 * @param	searchText	string		Indexed search text for full text search
 *		  (readOnly).
 * @param	licenseType	int		License type used for this entry
 *		 .
 * @param	version	int		Version of the entry data
 *		  (readOnly).
 * @param	thumbnailUrl	string		Thumbnail URL
 *		  (insertOnly).
 * @param	accessControlId	int		The Access Control ID assigned to this entry (null when not set, send -1 to remove)  
 *		 .
 * @param	startDate	int		Entry scheduling start date (null when not set, send -1 to remove)
 *		 .
 * @param	endDate	int		Entry scheduling end date (null when not set, send -1 to remove)
 *		 .
 * @param	referenceId	string		Entry external reference id
 *		 .
 * @param	replacingEntryId	string		ID of temporary entry that will replace this entry when it's approved and ready for replacement
 *		  (readOnly).
 * @param	replacedEntryId	string		ID of the entry that will be replaced when the replacement approved and this entry is ready
 *		  (readOnly).
 * @param	replacementStatus	string		Status of the replacement readiness and approval
 *		  (readOnly).
 * @param	partnerSortValue	int		Can be used to store various partner related data as a numeric value
 *		 .
 * @param	conversionProfileId	int		Override the default ingestion profile  
 *		 .
 * @param	redirectEntryId	string		IF not empty, points to an entry ID the should replace this current entry's id. 
 *		 .
 * @param	rootEntryId	string		ID of source root entry, used for clipped, skipped and cropped entries that created from another entry
 *		  (readOnly).
 * @param	operationAttributes	array		clipping, skipping and cropping attributes that used to create this entry  
 *		 .
 * @param	entitledUsersEdit	string		list of user ids that are entitled to edit the entry (no server enforcement) The difference between entitledUsersEdit and entitledUsersPublish is applicative only
 *		 .
 * @param	entitledUsersPublish	string		list of user ids that are entitled to publish the entry (no server enforcement) The difference between entitledUsersEdit and entitledUsersPublish is applicative only
 *		 .
 */
function KalturaBaseEntry(){
	this.id = null;
	this.name = null;
	this.description = null;
	this.partnerId = null;
	this.userId = null;
	this.creatorId = null;
	this.tags = null;
	this.adminTags = null;
	this.categories = null;
	this.categoriesIds = null;
	this.status = null;
	this.moderationStatus = null;
	this.moderationCount = null;
	this.type = null;
	this.createdAt = null;
	this.updatedAt = null;
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
	this.referenceId = null;
	this.replacingEntryId = null;
	this.replacedEntryId = null;
	this.replacementStatus = null;
	this.partnerSortValue = null;
	this.conversionProfileId = null;
	this.redirectEntryId = null;
	this.rootEntryId = null;
	this.operationAttributes = null;
	this.entitledUsersEdit = null;
	this.entitledUsersPublish = null;
}
KalturaBaseEntry.inheritsFrom (KalturaObjectBase);


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
 * @param	id	string		 (readOnly).
 * @param	feedUrl	string		 (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	playlistId	string		link a playlist that will set what content the feed will include
 *		 if empty, all content will be included in feed
 *		 .
 * @param	name	string		feed name
 *		 .
 * @param	status	int		feed status
 *		  (readOnly).
 * @param	type	int		feed type
 *		  (insertOnly).
 * @param	landingPage	string		Base URL for each video, on the partners site
 *		 This is required by all syndication types.
 *		 .
 * @param	createdAt	int		Creation date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	allowEmbed	bool		allow_embed tells google OR yahoo weather to allow embedding the video on google OR yahoo video results
 *		 or just to provide a link to the landing page.
 *		 it is applied on the video-player_loc property in the XML (google)
 *		 and addes media-player tag (yahoo)
 *		 .
 * @param	playerUiconfId	int		Select a uiconf ID as player skin to include in the kwidget url
 *		 .
 * @param	flavorParamId	int		.
 * @param	transcodeExistingContent	bool		.
 * @param	addToDefaultConversionProfile	bool		.
 * @param	categories	string		.
 * @param	storageId	int		.
 * @param	entriesOrderBy	string		.
 * @param	enforceEntitlement	bool		Should enforce entitlement on feed entries
 *		 .
 * @param	privacyContext	string		Set privacy context for search entries that assiged to private and public categories within a category privacy context.
 *		 .
 * @param	updatedAt	int		Update date as Unix timestamp (In seconds)
 *		  (readOnly).
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
	this.storageId = null;
	this.entriesOrderBy = null;
	this.enforceEntitlement = null;
	this.privacyContext = null;
	this.updatedAt = null;
}
KalturaBaseSyndicationFeed.inheritsFrom (KalturaObjectBase);


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
 * @param	field	string		.
 * @param	value	string		.
 */
function KalturaBulkUploadPluginData(){
	this.field = null;
	this.value = null;
}
KalturaBulkUploadPluginData.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		The id of the result
 *	      (readOnly).
 * @param	bulkUploadJobId	int		The id of the parent job
 *		 .
 * @param	lineIndex	int		The index of the line in the CSV
 *		 .
 * @param	partnerId	int		.
 * @param	status	string		.
 * @param	action	string		.
 * @param	objectId	string		.
 * @param	objectStatus	int		.
 * @param	bulkUploadResultObjectType	string		.
 * @param	rowData	string		The data as recieved in the csv
 *		 .
 * @param	partnerData	string		.
 * @param	objectErrorDescription	string		.
 * @param	pluginsData	array		.
 * @param	errorDescription	string		.
 * @param	errorCode	string		.
 * @param	errorType	int		.
 */
function KalturaBulkUploadResult(){
	this.id = null;
	this.bulkUploadJobId = null;
	this.lineIndex = null;
	this.partnerId = null;
	this.status = null;
	this.action = null;
	this.objectId = null;
	this.objectStatus = null;
	this.bulkUploadResultObjectType = null;
	this.rowData = null;
	this.partnerData = null;
	this.objectErrorDescription = null;
	this.pluginsData = null;
	this.errorDescription = null;
	this.errorCode = null;
	this.errorType = null;
}
KalturaBulkUploadResult.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		.
 * @param	uploadedBy	string		.
 * @param	uploadedByUserId	string		.
 * @param	uploadedOn	int		.
 * @param	numOfEntries	int		.
 * @param	status	int		.
 * @param	logFileUrl	string		.
 * @param	csvFileUrl	string		.
 * @param	bulkFileUrl	string		.
 * @param	bulkUploadType	string		.
 * @param	results	array		.
 * @param	error	string		.
 * @param	errorType	int		.
 * @param	errorNumber	int		.
 * @param	fileName	string		.
 * @param	description	string		.
 * @param	numOfObjects	int		.
 * @param	bulkUploadObjectType	string		.
 */
function KalturaBulkUpload(){
	this.id = null;
	this.uploadedBy = null;
	this.uploadedByUserId = null;
	this.uploadedOn = null;
	this.numOfEntries = null;
	this.status = null;
	this.logFileUrl = null;
	this.csvFileUrl = null;
	this.bulkFileUrl = null;
	this.bulkUploadType = null;
	this.results = null;
	this.error = null;
	this.errorType = null;
	this.errorNumber = null;
	this.fileName = null;
	this.description = null;
	this.numOfObjects = null;
	this.bulkUploadObjectType = null;
}
KalturaBulkUpload.inheritsFrom (KalturaObjectBase);


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
 */
function KalturaBulkUploadObjectData(){
}
KalturaBulkUploadObjectData.inheritsFrom (KalturaObjectBase);


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
 * @param	captionParamsId	int		The Caption Params used to create this Caption Asset
 *		  (insertOnly).
 * @param	language	string		The language of the caption asset content
 *		 .
 * @param	languageCode	string		The language of the caption asset content
 *		  (readOnly).
 * @param	isDefault	int		Is default caption asset of the entry
 *		 .
 * @param	label	string		Friendly label
 *		 .
 * @param	format	string		The caption format
 *		  (insertOnly).
 * @param	status	int		The status of the asset
 *		  (readOnly).
 */
function KalturaCaptionAsset(){
	this.captionParamsId = null;
	this.language = null;
	this.languageCode = null;
	this.isDefault = null;
	this.label = null;
	this.format = null;
	this.status = null;
}
KalturaCaptionAsset.inheritsFrom (KalturaAsset);


/**
 * @param	asset	KalturaCaptionAsset		The Caption Asset object
 *		 .
 * @param	entry	KalturaBaseEntry		The entry object
 *		 .
 * @param	startTime	int		.
 * @param	endTime	int		.
 * @param	content	string		.
 */
function KalturaCaptionAssetItem(){
	this.asset = null;
	this.entry = null;
	this.startTime = null;
	this.endTime = null;
	this.content = null;
}
KalturaCaptionAssetItem.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaCaptionAssetItemListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaCaptionAssetItemListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaCaptionAssetListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaCaptionAssetListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	language	string		The language of the caption content
 *		  (insertOnly).
 * @param	isDefault	int		Is default caption asset of the entry
 *		 .
 * @param	label	string		Friendly label
 *		 .
 * @param	format	string		The caption format
 *		  (insertOnly).
 * @param	sourceParamsId	int		Id of the caption params or the flavor params to be used as source for the caption creation
 *		 .
 */
function KalturaCaptionParams(){
	this.language = null;
	this.isDefault = null;
	this.label = null;
	this.format = null;
	this.sourceParamsId = null;
}
KalturaCaptionParams.inheritsFrom (KalturaAssetParams);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaCaptionParamsListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaCaptionParamsListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		The id of the Category
 *		  (readOnly).
 * @param	parentId	int		.
 * @param	depth	int		 (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	name	string		The name of the Category. 
 *		 The following characters are not allowed: '<', '>', ','
 *		 .
 * @param	fullName	string		The full name of the Category
 *		  (readOnly).
 * @param	fullIds	string		The full ids of the Category
 *		  (readOnly).
 * @param	entriesCount	int		Number of entries in this Category (including child categories)
 *		  (readOnly).
 * @param	createdAt	int		Creation date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	updatedAt	int		Update date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	description	string		Category description
 *		 .
 * @param	tags	string		Category tags
 *		 .
 * @param	appearInList	int		If category will be returned for list action.
 *		 .
 * @param	privacy	int		defines the privacy of the entries that assigned to this category
 *		 .
 * @param	inheritanceType	int		If Category members are inherited from parent category or set manualy. 
 *		 .
 * @param	userJoinPolicy	int		Who can ask to join this category
 *		  (readOnly).
 * @param	defaultPermissionLevel	int		Default permissionLevel for new users
 *		 .
 * @param	owner	string		Category Owner (User id)
 *		 .
 * @param	directEntriesCount	int		Number of entries that belong to this category directly
 *		  (readOnly).
 * @param	referenceId	string		Category external id, controlled and managed by the partner.
 *		 .
 * @param	contributionPolicy	int		who can assign entries to this category
 *		 .
 * @param	membersCount	int		Number of active members for this category
 *		  (readOnly).
 * @param	pendingMembersCount	int		Number of pending members for this category
 *		  (readOnly).
 * @param	privacyContext	string		Set privacy context for search entries that assiged to private and public categories. the entries will be private if the search context is set with those categories.
 *		 .
 * @param	privacyContexts	string		comma separated parents that defines a privacyContext for search
 *		  (readOnly).
 * @param	status	int		Status
 *		  (readOnly).
 * @param	inheritedParentId	int		The category id that this category inherit its members and members permission (for contribution and join)
 *		  (readOnly).
 * @param	partnerSortValue	int		Can be used to store various partner related data as a numeric value
 *		 .
 * @param	partnerData	string		Can be used to store various partner related data as a string 
 *		 .
 * @param	defaultOrderBy	string		Enable client side applications to define how to sort the category child categories 
 *		 .
 * @param	directSubCategoriesCount	int		Number of direct children categories
 *		  (readOnly).
 * @param	moderation	int		Moderation to add entries to this category by users that are not of permission level Manager or Moderator.  
 *		 .
 * @param	pendingEntriesCount	int		Nunber of pending moderation entries
 *		  (readOnly).
 */
function KalturaCategory(){
	this.id = null;
	this.parentId = null;
	this.depth = null;
	this.partnerId = null;
	this.name = null;
	this.fullName = null;
	this.fullIds = null;
	this.entriesCount = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.description = null;
	this.tags = null;
	this.appearInList = null;
	this.privacy = null;
	this.inheritanceType = null;
	this.userJoinPolicy = null;
	this.defaultPermissionLevel = null;
	this.owner = null;
	this.directEntriesCount = null;
	this.referenceId = null;
	this.contributionPolicy = null;
	this.membersCount = null;
	this.pendingMembersCount = null;
	this.privacyContext = null;
	this.privacyContexts = null;
	this.status = null;
	this.inheritedParentId = null;
	this.partnerSortValue = null;
	this.partnerData = null;
	this.defaultOrderBy = null;
	this.directSubCategoriesCount = null;
	this.moderation = null;
	this.pendingEntriesCount = null;
}
KalturaCategory.inheritsFrom (KalturaObjectBase);


/**
 * @param	categoryId	int		.
 * @param	entryId	string		entry id
 *		 .
 * @param	createdAt	int		Creation date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	categoryFullIds	string		The full ids of the Category
 *		  (readOnly).
 * @param	status	int		CategroyEntry status
 *		  (readOnly).
 */
function KalturaCategoryEntry(){
	this.categoryId = null;
	this.entryId = null;
	this.createdAt = null;
	this.categoryFullIds = null;
	this.status = null;
}
KalturaCategoryEntry.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaCategoryEntryListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaCategoryEntryListResponse.inheritsFrom (KalturaObjectBase);


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
 * @param	categoryId	int		 (insertOnly).
 * @param	userId	string		User id
 *		  (insertOnly).
 * @param	partnerId	int		Partner id
 *		  (readOnly).
 * @param	permissionLevel	int		Permission level
 *		 .
 * @param	status	int		Status
 *		  (readOnly).
 * @param	createdAt	int		CategoryUser creation date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	updatedAt	int		CategoryUser update date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	updateMethod	int		Update method can be either manual or automatic to distinguish between manual operations (for example in KMC) on automatic - using bulk upload 
 *		 .
 * @param	categoryFullIds	string		The full ids of the Category
 *		  (readOnly).
 * @param	permissionNames	string		Set of category-related permissions for the current category user.
 *		 .
 */
function KalturaCategoryUser(){
	this.categoryId = null;
	this.userId = null;
	this.partnerId = null;
	this.permissionLevel = null;
	this.status = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.updateMethod = null;
	this.categoryFullIds = null;
	this.permissionNames = null;
}
KalturaCategoryUser.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaCategoryUserListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaCategoryUserListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	url	string		The URL where the notification should be sent to 
 *	     .
 * @param	data	string		The serialized notification data to send
 *	     .
 */
function KalturaClientNotification(){
	this.url = null;
	this.data = null;
}
KalturaClientNotification.inheritsFrom (KalturaObjectBase);


/**
 */
function KalturaContext(){
}
KalturaContext.inheritsFrom (KalturaObjectBase);


/**
 * @param	messages	array		Array of messages as received from the rules that invalidated
 *		 .
 * @param	actions	array		Array of actions as received from the rules that invalidated
 *		 .
 */
function KalturaContextDataResult(){
	this.messages = null;
	this.actions = null;
}
KalturaContextDataResult.inheritsFrom (KalturaObjectBase);


/**
 * @param	flavorParamsId	int		The id of the flavor params, set to null for source flavor
 *		 .
 * @param	name	string		Attribute name  
 *		 .
 * @param	value	string		Attribute value  
 *		 .
 */
function KalturaConversionAttribute(){
	this.flavorParamsId = null;
	this.name = null;
	this.value = null;
}
KalturaConversionAttribute.inheritsFrom (KalturaObjectBase);


/**
 * @param	left	int		Crop left point
 *		 .
 * @param	top	int		Crop top point
 *		 .
 * @param	width	int		Crop width
 *		 .
 * @param	height	int		Crop height
 *		 .
 */
function KalturaCropDimensions(){
	this.left = null;
	this.top = null;
	this.width = null;
	this.height = null;
}
KalturaCropDimensions.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		The id of the Conversion Profile
 *		  (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	status	string		.
 * @param	type	string		 (insertOnly).
 * @param	name	string		The name of the Conversion Profile
 *		 .
 * @param	systemName	string		System name of the Conversion Profile
 *		 .
 * @param	tags	string		Comma separated tags
 *		 .
 * @param	description	string		The description of the Conversion Profile
 *		 .
 * @param	defaultEntryId	string		ID of the default entry to be used for template data
 *		 .
 * @param	createdAt	int		Creation date as Unix timestamp (In seconds) 
 *		  (readOnly).
 * @param	flavorParamsIds	string		List of included flavor ids (comma separated)
 *		 .
 * @param	isDefault	int		Indicates that this conversion profile is system default
 *		 .
 * @param	isPartnerDefault	bool		Indicates that this conversion profile is partner default
 *		  (readOnly).
 * @param	cropDimensions	KalturaCropDimensions		Cropping dimensions
 *		 .
 * @param	clipStart	int		Clipping start position (in miliseconds)
 *		 .
 * @param	clipDuration	int		Clipping duration (in miliseconds)
 *		 .
 * @param	xslTransformation	string		XSL to transform ingestion MRSS XML
 *		 .
 * @param	storageProfileId	int		ID of default storage profile to be used for linked net-storage file syncs
 *		 .
 * @param	mediaParserType	string		Media parser type to be used for extract media
 *		 .
 */
function KalturaConversionProfile(){
	this.id = null;
	this.partnerId = null;
	this.status = null;
	this.type = null;
	this.name = null;
	this.systemName = null;
	this.tags = null;
	this.description = null;
	this.defaultEntryId = null;
	this.createdAt = null;
	this.flavorParamsIds = null;
	this.isDefault = null;
	this.isPartnerDefault = null;
	this.cropDimensions = null;
	this.clipStart = null;
	this.clipDuration = null;
	this.xslTransformation = null;
	this.storageProfileId = null;
	this.mediaParserType = null;
}
KalturaConversionProfile.inheritsFrom (KalturaObjectBase);


/**
 * @param	conversionProfileId	int		The id of the conversion profile
 *		  (readOnly).
 * @param	assetParamsId	int		The id of the asset params
 *		  (readOnly).
 * @param	readyBehavior	int		The ingestion origin of the asset params
 *		 .
 * @param	origin	int		The ingestion origin of the asset params
 *		 .
 * @param	systemName	string		Asset params system name
 *		 .
 * @param	forceNoneComplied	int		Starts conversion even if the decision layer reduced the configuration to comply with the source
 *		 .
 * @param	deletePolicy	int		Specifies how to treat the flavor after conversion is finished
 *		 .
 */
function KalturaConversionProfileAssetParams(){
	this.conversionProfileId = null;
	this.assetParamsId = null;
	this.readyBehavior = null;
	this.origin = null;
	this.systemName = null;
	this.forceNoneComplied = null;
	this.deletePolicy = null;
}
KalturaConversionProfileAssetParams.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaConversionProfileAssetParamsListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaConversionProfileAssetParamsListResponse.inheritsFrom (KalturaObjectBase);


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
 * @param	flavorAssetId	string		.
 * @param	flavorParamsOutputId	int		.
 * @param	readyBehavior	int		.
 * @param	videoBitrate	int		.
 * @param	audioBitrate	int		.
 * @param	destFileSyncLocalPath	string		.
 * @param	destFileSyncRemoteUrl	string		.
 */
function KalturaConvertCollectionFlavorData(){
	this.flavorAssetId = null;
	this.flavorParamsOutputId = null;
	this.readyBehavior = null;
	this.videoBitrate = null;
	this.audioBitrate = null;
	this.destFileSyncLocalPath = null;
	this.destFileSyncRemoteUrl = null;
}
KalturaConvertCollectionFlavorData.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaCuePointListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaCuePointListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	dataContent	string		The data of the entry
 *		 .
 * @param	retrieveDataContentByGet	bool		indicator whether to return the object for get action with the dataContent field.
 *		  (insertOnly).
 */
function KalturaDataEntry(){
	this.dataContent = null;
	this.retrieveDataContentByGet = null;
}
KalturaDataEntry.inheritsFrom (KalturaBaseEntry);


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
 * @param	fieldName	string		A value taken from a connector field enum which associates the current configuration to that connector field
 *	     Field enum class should be returned by the provider's getFieldEnumClass function.
 *	     .
 * @param	userFriendlyFieldName	string		A string that will be shown to the user as the field name in error messages related to the current field
 *	     .
 * @param	entryMrssXslt	string		An XSLT string that extracts the right value from the Kaltura entry MRSS XML.
 *	     The value of the current connector field will be the one that is returned from transforming the Kaltura entry MRSS XML using this XSLT string.
 *	     .
 * @param	isRequired	int		Is the field required to have a value for submission ?
 *	     .
 * @param	updateOnChange	bool		Trigger distribution update when this field changes or not ?
 *	     .
 * @param	updateParams	array		Entry column or metadata xpath that should trigger an update
 *	     .
 * @param	isDefault	bool		Is this field config is the default for the distribution provider?
 *	      (readOnly).
 */
function KalturaDistributionFieldConfig(){
	this.fieldName = null;
	this.userFriendlyFieldName = null;
	this.entryMrssXslt = null;
	this.isRequired = null;
	this.updateOnChange = null;
	this.updateParams = null;
	this.isDefault = null;
}
KalturaDistributionFieldConfig.inheritsFrom (KalturaObjectBase);


/**
 */
function KalturaDistributionJobProviderData(){
}
KalturaDistributionJobProviderData.inheritsFrom (KalturaObjectBase);


/**
 * @param	width	int		.
 * @param	height	int		.
 */
function KalturaDistributionThumbDimensions(){
	this.width = null;
	this.height = null;
}
KalturaDistributionThumbDimensions.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		Auto generated unique id
 *		  (readOnly).
 * @param	createdAt	int		Profile creation date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	updatedAt	int		Profile last update date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	providerType	string		 (insertOnly).
 * @param	name	string		.
 * @param	status	int		.
 * @param	submitEnabled	int		.
 * @param	updateEnabled	int		.
 * @param	deleteEnabled	int		.
 * @param	reportEnabled	int		.
 * @param	autoCreateFlavors	string		Comma separated flavor params ids that should be auto converted
 *		 .
 * @param	autoCreateThumb	string		Comma separated thumbnail params ids that should be auto generated
 *		 .
 * @param	optionalFlavorParamsIds	string		Comma separated flavor params ids that should be submitted if ready
 *		 .
 * @param	requiredFlavorParamsIds	string		Comma separated flavor params ids that required to be ready before submission
 *		 .
 * @param	optionalThumbDimensions	array		Thumbnail dimensions that should be submitted if ready
 *		 .
 * @param	requiredThumbDimensions	array		Thumbnail dimensions that required to be readt before submission
 *		 .
 * @param	optionalAssetDistributionRules	array		Asset Distribution Rules for assets that should be submitted if ready
 *		 .
 * @param	requiredAssetDistributionRules	array		Assets Asset Distribution Rules for assets that are required to be ready before submission
 *		 .
 * @param	sunriseDefaultOffset	int		If entry distribution sunrise not specified that will be the default since entry creation time, in seconds
 *		 .
 * @param	sunsetDefaultOffset	int		If entry distribution sunset not specified that will be the default since entry creation time, in seconds
 *		 .
 * @param	recommendedStorageProfileForDownload	int		The best external storage to be used to download the asset files from
 *		 .
 * @param	recommendedDcForDownload	int		The best Kaltura data center to be used to download the asset files to
 *		 .
 * @param	recommendedDcForExecute	int		The best Kaltura data center to be used to execute the distribution job
 *		 .
 */
function KalturaDistributionProfile(){
	this.id = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.partnerId = null;
	this.providerType = null;
	this.name = null;
	this.status = null;
	this.submitEnabled = null;
	this.updateEnabled = null;
	this.deleteEnabled = null;
	this.reportEnabled = null;
	this.autoCreateFlavors = null;
	this.autoCreateThumb = null;
	this.optionalFlavorParamsIds = null;
	this.requiredFlavorParamsIds = null;
	this.optionalThumbDimensions = null;
	this.requiredThumbDimensions = null;
	this.optionalAssetDistributionRules = null;
	this.requiredAssetDistributionRules = null;
	this.sunriseDefaultOffset = null;
	this.sunsetDefaultOffset = null;
	this.recommendedStorageProfileForDownload = null;
	this.recommendedDcForDownload = null;
	this.recommendedDcForExecute = null;
}
KalturaDistributionProfile.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaDistributionProfileListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaDistributionProfileListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	type	string		 (readOnly).
 * @param	name	string		.
 * @param	scheduleUpdateEnabled	bool		.
 * @param	availabilityUpdateEnabled	bool		.
 * @param	deleteInsteadUpdate	bool		.
 * @param	intervalBeforeSunrise	int		.
 * @param	intervalBeforeSunset	int		.
 * @param	updateRequiredEntryFields	string		.
 * @param	updateRequiredMetadataXPaths	string		.
 */
function KalturaDistributionProvider(){
	this.type = null;
	this.name = null;
	this.scheduleUpdateEnabled = null;
	this.availabilityUpdateEnabled = null;
	this.deleteInsteadUpdate = null;
	this.intervalBeforeSunrise = null;
	this.intervalBeforeSunset = null;
	this.updateRequiredEntryFields = null;
	this.updateRequiredMetadataXPaths = null;
}
KalturaDistributionProvider.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaDistributionProviderListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaDistributionProviderListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	version	string		.
 * @param	assetId	string		.
 * @param	remoteId	string		.
 */
function KalturaDistributionRemoteMediaFile(){
	this.version = null;
	this.assetId = null;
	this.remoteId = null;
}
KalturaDistributionRemoteMediaFile.inheritsFrom (KalturaObjectBase);


/**
 * @param	action	int		.
 * @param	errorType	int		.
 * @param	description	string		.
 */
function KalturaDistributionValidationError(){
	this.action = null;
	this.errorType = null;
	this.description = null;
}
KalturaDistributionValidationError.inheritsFrom (KalturaObjectBase);


/**
 * @param	documentType	int		The type of the document
 *		  (insertOnly).
 * @param	assetParamsIds	string		Comma separated asset params ids that exists for this media entry
 *		  (readOnly).
 */
function KalturaDocumentEntry(){
	this.documentType = null;
	this.assetParamsIds = null;
}
KalturaDocumentEntry.inheritsFrom (KalturaBaseEntry);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaDocumentListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaDocumentListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		 (readOnly).
 * @param	partnerId	int		 (insertOnly).
 * @param	name	string		.
 * @param	description	string		.
 * @param	provider	string		.
 * @param	status	int		.
 * @param	licenseServerUrl	string		.
 * @param	defaultPolicy	string		.
 * @param	createdAt	int		 (readOnly).
 * @param	updatedAt	int		 (readOnly).
 */
function KalturaDrmProfile(){
	this.id = null;
	this.partnerId = null;
	this.name = null;
	this.description = null;
	this.provider = null;
	this.status = null;
	this.licenseServerUrl = null;
	this.defaultPolicy = null;
	this.createdAt = null;
	this.updatedAt = null;
}
KalturaDrmProfile.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaDrmProfileListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaDrmProfileListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	handlerType	string		 (readOnly).
 */
function KalturaDropFolderFileHandlerConfig(){
	this.handlerType = null;
}
KalturaDropFolderFileHandlerConfig.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		 (readOnly).
 * @param	partnerId	int		 (insertOnly).
 * @param	name	string		.
 * @param	description	string		.
 * @param	type	string		.
 * @param	status	int		.
 * @param	conversionProfileId	int		.
 * @param	dc	int		.
 * @param	path	string		.
 * @param	fileSizeCheckInterval	int		The ammount of time, in seconds, that should pass so that a file with no change in size we'll be treated as "finished uploading to folder"
 *		 .
 * @param	fileDeletePolicy	int		.
 * @param	autoFileDeleteDays	int		.
 * @param	fileHandlerType	string		.
 * @param	fileNamePatterns	string		.
 * @param	fileHandlerConfig	KalturaDropFolderFileHandlerConfig		.
 * @param	tags	string		.
 * @param	errorCode	string		.
 * @param	errorDescription	string		.
 * @param	ignoreFileNamePatterns	string		.
 * @param	createdAt	int		 (readOnly).
 * @param	updatedAt	int		 (readOnly).
 * @param	lastAccessedAt	int		.
 * @param	incremental	bool		.
 * @param	lastFileTimestamp	int		.
 * @param	metadataProfileId	int		.
 */
function KalturaDropFolder(){
	this.id = null;
	this.partnerId = null;
	this.name = null;
	this.description = null;
	this.type = null;
	this.status = null;
	this.conversionProfileId = null;
	this.dc = null;
	this.path = null;
	this.fileSizeCheckInterval = null;
	this.fileDeletePolicy = null;
	this.autoFileDeleteDays = null;
	this.fileHandlerType = null;
	this.fileNamePatterns = null;
	this.fileHandlerConfig = null;
	this.tags = null;
	this.errorCode = null;
	this.errorDescription = null;
	this.ignoreFileNamePatterns = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.lastAccessedAt = null;
	this.incremental = null;
	this.lastFileTimestamp = null;
	this.metadataProfileId = null;
}
KalturaDropFolder.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		 (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	dropFolderId	int		 (insertOnly).
 * @param	fileName	string		 (insertOnly).
 * @param	fileSize	float		.
 * @param	fileSizeLastSetAt	int		 (readOnly).
 * @param	status	int		 (readOnly).
 * @param	type	string		 (readOnly).
 * @param	parsedSlug	string		.
 * @param	parsedFlavor	string		.
 * @param	leadDropFolderFileId	int		.
 * @param	deletedDropFolderFileId	int		.
 * @param	entryId	string		.
 * @param	errorCode	string		.
 * @param	errorDescription	string		.
 * @param	lastModificationTime	string		.
 * @param	createdAt	int		 (readOnly).
 * @param	updatedAt	int		 (readOnly).
 * @param	uploadStartDetectedAt	int		.
 * @param	uploadEndDetectedAt	int		.
 * @param	importStartedAt	int		.
 * @param	importEndedAt	int		.
 * @param	batchJobId	int		 (readOnly).
 */
function KalturaDropFolderFile(){
	this.id = null;
	this.partnerId = null;
	this.dropFolderId = null;
	this.fileName = null;
	this.fileSize = null;
	this.fileSizeLastSetAt = null;
	this.status = null;
	this.type = null;
	this.parsedSlug = null;
	this.parsedFlavor = null;
	this.leadDropFolderFileId = null;
	this.deletedDropFolderFileId = null;
	this.entryId = null;
	this.errorCode = null;
	this.errorDescription = null;
	this.lastModificationTime = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.uploadStartDetectedAt = null;
	this.uploadEndDetectedAt = null;
	this.importStartedAt = null;
	this.importEndedAt = null;
	this.batchJobId = null;
}
KalturaDropFolderFile.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaDropFolderFileListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaDropFolderFileListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaDropFolderListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaDropFolderListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		 (readOnly).
 * @param	name	string		.
 * @param	description	string		.
 * @param	emailAddress	string		.
 * @param	mailboxId	string		.
 * @param	partnerId	int		 (readOnly).
 * @param	conversionProfile2Id	int		.
 * @param	moderationStatus	int		.
 * @param	status	int		 (readOnly).
 * @param	createdAt	string		 (readOnly).
 * @param	defaultCategory	string		.
 * @param	defaultUserId	string		.
 * @param	defaultTags	string		.
 * @param	defaultAdminTags	string		.
 * @param	maxAttachmentSizeKbytes	int		.
 * @param	maxAttachmentsPerMail	int		.
 */
function KalturaEmailIngestionProfile(){
	this.id = null;
	this.name = null;
	this.description = null;
	this.emailAddress = null;
	this.mailboxId = null;
	this.partnerId = null;
	this.conversionProfile2Id = null;
	this.moderationStatus = null;
	this.status = null;
	this.createdAt = null;
	this.defaultCategory = null;
	this.defaultUserId = null;
	this.defaultTags = null;
	this.defaultAdminTags = null;
	this.maxAttachmentSizeKbytes = null;
	this.maxAttachmentsPerMail = null;
}
KalturaEmailIngestionProfile.inheritsFrom (KalturaObjectBase);


/**
 * @param	description	string		.
 */
function KalturaValue(){
	this.description = null;
}
KalturaValue.inheritsFrom (KalturaObjectBase);


/**
 * @param	value	string		.
 */
function KalturaStringValue(){
	this.value = null;
}
KalturaStringValue.inheritsFrom (KalturaValue);


/**
 * @param	email	KalturaStringValue		Recipient e-mail address
 *		 .
 * @param	name	KalturaStringValue		Recipient name
 *		 .
 */
function KalturaEmailNotificationRecipient(){
	this.email = null;
	this.name = null;
}
KalturaEmailNotificationRecipient.inheritsFrom (KalturaObjectBase);


/**
 * @param	providerType	string		Provider type of the job data.
 *		   (readOnly).
 */
function KalturaEmailNotificationRecipientJobData(){
	this.providerType = null;
}
KalturaEmailNotificationRecipientJobData.inheritsFrom (KalturaObjectBase);


/**
 */
function KalturaEmailNotificationRecipientProvider(){
}
KalturaEmailNotificationRecipientProvider.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		Auto generated unique id
 *		  (readOnly).
 * @param	createdAt	int		Entry distribution creation date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	updatedAt	int		Entry distribution last update date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	submittedAt	int		Entry distribution submission date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	entryId	string		 (insertOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	distributionProfileId	int		 (insertOnly).
 * @param	status	int		 (readOnly).
 * @param	sunStatus	int		 (readOnly).
 * @param	dirtyStatus	int		 (readOnly).
 * @param	thumbAssetIds	string		Comma separated thumbnail asset ids
 *		 .
 * @param	flavorAssetIds	string		Comma separated flavor asset ids
 *		 .
 * @param	assetIds	string		Comma separated asset ids
 *		 .
 * @param	sunrise	int		Entry distribution publish time as Unix timestamp (In seconds)
 *		 .
 * @param	sunset	int		Entry distribution un-publish time as Unix timestamp (In seconds)
 *		 .
 * @param	remoteId	string		The id as returned from the distributed destination
 *		  (readOnly).
 * @param	plays	int		The plays as retrieved from the remote destination reports
 *		  (readOnly).
 * @param	views	int		The views as retrieved from the remote destination reports
 *		  (readOnly).
 * @param	validationErrors	array		.
 * @param	errorType	int		 (readOnly).
 * @param	errorNumber	int		 (readOnly).
 * @param	errorDescription	string		 (readOnly).
 * @param	hasSubmitResultsLog	int		 (readOnly).
 * @param	hasSubmitSentDataLog	int		 (readOnly).
 * @param	hasUpdateResultsLog	int		 (readOnly).
 * @param	hasUpdateSentDataLog	int		 (readOnly).
 * @param	hasDeleteResultsLog	int		 (readOnly).
 * @param	hasDeleteSentDataLog	int		 (readOnly).
 */
function KalturaEntryDistribution(){
	this.id = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.submittedAt = null;
	this.entryId = null;
	this.partnerId = null;
	this.distributionProfileId = null;
	this.status = null;
	this.sunStatus = null;
	this.dirtyStatus = null;
	this.thumbAssetIds = null;
	this.flavorAssetIds = null;
	this.assetIds = null;
	this.sunrise = null;
	this.sunset = null;
	this.remoteId = null;
	this.plays = null;
	this.views = null;
	this.validationErrors = null;
	this.errorType = null;
	this.errorNumber = null;
	this.errorDescription = null;
	this.hasSubmitResultsLog = null;
	this.hasSubmitSentDataLog = null;
	this.hasUpdateResultsLog = null;
	this.hasUpdateSentDataLog = null;
	this.hasDeleteResultsLog = null;
	this.hasDeleteSentDataLog = null;
}
KalturaEntryDistribution.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaEntryDistributionListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaEntryDistributionListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	key	string		The key in the subject and body to be replaced with the dynamic value
 *		 .
 * @param	description	string		.
 * @param	value	KalturaStringValue		The dynamic value to be placed in the final output
 *		 .
 */
function KalturaEventNotificationParameter(){
	this.key = null;
	this.description = null;
	this.value = null;
}
KalturaEventNotificationParameter.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		 (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	name	string		.
 * @param	systemName	string		.
 * @param	description	string		.
 * @param	type	string		 (insertOnly).
 * @param	status	int		 (readOnly).
 * @param	createdAt	int		 (readOnly).
 * @param	updatedAt	int		 (readOnly).
 * @param	manualDispatchEnabled	bool		Define that the template could be dispatched manually from the API
 *		 .
 * @param	automaticDispatchEnabled	bool		Define that the template could be dispatched automatically by the system
 *		 .
 * @param	eventType	string		Define the event that should trigger this notification
 *		 .
 * @param	eventObjectType	string		Define the object that raied the event that should trigger this notification
 *		 .
 * @param	eventConditions	array		Define the conditions that cause this notification to be triggered
 *		 .
 * @param	contentParameters	array		Define the content dynamic parameters
 *		 .
 * @param	userParameters	array		Define the content dynamic parameters
 *		 .
 */
function KalturaEventNotificationTemplate(){
	this.id = null;
	this.partnerId = null;
	this.name = null;
	this.systemName = null;
	this.description = null;
	this.type = null;
	this.status = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.manualDispatchEnabled = null;
	this.automaticDispatchEnabled = null;
	this.eventType = null;
	this.eventObjectType = null;
	this.eventConditions = null;
	this.contentParameters = null;
	this.userParameters = null;
}
KalturaEventNotificationTemplate.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaEventNotificationTemplateListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaEventNotificationTemplateListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	extendedFeatures	string		Comma separated string of enum values denoting which features of the item need to be included in the MRSS 
 *		 .
 */
function KalturaObjectIdentifier(){
	this.extendedFeatures = null;
}
KalturaObjectIdentifier.inheritsFrom (KalturaObjectBase);


/**
 * @param	xpath	string		XPath for the extending item
 *		 .
 * @param	identifier	KalturaObjectIdentifier		Object identifier
 *		 .
 * @param	extensionMode	int		Mode of extension - append to MRSS or replace the xpath content.
 *		 .
 */
function KalturaExtendingItemMrssParameter(){
	this.xpath = null;
	this.identifier = null;
	this.extensionMode = null;
}
KalturaExtendingItemMrssParameter.inheritsFrom (KalturaObjectBase);


/**
 * @param	plays	int		Number of plays
 *		  (readOnly).
 * @param	views	int		Number of views
 *		  (readOnly).
 * @param	lastPlayedAt	int		The last time the entry was played
 *		  (readOnly).
 * @param	width	int		The width in pixels
 *		  (readOnly).
 * @param	height	int		The height in pixels
 *		  (readOnly).
 * @param	duration	int		The duration in seconds
 *		  (readOnly).
 * @param	msDuration	int		The duration in miliseconds
 *		 .
 * @param	durationType	string		The duration type (short for 0-4 mins, medium for 4-20 mins, long for 20+ mins)
 *		  (readOnly).
 */
function KalturaPlayableEntry(){
	this.plays = null;
	this.views = null;
	this.lastPlayedAt = null;
	this.width = null;
	this.height = null;
	this.duration = null;
	this.msDuration = null;
	this.durationType = null;
}
KalturaPlayableEntry.inheritsFrom (KalturaBaseEntry);


/**
 * @param	mediaType	int		The media type of the entry
 *		  (insertOnly).
 * @param	conversionQuality	string		Override the default conversion quality  
 *		  (insertOnly).
 * @param	sourceType	string		The source type of the entry 
 *		  (insertOnly).
 * @param	searchProviderType	int		The search provider type used to import this entry
 *		  (insertOnly).
 * @param	searchProviderId	string		The ID of the media in the importing site
 *		  (insertOnly).
 * @param	creditUserName	string		The user name used for credits
 *		 .
 * @param	creditUrl	string		The URL for credits
 *		 .
 * @param	mediaDate	int		The media date extracted from EXIF data (For images) as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	dataUrl	string		The URL used for playback. This is not the download URL.
 *		  (readOnly).
 * @param	flavorParamsIds	string		Comma separated flavor params ids that exists for this media entry
 *		  (readOnly).
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
 * @param	externalSourceType	string		The source type of the external media
 *		  (insertOnly).
 * @param	assetParamsIds	string		Comma separated asset params ids that exists for this external media entry
 *		  (readOnly).
 */
function KalturaExternalMediaEntry(){
	this.externalSourceType = null;
	this.assetParamsIds = null;
}
KalturaExternalMediaEntry.inheritsFrom (KalturaMediaEntry);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaExternalMediaEntryListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaExternalMediaEntryListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	type	int		.
 * @param	value	int		.
 */
function KalturaFeatureStatus(){
	this.type = null;
	this.value = null;
}
KalturaFeatureStatus.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaFeatureStatusListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaFeatureStatusListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		 (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	fileAssetObjectType	string		 (insertOnly).
 * @param	objectId	string		 (insertOnly).
 * @param	name	string		.
 * @param	systemName	string		.
 * @param	fileExt	string		.
 * @param	version	int		 (readOnly).
 * @param	createdAt	int		 (readOnly).
 * @param	updatedAt	int		 (readOnly).
 * @param	status	string		 (readOnly).
 */
function KalturaFileAsset(){
	this.id = null;
	this.partnerId = null;
	this.fileAssetObjectType = null;
	this.objectId = null;
	this.name = null;
	this.systemName = null;
	this.fileExt = null;
	this.version = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.status = null;
}
KalturaFileAsset.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaFileAssetListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaFileAssetListResponse.inheritsFrom (KalturaObjectBase);


/**
 */
function KalturaSearchItem(){
}
KalturaSearchItem.inheritsFrom (KalturaObjectBase);


/**
 * @param	orderBy	string		.
 * @param	advancedSearch	KalturaSearchItem		.
 */
function KalturaFilter(){
	this.orderBy = null;
	this.advancedSearch = null;
}
KalturaFilter.inheritsFrom (KalturaObjectBase);


/**
 * @param	pageSize	int		The number of objects to retrieve. (Default is 30, maximum page size is 500).
 *		 .
 * @param	pageIndex	int		The page number for which {pageSize} of objects should be retrieved (Default is 1).
 *		 .
 */
function KalturaFilterPager(){
	this.pageSize = null;
	this.pageIndex = null;
}
KalturaFilterPager.inheritsFrom (KalturaObjectBase);


/**
 * @param	flavorParamsId	int		The Flavor Params used to create this Flavor Asset
 *		  (insertOnly).
 * @param	width	int		The width of the Flavor Asset 
 *		  (readOnly).
 * @param	height	int		The height of the Flavor Asset
 *		  (readOnly).
 * @param	bitrate	int		The overall bitrate (in KBits) of the Flavor Asset 
 *		  (readOnly).
 * @param	frameRate	float		The frame rate (in FPS) of the Flavor Asset
 *		  (readOnly).
 * @param	isOriginal	bool		True if this Flavor Asset is the original source
 *		  (readOnly).
 * @param	isWeb	bool		True if this Flavor Asset is playable in KDP
 *		  (readOnly).
 * @param	containerFormat	string		The container format
 *		  (readOnly).
 * @param	videoCodecId	string		The video codec
 *		  (readOnly).
 * @param	status	int		The status of the Flavor Asset
 *		  (readOnly).
 */
function KalturaFlavorAsset(){
	this.flavorParamsId = null;
	this.width = null;
	this.height = null;
	this.bitrate = null;
	this.frameRate = null;
	this.isOriginal = null;
	this.isWeb = null;
	this.containerFormat = null;
	this.videoCodecId = null;
	this.status = null;
}
KalturaFlavorAsset.inheritsFrom (KalturaAsset);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaFlavorAssetListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaFlavorAssetListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	videoCodec	string		The video codec of the Flavor Params
 *		 .
 * @param	videoBitrate	int		The video bitrate (in KBits) of the Flavor Params
 *		 .
 * @param	audioCodec	string		The audio codec of the Flavor Params
 *		 .
 * @param	audioBitrate	int		The audio bitrate (in KBits) of the Flavor Params
 *		 .
 * @param	audioChannels	int		The number of audio channels for "downmixing"
 *		 .
 * @param	audioSampleRate	int		The audio sample rate of the Flavor Params
 *		 .
 * @param	width	int		The desired width of the Flavor Params
 *		 .
 * @param	height	int		The desired height of the Flavor Params
 *		 .
 * @param	frameRate	int		The frame rate of the Flavor Params
 *		 .
 * @param	gopSize	int		The gop size of the Flavor Params
 *		 .
 * @param	conversionEngines	string		The list of conversion engines (comma separated)
 *		 .
 * @param	conversionEnginesExtraParams	string		The list of conversion engines extra params (separated with "|")
 *		 .
 * @param	twoPass	bool		.
 * @param	deinterlice	int		.
 * @param	rotate	int		.
 * @param	operators	string		.
 * @param	engineVersion	int		.
 * @param	format	string		The container format of the Flavor Params
 *		 .
 * @param	aspectRatioProcessingMode	int		.
 * @param	forceFrameToMultiplication16	int		.
 * @param	isGopInSec	int		.
 * @param	isAvoidVideoShrinkFramesizeToSource	int		.
 * @param	isAvoidVideoShrinkBitrateToSource	int		.
 * @param	isVideoFrameRateForLowBrAppleHls	int		.
 * @param	anamorphicPixels	float		.
 * @param	isAvoidForcedKeyFrames	int		.
 * @param	maxFrameRate	int		.
 * @param	videoConstantBitrate	int		.
 * @param	videoBitrateTolerance	int		.
 * @param	clipOffset	int		.
 * @param	clipDuration	int		.
 */
function KalturaFlavorParams(){
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
	this.deinterlice = null;
	this.rotate = null;
	this.operators = null;
	this.engineVersion = null;
	this.format = null;
	this.aspectRatioProcessingMode = null;
	this.forceFrameToMultiplication16 = null;
	this.isGopInSec = null;
	this.isAvoidVideoShrinkFramesizeToSource = null;
	this.isAvoidVideoShrinkBitrateToSource = null;
	this.isVideoFrameRateForLowBrAppleHls = null;
	this.anamorphicPixels = null;
	this.isAvoidForcedKeyFrames = null;
	this.maxFrameRate = null;
	this.videoConstantBitrate = null;
	this.videoBitrateTolerance = null;
	this.clipOffset = null;
	this.clipDuration = null;
}
KalturaFlavorParams.inheritsFrom (KalturaAssetParams);


/**
 * @param	flavorAsset	KalturaFlavorAsset		The Flavor Asset (Can be null when there are params without asset)
 *		 .
 * @param	flavorParams	KalturaFlavorParams		The Flavor Params
 *		 .
 * @param	entryId	string		The entry id
 *		 .
 */
function KalturaFlavorAssetWithParams(){
	this.flavorAsset = null;
	this.flavorParams = null;
	this.entryId = null;
}
KalturaFlavorAssetWithParams.inheritsFrom (KalturaObjectBase);


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
 * @param	readyBehavior	int		.
 */
function KalturaFlavorParamsOutput(){
	this.flavorParamsId = null;
	this.commandLinesStr = null;
	this.flavorParamsVersion = null;
	this.flavorAssetId = null;
	this.flavorAssetVersion = null;
	this.readyBehavior = null;
}
KalturaFlavorParamsOutput.inheritsFrom (KalturaFlavorParams);


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
 * @param	protocol	int		.
 * @param	serverUrl	string		.
 * @param	serverPath	string		.
 * @param	username	string		.
 * @param	password	string		.
 * @param	ftpPassiveMode	bool		.
 * @param	httpFieldName	string		.
 * @param	httpFileName	string		.
 */
function KalturaGenericDistributionProfileAction(){
	this.protocol = null;
	this.serverUrl = null;
	this.serverPath = null;
	this.username = null;
	this.password = null;
	this.ftpPassiveMode = null;
	this.httpFieldName = null;
	this.httpFileName = null;
}
KalturaGenericDistributionProfileAction.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		Auto generated
 *		  (readOnly).
 * @param	createdAt	int		Generic distribution provider action creation date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	updatedAt	int		Generic distribution provider action last update date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	genericDistributionProviderId	int		 (insertOnly).
 * @param	action	int		 (insertOnly).
 * @param	status	int		 (readOnly).
 * @param	resultsParser	int		.
 * @param	protocol	int		.
 * @param	serverAddress	string		.
 * @param	remotePath	string		.
 * @param	remoteUsername	string		.
 * @param	remotePassword	string		.
 * @param	editableFields	string		.
 * @param	mandatoryFields	string		.
 * @param	mrssTransformer	string		 (readOnly).
 * @param	mrssValidator	string		 (readOnly).
 * @param	resultsTransformer	string		 (readOnly).
 */
function KalturaGenericDistributionProviderAction(){
	this.id = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.genericDistributionProviderId = null;
	this.action = null;
	this.status = null;
	this.resultsParser = null;
	this.protocol = null;
	this.serverAddress = null;
	this.remotePath = null;
	this.remoteUsername = null;
	this.remotePassword = null;
	this.editableFields = null;
	this.mandatoryFields = null;
	this.mrssTransformer = null;
	this.mrssValidator = null;
	this.resultsTransformer = null;
}
KalturaGenericDistributionProviderAction.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaGenericDistributionProviderActionListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaGenericDistributionProviderActionListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		Auto generated
 *		  (readOnly).
 * @param	createdAt	int		Generic distribution provider creation date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	updatedAt	int		Generic distribution provider last update date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	isDefault	bool		.
 * @param	status	int		 (readOnly).
 * @param	optionalFlavorParamsIds	string		.
 * @param	requiredFlavorParamsIds	string		.
 * @param	optionalThumbDimensions	array		.
 * @param	requiredThumbDimensions	array		.
 * @param	editableFields	string		.
 * @param	mandatoryFields	string		.
 */
function KalturaGenericDistributionProvider(){
	this.id = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.partnerId = null;
	this.isDefault = null;
	this.status = null;
	this.optionalFlavorParamsIds = null;
	this.requiredFlavorParamsIds = null;
	this.optionalThumbDimensions = null;
	this.requiredThumbDimensions = null;
	this.editableFields = null;
	this.mandatoryFields = null;
}
KalturaGenericDistributionProvider.inheritsFrom (KalturaDistributionProvider);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaGenericDistributionProviderListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaGenericDistributionProviderListResponse.inheritsFrom (KalturaObjectBase);


/**
 */
function KalturaObject(){
}
KalturaObject.inheritsFrom (KalturaObjectBase);


/**
 * @param	object	KalturaObjectBase		Object that triggered the notification
 *		 .
 * @param	eventObjectType	string		Object type that triggered the notification
 *		 .
 * @param	eventNotificationJobId	int		ID of the batch job that execute the notification
 *		 .
 * @param	templateId	int		ID of the template that triggered the notification
 *		 .
 * @param	templateName	string		Name of the template that triggered the notification
 *		 .
 * @param	templateSystemName	string		System name of the template that triggered the notification
 *		 .
 * @param	eventType	string		Ecent type that triggered the notification
 *		 .
 */
function KalturaHttpNotification(){
	this.object = null;
	this.eventObjectType = null;
	this.eventNotificationJobId = null;
	this.templateId = null;
	this.templateName = null;
	this.templateSystemName = null;
	this.eventType = null;
}
KalturaHttpNotification.inheritsFrom (KalturaObjectBase);


/**
 */
function KalturaHttpNotificationData(){
}
KalturaHttpNotificationData.inheritsFrom (KalturaObjectBase);


/**
 */
function KalturaJobData(){
}
KalturaJobData.inheritsFrom (KalturaObjectBase);


/**
 * @param	protocol	string		.
 * @param	url	string		.
 * @param	publishUrl	string		.
 */
function KalturaLiveStreamConfiguration(){
	this.protocol = null;
	this.url = null;
	this.publishUrl = null;
}
KalturaLiveStreamConfiguration.inheritsFrom (KalturaObjectBase);


/**
 * @param	offlineMessage	string		The message to be presented when the stream is offline
 *		 .
 * @param	recordStatus	int		Recording Status Enabled/Disabled
 *		  (insertOnly).
 * @param	dvrStatus	int		DVR Status Enabled/Disabled
 *		  (insertOnly).
 * @param	dvrWindow	int		Window of time which the DVR allows for backwards scrubbing (in minutes)
 *		  (insertOnly).
 * @param	liveStreamConfigurations	array		Array of key value protocol->live stream url objects
 *		 .
 * @param	recordedEntryId	string		Recorded entry id
 *		 .
 */
function KalturaLiveEntry(){
	this.offlineMessage = null;
	this.recordStatus = null;
	this.dvrStatus = null;
	this.dvrWindow = null;
	this.liveStreamConfigurations = null;
	this.recordedEntryId = null;
}
KalturaLiveEntry.inheritsFrom (KalturaMediaEntry);


/**
 * @param	playlistId	string		Playlist id to be played
 *		 .
 * @param	repeat	int		Indicates that the segments should be repeated for ever
 *		 .
 */
function KalturaLiveChannel(){
	this.playlistId = null;
	this.repeat = null;
}
KalturaLiveChannel.inheritsFrom (KalturaLiveEntry);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaLiveChannelListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaLiveChannelListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	string		Unique identifier
 *		  (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	createdAt	int		Segment creation date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	updatedAt	int		Segment update date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	name	string		Segment name
 *		 .
 * @param	description	string		Segment description
 *		 .
 * @param	tags	string		Segment tags
 *		 .
 * @param	type	string		Segment could be associated with the main stream, as additional stream or as overlay
 *		 .
 * @param	status	string		 (readOnly).
 * @param	channelId	string		Live channel id
 *		 .
 * @param	entryId	string		Entry id to be played
 *		 .
 * @param	triggerType	string		Segment start time trigger type
 *		 .
 * @param	triggerSegmentId	string		Live channel segment that the trigger relates to
 *		 .
 * @param	startTime	float		Segment play start time, in mili-seconds, according to trigger type
 *		 .
 * @param	duration	float		Segment play duration time, in mili-seconds
 *		 .
 */
function KalturaLiveChannelSegment(){
	this.id = null;
	this.partnerId = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.name = null;
	this.description = null;
	this.tags = null;
	this.type = null;
	this.status = null;
	this.channelId = null;
	this.entryId = null;
	this.triggerType = null;
	this.triggerSegmentId = null;
	this.startTime = null;
	this.duration = null;
}
KalturaLiveChannelSegment.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaLiveChannelSegmentListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaLiveChannelSegmentListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	bitrate	int		.
 * @param	width	int		.
 * @param	height	int		.
 * @param	tags	string		.
 */
function KalturaLiveStreamBitrate(){
	this.bitrate = null;
	this.width = null;
	this.height = null;
	this.tags = null;
}
KalturaLiveStreamBitrate.inheritsFrom (KalturaObjectBase);


/**
 * @param	streamRemoteId	string		The stream id as provided by the provider
 *		  (readOnly).
 * @param	streamRemoteBackupId	string		The backup stream id as provided by the provider
 *		  (readOnly).
 * @param	bitrates	array		Array of supported bitrates
 *		 .
 * @param	primaryBroadcastingUrl	string		.
 * @param	secondaryBroadcastingUrl	string		.
 * @param	streamName	string		.
 * @param	streamUrl	string		The stream url
 *		 .
 * @param	hlsStreamUrl	string		HLS URL - URL for live stream playback on mobile device
 *		 .
 * @param	urlManager	string		URL Manager to handle the live stream URL (for instance, add token)
 *		 .
 * @param	encodingIP1	string		The broadcast primary ip
 *		 .
 * @param	encodingIP2	string		The broadcast secondary ip
 *		 .
 * @param	streamPassword	string		The broadcast password
 *		 .
 * @param	streamUsername	string		The broadcast username
 *		  (readOnly).
 */
function KalturaLiveStreamEntry(){
	this.streamRemoteId = null;
	this.streamRemoteBackupId = null;
	this.bitrates = null;
	this.primaryBroadcastingUrl = null;
	this.secondaryBroadcastingUrl = null;
	this.streamName = null;
	this.streamUrl = null;
	this.hlsStreamUrl = null;
	this.urlManager = null;
	this.encodingIP1 = null;
	this.encodingIP2 = null;
	this.streamPassword = null;
	this.streamUsername = null;
}
KalturaLiveStreamEntry.inheritsFrom (KalturaLiveEntry);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaLiveStreamListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaLiveStreamListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	idEqual	string		This filter should be in use for retrieving only a specific entry (identified by its entryId).
 *		 .
 * @param	idIn	string		This filter should be in use for retrieving few specific entries (string should include comma separated list of entryId strings).
 *		 .
 * @param	idNotIn	string		.
 * @param	nameLike	string		This filter should be in use for retrieving specific entries. It should include only one string to search for in entry names (no wildcards, spaces are treated as part of the string).
 *		 .
 * @param	nameMultiLikeOr	string		This filter should be in use for retrieving specific entries. It could include few (comma separated) strings for searching in entry names, while applying an OR logic to retrieve entries that contain at least one input string (no wildcards, spaces are treated as part of the string).
 *		 .
 * @param	nameMultiLikeAnd	string		This filter should be in use for retrieving specific entries. It could include few (comma separated) strings for searching in entry names, while applying an AND logic to retrieve entries that contain all input strings (no wildcards, spaces are treated as part of the string).
 *		 .
 * @param	nameEqual	string		This filter should be in use for retrieving entries with a specific name.
 *		 .
 * @param	partnerIdEqual	int		This filter should be in use for retrieving only entries which were uploaded by/assigned to users of a specific Kaltura Partner (identified by Partner ID).
 *		 .
 * @param	partnerIdIn	string		This filter should be in use for retrieving only entries within Kaltura network which were uploaded by/assigned to users of few Kaltura Partners  (string should include comma separated list of PartnerIDs)
 *		 .
 * @param	userIdEqual	string		This filter parameter should be in use for retrieving only entries, uploaded by/assigned to a specific user (identified by user Id).
 *		 .
 * @param	creatorIdEqual	string		.
 * @param	tagsLike	string		This filter should be in use for retrieving specific entries. It should include only one string to search for in entry tags (no wildcards, spaces are treated as part of the string).
 *		 .
 * @param	tagsMultiLikeOr	string		This filter should be in use for retrieving specific entries. It could include few (comma separated) strings for searching in entry tags, while applying an OR logic to retrieve entries that contain at least one input string (no wildcards, spaces are treated as part of the string).
 *		 .
 * @param	tagsMultiLikeAnd	string		This filter should be in use for retrieving specific entries. It could include few (comma separated) strings for searching in entry tags, while applying an AND logic to retrieve entries that contain all input strings (no wildcards, spaces are treated as part of the string).
 *		 .
 * @param	adminTagsLike	string		This filter should be in use for retrieving specific entries. It should include only one string to search for in entry tags set by an ADMIN user (no wildcards, spaces are treated as part of the string).
 *		 .
 * @param	adminTagsMultiLikeOr	string		This filter should be in use for retrieving specific entries. It could include few (comma separated) strings for searching in entry tags, set by an ADMIN user, while applying an OR logic to retrieve entries that contain at least one input string (no wildcards, spaces are treated as part of the string).
 *		 .
 * @param	adminTagsMultiLikeAnd	string		This filter should be in use for retrieving specific entries. It could include few (comma separated) strings for searching in entry tags, set by an ADMIN user, while applying an AND logic to retrieve entries that contain all input strings (no wildcards, spaces are treated as part of the string).
 *		 .
 * @param	categoriesMatchAnd	string		.
 * @param	categoriesMatchOr	string		All entries within these categories or their child categories.
 *		 .
 * @param	categoriesNotContains	string		.
 * @param	categoriesIdsMatchAnd	string		.
 * @param	categoriesIdsMatchOr	string		All entries of the categories, excluding their child categories.
 *		 To include entries of the child categories, use categoryAncestorIdIn, or categoriesMatchOr.
 *		 .
 * @param	categoriesIdsNotContains	string		.
 * @param	categoriesIdsEmpty	int		.
 * @param	statusEqual	string		This filter should be in use for retrieving only entries, at a specific {.
 * @param	statusNotEqual	string		This filter should be in use for retrieving only entries, not at a specific {.
 * @param	statusIn	string		This filter should be in use for retrieving only entries, at few specific {.
 * @param	statusNotIn	string		This filter should be in use for retrieving only entries, not at few specific {.
 * @param	moderationStatusEqual	int		.
 * @param	moderationStatusNotEqual	int		.
 * @param	moderationStatusIn	string		.
 * @param	moderationStatusNotIn	string		.
 * @param	typeEqual	string		.
 * @param	typeIn	string		This filter should be in use for retrieving entries of few {.
 * @param	createdAtGreaterThanOrEqual	int		This filter parameter should be in use for retrieving only entries which were created at Kaltura system after a specific time/date (standard timestamp format).
 *		 .
 * @param	createdAtLessThanOrEqual	int		This filter parameter should be in use for retrieving only entries which were created at Kaltura system before a specific time/date (standard timestamp format).
 *		 .
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 * @param	totalRankLessThanOrEqual	int		.
 * @param	totalRankGreaterThanOrEqual	int		.
 * @param	groupIdEqual	int		.
 * @param	searchTextMatchAnd	string		This filter should be in use for retrieving specific entries while search match the input string within all of the following metadata attributes: name, description, tags, adminTags.
 *		 .
 * @param	searchTextMatchOr	string		This filter should be in use for retrieving specific entries while search match the input string within at least one of the following metadata attributes: name, description, tags, adminTags.
 *		 .
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
 * @param	referenceIdEqual	string		.
 * @param	referenceIdIn	string		.
 * @param	replacingEntryIdEqual	string		.
 * @param	replacingEntryIdIn	string		.
 * @param	replacedEntryIdEqual	string		.
 * @param	replacedEntryIdIn	string		.
 * @param	replacementStatusEqual	string		.
 * @param	replacementStatusIn	string		.
 * @param	partnerSortValueGreaterThanOrEqual	int		.
 * @param	partnerSortValueLessThanOrEqual	int		.
 * @param	redirectEntryIdEqual	string		.
 * @param	rootEntryIdEqual	string		.
 * @param	rootEntryIdIn	string		.
 * @param	tagsNameMultiLikeOr	string		.
 * @param	tagsAdminTagsMultiLikeOr	string		.
 * @param	tagsAdminTagsNameMultiLikeOr	string		.
 * @param	tagsNameMultiLikeAnd	string		.
 * @param	tagsAdminTagsMultiLikeAnd	string		.
 * @param	tagsAdminTagsNameMultiLikeAnd	string		.
 */
function KalturaBaseEntryBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.idNotIn = null;
	this.nameLike = null;
	this.nameMultiLikeOr = null;
	this.nameMultiLikeAnd = null;
	this.nameEqual = null;
	this.partnerIdEqual = null;
	this.partnerIdIn = null;
	this.userIdEqual = null;
	this.creatorIdEqual = null;
	this.tagsLike = null;
	this.tagsMultiLikeOr = null;
	this.tagsMultiLikeAnd = null;
	this.adminTagsLike = null;
	this.adminTagsMultiLikeOr = null;
	this.adminTagsMultiLikeAnd = null;
	this.categoriesMatchAnd = null;
	this.categoriesMatchOr = null;
	this.categoriesNotContains = null;
	this.categoriesIdsMatchAnd = null;
	this.categoriesIdsMatchOr = null;
	this.categoriesIdsNotContains = null;
	this.categoriesIdsEmpty = null;
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
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
	this.totalRankLessThanOrEqual = null;
	this.totalRankGreaterThanOrEqual = null;
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
	this.referenceIdEqual = null;
	this.referenceIdIn = null;
	this.replacingEntryIdEqual = null;
	this.replacingEntryIdIn = null;
	this.replacedEntryIdEqual = null;
	this.replacedEntryIdIn = null;
	this.replacementStatusEqual = null;
	this.replacementStatusIn = null;
	this.partnerSortValueGreaterThanOrEqual = null;
	this.partnerSortValueLessThanOrEqual = null;
	this.redirectEntryIdEqual = null;
	this.rootEntryIdEqual = null;
	this.rootEntryIdIn = null;
	this.tagsNameMultiLikeOr = null;
	this.tagsAdminTagsMultiLikeOr = null;
	this.tagsAdminTagsNameMultiLikeOr = null;
	this.tagsNameMultiLikeAnd = null;
	this.tagsAdminTagsMultiLikeAnd = null;
	this.tagsAdminTagsNameMultiLikeAnd = null;
}
KalturaBaseEntryBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	freeText	string		.
 * @param	isRoot	int		.
 * @param	categoriesFullNameIn	string		.
 * @param	categoryAncestorIdIn	string		All entries within this categoy or in child categories  
 *		 .
 * @param	redirectFromEntryId	string		The id of the original entry
 *		 .
 */
function KalturaBaseEntryFilter(){
	this.freeText = null;
	this.isRoot = null;
	this.categoriesFullNameIn = null;
	this.categoryAncestorIdIn = null;
	this.redirectFromEntryId = null;
}
KalturaBaseEntryFilter.inheritsFrom (KalturaBaseEntryBaseFilter);


/**
 * @param	lastPlayedAtGreaterThanOrEqual	int		.
 * @param	lastPlayedAtLessThanOrEqual	int		.
 * @param	durationLessThan	int		.
 * @param	durationGreaterThan	int		.
 * @param	durationLessThanOrEqual	int		.
 * @param	durationGreaterThanOrEqual	int		.
 * @param	durationTypeMatchOr	string		.
 */
function KalturaPlayableEntryBaseFilter(){
	this.lastPlayedAtGreaterThanOrEqual = null;
	this.lastPlayedAtLessThanOrEqual = null;
	this.durationLessThan = null;
	this.durationGreaterThan = null;
	this.durationLessThanOrEqual = null;
	this.durationGreaterThanOrEqual = null;
	this.durationTypeMatchOr = null;
}
KalturaPlayableEntryBaseFilter.inheritsFrom (KalturaBaseEntryFilter);


/**
 */
function KalturaPlayableEntryFilter(){
}
KalturaPlayableEntryFilter.inheritsFrom (KalturaPlayableEntryBaseFilter);


/**
 * @param	mediaTypeEqual	int		.
 * @param	mediaTypeIn	string		.
 * @param	mediaDateGreaterThanOrEqual	int		.
 * @param	mediaDateLessThanOrEqual	int		.
 * @param	flavorParamsIdsMatchOr	string		.
 * @param	flavorParamsIdsMatchAnd	string		.
 */
function KalturaMediaEntryBaseFilter(){
	this.mediaTypeEqual = null;
	this.mediaTypeIn = null;
	this.mediaDateGreaterThanOrEqual = null;
	this.mediaDateLessThanOrEqual = null;
	this.flavorParamsIdsMatchOr = null;
	this.flavorParamsIdsMatchAnd = null;
}
KalturaMediaEntryBaseFilter.inheritsFrom (KalturaPlayableEntryFilter);


/**
 */
function KalturaMediaEntryFilter(){
}
KalturaMediaEntryFilter.inheritsFrom (KalturaMediaEntryBaseFilter);


/**
 * @param	limit	int		.
 */
function KalturaMediaEntryFilterForPlaylist(){
	this.limit = null;
}
KalturaMediaEntryFilterForPlaylist.inheritsFrom (KalturaMediaEntryFilter);


/**
 * @param	id	int		The id of the media info
 *		  (readOnly).
 * @param	flavorAssetId	string		The id of the related flavor asset
 *		 .
 * @param	fileSize	int		The file size
 *		 .
 * @param	containerFormat	string		The container format
 *		 .
 * @param	containerId	string		The container id
 *		 .
 * @param	containerProfile	string		The container profile
 *		 .
 * @param	containerDuration	int		The container duration
 *		 .
 * @param	containerBitRate	int		The container bit rate
 *		 .
 * @param	videoFormat	string		The video format
 *		 .
 * @param	videoCodecId	string		The video codec id
 *		 .
 * @param	videoDuration	int		The video duration
 *		 .
 * @param	videoBitRate	int		The video bit rate
 *		 .
 * @param	videoBitRateMode	int		The video bit rate mode
 *		 .
 * @param	videoWidth	int		The video width
 *		 .
 * @param	videoHeight	int		The video height
 *		 .
 * @param	videoFrameRate	float		The video frame rate
 *		 .
 * @param	videoDar	float		The video display aspect ratio (dar)
 *		 .
 * @param	videoRotation	int		.
 * @param	audioFormat	string		The audio format
 *		 .
 * @param	audioCodecId	string		The audio codec id
 *		 .
 * @param	audioDuration	int		The audio duration
 *		 .
 * @param	audioBitRate	int		The audio bit rate
 *		 .
 * @param	audioBitRateMode	int		The audio bit rate mode
 *		 .
 * @param	audioChannels	int		The number of audio channels
 *		 .
 * @param	audioSamplingRate	int		The audio sampling rate
 *		 .
 * @param	audioResolution	int		The audio resolution
 *		 .
 * @param	writingLib	string		The writing library
 *		 .
 * @param	rawData	string		The data as returned by the mediainfo command line
 *		 .
 * @param	multiStreamInfo	string		.
 * @param	scanType	int		.
 * @param	multiStream	string		.
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
	this.multiStreamInfo = null;
	this.scanType = null;
	this.multiStream = null;
}
KalturaMediaInfo.inheritsFrom (KalturaObjectBase);


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
 * @param	id	int		Unique identifier
 *		  (readOnly).
 * @param	dc	int		Server data center id
 *		  (readOnly).
 * @param	hostname	string		Server host name
 *		  (readOnly).
 * @param	createdAt	int		Server first registration date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	updatedAt	int		Server last update date as Unix timestamp (In seconds)
 *		  (readOnly).
 */
function KalturaMediaServer(){
	this.id = null;
	this.dc = null;
	this.hostname = null;
	this.createdAt = null;
	this.updatedAt = null;
}
KalturaMediaServer.inheritsFrom (KalturaObjectBase);


/**
 */
function KalturaMediaServerStatus(){
}
KalturaMediaServerStatus.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		 (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	metadataProfileId	int		 (readOnly).
 * @param	metadataProfileVersion	int		 (readOnly).
 * @param	metadataObjectType	string		 (readOnly).
 * @param	objectId	string		 (readOnly).
 * @param	version	int		 (readOnly).
 * @param	createdAt	int		 (readOnly).
 * @param	updatedAt	int		 (readOnly).
 * @param	status	int		 (readOnly).
 * @param	xml	string		 (readOnly).
 */
function KalturaMetadata(){
	this.id = null;
	this.partnerId = null;
	this.metadataProfileId = null;
	this.metadataProfileVersion = null;
	this.metadataObjectType = null;
	this.objectId = null;
	this.version = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.status = null;
	this.xml = null;
}
KalturaMetadata.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaMetadataListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaMetadataListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		 (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	metadataObjectType	string		.
 * @param	version	int		 (readOnly).
 * @param	name	string		.
 * @param	systemName	string		.
 * @param	description	string		.
 * @param	createdAt	int		 (readOnly).
 * @param	updatedAt	int		 (readOnly).
 * @param	status	int		 (readOnly).
 * @param	xsd	string		 (readOnly).
 * @param	views	string		 (readOnly).
 * @param	xslt	string		 (readOnly).
 * @param	createMode	int		.
 */
function KalturaMetadataProfile(){
	this.id = null;
	this.partnerId = null;
	this.metadataObjectType = null;
	this.version = null;
	this.name = null;
	this.systemName = null;
	this.description = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.status = null;
	this.xsd = null;
	this.views = null;
	this.xslt = null;
	this.createMode = null;
}
KalturaMetadataProfile.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		 (readOnly).
 * @param	xPath	string		 (readOnly).
 * @param	key	string		 (readOnly).
 * @param	label	string		 (readOnly).
 */
function KalturaMetadataProfileField(){
	this.id = null;
	this.xPath = null;
	this.key = null;
	this.label = null;
}
KalturaMetadataProfileField.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaMetadataProfileFieldListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaMetadataProfileFieldListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaMetadataProfileListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaMetadataProfileListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	hasRealThumbnail	bool		Indicates whether the user has submited a real thumbnail to the mix (Not the one that was generated automaticaly)
 *		  (readOnly).
 * @param	editorType	int		The editor type used to edit the metadata
 *		 .
 * @param	dataContent	string		The xml data of the mix
 *		 .
 */
function KalturaMixEntry(){
	this.hasRealThumbnail = null;
	this.editorType = null;
	this.dataContent = null;
}
KalturaMixEntry.inheritsFrom (KalturaPlayableEntry);


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
 * @param	id	int		Moderation flag id
 *		  (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	userId	string		The user id that added the moderation flag
 *		  (readOnly).
 * @param	moderationObjectType	string		The type of the moderation flag (entry or user)
 *		  (readOnly).
 * @param	flaggedEntryId	string		If moderation flag is set for entry, this is the flagged entry id
 *		 .
 * @param	flaggedUserId	string		If moderation flag is set for user, this is the flagged user id
 *		 .
 * @param	status	string		The moderation flag status
 *		  (readOnly).
 * @param	comments	string		The comment that was added to the flag
 *		 .
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
 * @param	id	string		.
 * @param	label	string		.
 * @param	flashvars	array		.
 * @param	minVersion	string		.
 */
function KalturaPlayerDeliveryType(){
	this.id = null;
	this.label = null;
	this.flashvars = null;
	this.minVersion = null;
}
KalturaPlayerDeliveryType.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	string		.
 * @param	label	string		.
 * @param	entryOnly	bool		.
 * @param	minVersion	string		.
 */
function KalturaPlayerEmbedCodeType(){
	this.id = null;
	this.label = null;
	this.entryOnly = null;
	this.minVersion = null;
}
KalturaPlayerEmbedCodeType.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		 (readOnly).
 * @param	name	string		.
 * @param	website	string		.
 * @param	notificationUrl	string		.
 * @param	appearInSearch	int		.
 * @param	createdAt	int		 (readOnly).
 * @param	adminName	string		deprecated - lastName and firstName replaces this field
 *		 .
 * @param	adminEmail	string		.
 * @param	description	string		.
 * @param	commercialUse	int		.
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
 * @param	allowMultiNotification	int		.
 * @param	adminLoginUsersQuota	int		 (readOnly).
 * @param	adminUserId	string		.
 * @param	firstName	string		firstName and lastName replace the old (deprecated) adminName
 *		 .
 * @param	lastName	string		lastName and firstName replace the old (deprecated) adminName
 *		 .
 * @param	country	string		country code (2char) - this field is optional
 *		 .
 * @param	state	string		state code (2char) - this field is optional
 *		 .
 * @param	additionalParams	array		 (insertOnly).
 * @param	publishersQuota	int		 (readOnly).
 * @param	partnerGroupType	int		 (readOnly).
 * @param	defaultEntitlementEnforcement	bool		 (readOnly).
 * @param	defaultDeliveryType	string		 (readOnly).
 * @param	defaultEmbedCodeType	string		 (readOnly).
 * @param	deliveryTypes	array		 (readOnly).
 * @param	embedCodeTypes	array		 (readOnly).
 * @param	templatePartnerId	int		 (readOnly).
 * @param	ignoreSeoLinks	bool		 (readOnly).
 * @param	host	string		 (readOnly).
 * @param	cdnHost	string		 (readOnly).
 * @param	rtmpUrl	string		 (readOnly).
 * @param	isFirstLogin	bool		 (readOnly).
 * @param	logoutUrl	string		 (readOnly).
 * @param	partnerParentId	int		 (readOnly).
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
	this.adminLoginUsersQuota = null;
	this.adminUserId = null;
	this.firstName = null;
	this.lastName = null;
	this.country = null;
	this.state = null;
	this.additionalParams = null;
	this.publishersQuota = null;
	this.partnerGroupType = null;
	this.defaultEntitlementEnforcement = null;
	this.defaultDeliveryType = null;
	this.defaultEmbedCodeType = null;
	this.deliveryTypes = null;
	this.embedCodeTypes = null;
	this.templatePartnerId = null;
	this.ignoreSeoLinks = null;
	this.host = null;
	this.cdnHost = null;
	this.rtmpUrl = null;
	this.isFirstLogin = null;
	this.logoutUrl = null;
	this.partnerParentId = null;
}
KalturaPartner.inheritsFrom (KalturaObjectBase);


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
 * @param	packageBandwidthAndStorage	int		Package total allowed bandwidth and storage
 *		  (readOnly).
 * @param	hosting	float		Partner total hosting in GB on the disk
 *		  (readOnly).
 * @param	bandwidth	float		Partner total bandwidth in GB
 *		  (readOnly).
 * @param	usage	int		total usage in GB - including bandwidth and storage
 *		  (readOnly).
 * @param	usagePercent	float		Percent of usage out of partner's package. if usage is 5GB and package is 10GB, this value will be 50
 *		  (readOnly).
 * @param	reachedLimitDate	int		date when partner reached the limit of his package (timestamp)
 *		  (readOnly).
 */
function KalturaPartnerStatistics(){
	this.packageBandwidthAndStorage = null;
	this.hosting = null;
	this.bandwidth = null;
	this.usage = null;
	this.usagePercent = null;
	this.reachedLimitDate = null;
}
KalturaPartnerStatistics.inheritsFrom (KalturaObjectBase);


/**
 * @param	hostingGB	float		Partner total hosting in GB on the disk
 *		  (readOnly).
 * @param	Percent	float		percent of usage out of partner's package. if usageGB is 5 and package is 10GB, this value will be 50
 *		  (readOnly).
 * @param	packageBW	int		package total BW - actually this is usage, which represents BW+storage
 *		  (readOnly).
 * @param	usageGB	float		total usage in GB - including bandwidth and storage
 *		  (readOnly).
 * @param	reachedLimitDate	int		date when partner reached the limit of his package (timestamp)
 *		  (readOnly).
 * @param	usageGraph	string		a semi-colon separated list of comma-separated key-values to represent a usage graph.
 *		 keys could be 1-12 for a year view (1,1.2;2,1.1;3,0.9;...;12,1.4;)
 *		 keys could be 1-[28,29,30,31] depending on the requested month, for a daily view in a given month (1,0.4;2,0.2;...;31,0.1;)
 *		  (readOnly).
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
 * @param	partnerId	int		Partner ID
 *		 .
 * @param	partnerName	string		Partner name
 *		 .
 * @param	partnerStatus	int		Partner status
 *		 .
 * @param	partnerPackage	int		Partner package
 *		 .
 * @param	partnerCreatedAt	int		Partner creation date (Unix timestamp)
 *		 .
 * @param	views	int		Number of player loads in the specific date range
 *		 .
 * @param	plays	int		Number of plays in the specific date range
 *		 .
 * @param	entriesCount	int		Number of new entries created during specific date range
 *		 .
 * @param	totalEntriesCount	int		Total number of entries
 *		 .
 * @param	videoEntriesCount	int		Number of new video entries created during specific date range
 *		 .
 * @param	imageEntriesCount	int		Number of new image entries created during specific date range
 *		 .
 * @param	audioEntriesCount	int		Number of new audio entries created during specific date range
 *		 .
 * @param	mixEntriesCount	int		Number of new mix entries created during specific date range
 *		 .
 * @param	bandwidth	float		The total bandwidth usage during the given date range (in MB)
 *		 .
 * @param	totalStorage	float		The total storage consumption (in MB)
 *		 .
 * @param	storage	float		The added storage consumption (new uploads) during the given date range (in MB)
 *		 .
 * @param	deletedStorage	float		The deleted storage consumption (new uploads) during the given date range (in MB)
 *		 .
 * @param	peakStorage	float		The peak amount of storage consumption during the given date range for the specific publisher
 *		 .
 * @param	avgStorage	float		The average amount of storage consumption during the given date range for the specific publisher
 *		 .
 * @param	combinedStorageBandwidth	float		The combined amount of bandwidth and storage consumed during the given date range for the specific publisher
 *		 .
 * @param	transcodingUsage	float		Amount of transcoding usage in MB
 *		 .
 * @param	dateId	string		TGhe date at which the report was taken - Unix Timestamp
 *		 .
 */
function KalturaVarPartnerUsageItem(){
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
	this.deletedStorage = null;
	this.peakStorage = null;
	this.avgStorage = null;
	this.combinedStorageBandwidth = null;
	this.transcodingUsage = null;
	this.dateId = null;
}
KalturaVarPartnerUsageItem.inheritsFrom (KalturaObjectBase);


/**
 * @param	total	KalturaVarPartnerUsageItem		.
 * @param	objects	array		.
 * @param	totalCount	int		.
 */
function KalturaPartnerUsageListResponse(){
	this.total = null;
	this.objects = null;
	this.totalCount = null;
}
KalturaPartnerUsageListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		 (readOnly).
 * @param	type	int		 (readOnly).
 * @param	name	string		.
 * @param	friendlyName	string		.
 * @param	description	string		.
 * @param	status	int		.
 * @param	partnerId	int		 (readOnly).
 * @param	dependsOnPermissionNames	string		.
 * @param	tags	string		.
 * @param	permissionItemsIds	string		.
 * @param	createdAt	int		 (readOnly).
 * @param	updatedAt	int		 (readOnly).
 * @param	partnerGroup	string		.
 */
function KalturaPermission(){
	this.id = null;
	this.type = null;
	this.name = null;
	this.friendlyName = null;
	this.description = null;
	this.status = null;
	this.partnerId = null;
	this.dependsOnPermissionNames = null;
	this.tags = null;
	this.permissionItemsIds = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.partnerGroup = null;
}
KalturaPermission.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		 (readOnly).
 * @param	type	string		 (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	tags	string		.
 * @param	createdAt	int		 (readOnly).
 * @param	updatedAt	int		 (readOnly).
 */
function KalturaPermissionItem(){
	this.id = null;
	this.type = null;
	this.partnerId = null;
	this.tags = null;
	this.createdAt = null;
	this.updatedAt = null;
}
KalturaPermissionItem.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaPermissionItemListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaPermissionItemListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaPermissionListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaPermissionListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	playlistContent	string		Content of the playlist - 
 *		 XML if the playlistType is dynamic 
 *		 text if the playlistType is static 
 *		 url if the playlistType is mRss 
 *		 .
 * @param	filters	array		.
 * @param	totalResults	int		Maximum count of results to be returned in playlist execution
 *		 .
 * @param	playlistType	int		Type of playlist
 *		 .
 * @param	plays	int		Number of plays
 *		  (readOnly).
 * @param	views	int		Number of views
 *		  (readOnly).
 * @param	duration	int		The duration in seconds
 *		  (readOnly).
 * @param	executeUrl	string		The url for this playlist
 *		  (readOnly).
 */
function KalturaPlaylist(){
	this.playlistContent = null;
	this.filters = null;
	this.totalResults = null;
	this.playlistType = null;
	this.plays = null;
	this.views = null;
	this.duration = null;
	this.executeUrl = null;
}
KalturaPlaylist.inheritsFrom (KalturaBaseEntry);


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
 * @param	storageProfileId	int		 (readOnly).
 * @param	uri	string		 (readOnly).
 */
function KalturaRemotePath(){
	this.storageProfileId = null;
	this.uri = null;
}
KalturaRemotePath.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaRemotePathListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaRemotePathListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	url	string		Remote URL, FTP, HTTP or HTTPS 
 *		 .
 */
function KalturaUrlResource(){
	this.url = null;
}
KalturaUrlResource.inheritsFrom (KalturaContentResource);


/**
 * @param	storageProfileId	int		ID of storage profile to be associated with the created file sync, used for file serving URL composing. 
 *		 .
 */
function KalturaRemoteStorageResource(){
	this.storageProfileId = null;
}
KalturaRemoteStorageResource.inheritsFrom (KalturaUrlResource);


/**
 * @param	id	string		.
 * @param	data	string		.
 */
function KalturaReportBaseTotal(){
	this.id = null;
	this.data = null;
}
KalturaReportBaseTotal.inheritsFrom (KalturaObjectBase);


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
 * @param	fromDate	int		Start date as Unix timestamp (In seconds)
 *		 .
 * @param	toDate	int		End date as Unix timestamp (In seconds)
 *		 .
 * @param	fromDay	string		Start day as string (YYYYMMDD)
 *		 .
 * @param	toDay	string		End date as string (YYYYMMDD)
 *		 .
 */
function KalturaReportInputBaseFilter(){
	this.fromDate = null;
	this.toDate = null;
	this.fromDay = null;
	this.toDay = null;
}
KalturaReportInputBaseFilter.inheritsFrom (KalturaObjectBase);


/**
 * @param	columns	string		.
 * @param	results	array		.
 */
function KalturaReportResponse(){
	this.columns = null;
	this.results = null;
}
KalturaReportResponse.inheritsFrom (KalturaObjectBase);


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
 *		 For example - if you set this field to "mymovies_$partner_id"
 *		 The $partner_id will be automatically replcaed with your real partner Id
 *		 .
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
 * @param	authData	string		The authentication data that further should be used for search
 *		 .
 * @param	loginUrl	string		Login URL when user need to sign-in and authorize the search
 *		 .
 * @param	message	string		Information when there was an error
 *		 .
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
 * @param	fileExt	string		.
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
	this.fileExt = null;
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
 * @param	ks	string		 (readOnly).
 * @param	sessionType	int		 (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	userId	string		 (readOnly).
 * @param	expiry	int		 (readOnly).
 * @param	privileges	string		 (readOnly).
 */
function KalturaSessionInfo(){
	this.ks = null;
	this.sessionType = null;
	this.partnerId = null;
	this.userId = null;
	this.expiry = null;
	this.privileges = null;
}
KalturaSessionInfo.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		 (readOnly).
 * @param	createdAt	int		 (readOnly).
 * @param	updatedAt	int		 (readOnly).
 * @param	expiresAt	int		.
 * @param	partnerId	int		 (readOnly).
 * @param	userId	string		.
 * @param	name	string		.
 * @param	systemName	string		.
 * @param	fullUrl	string		.
 * @param	status	int		.
 */
function KalturaShortLink(){
	this.id = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.expiresAt = null;
	this.partnerId = null;
	this.userId = null;
	this.name = null;
	this.systemName = null;
	this.fullUrl = null;
	this.status = null;
}
KalturaShortLink.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaShortLinkListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaShortLinkListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	fileSyncLocalPath	string		.
 * @param	actualFileSyncLocalPath	string		The translated path as used by the scheduler
 *		 .
 * @param	fileSyncRemoteUrl	string		.
 * @param	assetId	string		.
 * @param	assetParamsId	int		.
 */
function KalturaSourceFileSyncDescriptor(){
	this.fileSyncLocalPath = null;
	this.actualFileSyncLocalPath = null;
	this.fileSyncRemoteUrl = null;
	this.assetId = null;
	this.assetParamsId = null;
}
KalturaSourceFileSyncDescriptor.inheritsFrom (KalturaObjectBase);


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
 * @param	eventTimestamp	float		the client's timestamp of this event
 *		 .
 * @param	sessionId	string		a unique string generated by the client that will represent the client-side session: the primary component will pass it on to other components that sprout from it
 *		 .
 * @param	partnerId	int		.
 * @param	entryId	string		.
 * @param	uniqueViewer	string		the UV cookie - creates in the operational system and should be passed on ofr every event 
 *		 .
 * @param	widgetId	string		.
 * @param	uiconfId	int		.
 * @param	userId	string		the partner's user id 
 *		 .
 * @param	currentPoint	int		the timestamp along the video when the event happend 
 *		 .
 * @param	duration	int		the duration of the video in milliseconds - will make it much faster than quering the db for each entry 
 *		 .
 * @param	userIp	string		will be retrieved from the request of the user 
 *		  (readOnly).
 * @param	processDuration	int		the time in milliseconds the event took
 *		 .
 * @param	controlId	string		the id of the GUI control - will be used in the future to better understand what the user clicked
 *		 .
 * @param	seek	bool		true if the user ever used seek in this session 
 *		 .
 * @param	newPoint	int		timestamp of the new point on the timeline of the video after the user seeks 
 *		 .
 * @param	referrer	string		the referrer of the client
 *		 .
 * @param	isFirstInSession	bool		will indicate if the event is thrown for the first video in the session
 *		 .
 * @param	applicationId	string		kaltura application name 
 *		 .
 * @param	contextId	int		.
 * @param	featureType	int		.
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
	this.applicationId = null;
	this.contextId = null;
	this.featureType = null;
}
KalturaStatsEvent.inheritsFrom (KalturaObjectBase);


/**
 * @param	clientVer	string		.
 * @param	kmcEventActionPath	string		.
 * @param	kmcEventType	int		.
 * @param	eventTimestamp	float		the client's timestamp of this event
 *		 .
 * @param	sessionId	string		a unique string generated by the client that will represent the client-side session: the primary component will pass it on to other components that sprout from it
 *		 .
 * @param	partnerId	int		.
 * @param	entryId	string		.
 * @param	widgetId	string		.
 * @param	uiconfId	int		.
 * @param	userId	string		the partner's user id 
 *		 .
 * @param	userIp	string		will be retrieved from the request of the user 
 *		  (readOnly).
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
 * @param	id	int		 (readOnly).
 * @param	createdAt	int		 (readOnly).
 * @param	updatedAt	int		 (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	name	string		.
 * @param	systemName	string		.
 * @param	desciption	string		.
 * @param	status	int		.
 * @param	protocol	string		.
 * @param	storageUrl	string		.
 * @param	storageBaseDir	string		.
 * @param	storageUsername	string		.
 * @param	storagePassword	string		.
 * @param	storageFtpPassiveMode	bool		.
 * @param	deliveryHttpBaseUrl	string		.
 * @param	deliveryHttpsBaseUrl	string		.
 * @param	deliveryRmpBaseUrl	string		.
 * @param	deliveryIisBaseUrl	string		.
 * @param	minFileSize	int		.
 * @param	maxFileSize	int		.
 * @param	flavorParamsIds	string		.
 * @param	maxConcurrentConnections	int		.
 * @param	pathManagerClass	string		.
 * @param	pathManagerParams	array		.
 * @param	urlManagerClass	string		.
 * @param	urlManagerParams	array		.
 * @param	trigger	int		No need to create enum for temp field
 *		 .
 * @param	deliveryPriority	int		Delivery Priority
 *		 .
 * @param	deliveryStatus	int		.
 * @param	rtmpPrefix	string		.
 * @param	readyBehavior	int		.
 * @param	allowAutoDelete	int		Flag sugnifying that the storage exported content should be deleted when soure entry is deleted
 *		 .
 * @param	createFileLink	bool		Indicates to the local file transfer manager to create a link to the file instead of copying it
 *		 .
 * @param	rules	array		Holds storage profile export rules
 *		 .
 */
function KalturaStorageProfile(){
	this.id = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.partnerId = null;
	this.name = null;
	this.systemName = null;
	this.desciption = null;
	this.status = null;
	this.protocol = null;
	this.storageUrl = null;
	this.storageBaseDir = null;
	this.storageUsername = null;
	this.storagePassword = null;
	this.storageFtpPassiveMode = null;
	this.deliveryHttpBaseUrl = null;
	this.deliveryHttpsBaseUrl = null;
	this.deliveryRmpBaseUrl = null;
	this.deliveryIisBaseUrl = null;
	this.minFileSize = null;
	this.maxFileSize = null;
	this.flavorParamsIds = null;
	this.maxConcurrentConnections = null;
	this.pathManagerClass = null;
	this.pathManagerParams = null;
	this.urlManagerClass = null;
	this.urlManagerParams = null;
	this.trigger = null;
	this.deliveryPriority = null;
	this.deliveryStatus = null;
	this.rtmpPrefix = null;
	this.readyBehavior = null;
	this.allowAutoDelete = null;
	this.createFileLink = null;
	this.rules = null;
}
KalturaStorageProfile.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaStorageProfileListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaStorageProfileListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	totalEntryCount	int		the total count of entries that should appear in the feed without flavor filtering
 *		 .
 * @param	actualEntryCount	int		count of entries that will appear in the feed (including all relevant filters)
 *		 .
 * @param	requireTranscodingCount	int		count of entries that requires transcoding in order to be included in feed
 *		 .
 */
function KalturaSyndicationFeedEntryCount(){
	this.totalEntryCount = null;
	this.actualEntryCount = null;
	this.requireTranscodingCount = null;
}
KalturaSyndicationFeedEntryCount.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		 (readOnly).
 * @param	tag	string		 (readOnly).
 * @param	taggedObjectType	string		 (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	instanceCount	int		 (readOnly).
 * @param	createdAt	int		 (readOnly).
 * @param	updatedAt	int		 (readOnly).
 */
function KalturaTag(){
	this.id = null;
	this.tag = null;
	this.taggedObjectType = null;
	this.partnerId = null;
	this.instanceCount = null;
	this.createdAt = null;
	this.updatedAt = null;
}
KalturaTag.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaTagListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaTagListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	thumbParamsId	int		The Flavor Params used to create this Flavor Asset
 *		  (insertOnly).
 * @param	width	int		The width of the Flavor Asset 
 *		  (readOnly).
 * @param	height	int		The height of the Flavor Asset
 *		  (readOnly).
 * @param	status	int		The status of the asset
 *		  (readOnly).
 */
function KalturaThumbAsset(){
	this.thumbParamsId = null;
	this.width = null;
	this.height = null;
	this.status = null;
}
KalturaThumbAsset.inheritsFrom (KalturaAsset);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaThumbAssetListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaThumbAssetListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	cropType	int		.
 * @param	quality	int		.
 * @param	cropX	int		.
 * @param	cropY	int		.
 * @param	cropWidth	int		.
 * @param	cropHeight	int		.
 * @param	videoOffset	float		.
 * @param	width	int		.
 * @param	height	int		.
 * @param	scaleWidth	float		.
 * @param	scaleHeight	float		.
 * @param	backgroundColor	string		Hexadecimal value
 *		 .
 * @param	sourceParamsId	int		Id of the flavor params or the thumbnail params to be used as source for the thumbnail creation
 *		 .
 * @param	format	string		The container format of the Flavor Params
 *		 .
 * @param	density	int		The image density (dpi) for example: 72 or 96
 *		 .
 * @param	stripProfiles	bool		Strip profiles and comments
 *		 .
 */
function KalturaThumbParams(){
	this.cropType = null;
	this.quality = null;
	this.cropX = null;
	this.cropY = null;
	this.cropWidth = null;
	this.cropHeight = null;
	this.videoOffset = null;
	this.width = null;
	this.height = null;
	this.scaleWidth = null;
	this.scaleHeight = null;
	this.backgroundColor = null;
	this.sourceParamsId = null;
	this.format = null;
	this.density = null;
	this.stripProfiles = null;
}
KalturaThumbParams.inheritsFrom (KalturaAssetParams);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaThumbParamsListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaThumbParamsListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	thumbParamsId	int		.
 * @param	thumbParamsVersion	string		.
 * @param	thumbAssetId	string		.
 * @param	thumbAssetVersion	string		.
 * @param	rotate	int		.
 */
function KalturaThumbParamsOutput(){
	this.thumbParamsId = null;
	this.thumbParamsVersion = null;
	this.thumbAssetId = null;
	this.thumbAssetVersion = null;
	this.rotate = null;
}
KalturaThumbParamsOutput.inheritsFrom (KalturaThumbParams);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaThumbParamsOutputListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaThumbParamsOutputListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	download	bool		.
 */
function KalturaThumbnailServeOptions(){
	this.download = null;
}
KalturaThumbnailServeOptions.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		 (readOnly).
 * @param	name	string		Name of the uiConf, this is not a primary key
 *		 .
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
 * @param	config	string		.
 * @param	confVars	string		.
 * @param	useCdn	bool		.
 * @param	tags	string		.
 * @param	swfUrlVersion	string		.
 * @param	createdAt	int		Entry creation date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	updatedAt	int		Entry creation date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	creationMode	int		.
 * @param	html5Url	string		.
 * @param	version	string		UiConf version
 *		  (readOnly).
 * @param	partnerTags	string		.
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
	this.config = null;
	this.confVars = null;
	this.useCdn = null;
	this.tags = null;
	this.swfUrlVersion = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.creationMode = null;
	this.html5Url = null;
	this.version = null;
	this.partnerTags = null;
}
KalturaUiConf.inheritsFrom (KalturaObjectBase);


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
 * @param	type	int		UiConf Type
 *		 .
 * @param	versions	array		Available versions
 *	     .
 * @param	directory	string		The direcotry this type is saved at
 *	     .
 * @param	filename	string		Filename for this UiConf type
 *	     .
 */
function KalturaUiConfTypeInfo(){
	this.type = null;
	this.versions = null;
	this.directory = null;
	this.filename = null;
}
KalturaUiConfTypeInfo.inheritsFrom (KalturaObjectBase);


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
 * @param	id	string		Upload token unique ID
 *		  (readOnly).
 * @param	partnerId	int		Partner ID of the upload token
 *		  (readOnly).
 * @param	userId	string		User id for the upload token
 *		  (readOnly).
 * @param	status	int		Status of the upload token
 *		  (readOnly).
 * @param	fileName	string		Name of the file for the upload token, can be empty when the upload token is created and will be updated internally after the file is uploaded
 *		  (insertOnly).
 * @param	fileSize	float		File size in bytes, can be empty when the upload token is created and will be updated internally after the file is uploaded
 *		  (insertOnly).
 * @param	uploadedFileSize	float		Uploaded file size in bytes, can be used to identify how many bytes were uploaded before resuming
 *		  (readOnly).
 * @param	createdAt	int		Creation date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	updatedAt	int		Last update date as Unix timestamp (In seconds)
 *		  (readOnly).
 */
function KalturaUploadToken(){
	this.id = null;
	this.partnerId = null;
	this.userId = null;
	this.status = null;
	this.fileName = null;
	this.fileSize = null;
	this.uploadedFileSize = null;
	this.createdAt = null;
	this.updatedAt = null;
}
KalturaUploadToken.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaUploadTokenListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaUploadTokenListResponse.inheritsFrom (KalturaObjectBase);


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
 * @param	adminTags	string		Admin tags can be updated only by using an admin session
 *		 .
 * @param	gender	int		.
 * @param	status	int		.
 * @param	createdAt	int		Creation date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	updatedAt	int		Last update date as Unix timestamp (In seconds)
 *		  (readOnly).
 * @param	partnerData	string		Can be used to store various partner related data as a string 
 *		 .
 * @param	indexedPartnerDataInt	int		.
 * @param	indexedPartnerDataString	string		.
 * @param	storageSize	int		 (readOnly).
 * @param	password	string		 (insertOnly).
 * @param	firstName	string		.
 * @param	lastName	string		.
 * @param	isAdmin	bool		.
 * @param	language	string		.
 * @param	lastLoginTime	int		 (readOnly).
 * @param	statusUpdatedAt	int		 (readOnly).
 * @param	deletedAt	int		 (readOnly).
 * @param	loginEnabled	bool		 (readOnly).
 * @param	roleIds	string		.
 * @param	roleNames	string		 (readOnly).
 * @param	isAccountOwner	bool		 (readOnly).
 * @param	allowedPartnerIds	string		.
 * @param	allowedPartnerPackages	string		.
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
	this.password = null;
	this.firstName = null;
	this.lastName = null;
	this.isAdmin = null;
	this.language = null;
	this.lastLoginTime = null;
	this.statusUpdatedAt = null;
	this.deletedAt = null;
	this.loginEnabled = null;
	this.roleIds = null;
	this.roleNames = null;
	this.isAccountOwner = null;
	this.allowedPartnerIds = null;
	this.allowedPartnerPackages = null;
}
KalturaUser.inheritsFrom (KalturaObjectBase);


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
 * @param	id	int		 (readOnly).
 * @param	name	string		.
 * @param	systemName	string		.
 * @param	description	string		.
 * @param	status	int		.
 * @param	partnerId	int		 (readOnly).
 * @param	permissionNames	string		.
 * @param	tags	string		.
 * @param	createdAt	int		 (readOnly).
 * @param	updatedAt	int		 (readOnly).
 */
function KalturaUserRole(){
	this.id = null;
	this.name = null;
	this.systemName = null;
	this.description = null;
	this.status = null;
	this.partnerId = null;
	this.permissionNames = null;
	this.tags = null;
	this.createdAt = null;
	this.updatedAt = null;
}
KalturaUserRole.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaUserRoleListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaUserRoleListResponse.inheritsFrom (KalturaObjectBase);


/**
 * @param	id	int		 (readOnly).
 * @param	createdAt	int		 (readOnly).
 * @param	updatedAt	int		 (readOnly).
 * @param	partnerId	int		 (readOnly).
 * @param	name	string		.
 * @param	status	int		.
 * @param	engineType	string		.
 * @param	entryFilter	KalturaBaseEntryFilter		.
 * @param	actionIfInfected	int		.
 */
function KalturaVirusScanProfile(){
	this.id = null;
	this.createdAt = null;
	this.updatedAt = null;
	this.partnerId = null;
	this.name = null;
	this.status = null;
	this.engineType = null;
	this.entryFilter = null;
	this.actionIfInfected = null;
}
KalturaVirusScanProfile.inheritsFrom (KalturaObjectBase);


/**
 * @param	objects	array		 (readOnly).
 * @param	totalCount	int		 (readOnly).
 */
function KalturaVirusScanProfileListResponse(){
	this.objects = null;
	this.totalCount = null;
}
KalturaVirusScanProfileListResponse.inheritsFrom (KalturaObjectBase);


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
 * @param	partnerData	string		Can be used to store various partner related data as a string 
 *		 .
 * @param	widgetHTML	string		 (readOnly).
 * @param	enforceEntitlement	bool		Should enforce entitlement on feed entries
 *		 .
 * @param	privacyContext	string		Set privacy context for search entries that assiged to private and public categories within a category privacy context.
 *		 .
 * @param	addEmbedHtml5Support	bool		Addes the HTML5 script line to the widget's embed code
 *		 .
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
	this.enforceEntitlement = null;
	this.privacyContext = null;
	this.addEmbedHtml5Support = null;
}
KalturaWidget.inheritsFrom (KalturaObjectBase);


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
 */
function KalturaABCScreenersWatermarkCondition(){
}
KalturaABCScreenersWatermarkCondition.inheritsFrom (KalturaCondition);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	systemNameEqual	string		.
 * @param	systemNameIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 */
function KalturaAccessControlBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.systemNameEqual = null;
	this.systemNameIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
}
KalturaAccessControlBaseFilter.inheritsFrom (KalturaFilter);


/**
 */
function KalturaAccessControlBlockAction(){
}
KalturaAccessControlBlockAction.inheritsFrom (KalturaRuleAction);


/**
 * @param	flavorParamsIds	string		Comma separated list of flavor ids 
 *		 .
 * @param	isBlockedList	bool		.
 */
function KalturaAccessControlLimitFlavorsAction(){
	this.flavorParamsIds = null;
	this.isBlockedList = null;
}
KalturaAccessControlLimitFlavorsAction.inheritsFrom (KalturaRuleAction);


/**
 * @param	limit	int		.
 */
function KalturaAccessControlPreviewAction(){
	this.limit = null;
}
KalturaAccessControlPreviewAction.inheritsFrom (KalturaRuleAction);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	systemNameEqual	string		.
 * @param	systemNameIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 */
function KalturaAccessControlProfileBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.systemNameEqual = null;
	this.systemNameIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
}
KalturaAccessControlProfileBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	protocolType	string		 (insertOnly).
 * @param	sourceUrl	string		.
 * @param	adType	string		.
 * @param	title	string		.
 * @param	endTime	int		.
 * @param	duration	int		Duration in milliseconds
 *		  (readOnly).
 */
function KalturaAdCuePoint(){
	this.protocolType = null;
	this.sourceUrl = null;
	this.adType = null;
	this.title = null;
	this.endTime = null;
	this.duration = null;
}
KalturaAdCuePoint.inheritsFrom (KalturaCuePoint);


/**
 */
function KalturaAdminUser(){
}
KalturaAdminUser.inheritsFrom (KalturaUser);


/**
 * @param	filesPermissionInS3	string		.
 */
function KalturaAmazonS3StorageProfile(){
	this.filesPermissionInS3 = null;
}
KalturaAmazonS3StorageProfile.inheritsFrom (KalturaStorageProfile);


/**
 * @param	service	string		.
 * @param	action	string		.
 */
function KalturaApiActionPermissionItem(){
	this.service = null;
	this.action = null;
}
KalturaApiActionPermissionItem.inheritsFrom (KalturaPermissionItem);


/**
 * @param	object	string		.
 * @param	parameter	string		.
 * @param	action	string		.
 */
function KalturaApiParameterPermissionItem(){
	this.object = null;
	this.parameter = null;
	this.action = null;
}
KalturaApiParameterPermissionItem.inheritsFrom (KalturaPermissionItem);


/**
 * @param	idEqual	string		.
 * @param	idIn	string		.
 * @param	entryIdEqual	string		.
 * @param	entryIdIn	string		.
 * @param	partnerIdEqual	int		.
 * @param	partnerIdIn	string		.
 * @param	sizeGreaterThanOrEqual	int		.
 * @param	sizeLessThanOrEqual	int		.
 * @param	tagsLike	string		.
 * @param	tagsMultiLikeOr	string		.
 * @param	tagsMultiLikeAnd	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 * @param	deletedAtGreaterThanOrEqual	int		.
 * @param	deletedAtLessThanOrEqual	int		.
 */
function KalturaAssetBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.entryIdEqual = null;
	this.entryIdIn = null;
	this.partnerIdEqual = null;
	this.partnerIdIn = null;
	this.sizeGreaterThanOrEqual = null;
	this.sizeLessThanOrEqual = null;
	this.tagsLike = null;
	this.tagsMultiLikeOr = null;
	this.tagsMultiLikeAnd = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
	this.deletedAtGreaterThanOrEqual = null;
	this.deletedAtLessThanOrEqual = null;
}
KalturaAssetBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	propertyName	string		The property name to look for, this will match to a getter on the asset object.
 *		 Should be camelCase naming convention (defining "myPropertyName" will look for getMyPropertyName())
 *		 .
 * @param	propertyValue	string		The value to compare
 *		 .
 */
function KalturaAssetDistributionPropertyCondition(){
	this.propertyName = null;
	this.propertyValue = null;
}
KalturaAssetDistributionPropertyCondition.inheritsFrom (KalturaAssetDistributionCondition);


/**
 * @param	systemNameEqual	string		.
 * @param	systemNameIn	string		.
 * @param	isSystemDefaultEqual	int		.
 * @param	tagsEqual	string		.
 */
function KalturaAssetParamsBaseFilter(){
	this.systemNameEqual = null;
	this.systemNameIn = null;
	this.isSystemDefaultEqual = null;
	this.tagsEqual = null;
}
KalturaAssetParamsBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	assetParamsId	int		.
 * @param	assetParamsVersion	string		.
 * @param	assetId	string		.
 * @param	assetVersion	string		.
 * @param	readyBehavior	int		.
 * @param	format	string		The container format of the Flavor Params
 *		 .
 */
function KalturaAssetParamsOutput(){
	this.assetParamsId = null;
	this.assetParamsVersion = null;
	this.assetId = null;
	this.assetVersion = null;
	this.readyBehavior = null;
	this.format = null;
}
KalturaAssetParamsOutput.inheritsFrom (KalturaAssetParams);


/**
 * @param	properties	array		Array of key/value objects that holds the property and the value to find and compare on an asset object
 *		 .
 */
function KalturaAssetPropertiesCompareCondition(){
	this.properties = null;
}
KalturaAssetPropertiesCompareCondition.inheritsFrom (KalturaCondition);


/**
 * @param	resources	array		Array of resources associated with asset params ids
 *		 .
 */
function KalturaAssetsParamsResourceContainers(){
	this.resources = null;
}
KalturaAssetsParamsResourceContainers.inheritsFrom (KalturaResource);


/**
 * @param	idEqual	int		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	parsedAtGreaterThanOrEqual	int		.
 * @param	parsedAtLessThanOrEqual	int		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	auditObjectTypeEqual	string		.
 * @param	auditObjectTypeIn	string		.
 * @param	objectIdEqual	string		.
 * @param	objectIdIn	string		.
 * @param	relatedObjectIdEqual	string		.
 * @param	relatedObjectIdIn	string		.
 * @param	relatedObjectTypeEqual	string		.
 * @param	relatedObjectTypeIn	string		.
 * @param	entryIdEqual	string		.
 * @param	entryIdIn	string		.
 * @param	masterPartnerIdEqual	int		.
 * @param	masterPartnerIdIn	string		.
 * @param	partnerIdEqual	int		.
 * @param	partnerIdIn	string		.
 * @param	requestIdEqual	string		.
 * @param	requestIdIn	string		.
 * @param	userIdEqual	string		.
 * @param	userIdIn	string		.
 * @param	actionEqual	string		.
 * @param	actionIn	string		.
 * @param	ksEqual	string		.
 * @param	contextEqual	int		.
 * @param	contextIn	string		.
 * @param	entryPointEqual	string		.
 * @param	entryPointIn	string		.
 * @param	serverNameEqual	string		.
 * @param	serverNameIn	string		.
 * @param	ipAddressEqual	string		.
 * @param	ipAddressIn	string		.
 * @param	clientTagEqual	string		.
 */
function KalturaAuditTrailBaseFilter(){
	this.idEqual = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.parsedAtGreaterThanOrEqual = null;
	this.parsedAtLessThanOrEqual = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.auditObjectTypeEqual = null;
	this.auditObjectTypeIn = null;
	this.objectIdEqual = null;
	this.objectIdIn = null;
	this.relatedObjectIdEqual = null;
	this.relatedObjectIdIn = null;
	this.relatedObjectTypeEqual = null;
	this.relatedObjectTypeIn = null;
	this.entryIdEqual = null;
	this.entryIdIn = null;
	this.masterPartnerIdEqual = null;
	this.masterPartnerIdIn = null;
	this.partnerIdEqual = null;
	this.partnerIdIn = null;
	this.requestIdEqual = null;
	this.requestIdIn = null;
	this.userIdEqual = null;
	this.userIdIn = null;
	this.actionEqual = null;
	this.actionIn = null;
	this.ksEqual = null;
	this.contextEqual = null;
	this.contextIn = null;
	this.entryPointEqual = null;
	this.entryPointIn = null;
	this.serverNameEqual = null;
	this.serverNameIn = null;
	this.ipAddressEqual = null;
	this.ipAddressIn = null;
	this.clientTagEqual = null;
}
KalturaAuditTrailBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	changedItems	array		.
 */
function KalturaAuditTrailChangeInfo(){
	this.changedItems = null;
}
KalturaAuditTrailChangeInfo.inheritsFrom (KalturaAuditTrailInfo);


/**
 * @param	type	int		.
 */
function KalturaAuditTrailChangeXmlNode(){
	this.type = null;
}
KalturaAuditTrailChangeXmlNode.inheritsFrom (KalturaAuditTrailChangeItem);


/**
 * @param	version	string		.
 * @param	objectSubType	int		.
 * @param	dc	int		.
 * @param	original	bool		.
 * @param	fileType	int		.
 */
function KalturaAuditTrailFileSyncCreateInfo(){
	this.version = null;
	this.objectSubType = null;
	this.dc = null;
	this.original = null;
	this.fileType = null;
}
KalturaAuditTrailFileSyncCreateInfo.inheritsFrom (KalturaAuditTrailInfo);


/**
 * @param	info	string		.
 */
function KalturaAuditTrailTextInfo(){
	this.info = null;
}
KalturaAuditTrailTextInfo.inheritsFrom (KalturaAuditTrailInfo);


/**
 * @param	privileges	array		The privelege needed to remove the restriction
 *		 .
 */
function KalturaAuthenticatedCondition(){
	this.privileges = null;
}
KalturaAuthenticatedCondition.inheritsFrom (KalturaCondition);


/**
 */
function KalturaBaseSyndicationFeedBaseFilter(){
}
KalturaBaseSyndicationFeedBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	idEqual	int		.
 * @param	idGreaterThanOrEqual	int		.
 * @param	partnerIdEqual	int		.
 * @param	partnerIdIn	string		.
 * @param	partnerIdNotIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 * @param	executionAttemptsGreaterThanOrEqual	int		.
 * @param	executionAttemptsLessThanOrEqual	int		.
 * @param	lockVersionGreaterThanOrEqual	int		.
 * @param	lockVersionLessThanOrEqual	int		.
 * @param	entryIdEqual	string		.
 * @param	jobTypeEqual	string		.
 * @param	jobTypeIn	string		.
 * @param	jobTypeNotIn	string		.
 * @param	jobSubTypeEqual	int		.
 * @param	jobSubTypeIn	string		.
 * @param	jobSubTypeNotIn	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	statusNotIn	string		.
 * @param	priorityGreaterThanOrEqual	int		.
 * @param	priorityLessThanOrEqual	int		.
 * @param	priorityEqual	int		.
 * @param	priorityIn	string		.
 * @param	priorityNotIn	string		.
 * @param	batchVersionGreaterThanOrEqual	int		.
 * @param	batchVersionLessThanOrEqual	int		.
 * @param	batchVersionEqual	int		.
 * @param	queueTimeGreaterThanOrEqual	int		.
 * @param	queueTimeLessThanOrEqual	int		.
 * @param	finishTimeGreaterThanOrEqual	int		.
 * @param	finishTimeLessThanOrEqual	int		.
 * @param	errTypeEqual	int		.
 * @param	errTypeIn	string		.
 * @param	errTypeNotIn	string		.
 * @param	errNumberEqual	int		.
 * @param	errNumberIn	string		.
 * @param	errNumberNotIn	string		.
 * @param	estimatedEffortLessThan	int		.
 * @param	estimatedEffortGreaterThan	int		.
 * @param	urgencyLessThanOrEqual	int		.
 * @param	urgencyGreaterThanOrEqual	int		.
 */
function KalturaBatchJobBaseFilter(){
	this.idEqual = null;
	this.idGreaterThanOrEqual = null;
	this.partnerIdEqual = null;
	this.partnerIdIn = null;
	this.partnerIdNotIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
	this.executionAttemptsGreaterThanOrEqual = null;
	this.executionAttemptsLessThanOrEqual = null;
	this.lockVersionGreaterThanOrEqual = null;
	this.lockVersionLessThanOrEqual = null;
	this.entryIdEqual = null;
	this.jobTypeEqual = null;
	this.jobTypeIn = null;
	this.jobTypeNotIn = null;
	this.jobSubTypeEqual = null;
	this.jobSubTypeIn = null;
	this.jobSubTypeNotIn = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.statusNotIn = null;
	this.priorityGreaterThanOrEqual = null;
	this.priorityLessThanOrEqual = null;
	this.priorityEqual = null;
	this.priorityIn = null;
	this.priorityNotIn = null;
	this.batchVersionGreaterThanOrEqual = null;
	this.batchVersionLessThanOrEqual = null;
	this.batchVersionEqual = null;
	this.queueTimeGreaterThanOrEqual = null;
	this.queueTimeLessThanOrEqual = null;
	this.finishTimeGreaterThanOrEqual = null;
	this.finishTimeLessThanOrEqual = null;
	this.errTypeEqual = null;
	this.errTypeIn = null;
	this.errTypeNotIn = null;
	this.errNumberEqual = null;
	this.errNumberIn = null;
	this.errNumberNotIn = null;
	this.estimatedEffortLessThan = null;
	this.estimatedEffortGreaterThan = null;
	this.urgencyLessThanOrEqual = null;
	this.urgencyGreaterThanOrEqual = null;
}
KalturaBatchJobBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	value	bool		.
 */
function KalturaBooleanValue(){
	this.value = null;
}
KalturaBooleanValue.inheritsFrom (KalturaValue);


/**
 * @param	entryIds	string		Comma separated list of entry ids
 *		 .
 * @param	flavorParamsId	int		Flavor params id to use for conversion
 *		 .
 * @param	puserId	string		The id of the requesting user
 *		 .
 */
function KalturaBulkDownloadJobData(){
	this.entryIds = null;
	this.flavorParamsId = null;
	this.puserId = null;
}
KalturaBulkDownloadJobData.inheritsFrom (KalturaJobData);


/**
 * @param	uploadedOnGreaterThanOrEqual	int		.
 * @param	uploadedOnLessThanOrEqual	int		.
 * @param	uploadedOnEqual	int		.
 * @param	statusIn	string		.
 * @param	statusEqual	int		.
 * @param	bulkUploadObjectTypeEqual	string		.
 * @param	bulkUploadObjectTypeIn	string		.
 */
function KalturaBulkUploadBaseFilter(){
	this.uploadedOnGreaterThanOrEqual = null;
	this.uploadedOnLessThanOrEqual = null;
	this.uploadedOnEqual = null;
	this.statusIn = null;
	this.statusEqual = null;
	this.bulkUploadObjectTypeEqual = null;
	this.bulkUploadObjectTypeIn = null;
}
KalturaBulkUploadBaseFilter.inheritsFrom (KalturaFilter);


/**
 */
function KalturaBulkUploadCategoryData(){
}
KalturaBulkUploadCategoryData.inheritsFrom (KalturaBulkUploadObjectData);


/**
 */
function KalturaBulkUploadCategoryEntryData(){
}
KalturaBulkUploadCategoryEntryData.inheritsFrom (KalturaBulkUploadObjectData);


/**
 */
function KalturaBulkUploadCategoryUserData(){
}
KalturaBulkUploadCategoryUserData.inheritsFrom (KalturaBulkUploadObjectData);


/**
 * @param	conversionProfileId	int		Selected profile id for all bulk entries
 *	     .
 */
function KalturaBulkUploadEntryData(){
	this.conversionProfileId = null;
}
KalturaBulkUploadEntryData.inheritsFrom (KalturaBulkUploadObjectData);


/**
 * @param	userId	string		 (readOnly).
 * @param	uploadedBy	string		The screen name of the user
 *		  (readOnly).
 * @param	conversionProfileId	int		Selected profile id for all bulk entries
 *		  (readOnly).
 * @param	resultsFileLocalPath	string		Created by the API
 *		  (readOnly).
 * @param	resultsFileUrl	string		Created by the API
 *		  (readOnly).
 * @param	numOfEntries	int		Number of created entries
 *		  (readOnly).
 * @param	numOfObjects	int		Number of created objects
 *		  (readOnly).
 * @param	filePath	string		The bulk upload file path
 *		  (readOnly).
 * @param	bulkUploadObjectType	string		Type of object for bulk upload
 *		  (readOnly).
 * @param	fileName	string		Friendly name of the file, used to be recognized later in the logs.
 *		 .
 * @param	objectData	KalturaBulkUploadObjectData		Data pertaining to the objects being uploaded
 *		  (readOnly).
 * @param	type	string		Type of bulk upload
 *		  (readOnly).
 * @param	emailRecipients	string		Recipients of the email for bulk upload success/failure
 *		 .
 * @param	numOfErrorObjects	int		Number of objects that finished on error status
 *		 .
 */
function KalturaBulkUploadJobData(){
	this.userId = null;
	this.uploadedBy = null;
	this.conversionProfileId = null;
	this.resultsFileLocalPath = null;
	this.resultsFileUrl = null;
	this.numOfEntries = null;
	this.numOfObjects = null;
	this.filePath = null;
	this.bulkUploadObjectType = null;
	this.fileName = null;
	this.objectData = null;
	this.type = null;
	this.emailRecipients = null;
	this.numOfErrorObjects = null;
}
KalturaBulkUploadJobData.inheritsFrom (KalturaJobData);


/**
 * @param	relativePath	string		.
 * @param	name	string		.
 * @param	referenceId	string		.
 * @param	description	string		.
 * @param	tags	string		.
 * @param	appearInList	int		.
 * @param	privacy	int		.
 * @param	inheritanceType	int		.
 * @param	userJoinPolicy	int		.
 * @param	defaultPermissionLevel	int		.
 * @param	owner	string		.
 * @param	contributionPolicy	int		.
 * @param	partnerSortValue	int		.
 * @param	moderation	bool		.
 */
function KalturaBulkUploadResultCategory(){
	this.relativePath = null;
	this.name = null;
	this.referenceId = null;
	this.description = null;
	this.tags = null;
	this.appearInList = null;
	this.privacy = null;
	this.inheritanceType = null;
	this.userJoinPolicy = null;
	this.defaultPermissionLevel = null;
	this.owner = null;
	this.contributionPolicy = null;
	this.partnerSortValue = null;
	this.moderation = null;
}
KalturaBulkUploadResultCategory.inheritsFrom (KalturaBulkUploadResult);


/**
 * @param	categoryId	int		.
 * @param	entryId	string		.
 */
function KalturaBulkUploadResultCategoryEntry(){
	this.categoryId = null;
	this.entryId = null;
}
KalturaBulkUploadResultCategoryEntry.inheritsFrom (KalturaBulkUploadResult);


/**
 * @param	categoryId	int		.
 * @param	categoryReferenceId	string		.
 * @param	userId	string		.
 * @param	permissionLevel	int		.
 * @param	updateMethod	int		.
 * @param	requiredObjectStatus	int		.
 */
function KalturaBulkUploadResultCategoryUser(){
	this.categoryId = null;
	this.categoryReferenceId = null;
	this.userId = null;
	this.permissionLevel = null;
	this.updateMethod = null;
	this.requiredObjectStatus = null;
}
KalturaBulkUploadResultCategoryUser.inheritsFrom (KalturaBulkUploadResult);


/**
 * @param	entryId	string		.
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
 * @param	entryStatus	int		.
 * @param	thumbnailUrl	string		.
 * @param	thumbnailSaved	bool		.
 * @param	sshPrivateKey	string		.
 * @param	sshPublicKey	string		.
 * @param	sshKeyPassphrase	string		.
 * @param	creatorId	string		.
 * @param	entitledUsersEdit	string		.
 * @param	entitledUsersPublish	string		.
 * @param	ownerId	string		.
 */
function KalturaBulkUploadResultEntry(){
	this.entryId = null;
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
	this.entryStatus = null;
	this.thumbnailUrl = null;
	this.thumbnailSaved = null;
	this.sshPrivateKey = null;
	this.sshPublicKey = null;
	this.sshKeyPassphrase = null;
	this.creatorId = null;
	this.entitledUsersEdit = null;
	this.entitledUsersPublish = null;
	this.ownerId = null;
}
KalturaBulkUploadResultEntry.inheritsFrom (KalturaBulkUploadResult);


/**
 * @param	userId	string		.
 * @param	screenName	string		.
 * @param	email	string		.
 * @param	description	string		.
 * @param	tags	string		.
 * @param	dateOfBirth	int		.
 * @param	country	string		.
 * @param	state	string		.
 * @param	city	string		.
 * @param	zip	string		.
 * @param	gender	int		.
 * @param	firstName	string		.
 * @param	lastName	string		.
 */
function KalturaBulkUploadResultUser(){
	this.userId = null;
	this.screenName = null;
	this.email = null;
	this.description = null;
	this.tags = null;
	this.dateOfBirth = null;
	this.country = null;
	this.state = null;
	this.city = null;
	this.zip = null;
	this.gender = null;
	this.firstName = null;
	this.lastName = null;
}
KalturaBulkUploadResultUser.inheritsFrom (KalturaBulkUploadResult);


/**
 */
function KalturaBulkUploadUserData(){
}
KalturaBulkUploadUserData.inheritsFrom (KalturaBulkUploadObjectData);


/**
 * @param	srcFileSyncLocalPath	string		.
 * @param	actualSrcFileSyncLocalPath	string		The translated path as used by the scheduler
 *		 .
 * @param	srcFileSyncRemoteUrl	string		.
 * @param	thumbParamsOutputId	int		.
 * @param	thumbAssetId	string		.
 * @param	srcAssetId	string		.
 * @param	srcAssetType	string		.
 * @param	thumbPath	string		.
 */
function KalturaCaptureThumbJobData(){
	this.srcFileSyncLocalPath = null;
	this.actualSrcFileSyncLocalPath = null;
	this.srcFileSyncRemoteUrl = null;
	this.thumbParamsOutputId = null;
	this.thumbAssetId = null;
	this.srcAssetId = null;
	this.srcAssetType = null;
	this.thumbPath = null;
}
KalturaCaptureThumbJobData.inheritsFrom (KalturaJobData);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	parentIdEqual	int		.
 * @param	parentIdIn	string		.
 * @param	depthEqual	int		.
 * @param	fullNameEqual	string		.
 * @param	fullNameStartsWith	string		.
 * @param	fullNameIn	string		.
 * @param	fullIdsEqual	string		.
 * @param	fullIdsStartsWith	string		.
 * @param	fullIdsMatchOr	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 * @param	tagsLike	string		.
 * @param	tagsMultiLikeOr	string		.
 * @param	tagsMultiLikeAnd	string		.
 * @param	appearInListEqual	int		.
 * @param	privacyEqual	int		.
 * @param	privacyIn	string		.
 * @param	inheritanceTypeEqual	int		.
 * @param	inheritanceTypeIn	string		.
 * @param	referenceIdEqual	string		.
 * @param	referenceIdEmpty	int		.
 * @param	contributionPolicyEqual	int		.
 * @param	membersCountGreaterThanOrEqual	int		.
 * @param	membersCountLessThanOrEqual	int		.
 * @param	pendingMembersCountGreaterThanOrEqual	int		.
 * @param	pendingMembersCountLessThanOrEqual	int		.
 * @param	privacyContextEqual	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	inheritedParentIdEqual	int		.
 * @param	inheritedParentIdIn	string		.
 * @param	partnerSortValueGreaterThanOrEqual	int		.
 * @param	partnerSortValueLessThanOrEqual	int		.
 */
function KalturaCategoryBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.parentIdEqual = null;
	this.parentIdIn = null;
	this.depthEqual = null;
	this.fullNameEqual = null;
	this.fullNameStartsWith = null;
	this.fullNameIn = null;
	this.fullIdsEqual = null;
	this.fullIdsStartsWith = null;
	this.fullIdsMatchOr = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
	this.tagsLike = null;
	this.tagsMultiLikeOr = null;
	this.tagsMultiLikeAnd = null;
	this.appearInListEqual = null;
	this.privacyEqual = null;
	this.privacyIn = null;
	this.inheritanceTypeEqual = null;
	this.inheritanceTypeIn = null;
	this.referenceIdEqual = null;
	this.referenceIdEmpty = null;
	this.contributionPolicyEqual = null;
	this.membersCountGreaterThanOrEqual = null;
	this.membersCountLessThanOrEqual = null;
	this.pendingMembersCountGreaterThanOrEqual = null;
	this.pendingMembersCountLessThanOrEqual = null;
	this.privacyContextEqual = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.inheritedParentIdEqual = null;
	this.inheritedParentIdIn = null;
	this.partnerSortValueGreaterThanOrEqual = null;
	this.partnerSortValueLessThanOrEqual = null;
}
KalturaCategoryBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	categoriesMatchOr	string		.
 * @param	categoryEntryStatusIn	string		.
 */
function KalturaCategoryEntryAdvancedFilter(){
	this.categoriesMatchOr = null;
	this.categoryEntryStatusIn = null;
}
KalturaCategoryEntryAdvancedFilter.inheritsFrom (KalturaSearchItem);


/**
 * @param	categoryIdEqual	int		.
 * @param	categoryIdIn	string		.
 * @param	entryIdEqual	string		.
 * @param	entryIdIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	categoryFullIdsStartsWith	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 */
function KalturaCategoryEntryBaseFilter(){
	this.categoryIdEqual = null;
	this.categoryIdIn = null;
	this.entryIdEqual = null;
	this.entryIdIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.categoryFullIdsStartsWith = null;
	this.statusEqual = null;
	this.statusIn = null;
}
KalturaCategoryEntryBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	identifier	string		Identifier of the object
 *		 .
 */
function KalturaCategoryIdentifier(){
	this.identifier = null;
}
KalturaCategoryIdentifier.inheritsFrom (KalturaObjectIdentifier);


/**
 * @param	memberIdEq	string		.
 * @param	memberIdIn	string		.
 * @param	memberPermissionsMatchOr	string		.
 * @param	memberPermissionsMatchAnd	string		.
 */
function KalturaCategoryUserAdvancedFilter(){
	this.memberIdEq = null;
	this.memberIdIn = null;
	this.memberPermissionsMatchOr = null;
	this.memberPermissionsMatchAnd = null;
}
KalturaCategoryUserAdvancedFilter.inheritsFrom (KalturaSearchItem);


/**
 * @param	categoryIdEqual	int		.
 * @param	categoryIdIn	string		.
 * @param	userIdEqual	string		.
 * @param	userIdIn	string		.
 * @param	permissionLevelEqual	int		.
 * @param	permissionLevelIn	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 * @param	updateMethodEqual	int		.
 * @param	updateMethodIn	string		.
 * @param	categoryFullIdsStartsWith	string		.
 * @param	categoryFullIdsEqual	string		.
 * @param	permissionNamesMatchAnd	string		.
 * @param	permissionNamesMatchOr	string		.
 * @param	permissionNamesNotContains	string		.
 */
function KalturaCategoryUserBaseFilter(){
	this.categoryIdEqual = null;
	this.categoryIdIn = null;
	this.userIdEqual = null;
	this.userIdIn = null;
	this.permissionLevelEqual = null;
	this.permissionLevelIn = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
	this.updateMethodEqual = null;
	this.updateMethodIn = null;
	this.categoryFullIdsStartsWith = null;
	this.categoryFullIdsEqual = null;
	this.permissionNamesMatchAnd = null;
	this.permissionNamesMatchOr = null;
	this.permissionNamesNotContains = null;
}
KalturaCategoryUserBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	userIdEqual	string		.
 * @param	userIdIn	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 * @param	updateMethodEqual	int		.
 * @param	updateMethodIn	string		.
 * @param	permissionNamesMatchAnd	string		.
 * @param	permissionNamesMatchOr	string		.
 */
function KalturaCategoryUserProviderFilter(){
	this.userIdEqual = null;
	this.userIdIn = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
	this.updateMethodEqual = null;
	this.updateMethodIn = null;
	this.permissionNamesMatchAnd = null;
	this.permissionNamesMatchOr = null;
}
KalturaCategoryUserProviderFilter.inheritsFrom (KalturaFilter);


/**
 * @param	offset	int		Offset in milliseconds
 *		 .
 * @param	duration	int		Duration in milliseconds
 *		 .
 */
function KalturaClipAttributes(){
	this.offset = null;
	this.duration = null;
}
KalturaClipAttributes.inheritsFrom (KalturaOperationAttributes);


/**
 * @param	code	string		.
 * @param	description	string		.
 * @param	endTime	int		.
 * @param	duration	int		Duration in milliseconds
 *		  (readOnly).
 */
function KalturaCodeCuePoint(){
	this.code = null;
	this.description = null;
	this.endTime = null;
	this.duration = null;
}
KalturaCodeCuePoint.inheritsFrom (KalturaCuePoint);


/**
 * @param	value	int		.
 */
function KalturaIntegerValue(){
	this.value = null;
}
KalturaIntegerValue.inheritsFrom (KalturaValue);


/**
 * @param	value	KalturaIntegerValue		Value to evaluate against the field and operator
 *		 .
 * @param	comparison	string		Comparing operator
 *		 .
 */
function KalturaCompareCondition(){
	this.value = null;
	this.comparison = null;
}
KalturaCompareCondition.inheritsFrom (KalturaCondition);


/**
 */
function KalturaDataCenterContentResource(){
}
KalturaDataCenterContentResource.inheritsFrom (KalturaContentResource);


/**
 * @param	resource	KalturaDataCenterContentResource		The resource to be concatenated
 *		 .
 */
function KalturaConcatAttributes(){
	this.resource = null;
}
KalturaConcatAttributes.inheritsFrom (KalturaOperationAttributes);


/**
 * @param	srcFiles	array		Source files to be concatenated
 *		 .
 * @param	destFilePath	string		Output file
 *		 .
 * @param	flavorAssetId	string		Flavor asset to be ingested with the output
 *		 .
 * @param	offset	float		Clipping offset in seconds
 *		 .
 * @param	duration	float		Clipping duration in seconds
 *		 .
 */
function KalturaConcatJobData(){
	this.srcFiles = null;
	this.destFilePath = null;
	this.flavorAssetId = null;
	this.offset = null;
	this.duration = null;
}
KalturaConcatJobData.inheritsFrom (KalturaJobData);


/**
 * @param	fieldValues	string		.
 */
function KalturaConfigurableDistributionJobProviderData(){
	this.fieldValues = null;
}
KalturaConfigurableDistributionJobProviderData.inheritsFrom (KalturaDistributionJobProviderData);


/**
 * @param	fieldConfigArray	array		.
 * @param	itemXpathsToExtend	array		.
 */
function KalturaConfigurableDistributionProfile(){
	this.fieldConfigArray = null;
	this.itemXpathsToExtend = null;
}
KalturaConfigurableDistributionProfile.inheritsFrom (KalturaDistributionProfile);


/**
 * @param	noDistributionProfiles	bool		.
 * @param	distributionProfileId	int		.
 * @param	distributionSunStatus	int		.
 * @param	entryDistributionFlag	int		.
 * @param	entryDistributionStatus	int		.
 * @param	hasEntryDistributionValidationErrors	bool		.
 * @param	entryDistributionValidationErrors	string		Comma seperated validation error types
 *		 .
 */
function KalturaContentDistributionSearchItem(){
	this.noDistributionProfiles = null;
	this.distributionProfileId = null;
	this.distributionSunStatus = null;
	this.entryDistributionFlag = null;
	this.entryDistributionStatus = null;
	this.hasEntryDistributionValidationErrors = null;
	this.entryDistributionValidationErrors = null;
}
KalturaContentDistributionSearchItem.inheritsFrom (KalturaSearchItem);


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
function KalturaControlPanelCommandBaseFilter(){
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
KalturaControlPanelCommandBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	srcFileSyncLocalPath	string		.
 * @param	actualSrcFileSyncLocalPath	string		The translated path as used by the scheduler
 *		 .
 * @param	srcFileSyncRemoteUrl	string		.
 * @param	srcFileSyncs	array		.
 * @param	engineVersion	int		.
 * @param	flavorParamsOutputId	int		.
 * @param	flavorParamsOutput	KalturaFlavorParamsOutput		.
 * @param	mediaInfoId	int		.
 * @param	currentOperationSet	int		.
 * @param	currentOperationIndex	int		.
 * @param	pluginData	array		.
 */
function KalturaConvartableJobData(){
	this.srcFileSyncLocalPath = null;
	this.actualSrcFileSyncLocalPath = null;
	this.srcFileSyncRemoteUrl = null;
	this.srcFileSyncs = null;
	this.engineVersion = null;
	this.flavorParamsOutputId = null;
	this.flavorParamsOutput = null;
	this.mediaInfoId = null;
	this.currentOperationSet = null;
	this.currentOperationIndex = null;
	this.pluginData = null;
}
KalturaConvartableJobData.inheritsFrom (KalturaJobData);


/**
 * @param	conversionProfileIdEqual	int		.
 * @param	conversionProfileIdIn	string		.
 * @param	assetParamsIdEqual	int		.
 * @param	assetParamsIdIn	string		.
 * @param	readyBehaviorEqual	int		.
 * @param	readyBehaviorIn	string		.
 * @param	originEqual	int		.
 * @param	originIn	string		.
 * @param	systemNameEqual	string		.
 * @param	systemNameIn	string		.
 */
function KalturaConversionProfileAssetParamsBaseFilter(){
	this.conversionProfileIdEqual = null;
	this.conversionProfileIdIn = null;
	this.assetParamsIdEqual = null;
	this.assetParamsIdIn = null;
	this.readyBehaviorEqual = null;
	this.readyBehaviorIn = null;
	this.originEqual = null;
	this.originIn = null;
	this.systemNameEqual = null;
	this.systemNameIn = null;
}
KalturaConversionProfileAssetParamsBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	statusEqual	string		.
 * @param	statusIn	string		.
 * @param	typeEqual	string		.
 * @param	typeIn	string		.
 * @param	nameEqual	string		.
 * @param	systemNameEqual	string		.
 * @param	systemNameIn	string		.
 * @param	tagsMultiLikeOr	string		.
 * @param	tagsMultiLikeAnd	string		.
 * @param	defaultEntryIdEqual	string		.
 * @param	defaultEntryIdIn	string		.
 */
function KalturaConversionProfileBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.typeEqual = null;
	this.typeIn = null;
	this.nameEqual = null;
	this.systemNameEqual = null;
	this.systemNameIn = null;
	this.tagsMultiLikeOr = null;
	this.tagsMultiLikeAnd = null;
	this.defaultEntryIdEqual = null;
	this.defaultEntryIdIn = null;
}
KalturaConversionProfileBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	entryId	string		Live stream entry id
 *		 .
 * @param	mediaServerIndex	int		Primary or secondary media server
 *		 .
 * @param	fileIndex	int		The index of the file within the entry
 *		 .
 * @param	srcFilePath	string		The recorded live media
 *		 .
 * @param	destFilePath	string		The output file
 *		 .
 * @param	endTime	float		Duration of the live entry including all recorded segments including the current
 *		 .
 */
function KalturaConvertLiveSegmentJobData(){
	this.entryId = null;
	this.mediaServerIndex = null;
	this.fileIndex = null;
	this.srcFilePath = null;
	this.destFilePath = null;
	this.endTime = null;
}
KalturaConvertLiveSegmentJobData.inheritsFrom (KalturaJobData);


/**
 * @param	inputFileSyncLocalPath	string		.
 * @param	thumbHeight	int		The height of last created thumbnail, will be used to comapare if this thumbnail is the best we can have
 *		 .
 * @param	thumbBitrate	int		The bit rate of last created thumbnail, will be used to comapare if this thumbnail is the best we can have
 *		 .
 */
function KalturaConvertProfileJobData(){
	this.inputFileSyncLocalPath = null;
	this.thumbHeight = null;
	this.thumbBitrate = null;
}
KalturaConvertProfileJobData.inheritsFrom (KalturaJobData);


/**
 * @param	fromPartnerId	int		Id of the partner to copy from
 *		 .
 * @param	toPartnerId	int		Id of the partner to copy to
 *		 .
 */
function KalturaCopyPartnerJobData(){
	this.fromPartnerId = null;
	this.toPartnerId = null;
}
KalturaCopyPartnerJobData.inheritsFrom (KalturaJobData);


/**
 * @param	countryRestrictionType	int		Country restriction type (Allow or deny)
 *		 .
 * @param	countryList	string		Comma separated list of country codes to allow to deny 
 *		 .
 */
function KalturaCountryRestriction(){
	this.countryRestrictionType = null;
	this.countryList = null;
}
KalturaCountryRestriction.inheritsFrom (KalturaBaseRestriction);


/**
 * @param	idEqual	string		.
 * @param	idIn	string		.
 * @param	cuePointTypeEqual	string		.
 * @param	cuePointTypeIn	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	entryIdEqual	string		.
 * @param	entryIdIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 * @param	tagsLike	string		.
 * @param	tagsMultiLikeOr	string		.
 * @param	tagsMultiLikeAnd	string		.
 * @param	startTimeGreaterThanOrEqual	int		.
 * @param	startTimeLessThanOrEqual	int		.
 * @param	userIdEqual	string		.
 * @param	userIdIn	string		.
 * @param	partnerSortValueEqual	int		.
 * @param	partnerSortValueIn	string		.
 * @param	partnerSortValueGreaterThanOrEqual	int		.
 * @param	partnerSortValueLessThanOrEqual	int		.
 * @param	forceStopEqual	int		.
 * @param	systemNameEqual	string		.
 * @param	systemNameIn	string		.
 */
function KalturaCuePointBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.cuePointTypeEqual = null;
	this.cuePointTypeIn = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.entryIdEqual = null;
	this.entryIdIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
	this.tagsLike = null;
	this.tagsMultiLikeOr = null;
	this.tagsMultiLikeAnd = null;
	this.startTimeGreaterThanOrEqual = null;
	this.startTimeLessThanOrEqual = null;
	this.userIdEqual = null;
	this.userIdIn = null;
	this.partnerSortValueEqual = null;
	this.partnerSortValueIn = null;
	this.partnerSortValueGreaterThanOrEqual = null;
	this.partnerSortValueLessThanOrEqual = null;
	this.forceStopEqual = null;
	this.systemNameEqual = null;
	this.systemNameIn = null;
}
KalturaCuePointBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	localFileSyncPath	string		.
 */
function KalturaDeleteFileJobData(){
	this.localFileSyncPath = null;
}
KalturaDeleteFileJobData.inheritsFrom (KalturaJobData);


/**
 * @param	filter	KalturaFilter		The filter should return the list of objects that need to be deleted.
 *		 .
 */
function KalturaDeleteJobData(){
	this.filter = null;
}
KalturaDeleteJobData.inheritsFrom (KalturaJobData);


/**
 * @param	directoryRestrictionType	int		Kaltura directory restriction type
 *		 .
 */
function KalturaDirectoryRestriction(){
	this.directoryRestrictionType = null;
}
KalturaDirectoryRestriction.inheritsFrom (KalturaBaseRestriction);


/**
 * @param	distributionProfileId	int		.
 * @param	distributionProfile	KalturaDistributionProfile		.
 * @param	entryDistributionId	int		.
 * @param	entryDistribution	KalturaEntryDistribution		.
 * @param	remoteId	string		Id of the media in the remote system
 *		 .
 * @param	providerType	string		.
 * @param	providerData	KalturaDistributionJobProviderData		Additional data that relevant for the provider only
 *		 .
 * @param	results	string		The results as returned from the remote destination
 *		 .
 * @param	sentData	string		The data as sent to the remote destination
 *		 .
 * @param	mediaFiles	array		Stores array of media files that submitted to the destination site
 *		 Could be used later for media update 
 *		 .
 */
function KalturaDistributionJobData(){
	this.distributionProfileId = null;
	this.distributionProfile = null;
	this.entryDistributionId = null;
	this.entryDistribution = null;
	this.remoteId = null;
	this.providerType = null;
	this.providerData = null;
	this.results = null;
	this.sentData = null;
	this.mediaFiles = null;
}
KalturaDistributionJobData.inheritsFrom (KalturaJobData);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 */
function KalturaDistributionProfileBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
	this.statusEqual = null;
	this.statusIn = null;
}
KalturaDistributionProfileBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	typeEqual	string		.
 * @param	typeIn	string		.
 */
function KalturaDistributionProviderBaseFilter(){
	this.typeEqual = null;
	this.typeIn = null;
}
KalturaDistributionProviderBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	fieldName	string		.
 * @param	validationErrorType	int		.
 * @param	validationErrorParam	string		Parameter of the validation error
 *		 For example, minimum value for KalturaDistributionValidationErrorType::STRING_TOO_SHORT validation error
 *		 .
 */
function KalturaDistributionValidationErrorInvalidData(){
	this.fieldName = null;
	this.validationErrorType = null;
	this.validationErrorParam = null;
}
KalturaDistributionValidationErrorInvalidData.inheritsFrom (KalturaDistributionValidationError);


/**
 * @param	data	string		.
 */
function KalturaDistributionValidationErrorMissingAsset(){
	this.data = null;
}
KalturaDistributionValidationErrorMissingAsset.inheritsFrom (KalturaDistributionValidationError);


/**
 * @param	flavorParamsId	string		.
 */
function KalturaDistributionValidationErrorMissingFlavor(){
	this.flavorParamsId = null;
}
KalturaDistributionValidationErrorMissingFlavor.inheritsFrom (KalturaDistributionValidationError);


/**
 * @param	fieldName	string		.
 */
function KalturaDistributionValidationErrorMissingMetadata(){
	this.fieldName = null;
}
KalturaDistributionValidationErrorMissingMetadata.inheritsFrom (KalturaDistributionValidationError);


/**
 * @param	dimensions	KalturaDistributionThumbDimensions		.
 */
function KalturaDistributionValidationErrorMissingThumbnail(){
	this.dimensions = null;
}
KalturaDistributionValidationErrorMissingThumbnail.inheritsFrom (KalturaDistributionValidationError);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	partnerIdEqual	int		.
 * @param	partnerIdIn	string		.
 * @param	nameLike	string		.
 * @param	providerEqual	string		.
 * @param	providerIn	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 */
function KalturaDrmProfileBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.partnerIdEqual = null;
	this.partnerIdIn = null;
	this.nameLike = null;
	this.providerEqual = null;
	this.providerIn = null;
	this.statusEqual = null;
	this.statusIn = null;
}
KalturaDrmProfileBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	partnerIdEqual	int		.
 * @param	partnerIdIn	string		.
 * @param	nameLike	string		.
 * @param	typeEqual	string		.
 * @param	typeIn	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	conversionProfileIdEqual	int		.
 * @param	conversionProfileIdIn	string		.
 * @param	dcEqual	int		.
 * @param	dcIn	string		.
 * @param	pathEqual	string		.
 * @param	pathLike	string		.
 * @param	fileHandlerTypeEqual	string		.
 * @param	fileHandlerTypeIn	string		.
 * @param	fileNamePatternsLike	string		.
 * @param	fileNamePatternsMultiLikeOr	string		.
 * @param	fileNamePatternsMultiLikeAnd	string		.
 * @param	tagsLike	string		.
 * @param	tagsMultiLikeOr	string		.
 * @param	tagsMultiLikeAnd	string		.
 * @param	errorCodeEqual	string		.
 * @param	errorCodeIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 */
function KalturaDropFolderBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.partnerIdEqual = null;
	this.partnerIdIn = null;
	this.nameLike = null;
	this.typeEqual = null;
	this.typeIn = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.conversionProfileIdEqual = null;
	this.conversionProfileIdIn = null;
	this.dcEqual = null;
	this.dcIn = null;
	this.pathEqual = null;
	this.pathLike = null;
	this.fileHandlerTypeEqual = null;
	this.fileHandlerTypeIn = null;
	this.fileNamePatternsLike = null;
	this.fileNamePatternsMultiLikeOr = null;
	this.fileNamePatternsMultiLikeAnd = null;
	this.tagsLike = null;
	this.tagsMultiLikeOr = null;
	this.tagsMultiLikeAnd = null;
	this.errorCodeEqual = null;
	this.errorCodeIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
}
KalturaDropFolderBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	contentMatchPolicy	int		.
 * @param	slugRegex	string		Regular expression that defines valid file names to be handled.
 *		 The following might be extracted from the file name and used if defined:
 *		 - (?P<referenceId>\w+) - will be used as the drop folder file's parsed slug.
 *		 - (?P<flavorName>\w+)  - will be used as the drop folder file's parsed flavor.
 *		 .
 */
function KalturaDropFolderContentFileHandlerConfig(){
	this.contentMatchPolicy = null;
	this.slugRegex = null;
}
KalturaDropFolderContentFileHandlerConfig.inheritsFrom (KalturaDropFolderFileHandlerConfig);


/**
 * @param	dropFolderFileIds	string		.
 * @param	parsedSlug	string		.
 * @param	contentMatchPolicy	int		.
 * @param	conversionProfileId	int		.
 */
function KalturaDropFolderContentProcessorJobData(){
	this.dropFolderFileIds = null;
	this.parsedSlug = null;
	this.contentMatchPolicy = null;
	this.conversionProfileId = null;
}
KalturaDropFolderContentProcessorJobData.inheritsFrom (KalturaJobData);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	partnerIdEqual	int		.
 * @param	partnerIdIn	string		.
 * @param	dropFolderIdEqual	int		.
 * @param	dropFolderIdIn	string		.
 * @param	fileNameEqual	string		.
 * @param	fileNameIn	string		.
 * @param	fileNameLike	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	statusNotIn	string		.
 * @param	parsedSlugEqual	string		.
 * @param	parsedSlugIn	string		.
 * @param	parsedSlugLike	string		.
 * @param	parsedFlavorEqual	string		.
 * @param	parsedFlavorIn	string		.
 * @param	parsedFlavorLike	string		.
 * @param	leadDropFolderFileIdEqual	int		.
 * @param	deletedDropFolderFileIdEqual	int		.
 * @param	entryIdEqual	string		.
 * @param	errorCodeEqual	string		.
 * @param	errorCodeIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 */
function KalturaDropFolderFileBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.partnerIdEqual = null;
	this.partnerIdIn = null;
	this.dropFolderIdEqual = null;
	this.dropFolderIdIn = null;
	this.fileNameEqual = null;
	this.fileNameIn = null;
	this.fileNameLike = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.statusNotIn = null;
	this.parsedSlugEqual = null;
	this.parsedSlugIn = null;
	this.parsedSlugLike = null;
	this.parsedFlavorEqual = null;
	this.parsedFlavorIn = null;
	this.parsedFlavorLike = null;
	this.leadDropFolderFileIdEqual = null;
	this.deletedDropFolderFileIdEqual = null;
	this.entryIdEqual = null;
	this.errorCodeEqual = null;
	this.errorCodeIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
}
KalturaDropFolderFileBaseFilter.inheritsFrom (KalturaFilter);


/**
 */
function KalturaDropFolderXmlBulkUploadFileHandlerConfig(){
}
KalturaDropFolderXmlBulkUploadFileHandlerConfig.inheritsFrom (KalturaDropFolderFileHandlerConfig);


/**
 * @param	categoryDirectMembers	bool		Return the list of categoryUser that are not inherited from parent category - only the direct categoryUsers.
 *		 .
 * @param	freeText	string		Free text search on user id or screen name
 *		 .
 */
function KalturaCategoryUserFilter(){
	this.categoryDirectMembers = null;
	this.freeText = null;
}
KalturaCategoryUserFilter.inheritsFrom (KalturaCategoryUserBaseFilter);


/**
 * @param	categoryUserFilter	KalturaCategoryUserFilter		.
 */
function KalturaEmailNotificationCategoryRecipientJobData(){
	this.categoryUserFilter = null;
}
KalturaEmailNotificationCategoryRecipientJobData.inheritsFrom (KalturaEmailNotificationRecipientJobData);


/**
 * @param	categoryId	KalturaStringValue		The ID of the category whose subscribers should receive the email notification.
 *		 .
 * @param	categoryUserFilter	KalturaCategoryUserProviderFilter		.
 */
function KalturaEmailNotificationCategoryRecipientProvider(){
	this.categoryId = null;
	this.categoryUserFilter = null;
}
KalturaEmailNotificationCategoryRecipientProvider.inheritsFrom (KalturaEmailNotificationRecipientProvider);


/**
 */
function KalturaEmailNotificationParameter(){
}
KalturaEmailNotificationParameter.inheritsFrom (KalturaEventNotificationParameter);


/**
 * @param	emailRecipients	array		Email to emails and names
 *		 .
 */
function KalturaEmailNotificationStaticRecipientJobData(){
	this.emailRecipients = null;
}
KalturaEmailNotificationStaticRecipientJobData.inheritsFrom (KalturaEmailNotificationRecipientJobData);


/**
 * @param	emailRecipients	array		Email to emails and names
 *		 .
 */
function KalturaEmailNotificationStaticRecipientProvider(){
	this.emailRecipients = null;
}
KalturaEmailNotificationStaticRecipientProvider.inheritsFrom (KalturaEmailNotificationRecipientProvider);


/**
 * @param	format	string		Define the email body format
 *		 .
 * @param	subject	string		Define the email subject 
 *		 .
 * @param	body	string		Define the email body content
 *		 .
 * @param	fromEmail	string		Define the email sender email
 *		 .
 * @param	fromName	string		Define the email sender name
 *		 .
 * @param	to	KalturaEmailNotificationRecipientProvider		Email recipient emails and names
 *		 .
 * @param	cc	KalturaEmailNotificationRecipientProvider		Email recipient emails and names
 *		 .
 * @param	bcc	KalturaEmailNotificationRecipientProvider		Email recipient emails and names
 *		 .
 * @param	replyTo	KalturaEmailNotificationRecipientProvider		Default email addresses to whom the reply should be sent. 
 *		 .
 * @param	priority	int		Define the email priority
 *		 .
 * @param	confirmReadingTo	string		Email address that a reading confirmation will be sent
 *		 .
 * @param	hostname	string		Hostname to use in Message-Id and Received headers and as default HELLO string. 
 *		 If empty, the value returned by SERVER_NAME is used or 'localhost.localdomain'.
 *		 .
 * @param	messageID	string		Sets the message ID to be used in the Message-Id header.
 *		 If empty, a unique id will be generated.
 *		 .
 * @param	customHeaders	array		Adds a e-mail custom header
 *		 .
 */
function KalturaEmailNotificationTemplate(){
	this.format = null;
	this.subject = null;
	this.body = null;
	this.fromEmail = null;
	this.fromName = null;
	this.to = null;
	this.cc = null;
	this.bcc = null;
	this.replyTo = null;
	this.priority = null;
	this.confirmReadingTo = null;
	this.hostname = null;
	this.messageID = null;
	this.customHeaders = null;
}
KalturaEmailNotificationTemplate.inheritsFrom (KalturaEventNotificationTemplate);


/**
 * @param	partnerIdEqual	int		.
 * @param	screenNameLike	string		.
 * @param	screenNameStartsWith	string		.
 * @param	emailLike	string		.
 * @param	emailStartsWith	string		.
 * @param	tagsMultiLikeOr	string		.
 * @param	tagsMultiLikeAnd	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	firstNameStartsWith	string		.
 * @param	lastNameStartsWith	string		.
 * @param	isAdminEqual	int		.
 */
function KalturaUserBaseFilter(){
	this.partnerIdEqual = null;
	this.screenNameLike = null;
	this.screenNameStartsWith = null;
	this.emailLike = null;
	this.emailStartsWith = null;
	this.tagsMultiLikeOr = null;
	this.tagsMultiLikeAnd = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.firstNameStartsWith = null;
	this.lastNameStartsWith = null;
	this.isAdminEqual = null;
}
KalturaUserBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	idOrScreenNameStartsWith	string		.
 * @param	idEqual	string		.
 * @param	idIn	string		.
 * @param	loginEnabledEqual	int		.
 * @param	roleIdEqual	string		.
 * @param	roleIdsEqual	string		.
 * @param	roleIdsIn	string		.
 * @param	firstNameOrLastNameStartsWith	string		.
 * @param	permissionNamesMultiLikeOr	string		Permission names filter expression
 *		 .
 * @param	permissionNamesMultiLikeAnd	string		Permission names filter expression
 *		 .
 */
function KalturaUserFilter(){
	this.idOrScreenNameStartsWith = null;
	this.idEqual = null;
	this.idIn = null;
	this.loginEnabledEqual = null;
	this.roleIdEqual = null;
	this.roleIdsEqual = null;
	this.roleIdsIn = null;
	this.firstNameOrLastNameStartsWith = null;
	this.permissionNamesMultiLikeOr = null;
	this.permissionNamesMultiLikeAnd = null;
}
KalturaUserFilter.inheritsFrom (KalturaUserBaseFilter);


/**
 * @param	filter	KalturaUserFilter		.
 */
function KalturaEmailNotificationUserRecipientJobData(){
	this.filter = null;
}
KalturaEmailNotificationUserRecipientJobData.inheritsFrom (KalturaEmailNotificationRecipientJobData);


/**
 * @param	filter	KalturaUserFilter		.
 */
function KalturaEmailNotificationUserRecipientProvider(){
	this.filter = null;
}
KalturaEmailNotificationUserRecipientProvider.inheritsFrom (KalturaEmailNotificationRecipientProvider);


/**
 * @param	entryId	string		The entry ID in the context of which the playlist should be built
 *	     .
 * @param	followEntryRedirect	int		Is this a redirected entry followup?
 *	     .
 */
function KalturaEntryContext(){
	this.entryId = null;
	this.followEntryRedirect = null;
}
KalturaEntryContext.inheritsFrom (KalturaContext);


/**
 * @param	flavorAssetId	string		Id of the current flavor.
 *		 .
 * @param	flavorTags	string		The tags of the flavors that should be used for playback.
 *		 .
 * @param	streamerType	string		Playback streamer type: RTMP, HTTP, appleHttps, rtsp, sl.
 *		 .
 * @param	mediaProtocol	string		Protocol of the specific media object.
 *		 .
 */
function KalturaEntryContextDataParams(){
	this.flavorAssetId = null;
	this.flavorTags = null;
	this.streamerType = null;
	this.mediaProtocol = null;
}
KalturaEntryContextDataParams.inheritsFrom (KalturaAccessControlScope);


/**
 * @param	isSiteRestricted	bool		.
 * @param	isCountryRestricted	bool		.
 * @param	isSessionRestricted	bool		.
 * @param	isIpAddressRestricted	bool		.
 * @param	isUserAgentRestricted	bool		.
 * @param	previewLength	int		.
 * @param	isScheduledNow	bool		.
 * @param	isAdmin	bool		.
 * @param	streamerType	string		http/rtmp/hdnetwork
 *		 .
 * @param	mediaProtocol	string		http/https, rtmp/rtmpe
 *		 .
 * @param	storageProfilesXML	string		.
 * @param	accessControlMessages	array		Array of messages as received from the access control rules that invalidated
 *		 .
 * @param	accessControlActions	array		Array of actions as received from the access control rules that invalidated
 *		 .
 * @param	flavorAssets	array		Array of allowed flavor assets according to access control limitations and requested tags
 *		 .
 */
function KalturaEntryContextDataResult(){
	this.isSiteRestricted = null;
	this.isCountryRestricted = null;
	this.isSessionRestricted = null;
	this.isIpAddressRestricted = null;
	this.isUserAgentRestricted = null;
	this.previewLength = null;
	this.isScheduledNow = null;
	this.isAdmin = null;
	this.streamerType = null;
	this.mediaProtocol = null;
	this.storageProfilesXML = null;
	this.accessControlMessages = null;
	this.accessControlActions = null;
	this.flavorAssets = null;
}
KalturaEntryContextDataResult.inheritsFrom (KalturaContextDataResult);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 * @param	submittedAtGreaterThanOrEqual	int		.
 * @param	submittedAtLessThanOrEqual	int		.
 * @param	entryIdEqual	string		.
 * @param	entryIdIn	string		.
 * @param	distributionProfileIdEqual	int		.
 * @param	distributionProfileIdIn	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	dirtyStatusEqual	int		.
 * @param	dirtyStatusIn	string		.
 * @param	sunriseGreaterThanOrEqual	int		.
 * @param	sunriseLessThanOrEqual	int		.
 * @param	sunsetGreaterThanOrEqual	int		.
 * @param	sunsetLessThanOrEqual	int		.
 */
function KalturaEntryDistributionBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
	this.submittedAtGreaterThanOrEqual = null;
	this.submittedAtLessThanOrEqual = null;
	this.entryIdEqual = null;
	this.entryIdIn = null;
	this.distributionProfileIdEqual = null;
	this.distributionProfileIdIn = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.dirtyStatusEqual = null;
	this.dirtyStatusIn = null;
	this.sunriseGreaterThanOrEqual = null;
	this.sunriseLessThanOrEqual = null;
	this.sunsetGreaterThanOrEqual = null;
	this.sunsetLessThanOrEqual = null;
}
KalturaEntryDistributionBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	identifier	string		Identifier of the object
 *		 .
 */
function KalturaEntryIdentifier(){
	this.identifier = null;
}
KalturaEntryIdentifier.inheritsFrom (KalturaObjectIdentifier);


/**
 */
function KalturaBooleanField(){
}
KalturaBooleanField.inheritsFrom (KalturaBooleanValue);


/**
 * @param	field	KalturaBooleanField		The field to be evaluated at runtime
 *		 .
 */
function KalturaEventFieldCondition(){
	this.field = null;
}
KalturaEventFieldCondition.inheritsFrom (KalturaCondition);


/**
 * @param	values	array		.
 * @param	allowedValues	array		Used to restrict the values to close list
 *		 .
 */
function KalturaEventNotificationArrayParameter(){
	this.values = null;
	this.allowedValues = null;
}
KalturaEventNotificationArrayParameter.inheritsFrom (KalturaEventNotificationParameter);


/**
 * @param	templateId	int		.
 */
function KalturaEventNotificationDispatchJobData(){
	this.templateId = null;
}
KalturaEventNotificationDispatchJobData.inheritsFrom (KalturaJobData);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	partnerIdEqual	int		.
 * @param	partnerIdIn	string		.
 * @param	systemNameEqual	string		.
 * @param	systemNameIn	string		.
 * @param	typeEqual	string		.
 * @param	typeIn	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 */
function KalturaEventNotificationTemplateBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.partnerIdEqual = null;
	this.partnerIdIn = null;
	this.systemNameEqual = null;
	this.systemNameIn = null;
	this.typeEqual = null;
	this.typeIn = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
}
KalturaEventNotificationTemplateBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	modifiedColumns	string		Comma seperated column names to be tested
 *		 .
 */
function KalturaEventObjectChangedCondition(){
	this.modifiedColumns = null;
}
KalturaEventObjectChangedCondition.inheritsFrom (KalturaCondition);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	partnerIdEqual	int		.
 * @param	fileAssetObjectTypeEqual	string		.
 * @param	objectIdEqual	string		.
 * @param	objectIdIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 * @param	statusEqual	string		.
 * @param	statusIn	string		.
 */
function KalturaFileAssetBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.partnerIdEqual = null;
	this.fileAssetObjectTypeEqual = null;
	this.objectIdEqual = null;
	this.objectIdIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
	this.statusEqual = null;
	this.statusIn = null;
}
KalturaFileAssetBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	partnerIdEqual	int		.
 * @param	fileObjectTypeEqual	string		.
 * @param	fileObjectTypeIn	string		.
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
 * @param	fileSizeGreaterThanOrEqual	float		.
 * @param	fileSizeLessThanOrEqual	float		.
 */
function KalturaFileSyncBaseFilter(){
	this.partnerIdEqual = null;
	this.fileObjectTypeEqual = null;
	this.fileObjectTypeIn = null;
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
KalturaFileSyncBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	sourceUrl	string		.
 * @param	filesyncId	string		.
 * @param	tmpFilePath	string		.
 * @param	destFilePath	string		.
 * @param	fileSize	int		.
 */
function KalturaFileSyncImportJobData(){
	this.sourceUrl = null;
	this.filesyncId = null;
	this.tmpFilePath = null;
	this.destFilePath = null;
	this.fileSize = null;
}
KalturaFileSyncImportJobData.inheritsFrom (KalturaJobData);


/**
 */
function KalturaFlattenJobData(){
}
KalturaFlattenJobData.inheritsFrom (KalturaJobData);


/**
 * @param	xml	string		.
 * @param	resultParseData	string		.
 * @param	resultParserType	int		.
 */
function KalturaGenericDistributionJobProviderData(){
	this.xml = null;
	this.resultParseData = null;
	this.resultParserType = null;
}
KalturaGenericDistributionJobProviderData.inheritsFrom (KalturaDistributionJobProviderData);


/**
 * @param	genericProviderId	int		 (insertOnly).
 * @param	submitAction	KalturaGenericDistributionProfileAction		.
 * @param	updateAction	KalturaGenericDistributionProfileAction		.
 * @param	deleteAction	KalturaGenericDistributionProfileAction		.
 * @param	fetchReportAction	KalturaGenericDistributionProfileAction		.
 * @param	updateRequiredEntryFields	string		.
 * @param	updateRequiredMetadataXPaths	string		.
 */
function KalturaGenericDistributionProfile(){
	this.genericProviderId = null;
	this.submitAction = null;
	this.updateAction = null;
	this.deleteAction = null;
	this.fetchReportAction = null;
	this.updateRequiredEntryFields = null;
	this.updateRequiredMetadataXPaths = null;
}
KalturaGenericDistributionProfile.inheritsFrom (KalturaDistributionProfile);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 * @param	genericDistributionProviderIdEqual	int		.
 * @param	genericDistributionProviderIdIn	string		.
 * @param	actionEqual	int		.
 * @param	actionIn	string		.
 */
function KalturaGenericDistributionProviderActionBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
	this.genericDistributionProviderIdEqual = null;
	this.genericDistributionProviderIdIn = null;
	this.actionEqual = null;
	this.actionIn = null;
}
KalturaGenericDistributionProviderActionBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	feedDescription	string		feed description
 *	    .
 * @param	feedLandingPage	string		feed landing page (i.e publisher website)
 *		.
 */
function KalturaGenericSyndicationFeed(){
	this.feedDescription = null;
	this.feedLandingPage = null;
}
KalturaGenericSyndicationFeed.inheritsFrom (KalturaBaseSyndicationFeed);


/**
 * @param	adultContent	string		.
 */
function KalturaGoogleVideoSyndicationFeed(){
	this.adultContent = null;
}
KalturaGoogleVideoSyndicationFeed.inheritsFrom (KalturaBaseSyndicationFeed);


/**
 */
function KalturaHttpNotificationDataFields(){
}
KalturaHttpNotificationDataFields.inheritsFrom (KalturaHttpNotificationData);


/**
 * @param	content	KalturaStringValue		.
 */
function KalturaHttpNotificationDataText(){
	this.content = null;
}
KalturaHttpNotificationDataText.inheritsFrom (KalturaHttpNotificationData);


/**
 * @param	apiObjectType	string		Kaltura API object type
 *		 .
 * @param	format	int		Data format
 *		 .
 * @param	ignoreNull	bool		Ignore null attributes during serialization
 *		 .
 * @param	code	string		PHP code
 *		 .
 */
function KalturaHttpNotificationObjectData(){
	this.apiObjectType = null;
	this.format = null;
	this.ignoreNull = null;
	this.code = null;
}
KalturaHttpNotificationObjectData.inheritsFrom (KalturaHttpNotificationData);


/**
 * @param	url	string		Remote server URL
 *		 .
 * @param	method	int		Request method.
 *		 .
 * @param	data	KalturaHttpNotificationData		Data to send.
 *		 .
 * @param	timeout	int		The maximum number of seconds to allow cURL functions to execute.
 *		 .
 * @param	connectTimeout	int		The number of seconds to wait while trying to connect.
 *		 Must be larger than zero.
 *		 .
 * @param	username	string		A username to use for the connection.
 *		 .
 * @param	password	string		A password to use for the connection.
 *		 .
 * @param	authenticationMethod	int		The HTTP authentication method to use.
 *		 .
 * @param	sslVersion	int		The SSL version (2 or 3) to use.
 *		 By default PHP will try to determine this itself, although in some cases this must be set manually.
 *		 .
 * @param	sslCertificate	string		SSL certificate to verify the peer with.
 *		 .
 * @param	sslCertificateType	string		The format of the certificate.
 *		 .
 * @param	sslCertificatePassword	string		The password required to use the certificate.
 *		 .
 * @param	sslEngine	string		The identifier for the crypto engine of the private SSL key specified in ssl key.
 *		 .
 * @param	sslEngineDefault	string		The identifier for the crypto engine used for asymmetric crypto operations.
 *		 .
 * @param	sslKeyType	string		The key type of the private SSL key specified in ssl key - PEM / DER / ENG.
 *		 .
 * @param	sslKey	string		Private SSL key.
 *		 .
 * @param	sslKeyPassword	string		The secret password needed to use the private SSL key specified in ssl key.
 *		 .
 * @param	customHeaders	array		Adds a e-mail custom header
 *		 .
 */
function KalturaHttpNotificationTemplate(){
	this.url = null;
	this.method = null;
	this.data = null;
	this.timeout = null;
	this.connectTimeout = null;
	this.username = null;
	this.password = null;
	this.authenticationMethod = null;
	this.sslVersion = null;
	this.sslCertificate = null;
	this.sslCertificateType = null;
	this.sslCertificatePassword = null;
	this.sslEngine = null;
	this.sslEngineDefault = null;
	this.sslKeyType = null;
	this.sslKey = null;
	this.sslKeyPassword = null;
	this.customHeaders = null;
}
KalturaHttpNotificationTemplate.inheritsFrom (KalturaEventNotificationTemplate);


/**
 * @param	feedDescription	string		feed description
 *	         .
 * @param	language	string		feed language
 *	         .
 * @param	feedLandingPage	string		feed landing page (i.e publisher website)
 *	         .
 * @param	ownerName	string		author/publisher name
 *	         .
 * @param	ownerEmail	string		publisher email
 *	         .
 * @param	feedImageUrl	string		podcast thumbnail
 *	         .
 * @param	category	string		 (readOnly).
 * @param	adultContent	string		.
 * @param	feedAuthor	string		.
 * @param	enforceOrder	int		true in case you want to enfore the palylist order on the 
 *			 .
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
	this.enforceOrder = null;
}
KalturaITunesSyndicationFeed.inheritsFrom (KalturaBaseSyndicationFeed);


/**
 * @param	srcFileUrl	string		.
 * @param	destFileLocalPath	string		.
 * @param	flavorAssetId	string		.
 * @param	fileSize	int		.
 */
function KalturaImportJobData(){
	this.srcFileUrl = null;
	this.destFileLocalPath = null;
	this.flavorAssetId = null;
	this.fileSize = null;
}
KalturaImportJobData.inheritsFrom (KalturaJobData);


/**
 * @param	srcFileUrl	string		.
 * @param	destFileLocalPath	string		.
 * @param	metadataId	int		.
 */
function KalturaImportMetadataJobData(){
	this.srcFileUrl = null;
	this.destFileLocalPath = null;
	this.metadataId = null;
}
KalturaImportMetadataJobData.inheritsFrom (KalturaJobData);


/**
 * @param	indexIdGreaterThan	int		.
 */
function KalturaIndexAdvancedFilter(){
	this.indexIdGreaterThan = null;
}
KalturaIndexAdvancedFilter.inheritsFrom (KalturaSearchItem);


/**
 * @param	filter	KalturaFilter		The filter should return the list of objects that need to be reindexed.
 *		 .
 * @param	lastIndexId	int		Indicates the last id that reindexed, used when the batch crached, to re-run from the last crash point.
 *		 .
 * @param	shouldUpdate	bool		Indicates that the object columns and attributes values should be recalculated before reindexed.
 *		 .
 */
function KalturaIndexJobData(){
	this.filter = null;
	this.lastIndexId = null;
	this.shouldUpdate = null;
}
KalturaIndexJobData.inheritsFrom (KalturaJobData);


/**
 * @param	changedCategoryId	int		.
 * @param	deletedPrivacyContexts	string		.
 * @param	addedPrivacyContexts	string		.
 */
function KalturaIndexTagsByPrivacyContextJobData(){
	this.changedCategoryId = null;
	this.deletedPrivacyContexts = null;
	this.addedPrivacyContexts = null;
}
KalturaIndexTagsByPrivacyContextJobData.inheritsFrom (KalturaJobData);


/**
 * @param	ipAddressRestrictionType	int		Ip address restriction type (Allow or deny)
 *		 .
 * @param	ipAddressList	string		Comma separated list of ip address to allow to deny 
 *		 .
 */
function KalturaIpAddressRestriction(){
	this.ipAddressRestrictionType = null;
	this.ipAddressList = null;
}
KalturaIpAddressRestriction.inheritsFrom (KalturaBaseRestriction);


/**
 * @param	serviceToken	string		.
 */
function KalturaKontikiStorageProfile(){
	this.serviceToken = null;
}
KalturaKontikiStorageProfile.inheritsFrom (KalturaStorageProfile);


/**
 * @param	limitFlavorsRestrictionType	int		Limit flavors restriction type (Allow or deny)
 *		 .
 * @param	flavorParamsIds	string		Comma separated list of flavor params ids to allow to deny 
 *		 .
 */
function KalturaLimitFlavorsRestriction(){
	this.limitFlavorsRestrictionType = null;
	this.flavorParamsIds = null;
}
KalturaLimitFlavorsRestriction.inheritsFrom (KalturaBaseRestriction);


/**
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 * @param	statusEqual	string		.
 * @param	statusIn	string		.
 * @param	channelIdEqual	string		.
 * @param	channelIdIn	string		.
 * @param	startTimeGreaterThanOrEqual	float		.
 * @param	startTimeLessThanOrEqual	float		.
 */
function KalturaLiveChannelSegmentBaseFilter(){
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.channelIdEqual = null;
	this.channelIdIn = null;
	this.startTimeGreaterThanOrEqual = null;
	this.startTimeLessThanOrEqual = null;
}
KalturaLiveChannelSegmentBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	mailType	string		.
 * @param	mailPriority	int		.
 * @param	status	int		.
 * @param	recipientName	string		.
 * @param	recipientEmail	string		.
 * @param	recipientId	int		kuserId  
 *		 .
 * @param	fromName	string		.
 * @param	fromEmail	string		.
 * @param	bodyParams	string		.
 * @param	subjectParams	string		.
 * @param	templatePath	string		.
 * @param	language	string		.
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
	this.language = null;
	this.campaignId = null;
	this.minSendDate = null;
	this.isHtml = null;
}
KalturaMailJobData.inheritsFrom (KalturaJobData);


/**
 * @param	values	array		.
 */
function KalturaMatchCondition(){
	this.values = null;
}
KalturaMatchCondition.inheritsFrom (KalturaCondition);


/**
 * @param	flavorAssetIdEqual	string		.
 */
function KalturaMediaInfoBaseFilter(){
	this.flavorAssetIdEqual = null;
}
KalturaMediaInfoBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 */
function KalturaMediaServerBaseFilter(){
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
}
KalturaMediaServerBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	partnerIdEqual	int		.
 * @param	metadataProfileIdEqual	int		.
 * @param	metadataProfileVersionEqual	int		.
 * @param	metadataProfileVersionGreaterThanOrEqual	int		.
 * @param	metadataProfileVersionLessThanOrEqual	int		.
 * @param	metadataObjectTypeEqual	string		.
 * @param	objectIdEqual	string		.
 * @param	objectIdIn	string		.
 * @param	versionEqual	int		.
 * @param	versionGreaterThanOrEqual	int		.
 * @param	versionLessThanOrEqual	int		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 */
function KalturaMetadataBaseFilter(){
	this.partnerIdEqual = null;
	this.metadataProfileIdEqual = null;
	this.metadataProfileVersionEqual = null;
	this.metadataProfileVersionGreaterThanOrEqual = null;
	this.metadataProfileVersionLessThanOrEqual = null;
	this.metadataObjectTypeEqual = null;
	this.objectIdEqual = null;
	this.objectIdIn = null;
	this.versionEqual = null;
	this.versionGreaterThanOrEqual = null;
	this.versionLessThanOrEqual = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
	this.statusEqual = null;
	this.statusIn = null;
}
KalturaMetadataBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	idEqual	int		.
 * @param	partnerIdEqual	int		.
 * @param	metadataObjectTypeEqual	string		.
 * @param	metadataObjectTypeIn	string		.
 * @param	versionEqual	int		.
 * @param	nameEqual	string		.
 * @param	systemNameEqual	string		.
 * @param	systemNameIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	createModeEqual	int		.
 * @param	createModeNotEqual	int		.
 * @param	createModeIn	string		.
 * @param	createModeNotIn	string		.
 */
function KalturaMetadataProfileBaseFilter(){
	this.idEqual = null;
	this.partnerIdEqual = null;
	this.metadataObjectTypeEqual = null;
	this.metadataObjectTypeIn = null;
	this.versionEqual = null;
	this.nameEqual = null;
	this.systemNameEqual = null;
	this.systemNameIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.createModeEqual = null;
	this.createModeNotEqual = null;
	this.createModeIn = null;
	this.createModeNotIn = null;
}
KalturaMetadataProfileBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	srcCategoryId	int		Source category id
 *		 .
 * @param	destCategoryId	int		Destination category id
 *	     .
 * @param	lastMovedCategoryId	int		Saves the last category id that its entries moved completely
 *	     In case of crash the batch will restart from that point
 *	     .
 * @param	lastMovedCategoryPageIndex	int		Saves the last page index of the child categories filter pager
 *	     In case of crash the batch will restart from that point
 *	     .
 * @param	lastMovedCategoryEntryPageIndex	int		Saves the last page index of the category entries filter pager
 *	     In case of crash the batch will restart from that point
 *	     .
 * @param	moveFromChildren	bool		All entries from all child categories will be moved as well
 *	     .
 * @param	copyOnly	bool		Entries won't be deleted from the source entry
 *	     .
 * @param	destCategoryFullIds	string		Destination categories fallback ids
 *	     .
 */
function KalturaMoveCategoryEntriesJobData(){
	this.srcCategoryId = null;
	this.destCategoryId = null;
	this.lastMovedCategoryId = null;
	this.lastMovedCategoryPageIndex = null;
	this.lastMovedCategoryEntryPageIndex = null;
	this.moveFromChildren = null;
	this.copyOnly = null;
	this.destCategoryFullIds = null;
}
KalturaMoveCategoryEntriesJobData.inheritsFrom (KalturaJobData);


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
 * @param	captionAssetId	string		.
 */
function KalturaParseCaptionAssetJobData(){
	this.captionAssetId = null;
}
KalturaParseCaptionAssetJobData.inheritsFrom (KalturaJobData);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	idNotIn	string		.
 * @param	nameLike	string		.
 * @param	nameMultiLikeOr	string		.
 * @param	nameMultiLikeAnd	string		.
 * @param	nameEqual	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	partnerPackageEqual	int		.
 * @param	partnerPackageGreaterThanOrEqual	int		.
 * @param	partnerPackageLessThanOrEqual	int		.
 * @param	partnerGroupTypeEqual	int		.
 * @param	partnerNameDescriptionWebsiteAdminNameAdminEmailLike	string		.
 */
function KalturaPartnerBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.idNotIn = null;
	this.nameLike = null;
	this.nameMultiLikeOr = null;
	this.nameMultiLikeAnd = null;
	this.nameEqual = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.partnerPackageEqual = null;
	this.partnerPackageGreaterThanOrEqual = null;
	this.partnerPackageLessThanOrEqual = null;
	this.partnerGroupTypeEqual = null;
	this.partnerNameDescriptionWebsiteAdminNameAdminEmailLike = null;
}
KalturaPartnerBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	typeEqual	int		.
 * @param	typeIn	string		.
 * @param	nameEqual	string		.
 * @param	nameIn	string		.
 * @param	friendlyNameLike	string		.
 * @param	descriptionLike	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	partnerIdEqual	int		.
 * @param	partnerIdIn	string		.
 * @param	dependsOnPermissionNamesMultiLikeOr	string		.
 * @param	dependsOnPermissionNamesMultiLikeAnd	string		.
 * @param	tagsMultiLikeOr	string		.
 * @param	tagsMultiLikeAnd	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 */
function KalturaPermissionBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.typeEqual = null;
	this.typeIn = null;
	this.nameEqual = null;
	this.nameIn = null;
	this.friendlyNameLike = null;
	this.descriptionLike = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.partnerIdEqual = null;
	this.partnerIdIn = null;
	this.dependsOnPermissionNamesMultiLikeOr = null;
	this.dependsOnPermissionNamesMultiLikeAnd = null;
	this.tagsMultiLikeOr = null;
	this.tagsMultiLikeAnd = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
}
KalturaPermissionBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	typeEqual	string		.
 * @param	typeIn	string		.
 * @param	partnerIdEqual	int		.
 * @param	partnerIdIn	string		.
 * @param	tagsMultiLikeOr	string		.
 * @param	tagsMultiLikeAnd	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 */
function KalturaPermissionItemBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.typeEqual = null;
	this.typeIn = null;
	this.partnerIdEqual = null;
	this.partnerIdIn = null;
	this.tagsMultiLikeOr = null;
	this.tagsMultiLikeAnd = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
}
KalturaPermissionItemBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	streamID	string		.
 * @param	backupStreamID	string		.
 * @param	rtmp	string		.
 * @param	encoderIP	string		.
 * @param	backupEncoderIP	string		.
 * @param	encoderPassword	string		.
 * @param	encoderUsername	string		.
 * @param	endDate	int		.
 * @param	returnVal	string		.
 * @param	mediaType	int		.
 * @param	primaryBroadcastingUrl	string		.
 * @param	secondaryBroadcastingUrl	string		.
 * @param	streamName	string		.
 */
function KalturaProvisionJobData(){
	this.streamID = null;
	this.backupStreamID = null;
	this.rtmp = null;
	this.encoderIP = null;
	this.backupEncoderIP = null;
	this.encoderPassword = null;
	this.encoderUsername = null;
	this.endDate = null;
	this.returnVal = null;
	this.mediaType = null;
	this.primaryBroadcastingUrl = null;
	this.secondaryBroadcastingUrl = null;
	this.streamName = null;
}
KalturaProvisionJobData.inheritsFrom (KalturaJobData);


/**
 */
function KalturaRemoteDropFolder(){
}
KalturaRemoteDropFolder.inheritsFrom (KalturaDropFolder);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	partnerIdEqual	int		.
 * @param	partnerIdIn	string		.
 * @param	systemNameEqual	string		.
 * @param	systemNameIn	string		.
 */
function KalturaReportBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.partnerIdEqual = null;
	this.partnerIdIn = null;
	this.systemNameEqual = null;
	this.systemNameIn = null;
}
KalturaReportBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	keywords	string		Search keywords to filter objects
 *		 .
 * @param	searchInTags	bool		Search keywords in onjects tags
 *		 .
 * @param	searchInAdminTags	bool		Search keywords in onjects admin tags
 *		 .
 * @param	categories	string		Search onjects in specified categories
 *		 .
 * @param	timeZoneOffset	int		Time zone offset in minutes
 *		 .
 * @param	interval	string		Aggregated results according to interval
 *		 .
 */
function KalturaReportInputFilter(){
	this.keywords = null;
	this.searchInTags = null;
	this.searchInAdminTags = null;
	this.categories = null;
	this.timeZoneOffset = null;
	this.interval = null;
}
KalturaReportInputFilter.inheritsFrom (KalturaReportInputBaseFilter);


/**
 * @param	field	string		.
 * @param	value	string		.
 */
function KalturaSearchCondition(){
	this.field = null;
	this.value = null;
}
KalturaSearchCondition.inheritsFrom (KalturaSearchItem);


/**
 * @param	type	int		.
 * @param	items	array		.
 */
function KalturaSearchOperator(){
	this.type = null;
	this.items = null;
}
KalturaSearchOperator.inheritsFrom (KalturaSearchItem);


/**
 */
function KalturaSessionRestriction(){
}
KalturaSessionRestriction.inheritsFrom (KalturaBaseRestriction);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 * @param	expiresAtGreaterThanOrEqual	int		.
 * @param	expiresAtLessThanOrEqual	int		.
 * @param	partnerIdEqual	int		.
 * @param	partnerIdIn	string		.
 * @param	userIdEqual	string		.
 * @param	userIdIn	string		.
 * @param	systemNameEqual	string		.
 * @param	systemNameIn	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 */
function KalturaShortLinkBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
	this.expiresAtGreaterThanOrEqual = null;
	this.expiresAtLessThanOrEqual = null;
	this.partnerIdEqual = null;
	this.partnerIdIn = null;
	this.userIdEqual = null;
	this.userIdIn = null;
	this.systemNameEqual = null;
	this.systemNameIn = null;
	this.statusEqual = null;
	this.statusIn = null;
}
KalturaShortLinkBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	siteRestrictionType	int		The site restriction type (allow or deny)
 *		 .
 * @param	siteList	string		Comma separated list of sites (domains) to allow or deny
 *		 .
 */
function KalturaSiteRestriction(){
	this.siteRestrictionType = null;
	this.siteList = null;
}
KalturaSiteRestriction.inheritsFrom (KalturaBaseRestriction);


/**
 */
function KalturaStorageAddAction(){
}
KalturaStorageAddAction.inheritsFrom (KalturaRuleAction);


/**
 * @param	serverUrl	string		.
 * @param	serverUsername	string		.
 * @param	serverPassword	string		.
 * @param	ftpPassiveMode	bool		.
 * @param	srcFileSyncLocalPath	string		.
 * @param	srcFileSyncId	string		.
 * @param	destFileSyncStoredPath	string		.
 */
function KalturaStorageJobData(){
	this.serverUrl = null;
	this.serverUsername = null;
	this.serverPassword = null;
	this.ftpPassiveMode = null;
	this.srcFileSyncLocalPath = null;
	this.srcFileSyncId = null;
	this.destFileSyncStoredPath = null;
}
KalturaStorageJobData.inheritsFrom (KalturaJobData);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 * @param	partnerIdEqual	int		.
 * @param	partnerIdIn	string		.
 * @param	systemNameEqual	string		.
 * @param	systemNameIn	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	protocolEqual	string		.
 * @param	protocolIn	string		.
 */
function KalturaStorageProfileBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
	this.partnerIdEqual = null;
	this.partnerIdIn = null;
	this.systemNameEqual = null;
	this.systemNameIn = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.protocolEqual = null;
	this.protocolIn = null;
}
KalturaStorageProfileBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	xsl	string		.
 * @param	feedId	string		 (readOnly).
 */
function KalturaSyndicationDistributionProfile(){
	this.xsl = null;
	this.feedId = null;
}
KalturaSyndicationDistributionProfile.inheritsFrom (KalturaDistributionProfile);


/**
 */
function KalturaSyndicationDistributionProvider(){
}
KalturaSyndicationDistributionProvider.inheritsFrom (KalturaDistributionProvider);


/**
 * @param	objectTypeEqual	string		.
 * @param	tagEqual	string		.
 * @param	tagStartsWith	string		.
 * @param	instanceCountEqual	int		.
 * @param	instanceCountIn	int		.
 */
function KalturaTagFilter(){
	this.objectTypeEqual = null;
	this.tagEqual = null;
	this.tagStartsWith = null;
	this.instanceCountEqual = null;
	this.instanceCountIn = null;
}
KalturaTagFilter.inheritsFrom (KalturaFilter);


/**
 * @param	srcXslPath	string		.
 * @param	srcVersion	int		.
 * @param	destVersion	int		.
 * @param	destXsdPath	string		.
 * @param	metadataProfileId	int		.
 */
function KalturaTransformMetadataJobData(){
	this.srcXslPath = null;
	this.srcVersion = null;
	this.destVersion = null;
	this.destXsdPath = null;
	this.metadataProfileId = null;
}
KalturaTransformMetadataJobData.inheritsFrom (KalturaJobData);


/**
 * @param	category	string		 (readOnly).
 */
function KalturaTubeMogulSyndicationFeed(){
	this.category = null;
}
KalturaTubeMogulSyndicationFeed.inheritsFrom (KalturaBaseSyndicationFeed);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	nameLike	string		.
 * @param	partnerIdEqual	int		.
 * @param	partnerIdIn	string		.
 * @param	objTypeEqual	int		.
 * @param	objTypeIn	string		.
 * @param	tagsMultiLikeOr	string		.
 * @param	tagsMultiLikeAnd	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 * @param	creationModeEqual	int		.
 * @param	creationModeIn	string		.
 * @param	versionEqual	string		.
 * @param	versionMultiLikeOr	string		.
 * @param	versionMultiLikeAnd	string		.
 * @param	partnerTagsMultiLikeOr	string		.
 * @param	partnerTagsMultiLikeAnd	string		.
 */
function KalturaUiConfBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.nameLike = null;
	this.partnerIdEqual = null;
	this.partnerIdIn = null;
	this.objTypeEqual = null;
	this.objTypeIn = null;
	this.tagsMultiLikeOr = null;
	this.tagsMultiLikeAnd = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
	this.creationModeEqual = null;
	this.creationModeIn = null;
	this.versionEqual = null;
	this.versionMultiLikeOr = null;
	this.versionMultiLikeAnd = null;
	this.partnerTagsMultiLikeOr = null;
	this.partnerTagsMultiLikeAnd = null;
}
KalturaUiConfBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	idEqual	string		.
 * @param	idIn	string		.
 * @param	userIdEqual	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	fileNameEqual	string		.
 * @param	fileSizeEqual	float		.
 */
function KalturaUploadTokenBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.userIdEqual = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.fileNameEqual = null;
	this.fileSizeEqual = null;
}
KalturaUploadTokenBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	userAgentRestrictionType	int		User agent restriction type (Allow or deny)
 *		 .
 * @param	userAgentRegexList	string		A comma seperated list of user agent regular expressions
 *		 .
 */
function KalturaUserAgentRestriction(){
	this.userAgentRestrictionType = null;
	this.userAgentRegexList = null;
}
KalturaUserAgentRestriction.inheritsFrom (KalturaBaseRestriction);


/**
 * @param	loginEmailEqual	string		.
 */
function KalturaUserLoginDataBaseFilter(){
	this.loginEmailEqual = null;
}
KalturaUserLoginDataBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	nameEqual	string		.
 * @param	nameIn	string		.
 * @param	systemNameEqual	string		.
 * @param	systemNameIn	string		.
 * @param	descriptionLike	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	partnerIdEqual	int		.
 * @param	partnerIdIn	string		.
 * @param	tagsMultiLikeOr	string		.
 * @param	tagsMultiLikeAnd	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 */
function KalturaUserRoleBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.nameEqual = null;
	this.nameIn = null;
	this.systemNameEqual = null;
	this.systemNameIn = null;
	this.descriptionLike = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.partnerIdEqual = null;
	this.partnerIdIn = null;
	this.tagsMultiLikeOr = null;
	this.tagsMultiLikeAnd = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
}
KalturaUserRoleBaseFilter.inheritsFrom (KalturaFilter);


/**
 */
function KalturaVarPartnerUsageTotalItem(){
}
KalturaVarPartnerUsageTotalItem.inheritsFrom (KalturaVarPartnerUsageItem);


/**
 * @param	srcFilePath	string		.
 * @param	flavorAssetId	string		.
 * @param	scanResult	int		.
 * @param	virusFoundAction	int		.
 */
function KalturaVirusScanJobData(){
	this.srcFilePath = null;
	this.flavorAssetId = null;
	this.scanResult = null;
	this.virusFoundAction = null;
}
KalturaVirusScanJobData.inheritsFrom (KalturaJobData);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 * @param	partnerIdEqual	int		.
 * @param	partnerIdIn	string		.
 * @param	nameEqual	string		.
 * @param	nameLike	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	engineTypeEqual	string		.
 * @param	engineTypeIn	string		.
 */
function KalturaVirusScanProfileBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
	this.partnerIdEqual = null;
	this.partnerIdIn = null;
	this.nameEqual = null;
	this.nameLike = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.engineTypeEqual = null;
	this.engineTypeIn = null;
}
KalturaVirusScanProfileBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	webexUserId	string		.
 * @param	webexPassword	string		.
 * @param	webexSiteId	int		.
 * @param	webexPartnerId	string		.
 * @param	webexServiceUrl	string		.
 * @param	webexHostIdMetadataFieldName	string		.
 * @param	categoriesMetadataFieldName	string		.
 * @param	enforceEntitlement	bool		.
 */
function KalturaWebexDropFolder(){
	this.webexUserId = null;
	this.webexPassword = null;
	this.webexSiteId = null;
	this.webexPartnerId = null;
	this.webexServiceUrl = null;
	this.webexHostIdMetadataFieldName = null;
	this.categoriesMetadataFieldName = null;
	this.enforceEntitlement = null;
}
KalturaWebexDropFolder.inheritsFrom (KalturaDropFolder);


/**
 * @param	recordingId	int		.
 * @param	webexHostId	string		.
 * @param	description	string		.
 * @param	confId	string		.
 * @param	contentUrl	string		.
 */
function KalturaWebexDropFolderFile(){
	this.recordingId = null;
	this.webexHostId = null;
	this.description = null;
	this.confId = null;
	this.contentUrl = null;
}
KalturaWebexDropFolderFile.inheritsFrom (KalturaDropFolderFile);


/**
 * @param	key	string		.
 * @param	iv	string		.
 * @param	owner	string		.
 * @param	portal	string		.
 * @param	maxGop	int		.
 * @param	regServerHost	string		.
 */
function KalturaWidevineProfile(){
	this.key = null;
	this.iv = null;
	this.owner = null;
	this.portal = null;
	this.maxGop = null;
	this.regServerHost = null;
}
KalturaWidevineProfile.inheritsFrom (KalturaDrmProfile);


/**
 * @param	syncMode	int		.
 * @param	wvAssetIds	string		.
 * @param	modifiedAttributes	string		.
 * @param	monitorSyncCompletion	int		.
 */
function KalturaWidevineRepositorySyncJobData(){
	this.syncMode = null;
	this.wvAssetIds = null;
	this.modifiedAttributes = null;
	this.monitorSyncCompletion = null;
}
KalturaWidevineRepositorySyncJobData.inheritsFrom (KalturaJobData);


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
function KalturaWidgetBaseFilter(){
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
KalturaWidgetBaseFilter.inheritsFrom (KalturaFilter);


/**
 * @param	category	string		 (readOnly).
 * @param	adultContent	string		.
 * @param	feedDescription	string		feed description
 *	         .
 * @param	feedLandingPage	string		feed landing page (i.e publisher website)
 *	         .
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
function KalturaAccessControlFilter(){
}
KalturaAccessControlFilter.inheritsFrom (KalturaAccessControlBaseFilter);


/**
 */
function KalturaAccessControlProfileFilter(){
}
KalturaAccessControlProfileFilter.inheritsFrom (KalturaAccessControlProfileBaseFilter);


/**
 * @param	wsdlUsername	string		.
 * @param	wsdlPassword	string		.
 * @param	cpcode	string		.
 * @param	emailId	string		.
 * @param	primaryContact	string		.
 * @param	secondaryContact	string		.
 */
function KalturaAkamaiProvisionJobData(){
	this.wsdlUsername = null;
	this.wsdlPassword = null;
	this.cpcode = null;
	this.emailId = null;
	this.primaryContact = null;
	this.secondaryContact = null;
}
KalturaAkamaiProvisionJobData.inheritsFrom (KalturaProvisionJobData);


/**
 * @param	streamId	int		.
 * @param	systemUserName	string		.
 * @param	systemPassword	string		.
 * @param	domainName	string		.
 * @param	dvrEnabled	int		.
 * @param	dvrWindow	int		.
 * @param	primaryContact	string		.
 * @param	secondaryContact	string		.
 * @param	streamType	string		.
 * @param	notificationEmail	string		.
 */
function KalturaAkamaiUniversalProvisionJobData(){
	this.streamId = null;
	this.systemUserName = null;
	this.systemPassword = null;
	this.domainName = null;
	this.dvrEnabled = null;
	this.dvrWindow = null;
	this.primaryContact = null;
	this.secondaryContact = null;
	this.streamType = null;
	this.notificationEmail = null;
}
KalturaAkamaiUniversalProvisionJobData.inheritsFrom (KalturaProvisionJobData);


/**
 */
function KalturaAssetFilter(){
}
KalturaAssetFilter.inheritsFrom (KalturaAssetBaseFilter);


/**
 */
function KalturaAssetParamsFilter(){
}
KalturaAssetParamsFilter.inheritsFrom (KalturaAssetParamsBaseFilter);


/**
 * @param	assetId	string		ID of the source asset 
 *		 .
 */
function KalturaAssetResource(){
	this.assetId = null;
}
KalturaAssetResource.inheritsFrom (KalturaContentResource);


/**
 */
function KalturaAuditTrailFilter(){
}
KalturaAuditTrailFilter.inheritsFrom (KalturaAuditTrailBaseFilter);


/**
 */
function KalturaBaseSyndicationFeedFilter(){
}
KalturaBaseSyndicationFeedFilter.inheritsFrom (KalturaBaseSyndicationFeedBaseFilter);


/**
 */
function KalturaBatchJobFilter(){
}
KalturaBatchJobFilter.inheritsFrom (KalturaBatchJobBaseFilter);


/**
 * @param	csvVersion	int		The version of the csv file
 *		  (readOnly).
 * @param	columns	array		Array containing CSV headers
 *		 .
 */
function KalturaBulkUploadCsvJobData(){
	this.csvVersion = null;
	this.columns = null;
}
KalturaBulkUploadCsvJobData.inheritsFrom (KalturaBulkUploadJobData);


/**
 */
function KalturaBulkUploadFilter(){
}
KalturaBulkUploadFilter.inheritsFrom (KalturaBulkUploadBaseFilter);


/**
 * @param	filter	KalturaFilter		Filter for extracting the objects list to upload 
 *		 .
 * @param	templateObject	KalturaObjectBase		Template object for new object creation
 *		 .
 */
function KalturaBulkUploadFilterJobData(){
	this.filter = null;
	this.templateObject = null;
}
KalturaBulkUploadFilterJobData.inheritsFrom (KalturaBulkUploadJobData);


/**
 */
function KalturaBulkUploadXmlJobData(){
}
KalturaBulkUploadXmlJobData.inheritsFrom (KalturaBulkUploadJobData);


/**
 */
function KalturaCategoryEntryFilter(){
}
KalturaCategoryEntryFilter.inheritsFrom (KalturaCategoryEntryBaseFilter);


/**
 * @param	freeText	string		.
 * @param	membersIn	string		.
 * @param	nameOrReferenceIdStartsWith	string		.
 * @param	managerEqual	string		.
 * @param	memberEqual	string		.
 * @param	fullNameStartsWithIn	string		.
 * @param	ancestorIdIn	string		not includes the category itself (only sub categories)
 *		 .
 * @param	idOrInheritedParentIdIn	string		.
 */
function KalturaCategoryFilter(){
	this.freeText = null;
	this.membersIn = null;
	this.nameOrReferenceIdStartsWith = null;
	this.managerEqual = null;
	this.memberEqual = null;
	this.fullNameStartsWithIn = null;
	this.ancestorIdIn = null;
	this.idOrInheritedParentIdIn = null;
}
KalturaCategoryFilter.inheritsFrom (KalturaCategoryBaseFilter);


/**
 * @param	xPath	string		May contain the full xpath to the field in three formats
 *		 1. Slashed xPath, e.g. /metadata/myElementName
 *		 2. Using local-name function, e.g. /[local-name()='metadata']/[local-name()='myElementName']
 *		 3. Using only the field name, e.g. myElementName, it will be searched as //myElementName
 *		 .
 * @param	profileId	int		Metadata profile id
 *		 .
 * @param	profileSystemName	string		Metadata profile system name
 *		 .
 */
function KalturaCompareMetadataCondition(){
	this.xPath = null;
	this.profileId = null;
	this.profileSystemName = null;
}
KalturaCompareMetadataCondition.inheritsFrom (KalturaCompareCondition);


/**
 */
function KalturaControlPanelCommandFilter(){
}
KalturaControlPanelCommandFilter.inheritsFrom (KalturaControlPanelCommandBaseFilter);


/**
 */
function KalturaConversionProfileFilter(){
}
KalturaConversionProfileFilter.inheritsFrom (KalturaConversionProfileBaseFilter);


/**
 * @param	conversionProfileIdFilter	KalturaConversionProfileFilter		.
 * @param	assetParamsIdFilter	KalturaAssetParamsFilter		.
 */
function KalturaConversionProfileAssetParamsFilter(){
	this.conversionProfileIdFilter = null;
	this.assetParamsIdFilter = null;
}
KalturaConversionProfileAssetParamsFilter.inheritsFrom (KalturaConversionProfileAssetParamsBaseFilter);


/**
 * @param	destDirLocalPath	string		.
 * @param	destDirRemoteUrl	string		.
 * @param	destFileName	string		.
 * @param	inputXmlLocalPath	string		.
 * @param	inputXmlRemoteUrl	string		.
 * @param	commandLinesStr	string		.
 * @param	flavors	array		.
 */
function KalturaConvertCollectionJobData(){
	this.destDirLocalPath = null;
	this.destDirRemoteUrl = null;
	this.destFileName = null;
	this.inputXmlLocalPath = null;
	this.inputXmlRemoteUrl = null;
	this.commandLinesStr = null;
	this.flavors = null;
}
KalturaConvertCollectionJobData.inheritsFrom (KalturaConvartableJobData);


/**
 * @param	destFileSyncLocalPath	string		.
 * @param	destFileSyncRemoteUrl	string		.
 * @param	logFileSyncLocalPath	string		.
 * @param	logFileSyncRemoteUrl	string		.
 * @param	flavorAssetId	string		.
 * @param	remoteMediaId	string		.
 * @param	customData	string		.
 */
function KalturaConvertJobData(){
	this.destFileSyncLocalPath = null;
	this.destFileSyncRemoteUrl = null;
	this.logFileSyncLocalPath = null;
	this.logFileSyncRemoteUrl = null;
	this.flavorAssetId = null;
	this.remoteMediaId = null;
	this.customData = null;
}
KalturaConvertJobData.inheritsFrom (KalturaConvartableJobData);


/**
 * @param	geoCoderType	string		The ip geo coder engine to be used
 *		 .
 */
function KalturaCountryCondition(){
	this.geoCoderType = null;
}
KalturaCountryCondition.inheritsFrom (KalturaMatchCondition);


/**
 */
function KalturaCuePointFilter(){
}
KalturaCuePointFilter.inheritsFrom (KalturaCuePointBaseFilter);


/**
 */
function KalturaDistributionDeleteJobData(){
}
KalturaDistributionDeleteJobData.inheritsFrom (KalturaDistributionJobData);


/**
 * @param	plays	int		.
 * @param	views	int		.
 */
function KalturaDistributionFetchReportJobData(){
	this.plays = null;
	this.views = null;
}
KalturaDistributionFetchReportJobData.inheritsFrom (KalturaDistributionJobData);


/**
 */
function KalturaDistributionProfileFilter(){
}
KalturaDistributionProfileFilter.inheritsFrom (KalturaDistributionProfileBaseFilter);


/**
 */
function KalturaDistributionProviderFilter(){
}
KalturaDistributionProviderFilter.inheritsFrom (KalturaDistributionProviderBaseFilter);


/**
 */
function KalturaDistributionSubmitJobData(){
}
KalturaDistributionSubmitJobData.inheritsFrom (KalturaDistributionJobData);


/**
 */
function KalturaDistributionUpdateJobData(){
}
KalturaDistributionUpdateJobData.inheritsFrom (KalturaDistributionJobData);


/**
 * @param	metadataProfileId	int		.
 */
function KalturaDistributionValidationErrorInvalidMetadata(){
	this.metadataProfileId = null;
}
KalturaDistributionValidationErrorInvalidMetadata.inheritsFrom (KalturaDistributionValidationErrorInvalidData);


/**
 */
function KalturaDocumentFlavorParams(){
}
KalturaDocumentFlavorParams.inheritsFrom (KalturaFlavorParams);


/**
 */
function KalturaDrmProfileFilter(){
}
KalturaDrmProfileFilter.inheritsFrom (KalturaDrmProfileBaseFilter);


/**
 */
function KalturaDropFolderFileFilter(){
}
KalturaDropFolderFileFilter.inheritsFrom (KalturaDropFolderFileBaseFilter);


/**
 * @param	currentDc	int		.
 */
function KalturaDropFolderFilter(){
	this.currentDc = null;
}
KalturaDropFolderFilter.inheritsFrom (KalturaDropFolderBaseFilter);


/**
 * @param	fromEmail	string		Define the email sender email
 *		 .
 * @param	fromName	string		Define the email sender name
 *		 .
 * @param	to	KalturaEmailNotificationRecipientJobData		Email recipient emails and names, key is mail address and value is the name
 *		 .
 * @param	cc	KalturaEmailNotificationRecipientJobData		Email cc emails and names, key is mail address and value is the name
 *		 .
 * @param	bcc	KalturaEmailNotificationRecipientJobData		Email bcc emails and names, key is mail address and value is the name
 *		 .
 * @param	replyTo	KalturaEmailNotificationRecipientJobData		Email addresses that a replies should be sent to, key is mail address and value is the name
 *		 .
 * @param	priority	int		Define the email priority
 *		 .
 * @param	confirmReadingTo	string		Email address that a reading confirmation will be sent to
 *		 .
 * @param	hostname	string		Hostname to use in Message-Id and Received headers and as default HELO string. 
 *		 If empty, the value returned by SERVER_NAME is used or 'localhost.localdomain'.
 *		 .
 * @param	messageID	string		Sets the message ID to be used in the Message-Id header.
 *		 If empty, a unique id will be generated.
 *		 .
 * @param	customHeaders	array		Adds a e-mail custom header
 *		 .
 * @param	contentParameters	array		Define the content dynamic parameters
 *		 .
 */
function KalturaEmailNotificationDispatchJobData(){
	this.fromEmail = null;
	this.fromName = null;
	this.to = null;
	this.cc = null;
	this.bcc = null;
	this.replyTo = null;
	this.priority = null;
	this.confirmReadingTo = null;
	this.hostname = null;
	this.messageID = null;
	this.customHeaders = null;
	this.contentParameters = null;
}
KalturaEmailNotificationDispatchJobData.inheritsFrom (KalturaEventNotificationDispatchJobData);


/**
 * @param	application	string		.
 * @param	userIds	string		.
 * @param	playbackContext	string		.
 */
function KalturaEndUserReportInputFilter(){
	this.application = null;
	this.userIds = null;
	this.playbackContext = null;
}
KalturaEndUserReportInputFilter.inheritsFrom (KalturaReportInputFilter);


/**
 */
function KalturaEntryDistributionFilter(){
}
KalturaEntryDistributionFilter.inheritsFrom (KalturaEntryDistributionBaseFilter);


/**
 * @param	entryId	string		ID of the source entry 
 *		 .
 * @param	flavorParamsId	int		ID of the source flavor params, set to null to use the source flavor
 *		 .
 */
function KalturaEntryResource(){
	this.entryId = null;
	this.flavorParamsId = null;
}
KalturaEntryResource.inheritsFrom (KalturaContentResource);


/**
 */
function KalturaEventNotificationTemplateFilter(){
}
KalturaEventNotificationTemplateFilter.inheritsFrom (KalturaEventNotificationTemplateBaseFilter);


/**
 * @param	flavorAssetId	string		.
 */
function KalturaExtractMediaJobData(){
	this.flavorAssetId = null;
}
KalturaExtractMediaJobData.inheritsFrom (KalturaConvartableJobData);


/**
 */
function KalturaIntegerField(){
}
KalturaIntegerField.inheritsFrom (KalturaIntegerValue);


/**
 * @param	field	KalturaIntegerField		Field to evaluate
 *		 .
 */
function KalturaFieldCompareCondition(){
	this.field = null;
}
KalturaFieldCompareCondition.inheritsFrom (KalturaCompareCondition);


/**
 */
function KalturaStringField(){
}
KalturaStringField.inheritsFrom (KalturaStringValue);


/**
 * @param	field	KalturaStringField		Field to evaluate
 *		 .
 */
function KalturaFieldMatchCondition(){
	this.field = null;
}
KalturaFieldMatchCondition.inheritsFrom (KalturaMatchCondition);


/**
 */
function KalturaFileAssetFilter(){
}
KalturaFileAssetFilter.inheritsFrom (KalturaFileAssetBaseFilter);


/**
 */
function KalturaFileSyncFilter(){
}
KalturaFileSyncFilter.inheritsFrom (KalturaFileSyncBaseFilter);


/**
 * @param	fileSyncObjectType	int		The object type of the file sync object 
 *		 .
 * @param	objectSubType	int		The object sub-type of the file sync object 
 *		 .
 * @param	objectId	string		The object id of the file sync object 
 *		 .
 * @param	version	string		The version of the file sync object 
 *		 .
 */
function KalturaFileSyncResource(){
	this.fileSyncObjectType = null;
	this.objectSubType = null;
	this.objectId = null;
	this.version = null;
}
KalturaFileSyncResource.inheritsFrom (KalturaContentResource);


/**
 * @param	host	string		.
 * @param	port	int		.
 * @param	username	string		.
 * @param	password	string		.
 */
function KalturaFtpDropFolder(){
	this.host = null;
	this.port = null;
	this.username = null;
	this.password = null;
}
KalturaFtpDropFolder.inheritsFrom (KalturaRemoteDropFolder);


/**
 */
function KalturaGenericDistributionProviderActionFilter(){
}
KalturaGenericDistributionProviderActionFilter.inheritsFrom (KalturaGenericDistributionProviderActionBaseFilter);


/**
 * @param	xslt	string		.
 * @param	itemXpathsToExtend	array		.
 */
function KalturaGenericXsltSyndicationFeed(){
	this.xslt = null;
	this.itemXpathsToExtend = null;
}
KalturaGenericXsltSyndicationFeed.inheritsFrom (KalturaGenericSyndicationFeed);


/**
 * @param	url	string		Remote server URL
 *		 .
 * @param	method	int		Request method.
 *		 .
 * @param	data	string		Data to send.
 *		 .
 * @param	timeout	int		The maximum number of seconds to allow cURL functions to execute.
 *		 .
 * @param	connectTimeout	int		The number of seconds to wait while trying to connect.
 *		 Must be larger than zero.
 *		 .
 * @param	username	string		A username to use for the connection.
 *		 .
 * @param	password	string		A password to use for the connection.
 *		 .
 * @param	authenticationMethod	int		The HTTP authentication method to use.
 *		 .
 * @param	sslVersion	int		The SSL version (2 or 3) to use.
 *		 By default PHP will try to determine this itself, although in some cases this must be set manually.
 *		 .
 * @param	sslCertificate	string		SSL certificate to verify the peer with.
 *		 .
 * @param	sslCertificateType	string		The format of the certificate.
 *		 .
 * @param	sslCertificatePassword	string		The password required to use the certificate.
 *		 .
 * @param	sslEngine	string		The identifier for the crypto engine of the private SSL key specified in ssl key.
 *		 .
 * @param	sslEngineDefault	string		The identifier for the crypto engine used for asymmetric crypto operations.
 *		 .
 * @param	sslKeyType	string		The key type of the private SSL key specified in ssl key - PEM / DER / ENG.
 *		 .
 * @param	sslKey	string		Private SSL key.
 *		 .
 * @param	sslKeyPassword	string		The secret password needed to use the private SSL key specified in ssl key.
 *		 .
 * @param	customHeaders	array		Adds a e-mail custom header
 *		 .
 * @param	contentParameters	array		Define the content dynamic parameters
 *		 .
 */
function KalturaHttpNotificationDispatchJobData(){
	this.url = null;
	this.method = null;
	this.data = null;
	this.timeout = null;
	this.connectTimeout = null;
	this.username = null;
	this.password = null;
	this.authenticationMethod = null;
	this.sslVersion = null;
	this.sslCertificate = null;
	this.sslCertificateType = null;
	this.sslCertificatePassword = null;
	this.sslEngine = null;
	this.sslEngineDefault = null;
	this.sslKeyType = null;
	this.sslKey = null;
	this.sslKeyPassword = null;
	this.customHeaders = null;
	this.contentParameters = null;
}
KalturaHttpNotificationDispatchJobData.inheritsFrom (KalturaEventNotificationDispatchJobData);


/**
 * @param	densityWidth	int		.
 * @param	densityHeight	int		.
 * @param	sizeWidth	int		.
 * @param	sizeHeight	int		.
 * @param	depth	int		.
 */
function KalturaImageFlavorParams(){
	this.densityWidth = null;
	this.densityHeight = null;
	this.sizeWidth = null;
	this.sizeHeight = null;
	this.depth = null;
}
KalturaImageFlavorParams.inheritsFrom (KalturaFlavorParams);


/**
 */
function KalturaIpAddressCondition(){
}
KalturaIpAddressCondition.inheritsFrom (KalturaMatchCondition);


/**
 */
function KalturaLiveAsset(){
}
KalturaLiveAsset.inheritsFrom (KalturaFlavorAsset);


/**
 */
function KalturaLiveChannelSegmentFilter(){
}
KalturaLiveChannelSegmentFilter.inheritsFrom (KalturaLiveChannelSegmentBaseFilter);


/**
 */
function KalturaLiveParams(){
}
KalturaLiveParams.inheritsFrom (KalturaFlavorParams);


/**
 * @param	xPath	string		May contain the full xpath to the field in three formats
 *		 1. Slashed xPath, e.g. /metadata/myElementName
 *		 2. Using local-name function, e.g. /[local-name()='metadata']/[local-name()='myElementName']
 *		 3. Using only the field name, e.g. myElementName, it will be searched as //myElementName
 *		 .
 * @param	profileId	int		Metadata profile id
 *		 .
 * @param	profileSystemName	string		Metadata profile system name
 *		 .
 */
function KalturaMatchMetadataCondition(){
	this.xPath = null;
	this.profileId = null;
	this.profileSystemName = null;
}
KalturaMatchMetadataCondition.inheritsFrom (KalturaMatchCondition);


/**
 */
function KalturaMediaFlavorParams(){
}
KalturaMediaFlavorParams.inheritsFrom (KalturaFlavorParams);


/**
 */
function KalturaMediaInfoFilter(){
}
KalturaMediaInfoFilter.inheritsFrom (KalturaMediaInfoBaseFilter);


/**
 */
function KalturaMediaServerFilter(){
}
KalturaMediaServerFilter.inheritsFrom (KalturaMediaServerBaseFilter);


/**
 * @param	xPath	string		May contain the full xpath to the field in three formats
 *		 1. Slashed xPath, e.g. /metadata/myElementName
 *		 2. Using local-name function, e.g. /[local-name()='metadata']/[local-name()='myElementName']
 *		 3. Using only the field name, e.g. myElementName, it will be searched as //myElementName
 *		 .
 * @param	profileId	int		Metadata profile id
 *		 .
 * @param	profileSystemName	string		Metadata profile system name
 *		 .
 * @param	versionA	string		.
 * @param	versionB	string		.
 */
function KalturaMetadataFieldChangedCondition(){
	this.xPath = null;
	this.profileId = null;
	this.profileSystemName = null;
	this.versionA = null;
	this.versionB = null;
}
KalturaMetadataFieldChangedCondition.inheritsFrom (KalturaMatchCondition);


/**
 */
function KalturaMetadataFilter(){
}
KalturaMetadataFilter.inheritsFrom (KalturaMetadataBaseFilter);


/**
 */
function KalturaMetadataProfileFilter(){
}
KalturaMetadataProfileFilter.inheritsFrom (KalturaMetadataProfileBaseFilter);


/**
 * @param	metadataProfileId	int		.
 * @param	orderBy	string		.
 */
function KalturaMetadataSearchItem(){
	this.metadataProfileId = null;
	this.orderBy = null;
}
KalturaMetadataSearchItem.inheritsFrom (KalturaSearchOperator);


/**
 * @param	resource	KalturaContentResource		Only KalturaEntryResource and KalturaAssetResource are supported
 *		 .
 * @param	operationAttributes	array		.
 * @param	assetParamsId	int		ID of alternative asset params to be used instead of the system default flavor params 
 *		 .
 */
function KalturaOperationResource(){
	this.resource = null;
	this.operationAttributes = null;
	this.assetParamsId = null;
}
KalturaOperationResource.inheritsFrom (KalturaContentResource);


/**
 */
function KalturaPartnerFilter(){
}
KalturaPartnerFilter.inheritsFrom (KalturaPartnerBaseFilter);


/**
 * @param	readonly	bool		.
 */
function KalturaPdfFlavorParams(){
	this.readonly = null;
}
KalturaPdfFlavorParams.inheritsFrom (KalturaFlavorParams);


/**
 */
function KalturaPermissionFilter(){
}
KalturaPermissionFilter.inheritsFrom (KalturaPermissionBaseFilter);


/**
 */
function KalturaPermissionItemFilter(){
}
KalturaPermissionItemFilter.inheritsFrom (KalturaPermissionItemBaseFilter);


/**
 * @param	flavorAssetId	string		.
 * @param	createThumb	bool		Indicates if a thumbnail should be created
 *		 .
 * @param	thumbPath	string		The path of the created thumbnail
 *		 .
 * @param	thumbOffset	int		The position of the thumbnail in the media file
 *		 .
 * @param	thumbHeight	int		The height of the movie, will be used to comapare if this thumbnail is the best we can have
 *		 .
 * @param	thumbBitrate	int		The bit rate of the movie, will be used to comapare if this thumbnail is the best we can have
 *		 .
 * @param	customData	string		.
 */
function KalturaPostConvertJobData(){
	this.flavorAssetId = null;
	this.createThumb = null;
	this.thumbPath = null;
	this.thumbOffset = null;
	this.thumbHeight = null;
	this.thumbBitrate = null;
	this.customData = null;
}
KalturaPostConvertJobData.inheritsFrom (KalturaConvartableJobData);


/**
 * @param	previewLength	int		The preview restriction length 
 *		 .
 */
function KalturaPreviewRestriction(){
	this.previewLength = null;
}
KalturaPreviewRestriction.inheritsFrom (KalturaSessionRestriction);


/**
 */
function KalturaRegexCondition(){
}
KalturaRegexCondition.inheritsFrom (KalturaMatchCondition);


/**
 * @param	resources	array		Array of remote stoage resources 
 *		 .
 */
function KalturaRemoteStorageResources(){
	this.resources = null;
}
KalturaRemoteStorageResources.inheritsFrom (KalturaContentResource);


/**
 */
function KalturaReportFilter(){
}
KalturaReportFilter.inheritsFrom (KalturaReportBaseFilter);


/**
 * @param	comparison	string		.
 */
function KalturaSearchComparableCondition(){
	this.comparison = null;
}
KalturaSearchComparableCondition.inheritsFrom (KalturaSearchCondition);


/**
 */
function KalturaShortLinkFilter(){
}
KalturaShortLinkFilter.inheritsFrom (KalturaShortLinkBaseFilter);


/**
 */
function KalturaSiteCondition(){
}
KalturaSiteCondition.inheritsFrom (KalturaMatchCondition);


/**
 * @param	host	string		.
 * @param	port	int		.
 * @param	username	string		.
 * @param	password	string		.
 * @param	privateKey	string		.
 * @param	publicKey	string		.
 * @param	passPhrase	string		.
 */
function KalturaSshDropFolder(){
	this.host = null;
	this.port = null;
	this.username = null;
	this.password = null;
	this.privateKey = null;
	this.publicKey = null;
	this.passPhrase = null;
}
KalturaSshDropFolder.inheritsFrom (KalturaRemoteDropFolder);


/**
 * @param	privateKey	string		.
 * @param	publicKey	string		.
 * @param	passPhrase	string		.
 */
function KalturaSshImportJobData(){
	this.privateKey = null;
	this.publicKey = null;
	this.passPhrase = null;
}
KalturaSshImportJobData.inheritsFrom (KalturaImportJobData);


/**
 */
function KalturaStorageDeleteJobData(){
}
KalturaStorageDeleteJobData.inheritsFrom (KalturaStorageJobData);


/**
 * @param	force	bool		.
 * @param	createLink	bool		.
 */
function KalturaStorageExportJobData(){
	this.force = null;
	this.createLink = null;
}
KalturaStorageExportJobData.inheritsFrom (KalturaStorageJobData);


/**
 */
function KalturaStorageProfileFilter(){
}
KalturaStorageProfileFilter.inheritsFrom (KalturaStorageProfileBaseFilter);


/**
 * @param	content	string		Textual content
 *		 .
 */
function KalturaStringResource(){
	this.content = null;
}
KalturaStringResource.inheritsFrom (KalturaContentResource);


/**
 * @param	flashVersion	int		.
 * @param	poly2Bitmap	bool		.
 */
function KalturaSwfFlavorParams(){
	this.flashVersion = null;
	this.poly2Bitmap = null;
}
KalturaSwfFlavorParams.inheritsFrom (KalturaFlavorParams);


/**
 */
function KalturaUiConfFilter(){
}
KalturaUiConfFilter.inheritsFrom (KalturaUiConfBaseFilter);


/**
 */
function KalturaUploadTokenFilter(){
}
KalturaUploadTokenFilter.inheritsFrom (KalturaUploadTokenBaseFilter);


/**
 */
function KalturaUserLoginDataFilter(){
}
KalturaUserLoginDataFilter.inheritsFrom (KalturaUserLoginDataBaseFilter);


/**
 */
function KalturaUserRoleFilter(){
}
KalturaUserRoleFilter.inheritsFrom (KalturaUserRoleBaseFilter);


/**
 * @param	provisioningParams	array		.
 * @param	userName	string		.
 * @param	password	string		.
 */
function KalturaVelocixProvisionJobData(){
	this.provisioningParams = null;
	this.userName = null;
	this.password = null;
}
KalturaVelocixProvisionJobData.inheritsFrom (KalturaProvisionJobData);


/**
 */
function KalturaVirusScanProfileFilter(){
}
KalturaVirusScanProfileFilter.inheritsFrom (KalturaVirusScanProfileBaseFilter);


/**
 * @param	description	string		.
 * @param	webexHostId	string		.
 * @param	dropFolderId	int		.
 */
function KalturaWebexDropFolderContentProcessorJobData(){
	this.description = null;
	this.webexHostId = null;
	this.dropFolderId = null;
}
KalturaWebexDropFolderContentProcessorJobData.inheritsFrom (KalturaDropFolderContentProcessorJobData);


/**
 * @param	widevineDistributionStartDate	int		License distribution window start date 
 *		 .
 * @param	widevineDistributionEndDate	int		License distribution window end date
 *		 .
 * @param	widevineAssetId	int		Widevine unique asset id
 *		 .
 */
function KalturaWidevineFlavorAsset(){
	this.widevineDistributionStartDate = null;
	this.widevineDistributionEndDate = null;
	this.widevineAssetId = null;
}
KalturaWidevineFlavorAsset.inheritsFrom (KalturaFlavorAsset);


/**
 */
function KalturaWidevineFlavorParams(){
}
KalturaWidevineFlavorParams.inheritsFrom (KalturaFlavorParams);


/**
 */
function KalturaWidgetFilter(){
}
KalturaWidgetFilter.inheritsFrom (KalturaWidgetBaseFilter);


/**
 * @param	protocolTypeEqual	string		.
 * @param	protocolTypeIn	string		.
 * @param	titleLike	string		.
 * @param	titleMultiLikeOr	string		.
 * @param	titleMultiLikeAnd	string		.
 * @param	endTimeGreaterThanOrEqual	int		.
 * @param	endTimeLessThanOrEqual	int		.
 * @param	durationGreaterThanOrEqual	int		.
 * @param	durationLessThanOrEqual	int		.
 */
function KalturaAdCuePointBaseFilter(){
	this.protocolTypeEqual = null;
	this.protocolTypeIn = null;
	this.titleLike = null;
	this.titleMultiLikeOr = null;
	this.titleMultiLikeAnd = null;
	this.endTimeGreaterThanOrEqual = null;
	this.endTimeLessThanOrEqual = null;
	this.durationGreaterThanOrEqual = null;
	this.durationLessThanOrEqual = null;
}
KalturaAdCuePointBaseFilter.inheritsFrom (KalturaCuePointFilter);


/**
 */
function KalturaAdminUserBaseFilter(){
}
KalturaAdminUserBaseFilter.inheritsFrom (KalturaUserFilter);


/**
 * @param	filesPermissionInS3	string		.
 */
function KalturaAmazonS3StorageExportJobData(){
	this.filesPermissionInS3 = null;
}
KalturaAmazonS3StorageExportJobData.inheritsFrom (KalturaStorageExportJobData);


/**
 */
function KalturaAmazonS3StorageProfileBaseFilter(){
}
KalturaAmazonS3StorageProfileBaseFilter.inheritsFrom (KalturaStorageProfileFilter);


/**
 * @param	parentIdEqual	string		.
 * @param	parentIdIn	string		.
 * @param	textLike	string		.
 * @param	textMultiLikeOr	string		.
 * @param	textMultiLikeAnd	string		.
 * @param	endTimeGreaterThanOrEqual	int		.
 * @param	endTimeLessThanOrEqual	int		.
 * @param	durationGreaterThanOrEqual	int		.
 * @param	durationLessThanOrEqual	int		.
 */
function KalturaAnnotationBaseFilter(){
	this.parentIdEqual = null;
	this.parentIdIn = null;
	this.textLike = null;
	this.textMultiLikeOr = null;
	this.textMultiLikeAnd = null;
	this.endTimeGreaterThanOrEqual = null;
	this.endTimeLessThanOrEqual = null;
	this.durationGreaterThanOrEqual = null;
	this.durationLessThanOrEqual = null;
}
KalturaAnnotationBaseFilter.inheritsFrom (KalturaCuePointFilter);


/**
 */
function KalturaApiActionPermissionItemBaseFilter(){
}
KalturaApiActionPermissionItemBaseFilter.inheritsFrom (KalturaPermissionItemFilter);


/**
 */
function KalturaApiParameterPermissionItemBaseFilter(){
}
KalturaApiParameterPermissionItemBaseFilter.inheritsFrom (KalturaPermissionItemFilter);


/**
 */
function KalturaAssetParamsOutputBaseFilter(){
}
KalturaAssetParamsOutputBaseFilter.inheritsFrom (KalturaAssetParamsFilter);


/**
 * @param	formatEqual	string		.
 * @param	formatIn	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	statusNotIn	string		.
 */
function KalturaAttachmentAssetBaseFilter(){
	this.formatEqual = null;
	this.formatIn = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.statusNotIn = null;
}
KalturaAttachmentAssetBaseFilter.inheritsFrom (KalturaAssetFilter);


/**
 * @param	jobTypeAndSubTypeIn	string		.
 */
function KalturaBatchJobFilterExt(){
	this.jobTypeAndSubTypeIn = null;
}
KalturaBatchJobFilterExt.inheritsFrom (KalturaBatchJobFilter);


/**
 * @param	captionParamsIdEqual	int		.
 * @param	captionParamsIdIn	string		.
 * @param	formatEqual	string		.
 * @param	formatIn	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	statusNotIn	string		.
 */
function KalturaCaptionAssetBaseFilter(){
	this.captionParamsIdEqual = null;
	this.captionParamsIdIn = null;
	this.formatEqual = null;
	this.formatIn = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.statusNotIn = null;
}
KalturaCaptionAssetBaseFilter.inheritsFrom (KalturaAssetFilter);


/**
 * @param	formatEqual	string		.
 * @param	formatIn	string		.
 */
function KalturaCaptionParamsBaseFilter(){
	this.formatEqual = null;
	this.formatIn = null;
}
KalturaCaptionParamsBaseFilter.inheritsFrom (KalturaAssetParamsFilter);


/**
 * @param	codeLike	string		.
 * @param	codeMultiLikeOr	string		.
 * @param	codeMultiLikeAnd	string		.
 * @param	codeEqual	string		.
 * @param	codeIn	string		.
 * @param	descriptionLike	string		.
 * @param	descriptionMultiLikeOr	string		.
 * @param	descriptionMultiLikeAnd	string		.
 * @param	endTimeGreaterThanOrEqual	int		.
 * @param	endTimeLessThanOrEqual	int		.
 * @param	durationGreaterThanOrEqual	int		.
 * @param	durationLessThanOrEqual	int		.
 */
function KalturaCodeCuePointBaseFilter(){
	this.codeLike = null;
	this.codeMultiLikeOr = null;
	this.codeMultiLikeAnd = null;
	this.codeEqual = null;
	this.codeIn = null;
	this.descriptionLike = null;
	this.descriptionMultiLikeOr = null;
	this.descriptionMultiLikeAnd = null;
	this.endTimeGreaterThanOrEqual = null;
	this.endTimeLessThanOrEqual = null;
	this.durationGreaterThanOrEqual = null;
	this.durationLessThanOrEqual = null;
}
KalturaCodeCuePointBaseFilter.inheritsFrom (KalturaCuePointFilter);


/**
 */
function KalturaConfigurableDistributionProfileBaseFilter(){
}
KalturaConfigurableDistributionProfileBaseFilter.inheritsFrom (KalturaDistributionProfileFilter);


/**
 * @param	geoCoderType	string		The ip geo coder engine to be used
 *		 .
 */
function KalturaCountryContextField(){
	this.geoCoderType = null;
}
KalturaCountryContextField.inheritsFrom (KalturaStringField);


/**
 */
function KalturaDataEntryBaseFilter(){
}
KalturaDataEntryBaseFilter.inheritsFrom (KalturaBaseEntryFilter);


/**
 */
function KalturaDistributionDisableJobData(){
}
KalturaDistributionDisableJobData.inheritsFrom (KalturaDistributionUpdateJobData);


/**
 */
function KalturaDistributionEnableJobData(){
}
KalturaDistributionEnableJobData.inheritsFrom (KalturaDistributionUpdateJobData);


/**
 * @param	documentTypeEqual	int		.
 * @param	documentTypeIn	string		.
 * @param	assetParamsIdsMatchOr	string		.
 * @param	assetParamsIdsMatchAnd	string		.
 */
function KalturaDocumentEntryBaseFilter(){
	this.documentTypeEqual = null;
	this.documentTypeIn = null;
	this.assetParamsIdsMatchOr = null;
	this.assetParamsIdsMatchAnd = null;
}
KalturaDocumentEntryBaseFilter.inheritsFrom (KalturaBaseEntryFilter);


/**
 */
function KalturaDocumentFlavorParamsOutput(){
}
KalturaDocumentFlavorParamsOutput.inheritsFrom (KalturaFlavorParamsOutput);


/**
 * @param	dropFolderFileId	int		Id of the drop folder file object
 *		 .
 */
function KalturaDropFolderFileResource(){
	this.dropFolderFileId = null;
}
KalturaDropFolderFileResource.inheritsFrom (KalturaDataCenterContentResource);


/**
 * @param	dropFolderFileId	int		.
 */
function KalturaDropFolderImportJobData(){
	this.dropFolderFileId = null;
}
KalturaDropFolderImportJobData.inheritsFrom (KalturaSshImportJobData);


/**
 */
function KalturaEmailNotificationTemplateBaseFilter(){
}
KalturaEmailNotificationTemplateBaseFilter.inheritsFrom (KalturaEventNotificationTemplateFilter);


/**
 * @param	code	string		PHP code
 *		 .
 */
function KalturaEvalBooleanField(){
	this.code = null;
}
KalturaEvalBooleanField.inheritsFrom (KalturaBooleanField);


/**
 * @param	code	string		PHP code
 *		 .
 */
function KalturaEvalStringField(){
	this.code = null;
}
KalturaEvalStringField.inheritsFrom (KalturaStringField);


/**
 * @param	flavorParamsIdEqual	int		.
 * @param	flavorParamsIdIn	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	statusNotIn	string		.
 */
function KalturaFlavorAssetBaseFilter(){
	this.flavorParamsIdEqual = null;
	this.flavorParamsIdIn = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.statusNotIn = null;
}
KalturaFlavorAssetBaseFilter.inheritsFrom (KalturaAssetFilter);


/**
 * @param	formatEqual	string		.
 */
function KalturaFlavorParamsBaseFilter(){
	this.formatEqual = null;
}
KalturaFlavorParamsBaseFilter.inheritsFrom (KalturaAssetParamsFilter);


/**
 */
function KalturaGenericDistributionProfileBaseFilter(){
}
KalturaGenericDistributionProfileBaseFilter.inheritsFrom (KalturaDistributionProfileFilter);


/**
 * @param	idEqual	int		.
 * @param	idIn	string		.
 * @param	createdAtGreaterThanOrEqual	int		.
 * @param	createdAtLessThanOrEqual	int		.
 * @param	updatedAtGreaterThanOrEqual	int		.
 * @param	updatedAtLessThanOrEqual	int		.
 * @param	partnerIdEqual	int		.
 * @param	partnerIdIn	string		.
 * @param	isDefaultEqual	int		.
 * @param	isDefaultIn	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 */
function KalturaGenericDistributionProviderBaseFilter(){
	this.idEqual = null;
	this.idIn = null;
	this.createdAtGreaterThanOrEqual = null;
	this.createdAtLessThanOrEqual = null;
	this.updatedAtGreaterThanOrEqual = null;
	this.updatedAtLessThanOrEqual = null;
	this.partnerIdEqual = null;
	this.partnerIdIn = null;
	this.isDefaultEqual = null;
	this.isDefaultIn = null;
	this.statusEqual = null;
	this.statusIn = null;
}
KalturaGenericDistributionProviderBaseFilter.inheritsFrom (KalturaDistributionProviderFilter);


/**
 */
function KalturaGenericSyndicationFeedBaseFilter(){
}
KalturaGenericSyndicationFeedBaseFilter.inheritsFrom (KalturaBaseSyndicationFeedFilter);


/**
 */
function KalturaGoogleVideoSyndicationFeedBaseFilter(){
}
KalturaGoogleVideoSyndicationFeedBaseFilter.inheritsFrom (KalturaBaseSyndicationFeedFilter);


/**
 */
function KalturaHttpNotificationTemplateBaseFilter(){
}
KalturaHttpNotificationTemplateBaseFilter.inheritsFrom (KalturaEventNotificationTemplateFilter);


/**
 */
function KalturaITunesSyndicationFeedBaseFilter(){
}
KalturaITunesSyndicationFeedBaseFilter.inheritsFrom (KalturaBaseSyndicationFeedFilter);


/**
 * @param	densityWidth	int		.
 * @param	densityHeight	int		.
 * @param	sizeWidth	int		.
 * @param	sizeHeight	int		.
 * @param	depth	int		.
 */
function KalturaImageFlavorParamsOutput(){
	this.densityWidth = null;
	this.densityHeight = null;
	this.sizeWidth = null;
	this.sizeHeight = null;
	this.depth = null;
}
KalturaImageFlavorParamsOutput.inheritsFrom (KalturaFlavorParamsOutput);


/**
 */
function KalturaIpAddressContextField(){
}
KalturaIpAddressContextField.inheritsFrom (KalturaStringField);


/**
 * @param	contentMoid	string		Unique Kontiki MOID for the content uploaded to Kontiki
 *	     .
 * @param	serviceToken	string		.
 */
function KalturaKontikiStorageDeleteJobData(){
	this.contentMoid = null;
	this.serviceToken = null;
}
KalturaKontikiStorageDeleteJobData.inheritsFrom (KalturaStorageDeleteJobData);


/**
 * @param	flavorAssetId	string		Holds the id of the exported asset
 *		 .
 * @param	contentMoid	string		Unique Kontiki MOID for the content uploaded to Kontiki
 *		 .
 * @param	serviceToken	string		.
 */
function KalturaKontikiStorageExportJobData(){
	this.flavorAssetId = null;
	this.contentMoid = null;
	this.serviceToken = null;
}
KalturaKontikiStorageExportJobData.inheritsFrom (KalturaStorageExportJobData);


/**
 */
function KalturaKontikiStorageProfileBaseFilter(){
}
KalturaKontikiStorageProfileBaseFilter.inheritsFrom (KalturaStorageProfileFilter);


/**
 */
function KalturaMediaFlavorParamsOutput(){
}
KalturaMediaFlavorParamsOutput.inheritsFrom (KalturaFlavorParamsOutput);


/**
 */
function KalturaObjectIdField(){
}
KalturaObjectIdField.inheritsFrom (KalturaStringField);


/**
 * @param	readonly	bool		.
 */
function KalturaPdfFlavorParamsOutput(){
	this.readonly = null;
}
KalturaPdfFlavorParamsOutput.inheritsFrom (KalturaFlavorParamsOutput);


/**
 */
function KalturaPlaylistBaseFilter(){
}
KalturaPlaylistBaseFilter.inheritsFrom (KalturaBaseEntryFilter);


/**
 */
function KalturaRemoteDropFolderBaseFilter(){
}
KalturaRemoteDropFolderBaseFilter.inheritsFrom (KalturaDropFolderFilter);


/**
 */
function KalturaScpDropFolder(){
}
KalturaScpDropFolder.inheritsFrom (KalturaSshDropFolder);


/**
 * @param	localFilePath	string		Full path to the local file 
 *		 .
 */
function KalturaServerFileResource(){
	this.localFilePath = null;
}
KalturaServerFileResource.inheritsFrom (KalturaDataCenterContentResource);


/**
 */
function KalturaSftpDropFolder(){
}
KalturaSftpDropFolder.inheritsFrom (KalturaSshDropFolder);


/**
 * @param	privateKey	string		SSH private key
 *		 .
 * @param	publicKey	string		SSH public key
 *		 .
 * @param	keyPassphrase	string		Passphrase for SSH keys
 *		 .
 */
function KalturaSshUrlResource(){
	this.privateKey = null;
	this.publicKey = null;
	this.keyPassphrase = null;
}
KalturaSshUrlResource.inheritsFrom (KalturaUrlResource);


/**
 * @param	flashVersion	int		.
 * @param	poly2Bitmap	bool		.
 */
function KalturaSwfFlavorParamsOutput(){
	this.flashVersion = null;
	this.poly2Bitmap = null;
}
KalturaSwfFlavorParamsOutput.inheritsFrom (KalturaFlavorParamsOutput);


/**
 */
function KalturaSyndicationDistributionProfileBaseFilter(){
}
KalturaSyndicationDistributionProfileBaseFilter.inheritsFrom (KalturaDistributionProfileFilter);


/**
 */
function KalturaSyndicationDistributionProviderBaseFilter(){
}
KalturaSyndicationDistributionProviderBaseFilter.inheritsFrom (KalturaDistributionProviderFilter);


/**
 * @param	thumbParamsIdEqual	int		.
 * @param	thumbParamsIdIn	string		.
 * @param	statusEqual	int		.
 * @param	statusIn	string		.
 * @param	statusNotIn	string		.
 */
function KalturaThumbAssetBaseFilter(){
	this.thumbParamsIdEqual = null;
	this.thumbParamsIdIn = null;
	this.statusEqual = null;
	this.statusIn = null;
	this.statusNotIn = null;
}
KalturaThumbAssetBaseFilter.inheritsFrom (KalturaAssetFilter);


/**
 * @param	formatEqual	string		.
 */
function KalturaThumbParamsBaseFilter(){
	this.formatEqual = null;
}
KalturaThumbParamsBaseFilter.inheritsFrom (KalturaAssetParamsFilter);


/**
 * @param	offset	int		Time offset in seconds since current time
 *		 .
 */
function KalturaTimeContextField(){
	this.offset = null;
}
KalturaTimeContextField.inheritsFrom (KalturaIntegerField);


/**
 */
function KalturaTubeMogulSyndicationFeedBaseFilter(){
}
KalturaTubeMogulSyndicationFeedBaseFilter.inheritsFrom (KalturaBaseSyndicationFeedFilter);


/**
 * @param	token	string		Token that returned from upload.upload action or uploadToken.add action. 
 *		 .
 */
function KalturaUploadedFileTokenResource(){
	this.token = null;
}
KalturaUploadedFileTokenResource.inheritsFrom (KalturaDataCenterContentResource);


/**
 */
function KalturaUserAgentCondition(){
}
KalturaUserAgentCondition.inheritsFrom (KalturaRegexCondition);


/**
 */
function KalturaUserAgentContextField(){
}
KalturaUserAgentContextField.inheritsFrom (KalturaStringField);


/**
 */
function KalturaUserEmailContextField(){
}
KalturaUserEmailContextField.inheritsFrom (KalturaStringField);


/**
 * @param	groupTypeEq	int		Eq filter for the partner's group type
 *	     .
 * @param	groupTypeIn	string		In filter for the partner's group type
 *	     .
 * @param	partnerPermissionsExist	string		Filter for partner permissions- filter contains comma-separated string of permission names which the returned partners should have.
 *	     .
 */
function KalturaVarConsolePartnerFilter(){
	this.groupTypeEq = null;
	this.groupTypeIn = null;
	this.partnerPermissionsExist = null;
}
KalturaVarConsolePartnerFilter.inheritsFrom (KalturaPartnerFilter);


/**
 * @param	token	string		Token that returned from media server such as FMS or red5.
 *		 .
 */
function KalturaWebcamTokenResource(){
	this.token = null;
}
KalturaWebcamTokenResource.inheritsFrom (KalturaDataCenterContentResource);


/**
 */
function KalturaWebexDropFolderBaseFilter(){
}
KalturaWebexDropFolderBaseFilter.inheritsFrom (KalturaDropFolderFilter);


/**
 */
function KalturaWebexDropFolderFileBaseFilter(){
}
KalturaWebexDropFolderFileBaseFilter.inheritsFrom (KalturaDropFolderFileFilter);


/**
 * @param	widevineDistributionStartDate	int		License distribution window start date 
 *		 .
 * @param	widevineDistributionEndDate	int		License distribution window end date
 *		 .
 */
function KalturaWidevineFlavorParamsOutput(){
	this.widevineDistributionStartDate = null;
	this.widevineDistributionEndDate = null;
}
KalturaWidevineFlavorParamsOutput.inheritsFrom (KalturaFlavorParamsOutput);


/**
 */
function KalturaWidevineProfileBaseFilter(){
}
KalturaWidevineProfileBaseFilter.inheritsFrom (KalturaDrmProfileFilter);


/**
 */
function KalturaYahooSyndicationFeedBaseFilter(){
}
KalturaYahooSyndicationFeedBaseFilter.inheritsFrom (KalturaBaseSyndicationFeedFilter);


/**
 */
function KalturaAdCuePointFilter(){
}
KalturaAdCuePointFilter.inheritsFrom (KalturaAdCuePointBaseFilter);


/**
 */
function KalturaAdminUserFilter(){
}
KalturaAdminUserFilter.inheritsFrom (KalturaAdminUserBaseFilter);


/**
 */
function KalturaAmazonS3StorageProfileFilter(){
}
KalturaAmazonS3StorageProfileFilter.inheritsFrom (KalturaAmazonS3StorageProfileBaseFilter);


/**
 */
function KalturaAnnotationFilter(){
}
KalturaAnnotationFilter.inheritsFrom (KalturaAnnotationBaseFilter);


/**
 */
function KalturaApiActionPermissionItemFilter(){
}
KalturaApiActionPermissionItemFilter.inheritsFrom (KalturaApiActionPermissionItemBaseFilter);


/**
 */
function KalturaApiParameterPermissionItemFilter(){
}
KalturaApiParameterPermissionItemFilter.inheritsFrom (KalturaApiParameterPermissionItemBaseFilter);


/**
 */
function KalturaAssetParamsOutputFilter(){
}
KalturaAssetParamsOutputFilter.inheritsFrom (KalturaAssetParamsOutputBaseFilter);


/**
 */
function KalturaAttachmentAssetFilter(){
}
KalturaAttachmentAssetFilter.inheritsFrom (KalturaAttachmentAssetBaseFilter);


/**
 */
function KalturaCaptionAssetFilter(){
}
KalturaCaptionAssetFilter.inheritsFrom (KalturaCaptionAssetBaseFilter);


/**
 */
function KalturaCaptionParamsFilter(){
}
KalturaCaptionParamsFilter.inheritsFrom (KalturaCaptionParamsBaseFilter);


/**
 */
function KalturaCodeCuePointFilter(){
}
KalturaCodeCuePointFilter.inheritsFrom (KalturaCodeCuePointBaseFilter);


/**
 */
function KalturaConfigurableDistributionProfileFilter(){
}
KalturaConfigurableDistributionProfileFilter.inheritsFrom (KalturaConfigurableDistributionProfileBaseFilter);


/**
 */
function KalturaDataEntryFilter(){
}
KalturaDataEntryFilter.inheritsFrom (KalturaDataEntryBaseFilter);


/**
 */
function KalturaDocumentEntryFilter(){
}
KalturaDocumentEntryFilter.inheritsFrom (KalturaDocumentEntryBaseFilter);


/**
 */
function KalturaEmailNotificationTemplateFilter(){
}
KalturaEmailNotificationTemplateFilter.inheritsFrom (KalturaEmailNotificationTemplateBaseFilter);


/**
 */
function KalturaFlavorAssetFilter(){
}
KalturaFlavorAssetFilter.inheritsFrom (KalturaFlavorAssetBaseFilter);


/**
 */
function KalturaFlavorParamsFilter(){
}
KalturaFlavorParamsFilter.inheritsFrom (KalturaFlavorParamsBaseFilter);


/**
 */
function KalturaGenericDistributionProfileFilter(){
}
KalturaGenericDistributionProfileFilter.inheritsFrom (KalturaGenericDistributionProfileBaseFilter);


/**
 */
function KalturaGenericDistributionProviderFilter(){
}
KalturaGenericDistributionProviderFilter.inheritsFrom (KalturaGenericDistributionProviderBaseFilter);


/**
 */
function KalturaGenericSyndicationFeedFilter(){
}
KalturaGenericSyndicationFeedFilter.inheritsFrom (KalturaGenericSyndicationFeedBaseFilter);


/**
 */
function KalturaGoogleVideoSyndicationFeedFilter(){
}
KalturaGoogleVideoSyndicationFeedFilter.inheritsFrom (KalturaGoogleVideoSyndicationFeedBaseFilter);


/**
 */
function KalturaHttpNotificationTemplateFilter(){
}
KalturaHttpNotificationTemplateFilter.inheritsFrom (KalturaHttpNotificationTemplateBaseFilter);


/**
 */
function KalturaITunesSyndicationFeedFilter(){
}
KalturaITunesSyndicationFeedFilter.inheritsFrom (KalturaITunesSyndicationFeedBaseFilter);


/**
 */
function KalturaKontikiStorageProfileFilter(){
}
KalturaKontikiStorageProfileFilter.inheritsFrom (KalturaKontikiStorageProfileBaseFilter);


/**
 */
function KalturaPlaylistFilter(){
}
KalturaPlaylistFilter.inheritsFrom (KalturaPlaylistBaseFilter);


/**
 */
function KalturaRemoteDropFolderFilter(){
}
KalturaRemoteDropFolderFilter.inheritsFrom (KalturaRemoteDropFolderBaseFilter);


/**
 */
function KalturaSyndicationDistributionProfileFilter(){
}
KalturaSyndicationDistributionProfileFilter.inheritsFrom (KalturaSyndicationDistributionProfileBaseFilter);


/**
 */
function KalturaSyndicationDistributionProviderFilter(){
}
KalturaSyndicationDistributionProviderFilter.inheritsFrom (KalturaSyndicationDistributionProviderBaseFilter);


/**
 */
function KalturaThumbAssetFilter(){
}
KalturaThumbAssetFilter.inheritsFrom (KalturaThumbAssetBaseFilter);


/**
 */
function KalturaThumbParamsFilter(){
}
KalturaThumbParamsFilter.inheritsFrom (KalturaThumbParamsBaseFilter);


/**
 */
function KalturaTubeMogulSyndicationFeedFilter(){
}
KalturaTubeMogulSyndicationFeedFilter.inheritsFrom (KalturaTubeMogulSyndicationFeedBaseFilter);


/**
 */
function KalturaWebexDropFolderFileFilter(){
}
KalturaWebexDropFolderFileFilter.inheritsFrom (KalturaWebexDropFolderFileBaseFilter);


/**
 */
function KalturaWebexDropFolderFilter(){
}
KalturaWebexDropFolderFilter.inheritsFrom (KalturaWebexDropFolderBaseFilter);


/**
 */
function KalturaWidevineProfileFilter(){
}
KalturaWidevineProfileFilter.inheritsFrom (KalturaWidevineProfileBaseFilter);


/**
 */
function KalturaYahooSyndicationFeedFilter(){
}
KalturaYahooSyndicationFeedFilter.inheritsFrom (KalturaYahooSyndicationFeedBaseFilter);


/**
 * @param	contentLike	string		.
 * @param	contentMultiLikeOr	string		.
 * @param	contentMultiLikeAnd	string		.
 * @param	partnerDescriptionLike	string		.
 * @param	partnerDescriptionMultiLikeOr	string		.
 * @param	partnerDescriptionMultiLikeAnd	string		.
 * @param	languageEqual	string		.
 * @param	languageIn	string		.
 * @param	labelEqual	string		.
 * @param	labelIn	string		.
 * @param	startTimeGreaterThanOrEqual	int		.
 * @param	startTimeLessThanOrEqual	int		.
 * @param	endTimeGreaterThanOrEqual	int		.
 * @param	endTimeLessThanOrEqual	int		.
 */
function KalturaCaptionAssetItemFilter(){
	this.contentLike = null;
	this.contentMultiLikeOr = null;
	this.contentMultiLikeAnd = null;
	this.partnerDescriptionLike = null;
	this.partnerDescriptionMultiLikeOr = null;
	this.partnerDescriptionMultiLikeAnd = null;
	this.languageEqual = null;
	this.languageIn = null;
	this.labelEqual = null;
	this.labelIn = null;
	this.startTimeGreaterThanOrEqual = null;
	this.startTimeLessThanOrEqual = null;
	this.endTimeGreaterThanOrEqual = null;
	this.endTimeLessThanOrEqual = null;
}
KalturaCaptionAssetItemFilter.inheritsFrom (KalturaCaptionAssetFilter);


/**
 */
function KalturaDocumentFlavorParamsBaseFilter(){
}
KalturaDocumentFlavorParamsBaseFilter.inheritsFrom (KalturaFlavorParamsFilter);


/**
 * @param	flavorParamsIdEqual	int		.
 * @param	flavorParamsVersionEqual	string		.
 * @param	flavorAssetIdEqual	string		.
 * @param	flavorAssetVersionEqual	string		.
 */
function KalturaFlavorParamsOutputBaseFilter(){
	this.flavorParamsIdEqual = null;
	this.flavorParamsVersionEqual = null;
	this.flavorAssetIdEqual = null;
	this.flavorAssetVersionEqual = null;
}
KalturaFlavorParamsOutputBaseFilter.inheritsFrom (KalturaFlavorParamsFilter);


/**
 */
function KalturaFtpDropFolderBaseFilter(){
}
KalturaFtpDropFolderBaseFilter.inheritsFrom (KalturaRemoteDropFolderFilter);


/**
 */
function KalturaGenericXsltSyndicationFeedBaseFilter(){
}
KalturaGenericXsltSyndicationFeedBaseFilter.inheritsFrom (KalturaGenericSyndicationFeedFilter);


/**
 */
function KalturaImageFlavorParamsBaseFilter(){
}
KalturaImageFlavorParamsBaseFilter.inheritsFrom (KalturaFlavorParamsFilter);


/**
 */
function KalturaLiveAssetBaseFilter(){
}
KalturaLiveAssetBaseFilter.inheritsFrom (KalturaFlavorAssetFilter);


/**
 */
function KalturaLiveParamsBaseFilter(){
}
KalturaLiveParamsBaseFilter.inheritsFrom (KalturaFlavorParamsFilter);


/**
 */
function KalturaLiveStreamAdminEntry(){
}
KalturaLiveStreamAdminEntry.inheritsFrom (KalturaLiveStreamEntry);


/**
 */
function KalturaMediaFlavorParamsBaseFilter(){
}
KalturaMediaFlavorParamsBaseFilter.inheritsFrom (KalturaFlavorParamsFilter);


/**
 */
function KalturaMixEntryBaseFilter(){
}
KalturaMixEntryBaseFilter.inheritsFrom (KalturaPlayableEntryFilter);


/**
 */
function KalturaPdfFlavorParamsBaseFilter(){
}
KalturaPdfFlavorParamsBaseFilter.inheritsFrom (KalturaFlavorParamsFilter);


/**
 */
function KalturaSshDropFolderBaseFilter(){
}
KalturaSshDropFolderBaseFilter.inheritsFrom (KalturaRemoteDropFolderFilter);


/**
 */
function KalturaSwfFlavorParamsBaseFilter(){
}
KalturaSwfFlavorParamsBaseFilter.inheritsFrom (KalturaFlavorParamsFilter);


/**
 * @param	thumbParamsIdEqual	int		.
 * @param	thumbParamsVersionEqual	string		.
 * @param	thumbAssetIdEqual	string		.
 * @param	thumbAssetVersionEqual	string		.
 */
function KalturaThumbParamsOutputBaseFilter(){
	this.thumbParamsIdEqual = null;
	this.thumbParamsVersionEqual = null;
	this.thumbAssetIdEqual = null;
	this.thumbAssetVersionEqual = null;
}
KalturaThumbParamsOutputBaseFilter.inheritsFrom (KalturaThumbParamsFilter);


/**
 */
function KalturaWidevineFlavorAssetBaseFilter(){
}
KalturaWidevineFlavorAssetBaseFilter.inheritsFrom (KalturaFlavorAssetFilter);


/**
 */
function KalturaWidevineFlavorParamsBaseFilter(){
}
KalturaWidevineFlavorParamsBaseFilter.inheritsFrom (KalturaFlavorParamsFilter);


/**
 */
function KalturaDocumentFlavorParamsFilter(){
}
KalturaDocumentFlavorParamsFilter.inheritsFrom (KalturaDocumentFlavorParamsBaseFilter);


/**
 */
function KalturaFlavorParamsOutputFilter(){
}
KalturaFlavorParamsOutputFilter.inheritsFrom (KalturaFlavorParamsOutputBaseFilter);


/**
 */
function KalturaFtpDropFolderFilter(){
}
KalturaFtpDropFolderFilter.inheritsFrom (KalturaFtpDropFolderBaseFilter);


/**
 */
function KalturaGenericXsltSyndicationFeedFilter(){
}
KalturaGenericXsltSyndicationFeedFilter.inheritsFrom (KalturaGenericXsltSyndicationFeedBaseFilter);


/**
 */
function KalturaImageFlavorParamsFilter(){
}
KalturaImageFlavorParamsFilter.inheritsFrom (KalturaImageFlavorParamsBaseFilter);


/**
 */
function KalturaLiveAssetFilter(){
}
KalturaLiveAssetFilter.inheritsFrom (KalturaLiveAssetBaseFilter);


/**
 */
function KalturaLiveParamsFilter(){
}
KalturaLiveParamsFilter.inheritsFrom (KalturaLiveParamsBaseFilter);


/**
 */
function KalturaMediaFlavorParamsFilter(){
}
KalturaMediaFlavorParamsFilter.inheritsFrom (KalturaMediaFlavorParamsBaseFilter);


/**
 */
function KalturaMixEntryFilter(){
}
KalturaMixEntryFilter.inheritsFrom (KalturaMixEntryBaseFilter);


/**
 */
function KalturaPdfFlavorParamsFilter(){
}
KalturaPdfFlavorParamsFilter.inheritsFrom (KalturaPdfFlavorParamsBaseFilter);


/**
 */
function KalturaSshDropFolderFilter(){
}
KalturaSshDropFolderFilter.inheritsFrom (KalturaSshDropFolderBaseFilter);


/**
 */
function KalturaSwfFlavorParamsFilter(){
}
KalturaSwfFlavorParamsFilter.inheritsFrom (KalturaSwfFlavorParamsBaseFilter);


/**
 */
function KalturaThumbParamsOutputFilter(){
}
KalturaThumbParamsOutputFilter.inheritsFrom (KalturaThumbParamsOutputBaseFilter);


/**
 */
function KalturaWidevineFlavorAssetFilter(){
}
KalturaWidevineFlavorAssetFilter.inheritsFrom (KalturaWidevineFlavorAssetBaseFilter);


/**
 */
function KalturaWidevineFlavorParamsFilter(){
}
KalturaWidevineFlavorParamsFilter.inheritsFrom (KalturaWidevineFlavorParamsBaseFilter);


/**
 */
function KalturaDocumentFlavorParamsOutputBaseFilter(){
}
KalturaDocumentFlavorParamsOutputBaseFilter.inheritsFrom (KalturaFlavorParamsOutputFilter);


/**
 * @param	externalSourceTypeEqual	string		.
 * @param	externalSourceTypeIn	string		.
 * @param	assetParamsIdsMatchOr	string		.
 * @param	assetParamsIdsMatchAnd	string		.
 */
function KalturaExternalMediaEntryBaseFilter(){
	this.externalSourceTypeEqual = null;
	this.externalSourceTypeIn = null;
	this.assetParamsIdsMatchOr = null;
	this.assetParamsIdsMatchAnd = null;
}
KalturaExternalMediaEntryBaseFilter.inheritsFrom (KalturaMediaEntryFilter);


/**
 */
function KalturaImageFlavorParamsOutputBaseFilter(){
}
KalturaImageFlavorParamsOutputBaseFilter.inheritsFrom (KalturaFlavorParamsOutputFilter);


/**
 */
function KalturaLiveEntryBaseFilter(){
}
KalturaLiveEntryBaseFilter.inheritsFrom (KalturaMediaEntryFilter);


/**
 */
function KalturaMediaFlavorParamsOutputBaseFilter(){
}
KalturaMediaFlavorParamsOutputBaseFilter.inheritsFrom (KalturaFlavorParamsOutputFilter);


/**
 */
function KalturaPdfFlavorParamsOutputBaseFilter(){
}
KalturaPdfFlavorParamsOutputBaseFilter.inheritsFrom (KalturaFlavorParamsOutputFilter);


/**
 */
function KalturaScpDropFolderBaseFilter(){
}
KalturaScpDropFolderBaseFilter.inheritsFrom (KalturaSshDropFolderFilter);


/**
 */
function KalturaSftpDropFolderBaseFilter(){
}
KalturaSftpDropFolderBaseFilter.inheritsFrom (KalturaSshDropFolderFilter);


/**
 */
function KalturaSwfFlavorParamsOutputBaseFilter(){
}
KalturaSwfFlavorParamsOutputBaseFilter.inheritsFrom (KalturaFlavorParamsOutputFilter);


/**
 */
function KalturaWidevineFlavorParamsOutputBaseFilter(){
}
KalturaWidevineFlavorParamsOutputBaseFilter.inheritsFrom (KalturaFlavorParamsOutputFilter);


/**
 */
function KalturaDocumentFlavorParamsOutputFilter(){
}
KalturaDocumentFlavorParamsOutputFilter.inheritsFrom (KalturaDocumentFlavorParamsOutputBaseFilter);


/**
 */
function KalturaExternalMediaEntryFilter(){
}
KalturaExternalMediaEntryFilter.inheritsFrom (KalturaExternalMediaEntryBaseFilter);


/**
 */
function KalturaImageFlavorParamsOutputFilter(){
}
KalturaImageFlavorParamsOutputFilter.inheritsFrom (KalturaImageFlavorParamsOutputBaseFilter);


/**
 * @param	isLive	int		.
 */
function KalturaLiveEntryFilter(){
	this.isLive = null;
}
KalturaLiveEntryFilter.inheritsFrom (KalturaLiveEntryBaseFilter);


/**
 */
function KalturaMediaFlavorParamsOutputFilter(){
}
KalturaMediaFlavorParamsOutputFilter.inheritsFrom (KalturaMediaFlavorParamsOutputBaseFilter);


/**
 */
function KalturaPdfFlavorParamsOutputFilter(){
}
KalturaPdfFlavorParamsOutputFilter.inheritsFrom (KalturaPdfFlavorParamsOutputBaseFilter);


/**
 */
function KalturaScpDropFolderFilter(){
}
KalturaScpDropFolderFilter.inheritsFrom (KalturaScpDropFolderBaseFilter);


/**
 */
function KalturaSftpDropFolderFilter(){
}
KalturaSftpDropFolderFilter.inheritsFrom (KalturaSftpDropFolderBaseFilter);


/**
 */
function KalturaSwfFlavorParamsOutputFilter(){
}
KalturaSwfFlavorParamsOutputFilter.inheritsFrom (KalturaSwfFlavorParamsOutputBaseFilter);


/**
 */
function KalturaWidevineFlavorParamsOutputFilter(){
}
KalturaWidevineFlavorParamsOutputFilter.inheritsFrom (KalturaWidevineFlavorParamsOutputBaseFilter);


/**
 */
function KalturaLiveChannelBaseFilter(){
}
KalturaLiveChannelBaseFilter.inheritsFrom (KalturaLiveEntryFilter);


/**
 */
function KalturaLiveStreamEntryBaseFilter(){
}
KalturaLiveStreamEntryBaseFilter.inheritsFrom (KalturaLiveEntryFilter);


/**
 */
function KalturaLiveChannelFilter(){
}
KalturaLiveChannelFilter.inheritsFrom (KalturaLiveChannelBaseFilter);


/**
 */
function KalturaLiveStreamEntryFilter(){
}
KalturaLiveStreamEntryFilter.inheritsFrom (KalturaLiveStreamEntryBaseFilter);


/**
 */
function KalturaLiveStreamAdminEntryBaseFilter(){
}
KalturaLiveStreamAdminEntryBaseFilter.inheritsFrom (KalturaLiveStreamEntryFilter);


/**
 */
function KalturaLiveStreamAdminEntryFilter(){
}
KalturaLiveStreamAdminEntryFilter.inheritsFrom (KalturaLiveStreamAdminEntryBaseFilter);


