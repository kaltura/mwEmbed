/**
 * Created by mark.feder on 11/22/2015.
 */
/**
 * Created by mark.feder on 10/13/2015.
 */
(function (mw, $) {
    "use strict";
    mw.KIVQScreenTemplate = function (embedPlayer) {
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
                $(_this.emptyScreen()).hide().append(
                '<div class="ivqContainer">' +
                '<div class="welcome"></div>' +
                '<div class="pdf-download"></div>' +
                '<div class="welcomeMessage"></div>' +
                '<div class="InvideoTipMessage"></div>' +
                '<div class="bottomContainer">' +
                '<div class="confirm-box"></div>' +
                '</div>' +
                '</div>').fadeIn( "slow" );
            },
            tmplQuestion:function(){
                var _this = this;
                $(_this.emptyScreen()).hide().append(
                '<div class="header-container">' +
                '<div class="display-question"></div>' +
                '</div>' +
                ' <div class="answers-container"></div>' +
                ' <div class = "ftr-container">' +
                '<div class="ftr-left"></div>' +
                '<div class="ftr-right"></div>' +
                '</div>').fadeIn( "slow" );
            },
            tmplReviewAnswer:function(){
                var _this = this;
                $(_this.emptyScreen()).hide().append(
                '<div class="header-container"></div>'+
                '<div class = "reviewAnswerNr"> </div>'+
                '<div class ="reviewAnswerPlace" >'+
                '<div class="theQuestion"></div>'+
                '<div class="yourAnswerText"></div>'+
                '<div class="yourAnswer"></div>'+
                '<div class="correctAnswerText"></div>'+
                '<div class="correctAnswer"></div>'+
                '</div>'+
                '<div class="gotItBox"></div>').fadeIn( "slow" );

            },
            tmplSubmitted:function(){
                var _this = this;
                $(_this.emptyScreen()).hide().append(
                '<div class="ivqContainer">' +
                '   <div class="title-text"></div>' +
                '   <div class="sub-text"></div>' +
                '   <div class="display-all-container">' +
                '       <div class ="hex-row">' +
                '           <div class="hex-column  left-arrow" style="display: none;"></div>' +
                '           <div class="hex-column  right-arrow" style="display: none;" ></div>' +
                '           <div class="hex-column hexagon-container"></div>' +
                '       </div>' +
                '   </div>' +
                '   <div class="bottomContainer">' +
                '       <div class="confirm-box"></div>' +
                '   </div>' +
                '</div>').fadeIn( "slow" );

            },
            tmplHint:function(){
                var _this = this;
                $(_this.emptyScreen()).hide().append(
                '<div class="ivqContainer">'+
                '   <div class="header-container"></div>'+
                '   <div class="hint-container"></div>'+
                '</div>').fadeIn( "slow" );
            },
            tmplWhy:function(){
                var _this = this;
                $(_this.emptyScreen()).hide().append(
                    '<div class="ivqContainer">' +
                    '   <div class="header-container"></div>' +
                    '   <div class="hint-container"></div>' +
                    '</div>').fadeIn( "slow" );
            },
            tmplAllCompleted:function(){
                var _this = this;
                $(_this.emptyScreen()).hide().append(
                    '<div class="ivqContainer">'+
                    '   <div class="title-text"></div>'+
                    '   <div class="sub-text margin-top4"></div>'+
                    '   <div class="completed-BottonContainer">'+
                    '       <div class="review-button button-box-attr font-Lato2"></div>'+
                    '       <div class="submit-button button-box-attr font-Lato2"></div>'+
                    '   </div>'+
                    '</div>').fadeIn( "slow" );
            },
            tmplDisplayHexContainer:function(){
                var _this = this;
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
                    '</div>').fadeIn( "slow" );
            },
            tmplThankYou:function(){
                var _this = this;
                $(_this.emptyScreen()).hide().append(
                    '<div class="ivqContainer">' +
                    '   <div class="title-text thank-you"></div>' +
                    '</div>').fadeIn( "slow" );
            },
            tmplErrorScreen:function(){
                var _this = this;
                $(_this.emptyScreen()).hide().append(
                    '<div class="ivqContainer">'+
                    '   <div class="title-text"></div>'+
                    '   <div class="sub-text padding14"></div>'+
                    '</div>').fadeIn( "slow" );
            },
            emptyScreen:function(){
                var cleanScreen = this.embedPlayer.getInterface().find('.screen-content').empty();
                return cleanScreen;
            },
            destroy: function () {
                //var _this = this;
            }

        })) {
    }
})(window.mw, window.jQuery );


