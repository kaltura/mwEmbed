<?php
require_once(dirname(__FILE__) . "/../KalturaClientBase.php");
require_once(dirname(__FILE__) . "/../KalturaEnums.php");
require_once(dirname(__FILE__) . "/../KalturaTypes.php");

class KalturaStatsKey extends KalturaObjectBase
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
	public $parentId = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $name = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $type = null;

	/**
	 * 
	 *
	 * @var string
	 */
	public $isLeaf = null;


}

class KalturaStatsKeyListResponse extends KalturaObjectBase
{
	/**
	 * 
	 *
	 * @var array of KalturaStatsKey
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


class KalturaStatskeyService extends KalturaServiceBase
{
	function __construct(KalturaClient $client = null)
	{
		parent::__construct($client);
	}

	function listDescendants($id)
	{
		$kparams = array();
		$this->client->addParam($kparams, "id", $id);
		$this->client->queueServiceActionCall("statskey_statskey", "listDescendants", $kparams);
		if ($this->client->isMultiRequest())
			return null;
		$resultObject = $this->client->doQueue();
		$this->client->throwExceptionIfError($resultObject);
		$this->client->validateObjectType($resultObject, "KalturaStatsKeyListResponse");
		return $resultObject;
	}
}
class KalturaStatskeyClientPlugin extends KalturaClientPlugin
{
	/**
	 * @var KalturaStatskeyClientPlugin
	 */
	protected static $instance;

	/**
	 * @var KalturaStatskeyService
	 */
	public $Statskey = null;

	protected function __construct(KalturaClient $client)
	{
		parent::__construct($client);
		$this->Statskey = new KalturaStatskeyService($client);
	}

	/**
	 * @return KalturaStatskeyClientPlugin
	 */
	public static function get(KalturaClient $client)
	{
		if(!self::$instance)
			self::$instance = new KalturaStatskeyClientPlugin($client);
		return self::$instance;
	}

	/**
	 * @return array<KalturaServiceBase>
	 */
	public function getServices()
	{
		$services = array(
			'Statskey' => $this->Statskey,
		);
		return $services;
	}

	/**
	 * @return string
	 */
	public function getName()
	{
		return 'statskey';
	}
}

