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

	function resolve($exp, $data){
		if ($this->isBraceExpression($exp)){
		 	$resolved = $this->resolveBrace($exp, $data);
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
			$item = isset($data[$exp]) ? $data[$exp] : "";
		}
		return $item;
	}
	function isBraceExpression($exp){
		preg_match_all("/\{\{(.*?)\}\}/", $exp, $matchedKeys);
		return (count($matchedKeys[0]) > 0);
	}
	function resolveBrace($exp, $data){
		if (preg_match_all("/\{\{(.*?)\}\}/", $exp, $matchedKeys)){
		 	foreach (array_unique($matchedKeys[1]) as $matchedKey) {  
		 		$item = isset($data[$matchedKey]) ? $data[$matchedKey] : "";
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
        if (preg_match_all("/\{MAP:(.*?)\}\}/", $exp, $matchedExps)){
            foreach (array_unique($matchedExps[1]) as $key=>$matchedExp) {
                list($mapString, $text) = explode("||", $matchedExp);
                $mapStringArray = explode(",", $mapString);
                $map = array();
                foreach ($mapStringArray as $lineNum => $line)
                {
                    list($k, $v) = explode("=>", $line);
                    $map[$k] = $v;
                }
                foreach ($map as $keyName => $valName){
                    preg_match("/$keyName/", $text, $result);
                    if (is_array($result) && isset($result[0])){
                        $escapedExp = preg_quote($matchedExps[0][$key], "/");
                        $exp = preg_replace("/".$escapedExp."/", $valName, $exp);
                        break;
                    }
                }
            }
        }
        return $exp;
    }
}
?>