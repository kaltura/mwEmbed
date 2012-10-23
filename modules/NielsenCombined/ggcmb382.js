var cE = '3.80';
var dm = {};
var cL = '';
var cP = "";
var cR = "http://dz.glanceguide.com/errl.php";
var cQ = 60000;
var ggPageLoaded = false;
var jsuserid;
var _ggeom = 1;
var au = 2;
var O = false;
var _canDetectBrowser = true;
var _bStr = '';
var _bLoc = '';

function gg() {
    var ggJsMet = null;
    var ggLoaded = false;
    var cN = [];
    var I;
    var that = this;
    this.ggInitialize = function (cB, uid, oldFlashDetect, detectBrowser) {
        var name;
        var fpar = "";
        dm = cB;
        _canDetectBrowser = detectBrowser != null ? detectBrowser : _canDetectBrowser;
        if (_canDetectBrowser) that.detectBrowser();
        for (name in dm) fpar += "<" + name + ">" + dm[name] + "</" + name + ">";
        I = "genjsplayer";
        ggJsMet = new Metrics();
        ggJsMet.init(I, uid, cL, fpar);
    };
    this.detectBrowser = function () {
        _bStr = navigator.userAgent;
        _bLoc = _bStr.indexOf("Firefox");
        if (_bStr != null && _bLoc >= 0) {
            bJ = true;
            bVer = _bStr.substring(_bLoc + 8, _bLoc + 9);
            if (Number(bVer) >= 3) O = true;
        }
        _bLoc = _bStr.indexOf("MSIE");
        if (_bStr != null && _bLoc >= 0) {
            bVer = _bStr.substring(_bLoc + 5, _bLoc + 6);
            if (Number(bVer) >= 6) O = true;
        }
    };
    this.ggPM = function (eventType, d, f, j, k) {
        eventType = String(eventType);
        d = String(d);
        f = String(f);
        j = String(j);
        k = String(k);
        try {
            if (ggJsMet != null) {
                ggJsMet.C(eventType, new Date().getTime(), d, f, j, k);
            } else {
                cN.push(eventType);
                cN.push(new Date().getTime());
                cN.push(d);
                cN.push(f);
                cN.push(j);
                cN.push(k);
            }
        } catch (av) {}
    };
    this.ggJsLoaded = function () {
        if (ggJsMet == null) return;
        for (var i = 0; i < cN.length; i += 6) ggJsMet.C(cN[i], cN[i + 1], cN[i + 2], cN[i + 3], cN[i + 4], cN[i + 5]);
        cN = [];
    }
};

