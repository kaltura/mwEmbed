## Library Overview

[html5]: https://developer.mozilla.org/En/Using_audio_and_video_in_FireFox
[KDP3]: http://www.kaltura.org/project/Video_Player_Playlist_Widget

__Kaltura's HTML5 Media Library__ enables you to take advantage of the [html5 `<video>` and `<audio>` tags][html5] today with a consistent player interface across all major browsers including Internet Explorer. 

The library supports a seamless fallback with Flash based playback using [Kaltura's Flash player][KDP3] or Java Cortado for browsers that don't yet feature HTML5 video & audio support.  Upon detection of the client browser, the __Kaltura HTML5 Media Library__ chooses the right codec to use (specified in the source attributes, or available from a Kaltura server) and the right player to display.  So whether you're using flash, h264, ogg-theora, or WebM -- Kaltura's library will make sure it is played on all browsers with the same UI.
While support for HTML5 video is growing, there is large percentage of the web browser market that is presently best served by the Adobe Flash plugin and an associated player. A base component of the Kaltura HTML5 javascript library bridges this gap, by cascading to an underlining Flash player in browsers that do not support the native HTML5 video player. In addition, Kaltura's player maintains a unified look & feel across formats and browsers.


## Release Notes

Release Notes are stored on the [html5video.org wiki](http://html5video.org/wiki/Kaltura_HTML5_Release_Notes)

## Documentation

Library documentation for installation, configuration, and usage is maintained on the [html5video.org wiki](http://html5video.org/wiki/Category:Kaltura_HTML5_Video_Library_Documentation)

## Library Features

* <a title="HTML5 Video Player with jQueryUI theme support" href="http://www.kaltura.org/apis/html5lib/kplayer-examples/Player_Fallback.html" rel="lightframe[|width:550px; height:650px; scrolling: auto;]">Video Player</a>
* <a title="HTML5 Audio Player with jQueryUI theme support" href="http://www.kaltura.org/apis/html5lib/mwEmbed/tests/Player_Audio.html" rel="lightframe[|width:500px; height:500px; scrolling: auto;]">Audio Player</a>
* __Cross browser & Format compatibility__ 
  * Will work on all major browsers, and with any online supported video format. 
  * Gracefully identifys the best playback engine (Native HTML5, Flash, VLC or Java Cortado) for your settings and video format.
* __Easy to skin__ <a title="HTML5 Video Player with jQueryUI theme support" target="_blank" href="http://www.kaltura.org/apis/html5lib/kplayer-examples/Player_Themable.html">see live demo</a>]
  * Based on HTML, CSS and jQuery, skinning is amazingly easy and flexible. No need external or compiled resources (like Flash), or complicated development environments. 
  * Skin and Theme are consistent through all UI and playback engines. Built in support for for the jquery Theme Roller for easy theming.
* __Easy to Extend, Javascript modules__ - Quick, clean and easy way of extending. Write once and the code will be compatible with all browsers and all playback engines. 
* __Javascript libraries for web applications__ that allow much more then simple playback. Create a full featured web-video experience i
  * <a title="HTML5 with jQueryUI content ingestion wizard" href="http://www.kaltura.org/apis/html5lib/kplayer-examples/Add_Media_Wizard.html" rel="lightframe[|width:850px; height:500px; scrolling: auto;]">Import and upload wizard</a>
  * <a title="HTML5 with jQueryUI online video editor" href="http://www.kaltura.org/apis/html5lib/mwEmbed/tests/Sequence_Editor.html" rel="lightframe[|width:900px; height:700px; scrolling: auto;]">Video Editor</a>
  * <a title="FireOgg integration - Client Side Transcoding" href="http://www.kaltura.org/apis/html5lib/mwEmbed/example_usage/Firefogg_Make_Advanced.html" rel="lightframe[|width:550px; height:650px; scrolling: auto;]">Client Side Encoding (FireOgg)</a>
* __Easy to integrate__ - Integrate to any existing web CMS, pre-integrated into Media Wiki (powering Wikipedia, MetaVid).
* __Kaltura's HTML5 Media Library__ is built on [jQuery](http://jquery.com/) and [jQueryUI](http://jqueryui.com/) so it's easy to theme, customize and extend.
* supports the royalty free, patent unencumbered open media formats [ogg theora/vorbis](http://xiph.org/).
  * This enables websites to distribute video without [future content distribution costs](http://mpegla.com/news/n_03-11-17_avc.html) associated with the h.264 codec. With theora sporting [similar qualities](http://people.xiph.org/%7Egreg/video/ytcompare/comparison.html) at web bitrates its a win win to start adoption ogg!
  * If your already distributing h.264 formats, __mwEmbed__ supports a smooth transition with fallback to h.264 sources with the same html/css interface player skin as the ogg content.
* supports emerging subtitles and timed text formats for future prof accessibility.
* includes an easy to integrate free license asset search system for grabbing free content from repositories such as the [Internet Archive](http://www.archive.org/index.php), [Wikimedia Commons](http://commons.wikimedia.org/wiki/Main_Page), and [Flickr](http://www.flickr.com/). This lets you integrate quick access to freely reusable illustrative image or short web clip for your web app.
* includes components for flexible client side transcoding of assets via the [Firefogg](http://firefogg.org/) browser extension. Firefogg integration lets video sites avoid intermediary transcode formats for user contributed media, distribute transcode costs, and lets the website provide specific transcoding settings directly to the client at the point of upload.
* Integrated into Kaltura Video Platform based on the Kaltura JS Client library
  * Analytics Support
  * Advertisement Support

## Basic Usage

## Using Kaltura SaaS for Video Transcoding

To use html5 video flavors from your Kaltura account, you need only to include a `kentryid` attribute in yout `<video>` tag.  The library will automatically select the appropriate video flavors for your visitors devices (make sure you have contacted support and requested that [html5 video flavors](#codecs) be added to your account)

    <!DOCTYPE html>
    <html>
    <head>
      <script type="text/javascript" src="http://html5.kaltura.org/js" > </script> 
    </head>
    <body>
      <video kentryid="0_swup5zao"
        kwidgetid="_243342"></video>
    </body>
    </html>

## Hosting Your Own Video Transcodes

Using __Kaltura's HTML5 Media Library__ in your own applications is as simple as adding a script include of the library javascript, `http://html5.kaltura.org/js` and then using the normal html5 video tag, ie `<video src="myOgg.ogg">`.

Putting it all together your embed page should look something like this:

    <!DOCTYPE html>
    <html>
    <head>
      <script type="text/javascript" src="http://html5.kaltura.org/js" > </script> 
    </head>
    <body>
      <video id="video" style="width:544px;height:304px;" 
        poster="http://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Elephants_Dream.ogg/seek%3D13-Elephants_Dream.ogg.jpg"
        duration="10:53" 
        linkback="http://www.elephantsdream.org/" >
        <source type="video/ogg" src="http://www.archive.org/download/ElephantsDream/ed_1024.ogv" >
        <source type="video/h264" src="http://www.archive.org/download/ElephantsDream/ed_hd_512kb.mp4" >
        <track kind="subtitles" id="video_af" srclang="af" 
             src="media/elephants_dream/elephant.afrikaans.srt"></track>
        <track kind="subtitles" id="video_en" srclang="en"  
             src="media/elephants_dream/elephant.english.srt"></track> 
      </video>
    </body>
    </html>

* For best compatibility: we include the poster, durationHint, width and height attributes. This way browsers such as IE can display the player interface with poster image at the correct resolution with a duration in the user interface.
* If you would like to support html5 with h.264 ( safari, IE9, google chrome) and support a flash fallback for older versions of IE you include an h.264 source. For best compatibility your mp4 source should ideally use a h.264 profile compatible with mobile devices such as the iPhone.  <a href="http://corp.kaltura.com/">Kaltura hosted Solutions</a> include iPhone support. Desktop video encoding software such as <a href="http://handbrake.fr/">handbrake</a> also includes iPhone profiles. 
* If you would like to change the theme you can change the class attribute `<video class="kskin">` more info about custom theming is on the way. 


## Advanced Examples

## MediaRSS Playlists

## Fall Forward from Flash to html5 for iOS and Android Support

__Kaltura's HTML5 Video Library__ may be installed in conjunction with existing flash video integrations to provide fall forward from flash to html5 to enable video embedding for iPhone and iPad.

Installing html5 support to an existing Kaltura integration is as simple as adding a javascript tag to include `http://html5.kaltura.org/js`.  The library will automatically replace your Flash embed with an html5 `<video>` element on browsers capable of parsing the tag.

    <!DOCTYPE html>
    <html>
    <head>
      <title>Fall forward from Flash to html5</title>
      <script type="text/javascript" src="http://html5.kaltura.org/js"></script>
    </head>
    <body>
      <h2>Fall forward from Flash to html5</h2>
      <object id="kaltura_player" name="kaltura_player"
        type="application/x-shockwave-flash"
        allowFullScreen="true" allowNetworking="all"
        allowScriptAccess="always" height="330" width="400"
        data="http://www.kaltura.com/index.php/kwidget/cache_st/1274763304/wid/_243342/uiconf_id/48501/entry_id/0_swup5zao">
        <param name="allowFullScreen" value="true" />
        <param name="allowNetworking" value="all" />
        <param name="allowScriptAccess" value="always" />
        <param name="bgcolor" value="#000000" />
        <param name="flashVars" value="&" />
        <param name="movie" value="http://www.kaltura.com/index.php/kwidget/cache_st/1274763304/wid/_243342/uiconf_id/48501/entry_id/0_swup5zao" />
      </object>
    </body>
    </html>

## Themeing with jQuery-UI

You can add a custom jquery ui theme by using the theme wizard: [http://www.kaltura.org/apis/html5lib/kplayer-examples/Player_Themable.html](http://www.kaltura.org/apis/html5lib/kplayer-examples/Player_Themable.html). Note that although the themeroller only works in Firefox, the temes you create with it will work in multiple browsers.


## Skinning and Themeing

[Theme Wizard]: http://www.kaltura.org/apis/html5lib/kplayer-examples/Player_Themable.html

You can add a custom jquery ui theme by using the [Theme Wizard][].  Downloading that theme and adding a reference to jquery-ui-.custom.css after the mwEmbed-player-static.css file.

A few sample jquery ui skins are included in the skins/jquery.ui.themes folder of the [HTML5 Video Player][].

You can remove the kaltura attribution for the player by adding the following javascript:

    <script type="text/javascript">mw.setConfig('EmbedPlayer.kalturaAttribution', false );</script>

You can remove the kaltura attribution for the player by adding the following javascript: 

    <script type="text/javascript">mw.setConfig('EmbedPlayer.kalturaAttribution', false );</script>

## Analytics

## Subtitles


## Basic Usage of MIT Licensed Static Compiled HTML5 Video Player

[HTML5 Media Library]: http://www.kaltura.org/project/HTML5_Video_Media_JavaScript_Library
[HTML5 Video Player]: http://www.kaltura.org/project/HTML5_Video_Player

### Notes on Optimization

mwEmbed is designed to be used with a script-loader and this static package sacrifices transport size and packages in code every client won't use, in order to be a single static file.  You can learn more about using mwEmbed with a script-loader on the project home page. 

To use the load optimized [HTML5 Media Library][] replace your mwEmbed script include line of `<head>` with:

    <script type="text/javascript" src="http://html5.kaltura.org/js" ></script>

For full un-minified source see [HTML5 Video Player][]

### Basic Usage

In the `<head>` of your page you will need jQuery and the mwEmbed-player package:

    <!-- If your page already includes jQuery you can skip this step -->
    <script type="text/javascript" src="kaltura-html5player-widget/jquery-1.4.2.min.js" ></scirpt>

    <!-- Include the css and javascript  -->
    <link rel="stylesheet" href="kaltura-html5player-widget/skins/jquery.ui.themes/jquery-ui-1.7.2.custom.css"></link> 
    <link rel="stylesheet" href="kaltura-html5player-widget/mwEmbed-player-static.css"></link> 
    <script type="text/javascript" src="kaltura-html5player-widget/mwEmbed-player-static.js"></scirpt>

Now in your HTML you can use the video tag and it will be given a user interface ie: 

    <video poster="myPoster.jpg" style="width:400px;height:300px" durationHint="32.2" >
      <source src="myH.264.mp4" />
      <source src="myOgg.ogg" />
    </video>
<h1 id="troubleshooting">Troubleshooting</h1>

<h2 id="codecs">Video Codecs</h2>

You will need to encode your video files into multiple codec formats to provide video for device platforms like iPhone, iPad, Android, and Blackberry.  [Dive into HTML5](http://diveintohtml5.org/video.html#firefogg) provides an excellent reference for encoding these multiple video formats with [Firefogg](http://firefogg.org/) , FFmpeg, and Handbrake.

If you would prefer to not have to deal with encoding your videos into multiple formats, you should obtain a trial account with [Kaltura](http://corp.kaltura.com/) and request a support technician setup your account to provide html5 flavored video codecs.

<h2 id="mime">HTML5 video MIME type</h2>

Note that if the MIME types for Theora video are not set on the server, the video may not show or show a gray box containing an X (if JavaScript is enabled).

You can fix this problem for the Apache Web Server by adding the extension used by Theora video files (".ogm", ".ogv", or ".ogg" are the common types) to the MIME type "video/ogg" via the "mime.types" file:

* Edit the mime.types apache configuration file (in "/etc/apache" on linux, "\xampp\apache\conf\mime.types" on windows-xampp)
* Search for `application/ogg     ogg` (if not exist skip this step), delete this line
* Add the following: `video/ogg     ogg ogm ogv`
* Restart apache

Or by adding the "AddType" configuration directive in httpd.conf - 

    AddType video/ogg .ogm
    AddType video/ogg .ogv
    AddType video/ogg .ogg
    AddType video/mp4 .mp4
    AddType video/webm .webm

Your web host may provide an easy interface to MIME type configuration changes for new technologies until a global update naturally occurs.
<h1 id="background">Background</h1>

This project started as a part of the MediaWiki HTML5 media functionality project.  *mwEmbed* is another name by which *Kaltura's HTML5 Media Library* is known at Wikimedia, where it provides Wikipedia's upcoming video editing functionality.

*mwEmbed* provides the basis for other MediaWiki media functionality. For more info see <a href="http://www.mediawiki.org/wiki/Media_Projects_Overview">the projects overview on MediaWiki</a> and the associated integration (currently called <a href="http://www.mediawiki.org/wiki/JS2_Overview">js2</a>) 

# Become a Developer

If you find this software useful, stop by #kaltura in FreeNode.

<h2 id="compile_docs">Compile Developer Docs</h2>

    java -jar jsrun.jar app/run.js /home/papyromancer/src/mwEmbed/loader.js /home/papyromancer/src/mwEmbed/mwEmbed.js /home/papyromancer/src/mwEmbed/mwEmbedLoader.js /home/papyromancer/src/mwEmbed/modules/**/*/*.js -t=templates/jsdoc


    cat overview.markdown features.markdown basic_usage.markdown advanced_examples.markdown mit.markdown troubleshooting.markdown showcase.markdown license.markdown > README
    cat overview.markdown features.markdown basic_usage.markdown mit.markdown troubleshooting.markdown showcase.markdown > README.mit
    bluecloth README > docs/README.html

<h2 id="additionally">Additional Resources</h2>

For an overview of all mwEmbed files see: [http://www.mediawiki.org/wiki/MwEmbed](http://www.mediawiki.org/wiki/MwEmbed)

For stand alone usage see [http://kaltura.org/project/HTML5_Media_JavaScript_Library](http://kaltura.org/project/HTML5_Media_JavaScript_Library)


## Library Showcase

* <a title="HTML5 Video Player with jQueryUI theme support" href="http://www.kaltura.org/apis/html5lib/kplayer-examples/Player_Themeable.html" rel="lightframe[|width:550px; height:650px; scrolling: auto;]">Video Player Theme Wizard</a>
* <a title="HTML5 Video Player with jQueryUI theme support" href="http://www.kaltura.org/apis/html5lib/kplayer-examples/Add_Media_Wizard.html" rel="lightframe[|width:550px; height:650px; scrolling: auto;]">Add Media Wizard</a>
* <a title="HTML5 Video Player with jQueryUI theme support" href="http://www.kaltura.org/apis/html5lib/kplayer-examples/Player_ApiDemo.html" rel="lightframe[|width:550px; height:650px; scrolling: auto;]">Player API Demo</a>
* <a title="HTML5 Video Player with jQueryUI theme support" href="http://www.kaltura.org/apis/html5lib/kplayer-examples/Player_Audio.html" rel="lightframe[|width:550px; height:650px; scrolling: auto;]">Audio Player</a>
* <a title="HTML5 Video Player with jQueryUI theme support" href="http://www.kaltura.org/apis/html5lib/kplayer-examples/Player_DynamicEmbed.html" rel="lightframe[|width:550px; height:650px; scrolling: auto;]">Dynamic Embed</a>
* <a title="HTML5 Video Player with jQueryUI theme support" href="http://www.kaltura.org/apis/html5lib/kplayer-examples/Player_Fallback.html" rel="lightframe[|width:550px; height:650px; scrolling: auto;]">Flash Fallback Player</a>
* <a title="HTML5 Video Player with jQueryUI theme support" href="http://www.kaltura.org/apis/html5lib/kplayer-examples/Player_FallForward.html" rel="lightframe[|width:550px; height:650px; scrolling: auto;]">Fall Forward from Flash to HTML5</a>
* <a title="HTML5 Video Player with jQueryUI theme support" href="http://www.kaltura.org/apis/html5lib/kplayer-examples/Player_IpadHTMLControls.html" rel="lightframe[|width:550px; height:650px; scrolling: auto;]">iPad Video Player</a>
* <a title="HTML5 Video Player with jQueryUI theme support" href="http://www.kaltura.org/apis/html5lib/kplayer-examples/Player_Fallback.html" rel="lightframe[|width:550px; height:650px; scrolling: auto;]">iPad Video Player With Native Controls</a>
* <a title="HTML5 Video Player with jQueryUI theme support" href="http://www.kaltura.org/apis/html5lib/kplayer-examples/Player_IpadTouchMashup.html" rel="lightframe[|width:550px; height:650px; scrolling: auto;]">Using iPad Touch Interface</a>
* <a title="HTML5 Video Player with jQueryUI theme support" href="http://www.kaltura.org/apis/html5lib/kplayer-examples/Player_kEntryId.html" rel="lightframe[|width:550px; height:650px; scrolling: auto;]">Video Player from Kaltura EntryID</a>
* <a title="HTML5 Video Player with jQueryUI theme support" href="http://www.kaltura.org/apis/html5lib/kplayer-examples/Player_MultipleFallForwardEmbeds.html" rel="lightframe[|width:550px; height:650px; scrolling: auto;]">Multiple Fall Forward Embeds</a>
* <a title="HTML5 Video Player with jQueryUI theme support" href="http://www.kaltura.org/apis/html5lib/kplayer-examples/Player_NativeControls.html" rel="lightframe[|width:550px; height:650px; scrolling: auto;]">Native HTML5 Video Controls</a>
* <a title="HTML5 Video Player with jQueryUI theme support" href="http://www.kaltura.org/apis/html5lib/kplayer-examples/Player_SwfObjectEmbed.html" rel="lightframe[|width:550px; height:650px; scrolling: auto;]">Video Player Embed of SWF Animation</a>
* Unemplimented
  * <a title="HTML5 Video Player with jQueryUI theme support" href="http://www.kaltura.org/apis/html5lib/kplayer-examples/Player_PlaylistFallForward.html" rel="lightframe[|width:550px; height:650px; scrolling: auto;]">Playlist Fall Forward</a>
  * <a title="HTML5 Video Player with jQueryUI theme support" href="http://www.kaltura.org/apis/html5lib/kplayer-examples/Player_Fallback.html" rel="lightframe[|width:550px; height:650px; scrolling: auto;]">Video Player from Swarm Hosted Media</a>

<h1 id="license">License and Copyright Information</h1>

All mwEmbed code is Released under the GPL2 as a stand alone component of mediaWiki

Libraries used include their license info in their included path 

Copyright (C) 2007 - 2010 Kaltura, Wikimedia Foundation

Sub modules and libraries carry specific copyright while the the entire package is always releasable under the GPL 2

Author Michael Dale <mdale@wikimedia.org>, and many others.

This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 2 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program; if not, write to the Free Software Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.

[http://www.gnu.org/copyleft/gpl.html](http://www.gnu.org/copyleft/gpl.html)
