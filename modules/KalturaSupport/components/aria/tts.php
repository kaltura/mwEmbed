<?php

$qs = http_build_query(array("ie" => "utf-8","tl" => $_GET["tl"], "q" => $_GET["q"]));
$ctx = stream_context_create(array("http"=>array("method"=>"GET","header"=>"Referer: \r\n")));
$soundfile = file_get_contents("http://translate.google.com/translate_tts?".$qs, false, $ctx);

header("Content-type: audio/mpeg");
header("Content-Transfer-Encoding: binary");
header('Pragma: no-cache');
header('Expires: 0');

echo($soundfile);

?>