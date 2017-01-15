/*
 * ************************************************************************
 *
 *  ADOBE CONFIDENTIAL
 *  ___________________
 *
 *   (c) Copyright 2015 Adobe Systems Incorporated
 *   All Rights Reserved.
 *
 *  NOTICE:  All information contained herein is, and remains
 *  the property of Adobe Systems Incorporated and its suppliers,
 *  if any.  The intellectual and technical concepts contained
 *  herein are proprietary to Adobe Systems Incorporated and its
 *  suppliers and may be covered by U.S. and Foreign Patents,
 *  patents in process, and are protected by trade secret or copyright law.
 *  Dissemination of this information or reproduction of this material
 *  is strictly forbidden unless prior written permission is obtained
 *  from Adobe Systems Incorporated.
 * ************************************************************************
 */

/*
 * video heartbeats - js-v1.5.1.1 - 2015-04-07
 * Copyright (c) 2015 Adobe Systems, Inc. All Rights Reserved.
 */

// Heartbeat core
(function(global) {
if (typeof utils === 'undefined') {
    var utils = {};
}

if (typeof va === 'undefined') {
    var va = {};
}

if (typeof core === 'undefined') {
    var core = {};
}

core.radio || (core.radio = {});
core.plugin || (core.plugin = {});
if (typeof service === 'undefined') {
    var service = {};
}

service.clock || (service.clock = {});

/*jslint bitwise: true */
/*global unescape, define, utils */

(function (utils) {
    'use strict';

    /*
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF),
            msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
     * Bitwise rotate a 32-bit number to the left.
     */
    function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    /*
     * These functions implement the four basic operations the algorithm uses.
     */
    function md5_cmn(q, a, b, x, s, t) {
        return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
    }
    function md5_ff(a, b, c, d, x, s, t) {
        return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }
    function md5_gg(a, b, c, d, x, s, t) {
        return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }
    function md5_hh(a, b, c, d, x, s, t) {
        return md5_cmn(b ^ c ^ d, a, b, x, s, t);
    }
    function md5_ii(a, b, c, d, x, s, t) {
        return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    /*
     * Calculate the MD5 of an array of little-endian words, and a bit length.
     */
    function binl_md5(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << (len % 32);
        x[(((len + 64) >>> 9) << 4) + 14] = len;

        var i, olda, oldb, oldc, oldd,
            a =  1732584193,
            b = -271733879,
            c = -1732584194,
            d =  271733878;

        for (i = 0; i < x.length; i += 16) {
            olda = a;
            oldb = b;
            oldc = c;
            oldd = d;

            a = md5_ff(a, b, c, d, x[i],       7, -680876936);
            d = md5_ff(d, a, b, c, x[i +  1], 12, -389564586);
            c = md5_ff(c, d, a, b, x[i +  2], 17,  606105819);
            b = md5_ff(b, c, d, a, x[i +  3], 22, -1044525330);
            a = md5_ff(a, b, c, d, x[i +  4],  7, -176418897);
            d = md5_ff(d, a, b, c, x[i +  5], 12,  1200080426);
            c = md5_ff(c, d, a, b, x[i +  6], 17, -1473231341);
            b = md5_ff(b, c, d, a, x[i +  7], 22, -45705983);
            a = md5_ff(a, b, c, d, x[i +  8],  7,  1770035416);
            d = md5_ff(d, a, b, c, x[i +  9], 12, -1958414417);
            c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
            b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
            a = md5_ff(a, b, c, d, x[i + 12],  7,  1804603682);
            d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
            c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
            b = md5_ff(b, c, d, a, x[i + 15], 22,  1236535329);

            a = md5_gg(a, b, c, d, x[i +  1],  5, -165796510);
            d = md5_gg(d, a, b, c, x[i +  6],  9, -1069501632);
            c = md5_gg(c, d, a, b, x[i + 11], 14,  643717713);
            b = md5_gg(b, c, d, a, x[i],      20, -373897302);
            a = md5_gg(a, b, c, d, x[i +  5],  5, -701558691);
            d = md5_gg(d, a, b, c, x[i + 10],  9,  38016083);
            c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
            b = md5_gg(b, c, d, a, x[i +  4], 20, -405537848);
            a = md5_gg(a, b, c, d, x[i +  9],  5,  568446438);
            d = md5_gg(d, a, b, c, x[i + 14],  9, -1019803690);
            c = md5_gg(c, d, a, b, x[i +  3], 14, -187363961);
            b = md5_gg(b, c, d, a, x[i +  8], 20,  1163531501);
            a = md5_gg(a, b, c, d, x[i + 13],  5, -1444681467);
            d = md5_gg(d, a, b, c, x[i +  2],  9, -51403784);
            c = md5_gg(c, d, a, b, x[i +  7], 14,  1735328473);
            b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

            a = md5_hh(a, b, c, d, x[i +  5],  4, -378558);
            d = md5_hh(d, a, b, c, x[i +  8], 11, -2022574463);
            c = md5_hh(c, d, a, b, x[i + 11], 16,  1839030562);
            b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
            a = md5_hh(a, b, c, d, x[i +  1],  4, -1530992060);
            d = md5_hh(d, a, b, c, x[i +  4], 11,  1272893353);
            c = md5_hh(c, d, a, b, x[i +  7], 16, -155497632);
            b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
            a = md5_hh(a, b, c, d, x[i + 13],  4,  681279174);
            d = md5_hh(d, a, b, c, x[i],      11, -358537222);
            c = md5_hh(c, d, a, b, x[i +  3], 16, -722521979);
            b = md5_hh(b, c, d, a, x[i +  6], 23,  76029189);
            a = md5_hh(a, b, c, d, x[i +  9],  4, -640364487);
            d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
            c = md5_hh(c, d, a, b, x[i + 15], 16,  530742520);
            b = md5_hh(b, c, d, a, x[i +  2], 23, -995338651);

            a = md5_ii(a, b, c, d, x[i],       6, -198630844);
            d = md5_ii(d, a, b, c, x[i +  7], 10,  1126891415);
            c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
            b = md5_ii(b, c, d, a, x[i +  5], 21, -57434055);
            a = md5_ii(a, b, c, d, x[i + 12],  6,  1700485571);
            d = md5_ii(d, a, b, c, x[i +  3], 10, -1894986606);
            c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
            b = md5_ii(b, c, d, a, x[i +  1], 21, -2054922799);
            a = md5_ii(a, b, c, d, x[i +  8],  6,  1873313359);
            d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
            c = md5_ii(c, d, a, b, x[i +  6], 15, -1560198380);
            b = md5_ii(b, c, d, a, x[i + 13], 21,  1309151649);
            a = md5_ii(a, b, c, d, x[i +  4],  6, -145523070);
            d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
            c = md5_ii(c, d, a, b, x[i +  2], 15,  718787259);
            b = md5_ii(b, c, d, a, x[i +  9], 21, -343485551);

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
        }
        return [a, b, c, d];
    }

    /*
     * Convert an array of little-endian words to a string
     */
    function binl2rstr(input) {
        var i,
            output = '';
        for (i = 0; i < input.length * 32; i += 8) {
            output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF);
        }
        return output;
    }

    /*
     * Convert a raw string to an array of little-endian words
     * Characters >255 have their high-byte silently ignored.
     */
    function rstr2binl(input) {
        var i,
            output = [];
        output[(input.length >> 2) - 1] = undefined;
        for (i = 0; i < output.length; i += 1) {
            output[i] = 0;
        }
        for (i = 0; i < input.length * 8; i += 8) {
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32);
        }
        return output;
    }

    /*
     * Calculate the MD5 of a raw string
     */
    function rstr_md5(s) {
        return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
    }

    /*
     * Calculate the HMAC-MD5, of a key and some data (raw strings)
     */
    function rstr_hmac_md5(key, data) {
        var i,
            bkey = rstr2binl(key),
            ipad = [],
            opad = [],
            hash;
        ipad[15] = opad[15] = undefined;
        if (bkey.length > 16) {
            bkey = binl_md5(bkey, key.length * 8);
        }
        for (i = 0; i < 16; i += 1) {
            ipad[i] = bkey[i] ^ 0x36363636;
            opad[i] = bkey[i] ^ 0x5C5C5C5C;
        }
        hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
        return binl2rstr(binl_md5(opad.concat(hash), 512 + 128));
    }

    /*
     * Convert a raw string to a hex string
     */
    function rstr2hex(input) {
        var hex_tab = '0123456789abcdef',
            output = '',
            x,
            i;
        for (i = 0; i < input.length; i += 1) {
            x = input.charCodeAt(i);
            output += hex_tab.charAt((x >>> 4) & 0x0F) +
                hex_tab.charAt(x & 0x0F);
        }
        return output;
    }

    /*
     * Encode a string as utf-8
     */
    function str2rstr_utf8(input) {
        return unescape(encodeURIComponent(input));
    }

    /*
     * Take string arguments and return either raw or hex encoded strings
     */
    function raw_md5(s) {
        return rstr_md5(str2rstr_utf8(s));
    }
    function hex_md5(s) {
        return rstr2hex(raw_md5(s));
    }
    function raw_hmac_md5(k, d) {
        return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d));
    }
    function hex_hmac_md5(k, d) {
        return rstr2hex(raw_hmac_md5(k, d));
    }

    function md5(string, key, raw) {
        if (!key) {
            if (!raw) {
                return hex_md5(string);
            }
            return raw_md5(string);
        }
        if (!raw) {
            return hex_hmac_md5(key, string);
        }
        return raw_hmac_md5(key, string);
    }

    if (typeof define === 'function' && define.amd) {
        define(function () {
            return md5;
        });
    } else {
        utils.md5 = md5;
    }
}(utils));

(function(utils) {
    'use strict';

    var StringUtils = {};

    StringUtils.startsWith = function(target, token) {
        return target.indexOf(token) == 0;
    };

    // Export symbols.
    utils.StringUtils = StringUtils;
})(utils);

(function(utils) {
    'use strict';

    var ObjectUtils = {};

    ObjectUtils.clone = function(other) {
        var retVal = {};
        for (var key in other) {
            if (other.hasOwnProperty(key)) {
                retVal[key] = other[key];
            }
        }

        return retVal;
    };

    ObjectUtils.merge = function(one, other) {
        var retVal = ObjectUtils.clone(one);

        for (var key in other) {
            if (other.hasOwnProperty(key)) {
                retVal[key] = other[key];
            }
        }

        return retVal;
    };

    // Export symbols.
    utils.ObjectUtils = ObjectUtils;
})(utils);

(function(core) {
    'use strict';

    function Command(fn, ctx, params) {
        this.fn = fn;
        this.ctx = ctx;
        this.params = params;
    }

    Command.prototype.run = function() {
        this.params ? this.fn.apply(this.ctx, this.params) : this.fn.apply(this.ctx);
    };

    // Export symbols.
    core.radio.Command = Command;
})(core);

(function(core) {
    'use strict';

    function CommandQueue(suspended, delay) {
        this._queue = [];
        this._lastTs = 0;

        this._isSuspended = (typeof suspended !== "undefined") ? suspended : false;
        this._delay = (typeof delay !== "undefined") ? delay : 0;
    }

    //
    //---------------------[ Public API ]---------------------
    //
    CommandQueue.prototype.addCommand = function(command) {
        this._queue.push(command);
        this._drain();
    };

    CommandQueue.prototype.cancelAllCommands = function() {
        this._queue = [];
    };

    CommandQueue.prototype.isEmpty = function() {
        return (this._queue.length === 0);
    };

    CommandQueue.prototype.suspend = function() {
        this._isSuspended = true;
    };

    CommandQueue.prototype.resume = function() {
        this._isSuspended = false;
        this._drain();
    };

    CommandQueue.prototype.flush = function() {
        this._isSuspended = false;

        for (var i = 0; i < this._queue.length; i++) {
            var command = this._queue[i];
            command.run();
        }

        // Clear the command queue.
        this._queue = [];
    };

    //
    // -------------------[ Private helper methods ]-----------------------
    //

    // Executes sequentially all the commands in the current queue
    // Guarantees commands to be executed in the order they've been inserted
    CommandQueue.prototype._drain = function() {
        if (this._isSuspended || this._drainInProgress) return;

        this._drainInProgress = true;

        var self = this;
        (function __drain() {
            var command = self._queue.shift();

            if (command) {
                self._runCommand(command, function() {
                    if (self._isSuspended) return;

                    __drain();
                });
            } else {
                self._drainInProgress = false;
            }
        })();
    };

    CommandQueue.prototype._runCommand = function(command, done) {
        var self = this;

        function execute() {
            command.run();

            if (done != null) {
                done.call(self);
            }
        }

        if (this._lastTs == 0) {
            execute();
        } else {
            var now = new Date().getTime();
            var delta = now - this._lastTs;
            this._lastTs = now;

            if (delta < this._delay) {
                setTimeout(execute, this._delay - delta);
            } else {
                execute();
            }
        }
    };

    // Export symbols.
    core.radio.CommandQueue = CommandQueue;
})(core);

(function(core) {
    'use strict';

    // Public constants
    Channel.WILDCARD  = "*";
    Channel.SEPARATOR = ":";

    function Channel(name, logger) {
        this._name = name;

        if (!logger) {
            throw new Error("Reference to the logger object cannot be NULL");
        }
        this._logger = logger;

        this._listeners = {};
        this._requests = {};
        this._commands = {};
        this._isShutDown = false;
    }

    //
    //---------------------[ Public API ]---------------------
    //
    Channel.prototype.toString = function() {
        return '<channel: ' + this._name + '>';
    };

    Channel.prototype.shutdown = function() {
        if (this._isShutDown) return;

        this._logger.debug(LOG_TAG, '#shutdown > Shutting down');

        // Unregister all event handlers.
        this.off();

        // Unregister all request and command handlers.
        this._requests = {};
        this._commands = {};

        this._isShutDown = true;
    };

    // Event emitter APIs
    Channel.prototype.on = function(eventName, listener, ctx) {
        if (this._isShutDown) return;

        // We need to keep track of all added listener functions
        if (!this._listeners[eventName]) {
            this._listeners[eventName] = [];
        }

        this._listeners[eventName].push({fn: listener, ctx: ctx});
    };

    Channel.prototype.off = function(eventName, listener, ctx) {
        if (this._isShutDown) return;

        listener = (typeof listener === "function") ? listener : null;

        // Fast exit: removing ALL listeners
        if (!eventName && listener == null && !ctx) {
            this._listeners = {};
            return;
        }

        if (!eventName) { // we remove all registered listeners.
            for (eventName in this._listeners) {
                if (this._listeners.hasOwnProperty(eventName)) {
                    this._removeListener(eventName, listener, ctx);
                }
            }
        } else {
            this._removeListener(eventName, listener, ctx);
        }
    };

    Channel.prototype.trigger = function(event) {
        if (this._isShutDown) return;

        for (var eventName in this._listeners) {
            if (this._listeners.hasOwnProperty(eventName)) {
                if (_matchWildcard(eventName, event.name)) {
                    var copyOnWrite = this._listeners[eventName].slice(0);

                    for (var i = 0; i < copyOnWrite.length; i++) {
                        var cb = copyOnWrite[i];
                        cb.fn.call(cb.ctx, event);
                    }
                }
            }
        }
    };

    // Commands APIs

    // registers a command handler for "name"
    Channel.prototype.comply = function(name, cmd, ctx) {
        if (this._isShutDown) return;

        this._commands[name] = {
            cmd: cmd,
            ctx: ctx
        };
    };

    Channel.prototype.command = function(name, data) {
        if (this._isShutDown) return;

        var handler = this._commands[name];
        if (!handler) {
            this._logger.warn(LOG_TAG, "#command > No command handler for: " + name);
            return;
        }

        // pass all the args after name to the command handler
        handler.cmd.call(handler.ctx, data);
    };


    // Request Response APIs

    // registers a response to a request for "what"
    Channel.prototype.reply = function(what, response, ctx) {
        if (this._isShutDown) return;

        this._requests[what] = {
            fn: response,
            ctx: ctx
        };
    };

    Channel.prototype.request = function(what) {
        if (this._isShutDown) return;

        var reply = this._requests[what];

        if (!reply) {
            this._logger.warn(LOG_TAG, "#request > No request handler for: " + what);
            return null;
        }

        return reply.fn.call(reply.ctx);
    };

    //
    // -------------------[ Private helper methods ]-----------------------
    //

    // eventType is mandatory, Channel#off will always provide it
    // both fn and ctx are optional
    Channel.prototype._removeListener = function(eventName, fn, ctx) {
        fn = (typeof fn === "function") ? fn : null;

        var cbs = this._listeners[eventName];

        // Fast exit.
        if (!cbs) return;

        // if both fn and ctx are missing, remove all listeners for specified eventName
        if ((!cbs.length) || (fn == null && !ctx)) {
            delete this._listeners[eventName];
            return;
        }

        for (var i = 0; i < cbs.length; i++) {
            var cb = cbs[i];

            // at least one param is a match
            if ((fn === null || fn === cb.fn) && (!ctx || ctx === cb.ctx)) {
                this._listeners[eventName].splice(i,1);
            }
        }
    };

    // examples: plugin:* ~= plugin:initialized, *:init ~= adobe-analytics:init, * ~= anything ...
    function _matchWildcard(wildcard, test) {
        // Fast exit
        if (wildcard === test) return true;

        // break the 2 inputs into parts then match each part
        var parts = (wildcard || '').split(Channel.SEPARATOR),
            testParts = (test || '').split(Channel.SEPARATOR),
            match = true;

        for (var i = 0; i < parts.length; i++) {
            match = match && (parts[i] === Channel.WILDCARD || parts[i] === testParts[i]);
        }

        return match;
    }

    // Private constants.
    var LOG_TAG = "radio::Channel";

    // Export symbols.
    core.radio.Channel = Channel;
})(core);

(function(core) {
    'use strict';

    var Channel = core.radio.Channel;

    function Radio(logger) {
        if (!logger) {
            throw new Error("Reference to the logger object cannot be NULL");
        }

        this._logger = logger;

        // Start with an empty channel list.
        this._channels = {};
    }

    //
    //---------------------[ Public API ]---------------------
    //
    Radio.prototype.channel = function(name) {
        if (!this._channels[name]) {
            this._channels[name] = new Channel(name, this._logger);
        }

        return this._channels[name];
    };

    Radio.prototype.shutdown = function() {
        for (var name in this._channels) {
            if (this._channels.hasOwnProperty(name)) {
                this._channels[name].shutdown();
            }
        }
    };

    // Export symbols.
    core.radio.Radio = Radio;
})(core);
(function(core) {
    'use strict';

    /**
     * Implements the "inheritance"-like functionality. Inspired by
     * by CoffeeScript-generated code.
     *
     * @param {Function} child Constructor function for the "child" class.
     *
     * @param {Function} parent Constructor function for the "parent" class.
     *
     * @returns {Function} Constructor function for the newly enhanced "child" class.
     */
    function extend(child, parent) {
        // Transfer all properties from the "parent" to the "child".
        for (var key in parent) {
            if (parent.hasOwnProperty(key)) child[key] = parent[key];
        }

        // Wrapper constructor function for the "child" class.
        function Constructor() {
            this.constructor = child;
        }

        // Make the proper connections.
        Constructor.prototype = parent.prototype;
        child.prototype = new Constructor();
        child.__super__ = parent.prototype;

        return child;
    }

    // Export symbols.
    core.extend = extend;
})(core);

(function(core) {
    'use strict';

    /**
     * Interface for a log writer.
     *
     * @interface
     */
    function ILogWriter() {}

    ILogWriter.prototype.write = function(message) {
        throw new Error("Implementation error: Method must be overridden.");
    };

    // Export symbols.
    core.ILogWriter = ILogWriter;
})(core);

(function(core) {
    'use strict';

    /**
     * @implements {ILogWriter}
     *
     * @constructor
     */
    function LogWriter() {}

    //
    //---------------------[ Public API ]---------------------
    //
    LogWriter.prototype.write = function(message) {
        if (window["console"] && window["console"]["log"]) {
            window["console"]["log"](message);
        }
    };

    // Export symbols.
    core.LogWriter = LogWriter;
})(core, va);

(function(core) {
    'use strict';

    /**
     * Interface for a logger.
     *
     * @interface
     */
    function ILogger() {}

    ILogger.prototype.setLogWriter = function(logWriter) {
        throw new Error("Implementation error: Method must be overridden.");
    };

    ILogger.prototype.getLogWriter = function() {
        throw new Error("Implementation error: Method must be overridden.");
    };

    ILogger.prototype.getEnabled = function() {
        throw new Error("Implementation error: Method must be overridden.");
    };

    ILogger.prototype.enable = function() {
        throw new Error("Implementation error: Method must be overridden.");
    };

    ILogger.prototype.disable = function() {
        throw new Error("Implementation error: Method must be overridden.");
    };

    ILogger.prototype.debug = function(tag, message) {
        throw new Error("Implementation error: Method must be overridden.");
    };

    ILogger.prototype.info = function(tag, message) {
        throw new Error("Implementation error: Method must be overridden.");
    };

    ILogger.prototype.warn = function(tag, message) {
        throw new Error("Implementation error: Method must be overridden.");
    };

    ILogger.prototype.error = function(tag, message) {
        throw new Error("Implementation error: Method must be overridden.");
    };

    // Export symbols.
    core.ILogger = ILogger;
})(core);

(function(core) {
    'use strict';

    var LogWriter = core.LogWriter;

    /**
     * @implements {ILogger}
     *
     * @constructor
     */
    function Logger() {
        this._logWriter = new LogWriter();
    }

    //
    //---------------------[ Public API ]---------------------
    //
    Logger.prototype.setLogWriter = function(logWriter) {
        if(!logWriter) {
            throw new Error("Reference to the ILogWriter object cannot be NULL");
        }
        this._logWriter = logWriter;
        this._enabled = false;
    };

    Logger.prototype.getLogWriter = function() {
        return this._logWriter;
    };

    Logger.prototype.getEnabled = function() {
        return this._enabled;
    };

    Logger.prototype.enable = function() {
        this._enabled = true;
    };

    Logger.prototype.disable = function() {
        this._enabled = false;
    };

    Logger.prototype.debug = function(tag, message) {
        this._log(tag, DEBUG, message);
    };

    Logger.prototype.info = function(tag, message) {
        this._log(tag, INFO, message);
    };

    Logger.prototype.warn = function(tag, message) {
        this._log(tag, WARN, message);
    };

    Logger.prototype.error = function(tag, message) {
        this._log(tag, ERROR, message);
    };

    //
    //---------------------[ Private functions ]---------------------
    //
    Logger.prototype._log = function(tag, level, message) {
        if (level != ERROR) { // we always display the error messages.
            if (!this._enabled)
                return;
        }

        var line = "";

        var date = new Date();

        // add timestamp
        line += "[" + date.toTimeString() + "." + leadingZeros(date.getMilliseconds()) + "] [" + level + "] ";

        // add tag and params
        line += "[" + tag + "] " + message;

        // log the message
        this._logWriter.write(line);
    };

    function leadingZeros(x) {
        if (x < 10)
            return "00" + x;

        if (x < 100)
            return "0" + x;

        return "" + x;
    }

    // Private constants.
    var INFO = "INFO";
    var DEBUG = "DEBUG";
    var WARN = "WARN";
    var ERROR = "ERROR";

    // Export symbols.
    core.Logger = Logger;
})(core);

(function(core) {
    'use strict';

    var Channel = core.radio.Channel;

    function Trigger(pluginName, eventName) {
        this._pluginName = pluginName;
        this._eventName = eventName;
    }

    Trigger.prototype.getPluginName = function() {
        return this._pluginName;
    };

    Trigger.prototype.getEventName = function() {
        return this._eventName;
    };

    Trigger.prototype.getName = function() {
        return this._pluginName + Channel.SEPARATOR + this._eventName;
    };

    // Export symbols.
    core.Trigger = Trigger;
})(core);

(function(core) {
    'use strict';

    Event.SUCCESS = "success";
    Event.ERROR = "error";

    Event.createFromTrigger = function(trigger) {
        //noinspection JSClosureCompilerSyntax
        return new Event(trigger.getName());
    };

    function Event(name, data) {
        this.name = name;
        this.data = data;
    }

    // Export symbols.
    core.Event = Event;
})(core);

(function(core) {
    'use strict';

    /**
     * A generic event dispatcher. It emulates the functionality (and public API)
     * of the EventDispatcher class exposed by the Flash run-time.
     *
     * @constructor
     */
    function EventDispatcher() {
        this._events = {};
    }

    /**
     * Register an event-listener method to the event dispatcher.
     *
     * @param {string} name Unique string value identifying the event.
     *
     * @param {Function} listener Function that will be called when the event is dispatched.
     *
     * @param {Object} context Context in which the listener method is called.
     *
     */
    EventDispatcher.prototype.addEventListener = function(name, listener, context) {
        if (!name || !listener) return;
        context = context || window;

        this._events[name] = (this._events[name] || []);
        this._events[name].push({cb: listener, ctx: context});
    };

    //noinspection JSUnusedGlobalSymbols
    /**
     * Un-register an event-listener method to the event dispatcher.
     *
     * NOTE: for an event listener to be removed all the three coordinates must match
     * (name, listener and context) with the values provided during registration.
     *
     * @param {string} name Unique string value identifying the event.
     *
     * @param {Function} listener Function that will be called when the event is dispatched.
     *
     * @param {Object} context Context in which the listener method is called.
     */
    EventDispatcher.prototype.removeEventListener = function(name, listener, context) {
        if (!name || !listener) return;
        context = context || window;

        // Check to see if the event name was registered with us.
        var i, key, isNameRegistered = false;
        for (key in this._events) {
            if (name === key) {
                isNameRegistered = true;
                break;
            }
        }

        // This event name was not registered with us. Just exit.
        if (!isNameRegistered) return;

        // Search for the target event listener
        for (i = this._events[key].length - 1; i >= 0; i--) {
            var _listener = this._events[key][i];
            if (listener === _listener.cb && context === _listener.ctx) {
                this._events[key].splice(i, 1);
            }
        }

        // If we are left with an empty list of listeners for a particular
        // event name, we delete it.
        if (!this._events[key].length) delete this._events[key];
    };

    /**
     * Dispatch en event. It goes through the entire list of listener methods that are registered
     * for the target event and calls that function in the specified context.
     *
     * @param {core.Event} event Event instance.
     */
    EventDispatcher.prototype.dispatchEvent = function(event) {
        if (!event.name) return;

        var key, i;
        for (key in this._events) {
            if (this._events.hasOwnProperty(key) && event.name === key) {
                var listeners = this._events[key],
                    copyOnWrite = listeners.slice(0),
                    length = copyOnWrite.length;

                for (i = 0; i < length; i++) {
                    copyOnWrite[i].cb.call(copyOnWrite[i].ctx, event);
                }
                break;
            }
        }
    };

    /**
     * Un-registers all listener methods.
     *
     * @param {Object} target The object for which all event listeners are to be removed.
     */
    EventDispatcher.prototype.removeAllListeners = function(target) {
        if (!target) {
            this._events = {};
        } else {
            var i, key;

            for (key in this._events) {
                if (this._events.hasOwnProperty(key)) {
                    for (i = this._events[key].length - 1; i >= 0; i--) {
                        var _listener = this._events[key][i];
                        if (_listener.ctx === target) {
                            this._events[key].splice(i, 1);
                        }
                    }

                    // If we are left with an empty list of listeners for a particular
                    // event name, we delete it.
                    if (!this._events[key].length) delete this._events[key];
                }
            }
        }
    };

    // Export symbols.
    core.EventDispatcher = EventDispatcher;
})(core);

