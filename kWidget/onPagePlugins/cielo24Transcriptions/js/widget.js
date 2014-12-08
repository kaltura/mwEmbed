function updateQueryString(key, value, url) {
    if (!url) url = window.location.href;
    var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi");

    if (re.test(url)) {
        if (typeof value !== 'undefined' && value !== null) {
            return url.replace(re, '$1' + key + "=" + value + '$2$3');
        }else {
            var hash = url.split('#');
            url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
            if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
                url += '#' + hash[1];
            }
            return url;
        }
    }else {
        if (typeof value !== 'undefined' && value !== null) {
            var separator = url.indexOf('?') !== -1 ? '&' : '?',
                hash = url.split('#');
            url = hash[0] + separator + key + '=' + value;
            if (typeof hash[1] !== 'undefined' && hash[1] !== null) {
                url += '#' + hash[1];
            }
            return url;
        }else {
            return url;
        }
    }
}

// https://gist.github.com/mseeley/1637329
function truncateStringWordBoundary(text, length, suffix) {
    var lastword = /\w+$/,
        blacklist = /[\s\u0021-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u007F\u00A0-\u00BF]$/,
        hellip = '\u2026',
        empty = '';

    suffix = suffix || hellip;
    text = text.slice(0, length - suffix.length).replace(lastword, empty);
    while (text && blacklist.test(text)) {
        text = text.replace(blacklist, empty);
    }
    return text ? text + suffix : empty;
}

String.prototype.toMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return (hours>0?hours+':':'')+minutes+':'+seconds;
}


function Marker(offset, length, timeOffset, timeLength) {
    this.offset = offset;
    this.length = length;
    this.timeOffset = timeOffset;
    this.timeLength = timeLength;
}

var playerId = '';

var segmentsTimeOffsets = [];
var segments = [];
var videoDuration = 0;

var transcriptionLoaded = false;
var scrollingEnabled = true;
var showSpeakers = true;
var showTimestamps = true;

var previousSearchTime = 0;

var currentTranscriptionHtml = "";
var currentTranscriptionText = "";

var searchTimeout = undefined;
var searchOccurrenceCursor = 0;

var rendering = false;

var parentUrl = (window.location != window.parent.location) ? document.referrer: document.location;

var playerPlayheadCurrentTime = 0;

function transcription2Document(transcriptionHtml) {
    var html = "<html><head><title>Transcription</title>";
    html += '<meta charset="UTF-8">';
    html += "<style>";
    html += '.clearfix:before, .clearfix:after { display: table; content: " "; }';
    html += ".clearfix:after { clear: both; }";
    html += ".transcriptionRow { margin-top: 30px; }";
    html += ".speakerName {font-weight: bold;}";
    html += ".speakerTime {color: #444;}";
    html += ".aquo {display: none;}";

    if(!showSpeakers) {
        html += ".speakerName {display: none;}";
        html += ".aquo {display: inline;}";
    }

    if(!showTimestamps) {
        html += ".speakerTime {display: none;}";
    }

    html += "</style>";
    html += "</head><body>"+transcriptionHtml+"</body></html>";
//        html += "<link rel='stylesheet' href='http://"+$(location).attr('host')+window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')+1)+"css/print.css?v=6' />";
    return html;
}

function printDocument(html) {
    var myWindow=window.open('','','width=400,height=600');
    myWindow.document.write(transcription2Document($("#transcriptionText").html()));

    myWindow.document.close();
    myWindow.focus();
    myWindow.print();
    myWindow.close();
}

function getUrlParam(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
        return decodeURIComponent(name[1]);
}

function getIndicesOf(searchStr, str, caseSensitive) {
    var startIndex = 0, searchStrLen = searchStr.length;
    var index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}

function scrollViewTo(newTopOffset) {
    var $transcriptionText = $("#transcriptionText");
    $transcriptionText.stop();
    $transcriptionText.animate({scrollTop: $transcriptionText.scrollTop() + newTopOffset - 170}, 'fast');
}

