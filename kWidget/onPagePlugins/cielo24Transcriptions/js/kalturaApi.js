var cieloTranscriptionFileTitlePrefix = "c24Trans";

var supportedLangs = [
    {name:'English',isoCode:'en'},
    {name:'Russian',isoCode:'ru'},
    {name:'German', isoCode:'de'},
    {name:'Italian',isoCode:'it'},
    {name:'Spanish',isoCode:'es'}
];

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

function loadTranscriptionFromKaltura(ks, partnerId, langParameter, entryId, callback) {
    var kConfig;
    var kClient;

    kConfig = new KalturaConfiguration(partnerId);
    kClient = new KalturaClient(kConfig);
    kClient.ks = ks;

    var filter = new KalturaAssetFilter();
    filter.entryIdEqual = entryId;


    kClient.attachmentAsset.listAction(function(success, data) {
        if (!data.code) {
            var availableLangs = [];

            for(var i in data.objects) {
                var transcription = data.objects[i];
                if(transcription.title.indexOf(cieloTranscriptionFileTitlePrefix) == 0) {
                    var isoCode = transcription.title.substr(transcription.title.indexOf("_")+1);
                    if(isoCode.length>0) {
                        var foundSupportedLang = _.findWhere(supportedLangs, {isoCode:isoCode});
                        if(typeof(foundSupportedLang)!='undefined') {
                            availableLangs.push(foundSupportedLang);
                        }
                    }
                }
            }

            if(availableLangs.length>0) {
                var foundRequestedLang = _.findWhere(availableLangs, {isoCode: langParameter});
                if(typeof(foundRequestedLang)=='undefined') {
                    foundRequestedLang = availableLangs[0];
                }

                var cieloTranscriptionFileTitle = cieloTranscriptionFileTitlePrefix + '_'+foundRequestedLang.isoCode;

                for(var i in data.objects) {
                    var transcription = data.objects[i];
                    if(transcription.title==cieloTranscriptionFileTitle) {
                        var transcriptionId = transcription.id;
                        kClient.attachmentAsset.getUrl(function(message2, data2) {
                            if(!data2.code) {
                                corsIE8(data2, function(transcriptionJson) {
                                    var response = {};
                                    response.code = 200;
                                    response.langs = availableLangs;
                                    response.loadedLang = foundRequestedLang;
                                    response.transcriptionJson = JSON.parse(transcriptionJson);
                                    callback(response);
                                }, function(xhr, status, error) {
                                });
                            }
                        }, transcriptionId);
                    }
                }
            }else {
                var response = {};
                response.code = 404;
                callback(response);
            }
        }
    }, filter);
}