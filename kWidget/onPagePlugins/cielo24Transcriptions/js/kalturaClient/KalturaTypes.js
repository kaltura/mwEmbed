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

function KalturaAppearInListType(){
}
KalturaAppearInListType.PARTNER_ONLY = 1;
KalturaAppearInListType.CATEGORY_MEMBERS_ONLY = 3;

function KalturaAssetParamsDeletePolicy(){
}
KalturaAssetParamsDeletePolicy.KEEP = 0;
KalturaAssetParamsDeletePolicy.DELETE = 1;

function KalturaAssetParamsOrigin(){
}
KalturaAssetParamsOrigin.CONVERT = 0;
KalturaAssetParamsOrigin.INGEST = 1;
KalturaAssetParamsOrigin.CONVERT_WHEN_MISSING = 2;

function KalturaAssetStatus(){
}
KalturaAssetStatus.ERROR = -1;
KalturaAssetStatus.QUEUED = 0;
KalturaAssetStatus.READY = 2;
KalturaAssetStatus.DELETED = 3;
KalturaAssetStatus.IMPORTING = 7;
KalturaAssetStatus.EXPORTING = 9;

function KalturaAttachmentAssetStatus(){
}
KalturaAttachmentAssetStatus.ERROR = -1;
KalturaAttachmentAssetStatus.QUEUED = 0;
KalturaAttachmentAssetStatus.READY = 2;
KalturaAttachmentAssetStatus.DELETED = 3;
KalturaAttachmentAssetStatus.IMPORTING = 7;
KalturaAttachmentAssetStatus.EXPORTING = 9;

function KalturaAuditTrailChangeXmlNodeType(){
}
KalturaAuditTrailChangeXmlNodeType.CHANGED = 1;
KalturaAuditTrailChangeXmlNodeType.ADDED = 2;
KalturaAuditTrailChangeXmlNodeType.REMOVED = 3;

function KalturaAuditTrailContext(){
}
KalturaAuditTrailContext.CLIENT = -1;
KalturaAuditTrailContext.SCRIPT = 0;
KalturaAuditTrailContext.PS2 = 1;
KalturaAuditTrailContext.API_V3 = 2;

function KalturaAuditTrailFileSyncType(){
}
KalturaAuditTrailFileSyncType.FILE = 1;
KalturaAuditTrailFileSyncType.LINK = 2;
KalturaAuditTrailFileSyncType.URL = 3;

function KalturaAuditTrailStatus(){
}
KalturaAuditTrailStatus.PENDING = 1;
KalturaAuditTrailStatus.READY = 2;
KalturaAuditTrailStatus.FAILED = 3;

function KalturaBatchJobErrorTypes(){
}
KalturaBatchJobErrorTypes.APP = 0;
KalturaBatchJobErrorTypes.RUNTIME = 1;
KalturaBatchJobErrorTypes.HTTP = 2;
KalturaBatchJobErrorTypes.CURL = 3;
KalturaBatchJobErrorTypes.KALTURA_API = 4;
KalturaBatchJobErrorTypes.KALTURA_CLIENT = 5;

function KalturaBatchJobStatus(){
}
KalturaBatchJobStatus.PENDING = 0;
KalturaBatchJobStatus.QUEUED = 1;
KalturaBatchJobStatus.PROCESSING = 2;
KalturaBatchJobStatus.PROCESSED = 3;
KalturaBatchJobStatus.MOVEFILE = 4;
KalturaBatchJobStatus.FINISHED = 5;
KalturaBatchJobStatus.FAILED = 6;
KalturaBatchJobStatus.ABORTED = 7;
KalturaBatchJobStatus.ALMOST_DONE = 8;
KalturaBatchJobStatus.RETRY = 9;
KalturaBatchJobStatus.FATAL = 10;
KalturaBatchJobStatus.DONT_PROCESS = 11;
KalturaBatchJobStatus.FINISHED_PARTIALLY = 12;

function KalturaBitRateMode(){
}
KalturaBitRateMode.CBR = 1;
KalturaBitRateMode.VBR = 2;

function KalturaBulkUploadCsvVersion(){
}
KalturaBulkUploadCsvVersion.V1 = 1;
KalturaBulkUploadCsvVersion.V2 = 2;
KalturaBulkUploadCsvVersion.V3 = 3;

function KalturaCaptionAssetStatus(){
}
KalturaCaptionAssetStatus.ERROR = -1;
KalturaCaptionAssetStatus.QUEUED = 0;
KalturaCaptionAssetStatus.READY = 2;
KalturaCaptionAssetStatus.DELETED = 3;
KalturaCaptionAssetStatus.IMPORTING = 7;
KalturaCaptionAssetStatus.EXPORTING = 9;

function KalturaCategoryEntryStatus(){
}
KalturaCategoryEntryStatus.PENDING = 1;
KalturaCategoryEntryStatus.ACTIVE = 2;
KalturaCategoryEntryStatus.DELETED = 3;
KalturaCategoryEntryStatus.REJECTED = 4;

function KalturaCategoryStatus(){
}
KalturaCategoryStatus.UPDATING = 1;
KalturaCategoryStatus.ACTIVE = 2;
KalturaCategoryStatus.DELETED = 3;
KalturaCategoryStatus.PURGED = 4;

function KalturaCategoryUserPermissionLevel(){
}
KalturaCategoryUserPermissionLevel.MANAGER = 0;
KalturaCategoryUserPermissionLevel.MODERATOR = 1;
KalturaCategoryUserPermissionLevel.CONTRIBUTOR = 2;
KalturaCategoryUserPermissionLevel.MEMBER = 3;
KalturaCategoryUserPermissionLevel.NONE = 4;

function KalturaCategoryUserStatus(){
}
KalturaCategoryUserStatus.ACTIVE = 1;
KalturaCategoryUserStatus.PENDING = 2;
KalturaCategoryUserStatus.NOT_ACTIVE = 3;
KalturaCategoryUserStatus.DELETED = 4;

function KalturaCommercialUseType(){
}
KalturaCommercialUseType.NON_COMMERCIAL_USE = 0;
KalturaCommercialUseType.COMMERCIAL_USE = 1;

function KalturaContributionPolicyType(){
}
KalturaContributionPolicyType.ALL = 1;
KalturaContributionPolicyType.MEMBERS_WITH_CONTRIBUTION_PERMISSION = 2;

function KalturaControlPanelCommandStatus(){
}
KalturaControlPanelCommandStatus.PENDING = 1;
KalturaControlPanelCommandStatus.HANDLED = 2;
KalturaControlPanelCommandStatus.DONE = 3;
KalturaControlPanelCommandStatus.FAILED = 4;

function KalturaControlPanelCommandTargetType(){
}
KalturaControlPanelCommandTargetType.DATA_CENTER = 1;
KalturaControlPanelCommandTargetType.SCHEDULER = 2;
KalturaControlPanelCommandTargetType.JOB_TYPE = 3;
KalturaControlPanelCommandTargetType.JOB = 4;
KalturaControlPanelCommandTargetType.BATCH = 5;

function KalturaControlPanelCommandType(){
}
KalturaControlPanelCommandType.KILL = 4;

function KalturaCountryRestrictionType(){
}
KalturaCountryRestrictionType.RESTRICT_COUNTRY_LIST = 0;
KalturaCountryRestrictionType.ALLOW_COUNTRY_LIST = 1;

function KalturaCuePointStatus(){
}
KalturaCuePointStatus.READY = 1;
KalturaCuePointStatus.DELETED = 2;

function KalturaDVRStatus(){
}
KalturaDVRStatus.DISABLED = 0;
KalturaDVRStatus.ENABLED = 1;

function KalturaDirectoryRestrictionType(){
}
KalturaDirectoryRestrictionType.DONT_DISPLAY = 0;
KalturaDirectoryRestrictionType.DISPLAY_WITH_LINK = 1;

function KalturaDistributionAction(){
}
KalturaDistributionAction.SUBMIT = 1;
KalturaDistributionAction.UPDATE = 2;
KalturaDistributionAction.DELETE = 3;
KalturaDistributionAction.FETCH_REPORT = 4;

function KalturaDistributionErrorType(){
}
KalturaDistributionErrorType.MISSING_FLAVOR = 1;
KalturaDistributionErrorType.MISSING_THUMBNAIL = 2;
KalturaDistributionErrorType.MISSING_METADATA = 3;
KalturaDistributionErrorType.INVALID_DATA = 4;
KalturaDistributionErrorType.MISSING_ASSET = 5;

function KalturaDistributionFieldRequiredStatus(){
}
KalturaDistributionFieldRequiredStatus.NOT_REQUIRED = 0;
KalturaDistributionFieldRequiredStatus.REQUIRED_BY_PROVIDER = 1;
KalturaDistributionFieldRequiredStatus.REQUIRED_BY_PARTNER = 2;

function KalturaDistributionProfileActionStatus(){
}
KalturaDistributionProfileActionStatus.DISABLED = 1;
KalturaDistributionProfileActionStatus.AUTOMATIC = 2;
KalturaDistributionProfileActionStatus.MANUAL = 3;

function KalturaDistributionProfileStatus(){
}
KalturaDistributionProfileStatus.DISABLED = 1;
KalturaDistributionProfileStatus.ENABLED = 2;
KalturaDistributionProfileStatus.DELETED = 3;

function KalturaDistributionProtocol(){
}
KalturaDistributionProtocol.FTP = 1;
KalturaDistributionProtocol.SCP = 2;
KalturaDistributionProtocol.SFTP = 3;
KalturaDistributionProtocol.HTTP = 4;
KalturaDistributionProtocol.HTTPS = 5;
KalturaDistributionProtocol.ASPERA = 10;

function KalturaDistributionValidationErrorType(){
}
KalturaDistributionValidationErrorType.CUSTOM_ERROR = 0;
KalturaDistributionValidationErrorType.STRING_EMPTY = 1;
KalturaDistributionValidationErrorType.STRING_TOO_LONG = 2;
KalturaDistributionValidationErrorType.STRING_TOO_SHORT = 3;
KalturaDistributionValidationErrorType.INVALID_FORMAT = 4;

function KalturaDocumentType(){
}
KalturaDocumentType.DOCUMENT = 11;
KalturaDocumentType.SWF = 12;
KalturaDocumentType.PDF = 13;

function KalturaDrmProfileStatus(){
}
KalturaDrmProfileStatus.ACTIVE = 1;
KalturaDrmProfileStatus.DELETED = 2;

function KalturaDropFolderContentFileHandlerMatchPolicy(){
}
KalturaDropFolderContentFileHandlerMatchPolicy.ADD_AS_NEW = 1;
KalturaDropFolderContentFileHandlerMatchPolicy.MATCH_EXISTING_OR_ADD_AS_NEW = 2;
KalturaDropFolderContentFileHandlerMatchPolicy.MATCH_EXISTING_OR_KEEP_IN_FOLDER = 3;

function KalturaDropFolderFileDeletePolicy(){
}
KalturaDropFolderFileDeletePolicy.MANUAL_DELETE = 1;
KalturaDropFolderFileDeletePolicy.AUTO_DELETE = 2;

function KalturaDropFolderFileStatus(){
}
KalturaDropFolderFileStatus.UPLOADING = 1;
KalturaDropFolderFileStatus.PENDING = 2;
KalturaDropFolderFileStatus.WAITING = 3;
KalturaDropFolderFileStatus.HANDLED = 4;
KalturaDropFolderFileStatus.IGNORE = 5;
KalturaDropFolderFileStatus.DELETED = 6;
KalturaDropFolderFileStatus.PURGED = 7;
KalturaDropFolderFileStatus.NO_MATCH = 8;
KalturaDropFolderFileStatus.ERROR_HANDLING = 9;
KalturaDropFolderFileStatus.ERROR_DELETING = 10;
KalturaDropFolderFileStatus.DOWNLOADING = 11;
KalturaDropFolderFileStatus.ERROR_DOWNLOADING = 12;
KalturaDropFolderFileStatus.PROCESSING = 13;
KalturaDropFolderFileStatus.PARSED = 14;
KalturaDropFolderFileStatus.DETECTED = 15;

function KalturaDropFolderStatus(){
}
KalturaDropFolderStatus.DISABLED = 0;
KalturaDropFolderStatus.ENABLED = 1;
KalturaDropFolderStatus.DELETED = 2;
KalturaDropFolderStatus.ERROR = 3;

function KalturaEditorType(){
}
KalturaEditorType.SIMPLE = 1;
KalturaEditorType.ADVANCED = 2;

function KalturaEmailIngestionProfileStatus(){
}
KalturaEmailIngestionProfileStatus.INACTIVE = 0;
KalturaEmailIngestionProfileStatus.ACTIVE = 1;

function KalturaEmailNotificationTemplatePriority(){
}
KalturaEmailNotificationTemplatePriority.HIGH = 1;
KalturaEmailNotificationTemplatePriority.NORMAL = 3;
KalturaEmailNotificationTemplatePriority.LOW = 5;

function KalturaEntryDistributionFlag(){
}
KalturaEntryDistributionFlag.NONE = 0;
KalturaEntryDistributionFlag.SUBMIT_REQUIRED = 1;
KalturaEntryDistributionFlag.DELETE_REQUIRED = 2;
KalturaEntryDistributionFlag.UPDATE_REQUIRED = 3;
KalturaEntryDistributionFlag.ENABLE_REQUIRED = 4;
KalturaEntryDistributionFlag.DISABLE_REQUIRED = 5;

function KalturaEntryDistributionStatus(){
}
KalturaEntryDistributionStatus.PENDING = 0;
KalturaEntryDistributionStatus.QUEUED = 1;
KalturaEntryDistributionStatus.READY = 2;
KalturaEntryDistributionStatus.DELETED = 3;
KalturaEntryDistributionStatus.SUBMITTING = 4;
KalturaEntryDistributionStatus.UPDATING = 5;
KalturaEntryDistributionStatus.DELETING = 6;
KalturaEntryDistributionStatus.ERROR_SUBMITTING = 7;
KalturaEntryDistributionStatus.ERROR_UPDATING = 8;
KalturaEntryDistributionStatus.ERROR_DELETING = 9;
KalturaEntryDistributionStatus.REMOVED = 10;
KalturaEntryDistributionStatus.IMPORT_SUBMITTING = 11;
KalturaEntryDistributionStatus.IMPORT_UPDATING = 12;

function KalturaEntryDistributionSunStatus(){
}
KalturaEntryDistributionSunStatus.BEFORE_SUNRISE = 1;
KalturaEntryDistributionSunStatus.AFTER_SUNRISE = 2;
KalturaEntryDistributionSunStatus.AFTER_SUNSET = 3;

function KalturaEntryModerationStatus(){
}
KalturaEntryModerationStatus.PENDING_MODERATION = 1;
KalturaEntryModerationStatus.APPROVED = 2;
KalturaEntryModerationStatus.REJECTED = 3;
KalturaEntryModerationStatus.FLAGGED_FOR_REVIEW = 5;
KalturaEntryModerationStatus.AUTO_APPROVED = 6;

function KalturaEventNotificationTemplateStatus(){
}
KalturaEventNotificationTemplateStatus.DISABLED = 1;
KalturaEventNotificationTemplateStatus.ACTIVE = 2;
KalturaEventNotificationTemplateStatus.DELETED = 3;

function KalturaFeatureStatusType(){
}
KalturaFeatureStatusType.LOCK_CATEGORY = 1;
KalturaFeatureStatusType.CATEGORY = 2;
KalturaFeatureStatusType.CATEGORY_ENTRY = 3;
KalturaFeatureStatusType.ENTRY = 4;
KalturaFeatureStatusType.CATEGORY_USER = 5;
KalturaFeatureStatusType.USER = 6;

function KalturaFileSyncStatus(){
}
KalturaFileSyncStatus.ERROR = -1;
KalturaFileSyncStatus.PENDING = 1;
KalturaFileSyncStatus.READY = 2;
KalturaFileSyncStatus.DELETED = 3;
KalturaFileSyncStatus.PURGED = 4;

function KalturaFileSyncType(){
}
KalturaFileSyncType.FILE = 1;
KalturaFileSyncType.LINK = 2;
KalturaFileSyncType.URL = 3;

function KalturaFlavorAssetStatus(){
}
KalturaFlavorAssetStatus.ERROR = -1;
KalturaFlavorAssetStatus.QUEUED = 0;
KalturaFlavorAssetStatus.CONVERTING = 1;
KalturaFlavorAssetStatus.READY = 2;
KalturaFlavorAssetStatus.DELETED = 3;
KalturaFlavorAssetStatus.NOT_APPLICABLE = 4;
KalturaFlavorAssetStatus.TEMP = 5;
KalturaFlavorAssetStatus.WAIT_FOR_CONVERT = 6;
KalturaFlavorAssetStatus.IMPORTING = 7;
KalturaFlavorAssetStatus.VALIDATING = 8;
KalturaFlavorAssetStatus.EXPORTING = 9;

function KalturaFlavorReadyBehaviorType(){
}
KalturaFlavorReadyBehaviorType.NO_IMPACT = 0;
KalturaFlavorReadyBehaviorType.INHERIT_FLAVOR_PARAMS = 0;
KalturaFlavorReadyBehaviorType.REQUIRED = 1;
KalturaFlavorReadyBehaviorType.OPTIONAL = 2;

function KalturaGender(){
}
KalturaGender.UNKNOWN = 0;
KalturaGender.MALE = 1;
KalturaGender.FEMALE = 2;

function KalturaGenericDistributionProviderParser(){
}
KalturaGenericDistributionProviderParser.XSL = 1;
KalturaGenericDistributionProviderParser.XPATH = 2;
KalturaGenericDistributionProviderParser.REGEX = 3;

function KalturaGenericDistributionProviderStatus(){
}
KalturaGenericDistributionProviderStatus.ACTIVE = 2;
KalturaGenericDistributionProviderStatus.DELETED = 3;

function KalturaHttpNotificationAuthenticationMethod(){
}
KalturaHttpNotificationAuthenticationMethod.ANYSAFE = -18;
KalturaHttpNotificationAuthenticationMethod.ANY = -17;
KalturaHttpNotificationAuthenticationMethod.BASIC = 1;
KalturaHttpNotificationAuthenticationMethod.DIGEST = 2;
KalturaHttpNotificationAuthenticationMethod.GSSNEGOTIATE = 4;
KalturaHttpNotificationAuthenticationMethod.NTLM = 8;

function KalturaHttpNotificationMethod(){
}
KalturaHttpNotificationMethod.GET = 1;
KalturaHttpNotificationMethod.POST = 2;
KalturaHttpNotificationMethod.PUT = 3;
KalturaHttpNotificationMethod.DELETE = 4;

function KalturaHttpNotificationSslVersion(){
}
KalturaHttpNotificationSslVersion.V2 = 2;
KalturaHttpNotificationSslVersion.V3 = 3;

function KalturaInheritanceType(){
}
KalturaInheritanceType.INHERIT = 1;
KalturaInheritanceType.MANUAL = 2;

function KalturaIpAddressRestrictionType(){
}
KalturaIpAddressRestrictionType.RESTRICT_LIST = 0;
KalturaIpAddressRestrictionType.ALLOW_LIST = 1;

function KalturaLicenseType(){
}
KalturaLicenseType.UNKNOWN = -1;
KalturaLicenseType.NONE = 0;
KalturaLicenseType.COPYRIGHTED = 1;
KalturaLicenseType.PUBLIC_DOMAIN = 2;
KalturaLicenseType.CREATIVECOMMONS_ATTRIBUTION = 3;
KalturaLicenseType.CREATIVECOMMONS_ATTRIBUTION_SHARE_ALIKE = 4;
KalturaLicenseType.CREATIVECOMMONS_ATTRIBUTION_NO_DERIVATIVES = 5;
KalturaLicenseType.CREATIVECOMMONS_ATTRIBUTION_NON_COMMERCIAL = 6;
KalturaLicenseType.CREATIVECOMMONS_ATTRIBUTION_NON_COMMERCIAL_SHARE_ALIKE = 7;
KalturaLicenseType.CREATIVECOMMONS_ATTRIBUTION_NON_COMMERCIAL_NO_DERIVATIVES = 8;
KalturaLicenseType.GFDL = 9;
KalturaLicenseType.GPL = 10;
KalturaLicenseType.AFFERO_GPL = 11;
KalturaLicenseType.LGPL = 12;
KalturaLicenseType.BSD = 13;
KalturaLicenseType.APACHE = 14;
KalturaLicenseType.MOZILLA = 15;

function KalturaLimitFlavorsRestrictionType(){
}
KalturaLimitFlavorsRestrictionType.RESTRICT_LIST = 0;
KalturaLimitFlavorsRestrictionType.ALLOW_LIST = 1;

function KalturaMailJobStatus(){
}
KalturaMailJobStatus.PENDING = 1;
KalturaMailJobStatus.SENT = 2;
KalturaMailJobStatus.ERROR = 3;
KalturaMailJobStatus.QUEUED = 4;

function KalturaMediaServerIndex(){
}
KalturaMediaServerIndex.PRIMARY = 0;
KalturaMediaServerIndex.SECONDARY = 1;

function KalturaMediaType(){
}
KalturaMediaType.VIDEO = 1;
KalturaMediaType.IMAGE = 2;
KalturaMediaType.AUDIO = 5;
KalturaMediaType.LIVE_STREAM_FLASH = 201;
KalturaMediaType.LIVE_STREAM_WINDOWS_MEDIA = 202;
KalturaMediaType.LIVE_STREAM_REAL_MEDIA = 203;
KalturaMediaType.LIVE_STREAM_QUICKTIME = 204;

function KalturaMetadataProfileCreateMode(){
}
KalturaMetadataProfileCreateMode.API = 1;
KalturaMetadataProfileCreateMode.KMC = 2;
KalturaMetadataProfileCreateMode.APP = 3;

function KalturaMetadataProfileStatus(){
}
KalturaMetadataProfileStatus.ACTIVE = 1;
KalturaMetadataProfileStatus.DEPRECATED = 2;
KalturaMetadataProfileStatus.TRANSFORMING = 3;

function KalturaMetadataStatus(){
}
KalturaMetadataStatus.VALID = 1;
KalturaMetadataStatus.INVALID = 2;
KalturaMetadataStatus.DELETED = 3;

