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

        // tslint:disable-next-line: no-string-literal
        global["_modulePath"] = "abc";
        AmdModule.defineModule(moduleName, [], () => "fsfsd");
        expect(AmdModule.ModuleCache[moduleName]).toBeTruthy();
    });

    it(`Verify that global define exists`, () => {
        const defineType = typeof define;
        expect(defineType).toBe("function");
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

});

