(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD.
        define(['react'], factory);
    } else {
        // Browser globals
        root.ReactBootstrap = factory(root.React);
    }
}(this, function (React) {


/**
 * almond 0.1.2 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var defined = {},
        waiting = {},
        config = {},
        defining = {},
        aps = [].slice,
        main, req;

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {},
            nameParts, nameSegment, mapValue, foundMap,
            foundI, foundStarMap, starI, i, j, part;

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);

                name = baseParts.concat(name.split("/"));

                //start trimDots
                for (i = 0; (part = name[i]); i++) {
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            return true;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (waiting.hasOwnProperty(name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!defined.hasOwnProperty(name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    function makeMap(name, relName) {
        var prefix, plugin,
            index = name.indexOf('!');

        if (index !== -1) {
            prefix = normalize(name.slice(0, index), relName);
            name = name.slice(index + 1);
            plugin = callDep(prefix);

            //Normalize according
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            p: plugin
        };
    }

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    main = function (name, deps, callback, relName) {
        var args = [],
            usingExports,
            cjsModule, depName, ret, map, i;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i++) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = makeRequire(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = defined[name] = {};
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = {
                        id: name,
                        uri: '',
                        exports: defined[name],
                        config: makeConfig(name)
                    };
                } else if (defined.hasOwnProperty(depName) || waiting.hasOwnProperty(depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else if (!defining[depName]) {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                    cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync) {
        if (typeof deps === "string") {
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        config = cfg;
        return req;
    };

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        waiting[name] = [name, deps, callback];
    };

    define.amd = {
        jQuery: true
    };
}());

define("almond", function(){});

define(
  'transpiled/react-es6',["exports", "react"],
  function(__exports__, React) {
    
    __exports__["default"] = React;
  });
define(
  'transpiled/react-es6/lib/cx',["exports"],
  function(__exports__) {
    
    /**
     * Copyright 2013 Facebook, Inc.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     *
     * @providesModule cx
     */

    /**
     * This function is used to mark string literals representing CSS class names
     * so that they can be transformed statically. This allows for modularization
     * and minification of CSS class names.
     *
     * In static_upstream, this function is actually implemented, but it should
     * eventually be replaced with something more descriptive, and the transform
     * that is used in the main stack should be ported for use elsewhere.
     *
     * @param string|object className to modularize, or an object of key/values.
     *                      In the object case, the values are conditions that
     *                      determine if the className keys should be included.
     * @param [string ...]  Variable list of classNames in the string case.
     * @return string       Renderable space-separated CSS className.
     */
    function cx (classNames) {
      if (typeof classNames == 'object') {
        return Object.keys(classNames).map(function(className) {
          return classNames[className] ? className : '';
        }).join(' ');
      } else {
        return Array.prototype.join.call(arguments, ' ');
      }
    }

    __exports__["default"] = cx;
  });
define(
  'transpiled/constants',["exports"],
  function(__exports__) {
    
    __exports__["default"] = {
      CLASSES: {
        'alert': 'alert',
        'button': 'btn',
        'button-group': 'btn-group',
        'button-toolbar': 'btn-toolbar',
        'column': 'col',
        'input-group': 'input-group',
        'form': 'form',
        'glyphicon': 'glyphicon',
        'label': 'label',
        'panel': 'panel',
        'panel-group': 'panel-group',
        'progress-bar': 'progress-bar',
        'nav': 'nav',
        'navbar': 'navbar',
        'modal': 'modal',
        'row': 'row',
        'well': 'well'
      },
      STYLES: {
        'default': 'default',
        'primary': 'primary',
        'success': 'success',
        'info': 'info',
        'warning': 'warning',
        'danger': 'danger',
        'link': 'link',
        'inline': 'inline',
        'tabs': 'tabs',
        'pills': 'pills'
      },
      SIZES: {
        'large': 'lg',
        'medium': 'md',
        'small': 'sm',
        'xsmall': 'xs'
      },
      GLYPHS: [
        'asterisk',
        'plus',
        'euro',
        'minus',
        'cloud',
        'envelope',
        'pencil',
        'glass',
        'music',
        'search',
        'heart',
        'star',
        'star-empty',
        'user',
        'film',
        'th-large',
        'th',
        'th-list',
        'ok',
        'remove',
        'zoom-in',
        'zoom-out',
        'off',
        'signal',
        'cog',
        'trash',
        'home',
        'file',
        'time',
        'road',
        'download-alt',
        'download',
        'upload',
        'inbox',
        'play-circle',
        'repeat',
        'refresh',
        'list-alt',
        'lock',
        'flag',
        'headphones',
        'volume-off',
        'volume-down',
        'volume-up',
        'qrcode',
        'barcode',
        'tag',
        'tags',
        'book',
        'bookmark',
        'print',
        'camera',
        'font',
        'bold',
        'italic',
        'text-height',
        'text-width',
        'align-left',
        'align-center',
        'align-right',
        'align-justify',
        'list',
        'indent-left',
        'indent-right',
        'facetime-video',
        'picture',
        'map-marker',
        'adjust',
        'tint',
        'edit',
        'share',
        'check',
        'move',
        'step-backward',
        'fast-backward',
        'backward',
        'play',
        'pause',
        'stop',
        'forward',
        'fast-forward',
        'step-forward',
        'eject',
        'chevron-left',
        'chevron-right',
        'plus-sign',
        'minus-sign',
        'remove-sign',
        'ok-sign',
        'question-sign',
        'info-sign',
        'screenshot',
        'remove-circle',
        'ok-circle',
        'ban-circle',
        'arrow-left',
        'arrow-right',
        'arrow-up',
        'arrow-down',
        'share-alt',
        'resize-full',
        'resize-small',
        'exclamation-sign',
        'gift',
        'leaf',
        'fire',
        'eye-open',
        'eye-close',
        'warning-sign',
        'plane',
        'calendar',
        'random',
        'comment',
        'magnet',
        'chevron-up',
        'chevron-down',
        'retweet',
        'shopping-cart',
        'folder-close',
        'folder-open',
        'resize-vertical',
        'resize-horizontal',
        'hdd',
        'bullhorn',
        'bell',
        'certificate',
        'thumbs-up',
        'thumbs-down',
        'hand-right',
        'hand-left',
        'hand-up',
        'hand-down',
        'circle-arrow-right',
        'circle-arrow-left',
        'circle-arrow-up',
        'circle-arrow-down',
        'globe',
        'wrench',
        'tasks',
        'filter',
        'briefcase',
        'fullscreen',
        'dashboard',
        'paperclip',
        'heart-empty',
        'link',
        'phone',
        'pushpin',
        'usd',
        'gbp',
        'sort',
        'sort-by-alphabet',
        'sort-by-alphabet-alt',
        'sort-by-order',
        'sort-by-order-alt',
        'sort-by-attributes',
        'sort-by-attributes-alt',
        'unchecked',
        'expand',
        'collapse-down',
        'collapse-up',
        'log-in',
        'flash',
        'log-out',
        'new-window',
        'record',
        'save',
        'open',
        'saved',
        'import',
        'export',
        'send',
        'floppy-disk',
        'floppy-saved',
        'floppy-remove',
        'floppy-save',
        'floppy-open',
        'credit-card',
        'transfer',
        'cutlery',
        'header',
        'compressed',
        'earphone',
        'phone-alt',
        'tower',
        'stats',
        'sd-video',
        'hd-video',
        'subtitles',
        'sound-stereo',
        'sound-dolby',
        'sound-5-1',
        'sound-6-1',
        'sound-7-1',
        'copyright-mark',
        'registration-mark',
        'cloud-download',
        'cloud-upload',
        'tree-conifer',
        'tree-deciduous'
      ]
    };
  });
define(
  'transpiled/BootstrapMixin',["./react-es6","./constants","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    var React = __dependency1__["default"];
    var constants = __dependency2__["default"];

    var BootstrapMixin = {
      propTypes: {
        bsClass: React.PropTypes.oneOf(Object.keys(constants.CLASSES)),
        bsStyle: React.PropTypes.oneOf(Object.keys(constants.STYLES)),
        bsSize: React.PropTypes.oneOf(Object.keys(constants.SIZES))
      },

      getBsClassSet: function () {
        var classes = {};

        var bsClass = this.props.bsClass && constants.CLASSES[this.props.bsClass];
        if (bsClass) {
          classes[bsClass] = true;

          var prefix = bsClass + '-';

          var bsSize = this.props.bsSize && constants.SIZES[this.props.bsSize];
          if (bsSize) {
            classes[prefix + bsSize] = true;
          }

          var bsStyle = this.props.bsStyle && constants.STYLES[this.props.bsStyle];
          if (this.props.bsStyle) {
            classes[prefix + bsStyle] = true;
          }
        }

        return classes;
      }
    };

    __exports__["default"] = BootstrapMixin;
  });
define(
  'transpiled/react-es6/lib/copyProperties',["exports"],
  function(__exports__) {
    
    /**
     * Copyright 2013 Facebook, Inc.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     *
     * @providesModule copyProperties
     */

    /**
     * Copy properties from one or more objects (up to 5) into the first object.
     * This is a shallow copy. It mutates the first object and also returns it.
     *
     * NOTE: `arguments` has a very significant performance penalty, which is why
     * we don't support unlimited arguments.
     */
    function copyProperties(obj, a, b, c, d, e, f) {
      obj = obj || {};

      var args = [a, b, c, d, e];
      var ii = 0, v;
      while (args[ii]) {
        v = args[ii++];
        for (var k in v) {
          obj[k] = v[k];
        }

        // IE ignores toString in object iteration.. See:
        // webreflection.blogspot.com/2007/07/quick-fix-internet-explorer-and.html
        if (v.hasOwnProperty && v.hasOwnProperty('toString') &&
            (typeof v.toString != 'undefined') && (obj.toString !== v.toString)) {
          obj.toString = v.toString;
        }
      }

      return obj;
    }

    __exports__["default"] = copyProperties;
  });
define(
  'transpiled/react-es6/lib/emptyFunction',["./copyProperties","exports"],
  function(__dependency1__, __exports__) {
    
    /**
     * Copyright 2013 Facebook, Inc.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     *
     * @providesModule emptyFunction
     */

    var copyProperties = __dependency1__["default"];

    function makeEmptyFunction (arg) {
      return function () {
        return arg;
      };
    }

    /**
     * This function accepts and discards inputs; it has no side effects. This is
     * primarily useful idiomatically for overridable function endpoints which
     * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
     */
    function emptyFunction () {}

    copyProperties(emptyFunction, {
      thatReturns: makeEmptyFunction,
      thatReturnsFalse: makeEmptyFunction(false),
      thatReturnsTrue: makeEmptyFunction(true),
      thatReturnsNull: makeEmptyFunction(null),
      thatReturnsThis: function() { return this; },
      thatReturnsArgument: function(arg) { return arg; }
    });

    __exports__["default"] = emptyFunction;
  });
define(
  'transpiled/react-es6/lib/invariant',["exports"],
  function(__exports__) {
    
    /**
     * Copyright 2013 Facebook, Inc.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     *
     * @providesModule invariant
     */

    /**
     * Use invariant() to assert state which your program assumes to be true.
     *
     * Provide sprintf-style format (only %s is supported) and arguments
     * to provide information about what broke and what you were
     * expecting.
     *
     * The invariant message will be stripped in production, but the invariant
     * will remain to ensure logic does not differ in production.
     */

    function invariant (condition) {
      if (!condition) {
        var error = new Error('Invariant Violation');
        error.framesToPop = 1;
        throw error;
      }
    }

    __exports__["default"] = invariant;
  });
define(
  'transpiled/react-es6/lib/joinClasses',["exports"],
  function(__exports__) {
    
    /**
     * Copyright 2013 Facebook, Inc.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     *
     * @providesModule joinClasses
     * @typechecks static-only
     */

    

    /**
     * Combines multiple className strings into one.
     * http://jsperf.com/joinclasses-args-vs-array
     *
     * @param {...?string} classes
     * @return {string}
     */
    function joinClasses (className/*, ... */) {
      if (!className) {
        className = '';
      }
      var nextClass;
      var argLength = arguments.length;
      if (argLength > 1) {
        for (var ii = 1; ii < argLength; ii++) {
          nextClass = arguments[ii];
          nextClass && (className += ' ' + nextClass);
        }
      }
      return className;
    }

    __exports__["default"] = joinClasses;
  });
define(
  'transpiled/react-es6/lib/keyMirror',["./invariant","exports"],
  function(__dependency1__, __exports__) {
    
    /**
     * Copyright 2013 Facebook, Inc.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     *
     * @providesModule keyMirror
     * @typechecks static-only
     */

    

    var invariant = __dependency1__["default"];

    /**
     * Constructs an enumeration with keys equal to their value.
     *
     * For example:
     *
     *   var COLORS = keyMirror({blue: null, red: null});
     *   var myColor = COLORS.blue;
     *   var isColorValid = !!COLORS[myColor];
     *
     * The last line could not be performed if the values of the generated enum were
     * not equal to their keys.
     *
     *   Input:  {key1: val1, key2: val2}
     *   Output: {key1: key1, key2: key2}
     *
     * @param {object} obj
     * @return {object}
     */
    var keyMirror = function(obj) {
      var ret = {};
      var key;
      (invariant(obj instanceof Object && !Array.isArray(obj)));
      for (key in obj) {
        if (!obj.hasOwnProperty(key)) {
          continue;
        }
        ret[key] = key;
      }
      return ret;
    };

    __exports__["default"] = keyMirror;
  });
define(
  'transpiled/react-es6/lib/mergeHelpers',["./invariant","./keyMirror","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    /**
     * Copyright 2013 Facebook, Inc.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     *
     * @providesModule mergeHelpers
     *
     * requiresPolyfills: Array.isArray
     */

    

    var invariant = __dependency1__["default"];
    var keyMirror = __dependency2__["default"];

    /**
     * Maximum number of levels to traverse. Will catch circular structures.
     * @const
     */
    var MAX_MERGE_DEPTH = 36;

    /**
     * We won't worry about edge cases like new String('x') or new Boolean(true).
     * Functions are considered terminals, and arrays are not.
     * @param {*} o The item/object/value to test.
     * @return {boolean} true iff the argument is a terminal.
     */
    var isTerminal = function (o) {
      return typeof o !== 'object' || o === null;
    };

    var mergeHelpers = {

      MAX_MERGE_DEPTH: MAX_MERGE_DEPTH,

      isTerminal: isTerminal,

      /**
       * Converts null/undefined values into empty object.
       *
       * @param {?Object=} arg Argument to be normalized (nullable optional)
       * @return {!Object}
       */
      normalizeMergeArg: function (arg) {
        return arg === undefined || arg === null ? {} : arg;
      },

      /**
       * If merging Arrays, a merge strategy *must* be supplied. If not, it is
       * likely the caller's fault. If this function is ever called with anything
       * but `one` and `two` being `Array`s, it is the fault of the merge utilities.
       *
       * @param {*} one Array to merge into.
       * @param {*} two Array to merge from.
       */
      checkMergeArrayArgs: function (one, two) {
        (invariant(Array.isArray(one) && Array.isArray(two)));
      },

      /**
       * @param {*} one Object to merge into.
       * @param {*} two Object to merge from.
       */
      checkMergeObjectArgs: function (one, two) {
        mergeHelpers.checkMergeObjectArg(one);
        mergeHelpers.checkMergeObjectArg(two);
      },

      /**
       * @param {*} arg
       */
      checkMergeObjectArg: function (arg) {
        (invariant(!isTerminal(arg) && !Array.isArray(arg)));
      },

      /**
       * Checks that a merge was not given a circular object or an object that had
       * too great of depth.
       *
       * @param {number} Level of recursion to validate against maximum.
       */
      checkMergeLevel: function (level) {
        (invariant(level < MAX_MERGE_DEPTH));
      },

      /**
       * Checks that the supplied merge strategy is valid.
       *
       * @param {string} Array merge strategy.
       */
      checkArrayStrategy: function (strategy) {
        (invariant(strategy === undefined || strategy in mergeHelpers.ArrayStrategies));
      },

      /**
       * Set of possible behaviors of merge algorithms when encountering two Arrays
       * that must be merged together.
       * - `clobber`: The left `Array` is ignored.
       * - `indexByIndex`: The result is achieved by recursively deep merging at
       *   each index. (not yet supported.)
       */
      ArrayStrategies: keyMirror({
        Clobber: true,
        IndexByIndex: true
      })

    };

    __exports__["default"] = mergeHelpers;
  });
