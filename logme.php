<?php

$data = '';
$myDir = dirname( __FILE__ );
$userAgent = $_SERVER['HTTP_USER_AGENT'];

if (isset($_GET['logname']))
{
	$data .= 'Log name: '.$_GET['logname'].PHP_EOL;
}

if (isset($_GET['logcount']))
{
	$data .= 'Log count:' .$_GET['logcount'].PHP_EOL;
}

if (isset($_REQUEST['logdata']))
{
	$log = $_REQUEST['logdata'];
	//$log.split('|').join(PHP_EOL);
	$data .= 'START LOG:'   . $userAgent . PHP_EOL. join(PHP_EOL , preg_split('/\|/',$log)). PHP_EOL.PHP_EOL;
}


file_put_contents($myDir . '/logClient.txt', $data,FILE_APPEND	);
//mail('itay.kinnrot@kaltura.com', 'My Subject', $data);

?>
dfdsfdsf