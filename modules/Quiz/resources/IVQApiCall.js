/**
 * Created by mark.feder on 10/13/2015.
 */
(function (mw, $) {
    "use strict";
    mw.KIVQApi = function (embedPlayer) {
        return this.init(embedPlayer);
    };
    if (!(mw.KIVQApi.prototype = {
            bindPostfix: '.KIVQApi',
            init: function (embedPlayer) {

                var _this = this;
                this.destroy();
                this.embedPlayer = embedPlayer;

                this.getUserEntryIdAndQuizParams = function(callback){

                    var getQuizuserEntryIdAndQuizParams = [{
                        'service': 'userEntry',
                        'action': 'list',
                        'filter:objectType': 'KalturaQuizUserEntryFilter',
                        'filter:entryIdEqual': _this.embedPlayer.kentryid,
                        'filter:userIdEqualCurrent':'1',
                        'filter:orderBy': '-version'
                    }, {
                        'service': 'quiz_quiz',
                        'action': 'get',
                        'entryId': _this.embedPlayer.kentryid
                    }];

                    _this.getKClient().doRequest(getQuizuserEntryIdAndQuizParams, function (data) {
                        callback(data);
                    });
                };
                this.getQuestionAnswerCuepoint = function(kQuizEntryId, kQuizUserEntryId,callback){

                    var getCp = [{
                        'service': 'cuepoint_cuepoint',
                        'action': 'list',
                        'filter:entryIdEqual': kQuizEntryId,
                        'filter:objectType': 'KalturaQuestionCuePointFilter',
                        'filter:cuePointTypeEqual': 'quiz.QUIZ_QUESTION',
                        'filter:orderBy': '+startTime'
                    },{
                        'service': 'cuepoint_cuepoint',
                        'action': 'list',
                        'filter:objectType': 'KalturaAnswerCuePointFilter',
                        'filter:entryIdEqual': kQuizEntryId,
                        'filter:quizUserEntryIdEqual':kQuizUserEntryId,
                        'filter:cuePointTypeEqual': 'quiz.QUIZ_ANSWER'
                    }];

                    _this.getKClient().doRequest(getCp, function (data) {

                        callback(data);
                    });
                };


                this.createQuizUserEntryId = function(callback){

                    var createQuizuserEntryId = {
                        'service': 'userEntry',
                        'action': 'add',
                        'userEntry:objectType': 'KalturaQuizUserEntry',
                        'userEntry:entryId': _this.embedPlayer.kentryid
                    };

                    _this.getKClient().doRequest(createQuizuserEntryId, function (data) {
                        callback(data);
                    });

                };
                this.addAnswer = function(isAnswered,selectedAnswer,kQuizUserEntryId,questionNr,callback){

                    var _this = this,answerParams = {};
                    var quizSetAnswer = {
                        'service': 'cuepoint_cuepoint',
                        'cuePoint:objectType': "KalturaAnswerCuePoint",
                        'cuePoint:answerKey': selectedAnswer,
                        'cuePoint:quizUserEntryId': kQuizUserEntryId
                    };

                    if (isAnswered) {
                        answerParams = {
                            'action': 'update',
                            'id': $.cpObject.cpArray[questionNr].answerCpId,
                            'cuePoint:entryId': $.cpObject.cpArray[questionNr].cpEntryId
                        }
                    } else {
                        answerParams = {
                            'action': 'add',
                            'cuePoint:entryId': $.cpObject.cpArray[questionNr].cpEntryId,
                            'cuePoint:parentId': $.cpObject.cpArray[questionNr].cpId,
                            'cuePoint:startTime': '0'
                        };
                    }

                    $.extend(quizSetAnswer, answerParams);
                    _this.getKClient().doRequest(quizSetAnswer, function (data) {

                        callback(data);
                    });
                };

                this.submitQuiz = function (kQuizUserEntryId,callback) {

                    var submitQuizParams = {
                        'service': 'userEntry',
                        'action': 'submitQuiz',
                        'id': kQuizUserEntryId
                    };
                    _this.getKClient().doRequest(submitQuizParams, function (data) {

                        callback(data);

                    });
                };

                this.downloadIvqPDF = function (EntryId,callback) {
                    var downloadPdf = {
                        'service': 'quiz_quiz',
                        'action': 'getUrl',
                        'quizOutputType':1,
                        'entryId': EntryId
                    };
                    _this.getKClient().doRequest(downloadPdf, function (data) {
                        callback(data);
                    });
                };
            },
            retake: function (callback){
                this.createQuizUserEntryId(callback);
            },
            destroy: function () {

            },

            getKClient: function () {
                var _this = this;
                if (!this.kClient) {
                    this.kClient = mw.kApiGetPartnerClient(_this.embedPlayer.kwidgetid);
                }
                return this.kClient;
            }

        })) {
    }
})(window.mw, window.jQuery );

