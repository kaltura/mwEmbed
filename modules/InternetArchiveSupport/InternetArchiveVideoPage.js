/**
* EmbedPlayer loader
*/
/**
* Default player module configuration
*/

mw.IA =
{
  playingClipNumMW:0,
  flowplayerplaylist:null,
  VIDEO_WIDTH:640,
  VIDEO_HEIGHT:480,



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
    mw.log(ary);
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
    var els = this.flowplayerplaylist.getElementsByTagName("img");
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
      // this means we are in a context like /embed/
      mw.setConfig( {
        'EmbedPlayer.EnabledOptionsMenuItems':
        ['playerSelect','share','aboutPlayerLibrary']
      });
    }


    var player = $('#mwplayer');
    if (!player)
      return;


    mw.log('newEmbedPlayerMW()');
    player.bind('ended', mw.IA.onDoneMW);
    player.unbind('play').bind('play', mw.IA.firstplayMW);
    player.bind('pause', mw.IA.pause);

    player.bind('onCloseFullScreen', function(){ setTimeout(function() { mw.IA.resizeMW(); }, 500); }); //xxx timeout lameness
  },


  pause:function()
  {
    mw.log('paused');
    return; //xxxx not quite ready for hash yet

    location.hash = '#' + IAD.playlist[mw.IA.playingClipNumMW]['ORIG'] +
      '/start=' + Math.round($('#mwplayer').get(0).currentTime * 10) / 10;
  },


  resizeMW:function()
  {
    var player = $('#mwplayer');

    $('#flowplayerdiv').css('width',  this.VIDEO_WIDTH);
    $('#flowplayerdiv').css('height', this.VIDEO_HEIGHT);

    $('#flowplayerplaylist').css('width', this.VIDEO_WIDTH);

    var jplay = player[0];
    IAD.log('IA ' + jplay.getWidth() + 'x' + jplay.getHeight());

    jplay.resizePlayer({'width':  this.VIDEO_WIDTH,
      'height': this.VIDEO_HEIGHT},true);
  },


  firstplayMW:function()
  {
    if (typeof(mw.IA.MWsetup)!='undefined')
      return;
    mw.IA.MWsetup = true;

    mw.log('firstplayMW()');
    mw.IA.resizeMW();
  },


  playClipMW:function(idx)
  {
    mw.IA.playingClipNumMW = idx;
    mw.log('IA play: ('+idx+')');
    if (typeof(IAD)=='undefined'  ||  typeof(IAD.playlist[idx])=='undefined')
      return;

    var group = IAD.playlist[idx];
    mw.log(group);

    // set things up so we can update the "playing triangle"
    this.flowplayerplaylist = $('#flowplayerplaylist')[0];
    this.indicateIsPlaying(idx);

    // location.hash = '#' + group['ORIG']; //xxxx not quite ready yet

    mw.ready(function(){

      var player = $('#mwplayer'); // <div id="mwplayer"><video ...></div>
      if (!player)
        return;

      var prefix = '/download/'+IAD.identifier+'/';
      var sources = [];
      for (var i=0, source; source=group['SRC'][i]; i++)
        sources.push({'src':prefix + source});
      mw.log(sources);
      player.embedPlayer(
        { 'autoplay':true, 'autoPlay':true, 'sources':sources
        // ,'poster': (group['POSTER'] ? prefix + group['POSTER'] : '/images/glogo.png')
        });
    });

    return false;
  },


  onDoneMW:function(event, onDoneActionObject )
  {
    mw.IA.playingClipNumMW++;
    mw.IA.playClipMW(mw.IA.playingClipNumMW);
  },





  setup: function() {
    mw.IA.css(".archive-icon {\n\
background-image:url('http://www.archive.org/images/logo-mw.png') !important;\n\
background-repeat:no-repeat;\n\
display: block;\n\
height: 12px;\n\
width: 12px;\n\
margin-top: -6px !important;\n\
margin-left: 3px !important;\n\
}\n\
\n\
div.control-bar { -moz-border-radius:6px; -webkit-border-radius:6px; -khtml-border-radius:6px; border-radius:6px; }\n\
\n\
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
          'class' : 'archive-icon'
        }
      });




    // NOTE: keep this outside "mw.ready()" so that "click-to-play" does indeed
    // cause the newEmbedPlayerMW() call
    $( mw ).bind('newEmbedPlayerEvent', mw.IA.newEmbedPlayerMW);

    mw.ready(function(){
        var hash = unescape(location.hash);
        mw.log("IA Player says mw.ready()" + hash);


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
          mw.IA.resizeMW();
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
