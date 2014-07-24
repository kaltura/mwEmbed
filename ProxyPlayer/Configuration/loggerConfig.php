<?php
    $loggerConfiguration = array(
        'rootLogger' => array(
            'level' => 'INFO',
        ),
        'loggers' => array(
            'main' => array(
                'appenders' => array('myMainAppender')
            ),
            'DTO' => array(
                'appenders' => array('myMainAppender')
            )
        ),
        'appenders' => array(
            'myMainAppender' => array(
                'class' => 'LoggerAppenderDailyFile',
                'layout' => array(
                    'class' => 'LoggerLayoutPattern',
                    'params' => array(
                        'conversionPattern' => "%date [%logger] %message%newline"
                    )
                ),
                'params' => array(
                    'file' => '../includes/cache/logs/embedServicesHourlyLog-%s.log',
                    'datePattern' => 'Y-m-d.H'
                )
            )
        )
    );
?>