define(
  'transpiled/react-es6/lib/mergeInto',["./mergeHelpers","exports"],
  function(__dependency1__, __exports__) {
    
    /**
     * Copyright 2013 Facebook, Inc.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     *
     * @providesModule mergeInto
     * @typechecks static-only
     */

    

    var mergeHelpers = __dependency1__["default"];

    var checkMergeObjectArg = mergeHelpers.checkMergeObjectArg;

    /**
     * Shallow merges two structures by mutating the first parameter.
     *
     * @param {object} one Object to be merged into.
     * @param {?object} two Optional object with properties to merge from.
     */
    function mergeInto (one, two) {
      checkMergeObjectArg(one);
      if (two != null) {
        checkMergeObjectArg(two);
        for (var key in two) {
          if (!two.hasOwnProperty(key)) {
            continue;
          }
          one[key] = two[key];
        }
      }
    }

    __exports__["default"] = mergeInto;
  });
define(
  'transpiled/react-es6/lib/merge',["./mergeInto","exports"],
  function(__dependency1__, __exports__) {
    
    /**
     * Copyright 2013 Facebook, Inc.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     *
     * @providesModule merge
     */

    

    var mergeInto = __dependency1__["default"];

    /**
     * Shallow merges two structures into a return value, without mutating either.
     *
     * @param {?object} one Optional object with properties to merge from.
     * @param {?object} two Optional object with properties to merge from.
     * @return {object} The shallow extension of one by two.
     */
    var merge = function (one, two) {
      var result = {};
      mergeInto(result, one);
      mergeInto(result, two);
      return result;
    };

    __exports__["default"] = merge;
  });
define(
  'transpiled/react-es6/lib/ReactPropTransferer',["./emptyFunction","./invariant","./joinClasses","./merge","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    
    /**
     * Copyright 2013 Facebook, Inc.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     *
     * @providesModule ReactPropTransferer
     */

    

    var emptyFunction = __dependency1__["default"];
    var invariant = __dependency2__["default"];
    var joinClasses = __dependency3__["default"];
    var merge = __dependency4__["default"];

    /**
     * Creates a transfer strategy that will merge prop values using the supplied
     * `mergeStrategy`. If a prop was previously unset, this just sets it.
     *
     * @param {function} mergeStrategy
     * @return {function}
     */
    function createTransferStrategy (mergeStrategy) {
      return function (props, key, value) {
        if (!props.hasOwnProperty(key)) {
          props[key] = value;
        } else {
          props[key] = mergeStrategy(props[key], value);
        }
      };
    }

    /**
     * Transfer strategies dictate how props are transferred by `transferPropsTo`.
     */
    var TransferStrategies = {
      /**
       * Never transfer `children`.
       */
      children: emptyFunction,
      /**
       * Transfer the `className` prop by merging them.
       */
      className: createTransferStrategy(joinClasses),
      /**
       * Never transfer the `key` prop.
       */
      key: emptyFunction,
      /**
       * Never transfer the `ref` prop.
       */
      ref: emptyFunction,
      /**
       * Transfer the `style` prop (which is an object) by merging them.
       */
      style: createTransferStrategy(merge)
    };

    /**
     * ReactPropTransferer are capable of transferring props to another component
     * using a `transferPropsTo` method.
     *
     * @class ReactPropTransferer
     */
    var ReactPropTransferer = {

      TransferStrategies: TransferStrategies,

      /**
       * Merge two props objects using TransferStrategies.
       *
       * @param {object} oldProps original props (they take precedence)
       * @param {object} newProps new props to merge in
       * @return {object} a new object containing both sets of props merged.
       */
      mergeProps: function (oldProps, newProps) {
        var props = merge(oldProps);

        for (var thisKey in newProps) {
          if (!newProps.hasOwnProperty(thisKey)) {
            continue;
          }

          var transferStrategy = TransferStrategies[thisKey];

          if (transferStrategy) {
            transferStrategy(props, thisKey, newProps[thisKey]);
          } else if (!props.hasOwnProperty(thisKey)) {
            props[thisKey] = newProps[thisKey];
          }
        }

        return props;
      },

      /**
       * @lends {ReactPropTransferer.prototype}
       */
      Mixin: {

        /**
         * Transfer props from this component to a target component.
         *
         * Props that do not have an explicit transfer strategy will be transferred
         * only if the target component does not already have the prop set.
         *
         * This is usually used to pass down props to a returned root component.
         *
         * @param {ReactComponent} component Component receiving the properties.
         * @return {ReactComponent} The supplied `component`.
         * @final
         * @protected
         */
        transferPropsTo: function (component) {
          (invariant(component._owner === this));

          component.props = ReactPropTransferer.mergeProps(
            component.props,
            this.props
          );

          return component;
        }

      }
    };

    __exports__["default"] = ReactPropTransferer;
  });
define(
  'transpiled/react-es6/lib/keyOf',["exports"],
  function(__exports__) {
    
    /**
     * Allows extraction of a minified key. Let's the build system minify keys
     * without loosing the ability to dynamically use key strings as values
     * themselves. Pass in an object with a single key/val pair and it will return
     * you the string key of that single record. Suppose you want to grab the
     * value for a key 'className' inside of an object. Key/val minification may
     * have aliased that key to be 'xa12'. keyOf({className: null}) will return
     * 'xa12' in that case. Resolve keys you want to use once at startup time, then
     * reuse those resolutions.
     */
    var keyOf = function(oneKeyObj) {
      var key;
      for (key in oneKeyObj) {
        if (!oneKeyObj.hasOwnProperty(key)) {
          continue;
        }
        return key;
      }
      return null;
    };


    __exports__["default"] = keyOf;
  });
define(
  'transpiled/react-es6/lib/cloneWithProps',["./ReactPropTransferer","./keyOf","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    

    var ReactPropTransferer = __dependency1__["default"];

    var keyOf = __dependency2__["default"];

    var CHILDREN_PROP = keyOf({children: null});

    /**
     * Sometimes you want to change the props of a child passed to you. Usually
     * this is to add a CSS class.
     *
     * @param {object} child child component you'd like to clone
     * @param {object} props props you'd like to modify. They will be merged
     * as if you used `transferPropsTo()`.
     * @return {object} a clone of child with props merged in.
     */
    function cloneWithProps (child, props) {
      var newProps = ReactPropTransferer.mergeProps(props, child.props);

      // Use `child.props.children` if it is provided.
      if (!newProps.hasOwnProperty(CHILDREN_PROP) &&
          child.props.hasOwnProperty(CHILDREN_PROP)) {
        newProps.children = child.props.children;
      }

      return child.constructor.ConvenienceConstructor(newProps);
    }

    __exports__["default"] = cloneWithProps;
  });
define(
  'transpiled/utils',["./react-es6/lib/cloneWithProps","exports"],
  function(__dependency1__, __exports__) {
    
    var cloneWithProps = __dependency1__["default"];

    // From https://www.npmjs.org/package/extend
    var hasOwn = Object.prototype.hasOwnProperty;
    var toString = Object.prototype.toString;

    function isPlainObject(obj) {
      if (!obj || toString.call(obj) !== '[object Object]' || obj.nodeType || obj.setInterval)
        return false;

      var has_own_constructor = hasOwn.call(obj, 'constructor');
      var has_is_property_of_method = hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
      // Not own constructor property must be Object
      if (obj.constructor && !has_own_constructor && !has_is_property_of_method)
        return false;

      // Own properties are enumerated firstly, so to speed up,
      // if last one is own, then all properties are own.
      var key;
      for ( key in obj ) {}

      return key === undefined || hasOwn.call( obj, key );
    };

    __exports__["default"] = {

      /**
       * Modify each item in a React children array without
       * unnecessarily allocating a new array.
       *
       * @param {array|object} children
       * @param {function} modifier
       * @returns {*}
       */
      modifyChildren: function (children, modifier) {
        if (children == null) {
          return children;
        }

        return Array.isArray(children) ? children.map(modifier) : modifier(children, 0);
      },

      /**
       * Filter each item in a React children array without
       * unnecessarily allocating a new array.
       *
       * @param {array|object} children
       * @param {function} filter
       * @returns {*}
       */
      filterChildren: function (children, filter) {
        if (children == null) {
          return children;
        }

        if (Array.isArray(children)) {
          return children.filter(filter);
        } else {
          return filter(children, 0) ? children : null;
        }
      },


      /**
       * Safe chained function
       *
       * Will only create a new function if needed,
       * otherwise will pass back existing functions or null.
       *
       * @param {function} one
       * @param {function} two
       * @returns {function|null}
       */
      createChainedFunction: function (one, two) {
        var hasOne = typeof one === 'function';
        var hasTwo = typeof two === 'function';

        if (!hasOne && !hasTwo) { return null; }
        if (!hasOne) { return two; }
        if (!hasTwo) { return one; }

        return function chainedFunction() {
          one.apply(this, arguments);
          two.apply(this, arguments);
        };
      },

      /**
       * Sometimes you want to change the props of a child passed to you. Usually
       * this is to add a CSS class.
       *
       * @param {object} child child component you'd like to clone
       * @param {object} props props you'd like to modify. They will be merged
       * as if you used `transferPropsTo()`.
       * @return {object} a clone of child with props merged in.
       */
      cloneWithProps: function (child, props) {
        return cloneWithProps(child, props);
      },

      /**
       * From https://www.npmjs.org/package/extend
       * node-extend is a port of the classic extend() method from jQuery.
       * It behaves as you expect. It is simple, tried and true.
       *
       * Extend one object with one or more others, returning the modified object.
       * Keep in mind that the target object will be modified, and will be returned from extend().
       *
       * If a boolean true is specified as the first argument, extend performs a deep copy,
       * recursively copying any objects it finds. Otherwise, the copy will share structure
       * with the original object(s). Undefined properties are not copied. However, properties
       * inherited from the object's prototype will be copied over.
       *
       * @example
       * extend([deep], target, object1, [objectN])
       *
       * @return {object}
       */
      extend: function () {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if ( typeof target === "boolean" ) {
          deep = target;
          target = arguments[1] || {};
          // skip the boolean and the target
          i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && typeof target !== "function") {
          target = {};
        }

        for ( ; i < length; i++ ) {
          // Only deal with non-null/undefined values
          if ( (options = arguments[ i ]) != null ) {
            // Extend the base object
            for ( name in options ) {
              src = target[ name ];
              copy = options[ name ];

              // Prevent never-ending loop
              if ( target === copy ) {
                continue;
              }

              // Recurse if we're merging plain objects or arrays
              if ( deep && copy && ( isPlainObject(copy) || (copyIsArray = Array.isArray(copy)) ) ) {
                if ( copyIsArray ) {
                  copyIsArray = false;
                  clone = src && Array.isArray(src) ? src : [];

                } else {
                  clone = src && isPlainObject(src) ? src : {};
                }

                // Never move original objects, clone them
                target[ name ] = extend( deep, clone, copy );

              // Don't bring in undefined values
              } else if ( copy !== undefined ) {
                target[ name ] = copy;
              }
            }
          }
        }

        // Return the modified object
        return target;
      }
    };
  });
define(
  'transpiled/PanelGroup',["./react-es6","./react-es6/lib/cx","./BootstrapMixin","./utils","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];
    var utils = __dependency4__["default"];

    var PanelGroup = React.createClass({displayName: 'PanelGroup',
      mixins: [BootstrapMixin],

      propTypes: {
        onSelect: React.PropTypes.func
      },

      getDefaultProps: function () {
        return {
          bsClass: 'panel-group'
        };
      },

      getInitialState: function () {
        var defaultActiveKey = this.props.defaultActiveKey;

        return {
          activeKey: defaultActiveKey
        };
      },

      render: function () {
        return this.transferPropsTo(
          React.DOM.div( {className:classSet(this.getBsClassSet())}, 
              utils.modifyChildren(this.props.children, this.renderPanel)
          )
        );
      },

      renderPanel: function (child) {
        var activeKey =
          this.props.activeKey != null ? this.props.activeKey : this.state.activeKey;

        var props = {
          bsStyle: this.props.bsStyle,
          key: child.props.key,
          ref: child.props.ref
        };

        if (this.props.isAccordion) {
          props.isCollapsable = true;
          props.isOpen = (child.props.key === activeKey);
          props.onSelect = this.handleSelect;
        }

        return utils.cloneWithProps(
          child,
          props
        );
      },

      shouldComponentUpdate: function() {
        // Defer any updates to this component during the `onSelect` handler.
        return !this._isChanging;
      },

      handleSelect: function (key) {
        if (this.props.onSelect) {
          this._isChanging = true;
          this.props.onSelect(key);
          this._isChanging = false;
        }

        if (this.state.activeKey === key) {
          key = null;
        }

        this.setState({
          activeKey: key
        });
      }
    });

    __exports__["default"] = PanelGroup;
  });
define(
  'transpiled/Accordion',["./react-es6","./PanelGroup","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var PanelGroup = __dependency2__["default"];

    var Accordion = React.createClass({displayName: 'Accordion',

      render: function () {
        return this.transferPropsTo(
          PanelGroup( {isAccordion:true}, 
              this.props.children
          )
        );
      }

    });

    __exports__["default"] = Accordion;
  });
