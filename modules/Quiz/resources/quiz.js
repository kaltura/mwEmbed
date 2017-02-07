/**
 * Created by mark.feder Kaltura.
 *
 * */

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

        isSeekingIVQ:false,
        inFullScreen:false,
        selectedAnswer:null,
        seekToQuestionTime:null,
        multiStreamWelcomeSkip:false,
        IVQVer:'IVQ-2.41.rc2',

        setup: function () {
            var _this = this;
            var embedPlayer = _this.getPlayer();
            // make sure we actually have a layout builder
            embedPlayer.getInterface();
            embedPlayer.disableComponentsHover();
            mw.log("Quiz: " + _this.IVQVer);
            this.bind('onChangeStream', function () {
                mw.log("Quiz: multistream On");
                _this.multiStreamWelcomeSkip = true;
            });

            embedPlayer.addJsListener( 'kdpReady', function(){
                _this.KIVQModule = new mw.KIVQModule(embedPlayer, _this);
                _this.KIVQModule.isKPlaylist = (typeof (embedPlayer.playlist) === "undefined" ) ? false : true;

                if (embedPlayer.kalturaPlayerMetaData.capabilities === "quiz.quiz"){
                    if (embedPlayer.autoplay) {
                        embedPlayer.autoplay = false;
                    }

                    _this.KIVQModule.setupQuiz().fail(function(data, msg) {
                        mw.log("Quiz: error loading quiz, error: " + msg);
                        embedPlayer.hideSpinner();
                        _this.KIVQModule.unloadQuizPlugin(embedPlayer);
                        embedPlayer.enablePlayControls();
                    }).done(function(data) {
                        mw.log("Quiz: setup is completed, continuing...");
                    });

                    _this.KIVQScreenTemplate = new mw.KIVQScreenTemplate(embedPlayer);

                    if(_this.KIVQModule.isKPlaylist){
                        _this.KIVQModule.unloadQuizPlugin(embedPlayer);
                        embedPlayer.stop();
                    }else{
                        if(!_this.multiStreamWelcomeSkip){
                            embedPlayer.disablePlayControls();
                        }
                        embedPlayer.addPlayerSpinner();
                    };

                    _this.KIVQModule.checkCuepointsReady(function(){

                        _this.addBindings();

                        if(_this.KIVQModule.isKPlaylist){
                            embedPlayer.stop();//
                            _this.enablePlayDuringScreen = false;
                            _this.ssWelcome();
                            mw.log("Quiz: playlistWelcome");
                        };
                        embedPlayer.hideSpinner();
                        embedPlayer.enablePlayControls();
                    });

                    mw.log("Quiz: Quiz Loading..");

                    try {
                        var cssLink = "modules/Quiz/resources/css/quizFonts.css";
                        cssLink = cssLink.toLowerCase().indexOf("http") === 0 ? cssLink : kWidget.getPath() + cssLink;
                        if (!$("link[href=cssLink]").length){
                            $('head', window.parent.document).append('<link type="text/css" rel="stylesheet" href="' + cssLink + '"/>');
                        }
                    }
                    catch(err) {
                        mw.log("Quiz: Err loading fonts :"+err.message);
                    }
                }
                else{
                    _this.KIVQModule.unloadQuizPlugin(embedPlayer);
                    embedPlayer.enablePlayControls();
                    if(_this.KIVQModule.isKPlaylist){
                        _this.embedPlayer.setKDPAttribute('playlistAPI','autoContinue',true);
                    };
                 }
            });
        },
        addBindings: function () {
            var _this = this;
            var embedPlayer = this.getPlayer();
            mw.log("Quiz: Add Bindings ");
            if (!_this.multiStreamWelcomeSkip){
                this.bind('prePlayAction'+_this.KIVQModule.bindPostfix, function (e, data) {
                    mw.log("Quiz: Bind PrePlay");
                    if(!_this.KIVQModule.isKPlaylist){
                        if(_this.getPlayer().firstPlay) {
                            mw.log("Quiz: Welcome");
                            data.allowPlayback = false;
                            _this.enablePlayDuringScreen = false;
                            _this.ssWelcome();

                        }else{
                            _this.KIVQModule.showQuizOnScrubber();
                            mw.log("Quiz: preplay Show Quiz on Scrubber");
                        };
                    };
                    _this.unbind('prePlayAction' + _this.KIVQModule.bindPostfix);
                });
            }else{
                this.bind('prePlayAction'+_this.KIVQModule.bindPostfix, function (e, data) {
                    _this.KIVQModule.showQuizOnScrubber();
                });
                _this.KIVQModule.continuePlay();
            };
            this.bind('KalturaSupport_CuePointReached'+_this.KIVQModule.bindPostfix, function (e, cuePointObj) {
                if(!_this.isSeekingIVQ){
                    if ((_this.seekToQuestionTime ===  cuePointObj.cuePoint.startTime)
                        || (_this.seekToQuestionTime === null))
                         {
                        _this.KIVQModule.cuePointReachedHandler(e, cuePointObj);
                        _this.seekToQuestionTime = null;
                        mw.log("Quiz: CuePoint Reached time: " + cuePointObj.cuePoint.startTime);
                    }
                }
                if(_this.enablePlayDuringScreen) {
                    _this.enablePlayDuringScreen = false;
                }
            });

            embedPlayer.bindHelper('seeked'+_this.KIVQModule.bindPostfix, function () {
               _this.isSeekingIVQ = false;
                mw.log("Quiz: Seeked");
            });

            embedPlayer.bindHelper('seeking'+_this.KIVQModule.bindPostfix, function () {
                _this.isSeekingIVQ = true;
                mw.log("Quiz: Seeking.. ");
            });

            embedPlayer.bindHelper('playbackComplete'+_this.KIVQModule.bindPostfix, function(){
                _this.KIVQModule.quizEndScenario();
                mw.log("Quiz: playbackComplete");
            });

            embedPlayer.bindHelper('onOpenFullScreen'+_this.KIVQModule.bindPostfix, function() {
                _this.inFullScreen = true;
                if (!_this.isScreenVisible()) {
                    _this.KIVQModule.showQuizOnScrubber();
                }
            });
            embedPlayer.bindHelper('onCloseFullScreen'+_this.KIVQModule.bindPostfix, function() {
                _this.inFullScreen = false;
                if (!_this.isScreenVisible()) {
                    _this.KIVQModule.showQuizOnScrubber();
                }
            });
            embedPlayer.bindHelper( 'preShowScreen'+_this.KIVQModule.bindPostfix, function( event, screenName ){
                if ( !embedPlayer.isInSequence() ){
                    embedPlayer.disablePlayControls();
                    embedPlayer.triggerHelper( 'onDisableKeyboardBinding');
                }
                _this.KIVQModule.hideQuizOnScrubber();
            });
            embedPlayer.bindHelper( 'preHideScreen'+_this.KIVQModule.bindPostfix, function( event, screenName ){
                if (screenName != 'quiz' && !_this.getPlayer().firstPlay){
                    _this.KIVQModule.showQuizOnScrubber();
                }
            });
            embedPlayer.bindHelper('hideScreen'+_this.KIVQModule.bindPostfix, function(event, screenName){
                if(screenName === 'quiz'){
                    if (!_this.embedPlayer._playContorls){
                        _this.KIVQModule.showQuizOnScrubber();
                        embedPlayer.enablePlayControls();
                        mw.log("Quiz: Continue Play Hide Screen");
                        embedPlayer.play();
                    };
                }
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

        // function called by the player plugin management to present the main IVQ screen
        showScreen:function(){
            this.embedPlayer.pause();
            this._super();
            // make the quiz screen a live region for accessibility
            $(".screen.quiz").attr('aria-live', 'polite');
        },

        // render the welcome screen content, look for 'tmplWelcome' in 
        ssWelcome: function () {
            var _this = this;
            _this.ivqShowScreen();
            _this.KIVQScreenTemplate.tmplWelcome();

            $(".welcome").html(gM('mwe-quiz-welcome'));
                if ($.quizParams.allowDownload ) {
                    $(".pdf-download").prepend('<div class="pdf-download-img">' +
                    '</div><div class="pdf-download-txt">'
                    + gM('mwe-quiz-pdf')+'</div>');

                    $(".pdf-download-img").on('click',function(){
                        _this.KIVQModule.getIvqPDF(_this.embedPlayer.kentryid);
                    });
                    // making "download PDF" button accessible:
                    $(".pdf-download-img").attr('role', 'button').attr('tabindex', 5).attr('aria-label', 'Pre-Test - Download PDF').on('keydown', _this.keyDownHandler);
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
             
            // add title to ivq welcome container for accessibility
            $(".ivqContainer").attr("title", "Kaltura Video Quiz "+_this.embedPlayer.evaluate( '{mediaProxy.entry.name}' ));
            
            // make welcome "continue" button accessible
            $(".confirm-box").html(gM('mwe-quiz-continue')).show().attr("tabindex", 5).attr("title", "Click to start the quiz").on('keydown', _this.keyDownHandler)
                .on('click', function () {
                    _this.KIVQModule.checkIfDone(-1);
                }).focus();

        },

        // TODO - handle accessibility leftovers
        ssAlmostDone: function (unAnsweredArr) {
            var _this = this,embedPlayer = this.getPlayer();;

            _this.ivqShowScreen();
            _this.KIVQScreenTemplate.tmplAlmostDone();

            $(".title-text").html(gM('mwe-quiz-almostDone'));
            $(".sub-text").html(gM('mwe-quiz-remainUnAnswered') + '</br>' + gM('mwe-quiz-pressRelevatToAnswer'))
            $(".confirm-box").html(gM('mwe-quiz-okGotIt'))

            $(document).off('click','.confirm-box')
                .on('click', '.confirm-box', function () {
                    _this.embedPlayer.stopPlayAfterSeek = false;
                    _this.embedPlayer.seek(0,false);
                    _this.ivqHideScreen();
                });
        },

        // TODO - handle accessibility leftovers
        ssDisplayHint: function(questionNr){
            var _this = this;
            var embedPlayer = _this.getPlayer();
            $("<div>"+ gM('mwe-quiz-hint') +"</div>").prependTo(".header-container").addClass('hint-why-box')
                .on('click', function () {
                    _this.KIVQScreenTemplate.tmplHint();
                    $(".header-container").addClass('close-button')
                        .on('click', function () {
                            _this.ssSetCurrentQuestion(questionNr,true);
                        }).on('keydown', _this.keyDownHandler).attr('role', 'button').attr('tabindex', 5).attr('title', 'Hint - '+$.cpObject.cpArray[questionNr].hintText+'. Click to close hint').focus();
                    $(".hint-container").append($.cpObject.cpArray[questionNr].hintText);
                }).on('keydown', _this.keyDownHandler).attr('role', 'button').attr('tabindex', 5)
        },
        
        // TODO - handle accessibility leftovers
        ssDisplayWhy: function (questionNr) {
            var _this = this;
            $("<div>"+ gM('mwe-quiz-why') +"</div>").prependTo(".header-container").addClass('hint-why-box')
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
        
        // This function is rendering a question screen
        ssSetCurrentQuestion: function (questionNr,replaceContentNoReload) {
            var _this = this,cPo = $.cpObject.cpArray[questionNr];

            _this.ivqShowScreen();
            _this.KIVQScreenTemplate.tmplQuestion();

            if ($.cpObject.cpArray[questionNr].hintText){
                _this.ssDisplayHint(questionNr)
            }

            if (cPo.question.length < 68){
                $(".display-question").addClass("padding7");
            }
            $(".display-question").text(cPo.question).attr('tabindex', 5).focus();
            //$(".display-question").attr('title', "Question number "+questionNr);
            $.each(cPo.answeres, function (key, value) {
                var div= $("<div class ='single-answer-box-bk'>"
                + "<div class ='single-answer-box-txt' id="
                + key + "><p></p></div></div>");
                // accessibility - make sure div is clickable via keyboard for users that do not use AT (screenreaders)
                $(div).on('keydown', _this.keyDownHandler);
                // generate unique ID for the answer-text paragraph to be used with accessibility
                var answerId = 'answer-'+key+'-text';
                // set answer text in paragraph and set its uniuqe ID
                div.find('p').text(value).attr('id',answerId);
                // make answer an accessible element
                div.attr('tabindex', 5).attr('role', 'button').attr('title', 'Answer number '+(key+1)).attr('aria-labelledby', answerId);
                // add answer to the list of all answers on this question
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
            _this.KIVQModule.reviewMode = true;
            _this.ivqShowScreen();
            _this.KIVQScreenTemplate.tmplAllCompleted();

            $(".title-text").html(gM('mwe-quiz-completed'));
            $(".sub-text").html(gM('mwe-quiz-TakeAMoment') + '<strong> '+ gM('mwe-quiz-review').toLowerCase() +' </strong>'
                + gM('mwe-quiz-yourAnswers') + '</br><strong> '+ gM('mwe-quiz-or') +' </strong>'
                + gM('mwe-quiz-goAhead')+ '<strong> '+ gM('mwe-quiz-submit').toLowerCase() +' </strong>'
            );

            $(".review-button").html(gM('mwe-quiz-review'))
                .on('click', function () {
                    _this.embedPlayer.seek(0,true);
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
            _this.ivqShowScreen();
            _this.KIVQScreenTemplate.tmplSubmitted();

            $(".title-text").html(gM('mwe-quiz-Submitted'));

            if ($.quizParams.showGradeAfterSubmission){
                if (!$.quizParams.showCorrectAfterSubmission) {
                    $(".title-text").addClass("padding23");
                    $(".sub-text").html(gM('mwe-quiz-completedScore')
                    + '<span class="scoreBig">' + score + '</span>' + ' %');
                    $(".bottomContainer").addClass("paddingB20");
                } else {
                    if(cpArray.length <= 6){
                        $(".title-text").addClass("padding10");
                    }else{
                        $(".title-text").addClass("padding3");
                    }

                    $(".sub-text").html(gM('mwe-quiz-completedScore')
                    + '<span class="scoreBig">' + score + '</span>' + ' %' + '</br>'
                    + gM('mwe-quiz-reviewSubmit'));

                    _this.KIVQModule.displayHex(_this.KIVQModule.setHexContainerPos("current"),cpArray);

                    $(document).off('click','.q-box')
                        .on('click', '.q-box', function () {
                            _this.KIVQScreenTemplate.tmplReviewAnswer();
                            _this.ssReviewAnswer(parseInt($(this).attr('id')));
                        }).attr('tabindex', '5').attr('role', 'button').attr('title', 'click to view the question and your answer');
                    $(document).off('click','.q-box-false')
                        .on('click', '.q-box-false', function () {
                            _this.KIVQScreenTemplate.tmplReviewAnswer();
                            _this.ssReviewAnswer(parseInt($(this).attr('id')));
                        }).attr('tabindex', '5').attr('role', 'button').attr('title', 'click to view the question and your answer');
                }
            }else{
                $(".title-text").addClass("padding23");
                $(".sub-text").html(gM('mwe-quiz-completedQuiz'));
                $(".bottomContainer").addClass("paddingB20");
            }
            $(document).off('click','.confirm-box')
            $(".confirm-box").html(gM('mwe-quiz-done'))
                .on('click', function () {
                    if (mw.isMobileDevice() || _this.embedPlayer.getPlayerElementTime() === 0 ){
                        _this.KIVQModule.continuePlay();
                    }else {
                        _this.KIVQScreenTemplate.tmplThankYou();
                        $(".title-text").html(gM('mwe-quiz-thankYou'));
                        $(this).delay(1000).fadeIn(function () {
                            _this.KIVQModule.quizEndFlow = false;
                            if (_this.embedPlayer.getPlayerElementTime() > 0) {
                                _this.ivqHideScreen();
                                _this.embedPlayer.seek(0, false);
                            }
                            _this.KIVQModule.continuePlay();
                        });
                    }
                    if(_this.KIVQModule.isKPlaylist){
                        mw.log("Quiz: Playlist Auto Continue After Submitted");
                        _this.embedPlayer.setKDPAttribute('playlistAPI','autoContinue',true);
                    }
                }).attr('tabindex', '5').attr('role', 'button').attr('title', 'Quiz is done. Click to continue watching the video.');
        },
        ssReviewAnswer: function (selectedQuestion) {
            var _this = this;

            if ($.cpObject.cpArray[selectedQuestion].explanation ){
                _this.ssDisplayWhy(selectedQuestion)
            }
            $(".reviewAnswerNr").append(_this.KIVQModule.i2q(selectedQuestion));
            //$(".theQuestion").html(gM('mwe-quiz-q') + "  " + $.cpObject.cpArray[selectedQuestion].question);
            $(".theQuestion").html($.cpObject.cpArray[selectedQuestion].question);
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
            $('.single-answer-box-txt#'+_this.selectedAnswer +'').attr('tabindex', 5)
                .parent().addClass("wide")
                .addClass('single-answer-box-bk-apply')
                .children().removeClass('single-answer-box-txt')
                .addClass(function(){
                    var currentAnswerNumber = $(this).attr('id');
                    $(this).addClass('single-answer-box-txt-wide')
                        .after($('<button  type="button"></button>') // adding continue/applied div as button
                            .addClass("single-answer-box-apply qContinue")
                            .text(gM('mwe-quiz-continue')).attr('aria-labeledby', 'answer-'+currentAnswerNumber+'-text').removeAttr('aria-disabled').focus()
                    )
                });
        },
        showAnswered: function (cPo, questionNr) {
            var _this = this;
            $.each(cPo.answeres, function (key, value) {
                if (key == $.cpObject.cpArray[questionNr].selectedAnswer) {
                    $('#' + key).parent().addClass("wide single-answer-box-bk-apply disable");
                    $('#' + key).removeClass('single-answer-box-txt')
                        .addClass(function(){
                            // transform answer element so it appears as an already-answered on with "applied" element
                            $(this).addClass('single-answer-box-txt-wide ')
                                .after($('<div></div>') // adding continue/applied div as button
                                    .addClass("single-answer-box-apply qApplied disable").attr('aria-disabled', true).attr('role', 'button')
                                    .text(gM('mwe-quiz-applied'))
                            );
                        });
                }
            });
            if ($.quizParams.allowAnswerUpdate ) {
                _this._selectAnswerConroller(cPo, questionNr);
            }
        },
        // function to render answers of a question when they are not yet answered 
        // (i.e. the answers user didn't choose, or all if the user never chose an answer for a given question)
        _selectAnswerConroller: function (cPo, questionNr) {
            var _this = this;
            if (_this.KIVQModule.quizSubmitted) {return false};

            if (_this.selectedAnswer &&! cPo.selectedAnswer ){
                _this.showSelectedQuestion(questionNr);
            };
            console.log(cPo);
            
            // loop through all answers and bind click event
            $('.single-answer-box-bk').off().on('keydown', _this.keyDownHandler).on('click',function(e){
                // if the answer is already chosen - click event on it does nothing
                if ($(this).hasClass('disable')) {return false};
                // this is a click on "continue" - setting to "applied", submitting the answer and continuing to play the vide (or go to "done")
                if (e.target.className === 'single-answer-box-apply qContinue' ){
                    _this.continueClickHandler(e, questionNr);
                }
                // this happens when an answer is selected (no matter if another was already selected or not)
                else{
                    // remove disable class from all other answers
                    $('.answers-container').find('.disable').removeClass('disable'); // enable all answers
                    $('.single-answer-box-bk').each(function () {
                        $(this).attr('role', 'button').attr('tabindex', 5); // make sure all are buttons - selected will be removed shortly
                        $(this).removeClass('wide single-answer-box-bk-apply single-answer-box-bk-applied');
                        $('.single-answer-box-apply').empty().remove();
                        $(this).children().removeClass('single-answer-box-txt-wide').addClass('single-answer-box-txt');
                    });
                     
                    $(this).removeAttr('role'); // accessibility - make selected answer not clickable (removing role attribute)
                    $(this).removeAttr('tabindex'); // accessibility - make answer box not reachable via tab - only its "continue" button should be reachable
                    $(this).addClass("wide")
                        .addClass('single-answer-box-bk-apply')
                        .children().removeClass('single-answer-box-txt')
                        .addClass(function(){
                            var currentAnswerNumber = $(this).attr('id');
                            // add the "continue" button for the selected answer
                            // also add accessibility capabilities for the "continue" button after the user has selected an answer
                            $(this).addClass('single-answer-box-txt-wide')
                                .after($('<button  type="button"></button>') // adding continue/applied div as button so no need to set it with a role and tabindex
                                    .addClass("single-answer-box-apply qContinue")
                                    .text(gM('mwe-quiz-continue')).attr('tabindex', 5).attr('aria-labeledby', 'answer-'+currentAnswerNumber+'-text').removeAttr('aria-disabled')
                                    .on('keydown', _this.keyDownHandler).focus()
                            );
                            
                        });
                     
                    _this.selectedAnswer =  $('.single-answer-box-txt-wide').attr('id');
                }
            });
        },
        continueClickHandler: function (e, questionNr)
        {
            var _this = this;
            e.stopPropagation();
            $('.single-answer-box-bk').addClass('disable');
            $('.single-answer-box-apply').fadeOut(100,function(){
                $(this).addClass('disable')
                    .removeClass('qContinue')
                    .text(gM('mwe-quiz-applied'))
                    .addClass('qApplied').fadeIn(100).attr('aria-disabled', true);
            });
            _this.KIVQModule.submitAnswer(questionNr,_this.selectedAnswer);
            _this.selectedAnswer = null;
            setTimeout(function(){_this.KIVQModule.checkIfDone(questionNr)},1800);
        },
        ivqShowScreen:function(){
            var _this = this,embedPlayer = this.getPlayer();
            _this.showScreen();
            console.log("hiding flash player");
            $('#kplayer_pid_kplayer').css('visibility', 'hidden');
            $('#kplayer_pid_kplayer').css('display', 'none');
            $('#kplayer_pid_kplayer').attr('aria-hidden', 'true');
        },
        ivqHideScreen:function(){
            var _this = this,embedPlayer = this.getPlayer();
            embedPlayer.getInterface().find('.ivqContainer').empty().remove();
            _this.hideScreen();
            _this.embedPlayer.enablePlayControls();
            _this.embedPlayer.triggerHelper( 'onEnableKeyboardBinding' );
            _this.KIVQModule.showQuizOnScrubber();
            $(".icon-close").css("display", "");
            console.log("showing flash player");
            $('#kplayer_pid_kplayer').css('visibility', 'visible');
            $('#kplayer_pid_kplayer').css('display', 'block');
            $('#kplayer_pid_kplayer').attr('aria-hidden', 'false');
        },
        addFooter: function (questionNr) {
            var _this = this;

            if (_this.KIVQModule.quizSubmitted) {
                $(".ftr-right").html(gM('mwe-quiz-next')).on('click', function () {
                    _this.KIVQModule.continuePlay();
                });
                return;
            }
            if (_this.KIVQModule.reviewMode) {
                $(".ftr-left").append ($('<span>   ' +  gM('mwe-quiz-review').toUpperCase()
                + ' ' + gM('mwe-quiz-question') + ' ' + this.KIVQModule.i2q(questionNr)
                + '/' + $.cpObject.cpArray.length + '</span>'));

                $(".ftr-right").html(gM('mwe-quiz-next')).on('click', function () {
                    _this.KIVQModule.continuePlay();
                }).attr('role', 'button').attr('tabindex', 5).on('keydown', _this.keyDownHandler);
            } else {
                $(".ftr-left").append($('<span> ' + gM('mwe-quiz-question') + ' ' + this.KIVQModule.i2q(questionNr)
                + '/' + $.cpObject.cpArray.length + '</span>')
                    .css("float", "right")
                    .css("cursor","default"))
                    .append($('<div></div>')
                        .addClass("pie")
                        .css("float", "right"))
                    .append($('<span>' + (_this.KIVQModule.getUnansweredQuestNrs()).length + ' '
                    + gM('mwe-quiz-unanswered') + '</span>')
                        .css("float", "right")
                        .css("cursor","default"));
                if (_this.KIVQModule.canSkip) {
                    var skipTxt;
                    if ($.cpObject.cpArray[questionNr].isAnswerd){
                        skipTxt = gM('mwe-quiz-next');
                    }else{
                        skipTxt = gM('mwe-quiz-skipForNow');
                    }
                    $(".ftr-right").html(skipTxt).on('click', function () {
                        _this.KIVQModule.checkIfDone(questionNr)
                    }).on('keydown', _this.keyDownHandler).attr('tabindex', 5).attr('role', 'button');
                }else if(!_this.KIVQModule.canSkip && $.cpObject.cpArray[questionNr].isAnswerd ){
                    $(".ftr-right").html(gM('mwe-quiz-next')).on('click', function () {
                        _this.KIVQModule.checkIfDone(questionNr)
                    });
                }
                $(".ftr-right").attr('tabindex', 5).attr('role', 'button').attr('title', 'move to next question').on('keydown', _this.keyDownHandler);
            }
        },
        keyDownHandler: function(ev){
            if(ev.which === 13 || ev.which === 32)
            {
                $(ev.target).click();
            }
        },
        displayBubbles:function(){
            var  _this = this,displayClass,embedPlayer = this.getPlayer(),handleBubbleclick;
            var scrubber = embedPlayer.getInterface().find(".scrubber");
            var buSize = _this.KIVQModule.bubbleSizeSelector(_this.inFullScreen);

            _this.KIVQModule.hideQuizOnScrubber();

            var buCotainerPos = _this.KIVQModule.quizEndFlow ? "bubble-cont bu-margin3":"bubble-cont bu-margin1";

            scrubber.parent().prepend('<div class="'+buCotainerPos+'"></div>');

            $.each($.cpObject.cpArray, function (key, val) {
                displayClass = val.isAnswerd ? "bubble bubble-ans " + buSize.bubbleAnsSize
                    : "bubble bubble-un-ans " + buSize.bubbleUnAnsSize;

                var pos = (Math.round(((val.startTime/embedPlayer.kalturaPlayerMetaData.msDuration)*100) * 10)/10)-1;
                $('.bubble-cont').append($('<div id ="' + key + '" style="margin-left:' + pos + '%">' +
                    _this.KIVQModule.i2q(key) + ' </div>')
                        .addClass(displayClass).attr('role', 'button').attr('tabindex', 5).on('keydown', _this.keyDownHandler)
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
                var qNumber = parseInt($(this).attr('id'));
                _this.seekToQuestionTime = $.cpObject.cpArray[qNumber].startTime;
                _this.KIVQModule.gotoScrubberPos(qNumber);
                _this.isSeekingIVQ = true;
                mw.log("Quiz: gotoScrubberPos : " + qNumber);
            });
        },
        displayQuizEndMarker:function(){
            var  _this = this;
            var scrubber = this.embedPlayer.getInterface().find(".scrubber");

            scrubber.parent().prepend('<div class="quizDone-cont"></div>');

            $(document).off( 'click', '.quizDone-cont' )
                .on('click', '.quizDone-cont', function () {
                    _this.KIVQModule.quizEndScenario();
                });
            $('.quizDone-cont').attr('tabindex', 5).attr('role', 'button').attr('title', 'click to end quiz now').on('keydown', _this.keyDownHandler).focus();
        }
    }));
})(window.mw, window.jQuery);
