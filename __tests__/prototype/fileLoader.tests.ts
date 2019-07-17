import fs = require("fs");
import path = require("path");
import util = require("util");
import { FileLoader } from "../../src/prototype/fileLoader";

const asyncFileRead = util.promisify(fs.readFile);

describe(`FileLoader Tests`, () => {

    const testDir = ((): string => {
        if (__dirname.match(/prototype$/)) {
            return path.resolve(__dirname, "../testData");
        } else if (__dirname.match(/amd_loader$/)) {
            return path.resolve(__dirname, "__tests__/testData");
        } else {
            return __dirname;
        }
    })();

    let fileLoader: FileLoader;

    beforeEach(() => {
        fileLoader = new FileLoader({basePath: testDir});
    });

    it(`Get Module Path simpleModules/moduleA`, async () => {
        const moduleId = `simpleModules/moduleA`;
        const expectedPath = path.resolve(testDir, moduleId + ".js");

        const actualPath = await fileLoader.getModulePath(moduleId, "js");
        expect(actualPath).toBe(expectedPath);
    });

    it(`Get Module Path simpleModules/moduleB`, async () => {
        const moduleId = `simpleModules/moduleB`;
        const expectedPath = path.resolve(testDir, moduleId + ".js");

        const actualPath = await fileLoader.getModulePath(moduleId, "js");
        expect(actualPath).toBe(expectedPath);
    });

    it(`Get Module Path.. nonsense path`, async () => {
        const moduleId = `xtz/fff`;
        const expectedPath = path.resolve(testDir, moduleId + ".js");

        const actualPath = await fileLoader.getModulePath(moduleId, "js");
        expect(actualPath).toBe(expectedPath);
    });

    it(`Get Module Path with file extension`, async () => {
        const moduleId = `xtz/fff.json`;
        const expectedPath = path.resolve(testDir, moduleId);

        const actualPath = await fileLoader.getModulePath(moduleId);
        expect(actualPath).toBe(expectedPath);
    });

    it(`Get Module Contents simpleModules/ModuleA`, async () => {
        const moduleId = `simpleModules/moduleA`;
        const expectedPath = path.resolve(testDir, moduleId + ".js");

        const expectedContent = await asyncFileRead(expectedPath, "utf8");
        const actualContent = await fileLoader.getModuleContent({moduleId, fileExtension: "js"});
        expect(actualContent).toBe(expectedContent);
    });

    it(`Get Module Contents simpleModules/ModuleA - supplied path`, async () => {
        const moduleId = `simpleModules/moduleA`;
        const expectedPath = path.resolve(testDir, moduleId + ".js");

        const expectedContent = await asyncFileRead(expectedPath, "utf8");
        const actualContent = await fileLoader.getModuleContent({moduleId, modulePath: expectedPath});
        expect(actualContent).toBe(expectedContent);
    });

    it(`Get Module Contents simpleModules/ModuleB`, async () => {
        const moduleId = `simpleModules/moduleB`;
        const expectedPath = path.resolve(testDir, moduleId + ".js");

        const expectedContent = await asyncFileRead(expectedPath, "utf8");
        const actualContent = await fileLoader.getModuleContent({moduleId, fileExtension: "js"});
        expect(actualContent).toBe(expectedContent);
    });

    it(`Get Module Contents - Should Error no file found`, async () => {
        const moduleId = `xxx/zzz`;
        try {
            await fileLoader.getModuleContent({moduleId, fileExtension: "js"});
            expect("").toBe("Should have failed");
        } catch (e) {
            expect(e.message.match(/Unable to find file for module/)).toBeTruthy();
        }
    });

    it(`Get Module Path - custom module path getter`, async () => {
        const moduleId = `complicatedModules/concatModulesA/moduleA`;
        const expectedPath = path.resolve(testDir, `complicatedModules/concatModulesA/concatModulesA.js`);

        fileLoader.updateConfig("getModulePath", () => {
            return Promise.resolve(expectedPath);
        });

        const actualPath = await fileLoader.getModulePath(moduleId);
        expect(actualPath).toBe(expectedPath);
    });
});