define('Accordion',['./transpiled/Accordion'], function (Accordion) {
  return Accordion['default'];
});
define(
  'transpiled/domUtils',["exports"],
  function(__exports__) {
    
    __exports__["default"] = {
      getComputedStyles: function (elem) {
        return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
      },

      getOffset: function (DOMNode) {
        var docElem = document.documentElement;
        var box = { top: 0, left: 0 };

        // If we don't have gBCR, just use 0,0 rather than error
        // BlackBerry 5, iOS 3 (original iPhone)
        if ( typeof DOMNode.getBoundingClientRect !== 'undefined' ) {
          box = DOMNode.getBoundingClientRect();
        }

        return {
          top: box.top + window.pageYOffset - docElem.clientTop,
          left: box.left + window.pageXOffset - docElem.clientLeft
        };
      },

      getPosition: function (elem, offsetParent) {
        var offset,
            parentOffset = {top: 0, left: 0};

        // Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is its only offset parent
        if (this.getComputedStyles(elem).position === 'fixed' ) {
          // We assume that getBoundingClientRect is available when computed position is fixed
          offset = elem.getBoundingClientRect();

        } else {
          if (!offsetParent) {
            // Get *real* offsetParent
            offsetParent = this.offsetParent(elem);
          }

          // Get correct offsets
          offset = this.getOffset(elem);
          if ( offsetParent.nodeName !== 'HTML') {
            parentOffset = this.getOffset(offsetParent);
          }

          // Add offsetParent borders
          parentOffset.top += parseInt(this.getComputedStyles(offsetParent).borderTopWidth, 10);
          parentOffset.left += parseInt(this.getComputedStyles(offsetParent).borderLeftWidth, 10);
        }

        // Subtract parent offsets and element margins
        return {
          top: offset.top - parentOffset.top - parseInt(this.getComputedStyles(elem).marginTop, 10),
          left: offset.left - parentOffset.left - parseInt(this.getComputedStyles(elem).marginLeft, 10)
        };
      },

      offsetParent: function (elem) {
        var docElem = document.documentElement;
        var offsetParent = elem.offsetParent || docElem;

        while ( offsetParent && ( offsetParent.nodeName !== 'HTML' &&
          this.getComputedStyles(offsetParent).position === 'static' ) ) {
          offsetParent = offsetParent.offsetParent;
        }

        return offsetParent || docElem;
      }
    };
  });
define(
  'transpiled/AffixMixin',["./react-es6","./domUtils","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    /* global window, document */

    var React = __dependency1__["default"];
    var domUtils = __dependency2__["default"];

    var AffixMixin = {
      propTypes: {
        offset: React.PropTypes.number,
        offsetTop: React.PropTypes.number,
        offsetBottom: React.PropTypes.number
      },

      getInitialState: function () {
        return {
          affixClass: 'affix-top'
        };
      },

      getPinnedOffset: function (DOMNode) {
        if (this.pinnedOffset) {
          return this.pinnedOffset;
        }

        DOMNode.className = DOMNode.className.replace(/affix-top|affix-bottom|affix/, '');
        DOMNode.className += DOMNode.className.length ? ' affix' : 'affix';

        this.pinnedOffset = domUtils.getOffset(DOMNode).top - window.pageYOffset;

        return this.pinnedOffset;
      },

      checkPosition: function () {
        var DOMNode, scrollHeight, scrollTop, position, offsetTop, offsetBottom,
            affix, affixType, affixPositionTop;

        // TODO: or not visible
        if (!this.isMounted()) {
          return;
        }

        DOMNode = this.getDOMNode();
        scrollHeight = document.documentElement.offsetHeight;
        scrollTop = window.pageYOffset;
        position = domUtils.getOffset(DOMNode);
        offsetTop;
        offsetBottom;

        if (this.affixed === 'top') {
          position.top += scrollTop;
        }

        offsetTop = this.props.offsetTop != null ?
          this.props.offsetTop : this.props.offset;
        offsetBottom = this.props.offsetBottom != null ?
          this.props.offsetBottom : this.props.offset;

        if (offsetTop == null && offsetBottom == null) {
          return;
        }
        if (offsetTop == null) {
          offsetTop = 0;
        }
        if (offsetBottom == null) {
          offsetBottom = 0;
        }

        if (this.unpin != null && (scrollTop + this.unpin <= position.top)) {
          affix = false;
        } else if (offsetBottom != null && (position.top + DOMNode.offsetHeight >= scrollHeight - offsetBottom)) {
          affix = 'bottom';
        } else if (offsetTop != null && (scrollTop <= offsetTop)) {
          affix = 'top';
        } else {
          affix = false;
        }

        if (this.affixed === affix) {
          return;
        }

        if (this.unpin != null) {
          DOMNode.style.top = '';
        }

        affixType = 'affix' + (affix ? '-' + affix : '');

        this.affixed = affix;
        this.unpin = affix === 'bottom' ?
          this.getPinnedOffset(DOMNode) : null;

        if (affix === 'bottom') {
          DOMNode.className = DOMNode.className.replace(/affix-top|affix-bottom|affix/, 'affix-top');
          affixPositionTop = scrollHeight - offsetBottom - DOMNode.offsetHeight - domUtils.getOffset(DOMNode).top;
        }

        this.setState({
          affixClass: affixType,
          affixPositionTop: affixPositionTop
        });
      },

      checkPositionWithEventLoop: function () {
        setTimeout(this.checkPosition, 0);
      },

      componentDidMount: function () {
        window.addEventListener('scroll', this.checkPosition);
        document.addEventListener('click', this.checkPositionWithEventLoop);
      },

      componentWillUnmount: function () {
        window.removeEventListener('scroll', this.checkPosition);
        document.addEventListener('click', this.checkPositionWithEventLoop);
      },

      componentDidUpdate: function (prevProps, prevState) {
        if (prevState.affixClass === this.state.affixClass) {
          this.checkPositionWithEventLoop();
        }
      }
    };

    __exports__["default"] = AffixMixin;
  });
define(
  'transpiled/Affix',["./react-es6","./AffixMixin","./domUtils","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var AffixMixin = __dependency2__["default"];
    var domUtils = __dependency3__["default"];

    var Affix = React.createClass({displayName: 'Affix',
      statics: {
        domUtils: domUtils
      },

      mixins: [AffixMixin],

      render: function () {
        return this.transferPropsTo(
          React.DOM.div( {className:this.state.affixClass, style:{top: this.state.affixPositionTop}}, 
            this.props.children
          )
        );
      }
    });

    __exports__["default"] = Affix;
  });
define('Affix',['./transpiled/Affix'], function (Affix) {
  return Affix['default'];
});
define('AffixMixin',['./transpiled/AffixMixin'], function (AffixMixin) {
  return AffixMixin['default'];
});
define(
  'transpiled/Alert',["./react-es6","./react-es6/lib/cx","./BootstrapMixin","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];


    var Alert = React.createClass({displayName: 'Alert',
      mixins: [BootstrapMixin],

      propTypes: {
        onDismiss: React.PropTypes.func,
        dismissAfter: React.PropTypes.number
      },

      getDefaultProps: function () {
        return {
          bsClass: 'alert',
          bsStyle: 'info'
        };
      },

      renderDismissButton: function () {
        return (
          React.DOM.button(
            {type:"button",
            className:"close",
            onClick:this.props.onDismiss,
            'aria-hidden':"true"}, 
            "×"
          )
        );
      },

      render: function () {
        var classes = this.getBsClassSet();
        var isDismissable = !!this.props.onDismiss;

        classes['alert-dismissable'] = isDismissable;

        return this.transferPropsTo(
          React.DOM.div( {className:classSet(classes)}, 
            isDismissable ? this.renderDismissButton() : null,
            this.props.children
          )
        );
      },

      componentDidMount: function() {
        if (this.props.dismissAfter && this.props.onDismiss) {
          this.dismissTimer = setTimeout(this.props.onDismiss, this.props.dismissAfter);
        }
      },

      componentWillUnmount: function() {
        clearTimeout(this.dismissTimer);
      }
    });

    __exports__["default"] = Alert;
  });
define('Alert',['./transpiled/Alert'], function (Alert) {
  return Alert['default'];
});
define('BootstrapMixin',['./transpiled/BootstrapMixin'], function (BootstrapMixin) {
  return BootstrapMixin['default'];
});
define(
  'transpiled/Badge',["./react-es6","exports"],
  function(__dependency1__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];

    var Badge = React.createClass({displayName: 'Badge',

      render: function () {
        return this.transferPropsTo(
          React.DOM.span( {className:this.props.children ? 'badge': null}, 
            this.props.children
          )
        );
      }
    });

    __exports__["default"] = Badge;
  });
define('Badge',['./transpiled/Badge'], function (Badge) {
  return Badge['default'];
});
define(
  'transpiled/Button',["./react-es6","./react-es6/lib/cx","./BootstrapMixin","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];

    var Button = React.createClass({displayName: 'Button',
      mixins: [BootstrapMixin],

      propTypes: {
        active:   React.PropTypes.bool,
        disabled: React.PropTypes.bool,
        block:    React.PropTypes.bool,
        navItem:    React.PropTypes.bool,
        navDropdown: React.PropTypes.bool
      },

      getDefaultProps: function () {
        return {
          bsClass: 'button',
          bsStyle: 'default',
          type: 'button'
        };
      },

      render: function () {
        var classes = this.props.navDropdown ? {} : this.getBsClassSet();
        var renderFuncName;

        classes['active'] = this.props.active;
        classes['btn-block'] = this.props.block;

        if (this.props.navItem) {
          return this.renderNavItem(classes);
        }

        renderFuncName = this.props.href || this.props.navDropdown ?
          'renderAnchor' : 'renderButton';

        return this[renderFuncName](classes);
      },

      renderAnchor: function (classes) {
        var href = this.props.href || '#';
        classes['disabled'] = this.props.disabled;

        return this.transferPropsTo(
          React.DOM.a(
            {href:href,
            className:classSet(classes),
            role:"button"}, 
            this.props.children
          )
        );
      },

      renderButton: function (classes) {
        return this.transferPropsTo(
          React.DOM.button(
            {className:classSet(classes)}, 
            this.props.children
          )
        );
      },

      renderNavItem: function (classes) {
        var liClasses = {
          active: this.props.active
        };

        return (
          React.DOM.li( {className:classSet(liClasses)}, 
            this.renderAnchor(classes)
          )
        );
      }
    });

    __exports__["default"] = Button;
  });
define('Button',['./transpiled/Button'], function (Button) {
  return Button['default'];
});
define(
  'transpiled/ButtonGroup',["./react-es6","./react-es6/lib/cx","./BootstrapMixin","./Button","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];
    var Button = __dependency4__["default"];

    var ButtonGroup = React.createClass({displayName: 'ButtonGroup',
      mixins: [BootstrapMixin],

      propTypes: {
        vertical:  React.PropTypes.bool,
        justified: React.PropTypes.bool
      },

      getDefaultProps: function () {
        return {
          bsClass: 'button-group'
        };
      },

      render: function () {
        var classes = this.getBsClassSet();
        classes['btn-group-vertical'] = this.props.vertical;
        classes['btn-group-justified'] = this.props.justified;

        return this.transferPropsTo(
          React.DOM.div(
            {className:classSet(classes)}, 
            this.props.children
          )
        );
      }
    });

    __exports__["default"] = ButtonGroup;
  });
define('ButtonGroup',['./transpiled/ButtonGroup'], function (ButtonGroup) {
  return ButtonGroup['default'];
});
define(
  'transpiled/ButtonToolbar',["./react-es6","./react-es6/lib/cx","./BootstrapMixin","./Button","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];
    var Button = __dependency4__["default"];

    var ButtonGroup = React.createClass({displayName: 'ButtonGroup',
      mixins: [BootstrapMixin],

      getDefaultProps: function () {
        return {
          bsClass: 'button-toolbar'
        };
      },

      render: function () {
        var classes = this.getBsClassSet();

        return this.transferPropsTo(
          React.DOM.div(
            {role:"toolbar",
            className:classSet(classes)}, 
            this.props.children
          )
        );
      }
    });

    __exports__["default"] = ButtonGroup;
  });
define('ButtonToolbar',['./transpiled/ButtonToolbar'], function (ButtonToolbar) {
  return ButtonToolbar['default'];
});
define(
  'transpiled/Carousel',["./react-es6","./react-es6/lib/cx","./BootstrapMixin","./utils","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];
    var utils = __dependency4__["default"];

    var Carousel = React.createClass({displayName: 'Carousel',
      mixins: [BootstrapMixin],

      propTypes: {
        slide: React.PropTypes.bool,
        indicators: React.PropTypes.bool,
        controls: React.PropTypes.bool,
        pauseOnHover: React.PropTypes.bool,
        wrap: React.PropTypes.bool,
        onSelect: React.PropTypes.func,
        activeIndex: React.PropTypes.number,
        direction: React.PropTypes.oneOf(['prev', 'next'])
      },

      getDefaultProps: function () {
        return {
          slide: true,
          interval: 5000,
          pauseOnHover: true,
          wrap: true,
          indicators: true,
          controls: true
        };
      },

      getInitialState: function () {
        var defaultActiveIndex = this.props.defaultActiveIndex;

        if (defaultActiveIndex == null) {
          defaultActiveIndex = 0;
        }

        return {
          activeIndex: defaultActiveIndex,
          previousActiveIndex: null,
          direction: null
        };
      },

      getDirection: function (prevIndex, index) {
        if (prevIndex === index) {
          return null;
        }

        return prevIndex > index ?
          'prev' : 'next';
      },

      getNumberOfItems: function () {
        if (!this.props.children) {
          return 0;
        }

        if (!Array.isArray(this.props.children)) {
          return 1;
        }

        return this.props.children.length;
      },

      componentWillReceiveProps: function (nextProps) {
        var activeIndex = this.getActiveIndex();

        if (nextProps.activeIndex != null && nextProps.activeIndex !== activeIndex) {
          this.setState({
            previousActiveIndex: activeIndex,
            direction: nextProps.direction != null ?
              nextProps.direction : this.getDirection(activeIndex, nextProps.activeIndex)
          });
        }
      },

      componentDidMount: function () {
        this.waitForNext();
      },

      next: function (e) {
        var index = this.getActiveIndex() + 1;

        if (index > this.getNumberOfItems() - 1) {
          if (!this.props.wrap) {
            return;
          }
          index = 0;
        }

        this.handleSelect(index, 'next');

        if (e) {
          e.preventDefault();
        }
      },

      prev: function (e) {
        var index = this.getActiveIndex() - 1;

        if (index < 0) {
          if (!this.props.wrap) {
            return;
          }
          index = this.getNumberOfItems() - 1;
        }

        this.handleSelect(index, 'prev');

        if (e) {
          e.preventDefault();
        }
      },

      pause: function () {
        this.isPaused = true;
        clearTimeout(this.timeout);
      },

      play: function () {
        this.isPaused = false;
        this.waitForNext();
      },

      waitForNext: function () {
        if (!this.isPaused && this.props.slide && this.props.interval &&
            this.props.activeIndex == null) {
          this.timeout = setTimeout(this.next, this.props.interval);
        }
      },

      handleMouseOver: function () {
        if (this.props.pauseOnHover) {
          this.pause();
        }
      },

      handleMouseOut: function () {
        if (this.isPaused) {
          this.play();
        }
      },

      render: function () {
        var classes = {
          carousel: true,
          slide: this.props.slide
        };

        return this.transferPropsTo(
          React.DOM.div(
            {className:classSet(classes),
            onMouseOver:this.handleMouseOver,
            onMouseOut:this.handleMouseOut}, 
            this.props.indicators ? this.renderIndicators() : null,
            React.DOM.div( {className:"carousel-inner", ref:"inner"}, 
              utils.modifyChildren(this.props.children, this.renderItem)
            ),
            this.props.controls ? this.renderControls() : null
          )
        );
      },

      renderPrev: function () {
        var href = '#';

        if (this.props.id) {
          href += this.props.id;
        }

        return (
          React.DOM.a( {className:"left carousel-control", href:href, key:0, onClick:this.prev}, 
            React.DOM.span( {className:"glyphicon glyphicon-chevron-left"})
          )
        );
      },

      renderNext: function () {
        var href = '#';

        if (this.props.id) {
          href += this.props.id;
        }

        return (
          React.DOM.a( {className:"right carousel-control", href:href, key:1, onClick:this.next}, 
            React.DOM.span( {className:"glyphicon glyphicon-chevron-right"})
          )
        );
      },

      renderControls: function () {
        var activeIndex = this.getActiveIndex();

        return [
          (this.props.wrap || activeIndex !== 0) ? this.renderPrev() : null,
          (this.props.wrap || activeIndex !== this.getNumberOfItems() - 1) ?
            this.renderNext() : null
        ];
      },

      renderIndicator: function (child, i) {
        var className = (i === this.getActiveIndex()) ?
          'active' : null;

        return [
          React.DOM.li(
            {key:i,
            className:className,
            onClick:this.handleSelect.bind(this, i, null)} ),
          ' '
        ];
      },

      renderIndicators: function () {
        return (
          React.DOM.ol( {className:"carousel-indicators"}, 
            utils.modifyChildren(this.props.children, this.renderIndicator)
          )
        );
      },

      getActiveIndex: function () {
        return this.props.activeIndex != null ? this.props.activeIndex : this.state.activeIndex;
      },

      handleItemAnimateOutEnd: function () {
        this.sliding = false;

        this.setState({
          previousActiveIndex: null,
          direction: null
        });

        this.waitForNext();
      },

      renderItem: function (child, i) {
        var activeIndex = this.getActiveIndex(),
            isActive = (i === activeIndex),
            isPreviousActive = this.state.previousActiveIndex != null &&
                this.state.previousActiveIndex === i && this.props.slide;

        return utils.cloneWithProps(
            child,
            {
              active: isActive,
              ref: child.props.ref,
              key: child.props.key != null ?
                child.props.key : i,
              index: i,
              animateOut: isPreviousActive,
              animateIn: isActive && this.state.previousActiveIndex != null && this.props.slide,
              direction: this.state.direction,
              onAnimateOutEnd: isPreviousActive ? this.handleItemAnimateOutEnd: null
            }
          );
      },

      shouldComponentUpdate: function() {
        // Defer any updates to this component during the `onSelect` handler.
        return !this._isChanging;
      },

      handleSelect: function (index, direction) {
        var previousActiveIndex;

        if (this.sliding) {
          return;
        }

        this.sliding = true;

        if (this.props.onSelect) {
          this._isChanging = true;
          this.props.onSelect(index, direction);
          this._isChanging = false;
        }

        if (this.props.activeIndex == null && index !== this.getActiveIndex()) {
          previousActiveIndex = this.getActiveIndex();
          this.setState({
            activeIndex: index,
            previousActiveIndex: previousActiveIndex,
            direction: direction || this.getDirection(previousActiveIndex, index)
          });

          if (!this.props.slide) {
            this.waitForNext();
          }
        }
      }
    });

    __exports__["default"] = Carousel;
  });
