/**
 * Created by mark.feder Kaltura.
 *
 * */
(function (mw, $) {
    "use strict";
    $.cpObject = {};
    $.quizParams = {};
    $.changedMedia = 0;
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
            autoContinue: false,
            previewPlayerEnabled: false
        },
        postAnswerTimer : 1800,
        isSeekingIVQ:false,
        inFullScreen:false,
        selectedAnswer:null,
        seekToQuestionTime:null,
        multiStreamWelcomeSkip:false,
        relatedStreamChanging:false,
        IVQVer:'IVQ-2.74.rc1',
        ivqShowScreenMode: false,

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
            this.bind('dualScreen_onChangeStream', function () {
                _this.relatedStreamChanging = true;
            });
            this.bind('dualScreen_onChangeStreamDone', function () {
                _this.relatedStreamChanging = false;
            });



            embedPlayer.addJsListener( 'kdpReady', function(){
                $.changedMedia ++;
                _this.destroy();
                // [FEC-6441: Quiz plugin damaged when switching between dual video options]
                // Don't reload quiz cuepoints when a stream change occurs
                // Needed for the dual-video cases in which only the parent media contains quiz metadata
                if (_this.relatedStreamChanging) {
                    return;
                }

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
                        if($.changedMedia > 1){
                            _this.displayBubbles();
                        }
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
                        if(_this.getPlayer().firstPlay && _this.KIVQModule.showWelcomePage) {
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
                // KMS-13599
                // Let the mw.KCuePoints 'seeked' handler run before
                // in order to make sure that the 'KalturaSupport_CuePointReached' event,
                // triggered by the 'seeked' event, is not handled by the plugin
                setTimeout(function () {
                    _this.isSeekingIVQ = false;
                    mw.log("Quiz: Seeked");
                }, 0);
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
            if (_this.getPlayer().getInterface().hasClass("mobile")){
                $( window ).on( "orientationchange resize", function() {
                    if(_this.ivqShowScreenMode && _this.isPortrait() ) {
                        _this.showPortraitWarning();
                    }else {
                        _this.hidePortraitWarning();
                    }
                });
            }
            
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

        retakeSuccess : function(data){
            var _this = this;
            if(data.objectType === "KalturaAPIException"){
                _this.KIVQModule.errMsg('Error', data);
            }else{
                // reset quiz and KIVQModule
                this.destroy();
                this.KIVQModule.destroy();
                this.KIVQModule.setupQuiz().then(function(){
                    // new quiz data is now loaded - proceed with CPs loading 
                    _this.KIVQModule.getQuestionsAndAnswers(function(){
                        _this.embedPlayer.stopPlayAfterSeek = false;
                        _this.embedPlayer.seek(0,false);
                        _this.ivqHideScreen()
                    })
                })
            }
        },

        retake : function(){
            var _this = this;
            this.KIVQModule.retake(function(data){
                // retake successful 
                _this.retakeSuccess(data);
            });
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
                }).focus().attr('id', 'welcome-continue-button');
            // verify focus in IE
            document.getElementById('welcome-continue-button').focus();

            if ($.quizParams.attemptsAllowed > 0){
                var localedText = gM('mwe-quiz-available-tries');
                var availableRetakes = $.quizParams.attemptsAllowed
                var retakes = _this.KIVQModule.retakeNumber; // 0 is the 1st try, 1 is the first retake ... 
                if(availableRetakes <= retakes ){
                    localedText = "";
                }else{
                    var attempts = availableRetakes-retakes;
                    if(isNaN(attempts)){
                        // this is in case this is the 1st load of the quiz 
                        attempts = availableRetakes
                    }
                    // handle post 1st submit (we need to decrease by 1)
                    if(this.KIVQModule.quizSubmitted ){
                        attempts--;
                    }
                    // edge case - when we have 1 attempts - show nothing (1 attempt is the last attempt) 
                    if(attempts != 0){
                        localedText = localedText.split("|X|").join(attempts); // locale : "Total attempts available for this quiz: |X|"
                    }else{
                        localedText = "";
                    }
                }
                $(".retake-box").text(localedText);
            }

        },

        // TODO - handle accessibility leftovers
        ssAlmostDone: function (unAnsweredArr) {
            var _this = this,embedPlayer = this.getPlayer();;

            _this.ivqShowScreen();
            _this.KIVQScreenTemplate.tmplAlmostDone();

            $(".title-text").html(gM('mwe-quiz-almostDone'));
            $(".sub-text").html(gM('mwe-quiz-remainUnAnswered') + '</br>' + gM('mwe-quiz-pressRelevatToAnswer'))
            $(".confirm-box").html(gM('mwe-quiz-okGotIt')).attr("tabindex", 5).attr("title", gM('mwe-quiz-okGotIt')).on('keydown', _this.keyDownHandler);
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
            var className = 'hint-why-box';
            if(gM('mwe-quiz-hint').length > 4){
                className = 'hint-why-box smaller-font';
            }
            $("<div>"+ gM('mwe-quiz-hint') +"</div>").prependTo(".header-container").addClass(className)
                .on('click', function () {
                    _this.KIVQScreenTemplate.tmplHint();
                    $(".header-container").addClass('close-button')
                        .on('click', function () {
                            _this.ssSetCurrentQuestion(questionNr);
                        })
                        .on('keydown', _this.keyDownHandler)
                        .attr({'role': 'button','tabindex': 5,'title':'Close hint','id': 'hint-close-button'})
                        .focus()
                    $(".hint-container").append($.cpObject.cpArray[questionNr].hintText)
                        .attr({'tabindex': 5})
                        .on('keydown',function(e){
                            e.preventDefault();
                            if(e.keyCode === 9 ){
                                $('#hint-close-button')[0].focus();
                            }
                            });
                }).on('keydown', _this.keyDownHandler).attr('role', 'button').attr('tabindex', 5);
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
        
        submitOpenQuestion: function(cuepoint){
            // we have the cuepoint and the value 
            cuepoint.openAnswer = this.embedPlayer.getInterface().find(".open-question-textarea").val();
            this.KIVQModule.submitAnswer(cuepoint.key,null,cuepoint.openAnswer);
            this.selectedAnswer = null;
            var _this = this;
            setTimeout(function(){
                _this.KIVQModule.checkIfDone(cuepoint.key)
            },
            _this.postAnswerTimer);
        },

        // This function is rendering a question screen
        ssSetCurrentQuestion: function (questionNr) {
            var _this = this,cPo = $.cpObject.cpArray[questionNr];
            _this.ivqShowScreen();
            _this.KIVQScreenTemplate.tmplQuestion();

            if ($.cpObject.cpArray[questionNr].hintText){
                _this.ssDisplayHint(questionNr)
            }
            var className = this.getClassByCPType(cPo.questionType);
            $(".ivqContainer").addClass(className);
            if (cPo.question.length < 68){
                $(".display-question").addClass("padding7");
            }
            var displayQuestion = $(".display-question");
            //Search for links and links patterns ( [text|http://exampl.com] ) and add a real link to a new tab
            displayQuestion.text(cPo.question).attr({'tabindex': 5,"aria-lable":cPo.question}).focus();
            var questionText = this.wrapLinksWithTags(displayQuestion.html());
            displayQuestion.html(questionText);
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

            // OPEN QUESTION
            var interfaceElement = this.embedPlayer.getInterface();

            if(cPo.questionType == this.KIVQModule.QUESTIONS_TYPE.OPEN_QUESTION){
                this.buildOpenQuestion(cPo);
            }

            if (cPo.isAnswerd){
                if(cPo.questionType == this.KIVQModule.QUESTIONS_TYPE.OPEN_QUESTION){
                    // this is an open question - we need to fill the value from the coresponding answer CP
                    // and ,anipulate the UI to support changes. 
                    if(cPo.openAnswer){
                        interfaceElement.find(".ivqContainer").addClass("answered");
                        interfaceElement.find(".open-question-textarea").val(cPo.openAnswer);
                        interfaceElement.find("#open-question-clear,#open-question-save,.open-question-textarea")
                        .attr("disabled", "disabled");
                        interfaceElement.find(".open-answer-container").addClass("allow-change");
                        var charsLength = interfaceElement.find(".open-question-textarea").val().length;
                        interfaceElement.find(".open-question-chars .chars").text(charsLength);

                    } else {
                        // reset UI elements to save in case a previous open question was already answered 
                        interfaceElement.find("#open-question-save")
                        .text(gM('mwe-quiz-open-question-save'));
                        interfaceElement.find("#open-question-clear,#open-question-save")
                        .removeAttr("disabled");

                    }                  
                }else{
                    _this.showAnswered(cPo, questionNr);
                }
            }
            else {
                if (_this.isReflectionPoint(cPo)) {
                    _this.KIVQModule.submitAnswer(questionNr,0);
                }
                _this._selectAnswerConroller(cPo, questionNr);
            }
            this.addFooter(questionNr);
        },
        buildOpenQuestion: function(cPo){
            var _this = this;
            var interfaceElement = this.embedPlayer.getInterface();
            // clear button 
            interfaceElement.find("#open-question-clear")
            .off()
            .click( $.proxy( function(){
                interfaceElement.find(".open-question-textarea").val("").focus();
                interfaceElement.find(".open-question-chars .chars").text("0");
                interfaceElement.find("#open-question-clear,#open-question-save").attr("disabled", "disabled");
            }, _this ))
            
            // save and change-answer buttons 
            interfaceElement.find("#open-question-save")
            .off()
            .click( $.proxy( function(cuepoint){
                if(interfaceElement.find(".open-question-textarea").val() == ""){
                    // dont send empty answer
                    return;
                }
                this.submitOpenQuestion(cuepoint)
            }, _this , cPo ))
            interfaceElement.find("#open-question-change-answer")
            .off()
            .click( $.proxy( function(cuepoint){
                // change answer - set UI state and focus on the textarea 
                interfaceElement.find(".ivqContainer.answered").removeClass("answered");
                interfaceElement.find("#open-question-change-answer").hide();
                interfaceElement.find(".open-question-textarea").removeAttr("disabled").focus();
                interfaceElement.find("#open-question-clear,#open-question-save").attr("disabled", "disabled");
            }, _this , cPo ))

            // textarea 
            interfaceElement.find(".open-question-textarea")
            .attr("placeholder",gM('mwe-quiz-open-question-add-answer-here'))
            .off()
            .bind('change keyup paste', function() {
                var charsLength = $(this).val().length;
                interfaceElement.find(".open-question-chars .chars").text(charsLength);
                if(charsLength==0){
                    interfaceElement.find("#open-question-clear,#open-question-save").attr("disabled", "disabled");
                }else{
                    interfaceElement.find("#open-question-clear,#open-question-save").removeAttr("disabled");
                }
            })
            .change(function(){
                var holdAnswer = $(this).val();
                interfaceElement.find(".hint-why-box")
                .click(function () {
                    $(".close-button")
                    .click(function () {
                        interfaceElement.find(".open-question-textarea").val(holdAnswer);
                    })
                });
            });

            // apply locale strings 
            interfaceElement.find("#open-question-clear").text(gM('mwe-quiz-open-question-clear'));
            interfaceElement.find("#open-question-save").text(gM('mwe-quiz-open-question-save'));
            interfaceElement.find("#open-question-change-answer").text(gM('mwe-quiz-open-question-change-answer'));

            // enter update-mode only if we have a previous answer value on the CP, AND allowed to change answer AND this quiz was not submitted yet
            if ($.quizParams.allowAnswerUpdate && !this.KIVQModule.quizSubmitted && cPo.openAnswer ) {
                // update open question mode 
                interfaceElement.find("#open-question-change-answer").show();
                interfaceElement.find(".open-question-textarea").removeAttr("disabled");
            }else if(!this.KIVQModule.quizSubmitted && !cPo.openAnswer ){
                // Normal mode 
                // We have not submitted quiz yet but user had not filled this question yet - keep textarea enabled
                interfaceElement.find("#open-question-change-answer").hide(); 
                interfaceElement.find(".open-question-textarea").removeAttr("disabled");
            }else {
                // Not allowed to answer mode  
                // Open question should be locked  
                interfaceElement.find("#open-question-change-answer").hide();
                interfaceElement.find(".open-question-textarea").attr("disabled", "disabled");
            }
        },

        getClassByCPType: function(cpTypeId){
            switch (cpTypeId) {
                case this.KIVQModule.QUESTIONS_TYPE.TRUE_FALSE:
                    return 'true-false-question';
                case this.KIVQModule.QUESTIONS_TYPE.OPEN_QUESTION:
                    return 'open-question';
                case this.KIVQModule.QUESTIONS_TYPE.REFLECTION_POINT:
                    return 'reflection-point-question';
                case this.KIVQModule.QUESTIONS_TYPE.MULTIPLE_ANSWER_QUESTION:
                    return 'multiple-answer-question';
                case this.KIVQModule.QUESTIONS_TYPE.FILL_IN_BLANK:
                    return 'fill-in-blank-question';
                case this.KIVQModule.QUESTIONS_TYPE.HOT_SPOT:
                    return 'hot-spot-question';
                case this.KIVQModule.QUESTIONS_TYPE.GO_TO:
                    return 'go-to-question';
                case this.KIVQModule.QUESTIONS_TYPE.MULTIPLE_CHOICE_ANSWER:
                default:
                    return 'multiple-choice-answer-question';
            }
        },
        ssAllCompleted: function () {
            var _this = this;
            _this.KIVQModule.reviewMode = true;
            _this.ivqShowScreen();
            _this.KIVQScreenTemplate.tmplAllCompleted();

            $(".title-text").html(gM('mwe-quiz-completed'));
            $(".sub-text").html(gM('mwe-quiz-sub-text'));

            $(".review-button").append(
                $('<div/>').addClass('button-block').append(
                    $('<span/>').addClass('button-icon review-icon'),
                    $('<span/>').addClass('button-text').text(gM('mwe-quiz-review'))
                )
            ).on('click', function () {
                    _this.embedPlayer.seek(0,true);
                    _this.KIVQModule.continuePlay();
                }).on('keydown', _this.keyDownHandler);

            $(".submit-button").append(
                $('<div/>').addClass('button-block').append(
                    $('<span/>').addClass('button-icon submit-icon'),
                    $('<span/>').addClass('button-text').text( gM('mwe-quiz-submit') )
                )
            ).on('click', function () {
                    $(this).off('click');
                    $(this).html(gM('mwe-quiz-plsWait'));
                    _this.KIVQModule.setSubmitQuiz();
                }).on('keydown', _this.keyDownHandler);
        },
        ssSubmitted: function (score) {
            var _this = this,cpArray = $.cpObject.cpArray;
            // TODO - pass this to IVQ module 
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
                        $(".title-text").addClass("padding5");
                    }else{
                        $(".title-text").addClass("padding3");
                    }

                    $(".sub-text").html(gM('mwe-quiz-completedScore')
                    + '<span class="scoreBig">' + score + '</span>' + ' %' + '</br>'
                    + gM('mwe-quiz-reviewSubmit'));

                    _this.KIVQModule.displayHex(_this.KIVQModule.setHexContainerPos("current"),cpArray);

                    $(document).off('click','.q-box:not(.reflection-point-question)')
                        .on('click', '.q-box:not(.reflection-point-question)', function () {
                            _this.KIVQScreenTemplate.tmplReviewAnswer();
                            _this.ssReviewAnswer(parseInt($(this).attr('id')));
                        })
                        .attr({'tabindex': '5' , 'role': 'button','title': 'click to view the question and your answer'});

                        $(document).off('click','.q-box-false:not(.reflection-point-question)')
                        .on('click', '.q-box-false:not(.reflection-point-question)', function () {
                            _this.KIVQScreenTemplate.tmplReviewAnswer();
                            _this.ssReviewAnswer(parseInt($(this).attr('id')));
                        })
                        .attr({'tabindex': '5' , 'role': 'button','title': 'click to view the question and your answer'})
                }
                $('.q-box:not(.reflection-point-question) ,.q-box-false:not(.reflection-point-question)')
                    .attr({'tabindex': '5' , 'role': 'button','title': 'click to view the question and your answer'})
                    .on('keydown', _this.keyDownHandler);



            }else{
                $(".title-text").addClass("padding23");
                $(".sub-text").html(gM('mwe-quiz-completedQuiz'));
                $(".bottomContainer").addClass("paddingB20");
            }

            var retakesTotal = $.quizParams.attemptsAllowed;
            var currentRetake = _this.KIVQModule.retakeNumber;
            var localedText = gM('mwe-quiz-retake-btn'); //  Locale : "Retake (|X|/|Y|)"
            
            if( !retakesTotal ){
                // no retakes 
                $(".retake-btn,.retake-summary-text").hide();
            }else{
                // handle summary text 
                var summaryText = gM('mwe-quiz-retake-summary'); //This is attempt |attempt| of |attempts|
                var summaryScoreText = gM('mwe-quiz-retake-score-summary'); //, your score is |score| based on |scoreType|,
                if(!currentRetake){
                    currentRetake = 1;
                }else{
                    currentRetake++;
                }
                localedText = localedText.split("|X|").join(currentRetake); // assign retakes 
                localedText = localedText.split("|Y|").join(retakesTotal); // assign total 
                summaryText = summaryText.split("|attempt|").join(currentRetake);
                summaryText = summaryText.split("|attempts|").join(retakesTotal);
                var score = Math.round(_this.KIVQModule.calculatedScore * 100);
                summaryScoreText = summaryScoreText.split("|score|").join(score);
                summaryScoreText = summaryScoreText.split("|scoreType|").join(gM('mwe-quiz-retake-scoretype-'+_this.KIVQModule.scoreType));
                $(".retake-summary-text").text(summaryText);
                if ($.quizParams.showGradeAfterSubmission){
                    $(".retake-summary-score-text").text(summaryScoreText);
                }
                if(retakesTotal === currentRetake ){
                    // no more retakes - do not show the retake button 
                    $(".retake-btn").hide();
                }
                // retake button 
                $(".retake-btn").text(localedText).attr({"tabindex": 5,"title": localedText})
                .on('click',  $.proxy(this.retake,this))
                .on('keydown', _this.keyDownHandler)
            }


            $(document).off('click','.confirm-box')
            $(".confirm-box").html(gM('mwe-quiz-done'))
                .on('click', function () {
                    if (mw.isMobileDevice() || _this.embedPlayer.getPlayerElementTime() === 0 ){
                        _this.KIVQModule.continuePlay();
                        _this.KIVQModule.quizEndFlow = false;
                    }else {
                        _this.KIVQScreenTemplate.tmplThankYou();
                        $(".title-text").html(gM('mwe-quiz-thankYou'));
                        $(this).delay(1000).fadeIn(function () {
                            _this.KIVQModule.quizEndFlow = false;
                            if (_this.embedPlayer.getPlayerElementTime() > 0) {
                                _this.ivqHideScreen();
                            }
                            if (_this.getConfig("autoContinue")) {
                                _this.KIVQModule.continuePlay();
                            }
                        });
                    }
                    if(_this.KIVQModule.isKPlaylist){
                        mw.log("Quiz: Playlist Auto Continue After Submitted");
                        _this.embedPlayer.setKDPAttribute('playlistAPI','autoContinue',true);
                    }
                })
                .attr({'tabindex': '5','role': 'button','title':'Quiz is done. Click to continue watching the video.'})
                .focus()
                .on('keydown', _this.keyDownHandler);

        },
        ssReviewAnswer: function (selectedQuestion) {
            var _this = this;

            if ($.cpObject.cpArray[selectedQuestion].explanation ){
                _this.ssDisplayWhy(selectedQuestion)
            }
            $(".reviewAnswerPrefix").append(gM('mwe-quiz-question-number'));
            $(".reviewAnswerNr").append(_this.KIVQModule.i2q(selectedQuestion));
            //$(".theQuestion").html(gM('mwe-quiz-q') + "  " + $.cpObject.cpArray[selectedQuestion].question);
            $(".theQuestion").html(this.wrapLinksWithTags($.cpObject.cpArray[selectedQuestion].question));
            $(".yourAnswerText").html(gM('mwe-quiz-yourAnswer'));
            $(".yourAnswer").html($.cpObject.cpArray[selectedQuestion].answeres[$.cpObject.cpArray[selectedQuestion].selectedAnswer]);
            if (!$.cpObject.cpArray[selectedQuestion].isCorrect ) {
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
            }).attr('role', 'button').attr('tabindex', '5').focus().on('keydown', _this.keyDownHandler);
            
            // handle open quesition 
            if($.cpObject.cpArray[selectedQuestion].questionType === this.KIVQModule.QUESTIONS_TYPE.OPEN_QUESTION 
                && $.cpObject.cpArray[selectedQuestion].openAnswer){
                var text = $.cpObject.cpArray[selectedQuestion].openAnswer;
                var feedback = $.cpObject.cpArray[selectedQuestion].feedback;
                text = text.replace(/\n/g,"<br/>");
                $(".yourAnswer").html(text).addClass("open-question-answer");
                $(".correctAnswerText").html("");
                if (feedback) {
                    console.log($.cpObject)
                    $(".feedback").html("Feedback").bind('click', function () {
                        $(".feedback-modal").show();
                        $(".reviewAnswerPlace").hide();
                        $(".reviewAnswerFooter").hide();

                    });
                    $(".feedback-modal .icon-close").bind('click', function () {
                        $(".feedback-modal").hide();
                        $(".reviewAnswerPlace").show();
                        $(".reviewAnswerFooter").show();
                    });
                    $(".feedback-content").html(feedback);
                }
            }
        },
        showSelectedQuestion:function(questionNr){
            var _this = this;
            $('.single-answer-box-txt#'+_this.selectedAnswer +'').attr('tabindex', 5)
                .parent().addClass("wide")
                .addClass('single-answer-box-bk-apply')
                .children().removeClass('single-answer-box-txt')
                .addClass(function(){
                    var currentAnswerNumber = parseInt($(this).attr('id'))+1;
                    var currentAnswerText = $('#answer-'+(currentAnswerNumber-1)+'-text').html();
                    $(this).addClass('single-answer-box-txt-wide')
                        .after($('<button  type="button"></button>') // adding continue/applied div as button
                            .addClass("single-answer-box-apply qContinue")
                            .text(gM('mwe-quiz-continue')).attr('aria-label', 'Continue quiz with the selected answer: '+currentAnswerText).removeAttr('aria-disabled').focus()
                            .attr('id', 'continue-button-answer-'+currentAnswerNumber)
                    );
                   // verify focus in IE
                    document.getElementById('continue-button-answer-'+currentAnswerNumber).focus();
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
                                    .text(gM('mwe-quiz-selected'))
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
                            var currentAnswerNumber = parseInt($(this).attr('id'))+1;
                            var currentAnswerText = $('#answer-'+(currentAnswerNumber-1)+'-text').html();
                            // add the "continue" button for the selected answer
                            // also add accessibility capabilities for the "continue" button after the user has selected an answer
                            $(this).addClass('single-answer-box-txt-wide')
                                .after($('<div ></div>') // adding continue/applied div as button so no need to set it with a role and tabindex
                                    .addClass("single-answer-box-apply qContinue")
                                    .text(gM('mwe-quiz-select')).attr('tabindex', 5).attr('aria-label', 'Continue quiz  with the selected answer: '+currentAnswerText).removeAttr('aria-disabled')
                                    .on('keydown', _this.keyDownHandler).attr('id', 'continue-button-answer-'+currentAnswerNumber).attr('role', 'button')
                            );
                            // verify focus in IE
                            //setTimeout("document.getElementById('continue-button-answer-"+currentAnswerNumber+"').focus();", 100);
                            document.getElementById('continue-button-answer-'+currentAnswerNumber).focus();
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
                    .text(gM('mwe-quiz-selected'))
                    .addClass('qApplied').fadeIn(100).attr('aria-disabled', true);
            });
            _this.KIVQModule.submitAnswer(questionNr,_this.selectedAnswer);
            _this.selectedAnswer = null;
            setTimeout(function(){_this.KIVQModule.checkIfDone(questionNr)},_this.postAnswerTimer);
        },

        showPortraitWarning:function(){
            this.embedPlayer.getInterface().append(
                $('<div/>').addClass('ivq-orientation-message').append(
                    $('<div/>').addClass('ivq-orientation-message__text')
                        .html('This video contains features that works best on landscape mode.<br/>Please flip your screen to continue')
                )
            );
        },
        hidePortraitWarning:function () {
            this.embedPlayer.getInterface().find(".ivq-orientation-message").remove();
        },

        ivqShowScreen:function(){
            var _this = this;
            _this.ivqShowScreenMode = true;
            // add warning message when in portrait + mobile
            if ( _this.isPortrait() ) {
                _this.showPortraitWarning();
            }
            _this.showScreen();
            mw.log("hiding flash player");
            $('#kplayer_pid_kplayer').css('visibility', 'hidden');
            $('#kplayer_pid_kplayer').css('display', 'none');
            $('#kplayer_pid_kplayer').attr('aria-hidden', 'true');
        },
        isPortrait: function () {
            if ( this.getPlayer().getInterface().hasClass("mobile") && mw.getConfig('EmbedPlayer.IsFriendlyIframe') ) {
                if (parent.document.body.parentNode.clientWidth < parent.document.body.parentNode.clientHeight) {
                    return true;
                }
            }
            return false;
        },
        ivqHideScreen:function(){
            var _this = this,embedPlayer = this.getPlayer();
            embedPlayer.getInterface().find('.ivqContainer').empty().remove();
            _this.ivqShowScreenMode = false;
            _this.hideScreen();
            _this.embedPlayer.enablePlayControls();
            _this.embedPlayer.triggerHelper( 'onEnableKeyboardBinding' );
            _this.KIVQModule.showQuizOnScrubber();
            $(".icon-close").css("display", "");
            mw.log("showing flash player");
            $('#kplayer_pid_kplayer').css('visibility', 'visible');
            $('#kplayer_pid_kplayer').css('display', 'block');
            $('#kplayer_pid_kplayer').attr('aria-hidden', 'false');
        },

        addQuePointsNavigationButtons:function (questionNr) {
            var _this = this;
            var allPoints = $.cpObject.cpArray;
            var currentPoint = allPoints[questionNr];
            if(currentPoint){
                var nextBtn = $('<a/>').addClass('cp-navigation-btn next-cp disabled').attr({'href':'#','tabindex': -1,'aria-label':gM('mwe-quiz-next-question-disabled' )});
                var prevBtn = $('<a/>').addClass('cp-navigation-btn prev-cp disabled').attr({'href':'#','tabindex': -1,'aria-label':gM('mwe-quiz-previous-question-disabled')});
                var separator = $("<div/>").addClass('separator-block').append($('<span/>').addClass('separator'));
                
                var prevQuePoint = allPoints[currentPoint.key-1];
                if(currentPoint.key > allPoints[0].key && prevQuePoint){
                    //allow go to prev CP: 1 - if canSkip is true; 2 - if canSkip is false but current CP and prev CP is already answered
                    if( (_this.KIVQModule.canSkip) || (!_this.KIVQModule.canSkip && currentPoint.isAnswerd && prevQuePoint.isAnswerd) ){
                        prevBtn.attr({'aria-label':gM('mwe-quiz-previous-question'),'tabindex': 5})
                            .removeClass('disabled')
                            .on('keydown', _this.keyDownHandler)
                            .on('click',function (e) {
                                e.preventDefault();
                                _this.KIVQModule.continuePlay();
                                _this.seekToQuestionTime = prevQuePoint.startTime;
                                _this.KIVQModule.gotoScrubberPos(prevQuePoint.key);
                                _this.isSeekingIVQ = true;
                                mw.log("Quiz: gotoScrubberPos : " + prevQuePoint.key);
                            });
                    }
                }
                var nextQuePoint = allPoints[currentPoint.key+1];
                if(currentPoint.key < allPoints[allPoints.length-1].key && nextQuePoint){
                    //allow go to next CP: 1 - if canSkip is true; 2 - if canSkip is false but current CP and next CP is already answered
                    if( (_this.KIVQModule.canSkip) || (!_this.KIVQModule.canSkip && nextQuePoint.isAnswerd)){
                        nextBtn.attr({'aria-label':gM('mwe-quiz-next-question') ,'tabindex': 5 })
                            .removeClass('disabled')
                            .on('keydown', _this.keyDownHandler)
                            .on('click',function (e) {
                                e.preventDefault();
                                _this.KIVQModule.continuePlay();
                                _this.seekToQuestionTime = nextQuePoint.startTime;
                                _this.KIVQModule.gotoScrubberPos(nextQuePoint.key);
                                _this.isSeekingIVQ = true;
                                mw.log("Quiz: gotoScrubberPos : " + nextQuePoint.key);
                            });
                    }
                }
                var navigation  = $("<div/>").addClass('cp-navigation').append(prevBtn, separator, nextBtn );
                $('.ftr-container').prepend( navigation);
            }
        },
        addFooter: function (questionNr) {
            var _this = this;
            _this.addQuePointsNavigationButtons(questionNr);

            if (_this.KIVQModule.quizSubmitted) {
                $(".ftr-right").html(gM('mwe-quiz-next')).on('click', function () {
                    _this.KIVQModule.continuePlay();
                }).on('keydown', _this.keyDownHandler).attr({'tabindex': 6.3, "role" : "button"});
                return;
            }
            if (_this.KIVQModule.reviewMode) {
                $(".ftr-left").append ($('<span>   ' +  gM('mwe-quiz-review').toUpperCase()
                + ' ' + gM('mwe-quiz-question') + ' ' + this.KIVQModule.i2q(questionNr)
                + '/' + $.cpObject.cpArray.length + '</span>'));

                $(".ftr-right").html(gM('mwe-quiz-next')).on('click', function () {
                    _this.KIVQModule.continuePlay();
                }).attr({'tabindex': 6.3, "role" : "button"}).on('keydown', _this.keyDownHandler);
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
                    var skipTxt = gM('mwe-quiz-skipForNow');
                    if ($.cpObject.cpArray[questionNr].isAnswerd || _this.isReflectionPoint($.cpObject.cpArray[questionNr]) ){
                        skipTxt = gM('mwe-quiz-next');
                    }

                    $(".ftr-right").html(skipTxt).on('click', function () {
                        _this.KIVQModule.checkIfDone(questionNr)
                    }).on('keydown', _this.keyDownHandler).attr('tabindex', 5).attr('role', 'button');
                }else if(!_this.KIVQModule.canSkip &&  ( $.cpObject.cpArray[questionNr].isAnswerd || _this.isReflectionPoint($.cpObject.cpArray[questionNr])) ){
                    $(".ftr-right").html(gM('mwe-quiz-next')).on('click', function () {
                        _this.KIVQModule.checkIfDone(questionNr)
                    });
                }
                $(".ftr-right").attr('tabindex', 5).attr('role', 'button').attr('title', gM('mwe-quiz-skipForNow')).on('keydown', _this.keyDownHandler);
            }
        },
        keyDownHandler: function(ev){
            if(ev.which === 13 || ev.which === 32)
            {
                $(ev.target).click();
            }else if(ev.which === 9){
                var _this = this;
                setTimeout(function () {
                    var currentFocusedElement = $(':focus');//when timeout will done - new element will be in focus
                    if(!currentFocusedElement.parents('.quiz').length){
                        if($(_this).parents(".quiz").find(".pdf-download-img").length){
                            $(_this).parents(".quiz").find(".pdf-download-img").focus();
                        }
                        else if($(_this).parents(".quiz").find(".confirm-box").length){
                            $(_this).parents(".quiz").find(".confirm-box").focus();
                        }
                        else if($(_this).parents(".quiz").find(".hint-why-box").length){
                            //find hint
                            $(_this).parents(".quiz").find(".hint-why-box").focus();
                        }else{
                            $(_this).parents(".quiz").find(".display-question").focus();
                            // if hint isnt there - focus on the name
                        }
                        return;
                    }
                }, 0);
            }


        },
        displayBubbles:function(){
            var  _this = this;
            var displayClass;
            var embedPlayer = this.getPlayer();
            var handleBubbleclick;
            var scrubber = embedPlayer.getInterface().find(".scrubber");
            var buSize = _this.KIVQModule.bubbleSizeSelector(_this.inFullScreen);
            _this.KIVQModule.hideQuizOnScrubber();
            var buCotainerPos = _this.KIVQModule.quizEndFlow ? "bubble-cont bu-margin3":"bubble-cont bu-margin1";

            scrubber.parent().prepend('<div class="'+buCotainerPos+'"></div>');
            if($.cpObject.cpArray){
                $.each($.cpObject.cpArray, function (key, val) {
                    displayClass = val.isAnswerd ? "bubble bubble-ans " + buSize.bubbleAnsSize
                    : "bubble bubble-un-ans " + buSize.bubbleUnAnsSize;
                    
                    var pos = (Math.round(((val.startTime/embedPlayer.kalturaPlayerMetaData.msDuration)*100) * 10)/10)-1;
                    $('.bubble-cont').append($('<div id ="' + key + '" style="margin-left:' + pos + '%">' +
                    _this.KIVQModule.i2q(key) + ' </div>')
                    .addClass(displayClass).attr('role', 'button').attr({'tabindex': 20 , "aria-label" : "Jump to Question "+ (key+1) }).on('keydown', _this.keyDownHandler)
                    );
                });
            }
            if (_this.KIVQModule.canSkip) {
                handleBubbleclick = '.bubble';
            }
            else{
                handleBubbleclick = '.bubble-ans';
            }
            $('.bubble','.bubble-ans','.bubble-un-ans').off();
            $(handleBubbleclick).on('click', $.proxy(this.onBubbleClick, _this) );
        },
        onBubbleClick: function (event) {
            var qNumber = parseInt($(event.target).attr("id"));
            this.seekToQuestionTime = $.cpObject.cpArray[qNumber].startTime;
            this.KIVQModule.gotoScrubberPos(qNumber);
            this.isSeekingIVQ = true;
            mw.log("Quiz: gotoScrubberPos : " + qNumber);
        },
        displayQuizEndMarker:function(){
            var  _this = this;
            var controlBar = this.embedPlayer.getControlBarContainer();
            controlBar.find('.bubble-cont').append('<div class="quizDone-cont"></div>');

            $(document).off( 'click', '.quizDone-cont' )
                .on('click', '.quizDone-cont', function () {
                    _this.KIVQModule.quizEndScenario();
                });
            $('.quizDone-cont').attr({
                'tabindex': 20,
                'role':'button',
                'title':'click to end quiz now',
                'aria-label':gM('mwe-quiz-submit-button'),
                'id':'quiz-done-continue-button'
            }).on('keydown', _this.keyDownHandler).focus();
            // verify focus in IE
            document.getElementById('quiz-done-continue-button').focus();
            setTimeout(function () {
                $(_this.embedPlayer.getInterface()).find('.quizDone-cont').first().addClass('small');
            },3000);
        },
        // Wrap links with <a href... tag so they will be clickable.
        wrapLinksWithTags: function(text) {
            var wrapLinksWithTitle = text.replace(/\[(\s+)?([^\|\]]*)(\|)(\s+)?((https?|ftps?):\/\/[^\s\]]+)(\s+)?(\])/gi, function(url) {
                var updatedUrl = url.slice(1,-1).split('|');
                var title = updatedUrl[0].trim();
                var href = updatedUrl[1].trim();
                return '<a target="_blank" href="' + href + '">' + title + '</a>';
            });
            return wrapLinksWithTitle.replace(/((https?|ftps?):\/\/[^"<\s]+)(?![^<>]*>|[^"]*?<\/a)/gi, function(url) {
                return '<a target="_blank" href="' + url + '">' + url + '</a>';
            });
        },
        destroy : function(){
            $.cpObject = {};
            $.quizParams = {};
            this.killBubbles();
        },
        killBubbles : function(){
            // destroy bubbles events and UI
            $('.bubble','.bubble-ans','.bubble-un-ans').off();
            $('.bubble-cont').empty();
            $('.bubble-cont').remove();
        },
        isReflectionPoint: function(cPo){
            return cPo.questionType && cPo.questionType === this.KIVQModule.QUESTIONS_TYPE.REFLECTION_POINT;
        }
    }));
})(window.mw, window.jQuery);
