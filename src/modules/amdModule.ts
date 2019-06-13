
import events from "events";
import vm from "vm";

export type AmdModuleListener = (amdModule: IAmdModule) => void;
export type EventDisconnect = () => void;

export interface IAmdModule {
    name: string;
    path: string;
    dependencies: string[];
    factory: Function;
    loaded: boolean;
    exports: any;

    on(evtId: "defined" | "ready", callback: AmdModuleListener): EventDisconnect;
    on(evtId: "error", callback: (e: Error) => void ): EventDisconnect;

    emit(evtId: "defined" | "ready"): boolean;

    load(): Promise<this>;
}

/**
 * Helper object to assist with 
 * resolving the module path and getting the module contents
 */
export interface IModuleGetter {

    /**
     * For the supplied moduleId get the path to the module resource.
     * This could be a single module file or a concatenated module
     */
    getModulePath: (moduleName: string) => string;

    /**
     * For the supplied the module path get the module contents.
     */
    getModuleContents: (modulePath: string) => Promise<string>;
}

/**
 * Global Module Cache that keeps track of all the current modules
 */
export let ModuleCache: {[key: string]: IAmdModule} = {};

export function clearModuleCache(): {[key: string]: IAmdModule} {
    ModuleCache = {};
    return ModuleCache;
}

let ModuleGetter: IModuleGetter = {
    getModulePath: (moduleName: string) => moduleName,

    getModuleContents: (modulePath: string) => {
        return Promise.resolve(`throw new error('default reader');`);
    },
};

/**
 * AMD version of require.
 * This will attempt to find the module in the cache and return that, if it
 * has been loaded.
 *
 * If unable to find the module or it has not been loaded then it will
 * be loaded. Causing the module to be loaded as well as its dependencies.
 * Where upon the module emitting the 'ready' event it will be resolved in
 * promise.
 * @param {string} moduleId - AMD Module to be loaded 
 */
export function requireModule(moduleId: string): Promise<IAmdModule> {
    return new Promise<IAmdModule>((resolve, reject) => {

        let amdModule = ModuleCache[moduleId];
        if (!amdModule) {
            amdModule = new AmdModule(moduleId);
            ModuleCache[moduleId] = amdModule;
        }

        const disconnectOnReady = amdModule.on("ready", (loadedModule) => {
            disconnectOnReady();
            resolve(loadedModule);
        });

        const disconnectOnError = amdModule.on("error", (e) => {
            disconnectOnError();
            reject(e);
        });

        if (!amdModule.loaded) {
            loadModule(amdModule);
        }
    });
}

export function updateModuleGetter<K extends keyof IModuleGetter>(key: K, value: IModuleGetter[K]): void {
    ModuleGetter[key] = value;
}

/**
 * Load a AMD module by first
 * getting the contents of file and wrapping the contents
 * in a module function to inject the 'define' function.
 *
 * This will cause the AMD module to then invoke the define function
 * completing the initial registration. Once the module has been 'defined'
 *
 * The module will then be loaded, causing any of its dependencies to be loaded.
 * @param {IAmdModule} amdModule - AMD Module that is to be loaded.
 * This can be created via the require or during a concatenated module load
 * 
 */
export async function loadModule(amdModule: IAmdModule): Promise<void> {
    const modulePath = ModuleGetter.getModulePath(amdModule.name);
    amdModule.path = modulePath;

    const moduleContents = await ModuleGetter.getModuleContents(modulePath);

    // Kick off the Module Load - 
    const disconnectModuleDefined = amdModule.on("defined", (definedModule) => {
        disconnectModuleDefined();
        definedModule.load();
    });

    // wrap contents
    const wrappedContents =
    `(function (andModule, modulePath) {
        
        if (typeof define === "undefined") {
            var define = andModule.defineModule;
        }

        ${moduleContents}
    })`;

    // Compile the code
    const compiledWrapper = vm.runInThisContext(wrappedContents, {
        displayErrors: true,
    });

    // Execute the code, sending in 'this' as dependency to wrapper function
    compiledWrapper.apply(global, [exports]);
}

/**
 * Define a AMD Module.
 * This registers the module Id with its dependencies and factory method
 * enabling the full 'load' of the module to be performed later.
 * 
 * Note - this function will be invoked during a module 'load' IE
 * when require loads and executes the file.
 * @param {string} moduleId - Module Id that this definition will be registered as
 * @param {string[]} dependencies - Array of module ids that are required to be loaded and 
 * passed into the factory function
 * @param {function} factory - Factory function that takes dependencies to execute the actual
 * 'module' code. The result of which will be stored on the modules exports. 
 */
export function defineModule(moduleId: string, dependencies: string[], factory: Function) {

    let amdModule = ModuleCache[moduleId];
    if (!amdModule) {
        amdModule = new AmdModule(moduleId);
        ModuleCache[moduleId] = amdModule;
        amdModule.path = ModuleGetter.getModulePath(moduleId);
    }

    amdModule.dependencies = dependencies;
    amdModule.factory = factory;

    amdModule.emit("defined");
}

export class AmdModule implements IAmdModule {
    public name: string;
    public path: string;
    public dependencies: string[];
    public factory: Function;
    public loaded: boolean;
    public exports: any;

    private _event: events.EventEmitter;
    private _defined: boolean;
    private _moduleLoader: Promise<this> | undefined;

    constructor(name: string) {
        this.name = name;
        this.path = "";
        this.dependencies = [];
        this.factory = () => new Error(`no factory`);
        this.loaded = false;

        this._defined = false;
        this._event = new events.EventEmitter();
        this._moduleLoader = undefined;
    }

    public on(evtId: "defined" | "ready", callback: AmdModuleListener): EventDisconnect;
    public on(evtId: "error", callback: (e: Error) => void): EventDisconnect;
    public on(evtId: any, callback: any) {

        let eventEmitter: events.EventEmitter | undefined;
        if (evtId === "defined" && !this._defined) {
            eventEmitter = this._event.on("defined", callback);
        } else if (evtId === "ready" && !this.loaded) {
            eventEmitter = this._event.on("ready", callback);
        } else if (evtId === "error") {
            eventEmitter = this._event.on("error", callback);
        }

        // In the case that we don't have an event emitter
        // trigger the callback on the next tick to keep this function 'async'
        if (!eventEmitter) {
            process.nextTick(() => {
                callback(this);
            });
        }

        return eventEmitter ? () => { this._event.off(evtId, callback); } : () => {};
    }

    public emit(evtId: "defined" | "ready"): boolean {

        let retValue: boolean = false;
        if (evtId === "defined") {
            this._defined = true;
            retValue = this._event.emit(evtId, this);
        } else if (evtId === "ready") {
            this.loaded = true;
            retValue = this._event.emit(evtId, this);
        }

        return retValue;
    }

    public async load(): Promise<this> {
        // cache the promise to ensure that the loading only occurs
        // once
        if (!this._moduleLoader) {
            this._moduleLoader = this._loadModule();
        }

        return this._moduleLoader;
    }

    private async _loadModule(): Promise<this> {
        if (!this._defined) {
            throw new Error(`AMD Module ${this.name} has not been defined`);
        } else {

            const dependenciesToLoad = this.dependencies
            .filter(id => !ModuleCache[id] || !ModuleCache[id].loaded)
            .map(depModule => requireModule(depModule));

            await Promise.all(dependenciesToLoad);
            const dependencies = this.dependencies.map(id => ModuleCache[id].exports);

            this.exports = this.factory.apply(global, dependencies);
            this.emit("ready");
            return this;
        }
    }
}