(function(core) {
    'use strict';

    var Event = core.Event;
    var EventDispatcher = core.EventDispatcher;

    URLRequestMethod.GET = "GET";

    function URLRequestMethod() {}


    function URLRequest(url, method) {
        this.url = url || null;
        this.method = method;
        this._xmlhttp = null;
    }


    URLLoader.RESPONSE = "response";
    URLLoader.INSTANCE = "instance";

    core.extend(URLLoader, EventDispatcher);

    /**
     * Emulates the URLLoader exposed by Flash run-time.
     *
     * @extends {EventDispatcher}
     */
    function URLLoader() {
        URLLoader.__super__.constructor.call(this);

        this._connection = null;
    }

    //
    // -------------------[ Public methods ]-----------------------
    //
    URLLoader.prototype.close = function() {
        this.removeAllListeners(null);
    };

    URLLoader.prototype.load = function(req) {
        if (!req || !req.method || !req.url) {
            return;
        }

        req._xmlhttp = this._createCORSRequest(req);

        if (req._xmlhttp) {
            req._xmlhttp.send();
        } else {
            // No CORS support: fall-back to image request.
            this._loadImage(req);
        }
    };

    //
    // -------------------[ Private helper methods ]-----------------------
    //
    URLLoader.prototype._createCORSRequest = function(req) {
        var xhr = null;

        // First, try to use XMLHTTPRequest2, which has CORS support
        if (typeof window["XMLHttpRequest"] !== "undefined") {
            var candidateXHR = new window["XMLHttpRequest"]();

            if ("withCredentials" in candidateXHR) {
                // The presence of this property indicates XMLHTTPRequest2,
                // (supported by most browsers and IE10+)
                xhr = candidateXHR;
                xhr.open(req.method, req.url, true);
            }
        }

        // If that didn't work, try to use XDomainRequest (IE8 and IE9)
        if (xhr == null) {
            if (typeof window["XDomainRequest"] !== "undefined") {
                xhr = new window["XDomainRequest"]();
                xhr.open(req.method, req.url);
            }
        }

        if (xhr) {
            // If CORS is supported, register the success & error callbacks
            var eventData = {};
            eventData[URLLoader.INSTANCE] = this;
            var self = this;

            xhr.onload = function() {
                if (xhr.status && parseInt(xhr.status, 10) >= 400) {
                    // This extra-check is needed because some browsers
                    // will call the 'onload' callback even if
                    // the request was unsuccessful.
                    return this.onerror();
                }
                eventData[URLLoader.RESPONSE] = xhr.responseText;
                self.dispatchEvent(new Event(Event.SUCCESS, eventData));
            };

            xhr.onerror = function() {
                self.dispatchEvent(new Event(Event.ERROR, eventData));
            };
        }

        return xhr;
    };

    URLLoader.prototype._loadImage = function(req) {
        if (!this._connection) {
            this._connection = new Image();
            this._connection.alt = "";
        }

        this._connection.src = req.url;

        // Image requests are assumed to be successful.
        var eventData = {};
        eventData[URLLoader.RESPONSE] = "";
        eventData[URLLoader.INSTANCE] = this;

        this.dispatchEvent(new Event(Event.SUCCESS, eventData));
    };

    // Export symbols.
    core.URLRequestMethod = URLRequestMethod;
    core.URLRequest = URLRequest;
    core.URLLoader = URLLoader;
})(core);

(function(va) {
    'use strict';

    var PLATFORM = "js";

    var MAJOR = "1";
    var MINOR = "5";
    var MICRO = "1";
    var PATCH = "1";
    var BUILD = "bf08a7e";
    var API_LEVEL = 3;

    /**
     * Container for library version information.
     *
     * @constructor
     */
    var Version = {};

    /**
     * The current version of the library.
     *
     * This has the following format: $platform-$major.$minor.$micro.$patch-$build
     */
    Version.getVersion = function() {
        return PLATFORM + "-" + MAJOR + "." + MINOR + "." + MICRO + "." + PATCH + "-" + BUILD;
    };

    /**
     * The major version.
     */
    Version.getMajor = function() {
        return MAJOR;
    };

    /**
     * The minor version.
     */
    Version.getMinor = function() {
        return MINOR;
    };

    /**
     * The micro version.
     */
    Version.getMicro = function() {
        return MICRO;
    };

    /**
     * The patch number.
     */
    Version.getPatch = function() {
        return PATCH;
    };

    /**
     * The build identifier.
     */
    Version.getBuild = function() {
        return BUILD;
    };

    /**
     * The API level.
     */
    Version.getApiLevel = function() {
        return API_LEVEL;
    };

    // Export symbols.
    va.Version = Version;
})(va);


(function(va) {
    'use strict';

    /**
     * Container for error related information.
     *
     * @constructor
     */
    function ErrorInfo(message, details) {
        this._message = message;
        this._details = details;
    }

    ErrorInfo.prototype.getMessage = function() {
        return this._message;
    };

    ErrorInfo.prototype.getDetails = function() {
        return this._details;
    };

    // Export symbols.
    va.ErrorInfo = ErrorInfo;
})(va);

(function(va) {
    'use strict';

    function HeartbeatConfig() {
        this.debugLogging = false;
    }

    // Export symbols.
    va.HeartbeatConfig = HeartbeatConfig;
})(va);

(function(va) {
    'use strict';

    function HeartbeatDelegate() {}

    HeartbeatDelegate.prototype.onError = function(errorInfo) {};

    // Export symbols.
    va.HeartbeatDelegate = HeartbeatDelegate;
})(va);

(function(core) {
    'use strict';

    /**
     * Interface to be respected by all plugins.
     *
     * @interface
     *
     */
    function IPlugin() {}

    IPlugin.prototype.configure = function(configData) {
        throw new Error("Implementation error: Method must be overridden.");
    };

    IPlugin.prototype.bootstrap = function(pluginManager) {
        throw new Error("Implementation error: Method must be overridden.");
    };

    IPlugin.prototype.setup = function() {
        throw new Error("Implementation error: Method must be overridden.");
    };

    IPlugin.prototype.destroy = function() {
        throw new Error("Implementation error: Method must be overridden.");
    };

    IPlugin.prototype.enable = function() {
        throw new Error("Implementation error: Method must be overridden.");
    };

    IPlugin.prototype.disable = function() {
        throw new Error("Implementation error: Method must be overridden.");
    };

    IPlugin.prototype.getName = function() {
        throw new Error("Implementation error: Method must be overridden.");
    };

    IPlugin.prototype.isInitialized = function() {
        throw new Error("Implementation error: Method must be overridden.");
    };

    IPlugin.prototype.resolveData = function(keys) {
        throw new Error("Implementation error: Method must be overridden.");
    };

    // Export symbols.
    core.plugin.IPlugin = IPlugin;
})(core);

(function(core) {
    'use strict';

    var ParamMapping = core.plugin.ParamMapping;

    function Behaviour(trigger, targetPlugin, targetAction, params) {
        this.trigger = trigger;
        this.action = targetAction;
        this.plugin = targetPlugin;

        this._paramMappings = {};
        this.mergeParams(params);
    }

    Behaviour.prototype.mergeParams = function(params) {
        if (params) {
            for (var i = 0; i < params.length; i++) {
                var paramMapping = params[i];
                this._paramMappings[paramMapping.getKeyName()] = paramMapping;
            }
        }
    };

    Behaviour.prototype.getParams = function() {
        var retVal = [];
        for (var key in this._paramMappings) {
            if (this._paramMappings.hasOwnProperty(key)) {
                retVal.push(this._paramMappings[key]);
            }
        }

        return retVal;
    };

    Behaviour.prototype.addParam = function(paramMapping) {
        this._paramMappings[paramMapping.getKeyName()] = paramMapping;
    };

    Behaviour.prototype.removeParam = function(pluginName, key) {
        var paramMapping = new ParamMapping(pluginName, key);

        if (this._paramMappings.hasOwnProperty(paramMapping.getKeyName())) {
            delete this._paramMappings[paramMapping.getKeyName()];
        }
    };

    // Export symbols.
    core.plugin.Behaviour = Behaviour;
})(core);

(function(core) {
    'use strict';

    var Channel = core.radio.Channel;

    function ParamMapping(pluginName, key, paramName) {
        this._pluginName = pluginName;
        this._key = key;
        this._paramName = paramName || pluginName + Channel.SEPARATOR + key;
    }

    ParamMapping.prototype.getPluginName = function() {
        return this._pluginName;
    };

    ParamMapping.prototype.getKey = function() {
        return this._key;
    };

    ParamMapping.prototype.getKeyName = function() {
        return this._pluginName + Channel.SEPARATOR + this._key;
    };

    ParamMapping.prototype.getParamName = function() {
        return this._paramName;
    };

    // Export symbols.
    core.plugin.ParamMapping = ParamMapping;
})(core);

(function(core) {
    'use strict';

    var Event = core.Event;
    var Radio = core.radio.Radio;
    var Channel = core.radio.Channel;
    var Behaviour = core.plugin.Behaviour;

    // Public constants.
    PluginManager.ERROR = "error";

    // Constructor.
    function PluginManager(logger) {
        if (!logger) {
            throw new Error("Reference to the logger object cannot be NULL");
        }
        this._logger = logger;

        // We start with an empty plugin list.
        this._plugins = {};

        // We start with an empty behaviour list.
        this._behaviours = {};

        // Instantiate the radio station (the comm. bus primitive).
        this._radio = new Radio(this._logger);
        this._dataChannel = this._radio.channel(DATA_CHANNEL);
        this._ctrlChannel = this._radio.channel(CTRL_CHANNEL);
    }

    PluginManager.prototype.addPlugin = function(plugin) {
        var pluginName = plugin.getName();
        if (this._plugins[pluginName]) {
            this._logger.warn(LOG_TAG, "#addPlugin > Replacing plugin: " + pluginName);
        }

        // Register the plugin.
        this._plugins[pluginName] = plugin;

        // Initialize the plugin.
        plugin.bootstrap(this);
    };

    PluginManager.prototype.setupPlugins = function() {
        for (var pluginName in this._plugins) {
            if (this._plugins.hasOwnProperty(pluginName)) {
                this._plugins[pluginName].setup();
            }
        }
    };

    //noinspection JSUnusedGlobalSymbols
    PluginManager.prototype.pluginExists = function(pluginName) {
        return (!!this._plugins[pluginName]);
    };

    //noinspection JSUnusedGlobalSymbols
    PluginManager.prototype.isPluginInitialized = function(pluginName) {
        return (this._plugins[pluginName] && this._plugins[pluginName].isInitialized());
    };

    PluginManager.prototype.on = function(pluginName, eventType, fn, ctx) {
        this._dataChannel.on(pluginName + Channel.SEPARATOR + eventType, fn, ctx);
    };

    PluginManager.prototype.off = function(pluginName, eventType, fn, ctx) {
        var eventFullName = (pluginName && eventType) ? pluginName + Channel.SEPARATOR + eventType : null;
        this._dataChannel.off(eventFullName, fn, ctx);
    };

    PluginManager.prototype.trigger = function(event) {
        var eventName = event.name;
        var behaviours = this._behaviours[eventName];

        // Handle behaviours specs first.
        if (behaviours) {
            var i, j,
                behaviour,
                params,
                paramMapping,
                batches = {},
                dataCache = {};

            // Group all data requests by plugin.
            for (i = 0; i < behaviours.length; i++) {
                behaviour = behaviours[i];
                params = behaviour.getParams();
                if (params) {
                    for (j = 0; j < params.length; j++) {
                        paramMapping = params[j];
                        batches[paramMapping.getPluginName()] = batches[paramMapping.getPluginName()] || [];
                        if (!(paramMapping.key in batches[paramMapping.getPluginName()])) {
                            batches[paramMapping.getPluginName()].push(paramMapping.getKey());
                        }
                    }
                }
            }

            // Send each batch of data requests to the corresponding plugin.
            for (var pluginName in batches) {
                if (batches.hasOwnProperty(pluginName)) {
                    dataCache[pluginName] = this.request(pluginName, batches[pluginName]);
                }
            }

            // Apply the param mappings by following the instructions in the behaviour spec.
            for (i = 0; i < behaviours.length; i++) {
                behaviour = behaviours[i];
                var resolvedData = {
                    _behaviour: behaviour,
                    _eventData: event.data || {}
                };

                params = behaviour.getParams();
                if (params) {
                    for (j = 0; j < params.length; j++) {
                        paramMapping = params[j];
                        resolvedData[paramMapping.getParamName()] = dataCache[paramMapping.getPluginName()]
                            ? dataCache[paramMapping.getPluginName()][paramMapping.getKey()]
                            : null;
                    }

                    this.command(behaviour.plugin.getName(), behaviour.action, resolvedData);
                }
            }
        }

        // Also place it on the data channel in case
        // somebody is explicitly listening for the event.
        this._dataChannel.trigger(event);
    };

    PluginManager.prototype.request = function(pluginName, keys) {
        // Find the target plugin.
        var targetPlugin = this._plugins[pluginName];

        // Fast exit.
        if (!targetPlugin || !keys || keys.length == 0) return null;

        return targetPlugin.resolveData(keys);
    };

    PluginManager.prototype.raise = function(errorInfo) {
        this._errorInfo = errorInfo;

        //noinspection JSClosureCompilerSyntax
        var event = new Event(PluginManager.ERROR, errorInfo);

        // Trigger an ERROR event on the "control" channel.
        this._ctrlChannel.trigger(event);
    };

    //noinspection JSUnusedGlobalSymbols
    PluginManager.prototype.getErrorInfo = function() {
        return this._errorInfo;
    };

    PluginManager.prototype.destroy = function() {
        // Shutdown the radio station.
        this._radio.shutdown();

        // Destroy all registered plugins.
        for (var pluginName in this._plugins) {
            if (this._plugins.hasOwnProperty(pluginName)) {
                this._plugins[pluginName].destroy();
            }
        }
    };

    PluginManager.prototype.comply = function(plugin, cmd, fn) {
        this._dataChannel.comply(plugin.getName() + Channel.SEPARATOR + cmd, fn, plugin);
    };

    PluginManager.prototype.command = function(pluginName, cmd, data) {
        this._dataChannel.command(pluginName + Channel.SEPARATOR + cmd, data);
    };

    PluginManager.prototype.registerBehaviour = function(trigger, plugin, action, params) {
        var eventName = trigger.getName();
        var behaviour = new Behaviour(trigger, plugin, action, params);

        // Register the behaviour.
        this._behaviours[eventName] = this._behaviours[eventName] || [];
        this._behaviours[eventName].push(behaviour);
    };

    // Private constants.
    var DATA_CHANNEL = "data_channel";
    var CTRL_CHANNEL = "ctrl_channel";
    var LOG_TAG = "plugin::PluginManager";

    // Export symbols.
    core.plugin.PluginManager = PluginManager;
})(core);

(function(core, va) {
    'use strict';

    var Logger = core.Logger;
    var Trigger = core.Trigger;
    var Event = core.Event;
    var ErrorInfo = va.ErrorInfo;

    BasePlugin.INITIALIZED = "initialized";

    /**
     * Base plugin class, to be extended by all plugins.
     *
     * NOTE: this is an abstract base class designed to be extended.
     *       Not to be instantiated directly.
     *
     * @implements {IPlugin}
     *
     * @constructor
     */
    function BasePlugin(name) {
        this._name = name;

        this._isInitialized = false;
        this._isDestroyed = false;
        this._isEnabled = true;
        this._dataResolver = {};

        // Activate logging for this class.
        this._logTag = "plugin::" + this.getName();
        this._logger = new Logger();
    }

    //
    //---------------------[ Public API ]---------------------
    //
    BasePlugin.prototype.configure = function(configData) {
        // Do nothing here. Override in child classes if needed.
    };

    BasePlugin.prototype.bootstrap = function(pluginManager) {
        this._pluginManager = pluginManager;

        if (this._isDestroyed) {
            this._pluginManager.raise(new ErrorInfo("Invalid state.", "Plugin already destroyed."));
        }
    };

    BasePlugin.prototype.setup = function() {
        // Plugin initialization is now complete. Trigger the INITIALIZED event.
        this._trigger(BasePlugin.INITIALIZED);
        this._isInitialized = true;
    };

    BasePlugin.prototype.destroy = function() {
        if (this._isDestroyed) return;

        // The plugin is now destroyed. All public APIs are disabled.
        this._isDestroyed = true;

        // Execute the custom tear-down logic.
        this._teardown();
    };

    BasePlugin.prototype.enable = function() {
        this._isEnabled = true;
        this._enabled();
    };

    BasePlugin.prototype.disable = function() {
        this._isEnabled = false;
        this._disabled();
    };

    BasePlugin.prototype.getName = function() {
        return this._name;
    };

    BasePlugin.prototype.getLogger = function() {
        return this._logger;
    };

    BasePlugin.prototype.isInitialized = function() {
        return this._isInitialized;
    };

    BasePlugin.prototype.resolveData = function (keys) {
        // Fast exit: only respond to data request if enabled and initialized.
        if (!this._isEnabled || !this._isInitialized) {
            this._logger.warn(this._logTag, "Unable to retrieve plugin data"
            + ". Plugin: " + this._name
            + ". Enabled: " + this._isEnabled
            + ". Initialized: " + this._isInitialized
            + ".");

            return null;
        }

        // Top level resolver is a function -- call it.
        if (typeof this._dataResolver === "function") {
            return this._dataResolver.call(this, keys);
        }

        // Resolver is a hash.
        var result = null;
        if (keys) {
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (this._dataResolver.hasOwnProperty(key)) {
                    result = result || {};

                    if (typeof this._dataResolver[key] === "function") { // Field is a function: call it.
                        result[key] = this._dataResolver[key].call(this);
                    } else { // Field is a simple value.
                        result[key] = this._dataResolver[key];
                    }
                }
            }
        }

        return result;
    };

    BasePlugin.prototype.toString = function() {
        return "<plugin: "  + this._name + ">";
    };

    //
    //---------------------[ Protected API ]---------------------
    //
    // Life-cycle management APIs.
    BasePlugin.prototype._enabled = function() {
        // All plugins can override this.
    };

    BasePlugin.prototype._disabled = function() {
        // All plugins can override this.
    };

    BasePlugin.prototype._teardown = function() {
        // All plugins can override this.
    };

    // Helper methods
    BasePlugin.prototype._canProcess = function() {
        if (!this._isEnabled) {
            this._logger.error(this._logTag, "Plugin disabled.");
            return false;
        }

        if (this._isDestroyed) {
            this._logger.error(this._logTag, "Plugin destroyed.");
            return false;
        }

        return true;
    };

    BasePlugin.prototype._trigger = function(eventName, info) {
        var event = Event.createFromTrigger(new Trigger(this.getName(), eventName));
        event.data = info;
        this._pluginManager.trigger(event);
    };

    // Export symbols.
    core.plugin.BasePlugin = BasePlugin;
})(core, va);

(function(service) {
    'use strict';

    function TimerDescriptor(name, interval, repeatCount) {
        this.name = name;
        this.interval = interval;
        this.isActive = false;
        this.repeatCount = (typeof repeatCount !== "undefined") ? repeatCount : REPEAT_FOREVER;
        this._nextTickTimestamp = 0;
        this.reset();
    }

    TimerDescriptor.prototype.reset = function() {
        this.tick = 0;
        this._createdTimestamp = new Date().getTime();
        this._updateNextTickTimestamp();
    };

    TimerDescriptor.prototype.shouldTick = function() {
        var now = new Date().getTime();
        if (now > this._nextTickTimestamp - TIMER_BASE_INTERVAL / 2) {
            this.tick++;
            this._updateNextTickTimestamp();
            return true;
        }

        return false;
    };

    TimerDescriptor.prototype._updateNextTickTimestamp = function() {
        this._nextTickTimestamp = this._createdTimestamp + (this.interval * 1000 * (this.tick + 1));
    };



    function TimerManager(service, logger) {
        if(!service) {
            throw new Error("Reference to the ClockService object cannot be NULL");
        }
        this._service = service;

        if(!logger) {
            throw new Error("Reference to the logger object cannot be NULL");
        }
        this._logger = logger;

        this._isDestroyed = false;
        this._timers = {};

        // Setup the base timer for the clock partition.
        var self = this;
        this._clock = window.setInterval(function() { self._onTick(); }, TIMER_BASE_INTERVAL * 1000);
    }


    //
    // -------------------[ Public API ]-----------------------
    //
    TimerManager.prototype.createTimer = function(name, interval, repeatCount) {
        this._timers[name] = new TimerDescriptor(name, interval, repeatCount);
    };

    TimerManager.prototype.destroyTimer = function(name) {
        delete this._timers[name];
    };

    TimerManager.prototype.resumeTimer = function(name, reset) {
        reset = (typeof reset !== "undefined") ? reset : false;

        this._logger.debug(LOG_TAG, "#resumeTimer(" + "name=" + name + ", reset=" + reset + ")");

        var timer = this._timers[name];

        if (timer) {
            timer.isActive = true;

            if (reset) {
                timer.reset();
            }
        }
    };

    TimerManager.prototype.pauseTimer = function(name, reset) {
        reset = (typeof reset !== "undefined") ? reset : false;

        this._logger.debug(LOG_TAG, "#pauseTimer(" + "name=" + name + ", reset=" + reset + ")");

        var timer = this._timers[name];

        if (timer) {
            timer.isActive = false;

            if (reset) {
                timer.reset();
            }
        }
    };

    TimerManager.prototype.isTimerPaused = function(name) {
        var timer = this._timers[name];
        return (timer) ? !timer.isActive : false;
    };

    TimerManager.prototype.destroy = function() {
        if (this._isDestroyed) return;
        this._isDestroyed = true;

        this._timers = {};

        // Stop the base timer.
        window.clearInterval(this._clock);
    };


    //
    //--------------------[ Event listeners ]--------------------
    //
    TimerManager.prototype._onTick = function() {
        for (var name in this._timers) {
            if (this._timers.hasOwnProperty(name)) {
                var timer = this._timers[name];

                if (timer.isActive) {
                    if (timer.shouldTick()) {
                        // Log the ticks only for timers over 1 sec to avoid spamming the log console.
                        // TODO: change this when verbosity levels are in place.
                        if (timer.interval > 1) {
                            this._logger.debug(LOG_TAG, "#_onTick() > " + timer.name +
                                    "(" + timer.tick + " | " + timer.repeatCount + ")");
                        }

                        if (timer.repeatCount != 0) {
                            this._service.onTick(timer.name, timer.interval, timer.tick);
                            if (timer.repeatCount != REPEAT_FOREVER) timer.repeatCount--;
                        } else {
                            this.destroyTimer(timer.name);
                        }
                    }
                }
            }
        }
    };

    // Private constants.
    var LOG_TAG = "service.clock::TimerManager";

    var REPEAT_FOREVER = -1;
    var TIMER_BASE_INTERVAL = 0.25; // seconds

    // Export symbols.
    service.clock.TimerDescriptor = TimerDescriptor;
    service.clock.TimerManager = TimerManager;
})(service);

(function(core, utils, service) {
    'use strict';

    var TimerManager = service.clock.TimerManager;
    var StringUtils = utils.StringUtils;
    var BasePlugin = core.plugin.BasePlugin;

    core.extend(ClockService, BasePlugin);

    /**
     * @extends {BasePlugin}
     * @constructor
     */
    function ClockService(logger) {
        ClockService.__super__.constructor.call(this, NAME);

        if(!logger) {
            throw new Error("Reference to the logger object cannot be NULL");
        }

        this._logger = logger;

        this._timerManager = new TimerManager(this, this._logger);

        this._setupDataResolver();
    }


    //
    //---------------------[ Public overridden functions ]---------------------
    //
    ClockService.prototype.bootstrap = function(pluginManager) {
        // Do the plugin core bootstrapping.
        ClockService.__super__.bootstrap.call(this, pluginManager);

        // Register for the commands we are able to handle.
        this._pluginManager.comply(this, CMD_CREATE, this._cmdCreate);
        this._pluginManager.comply(this, CMD_RESUME, this._cmdResume);
        this._pluginManager.comply(this, CMD_PAUSE, this._cmdPause);
        this._pluginManager.comply(this, CMD_DESTROY, this._cmdDestroy);
    };


    //
    //---------------------[ Protected overridden functions ]---------------------
    //
    ClockService.prototype._teardown = function() {
        this._timerManager.destroy();
    };


    //
    //---------------------[ Command handlers ]---------------------
    //
    ClockService.prototype._cmdCreate = function(data) {
        var repeatCount = data[KEY_REPEAT_COUNT] || REPEAT_FOREVER;
        this._timerManager.createTimer(data[KEY_NAME], data[KEY_INTERVAL], repeatCount);
    };

    ClockService.prototype._cmdPause = function(data) {
        this._timerManager.pauseTimer(data[KEY_NAME], !!data[KEY_RESET]);
    };

    ClockService.prototype._cmdResume = function(data) {
        this._timerManager.resumeTimer(data[KEY_NAME], !!data[KEY_RESET]);
    };

    ClockService.prototype._cmdDestroy = function(data) {
        this._timerManager.destroyTimer(data[KEY_NAME]);
    };


    //
    //---------------------[ Event handlers ]---------------------
    //
    ClockService.prototype.onTick = function(name, interval, tick) {
        name += ".tick";
        var eventData = {};
        eventData[KEY_NAME] = name;
        eventData[KEY_INTERVAL] = interval;
        eventData[KEY_TICK] = tick;
        this._trigger(name, eventData);
    };


    //
    // -------------------[ Private helper methods ]-----------------------
    //
    ClockService.prototype._setupDataResolver = function() {
        // Set handlers for the requests we are able to handle.
        var fnMap = {};
        var timerManager = this._timerManager;
        fnMap[REQ_IS_PAUSED] = function(key) {
            return timerManager.isTimerPaused(key);
        };

        this._dataResolver = function(keys) {
            if (!keys || keys.length == 0) return null;

            var result = null;
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                result = result || {};
                if (StringUtils.startsWith(key, REQ_IS_PAUSED)) { // this is "timer is paused" event.
                    var tokens = key.split(REQ_IS_PAUSED + ".");
                    if (tokens.length > 0) {
                        result[key] = fnMap[REQ_IS_PAUSED].call(this, tokens[1]);
                    }
                }
            }

            return result;
        };
    };

    // Private constants.
    var NAME = "service.clock";

    var CMD_CREATE = "create";
    var CMD_PAUSE = "pause";
    var CMD_RESUME = "resume";
    var CMD_DESTROY = "destroy";

    var KEY_NAME = "name";
    var KEY_INTERVAL = "interval";
    var KEY_REPEAT_COUNT = "repeat_count";
    var KEY_TICK = "tick";
    var KEY_RESET = "reset";

    var REQ_IS_PAUSED = "is_paused";

    var REPEAT_FOREVER = -1;

    // Export symbols.
    service.clock.ClockService = ClockService;
})(core, utils, service);

(function(core, service, va) {
    'use strict';

    var Logger = core.Logger;
    var PluginManager = core.plugin.PluginManager;
    var ClockService = service.clock.ClockService;

    function Heartbeat(delegate, plugins) {
        this._logger = new Logger();

        // Bootstrap the plugin manager.
        this._pluginManager = new PluginManager(this._logger);

        // Register the core services.
        this._pluginManager.addPlugin(new ClockService(this._logger));

        // Register the custom plugins.
        if (plugins) {
            for (var i = 0; i < plugins.length; i++) {
                this._pluginManager.addPlugin(plugins[i]);
            }
        }

        // Now that all plugins have been registered with the PluginManager
        // we can move to the setup phase.
        this._pluginManager.setupPlugins();

        this._isDestroyed = false;
    }

    //
    //---------------------[ Public API ]---------------------
    //
    Heartbeat.prototype.configure = function(configData) {
        if (!configData) {
            throw new Error("Configuration object cannot be NULL.");
        }

        if (configData.debugLogging) {
            this._logger.enable();
        } else {
            this._logger.disable();
        }

        if (this._isDestroyed) {
            this._logger.error(LOG_TAG, "Instance is destroyed.");
        }
    };

    Heartbeat.prototype.destroy = function() {
        if (this._isDestroyed) return;

        // Destroy the plugin manager.
        this._pluginManager.destroy();

        // From this point on, we no longer accept API requests.
        this._isDestroyed = true;
    };

    // Private constants.
    var LOG_TAG = "Heartbeat";

    // Export symbols.
    va.Heartbeat = Heartbeat;
})(core, service, va);


// Export symbols.
global.ADB || (global.ADB = {});
global.ADB.core || (global.ADB.core = core);
global.ADB.va || (global.ADB.va = va);
global.ADB.va.utils || (global.ADB.va.utils = utils);
global.ADB.va.plugins || (global.ADB.va.plugins = {});

})(this);

