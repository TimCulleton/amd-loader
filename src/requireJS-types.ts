
export interface IObjectCollection<T> {
    [key: string]: T;
}

export type Paths = IObjectCollection<string>;

export type Bundles = IObjectCollection<string>;

export type Shim = IObjectCollection<IShim>;

export type ModuleMap = IObjectCollection<string>;

export type ModuleConfig = IObjectCollection<IModuleConfig>;

export type ModuleCallbackFunction = (...args: any[]) => any;

export interface IShim {

    deps?: string[];

    exports?: string | ModuleCallbackFunction;

    init?: ModuleCallbackFunction;
}

export interface IModuleConfig {
    [key: string]: any;
}

export interface IRequireConfig {
    baseUrl?: string;

    paths?: Paths;

    waitSeconds?: number;

    bundles?: Bundles;

    shim?: Shim;

    map?: ModuleMap;

    config?: ModuleConfig;
}