function Metrics() {
    var _address;
    var _version = cE;
    var cd;
    var ca;
    var _currentMsgSize = 0;
    var aE;
    var aZ = false;
    var az = false;
    var at = 0;
    var bb = 0;
    var aA = 5;
    var cK = 0;
    var cr = "";
    var cl = 1300;
    var cJ, cu, cI;
    var ci = 0,
        aP, aU, aT, aS;
    var _ggtrackid;
    var _ggplayername;
    var dr = 0;
    var iaguc = "";
    var iagua = "";
    var scxpc = "";
    var scxpa = "";
    var cZ = "";
    var _pageUrl = "";
    var intCount = 0;
    var aY = false;
    var bG = 10;
    var bi = "0";
    var bV = 0;
    var o = 0;
    var aX;
    var aW;
    var cV = new Array();
    var playState = 0;
    var videoType;
    var ai = -1;
    var ae = 0;
    var am = 0;
    var ab = 0;
    var aC = 0;
    var B = 0;
    var L = 0;
    var cU = new Object;
    var aQ = 2;
    cU.CS = new Array(2);
    cU.PA = new Array(2);
    cU.PL = new Array(2);
    cU.SA = new Array(2);
    cU.FA = new Array(2);
    cU.SI = new Array(2);
    cU.SR = new Array(2);
    cU.SK = new Array(2);
    cU.CI = new Array(2);
    cU.DI = new Array(2);
    cU.ER = new Array(2);
    cU.SV = new Array(2);
    cU.SH = new Array(2);
    cU.PB = new Array(2);
    cU.II = new Array(2);
    cU.VL = new Array(2);
    cU.PM = new Array(2);
    cU.FP = new Array(2);
    cU.MI = new Array(2);
    cU.Title = new Array(2);
    cU.SS = new Array(2);
    var _jmet = this;
    this.bT = function () {
        return cU;
    };
    this.getgp = function () {
        return cV;
    };
    this.bL = function () {
        return _pageUrl;
    };
    this.dk = function () {
        return o;
    };
    this.getlfunctionType = function () {
        return ci;
    };

    function bf(i) {
        cU["CS"][i] = 0;
        cU["PA"][i] = 0;
        cU["PL"][i] = 0;
        cU["SA"][i] = 0;
        cU["FA"][i] = 0;
        cU["FP"][i] = 0;
        cU["SI"][i] = 0;
        cU["MI"][i] = 0;
        cU["SR"][i] = 0;
        cU["SK"][i] = 0;
        cU["CI"][i] = 0;
        cU["DI"][i] = 0;
        cU["ER"][i] = 0;
        cU["SV"][i] = 0;
        cU["SH"][i] = 0;
        cU["PB"][i] = 0;
        cU["II"][i] = 0;
        cU["VL"][i] = 0;
        cU["PM"][i] = 0;
        cU["SS"][i] = 0;
    };

    function numorder(a, b) {
        var a1 = Number(a);
        var b1 = Number(b);
        if (a1 < b1) return -1;
        else if (a1 == b1) return 0;
        return 1;
    };

    function ba() {
        bX = cr.split(",");
        var i = 0;
        for (i = 0; i < bX.length; i++) if (isNaN(bX[i])) {
            var x = bX[i].split("%");
            if (isNaN(x[0])) bX[i] = 0;
            else bX[i] = Number(x[0]) * cU["VL"][bV] / 100;
        }
        bX.sort(numorder);
        i = bX.length;
        while (--i > 0) {
            while (bX[i] == bX[i - 1]) {
                bX.splice(i - 1, 1);
            }
        }
        if (bX[0] == 0) bX.splice(0, 1);
    };

    function M(name, cora) {
        var st;
        if (cora == 1) st = aW;
        else st = aX;
        var r = -1;
        var K = -1;
        r = st.indexOf("<" + name + ">");
        if (r >= 0) {
            r += name.length + 2;
            K = st.indexOf("</" + name + ">", r);
        }
        if (r >= 0 && K > r) return st.substring(r, K);
        return null;
    };

    function getut(A) {
        var cX;
        if (au == 1) cX == "";
        else {
            cX = "";
            if (cV.prod.indexOf("iag") >= 0) {
                if (o) cX = iagua;
                else cX = iaguc;
                if (A == 2) cX += "&pr=iag.cp,cep";
                else if (A == 1) cX = "";
                else cX += "&pr=iag.cp,soc";
            }
            if (cV.prod.indexOf("vc") >= 0) {
                if (A == 1) cX = "&ig=1";
                else {
                    var x2 = M("censuscategory", o);
                    if (x2 != null && x2 != "") cX += "&cg=" + encodeURIComponent(x2);
                    if (o) cX += "&c3=st,a";
                    cX += "&tl=" + encodeURIComponent("dav" + A + "-" + cU["Title"][o].substr(0, 128));
                }
            } else if (cV.prod.indexOf("sc") >= 0) {
                var x2 = M("censuscategory", o);
                if (x2 != null && x2 != "") cX += "&cg=" + encodeURIComponent(x2);
                if (o) cX += "&c3=st,a";
                cX += "&ou=" + videoType + "_" + encodeURIComponent(_pageUrl.substr(0, 128));
                if (A == 0) {
                    if (cU["VL"][o] > 0) cX += "&sd=" + Math.round(cU["VL"][o]);
                } else {
                    var du = Math.round(cU["PM"][o]);
                    cX += "&du=" + du;
                }
                if (A != 1) if (o) cX += scxpa;
                else cX += scxpc;
                cX += "&tl=" + encodeURIComponent("dav" + A + "-" + cU["Title"][o].substr(0, 128));
            }
            if (A == 0) cX += "&rnd=" + Math.floor(Math.random() * 100000);
            cX += "&tp=gg";
        }
        return cX;
    };

    function dp(bD, curval, ac) {
        var x2 = M("iag_" + bD, ac);
        if (x2 != null && x2 != "") return "&pr=iag." + bD + "," + encodeURIComponent(x2);
        if (curval == null) return "";
        return curval;
    };

    function dn(ac, p1, p2, p3, p4) {
        var s;
        if (cV.prod.indexOf("iag") >= 0) s = "";
        else return;
        var sid, tfid, bcr, pgm, epi, seg, pd, oad, brn, cte, ap, ifp, ipod, iapt, icust1;
        if (ac) {
            iagua = "";
            if (cV.iagads == 2) return;
        } else {
            iaguc = "";
            if (cV.iagcontent == 2) return;
        }
        if (cV.sid != undefined) sid = "&pr=iag.sid," + cV.sid;
        else sid = "";
        if (cV.tfid != undefined) tfid = "&pr=iag.tfid," + cV.tfid;
        else tfid = "";
        bcr = "&pr=iag.bcr," + cV.clientid;
        if (ac == 0 || p2 != "preroll") {
            var x2 = M("iagcategory", 0);
            if (x2 == null || x2 == "") x2 = M("category", 0);
            if (x2 != null && x2 != "") pgm = "&pr=iag.pgm," + encodeURIComponent(x2);
            else pgm = "&pr=iag.pgm,general";
            x2 = M("title", 0);
            if (x2 != null && x2 != "") epi = "&pr=iag.epi," + encodeURIComponent(x2);
            else epi = "&pr=iag.epi," + encodeURIComponent(cU["Title"][0].substr(0, 255));
            seg = "&pr=iag.seg,";
            if (p4 > 1) seg += encodeURIComponent(p4);
            else seg += "1";
            x2 = M("pd", 0);
            if (x2 == null) x2 = cV.pd;
            if (x2 != null && x2 != "") pd = "&pr=iag.pd," + encodeURIComponent(x2);
            else pd = "";
            x2 = M("oad", 0);
            if (x2 != null && x2 != "") oad = "&pr=iag.oad," + encodeURIComponent(x2);
            else oad = "";
            sid = dp("sid", sid, 0);
            tfid = dp("tfid", tfid, 0);
            bcr = dp("bcr", bcr, 0);
            pgm = dp("pgm", pgm, 0);
            epi = dp("epi", epi, 0);
        }
        ifp = dp("fp", ifp, ac);
        icust1 = dp("cust1", icust1, ac);
        if (ac) {
            brn = "&pr=iag.brn," + cV.clientid;
            cte = "&pr=iag.cte," + encodeURIComponent(p1);
            if (p2 == "midroll") ap = "&pr=iag.ap,mid";
            else if (p2 == "postroll") ap = "&pr=iag.ap,post";
            else ap = "&pr=iag.ap,pre";
            sid = dp("sid", sid, ac);
            tfid = dp("tfid", tfid, ac);
            bcr = dp("bcr", bcr, ac);
            brn = dp("brn", brn, ac);
            cte = dp("cte", cte, ac);
            pgm = dp("pgm", pgm, ac);
            epi = dp("epi", epi, ac);
            seg = dp("seg", seg, ac);
            pd = dp("pd", pd, ac);
            oad = dp("oad", oad, ac);
            ipod = dp("pod", ipod, ac);
            iapt = dp("apt", iapt, ac);
            iagua = sid + tfid + bcr + pgm + epi + seg + pd + brn + ap + cte + oad + ifp + ipod + iapt + icust1;
        } else iaguc = sid + tfid + bcr + pgm + epi + seg + pd + oad + ifp + icust1;
    };

    function ds(ac, p1, p2, p3, p4) {
        var s;
        if (cV.prod.indexOf("sc") >= 0) s = "";
        else return;
        if (ac) scxpa = "";
        else scxpc = "";
        var st;
        if (ac == 1) st = aW;
        else st = aX;
        var r = 0;
        var done = false;
        var K;
        var dq;
        var name, val;
        while (done == false) {
            r = st.indexOf("<nol_", r);
            if (r < 0) {
                done = true;
                break;
            }
            K = st.indexOf(">", r);
            if (K < 0) {
                done = true;
                break;
            }
            name = st.substring(r + 6, K);
            dq = st.indexOf("</", K + 1);
            if (dq < 0) {
                done = true;
                break;
            }
            val = st.substring(K + 1, dq);
            r = dq + 7;
            var name2 = encodeURIComponent(name);
            if (name2.indexOf("%") < 0) {
                if (name.length > 32) name = name.substring(0, 31);
                if (val.length > 254) val = val.substring(0, 253);
                if (name.indexOf("raw_") > -1) {
                    name = name.substr(4);
                    s += "&" + name + "=" + val;
                } else s += "&" + name + "=" + encodeURIComponent(val);
            }
        }
        if (ac) scxpa = s;
        else scxpc = s;
    };

    function report(A) {
        var cX = getut(A);
        ca.report(aL(), A, cX);
        _currentMsgSize = 0;
        aQ = A;
    };

    function cO() {
        if (aQ != 2) {
            var cX = getut(1);
            ca.bp(cX);
        }
    };
    this.bC = function () {
        var T;
        try {
            T = window.top.document.hasFocus();
        } catch (av) {
            T = aE;
        }
        if (T == true) az = true;
        if (playState == 1) {
            if (T == true) cU["FA"][bV] += 1;
            cU["FP"][bV] += 1;
        }
    };

    function bu() {
        var ao = false;
        try {
            var bU = window.top.document.hasFocus();
        } catch (av) {
            ao = true;
        }
        if (ao) {
            if (window.top.addEventListener) window.top.addEventListener('focus', aO, false);
            else if (window.top.attachEvent) window.top.attachEvent('onfocus', aO);
            if (window.top.addEventListener) window.top.addEventListener('blur', aG, false);
            else if (window.top.attachEvent) window.top.attachEvent('onblur', aG);
        }
        return ao;
    };

    function aO() {
        aE = true;
    };

    function aG() {
        aE = false;
    };

    function bs() {
        az = false;
        cU["FA"][0] = cU["FA"][1] = 0;
        cU["FP"][0] = cU["FP"][1] = 0;
    };

    function U(Q) {
        var vs = "";
        var D;
        var i = bV;
        if (cU["FP"][i] > 0 && az == true) D = Math.round(cU["FA"][i] * 100 / cU["FP"][i]);
        else D = 100;
        if (Q != null && Q != "") vs = Q;
        else vs = cU["PL"][i];
        vs += "," + D;
        if (Number(cU["PM"][i]) < Q) cU["PM"][i] = Q;
        return vs;
    };

    function aL() {
        var t = 'NA';
        if (at > 0 || bb > 0) {
            t = (Math.round((at * 100) / (at + bb))) + '%';
            if (aZ) t = 'u' + t;
        }
        return t;
    };

    function loadXMLString(txt) {
        try {
            xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(txt);
            return (xmlDoc);
        } catch (e) {
            try {
                bv = new DOMParser();
                xmlDoc = bv.parseFromString(txt, "text/xml");
                return (xmlDoc);
            } catch (e) {
                alert(e.message)
            }
        }
        return (null);
    };
    this.init = function (I, userId, ggAddress, fpar) {
        bi = userId;
        var fxml = loadXMLString("<vi>" + fpar + "</vi>");
        var xn = fxml.firstChild.firstChild;
        var lim = 0;
        while (xn != undefined && lim < 20) {
            if (xn.firstChild != null) cV[xn.nodeName] = xn.firstChild.nodeValue;
            xn = xn.nextSibling;
            lim++;
        }
        if (au != 1) {
            if (cV.sfcode == undefined || cV.sfcode.length != 2) ggAddress = "http://secure-us.imrworldwide.com/cgi-bin/m?";
            else ggAddress = "http://secure-" + cV.sfcode + ".imrworldwide.com/cgi-bin/m?";
            ggAddress += "ci=" + cV.clientid;
            if (cV.cisuffix != undefined && cV.cisuffix != "") ggAddress += cV.cisuffix;
            if (cV.vcid != undefined && cV.vcid != "") ggAddress += "&c6=vc," + cV.vcid;
            if (cV.aJ != undefined && cV.aJ != "") ggAddress += "&c4=mn," + encodeURIComponent(cV.aJ);
            ggAddress += "&cc=1";
        }
        _address = ggAddress;
        if (cV.prod == undefined) cV.prod = "vc";
        this._ggtrackid = cV.clientid;
        if (cV.vcid != null) this._ggtrackid += "." + cV.vcid;
        if (I == 'genjsplayer') cd = new GenJsPlayerEventProcessor();
        else cd = new EventProcessor();
        this._ggplayername = "gj3";
        if (cV["msgmax"] != null && cV["msgmax"] > 0) cl = cV["msgmax"];
        if (cV["msgint"] != null && cV["msgint"] != "") cr = cV["msgint"];
        if (cV["focusint"] != null && cV["focusint"] >= 0) aA = cV["focusint"];
        if (O) {
            if (window.addEventListener) window.addEventListener('unload', cO, false);
            else if (window.attachEvent) window.attachEvent('onbeforeunload', cO);
        }
        ca = new cz(_version, userId, _address, true, true, _jmet);
        if (aA != 0) {
            aZ = bu();
            cu = setInterval(this.bC, aA * 1000);
        }
        this.C('1', new Date().getTime(), window.location.href, document.referrer);
    };
    this.aD = function (i, ts) {
        var V = "";
        var m = 0;
        var D = 1;
        var i = bV;
        if (cU["CS"][i] != 0 && cU["PA"][i] > 0 && cU["VL"][i] > 0) {
            if (cU["PA"][i] >= cU["VL"][i]) m = 99;
            else if (cU["VL"][i] > 0) m = Math.round(cU["PA"][i] * 100 / cU["VL"][i]);
            else m = 66;
            if (cU["FP"][i] > 0 && az == true) {
                D = cU["FA"][i] / cU["FP"][i];
                m = Math.round(m * .8 + m * D * 0.2);
            }
            if (cU["MI"][i] > 0 && cU["SI"][i] <= 0) m -= 10;
            else if (cU["SI"][i] > 0) m += 5;
            if (cU["SR"][i] > 0);
            m += 10;
            if (cU["SH"][i] > 0 || cU["SV"][i] > 0 || cU["PB"][i] > 0 || cU["CI"][i] > 0) m = 99;
            if (cU["II"][i] > 0) m += 10;
            if (cU["ER"][i] > 0 && cU["ER"][i] <= 5) m = cU["ER"][i] * 20;
            if (m > 99) m = 99;
            V = ts + "," + 50 + "," + m + "," + Math.round(D * 100) + "|||";
            cU["CS"][i] = 0;
        }
        if (ae > 0) {
            V = ts + "," + "25" + "," + ae + "," + am + "," + ab + "|||" + V;
            ae = 0;
            am = 0;
            ab = 0;
        }
        return V;
    };
    this.C = function (eventType, date, d, f, j, k) {
        var l = null;
        var bd = 0;
        var v;
        var i, g, R;
        var aF, aB;
        var functionType = eventType;
        if (ci == functionType && aP == d && aU == f && aT == j && aS == k) return;
        ci = functionType;
        aP = d;
        aU = f;
        aT = j;
        aS = k;
        aY = false;
        if (eventType.indexOf("cust:") == 0) l = cd.genericEvent(eventType, date, d, f, j, k);
        else l = cd.cs(eventType, date, d, f, j, k);
        if (l == null || l == "") return;
        var al = l.split(",");
        functionType = Number(al[1]);
        d = al[2];
        f = al[3];
        o = bV;
        switch (functionType) {
        case 1:
            cZ = l;
            if (aP != null) _pageUrl = aP;
            return;
        case 51:
            if (cZ != null) {
                cZ = date + ",1," + aP;
                if (aU != null && aU != "") cZ += "," + aU;
                if (aP != null) _pageUrl = aP;
                return;
            } else l = date + ",51," + aP;
            if (aU != null) l += "," + aU;
            _pageUrl = aP;
            break;
        case 2:
            break;
        case 3:
        case 15:
            intCount = 0;
            dr = 0;
            if (f == "preroll" || f == "postroll" || f == "midroll" || f == "ad") {
                i = 1;
                aW = l;
            } else {
                i = 0;
                aX = l;
            }
            videoType = f;
            bV = i;
            o = i;
            bf(i);
            if (functionType == 15) {
                cU["CS"][i] = 1;
                playState = 1;
            }
            var H = unescape(M("length", bV));
            if (H != null && !isNaN(H)) H = Number(H);
            else H = 30;
            cU["VL"][bV] = H;
            var tit = M("title", bV);
            if (tit != null && tit != "") cU["Title"][bV] = tit;
            else cU["Title"][bV] = d;
            if (bV == 0) ba();
            L = 0;
            cU["SS"][bV] = L;
            dn(i, d, f, j, k);
            ds(i, d, f, j, k);
            break;
        case 4:
            intCount = 0;
            g = d;
            if (isNaN(g) || g == 0) g = cU["PL"][bV];
            else g = Number(d);
            i = g - cU["PL"][bV];
            cU["PA"][bV] += i;
            cU["PL"][bV] = g;
            if (Number(cU["PM"][bV]) < g) cU["PM"][bV] = g;
            v = this.aD(bV, date);
            bV = 0;
            playState = 0;
            L = 0;
            break;
        case 5:
            intCount++;
            g = d;
            L = 0;
            if (isNaN(g)) {
                v = genError("InvPlayParam", d);
                break;
            } else g = Number(d);
            if (g != 0 || cU["PA"][bV] == 0) cU["PL"][bV] = g;
            cU["CS"][bV] = 1;
            playState = 1;
            ca.af(U(g));
            cU["SS"][bV] = L;
            break;
        case 6:
            intCount++;
            g = d;
            if (isNaN(g)) {
                v = genError("InvPauseParam", d);
                break;
            } else g = Number(d);
            i = g - cU["PL"][bV];
            if (i > 0) cU["PA"][bV] += i;
            cU["PL"][bV] = g;
            cU["CS"][bV] = 1;
            playState = 0;
            ca.af(U(g));
            break;
        case 7:
            cU["CS"][bV] = 1;
            dr++;
            if (cU["SS"][bV] == 1 || cU["SS"][bV] == null) return;
            g = d;
            if (isNaN(g)) {
                v = genError("InvStopParam", d);
                break;
            } else g = Number(d);
            i = Number(g) - cU["PL"][bV];
            if (i > 0) {
                cU["PA"][bV] += i;
            }
            cU["PL"][bV] = g;
            if (Number(cU["PM"][bV]) < g) cU["PM"][bV] = g;
            if (cU["PA"][bV] > 0) v = this.aD(bV, date);
            playState = 0;
            L = 1;
            cU["SS"][bV] == L;
            cU["PA"][bV] = 0;
            cU["FA"][bV] = 0;
            cU["FP"][bV] = 0;
            if (bV == 0) ba();
            break;
        case 8:
            intCount++;
            g = d;
            if (isNaN(g)) {
                v = genError("InvSeekParam1", d);
                break;
            } else g = Number(d);
            R = f;
            if (isNaN(R)) {
                v = genError("InvSeekParam", f);
                break;
            } else R = Number(f);
            i = g - cU["PL"][bV];
            if (i > 0) {
                cU["PA"][bV] += i;
            }
            cU["PL"][bV] = R;
            cU["CS"][bV] = 1;
            ca.af(U(R));
            break;
        case 9:
            if (d || d.toLowerCase().indexOf("on") || d == 1) cU["MI"][bV] += 1;
            else cU["MI"][bV] -= 1;
            break;
        case 10:
            if (d || d.toLowerCase().indexOf("on") || d == 1) cU["SR"][bV] += 1;
            bs();
            break;
        case 11:
            if (!isNaN(d)) {
                if (ai < 0) ai = d;
                else {
                    if (d > ai) cU["SI"][bV] += 1;
                    ai = d;
                }
            }
            break;
        case 12:
            cU["DI"][bV] += 1;
            break;
        case 13:
        case 14:
            break;
        case 16:
        case 22:
            cU["CI"][bV] += 1;
            break;
        case 17:
            cU["SH"][bV] += 1;
            break;
        case 18:
            cU["SV"][bV] += 1;
            break;
        case 19:
        case 20:
            cU["PB"][bV] += 1;
            break;
        case 21:
            cU["II"][bV] += 1;
            break;
        case 23:
            cU["ER"][bV] += 1;
            break;
        case 24:
            break;
        case 25:
            ae += 1;
            am += Number(d);
            if (ab < Number(d)) ab = d;
            return;
        case 49:
            if (isNaN(d)) return;
            g = Number(d);
            if (g <= 1 || playState != 1) return;
            ca.af(U(g));
            if (bV != 0 || bX.length == 0) return;
            var act = cU["PA"][bV] + (g - cU["PL"][bV]);
            if (act < bX[0]) return;
            cU["PA"][bV] += (g - cU["PL"][bV]);
            cU["PL"][bV] = d;
            v = this.aD(bV, date);
            bX.splice(0, 1);
            break;
        default:
            break;
        }
        var G = 10;
        if (isNaN(cU["VL"][bV])) G = 10;
        else G = cU["VL"][bV] / 60 * bG;
        if (G > 100) G = 100;
        if (G < 20) G = 20;
        if (aY == true) return;
        if (intCount > G) if (!(functionType == 3 || functionType == 15 || functionType == 4 || functionType == 7)) return;
        if (intCount > 5000) return;
        if (v != null) l = v + l;
        if (cZ != "") {
            l = cZ + "|||" + l;
            cZ = "";
        }
        if (o != 1) aF = Number(cV.trackcontent);
        else aF = Number(cV.trackads);
        if (!isNaN(aF)) {
            switch (aF) {
            case 0:
                return;
            case 2:
            case 3:
                aB = M("ggignr", o);
                if (aB != null && aB == "1") return;
                break;
            default:
                break;
            }
        }
        bd = ca.ct(l, aL());
        _currentMsgSize += bd;
        var tpld = aC;
        if (functionType == 7) {
            report(2);
            if (bV == 0) B = 1;
            else {
                o = 0;
                bV = 0;
            }
            tpld = 0;
        } else if (functionType == 49) {
            report(1);
            tpld = 0;
        } else if (functionType == 15) {
            report(0);
            tpld = 0;
            if (bV == 0) B = 0;
        } else if (functionType == 3) {
            if (aC == 5) {
                report(0);
                tpld = 0;
                if (bV == 0) B = 0;
            } else tpld = 3;
        } else if (functionType == 5) {
            if (aC == 3) {
                report(0);
                tpld = 0;
            } else if (d == 0) {
                if (B == 1 && bV == 0) {
                    cU["PM"][bV] = 0;
                    report(0);
                    tpld = 0;
                    B = 0;
                } else tpld = 5;
            } else tpld = 0;
        } else if (functionType == 6 && d != 0) tpld = 0;
        else if (functionType == 8 && f != 0) tpld = 0;
        aC = tpld;
        if (Number(_currentMsgSize) >= Number(cl)) report(1);
    };
    this.bS = function (eventType, date, d, f, j, k) {
        this.C('cust:' + eventType, date, d, f, j, k);
    }
};