function playerUpdatePlayhead(time) {
    var second = parseFloat(time).toFixed(2);
    var milliSecond = parseInt(second*1000);

    playerPlayheadCurrentTime = milliSecond;

    $("#playheadTime").text(second.toMMSS());

    if(videoDuration>0) {
        $(".playheadHandle").css({left: ""+(milliSecond/videoDuration*100)+"%"});
    }

    var closest = BinarySearch.closest(segmentsTimeOffsets, milliSecond);
//        console.log("closest: "+closest);
    $(".transcriptionSegment").removeClass('active');

    if(segmentsTimeOffsets[closest]<milliSecond) {
        $(".transcriptionSegment[data-time-offset='"+segmentsTimeOffsets[closest]+"']").addClass('active');

        if(scrollingEnabled) {
            var $transcriptionText = $("#transcriptionText");
            var containerTopOffset = $transcriptionText.offset().top;
            var $activeSpan = $(".transcriptionSegment.active");
            var spanTopOffset = $activeSpan.offset().top;
            var diff = spanTopOffset - containerTopOffset;

            if(Math.abs(diff)>50) {
                scrollViewTo($activeSpan.position().top);
            }
//            $transcriptionText.scrollTop($transcriptionText.scrollTop() + $activeSpan.position().top - 120);
        }
    }

}

function renderTranscriptionSrt(srt) {

    var transcriptionText = "<p>";
    var currentOffset = 0;

    $(srt).each(function(i, el) {
        segmentsTimeOffsets.push(parseInt(el.startTime));
        segments.push(new Marker(currentOffset, currentOffset+el.text.length, el.startTime, el.endTime));

        transcriptionText += ("<span class='transcriptionSegment' data-time-offset='"+el.startTime+"' data-end='"+el.endTime+"'>"+el.text+"</span>");

        var lastChar = el.text.substr(-1);
        if(lastChar=="." || lastChar=="!" || lastChar=="?" || lastChar=="]") {
            transcriptionText += "</p>"+"<p>";
        }
        currentOffset += el.text.length;
    });

    $("#transcriptionText").html(transcriptionText+"</p>");
}

function addSpeakerStripe(speakerId, width) {
    var stripeSegmentTpl = _.template($("#stripeSegmentTpl").text());
    var stripeSegmentHtml = stripeSegmentTpl({segmentIndex: speakerId, segmentWidth: width });
    $(".stripe").prepend(stripeSegmentHtml);
}

