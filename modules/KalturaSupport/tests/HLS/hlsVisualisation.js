/**
 * Created by einatr on 7/16/15.
 */

    // Current mode - "tags" showing FLV and downloads, or "manifest" showing playlist state.
    var mode="tags";

    // Array containing info on FLV tags - {time: , type: , reject: , key: }
    var tags=[];

    // Epoch time of last tag call so we can avoid rendering immediately afterwards; this
    // helps avoid super slow transcoding.
    var lastTagSubmission = -1;

    // What was the last reported playhead time from HLS plugin?
    var playheadTime = 0;
    // Set from HLS plugin, showing the cutoff for rejecting audio tags in ms.
    var audioLowWatermark = 0;
    // Set from HLS plugin, showing the cutoff for rejecting video tags in ms.
    var videoLowWatermark = 0;

    // Current state of all downloads. Indexed by URL, each entry is an
    // array of {event:, time:} showing what's happened.
    var downloadState = {};

    // Current state of all manifests. Structered as follows:
    // {
    //   "submanifest.m3u8": [
    //        { id: 1, url: "seg.ts", startTime: 0.0, endTime: 10.0 }
    //    ]
    // }
    var manifestState = {};
    // List of what segments we've requested, in order. Used to highlight
    // manifests.
    // Entries are:  {url:, time: }
    var requestLog = [];
    // Set whenever we want to redraw.
    var bufferDirty = true;

    // We'll also re-render every few hundred ms to keep responsive.
    var lastBufferRender = 0;

    // Have we set up our context and event listeners?
    var isSetup = false;

    // How far back from the head do we want to see? in seconds.
    var howFarBack = 20;

    // Maximum distance allow zoom in seconds.
    var howFarBack_max = 120;

    // Minimum distance to show in zoom in seconds.
    var howFarBack_min = 1;

    // One mouse wheel event changes zoom by this many visible seconds?
    var howFarBack_step = 0.5;

    // Dimensions of the canvas tag.
    var width = 1024, height = 256;

    // How many px high is a track/lane/row?
    var rowHeight = 15;
    // This maps FLV tag types to the row we want to display them. We also
    // recognize "downloads" so we know how far down to start rendering downloads.
    var flvRowMap = {};
    flvRowMap[0x08] = 1;
    flvRowMap[0x09] = 2;
    flvRowMap[0x12] = 3;
    flvRowMap["downloads"] = 4;
    // Drag state.
    var dragStartX, dragStartY;
    var isDrag = false;
    var dragStartTime;

    // Seconds back from live to translate the view.
    var timeOffset = 0;
    // Maximum amount to allow scrolling back.
    var timeOffset_max = 120;

    setInterval(function() { bufferDirty = true; }, 100);


    // Called by HLS plugin to update manifest state.
    function onManifest(payload)
    {
        manifestState = JSON.parse(payload);
        bufferDirty = true;
    }

    // Called by HLS plugin to note a request was made.
    // This is associated with getNextFile/getFileForTime.
    function onNextRequest(payload)
    {
        // Note the last requests so we can animate their state.
        if(payload.url === null || payload.kind === "bestEffortDownload") {
            return;
        }

        payload.time = Date.now();
        requestLog.push(payload);
    }

    // Called by HLS plugin to note download events for segments.
    function onDownload(payload)
    {
        // Events are:
        //      open - just opened.
        //      opened - open completed.
        //      closed - code requested close.
        //      complete - successful complete.
        //      error - got an error and failed
        //      timeout - timed out and failed.

        if(payload.event === "closed")
            return;

        if(payload.url.indexOf("?") !== -1) {
            payload.url = payload.url.split("?")[0];
        }

        if(!downloadState[payload.url]) {
            downloadState[payload.url] = [];
        }

        // Log the active state.
        downloadState[payload.url].push({event: payload.event, time: Date.now()});

        bufferDirty = true;
    }
    // Called by HLS plugin to note the current playhead time.
    function onCurrentTime(t, isAbsolute)
    {
        playheadTime = t;
        seconds2npt(playheadTime);
        bufferDirty = true;
    }

    // Called by HLS plugin to note tag conversion state.
    function onTag(time, type, audioLow, videoLow, kept, isKey)
    {
        // Note tag.
        tags.push({time: time, type: type, reject: !kept, key: isKey});
        // Update watermarks.
        audioLowWatermark = audioLow / 1000;
        videoLowWatermark = videoLow / 1000;

        // Mark redraw needed.
        bufferDirty = true;
        lastTagSubmission = Date.now();
    }

    // Handle mousewheel events.
    function adjustZoom(e)
    {
        var delta = -e.detail || e.wheelDelta;

        if(delta < 0) {
            howFarBack = Math.max(howFarBack_min, howFarBack - howFarBack_step);
        }else {
            howFarBack = Math.min(howFarBack_max, howFarBack + howFarBack_step);
        }

        bufferDirty = true;
        e.preventDefault();
        return false;
    }

    function onMouseDown(e)
    {
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragStartTime = timeOffset;
        isDrag = true;
    }

    function onMouseMove(e)
    {
        if(isDrag === false) {
            return false;
        }

        var deltaX = e.clientX - dragStartX;
        var deltaY = e.clientY - dragStartY;

        // adjust time offset by deltaX.
        var secondsToPixels = width / howFarBack;
        var localOffset = deltaX / secondsToPixels;

        // Adjust and clamp it.
        timeOffset = dragStartTime + localOffset;
        timeOffset = Math.max(0, timeOffset);
        timeOffset = Math.min(timeOffset_max, timeOffset);

        bufferDirty = true;
    }
    function onMouseUp(e)
    {
        isDrag = false;
    }

    // Conversion helpers from http://stackoverflow.com/a/5624139
    function componentToHex(c) {
        var hex = parseInt(c).toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }

    // Main function - renders player state.
    function redrawBuffer()
    {
        if( mode === "stop" ){
            return;
        }
        // Keep processing.
        requestAnimationFrame(redrawBuffer);

        // Suppress if we've gotten new tags really recently to avoid chug.
        if(Date.now() - lastTagSubmission < 64) {
            return;
        }

        // nop if no dirty.
        if(bufferDirty === false) {
            return;
        }
        bufferDirty = false;
        lastBufferRender = Date.now();
        // Truncate the buffer to 2*howFarBack if we exceed some max...
        var cleanThreshold = 25000;
        if(tags.length > cleanThreshold * 1.1)
        {
            var lastTime = tags[tags.length-1].time;
            for(var i=0; i<tags.length; i++)
            {
                if((lastTime - tags[i].time) < howFarBack_max)
                    continue;

                // Remove.
                tags.splice(i, 1);
                i--;
            }
        }
        // Set up canvas.
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        if(!isSetup)
        {
            console.log("hlsVisualisation :: Initializing tag debug view.");

            if(this.window) {
                this.window.addEventListener("mousewheel", adjustZoom, false);
                this.window.addEventListener("DOMMouseScroll", adjustZoom, false);
            }
            canvas.addEventListener("mousedown", onMouseDown, false);
            canvas.addEventListener("mousemove", onMouseMove, false);
            canvas.addEventListener("mouseup", onMouseUp, false);
            isSetup = true;
        }

        // Clear the canvas.
        ctx.clearRect(0, 0, width, height);
        ctx.textBaseline = "top";
        if(mode === "tags")
        {
            // Draw FLV/download state.

            if(tags.length === 0)
                return;

            // Get last time.
            var lastItem = tags[tags.length-1];

            // Draw up to a certain number of seconds back.
            var secondsToPixels = width / howFarBack;
            var lastTimestamp = lastItem.time - timeOffset;

            var currentItemIdx = tags.length - 1;

            // Just draw all tags to avoid ordering issues making us drop tags as
            // we scroll.
            while(currentItemIdx >= 0)
            {
                var tagType = tags[currentItemIdx].type;
                var tagTime = tags[currentItemIdx].time;
                var tagReject = tags[currentItemIdx].reject;

                ctx.fillStyle = tags[currentItemIdx].reject ? "red" : "green";
                ctx.fillRect(
                    width - (lastTimestamp - tags[currentItemIdx].time) * secondsToPixels,
                    flvRowMap[tags[currentItemIdx].type] * rowHeight + (tagReject ? 3 : 0),
                    tags[currentItemIdx].key ? 2 : 1,
                    tags[currentItemIdx].key ? rowHeight : rowHeight * 0.75);

                currentItemIdx--;
            }

            // Layout and draw downloads.
            var msToPixels = secondsToPixels / 1000;

            // Get the set of visible downloads.
            var visibleDownloads = [];
            for(var downloadName in downloadState)
            {
                var stateArray = downloadState[downloadName];
                if(!stateArray || stateArray.length === 0) {
                    continue;
                }

                var firstTime = stateArray[0].time;
                var lastTime = stateArray[stateArray.length - 1].time;

                if(Math.max(firstTime, Date.now() - (width / msToPixels)) <= Math.min(lastTime, Date.now()))
                {
                    visibleDownloads.push(downloadName);
                }
            }

            // Draw active downloads.
            for(var i=0; i<visibleDownloads.length; i++)
            {
                var downloadName = visibleDownloads[i];
                var stateArray = downloadState[downloadName];

                // We track download state as an array of events, get first
                // and last.
                var firstTime = stateArray[0].time;
                var lastState = stateArray[stateArray.length - 1].event;
                var lastTime = stateArray[stateArray.length - 1].time;

                // If it's ongoing, draw right edge as updating to now.
                if(lastState === "open" || lastState == "opened") {
                    lastTime = Date.now();
                }

                var firstX = width - (Date.now() - firstTime) * msToPixels;
                var lastX = width - (Date.now() - lastTime) * msToPixels;

                // Get just the filename.
                var truncatedFile = downloadName.replace(/^.*[\\\/]/, '');

                ctx.fillStyle = "orange";
                ctx.fillRect(firstX, (flvRowMap["downloads"] + i) * rowHeight, lastX - firstX, rowHeight);
                ctx.fillStyle = "black";
                ctx.fillText(truncatedFile + ":" + lastState, firstX + 2, (flvRowMap["downloads"] + i) * rowHeight);
            }

            // Draw playhead.
            ctx.fillStyle = "blue";
            ctx.fillRect(
                width - (lastTimestamp - playheadTime) * secondsToPixels,
                0, 2, rowHeight * 3);
            // Draw watermarks.
            ctx.fillStyle = "orange";
            ctx.fillRect(
                width - (lastTimestamp - (audioLowWatermark - 0.100)) * secondsToPixels,
                flvRowMap[8] * rowHeight, 2, rowHeight);
            ctx.fillRect(
                width - (lastTimestamp - (videoLowWatermark - 0.100)) * secondsToPixels,
                flvRowMap[9] * rowHeight, 2, rowHeight);
            // Draw row headers.
            ctx.fillStyle = "black";
            ctx.fillText("Audio", 0, flvRowMap[8] * rowHeight);
            ctx.fillText("Video", 0, flvRowMap[9] * rowHeight);
            ctx.fillText("Script", 0, flvRowMap[0x12] * rowHeight);
            ctx.fillText("Downloads", 0, flvRowMap["downloads"] * rowHeight);
        }
        else
        {
            // Determine start/end of view based on zoom and current playhead.
            var manGlobalMax = playheadTime + howFarBack;
            var manGlobalMin = playheadTime - howFarBack;

            // Helper to convert from times to pixels.
            function timeToPixel(t)
            {
                var n = ((t+timeOffset) - manGlobalMin) / (manGlobalMax - manGlobalMin);
                return n * width;
            }

            // Draw manifest state.
            var curManIndex = 0;
            for(var manName in manifestState)
            {
                // Rows are submanifests.
                var curManArray = manifestState[manName];
                var requestNotes = {};
                var color = {r: 128, g: 128, b: 128};
                for(var i=0; i<curManArray.length; i++)
                {
                    var curManItem = curManArray[i];

                    // Reset color.
                    color.r = 128;
                    color.g = 128;
                    color.b = 128;
                    // Apply animation to show requests.
                    for(var q=requestLog.length-1; q>=0; q--)
                    {
                        var curRequestItem = requestLog[q];
                        if(curRequestItem.url !== curManItem.url) {
                            continue;
                        }

                        var fadeTimeInMs = 4000;
                        var gFactor = Math.min(255, (Date.now() - curRequestItem.time) / fadeTimeInMs * 255);
                        color.r = 200;
                        color.g = gFactor;
                        color.b = 200;

                        requestNotes[curRequestItem.url] = " (request " + q + ")";
                        break;
                    }

                    // Draw the box with stroke.
                    ctx.fillStyle = rgbToHex(color.r, color.g, color.b);
                    ctx.fillRect(
                        timeToPixel(curManItem.start),
                        rowHeight * curManIndex * 2,
                        timeToPixel(curManItem.end) - timeToPixel(curManItem.start),
                        rowHeight * 2);

                    ctx.lineStyle = "black";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(
                        timeToPixel(curManItem.start),
                        rowHeight * curManIndex * 2,
                        timeToPixel(curManItem.end) - timeToPixel(curManItem.start),
                        rowHeight * 2);
                }

                // Draw segment labels last so they aren't overlapped by boxes.
                ctx.fillStyle = "black";
                for(var i=0; i<curManArray.length; i++)
                {
                    var curManItem = curManArray[i];
                    ctx.fillText("#" + curManItem.id + (requestNotes[curManItem.url] ? requestNotes[curManItem.url] : ""), timeToPixel(curManItem.start) + 5, rowHeight * curManIndex * 2);
                }
                // Draw manifest name.
                ctx.fillText(manName, 0, rowHeight * curManIndex * 2 + rowHeight);

                curManIndex++;
            }

            // Draw playhead.
            ctx.fillStyle = "blue";
            ctx.fillRect(
                timeToPixel(playheadTime),
                0, 2, rowHeight * curManIndex * 2);

        }
    }

    // Event handler for the toggle button, to switch views.
    function onSwitchClick()
    {
        if(mode === "tags") {
            mode = "manifest";
        }else {
            mode = "tags";
        }
        console.log("hlsVisualisation :: Now showing " + mode);

        bufferDirty = true;
    }

    function stopDrawing()
    {
        mode = "stop";

        var _canvas = document.getElementById('canvas');
        var context = _canvas.getContext('2d');
        context.clearRect(0, 0, _canvas.width, _canvas.height);

        console.log("hlsVisualisation :: Now showing " + mode);
        resetAllVars();
    }

    function startDrawing()
    {
        mode = "tags";
        bufferDirty = true;
        // Initiate buffer rendering.
        requestAnimationFrame(redrawBuffer);

        console.log("hlsVisualisation :: Now showing " + mode);
    }

    function resetAllVars(){
        tags=[];
        lastTagSubmission = -1;
        playheadTime = 0;
        audioLowWatermark = 0;
        videoLowWatermark = 0;
        downloadState = {};
        manifestState = {};
        requestLog = [];
        bufferDirty = true;
        lastBufferRender = 0;
        isSetup = false;
        howFarBack = 20;
        howFarBack_max = 120;
        howFarBack_min = 1;
        howFarBack_step = 0.5;
        width = 1024, height = 256;
        rowHeight = 15;
        flvRowMap = {};
        flvRowMap[0x08] = 1;
        flvRowMap[0x09] = 2;
        flvRowMap[0x12] = 3;
        flvRowMap["downloads"] = 4;
        dragStartX, dragStartY;
        isDrag = false;
        dragStartTime = undefined;
        timeOffset = 0;
        timeOffset_max = 120;
    }

function seconds2npt ( sec ) {
    if ( isNaN( sec ) ) {
        console.log("hlsVisualisation :: Time is NAN ");
        return;
    }

    var tm = {};
    tm.days = Math.floor( sec / ( 3600 * 24 ) );
    tm.hours = Math.floor( Math.round( sec ) / 3600 ) % 24;
    tm.minutes = Math.floor( ( Math.round( sec ) / 60 ) % 60 );
    tm.seconds = Math.round(sec) % 60;

    // Round the number of seconds to the required number of significant
    // digits
    tm.seconds = Math.round( tm.seconds * 1000 ) / 1000;

    if ( tm.seconds < 10 ){
        tm.seconds = '0' +	tm.seconds;
    }
    var hoursStr = '';
    if( tm.hours !== 0 ){
        if ( tm.minutes < 10 ) {
            tm.minutes = '0' + tm.minutes;
        }
        hoursStr = tm.hours + ":";
    }

    var time =  hoursStr + tm.minutes + ":" + tm.seconds;
    console.log("hlsVisualisation :: Time is "+time);
}

