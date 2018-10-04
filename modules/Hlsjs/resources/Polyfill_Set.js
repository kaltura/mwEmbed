/* Polyfill service v3.25.1
 * For detailed credits and licence information see https://github.com/financial-times/polyfill-service.
 *
 * UA detected: ie/10.0.0
 * Features requested: Set
 *
 * - Object.keys, License: MIT (required by "Symbol", "Set")
 * - Symbol, License: MIT (required by "Set", "Symbol.iterator", "Symbol.species")
 * - Symbol.iterator, License: MIT (required by "Set")
 * - Symbol.species, License: MIT (required by "Set")
 * - Number.isNaN, License: MIT (required by "Set")
 * - Set, License: CC0 */

(function(undefined) {

// Object.keys
  Object.keys = (function() {
    'use strict';

    // modified from https://github.com/es-shims/object-keys

    var has = Object.prototype.hasOwnProperty;
    var toStr = Object.prototype.toString;
    var isEnumerable = Object.prototype.propertyIsEnumerable;
    var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
    var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
    var dontEnums = [
      'toString',
      'toLocaleString',
      'valueOf',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'constructor'
    ];
    var equalsConstructorPrototype = function (o) {
      var ctor = o.constructor;
      return ctor && ctor.prototype === o;
    };
    var excludedKeys = {
      $console: true,
      $external: true,
      $frame: true,
      $frameElement: true,
      $frames: true,
      $innerHeight: true,
      $innerWidth: true,
      $outerHeight: true,
      $outerWidth: true,
      $pageXOffset: true,
      $pageYOffset: true,
      $parent: true,
      $scrollLeft: true,
      $scrollTop: true,
      $scrollX: true,
      $scrollY: true,
      $self: true,
      $webkitIndexedDB: true,
      $webkitStorageInfo: true,
      $window: true
    };
    var hasAutomationEqualityBug = (function () {
      /* global window */
      if (typeof window === 'undefined') { return false; }
      for (var k in window) {
        try {
          if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
            try {
              equalsConstructorPrototype(window[k]);
            } catch (e) {
              return true;
            }
          }
        } catch (e) {
          return true;
        }
      }
      return false;
    }());
    var equalsConstructorPrototypeIfNotBuggy = function (o) {
      /* global window */
      if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
        return equalsConstructorPrototype(o);
      }
      try {
        return equalsConstructorPrototype(o);
      } catch (e) {
        return false;
      }
    };

    function isArgumentsObject(value) {
      var str = toStr.call(value);
      var isArgs = str === '[object Arguments]';
      if (!isArgs) {
        isArgs = str !== '[object Array]' &&
            value !== null &&
            typeof value === 'object' &&
            typeof value.length === 'number' &&
            value.length >= 0 &&
            toStr.call(value.callee) === '[object Function]';
      }
      return isArgs;
    };

    return function keys(object) {
      var isFunction = toStr.call(object) === '[object Function]';
      var isArguments = isArgumentsObject(object);
      var isString = toStr.call(object) === '[object String]';
      var theKeys = [];

      if (object === undefined || object === null) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var skipProto = hasProtoEnumBug && isFunction;
      if (isString && object.length > 0 && !has.call(object, 0)) {
        for (var i = 0; i < object.length; ++i) {
          theKeys.push(String(i));
        }
      }

      if (isArguments && object.length > 0) {
        for (var j = 0; j < object.length; ++j) {
          theKeys.push(String(j));
        }
      } else {
        for (var name in object) {
          if (!(skipProto && name === 'prototype') && has.call(object, name)) {
            theKeys.push(String(name));
          }
        }
      }

      if (hasDontEnumBug) {
        var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

        for (var k = 0; k < dontEnums.length; ++k) {
          if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
            theKeys.push(dontEnums[k]);
          }
        }
      }
      return theKeys;
    };
  }());

