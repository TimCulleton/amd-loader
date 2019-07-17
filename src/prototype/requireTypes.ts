// Type definitions for RequireJS 2.1.20
// Project: http://requirejs.org/
// Definitions by: Josh Baldwin <https://github.com/jbaldwin>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/*
require-2.1.8.d.ts may be freely distributed under the MIT license.

Copyright (c) 2013 Josh Baldwin https://github.com/jbaldwin/require.d.ts

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * Note - These types are based from the original definition listed above
 * The intent here is to use this as springboard/template
 * to create the requisite require/define functions that are
 * required by AMD modules
 */

// declare module 'module' {
// 	var mod: {
// 		config: () => any;
// 		id: string;
// 		uri: string;
// 	}
// 	export = mod;
// }

// tslint:disable: interface-name
// tslint:disable: ban-types
// tslint:disable: unified-signatures

interface RequireError extends Error {

    /**
     *
     * The error ID that maps to an ID on a web page.
     * @type {string}
     * @memberof RequireError
     */
    requireType: string;

    /**
     *
     * Required modules.
     * @type {(string[] | null)}
     * @memberof RequireError
     */
    requireModules: string[] | null;

    /**
     *
     * The original error, if there is one (might be null).
     * @type {Error}
     * @memberof RequireError
     */
    originalError: Error;
}

interface RequireShim {

    /**
     *
     * List of dependencies.
     * @type {string[]}
     * @memberof RequireShim
     */
    deps?: string[];

    /**
     *
     * Name the module will be exported as.
     * @type {string}
     * @memberof RequireShim
     */
    exports?: string;

    /**
     *
     * Initialize function with all dependcies passed in,
     * if the function returns a value then that value is used
     * as the module export value instead of the object
     * found via the 'exports' string.
     * @memberof RequireShim
     */
    init?: (...dependencies: any[]) => any;
}

export interface IConfigPaths {
    [key: string]: string | string[];
}

export interface IConfigShim {
    [key: string]: RequireShim | string[];
}

export interface IConfigMap {
    [key: string]: {
        [key: string]: string;
    };
}

export interface IConfigBundles {
    [key: string]: string[];
}

interface RequireConfig {

    /**
     *
     *
     * @type {string}
     * @memberof RequireConfig
     */
    baseUrl?: string;

    /**
     *
     * Path mappings for module names not found directly under
     * The root path to use for all module lookups.
     * @type {IConfigPaths}
     * @memberof RequireConfig
     */
    paths?: IConfigPaths;

    /**
     *
     * Dictionary of Shim's.
     * Can be of type RequireShim or string[] of dependencies
     * @type {IConfigShim}
     * @memberof RequireConfig
     */
    shim?: IConfigShim;

    /**
     *
     * For the given module prefix, instead of loading the
     * module with the given ID, substitude a different
     * module ID.
     * @example
     * requirejs.config({
     *  map: {
     *      'some/newmodule': {
     *          'foo': 'foo1.2'
     *      },
     *      'some/oldmodule': {
     *          'foo': 'foo1.0'
     *      }
     *  }
     * });
     * @type {IConfigMap}
     * @memberof RequireConfig
     */
    map?: IConfigMap;

    /**
     *
     * Allows pointing multiple module IDs to a module ID that contains a bundle of modules.
     * @example
     * requirejs.config({
     *  bundles: {
     *      'primary': ['main', 'util', 'text', 'text!template.html'],
     *      'secondary': ['text!secondary.html']
     *  }
     * });
     * @type {{ [key: string]: string[]; }}
     * @memberof RequireConfig
     */
    bundles?: { [key: string]: string[]; };

    /**
     *
     * AMD configurations, use module.config() to access in
     * define() functions
     * @type {{ [id: string]: {}; }}
     * @memberof RequireConfig
     */
    config?: { [id: string]: {}; };

    /**
     *
     * Configures loading modules from CommonJS packages.
     * @type {{}}
     * @memberof RequireConfig
     */
    packages?: {};

