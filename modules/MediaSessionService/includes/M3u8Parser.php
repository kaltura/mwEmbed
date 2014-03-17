<?php 
// handles m3u8 parsing

class M3u8Parser{
	
	
	function getM3u8FromUrl(){
		$content =  $this->cache->get( $this->getCacheKey() );
		if( $content ){
			return $content;
		}
		$content = file_get_contents( $this->streamUrl );
		// TODO take into consideration headers or per stream cache metadata info.
		$this->cache->set(  $this->getCacheKey(), $content );
		return $content;
	}
}