function CookieManager() {
    var CSEPARATOR = '|||';
    var cS = '_ggCvar';
    var bP = '_ggMCvar';
    var TIMEOUT = 45000;
    var _userId = null;
    var cf = 0;
    var cG = 365 * 24 * 60 * 60 * 1000;
    this.bw = function (userId) {
        _userId = be(32);
        return _userId;
    };
    this.bz = function () {};
    this.clearMessageCookie = function () {};
    this.bE = function () {
        cf++;
        return cf;
    };
    this.aR = function () {
        return _userId;
    };

    function createCookie(name, value) {};

    function deleteCookie(name) {};

    function readCookie(name) {};

    function be(ak) {
        var out = "";
        var c = "";
        for (var i = 0; i < ak; i++) {
            c = Math.floor(Math.random() * 36).toString(36);
            out += Math.floor(Math.random() * 2) ? c.toUpperCase() : c.toLowerCase();
        }
        return out;
    }
};

function cy(version, userId, bM, ggtrackid, ggplayername) {
    var ax = 'END"/></GGC>';
    var aa = '|||';
    var bO = '^|^^';
    var bY = '';
    var bj = Math.floor(Math.random() * 100000) + 1;
    var _xmlHeader = '<GGC><H value="' + version + ',' + (new Date().getTimezoneOffset() / -60) + ',' + userId + '.' + bj + "," + ggtrackid + "," + ggplayername + '"/><L value="';
    this.bA = function (currentMessage) {
        if (bY == '') bY = _xmlHeader + currentMessage + aa;
        else bY += currentMessage + aa;
        return bY;
    };
    this.bg = function (t) {
        if (bY == '') return bY;
        var bl = bY + ax;
        bY = '';
        return bl;
    };
    this.bx = function (aN) {
        if (bY == '') bY = _xmlHeader;
        if (aN != "") bY += new Date().getTime() + ",49," + aN + aa;
        return bY + new Date().getTime() + ",2" + aa + ax;
    }
};

