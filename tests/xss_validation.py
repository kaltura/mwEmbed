#!/usr/bin/env python3
"""
XSS validation script for NRI findings.

Usage:
    python3 tests/xss_validation.py --base-url https://api.kaltura.switch.ch --version v2.101

Each test sends the original PoC payload and asserts it is BLOCKED (non-200),
then sends a benign valid request and asserts it passes through — confirming
the fix works without breaking legitimate traffic.

--------------------------------------------------------------------------------
TEST DESCRIPTIONS  (copy this block into the Jira ticket)
--------------------------------------------------------------------------------

Finding 1 — callback parameter (mwEmbedFrame.php / kalturaIframe.php)
  The callback parameter is used as a JSONP wrapper function name and is
  embedded verbatim into the JavaScript response with no validation.
  An attacker can append a semicolon and arbitrary JS to break out of the
  function name and execute code in the browser.

  Test 1.1 — callback semicolon injection (PoC from NRI)
    Sends the exact payload from the NRI report:
      callback=mwi_quizplayer017021;alert(1)//935
    The semicolon terminates the function name and injects alert(1) as a
    separate statement. Expected result: server returns HTTP 400.

  Test 1.2 — callback newline injection
    Sends a newline character inside the callback value:
      callback=fn<LF>alert(1)//
    A newline breaks the JSONP function name across two JS lines, making the
    second line an independent statement. Expected result: HTTP 400.

  Test 1.3 — callback nested call injection
    Sends parentheses inside the callback value:
      callback=fn(alert(1))
    Parentheses are not valid in a JS identifier and allow injecting a
    function call directly into the JSONP wrapper. Expected result: HTTP 400.

  Test 1.4 — callback valid plain identifier (benign)
    Sends a standard alphanumeric callback name:
      callback=mwi_quizplayer017021
    This is the normal production usage. Expected result: HTTP 200.

  Test 1.5 — callback dot-namespaced identifier (benign)
    Sends a dot-separated namespace as used in some embed integrations:
      callback=kWidget.embedCallback
    This is valid JS and used in production. Expected result: HTTP 200.

--------------------------------------------------------------------------------

Finding 2 — uiconf_id parameter (mwEmbedLoader.php)
  The uiconf_id parameter is a Kaltura numeric configuration ID that is
  embedded directly into JS string literals and function call arguments.
  Any non-numeric value can break out of those contexts.

  Test 2.1 — uiconf_id exact NRI PoC payload
    Sends the payload from NRI listing 23:
      uiconf_id=23448763}}54708";')alert(1)
    Closing braces and quotes break out of the surrounding JS object literal.
    Expected result: HTTP 400.

  Test 2.2 — uiconf_id script tag injection
    Sends a non-numeric value containing a <script> tag:
      uiconf_id=abc<script>alert(1)</script>
    Even in a JS response, injected markup can alter parser state.
    Expected result: HTTP 400.

  Test 2.3 — uiconf_id semicolon breakout
    Sends a numeric prefix followed by a semicolon:
      uiconf_id=123;alert(1)//
    The semicolon terminates the JS statement that uiconf_id is part of.
    Expected result: HTTP 400.

  Test 2.4 — uiconf_id valid numeric value (benign)
    Sends a real Kaltura uiConf ID:
      uiconf_id=53565782
    Normal production value. Expected result: HTTP 200.

--------------------------------------------------------------------------------

Finding 3 — wid parameter (mwEmbedLoader.php)
  The wid (widget ID) is embedded in a JS string literal inside kWidget.embed().
  Any non-alphanumeric character can break out of the string context.

  Test 3.1 — wid semicolon breakout
    Sends a valid-looking wid with a semicolon appended:
      wid=_1915851;alert(1)//
    The semicolon ends the JS statement and injects new code.
    Expected result: HTTP 400.

  Test 3.2 — wid script tag injection
    Sends HTML/script tags as the wid value:
      wid=<script>alert(1)</script>
    Tags reflected into the JS response body can alter parser execution.
    Expected result: HTTP 400.

  Test 3.3 — wid valid value (benign)
    Sends a real widget ID in standard Kaltura format:
      wid=_1915851
    Normal production value. Expected result: HTTP 200.

--------------------------------------------------------------------------------

Finding 4 — playerId parameter (mwEmbedLoader.php)
  The playerId is embedded in three JS locations: as an object key in
  iframeAutoEmbedCache, as a DOM element ID in document.write(), and as
  the first argument of kWidget.embed(). All three are vulnerable.

  Test 4.1 — playerId semicolon breakout
    Sends a playerId with a semicolon:
      playerId=x;alert(1)//
    Breaks out of the JS string context in all three embed locations.
    Expected result: HTTP 400.

  Test 4.2 — playerId script tag injection
    Sends HTML tags as the playerId value:
      playerId=<script>alert(1)</script>
    Tags written via document.write() execute in the page DOM.
    Expected result: HTTP 400.

  Test 4.3 — playerId valid value (benign)
    Sends a standard DOM element ID:
      playerId=kaltura_player
    Normal production value. Expected result: HTTP 200.

--------------------------------------------------------------------------------

Finding 5 — entry_id parameter (mwEmbedLoader.php)
  The entry_id is embedded as a JS string literal in the kWidget.embed()
  configuration object. Non-alphanumeric characters break the string.

  Test 5.1 — entry_id semicolon breakout
    Sends a valid-looking entry ID prefix with a semicolon:
      entry_id=1_abc;alert(1)//
    The semicolon ends the JS statement inside the embed config object.
    Expected result: HTTP 400.

  Test 5.2 — entry_id valid value (benign)
    Sends a real Kaltura entry ID in standard format:
      entry_id=1_sprqybq9
    Normal production value. Expected result: HTTP 200.

--------------------------------------------------------------------------------

Finding 6 — width and height parameters (mwEmbedLoader.php)
  The width and height values are written into an inline CSS style inside
  a document.write() call. Non-integer values can escape the string context.

  Test 6.1 — width JS injection
    Sends a non-integer width value with JS syntax:
      width=100px;alert(1)//
    The non-digit characters break out of the style string in document.write().
    Expected result: HTTP 400.

  Test 6.2 — height JS injection
    Sends a non-integer height value with JS syntax:
      height=100px;alert(1)//
    Same injection surface as width. Expected result: HTTP 400.

  Test 6.3 — width and height valid numeric values (benign)
    Sends real pixel dimensions:
      width=640  height=360
    Normal production values. Expected result: HTTP 200.

--------------------------------------------------------------------------------
"""

