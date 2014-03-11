<?php
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
 * @package Kaltura
 * @subpackage Client
 */
require_once(dirname(__FILE__) . "/../KalturaClientBase.php");
require_once(dirname(__FILE__) . "/../KalturaEnums.php");
require_once(dirname(__FILE__) . "/../KalturaTypes.php");

/**
 * @package Kaltura
 * @subpackage Client
 */
class KalturaSystemPartnerLimitType
{
	const ACCESS_CONTROLS = "ACCESS_CONTROLS";
	const ADMIN_LOGIN_USERS = "ADMIN_LOGIN_USERS";
	const BULK_SIZE = "BULK_SIZE";
	const END_USERS = "END_USERS";
	const ENTRIES = "ENTRIES";
	const LIVE_STREAM_INPUTS = "LIVE_STREAM_INPUTS";
	const LIVE_STREAM_OUTPUTS = "LIVE_STREAM_OUTPUTS";
	const LOGIN_USERS = "LOGIN_USERS";
	const MONTHLY_BANDWIDTH = "MONTHLY_BANDWIDTH";
	const MONTHLY_STORAGE = "MONTHLY_STORAGE";
	const MONTHLY_STORAGE_AND_BANDWIDTH = "MONTHLY_STORAGE_AND_BANDWIDTH";
	const MONTHLY_STREAM_ENTRIES = "MONTHLY_STREAM_ENTRIES";
	const PUBLISHERS = "PUBLISHERS";
	const USER_LOGIN_ATTEMPTS = "USER_LOGIN_ATTEMPTS";
}

/**
 * @package Kaltura
 * @subpackage Client
 */
class KalturaSystemPartnerLimit extends KalturaObjectBase
{
	/**
	 * 
	 *
	 * @var KalturaSystemPartnerLimitType
	 */
	public $type = null;

	/**
	 * 
	 *
	 * @var float
	 */
	public $max = null;


}

/**
 * @package Kaltura
 * @subpackage Client
 */
class KalturaSystemPartnerConfiguration extends KalturaObjectBase
{
	/**
	 * 
	 *
	 * @var int
	 * @readonly
	 */
	public $id = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $partnerName = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $description = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $adminName = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $adminEmail = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $host = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $cdnHost = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $thumbnailHost = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $partnerPackage = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $monitorUsage = null;

	/**
	 * 
	 *
	 * @var bool
	 */
	public $moderateContent = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $rtmpUrl = null;

	/**
	 * 
	 *
	 * @var bool
	 */
	public $storageDeleteFromKaltura = null;

	/**
	 * 
	 *
	 * @var KalturaStorageServePriority
	 */
	public $storageServePriority = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $kmcVersion = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $restrictThumbnailByKs = null;

	/**
	 * 
	 *
	 * @var bool
	 */
	public $supportAnimatedThumbnails = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $defThumbOffset = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $defThumbDensity = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $userSessionRoleId = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $adminSessionRoleId = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $alwaysAllowedPermissionNames = null;

	/**
	 * 
	 *
	 * @var bool
	 */
	public $importRemoteSourceForConvert = null;

	/**
	 * 
	 *
	 * @var array of KalturaPermission
	 */
	public $permissions;

	/**
	 * 
	 *
	 * @var string
	 */
	public $notificationsConfig = null;

	/**
	 * 
	 *
	 * @var bool
	 */
	public $allowMultiNotification = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $loginBlockPeriod = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $numPrevPassToKeep = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $passReplaceFreq = null;

	/**
	 * 
	 *
	 * @var bool
	 */
	public $isFirstLogin = null;

	/**
	 * 
	 *
	 * @var KalturaPartnerGroupType
	 */
	public $partnerGroupType = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $partnerParentId = null;

	/**
	 * 
	 *
	 * @var array of KalturaSystemPartnerLimit
	 */
	public $limits;

	/**
	 * http/rtmp/hdnetwork
	 * 	 
	 *
	 * @var string
	 */
	public $streamerType = null;

	/**
	 * http/https, rtmp/rtmpe
	 * 	 
	 *
	 * @var string
	 */
	public $mediaProtocol = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $extendedFreeTrailExpiryReason = null;

