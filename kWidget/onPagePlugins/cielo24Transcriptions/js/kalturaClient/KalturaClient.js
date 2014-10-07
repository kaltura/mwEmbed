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
 * The Kaltura Client - this is the facade through which all service actions should be called.
 * @param config the Kaltura configuration object holding partner credentials (type: KalturaConfiguration).
 */
function KalturaClient(config){
	this.init(config);
}
KalturaClient.inheritsFrom (KalturaClientBase);
KalturaClient.prototype.apiVersion = "3.1.6";
/**
 * Manage access control profiles
 *	 
 * @param KalturaAccessControlProfileService
 */
KalturaClient.prototype.accessControlProfile = null;
/**
 * Add & Manage Access Controls
 *	 
 * @param KalturaAccessControlService
 */
KalturaClient.prototype.accessControl = null;
/**
 * Manage details for the administrative user
 *	 
 * @param KalturaAdminUserService
 */
KalturaClient.prototype.adminUser = null;
/**
 * Base Entry Service
 *	 
 * @param KalturaBaseEntryService
 */
KalturaClient.prototype.baseEntry = null;
/**
 * Bulk upload service is used to upload & manage bulk uploads using CSV files.
 *	 This service manages only entry bulk uploads.
 *	 
 * @param KalturaBulkUploadService
 */
KalturaClient.prototype.bulkUpload = null;
/**
 * Add & Manage CategoryEntry - assign entry to category
 *	 
 * @param KalturaCategoryEntryService
 */
KalturaClient.prototype.categoryEntry = null;
/**
 * Add & Manage Categories
 *	 
 * @param KalturaCategoryService
 */
KalturaClient.prototype.category = null;
/**
 * Add & Manage CategoryUser - membership of a user in a category
 *	 
 * @param KalturaCategoryUserService
 */
KalturaClient.prototype.categoryUser = null;
/**
 * Manage the connection between Conversion Profiles and Asset Params
 *	 
 * @param KalturaConversionProfileAssetParamsService
 */
KalturaClient.prototype.conversionProfileAssetParams = null;
/**
 * Add & Manage Conversion Profiles
 *	 
 * @param KalturaConversionProfileService
 */
KalturaClient.prototype.conversionProfile = null;
/**
 * Data service lets you manage data content (textual content)
 *	 
 * @param KalturaDataService
 */
KalturaClient.prototype.data = null;
/**
 * Document service
 *	 
 * @param KalturaDocumentService
 */
KalturaClient.prototype.document = null;
/**
 * EmailIngestionProfile service lets you manage email ingestion profile records
 *	 
 * @param KalturaEmailIngestionProfileService
 */
KalturaClient.prototype.EmailIngestionProfile = null;
/**
 * Manage file assets
 *	 
 * @param KalturaFileAssetService
 */
KalturaClient.prototype.fileAsset = null;
/**
 * Retrieve information and invoke actions on Flavor Asset
 *	 
 * @param KalturaFlavorAssetService
 */
KalturaClient.prototype.flavorAsset = null;
/**
 * Flavor Params Output service
 *	 
 * @param KalturaFlavorParamsOutputService
 */
KalturaClient.prototype.flavorParamsOutput = null;
/**
 * Add & Manage Flavor Params
 *	 
 * @param KalturaFlavorParamsService
 */
KalturaClient.prototype.flavorParams = null;
/**
 * Manage live channel segments
 *	 
 * @param KalturaLiveChannelSegmentService
 */
KalturaClient.prototype.liveChannelSegment = null;
/**
 * Live Channel service lets you manage live channels
 *	 
 * @param KalturaLiveChannelService
 */
KalturaClient.prototype.liveChannel = null;
/**
 * Live Stream service lets you manage live stream entries
 *	 
 * @param KalturaLiveStreamService
 */
KalturaClient.prototype.liveStream = null;
/**
 * Media Info service
 *	 
 * @param KalturaMediaInfoService
 */
KalturaClient.prototype.mediaInfo = null;
/**
 * Manage media servers
 *	 
 * @param KalturaMediaServerService
 */
KalturaClient.prototype.mediaServer = null;
/**
 * Media service lets you upload and manage media files (images / videos & audio)
 *	 
 * @param KalturaMediaService
 */
KalturaClient.prototype.media = null;
/**
 * A Mix is an XML unique format invented by Kaltura, it allows the user to create a mix of videos and images, in and out points, transitions, text overlays, soundtrack, effects and much more...
 *	 Mixing service lets you create a new mix, manage its metadata and make basic manipulations.   
 *	 
 * @param KalturaMixingService
 */
