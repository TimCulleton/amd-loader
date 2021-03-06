import { EventEmitter } from "events";
import { IAmdModuleConfig } from "../types/amdModuleTypes";
import { IAmdModule } from "../types/amdModuleTypes";
import { FactoryFn } from "../types/amdModuleTypes";
import { RequireModule } from "../types/amdModuleTypes";
import { GenericFunction1 } from "../types/commonTypes";
import { GenericFunction0 } from "../types/commonTypes";

export class AmdModule implements IAmdModule {
    public name: string;
    public path: string;
    public dependencies: string[];
    public factory: FactoryFn;
    public loaded: boolean;
    public exports: any;
    public requireModule: RequireModule;

    /**
     * Has this module been defined
     */
    public defined: boolean;

    /**
     * Event Emitter
     */
    private _event: EventEmitter;

    private _moduleLoader: Promise<this> | undefined;

    private _getModuleFromCache: (id: string) => IAmdModule | undefined;

    constructor(config: IAmdModuleConfig) {
        this._event = new EventEmitter();
        this.defined = !!config.defined;
        this._moduleLoader = undefined;

        this.name = config.name;
        this.path = config.path || "";
        this.dependencies = config.dependencies || [];
        this.factory = config.factory || (() => {
            const error = new Error(`Factory has not been supplied`);
            this._emitError(error);
            throw(error);
        });
        this.loaded = !!config.loaded;
        this.requireModule = config.requireModule;
        this._getModuleFromCache = config.getModuleFromCache;
    }

    public on(evtId: "defined" | "ready", callback: GenericFunction1<this>): GenericFunction0;
    public on(evtId: "error", callback: (e: Error) => void): GenericFunction0;
    public on(evtId: any, callback: any) {

        let eventEmitter: EventEmitter | undefined;
        if (evtId === "defined" && !this.defined) {
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

        return eventEmitter ? () => { this._event.off(evtId, callback); } : () => { };
    }

    public emit(evtId: "defined" | "ready"): boolean {

        let retValue: boolean = false;
        if (evtId === "defined") {
            this.defined = true;
            retValue = this._event.emit(evtId, this);
        } else if (evtId === "ready") {
            this.loaded = true;
            retValue = this._event.emit(evtId, this);
        }

        return retValue;
    }

    public async load(): Promise<this> {
        // cache the promise to ensure that the loading only occurs once
        if (!this._moduleLoader) {
            this._moduleLoader = this._loadModule();
        }

        return this._moduleLoader;
    }

    private async _loadModule(): Promise<this> {
        if (!this.defined) {
            const error = new Error(`AMD Module ${this.name} has not been defined`);
            this._emitError(error);
            throw error;
        } else {

            // If we have no factory then this module is busted, bail out
            if (!this.factory) {
                const error = new Error(`Module Factory is not defined for ${this.name}`);
                this._emitError(error);
                throw error;
            }

            // Get all the dependices that need to be loaded
            // IE modules that are not currently stored in the cache
            const dependenciesToLoad = (this.dependencies || [])
                .filter(id => {
                    const cachedModule = this._getModuleFromCache(id);
                    return !cachedModule || !cachedModule.loaded;
                })
                .map(moduleIdToLoad => this.requireModule(moduleIdToLoad));

            await Promise.all(dependenciesToLoad);

            // If any dependent modules are not loaded then we can not proceed with the load
            const dependencies = (this.dependencies || []).map(id => {
                const loadedModule = this._getModuleFromCache(id);
                if (!loadedModule || !loadedModule.loaded) {
                    const error = new Error(`Module Dependency ${id} was not loaded`);
                    this._emitError(error);
                    throw error;
                } else {
                    return loadedModule.exports;
                }
            });

            // Call the factory suppliying all the dependencies to the function
            this.exports = this.factory.apply(global, dependencies);
            this.emit("ready");
            return this;
        }
    }

    private _emitError(e: Error): void {
        this._event.emit("error", e);
    }
}
