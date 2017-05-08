/**
 * @license
 * Youbora Plugin JS Kaltura player
 * Copyright NicePopleAtWork & Kaltura
 * @author Jordi Aguilar & Dan Ziv
 */

var VERSION = '1.0.0'

$YB.plugins.KalturaV2 = function (player, options) {
  try {
    /** Name and platform of the plugin.*/
    this.pluginName = 'kaltura-js';

    /** Version of the plugin. ie: 5.1.0-name */
    this.pluginVersion = '5.3.0-' + VERSION + '-kaltura-js';

    /* Initialize YouboraJS */
    this.startMonitoring(player, options);

    this.bitrate = -1;

    // Start listening
    this.registerListeners();
  } catch (err) {
    $YB.error(err);
  }
};

/** Inherit from generic plugin */
$YB.plugins.KalturaV2.prototype = new $YB.plugins.Generic;

$YB.plugins.KalturaV2.prototype.getPlayhead = function () {
  return this.player.getPlayer().currentTime;
};

$YB.plugins.KalturaV2.prototype.getBitrate = function () {
  if (this.player.getPlayer().isMulticast &&
    $.isFunction(this.player.getPlayer().getMulticastBitrate)
  ) {
    this.bitrate = this.player.getPlayer().getMulticastBitrate();
  }

  var bitrate = this.player.getPlayer().mediaElement.selectedSource.getBitrate();
  if (this.bitrate === -1 && bitrate > 0) {
    this.bitrate = bitrate
  }

  return (this.bitrate !== -1) ? (this.bitrate * 1024) : -1
};

$YB.plugins.KalturaV2.prototype.getMediaDuration = function () {
  return this.player.getPlayer().evaluate("{mediaProxy.entry.duration}");
};

$YB.plugins.KalturaV2.prototype.getTitle = function () {
  return this.player.getPlayer().evaluate("{mediaProxy.entry.name}");
};

$YB.plugins.KalturaV2.prototype.getRendition = function () {
  var source = this.player.getPlayer().mediaElement.selectedSource;
  if (source && source.getHeight() && source.getWidth()) {
    return $YB.utils.buildRenditionString(source.getWidth(), source.getHeight())
  }
};

$YB.plugins.KalturaV2.prototype.getResource = function () {
  return this.player.getPlayer().getSrc()
};

$YB.plugins.KalturaV2.prototype.getIsLive = function () {
  return this.player.getPlayer().isLive()
};

$YB.plugins.KalturaV2.prototype.getPlayerVersion = function () {
  return 'kaltura-player-v' + MWEMBED_VERSION;
};

/** Register Listeners */
$YB.plugins.KalturaV2.prototype.registerListeners = function () {
  // save context
  var context = this;

  this.player.bind('onChangeMedia', function () {
    // dispatch stop if changing media during playback in order to close the session at Youbora
    if (context.player.getPlayer().currentState !== 'end') {
      context.endedHandler();
    }
  });

  this.player.bind('playerReady', function () {
    // Set ContentId
    context.setOptions({
      properties: {
        contentId: context.player.getPlayer().evaluate("{mediaProxy.entry.id}"),
        uiConfigId: context.player.getPlayer().evaluate("{playerStatusProxy.loadTime}"),
        loadTime: context.player.getPlayer().evaluate("{playerStatusProxy.loadTime}"),
      }
    });

    // Set bitrate
    var kalturaContextData = context.player.getPlayer().kalturaContextData;
    if (kalturaContextData && kalturaContextData.flavorAssets) {
      if (kalturaContextData.flavorAssets.length === 1) {
        context.bitrate = kalturaContextData.flavorAssets[0].bitrate;
      } else {
        context.bitrate = -1;
      }
    }
  });

  this.player.bind('postEnded', function () {
    context.endedHandler();
  });

  this.player.bind('mediaLoadError playerError', function (e, errorObj) {
    var errorMsg = errorObj ? errorObj.message : context.player.getPlayer().getErrorMessage();
    var errorCode = errorObj && errorObj.code ? errorObj.code : context.player.getPlayer().getErrorCode();
    context.errorHandler(errorCode, errorMsg);
  });

  this.player.bind('bitrateChange', function (e, newBitrate) {
    context.bitrate = newBitrate;
  });

  this.player.bind('SourceSelected', function (e, source) {
    if (source.getBitrate()) {
      context.bitrate = source.getBitrate();
    }
  });

  this.player.bind('sourceSwitchingEnd', function (e, source) {
    if (source.newBitrate) {
      context.bitrate = source.newBitrate;
    }
  });

  this.player.bind('userInitiatedPause', function () {
    context.pauseHandler();
  });

  this.player.bind('userInitiatedPlay', function () {
    context.resumeHandler();
  });

  this.player.bind('bufferStartEvent', function () {
    context.bufferingHandler();
  });

  this.player.bind('bufferEndEvent', function () {
    context.bufferedHandler();
  });

  this.player.bind('adStart', function () {
    context.ignoringAdHandler();
  });

  this.player.bind('adEnd', function () {
    context.ignoredAdHandler();
  });

  this.player.bind('AdSupport_PreSequence firstPlay replayEvent', function () {
    context.playHandler();
  });

  this.player.bind('playing', function () {
    context.playingHandler();
  });

  this.player.bind('seeking', function () {
    context.seekingHandler();
  });
};

$YB.plugins.KalturaV2.prototype.unregisterListeners = function () {
  this.player.unbind(this.eventSuffix)
};
