
function KalturaAccessControlOrderBy(){
}
KalturaAccessControlOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaAccessControlOrderBy.CREATED_AT_DESC = "-createdAt";

function KalturaAudioCodec(){
}
KalturaAudioCodec.NONE = "";
KalturaAudioCodec.MP3 = "mp3";
KalturaAudioCodec.AAC = "aac";

function KalturaBaseEntryOrderBy(){
}
KalturaBaseEntryOrderBy.NAME_ASC = "+name";
KalturaBaseEntryOrderBy.NAME_DESC = "-name";
KalturaBaseEntryOrderBy.MODERATION_COUNT_ASC = "+moderationCount";
KalturaBaseEntryOrderBy.MODERATION_COUNT_DESC = "-moderationCount";
KalturaBaseEntryOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaBaseEntryOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaBaseEntryOrderBy.RANK_ASC = "+rank";
KalturaBaseEntryOrderBy.RANK_DESC = "-rank";

function KalturaBaseJobOrderBy(){
}
KalturaBaseJobOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaBaseJobOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaBaseJobOrderBy.EXECUTION_ATTEMPTS_ASC = "+executionAttempts";
KalturaBaseJobOrderBy.EXECUTION_ATTEMPTS_DESC = "-executionAttempts";

function KalturaBaseSyndicationFeedOrderBy(){
}
KalturaBaseSyndicationFeedOrderBy.PLAYLIST_ID_ASC = "+playlistId";
KalturaBaseSyndicationFeedOrderBy.PLAYLIST_ID_DESC = "-playlistId";
KalturaBaseSyndicationFeedOrderBy.NAME_ASC = "+name";
KalturaBaseSyndicationFeedOrderBy.NAME_DESC = "-name";
KalturaBaseSyndicationFeedOrderBy.TYPE_ASC = "+type";
KalturaBaseSyndicationFeedOrderBy.TYPE_DESC = "-type";
KalturaBaseSyndicationFeedOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaBaseSyndicationFeedOrderBy.CREATED_AT_DESC = "-createdAt";

function KalturaBatchJobErrorTypes(){
}
KalturaBatchJobErrorTypes.APP = 0;
KalturaBatchJobErrorTypes.RUNTIME = 1;
KalturaBatchJobErrorTypes.HTTP = 2;
KalturaBatchJobErrorTypes.CURL = 3;

function KalturaBatchJobOrderBy(){
}
KalturaBatchJobOrderBy.STATUS_ASC = "+status";
KalturaBatchJobOrderBy.STATUS_DESC = "-status";
KalturaBatchJobOrderBy.QUEUE_TIME_ASC = "+queueTime";
KalturaBatchJobOrderBy.QUEUE_TIME_DESC = "-queueTime";
KalturaBatchJobOrderBy.FINISH_TIME_ASC = "+finishTime";
KalturaBatchJobOrderBy.FINISH_TIME_DESC = "-finishTime";
KalturaBatchJobOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaBatchJobOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaBatchJobOrderBy.EXECUTION_ATTEMPTS_ASC = "+executionAttempts";
KalturaBatchJobOrderBy.EXECUTION_ATTEMPTS_DESC = "-executionAttempts";

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

function KalturaBatchJobType(){
}
KalturaBatchJobType.CONVERT = 0;
KalturaBatchJobType.IMPORT = 1;
KalturaBatchJobType.DELETE = 2;
KalturaBatchJobType.FLATTEN = 3;
KalturaBatchJobType.BULKUPLOAD = 4;
KalturaBatchJobType.DVDCREATOR = 5;
KalturaBatchJobType.DOWNLOAD = 6;
KalturaBatchJobType.OOCONVERT = 7;
KalturaBatchJobType.CONVERT_PROFILE = 10;
KalturaBatchJobType.POSTCONVERT = 11;
KalturaBatchJobType.PULL = 12;
KalturaBatchJobType.REMOTE_CONVERT = 13;
KalturaBatchJobType.EXTRACT_MEDIA = 14;
KalturaBatchJobType.MAIL = 15;
KalturaBatchJobType.NOTIFICATION = 16;
KalturaBatchJobType.CLEANUP = 17;
KalturaBatchJobType.SCHEDULER_HELPER = 18;
KalturaBatchJobType.BULKDOWNLOAD = 19;
KalturaBatchJobType.PROJECT = 1000;