	/**
	 * Unix timestamp (In seconds)
	 * 	 
	 *
	 * @var int
	 */
	public $extendedFreeTrailExpiryDate = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $extendedFreeTrail = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $crmId = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $crmLink = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $verticalClasiffication = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $partnerPackageClassOfService = null;

	/**
	 * 
	 *
	 * @var bool
	 */
	public $enableBulkUploadNotificationsEmails = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $deliveryRestrictions = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $bulkUploadNotificationsEmail = null;

	/**
	 * 
	 *
	 * @var bool
	 */
	public $internalUse = null;

	/**
	 * 
	 *
	 * @var KalturaSourceType
	 */
	public $defaultLiveStreamEntrySourceType = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $liveStreamProvisionParams = null;

	/**
	 * 
	 *
	 * @var KalturaBaseEntryFilter
	 */
	public $autoModerateEntryFilter;

	/**
	 * 
	 *
	 * @var string
	 */
	public $logoutUrl = null;

	/**
	 * 
	 *
	 * @var bool
	 */
	public $defaultEntitlementEnforcement = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $cacheFlavorVersion = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $apiAccessControlId = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $defaultDeliveryType = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $defaultEmbedCodeType = null;

	/**
	 * 
	 *
	 * @var array of KalturaString
	 */
	public $disabledDeliveryTypes;

	/**
	 * 
	 *
	 * @var bool
	 */
	public $restrictEntryByMetadata = null;

	/**
	 * 
	 *
	 * @var KalturaLanguageCode
	 */
	public $language = null;


}

/**
 * @package Kaltura
 * @subpackage Client
 */
class KalturaSystemPartnerPackage extends KalturaObjectBase
{
	/**
	 * 
	 *
	 * @var int
	 */
	public $id = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $name = null;


}

/**
 * @package Kaltura
 * @subpackage Client
 */
class KalturaSystemPartnerUsageItem extends KalturaObjectBase
{
	/**
	 * Partner ID
	 * 	 
	 *
	 * @var int
	 */
	public $partnerId = null;

	/**
	 * Partner name
	 * 	 
	 *
	 * @var string
	 */
	public $partnerName = null;

	/**
	 * Partner status
	 * 	 
	 *
	 * @var KalturaPartnerStatus
	 */
	public $partnerStatus = null;

	/**
	 * Partner package
	 * 	 
	 *
	 * @var int
	 */
	public $partnerPackage = null;

	/**
	 * Partner creation date (Unix timestamp)
	 * 	 
	 *
	 * @var int
	 */
	public $partnerCreatedAt = null;

	/**
	 * Number of player loads in the specific date range
	 * 	 
	 *
	 * @var int
	 */
	public $views = null;

	/**
	 * Number of plays in the specific date range
	 * 	 
	 *
	 * @var int
	 */
	public $plays = null;

	/**
	 * Number of new entries created during specific date range
	 * 	 
	 *
	 * @var int
	 */
	public $entriesCount = null;

	/**
	 * Total number of entries
	 * 	 
	 *
	 * @var int
	 */
	public $totalEntriesCount = null;

	/**
	 * Number of new video entries created during specific date range
	 * 	 
	 *
	 * @var int
	 */
	public $videoEntriesCount = null;

	/**
	 * Number of new image entries created during specific date range
	 * 	 
	 *
	 * @var int
	 */
	public $imageEntriesCount = null;

	/**
	 * Number of new audio entries created during specific date range
	 * 	 
	 *
	 * @var int
	 */
	public $audioEntriesCount = null;

	/**
	 * Number of new mix entries created during specific date range
	 * 	 
	 *
	 * @var int
	 */
	public $mixEntriesCount = null;

	/**
	 * The total bandwidth usage during the given date range (in MB)
	 * 	 
	 *
	 * @var float
	 */
	public $bandwidth = null;

	/**
	 * The total storage consumption (in MB)
	 * 	 
	 *
	 * @var float
	 */
	public $totalStorage = null;

	/**
	 * The change in storage consumption (new uploads) during the given date range (in MB)
	 * 	 
	 *
	 * @var float
	 */
	public $storage = null;

	/**
	 * The peak amount of storage consumption during the given date range for the specific publisher
	 * 	 
	 *
	 * @var float
	 */
	public $peakStorage = null;

