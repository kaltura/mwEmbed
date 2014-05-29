<?php

require_once( dirname( __FILE__ ) . '/../KalturaCommon.php' );

$wgMwEmbedApiServices['upgradePlayer'] = 'mweUpgradePlayer';

class mweUpgradePlayer {
	function run(){
	    global $container;
	    $uiConfResult = $container['uiconf_result'];
		$data = json_encode($uiConfResult->getPlayerConfig());
		if (array_key_exists('callback', $_REQUEST)) {
            //  JSONP request wrapped in callback
            function is_valid_callback($subject)
            {
                $identifier_syntax
                    = '/^[$_\p{L}\.][$_\p{L}\p{Mn}\p{Mc}\p{Nd}\p{Pc}\x{200C}\x{200D}\.]*+$/u';

                $reserved_words = array('break', 'do', 'instanceof', 'typeof', 'case',
                    'else', 'new', 'var', 'catch', 'finally', 'return', 'void', 'continue',
                    'for', 'switch', 'while', 'debugger', 'function', 'this', 'with',
                    'default', 'if', 'throw', 'delete', 'in', 'try', 'class', 'enum',
                    'extends', 'super', 'const', 'export', 'import', 'implements', 'let',
                    'private', 'public', 'yield', 'interface', 'package', 'protected',
                    'static', 'null', 'true', 'false');

                return preg_match($identifier_syntax, $subject)
                && !in_array(mb_strtolower($subject, 'UTF-8'), $reserved_words);
            }

            $callback = $_REQUEST['callback'];
            if (is_valid_callback($callback)) {
                header('Content-Type: text/javascript; charset=utf8');
                echo $callback . '(' . $data . ');';
            }
        } else {
            // normal JSON string
            header('Content-Type: application/json; charset=utf8');
            echo $data;
        }

	}
}