function renderTranscription(json, duration) {
//        console.log(json);
    if(rendering) {
        return;
    }
    if(duration<=0) {
        return;
    }
    rendering = true;

    videoDuration = duration;

    var transcriptionText = "";
    var transcriptionHtml = "<div class='transcriptionRow clearfix'>";

    var currentOffset = 0;
    var currentSpeakerId = -1;
    var speakers = json.speakers;

    var newLineCntr = 0;

    $(json.segments).each(function(i, segment) {

        var segmentTimeOffset = parseInt(segment.start_time);
        var segmentOffset = currentOffset;

        if(segment.speaker_id!=currentSpeakerId) {
            if(i>0) {
                transcriptionHtml += "<span class='aquo'>&raquo;</span></div></div><div class='transcriptionRow clearfix'>";
            }
            addSpeakerStripe(currentSpeakerId, segmentTimeOffset/videoDuration*100);

            currentSpeakerId = segment.speaker_id;
            transcriptionHtml += "<div class='speakerColumn'><div class='speakerName "
            +(showSpeakers?"":"disabled")
            +" speakerColor"+currentSpeakerId+"'>"
            +(typeof(currentSpeakerId)=='undefined'?'':speakers[currentSpeakerId].name)
            +"</div><div class='speakerTime "
            +(showTimestamps?"":"disabled")
            +" '>"+(""+parseInt(segmentTimeOffset/1000)).toMMSS()
            +"</div></div><div class='transcriptionColumn'><span class='aquo'>&laquo;</span>";
            newLineCntr = 0;
        }

        transcriptionHtml += "<span class='transcriptionSegment' data-time-offset='"+segmentTimeOffset+"'>";

        $(segment.sequences).each(function(j, sequence) {
            $(sequence.tokens).each(function(k, token) {
                if(token.type=='word' || token.type=='punctuation') {

                    if(token.type=='word') {
                        if(newLineCntr>0) {
                            transcriptionText += (" ");
                            //                            transcriptionHtml += "<span class='transcriptionLetter' data-offset='"+currentOffset+"' > </span>";
                            transcriptionHtml += " ";
                            currentOffset++;
                        }
                        newLineCntr++;
                    }

                    transcriptionText += token.display_as;
                    transcriptionHtml += token.display_as;
                }
            });
        });

        transcriptionHtml += "</span>";
        if(newLineCntr>50 && i<json.segments.length-1 && json.segments[i+1].speaker_id==currentSpeakerId) {
            transcriptionHtml += "<br /><br />";
            newLineCntr = 0;
        }

        var segmentLength = currentOffset-segmentOffset;
        segmentsTimeOffsets.push(segmentTimeOffset);
        segments.push(new Marker(segmentOffset, segmentLength, segmentTimeOffset, segment.end_time-segment.start_time));

    });

    if(currentSpeakerId>-1) {
        addSpeakerStripe(currentSpeakerId, 100);
    }

    currentTranscriptionText = transcriptionText;
    currentTranscriptionHtml = transcriptionHtml;
//        console.log(transcriptionText);
    $("#transcriptionText").html(transcriptionHtml+"<span class='aquo'>&raquo;</span></div></div>");

    $(".totalTime").text((""+(videoDuration/1000)).toMMSS());

    var metaHidden = true;
    for(var i in json.topics) {
        var topicStartTime = json.topics[i].time_ranges[0].start_time;
        $(".topicsWrapper").append("<span class='playheadTimeUpdateTrigger' data-time-offset='"+topicStartTime+"'>"+i+" - "+(""+(topicStartTime/1000)).toMMSS()+"</span><br />");
        metaHidden = false;
    }
    if(!metaHidden) {
        $(".leftMenuPopupRowMeta").show();
    }

    var speakersHidden = true;
    for(var i in json.speakers) {
        var speakerId = json.speakers[i].id;

        var speakerStarts = [];
        var currentSpeakerId = -1;
        for(var j in json.segments) {
            var segment = json.segments[j];
            if(segment.speaker_id!=currentSpeakerId && segment.speaker_id==speakerId) {
                speakerStarts.push(segment.start_time);
            }
            currentSpeakerId = segment.speaker_id;
        }
        if(speakerStarts.length>0) {
            $(".speakersWrapper").append("<h3>"+json.speakers[i].name+":</h3>");
            speakersHidden = false;
        }
        for(var j in speakerStarts) {
            $(".speakersWrapper").append("<span class='playheadTimeUpdateTrigger' data-time-offset='"+speakerStarts[j]+"'>"+(""+(speakerStarts[j]/1000)).toMMSS()+"</span><br />");
        }
    }
    if(!speakersHidden) {
        $(".leftMenuPopupRowSpeakers").show();
    }

    var keywordsHidden = true;
    for(var keyword in json.keywords) {
        $(".keywordsWrapper").append("<h3>"+keyword+":</h3>");
        for(var j in json.keywords[keyword].time_ranges) {
            var timeRange = json.keywords[keyword].time_ranges[j];
            $(".keywordsWrapper").append("<span class='playheadTimeUpdateTrigger' data-time-offset='"+timeRange.start_time+"'>"+(""+(timeRange.start_time/1000)).toMMSS()+"</span><br />");
        }
        keywordsHidden = false;
    }
    if(!keywordsHidden) {
        $(".leftMenuPopupRowKeywords").show();
    }

    if($(".leftMenuTrigger").hasClass('disabled') || (typeof(json.topics)=='undefined' && typeof(json.speakers)=='undefined' && typeof(json.keywords)=='undefined')) {
        $(".leftMenuTrigger").addClass('disabled');
    }else {
        $(".leftMenuTrigger").hover(function() {
            $(this).addClass('active');
        }, function() {
            $(this).removeClass('active');
        });
    }

    rendering = false;
}