define('Carousel',['./transpiled/Carousel'], function (Carousel) {
  return Carousel['default'];
});
define(
  'transpiled/react-es6/lib/ExecutionEnvironment',["exports"],
  function(__exports__) {
    
    /**
     * Copyright 2013-2014 Facebook, Inc.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     *
     * @providesModule ExecutionEnvironment
     */

    /*jslint evil: true */

    

    var canUseDOM = typeof window !== 'undefined';

    /**
     * Simple, lightweight module assisting with the detection and context of
     * Worker. Helps avoid circular dependencies and allows code to reason about
     * whether or not they are in a Worker, even if they never include the main
     * `ReactWorker` dependency.
     */
    var ExecutionEnvironment = {

      canUseDOM: canUseDOM,

      canUseWorkers: typeof Worker !== 'undefined',

      canUseEventListeners:
        canUseDOM && (window.addEventListener || window.attachEvent),

      isInWorker: !canUseDOM // For now, this is true - might change in the future.

    };

    __exports__["default"] = ExecutionEnvironment;
  });
define(
  'transpiled/react-es6/lib/ReactTransitionEvents',["./ExecutionEnvironment","exports"],
  function(__dependency1__, __exports__) {
    
    /**
     * Copyright 2013-2014 Facebook, Inc.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     *
     * @providesModule ReactTransitionEvents
     */

    

    var ExecutionEnvironment = __dependency1__["default"];

    var EVENT_NAME_MAP = {
      transitionend: {
        'transition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'mozTransitionEnd',
        'OTransition': 'oTransitionEnd',
        'msTransition': 'MSTransitionEnd'
      },

      animationend: {
        'animation': 'animationend',
        'WebkitAnimation': 'webkitAnimationEnd',
        'MozAnimation': 'mozAnimationEnd',
        'OAnimation': 'oAnimationEnd',
        'msAnimation': 'MSAnimationEnd'
      }
    };

    var endEvents = [];

    function detectEvents() {
      var testEl = document.createElement('div');
      var style = testEl.style;
      for (var baseEventName in EVENT_NAME_MAP) {
        var baseEvents = EVENT_NAME_MAP[baseEventName];
        for (var styleName in baseEvents) {
          if (styleName in style) {
            endEvents.push(baseEvents[styleName]);
            break;
          }
        }
      }
    }

    if (ExecutionEnvironment.canUseDOM) {
      detectEvents();
    }

    // We use the raw {add|remove}EventListener() call because EventListener
    // does not know how to remove event listeners and we really should
    // clean up. Also, these events are not triggered in older browsers
    // so we should be A-OK here.

    function addEventListener(node, eventName, eventListener) {
      node.addEventListener(eventName, eventListener, false);
    }

    function removeEventListener(node, eventName, eventListener) {
      node.removeEventListener(eventName, eventListener, false);
    }

    var ReactTransitionEvents = {
      addEndEventListener: function(node, eventListener) {
        if (endEvents.length === 0) {
          // If CSS transitions are not supported, trigger an "end animation"
          // event immediately.
          window.setTimeout(eventListener, 0);
          return;
        }
        endEvents.forEach(function(endEvent) {
          addEventListener(node, endEvent, eventListener);
        });
      },

      removeEndEventListener: function(node, eventListener) {
        if (endEvents.length === 0) {
          return;
        }
        endEvents.forEach(function(endEvent) {
          removeEventListener(node, endEvent, eventListener);
        });
      }
    };

    __exports__["default"] = ReactTransitionEvents;
  });
define(
  'transpiled/CarouselItem',["./react-es6","./react-es6/lib/cx","./react-es6/lib/ReactTransitionEvents","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var ReactTransitionEvents = __dependency3__["default"];

    var CarouselItem = React.createClass({displayName: 'CarouselItem',
      propTypes: {
        direction: React.PropTypes.oneOf(['prev', 'next']),
        onAnimateOutEnd: React.PropTypes.func,
        active: React.PropTypes.bool,
        caption: React.PropTypes.renderable
      },

      getInitialState: function () {
        return {
          direction: null
        };
      },

      getDefaultProps: function () {
        return {
          animation: true
        };
      },

      handleAnimateOutEnd: function () {
        if (typeof this.props.onAnimateOutEnd === 'function') {
          this.props.onAnimateOutEnd(this.props.index);
        }
      },

      componentWillReceiveProps: function (nextProps) {
        if (this.props.active !== nextProps.active) {
          this.setState({
            direction: null
          });
        }
      },

      componentDidUpdate: function (prevProps) {
        if (!this.props.active && prevProps.active) {
          ReactTransitionEvents.addEndEventListener(
            this.getDOMNode(),
            this.handleAnimateOutEnd
          );
        }

        if (this.props.active !== prevProps.active) {
          setTimeout(this.startAnimation, 20);
        }
      },

      startAnimation: function () {
        this.setState({
          direction: this.props.direction === 'prev' ?
            'right' : 'left'
        });
      },

      render: function () {
        var classes = {
          item: true,
          active: (this.props.active && !this.props.animateIn) || this.props.animateOut,
          next: this.props.active && this.props.animateIn && this.props.direction === 'next',
          prev: this.props.active && this.props.animateIn && this.props.direction === 'prev'
        };

        if (this.state.direction && (this.props.animateIn || this.props.animateOut)) {
          classes[this.state.direction] = true;
        }

        return this.transferPropsTo(
          React.DOM.div( {className:classSet(classes)}, 
            this.props.children,
            this.props.caption ? this.renderCaption() : null
          )
        );
      },

      renderCaption: function () {
        return (
          React.DOM.div( {className:"carousel-caption"}, 
            this.props.caption
          )
        );
      }
    });

    __exports__["default"] = CarouselItem;
  });
define('CarouselItem',['./transpiled/CarouselItem'], function (CarouselItem) {
  return CarouselItem['default'];
});
define(
  'transpiled/PropTypes',["./react-es6","exports"],
  function(__dependency1__, __exports__) {
    
    var React = __dependency1__["default"];

    __exports__["default"] = {
      componentClass: function (props, propName, componentName) {
        return React.isValidClass(props[propName]);
      }
    };
  });
define(
  'transpiled/Col',["./react-es6","./react-es6/lib/cx","./PropTypes","./constants","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var PropTypes = __dependency3__["default"];
    var constants = __dependency4__["default"];


    var Col = React.createClass({displayName: 'Col',
      propTypes: {
        xs: React.PropTypes.number,
        sm: React.PropTypes.number,
        md: React.PropTypes.number,
        lg: React.PropTypes.number,
        xsOffset: React.PropTypes.number,
        smOffset: React.PropTypes.number,
        mdOffset: React.PropTypes.number,
        lgOffset: React.PropTypes.number,
        xsPush: React.PropTypes.number,
        smPush: React.PropTypes.number,
        mdPush: React.PropTypes.number,
        lgPush: React.PropTypes.number,
        xsPull: React.PropTypes.number,
        smPull: React.PropTypes.number,
        mdPull: React.PropTypes.number,
        lgPull: React.PropTypes.number,
        componentClass: PropTypes.componentClass
      },

      getDefaultProps: function () {
        return {
          componentClass: React.DOM.div
        };
      },

      render: function () {
        var componentClass = this.props.componentClass;
        var classes = {};

        Object.keys(constants.SIZES).forEach(function (key) {
          var size = constants.SIZES[key];
          var prop = size;
          var classPart = size + '-';

          if (this.props[prop]) {
            classes['col-' + classPart + this.props[prop]] = true;
          }

          prop = size + 'Offset';
          classPart = size + '-offset-';
          if (this.props[prop]) {
            classes['col-' + classPart + this.props[prop]] = true;
          }

          prop = size + 'Push';
          classPart = size + '-push-';
          if (this.props[prop]) {
            classes['col-' + classPart + this.props[prop]] = true;
          }

          prop = size + 'Pull';
          classPart = size + '-pull-';
          if (this.props[prop]) {
            classes['col-' + classPart + this.props[prop]] = true;
          }
        }, this);

        return this.transferPropsTo(
          componentClass( {className:classSet(classes)}, 
            this.props.children
          )
        );
      }
    });

    __exports__["default"] = Col;
  });
define('Col',['./transpiled/Col'], function (Col) {
  return Col['default'];
});
define(
  'transpiled/CollapsableMixin',["./react-es6/lib/ReactTransitionEvents","exports"],
  function(__dependency1__, __exports__) {
    
    var ReactTransitionEvents = __dependency1__["default"];

    var CollapsableMixin = {

      getInitialState: function() {
        return {
          isOpen: this.props.defaultOpen != null ? this.props.defaultOpen : null,
          isCollapsing: false
        };
      },

      handleTransitionEnd: function () {
        this._collapseEnd = true;
        this.setState({
          isCollapsing: false
        });
      },

      componentWillReceiveProps: function (newProps) {
        if (this.props.isCollapsable && newProps.isOpen !== this.props.isOpen) {
          this._collapseEnd = false;
          this.setState({
            isCollapsing: true
          });
        }
      },

      _addEndTransitionListener: function () {
        var node = this.getCollapsableDOMNode();

        if (node) {
          ReactTransitionEvents.addEndEventListener(
            node,
            this.handleTransitionEnd
          );
        }
      },

      _removeEndTransitionListener: function () {
        var node = this.getCollapsableDOMNode();

        if (node) {
          ReactTransitionEvents.addEndEventListener(
            node,
            this.handleTransitionEnd
          );
        }
      },

      componentDidMount: function () {
        this._afterRender();
      },

      componentWillUnmount: function () {
        this._removeEndTransitionListener();
      },

      componentWillUpdate: function (nextProps) {
        var dimension = (typeof this.getCollapsableDimension === 'function') ?
          this.getCollapsableDimension() : 'height';
        var node = this.getCollapsableDOMNode();

        this._removeEndTransitionListener();
        if (node && nextProps.isOpen !== this.props.isOpen && this.props.isOpen) {
          node.style[dimension] = this.getCollapsableDimensionValue() + 'px';
        }
      },

      componentDidUpdate: function () {
        this._afterRender();
      },

      _afterRender: function () {
        if (!this.props.isCollapsable) {
          return;
        }

        this._addEndTransitionListener();
        setTimeout(this._updateDimensionAfterRender, 0);
      },

      _updateDimensionAfterRender: function () {
        var dimension = (typeof this.getCollapsableDimension === 'function') ?
          this.getCollapsableDimension() : 'height';
        var node = this.getCollapsableDOMNode();

        if (node) {
          node.style[dimension] = this.isOpen() ?
            this.getCollapsableDimensionValue() + 'px' : '0px';
        }
      },

      isOpen: function () {
        return (this.props.isOpen != null) ? this.props.isOpen : this.state.isOpen;
      },

      getCollapsableClassSet: function (className) {
        var classes = {};

        if (typeof className === 'string') {
          className.split(' ').forEach(function (className) {
            if (className) {
              classes[className] = true;
            }
          });
        }

        classes.collapsing = this.state.isCollapsing;
        classes.collapse = !this.state.isCollapsing;
        classes['in'] = this.isOpen() && !this.state.isCollapsing;

        return classes;
      }
    };

    __exports__["default"] = CollapsableMixin;
  });
define('CollapsableMixin',['./transpiled/CollapsableMixin'], function (CollapsableMixin) {
  return CollapsableMixin['default'];
});
define(
  'transpiled/DropdownStateMixin',["./react-es6","exports"],
  function(__dependency1__, __exports__) {
    
    var React = __dependency1__["default"];

    var DropdownStateMixin = {
      getInitialState: function () {
        return {
          open: false
        };
      },

      setDropdownState: function (newState, onStateChangeComplete) {
        if (newState) {
          this.bindRootCloseHandlers();
        } else {
          this.unbindRootCloseHandlers();
        }

        this.setState({
          open: newState
        }, onStateChangeComplete);
      },

      handleKeyUp: function (e) {
        if (e.keyCode === 27) {
          this.setDropdownState(false);
        }
      },

      handleClickOutside: function () {
        this.setDropdownState(false);
      },

      bindRootCloseHandlers: function () {
        document.addEventListener('click', this.handleClickOutside);
        document.addEventListener('keyup', this.handleKeyUp);
      },

      unbindRootCloseHandlers: function () {
        document.removeEventListener('click', this.handleClickOutside);
        document.removeEventListener('keyup', this.handleKeyUp);
      },

      componentWillUnmount: function () {
        this.unbindRootCloseHandlers();
      }
    };

    __exports__["default"] = DropdownStateMixin;
  });
