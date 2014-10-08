var cieloTranscriptionFileTitle = "c24Trans";

function corsIE8(url, done, fail) {
    if(window.XDomainRequest){
        var xdr = new XDomainRequest();
        xdr.open("get", url);
        xdr.onprogress = function () { };
        xdr.ontimeout = function () { fail(); };
        xdr.onerror = function () { fail(); };
        xdr.onload = function() {
            done(xdr.responseText);
        };
        setTimeout(function () {xdr.send();}, 0);
    } else {
        $.ajax(url)
            .done(done)
            .fail(fail);
    }
}

function loadTranscriptionFromKalturaSrt(ks, entryId) {
    var kConfig;
    var kClient;
    //console.log("EID: "+entryId);

    kConfig = new KalturaConfiguration(partnerId);
//        kConfig.serviceUrl = "http://www.kaltura.com";
    // if you want to communicate with a Kaltura server which is
    //    other than the default http://www.kaltura.com

    kClient = new KalturaClient(kConfig);
    kClient.ks = ks;

    var filter = new KalturaAssetFilter();
    filter.entryIdEqual = entryId;


    kClient.captionAsset.listAction(function(success, data) {
        //console.log("DT: ");
        //console.log(data);
        if (data.code) {
            alert("Error: "+data.message);
        } else {
            //console.log(data.objects.length);
            var transcriptionId = data.objects[0].id;
            //console.log("DT_1: ");
            //console.log(transcriptionId);
            kClient.captionAsset.getUrl(function(message2, data2) {
                if(data2.code) {
                    alert("Error2: "+data2.message);
                }else {
                    //console.log("DT2: ");
                    //console.log(data2);

                    corsIE8(data2, function(data3) {
                        //console.log("DT3: ");
                        //console.log(data3);

                        //console.log("SRT: ");
                        var srt = parser.fromSrt(data3, true);
                        //console.log(srt);

                        latestSrt = srt;
                        renderTranscriptionSrt(srt);

                        transcriptionLoaded = true;
                    }, function(xhr, status, error) {
                        //console.log(xhr);
                    });
                }
            }, transcriptionId);
        }
    }, filter);

}

function loadTranscriptionFromKaltura(ks, partnerId, entryId, videoDuration) {
    var kConfig;
    var kClient;

    kConfig = new KalturaConfiguration(partnerId);
    kClient = new KalturaClient(kConfig);
    kClient.ks = ks;

    var filter = new KalturaAssetFilter();
    filter.entryIdEqual = entryId;


    kClient.attachmentAsset.listAction(function(success, data) {
        if (data.code) {
            console.log("Error: "+data.message);
        } else {
            for(var i in data.objects) {
                var transcription = data.objects[i];
                if(transcription.title==cieloTranscriptionFileTitle) {
                    var transcriptionId = transcription.id;
                    kClient.attachmentAsset.getUrl(function(message2, data2) {
                        if(data2.code) {
                            alert("Error2: "+data2.message);
                        }else {
                            //corsIE8(data2, function(data3) {
                            //    console.log("DT3: ");
                            //    console.log(data3);
                            //
                            //    console.log("SRT: ");
                            //    var srt = parser.fromSrt(data3, true);
                            //    console.log(srt);
                            //
                            //    latestSrt = srt;
                            //    renderTranscriptionSrt(srt);
                            //
                            //    transcriptionLoaded = true;
                            //}, function(xhr, status, error) {
                            //    console.log(xhr);
                            //});

                            corsIE8(data2, function(jsonTranscription) {
                                renderTranscription(JSON.parse(jsonTranscription), videoDuration);
                                transcriptionLoaded = true;
                            }, function(xhr, status, error) {
                                console.log("ERR");
                                console.log(xhr);
                            });
                        }
                    }, transcriptionId);
                }
            }
        }
    }, filter);
}