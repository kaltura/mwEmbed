<?php 

/**
 * Object passed around to modules which contains information about the state 
 * of a specific loader request
 */
class MwEmbedResourceLoaderContext extends ResourceLoaderContext{
	public function getDirection() {
		if ( $this->direction === null ) {
			$this->direction = $this->request->getVal( 'dir' );
		}
		return $this->direction;
	}
}

?>