function KalturaBitRateMode(){
}
KalturaBitRateMode.CBR = 1;
KalturaBitRateMode.VBR = 2;

function KalturaBulkUploadCsvVersion(){
}
KalturaBulkUploadCsvVersion.V1 = "1";
KalturaBulkUploadCsvVersion.V2 = "2";

function KalturaCategoryOrderBy(){
}
KalturaCategoryOrderBy.DEPTH_ASC = "+depth";
KalturaCategoryOrderBy.DEPTH_DESC = "-depth";
KalturaCategoryOrderBy.FULL_NAME_ASC = "+fullName";
KalturaCategoryOrderBy.FULL_NAME_DESC = "-fullName";
KalturaCategoryOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaCategoryOrderBy.CREATED_AT_DESC = "-createdAt";

function KalturaCommercialUseType(){
}
KalturaCommercialUseType.COMMERCIAL_USE = "commercial_use";
KalturaCommercialUseType.NON_COMMERCIAL_USE = "non-commercial_use";

function KalturaContainerFormat(){
}
KalturaContainerFormat.FLV = "flv";
KalturaContainerFormat.MP4 = "mp4";
KalturaContainerFormat.AVI = "avi";
KalturaContainerFormat.MOV = "mov";
KalturaContainerFormat._3GP = "3gp";

function KalturaControlPanelCommandOrderBy(){
}
KalturaControlPanelCommandOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaControlPanelCommandOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaControlPanelCommandOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaControlPanelCommandOrderBy.UPDATED_AT_DESC = "-updatedAt";

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
KalturaControlPanelCommandType.STOP = 1;
KalturaControlPanelCommandType.START = 2;
KalturaControlPanelCommandType.CONFIG = 3;
KalturaControlPanelCommandType.KILL = 4;

function KalturaConversionProfileOrderBy(){
}
KalturaConversionProfileOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaConversionProfileOrderBy.CREATED_AT_DESC = "-createdAt";

function KalturaCountryRestrictionType(){
}
KalturaCountryRestrictionType.RESTRICT_COUNTRY_LIST = 0;
KalturaCountryRestrictionType.ALLOW_COUNTRY_LIST = 1;

function KalturaDataEntryOrderBy(){
}
KalturaDataEntryOrderBy.NAME_ASC = "+name";
KalturaDataEntryOrderBy.NAME_DESC = "-name";
KalturaDataEntryOrderBy.MODERATION_COUNT_ASC = "+moderationCount";
KalturaDataEntryOrderBy.MODERATION_COUNT_DESC = "-moderationCount";
KalturaDataEntryOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaDataEntryOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaDataEntryOrderBy.RANK_ASC = "+rank";
KalturaDataEntryOrderBy.RANK_DESC = "-rank";

function KalturaDirectoryRestrictionType(){
}
KalturaDirectoryRestrictionType.DONT_DISPLAY = 0;
KalturaDirectoryRestrictionType.DISPLAY_WITH_LINK = 1;

function KalturaDocumentEntryOrderBy(){
}
KalturaDocumentEntryOrderBy.NAME_ASC = "+name";
KalturaDocumentEntryOrderBy.NAME_DESC = "-name";
KalturaDocumentEntryOrderBy.MODERATION_COUNT_ASC = "+moderationCount";
KalturaDocumentEntryOrderBy.MODERATION_COUNT_DESC = "-moderationCount";
KalturaDocumentEntryOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaDocumentEntryOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaDocumentEntryOrderBy.RANK_ASC = "+rank";
KalturaDocumentEntryOrderBy.RANK_DESC = "-rank";

function KalturaDocumentType(){
}
KalturaDocumentType.DOCUMENT = 11;
KalturaDocumentType.SWF = 12;

function KalturaDurationType(){
}
KalturaDurationType.NOT_AVAILABLE = "notavailable";
KalturaDurationType.SHORT = "short";
KalturaDurationType.MEDIUM = "medium";
KalturaDurationType.LONG = "long";

function KalturaEditorType(){
}
KalturaEditorType.SIMPLE = 1;
KalturaEditorType.ADVANCED = 2;

function KalturaEntryModerationStatus(){
}
KalturaEntryModerationStatus.PENDING_MODERATION = 1;
KalturaEntryModerationStatus.APPROVED = 2;
KalturaEntryModerationStatus.REJECTED = 3;
KalturaEntryModerationStatus.FLAGGED_FOR_REVIEW = 5;
KalturaEntryModerationStatus.AUTO_APPROVED = 6;