KalturaClient.prototype.mixing = null;
/**
 * Notification Service
 *	 
 * @param KalturaNotificationService
 */
KalturaClient.prototype.notification = null;
/**
 * partner service allows you to change/manage your partner personal details and settings as well
 *	 
 * @param KalturaPartnerService
 */
KalturaClient.prototype.partner = null;
/**
 * PermissionItem service lets you create and manage permission items
 *	 
 * @param KalturaPermissionItemService
 */
KalturaClient.prototype.permissionItem = null;
/**
 * Permission service lets you create and manage user permissions
 *	 
 * @param KalturaPermissionService
 */
KalturaClient.prototype.permission = null;
/**
 * Playlist service lets you create,manage and play your playlists
 *	 Playlists could be static (containing a fixed list of entries) or dynamic (baseed on a filter)
 *	 
 * @param KalturaPlaylistService
 */
KalturaClient.prototype.playlist = null;
/**
 * api for getting reports data by the report type and some inputFilter
 *	 
 * @param KalturaReportService
 */
KalturaClient.prototype.report = null;
/**
 * Expose the schema definitions for syndication MRSS, bulk upload XML and other schema types. 
 *	 
 * @param KalturaSchemaService
 */
KalturaClient.prototype.schema = null;
/**
 * Search service allows you to search for media in various media providers
 *	 This service is being used mostly by the CW component
 *	 
 * @param KalturaSearchService
 */
KalturaClient.prototype.search = null;
/**
 * Session service
 *	 
 * @param KalturaSessionService
 */
KalturaClient.prototype.session = null;
/**
 * Stats Service
 *	 
 * @param KalturaStatsService
 */
KalturaClient.prototype.stats = null;
/**
 * Storage Profiles service
 *	 
 * @param KalturaStorageProfileService
 */
KalturaClient.prototype.storageProfile = null;
/**
 * Add & Manage Syndication Feeds
 *	 
 * @param KalturaSyndicationFeedService
 */
KalturaClient.prototype.syndicationFeed = null;
/**
 * System service is used for internal system helpers & to retrieve system level information
 *	 
 * @param KalturaSystemService
 */
KalturaClient.prototype.system = null;
/**
 * Retrieve information and invoke actions on Thumb Asset
 *	 
 * @param KalturaThumbAssetService
 */
KalturaClient.prototype.thumbAsset = null;
/**
 * Thumbnail Params Output service
 *	 
 * @param KalturaThumbParamsOutputService
 */
KalturaClient.prototype.thumbParamsOutput = null;
/**
 * Add & Manage Thumb Params
 *	 
 * @param KalturaThumbParamsService
 */
KalturaClient.prototype.thumbParams = null;
/**
 * UiConf service lets you create and manage your UIConfs for the various flash components
 *	 This service is used by the KMC-ApplicationStudio
 *	 
 * @param KalturaUiConfService
 */
KalturaClient.prototype.uiConf = null;
/**
 * 
 * @param KalturaUploadService
 */
KalturaClient.prototype.upload = null;
/**
 * 
 * @param KalturaUploadTokenService
 */
KalturaClient.prototype.uploadToken = null;
/**
 * UserRole service lets you create and manage user roles
 *	 
 * @param KalturaUserRoleService
 */
KalturaClient.prototype.userRole = null;
/**
 * Manage partner users on Kaltura's side
 *	 The userId in kaltura is the unique Id in the partner's system, and the [partnerId,Id] couple are unique key in kaltura's DB
 *	 
 * @param KalturaUserService
 */
KalturaClient.prototype.user = null;
/**
 * widget service for full widget management
 *	 
 * @param KalturaWidgetService
 */
KalturaClient.prototype.widget = null;
/**
 * Internal Service is used for actions that are used internally in Kaltura applications and might be changed in the future without any notice.
 *	 
 * @param KalturaXInternalService
 */
KalturaClient.prototype.xInternal = null;
/**
 * Metadata service
 *	 
 * @param KalturaMetadataService
 */
KalturaClient.prototype.metadata = null;
/**
 * Metadata Profile service
 *	 
 * @param KalturaMetadataProfileService
 */
KalturaClient.prototype.metadataProfile = null;
/**
 * Document service lets you upload and manage document files
 *	 
 * @param KalturaDocumentsService
 */