    /**
     *
     * The number of seconds to wait before giving up on loading
     * a script.  The default is 7 seconds.
     * @type {number}
     * @memberof RequireConfig
     */
    waitSeconds?: number;

    /**
     *
     * A name to give to a loading context.  This allows require.js
     * to load multiple versions of modules in a page, as long as
     * each top-level require call specifies a unique context string.
     * @type {string}
     * @memberof RequireConfig
     */
    context?: string;

    /**
     *
     * An array of dependencies to load.
     * @type {string[]}
     * @memberof RequireConfig
     */
    deps?: string[];

    /**
     *
     * A function to pass to require that should be require after
     * deps have been loaded.
     * @memberof RequireConfig
     */
    callback?: (...modules: any[]) => void;

    /**
     *
     * If set to true, an error will be thrown if a script loads
     * that does not call define() or have shim exports string
     * value that can be checked.
     * @type {boolean}
     * @memberof RequireConfig
     */
    enforceDefine?: boolean;

    /**
     *
     * If set to true, document.createElementNS() will be used
     * to create script elements.
     * @type {boolean}
     * @memberof RequireConfig
     */
    xhtml?: boolean;

    /**
     *
     * Extra query string arguments appended to URLs that RequireJS
     * uses to fetch resources.  Most useful to cache bust when
     * the browser or server is not configured correctly.
     *
     * @example
     * urlArgs: "bust= + (new Date()).getTime()
     * As of RequireJS 2.2.0, urlArgs can be a function. If a
     * function, it will receive the module ID and the URL as
     * parameters, and it should return a string that will be added
     * to the end of the URL. Return an empty string if no args.
     * Be sure to take care of adding the '?' or '&' depending on
     * the existing state of the URL.
     *
     * @example
     * requirejs.config({
     *  urlArgs: function(id, url) {
     *      var args = 'v=1';
     *      if (url.indexOf('view.html') !== -1) {
     *          args = 'v=2';
     *      }
     *
     *      return (url.indexOf('?') === -1 ? '?' : '&') + args;
     *  }
     * });
     *
     * @memberof RequireConfig
     */
    urlArgs?: string | ((id: string, url: string) => string);

    /**
     *
     * Specify the value for the type="" attribute used for script
     * tags inserted into the document by RequireJS.  Default is
     * "text/javascript".  To use Firefox's JavasScript 1.8
     * features, use "text/javascript;version=1.8".
     * @type {string}
     * @memberof RequireConfig
     */
    scriptType?: string;

    /**
     *
     * If set to true, skips the data-main attribute scanning done
     * to start module loading. Useful if RequireJS is embedded in
     * a utility library that may interact with other RequireJS
     * library on the page, and the embedded version should not do
     * data-main loading.
     * @type {boolean}
     * @memberof RequireConfig
     */
    skipDataMain?: boolean;

    /**
     *
     * Allow extending requirejs to support Subresource Integrity
     * (SRI).
     * @memberof RequireConfig
     */
    onNodeCreated?: (node: HTMLScriptElement, config: RequireConfig, moduleName: string, url: string) => void;
}

// todo: not sure what to do with this guy
// interface RequireModule {

// 	/**
// 	*
// 	**/
//     config(): {};

// }

interface RequireMap {

    /**
     *
     *
     * @type {string}
     * @memberof RequireMap
     */
    prefix: string;

    /**
     *
     *
     * @type {string}
     * @memberof RequireMap
     */
    name: string;

    /**
     *
     *
     * @type {RequireMap}
     * @memberof RequireMap
     */
    parentMap: RequireMap;

    /**
     *
     *
     * @type {string}
     * @memberof RequireMap
     */
    url: string;

    /**
     *
     *
     * @type {string}
     * @memberof RequireMap
     */
    originalName: string;

    /**
     *
     *
     * @type {string}
     * @memberof RequireMap
     */
    fullName: string;
}

interface Require {