// VideoPlayerPlugin
(function(global) {
if (typeof videoplayer === 'undefined') {
    var videoplayer = {};
}

(function(videoplayer) {
    'use strict';

    var AssetType = {};

    AssetType.ASSET_TYPE_VOD = "vod";
    AssetType.ASSET_TYPE_LIVE = "live";
    AssetType.ASSET_TYPE_LINEAR = "linear";

    // Export symbols.
    videoplayer.AssetType = AssetType;
})(videoplayer);

(function(videoplayer) {
    'use strict';

    function AdBreakInfo() {
        this.playerName = null;
        this.name = null;
        this.position = null;
        this.startTime = null;
    }

    AdBreakInfo.prototype.toString = function() {
        return "playerName=" + this.playerName
            + ", name=" + this.name
            + ", position=" + this.position
            + ", startTime=" + this.startTime;
    };

    // Export symbols.
    videoplayer.AdBreakInfo = AdBreakInfo;
})(videoplayer);

(function(videoplayer) {
    'use strict';

    function AdInfo() {
        this.id = null;
        this.name = null;
        this.length = null;
        this.position = null;
    }

    AdInfo.prototype.toString = function() {
        return "id=" + this.id
            + ", name=" + this.name
            + ", length=" + this.length
            + ", position=" + this.position;
    };

    // Export symbols.
    videoplayer.AdInfo = AdInfo;
})(videoplayer);

(function(videoplayer) {
    'use strict';

    function ChapterInfo() {
        this.name = null;
        this.length = null;
        this.position = null;
        this.startTime = null;
    }

    ChapterInfo.prototype.toString = function() {
        return "name=" + this.name
            + ", length=" + this.length
            + ", position=" + this.position
            + ", startTime=" + this.startTime;
    };

    // Export symbols.
    videoplayer.ChapterInfo = ChapterInfo;
})(videoplayer);

(function(videoplayer) {
    'use strict';

    function QoSInfo() {
        this.bitrate = null;
        this.fps = null;
        this.droppedFrames = null;
        this.startupTime = null;
    }

    QoSInfo.prototype.toString = function() {
        return "bitrate=" + this.bitrate
            + ", fps=" + this.fps
            + ", droppedFrames=" + this.droppedFrames
            + ", startupTime=" + this.startupTime;
    };

    // Export symbols.
    videoplayer.QoSInfo = QoSInfo;
})(videoplayer);

(function(videoplayer) {
    'use strict';

    function VideoInfo() {
        this.playerName = null;
        this.id = null;
        this.name = null;
        this.length = null;
        this.playhead = null;
        this.streamType = null;
    }

    VideoInfo.prototype.toString = function() {
        return "playerName=" + this.playerName
            + ", id=" + this.id
            + ", name=" + this.name
            + ", length=" + this.length
            + ", playhead=" + this.playhead
            + ", streamType=" + this.streamType;
    };

    // Export symbols.
    videoplayer.VideoInfo = VideoInfo;
})(videoplayer);

(function(videoplayer) {
    'use strict';

    function VideoPlayerPluginConfig() {
        this.debugLogging = false;
    }

    // Export symbols.
    videoplayer.VideoPlayerPluginConfig = VideoPlayerPluginConfig;
})(videoplayer);

(function(videoplayer) {
    'use strict';

    function VideoPlayerPluginDelegate() {}

    VideoPlayerPluginDelegate.prototype.getVideoInfo = function() {
        throw new Error("Implementation error: Method must be overridden.");
    };

    VideoPlayerPluginDelegate.prototype.getAdBreakInfo = function() {
        return null;
    };

    VideoPlayerPluginDelegate.prototype.getAdInfo = function() {
        return null;
    };

    VideoPlayerPluginDelegate.prototype.getChapterInfo = function() {
        return null;
    };

    VideoPlayerPluginDelegate.prototype.getQoSInfo = function() {
        return null;
    };

    // Export symbols.
    videoplayer.VideoPlayerPluginDelegate = VideoPlayerPluginDelegate;
})(videoplayer);

(function(core, videoplayer) {
    'use strict';

    var BasePlugin = core.plugin.BasePlugin;

    var VideoPlayerPluginConfig = videoplayer.VideoPlayerPluginConfig;

    core.extend(VideoPlayerPlugin, BasePlugin);

    /**
     * @extends {BasePlugin}
     * @constructor
     */
    function VideoPlayerPlugin(delegate) {
        VideoPlayerPlugin.__super__.constructor.call(this, NAME);

        if (!delegate) {
            throw new Error("PlayerPlugin delegate cannot be NULL.");
        }
        this._delegate = delegate;

        this._isTrackingSessionActive = false;
        this._isTrackingSessionStarted = false;

        this._setupDataResolver();
    }

    //
    //---------------------[ Public overridden functions ]---------------------
    //
    VideoPlayerPlugin.prototype.configure = function(configData) {
        if (!configData) {
            throw new Error("Reference to the configuration data cannot be NULL.");
        }

        if (!(configData instanceof VideoPlayerPluginConfig)) {
            throw new Error("Expected config data to be instance of VideoPlayerPluginConfig.");
        }

        if (configData.debugLogging) {
            this._logger.enable();
        } else {
            this._logger.disable();
        }

        this._logger.debug(this._logTag, "#configure(debugLogging=" + configData.debugLogging + ")");
    };

    //
    //---------------------[ Public API ]---------------------
    //

    // -----------------[ Video playback tracking ]---------------------
    VideoPlayerPlugin.prototype.trackSessionStart = function() {
        this._logger.info(this._logTag, "#trackSessionStart()");

        if (!this._canProcess()) return;

        if (!this._isTrackingSessionActive) {
            this._logger.warn(this._logTag, "#trackSessionStart() > No active tracking session.");
            return;
        }

        if (this._isTrackingSessionStarted) {
            this._logger.info(this._logTag, "#trackSessionStart() > Tracking session already started.");
            return;
        }

        this._trigger(VIDEO_START);

        this._isTrackingSessionStarted = true;
    };

    VideoPlayerPlugin.prototype.trackVideoLoad = function() {
        this._logger.info(this._logTag, "#trackVideoLoad()");

        if (!this._canProcess()) return;

        this._trigger(VIDEO_LOAD);

        this._isTrackingSessionActive = true;
        this._isTrackingSessionStarted = false;
    };

    VideoPlayerPlugin.prototype.trackVideoUnload = function() {
        this._logger.info(this._logTag, "#trackVideoUnload()");

        if (!this._canProcess()) return;

        if (!this._isTrackingSessionActive) {
            this._logger.warn(this._logTag, "#trackVideoUnload() > No active tracking session.");
            return;
        }

        this._trigger(VIDEO_UNLOAD);

        this._isTrackingSessionActive = false;
        this._isTrackingSessionStarted = false;
    };

    VideoPlayerPlugin.prototype.trackPlay = function() {
        this._logger.info(this._logTag, "#trackPlay()");

        if (!this._canProcess()) return;

        if (!this._startSessionIfNeeded("trackPlay")) return;

        this._trigger(PLAY);
    };

    VideoPlayerPlugin.prototype.trackPause = function() {
        this._logger.info(this._logTag, "#trackPause()");

        if (!this._canProcess()) return;

        if (!this._startSessionIfNeeded("trackPause")) return;

        this._trigger(PAUSE);
    };

    VideoPlayerPlugin.prototype.trackBufferStart = function() {
        this._logger.info(this._logTag, "#trackBufferStart()");

        if (!this._canProcess()) return;

        if (!this._startSessionIfNeeded("trackBufferStart")) return;

        this._trigger(BUFFER_START);
    };

    VideoPlayerPlugin.prototype.trackBufferComplete = function() {
        this._logger.info(this._logTag, "#trackBufferComplete()");

        if (!this._canProcess()) return;

        if (!this._startSessionIfNeeded("trackBufferComplete")) return;

        this._trigger(BUFFER_COMPLETE);
    };

    VideoPlayerPlugin.prototype.trackSeekStart = function() {
        this._logger.info(this._logTag, "#trackSeekStart()");

        if (!this._canProcess()) return;

        if (!this._startSessionIfNeeded("trackSeekStart")) return;

        this._trigger(SEEK_START);
    };

    VideoPlayerPlugin.prototype.trackSeekComplete = function() {
        this._logger.info(this._logTag, "#trackSeekComplete()");

        if (!this._canProcess()) return;

        if (!this._startSessionIfNeeded("trackSeekComplete")) return;

        this._trigger(SEEK_COMPLETE);
    };

    VideoPlayerPlugin.prototype.trackComplete = function(completed) {
        this._logger.info(this._logTag, "#trackComplete()");

        if (!this._canProcess()) return;

        if (!this._startSessionIfNeeded("trackComplete")) return;

        var eventData = {};
        eventData[KEY_CALLBACK] = completed;

        this._trigger(VIDEO_COMPLETE, eventData);
    };

    // -----------------[ Chapter tracking ]---------------------
    VideoPlayerPlugin.prototype.trackChapterStart = function() {
        this._logger.info(this._logTag, "#trackChapterStart()");

        if (!this._canProcess()) return;

        if (!this._startSessionIfNeeded("#trackChapterStart")) return;

        this._trigger(CHAPTER_START);
    };

    VideoPlayerPlugin.prototype.trackChapterComplete = function() {
        this._logger.info(this._logTag, "trackChapterComplete()");

        if (!this._canProcess()) return;

        if (!this._startSessionIfNeeded("trackChapterComplete")) return;

        this._trigger(CHAPTER_COMPLETE);
    };

    // -----------------[ Ad tracking ]---------------------
    VideoPlayerPlugin.prototype.trackAdStart = function() {
        this._logger.info(this._logTag, "#trackAdStart()");

        if (!this._canProcess()) return;

        if (!this._startSessionIfNeeded("trackAdStart")) return;

        this._trigger(AD_START);
    };

    VideoPlayerPlugin.prototype.trackAdComplete = function() {
        this._logger.info(this._logTag, "#trackAdComplete()");

        if (!this._canProcess()) return;

        if (!this._startSessionIfNeeded("trackAdComplete")) return;

        this._trigger(AD_COMPLETE);
    };

    // -----------------[ QoS tracking ]---------------------
    VideoPlayerPlugin.prototype.trackBitrateChange = function() {
        this._logger.info(this._logTag, "#trackBitrateChange()");

        if (!this._canProcess()) return;

        if (!this._startSessionIfNeeded("trackBitrateChange")) return;

        this._trigger(BITRATE_CHANGE);
    };

    // -----------------[ Error tracking ]---------------------
    VideoPlayerPlugin.prototype.trackVideoPlayerError = function(errorId) {
        this._logger.info(this._logTag, "#trackVideoPlayerError(errorId=" + errorId + ")");

        if (!this._startSessionIfNeeded("trackVideoPlayerError")) return;

        var eventData = {};
        eventData[KEY_SOURCE] = ERROR_SOURCE_PLAYER;
        eventData[KEY_ERROR_ID] = errorId;

        this._trigger(TRACK_ERROR, eventData);
    };

    VideoPlayerPlugin.prototype.trackApplicationError = function(errorId) {
        this._logger.info(this._logTag, "#trackApplicationError(errorId=" + errorId + ")");

        if (!this._startSessionIfNeeded("trackApplicationError")) return;

        var eventData = {};
        eventData[KEY_SOURCE] = ERROR_SOURCE_APPLICATION;
        eventData[KEY_ERROR_ID] = errorId;

        this._trigger(TRACK_ERROR, eventData);
    };


    //
    // -------------------[ Private helper methods ]-----------------------
    //
    VideoPlayerPlugin.prototype._setupDataResolver = function() {
        // Set handlers for the requests we are able to handle.
        var fnMap = {};
        var cachedData = {};
        var self = this;

        function cacheVideoInfo() {
            if (cachedData["video"]) return cachedData["video"];

            cachedData["video"] = self._delegate.getVideoInfo();
            self._logger.info(self._logTag, "Data from delegate > VideoInfo: " + cachedData["video"]);

            return cachedData["video"];
        }

        function cacheAdInfo() {
            if (cachedData["ad"]) return cachedData["ad"];

            cachedData["ad"] = self._delegate.getAdInfo();
            self._logger.info(self._logTag, "Data from delegate > AdInfo: " + cachedData["ad"]);

            return cachedData["ad"];
        }

        function cacheAdBreakInfo() {
            if (cachedData["pod"]) return cachedData["pod"];

            cachedData["pod"] = self._delegate.getAdBreakInfo();
            self._logger.info(self._logTag, "Data from delegate > AdBreakInfo: " + cachedData["pod"]);

            return cachedData["pod"];
        }

        function cacheChapterInfo() {
            if (cachedData["chapter"]) return cachedData["chapter"];

            cachedData["chapter"] = self._delegate.getChapterInfo();
            self._logger.info(self._logTag, "Data from delegate > ChapterInfo: " + cachedData["chapter"]);

            return cachedData["chapter"];
        }

        function cacheQoSInfo() {
            if (cachedData["qos"]) return cachedData["qos"];

            cachedData["qos"] = self._delegate.getQoSInfo();
            self._logger.info(self._logTag, "Data from delegate > QoSInfo: " + cachedData["qos"]);

            return cachedData["qos"];
        }

        fnMap["video.id"] = function() {
            var videoInfo = cacheVideoInfo();
            var retVal = (videoInfo) ? videoInfo.id : null;
            self._logger.debug(self._logTag, "Resolving video.id: " + retVal);
            return retVal;
        };

        fnMap["video.name"] = function() {
            var videoInfo = cacheVideoInfo();
            var retVal = (videoInfo) ? videoInfo.name : null;
            self._logger.debug(self._logTag, "Resolving video.name: " + retVal);
            return retVal;
        };

        fnMap["video.length"] = function() {
            var videoInfo = cacheVideoInfo();
            var retVal = (videoInfo) ? videoInfo.length : NaN;
            self._logger.debug(self._logTag, "Resolving video.length: " + retVal);
            return retVal;
        };

        fnMap["video.playerName"] = function() {
            var videoInfo = cacheVideoInfo();
            var retVal = (videoInfo) ? videoInfo.playerName : null;
            self._logger.debug(self._logTag, "Resolving video.playerName: " + retVal);
            return retVal;
        };

        fnMap["video.streamType"] = function() {
            var videoInfo = cacheVideoInfo();
            var retVal = (videoInfo) ? videoInfo.streamType : null;
            self._logger.debug(self._logTag, "Resolving video.streamType: " + retVal);
            return retVal;
        };

        fnMap["video.playhead"] = function() {
            var videoInfo = cacheVideoInfo();
            var retVal = (videoInfo) ? videoInfo.playhead : NaN;
            self._logger.debug(self._logTag, "Resolving video.playhead: " + retVal);
            return retVal;
        };


        fnMap["pod.name"] = function() {
            var adBreakInfo = cacheAdBreakInfo();
            var retVal = (adBreakInfo) ? adBreakInfo.name : null;
            self._logger.debug(self._logTag, "Resolving pod.name: " + retVal);
            return retVal;
        };

        fnMap["pod.playerName"] = function() {
            var adBreakInfo = cacheAdBreakInfo();
            var retVal = (adBreakInfo) ? adBreakInfo.playerName : null;
            self._logger.debug(self._logTag, "Resolving pod.playerName: " + retVal);
            return retVal;
        };

        fnMap["pod.position"] = function() {
            var adBreakInfo = cacheAdBreakInfo();
            var retVal = (adBreakInfo) ? adBreakInfo.position : NaN;
            self._logger.debug(self._logTag, "Resolving pod.position: " + retVal);
            return retVal;
        };

        fnMap["pod.startTime"] = function() {
            var adBreakInfo = cacheAdBreakInfo();
            var retVal = (adBreakInfo) ? adBreakInfo.startTime : NaN;
            self._logger.debug(self._logTag, "Resolving pod.startTime: " + retVal);
            return retVal;
        };


        fnMap["ad.isInAd"] = function() {
            var adInfo = cacheAdInfo();
            var retVal = (adInfo != null);
            self._logger.debug(self._logTag, "Resolving ad.isInAd: " + retVal);
            return retVal;
        };

        fnMap["ad.isInAdBreak"] = function() {
            var adBreakInfo = cacheAdBreakInfo();
            var retVal = (adBreakInfo != null);
            self._logger.debug(self._logTag, "Resolving ad.isInAdBreak: " + retVal);
            return retVal;
        };

        fnMap["ad.id"] = function() {
            var adInfo = cacheAdInfo();
            var retVal = (adInfo) ? adInfo.id : null;
            self._logger.debug(self._logTag, "Resolving ad.id: " + retVal);
            return retVal;
        };

        fnMap["ad.name"] = function() {
            var adInfo = cacheAdInfo();
            var retVal = (adInfo) ? adInfo.name : null;
            self._logger.debug(self._logTag, "Resolving ad.name: " + retVal);
            return retVal;
        };
        fnMap["ad.length"] = function() {
            var adInfo = cacheAdInfo();
            var retVal = (adInfo) ? adInfo.length : NaN;
            self._logger.debug(self._logTag, "Resolving ad.length: " + retVal);
            return retVal;
        };

        fnMap["ad.position"] = function() {
            var adInfo = cacheAdInfo();
            var retVal = (adInfo) ? adInfo.position : NaN;
            self._logger.debug(self._logTag, "Resolving ad.position: " + retVal);
            return retVal;
        };


        fnMap["chapter.isInChapter"] = function() {
            var chapterInfo = cacheChapterInfo();
            var retVal = chapterInfo != null;
            self._logger.debug(self._logTag, "Resolving chapter.isInChapter: " + retVal);
            return retVal;
        };

        fnMap["chapter.name"] = function() {
            var chapterInfo = cacheChapterInfo();
            var retVal = (chapterInfo) ? chapterInfo.name : null;
            self._logger.debug(self._logTag, "Resolving chapter.name: " + retVal);
            return retVal;
        };

        fnMap["chapter.length"] = function() {
            var chapterInfo = cacheChapterInfo();
            var retVal = (chapterInfo) ? chapterInfo.length : NaN;
            self._logger.debug(self._logTag, "Resolving chapter.length: " + retVal);
            return retVal;
        };

        fnMap["chapter.position"] = function() {
            var chapterInfo = cacheChapterInfo();
            var retVal = (chapterInfo) ? chapterInfo.position : NaN;
            self._logger.debug(self._logTag, "Resolving chapter.position: " + retVal);
            return retVal;
        };

        fnMap["chapter.startTime"] = function() {
            var chapterInfo = cacheChapterInfo();
            var retVal = (chapterInfo) ? chapterInfo.startTime : NaN;
            self._logger.debug(self._logTag, "Resolving chapter.startTime: " + retVal);
            return retVal;
        };


        fnMap["qos.bitrate"] = function() {
            var qosInfo = cacheQoSInfo();
            var retVal = (qosInfo) ? qosInfo.bitrate : NaN;
            self._logger.debug(self._logTag, "Resolving qos.bitrate: " + retVal);
            return retVal;
        };

        fnMap["qos.fps"] = function() {
            var qosInfo = cacheQoSInfo();
            var retVal = (qosInfo) ? qosInfo.fps : NaN;
            self._logger.debug(self._logTag, "Resolving qos.fps: " + retVal);
            return retVal;
        };

        fnMap["qos.droppedFrames"] = function() {
            var qosInfo = cacheQoSInfo();
            var retVal = (qosInfo) ? qosInfo.droppedFrames : NaN;
            self._logger.debug(self._logTag, "Resolving qos.droppedFrames: " + retVal);
            return retVal;
        };

        fnMap["qos.startupTime"] = function() {
            var qosInfo = cacheQoSInfo();
            var retVal = (qosInfo) ? qosInfo.startupTime * 1000 : NaN;
            self._logger.debug(self._logTag, "Resolving qos.startupTime: " + retVal);
            return retVal;
        };

        this._dataResolver = function(keys) {
            if (!keys || keys.length == 0) return null;

            // Reset the cached data.
            cachedData = {};

            var result = null;
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                result = result || {};
                result[key] = (fnMap.hasOwnProperty(key)) ? fnMap[key].call(this) : null;
            }

            return result;
        };
    };

    VideoPlayerPlugin.prototype._startSessionIfNeeded = function(methodName) {
        if (!this._isTrackingSessionActive) {
            this._logger.warn(this._logTag, "#" + methodName + "() > No active tracking session.");
            return false;
        }

        if (!this._isTrackingSessionStarted) {
            this._logger.info(this._logTag, "#" + methodName + "() > Tracking session auto-start.");
            this.trackSessionStart();
        }

        return true;
    };

    // Private constants.
    var NAME = "player";

    var ERROR_SOURCE_APPLICATION = "sourceErrorExternal";
    var ERROR_SOURCE_PLAYER = "sourceErrorSDK";

    var VIDEO_LOAD = "video_load";
    var VIDEO_UNLOAD = "video_unload";
    var VIDEO_START = "video_start";
    var VIDEO_COMPLETE = "video_complete";
    var PLAY = "play";
    var PAUSE = "pause";
    var AD_START = "ad_start";
    var AD_COMPLETE = "ad_complete";
    var BUFFER_START = "buffer_start";
    var BUFFER_COMPLETE = "buffer_complete";
    var SEEK_START = "seek_start";
    var SEEK_COMPLETE = "seek_complete";
    var CHAPTER_START = "chapter_start";
    var CHAPTER_COMPLETE = "chapter_complete";
    var BITRATE_CHANGE = "bitrate_change";
    var TRACK_ERROR = "track_error";

    var KEY_CALLBACK = "callback";
    var KEY_SOURCE = "source";
    var KEY_ERROR_ID = "error_id";


    // Export symbols.
    videoplayer.VideoPlayerPlugin = VideoPlayerPlugin;
})(global.ADB.core, videoplayer);


// Export symbols.
global.ADB.va.plugins.videoplayer || (global.ADB.va.plugins.videoplayer = videoplayer);

})(this);