define(
  'transpiled/DropdownMenu',["./react-es6","./react-es6/lib/cx","./utils","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var utils = __dependency3__["default"];

    var DropdownMenu = React.createClass({displayName: 'DropdownMenu',
      propTypes: {
        pullRight: React.PropTypes.bool,
        onSelect: React.PropTypes.func
      },

      render: function () {
        var classes = {
            'dropdown-menu': true,
            'dropdown-menu-right': this.props.pullRight
          };

        return this.transferPropsTo(
            React.DOM.ul(
              {className:classSet(classes),
              role:"menu"}, 
              utils.modifyChildren(this.props.children, this.renderMenuItem)
            )
          );
      },

      renderMenuItem: function (child) {
        return utils.cloneWithProps(
          child,
          {
            // Capture onSelect events
            onSelect: utils.createChainedFunction(child.props.onSelect, this.props.onSelect),

            // Force special props to be transferred
            key: child.props.key,
            ref: child.props.ref
          }
        );
      }
    });

    __exports__["default"] = DropdownMenu;
  });
define(
  'transpiled/DropdownButton',["./react-es6","./react-es6/lib/cx","./BootstrapMixin","./DropdownStateMixin","./Button","./ButtonGroup","./DropdownMenu","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];
    var DropdownStateMixin = __dependency4__["default"];
    var Button = __dependency5__["default"];
    var ButtonGroup = __dependency6__["default"];
    var DropdownMenu = __dependency7__["default"];


    var DropdownButton = React.createClass({displayName: 'DropdownButton',
      mixins: [BootstrapMixin, DropdownStateMixin],

      propTypes: {
        pullRight:    React.PropTypes.bool,
        title:    React.PropTypes.renderable,
        href:     React.PropTypes.string,
        onClick:  React.PropTypes.func,
        onSelect: React.PropTypes.func,
        navItem:  React.PropTypes.bool
      },

      render: function () {
        var className = this.props.className ?
          this.props.className + ' dropdown-toggle' : 'dropdown-toggle';

        var renderMethod = this.props.navItem ?
          'renderNavItem' : 'renderButtonGroup';

        return this[renderMethod]([
          Button(
            {ref:"dropdownButton",
            href:this.props.href,
            bsStyle:this.props.bsStyle,
            className:className,
            onClick:this.handleOpenClick,
            id:this.props.id,
            key:0,
            navDropdown:this.props.navItem}, 
            this.props.title,' ',
            React.DOM.span( {className:"caret"} )
          ),
          DropdownMenu(
            {ref:"menu",
            'aria-labelledby':this.props.id,
            onSelect:this.handleOptionSelect,
            pullRight:this.props.pullRight,
            key:1}, 
            this.props.children
          )
        ]);
      },

      renderButtonGroup: function (children) {
        var groupClasses = {
            'open': this.state.open,
            'dropup': this.props.dropup
          };

        return (
          ButtonGroup(
            {bsSize:this.props.bsSize,
            className:classSet(groupClasses)}, 
            children
          )
        );
      },

      renderNavItem: function (children) {
        var classes = {
            'dropdown': true,
            'open': this.state.open,
            'dropup': this.props.dropup
          };

        return (
          React.DOM.li( {className:classSet(classes)}, 
            children
          )
        );
      },

      handleOpenClick: function (e) {
        this.setDropdownState(true);

        e.preventDefault();
      },

      handleOptionSelect: function (key) {
        if (this.props.onSelect) {
          this.props.onSelect(key);
        }

        this.setDropdownState(false);
      }
    });

    __exports__["default"] = DropdownButton;
  });
define('DropdownButton',['./transpiled/DropdownButton'], function (DropdownButton) {
  return DropdownButton['default'];
});
define('DropdownMenu',['./transpiled/DropdownMenu'], function (DropdownMenu) {
  return DropdownMenu['default'];
});
define('DropdownStateMixin',['./transpiled/DropdownStateMixin'], function (DropdownStateMixin) {
  return DropdownStateMixin['default'];
});
define(
  'transpiled/FadeMixin',["./react-es6","exports"],
  function(__dependency1__, __exports__) {
    
    var React = __dependency1__["default"];

    // TODO: listen for onTransitionEnd to remove el
    __exports__["default"] = {
      _fadeIn: function () {
        var els;

        if (this.isMounted()) {
          els = this.getDOMNode().querySelectorAll('.fade');
          if (els.length) {
            Array.prototype.forEach.call(els, function (el) {
              el.className += ' in';
            });
          }
        }
      },

      _fadeOut: function () {
        var els = this._fadeOutEl.querySelectorAll('.fade.in');

        if (els.length) {
          Array.prototype.forEach.call(els, function (el) {
            el.className = el.className.replace(/\bin\b/, '');
          });
        }

        setTimeout(this._handleFadeOutEnd, 300);
      },

      _handleFadeOutEnd: function () {
        if (this._fadeOutEl && this._fadeOutEl.parentNode) {
          this._fadeOutEl.parentNode.removeChild(this._fadeOutEl);
        }
      },

      componentDidMount: function () {
        if (document.querySelectorAll) {
          // Firefox needs delay for transition to be triggered
          setTimeout(this._fadeIn, 20);
        }
      },

      componentWillUnmount: function () {
        var els = this.getDOMNode().querySelectorAll('.fade');
        if (els.length) {
          this._fadeOutEl = document.createElement('div');
          document.body.appendChild(this._fadeOutEl);
          this._fadeOutEl.innerHTML = this.getDOMNode().innerHTML;
          // Firefox needs delay for transition to be triggered
          setTimeout(this._fadeOut, 20);
        }
      }
    };
  });
define('FadeMixin',['./transpiled/FadeMixin'], function (FadeMixin) {
  return FadeMixin['default'];
});
define(
  'transpiled/Glyphicon',["./react-es6","./react-es6/lib/cx","./BootstrapMixin","./constants","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];
    var constants = __dependency4__["default"];

    var Glyphicon = React.createClass({displayName: 'Glyphicon',
      mixins: [BootstrapMixin],

      propTypes: {
        glyph: React.PropTypes.oneOf(constants.GLYPHS).isRequired
      },

      getDefaultProps: function () {
        return {
          bsClass: 'glyphicon'
        };
      },

      render: function () {
        var classes = this.getBsClassSet();

        classes['glyphicon-' + this.props.glyph] = true;

        return this.transferPropsTo(
          React.DOM.span( {className:classSet(classes)}, 
            this.props.children
          )
        );
      }
    });

    __exports__["default"] = Glyphicon;
  });
define('Glyphicon',['./transpiled/Glyphicon'], function (Glyphicon) {
  return Glyphicon['default'];
});
define(
  'transpiled/Grid',["./react-es6","./PropTypes","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var PropTypes = __dependency2__["default"];


    var Grid = React.createClass({displayName: 'Grid',
      propTypes: {
        fluid: React.PropTypes.bool,
        componentClass: PropTypes.componentClass
      },

      getDefaultProps: function () {
        return {
          componentClass: React.DOM.div
        };
      },

      render: function () {
        var componentClass = this.props.componentClass;

        return this.transferPropsTo(
          componentClass( {className:this.props.fluid ? 'container-fluid' : 'container'}, 
            this.props.children
          )
        );
      }
    });

    __exports__["default"] = Grid;
  });
define('Grid',['./transpiled/Grid'], function (Grid) {
  return Grid['default'];
});
define(
  'transpiled/Input',["./react-es6","./react-es6/lib/cx","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];

    var INPUT_TYPES = [
      'text',
      'password',
      'datetime',
      'datetime-local',
      'date',
      'month',
      'time',
      'week',
      'number',
      'email',
      'url',
      'search',
      'tel',
      'color'
    ];

    var Input = React.createClass({displayName: 'Input',
      propTypes: {
        name: React.PropTypes.string.isRequired,
        type: React.PropTypes.oneOf(INPUT_TYPES).isRequired,
        id: React.PropTypes.string,
        className: React.PropTypes.string,
        placeholder: React.PropTypes.string,
        label: React.PropTypes.string,
        required: React.PropTypes.bool,
        oneOf: React.PropTypes.array
        //minLength: React.PropTypes.int
      },

      getInitialState: function () {
        return {
          error: false
        };
      },

      getValue: function () {
        return this.refs.input.getDOMNode().value;
      },

      renderInput: function () {
        var classes = {
          'form-control': true,
          'input-md': true
        };

        return (
          React.DOM.input(
            {id:this.props.id,
            type:this.props.type,
            className:classSet(classes),
            placeholder:this.props.placeholder,
            ref:"input"}
          )
        );
      },

      renderLabel: function () {
        return this.props.label ? React.DOM.label( {htmlFor:this.props.id}, this.props.label) : null;
      },

      render: function () {
        var classes = {
          'form-group': true,
          'has-error': !!this.state.error
        };

        return (
          React.DOM.div( {className:classSet(classes), onBlur:this.handleBlur, onFocus:this.handleFocus}, 
            this.renderInput(),
            this.renderLabel()
          )
        );
      },

      handleBlur: function (e) {
        var value = this.getValue();
        var error;

        if (this.props.required && !value) {
          error = 'required';
        } else if (this.props.oneOf && !(value in this.props.oneOf)) {
          error = 'oneOf';
        } else if (this.props.minLength && value.length < this.props.minLength) {
          error = 'minLength';
        }

        this.setState({
          error: error
        });
      },

      handleFocus: function(e) {
        this.setState({
          error: false
        });

        e.stopPropagation();
      }
    });

    __exports__["default"] = Input;
  });
define('Input',['./transpiled/Input'], function (Input) {
  return Input['default'];
});
define(
  'transpiled/Interpolate',["./react-es6","./react-es6/lib/invariant","./utils","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    
    // https://www.npmjs.org/package/react-interpolate-component
    

    var React = __dependency1__["default"];
    var invariant = __dependency2__["default"];
    var utils = __dependency3__["default"];

    function isString(object) {
      return Object.prototype.toString.call(object) === '[object String]';
    }

    var REGEXP = /\%\((.+?)\)s/;

    var Interpolate = React.createClass({
      displayName: 'Interpolate',

      getDefaultProps: function() {
        return { component: React.DOM.span };
      },

      render: function() {
        var format = this.props.children || this.props.format;
        var parent = this.props.component;
        var unsafe = this.props.unsafe === true;
        var props  = utils.extend({}, this.props);

        delete props.children;
        delete props.format;
        delete props.component;
        delete props.unsafe;

        invariant(isString(format), 'Interpolate expects either a format string as only child or a `format` prop with a string value');

        if (unsafe) {
          var content = format.split(REGEXP).reduce(function(memo, match, index) {
            var html;

            if (index % 2 === 0) {
              html = match;
            } else {
              html = props[match];
              delete props[match];
            }

            if (React.isValidComponent(html)) {
              throw new Error('cannot interpolate a React component into unsafe text');
            }

            memo += html;

            return memo;
          }, '');

          props.dangerouslySetInnerHTML = { __html: content };

          return parent(props);
        } else {
          var args = format.split(REGEXP).reduce(function(memo, match, index) {
            var child;

            if (index % 2 === 0) {
              if (match.length === 0) {
                return memo;
              }

              child = match;
            } else {
              child = props[match];
              delete props[match];
            }

            memo.push(child);

            return memo;
          }, [props]);

          return parent.apply(null, args);
        }
      }
    });

    __exports__["default"] = Interpolate;
  });
define('Interpolate',['./transpiled/Interpolate'], function (Interpolate) {
  return Interpolate['default'];
});
define(
  'transpiled/Jumbotron',["./react-es6","./react-es6/lib/cx","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];

    var Jumbotron = React.createClass({displayName: 'Jumbotron',

      render: function () {
        return this.transferPropsTo(
          React.DOM.div( {className:"jumbotron"}, 
            this.props.children
          )
        );
      }
    });

    __exports__["default"] = Jumbotron;
  });
define('Jumbotron',['./transpiled/Jumbotron'], function (Jumbotron) {
  return Jumbotron['default'];
});
define(
  'transpiled/Label',["./react-es6","./react-es6/lib/cx","./BootstrapMixin","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];

    var Label = React.createClass({displayName: 'Label',
      mixins: [BootstrapMixin],

      getDefaultProps: function () {
        return {
          bsClass: 'label',
          bsStyle: 'default'
        };
      },

      render: function () {
        var classes = this.getBsClassSet();

        return this.transferPropsTo(
          React.DOM.span( {className:classSet(classes)}, 
            this.props.children
          )
        );
      }
    });

    __exports__["default"] = Label;
  });
define('Label',['./transpiled/Label'], function (Label) {
  return Label['default'];
});
define(
  'transpiled/MenuItem',["./react-es6","./react-es6/lib/cx","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];

    var MenuItem = React.createClass({displayName: 'MenuItem',
      propTypes: {
        header:   React.PropTypes.bool,
        divider:  React.PropTypes.bool,
        href:     React.PropTypes.string,
        title:    React.PropTypes.string,
        onSelect: React.PropTypes.func
      },

      getDefaultProps: function () {
        return {
          href: '#'
        };
      },

      handleClick: function (e) {
        if (this.props.onSelect) {
          e.preventDefault();
          this.props.onSelect(this.props.key);
        }
      },

      renderAnchor: function () {
        return (
          React.DOM.a( {onClick:this.handleClick, href:this.props.href, title:this.props.title, tabIndex:"-1"}, 
            this.props.children
          )
        );
      },

      render: function () {
        var classes = {
            'dropdown-header': this.props.header,
            'divider': this.props.divider
          };

        var children = null;
        if (this.props.header) {
          children = this.props.children;
        } else if (!this.props.divider) {
          children = this.renderAnchor();
        }

        return this.transferPropsTo(
          React.DOM.li( {role:"presentation", title:null, href:null, className:classSet(classes)}, 
            children
          )
        );
      }
    });

    __exports__["default"] = MenuItem;
  });
