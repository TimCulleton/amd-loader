
export class AMDLoader {


}



export interface IAMDModule extends NodeModule {

}

/**
 *
 * Optional config options to be supplied
 * to the Module Loader
 * @export
 * @interface IModuleLoaderConfigOptions
 */
export interface IModuleLoaderConfigOptions {

    /**
     *
     * Base path the loader that the loader will use
     * when trying to load a module
     * @type {string}
     * @memberof IModuleLoaderConfigOptions
     */
    basePath?: string;
}

/**
 *
 * Config object that has all the properties explicitly
 * required.
 * @export
 * @interface IModuleLoaderConfig
 * @extends {IModuleLoaderConfigOptions}
 */
export interface IModuleLoaderConfig extends IModuleLoaderConfigOptions {
    basePath: string;
}

/**
 *
 * Object that is responsible for finding the actual path for a moduleId,
 * and extracting the raw 'text' content from the appropiate file.
 *
 * This will allow flexibility by having a standard file system loader
 * that will handle basic file system fetching and a http request
 * @export
 * @interface IModuleLoader
 */
export interface IModuleLoader {

    /**
     *
     * Configuration settings supplied/set for this loader
     * @type {IModuleLoaderConfig}
     * @memberof IModuleLoader
     */
    config: IModuleLoaderConfig;

    /**
     *
     * Update a single property/value on the configuration object
     * @template K - Key mapping to the property of the IModuleLoaderConfigOptions
     * @param {K} key - Property to change
     * @param {IModuleLoaderConfigOptions[K]} value - value to be updated
     * @returns {this}
     * @memberof IModuleLoader
     */
    updateConfig<K extends keyof IModuleLoaderConfigOptions>(key: K, value: IModuleLoaderConfigOptions[K]): this;

    /**
     *
     * Update/replace the entire configuration with a new configuration
     * @param {IModuleLoaderConfigOptions} value - new configuration to set
     * @returns {this}
     * @memberof IModuleLoader
     */
    updateConfig(value: IModuleLoaderConfigOptions): this;

    /**
     *
     * Test the supplied moduleId to see if can be loaded/fetched by this loader
     * @param {string} moduleId - module to test
     * @returns {boolean}
     * @memberof IModuleLoader
     */
    canLoad(moduleId: string): boolean;

    /**
     *
     * For the supplied moduleId get the full path to retrieve the module
     * @param {string} moduleId - module to get path for
     * @returns {Promise<string>}
     * @memberof IModuleLoader
     */
    getModulePath(moduleId: string): Promise<string>;

    /**
     *
     * For the supplied module get the content for the module for the file
     * @param {string} moduleId
     * @returns {Promise<string>}
     * @memberof IModuleLoader
     */
    getModuleContent(moduleId: string): Promise<string>;
}

export interface IProcessModuleContentConfig {
    moduleId: string;
    moduleContent: string;
}

export interface IModuleLoaderPlugin {

    prefix: string;

    canProcessModule(moduleId: string): boolean;

    processModuleContent(content: IProcessModuleContentConfig): Promise<any>;
}
