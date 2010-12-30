/**
* Local Setting file hosts any per site configuration
* 
* This file is automatically included in any resourceLoader or mwEmbed.js request 
* 
* You can put any mw.setConfig('ModuleName.Option', value ) calls in here.  
* 
* In a fresh svn checkout this file will always be empty. 
* 
*/

mw.IA = 
{
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

  // try to parse the identifier from the video and make the lower right icon
  // then go to the item's /details/ page
  detailsLink:function()
  {
    return (typeof(location.pathname)!='undefined'  &&
            location.pathname.length>0  &&
            location.pathname.match(/^\/details\//) ?
            '/details/'+location.pathname.replace(/^\/details\/([^\/]+).*$/, '$1')
            : '');
  },

  embedUrl:function()
  {
    return ('http://www.archive.org/embed/' +
            mw.IA.detailsLink().replace(/\/details\//,''));
  },


  setup:function()
  {
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
    
    
    //var mods = mw.getConfig('enabledModules');
    //mods.push('InternetArchiveSupport');


    mw.setConfig( {		
        // We want our video player to attribute something...
        "EmbedPlayer.AttributionButton" : true,
        
        // 'enabledModules' : mods,
        
        //"EmbedPlayer.NativeControlsMobileSafari" : true, //xxx
        
        // Our attribution button
        'EmbedPlayer.AttributionButton' : {
          'title' : 'Internet Archive',
          'href' : 'http://www.archive.org'+det,
          'class' : 'archive-icon'
        }
      });
    

    //alert(mw.getConfig('enabledModules'));
    //mw.load('mw.InternetArchiveSupport', function() { alert('loada'); });
  }
}
  

mw.IA.setup();