KalturaClient.prototype.documents = null;
/**
 * Annotation service - Video Annotation
 *	 
 * @param KalturaAnnotationService
 */
KalturaClient.prototype.annotation = null;
/**
 * Aspera service
 *	 
 * @param KalturaAsperaService
 */
KalturaClient.prototype.aspera = null;
/**
 * Retrieve information and invoke actions on attachment Asset
 *	 
 * @param KalturaAttachmentAssetService
 */
KalturaClient.prototype.attachmentAsset = null;
/**
 * Audit Trail service
 *	 
 * @param KalturaAuditTrailService
 */
KalturaClient.prototype.auditTrail = null;
/**
 * Bulk upload service is used to upload & manage bulk uploads
 *	 
 * @param KalturaBulkService
 */
KalturaClient.prototype.bulk = null;
/**
 * Retrieve information and invoke actions on caption Asset
 *	 
 * @param KalturaCaptionAssetService
 */
KalturaClient.prototype.captionAsset = null;
/**
 * Add & Manage Caption Params
 *	 
 * @param KalturaCaptionParamsService
 */
KalturaClient.prototype.captionParams = null;
/**
 * Search caption asset items
 *	 
 * @param KalturaCaptionAssetItemService
 */
KalturaClient.prototype.captionAssetItem = null;
/**
 * Distribution Profile service
 *	 
 * @param KalturaDistributionProfileService
 */
KalturaClient.prototype.distributionProfile = null;
/**
 * Entry Distribution service
 *	 
 * @param KalturaEntryDistributionService
 */
KalturaClient.prototype.entryDistribution = null;
/**
 * Distribution Provider service
 *	 
 * @param KalturaDistributionProviderService
 */
KalturaClient.prototype.distributionProvider = null;
/**
 * Generic Distribution Provider service
 *	 
 * @param KalturaGenericDistributionProviderService
 */
KalturaClient.prototype.genericDistributionProvider = null;
/**
 * Generic Distribution Provider Actions service
 *	 
 * @param KalturaGenericDistributionProviderActionService
 */
KalturaClient.prototype.genericDistributionProviderAction = null;
/**
 * Cue Point service
 *	 
 * @param KalturaCuePointService
 */
KalturaClient.prototype.cuePoint = null;
/**
 * DropFolder service lets you create and manage drop folders
 *	 
 * @param KalturaDropFolderService
 */
KalturaClient.prototype.dropFolder = null;
/**
 * DropFolderFile service lets you create and manage drop folder files
 *	 
 * @param KalturaDropFolderFileService
 */
KalturaClient.prototype.dropFolderFile = null;
/**
 * Event notification template service lets you create and manage event notification templates
 *	 
 * @param KalturaEventNotificationTemplateService
 */
KalturaClient.prototype.eventNotificationTemplate = null;
/**
 * Allows user to 'like' or 'unlike' and entry
 *	 
 * @param KalturaLikeService
 */
KalturaClient.prototype.like = null;
/**
 * Short link service
 *	 
 * @param KalturaShortLinkService
 */
KalturaClient.prototype.shortLink = null;
/**
 * Search object tags
 *	 
 * @param KalturaTagService
 */
KalturaClient.prototype.tag = null;
/**
 * Utility service for the Multi-publishers console
 *	 
 * @param KalturaVarConsoleService
 */
KalturaClient.prototype.varConsole = null;
/**
 * Virus scan profile service
 *	 
 * @param KalturaVirusScanProfileService
 */
KalturaClient.prototype.virusScanProfile = null;
/**
 * External media service lets you upload and manage embed codes and external playable content
 *	 
 * @param KalturaExternalMediaService
 */
KalturaClient.prototype.externalMedia = null;
/**
 * 
 * @param KalturaDrmProfileService
 */
KalturaClient.prototype.drmProfile = null;
/**
 * WidevineDrmService serves as a license proxy to a Widevine license server
 *	 
 * @param KalturaWidevineDrmService
 */
KalturaClient.prototype.widevineDrm = null;
/**
 * The client constructor.
 * @param config the Kaltura configuration object holding partner credentials (type: KalturaConfiguration).
 */