import argparse
import ssl
import sys
import time
import urllib.parse
import urllib.request

BASE_PATH_FRAME  = "/html5/html5lib/{version}/mwEmbedFrame.php"
BASE_PATH_LOADER = "/html5/html5lib/{version}/mwEmbedLoader.php"

LOADER_BASE_PARAMS = {
    "wid":          "_1915851",
    "uiconf_id":    "53565782",
    "p":            "1915851",
    "iframeServer": "true",
}

FRAME_BASE_PARAMS = {
    "wid":             "_1915851",
    "uiconf_id":       "53565782",
    "entry_id":        "1_sprqybq9",
    "playerId":        "kaltura_player",
    "forceMobileHTML5": "true",
    "protocol":        "https",
}

GREEN = "\033[92m"
RED   = "\033[91m"
RESET = "\033[0m"

results = []

_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE


def build_url(base_url, path, params, version):
    # Add a unique nonce so the reverse proxy never serves a cached response
    p = dict(params, _t=str(int(time.time() * 1000)))
    return base_url.rstrip("/") + path.format(version=version) + "?" + urllib.parse.urlencode(p)


def fetch(url, label):
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "XSS-Validator/1.0",
            "Cache-Control": "no-cache, no-store",
            "Pragma": "no-cache",
        })
        with urllib.request.urlopen(req, timeout=10, context=_ssl_ctx) as r:
            body = r.read().decode("utf-8", errors="replace")
            return r.status, body
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        return e.code, body
    except Exception as ex:
        print(f"  [CONN ERROR] {label}: {ex}")
        return None, ""