function KalturaModerationFlagType(){
}
KalturaModerationFlagType.SEXUAL_CONTENT = 1;
KalturaModerationFlagType.VIOLENT_REPULSIVE = 2;
KalturaModerationFlagType.HARMFUL_DANGEROUS = 3;
KalturaModerationFlagType.SPAM_COMMERCIALS = 4;
KalturaModerationFlagType.COPYRIGHT = 5;
KalturaModerationFlagType.TERMS_OF_USE_VIOLATION = 6;

function KalturaMrssExtensionMode(){
}
KalturaMrssExtensionMode.APPEND = 1;
KalturaMrssExtensionMode.REPLACE = 2;

function KalturaNotificationObjectType(){
}
KalturaNotificationObjectType.ENTRY = 1;
KalturaNotificationObjectType.KSHOW = 2;
KalturaNotificationObjectType.USER = 3;
KalturaNotificationObjectType.BATCH_JOB = 4;

function KalturaNotificationStatus(){
}
KalturaNotificationStatus.PENDING = 1;
KalturaNotificationStatus.SENT = 2;
KalturaNotificationStatus.ERROR = 3;
KalturaNotificationStatus.SHOULD_RESEND = 4;
KalturaNotificationStatus.ERROR_RESENDING = 5;
KalturaNotificationStatus.SENT_SYNCH = 6;
KalturaNotificationStatus.QUEUED = 7;

function KalturaNotificationType(){
}
KalturaNotificationType.ENTRY_ADD = 1;
KalturaNotificationType.ENTR_UPDATE_PERMISSIONS = 2;
KalturaNotificationType.ENTRY_DELETE = 3;
KalturaNotificationType.ENTRY_BLOCK = 4;
KalturaNotificationType.ENTRY_UPDATE = 5;
KalturaNotificationType.ENTRY_UPDATE_THUMBNAIL = 6;
KalturaNotificationType.ENTRY_UPDATE_MODERATION = 7;
KalturaNotificationType.USER_ADD = 21;
KalturaNotificationType.USER_BANNED = 26;

function KalturaNullableBoolean(){
}
KalturaNullableBoolean.NULL_VALUE = -1;
KalturaNullableBoolean.FALSE_VALUE = 0;
KalturaNullableBoolean.TRUE_VALUE = 1;

function KalturaPartnerGroupType(){
}
KalturaPartnerGroupType.PUBLISHER = 1;
KalturaPartnerGroupType.VAR_GROUP = 2;
KalturaPartnerGroupType.GROUP = 3;
KalturaPartnerGroupType.TEMPLATE = 4;

function KalturaPartnerStatus(){
}
KalturaPartnerStatus.ACTIVE = 1;
KalturaPartnerStatus.BLOCKED = 2;
KalturaPartnerStatus.FULL_BLOCK = 3;

function KalturaPartnerType(){
}
KalturaPartnerType.KMC = 1;
KalturaPartnerType.WIKI = 100;
KalturaPartnerType.WORDPRESS = 101;
KalturaPartnerType.DRUPAL = 102;
KalturaPartnerType.DEKIWIKI = 103;
KalturaPartnerType.MOODLE = 104;
KalturaPartnerType.COMMUNITY_EDITION = 105;
KalturaPartnerType.JOOMLA = 106;
KalturaPartnerType.BLACKBOARD = 107;
KalturaPartnerType.SAKAI = 108;
KalturaPartnerType.ADMIN_CONSOLE = 109;

function KalturaPermissionStatus(){
}
KalturaPermissionStatus.ACTIVE = 1;
KalturaPermissionStatus.BLOCKED = 2;
KalturaPermissionStatus.DELETED = 3;

function KalturaPermissionType(){
}
KalturaPermissionType.NORMAL = 1;
KalturaPermissionType.SPECIAL_FEATURE = 2;
KalturaPermissionType.PLUGIN = 3;
KalturaPermissionType.PARTNER_GROUP = 4;

function KalturaPlaylistType(){
}
KalturaPlaylistType.STATIC_LIST = 3;
KalturaPlaylistType.DYNAMIC = 10;
KalturaPlaylistType.EXTERNAL = 101;

function KalturaPrivacyType(){
}
KalturaPrivacyType.ALL = 1;
KalturaPrivacyType.AUTHENTICATED_USERS = 2;
KalturaPrivacyType.MEMBERS_ONLY = 3;

function KalturaRecordStatus(){
}
KalturaRecordStatus.DISABLED = 0;
KalturaRecordStatus.ENABLED = 1;

function KalturaReportType(){
}
KalturaReportType.TOP_CONTENT = 1;
KalturaReportType.CONTENT_DROPOFF = 2;
KalturaReportType.CONTENT_INTERACTIONS = 3;
KalturaReportType.MAP_OVERLAY = 4;
KalturaReportType.TOP_CONTRIBUTORS = 5;
KalturaReportType.TOP_SYNDICATION = 6;
KalturaReportType.CONTENT_CONTRIBUTIONS = 7;
KalturaReportType.USER_ENGAGEMENT = 11;
KalturaReportType.SPEFICIC_USER_ENGAGEMENT = 12;
KalturaReportType.USER_TOP_CONTENT = 13;
KalturaReportType.USER_CONTENT_DROPOFF = 14;
KalturaReportType.USER_CONTENT_INTERACTIONS = 15;
KalturaReportType.APPLICATIONS = 16;
KalturaReportType.USER_USAGE = 17;
KalturaReportType.SPECIFIC_USER_USAGE = 18;
KalturaReportType.VAR_USAGE = 19;
KalturaReportType.TOP_CREATORS = 20;
KalturaReportType.PLATFORMS = 21;
KalturaReportType.OPERATION_SYSTEM = 22;
KalturaReportType.BROWSERS = 23;
KalturaReportType.PARTNER_USAGE = 201;

function KalturaResponseType(){
}
KalturaResponseType.RESPONSE_TYPE_JSON = 1;
KalturaResponseType.RESPONSE_TYPE_XML = 2;
KalturaResponseType.RESPONSE_TYPE_PHP = 3;
KalturaResponseType.RESPONSE_TYPE_PHP_ARRAY = 4;
KalturaResponseType.RESPONSE_TYPE_HTML = 7;
KalturaResponseType.RESPONSE_TYPE_MRSS = 8;
KalturaResponseType.RESPONSE_TYPE_JSONP = 9;

function KalturaSearchOperatorType(){
}
KalturaSearchOperatorType.SEARCH_AND = 1;
KalturaSearchOperatorType.SEARCH_OR = 2;

function KalturaSearchProviderType(){
}
KalturaSearchProviderType.FLICKR = 3;
KalturaSearchProviderType.YOUTUBE = 4;
KalturaSearchProviderType.MYSPACE = 7;
KalturaSearchProviderType.PHOTOBUCKET = 8;
KalturaSearchProviderType.JAMENDO = 9;
KalturaSearchProviderType.CCMIXTER = 10;
KalturaSearchProviderType.NYPL = 11;
KalturaSearchProviderType.CURRENT = 12;
KalturaSearchProviderType.MEDIA_COMMONS = 13;
KalturaSearchProviderType.KALTURA = 20;
KalturaSearchProviderType.KALTURA_USER_CLIPS = 21;
KalturaSearchProviderType.ARCHIVE_ORG = 22;
KalturaSearchProviderType.KALTURA_PARTNER = 23;
KalturaSearchProviderType.METACAFE = 24;
KalturaSearchProviderType.SEARCH_PROXY = 28;
KalturaSearchProviderType.PARTNER_SPECIFIC = 100;

function KalturaSessionType(){
}
KalturaSessionType.USER = 0;
KalturaSessionType.ADMIN = 2;

function KalturaShortLinkStatus(){
}
KalturaShortLinkStatus.DISABLED = 1;
KalturaShortLinkStatus.ENABLED = 2;
KalturaShortLinkStatus.DELETED = 3;

function KalturaSiteRestrictionType(){
}
KalturaSiteRestrictionType.RESTRICT_SITE_LIST = 0;
KalturaSiteRestrictionType.ALLOW_SITE_LIST = 1;

function KalturaStatsEventType(){
}
KalturaStatsEventType.WIDGET_LOADED = 1;
KalturaStatsEventType.MEDIA_LOADED = 2;
KalturaStatsEventType.PLAY = 3;
KalturaStatsEventType.PLAY_REACHED_25 = 4;
KalturaStatsEventType.PLAY_REACHED_50 = 5;
KalturaStatsEventType.PLAY_REACHED_75 = 6;
KalturaStatsEventType.PLAY_REACHED_100 = 7;
KalturaStatsEventType.OPEN_EDIT = 8;
KalturaStatsEventType.OPEN_VIRAL = 9;
KalturaStatsEventType.OPEN_DOWNLOAD = 10;
KalturaStatsEventType.OPEN_REPORT = 11;
KalturaStatsEventType.BUFFER_START = 12;
KalturaStatsEventType.BUFFER_END = 13;
KalturaStatsEventType.OPEN_FULL_SCREEN = 14;
KalturaStatsEventType.CLOSE_FULL_SCREEN = 15;
KalturaStatsEventType.REPLAY = 16;
KalturaStatsEventType.SEEK = 17;
KalturaStatsEventType.OPEN_UPLOAD = 18;
KalturaStatsEventType.SAVE_PUBLISH = 19;
KalturaStatsEventType.CLOSE_EDITOR = 20;
KalturaStatsEventType.PRE_BUMPER_PLAYED = 21;
KalturaStatsEventType.POST_BUMPER_PLAYED = 22;
KalturaStatsEventType.BUMPER_CLICKED = 23;
KalturaStatsEventType.PREROLL_STARTED = 24;
KalturaStatsEventType.MIDROLL_STARTED = 25;
KalturaStatsEventType.POSTROLL_STARTED = 26;
KalturaStatsEventType.OVERLAY_STARTED = 27;
KalturaStatsEventType.PREROLL_CLICKED = 28;
KalturaStatsEventType.MIDROLL_CLICKED = 29;
KalturaStatsEventType.POSTROLL_CLICKED = 30;
KalturaStatsEventType.OVERLAY_CLICKED = 31;
KalturaStatsEventType.PREROLL_25 = 32;
KalturaStatsEventType.PREROLL_50 = 33;
KalturaStatsEventType.PREROLL_75 = 34;
KalturaStatsEventType.MIDROLL_25 = 35;
KalturaStatsEventType.MIDROLL_50 = 36;
KalturaStatsEventType.MIDROLL_75 = 37;
KalturaStatsEventType.POSTROLL_25 = 38;
KalturaStatsEventType.POSTROLL_50 = 39;
KalturaStatsEventType.POSTROLL_75 = 40;

function KalturaStatsFeatureType(){
}
KalturaStatsFeatureType.NONE = 0;
KalturaStatsFeatureType.RELATED = 1;

function KalturaStatsKmcEventType(){
}
KalturaStatsKmcEventType.CONTENT_PAGE_VIEW = 1001;
KalturaStatsKmcEventType.CONTENT_ADD_PLAYLIST = 1010;
KalturaStatsKmcEventType.CONTENT_EDIT_PLAYLIST = 1011;
KalturaStatsKmcEventType.CONTENT_DELETE_PLAYLIST = 1012;
KalturaStatsKmcEventType.CONTENT_EDIT_ENTRY = 1013;
KalturaStatsKmcEventType.CONTENT_CHANGE_THUMBNAIL = 1014;
KalturaStatsKmcEventType.CONTENT_ADD_TAGS = 1015;
KalturaStatsKmcEventType.CONTENT_REMOVE_TAGS = 1016;
KalturaStatsKmcEventType.CONTENT_ADD_ADMIN_TAGS = 1017;
KalturaStatsKmcEventType.CONTENT_REMOVE_ADMIN_TAGS = 1018;
KalturaStatsKmcEventType.CONTENT_DOWNLOAD = 1019;
KalturaStatsKmcEventType.CONTENT_APPROVE_MODERATION = 1020;
KalturaStatsKmcEventType.CONTENT_REJECT_MODERATION = 1021;
KalturaStatsKmcEventType.CONTENT_BULK_UPLOAD = 1022;
KalturaStatsKmcEventType.CONTENT_ADMIN_KCW_UPLOAD = 1023;
KalturaStatsKmcEventType.ACCOUNT_CHANGE_PARTNER_INFO = 1030;
KalturaStatsKmcEventType.ACCOUNT_CHANGE_LOGIN_INFO = 1031;
KalturaStatsKmcEventType.ACCOUNT_CONTACT_US_USAGE = 1032;
KalturaStatsKmcEventType.ACCOUNT_UPDATE_SERVER_SETTINGS = 1033;
KalturaStatsKmcEventType.ACCOUNT_ACCOUNT_OVERVIEW = 1034;
KalturaStatsKmcEventType.ACCOUNT_ACCESS_CONTROL = 1035;
KalturaStatsKmcEventType.ACCOUNT_TRANSCODING_SETTINGS = 1036;
KalturaStatsKmcEventType.ACCOUNT_ACCOUNT_UPGRADE = 1037;
KalturaStatsKmcEventType.ACCOUNT_SAVE_SERVER_SETTINGS = 1038;
KalturaStatsKmcEventType.ACCOUNT_ACCESS_CONTROL_DELETE = 1039;
KalturaStatsKmcEventType.ACCOUNT_SAVE_TRANSCODING_SETTINGS = 1040;
KalturaStatsKmcEventType.LOGIN = 1041;
KalturaStatsKmcEventType.DASHBOARD_IMPORT_CONTENT = 1042;
KalturaStatsKmcEventType.DASHBOARD_UPDATE_CONTENT = 1043;
KalturaStatsKmcEventType.DASHBOARD_ACCOUNT_CONTACT_US = 1044;
KalturaStatsKmcEventType.DASHBOARD_VIEW_REPORTS = 1045;
KalturaStatsKmcEventType.DASHBOARD_EMBED_PLAYER = 1046;
KalturaStatsKmcEventType.DASHBOARD_EMBED_PLAYLIST = 1047;
KalturaStatsKmcEventType.DASHBOARD_CUSTOMIZE_PLAYERS = 1048;
KalturaStatsKmcEventType.APP_STUDIO_NEW_PLAYER_SINGLE_VIDEO = 1050;
KalturaStatsKmcEventType.APP_STUDIO_NEW_PLAYER_PLAYLIST = 1051;
KalturaStatsKmcEventType.APP_STUDIO_NEW_PLAYER_MULTI_TAB_PLAYLIST = 1052;
KalturaStatsKmcEventType.APP_STUDIO_EDIT_PLAYER_SINGLE_VIDEO = 1053;
KalturaStatsKmcEventType.APP_STUDIO_EDIT_PLAYER_PLAYLIST = 1054;
KalturaStatsKmcEventType.APP_STUDIO_EDIT_PLAYER_MULTI_TAB_PLAYLIST = 1055;
KalturaStatsKmcEventType.APP_STUDIO_DUPLICATE_PLAYER = 1056;
KalturaStatsKmcEventType.CONTENT_CONTENT_GO_TO_PAGE = 1057;
KalturaStatsKmcEventType.CONTENT_DELETE_ITEM = 1058;
KalturaStatsKmcEventType.CONTENT_DELETE_MIX = 1059;
KalturaStatsKmcEventType.REPORTS_AND_ANALYTICS_BANDWIDTH_USAGE_TAB = 1070;
KalturaStatsKmcEventType.REPORTS_AND_ANALYTICS_CONTENT_REPORTS_TAB = 1071;
KalturaStatsKmcEventType.REPORTS_AND_ANALYTICS_USERS_AND_COMMUNITY_REPORTS_TAB = 1072;
KalturaStatsKmcEventType.REPORTS_AND_ANALYTICS_TOP_CONTRIBUTORS = 1073;
KalturaStatsKmcEventType.REPORTS_AND_ANALYTICS_MAP_OVERLAYS = 1074;
KalturaStatsKmcEventType.REPORTS_AND_ANALYTICS_TOP_SYNDICATIONS = 1075;
KalturaStatsKmcEventType.REPORTS_AND_ANALYTICS_TOP_CONTENT = 1076;
KalturaStatsKmcEventType.REPORTS_AND_ANALYTICS_CONTENT_DROPOFF = 1077;
KalturaStatsKmcEventType.REPORTS_AND_ANALYTICS_CONTENT_INTERACTIONS = 1078;
KalturaStatsKmcEventType.REPORTS_AND_ANALYTICS_CONTENT_CONTRIBUTIONS = 1079;
KalturaStatsKmcEventType.REPORTS_AND_ANALYTICS_VIDEO_DRILL_DOWN = 1080;
KalturaStatsKmcEventType.REPORTS_AND_ANALYTICS_CONTENT_DRILL_DOWN_INTERACTION = 1081;
KalturaStatsKmcEventType.REPORTS_AND_ANALYTICS_CONTENT_CONTRIBUTIONS_DRILLDOWN = 1082;
KalturaStatsKmcEventType.REPORTS_AND_ANALYTICS_VIDEO_DRILL_DOWN_DROPOFF = 1083;
KalturaStatsKmcEventType.REPORTS_AND_ANALYTICS_MAP_OVERLAYS_DRILLDOWN = 1084;
KalturaStatsKmcEventType.REPORTS_AND_ANALYTICS_TOP_SYNDICATIONS_DRILL_DOWN = 1085;
KalturaStatsKmcEventType.REPORTS_AND_ANALYTICS_BANDWIDTH_USAGE_VIEW_MONTHLY = 1086;
KalturaStatsKmcEventType.REPORTS_AND_ANALYTICS_BANDWIDTH_USAGE_VIEW_YEARLY = 1087;
KalturaStatsKmcEventType.CONTENT_ENTRY_DRILLDOWN = 1088;
KalturaStatsKmcEventType.CONTENT_OPEN_PREVIEW_AND_EMBED = 1089;

function KalturaStorageProfileDeliveryStatus(){
}
KalturaStorageProfileDeliveryStatus.ACTIVE = 1;
KalturaStorageProfileDeliveryStatus.BLOCKED = 2;

function KalturaStorageProfileReadyBehavior(){
}
KalturaStorageProfileReadyBehavior.NO_IMPACT = 0;
KalturaStorageProfileReadyBehavior.REQUIRED = 1;

function KalturaStorageProfileStatus(){
}
KalturaStorageProfileStatus.DISABLED = 1;
KalturaStorageProfileStatus.AUTOMATIC = 2;
KalturaStorageProfileStatus.MANUAL = 3;

function KalturaSyndicationFeedStatus(){
}
KalturaSyndicationFeedStatus.DELETED = -1;
KalturaSyndicationFeedStatus.ACTIVE = 1;

function KalturaSyndicationFeedType(){
}
KalturaSyndicationFeedType.GOOGLE_VIDEO = 1;
KalturaSyndicationFeedType.YAHOO = 2;
KalturaSyndicationFeedType.ITUNES = 3;
KalturaSyndicationFeedType.TUBE_MOGUL = 4;
KalturaSyndicationFeedType.KALTURA = 5;
KalturaSyndicationFeedType.KALTURA_XSLT = 6;

function KalturaThumbAssetStatus(){
}
KalturaThumbAssetStatus.ERROR = -1;
KalturaThumbAssetStatus.QUEUED = 0;
KalturaThumbAssetStatus.CAPTURING = 1;
KalturaThumbAssetStatus.READY = 2;
KalturaThumbAssetStatus.DELETED = 3;
KalturaThumbAssetStatus.IMPORTING = 7;
KalturaThumbAssetStatus.EXPORTING = 9;

function KalturaThumbCropType(){
}
KalturaThumbCropType.RESIZE = 1;
KalturaThumbCropType.RESIZE_WITH_PADDING = 2;
KalturaThumbCropType.CROP = 3;
KalturaThumbCropType.CROP_FROM_TOP = 4;
KalturaThumbCropType.RESIZE_WITH_FORCE = 5;

function KalturaUiConfCreationMode(){
}
KalturaUiConfCreationMode.WIZARD = 2;
KalturaUiConfCreationMode.ADVANCED = 3;

function KalturaUiConfObjType(){
}
KalturaUiConfObjType.PLAYER = 1;
KalturaUiConfObjType.CONTRIBUTION_WIZARD = 2;
KalturaUiConfObjType.SIMPLE_EDITOR = 3;
KalturaUiConfObjType.ADVANCED_EDITOR = 4;
KalturaUiConfObjType.PLAYLIST = 5;
KalturaUiConfObjType.APP_STUDIO = 6;
KalturaUiConfObjType.KRECORD = 7;
KalturaUiConfObjType.PLAYER_V3 = 8;
KalturaUiConfObjType.KMC_ACCOUNT = 9;
KalturaUiConfObjType.KMC_ANALYTICS = 10;
KalturaUiConfObjType.KMC_CONTENT = 11;
KalturaUiConfObjType.KMC_DASHBOARD = 12;
KalturaUiConfObjType.KMC_LOGIN = 13;
KalturaUiConfObjType.PLAYER_SL = 14;
KalturaUiConfObjType.CLIENTSIDE_ENCODER = 15;
KalturaUiConfObjType.KMC_GENERAL = 16;
KalturaUiConfObjType.KMC_ROLES_AND_PERMISSIONS = 17;
KalturaUiConfObjType.CLIPPER = 18;
KalturaUiConfObjType.KSR = 19;
KalturaUiConfObjType.KUPLOAD = 20;

function KalturaUpdateMethodType(){
}
KalturaUpdateMethodType.MANUAL = 0;
KalturaUpdateMethodType.AUTOMATIC = 1;

function KalturaUploadErrorCode(){
}
KalturaUploadErrorCode.NO_ERROR = 0;
KalturaUploadErrorCode.GENERAL_ERROR = 1;
KalturaUploadErrorCode.PARTIAL_UPLOAD = 2;

function KalturaUploadTokenStatus(){
}
KalturaUploadTokenStatus.PENDING = 0;
KalturaUploadTokenStatus.PARTIAL_UPLOAD = 1;
KalturaUploadTokenStatus.FULL_UPLOAD = 2;
KalturaUploadTokenStatus.CLOSED = 3;
KalturaUploadTokenStatus.TIMED_OUT = 4;
KalturaUploadTokenStatus.DELETED = 5;

function KalturaUserAgentRestrictionType(){
}
KalturaUserAgentRestrictionType.RESTRICT_LIST = 0;
KalturaUserAgentRestrictionType.ALLOW_LIST = 1;

function KalturaUserJoinPolicyType(){
}
KalturaUserJoinPolicyType.AUTO_JOIN = 1;
KalturaUserJoinPolicyType.REQUEST_TO_JOIN = 2;
KalturaUserJoinPolicyType.NOT_ALLOWED = 3;

