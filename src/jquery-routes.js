(function($){

    /**
     * Routes
     * ------
     * @class Router library for jQuery
     */
    var Routes = function(){
        this._construct.apply(this, arguments);
    };

    (function(){
        var api = Routes.prototype, u = {};

        /** 
         * Events
         */
        api.EVENT_ERROR = "error";
        api.EVENT_SUCCESS = "success";

        /**
         * Defaults for options:
         * - {String} mode - "path|hash"
         * - {Object} bind - Object binded to callback
         * - {Function} hook - Function to be called when resolved
         * - {Boolean} polyfillHashChange - Polyfill hashchange feature with interval or not
         */
        api.defaults = {
            mode: "path",
            bind: null,
            hook: $.noop,
            polyfillHashChange: true
        };

        api.win = null;
        api.options = null;
        api.rules = null;
        api.emitter = null;

        /**
         * Initialize
         * @constructor
         * @param {Object} options
         */
        api._construct = function(options){
            var my = this;

            this.win = $(window);
            this.options = {};
            this.rules = [];
            this.emitter = $(this);
            this.resolve = $.proxy(this.resolve, this);

            this.config(this.defaults);
            if(options){
                this.config(options);
            }

            $.each(["on", "off", "trigger"], function(i, name){
                my[name] = $.proxy(my.emitter[name], my.emitter);
            });
        };

        /**
         * Configure options
         * @param {Object|String} options|key
         * @param {*} value
         */
        api.config = function(key, value){
            switch($.type(key)){
                case "object":
                    $.extend(true, this.options, key);
                    return this;
                case "string":
                    if(arguments.length > 1){
                        this.options[key] = value;
                        return this;
                    }
                    return this.options[key];
                case "undefined":
                    return this.options;
                default: break;
            }
            return this;
        };

        /**
         * Add rule
         *
         * - .add(rule, action); // Add a rule
         * - .add({rule: action, ...}); // Add rules by object
         * - .add([{rule: rule, action: action}, ...]); // Add rules by array
         *
         * @param {String|Array|Object} rule|rules|rules
         * @param {Function} action
         */
        api.add = function(rule, action){
            var my = this;

            switch($.type(rule)){
                case "object":
                    $.each(rule, function(key, value){
                        my.add(key, value);
                    });
                    break;
                case "array":
                    $.each(rule, function(i, item){
                        my.add(item.rule, item.action);
                    });
                    break;
                case "string":
                    this.rules.push({
                        rule: rule,
                        regex: new RegExp(rule),
                        action: action 
                    });
                    break;
                default: break;
            }
            return this;
        };

        /**
         * Resolve action by rules
         * - path is optional, when omitted use location.pathname|hash by mode
         * @param {String} path
         */
        api.resolve = function(path){
            var my = this,
                resolved = false,
                options = this.config();

            path = $.type(path) === "string" ? path
            : options.mode === "hash" ? location.hash.replace(/^#/, "")
            : location.pathname;

            $.each(this.rules, function(i, item){
                var args, m = path.match(item.regex);
                if(!! m){
                    args = u.toArray(m);
                    if($.isFunction(options.hook)){
                        options.hook.apply(options.bind, args);
                    }
                    if($.isFunction(item.action)){
                        item.action.apply(options.bind, args);
                    }
                    my.trigger(my.EVENT_SUCCESS, args);
                    resolved = true;
                    return false;
                }
            });

            if(! resolved){
                this.trigger(this.EVENT_ERROR, path);
            }

            return resolved;
        };

        /**
         * Start watching the change of location.pathname|hash
         */
        api.watch = function(){
            switch(this.config("mode")){
                case "hash":
                    if(this.config("polyfillHashChange")){
                        u.watchHashChange();
                    }
                    this.win.on("hashchange", this.resolve);
                    break;
                case "path":
                    u.watchPathName();
                    this.win.on("pathchange", this.resolve);
                    break;
                default: break;
            }
            return this;
        };

        /**
         * Stop watching the change
         */
        api.unwatch = function(){
            switch(this.config("mode")){
                case "hash":
                    this.win.off("hashchange", this.resolve);
                    break;
                case "path":
                    this.win.off("pathchange", this.resolve);
                    break;
                default: break;
            }
            return this;
        };

        /**
         * Utilities
         * ---------
         */

        /**
         * Get array from array-like object
         */
        u.toArray = function(obj){
            return Array.prototype.slice.call(obj);
        };

        /**
         * Watch the change of location property
         * @param {Object} options
         */
        u.watch = function(options){
            var my = $.extend({
                win: $(window),
                name: null,
                prop: null,
                eventName: null,
                watch: true,
                interval: 33
            }, options);

            my[my.prop] = location[my.prop];
            my.watch = undefined === my.watch ? true : my.watch;
            my.process = function(){
                if(my[my.prop] !== location[my.prop]){
                    my.win.trigger(my.eventName);
                    my[my.prop] = location[my.prop];
                }
            };

            if(false === my.watch){
                return clearInterval(my.win.data(my.name));
            }
            if(undefined === my.win.data(my.name)){
                my.win.data(my.name, setInterval(my.process, my.interval));
            }
        };

        /**
         * Watch the change of location.hash
         * - If watch is FALSE, stop watching
         * @param {Boolean} watch
         */
        u.watchHashChange = function(watch){
            if($.support.hashchange){
                return;
            }
            u.watch({
                name: "watchHashChange",
                prop: "hash",
                eventName: "hashchange",
                watch: watch
            });
        };

        /**
         * Watch the change of location.pathname
         * - if watch is FALSE, stop watching
         * @param {Boolean} watch
         */
        u.watchPathName = function(watch){
            u.watch({
                name: "watchPathName",
                prop: "pathname",
                eventName: "pathchange",
                watch: watch
            });
        };

    }());

    $.Routes = Routes;

    /**
     * Extends
     * -------
     */
    $.extend($.support, {
        hashchange: (function(){
            // Disable on IE built-in emulator
            var m = navigator.userAgent.match(/MSIE\s([\d\.]+);/);
            if(!! m){
                return parseInt(m[1], 10) >= 8;
            }
            return "onhashchange" in window;
        }())
    });

}(jQuery));
