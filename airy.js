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

    var Util = Airy.Util = {
        s4: function () {
            return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
        },
        uid: function () {
            return this.s4() + this.s4() + this.s4() + this.s4();
        },
        guid: function () {
            return (this.s4() + this.s4() + "-" + this.s4() + "-" + this.s4() + "-" + this.s4() + "-" + this.s4() +
                this.s4() + this.s4());
        },
         /**
         * Random number begin...end
         * @param begin
         * @param end
         * @returns {Number}
         */
        getRandomNumber: function (begin, end) {
            return Math.floor(Math.random() * (end - begin + 1)) + begin;
        },
        /**
         * Random array contains values begin...end
         * @param num
         * @param begin
         * @param end
         * @returns {Array}
         */
        getRandomArray: function (num, begin, end) {
            var result = [], i = 0;
            for (; i < num; i++) {
                result.push(this.getRandomNumber(begin, end));
            }
            return result;
        },
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
            return window.JSON && toString.call(JSON) === "[object JSON]";
        }
    };
    /**
     * DOM Ready
     * Support IE9, Firefox, Safari, Chrome, Opera
     */
    Airy.extend(Airy, {
        ready: function (callback) {
            var completed;
            if (document.readyState === "complete") {
                setTimeout(callback, 0);
            } else {
                completed = function () {
                    document.removeEventListener("DOMContentLoaded", completed, false);
                    window.removeEventListener("load", completed, false);
                    callback();
                };
                document.addEventListener("DOMContentLoaded", completed, false);
                window.addEventListener("load", completed, false);
            }
        }
    });

    return Airy;
});
