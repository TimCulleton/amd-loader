import { GenericFunction0 } from "./commonTypes";
import { GenericFunction1 } from "./commonTypes";

export type FactoryFn = (...deps: any[]) => any;

export interface IAmdModuleConfig {
    name: string;
    path?: string;
    dependencies?: string[];
    factory?: FactoryFn;
    loaded?: boolean;
    defined?: boolean;
    exports?: any;

    requireModule: RequireModule;

    getModuleFromCache(moduleId: string): IAmdModule | undefined;
}

export type RequireModule = (moduleId: string) => Promise<IAmdModule>;

export interface IRequireModule {
    (moduleId: string): Promise<IAmdModule>;
    (moduleId: string[]): Promise<IAmdModule[]>;
}

export interface IAmdModule {
    name: string;
    path: string;
    dependencies: string[];
    factory: FactoryFn;
    loaded: boolean;
    defined: boolean;
    exports: any;
    requireModule: RequireModule;

    on(evtId: "defined" | "ready", callback: GenericFunction1<this>): GenericFunction0;
    on(evtId: "error", callback: (e: Error) => void): GenericFunction0;

    emit(evtId: "defined" | "ready"): boolean;

    load(): Promise<this>;
}
