/*
 * Created by mark.feder on 10/13/2015.
 */
(function (mw, $) {
    "use strict";
    mw.KIVQScreenTemplate = function (embedPlayer) {
        $(".videoHolder").attr("aria-live", "polite");
        return this.init(embedPlayer);
    };
    if (!(mw.KIVQScreenTemplate.prototype = {

            bindPostfix: '.KIVQScreenTemplate',
            init: function (embedPlayer) {
                var _this = this;
                this.destroy();
                this.embedPlayer = embedPlayer;
            },
            tmplWelcome:function(){
                var _this = this;
                $(".icon-close").css("display", "none");
                $(_this.emptyScreen()).hide().append(
                    '<div class="ivqContainer">' +
                    '<div class="welcome" tabindex="5"></div>' +
                    '<div class="pdf-download"></div>' +
                    '<div class="welcomeMessage" tabindex="5"></div>' +
                    '<div class="InvideoTipMessage" tabindex="5"></div>' +
                    '<div class="bottomContainer padding10">' +
                        '<div class="confirm-box" role="button" title="to take the quiz"></div>' +
                        '<div class="retake-box"></div>' +
                    '</div>' +
                    '</div>').fadeIn( "fast" );
            },
            tmplQuestion:function(){
                var _this = this;
                $(".icon-close").css("display", "none");
                $(_this.emptyScreen()).hide().append(
                    '<div class="ivqContainer">'+
                    '   <div class="header-container">' +
                    '       <div class="display-question"></div>' +
                    '   </div>' +
                    '   <div class="answers-container"></div>' +
                    '   <div class="open-answer-container">'+
                    '       <div class="open-answer-inner">'+
                    '             <div class="open-question_textarea-container">'+
                    '                   <textarea class="open-question-textarea" maxlength="270" tabindex="5"></textarea>'+ 
                    '             </div>' +
                    '            <div class="open-answer-footer">' +
                    '                <div class="open-question-chars"><span class="chars">0</span>/270</div>' +
                    '                <button id="open-question-clear" tabindex="5" disabled="disabled"></button>' +
                    '                <button id="open-question-save" tabindex="5" disabled="disabled"></button>' +
                    '                <button id="open-question-change-answer" tabindex="5"></button>' +
                    '            </div>' +                   
                    '       </div>' +
                    '   </div>' +
                    '   <div class = "ftr-container">' +
                    '       <div class="ftr-left"></div>' +
                    '       <div class="ftr-right"></div>' +
                    '   </div>'+
                    '</div>').fadeIn( "fast" );
            },
            tmplReviewAnswer:function(){
                var _this = this;
                $(".icon-close").css("display", "none");
                $(_this.emptyScreen()).hide().append(
                    '<div class="ivqContainer">'+
                    '   <div class="feedback-modal" role="dialog">' +
                    '       <span class="icon-close feedback-close" aria-label="Close feedback" tabindex="0" role="button"></span>' +
                    '       <div class="feedback-content-wrapper">' +
                    '           <div class="feedback-content-container">' +
                    '               <p class="feedback-content" tabindex="0" role="article" aria-live="polite"></p>' +
                    '           </div>' +
                    '       </div>' +
                    '   </div>' +
                    '   <div class="header-container"></div>'+
                    '   <div class ="reviewAnswerPlace" >'+
                    '       <div class="theQuestion"></div>'+
                    '       <div class="yourAnswerText"></div>'+
                    '       <div class="yourAnswer"></div>'+
                    '       <div class="feedback"></div>'+
                    '       <div class="correctAnswerText"></div>'+
                    '       <div class="correctAnswer"></div>'+
                    '   </div>'+
                    '   <div class ="reviewAnswerFooter" >'+
                    '       <span class = "reviewAnswerPrefix"></span>'+
                    '       <div class = "reviewAnswerNr"> </div>'+
                    '       <div class="gotItBox"></div>'+
                    '   </div>'+
                    '</div>').fadeIn( "fast" );

            },
            tmplSubmitted:function(){
                var _this = this;
                $(".icon-close").css("display", "none");
                $(_this.emptyScreen()).hide().append(
                    '<div class="ivqContainer submitted">' +
                    '   <div class="title-text"></div>' +
                    '   <div class="sub-text"></div>' +
                    '   <div class="summary">' +
                    '       <span class="retake-summary-text"></span>' +
                    '       <span class="retake-summary-score-text"></span>' +
                    '   </div>' +
                    '   <div class="display-all-container">' +
                    '       <div class ="hex-row">' +
                    '           <div class="hex-column  left-arrow" style="display: none;"></div>' +
                    '           <div class="hex-column  right-arrow" style="display: none;" ></div>' +
                    '           <div class="hex-column hexagon-container"></div>' +
                    '       </div>' +
                    '   </div>' +
                    '   <div class="bottomContainer ">' +
                    '       <div class="confirm-box"></div>' +
                    '       <div class="retake-btn"></div>' +
                    '   </div>' +
                    '</div>').fadeIn( "fast" );

            },
            tmplHint:function(){
                var _this = this;
                $(".icon-close").css("display", "none");
                $(_this.emptyScreen()).hide().append(
                    '<div class="ivqContainer">'+
                    '   <div class="header-container"></div>'+
                    '   <div class="hint-container"></div>'+
                    '</div>').fadeIn( "fast" );
            },
            tmplWhy:function(){
                var _this = this;
                $(".icon-close").css("display", "none");
                $(_this.emptyScreen()).hide().append(
                    '<div class="ivqContainer">' +
                    '   <div class="header-container"></div>' +
                    '   <div class="hint-container"></div>' +
                    '</div>').fadeIn( "fast" );
            },
            tmplAllCompleted:function(){
                var _this = this;
                $(".icon-close").css("display", "none");
                $(_this.emptyScreen()).hide().append(
                    '<div class="ivqContainer">'+
                    '   <div class="title-text padding20"></div>'+
                    '   <div class="sub-text margin-top4"></div>'+
                    '   <div class="completed-BottonContainer">'+
                    '       <div class="review-button button-box-attr font-Lato2" tabindex="5" role="button" title="review your answers"></div>'+
                    '       <div class="submit-button button-box-attr font-Lato2" tabindex="5" role="button" title="Submit your answers"></div>'+
                    '   </div>'+
                    '</div>').fadeIn( "fast" );
            },
            tmplDisplayHexContainer:function(){
                var _this = this;
                $(".icon-close").css("display", "none");
                $(_this.emptyScreen()).hide().append(
                    '<div class="ivqContainer">'+
                    '   <div class="title-text"></div>'+
                    '   <div class="sub-text"></div>'+
                    '   <div class="display-all-container">'+
                    '       <div class ="hex-row">'+
                    '           <div class="hex-column  left-arrow" style="display: none;"></div>'+
                    '           <div class="hex-column  right-arrow" style="display: none;" ></div>'+
                    '           <div class="hex-column hexagon-container"></div>'+
                    '       </div>'+
                    '   </div>'+
                    '   <div class="bottomContainer">'+
                    '       <div class="confirm-box"></div>'+
                    '   </div>'+
                    '</div>').fadeIn( "fast" );
            },
            tmplAlmostDone:function(){
                var _this = this;
                $(".icon-close").css("display", "none");
                $(_this.emptyScreen()).hide().append(
                    '<div class="ivqContainer">' +
                    '   <div class="title-text padding20"></div>' +
                    '   <div class="sub-text padding4"></div>'+
                    '   <div class="bottomContainer  padding10">'+
                    '       <div class="confirm-box"></div>'+
                    '   </div>' +
                    '</div>').fadeIn( "fast" );
            },
            tmplThankYou:function(){
                var _this = this;
                $(".icon-close").css("display", "none");
                $(_this.emptyScreen()).hide().append(
                    '<div class="ivqContainer">' +
                    '   <div class="title-text thank-you"></div>' +
                    '</div>').fadeIn( "fast" );
            },
            tmplErrorScreen:function(showButton){
                var _this = this;
                var buttonUi = "";
                // in case we are on a failed-submitting an answer we want to allow the end-user to 
                // return to the question - hence the button. 
                if(showButton){
                    buttonUi = '<div class="confirm-box" id="back-to-question" role="button" title='+ gM('mwe-quiz-back-to-question') +' tabindex="5">' + gM('mwe-quiz-back-to-question') + '</div>';
                }
                $(_this.emptyScreen()).hide().append(
                    '<div class="ivqContainer">'+
                    '   <div class="title-text"></div>'+
                    '   <div class="sub-text padding14"></div>'+
                        buttonUi +
                    '</div>')
                    .fadeIn( "fast" );
            },
            emptyScreen:function(){
                this.embedPlayer.getInterface().find('.ivqContainer').remove();
                var cleanScreen = this.embedPlayer.getInterface().find('.screen-content');

                return cleanScreen;
            },
            destroy: function () {

            }

        })) {
    }
})(window.mw, window.jQuery );


