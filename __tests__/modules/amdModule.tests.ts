import * as AmdModule from "../../src//modules/amdModule";
import fs from "fs";
import path, { dirname } from "path";
import util from "util";

const readFile = util.promisify(fs.readFile);

describe(`AMD Module Tests`, () => {
    const testDir = ((): string =>  {
        if (__dirname.match(/modules$/)) {
            return path.resolve(__dirname, "../testData");
        } else if (__dirname.match(/amd_loader$/)) {
            return path.resolve(__dirname, "__tests__/testData");
        } else {
            return __dirname;
        }
    })();

    beforeEach(() => {
        AmdModule.clearModuleCache();
    });

    it(`Test that test file exists`, async () => {
        const moduleName = `simpleModules/moduleA`;
        const filePath = path.resolve(testDir, moduleName + ".js");
        const exists = fs.existsSync(filePath);
        expect(exists).toBeTruthy();
    });

    it(`Verify that normal Define Registers a module`, () => {
        const moduleName = `simpleModules/moduleA`;
        expect(AmdModule.ModuleCache[moduleName]).toBeFalsy();

        AmdModule.defineModule(moduleName, [], () => "fsfsd");
        expect(AmdModule.ModuleCache[moduleName]).toBeTruthy();
    });

    it(`Get Simple Module`, async () => {
        const moduleName = `simpleModules/moduleA`;
        const expectedModulePath = path.resolve(testDir, moduleName + ".js");

        AmdModule.updateModuleGetter("getModulePath", (moduleName) => {
            return path.resolve(testDir, moduleName + ".js");
        });

        AmdModule.updateModuleGetter("getModuleContents", (modulePath) => {
            return readFile(modulePath, "utf8");
        });

        const moduleA = await AmdModule.requireModule(moduleName);
        expect(moduleA).toBeTruthy();
        expect(moduleA.path).toBe(expectedModulePath);
        expect(moduleA.exports.moduleName).toBe("moduleA");
    });

    it(`Load Module that depends on another - 1 dependency`, async() => {
        const moduleName = `simpleModules/moduleB`;
        const expectedModulePath = path.resolve(testDir, moduleName + ".js");

        AmdModule.updateModuleGetter("getModulePath", (moduleName) => {
            return path.resolve(testDir, moduleName + ".js");
        });

        AmdModule.updateModuleGetter("getModuleContents", (modulePath) => {
            return readFile(modulePath, "utf8");
        });

        expect(AmdModule.ModuleCache[`simpleModules/moduleA`]).toBeFalsy();
        expect(AmdModule.ModuleCache[`simpleModules/moduleB`]).toBeFalsy();

        const moduleB = await AmdModule.requireModule(moduleName);
        expect(moduleB).toBeTruthy();
        expect(moduleB.path).toBe(expectedModulePath);
        expect(moduleB.exports.moduleName).toBe("moduleB");

        // Dependency cloned as a prop on it
        expect(moduleB.exports.dependency.moduleName).toBe("moduleA");
        expect(AmdModule.ModuleCache[moduleB.dependencies[0]]).toBeTruthy();
    });

    it(`Concatenated Modules moduleA`, async () => {
        const moduleName = `complicatedModules/concatModulesA/moduleA`;
        const expectedModulePath = path.resolve(testDir, `complicatedModules/concatModulesA` + ".js");

        AmdModule.updateModuleGetter("getModulePath", (moduleName) => {
            return path.resolve(testDir, `complicatedModules/concatModulesA` + ".js");
        });

        AmdModule.updateModuleGetter("getModuleContents", (modulePath) => {
            return readFile(modulePath, "utf8");
        });

        expect(AmdModule.ModuleCache[`complicatedModules/concatModulesA/moduleA`]).toBeFalsy();
        expect(AmdModule.ModuleCache[`complicatedModules/concatModulesA/moduleB`]).toBeFalsy();

        const moduleA = await AmdModule.requireModule(moduleName);
        expect(moduleA).toBeTruthy();
        expect(moduleA.path).toBe(expectedModulePath);
        expect(moduleA.exports.moduleName).toBe("moduleA");

        expect(AmdModule.ModuleCache[`complicatedModules/concatModulesA/moduleA`]).toBeTruthy();
        expect(AmdModule.ModuleCache[`complicatedModules/concatModulesA/moduleB`]).toBeTruthy();

        const moduleB = AmdModule.ModuleCache[`complicatedModules/concatModulesA/moduleB`];
        expect(moduleB.loaded).toBeFalsy();
    });

    it(`Concatenated Module that depends on another - 1`, async () => {
        const moduleName = `complicatedModules/concatModulesA/moduleB`;
        const expectedModulePath = path.resolve(testDir, `complicatedModules/concatModulesA` + ".js");

        AmdModule.updateModuleGetter("getModulePath", (moduleName) => {
            return path.resolve(testDir, `complicatedModules/concatModulesA` + ".js");
        });

        AmdModule.updateModuleGetter("getModuleContents", (modulePath) => {
            return readFile(modulePath, "utf8");
        });

        expect(AmdModule.ModuleCache[`complicatedModules/concatModulesA/moduleA`]).toBeFalsy();
        expect(AmdModule.ModuleCache[`complicatedModules/concatModulesA/moduleB`]).toBeFalsy();

        const moduleB = await AmdModule.requireModule(moduleName);
        expect(moduleB).toBeTruthy();
        expect(moduleB.path).toBe(expectedModulePath);
        expect(moduleB.exports.moduleName).toBe("moduleB");

        // Dependency cloned as a prop on it
        expect(moduleB.exports.dependency.moduleName).toBe("moduleA");

        expect(AmdModule.ModuleCache[`complicatedModules/concatModulesA/moduleA`]).toBeTruthy();
        expect(AmdModule.ModuleCache[`complicatedModules/concatModulesA/moduleB`]).toBeTruthy();

        const moduleA = AmdModule.ModuleCache[`complicatedModules/concatModulesA/moduleA`];
        expect(moduleA.loaded).toBeTruthy();
    });
});