function KalturaEntryStatus(){
}
KalturaEntryStatus.ERROR_IMPORTING = -2;
KalturaEntryStatus.ERROR_CONVERTING = -1;
KalturaEntryStatus.IMPORT = 0;
KalturaEntryStatus.PRECONVERT = 1;
KalturaEntryStatus.READY = 2;
KalturaEntryStatus.DELETED = 3;
KalturaEntryStatus.PENDING = 4;
KalturaEntryStatus.MODERATE = 5;
KalturaEntryStatus.BLOCKED = 6;

function KalturaEntryType(){
}
KalturaEntryType.AUTOMATIC = -1;
KalturaEntryType.MEDIA_CLIP = 1;
KalturaEntryType.MIX = 2;
KalturaEntryType.PLAYLIST = 5;
KalturaEntryType.DATA = 6;
KalturaEntryType.DOCUMENT = 10;

function KalturaFileSyncObjectType(){
}
KalturaFileSyncObjectType.ENTRY = 1;
KalturaFileSyncObjectType.UICONF = 2;
KalturaFileSyncObjectType.BATCHJOB = 3;
KalturaFileSyncObjectType.FLAVOR_ASSET = 4;

function KalturaFileSyncOrderBy(){
}
KalturaFileSyncOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaFileSyncOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaFileSyncOrderBy.UPDATED_AT_ASC = "+updatedAt";
KalturaFileSyncOrderBy.UPDATED_AT_DESC = "-updatedAt";
KalturaFileSyncOrderBy.READY_AT_ASC = "+readyAt";
KalturaFileSyncOrderBy.READY_AT_DESC = "-readyAt";
KalturaFileSyncOrderBy.SYNC_TIME_ASC = "+syncTime";
KalturaFileSyncOrderBy.SYNC_TIME_DESC = "-syncTime";
KalturaFileSyncOrderBy.FILE_SIZE_ASC = "+fileSize";
KalturaFileSyncOrderBy.FILE_SIZE_DESC = "-fileSize";

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

function KalturaFlavorParamsOrderBy(){
}

function KalturaFlavorParamsOutputOrderBy(){
}

function KalturaGender(){
}
KalturaGender.UNKNOWN = 0;
KalturaGender.MALE = 1;
KalturaGender.FEMALE = 2;

function KalturaGoogleSyndicationFeedAdultValues(){
}
KalturaGoogleSyndicationFeedAdultValues.YES = "Yes";
KalturaGoogleSyndicationFeedAdultValues.NO = "No";

function KalturaGoogleVideoSyndicationFeedOrderBy(){
}
KalturaGoogleVideoSyndicationFeedOrderBy.PLAYLIST_ID_ASC = "+playlistId";
KalturaGoogleVideoSyndicationFeedOrderBy.PLAYLIST_ID_DESC = "-playlistId";
KalturaGoogleVideoSyndicationFeedOrderBy.NAME_ASC = "+name";
KalturaGoogleVideoSyndicationFeedOrderBy.NAME_DESC = "-name";
KalturaGoogleVideoSyndicationFeedOrderBy.TYPE_ASC = "+type";
KalturaGoogleVideoSyndicationFeedOrderBy.TYPE_DESC = "-type";
KalturaGoogleVideoSyndicationFeedOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaGoogleVideoSyndicationFeedOrderBy.CREATED_AT_DESC = "-createdAt";

function KalturaITunesSyndicationFeedAdultValues(){
}
KalturaITunesSyndicationFeedAdultValues.YES = "yes";
KalturaITunesSyndicationFeedAdultValues.NO = "no";
KalturaITunesSyndicationFeedAdultValues.CLEAN = "clean";

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
KalturaITunesSyndicationFeedCategories.TECHNOLOGY = "Technology";
KalturaITunesSyndicationFeedCategories.TECHNOLOGY_GADGETS = "Technology/Gadgets";
KalturaITunesSyndicationFeedCategories.TECHNOLOGY_TECH_NEWS = "Technology/Tech News";
KalturaITunesSyndicationFeedCategories.TECHNOLOGY_PODCASTING = "Technology/Podcasting";
KalturaITunesSyndicationFeedCategories.TECHNOLOGY_SOFTWARE_HOW_TO = "Technology/Software How-To";
KalturaITunesSyndicationFeedCategories.TV_FILM = "TV &amp; Film";