// Symbol
// A modification of https://github.com/WebReflection/get-own-property-symbols
// (C) Andrea Giammarchi - MIT Licensed

  (function (Object, GOPS, global) {

    var	setDescriptor;
    var id = 0;
    var random = '' + Math.random();
    var prefix = '__\x01symbol:';
    var prefixLength = prefix.length;
    var internalSymbol = '__\x01symbol@@' + random;
    var DP = 'defineProperty';
    var DPies = 'defineProperties';
    var GOPN = 'getOwnPropertyNames';
    var GOPD = 'getOwnPropertyDescriptor';
    var PIE = 'propertyIsEnumerable';
    var ObjectProto = Object.prototype;
    var hOP = ObjectProto.hasOwnProperty;
    var pIE = ObjectProto[PIE];
    var toString = ObjectProto.toString;
    var concat = Array.prototype.concat;
    var cachedWindowNames = typeof window === 'object' ? Object.getOwnPropertyNames(window) : [];
    var nGOPN = Object[GOPN];
    var gOPN = function getOwnPropertyNames (obj) {
      if (toString.call(obj) === '[object Window]') {
        try {
          return nGOPN(obj);
        } catch (e) {
          // IE bug where layout engine calls userland gOPN for cross-domain `window` objects
          return concat.call([], cachedWindowNames);
        }
      }
      return nGOPN(obj);
    };
    var gOPD = Object[GOPD];
    var create = Object.create;
    var keys = Object.keys;
    var freeze = Object.freeze || Object;
    var defineProperty = Object[DP];
    var $defineProperties = Object[DPies];
    var descriptor = gOPD(Object, GOPN);
    var addInternalIfNeeded = function (o, uid, enumerable) {
      if (!hOP.call(o, internalSymbol)) {
        try {
          defineProperty(o, internalSymbol, {
            enumerable: false,
            configurable: false,
            writable: false,
            value: {}
          });
        } catch (e) {
          o[internalSymbol] = {};
        }
      }
      o[internalSymbol]['@@' + uid] = enumerable;
    };
    var createWithSymbols = function (proto, descriptors) {
      var self = create(proto);
      gOPN(descriptors).forEach(function (key) {
        if (propertyIsEnumerable.call(descriptors, key)) {
          $defineProperty(self, key, descriptors[key]);
        }
      });
      return self;
    };
    var copyAsNonEnumerable = function (descriptor) {
      var newDescriptor = create(descriptor);
      newDescriptor.enumerable = false;
      return newDescriptor;
    };
    var get = function get(){};
    var onlyNonSymbols = function (name) {
      return name != internalSymbol &&
          !hOP.call(source, name);
    };
    var onlySymbols = function (name) {
      return name != internalSymbol &&
          hOP.call(source, name);
    };
    var propertyIsEnumerable = function propertyIsEnumerable(key) {
      var uid = '' + key;
      return onlySymbols(uid) ? (
          hOP.call(this, uid) &&
          this[internalSymbol]['@@' + uid]
      ) : pIE.call(this, key);
    };
    var setAndGetSymbol = function (uid) {
      var descriptor = {
        enumerable: false,
        configurable: true,
        get: get,
        set: function (value) {
          setDescriptor(this, uid, {
            enumerable: false,
            configurable: true,
            writable: true,
            value: value
          });
          addInternalIfNeeded(this, uid, true);
        }
      };
      try {
        defineProperty(ObjectProto, uid, descriptor);
      } catch (e) {
        ObjectProto[uid] = descriptor.value;
      }
      return freeze(source[uid] = defineProperty(
          Object(uid),
          'constructor',
          sourceConstructor
      ));
    };
    var Symbol = function Symbol(description) {
      if (this instanceof Symbol) {
        throw new TypeError('Symbol is not a constructor');
      }
      return setAndGetSymbol(
          prefix.concat(description || '', random, ++id)
      );
    };
    var source = create(null);
    var sourceConstructor = {value: Symbol};
    var sourceMap = function (uid) {
      return source[uid];
    };
    var $defineProperty = function defineProp(o, key, descriptor) {
      var uid = '' + key;
      if (onlySymbols(uid)) {
        setDescriptor(o, uid, descriptor.enumerable ?
            copyAsNonEnumerable(descriptor) : descriptor);
        addInternalIfNeeded(o, uid, !!descriptor.enumerable);
      } else {
        defineProperty(o, key, descriptor);
      }
      return o;
    };

    var onlyInternalSymbols = function (obj) {
      return function (name) {
        return hOP.call(obj, internalSymbol) && hOP.call(obj[internalSymbol], '@@' + name);
      };
    };
    var $getOwnPropertySymbols = function getOwnPropertySymbols(o) {
          return gOPN(o).filter(o === ObjectProto ? onlyInternalSymbols(o) : onlySymbols).map(sourceMap);
        }
    ;

    descriptor.value = $defineProperty;
    defineProperty(Object, DP, descriptor);

    descriptor.value = $getOwnPropertySymbols;
    defineProperty(Object, GOPS, descriptor);

    descriptor.value = function getOwnPropertyNames(o) {
      return gOPN(o).filter(onlyNonSymbols);
    };
    defineProperty(Object, GOPN, descriptor);

    descriptor.value = function defineProperties(o, descriptors) {
      var symbols = $getOwnPropertySymbols(descriptors);
      if (symbols.length) {
        keys(descriptors).concat(symbols).forEach(function (uid) {
          if (propertyIsEnumerable.call(descriptors, uid)) {
            $defineProperty(o, uid, descriptors[uid]);
          }
        });
      } else {
        $defineProperties(o, descriptors);
      }
      return o;
    };
    defineProperty(Object, DPies, descriptor);

    descriptor.value = propertyIsEnumerable;
    defineProperty(ObjectProto, PIE, descriptor);

    descriptor.value = Symbol;
    defineProperty(global, 'Symbol', descriptor);

    // defining `Symbol.for(key)`
    descriptor.value = function (key) {
      var uid = prefix.concat(prefix, key, random);
      return uid in ObjectProto ? source[uid] : setAndGetSymbol(uid);
    };
    defineProperty(Symbol, 'for', descriptor);

    // defining `Symbol.keyFor(symbol)`
    descriptor.value = function (symbol) {
      if (onlyNonSymbols(symbol))
        throw new TypeError(symbol + ' is not a symbol');
      return hOP.call(source, symbol) ?
          symbol.slice(prefixLength * 2, -random.length) :
          void 0
          ;
    };
    defineProperty(Symbol, 'keyFor', descriptor);

    descriptor.value = function getOwnPropertyDescriptor(o, key) {
      var descriptor = gOPD(o, key);
      if (descriptor && onlySymbols(key)) {
        descriptor.enumerable = propertyIsEnumerable.call(o, key);
      }
      return descriptor;
    };
    defineProperty(Object, GOPD, descriptor);

    descriptor.value = function (proto, descriptors) {
      return arguments.length === 1 || typeof descriptors === "undefined" ?
          create(proto) :
          createWithSymbols(proto, descriptors);
    };
    defineProperty(Object, 'create', descriptor);

    descriptor.value = function () {
      var str = toString.call(this);
      return (str === '[object String]' && onlySymbols(this)) ? '[object Symbol]' : str;
    };
    defineProperty(ObjectProto, 'toString', descriptor);


    setDescriptor = function (o, key, descriptor) {
      var protoDescriptor = gOPD(ObjectProto, key);
      delete ObjectProto[key];
      defineProperty(o, key, descriptor);
      if (o !== ObjectProto) {
        defineProperty(ObjectProto, key, protoDescriptor);
      }
    };

  }(Object, 'getOwnPropertySymbols', this));

