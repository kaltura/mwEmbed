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

require_once(dirname(__FILE__) . "/../KalturaClientBase.php");
require_once(dirname(__FILE__) . "/../KalturaEnums.php");
require_once(dirname(__FILE__) . "/../KalturaTypes.php");

class KalturaVirusFoundAction
{
	const NONE = 0;
	const DELETE = 1;
	const CLEAN_NONE = 2;
	const CLEAN_DELETE = 3;
}

class KalturaVirusScanEngineType
{
	const SYMANTEC_SCAN_ENGINE = "symantecScanEngine.SymantecScanEngine";
	const SYMANTEC_SCAN_JAVA_ENGINE = "symantecScanEngine.SymantecScanJavaEngine";
	const SYMANTEC_SCAN_DIRECT_ENGINE = "symantecScanEngine.SymantecScanDirectEngine";
	const CLAMAV_SCAN_ENGINE = "clamAVScanEngine.ClamAV";
}

class KalturaVirusScanProfileOrderBy
{
	const CREATED_AT_ASC = "+createdAt";
	const CREATED_AT_DESC = "-createdAt";
	const UPDATED_AT_ASC = "+updatedAt";
	const UPDATED_AT_DESC = "-updatedAt";
}

class KalturaVirusScanProfileStatus
{
	const DISABLED = 1;
	const ENABLED = 2;
	const DELETED = 3;
}

abstract class KalturaVirusScanProfileBaseFilter extends KalturaFilter
{
	/**
	 * 
	 *
	 * @var int
	 */
	public $idEqual = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $idIn = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $createdAtGreaterThanOrEqual = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $createdAtLessThanOrEqual = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $updatedAtGreaterThanOrEqual = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $updatedAtLessThanOrEqual = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $partnerIdEqual = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $partnerIdIn = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $nameEqual = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $nameLike = null;

	/**
	 * 
	 *
	 * @var KalturaVirusScanProfileStatus
	 */
	public $statusEqual = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $statusIn = null;

	/**
	 * 
	 *
	 * @var KalturaVirusScanEngineType
	 */
	public $engineTypeEqual = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $engineTypeIn = null;


}

class KalturaVirusScanProfileFilter extends KalturaVirusScanProfileBaseFilter
{

}

class KalturaVirusScanProfile extends KalturaObjectBase
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
	 * @var int
	 * @readonly
	 */
	public $createdAt = null;

	/**
	 * 
	 *
	 * @var int
	 * @readonly
	 */
	public $updatedAt = null;

	/**
	 * 
	 *
	 * @var int
	 * @readonly
	 */
	public $partnerId = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $name = null;

	/**
	 * 
	 *
	 * @var KalturaVirusScanProfileStatus
	 */
	public $status = null;

	/**
	 * 
	 *
	 * @var KalturaVirusScanEngineType
	 */
	public $engineType = null;

	/**
	 * 
	 *
	 * @var KalturaBaseEntryFilter
	 */
	public $entryFilter;

	/**
	 * 
	 *
	 * @var KalturaVirusFoundAction
	 */
	public $actionIfInfected = null;


}

class KalturaVirusScanProfileListResponse extends KalturaObjectBase
{
	/**
	 * 
	 *
	 * @var array of KalturaVirusScanProfile
	 * @readonly
	 */
	public $objects;

	/**
	 * 
	 *
	 * @var int
	 * @readonly
	 */
	public $totalCount = null;


}


class KalturaVirusScanProfileService extends KalturaServiceBase
{
	function __construct(KalturaClient $client = null)
	{
		parent::__construct($client);
	}

	function listAction(KalturaVirusScanProfileFilter $filter = null, KalturaFilterPager $pager = null)
	{
		$kparams = array();
		if ($filter !== null)
			$this->client->addParam($kparams, "filter", $filter->toParams());
		if ($pager !== null)
			$this->client->addParam($kparams, "pager", $pager->toParams());
		$this->client->queueServiceActionCall("virusscan_virusscanprofile", "list", $kparams);
		if ($this->client->isMultiRequest())
			return $this->client->getMultiRequestResult();
		$resultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError($resultObject);
		$this->client->validateObjectType($resultObject, "KalturaVirusScanProfileListResponse");
		return $resultObject;
	}