function KalturaUserRoleStatus(){
}
KalturaUserRoleStatus.ACTIVE = 1;
KalturaUserRoleStatus.BLOCKED = 2;
KalturaUserRoleStatus.DELETED = 3;

function KalturaUserStatus(){
}
KalturaUserStatus.BLOCKED = 0;
KalturaUserStatus.ACTIVE = 1;
KalturaUserStatus.DELETED = 2;

function KalturaVirusFoundAction(){
}
KalturaVirusFoundAction.NONE = 0;
KalturaVirusFoundAction.DELETE = 1;
KalturaVirusFoundAction.CLEAN_NONE = 2;
KalturaVirusFoundAction.CLEAN_DELETE = 3;

function KalturaVirusScanJobResult(){
}
KalturaVirusScanJobResult.SCAN_ERROR = 1;
KalturaVirusScanJobResult.FILE_IS_CLEAN = 2;
KalturaVirusScanJobResult.FILE_WAS_CLEANED = 3;
KalturaVirusScanJobResult.FILE_INFECTED = 4;

function KalturaVirusScanProfileStatus(){
}
KalturaVirusScanProfileStatus.DISABLED = 1;
KalturaVirusScanProfileStatus.ENABLED = 2;
KalturaVirusScanProfileStatus.DELETED = 3;

function KalturaWidevineRepositorySyncMode(){
}
KalturaWidevineRepositorySyncMode.MODIFY = 0;

function KalturaWidgetSecurityType(){
}
KalturaWidgetSecurityType.NONE = 1;
KalturaWidgetSecurityType.TIMEHASH = 2;

function KalturaAccessControlOrderBy(){
}
KalturaAccessControlOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaAccessControlOrderBy.CREATED_AT_DESC = "-createdAt";

function KalturaAccessControlProfileOrderBy(){
}
KalturaAccessControlProfileOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaAccessControlProfileOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaAccessControlProfileOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaAccessControlProfileOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaAdCuePointOrderBy(){
}
KalturaAdCuePointOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaAdCuePointOrderBy.DURATION_ASC = "+duration";
KalturaAdCuePointOrderBy.END_TIME_ASC = "+endTime";
KalturaAdCuePointOrderBy.PARTNER_SORT_VALUE_ASC = "+partnerSortValue";
KalturaAdCuePointOrderBy.START_TIME_ASC = "+startTime";
KalturaAdCuePointOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaAdCuePointOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaAdCuePointOrderBy.DURATION_DESC = "-duration";
KalturaAdCuePointOrderBy.END_TIME_DESC = "-endTime";
KalturaAdCuePointOrderBy.PARTNER_SORT_VALUE_DESC = "-partnerSortValue";
KalturaAdCuePointOrderBy.START_TIME_DESC = "-startTime";
KalturaAdCuePointOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaAdProtocolType(){
}
KalturaAdProtocolType.CUSTOM = "0";
KalturaAdProtocolType.VAST = "1";
KalturaAdProtocolType.VAST_2_0 = "2";
KalturaAdProtocolType.VPAID = "3";

function KalturaAdType(){
}
KalturaAdType.VIDEO = "1";
KalturaAdType.OVERLAY = "2";

function KalturaAdminUserOrderBy(){
}
KalturaAdminUserOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaAdminUserOrderBy.ID_ASC = "+id";
KalturaAdminUserOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaAdminUserOrderBy.ID_DESC = "-id";

function KalturaAkamaiUniversalStreamType(){
}
KalturaAkamaiUniversalStreamType.HD_IPHONE_IPAD_LIVE = "HD iPhone/iPad Live";
KalturaAkamaiUniversalStreamType.UNIVERSAL_STREAMING_LIVE = "Universal Streaming Live";

function KalturaAmazonS3StorageProfileFilesPermissionLevel(){
}
KalturaAmazonS3StorageProfileFilesPermissionLevel.ACL_AUTHENTICATED_READ = "authenticated-read";
KalturaAmazonS3StorageProfileFilesPermissionLevel.ACL_PRIVATE = "private";
KalturaAmazonS3StorageProfileFilesPermissionLevel.ACL_PUBLIC_READ = "public-read";
KalturaAmazonS3StorageProfileFilesPermissionLevel.ACL_PUBLIC_READ_WRITE = "public-read-write";

function KalturaAmazonS3StorageProfileOrderBy(){
}
KalturaAmazonS3StorageProfileOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaAmazonS3StorageProfileOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaAmazonS3StorageProfileOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaAmazonS3StorageProfileOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaAnnotationOrderBy(){
}
KalturaAnnotationOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaAnnotationOrderBy.DURATION_ASC = "+duration";
KalturaAnnotationOrderBy.END_TIME_ASC = "+endTime";
KalturaAnnotationOrderBy.PARTNER_SORT_VALUE_ASC = "+partnerSortValue";
KalturaAnnotationOrderBy.START_TIME_ASC = "+startTime";
KalturaAnnotationOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaAnnotationOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaAnnotationOrderBy.DURATION_DESC = "-duration";
KalturaAnnotationOrderBy.END_TIME_DESC = "-endTime";
KalturaAnnotationOrderBy.PARTNER_SORT_VALUE_DESC = "-partnerSortValue";
KalturaAnnotationOrderBy.START_TIME_DESC = "-startTime";
KalturaAnnotationOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaApiActionPermissionItemOrderBy(){
}
KalturaApiActionPermissionItemOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaApiActionPermissionItemOrderBy.ID_ASC = "+id";
KalturaApiActionPermissionItemOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaApiActionPermissionItemOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaApiActionPermissionItemOrderBy.ID_DESC = "-id";
KalturaApiActionPermissionItemOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaApiParameterPermissionItemAction(){
}
KalturaApiParameterPermissionItemAction.USAGE = "all";
KalturaApiParameterPermissionItemAction.INSERT = "insert";
KalturaApiParameterPermissionItemAction.READ = "read";
KalturaApiParameterPermissionItemAction.UPDATE = "update";

function KalturaApiParameterPermissionItemOrderBy(){
}
KalturaApiParameterPermissionItemOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaApiParameterPermissionItemOrderBy.ID_ASC = "+id";
KalturaApiParameterPermissionItemOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaApiParameterPermissionItemOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaApiParameterPermissionItemOrderBy.ID_DESC = "-id";
KalturaApiParameterPermissionItemOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaAssetOrderBy(){
}
KalturaAssetOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaAssetOrderBy.DELETED_AT_ASC = "+deletedAt";
KalturaAssetOrderBy.SIZE_ASC = "+size";
KalturaAssetOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaAssetOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaAssetOrderBy.DELETED_AT_DESC = "-deletedAt";
KalturaAssetOrderBy.SIZE_DESC = "-size";
KalturaAssetOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaAssetParamsOrderBy(){
}

function KalturaAssetParamsOutputOrderBy(){
}

function KalturaAssetType(){
}
KalturaAssetType.ATTACHMENT = "attachment.Attachment";
KalturaAssetType.CAPTION = "caption.Caption";
KalturaAssetType.DOCUMENT = "document.Document";
KalturaAssetType.IMAGE = "document.Image";
KalturaAssetType.PDF = "document.PDF";
KalturaAssetType.SWF = "document.SWF";
KalturaAssetType.WIDEVINE_FLAVOR = "widevine.WidevineFlavor";
KalturaAssetType.FLAVOR = "1";
KalturaAssetType.THUMBNAIL = "2";
KalturaAssetType.LIVE = "3";

function KalturaAttachmentAssetOrderBy(){
}
KalturaAttachmentAssetOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaAttachmentAssetOrderBy.DELETED_AT_ASC = "+deletedAt";
KalturaAttachmentAssetOrderBy.SIZE_ASC = "+size";
KalturaAttachmentAssetOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaAttachmentAssetOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaAttachmentAssetOrderBy.DELETED_AT_DESC = "-deletedAt";
KalturaAttachmentAssetOrderBy.SIZE_DESC = "-size";
KalturaAttachmentAssetOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaAttachmentType(){
}
KalturaAttachmentType.TEXT = "1";
KalturaAttachmentType.MEDIA = "2";
KalturaAttachmentType.DOCUMENT = "3";

function KalturaAudioCodec(){
}
KalturaAudioCodec.NONE = "";
KalturaAudioCodec.AAC = "aac";
KalturaAudioCodec.AACHE = "aache";
KalturaAudioCodec.AC3 = "ac3";
KalturaAudioCodec.AMRNB = "amrnb";
KalturaAudioCodec.COPY = "copy";
KalturaAudioCodec.MP3 = "mp3";
KalturaAudioCodec.MPEG2 = "mpeg2";
KalturaAudioCodec.PCM = "pcm";
KalturaAudioCodec.VORBIS = "vorbis";
KalturaAudioCodec.WMA = "wma";
KalturaAudioCodec.WMAPRO = "wmapro";

function KalturaAuditTrailAction(){
}
KalturaAuditTrailAction.CHANGED = "CHANGED";
KalturaAuditTrailAction.CONTENT_VIEWED = "CONTENT_VIEWED";
KalturaAuditTrailAction.COPIED = "COPIED";
KalturaAuditTrailAction.CREATED = "CREATED";
KalturaAuditTrailAction.DELETED = "DELETED";
KalturaAuditTrailAction.FILE_SYNC_CREATED = "FILE_SYNC_CREATED";
KalturaAuditTrailAction.RELATION_ADDED = "RELATION_ADDED";
KalturaAuditTrailAction.RELATION_REMOVED = "RELATION_REMOVED";
KalturaAuditTrailAction.VIEWED = "VIEWED";

function KalturaAuditTrailObjectType(){
}
KalturaAuditTrailObjectType.BATCH_JOB = "BatchJob";
KalturaAuditTrailObjectType.EMAIL_INGESTION_PROFILE = "EmailIngestionProfile";
KalturaAuditTrailObjectType.FILE_SYNC = "FileSync";
KalturaAuditTrailObjectType.KSHOW_KUSER = "KshowKuser";
KalturaAuditTrailObjectType.METADATA = "Metadata";
KalturaAuditTrailObjectType.METADATA_PROFILE = "MetadataProfile";
KalturaAuditTrailObjectType.PARTNER = "Partner";
KalturaAuditTrailObjectType.PERMISSION = "Permission";
KalturaAuditTrailObjectType.UPLOAD_TOKEN = "UploadToken";
KalturaAuditTrailObjectType.USER_LOGIN_DATA = "UserLoginData";
KalturaAuditTrailObjectType.USER_ROLE = "UserRole";
KalturaAuditTrailObjectType.ACCESS_CONTROL = "accessControl";
KalturaAuditTrailObjectType.CATEGORY = "category";
KalturaAuditTrailObjectType.CONVERSION_PROFILE_2 = "conversionProfile2";
KalturaAuditTrailObjectType.ENTRY = "entry";
KalturaAuditTrailObjectType.FLAVOR_ASSET = "flavorAsset";
KalturaAuditTrailObjectType.FLAVOR_PARAMS = "flavorParams";
KalturaAuditTrailObjectType.FLAVOR_PARAMS_CONVERSION_PROFILE = "flavorParamsConversionProfile";
KalturaAuditTrailObjectType.FLAVOR_PARAMS_OUTPUT = "flavorParamsOutput";
KalturaAuditTrailObjectType.KSHOW = "kshow";
KalturaAuditTrailObjectType.KUSER = "kuser";
KalturaAuditTrailObjectType.MEDIA_INFO = "mediaInfo";
KalturaAuditTrailObjectType.MODERATION = "moderation";
KalturaAuditTrailObjectType.ROUGHCUT = "roughcutEntry";
KalturaAuditTrailObjectType.SYNDICATION = "syndicationFeed";
KalturaAuditTrailObjectType.THUMBNAIL_ASSET = "thumbAsset";
KalturaAuditTrailObjectType.THUMBNAIL_PARAMS = "thumbParams";
KalturaAuditTrailObjectType.THUMBNAIL_PARAMS_OUTPUT = "thumbParamsOutput";
KalturaAuditTrailObjectType.UI_CONF = "uiConf";
KalturaAuditTrailObjectType.WIDGET = "widget";

function KalturaAuditTrailOrderBy(){
}
KalturaAuditTrailOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaAuditTrailOrderBy.PARSED_AT_ASC = "+parsedAt";
KalturaAuditTrailOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaAuditTrailOrderBy.PARSED_AT_DESC = "-parsedAt";

function KalturaBaseEntryOrderBy(){
}
KalturaBaseEntryOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaBaseEntryOrderBy.END_DATE_ASC = "+endDate";
KalturaBaseEntryOrderBy.MODERATION_COUNT_ASC = "+moderationCount";
KalturaBaseEntryOrderBy.NAME_ASC = "+name";
KalturaBaseEntryOrderBy.PARTNER_SORT_VALUE_ASC = "+partnerSortValue";
KalturaBaseEntryOrderBy.RANK_ASC = "+rank";
KalturaBaseEntryOrderBy.RECENT_ASC = "+recent";
KalturaBaseEntryOrderBy.START_DATE_ASC = "+startDate";
KalturaBaseEntryOrderBy.TOTAL_RANK_ASC = "+totalRank";
KalturaBaseEntryOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaBaseEntryOrderBy.WEIGHT_ASC = "+weight";
KalturaBaseEntryOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaBaseEntryOrderBy.END_DATE_DESC = "-endDate";
KalturaBaseEntryOrderBy.MODERATION_COUNT_DESC = "-moderationCount";
KalturaBaseEntryOrderBy.NAME_DESC = "-name";
KalturaBaseEntryOrderBy.PARTNER_SORT_VALUE_DESC = "-partnerSortValue";
KalturaBaseEntryOrderBy.RANK_DESC = "-rank";
KalturaBaseEntryOrderBy.RECENT_DESC = "-recent";
KalturaBaseEntryOrderBy.START_DATE_DESC = "-startDate";
KalturaBaseEntryOrderBy.TOTAL_RANK_DESC = "-totalRank";
KalturaBaseEntryOrderBy.UPDATED_AT_DESC = "-updatedAt";
KalturaBaseEntryOrderBy.WEIGHT_DESC = "-weight";

function KalturaBaseSyndicationFeedOrderBy(){
}
KalturaBaseSyndicationFeedOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaBaseSyndicationFeedOrderBy.NAME_ASC = "+name";
KalturaBaseSyndicationFeedOrderBy.PLAYLIST_ID_ASC = "+playlistId";
KalturaBaseSyndicationFeedOrderBy.TYPE_ASC = "+type";
KalturaBaseSyndicationFeedOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaBaseSyndicationFeedOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaBaseSyndicationFeedOrderBy.NAME_DESC = "-name";
KalturaBaseSyndicationFeedOrderBy.PLAYLIST_ID_DESC = "-playlistId";
KalturaBaseSyndicationFeedOrderBy.TYPE_DESC = "-type";
KalturaBaseSyndicationFeedOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaBatchJobOrderBy(){
}
KalturaBatchJobOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaBatchJobOrderBy.ESTIMATED_EFFORT_ASC = "+estimatedEffort";
KalturaBatchJobOrderBy.EXECUTION_ATTEMPTS_ASC = "+executionAttempts";
KalturaBatchJobOrderBy.FINISH_TIME_ASC = "+finishTime";
KalturaBatchJobOrderBy.LOCK_VERSION_ASC = "+lockVersion";
KalturaBatchJobOrderBy.PRIORITY_ASC = "+priority";
KalturaBatchJobOrderBy.QUEUE_TIME_ASC = "+queueTime";
KalturaBatchJobOrderBy.STATUS_ASC = "+status";
KalturaBatchJobOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaBatchJobOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaBatchJobOrderBy.ESTIMATED_EFFORT_DESC = "-estimatedEffort";
KalturaBatchJobOrderBy.EXECUTION_ATTEMPTS_DESC = "-executionAttempts";
KalturaBatchJobOrderBy.FINISH_TIME_DESC = "-finishTime";
KalturaBatchJobOrderBy.LOCK_VERSION_DESC = "-lockVersion";
KalturaBatchJobOrderBy.PRIORITY_DESC = "-priority";
KalturaBatchJobOrderBy.QUEUE_TIME_DESC = "-queueTime";
KalturaBatchJobOrderBy.STATUS_DESC = "-status";
KalturaBatchJobOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaBatchJobType(){
}
KalturaBatchJobType.PARSE_CAPTION_ASSET = "captionSearch.parseCaptionAsset";
KalturaBatchJobType.DISTRIBUTION_DELETE = "contentDistribution.DistributionDelete";
KalturaBatchJobType.DISTRIBUTION_DISABLE = "contentDistribution.DistributionDisable";
KalturaBatchJobType.DISTRIBUTION_ENABLE = "contentDistribution.DistributionEnable";
KalturaBatchJobType.DISTRIBUTION_FETCH_REPORT = "contentDistribution.DistributionFetchReport";
KalturaBatchJobType.DISTRIBUTION_SUBMIT = "contentDistribution.DistributionSubmit";
KalturaBatchJobType.DISTRIBUTION_SYNC = "contentDistribution.DistributionSync";
KalturaBatchJobType.DISTRIBUTION_UPDATE = "contentDistribution.DistributionUpdate";
KalturaBatchJobType.CONVERT = "0";
KalturaBatchJobType.DROP_FOLDER_CONTENT_PROCESSOR = "dropFolder.DropFolderContentProcessor";
KalturaBatchJobType.DROP_FOLDER_WATCHER = "dropFolder.DropFolderWatcher";
KalturaBatchJobType.EVENT_NOTIFICATION_HANDLER = "eventNotification.EventNotificationHandler";
KalturaBatchJobType.INDEX_TAGS = "tagSearch.IndexTagsByPrivacyContext";
KalturaBatchJobType.TAG_RESOLVE = "tagSearch.TagResolve";
KalturaBatchJobType.VIRUS_SCAN = "virusScan.VirusScan";
KalturaBatchJobType.WIDEVINE_REPOSITORY_SYNC = "widevine.WidevineRepositorySync";
KalturaBatchJobType.IMPORT = "1";
KalturaBatchJobType.DELETE = "2";
KalturaBatchJobType.FLATTEN = "3";
KalturaBatchJobType.BULKUPLOAD = "4";
KalturaBatchJobType.DVDCREATOR = "5";
KalturaBatchJobType.DOWNLOAD = "6";
KalturaBatchJobType.OOCONVERT = "7";
KalturaBatchJobType.CONVERT_PROFILE = "10";
KalturaBatchJobType.POSTCONVERT = "11";
KalturaBatchJobType.EXTRACT_MEDIA = "14";
KalturaBatchJobType.MAIL = "15";
KalturaBatchJobType.NOTIFICATION = "16";
KalturaBatchJobType.CLEANUP = "17";
KalturaBatchJobType.SCHEDULER_HELPER = "18";
KalturaBatchJobType.BULKDOWNLOAD = "19";
KalturaBatchJobType.DB_CLEANUP = "20";
KalturaBatchJobType.PROVISION_PROVIDE = "21";
KalturaBatchJobType.CONVERT_COLLECTION = "22";
KalturaBatchJobType.STORAGE_EXPORT = "23";
KalturaBatchJobType.PROVISION_DELETE = "24";
KalturaBatchJobType.STORAGE_DELETE = "25";
KalturaBatchJobType.EMAIL_INGESTION = "26";
KalturaBatchJobType.METADATA_IMPORT = "27";
KalturaBatchJobType.METADATA_TRANSFORM = "28";
KalturaBatchJobType.FILESYNC_IMPORT = "29";
KalturaBatchJobType.CAPTURE_THUMB = "30";
KalturaBatchJobType.DELETE_FILE = "31";
KalturaBatchJobType.INDEX = "32";
KalturaBatchJobType.MOVE_CATEGORY_ENTRIES = "33";
KalturaBatchJobType.COPY = "34";
KalturaBatchJobType.CONCAT = "35";
KalturaBatchJobType.CONVERT_LIVE_SEGMENT = "36";
KalturaBatchJobType.COPY_PARTNER = "37";
KalturaBatchJobType.VALIDATE_LIVE_MEDIA_SERVERS = "38";

function KalturaBulkUploadAction(){
}
KalturaBulkUploadAction.ADD = "1";
KalturaBulkUploadAction.UPDATE = "2";
KalturaBulkUploadAction.DELETE = "3";
KalturaBulkUploadAction.REPLACE = "4";
KalturaBulkUploadAction.TRANSFORM_XSLT = "5";
KalturaBulkUploadAction.ADD_OR_UPDATE = "6";

function KalturaBulkUploadObjectType(){
}
KalturaBulkUploadObjectType.ENTRY = "1";
KalturaBulkUploadObjectType.CATEGORY = "2";
KalturaBulkUploadObjectType.USER = "3";
KalturaBulkUploadObjectType.CATEGORY_USER = "4";
KalturaBulkUploadObjectType.CATEGORY_ENTRY = "5";

function KalturaBulkUploadOrderBy(){
}

function KalturaBulkUploadResultObjectType(){
}
KalturaBulkUploadResultObjectType.ENTRY = "1";
KalturaBulkUploadResultObjectType.CATEGORY = "2";
KalturaBulkUploadResultObjectType.USER = "3";
KalturaBulkUploadResultObjectType.CATEGORY_USER = "4";
KalturaBulkUploadResultObjectType.CATEGORY_ENTRY = "5";

function KalturaBulkUploadResultStatus(){
}
KalturaBulkUploadResultStatus.ERROR = "1";
KalturaBulkUploadResultStatus.OK = "2";
KalturaBulkUploadResultStatus.IN_PROGRESS = "3";

function KalturaBulkUploadType(){
}
KalturaBulkUploadType.CSV = "bulkUploadCsv.CSV";
KalturaBulkUploadType.FILTER = "bulkUploadFilter.FILTER";
KalturaBulkUploadType.XML = "bulkUploadXml.XML";
KalturaBulkUploadType.DROP_FOLDER_XML = "dropFolderXmlBulkUpload.DROP_FOLDER_XML";

function KalturaCaptionAssetOrderBy(){
}
KalturaCaptionAssetOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaCaptionAssetOrderBy.DELETED_AT_ASC = "+deletedAt";
KalturaCaptionAssetOrderBy.SIZE_ASC = "+size";
KalturaCaptionAssetOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaCaptionAssetOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaCaptionAssetOrderBy.DELETED_AT_DESC = "-deletedAt";
KalturaCaptionAssetOrderBy.SIZE_DESC = "-size";
KalturaCaptionAssetOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaCaptionParamsOrderBy(){
}

