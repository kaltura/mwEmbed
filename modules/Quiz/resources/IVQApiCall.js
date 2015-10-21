(function (mw, $) {
    "use strict";
        mw.KIVQApi = function (embedPlayer) {
        return this.init(embedPlayer);
    };
    if (!(mw.KIVQApi.prototype = {

            // The bind postfix:
            bindPostfix: '.KIVQApi',
         //   qnaService: null,

            init: function (embedPlayer) {

                var _this = this;
                // Remove any old bindings:
                this.destroy();
                // Setup player ref:
                this.embedPlayer = embedPlayer;

                this.getUserEntryIdAndQuizParams = function(callback){

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
                    }];

                    _this.getKClient().doRequest(getQuizuserEntryIdAndQuizParams, function (data) {

                        callback(data);
                    });
                };
            this.getQuestionAnswerCuepoint = function(kQuizUserEntryId,callback){

                var getCp = [{
                    'service': 'cuepoint_cuepoint',
                    'action': 'list',
                    'filter:entryIdEqual': _this.embedPlayer.kentryid,
                    'filter:objectType': 'KalturaCuePointFilter',
                    'filter:cuePointTypeEqual': 'quiz.QUIZ_QUESTION',
                    'filter:orderBy': '+startTime'
                },{
                    'service': 'cuepoint_cuepoint',
                    'action': 'list',
                    'filter:objectType': 'KalturaAnswerCuePointFilter',
                    'filter:entryIdEqual':_this.embedPlayer.kentryid,
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
                        'cuePoint:entryId': _this.embedPlayer.kentryid
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

            },// init end
            destroy: function () {
                //clearInterval(this.currentTimeInterval);
                //this.currentTimeInterval = null;
                //clearInterval(this.answerOnAirQueueUpdateInterval);
                //$(this.embedPlayer).unbind(this.bindPostfix);
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