	/**
	 * The average amount of storage consumption during the given date range for the specific publisher
	 * 	 
	 *
	 * @var float
	 */
	public $avgStorage = null;

	/**
	 * The combined amount of bandwidth and storage consumed during the given date range for the specific publisher
	 * 	 
	 *
	 * @var float
	 */
	public $combinedBandwidthStorage = null;

	/**
	 * Amount of deleted storage in MB
	 * 	 
	 *
	 * @var float
	 */
	public $deletedStorage = null;

	/**
	 * Amount of transcoding usage in MB
	 * 	 
	 *
	 * @var float
	 */
	public $transcodingUsage = null;


}

/**
 * @package Kaltura
 * @subpackage Client
 */
class KalturaSystemPartnerUsageListResponse extends KalturaObjectBase
{
	/**
	 * 
	 *
	 * @var array of KalturaSystemPartnerUsageItem
	 */
	public $objects;

	/**
	 * 
	 *
	 * @var int
	 */
	public $totalCount = null;


}

/**
 * @package Kaltura
 * @subpackage Client
 */
class KalturaSystemPartnerOveragedLimit extends KalturaSystemPartnerLimit
{
	/**
	 * 
	 *
	 * @var float
	 */
	public $overagePrice = null;

	/**
	 * 
	 *
	 * @var float
	 */
	public $overageUnit = null;


}

/**
 * @package Kaltura
 * @subpackage Client
 */
class KalturaSystemPartnerUsageFilter extends KalturaFilter
{
	/**
	 * Date range from
	 * 	 
	 *
	 * @var int
	 */
	public $fromDate = null;

	/**
	 * Date range to
	 * 	 
	 *
	 * @var int
	 */
	public $toDate = null;

	/**
	 * Time zone offset
	 * 	 
	 *
	 * @var int
	 */
	public $timezoneOffset = null;


}

/**
 * @package Kaltura
 * @subpackage Client
 */
class KalturaSystemPartnerFilter extends KalturaPartnerFilter
{
	/**
	 * 
	 *
	 * @var int
	 */
	public $partnerParentIdEqual = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $partnerParentIdIn = null;


}


/**
 * @package Kaltura
 * @subpackage Client
 */
class KalturaSystemPartnerService extends KalturaServiceBase
{
	function __construct(KalturaClient $client = null)
	{
		parent::__construct($client);
	}

	/**
	 * Retrieve all info about partner
	 This service gets partner id as parameter and accessable to the admin console partner only
	 * 
	 * @param int $partnerId X
	 * @return KalturaPartner
	 */
	function get($partnerId)
	{
		$kparams = array();
		$this->client->addParam($kparams, "partnerId", $partnerId);
		$this->client->queueServiceActionCall("systempartner_systempartner", "get", $kparams);
		if ($this->client->isMultiRequest())
			return $this->client->getMultiRequestResult();
		$resultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError($resultObject);
		$this->client->validateObjectType($resultObject, "KalturaPartner");
		return $resultObject;
	}

	/**
	 * 
	 * 
	 * @param KalturaPartnerFilter $partnerFilter 
	 * @param KalturaSystemPartnerUsageFilter $usageFilter 
	 * @param KalturaFilterPager $pager 
	 * @return KalturaSystemPartnerUsageListResponse
	 */
	function getUsage(KalturaPartnerFilter $partnerFilter = null, KalturaSystemPartnerUsageFilter $usageFilter = null, KalturaFilterPager $pager = null)
	{
		$kparams = array();
		if ($partnerFilter !== null)
			$this->client->addParam($kparams, "partnerFilter", $partnerFilter->toParams());
		if ($usageFilter !== null)
			$this->client->addParam($kparams, "usageFilter", $usageFilter->toParams());
		if ($pager !== null)
			$this->client->addParam($kparams, "pager", $pager->toParams());
		$this->client->queueServiceActionCall("systempartner_systempartner", "getUsage", $kparams);
		if ($this->client->isMultiRequest())
			return $this->client->getMultiRequestResult();
		$resultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError($resultObject);
		$this->client->validateObjectType($resultObject, "KalturaSystemPartnerUsageListResponse");
		return $resultObject;
	}