    /**
     *
     * Configure require.js
     * @param {RequireConfig} config
     * @returns {Require}
     * @memberof Require
     */
    config(config: RequireConfig): Require;

    /**
     * CommonJS require call
     * @param module Module to load
     * @return The loaded module
     */
    (module: string): any;

    /**
     * Start the main app logic.
     * Callback is optional.
     * Can alternatively use deps and callback.
     * @param modules Required modules to load.
     */
    (modules: string[]): void;

    /**
     * @see Require()
     * @param ready Called when required modules are ready.
     */
    (modules: string[], ready: Function): void;

    /**
     * @see http://requirejs.org/docs/api.html#errbacks
     * @param ready Called when required modules are ready.
     */
    (modules: string[], ready: Function, errback: Function): void;

    /**
     *
     *  Generate URLs from require module
     * @param {string} module - Module to URL
     * @returns {string}
     * @memberof Require
     */
    toUrl(module: string): string;

    /**
     *
     * Returns true if the module has already been loaded and defined.
     * @param {string} module - Module to check
     * @returns {boolean}
     * @memberof Require
     */
    defined(module: string): boolean;

    /**
     *
     * Returns true if the module has already been requested or is in the process of
     * loading and should be available at some point.
     * @param {string} module - Module to check
     * @returns {boolean}
     * @memberof Require
     */
    specified(module: string): boolean;

    /**
     *
     * On Error override
     * @param {RequireError} err
     * @param {(err: RequireError) => void} [errback]
     * @memberof Require
     */
    onError(err: RequireError, errback?: (err: RequireError) => void): void;

    /**
     *
     * Undefine a module
     * @param {string} module - Module to undefine.
     * @memberof Require
     */
    undef(module: string): void;

    /**
     *
     * Semi-private function, overload in special instance of undef()
     * @param {object} context
     * @param {RequireMap} map
     * @param {RequireMap[]} depArray
     * @memberof Require
     */
    onResourceLoad(context: object, map: RequireMap, depArray: RequireMap[]): void;
}

interface RequireDefine {

    /**
     * Define Simple Name/Value Pairs
     * @param config Dictionary of Named/Value pairs for the config.
     */
    (config: { [key: string]: any; }): void;

    /**
     * Define function.
     * @param func: The function module.
     */
    (func: () => any): void;

    /**
     * Define function with dependencies.
     * @param deps List of dependencies module IDs.
     * @param ready Callback function when the dependencies are loaded.
     *  callback param deps module dependencies
     * callback return module definition
     */
    (deps: string[], ready: Function): void;

    /**
     * Define module with simplified CommonJS wrapper.
     * @param ready
     *  callback require requirejs instance
     *   callback exports exports object
     *   callback module module
     *   callback return module definition
     */
    (ready: (require: Require, exports: { [key: string]: any; }, module: any) => any): void;

    /**
     * Define a module with a name and dependencies.
     * @param name The name of the module.
     * @param deps List of dependencies module IDs.
     * @param ready Callback function when the dependencies are loaded.
     *  callback deps module dependencies
     *  callback return module definition
     */
    (name: string, deps: string[], ready: Function): void;

    /**
     * Define a module with a name.
     * @param name The name of the module.
     * @param ready Callback function when the dependencies are loaded.
     *  callback return module definition
     */
    (name: string, ready: Function): void;

    /**
     *
     * Used to allow a clear indicator that a global define function (as needed for script src browser loading) conforms
     * to the AMD API, any global define function SHOULD have a property called "amd" whose value is an object.
     * This helps avoid conflict with any other existing JavaScript code that could have defined a define() function
     * that does not conform to the AMD API.
     * define.amd.jQuery is specific to jQuery and indicates that the loader is able to account for multiple version
     * of jQuery being loaded simultaneously.
     * @type {Object}
     * @memberof RequireDefine
     */
    amd: object;
}

// Ambient declarations for 'require' and 'define'
// declare var requirejs: Require;
// declare var require: Require;
// declare var define: RequireDefine;
