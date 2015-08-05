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
        showTotalScore: '',
        score: null,
        sliceArray: [],
        hexPosContainerPos:0,

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
                $.grep(data, function (e) {
                    if (e.objectType){
                        console.log('Connect to quiz err -->', e.code, e.message);
                        return false
                    }
                });
                $.quizParams = data[1];

                if (data[0].totalCount > 0 &&  !$.isEmptyObject(data[0].objects[0])  ) {
                    _this.kQuizUserEntryId = data[0].objects[0].id;
                    switch (String(data[0].objects[0].status)) {
                        case 'quiz.3':
                            _this.score = (data[0].objects[1].score);
                            _this._getQuestionCpAPI(_this._populateCpObject);
                            break;
                        case '1':
                            _this._getQuestionCpAPI(_this._populateCpObject);
                            break;
                        case '2':
                            _this.state = "deleted";
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
                            if (data.objectType){
                                console.log('Add KQ user entry id err -->', data.code, data.message);
                                return false
                            }
                        _this.kQuizUserEntryId = data.id;
                        _this._getQuestionCpAPI(_this._populateCpObject);
                        });
                    }
                });
            this.addBindings();
        },
        addBindings: function () {
            var _this = this;
            var embedPlayer = this.getPlayer();
            this.bind('layoutBuildDone', function () {
                var entryRequest = {
                    'service': 'baseEntry',
                    'action': 'get',
                    'entryId': embedPlayer.kentryid
                };
                _this.getKClient().doRequest(entryRequest, function (data) {
                    if (data.objectType){
                        console.log('Get entry data err -->', data.code, data.message);
                        return false
                    }
                    _this.entryData = data;
                    _this._initParams();

                    if (_this.state == 'deleted') {
                        _this._showDeletedScreen()
                    } else {
                        _this._showWelcomeScreen();
                    }
                });
            });

            this.bind('KalturaSupport_CuePointReached', function (e, cuePointObj) {
                _this.qCuePointHandler(e, cuePointObj);
            });
        },
        getKClient: function () {
            if (!this.kClient) {
                this.kClient = mw.kApiGetPartnerClient(this.embedPlayer.kwidgetid);
            }
            return this.kClient;
        },
        getTemplateHTML: function (data) {
            var _this = this;
            var defer = $.Deferred();
            this.getPlayer().disablePlayControls();
            var quizStartTemplate = this.getTemplatePartialHTML("quizstart");

            var $template = $(quizStartTemplate({
                'quiz': this,
                quizStartTemplate: quizStartTemplate
            }));

            $template
                .find('[data-click],[data-notification]')
                .click(function (e) {
                    var data = $(this).data();
                    return _this.handleClick(e, data);
                });

            return defer.resolve($template);
        },
        handleClick: function (e, data) {
            e.preventDefault();
            if (data.click && $.isFunction(this[data.click])) {
                this[data.click](e, data);
            }
            if (data.notification) {
                this.getPlayer().sendNotification(data.notification, data);
            }
            return false;
        },
        continuePlay: function () {
            this.removeScreen();
            this.getPlayer().enablePlayControls();
            this.getPlayer().play();
        },
        _initParams: function () {
            var _this = this;
            $.grep($.quizParams.uiAttributes, function (e) {
                if (e.key == "canSkip") {
                    _this.canSkip = (e.value) ;
                }
            });
        },
        _showWelcomeScreen: function () {
            var _this = this;
            _this.state = 'welcome';
            _this.showScreen();
            var kdp = this.getPlayer();
            kdp.sendNotification('doPause');
            $(".welcome").html(gM('mwe-quiz-welcome'));
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
        },
        _showDeletedScreen: function () {
            var _this = this;
            _this.state = 'contentScreen';
            _this.showScreen();
            var kdp = this.getPlayer();
            kdp.sendNotification('doPause');
            $(".title-text").html(gM('mwe-quiz-no-longer-exist'));
            $(".confirm-box").html(gM('mwe-quiz-continue'))
                .on('click', function () {
                    $(document).off();
                    _this.removeScreen();
                    _this.continuePlay();
                });
        },

        _gotoScrubberPos: function (questionNr) {
            var kdp = this.getPlayer();
            kdp.sendNotification('doSeek', ($.cpObject.cpArray[questionNr].startTime) / 900);
        },
        qCuePointHandler: function (e, cuePointObj) {
            var _this = this;
            if (!$.quizParams.showCorrectAfterSubmission && _this.score) return;

            $.each($.cpObject.cpArray, function (key, val) {
                if ($.cpObject.cpArray[key].startTime === cuePointObj.cuePoint.startTime) {
                    _this.currentQuestionNumber = key;
                    _this.setCurrentQuestion(key);
                }
            });
        },

        showUnAnswered: function (cPo, questionNr) {
            var _this = this;
            _this._selectAnswerConroller(cPo, questionNr);
        },
        showAnswered: function (cPo, questionNr) {
            var _this = this;

            $.each(cPo.answeres, function (key, value) {

                if (key == $.cpObject.cpArray[questionNr].selectedAnswer) {
                    $('#' + key).parent().addClass("wide single-answer-box-bk-applied");
                    $('#' + key).removeClass('single-answer-box')
                        .addClass(function(){
                        $(this).addClass('single-answer-box-small')
                            .after($('<div></div>').addClass("single-answer-box-apply").text(gM('mwe-quiz-applied'))
                        )
                    });

                }
            });
            if ($.quizParams.allowAnswerUpdate) {
                _this._selectAnswerConroller(cPo, questionNr);
            }
        },
        _selectAnswerConroller: function (cPo, questionNr) {
            var _this = this;
            var selectedAnswer = null;
            if (_this.score) return;
            $(document).off();
            $('.single-answer-box-bk' ).on('click',function(){
                $('.single-answer-box-bk').each(function (index) {
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

            $(document).on('click', '.single-answer-box-apply', function (index) {
                 $('.single-answer-box-apply').text(gM('mwe-quiz-applied'))
                    .off( 'click', "**" )
                    .parent().removeClass('single-answer-box-bk-apply').hide().fadeOut('fast')
                    .addClass('single-answer-box-bk-applied').hide().fadeIn('fast');

                if (!_this._submitAnswer(questionNr,selectedAnswer)) {
                    console.log('Error add question')
                }

                $(this).delay(2000).fadeOut(function () {
                    _this.removeScreen();
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
            return _this._addAnswerAPI(
                _this.i2q(questionNr),
                $.extend(quizSetAnswer, answerParams)
            );
        },
        _addAnswerAPI: function (questionNr, quizSetAnswer) {
            var _this = this;
            _this.getKClient().doRequest(quizSetAnswer, function (data) {
            //new kWidget.api({'wid': _this.getKClient().wid}).doRequest(quizSetAnswer, function (data) {
                if (data.objectType){
                    console.log('Add Update answer err -->', data.code, data.message);
                    return false
                }
                $.cpObject.cpArray[_this.q2i(questionNr)].isCorrect = data.isCorrect;
                $.cpObject.cpArray[_this.q2i(questionNr)].explanation = data.explenation;
                $.cpObject.cpArray[_this.q2i(questionNr)].correctAnswerKeys = data.correctAnswerKeys;

            });
            return true
        },
        almostDone: function (unAnswerdArr) {
            var _this = this;
            _this.removeShowScreen("contentScreen");
            $("div").removeClass('confirm-box');
            $(".title-text").html("Almost Done");
            $(".sub-text").html("It appears that the following questions remained unanswered" + "</br>" + "Press on relevant question to answer");

            $.each(unAnswerdArr, function (key, value) {
                $(".display-content").append("<div class ='q-box' id=" + value + ">" + _this.i2q(value) + "</div>");
            });

            $(document).on('click', '.q-box', function () {
                var selectQ = $(this).attr('id');
                _this._gotoScrubberPos(selectQ);
            });
        },
        checkIfDone: function (questionNr) {
            var _this = this;
            if (_this.score != null) {
                _this._submitted(_this.score);
            } else {
                if ($.isEmptyObject($.grep($.cpObject.cpArray, function (el) {
                        return el.isAnswerd === false
                    }))) {
                    _this.allCompleted();
                }
                else {
                    if (questionNr === ($.cpObject.cpArray.length) - 1) {
                        _this.almostDone(_this.getUnansweredQuestNrs());
                    } else {
                        _this.continuePlay();
                    }
                }
            }
        },
        getUnansweredQuestNrs: function () {
            var unanswerdArr = [];
            $.each($.cpObject.cpArray, function (key, val) {
                if ($.cpObject.cpArray[key].isAnswerd === false) {
                    unanswerdArr.push($.cpObject.cpArray[key].key);
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
                    $(".header-container").addClass('close-button')
                        .on('click', function () {
                            _this.removeScreen();
                            switch(HWSelector){
                                case 'hint':_this.setCurrentQuestion(questionNr);
                                            break;
                                case 'why': _this.state = "reviewAnswer";
                                            _this.reviewAnswer(_this.score);
                                            break;
                            }
                        });
                    $(".hint-container").append(displayText);
                })
        },
        setCurrentQuestion: function (questionNr) {
            var _this = this,cPo = $.cpObject.cpArray[questionNr];
            _this.removeShowScreen("question");
            $(document).off();

            if ($.cpObject.cpArray[questionNr].hintText){
                _this._displayHW('hint',questionNr,(gM('mwe-quiz-hint')),$.cpObject.cpArray[questionNr].hintText)
            }
            $(".display-question").html(cPo.question);
            $.each(cPo.answeres, function (key, value) {
                $(".answers-container").append(
                    "<div class ='single-answer-box-bk'>" +
                    "<div class ='single-answer-box' id=" + key + ">" + value + "</div></div>"
                );
            });
            if (cPo.isAnswerd) {
                _this.showAnswered(cPo, questionNr);
            }
            else {
                _this.showUnAnswered(cPo, questionNr);
            }
            this.addFooter(questionNr);
        },

        addFooter: function (questionNr) {
            var _this = this;
            if (_this.score) {
                $(".ftr-right").html(gM('mwe-quiz-next')).on('click', function () {
                    _this.continuePlay()
                });
                return
            }
            if (this.reviewMode) {
                $(".ftr-left").html("DONE REVIEW").on('click', function () {
                    _this.removeScreen();
                    _this.allCompleted();
                });
                $(".ftr-right").html("REVIEW NEXT QUESTION").on('click', function () {
                    _this.removeScreen();
                    function nextQuestionNr(questionNr) {
                        if (questionNr == $.cpObject.cpArray.length - 1) {
                            return 0;
                        } else {
                            return ++questionNr;
                        }
                    }
                    _this.setCurrentQuestion(nextQuestionNr(questionNr));
                });
            } else {
                $(".ftr-left").append($('<span>' + ' QUESTION ' + this.i2q(questionNr) + '/' + $.cpObject.cpArray.length + '</span>').css("float", "right"))
                    .append($('<div></div>').addClass("pie").css("float", "right"))
                    .append($('<span>' + (_this.getUnansweredQuestNrs()).length + ' UN-ANSWERED' + '</span>').css("float", "right"));
                if (_this.canSkip) {
                    $(".ftr-right").html("SKIP FOR NOW").on('click', function () {
                        _this.checkIfDone(questionNr);
                    });
                }
            }
        },
        allCompleted: function () {
            var _this = this;
            this.reviewMode = true;
            _this.removeShowScreen("contentScreen");
            $(".title-text").html("Completed");
            $(".sub-text").html("Take a moment to review your answeres below, or go ahead and submit.");
            $.each($.cpObject.cpArray, function (key, value) {
                $(".display-content").append("<div class ='q-box' id=" + key + ">" + _this.i2q(key) + "</div>");
            });
            $(document).on('click', '.q-box', function () {
                this.currentQuestionNumber = $(this).attr('id');
                _this.setCurrentQuestion(this.currentQuestionNumber);
            });
            $(".confirm-box").html("Submit");
            $(document).on('click', '.confirm-box', function () {

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
            if (data.objectType){
                console.log('Submit Quiz err -->',data.code, data.message);
                return false
            }
                _this.score = data.score;
                _this._submitted(data.score);
            });
        },
        _submitted: function (score) {
            var _this = this,leftRightArrow="current";
            var cPo = $.cpObject.cpArray;
            _this.removeShowScreen("hexScreen");
            $(".title-text").html("Submitted");
            if (!$.quizParams.showCorrectAfterSubmission) {
                $(".sub-text").html("you completed the quiz, your score is " + score + " ");
            } else {
                if ($.isEmptyObject(_this.sliceArray)) {
                    _this.sliceArray = _this.buildSliceArr(5);
                }
                $(".sub-text").html("you completed the quiz, your score is " + score + " press any question to review submission ");
                _this.displayHex(_this.setHexContainerPos("current"));
                     $(document).on('click', '.q-box', function () {
                         _this.removeScreen();
                         _this.state = "reviewAnswer";
                         _this.reviewAnswer($(this).attr('id'));
                     });
                     $(document).on('click', '.q-box-false', function () {
                         _this.removeScreen();
                         _this.state = "reviewAnswer";
                         _this.reviewAnswer($(this).attr('id'));
                     });
            }
            $(".confirm-box").html("Ok")
                .on('click', function () {
                    $(document).off();
                    _this.removeShowScreen("contentScreen");
                    $(".title-text").html("Thank You.").addClass("hint-container");
                    $("div").removeClass('confirm-box');
                    $(this).delay(1000).fadeIn(function () {
                        _this.removeScreen();
                        _this.continuePlay();
                    });
                });
        },
        reviewAnswer: function (selectedQuestion) {
            var _this = this;
            _this.showScreen();
            $(document).off();
            if ($.cpObject.cpArray[selectedQuestion].explenation ){
                _this._displayHW('why',selectedQuestion,(gM('mwe-quiz-why')),$.cpObject.cpArray[selectedQuestion].explanation)
            }
            $(".reviewAnswerNr").append(_this.i2q(selectedQuestion));
            $(".theQuestion").html("Q:  " + $.cpObject.cpArray[selectedQuestion].question);
            $(".yourAnswerText").html("Your Answer:");
            $(".yourAnswer").html($.cpObject.cpArray[selectedQuestion].answeres[$.cpObject.cpArray[selectedQuestion].selectedAnswer]);
            if (!$.cpObject.cpArray[selectedQuestion].isCorrect) {
                $(".yourAnswer").addClass("wrongAnswer")
            }
            $(".correctAnswerText").html("Correct Answer:");

            $(".correctAnswer").html(function () {
                if (!$.isEmptyObject($.cpObject.cpArray[selectedQuestion].correctAnswerKeys)) {
                    return $.cpObject.cpArray[selectedQuestion]
                            .answeres[
                                $.cpObject.cpArray[selectedQuestion]
                                .correctAnswerKeys[0].value
                             ];
                }
                else {return "not defined"}
            });
            $('.gotItBox').html("Got It !").bind('click', function () {
                _this._submitted(_this.score);
            });
        },
        _getQuestionCpAPI: function (callback) {
            var _this = this;
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
                $.grep(data, function (e) {
                        if (e.objectType){
                            console.log('Get CP question or answer err -->', e.code, e.message);
                        }
                    });
                callback(data);
            });
        },
        _populateCpObject: function (data) {
            var _this = this,cpArray = [];
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
                    explenation: null
                };
                if (!$.isEmptyObject(data[1].objects)) {
                    $.grep(data[1].objects, function (el) {
                        if (el.parentId === data[0].objects[i].id) {
                            ansP.isAnswerd = true;
                            ansP.selectedAnswer = (parseInt(el.answerKey) - 1);
                            ansP.answerCpId = el.id;
                            ansP.isCorrect = el.isCorrect;
                            ansP.correctAnswerKeys = el.correctAnswerKeys;
                            ansP.explenation = el.explanation;
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
                    explenation: ansP.explenation,
                    hintText: data[0].objects[i].hint,
                    startTime: data[0].objects[i].startTime,
                    cpId: data[0].objects[i].id,
                    cpEntryId: data[0].objects[i].entryId,
                    answerCpId: ansP.answerCpId

                });
            }
            $.cpObject.cpArray = cpArray;
        },
        removeShowScreen:function(state){
            var _this = this;
            $(document).off();
            if (_this.isScreenVisible()) _this.removeScreen();
            _this.state = state;
            _this.showScreen();

        },
        i2q: function (i) {
            return parseInt(i) + 1;
        },
        q2i: function (i) {
            return parseInt(i) - 1;
        },
        buildSliceArr: function (step) {
            var i = 0,arr = [],rStart,rEnd,cp = 0,swicher = false;
            do {
                rStart = i;
                rEnd = i + step;
                arr.push({rStart: i, rEnd: i + step,rContPos: cp});
                i = rEnd + 1;
                if (swicher) cp ++;
                swicher = !swicher;
            } while (i < $.cpObject.cpArray.length);
            return arr;
        },
        makeHexRow: function (rStart,rEnd,rowNumber) {
            var cPo = $.cpObject.cpArray,ol,el,_this = this;
            ol = document.createElement('ol');
            $.each(cPo.slice(rStart, rEnd), function (i, data) {
            el = document.createElement('li');
               var className = (function () {
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
            $(".hexagon-container").append(ol).hide().fadeIn('fast');
        },
        displayHex:function (hexPositionContDisplay){
            var _this = this;
            var displayData = $.grep(_this.sliceArray, function (element, index) {
                return element.rContPos == hexPositionContDisplay;
            });
            $.each(displayData,function(key,val){
                _this.makeHexRow(val.rStart,val.rEnd+1,key);
            });
            _this._checkHexStatusForArrow();
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
        _addHexRightArrow:function(){
            var _this = this;
            $( "<div></div>" ).insertBefore( ".hexagon-container")
                .addClass("right-arrow").hide().fadeIn('slow')
                .on('click', function(){
                    $( ".hexagon-container" ).empty();
                    _this.displayHex(_this.setHexContainerPos("right"));
                });
        },
        _addHexLeftArrow:function(){
            var _this = this;
            $( "<div></div>" ).insertBefore( ".hexagon-container")
                .addClass("left-arrow").hide().fadeIn('slow')
                .on('click', function(){
                    $( ".hexagon-container" ).empty();
                    _this.displayHex(_this.setHexContainerPos("left"));
                });
        },
        _checkHexStatusForArrow:function(){
            var _this = this;
            var lastPos = ((_this.sliceArray.slice(-1))[0].rContPos);
            var sliceArrLen =_this.sliceArray.length;

            if  (_this.hexPosContainerPos == 0  && sliceArrLen >= 3) {
                $(".left-arrow").remove();
                if ($(".right-arrow").length == 0){
                    _this._addHexRightArrow();
                }
            }else if  (_this.hexPosContainerPos == 0  && sliceArrLen <= 2) {
                if ($(".right-arrow").length != 0) $(".right-arrow").remove();
                $(".left-arrow").remove();

            }
            else if (_this.hexPosContainerPos == lastPos && sliceArrLen  >= 3 ){
                $(".right-arrow").remove();
                if ($(".left-arrow").length == 0){
                    _this._addHexLeftArrow();
                }
            }
            else  {
                if ($(".right-arrow").length == 0){
                    _this._addHexRightArrow();
                }
                if ($(".left-arrow").length == 0){
                    _this._addHexLeftArrow();
                }
            }
        }
    }));
})(window.mw, window.jQuery);
