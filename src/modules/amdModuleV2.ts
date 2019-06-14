import { EventEmitter } from "events";
import { IAmdModuleConfig } from "../types/amdModuleTypes";
import { IAmdModuleV2 } from "../types/amdModuleTypes";
import { IAmdModule } from "../types/amdModuleTypes";
import { FactoryFn } from "../types/amdModuleTypes";
import { RequireModule } from "../types/amdModuleTypes";
import { GenericFunction1 } from "../types/commonTypes";
import { GenericFunction0 } from "../types/commonTypes";

export class AmdModuleV2 implements IAmdModuleV2 {
    public name: string;
    public path: string;
    public dependencies: string[];
    public factory: FactoryFn;
    public loaded: boolean;
    public exports: any;
    public requireModule: RequireModule;

    /**
     * Event Emitter
     */
    private _event: EventEmitter;

    /**
     * Has this module been defined
     */
    private _defined: boolean;

    private _moduleLoader: Promise<this> | undefined;

    private _getModuleFromCache: (id: string) => IAmdModule | undefined;

    constructor(config: IAmdModuleConfig) {
        this._event = new EventEmitter();
        this._defined = false;
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

        return eventEmitter ? () => { this._event.off(evtId, callback); } : () => { };
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
        // cache the promise to ensure that the loading only occurs once
        if (!this._moduleLoader) {
            this._moduleLoader = this._loadModule();
        }

        return this._moduleLoader;
    }

    private async _loadModule(): Promise<this> {
        if (!this._defined) {
            throw new Error(`AMD Module ${this.name} has not been defined`);
        } else {

            // const moduleGetter = this.config.getValue("getModuleFromCache");
            const dependenciesToLoad = (this.dependencies || [])
                .filter(id => {
                    const cachedModule = this._getModuleFromCache(id);
                    return !cachedModule || !cachedModule.loaded;
                })
                .map(moduleIdToLoad => this.requireModule(moduleIdToLoad));

            await Promise.all(dependenciesToLoad);

            const dependencies = (this.dependencies || []).map(id => {
                const loadedModule = this._getModuleFromCache(id);
                if (!loadedModule) {
                    const error = new Error(`Module Dependency ${id} was not loaded`);
                    this._emitError(error);
                    throw error;
                } else {
                    return loadedModule.exports;
                }
            });

            if (!this.factory) {
                const error = new Error(`Module Factory is not defined`);
                this._emitError(error);
                throw error;
            }

            this.exports = this.factory.apply(global, dependencies);
            this.emit("ready");
            return this;
        }
    }

    private _emitError(e: Error): void {
        this._event.emit("error", e);
    }
}