function KalturaITunesSyndicationFeedOrderBy(){
}
KalturaITunesSyndicationFeedOrderBy.PLAYLIST_ID_ASC = "+playlistId";
KalturaITunesSyndicationFeedOrderBy.PLAYLIST_ID_DESC = "-playlistId";
KalturaITunesSyndicationFeedOrderBy.NAME_ASC = "+name";
KalturaITunesSyndicationFeedOrderBy.NAME_DESC = "-name";
KalturaITunesSyndicationFeedOrderBy.TYPE_ASC = "+type";
KalturaITunesSyndicationFeedOrderBy.TYPE_DESC = "-type";
KalturaITunesSyndicationFeedOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaITunesSyndicationFeedOrderBy.CREATED_AT_DESC = "-createdAt";

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

function KalturaMailJobOrderBy(){
}
KalturaMailJobOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaMailJobOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaMailJobOrderBy.EXECUTION_ATTEMPTS_ASC = "+executionAttempts";
KalturaMailJobOrderBy.EXECUTION_ATTEMPTS_DESC = "-executionAttempts";

function KalturaMailJobStatus(){
}
KalturaMailJobStatus.PENDING = 1;
KalturaMailJobStatus.SENT = 2;
KalturaMailJobStatus.ERROR = 3;
KalturaMailJobStatus.QUEUED = 4;

function KalturaMailType(){
}
KalturaMailType.MAIL_TYPE_KALTURA_NEWSLETTER = 10;
KalturaMailType.MAIL_TYPE_ADDED_TO_FAVORITES = 11;
KalturaMailType.MAIL_TYPE_ADDED_TO_CLIP_FAVORITES = 12;
KalturaMailType.MAIL_TYPE_NEW_COMMENT_IN_PROFILE = 13;
KalturaMailType.MAIL_TYPE_CLIP_ADDED_YOUR_KALTURA = 20;
KalturaMailType.MAIL_TYPE_VIDEO_ADDED = 21;
KalturaMailType.MAIL_TYPE_ROUGHCUT_CREATED = 22;
KalturaMailType.MAIL_TYPE_ADDED_KALTURA_TO_YOUR_FAVORITES = 23;
KalturaMailType.MAIL_TYPE_NEW_COMMENT_IN_KALTURA = 24;
KalturaMailType.MAIL_TYPE_CLIP_ADDED = 30;
KalturaMailType.MAIL_TYPE_VIDEO_CREATED = 31;
KalturaMailType.MAIL_TYPE_ADDED_KALTURA_TO_HIS_FAVORITES = 32;
KalturaMailType.MAIL_TYPE_NEW_COMMENT_IN_KALTURA_YOU_CONTRIBUTED = 33;
KalturaMailType.MAIL_TYPE_CLIP_CONTRIBUTED = 40;
KalturaMailType.MAIL_TYPE_ROUGHCUT_CREATED_SUBSCRIBED = 41;
KalturaMailType.MAIL_TYPE_ADDED_KALTURA_TO_HIS_FAVORITES_SUBSCRIBED = 42;
KalturaMailType.MAIL_TYPE_NEW_COMMENT_IN_KALTURA_YOU_SUBSCRIBED = 43;
KalturaMailType.MAIL_TYPE_REGISTER_CONFIRM = 50;
KalturaMailType.MAIL_TYPE_PASSWORD_RESET = 51;
KalturaMailType.MAIL_TYPE_LOGIN_MAIL_RESET = 52;
KalturaMailType.MAIL_TYPE_REGISTER_CONFIRM_VIDEO_SERVICE = 54;
KalturaMailType.MAIL_TYPE_VIDEO_READY = 60;
KalturaMailType.MAIL_TYPE_VIDEO_IS_READY = 62;
KalturaMailType.MAIL_TYPE_BULK_DOWNLOAD_READY = 63;
KalturaMailType.MAIL_TYPE_NOTIFY_ERR = 70;
KalturaMailType.MAIL_TYPE_ACCOUNT_UPGRADE_CONFIRM = 80;
KalturaMailType.MAIL_TYPE_VIDEO_SERVICE_NOTICE = 81;
KalturaMailType.MAIL_TYPE_VIDEO_SERVICE_NOTICE_LIMIT_REACHED = 82;
KalturaMailType.MAIL_TYPE_VIDEO_SERVICE_NOTICE_ACCOUNT_LOCKED = 83;
KalturaMailType.MAIL_TYPE_VIDEO_SERVICE_NOTICE_ACCOUNT_DELETED = 84;
KalturaMailType.MAIL_TYPE_VIDEO_SERVICE_NOTICE_UPGRADE_OFFER = 85;
KalturaMailType.MAIL_TYPE_ACCOUNT_REACTIVE_CONFIRM = 86;
KalturaMailType.MAIL_TYPE_SYSTEM_USER_RESET_PASSWORD = 110;
KalturaMailType.MAIL_TYPE_SYSTEM_USER_RESET_PASSWORD_SUCCESS = 111;