	/**
	 * 
	 * 
	 * @param KalturaPartnerFilter $filter 
	 * @param KalturaFilterPager $pager 
	 * @return KalturaPartnerListResponse
	 */
	function listAction(KalturaPartnerFilter $filter = null, KalturaFilterPager $pager = null)
	{
		$kparams = array();
		if ($filter !== null)
			$this->client->addParam($kparams, "filter", $filter->toParams());
		if ($pager !== null)
			$this->client->addParam($kparams, "pager", $pager->toParams());
		$this->client->queueServiceActionCall("systempartner_systempartner", "list", $kparams);
		if ($this->client->isMultiRequest())
			return $this->client->getMultiRequestResult();
		$resultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError($resultObject);
		$this->client->validateObjectType($resultObject, "KalturaPartnerListResponse");
		return $resultObject;
	}

	/**
	 * 
	 * 
	 * @param int $partnerId 
	 * @param int $status 
	 * @param string $reason 
	 * @return 
	 */
	function updateStatus($partnerId, $status, $reason)
	{
		$kparams = array();
		$this->client->addParam($kparams, "partnerId", $partnerId);
		$this->client->addParam($kparams, "status", $status);
		$this->client->addParam($kparams, "reason", $reason);
		$this->client->queueServiceActionCall("systempartner_systempartner", "updateStatus", $kparams);
		if ($this->client->isMultiRequest())
			return $this->client->getMultiRequestResult();
		$resultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError($resultObject);
		$this->client->validateObjectType($resultObject, "null");
		return $resultObject;
	}

	/**
	 * 
	 * 
	 * @param int $partnerId 
	 * @param string $userId 
	 * @return string
	 */
	function getAdminSession($partnerId, $userId = null)
	{
		$kparams = array();
		$this->client->addParam($kparams, "partnerId", $partnerId);
		$this->client->addParam($kparams, "userId", $userId);
		$this->client->queueServiceActionCall("systempartner_systempartner", "getAdminSession", $kparams);
		if ($this->client->isMultiRequest())
			return $this->client->getMultiRequestResult();
		$resultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError($resultObject);
		$this->client->validateObjectType($resultObject, "string");
		return $resultObject;
	}

	/**
	 * 
	 * 
	 * @param int $partnerId 
	 * @param KalturaSystemPartnerConfiguration $configuration 
	 * @return 
	 */
	function updateConfiguration($partnerId, KalturaSystemPartnerConfiguration $configuration)
	{
		$kparams = array();
		$this->client->addParam($kparams, "partnerId", $partnerId);
		$this->client->addParam($kparams, "configuration", $configuration->toParams());
		$this->client->queueServiceActionCall("systempartner_systempartner", "updateConfiguration", $kparams);
		if ($this->client->isMultiRequest())
			return $this->client->getMultiRequestResult();
		$resultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError($resultObject);
		$this->client->validateObjectType($resultObject, "null");
		return $resultObject;
	}

	/**
	 * 
	 * 
	 * @param int $partnerId 
	 * @return KalturaSystemPartnerConfiguration
	 */
	function getConfiguration($partnerId)
	{
		$kparams = array();
		$this->client->addParam($kparams, "partnerId", $partnerId);
		$this->client->queueServiceActionCall("systempartner_systempartner", "getConfiguration", $kparams);
		if ($this->client->isMultiRequest())
			return $this->client->getMultiRequestResult();
		$resultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError($resultObject);
		$this->client->validateObjectType($resultObject, "KalturaSystemPartnerConfiguration");
		return $resultObject;
	}

	/**
	 * 
	 * 
	 * @return array
	 */
	function getPackages()
	{
		$kparams = array();
		$this->client->queueServiceActionCall("systempartner_systempartner", "getPackages", $kparams);
		if ($this->client->isMultiRequest())
			return $this->client->getMultiRequestResult();
		$resultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError($resultObject);
		$this->client->validateObjectType($resultObject, "array");
		return $resultObject;
	}