// Symbol.iterator
  Object.defineProperty(Symbol, 'iterator', {value: Symbol('iterator')});

// Symbol.species
  Object.defineProperty(Symbol, 'species', {value: Symbol('species')});

// Number.isNaN
  Number.isNaN = Number.isNaN || function(value) {
    return typeof value === "number" && isNaN(value);
  };

// Set
  (function(global) {


    // Deleted map items mess with iterator pointers, so rather than removing them mark them as deleted. Can't use undefined or null since those both valid keys so use a private symbol.
    var undefMarker = Symbol('undef');

    // NaN cannot be found in an array using indexOf, so we encode NaNs using a private symbol.
    var NaNMarker = Symbol('NaN');

    function encodeVal(data) {
      return Number.isNaN(data) ? NaNMarker : data;
    }
    function decodeVal(encodedData) {
      return (encodedData === NaNMarker) ? NaN : encodedData;
    }

    function makeIterator(setInst, getter) {
      var nextIdx = 0;
      return {
        next: function() {
          while (setInst._values[nextIdx] === undefMarker) nextIdx++;
          if (nextIdx === setInst._values.length) {
            return {value: void 0, done: true};
          }
          else {
            return {value: getter.call(setInst, nextIdx++), done: false};
          }
        }
      };
    }

    var Set = function Set() {
      var data = arguments[0];
      this._values = [];
      this.size = this._size = 0;

      // If `data` is iterable (indicated by presence of a forEach method), pre-populate the set
      data && (typeof data.forEach === 'function') && data.forEach(function (item) {
        this.add.call(this, item);
      }, this);
    };

    // Some old engines do not support ES5 getters/setters.  Since Set only requires these for the size property, we can fall back to setting the size property statically each time the size of the set changes.
    try {
      Object.defineProperty(Set.prototype, 'size', {
        get: function() {
          return this._size;
        }
      });
    } catch(e) {
    }

    Set.prototype['add'] = function(value) {
      value = encodeVal(value);
      if (this._values.indexOf(value) === -1) {
        this._values.push(value);
        this.size = ++this._size;
      }
      return this;
    };
    Set.prototype['has'] = function(value) {
      return (this._values.indexOf(encodeVal(value)) !== -1);
    };
    Set.prototype['delete'] = function(value) {
      var idx = this._values.indexOf(encodeVal(value));
      if (idx === -1) return false;
      this._values[idx] = undefMarker;
      this.size = --this._size;
      return true;
    };
    Set.prototype['clear'] = function() {
      this._values = [];
      this.size = this._size = 0;
    };
    Set.prototype[Symbol.iterator] =
        Set.prototype['values'] =
            Set.prototype['keys'] = function() {
              var iterator = makeIterator(this, function(i) { return decodeVal(this._values[i]); });
              iterator[Symbol.iterator] = this.keys.bind(this);
              return iterator;
            };
    Set.prototype['entries'] = function() {
      var iterator = makeIterator(this, function(i) { return [decodeVal(this._values[i]), decodeVal(this._values[i])]; });
      iterator[Symbol.iterator] = this.entries.bind(this);
      return iterator;
    };
    Set.prototype['forEach'] = function(callbackFn, thisArg) {
      thisArg = thisArg || global;
      var iterator = this.entries();
      var result = iterator.next();
      while (result.done === false) {
        callbackFn.call(thisArg, result.value[1], result.value[0], this);
        result = iterator.next();
      }
    };
    Set.prototype['constructor'] =
        Set.prototype[Symbol.species] = Set;

    Set.prototype.constructor = Set;
    Set.name = "Set";

    // Export the object
    global.Set = Set;

  }(this));
})
    .call('object' === typeof window && window || 'object' === typeof self && self || 'object' === typeof global && global || {});