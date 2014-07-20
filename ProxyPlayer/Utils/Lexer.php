<?php
class Lexer{

	private static $instance;

    private function __construct() {}
    private function __clone() {}

    public static function getInstance() {
        if (!Lexer::$instance instanceof self) {
             Lexer::$instance = new self();
        }
        return Lexer::$instance;
    }

	function resolve($exp, $itemData, $data){
		if ($this->isBraceExpression($exp)){
		 	$resolved = $this->resolveBrace($exp, $itemData, $data);
			if ($this->isMapExpression($exp)){
                $resolved = $this->resolveMap($resolved);
            }
			if ($this->isRegexExpression($exp)){
				$resolved = $this->resolveRegex($resolved);
			}
			if ($this->isMathExpression($exp)){
				$resolved = $this->resolveMath($resolved);
			}			
			$item = $resolved;
		} else {
		    $item = $exp;
		}
		return $item;
	}
	function resolvePath($exp, $data){
	    $resolved = array();
        $expBreadCrumbs = explode("..", $exp);
        if (is_array($expBreadCrumbs) &&
            count($expBreadCrumbs) > 1){
            $resolvedData = $data;
            $actualExp = array_pop($expBreadCrumbs);
            foreach($expBreadCrumbs as $breadCrumb){
                if (isset($resolvedData[$breadCrumb])){
                    $resolvedData = $resolvedData[$breadCrumb];
                }
            }
            $resolved = array($actualExp, $resolvedData);
        } else {
            $resolved = array($exp, $data);
        }
        return $resolved;
    }
	function isBraceExpression($exp){
		preg_match_all("/\{\{(.*?)\}\}/", $exp, $matchedKeys);
		return (count($matchedKeys[0]) > 0);
	}
	function resolveBrace($exp, $itemData, $data){
		if (preg_match_all("/\{\{(.*?)\}\}/", $exp, $matchedKeys)){
		 	foreach (array_unique($matchedKeys[1]) as $matchedKey) {  
		 		//list($e, $d) = $this->resolvePath($matchedKey, $data);

		 		$item = (isset($itemData[$matchedKey])) ? $itemData[$matchedKey] : ((isset($data[$matchedKey])) ? $data[$matchedKey] : "");
		 		if (is_array($item)){
		 			$item = json_encode($item);
		 		}
		 		$exp = preg_replace("/\{\{".$matchedKey."\}\}/", $item, $exp);
			}
		}
		return $exp;
	}
	function isMathExpression($exp){
		preg_match_all("/\{MATH:(.*?)\}\}/", $exp, $matchedMathExps);
		return (count($matchedMathExps[0]) > 0);
	}
	function resolveMath($exp){
	    if (preg_match_all("/\{MATH:(.*?)\}\}/", $exp, $matchedMathExps)){
			$m = new EvalMath;
			$m->suppress_errors = true;
			foreach (array_unique($matchedMathExps[1]) as $matchedMathExp) {
		 		$result = $m->evaluate($matchedMathExp);
		 		$escapedMathExp = preg_quote($matchedMathExp, "/");
		 		$exp = preg_replace("/\{MATH:".$escapedMathExp."\}\}/", $result, $exp);
			}
		}
		return $exp;
	}
	function isRegexExpression($exp){
		preg_match_all("/\{REGEX:(.*?)\}\}/", $exp, $matchedRegexExps);
		return (count($matchedRegexExps[0]) > 0);
	}
	function resolveRegex($exp){
		if (preg_match_all("/\{REGEX:(.*?)\}\}/", $exp, $matchedExps)){
			foreach (array_unique($matchedExps[1]) as $key=>$matchedExp) {
		 		$pieces = explode("||", $matchedExp);
		 		preg_match($pieces[0], $pieces[1], $result);
		 		if (is_array($result) && isset($result[0])){
		 			$escapedExp = preg_quote($matchedExps[0][$key], "/");
		 			$exp = preg_replace("/".$escapedExp."/", $result[0], $exp);
		 		}
			}
		}
		return $exp;
	}
	function isMapExpression($exp){
        preg_match_all("/\{MAP:(.*?)\}\}/", $exp, $matchedRegexExps);
        return (count($matchedRegexExps[0]) > 0);
    }
    function resolveMap($exp){
        $found = false;
        $default = "";
        if (preg_match_all("/\{MAP:(.*?)\}\}/", $exp, $matchedExps)){
            foreach (array_unique($matchedExps[1]) as $key=>$matchedExp) {
                list($mapString, $text) = explode("||", $matchedExp);
                $mapStringArray = explode(",", $mapString);
                $map = array();
                $default = "";
                foreach ($mapStringArray as $lineNum => $line)
                {
                    list($k, $v) = explode("=>", $line);
                    if ($k == "__DEFAULT__"){
                        $default = $v;
                    } else {
                        $map[$k] = $v;
                    }
                }
                foreach ($map as $keyName => $valName){
                    preg_match("/$keyName/", $text, $result);
                    if (is_array($result) && isset($result[0])){
                        $escapedExp = preg_quote($matchedExps[0][$key], "/");
                        $exp = preg_replace("/".$escapedExp."/", $valName, $exp);
                        $found = true;
                        break;
                    }
                }
            }
        }
        if (!$found){
            $exp = $default;
        }
        return $exp;
    }
}
?>