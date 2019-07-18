import modulePathUtils = require("../../../src/prototype/utils/modulePathUtils");
import { IModuleLoaderPlugin } from "../amdLoader";
import { IModulePluginConfig } from "../amdLoader";
import { IProcessModuleContentConfig } from "../amdLoader";
import message = require("../log/messages");

export class I18nPlugin implements IModuleLoaderPlugin {
    public config: IModulePluginConfig;

    public readonly prefix = "i18n";

    constructor(config: IModulePluginConfig) {
        this.config = config;
    }

    public async loadModule(moduleId: string): Promise<any> {
        const moduleLoader = this.config.getModuleLoader("fileLoader");
        const moduleNameParts = modulePathUtils.getPrefixDataForModule(moduleId);
        if (moduleNameParts && this._canProcessModule(moduleNameParts)) {
            const content = await moduleLoader.getModuleContent({moduleId: moduleNameParts.moduleId});
            return this.processModuleContent({
                moduleId,
                moduleContent: content,
            });
        } else {
            throw new Error(
                message.replace(message.ERROR_UNABLE_TO_LOAD_MODULE_WRONG_PLUGIN, {
                    moduleId,
                    plugin: this.prefix,
                }),
            );
        }
    }

    public canProcessModule(moduleId: string): boolean {
        return (this._canProcessModule(modulePathUtils.getPrefixDataForModule(moduleId)));
    }

    public processModuleContent(content: IProcessModuleContentConfig): Promise<any> {
        const jsonData = JSON.parse(content.moduleContent);
        jsonData.replace = message.replace;
        return jsonData;
    }

    /**
     *
     * Internal validation of module nameData.
     * Checks to see if prefix matches this prefix
     * @private
     * @param {(modulePathUtils.IModulePrefixData | null)} nameData
     * @returns {boolean}
     * @memberof TextPlugin
     */
    private _canProcessModule(nameData: modulePathUtils.IModulePrefixData | null): boolean {
        if (nameData) {
            return nameData.prefix === this.prefix;
        } else {
            return false;
        }
    }
}