define('MenuItem',['./transpiled/MenuItem'], function (MenuItem) {
  return MenuItem['default'];
});
define(
  'transpiled/Modal',["./react-es6","./react-es6/lib/cx","./BootstrapMixin","./FadeMixin","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];
    var FadeMixin = __dependency4__["default"];


    // TODO:
    // - aria-labelledby
    // - Add `modal-body` div if only one child passed in that doesn't already have it
    // - Tests

    var Modal = React.createClass({displayName: 'Modal',
      mixins: [BootstrapMixin, FadeMixin],

      propTypes: {
        title: React.PropTypes.renderable,
        backdrop: React.PropTypes.oneOf(['static', true, false]),
        keyboard: React.PropTypes.bool,
        closeButton: React.PropTypes.bool,
        animation: React.PropTypes.bool,
        onRequestHide: React.PropTypes.func.isRequired
      },

      getDefaultProps: function () {
        return {
          bsClass: 'modal',
          backdrop: true,
          keyboard: true,
          animation: true,
          closeButton: true
        };
      },

      render: function () {
        var modalStyle = {display: 'block'};
        var classes = this.getBsClassSet();

        classes['fade'] = this.props.animation;
        classes['in'] = !this.props.animation || !document.querySelectorAll;

        var modal = this.transferPropsTo(
          React.DOM.div(
            {title:null,
            tabIndex:"-1",
            role:"dialog",
            style:modalStyle,
            className:classSet(classes),
            ref:"modal"}, 
            React.DOM.div( {className:"modal-dialog"}, 
              React.DOM.div( {className:"modal-content"}, 
                this.props.title ? this.renderHeader() : null,
                this.props.children
              )
            )
          )
        );

        return this.props.backdrop ?
          this.renderBackdrop(modal) : modal;
      },

      renderBackdrop: function (modal) {
        var classes = {
          'modal-backdrop': true,
          'fade': this.props.animation
        };

        classes['in'] = !this.props.animation || !document.querySelectorAll;

        var onClick = this.props.backdrop === true ?
          this.handleBackdropClick : null;

        return (
          React.DOM.div(null, 
            React.DOM.div( {className:classSet(classes), ref:"backdrop", onClick:onClick} ),
            modal
          )
        );
      },

      renderHeader: function () {
        var closeButton;
        if (this.props.closeButton) {
          closeButton = (
              React.DOM.button( {type:"button", className:"close", 'aria-hidden':"true", onClick:this.props.onRequestHide}, "×")
            );
        }

        return (
          React.DOM.div( {className:"modal-header"}, 
            closeButton,
            this.renderTitle()
          )
        );
      },

      renderTitle: function () {
        return (
          React.isValidComponent(this.props.title) ?
            this.props.title : React.DOM.h4( {className:"modal-title"}, this.props.title)
        );
      },

      componentDidMount: function () {
        document.addEventListener('keyup', this.handleDocumentKeyUp);
      },

      componentWillUnmount: function () {
        document.removeEventListener('keyup', this.handleDocumentKeyUp);
      },

      handleBackdropClick: function (e) {
        if (e.target !== e.currentTarget) {
          return;
        }

        this.props.onRequestHide();
      },

      handleDocumentKeyUp: function (e) {
        if (this.props.keyboard && e.keyCode === 27) {
          this.props.onRequestHide();
        }
      }
    });

    __exports__["default"] = Modal;
  });
define('Modal',['./transpiled/Modal'], function (Modal) {
  return Modal['default'];
});
define(
  'transpiled/Nav',["./react-es6","./react-es6/lib/cx","./BootstrapMixin","./CollapsableMixin","./utils","./domUtils","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];
    var CollapsableMixin = __dependency4__["default"];
    var utils = __dependency5__["default"];
    var domUtils = __dependency6__["default"];


    var Nav = React.createClass({displayName: 'Nav',
      mixins: [BootstrapMixin, CollapsableMixin],

      propTypes: {
        bsStyle: React.PropTypes.oneOf(['tabs','pills']),
        stacked: React.PropTypes.bool,
        justified: React.PropTypes.bool,
        onSelect: React.PropTypes.func,
        isCollapsable: React.PropTypes.bool,
        isOpen: React.PropTypes.bool,
        navbar: React.PropTypes.bool
      },

      getDefaultProps: function () {
        return {
          bsClass: 'nav'
        };
      },

      getCollapsableDOMNode: function () {
        return this.getDOMNode();
      },

      getCollapsableDimensionValue: function () {
        var node = this.refs.ul.getDOMNode(),
            height = node.offsetHeight,
            computedStyles = domUtils.getComputedStyles(node);

        return height + parseInt(computedStyles.marginTop, 10) + parseInt(computedStyles.marginBottom, 10);
      },

      render: function () {
        var classes = this.props.isCollapsable ? this.getCollapsableClassSet() : {};

        classes['navbar-collapse'] = this.props.isCollapsable;

        if (this.props.navbar) {
          return this.renderUl();
        }

        return this.transferPropsTo(
          React.DOM.nav( {className:classSet(classes)}, 
            this.renderUl()
          )
        );
      },

      renderUl: function () {
        var classes = this.getBsClassSet();

        classes['nav-stacked'] = this.props.stacked;
        classes['nav-justified'] = this.props.justified;
        classes['navbar-nav'] = this.props.navbar;

        return (
          React.DOM.ul( {className:classSet(classes), ref:"ul"}, 
            utils.modifyChildren(this.props.children, this.renderNavItem)
          )
        );
      },

      getChildActiveProp: function (child) {
        if (child.props.active) {
          return true;
        }
        if (this.props.activeKey != null) {
          if (child.props.key === this.props.activeKey) {
            return true;
          }
        }
        if (this.props.activeHref != null) {
          if (child.props.href === this.props.activeHref) {
            return true;
          }
        }

        return child.props.active;
      },

      renderNavItem: function (child) {
        return utils.cloneWithProps(
          child,
          {
            active: this.getChildActiveProp(child),
            activeKey: this.props.activeKey,
            activeHref: this.props.activeHref,
            onSelect: utils.createChainedFunction(child.props.onSelect, this.props.onSelect),
            ref: child.props.ref,
            key: child.props.key,
            navItem: true
          }
        );
      }
    });

    __exports__["default"] = Nav;
  });
define('Nav',['./transpiled/Nav'], function (Nav) {
  return Nav['default'];
});
define(
  'transpiled/Navbar',["./react-es6","./react-es6/lib/cx","./BootstrapMixin","./PropTypes","./utils","./Nav","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];
    var PropTypes = __dependency4__["default"];
    var utils = __dependency5__["default"];
    var Nav = __dependency6__["default"];


    var Navbar = React.createClass({displayName: 'Navbar',
      mixins: [BootstrapMixin],

      propTypes: {
        fixedTop: React.PropTypes.bool,
        fixedBottom: React.PropTypes.bool,
        staticTop: React.PropTypes.bool,
        inverse: React.PropTypes.bool,
        role: React.PropTypes.string,
        componentClass: PropTypes.componentClass,
        brand: React.PropTypes.renderable,
        toggleButton: React.PropTypes.renderable,
        onToggle: React.PropTypes.func,
        fluid: React.PropTypes.func
      },

      getDefaultProps: function () {
        return {
          bsClass: 'navbar',
          bsStyle: 'default',
          role: 'navigation',
          componentClass: React.DOM.nav
        };
      },

      getInitialState: function () {
        return {
          navOpen: this.props.defaultNavOpen
        };
      },

      shouldComponentUpdate: function() {
        // Defer any updates to this component during the `onSelect` handler.
        return !this._isChanging;
      },

      handleToggle: function () {
        if (this.props.onToggle) {
          this._isChanging = true;
          this.props.onToggle();
          this._isChanging = false;
        }

        this.setState({
          navOpen: !this.state.navOpen
        });
      },

      isNavOpen: function () {
        return this.props.navOpen != null ? this.props.navOpen : this.state.navOpen;
      },

      render: function () {
        var classes = this.getBsClassSet();
        var componentClass = this.props.componentClass;

        classes['navbar-fixed-top'] = this.props.fixedTop;
        classes['navbar-fixed-bottom'] = this.props.fixedBottom;
        classes['navbar-static-top'] = this.props.staticTop;
        classes['navbar-inverse'] = this.props.inverse;

        return this.transferPropsTo(
          componentClass( {className:classSet(classes)}, 
            React.DOM.div( {className:this.props.fluid ? 'container-fluid' : 'container'}, 
              (this.props.brand || this.props.toggleButton || this.props.toggleNavKey) ? this.renderHeader() : null,
              React.Children.map(this.props.children, this.renderChild)
            )
          )
        );
      },

      renderChild: function (child) {
        return utils.cloneWithProps(child, {
          navbar: true,
          isCollapsable: this.props.toggleNavKey != null && this.props.toggleNavKey === child.props.key,
          isOpen: this.props.toggleNavKey != null && this.props.toggleNavKey === child.props.key && this.isNavOpen(),
          key: child.props.key,
          ref: child.props.ref
        });
      },

      renderHeader: function () {
        var brand;

        if (this.props.brand) {
          brand = React.isValidComponent(this.props.brand) ?
            utils.cloneWithProps(this.props.brand, {
              className: 'navbar-brand'
            }) : React.DOM.span( {className:"navbar-brand"}, this.props.brand);
        }

        return (
          React.DOM.div( {className:"navbar-header"}, 
            brand,
            (this.props.toggleButton || this.props.toggleNavKey != null) ? this.renderToggleButton() : null
          )
        );
      },

      renderToggleButton: function () {
        var children;

        if (React.isValidComponent(this.props.toggleButton)) {
          return utils.cloneWithProps(this.props.toggleButton, {
            className: 'navbar-toggle',
            onClick: utils.createChainedFunction(this.handleToggle, this.props.toggleButton.props.onClick)
          });
        }

        children = (this.props.toggleButton != null) ?
          this.props.toggleButton : [
            React.DOM.span( {className:"sr-only", key:0}, "Toggle navigation"),
            React.DOM.span( {className:"icon-bar", key:1}),
            React.DOM.span( {className:"icon-bar", key:2}),
            React.DOM.span( {className:"icon-bar", key:3})
        ];

        return (
          React.DOM.button( {className:"navbar-toggle", type:"button", onClick:this.handleToggle}, 
            children
          )
        );
      }
    });

    __exports__["default"] = Navbar;
  });
define('Navbar',['./transpiled/Navbar'], function (Navbar) {
  return Navbar['default'];
});
define(
  'transpiled/NavItem',["./react-es6","./react-es6/lib/cx","./BootstrapMixin","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];

    var NavItem = React.createClass({displayName: 'NavItem',
      mixins: [BootstrapMixin],

      propTypes: {
        onSelect: React.PropTypes.func,
        active: React.PropTypes.bool,
        disabled: React.PropTypes.bool,
        href: React.PropTypes.string,
        title: React.PropTypes.string
      },

      getDefaultProps: function () {
        return {
          href: '#'
        };
      },

      render: function () {
        var classes = {
          'active': this.props.active,
          'disabled': this.props.disabled
        };

        return this.transferPropsTo(
          React.DOM.li( {className:classSet(classes)}, 
            React.DOM.a(
              {href:this.props.href,
              title:this.props.title,
              onClick:this.handleClick,
              ref:"anchor"}, 
              this.props.children
            )
          )
        );
      },

      handleClick: function (e) {
        if (this.props.onSelect) {
          e.preventDefault();

          if (!this.props.disabled) {
            this.props.onSelect(this.props.key,this.props.href);
          }
        }
      }
    });

    __exports__["default"] = NavItem;
  });
define('NavItem',['./transpiled/NavItem'], function (NavItem) {
  return NavItem['default'];
});
define(
  'transpiled/OverlayMixin',["./react-es6","exports"],
  function(__dependency1__, __exports__) {
    
    var React = __dependency1__["default"];

    __exports__["default"] = {
      propTypes: {
        container: React.PropTypes.object.isRequired
      },

      getDefaultProps: function () {
        return {
          container: typeof document !== 'undefined' ? document.body : null
        };
      },

      componentWillUnmount: function () {
        this._unrenderOverlay();
        this.getContainerDOMNode()
          .removeChild(this._overlayTarget);
        this._overlayTarget = null;
      },

      componentDidUpdate: function () {
        this._renderOverlay();
      },

      componentDidMount: function () {
        this._renderOverlay();
      },

      _mountOverlayTarget: function () {
        this._overlayTarget = document.createElement('div');
        this.getContainerDOMNode()
          .appendChild(this._overlayTarget);
      },

      _renderOverlay: function () {
        if (!this._overlayTarget) {
          this._mountOverlayTarget();
        }

        // Save reference to help testing
        this._overlayInstance = React.renderComponent(this.renderOverlay(), this._overlayTarget);
      },

      _unrenderOverlay: function () {
        React.unmountComponentAtNode(this._overlayTarget);
        this._overlayInstance = null;
      },

      getOverlayDOMNode: function() {
        if (!this.isMounted()) {
          throw new Error('getOverlayDOMNode(): A component must be mounted to have a DOM node.');
        }

        return this._overlayInstance.getDOMNode();
      },

      getContainerDOMNode: function() {
        return React.isValidComponent(this.props.container) ?
          this.props.container.getDOMNode() : this.props.container;
      }
    };
  });
define(
  'transpiled/ModalTrigger',["./react-es6","./react-es6/lib/cloneWithProps","./OverlayMixin","./utils","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var cloneWithProps = __dependency2__["default"];
    var OverlayMixin = __dependency3__["default"];
    var utils = __dependency4__["default"];

    var ModalTrigger = React.createClass({displayName: 'ModalTrigger',
      mixins: [OverlayMixin],

      propTypes: {
        modal: React.PropTypes.renderable.isRequired
      },

      getInitialState: function () {
        return {
          isOverlayShown: false
        };
      },

      show: function () {
        this.setState({
          isOverlayShown: true
        });
      },

      hide: function () {
        this.setState({
          isOverlayShown: false
        });
      },

      toggle: function () {
        this.setState({
          isOverlayShown: !this.state.isOverlayShown
        });
      },

      renderOverlay: function () {
        if (!this.state.isOverlayShown) {
          return React.DOM.span(null );
        }

        return cloneWithProps(
          this.props.modal,
          {
            onRequestHide: this.hide
          }
        );
      },

      render: function () {
        var child = React.Children.only(this.props.children);
        return cloneWithProps(
          child,
          {
            onClick: utils.createChainedFunction(child.props.onClick, this.toggle)
          }
        );
      }
    });

    __exports__["default"] = ModalTrigger;
  });
