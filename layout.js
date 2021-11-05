(function () {



    var ace2threeSecurity = function ($http, $timeout, dialog) {
        return{
            restrict: 'E',
            templateUrl: 'ace2three-security.html',
            scope: {
                source: '@',
                mobileNumber: '@',
                emailId: '@'
            },
            link: function (scope, element, attr) {
                scope.show = true;
                scope.invalidOTP = false;
                scope.error_msg = undefined;
                scope.showTimer = false;
                scope.count = 0;
                scope.count++;
                scope.showTimer = true;
                $timeout(function () {
                    scope.showTimer = false;
                }, 60000);
                scope.onChange = function () {
                    scope.invalidOTP = false;
                };
                scope.validateOtp = function (form) {
                    scope.invalidOTP = false;
                    if (form.$valid) {
                        $http.get('playerCommunication.do?method=accountSecurityOtpVerify&otpValue=' + form.otp.$viewValue)
                                .then(function (response) {
                                    scope.show = true;
                                    dialog.close();
                                }).catch(scope.invalid.bind(scope));
                    }
                };
                scope.resend = function () {
                    $http.get('playerCommunication.do?method=accountSecurityOtp&requestSource=' + scope.source)
                            .then(function (response) {
                                if (response.data.message === 'SKIP_SECURITY') {
                                    return dialog.close();
                                }
                                scope.show = true;
                                if (response.data.status == 200) {
                                    scope.count++;
                                    scope.showTimer = true;
                                    $timeout(function () {
                                        scope.showTimer = false;
                                    }, 60000);
                                    scope.mobileNumber = response.data.mobileNumber;
                                    scope.emailId = response.data.emailID;
                                } else {
                                    scope.error_msg = 'Please try again later';
                                }
                            }).catch(scope.invalid.bind(scope));
                };
                scope.invalid = function (response) {
                    scope.show = true;
                    if (response.status === 400) {
                        scope.invalidOTP = true;
                    } else if (response.status === 403) {
                        scope.error_msg = response.data.message;
                    } else if (response.status === 419) {
                        location.href = 'login.html';
                    } else {
                        scope.error_msg = 'Please try again later';
                    }
                    return response;
                };

            }
        };
    };

    var isNumericNew = function () {
        var numericregx = /^[0-9]*$/;
        return {
            require: '?ngModel',
            link: function (scope, element, attrs, ctrl) {
                element.bind("keypress", function (event) {
                    var a = (event.which) ? event.which : event.keyCode;
                    if (a > 31 && (a < 48 || a > 57)) {
                        return false;
                    }
                    return true;
                });
                ctrl.$validators.number = function (modelValue) {
                    if (numericregx.test(modelValue)) {
                        return true;
                    }
                    return false;
                };
            }
        };
    };

    var confirm = function () {
        return {
            require: "?ngModel",
            priority: 1e4,
            scope: {
                confirm: "=confirmpwd"
            },
            link: function (scope, element, attrs, ngModel) {
                element.on('keydown', function (event) {
                    if (event.which === 32) {
                        return false;
                    }
                });
                ngModel.$validators.pawordMatch = function (modelValue) {
                    var newPass = scope.confirm;
                    var confirm = modelValue;
                    console.log(newPass + '::::::::: ' + confirm);
                    if (confirm != undefined && newPass != undefined
                            && newPass != confirm) {
                        return false;
                    } else {
                        return true;
                    }
                };

                scope.$watch("confirm", function () {
                    ngModel.$validate();
                });
            }
        };
    };

    var validatepassword = function () {
        return {
            require: "?ngModel",
            link: function (scope, element, attrs, ngModel) {
                element.on('keydown', function (event) {
                    if (event.which === 32) {
                        return false;
                    }
                });

                ngModel.$validators.notOnlyNumberNew = function (modelValue) {
                    if (modelValue !== undefined) {
                        var v = /[0-9]/.test(modelValue);
                        if (v) {
                            return true;
                        } else {
                            return false;
                        }
                    }
                    return false;
                };
//
                ngModel.$validators.notonlychar = function (modelValue) {
                    if (modelValue !== undefined) {
                        return /[a-zA-Z]/.test(modelValue);
                    }
                    return true;
                };

                ngModel.$validators.removeSpecialchar = function (modelValue) {
                    if (modelValue !== undefined) {
                        return /^[a-zA-Z0-9\!\@\$\^\*\(\)\_\+\-\.\~\`\?\=\|\[\]\{\}\;]*$/.test(modelValue);
                    }
                    return true;
                };


                ngModel.$validators.pwdsameNickname = function (modelValue) {
                    if (modelValue !== undefined && scope.userId === modelValue.toUpperCase()) {
                        console.log('nickNamepartpwd ' + scope.userId);
                        return false;
                    }
                    return true;
                };

//            ngModel.$validators.pwdSameCurrpwd = function (modelValue) {
//                if (modelValue != undefined && scope.otherModel != undefined &&
//                        modelValue === scope.otherModel) {
//                    return false;
//                }
//                return true;
//            };

                ngModel.$validators.nickNamepartpwd = function (modelValue) {
                    var userId = scope.userId;
                    console.log('userId ' + userId);
                    if (modelValue !== undefined && modelValue.length > userId.length &&
                            modelValue.toLowerCase().search(userId.toLowerCase()) >= 0) {
                        console.log('nickNamepartpwd ' + scope.userId);
                        return false;
                    }
                    return true;
                };

                ngModel.$validators.pwdPartNickName = function (modelValue) {
                    var userId = scope.userId;
                    if (modelValue !== undefined && userId.length > modelValue.length &&
                            userId.toLowerCase().search(modelValue.toLowerCase()) >= 0) {
                        console.log('pwdPartNickName ' + scope.userId);
                        return false;
                    }
                    return true;
                };

            }
        };
    };

    var setPasswordServiceFun = function (dialog, DataService) {

        var setPasswordController = function ($scope) {
            var model = this;
            model.disableSetPwdBtn = false;
            DataService.getAccountData().then(function (data) {
                $scope.userId = data.userid;
            });
            model.showSetPasswordModal = true;
            model.showConfirmPwdModal = false;
            model.changepwd_submitted = false;
            $("#cnfmpasswordFb,#newPass,#otpValueFb").focus(function () {
                $scope.$apply(function () {
                    model.changepwd_submitted = false;
                    $scope.fbChangePwd.otpValueFb.$setValidity('invalidotp', true);
                    model.errorMsg = "";
                    //$scope.fbChangePwd.newpaswordFb.$setValidity('newPasswordServerError', true);
                });
            });
            model.close = function () {
                dialog.close();
            };
            model.setNewPasswordToFbUser = function (isValid) {
                console.log('validateChangePwd ' + isValid
                        + ', model.otpValueFb ' + model.otpValueFb
                        + ', model.cnfmpasswordFb ' + model.cnfmpasswordFb);
                model.changepwd_submitted = true;
                model.resendPMessage = "";
                model.errorMsg = "";
                if (isValid) {
                    model.discp = true;
                    $.post('socialActPwd.do?method=setSocialPwd', {
                        otpVal: model.otpValueFb,
                        password: model.cnfmpasswordFb
                    }, function (data) {
                        data = data.replace(/^\s+|\s+$/g, "");
                        console.log('setNewPasswordToFbUser::: ' + data);
                        if (data === "100") {
                            $scope.$apply(function () {
                                model.showConfirmPwdModal = false;
                                model.setPasswordSuccess = true;
                            });
                        } else {
                            if (data === 'OTPFail') {
                                $scope.$apply(function () {
                                    $scope.fbChangePwd.otpValueFb.$setValidity('invalidotp', false);
                                    model.resendPMessage = "";
                                });
                            } else {
                                $scope.$apply(function () {
                                    model.errorMsg = data;
                                    model.resendPMessage = "";
                                    //$scope.fbChangePwd.newpaswordFb.$setValidity('newPasswordServerError', false);
                                });
                            }
                        }
                    });
                }
            };

            model.resendOTP = function (valideForm) {
                model.changepwd_submitted = true;
                model.resendPMessage = "";
                if (valideForm) {
                    $.post("resend.do", {userId: $scope.userId}, function (res) {
                        if (res === 'sent') {
                            $scope.$apply(function () {
                                model.otpValueFb = "";
                                model.changepwd_submitted = false;
                                model.resendPMessage = 'OTP sent to registered email id and phone number';
                            });
                        } else {
                            $scope.$apply(function () {
                                model.otpValueFb = "";
                                model.resendPMessage = "";
                                model.changepwd_submitted = false;
                            });

                        }
                    });
                }
            };

            model.openPasswordModal = function () {
                model.disableSetPwdBtn = false;
                $.post('socialActPwd.do?method=sendActPwdSMS',
                        function (data) {
                            data = data.replace(/^\s+|\s+$/g, "");
                            console.log('data ' + data);
                            if (data.indexOf(":") !== -1) {
//                            var stVal = data.split(':')[0];
                                var emailVal = data.split(':')[1];
                                var mobileVal = data.split(':')[2];
                                if(!emailVal || emailVal.toLowerCase() === "null"){
                                    emailVal = "";
                                }
//                            alert(":::1" + stVal + ":2:::" + emailVal + ":3:::" + mobileVal);
                                $scope.$apply(function () {
                                    model.showSetPasswordModal = false;
                                    model.showConfirmPwdModal = true;
                                    model.userFbMailId = emailVal || "";
                                    model.userFbMobileVal = mobileVal || "";
                                });
                            } else {
                                dialog.cancel();
                            }
                        });
            };
        };
        return{
            restrict: 'E',
            scope: {
                userid: '='
            },
            templateUrl: "angular-partials/setPasswordTemplate.html",
            controller: setPasswordController,
            controllerAs: 'setPasswordCtrl',
            bindToController: true
        };
    };

    function spinner() {
        return{
            restrict: 'E',
            templateUrl: "angular-partials/spinner.html"
        };
    }


    var dialogTemplate = function () {
        return{
            restrict: 'E',
            template: '<div class="modal fade" role="dialog"><div class="modal-dialog" style="max-width:600px;"><div class="modal-content"><ng-transclude></ng-transclude></div></div></div>',
            transclude: true,
            scope: {
                clickOutsideToClose: '='
            },
            link: function (scope, element, attr) {
                $(element[0].firstElementChild).modal({
                    show: true,
                    backdrop: scope.clickOutsideToClose ? 'true' : 'static'
                });
            }
        };
    };

    var ace2threeAlert = function (dialog) {
        return{
            restrict: 'E',
            templateUrl: 'ace2three-alert.html',
            scope: {
                titleText: '@',
                text: '@',
                ok: '@',
                html: '@',
                template: '@',
                cross: '='
            },
            link: function (scope, element, attr) {
                scope.hide = function () {
                    dialog.close();
                };
            }
        };
    };

    var renderHtml = function ($compile) {
        return{
            restrict: 'E',
            scope: {
                html: '=',
            },
            link: function (scope, element, attr) {
                scope.html = '<span>' + scope.html + '</span>';
                angular.element(element).append($compile(scope.html)(scope));
            }
        };
    };


    var ace2threeConfirm = function (dialog) {
        return{
            restrict: 'E',
            templateUrl: 'ace2three-confirm.html',
            scope: {
                titleText: '@',
                text: '@',
                ok: '@',
                cancel: '@',
                html: '@',
                template: '@',
                cross: '='
            },
            link: function (scope, element, attr) {
                scope.confirm = function () {
                    dialog.close();
                };
            }
        };
    };

    var dialog = function ($q, $compile, $timeout, $rootScope, DataService, $http) {
        var Stack = (function () {
            function Stack() {
                this.items = [];
            }
            Stack.prototype.push = function (element) {
                this.items.push(element);
            };
            Stack.prototype.pop = function () {
                if (this.items.length === 0)
                    return undefined;
                return this.items.pop();
            };
            Stack.prototype.peek = function () {
                return this.items[this.items.length - 1];
            };
            Stack.prototype.isEmpty = function () {
                return this.items.length === 0;
            };
            return Stack;
        }());
        var stack = new Stack();
        return {
            open: function (model, config) {
                $rootScope.$emit('close-wrench-menu');
                if (!model) {
                    throw new Error('Please provide a model');
                }
                try {
                    var defer = $q.defer();
                    if (config && config.data) {
                        Object.keys(config.data).forEach(function (key) {
                            $rootScope[key] = config.data[key]
                        });
                    }
                    var ele = $compile(model)($rootScope);
                    angular.element(document.body).append(ele);
                    $timeout(function () {
                        defer.promise.finally(function () {
                            $(ele[0].firstElementChild).modal('hide');
                        });
                        $(ele[0].firstElementChild).on('hidden.bs.modal', function () {
                            angular.element(ele[0]).remove();
                            if (config && config.data) {
                                Object.keys(config.data).forEach(function (key) {
                                    delete $rootScope[key];
                                });
                            }
                            if (defer) {
                                defer.reject();
                            }
                        });
                    }, 100);
                    stack.push(defer);
                    return defer.promise;
                } catch (e) {
                    console.error(e);
                }
                return undefined;
            },
            delay: function (delay, open) {
                var prom = $q.defer();
                open.then(function (s) {
                    $timeout(function () {
                        prom.resolve(s);
                    }, delay || 0);
                }).catch(function (r) {
                    prom.reject(r);
                });
                return prom.promise;
            },
            close: function (data) {
                if (!stack.isEmpty()) {
                    stack.pop().resolve(data);
                }
            },
            cancel: function () {
                if (!stack.isEmpty()) {
                    stack.pop().reject();
                }
            },
            alert: function () {
                var config = {};
                return {
                    title: function (title) {
                        config.title = title;
                        return this;
                    },
                    text: function (text) {
                        config.text = text;
                        return this;
                    },
                    ok: function (ok) {
                        config.ok = ok;
                        return this;
                    },
                    html: function (html) {
                        config.html = html;
                        return this;
                    },
                    delay: function (delay) {
                        config.delay = delay;
                        return this;
                    },
                    template: function (template) {
                        config.template = template;
                        return this;
                    },
                    cross: function (cross) {
                        config.cross = cross;
                        return this;
                    },
                    clickOutsideToClose: function (clickOutsideToClose) {
                        config.clickOutsideToClose = clickOutsideToClose;
                        return this;
                    },
                    open: (function () {
                        var open = this.open('<dialog-template click-outside-to-close="' + config.clickOutsideToClose + '"><ace2three-alert cross="' + config.cross + '" title-text="' + (config.title || '') + '" text="' + (config.text || '') + '" ok="' + (config.ok || '') + '"  html="' + (config.html || '') + '" template="' + (config.template || '') + '"></ace2three-alert></dialog-template>');
                        if (config.delay) {
                            return this.delay(config.delay, open);
                        }
                        return open;
                    }).bind(this)
                };
            },
            confirm: function () {
                var config = {};
                return {
                    title: function (title) {
                        config.title = title;
                        return this;
                    },
                    text: function (text) {
                        config.text = text;
                        return this;
                    },
                    ok: function (ok) {
                        config.ok = ok;
                        return this;
                    },
                    cancel: function (cancel) {
                        config.cancel = cancel;
                        return this;
                    },
                    html: function (html) {
                        config.html = html;
                        return this;
                    },
                    template: function (template) {
                        config.template = template;
                        return this;
                    },
                    delay: function (delay) {
                        config.delay = delay;
                        return this;
                    },
                    cross: function (cross) {
                        config.cross = cross;
                        return this;
                    },
                    clickOutsideToClose: function (clickOutsideToClose) {
                        config.clickOutsideToClose = clickOutsideToClose;
                        return this;
                    },
                    open: (function () {
                        var open = this.open('<dialog-template click-outside-to-close="' + config.clickOutsideToClose + '"><ace2three-confirm cross="' + config.cross + '" title-text="' + (config.title || '') + '" text="' + (config.text || '') + '" ok="' + config.ok + '" cancel="' + config.cancel + '" html="' + (config.html || '') + '" template="' + config.template + '"></ace2three-confirm></dialog-template>');
                        if (config.delay) {
                            return this.delay(config.delay, open);
                        }
                        return open;
                    }).bind(this)
                };
            },
            security: function (source) {
                if (!source) {
                    throw new Error('Please provide source');
                }
                return {
                    open: (function () {
                        var thiz = this;
                        var promise = $q.defer();
                        DataService.getAccountData().then(function (accountData) {
                            if (accountData.accountSecurity) {
                                return promise.resolve();
                            }
                            $http.get('playerCommunication.do?method=accountSecurityOtp&requestSource=' + source).then(function (response) {
                                if (response.data.status === '100' && response.data.message === 'SKIP_SECURITY') {
                                    return promise.resolve();
                                } else if (response.data.status === '200') {
                                    thiz.open('<dialog-template><ace2three-security source="' + source + '" mobile-number="' + (response.data.mobileNumber || '') + '" email-id="' + (response.data.emailID || '') + '"></ace2three-security></<dialog-template>')
                                            .then(function (success) {
                                                accountData.accountSecurity = true;
                                                promise.resolve(success);
                                            })
                                            .catch(function (failed) {
                                                promise.reject(failed);
                                            });
                                } else {
                                    thiz.alert()
                                            .title('Ace2Three Security')
                                            .text('Please try again later')
                                            .ok('Ok')
                                            .open()
                                            .finally(function () {
                                                promise.reject();
                                            });
                                }
                            }).catch(function (response) {
                                var message = "";
                                if (response.status === 403) {
                                    message = response.data.message;
                                } else if (response.status === 419) {
                                    window.location.href = 'login.html';
                                } else {
                                    message = 'Please try again later';
                                }
                                thiz.alert()
                                        .title('Ace2Three Security')
                                        .text(message)
                                        .ok('Ok')
                                        .open()
                                        .finally(function () {
                                            promise.reject();
                                        });
                            });
                        });
                        return promise.promise;
                    }).bind(this)
                };
            },
            custom: function (model) {
                var config = {};
                return {
                    clickOutsideToClose: function (clickOutsideToClose) {
                        config.clickOutsideToClose = clickOutsideToClose;
                        return this;
                    },
                    data: function (data) {
                        config.data = data;
                        return this;
                    },
                    delay: function (delay) {
                        config.delay = delay;
                        return this;
                    },
                    open: (function () {
                        var open = this.open('<dialog-template click-outside-to-close="' + config.clickOutsideToClose + '">' + model + '</dialog-template>', config)
                        if (config.delay) {
                            return this.delay(config.delay, open);
                        }
                        return open;
                    }).bind(this)
                };
            }
        };

    };

    function clientredrections(clientUrls, browserServices, DataService, $rootScope, dialog) {

        function redirectToND() {
            var redirectUrl = (location.protocol === "https:") ? clientUrls["nd"]["www.a23.com"] : clientUrls["nd"][location.host];
            redirectUrl = redirectUrl || clientUrls["nd"]["qaweb.corp.hdworks.in"];
            var navigator = window.navigator.userAgent.toLowerCase();

            //immediately open an empty window on clicking play now...
            var childWindow = openWindow("");

            function openWindow(redirectUrl) {
                var h = screen.height - 126;
                if (/macintosh/.test(navigator)) {
                    h = screen.height - 90;
                } else if (/safari/.test(navigator) && /chrome/.test(navigator)) {
                    h = h - 100;
                }
                var windowInstance = window.open(redirectUrl, "Ace2Three", "width=" + (h * 1.47) + ", height=" + h + ", top = " + 0 + ",left =" + 189 + ",location=no,resizable=" + 1 + ",scrollbars=0,status=0");
                return windowInstance;
            }

            function redirect(sessionId, userId) {
                if (sessionId && userId) {
                    redirectUrl = redirectUrl + "#websession=" + sessionId + "&uid=" + userId;
                }
                if (childWindow.location.href === "about:blank") {
                    var windowInstance = openWindow(redirectUrl);
                    windowInstance.focus();
                }
            }

            DataService.getAccountData()
                    .then(function (response) {
                        redirect(response.sessionid, response.userid);
                    })
                    .catch(function () {
                        redirect();
                    });
        }

        function getFallbackUrls(type) { //html5 or App
            var host = location.host;
            var general_fallback = null;
            var browser_fallback = null;
            if ((location.href.indexOf("a23.com") >0 || location.href.indexOf("ace2three") > 0)) {
                host = "www.a23.com";
            }
            if (type === "html5") {
                general_fallback = clientUrls["html5_revamp"][host];
                browser_fallback = window.encodeURIComponent(general_fallback);
            } else {
                general_fallback = "mobileinstaller.html";
                browser_fallback = window.encodeURIComponent(location.origin + "/mobileinstaller.html");
            }
            return {
                generalFallback: general_fallback || clientUrls["game"]["qaweb.corp.hdworks.in"],
                browserFallback: browser_fallback
            };
        }

        function launchGame(sessionData, quickplay) {

            function redirect(url) {
                window.location.href = url;
            }

            //If it is an IOS device(mobile, tabs...) take to playstore.
            if (browserServices.isIOS()) {
                $rootScope.$emit('close-wrench-menu');
                dialog.alert()
                        .title('Incompatible')
                        .text("Please install our free mobile app for a complete game experience")
                        .ok('Open Store')
                        .open().then(function () {
                    redirect(clientUrls["stores"]["real"]["ios"]); // open play store.
                });
                return;
            }

            //THIS checks if it is Android Mobile and chrome both.
            if (browserServices.isCompatableBrowser() && browserServices.isChrome()) {
                var generalFallback = getFallbackUrls("html5").generalFallback; //This will return html5 url.

                if (!sessionData || !sessionData.userid) {// if no session, directly redirect to html5;
                    redirect(generalFallback);
                    return;

                } else if (sessionData.userType === "Regular" || sessionData.sudoType === "S"
                        || sessionData.aceLevel == "1" || quickplay) {//IF user is regulr/pseudo/bronze level/quickplay attribute is true, then redirect to html5;
                    generalFallback = generalFallback + "?userId:" + sessionData.userid + "&session:" + sessionData.sessionid;
                    if (sessionData.mobileMandatoryFlag === 'Y' && sessionData.mobileConfirmation === 'N'){
                        dialog.alert()
                                .title('A23 Security')
                                .text("For security reasons, please verify mobile number to continue playing.")
                                .clickOutsideToClose(false)
                                .cross(false)
                                .ok('OK')
                                .open().finally(function () {
                                    redirect("shortProfile.do");
                        });        
                        return;
                    }else{
                        redirect(generalFallback);
                        return;
                    }
                } else if (!sessionData.isShortProfileVerified) {
                    redirect("shortProfile.do");
                    return;
                }

                openApp(sessionData.sessionid, sessionData.userid); // If player is premium and ShortProfileVerifid then Open APP.
                return;

            } else {
                //For Other than Android Mobiles and chrome
                $rootScope.$emit('close-wrench-menu');
                dialog.alert()
                        .title('Incompatible')
                        .text("Your current browser is incompatible with our web platform. Please download our mobile app for a complete game experience")
                        .ok('Open App')
                        .open().then(function () {
                    sessionData = sessionData || {};
                    openApp(sessionData.sessionid, sessionData.userid);
                }).catch(console.log);
                return;
            }
        }

        function openApp(sessionId, userId) {

            var timeout = null;
            var isScreenActive = true;

            function redirect(url) {
                window.location.href = url;
            }

            var hiddenArray = ["hidden", "mozHidden", "msHidden", "webkitHidden"];
            var visibilityArray = ["visibilitychange", "mozvisibilitychange", "msvisibilitychange", "webkitvisibilitychange"];

            var hidden, visibilityChange;
            angular.forEach(hiddenArray, function (obj, index) {
                if (typeof document[obj] !== "undefined") { // Opera 12.10 and Firefox 18 and later support
                    hidden = obj;
                    visibilityChange = visibilityArray[index];
                    return;
                }
            });

            document.addEventListener(visibilityChange, function () {
                isScreenActive = !(document[hidden] || !window.document.hasFocus());
                !timeout && clearTimeout(timeout);
            });

            var addIFrame = function (scheme) {
                var iframes = document.querySelectorAll('iframe');
                for (var i = 0; i < iframes.length; i++) {
                    iframes[i].parentNode.removeChild(iframes[i]);
                }
                var iframe = document.createElement("iframe");
                iframe.id = "app_call_frame";
                iframe.style.border = "none";
                iframe.style.width = "1px";
                iframe.style.height = "1px";
                iframe.src = scheme; //iOS app schema url<br>
                document.body.appendChild(iframe);
                timeout = setTimeout(function () {
                    if (isScreenActive) {
                        var fallbacks = getFallbackUrls('App');
                        redirect(fallbacks.generalFallback);
                    }
                }, 1000);
            };

            var nativeSchemaUrl = "ace2threescheme://hostname/";//chrome intent
            if (sessionId && userId) {
                nativeSchemaUrl = "ace2threescheme://hostname/uid=" + userId + "/sid=" + sessionId;//  
            }

            var fallbacks = getFallbackUrls('html5'); //to set browser fall back urls if applaunch fails.
            if (browserServices.isChromeIntentCompatable()) {
                var fallbackUrl = fallbacks.browserFallback + "?userId:" + userId + "&session:" + sessionId;
                document.location = "intent://hostname/#Intent;scheme=" + nativeSchemaUrl + ";S.browser_fallback_url=" + fallbackUrl + ";end";
            } else {
                addIFrame(nativeSchemaUrl);
            }
        }

        return{
            redirectToND: redirectToND,
            launchGame: function (quickplay) {
                DataService.getAccountData()
                        .then(function (response) {
                            //IF src=mhtml_ff or session source is mhtml_ff then redirect to ff_lobby...
                            if (browserServices.isFanFight(browserServices.getQueryParams().src) ||
                                    browserServices.isFanFight(response.source)) {
                                browserServices.redirect_ff_lobby();
                            } else {
                                launchGame(response, quickplay);
                            }
                        })
                        .catch(function () {
                            launchGame(null, quickplay);
                        });
            },
            openApp: openApp
        };
    }

    function footerDir(browserServices, DataService) {
        return {
            templateUrl: 'common/html/commonAceFooter.html',
            link: function (scope, ele, attr) {

                //To show Scroll to Top button in all static pages.
                /\.html/.test(location.href) && browserServices.initScrollToTop();

                scope.showFooter = !browserServices.mobileAppView(); //This checks for src=mapp or src=mhtml_ff in URL.

                if (scope.showFooter) { //if src=mapp/mhtml_ff is not present then check based on channel.
                    DataService.getAccountData().then(function (response) {
                        if (!response) {
                            scope.showFooter = true;
                        }
                        scope.showFooter = !browserServices.mobileAppView(response.channel, response.source);
                    });
                }

                //TO show Floating PLAY NOW 
                if (attr.displayPlaynow !== 'N') {
                    var channel = browserServices.determineChannel();
                    var queryParams = browserServices.getQueryParams();
                    scope.showPlayNow = (channel === 'MWEB' && scope.showFooter) || browserServices.isFanFight(queryParams.src);
                }
            }
        };
    }

    function getcookie() {
        return function (cookieName) {
            if (!cookieName) {
                return null;
            }
            var cookies = document.cookie.split(";");
            var len = cookies ? cookies.length : 0
            for (var i = 0; i < len; i++) {
                var cookie = cookies[i] && cookies[i].trim();
                var cookiePair = cookie.split("=");
                if (cookiePair[0].trim() == cookieName.trim()) {
                    return cookiePair[1];
                }
            }
            return null;
        };
    }

    function appLinkBox($http, DataService) {
        return {
            restrict: "E",
            scope: {
                result: "=?"
            },
            template: '<div class="mobile_enter_tb"> <div class="number_text" id="basic-addon1"> <div class="bg_plusnumber">+91</div></div> <div class="mobile_enter_text"> <input type="text" placeholder="Enter Mobile Number" maxlength="10" name="phone" ng-model="phoneNo" ng-change="resetVars()" /> </div><div class="mblverifybtn" ><a class="btn btn-blue get_applink" for="phone" ng-click="sendAppLink()">Get App Link</a></div> </div>',
            link: function (scope) {
                var phoneRegEx = /[4-9]{1}[0-9]{9}/;
                scope.phoneNo = null;
                if (!scope.result)
                    scope.result = {};
                var token = null;

                scope.sendAppLink = function () {
                    if (!phoneRegEx.test(scope.phoneNo)) {
                        console.error("Invalid mobile number");
                        scope.result.success = false;
                        scope.result.errorMsg = scope.phoneNo ? "Please provide valid mobile number" : "Please enter mobile number";
                        return;
                    }

                    DataService.getSecurityToken().then(function (token) {
                        return $http({
                            method: 'POST',
                            url: 'smsSender.do',
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                            transformRequest: function (obj) {
                                var str = [];
                                for (var p in obj)
                                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                                return str.join("&");
                            },
                            data: {channelFor: "APK", mobileNo: scope.phoneNo, token: token}
                        })
                    })
                            .then(function (res) {
                                var status = res.data && res.data.replace(/^\s+|\s+$/g, "");
                                if (!status || status.toUpperCase() !== "SUCCESS") {
                                    throw new Error(res.data);
                                }
                                scope.result.success = true;
                                scope.result.errorMsg = null;
                            }).catch(function (err) {
                        console.error(err);
                        scope.result.success = false;
                        scope.result.errorMsg = err.message;
                    });
                }

                scope.resetVars = function () {
                    scope.result = {success: null, errorMsg: null};
                    scope.phoneNo = scope.phoneNo && scope.phoneNo.replace(/\D/g, "");
                }
            }
        }
    }

    function dataService($http, $q, getcookie) {
        var ACCOUNT_DATA = null;
        var deferred = $q.defer();
        var isAccountDataCalled = false;

        function getQueryString(obj) {
            if (typeof obj === "object") {
                var arr = [];
                for (var p in obj) {
                    if (obj.hasOwnProperty(p)) {
                        arr.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    }
                }
                return arr.join("&");
            }
            return null;
        }

        return {
            setAccountData: function (data) {
                ACCOUNT_DATA = data;
                isAccountDataCalled = true;
                deferred.resolve(ACCOUNT_DATA);
            },
            resetPromise: function () {
                isAccountDataCalled = false;
                deferred = $q.defer();
            },
            getAccountData: function (queryObj) {

                if (!getcookie("CHKUSR")) {
                    deferred.resolve(null, "Cookie check got failed");
                    return deferred.promise;
                }

                var thiz = this;
                if (isAccountDataCalled) {
                    return deferred.promise;
                }
                isAccountDataCalled = true;
                var url = "mobileServices.do?service=myAccountDetails";
                var queryStr = getQueryString(queryObj);
                if (queryStr)
                    url = url + "&" + queryStr;
                $http
                        .get(url)
                        .then(function (res) {
                            var data = res.data;
                            if (!data || !data.status) {
                                throw new Error("Unexpected data type");
                            }
                            thiz.setAccountData(data);
                        })
                        .catch(function (err) {
                            console.error(err);
                            deferred.resolve(null, err);
                        })
                return deferred.promise;
            },
            getSecurityToken: function () {
                var promiseDeferred = $q.defer();
                $http.post("loginToken.do", {})
                        .then(function (res) {
                            return promiseDeferred.resolve(res.data);
                        })
                        .catch(function (err) {
                            return promiseDeferred.reject(err);
                        });
                return promiseDeferred.promise;
            },
            updateSession : function(type){
                var promiseDeferred = $q.defer();
                $http.post("mobileServices.do?service=updateSessionValues&type=" + type, {})
                        .then(function (res) {
                            return promiseDeferred.resolve(res.data);
                        })
                        .catch(function (err) {
                            return promiseDeferred.reject(err);
                        });
                return promiseDeferred.promise;
            }
        }
    }

    function headerDir(DataService, getcookie, browserServices) {

        return {
            restrict: "E",
            templateUrl: "angular-partials/header.html",
            scope: {
                pageTitle: "@",
                breadcumb: "@",
                appHeader: "@", //to show balck header when opened in APP.(Y),
                activeCard: '@',
                patterajIcon: '@',
               // platformapp:'@'
            },
            link: function (scope, element, attr) {
                
                //app header(Y/N recived from scope is stored in temp variable to stop header flickering in website, so by default it is set to N)
                var showAppHeader = scope.appHeader;
                var queryParams = browserServices.getQueryParams();


                scope.ffhtml = function () {
                    browserServices.redirect_ff_lobby();
                };
                
                  scope.backToPfLobby = function () { 
                     let data = JSON.stringify({type:"closeClient"});
                     console.log(data);
                    let userAgent = window.navigator.userAgent.toLocaleLowerCase(); 
                      if (userAgent.indexOf("android") === -1) {
                        if(window.webkit!==undefined){
                        window.webkit.messageHandlers.RedirectTo.postMessage(data);
                        }
                      } else {
                        if (userAgent.toString().includes("wv")) {
                          if (window.android !== undefined) {
                            window.android.redirectTo(data);
                          }
                        }
                      } 
                }
                

                scope.gotohome = function () {
                    if (scope.playerLoggedIn) {
                        if (window.location.href.indexOf("MyAccount.do") == -1)
                            window.location.href = "MyAccount.do";
                        return;
                    }
                    window.location.href = "/"
                }

                scope.openWrenchMenu = function () {
                    console.log("opening leftmenu")
                    scope.$root.$emit("open-wrench-menu")
                }

                function initAccountProperties(data) {
                    scope.accountData = data;
                    var referAndEarn = JSON.parse(data.referAndEarn);
                    scope.accountData.claimableAmount = parseInt(data.psuedoEligibleAmount) + parseInt(referAndEarn.voucherAmount);
                    scope.accountData.aceLevelImg = !isNaN(+data.aceLevel) && ('mimages/mstar' + data.aceLevel + '.png');
                    scope.accountData.redeemableBalance = convertTo2Decimals(scope.accountData.redeemableChips);
                    scope.accountData.realChips = convertTo2Decimals(scope.accountData.realChips);
                    scope.accountData.successfulRegistration = getcookie("successfulRegistration");
                    // scope.accountData.channel = data.channel;//WEB, MWEB, MAPP
                    // scope.accountData.source = data.source;//IPS, APS, mhtml, HPS
                    // scope.accountData.avatar = data.avatar;
                }

                function convertTo2Decimals(val) {
                    var convertedValue = parseFloat(val);
                    if (convertedValue > 0) {
                        convertedValue = parseFloat(val).toFixed(2);
                    }
                    return convertedValue;
                }

                function expireCookie(cname) {
                    document.cookie = cname + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                }
                
                scope.initialiseHeader = function(){
                    // To directly hide header when we recive src=mapp or src=mhtml_ff in url
                    if (browserServices.mobileAppView()) {
                        scope.showHeader = false;//hides web header
                        scope.appHeader = queryParams.header || 'Y';//to show app header or not.
                        scope.enableback = queryParams.enableback;
                        browserServices.hideContentsinApp(scope.appHeader);
                        scope.fromFanFight = browserServices.isFanFight(queryParams.src);
                        scope.platformapp= browserServices.isPlatformApp(queryParams.platformapp !==undefined && queryParams.platformapp==='Y'? 'PLATFORMAPP':'NA');
                        return;
                    }

                    // get account data
                    DataService.getAccountData()
                            .then(function (data) {
                                if (data && +data.status === 100) {
                                    initAccountProperties(data);
                                    scope.showHeader = !browserServices.mobileAppView(scope.accountData.channel, scope.accountData.source);
                                    scope.fromFanFight = browserServices.isFanFight(data.source);
                                    if (!scope.showHeader) {
                                        scope.appHeader = showAppHeader;
                                        if(scope.appHeader === 'N' && scope.fromFanFight){ //if app header is N and source is fanfight, then show appheader...
                                            scope.appHeader = "Y";
                                        }
                                        scope.enableback = queryParams.enableback;
                                        browserServices.hideContentsinApp(scope.appHeader);
                                    }
                                    scope.playerLoggedIn = true;
                                    return;
                                }
                                // For any other unforeseen error show prelogin header
                                scope.showHeader = true;
                                scope.playerLoggedIn = false;
                                return;
                            });
                };
                scope.initialiseHeader();
            }
        };
    }

    function wrenchMenu(DataService, LeftMenuJSON, browserServices, dialog, passwordService, $timeout) {
        var argArr = arguments;
        return {
            restrict: "E",
            replace: true,
            scope: {
                activePage: "@page" // page name from leftmenu to show active
            },
            templateUrl: 'angular-partials/leftmenu.template.html',
            controller: ['$scope', '$rootScope', function ($scope, $rootScope) {
                    $scope.isWrenchMenuHidden = true;
                    $scope.openMenu = null;
                    $scope.menuItems = [];
                    $scope.isLoggedIn = false;
                    $scope.aceLevelImg = null;
                    $scope.avatar = null;
                    $scope.userid = null;
                    $scope.acepointsPromo = false;
                    var isSourceMApp = browserServices.mobileAppView();

                    //If we dont receive src=mapp or src=mhtml_ff in url then need to call data services.($scope.menuItems will be fasle)
                    if (!isSourceMApp) {
                        $scope.showMenu = true;
                        DataService.getAccountData().then(responseHandler);
                    }

                    $scope.currentActiveItem = null;
                    $scope.currentActiveItemMenu = null;

                    var ACCOUNT_DATA = null;
                    var userType = null;
                    function responseHandler(accountData) {
                        $scope.isLoggedIn = !!accountData && +accountData.status === 100;
                        if ($scope.isLoggedIn) {
                            $scope.gvFlag = accountData.gvflag; //if flag is N green dot will be shown in rewards
                            $scope.aceLevelImg = !isNaN(+accountData.aceLevel) && ('mimages/mstar' + accountData.aceLevel + '.png');
                            userType = getUserType(accountData.userType, accountData.sudoType);
                            $scope.avatar = accountData.avatar || 'mimages/deafult_pp.png';
                            $scope.userid = accountData.userid;
                            $scope.acepointsPromo = accountData.acepointsPromo;
                            $scope.realChips = parseFloat(accountData.realChips) && parseFloat(accountData.realChips).toFixed(2);

                            //Deciding showmenu in case of post login pages based on channel and source.
                            $scope.showContents = $scope.showMenu = !browserServices.mobileAppView(accountData.channel, accountData.source);
                            ACCOUNT_DATA = accountData;
                        }
                        $scope.menuItems = filterItemsAndSubitems(LeftMenuJSON);

                        //IN case of prelogin by default menu should be shown
                        if (!$scope.isLoggedIn) {
                            $scope.showMenu = true;
                            $scope.showContents = true; //this field is added to stop flickering while page load.
                        }
                        checkPageloadValidations();
                        // try {$scope.$digest();} catch (err) {console.log(err)};
                    }

                    $scope.bandIcon = function (item) {
                        if ((item.name === "AcePoints") && !$scope.acepointsPromo) {
                            return '';
                        }
                        if(item.name == "Rewards" && $scope.gvFlag === 'Y'){
                            return '';
                        }
                        return item.bandicon;
                    };

                    function getUserType(usertype, sudotype) {
                        if (usertype.toUpperCase() === "PREMIUM") {
                            if (sudotype != "S")
                                return "PREMIUM";
                            return "SUDO";
                        }
                        return "REGULAR"
                    }

                    function hasSubmenu(item) {
                        return item.submenu && item.submenu.length;
                    }

                    function loginRequiredCheck(loginRequired, isLoggedIn) {
                        // Will accept this item if loginRequired is null or undefined thus boolean check
                        return typeof loginRequired !== "boolean" || loginRequired === isLoggedIn;
                    }

                    function userTypeCheck(userTypes, userType) {
                        // if empty usertypes that means it is shown for all
                        return !userTypes.length || userTypes.includes(userType);
                    }

                    function userSpecificPropertyCheck(userSpecificProperty) {
                        return !userSpecificProperty || ACCOUNT_DATA[userSpecificProperty] == "Y";
                    }

                    function filterItemsAndSubitems(items) {
                        var filteredItems = [];
                        items.forEach(function (item) {
                            if (loginRequiredCheck(item.loginRequired, $scope.isLoggedIn)
                                    && userTypeCheck(item.userTypes, userType)
                                    && userSpecificPropertyCheck(item.userSpecificProperty)) {

                                var tempObj = item;
                                if (!hasSubmenu(item) && isActivePage(item)) { // Active menu check if no submenu
                                    $scope.currentActiveItemMenu = item;
                                }

                                tempObj.submenu = item.submenu.filter(function (subitem) {
                                    if (loginRequiredCheck(subitem.loginRequired, $scope.isLoggedIn)
                                            && userTypeCheck(subitem.userTypes, userType)
                                            && userSpecificPropertyCheck(subitem.userSpecificProperty)) {
                                        if (isActivePage(subitem)) { // Active menu and submenu and open menu
                                            $scope.currentActiveItem = subitem;
                                            $scope.currentActiveItemMenu = item;
                                            $scope.openMenu = item.name === "My Account" ? null : item.name;
                                        }
                                        return true;
                                    }
                                });
                                filteredItems.push(tempObj);
                            }
                        });
                        return filteredItems;
                    }

                    function isActivePage(item) {
                        return $scope.activePage && $scope.activePage.toUpperCase() === item.name.toUpperCase();
                    }

                    $scope.closeWrenchMenu = function () {
                        $scope.isWrenchMenuHidden = true;
                    }

                    $scope.hasSubmenu = hasSubmenu;

                    $scope.isActivePage = function (item) {
                        if (isActivePage(item))
                            return true;
                        if (hasSubmenu(item)) { // If any child is active
                            for (var i = 0; i < item.submenu.length; i++) {
                                if (isActivePage(item.submenu[i]))
                                    return true;
                            }
                        }
                        return false;
                    }

                    $scope.menuClick = function (item) {
                        if (hasSubmenu(item)) {
                            $scope.openMenu = $scope.openMenu === item.name ? null : item.name;
                        }
                        if (!item.validations) {
                            return typeof item.onclick === "function" && item.onclick.apply($scope, argArr);
                        }
                        browserServices.validations(item.validations).then(function () {
                            return typeof item.onclick === "function" && item.onclick.apply($scope, argArr);
                        }).catch(console.error);

                    };

                    $rootScope.$on('open-wrench-menu', function () {
                        console.log("call 296");
                        $scope.isWrenchMenuHidden = false;
                    });

                    $rootScope.$on('close-wrench-menu', function () {
                        $scope.isWrenchMenuHidden = true;
                    });

                    //TO recheck tab access validations if url is loaded directly.
                    function checkPageloadValidations() {
                        if ($scope.currentActiveItem && $scope.currentActiveItem.validations
                                && !browserServices.mobileAppView(ACCOUNT_DATA.channel, ACCOUNT_DATA.source)) {

                            //In case of profile..on direct page load we skip Validations...
                            if ($scope.currentActiveItem.name && ($scope.currentActiveItem.name.toUpperCase() === "PROFILE")) {
                                return true;
                            }

                            browserServices.validations($scope.currentActiveItem.validations).then(function () {
                                return true;
                            }).catch(function () {
                                window.location.href = "MyAccount.do";
                            });
                        }
                    }                   
                }]
        }
    }

    function leftmenuJson() {

        //validations : [] this is used to check tab access validations.
        //if validations array is non empty then "item" key should be null and redirection should be handled in "onclick"

        return [
            {
                "name": "My Account",
                "loginRequired": true, // true, false, null
                "userTypes": [],
//                "class":[myaccount_icon],
                "link": null,
                "iconclass": "icon_myaccount",
                "bandicon": "icon_band_myaccount",
                "onclick": null, // This is binded with the scope of directive and having the same argument as wrenchMenu directive function
                "userSpecificProperty": null,
                "submenu": [
                    {
                        "name": "Account Details",
                        "iconclass": "icon_act_details",
                        "loginRequired": true,
                        "userTypes": [],
                        "link": "MyAccount.do",
                        "onclick": null,
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "Change Password",
                        "iconclass": "icon_changepassword",
                        "loginRequired": true,
                        "userTypes": [],
                        "validations": ['SET_PASSWROD'],
                        "link": null,
                        "onclick": function (DataService, LeftMenuJSON, browserServices) {
                            window.location.href = "changePassword.do"
                        },
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "Add Cash",
                        "iconclass": "icon_addcash",
                        "loginRequired": true,
                        "userTypes": [],
                        "validations": ['SELFEXCLUSION', 'TIMEOUT'], //TIMEOUT id only for Addcash tab, for remainig tabs use RG_TIMEOUT
                        "link": null,
                        "onclick": function (DataService, LeftMenuJSON, browserServices) {
                            browserServices.httpGet('clevertap.do', {"eventName": "AddCashClick", "clickLocation": "Add Cash Option_Menu"});
                            window.location.href = "mobileBankSelection.do?method=preselectAmount&rtime=" + (new Date().getTime() / 1000);
                        },
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "KYC",
                        "iconclass": "icon_kyc",
                        "loginRequired": true,
                        "userTypes": [],
                        "validations": ['PASSWORD', 'RG_TIMEOUT'],
                        "link": null,
                        "onclick": function () {
                            window.location.href = "kycDetails.do";
                        },
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "Redeem Options",
                        "iconclass": "icon_redeem_options",
                        "loginRequired": true,
                        "userTypes": [],
                        "validations": ['SELFEXCLUSION', 'PASSWORD', 'RG_TIMEOUT'],
                        "link": null,
                        "onclick": function () {
                            window.location.href = "kycBankAccountDetailsAction.do?method=bankPanDefaultView";
                        },
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "Profile",
                        "iconclass": "icon_profile",
                        "loginRequired": true,
                        "userTypes": [],
                        "validations": ['RG_TIMEOUT', 'PASSWORD'],
                        "link": null,
                        "onclick": function () {
                            window.location.href = "shortProfile.do";
                        },
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "Add-Cash Limits",
                        "iconclass": "icon_addcash_limits",
                        "loginRequired": true,
                        "userTypes": ["PREMIUM"],
                        "validations": ['SELFEXCLUSION', 'PASSWORD', 'RG_TIMEOUT'],
                        "link": null,
                        "onclick": function () {
                            window.location.href = "PurchaseLimitHandler.do";
                        },
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "Redeem",
                        "iconclass": "icon_redeem",
                        "loginRequired": true,
                        "userTypes": ["PREMIUM"],
                        "validations": ['PASSWORD'],
                        "link": null,
                        "onclick": function () {
                            window.location.href = "WithdrawChips.do";
                        },
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "AcePoints",
                        "iconclass": "icon_acepoints",
                        "loginRequired": true,
                        "userTypes": ["PREMIUM"],
                        "link": null,
                        "validations": ['PASSWORD', 'SELFEXCLUSION', 'RG_TIMEOUT'],
                        "bandicon": "icon_band_loyaltypragram", //"icon_eneble_bonus",
                        "onclick": function () {
                            window.location.href = "acepoints.do";
                        },
                        "userSpecificProperty": null,
                    },

                    {
                        "name": "Bonus Summary",
                        "iconclass": "icon_bonussummary",
                        "loginRequired": true,
                        "userTypes": ["PREMIUM"],
                        "link": "bonusSummary.do",
                        "onclick": null,
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "Payment History",
                        "iconclass": "icon_payemnts_history",
                        "loginRequired": true,
                        "userTypes": ["PREMIUM"],
                        "link": "accountHistoryDts.do?type=PurchaseSuccess",
                        "onclick": null,
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "Transaction History",
                        "iconclass": "icon_trans_history",
                        "loginRequired": true,
                        "userTypes": [],
                        "link": "accountSummary.do",
                        "onclick": null,
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "Preferences",
                        "iconclass": "icon_language_preferences",
                        "loginRequired": true,
                        "userTypes": [],
                        "link": "languageOptions.do?method=playerLanguageOptions",
                        "onclick": null,
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "Get TDS certificate",
                        "iconclass": "icon_tds_certicate",
                        "loginRequired": true,
                        "userTypes": ["PREMIUM"],
                        "link": "tds.do",
                        "onclick": null,
                        "userSpecificProperty": "tdsEligible",
                    }
                ]
            },
            {
                "name": "Get Mobile App",
                "loginRequired": null,
                "userTypes": [],
                "link": "downloads.html",
                "iconclass": "icon_getmobileapp",
                "bandicon": "icon_band_getmobileapp",
                "onclick": null, // This is binded with the scope of directive and having the same argument as wrenchMenu directive function
                "userSpecificProperty": null,
                "submenu": []
            },
            {
                "name": "Refer & Earn",
                "loginRequired": true,
                "userTypes": [],
                "link": "referAndEarn.do?method=display&rtime=" + parseInt(new Date().getTime() / 100),
                "iconclass": "icon_referandearn",
                "bandicon": "icon_band_referandearn",
                "onclick": null, // This is binded with the scope of directive and having the same argument as wrenchMenu directive function
                "userSpecificProperty": null,
                "submenu": []
            },
            {
                "name": "Refer & Earn",
                "loginRequired": false,
                "userTypes": [],
                "link": "referAndEarn.html",
                "iconclass": "icon_referandearn",
                "bandicon": "icon_band_referandearn",
                "onclick": null, // This is binded with the scope of directive and having the same argument as wrenchMenu directive function
                "userSpecificProperty": null,
                "submenu": []
            },
            {
                "name": "Offers & Promotions",
                "loginRequired": null,
                "userTypes": [],
                "link": null,
                "iconclass": "icon_offersandpromotions",
                "bandicon": "icon_band_offersandpromotions",
                "onclick": null, // This is binded with the scope of directive and having the same argument as wrenchMenu directive function
                "userSpecificProperty": null,
                "submenu": [
                    {
                        "name": "Bonus Offers",
                        "iconclass": "icon_bonusoffers",
                        "loginRequired": null,
                        "userTypes": [],
                        "link": "rummybonus.html",
                        "onclick": null,
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "Tourney Info",
                        "iconclass": "icon_tourneyinfo",
                        "loginRequired": null,
                        "userTypes": [],
                        "link": "tourneyInfo.html",
                        "onclick": null,
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "VIP Corner",
                        "iconclass": "icon_vipconer",
                        "loginRequired": null,
                        "userTypes": [],
                        "link": null,
                        "onclick": function () {
                            window.open("https://www.a23.com/rummynews/cms/vip-corner/", '_blank');
                        },
                        "userSpecificProperty": null,
                    }
                ]
            },
            {
                "name": "Loyalty Program",
                "loginRequired": null,
                "userTypes": [],
                "link": "acepoints.html",
                "iconclass": "icon_loyaltypragram",
                "bandicon": "",
                "onclick": null, // This is binded with the scope of directive and having the same argument as wrenchMenu directive function
                "userSpecificProperty": null,
                "submenu": []
            },
            {
                "name": "VIP",
                "loginRequired": null,
                "userTypes": [],
                "link": "vipclub.html",
                "iconclass": "icon_vip",
                "bandicon": "icon_band_vip",
                "onclick": null, // This is binded with the scope of directive and having the same argument as wrenchMenu directive function
                "userSpecificProperty": null,
                "submenu": []
            },
            {
                "name": "How To Play",
                "loginRequired": null,
                "userTypes": [],
                "link": null,
                "iconclass": "icon_howtoplay",
                "bandicon": "icon_band_howtoplay",
                "onclick": null, // This is binded with the scope of directive and having the same argument as wrenchMenu directive function
                "userSpecificProperty": null,
                "submenu": [
                    {
                        "name": "Rummy Rules",
                        "iconclass": "icon_rummyrules",
                        "loginRequired": null,
                        "userTypes": [],
                        "link": "rules.html",
                        "onclick": null,
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "Rummy Variants",
                        "iconclass": "icon_rummyvariants",
                        "loginRequired": null,
                        "userTypes": [],
                        "link": "rummyvariants.html",
                        "onclick": null,
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "About Rummy",
                        "iconclass": "icon_aboutrummy",
                        "loginRequired": null,
                        "userTypes": [],
                        "link": "aboutrummy.html",
                        "onclick": null,
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "Lobby and Table",
                        "iconclass": "icon_lobbyandtable",
                        "loginRequired": null,
                        "userTypes": [],
                        "link": "lobbyandtable.html",
                        "onclick": null,
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "Play Responsibly",
                        "iconclass": "icon_playresposibly",
                        "loginRequired": null,
                        "userTypes": [],
                        "link": "responsiblegaming.html",
                        "onclick": null,
                        "userSpecificProperty": null,
                    }
                ]
            },
            {
                "name": "My Rewards",
                "loginRequired": true,
                "userTypes": [],
                "link": null,
                "iconclass": "icon_rewards",
                "validations": ['SELFEXCLUSION'],
                "bandicon": "icon_band_rewards",
                "onclick": null, // This is binded with the scope of directive and having the same argument as wrenchMenu directive function
                "userSpecificProperty": null,
                "submenu": [
                    {
                        "name": "Rewards",
                        "iconclass": "icon_giftvouchers",
                        "loginRequired": true,
                        "userTypes": [],
                        "validations": ['RG_TIMEOUT'],
                        "link": null,
                        "bandicon": "activity_gv_icon",
                        "onclick": function () {
                            window.location.href = "giftVoucher.do";
                        },
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "Achievements",
                        "iconclass": "icon_achivments",
                        "loginRequired": true,
                        "userTypes": [],
                        "validations": ['SELFEXCLUSION'],
                        "link": null,
                        "onclick": function () {
                            window.location.href = "achivementService.do";
                        },
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "Leaderboard",
                        "iconclass": "icon_skill_lb",
                        "loginRequired": true,
                        "userTypes": [],
                        "link": "skillPointsLeaderboard.do",
                        "onclick": null,
                        "userSpecificProperty": null,
                    }
                ]
            },
            {
                "name": "My Rewards",
                "loginRequired": false,
                "userTypes": [],
                "link": null,
                "iconclass": "icon_rewards",
                "bandicon": "icon_band_rewards",
                "onclick": null, // This is binded with the scope of directive and having the same argument as wrenchMenu directive function
                "userSpecificProperty": null,
                "submenu": [
                    {
                        "name": "Rewards",
                        "iconclass": "icon_giftvouchers",
                        "loginRequired": false,
                        "userTypes": [],
                        "link": "gift.html",
                        "onclick": null,
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "Achievements",
                        "iconclass": "icon_achivments",
                        "loginRequired": false,
                        "userTypes": [],
                        "link": "rummy_achievements.html",
                        "onclick": null,
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "Leaderboard",
                        "iconclass": "icon_skill_lb",
                        "loginRequired": false,
                        "userTypes": [],
                        "link": "skillpointsleaderboard.html",
                        "onclick": null,
                        "userSpecificProperty": null,
                    }
                ]
            },
            {
                "name": "Contact Us",
                "loginRequired": null,
                "userTypes": [],
                "link": null,
                "iconclass": "icon_contactus",
                "bandicon": "icon_band_contactus",
                "onclick": function () {
                    window.location.href = this.isLoggedIn ? 'Support.do' : 'precontactus.html';
                }, // This is binded with the scope of directive and having the same argument as wrenchMenu directive function
                "userSpecificProperty": null,
                "submenu": []
            },
            {
                "name": "Testimonials",
                "loginRequired": null,
                "userTypes": [],
                "link": "a23-rummy-champions.html",
                "iconclass": "icon_testimonials",
                "bandicon": "icon_band_testimonials",
                "onclick": null, // This is binded with the scope of directive and having the same argument as wrenchMenu directive function
                "userSpecificProperty": null,
                "submenu": []
            },
            {
                "name": "Media",
                "loginRequired": null,
                "userTypes": [],
                "link": null,
                "iconclass": "icon_media",
                "bandicon": "icon_band_media",
                "onclick": null, // This is binded with the scope of directive and having the same argument as wrenchMenu directive function
                "userSpecificProperty": null,
                "submenu": [
                    {
                        "name": "Blog",
                        "iconclass": "icon_blog",
                        "loginRequired": null,
                        "userTypes": [],
                        "link": null,
                        "onclick": function () {
                            window.open("rummynews/cms/blog?rtime=" + parseInt(new Date().getTime() / 100), '_blank');
                        }
                    },
                    {
                        "name": "What's New",
                        "iconclass": "icon_whatsnew",
                        "loginRequired": null,
                        "userTypes": [],
                        "link": "newFeatures.html",
                        "onclick": null,
                        "userSpecificProperty": null,
                    },
                    {
                        "name": "Press Releases",
                        "iconclass": "icon_pressreleases",
                        "loginRequired": null,
                        "userTypes": [],
                        "link": "pressreleases.html",
                        "onclick": null,
                        "userSpecificProperty": null,
                    }
                ]
            },
            {
                "name": "Logout",
                "loginRequired": true,
                "userTypes": [],
                "link": "mobileLogout.do",
                "iconclass": "icon_logout",
                "bandicon": "icon_band_lagout",
                "onclick": null, // This is binded with the scope of directive and having the same argument as wrenchMenu directive function
                "userSpecificProperty": null,
                "submenu": []
            }
        ];
    }
    ;

    function browserServices($rootScope, $compile, $q, $timeout, $http, DataService, dialog, passwordService, $window) {

        var platform = navigator.platform;
        var ua = navigator.userAgent;
        var vendor = navigator.vendor;

        function iosPlatform() {
            return /(iPad|iPhone|iPod|iMac)/.test(platform);
        }

        function isAndroidNative() {
            return /Mozilla\/5\.0/.test(ua) && /Android/.test(ua) && /AppleWebKit/.test(ua) && /Version/.test(ua);
        }

        function isChrome() {
            return /Chrome/.test(ua) && /Google Inc/.test(vendor);
        }

        function isSafari() {
            return /Safari/i.test(ua);
        }

        function getQueryParams() {
            const queryParams = {};
            var parts = window.location.search.substring(1).split('&');
            if (!parts) {
                return queryParams;
            }
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i].split('=');
                queryParams[part[0]] = part[1];
            }
            return queryParams;
        }

        function loadScript(scriptUrl) {
            const script = document.createElement('script');
            script.src = scriptUrl;
            document.body.appendChild(script);

            return new Promise((resolve, reject) => {
                script.onload = function () {
                    resolve();
                };
                script.onerror = function () {
                    reject();
                };
            });
        }
        
        function isSourceFanfight(source){
            if ((source && source.toUpperCase().trim().includes("MHTML_FF"))) {
                return true; //static pages.
            }
        };
        
        function isSourcePlatform(source){
           if ((source && source.toUpperCase().trim().includes("PLATFORMAPP"))) {
                return true; //static pages.
            }
        };

        return{
            isIOS: iosPlatform,

            isCompatableBrowser: function () {
                //added few checks for QA bug ACE-40608
                var isOpera = (typeof window.opr !== "undefined" || (ua.indexOf("Opera") > -1));
                var samsung = /(Samsung)/.test(ua);
                if (isChrome() && window.chrome && !isOpera && !/(Edge|EdgA)/.test(ua) && !isAndroidNative() && !samsung) {
                    return !(/Micromax A102/.test(ua));
                }
                return false;
            },

            determineChannel: function () {
                return (iosPlatform() || /(Android|Windows Phone)/.test(ua) || /BlackBerry/.test(platform)) ? 'MWEB' : 'WEB';
            },

            isChrome: function () {//used to open html5 this seperates tabs.(includes only mobiles).
                if (ua.match(/Mobi/i)) {
                    l = ua.match(/(chrome(?=\/))\/?\s*(\d+)/i) || [];
                    if (l.length !== 0 && l[1] === 'Chrome') {
                        return true;
                    }
                }
                return false;
            },

            isChromeIntentCompatable: function () {
                return isChrome() && !isAndroidNative();
            },
            
            isFanFight: function (source) {
                return isSourceFanfight(source);
            },
            isPlatformApp: function (source) {
                return isSourcePlatform(source);
            },

            mobileAppView: function (channel, source) {
                if(isSourceFanfight(source)){
                    return true; //Mobile APP View.(no header and footers....)
                }
                
                if (channel && source) {
                    return !(channel.toUpperCase() === "WEB" || channel.toUpperCase() === "MWEB" || source.toLowerCase() === "mhtml");    //post login                
                }
                var params = getQueryParams();
                var src = params.src;
                if ((src && src.toUpperCase().trim().includes("MAPP"))) {
                    return true; //static pages.
                }
                if (isSourceFanfight(src)) {
                    return true; //static pages.
                }
            },
            validations: function (validations) {
                var p = $q.defer();
                DataService.getAccountData().then(function (response) {
                    if (+response.timeoutDays > 0) {
                        //TIMEOUT and RG_TIMEOUT both are same but TIMEOUT is used for spefic to add cash tab only(bcz if has different msg).
                        if (validations.indexOf('TIMEOUT') > -1) {
                            dialog.alert()
                                    .title('Time Out')
                                    .text('TIME OUT- You cannot Add cash as you are currently on a Time-Out.You can resume playing cash games after ' + response.timeoutDays + ' days')
                                    .ok('OK')
                                    .open().finally(function () {
                                p.reject();
                            });
                            return;
                        }
                        if (validations.indexOf('RG_TIMEOUT') > -1) {
                            dialog.alert()
                                    .title('Time Out')
                                    .html('In line with our Responsible Gaming Policy, this action is restricted for ' + response.timeoutDays + ' days. <a href=\'faqs.html\'>Know More</a>')
                                    .ok('OK')
                                    .open().finally(function () {
                                p.reject();
                            });
                            return;
                        }
                    } else if (response.selfExclusionFlag === 'Y') {
                        if (validations.indexOf('SELFEXCLUSION') > -1) {
                            dialog.alert()
                                    .title('Self Exclusion')
                                    .text('This functionality is not available for you as you are under the self exclusion till ' + response.selfExcExpiryDate)
                                    .ok('OK')
                                    .open().finally(function () {
                                p.reject();
                            });
                        }
                    } else if (validations.indexOf('SET_PASSWROD') > -1) { //Only to display set password
                        return passwordService.setPassword().then(function () {
                            p.resolve();
                        }).catch(function () {
                            p.reject();
                        });
                    } else if (validations.indexOf('PASSWORD') > -1) {
                        return passwordService.confirmPassword().then(function () {
                            p.resolve();
                        }).catch(function () {
                            p.reject();
                        });
                    }
                    p.resolve();
                });
                return p.promise;
            },
            closeLeftMenu: function () {
                $rootScope.$emit('close-wrench-menu');
            },
            httpGet: function (url, data) {
                if (url) {
                    return $http.get(url, {
                        params: data
                    });
                }
            },
            hideContentsinApp: function (appHeader) {
                $("body").addClass("app_main_body");
                if (/header=N/.test(location.search) || 'N' === appHeader) { //If app header is not present in page.
                    $("#wrapper").addClass("margin-top-0");
                }
            },
            getQueryParams: getQueryParams,

            initScrollToTop: function () {
                $rootScope.scrolltoTop = function () {
                    $('html, body').animate({
                        scrollTop: 0
                    }, 500);
                };

                $window.onscroll = function () {
                    if ($(this).scrollTop() > 100) {
                        $('.static-back-to-top').fadeIn('slow');
                    } else {
                        $('.static-back-to-top').fadeOut('slow');
                    }
                };

                var ele = $compile('<a href="#" class="static-back-to-top" ng-click=scrolltoTop()><i class="static-bx static-bxs-up-arrow-alt"></i></a>')($rootScope);
                angular.element(document.body).append(ele);
            },

            processGoogleToken: function (token) {
                var config = {
                    headers: {
                        "content-type": "application/x-www-form-urlencoded",
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                };
                return $http.post("socialentryaction.do?method=getGoogleUser", $.param({token: token}), config);
            },

            initGoogleClickHandler: function (successcallback) {

                if (!window.gapi) {
                    loadScript("https://apis.google.com/js/api:client.js").then(function () {
                        goolgeauth2();
                    });
                } else {
                    goolgeauth2();
                }

                function goolgeauth2() {
                    gapi.load('auth2', function () {
                        var auth2 = gapi.auth2.init({
 //                           client_id: '916245597791-uiv3043j7hhraovmqk29mvkpkj39opvc.apps.googleusercontent.com'
                           client_id: '443121158920-vmv85vs91qkask07a4f4v9iuf97l30bi.apps.googleusercontent.com'
                        });
                        console.log($("#google-signin2")[0]);
                        console.log(typeof successcallback === "function");
                        auth2.attachClickHandler($("#google-signin2")[0], {},
                                function (googleUser) {
                                    typeof successcallback === "function" && successcallback(googleUser.getAuthResponse().id_token);
                                }, function (error) {
                            console.log(error);
                            window.location.reload();
                        });
                    });
                }
                ;
            },

            openfacebook: function (successfallback) {
                window.proceedToRetrieveFBData = function () {
                    typeof successfallback === "function" && successfallback();
                };
                var clientId = '1901353993476233';
                var redirectUrl = 'https%3A%2F%2Fwww.a23.com%2FsocialFBConnect.jsp';
                if (this.determineChannel() === "WEB") {
                    var h = 650;
                    var w = 980;
                    var wintop = (screen.height / 2) - (h / 2);
                    var left = (screen.width / 2) - (w / 2);
                    window.open('http://www.facebook.com/dialog/oauth?auth_type=reauthenticate&client_id=' + clientId + '&redirect_uri=' + redirectUrl + '&scope=email,user_gender,user_age_range', 'POPUPW', 'width=' + w + ', height=' + h + ', top=' + wintop + ', left=' + left + ',scrollbars=1');
                } else {
                    window.open('http://www.facebook.com/dialog/oauth?auth_type=reauthenticate&client_id=' + clientId + '&redirect_uri=' + redirectUrl + '&scope=email,user_gender,user_age_range', 'POPUPW', ',scrollbars=1');
                }
            },

            loadScript: loadScript,
            
            redirect_ff_lobby : function(){
                 location.href = "https://nd.a23.com/NoDownload/html5/revamp/latest";
            },
            setCookie : function(name,value,days) {
                var expires = "";
                if (days) {
                    var date = new Date();
                    date.setTime(date.getTime() + (days*24*60*60*1000));
                    expires = "; expires=" + date.toUTCString();
                }
                document.cookie = name + "=" + (value || "")  + expires + "; path=/";
            },
            getCookie : function(cname) {
                var name = cname + "=";
                var decodedCookie = decodeURIComponent(document.cookie);
                var ca = decodedCookie.split(';');
                for(var i = 0; i <ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) === ' ') {
                        c = c.substring(1);
                    }
                    if (c.indexOf(name) === 0) {
                        return c.substring(name.length, c.length);
                    }
                }
                return "";
            },
            expireCookie : function(cname) {
                document.cookie = cname + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
            }
        };
    }

    function ndHtml5App($http, clientredrections, browserServices, dialog) {
        return {
            restrict: "A",
            scope: {
                quickPlay: "@", // to launch APP to to open html5 directly.
                callback: "&"
            },
            link: function (scope, element, attr) {
                var channel = browserServices.determineChannel();
                if(channel === "WEB" && element[0].innerText !==null && element[0].innerText ==='Play Now'){
                     element[0].innerText = 'Download App';
                }
                element.on('click', function () {
                    scope.callback && scope.callback();

                    if (channel === "WEB") {
                         window.location.href = "downloads.html";
                    } else {
                        googleEvent('PlayNow', 'onClick', 'mweb');
                        clientredrections.launchGame(scope.quickPlay);
                    }
                });
            }
        };
    }
    ;

    function clientUrls() {
        return {
            nd: {//"host" : "redirectUrl".
                "qaweb.corp.hdworks.in": "http://qand.corp.hdworks.in/NoDownload/latest",
                "devweb.corp.hdworks.in": "http://devnd.corp.hdworks.in/NoDownload/latest/Lobby.html",
                "integrationweb.corp.hdworks.in": "http://integrationnd.corp.hdworks.in:8080/NoDownload/latest/Lobby.html",
                "blgwebtest.corp.hdworks.in": "http://blgqand.corp.hdworks.in/NoDownload/latest/Lobby.html",
                "hydtemp.webtest2.corp.hdworks.in": "http://hydtemp.qa2nd.corp.hdworks.in/NoDownload/latest/Lobby.html",
                "bngqaprodweb.corp.hdworks.in": "http://bngqaprodnd.corp.hdworks.in/NoDownload/latest/Lobby.html",
                "www.a23.com": "https://nd.a23.com/NoDownload/latest/Lobby.html"
            },
            stores: {
                fun: {
                    "ios": "https://itunes.apple.com/in/app/ace2three-rummy/id789603425?mt=8",
                    "android": "https://play.google.com/store/apps/details?id=air.com.ace2three.mobile&hl=en"
                },
                real: {
                    "ios": "https://itunes.apple.com/in/app/ace2three-rummy-plus/id1027731385?mt=8"
                }
            },
            html5_revamp: {
                "qaweb.corp.hdworks.in": "http://qand.corp.hdworks.in/html5/revamp/lobbygame",
                "devweb.corp.hdworks.in": "http://devnd.corp.hdworks.in/html5/revamp/lobbygame",
                "integrationweb.corp.hdworks.in": "http://integrationnd.corp.hdworks.in/html5/lobbygame/index.html",
                "blgwebtest.corp.hdworks.in": "http://blgqand.corp.hdworks.in/html5/revamp/lobbygame/",
                "hydtemp.webtest2.corp.hdworks.in": "http://hydtemp.qa2nd.corp.hdworks.in/html5/revamp/latest",
                "bngqaprodweb.corp.hdworks.in": "http://bngqaprodnd.corp.hdworks.in/NoDownload/html5/revamp/lobbygame/",
                "www.a23.com": "https://nd.a23.com/NoDownload/html5/revamp/latest",
                "qaweb.playerummy.com": "https://qaffint.playerummy.com/"

            }
        };
    }

    function clevertapClicks($http, browserServices) {
        return{
            restrict: "A",
            link: function (scope, ele, attr) {
                var addCashClick = attr['addCashClick'];
                var playNowClick = attr['playNowClick'];
                var channel = browserServices.determineChannel();
                var isMweb = (channel === 'MWEB');
                ele.on('click', function () {
                    var event = null;
                    if (addCashClick) {
                        event = {"eventName": "AddCashClick", "clickLocation": addCashClick};
                    }
                    if (playNowClick) {
                        var isAllowed = isMweb; //trigger play now only for MWEB, and only one case in WEB(left menu)
                        if (playNowClick === 'menu') {
                            playNowClick = isMweb ? 'mweb_menu' : 'desktop-menu';
                            isAllowed = true;
                        }
                        isAllowed && (event = {"eventName": "QUICKPLAY", "clickLocation": playNowClick, "session": "false"});
                    }
                    event && $http.get("clevertap.do", {
                        params: event
                    });
                });
            }
        };
    }
    ;

    var passwordService = function (dialog, $q, DataService) {
        var confirmPassword = function () {
            var promise = $q.defer();
//                   dialog.custom('<set-password-service></set-password-service>')
//                           .open()
//                           .then(function () {
//                               accountData.confirmPassword = true;
//                               promise.resolve();
//                           }).catch(function () {
//                       promise.reject();
//                   });
//                   return;
            DataService.resetPromise();
            DataService.getAccountData().then(function (accountData) {
                if (accountData.status === "SESSON_EXPIRED") {
                    window.location.href = "login.html";
                    return;
                }
                var passwordSet = accountData.passwordSet;
                var confirmPassword = accountData.confirmPassword;
                console.log(passwordSet, confirmPassword)
                if (confirmPassword) {
                    return promise.resolve();
                }
                if (!passwordSet) {
                    //IF password is Expired redirect to Change Password else ask for Confirm Password....
                    if(accountData.isPasswordExpired){
                        window.location.href = "changePassword.do";
                        return;
                    }
                    dialog.custom('<confirm-password-modal></confirm-password-modal>')
                            .open()
                            .then(function () {
                                accountData.confirmPassword = true;
                                promise.resolve();
                            }).catch(function () {
                        promise.reject();
                    });
                } else if (passwordSet) {
                    dialog.custom('<set-password-service></set-password-service>')
                            .open()
                            .then(function () {
                                accountData.confirmPassword = true;
                                promise.resolve();
                            }).catch(function () {
                        promise.reject();
                    });
                }
            });
            return promise.promise;
        };
        var setPassword = function () {
            var promise = $q.defer();
            DataService.getAccountData().then(function (accountData) {
                if (accountData.status === "SESSON_EXPIRED") {
                    window.location.href = "login.html";
                    return;
                }
                var passwordSet = accountData.passwordSet;
                if (passwordSet) {
                    dialog.custom('<set-password-service></set-password-service>')
                            .open()
                            .then(function () {
                                accountData.confirmPassword = true;
                                promise.resolve();
                            }).catch(function () {
                        promise.reject();
                    });
                } else {
                    promise.resolve();
                }
            });
            return promise.promise;
        };
        return {
            confirmPassword: confirmPassword,
            setPassword: setPassword
        };
    };

    var confirmPasswordModal = function ($http, dialog, $timeout) {
        return {
            templateUrl: 'angular-partials/angular-templates/model/confirm-password.model.html',
            restrict: 'E',
            scope: {
            },
            link: function (scope, element, attrs) {
                scope.confirmPassword = '';
                scope.invalidPassword = false;
                $timeout(function () {
                    $("#mredpw").focus();
                }, 350);
                scope.validatePassword = function (form) {
                    if (form.password.$valid) {
                        scope.invalidPassword = false;
                        form.$setPristine(true);
                        $http.get("ValidatePassword.servlet", {
                            params: {
                                pwd: form.password.$viewValue
                            }
                        }).then(function (response) {
                            var data = response.data || "";
                            data = data.replace(/^\s+|\s+$/g, "");
                            if (data === 'valid') {
                                dialog.close();
                            } else if (data === 'invalid') {
                                scope.invalidPassword = true;
                            } else if (data === 'expired') {
                                window.location.href = "loggedOut.html";
                            }
                        }).catch(function (response) {
                            dialog.cancel();
                        });
                    }
                };
            }
        };
    };

    function addCashButton(browserServices) {
        return {
            restrict: 'A',
            link: function (scope, ele, attr) {
                ele.on('click', function () {
                    browserServices.validations(['SELFEXCLUSION', 'TIMEOUT']).then(function () {
                        window.location.href = "mobileBankSelection.do?method=preselectAmount&rtime=" + (new Date().getTime() / 1000);
                    });
                });
            }
        };
    }

    var restrictLength = function () {
        return{
            restrict: 'A',
            require: '?ngModel',
            link: function (scope, element, attrs, ctrl) {
                element.on('keypress', function (event) {
                    var maxlength = parseInt(attrs.restrictLength);
                    if (ctrl.$viewValue && ctrl.$viewValue.length >= maxlength) {
                        return false;
                    }
                    return true;
                });
            }
        };
    };
    function compareTo() {
        return {
            require: "ngModel",
            scope: {
                otherModelValue: "=compareTo"
            },
            link: function (scope, element, attributes, ngModel) {

                ngModel.$validators.compareTo = function (modelValue) {
                    return modelValue == scope.otherModelValue;
                };

                scope.$watch("otherModelValue", function () {
                    ngModel.$validate();
                });
            }
        };
    }
    ;

    var timer = function ($interval) {
        return{
            restrict: 'E',
            template: '<div><span ng-transclude></span>&nbsp;{{displayStr}}</div>',
            transclude: true,
            scope: {
                seconds: '@'
            },
            link: function (scope, ele, attr) {
                scope.displaySeconds = parseInt(scope.seconds) || 0;
                scope.displayStr = getDisplayStr(scope.displaySeconds);
                scope.countDown = function () {
                    if (scope.displaySeconds === 0) {
                        scope.displayStr = null;
                        $interval.cancel(scope.interval);
                        return;
                    }
                    scope.displaySeconds--;
                    scope.displayStr = getDisplayStr(scope.displaySeconds);
                };
                scope.interval = $interval(scope.countDown, 1000);

                function getDisplayStr(seconds) {
                    var min = parseInt(seconds / 60);
                    var sec = seconds % 60;
                    sec = "0" + sec;
                    return min + ":" + sec.substr(-2);
                }
            }
        };
    };

    var playnowDeprecation = function (dialog, clientredrections) {
        return{
            restrict: 'E',
            scope: {
                source: '@'
            },
            templateUrl: "angular-partials/playnowDeprecation.html",
            link: function (scope, ele, attr) {
                scope.validations = {};
                scope.skipped = function () {
                    if (scope.source === 'index') {
                         $('#myModal').hide();
                        clientredrections.redirectToND();
                        return;
                    }
                    dialog.close();
                };
                scope.close = function () {
                    dialog.cancel();
                    if (scope.source === "index") {
                        $('#myModal').hide();
                    }
                    clientredrections.redirectToND();
                };
            }

        };
    };

    angular
            .module('Layout', [])
            .config(['$compileProvider', function ($compileProvider) {
                    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|javascript):/);
                }])
            .run(['$rootScope', '$compile', function ($rootScope, $compile) {
                    var nAgt = navigator.userAgent;
                    var browserName = navigator.appName;
                    var fullVersion = '' + parseFloat(navigator.appVersion);
                    var majorVersion = parseInt(navigator.appVersion, 10);
                    var nameOffset, verOffset, ix;
                    // In Opera, the true version is after "Opera" or after "Version"
                    if ((verOffset = nAgt.indexOf("Opera")) != -1) {
                        browserName = "Opera";
                        fullVersion = nAgt.substring(verOffset + 6);
                        if ((verOffset = nAgt.indexOf("Version")) != -1)
                            fullVersion = nAgt.substring(verOffset + 8);
                    }
                    // In MSIE, the true version is after "MSIE" in userAgent
                    else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
                        browserName = "Microsoft Internet Explorer";
                        fullVersion = nAgt.substring(verOffset + 5);
                    } else if (nAgt.indexOf('Trident/') != -1) {
                        verOffset = nAgt.indexOf("rv:");
                        browserName = "Microsoft Internet Explorer";
                        fullVersion = nAgt.substring(verOffset + 3);
                    }
                    // In Chrome, the true version is after "Chrome" 
                    else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
                        browserName = "Chrome";
                        fullVersion = nAgt.substring(verOffset + 7);
                    }
                    // In Safari, the true version is after "Safari" or after "Version" 
                    else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
                        browserName = "Safari";
                        fullVersion = nAgt.substring(verOffset + 7);
                        if ((verOffset = nAgt.indexOf("Version")) != -1)
                            fullVersion = nAgt.substring(verOffset + 8);
                    }
                    // In Firefox, the true version is after "Firefox" 
                    else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
                        browserName = "Firefox";
                        fullVersion = nAgt.substring(verOffset + 8);
                    }
                    // In most other browsers, "name/version" is at the end of userAgent 
                    else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) <
                            (verOffset = nAgt.lastIndexOf('/')))
                    {
                        browserName = nAgt.substring(nameOffset, verOffset);
                        fullVersion = nAgt.substring(verOffset + 1);
                        if (browserName.toLowerCase() == browserName.toUpperCase()) {
                            browserName = navigator.appName;
                        }
                    }
                    // trim the fullVersion string at semicolon/space if present
                    if ((ix = fullVersion.indexOf(";")) != -1)
                        fullVersion = fullVersion.substring(0, ix);
                    if ((ix = fullVersion.indexOf(" ")) != -1)
                        fullVersion = fullVersion.substring(0, ix);

                    majorVersion = parseInt('' + fullVersion, 10);
                    if (isNaN(majorVersion)) {
                        fullVersion = '' + parseFloat(navigator.appVersion);
                        majorVersion = parseInt(navigator.appVersion, 10);
                    }
                    if (browserName == "Microsoft Internet Explorer") {
                        var el = $compile('<div class="ie_playnow_main"> <div class="ie_playnow"> <p><img src="assets/images/exclamation.png" alt="Info" class="img_info_ie" /></p> <p class="p1">Browser not supported </p> <p class="p2">Use updated version of Microsoft Edge/Google Chrome/Firefox for better web experience. Alternatively, Play Ace2Three Now on your desktop browser.</p><p class="p3"> <div class="ie_playnow_btn" nd-html5-app=""> Play Now </div></p></div></div>')($rootScope);
                        $(document.body).replaceWith(el);
                    }
                }])
            .service("DataService", ['$http', '$q', 'getcookie', dataService])
            .service('browserServices', ['$rootScope', '$compile', '$q', '$timeout', '$http', 'DataService', 'dialog', 'passwordService', '$window', browserServices])
            .directive("aceHeader", ['DataService', 'getcookie', 'browserServices', headerDir])
            .directive("wrenchMenu", ['DataService', 'LeftMenuJSON', 'browserServices', 'dialog', 'passwordService', '$timeout', wrenchMenu])
            .constant("LeftMenuJSON", leftmenuJson())
            .service("getcookie", getcookie)
            .directive('aceFooter', ['browserServices', 'DataService', footerDir])
            .constant('clientUrls', clientUrls())
            .directive('ndHtml5App', ['$http', 'clientredrections', 'browserServices', 'dialog', ndHtml5App])//user this directive as an attribute for playnow/Quickplay buttons      
            .service('clientredrections', ['clientUrls', 'browserServices', 'DataService', '$rootScope', 'dialog', clientredrections])
            .directive('clevertapClicks', ['$http', 'browserServices', clevertapClicks])
            .directive('appLinkBox', ['$http', 'DataService', appLinkBox])
            .directive('ace2threeConfirm', ['dialog', ace2threeConfirm])
            .directive('ace2threeAlert', ['dialog', ace2threeAlert])
            .directive('renderHtml', ['$compile', renderHtml])
            .directive('dialogTemplate', dialogTemplate)
            .directive('spinner', spinner)
            .directive('isnumericnew', isNumericNew)
            .directive('validatepassword', validatepassword)
            .directive('confirmpwd', confirm)
            .directive('setPasswordService', setPasswordServiceFun)
            .directive('ace2threeSecurity', ['$http', '$timeout', 'dialog', ace2threeSecurity])
            .service('dialog', ['$q', '$compile', '$timeout', '$rootScope', 'DataService', '$http', dialog])
            .service('passwordService', ['dialog', '$q', 'DataService', passwordService])
            .directive('confirmPasswordModal', ['$http', 'dialog', '$timeout', confirmPasswordModal])
            .directive('addCashButton', ['browserServices', addCashButton])
            .directive('restrictLength', restrictLength)
            .directive("compareTo", compareTo)
            .directive('timer', ['$interval', timer])
            .directive('playnowDeprecation', ['dialog', 'clientredrections', playnowDeprecation]);

})();

function loadGoogleAnalytics() {
    var a, e, t, n, o, g;
    return a = window, e = document, t = "script", n = "ga", a.GoogleAnalyticsObject = n, a.ga = a.ga || function () {
        (a.ga.q = a.ga.q || []).push(arguments)
    }, a.ga.l = 1 * new Date, o = e.createElement(t), g = e.getElementsByTagName(t)[0], o.async = 1, o.src = "//www.google-analytics.com/analytics.js", g.parentNode.insertBefore(o, g), ga("create", "UA-86484610-1", "auto"), ga("send", "pageview", {sessionControl: "start"}), ga
}

function googleEvent(e, l, n, o, a) {
    try {
        ga = loadGoogleAnalytics(), o && null !== a ? ga("send", "event", e, l, n, {hitCallback: a}) : ga("send", "event", e, l, n)
    } catch (e) {
        console.log(e)
    }
}

!function (t) {
    "use strict";
    var n, r = function () {
        try {
            if (t.URLSearchParams && "bar" === new t.URLSearchParams("foo=bar").get("foo"))
                return t.URLSearchParams
        } catch (t) {
        }
        return null
    }(), e = r && "a=1" === new r({a: 1}).toString(), o = r && "+" === new r("s=%2B").get("s"), i = "__URLSearchParams__", a = !r || ((n = new r).append("s", " &"), "s=+%26" === n.toString()), c = h.prototype, s = !(!t.Symbol || !t.Symbol.iterator);
    if (!(r && e && o && a)) {
        c.append = function (t, n) {
            v(this[i], t, n)
        }, c.delete = function (t) {
            delete this[i][t]
        }, c.get = function (t) {
            var n = this[i];
            return this.has(t) ? n[t][0] : null
        }, c.getAll = function (t) {
            var n = this[i];
            return this.has(t) ? n[t].slice(0) : []
        }, c.has = function (t) {
            return d(this[i], t)
        }, c.set = function (t, n) {
            this[i][t] = ["" + n]
        }, c.toString = function () {
            var t, n, r, e, o = this[i], a = [];
            for (n in o)
                for (r = l(n), t = 0, e = o[n]; t < e.length; t++)
                    a.push(r + "=" + l(e[t]));
            return a.join("&")
        };
        var u = !!o && r && !e && t.Proxy;
        Object.defineProperty(t, "URLSearchParams", {value: u ? new Proxy(r, {construct: function (t, n) {
                    return new t(new h(n[0]).toString())
                }}) : h});
        var f = t.URLSearchParams.prototype;
        f.polyfill = !0, f.forEach = f.forEach || function (t, n) {
            var r = y(this.toString());
            Object.getOwnPropertyNames(r).forEach(function (e) {
                r[e].forEach(function (r) {
                    t.call(n, r, e, this)
                }, this)
            }, this)
        }, f.sort = f.sort || function () {
            var t, n, r, e = y(this.toString()), o = [];
            for (t in e)
                o.push(t);
            for (o.sort(), n = 0; n < o.length; n++)
                this.delete(o[n]);
            for (n = 0; n < o.length; n++) {
                var i = o[n], a = e[i];
                for (r = 0; r < a.length; r++)
                    this.append(i, a[r])
            }
        }, f.keys = f.keys || function () {
            var t = [];
            return this.forEach(function (n, r) {
                t.push(r)
            }), g(t)
        }, f.values = f.values || function () {
            var t = [];
            return this.forEach(function (n) {
                t.push(n)
            }), g(t)
        }, f.entries = f.entries || function () {
            var t = [];
            return this.forEach(function (n, r) {
                t.push([r, n])
            }), g(t)
        }, s && (f[t.Symbol.iterator] = f[t.Symbol.iterator] || f.entries)
    }
    function h(t) {
        ((t = t || "")instanceof URLSearchParams || t instanceof h) && (t = t.toString()), this[i] = y(t)
    }
    function l(t) {
        var n = {"!": "%21", "'": "%27", "(": "%28", ")": "%29", "~": "%7E", "%20": "+", "%00": "\0"};
        return encodeURIComponent(t).replace(/[!'\(\)~]|%20|%00/g, function (t) {
            return n[t]
        })
    }
    function p(t) {
        return t.replace(/[ +]/g, "%20").replace(/(%[a-f0-9]{2})+/gi, function (t) {
            return decodeURIComponent(t)
        })
    }
    function g(n) {
        var r = {next: function () {
                var t = n.shift();
                return{done: void 0 === t, value: t}
            }};
        return s && (r[t.Symbol.iterator] = function () {
            return r
        }), r
    }
    function y(t) {
        var n = {};
        if ("object" == typeof t)
            if (S(t))
                for (var r = 0; r < t.length; r++) {
                    var e = t[r];
                    if (!S(e) || 2 !== e.length)
                        throw new TypeError("Failed to construct 'URLSearchParams': Sequence initializer must only contain pair elements");
                    v(n, e[0], e[1])
                }
            else
                for (var o in t)
                    t.hasOwnProperty(o) && v(n, o, t[o]);
        else {
            0 === t.indexOf("?") && (t = t.slice(1));
            for (var i = t.split("&"), a = 0; a < i.length; a++) {
                var c = i[a], s = c.indexOf("=");
                -1 < s ? v(n, p(c.slice(0, s)), p(c.slice(s + 1))) : c && v(n, p(c), "")
            }
        }
        return n
    }
    function v(t, n, r) {
        var e = "string" == typeof r ? r : null != r && "function" == typeof r.toString ? r.toString() : JSON.stringify(r);
        d(t, n) ? t[n].push(e) : t[n] = [e]
    }
    function S(t) {
        return!!t && "[object Array]" === Object.prototype.toString.call(t)
    }
    function d(t, n) {
        return Object.prototype.hasOwnProperty.call(t, n)
    }
}
("undefined" != typeof global ? global : "undefined" != typeof window ? window : this);
var storeRedirectHandler = function(){
    if(isXiaomiDevice()){
        document.location = "mimarket://details?id=air.com.ace2three.mobile.cash";
    }else{
        location.href="mobileinstaller.html";
    }
};
function isXiaomiDevice() {
   return (-1 !== navigator.userAgent.toLowerCase().indexOf("redmi") || -1 !== navigator.userAgent.toLowerCase().indexOf("xiaomi") || -1 !== navigator.userAgent.toLowerCase().indexOf("miui") || -1 !== navigator.userAgent.toLowerCase().indexOf(" mi ")) && (-1 === navigator.userAgent.toLowerCase().indexOf("a1") && -1 === navigator.userAgent.toLowerCase().indexOf("a2") && -1 === navigator.userAgent.toLowerCase().indexOf("a3"));
}
