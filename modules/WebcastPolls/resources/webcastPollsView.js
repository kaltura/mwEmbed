(function (mw, $) {
    "use strict";
    mw.webcastPolls = mw.webcastPolls || {};

    mw.webcastPolls.WebcastPollsView = mw.KBasePlugin.extend({
        defaultConfig : {
            'templatePath' : '../WebcastPolls/resources/webcastPolls.tmpl.html'
        },
        parent : {}, // ## This object will be assigned by the container
        $webcastPoll : null,
        locale: {
            respondsLbl: gM('mwe-webc-polls-respondsLbl')
        },
        getWebcastPollElement : function()
        {
            var _this = this;

            if (_this.$webcastPoll)
            {
                return _this.$webcastPoll;
            }

            try
            {
                var pollRawHTML = (window && window.kalturaIframePackageData && window.kalturaIframePackageData.templates) ?  window.kalturaIframePackageData.templates[_this.getConfig('templatePath')] : '';

                if (pollRawHTML && _this.getPlayer() && _this.getPlayer().getVideoHolder()) {
                    var poll = $(pollRawHTML);
                    poll.find('.answer').click($.proxy(_this.parent.handleAnswerClicked,_this.parent));

                    _this.$webcastPoll = poll;
                    _this.getPlayer().getVideoHolder().append(_this.$webcastPoll);
                }
            }catch(e)
            {
                _this.$webcastPoll = null;
            }

            return (_this.$webcastPoll && _this.$webcastPoll.length) ? true : false;
        },
        removeWebcastPollElement : function()
        {
            var _this = this;
            if (_this.$webcastPoll)
            {
                _this.$webcastPoll.remove();
                _this.$webcastPoll = null;
            }
        },
        syncDOMPollResults : function()
        {
            var _this = this;
            if (_this.$webcastPoll)
            {
                var $container = _this.$webcastPoll.find("[name='totals']");

                if ($container)
                {
                    var pollResults = _this.parent.pollData.pollResults;
                    var hasPollContent = _this.parent.pollData.content;
                    var showTotals = _this.parent.pollData.showTotals;

                    if (showTotals &&  hasPollContent && pollResults && pollResults.totalVoters )
                    {
                        var label = '';
                        var totalVotersAsNumber = pollResults.totalVoters.match('^[0-9]+$') ? parseInt(pollResults.totalVoters) : null;
                        if (totalVotersAsNumber && totalVotersAsNumber > 10000)
                        {
                            label =  (totalVotersAsNumber - (totalVotersAsNumber % 1000)) / 1000 + "K";
                        }else
                        {
                            label = pollResults.totalVoters;
                        }
                        $container.find("[name='text']").text(label);
                        $container.show();
                    }else
                    {
                        $container.hide();
                    }
                }
            }
        },
        syncDOMUserVoting : function()
        {
            var _this = this;
            if (_this.$webcastPoll)
            {
                var pollContent = _this.parent.pollData.content;

                if (pollContent) {
                    var selectedAnswerSelector = '[name="answer' + _this.parent.userVote.answer + '"]';

                    _this.$webcastPoll.find('.answer').not('.answer>' + selectedAnswerSelector).removeClass('selected');

                    if (_this.parent.userVote.answer) {
                        _this.$webcastPoll.find(selectedAnswerSelector).parent().addClass('selected');
                    }

                    if (_this.parent.canUserVote()) {
                        _this.$webcastPoll.addClass('allow-voting');
                    } else {
                        _this.$webcastPoll.removeClass('allow-voting');
                    }
                }

            }
        },
        syncPollDOM : function()
        {
            var _this = this;

            function updateAnswer(answerIndex, pollData)
            {
                var answerContent = pollData.answers[answerIndex + ''];
                if (answerContent) {
                    _this.$webcastPoll.find('[name="answer' + answerIndex + '"]').text(answerContent).parent().show();
                }else
                {
                    _this.$webcastPoll.find('[name="answer' + answerIndex + '"]').parent().hide();
                }
            }

            if (_this.parent.currentPollId)
            {
                // ## should check that requested poll is shown

                // Make sure we have a container
                if (!_this.$webcastPoll)
                {
                    _this.$webcastPoll = _this.getWebcastPollElement();
                }

                var pollContent = _this.parent.pollData.content;

                if (pollContent)
                {
                    _this.$webcastPoll.find('[name="question"]').text(pollContent.question);
                    updateAnswer(1,pollContent);
                    updateAnswer(2,pollContent);
                    updateAnswer(3,pollContent);
                    updateAnswer(4,pollContent);
                    updateAnswer(5,pollContent);

                    _this.showPollDOMContent();
                }else
                {
                    _this.$webcastPoll.find('[name="question"],[name="answer1"],[name="answer2"],[name="answer3"],[name="answer4"],[name="answer5"]').text('');
                    _this.showPollDOMLoader();
                }

                _this.syncDOMPollResults();
                _this.syncDOMUserVoting();
            }else
            {
                // ## should hide poll if any is shown
            }
        },
        showPollDOMLoader : function()
        {
            var _this = this;
            if (_this.$webcastPoll) {
                _this.$webcastPoll.find('[name="pollContent"]').hide();
                _this.$webcastPoll.find('[name="loadingContainer"]').show();
            }
        },
        showPollDOMContent : function()
        {
            var _this = this;

            if (_this.$webcastPoll) {
                _this.$webcastPoll.find('[name="loadingContainer"]').hide();
                _this.$webcastPoll.find('[name="pollContent"]').fadeIn('slow');
            }
        }

    });

})(window.mw, window.jQuery);
