/**
* EmbedPlayer loader
*/
/**
* Default player module configuration
*/

mw.IA =
{
  VIDEO_WIDTH:640,
  VIDEO_HEIGHT:480,
  VIDEO_PLAYLIST_HEIGHT:80,
  
  playingClipNumMW:0,
  video:true, //false means we are audio


  css:function(str)
  {
    var obj = document.createElement('style');
    obj.setAttribute('type', 'text/css');
    if (obj.styleSheet)
      obj.styleSheet.cssText = str; //MSIE
    else
      obj.appendChild(document.createTextNode(str)); // other browsers

    var headobj = document.getElementsByTagName("head")[0];
    headobj.appendChild(obj);
  },


  argin:function(theArgName, ary)
  {
    r = '';
    for (var i=0; i < ary.length; i++)
    {
      if (ary[i].slice(0,ary[i].indexOf('=')) == theArgName)
      {
        r = ary[i].slice(ary[i].indexOf('=')+1);
        break;
      }
    }
    return (r.length > 0 ? unescape(r).split(',') : '');
  },

  // parse a CGI arg
  arg:function(theArgName)
  {
    var ary = location.search.slice(1).split('&');
    mw.IA.log(ary);
    return this.argin(theArgName, ary);
  },


  // try to parse the identifier from the video and make the lower right icon
  // then go to the item's /details/ page
  detailsLink:function()
  {
    if (typeof(location.pathname)!='undefined'  &&
        location.pathname.length>0  &&
        location.pathname.match(/^\/details\//))
    {
      return '/details/'+location.pathname.replace(/^\/details\/([^\/]+).*$/,
                                                   '$1');
    }
    if (typeof(location.pathname)!='undefined'  &&
        location.pathname.length>0  &&
        location.pathname.match(/^\/embed\//))
    {
      return '/details/'+location.pathname.replace(/^\/embed\/([^\/]+).*$/,
                                                   '$1');
    }
    return '';
  },


  embedUrl:function()
  {
    return ('http://www.archive.org/embed/' +
            mw.IA.detailsLink().replace(/\/details\//,''));
  },


  embedCode:function()
  {
    return ('&lt;iframe src=&quot;' +
            mw.escapeQuotesHTML( mw.IA.embedUrl() ) + '&quot; ' +
            'width=&quot;' + mw.IA.VIDEO_WIDTH +'&quot; ' +
            'height=&quot;' + mw.IA.VIDEO_HEIGHT + '&quot; ' +
            'frameborder=&quot;0&quot; ' +
            '&gt;&lt/iframe&gt;');
  },


  // marks the playlist row for the video that is playing w/ orange triangle
  indicateIsPlaying:function(clipnum)
  {
    var flowplayerplaylist = $('#flowplayerplaylist')[0];
    var els = flowplayerplaylist.getElementsByTagName("img");
    for (var i=0; i < els.length; i++)
      els[i].style.visibility = (i==clipnum ? 'visible' : 'hidden');
  },


  // Set up so that:
  //   - when "click to play" clicked, resize video window and playlist
  //   - we advance to the next clip (when 2+ present)
  newEmbedPlayerMW:function(arg)
  {
    if (typeof($('#iframeVidso').get(0)) != 'undefined')
    {
      mw.setConfig( {
        'EmbedPlayer.EnabledOptionsMenuItems':
        ['playerSelect','share','aboutPlayerLibrary']
      });
    }


    // Now put a nice looking "track number" in front of each playlist entry title
    $('div.playlistItem span.clipTitle').html(function(i,html) {
      return html.replace(/^(\d+)(.*)/, '<span class="tn">$1</span>$2');
    });    
    
    
    var player = $('#mwplayer');
    if (!player)
      return;

    mw.IA.log('newEmbedPlayerMW()');


    if (typeof(IAD)!='undefined'  &&
        typeof(IAD.playlist)!='undefined'  &&
        IAD.playlist.length > 0)
    {
      var check = IAD.playlist[0].SRC[0];
      var suffix = check.substr(check.length-4).toLowerCase();
      if (suffix=='.mp3'  ||  suffix=='.ogg')
      {
        mw.IA.log('this is audio!');
        mw.IA.video = false;
      }
      else
      {
        mw.IA.log('this is video!');
        mw.IA.video = true;

        player.unbind('play').bind('play', mw.IA.play);
        player.bind('ended', mw.IA.ended);
        
        player.bind('pause', mw.IA.pause);
        if (!mw.isMobileDevice())
player.bind('onCloseFullScreen', function(){ setTimeout(function() { mw.IA.resize(); }, 500); }); //xxx timeout lameness
      }
    }
  },


  pause:function()
  {
    mw.IA.log('paused');
    return; //xxxx not quite ready for hash yet

    location.hash = '#' + // [get ORIG video file from playlist item and then matched back thru IAD.playlist, etc.?]  +
      '/start=' + Math.round($('#mwplayer').get(0).currentTime * 10) / 10;
  },


  resize:function()
  {
    if (mw.isMobileDevice())
      return;
    
    mw.IA.log('resize');

    $('#avplaydiv').css('width',  this.VIDEO_WIDTH);

    $('#mwplayer').css('width',  this.VIDEO_WIDTH);
    $('#mwplayer').css('height', this.VIDEO_HEIGHT + this.VIDEO_PLAYLIST_HEIGHT);

    $('#mwplayer_videolist').css('top',this.VIDEO_HEIGHT);
    
    var tmp=$('div.mv-player video, div.mv-player object, div.mv-player embed').parent().get(0);
    if (typeof(tmp)!='undefined')
    {
      tmp.resizePlayer({'width': this.VIDEO_WIDTH,
                        'height':this.VIDEO_HEIGHT},true);
    }
  },


  play:function()
  {
    mw.IA.log('play()');

    if (!mw.IA.video)
      return;

    mw.IA.resize();
  },


  playClipMW:function(idx)
  {
    mw.IA.playingClipNumMW = idx;
    mw.IA.log('IA play: ('+idx+')');
    if (typeof(IAD)=='undefined'  ||  typeof(IAD.playlist[idx])=='undefined')
      return false;

    var group = IAD.playlist[idx];
    mw.IA.log(group);

    // set things up so we can update the "playing triangle"
    this.indicateIsPlaying(idx);

    // location.hash = '#' + group['ORIG']; //xxxx not quite ready yet

    mw.ready(function(){
      var player = $('#mwplayer').get(0); // <div id="mwplayer"><video ...></div>
      if (!player)
        return false;

      var prefix = '/download/'+IAD.identifier+'/';
      player.stop();
      player.emptySources();
      if (mw.IA.video)
      {
        player.updatePosterSrc( typeof(group['POSTER'])!='undefined' ?
                                prefix + group['POSTER'] :
                                '/images/glogo.png' );
      }

      for (var i=0, source; source=group['SRC'][i]; i++)
      {
    	if( source )
        {
          var attrs = {'src' : prefix + source};
          var ending = source.substr(source.length-4).toLowerCase();
          if (ending=='.mp4'  ||  ending=='.ogv')
            attrs['URLTimeEncoding'] = true;
	  player.mediaElement.tryAddSource(
	    $('<source />')
	      .attr( attrs )
	      .get( 0 )
	  );
    	}
      }
      player.stop();
               
mw.IA.log(group['LENGTH']);
player.duration = group['LENGTH'];
player.buffered = 0;
player.bufferStartFlag = false;
player.bufferEndFlag = false;
player.attributes['duration']=group['LENGTH'];
player.mediaElement.updateSourceTimes(group['LENGTH']);
               
      player.setupSourcePlayer( function(){
    	setTimeout(function(){
    	  player.play();
    	},100);
      });
    });

    return false;
  },


  ended:function(event, onDoneActionObject )
  {
    mw.IA.log('ended');
    //mw.IA.playingClipNumMW++;
    //mw.IA.playClipMW(mw.IA.playingClipNumMW);
  },


  log:function(str)
  {
    if ( typeof(console) !='undefined' )
      mw.log('      ---IA------------------------------>   '+str);
  },



  setup: function() {
    
    mw.IA.css("\n\
audio { z-index:666 !important; position:absolute !important; bottom:0px !important; } \n\
\n\
\n\
\n\
div#mwplayer_videolist { bottom:0px !important; right:0px !important; }\n\
div.playlistItem {\n\
  font-family:Lucida Grande;\n\
  margin:0px 5px 0px 5px !important;\n\
}\n\
div.playlist-title { display:none; }\n\
div.playlistItem img { display:none; }\n\
div.playlistItem span.clipTitle     { padding-left:15px; }\n\
div.playlistItem span.tn            { display:inline-block; width:25px; text-align:right; padding-right:5px; border-right:1px solid gray; }\n\
div.playlistItem div.clipDuration  { padding-right:20px; padding-top:1px; }\n\
div.movies div.playlistItem div.clipDuration  { display:none; }\n\
div.ui-state-active {\n\
  background-image:url(/images/orange_arrow.gif) !important;\n\
  background-position:10px 2px !important;\n\
  background-repeat:no-repeat !important;\n\
}\n\
\n\
.archive-icon {\n\
background-image:url('http://www.archive.org/images/logo-mw.png') !important;\n\
background-repeat:no-repeat;\n\
display: block;\n\
height: 12px;\n\
width: 12px;\n\
margin-left: 3px !important;\n\
}\n\
\n\
div.control-bar { -moz-border-radius:6px; -webkit-border-radius:6px; -khtml-border-radius:6px; border-radius:6px; }\n\
\n\
\n\
\n\
div.movies div.media-rss-video-list { background-image:url(/logos/hires/ia-tight-60x60-one-third-opacity.png); background-position:bottom; background-repeat:no-repeat; }\n\
div.maudio div.media-rss-video-list { background-image:url(/logos/hires/ia-tight-240x240-one-third-opacity.png); background-position:bottom; background-repeat:no-repeat; }\n\
div.maudio div.fullscreen-btn { display:none !important; }\n\
div.maudio img.playerPoster   { display:none; } \n\
div.maudio div.play-btn-large { display:none; } \n\
div.maudio div.media-rss-video-player { height:26px !important; } \n\
div.maudio div.mrss_mwplayer_0 { height:26px !important; } \n\
div.maudio div.mv-player  { height:26px !important; } \n\
div.maudio div.control-bar { display:block !important; } \n\
\n\
\n\
\n\
\n\
div.overlay-content { background-color:#666 !important; } \n\
div.overlay-content div h2 { background-color:transparent; }\n\
div.overlay-content        {\n\
  padding-top:0px !important; \n\
  border: 1px solid #666; \n\
  -moz-border-radius: 10px;\n\
  -webkit-border-radius:10px;\n\
  -khtml-border-radius:10px;\n\
  border-radius: 10px;\n\
}\n\
.mv-player .overlay-win textarea { height:60px !important; }\n\
");

    
    var det = mw.IA.detailsLink();

    if (det == ''  &&  typeof(document.getElementsByTagName)!='undefined')
    {
      var els = document.getElementsByTagName('object');
      if (els  &&  els.length)
      {
        var i=0;
        for (i=0; i < els.length; i++)
        {
          var el = els[i];
          if (typeof(el.data)!='undefined')
          {
            var mat = el.data.match(/\.archive.org\/download\/([^\/]+)/);
            if (typeof(mat)!='undefined'  &&  mat  &&  mat.length>1)
            {
              det = '/details/' + mat[1]; //xxx not working yet for embed codes!!
              break;
            }
          }
        }
      }
    }


    mw.setConfig( {
        // We want our video player to attribute something...
        "EmbedPlayer.AttributionButton" : true,

        'Mw.UserPreferenceExpireDays' : 90,

        // Our attribution button
        'EmbedPlayer.AttributionButton' : {
          'title' : 'Internet Archive',
          'href' : 'http://www.archive.org'+det,
          'class' : 'archive-icon',
          
        'Playlist.TitleLength': 38
        }
      });

    if (!mw.isMobileDevice())
      mw.setConfig({'Playlist.ShowScrollButtons':false});



    // NOTE: keep this outside "mw.ready()" so that "click-to-play" does indeed
    // cause the newEmbedPlayerMW() call
    $( mw ).bind('newEmbedPlayerEvent', mw.IA.newEmbedPlayerMW);

    mw.ready(function(){
        var hash = unescape(location.hash);
        mw.IA.log("IA Player says mw.ready()" + hash);


        var star = (mw.IA.arg('start') ? parseFloat(mw.IA.arg('start')) : 0);
        if (!star)
        {
          // look for: /details/drake_saga1_shots/MVI_3986.AVI/start=13
          var a = location.pathname.split('/');
          star=(mw.IA.argin('start',a) ? parseFloat(mw.IA.argin('start',a)) : 0);
        }
        if (!star)
        {
          // look for: /details/drake_saga1_shots/MVI_3986.AVI#start=13
          var a = location.hash.slice(1).split('/');
          star=(mw.IA.argin('start',a) ? parseFloat(mw.IA.argin('start',a)) : 0);
        }
        if (star)
        {
          mw.IA.resize();
          var jplay = $('#mwplayer').get(0);
          var dura = jplay.duration;
          IAD.log(star+'s of '+dura+'s');

          jplay.currentTime = star;
          jplay.play();
        }
      });
  }
};

mw.IA.setup();