function KalturaMediaEntryOrderBy(){
}
KalturaMediaEntryOrderBy.MEDIA_TYPE_ASC = "+mediaType";
KalturaMediaEntryOrderBy.MEDIA_TYPE_DESC = "-mediaType";
KalturaMediaEntryOrderBy.PLAYS_ASC = "+plays";
KalturaMediaEntryOrderBy.PLAYS_DESC = "-plays";
KalturaMediaEntryOrderBy.VIEWS_ASC = "+views";
KalturaMediaEntryOrderBy.VIEWS_DESC = "-views";
KalturaMediaEntryOrderBy.DURATION_ASC = "+duration";
KalturaMediaEntryOrderBy.DURATION_DESC = "-duration";
KalturaMediaEntryOrderBy.NAME_ASC = "+name";
KalturaMediaEntryOrderBy.NAME_DESC = "-name";
KalturaMediaEntryOrderBy.MODERATION_COUNT_ASC = "+moderationCount";
KalturaMediaEntryOrderBy.MODERATION_COUNT_DESC = "-moderationCount";
KalturaMediaEntryOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaMediaEntryOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaMediaEntryOrderBy.RANK_ASC = "+rank";
KalturaMediaEntryOrderBy.RANK_DESC = "-rank";

function KalturaMediaInfoOrderBy(){
}

function KalturaMediaType(){
}
KalturaMediaType.VIDEO = 1;
KalturaMediaType.IMAGE = 2;
KalturaMediaType.AUDIO = 5;

function KalturaMixEntryOrderBy(){
}
KalturaMixEntryOrderBy.PLAYS_ASC = "+plays";
KalturaMixEntryOrderBy.PLAYS_DESC = "-plays";
KalturaMixEntryOrderBy.VIEWS_ASC = "+views";
KalturaMixEntryOrderBy.VIEWS_DESC = "-views";
KalturaMixEntryOrderBy.DURATION_ASC = "+duration";
KalturaMixEntryOrderBy.DURATION_DESC = "-duration";
KalturaMixEntryOrderBy.NAME_ASC = "+name";
KalturaMixEntryOrderBy.NAME_DESC = "-name";
KalturaMixEntryOrderBy.MODERATION_COUNT_ASC = "+moderationCount";
KalturaMixEntryOrderBy.MODERATION_COUNT_DESC = "-moderationCount";
KalturaMixEntryOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaMixEntryOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaMixEntryOrderBy.RANK_ASC = "+rank";
KalturaMixEntryOrderBy.RANK_DESC = "-rank";

function KalturaModerationFlagStatus(){
}
KalturaModerationFlagStatus.PENDING = 1;
KalturaModerationFlagStatus.MODERATED = 2;

function KalturaModerationFlagType(){
}
KalturaModerationFlagType.SEXUAL_CONTENT = 1;
KalturaModerationFlagType.VIOLENT_REPULSIVE = 2;
KalturaModerationFlagType.HARMFUL_DANGEROUS = 3;
KalturaModerationFlagType.SPAM_COMMERCIALS = 4;

function KalturaModerationObjectType(){
}
KalturaModerationObjectType.ENTRY = 2;
KalturaModerationObjectType.USER = 3;

function KalturaNotificationObjectType(){
}
KalturaNotificationObjectType.ENTRY = 1;
KalturaNotificationObjectType.KSHOW = 2;
KalturaNotificationObjectType.USER = 3;
KalturaNotificationObjectType.BATCH_JOB = 4;

function KalturaNotificationOrderBy(){
}
KalturaNotificationOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaNotificationOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaNotificationOrderBy.EXECUTION_ATTEMPTS_ASC = "+executionAttempts";
KalturaNotificationOrderBy.EXECUTION_ATTEMPTS_DESC = "-executionAttempts";

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

