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
            currentScore: null ,
            calculatedScore: null ,
            scoreType: undefined ,
            retakeNumber: undefined,
            embedPlayer: null,
            quizPlugin: null,
            showGradeAfterSubmission: false,
            canSkip: false,
            showWelcomePage: true,
            hexPosContainerPos: 0,
            sliceArray: [],
            isErr: false,
            quizSubmitted: false,
            intrVal: null,
            quizEndFlow: false,
            bindPostfix: '.quizPlugin',
            reviewMode:false,
            isKPlaylist:false,
            answeredCurrent:true,
            answerTryouts:0,
            questionIndex:-1,
            kQuizEntryId: "",
            QUESTIONS_TYPE: {
                MULTIPLE_CHOICE_ANSWER: 1,
                TRUE_FALSE: 2,
                REFLECTION_POINT: 3,
                MULTIPLE_ANSWER_QUESTION: 4,
                FILL_IN_BLANK: 5,
                HOT_SPOT: 6,
                GO_TO: 7,
                OPEN_QUESTION: 8,
            },

            init: function (embedPlayer,quizPlugin) {
                var _this = this;
                _this.kQuizEntryId = embedPlayer.kentryid;
                _this.KIVQApi = new mw.KIVQApi(embedPlayer);
                _this.KIVQScreenTemplate = new mw.KIVQScreenTemplate(embedPlayer);
                this.destroy();
                this.embedPlayer = embedPlayer;
                this.quizPlugin = quizPlugin;
            },
            setupQuiz:function(){
                var _this = this,
                    deferred = $.Deferred();

                _this.KIVQApi.getUserEntryIdAndQuizParams( function(data) {
                    // validate data integrity 
                    if (!_this.checkApiResponse('User Entry err-->', data[0])) {
                        return false;
                    }
                    if (!_this.checkApiResponse('Quiz Params err-->', data[1])) {
                        return false;
                    }
                    var userEntryData = data[0];
                    var quizParamsData = data[1];
                    if ( !("uiAttributes" in quizParamsData)) {
                        deferred.reject(data, 'quiz is empty');
                        return deferred;
                    }
                    else {
                        $.quizParams = quizParamsData;
                        _this.scoreType = quizParamsData.scoreType ? quizParamsData.scoreType : 0; 
                        var dataForBanSeek = {
                            status: false,
                            alertText: ''
                        };
                        $.grep($.quizParams.uiAttributes, function (e) {
                            
                            if (e.key == "banSeek" && e.value) {
                                dataForBanSeek.status = e.value.toLowerCase() === 'true';
                            }
                            if (e.key == "noSeekAlertText") {
                                dataForBanSeek.alertText =  e.value;
                            }
                            if (e.key == "canSkip") {
                                _this.canSkip = (e.value.toLowerCase() === 'true');
                            } else if (e.key == "showWelcomePage") {
                                _this.showWelcomePage = (e.value.toLowerCase() === 'true');
                            }
                        });
                        $.quizParams.allowSeekForward = dataForBanSeek.status;

                        //send notification to banSeekManager with params from Editor
                        if(dataForBanSeek.status && !_this.canSkip){
                            _this.embedPlayer.sendNotification('activateBanSeek',dataForBanSeek);
                        }
                        // handle user entry 
                        if (userEntryData.totalCount > 0) {
                            // calculate how many times we are allowed to take this quiz 
                            _this.retakeNumber = userEntryData.objects[0].version ? userEntryData.objects[0].version : 0; // support old quiz that do not have version
                            _this.currentScore = Math.round(userEntryData.objects[0].calculatedScore * 100);
                            if(isNaN(_this.currentScore) && userEntryData.objects.length > 1  ){
                                // we need to grab the score from previous userEntry ()
                                var latestVersion = userEntryData.objects[0].version;
                                if(userEntryData.objects[latestVersion] && userEntryData.objects[latestVersion].hasOwnProperty("calculatedScore") ){
                                    _this.currentScore = userEntryData.objects[latestVersion].calculatedScore;
                                }
                            }
                            _this.calculatedScore = _this.currentScore/100;
                            switch (String(userEntryData.objects[0].status)) {
                                case 'quiz.3':
                                    if ($.quizParams.showGradeAfterSubmission) {
                                        _this.score = Math.round(userEntryData.objects[0].score * 100);
                                    }
                                    _this.quizSubmitted = true;
                                    break;
                                case '1':
                                    break;
                                case '2':
                                    // TODO - check this 
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
                        deferred.resolve(data);
                    });
                });
                return deferred;
            },

            getQuestionsAndAnswers: function (callback) {
                var _this = this;
                _this.KIVQApi.getQuestionAnswerCuepoint(_this.kQuizEntryId, _this.kQuizUserEntryId, function(data){
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
                        _this.sendIVQMesageToListener("QuizSubmitted", data.id);
                        $.cpObject = {};
                        _this.getQuestionsAndAnswers(_this.populateCpObject);
                        // store current score for next retake screen 
                        if(data.hasOwnProperty("calculatedScore")){
                            _this.calculatedScore = data.calculatedScore;
                        }
                        _this.checkCuepointsReady(function(){
                            _this.score = Math.round(data.score *100);
                            _this.quizPlugin.ssSubmitted(_this.score);
                            _this.quizSubmitted = true;
                        });
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
                    // data[0] refers to the questions 
                    $.each(data[0].objects[i].optionalAnswers, function (key, value) {
                        if(value.text){
                            arr.push(value.text.toString());
                        }
                    });
                    var ansP = {
                        isAnswerd: false,
                        selectedAnswer: null,
                        answerCpId: null,
                        isCorrect: null,
                        correctAnswerKeys: null,
                        explanation: null
                    };
                    // data[1] refers to the answers by this user 
                    if (!$.isEmptyObject(data[1].objects)) {
                        $.grep(data[1].objects, function (el) {
                            if (el.parentId === data[0].objects[i].id) {
                                ansP.isAnswerd = true;
                                ansP.selectedAnswer = (parseInt(el.answerKey) - 1);
                                ansP.answerCpId = el.id;
                                ansP.isCorrect = el.isCorrect;
                                ansP.correctAnswerKeys = el.correctAnswerKeys;
                                ansP.explanation = el.explanation;
                                if(el.openAnswer){
                                    ansP.openAnswer = el.openAnswer;
                                }
                                if(el.feedback){
                                    ansP.feedback = el.feedback.split('||');
                                }
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
                        answerCpId: ansP.answerCpId,
                        openAnswer: ansP.openAnswer,
                        questionType: data[0].objects[i].questionType,
                        feedback: $(ansP.feedback).get(-1),
                    });
                }
                $.cpObject.cpArray = cpArray;
            },
            
            checkIfDone: function (questionNr) {
                mw.log("Quiz: checkIfDone begin");
                var _this = this;
                if(_this.isErr){
                    mw.log("Quiz: checkIfDone Error");
                    return;
                }
                if(!_this.answeredCurrent && questionNr){
                    mw.log("Quiz: Reached timeout with no response from server");
                    _this.answerTryouts++;
                    // the current answer were not responded - check again in 500 ms 
                    setTimeout(function(){
                        mw.log("Quiz: checkIfDone setTimeout" , _this.answerTryouts );
                        if(_this.answerTryouts >=6 ){
                            mw.log("Quiz: failed after 7 checks (~5 sec)- assume BE problem. Stop and show error message");
                            _this.answerTryouts = 0;
                            _this.questionIndex = questionNr;
                            _this.errMsg('answer-not-received' );
                            return;
                        }
                        mw.log("Quiz: check server response again");
                        _this.checkIfDone(questionNr);
                    },500);
                    return;
                }
                mw.log("Quiz: checkIfDone - pass checkIfDone");
                _this.embedPlayer.getInterface().find(".screen.quiz").removeClass("answering");
                _this.answerTryouts = 0;
                if ($.cpObject.cpArray.length === 0){
                    mw.log("Quiz: no cp to process");
                    _this.continuePlay();
                    return;
                }
                if (_this.quizSubmitted) {
                    mw.log("Quiz: quizSubmitted !");
                    _this.quizPlugin.ssSubmitted(_this.score);
                }else{
                    var anUnswered = _this.getUnansweredQuestNrs();
                    if (!anUnswered.length){
                        mw.log("Quiz: anUnswered");
                        _this.reviewMode = true;
                    }
                    if (($.cpObject.cpArray.length - 1) === questionNr){
                        mw.log("Quiz: quizEndFlow");
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
                        _this.quizPlugin.ssSetCurrentQuestion(key);
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
                    return [];
                }
                else {
                    return unanswerdArr;
                }
            },
            /**
             * This serves reqular questions and also open-question. It is not expected to get both selectedAnswer and openQuestionText
             * @param {*} questionNr 
             * @param {*} selectedAnswer 
             * @param {*} openQuestionText 
             */
            submitAnswer:function(questionNr,selectedAnswer,openQuestionText){
                mw.log("Quiz: submitAnswer " + questionNr + " " + selectedAnswer + " " + openQuestionText);
                var _this = this,isAnswered;
                this.answeredCurrent = false;
                _this.embedPlayer.getInterface().find(".screen.quiz").addClass("answering");
                $.cpObject.cpArray[questionNr].selectedAnswer = selectedAnswer;
                if ($.cpObject.cpArray[questionNr].isAnswerd) {
                    mw.log("Quiz: submitAnswer - answered" );
                    isAnswered = true;
                }else{
                    mw.log("Quiz: submitAnswer - not answered" );
                    isAnswered = false;
                    $.cpObject.cpArray[questionNr].isAnswerd = true;
                }
                _this.KIVQApi.addAnswer(isAnswered,_this.i2q(selectedAnswer),_this.kQuizUserEntryId,questionNr,function(data){
                    mw.log("Quiz: addAnswer callback" ,data );
                    if (!_this.checkApiResponse('Add question err -->',data)){
                        mw.log("Quiz: submitAnswer Add question err" );
                        return false;
                    }else {
                        mw.log("Quiz: addAnswer OK" );
                        _this.answeredCurrent = true;
                        var ivqNotificationData = {
                            questionIndex: questionNr,
                            questionType: $.cpObject.cpArray[questionNr].questionType,
                            questionText: $.cpObject.cpArray[questionNr].question,
                            answer: selectedAnswer || openQuestionText,
                            attemptNumber: $.quizParams.version
                        };
                        mw.log("Quiz: addAnswer data" , ivqNotificationData );
                        _this.sendIVQMesageToListener("QuestionAnswered", ivqNotificationData);
                        $.cpObject.cpArray[questionNr].answerCpId = data.id;
                    }
                },openQuestionText);
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
                if ( anUnswered.length ) {
                    // there are still unanswered questions - show "almost done" screen 
                    _this.quizEndFlow = true;
                    _this.quizPlugin.ssAlmostDone(anUnswered);
                }else if (!_this.quizSubmitted){
                    // the quiz has unanswered questions and was not sumitted yet - show "submit" screen (ssAllCompleted)
                    _this.quizPlugin.ssAllCompleted();
                }else if(!_this.quizEndFlow){
                    // Quiz is already submitted - show the "submitted" screen
                    _this.quizPlugin.ssSubmitted(_this.score); 

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
                            return 'q-box ';
                        }
                        else {
                            return 'q-box q-box-false';
                        }
                    })();
                    if(data.questionType === _this.QUESTIONS_TYPE.REFLECTION_POINT){
                        questionHexType += ' reflection-point-question';
                    }
                    if(data.questionType === _this.QUESTIONS_TYPE.OPEN_QUESTION){
                        questionHexType += ' open-question';
                    }
                    $(el).addClass(questionHexType).attr("id", data.key).append(_this.i2q(data.key));
                    $(el).append('<div class="mask" />')
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
                if ( (_this.quizEndFlow && !_this.quizSubmitted )
                        || $.quizParams.attemptsAllowed ){
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
            sendIVQMesageToListener:function(event, payload){
              this.embedPlayer.sendNotification(event, payload);
            },
            backToQuestion:function(e){
                if(e && e.type === "keydown" && e.keyCode !== "13"){
                    return;
                }
                this.isErr = false;
                if( !$.cpObject.cpArray[this.questionIndex].openAnswer ){
                    $.cpObject.cpArray[this.questionIndex].isAnswerd = false; // clear previous selection 
                }else{
                    $.cpObject.cpArray[this.questionIndex].openQuestionFailed = true;
                }
                this.gotoScrubberPos(this.questionIndex);
                this.answeredCurrent=true;
                this.answerTryouts=0;
                this.questionIndex=-1;
            },
            errMsg:function(errMsg,data){
                var _this = this;
                _this.embedPlayer.getInterface().find(".screen.quiz").removeClass("answering");
                if (data && data.code ==="PROVIDED_ENTRY_IS_NOT_A_QUIZ"){
                    return;
                }
                mw.log(errMsg, data);
                var isAnswerError = errMsg === "answer-not-received" ;
                _this.quizPlugin.ivqShowScreen();
                _this.KIVQScreenTemplate.tmplErrorScreen(isAnswerError);
                if(isAnswerError){
                    $(".sub-text").html(gM('mwe-quiz-submit-failed-description'));
                }else{
                    $(".sub-text").html(gM('mwe-quiz-err-msg'));
                }
                _this.isErr = true;
                $("#back-to-question").click(function(){
                    _this.backToQuestion();
                }).on('keydown', _this.backToQuestion);
            },
            retake: function (callback){
                this.KIVQApi.retake(callback);
            },
            destroy: function () {
                this.answeredCurrent=true;
                this.answerTryouts=0;
                this.questionIndex=-1;
                this.score = undefined;
                this.currentScore = undefined;
                this.scoreType = undefined;
                this.quizEndFlow = false;
                this.quizSubmitted = false;
                clearInterval(this.intrVal);
                this.intrVal = null;
            },
            unloadQuizPlugin:function(embedPlayer){
              var _this = this;
                $.cpObject = {};
                $.quizParams = {};
                $(this.embedPlayer).unbind(_this.bindPostfix);
                embedPlayer.unbindHelper(_this.bindPostfix);
                embedPlayer.removeJsListener(_this.bindPostfix);
                _this.hideQuizOnScrubber();
                mw.log("Quiz: Plugin Unloaded");     
            }
        })) {
    }
})(window.mw, window.jQuery );

