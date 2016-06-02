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
        createWebcastPollElement : function()
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
        syncDOMUserVoting : function()
        {
            var _this = this;
            if (_this.$webcastPoll)
            {
                var selectedAnswerSelector = '[name="answer' + _this.parent.userVote.answer + '"]';

                _this.$webcastPoll.find('.answer').not('.answer>'+selectedAnswerSelector).removeClass('selected');

                if (_this.parent.userVote.answer)
                {
                    _this.$webcastPoll.find(selectedAnswerSelector).parent().addClass('selected');
                }

            }
        },
        syncPollDOM : function(){
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
                    _this.$webcastPoll = _this.createWebcastPollElement();
                }

                var pollData = _this.parent.currentPollId ? _this.parent.pollsData[_this.parent.currentPollId] : null;

                if (pollData)
                {
                    _this.$webcastPoll.find('[name="question"]').text(pollData.question);
                    updateAnswer(1,pollData);
                    updateAnswer(2,pollData);
                    updateAnswer(3,pollData);
                    updateAnswer(4,pollData);
                    updateAnswer(5,pollData);

                    _this.showPollDOMContent();
                }else
                {
                    _this.$webcastPoll.find('[name="question"],[name="answer1"],[name="answer2"],[name="answer3"],[name="answer4"],[name="answer5"]').text('');
                    _this.showPollDOMLoader();
                }

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
        },

    });

})(window.mw, window.jQuery);
