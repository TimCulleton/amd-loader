import { IModuleLoaderPlugin } from "../amdLoader";
import { IModulePluginConfig } from "../amdLoader";
import { IProcessModuleContentConfig } from "../amdLoader";

export class TextPlugin implements IModuleLoaderPlugin {
    public config: IModulePluginConfig;

    public readonly prefix: string = "text";

    constructor(config: IModulePluginConfig) {
        this.config = config;
    }

    public async loadModule(moduleId: string): Promise<any> {
        const moduleLoader = this.config.getModuleLoader("fileLoader");
        const moduleNameParts = this.normalizeModuleId(moduleId);
        if (moduleNameParts) {
            const modulePath = await moduleLoader.getModulePath(moduleNameParts.moduleId);
            const content = await moduleLoader.getModuleContent(modulePath);
            return this.processModuleContent({
                moduleId,
                moduleContent: content,
            });
        } else {
            throw new Error(`ABC`);
        }
    }

    public canProcessModule(moduleId: string): boolean {
        const nameData = this.normalizeModuleId(moduleId);
        if (nameData) {
            return nameData.prefix === "text";
        } else {
            return false;
        }
    }

    public normalizeModuleId(moduleId: string): {prefix: string, moduleId: string} | null {
        const matches = moduleId.match(/([^!].+)!(.+)/);
        if (matches) {
            return {
                prefix: matches[1],
                moduleId: matches[2],
            };
        } else {
            return matches;
        }
    }

    public async processModuleContent(content: IProcessModuleContentConfig): Promise<any> {
        return content.moduleContent;
    }
}
