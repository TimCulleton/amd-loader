import fs = require("fs");
import path = require("path");
import utils = require("util");
import { IModuleLoader } from "./amdLoader";
import { IModuleLoaderConfig } from "./amdLoader";
import { IModuleLoaderConfigOptions } from "./amdLoader";

const asyncFileRead = utils.promisify(fs.readFile);
const asyncFileExists = utils.promisify(fs.exists);
const asyncDirRead = utils.promisify(fs.readdir);

export type GetModulePath = (moduleId: string, fileExtension?: string) => Promise<string>;

export class FileLoader implements IModuleLoader {
    public config: IModuleLoaderConfig;

    constructor(config?: IModuleLoaderConfig) {
        this.config = config || {
            basePath: __dirname,
        };
    }

    public get getModulePath(): GetModulePath {
        if (this.config.getModulePath) {
            return this.config.getModulePath;
        } else {
            return this._getModulePath;
        }
    }

    public updateConfig<K extends keyof IModuleLoaderConfigOptions>(key: K, value: IModuleLoaderConfigOptions[K]): this;

    public updateConfig(value: IModuleLoaderConfigOptions): this;

    public updateConfig(...args: any[]) {
        if (typeof args[0] === "string") {
            this.config[args[0]] = args[1];
        } else if (typeof args[0] === "object") {
            this.config = args[0];
        }

        return this;
    }

    public canLoad(moduleId: string): boolean {
        return true;
    }

    public async getModuleContent(moduleId: string, fileExtension?: string): Promise<string> {
        const modulePath = await this.getModulePath(moduleId, fileExtension);
        const fileExists = await asyncFileExists(modulePath);

        if (fileExists) {
            return asyncFileRead(modulePath, "utf8");
        } else {
            throw new Error(`Unable to find file for module: ${moduleId} path: ${modulePath}`);
        }
    }

    protected async _getModulePath(moduleId: string, fileExtension = "js"): Promise<string> {
        return path.resolve(this.config.basePath, moduleId + "." + fileExtension);
    }
}
