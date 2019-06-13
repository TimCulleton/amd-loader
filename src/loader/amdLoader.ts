import { IAmdLoaderConfig } from "../types/amdLoaderTypes";
import { IAmdModule } from "../types/amdModuleTypes";
import { RequireModule } from "../types/amdModuleTypes";
import { ConfigWrapper } from "../utils/configWrapper";

export const ModuleCache: Map<string, IAmdModule> = new Map();

export const LoaderConfig: ConfigWrapper<IAmdLoaderConfig> = new ConfigWrapper();


export function requireModule(moduleId: string): Promise<IAmdModule> {
    throw new Error("not implemented");
}