function cz(version, userId, address, aI, an, metricsObj) {
    var cT = 'logthisjs.php';
    var _address = address;
    var bF = 'logthisjs.php';
    var bh = 'postjs.php';
    var cg;
    var cc = new CookieManager();
    var ce = null;
    var bc = 'NA';
    var cp = false;
    var cf = cc.bE();
    var cH;
    var cb = "GET";
    var _metricsObj = metricsObj;
    cg = new cw(address, address + bF, address + bh, cb);
    if (aI != null) cp = aI;
    cp = false;
    cc.bw(userId);
    cc.bz();
    if (userId == null) userId = "0";
    ce = new cy(version, userId, cf, _metricsObj._ggtrackid, _metricsObj._ggplayername);
    var ay = new bo();
    var ag;
    var ah;
    var ax = '|||END"/></GGC>';
    var bq = 'END"/></GGC>';
    var bK = "^|^^";
    var dj = "|||";
    var bm;
    var cv = 0;
    if (_ggeom == 0) ah = 0;
    else ah = 2;
    var viewst = "";
    var ag = String.fromCharCode(56) + String.fromCharCode(103) + String.fromCharCode(36) + String.fromCharCode(15) + String.fromCharCode(126) + String.fromCharCode(3) + String.fromCharCode(71) + String.fromCharCode(91) + String.fromCharCode(100) + String.fromCharCode(7) + String.fromCharCode(17) + String.fromCharCode(31) + String.fromCharCode(95) + String.fromCharCode(28) + String.fromCharCode(64) + String.fromCharCode(14);
    bm = ay.aw(ag, bq);
    this.report = function (t, A, cX) {
        bc = t;
        var F = ce.bg(t);
        F = "<m v=" + ah + " c=" + cc.aR() + ">" + ay.aw(ag, F) + "<%2Fm>";
        cg.report(F, cX);
        if (A == 0) cv = 1;
    };
    this.bp = function (cX) {
        var F = ce.bx(viewst);
        F = "<m v=" + ah + " c=" + cc.aR() + ">" + ay.aw(ag, F) + "<%2Fm>";
        cg.report(F, cX);
    };
    this.ct = function (l, t) {
        bc = t;
        var message = ce.bA(l);
        var ak = message.length;
        return ak;
    };
    this.af = function (bD) {
        if (O) {
            var l_lfunctionType = _metricsObj.getlfunctionType();
            if (l_lfunctionType == 5 || l_lfunctionType == 8) bD = '';
            viewst = bD;
        }
    }
};

