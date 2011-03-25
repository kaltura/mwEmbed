var tv, _fwsdk;
if (tv) {
    if (typeof tv != "object") throw new Error("tv already exists and is not a object");
} else tv = {};
if (tv.freewheel) {
    if (typeof tv.freewheel != "object") throw new Error("tv.freewheel already exists and is not a object");
} else tv.freewheel = {};
if (tv.freewheel.SDK) {
    if (typeof tv.freewheel.SDK != "object") throw new Error("tv.freewheel.SDK already exists and is not a object");
} else tv.freewheel.SDK = {};
_fwsdk = tv.freewheel.SDK;
_fwsdk.RENDERER_STATE_INIT = 1;
_fwsdk.RENDERER_STATE_STARTING = 2;
_fwsdk.RENDERER_STATE_STARTED = 3;
_fwsdk.RENDERER_STATE_COMPLETING = 4;
_fwsdk.RENDERER_STATE_COMPLETED = 5;
_fwsdk.RENDERER_STATE_FAILED = 6;
_fwsdk.EVENT_SLOT_IMPRESSION = "slotImpression";
_fwsdk.EVENT_AD_IMPRESSION = "defaultImpression";
_fwsdk.EVENT_AD_QUARTILE = "quartile";
_fwsdk.EVENT_AD_FIRST_QUARTILE = "firstQuartile";
_fwsdk.EVENT_AD_MIDPOINT = "midPoint";
_fwsdk.EVENT_AD_THIRD_QUARTILE = "thirdQuartile";
_fwsdk.EVENT_AD_COMPLETE = "complete";
_fwsdk.EVENT_AD_CLICK = "defaultClick";
_fwsdk.EVENT_AD_MUTE = "_mute";
_fwsdk.EVENT_AD_UNMUTE = "_un-mute";
_fwsdk.EVENT_AD_COLLAPSE = "_collapse";
_fwsdk.EVENT_AD_EXPAND = "_expand";
_fwsdk.EVENT_AD_PAUSE = "_pause";
_fwsdk.EVENT_AD_RESUME = "_resume";
_fwsdk.EVENT_AD_REWIND = "_rewind";
_fwsdk.EVENT_AD_ACCEPT_INVITATION = "_accept-invitation";
_fwsdk.EVENT_AD_CLOSE = "_close";
_fwsdk.EVENT_AD_MINIMIZE = "_minimize";
_fwsdk.EVENT_ERROR = "_e_unknown";
_fwsdk.EVENT_RESELLER_NO_AD = "resellerNoAd";
_fwsdk.INFO_KEY_CUSTOM_ID = "customId";
_fwsdk.INFO_KEY_MODULE_TYPE = "moduleType";
_fwsdk.MODULE_TYPE_RENDERER = "renderer";
_fwsdk.MODULE_TYPE_TRANSLATOR = "translator";
_fwsdk.INFO_KEY_ERROR_CODE = "errorCode";
_fwsdk.INFO_KEY_ERROR_INFO = "errorInfo";
_fwsdk.INFO_KEY_ERROR_MODULE = "errorModule";
_fwsdk.ERROR_IO = "_e_io";
_fwsdk.ERROR_TIMEOUT = "_e_timeout";
_fwsdk.ERROR_NULL_ASSET = "_e_null-asset";
_fwsdk.ERROR_ADINSTANCE_UNAVAILABLE = "_e_adinst-unavail";
_fwsdk.ERROR_UNKNOWN = "_e_unknown";
_fwsdk.ERROR_MISSING_PARAMETER = "_e_missing-param";
_fwsdk.ERROR_NO_AD_AVAILABLE = "_e_no-ad";
_fwsdk.ERROR_PARSE_ERROR = "_e_parse-error";
_fwsdk.ERROR_INVALID_VALUE = "_e_invalid-value";
_fwsdk.ERROR_NO_RENDERER = "_e_no-renderer";
_fwsdk.INFO_KEY_SHOW_BROWSER = "showBrowser";
_fwsdk.INFO_KEY_CUSTOM_EVENT_NAME = "customEventName";
_fwsdk.EVENT_TYPE_CLICK_TRACKING = "CLICKTRACKING";
_fwsdk.EVENT_TYPE_IMPRESSION = "IMPRESSION";
_fwsdk.EVENT_TYPE_CLICK = "CLICK";
_fwsdk.EVENT_TYPE_STANDARD = "STANDARD";
_fwsdk.EVENT_TYPE_GENERIC = "GENERIC";
_fwsdk.EVENT_TYPE_ERROR = "ERROR";
_fwsdk.EVENT_VIDEO_VIEW = "videoView";
_fwsdk.SHORT_EVENT_TYPE_IMPRESSION = "i";
_fwsdk.SHORT_EVENT_TYPE_CLICK = "c";
_fwsdk.SHORT_EVENT_TYPE_STANDARD = "s";
_fwsdk.SHORT_EVENT_TYPE_ERROR = "e";
_fwsdk.INFO_KEY_PARAMETERS = "parameters";
_fwsdk.URL_PARAMETER_KEY_ET = "et";
_fwsdk.URL_PARAMETER_KEY_CN = "cn";
_fwsdk.URL_PARAMETER_KEY_INIT = "init";
_fwsdk.URL_PARAMETER_KEY_LAST = "last";
_fwsdk.URL_PARAMETER_KEY_CT = "ct";
_fwsdk.URL_PARAMETER_KEY_METR = "metr";
_fwsdk.URL_PARAMETER_KEY_CR = "cr";
_fwsdk.URL_PARAMETER_KEY_KEY_VALUE = "kv";
_fwsdk.URL_PARAMETER_KEY_ERROR_INFO = "additional";
_fwsdk.URL_PARAMETER_KEY_ERROR_MODULE = "renderer";
_fwsdk.URL_PARAMETER_KEY_CREATIVE_RENDITION_ID = "reid";
_fwsdk.Util = {
    trim: function (a) {
        if (typeof a != "string") return a.toString();
        return a.replace(/^\s\s*/, "").replace(/\s\s*$/, "")
    },
    isBlank: function (a) {
        return !a || _fwsdk.Util.trim(a) === ""
    },
    mixin: function (a, b) {
        var c = {};
        for (var d in b) if (typeof c[d] == "undefined" || c[d] != b[d]) a[d] = b[d];
        return a
    },
    copy: function (a) {
        return _fwsdk.Util.mixin({}, a)
    },
    bind: function (a, b) {
        var c = Array.prototype.slice.call(arguments);
        c.shift();
        b = c.shift();
        return function () {
            return b.apply(a, c.concat(Array.prototype.slice.call(arguments)))
        }
    },
    getObject: function (a, b, c) {
        if (!a) return null;
        a = a.split(".");
        b = b || window;
        for (var d = 0, e; b && (e = a[d]); d++) b = e in b ? b[e] : c ? (b[e] = {}) : undefined;
        return b
    },
    buildNode: function (a, b, c, d, e) {
        _fwsdk.log("Util.buildNode()");
        c || (c = document);
        var g = navigator.userAgent.match(/Firefox/) != null;
        a.innerHTML = b || "";
        a = a.getElementsByTagName("script");
        var h = c.getElementsByTagName("head")[0];
        for (b = 0; b < a.length; ++b) if (g || a[b].src) {
            var f = c.createElement("script");
            if (a[b].charset) f.charset = a[b].charset;
            if (a[b].src) f.src = a[b].src;
            if (a[b].innerHTML) f.innerHTML = a[b].innerHTML;
            f.onload = f.onreadystatechange = function () {
                if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") h.removeChild(f)
            };
            try {
                h.appendChild(f)
            } catch (k) {
                _fwsdk.log("load script err: " + k)
            }
        } else {
            f = a[b].innerHTML;
            if (d) f = f.replace(/var fw_scope = document;/, "var fw_scope=" + d + ";");
            if (e) f = f.replace(/var fw_scope_window = window;/, "var fw_scope_window=" + e + ";");
            eval(f)
        }
    },
    replacePageSlot: function (a, b) {
        _fwsdk.log("Util.replacePageSlot(" + Array.prototype.slice.call(arguments).join(",") + ")");
        var c, d, e;
        try {
            c = document.getElementById(a) ? document : parent.document.getElementById(a) ? parent.document : null;
            d = document.getElementById(a) ? "window" : parent.document.getElementById(a) ? "parent" : null
        } catch (g) {
            d = c = null
        }
        if (!c) for (var h = 0; h < window.frames.length; h++) try {
            if (window.frames[h].document.getElementById(a)) {
                c = window.frames[h].document;
                d = "window.frames[" + h + "]"
            }
        } catch (f) {
            _fwsdk.log(f)
        }
        if (d) e = d + ".document";
        _fwsdk.log("fw replacing slot " + a + " in frame " + e);
        if (!c) throw "Slot element not found: " + a;
        h = c.getElementById("_fw_container_" + a);
        _fwsdk.Util.buildNode(h, b, c, e, d)
    },
    pingURL: function (a) {
        _fwsdk.log("send callback: " + a);
        if (a) {
            var b = Math.random(),
                c = document.createElement("iframe");
            c.name = "_fw_cb_" + b;
            c.id = "_fw_cb_" + b;
            c.width = "0";
            c.height = "0";
            c.scrolling = "no";
            c.frameborder = "0";
            c.style.position = "absolute";
            c.style.bottom = "0";
            c.style.right = "0";
            c.src = a;
            document.body && document.body.appendChild(c)
        }
    },
    pingURLs: function (a) {
        for (var b = 0; b < a.length; b++) _fwsdk.Util.pingURL(a[b])
    },
    setParameterInURL: function (a, b, c) {
        if (!a || !b || c === null) return null;
        var d = false,
            e;
        a = a.split("?");
        var g;
        c = encodeURIComponent(c);
        if (a[1]) {
            g = a[1].split("&");
            for (var h = 0; h < g.length; ++h) {
                e = g[h].split("=");
                if (e[0] == b) {
                    g[h] = e[0] + "=" + c;
                    d = true;
                    break
                }
            }
            e = g.join("&");
            d || (e = b + "=" + c + "&" + e)
        } else e = b + "=" + c;
        return e = a[0] + "?" + e
    },
    isIPad: function () {
        return navigator.userAgent.toLowerCase().search("ipad") > -1
    },
    isIPhone: function () {
        return navigator.userAgent.toLowerCase().search("iphone") > -1
    },
    iOSVersion: function () {
        var a = navigator.userAgent.toLowerCase(),
            b = a.search(/os \d_\d/);
        if (b > -1) {
            var c = a.substr(b + 3, 1);
            a = a.substr(b + 5, 1);
            return 1 * c + 0.1 * a
        } else
        return 0
    }
};
_fwsdk.MediaState = function () {};
_fwsdk.MediaState.prototype = {};
_fwsdk.MediaState.prototype.constructor = _fwsdk.MediaState;
_fwsdk.Util.mixin(_fwsdk.MediaState.prototype, {
    play: function (a) {
        _fwsdk.log(this._name + " play(" + a + ")")
    },
    complete: function (a) {
        _fwsdk.log(this._name + " complete(" + a + ")")
    }
});
_fwsdk.MediaInitState = function () {
    this._name = "MediaInitState"
};
_fwsdk.MediaInitState.prototype = new _fwsdk.MediaState;
_fwsdk.MediaInitState.prototype.constructor = _fwsdk.MediaInitState;
_fwsdk.Util.mixin(_fwsdk.MediaInitState.prototype, {
    play: function (a) {
        _fwsdk.log(this._name + " play(" + a + ")");
        a._state = _fwsdk.MediaPlayingState.instance;
        a.onStartPlaying()
    }
});
_fwsdk.MediaInitState.instance = new _fwsdk.MediaInitState;
_fwsdk.MediaPlayingState = function () {
    this._name = "MediaPlayingState"
};
_fwsdk.MediaPlayingState.prototype = new _fwsdk.MediaState;
_fwsdk.MediaPlayingState.prototype.constructor = _fwsdk.MediaPlayingState;
_fwsdk.Util.mixin(_fwsdk.MediaPlayingState.prototype, {
    complete: function (a) {
        _fwsdk.log(this._name + " complete(" + a + ")");
        a._state = _fwsdk.MediaEndState.instance;
        a.onCompletePlaying()
    }
});
_fwsdk.MediaPlayingState.instance = new _fwsdk.MediaPlayingState;
_fwsdk.MediaReplayingState = function () {
    this._name = "MediaReplayingState"
};
_fwsdk.MediaReplayingState.prototype = new _fwsdk.MediaState;
_fwsdk.MediaReplayingState.prototype.constructor = _fwsdk.MediaReplayingState;
_fwsdk.Util.mixin(_fwsdk.MediaReplayingState.prototype, {
    complete: function (a) {
        _fwsdk.log(this._name + " complete(" + a + ")");
        a._state = _fwsdk.MediaEndState.instance;
        a.onCompleteReplaying()
    }
});
_fwsdk.MediaReplayingState.instance = new _fwsdk.MediaReplayingState;
_fwsdk.MediaEndState = function () {
    this._name = "MediaEndState"
};
_fwsdk.MediaEndState.prototype = new _fwsdk.MediaState;
_fwsdk.MediaEndState.prototype.constructor = _fwsdk.MediaEndState;
_fwsdk.Util.mixin(_fwsdk.MediaEndState.prototype, {
    play: function (a) {
        _fwsdk.log(this._name + " play(" + a + ")");
        a._state = _fwsdk.MediaReplayingState.instance;
        a.onStartReplaying()
    }
});
_fwsdk.MediaEndState.instance = new _fwsdk.MediaEndState;
_fwsdk.RendererState = function () {};
_fwsdk.RendererState.prototype = {};
_fwsdk.RendererState.prototype.constructor = _fwsdk.RendererState;
_fwsdk.Util.mixin(_fwsdk.RendererState.prototype, {
    start: function () {},
    notifyStarted: function () {},
    stop: function () {},
    complete: function () {},
    notifyCompleted: function () {},
    fail: function (a) {
        a._rendererState = _fwsdk.RendererFailedState.instance;
        a._adInstance.complete()
    }
});
_fwsdk.RendererInitState = function () {};
_fwsdk.RendererInitState.prototype = new _fwsdk.RendererState;
_fwsdk.RendererInitState.prototype.constructor = _fwsdk.RendererInitState;
_fwsdk.RendererInitState.instance = new _fwsdk.RendererInitState;
_fwsdk.Util.mixin(_fwsdk.RendererInitState.prototype, {
    start: function (a) {
        a._rendererState = _fwsdk.RendererStartingState.instance;
        a._renderer.start(a)
    }
});
_fwsdk.RendererStartingState = function () {};
_fwsdk.RendererStartingState.prototype = new _fwsdk.RendererState;
_fwsdk.RendererStartingState.prototype.constructor = _fwsdk.RendererStartingState;
_fwsdk.RendererStartingState.instance = new _fwsdk.RendererStartingState;
_fwsdk.Util.mixin(_fwsdk.RendererStartingState.prototype, {
    notifyStarted: function (a) {
        a._rendererState = _fwsdk.RendererStartedState.instance;
        a._adInstance.play()
    }
});
_fwsdk.RendererStartedState = function () {};
_fwsdk.RendererStartedState.prototype = new _fwsdk.RendererState;
_fwsdk.RendererStartedState.prototype.constructor = _fwsdk.RendererStartedState;
_fwsdk.RendererStartedState.instance = new _fwsdk.RendererStartedState;
_fwsdk.Util.mixin(_fwsdk.RendererStartedState.prototype, {
    complete: function (a) {
        a._rendererState = _fwsdk.RendererCompletingState.instance
    }
});
_fwsdk.RendererCompletingState = function () {};
_fwsdk.RendererCompletingState.prototype = new _fwsdk.RendererState;
_fwsdk.RendererCompletingState.prototype.constructor = _fwsdk.RendererCompletingState;
_fwsdk.RendererCompletingState.instance = new _fwsdk.RendererCompletingState;
_fwsdk.Util.mixin(_fwsdk.RendererCompletingState.prototype, {
    notifyCompleted: function (a) {
        a._rendererState = _fwsdk.RendererCompletedState.instance;
        a._adInstance.complete()
    }
});
_fwsdk.RendererCompletedState = function () {};
_fwsdk.RendererCompletedState.prototype = new _fwsdk.RendererState;
_fwsdk.RendererCompletedState.prototype.constructor = _fwsdk.RendererCompletedState;
_fwsdk.RendererCompletedState.instance = new _fwsdk.RendererCompletedState;
_fwsdk.RendererFailedState = function () {};
_fwsdk.RendererFailedState.prototype = new _fwsdk.RendererState;
_fwsdk.RendererFailedState.prototype.constructor = _fwsdk.RendererFailedState;
_fwsdk.RendererFailedState.instance = new _fwsdk.RendererFailedState;
_fwsdk.Ad = function (a) {
    this._context = a;
    this._creatives = []
};
_fwsdk.Ad.prototype = {};
_fwsdk.Ad.prototype.constructor = _fwsdk.Ad;
_fwsdk.Util.mixin(_fwsdk.Ad.prototype, {
    parse: function (a) {
        if (a) {
            this._id = a.adId || null;
            var b = 0;
            for (a = a.creatives || []; b < a.length; b++) {
                var c = a[b],
                    d = new _fwsdk.Creative(this._context);
                d.parse(c);
                this._creatives.push(d)
            }
        }
    },
    getCreative: function (a) {
        for (i = 0; i < this._creatives.length; i++) if (this._creatives[i]._id == a) return this._creatives[i];
        return null
    }
});
_fwsdk.Creative = function (a) {
    this._context = a;
    this._duration = this._baseUnit = this._id = null;
    this._parameters = {};
    this._creativeRenditions = []
};
_fwsdk.Creative.prototype = {};
_fwsdk.Creative.prototype.constructor = _fwsdk.Creative;
_fwsdk.Util.mixin(_fwsdk.Creative.prototype, {
    parse: function (a) {
        if (a) {
            this._id = a.creativeId || null;
            this._baseUnit = a.baseUnit || null;
            this._duration = a.duration * 1;
            for (var b = 0, c = a.parameters || []; b < c.length; b++) {
                var d = c[b];
                this._parameters[d.name] = d.value
            }
            b = 0;
            for (c = a.creativeRenditions || []; b < c.length; b++) {
                d = c[b];
                a = new _fwsdk.CreativeRendition(this._context);
                a.parse(d);
                a.setDuration(this._duration);
                a._baseUnit = this._baseUnit;
                this._creativeRenditions.push(a)
            }
        }
    },
    getCreativeRendition: function (a, b) {
        for (var c =
        null, d = 0, e = this._creativeRenditions || []; d < e.length; d++) if (e[d]._id == a) {
            if (e[d]._replicaId == b) return e[d];
            if (!c || e[d]._replicaId < c._replicaId) c = e[d]
        }
        return c
    }
});
_fwsdk.CreativeRendition = function (a) {
    this._context = a;
    this._height = this._width = this._preference = this._wrapperUrl = this._wrapperType = this._contentType = this._replicaId = this._id = null;
    this._parameters = {};
    this._primaryCreativeRenditionAsset = null;
    this._otherCreativeRenditionAssets = []
};
_fwsdk.CreativeRendition.prototype = {};
_fwsdk.CreativeRendition.prototype.constructor = _fwsdk.CreativeRendition;
_fwsdk.Util.mixin(_fwsdk.CreativeRendition.prototype, {
    getContentType: function () {
        return this._contentType ? this._contentType : this._primaryCreativeRenditionAsset && this._primaryCreativeRenditionAsset._contentType ? this._primaryCreativeRenditionAsset._contentType : null
    },
    setContentType: function (a) {
        this._contentType = a
    },
    getWrapperType: function () {
        return this._wrapperType
    },
    setWrapperType: function (a) {
        this._wrapperType = a
    },
    getWrapperUrl: function () {
        return this._wrapperUrl
    },
    setWrapperUrl: function (a) {
        this._wrapperUrl =
        a
    },
    getBaseUnit: function () {
        return this._baseUnit
    },
    getPreference: function () {
        return this._preference
    },
    getWidth: function () {
        return this._width
    },
    setWidth: function (a) {
        this._width = a
    },
    getHeight: function () {
        return this._height
    },
    setHeight: function (a) {
        this.height = a
    },
    getDuration: function () {
        return this._duration
    },
    setDuration: function (a) {
        this._duration = a
    },
    getParameter: function (a) {
        return this._parameters[a]
    },
    setParameter: function (a, b) {
        if (b === null) delete this._parameters[a];
        else this._parameters[a] = b
    },
    getPrimaryCreativeRenditionAsset: function () {
        return this._primaryCreativeRenditionAsset
    },
    getOtherCreativeRenditionAssets: function () {
        return this._otherCreativeRenditionAssets
    },
    addCreativeRenditionAsset: function () {
        var a = new _fwsdk.CreativeRenditionAsset(this._context);
        if (this._primaryCreativeRenditionAsset) this._otherCreativeRenditionAssets.push(a);
        else this._primaryCreativeRenditionAsset = a;
        return a
    },
    parse: function (a) {
        if (a) {
            this._id = a.creativeRenditionId || null;
            this._replicaId = a.hasOwnProperty("adReplicaId") ? a.adReplicaId * 1 : -1;
            this._contentType = a.contentType || null;
            this._wrapperType = a.wrapperType || null;
            this._wrapperUrl = a.wrapperUrl || null;
            this._preference = a.preference * 1;
            this._width = a.width * 1;
            this._height = a.height * 1;
            for (var b = 0, c = a.parameters || []; b < c.length; b++) {
                var d = c[b];
                this._parameters[d.name] = d.value
            }
            this._primaryCreativeRenditionAsset = new _fwsdk.CreativeRenditionAsset(this._context);
            this._primaryCreativeRenditionAsset.parse(a.asset);
            b = 0;
            for (c = a.otherAssets || []; b < c.length; b++) {
                d = c[b];
                a = new _fwsdk.CreativeRenditionAsset(this._context);
                a.parse(d);
                this._otherCreativeRenditionAssets.push(a)
            }
        }
    }
});
_fwsdk.CreativeRenditionAsset = function (a) {
    this._context = a;
    this._bytes = this._mimeType = this._contentType = this._content = this._url = this._name = this._id = null
};
_fwsdk.CreativeRenditionAsset.prototype = {};
_fwsdk.CreativeRenditionAsset.prototype.constructor = _fwsdk.CreativeRenditionAsset;
_fwsdk.Util.mixin(_fwsdk.CreativeRenditionAsset.prototype, {
    getName: function () {
        return this._name
    },
    setName: function (a) {
        this._name = a
    },
    getUrl: function () {
        return this._url
    },
    setUrl: function (a) {
        this._url = a
    },
    getContent: function () {
        return this._content
    },
    setContent: function (a) {
        this._content = a
    },
    getMimeType: function () {
        return this._mimeType
    },
    setMimeType: function (a) {
        this._mimeType = a
    },
    getBytes: function () {
        return this._bytes
    },
    setBytes: function (a) {
        this._bytes = a
    },
    parse: function (a) {
        if (a) {
            this._id = a.id || null;
            this._name =
            a.name || null;
            this._url = a.url || null;
            this._content = a.content || null;
            this._contentType = a.contentType || null;
            this._mimeType = a.mimeType || null;
            this._bytes = a.bytes * 1
        }
    }
});
_fwsdk.AdInstance = function (a) {
    this._context = a;
    this._primaryCreativeRendition = this._replicaId = this._creativeRenditionId = this._creativeId = this._adId = this._slot = null;
    this._creativeRenditions = [];
    this._companionAdInstances = [];
    this._eventCallbacks = [];
    this._externalEventCallbackUrlsDictionary = {};
    this._rendererController = new _fwsdk.RendererController(this._context);
    this._rendererController._adInstance = this;
    this._timer = new _fwsdk.Timer;
    this._metr = 0;
    this._state = _fwsdk.MediaInitState.instance
};
_fwsdk.AdInstance.prototype = {};
_fwsdk.AdInstance.prototype.constructor = _fwsdk.AdInstance;
_fwsdk.METR_MASK_QUARTILE = 0;
_fwsdk.METR_MASK_MIDPOINT = 1;
_fwsdk.METR_MASK_COMPLETE = 2;
_fwsdk.METR_MASK_VOLUME = 3;
_fwsdk.METR_MASK_SIZE = 4;
_fwsdk.METR_MASK_CONTROL = 5;
_fwsdk.METR_MASK_REWIND = 6;
_fwsdk.METR_MASK_ACCEPT_INVITATION = 7;
_fwsdk.METR_MASK_CLOSE = 8;
_fwsdk.METR_MASK_MINIMIZE = 9;
_fwsdk.METR_MASK_CLICK = 10;
_fwsdk.AdInstance._metrDictionary = {};
_fwsdk.AdInstance._metrDictionary[_fwsdk.EVENT_AD_FIRST_QUARTILE] = _fwsdk.AdInstance._metrDictionary[_fwsdk.EVENT_AD_THIRD_QUARTILE] = _fwsdk.AdInstance._metrDictionary[_fwsdk.EVENT_AD_QUARTILE] = 1 << _fwsdk.METR_MASK_QUARTILE | 1 << _fwsdk.METR_MASK_MIDPOINT | 1 << _fwsdk.METR_MASK_COMPLETE;
_fwsdk.AdInstance._metrDictionary[_fwsdk.EVENT_AD_MIDPOINT] = 1 << _fwsdk.METR_MASK_MIDPOINT | 1 << _fwsdk.METR_MASK_COMPLETE;
_fwsdk.AdInstance._metrDictionary[_fwsdk.EVENT_AD_COMPLETE] = 1 << _fwsdk.METR_MASK_COMPLETE;
_fwsdk.AdInstance._metrDictionary[_fwsdk.EVENT_AD_MUTE] = 1 << _fwsdk.METR_MASK_VOLUME;
_fwsdk.AdInstance._metrDictionary[_fwsdk.EVENT_AD_UNMUTE] = 1 << _fwsdk.METR_MASK_VOLUME;
_fwsdk.AdInstance._metrDictionary[_fwsdk.EVENT_AD_COLLAPSE] = 1 << _fwsdk.METR_MASK_SIZE;
_fwsdk.AdInstance._metrDictionary[_fwsdk.EVENT_AD_EXPAND] = 1 << _fwsdk.METR_MASK_SIZE;
_fwsdk.AdInstance._metrDictionary[_fwsdk.EVENT_AD_PAUSE] = 1 << _fwsdk.METR_MASK_CONTROL;
_fwsdk.AdInstance._metrDictionary[_fwsdk.EVENT_AD_RESUME] = 1 << _fwsdk.METR_MASK_CONTROL;
_fwsdk.AdInstance._metrDictionary[_fwsdk.EVENT_AD_REWIND] = 1 << _fwsdk.METR_MASK_REWIND;
_fwsdk.AdInstance._metrDictionary[_fwsdk.EVENT_AD_ACCEPT_INVITATION] = 1 << _fwsdk.METR_MASK_ACCEPT_INVITATION;
_fwsdk.AdInstance._metrDictionary[_fwsdk.EVENT_AD_CLOSE] = 1 << _fwsdk.METR_MASK_CLOSE;
_fwsdk.AdInstance._metrDictionary[_fwsdk.EVENT_AD_MINIMIZE] = 1 << _fwsdk.METR_MASK_MINIMIZE;
_fwsdk.AdInstance._metrDictionary[_fwsdk.EVENT_AD_CLICK] = 1 << _fwsdk.METR_MASK_CLICK;
_fwsdk.Util.mixin(_fwsdk.AdInstance.prototype, {
    getAdId: function () {
        return this._adId
    },
    getEventCallbackUrls: function (a, b) {
        var c = [],
            d = b == _fwsdk.EVENT_TYPE_CLICK,
            e = b == _fwsdk.EVENT_TYPE_CLICK_TRACKING,
            g = _fwsdk.EventCallback.getEventCallback(this._eventCallbacks, a, e ? _fwsdk.EVENT_TYPE_CLICK : b);
        if (!g) return c;
        e || c.push(g.getUrl());
        if (!d) {
            d = 0;
            for (g = g._trackingUrls; d < g.length; d++) c.push(g[d]);
            d = 0;
            for (g = this.getExternalEventCallbackUrls(a, b); d < g.length; d++) c.push(g[d])
        }
        return c
    },
    addEventCallbackUrls: function (a, b, c) {
        if (c && this._isValidEventNameAndType(a, b)) if (b == _fwsdk.EVENT_TYPE_CLICK) this.getEventCallback(a, b).setUrlParameter(_fwsdk.URL_PARAMETER_KEY_CR, c.length > 0 ? c[0] : "");
        else {
            for (var d = this._externalEventCallbackUrlsDictionary[b + "-" + a] || [], e = 0; e < c.length; e++) d.push(c[e]);
            this._externalEventCallbackUrlsDictionary[b + "-" + a] = d
        }
    },
    schedule: function () {
        var a = new _fwsdk.AdInstance(this._context);
        a._parent = this;
        a._adId = this._adId;
        a._creativeId = this._creativeId;
        a._slot = this.getSlot();
        for (var b = 0; b < this._eventCallbacks.length; b++) {
            var c =
            this._eventCallbacks[b].copy();
            c._adInstance = a;
            a._eventCallbacks.push(c)
        }
        a._externalEventCallbackUrlsDictionary = _fwsdk.Util.copy(this._externalEventCallbackUrlsDictionary);
        return a
    },
    addCreativeRendition: function () {
        if (!this._primaryCreativeRendition) return this._primaryCreativeRendition = new _fwsdk.CreativeRendition(this._context);
        return null
    },
    getRendererController: function () {
        return this._rendererController
    },
    getSlot: function () {
        if (!this._slot) this._slot = this._context._adResponse.getSlotByCustomId(this._slotCustomId);
        return this._slot
    },
    getCompanionSlots: function () {
        for (var a = [], b = 0; b < this._companionAdInstances.length; b++) a.push(this._companionAdInstances[b]._slot);
        return a
    },
    getPrimaryCreativeRendition: function () {
        return this._primaryCreativeRendition
    },
    setPrimaryCreativeRendition: function (a) {
        this._primaryCreativeRendition = a;
        for (var b = 0, c = this._eventCallbacks || []; b < c.length; b++) c[b].setUrlParameter(_fwsdk.URL_PARAMETER_KEY_CREATIVE_RENDITION_ID, a._id)
    },
    getAllCreativeRenditions: function () {
        for (var a = [this._primaryCreativeRendition], b = 0; b < this._creativeRenditions.length; b++) {
            var c = this._creativeRenditions[b];
            c !== this._primaryCreativeRendition && a.push(c)
        }
        return a
    },
    parse: function (a) {
        if (a) {
            this._adId = a.adId;
            this._creativeId = a.creativeId;
            this._creativeRenditionId = a.creativeRenditionId;
            this._replicaId = a.hasOwnProperty("replicaId") ? a.replicaId * 1 : -1;
            this._primaryCreativeRendition = this._context._adResponse.getCreativeRendition(this._adId, this._creativeId, this._creativeRenditionId, this._replicaId);
            this._creativeRenditions = this._context._adResponse.getCreative(this._adId, this._creativeId)._creativeRenditions;
            for (var b = 0, c = a.eventCallbacks || []; b < c.length; b++) {
                var d = c[b],
                    e = _fwsdk.EventCallback.newEventCallback(this._context, d.name, d.type);
                if (e) {
                    e._adInstance = this;
                    e.parse(d);
                    this._eventCallbacks.push(e)
                }
            }
            b = 0;
            for (c = a.companionAds || []; b < c.length; ++b) if ((d = c[b]) && d.adSlotCustomId) {
                a = new _fwsdk.AdInstance(this._context);
                a._slotCustomId = d.adSlotCustomId;
                a.parse(d);
                this._companionAdInstances.push(a)
            }
        }
    },
    play: function () {
        this._state.play(this);
        if (_fwsdk.MODULE_TYPE_RENDERER == this._rendererController._renderer.info()[_fwsdk.INFO_KEY_MODULE_TYPE]) for (var a = 0; a < this._companionAdInstances.length; a++) this._companionAdInstances[a]._rendererController.play()
    },
    complete: function () {
        this._state.complete(this);
        this._rendererController._renderer = null;
        this._slot.playNextAdInstance()
    },
    onStartPlaying: function () {
        this._timer.tick();
        var a = this.getEventCallback(_fwsdk.EVENT_AD_IMPRESSION, _fwsdk.EVENT_TYPE_IMPRESSION);
        if (this._slot._type == _fwsdk.SLOT_TYPE_TEMPORAL) {
            this._init = "1";
            this._last = "0"
        } else this._last = this._init = "1";
        a && a.process()
    },
    onCompletePlaying: function () {
        if (this._slot._type == _fwsdk.SLOT_TYPE_TEMPORAL) {
            this._init = "0";
            this._last = "1";
            var a = this.getEventCallback(_fwsdk.EVENT_AD_IMPRESSION, _fwsdk.EVENT_TYPE_IMPRESSION);
            a && a.process()
        }
    },
    onStartReplaying: function () {
        this._timer.tick();
        var a = this.getEventCallback(_fwsdk.EVENT_AD_IMPRESSION, _fwsdk.EVENT_TYPE_IMPRESSION);
        if (this._slot._type == _fwsdk.SLOT_TYPE_TEMPORAL) {
            this._init = "2";
            this._last = "0"
        } else {
            this._init = "2";
            this._last = "1"
        }
        a && a.process()
    },
    onCompleteReplaying: function () {
        if (this._slot._type == _fwsdk.SLOT_TYPE_TEMPORAL) {
            this._init = "2";
            this._last = "1";
            var a = this.getEventCallback(_fwsdk.EVENT_AD_IMPRESSION, _fwsdk.EVENT_TYPE_IMPRESSION);
            a && a.process()
        }
    },
    getEventCallback: function (a, b) {
        return _fwsdk.EventCallback.getEventCallback(this._eventCallbacks, a, b)
    },
    setMetr: function (a, b) {
        var c = _fwsdk.AdInstance._metrDictionary[a];
        if (c) {
            if (a == _fwsdk.EVENT_AD_CLICK) b = !b;
            if (b == _fwsdk.CAPABILITY_STATUS_ON) this._metr |= c;
            else this._metr &= ~c
        }
    },
    getExternalEventCallbackUrls: function (a, b) {
        return this._externalEventCallbackUrlsDictionary[b + "-" + a] || []
    },
    _isValidEventNameAndType: function (a, b) {
        if (_fwsdk.Util.isBlank(a) || _fwsdk.Util.isBlank(b)) return false;
        return b == _fwsdk.EVENT_TYPE_CLICK || b == _fwsdk.EVENT_TYPE_CLICK_TRACKING || b == _fwsdk.EVENT_TYPE_IMPRESSION && (a == _fwsdk.EVENT_AD_IMPRESSION || a == _fwsdk.EVENT_AD_FIRST_QUARTILE || a == _fwsdk.EVENT_AD_MIDPOINT || a == _fwsdk.EVENT_AD_THIRD_QUARTILE || a == _fwsdk.EVENT_AD_COMPLETE) || b == _fwsdk.EVENT_TYPE_STANDARD && (a == _fwsdk.EVENT_AD_PAUSE || a == _fwsdk.EVENT_AD_RESUME || a == _fwsdk.EVENT_AD_REWIND || a == _fwsdk.EVENT_AD_MUTE || a == _fwsdk.EVENT_AD_UNMUTE || a == _fwsdk.EVENT_AD_COLLAPSE || a == _fwsdk.EVENT_AD_EXPAND || a == _fwsdk.EVENT_AD_MINIMIZE || a == _fwsdk.EVENT_AD_CLOSE || a == _fwsdk.EVENT_AD_ACCEPT_INVITATION)
    },
    toString: function () {
        return "[AdInstance " + this._adId + "]"
    }
});
_fwsdk.AdManager = function () {
    var a = this;
    this._context = this.newContext();
    this._context.addEventListener(_fwsdk.EVENT_REQUEST_COMPLETE, function (b) {
        a.onRequestComplete(b)
    });
    this._networkId = this._serverURL = "";
    this._onRequestComplete = this._location = null
};
_fwsdk.AdManager.prototype = {
    setNetwork: function (a) {
        _fwsdk.log("AdManager.setNetwork(" + Array.prototype.slice.call(arguments).join(",") + ")");
        if (typeof a == "number" && a > 0) this._networkId = a
    },
    setServerURL: function (a) {
        _fwsdk.log("AdManager.setServerURL(" + Array.prototype.slice.call(arguments).join(",") + ")");
        if (!a || typeof a != "string") _fwsdk.log("AdManager.setServerURL(): url required");
        else this._serverURL = a
    },
    setServer: function (a) {
        _fwsdk.log("AdManager.setServer(" + Array.prototype.slice.call(arguments).join(",") + ")");
        this.setServerURL(a)
    },
    setLocation: function (a) {
        _fwsdk.log("AdManager.setLocation(" + Array.prototype.slice.call(arguments).join(",") + ")");
        this._location = a
    },
    newContext: function () {
        _fwsdk.log("AdManager.newContext(" + Array.prototype.slice.call(arguments).join(",") + ")");
        return new _fwsdk.Context(this)
    },
    setParameter: function (a, b, c) {
        _fwsdk.log("AdManager.setParameter(" + Array.prototype.slice.call(arguments).join(",") + ")");
        this._context.setParameter(a, b, c)
    },
    getParameter: function (a) {
        _fwsdk.log("AdManager.getParameter(" + Array.prototype.slice.call(arguments).join(",") + ")");
        return this._context.getParameter(a)
    },
    submitRequest: function (a, b) {
        _fwsdk.log("AdManager.submitRequest()");
        if (a && typeof a == "function") this._onRequestComplete = a;
        else _fwsdk.log("this.adId submitRequest(): callback function required");
        this._context.submitRequest(b / 1E3)
    },
    onRequestComplete: function (a) {
        _fwsdk.log("AdManager.onRequestComplete(" + Array.prototype.slice.call(arguments).join(",") + ")");
        if (this._onRequestComplete) {
            this._onRequestComplete({
                success: a.success,
                response: a.response
            });
            this._onRequestComplete = null
        }
    },
    registerVideoDisplayBase: function (a) {
        _fwsdk.log("AdManager.registerVideoDisplayBase(" + Array.prototype.slice.call(arguments).join(",") + ")");
        this._context.registerVideoDisplayBase(a)
    },
    setVideoAsset: function (a, b) {
        _fwsdk.log("AdManager.setVideoAsset(" + Array.prototype.slice.call(arguments).join(",") + ")");
        this._context.setVideoAsset(a, b)
    },
    setSiteSection: function (a) {
        _fwsdk.log("AdManager.setSiteSection(" + Array.prototype.slice.call(arguments).join(",") + ")");
        this._context.setSiteSection(a)
    },
    addKeyValue: function (a, b) {
        _fwsdk.log("AdManager.addKeyValue(" + Array.prototype.slice.call(arguments).join(",") + ")");
        this._context.addKeyValue(a, b)
    },
    setVideoDisplayCompatibleSizes: function (a) {
        _fwsdk.log("AdManager.setVideoDisplayCompatibleSizes(" + Array.prototype.slice.call(arguments).join(",") + ")");
        this._context.setVideoDisplayCompatibleSizes(a)
    },
    playSlots: function (a, b) {
        _fwsdk.log("AdManager.playSlots(" + a + ")");
        if (typeof a == "string") a = a.toUpperCase();
        this._fillVideoPool(a, _fwsdk.Util.bind(this, this._playSlots, a, b))
    },
    _playSlots: function (a, b) {
        if (typeof b != "function") b = function () {};
        if (this._context._adResponse) {
            for (var c = [], d = this._context.getTemporalSlots(), e = 0; e < d.length; ++e) {
                var g = d[e];
                if (Math.abs(g._timePosition - a) < 0.1 || a == g._timePositionClass.toUpperCase()) c.push(g)
            }
            if (c.length === 0) {
                _fwsdk.log("AdManager.playSlots(): no slot matches", a);
                b()
            } else if (a == _fwsdk.TIME_POSITION_CLASS_OVERLAY || a == _fwsdk.TIME_POSITION_CLASS_MIDROLL) for (e = 0; e < c.length; e++)(function (h) {
                if (!h._onContentVideoTimeUpdate) {
                    var f =
                    h.getBase().getElementsByTagName("video")[0],
                        k = h._onContentVideoTimeUpdate = function () {
                            if (!f.paused && f.currentTime - h._timePosition >= 0 && f.currentTime - h._timePosition < 1) {
                                f.removeEventListener("timeupdate", k, false);
                                h._play(function () {
                                    var j = setInterval(function () {
                                        if (!f.paused && Math.abs(f.currentTime - h._timePosition) > 2) {
                                            f.addEventListener("timeupdate", k, false);
                                            clearInterval(j)
                                        }
                                    }, 1E3)
                                })
                            }
                        };
                    f.addEventListener("timeupdate", k, false)
                }
            })(c[e]);
            else(function () {
                var h = c.shift();
                h ? h._play(arguments.callee) : b()
            })()
        } else {
            _fwsdk.log("AdManager._playSlots() request is not completed");
            b()
        }
    },
    dispose: function () {
        _fwsdk.log("AdManager.dispose()");
        this._context.dispose();
        this._onRequestComplete = null
    },
    _fillVideoPool: function (a, b) {
        _fwsdk.log("AdManager._fillVideoPool()");
        this._context._fillVideoPool(a, b)
    }
};
_fwsdk.AdManager.prototype.constructor = _fwsdk.AdManager;
_fwsdk.AdRequest = function (a) {
    this._context = a;
    this._capabilities = new _fwsdk.Capabilities;
    this._keyValues = [];
    this._playerProfile = "";
    this._compatibleDimensions = this._videoState = null;
    this._temporalSlots = [];
    this._assetLocation = this._assetNetworkId = this._assetDuration = this._assetCustomId = this._assetId = "";
    this._assetAutoPlayType = _fwsdk.VIDEO_ASSET_AUTO_PLAY_TYPE_ATTENDED;
    this._assetViewRandom = this._assetFallbackId = 0;
    this._siteSectionNetworkId = this._siteSectionId = this._siteSectionCustomId = "";
    this._siteSectionViewRandom =
    this._siteSectionFallbackId = 0;
    this._slotScanner = new _fwsdk.PageSlotScanner;
    this._urlParams = {};
    this._urlKeyValues = [];
    this._customInfo = ""
};
_fwsdk.AdRequest.prototype = {
    setCapability: function (a, b) {
        _fwsdk.log("AdRequest.getParameter(" + Array.prototype.slice.call(arguments).join(",") + ")");
        this._capabilities.setCapability(a, b)
    },
    addKeyValue: function (a, b) {
        _fwsdk.log("AdRequest.addKeyValue(" + Array.prototype.slice.call(arguments).join(",") + ")");
        if (!(typeof a != "string" || typeof b != "string" || a.length == 0)) {
            var c = encodeURIComponent(a) + "=" + encodeURIComponent(b);
            this._keyValues.indexOf(c) < 0 && this._keyValues.push(c)
        }
    },
    setProfile: function (a) {
        _fwsdk.log("AdRequest.setProfile(" + Array.prototype.slice.call(arguments).join(",") + ")");
        if (typeof a == "string") this._playerProfile = a
    },
    setVideoState: function (a) {
        _fwsdk.log("AdRequest.setVideoState(" + Array.prototype.slice.call(arguments).join(",") + ")");
        this._videoState = a
    },
    setVideoDisplayCompatibleSizes: function (a) {
        _fwsdk.log("AdRequest.setVideoDisplayCompatibleSizes", a);
        if (a && a.length) {
            for (var b = [], c = {}, d = 0; d < a.length; ++d) {
                _fwsdk.log("dimension is:", a[d].width, "X", a[d].height);
                if (a[d].width > 0 && a[d].height > 0) {
                    var e = a[d].width + "," + a[d].height;
                    if (c[e] == null) {
                        c[e] = "";
                        b.push(e)
                    }
                }
            }
            if (b.length > 0) this._compatibleDimensions = b.join("|")
        }
    },
    setVideoAsset: function (a, b, c, d, e, g, h, f) {
        _fwsdk.log("AdRequest.setVideoAsset(" + Array.prototype.slice.call(arguments).join(",") + ")");
        if (a) {
            switch (h) {
            case _fwsdk.ID_TYPE_FW:
                this._assetId = a;
                break;
            case _fwsdk.ID_TYPE_GROUP:
                this._assetId = "g" + a;
                break;
            default:
                this._assetCustomId = a;
                break
            }
            if (typeof b == "number") this._assetDuration = Math.round(b * 10) / 10;
            if (typeof c == "number") this._assetNetworkId = c;
            if (typeof d == "string") this._assetLocation =
            d;
            if (typeof e == "number") this._assetAutoPlayType = e;
            if (typeof g == "number") this._assetViewRandom = g;
            if (typeof f == "number") this._assetFallbackId = f
        } else _fwsdk.log("AdRequest.setVideoAsset(): id required")
    },
    setSiteSection: function (a, b, c, d, e) {
        _fwsdk.log("AdRequest.setSiteSection(" + Array.prototype.slice.call(arguments).join(",") + ")");
        if (a) {
            switch (d) {
            case _fwsdk.ID_TYPE_FW:
                this._siteSectionId = a;
                break;
            case _fwsdk.ID_TYPE_GROUP:
                this._siteSectionId = "g" + a;
                break;
            default:
                this._siteSectionCustomId = a;
                break
            }
            if (typeof b == "number") this._siteSectionNetworkId = b;
            if (typeof c == "number") this._siteSectionViewRandom = c;
            if (typeof e == "number") this._siteSectionFallbackId = e
        } else _fwsdk.log("AdRequest.setSiteSection(): id required")
    },
    addTemporalSlot: function (a, b, c, d) {
        _fwsdk.log("AdRequest.addTemporalSlot(" + Array.prototype.slice.call(arguments).join(",") + ")");
        if (_fwsdk.Util.isBlank(a) || _fwsdk.Util.isBlank(b) || !(c >= 0)) _fwsdk.log("AdRequest.addTemporalSlot(): invalid parameters");
        else {
            for (var e = 0; e < this._temporalSlots.length; e++) if (this._temporalSlots[e].getCustomId() == a) {
                _fwsdk.log("AdRequest.addTemporalSlot(): slot is already existed, ignored");
                return
            }
            e = new _fwsdk.Slot;
            e._customId = a;
            e._adUnit = b;
            e._timePosition = c;
            e._slotProfile = d;
            this._temporalSlots.push(e)
        }
    },
    scanPageSlots: function () {
        _fwsdk.log("AdRequest.scanPageSlots(" + Array.prototype.slice.call(arguments).join(",") + ")");
        this._slotScanner.scanPageSlots()
    },
    generateTypeBRequestUrl: function () {
        _fwsdk.log("AdRequest.generateTypeBRequestUrl(" + Array.prototype.slice.call(arguments).join(",") + ")");
        var a = this._context._adManager._serverURL.split("?"),
            b = a[0];
        this.parseQueryStr(a.slice(1).join("?"));
        a = this.generateGlobalParametersQueryStr() + ";" + this.generateKeyValuesStr() + ";" + this.generateSlotsTypeBStr();
        _fwsdk.Util.isBlank(this._customInfo) || (a += ";" + this._customInfo);
        return b + "?" + a
    },
    parseQueryStr: function (a) {
        _fwsdk.log("AdRequest.parseQueryStr(" + Array.prototype.slice.call(arguments).join(",") + ")");
        this._urlParams = {};
        this._urlKeyValues = [];
        this._customInfo = "";
        if (a) {
            if (a.charAt(a.length - 1) == ";") a = a.substring(0, a.length - 1);
            var b = a.split(";");
            if (b[0]) for (var c =
            b[0].split("&"), d = 0; d < c.length; ++d) {
                var e = c[d].split("=");
                if (e.length == 2) this._urlParams[e[0]] = e[1]
            }
            if (b[1]) {
                c = b[1].split("&");
                for (d = 0; d < c.length; ++d) this._urlKeyValues.push(c[d])
            }
            if (b[2]) this._customInfo = b.slice(2).join(";")
        }
    },
    generateGlobalParametersQueryStr: function () {
        _fwsdk.log("AdRequest.generateGlobalParametersQueryStr(" + Array.prototype.slice.call(arguments).join(",") + ")");
        for (var a = [
            ["prof", this._playerProfile, "string"],
            ["nw", this._context._adManager._networkId, "number"],
            ["caid", this._assetCustomId, "string"],
            ["asid", this._assetId, "string"],
            ["vdur", this._assetDuration, "number"],
            ["asnw", this._assetNetworkId, "number"],
            ["asml", this._assetLocation, "string"],
            ["vprn", this._assetViewRandom, "number"],
            ["afid", this._assetFallbackId, "number"],
            ["csid", this._siteSectionCustomId, "string"],
            ["ssid", this._siteSectionId, "string"],
            ["ssnw", this._siteSectionNetworkId, "number"],
            ["pvrn", this._siteSectionViewRandom, "number"],
            ["sfid", this._siteSectionFallbackId, "number"],
            ["cd", this._compatibleDimensions || this.detectScreenDimension(), "string"],
            ["vclr", _fwsdk.version, "string"],
            ["resp", "json", "string"],
            ["cbfn", "tv.freewheel.SDK._instanceQueue['Context_" + this._context._instanceId + "'].requestComplete", "string"]
        ], b = 0; b < a.length; b++) {
            var c = a[b];
            switch (c[2]) {
            case "string":
                _fwsdk.Util.isBlank(c[1]) || (this._urlParams[c[0]] = encodeURIComponent(c[1]));
                break;
            case "number":
                if (c[1] > 0) this._urlParams[c[0]] = c[1];
                break
            }
        }
        a = "";
        for (key in this._urlParams) Object[key] || (a += key + "=" + this._urlParams[key] + "&");
        a = a.substring(0, a.length - 1);
        a = this._capabilities.parseCapabilites(a);
        b = "";
        switch (this._assetAutoPlayType) {
        case _fwsdk.VIDEO_ASSET_AUTO_PLAY_TYPE_UNATTENDED:
            b = "+play+uapl";
            break;
        case _fwsdk.VIDEO_ASSET_AUTO_PLAY_TYPE_NON_AUTO_PLAY:
            b = "-play";
            break;
        default:
            b = "+play-uapl";
            break
        }
        return a = a.replace(/flag=/, "flag=" + encodeURIComponent(b))
    },
    generateKeyValuesStr: function () {
        _fwsdk.log("AdRequest.generateKeyValuesStr(" + Array.prototype.slice.call(arguments).join(",") + ")");
        for (var a = this._keyValues.concat("_fw_h_x_flash_version=" + encodeURIComponent("0,0,0,0")), b = 0; b < this._urlKeyValues.length; b++) {
            var c =
            this._urlKeyValues[b];
            a.indexOf(c) < 0 && a.push(c)
        }(b = this._context._adManager._location) && a.push("ltlg=" + encodeURIComponent(Math.round(b.coords.latitude * 1E4) / 1E4 + "," + Math.round(b.coords.longitude * 1E4) / 1E4));
        return a.join("&")
    },
    generateSlotsTypeBStr: function () {
        _fwsdk.log("AdRequest.generateSlotsTypeBStr(" + Array.prototype.slice.call(arguments).join(",") + ")");
        for (var a = "", b = [], c = 0; c < this._temporalSlots.length; c++) {
            var d = this._temporalSlots[c];
            d = [
                ["slid", d._customId, "string"],
                ["slau", d._adUnit, "string"],
                ["ptgt", "a", "string"],
                ["tpos", d._timePosition, "number"],
                ["envp", d._slotProfile, "string"]
            ];
            for (var e = [], g = 0; g < d.length; g++) {
                var h = d[g];
                switch (h[2]) {
                case "string":
                    _fwsdk.Util.isBlank(h[1]) || e.push(h[0] + "=" + encodeURIComponent(h[1]));
                    break;
                case "number":
                    h[1] >= 0 && e.push(h[0] + "=" + h[1]);
                    break
                }
            }
            b.push(e.join("&"))
        }
        if (b.length > 0) a = b.join(";") + ";";
        a += this._slotScanner.slotsToTypeBStr();
        return a
    },
    detectScreenDimension: function () {
        return screen.width + "," + screen.height
    }
};
_fwsdk.AdResponse = function (a) {
    this._context = a
};
_fwsdk.AdResponse.prototype = {};
_fwsdk.AdResponse.prototype.constructor = _fwsdk.AdResponse;
_fwsdk.Util.mixin(_fwsdk.AdResponse.prototype, {
    parse: function (a, b, c) {
        this._data = a;
        this._temporalSlots = [];
        this._videoPlayerNonTemporalSlots = [];
        this._siteSectionNonTemporalSlots = [];
        this._profileParameters = {};
        this._knownPageSlots = c;
        this._ads = [];
        var d;
        d = _fwsdk.Util.getObject("parameters", a) || [];
        for (c = 0; c < d.length; ++c) {
            var e = d[c];
            this._profileParameters[e.name] = e.value
        }
        d = _fwsdk.Util.getObject("ads.ads", a) || [];
        for (c = 0; c < d.length; ++c) {
            e = new _fwsdk.Ad(this._context);
            e.parse(d[c]);
            this._ads.push(e)
        }
        d = _fwsdk.Util.getObject("siteSection.videoPlayer.videoAsset.adSlots", a) || [];
        for (c = 0; c < d.length; ++c) {
            e = new _fwsdk.Slot(this._context);
            e._type = _fwsdk.SLOT_TYPE_TEMPORAL;
            e._baseId = b;
            e.parse(d[c]);
            this._temporalSlots.push(e)
        }
        d = _fwsdk.Util.getObject("siteSection.videoPlayer.adSlots", a) || [];
        for (c = 0; c < d.length; ++c) {
            e = new _fwsdk.Slot(this._context);
            e._type = _fwsdk.SLOT_TYPE_VIDEOPLAYER_NONTEMPORAL;
            e.parse(d[c]);
            e._timePositionClass = _fwsdk.TIME_POSITION_CLASS_DISPLAY;
            this._videoPlayerNonTemporalSlots.push(e)
        }
        d = _fwsdk.Util.getObject("siteSection.adSlots", a) || [];
        for (c = 0; c < d.length; ++c) {
            e =
            new _fwsdk.Slot(this._context);
            e._type = _fwsdk.SLOT_TYPE_SITESECTION_NONTEMPORAL;
            e.parse(d[c]);
            e._timePositionClass = _fwsdk.TIME_POSITION_CLASS_DISPLAY;
            this._siteSectionNonTemporalSlots.push(e)
        }
        if (this._knownPageSlots) for (c = 0; c < this._knownPageSlots.length; ++c) if (!this.getSlotByCustomId(this._knownPageSlots[c])) {
            e = new _fwsdk.Slot(this._context);
            e._type = _fwsdk.SLOT_TYPE_SITESECTION_NONTEMPORAL;
            e.parse({
                customId: this._knownPageSlots[c],
                eventCallbacks: [],
                selectedAds: []
            });
            this._siteSectionNonTemporalSlots.push(e)
        }
    },
    getCreativeRendition: function (a, b, c, d) {
        return (a = this.getCreative(a, b)) ? a.getCreativeRendition(c, d) : null
    },
    getCreative: function (a, b) {
        for (var c = 0; c < this._ads.length; c++) {
            var d = this._ads[c];
            if (d._id == a) return d.getCreative(b)
        }
        return null
    },
    getTemporalSlots: function () {
        return this._temporalSlots
    },
    getSiteSectionNonTemporalSlots: function () {
        return this._siteSectionNonTemporalSlots
    },
    getVideoPlayerNonTemporalSlots: function () {
        return this._videoPlayerNonTemporalSlots
    },
    getSlotByCustomId: function (a) {
        for (var b = 0; b < this._temporalSlots.length; ++b) if (this._temporalSlots[b]._customId == a) return this._temporalSlots[b];
        for (b = 0; b < this._videoPlayerNonTemporalSlots.length; ++b) if (this._videoPlayerNonTemporalSlots[b]._customId == a) return this._videoPlayerNonTemporalSlots[b];
        for (b = 0; b < this._siteSectionNonTemporalSlots.length; ++b) if (this._siteSectionNonTemporalSlots[b]._customId == a) return this._siteSectionNonTemporalSlots[b];
        _fwsdk.log("getSlotByCustomId(): not found", a);
        return null
    }
});
_fwsdk.Capabilities = function () {
    this._capabilities = {};
    this.init()
};
_fwsdk.Capabilities.prototype = {
    init: function () {
        for (var a = [_fwsdk.CAPABILITY_SLOT_TEMPLATE, _fwsdk.CAPABILITY_MULTIPLE_CREATIVE_RENDITIONS, _fwsdk.CAPABILITY_RECORD_VIDEO_VIEW, _fwsdk.CAPABILITY_FALLBACK_UNKNOWN_ASSET, _fwsdk.CAPABILITY_FALLBACK_UNKNOWN_SITE_SECTION, _fwsdk.CAPABILITY_SLOT_CALLBACK, _fwsdk.CAPABILITY_NULL_CREATIVE], b = 0; b < a.length; b++) this._capabilities[a[b]] = _fwsdk.CAPABILITY_STATUS_ON
    },
    setCapability: function (a, b) {
        this._capabilities[a] = b
    },
    parseCapabilites: function (a) {
        a = a;
        var b = "";
        for (var c in this._capabilities) {
            switch (this._capabilities[c]) {
            case _fwsdk.CAPABILITY_STATUS_ON:
                b += "+" + c;
                break;
            case _fwsdk.CAPABILITY_STATUS_OFF:
                b += "-" + c;
                break
            }
            a = a.replace(new RegExp("(%2B|-|\\+)" + c, "g"), "")
        }
        b = encodeURIComponent(b);
        if (a.indexOf("flag=") > -1) a = a.replace(/flag=/, "flag=" + b);
        else a += "&flag=" + b;
        return a
    }
};
_fwsdk.version = "js-3.8.0-r6437-201103090647";
if (typeof window != "undefined") {
    if (!window._fw_admanager) window._fw_admanager = {};
    window._fw_admanager.version = _fwsdk.version
}
_fwsdk.log = function () {
    if (window.console && window.console.log) {
        for (var a = "[FW]", b = 0; b < arguments.length; b++) a += " " + arguments[b];
        window.console.log(a)
    }
};
_fwsdk.log("FreeWheel Integration Runtime", _fwsdk.version);
_fwsdk._firstAdTimeout = false;
_fwsdk._instanceCounter = 0;
_fwsdk._instanceQueue = {};
_fwsdk.CAPABILITY_SLOT_TEMPLATE = "sltp";
_fwsdk.CAPABILITY_MULTIPLE_CREATIVE_RENDITIONS = "emcr";
_fwsdk.CAPABILITY_RECORD_VIDEO_VIEW = "exvt";
_fwsdk.CAPABILITY_CHECK_COMPANION = "cmpn";
_fwsdk.CAPABILITY_CHECK_TARGETING = "targ";
_fwsdk.CAPABILITY_FALLBACK_UNKNOWN_ASSET = "unka";
_fwsdk.CAPABILITY_FALLBACK_UNKNOWN_SITE_SECTION = "unks";
_fwsdk.CAPABILITY_SLOT_CALLBACK = "slcb";
_fwsdk.CAPABILITY_NULL_CREATIVE = "nucr";
_fwsdk.SLOT_TYPE_TEMPORAL = "temporal";
_fwsdk.SLOT_TYPE_VIDEOPLAYER_NONTEMPORAL = "videoPlayerNonTemporal";
_fwsdk.SLOT_TYPE_SITESECTION_NONTEMPORAL = "siteSectionNonTemporal";
_fwsdk.TIME_POSITION_CLASS_PREROLL = "PREROLL";
_fwsdk.TIME_POSITION_CLASS_MIDROLL = "MIDROLL";
_fwsdk.TIME_POSITION_CLASS_POSTROLL = "POSTROLL";
_fwsdk.TIME_POSITION_CLASS_OVERLAY = "OVERLAY";
_fwsdk.TIME_POSITION_CLASS_DISPLAY = "DISPLAY";
_fwsdk.EVENT_REQUEST_COMPLETE = "onRequestComplete";
_fwsdk.EVENT_SLOT_ENDED = "onSlotEnded";
_fwsdk.CAPABILITY_STATUS_OFF = 0;
_fwsdk.CAPABILITY_STATUS_ON = 1;
_fwsdk.PARAMETER_LEVEL_PROFILE = 0;
_fwsdk.PARAMETER_LEVEL_GLOBAL = 1;
_fwsdk.PARAMETER_LEVEL_OVERRIDE = 5;
_fwsdk.PARAMETER_PLAY_MIDROLL_BY_CURRENT_VIDEO_ELEMENT = "PARAMETER_PLAY_MIDROLL_BY_CURRENT_VIDEO_ELEMENT";
_fwsdk.ID_TYPE_FW = 1;
_fwsdk.ID_TYPE_CUSTOM = 2;
_fwsdk.ID_TYPE_GROUP = 3;
_fwsdk.VIDEO_STATE_PLAYING = 1;
_fwsdk.VIDEO_STATE_PAUSED = 2;
_fwsdk.VIDEO_STATE_STOPPED = 3;
_fwsdk.VIDEO_STATE_COMPLETED = 4;
_fwsdk.VIDEO_ASSET_AUTO_PLAY_TYPE_ATTENDED = 1;
_fwsdk.VIDEO_ASSET_AUTO_PLAY_TYPE_UNATTENDED = 2;
_fwsdk.VIDEO_ASSET_AUTO_PLAY_TYPE_NON_AUTO_PLAY = 3;
_fwsdk.ADUNIT_PREROLL = "preroll";
_fwsdk.ADUNIT_MIDROLL = "midroll";
_fwsdk.ADUNIT_POSTROLL = "postroll";
_fwsdk.ADUNIT_OVERLAY = "overlay";
_fwsdk.Context = function (a) {
    this._adManager = a;
    this._adRequest = new _fwsdk.AdRequest(this);
    this._temporalSlotBaseId = this._adResponse = null;
    this._globalLevelParameterDictionary = {};
    this._overrideLevelParameterDictionary = {};
    this._rendererManifest = {};
    this._eventDispatcher = new _fwsdk.EventDispatcher;
    this._requestTimeoutId = null;
    this._isRequestSubmitted = false;
    this._instanceId = _fwsdk._instanceCounter;
    _fwsdk._instanceQueue["Context_" + _fwsdk._instanceCounter] = this;
    _fwsdk._instanceCounter++
};
_fwsdk.Context.prototype = {
    setCapability: function (a, b) {
        _fwsdk.log("Context.setCapability(" + Array.prototype.slice.call(arguments).join(",") + ")");
        this._adRequest.setCapability(a, b)
    },
    addKeyValue: function (a, b) {
        _fwsdk.log("Context.addKeyValue(" + Array.prototype.slice.call(arguments).join(",") + ")");
        this._adRequest.addKeyValue(a, b)
    },
    setParameter: function (a, b, c) {
        _fwsdk.log("Context.setParameter(" + Array.prototype.slice.call(arguments).join(",") + ")");
        var d = null;
        if (c == _fwsdk.PARAMETER_LEVEL_GLOBAL) d = this._globalLevelParameterDictionary;
        else if (c == _fwsdk.PARAMETER_LEVEL_OVERRIDE) d = this._overrideLevelParameterDictionary;
        else
        return;
        if (b === null) delete d[a];
        else d[a] = b
    },
    getParameter: function (a, b) {
        _fwsdk.log("Context.getParameter(" + Array.prototype.slice.call(arguments).join(",") + ")");
        if (b == _fwsdk.PARAMETER_LEVEL_GLOBAL) return this._globalLevelParameterDictionary[a];
        else if (b == _fwsdk.PARAMETER_LEVEL_OVERRIDE) return this._overrideLevelParameterDictionary[a];
        else {
            if (this._overrideLevelParameterDictionary.hasOwnProperty(a)) return this._overrideLevelParameterDictionary[a];
            if (this._globalLevelParameterDictionary.hasOwnProperty(a)) return this._globalLevelParameterDictionary[a];
            if (this._adResponse && this._adResponse._profileParameters.hasOwnProperty(a)) return this._adResponse._profileParameters[a];
            return null
        }
    },
    setVideoState: function (a) {
        _fwsdk.log("Context.setVideoState(" + Array.prototype.slice.call(arguments).join(",") + ")");
        this._adRequest.setVideoState(a)
    },
    registerVideoDisplayBase: function (a) {
        _fwsdk.log("Context.registerVideoDisplayBase(" + Array.prototype.slice.call(arguments).join(",") + ")");
        if (!a || typeof a != "string") _fwsdk.log("Context.registerVideoDisplayBase(): id required");
        else this._temporalSlotBaseId = a
    },
    setVideoDisplayCompatibleSizes: function (a) {
        _fwsdk.log("Context.setVideoDisplayCompatibleSizes(" + Array.prototype.slice.call(arguments).join(",") + ")");
        this._adRequest.setVideoDisplayCompatibleSizes(a)
    },
    setProfile: function (a) {
        _fwsdk.log("Context.setProfile(" + Array.prototype.slice.call(arguments).join(",") + ")");
        this._adRequest.setProfile(a)
    },
    setVideoAsset: function (a, b, c, d, e, g, h, f) {
        _fwsdk.log("Context.setVideoAsset(" + Array.prototype.slice.call(arguments).join(",") + ")");
        this._adRequest.setVideoAsset(a, b, c, d, e, g, h, f)
    },
    setSiteSection: function (a, b, c, d, e) {
        _fwsdk.log("Context.setSiteSection(" + Array.prototype.slice.call(arguments).join(",") + ")");
        this._adRequest.setSiteSection(a, b, c, d, e)
    },
    addTemporalSlot: function (a, b, c, d) {
        _fwsdk.log("Context.addTemporalSlot(" + Array.prototype.slice.call(arguments).join(",") + ")");
        this._adRequest.addTemporalSlot(a, b, c, d)
    },
    getTemporalSlots: function () {
        _fwsdk.log("Context.getTemporalSlots(" + Array.prototype.slice.call(arguments).join(",") + ")");
        return this._adResponse ? this._adResponse._temporalSlots : []
    },
    submitRequest: function (a) {
        _fwsdk.log("Context.submitRequest(" + Array.prototype.slice.call(arguments).join(",") + ")");
        if (this._isRequestSubmitted) _fwsdk.log("Context.submitRequest() request submitted");
        else if (_fwsdk.Util.isBlank(this._adManager._serverURL)) _fwsdk.log("Context.submitRequest() adManager.serverURL is null or empty");
        else {
            this._isRequestSubmitted = true;
            this._adRequest.scanPageSlots();
            var b = document.getElementsByTagName("head")[0],
                c = document.createElement("script"),
                d = this._adManager._serverURL;
            if (d.substring(d.length - 3, d.length) != ".js") d = this._adRequest.generateTypeBRequestUrl();
            c.src = d;
            c.onload = c.onreadystatechange = function () {
                if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") b.removeChild(c)
            };
            var e = this;
            if (typeof a != "number" || a <= 0 || !a) a = 5;
            this._requestTimeoutId = setTimeout(function () {
                _fwsdk.log("request timeout");
                e.requestComplete(null)
            }, a * 1E3);
            _fwsdk.log("will send request to", c.src, "id", this._requestTimeoutId, "timeout", a);
            b.appendChild(c)
        }
    },
    requestComplete: function (a) {
        _fwsdk.log("Context.requestComplete(" + Array.prototype.slice.call(arguments).join(",") + ")");
        clearTimeout(this._requestTimeoutId);
        var b = false;
        if (a !== null) {
            _fwsdk._instanceQueue["Context_" + this._isntanceId] = null;
            this._adResponse = new _fwsdk.AdResponse(this);
            this._adResponse.parse(a, this._temporalSlotBaseId, this._adRequest._slotScanner._knownSlots);
            var c = false;
            for (b = 0; b < this._adResponse._temporalSlots.length; b++) if (this._adResponse._temporalSlots[b].getTimePositionClass() == _fwsdk.TIME_POSITION_CLASS_PREROLL) {
                c = true;
                break
            }
            if (!c) {
                b = new _fwsdk.Slot(this);
                b._customId = "_fw_empty_preroll_slot";
                b._adUnit = "preroll";
                b._timePosition = 0;
                b._timePositionClass = _fwsdk.TIME_POSITION_CLASS_PREROLL;
                b._baseId = this._temporalSlotBaseId;
                b._type = _fwsdk.SLOT_TYPE_TEMPORAL;
                this._adResponse._temporalSlots.push(b)
            }
            c = this._adResponse.getSiteSectionNonTemporalSlots();
            for (b = 0; b < c.length; ++b) c[b].play();
            b = this._adResponse.getVideoPlayerNonTemporalSlots();
            for (c = 0; c < b.length; ++c) b[c].play();
            b = true
        }
        _fwsdk.log("request " + (b ? "success" : "failed"));
        this.dispatchEvent(_fwsdk.EVENT_REQUEST_COMPLETE, {
            success: b,
            response: a
        })
    },
    addEventListener: function (a, b) {
        _fwsdk.log("Context.addEventListener(" + Array.prototype.slice.call(arguments).join(",") + ")");
        this._eventDispatcher.addEventListener(a, b)
    },
    removeEventListener: function (a, b) {
        _fwsdk.log("Context.removeEventListener(" + Array.prototype.slice.call(arguments).join(",") + ")");
        this._eventDispatcher.removeEventListener(a, b)
    },
    dispatchEvent: function (a, b) {
        _fwsdk.log("Context.dispatchEvent(" + Array.prototype.slice.call(arguments).join(",") + ")");
        var c = {
            type: a,
            target: this
        };
        for (var d in b) c[d] = b[d];
        this._eventDispatcher.dispatchEvent(c)
    },
    dispose: function () {
        _fwsdk.log("Context.dispose(" + Array.prototype.slice.call(arguments).join(",") + ")");
        if (this._adResponse) for (var a = 0, b = this._adResponse._temporalSlots || []; a < b.length; ++a) {
            var c = b[a];
            if (c._onContentVideoTimeUpdate) {
                c.getBase().getElementsByTagName("video")[0].removeEventListener("timeupdate", c._onContentVideoTimeUpdate, false);
                c._onContentVideoTimeUpdate =
                null
            }
        }
    },
    _fillVideoPool: function (a, b) {
        _fwsdk.log("Context._fillVideoPool(" + Array.prototype.slice.call(arguments).join(",") + ")");
        _fwsdk._videoPool = _fwsdk._videoPool || [];
        if (_fwsdk.Util.iOSVersion() >= 4.2 && a == _fwsdk.TIME_POSITION_CLASS_PREROLL) {
            var c = document.getElementById(this._temporalSlotBaseId).getElementsByTagName("video")[0],
                d = c.src;
            _fwsdk._videoPoolSize = _fwsdk._videoPoolSize || 20;
            for (var e = _fwsdk._videoPoolSize - _fwsdk._videoPool.length + 1, g = 0, h = 0; h < e; h++) {
                var f = h === 0 ? c : document.createElement("video");
                f.src = "";
                f.addEventListener("error", function (k) {
                    var j = k.target;
                    j.removeEventListener("error", arguments.callee);
                    if (j === c) {
                        j.src = d;
                        _fwsdk.log("restore content <video> src to " + j.src)
                    } else {
                        j._fw_fromVideoPool = true;
                        _fwsdk._videoPool.push(j)
                    }
                    g++;
                    _fwsdk.log("pre-played <video> " + g + "/" + e);
                    g >= e && setTimeout(b, 100)
                }, false);
                f.load();
                f.play()
            }
        } else b()
    }
};
_fwsdk.Context.prototype.constructor = _fwsdk.Context;
_fwsdk.DisplayAdRenderer = function () {};
_fwsdk.DisplayAdRenderer.prototype = {
    start: function (a) {
        var b = a.getAdInstance(),
            c = b.getSlot()._customId;
        if (b = b.getPrimaryCreativeRendition().getPrimaryCreativeRenditionAsset().getContent()) {
            try {
                _fwsdk.Util.replacePageSlot(c, b)
            } catch (d) {
                a.processEvent({
                    name: _fwsdk.RENDERER_STATE_FAILED,
                    info: {
                        errorModule: "DisplayAdRenderer",
                        errorInfo: d
                    }
                });
                return
            }
            a.processEvent({
                name: _fwsdk.RENDERER_STATE_STARTED
            })
        } else a.processEvent({
            name: _fwsdk.RENDERER_STATE_FAILED,
            info: {
                errorModule: "DisplayAdRenderer",
                errorCode: _fwsdk.ERROR_NULL_ASSET
            }
        })
    },
    info: function () {
        return {
            moduleType: _fwsdk.MODULE_TYPE_RENDERER
        }
    }
};
_fwsdk.DisplayAdRenderer.prototype.constructor = _fwsdk.DisplayAdRenderer;
_fwsdk.EventCallback = function () {
    this._url = this._name = this._type = null;
    this._showBrowser = false;
    this._trackingUrls = [];
    this._adInstance = this._slot = null
};
_fwsdk.EventCallback.prototype = {};
_fwsdk.EventCallback.prototype.constructor = _fwsdk.EventCallback;
_fwsdk.EventCallback.getEventCallback = function (a, b, c) {
    for (var d = 0; d < a.length; d++) {
        var e = a[d];
        if (e._name == b && e._type == c) return e
    }
    for (d = 0; d < a.length; d++) {
        e = a[d];
        if (e._type == _fwsdk.EVENT_TYPE_GENERIC) {
            b = _fwsdk.EventCallback.newEventCallback(e._context, b, c);
            b.setUrl(e.getUrl());
            b._slot = e._slot;
            b._adInstance = e._adInstance;
            b && a.push(b);
            return b
        }
    }
    return null
};
_fwsdk.EventCallback.newEventCallback = function (a, b, c) {
    var d = null;
    if (c == _fwsdk.EVENT_TYPE_GENERIC) d = new _fwsdk.EventCallback(a);
    else if (c == _fwsdk.EVENT_TYPE_ERROR) d = new _fwsdk.ErrorEventCallback(a);
    else if (c == _fwsdk.EVENT_TYPE_CLICK) d = new _fwsdk.AdClickEventCallback(a);
    else if (c == _fwsdk.EVENT_TYPE_STANDARD) d = new _fwsdk.AdStandardEventCallback(a);
    else if (b == _fwsdk.EVENT_SLOT_IMPRESSION) d = new _fwsdk.SlotImpressionEventCallback(a);
    else if (b == _fwsdk.EVENT_AD_IMPRESSION) d = new _fwsdk.AdImpressionEventCallback(a);
    else if (b == _fwsdk.EVENT_VIDEO_VIEW) d = new _fwsdk.VideoViewEventCallback(a);
    else if (b == _fwsdk.EVENT_RESELLER_NO_AD) d = new _fwsdk.ResellerNoAdEventCallback(a);
    else if (b == _fwsdk.EVENT_AD_FIRST_QUARTILE || b == _fwsdk.EVENT_AD_MIDPOINT || b == _fwsdk.EVENT_AD_THIRD_QUARTILE || b == _fwsdk.EVENT_AD_COMPLETE) d = new _fwsdk.AdQuartileEventCallback(a);
    else
    return null;
    d._name = b;
    d._type = c;
    return d
};
_fwsdk.Util.mixin(_fwsdk.EventCallback.prototype, {
    parse: function (a) {
        if (a) {
            this._usage = a.use;
            this._type = a.type;
            this._name = a.name;
            this.setUrl(a.url);
            this._showBrowser = a.showBrowser;
            this._trackingUrls = [];
            var b = 0;
            for (a = a.trackingUrls || []; b < a.length; b++) this._trackingUrls.push(a[b].value)
        }
    },
    copy: function () {
        var a = new this.constructor(this._context);
        a._type = this._type;
        a._name = this._name;
        a.setUrl(this.getInternalUrl());
        a._showBrowser = this._showBrowser;
        a._trackingUrls = this._trackingUrls.slice();
        a._slot = this._slot;
        a._adInstance = this._adInstance;
        return a
    },
    getUrl: function () {
        this._url.setParameter(_fwsdk.URL_PARAMETER_KEY_ET, this._getShortType());
        this._url.setParameter(_fwsdk.URL_PARAMETER_KEY_CN, this._name);
        return this._url.toString()
    },
    setUrl: function (a) {
        this._originalUrl = a;
        this._url = new _fwsdk.Url(a)
    },
    getUrlParameter: function (a) {
        return this._url ? this._url.getParameter(a) : null
    },
    setUrlParameter: function (a, b) {
        this._url && this._url.setParameter(a, b)
    },
    process: function (a) {
        a = a || {};
        this._prepareUrlParameters(a);
        this._send(a)
    },
    getInternalUrl: function () {
        var a = new _fwsdk.Url(this._originalUrl);
        a.setParameter(_fwsdk.URL_PARAMETER_KEY_ET, this._getShortType());
        a.setParameter(_fwsdk.URL_PARAMETER_KEY_CN, this._name);
        var b = this.getUrlParameter(_fwsdk.URL_PARAMETER_KEY_CR);
        b && a.setParameter(_fwsdk.URL_PARAMETER_KEY_CR, b);
        return a.toString()
    },
    _prepareUrlParameters: function () {},
    _shouldSkipSendingTrackingAndExternalUrls: function () {
        return false
    },
    _send: function () {
        if (!this._shouldSkipSendingTrackingAndExternalUrls()) {
            _fwsdk.Util.pingURLs(this._trackingUrls);
            this._adInstance && _fwsdk.Util.pingURLs(this._adInstance.getExternalEventCallbackUrls(this._name, this._type))
        }
        _fwsdk.Util.pingURL(this.getUrl())
    },
    _getShortType: function () {
        return this._type == _fwsdk.EVENT_TYPE_IMPRESSION ? _fwsdk.SHORT_EVENT_TYPE_IMPRESSION : this._type == _fwsdk.EVENT_TYPE_CLICK ? _fwsdk.SHORT_EVENT_TYPE_CLICK : this._type == _fwsdk.EVENT_TYPE_STANDARD ? _fwsdk.SHORT_EVENT_TYPE_STANDARD : this._type == _fwsdk.EVENT_TYPE_ERROR ? _fwsdk.SHORT_EVENT_TYPE_ERROR : ""
    }
});
_fwsdk.AdClickEventCallback = function () {};
_fwsdk.AdClickEventCallback.prototype = new _fwsdk.EventCallback;
_fwsdk.AdClickEventCallback.prototype.constructor = _fwsdk.AdClickEventCallback;
_fwsdk.Util.mixin(_fwsdk.AdClickEventCallback.prototype, {
    _send: function (a) {
        var b = this.getUrl();
        _fwsdk.Util.pingURLs(this._trackingUrls);
        _fwsdk.Util.pingURLs(this._adInstance.getExternalEventCallbackUrls(this._name, _fwsdk.EVENT_TYPE_CLICK));
        (a.hasOwnProperty(_fwsdk.INFO_KEY_SHOW_BROWSER) ? a[_fwsdk.INFO_KEY_SHOW_BROWSER] === true : this._showBrowser === true) && !_fwsdk.Util.isBlank(b) ? window.open(b) : _fwsdk.Util.pingURL(b)
    }
});
_fwsdk.AdImpressionEventCallback = function () {};
_fwsdk.AdImpressionEventCallback.prototype = new _fwsdk.EventCallback;
_fwsdk.AdImpressionEventCallback.prototype.constructor = _fwsdk.AdImpressionEventCallback;
_fwsdk.Util.mixin(_fwsdk.AdImpressionEventCallback.prototype, {
    _prepareUrlParameters: function () {
        this._url.setParameter(_fwsdk.URL_PARAMETER_KEY_METR, this._adInstance._metr);
        this._url.setParameter(_fwsdk.URL_PARAMETER_KEY_CT, this._adInstance._timer.tick());
        this._url.setParameter(_fwsdk.URL_PARAMETER_KEY_INIT, this._adInstance._init);
        this._url.setParameter(_fwsdk.URL_PARAMETER_KEY_LAST, this._adInstance._last)
    },
    _shouldSkipSendingTrackingAndExternalUrls: function () {
        return this._adInstance._init != "1"
    },
    process: function (a) {
        _fwsdk.MODULE_TYPE_TRANSLATOR != this._adInstance._rendererController._renderer.info()[_fwsdk.INFO_KEY_MODULE_TYPE] && _fwsdk.EventCallback.prototype.process.call(this, a)
    }
});
_fwsdk.AdQuartileEventCallback = function () {};
_fwsdk.AdQuartileEventCallback.prototype = new _fwsdk.EventCallback;
_fwsdk.AdQuartileEventCallback.prototype.constructor = _fwsdk.AdQuartileEventCallback;
_fwsdk.Util.mixin(_fwsdk.AdQuartileEventCallback.prototype, {
    _prepareUrlParameters: function () {
        this._url.setParameter(_fwsdk.URL_PARAMETER_KEY_METR, this._adInstance._metr);
        this._url.setParameter(_fwsdk.URL_PARAMETER_KEY_CT, this._adInstance._timer.tick())
    },
    process: function (a) {
        if (!this._processed) {
            this._processed = true;
            _fwsdk.EventCallback.prototype.process.call(this, a)
        }
    }
});
_fwsdk.AdStandardEventCallback = function () {};
_fwsdk.AdStandardEventCallback.prototype = new _fwsdk.EventCallback;
_fwsdk.AdStandardEventCallback.prototype.constructor = _fwsdk.AdStandardEventCallback;
_fwsdk.ErrorEventCallback = function () {};
_fwsdk.ErrorEventCallback.prototype = new _fwsdk.EventCallback;
_fwsdk.ErrorEventCallback.prototype.constructor = _fwsdk.ErrorEventCallback;
_fwsdk.Util.mixin(_fwsdk.ErrorEventCallback.prototype, {
    _prepareUrlParameters: function (a) {
        _fwsdk.EventCallback.prototype._prepareUrlParameters();
        var b = a[_fwsdk.INFO_KEY_ERROR_CODE];
        if (!b) b = _fwsdk.ERROR_UNKNOWN;
        var c = a[_fwsdk.INFO_KEY_ERROR_INFO];
        c || (c = "");
        (a = a[_fwsdk.INFO_KEY_ERROR_MODULE]) || (a = "");
        this._url.setParameter(_fwsdk.URL_PARAMETER_KEY_CN, b);
        this._url.setParameter(_fwsdk.URL_PARAMETER_KEY_KEY_VALUE, _fwsdk.URL_PARAMETER_KEY_ERROR_MODULE + "=" + a + "&" + _fwsdk.URL_PARAMETER_KEY_ERROR_INFO + "=" + c)
    },
    getUrl: function () {
        this._url.setParameter(_fwsdk.URL_PARAMETER_KEY_ET, this._getShortType());
        return this._url.toString()
    }
});
_fwsdk.ResellerNoAdEventCallback = function () {};
_fwsdk.ResellerNoAdEventCallback.prototype = new _fwsdk.EventCallback;
_fwsdk.ResellerNoAdEventCallback.prototype.constructor = _fwsdk.ResellerNoAdEventCallback;
_fwsdk.Util.mixin(_fwsdk.ResellerNoAdEventCallback.prototype, {
    process: function (a) {
        if (!this._processed) {
            this._processed = true;
            _fwsdk.EventCallback.prototype.process.call(this, a)
        }
    }
});
_fwsdk.SlotImpressionEventCallback = function () {};
_fwsdk.SlotImpressionEventCallback.prototype = new _fwsdk.EventCallback;
_fwsdk.SlotImpressionEventCallback.prototype.constructor = _fwsdk.SlotImpressionEventCallback;
_fwsdk.Util.mixin(_fwsdk.SlotImpressionEventCallback.prototype, {
    _prepareUrlParameters: function () {
        this._url.setParameter(_fwsdk.URL_PARAMETER_KEY_INIT, this._slot._init)
    },
    _shouldSkipSendingTrackingAndExternalUrls: function () {
        return this._slot._init != "1"
    }
});
_fwsdk.VideoViewEventCallback = function () {};
_fwsdk.VideoViewEventCallback.prototype = new _fwsdk.EventCallback;
_fwsdk.VideoViewEventCallback.prototype.constructor = _fwsdk.VideoViewEventCallback;
_fwsdk.Util.mixin(_fwsdk.VideoViewEventCallback.prototype, {});
_fwsdk.EventDispatcher = function () {
    this._listeners = {}
};
_fwsdk.EventDispatcher.prototype = {
    addEventListener: function (a, b) {
        if (typeof this._listeners[a] == "undefined") this._listeners[a] = [];
        this._listeners[a].push(b)
    },
    dispatchEvent: function (a) {
        if (typeof a == "string") a = {
            type: a
        };
        if (!a.target) a.target = this;
        if (a.type) if (this._listeners[a.type] instanceof Array) for (var b = this._listeners[a.type], c = 0, d = b.length; c < d; c++) b[c].call(this, a)
    },
    removeEventListener: function (a, b) {
        if (this._listeners[a] instanceof Array) {
            var c = this._listeners[a];
            if (b == null) this._listeners[a] = [];
            else {
                a = 0;
                for (var d = c.length; a < d; a++) if (c[a] === b) {
                    c.splice(a, 1);
                    break
                }
            }
        }
    }
};
_fwsdk.EventDispatcher.prototype.constructor = _fwsdk.EventDispatcher;
_fwsdk.Hash = function () {
    this._keys = [];
    this._dictionary = {}
};
_fwsdk.Hash.prototype = {};
_fwsdk.Hash.prototype.constructor = _fwsdk.Hash;
_fwsdk.Util.mixin(_fwsdk.Hash.prototype, {
    setKeyValue: function (a, b, c) {
        if (a) {
            this._dictionary.hasOwnProperty(a) || (c === 0 ? this._keys.unshift(a) : this._keys.push(a));
            this._dictionary[a] = b
        }
    },
    move: function (a) {
        for (var b = 0; b < this._keys.length; b++) {
            var c = this._keys[b];
            if (c == a) {
                this._keys.splice(b, 1);
                this._keys.push(c);
                return
            }
        }
    },
    getValue: function (a) {
        return this._dictionary[a]
    }
});
_fwsdk.NullAdRenderer = function () {};
_fwsdk.NullAdRenderer.prototype = {
    start: function (a) {
        a.setCapability(_fwsdk.EVENT_AD_CLICK, _fwsdk.CAPABILITY_STATUS_OFF);
        a.processEvent({
            name: _fwsdk.RENDERER_STATE_STARTED
        });
        a.processEvent({
            name: _fwsdk.RENDERER_STATE_COMPLETING
        });
        a.processEvent({
            name: _fwsdk.RENDERER_STATE_COMPLETED
        })
    },
    info: function () {
        return {
            moduleType: _fwsdk.MODULE_TYPE_RENDERER
        }
    }
};
_fwsdk.NullAdRenderer.prototype.constructor = _fwsdk.NullAdRenderer;
_fwsdk.OverlayAdRenderer = function () {};
_fwsdk.OverlayAdRenderer.prototype = {
    start: function (a) {
        if (_fwsdk.Util.isIPhone()) a.processEvent({
            name: _fwsdk.RENDERER_STATE_FAILED,
            info: {
                errorModule: "OverlayAdRenderer",
                errorInfo: "does not support iPhone"
            }
        });
        else {
            a.setCapability(_fwsdk.EVENT_AD_CLICK, _fwsdk.CAPABILITY_STATUS_OFF);
            var b = a.getAdInstance();
            this._render(a, b);
            a.processEvent({
                name: _fwsdk.RENDERER_STATE_STARTED
            })
        }
    },
    _render: function (a, b) {
        _fwsdk.log("OverlayAdRenderer._render");
        var c = b.getSlot(),
            d = c.getBase();
        b = b.getPrimaryCreativeRendition();
        var e = b.getPrimaryCreativeRenditionAsset();
        this._videoBaseWidth = d.style.pixelWidth ? d.style.pixelWidth : d.offsetWidth;
        this._videoBaseHeight = d.style.pixelHeight ? d.style.pixelHeight : d.offsetHeight;
        this._renditionWidth = b.getWidth();
        var g = function (k) {
            _fwsdk.log("OverlayAdRenderer.stop(", k, ")", a);
            var j = document.getElementById("fw_ad_container_div");
            if (j) {
                if (k) try {
                    _fwsdk.log("OverlayAdRenderer resuming main video..");
                    j.parentNode.getElementsByTagName("video")[0].play()
                } catch (n) {
                    _fwsdk.log("OverlayAdRenderer.stop(): something went wrong when trying to resume main video.")
                } else _fwsdk.log("remove ad without resuming main video.");
                a.processEvent({
                    name: _fwsdk.RENDERER_STATE_COMPLETING
                });
                j.parentNode.removeChild(j);
                a.processEvent({
                    name: _fwsdk.RENDERER_STATE_COMPLETED
                })
            }
        };
        c = c.getTimePositionClass();
        var h = a.getParameter("renderer.overlay.mode") || this._layoutMode(c),
            f = c != _fwsdk.TIME_POSITION_CLASS_OVERLAY;
        _fwsdk.log("OverlayAdRenderer mode:", h);
        if (h == "overlay") {
            if (this._renditionWidth <= 0 || this._renditionWidth > this._videoBaseWidth) this._renditionWidth = this._videoBaseWidth;
            this._renditionHeight = b.getHeight();
            if (this._renditionHeight <= 0) this._renditionHeight = 0.25 * this._videoBaseHeight;
            else if (this._renditionHeight > this._videoBaseHeight) this._renditionHeight = this._videoBaseHeight;
            c = document.createElement("div");
            c.id = "fw_ad_container_div";
            d.appendChild(c);
            d.style.position = "relative";
            this._layoutOverlayNode(a, c, d, b);
            this._injectAd(c, e);
            setTimeout(g, 1E3 * b.getDuration())
        } else {
            this._videoBaseWidth = a.getParameter("renderer.overlay.baseWidth") || this._videoBaseWidth;
            this._videoBaseHeight = a.getParameter("renderer.overlay.baseHeight") || this._videoBaseHeight;
            this._renditionWidth = b.getWidth();
            if (this._renditionWidth <= 0 || this._renditionWidth > this._videoBaseWidth) this._renditionWidth = this._videoBaseWidth;
            this._renditionHeight = b.getHeight();
            if (this._renditionHeight <= 0 || this._renditionHeight > this._videoBaseHeight) this._renditionHeight = this._videoBaseHeight;
            f && d.getElementsByTagName("video")[0].pause();
            d.style.position = "relative";
            d = this._createBaseDiv(a, d);
            this._injectAd(this._createDisplayDiv(a, d), e);
            if ((a.getParameter("renderer.overlay.supportDuration") || "true") == "true") setTimeout(g, 1E3 * b.getDuration(), f);
            else {
                d = a.getParameter("renderer.overlay.closeCallback") || "closeFWAd";
                window[d] = function () {
                    g(f)
                }
            }
        }
    },
    _createBaseDiv: function (a, b) {
        var c = document.createElement("div");
        c.id = "fw_ad_container_div";
        b.appendChild(c);
        b = a.getParameter("renderer.overlay.zIndex") || "100000";
        var d = a.getParameter("renderer.overlay.baseX") || "0px",
            e = a.getParameter("renderer.overlay.baseY") || "0px",
            g = a.getParameter("renderer.overlay.backgroundColor") || "0x000000";
        if (g) g = g.toLowerCase().split("0x").join("#");
        _fwsdk.log(g, a.getParameter("renderer.overlay.backgroundColor"));
        c.style.position = "absolute";
        c.style.overflow = "hidden";
        c.style.zIndex = b;
        c.style.left = d;
        c.style.top = e;
        c.style.width = this._videoBaseWidth;
        c.style.height = this._videoBaseHeight;
        c.style.backgroundColor = g;
        return c
    },
    _createDisplayDiv: function (a, b) {
        var c = document.createElement("div");
        b.appendChild(c);
        _fwsdk.log(b.style.pixelWidth, this._renditionWidth, b.style.pixelHeight, this._renditionHeight);
        b = a.getParameter("renderer.overlay.adMarginLeft") || 0.5 * (this._videoBaseWidth - this._renditionWidth);
        a = a.getParameter("renderer.overlay.adMarginTop") || 0.5 * (this._videoBaseHeight - this._renditionHeight);
        c.style.position = "absolute";
        c.style.width = this._renditionWidth;
        c.style.height = this._renditionHeight;
        c.style.left = b;
        c.style.top = a;
        return c
    },
    _injectAd: function (a, b) {
        if (_fwsdk.Util.isBlank(b.getUrl())) _fwsdk.Util.buildNode(a, b.getContent());
        else {
            var c = document.createElement("iframe");
            c.frameBorder = 0;
            c.scrolling = "no";
            c.src = b.getUrl();
            c.width = this._renditionWidth;
            c.height = this._renditionHeight;
            a.appendChild(c)
        }
    },
    info: function () {
        return {
            INFO_KEY_MODULE_TYPE: _fwsdk.MODULE_TYPE_RENDERER
        }
    },
    _layoutMode: function (a) {
        _fwsdk.log("OverlayAdRenderer._layoutMode", a);
        return a == _fwsdk.TIME_POSITION_CLASS_OVERLAY ? "overlay" : "div"
    },
    _layoutOverlayNode: function (a, b) {
        b.style.width = this._renditionWidth;
        b.style.height = this._renditionHeight;
        b.style.position = "absolute";
        b.style.overflow = "hidden";
        a = a.getParameter("renderer.overlay.primaryAnchor") || "bc";
        if (a == "tl") b.style.left = b.style.top =
        0;
        else if (a == "tr") b.style.right = b.style.top = 0;
        else if (a == "bl") b.style.left = b.style.bottom = 0;
        else if (a == "br") b.style.right = b.style.bottom = 0;
        else if (a == "tc") {
            b.style.left = (this._videoBaseWidth - this._renditionWidth) * 0.5;
            b.style.top = 0
        } else if (a == "lm") {
            b.style.top = (this._videoBaseHeight - this._renditionHeight) * 0.5;
            b.style.left = 0
        } else if (a == "rm") {
            b.style.top = (this._videoBaseHeight - this._renditionHeight) * 0.5;
            b.style.right = 0
        } else {
            b.style.left = (this._videoBaseWidth - this._renditionWidth) * 0.5;
            b.style.bottom =
            0
        }
    }
};
_fwsdk.OverlayAdRenderer.prototype.constructor = _fwsdk.OverlayAdRenderer;
_fwsdk.PageSlotScanner = function () {
    this._knownSlots = [];
    this._slots = {}
};
_fwsdk.PageSlotScanner.prototype = {
    isSlotDuplicate: function (a) {
        for (var b = 0; b < this._knownSlots.length; ++b) if (this._knownSlots[b] == a) return true;
        return false
    },
    findPageSlotByScope: function (a) {
        var b = a.document,
            c, d = /(^|\s)_fwph(\s|$)/,
            e = b.getElementsByTagName("span");
        if (!a._fw_admanager) a._fw_admanager = {};
        a._fw_admanager.pageScanState = true;
        for (a = 0; a < e.length; ++a) {
            var g;
            c = e[a];
            if (d.test(c.className)) {
                c = c.getAttribute("id");
                if ((g = b.getElementById("_fw_input_" + c)) && !this.isSlotDuplicate(c)) if (g = g.getAttribute("value")) {
                    if (g.charAt(g.length - 1) != ";") g += ";";
                    g = g.split(";");
                    var h = g[g.length - 2];
                    g = false;
                    if (h.search("lo=i") != -1) g = true;
                    var f = false;
                    if (h.search("prct=") != -1) f = true;
                    if (h.search("flag=") < 0) h += "&flag=";
                    if (h.search("ptgt=") < 0) h = "ptgt=s&" + h;
                    var k = [];
                    h = h.split("&");
                    for (var j, n = 0; n < h.length; ++n) {
                        j = h[n].split("=");
                        if (j.length == 2) {
                            j[1] = decodeURIComponent(j[1]);
                            if (j[0] == "ssct") if (f) continue;
                            else {
                                f = true;
                                j[0] = "prct"
                            }
                            if (j[0] == "flag") {
                                if (j[1].search(/[-\+]cmpn/) == -1) j[1] += "+cmpn";
                                if (j[1].charAt(0) != "+" && j[1].charAt(0) != "-") j[1] = "+" + j[1];
                                if (g && j[1].search("-init") == -1) j[1] += "-init";
                                if (j[1].search("-nrpl") != -1) j[1] = j[1].replace("-nrpl", "+cmpn")
                            }
                            j = encodeURIComponent(j[0]) + "=" + encodeURIComponent(j[1]);
                            k.push(j)
                        }
                    }
                    f || k.push("prct=" + encodeURIComponent("text/html_lit_js_wc_nw"));
                    this._slots[c] = k.join("&") + ";";
                    this._knownSlots.push(c)
                }
            }
        }
    },
    scanPageSlots: function () {
        for (var a = 0; a < window.frames.length; ++a) try {
            this.findPageSlotByScope(window.frames[a])
        } catch (b) {}
        try {
            this.findPageSlotByScope(parent)
        } catch (c) {}
        try {
            this.findPageSlotByScope(window)
        } catch (d) {}
    },
    slotsToTypeBStr: function () {
        var a = "";
        for (slotId in this._slots) if (!Object[slotId]) {
            var b = this._slots[slotId];
            if (b.search("slid=") == -1) b = "slid=" + encodeURIComponent(slotId) + "&" + b;
            a += b;
            if (a.charAt(a.length - 1) != ";") a += ";"
        }
        if (a) a = a.substring(0, a.length - 1);
        return a
    }
};
_fwsdk.PageSlotScanner.prototype.constructor = _fwsdk.PageSlotScanner;
_fwsdk.RendererController = function (a, b) {
    this._context = a;
    this._adInstance = b;
    this._renderer = null;
    this._rendererState = _fwsdk.RendererInitState.instance
};
_fwsdk.RendererController.prototype = {};
_fwsdk.RendererController.prototype.constructor = _fwsdk.RendererController;
_fwsdk.Util.mixin(_fwsdk.RendererController.prototype, {
    getAdInstance: function () {
        return this._adInstance
    },
    processEvent: function (a) {
        var b = a.name;
        if (b == _fwsdk.RENDERER_STATE_STARTED) this._rendererState.notifyStarted(this);
        else if (b == _fwsdk.RENDERER_STATE_COMPLETING) this._rendererState.complete(this);
        else if (b == _fwsdk.RENDERER_STATE_COMPLETED) this._rendererState.notifyCompleted(this);
        else if (b == _fwsdk.RENDERER_STATE_FAILED) {
            this._adInstance.getSlot()._scheduledAdInstance = null;
            this._adInstance.getEventCallback(_fwsdk.EVENT_ERROR, _fwsdk.EVENT_TYPE_ERROR).process(a.info);
            this._rendererState.fail(this)
        } else {
            var c = this._inferEventType(b);
            if (c) {
                if (c == _fwsdk.EVENT_TYPE_CLICK && a.info && a.info[_fwsdk.INFO_KEY_CUSTOM_EVENT_NAME]) b = a.info[_fwsdk.INFO_KEY_CUSTOM_EVENT_NAME];
                (b = this._adInstance.getEventCallback(b, c)) && b.process(a.info)
            }
        }
    },
    setCapability: function (a, b) {
        this._adInstance.setMetr(a, b)
    },
    getVersion: function () {
        return this._context._adManager.getVersion()
    },
    getParameter: function (a) {
        if (!a) return null;
        if (this._context._overrideLevelParameterDictionary.hasOwnProperty(a)) return this._context._overrideLevelParameterDictionary[a];
        if (this._adInstance._primaryCreativeRendition && this._adInstance._primaryCreativeRendition._parameters.hasOwnProperty(a)) return this._adInstance._primaryCreativeRendition._parameters[a];
        var b = this._context._adResponse.getCreative(this._adInstance._adId, this._adInstance._creativeId);
        if (b && b._parameters.hasOwnProperty(a)) return b._parameters[a];
        if (this._adInstance.getSlot()._parameters.hasOwnProperty(a)) return this._adInstance.getSlot()._parameters[a];
        if (this._context._globalLevelParameterDictionary.hasOwnProperty(a)) return this._context._globalLevelParameterDictionary[a];
        if (this._context._adResponse._profileParameters.hasOwnProperty(a)) return this._context._adResponse._profileParameters[a];
        return null
    },
    scheduleAdInstances: function (a) {
        a = a || [];
        var b = [];
        if (a.length === 0) return b;
        var c = a[0],
            d = c._currentAdInstance;
        c = c.scheduleAdInstance();
        b.push(c);
        var e = 0;
        for (d = d._companionAdInstances; e < d.length; e++) for (var g = d[e], h = 1; h < a.length; h++) if (a[h] == g._slot) {
            g = g.schedule();
            c._companionAdInstances.push(g);
            b.push(g);
            break
        }
        return b
    },
    playable: function () {
        return this._rendererState == _fwsdk.RendererInitState.instance
    },
    reset: function () {
        this._rendererState = _fwsdk.RendererInitState.instance
    },
    play: function () {
        var a = _fwsdk.Util.getObject(this._matchRendererClassName(this._adInstance._primaryCreativeRendition));
        if (a) this._renderer = new a;
        this._renderer ? this._rendererState.start(this) : this.processEvent({
            name: _fwsdk.RENDERER_STATE_FAILED,
            info: {
                errorCode: _fwsdk.ERROR_NO_RENDERER
            }
        })
    },
    _matchRendererClassName: function (a) {
        var b = a.getContentType();
        a = a.getWrapperType();
        if (_fwsdk.Util.isBlank(b) && _fwsdk.Util.isBlank(a)) return null;
        var c = this._context._rendererManifest["*"];
        c || (c = this._context._rendererManifest[a]);
        c || (c = this._context._rendererManifest[b]);
        if (c) return c;
        a = this._adInstance.getSlot();
        c = a.getType();
        if (b == "null/null") return "_fwsdk.NullAdRenderer";
        else if (c == _fwsdk.SLOT_TYPE_SITESECTION_NONTEMPORAL || c == _fwsdk.SLOT_TYPE_VIDEOPLAYER_NONTEMPORAL) return "_fwsdk.DisplayAdRenderer";
        else if (c == _fwsdk.SLOT_TYPE_TEMPORAL) return a.getTimePositionClass() == _fwsdk.TIME_POSITION_CLASS_OVERLAY ? "_fwsdk.OverlayAdRenderer" : b.indexOf("text/html") == 0 || b.indexOf("image/") == 0 ? "_fwsdk.OverlayAdRenderer" : "_fwsdk.VideoAdRenderer";
        return null
    },
    _inferEventType: function (a) {
        if (a == _fwsdk.EVENT_ERROR) return _fwsdk.EVENT_TYPE_ERROR;
        else if (a == _fwsdk.EVENT_AD_CLICK) return _fwsdk.EVENT_TYPE_CLICK;
        else if (a == _fwsdk.EVENT_AD_IMPRESSION || a == _fwsdk.EVENT_AD_FIRST_QUARTILE || a == _fwsdk.EVENT_AD_MIDPOINT || a == _fwsdk.EVENT_AD_THIRD_QUARTILE || a == _fwsdk.EVENT_AD_COMPLETE || a == _fwsdk.EVENT_RESELLER_NO_AD) return _fwsdk.EVENT_TYPE_IMPRESSION;
        else if (a == _fwsdk.EVENT_AD_PAUSE || a == _fwsdk.EVENT_AD_RESUME || a == _fwsdk.EVENT_AD_REWIND || a == _fwsdk.EVENT_AD_MUTE || a == _fwsdk.EVENT_AD_UNMUTE || a == _fwsdk.EVENT_AD_COLLAPSE || a == _fwsdk.EVENT_AD_EXPAND || a == _fwsdk.EVENT_AD_MINIMIZE || a == _fwsdk.EVENT_AD_CLOSE || a == _fwsdk.EVENT_AD_ACCEPT_INVITATION) return _fwsdk.EVENT_TYPE_STANDARD;
        return null
    }
});
_fwsdk.RenditionSelector = function (a, b, c, d) {
    this._targetByterate = a;
    this._arWeight = b;
    this._pxWeight = c;
    this._conversionFactor = d
};
_fwsdk.RenditionSelector.prototype = {
    getBestFitRendition: function (a, b, c) {
        a = this.filterRenditionsByBitrate(a, this._targetByterate);
        if (a.length > 0) {
            for (var d = a[0], e = 1; e < a.length; ++e) {
                var g = this.compareVisualMetrics(d, a[e], b, c);
                if (g) d = g
            }
            return d
        }
        return null
    },
    filterRenditionsByBitrate: function (a, b) {
        for (var c = [], d, e = 0; e < a.length; ++e) if (this.validateCreativeRendition(a[e])) if (this.getBitrate(a[e]) <= b) c.push(a[e]);
        else if (!d || this.getBitrate(a[e]) < this.getBitrate(d)) d = a[e];
        c.length === 0 && d && c.push(d);
        var g =
        this;
        c.sort(function (h, f) {
            return g.sortOnBitrate(h, f)
        });
        return c
    },
    compareVisualMetrics: function (a, b, c, d) {
        var e = this.calculateVisualRatios(a._width, a._height, c, d);
        d = this.calculateVisualRatios(b._width, b._height, c, d);
        if (!e && d) return b;
        if (e && !d) return a;
        if (!e && !d) return null;
        c = this._conversionFactor * this._arWeight * Math.log(e.arRatio);
        var g = this._pxWeight * Math.log(e.pixelation);
        e = this._conversionFactor * this._arWeight * Math.log(d.arRatio);
        d = this._pxWeight * Math.log(d.pixelation);
        c = this.findDistance(c, g, 0, 0);
        e = this.findDistance(e, d, 0, 0);
        if (c == e) return null;
        return c < e ? a : b
    },
    calculateVisualRatios: function (a, b, c, d) {
        if (a > 0 && b > 0 && c > 0 && d > 0) {
            var e = a / b,
                g = c / d;
            a = a * b;
            if (e > g) {
                c = c;
                d = c / e
            } else {
                d = d;
                c = d * e
            }
            return {
                arRatio: e / g,
                pixelation: a / (c * d)
            }
        }
        return null
    },
    findDistance: function (a, b, c, d) {
        return isNaN(a) || isNaN(c) || isNaN(b) || isNaN(d) ? NaN : Math.sqrt(Math.pow(c - a, 2) + Math.pow(d - b, 2))
    },
    validateCreativeRendition: function (a) {
        if (!a) return false;
        a = a._primaryCreativeRenditionAsset;
        if (!a) return false;
        if (_fwsdk.Util.isBlank(a._url) && _fwsdk.Util.isBlank(a._content)) return false;
        return true
    },
    validateProtocol: function (a) {
        for (var b = ["http", "https", "rtmp"], c = 0; c < b.length; ++c) if (a.toLowerCase().indexOf(b[c] + "://") === 0) return true;
        return false
    },
    sortOnBitrate: function (a, b) {
        a = this.getBitrate(a);
        b = this.getBitrate(b);
        return a > b ? -1 : a < b ? 1 : 0
    },
    getBitrate: function (a) {
        var b = a.getDuration();
        return (a = a._primaryCreativeRenditionAsset._bytes) && b && !isNaN(a) && !isNaN(b) && a > 0 && b > 0 ? a * 8 / 1E3 / b : -1
    }
};
_fwsdk.RenditionSelector.prototype.constructor = _fwsdk.RenditionSelector;
_fwsdk.Slot = function (a) {
    this._context = a;
    this._customId = "";
    this._scheduledAdInstance = this._currentAdInstance = this._slotProfile = this._type = null;
    this._adInstances = [];
    this._eventCallbacks = [];
    this._parameters = {};
    this._onSlotEnded = this._last = this._init = null;
    this._state = _fwsdk.MediaInitState.instance
};
_fwsdk.Slot.prototype = {};
_fwsdk.Slot.prototype.constructor = _fwsdk.Slot;
_fwsdk.Util.mixin(_fwsdk.Slot.prototype, {
    setParameter: function (a, b) {
        if (b === null) delete this._parameters[a];
        else this._parameters[a] = b
    },
    getCustomId: function () {
        return this._customId
    },
    getType: function () {
        return this._type
    },
    getTimePosition: function () {
        return this._timePosition
    },
    getTimePositionClass: function () {
        return this._timePositionClass ? this._timePositionClass.toUpperCase() : null
    },
    getWidth: function () {
        return this._width
    },
    getHeight: function () {
        return this._height
    },
    getBase: function () {
        if (!this._baseId) return null;
        return document.getElementById(this._baseId)
    },
    dispose: function () {
        this._onTimeUpdate && this._contentVideo.removeEventListener("timeupdate", this._onTimeUpdate, false)
    },
    parse: function (a) {
        if (a) {
            this._customId = a.customId;
            this._timePosition = a.timePosition * 1;
            this._timePositionClass = a.timePositionClass;
            this._adUnit = a.adUnit;
            for (var b = 0, c = a.eventCallbacks || []; b < c.length; b++) {
                var d = c[b],
                    e = _fwsdk.EventCallback.newEventCallback(this._context, d.name, d.type);
                if (e) {
                    e._slot = this;
                    e.parse(d);
                    this._eventCallbacks.push(e)
                }
            }
            b =
            0;
            for (c = a.selectedAds || []; b < c.length; b++) {
                d = c[b];
                a = new _fwsdk.AdInstance(this._context);
                a._slot = this;
                a.parse(d);
                this._adInstances.push(a)
            }
        }
    },
    copy: function () {
        var a = new _fwsdk.Slot;
        a._context = this._context;
        a._type = this._type;
        a._width = this._width;
        a._height = this._height;
        a._customId = this._customId;
        a._adUnit = this._adUnit;
        a._slotProfile = this._slotProfile;
        a._timePositionClass = this._timePositionClass;
        a._acceptPrimaryContentType = this._acceptPrimaryContentType;
        a._acceptContentType = this._acceptContentType;
        return a
    },
    schduleAdInstance: function () {
        return this._scheduledAdInstance = this._currentAdInstance.schedule()
    },
    play: function (a) {
        this.getTimePositionClass() == _fwsdk.TIME_POSITION_CLASS_PREROLL ? this._context._fillVideoPool(this.getTimePositionClass(), _fwsdk.Util.bind(this, this._play, a)) : this._play(a)
    },
    _play: function (a) {
        this._onSlotEnded = this._onSlotEnded || a;
        this._state.play(this)
    },
    onStartPlaying: function () {
        this._init = "1";
        this._onStartPlaying()
    },
    onStartReplaying: function () {
        this._init = "2";
        this._onStartPlaying()
    },
    onCompletePlaying: function () {
        this._onCompletePlaying()
    },
    onCompleteReplaying: function () {
        this._onCompletePlaying()
    },
    playNextAdInstance: function () {
        this._playNextAdInstance() || this._state.complete(this)
    },
    scheduleAdInstance: function () {
        return this._scheduledAdInstance = this._currentAdInstance.schedule()
    },
    _onStartPlaying: function () {
        if (this._type == _fwsdk.SLOT_TYPE_TEMPORAL) {
            var a = _fwsdk.EventCallback.getEventCallback(this._eventCallbacks, _fwsdk.EVENT_SLOT_IMPRESSION, _fwsdk.EVENT_TYPE_IMPRESSION);
            a && a.process()
        }
        for (a =
        0; a < this._adInstances.length; a++) this._adInstances[a]._rendererController.reset();
        this.playNextAdInstance()
    },
    _onCompletePlaying: function () {
        var a = this._onSlotEnded;
        this._onSlotEnded = null;
        a && a();
        this._context.dispatchEvent(_fwsdk.EVENT_SLOT_ENDED, {
            slot: this
        })
    },
    _playNextAdInstance: function () {
        if (this._state != _fwsdk.MediaPlayingState.instance && this._state != _fwsdk.MediaReplayingState.instance) return false;
        this._commitScheduledAdInstance();
        this._currentAdInstance = this._nextPlayableAdInstance();
        if (!this._currentAdInstance) return false;
        this._currentAdInstance._rendererController.play();
        return true
    },
    _commitScheduledAdInstance: function () {
        if (this._scheduledAdInstance) for (var a = 0; a < this._adInstances.length; a++) if (this._adInstances[a] == this._currentAdInstance) {
            this._adInstances.splice(a, 1, this._scheduledAdInstance);
            this._scheduledAdInstance = null
        }
    },
    _nextPlayableAdInstance: function () {
        for (var a = 0; a < this._adInstances.length; a++) if (this._adInstances[a]._rendererController.playable()) return this._adInstances[a];
        return null
    },
    toString: function () {
        return "[Slot " + this._customId + "]"
    }
});
_fwsdk.Timer = function () {
    this._lastTickDate = new Date
};
_fwsdk.Timer.prototype = {};
_fwsdk.Timer.prototype.constructor = _fwsdk.Timer;
_fwsdk.Util.mixin(_fwsdk.Timer.prototype, {
    tick: function () {
        var a = new Date,
            b = Math.round((a.getTime() - this._lastTickDate.getTime()) / 1E3);
        this._lastTickDate = a;
        return b
    },
    pause: function () {},
    resume: function () {}
});
_fwsdk.Url = function (a) {
    this._session = this._base = "";
    this._parameters = new _fwsdk.Hash;
    this.setString(a)
};
_fwsdk.Url.prototype = {};
_fwsdk.Url.prototype.constructor = _fwsdk.Url;
_fwsdk.Util.mixin(_fwsdk.Url.prototype, {
    setString: function (a) {
        if (!(this._string == a || !a)) {
            this._string = a;
            a = a.split("?");
            this._base = a[0];
            this._parameters = new _fwsdk.Hash;
            if (a[1]) {
                var b = a[1].indexOf(";");
                if (b > 0 && a[1].indexOf("session=") === 0) {
                    this._session = a[1].substring(0, b + 1);
                    a = a[1].substring(b + 1)
                } else a = a[1];
                a = a.split("&");
                for (var c = 0; c < a.length; c++) {
                    var d = a[c];
                    b = d.indexOf("=");
                    if (!(b < 0)) {
                        var e = decodeURIComponent(d.substring(0, b));
                        b = decodeURIComponent(d.substring(b + 1));
                        this._parameters.setKeyValue(e, b)
                    }
                }
            }
        }
    },
    setParameter: function (a, b) {
        this._parameters.setKeyValue(a, b, 0);
        this._string = null
    },
    getParameter: function (a) {
        return this._parameters.getValue(a)
    },
    toString: function () {
        if (this._string) return this._string;
        this._parameters.move("cr", -1);
        for (var a = this._parameters._keys, b = [], c = 0; c < a.length; c++) {
            var d = a[c],
                e = this._parameters.getValue(d);
            b.push(encodeURIComponent(d) + "=" + encodeURIComponent(e))
        }
        return this._string = this._base + "?" + this._session + b.join("&")
    }
});
_fwsdk.VideoAdRenderer = function () {};
_fwsdk.VideoAdRenderer.prototype = {
    start: function (a) {
        _fwsdk.log("VideoAdRenderer start() at iOS " + _fwsdk.Util.iOSVersion() + " device");
        var b = a.getAdInstance(),
            c = b.getSlot(),
            d = c.getBase().getElementsByTagName("video")[0];
        d.pause();
        var e = d.style.pixelWidth ? d.style.pixelWidth : d.offsetWidth,
            g = d.style.pixelHeight ? d.style.pixelHeight : d.offsetHeight;
        d.style.display = "none";
        var h = b.getAllCreativeRenditions();
        h = (new _fwsdk.RenditionSelector(1E3, 1, 1, 0.2)).getBestFitRendition(h, e, g);
        b.setPrimaryCreativeRendition(h);
        h = h ? h.getPrimaryCreativeRenditionAsset() : null;
        if (!h || !h.getUrl()) a.processEvent({
            name: _fwsdk.RENDERER_STATE_FAILED,
            info: {
                errorModule: "VideoAdRenderer",
                errorCode: _fwsdk.ERROR_NULL_ASSET
            }
        });
        else {
            a.setCapability(_fwsdk.EVENT_AD_QUARTILE, _fwsdk.CAPABILITY_STATUS_ON);
            _fwsdk.Util.isIPad() || a.setCapability(_fwsdk.EVENT_AD_CLICK, _fwsdk.CAPABILITY_STATUS_OFF);
            var f = _fwsdk._videoPool && _fwsdk._videoPool.shift() || document.createElement("video");
            f.width = e;
            f.height = g;
            f.style.position = d.style.position;
            f.style.left =
            d.style.left;
            f.style.right = d.style.right;
            f.style.top = d.style.top;
            f.style.bottom = d.style.bottom;
            f.style.background = "black";
            f.controls = "controls";
            d.parentNode.appendChild(f);
            var k = this,
                j = null,
                n = function (l) {
                    _fwsdk.log("adVideo event " + l.type);
                    a.processEvent({
                        name: _fwsdk.EVENT_AD_CLICK
                    })
                },
                r = function (l) {
                    _fwsdk.log("adVideo event " + l.type);
                    f.controls = true
                },
                s = function (l) {
                    _fwsdk.log("adVideo event " + l.type);
                    f.controls = false
                },
                q = function (l) {
                    _fwsdk.log("adVideo event " + l.type);
                    f.removeEventListener("timeupdate", q, false);
                    if (j) {
                        clearTimeout(j);
                        j = null
                    }
                    k._quartileTimerId = setInterval(function () {
                        var m = f.currentTime,
                            p = f.duration;
                        if (!(typeof m !== "number" || typeof p !== "number")) {
                            m >= p * 0.25 && a.processEvent({
                                name: _fwsdk.EVENT_AD_FIRST_QUARTILE
                            });
                            m >= p * 0.5 && a.processEvent({
                                name: _fwsdk.EVENT_AD_MIDPOINT
                            });
                            if (m >= p * 0.75) {
                                clearInterval(k._quartileTimerId);
                                k._quartileTimerId = null;
                                a.processEvent({
                                    name: _fwsdk.EVENT_AD_THIRD_QUARTILE
                                })
                            }
                        }
                    }, 1E3);
                    a.processEvent({
                        name: _fwsdk.RENDERER_STATE_STARTED
                    })
                },
                o = function (l) {
                    var m = null;
                    if (l) _fwsdk.log("ad video event " + l.type);
                    else m = "timeout";
                    if (j) {
                        clearTimeout(j);
                        j = null
                    }
                    f.removeEventListener("touchend", n, false);
                    f.removeEventListener("ended", o, false);
                    f.removeEventListener("error", o, false);
                    f.removeEventListener("pause", r, false);
                    f.removeEventListener("playing", s, false);
                    f.removeEventListener("timeupdate", q, false);
                    if (f.error) m = "error:" + f.error + ",code:" + f.error.code;
                    a.processEvent({
                        name: _fwsdk.RENDERER_STATE_COMPLETING
                    });
                    f.parentNode.removeChild(f);
                    d.style.display = "";
                    (function () {
                        delete f._fw_videoAdPlaying;
                        if (k._quartileTimerId) {
                            clearInterval(k._quartileTimerId);
                            k._quartileTimerId = null
                        }
                        if (m) a.processEvent({
                            name: _fwsdk.RENDERER_STATE_FAILED,
                            info: {
                                errorModule: "VideoAdRenderer",
                                errorInfo: m
                            }
                        });
                        else {
                            a.processEvent({
                                name: _fwsdk.EVENT_AD_FIRST_QUARTILE
                            });
                            a.processEvent({
                                name: _fwsdk.EVENT_AD_MIDPOINT
                            });
                            a.processEvent({
                                name: _fwsdk.EVENT_AD_THIRD_QUARTILE
                            });
                            a.processEvent({
                                name: _fwsdk.EVENT_AD_COMPLETE
                            });
                            a.processEvent({
                                name: _fwsdk.RENDERER_STATE_COMPLETED
                            })
                        }
                    })();
                    c.getTimePositionClass() == _fwsdk.TIME_POSITION_CLASS_MIDROLL && b == c._adInstances[c._adInstances.length - 1] && d.play()
                };
            f.addEventListener("touchend", n, false);
            f.addEventListener("ended", o, false);
            f.addEventListener("error", o, false);
            f.addEventListener("pause", r, false);
            f.addEventListener("playing", s, false);
            f.addEventListener("timeupdate", q, false);
            f.src = h.getUrl();
            _fwsdk.log("play video ad " + f.src);
            f.load();
            if (f._fw_fromVideoPool || _fwsdk.Util.iOSVersion() === 0 || _fwsdk.Util.iOSVersion() >= 3.2 && _fwsdk.Util.iOSVersion() < 4.2) j = setTimeout(o, 3E3);
            f.play()
        }
    },
    info: function () {
        return {
            moduleType: _fwsdk.MODULE_TYPE_RENDERER
        }
    }
};
_fwsdk.VideoAdRenderer.prototype.constructor = _fwsdk.VideoAdRenderer; /*   paste in your code and press Beautify button   */
if ('this_is' == /an_example/) {
    do_something();
} else {
    var a = b ? (c % d) : e[f];
}