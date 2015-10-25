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
        reviewMode: false,
        showCorrectKeyOnAnswer: false,
        showResultOnAnswer: false,
        isSeekingIVQ:false,
        alowLastQuestionSeekTemp:false,

        setup: function () {
            var _this = this;
            var embedPlayer = this.getPlayer();

            _this.KIVQModule = new mw.KIVQModule(embedPlayer,_this);
            _this.KIVQModule.setupQuiz(embedPlayer);

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

                    if (!_this.KIVQModule.checkApiResponse('Get baseEntry err -->',data)){
                        return false;
                    }
                    _this.entryData = data;

                });
            });

            this.bind('KalturaSupport_CuePointReached', function (e, cuePointObj) {
console.log(" ========== KalturaSupport_CuePointReached");
console.log(" ========== isSeekingIVQ =  " + _this.isSeekingIVQ);

                if(!_this.isSeekingIVQ){

                    _this.KIVQModule.cuePointReachedHandler(e, cuePointObj)
                }
                if(_this.enablePlayDuringScreen) {
                    _this.enablePlayDuringScreen = false;
                }
            });

            this.bind('showScreen', function () {
                embedPlayer.pause();
                embedPlayer.disablePlayControls();
                embedPlayer.triggerHelper( 'onDisableKeyboardBinding' );

            });

            this.bind('prePlayAction', function (e, data) {
                if(_this.getPlayer().firstPlay && !_this.firstPlay){
                    data.allowPlayback = false;
                    _this.firstPlay=true;
                    _this.enablePlayDuringScreen = true;
                    _this.ssWelcome();
                }
            });

            this.bind('seeked', function () {
                _this.alowLastQuestionSeekTemp = false;
                _this.isSeekingIVQ = false;
 console.log('===== bind seeked   isSeekingIVQ = ' + _this.isSeekingIVQ )
            });
            this.bind('seeking', function () {
                _this.isSeekingIVQ = true;
console.log('===== bind seeking   isSeekingIVQ = ' + _this.isSeekingIVQ )
            });

            embedPlayer.addJsListener( 'kdpReady', function(){
                if (embedPlayer.autoplay) {
                    embedPlayer.autoplay = false;
                }
                embedPlayer.removeJsListener( 'kdpReady');
            });
            embedPlayer.addJsListener( 'playerPlayEnd', function(){
                var anUnswered = _this.KIVQModule.getUnansweredQuestNrs();
                if (anUnswered) {
                    _this.alowLastQuestionSeekTemp = true;
                    _this.ssAlmostDone(anUnswered);
                }
            });
        },
        getKClient: function () {//remove this
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

        ssWelcome: function () {
            var _this = this;
            _this.removeShowScreen("welcome");
            $(".welcome").html(gM('mwe-quiz-welcome'));
            $(".confirm-box").html(gM('mwe-quiz-plsWait'));

            _this.KIVQModule.checkCuepointsReady(function(){

                $.grep($.quizParams.uiAttributes, function (e) {
                    switch(e.key){
                        case 'welcomeMessage':
                            $(".welcomeMessage").html(e.value);
                            break;
                        case 'inVideoTip':
                            if (e.value ==='true'){
                                $(".InvideoTipMessage").html(gM('mwe-quiz-invideoTip'));
                            }
                            break;
                        case 'canDownloadQuestions':
                            //if (e.value ==='true'){
                            //    $(".pdf-download").prepend('<div class="pdf-download-img">' +
                            //    '</div><div class="pdf-download-txt">'
                            //    + gM('mwe-quiz-pdf')+'</div>');
                            //
                            //    $(".pdf-download-img").on('click',function(){
                            //       _this._downloadPDF();
                            //       $(".pdf-download-img").off();
                            //    })
                            //}
                            break;
                    }
                });
                $(".confirm-box").html(gM('mwe-quiz-continue'))
                    .on('click', function () {
                        _this.KIVQModule.checkIfDone(-1);
                    });
            });
        },



        ssAlmostDone: function (unAnsweredArr) {
            var _this = this;

            _this.removeShowScreen("hexScreen");

            $("div").removeClass('confirm-box');
            $(".title-text").html(gM('mwe-quiz-almostDone')).addClass("padding14");
            $(".sub-text").html(gM('mwe-quiz-remainUnAnswered') + '</br>' + gM('mwe-quiz-pressRelevatToAnswer'));

            _this.KIVQModule.displayHex(_this.KIVQModule.setHexContainerPos("current"),unAnsweredArr);

            $(document).off('click','.q-box')
                .on('click', '.q-box', function () {
                var selectQ = $(this).attr('id');
                if ((_this.KIVQModule.q2i($.cpObject.cpArray.length)) != (parseInt(selectQ)) ) {
                    _this.KIVQModule.gotoScrubberPos(selectQ);
                }
                if (_this.alowLastQuestionSeekTemp){
                    _this.KIVQModule.gotoScrubberPos(selectQ);
                }
                _this.ssSetCurrentQuestion(selectQ);
            });
        },

        ssDisplayHW: function (HWSelector,questionNr,buttonText,displayText) {
            var _this = this;
            $(".header-container").prepend("<div class ='hint-why-box'>"+ buttonText +"</div>")
                .on('click', function () {
                    _this.removeShowScreen("hintWhyScreen");
                    $(".header-container").addClass('close-button')
                        .on('click', function () {
                            $(".screen-content" ).removeClass('bk-gradient');
                            if (_this.isScreenVisible()){
                                _this.removeScreen();
                            }
                            switch(HWSelector){
                                case 'hint':
                                    _this.ssSetCurrentQuestion(questionNr);
                                    break;
                                case 'why':
                                    _this.state = "reviewAnswer";
                                    _this.ssReviewAnswer(questionNr);
                                    break;
                            }
                        });
                    $(".hint-container").append(displayText);
                })
        },
        ssSetCurrentQuestion: function (questionNr) {
            var _this = this,cPo = $.cpObject.cpArray[questionNr];
            _this.removeShowScreen("question");

            if ($.cpObject.cpArray[questionNr].hintText){
                _this.ssDisplayHW('hint',questionNr,
                    (gM('mwe-quiz-hint')),$.cpObject.cpArray[questionNr].hintText)
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


        ssAllCompleted: function () {
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
                _this.ssSetCurrentQuestion(0);
            });

            $(".submit-button").html(gM('mwe-quiz-submit'))
                .on('click', function () {
                $(this).off('click');
                $(this).html(gM('mwe-quiz-plsWait'));
                 _this.KIVQModule.setSubmitQuiz();
            });
        },

        ssSubmitted: function (score) {
            var _this = this,cpArray = $.cpObject.cpArray;
            _this.removeShowScreen("hexScreen");

            $(".title-text").html("Submitted").addClass("padding8");

            if (_this.KIVQModule.showTotalScore){
                if (!$.quizParams.showCorrectAfterSubmission) {
                    $(".title-text").addClass("padding35");
                    $(".sub-text").html(gM('mwe-quiz-completedScore')
                        + '<span class="scoreBig">' + score + '</span>' + ' %');
                } else {
                    $(".sub-text").html(gM('mwe-quiz-completedScore')
                        + '<span class="scoreBig">' + score + '</span>' + ' %' + '</br>'
                        + gM('mwe-quiz-reviewSubmit'));

                    _this.KIVQModule.displayHex(_this.KIVQModule.setHexContainerPos("current"),cpArray);

                    $(document).off('click','.q-box')
                        .on('click', '.q-box', function () {
                        _this.removeShowScreen("reviewAnswer");
                        _this.ssReviewAnswer($(this).attr('id'));
                    });
                    $(document).off('click','.q-box-false')
                        .on('click', '.q-box-false', function () {
                        _this.removeShowScreen("reviewAnswer");
                        _this.ssReviewAnswer($(this).attr('id'));
                    });
                }
            }else{
                $(".title-text").addClass("padding35");
                $(".sub-text").html(gM('mwe-quiz-completedQuiz'));
            }
            $(".confirm-box").html(gM('mwe-quiz-done'))
                .on('click', function () {
                    _this.removeShowScreen("contentScreen");
                    $(".title-text").html(gM('mwe-quiz-thankYou')).addClass('thank-you');
                    $("div").removeClass('confirm-box');
                    $(this).delay(1000).fadeIn(function () {
                        _this.KIVQModule.continuePlay();
                    });
                });
        },
        ssReviewAnswer: function (selectedQuestion) {
            var _this = this;
            _this.showScreen();
            if ($.cpObject.cpArray[selectedQuestion].explanation ){
                _this.ssDisplayHW('why',selectedQuestion,(gM('mwe-quiz-why')),$.cpObject.cpArray[selectedQuestion].explanation)
            }
            $(".reviewAnswerNr").append(_this.KIVQModule.i2q(selectedQuestion));
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
                        _this.KIVQModule.q2i($.cpObject.cpArray[selectedQuestion].correctAnswerKeys[0].value)
                        ];
                }
                else {return " "}
            });
            $('.gotItBox').html(gM('mwe-quiz-gotIt')).bind('click', function () {
                _this.ssSubmitted(_this.KIVQModule.score);
            });
        },

        showAnswered: function (cPo, questionNr) {
            var _this = this;
            $.each(cPo.answeres, function (key, value) {
                if (key == $.cpObject.cpArray[questionNr].selectedAnswer) {
                    $('#' + key).parent().addClass("wide single-answer-box-bk-applied disable");
                    $('#' + key).removeClass('single-answer-box')
                        .addClass(function(){
                            $(this).addClass('single-answer-box-small')
                                .after($('<div></div>')
                                    .addClass("single-answer-box-apply disable")
                                    .text(gM('mwe-quiz-applied'))
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
            if (_this.KIVQModule.quizSubmitted) return;

            $('.single-answer-box-bk' ).on('click',function(){
                if ($(this).hasClass('disable')){
                    return false;
                }
                $('.answers-container').find('.disable').removeClass('disable');
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
                            .after($('<div></div>')
                                .addClass("single-answer-box-apply")
                                .text(gM('mwe-quiz-apply'))
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

                    _this.KIVQModule.submitAnswer(questionNr,selectedAnswer);

                    $(this).delay(1800).fadeOut(function () {
                        if (_this.isScreenVisible()) _this.removeScreen();
                        _this.KIVQModule.checkIfDone(questionNr)
                    });
                });
        },

        removeShowScreen:function(state){
            var _this = this,embedPlayer = this.getPlayer();
            this.removeScreen();
            _this.state = state;
            this.showScreen();
            embedPlayer.getInterface().find(".bubble-cont").empty().remove();
            embedPlayer.getInterface().find(".bubble").empty().remove();
        },
        addFooter: function (questionNr) {
            var _this = this;

            if (_this.KIVQModule.quizSubmitted) {
                $(".ftr-right").html(gM('mwe-quiz-next')).on('click', function () {
                    _this.KIVQModule.continuePlay();
                });
                return;
            }
            if (this.reviewMode) {
                $(".ftr-left").html(gM('mwe-quiz-doneReview')).on('click', function () {
                    _this.ssAllCompleted();
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
                        _this.ssSetCurrentQuestion(nextQuestionNr(questionNr));
                    });
                }
            } else {
                $(".ftr-left").append($('<span> ' + gM('mwe-quiz-question') + ' ' + this.KIVQModule.i2q(questionNr)
                + '/' + $.cpObject.cpArray.length + '</span>')
                    .css("float", "right"))
                    .append($('<div></div>')
                        .addClass("pie")
                        .css("float", "right"))
                    .append($('<span>' + (_this.KIVQModule.getUnansweredQuestNrs()).length + ' '
                    + gM('mwe-quiz-unanswered') + '</span>')
                        .css("float", "right"));
                if (_this.KIVQModule.canSkip) {
                    $(".ftr-right").html(gM('mwe-quiz-skipForNow')).on('click', function () {
                        _this.KIVQModule.checkIfDone(questionNr);
                    });
                }else if(!_this.KIVQModule.canSkip && $.cpObject.cpArray[questionNr].isAnswerd ){
                    $(".ftr-right").html(gM('mwe-quiz-next')).on('click', function () {
                        _this.KIVQModule.continuePlay();
                    });
                }
            }
        },
            displayBubbles:function(){
            var  _this = this,embedPlayer = this.getPlayer(),handleBubbleclick;
            var scrubber = embedPlayer.getInterface().find(".scrubber");
            var displayClass,cPo = $.cpObject.cpArray;

            embedPlayer.getInterface().find(".bubble-cont").empty().remove();
            embedPlayer.getInterface().find(".bubble").empty().remove();

            scrubber.parent().prepend('<div class="bubble-cont"></div>');

            $.each(cPo, function (key, val) {
                displayClass = val.isAnswerd ? "bubble bubble-ans" : "bubble bubble-un-ans";
                var pos = (Math.round(((val.startTime/_this.entryData.msDuration)*100) * 10)/10)-1;
                $('.bubble-cont').append($('<div id ="' + key + '" style="margin-left:' + pos + '%">' +
                    _this.KIVQModule.i2q(key) + ' </div>')
                        .addClass(displayClass)
                );
            });

            if (_this.KIVQModule.canSkip) {
                handleBubbleclick = '.bubble';
            }
            else{
                handleBubbleclick = '.bubble-ans';
            }

            $(handleBubbleclick).off().on('click', function () {
                _this.KIVQModule.gotoScrubberPos($(this).attr('id'));
            });
        },
        _downloadPDF:function(){
            var _this = this;
            var quizPDF = {
                'service': 'quiz_quiz',
                'action': 'servepdf',
                'entryId': _this.embedPlayer.kentryid
            };
            _this.getKClient().doRequest(quizPDF, function(data) {
                if (!_this._checkApiResponse('Get pdf err -->',data)){
                    return false;
                }
            });
        }
    }));
})(window.mw, window.jQuery);
