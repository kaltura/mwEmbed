(function (mw, $) {
    "use strict";
    $.cpObject = {};
    $.quizParams = {};
    mw.PluginManager.add('quiz', mw.KBaseScreen.extend({
        defaultConfig: {
            parent: "controlsContainer",
            order: 5,
            align: "right",
            tooltip: gM('mwe-quiz-tooltip'),
            visible: false,
            showTooltip: true,
            displayImportance: 'medium',
            templatePath: '../Quiz/resources/templates/quiz.tmpl.html',
            usePreviewPlayer: false,
            previewPlayerEnabled: false
        },
        entryData: null,
        state: "start",
        currentQuestionNumber: 0,
        kQuizUserEntryId: null,
        reviewMode: false,
        showCorrectKeyOnAnswer: false,
        showResultOnAnswer: false,
        canDownloadQuestions: '',
        canSkip: null,
        showTotalScore:null,
        score: null,
        sliceArray: [],
        hexPosContainerPos:0,
        isSeekingIVQ:false,
        isErr: false,

        setup: function () {
            var _this = this;
            var getQuizuserEntryIdAndQuizParams = [{
                'service': 'userEntry',
                'action': 'list',
                'filter:objectType': 'KalturaQuizUserEntryFilter',
                'filter:entryIdEqual': _this.embedPlayer.kentryid,
                'filter:userIdEqualCurrent':'1',
                'filter:orderBy': '-createdAt'
            }, {
                'service': 'quiz_quiz',
                'action': 'get',
                'entryId': _this.embedPlayer.kentryid
            }

            ];

            _this.getKClient().doRequest(getQuizuserEntryIdAndQuizParams, function (data) {
                console.log("Quiz Params -->");
                console.log(data);

                $.grep(data, function (e) {
                    if (e.objectType || data[1].uiAttributes === undefined ){
                        console.log('Connect to quiz err -->', e.code, e.message);
                        _this._errMsg();
                        return false;
                    }
                });

                $.quizParams = data[1];

                if (data[0].totalCount > 0 &&  !$.isEmptyObject(data[0].objects[0])) {
                    _this.kQuizUserEntryId = data[0].objects[0].id;
                    console.log('exist kQuizUserEntryId-----> ' +_this.kQuizUserEntryId);

                    switch (String(data[0].objects[0].status)) {
                        case 'quiz.3':
                            _this.score = Math.round(data[0].objects[0].score *100);
                            _this._getQuestionCpAPI(_this._populateCpObject);
                            break;
                        case '1':
                            _this._getQuestionCpAPI(_this._populateCpObject);
                            break;
                        case '2':
                            _this._errMsg();
                            return false;
                            break;
                    }
                }
                else {
                    var createQuizuserEntryId = {
                        'service': 'userEntry',
                        'action': 'add',
                        'userEntry:objectType': 'KalturaQuizUserEntry',
                        'userEntry:entryId': _this.embedPlayer.kentryid
                    };

                    _this.getKClient().doRequest(createQuizuserEntryId, function (data) {
                        console.log('create user entry Id->');
                        console.log(data);
                        if (data.objectType){
                            console.log('Add KQ user entry id err -->', data.code, data.message);
                            _this._errMsg();
                            return false;
                        }
                        _this.kQuizUserEntryId = data.id;
                        console.log('created kQuizUserEntryId-----> ' +_this.kQuizUserEntryId);
                        _this._getQuestionCpAPI(_this._populateCpObject);
                    });
                }
            });
            this.addBindings();
        },
        addBindings: function () {
            var _this = this;
            var embedPlayer = this.getPlayer();
            var firstPlay = true;
            this.bind('layoutBuildDone', function () {
                var entryRequest = {
                    'service': 'baseEntry',
                    'action': 'get',
                    'entryId': embedPlayer.kentryid
                };
                _this.getKClient().doRequest(entryRequest, function (data) {
                    if (data.objectType){
                        _this._errMsg();
                        console.log('Get entry data err -->', data.code, data.message);
                        return false;
                    }
                    _this.entryData = data;
                    _this._initParams();

                });
            });

            this.bind('KalturaSupport_CuePointReached', function (e, cuePointObj) {
                if(!_this.isSeekingIVQ) _this.qCuePointHandler(e, cuePointObj);
                if(_this.enablePlayDuringScreen) _this.enablePlayDuringScreen = false;

            });

            this.bind('showScreen', function () {
                embedPlayer.disablePlayControls();
                embedPlayer.pause();
            });

            this.bind('firstPlay', function () {
                _this.enablePlayDuringScreen = true;
                embedPlayer.pause();
                embedPlayer.sendNotification('doStop');
                _this._showWelcomeScreen();
            });

            this.bind('onplay', function (e) {

          });

            this.bind('seeked', function () {
                setTimeout(function () {_this.isSeekingIVQ = false;}, 0);
            });
            this.bind('seeking', function () {
                _this.isSeekingIVQ = true;
            });

            embedPlayer.addJsListener( 'kdpReady', function(){
                if (embedPlayer.autoplay) embedPlayer.autoplay = false;
                embedPlayer.removeJsListener( 'kdpReady');
            });
            embedPlayer.addJsListener( 'playerPlayEnd', function(){
                var anUnswered = _this.getUnansweredQuestNrs();
                if (anUnswered) _this.almostDone(anUnswered);
            });
        },
        getKClient: function () {
            if (!this.kClient) {
                this.kClient = mw.kApiGetPartnerClient(this.embedPlayer.kwidgetid);
            }
            return this.kClient;
        },
        getTemplateHTML: function (data) {
            var defer = $.Deferred();
            var quizStartTemplate = this.getTemplatePartialHTML("quizstart");

            var $template = $(quizStartTemplate({
                'quiz': this,
                quizStartTemplate: quizStartTemplate
            }));
            return defer.resolve($template);
        },
        _continuePlay: function () {
            var _this = this, embedPlayer = this.getPlayer();
            if (!_this.isErr) {
                if (_this.isScreenVisible())_this.removeScreen();
                embedPlayer.enablePlayControls();
                embedPlayer.play();
                _this.displayBubbles();
            }
        },
        _initParams: function () {
            var _this = this;
            $.grep($.quizParams.uiAttributes, function (e) {

                if (e.key == "showTotalScore") {
                    _this.showTotalScore = (e.value ==='true') ;
                }
                if (e.key == "canSkip") {
                    _this.canSkip = (e.value ==='true') ;
                }
            });
        },
        _showWelcomeScreen: function () {
            var _this = this;
            _this.removeShowScreen("welcome");
            $(".welcome").html(gM('mwe-quiz-welcome'));
            $(".confirm-box").html(gM('mwe-quiz-plsWait'));

            _this._checkCuepointsReady(function(){

                $.grep($.quizParams.uiAttributes, function (e) {
                    switch(e.key){
                        case 'welcomeMessage':
                            $(".welcomeMessage").html(e.value);
                            break;
                        case 'inVideoTip':
                            if (e){
                                $(".InvideoTipMessage").html(gM('mwe-quiz-invideoTip'));
                            }
                            break;
                    }
                });
                $(".confirm-box").html(gM('mwe-quiz-continue'))
                    .on('click', function () {
                    _this.checkIfDone(0);
                    });

            });
        },

       _checkCuepointsReady:function(callback){
           var intrVal;
           intrVal = setInterval(function () {
               if ($.cpObject.cpArray){
                   clearInterval(intrVal);
                   callback()
               }
           }, 500);
        },

        _gotoScrubberPos: function (questionNr) {
            var player = this.getPlayer();
            player.sendNotification('doSeek', ($.cpObject.cpArray[questionNr].startTime) / 999);
        },
        qCuePointHandler: function (e, cuePointObj) {
            var _this = this;

            if (!$.quizParams.showCorrectAfterSubmission && _this.score !== null) return;
            $.each($.cpObject.cpArray, function (key, val) {
                if ($.cpObject.cpArray[key].startTime === cuePointObj.cuePoint.startTime) {
                    _this.currentQuestionNumber = key;
                    _this.setCurrentQuestion(key);
                }
            });

        },
        showAnswered: function (cPo, questionNr) {
            var _this = this;
            $.each(cPo.answeres, function (key, value) {
                if (key == $.cpObject.cpArray[questionNr].selectedAnswer) {
                    $('#' + key).parent().addClass("wide single-answer-box-bk-applied disable");
                    //if (_this.reviewMode){
                    //    $('#' + key).parent().addClass('disable')
                    //}
                    $('#' + key).removeClass('single-answer-box')
                        .addClass(function(){
                            $(this).addClass('single-answer-box-small')
                                .after($('<div></div>').addClass("single-answer-box-apply").text(gM('mwe-quiz-applied'))
                            )
                        });
                }
            });
            if ($.quizParams.allowAnswerUpdate ) {
                _this._selectAnswerConroller(cPo, questionNr);
            }
        },
        _selectAnswerConroller: function (cPo, questionNr) {
            var _this = this,selectedAnswer = null;
            if (_this.score !== null) return;

            $('.single-answer-box-bk' ).on('click',function(){
               // if(_this.reviewMode) {
                    if ($(this).hasClass('disable')) return false;
                    $('.answers-container').find('.disable').removeClass('disable');
                //}
                $('.single-answer-box-bk').each(function () {

                    $(this).removeClass('wide single-answer-box-bk-apply single-answer-box-bk-applied');
                    $('.single-answer-box-apply').empty().remove();
                    $(this).children().removeClass('single-answer-box-small').addClass('single-answer-box');
                });

                $(this).addClass("wide")
                    .addClass('single-answer-box-bk-apply')
                    .children().removeClass('single-answer-box')
                    .addClass(function(){
                        $(this).addClass('single-answer-box-small')
                            .after($('<div></div>').addClass("single-answer-box-apply").text(gM('mwe-quiz-apply'))
                        )
                    });
                selectedAnswer =  $('.single-answer-box-small').attr('id');
            });
            $(document).off( 'click', '.single-answer-box-apply' )
            .on('click', '.single-answer-box-apply', function () {
                    if ($(this).hasClass('disable')) return false;
                    $('.single-answer-box-apply').addClass('disable')
                    .text(gM('mwe-quiz-applied'))
                    .parent().removeClass('single-answer-box-bk-apply').hide().fadeOut('fast')
                    .addClass('single-answer-box-bk-applied disable').hide().fadeIn('fast');

                _this._submitAnswer(questionNr,selectedAnswer);

                $(this).delay(1800).fadeOut(function () {
                    if (_this.isScreenVisible()) _this.removeScreen();
                    _this.checkIfDone(questionNr)
                });
            });
        },
        _submitAnswer:function(questionNr,selectedAnswer){
            var _this = this,answerParams = {};
            $.cpObject.cpArray[questionNr].selectedAnswer = selectedAnswer;

            var quizSetAnswer = {
                'service': 'cuepoint_cuepoint',
                'cuePoint:objectType': "KalturaAnswerCuePoint",
                'cuePoint:answerKey': _this.i2q(selectedAnswer),
                'cuePoint:quizUserEntryId': _this.kQuizUserEntryId
            };

            if ($.cpObject.cpArray[questionNr].isAnswerd) {
                answerParams = {
                    'action': 'update',
                    'id': $.cpObject.cpArray[questionNr].answerCpId,
                    'cuePoint:entryId': _this.embedPlayer.kentryid
                }
            } else {
                $.cpObject.cpArray[questionNr].isAnswerd = true;
                answerParams = {
                    'action': 'add',
                    'cuePoint:entryId': $.cpObject.cpArray[questionNr].cpEntryId,
                    'cuePoint:parentId': $.cpObject.cpArray[questionNr].cpId,
                    'cuePoint:startTime': '0'
                };
            }
                _this._addAnswerAPI(
                _this.i2q(questionNr),
                $.extend(quizSetAnswer, answerParams)
                );
        },
        _addAnswerAPI: function (questionNr, quizSetAnswer) {
        console.log("add answer api get data  --------------------");
            var _this = this;

               _this.getKClient().doRequest(quizSetAnswer, function (data) {
                   console.log(quizSetAnswer);
                   console.log(data);
                   if (data.objectType) {
                       console.log('Add Update answer err -->', data.code, data.message);
                       _this._errMsg();
                   } else {
                       $.cpObject.cpArray[_this.q2i(questionNr)].answerCpId = data.id;
                       $.cpObject.cpArray[_this.q2i(questionNr)].isCorrect = data.isCorrect;
                       $.cpObject.cpArray[_this.q2i(questionNr)].explanation = data.explanation;
                       $.cpObject.cpArray[_this.q2i(questionNr)].correctAnswerKeys = data.correctAnswerKeys;
                   }
               });
        },
        almostDone: function (unAnsweredArr) {
            var _this = this,embedPlayer = _this.getPlayer();

            _this.removeShowScreen("hexScreen");

            $("div").removeClass('confirm-box');
            $(".title-text").html(gM('mwe-quiz-almostDone')).addClass("padding14");
            $(".sub-text").html(gM('mwe-quiz-remainUnAnswered') + '</br>' + gM('mwe-quiz-pressRelevatToAnswer'));

            _this.displayHex(_this.setHexContainerPos("current"),unAnsweredArr);

            $(document).on('click', '.q-box', function () {
                var selectQ = $(this).attr('id');
                embedPlayer.enablePlayControls();
                _this._gotoScrubberPos(selectQ);
                _this.setCurrentQuestion(selectQ);
            });
        },
        checkIfDone: function (questionNr) {
            var _this = this;
            if (_this.score !=null) {
                _this._submitted(_this.score);
            } else {

                if ($.isEmptyObject($.grep($.cpObject.cpArray, function (el) {
                        return el.isAnswerd === false
                    }))) {
                    _this.allCompleted();
                }
                else {
                    if ((questionNr === ($.cpObject.cpArray.length) - 1) && ($.cpObject.cpArray.length > 1)) {
                        _this.almostDone(_this.getUnansweredQuestNrs());
                    } else {
                        _this._continuePlay();
                    }
                }
            }
        },
        getUnansweredQuestNrs: function () {
            var unanswerdArr = [];
            $.each($.cpObject.cpArray, function (key, val) {
                if ($.cpObject.cpArray[key].isAnswerd === false) {
                    unanswerdArr.push($.cpObject.cpArray[key]);
                }
            });
            if ($.isEmptyObject(unanswerdArr)) return false;
            else return unanswerdArr;
        },

        _displayHW: function (HWSelector,questionNr,buttonText,displayText) {
            var _this = this;
            $(".header-container").prepend("<div class ='hint-why-box'>"+ buttonText +"</div>")
                .on('click', function () {
                    _this.removeShowScreen("hintWhyScreen");
                    $(".screen-content" ).addClass('bk-gradient');
                    $(".header-container").addClass('close-button')
                        .on('click', function () {
                            $(".screen-content" ).removeClass('bk-gradient');
                            if (_this.isScreenVisible()) _this.removeScreen();
                            switch(HWSelector){
                                case 'hint':_this.setCurrentQuestion(questionNr);
                                    break;
                                case 'why': _this.state = "reviewAnswer";
                                    _this.reviewAnswer(questionNr);
                                    break;
                            }
                        });
                    $(".hint-container").append(displayText);
                })
        },
        setCurrentQuestion: function (questionNr) {
            var _this = this,cPo = $.cpObject.cpArray[questionNr];
            _this.removeShowScreen("question");
            if ($.cpObject.cpArray[questionNr].hintText){
                _this._displayHW('hint',questionNr,(gM('mwe-quiz-hint')),$.cpObject.cpArray[questionNr].hintText)
            }

            $(".display-question").text(cPo.question);
            $.each(cPo.answeres, function (key, value) {
                var div= $("<div class ='single-answer-box-bk'>"
                    + "<div class ='single-answer-box' id="
                    + key + "><p></p></div></div>");
                div.find('p').text(value);
                div.appendTo('.answers-container');
            });

            if (cPo.isAnswerd) {
                _this.showAnswered(cPo, questionNr);
            }
            else {
                _this._selectAnswerConroller(cPo, questionNr);
            }
            this.addFooter(questionNr);
        },

        addFooter: function (questionNr) {
            var _this = this;
            if (_this.score !== null) {
                $(".ftr-right").html(gM('mwe-quiz-next')).on('click', function () {
                    _this._continuePlay()
                });
                return;
            }
            if (this.reviewMode) {
                $(".ftr-left").html(gM('mwe-quiz-doneReview')).on('click', function () {
                    if (_this.isScreenVisible()) _this.removeScreen();
                    _this.allCompleted();
                });
                if ($.cpObject.cpArray.length > 1) {
                    $(".ftr-right").html(gM('mwe-quiz-reviewNextQ')).on('click', function () {
                        if (_this.isScreenVisible()) _this.removeScreen();
                        function nextQuestionNr(questionNr) {
                            if (questionNr == $.cpObject.cpArray.length - 1) {
                                return 0;
                            } else {
                                return ++questionNr;
                            }
                        }
                        _this.setCurrentQuestion(nextQuestionNr(questionNr));
                    });
                }
            } else {
                $(".ftr-left").append($('<span> ' + gM('mwe-quiz-question') + ' ' + this.i2q(questionNr) + '/'
                                + $.cpObject.cpArray.length + '</span>').css("float", "right"))
                            .append($('<div></div>').addClass("pie").css("float", "right"))
                            .append($('<span>' + (_this.getUnansweredQuestNrs()).length + ' '
                                + gM('mwe-quiz-unanswered') + '</span>').css("float", "right"));
                if (_this.canSkip) {
                    $(".ftr-right").html(gM('mwe-quiz-skipForNow')).on('click', function () {
                        _this.checkIfDone(questionNr);
                    });
                }else if(!_this.canSkip && $.cpObject.cpArray[questionNr].isAnswerd ){
                    $(".ftr-right").html(gM('mwe-quiz-next')).on('click', function () {
                        _this._continuePlay()
                    });
                }
            }
        },
        allCompleted: function () {
            var _this = this;
            this.reviewMode = true;
            _this.removeShowScreen("completed");
            $(".title-text").html("Completed");

            $(".sub-text").html(gM('mwe-quiz-TakeAMoment') + '<strong> '+ gM('mwe-quiz-review').toLowerCase() +' </strong>'
                    + gM('mwe-quiz-yourAnswers') + '</br><strong> '+ gM('mwe-quiz-or') +' </strong>'
                    + gM('mwe-quiz-goAhead')+ '<strong> '+ gM('mwe-quiz-submit').toLowerCase() +' </strong>'
            );

            $(".review-button").html(gM('mwe-quiz-review'))
                .on('click', function () {
                _this.setCurrentQuestion(0);
            });

            $(".submit-button").html(gM('mwe-quiz-submit'))
                .on('click', function () {
                $(this).off('click')
                $(this).html(gM('mwe-quiz-plsWait'))
                _this._submitQuizApi();
            });
        },
        _submitQuizApi: function () {
            var _this = this;
            var submitQuizParams = {
                'service': 'userEntry',
                'action': 'submitQuiz',
                'id': _this.kQuizUserEntryId
            };
            _this.getKClient().doRequest(submitQuizParams, function (data) {
                console.log('submit quiz --');
                console.log(data);

                if (data.objectType){
                    console.log('Submit Quiz err -->',data.code, data.message);
                    _this._errMsg();
                    return false
                }
                $.cpObject = {};

                _this._getQuestionCpAPI(_this._populateCpObject)

                _this._checkCuepointsReady(function(){
                    _this.score = Math.round(data.score *100);
                    _this._submitted(_this.score);
                });

                //setTimeout(function () {
                //    _this._getQuestionCpAPI(_this._populateCpObject)
                //
                //}, 0);

//                _this.score = Math.round(data.score *100);
 //               setTimeout(function () {
  //                  _this._submitted(_this.score);
   //             },2500);

            });
        },
        _submitted: function (score) {
            var _this = this,cpArray = $.cpObject.cpArray;
            _this.removeShowScreen("hexScreen");

            $(".title-text").html("Submitted").addClass("padding8");

            if (_this.showTotalScore){
                if (!$.quizParams.showCorrectAfterSubmission) {
                    $(".sub-text").html(gM('mwe-quiz-completedScore') + '<span class="scoreBig">' + score + '</span>');// %");
                } else {
                    $(".sub-text").html(gM('mwe-quiz-completedScore') + '<span class="scoreBig">' + score + '</span></br>' + gM('mwe-quiz-reviewSubmit'));

                    _this.displayHex(_this.setHexContainerPos("current"),cpArray);

                    $(document).on('click', '.q-box', function () {
                        _this.removeShowScreen("reviewAnswer");
                        _this.reviewAnswer($(this).attr('id'));
                    });
                    $(document).on('click', '.q-box-false', function () {
                        _this.removeShowScreen("reviewAnswer");
                        _this.reviewAnswer($(this).attr('id'));
                    });
                }
            }else{
                $(".sub-text").html(gM('mwe-quiz-completedQuiz'));
            }

            $(".confirm-box").html(gM('mwe-quiz-done'))
                .on('click', function () {
                    _this.removeShowScreen("contentScreen");
                    $(".title-text").html(gM('mwe-quiz-thankYou')).addClass("hint-container");
                    $("div").removeClass('confirm-box');
                    $(this).delay(1000).fadeIn(function () {
                        _this._continuePlay();
                    });
                });
        },
        reviewAnswer: function (selectedQuestion) {
            var _this = this;
            _this.showScreen();
            if ($.cpObject.cpArray[selectedQuestion].explanation ){
                _this._displayHW('why',selectedQuestion,(gM('mwe-quiz-why')),$.cpObject.cpArray[selectedQuestion].explanation)
            }
            $(".reviewAnswerNr").append(_this.i2q(selectedQuestion));
            $(".theQuestion").html(gM('mwe-quiz-q') + "  " + $.cpObject.cpArray[selectedQuestion].question);
            $(".yourAnswerText").html(gM('mwe-quiz-yourAnswer'));
            $(".yourAnswer").html($.cpObject.cpArray[selectedQuestion].answeres[$.cpObject.cpArray[selectedQuestion].selectedAnswer]);
            if (!$.cpObject.cpArray[selectedQuestion].isCorrect) {
                $(".yourAnswer").addClass("wrongAnswer")
            }
            $(".correctAnswerText").html(gM('mwe-quiz-correctAnswer'));

            $(".correctAnswer").html(function () {
                if (!$.isEmptyObject($.cpObject.cpArray[selectedQuestion].correctAnswerKeys)) {

                    return $.cpObject.cpArray[selectedQuestion]
                        .answeres[
                        _this.q2i($.cpObject.cpArray[selectedQuestion].correctAnswerKeys[0].value)
                        ];
                }
                else {return " "}
            });
            $('.gotItBox').html(gM('mwe-quiz-gotIt')).bind('click', function () {
                _this._submitted(_this.score);
            });
        },
        _getQuestionCpAPI: function (callback) {
            var _this = this;
          //  var embedPlayer = this.embedPlayer;
            var getCp = [{
                'service': 'cuepoint_cuepoint',
                'action': 'list',
                'filter:entryIdEqual': _this.embedPlayer.kentryid,
                'filter:objectType': 'KalturaCuePointFilter',
                'filter:cuePointTypeEqual': 'quiz.QUIZ_QUESTION',
                'filter:orderBy': '+startTime'
            },
                {
                    'service': 'cuepoint_cuepoint',
                    'action': 'list',
                    'filter:objectType': 'KalturaAnswerCuePointFilter',
                    'filter:entryIdEqual': _this.embedPlayer.kentryid,
                    'filter:userIdEqualCurrent':'1',
                    'filter:cuePointTypeEqual': 'quiz.QUIZ_ANSWER'
                }];
            _this.getKClient().doRequest(getCp, function (data) {
                console.log("QA CP->");
                console.log(data);
                $.grep(data, function (e) {
                    if (e.objectType){
                        console.log('Get CP question or answer err -->', e.code, e.message);
                        _this._errMsg();
                    }
                });
                callback(data);
            });
        },
        _populateCpObject: function (data) {
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
            console.log("cpArray->");
            console.log($.cpObject.cpArray);
        },
        removeShowScreen:function(state){
            var _this = this,embedPlayer = this.getPlayer();
            this.removeScreen();
            _this.state = state;
            this.showScreen();
            embedPlayer.getInterface().find(".bubble-cont").empty().remove();
            embedPlayer.getInterface().find(".bubble").empty().remove();
        },
        i2q: function (i) {
            return parseInt(i) + 1;
        },
        q2i: function (i) {
            return parseInt(i) - 1;
        },

        displayHex:function (hexPositionContDisplay,cpArray){
            var _this = this,embedPlayer = this.getPlayer();

            _this.sliceArray = _this.buildSliceArr(6,cpArray.length);
            console.log(_this.sliceArray);
            var displayRows = $.grep(_this.sliceArray, function (element, index) {
                return element.rContPos == hexPositionContDisplay;
            });

            $.each(displayRows,function(key,val){
               var rowHexElements =  _this.makeHexRow(val.rStart,val.rEnd+1,key,cpArray);
               embedPlayer.getInterface().find(".hexagon-container").append(rowHexElements);
            });
            embedPlayer.getInterface().find(".display-all-container").hide().fadeIn(400);

            if((embedPlayer.getInterface().find(".second-row").length) == 0 ){
                embedPlayer.getInterface().find(".display-all-container").addClass("margin-top7");
                embedPlayer.getInterface().find(".left-arrow").addClass("margin-top4");
            }
            else{
                embedPlayer.getInterface().find(".display-all-container").removeClass("margin-top7");
                embedPlayer.getInterface().find(".left-arrow").removeClass("margin-top4");


                if($(".second-row li").length % 2 == 0){
                    embedPlayer.getInterface().find(".second-row").removeClass("padding-left11");
                }
                else{
                    embedPlayer.getInterface().find(".second-row").addClass("padding-left11");
                }
            }

            switch(_this._checkHexStatusForArrow()) {
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
                embedPlayer.getInterface().find(".hexagon-container").empty();
                _this.displayHex(_this.setHexContainerPos("right"),cpArray);

            });

            $(".left-arrow").off().on('click', function(){
                embedPlayer.getInterface().find(".hexagon-container").empty();
                _this.displayHex(_this.setHexContainerPos("left"),cpArray);
            });
        },
        buildSliceArr: function (hexInRow,cpArrayLen) {
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
                var className = (function () {

                    if (data.isCorrect===null)
                        return 'q-box';

                    if (data.isCorrect) {
                        return 'q-box';
                    }
                    else {
                        return 'q-box-false';
                    }
                })();
                $(el).addClass(className).attr("id", data.key).append(_this.i2q(data.key));
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
                case "current": posNr = _this.hexPosContainerPos;break;
                case "right": posNr = ++_this.hexPosContainerPos;break;
                case "left":posNr = --_this.hexPosContainerPos;break;
            }
            return posNr;
        },

        _checkHexStatusForArrow:function(){
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

            displayBubbles:function(){
            var  _this = this,embedPlayer = this.getPlayer();
            var scrubber = embedPlayer.getInterface().find(".scrubber");
            var displayClass,cPo = $.cpObject.cpArray;

            embedPlayer.getInterface().find(".bubble-cont").empty().remove();
            embedPlayer.getInterface().find(".bubble").empty().remove();

            scrubber.parent().prepend('<div class="bubble-cont"></div>');

            $.each(cPo, function (key, val) {

                displayClass = val.isAnswerd ? "bubble bubble-ans" : "bubble bubble-un-ans";

                var pos = Math.round(((val.startTime/_this.entryData.msDuration)*100) * 10)/10;
                $('.bubble-cont').append($('<div id ="' + key + '" style="margin-left:' + pos + '%">' +
                    _this.i2q(key) + ' </div>')
                        .addClass(displayClass)
                );
            });
            if (_this.canSkip) {

                $('.bubble').on('click', function () {
                    _this.unbind('seeking');
                    embedPlayer.stopPlayAfterSeek = true;
                    setTimeout(function () { embedPlayer.pause();}, 0);
                    _this._gotoScrubberPos($(this).attr('id'));
                  //  _this.setCurrentQuestion($(this).attr('id'));
                    _this.bind('seeking', function () {
                        _this.isSeekingIVQ = true;
                    });
                });
            }
        },
        _errMsg:function(){
            var _this = this;
            _this.isErr = true;
            _this.removeShowScreen("contentScreen");
            $(".sub-text").html(gM('mwe-quiz-err-msg'));
            $("div").removeClass('confirm-box');

        }


    }));
})(window.mw, window.jQuery);