function KalturaPartnerOrderBy(){
}
KalturaPartnerOrderBy.ID_ASC = "+id";
KalturaPartnerOrderBy.ID_DESC = "-id";
KalturaPartnerOrderBy.NAME_ASC = "+name";
KalturaPartnerOrderBy.NAME_DESC = "-name";
KalturaPartnerOrderBy.WEBSITE_ASC = "+website";
KalturaPartnerOrderBy.WEBSITE_DESC = "-website";
KalturaPartnerOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaPartnerOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaPartnerOrderBy.ADMIN_NAME_ASC = "+adminName";
KalturaPartnerOrderBy.ADMIN_NAME_DESC = "-adminName";
KalturaPartnerOrderBy.ADMIN_EMAIL_ASC = "+adminEmail";
KalturaPartnerOrderBy.ADMIN_EMAIL_DESC = "-adminEmail";
KalturaPartnerOrderBy.STATUS_ASC = "+status";
KalturaPartnerOrderBy.STATUS_DESC = "-status";

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

function KalturaPlayableEntryOrderBy(){
}
KalturaPlayableEntryOrderBy.PLAYS_ASC = "+plays";
KalturaPlayableEntryOrderBy.PLAYS_DESC = "-plays";
KalturaPlayableEntryOrderBy.VIEWS_ASC = "+views";
KalturaPlayableEntryOrderBy.VIEWS_DESC = "-views";
KalturaPlayableEntryOrderBy.DURATION_ASC = "+duration";
KalturaPlayableEntryOrderBy.DURATION_DESC = "-duration";
KalturaPlayableEntryOrderBy.NAME_ASC = "+name";
KalturaPlayableEntryOrderBy.NAME_DESC = "-name";
KalturaPlayableEntryOrderBy.MODERATION_COUNT_ASC = "+moderationCount";
KalturaPlayableEntryOrderBy.MODERATION_COUNT_DESC = "-moderationCount";
KalturaPlayableEntryOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaPlayableEntryOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaPlayableEntryOrderBy.RANK_ASC = "+rank";
KalturaPlayableEntryOrderBy.RANK_DESC = "-rank";

function KalturaPlaylistOrderBy(){
}
KalturaPlaylistOrderBy.NAME_ASC = "+name";
KalturaPlaylistOrderBy.NAME_DESC = "-name";
KalturaPlaylistOrderBy.MODERATION_COUNT_ASC = "+moderationCount";
KalturaPlaylistOrderBy.MODERATION_COUNT_DESC = "-moderationCount";
KalturaPlaylistOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaPlaylistOrderBy.CREATED_AT_DESC = "-createdAt";
KalturaPlaylistOrderBy.RANK_ASC = "+rank";
KalturaPlaylistOrderBy.RANK_DESC = "-rank";

function KalturaPlaylistType(){
}
KalturaPlaylistType.DYNAMIC = 10;
KalturaPlaylistType.STATIC_LIST = 3;
KalturaPlaylistType.EXTERNAL = 101;

function KalturaReportType(){
}
KalturaReportType.TOP_CONTENT = 1;
KalturaReportType.CONTENT_DROPOFF = 2;
KalturaReportType.CONTENT_INTERACTIONS = 3;
KalturaReportType.MAP_OVERLAY = 4;
KalturaReportType.TOP_CONTRIBUTORS = 5;
KalturaReportType.TOP_SYNDICATION = 6;
KalturaReportType.CONTENT_CONTRIBUTIONS = 7;
KalturaReportType.ADMIN_CONSOLE = 10;

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

function KalturaSessionType(){
}
KalturaSessionType.USER = 0;
KalturaSessionType.ADMIN = 2;

function KalturaSiteRestrictionType(){
}
KalturaSiteRestrictionType.RESTRICT_SITE_LIST = 0;
KalturaSiteRestrictionType.ALLOW_SITE_LIST = 1;

function KalturaSourceType(){
}
KalturaSourceType.FILE = 1;
KalturaSourceType.WEBCAM = 2;
KalturaSourceType.URL = 5;
KalturaSourceType.SEARCH_PROVIDER = 6;

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
KalturaStatsEventType.FUTURE_USE_1 = 24;
KalturaStatsEventType.FUTURE_USE_2 = 25;
KalturaStatsEventType.FUTURE_USE_3 = 26;