function KalturaCaptionType(){
}
KalturaCaptionType.SRT = "1";
KalturaCaptionType.DFXP = "2";
KalturaCaptionType.WEBVTT = "3";

function KalturaCategoryEntryOrderBy(){
}
KalturaCategoryEntryOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaCategoryEntryOrderBy.CREATED_AT_DESC = "-createdAt";

function KalturaCategoryIdentifierField(){
}
KalturaCategoryIdentifierField.FULL_NAME = "fullName";
KalturaCategoryIdentifierField.ID = "id";
KalturaCategoryIdentifierField.REFERENCE_ID = "referenceId";

function KalturaCategoryOrderBy(){
}
KalturaCategoryOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaCategoryOrderBy.DEPTH_ASC = "+depth";
KalturaCategoryOrderBy.DIRECT_ENTRIES_COUNT_ASC = "+directEntriesCount";
KalturaCategoryOrderBy.DIRECT_SUB_CATEGORIES_COUNT_ASC = "+directSubCategoriesCount";
KalturaCategoryOrderBy.ENTRIES_COUNT_ASC = "+entriesCount";
KalturaCategoryOrderBy.FULL_NAME_ASC = "+fullName";
KalturaCategoryOrderBy.MEMBERS_COUNT_ASC = "+membersCount";
KalturaCategoryOrderBy.NAME_ASC = "+name";
KalturaCategoryOrderBy.PARTNER_SORT_VALUE_ASC = "+partnerSortValue";
KalturaCategoryOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaCategoryOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaCategoryOrderBy.DEPTH_DESC = "-depth";
KalturaCategoryOrderBy.DIRECT_ENTRIES_COUNT_DESC = "-directEntriesCount";
KalturaCategoryOrderBy.DIRECT_SUB_CATEGORIES_COUNT_DESC = "-directSubCategoriesCount";
KalturaCategoryOrderBy.ENTRIES_COUNT_DESC = "-entriesCount";
KalturaCategoryOrderBy.FULL_NAME_DESC = "-fullName";
KalturaCategoryOrderBy.MEMBERS_COUNT_DESC = "-membersCount";
KalturaCategoryOrderBy.NAME_DESC = "-name";
KalturaCategoryOrderBy.PARTNER_SORT_VALUE_DESC = "-partnerSortValue";
KalturaCategoryOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaCategoryUserOrderBy(){
}
KalturaCategoryUserOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaCategoryUserOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaCategoryUserOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaCategoryUserOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaCodeCuePointOrderBy(){
}
KalturaCodeCuePointOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaCodeCuePointOrderBy.DURATION_ASC = "+duration";
KalturaCodeCuePointOrderBy.END_TIME_ASC = "+endTime";
KalturaCodeCuePointOrderBy.PARTNER_SORT_VALUE_ASC = "+partnerSortValue";
KalturaCodeCuePointOrderBy.START_TIME_ASC = "+startTime";
KalturaCodeCuePointOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaCodeCuePointOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaCodeCuePointOrderBy.DURATION_DESC = "-duration";
KalturaCodeCuePointOrderBy.END_TIME_DESC = "-endTime";
KalturaCodeCuePointOrderBy.PARTNER_SORT_VALUE_DESC = "-partnerSortValue";
KalturaCodeCuePointOrderBy.START_TIME_DESC = "-startTime";
KalturaCodeCuePointOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaConditionType(){
}
KalturaConditionType.ABC_WATERMARK = "abcScreenersWatermarkAccessControl.abcWatermark";
KalturaConditionType.EVENT_NOTIFICATION_FIELD = "eventNotification.BooleanField";
KalturaConditionType.EVENT_NOTIFICATION_OBJECT_CHANGED = "eventNotification.ObjectChanged";
KalturaConditionType.METADATA_FIELD_CHANGED = "metadata.FieldChanged";
KalturaConditionType.METADATA_FIELD_COMPARE = "metadata.FieldCompare";
KalturaConditionType.METADATA_FIELD_MATCH = "metadata.FieldMatch";
KalturaConditionType.AUTHENTICATED = "1";
KalturaConditionType.COUNTRY = "2";
KalturaConditionType.IP_ADDRESS = "3";
KalturaConditionType.SITE = "4";
KalturaConditionType.USER_AGENT = "5";
KalturaConditionType.FIELD_MATCH = "6";
KalturaConditionType.FIELD_COMPARE = "7";
KalturaConditionType.ASSET_PROPERTIES_COMPARE = "8";

function KalturaConfigurableDistributionProfileOrderBy(){
}
KalturaConfigurableDistributionProfileOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaConfigurableDistributionProfileOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaConfigurableDistributionProfileOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaConfigurableDistributionProfileOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaContainerFormat(){
}
KalturaContainerFormat._3GP = "3gp";
KalturaContainerFormat.APPLEHTTP = "applehttp";
KalturaContainerFormat.AVI = "avi";
KalturaContainerFormat.BMP = "bmp";
KalturaContainerFormat.COPY = "copy";
KalturaContainerFormat.FLV = "flv";
KalturaContainerFormat.ISMV = "ismv";
KalturaContainerFormat.JPG = "jpg";
KalturaContainerFormat.MKV = "mkv";
KalturaContainerFormat.MOV = "mov";
KalturaContainerFormat.MP3 = "mp3";
KalturaContainerFormat.MP4 = "mp4";
KalturaContainerFormat.MPEG = "mpeg";
KalturaContainerFormat.MPEGTS = "mpegts";
KalturaContainerFormat.OGG = "ogg";
KalturaContainerFormat.OGV = "ogv";
KalturaContainerFormat.PDF = "pdf";
KalturaContainerFormat.PNG = "png";
KalturaContainerFormat.SWF = "swf";
KalturaContainerFormat.WAV = "wav";
KalturaContainerFormat.WEBM = "webm";
KalturaContainerFormat.WMA = "wma";
KalturaContainerFormat.WMV = "wmv";
KalturaContainerFormat.WVM = "wvm";

function KalturaContextType(){
}
KalturaContextType.PLAY = "1";
KalturaContextType.DOWNLOAD = "2";
KalturaContextType.THUMBNAIL = "3";
KalturaContextType.METADATA = "4";
KalturaContextType.EXPORT = "5";

function KalturaControlPanelCommandOrderBy(){
}
KalturaControlPanelCommandOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaControlPanelCommandOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaControlPanelCommandOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaControlPanelCommandOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaConversionProfileAssetParamsOrderBy(){
}

function KalturaConversionProfileOrderBy(){
}
KalturaConversionProfileOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaConversionProfileOrderBy.CREATED_AT_DESC = "-createdAt";

function KalturaConversionProfileStatus(){
}
KalturaConversionProfileStatus.DISABLED = "1";
KalturaConversionProfileStatus.ENABLED = "2";
KalturaConversionProfileStatus.DELETED = "3";

function KalturaConversionProfileType(){
}
KalturaConversionProfileType.MEDIA = "1";
KalturaConversionProfileType.LIVE_STREAM = "2";

function KalturaCuePointOrderBy(){
}
KalturaCuePointOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaCuePointOrderBy.PARTNER_SORT_VALUE_ASC = "+partnerSortValue";
KalturaCuePointOrderBy.START_TIME_ASC = "+startTime";
KalturaCuePointOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaCuePointOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaCuePointOrderBy.PARTNER_SORT_VALUE_DESC = "-partnerSortValue";
KalturaCuePointOrderBy.START_TIME_DESC = "-startTime";
KalturaCuePointOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaCuePointType(){
}
KalturaCuePointType.AD = "adCuePoint.Ad";
KalturaCuePointType.ANNOTATION = "annotation.Annotation";
KalturaCuePointType.CODE = "codeCuePoint.Code";

function KalturaDataEntryOrderBy(){
}
KalturaDataEntryOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaDataEntryOrderBy.END_DATE_ASC = "+endDate";
KalturaDataEntryOrderBy.MODERATION_COUNT_ASC = "+moderationCount";
KalturaDataEntryOrderBy.NAME_ASC = "+name";
KalturaDataEntryOrderBy.PARTNER_SORT_VALUE_ASC = "+partnerSortValue";
KalturaDataEntryOrderBy.RANK_ASC = "+rank";
KalturaDataEntryOrderBy.RECENT_ASC = "+recent";
KalturaDataEntryOrderBy.START_DATE_ASC = "+startDate";
KalturaDataEntryOrderBy.TOTAL_RANK_ASC = "+totalRank";
KalturaDataEntryOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaDataEntryOrderBy.WEIGHT_ASC = "+weight";
KalturaDataEntryOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaDataEntryOrderBy.END_DATE_DESC = "-endDate";
KalturaDataEntryOrderBy.MODERATION_COUNT_DESC = "-moderationCount";
KalturaDataEntryOrderBy.NAME_DESC = "-name";
KalturaDataEntryOrderBy.PARTNER_SORT_VALUE_DESC = "-partnerSortValue";
KalturaDataEntryOrderBy.RANK_DESC = "-rank";
KalturaDataEntryOrderBy.RECENT_DESC = "-recent";
KalturaDataEntryOrderBy.START_DATE_DESC = "-startDate";
KalturaDataEntryOrderBy.TOTAL_RANK_DESC = "-totalRank";
KalturaDataEntryOrderBy.UPDATED_AT_DESC = "-updatedAt";
KalturaDataEntryOrderBy.WEIGHT_DESC = "-weight";

function KalturaDistributionProfileOrderBy(){
}
KalturaDistributionProfileOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaDistributionProfileOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaDistributionProfileOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaDistributionProfileOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaDistributionProviderOrderBy(){
}

function KalturaDistributionProviderType(){
}
KalturaDistributionProviderType.ATT_UVERSE = "attUverseDistribution.ATT_UVERSE";
KalturaDistributionProviderType.AVN = "avnDistribution.AVN";
KalturaDistributionProviderType.COMCAST_MRSS = "comcastMrssDistribution.COMCAST_MRSS";
KalturaDistributionProviderType.CROSS_KALTURA = "crossKalturaDistribution.CROSS_KALTURA";
KalturaDistributionProviderType.DAILYMOTION = "dailymotionDistribution.DAILYMOTION";
KalturaDistributionProviderType.DOUBLECLICK = "doubleClickDistribution.DOUBLECLICK";
KalturaDistributionProviderType.FREEWHEEL = "freewheelDistribution.FREEWHEEL";
KalturaDistributionProviderType.FREEWHEEL_GENERIC = "freewheelGenericDistribution.FREEWHEEL_GENERIC";
KalturaDistributionProviderType.FTP = "ftpDistribution.FTP";
KalturaDistributionProviderType.FTP_SCHEDULED = "ftpDistribution.FTP_SCHEDULED";
KalturaDistributionProviderType.HULU = "huluDistribution.HULU";
KalturaDistributionProviderType.IDETIC = "ideticDistribution.IDETIC";
KalturaDistributionProviderType.METRO_PCS = "metroPcsDistribution.METRO_PCS";
KalturaDistributionProviderType.MSN = "msnDistribution.MSN";
KalturaDistributionProviderType.NDN = "ndnDistribution.NDN";
KalturaDistributionProviderType.PODCAST = "podcastDistribution.PODCAST";
KalturaDistributionProviderType.QUICKPLAY = "quickPlayDistribution.QUICKPLAY";
KalturaDistributionProviderType.SYNACOR_HBO = "synacorHboDistribution.SYNACOR_HBO";
KalturaDistributionProviderType.TIME_WARNER = "timeWarnerDistribution.TIME_WARNER";
KalturaDistributionProviderType.TVCOM = "tvComDistribution.TVCOM";
KalturaDistributionProviderType.UVERSE_CLICK_TO_ORDER = "uverseClickToOrderDistribution.UVERSE_CLICK_TO_ORDER";
KalturaDistributionProviderType.UVERSE = "uverseDistribution.UVERSE";
KalturaDistributionProviderType.VERIZON_VCAST = "verizonVcastDistribution.VERIZON_VCAST";
KalturaDistributionProviderType.YAHOO = "yahooDistribution.YAHOO";
KalturaDistributionProviderType.YOUTUBE = "youTubeDistribution.YOUTUBE";
KalturaDistributionProviderType.YOUTUBE_API = "youtubeApiDistribution.YOUTUBE_API";
KalturaDistributionProviderType.GENERIC = "1";
KalturaDistributionProviderType.SYNDICATION = "2";

function KalturaDocumentEntryOrderBy(){
}
KalturaDocumentEntryOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaDocumentEntryOrderBy.END_DATE_ASC = "+endDate";
KalturaDocumentEntryOrderBy.MODERATION_COUNT_ASC = "+moderationCount";
KalturaDocumentEntryOrderBy.NAME_ASC = "+name";
KalturaDocumentEntryOrderBy.PARTNER_SORT_VALUE_ASC = "+partnerSortValue";
KalturaDocumentEntryOrderBy.RANK_ASC = "+rank";
KalturaDocumentEntryOrderBy.RECENT_ASC = "+recent";
KalturaDocumentEntryOrderBy.START_DATE_ASC = "+startDate";
KalturaDocumentEntryOrderBy.TOTAL_RANK_ASC = "+totalRank";
KalturaDocumentEntryOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaDocumentEntryOrderBy.WEIGHT_ASC = "+weight";
KalturaDocumentEntryOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaDocumentEntryOrderBy.END_DATE_DESC = "-endDate";
KalturaDocumentEntryOrderBy.MODERATION_COUNT_DESC = "-moderationCount";
KalturaDocumentEntryOrderBy.NAME_DESC = "-name";
KalturaDocumentEntryOrderBy.PARTNER_SORT_VALUE_DESC = "-partnerSortValue";
KalturaDocumentEntryOrderBy.RANK_DESC = "-rank";
KalturaDocumentEntryOrderBy.RECENT_DESC = "-recent";
KalturaDocumentEntryOrderBy.START_DATE_DESC = "-startDate";
KalturaDocumentEntryOrderBy.TOTAL_RANK_DESC = "-totalRank";
KalturaDocumentEntryOrderBy.UPDATED_AT_DESC = "-updatedAt";
KalturaDocumentEntryOrderBy.WEIGHT_DESC = "-weight";

function KalturaDocumentFlavorParamsOrderBy(){
}

function KalturaDocumentFlavorParamsOutputOrderBy(){
}

function KalturaDrmProfileOrderBy(){
}
KalturaDrmProfileOrderBy.ID_ASC = "+id";
KalturaDrmProfileOrderBy.NAME_ASC = "+name";
KalturaDrmProfileOrderBy.ID_DESC = "-id";
KalturaDrmProfileOrderBy.NAME_DESC = "-name";

function KalturaDrmProviderType(){
}
KalturaDrmProviderType.WIDEVINE = "widevine.WIDEVINE";

function KalturaDropFolderErrorCode(){
}
KalturaDropFolderErrorCode.ERROR_CONNECT = "1";
KalturaDropFolderErrorCode.ERROR_AUTENTICATE = "2";
KalturaDropFolderErrorCode.ERROR_GET_PHISICAL_FILE_LIST = "3";
KalturaDropFolderErrorCode.ERROR_GET_DB_FILE_LIST = "4";
KalturaDropFolderErrorCode.DROP_FOLDER_APP_ERROR = "5";
KalturaDropFolderErrorCode.CONTENT_MATCH_POLICY_UNDEFINED = "6";

function KalturaDropFolderFileErrorCode(){
}
KalturaDropFolderFileErrorCode.ERROR_ADDING_BULK_UPLOAD = "dropFolderXmlBulkUpload.ERROR_ADDING_BULK_UPLOAD";
KalturaDropFolderFileErrorCode.ERROR_ADD_CONTENT_RESOURCE = "dropFolderXmlBulkUpload.ERROR_ADD_CONTENT_RESOURCE";
KalturaDropFolderFileErrorCode.ERROR_IN_BULK_UPLOAD = "dropFolderXmlBulkUpload.ERROR_IN_BULK_UPLOAD";
KalturaDropFolderFileErrorCode.ERROR_WRITING_TEMP_FILE = "dropFolderXmlBulkUpload.ERROR_WRITING_TEMP_FILE";
KalturaDropFolderFileErrorCode.LOCAL_FILE_WRONG_CHECKSUM = "dropFolderXmlBulkUpload.LOCAL_FILE_WRONG_CHECKSUM";
KalturaDropFolderFileErrorCode.LOCAL_FILE_WRONG_SIZE = "dropFolderXmlBulkUpload.LOCAL_FILE_WRONG_SIZE";
KalturaDropFolderFileErrorCode.MALFORMED_XML_FILE = "dropFolderXmlBulkUpload.MALFORMED_XML_FILE";
KalturaDropFolderFileErrorCode.XML_FILE_SIZE_EXCEED_LIMIT = "dropFolderXmlBulkUpload.XML_FILE_SIZE_EXCEED_LIMIT";
KalturaDropFolderFileErrorCode.ERROR_UPDATE_ENTRY = "1";
KalturaDropFolderFileErrorCode.ERROR_ADD_ENTRY = "2";
KalturaDropFolderFileErrorCode.FLAVOR_NOT_FOUND = "3";
KalturaDropFolderFileErrorCode.FLAVOR_MISSING_IN_FILE_NAME = "4";
KalturaDropFolderFileErrorCode.SLUG_REGEX_NO_MATCH = "5";
KalturaDropFolderFileErrorCode.ERROR_READING_FILE = "6";
KalturaDropFolderFileErrorCode.ERROR_DOWNLOADING_FILE = "7";
KalturaDropFolderFileErrorCode.ERROR_UPDATE_FILE = "8";
KalturaDropFolderFileErrorCode.ERROR_ADDING_CONTENT_PROCESSOR = "10";
KalturaDropFolderFileErrorCode.ERROR_IN_CONTENT_PROCESSOR = "11";
KalturaDropFolderFileErrorCode.ERROR_DELETING_FILE = "12";
KalturaDropFolderFileErrorCode.FILE_NO_MATCH = "13";

function KalturaDropFolderFileHandlerType(){
}
KalturaDropFolderFileHandlerType.XML = "dropFolderXmlBulkUpload.XML";
KalturaDropFolderFileHandlerType.CONTENT = "1";

function KalturaDropFolderFileOrderBy(){
}
KalturaDropFolderFileOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaDropFolderFileOrderBy.FILE_NAME_ASC = "+fileName";
KalturaDropFolderFileOrderBy.FILE_SIZE_ASC = "+fileSize";
KalturaDropFolderFileOrderBy.FILE_SIZE_LAST_SET_AT_ASC = "+fileSizeLastSetAt";
KalturaDropFolderFileOrderBy.ID_ASC = "+id";
KalturaDropFolderFileOrderBy.PARSED_FLAVOR_ASC = "+parsedFlavor";
KalturaDropFolderFileOrderBy.PARSED_SLUG_ASC = "+parsedSlug";
KalturaDropFolderFileOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaDropFolderFileOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaDropFolderFileOrderBy.FILE_NAME_DESC = "-fileName";
KalturaDropFolderFileOrderBy.FILE_SIZE_DESC = "-fileSize";
KalturaDropFolderFileOrderBy.FILE_SIZE_LAST_SET_AT_DESC = "-fileSizeLastSetAt";
KalturaDropFolderFileOrderBy.ID_DESC = "-id";
KalturaDropFolderFileOrderBy.PARSED_FLAVOR_DESC = "-parsedFlavor";
KalturaDropFolderFileOrderBy.PARSED_SLUG_DESC = "-parsedSlug";
KalturaDropFolderFileOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaDropFolderOrderBy(){
}
KalturaDropFolderOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaDropFolderOrderBy.ID_ASC = "+id";
KalturaDropFolderOrderBy.NAME_ASC = "+name";
KalturaDropFolderOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaDropFolderOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaDropFolderOrderBy.ID_DESC = "-id";
KalturaDropFolderOrderBy.NAME_DESC = "-name";
KalturaDropFolderOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaDropFolderType(){
}
KalturaDropFolderType.WEBEX = "WebexDropFolder.WEBEX";
KalturaDropFolderType.LOCAL = "1";
KalturaDropFolderType.FTP = "2";
KalturaDropFolderType.SCP = "3";
KalturaDropFolderType.SFTP = "4";
KalturaDropFolderType.S3 = "6";

function KalturaDurationType(){
}
KalturaDurationType.LONG = "long";
KalturaDurationType.MEDIUM = "medium";
KalturaDurationType.NOT_AVAILABLE = "notavailable";
KalturaDurationType.SHORT = "short";

function KalturaDynamicEnum(){
}

function KalturaEmailNotificationFormat(){
}
KalturaEmailNotificationFormat.HTML = "1";
KalturaEmailNotificationFormat.TEXT = "2";

function KalturaEmailNotificationRecipientProviderType(){
}
KalturaEmailNotificationRecipientProviderType.STATIC_LIST = "1";
KalturaEmailNotificationRecipientProviderType.CATEGORY = "2";
KalturaEmailNotificationRecipientProviderType.USER = "3";

function KalturaEmailNotificationTemplateOrderBy(){
}
KalturaEmailNotificationTemplateOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaEmailNotificationTemplateOrderBy.ID_ASC = "+id";
KalturaEmailNotificationTemplateOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaEmailNotificationTemplateOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaEmailNotificationTemplateOrderBy.ID_DESC = "-id";
KalturaEmailNotificationTemplateOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaEntryDistributionOrderBy(){
}
KalturaEntryDistributionOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaEntryDistributionOrderBy.SUBMITTED_AT_ASC = "+submittedAt";
KalturaEntryDistributionOrderBy.SUNRISE_ASC = "+sunrise";
KalturaEntryDistributionOrderBy.SUNSET_ASC = "+sunset";
KalturaEntryDistributionOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaEntryDistributionOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaEntryDistributionOrderBy.SUBMITTED_AT_DESC = "-submittedAt";
KalturaEntryDistributionOrderBy.SUNRISE_DESC = "-sunrise";
KalturaEntryDistributionOrderBy.SUNSET_DESC = "-sunset";
KalturaEntryDistributionOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaEntryIdentifierField(){
}
KalturaEntryIdentifierField.ID = "id";
KalturaEntryIdentifierField.REFERENCE_ID = "referenceId";

function KalturaEntryReplacementStatus(){
}
KalturaEntryReplacementStatus.NONE = "0";
KalturaEntryReplacementStatus.APPROVED_BUT_NOT_READY = "1";
KalturaEntryReplacementStatus.READY_BUT_NOT_APPROVED = "2";
KalturaEntryReplacementStatus.NOT_READY_AND_NOT_APPROVED = "3";