KalturaClient.prototype.init = function(config){
	//call the super constructor:
	KalturaClientBase.prototype.init.apply(this, arguments);
	//initialize client services:
	this.accessControlProfile = new KalturaAccessControlProfileService(this);
	this.accessControl = new KalturaAccessControlService(this);
	this.adminUser = new KalturaAdminUserService(this);
	this.baseEntry = new KalturaBaseEntryService(this);
	this.bulkUpload = new KalturaBulkUploadService(this);
	this.categoryEntry = new KalturaCategoryEntryService(this);
	this.category = new KalturaCategoryService(this);
	this.categryUser = new KalturaCategoryUserService(this);
	this.conversionProfileAssetParams = new KalturaConversionProfileAssetParamsService(this);
	this.conversionProfile = new KalturaConversionProfileService(this);
	this.data = new KalturaDataService(this);
	this.document = new KalturaDocumentService(this);
	this.EmailIngestionProfile = new KalturaEmailIngestionProfileService(this);
	this.fileAsset = new KalturaFileAssetService(this);
	this.flavorAsset = new KalturaFlavorAssetService(this);
	this.flavorParamsOutput = new KalturaFlavorParamsOutputService(this);
	this.flavorParams = new KalturaFlavorParamsService(this);
	this.liveChannelSegment = new KalturaLiveChannelSegmentService(this);
	this.liveChannel = new KalturaLiveChannelService(this);
	this.liveStream = new KalturaLiveStreamService(this);
	this.mediaInfo = new KalturaMediaInfoService(this);
	this.mediaServer = new KalturaMediaServerService(this);
	this.media = new KalturaMediaService(this);
	this.mixing = new KalturaMixingService(this);
	this.notification = new KalturaNotificationService(this);
	this.partner = new KalturaPartnerService(this);
	this.permissionItem = new KalturaPermissionItemService(this);
	this.permission = new KalturaPermissionService(this);
	this.playlist = new KalturaPlaylistService(this);
	this.report = new KalturaReportService(this);
	this.schema = new KalturaSchemaService(this);
	this.search = new KalturaSearchService(this);
	this.session = new KalturaSessionService(this);
	this.stats = new KalturaStatsService(this);
	this.storageProfile = new KalturaStorageProfileService(this);
	this.syndicationFeed = new KalturaSyndicationFeedService(this);
	this.system = new KalturaSystemService(this);
	this.thumbAsset = new KalturaThumbAssetService(this);
	this.thumbParamsOutput = new KalturaThumbParamsOutputService(this);
	this.thumbParams = new KalturaThumbParamsService(this);
	this.uiConf = new KalturaUiConfService(this);
	this.upload = new KalturaUploadService(this);
	this.uploadToken = new KalturaUploadTokenService(this);
	this.userRole = new KalturaUserRoleService(this);
	this.user = new KalturaUserService(this);
	this.widget = new KalturaWidgetService(this);
	this.xInternal = new KalturaXInternalService(this);
	this.metadata = new KalturaMetadataService(this);
	this.metadataProfile = new KalturaMetadataProfileService(this);
	this.documents = new KalturaDocumentsService(this);
	this.annotation = new KalturaAnnotationService(this);
	this.aspera = new KalturaAsperaService(this);
	this.attachmentAsset = new KalturaAttachmentAssetService(this);
	this.auditTrail = new KalturaAuditTrailService(this);
	this.bulk = new KalturaBulkService(this);
	this.captionAsset = new KalturaCaptionAssetService(this);
	this.captionParams = new KalturaCaptionParamsService(this);
	this.captionAssetItem = new KalturaCaptionAssetItemService(this);
	this.distributionProfile = new KalturaDistributionProfileService(this);
	this.entryDistribution = new KalturaEntryDistributionService(this);
	this.distributionProvider = new KalturaDistributionProviderService(this);
	this.genericDistributionProvider = new KalturaGenericDistributionProviderService(this);
	this.genericDistributionProviderAction = new KalturaGenericDistributionProviderActionService(this);
	this.cuePoint = new KalturaCuePointService(this);
	this.dropFolder = new KalturaDropFolderService(this);
	this.dropFolderFile = new KalturaDropFolderFileService(this);
	this.eventNotificationTemplate = new KalturaEventNotificationTemplateService(this);
	this.like = new KalturaLikeService(this);
	this.shortLink = new KalturaShortLinkService(this);
	this.tag = new KalturaTagService(this);
	this.varConsole = new KalturaVarConsoleService(this);
	this.virusScanProfile = new KalturaVirusScanProfileService(this);
	this.externalMedia = new KalturaExternalMediaService(this);
	this.drmProfile = new KalturaDrmProfileService(this);
	this.widevineDrm = new KalturaWidevineDrmService(this);
}