define('ModalTrigger',['./transpiled/ModalTrigger'], function (ModalTrigger) {
  return ModalTrigger['default'];
});
define(
  'transpiled/OverlayTrigger',["./react-es6","./react-es6/lib/cloneWithProps","./react-es6/lib/merge","./OverlayMixin","./domUtils","./utils","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var cloneWithProps = __dependency2__["default"];
    var merge = __dependency3__["default"];
    var OverlayMixin = __dependency4__["default"];
    var domUtils = __dependency5__["default"];
    var utils = __dependency6__["default"];

    /**
     * Check if value one is inside or equal to the of value
     *
     * @param {string} one
     * @param {string|array} of
     * @returns {boolean}
     */
    function isOneOf(one, of) {
      if (Array.isArray(of)) {
        return of.indexOf(one) >= 0;
      }
      return one === of;
    }

    var OverlayTrigger = React.createClass({displayName: 'OverlayTrigger',
      mixins: [OverlayMixin],

      propTypes: {
        trigger: React.PropTypes.oneOfType([
          React.PropTypes.oneOf(['manual', 'click', 'hover', 'focus']),
          React.PropTypes.arrayOf(React.PropTypes.oneOf(['click', 'hover', 'focus']))
        ]),
        placement: React.PropTypes.oneOf(['top','right', 'bottom', 'left']),
        delay: React.PropTypes.number,
        delayShow: React.PropTypes.number,
        delayHide: React.PropTypes.number,
        defaultOverlayShown: React.PropTypes.bool,
        overlay: React.PropTypes.renderable.isRequired
      },

      getDefaultProps: function () {
        return {
          placement: 'right',
          trigger: ['hover', 'focus']
        };
      },

      getInitialState: function () {
        return {
          isOverlayShown: this.props.defaultOverlayShown == null ?
            false : this.props.defaultOverlayShown,
          overlayLeft: null,
          overlayTop: null
        };
      },

      show: function () {
        this.setState({
          isOverlayShown: true
        }, function() {
          this.updateOverlayPosition();
        });
      },

      hide: function () {
        this.setState({
          isOverlayShown: false
        });
      },

      toggle: function () {
        this.state.isOverlayShown ?
          this.hide() : this.show();
      },

      renderOverlay: function () {
        if (!this.state.isOverlayShown) {
          return React.DOM.span(null );
        }

        return cloneWithProps(
          this.props.overlay,
          {
            onRequestHide: this.hide,
            placement: this.props.placement,
            positionLeft: this.state.overlayLeft,
            positionTop: this.state.overlayTop
          }
        );
      },

      render: function () {
        var props = {};

        if (isOneOf('click', this.props.trigger)) {
          props.onClick = utils.createChainedFunction(this.toggle, this.props.onClick);
        }

        if (isOneOf('hover', this.props.trigger)) {
          props.onMouseOver = utils.createChainedFunction(this.handleDelayedShow, this.props.onMouseOver);
          props.onMouseOut = utils.createChainedFunction(this.handleDelayedHide, this.props.onMouseOut);
        }

        if (isOneOf('focus', this.props.trigger)) {
          props.onFocus = utils.createChainedFunction(this.handleDelayedShow, this.props.onFocus);
          props.onBlur = utils.createChainedFunction(this.handleDelayedHide, this.props.onBlur);
        }

        return cloneWithProps(
          React.Children.only(this.props.children),
          props
        );
      },

      componentWillUnmount: function() {
        clearTimeout(this._hoverDelay);
      },

      handleDelayedShow: function () {
        if (this._hoverDelay != null) {
          clearTimeout(this._hoverDelay);
          this._hoverDelay = null;
          return;
        }

        var delay = this.props.delayShow != null ?
          this.props.delayShow : this.props.delay;

        if (!delay) {
          this.show();
          return;
        }

        this._hoverDelay = setTimeout(function() {
          this._hoverDelay = null;
          this.show();
        }.bind(this), delay);
      },

      handleDelayedHide: function () {
        if (this._hoverDelay != null) {
          clearTimeout(this._hoverDelay);
          this._hoverDelay = null;
          return;
        }

        var delay = this.props.delayHide != null ?
          this.props.delayHide : this.props.delay;

        if (!delay) {
          this.hide();
          return;
        }

        this._hoverDelay = setTimeout(function() {
          this._hoverDelay = null;
          this.hide();
        }.bind(this), delay);
      },

      updateOverlayPosition: function () {
        if (!this.isMounted()) {
          return;
        }

        var pos = this.calcOverlayPosition();

        this.setState({
          overlayLeft: pos.left,
          overlayTop: pos.top
        });
      },

      calcOverlayPosition: function () {
        var childOffset = this.getPosition();

        var overlayNode = this.getOverlayDOMNode();
        var overlayHeight = overlayNode.offsetHeight;
        var overlayWidth = overlayNode.offsetWidth;

        switch (this.props.placement) {
          case 'right':
            return {
              top: childOffset.top + childOffset.height / 2 - overlayHeight / 2,
              left: childOffset.left + childOffset.width
            };
          case 'left':
            return {
              top: childOffset.top + childOffset.height / 2 - overlayHeight / 2,
              left: childOffset.left - overlayWidth
            };
          case 'top':
            return {
              top: childOffset.top - overlayHeight,
              left: childOffset.left + childOffset.width / 2 - overlayWidth / 2
            };
          case 'bottom':
            return {
              top: childOffset.top + childOffset.height,
              left: childOffset.left + childOffset.width / 2 - overlayWidth / 2
            };
          default:
            throw new Error('calcOverlayPosition(): No such placement of "' + this.props.placement + '" found.');
        }
      },

      getPosition: function () {
        var node = this.getDOMNode();
        var container = this.getContainerDOMNode();

        var offset = container.tagName == 'BODY' ?
          domUtils.getOffset(node) : domUtils.getPosition(node, container);

        return merge(offset, {
          height: node.offsetHeight,
          width: node.offsetWidth
        });
      }
    });

    __exports__["default"] = OverlayTrigger;
  });
define('OverlayTrigger',['./transpiled/OverlayTrigger'], function (OverlayTrigger) {
  return OverlayTrigger['default'];
});
define('OverlayMixin',['./transpiled/OverlayMixin'], function (OverlayMixin) {
  return OverlayMixin['default'];
});
define(
  'transpiled/PageHeader',["./react-es6","./react-es6/lib/cx","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];

    var PageHeader = React.createClass({displayName: 'PageHeader',

      render: function () {
        return this.transferPropsTo(
          React.DOM.div( {className:"page-header"}, 
            React.DOM.h1(null, this.props.children)
          )
        );
      }
    });

    __exports__["default"] = PageHeader;
  });
define('PageHeader',['./transpiled/PageHeader'], function (PageHeader) {
  return PageHeader['default'];
});
define(
  'transpiled/Panel',["./react-es6","./react-es6/lib/cx","./react-es6/lib/ReactTransitionEvents","./BootstrapMixin","./CollapsableMixin","./utils","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var ReactTransitionEvents = __dependency3__["default"];
    var BootstrapMixin = __dependency4__["default"];
    var CollapsableMixin = __dependency5__["default"];
    var utils = __dependency6__["default"];

    var Panel = React.createClass({displayName: 'Panel',
      mixins: [BootstrapMixin, CollapsableMixin],

      propTypes: {
        header: React.PropTypes.renderable,
        footer: React.PropTypes.renderable,
        isCollapsable: React.PropTypes.bool,
        isOpen: React.PropTypes.bool,
        onClick: React.PropTypes.func
      },

      getDefaultProps: function () {
        return {
          bsClass: 'panel',
          bsStyle: 'default'
        };
      },

      handleSelect: function (e) {
        if (this.props.onSelect) {
          this._isChanging = true;
          this.props.onSelect(this.props.key);
          this._isChanging = false;
        }

        e.preventDefault();

        this.setState({
          isOpen: !this.state.isOpen
        });
      },

      shouldComponentUpdate: function () {
        return !this._isChanging;
      },

      getCollapsableDimensionValue: function () {
        return this.refs.body.getDOMNode().offsetHeight;
      },

      getCollapsableDOMNode: function () {
        if (!this.isMounted() || !this.refs || !this.refs.panel) {
          return null;
        }

        return this.refs.panel.getDOMNode();
      },

      render: function () {
        var classes = this.getBsClassSet();
        classes['panel'] = true;

        return (
          React.DOM.div( {className:classSet(classes), id:this.props.isCollapsable ? null : this.props.id}, 
            this.renderHeading(),
            this.props.isCollapsable ? this.renderCollapsableBody() : this.renderBody(),
            this.renderFooter()
          )
        );
      },

      renderCollapsableBody: function () {
        return (
          React.DOM.div( {className:classSet(this.getCollapsableClassSet('panel-collapse')), id:this.props.id, ref:"panel"}, 
            this.renderBody()
          )
        );
      },

      renderBody: function () {
        return (
          React.DOM.div( {className:"panel-body", ref:"body"}, 
            this.props.children
          )
        );
      },

      renderHeading: function () {
        var header = this.props.header;

        if (!header) {
          return null;
        }

        if (!React.isValidComponent(header) || Array.isArray(header)) {
          header = this.props.isCollapsable ?
            this.renderCollapsableTitle(header) : header;
        } else if (this.props.isCollapsable) {
          header = utils.cloneWithProps(header, {
            className: 'panel-title',
            children: this.renderAnchor(header.props.children)
          });
        } else {
          header = utils.cloneWithProps(header, {
            className: 'panel-title'
          });
        }

        return (
          React.DOM.div( {className:"panel-heading"}, 
            header
          )
        );
      },

      renderAnchor: function (header) {
        return (
          React.DOM.a(
            {href:'#' + (this.props.id || ''),
            className:this.isOpen() ? null : 'collapsed',
            onClick:this.handleSelect}, 
            header
          )
        );
      },

      renderCollapsableTitle: function (header) {
        return (
          React.DOM.h4( {className:"panel-title"}, 
            this.renderAnchor(header)
          )
        );
      },

      renderFooter: function () {
        if (!this.props.footer) {
          return null;
        }

        return (
          React.DOM.div( {className:"panel-footer"}, 
            this.props.footer
          )
        );
      }
    });

    __exports__["default"] = Panel;
  });
define('Panel',['./transpiled/Panel'], function (Panel) {
  return Panel['default'];
});
define('PanelGroup',['./transpiled/PanelGroup'], function (PanelGroup) {
  return PanelGroup['default'];
});
define(
  'transpiled/Popover',["./react-es6","./react-es6/lib/cx","./BootstrapMixin","./utils","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];
    var utils = __dependency4__["default"];


    var Popover = React.createClass({displayName: 'Popover',
      mixins: [BootstrapMixin],

      propTypes: {
        placement: React.PropTypes.oneOf(['top','right', 'bottom', 'left']),
        positionLeft: React.PropTypes.number,
        positionTop: React.PropTypes.number,
        arrowOffsetLeft: React.PropTypes.number,
        arrowOffsetTop: React.PropTypes.number,
        title: React.PropTypes.renderable
      },

      getDefaultProps: function () {
        return {
          placement: 'right'
        };
      },

      render: function () {
        var classes = {};
        classes['popover'] = true;
        classes[this.props.placement] = true;
        classes['in'] = this.props.positionLeft != null || this.props.positionTop != null;

        var style = {};
        style['left'] = this.props.positionLeft;
        style['top'] = this.props.positionTop;
        style['display'] = 'block';

        var arrowStyle = {};
        arrowStyle['left'] = this.props.arrowOffsetLeft;
        arrowStyle['top'] = this.props.arrowOffsetTop;

        return (
          React.DOM.div( {className:classSet(classes), style:style}, 
            React.DOM.div( {className:"arrow", style:arrowStyle} ),
            this.props.title ? this.renderTitle() : null,
            React.DOM.div( {className:"popover-content"}, 
                this.props.children
            )
          )
        );
      },

      renderTitle: function() {
        return (
          React.DOM.h3( {className:"popover-title"}, this.props.title)
        );
      }
    });

    __exports__["default"] = Popover;
  });
define('Popover',['./transpiled/Popover'], function (Popover) {
  return Popover['default'];
});
define(
  'transpiled/ProgressBar',["./react-es6","./react-es6/lib/cx","./Interpolate","./BootstrapMixin","./utils","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var Interpolate = __dependency3__["default"];
    var BootstrapMixin = __dependency4__["default"];
    var utils = __dependency5__["default"];


    var ProgressBar = React.createClass({displayName: 'ProgressBar',
      propTypes: {
        min: React.PropTypes.number,
        now: React.PropTypes.number,
        max: React.PropTypes.number,
        label: React.PropTypes.string,
        srOnly: React.PropTypes.bool,
        striped: React.PropTypes.bool,
        active: React.PropTypes.bool
      },

      mixins: [BootstrapMixin],

      getDefaultProps: function () {
        return {
          bsClass: 'progress-bar',
          min: 0,
          max: 100
        };
      },

      getPercentage: function (now, min, max) {
        return Math.ceil((now - min) / (max - min) * 100);
      },

      render: function () {
        var classes = {
            progress: true
          };

        if (this.props.active) {
          classes['progress-striped'] = true;
          classes['active'] = true;
        } else if (this.props.striped) {
          classes['progress-striped'] = true;
        }

        if (!this.props.children) {
          if (!this.props.isChild) {
            return this.transferPropsTo(
              React.DOM.div( {className:classSet(classes)}, 
                this.renderProgressBar()
              )
            );
          } else {
            return this.transferPropsTo(
              this.renderProgressBar()
            );
          }
        } else {
          return this.transferPropsTo(
            React.DOM.div( {className:classSet(classes)}, 
              utils.modifyChildren(this.props.children, this.renderChildBar)
            )
          );
        }
      },

      renderChildBar: function (child) {
        return utils.cloneWithProps(child, {
          isChild: true,
          key: child.props.key,
          ref: child.props.ref
        });
      },

      renderProgressBar: function () {
        var percentage = this.getPercentage(
            this.props.now,
            this.props.min,
            this.props.max
          );

        var label;

        if (this.props.label) {
          label = this.props.srOnly ?
            this.renderScreenReaderOnlyLabel(percentage) : this.renderLabel(percentage);
        }

        return (
          React.DOM.div( {className:classSet(this.getBsClassSet()), role:"progressbar",
            style:{width: percentage + '%'},
            'aria-valuenow':this.props.now,
            'aria-valuemin':this.props.min,
            'aria-valuemax':this.props.max}, 
            label
          )
        );
      },

      renderLabel: function (percentage) {
        var InterpolateClass = this.props.interpolateClass || Interpolate;

        return (
          InterpolateClass(
            {now:this.props.now,
            min:this.props.min,
            max:this.props.max,
            percent:percentage,
            bsStyle:this.props.bsStyle}, 
            this.props.label
          )
        );
      },

      renderScreenReaderOnlyLabel: function (percentage) {
        return (
          React.DOM.span( {className:"sr-only"}, 
            this.renderLabel(percentage)
          )
        );
      }
    });

    __exports__["default"] = ProgressBar;
  });
define('ProgressBar',['./transpiled/ProgressBar'], function (ProgressBar) {
  return ProgressBar['default'];
});
define(
  'transpiled/Row',["./react-es6","./PropTypes","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var PropTypes = __dependency2__["default"];


    var Row = React.createClass({displayName: 'Row',
      propTypes: {
        componentClass: PropTypes.componentClass
      },

      getDefaultProps: function () {
        return {
          componentClass: React.DOM.div
        };
      },

      render: function () {
        var componentClass = this.props.componentClass;

        return this.transferPropsTo(
          componentClass( {className:"row"}, 
            this.props.children
          )
        );
      }
    });

    __exports__["default"] = Row;
  });
define('Row',['./transpiled/Row'], function (Row) {
  return Row['default'];
});
define(
  'transpiled/SplitButton',["./react-es6","./react-es6/lib/cx","./BootstrapMixin","./DropdownStateMixin","./Button","./ButtonGroup","./DropdownMenu","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];
    var DropdownStateMixin = __dependency4__["default"];
    var Button = __dependency5__["default"];
    var ButtonGroup = __dependency6__["default"];
    var DropdownMenu = __dependency7__["default"];

    var SplitButton = React.createClass({displayName: 'SplitButton',
      mixins: [BootstrapMixin, DropdownStateMixin],

      propTypes: {
        pullRight:     React.PropTypes.bool,
        title:         React.PropTypes.renderable,
        href:          React.PropTypes.string,
        dropdownTitle: React.PropTypes.renderable,
        onClick:       React.PropTypes.func,
        onSelect:      React.PropTypes.func
      },

      getDefaultProps: function () {
        return {
          dropdownTitle: 'Toggle dropdown'
        };
      },

      render: function () {
        var groupClasses = {
            'open': this.state.open,
            'dropup': this.props.dropup
          };

        return (
          ButtonGroup(
            {bsSize:this.props.bsSize,
            className:classSet(groupClasses),
            id:this.props.id}, 
            Button(
              {ref:"button",
              href:this.props.href,
              bsStyle:this.props.bsStyle,
              onClick:this.props.onClick}, 
              this.props.title
            ),

            Button(
              {ref:"dropdownButton",
              bsStyle:this.props.bsStyle,
              className:"dropdown-toggle",
              onClick:this.handleOpenClick}, 
              React.DOM.span( {className:"sr-only"}, this.props.dropdownTitle),
              React.DOM.span( {className:"caret"} )
            ),

            DropdownMenu(
              {ref:"menu",
              onSelect:this.handleOptionSelect,
              'aria-labelledby':this.props.id,
              pullRight:this.props.pullRight}, 
              this.props.children
            )
          )
        );
      },

      handleOpenClick: function (e) {
        e.preventDefault();

        this.setDropdownState(true);
      },

      handleOptionSelect: function (key) {
        if (this.props.onSelect) {
          this.props.onSelect(key);
        }

        this.setDropdownState(false);
      }
    });

    __exports__["default"] = SplitButton;
  });
