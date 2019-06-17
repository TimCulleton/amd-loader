import { AmdModule } from "../../src/modules/amdModule";
import { IAmdModule } from "../../src/types/amdModuleTypes";
import { IAmdModuleConfig } from "../../src/types/amdModuleTypes";

describe(`AMD Module V2 Tests`, () => {

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