// AdobeHeartbeatPlugin
(function(global) {
if (typeof ah === 'undefined') {
    var ah = {};
}

ah.clock || (ah.clock = {});

ah.context || (ah.context = {});

ah.filter || (ah.filter = {});

ah.model || (ah.model = {});

ah.network || (ah.network = {});

(function(core, ah) {
    'use strict';

    var Event = core.Event;

    Timer.KEY_NAME = "name";
    Timer.KEY_INTERVAL = "interval";
    Timer.KEY_RESET = "reset";

    function Timer(pluginManager, channel, name, interval, logger) {
        if (!channel) {
            throw new Error("Reference to the channel object cannot be NULL");
        }
        this._channel = channel;

        if (!pluginManager) {
            throw new Error("Reference to the pluginManager object cannot be NULL");
        }
        this._pluginManager = pluginManager;

        if (!logger) {
            throw new Error("Reference to the logger object cannot be NULL");
        }
        this._logTag = "ah::Timer." + name;
        this._logger = logger;

        this._isDestroyed = false;

        // Issue a command for the clock service to create the underlying timer.
        this._createTimer(name, interval);

        this._installHandlers();
    }

    //
    // -------------------[ Public API ]-----------------------
    //

    Timer.prototype.resume = function(reset) {
        this._logger.debug(this._logTag, "Starting timer: " + this._name);

        var data = {};
        data[Timer.KEY_NAME] = HEARTBEAT_PLUGIN + "." + this._name;
        data[Timer.KEY_RESET] = reset;
        this._pluginManager.command(CLOCK_SERVICE, CMD_RESUME, data);
    };

    Timer.prototype.pause = function(reset) {
        this._logger.debug(this._logTag, "Stopping timer: " + this._name);

        var data = {};
        data[Timer.KEY_NAME] = HEARTBEAT_PLUGIN + "." + this._name;
        data[Timer.KEY_RESET] = reset;
        this._pluginManager.command(CLOCK_SERVICE, CMD_PAUSE, data);
    };

    Timer.prototype.destroy = function() {
        if (this._isDestroyed) return;
        this._isDestroyed = true;

        this._uninstallHandlers();

        // Issue a command for the clock service to destroy the underlying timer.
        var data = {};
        data[Timer.KEY_NAME] = HEARTBEAT_PLUGIN + "." + this._name;
        this._pluginManager.command(CLOCK_SERVICE, CMD_DESTROY, data);
    };

    Timer.prototype.setInterval = function(interval) {
        // Remember the current timer state.
        var isPausedKey = REQ_TIMER_IS_PAUSED + "." + HEARTBEAT_PLUGIN + "." + this._name;
        var wasPaused = this._pluginManager.request(CLOCK_SERVICE, [isPausedKey])[isPausedKey];

        // Stop the timer.
        this.pause(true);

        // Create a new timer (it will replace the old one if it already exists).
        this._createTimer(this._name, interval);

        // Restart the timer if it was active prior to the update of the timer interval.
        if (!wasPaused) {
            this.resume(true);
        }
    };


    //
    // -------------------[ Command handlers ]-----------------------
    //
    Timer.prototype._cmdResume = function(data) {
        var reset = false;

        if (data != null && data.hasOwnProperty(Timer.KEY_RESET)) {
            reset = data[Timer.KEY_RESET];
        }

        this.resume(reset);
    };

    Timer.prototype._cmdPause = function(data) {
        var reset = false;

        if (data != null && data.hasOwnProperty(Timer.KEY_RESET)) {
            reset = data[Timer.KEY_RESET];
        }

        this.pause(reset);
    };

    Timer.prototype._onTick = function(event, data) {
        // Forward the "tick" event on the "private" channel of the Heartbeat plugin.
        this._channel.trigger(new Event("clock:" + this._name + ".tick", data));
    };

    //
    // -------------------[ Private helper methods ]-----------------------
    //
    Timer.prototype._installHandlers = function() {
        this._channel.comply("clock:" + this._name + ".resume", this._cmdResume, this);
        this._channel.comply("clock:" + this._name + ".pause", this._cmdPause, this);

        this._pluginManager.on(CLOCK_SERVICE, HEARTBEAT_PLUGIN + "." + this._name + ".tick", this._onTick, this);
    };

    Timer.prototype._uninstallHandlers = function() {
        this._channel.off(null, null, this);
        this._pluginManager.off(null, null, null, this);
    };

    Timer.prototype._createTimer = function(name, interval) {
        this._name = name;
        this._interval = interval;

        var data = {};
        data[Timer.KEY_NAME] = HEARTBEAT_PLUGIN + "." + this._name;
        data[Timer.KEY_INTERVAL] = this._interval;
        this._pluginManager.command(CLOCK_SERVICE, CMD_CREATE, data);
    };

    // Private constants.
    var HEARTBEAT_PLUGIN = "heartbeat";
    var CLOCK_SERVICE = "service.clock";

    var CMD_CREATE = "create";
    var CMD_PAUSE = "pause";
    var CMD_RESUME = "resume";
    var CMD_DESTROY = "destroy";

    var REQ_TIMER_IS_PAUSED = "is_paused";

    // Export symbols.
    ah.clock.Timer = Timer;
})(global.ADB.core, ah);

(function(core, ah) {
    'use strict';

    var Event = core.Event;
    var Timer = ah.clock.Timer;

    core.extend(CheckStatusTimer, Timer);

    /**
     * @extends ah.clock.Timer
     */
    function CheckStatusTimer(pluginManager, channel, logger) {
        CheckStatusTimer.__super__.constructor.call(this,
            pluginManager,
            channel,
            NAME,
            DEFAULT_CHECK_STATUS_INTERVAL,
            logger);
    }

    //
    //--------------------[ Notification handlers ]--------------------
    //
    CheckStatusTimer.prototype._onCheckStatusComplete = function(event) {
        var newTimerInterval = event.data[KEY_CHECK_STATUS_INTERVAL];

        this._logger.debug(this._logTag, "#_onCheckStatusComplete(interval=" + newTimerInterval + ")");

        if (newTimerInterval) {
            if (newTimerInterval == this._interval) {
                this._logger.debug(this._logTag, "#_onCheckStatusComplete() > Interval value not changed.");

                // Interval has not changed. Just exit.
                return;
            }

            // Place a max cap on the check-status timer interval.
            if (newTimerInterval > MAXIMUM_CHECK_STATUS_INTERVAL) {
                this._logger.warn(this._logTag, "#_onCheckStatusComplete() > Interval value too large: " + newTimerInterval);
                this.setInterval(MAXIMUM_CHECK_STATUS_INTERVAL);
            } else {
                this._logger.debug(this._logTag, "#_onCheckStatusComplete() > Interval changed to: " + newTimerInterval);
                this.setInterval(newTimerInterval);
            }
        } else {
            // When dealing with an invalid value for the timer interval, use the default value for the timer interval.
            this._logger.warn(this._logTag, "#_onCheckStatusComplete() > Invalid interval value.");
            this.setInterval(DEFAULT_CHECK_STATUS_INTERVAL);
        }
    };


    //
    // -------------------[ Private helper methods ]-----------------------
    //
    CheckStatusTimer.prototype._getSettings = function(event) {
        this._logger.debug(this._logTag, "#_getSettings()");

        this._channel.trigger(new Event(EVENT_CLOCK_CHECK_STATUS_TICK));
    };

    CheckStatusTimer.prototype._installHandlers = function() {
        CheckStatusTimer.__super__._installHandlers.call(this);

        this._channel.on(EVENT_CLOCK_CHECK_STATUS_GET_SETTINGS, this._getSettings, this);
        this._channel.on(EVENT_NET_CHECK_STATUS_COMPLETE, this._onCheckStatusComplete, this);

        this._channel.reply(KEY_CHECK_STATUS_INTERVAL, function() { return this._interval }, this);
    };

    // Private constants.
    var NAME = "check_status";

    var MAXIMUM_CHECK_STATUS_INTERVAL = 10 * 60; // 10 minutes
    var DEFAULT_CHECK_STATUS_INTERVAL = 60; // 1 minute

    var EVENT_CLOCK_CHECK_STATUS_TICK = "clock:check_status.tick";
    var EVENT_CLOCK_CHECK_STATUS_GET_SETTINGS = "clock:check_status.get_settings";

    var EVENT_NET_CHECK_STATUS_COMPLETE = "net:check_status_complete";
    var KEY_CHECK_STATUS_INTERVAL = "check_status_interval";

    // Export symbols.
    ah.clock.CheckStatusTimer = CheckStatusTimer;
})(global.ADB.core, ah);

(function(core, ah) {
    'use strict';

    var Timer = ah.clock.Timer;

    core.extend(ReportingTimer, Timer);

    /**
     * @extends ah.clock.Timer
     */
    function ReportingTimer(pluginManager, channel, logger) {
        ReportingTimer.__super__.constructor.call(this,
            pluginManager,
            channel,
            NAME,
            DEFAULT_REPORTING_INTERVAL,
            logger);
    }

    //
    //--------------------[ Notification handlers ]--------------------
    //
    ReportingTimer.prototype._onCheckStatusComplete = function(event) {
        var newTimerInterval = event.data[KEY_REPORTING_INTERVAL];

        this._logger.debug(this._logTag, "#_onCheckStatusComplete(interval=" + newTimerInterval + ")");

        if (newTimerInterval) {
            if (newTimerInterval == this._interval) {
                this._logger.debug(this._logTag, "#_onCheckStatusComplete() > Interval value not changed.");

                // Interval has not changed. Just exit.
                return;
            }

            this._logger.debug(this._logTag, "#_onCheckStatusComplete() > Interval changed to: " + newTimerInterval);
            this.setInterval(newTimerInterval);
        } else {
            // When dealing with an invalid value for the timer interval, use the default value for the timer interval.
            this._logger.warn(this._logTag, "#_onCheckStatusComplete() > Invalid interval value.");
            this.setInterval(DEFAULT_REPORTING_INTERVAL);
        }
    };

    //
    //--------------------[ Private helper methods ]--------------------
    //
    ReportingTimer.prototype._installHandlers = function() {
        ReportingTimer.__super__._installHandlers.call(this);

        this._channel.on(EVENT_NET_CHECK_STATUS_COMPLETE, this._onCheckStatusComplete, this);

        this._channel.reply(KEY_REPORTING_INTERVAL, function() { return this._interval; }, this);
    };

    // Private constants.
    var NAME = "reporting";

    var DEFAULT_REPORTING_INTERVAL = 10; // 10 seconds

    var KEY_REPORTING_INTERVAL = "reporting_interval";

    var EVENT_NET_CHECK_STATUS_COMPLETE = "net:check_status_complete";

    // Export symbols.
    ah.clock.ReportingTimer = ReportingTimer;
})(global.ADB.core, ah);

(function(core, ah) {
    'use strict';

    var Timer = ah.clock.Timer;

    core.extend(FlushFilterTimer, Timer);

    /**
     * @extends ah.clock.Timer
     */
    function FlushFilterTimer(pluginManager, channel, logger) {
        FlushFilterTimer.__super__.constructor.call(this,
            pluginManager,
            channel,
            NAME,
            DEFAULT_FLUSH_FILTER_INTERVAL,
            logger);
    }

    // Private constants.
    var NAME = "flush_filter";

    var DEFAULT_FLUSH_FILTER_INTERVAL = .25; // 250ms

    // Export symbols.
    ah.clock.FlushFilterTimer = FlushFilterTimer;
})(global.ADB.core, ah);

(function(core, ah) {
    'use strict';

    var CheckStatusTimer = ah.clock.CheckStatusTimer;
    var FlushFilterTimer = ah.clock.FlushFilterTimer;
    var ReportingTimer = ah.clock.ReportingTimer;

    function Clock(pluginManager, channel, logger) {
        if(!pluginManager) {
            throw new Error("Reference to the pluginManager object cannot be NULL");
        }

        if(!channel) {
            throw new Error("Reference to the channel object cannot be NULL");
        }

        if(!logger) {
            throw new Error("Reference to the logger object cannot be NULL");
        }

        this._isDestroyed = false;

        // Instantiate the timers.
        this._reportingTimer = new ReportingTimer(pluginManager, channel, logger);
        this._checkStatusTimer = new CheckStatusTimer(pluginManager, channel, logger);
        this._flushFilterTimer = new FlushFilterTimer(pluginManager, channel, logger);
    }

    Clock.prototype.destroy = function() {
        if (this._isDestroyed) return;
        this._isDestroyed = true;

        this._reportingTimer.destroy();
        this._checkStatusTimer.destroy();
        this._flushFilterTimer.destroy();
    };

    // Export symbols.
    ah.clock.Clock = Clock;
})(global.ADB.core, ah);

(function(core, ah) {
    'use strict';

    function DaoField(value, hint) {
        this.value = value;
        this.hint = hint;
    }

    DaoField.HINT_SHORT = "short";


    function Dao(realm) {
        this.realm = realm;
        this.data = {};
    }

    //
    // -------------------[ Public methods ]-----------------------
    //
    Dao.prototype.setField = function(field, value, hint) {
        this.data[field] = new DaoField(value, hint);
    };


    //
    // -------------------[ Private helper methods ]-----------------------
    //
    Dao.prototype._createAccessor = function(ivar, field, hint) {
        var self = this;
        return function() {
            if (arguments.length) {
                self[ivar] = arguments[0];
                self.setField(field, arguments[0], hint);
            }

            return self[ivar];
        };
    };

    // Export symbols.
    ah.model.Dao = Dao;
    ah.model.DaoField = DaoField;
})(global.ADB.core, ah);

(function(core, ah) {
    'use strict';

    var Dao = ah.model.Dao;

    core.extend(AdDao, Dao);

    /**
     * DAO describing ad data.
     *
     * @extends {Dao}
     *
     * @constructor
     */
    function AdDao() {
        AdDao.__super__.constructor.call(this, "asset");

        this.adId = this._createAccessor("_adId", "ad_id", null);
        this.sid = this._createAccessor("_sid", "ad_sid", null);
        this.resolver = this._createAccessor("_resolver", "resolver", null);
        this.podId = this._createAccessor("_podId", "pod_id", null);
        this.podPosition = this._createAccessor("_podPosition", "pod_position", null);

        if (arguments.length && arguments[0] instanceof AdDao) {
            var other = arguments[0];

            this.adId(other.adId());
            this.sid(other.sid());
            this.resolver(other.resolver());
            this.podId(other.podId());
            this.podPosition(other.podPosition());
        } else {
            this.adId("");
            this.sid("");
            this.resolver("");
            this.podId("");
            this.podPosition("");
        }
    }

    // Export symbols.
    ah.model.AdDao = AdDao;
})(global.ADB.core, ah);

(function(core, ah) {
    'use strict';

    var Dao = ah.model.Dao;
    var DaoField = ah.model.DaoField;

    core.extend(AdobeAnalyticsDao, Dao);

    /**
     * DAO describing AdobeAnalytics config data.
     *
     * @extends {Dao}
     *
     * @constructor
     */
    function AdobeAnalyticsDao() {
        AdobeAnalyticsDao.__super__.constructor.call(this, "sc");

        this.reportSuiteId = this._createAccessor("_reportSuiteId", "rsid", null);
        this.trackingServer = this._createAccessor("_trackingServer", "tracking_server", null);
        this.ssl = this._createAccessor("_ssl", "ssl", DaoField.HINT_SHORT);

        if (arguments.length && arguments[0] instanceof AdobeAnalyticsDao) {
            var other = arguments[0];

            this.reportSuiteId(other.reportSuiteId());
            this.trackingServer(other.trackingServer());
            this.ssl(other.ssl());
        } else {
            this.reportSuiteId("");
            this.trackingServer("");
            this.ssl(0);
        }
    }

    // Export symbols.
    ah.model.AdobeAnalyticsDao = AdobeAnalyticsDao;
})(global.ADB.core, ah);

(function(core, ah) {
    'use strict';

    var Dao = ah.model.Dao;

    core.extend(ChapterDao, Dao);

    /**
     * DAO describing chapter data.
     *
     * @extends {Dao}
     *
     * @constructor
     */
    function ChapterDao() {
        ChapterDao.__super__.constructor.call(this, "stream");

        this.id = this._createAccessor("_id", "chapter_id", null);
        this.sid = this._createAccessor("_sid", "chapter_sid", null);
        this.name = this._createAccessor("_name", "chapter_name", null);
        this.position = this._createAccessor("_position", "chapter_pos", null);
        this.length = this._createAccessor("_length", "chapter_length", null);
        this.offset = this._createAccessor("_offset", "chapter_offset", null);

        if (arguments.length && arguments[0] instanceof ChapterDao) {
            var other = arguments[0];

            this.id(other.id());
            this.sid(other.sid());
            this.name(other.name());
            this.position(other.position());
            this.length(other.length());
            this.offset(other.offset());
        } else {
            this.id("");
            this.sid("");
            this.name("");
            this.position(0);
            this.length(0);
            this.offset(0);
        }
    }

    // Export symbols.
    ah.model.ChapterDao = ChapterDao;
})(global.ADB.core, ah);

(function(core, ah) {
    'use strict';

    var Dao = ah.model.Dao;
    var AdDao = ah.model.AdDao;
    var ChapterDao = ah.model.ChapterDao;

    core.extend(AssetDao, Dao);

    /**
     * DAO describing asset data.
     *
     * @extends {Dao}
     *
     * @constructor
     */
    function AssetDao() {
        AssetDao.__super__.constructor.call(this, "asset");

        this.type = this._createAccessor("_type", "type", null);
        this.videoId = this._createAccessor("_videoId", "video_id", null);
        this.publisher = this._createAccessor("_publisher", "publisher", null);
        this.adData = this._createAccessor("_adData", "ad_data", null);
        this.chapterData = this._createAccessor("_chapterData", "chapter_data", null);
        this.duration = this._createAccessor("_duration", "duration", null);

        if (arguments.length && arguments[0] instanceof AssetDao) {
            var other = arguments[0];

            this.type(other.type());
            this.videoId(other.videoId());
            this.publisher(other.publisher());
            this.duration(other.duration());

            var otherAdData = other.adData() ? new AdDao(other.adData()) : null;
            this.adData(otherAdData);

            var otherChapterData = other.chapterData() ? new ChapterDao(other.chapterData()) : null;
            this.chapterData(otherChapterData);
        } else {
            this.type("");
            this.videoId("");
            this.publisher("");
            this.duration(0);
            this.adData(null);
            this.chapterData(null);
        }
    }

    AssetDao.TYPE_AD = "ad";
    AssetDao.TYPE_MAIN_CONTENT = "main";

    // Export symbols.
    ah.model.AssetDao = AssetDao;
})(global.ADB.core, ah);

(function(core, ah) {
    'use strict';

    var Dao = ah.model.Dao;

    core.extend(EventDao, Dao);

    EventDao.EVENT_TYPE_AA_START = "aa_start";
    EventDao.EVENT_TYPE_AA_AD_START = "aa_ad_start";
    EventDao.EVENT_TYPE_START = "start";
    EventDao.EVENT_TYPE_CHAPTER_START = "chapter_start";
    EventDao.EVENT_TYPE_CHAPTER_COMPLETE = "chapter_complete";
    EventDao.EVENT_TYPE_PLAY = "play";
    EventDao.EVENT_TYPE_PAUSE = "pause";
    EventDao.EVENT_TYPE_BUFFER = "buffer";
    EventDao.EVENT_TYPE_BITRATE_CHANGE = "bitrate_change";
    EventDao.EVENT_TYPE_ERROR = "error";
    EventDao.EVENT_TYPE_COMPLETE = "complete";

    /**
     * DAO describing event data.
     *
     * @extends {Dao}
     *
     * @constructor
     */
    function EventDao() {
        EventDao.__super__.constructor.call(this, "event");

        this.type = this._createAccessor("_type", "type", null);
        this.duration = this._createAccessor("_duration", "duration", null);
        this.playhead = this._createAccessor("_playhead", "playhead", null);
        this.id = this._createAccessor("_id", "id", null);
        this.source = this._createAccessor("_source", "source", null);
        this.ts = this._createAccessor("_ts", "ts", null);
        this.prevTs = this._createAccessor("_prevTs", "prev_ts", null);

        if (arguments.length && arguments[0] instanceof EventDao) {
            var other = arguments[0];

            this.type(other.type());
            this.duration(other.duration());
            this.playhead(other.playhead());
            this.id(other.id());
            this.source(other.source());
            this.ts(other.ts());
            this.prevTs(other.prevTs());
        } else {
            this.type("");
            this.duration(0);
            this.playhead(0);
            this.id("");
            this.source("");
            this.ts(0);
            this.prevTs(-1);
        }
    }

    // Export symbols.
    ah.model.EventDao = EventDao;
})(global.ADB.core, ah);

(function(core, ah) {
    'use strict';

    var Dao = ah.model.Dao;

    core.extend(QoSDao, Dao);

    /**
     * DAO describing QoS data.
     *
     * @extends {Dao}
     *
     * @constructor
     */
    function QoSDao() {
        QoSDao.__super__.constructor.call(this, "stream");

        this.bitrate = this._createAccessor("_bitrate", "bitrate", null);
        this.fps = this._createAccessor("_fps", "fps", null);
        this.droppedFrames = this._createAccessor("_droppedFrames", "dropped_frames", null);
        this.startupTime = this._createAccessor("_startup_time", "startup_time", null);

        if (arguments.length && arguments[0] instanceof QoSDao) {
            var other = arguments[0];

            this.bitrate(other.bitrate());
            this.fps(other.fps());
            this.droppedFrames(other.droppedFrames());
            this.startupTime(other.startupTime());
            this.isStartupTimeOverridden = other.isStartupTimeOverridden;
        } else {
            this.bitrate(0);
            this.fps(0);
            this.droppedFrames(0);
            this.startupTime(0);
            this.isStartupTimeOverridden = false;
        }
    }

    // Export symbols.
    ah.model.QoSDao = QoSDao;
})(global.ADB.core, ah);

(function(core, ah) {
    'use strict';

    var Dao = ah.model.Dao;

    core.extend(ServiceProviderDao, Dao);

    /**
     * DAO describing service-provider data.
     *
     * @extends {Dao}
     *
     * @constructor
     */
    function ServiceProviderDao() {
        ServiceProviderDao.__super__.constructor.call(this, "sp");

        this.ovp = this._createAccessor("_ovp", "ovp", null);
        this.sdk = this._createAccessor("_sdk", "sdk", null);
        this.channel = this._createAccessor("_channel", "channel", null);
        this.playerName = this._createAccessor("_playerName", "player_name", null);
        this.libVersion = this._createAccessor("_libVersion", "hb_version", null);
        this.apiLevel = this._createAccessor("_apiLevel", "hb_api_lvl", null);

        if (arguments.length && arguments[0] instanceof ServiceProviderDao) {
            var other = arguments[0];

            this.ovp(other.ovp());
            this.sdk(other.sdk());
            this.channel(other.channel());
            this.playerName(other.playerName());
            this.libVersion(other.libVersion());
            this.apiLevel(other.apiLevel());
        } else {
            this.ovp(UNKNOWN);
            this.sdk(UNKNOWN);
            this.channel(UNKNOWN);
            this.playerName("");
            this.libVersion("");
            this.apiLevel(0);
        }
    }

    // Private constants.
    var UNKNOWN = 'unknown';

    // Export symbols.
    ah.model.ServiceProviderDao = ServiceProviderDao;
})(global.ADB.core, ah);

(function(core, ah) {
    'use strict';

    var Dao = ah.model.Dao;

    core.extend(SessionDao, Dao);

    /**
     * DAO describing session data.
     *
     * @extends {Dao}
     *
     * @constructor
     */
    function SessionDao() {
        SessionDao.__super__.constructor.call(this, "event");

        this.sessionId = this._createAccessor("_sessionId", "sid", null);

        if (arguments.length && arguments[0] instanceof SessionDao) {
            var other = arguments[0];

            this.sessionId(other.sessionId());
        } else {
            this.sessionId(null);
        }
    }

    // Export symbols.
    ah.model.SessionDao = SessionDao;
})(global.ADB.core, ah);

(function(core, ah) {
    'use strict';

    var Dao = ah.model.Dao;

    core.extend(StreamDao, Dao);

    /**
     * DAO describing stream data.
     *
     * @extends {Dao}
     *
     * @constructor
     */
    function StreamDao() {
        StreamDao.__super__.constructor.call(this, "stream");

        this.type = this._createAccessor("_type", "type", null);

        if (arguments.length && arguments[0] instanceof StreamDao) {
            var other = arguments[0];

            this.type(other.type());
        } else {
            this.type(null);
        }
    }

    // Export symbols.
    ah.model.StreamDao = StreamDao;
})(global.ADB.core, ah);

(function(core, ah) {
    'use strict';

    var Dao = ah.model.Dao;

    core.extend(UserDao, Dao);

    /**
     * DAO describing user data.
     *
     * @extends {Dao}
     *
     * @constructor
     */
    function UserDao() {
        UserDao.__super__.constructor.call(this, "user");

        this.analyticsVisitorId = this._createAccessor("_analyticsVisitorId", "aid", null);
        this.marketingCloudVisitorId = this._createAccessor("_marketingCloudVisitorId", "mid", null);
        this.visitorId = this._createAccessor("_visitorId", "id", null);

        if (arguments.length && arguments[0] instanceof UserDao) {
            var other = arguments[0];

            this.analyticsVisitorId(other.analyticsVisitorId());
            this.marketingCloudVisitorId(other.marketingCloudVisitorId());
            this.visitorId(other.visitorId());
        } else {
            this.analyticsVisitorId(null);
            this.marketingCloudVisitorId(null);
            this.visitorId(null);
        }
    }

    // Export symbols.
    ah.model.UserDao = UserDao;
})(global.ADB.core, ah);

(function(ah) {
    'use strict';

    var EventDao = ah.model.EventDao;
    var AssetDao = ah.model.AssetDao;
    var StreamDao = ah.model.StreamDao;
    var QoSDao = ah.model.QoSDao;

    function TrackItem(context, eventType, playhead, meta, callback) {
        this.eventData = new EventDao();
        this.eventData.type(eventType);
        this.eventData.duration(0);
        this.eventData.ts(new Date().getTime());
        this.eventData.playhead(playhead);

        this.assetData = new AssetDao(context._assetData);
        this.streamData = new StreamDao(context._streamData);
        this.qosData = new QoSDao(context._qosData);
        this.meta = meta;
        this.callback = callback;
    }

    // Export symbols.
    ah.model.TrackItem = TrackItem;
})(ah);

(function(utils, ah) {
    'use strict';

    var ObjectUtils = utils.ObjectUtils;

    var EventDao = ah.model.EventDao;
    var AssetDao = ah.model.AssetDao;
    var StreamDao = ah.model.StreamDao;
    var QoSDao = ah.model.QoSDao;


    function Report(adobeAnalyticsData, userData, serviceProviderData, sessionData, item) {
        this.adobeAnalyticsData = adobeAnalyticsData;
        this.userData = userData;
        this.serviceProviderData = serviceProviderData;
        this.sessionData = sessionData;

        this.eventData = new EventDao(item.eventData);
        this.assetData = new AssetDao(item.assetData);
        this.streamData = new StreamDao(item.streamData);
        this.qosData = new QoSDao(item.qosData);
        this.meta = ObjectUtils.clone(item.meta);
        this.callback = item.callback;
    }

    // Export symbols.
    ah.model.Report = Report;
})(global.ADB.va.utils, ah);

(function(ah) {
    'use strict';

    /**
     * Interface to be respected by all serializers
     *
     * @interface
     */
    function ISerializer() {}

    ISerializer.prototype.serializeReport = function(report) {};

    ISerializer.prototype.serializeDao = function(dao) {};

    ISerializer.prototype.serializeMap = function(map) {};

    ISerializer.prototype.serializeNumber = function(key, number, realm, hint) {};

    ISerializer.prototype.serializeString = function(key, string, realm, hint) {};

    // Export symbols.
    ah.model.ISerializer = ISerializer;
})(ah);

(function(core, ah) {
    'use strict';

    var Dao = ah.model.Dao;
    var DaoField = ah.model.DaoField;
    var ISerializer = ah.model.ISerializer;

    core.extend(QuerystringSerializer, ISerializer);

    /**
     * Serializes DAO into URL query strings.
     *
     * @implements {ISerializer}
     *
     * @constructor
     */
    function QuerystringSerializer(logger) {
        if(!logger) {
            throw new Error("Reference to the logger object cannot be NULL");
        }
        this._logger = logger;
    }

    //
    // -------------------[ Public methods ]-----------------------
    //
    QuerystringSerializer.prototype.serializeReport = function(report) {
        var result = [];

        // Add the AA data.
        result.push(this.serializeDao(report.adobeAnalyticsData));

        // Add the user data.
        result.push(this.serializeDao(report.userData));

        // Add the SP data.
        result.push(this.serializeDao(report.serviceProviderData));

        // Add the session data.
        result.push(this.serializeDao(report.sessionData));

        // Add the event data.
        result.push(this.serializeDao(report.eventData));

        // Add the asset data.
        result.push(this.serializeDao(report.assetData));

        // Add the stream data.
        result.push(this.serializeDao(report.streamData));

        // Add the QoS data.
        result.push(this.serializeDao(report.qosData));

        // Add the meta-data.
        result.push(this.serializeMap(report.meta));

        return {
            serializedOutput: result.filter(function(item) {
                return !!item;
            }).join("&"),

            callback: report.callback
        };
    };

    QuerystringSerializer.prototype.serializeDao = function(dao) {
        var result = this._processDao(dao);

        return result.filter(function(item) {
            return !!item;
        }).join("&");
    };

    QuerystringSerializer.prototype.serializeMap = function(map) {
        var result = [];

        for (var key in map) {
            if (map.hasOwnProperty(key) && map[key]) {
                result.push("s:meta:" + key + "=" + window["encodeURIComponent"](map[key]));
            }
        }

        return result.join("&");
    };

    QuerystringSerializer.prototype.serializeNumber = function(key, number, realm, hint) {
        var dataType = DATA_TYPE_LONG;

        if (number != null && !isNaN(number)) {
            if (hint === DaoField.HINT_SHORT) {
                dataType = DATA_TYPE_SHORT;
            }

            return dataType + ":" + realm + ":" + key + "=" + Math.floor(number);
        }

        return null;
    };

    QuerystringSerializer.prototype.serializeString = function(key, string, realm, hint) {
        if (string) {
            return DATA_TYPE_STRING + ":" + realm + ":" + key + "=" + window["encodeURIComponent"](string);
        }

        return null;
    };

    //
    // -------------------[ Private helper methods ]-----------------------
    //

    QuerystringSerializer.prototype._processDao = function(dao) {
        var result = [];

        for (var key in dao.data) {
            if (dao.data.hasOwnProperty(key)) {
                var field = dao.data[key];

                var value = field.value;
                var hint = field.hint;
                var serializedValue = null;
                var realm = dao.realm;

                if (value == null) {
                    continue;
                }

                if (typeof value === 'number') {
                    serializedValue = this.serializeNumber(key, value, realm, hint);
                } else if (typeof value === 'string') {
                    serializedValue = this.serializeString(key, value, realm, hint);
                } else if (value instanceof Dao) {
                    serializedValue = this.serializeDao(value);
                } else {
                    this._logger.warn(LOG_TAG, '#_processDao() > Unable to serialize DAO. Field: ' + key + '. Value: ' + value + '.');
                }

                if (serializedValue) {
                    result.push(serializedValue);
                }
            }
        }

        return result;
    };

    // Private constants.
    var LOG_TAG = "ah::QuerystringSerializer";

    var DATA_TYPE_LONG = "l";
    var DATA_TYPE_SHORT = "h";
    var DATA_TYPE_STRING = "s";

    // Export symbols.
    ah.model.QuerystringSerializer = QuerystringSerializer;
})(global.ADB.core, ah);

(function(core, ah) {
    'use strict';

    function SettingsParser(data, logger) {
        if (!data) {
            throw new Error("Reference to the data object cannot be NULL");
        }
        this._data = data;

        if(!logger) {
            throw new Error("Reference to the logger object cannot be NULL");
        }
        this._logger = logger;
    }

    SettingsParser.prototype.parse = function() {
        var reportingInterval, checkStatusInterval, trackExternalErrors;
        var xmlDoc;

        if (window["DOMParser"]) {
            var parser = new window["DOMParser"]();
            xmlDoc = parser.parseFromString(this._data, "text/xml");
        }
        // Internet Explorer
        else {
            xmlDoc = new window["ActiveXObject"]("Microsoft.XMLDOM");
            xmlDoc.async = false;
            xmlDoc.loadXML(this.data);
        }

        var temp;
        temp = parseInt(xmlDoc.getElementsByTagName("trackingInterval")[0].childNodes[0].nodeValue, 10);
        temp && (reportingInterval = temp);

        temp = parseInt(xmlDoc.getElementsByTagName("setupCheckInterval")[0].childNodes[0].nodeValue, 10);
        temp && (checkStatusInterval = temp);

        temp = parseInt(xmlDoc.getElementsByTagName("trackExternalErrors")[0].childNodes[0].nodeValue, 10);
        temp && (trackExternalErrors = (temp == 1));

        // Tell everybody about the update in the configuration data.
        var eventData = {};
        eventData[KEY_REPORTING_INTERVAL] = reportingInterval;
        eventData[KEY_CHECK_STATUS_INTERVAL] = checkStatusInterval;
        eventData[KEY_TRACK_EXTERNAL_ERRORS] = trackExternalErrors;

        this._logger.debug(LOG_TAG, "#parse() > Obtained configuration settings.");

        return eventData;
    };

    // Private constants.
    var LOG_TAG = "ah::SettingsParser";

    var KEY_REPORTING_INTERVAL = "reporting_interval";
    var KEY_CHECK_STATUS_INTERVAL = "check_status_interval";
    var KEY_TRACK_EXTERNAL_ERRORS = "track_external_errors";

    // Export symbols.
    ah.network.SettingsParser = SettingsParser;
})(global.ADB.core, ah);

(function(core, ah) {
    'use strict';

    var Event = core.Event;
    var URLRequestMethod = core.URLRequestMethod;
    var URLRequest = core.URLRequest;
    var URLLoader = core.URLLoader;
    var SettingsParser = ah.network.SettingsParser;
    var QuerystringSerializer = ah.model.QuerystringSerializer;

    function Network(channel, logger) {
        this._trackingServer = null;
        this._checkStatusServer = null;

        this._publisher = null;

        this._quietMode  = false;
        this._isConfigured = false;
        this._isDestroyed = false;

        if (!channel) {
            throw new Error("Reference to the channel object cannot be NULL");
        }
        this._channel = channel;

        if (!logger) {
            throw new Error("Reference to the logger object cannot be NULL");
        }
        this._logger = logger;

        this._serializer = new QuerystringSerializer(logger);

        this._installEventListeners();
    }

    //
    //--------------------[ Public API ]--------------------
    //
    Network.prototype.destroy = function() {
        if (this._isDestroyed) return;
        this._isDestroyed = true;

        this._logger.debug(LOG_TAG, "#destroy()");

        this._uninstallEventListeners();
    };

    //
    //--------------------[ Event handlers ]--------------------
    //
    Network.prototype._onApiConfig = function(event) {
        var data = event.data;

        this._logger.debug(LOG_TAG, "#_onApiConfig(" +
              "sb_server=" + data[KEY_TRACKING_SERVER] +
            ", check_status_server=" + data[KEY_CHECK_STATUS_SERVER] +
            ", publisher=" + data[KEY_PUBLISHER] +
            ", quiet_mode=" + data[KEY_QUIET_MODE] +
            ", ssl=" + data[KEY_SSL] +
            ")");

        this._trackingServer = this._updateRequestProtocol(data[KEY_TRACKING_SERVER], data[KEY_SSL]);
        this._checkStatusServer = this._updateRequestProtocol(data[KEY_CHECK_STATUS_SERVER], data[KEY_SSL]);

        this._publisher = data[KEY_PUBLISHER];

        this._quietMode = data[KEY_QUIET_MODE];

        // We are now configured.
        this._isConfigured = true;
    };

    Network.prototype._onFilterReportAvailable = function(event) {
        var data = event.data;

        // If we are not configured, we do nothing.
        if (!this._isConfigured) {
            this._logger.warn(LOG_TAG, "#_onFilterReportAvailable() > Unable to send request: not configured.");
            return;
        }

        // Obtain the serialized payload.
        var report = data[KEY_REPORT];
        var payload = this._serializer.serializeReport(report);


        // Create and send the request.
        var url = this._trackingServer + "/?" + payload.serializedOutput;
        var req = new URLRequest(url, URLRequestMethod.GET);

        this._logger.debug(LOG_TAG, "_onFilterReportAvailable() > " + req.url);

        var self = this;

        var _onSuccess = function(e) {
            loader.close();
            if (payload.callback) {
                payload.callback.call(null);
            }
        };

        var _onError = function(e) {
            loader.close();
            self._logger.warn(LOG_TAG, "#_onFilterReportAvailable() > Failed to send heartbeat report.");
            if (payload.callback) {
                payload.callback.call(null);
            }
        };

        // We only send the request over the wire if the quiet-mode flag is not switched on.
        if (!this._quietMode) {
            var loader = new URLLoader();

            loader.addEventListener(Event.SUCCESS, _onSuccess, this);
            loader.addEventListener(Event.ERROR, _onError, this);
            loader.load(req);
        }
    };

    Network.prototype._onClockCheckStatusTick = function(e) {
        // If we are not configured, we do nothing.
        if (!this._isConfigured) {
            this._logger.warn(LOG_TAG, "#_onClockCheckStatusTick() > Unable to send request: not configured.");
            return;
        }

        // Fast exit.
        if (!this._publisher) {
            this._logger.warn(LOG_TAG, "#_onClockCheckStatusTick() > Publisher is NULL.");
            return;
        }

        var self = this;
        function onSuccess(e) {
            if (e.data) {
                // Parse the settings document
                var parser = new SettingsParser(e.data.response, self._logger);
                var parseResult = parser.parse();

                if (parseResult) {
                    self._channel.trigger(new Event(EVENT_NET_CHECK_STATUS_COMPLETE, parseResult));
                } else {
                    self._logger.warn(LOG_TAG, "#_onClockCheckStatusTick() > Failed to parse the config. settings.");
                }
            }

            loader.close();
        }

        function onError(e) {
            self._logger.warn(LOG_TAG, '#_onClockCheckStatusTick() > Failed to obtain the config. settings.');
            loader.close();
        }

        // Sanitize input.
        var publisher = this._publisher.replace(/[^a-zA-Z0-9]+/, "-").toLocaleLowerCase();
        var url = this._checkStatusServer + publisher + ".xml?r=" + new Date().getTime();
        var req = new URLRequest(url, URLRequestMethod.GET);

        var loader = new URLLoader();
        loader.addEventListener(Event.SUCCESS, onSuccess, this);
        loader.addEventListener(Event.ERROR, onError, this);

        this._logger.debug(LOG_TAG, "#_onClockCheckStatusTick() > Get new settings from: " + url);
        loader.load(req);
    };

    //
    //--------------------[ Private helper methods ]--------------------
    //
    Network.prototype._updateRequestProtocol = function(url, useSsl) {
        var stripped = url;

        // Strip away the protocol (if exists).
        if (stripped.indexOf("http://") === 0) {
            stripped = stripped.slice(7);
        } else if (stripped.indexOf("https://") === 0) {
            stripped = stripped.slice(8);
        }

        return useSsl ? "https://" + stripped
                      : "http://" + stripped;
    };

    Network.prototype._installEventListeners = function () {
        this._channel.on(EVENT_API_CONFIG, this._onApiConfig, this);
        this._channel.on(EVENT_FILTER_REPORT_AVAILABLE, this._onFilterReportAvailable, this);
        this._channel.on(EVENT_CLOCK_CHECK_STATUS_TICK, this._onClockCheckStatusTick, this);
    };

    Network.prototype._uninstallEventListeners = function () {
        this._channel.off(null, null, this);
    };

    // Private constants.
    var LOG_TAG = "ah::Network";

    var KEY_TRACKING_SERVER = "tracking_server";
    var KEY_CHECK_STATUS_SERVER = "check_status_server";
    var KEY_PUBLISHER = "publisher";
    var KEY_QUIET_MODE = "quiet_mode";
    var KEY_SSL = "ssl";
    var KEY_REPORT = "report";

    var EVENT_API_CONFIG = "api:config";

    var EVENT_FILTER_REPORT_AVAILABLE = "filter:data_available";

    var EVENT_CLOCK_CHECK_STATUS_TICK = "clock:check_status.tick";

    var EVENT_NET_CHECK_STATUS_COMPLETE = "net:check_status_complete";

    // Export symbols.
    ah.network.Network = Network;
})(global.ADB.core, ah);

(function(core, ah) {
    'use strict';

    var Command = core.radio.Command;
    var CommandQueue = core.radio.CommandQueue;
    var Event = core.Event;

    var EventDao = ah.model.EventDao;
    var AssetDao = ah.model.AssetDao;

    function ReportFilter(channel, logger) {
        if (!channel) {
            throw new Error("Reference to the channel object cannot be NULL");
        }
        this._channel = channel;

        if (!logger) {
            throw new Error("Reference to the logger object cannot be NULL");
        }
        this._logger = logger;

        this._isDestroyed = false;
        this._isBufferingInProgress = false;
        this._reportBuffer = {};
        this._tsHistory = {};
        this._workQueue = new CommandQueue();

        this._installEventListeners();
    }

    //
    //---------------------[ Public API ]---------------------
    //
    ReportFilter.prototype.destroy = function() {
        if (this._isDestroyed) return;
        this._isDestroyed = true;

        this._logger.debug(LOG_TAG, "#destroy()");

        this._uninstallEventListeners();

        this._workQueue.cancelAllCommands();
        this._reportBuffer = {};
        this._tsHistory = {};
        this._isBufferingInProgress = false;
    };

    //
    //---------------------[ Private API ]---------------------
    //
    ReportFilter.prototype._bufferReport = function(data) {
        // Fast exit.
        if (this._isDestroyed) return;

        var report = data[KEY_REPORT];

        if (report) {
            // We place reports in separate buckets based on session IDs.
            //
            // Normally we would not be processing reports from multiple session,
            // but we must cover the corner case when a new session is started
            // before the reports from the previous session have yet to be flushed
            // (i.e. the video-playlist scenario).

            var sessionId = report.sessionData.sessionId();
            this._reportBuffer[sessionId] = this._reportBuffer[sessionId] || [];
            this._reportBuffer[sessionId].push(report);
        }

        if (!this._isBufferingInProgress) {
            this._isBufferingInProgress = true;

            // Restart the timer handling the periodic report updates.
            var params = {};
            params[KEY_RESET] = true;
            params[KEY_REPEAT_COUNT] = 1;
            this._channel.command(CMD_ENABLE_FLUSH_FILTER_TIMER, params);
        }
    };

    ReportFilter.prototype._flushBufferReport = function() {
        // Fast exit.
        if (this._isDestroyed) return;

        var self = this;
        function computePrevTsValues(reports) {
            if (reports) {
                for (var i = 0; i < reports.length; i++) {
                    var report = reports[i];
                    var sessionId = report.sessionData.sessionId();

                    self._tsHistory[sessionId] = self._tsHistory[sessionId] || {};

                    var key = report.eventData.type() + "." +
                        ((report.assetData.type() == AssetDao.TYPE_AD)
                            ? report.assetData.adData().adId()
                            : report.assetData.videoId());

                    if (self._tsHistory[sessionId].hasOwnProperty(key)) {
                        report.eventData.prevTs(self._tsHistory[sessionId][key]);
                    }
                    self._tsHistory[sessionId][key] = report.eventData.ts();
                }
            }
        }

        for (var sessionId in this._reportBuffer) {
            if (this._reportBuffer.hasOwnProperty(sessionId)) {
                // Apply the filters first.
                //
                // NOTE: the order of filter application is not functionally relevant.
                // However, for marginal performance reasons, we want to apply the heaviest
                // filtering last (on the least amount of elements).
                var filteredReports =
                    _filterPlayReports(
                        _filterStartReports(
                            _filterPauseReports(
                                this._reportBuffer[sessionId])));

                // The filtering is complete: we can now set the prevTs values.
                computePrevTsValues(filteredReports);

                // Trigger a FILTER_REPORT_AVAILABLE for each report.
                for (var i = 0; i < filteredReports.length; i++) {
                    var report = filteredReports[i];
                    var eventData = {};
                    eventData[KEY_REPORT] = report;
                    this._channel.trigger(new Event(EVENT_FILTER_REPORT_AVAILABLE, eventData));
                }
            }
        }

        // Reset the report buffer.
        this._reportBuffer = {};

        // Cleanup the time-stamp history.
        // We're no longer interested in maintaining prev-ts
        // values for sessions other than the current session.
        var currentSession = this._channel.request(REQ_SESSION_ID);
        var currentSessionData = this._tsHistory[currentSession] || {};
        this._tsHistory = {};
        this._tsHistory[currentSession] = currentSessionData;

        // We're no longer buffering reports.
        this._isBufferingInProgress = false;
    };

    ReportFilter.prototype._onContextReportAvailable = function(event) {
        var data = event.data;

        // Always enqueue the operation to avoid concurrent access to the
        // _reportBuffer data structure.
        //
        // Obviously, in AS we don't have to worry about multi-threading issues,
        // but we want to have this for code consistency across platforms.
        this._workQueue.addCommand(new Command(this._bufferReport, this, [data]));
    };

    ReportFilter.prototype._onClockFlushFilterTick = function(event) {
        // Always enqueue the operation to avoid concurrent access to the
        // _reportBuffer data structure.
        //
        // Obviously, in AS we don't have to worry about multi-threading issues,
        // but we want to have this for code consistency across platforms.
        this._workQueue.addCommand(new Command(this._flushBufferReport, this));
    };

    ReportFilter.prototype._installEventListeners = function() {
        this._channel.on(EVENT_CONTEXT_REPORT_AVAILABLE, this._onContextReportAvailable, this);
        this._channel.on(EVENT_CLOCK_FLUSH_FILTER_TICK, this._onClockFlushFilterTick, this);
    };

    ReportFilter.prototype._uninstallEventListeners = function() {
        this._channel.off(null, null, this);
    };

    //
    //---------------------[ Filter definitions (private static) ]---------------------
    //
    function _filterPauseReports(reports) {
        var result = [];

        if (reports) {
            for (var i = 0; i < reports.length; i++) {
                var report = reports[i];

                if (report.eventData.type() != EventDao.EVENT_TYPE_PAUSE) {
                    result.push(report);
                }
            }
        }

        return result;
    }

    // Compact multiple START-typed reports into a single report.
    // We look for video and ad START reports. If the duration is 0, we look for another
    // corresponding START report in the list of in-band reports.
    //   - if not found just send the report with duration 0
    //   - if found, compact it into a single START report with duration grater than 0
    function _filterStartReports(reports) {
        var videoStartReportIdx = -1;
        var adStartReportIdx = -1;
        var result = [];

        reports.forEach(function(report) {
            if (report.eventData.type() ==  EventDao.EVENT_TYPE_START) {
                if (report.assetData.type() == AssetDao.TYPE_MAIN_CONTENT) {
                    if (videoStartReportIdx == -1) {
                        videoStartReportIdx = result.push(report) - 1;
                    } else {
                        report.eventData.prevTs(-1);
                        result[videoStartReportIdx] = report;
                    }
                } else {
                    if (adStartReportIdx == -1) {
                        adStartReportIdx = result.push(report) - 1;
                    } else {
                        report.eventData.prevTs(-1);
                        result[adStartReportIdx] = report;
                    }
                }
            } else {
                result.push(report);
            }
        });

        return result;
    }

    function _filterPlayReports(reports) {
        var result = [];

        reports.forEach(function(report) {
            if (report.eventData.type() == EventDao.EVENT_TYPE_PLAY) {
                // Accept the PLAY reports with a duration greater than the threshold.
                if (report.eventData.duration() > PLAY_EVENT_DURATION_THRESHOLD) {
                    result.push(report);
                }

                // If the duration of the main-content PLAY report is 0...
                else if (report.eventData.duration() == 0 &&
                    report.assetData.type() == AssetDao.TYPE_MAIN_CONTENT) {
                    // ... but there's no other "in-band" report after it,
                    // than we want to let it through.
                    var inBandReports = _filterInBandReports(reports);
                    if (inBandReports.indexOf(report) == inBandReports.length - 1) {
                        result.push(report);
                    }
                }
            } else {
                result.push(report);
            }
        });

        return result;
    }

    function _filterInBandReports(reports) {
        var result = [];

        reports.forEach(function(report) {
            if (report.eventData.type() == EventDao.EVENT_TYPE_PLAY ||
                report.eventData.type() == EventDao.EVENT_TYPE_BUFFER ||
                report.eventData.type() == EventDao.EVENT_TYPE_START) {

                result.push(report);
            }
        });

        return result;
    }


    // Private constants.
    var EVENT_CONTEXT_REPORT_AVAILABLE = "context:report_available";
    var EVENT_FILTER_REPORT_AVAILABLE = "filter:data_available";

    var EVENT_CLOCK_FLUSH_FILTER_TICK = "clock:flush_filter.tick";

    var KEY_RESET = "reset";
    var KEY_REPORT = "report";
    var KEY_REPEAT_COUNT = "repeat_count";

    var CMD_ENABLE_FLUSH_FILTER_TIMER = "clock:flush_filter.resume";

    var PLAY_EVENT_DURATION_THRESHOLD = 250; // 250 ms

    var REQ_SESSION_ID = "session_id";

    var LOG_TAG = "ah::ReportFilter";

    // Export symbols.
    ah.filter.ReportFilter = ReportFilter;
})(global.ADB.core, ah);

(function(va, ah) {
    'use strict';

    var ErrorInfo = va.ErrorInfo;

    function InputDataValidator(onFail, ctx) {
        this._onFail = {
            fn: onFail,
            ctx: ctx
        };
    }

    //
    //---------------------[ Public API ]---------------------
    //
    InputDataValidator.prototype.validateFields = function(data, params) {
        if (!data) {
            return this._fail("Data cannot be null");
        }

        if (params) {
            for (var i = 0; i < params.length; i++) {
                var param = params[i];
                
                switch (param) {
                    // VideoInfo fields
                    case "videoId":
                        if (!data.hasOwnProperty("videoId")) return this._fail("The ID for the main video must be specified.");
                        if (typeof data.videoId != "string") return this._fail("The ID for the main video must be a String.");
                        if (data.videoId === "") return this._fail("The ID for the main video cannot be an empty string.");
                        break;

                    case "streamType":
                        if (!data.hasOwnProperty("streamType")) return this._fail("The stream type for the main video must be specified.");
                        if (typeof data.streamType != "string") return this._fail("The stream type for the main video must be a String.");
                        if (data.streamType === "") return this._fail("The stream type for the main video cannot be an empty string.");
                        break;

                    case "videoLength":
                        if (!data.hasOwnProperty("videoLength")) return this._fail("The length of the main video must be specified.");
                        if (typeof data.videoLength != "number") return this._fail("The length of the main video must be a Number.");
                        if (isNaN(data.videoLength)) return this._fail("The length of the main video cannot be NaN.");
                        break;

                    case "playhead":
                        if (!data.hasOwnProperty("playhead")) return this._fail("The playhead for the main video must be specified.");
                        if (typeof data.playhead != "number") return this._fail("The playhead for the main video must be a Number.");
                        if (isNaN(data.playhead)) return this._fail("The playhead for the main video cannot be NaN.");
                        break;

                    case "playerName":
                        if (!data.hasOwnProperty("playerName")) return this._fail("The player name for the main video must be specified.");
                        if (typeof data.playerName != "string") return this._fail("The player name for the main video must be a String.");
                        if (data.playerName === "") return this._fail("The player name for the main video cannot be an empty string.");
                        break;


                    // AdBreakInfo fields
                    case "podPlayerName":
                        if (!data.hasOwnProperty("podPlayerName")) return this._fail("The player name for the ad-break must be specified.");
                        if (typeof data.podPlayerName != "string") return this._fail("The player name for the ad-break must be a String.");
                        if (data.podPlayerName === "") return this._fail("The player name for the ad-break cannot be an empty string.");
                        break;
                    case "podPosition":
                        if (!data.hasOwnProperty("podPosition")) return this._fail("Position (index) of the ad-break must be specified.");
                        if (typeof data.podPosition != "number") return this._fail("Position (index) of the ad-break must be a Number.");
                        if (isNaN(data.podPosition)) return this._fail("Position (index) of the ad-break cannot be NaN.");
                        break;


                    // AdInfo fields
                    case "adId":
                        if (!data.hasOwnProperty("adId")) return this._fail("The ad ID must be specified.");
                        if (typeof data.adId != "string") return this._fail("The ad ID must be a String.");
                        if (data.adId === "") return this._fail("The ad ID cannot be an empty string.");
                        break;

                    case "adPosition":
                        if (!data.hasOwnProperty("adPosition")) return this._fail("Position (index) of the ad must be specified.");
                        if (typeof data.adPosition != "number") return this._fail("Position (index) of the ad must be a Number.");
                        if (isNaN(data.adPosition)) return this._fail("Position (index) of the ad cannot be NaN.");
                        break;


                    // ChapterInfo fields
                    case "chapterPosition":
                        if (!data.hasOwnProperty("chapterPosition")) return this._fail("Position (index) of the chapter must be specified.");
                        if (typeof data.chapterPosition != "number") return this._fail("Position (index) of the chapter must be a Number.");
                        if (isNaN(data.chapterPosition)) return this._fail("Position (index) of the chapter cannot be NaN.");
                        break;

                    case "chapterOffset":
                        if (!data.hasOwnProperty("chapterOffset")) return this._fail("Chapter start-time (offset) must be specified.");
                        if (typeof data.chapterOffset != "number") return this._fail("Chapter start-time (offset) must be a Number.");
                        if (isNaN(data.chapterOffset)) return this._fail("Chapter start-time (offset) cannot be NaN.");
                        break;

                    case "chapterLength":
                        if (!data.hasOwnProperty("chapterLength")) return this._fail("The length of the chapter must be specified.");
                        if (typeof data.chapterLength != "number") return this._fail("The length of the chapter must be a Number.");
                        if (isNaN(data.chapterLength)) return this._fail("The length of the chapter cannot be NaN.");
                        break;

                    // Don't know what to do with this.
                    default:
                        return this._fail("Unable to validate unknown parameter: " + param);
                        break;
                }
            }
        }

        return true;
    };

    //
    //---------------------[ Private helper functions ]-----------------------
    //

    InputDataValidator.prototype._fail = function(errorString) {
        var errorInfo = new ErrorInfo("Invalid input data", errorString);

        if (this._onFail.fn) {
            this._onFail.fn.call(this._onFail.ctx, errorInfo);
        }

        return false;
    };

    // Export symbols.
    ah.context.InputDataValidator = InputDataValidator;
})(global.ADB.va, ah);

(function(core, ah) {
    'use strict';

    var Report = ah.model.Report;

    function ReportFactory(context, logger) {
        if(!logger) {
            throw new Error("Reference to the logger object cannot be NULL");
        }
        this._logger = logger;

        if(!context) {
            throw new Error("Reference to the context object cannot be NULL");
        }
        this._context = context;
    }

    //
    // ------------[ Public API ]---------------
    //
    ReportFactory.prototype.createReportForItem = function(item) {
        this._logger.debug(LOG_TAG, "Creating report for item: " + item.eventData.type());

        return new Report(this._context._adobeAnalyticsData,
                          this._context._userData,
                          this._context._serviceProviderData,
                          this._context._sessionData,
                          item);
    };

    // Private constants.
    var LOG_TAG = "ah::ReportFactory";

    // Export symbols.
    ah.context.ReportFactory = ReportFactory;
})(global.ADB.core, ah);

(function(core, va, utils, ah) {
    'use strict';

    var MD5 = utils.md5;
    var ObjectUtils = utils.ObjectUtils;

    var Event = core.Event;

    var SessionDao = ah.model.SessionDao;
    var AdobeAnalyticsDao = ah.model.AdobeAnalyticsDao;
    var ServiceProviderDao = ah.model.ServiceProviderDao;
    var UserDao = ah.model.UserDao;
    var EventDao = ah.model.EventDao;
    var AssetDao = ah.model.AssetDao;
    var StreamDao = ah.model.StreamDao;
    var QoSDao = ah.model.QoSDao;
    var AdDao = ah.model.AdDao;
    var ChapterDao = ah.model.ChapterDao;
    var TrackItem = ah.model.TrackItem;

    var ReportFactory = ah.context.ReportFactory;
    var InputDataValidator = ah.context.InputDataValidator;


    function Context(channel, logger) {
        if (!channel) {
            throw new Error("Reference to the channel object cannot be NULL");
        }
        this._channel = channel;

        if (!logger) {
            throw new Error("Reference to the logger object cannot be NULL");
        }
        this._logger = logger;

        this._lastInBandItem = null;
        this._autoComputedStartupTime = 0;

        this._assetData = null;
        this._streamData = null;
        this._qosData = null;
        this._sessionData = null;

        this._adobeAnalyticsData = new AdobeAnalyticsDao();
        this._serviceProviderData = new ServiceProviderDao();
        this._userData = new UserDao();

        this._isTrackingSessionActive = false;
        this._isVideoComplete = false;
        this._activeAssetId = null;
        this._isDestroyed = false;

        // Instantiate the helper class for building tracking reports.
        this._reportFactory = new ReportFactory(this, this._logger);

        this._inputDataValidator = new InputDataValidator(function(errorInfo) {
            this._logger.error(LOG_TAG, errorInfo.getMessage() + " | " + errorInfo.getDetails());
            this._channel.trigger(new Event(ERROR, errorInfo));
        }, this);

        this._stashedChapterData = null;
        this._stashedAdData = null;

        // Boolean flag that enables/disables support for external error tracking
        // (a.k.a. custom application error tracking).
        this._trackExternalErrors = true;

        // We register as observers to various heartbeat events.
        this._installEventListeners();
    }


    //
    //--------------------[ Public API ]--------------------
    //
    Context.prototype.destroy = function() {
        if (this._isDestroyed) return;
        this._isDestroyed = true;

        this._logger.debug(LOG_TAG, "#destroy()");

        // Detach from the notification center.
        this._uninstallEventListeners();
    };


    //
    //--------------------[ Event handlers ]--------------------
    //
    Context.prototype._onApiAnalyticsStart = function(event) {
        this._logger.debug(LOG_TAG, "#_onApiAnalyticsStart()");

        var data = event.data;

        if (!this._checkCall("_onApiAnalyticsStart")) return;

        if (!this._inputDataValidator.validateFields(data, ["playhead"])) return;

        this._userData.visitorId(data.vid);
        this._userData.analyticsVisitorId(data.aid);
        this._userData.marketingCloudVisitorId(data.mid);

        this._updateQoSInfo(data);

        // Send the AA_START event immediately (out-of-band).
        var aaStartItem = new TrackItem(this,
                                        EventDao.EVENT_TYPE_AA_START, data.playhead,
                                        null, data._eventData[KEY_CALLBACK]);
        // The AA_START event must always be in the context of the main video asset.
        // >> delete the ad-related info.
        aaStartItem.assetData.adData(null);
        // >> and update the asset type.
        aaStartItem.assetData.type(AssetDao.TYPE_MAIN_CONTENT);

        this._sendHit(aaStartItem);
    };

    Context.prototype._onApiAnalyticsAdStart = function(event) {
        this._logger.debug(LOG_TAG, "#_onApiAnalyticsAdStart()");

        var data = event.data;

        if (!this._checkCall("_onApiAnalyticsAdStart")) return;

        if (!this._inputDataValidator.validateFields(data, ["playhead"])) return;

        this._updateQoSInfo(data);

        // Send the AA_AD_START event immediately (out-of-band).
        var aaAdStartItem = new TrackItem(this,
                                          EventDao.EVENT_TYPE_AA_AD_START, data.playhead,
                                          null, data._eventData[KEY_CALLBACK]);

        this._sendHit(aaAdStartItem);
    };

    Context.prototype._onApiVideoLoad = function(event) {
        this._logger.debug(LOG_TAG, "#_onApiVideoLoad()");

        this._resetInternalState();

        // The tracking session has started.
        this._isTrackingSessionActive = true;
    };

    Context.prototype._onApiVideoUnload = function(event) {
        this._logger.debug(LOG_TAG, "#_onApiVideoUnload()");

        if (!this._isTrackingSessionActive) {
            this._logger.debug(LOG_TAG, "#_onApiVideoUnload() > No active tracking session.");
            return;
        }

        // The playback session is now complete.
        this._isTrackingSessionActive = false;
    };

    Context.prototype._onApiVideoStart = function(event) {
        var data = event.data;

        this._logger.debug(LOG_TAG, "#_onApiVideoStart(" +
                                    "id=" + data.videoId +
                                  ", name=" + data.videoName +
                                  ", length=" + data.videoLength +
                                  ", type=" + data.streamType +
                                  ", playerName=" + data.playerName +
                                  ")");

        if (!this._checkCall("_onApiVideoStart")) return;

        if (!this._inputDataValidator.validateFields(data, ["videoId", "streamType", "videoLength", "playhead", "playerName"])) return;

        this._adobeAnalyticsData.reportSuiteId(data.rsid);
        this._adobeAnalyticsData.trackingServer(data.trackingServer);
        this._adobeAnalyticsData.ssl(Number(data.useSsl)); // convert Boolean to 0 or 1

        this._serviceProviderData.ovp(data.ovp);
        this._serviceProviderData.sdk(data.sdk);
        this._serviceProviderData.channel(data.channel);
        this._serviceProviderData.libVersion(data.version);
        this._serviceProviderData.apiLevel(data.apiLvl);

        this._activeAssetId = data.videoId;

        this._serviceProviderData.playerName(data.playerName);

        this._assetData.videoId(this._activeAssetId);
        this._assetData.duration(data.videoLength);
        this._assetData.type(AssetDao.TYPE_MAIN_CONTENT);
        this._assetData.publisher(data.publisher);

        this._streamData.type(data.streamType);

        // Generate a new session ID value.
        this._sessionData.sessionId(_generateSessionId());

        this._updateQoSInfo(data);

        // Place the START event on the timeline and send it immediately (out-of-band).
        var startItem = new TrackItem(this,
                                      EventDao.EVENT_TYPE_START, data.playhead,
                                      data.metaVideo, data._eventData[KEY_CALLBACK]);

        this._sendHit(startItem);
    };

    Context.prototype._onApiVideoComplete = function(event) {
        this._logger.debug(LOG_TAG, "#_onApiVideoComplete()");

        var data = event.data;

        if (!this._checkCall("_onApiVideoComplete")) return;

        // Place the COMPLETE event on the timeline (for main asset).
        var completeItem = new TrackItem(this,
                                         EventDao.EVENT_TYPE_COMPLETE, this._assetData.duration(),
                                         null, data._eventData[KEY_CALLBACK]);

        this._sendHit(completeItem);

        // Mark the main asset as being complete.
        this._isVideoComplete = true;
    };

    Context.prototype._onApiPlay = function(event) {
        this._logger.debug(LOG_TAG, "#_onApiPlay()");

        var data = event.data;

        if (!this._checkCall("_onApiPlay")) return;

        if (!this._inputDataValidator.validateFields(data, ["playhead"])) return;

        this._updateQoSInfo(data);

        // Place the PLAY event on the timeline.
        var playItem = new TrackItem(this,
                                     EventDao.EVENT_TYPE_PLAY, data.playhead,
                                     null, data._eventData[KEY_CALLBACK]);

        this._sendHit(playItem);
    };

    Context.prototype._onApiPause = function(event) {
        this._logger.debug(LOG_TAG, "#_onApiPause()");

        var data = event.data;

        if (!this._checkCall("_onApiPause")) return;

        if (!this._inputDataValidator.validateFields(data, ["playhead"])) return;

        this._updateQoSInfo(data);

        // Place the PAUSE event on the timeline.
        var pauseItem = new TrackItem(this,
                                      EventDao.EVENT_TYPE_PAUSE, data.playhead,
                                      null, data._eventData[KEY_CALLBACK]);

        this._sendHit(pauseItem);
    };

    Context.prototype._onApiBufferStart = function(event) {
        this._logger.debug(LOG_TAG, "#_onApiBufferStart()");

        var data = event.data;

        if (!this._checkCall("_onApiBufferStart")) return;

        if (!this._inputDataValidator.validateFields(data, ["playhead"])) return;

        this._updateQoSInfo(data);

        // Place the BUFFER_START event on the timeline.
        var bufferStartItem = new TrackItem(this,
                                            EventDao.EVENT_TYPE_BUFFER, data.playhead,
                                            null, data._eventData[KEY_CALLBACK]);

        this._sendHit(bufferStartItem);
    };

    Context.prototype._onApiSeekStart = function(event) {
        this._logger.debug(LOG_TAG, "#_onApiSeekStart()");

        if (!this._checkCall("_onApiSeekStart")) return;

        // We need to stash the ad/chapter data in order to be able
        // to reuse it when seek completes (if needed).
        this._stashedAdData = this._assetData.adData();
        this._stashedChapterData = this._assetData.chapterData();

        // Nullify & reset the ad/chapter information (we don't know where we will end-up).
        this._assetData.adData(null);
        this._assetData.type(AssetDao.TYPE_MAIN_CONTENT);
        this._activeAssetId = this._assetData.videoId();

        this._assetData.chapterData(null);
    };

    Context.prototype._onApiSeekComplete = function(event) {
        this._logger.debug(LOG_TAG, "#_onApiSeekComplete()");

        var data = event.data;

        if (!this._checkCall("_onApiSeekComplete")) return;

        if (!this._inputDataValidator.validateFields(data, ["playhead"])) return;

        if (data.isInAd) {
            if (!this._inputDataValidator.validateFields(data, ["adId", "adPosition", "podPosition", "podPlayerName"])) return;

            var podId = MD5(this._assetData.videoId()) + "_" + data.podPosition;

            // If the ad did not change, reuse the stashed ad data.
            if (this._stashedAdData &&
                this._stashedAdData.podId() == podId &&
                parseInt(this._stashedAdData.podPosition(), 10) == data.adPosition) {

                this._assetData.adData(this._stashedAdData);
                this._activeAssetId = this._stashedAdData.adId();
            } else if (!this._assetData.adData()) {
                this._activeAssetId = data.adId;

                // Set-up the ad-data associated to the current ad.
                var adData = new AdDao();
                adData.adId(this._activeAssetId);
                adData.podId(podId);
                adData.resolver(data.podPlayerName);
                adData.podPosition(data.podPosition + "");
                adData.sid(_generateSessionId());

                this._assetData.adData(adData);
            }

            // The asset type is now AD.
            this._assetData.type(AssetDao.TYPE_AD);
        } else {
            this._assetData.adData(null);
            this._assetData.type(AssetDao.TYPE_MAIN_CONTENT);

            this._activeAssetId = this._assetData.videoId();
        }

        if (data.isInChapter) {
            if (!this._inputDataValidator.validateFields(data, ["chapterPosition", "chapterLength", "chapterOffset"])) return;

            // If the chapter did not change, reuse the stashed chapter data.
            if (this._stashedChapterData &&
                data.chapterPosition == this._stashedChapterData.position()) {

                this._assetData.chapterData(this._stashedChapterData);
            } else if (!this._assetData.chapterData()) {
                // Set-up the chapter DAO.
                var chapterData = new ChapterDao();
                chapterData.id(MD5(this._assetData.videoId()) + "_" + data.chapterPosition);
                chapterData.name(data.chapterName);
                chapterData.length(data.chapterLength);
                chapterData.position(data.chapterPosition);
                chapterData.offset(data.chapterOffset);
                chapterData.sid(_generateSessionId());

                this._assetData.chapterData(chapterData);
            }
        } else {
            this._assetData.chapterData(null);
        }

        // We're done with all the stashed data.
        this._stashedAdData = null;
        this._stashedChapterData = null;
    };

    Context.prototype._onApiAdStart = function(event) {
        var data = event.data;

        this._logger.debug(LOG_TAG, "#_onApiAdStart(" +
                                    "id=" + data.adId +
                                    ", player_name=" + data.podPlayerName +
                                    ", parent_name=" + this._assetData.videoId() +
                                    ", pod_pos=" + data.adPosition +
                                    ")");

        if (!this._checkCall("_onApiAdStart")) return;

        if (!this._inputDataValidator.validateFields(data, ["playhead", "podPosition", "podPlayerName", "adId", "adPosition"])) return;

        this._activeAssetId = data.adId;

        // Set-up the ad-data associated to the current ad.
        var adData = new AdDao();
        adData.adId(this._activeAssetId);
        adData.resolver(data.podPlayerName);
        adData.podId(MD5(this._assetData.videoId()) + "_" + data.podPosition);
        adData.podPosition(data.adPosition + "");
        adData.sid(_generateSessionId());

        this._assetData.adData(adData);

        // The asset type is now AD.
        this._assetData.type(AssetDao.TYPE_AD);

        this._updateQoSInfo(data);

        // Place the START event on the timeline.
        var startItem = new TrackItem(this,
                                      EventDao.EVENT_TYPE_START, data.playhead,
                                      ObjectUtils.merge(data.metaVideo, data.metaAd),
                                      data._eventData[KEY_CALLBACK]);
        this._sendHit(startItem);
    };

    Context.prototype._onApiAdComplete = function(event) {
        this._logger.debug(LOG_TAG, "#_onApiAdComplete()");

        var data = event.data;

        if (!this._checkCall("_onApiAdComplete")) return;

        if (!this._inputDataValidator.validateFields(data, ["playhead"])) return;

        if (this._assetData.type() != AssetDao.TYPE_AD) {
            this._logger.warn(LOG_TAG, "#_onApiAdComplete() > Ignoring the ad complete event, because we are no longer in an ad.");
            return;
        }

        this._updateQoSInfo(data);

        // Send the COMPLETE hit.
        var completeItem = new TrackItem(this,
                                         EventDao.EVENT_TYPE_COMPLETE, data.playhead,
                                         null, data._eventData[KEY_CALLBACK]);

        this._sendHit(completeItem);

        // Nullify the ad data.
        this._assetData.adData(null);

        // Revert back to the type of the main content.
        this._assetData.type(AssetDao.TYPE_MAIN_CONTENT);
        this._activeAssetId = this._assetData.videoId();
    };

    Context.prototype._onApiChapterStart = function(event) {
        var data = event.data;

        this._logger.debug(LOG_TAG, "#_onApiChapterStart(" +
                                    "name=" + data.chapterName +
                                    ", length=" + data.chapterLength +
                                    ", position=" + data.chapterPosition +
                                    ", chapter_offset=" + data.chapterOffset +
                                    ")");

        if (!this._checkCall("_onApiChapterStart")) return;

        if (!this._inputDataValidator.validateFields(data, ["playhead", "chapterPosition", "chapterOffset", "chapterLength"])) return;

        // Set-up the chapter DAO.
        var chapterData = new ChapterDao();
        chapterData.id(MD5(this._assetData.videoId()) + "_" + data.chapterPosition);
        chapterData.name(data.chapterName);
        chapterData.length(data.chapterLength);
        chapterData.position(data.chapterPosition);
        chapterData.offset(data.chapterOffset);
        chapterData.sid(_generateSessionId());

        this._assetData.chapterData(chapterData);

        this._updateQoSInfo(data);

        // Send the CHAPTER_START event immediately (out-of-band).
        var startChapterItem = new TrackItem(this,
                                             EventDao.EVENT_TYPE_CHAPTER_START, data.playhead,
                                             ObjectUtils.merge(data.metaVideo, data.metaChapter),
                                             data._eventData[KEY_CALLBACK]);

        // The CHAPTER_START event must always be in the context of the main video asset.
        // >> delete the ad-related info.
        startChapterItem.assetData.adData(null);
        // >> and update the asset type.
        startChapterItem.assetData.type(AssetDao.TYPE_MAIN_CONTENT);

        this._sendHit(startChapterItem);
    };

    Context.prototype._onApiChapterComplete = function(event) {
        this._logger.debug(LOG_TAG, "#_onApiChapterComplete()");

        var data = event.data;

        if (!this._checkCall("_onApiChapterComplete")) return;

        if (!this._inputDataValidator.validateFields(data, ["playhead"])) return;

        if (!this._assetData.chapterData()) {
            this._logger.warn(LOG_TAG, "#_onApiChapterComplete() > Ignoring the chapter complete event, because we are no longer in a chapter.");
            return;
        }

        this._updateQoSInfo(data);

        // Send the CHAPTER_COMPLETE event immediately (out-of-band).
        var completeChapterItem = new TrackItem(this,
                                                EventDao.EVENT_TYPE_CHAPTER_COMPLETE, data.playhead,
                                                null, data._eventData[KEY_CALLBACK]);

        // The CHAPTER_COMPLETE event must always be in the context of the main video asset.
        // >> delete the ad-related info.
        completeChapterItem.assetData.adData(null);
        // >> and update the asset type.
        completeChapterItem.assetData.type(AssetDao.TYPE_MAIN_CONTENT);

        this._sendHit(completeChapterItem);

        // We are no longer inside a chapter.
        this._assetData.chapterData(null);
    };

    Context.prototype._onApiBitrateChange = function(event) {
        this._logger.debug(LOG_TAG, "#_onApiBitrateChange()");

        var data = event.data;

        if (!this._checkCall("_onApiBitrateChange")) return;

        if (!this._inputDataValidator.validateFields(data, ["playhead"])) return;

        this._updateQoSInfo(data);

        // Send the BITRATE_CHANGE event immediately (out-of-band).
        var bitrateChangeItem = new TrackItem(this,
                                              EventDao.EVENT_TYPE_BITRATE_CHANGE, data.playhead,
                                              null, data._eventData[KEY_CALLBACK]);

        this._sendHit(bitrateChangeItem);
    };

    Context.prototype._onApiTrackError = function(event) {
        var data = event.data;

        this._logger.debug(LOG_TAG, "#_onApiTrackError(" +
                                    "source=" + data._eventData.source +
                                  ", err_id=" + data._eventData.error_id +
                                  ")");

        if (!this._isTrackingSessionActive) {
            this._logger.warn(LOG_TAG, "#_onApiTrackError() > No active tracking session.");
            return;
        }

        // If external error tracking is disabled, we must skip
        // the error reports issued by the application layer.
        if (!this._trackExternalErrors && data._eventData.source !== ERROR_SOURCE_PLAYER) {
            return;
        }

        this._updateQoSInfo(data);

        // Send the ERROR event immediately (out-of-band).
        var errorItem = new TrackItem(this,
                                      EventDao.EVENT_TYPE_ERROR, 0,
                                      null, data._eventData[KEY_CALLBACK]);

        errorItem.eventData.id(data._eventData.error_id);
        errorItem.eventData.source(data._eventData.source);

        this._sendHit(errorItem);
    };

    Context.prototype._onApiTrackInternalError = function(event) {
        this._logger.debug(LOG_TAG, "#_onApiTrackInternalError(" +
                                    "source="+ data.source +
                                    ", err_id="+ data.error_id +
                                    ")");

        var data = event.data;

        this._updateQoSInfo(data);

        // Send the ERROR event immediately (out-of-band).
        var errorItem = new TrackItem(this, EventDao.EVENT_TYPE_ERROR, 0);

        errorItem.eventData.id(data.error_id);
        errorItem.eventData.source(data.source);

        this._sendHit(errorItem);
    };

    Context.prototype._onApiQuantumEnd = function(event) {
        this._logger.debug(LOG_TAG, "#_onApiQuantumEnd(interval=" +
                                    this._channel.request(REQ_REPORTING_INTERVAL) + ")");

        var data = event.data;

        if (!this._checkCall("_onApiQuantumEnd")) return;

        if (!this._inputDataValidator.validateFields(data, ["playhead"])) return;

        // Update the qos & playhead values for the last in-band item.
        this._lastInBandItem.eventData.playhead(data.playhead);

        this._updateQoSInfo(data);
        this._lastInBandItem.qosData.bitrate(this._qosData.bitrate());
        this._lastInBandItem.qosData.fps(this._qosData.fps());
        this._lastInBandItem.qosData.droppedFrames(this._qosData.droppedFrames());
        this._lastInBandItem.qosData.startupTime(this._qosData.startupTime());

        this._sendHit(this._lastInBandItem);
    };

    Context.prototype._onNetworkCheckStatusComplete = function(event) {
        var data = event.data;

        this._trackExternalErrors = data[KEY_TRACK_EXTERNAL_ERRORS];

        this._logger.debug(LOG_TAG, "#_onNetworkCheckStatusComplete(track_ext_err=" + this._trackExternalErrors + ")");
    };

    //
    // -------------------[ Private helper methods ]-----------------------
    //
    Context.prototype._installEventListeners = function() {
        this._channel.on(EVENT_API_AA_START, this._onApiAnalyticsStart, this);
        this._channel.on(EVENT_API_AA_AD_START, this._onApiAnalyticsAdStart, this);
        this._channel.on(EVENT_API_VIDEO_LOAD, this._onApiVideoLoad, this);
        this._channel.on(EVENT_API_VIDEO_UNLOAD, this._onApiVideoUnload, this);
        this._channel.on(EVENT_API_VIDEO_START, this._onApiVideoStart, this);
        this._channel.on(EVENT_API_VIDEO_COMPLETE, this._onApiVideoComplete, this);
        this._channel.on(EVENT_API_AD_START, this._onApiAdStart, this);
        this._channel.on(EVENT_API_AD_COMPLETE, this._onApiAdComplete, this);
        this._channel.on(EVENT_API_PLAY, this._onApiPlay, this);
        this._channel.on(EVENT_API_PAUSE, this._onApiPause, this);
        this._channel.on(EVENT_API_BUFFER_START, this._onApiBufferStart, this);
        this._channel.on(EVENT_API_SEEK_START, this._onApiSeekStart, this);
        this._channel.on(EVENT_API_SEEK_COMPLETE, this._onApiSeekComplete, this);
        this._channel.on(EVENT_API_CHAPTER_START, this._onApiChapterStart, this);
        this._channel.on(EVENT_API_CHAPTER_COMPLETE, this._onApiChapterComplete, this);
        this._channel.on(EVENT_API_BITRATE_CHANGE, this._onApiBitrateChange, this);
        this._channel.on(EVENT_API_TRACK_ERROR, this._onApiTrackError, this);
        this._channel.on(EVENT_API_TRACK_INTERNAL_ERROR, this._onApiTrackInternalError, this);
        this._channel.on(EVENT_API_QUANTUM_END, this._onApiQuantumEnd, this);
        this._channel.on(EVENT_NET_CHECK_STATUS_COMPLETE, this._onNetworkCheckStatusComplete, this);

        this._channel.reply(REQ_SESSION_ID, function() {
            return (this._sessionData && this._sessionData.sessionId()) ? this._sessionData.sessionId() : null;
        }, this);
    };

    Context.prototype._uninstallEventListeners = function() {
        this._channel.off(null, null, this);
    };

    Context.prototype._resetInternalState = function() {
        this._logger.debug(LOG_TAG, "#_resetInternalState()");

        this._isTrackingSessionActive = false;
        this._isVideoComplete = false;

        this._autoComputedStartupTime = 0;

        this._streamData = new StreamDao();
        this._qosData = new QoSDao();
        this._sessionData = new SessionDao();
        this._assetData = new AssetDao();

        this._stashedAdData = null;
        this._stashedChapterData = null;
    };

    function _generateSessionId() {
        return "" + new Date().getTime() + Math.floor(Math.random() * 1000000000);
    }

    Context.prototype._updateQoSInfo = function(data) {
        // Sanitize the data obtained from the player delegate.
        this._qosData.bitrate(data.bitrate || 0);
        this._qosData.fps(data.fps || 0);
        this._qosData.droppedFrames(data.droppedFrames || 0);

        // We don't default the startup time value to zero here because
        // we want to default it later with the value of the "computed"
        // startup time later.
        if (data.startupTime != null && !isNaN(data.startupTime)) {
            this._qosData.startupTime(data.startupTime);

            // Mark the startupTime as being overridden by the application code.
            // This will prevent us from modifying it later down the processing pipeline.
            this._qosData.isStartupTimeOverridden = true;
        } else {
            this._qosData.startupTime(this._autoComputedStartupTime);
            this._qosData.isStartupTimeOverridden = false;
        }
    };

    Context.prototype._checkCall = function(methodName) {
        if (!this._isTrackingSessionActive) {
            this._logger.warn(LOG_TAG, "#" + methodName + "() > No active tracking session.");
            return false;
        }

        if (this._isVideoComplete) {
            this._logger.warn(LOG_TAG, "#" + methodName + "() > The video content already completed.");
            return false;
        }

        return true;
    };

    Context.prototype._sendHit = function(item) {
        var self = this;
        function createAndSendReport(_item) {
            var report = self._reportFactory.createReportForItem(_item);

            // Before we send the report, make sure that the QoS startupTime
            // is properly set: it must default to the auto-computed value
            // if it is not overridden by the application code.
            if (!report.qosData.isStartupTimeOverridden) {
                report.qosData.startupTime(self._autoComputedStartupTime);
            }

            // Issue a CONTEXT_REPORT_AVAILABLE event.
            var eventData = {};
            eventData[KEY_REPORT] = report;
            self._channel.trigger(new Event(EVENT_CONTEXT_REPORT_AVAILABLE, eventData));

            // If the report we've just sent is an in-band report
            // we will reset the tracking timer.
            if (report.eventData.type() == EventDao.EVENT_TYPE_PLAY ||
                report.eventData.type() == EventDao.EVENT_TYPE_BUFFER ||
                report.eventData.type() == EventDao.EVENT_TYPE_START) {

                // Restart the timer handling the periodic report updates.
                params = {};
                params[KEY_RESET] = true;
                self._channel.command(CMD_ENABLE_REPORTING_TIMER, params);
            }
        }

        var params = {};
        var now = new Date().getTime();

        switch (item.eventData.type()) {
            case EventDao.EVENT_TYPE_START:
            case EventDao.EVENT_TYPE_PLAY:
            case EventDao.EVENT_TYPE_PAUSE:
            case EventDao.EVENT_TYPE_BUFFER:
                // Update the duration/timestamp for the last in-band item.
                if(this._lastInBandItem) {
                    this._lastInBandItem.eventData.duration(now - this._lastInBandItem.eventData.ts());
                    this._lastInBandItem.eventData.ts(now);
                    this._lastInBandItem.eventData.playhead(item.eventData.playhead());

                    this._lastInBandItem.qosData.startupTime(item.qosData.startupTime());
                    this._lastInBandItem.qosData.isStartupTimeOverridden = item.qosData.isStartupTimeOverridden;

                    // Update the value of the auto-computed startup time.
                    if (this._lastInBandItem.eventData.type() == EventDao.EVENT_TYPE_START &&
                        this._lastInBandItem.assetData.type() == AssetDao.TYPE_MAIN_CONTENT) {
                        this._autoComputedStartupTime += this._lastInBandItem.eventData.duration();
                    }

                    if (item != this._lastInBandItem) {
                        createAndSendReport(this._lastInBandItem);
                    }
                }

                // Send the report for the current item.
                createAndSendReport(item);

                // Update the reference to the last in-band item.
                this._lastInBandItem = item;

                // Restart the timer handling the periodic report updates.
                params = {};
                params[KEY_RESET] = true;
                this._channel.command(CMD_ENABLE_REPORTING_TIMER, params);

                break;

            case EventDao.EVENT_TYPE_COMPLETE:
                // Send an update for the last in-band item (with duration updated)
                if(this._lastInBandItem) {
                    this._lastInBandItem.eventData.duration(now - this._lastInBandItem.eventData.ts());
                    this._lastInBandItem.eventData.ts(now);
                    this._lastInBandItem.eventData.playhead(item.eventData.playhead());

                    this._lastInBandItem.qosData.startupTime(item.qosData.startupTime());
                    this._lastInBandItem.qosData.isStartupTimeOverridden = item.qosData.isStartupTimeOverridden;

                    createAndSendReport(this._lastInBandItem);
                }

                // Send the report for the current item.
                createAndSendReport(item);

                if (item.assetData.type() == AssetDao.TYPE_MAIN_CONTENT) {
                    // Content is complete - reset the last in-band event.
                    this._lastInBandItem = null;

                    // Stop the timer handling the periodic report updates.
                    params = {};
                    params[KEY_RESET] = true;
                    this._channel.command(CMD_DISABLE_REPORTING_TIMER, params);

                } else if (item.assetData.type() == AssetDao.TYPE_AD) {
                    // Nullify the ad info.
                    this._lastInBandItem.assetData.adData(null);
                    this._lastInBandItem.assetData.type(AssetDao.TYPE_MAIN_CONTENT);
                }
                break;

            case EventDao.EVENT_TYPE_CHAPTER_START:
            case EventDao.EVENT_TYPE_CHAPTER_COMPLETE:
                // We must segment the last item into 2 parts: one inside and one outside the chapter.
                if (this._lastInBandItem) {
                    this._lastInBandItem.eventData.duration(now - this._lastInBandItem.eventData.ts());
                    this._lastInBandItem.eventData.ts(now);
                    this._lastInBandItem.eventData.playhead(item.eventData.playhead());
                    this._lastInBandItem.qosData.startupTime(item.qosData.startupTime());
                    this._lastInBandItem.qosData.isStartupTimeOverridden = item.qosData.isStartupTimeOverridden;

                    createAndSendReport(this._lastInBandItem);
                }

                // Send the report for the current item.
                createAndSendReport(item);

                if (this._lastInBandItem) {
                    this._lastInBandItem.assetData.chapterData((item.eventData.type() == EventDao.EVENT_TYPE_CHAPTER_START)
                                                                ? new ChapterDao(item.assetData.chapterData())
                                                                : null);
                    this._lastInBandItem.eventData.duration(0);
                    createAndSendReport(this._lastInBandItem);
                }

                break;

            default:
                createAndSendReport(item);
                break;
        }
    };


    // Private constants.
    var LOG_TAG = "ah::Context";

    var ERROR_SOURCE_PLAYER = "sourceErrorSDK";

    var ERROR = "error";
    var CMD_ENABLE_REPORTING_TIMER = "clock:reporting.resume";
    var CMD_DISABLE_REPORTING_TIMER = "clock:reporting.pause";

    var REQ_REPORTING_INTERVAL = "reporting_interval";
    var REQ_SESSION_ID = "session_id";

    var KEY_CALLBACK = "callback";
    var KEY_REPORT = "report";
    var KEY_RESET = "reset";
    var KEY_TRACK_EXTERNAL_ERRORS = "track_external_errors";

    var EVENT_API_AA_START = "api:aa_start";
    var EVENT_API_AA_AD_START = "api:aa_ad_start";
    var EVENT_API_VIDEO_LOAD = "api:video_load";
    var EVENT_API_VIDEO_UNLOAD = "api:video_unload";
    var EVENT_API_VIDEO_START = "api:video_start";
    var EVENT_API_VIDEO_COMPLETE = "api:video_complete";
    var EVENT_API_AD_START = "api:ad_start";
    var EVENT_API_AD_COMPLETE = "api:ad_complete";
    var EVENT_API_PLAY = "api:play";
    var EVENT_API_PAUSE = "api:pause";
    var EVENT_API_BUFFER_START = "api:buffer_start";
    var EVENT_API_SEEK_START = "api:seek_start";
    var EVENT_API_SEEK_COMPLETE = "api:seek_complete";
    var EVENT_API_CHAPTER_START = "api:chapter_start";
    var EVENT_API_CHAPTER_COMPLETE = "api:chapter_complete";
    var EVENT_API_TRACK_ERROR = "api:track_error";
    var EVENT_API_TRACK_INTERNAL_ERROR = "api:track_internal_error";
    var EVENT_API_BITRATE_CHANGE = "api:bitrate_change";
    var EVENT_API_QUANTUM_END = "api:quantum_end";

    var EVENT_CONTEXT_REPORT_AVAILABLE = "context:report_available";

    var EVENT_NET_CHECK_STATUS_COMPLETE = "net:check_status_complete";

    // Export symbols.
    ah.context.Context = Context;
})(global.ADB.core, global.ADB.va, global.ADB.va.utils, ah);

(function(ah) {
    'use strict';

    function AdobeHeartbeatPluginConfig(trackingServer, publisher) {
        this.trackingServer = trackingServer;
        this.publisher = publisher;

        this.ssl = false;
        this.ovp = DEFAULT_UNKNOWN;
        this.sdk = DEFAULT_UNKNOWN;

        this.quietMode = false;
        this.debugLogging = false;

        this.__isPrimetime = false;
        this.__psdkVersion = null;
    }

    // Private constants.
    var DEFAULT_UNKNOWN = "unknown";

    // Export symbols.
    ah.AdobeHeartbeatPluginConfig = AdobeHeartbeatPluginConfig;
})(ah);

(function(ah) {
    'use strict';

    function AdobeHeartbeatPluginDelegate() {}

    AdobeHeartbeatPluginDelegate.prototype.onError = function(errorInfo) {};

    // Export symbols.
    ah.AdobeHeartbeatPluginDelegate = AdobeHeartbeatPluginDelegate;
})(ah);

(function(core, va, ah) {
    'use strict';

    var Event = core.Event;
    var Trigger = core.Trigger;

    var BasePlugin = core.plugin.BasePlugin;
    var ParamMapping = core.plugin.ParamMapping;
    var Radio = core.radio.Radio;

    var ErrorInfo = va.ErrorInfo;
    var Version = va.Version;

    var Context = ah.context.Context;
    var ReportFilter = ah.filter.ReportFilter;
    var Network = ah.network.Network;
    var Clock = ah.clock.Clock;

    var AdobeHeartbeatPluginConfig = ah.AdobeHeartbeatPluginConfig;

    core.extend(AdobeHeartbeatPlugin, BasePlugin);

    /**
     * @extends {BasePlugin}
     * @constructor
     */
    function AdobeHeartbeatPlugin(delegate) {
        AdobeHeartbeatPlugin.__super__.constructor.call(this, NAME);

        this._radio = new Radio(this._logger);
        this._channel = this._radio.channel(HEARTBEAT_CHANNEL);

        this._delegate = delegate;

        // Initialize the collection engine sub-modules.
        this._context = new Context(this._channel, this._logger);
        this._filter = new ReportFilter(this._channel, this._logger);
        this._network = new Network(this._channel, this._logger);

        this._setupDataResolver();
    }

    //
    //---------------------[ Public overridden functions ]---------------------
    //
    AdobeHeartbeatPlugin.prototype.configure = function(configData) {
        if (!configData) {
            throw new Error("Reference to the configuration data cannot be NULL.");
        }

        if (!(configData instanceof AdobeHeartbeatPluginConfig)) {
            throw new Error("Expected config data to be instance of AdobeHeartbeatPluginConfig.");
        }

        this._config = configData;

        if (this._config.debugLogging) {
            this._logger.enable();
        } else {
            this._logger.disable();
        }

        this._logger.debug(this._logTag, "#configure({" +
              "trackingServer=" + this._config.trackingServer +
            ", publisher="      + this._config.publisher +
            ", quietMode="      + this._config.quietMode +
            ", ssl="            + this._config.ssl +
            "})");

        var checkStatusServer = this._config.trackingServer + "/settings/";

        // Let everybody know about the update of the configuration settings.
        var eventData = {};
        eventData[KEY_TRACKING_SERVER]     = this._config.trackingServer;
        eventData[KEY_CHECK_STATUS_SERVER] = checkStatusServer;
        eventData[KEY_PUBLISHER]           = this._config.publisher;
        eventData[KEY_QUIET_MODE]          = this._config.quietMode;
        eventData[KEY_SSL]                 = this._config.ssl;

        this._channel.trigger(new Event(EVENT_API_CONFIG, eventData));

        // We are now configured.
        this._isConfigured = true;
    };

    AdobeHeartbeatPlugin.prototype.bootstrap = function(pluginManager) {
        // Do the plugin core bootstrapping.
        AdobeHeartbeatPlugin.__super__.bootstrap.call(this, pluginManager);

        // We are interested in the ERROR event triggered by the collection engine.
        this._channel.on(ERROR, this._onError, this);

        // Hook-up the Clock sub-module to the global clock service.
        this._clock = new Clock(this._pluginManager, this._channel,  this._logger);

        // The "check-status" timer must be activated.
        this._channel.command(CMD_ENABLE_CHECK_STATUS_TIMER);
        this._channel.trigger(new Event(EVENT_CLOCK_CHECK_STATUS_GET_SETTINGS));

        this._registerCommands();
        this._registerBehaviours();
    };


    //
    //---------------------[ Protected overridden functions ]---------------------
    //
    AdobeHeartbeatPlugin.prototype._teardown = function() {
        this._logger.debug(this._logTag, "#_teardown()");

        // Shutdown the private radio channel.
        this._radio.shutdown();

        // Tear-down all sub-modules.
        this._context.destroy();
        this._clock.destroy();
        this._filter.destroy();
        this._network.destroy();
    };

    AdobeHeartbeatPlugin.prototype._canProcess = function() {
        if (!this._isConfigured) {
            this._logger.error(this._logTag, "_canProcess() > Plugin not configured.");
            return false;
        }

        if (this._errorInfo) {
            this._logger.error(this._logTag, "_canProcess() > Plugin in ERROR state.");
            return false;
        }

        return AdobeHeartbeatPlugin.__super__._canProcess.call(this);
    };

    //
    //---------------------[ Command handlers ]---------------------
    //
    AdobeHeartbeatPlugin.prototype._cmdAnalyticsError = function(data) {
        // Already in error state.
        if (this._errorInfo) return;

        this._errorInfo = new ErrorInfo("Internal error", "AdobeAnalyticsPlugin is in ERROR state.");
        this._trigger(ERROR, this._errorInfo);

        if (this._delegate) {
            this._delegate.onError(this._errorInfo);
        }
    };

    AdobeHeartbeatPlugin.prototype._cmdAnalyticsStart = function(data) {
        // Fast exit.
        if (!this._canProcess()) return;

        this._channel.trigger(new Event(EVENT_API_AA_START, data))
    };

    AdobeHeartbeatPlugin.prototype._cmdAnalyticsAdStart = function(data) {
        // Fast exit.
        if (!this._canProcess()) return;

        this._channel.trigger(new Event(EVENT_API_AA_AD_START, data))
    };

    AdobeHeartbeatPlugin.prototype._cmdVideoLoad = function(data) {
        // Get out of the ERROR state.
        this._errorInfo = null;

        // Fast exit.
        if (!this._canProcess()) return;

        // If there is already another tracking session in progress, terminate it.
        if (this._isTrackingSessionActive) {
            this._channel.trigger(new Event(EVENT_API_VIDEO_UNLOAD, data));
        }

        // Reset the internal state variables.
        this._isTrackingSessionActive = false;
        this._isPaused = true;
        this._isSeeking = false;
        this._isBuffering = false;

        this._channel.trigger(new Event(EVENT_API_VIDEO_LOAD, data));

        // The tracking session has started.
        this._isTrackingSessionActive = true;
    };

    AdobeHeartbeatPlugin.prototype._cmdVideoUnload = function(data) {
        // Get out of the ERROR state.
        this._errorInfo = null;

        // Fast exit.
        if (!this._canProcess()) return;

        this._channel.trigger(new Event(EVENT_API_VIDEO_UNLOAD, data));

        // The tracking session has completed (no longer active).
        this._isTrackingSessionActive = false;
    };

    AdobeHeartbeatPlugin.prototype._cmdVideoStart = function(data) {
        // Fast exit.
        if (!this._canProcess()) return;

        this._channel.trigger(new Event(EVENT_API_VIDEO_START, data));
    };

    AdobeHeartbeatPlugin.prototype._cmdVideoComplete = function(data) {
        // Fast exit.
        if (!this._canProcess()) return;

        this._channel.trigger(new Event(EVENT_API_VIDEO_COMPLETE, data));
    };

    AdobeHeartbeatPlugin.prototype._cmdPlay = function(data) {
        // Fast exit.
        if (!this._canProcess()) return;

        // This was an explicit PLAY command: switch out of the "paused" state.
        this._isPaused = false;

        // Resume playback.
        this._resumePlaybackIfPossible(data);
    };

    AdobeHeartbeatPlugin.prototype._cmdPause = function(data) {
        // Fast exit.
        if (!this._canProcess()) return;

        this._channel.trigger(new Event(EVENT_API_PAUSE, data));

        // This was an explicit PAUSE command: switch to the "paused" state.
        this._isPaused = true;
    };

    AdobeHeartbeatPlugin.prototype._cmdAdStart = function(data) {
        // Fast exit.
        if (!this._canProcess()) return;

        this._channel.trigger(new Event(EVENT_API_AD_START, data));

        // Automatically start playback (we implement auto-playback for ad content).
        this._resumePlaybackIfPossible(data);
    };

    AdobeHeartbeatPlugin.prototype._cmdAdComplete = function(data) {
        // Fast exit.
        if (!this._canProcess()) return;

        this._channel.trigger(new Event(EVENT_API_AD_COMPLETE, data));

        // Resume the playback if the ad-break is done.
        if (!data.isInAdBreak) {
            // If we are not in "paused" / "seeking" / "buffering" state, we inject a play event.
            this._resumePlaybackIfPossible(data);
        }
    };

    AdobeHeartbeatPlugin.prototype._cmdBufferStart = function(data) {
        // Fast exit.
        if (!this._canProcess()) return;

        this._channel.trigger(new Event(EVENT_API_BUFFER_START, data));

        // Switch to the "buffering" state.
        this._isBuffering = true;
    };

    AdobeHeartbeatPlugin.prototype._cmdBufferComplete = function(data) {
        // Fast exit.
        if (!this._canProcess()) return;

        // Switch out of the "buffering" state.
        this._isBuffering = false;

        // If we are not in "paused" / "seeking" / "buffering" state, we inject a play event.
        this._resumePlaybackIfPossible(data);
    };

    AdobeHeartbeatPlugin.prototype._cmdSeekStart = function(data) {
        // Fast exit.
        if (!this._canProcess()) return;

        this._channel.trigger(new Event(EVENT_API_SEEK_START, data));

        // Seek operations are async. Pause the playback until the seek completes.
        this._channel.trigger(new Event(EVENT_API_PAUSE, data));

        // Switch to the "seeking" state.
        this._isSeeking = true;
    };

    AdobeHeartbeatPlugin.prototype._cmdSeekComplete = function(data) {
        // Fast exit.
        if (!this._canProcess()) return;

        this._channel.trigger(new Event(EVENT_API_SEEK_COMPLETE, data));

        // Switch out of the "seeking" state.
        this._isSeeking = false;

        this._resumePlaybackIfPossible(data);
    };

    AdobeHeartbeatPlugin.prototype._cmdChapterStart = function(data) {
        // Fast exit.
        if (!this._canProcess()) return;

        this._channel.trigger(new Event(EVENT_API_CHAPTER_START, data));
    };

    AdobeHeartbeatPlugin.prototype._cmdChapterComplete = function(data) {
        // Fast exit.
        if (!this._canProcess()) return;

        this._channel.trigger(new Event(EVENT_API_CHAPTER_COMPLETE, data));
    };

    AdobeHeartbeatPlugin.prototype._cmdBitrateChange = function(data) {
        // Fast exit.
        if (!this._canProcess()) return;

        this._channel.trigger(new Event(EVENT_API_BITRATE_CHANGE, data));
    };

    AdobeHeartbeatPlugin.prototype._cmdTrackError = function(data) {
        // Fast exit.
        if (!this._canProcess()) return;

        this._channel.trigger(new Event(EVENT_API_TRACK_ERROR, data));
    };

    AdobeHeartbeatPlugin.prototype._cmdClockReportingTick = function(data) {
        // Fast exit.
        if (!this._canProcess()) return;

        this._channel.trigger(new Event(EVENT_API_QUANTUM_END, data));
    };

    //
    // -------------------[ Event handlers ]-----------------------
    //
    AdobeHeartbeatPlugin.prototype._onError = function(event) {
        this._errorInfo = event.data;

        var eventData = {};
        eventData[KEY_SOURCE] = ERROR_SOURCE_HEARTBEAT;
        eventData[KEY_ERROR_ID] = this._errorInfo.getMessage() + "|" + this._errorInfo.getDetails();
        this._channel.trigger(new Event(EVENT_API_TRACK_INTERNAL_ERROR, eventData));

        // We pause the tracking timer to make sure we no longer send periodic
        // tracking reports while in ERROR state.
        var params = {};
        params[KEY_RESET] = true;
        this._channel.command(CMD_DISABLE_REPORTING_TIMER, params);

        this._trigger(ERROR, this._errorInfo);

        if (this._delegate) {
            this._delegate.onError(this._errorInfo);
        }
    };

    //
    // -------------------[ Private helper methods ]-----------------------
    //
    AdobeHeartbeatPlugin.prototype._registerCommands = function() {
        this._pluginManager.comply(this, "handleAnalyticsError", this._cmdAnalyticsError);
        this._pluginManager.comply(this, "handleAnalyticsStart", this._cmdAnalyticsStart);
        this._pluginManager.comply(this, "handleAnalyticsAdStart", this._cmdAnalyticsAdStart);
        this._pluginManager.comply(this, "handleVideoLoad", this._cmdVideoLoad);
        this._pluginManager.comply(this, "handleVideoUnload", this._cmdVideoUnload);
        this._pluginManager.comply(this, "handleVideoStart", this._cmdVideoStart);
        this._pluginManager.comply(this, "handleVideoComplete", this._cmdVideoComplete);
        this._pluginManager.comply(this, "handlePlay", this._cmdPlay);
        this._pluginManager.comply(this, "handlePause", this._cmdPause);
        this._pluginManager.comply(this, "handleAdStart", this._cmdAdStart);
        this._pluginManager.comply(this, "handleAdComplete", this._cmdAdComplete);
        this._pluginManager.comply(this, "handleBufferStart", this._cmdBufferStart);
        this._pluginManager.comply(this, "handleBufferComplete", this._cmdBufferComplete);
        this._pluginManager.comply(this, "handleSeekStart", this._cmdSeekStart);
        this._pluginManager.comply(this, "handleSeekComplete", this._cmdSeekComplete);
        this._pluginManager.comply(this, "handleChapterStart", this._cmdChapterStart);
        this._pluginManager.comply(this, "handleChapterComplete", this._cmdChapterComplete);
        this._pluginManager.comply(this, "handleBitrateChange", this._cmdBitrateChange);
        this._pluginManager.comply(this, "handleTrackError", this._cmdTrackError);
        this._pluginManager.comply(this, "handleClockReportingTick", this._cmdClockReportingTick);
    };
    
    AdobeHeartbeatPlugin.prototype._registerBehaviours = function() {
        // Register behaviours for handling player events by the Heartbeat collection engine.
        this._pluginManager.registerBehaviour(new Trigger(PLAYER_PLUGIN, VIDEO_LOAD), this, "handleVideoLoad");

        this._pluginManager.registerBehaviour(new Trigger(PLAYER_PLUGIN, VIDEO_UNLOAD), this, "handleVideoUnload");

        this._pluginManager.registerBehaviour(new Trigger(PLAYER_PLUGIN, VIDEO_START), this, "handleVideoStart", [
            new ParamMapping(PLAYER_PLUGIN, "video.id", "videoId"),
            new ParamMapping(PLAYER_PLUGIN, "video.name", "videoName"),
            new ParamMapping(PLAYER_PLUGIN, "video.length", "videoLength"),
            new ParamMapping(PLAYER_PLUGIN, "video.playhead", "playhead"),
            new ParamMapping(PLAYER_PLUGIN, "video.playerName", "playerName"),
            new ParamMapping(PLAYER_PLUGIN, "video.streamType", "streamType"),
            new ParamMapping(PLAYER_PLUGIN, "qos.fps", "fps"),
            new ParamMapping(PLAYER_PLUGIN, "qos.droppedFrames", "droppedFrames"),
            new ParamMapping(PLAYER_PLUGIN, "qos.bitrate", "bitrate"),
            new ParamMapping(PLAYER_PLUGIN, "qos.startupTime", "startupTime"),

            new ParamMapping(ADOBE_ANALYTICS_PLUGIN, "rsid", "rsid"),
            new ParamMapping(ADOBE_ANALYTICS_PLUGIN, "tracking_server", "trackingServer"),
            new ParamMapping(ADOBE_ANALYTICS_PLUGIN, "channel", "channel"),
            new ParamMapping(ADOBE_ANALYTICS_PLUGIN, "meta.video.*", "metaVideo"),
            new ParamMapping(ADOBE_ANALYTICS_PLUGIN, "ssl", "useSsl"),

            new ParamMapping(ADOBE_HEARTBEAT_PLUGIN, "publisher", "publisher"),
            new ParamMapping(ADOBE_HEARTBEAT_PLUGIN, "sdk", "sdk"),
            new ParamMapping(ADOBE_HEARTBEAT_PLUGIN, "ovp", "ovp"),
            new ParamMapping(ADOBE_HEARTBEAT_PLUGIN, "version", "version"),
            new ParamMapping(ADOBE_HEARTBEAT_PLUGIN, "api_level", "apiLvl")
        ]);

        this._pluginManager.registerBehaviour(new Trigger(PLAYER_PLUGIN, VIDEO_COMPLETE), this, "handleVideoComplete", [
            new ParamMapping(PLAYER_PLUGIN, "qos.fps", "fps"),
            new ParamMapping(PLAYER_PLUGIN, "qos.droppedFrames", "droppedFrames"),
            new ParamMapping(PLAYER_PLUGIN, "qos.bitrate", "bitrate"),
            new ParamMapping(PLAYER_PLUGIN, "qos.startupTime", "startupTime")
        ]);

        this._pluginManager.registerBehaviour(new Trigger(PLAYER_PLUGIN, PLAY), this, "handlePlay", [
            new ParamMapping(PLAYER_PLUGIN, "video.playhead", "playhead"),
            new ParamMapping(PLAYER_PLUGIN, "qos.fps", "fps"),
            new ParamMapping(PLAYER_PLUGIN, "qos.droppedFrames", "droppedFrames"),
            new ParamMapping(PLAYER_PLUGIN, "qos.bitrate", "bitrate"),
            new ParamMapping(PLAYER_PLUGIN, "qos.startupTime", "startupTime")
        ]);

        this._pluginManager.registerBehaviour(new Trigger(PLAYER_PLUGIN, PAUSE), this, "handlePause", [
            new ParamMapping(PLAYER_PLUGIN, "video.playhead", "playhead"),
            new ParamMapping(PLAYER_PLUGIN, "qos.fps", "fps"),
            new ParamMapping(PLAYER_PLUGIN, "qos.droppedFrames", "droppedFrames"),
            new ParamMapping(PLAYER_PLUGIN, "qos.bitrate", "bitrate"),
            new ParamMapping(PLAYER_PLUGIN, "qos.startupTime", "startupTime")
        ]);

        this._pluginManager.registerBehaviour(new Trigger(PLAYER_PLUGIN, AD_START), this, "handleAdStart", [
            new ParamMapping(PLAYER_PLUGIN, "video.playhead", "playhead"),
            new ParamMapping(PLAYER_PLUGIN, "ad.id", "adId"),
            new ParamMapping(PLAYER_PLUGIN, "ad.position", "adPosition"),
            new ParamMapping(PLAYER_PLUGIN, "pod.name", "podName"),
            new ParamMapping(PLAYER_PLUGIN, "pod.playerName", "podPlayerName"),
            new ParamMapping(PLAYER_PLUGIN, "pod.position", "podPosition"),
            new ParamMapping(PLAYER_PLUGIN, "qos.fps", "fps"),
            new ParamMapping(PLAYER_PLUGIN, "qos.droppedFrames", "droppedFrames"),
            new ParamMapping(PLAYER_PLUGIN, "qos.bitrate", "bitrate"),
            new ParamMapping(PLAYER_PLUGIN, "qos.startupTime", "startupTime"),

            new ParamMapping(ADOBE_ANALYTICS_PLUGIN, "meta.video.*", "metaVideo"),
            new ParamMapping(ADOBE_ANALYTICS_PLUGIN, "meta.ad.*", "metaAd")
        ]);

        this._pluginManager.registerBehaviour(new Trigger(PLAYER_PLUGIN, AD_COMPLETE), this, "handleAdComplete", [
            new ParamMapping(PLAYER_PLUGIN, "video.playhead", "playhead"),
            new ParamMapping(PLAYER_PLUGIN, "ad.isInAdBreak", "isInAdBreak"),
            new ParamMapping(PLAYER_PLUGIN, "qos.fps", "fps"),
            new ParamMapping(PLAYER_PLUGIN, "qos.droppedFrames", "droppedFrames"),
            new ParamMapping(PLAYER_PLUGIN, "qos.bitrate", "bitrate"),
            new ParamMapping(PLAYER_PLUGIN, "qos.startupTime", "startupTime")
        ]);

        this._pluginManager.registerBehaviour(new Trigger(PLAYER_PLUGIN, BUFFER_START), this, "handleBufferStart", [
            new ParamMapping(PLAYER_PLUGIN, "video.playhead", "playhead"),
            new ParamMapping(PLAYER_PLUGIN, "qos.fps", "fps"),
            new ParamMapping(PLAYER_PLUGIN, "qos.droppedFrames", "droppedFrames"),
            new ParamMapping(PLAYER_PLUGIN, "qos.bitrate", "bitrate"),
            new ParamMapping(PLAYER_PLUGIN, "qos.startupTime", "startupTime")
        ]);

        this._pluginManager.registerBehaviour(new Trigger(PLAYER_PLUGIN, BUFFER_COMPLETE), this, "handleBufferComplete", [
            new ParamMapping(PLAYER_PLUGIN, "video.playhead", "playhead"),
            new ParamMapping(PLAYER_PLUGIN, "qos.fps", "fps"),
            new ParamMapping(PLAYER_PLUGIN, "qos.droppedFrames", "droppedFrames"),
            new ParamMapping(PLAYER_PLUGIN, "qos.bitrate", "bitrate"),
            new ParamMapping(PLAYER_PLUGIN, "qos.startupTime", "startupTime")
        ]);

        this._pluginManager.registerBehaviour(new Trigger(PLAYER_PLUGIN, SEEK_START), this, "handleSeekStart", [
            new ParamMapping(PLAYER_PLUGIN, "video.playhead", "playhead")
        ]);

        this._pluginManager.registerBehaviour(new Trigger(PLAYER_PLUGIN, SEEK_COMPLETE), this, "handleSeekComplete", [
            new ParamMapping(PLAYER_PLUGIN, "video.playhead", "playhead"),
            new ParamMapping(PLAYER_PLUGIN, "ad.isInAd", "isInAd"),
            new ParamMapping(PLAYER_PLUGIN, "ad.id", "adId"),
            new ParamMapping(PLAYER_PLUGIN, "ad.position", "adPosition"),
            new ParamMapping(PLAYER_PLUGIN, "pod.playerName", "podPlayerName"),
            new ParamMapping(PLAYER_PLUGIN, "pod.position", "podPosition"),
            new ParamMapping(PLAYER_PLUGIN, "chapter.isInChapter", "isInChapter"),
            new ParamMapping(PLAYER_PLUGIN, "chapter.position", "chapterPosition"),
            new ParamMapping(PLAYER_PLUGIN, "chapter.name", "chapterName"),
            new ParamMapping(PLAYER_PLUGIN, "chapter.length", "chapterLength"),
            new ParamMapping(PLAYER_PLUGIN, "chapter.startTime", "chapterOffset"),
            new ParamMapping(PLAYER_PLUGIN, "qos.fps", "fps"),
            new ParamMapping(PLAYER_PLUGIN, "qos.droppedFrames", "droppedFrames"),
            new ParamMapping(PLAYER_PLUGIN, "qos.bitrate", "bitrate"),
            new ParamMapping(PLAYER_PLUGIN, "qos.startupTime", "startupTime")
        ]);

        this._pluginManager.registerBehaviour(new Trigger(PLAYER_PLUGIN, CHAPTER_START), this, "handleChapterStart", [
            new ParamMapping(PLAYER_PLUGIN, "video.playhead", "playhead"),
            new ParamMapping(PLAYER_PLUGIN, "chapter.position", "chapterPosition"),
            new ParamMapping(PLAYER_PLUGIN, "chapter.name", "chapterName"),
            new ParamMapping(PLAYER_PLUGIN, "chapter.length", "chapterLength"),
            new ParamMapping(PLAYER_PLUGIN, "chapter.startTime", "chapterOffset"),
            new ParamMapping(PLAYER_PLUGIN, "qos.fps", "fps"),
            new ParamMapping(PLAYER_PLUGIN, "qos.droppedFrames", "droppedFrames"),
            new ParamMapping(PLAYER_PLUGIN, "qos.bitrate", "bitrate"),
            new ParamMapping(PLAYER_PLUGIN, "qos.startupTime", "startupTime"),

            new ParamMapping(ADOBE_ANALYTICS_PLUGIN, "meta.video.*", "metaVideo"),
            new ParamMapping(ADOBE_ANALYTICS_PLUGIN, "meta.chapter.*", "metaChapter")
        ]);

        this._pluginManager.registerBehaviour(new Trigger(PLAYER_PLUGIN, CHAPTER_COMPLETE), this, "handleChapterComplete", [
            new ParamMapping(PLAYER_PLUGIN, "video.playhead", "playhead"),
            new ParamMapping(PLAYER_PLUGIN, "qos.fps", "fps"),
            new ParamMapping(PLAYER_PLUGIN, "qos.droppedFrames", "droppedFrames"),
            new ParamMapping(PLAYER_PLUGIN, "qos.bitrate", "bitrate"),
            new ParamMapping(PLAYER_PLUGIN, "qos.startupTime", "startupTime")
        ]);

        this._pluginManager.registerBehaviour(new Trigger(PLAYER_PLUGIN, BITRATE_CHANGE), this, "handleBitrateChange", [
            new ParamMapping(PLAYER_PLUGIN, "video.playhead", "playhead"),
            new ParamMapping(PLAYER_PLUGIN, "qos.fps", "fps"),
            new ParamMapping(PLAYER_PLUGIN, "qos.droppedFrames", "droppedFrames"),
            new ParamMapping(PLAYER_PLUGIN, "qos.bitrate", "bitrate"),
            new ParamMapping(PLAYER_PLUGIN, "qos.startupTime", "startupTime")
        ]);

        this._pluginManager.registerBehaviour(new Trigger(PLAYER_PLUGIN, TRACK_ERROR), this, "handleTrackError");

        this._pluginManager.registerBehaviour(new Trigger(CLOCK_SERVICE, TIMER_REPORTING_TICK), this, "handleClockReportingTick", [
            new ParamMapping(PLAYER_PLUGIN, "video.playhead", "playhead"),
            new ParamMapping(PLAYER_PLUGIN, "qos.fps", "fps"),
            new ParamMapping(PLAYER_PLUGIN, "qos.droppedFrames", "droppedFrames"),
            new ParamMapping(PLAYER_PLUGIN, "qos.bitrate", "bitrate"),
            new ParamMapping(PLAYER_PLUGIN, "qos.startupTime", "startupTime")
        ]);

        // Register behaviours for handling sync. events between the AppMeasurement lib and the Heartbeat collection engine.
        this._pluginManager.registerBehaviour(new Trigger(ADOBE_ANALYTICS_PLUGIN, ERROR), this, "handleAnalyticsError");

        this._pluginManager.registerBehaviour(new Trigger(ADOBE_ANALYTICS_PLUGIN, AA_START), this, "handleAnalyticsStart", [
            new ParamMapping(ADOBE_ANALYTICS_PLUGIN, "vid", "vid"),
            new ParamMapping(ADOBE_ANALYTICS_PLUGIN, "aid", "aid"),
            new ParamMapping(ADOBE_ANALYTICS_PLUGIN, "mid", "mid"),

            new ParamMapping(PLAYER_PLUGIN, "video.playhead", "playhead"),
            new ParamMapping(PLAYER_PLUGIN, "qos.fps", "fps"),
            new ParamMapping(PLAYER_PLUGIN, "qos.droppedFrames", "droppedFrames"),
            new ParamMapping(PLAYER_PLUGIN, "qos.bitrate", "bitrate"),
            new ParamMapping(PLAYER_PLUGIN, "qos.startupTime", "startupTime")
        ]);

        this._pluginManager.registerBehaviour(new Trigger(ADOBE_ANALYTICS_PLUGIN, AA_AD_START), this, "handleAnalyticsAdStart", [
            new ParamMapping(PLAYER_PLUGIN, "video.playhead", "playhead"),
            new ParamMapping(PLAYER_PLUGIN, "qos.fps", "fps"),
            new ParamMapping(PLAYER_PLUGIN, "qos.droppedFrames", "droppedFrames"),
            new ParamMapping(PLAYER_PLUGIN, "qos.bitrate", "bitrate"),
            new ParamMapping(PLAYER_PLUGIN, "qos.startupTime", "startupTime")
        ]);
    };

    AdobeHeartbeatPlugin.prototype._setupDataResolver = function() {
        var fnMap = {};
        var self = this;

        fnMap["version"] = function() {
            return Version.getVersion();
        };

        fnMap["api_level"] = function() {
            return Version.getApiLevel();
        };

        fnMap["tracking_server"] = function() {
            return (self._config) ? self._config.trackingServer : null;
        };

        fnMap["publisher"] = function() {
            return (self._config) ? self._config.publisher : null;
        };

        fnMap["quiet_mode"] = function() {
            return (self._config) ? self._config.quietMode : false;
        };

        fnMap["ovp"] = function() {
            return (self._config) ? self._config.ovp : null;
        };

        fnMap["sdk"] = function() {
            return (self._config) ? self._config.sdk  : null;
        };

        fnMap["is_primetime"] = function() {
            return (self._config) ? self._config.__isPrimetime : false;
        };

        fnMap["psdk_version"] = function() {
            return (self._config) ? self._config.__psdkVersion : null;
        };

        // Set handlers for the requests we are able to handle.
        this._dataResolver = function(keys) {
            if (!keys || keys.length == 0) return null;

            var result = null;
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                result = result || {};
                result[key] = (fnMap.hasOwnProperty(key)) ? fnMap[key].call(this) : null;
            }

            return result;
        };
    };

    AdobeHeartbeatPlugin.prototype._resumePlaybackIfPossible = function(data) {
        // If we are in ERROR state we cannot resume playback at all.
        if (this._errorInfo) return;

        // Only resume playback if we're neither "paused", "seeking" nor "buffering"
        if (!this._isPaused && !this._isSeeking && !this._isBuffering) {
            this._channel.trigger(new Event(EVENT_API_PLAY, data));
        }
    };

    // Private constants.
    var NAME = "adobe-heartbeat";

    var ADOBE_HEARTBEAT_PLUGIN = NAME;
    var ADOBE_ANALYTICS_PLUGIN = "adobe-analytics";
    var PLAYER_PLUGIN = "player";
    var CLOCK_SERVICE = "service.clock";

    var HEARTBEAT_CHANNEL = "heartbeat-channel";

    var ERROR = "error";
    var AA_START = "aa_start";
    var AA_AD_START = "sc_ad_start";
    var VIDEO_LOAD = "video_load";
    var VIDEO_UNLOAD = "video_unload";
    var VIDEO_START = "video_start";
    var VIDEO_COMPLETE = "video_complete";
    var PLAY = "play";
    var PAUSE = "pause";
    var AD_START = "ad_start";
    var AD_COMPLETE = "ad_complete";
    var BUFFER_START = "buffer_start";
    var BUFFER_COMPLETE = "buffer_complete";
    var SEEK_START = "seek_start";
    var SEEK_COMPLETE = "seek_complete";
    var CHAPTER_START = "chapter_start";
    var CHAPTER_COMPLETE = "chapter_complete";
    var BITRATE_CHANGE = "bitrate_change";
    var TRACK_ERROR = "track_error";

    var TIMER_REPORTING = "heartbeat.reporting";
    var TIMER_REPORTING_TICK = TIMER_REPORTING + ".tick";

    var KEY_RESET = "reset";
    var KEY_SOURCE = "source";
    var KEY_ERROR_ID = "error_id";
    var KEY_TRACKING_SERVER = "tracking_server";
    var KEY_CHECK_STATUS_SERVER = "check_status_server";
    var KEY_PUBLISHER = "publisher";
    var KEY_QUIET_MODE = "quiet_mode";
    var KEY_SSL = "ssl";

    var EVENT_API_AA_START = "api:aa_start";
    var EVENT_API_AA_AD_START = "api:aa_ad_start";
    var EVENT_API_CONFIG = "api:config";
    var EVENT_API_VIDEO_LOAD = "api:video_load";
    var EVENT_API_VIDEO_UNLOAD = "api:video_unload";
    var EVENT_API_VIDEO_START = "api:video_start";
    var EVENT_API_VIDEO_COMPLETE = "api:video_complete";
    var EVENT_API_AD_START = "api:ad_start";
    var EVENT_API_AD_COMPLETE = "api:ad_complete";
    var EVENT_API_PLAY = "api:play";
    var EVENT_API_PAUSE = "api:pause";
    var EVENT_API_BUFFER_START = "api:buffer_start";
    var EVENT_API_SEEK_START = "api:seek_start";
    var EVENT_API_SEEK_COMPLETE = "api:seek_complete";
    var EVENT_API_CHAPTER_START = "api:chapter_start";
    var EVENT_API_CHAPTER_COMPLETE = "api:chapter_complete";
    var EVENT_API_TRACK_ERROR = "api:track_error";
    var EVENT_API_TRACK_INTERNAL_ERROR = "api:track_internal_error";
    var EVENT_API_BITRATE_CHANGE = "api:bitrate_change";
    var EVENT_API_QUANTUM_END = "api:quantum_end";

    var ERROR_SOURCE_HEARTBEAT = "sourceErrorHeartbeat";

    var CMD_ENABLE_CHECK_STATUS_TIMER = "clock:check_status.resume";
    var CMD_DISABLE_REPORTING_TIMER = "clock:reporting.pause";

    var EVENT_CLOCK_CHECK_STATUS_GET_SETTINGS = "clock:check_status.get_settings";

    // Export symbols.
    ah.AdobeHeartbeatPlugin = AdobeHeartbeatPlugin;
})(global.ADB.core, global.ADB.va, ah);


// Export symbols.
global.ADB.va.plugins.ah || (global.ADB.va.plugins.ah = ah);

})(this);

