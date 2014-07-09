<?php

/**
 * @package Kaltura
 * @subpackage Client
 */
interface IKalturaClientPlugin
{
	/**
	 * @return KalturaClientPlugin
	 */
	public static function get(KalturaClient $client);

	/**
	 * @return array<KalturaServiceBase>
	 */
	public function getServices();

	/**
	 * @return string
	 */
	public function getName();
}

/**
 * @package Kaltura
 * @subpackage Client
 */
abstract class KalturaClientPlugin implements IKalturaClientPlugin
{
	protected function __construct(KalturaClient $client)
	{

	}
}

/**
 * Abstract base class for all client services
 *
 * @package Kaltura
 * @subpackage Client
 */
abstract class KalturaServiceBase
{
	/**
	 * @var KalturaClient
	 */
	protected $client;

	/**
	 * Initialize the service keeping reference to the KalturaClient
	 *
	 * @param KalturaClient $client
	 */
	public function __construct(KalturaClient $client = null)
	{
		$this->client = $client;
	}

	/**
	 * @param KalturaClient $client
	 */
	public function setClient(KalturaClient $client)
	{
		$this->client = $client;
	}
}
/**
 * Abstract base class for all client objects
 *
 * @package Kaltura
 * @subpackage Client
 */
abstract class KalturaObjectBase
{
	public function __construct($params = array())
	{
		foreach ($params as $key => $value)
		{
			if (!property_exists($this, $key))
				throw new KalturaClientException("property [{$key}] does not exist on object [".get_class($this)."]", KalturaClientException::ERROR_INVALID_OBJECT_FIELD);
			$this->$key = $value;
		}
	}

	protected function addIfNotNull(&$params, $paramName, $paramValue)
	{
		if ($paramValue !== null)
		{
			if($paramValue instanceof KalturaObjectBase)
			{
				$params[$paramName] = $paramValue->toParams();
			}
			else
			{
				$params[$paramName] = $paramValue;
			}
		}
	}

	public function toParams()
	{
		$params = array();
		$params["objectType"] = get_class($this);
	    foreach($this as $prop => $val)
		{
			$this->addIfNotNull($params, $prop, $val);
		}
		return $params;
	}
}
/**
 * @package Kaltura
 * @subpackage Client
 */
class KalturaException extends Exception
{
    public function __construct($message, $code)
    {
    	$this->code = $code;
		parent::__construct($message);
    }
}

/**
 * @package Kaltura
 * @subpackage Client
 */
class KalturaClientException extends Exception
{
	const ERROR_GENERIC = -1;
	const ERROR_UNSERIALIZE_FAILED = -2;
	const ERROR_FORMAT_NOT_SUPPORTED = -3;
	const ERROR_UPLOAD_NOT_SUPPORTED = -4;
	const ERROR_CONNECTION_FAILED = -5;
	const ERROR_READ_FAILED = -6;
	const ERROR_INVALID_PARTNER_ID = -7;
	const ERROR_INVALID_OBJECT_TYPE = -8;
	const ERROR_INVALID_OBJECT_FIELD = -9;
	const ERROR_DOWNLOAD_NOT_SUPPORTED = -10;
	const ERROR_DOWNLOAD_IN_MULTIREQUEST = -11;
}
?>