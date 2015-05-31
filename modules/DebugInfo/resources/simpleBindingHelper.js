( function( mw, $ ) {

    "use strict";


    mw.HtmlBinderHelper=function() {

        return {

            bind: function (element, $scope) {

                var _this = this;
                var internal = {};

                var updaters = {};

                for (var propertyName in $scope) {
                    if ($scope.hasOwnProperty(propertyName)) {
                        internal[propertyName] = $scope[propertyName];
                        delete $scope[propertyName];
                    }
                }


                var defineProp = function (name, updateHtml) {


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
                    ;
                    updaters[name].push(updateHtml);
                }

                element.find("*").each(function ($index, el) {

                    var originalText = el.innerText;

                    var matches = originalText.match(/{{(.*)}}/g);


                    if (matches && matches.length > 0) {
                        matches.forEach(function (match) {
                            var name = match.slice(2, -2);


                            function updateHtml() {
                                var newContent = originalText.replace(match, internal[name]);
                                el.innerHTML = newContent;
                            }

                            defineProp(name, updateHtml);

                            updateHtml();
                        });
                    }


                    $(el.attributes).each(function (index, element) {
                        var elementName = element.name;
                        var originalValue = element.value;

                        var matches = originalValue.match(/{{(.*)}}/g);


                        if (matches && matches.length > 0) {
                            matches.forEach(function (match) {
                                var name = match.slice(2, -2);


                                function updateHtml() {
                                    var newContent = originalValue.replace(match, internal[name]);
                                    element.value = newContent;
                                }

                                defineProp(name, updateHtml);

                                updateHtml();
                            });
                        }

                    });


                });

            }
        }
    }
} )( window.mw, window.jQuery );