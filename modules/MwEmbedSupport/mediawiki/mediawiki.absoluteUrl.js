
( function( mw ) {
	/**
	 * makeAbsolute takes makes the given
	 * document.URL or a contextUrl param
	 * 
	 * protocol relative urls are prepended with http or https
	 *
	 * @param {String}
	 *            source path or url
	 * @param {String}
	 *            contextUrl The domain / context for creating an absolute url
	 *            from a relative path
	 * @return {=String} absolute url
	 */
	mw.absoluteUrl = function( source, contextUrl ) {
		// check if the url is already absolute:
		if( source.indexOf('http://' ) === 0 || source.indexOf('https://' ) === 0 ) {
			return source;
		}
		
		// Get parent Url location the context URL
		if( !contextUrl ) {
			contextUrl = document.URL;
		}
		var contextUrl = new mw.Uri( contextUrl );

		if( source.indexOf('//') === 0 ){
			return contextUrl.protocol + ':' + source;
		}
		
		// Check for local windows file that does not flip the slashes:
		if( contextUrl.directory == '' && contextUrl.protocol == 'file' ){
			// pop off the file
			var fileUrl = contextUrl.split( '\\');
			fileUrl.pop();
			return fileUrl.join('\\') + '\\' + src;
		}
		// Check for leading slash:
		if( source.indexOf( '/' ) === 0 ) {
			return contextUrl.protocol + '://' + contextUrl.getAuthority() + source;
		}else{
			return contextUrl.protocol + '://' + contextUrl.getAuthority() + contextUrl.path + source;
		}
	};

} )( window.mediaWiki );