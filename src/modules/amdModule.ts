
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

export interface IModuleGetter {
    getModulePath: (moduleName: string) => string;

    getModuleContents: (modulePath: string) => Promise<string>;
}

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

    // Execute code
    const compiledWrapper = vm.runInThisContext(wrappedContents, {
        displayErrors: true,
    });
    compiledWrapper.apply(global, [exports]);
}


// Module is defined -> publish defined event
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
        if (evtId === "defined") {
            if (this._defined) {
                callback(this);
            } else {
                eventEmitter = this._event.on("defined", callback);
            }
        } else if (evtId === "ready") {
            if (this.loaded) {
                callback(this);
            } else {
                eventEmitter = this._event.on("ready", callback);
            }
        } else if (evtId === "error") {
            eventEmitter = this._event.on("error", callback);
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
            .filter(id => !ModuleCache[id])
            .map(depModule => requireModule(depModule));

            await Promise.all(dependenciesToLoad);
            const dependencies = this.dependencies.map(id => ModuleCache[id].exports);

            this.exports = this.factory.apply(global, dependencies);
            this.emit("ready");
            return this;
        }
    }
}

// Set global define function
// tslint:disable-next-line: no-string-literal
global["define"] = (moduleID: string, dependencies: string[], factory: Function) => {
    defineModule(moduleID, dependencies, factory);
};
