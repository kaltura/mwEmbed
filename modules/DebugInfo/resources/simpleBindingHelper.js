( function( mw, $ ) {

    "use strict";


    mw.HtmlBinderHelper=function(element, $scope) {

        var internal = {};
        var updaters = {};
        return {

            bind: function () {

                var parser=function(originalText,updateHtml) {
                    var matches = originalText.match(/{{(.*)}}/g);


                    if (matches && matches.length > 0) {
                        matches.forEach(function (match) {
                            var name = match.slice(2, -2);

                            var filterIndex=name.indexOf('|');
                            var filter;
                            if (filterIndex>0) {
                                var filterName=name.substring(filterIndex+1).trim();
                                name=name.substring(0,filterIndex).trim();
                                filter=$scope[filterName];
                            }

                            var updater=function() {

                                var value=internal[name];
                                if (!value) {
                                    value="";
                                }

                                var newContent = originalText.replace(match,value);
                                if (filter) {
                                    newContent=filter(newContent);
                                }
                                updateHtml(newContent);
                            };

                            defineProp(name, updater);

                            updater();
                        });
                    }
                };


                var defineProp = function (name, updateHtml) {
                    //copy from old defenition
                    if (!internal.hasOwnProperty(name)) {
                        internal[name] = $scope[name];
                        updaters[name] = [];
                    }

                    if (!$scope.hasOwnProperty(name)) {
                        updaters[name] = [];
                        var updater = updaters[name];
                        Object.defineProperty($scope, name, {
                            get: function () {
                                return internal[name];
                            },
                            set: function (newValue) {
                                try {
                                    if (internal[name] !== newValue) {
                                        internal[name] = newValue;

                                        for (var i = 0; i < updater.length; i++) {
                                            updater[i]();
                                        }
                                    }
                                }
                                catch (e) {
                                    mw.log("exception in Object.defineProperty " + e.message + " " + e.stack);
                                }
                            }
                        });
                    }
                    updaters[name].push(updateHtml);
                };

                $('*',element).each(function ($index, el) {

                    var shouldShowValue=el.getAttribute("ng-show");
                    if (shouldShowValue) {
                        var updateHtml=function() {
                            var newContent =  internal[shouldShowValue];
                            if (newContent) {
                                el.style.display = "inherit";
                            } else {
                                el.style.display = "none";
                            }

                        };

                        defineProp(shouldShowValue, updateHtml);

                        updateHtml();

                    }
                    if(el.childNodes.length>1) {
                        return;
                    }
                    var originalText = el.innerHTML;

                    parser(originalText, function(newContent) {
                        el.innerHTML = newContent;
                    });


                    $(el.attributes).each(function (index, element) {
                        //var elementName = element.name;
                        var originalValue = element.value;


                        parser(originalValue, function(newContent) {
                            element.value = newContent;
                        });


                    });


                });

            }
        }
    }
} )( window.mw, window.jQuery );