(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD register as an anonymous module
        define(['exports'], function (exports) {
            return (root.Airy = factory(root, exports));
        });
    } else if (typeof exports !== 'undefined') {
        // Node.js or CommonJS
        factory(root, exports);
    } else {
        // Global
        root.Airy = factory(root, {});
    }
})(this, function (root, Airy) {
    var previousAiry = root.Airy;

    Airy.VERSION = '0.0.1';

    Airy.noConflict = function () {
        root.Airy = previousAiry;
        return this;
    };

    var toString = Object.prototype.toString,
        slice = Array.prototype.slice,
        forEach = Array.prototype.forEach;

    var Event = Airy.Event = {
        addEvent: function (element, type, handler) {
            if (element.addEventListener) {

                //DOM LEVEL 2
                //'this' binds to element
                //when attaches multiple events,they will be fired
                // in the order as added
                element.addEventListener(type, handler, false);
            } else if (element.attachEvent) {

                //IE8 and earlier
                //'this' binds to global
                //when attaches multiple events,they will be fired
                // in the inverse order as added
                element.attachEvent("on" + type, handler);
            } else {

                //DOM LEVEL 0 for all modern browsers
                //'this' binds to element
                //no longer in popular use
                element["on" + type] = handler;
            }
        },

        //only bubbling phase for compatibility
        removeEvent: function (element, type, handler) {
            if (element.removeEventListener) {
                //DOM LEVEL 2
                element.removeEventListener(type, handler, false);
            } else if (element.detachEvent) {
                //IE8 and earlier
                element.detachEvent("on" + type, handler);
            } else {
                //DOM LEVEL 0 for all modern browsers
                //no longer in popular use
                element["on" + type] = null;
            }
        },

        //IE event object exists as a property of the 'window' object
        //when event handler is assigned using DOM LEVEL 0 and attachEvent
        //in DOM LEVEL 0,the event will be undefined,so window.event is returned
        getEvent: function (event) {
            return event ? event : window.event;
        },

        //IE event use 'srcElement' to show the target of the event
        getTarget: function (event) {
            return event.target || event.srcElement;
        },

        //cancel the default behavior for the event
        //as a link is to navigate to the URL with 'href' attribute when clicked
        preventDefault: function (event) {
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                //for IE
                event.returnValue = false;
            }
        },
        stopPropagation: function (event) {
            //stop any further event capturing or event bubbling
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                //for IE,stop any further event bubbling
                event.cancelBubble = true;
            }
        }
    };

    var Obj = Airy.Obj = {
        //child inherit the parent prototype chain
        //without calling parent's constructor twice that will
        //create two sets of instance properties
        inheritPrototype: function (parent) {

            //constructor stealing
            //the instance created by child will have its own properties
            var child = function () {
                //if parent constructor return a value,child also get the result
                return parent.apply(this, arguments);
            };

            //surrogate function
            //assign the constructor property to child
            function F() {
                this.constructor = child;
            }

            //surrogate make a reference to parent prototype
            //but lose the default constructor
            F.prototype = parent.prototype;

            //child prototype inherits from surrogate prototype
            child.prototype = new F();
            return child;
        },
        // Extend a given object with the properties in passed-in objects.
        extend: function (obj) {
            slice.call(arguments, 1).forEach(function (source) {
                if (source) {
                    for (var prop in source) {
                        obj[prop] = source[prop];
                    }
                }
            });
            return obj;
        }
    };

    Airy.extend = Airy.Obj.extend;

    var Ajax = Airy.Ajax = {
        createXHR: function () {
            if (typeof XMLHttpRequest != "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject != "undefined") {
                if (typeof arguments.callee.activeXString != "string") {
                    var versions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp"], i, len;
                    for (i = 0, len = versions.length; i < len; i++) {
                        try {
                            new ActiveXObject(versions[i]);
                            arguments.callee.activeXString = versions[i];
                            break;
                        } catch (ex) {

                        }
                    }
                }
                return new ActiveXObject(arguments.callee.activeXString);
            } else {
                throw new Error("No XHR object available.");
            }
        },
        //add query-string arguments to URL
        addURLParam: function (url, name, value) {
            url += (url.indexOf("?") === -1 ? "?" : "&");
            url += encodeURIComponent(name) + "=" + encodeURIComponent(value);
            return url;
        },
        // Create the Cross-XHR object.
        createCORSRequest: function (method, url) {
            var xhr = new XMLHttpRequest();
            if ("withCredentials" in xhr) {
                // XHR for Chrome/Firefox/Opera/Safari.
                xhr.open(method, url, true);
            } else if (typeof XDomainRequest != "undefined") {
                // XDomainRequest for IE.
                xhr = new XDomainRequest();
                xhr.open(method, url);
            } else {
                // CORS not supported.
                xhr = null;
            }
            return xhr;
        }
    };
    var Email = Airy.Email = {
        validateEmail: function (email) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }
    };

    var Path = Airy.Path = {
        getJsUrl: function (name) {
            var sc = document.getElementsByTagName("script");
            for (var i = 0; i < sc.length; i++) {
                var regex = new RegExp('(.*)' + name + '\\.js$'), matches = sc[i].src.match(regex);
                if (matches) {
                    return matches[1];
                }
            }
        }
    };

    var Process = Airy.Process = {
        fasterDuffDevice: function (values, callback) {
            var iterations = Math.floor(values.length / 8);
            var leftover = values.length % 8;   //count that wouldn't have been handled in the loop when simply dividing by 8
            var i = 0;

            if (leftover > 0) {
                do {
                    process.call(this, values[i++]);
                } while (--leftover > 0);
            }
            do {        //basic idea of Duff's device is to unroll a loop by calculating the number of iterations as a multiple of 8
                process.call(this, values[i++]);
                process.call(this, values[i++]);
                process.call(this, values[i++]);
                process.call(this, values[i++]);
                process.call(this, values[i++]);
                process.call(this, values[i++]);
                process.call(this, values[i++]);
                process.call(this, values[i++]);
            } while (--iterations > 0);
        }
    };

    var Type = Airy.Type = {
        isArray: function (value) {
            return toString.call(value) === "[object Array]";
        },
        isFunction: function (value) {
            return toString.call(value) === "[object Function]";
        },
        isRegExp: function (value) {
            return toString.call(value) === "[object RegExp]";
        },
        isNativeJson: function () {
            return window.JSON && toString.call(JSON) === "[oabject JSON]";
        }
    };

    var Client = Airy.Client = {
        get: function (request) {
            var engine = {
                ie: 0,
                gecko: 0,
                webkit: 0,
                khtml: 0,
                opera: 0,
                //complete version
                ver: null
            };

            var browser = {
                ie: 0,
                firfox: 0,
                safari: 0,
                chrome: 0,
                opera: 0,
                konq: 0,
                //specific version
                ver: null
            };

            var system = {
                //platform
                win: false,
                mac: false,
                x11: false,
                //mobile devices
                iphone: false,
                ipod: false,
                ipad: false,
                ios: false,
                android: false,
                nokiaN: false,
                winMobile: false,
                //game systems
                wii: false,
                ps: false
            };
            var ua;
            if (typeof navigator === "undefined") {
                if (request && Type.isArray(request.headers)) {
                    ua = request.headers["user-agent"];
                }
                if (typeof ua === "undefined") {
                    return "unknown";
                }
            } else {
                ua = navigator.userAgent;
            }
            //detect rendering engines/browers
            if (window.opera) {
                engine.ver = browser.ver = window.opera.version();
                engine.opera = browser.opera = parseFloat(engine.ver);
            } else if (/AppleWebKit\/(\S+)/.test(ua)) {
                engine.ver = RegExp["$1"];
                engine.webkit = parseFloat(engine.ver);
                if (/Chrome\/(\S+)/.test(ua)) {
                    browser.ver = RegExp["$1"];
                    browser.chrome = parseFloat(browser.ver);
                } else if (/Version\/(\S+)/.test(ua)) {
                    browser.ver = RegExp["$1"];
                    browser.safari = parseFloat(browser.ver);
                } else {
                    var safariVersion = 1;
                    if (engine.webkit < 100) {
                        safariVersion = 1;
                    } else if (engine.webkit < 312) {
                        safariVersion = 1.2;
                    } else if (engine.webkit < 412) {
                        safariVersion = 1.3;
                    } else {
                        safariVersion = 2;
                    }
                    browser.safari = browser.ver = safariVersion;
                }
            } else if (/KHTML\/(\S+)/.test(ua) || /Kongqueror\/([^;]+)/.test(ua)) {
                engine.ver = browser.ver = RegExp["$1"];
                engine.khtml = browser.konq = parseFloat(engine.ver);
            } else if (/rv:([^\)]+)\) Gecko\/\d{8}/.test(ua)) {
                engine.ver = RegExp["$1"];
                browser.firefox = parseFloat(browser.ver);

                if (/Firefox\/(\S+)/.test(ua)) {
                    engine.ver = browser.ver = RegExp["$1"];
                    engine.ie = browser.ie = parseFloat(engine.ver);
                }
            } else if (/MSIE([^;]+)/.test(ua)) {
                engine.ver = browser.ver = RegExp["$1"];
                engine.ie = browser.ie = parseFloat(engine.ver);
            }
            browser.ie = engine.ie;
            browser.opera = engine.opera;
            var p = navigator.platform;
            system.win = p.indexOf("Win") == 0;
            system.mac = p.indexOf("Mac") == 0;
            system.x11 = (p == "X11") || (p.indexOf("Linux") == 0);

            if (system.win) {
                if (/Win(?:dows)?([^do]{2})\s?(\d+\.\d+)?/.test(ua)) {
                    if (RegExp["$1"] == "NT") {
                        switch (RegExp["$2"]) {
                            case "5.0":
                                system.win = "2000";
                                break;
                            case "5.1":
                                system.win = "XP";
                                break;
                            case "6.0":
                                system.win = "Vista";
                                break;
                            case "6.1":
                                system.win = "7";
                                break;
                            default:
                                system.win = "NT";
                                break;
                        }
                    } else if (RegExp["$1"] == "9x") {
                        system.win = "ME";
                    } else {
                        system.win = RegExp["$1"];
                    }
                }
            }

            system.iphone = ua.indexOf("iPhone") > -1;
            system.ipod = ua.indexOf("iPod") > -1;
            system.ipad = ua.indexOf("iPad") > -1;
            system.nokiaN = ua.indexOf("NokiaN") > -1;

            if (system.win == "CE") {
                system.windMobile = system.win;
            } else if (system.win == "Ph") {
                if (/Windows Phone OS (\d+.\d+)/.test(ua)) {
                    system.win = "Phone";
                    system.winMobile = parseFloat(RegExp["$1"]);
                }
            }
            if (system.mac && ua.indexOf("Mobile") > -1) {
                if (/CPU (?:iPhone )?OS (\d+_\d+)/.test(ua)) {
                    system.ios = parseFloat(RegExp.$1.replace("_", "."));
                } else {
                    system.ios = 2; //can't really detect - so guess
                }
            }
            if (/Android (\d+\.\d+)/.test(ua)) {
                system.android = parseFloat(RegExp.$1);
            }
            system.wii = ua.indexOf("Wii") > -1;
            system.ps = /playstation/i.test(ua);

            return{
                engine: engine,
                browser: browser,
                system: system
            };
        }
    };

    return Airy;
});