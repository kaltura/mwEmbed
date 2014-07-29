<?php
/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * AMQPAppender appends log events to a AMQP.
 *
 * This appender uses a layout.
 * Compatible with php_amqp versions: 1.0.8 - 1.3.0
 *
 * This class was originally contributed by Dmitry Ulyanov.
 *
 * ## Configurable parameters: ##
 *
 * - **host** - Server on which AMQP instance is located.
 * - **port** - Port on which the instance is bound.
 * - **vhost** - The name of the "virtual host".
 * - **login** - Login used to connect to the AMQP server.
 * - **password** - Password used to connect to the AMQP server.
 * - **exchangeName** - Name of AMQP exchange which used to routing logs.
 * - **exchangeType** - Type of AMQP exchange (direct | fanout). "direct" type is default.
 * - **routingKey** - Routing key which used to routing logs. Set up AMQP server
 *     to route messages with this key to your queue
 * - **contentType** - AMQP message "content-type" header. Example: "application/json", "application/octet-stream".
 *     Default - "text/plain".
 * - **contentEncoding** - AMQP message "content-encoding" header. Default - "UTF-8".
 * - **flushOnShutdown** - Stash logs and send on shutdown or send immediately.
 *     You can show content before start sending logs to AMQP. Disabled by default.
 * - **connectionTimeout** - Connection timeout (in seconds). Default is 0.5.
 *
 * @package log4php
 * @subpackage appenders
 * @since 2.4.0
 * @author Dmitry Ulyanov dmitriy.ulyanov@wikimart.ru
 * @license http://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0
 * @link http://logging.apache.org/log4php/docs/appenders/amqp.html Appender documentation
 * @link http://github.com/d-ulyanov/log4php-graylog2 Dmitry Ulyanov's original submission
 * @link http://www.rabbitmq.com/ RabbitMQ website
 */
class LoggerAppenderAMQP extends LoggerAppender
{
    /** Default value for {@link $host} */
    const DEFAULT_AMQP_HOST = 'localhost';

    /** Default value for {@link $port} */
    const DEFAULT_AMQP_PORT = 5672;

    /** Default value for {@link $vhost} */
    const DEFAULT_AMQP_VHOST = '/';

    /** Default value for {@link $login} */
    const DEFAULT_AMQP_LOGIN = 'guest';

    /** Default value for {@link $password} */
    const DEFAULT_AMQP_PASSWORD = 'guest';


    /**
     * Server on which AMQP instance is located
     * @var string
     */
    protected $host = self::DEFAULT_AMQP_HOST;

    /**
     * Port on which the instance is bound
     * @var int
     */
    protected $port = self::DEFAULT_AMQP_PORT;

    /**
     * The name of the "virtual host"
     * @var string
     */
    protected $vhost = self::DEFAULT_AMQP_VHOST;

    /**
     * Login used to connect to the AMQP server
     * @var string
     */
    protected $login = self::DEFAULT_AMQP_LOGIN;

    /**
     * Password used to connect to the AMQP server
     * @var string
     */
    protected $password = self::DEFAULT_AMQP_PASSWORD;

    /**
     * Name of AMQP exchange which used to routing logs
     * @var string
     */
    protected $exchangeName;

    /**
     * Type of AMQP exchange
     * @var string
     */
    protected $exchangeType = 'direct';

    /**
     * Routing key which used to routing logs
     * @var string
     */
    protected $routingKey;

    /**
     * Connection timeout in seconds
     * @var float
     */
    protected $connectionTimeout = 0.5;

    /**
     * Content-type header
     * @var string
     */
    protected $contentType = 'text/plain';

    /**
     * Content-encoding header
     * @var string
     */
    protected $contentEncoding = 'UTF-8';

    /**
     * Send logs immediately or stash it and send on shutdown
     * @var boolean
     */
    protected $flushOnShutdown = false;

    /**
     * @var AMQPConnection
     */
    protected $AMQPConnection;

    /**
     * @var AMQPExchange
     */
    protected $AMQPExchange;

    /**
     * Stashed logs
     * @var array
     */
    protected $logsStash = array();

    /**
     * Forwards the logging event to the AMQP.
     * @param LoggerLoggingEvent $event
     */
    protected function append(LoggerLoggingEvent $event)
    {
        $this->processLog(
            $this->layout->format($event),
            $this->getFlushOnShutdown()
        );
    }