	function add(KalturaVirusScanProfile $virusScanProfile)
	{
		$kparams = array();
		$this->client->addParam($kparams, "virusScanProfile", $virusScanProfile->toParams());
		$this->client->queueServiceActionCall("virusscan_virusscanprofile", "add", $kparams);
		if ($this->client->isMultiRequest())
			return $this->client->getMultiRequestResult();
		$resultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError($resultObject);
		$this->client->validateObjectType($resultObject, "KalturaVirusScanProfile");
		return $resultObject;
	}

	function get($virusScanProfileId)
	{
		$kparams = array();
		$this->client->addParam($kparams, "virusScanProfileId", $virusScanProfileId);
		$this->client->queueServiceActionCall("virusscan_virusscanprofile", "get", $kparams);
		if ($this->client->isMultiRequest())
			return $this->client->getMultiRequestResult();
		$resultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError($resultObject);
		$this->client->validateObjectType($resultObject, "KalturaVirusScanProfile");
		return $resultObject;
	}

	function update($virusScanProfileId, KalturaVirusScanProfile $virusScanProfile)
	{
		$kparams = array();
		$this->client->addParam($kparams, "virusScanProfileId", $virusScanProfileId);
		$this->client->addParam($kparams, "virusScanProfile", $virusScanProfile->toParams());
		$this->client->queueServiceActionCall("virusscan_virusscanprofile", "update", $kparams);
		if ($this->client->isMultiRequest())
			return $this->client->getMultiRequestResult();
		$resultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError($resultObject);
		$this->client->validateObjectType($resultObject, "KalturaVirusScanProfile");
		return $resultObject;
	}

	function delete($virusScanProfileId)
	{
		$kparams = array();
		$this->client->addParam($kparams, "virusScanProfileId", $virusScanProfileId);
		$this->client->queueServiceActionCall("virusscan_virusscanprofile", "delete", $kparams);
		if ($this->client->isMultiRequest())
			return $this->client->getMultiRequestResult();
		$resultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError($resultObject);
		$this->client->validateObjectType($resultObject, "KalturaVirusScanProfile");
		return $resultObject;
	}

	function scan($flavorAssetId, $virusScanProfileId = null)
	{
		$kparams = array();
		$this->client->addParam($kparams, "flavorAssetId", $flavorAssetId);
		$this->client->addParam($kparams, "virusScanProfileId", $virusScanProfileId);
		$this->client->queueServiceActionCall("virusscan_virusscanprofile", "scan", $kparams);
		if ($this->client->isMultiRequest())
			return $this->client->getMultiRequestResult();
		$resultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError($resultObject);
		$this->client->validateObjectType($resultObject, "integer");
		return $resultObject;
	}
}
class KalturaVirusScanClientPlugin extends KalturaClientPlugin
{
	/**
	 * @var KalturaVirusScanClientPlugin
	 */
	protected static $instance;

	/**
	 * @var KalturaVirusScanProfileService
	 */
	public $virusScanProfile = null;

	protected function __construct(KalturaClient $client)
	{
		parent::__construct($client);
		$this->virusScanProfile = new KalturaVirusScanProfileService($client);
	}

	/**
	 * @return KalturaVirusScanClientPlugin
	 */
	public static function get(KalturaClient $client)
	{
		if(!self::$instance)
			self::$instance = new KalturaVirusScanClientPlugin($client);
		return self::$instance;
	}

	/**
	 * @return array<KalturaServiceBase>
	 */
	public function getServices()
	{
		$services = array(
			'virusScanProfile' => $this->virusScanProfile,
		);
		return $services;
	}

	/**
	 * @return string
	 */
	public function getName()
	{
		return 'virusScan';
	}
}

