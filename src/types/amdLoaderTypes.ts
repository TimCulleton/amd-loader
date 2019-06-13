import { IAmdModule } from "./amdModuleTypes";

export interface IAmdLoaderConfig {

    moduleAccessor: IModuleAccessorConfig;
}

export interface IModuleAccessorConfig {

    isAmdModule(moduleId: string): boolean;

    getPathForModule(moduleId: string): Promise<string>;

    getContentForModule(moduleId: string, modulePath: string): Promise<string>;
}