function KalturaStatsKmcEventType(){
}
KalturaStatsKmcEventType.CONTENT_PAGE_VIEW = 1001;
KalturaStatsKmcEventType.CONTENT_ADD_PLAYLIST = 1010;
KalturaStatsKmcEventType.CONTENT_EDIT_PLAYLIST = 1011;
KalturaStatsKmcEventType.CONTENT_DELETE_PLAYLIST = 1012;
KalturaStatsKmcEventType.CONTENT_DELETE_ITEM = 1058;
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
KalturaStatsKmcEventType.CONTENT_CONTENT_GO_TO_PAGE = 1057;
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

function KalturaSystemPartnerPackage(){
}
KalturaSystemPartnerPackage.PACKAGE_FREE = "1";
KalturaSystemPartnerPackage.PACKAGE_20 = "2";
KalturaSystemPartnerPackage.PACKAGE_50 = "3";
KalturaSystemPartnerPackage.PACKAGE_100 = "4";
KalturaSystemPartnerPackage.PACKAGE_250 = "5";
KalturaSystemPartnerPackage.PACKAGE_500 = "6";

function KalturaSystemUserOrderBy(){
}
KalturaSystemUserOrderBy.ID_ASC = "+id";
KalturaSystemUserOrderBy.ID_DESC = "-id";
KalturaSystemUserOrderBy.STATUS_ASC = "+status";
KalturaSystemUserOrderBy.STATUS_DESC = "-status";

function KalturaSystemUserStatus(){
}
KalturaSystemUserStatus.BLOCKED = 0;
KalturaSystemUserStatus.ACTIVE = 1;

function KalturaTubeMogulSyndicationFeedCategories(){
}
KalturaTubeMogulSyndicationFeedCategories.ARTS_AND_ANIMATION = "Arts &amp; Animation";
KalturaTubeMogulSyndicationFeedCategories.COMEDY = "Comedy";
KalturaTubeMogulSyndicationFeedCategories.ENTERTAINMENT = "Entertainment";
KalturaTubeMogulSyndicationFeedCategories.MUSIC = "Music";
KalturaTubeMogulSyndicationFeedCategories.NEWS_AND_BLOGS = "News &amp; Blogs";
KalturaTubeMogulSyndicationFeedCategories.SCIENCE_AND_TECHNOLOGY = "Science &amp; Technology";
KalturaTubeMogulSyndicationFeedCategories.SPORTS = "Sports";
KalturaTubeMogulSyndicationFeedCategories.TRAVEL_AND_PLACES = "Travel &amp; Places";
KalturaTubeMogulSyndicationFeedCategories.VIDEO_GAMES = "Video Games";
KalturaTubeMogulSyndicationFeedCategories.ANIMALS_AND_PETS = "Animals &amp; Pets";
KalturaTubeMogulSyndicationFeedCategories.AUTOS = "Autos";
KalturaTubeMogulSyndicationFeedCategories.VLOGS_PEOPLE = "Vlogs &amp; People";
KalturaTubeMogulSyndicationFeedCategories.HOW_TO_INSTRUCTIONAL_DIY = "How To/Instructional/DIY";
KalturaTubeMogulSyndicationFeedCategories.COMMERCIALS_PROMOTIONAL = "Commercials/Promotional";
KalturaTubeMogulSyndicationFeedCategories.FAMILY_AND_KIDS = "Family &amp; Kids";

function KalturaTubeMogulSyndicationFeedOrderBy(){
}
KalturaTubeMogulSyndicationFeedOrderBy.PLAYLIST_ID_ASC = "+playlistId";
KalturaTubeMogulSyndicationFeedOrderBy.PLAYLIST_ID_DESC = "-playlistId";
KalturaTubeMogulSyndicationFeedOrderBy.NAME_ASC = "+name";
KalturaTubeMogulSyndicationFeedOrderBy.NAME_DESC = "-name";
KalturaTubeMogulSyndicationFeedOrderBy.TYPE_ASC = "+type";
KalturaTubeMogulSyndicationFeedOrderBy.TYPE_DESC = "-type";
KalturaTubeMogulSyndicationFeedOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaTubeMogulSyndicationFeedOrderBy.CREATED_AT_DESC = "-createdAt";

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