function scrollingStateChanged(newScrollingEnabled) {
    scrollingEnabled = newScrollingEnabled;
    $(".toggleScrolling").text("Autoscroll "+(scrollingEnabled?"on":"off"));
    if(scrollingEnabled) {
        $(".toggleScrolling").addClass('active');
    }else {
        $(".toggleScrolling").removeClass('active');
    }
}

function showSpeakersStateChanged(newShowSpeakers) {
    showSpeakers = newShowSpeakers;
    var state = "Hide";
    if(!showSpeakers) {
        state = "Show";
    }
    $(".hideSpeakerTrigger").text(state+" speakers");
    if(showSpeakers) {
        $(".hideSpeakerTrigger").addClass('active');
        $(".speakerName").removeClass('disabled');
    }else {
        $(".hideSpeakerTrigger").removeClass('active');
        $(".speakerName").addClass('disabled');
    }
}

function showTimestampsStateChanged(newShowTimestamps) {
    showTimestamps = newShowTimestamps;
    var state = "Hide";
    if(!showTimestamps) {
        state = "Show";
    }
    $(".hideTimestampsTrigger").text(state+" timestamps");
    if(showTimestamps) {
        $(".hideTimestampsTrigger").addClass('active');
        $(".speakerTime").removeClass('disabled');
    }else {
        $(".hideTimestampsTrigger").removeClass('active');
        $(".speakerTime").addClass('disabled');
    }
}

function searchOccurrenceCursorChanged(newCursor) {
    scrollingStateChanged(false);
    searchOccurrenceCursor = newCursor;
    $(".highlight").removeClass('searchCursor');
    var $searchCursor = $(".highlight:eq("+searchOccurrenceCursor+")");
    $searchCursor.addClass('searchCursor');
    scrollViewTo($searchCursor.position().top);
}

function windowResizeCallback() {
    var newHeight = $(window).height();
    $("#transcriptionText").height(newHeight-135);
}