function KalturaEntryStatus(){
}
KalturaEntryStatus.ERROR_IMPORTING = "-2";
KalturaEntryStatus.ERROR_CONVERTING = "-1";
KalturaEntryStatus.SCAN_FAILURE = "virusScan.ScanFailure";
KalturaEntryStatus.IMPORT = "0";
KalturaEntryStatus.INFECTED = "virusScan.Infected";
KalturaEntryStatus.PRECONVERT = "1";
KalturaEntryStatus.READY = "2";
KalturaEntryStatus.DELETED = "3";
KalturaEntryStatus.PENDING = "4";
KalturaEntryStatus.MODERATE = "5";
KalturaEntryStatus.BLOCKED = "6";
KalturaEntryStatus.NO_CONTENT = "7";

function KalturaEntryType(){
}
KalturaEntryType.AUTOMATIC = "-1";
KalturaEntryType.EXTERNAL_MEDIA = "externalMedia.externalMedia";
KalturaEntryType.MEDIA_CLIP = "1";
KalturaEntryType.MIX = "2";
KalturaEntryType.PLAYLIST = "5";
KalturaEntryType.DATA = "6";
KalturaEntryType.LIVE_STREAM = "7";
KalturaEntryType.LIVE_CHANNEL = "8";
KalturaEntryType.DOCUMENT = "10";

function KalturaEventNotificationEventObjectType(){
}
KalturaEventNotificationEventObjectType.AD_CUE_POINT = "adCuePointEventNotifications.AdCuePoint";
KalturaEventNotificationEventObjectType.ANNOTATION = "annotationEventNotifications.Annotation";
KalturaEventNotificationEventObjectType.CAPTION_ASSET = "captionAssetEventNotifications.CaptionAsset";
KalturaEventNotificationEventObjectType.CODE_CUE_POINT = "codeCuePointEventNotifications.CodeCuePoint";
KalturaEventNotificationEventObjectType.DISTRIBUTION_PROFILE = "contentDistributionEventNotifications.DistributionProfile";
KalturaEventNotificationEventObjectType.ENTRY_DISTRIBUTION = "contentDistributionEventNotifications.EntryDistribution";
KalturaEventNotificationEventObjectType.CUE_POINT = "cuePointEventNotifications.CuePoint";
KalturaEventNotificationEventObjectType.METADATA = "metadataEventNotifications.Metadata";
KalturaEventNotificationEventObjectType.ENTRY = "1";
KalturaEventNotificationEventObjectType.CATEGORY = "2";
KalturaEventNotificationEventObjectType.ASSET = "3";
KalturaEventNotificationEventObjectType.FLAVORASSET = "4";
KalturaEventNotificationEventObjectType.THUMBASSET = "5";
KalturaEventNotificationEventObjectType.KUSER = "8";
KalturaEventNotificationEventObjectType.ACCESSCONTROL = "9";
KalturaEventNotificationEventObjectType.BATCHJOB = "10";
KalturaEventNotificationEventObjectType.BULKUPLOADRESULT = "11";
KalturaEventNotificationEventObjectType.CATEGORYKUSER = "12";
KalturaEventNotificationEventObjectType.CONVERSIONPROFILE2 = "14";
KalturaEventNotificationEventObjectType.FLAVORPARAMS = "15";
KalturaEventNotificationEventObjectType.FLAVORPARAMSCONVERSIONPROFILE = "16";
KalturaEventNotificationEventObjectType.FLAVORPARAMSOUTPUT = "17";
KalturaEventNotificationEventObjectType.GENERICSYNDICATIONFEED = "18";
KalturaEventNotificationEventObjectType.KUSERTOUSERROLE = "19";
KalturaEventNotificationEventObjectType.PARTNER = "20";
KalturaEventNotificationEventObjectType.PERMISSION = "21";
KalturaEventNotificationEventObjectType.PERMISSIONITEM = "22";
KalturaEventNotificationEventObjectType.PERMISSIONTOPERMISSIONITEM = "23";
KalturaEventNotificationEventObjectType.SCHEDULER = "24";
KalturaEventNotificationEventObjectType.SCHEDULERCONFIG = "25";
KalturaEventNotificationEventObjectType.SCHEDULERSTATUS = "26";
KalturaEventNotificationEventObjectType.SCHEDULERWORKER = "27";
KalturaEventNotificationEventObjectType.STORAGEPROFILE = "28";
KalturaEventNotificationEventObjectType.SYNDICATIONFEED = "29";
KalturaEventNotificationEventObjectType.THUMBPARAMS = "31";
KalturaEventNotificationEventObjectType.THUMBPARAMSOUTPUT = "32";
KalturaEventNotificationEventObjectType.UPLOADTOKEN = "33";
KalturaEventNotificationEventObjectType.USERLOGINDATA = "34";
KalturaEventNotificationEventObjectType.USERROLE = "35";
KalturaEventNotificationEventObjectType.WIDGET = "36";
KalturaEventNotificationEventObjectType.CATEGORYENTRY = "37";

function KalturaEventNotificationEventType(){
}
KalturaEventNotificationEventType.BATCH_JOB_STATUS = "1";
KalturaEventNotificationEventType.OBJECT_ADDED = "2";
KalturaEventNotificationEventType.OBJECT_CHANGED = "3";
KalturaEventNotificationEventType.OBJECT_COPIED = "4";
KalturaEventNotificationEventType.OBJECT_CREATED = "5";
KalturaEventNotificationEventType.OBJECT_DATA_CHANGED = "6";
KalturaEventNotificationEventType.OBJECT_DELETED = "7";
KalturaEventNotificationEventType.OBJECT_ERASED = "8";
KalturaEventNotificationEventType.OBJECT_READY_FOR_REPLACMENT = "9";
KalturaEventNotificationEventType.OBJECT_SAVED = "10";
KalturaEventNotificationEventType.OBJECT_UPDATED = "11";
KalturaEventNotificationEventType.OBJECT_REPLACED = "12";

function KalturaEventNotificationTemplateOrderBy(){
}
KalturaEventNotificationTemplateOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaEventNotificationTemplateOrderBy.ID_ASC = "+id";
KalturaEventNotificationTemplateOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaEventNotificationTemplateOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaEventNotificationTemplateOrderBy.ID_DESC = "-id";
KalturaEventNotificationTemplateOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaEventNotificationTemplateType(){
}
KalturaEventNotificationTemplateType.EMAIL = "emailNotification.Email";
KalturaEventNotificationTemplateType.HTTP = "httpNotification.Http";

function KalturaExternalMediaEntryOrderBy(){
}
KalturaExternalMediaEntryOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaExternalMediaEntryOrderBy.DURATION_ASC = "+duration";
KalturaExternalMediaEntryOrderBy.END_DATE_ASC = "+endDate";
KalturaExternalMediaEntryOrderBy.LAST_PLAYED_AT_ASC = "+lastPlayedAt";
KalturaExternalMediaEntryOrderBy.MEDIA_TYPE_ASC = "+mediaType";
KalturaExternalMediaEntryOrderBy.MODERATION_COUNT_ASC = "+moderationCount";
KalturaExternalMediaEntryOrderBy.NAME_ASC = "+name";
KalturaExternalMediaEntryOrderBy.PARTNER_SORT_VALUE_ASC = "+partnerSortValue";
KalturaExternalMediaEntryOrderBy.PLAYS_ASC = "+plays";
KalturaExternalMediaEntryOrderBy.RANK_ASC = "+rank";
KalturaExternalMediaEntryOrderBy.RECENT_ASC = "+recent";
KalturaExternalMediaEntryOrderBy.START_DATE_ASC = "+startDate";
KalturaExternalMediaEntryOrderBy.TOTAL_RANK_ASC = "+totalRank";
KalturaExternalMediaEntryOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaExternalMediaEntryOrderBy.VIEWS_ASC = "+views";
KalturaExternalMediaEntryOrderBy.WEIGHT_ASC = "+weight";
KalturaExternalMediaEntryOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaExternalMediaEntryOrderBy.DURATION_DESC = "-duration";
KalturaExternalMediaEntryOrderBy.END_DATE_DESC = "-endDate";
KalturaExternalMediaEntryOrderBy.LAST_PLAYED_AT_DESC = "-lastPlayedAt";
KalturaExternalMediaEntryOrderBy.MEDIA_TYPE_DESC = "-mediaType";
KalturaExternalMediaEntryOrderBy.MODERATION_COUNT_DESC = "-moderationCount";
KalturaExternalMediaEntryOrderBy.NAME_DESC = "-name";
KalturaExternalMediaEntryOrderBy.PARTNER_SORT_VALUE_DESC = "-partnerSortValue";
KalturaExternalMediaEntryOrderBy.PLAYS_DESC = "-plays";
KalturaExternalMediaEntryOrderBy.RANK_DESC = "-rank";
KalturaExternalMediaEntryOrderBy.RECENT_DESC = "-recent";
KalturaExternalMediaEntryOrderBy.START_DATE_DESC = "-startDate";
KalturaExternalMediaEntryOrderBy.TOTAL_RANK_DESC = "-totalRank";
KalturaExternalMediaEntryOrderBy.UPDATED_AT_DESC = "-updatedAt";
KalturaExternalMediaEntryOrderBy.VIEWS_DESC = "-views";
KalturaExternalMediaEntryOrderBy.WEIGHT_DESC = "-weight";

function KalturaExternalMediaSourceType(){
}
KalturaExternalMediaSourceType.INTERCALL = "InterCall";
KalturaExternalMediaSourceType.YOUTUBE = "YouTube";

function KalturaFileAssetObjectType(){
}
KalturaFileAssetObjectType.UI_CONF = "2";

function KalturaFileAssetOrderBy(){
}
KalturaFileAssetOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaFileAssetOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaFileAssetOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaFileAssetOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaFileAssetStatus(){
}
KalturaFileAssetStatus.PENDING = "0";
KalturaFileAssetStatus.UPLOADING = "1";
KalturaFileAssetStatus.READY = "2";
KalturaFileAssetStatus.DELETED = "3";
KalturaFileAssetStatus.ERROR = "4";

function KalturaFileSyncObjectType(){
}
KalturaFileSyncObjectType.DISTRIBUTION_PROFILE = "contentDistribution.DistributionProfile";
KalturaFileSyncObjectType.ENTRY_DISTRIBUTION = "contentDistribution.EntryDistribution";
KalturaFileSyncObjectType.GENERIC_DISTRIBUTION_ACTION = "contentDistribution.GenericDistributionAction";
KalturaFileSyncObjectType.EMAIL_NOTIFICATION_TEMPLATE = "emailNotification.EmailNotificationTemplate";
KalturaFileSyncObjectType.HTTP_NOTIFICATION_TEMPLATE = "httpNotification.HttpNotificationTemplate";
KalturaFileSyncObjectType.ENTRY = "1";
KalturaFileSyncObjectType.UICONF = "2";
KalturaFileSyncObjectType.BATCHJOB = "3";
KalturaFileSyncObjectType.ASSET = "4";
KalturaFileSyncObjectType.FLAVOR_ASSET = "4";
KalturaFileSyncObjectType.METADATA = "5";
KalturaFileSyncObjectType.METADATA_PROFILE = "6";
KalturaFileSyncObjectType.SYNDICATION_FEED = "7";
KalturaFileSyncObjectType.CONVERSION_PROFILE = "8";
KalturaFileSyncObjectType.FILE_ASSET = "9";

function KalturaFileSyncOrderBy(){
}
KalturaFileSyncOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaFileSyncOrderBy.FILE_SIZE_ASC = "+fileSize";
KalturaFileSyncOrderBy.READY_AT_ASC = "+readyAt";
KalturaFileSyncOrderBy.SYNC_TIME_ASC = "+syncTime";
KalturaFileSyncOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaFileSyncOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaFileSyncOrderBy.FILE_SIZE_DESC = "-fileSize";
KalturaFileSyncOrderBy.READY_AT_DESC = "-readyAt";
KalturaFileSyncOrderBy.SYNC_TIME_DESC = "-syncTime";
KalturaFileSyncOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaFlavorAssetOrderBy(){
}
KalturaFlavorAssetOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaFlavorAssetOrderBy.DELETED_AT_ASC = "+deletedAt";
KalturaFlavorAssetOrderBy.SIZE_ASC = "+size";
KalturaFlavorAssetOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaFlavorAssetOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaFlavorAssetOrderBy.DELETED_AT_DESC = "-deletedAt";
KalturaFlavorAssetOrderBy.SIZE_DESC = "-size";
KalturaFlavorAssetOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaFlavorParamsOrderBy(){
}

function KalturaFlavorParamsOutputOrderBy(){
}

function KalturaFtpDropFolderOrderBy(){
}
KalturaFtpDropFolderOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaFtpDropFolderOrderBy.ID_ASC = "+id";
KalturaFtpDropFolderOrderBy.NAME_ASC = "+name";
KalturaFtpDropFolderOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaFtpDropFolderOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaFtpDropFolderOrderBy.ID_DESC = "-id";
KalturaFtpDropFolderOrderBy.NAME_DESC = "-name";
KalturaFtpDropFolderOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaGenericDistributionProfileOrderBy(){
}
KalturaGenericDistributionProfileOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaGenericDistributionProfileOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaGenericDistributionProfileOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaGenericDistributionProfileOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaGenericDistributionProviderActionOrderBy(){
}
KalturaGenericDistributionProviderActionOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaGenericDistributionProviderActionOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaGenericDistributionProviderActionOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaGenericDistributionProviderActionOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaGenericDistributionProviderOrderBy(){
}
KalturaGenericDistributionProviderOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaGenericDistributionProviderOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaGenericDistributionProviderOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaGenericDistributionProviderOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaGenericSyndicationFeedOrderBy(){
}
KalturaGenericSyndicationFeedOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaGenericSyndicationFeedOrderBy.NAME_ASC = "+name";
KalturaGenericSyndicationFeedOrderBy.PLAYLIST_ID_ASC = "+playlistId";
KalturaGenericSyndicationFeedOrderBy.TYPE_ASC = "+type";
KalturaGenericSyndicationFeedOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaGenericSyndicationFeedOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaGenericSyndicationFeedOrderBy.NAME_DESC = "-name";
KalturaGenericSyndicationFeedOrderBy.PLAYLIST_ID_DESC = "-playlistId";
KalturaGenericSyndicationFeedOrderBy.TYPE_DESC = "-type";
KalturaGenericSyndicationFeedOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaGenericXsltSyndicationFeedOrderBy(){
}
KalturaGenericXsltSyndicationFeedOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaGenericXsltSyndicationFeedOrderBy.NAME_ASC = "+name";
KalturaGenericXsltSyndicationFeedOrderBy.PLAYLIST_ID_ASC = "+playlistId";
KalturaGenericXsltSyndicationFeedOrderBy.TYPE_ASC = "+type";
KalturaGenericXsltSyndicationFeedOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaGenericXsltSyndicationFeedOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaGenericXsltSyndicationFeedOrderBy.NAME_DESC = "-name";
KalturaGenericXsltSyndicationFeedOrderBy.PLAYLIST_ID_DESC = "-playlistId";
KalturaGenericXsltSyndicationFeedOrderBy.TYPE_DESC = "-type";
KalturaGenericXsltSyndicationFeedOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaGeoCoderType(){
}
KalturaGeoCoderType.KALTURA = "1";

function KalturaGoogleSyndicationFeedAdultValues(){
}
KalturaGoogleSyndicationFeedAdultValues.NO = "No";
KalturaGoogleSyndicationFeedAdultValues.YES = "Yes";

function KalturaGoogleVideoSyndicationFeedOrderBy(){
}
KalturaGoogleVideoSyndicationFeedOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaGoogleVideoSyndicationFeedOrderBy.NAME_ASC = "+name";
KalturaGoogleVideoSyndicationFeedOrderBy.PLAYLIST_ID_ASC = "+playlistId";
KalturaGoogleVideoSyndicationFeedOrderBy.TYPE_ASC = "+type";
KalturaGoogleVideoSyndicationFeedOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaGoogleVideoSyndicationFeedOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaGoogleVideoSyndicationFeedOrderBy.NAME_DESC = "-name";
KalturaGoogleVideoSyndicationFeedOrderBy.PLAYLIST_ID_DESC = "-playlistId";
KalturaGoogleVideoSyndicationFeedOrderBy.TYPE_DESC = "-type";
KalturaGoogleVideoSyndicationFeedOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaHttpNotificationCertificateType(){
}
KalturaHttpNotificationCertificateType.DER = "DER";
KalturaHttpNotificationCertificateType.ENG = "ENG";
KalturaHttpNotificationCertificateType.PEM = "PEM";

function KalturaHttpNotificationSslKeyType(){
}
KalturaHttpNotificationSslKeyType.DER = "DER";
KalturaHttpNotificationSslKeyType.ENG = "ENG";
KalturaHttpNotificationSslKeyType.PEM = "PEM";

function KalturaHttpNotificationTemplateOrderBy(){
}
KalturaHttpNotificationTemplateOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaHttpNotificationTemplateOrderBy.ID_ASC = "+id";
KalturaHttpNotificationTemplateOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaHttpNotificationTemplateOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaHttpNotificationTemplateOrderBy.ID_DESC = "-id";
KalturaHttpNotificationTemplateOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaITunesSyndicationFeedAdultValues(){
}
KalturaITunesSyndicationFeedAdultValues.CLEAN = "clean";
KalturaITunesSyndicationFeedAdultValues.NO = "no";
KalturaITunesSyndicationFeedAdultValues.YES = "yes";

function KalturaITunesSyndicationFeedCategories(){
}
KalturaITunesSyndicationFeedCategories.ARTS = "Arts";
KalturaITunesSyndicationFeedCategories.ARTS_DESIGN = "Arts/Design";
KalturaITunesSyndicationFeedCategories.ARTS_FASHION_BEAUTY = "Arts/Fashion &amp; Beauty";
KalturaITunesSyndicationFeedCategories.ARTS_FOOD = "Arts/Food";
KalturaITunesSyndicationFeedCategories.ARTS_LITERATURE = "Arts/Literature";
KalturaITunesSyndicationFeedCategories.ARTS_PERFORMING_ARTS = "Arts/Performing Arts";
KalturaITunesSyndicationFeedCategories.ARTS_VISUAL_ARTS = "Arts/Visual Arts";
KalturaITunesSyndicationFeedCategories.BUSINESS = "Business";
KalturaITunesSyndicationFeedCategories.BUSINESS_BUSINESS_NEWS = "Business/Business News";
KalturaITunesSyndicationFeedCategories.BUSINESS_CAREERS = "Business/Careers";
KalturaITunesSyndicationFeedCategories.BUSINESS_INVESTING = "Business/Investing";
KalturaITunesSyndicationFeedCategories.BUSINESS_MANAGEMENT_MARKETING = "Business/Management &amp; Marketing";
KalturaITunesSyndicationFeedCategories.BUSINESS_SHOPPING = "Business/Shopping";
KalturaITunesSyndicationFeedCategories.COMEDY = "Comedy";
KalturaITunesSyndicationFeedCategories.EDUCATION = "Education";
KalturaITunesSyndicationFeedCategories.EDUCATION_TECHNOLOGY = "Education/Education Technology";
KalturaITunesSyndicationFeedCategories.EDUCATION_HIGHER_EDUCATION = "Education/Higher Education";
KalturaITunesSyndicationFeedCategories.EDUCATION_K_12 = "Education/K-12";
KalturaITunesSyndicationFeedCategories.EDUCATION_LANGUAGE_COURSES = "Education/Language Courses";
KalturaITunesSyndicationFeedCategories.EDUCATION_TRAINING = "Education/Training";
KalturaITunesSyndicationFeedCategories.GAMES_HOBBIES = "Games &amp; Hobbies";
KalturaITunesSyndicationFeedCategories.GAMES_HOBBIES_AUTOMOTIVE = "Games &amp; Hobbies/Automotive";
KalturaITunesSyndicationFeedCategories.GAMES_HOBBIES_AVIATION = "Games &amp; Hobbies/Aviation";
KalturaITunesSyndicationFeedCategories.GAMES_HOBBIES_HOBBIES = "Games &amp; Hobbies/Hobbies";
KalturaITunesSyndicationFeedCategories.GAMES_HOBBIES_OTHER_GAMES = "Games &amp; Hobbies/Other Games";
KalturaITunesSyndicationFeedCategories.GAMES_HOBBIES_VIDEO_GAMES = "Games &amp; Hobbies/Video Games";
KalturaITunesSyndicationFeedCategories.GOVERNMENT_ORGANIZATIONS = "Government &amp; Organizations";
KalturaITunesSyndicationFeedCategories.GOVERNMENT_ORGANIZATIONS_LOCAL = "Government &amp; Organizations/Local";
KalturaITunesSyndicationFeedCategories.GOVERNMENT_ORGANIZATIONS_NATIONAL = "Government &amp; Organizations/National";
KalturaITunesSyndicationFeedCategories.GOVERNMENT_ORGANIZATIONS_NON_PROFIT = "Government &amp; Organizations/Non-Profit";
KalturaITunesSyndicationFeedCategories.GOVERNMENT_ORGANIZATIONS_REGIONAL = "Government &amp; Organizations/Regional";
KalturaITunesSyndicationFeedCategories.HEALTH = "Health";
KalturaITunesSyndicationFeedCategories.HEALTH_ALTERNATIVE_HEALTH = "Health/Alternative Health";
KalturaITunesSyndicationFeedCategories.HEALTH_FITNESS_NUTRITION = "Health/Fitness &amp; Nutrition";
KalturaITunesSyndicationFeedCategories.HEALTH_SELF_HELP = "Health/Self-Help";
KalturaITunesSyndicationFeedCategories.HEALTH_SEXUALITY = "Health/Sexuality";
KalturaITunesSyndicationFeedCategories.KIDS_FAMILY = "Kids &amp; Family";
KalturaITunesSyndicationFeedCategories.MUSIC = "Music";
KalturaITunesSyndicationFeedCategories.NEWS_POLITICS = "News &amp; Politics";
KalturaITunesSyndicationFeedCategories.RELIGION_SPIRITUALITY = "Religion &amp; Spirituality";
KalturaITunesSyndicationFeedCategories.RELIGION_SPIRITUALITY_BUDDHISM = "Religion &amp; Spirituality/Buddhism";
KalturaITunesSyndicationFeedCategories.RELIGION_SPIRITUALITY_CHRISTIANITY = "Religion &amp; Spirituality/Christianity";
KalturaITunesSyndicationFeedCategories.RELIGION_SPIRITUALITY_HINDUISM = "Religion &amp; Spirituality/Hinduism";
KalturaITunesSyndicationFeedCategories.RELIGION_SPIRITUALITY_ISLAM = "Religion &amp; Spirituality/Islam";
KalturaITunesSyndicationFeedCategories.RELIGION_SPIRITUALITY_JUDAISM = "Religion &amp; Spirituality/Judaism";
KalturaITunesSyndicationFeedCategories.RELIGION_SPIRITUALITY_OTHER = "Religion &amp; Spirituality/Other";
KalturaITunesSyndicationFeedCategories.RELIGION_SPIRITUALITY_SPIRITUALITY = "Religion &amp; Spirituality/Spirituality";
KalturaITunesSyndicationFeedCategories.SCIENCE_MEDICINE = "Science &amp; Medicine";
KalturaITunesSyndicationFeedCategories.SCIENCE_MEDICINE_MEDICINE = "Science &amp; Medicine/Medicine";
KalturaITunesSyndicationFeedCategories.SCIENCE_MEDICINE_NATURAL_SCIENCES = "Science &amp; Medicine/Natural Sciences";
KalturaITunesSyndicationFeedCategories.SCIENCE_MEDICINE_SOCIAL_SCIENCES = "Science &amp; Medicine/Social Sciences";
KalturaITunesSyndicationFeedCategories.SOCIETY_CULTURE = "Society &amp; Culture";
KalturaITunesSyndicationFeedCategories.SOCIETY_CULTURE_HISTORY = "Society &amp; Culture/History";
KalturaITunesSyndicationFeedCategories.SOCIETY_CULTURE_PERSONAL_JOURNALS = "Society &amp; Culture/Personal Journals";
KalturaITunesSyndicationFeedCategories.SOCIETY_CULTURE_PHILOSOPHY = "Society &amp; Culture/Philosophy";
KalturaITunesSyndicationFeedCategories.SOCIETY_CULTURE_PLACES_TRAVEL = "Society &amp; Culture/Places &amp; Travel";
KalturaITunesSyndicationFeedCategories.SPORTS_RECREATION = "Sports &amp; Recreation";
KalturaITunesSyndicationFeedCategories.SPORTS_RECREATION_AMATEUR = "Sports &amp; Recreation/Amateur";
KalturaITunesSyndicationFeedCategories.SPORTS_RECREATION_COLLEGE_HIGH_SCHOOL = "Sports &amp; Recreation/College &amp; High School";
KalturaITunesSyndicationFeedCategories.SPORTS_RECREATION_OUTDOOR = "Sports &amp; Recreation/Outdoor";
KalturaITunesSyndicationFeedCategories.SPORTS_RECREATION_PROFESSIONAL = "Sports &amp; Recreation/Professional";
KalturaITunesSyndicationFeedCategories.TV_FILM = "TV &amp; Film";
KalturaITunesSyndicationFeedCategories.TECHNOLOGY = "Technology";
KalturaITunesSyndicationFeedCategories.TECHNOLOGY_GADGETS = "Technology/Gadgets";
KalturaITunesSyndicationFeedCategories.TECHNOLOGY_PODCASTING = "Technology/Podcasting";
KalturaITunesSyndicationFeedCategories.TECHNOLOGY_SOFTWARE_HOW_TO = "Technology/Software How-To";
KalturaITunesSyndicationFeedCategories.TECHNOLOGY_TECH_NEWS = "Technology/Tech News";