	/**
	 * 
	 * 
	 * @return array
	 */
	function getPackagesClassOfService()
	{
		$kparams = array();
		$this->client->queueServiceActionCall("systempartner_systempartner", "getPackagesClassOfService", $kparams);
		if ($this->client->isMultiRequest())
			return $this->client->getMultiRequestResult();
		$resultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError($resultObject);
		$this->client->validateObjectType($resultObject, "array");
		return $resultObject;
	}

	/**
	 * 
	 * 
	 * @return array
	 */
	function getPackagesVertical()
	{
		$kparams = array();
		$this->client->queueServiceActionCall("systempartner_systempartner", "getPackagesVertical", $kparams);
		if ($this->client->isMultiRequest())
			return $this->client->getMultiRequestResult();
		$resultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError($resultObject);
		$this->client->validateObjectType($resultObject, "array");
		return $resultObject;
	}

	/**
	 * 
	 * 
	 * @return array
	 */
	function getPlayerEmbedCodeTypes()
	{
		$kparams = array();
		$this->client->queueServiceActionCall("systempartner_systempartner", "getPlayerEmbedCodeTypes", $kparams);
		if ($this->client->isMultiRequest())
			return $this->client->getMultiRequestResult();
		$resultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError($resultObject);
		$this->client->validateObjectType($resultObject, "array");
		return $resultObject;
	}

	/**
	 * 
	 * 
	 * @return array
	 */
	function getPlayerDeliveryTypes()
	{
		$kparams = array();
		$this->client->queueServiceActionCall("systempartner_systempartner", "getPlayerDeliveryTypes", $kparams);
		if ($this->client->isMultiRequest())
			return $this->client->getMultiRequestResult();
		$resultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError($resultObject);
		$this->client->validateObjectType($resultObject, "array");
		return $resultObject;
	}

	/**
	 * 
	 * 
	 * @param string $userId 
	 * @param int $partnerId 
	 * @param string $newPassword 
	 * @return 
	 */
	function resetUserPassword($userId, $partnerId, $newPassword)
	{
		$kparams = array();
		$this->client->addParam($kparams, "userId", $userId);
		$this->client->addParam($kparams, "partnerId", $partnerId);
		$this->client->addParam($kparams, "newPassword", $newPassword);
		$this->client->queueServiceActionCall("systempartner_systempartner", "resetUserPassword", $kparams);
		if ($this->client->isMultiRequest())
			return $this->client->getMultiRequestResult();
		$resultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError($resultObject);
		$this->client->validateObjectType($resultObject, "null");
		return $resultObject;
	}

	/**
	 * 
	 * 
	 * @param KalturaUserLoginDataFilter $filter 
	 * @param KalturaFilterPager $pager 
	 * @return KalturaUserLoginDataListResponse
	 */
	function listUserLoginData(KalturaUserLoginDataFilter $filter = null, KalturaFilterPager $pager = null)
	{
		$kparams = array();
		if ($filter !== null)
			$this->client->addParam($kparams, "filter", $filter->toParams());
		if ($pager !== null)
			$this->client->addParam($kparams, "pager", $pager->toParams());
		$this->client->queueServiceActionCall("systempartner_systempartner", "listUserLoginData", $kparams);
		if ($this->client->isMultiRequest())
			return $this->client->getMultiRequestResult();
		$resultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError($resultObject);
		$this->client->validateObjectType($resultObject, "KalturaUserLoginDataListResponse");
		return $resultObject;
	}
}
/**
 * @package Kaltura
 * @subpackage Client
 */
class KalturaSystemPartnerClientPlugin extends KalturaClientPlugin
{
	/**
	 * @var KalturaSystemPartnerService
	 */
	public $systemPartner = null;

	protected function __construct(KalturaClient $client)
	{
		parent::__construct($client);
		$this->systemPartner = new KalturaSystemPartnerService($client);
	}

	/**
	 * @return KalturaSystemPartnerClientPlugin
	 */
	public static function get(KalturaClient $client)
	{
		return new KalturaSystemPartnerClientPlugin($client);
	}

	/**
	 * @return array<KalturaServiceBase>
	 */
	public function getServices()
	{
		$services = array(
			'systemPartner' => $this->systemPartner,
		);
		return $services;
	}

	/**
	 * @return string
	 */
	public function getName()
	{
		return 'systemPartner';
	}
}

