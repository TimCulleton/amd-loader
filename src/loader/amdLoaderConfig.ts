import { IModuleAccessorConfig } from "../types/amdLoaderTypes";
import { IAmdLoaderConfig } from "../types/amdLoaderTypes";
import { ConfigWrapper } from "../utils/configWrapper";

export class AmdLoaderConfig implements IAmdLoaderConfig {
    private _config: ConfigWrapper<IAmdLoaderConfig>;

    constructor() {
        this._config = new ConfigWrapper();
    }

    public get moduleAccessor(): IModuleAccessorConfig {
        const accessor = this._config.getValue("moduleAccessor");
        if (!accessor) {
            throw new Error(`Module Accessor has not been set`);
        }
        return accessor;
    }

    public get update() {
        return this._config.updateValue.bind(this._config);
    }

    public updateModuleAccessor<K extends keyof IModuleAccessorConfig>(prop: K, value: IModuleAccessorConfig[K]) {
        this.update("moduleAccessor", prop, value);
    }
}