def check(name, url, expect_blocked, payload_marker=None):
    status, body = fetch(url, name)
    if status is None:
        print(f"  {RED}SKIP{RESET}  {name}  (connection error)")
        results.append(("SKIP", name))
        return

    reflected = payload_marker and payload_marker in body

    if expect_blocked:
        # Attack must be rejected outright (non-200). A 200 means the server
        # accepted the malicious input regardless of whether it's reflected.
        passed = (status != 200)
        outcome = "PASS" if passed else "FAIL"
        detail = f"status={status}, payload_in_body={reflected}"
    else:
        passed = (status == 200)
        outcome = "PASS" if passed else "FAIL"
        detail = f"status={status}"

    color = GREEN if passed else RED
    tag = "BLOCKED" if expect_blocked else "ALLOWED"
    print(f"  {color}{outcome}{RESET}  [{tag}]  {name}")
    print(f"         {detail}")
    print(f"         {url[:120]}")
    results.append((outcome, name))


def run(base_url, version):
    print(f"\n=== XSS Validation against {base_url} (version {version}) ===\n")

    def frame_url(params):
        return build_url(base_url, BASE_PATH_FRAME, params, version)

    def loader_url(params):
        return build_url(base_url, BASE_PATH_LOADER, params, version)

    # ──────────────────────────────────────────────
    # Finding 1: callback parameter (kalturaIframe.php)
    # ──────────────────────────────────────────────
    print("-- Finding 1: callback parameter (mwEmbedFrame.php / kalturaIframe.php) --\n")

    check(
        "callback with semicolon injection (PoC from NRI)",
        frame_url({**FRAME_BASE_PARAMS, "callback": "mwi_quizplayer017021;alert(1)//935"}),
        expect_blocked=True, payload_marker="alert(1)",
    )
    check(
        "callback with newline injection",
        frame_url({**FRAME_BASE_PARAMS, "callback": "fn\x0aalert(1)//"}),
        expect_blocked=True, payload_marker="alert(1)",
    )
    check(
        "callback with nested call injection",
        frame_url({**FRAME_BASE_PARAMS, "callback": "fn(alert(1))"}),
        expect_blocked=True, payload_marker="alert(1)",
    )
    check(
        "callback with valid identifier (benign)",
        frame_url({**FRAME_BASE_PARAMS, "callback": "mwi_quizplayer017021"}),
        expect_blocked=False,
    )
    check(
        "callback with dot-namespaced identifier (benign)",
        frame_url({**FRAME_BASE_PARAMS, "callback": "kWidget.embedCallback"}),
        expect_blocked=False,
    )

    print()

    # ──────────────────────────────────────────────
    # Finding 2: uiconf_id parameter (mwEmbedLoader.php)
    # ──────────────────────────────────────────────
    print("-- Finding 2: uiconf_id parameter (mwEmbedLoader.php) --\n")

    check(
        "uiconf_id with PoC payload (NRI listing 23)",
        loader_url({**LOADER_BASE_PARAMS, "uiconf_id": "23448763}}54708\";')\nalert(1)\n"}),
        expect_blocked=True, payload_marker="alert(1)",
    )
    check(
        "uiconf_id with script tag injection",
        loader_url({**LOADER_BASE_PARAMS, "uiconf_id": "abc<script>alert(1)</script>"}),
        expect_blocked=True, payload_marker="alert(1)",
    )
    check(
        "uiconf_id with semicolon breakout",
        loader_url({**LOADER_BASE_PARAMS, "uiconf_id": "123;alert(1)//"}),
        expect_blocked=True, payload_marker="alert(1)",
    )
    check(
        "uiconf_id with valid numeric value (benign)",
        loader_url(LOADER_BASE_PARAMS),
        expect_blocked=False,
    )

    print()

    # ──────────────────────────────────────────────
    # Finding 3: wid parameter (mwEmbedLoader.php)
    # ──────────────────────────────────────────────
    print("-- Finding 3: wid parameter (mwEmbedLoader.php) --\n")

    check(
        "wid with semicolon breakout",
        loader_url({**LOADER_BASE_PARAMS, "wid": "_1915851;alert(1)//"}),
        expect_blocked=True, payload_marker="alert(1)",
    )
    check(
        "wid with script injection",
        loader_url({**LOADER_BASE_PARAMS, "wid": "<script>alert(1)</script>"}),
        expect_blocked=True, payload_marker="alert(1)",
    )
    check(
        "wid with valid value (benign)",
        loader_url({**LOADER_BASE_PARAMS, "wid": "_1915851"}),
        expect_blocked=False,
    )

    print()

    # ──────────────────────────────────────────────
    # Finding 4: playerId parameter (mwEmbedLoader.php)
    # ──────────────────────────────────────────────
    print("-- Finding 4: playerId parameter (mwEmbedLoader.php) --\n")

    autoembed = {**LOADER_BASE_PARAMS, "autoembed": "true"}

    check(
        "playerId with semicolon breakout",
        loader_url({**autoembed, "playerId": "x;alert(1)//"}),
        expect_blocked=True, payload_marker="alert(1)",
    )
    check(
        "playerId with script injection",
        loader_url({**autoembed, "playerId": "<script>alert(1)</script>"}),
        expect_blocked=True, payload_marker="alert(1)",
    )
    check(
        "playerId with valid value (benign)",
        loader_url({**autoembed, "playerId": "kaltura_player"}),
        expect_blocked=False,
    )

    print()

    # ──────────────────────────────────────────────
    # Finding 5: entry_id parameter (mwEmbedLoader.php)
    # ──────────────────────────────────────────────
    print("-- Finding 5: entry_id parameter (mwEmbedLoader.php) --\n")

    check(
        "entry_id with semicolon breakout",
        loader_url({**LOADER_BASE_PARAMS, "entry_id": "1_abc;alert(1)//"}),
        expect_blocked=True, payload_marker="alert(1)",
    )
    check(
        "entry_id with valid value (benign)",
        loader_url({**LOADER_BASE_PARAMS, "entry_id": "1_sprqybq9"}),
        expect_blocked=False,
    )

    print()

    # ──────────────────────────────────────────────
    # Finding 6: width / height parameters (mwEmbedLoader.php)
    # ──────────────────────────────────────────────
    print("-- Finding 6: width/height parameters (mwEmbedLoader.php) --\n")

    check(
        "width with JS injection",
        loader_url({**autoembed, "playerId": "kaltura_player", "width": "100px;alert(1)//"}),
        expect_blocked=True, payload_marker="alert(1)",
    )
    check(
        "height with JS injection",
        loader_url({**autoembed, "playerId": "kaltura_player", "height": "100px;alert(1)//"}),
        expect_blocked=True, payload_marker="alert(1)",
    )
    check(
        "width/height with valid numeric values (benign)",
        loader_url({**autoembed, "playerId": "kaltura_player", "width": "640", "height": "360"}),
        expect_blocked=False,
    )

    print()

    # ──────────────────────────────────────────────
    # Summary
    # ──────────────────────────────────────────────
    passed  = sum(1 for r, _ in results if r == "PASS")
    failed  = sum(1 for r, _ in results if r == "FAIL")
    skipped = sum(1 for r, _ in results if r == "SKIP")

    print(f"=== Results: {GREEN}{passed} passed{RESET}  "
          f"{RED}{failed} failed{RESET}  {skipped} skipped ===\n")

    if failed:
        print(f"{RED}Some tests FAILED — the fix may not be active on this server.{RESET}\n")
        sys.exit(1)
    elif skipped == len(results):
        print("All tests skipped (connection errors). Check --base-url.\n")
        sys.exit(2)
    else:
        print(f"{GREEN}All reachable tests passed.{RESET}\n")
        sys.exit(0)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Validate XSS fixes for NRI findings")
    parser.add_argument(
        "--base-url",
        required=True,
        help="Base server URL, e.g. https://api.kaltura.switch.ch",
    )
    parser.add_argument(
        "--version",
        default="v2.85",
        help="Player library version, e.g. 2.85 or v2.101 (default: v2.85)",
    )
    args = parser.parse_args()
    version = args.version if args.version.startswith("v") else "v" + args.version
    run(args.base_url, version)