$(document).ready(function() {

    XD.receiveMessage(function(message){
        try {
            var messageObj = JSON.parse(message.data);
            if(typeof(messageObj.event)!='undefined') {
                switch(messageObj.event) {
                    case 'playerUpdatePlayhead':
                        if(transcriptionLoaded) {
                            playerUpdatePlayhead(messageObj.time);
                        }
                        break;
                    default :
//                            console.log("Unknown event received: "+messageObj.event);
                        break;
                }
            }
//                console.log(messageObj);
        }catch(e) {
//                console.log("ERROR: "+e);
        }
    });

    var ks = getUrlParam('ks');
    var kdpId = getUrlParam('kdpId');
    var partnerId = parseInt(getUrlParam('partnerId'));
    playerId = getUrlParam('playerId');
    var lang = getUrlParam('lang');
    var videoDuration = getUrlParam('vdr');
    var widgetTitle = getUrlParam('widgetTitle');
    var clientLogo = getUrlParam('clientLogo');
    var entryId = getUrlParam('entryId');
    var hideGear = getUrlParam('hideGear')==="true";
    var hideShare = getUrlParam('hideShare')==="true";
    var hidePrint = getUrlParam('hidePrint')==="true";
    var hideDownload = getUrlParam('hideDownload')==="true";
    var hideLeftMenu = getUrlParam('hideLeftMenu')==="true";
    var hideSpeakers = getUrlParam('hideSpeakers')==="true";
    var hideTimestamps = getUrlParam('hideTimestamps')==="true";
    var autoscrollOff = getUrlParam('autoscrollOff')==="true";

    if(hideGear) {
        $(".rightMenuTrigger").hide();
    }else {
        $(".rightMenuTrigger").hover(function() {
            $(".rightMenuPopup").show();
        }, function() {
            $(".rightMenuPopup").hide();
        });
    }

    if(hideShare) {
        $(".shareIcon").hide();
    }else {
        $(".shareIcon").hover(function() {
            $(".shareDiv").show();
        }, function() {
            $(".shareDiv").hide();
        });
    }

    if(hideDownload) {
        $(".downloadIcon").hide();
    }else {
        $(".downloadIcon").click(function() {
            saveTextAs(transcription2Document($("#transcriptionText").html()), "transcription.html");
        });
    }

    if(hidePrint) {
        $(".printIcon").hide();
    }else {
        $(".printIcon").click(function() {
            printDocument($("#transcriptionText").html());
        });
    }

    if(hideLeftMenu) {
        $(".leftMenuTrigger").addClass("disabled");
    }

    if(hideSpeakers) {
        showSpeakersStateChanged(false);
    }

    if(hideTimestamps) {
        showTimestampsStateChanged(false);
    }

    if(autoscrollOff) {
        scrollingStateChanged(false);
    }

    $("#widgetTitle").text(widgetTitle);
    $("#clientLogo").attr("src", clientLogo);


    $(".toggleScrolling").click(function() {
        scrollingStateChanged(!scrollingEnabled);
    });

    $(".searchInput").keypress(function(e) {
        if(rendering) {
            e.preventDefault();
            return false;
        }
        if(typeof(searchTimeout)!='undefined') {
            clearTimeout(searchTimeout);
            searchTimeout = undefined;
        }
        searchTimeout = window.setTimeout(function() {
            rendering = true;

            var searchTerm = $(".searchInput").val();
            var matchesCnt = 0;

            $("#transcriptionText").unhighlight();
            $(".stripeHandle:not(.playheadHandle)").remove();
            if(searchTerm.length>1) {
//                    var matches = getIndicesOf(searchTerm, currentTranscriptionText, false);
//                    console.log("MATCHES:");
//                    console.log(matches);
                $("#transcriptionText").highlight(searchTerm);
                $(".speakerName").unhighlight();
                matchesCnt = $("#transcriptionText").find(".highlight").length;
//                    console.log("matches: "+matchesCnt);

                if(matchesCnt>0) {
                    var playheadHandleTpl = _.template($("#stripeHandleTpl").text());
                    $(".highlight").each(function(i, e) {
                        var $parent = $(e).parents(".transcriptionSegment");
                        if($parent.length>0) {
                            var matchTimeOffset = $parent.attr('data-time-offset');
                            var playheadHandleLeft = matchTimeOffset/videoDuration*100;
                            $(".stripeHandlesInner").append(playheadHandleTpl({left: playheadHandleLeft}));
                        }
                    });
                    searchOccurrenceCursorChanged(0);
                }
            }

            var searchBoxText = "Ready";

            if(searchTerm.length>0) {
                searchBoxText = ""+matchesCnt+" Match(es)";
            }

            $(".statusBox").text(searchBoxText);

            searchTimeout = undefined;
            rendering = false;
        }, 200);
    });

    $(".headerLine2ArrowRight").click(function() {
        if(searchOccurrenceCursor<($("#transcriptionText").find(".highlight").length-1)) {
            searchOccurrenceCursorChanged(searchOccurrenceCursor+1);
        }
    });

    $(".headerLine2ArrowLeft").click(function() {
        if(searchOccurrenceCursor>0) {
            searchOccurrenceCursorChanged(searchOccurrenceCursor-1);
        }
    });

    $(".stripe").click(function(e) {
        var width = $(this).width();
        var offsetX = (e.pageX - $(this).offset().left) - 0;

        var newTime = parseFloat(videoDuration/1000*(offsetX/width)).toFixed(2);
        var jsonData = JSON.stringify({event: 'playerUpdatePlayhead', playerId: playerId, time: newTime});
        XD.postMessage(jsonData, parentUrl, parent.window);
    });

    $("#transcriptionText").on('click', ".transcriptionSegment", function() {
        var newTime = parseFloat($(this).attr('data-time-offset')/1000).toFixed(2);
        var jsonData = JSON.stringify({event: 'playerUpdatePlayhead', playerId: playerId, time: newTime});
        XD.postMessage(jsonData, parentUrl, parent.window);
    });

    $(".footerArrowUp").click(function() {

        $(this).toggleClass('closed');
        XD.postMessage(JSON.stringify({event: 'toggleVisibilityState', playerId: playerId}), parentUrl, parent.window);
    });

    $(".hideSpeakerTrigger").click(function() {
        showSpeakersStateChanged(!$(this).hasClass('active'));
    });

    $(".hideTimestampsTrigger").click(function() {
        showTimestampsStateChanged(!$(this).hasClass('active'));
    });

    $(".leftMenuPopupRow").hover(function(){
        $(".leftMenuPopupRow").removeClass('active');
        $(this).addClass('active');
    }, function() {
        $(this).removeClass('active');
    });

    $(".leftMenuPopup").on('click', '.playheadTimeUpdateTrigger', function() {
        var newTime = parseFloat($(this).attr('data-time-offset')/1000).toFixed(2);
        var jsonData = JSON.stringify({event: 'playerUpdatePlayhead', time: newTime, playerId: playerId});
        XD.postMessage(jsonData, parentUrl, parent.window);
    });

    $(".shareFacebook").click(function() {
        var shareUrl = parentUrl;
        var includeTimestamp = false;
        if(confirm('Do you want to include current time in the share link?')) {
            includeTimestamp = true;
        }

        if(includeTimestamp) {
            shareUrl = updateQueryString('cielo24time', playerPlayheadCurrentTime, parentUrl);
            shareUrl = updateQueryString('cielo24kdpId', kdpId, shareUrl);
        }

        var facebookUrl = 'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(shareUrl);

        var width  = 575,
            height = 400,
            left   = ($(window).width()  - width)  / 2,
            top    = ($(window).height() - height) / 2,
            opts   = 'status=1' +
                ',width='  + width  +
                ',height=' + height +
                ',top='    + top    +
                ',left='   + left;

        window.open(facebookUrl, 'facebook', opts);

        return false;
    });
    new Image().src = "img/footerArrowDown.png";
    new Image().src = "img/rightMenuRowBg.png";
    new Image().src = "img/rightMenuCheckbox.png";
    new Image().src = "img/rightMenuCheckboxChecked.png";
    new Image().src = "img/menuRowBgActive.png";
    $(".shareTwitter").click(function() {

        var shareUrl = parentUrl;
        var includeTimestamp = false;
        if(confirm('Do you want to include current time in the share link?')) {
            includeTimestamp = true;
        }

        if(includeTimestamp) {
            shareUrl = updateQueryString('cielo24time', playerPlayheadCurrentTime, parentUrl);
            shareUrl = updateQueryString('cielo24kdpId', kdpId, shareUrl);
        }

        var twitterUrl = 'https://twitter.com/share?url='+encodeURIComponent(shareUrl);
        var tweetText = $(location).attr('hostname');

        if(includeTimestamp) {
            var closest = BinarySearch.closest(segmentsTimeOffsets, playerPlayheadCurrentTime);
            if(closest>-1) {
                var $closestSegment = $(".transcriptionSegment[data-time-offset='"+segmentsTimeOffsets[closest]+"']");
                if($closestSegment.length>0) {
                    tweetText += " : ";
                    var tweetMaxLength = 140;
                    var remainingLength = tweetMaxLength - 24 - 3; // domain + :
                    remainingLength = remainingLength - 24; // for the url
                    remainingLength = remainingLength - 2; // for quotes
                    remainingLength = remainingLength - 3; // for three dots
                    tweetText += '"'+truncateStringWordBoundary($closestSegment.text(), remainingLength).trim()+'"';
                }
            }
        }

        twitterUrl += "&text="+encodeURIComponent(tweetText);

        var width  = 575,
            height = 400,
            left   = ($(window).width()  - width)  / 2,
            top    = ($(window).height() - height) / 2,
            opts   = 'status=1' +
                ',width='  + width  +
                ',height=' + height +
                ',top='    + top    +
                ',left='   + left;

        window.open(twitterUrl, 'twitter', opts);

        return false;
    });

    $(".shareLinkedin").click(function() {

        var shareUrl = parentUrl;
        var includeTimestamp = false;
        if(confirm('Do you want to include current time in the share link?')) {
            includeTimestamp = true;
        }

        if(includeTimestamp) {
            shareUrl = updateQueryString('cielo24time', playerPlayheadCurrentTime, parentUrl);
            shareUrl = updateQueryString('cielo24kdpId', kdpId, shareUrl);
        }

        var linkedinUrl = 'http://www.linkedin.com/shareArticle?mini=true&url='+encodeURIComponent(shareUrl);
        var shareText = "";

        if(includeTimestamp) {
            var closest = BinarySearch.closest(segmentsTimeOffsets, playerPlayheadCurrentTime);
            if(closest>-1) {
                var $closestSegment = $(".transcriptionSegment[data-time-offset='"+segmentsTimeOffsets[closest]+"']");
                if($closestSegment.length>0) {
                    var tweetMaxLength = 240;
                    var remainingLength = tweetMaxLength; // domain + :
                    remainingLength = remainingLength - 2; // for quotes
                    remainingLength = remainingLength - 3; // for three dots
                    shareText += '"'+truncateStringWordBoundary($closestSegment.text(), remainingLength).trim()+'"';
                }
            }
        }

        // &title={articleTitle}&summary={articleSummary}&source={articleSource}
        linkedinUrl += "&summary="+encodeURIComponent(shareText);

        var width  = 575,
            height = 400,
            left   = ($(window).width()  - width)  / 2,
            top    = ($(window).height() - height) / 2,
            opts   = 'status=1' +
                ',width='  + width  +
                ',height=' + height +
                ',top='    + top    +
                ',left='   + left;

        window.open(linkedinUrl, 'twitter', opts);

        return false;
    });

    $(".languageOption").click(function() {
        $(".statusBox").text("Loading...");
        var lang = $(this).attr('data-lang');
        var jsonData = JSON.stringify({event: 'loadLanguage', playerId: playerId, lang: lang});
        XD.postMessage(jsonData, parentUrl, parent.window);
    });

    loadTranscriptionFromKaltura(ks, partnerId, lang, entryId, function(response) {
        var langs = response.langs;
        var loadedLang = response.loadedLang;
        var responseCode = response.code;
        var transcriptionJson = response.transcriptionJson;

        if(responseCode==200) {
            if(langs.length>1) {
                $(".language").show();
                for(var i in langs) {
                    var lang = langs[i].isoCode;
                    $(".languageOption[data-lang='"+lang+"']").addClass('active');
                }
                $(".currentLanguage").text(loadedLang.name);
            }
            renderTranscription(transcriptionJson, videoDuration);
        }else {
            $("#transcriptionText").text("<div class='noTranscriptionText'>No Transcription Available</div>");
            $(".leftMenuTrigger").addClass('disabled');
            $(".footerArrowUp").addClass('closed');
            XD.postMessage(JSON.stringify({event: 'toggleVisibilityState', playerId: playerId}), parentUrl, parent.window);
        }

        transcriptionLoaded = true;
    });

    $(window).resize(windowResizeCallback);
    windowResizeCallback();
});