function KalturaUiConfOrderBy(){
}
KalturaUiConfOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaUiConfOrderBy.CREATED_AT_DESC = "-createdAt";

function KalturaUploadErrorCode(){
}
KalturaUploadErrorCode.NO_ERROR = 0;
KalturaUploadErrorCode.GENERAL_ERROR = 1;
KalturaUploadErrorCode.PARTIAL_UPLOAD = 2;

function KalturaUserOrderBy(){
}
KalturaUserOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaUserOrderBy.CREATED_AT_DESC = "-createdAt";

function KalturaUserStatus(){
}
KalturaUserStatus.BLOCKED = 0;
KalturaUserStatus.ACTIVE = 1;
KalturaUserStatus.DELETED = 2;

function KalturaVideoCodec(){
}
KalturaVideoCodec.NONE = "";
KalturaVideoCodec.VP6 = "vp6";
KalturaVideoCodec.H263 = "h263";
KalturaVideoCodec.H264 = "h264";
KalturaVideoCodec.FLV = "flv";

function KalturaWidgetOrderBy(){
}
KalturaWidgetOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaWidgetOrderBy.CREATED_AT_DESC = "-createdAt";

function KalturaWidgetSecurityType(){
}
KalturaWidgetSecurityType.NONE = 1;
KalturaWidgetSecurityType.TIMEHASH = 2;

function KalturaYahooSyndicationFeedAdultValues(){
}
KalturaYahooSyndicationFeedAdultValues.ADULT = "adult";
KalturaYahooSyndicationFeedAdultValues.NON_ADULT = "nonadult";

function KalturaYahooSyndicationFeedCategories(){
}
KalturaYahooSyndicationFeedCategories.ACTION = "Action";
KalturaYahooSyndicationFeedCategories.ART_AND_ANIMATION = "Art &amp; Animation";
KalturaYahooSyndicationFeedCategories.ENTERTAINMENT_AND_TV = "Entertainment &amp; TV";
KalturaYahooSyndicationFeedCategories.FOOD = "Food";
KalturaYahooSyndicationFeedCategories.GAMES = "Games";
KalturaYahooSyndicationFeedCategories.HOW_TO = "How-To";
KalturaYahooSyndicationFeedCategories.MUSIC = "Music";
KalturaYahooSyndicationFeedCategories.PEOPLE_AND_VLOGS = "People &amp; Vlogs";
KalturaYahooSyndicationFeedCategories.SCIENCE_AND_ENVIRONMENT = "Science &amp; Environment";
KalturaYahooSyndicationFeedCategories.TRANSPORTATION = "Transportation";
KalturaYahooSyndicationFeedCategories.ANIMALS = "Animals";
KalturaYahooSyndicationFeedCategories.COMMERCIALS = "Commercials";
KalturaYahooSyndicationFeedCategories.FAMILY = "Family";
KalturaYahooSyndicationFeedCategories.FUNNY_VIDEOS = "Funny Videos";
KalturaYahooSyndicationFeedCategories.HEALTH_AND_BEAUTY = "Health &amp; Beauty";
KalturaYahooSyndicationFeedCategories.MOVIES_AND_SHORTS = "Movies &amp; Shorts";
KalturaYahooSyndicationFeedCategories.NEWS_AND_POLITICS = "News &amp; Politics";
KalturaYahooSyndicationFeedCategories.PRODUCTS_AND_TECH = "Products &amp; Tech.";
KalturaYahooSyndicationFeedCategories.SPORTS = "Sports";
KalturaYahooSyndicationFeedCategories.TRAVEL = "Travel";

function KalturaYahooSyndicationFeedOrderBy(){
}
KalturaYahooSyndicationFeedOrderBy.PLAYLIST_ID_ASC = "+playlistId";
KalturaYahooSyndicationFeedOrderBy.PLAYLIST_ID_DESC = "-playlistId";
KalturaYahooSyndicationFeedOrderBy.NAME_ASC = "+name";
KalturaYahooSyndicationFeedOrderBy.NAME_DESC = "-name";
KalturaYahooSyndicationFeedOrderBy.TYPE_ASC = "+type";
KalturaYahooSyndicationFeedOrderBy.TYPE_DESC = "-type";
KalturaYahooSyndicationFeedOrderBy.CREATED_AT_ASC = "+createdAt";
KalturaYahooSyndicationFeedOrderBy.CREATED_AT_DESC = "-createdAt";
