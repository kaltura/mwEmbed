## Library Overview 

__Kaltura's HTML5 Media Library__ enables you leverage a unified configuration and development API for both HTML5 and Flash. It enables delivery of rich on page and in player experiences backed by robust metadata and per device asset delivery of the [kaltura platform](http://corp.kaltura.com/). It supports a [wide range of features](http://html5video.org/kaltura-player/docs/), an external and internal plugin model, advanced html5 player, and custom skins. 

## Documentation

Your first stop for kaltura related integration questions should be the [Kaltura HTML5 Configuration](http://html5video.org/wiki/Kaltura_HTML5_Configuration)

Library documentation for installation, configuration, and usage is maintained on the [html5video.org wiki](http://html5video.org/wiki/Category:Kaltura_HTML5_Video_Library_Documentation)

Also you can find us on #kaltura in irc.freeNode.net

Can't find what your looking for in the documentation, ran into an issue check the [Kaltura players official forums](http://forum.kaltura.org/categories/kaltura-players-and-player-plugins). 

## Quick start

* Extract or git clone the mwEmbed folder to your php server. 
* Copy LocalSettings.php.sample to LocalSettings.php
* Navigate to http://{yourServer}/path/to/mwEmbed/docs for player examples. 

## Hacking on mwEmbed

* Pull requests can be sent to <a href="https://github.com/kaltura/mwEmbed/">our git hub repo</a>. Pull requests should be open against the master branch.
* Our coding conventions <a href="http://www.mediawiki.org/wiki/Manual:Coding_conventions/JavaScript">follow mediaWiki js guidelines</a>. 
* See [getting strated guide](http://knowledge.kaltura.com/kaltura-player-toolkit-theme-skin-and-plugins-guide)
* Also see [Yeoman project](https://github.com/kaltura/generator-kalturaplayer-module) for auto generating skeleton kaltura player plugins.  

## Release Notes

[Release Notes ](https://github.com/kaltura/mwEmbed/tags) documents every release and provides production, staging and zip downloads. 

## Libraries and sub-projects

### Kaltura developed

* [Chromless flash kdp](https://github.com/kaltura/chromeless-kdp) 
* [Chromeless sliverlight](https://github.com/kaltura/chromeless-silverlight)
* [OSMF HLS for flash](https://github.com/kaltura/HLS-OSMF) -- repo not yet public
* Android HLS player -- repo not yet public
* [Player Studio](https://github.com/kaltura/player-studio) -- visual player config JSON editor 

### External libraries 

* [Resource Loader](https://www.mediawiki.org/wiki/ResourceLoader)
* [jQuery](http://jquery.com/) 
* [bootstrap](http://getbootstrap.com/) -- for documentation pages
* [Shaka Player](https://github.com/google/shaka-player) -- for project page
* [hls.js](https://github.com/dailymotion/hls.js) -- for project page

## Library Features

The [kaltura player feature hub](http://player.kaltura.com/docs/) hosts most of the libraries features and associated test files.  

## Timed Media Handler

Kaltura HTML5 library is the upstream library for the wikimedia video support in <a href="http://www.mediawiki.org/wiki/Extension:TimedMediaHandler">Timed Media Handler</a>

## License and Copyright Information

All mwEmbed code is released under the AGPLv3 unless a different license for a particular library is specified in the applicable library path

Authors: See [GitHub contributors list](https://github.com/kaltura/mwEmbed/graphs/contributors).

