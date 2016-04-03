/**
 * Created by mark.feder on 10/13/2015.
 */
(function (mw, $) {
    "use strict";
    mw.KIVQModule = function (embedPlayer,quizPlugin) {
        return this.init(embedPlayer,quizPlugin);
    };
    if (!(mw.KIVQModule.prototype = {
            kQuizUserEntryId: null,
            score: null,
            embedPlayer: null,
            quizPlugin: null,
            showGradeAfterSubmission: false,
            canSkip: false,
            hexPosContainerPos: 0,
            sliceArray: [],
            isErr: false,
            quizSubmitted: false,
            intrVal: null,
            quizEndFlow: false,
            bindPostfix: '.quizPlugin',
            reviewMode:false,
            isKPlaylist:false,

            init: function (embedPlayer,quizPlugin) {
                var _this = this;

                _this.KIVQApi = new mw.KIVQApi(embedPlayer);
                _this.KIVQScreenTemplate = new mw.KIVQScreenTemplate(embedPlayer);

                this.destroy();
                this.embedPlayer = embedPlayer;
                this.quizPlugin = quizPlugin;
            },

            setupQuiz:function(){
                var _this = this;

                _this.KIVQApi.getUserEntryIdAndQuizParams( function(data) {
                    if (!_this.checkApiResponse('User Entry err-->', data[0])) {
                        return false;
                    }
                    if (!_this.checkApiResponse('Quiz Params err-->', data[1])) {
                        return false;
                    }
                    else {
                        $.quizParams = data[1];
                        $.grep($.quizParams.uiAttributes, function (e) {
                            if (e.key == "canSkip") {
                                _this.canSkip = (e.value.toLowerCase() === 'true');
                            }
                        });
                        if (data[0].totalCount > 0) {
                            switch (String(data[0].objects[0].status)) {
                                case 'quiz.3':
                                    if ($.quizParams.showGradeAfterSubmission) {
                                        _this.score = Math.round(data[0].objects[0].score * 100);
                                    }
                                    _this.quizSubmitted = true;
                                    break;
                                case '1':
                                    break;
                                case '2':
                                    _this.errMsg('quiz deleted', data);
                                    return false;
                                    break;
                            }
                        }
                    }

                    if(_this.isKPlaylist){
                        if (_this.quizSubmitted){
                            mw.log("Quiz: Playlist Auto Continue When Submitted");
                            _this.embedPlayer.setKDPAttribute('playlistAPI','autoContinue',true);
                        }else{
                            mw.log("Quiz: Playlist Don't Auto Continue");
                            _this.embedPlayer.setKDPAttribute('playlistAPI','autoContinue',false);
                        }
                    }

                    _this.setUserEntryId(data);
                    _this.checkUserEntryIdReady(function(){
                    _this.getQuestionsAndAnswers(_this.populateCpObject);
                    });
                });
            },

            getQuestionsAndAnswers: function (callback) {
                var _this = this;
                _this.KIVQApi.getQuestionAnswerCuepoint(_this.kQuizUserEntryId, function(data){

                    if (!_this.checkApiResponse('Get question err -->',data[0])){
                        return false;
                    }
                    if (!_this.checkApiResponse('Get answer err -->',data[1])){
                        return false;
                    }
                    callback(data);
                });
            },
            setUserEntryId:function(data){
                var _this = this;
                if (data[0].totalCount > 0 &&  !$.isEmptyObject(data[0].objects[0])) {
                    mw.log('Quiz: Set user entry id');
                    _this.kQuizUserEntryId = data[0].objects[0].id;
                }
                else{
                    _this.KIVQApi.createQuizUserEntryId(function(userData){
                        if (!_this.checkApiResponse('Add KQ user entry id err -->',userData)){
                            return false;
                        }
                        else{
                            mw.log('Quiz: create user entry id');
                            _this.kQuizUserEntryId = userData.id;
                        }
                    });
                }
            },
            setSubmitQuiz:function(){
                var _this = this;

                _this.KIVQApi.submitQuiz(_this.kQuizUserEntryId, function(data){

                    if (!_this.checkApiResponse('Submit Quiz err -->',data)){
                        return false;
                    }
                    else{
                        $.cpObject = {};
                        _this.getQuestionsAndAnswers(_this.populateCpObject);

                        _this.checkCuepointsReady(function(){
                            _this.score = Math.round(data.score *100);
                            _this.quizPlugin.ssSubmitted(_this.score);
                            _this.quizSubmitted = true;
                        });
                        _this.sendIVQMesageToListener();
                    }
                });
            },

            getIvqPDF:function(entryId){
                var _this = this;
                _this.KIVQApi.downloadIvqPDF(entryId, function(data){
                    window.location.assign(data);
                    if (!_this.checkApiResponse('Download PDF  err -->',data)){
                        return false;
                    }
                });
            },

            populateCpObject: function (data) {
                var cpArray = [];
                for (var i = 0; i < (data[0].objects.length); i++) {
                    var arr = [];
                    $.each(data[0].objects[i].optionalAnswers, function (key, value) {
                        arr.push(value.text.toString());
                    });
                    var ansP = {
                        isAnswerd: false,
                        selectedAnswer: null,
                        answerCpId: null,
                        isCorrect: null,
                        correctAnswerKeys: null,
                        explanation: null
                    };
                    if (!$.isEmptyObject(data[1].objects)) {
                        $.grep(data[1].objects, function (el) {
                            if (el.parentId === data[0].objects[i].id) {
                                ansP.isAnswerd = true;
                                ansP.selectedAnswer = (parseInt(el.answerKey) - 1);
                                ansP.answerCpId = el.id;
                                ansP.isCorrect = el.isCorrect;
                                ansP.correctAnswerKeys = el.correctAnswerKeys;
                                ansP.explanation = el.explanation;
                                return el
                            }
                        });
                    }
                    cpArray.push({
                        key: i,
                        question: data[0].objects[i].question,
                        answeres: arr,
                        isAnswerd: ansP.isAnswerd,
                        selectedAnswer: ansP.selectedAnswer,
                        isCorrect: ansP.isCorrect,
                        correctAnswerKeys: ansP.correctAnswerKeys,
                        explanation: ansP.explanation,
                        hintText: data[0].objects[i].hint,
                        startTime: data[0].objects[i].startTime,
                        cpId: data[0].objects[i].id,
                        cpEntryId: data[0].objects[i].entryId,
                        answerCpId: ansP.answerCpId
                    });
                }
                $.cpObject.cpArray = cpArray;
            },

            checkIfDone: function (questionNr) {
                var _this = this;
                if(_this.isErr){
                    return
                }
                if ($.cpObject.cpArray.length === 0){
                    _this.continuePlay();
                    return
                }
                if (_this.quizSubmitted) {
                    _this.quizPlugin.ssSubmitted(_this.score);
                }
                else{
                    var anUnswered = _this.getUnansweredQuestNrs();
                    if (!anUnswered){
                        _this.reviewMode = true;
                    }
                    if (($.cpObject.cpArray.length - 1) === questionNr){
                        _this.quizEndFlow = true;
                    }
                    _this.continuePlay();
                }
            },
            continuePlay: function () {
                var _this = this;
                if (!_this.isErr) {
                    if (_this.quizPlugin.isScreenVisible()){
                        _this.quizPlugin.ivqHideScreen();

                        if (_this.quizPlugin.isSeekingIVQ ) {
                            _this.embedPlayer.stopPlayAfterSeek = false;
                        }
                    }
                    mw.log("Quiz: Continue Play  ");
                    _this.embedPlayer.play();
                    _this.quizPlugin.selectedAnswer = null;
                }
            },
            gotoScrubberPos: function (questionNr) {
                var _this = this,seekTo;
                seekTo = (($.cpObject.cpArray[questionNr].startTime) /1000)-0.5;
                mw.log("Quiz: seekTo: " + seekTo);
                _this.embedPlayer.seek(seekTo,false);
            },
            cuePointReachedHandler: function (e, cuePointObj) {
                var _this = this;
               
                $.each($.cpObject.cpArray, function (key, val) {
                    if ($.cpObject.cpArray[key].startTime === cuePointObj.cuePoint.startTime) {
                        _this.quizPlugin.ssSetCurrentQuestion(key,false);
                    }
                });
            },

            checkUserEntryIdReady:function(callback){
                var _this = this;
                if (_this.intrVal){
                    _this.intrVal = false;
                }
                _this.intrVal = setInterval(function () {
                    if (_this.kQuizUserEntryId){
                        clearInterval(_this.intrVal);
                        _this.intrVal = false;
                        callback()
                    }
                }, 500);
            },
            checkCuepointsReady:function(callback){
                var interVal = setInterval(function () {
                    if ($.cpObject.cpArray && $.quizParams ){
                        clearInterval(interVal);
                        callback()
                    }
                }, 500);
            },
            getUnansweredQuestNrs: function () {
                var unanswerdArr = [];
                $.each($.cpObject.cpArray, function (key, val) {
                    if ($.cpObject.cpArray[key].isAnswerd === false) {
                        unanswerdArr.push($.cpObject.cpArray[key]);
                    }
                });
                if ($.isEmptyObject(unanswerdArr)){
                    return false;
                }
                else {
                    return unanswerdArr;
                }
            },

            submitAnswer:function(questionNr,selectedAnswer){
                var _this = this,isAnswered;

                $.cpObject.cpArray[questionNr].selectedAnswer = selectedAnswer;

                if ($.cpObject.cpArray[questionNr].isAnswerd) {
                    isAnswered = true;
                }
                else{
                    isAnswered = false;
                    $.cpObject.cpArray[questionNr].isAnswerd = true;
                }

                _this.KIVQApi.addAnswer(isAnswered,_this.i2q(selectedAnswer),_this.kQuizUserEntryId,questionNr,function(data){

                    if (!_this.checkApiResponse('Add question err -->',data)){
                        return false;
                    }else {
                        $.cpObject.cpArray[questionNr].answerCpId = data.id;
                    }
                })
            },
            bubbleSizeSelector: function (isFullScreen) {
                var _this = this, buObj = {bubbleAnsSize: "", bubbleUnAnsSize: ""};
                if (_this.quizEndFlow) {
                    if (isFullScreen) {
                        buObj.bubbleAnsSize = "bubble-fullscreen";
                        buObj.bubbleUnAnsSize = "bubble-window-quizEndFlow";
                    }
                    else {
                        buObj.bubbleAnsSize = "bubble-window";
                        buObj.bubbleUnAnsSize = "bubble-window-quizEndFlow";
                    }
                }
                else {
                    if (isFullScreen) {
                        buObj.bubbleAnsSize = "bubble-fullscreen";
                        buObj.bubbleUnAnsSize = "bubble-fullscreen";
                    }
                    else {
                        buObj.bubbleAnsSize = "bubble-window";
                        buObj.bubbleUnAnsSize = "bubble-window";
                    }
                }
                return buObj
            },
            quizEndScenario:function(){
                var _this = this,anUnswered = _this.getUnansweredQuestNrs();
                _this.embedPlayer.stopPlayAfterSeek = true;
                if (anUnswered) {
                    _this.quizEndFlow = true;
                    _this.quizPlugin.ssAlmostDone(anUnswered);
                }else if (!_this.quizSubmitted){
                    _this.quizPlugin.ssAllCompleted();
                }
            },
            displayHex:function (hexPositionContDisplay,cpArray){
                var _this = this;
                var numberOfQuestionsInRow = 6;
                _this.sliceArray = _this.buildHexSliceArr(numberOfQuestionsInRow,cpArray.length);

                var displayRows = $.grep(_this.sliceArray, function (element, index) {
                    return element.rContPos == hexPositionContDisplay;
                });

                $.each(displayRows,function(key,val){
                    var rowHexElements =  _this.makeHexRow(val.rStart,val.rEnd+1,key,cpArray);
                    _this.embedPlayer.getInterface().find(".hexagon-container").append(rowHexElements);
                });
                _this.embedPlayer.getInterface().find(".display-all-container").hide().fadeIn(400);

                if((_this.embedPlayer.getInterface().find(".second-row").length) == 0 ){
                    _this.embedPlayer.getInterface().find(".display-all-container").addClass("margin-top5");
                    _this.embedPlayer.getInterface().find(".left-arrow").addClass("margin-top4");
                }
                else{
                    _this.embedPlayer.getInterface().find(".display-all-container").removeClass("margin-top5");
                    _this.embedPlayer.getInterface().find(".left-arrow").removeClass("margin-top4");


                    if($(".second-row li").length % 2 == 0){
                        _this.embedPlayer.getInterface().find(".second-row").removeClass("padding-left11");
                    }
                    else{
                        _this.embedPlayer.getInterface().find(".second-row").addClass("padding-left11");
                    }
                }

                switch(_this.checkHexStatusForArrow()) {
                    case 'none':
                        $(".right-arrow").off().hide();
                        $(".left-arrow").off().hide();
                        return;
                        break;
                    case 'left':
                        $(".right-arrow").hide();
                        $(".left-arrow").show();
                        break;
                    case 'right':
                        $(".left-arrow").hide();
                        $(".right-arrow").show();
                        break;
                    case 'both':
                        $(".left-arrow").show();
                        $(".right-arrow").show();
                        break;
                }

                $(".right-arrow").off().on('click', function(){
                    _this.embedPlayer.getInterface().find(".hexagon-container").empty();
                    _this.displayHex(_this.setHexContainerPos("right"),cpArray);

                });

                $(".left-arrow").off().on('click', function(){
                    _this.embedPlayer.getInterface().find(".hexagon-container").empty();
                    _this.displayHex(_this.setHexContainerPos("left"),cpArray);
                });
            },

            buildHexSliceArr: function (hexInRow,cpArrayLen) {
                var i = 0,arr = [],rStart,rEnd,cp = 0,switcher = false,hexInRow2 = hexInRow - 1;
                do {
                    rStart = i;
                    rEnd = i + hexInRow;
                    if (!switcher) {
                        rEnd = i + hexInRow;
                        arr.push({rStart: i, rEnd: i + hexInRow, rContPos: cp});
                    }
                    else {
                        rEnd = i + hexInRow2;
                        arr.push({rStart: i, rEnd: i + hexInRow2 , rContPos: cp});
                    }
                    i = rEnd + 1;
                    if (switcher) cp ++;
                    switcher = !switcher;
                } while (i < cpArrayLen);
                return arr;
            },
            makeHexRow: function (rStart,rEnd,rowNumber,cpArray) {
                var ol,el,_this = this;
                ol = document.createElement('ol');
                $.each(cpArray.slice(rStart, rEnd), function (i, data) {
                    el = document.createElement('li');
                    var questionHexType = (function () {
                        if (data.isCorrect===null || data.isCorrect){
                            return 'q-box';
                        }
                        else {
                            return 'q-box-false';
                        }
                    })();
                    $(el).addClass(questionHexType).attr("id", data.key).append(_this.i2q(data.key));
                    switch(rowNumber){
                        case 0:$(ol).addClass('first-row');break;
                        case 1:$(ol).addClass('second-row');break;
                    }
                    ol.appendChild(el);
                });
                return ol;
            },

            setHexContainerPos:function(action){
                var posNr,_this = this;

                switch(action){
                    case "current":
                        posNr = _this.hexPosContainerPos;
                        break;
                    case "right":
                        posNr = ++_this.hexPosContainerPos;
                        break;
                    case "left":
                        posNr = --_this.hexPosContainerPos;
                        break;
                }
                return posNr;
            },

            checkHexStatusForArrow:function(){
                var _this = this;
                var lastPos = ((_this.sliceArray.slice(-1))[0].rContPos);
                var sliceArrLen =_this.sliceArray.length;

                if  (_this.hexPosContainerPos == 0  && sliceArrLen <= 2) {
                    return 'none';
                }

                if  (_this.hexPosContainerPos == 0  && sliceArrLen >= 3) {
                    return 'right';
                }
                else if (_this.hexPosContainerPos == lastPos && sliceArrLen  >= 3 ){
                    return 'left';
                }
                else  {
                    return 'both';
                }
            },
            i2q: function (i) {
                return parseInt(i) + 1;
            },
            q2i: function (i) {
                return parseInt(i) - 1;
            },
            showQuizOnScrubber:function(){
                var _this = this;
                mw.log("Quiz: Show Quiz on Scrubber");
                _this.quizPlugin.displayBubbles();
                //!_this.quizSubmitted for IOS9 Android5 &&
                if (_this.quizEndFlow && !_this.quizSubmitted){
                    _this.showQuizEndOnScrubber();
                }
            },
            hideQuizOnScrubber:function(){
                var _this = this;
                this.embedPlayer.getInterface().find(".bubble-cont").empty().remove();
                this.embedPlayer.getInterface().find(".bubble").empty().remove();
                _this.hideQuizEndOnScrubber();
            },
            showQuizEndOnScrubber:function(){
                var _this = this;
                _this.hideQuizEndOnScrubber();
                _this.quizPlugin.displayQuizEndMarker();
            },
            hideQuizEndOnScrubber:function(embedPlayer){
                this.embedPlayer.getInterface().find(".quizDone-cont").empty().remove();
            },
            checkApiResponse:function(msg,data){
                var _this = this;
                if (data.objectType.indexOf("Exception") >= 0 ){
                    _this.errMsg(msg, data );
                    return false;
                }
                else{
                    return true;
                }
            },
            sendIVQMesageToListener:function(){
                try {
                    var _this = this;
                    window.kdp = document.getElementById( _this.embedPlayer.id );
                    window.kdp.sendNotification("QuizSubmitted", _this.kQuizUserEntryId);
                    mw.log('Quiz: QuizSubmitted sent to kdp');
                } catch (e) {
                    mw.log('postMessage listener of parent is undefined: ', e);
                }
            },
            errMsg:function(errMsg,data){
                var _this = this;
                if (data.code ==="PROVIDED_ENTRY_IS_NOT_A_QUIZ"){
                    return
                }
                mw.log(errMsg, data);
                _this.quizPlugin.ivqShowScreen();
                _this.KIVQScreenTemplate.tmplErrorScreen();
                $(".sub-text").html(gM('mwe-quiz-err-msg'));
                _this.isErr = true;
            },
            destroy: function () {

                var _this = this;
                clearInterval(_this.intrVal);
                _this.intrVal = null;
            },
            unloadQuizPlugin:function(embedPlayer){
              var _this = this;
                $.cpObject = {};
                $.quizParams = {};
                $(this.embedPlayer).unbind(_this.bindPostfix);
                embedPlayer.unbindHelper(_this.bindPostfix);
                embedPlayer.removeJsListener(_this.bindPostfix);
                _this.hideQuizOnScrubber();
                mw.log("Quiz: Plugin Unloaded");            }
        })) {
    }
})(window.mw, window.jQuery );

