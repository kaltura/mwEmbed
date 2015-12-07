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
        reviewMode: false,
        showCorrectKeyOnAnswer: false,
        showResultOnAnswer: false,
        isSeekingIVQ:false,
        inFullScreen : false,
        selectedAnswer:null,

        setup: function () {
            var _this = this;
            var embedPlayer = this.getPlayer();

            _this.KIVQModule = new mw.KIVQModule(embedPlayer,_this);
            _this.KIVQModule.setupQuiz(embedPlayer);
            _this.KIVQScreenTemplate = new mw.KIVQScreenTemplate(embedPlayer);

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
                    if (!_this.KIVQModule.checkApiResponse('Get baseEntry err -->',data)){
                        return false;
                    }
                    _this.entryData = data;
                });
            });

            this.bind('KalturaSupport_CuePointReached', function (e, cuePointObj) {
                if(!_this.isSeekingIVQ){
                    _this.KIVQModule.cuePointReachedHandler(e, cuePointObj)
                }
                if(_this.enablePlayDuringScreen) {
                    _this.enablePlayDuringScreen = false;
                }
            });
           this.bind('prePlayAction', function (e, data) {
                if(_this.getPlayer().firstPlay && !_this.firstPlay){
                    data.allowPlayback = false;
                    _this.firstPlay = true;
                    _this.enablePlayDuringScreen = false;
                    _this.ssWelcome();
                }
            });

            this.bind('seeked', function () {
                setTimeout(function () {
                    _this.isSeekingIVQ = false;}, 0);
            });
            this.bind('seeking', function () {
                _this.isSeekingIVQ = true;
            });

            embedPlayer.addJsListener( 'kdpReady', function(){
                if (embedPlayer.autoplay) {
                    embedPlayer.autoplay = false;
                }
                embedPlayer.removeJsListener( 'kdpReady');
            });
            embedPlayer.addJsListener( 'playerPlayEnd', function(){
                _this.KIVQModule.quizEndScenario();
            });

            embedPlayer.bindHelper('onOpenFullScreen', function() {
                _this.inFullScreen = true;
                if (!_this.isScreenVisible()) {
                   _this.KIVQModule.showQuizOnScrubber();
               }
            });
            embedPlayer.bindHelper('onCloseFullScreen', function() {
                _this.inFullScreen = false;
                if (!_this.isScreenVisible()) {
                    _this.KIVQModule.showQuizOnScrubber();
                }
            });
            this.bind( 'preShowScreen', function( event, screenName ){
                if ( !embedPlayer.isInSequence() ){
                        embedPlayer.disablePlayControls();
                }
                    _this.KIVQModule.hideQuizOnScrubber();
            });
            this.bind( 'preHideScreen', function( event, screenName ){
                if (screenName != 'quiz'){
                    _this.KIVQModule.showQuizOnScrubber();
                }
            });
            this.bind('onChangeMediaDone', function(){
                //todo fix this
                $.cpObject = {};
                $.quizParams = {};
                _this.KIVQModule.hideQuizOnScrubber();
                _this.KIVQModule.setupQuiz(embedPlayer);

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

        showScreen:function(){
            this.embedPlayer.pause();
            this.embedPlayer.triggerHelper( 'onDisableKeyboardBinding');
            this._super();
        },
        ssWelcome: function () {
            var _this = this;
            _this.ivqShowScreen();
            _this.KIVQScreenTemplate.tmplWelcome();

            $(".welcome").html(gM('mwe-quiz-welcome'));
            $(".confirm-box").html(gM('mwe-quiz-plsWait'));

            _this.KIVQModule.checkCuepointsReady(function(){

                if ($.quizParams.allowDownload ) {
                    $(".pdf-download").prepend('<div class="pdf-download-img">' +
                    '</div><div class="pdf-download-txt">'
                    + gM('mwe-quiz-pdf')+'</div>');

                    $(".pdf-download-img").on('click',function(){
                        _this.KIVQModule.getIvqPDF(_this.embedPlayer.kentryid);
                        $(".pdf-download-img").off();
                    });

                }
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

            _this.ivqShowScreen();
            _this.KIVQScreenTemplate.tmplAlmostDone();

            $(".title-text").html(gM('mwe-quiz-almostDone')).addClass("padding14");
            $(".sub-text").html(gM('mwe-quiz-remainUnAnswered') + '</br>' + gM('mwe-quiz-pressRelevatToAnswer'));
            $(".confirm-box").html(gM('mwe-quiz-okGotIt'));

            $(document).off('click','.confirm-box')
                .on('click', '.confirm-box', function () {
                    _this.embedPlayer.sendNotification('doSeek', 0);
                    _this.KIVQModule.continuePlay();
                });

           _this.KIVQModule.displayHex(_this.KIVQModule.setHexContainerPos("current"),unAnsweredArr);

            $(document).off('click','.q-box')
                .on('click', '.q-box', function () {
                var selectQ = parseInt($(this).attr('id'));

              _this.KIVQModule.gotoScrubberPos(selectQ);
              _this.ssSetCurrentQuestion(selectQ,false);
            });
        },

        ssDisplayHint: function(questionNr){
            var _this = this;
            var embedPlayer = _this.getPlayer();
            $(".header-container").prepend("<div class ='hint-why-box'>"+ gM('mwe-quiz-hint') +"</div>")
                .on('click', function () {
                    _this.KIVQScreenTemplate.tmplHint();
                    $(".header-container").addClass('close-button')
                        .on('click', function () {
                            _this.ssSetCurrentQuestion(questionNr,true);

                        });
                    $(".hint-container").append($.cpObject.cpArray[questionNr].hintText);
                })
        },
        ssDisplayWhy: function (questionNr) {
            var _this = this;
            $(".header-container").prepend("<div class ='hint-why-box'>"+ gM('mwe-quiz-why') +"</div>")
                .on('click', function () {
                    _this.KIVQScreenTemplate.tmplWhy();
                    $(".header-container").addClass('close-button')
                        .on('click', function () {
                            _this.KIVQScreenTemplate.tmplReviewAnswer();
                            _this.ssReviewAnswer(questionNr);
                        });
                    $(".hint-container").append($.cpObject.cpArray[questionNr].explanation);
                })
        },
        ssSetCurrentQuestion: function (questionNr,replaceContentNoReload) {
            var _this = this,cPo = $.cpObject.cpArray[questionNr];

            _this.ivqShowScreen();
            _this.KIVQScreenTemplate.tmplQuestion();

            if ($.cpObject.cpArray[questionNr].hintText){
                _this.ssDisplayHint(questionNr)
            }
            $(".display-question").text(cPo.question);
            $.each(cPo.answeres, function (key, value) {
                var div= $("<div class ='single-answer-box-bk'>"
                    + "<div class ='single-answer-box' id="
                    + key + "><p></p></div></div>");
                div.find('p').text(value);
                div.appendTo('.answers-container');
            });

            if (cPo.isAnswerd){
                _this.showAnswered(cPo, questionNr);
            }
            else {
                _this._selectAnswerConroller(cPo, questionNr);
            }
            this.addFooter(questionNr);
        },
        ssAllCompleted: function () {
            var _this = this;
            _this.reviewMode = true;
            _this.ivqShowScreen();
            _this.KIVQScreenTemplate.tmplAllCompleted();

            $(".title-text").addClass('padding20').html(gM('mwe-quiz-completed'));

            $(".sub-text").addClass('margin-top4').html(gM('mwe-quiz-TakeAMoment') + '<strong> '+ gM('mwe-quiz-review').toLowerCase() +' </strong>'
                    + gM('mwe-quiz-yourAnswers') + '</br><strong> '+ gM('mwe-quiz-or') +' </strong>'
                    + gM('mwe-quiz-goAhead')+ '<strong> '+ gM('mwe-quiz-submit').toLowerCase() +' </strong>'
            );

            $(".review-button").html(gM('mwe-quiz-review'))
                .on('click', function () {
                    _this.embedPlayer.sendNotification('doSeek', 0);
                    _this.KIVQModule.continuePlay();

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
            _this.ivqShowScreen();//
            _this.KIVQScreenTemplate.tmplSubmitted();

            $(".title-text").html(gM('mwe-quiz-Submitted'));
            if(cpArray.length <= 6){
                $(".title-text").addClass("padding14");
            }
            if ($.quizParams.showGradeAfterSubmission){
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
                            _this.KIVQScreenTemplate.tmplReviewAnswer();
                            _this.ssReviewAnswer(parseInt($(this).attr('id')));
                    });
                    $(document).off('click','.q-box-false')
                        .on('click', '.q-box-false', function () {
                            _this.KIVQScreenTemplate.tmplReviewAnswer();
                            _this.ssReviewAnswer(parseInt($(this).attr('id')));
                    });
                }
            }else{
                $(".title-text").addClass("padding35");
                $(".sub-text").html(gM('mwe-quiz-completedQuiz'));
            }
            $(".confirm-box").html(gM('mwe-quiz-done')).off()
                .on('click', function () {
                    _this.KIVQScreenTemplate.tmplThankYou();
                    $(".title-text").html(gM('mwe-quiz-thankYou'));
                    $(this).delay(1000).fadeIn(function () {
                        _this.KIVQModule.continuePlay();
                    });
                });
        },
        ssReviewAnswer: function (selectedQuestion) {
            var _this = this;

            if ($.cpObject.cpArray[selectedQuestion].explanation ){
                _this.ssDisplayWhy(selectedQuestion)
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
        showSelectedQuestion:function(questionNr){
            var _this = this;
            $('.single-answer-box#'+_this.selectedAnswer +'')
                .parent().addClass("wide")
                .addClass('single-answer-box-bk-apply')
                .children().removeClass('single-answer-box')
                .addClass(function(){
                    $(this).addClass('single-answer-box-small')
                        .after($('<div></div>')
                            .addClass("single-answer-box-apply")
                            .text(gM('mwe-quiz-apply'))
                    )
                });
            _this.selectedAnswer = null;
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
            var _this = this;
            if (_this.KIVQModule.quizSubmitted) return;

            if (_this.selectedAnswer){
                _this.showSelectedQuestion(questionNr);
            }

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
                _this.selectedAnswer =  $('.single-answer-box-small').attr('id');

            });
            $(document).off( 'click', '.single-answer-box-apply' )
                .on('click', '.single-answer-box-apply', function () {
                    if ($(this).hasClass('disable')) return false;
                    $('.single-answer-box-apply').addClass('disable')
                        .text(gM('mwe-quiz-applied'))
                        .parent().removeClass('single-answer-box-bk-apply').hide().fadeOut('fast')
                        .addClass('single-answer-box-bk-applied disable').hide().fadeIn('fast');

                    _this.KIVQModule.submitAnswer(questionNr,_this.selectedAnswer);
                    _this.selectedAnswer = null;
                    $(this).delay(1800).fadeOut(function () {
                        _this.KIVQModule.checkIfDone(questionNr)
                    });
                });
        },

        ivqShowScreen:function(){
            var _this = this,embedPlayer = this.getPlayer();
            _this.showScreen();
        },
        ivqHideScreen:function(){
            var _this = this,embedPlayer = this.getPlayer();
            embedPlayer.getInterface().find('.ivqContainer').empty().remove();
            _this.hideScreen();
        },
        addFooter: function (questionNr) {
            var _this = this;

            if (_this.KIVQModule.quizSubmitted) {
                $(".ftr-right").html(gM('mwe-quiz-next')).on('click', function () {
                    _this.KIVQModule.continuePlay();
                });
                return;
            }
            if (_this.reviewMode) {
                $(".ftr-left").append ($('<span>   ' +  gM('mwe-quiz-review').toUpperCase()
                + ' ' + gM('mwe-quiz-question') + ' ' + this.KIVQModule.i2q(questionNr)
                + '/' + $.cpObject.cpArray.length + '</span>'));

                $(".ftr-right").html(gM('mwe-quiz-next')).on('click', function () {
                    _this.KIVQModule.continuePlay();
                });
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
            var  _this = this,displayClass,embedPlayer = this.getPlayer(),handleBubbleclick;
            var scrubber = embedPlayer.getInterface().find(".scrubber");
            var buSize = _this.KIVQModule.bubbleSizeSelector(_this.inFullScreen);
            _this.KIVQModule.hideQuizOnScrubber();
            scrubber.parent().prepend('<div class="bubble-cont"></div>');

            $.each($.cpObject.cpArray, function (key, val) {
                displayClass = val.isAnswerd ? "bubble bubble-ans " + buSize.bubbleAnsSize
                                             : "bubble bubble-un-ans " + buSize.bubbleUnAnsSize;
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
            $('.bubble','.bubble-ans','.bubble-un-ans').off();
            $(handleBubbleclick).on('click', function () {
                _this.unbind('seeking');
                _this.KIVQModule.gotoScrubberPos(parseInt($(this).attr('id')));
                _this.bind('seeking', function () {
                    _this.isSeekingIVQ = true;
                });
            });
        },
        displayQuizEnd:function(){
            var  _this = this,embedPlayer = this.getPlayer();
            var scrubber = embedPlayer.getInterface().find(".scrubber");
            this.embedPlayer.getInterface().find(".quizDone-cont").empty().remove();
            scrubber.parent().prepend('<div class="quizDone-cont"></div>');

            $(document).off( 'click', '.quizDone-cont' )
                .on('click', '.quizDone-cont', function () {
                    _this.KIVQModule.quizEndScenario();
                });
        }
     }));
})(window.mw, window.jQuery);