function cw(cD, bI, bk, an) {
    var bR = 2;
    var bN = 10;
    var aV = cD;
    var cF = bI;
    var bQ = bk;
    var _sending = false;
    var cA;
    var _retry = 0;
    var cb = 'GET-CONFIRM';
    var _i = new Image(1, 1);
    var _iframe = null;
    if (an != null) cb = an;
    if (cb == 'GET-CONFIRM') {
        if (window.addEventListener) {
            _i.addEventListener('load', loadSuccess, false);
            _i.addEventListener('error', bn, false);
        } else if (window.attachEvent) {
            _i.attachEvent('onload', loadSuccess);
            _i.attachEvent('onerror', bn);
        }
    }
    this.report = function (cY, cX) {
        if (cY == null || cY == '') return;
        if (cb != 'POST') bB(cY, cX);
    };

    function bB(cY, cX) {
        cA = cY;
        _sending = true;
        if (cb == 'GET') _i = new Image(1, 1);
        if (au == 1) _i.src = aV + cX + '?HEX40=' + cY;
        else _i.src = aV + cX + "HEX40%3D" + cY;
    }
};

function bo() {
    function by(ad, as) {
        var result = '';
        if (ad == null || as == null) return as;
        var aK = ad.split('');
        var bH = aK.length;
        var ar = as.split('');
        var aM = ar.length;
        for (var i = 0; i < aM; i++) {
            var hash = ar[i].charCodeAt(0) ^ ((aM % 10) | aK[i % bH].charCodeAt(0));
            if (hash == 0) result += ar[i];
            else result += String.fromCharCode(hash);
        }
        return result;
    };

    function bt(aj) {
        var $a, $n, $A;
        var $utf;
        $utf = '';
        $A = aj.length;
        for ($a = 0; $a < $A; $a++) {
            $n = aj.charCodeAt($a);
            if ($n < 128) {
                $utf += String.fromCharCode($n);
            } else if (($n > 127) && ($n < 2048)) {
                $utf += String.fromCharCode(($n >> 6) | 192);
                $utf += String.fromCharCode(($n & 63) | 128);
            } else if ($n < 65536) {
                $utf += String.fromCharCode(($n >> 12) | 224);
                $utf += String.fromCharCode((($n >> 6) & 63) | 128);
                $utf += String.fromCharCode(($n & 63) | 128);
            } else {
                $utf += String.fromCharCode(($n >> 18) | 240);
                $utf += String.fromCharCode((($n >> 12) & 63) | 128);
                $utf += String.fromCharCode((($n >> 6) & 63) | 128);
                $utf += String.fromCharCode(($n & 63) | 128);
            }
        }
        return $utf;
    };
    this.urlencode = function (str) {
        var bZ = {};
        var tmp_arr = [];
        var J = str.toString();
        var replacer = function (search, replace, str) {
                var tmp_arr = [];
                tmp_arr = str.split(search);
                return tmp_arr.join(replace);
            };
        bZ["'"] = '%27';
        bZ['('] = '%28';
        bZ[')'] = '%29';
        bZ['*'] = '%2A';
        bZ['~'] = '%7E';
        bZ['!'] = '%21';
        bZ['%20'] = '+';
        J = encodeURIComponent(J);
        for (se in bZ) {
            var repl = bZ[se];
            J = replacer(se, repl, J)
        };
        return J.replace(/(\%([a-z0-9]{2}))/g, function (full, m1, m2) {
            return "%" + m2.toUpperCase();
        });
        return J;
    };
    this.aw = function (ad, aj) {
        return this.urlencode(by(ad, bt(aj)));
    }
};

