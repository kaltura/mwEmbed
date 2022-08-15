(function (mw, $) {
    "use strict";

    mw.PluginManager.add(
        "vrAppLauncher",
        mw.KBaseComponent.extend({
            defaultConfig: {
              parent: mw.isMobileDevice()
                ? "topBarContainer"
                : "controlsContainer",
              order: 53,
              displayImportance: "low",
              align: "right",
              smartContainer: "morePlugins",
              smartContainerCloseEvent: "openVrApp",
              showTooltip: true,
              title: "VR",
              newWindowURLFormat: "VRviewer:-json$-mode$Video360$-videoName${KalturaCdnUrl}/p/103/sp/10300/playManifest/entryId/{entryID}/tags/source/format/download/protocol/http/{fileName}.mp4"
            },
            isSafeEnviornment: function() {
              // when should the plugin load - only when the tag of 'PLAYVR' exits in the entry.
              var entry = this.getPlayer().evaluate('{mediaProxy.entry}');
              var tags = entry ? entry.tags.split(', ') : [];
              var index = tags.findIndex(function (tag) {
                return tag.toLowerCase() === 'playvr';
              });

              return index > -1;
            },
            setup: function () {
                var _this = this;

                this.bind("openVrApp", function () {
                    _this.openVrApp();
                });
            },
            openVrApp: function () {
              var entry = this.getPlayer().evaluate('{mediaProxy.entry}');
              var newWindowURL = this.getConfig("newWindowURLFormat", true);
              var cdnUrl = mw.getConfig('Kaltura.CdnUrl');

              newWindowURL = newWindowURL.replace("{entryID}", entry.id);
              newWindowURL = newWindowURL.replace("{KalturaCdnUrl}", cdnUrl);
              newWindowURL = newWindowURL.replace("{fileName}", encodeURI(entry.name)); // encode in case of spaces

              var win = window.open(newWindowURL, '_self');
              win.focus();
            },
            getComponent: function () {
              if(!this.$el) {
                this.$el = $( '<button />' )
                  .attr("title", this.getConfig("title"))
                  .addClass("btn icon-vr" + this.getCssClass())
                  .click(function() {
                    if (this.isDisabled) return;
                      this.getPlayer().triggerHelper("openVrApp");
                  }.bind(this));
              }
              return this.$el;
            }
        })
    );
})(window.mw, window.jQuery);
