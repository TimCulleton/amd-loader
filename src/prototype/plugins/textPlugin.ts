import modulePathUtils = require("../../../src/prototype/utils/modulePathUtils");
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
        const moduleNameParts = modulePathUtils.getPrefixDataForModule(moduleId);
        if (moduleNameParts) {
            const content = await moduleLoader.getModuleContent({moduleId: moduleNameParts.moduleId});
            return this.processModuleContent({
                moduleId,
                moduleContent: content,
            });
        } else {
            throw new Error(`ABC`);
        }
    }

    public canProcessModule(moduleId: string): boolean {
        const nameData = modulePathUtils.getPrefixDataForModule(moduleId);
        if (nameData) {
            return nameData.prefix === "text";
        } else {
            return false;
        }
    }

    public async processModuleContent(content: IProcessModuleContentConfig): Promise<any> {
        return content.moduleContent;
    }
}