    /**
     * @param string $message
     * @param boolean $flushOnShutdown
     */
    public function processLog($message, $flushOnShutdown)
    {
        if ($flushOnShutdown) {
            $this->stashLog($message);
        } else {
            $this->sendLogToAMQP($message);
        }
    }

    /**
     * Setup AMQP connection.
     * Based on defined options, this method connects to the AMQP
     * and creates a {@link $AMQPConnection} and {@link $AMQPExchange}.
     */
    public function activateOptions() {
        try {
            $connection = $this->createAMQPConnection(
                $this->getHost(),
                $this->getPort(),
                $this->getVhost(),
                $this->getLogin(),
                $this->getPassword(),
                $this->getConnectionTimeout()
            );

            $this->setAMQPConnection($connection);

            $exchange = $this->createAMQPExchange(
                $connection,
                $this->getExchangeName(),
                $this->getExchangeType()
            );

            $this->setAMQPExchange($exchange);
        } catch (AMQPConnectionException $e) {
            $this->closed = true;
            $this->warn(sprintf('Failed to connect to amqp server: %s', $e->getMessage()));
        } catch (AMQPChannelException $e) {
            $this->closed = true;
            $this->warn(sprintf('Failed to open amqp channel: %s', $e->getMessage()));
        } catch (AMQPExchangeException $e) {
            $this->closed = true;
            $this->warn(sprintf('Failed to declare amqp exchange: %s', $e->getMessage()));
        } catch (Exception $e) {
            $this->closed = true;
            $this->warn(sprintf('Amqp connection exception: %s', $e->getMessage()));
        }
    }

    /**
     * @param string $host
     * @param int $port
     * @param string $vhost
     * @param string $login
     * @param string $password
     * @param float $connectionTimeout
     * @return AMQPConnection
     * @throws AMQPConnectionException
     * @throws Exception
     */
    protected function createAMQPConnection($host, $port, $vhost, $login, $password, $connectionTimeout)
    {
        $connection = new AMQPConnection();
        $connection->setHost($host);
        $connection->setPort($port);
        $connection->setVhost($vhost);
        $connection->setLogin($login);
        $connection->setPassword($password);
        $connection->setReadTimeout($connectionTimeout);

        if (!$connection->connect()) {
            throw new Exception('Cannot connect to the broker');
        }
        return $connection;
    }

    /**
     * @param AMQPConnection $AMQPConnection
     * @param $exchangeName
     * @param $exchangeType
     * @return AMQPExchange
     * @throws AMQPConnectionException
     * @throws AMQPExchangeException
     * @throws Exception
     */
    protected function createAMQPExchange($AMQPConnection, $exchangeName, $exchangeType)
    {
        $channel = new AMQPChannel($AMQPConnection);
        $exchange = new AMQPExchange($channel);
        $exchange->setName($exchangeName);
        $exchange->setType($exchangeType);
        $exchange->setFlags(AMQP_DURABLE);

        // Since php_amqp 1.2.0: deprecate AMQPExchange::declare() in favor of AMQPExchange::declareExchange()
        $declareMethodName = method_exists($exchange, 'declareExchange') ? 'declareExchange' : 'declare';

        if (!$exchange->$declareMethodName()) {
            throw new Exception('Cannot declare exchange');
        }

        return $exchange;
    }

    /**
     * @param AMQPConnection $AMQPConnection
     */
    protected function setAMQPConnection($AMQPConnection)
    {
        $this->AMQPConnection = $AMQPConnection;
    }

    /**
     * @return AMQPConnection
     */
    public function getAMQPConnection()
    {
        return $this->AMQPConnection;
    }

    /**
     * @param AMQPExchange $AMQPExchange
     */
    protected function setAMQPExchange($AMQPExchange)
    {
        $this->AMQPExchange = $AMQPExchange;
    }

    /**
     * @return AMQPExchange
     */
    public function getAMQPExchange()
    {
        return $this->AMQPExchange;
    }

    /**
     * @param string $AMQPRoutingKey
     */
    public function setRoutingKey($AMQPRoutingKey)
    {
        $this->setString('routingKey', $AMQPRoutingKey);
    }

    /**
     * @return string
     */
    public function getRoutingKey()
    {
        return $this->routingKey;
    }

    /**
     * @param string $host
     */
    public function setHost($host)
    {
        $this->setString('host', $host);
    }

    /**
     * @return string
     */
    public function getHost()
    {
        return $this->host;
    }

