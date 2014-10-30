<?php 
/** Generic compress class, reads respective env vars and chouses an avaliable compressor */

class JavaScriptCompress{
	/**
	 * Returns minified JavaScript code. Calls the respective avaliable compress path.
	 * If $wgNodeJsUglifyPath is defeined attempt node JS compress. 
	 *
	 * @param $s String JavaScript code to minify
	 * @param $statementsOnOwnLine Bool Whether to put each statement on its own line
	 * @param $maxLineLength Int Maximum length of a single line, or -1 for no maximum.
	 * @return String Minified code
	 */
	public static function minify( $s, $statementsOnOwnLine = false, $maxLineLength = 1000 ) {
		global $wgNodeJsUglifyPath, $wgResourceLoaderMinifierStatementsOnOwnLine;
		if( is_file( $wgNodeJsUglifyPath ) ){
			return JavaScriptNodeUglifyJs::minify( $s );
		} else {
			return JavaScriptMinifier::minify($s, $wgResourceLoaderMinifierStatementsOnOwnLine, $maxLineLength );
		}
	}
}