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
require_once(dirname(__FILE__) . "/KalturaCaptionClientPlugin.php");

class KalturaCaptionAssetItemFilter extends KalturaCaptionAssetFilter
{
	/**
	 * 
	 *
	 * @var string
	 */
	public $contentLike = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $contentMultiLikeOr = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $contentMultiLikeAnd = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $partnerDescriptionLike = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $partnerDescriptionMultiLikeOr = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $partnerDescriptionMultiLikeAnd = null;

	/**
	 * 
	 *
	 * @var KalturaLanguage
	 */
	public $languageEqual = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $languageIn = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $labelEqual = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $labelIn = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $startTimeGreaterThanOrEqual = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $startTimeLessThanOrEqual = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $endTimeGreaterThanOrEqual = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $endTimeLessThanOrEqual = null;


}

class KalturaCaptionAssetItem extends KalturaObjectBase
{
	/**
	 * The Caption Asset object
	 * 
	 *
	 * @var KalturaCaptionAsset
	 */
	public $asset;

	/**
	 * The entry object
	 * 
	 *
	 * @var KalturaBaseEntry
	 */
	public $entry;

	/**
	 * 
	 *
	 * @var int
	 */
	public $startTime = null;

	/**
	 * 
	 *
	 * @var int
	 */
	public $endTime = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $content = null;


}

class KalturaCaptionAssetItemListResponse extends KalturaObjectBase
{
	/**
	 * 
	 *
	 * @var array of KalturaCaptionAssetItem
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


class KalturaCaptionAssetItemService extends KalturaServiceBase
{
	function __construct(KalturaClient $client = null)
	{
		parent::__construct($client);
	}

	function search(KalturaBaseEntryFilter $entryFilter = null, KalturaCaptionAssetItemFilter $captionAssetItemFilter = null, KalturaFilterPager $captionAssetItemPager = null)
	{
		$kparams = array();
		if ($entryFilter !== null)
			$this->client->addParam($kparams, "entryFilter", $entryFilter->toParams());
		if ($captionAssetItemFilter !== null)
			$this->client->addParam($kparams, "captionAssetItemFilter", $captionAssetItemFilter->toParams());
		if ($captionAssetItemPager !== null)
			$this->client->addParam($kparams, "captionAssetItemPager", $captionAssetItemPager->toParams());
		$this->client->queueServiceActionCall("captionsearch_captionassetitem", "search", $kparams);
		if ($this->client->isMultiRequest())
			return $this->client->getMultiRequestResult();
		$resultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError($resultObject);
		$this->client->validateObjectType($resultObject, "KalturaCaptionAssetItemListResponse");
		return $resultObject;
	}
}
class KalturaCaptionSearchClientPlugin extends KalturaClientPlugin
{
	/**
	 * @var KalturaCaptionSearchClientPlugin
	 */
	protected static $instance;

	/**
	 * @var KalturaCaptionAssetItemService
	 */
	public $captionAssetItem = null;

	protected function __construct(KalturaClient $client)
	{
		parent::__construct($client);
		$this->captionAssetItem = new KalturaCaptionAssetItemService($client);
	}

	/**
	 * @return KalturaCaptionSearchClientPlugin
	 */
	public static function get(KalturaClient $client)
	{
		if(!self::$instance)
			self::$instance = new KalturaCaptionSearchClientPlugin($client);
		return self::$instance;
	}

	/**
	 * @return array<KalturaServiceBase>
	 */
	public function getServices()
	{
		$services = array(
			'captionAssetItem' => $this->captionAssetItem,
		);
		return $services;
	}

	/**
	 * @return string
	 */
	public function getName()
	{
		return 'captionSearch';
	}
}

