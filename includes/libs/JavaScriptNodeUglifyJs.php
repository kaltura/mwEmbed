<?php 
class JavaScriptNodeUglifyJs {
	
	/**
	 * Returns minified JavaScript code via uglifyjs call lean more about uglifyjs here: 
	 * https://github.com/mishoo/UglifyJS
	 * 
	 * cli install instructions:
	 * https://www.npmjs.org/package/uglify-js
	 * npm install uglify-js -g
	 *
	 * @param $s String JavaScript code to minify
	 * @return String Minified code
	 */
	public static function minify( $s ){
		global $wgNodeJsUglifyPath;
		$cmd = $wgNodeJsUglifyPath;
		
		$descriptorspec = array(
			0 => array("pipe", "r"),  // stdin is a pipe that the child will read from
			1 => array("pipe", "w"),  // stdout is a pipe that the child will write to
			// note we should use lent etc. our compile is not without warnings
			//2 => array("file", "/tmp/error.txt", "a") 
		);
		$env = array(
			'PATH' => dirname( $wgNodeJsUglifyPath ) //Path to node bin dir
		);
		// https://www.npmjs.org/package/uglify-js
		$options = ' -c --mangle';
		
		$process = proc_open($cmd . $options, $descriptorspec, $pipes, __DIR__, $env );
		
		if (is_resource($process)) {
			
			fwrite($pipes[0], $s );
			fclose($pipes[0]);
		
			$output = stream_get_contents($pipes[1]);
			fclose($pipes[1]);
		
			// It is important that you close any pipes before calling
			// proc_close in order to avoid a deadlock
			$return_value = proc_close($process);
		
			return $output;
		}
		return false;
	}
}