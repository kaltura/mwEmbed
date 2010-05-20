/**
 * The Kaltura Client - this is the facade through which all service actions should be called.
 * @param config the Kaltura configuration object holding partner credentials (type: KalturaConfiguration).
 */
KalturaClient.inheritsFrom (KalturaClientBase);
//Kaltura object init: 
function KalturaClient(config){
	this.init(config);
}

/**
 * 
 * @param KalturaAccessControlService
 */
KalturaClient.prototype.accessControl = null;
/**
 * 
 * @param KalturaAdminconsoleService
 */
KalturaClient.prototype.adminconsole = null;
/**
 * 
 * @param KalturaAdminUserService
 */
KalturaClient.prototype.adminUser = null;
/**
 * 
 * @param KalturaBaseEntryService
 */
KalturaClient.prototype.baseEntry = null;
/**
 * 
 * @param KalturaBulkUploadService
 */
KalturaClient.prototype.bulkUpload = null;
/**
 * 
 * @param KalturaCategoryService
 */
KalturaClient.prototype.category = null;
/**
 * 
 * @param KalturaConversionProfileService
 */
KalturaClient.prototype.conversionProfile = null;
/**
 * 
 * @param KalturaDataService
 */
KalturaClient.prototype.data = null;
/**
 * 
 * @param KalturaFlavorAssetService
 */
KalturaClient.prototype.flavorAsset = null;
/**
 * 
 * @param KalturaFlavorParamsService
 */
KalturaClient.prototype.flavorParams = null;
/**
 * 
 * @param KalturaMediaService
 */
KalturaClient.prototype.media = null;
/**
 * 
 * @param KalturaMixingService
 */
KalturaClient.prototype.mixing = null;
/**
 * 
 * @param KalturaNotificationService
 */
KalturaClient.prototype.notification = null;
/**
 * 
 * @param KalturaPartnerService
 */
KalturaClient.prototype.partner = null;
/**
 * 
 * @param KalturaPlaylistService
 */
KalturaClient.prototype.playlist = null;
/**
 * 
 * @param KalturaReportService
 */
KalturaClient.prototype.report = null;
/**
 * 
 * @param KalturaSearchService
 */
KalturaClient.prototype.search = null;
/**
 * 
 * @param KalturaSessionService
 */
KalturaClient.prototype.session = null;
/**
 * 
 * @param KalturaStatsService
 */
KalturaClient.prototype.stats = null;
/**
 * 
 * @param KalturaSyndicationFeedService
 */
KalturaClient.prototype.syndicationFeed = null;
/**
 * 
 * @param KalturaSystemService
 */
KalturaClient.prototype.system = null;
/**
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
 * @param KalturaUserService
 */
KalturaClient.prototype.user = null;
/**
 * 
 * @param KalturaWidgetService
 */
KalturaClient.prototype.widget = null;
/**
 * 
 * @param KalturaXInternalService
 */
KalturaClient.prototype.xInternal = null;
/**
 * 
 * @param KalturaSystemUserService
 */
KalturaClient.prototype.systemUser = null;
/**
 * 
 * @param KalturaSystemPartnerService
 */
KalturaClient.prototype.systemPartner = null;
/**
 * 
 * @param KalturaFileSyncService
 */
KalturaClient.prototype.fileSync = null;
/**
 * 
 * @param KalturaFlavorParamsOutputService
 */
KalturaClient.prototype.flavorParamsOutput = null;
/**
 * 
 * @param KalturaMediaInfoService
 */
KalturaClient.prototype.mediaInfo = null;
/**
 * 
 * @param KalturaEntryAdminService
 */
KalturaClient.prototype.entryAdmin = null;
/**
 * The client constructor.
 * @param config the Kaltura configuration object holding partner credentials (type: KalturaConfiguration).
 */
KalturaClient.prototype.init = function(config){
	//call the super constructor:
	KalturaClientBase.prototype.init.apply(this, arguments);
	//initialize client services:
	this.accessControl = new KalturaAccessControlService(this);
	this.adminconsole = new KalturaAdminconsoleService(this);
	this.adminUser = new KalturaAdminUserService(this);
	this.baseEntry = new KalturaBaseEntryService(this);
	this.bulkUpload = new KalturaBulkUploadService(this);
	this.category = new KalturaCategoryService(this);
	this.conversionProfile = new KalturaConversionProfileService(this);
	this.data = new KalturaDataService(this);
	this.flavorAsset = new KalturaFlavorAssetService(this);
	this.flavorParams = new KalturaFlavorParamsService(this);
	this.media = new KalturaMediaService(this);
	this.mixing = new KalturaMixingService(this);
	this.notification = new KalturaNotificationService(this);
	this.partner = new KalturaPartnerService(this);
	this.playlist = new KalturaPlaylistService(this);
	this.report = new KalturaReportService(this);
	this.search = new KalturaSearchService(this);
	this.session = new KalturaSessionService(this);
	this.stats = new KalturaStatsService(this);
	this.syndicationFeed = new KalturaSyndicationFeedService(this);
	this.system = new KalturaSystemService(this);
	this.uiConf = new KalturaUiConfService(this);
	this.upload = new KalturaUploadService(this);
	this.user = new KalturaUserService(this);
	this.widget = new KalturaWidgetService(this);
	this.xInternal = new KalturaXInternalService(this);
	this.systemUser = new KalturaSystemUserService(this);
	this.systemPartner = new KalturaSystemPartnerService(this);
	this.fileSync = new KalturaFileSyncService(this);
	this.flavorParamsOutput = new KalturaFlavorParamsOutputService(this);
	this.mediaInfo = new KalturaMediaInfoService(this);
	this.entryAdmin = new KalturaEntryAdminService(this);
}
