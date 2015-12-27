<?php
    class KalturaDependencyResolver{
        /**
         * Mapping of registered modules
         *
         * For exact details on support for script, style and messages, look at
         * mw.loader.implement.
         *
         * Format:
         *	{
         *		'moduleName': {
         *			'version': ############## (unix timestamp),
         *			'dependencies': ['required.foo', 'bar.also', ...], (or) function() {}
         *			'group': 'somegroup', (or) null,
         *			'source': 'local', 'someforeignwiki', (or) null
         *			'state': 'registered', 'loading', 'loaded', 'ready', 'error' or 'missing'
         *			'script': ...,
         *			'style': ...,
         *			'messages': { 'key': 'value' },
         *		}
         *	}
         */
        protected $registry = array();
        /**
         * Register module in the modules registry
         */
        function register($module, $version = NULL, $dependencies = NULL, $group = NULL, $source = NULL) {
            if (is_array($module)) {
                for ($m = 0; $m < count($module); $m += 1) {
                    if (is_string($module[$m])) {
                        $this->register($module[$m]);
                    } else if (is_array($module[$m])) {
                        call_user_func_array(array($this, "register"), $module[$m]);
                    }
                }
                return;
            }
            if (!is_string($module)) {
                throw(new Exception( 'module must be a string, not a ' .  gettype($module)));
            }
            if (isset($this->registry[$module])) {
                throw(new Exception( 'module already registered: ' . $module));
            }
            $this->registry[$module] = array(
                'version' => isset($version) ? intval($version) : 0,
                'dependencies' => array(),
                'group' => is_string($group) ? $group : null ,
                'source' => is_string($source) ? $source : 'local',
                'state' => 'registered'
            );
            if (is_string($dependencies)) {
                $this->registry[$module]["dependencies"] = array($dependencies);
            } else if (is_array($dependencies) || function_exists($dependencies)) {
                $this->registry[$module]["dependencies"] = $dependencies;
            }
        }

        /**
         * Set module state in the modules registry
         */
        function setState($moduleStateMap){
            foreach ($moduleStateMap as $name=>$state){
                if (isset($this->registry[$name])){
                    $this->registry[$name]["state"] = $state;
                }
            }
        }

        /**
         * Loads an external script or one or more modules for future use
         *
         * @param modules {mixed} Either the name of a module, array of modules,
         *  or a URL of an external script or style
         * @param type {String} mime-type to use if calling with a URL of an
         *  external script or style; acceptable values are "text/css" and
         *  "text/javascript"; if no type is provided, text/javascript is assumed.
         * @param async {Boolean} (optional) If true, load modules asynchronously
         *  even if document ready has not yet occurred. If false (default),
         *  block before document ready and load async after. If not set, true will
         *  be assumed if loading a URL, and false will be assumed otherwise.
         */
        function getDependencies( $modules ) {
            $filtered = array();

            // Validate input
            if ( !is_array($modules) && !is_string($modules) ) {
                throw(new Exception( 'modules must be a string or an array, not a ' . typeof($modules) ) );
            }

            // Filter out undefined modules, otherwise resolve() will throw
            // an exception for trying to load an undefined module.
            // Undefined modules are acceptable here in load(), because load() takes
            // an array of unrelated modules, whereas the modules passed to
            // using() are related and must all be loaded.
            for ( $m = 0; $m < count($modules); $m += 1 ) {
                if (isset($this->registry[$modules[$m]])) {
                    array_push($filtered, $modules[$m]);
                }
            }

            // Resolve entire dependency map
            $filtered = $this->resolve( $filtered );

            // If all modules are ready, nothing dependency be done
            if ( $this->compare($this->filter( array('ready'), $filtered ) , $filtered ) ) {
                return;
            }

            // If any modules have errors
            if ( count($this->filter( array('error'), $filtered )) > 0 ) {
                return;
            }
            // Since some modules are not yet ready, queue up a request
            $modules = $this->request( $filtered );
            return $modules;
        }

        /**
         * Recursively resolves dependencies and detects circular references
         */
        function recurse( $module, &$resolved, &$unresolved ) {
            if ( !isset($this->registry[$module])) {
                throw(new Exception( 'Unknown dependency: ' . $module ) );
            }
            // Resolves dynamic loader function and replaces it with its own results
            if ( isset($this->registry[$module]["dependencies"]) &&
                is_string($this->registry[$module]["dependencies"]) &&
                function_exists( $this->registry[$module]["dependencies"] ) ) {
                $this->registry[$module]["dependencies"] = $this->registry[$module]["dependencies"]();
                // Ensures the module's dependencies are always in an array
                if ( !is_array($this->registry[module]["dependencies"]) ) {
                    $this->registry[$module]["dependencies"] = array($this->registry[$module]["dependencies"]);
                }
            }
            // Tracks down dependencies
            $deps = $this->registry[$module]["dependencies"];
            $len = count($deps);
            for ( $n = 0; $n < $len; $n += 1 ) {
                if ( !in_array( $deps[$n], $resolved )) {
                    if ( in_array( $deps[$n], $unresolved ) ) {
                        throw(new Exception( 'Circular reference detected: ' . $module . ' -> ' . $deps[$n]));
                    }

                    // Add to unresolved
                    $unresolved[count($unresolved)] = $module;
                    $this->recurse( $deps[$n], $resolved, $unresolved );
                    // module is at the end of unresolved
                    array_pop($unresolved);
                }
            }
            array_push($resolved, $module);
        }

        /**
         * Gets a list of module names that a module depends on in their proper dependency order
         *
         * @param module string module name or array of string module names
         * @return list of dependencies, including 'module'.
         * @throws Error if circular reference is detected
         */
        function resolve( $module ) {
            // Allow calling with an array of module names
            if ( is_array( $module ) ) {
                $modules = array();
                for ( $m = 0; $m < count($module); $m += 1 ) {
                    $deps = $this->resolve( $module[$m] );
                    for ( $n = 0; $n < count($deps); $n += 1 ) {
                        array_push($modules, $deps[$n]);
                    }
                }
                return $modules;
            }

            if ( is_string($module) ) {
                $resolved = array();
                $unresolved = array();
                $this->recurse( $module, $resolved, $unresolved );
                return $resolved;
            }

            throw(new Exception( 'Invalid module argument: ' . $module ));
        }

        function compare( $a, $b ) {
            if ( count($a) !== count($b)) {
                return false;
            }
            for ( $i = 0; $i < count($b); $i += 1 ) {
                if ( is_array( $a[$i] ) ) {
                    if ( !compare( $a[$i], $b[$i] ) ) {
                        return false;
                    }
                }
                if ( $a[$i] !== $b[$i] ) {
                    return false;
                }
            }
            return true;
        }

        /**
         * Adds a dependencies to the queue with optional callbacks to be run
         * when the dependencies are ready or fail
         *
         * @param dependencies string module name or array of string module names
         */
        function request( $dependencies ) {
            // Allow calling by single module name
             if ( is_string($dependencies) ) {
                 $dependencies = array($dependencies);
                 if ( isset($this->registry[$dependencies[0]])) {
                      // Cache repetitively accessed deep level object member
                      $regItemDeps = $this->registry[$dependencies[0]]["dependencies"];
                      // Cache to avoid looped access to length property
                      $regItemDepLen = count($regItemDeps);
                      for ( $n = 0; $n < $regItemDepLen; $n += 1 ) {
                          array_push($this->dependencies, $regItemDeps[$n]);
                      }
                 }
             }

            $queue = array();

            // Queue up any dependencies that are registered
            $dependencies = $this->filter( array('registered'), $dependencies );
            for ( $n = 0; $n < count($dependencies); $n += 1 ) {
                if ( !in_array( $dependencies[$n], $queue ) ) {
                    array_push($queue, $dependencies[$n]);
                }
            }

            $batch = array();
            // Appends a list of modules from the queue to the batch
            for ( $q = 0; $q < count($queue); $q += 1 ) {
                // Only request modules which are registered
                if ( isset($this->registry[$queue[$q]]) && $this->registry[$queue[$q]]["state"] === 'registered' ) {
                    // Prevent duplicate entries
                    if ( !in_array( $queue[$q], $batch ) ) {
                        array_push($batch, $queue[$q]);
                        // Mark registered modules as loading
                        $this->registry[$queue[$q]]["state"] = 'loading';
                    }
                }
            }
            // Early exit if there's nothing to load...
            if ( count($batch) == 0 ) {
                return;
            }

            // The queue has been processed into the batch, clear up the queue.
            $queue = array();

            // Always order modules alphabetically to help reduce cache
            // misses for otherwise identical content.
            sort($batch);

            return $batch;
        }

        /**
         * Narrows a list of module names down to those matching a specific
         * state (see comment on top of this scope for a list of valid states).
         * One can also filter for 'unregistered', which will return the
         * modules names that don't have a registry entry.
         *
         * @param states string or array of strings of module states to filter by
         * @param modules array list of module names to filter (optional, by default the entire
         * registry is used)
         * @return array list of filtered module names
         */
        function filter( $states, $modules ) {

            // Allow states to be given as a string
            if ( is_string($states) ) {
                $states = array($states);
            }
            // If called without a list of modules, build and use a list of all modules
            $list = array();
            if ( !isset($modules) ) {
                $modules = array();
                foreach( $this->registry as $module ) {
                    array_push($modules, $module);
                }
            }
            // Build a list of modules which are in one of the specified states
            for ( $s = 0; $s < count($states); $s += 1 ) {
                for ( $m = 0; $m < count($modules); $m += 1 ) {
                    if ( !isset($this->registry[$modules[$m]] ) ) {
                        // Module does not exist
                        if ( $states[$s] === 'unregistered' ) {
                            // OK, undefined
                            array_push($list, $modules[$m]);
                        }
                    } else {
                        // Module exists, check state
                        if ( $this->registry[$modules[$m]]["state"] === $states[$s] ) {
                            // OK, correct state
                            array_push($list, $modules[$m]);
                        }
                    }
                }
            }
            return $list;
        }
    }
?>