import fs from "fs";
import path from "path";
import util from "util";
import * as amdLoader from "../../src/loader/amdLoader";
import { IAmdModule } from "../../src/types/amdModuleTypes";

const readFile = util.promisify(fs.readFile);

describe(`AMD Loader Tests`, () => {

    const testDir = ((): string => {
        if (__dirname.match(/loader$/)) {
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

    it(`Get a typed module`, async () => {
        const moduleName = `simpleModules/moduleA`;

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

        const moduleA = await amdLoader.requireLoadedModule<typeof import("simpleModules/moduleA")>(moduleName);
        expect(moduleA.moduleName).toBe("moduleA");
    });

    /**
     * Require a loaded module should just return the loaded module
     */
    it(`Get a Loaded Module`, async () => {
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
        const spyLoadModule = spyOn(amdLoader, "loadModule");

        const duplicateModule = await amdLoader.requireModule(moduleName);
        expect(duplicateModule).toBeTruthy();
        expect(spyLoadModule).not.toBeCalled();
        expect(duplicateModule.path).toBe(expectedModulePath);
        expect(duplicateModule.exports.moduleName).toBe("moduleA");
    });

    it(`Error while loading a module`, async (done) => {
        const moduleId = `testModule/badModule`;

        amdLoader.loaderConfig.updateModuleAccessor("getPathForModuleSync", moduleId => {
            return moduleId;
        });

        amdLoader.defineModule(moduleId, [], () => { });
        const testModule = amdLoader.getModuleFromCache(moduleId) as IAmdModule;
        expect(testModule).toBeTruthy();

        testModule.factory = null as any;
        // now try to load it
        try {
            await amdLoader.requireModule(moduleId);
            expect("").toBe("should have failed");
        } catch (e) {
            expect(e.message).toBe(`Module Factory is not defined for ${moduleId}`);
            done();
        }
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
});
