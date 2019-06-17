import fs from "fs";
import path from "path";
import util from "util";
import * as amdLoader from "../../src/loader/amdLoader";
import { AmdModule } from "../../src/modules/amdModule";
import { IAmdModule } from "../../src/types/amdModuleTypes";
import { IAmdModuleConfig } from "../../src/types/amdModuleTypes";

const readFile = util.promisify(fs.readFile);

describe(`AMD Module V2 Tests`, () => {
    const testDir = ((): string => {
        if (__dirname.match(/modules$/)) {
            return path.resolve(__dirname, "../testData");
        } else if (__dirname.match(/amd_loader$/)) {
            return path.resolve(__dirname, "__tests__/testData");
        } else {
            return __dirname;
        }
    })();

    beforeEach(() => {
        amdLoader.moduleCache.clear();

        amdLoader.loaderConfig.update({
            moduleAccessor: {
                getPathForModule: (moduleId: string) => {
                    throw new Error(`getPathForModule not mocked ${moduleId}`);
                },

                getPathForModuleSync: (moduleId: string) => {
                    throw new Error(`getPathForModuleSync not mocked ${moduleId}`);
                },

                getContentForModule: (moduleId: string, modulePath: string) => {
                    throw new Error(`getContentForModule not mocked`);
                },

                isAmdModule: (moduleId: string) => {
                    throw new Error(`isAmdModule not mocked`);
                },
            },
        });
    });

    it(`Test that test file exists`, async () => {
        const moduleName = `simpleModules/moduleA`;
        const filePath = path.resolve(testDir, moduleName + ".js");
        const exists = fs.existsSync(filePath);
        expect(exists).toBeTruthy();
    });

    it(`Verify that normal Define Registers a module`, () => {
        const moduleName = `simpleModules/moduleA`;
        expect(amdLoader.getModuleFromCache(moduleName)).toBeFalsy();

        amdLoader.loaderConfig.update("moduleAccessor", "getPathForModuleSync", (moduleId: string) => {
            return moduleId;
        });

        amdLoader.defineModule(moduleName, [], () => "fsfsd");
        expect(amdLoader.getModuleFromCache(moduleName)).toBeTruthy();
    });

    it(`Get Simple Module`, async () => {
        const moduleName = `simpleModules/moduleA`;
        const expectedModulePath = path.resolve(testDir, moduleName + ".js");

        const getModulePath = (moduleId: string) => {
            return path.resolve(testDir, moduleId + ".js");
        };

        amdLoader.loaderConfig.updateModuleAccessor("getPathForModule", moduleId => {
            return Promise.resolve(getModulePath(moduleId));
        });

        amdLoader.loaderConfig.updateModuleAccessor("getPathForModuleSync", getModulePath);

        amdLoader.loaderConfig.updateModuleAccessor("getContentForModule", (moduleId, modulePath) => {
            return readFile(modulePath, "utf8");
        });

        const moduleA = await amdLoader.requireModule(moduleName);
        expect(moduleA).toBeTruthy();
        expect(moduleA.path).toBe(expectedModulePath);
        expect(moduleA.exports.moduleName).toBe("moduleA");
    });

    it(`Load Module that depends on another - 1 dependency`, async () => {
        const moduleName = `simpleModules/moduleB`;
        const expectedModulePath = path.resolve(testDir, moduleName + ".js");

        const getModulePath = (moduleId: string) => {
            return path.resolve(testDir, moduleId + ".js");
        };

        amdLoader.loaderConfig.updateModuleAccessor("getPathForModule", moduleId => {
            return Promise.resolve(getModulePath(moduleId));
        });

        amdLoader.loaderConfig.updateModuleAccessor("getPathForModuleSync", getModulePath);

        amdLoader.loaderConfig.updateModuleAccessor("getContentForModule", (moduleId, modulePath) => {
            return readFile(modulePath, "utf8");
        });

        expect(amdLoader.getModuleFromCache(`simpleModules/moduleA`)).toBeFalsy();
        expect(amdLoader.getModuleFromCache(`simpleModules/moduleB`)).toBeFalsy();

        const moduleB = await amdLoader.requireModule(moduleName);
        expect(moduleB).toBeTruthy();
        expect(moduleB.path).toBe(expectedModulePath);
        expect(moduleB.exports.moduleName).toBe("moduleB");

        // Dependency cloned as a prop on it
        expect(moduleB.exports.dependency.moduleName).toBe("moduleA");
        expect(amdLoader.getModuleFromCache(moduleB.dependencies[0])).toBeTruthy();
    });

    it(`Concatenated Modules moduleA`, async () => {
        const moduleName = `complicatedModules/concatModulesA/moduleA`;
        const expectedModulePath = path.resolve(testDir, `complicatedModules/concatModulesA` + ".js");

        const getModulePath = (moduleId: string) => {
            return path.resolve(testDir, `complicatedModules/concatModulesA` + ".js");
        };

        amdLoader.loaderConfig.updateModuleAccessor("getPathForModule", moduleId => {
            return Promise.resolve(getModulePath(moduleId));
        });

        amdLoader.loaderConfig.updateModuleAccessor("getPathForModuleSync", getModulePath);

        amdLoader.loaderConfig.updateModuleAccessor("getContentForModule", (moduleId, modulePath) => {
            return readFile(modulePath, "utf8");
        });

        expect(amdLoader.moduleCache.get(`complicatedModules/concatModulesA/moduleA`)).toBeFalsy();
        expect(amdLoader.moduleCache.get(`complicatedModules/concatModulesA/moduleB`)).toBeFalsy();

        const moduleA = await amdLoader.requireModule(moduleName);
        expect(moduleA).toBeTruthy();
        expect(moduleA.path).toBe(expectedModulePath);
        expect(moduleA.exports.moduleName).toBe("moduleA");

        expect(amdLoader.moduleCache.get(`complicatedModules/concatModulesA/moduleA`)).toBeTruthy();
        expect(amdLoader.moduleCache.get(`complicatedModules/concatModulesA/moduleB`)).toBeTruthy();

        const moduleB = amdLoader.moduleCache.get(`complicatedModules/concatModulesA/moduleB`) as IAmdModule;
        expect(moduleB.loaded).toBeFalsy();
    });

    it(`Concatenated Module that depends on another - 1`, async () => {
        const moduleName = `complicatedModules/concatModulesA/moduleB`;
        const expectedModulePath = path.resolve(testDir, `complicatedModules/concatModulesA` + ".js");

        const getModulePath = (moduleId: string) => {
            return path.resolve(testDir, `complicatedModules/concatModulesA` + ".js");
        };

        amdLoader.loaderConfig.updateModuleAccessor("getPathForModule", moduleId => {
            return Promise.resolve(getModulePath(moduleId));
        });

        amdLoader.loaderConfig.updateModuleAccessor("getPathForModuleSync", getModulePath);

        amdLoader.loaderConfig.updateModuleAccessor("getContentForModule", (moduleId, modulePath) => {
            return readFile(modulePath, "utf8");
        });

        expect(amdLoader.moduleCache.get(`complicatedModules/concatModulesA/moduleA`)).toBeFalsy();
        expect(amdLoader.moduleCache.get(`complicatedModules/concatModulesA/moduleB`)).toBeFalsy();

        const moduleB = await amdLoader.requireModule(moduleName);
        expect(moduleB).toBeTruthy();
        expect(moduleB.path).toBe(expectedModulePath);
        expect(moduleB.exports.moduleName).toBe("moduleB");

        // Dependency cloned as a prop on it
        expect(moduleB.exports.dependency.moduleName).toBe("moduleA");

        expect(amdLoader.moduleCache.get(`complicatedModules/concatModulesA/moduleA`)).toBeTruthy();
        expect(amdLoader.moduleCache.get(`complicatedModules/concatModulesA/moduleB`)).toBeTruthy();

        const moduleA = amdLoader.moduleCache.get(`complicatedModules/concatModulesA/moduleA`) as IAmdModule;
        expect(moduleA.loaded).toBeTruthy();
    });

    // ########## Pure Module Tests

    it(`Create AmdModule`, () => {
        const config: IAmdModuleConfig = {
            name: `test/testModule`,
            requireModule: async (id: string) => {
                throw new Error("requireModule not implemented");
            },
            getModuleFromCache: (id: string) => {
                throw new Error("getModuleFromCache not implemented");
            },
        };

        const amdModule = new AmdModule(config);
        expect(amdModule).toBeTruthy();
        expect(amdModule.name).toBe(`test/testModule`);

        // Rest of module stuff should be undefine
        expect(amdModule.dependencies.length).toBe(0);
        expect(amdModule.path).toBeFalsy();
        expect(amdModule.factory).toBeTruthy();
        expect(amdModule.loaded).toBeFalsy();

        // Default factory function should throw
        expect(amdModule.factory).toThrow();
    });

    /**
     * When loading a module it must be 'defined' first
     * in order for it to be loaded.
     * This is done during the require process where the source module script/file
     * is loaded and executed where it will invoke the the amdLoaderDefine function
     */
    it(`Load AmdModule not defined - throw`, async (done) => {
        const config: IAmdModuleConfig = {
            name: `test/testModule`,
            requireModule: async (id: string) => {
                throw new Error("requireModule not implemented");
            },
            getModuleFromCache: (id: string) => {
                throw new Error("getModuleFromCache not implemented");
            },
        };

        const amdModule = new AmdModule(config);

        // Verify that the error event listener fires
        let errorCalled = false;
        amdModule.on("error", e => {
            errorCalled = true;
            expect(e).toBeTruthy();
        });

        try {
            await amdModule.load();
            expect(``).toBe(`Should have failed due to define error`);
        } catch (e) {
            expect(errorCalled).toBeTruthy();
            expect(e.message).toBe(`AMD Module test/testModule has not been defined`);
            done();
        }
    });

    /**
     * Simple test that checks that calling the emit 'defined'
     * will invoke the callback
     */
    it(`Amd Module emit 'define'`, (done) => {
        const config: IAmdModuleConfig = {
            name: `test/testModule`,
            requireModule: async (id: string) => {
                throw new Error("requireModule not implemented");
            },
            getModuleFromCache: (id: string) => {
                throw new Error("getModuleFromCache not implemented");
            },
        };

        const amdModule = new AmdModule(config);

        amdModule.on("defined", testModule => {
            expect(testModule).toBeTruthy();
            done();
        });

        // Notify that the module has been defined
        amdModule.emit("defined");
    });

    /**
     * Simple case of loading a module with no dependencies.
     * Stub out the require/getmodule functions
     * make the factory function return back a simple string to validate
     * that the exports will be assigned to it
     */
    it(`Load Module no dependencies`, async () => {

        const config: IAmdModuleConfig = {
            name: `test/testModule`,
            requireModule: async (id: string) => {
                throw new Error("requireModule not implemented");
            },
            getModuleFromCache: (id: string) => {
                throw new Error("getModuleFromCache not implemented");
            },
            factory: () => {
                return "testValue";
            },
        };

        const amdModule = new AmdModule(config);

        // Trigger defined
        amdModule.emit("defined");

        // Verify that the ready has been invoked
        let readyCalled = false;
        amdModule.on("ready", loadedModule => {
            readyCalled = true;
            expect(loadedModule.loaded).toBeTruthy();
        });

        await amdModule.load();
        expect(readyCalled).toBeTruthy();
        expect(amdModule.loaded).toBeTruthy();
        expect(amdModule.exports).toBe("testValue");
    });

    /**
     * Handle the situation where a module is to be loaded but
     * its factory has not defined.
     * In this scenario the module is not valid and can not be loaded
     */
    it(`Load Module no factory supplied`, async () => {
        const config: IAmdModuleConfig = {
            name: `test/testModule`,
            requireModule: async (id: string) => {
                throw new Error("requireModule not implemented");
            },
            getModuleFromCache: (id: string) => {
                throw new Error("getModuleFromCache not implemented");
            },
        };

        const amdModule = new AmdModule(config);
        amdModule.factory = null as any;
        amdModule.emit("defined");

        amdModule.on("ready", () => {
            throw new Error(`Module should not have loaded`);
        });

        let errorEmitted = false;
        amdModule.on("error", () => {
            errorEmitted = true;
        });

        try {
            await amdModule.load();
            throw new Error(`Module should not have loaded`);
        } catch (e) {
            expect(errorEmitted).toBeTruthy();
            expect(e.message).toBe(`Module Factory is not defined`);
        }
    });

    /**
     * Valide that the scenario where a module depends on another
     * that it will be retrieved and its exports will be supplied
     * to the child module.
     */
    it(`Load Module with one dependency`, async () => {
        const moduleAId = `testModule/moduleA`;
        const moduleBId = `testModule/moduleB`;

        const requireModuleFn = async (id: string) => {
            throw new Error("requireModule not implemented");
        };

        // Set up to retrieve the dummy default module b
        let moduleToFetch: IAmdModule;
        const getModuleFromCache = (id: string) => {
            if (id === moduleBId) {
                return moduleToFetch;
            } else {
                throw new Error("getModuleFromCache not implemented");
            }
        };

        const moduleB = new AmdModule({
            name: moduleBId,
            requireModule: requireModuleFn,
            getModuleFromCache,
        });

        moduleB.emit("defined");
        moduleB.emit("ready");
        moduleB.exports = {moduleName: "moduleB"};
        moduleToFetch = moduleB;

        // Module A
        let moduleA = new AmdModule({
            name: moduleAId,
            requireModule: requireModuleFn,
            getModuleFromCache,
        });

        // 'Define Module A, set depedncy to module b
        // factory will ingest export of b and use its value
        moduleA.dependencies = [moduleBId];
        moduleA.factory = (dep: any) => {
            return {
                moduleName: "moduleA",
                dependencyModule: dep.moduleName,
            };
        };
        moduleA.emit("defined");

        moduleA = await moduleA.load();
        expect(moduleA).toBeTruthy();

        // verify moduleA exports
        expect(moduleA.exports.moduleName).toBe("moduleA");
        expect(moduleA.exports.dependencyModule).toBe("moduleB");
    });

    /**
     * Verify that a scenario that when a dependent module is loaded
     * and potentially loads succesfully but the fetch fails to retrieve the module or it is not
     * loaded it will throw.
     */
    it(`Load Module with one dependency, dependency is not loaded`, async () => {
        const moduleAId = `testModule/moduleA`;
        const moduleBId = `testModule/moduleB`;

        const requireModuleFn = async (id: string) => {
            throw new Error("requireModule not implemented");
        };

        // Set up to retrieve the dummy default module b
        let moduleToFetch: IAmdModule;
        let numTimesModuleBFetched = 0;
        const getModuleFromCache = (id: string) => {
            if (id === moduleBId) {
                ++numTimesModuleBFetched;

                // on the second call set loaded to false to trigger error
                if (numTimesModuleBFetched === 2) {
                    moduleToFetch.loaded = false;
                }

                return moduleToFetch;
            } else {
                throw new Error("getModuleFromCache not implemented");
            }
        };

        const moduleB = new AmdModule({
            name: moduleBId,
            requireModule: requireModuleFn,
            getModuleFromCache,
        });

        moduleB.emit("defined");
        moduleB.emit("ready");
        moduleB.exports = {moduleName: "moduleB"};
        moduleToFetch = moduleB;

        // Module A
        let moduleA = new AmdModule({
            name: moduleAId,
            requireModule: requireModuleFn,
            getModuleFromCache,
        });

        // 'Define Module A, set depedncy to module b
        // factory will ingest export of b and use its value
        moduleA.dependencies = [moduleBId];
        moduleA.factory = (dep: any) => {
            return "";
        };
        moduleA.emit("defined");

        let errorCalled = false;
        moduleA.on("error", () => {
            errorCalled = true;
        });

        try {
            await moduleA.load();
            expect("").toBe("Should have failed to load");
        } catch (e) {
            expect(errorCalled).toBeTruthy();
            expect(e.message).toBe(`Module Dependency testModule/moduleB was not loaded`);
        }
    });
});