define('SplitButton',['./transpiled/SplitButton'], function (SplitButton) {
  return SplitButton['default'];
});
define(
  'transpiled/SubNav',["./react-es6","./react-es6/lib/cx","./BootstrapMixin","./utils","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];
    var utils = __dependency4__["default"];


    var SubNav = React.createClass({displayName: 'SubNav',
      mixins: [BootstrapMixin],

      propTypes: {
        onSelect: React.PropTypes.func,
        active: React.PropTypes.bool,
        disabled: React.PropTypes.bool,
        href: React.PropTypes.string,
        title: React.PropTypes.string,
        text: React.PropTypes.renderable,
      },

      getDefaultProps: function () {
        return {
          bsClass: 'nav'
        };
      },

      handleClick: function (e) {
        if (this.props.onSelect) {
          e.preventDefault();

          if (!this.props.disabled) {
            this.props.onSelect(this.props.key, this.props.href);
          }
        }
      },

      isActive: function () {
        return this.isChildActive(this);
      },

      isChildActive: function (child) {
        var isActive = false;

        if (child.props.active) {
          return true;
        }

        if (this.props.activeKey != null && this.props.activeKey === child.props.key) {
          return true;
        }

        if (this.props.activeHref != null && this.props.activeHref === child.props.href) {
          return true;
        }

        if (child.props.children) {
          React.Children.forEach(
            child.props.children,
            function (child) {
              if (this.isChildActive(child)) {
                isActive = true;
              }
            },
            this
          );

          return isActive;
        }

        return false;
      },

      getChildActiveProp: function (child) {
        if (child.props.active) {
          return true;
        }
        if (this.props.activeKey != null) {
          if (child.props.key === this.props.activeKey) {
            return true;
          }
        }
        if (this.props.activeHref != null) {
          if (child.props.href === this.props.activeHref) {
            return true;
          }
        }

        return child.props.active;
      },

      render: function () {
        var classes = {
          'active': this.isActive(),
          'disabled': this.props.disabled
        };

        return this.transferPropsTo(
          React.DOM.li( {className:classSet(classes)}, 
            React.DOM.a(
              {href:this.props.href,
              title:this.props.title,
              onClick:this.handleClick,
              ref:"anchor"}, 
              this.props.text
            ),
            React.DOM.ul( {className:"nav"}, 
              utils.modifyChildren(this.props.children, this.renderNavItem)
            )
          )
        );
      },

      renderNavItem: function (child) {
        return utils.cloneWithProps(
          child,
          {
            active: this.getChildActiveProp(child),
            onSelect: utils.createChainedFunction(child.props.onSelect, this.props.onSelect),
            ref: child.props.ref,
            key: child.props.key
          }
        );
      }
    });

    __exports__["default"] = SubNav;
  });
define('SubNav',['./transpiled/SubNav'], function (SubNav) {
  return SubNav['default'];
});
define(
  'transpiled/TabbedArea',["./react-es6","./BootstrapMixin","./utils","./Nav","./NavItem","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var BootstrapMixin = __dependency2__["default"];
    var utils = __dependency3__["default"];
    var Nav = __dependency4__["default"];
    var NavItem = __dependency5__["default"];

    function hasTab (child) {
      return !!child.props.tab;
    }

    var TabbedArea = React.createClass({displayName: 'TabbedArea',
      mixins: [BootstrapMixin],

      propTypes: {
        animation: React.PropTypes.bool,
        onSelect: React.PropTypes.func
      },

      getDefaultProps: function () {
        return {
          animation: true
        };
      },

      getInitialState: function () {
        var defaultActiveKey = this.props.defaultActiveKey;

        if (defaultActiveKey == null) {
          var children = this.props.children;
          defaultActiveKey =
            Array.isArray(children) ? children[0].props.key : children.props.key;
        }

        return {
          activeKey: defaultActiveKey,
          previousActiveKey: null
        };
      },

      componentWillReceiveProps: function (nextProps) {
        if (nextProps.activeKey != null && nextProps.activeKey !== this.props.activeKey) {
          this.setState({
            previousActiveKey: this.props.activeKey
          });
        }
      },

      handlePaneAnimateOutEnd: function () {
        this.setState({
          previousActiveKey: null
        });
      },

      render: function () {
        var activeKey =
          this.props.activeKey != null ? this.props.activeKey : this.state.activeKey;

        var nav = this.transferPropsTo(
          Nav( {bsStyle:"tabs", activeKey:activeKey, onSelect:this.handleSelect, ref:"tabs"}, 
              utils.modifyChildren(utils.filterChildren(this.props.children, hasTab), this.renderTab)
          )
        );

        return (
          React.DOM.div(null, 
            nav,
            React.DOM.div( {id:this.props.id, className:"tab-content", ref:"panes"}, 
              utils.modifyChildren(this.props.children, this.renderPane)
            )
          )
        );
      },

      getActiveKey: function () {
        return this.props.activeKey != null ? this.props.activeKey : this.state.activeKey;
      },

      renderPane: function (child) {
        var activeKey = this.getActiveKey();

        return utils.cloneWithProps(
            child,
            {
              active: (child.props.key === activeKey &&
                (this.state.previousActiveKey == null || !this.props.animation)),
              ref: child.props.ref,
              key: child.props.key,
              animation: this.props.animation,
              onAnimateOutEnd: (this.state.previousActiveKey != null &&
                child.props.key === this.state.previousActiveKey) ? this.handlePaneAnimateOutEnd: null
            }
          );
      },

      renderTab: function (child) {
        var key = child.props.key;
        return (
          NavItem(
            {ref:'tab' + key,
            key:key}, 
            child.props.tab
          )
        );
      },

      shouldComponentUpdate: function() {
        // Defer any updates to this component during the `onSelect` handler.
        return !this._isChanging;
      },

      handleSelect: function (key) {
        if (this.props.onSelect) {
          this._isChanging = true;
          this.props.onSelect(key);
          this._isChanging = false;
        } else if (key !== this.getActiveKey()) {
          this.setState({
            activeKey: key,
            previousActiveKey: this.getActiveKey()
          });
        }
      }
    });

    __exports__["default"] = TabbedArea;
  });
define('TabbedArea',['./transpiled/TabbedArea'], function (TabbedArea) {
  return TabbedArea['default'];
});
define(
  'transpiled/Table',["./react-es6","./react-es6/lib/cx","./PropTypes","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var PropTypes = __dependency3__["default"];

    var Table = React.createClass({displayName: 'Table',
      propTypes: {
        striped: React.PropTypes.bool,
        bordered: React.PropTypes.bool,
        condensed: React.PropTypes.bool,
        hover: React.PropTypes.bool,
        responsive: React.PropTypes.bool
      },

      render: function () {
        var classes = {
          'table': true,
          'table-striped': this.props.striped,
          'table-bordered': this.props.bordered,
          'table-condensed': this.props.condensed,
          'table-hover': this.props.hover
        };
        var table = this.transferPropsTo(
          React.DOM.table( {className:classSet(classes)}, 
            this.props.children
          )
        );

        return this.props.responsive ? (
          React.DOM.div( {className:"table-responsive"}, 
            table
          )
        ) : table;
      }
    });

    __exports__["default"] = Table;
  });
define('Table',['./transpiled/Table'], function (Table) {
  return Table['default'];
});
define(
  'transpiled/TabPane',["./react-es6","./react-es6/lib/cx","./react-es6/lib/ReactTransitionEvents","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var ReactTransitionEvents = __dependency3__["default"];

    var TabPane = React.createClass({displayName: 'TabPane',
      getDefaultProps: function () {
        return {
          animation: true
        };
      },

      getInitialState: function () {
        return {
          animateIn: false,
          animateOut: false
        };
      },

      componentWillReceiveProps: function (nextProps) {
        if (this.props.animation) {
          if (!this.state.animateIn && nextProps.active && !this.props.active) {
            this.setState({
              animateIn: true
            });
          } else if (!this.state.animateOut && !nextProps.active && this.props.active) {
            this.setState({
              animateOut: true
            });
          }
        }
      },

      componentDidUpdate: function () {
        if (this.state.animateIn) {
          setTimeout(this.startAnimateIn, 0);
        }
        if (this.state.animateOut) {
          ReactTransitionEvents.addEndEventListener(
            this.getDOMNode(),
            this.stopAnimateOut
          );
        }
      },

      startAnimateIn: function () {
        if (this.isMounted()) {
          this.setState({
            animateIn: false
          });
        }
      },

      stopAnimateOut: function () {
        if (this.isMounted()) {
          this.setState({
            animateOut: false
          });

          if (typeof this.props.onAnimateOutEnd === 'function') {
            this.props.onAnimateOutEnd();
          }
        }
      },

      render: function () {
        var classes = {
          'tab-pane': true,
          'fade': true,
          'active': this.props.active || this.state.animateOut,
          'in': this.props.active && !this.state.animateIn
        };

        return this.transferPropsTo(
          React.DOM.div( {className:classSet(classes)}, 
            this.props.children
          )
        );
      }
    });

    __exports__["default"] = TabPane;
  });
define('TabPane',['./transpiled/TabPane'], function (TabPane) {
  return TabPane['default'];
});
define(
  'transpiled/Tooltip',["./react-es6","./react-es6/lib/cx","./BootstrapMixin","./utils","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];
    var utils = __dependency4__["default"];


    var Tooltip = React.createClass({displayName: 'Tooltip',
      mixins: [BootstrapMixin],

      propTypes: {
        placement: React.PropTypes.oneOf(['top','right', 'bottom', 'left']),
        positionLeft: React.PropTypes.number,
        positionTop: React.PropTypes.number,
        arrowOffsetLeft: React.PropTypes.number,
        arrowOffsetTop: React.PropTypes.number
      },

      getDefaultProps: function () {
        return {
          placement: 'right'
        };
      },

      render: function () {
        var classes = {};
        classes['tooltip'] = true;
        classes[this.props.placement] = true;
        classes['in'] = this.props.positionLeft != null || this.props.positionTop != null;

        var style = {};
        style['left'] = this.props.positionLeft;
        style['top'] = this.props.positionTop;

        var arrowStyle = {};
        arrowStyle['left'] = this.props.arrowOffsetLeft;
        arrowStyle['top'] = this.props.arrowOffsetTop;

        return (
            React.DOM.div( {className:classSet(classes), style:style}, 
              React.DOM.div( {className:"tooltip-arrow", style:arrowStyle} ),
              React.DOM.div( {className:"tooltip-inner"}, 
                this.props.children
              )
            )
          );
      }
    });

    __exports__["default"] = Tooltip;
  });
define('Tooltip',['./transpiled/Tooltip'], function (Tooltip) {
  return Tooltip['default'];
});
define(
  'transpiled/Well',["./react-es6","./react-es6/lib/cx","./BootstrapMixin","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    
    /** @jsx React.DOM */

    var React = __dependency1__["default"];
    var classSet = __dependency2__["default"];
    var BootstrapMixin = __dependency3__["default"];

    var Well = React.createClass({displayName: 'Well',
      mixins: [BootstrapMixin],

      getDefaultProps: function () {
        return {
          bsClass: 'well'
        };
      },

      render: function () {
        var classes = this.getBsClassSet();

        return this.transferPropsTo(
          React.DOM.div( {className:classSet(classes)}, 
            this.props.children
          )
        );
      }
    });

    __exports__["default"] = Well;
  });
define('Well',['./transpiled/Well'], function (Well) {
  return Well['default'];
});
/*global define */

define('react-bootstrap',['require','./Accordion','./Affix','./AffixMixin','./Alert','./BootstrapMixin','./Badge','./Button','./ButtonGroup','./ButtonToolbar','./Carousel','./CarouselItem','./Col','./CollapsableMixin','./DropdownButton','./DropdownMenu','./DropdownStateMixin','./FadeMixin','./Glyphicon','./Grid','./Input','./Interpolate','./Jumbotron','./Label','./MenuItem','./Modal','./Nav','./Navbar','./NavItem','./ModalTrigger','./OverlayTrigger','./OverlayMixin','./PageHeader','./Panel','./PanelGroup','./Popover','./ProgressBar','./Row','./SplitButton','./SubNav','./TabbedArea','./Table','./TabPane','./Tooltip','./Well'],function (require) {
  

  return {
    Accordion: require('./Accordion'),
    Affix: require('./Affix'),
    AffixMixin: require('./AffixMixin'),
    Alert: require('./Alert'),
    BootstrapMixin: require('./BootstrapMixin'),
    Badge: require('./Badge'),
    Button: require('./Button'),
    ButtonGroup: require('./ButtonGroup'),
    ButtonToolbar: require('./ButtonToolbar'),
    Carousel: require('./Carousel'),
    CarouselItem: require('./CarouselItem'),
    Col: require('./Col'),
    CollapsableMixin: require('./CollapsableMixin'),
    DropdownButton: require('./DropdownButton'),
    DropdownMenu: require('./DropdownMenu'),
    DropdownStateMixin: require('./DropdownStateMixin'),
    FadeMixin: require('./FadeMixin'),
    Glyphicon: require('./Glyphicon'),
    Grid: require('./Grid'),
    Input: require('./Input'),
    Interpolate: require('./Interpolate'),
    Jumbotron: require('./Jumbotron'),
    Label: require('./Label'),
    MenuItem: require('./MenuItem'),
    Modal: require('./Modal'),
    Nav: require('./Nav'),
    Navbar: require('./Navbar'),
    NavItem: require('./NavItem'),
    ModalTrigger: require('./ModalTrigger'),
    OverlayTrigger: require('./OverlayTrigger'),
    OverlayMixin: require('./OverlayMixin'),
    PageHeader: require('./PageHeader'),
    Panel: require('./Panel'),
    PanelGroup: require('./PanelGroup'),
    Popover: require('./Popover'),
    ProgressBar: require('./ProgressBar'),
    Row: require('./Row'),
    SplitButton: require('./SplitButton'),
    SubNav: require('./SubNav'),
    TabbedArea: require('./TabbedArea'),
    Table: require('./Table'),
    TabPane: require('./TabPane'),
    Tooltip: require('./Tooltip'),
    Well: require('./Well')
  };
});
    //Register in the values from the outer closure for common dependencies
    //as local almond modules
    define('react', function () {
        return React;
    });

    //Use almond's special top-level, synchronous require to trigger factory
    //functions, get the final module value, and export it as the public
    //value.
    return require('react-bootstrap');
}));