function KalturaITunesSyndicationFeedOrderBy(){
}
KalturaITunesSyndicationFeedOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaITunesSyndicationFeedOrderBy.NAME_ASC = "+name";
KalturaITunesSyndicationFeedOrderBy.PLAYLIST_ID_ASC = "+playlistId";
KalturaITunesSyndicationFeedOrderBy.TYPE_ASC = "+type";
KalturaITunesSyndicationFeedOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaITunesSyndicationFeedOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaITunesSyndicationFeedOrderBy.NAME_DESC = "-name";
KalturaITunesSyndicationFeedOrderBy.PLAYLIST_ID_DESC = "-playlistId";
KalturaITunesSyndicationFeedOrderBy.TYPE_DESC = "-type";
KalturaITunesSyndicationFeedOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaImageFlavorParamsOrderBy(){
}

function KalturaImageFlavorParamsOutputOrderBy(){
}

function KalturaKontikiStorageProfileOrderBy(){
}
KalturaKontikiStorageProfileOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaKontikiStorageProfileOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaKontikiStorageProfileOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaKontikiStorageProfileOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaLanguage(){
}
KalturaLanguage.AB = "Abkhazian";
KalturaLanguage.AA = "Afar";
KalturaLanguage.AF = "Afrikaans";
KalturaLanguage.SQ = "Albanian";
KalturaLanguage.AM = "Amharic";
KalturaLanguage.AR = "Arabic";
KalturaLanguage.HY = "Armenian";
KalturaLanguage.AS_ = "Assamese";
KalturaLanguage.AY = "Aymara";
KalturaLanguage.AZ = "Azerbaijani";
KalturaLanguage.BA = "Bashkir";
KalturaLanguage.EU = "Basque";
KalturaLanguage.BN = "Bengali (Bangla)";
KalturaLanguage.DZ = "Bhutani";
KalturaLanguage.BH = "Bihari";
KalturaLanguage.BI = "Bislama";
KalturaLanguage.BR = "Breton";
KalturaLanguage.BG = "Bulgarian";
KalturaLanguage.MY = "Burmese";
KalturaLanguage.BE = "Byelorussian (Belarusian)";
KalturaLanguage.KM = "Cambodian";
KalturaLanguage.CA = "Catalan";
KalturaLanguage.ZH = "Chinese";
KalturaLanguage.CO = "Corsican";
KalturaLanguage.HR = "Croatian";
KalturaLanguage.CS = "Czech";
KalturaLanguage.DA = "Danish";
KalturaLanguage.NL = "Dutch";
KalturaLanguage.EN = "English";
KalturaLanguage.EO = "Esperanto";
KalturaLanguage.ET = "Estonian";
KalturaLanguage.FO = "Faeroese";
KalturaLanguage.FA = "Farsi";
KalturaLanguage.FJ = "Fiji";
KalturaLanguage.FI = "Finnish";
KalturaLanguage.FR = "French";
KalturaLanguage.FY = "Frisian";
KalturaLanguage.GV = "Gaelic (Manx)";
KalturaLanguage.GD = "Gaelic (Scottish)";
KalturaLanguage.GL = "Galician";
KalturaLanguage.KA = "Georgian";
KalturaLanguage.DE = "German";
KalturaLanguage.EL = "Greek";
KalturaLanguage.KL = "Greenlandic";
KalturaLanguage.GN = "Guarani";
KalturaLanguage.GU = "Gujarati";
KalturaLanguage.HA = "Hausa";
KalturaLanguage.IW = "Hebrew";
KalturaLanguage.HE = "Hebrew";
KalturaLanguage.HI = "Hindi";
KalturaLanguage.HU = "Hungarian";
KalturaLanguage.IS = "Icelandic";
KalturaLanguage.IN = "Indonesian";
KalturaLanguage.ID = "Indonesian";
KalturaLanguage.IA = "Interlingua";
KalturaLanguage.IE = "Interlingue";
KalturaLanguage.IU = "Inuktitut";
KalturaLanguage.IK = "Inupiak";
KalturaLanguage.GA = "Irish";
KalturaLanguage.IT = "Italian";
KalturaLanguage.JA = "Japanese";
KalturaLanguage.JV = "Javanese";
KalturaLanguage.KN = "Kannada";
KalturaLanguage.KS = "Kashmiri";
KalturaLanguage.KK = "Kazakh";
KalturaLanguage.RW = "Kinyarwanda (Ruanda)";
KalturaLanguage.KY = "Kirghiz";
KalturaLanguage.RN = "Kirundi (Rundi)";
KalturaLanguage.KO = "Korean";
KalturaLanguage.KU = "Kurdish";
KalturaLanguage.LO = "Laothian";
KalturaLanguage.LA = "Latin";
KalturaLanguage.LV = "Latvian (Lettish)";
KalturaLanguage.LI = "Limburgish ( Limburger)";
KalturaLanguage.LN = "Lingala";
KalturaLanguage.LT = "Lithuanian";
KalturaLanguage.MK = "Macedonian";
KalturaLanguage.MG = "Malagasy";
KalturaLanguage.MS = "Malay";
KalturaLanguage.ML = "Malayalam";
KalturaLanguage.MT = "Maltese";
KalturaLanguage.MI = "Maori";
KalturaLanguage.MR = "Marathi";
KalturaLanguage.MO = "Moldavian";
KalturaLanguage.MN = "Mongolian";
KalturaLanguage.NA = "Nauru";
KalturaLanguage.NE = "Nepali";
KalturaLanguage.NO = "Norwegian";
KalturaLanguage.OC = "Occitan";
KalturaLanguage.OR_ = "Oriya";
KalturaLanguage.OM = "Oromo (Afan, Galla)";
KalturaLanguage.PS = "Pashto (Pushto)";
KalturaLanguage.PL = "Polish";
KalturaLanguage.PT = "Portuguese";
KalturaLanguage.PA = "Punjabi";
KalturaLanguage.QU = "Quechua";
KalturaLanguage.RM = "Rhaeto-Romance";
KalturaLanguage.RO = "Romanian";
KalturaLanguage.RU = "Russian";
KalturaLanguage.SM = "Samoan";
KalturaLanguage.SG = "Sangro";
KalturaLanguage.SA = "Sanskrit";
KalturaLanguage.SR = "Serbian";
KalturaLanguage.SH = "Serbo-Croatian";
KalturaLanguage.ST = "Sesotho";
KalturaLanguage.TN = "Setswana";
KalturaLanguage.SN = "Shona";
KalturaLanguage.SD = "Sindhi";
KalturaLanguage.SI = "Sinhalese";
KalturaLanguage.SS = "Siswati";
KalturaLanguage.SK = "Slovak";
KalturaLanguage.SL = "Slovenian";
KalturaLanguage.SO = "Somali";
KalturaLanguage.ES = "Spanish";
KalturaLanguage.SU = "Sundanese";
KalturaLanguage.SW = "Swahili (Kiswahili)";
KalturaLanguage.SV = "Swedish";
KalturaLanguage.TL = "Tagalog";
KalturaLanguage.TG = "Tajik";
KalturaLanguage.TA = "Tamil";
KalturaLanguage.TT = "Tatar";
KalturaLanguage.TE = "Telugu";
KalturaLanguage.TH = "Thai";
KalturaLanguage.BO = "Tibetan";
KalturaLanguage.TI = "Tigrinya";
KalturaLanguage.TO = "Tonga";
KalturaLanguage.TS = "Tsonga";
KalturaLanguage.TR = "Turkish";
KalturaLanguage.TK = "Turkmen";
KalturaLanguage.TW = "Twi";
KalturaLanguage.UG = "Uighur";
KalturaLanguage.UK = "Ukrainian";
KalturaLanguage.UR = "Urdu";
KalturaLanguage.UZ = "Uzbek";
KalturaLanguage.VI = "Vietnamese";
KalturaLanguage.VO = "Volapuk";
KalturaLanguage.CY = "Welsh";
KalturaLanguage.WO = "Wolof";
KalturaLanguage.XH = "Xhosa";
KalturaLanguage.YI = "Yiddish";
KalturaLanguage.JI = "Yiddish";
KalturaLanguage.YO = "Yoruba";
KalturaLanguage.ZU = "Zulu";

function KalturaLanguageCode(){
}
KalturaLanguageCode.AA = "aa";
KalturaLanguageCode.AB = "ab";
KalturaLanguageCode.AF = "af";
KalturaLanguageCode.AM = "am";
KalturaLanguageCode.AR = "ar";
KalturaLanguageCode.AS_ = "as";
KalturaLanguageCode.AY = "ay";
KalturaLanguageCode.AZ = "az";
KalturaLanguageCode.BA = "ba";
KalturaLanguageCode.BE = "be";
KalturaLanguageCode.BG = "bg";
KalturaLanguageCode.BH = "bh";
KalturaLanguageCode.BI = "bi";
KalturaLanguageCode.BN = "bn";
KalturaLanguageCode.BO = "bo";
KalturaLanguageCode.BR = "br";
KalturaLanguageCode.CA = "ca";
KalturaLanguageCode.CO = "co";
KalturaLanguageCode.CS = "cs";
KalturaLanguageCode.CY = "cy";
KalturaLanguageCode.DA = "da";
KalturaLanguageCode.DE = "de";
KalturaLanguageCode.DZ = "dz";
KalturaLanguageCode.EL = "el";
KalturaLanguageCode.EN = "en";
KalturaLanguageCode.EO = "eo";
KalturaLanguageCode.ES = "es";
KalturaLanguageCode.ET = "et";
KalturaLanguageCode.EU = "eu";
KalturaLanguageCode.FA = "fa";
KalturaLanguageCode.FI = "fi";
KalturaLanguageCode.FJ = "fj";
KalturaLanguageCode.FO = "fo";
KalturaLanguageCode.FR = "fr";
KalturaLanguageCode.FY = "fy";
KalturaLanguageCode.GA = "ga";
KalturaLanguageCode.GD = "gd";
KalturaLanguageCode.GL = "gl";
KalturaLanguageCode.GN = "gn";
KalturaLanguageCode.GU = "gu";
KalturaLanguageCode.GV = "gv";
KalturaLanguageCode.HA = "ha";
KalturaLanguageCode.HE = "he";
KalturaLanguageCode.HI = "hi";
KalturaLanguageCode.HR = "hr";
KalturaLanguageCode.HU = "hu";
KalturaLanguageCode.HY = "hy";
KalturaLanguageCode.IA = "ia";
KalturaLanguageCode.ID = "id";
KalturaLanguageCode.IE = "ie";
KalturaLanguageCode.IK = "ik";
KalturaLanguageCode.IN = "in";
KalturaLanguageCode.IS = "is";
KalturaLanguageCode.IT = "it";
KalturaLanguageCode.IU = "iu";
KalturaLanguageCode.IW = "iw";
KalturaLanguageCode.JA = "ja";
KalturaLanguageCode.JI = "ji";
KalturaLanguageCode.JV = "jv";
KalturaLanguageCode.KA = "ka";
KalturaLanguageCode.KK = "kk";
KalturaLanguageCode.KL = "kl";
KalturaLanguageCode.KM = "km";
KalturaLanguageCode.KN = "kn";
KalturaLanguageCode.KO = "ko";
KalturaLanguageCode.KS = "ks";
KalturaLanguageCode.KU = "ku";
KalturaLanguageCode.KY = "ky";
KalturaLanguageCode.LA = "la";
KalturaLanguageCode.LI = "li";
KalturaLanguageCode.LN = "ln";
KalturaLanguageCode.LO = "lo";
KalturaLanguageCode.LT = "lt";
KalturaLanguageCode.LV = "lv";
KalturaLanguageCode.MG = "mg";
KalturaLanguageCode.MI = "mi";
KalturaLanguageCode.MK = "mk";
KalturaLanguageCode.ML = "ml";
KalturaLanguageCode.MN = "mn";
KalturaLanguageCode.MO = "mo";
KalturaLanguageCode.MR = "mr";
KalturaLanguageCode.MS = "ms";
KalturaLanguageCode.MT = "mt";
KalturaLanguageCode.MY = "my";
KalturaLanguageCode.NA = "na";
KalturaLanguageCode.NE = "ne";
KalturaLanguageCode.NL = "nl";
KalturaLanguageCode.NO = "no";
KalturaLanguageCode.OC = "oc";
KalturaLanguageCode.OM = "om";
KalturaLanguageCode.OR_ = "or";
KalturaLanguageCode.PA = "pa";
KalturaLanguageCode.PL = "pl";
KalturaLanguageCode.PS = "ps";
KalturaLanguageCode.PT = "pt";
KalturaLanguageCode.QU = "qu";
KalturaLanguageCode.RM = "rm";
KalturaLanguageCode.RN = "rn";
KalturaLanguageCode.RO = "ro";
KalturaLanguageCode.RU = "ru";
KalturaLanguageCode.RW = "rw";
KalturaLanguageCode.SA = "sa";
KalturaLanguageCode.SD = "sd";
KalturaLanguageCode.SG = "sg";
KalturaLanguageCode.SH = "sh";
KalturaLanguageCode.SI = "si";
KalturaLanguageCode.SK = "sk";
KalturaLanguageCode.SL = "sl";
KalturaLanguageCode.SM = "sm";
KalturaLanguageCode.SN = "sn";
KalturaLanguageCode.SO = "so";
KalturaLanguageCode.SQ = "sq";
KalturaLanguageCode.SR = "sr";
KalturaLanguageCode.SS = "ss";
KalturaLanguageCode.ST = "st";
KalturaLanguageCode.SU = "su";
KalturaLanguageCode.SV = "sv";
KalturaLanguageCode.SW = "sw";
KalturaLanguageCode.TA = "ta";
KalturaLanguageCode.TE = "te";
KalturaLanguageCode.TG = "tg";
KalturaLanguageCode.TH = "th";
KalturaLanguageCode.TI = "ti";
KalturaLanguageCode.TK = "tk";
KalturaLanguageCode.TL = "tl";
KalturaLanguageCode.TN = "tn";
KalturaLanguageCode.TO = "to";
KalturaLanguageCode.TR = "tr";
KalturaLanguageCode.TS = "ts";
KalturaLanguageCode.TT = "tt";
KalturaLanguageCode.TW = "tw";
KalturaLanguageCode.UG = "ug";
KalturaLanguageCode.UK = "uk";
KalturaLanguageCode.UR = "ur";
KalturaLanguageCode.UZ = "uz";
KalturaLanguageCode.VI = "vi";
KalturaLanguageCode.VO = "vo";
KalturaLanguageCode.WO = "wo";
KalturaLanguageCode.XH = "xh";
KalturaLanguageCode.YI = "yi";
KalturaLanguageCode.YO = "yo";
KalturaLanguageCode.ZH = "zh";
KalturaLanguageCode.ZU = "zu";

function KalturaLiveAssetOrderBy(){
}
KalturaLiveAssetOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaLiveAssetOrderBy.DELETED_AT_ASC = "+deletedAt";
KalturaLiveAssetOrderBy.SIZE_ASC = "+size";
KalturaLiveAssetOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaLiveAssetOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaLiveAssetOrderBy.DELETED_AT_DESC = "-deletedAt";
KalturaLiveAssetOrderBy.SIZE_DESC = "-size";
KalturaLiveAssetOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaLiveChannelOrderBy(){
}
KalturaLiveChannelOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaLiveChannelOrderBy.DURATION_ASC = "+duration";
KalturaLiveChannelOrderBy.END_DATE_ASC = "+endDate";
KalturaLiveChannelOrderBy.LAST_PLAYED_AT_ASC = "+lastPlayedAt";
KalturaLiveChannelOrderBy.MEDIA_TYPE_ASC = "+mediaType";
KalturaLiveChannelOrderBy.MODERATION_COUNT_ASC = "+moderationCount";
KalturaLiveChannelOrderBy.NAME_ASC = "+name";
KalturaLiveChannelOrderBy.PARTNER_SORT_VALUE_ASC = "+partnerSortValue";
KalturaLiveChannelOrderBy.PLAYS_ASC = "+plays";
KalturaLiveChannelOrderBy.RANK_ASC = "+rank";
KalturaLiveChannelOrderBy.RECENT_ASC = "+recent";
KalturaLiveChannelOrderBy.START_DATE_ASC = "+startDate";
KalturaLiveChannelOrderBy.TOTAL_RANK_ASC = "+totalRank";
KalturaLiveChannelOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaLiveChannelOrderBy.VIEWS_ASC = "+views";
KalturaLiveChannelOrderBy.WEIGHT_ASC = "+weight";
KalturaLiveChannelOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaLiveChannelOrderBy.DURATION_DESC = "-duration";
KalturaLiveChannelOrderBy.END_DATE_DESC = "-endDate";
KalturaLiveChannelOrderBy.LAST_PLAYED_AT_DESC = "-lastPlayedAt";
KalturaLiveChannelOrderBy.MEDIA_TYPE_DESC = "-mediaType";
KalturaLiveChannelOrderBy.MODERATION_COUNT_DESC = "-moderationCount";
KalturaLiveChannelOrderBy.NAME_DESC = "-name";
KalturaLiveChannelOrderBy.PARTNER_SORT_VALUE_DESC = "-partnerSortValue";
KalturaLiveChannelOrderBy.PLAYS_DESC = "-plays";
KalturaLiveChannelOrderBy.RANK_DESC = "-rank";
KalturaLiveChannelOrderBy.RECENT_DESC = "-recent";
KalturaLiveChannelOrderBy.START_DATE_DESC = "-startDate";
KalturaLiveChannelOrderBy.TOTAL_RANK_DESC = "-totalRank";
KalturaLiveChannelOrderBy.UPDATED_AT_DESC = "-updatedAt";
KalturaLiveChannelOrderBy.VIEWS_DESC = "-views";
KalturaLiveChannelOrderBy.WEIGHT_DESC = "-weight";

function KalturaLiveChannelSegmentOrderBy(){
}
KalturaLiveChannelSegmentOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaLiveChannelSegmentOrderBy.START_TIME_ASC = "+startTime";
KalturaLiveChannelSegmentOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaLiveChannelSegmentOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaLiveChannelSegmentOrderBy.START_TIME_DESC = "-startTime";
KalturaLiveChannelSegmentOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaLiveChannelSegmentStatus(){
}
KalturaLiveChannelSegmentStatus.ACTIVE = "2";
KalturaLiveChannelSegmentStatus.DELETED = "3";

function KalturaLiveChannelSegmentTriggerType(){
}
KalturaLiveChannelSegmentTriggerType.CHANNEL_RELATIVE = "1";
KalturaLiveChannelSegmentTriggerType.ABSOLUTE_TIME = "2";
KalturaLiveChannelSegmentTriggerType.SEGMENT_START_RELATIVE = "3";
KalturaLiveChannelSegmentTriggerType.SEGMENT_END_RELATIVE = "4";

function KalturaLiveChannelSegmentType(){
}
KalturaLiveChannelSegmentType.VIDEO_AND_AUDIO = "1";

