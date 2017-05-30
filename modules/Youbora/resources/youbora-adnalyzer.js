/**
 * @license,
 * Youbora Plugin Kaltura player
 * Copyright NicePopleAtWork & Kaltura
 * @author Jordi Aguilar & Dan Ziv
 */

var VERSION = '1.0.0';

$YB.adnalyzers.KalturaAds = function (plugin) {
  try {
    this.adnalyzerVersion = '5.3.0-' + VERSION + '-kalturaads-js';

    // Reference to the plugin where it was called.
    this.startMonitoring(plugin, plugin.player);

    this.resetValues();

    this.registerListeners();
  } catch (err) {
    $YB.error(err);
  }
}

// Inheritance
$YB.adnalyzers.KalturaAds.prototype = new $YB.adnalyzers.Generic();

// Expose info from ads plugin
$YB.adnalyzers.KalturaAds.prototype.getMediaPlayhead = function () {
  if (this.plugin.viewManager.isShowingAds) {
    return this.mediaPlayhead;
  } else {
    return this.plugin.getPlayhead();
  }
};

$YB.adnalyzers.KalturaAds.prototype.getAdPlayhead = function () {
  return this.playhead;
};

$YB.adnalyzers.KalturaAds.prototype.getAdPosition = function () {
  var pos = this.ads.getPlayer().adTimeline.currentAdSlotType
  switch (pos) {
    case 'preroll':
    case 'pre':
      return 'pre';
    case 'postroll':
    case 'post':
      return 'post';
    default:
      return 'mid';
  }
};

$YB.adnalyzers.KalturaAds.prototype.getAdDuration = function () {
  return this.duration;
};

$YB.adnalyzers.KalturaAds.prototype.getAdTitle = function () {
  return this.title;
};

$YB.adnalyzers.KalturaAds.prototype.getAdPlayerVersion = function () {
  return 'kaltura-player-v' + MWEMBED_VERSION;
};

// Register listeners
$YB.adnalyzers.KalturaAds.prototype.registerListeners = function () {
  try {
    this.enableAdBufferMonitor();

    //Save context
    var adnalyzer = this;

    this.ads.bind('onAdPlay', function (e, id, system, type, position, duration, podPosition, podStartTime, title, props) {
      adnalyzer.title = title;
      adnalyzer.duration = duration;
      adnalyzer.mediaPlayhead = podStartTime;
      adnalyzer.startJoinAdHandler();
    });

      this.ads.bind( 'onPlayerStateChange', function ( event, newState ) {
          if ( newState === "pause" ) {
              adnalyzer.pauseAdHandler();
          } else if ( newState === "play" ) {
              adnalyzer.resumeAdHandler();
          }
      } );

    this.ads.bind('AdSupport_AdUpdatePlayhead', function (e, currentTime) {
      adnalyzer.playhead = currentTime;
    });

    this.ads.bind('onAdComplete', function () {
      adnalyzer.endedAdHandler();
      adnalyzer.resetValues();
    });

    this.ads.bind('onAdSkip', function () {
      adnalyzer.endedAdHandler({ skipped: true });
      adnalyzer.resetValues();
    });


  } catch (error) {
    $YB.error(error);
  }
};

$YB.adnalyzers.KalturaAds.prototype.resetValues = function () {
  this.title = '';
  this.mediaPlayhead = 0;
  this.duration = 0;
  this.playhead = 0;
};
