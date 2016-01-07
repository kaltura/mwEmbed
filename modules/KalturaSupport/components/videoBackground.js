(function (mw, $, document) {
  'use strict';

  mw.PluginManager.add('videoBackground', mw.KBasePlugin.extend({
    defaultConfig: {
      backgroundColor: '#000'
    },

    videoElement: null,
    videoElementContainer: null,
    fill: null,
    cropVideo: document.documentMode && document.documentMode > 8,

    setup: function () {
      this.addBindings();
    },

    addBindings: function () {
      var _this = this;

      if (this.cropVideo) {
        this.bind('changeMedia', function () {
          _this.reset();
        });

        this.bind('updateLayout', function () {
          _this.updateVideoSize();
        });
      }

      this.bind('playerReady', function () {
        var videoElement = _this.embedPlayer.getVideoHolder().find('video')[0];
        var videoElementContainer = videoElement.parentNode;
        var backgroundColor = _this.getConfig('backgroundColor');
        $(videoElementContainer).css('background-color', backgroundColor);
        $(videoElement).css('background-color', backgroundColor);

        if (_this.cropVideo) {
          _this.reset();
          _this.videoElement = videoElement;
          _this.videoElementContainer = videoElementContainer;

          videoElement.addEventListener('loadedmetadata', function () {
            _this.updateVideoSize();
          });

          $(videoElement).css({
            'max-width': '100%',
            'max-height': '100%',
            'margin': 'auto',
            'top': '0',
            'left': '0',
            'right': '0',
            'bottom': '0'
          });
        }
      });
    },

    updateVideoSize: function () {
      if (!this.videoElement ||
          !this.videoElement.videoWidth ||
          !this.videoElement.videoHeight) {
        return;
      }

      var aspectRatio = this.videoElement.videoWidth / this.videoElement.videoHeight;
      var aspectRatioContainer = this.videoElementContainer.offsetWidth / this.videoElementContainer.offsetHeight;
      var fill = aspectRatio > aspectRatioContainer ? 'width' : 'height';

      if (fill !== this.fill) {
        this.fill = fill;

        if (aspectRatio > aspectRatioContainer) {
          $(this.videoElement).css({
            'width': '100%',
            'height': 'auto'
          });
        } else {
          $(this.videoElement).css({
            'height': '100%',
            'width': 'auto'
          });
        }
      }
    },

    reset: function () {
      this.videoElement = null;
      this.videoElementContainer = null;
      this.fill = null;
    }
  }));
})(window.mw, window.jQuery, window.document);