    /**
     * @param string $login
     */
    public function setLogin($login)
    {
        $this->setString('login', $login);
    }

    /**
     * @return string
     */
    public function getLogin()
    {
        return $this->login;
    }

    /**
     * @param string $password
     */
    public function setPassword($password)
    {
        $this->setString('password', $password);
    }

    /**
     * @return string
     */
    public function getPassword()
    {
        return $this->password;
    }

    /**
     * @param int $port
     */
    public function setPort($port)
    {
        $this->setPositiveInteger('port', $port);
    }

    /**
     * @return int
     */
    public function getPort()
    {
        return $this->port;
    }

    /**
     * @param string $vhost
     */
    public function setVhost($vhost)
    {
        $this->setString('vhost', $vhost);
    }

    /**
     * @return string
     */
    public function getVhost()
    {
        return $this->vhost;
    }

    /**
     * @param string $exchange
     */
    public function setExchangeName($exchange)
    {
        $this->setString('exchangeName', $exchange);
    }

    /**
     * @return string
     */
    public function getExchangeName()
    {
        return $this->exchangeName;
    }

    /**
     * @param string $exchangeType
     */
    public function setExchangeType($exchangeType)
    {
        $this->setString('exchangeType', $exchangeType);
    }

    /**
     * @return string
     */
    public function getExchangeType()
    {
        return $this->exchangeType;
    }

    /**
     * @param string $contentEncoding
     */
    public function setContentEncoding($contentEncoding)
    {
        $this->setString('contentEncoding', $contentEncoding);
    }

    /**
     * @return string
     */
    public function getContentEncoding()
    {
        return $this->contentEncoding;
    }

    /**
     * @param string $contentType
     */
    public function setContentType($contentType)
    {
        $this->setString('contentType', $contentType);
    }

    /**
     * @return string
     */
    public function getContentType()
    {
        return $this->contentType;
    }

    /**
     * @param float $connectionTimeout
     */
    public function setConnectionTimeout($connectionTimeout)
    {
        if (is_numeric($connectionTimeout) && $connectionTimeout > 0) {
            $this->connectionTimeout = floatval($connectionTimeout);
        } else {
            $this->warn("Invalid value given for 'connectionTimeout' property: [$connectionTimeout]. Expected a positive float. Property not changed.");
        }
    }

    /**
     * @return float
     */
    public function getConnectionTimeout()
    {
        return $this->connectionTimeout;
    }

    /**
     * @param boolean $flushOnShutdown
     */
    public function setFlushOnShutdown($flushOnShutdown)
    {
        $this->setBoolean('flushOnShutdown', $flushOnShutdown);
    }

    /**
     * @return boolean
     */
    public function getFlushOnShutdown()
    {
        return $this->flushOnShutdown;
    }

    /**
     * @param array $logs Array of strings
     */
    public function sendLogsArrayToAMQP($logs)
    {
        foreach ($logs as $log) {
            if ($this->closed) {
                break;
            }

            $this->sendLogToAMQP($log);
        }
    }

    /**
     * @param string $log
     */
    public function sendLogToAMQP($log)
    {
        try {
            $this->getAMQPExchange()->publish(
                $log,
                $this->getRoutingKey(),
                AMQP_NOPARAM,
                array(
                    'content_type' => $this->getContentType(),
                    'content_encoding' => $this->getContentEncoding()
                )
            );
        } catch (AMQPConnectionException $e) {
            $this->closed = true;
            $this->warn(sprintf('Connection to the broker was lost: %s', $e->getMessage()));
        } catch (AMQPChannelException $e) {
            $this->closed = true;
            $this->warn(sprintf('Channel is not open: %s', $e->getMessage()));
        } catch (AMQPExchangeException $e) {
            $this->closed = true;
            $this->warn(sprintf('Failed to publish message: %s', $e->getMessage()));
        } catch (Exception $e) {
            $this->warn(sprintf('Failed to publish message, unknown exception: %s', $e->getMessage()));
        }
    }

    /**
     * @param string $log
     */
    public function stashLog($log)
    {
        $this->logsStash[] = $log;
    }

    public function cleanStashedLogs()
    {
        $this->logsStash = array();
    }

    public function close()
    {
        if ($this->getFlushOnShutdown()) {
            $this->sendLogsArrayToAMQP($this->logsStash);
            $this->cleanStashedLogs();
        }

        $this->setAMQPExchange(null);
        $this->setAMQPConnection(null);

        parent::close();
    }
}