function KalturaLiveEntryOrderBy(){
}
KalturaLiveEntryOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaLiveEntryOrderBy.DURATION_ASC = "+duration";
KalturaLiveEntryOrderBy.END_DATE_ASC = "+endDate";
KalturaLiveEntryOrderBy.LAST_PLAYED_AT_ASC = "+lastPlayedAt";
KalturaLiveEntryOrderBy.MEDIA_TYPE_ASC = "+mediaType";
KalturaLiveEntryOrderBy.MODERATION_COUNT_ASC = "+moderationCount";
KalturaLiveEntryOrderBy.NAME_ASC = "+name";
KalturaLiveEntryOrderBy.PARTNER_SORT_VALUE_ASC = "+partnerSortValue";
KalturaLiveEntryOrderBy.PLAYS_ASC = "+plays";
KalturaLiveEntryOrderBy.RANK_ASC = "+rank";
KalturaLiveEntryOrderBy.RECENT_ASC = "+recent";
KalturaLiveEntryOrderBy.START_DATE_ASC = "+startDate";
KalturaLiveEntryOrderBy.TOTAL_RANK_ASC = "+totalRank";
KalturaLiveEntryOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaLiveEntryOrderBy.VIEWS_ASC = "+views";
KalturaLiveEntryOrderBy.WEIGHT_ASC = "+weight";
KalturaLiveEntryOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaLiveEntryOrderBy.DURATION_DESC = "-duration";
KalturaLiveEntryOrderBy.END_DATE_DESC = "-endDate";
KalturaLiveEntryOrderBy.LAST_PLAYED_AT_DESC = "-lastPlayedAt";
KalturaLiveEntryOrderBy.MEDIA_TYPE_DESC = "-mediaType";
KalturaLiveEntryOrderBy.MODERATION_COUNT_DESC = "-moderationCount";
KalturaLiveEntryOrderBy.NAME_DESC = "-name";
KalturaLiveEntryOrderBy.PARTNER_SORT_VALUE_DESC = "-partnerSortValue";
KalturaLiveEntryOrderBy.PLAYS_DESC = "-plays";
KalturaLiveEntryOrderBy.RANK_DESC = "-rank";
KalturaLiveEntryOrderBy.RECENT_DESC = "-recent";
KalturaLiveEntryOrderBy.START_DATE_DESC = "-startDate";
KalturaLiveEntryOrderBy.TOTAL_RANK_DESC = "-totalRank";
KalturaLiveEntryOrderBy.UPDATED_AT_DESC = "-updatedAt";
KalturaLiveEntryOrderBy.VIEWS_DESC = "-views";
KalturaLiveEntryOrderBy.WEIGHT_DESC = "-weight";

function KalturaLiveParamsOrderBy(){
}

function KalturaLiveStreamAdminEntryOrderBy(){
}
KalturaLiveStreamAdminEntryOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaLiveStreamAdminEntryOrderBy.DURATION_ASC = "+duration";
KalturaLiveStreamAdminEntryOrderBy.END_DATE_ASC = "+endDate";
KalturaLiveStreamAdminEntryOrderBy.LAST_PLAYED_AT_ASC = "+lastPlayedAt";
KalturaLiveStreamAdminEntryOrderBy.MEDIA_TYPE_ASC = "+mediaType";
KalturaLiveStreamAdminEntryOrderBy.MODERATION_COUNT_ASC = "+moderationCount";
KalturaLiveStreamAdminEntryOrderBy.NAME_ASC = "+name";
KalturaLiveStreamAdminEntryOrderBy.PARTNER_SORT_VALUE_ASC = "+partnerSortValue";
KalturaLiveStreamAdminEntryOrderBy.PLAYS_ASC = "+plays";
KalturaLiveStreamAdminEntryOrderBy.RANK_ASC = "+rank";
KalturaLiveStreamAdminEntryOrderBy.RECENT_ASC = "+recent";
KalturaLiveStreamAdminEntryOrderBy.START_DATE_ASC = "+startDate";
KalturaLiveStreamAdminEntryOrderBy.TOTAL_RANK_ASC = "+totalRank";
KalturaLiveStreamAdminEntryOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaLiveStreamAdminEntryOrderBy.VIEWS_ASC = "+views";
KalturaLiveStreamAdminEntryOrderBy.WEIGHT_ASC = "+weight";
KalturaLiveStreamAdminEntryOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaLiveStreamAdminEntryOrderBy.DURATION_DESC = "-duration";
KalturaLiveStreamAdminEntryOrderBy.END_DATE_DESC = "-endDate";
KalturaLiveStreamAdminEntryOrderBy.LAST_PLAYED_AT_DESC = "-lastPlayedAt";
KalturaLiveStreamAdminEntryOrderBy.MEDIA_TYPE_DESC = "-mediaType";
KalturaLiveStreamAdminEntryOrderBy.MODERATION_COUNT_DESC = "-moderationCount";
KalturaLiveStreamAdminEntryOrderBy.NAME_DESC = "-name";
KalturaLiveStreamAdminEntryOrderBy.PARTNER_SORT_VALUE_DESC = "-partnerSortValue";
KalturaLiveStreamAdminEntryOrderBy.PLAYS_DESC = "-plays";
KalturaLiveStreamAdminEntryOrderBy.RANK_DESC = "-rank";
KalturaLiveStreamAdminEntryOrderBy.RECENT_DESC = "-recent";
KalturaLiveStreamAdminEntryOrderBy.START_DATE_DESC = "-startDate";
KalturaLiveStreamAdminEntryOrderBy.TOTAL_RANK_DESC = "-totalRank";
KalturaLiveStreamAdminEntryOrderBy.UPDATED_AT_DESC = "-updatedAt";
KalturaLiveStreamAdminEntryOrderBy.VIEWS_DESC = "-views";
KalturaLiveStreamAdminEntryOrderBy.WEIGHT_DESC = "-weight";

function KalturaLiveStreamEntryOrderBy(){
}
KalturaLiveStreamEntryOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaLiveStreamEntryOrderBy.DURATION_ASC = "+duration";
KalturaLiveStreamEntryOrderBy.END_DATE_ASC = "+endDate";
KalturaLiveStreamEntryOrderBy.LAST_PLAYED_AT_ASC = "+lastPlayedAt";
KalturaLiveStreamEntryOrderBy.MEDIA_TYPE_ASC = "+mediaType";
KalturaLiveStreamEntryOrderBy.MODERATION_COUNT_ASC = "+moderationCount";
KalturaLiveStreamEntryOrderBy.NAME_ASC = "+name";
KalturaLiveStreamEntryOrderBy.PARTNER_SORT_VALUE_ASC = "+partnerSortValue";
KalturaLiveStreamEntryOrderBy.PLAYS_ASC = "+plays";
KalturaLiveStreamEntryOrderBy.RANK_ASC = "+rank";
KalturaLiveStreamEntryOrderBy.RECENT_ASC = "+recent";
KalturaLiveStreamEntryOrderBy.START_DATE_ASC = "+startDate";
KalturaLiveStreamEntryOrderBy.TOTAL_RANK_ASC = "+totalRank";
KalturaLiveStreamEntryOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaLiveStreamEntryOrderBy.VIEWS_ASC = "+views";
KalturaLiveStreamEntryOrderBy.WEIGHT_ASC = "+weight";
KalturaLiveStreamEntryOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaLiveStreamEntryOrderBy.DURATION_DESC = "-duration";
KalturaLiveStreamEntryOrderBy.END_DATE_DESC = "-endDate";
KalturaLiveStreamEntryOrderBy.LAST_PLAYED_AT_DESC = "-lastPlayedAt";
KalturaLiveStreamEntryOrderBy.MEDIA_TYPE_DESC = "-mediaType";
KalturaLiveStreamEntryOrderBy.MODERATION_COUNT_DESC = "-moderationCount";
KalturaLiveStreamEntryOrderBy.NAME_DESC = "-name";
KalturaLiveStreamEntryOrderBy.PARTNER_SORT_VALUE_DESC = "-partnerSortValue";
KalturaLiveStreamEntryOrderBy.PLAYS_DESC = "-plays";
KalturaLiveStreamEntryOrderBy.RANK_DESC = "-rank";
KalturaLiveStreamEntryOrderBy.RECENT_DESC = "-recent";
KalturaLiveStreamEntryOrderBy.START_DATE_DESC = "-startDate";
KalturaLiveStreamEntryOrderBy.TOTAL_RANK_DESC = "-totalRank";
KalturaLiveStreamEntryOrderBy.UPDATED_AT_DESC = "-updatedAt";
KalturaLiveStreamEntryOrderBy.VIEWS_DESC = "-views";
KalturaLiveStreamEntryOrderBy.WEIGHT_DESC = "-weight";

function KalturaMailType(){
}
KalturaMailType.MAIL_TYPE_KALTURA_NEWSLETTER = "10";
KalturaMailType.MAIL_TYPE_ADDED_TO_FAVORITES = "11";
KalturaMailType.MAIL_TYPE_ADDED_TO_CLIP_FAVORITES = "12";
KalturaMailType.MAIL_TYPE_NEW_COMMENT_IN_PROFILE = "13";
KalturaMailType.MAIL_TYPE_CLIP_ADDED_YOUR_KALTURA = "20";
KalturaMailType.MAIL_TYPE_VIDEO_ADDED = "21";
KalturaMailType.MAIL_TYPE_ROUGHCUT_CREATED = "22";
KalturaMailType.MAIL_TYPE_ADDED_KALTURA_TO_YOUR_FAVORITES = "23";
KalturaMailType.MAIL_TYPE_NEW_COMMENT_IN_KALTURA = "24";
KalturaMailType.MAIL_TYPE_CLIP_ADDED = "30";
KalturaMailType.MAIL_TYPE_VIDEO_CREATED = "31";
KalturaMailType.MAIL_TYPE_ADDED_KALTURA_TO_HIS_FAVORITES = "32";
KalturaMailType.MAIL_TYPE_NEW_COMMENT_IN_KALTURA_YOU_CONTRIBUTED = "33";
KalturaMailType.MAIL_TYPE_CLIP_CONTRIBUTED = "40";
KalturaMailType.MAIL_TYPE_ROUGHCUT_CREATED_SUBSCRIBED = "41";
KalturaMailType.MAIL_TYPE_ADDED_KALTURA_TO_HIS_FAVORITES_SUBSCRIBED = "42";
KalturaMailType.MAIL_TYPE_NEW_COMMENT_IN_KALTURA_YOU_SUBSCRIBED = "43";
KalturaMailType.MAIL_TYPE_REGISTER_CONFIRM = "50";
KalturaMailType.MAIL_TYPE_PASSWORD_RESET = "51";
KalturaMailType.MAIL_TYPE_LOGIN_MAIL_RESET = "52";
KalturaMailType.MAIL_TYPE_REGISTER_CONFIRM_VIDEO_SERVICE = "54";
KalturaMailType.MAIL_TYPE_VIDEO_READY = "60";
KalturaMailType.MAIL_TYPE_VIDEO_IS_READY = "62";
KalturaMailType.MAIL_TYPE_BULK_DOWNLOAD_READY = "63";
KalturaMailType.MAIL_TYPE_BULKUPLOAD_FINISHED = "64";
KalturaMailType.MAIL_TYPE_BULKUPLOAD_FAILED = "65";
KalturaMailType.MAIL_TYPE_BULKUPLOAD_ABORTED = "66";
KalturaMailType.MAIL_TYPE_NOTIFY_ERR = "70";
KalturaMailType.MAIL_TYPE_ACCOUNT_UPGRADE_CONFIRM = "80";
KalturaMailType.MAIL_TYPE_VIDEO_SERVICE_NOTICE = "81";
KalturaMailType.MAIL_TYPE_VIDEO_SERVICE_NOTICE_LIMIT_REACHED = "82";
KalturaMailType.MAIL_TYPE_VIDEO_SERVICE_NOTICE_ACCOUNT_LOCKED = "83";
KalturaMailType.MAIL_TYPE_VIDEO_SERVICE_NOTICE_ACCOUNT_DELETED = "84";
KalturaMailType.MAIL_TYPE_VIDEO_SERVICE_NOTICE_UPGRADE_OFFER = "85";
KalturaMailType.MAIL_TYPE_ACCOUNT_REACTIVE_CONFIRM = "86";
KalturaMailType.MAIL_TYPE_SYSTEM_USER_RESET_PASSWORD = "110";
KalturaMailType.MAIL_TYPE_SYSTEM_USER_RESET_PASSWORD_SUCCESS = "111";
KalturaMailType.MAIL_TYPE_SYSTEM_USER_NEW_PASSWORD = "112";
KalturaMailType.MAIL_TYPE_SYSTEM_USER_CREDENTIALS_SAVED = "113";

function KalturaMediaEntryOrderBy(){
}
KalturaMediaEntryOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaMediaEntryOrderBy.DURATION_ASC = "+duration";
KalturaMediaEntryOrderBy.END_DATE_ASC = "+endDate";
KalturaMediaEntryOrderBy.LAST_PLAYED_AT_ASC = "+lastPlayedAt";
KalturaMediaEntryOrderBy.MEDIA_TYPE_ASC = "+mediaType";
KalturaMediaEntryOrderBy.MODERATION_COUNT_ASC = "+moderationCount";
KalturaMediaEntryOrderBy.NAME_ASC = "+name";
KalturaMediaEntryOrderBy.PARTNER_SORT_VALUE_ASC = "+partnerSortValue";
KalturaMediaEntryOrderBy.PLAYS_ASC = "+plays";
KalturaMediaEntryOrderBy.RANK_ASC = "+rank";
KalturaMediaEntryOrderBy.RECENT_ASC = "+recent";
KalturaMediaEntryOrderBy.START_DATE_ASC = "+startDate";
KalturaMediaEntryOrderBy.TOTAL_RANK_ASC = "+totalRank";
KalturaMediaEntryOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaMediaEntryOrderBy.VIEWS_ASC = "+views";
KalturaMediaEntryOrderBy.WEIGHT_ASC = "+weight";
KalturaMediaEntryOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaMediaEntryOrderBy.DURATION_DESC = "-duration";
KalturaMediaEntryOrderBy.END_DATE_DESC = "-endDate";
KalturaMediaEntryOrderBy.LAST_PLAYED_AT_DESC = "-lastPlayedAt";
KalturaMediaEntryOrderBy.MEDIA_TYPE_DESC = "-mediaType";
KalturaMediaEntryOrderBy.MODERATION_COUNT_DESC = "-moderationCount";
KalturaMediaEntryOrderBy.NAME_DESC = "-name";
KalturaMediaEntryOrderBy.PARTNER_SORT_VALUE_DESC = "-partnerSortValue";
KalturaMediaEntryOrderBy.PLAYS_DESC = "-plays";
KalturaMediaEntryOrderBy.RANK_DESC = "-rank";
KalturaMediaEntryOrderBy.RECENT_DESC = "-recent";
KalturaMediaEntryOrderBy.START_DATE_DESC = "-startDate";
KalturaMediaEntryOrderBy.TOTAL_RANK_DESC = "-totalRank";
KalturaMediaEntryOrderBy.UPDATED_AT_DESC = "-updatedAt";
KalturaMediaEntryOrderBy.VIEWS_DESC = "-views";
KalturaMediaEntryOrderBy.WEIGHT_DESC = "-weight";

function KalturaMediaFlavorParamsOrderBy(){
}

function KalturaMediaFlavorParamsOutputOrderBy(){
}

function KalturaMediaInfoOrderBy(){
}

function KalturaMediaParserType(){
}
KalturaMediaParserType.MEDIAINFO = "0";
KalturaMediaParserType.REMOTE_MEDIAINFO = "remoteMediaInfo.RemoteMediaInfo";
KalturaMediaParserType.FFMPEG = "1";

function KalturaMediaServerOrderBy(){
}
KalturaMediaServerOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaMediaServerOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaMediaServerOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaMediaServerOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaMetadataObjectType(){
}
KalturaMetadataObjectType.AD_CUE_POINT = "adCuePointMetadata.AdCuePoint";
KalturaMetadataObjectType.ANNOTATION = "annotationMetadata.Annotation";
KalturaMetadataObjectType.CODE_CUE_POINT = "codeCuePointMetadata.CodeCuePoint";
KalturaMetadataObjectType.ENTRY = "1";
KalturaMetadataObjectType.CATEGORY = "2";
KalturaMetadataObjectType.USER = "3";
KalturaMetadataObjectType.PARTNER = "4";

function KalturaMetadataOrderBy(){
}
KalturaMetadataOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaMetadataOrderBy.METADATA_PROFILE_VERSION_ASC = "+metadataProfileVersion";
KalturaMetadataOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaMetadataOrderBy.VERSION_ASC = "+version";
KalturaMetadataOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaMetadataOrderBy.METADATA_PROFILE_VERSION_DESC = "-metadataProfileVersion";
KalturaMetadataOrderBy.UPDATED_AT_DESC = "-updatedAt";
KalturaMetadataOrderBy.VERSION_DESC = "-version";

function KalturaMetadataProfileOrderBy(){
}
KalturaMetadataProfileOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaMetadataProfileOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaMetadataProfileOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaMetadataProfileOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaMixEntryOrderBy(){
}
KalturaMixEntryOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaMixEntryOrderBy.DURATION_ASC = "+duration";
KalturaMixEntryOrderBy.END_DATE_ASC = "+endDate";
KalturaMixEntryOrderBy.LAST_PLAYED_AT_ASC = "+lastPlayedAt";
KalturaMixEntryOrderBy.MODERATION_COUNT_ASC = "+moderationCount";
KalturaMixEntryOrderBy.NAME_ASC = "+name";
KalturaMixEntryOrderBy.PARTNER_SORT_VALUE_ASC = "+partnerSortValue";
KalturaMixEntryOrderBy.PLAYS_ASC = "+plays";
KalturaMixEntryOrderBy.RANK_ASC = "+rank";
KalturaMixEntryOrderBy.RECENT_ASC = "+recent";
KalturaMixEntryOrderBy.START_DATE_ASC = "+startDate";
KalturaMixEntryOrderBy.TOTAL_RANK_ASC = "+totalRank";
KalturaMixEntryOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaMixEntryOrderBy.VIEWS_ASC = "+views";
KalturaMixEntryOrderBy.WEIGHT_ASC = "+weight";
KalturaMixEntryOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaMixEntryOrderBy.DURATION_DESC = "-duration";
KalturaMixEntryOrderBy.END_DATE_DESC = "-endDate";
KalturaMixEntryOrderBy.LAST_PLAYED_AT_DESC = "-lastPlayedAt";
KalturaMixEntryOrderBy.MODERATION_COUNT_DESC = "-moderationCount";
KalturaMixEntryOrderBy.NAME_DESC = "-name";
KalturaMixEntryOrderBy.PARTNER_SORT_VALUE_DESC = "-partnerSortValue";
KalturaMixEntryOrderBy.PLAYS_DESC = "-plays";
KalturaMixEntryOrderBy.RANK_DESC = "-rank";
KalturaMixEntryOrderBy.RECENT_DESC = "-recent";
KalturaMixEntryOrderBy.START_DATE_DESC = "-startDate";
KalturaMixEntryOrderBy.TOTAL_RANK_DESC = "-totalRank";
KalturaMixEntryOrderBy.UPDATED_AT_DESC = "-updatedAt";
KalturaMixEntryOrderBy.VIEWS_DESC = "-views";
KalturaMixEntryOrderBy.WEIGHT_DESC = "-weight";

function KalturaModerationFlagStatus(){
}
KalturaModerationFlagStatus.PENDING = "1";
KalturaModerationFlagStatus.MODERATED = "2";

function KalturaModerationObjectType(){
}
KalturaModerationObjectType.ENTRY = "2";
KalturaModerationObjectType.USER = "3";

function KalturaPartnerOrderBy(){
}
KalturaPartnerOrderBy.ADMIN_EMAIL_ASC = "+adminEmail";
KalturaPartnerOrderBy.ADMIN_NAME_ASC = "+adminName";
KalturaPartnerOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaPartnerOrderBy.ID_ASC = "+id";
KalturaPartnerOrderBy.NAME_ASC = "+name";
KalturaPartnerOrderBy.STATUS_ASC = "+status";
KalturaPartnerOrderBy.WEBSITE_ASC = "+website";
KalturaPartnerOrderBy.ADMIN_EMAIL_DESC = "-adminEmail";
KalturaPartnerOrderBy.ADMIN_NAME_DESC = "-adminName";
KalturaPartnerOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaPartnerOrderBy.ID_DESC = "-id";
KalturaPartnerOrderBy.NAME_DESC = "-name";
KalturaPartnerOrderBy.STATUS_DESC = "-status";
KalturaPartnerOrderBy.WEBSITE_DESC = "-website";

function KalturaPdfFlavorParamsOrderBy(){
}

function KalturaPdfFlavorParamsOutputOrderBy(){
}

function KalturaPermissionItemOrderBy(){
}
KalturaPermissionItemOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaPermissionItemOrderBy.ID_ASC = "+id";
KalturaPermissionItemOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaPermissionItemOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaPermissionItemOrderBy.ID_DESC = "-id";
KalturaPermissionItemOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaPermissionItemType(){
}
KalturaPermissionItemType.API_ACTION_ITEM = "kApiActionPermissionItem";
KalturaPermissionItemType.API_PARAMETER_ITEM = "kApiParameterPermissionItem";