// AdobeAnalyticsPlugin
(function(global) {
if (typeof aa === 'undefined') {
    var aa = {};
}

(function(va, aa) {
    'use strict';

    var ErrorInfo = va.ErrorInfo;

    function InputDataValidator(onFail, ctx) {
        this._onFail = {
            fn: onFail,
            ctx: ctx
        };
    }

    //
    //---------------------[ Public API ]---------------------
    //
    InputDataValidator.prototype.validateFields = function(data, params) {
        if (!data) {
            return this._fail("Data cannot be null");
        }

        if (params) {
            for (var i = 0; i < params.length; i++) {
                var param = params[i];

                switch (param) {
                    // VideoInfo fields
                    case "videoId":
                        if (!data.hasOwnProperty("videoId")) return this._fail("The ID for the main video must be specified.");
                        if (typeof data.videoId != "string") return this._fail("The ID for the main video must be a String.");
                        if (data.videoId === "") return this._fail("The ID for the main video cannot be an empty string.");
                        break;

                    case "streamType":
                        if (!data.hasOwnProperty("streamType")) return this._fail("The stream type for the main video must be specified.");
                        if (typeof data.streamType != "string") return this._fail("The stream type for the main video must be a String.");
                        if (data.streamType === "") return this._fail("The stream type for the main video cannot be an empty string.");
                        break;

                    case "playerName":
                        if (!data.hasOwnProperty("playerName")) return this._fail("The player name for the main video must be specified.");
                        if (typeof data.playerName != "string") return this._fail("The player name for the main video must be a String.");
                        if (data.playerName === "") return this._fail("The player name for the main video cannot be an empty string.");
                        break;

                    case "videoLength":
                        if (!data.hasOwnProperty("videoLength")) return this._fail("The length of the main video must be specified.");
                        if (typeof data.videoLength != "number") return this._fail("The length of the main video must be a Number.");
                        if (isNaN(data.videoLength)) return this._fail("The length of the main video cannot be NaN.");
                        break;

                    // AdBreakInfo fields
                    case "podPlayerName":
                        if (!data.hasOwnProperty("podPlayerName")) return this._fail("The player name for the ad-break must be specified.");
                        if (typeof data.podPlayerName != "string") return this._fail("The player name for the ad-break must be a String.");
                        if (data.podPlayerName === "") return this._fail("The player name for the ad-break cannot be an empty string.");
                        break;
                    case "podPosition":
                        if (!data.hasOwnProperty("podPosition")) return this._fail("Position (index) of the ad-break must be specified.");
                        if (typeof data.podPosition != "number") return this._fail("Position (index) of the ad-break must be a Number.");
                        if (isNaN(data.podPosition)) return this._fail("Position (index) of the ad-break cannot be NaN.");
                        break;


                    // AdInfo fields
                    case "adId":
                        if (!data.hasOwnProperty("adId")) return this._fail("The ad ID must be specified.");
                        if (typeof data.adId != "string") return this._fail("The ad ID must be a String.");
                        if (data.adId === "") return this._fail("The ad ID cannot be an empty string.");
                        break;

                    case "adPosition":
                        if (!data.hasOwnProperty("adPosition")) return this._fail("Position (index) of the ad must be specified.");
                        if (typeof data.adPosition != "number") return this._fail("Position (index) of the ad must be a Number.");
                        if (isNaN(data.adPosition)) return this._fail("Position (index) of the ad cannot be NaN.");
                        break;

                    case "adLength":
                        if (!data.hasOwnProperty("adLength")) return this._fail("The length of the ad must be specified.");
                        if (typeof data.adLength != "number") return this._fail("The length of the ad must be a Number.");
                        if (isNaN(data.adLength)) return this._fail("The length of the ad cannot be NaN.");
                        break;

                    // Don't know what to do with this.
                    default:
                        return this._fail("Unable to validate unknown parameter: " + param);
                        break;
                }
            }
        }

        return true;
    };

    //
    //---------------------[ Private helper functions ]-----------------------
    //

    InputDataValidator.prototype._fail = function(errorString) {
        var errorInfo = new ErrorInfo("Invalid input data", errorString);

        if (this._onFail.fn) {
            this._onFail.fn.call(this._onFail.ctx, errorInfo);
        }

        return false;
    };

    // Export symbols.
    aa.InputDataValidator = InputDataValidator;
})(global.ADB.va, aa);

(function(aa) {
    'use strict';

    function AdobeAnalyticsPluginConfig() {
        this.channel = DEFAULT_EMPTY_STRING;
        this.debugLogging = false;
    }

    // Private constants
    var DEFAULT_EMPTY_STRING = "";

    // Export symbols.
    aa.AdobeAnalyticsPluginConfig = AdobeAnalyticsPluginConfig;
})(aa);

(function(aa) {
    'use strict';

    function AdobeAnalyticsPluginDelegate() {}

    AdobeAnalyticsPluginDelegate.prototype.onError = function(errorInfo) {};

    // Export symbols.
    aa.AdobeAnalyticsPluginDelegate = AdobeAnalyticsPluginDelegate;
})(aa);

(function(core, va, utils, aa) {
    'use strict';

    var Trigger = core.Trigger;
    var BasePlugin = core.plugin.BasePlugin;
    var ParamMapping = core.plugin.ParamMapping;
    var Channel = core.radio.Channel;
    var Command = core.radio.Command;
    var CommandQueue = core.radio.CommandQueue;

    var ErrorInfo = va.ErrorInfo;

    var MD5 = utils.md5;
    var StringUtils = utils.StringUtils;
    var ObjectUtils = utils.ObjectUtils;

    var AdobeAnalyticsPluginConfig = aa.AdobeAnalyticsPluginConfig;
    var InputDataValidator = aa.InputDataValidator;

    core.extend(AdobeAnalyticsPlugin, BasePlugin);

    /**
     * @extends {BasePlugin}
     * @constructor
     */
    function AdobeAnalyticsPlugin(appMeasurement, delegate) {
        AdobeAnalyticsPlugin.__super__.constructor.call(this, NAME);

        if (!appMeasurement) {
            throw new Error("The reference to the AppMeasurement object cannot be NULL.");
        }
        this._appMeasurement = appMeasurement;

        this._delegate = delegate;

        this._customMetaKeys = [];
        this._videoMetadata = {};
        this._adMetadata = {};
        this._chapterMetadata = {};
        this._errorInfo = null;

        this._workQueue = new CommandQueue(true, COMMAND_DELAY);

        this._inputDataValidator = new InputDataValidator(function(errorInfo) {
            this._errorInfo = errorInfo;
            this._logger.error(this._logTag, errorInfo.getMessage() + " | " + errorInfo.getDetails());
            this._trigger(ERROR, errorInfo);
            if (this._delegate) {
                this._delegate.onError(this._errorInfo);
            }
        }, this);


        // Try to fetch the visitor id values as soon as possible.
        this._appMeasurement.isReadyToTrack();

        this._setupDataResolver();
    }

    //
    //---------------------[ Public overridden functions ]---------------------
    //
    AdobeAnalyticsPlugin.prototype.configure = function(configData) {
        if (!configData) {
            throw new Error("Reference to the configuration data cannot be NULL.");
        }

        if (!(configData instanceof AdobeAnalyticsPluginConfig)) {
            throw new Error("Expected config data to be instance of AdobeAnalyticsPluginConfig.");
        }

        this._config = configData;

        if (this._config.debugLogging) {
            this._logger.enable();
        } else {
            this._logger.disable();
        }

        this._logger.debug(this._logTag, "#configure({" +
              "trackingServer=" + this._config.debugLogging +
            ", channel="        + this._config.channel +
            ", ssl="            + this._appMeasurement.ssl +
            "})");
    };

    AdobeAnalyticsPlugin.prototype.bootstrap = function(pluginManager) {
        // Do the plugin core bootstrapping.
        AdobeAnalyticsPlugin.__super__.bootstrap.call(this, pluginManager);

        this._registerCommands();
        this._registerBehaviours();
    };

    AdobeAnalyticsPlugin.prototype.setup = function() {
        if (this._appMeasurement.isReadyToTrack()) {
            this._onAppMeasurementReady();
        } else {
            this._appMeasurement.callbackWhenReadyToTrack(this, this._onAppMeasurementReady, []);
        }

        AdobeAnalyticsPlugin.__super__.setup.call(this);
    };

    //
    //---------------------[ Public API ]---------------------
    //
    AdobeAnalyticsPlugin.prototype.setVideoMetadata = function(data) {
        this._videoMetadata = ObjectUtils.clone(data);
    };

    AdobeAnalyticsPlugin.prototype.setAdMetadata = function(data) {
        this._adMetadata = ObjectUtils.clone(data);
    };

    AdobeAnalyticsPlugin.prototype.setChapterMetadata = function(data) {
        this._chapterMetadata = ObjectUtils.clone(data);
    };

    //
    //---------------------[ Protected overridden functions ]---------------------
    //
    AdobeAnalyticsPlugin.prototype._canProcess = function() {
        if (this._errorInfo) {
            this._logger.error(this._logTag, "#_canProcess() > In ERROR state.");
            return false;
        }

        return AdobeAnalyticsPlugin.__super__._canProcess.call(this);
    };

    //
    // -------------------[ Command handlers ]-----------------------
    //
    AdobeAnalyticsPlugin.prototype._cmdVideoLoad = function(data) {
        // Clear the error info to get out of the ERROR state.
        this._errorInfo = null;
    };

    AdobeAnalyticsPlugin.prototype._cmdVideoStart = function(data) {
        this._logger.debug(this._logTag, "#_cmdVideoStart()");

        // Fast exit.
        if (!this._canProcess()) return;

        this._workQueue.addCommand(new Command(this._executeOpen, this, [data]));
    };

    AdobeAnalyticsPlugin.prototype._cmdAdStart = function(data) {
        this._logger.debug(this._logTag, "#_cmdAdStart()");

        // Fast exit.
        if (!this._canProcess()) return;

        this._workQueue.addCommand(new Command(this._executeOpenAd, this, [data]));
    };

    AdobeAnalyticsPlugin.prototype._cmdHeartbeatPluginError = function(data) {
        // Already in error state.
        if (this._errorInfo) return;

        this._errorInfo = new ErrorInfo("Internal error", "HeartbeatPlugin is in ERROR state.");
        this._trigger(ERROR, this._errorInfo);

        if (this._delegate) {
            this._delegate.onError(this._errorInfo);
        }
    };

    //
    // -------------------[ Private helper methods ]-----------------------
    //
    AdobeAnalyticsPlugin.prototype._resetAppMeasurementContextData = function() {
        delete this._appMeasurement.contextData["a.contentType"];

        delete this._appMeasurement.contextData["a.media.name"];
        delete this._appMeasurement.contextData["a.media.friendlyName"];
        delete this._appMeasurement.contextData["a.media.length"];
        delete this._appMeasurement.contextData["a.media.playerName"];
        delete this._appMeasurement.contextData["a.media.channel"];
        delete this._appMeasurement.contextData["a.media.view"];

        delete this._appMeasurement.contextData["a.media.ad.name"];
        delete this._appMeasurement.contextData["a.media.ad.friendlyName"];
        delete this._appMeasurement.contextData["a.media.ad.podFriendlyName"];
        delete this._appMeasurement.contextData["a.media.ad.length"];
        delete this._appMeasurement.contextData["a.media.ad.playerName"];
        delete this._appMeasurement.contextData["a.media.ad.pod"];
        delete this._appMeasurement.contextData["a.media.ad.podPosition"];
        delete this._appMeasurement.contextData["a.media.ad.podSecond"];
        delete this._appMeasurement.contextData["a.media.ad.view"];

        for (var i = 0; i < this._customMetaKeys.length; i++) {
            var key = this._customMetaKeys[i];
            delete this._appMeasurement.contextData[key];
        }

        this._customMetaKeys = [];
    };

    AdobeAnalyticsPlugin.prototype._executeOpen = function(data) {
        this._logger.debug(this._logTag, "#_executeOpen(" +
              "id=" + data.videoId +
            ", videoName=" + data.videoName +
            ", streamType=" + data.streamType +
            ", length=" + data.videoLength +
            ", playerName=" + data.playerName +
            ", channel=" + data.channel +
            ", isPrimetime=" + data.isPrimetime +
            ")");

        // Fast exit.
        if (!this._canProcess()) return;

        if (!this._inputDataValidator.validateFields(data, ["videoId", "streamType", "videoLength", "playerName"])) return;

        this._resetAppMeasurementContextData();

        // Place the custom metadata first, so that it can be overridden
        // by the standard values later if conflicts occur.
        for (var key in data.metaVideo) {
            if (data.metaVideo.hasOwnProperty(key)) {
                this._appMeasurement.contextData[key] = data.metaVideo[key];
                this._customMetaKeys.push(key);
            }
        }

        this._appMeasurement.contextData["a.contentType"]        = data.streamType;

        this._appMeasurement.contextData["a.media.name"]         = data.videoId;
        this._appMeasurement.contextData["a.media.friendlyName"] = data.videoName || "";
        this._appMeasurement.contextData["a.media.length"]       = Math.floor(data.videoLength) || "0.0";
        this._appMeasurement.contextData["a.media.playerName"]   = data.playerName;
        this._appMeasurement.contextData["a.media.channel"]      = data.channel || "";
        this._appMeasurement.contextData["a.media.view"]         = true;

        this._appMeasurement.pev3 = SC_CONTENT_TYPE_VIDEO;
        this._appMeasurement.pe   = data.isPrimetime ? SC_START_PRIMETIME : SC_START;

        this._appMeasurement.track();

        // Trigger the AA_START event on the next tick to give
        // other plugins the chance to handle the VIDEO_START event.
        var self = this;
        setTimeout(function() {
            self._trigger(AA_START, data);
        }, 0);
    };


    AdobeAnalyticsPlugin.prototype._executeOpenAd = function(data) {
        var podId = MD5(data.videoId) + "_" + data.podPosition;

        this._logger.debug(this._logTag, "#_executeOpenAd(" +
              "id=" + data.adId +
            ", streamType=" + data.streamType +
            ", length=" + data.adLength +
            ", podPlayerName=" + data.podPlayerName +
            ", parentId=" + data.videoId +
            ", podId=" + podId +
            ", parentPodPosition=" + data.adPosition +
            ", podSecond=" + data.podSecond +
            ")");

        // Fast exit.
        if (!this._canProcess()) return;

        if (!this._inputDataValidator.validateFields(data, ["videoId", "streamType", "playerName", "adId", "adLength", "podPlayerName", "adPosition"])) return;

        // The podSecond is optional; defaults to the current playhead value.
        data.podSecond = (data.podSecond == null || isNaN(data.podSecond)) ? data.playhead : data.podSecond;

        this._resetAppMeasurementContextData();

        // Place the custom metadata first, so that it can be overridden
        // by the standard values later if conflicts occur.
        var key;
        for (key in data.metaVideo) {
            if (data.metaVideo.hasOwnProperty(key)) {
                this._appMeasurement.contextData[key] = data.metaVideo[key];
                this._customMetaKeys.push(key);
            }
        }

        for (key in data.metaAd) {
            if (data.metaAd.hasOwnProperty(key)) {
                this._appMeasurement.contextData[key] = data.metaAd[key];
                this._customMetaKeys.push(key);
            }
        }

        this._appMeasurement.contextData["a.contentType"]                = data.streamType;

        this._appMeasurement.contextData["a.media.name"]                 = data.videoId;
        this._appMeasurement.contextData["a.media.playerName"]           = data.playerName;
        this._appMeasurement.contextData["a.media.channel"]              = data.channel || "";

        this._appMeasurement.contextData["a.media.ad.name"]              = data.adId;
        this._appMeasurement.contextData["a.media.ad.friendlyName"]      = data.adName || "";
        this._appMeasurement.contextData["a.media.ad.podFriendlyName"]   = data.podName || "";
        this._appMeasurement.contextData["a.media.ad.length"]            = Math.floor(data.adLength) || "0.0";
        this._appMeasurement.contextData["a.media.ad.playerName"]        = data.podPlayerName;
        this._appMeasurement.contextData["a.media.ad.pod"]               = podId;
        this._appMeasurement.contextData["a.media.ad.podPosition"]       = Math.floor(data.adPosition) || "0.0";
        this._appMeasurement.contextData["a.media.ad.podSecond"]         = Math.floor(data.podSecond) || "0.0";
        this._appMeasurement.contextData["a.media.ad.view"]              = true;

        this._appMeasurement.pev3 = SC_CONTENT_TYPE_AD;
        this._appMeasurement.pe   = data.isPrimetime ? SC_START_AD_PRIMETIME : SC_START_AD;

        this._appMeasurement.track();

        // Trigger the AA_AD_START event on the next tick to give
        // other plugins the chance to handle the AD_START event.
        var self = this;
        setTimeout(function() {
            self._trigger(AA_AD_START, data);
        }, 0);
    };

    AdobeAnalyticsPlugin.prototype._setupDataResolver = function() {
        var fnMap = {};

        var self = this;

        fnMap["rsid"] = function() {
            return self._appMeasurement.account;
        };

        fnMap["tracking_server"] = function() {
            return (self._appMeasurement.ssl && self._appMeasurement.trackingServerSecure)
                   ? self._appMeasurement.trackingServerSecure
                   : self._appMeasurement.trackingServer;
        };

        fnMap["ssl"] = function() {
            return self._appMeasurement.ssl;
        };

        fnMap["vid"] = function() {
            return self._appMeasurement.visitorID;
        };

        fnMap["aid"] = function() {
            return self._appMeasurement.analyticsVisitorID;
        };

        fnMap["mid"] = function() {
            return self._appMeasurement.marketingCloudVisitorID;
        };

        fnMap["channel"] = function() {
            return (self._config) ? self._config.channel : null;
        };

        fnMap["meta"] = function(key) {
            var tokens = key.split(".");

            if (tokens.length < 2) {
                return null;
            }

            var domain = tokens.shift();
            key = tokens.join(".");

            switch (domain) {
                case "video":
                    if (key == Channel.WILDCARD) {
                        return self._videoMetadata;
                    } else {
                        return self._videoMetadata[key];
                    }
                    break;

                case "ad":
                    if (key == Channel.WILDCARD) {
                        return self._adMetadata;
                    } else {
                        return self._adMetadata[key];
                    }
                    break;

                case "chapter":
                    if (key == Channel.WILDCARD) {
                        return self._chapterMetadata;
                    } else {
                        return self._chapterMetadata[key];
                    }
                    break;

                default:
                    return null;
            }
        };

        // Set handlers for the requests we are able to handle.
        this._dataResolver = function(keys) {
            if (!keys || keys.length == 0) return null;

            var result = null;
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];

                result = result || {};
                if (StringUtils.startsWith(key, "meta.")) { // this is a custom data request.
                    result[key] = fnMap.meta(key.split("meta.")[1]);
                } else { // this is a regular data request
                    result[key] = (fnMap.hasOwnProperty(key)) ? fnMap[key].call(this) : null;
                }
            }

            return result;
        };
    };

    AdobeAnalyticsPlugin.prototype._registerCommands = function() {
        this._pluginManager.comply(this, "handleVideoLoad", this._cmdVideoLoad);
        this._pluginManager.comply(this, "handleVideoStart", this._cmdVideoStart);
        this._pluginManager.comply(this, "handleAdStart", this._cmdAdStart);
        this._pluginManager.comply(this, "handleHeartbeatPluginError", this._cmdHeartbeatPluginError);
    };

    AdobeAnalyticsPlugin.prototype._registerBehaviours = function() {
        // Register behaviours for handling player events by the AppMeasurement lib.
        this._pluginManager.registerBehaviour(new Trigger(PLAYER_PLUGIN, VIDEO_LOAD), this, "handleVideoLoad");

        this._pluginManager.registerBehaviour(new Trigger(PLAYER_PLUGIN, VIDEO_START), this, "handleVideoStart", [
            new ParamMapping(PLAYER_PLUGIN, "video.id", "videoId"),
            new ParamMapping(PLAYER_PLUGIN, "video.streamType", "streamType"),
            new ParamMapping(PLAYER_PLUGIN, "video.name", "videoName"),
            new ParamMapping(PLAYER_PLUGIN, "video.length", "videoLength"),
            new ParamMapping(PLAYER_PLUGIN, "video.playerName", "playerName"),
            new ParamMapping(PLAYER_PLUGIN, "video.streamType", "streamType"),
            new ParamMapping(ADOBE_HEARTBEAT_PLUGIN, "is_primetime", "isPrimetime"),
            new ParamMapping(ADOBE_ANALYTICS_PLUGIN, "channel", "channel"),
            new ParamMapping(ADOBE_ANALYTICS_PLUGIN, "meta.video.*", "metaVideo")
        ]);

        this._pluginManager.registerBehaviour(new Trigger(PLAYER_PLUGIN, AD_START), this, "handleAdStart", [
            new ParamMapping(PLAYER_PLUGIN, "video.id", "videoId"),
            new ParamMapping(PLAYER_PLUGIN, "video.streamType", "streamType"),
            new ParamMapping(PLAYER_PLUGIN, "video.playhead", "playhead"),
            new ParamMapping(PLAYER_PLUGIN, "video.playerName", "playerName"),
            new ParamMapping(PLAYER_PLUGIN, "ad.id", "adId"),
            new ParamMapping(PLAYER_PLUGIN, "ad.length", "adLength"),
            new ParamMapping(PLAYER_PLUGIN, "ad.position", "adPosition"),
            new ParamMapping(PLAYER_PLUGIN, "ad.name", "adName"),
            new ParamMapping(PLAYER_PLUGIN, "pod.name", "podName"),
            new ParamMapping(PLAYER_PLUGIN, "pod.position", "podPosition"),
            new ParamMapping(PLAYER_PLUGIN, "pod.playerName", "podPlayerName"),
            new ParamMapping(PLAYER_PLUGIN, "pod.startTime", "podSecond"),
            new ParamMapping(ADOBE_HEARTBEAT_PLUGIN, "is_primetime", "isPrimetime"),
            new ParamMapping(ADOBE_ANALYTICS_PLUGIN, "channel", "channel"),
            new ParamMapping(ADOBE_ANALYTICS_PLUGIN, "meta.video.*", "metaVideo"),
            new ParamMapping(ADOBE_ANALYTICS_PLUGIN, "meta.ad.*", "metaAd")
        ]);

        this._pluginManager.registerBehaviour(new Trigger(ADOBE_HEARTBEAT_PLUGIN, ERROR), this, "handleHeartbeatPluginError");
    };

    AdobeAnalyticsPlugin.prototype._onAppMeasurementReady = function() {
        this._workQueue.resume();
    };

    // Private constants.
    var NAME = "adobe-analytics";

    var ADOBE_ANALYTICS_PLUGIN = NAME;
    var PLAYER_PLUGIN = "player";
    var ADOBE_HEARTBEAT_PLUGIN = "adobe-heartbeat";

    var COMMAND_DELAY = 2000;

    var ERROR = "error";

    var SC_CONTENT_TYPE_VIDEO = "video";
    var SC_CONTENT_TYPE_AD = "videoAd";
    var SC_START = "ms_s";
    var SC_START_PRIMETIME = "msp_s";
    var SC_START_AD = "msa_s";
    var SC_START_AD_PRIMETIME = "mspa_s";

    var AA_START = "aa_start";
    var AA_AD_START = "sc_ad_start";
    var VIDEO_LOAD = "video_load";
    var VIDEO_START = "video_start";
    var AD_START = "ad_start";

    // Export symbols.
    aa.AdobeAnalyticsPlugin = AdobeAnalyticsPlugin;
})(global.ADB.core, global.ADB.va, global.ADB.va.utils, aa);


// Export symbols.
global.ADB.va.plugins.aa || (global.ADB.va.plugins.aa = aa);

})(this);