function EventProcessor() {
    this.bW = -1;
    this.cx = 'NA';
    var cC = -1;
    var ck = null;
    var _videoInfo = null;
    var genEventType = null;
    var dc = null;
    var dh = null;
    var dg = null;
    var de = null;
    var ggEventType = null;
    var cq = null;
    var cn = null;
    var co = null;
    var cj = null;
    this.getCurrentEvent = function () {
        return this.bW;
    };
    this.genericEvent = function (eventType, date, d, f, j, k) {
        if (genEventType == eventType && dc == d && dh == f && dg == j && de == k) return null;
        var cW = processGenericEvent(eventType, date, d, f, j, k);
        if (cW != null) {
            genEventType = eventType;
            dc = d;
            dh = f;
            dg = j;
            de = k;
        }
        return cW;
    };
    this.cs = function (eventType, date, d, f, j, k) {
        if (ggEventType == eventType && cq == d && cn == f && co == j && cj == k) return null;
        var cW = null;
        if (eventType == 1) {
            this.bW = eventType;
            ck = d;
            cW = date + "," + this.bW + ',' + ck;
            if (f != null) cW += "," + f;
        } else if (eventType == 10 || eventType == 9) {
            this.bW = eventType;
            if (d == false) cW = date + "," + this.bW + ',' + '0';
            else if (d == true) cW = date + "," + this.bW + ',' + '1';
            else cW = date + "," + this.bW + ',' + d;
        } else if (eventType == 12) {
            this.bW = eventType;
            cW = date + "," + this.bW;
        } else if (eventType == 49) {
            {
                this.bW = eventType;
                cC = d;
                cW = date + "," + this.bW + ',' + d;
            }
        } else if (eventType == 11) {
            this.bW = eventType;
            cW = date + "," + this.bW + ',' + d;
        } else if (eventType == "videoInfo") setVideoInfoString(d);
        else cW = this.C(eventType, date, d, f, j, k);
        if (cW != null) {
            ggEventType = eventType;
            cq = d;
            cn = f;
            co = j;
            cj = k;
        }
        return cW;
    };
    this.C = function (eventType, date, d, f, j, k) {};
    this.getVideoInfo = function (duration, uurl) {
        var vidInfo = '';
        var custInfo;
        if (duration != null) vidInfo = '<length>' + duration + '</length>';
        if (uurl != null) vidInfo += '<uurl>' + uurl + '</uurl>';
        if (_videoInfo != null) {
            vidInfo += _videoInfo;
            _videoInfo = null;
        }
        return vidInfo;
    };

    function processGenericEvent(eventType, date, d, f, j, k) {
        if (eventType == null || eventType.length <= 5) return null;
        var l = date + "," + eventType;
        if (d != null) l += ',' + d;
        if (f != null) l += ',' + f;
        if (j != null) l += ',' + j;
        if (k != null) l += ',' + k;
        return l;
    };

    function setVideoInfoString(videoInfo) {
        _videoInfo = videoInfo;
    }
};