function KalturaPermissionOrderBy(){
}
KalturaPermissionOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaPermissionOrderBy.ID_ASC = "+id";
KalturaPermissionOrderBy.NAME_ASC = "+name";
KalturaPermissionOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaPermissionOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaPermissionOrderBy.ID_DESC = "-id";
KalturaPermissionOrderBy.NAME_DESC = "-name";
KalturaPermissionOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaPlayableEntryOrderBy(){
}
KalturaPlayableEntryOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaPlayableEntryOrderBy.DURATION_ASC = "+duration";
KalturaPlayableEntryOrderBy.END_DATE_ASC = "+endDate";
KalturaPlayableEntryOrderBy.LAST_PLAYED_AT_ASC = "+lastPlayedAt";
KalturaPlayableEntryOrderBy.MODERATION_COUNT_ASC = "+moderationCount";
KalturaPlayableEntryOrderBy.NAME_ASC = "+name";
KalturaPlayableEntryOrderBy.PARTNER_SORT_VALUE_ASC = "+partnerSortValue";
KalturaPlayableEntryOrderBy.PLAYS_ASC = "+plays";
KalturaPlayableEntryOrderBy.RANK_ASC = "+rank";
KalturaPlayableEntryOrderBy.RECENT_ASC = "+recent";
KalturaPlayableEntryOrderBy.START_DATE_ASC = "+startDate";
KalturaPlayableEntryOrderBy.TOTAL_RANK_ASC = "+totalRank";
KalturaPlayableEntryOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaPlayableEntryOrderBy.VIEWS_ASC = "+views";
KalturaPlayableEntryOrderBy.WEIGHT_ASC = "+weight";
KalturaPlayableEntryOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaPlayableEntryOrderBy.DURATION_DESC = "-duration";
KalturaPlayableEntryOrderBy.END_DATE_DESC = "-endDate";
KalturaPlayableEntryOrderBy.LAST_PLAYED_AT_DESC = "-lastPlayedAt";
KalturaPlayableEntryOrderBy.MODERATION_COUNT_DESC = "-moderationCount";
KalturaPlayableEntryOrderBy.NAME_DESC = "-name";
KalturaPlayableEntryOrderBy.PARTNER_SORT_VALUE_DESC = "-partnerSortValue";
KalturaPlayableEntryOrderBy.PLAYS_DESC = "-plays";
KalturaPlayableEntryOrderBy.RANK_DESC = "-rank";
KalturaPlayableEntryOrderBy.RECENT_DESC = "-recent";
KalturaPlayableEntryOrderBy.START_DATE_DESC = "-startDate";
KalturaPlayableEntryOrderBy.TOTAL_RANK_DESC = "-totalRank";
KalturaPlayableEntryOrderBy.UPDATED_AT_DESC = "-updatedAt";
KalturaPlayableEntryOrderBy.VIEWS_DESC = "-views";
KalturaPlayableEntryOrderBy.WEIGHT_DESC = "-weight";

function KalturaPlaybackProtocol(){
}
KalturaPlaybackProtocol.APPLE_HTTP = "applehttp";
KalturaPlaybackProtocol.AUTO = "auto";
KalturaPlaybackProtocol.AKAMAI_HD = "hdnetwork";
KalturaPlaybackProtocol.AKAMAI_HDS = "hdnetworkmanifest";
KalturaPlaybackProtocol.HDS = "hds";
KalturaPlaybackProtocol.HLS = "hls";
KalturaPlaybackProtocol.HTTP = "http";
KalturaPlaybackProtocol.MPEG_DASH = "mpegdash";
KalturaPlaybackProtocol.RTMP = "rtmp";
KalturaPlaybackProtocol.RTSP = "rtsp";
KalturaPlaybackProtocol.SILVER_LIGHT = "sl";

function KalturaPlaylistOrderBy(){
}
KalturaPlaylistOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaPlaylistOrderBy.END_DATE_ASC = "+endDate";
KalturaPlaylistOrderBy.MODERATION_COUNT_ASC = "+moderationCount";
KalturaPlaylistOrderBy.NAME_ASC = "+name";
KalturaPlaylistOrderBy.PARTNER_SORT_VALUE_ASC = "+partnerSortValue";
KalturaPlaylistOrderBy.RANK_ASC = "+rank";
KalturaPlaylistOrderBy.RECENT_ASC = "+recent";
KalturaPlaylistOrderBy.START_DATE_ASC = "+startDate";
KalturaPlaylistOrderBy.TOTAL_RANK_ASC = "+totalRank";
KalturaPlaylistOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaPlaylistOrderBy.WEIGHT_ASC = "+weight";
KalturaPlaylistOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaPlaylistOrderBy.END_DATE_DESC = "-endDate";
KalturaPlaylistOrderBy.MODERATION_COUNT_DESC = "-moderationCount";
KalturaPlaylistOrderBy.NAME_DESC = "-name";
KalturaPlaylistOrderBy.PARTNER_SORT_VALUE_DESC = "-partnerSortValue";
KalturaPlaylistOrderBy.RANK_DESC = "-rank";
KalturaPlaylistOrderBy.RECENT_DESC = "-recent";
KalturaPlaylistOrderBy.START_DATE_DESC = "-startDate";
KalturaPlaylistOrderBy.TOTAL_RANK_DESC = "-totalRank";
KalturaPlaylistOrderBy.UPDATED_AT_DESC = "-updatedAt";
KalturaPlaylistOrderBy.WEIGHT_DESC = "-weight";

function KalturaRemoteDropFolderOrderBy(){
}
KalturaRemoteDropFolderOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaRemoteDropFolderOrderBy.ID_ASC = "+id";
KalturaRemoteDropFolderOrderBy.NAME_ASC = "+name";
KalturaRemoteDropFolderOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaRemoteDropFolderOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaRemoteDropFolderOrderBy.ID_DESC = "-id";
KalturaRemoteDropFolderOrderBy.NAME_DESC = "-name";
KalturaRemoteDropFolderOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaReportInterval(){
}
KalturaReportInterval.DAYS = "days";
KalturaReportInterval.MONTHS = "months";

function KalturaReportOrderBy(){
}
KalturaReportOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaReportOrderBy.CREATED_AT_DESC = "-createdAt";

function KalturaRuleActionType(){
}
KalturaRuleActionType.BLOCK = "1";
KalturaRuleActionType.PREVIEW = "2";
KalturaRuleActionType.LIMIT_FLAVORS = "3";
KalturaRuleActionType.ADD_TO_STORAGE = "4";

function KalturaSchemaType(){
}
KalturaSchemaType.BULK_UPLOAD_RESULT_XML = "bulkUploadXml.bulkUploadResultXML";
KalturaSchemaType.BULK_UPLOAD_XML = "bulkUploadXml.bulkUploadXML";
KalturaSchemaType.INGEST_API = "cuePoint.ingestAPI";
KalturaSchemaType.SERVE_API = "cuePoint.serveAPI";
KalturaSchemaType.DROP_FOLDER_XML = "dropFolderXmlBulkUpload.dropFolderXml";
KalturaSchemaType.SYNDICATION = "syndication";

function KalturaScpDropFolderOrderBy(){
}
KalturaScpDropFolderOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaScpDropFolderOrderBy.ID_ASC = "+id";
KalturaScpDropFolderOrderBy.NAME_ASC = "+name";
KalturaScpDropFolderOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaScpDropFolderOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaScpDropFolderOrderBy.ID_DESC = "-id";
KalturaScpDropFolderOrderBy.NAME_DESC = "-name";
KalturaScpDropFolderOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaSearchConditionComparison(){
}
KalturaSearchConditionComparison.EQUAL = "1";
KalturaSearchConditionComparison.GREATER_THAN = "2";
KalturaSearchConditionComparison.GREATER_THAN_OR_EQUAL = "3";
KalturaSearchConditionComparison.LESS_THAN = "4";
KalturaSearchConditionComparison.LESS_THAN_OR_EQUAL = "5";

function KalturaSftpDropFolderOrderBy(){
}
KalturaSftpDropFolderOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaSftpDropFolderOrderBy.ID_ASC = "+id";
KalturaSftpDropFolderOrderBy.NAME_ASC = "+name";
KalturaSftpDropFolderOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaSftpDropFolderOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaSftpDropFolderOrderBy.ID_DESC = "-id";
KalturaSftpDropFolderOrderBy.NAME_DESC = "-name";
KalturaSftpDropFolderOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaShortLinkOrderBy(){
}
KalturaShortLinkOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaShortLinkOrderBy.EXPIRES_AT_ASC = "+expiresAt";
KalturaShortLinkOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaShortLinkOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaShortLinkOrderBy.EXPIRES_AT_DESC = "-expiresAt";
KalturaShortLinkOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaSourceType(){
}
KalturaSourceType.LIMELIGHT_LIVE = "limeLight.LIVE_STREAM";
KalturaSourceType.VELOCIX_LIVE = "velocix.VELOCIX_LIVE";
KalturaSourceType.FILE = "1";
KalturaSourceType.WEBCAM = "2";
KalturaSourceType.URL = "5";
KalturaSourceType.SEARCH_PROVIDER = "6";
KalturaSourceType.AKAMAI_LIVE = "29";
KalturaSourceType.MANUAL_LIVE_STREAM = "30";
KalturaSourceType.AKAMAI_UNIVERSAL_LIVE = "31";
KalturaSourceType.LIVE_STREAM = "32";
KalturaSourceType.LIVE_CHANNEL = "33";
KalturaSourceType.RECORDED_LIVE = "34";
KalturaSourceType.CLIP = "35";

function KalturaSshDropFolderOrderBy(){
}
KalturaSshDropFolderOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaSshDropFolderOrderBy.ID_ASC = "+id";
KalturaSshDropFolderOrderBy.NAME_ASC = "+name";
KalturaSshDropFolderOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaSshDropFolderOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaSshDropFolderOrderBy.ID_DESC = "-id";
KalturaSshDropFolderOrderBy.NAME_DESC = "-name";
KalturaSshDropFolderOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaStorageProfileOrderBy(){
}
KalturaStorageProfileOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaStorageProfileOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaStorageProfileOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaStorageProfileOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaStorageProfileProtocol(){
}
KalturaStorageProfileProtocol.KONTIKI = "kontiki.KONTIKI";
KalturaStorageProfileProtocol.KALTURA_DC = "0";
KalturaStorageProfileProtocol.FTP = "1";
KalturaStorageProfileProtocol.SCP = "2";
KalturaStorageProfileProtocol.SFTP = "3";
KalturaStorageProfileProtocol.S3 = "6";
KalturaStorageProfileProtocol.LOCAL = "7";

function KalturaSwfFlavorParamsOrderBy(){
}

function KalturaSwfFlavorParamsOutputOrderBy(){
}

function KalturaSyndicationDistributionProfileOrderBy(){
}
KalturaSyndicationDistributionProfileOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaSyndicationDistributionProfileOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaSyndicationDistributionProfileOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaSyndicationDistributionProfileOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaSyndicationDistributionProviderOrderBy(){
}

function KalturaSyndicationFeedEntriesOrderBy(){
}
KalturaSyndicationFeedEntriesOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaSyndicationFeedEntriesOrderBy.RECENT = "recent";

function KalturaTaggedObjectType(){
}
KalturaTaggedObjectType.ENTRY = "1";
KalturaTaggedObjectType.CATEGORY = "2";

function KalturaThumbAssetOrderBy(){
}
KalturaThumbAssetOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaThumbAssetOrderBy.DELETED_AT_ASC = "+deletedAt";
KalturaThumbAssetOrderBy.SIZE_ASC = "+size";
KalturaThumbAssetOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaThumbAssetOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaThumbAssetOrderBy.DELETED_AT_DESC = "-deletedAt";
KalturaThumbAssetOrderBy.SIZE_DESC = "-size";
KalturaThumbAssetOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaThumbParamsOrderBy(){
}

function KalturaThumbParamsOutputOrderBy(){
}

function KalturaTubeMogulSyndicationFeedCategories(){
}
KalturaTubeMogulSyndicationFeedCategories.ANIMALS_AND_PETS = "Animals &amp; Pets";
KalturaTubeMogulSyndicationFeedCategories.ARTS_AND_ANIMATION = "Arts &amp; Animation";
KalturaTubeMogulSyndicationFeedCategories.AUTOS = "Autos";
KalturaTubeMogulSyndicationFeedCategories.COMEDY = "Comedy";
KalturaTubeMogulSyndicationFeedCategories.COMMERCIALS_PROMOTIONAL = "Commercials/Promotional";
KalturaTubeMogulSyndicationFeedCategories.ENTERTAINMENT = "Entertainment";
KalturaTubeMogulSyndicationFeedCategories.FAMILY_AND_KIDS = "Family &amp; Kids";
KalturaTubeMogulSyndicationFeedCategories.HOW_TO_INSTRUCTIONAL_DIY = "How To/Instructional/DIY";
KalturaTubeMogulSyndicationFeedCategories.MUSIC = "Music";
KalturaTubeMogulSyndicationFeedCategories.NEWS_AND_BLOGS = "News &amp; Blogs";
KalturaTubeMogulSyndicationFeedCategories.SCIENCE_AND_TECHNOLOGY = "Science &amp; Technology";
KalturaTubeMogulSyndicationFeedCategories.SPORTS = "Sports";
KalturaTubeMogulSyndicationFeedCategories.TRAVEL_AND_PLACES = "Travel &amp; Places";
KalturaTubeMogulSyndicationFeedCategories.VIDEO_GAMES = "Video Games";
KalturaTubeMogulSyndicationFeedCategories.VLOGS_PEOPLE = "Vlogs &amp; People";

function KalturaTubeMogulSyndicationFeedOrderBy(){
}
KalturaTubeMogulSyndicationFeedOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaTubeMogulSyndicationFeedOrderBy.NAME_ASC = "+name";
KalturaTubeMogulSyndicationFeedOrderBy.PLAYLIST_ID_ASC = "+playlistId";
KalturaTubeMogulSyndicationFeedOrderBy.TYPE_ASC = "+type";
KalturaTubeMogulSyndicationFeedOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaTubeMogulSyndicationFeedOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaTubeMogulSyndicationFeedOrderBy.NAME_DESC = "-name";
KalturaTubeMogulSyndicationFeedOrderBy.PLAYLIST_ID_DESC = "-playlistId";
KalturaTubeMogulSyndicationFeedOrderBy.TYPE_DESC = "-type";
KalturaTubeMogulSyndicationFeedOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaUiConfOrderBy(){
}
KalturaUiConfOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaUiConfOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaUiConfOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaUiConfOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaUploadTokenOrderBy(){
}
KalturaUploadTokenOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaUploadTokenOrderBy.CREATED_AT_DESC = "-createdAt";

function KalturaUserLoginDataOrderBy(){
}

function KalturaUserOrderBy(){
}
KalturaUserOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaUserOrderBy.ID_ASC = "+id";
KalturaUserOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaUserOrderBy.ID_DESC = "-id";

function KalturaUserRoleOrderBy(){
}
KalturaUserRoleOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaUserRoleOrderBy.ID_ASC = "+id";
KalturaUserRoleOrderBy.NAME_ASC = "+name";
KalturaUserRoleOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaUserRoleOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaUserRoleOrderBy.ID_DESC = "-id";
KalturaUserRoleOrderBy.NAME_DESC = "-name";
KalturaUserRoleOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaVideoCodec(){
}
KalturaVideoCodec.NONE = "";
KalturaVideoCodec.APCH = "apch";
KalturaVideoCodec.APCN = "apcn";
KalturaVideoCodec.APCO = "apco";
KalturaVideoCodec.APCS = "apcs";
KalturaVideoCodec.COPY = "copy";
KalturaVideoCodec.DNXHD = "dnxhd";
KalturaVideoCodec.DV = "dv";
KalturaVideoCodec.FLV = "flv";
KalturaVideoCodec.H263 = "h263";
KalturaVideoCodec.H264 = "h264";
KalturaVideoCodec.H264B = "h264b";
KalturaVideoCodec.H264H = "h264h";
KalturaVideoCodec.H264M = "h264m";
KalturaVideoCodec.MPEG2 = "mpeg2";
KalturaVideoCodec.MPEG4 = "mpeg4";
KalturaVideoCodec.THEORA = "theora";
KalturaVideoCodec.VP6 = "vp6";
KalturaVideoCodec.VP8 = "vp8";
KalturaVideoCodec.WMV2 = "wmv2";
KalturaVideoCodec.WMV3 = "wmv3";
KalturaVideoCodec.WVC1A = "wvc1a";

function KalturaVirusScanEngineType(){
}
KalturaVirusScanEngineType.CLAMAV_SCAN_ENGINE = "clamAVScanEngine.ClamAV";
KalturaVirusScanEngineType.SYMANTEC_SCAN_DIRECT_ENGINE = "symantecScanEngine.SymantecScanDirectEngine";
KalturaVirusScanEngineType.SYMANTEC_SCAN_ENGINE = "symantecScanEngine.SymantecScanEngine";
KalturaVirusScanEngineType.SYMANTEC_SCAN_JAVA_ENGINE = "symantecScanEngine.SymantecScanJavaEngine";

function KalturaVirusScanProfileOrderBy(){
}
KalturaVirusScanProfileOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaVirusScanProfileOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaVirusScanProfileOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaVirusScanProfileOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaWebexDropFolderFileOrderBy(){
}
KalturaWebexDropFolderFileOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaWebexDropFolderFileOrderBy.FILE_NAME_ASC = "+fileName";
KalturaWebexDropFolderFileOrderBy.FILE_SIZE_ASC = "+fileSize";
KalturaWebexDropFolderFileOrderBy.FILE_SIZE_LAST_SET_AT_ASC = "+fileSizeLastSetAt";
KalturaWebexDropFolderFileOrderBy.ID_ASC = "+id";
KalturaWebexDropFolderFileOrderBy.PARSED_FLAVOR_ASC = "+parsedFlavor";
KalturaWebexDropFolderFileOrderBy.PARSED_SLUG_ASC = "+parsedSlug";
KalturaWebexDropFolderFileOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaWebexDropFolderFileOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaWebexDropFolderFileOrderBy.FILE_NAME_DESC = "-fileName";
KalturaWebexDropFolderFileOrderBy.FILE_SIZE_DESC = "-fileSize";
KalturaWebexDropFolderFileOrderBy.FILE_SIZE_LAST_SET_AT_DESC = "-fileSizeLastSetAt";
KalturaWebexDropFolderFileOrderBy.ID_DESC = "-id";
KalturaWebexDropFolderFileOrderBy.PARSED_FLAVOR_DESC = "-parsedFlavor";
KalturaWebexDropFolderFileOrderBy.PARSED_SLUG_DESC = "-parsedSlug";
KalturaWebexDropFolderFileOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaWebexDropFolderOrderBy(){
}
KalturaWebexDropFolderOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaWebexDropFolderOrderBy.ID_ASC = "+id";
KalturaWebexDropFolderOrderBy.NAME_ASC = "+name";
KalturaWebexDropFolderOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaWebexDropFolderOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaWebexDropFolderOrderBy.ID_DESC = "-id";
KalturaWebexDropFolderOrderBy.NAME_DESC = "-name";
KalturaWebexDropFolderOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaWidevineFlavorAssetOrderBy(){
}
KalturaWidevineFlavorAssetOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaWidevineFlavorAssetOrderBy.DELETED_AT_ASC = "+deletedAt";
KalturaWidevineFlavorAssetOrderBy.SIZE_ASC = "+size";
KalturaWidevineFlavorAssetOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaWidevineFlavorAssetOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaWidevineFlavorAssetOrderBy.DELETED_AT_DESC = "-deletedAt";
KalturaWidevineFlavorAssetOrderBy.SIZE_DESC = "-size";
KalturaWidevineFlavorAssetOrderBy.UPDATED_AT_DESC = "-updatedAt";

function KalturaWidevineFlavorParamsOrderBy(){
}

function KalturaWidevineFlavorParamsOutputOrderBy(){
}

function KalturaWidevineProfileOrderBy(){
}
KalturaWidevineProfileOrderBy.ID_ASC = "+id";
KalturaWidevineProfileOrderBy.NAME_ASC = "+name";
KalturaWidevineProfileOrderBy.ID_DESC = "-id";
KalturaWidevineProfileOrderBy.NAME_DESC = "-name";

function KalturaWidgetOrderBy(){
}
KalturaWidgetOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaWidgetOrderBy.CREATED_AT_DESC = "-createdAt";

function KalturaYahooSyndicationFeedAdultValues(){
}
KalturaYahooSyndicationFeedAdultValues.ADULT = "adult";
KalturaYahooSyndicationFeedAdultValues.NON_ADULT = "nonadult";

function KalturaYahooSyndicationFeedCategories(){
}
KalturaYahooSyndicationFeedCategories.ACTION = "Action";
KalturaYahooSyndicationFeedCategories.ANIMALS = "Animals";
KalturaYahooSyndicationFeedCategories.ART_AND_ANIMATION = "Art &amp; Animation";
KalturaYahooSyndicationFeedCategories.COMMERCIALS = "Commercials";
KalturaYahooSyndicationFeedCategories.ENTERTAINMENT_AND_TV = "Entertainment &amp; TV";
KalturaYahooSyndicationFeedCategories.FAMILY = "Family";
KalturaYahooSyndicationFeedCategories.FOOD = "Food";
KalturaYahooSyndicationFeedCategories.FUNNY_VIDEOS = "Funny Videos";
KalturaYahooSyndicationFeedCategories.GAMES = "Games";
KalturaYahooSyndicationFeedCategories.HEALTH_AND_BEAUTY = "Health &amp; Beauty";
KalturaYahooSyndicationFeedCategories.HOW_TO = "How-To";
KalturaYahooSyndicationFeedCategories.MOVIES_AND_SHORTS = "Movies &amp; Shorts";
KalturaYahooSyndicationFeedCategories.MUSIC = "Music";
KalturaYahooSyndicationFeedCategories.NEWS_AND_POLITICS = "News &amp; Politics";
KalturaYahooSyndicationFeedCategories.PEOPLE_AND_VLOGS = "People &amp; Vlogs";
KalturaYahooSyndicationFeedCategories.PRODUCTS_AND_TECH = "Products &amp; Tech.";
KalturaYahooSyndicationFeedCategories.SCIENCE_AND_ENVIRONMENT = "Science &amp; Environment";
KalturaYahooSyndicationFeedCategories.SPORTS = "Sports";
KalturaYahooSyndicationFeedCategories.TRANSPORTATION = "Transportation";
KalturaYahooSyndicationFeedCategories.TRAVEL = "Travel";

function KalturaYahooSyndicationFeedOrderBy(){
}
KalturaYahooSyndicationFeedOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaYahooSyndicationFeedOrderBy.NAME_ASC = "+name";
KalturaYahooSyndicationFeedOrderBy.PLAYLIST_ID_ASC = "+playlistId";
KalturaYahooSyndicationFeedOrderBy.TYPE_ASC = "+type";
KalturaYahooSyndicationFeedOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaYahooSyndicationFeedOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaYahooSyndicationFeedOrderBy.NAME_DESC = "-name";
KalturaYahooSyndicationFeedOrderBy.PLAYLIST_ID_DESC = "-playlistId";
KalturaYahooSyndicationFeedOrderBy.TYPE_DESC = "-type";
KalturaYahooSyndicationFeedOrderBy.UPDATED_AT_DESC = "-updatedAt";
