import vm from "vm";
import { AmdModule } from "../modules/amdModule";
import { IAmdModule } from "../types/amdModuleTypes";
import { FactoryFn } from "../types/amdModuleTypes";
import { GenericFunction1 } from "../types/commonTypes";
import { GenericFunction0 } from "../types/commonTypes";
import { AmdLoaderConfig } from "./amdLoaderConfig";

export type AmdModuleCallback = GenericFunction1<IAmdModule>;

/**
 * Cache of currently Defined/Loaded AMD Modules
 */
export const moduleCache: Map<string, IAmdModule> = new Map();

/**
 * AMD Loader Configuration instance
 */
export const loaderConfig: AmdLoaderConfig = new AmdLoaderConfig();

/**
 * Asysnnchronously load an AMD module for the supplied module ID.
 * If the module has not allready been registered, it will be created
 * and the load process will happen immediatly.
 *
 * Any dependent modules will be loadeded as well.
 * If a concatenated module file is loaded during the process all if its
 * module definitions will be registered in the module cache, but they will not be
 * loaded till they are needed
 * @param {strng} moduleId - Module to be loaded
 */
export function requireModule(moduleId: string): Promise<IAmdModule> {
    return new Promise<IAmdModule>((resolve, reject) => {

        let amdModule = getModuleFromCache(moduleId);
        if (!amdModule) {
            amdModule = createModule(moduleId);
            moduleCache.set(moduleId, amdModule);
        }

        if (amdModule.loaded) {
            resolve(amdModule);
            return amdModule;
        }

        // On Ready
        let disconnectOnReady: GenericFunction0;
        const onReady: AmdModuleCallback = (loadedModule) => {
            disconnectOnReady();
            resolve(loadedModule);
        };
        disconnectOnReady = amdModule.on("ready", onReady);

        // On Error
        let disconnectOnError: GenericFunction0;
        const onError: GenericFunction1<Error> = (e) => {
            disconnectOnError();
            reject(e);
        };
        disconnectOnError = amdModule.on("error", onError);

        // If Module has been defined but not loaded
        // Call its 'load' method
        if (!amdModule.loaded && amdModule.defined) {
            amdModule.load().then(onReady, onError);
        // Module has not been loaded, load and process its file
        } else if (!amdModule.loaded) {
            loadModule(amdModule);
        }
    });
}

/**
 * Load a AMD module by first
 * getting the contents of file and wrapping the contents
 * in a module function to inject the 'define' function.
 *
 * This will cause the AMD module to then invoke the define function
 * completing the initial registration. Once the module has been 'defined'
 *
 * The module will then be loaded, causing any of its dependencies to be loaded.
 * @param {IAmdModule} amdModule - AMD Module that is to be loaded.
 * This can be created via the require or during a concatenated module load
 * 
 */
export async function loadModule(amdModule: IAmdModule): Promise<void> {
    const modulePath = await loaderConfig.moduleAccessor.getPathForModule(amdModule.name);
    amdModule.path = modulePath;

    const moduleContents = await loaderConfig.moduleAccessor.getContentForModule(amdModule.name, modulePath);

    // Kick off the Module Load -
    const disconnectModuleDefined = amdModule.on("defined", (definedModule) => {
        disconnectModuleDefined();
        definedModule.load();
    });

    compileAndExecuteModuleCode(moduleContents);
}

/**
 * Wrap the supplied module code in a function
 * that will supply the 'define' module definition function
 * to enable the AMD modules to be registered into the module cache.
 * In addition the supplied factory function will stored and associed with
 * the module.
 * 
 * Note - this will execute the code in 'this' context
 */
export function compileAndExecuteModuleCode(rawMouldeCode: string): void {
    // wrap contents
    const wrappedContents =
        `(function (andModule, modulePath) {
            if (typeof define === "undefined") {
                var define = andModule.defineModule;
            }
            ${rawMouldeCode}
        })`;

    // Compile the code
    const compiledWrapper = vm.runInThisContext(wrappedContents, {
        displayErrors: true,
    });

    // Execute the code, sending in 'this' as dependency to wrapper function
    compiledWrapper.apply(global, [exports]);
}

/**
 * Define a AMD Module.
 * This registers the module Id with its dependencies and factory method
 * enabling the full 'load' of the module to be performed later.
 * 
 * Note - this function will be invoked during a module 'load' IE
 * when require loads and executes the file.
 * @param {string} moduleId - Module Id that this definition will be registered as
 * @param {string[]} dependencies - Array of module ids that are required to be loaded and 
 * passed into the factory function
 * @param {function} factory - Factory function that takes dependencies to execute the actual
 * 'module' code. The result of which will be stored on the modules exports. 
 */
export function defineModule(moduleId: string, dependencies: string[], factory: FactoryFn) {

    let amdModule = getModuleFromCache(moduleId);
    if (!amdModule) {
        amdModule = createModule(moduleId);
        moduleCache.set(moduleId, amdModule);
        amdModule.path = loaderConfig.moduleAccessor.getPathForModuleSync(moduleId);
    }

    amdModule.dependencies = dependencies;
    amdModule.factory = factory;

    amdModule.emit("defined");
}

/**
 * Create a new AMD Module injecting the 'require' and 'getModule' functions
 * from the loader
 * @param {string} moduleId - id/name of the module
 */
export function createModule(moduleId: string): IAmdModule {
    return new AmdModule({
        name: moduleId,
        requireModule,
        getModuleFromCache,
    });
}

/**
 * Function wrapper to get a specified module from the cache
 * @param {string} id - Module Id
 */
export function getModuleFromCache(id: string): IAmdModule | undefined {
    return moduleCache.get(id);
}