function aq(vi, name) {
    var r = vi.indexOf("<" + name + ">") + name.length + 2;
    var K = vi.indexOf("</" + name + ">", r);
    if (r >= 0 && K > r) return vi.substring(r, K);
    return null;
};

function GenJsPlayerEventProcessor() {
    this.inheritFrom = EventProcessor;
    this.inheritFrom();
    var da = null;
    var db = null;
    this.C = function (eventType, date, d, f, j, k) {
        var cW = '';
        if ((eventType == 3 && this.bW != 3) || (eventType == 15 && this.bW != 15)) {
            var vx1 = aq(j, "censuscategory");
            var vx2 = aq(j, "category");
            if (vx2 == null && vx1 != null && vx1 != "") j += "<category>" + vx1 + "</category>";
            this.cx = aq(j, "length");
            cW += ',' + d + "," + f + "," + j;
            if (!k && k != "" && !isNaN(k)) cW += "," + k;
        } else if (eventType == 1 || eventType == 51 || eventType == 8) {
            cW += "," + d;
            if (f != null) cW += "," + f;
        } else if (eventType == 6 && da != true && d != '00:00') {
            da = true;
            db = d;
            cW += ',' + db;
        } else if (eventType == 5 && da != false) {
            da = false;
            cW += ',' + d;
        } else if (eventType == 7) {
            da = true;
            db = '0';
            cW += ',' + d;
        } else if (eventType == 9) {
            if (d == false) cW += ',Off';
            else cW += ',On';
        } else {
            cW += "," + d;
            if (f != null) cW += "," + f;
        }
        if (cW == '') return null;
        else {
            this.bW = eventType;
            return date + ',' + this.bW + cW;
        }
    }
}