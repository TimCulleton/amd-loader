import path = require("path");
import { IGetModuleContentConfig } from "../../../src/prototype/amdLoader";
import { FileLoader } from "../../../src/prototype/fileLoader";
import { TextPlugin } from "../../../src/prototype/plugins/textPlugin";

describe(`Text Plugin Tests`, () => {

    let fileLoader: FileLoader;
    let textPlugin: TextPlugin;

    const testDir = ((): string => {
        if (__dirname.match(/plugins$/)) {
            return path.resolve(__dirname, "../../testData");
        } else if (__dirname.match(/amd_loader$/)) {
            return path.resolve(__dirname, "__tests__/testData");
        } else {
            return __dirname;
        }
    })();

    beforeEach(() => {
        fileLoader = new FileLoader({ basePath: testDir });
        textPlugin = new TextPlugin({
            getModuleLoader: (loaderId) => {
                return fileLoader;
            },
        });
    });

    it(`Can Process Module Valid - prefix wrapped`, () => {
        const moduleId = `!text!simpleModules/textData`;
        expect(textPlugin.canProcessModule(moduleId)).toBeTruthy();
    });

    it(`Can Process Module Valid`, () => {
        const moduleId = `text!simpleModules/textData`;
        expect(textPlugin.canProcessModule(moduleId)).toBeTruthy();
    });

    it(`Can Process Module - Invalid no prefix`, () => {
        const moduleId = `simpleModules/textData`;
        expect(textPlugin.canProcessModule(moduleId)).toBeFalsy();
    });

    it(`Can Process Module - Invalid no wrong prefix`, () => {
        const moduleId = `test!simpleModules/textData`;
        expect(textPlugin.canProcessModule(moduleId)).toBeFalsy();
    });

    it(`Load Text Module (modulePath)`, async () => {
        const moduleId = `test!simpleModules/textJsonData.json`;

        const spyGetModuleContent = spyOn(fileLoader, "getModuleContent").and.returnValue(Promise.resolve("fake"));
        const content = await textPlugin.loadModule(moduleId);

        expect(content).toBeTruthy();
        const expectedCallData: IGetModuleContentConfig = {
            moduleId: `simpleModules/textJsonData.json`,
        };

        expect(spyGetModuleContent).toHaveBeenCalledWith(expectedCallData);
    });

    it(`Load JSON text module`, async () => {
        const moduleId = `test!simpleModules/textJsonData.json`;
        const content = await textPlugin.loadModule(moduleId);

        const json = JSON.parse(content);
        expect(json.name).toBe("sample json text data");
        expect(json.items).toBeTruthy();
    });
});
