import path = require("path");
import { IGetModuleContentConfig } from "../../../src/prototype/amdLoader";
import { FileLoader } from "../../../src/prototype/fileLoader";
import messages = require("../../../src/prototype/log/messages");
import { I18nPlugin } from "../../../src/prototype/plugins/i18nPlugin";

describe(`i18n Plugin tests`, () => {
    let fileLoader: FileLoader;
    let i18nPlugin: I18nPlugin;

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
        i18nPlugin = new I18nPlugin({
            getModuleLoader: (loaderId) => {
                return fileLoader;
            },
        });
    });

    it(`Can Process Module Valid - prefix wrapped`, () => {
        const moduleId = `!i18n!simpleModules/textData`;
        expect(i18nPlugin.canProcessModule(moduleId)).toBeTruthy();
    });

    it(`Can Process Module Valid`, () => {
        const moduleId = `i18n!simpleModules/textData`;
        expect(i18nPlugin.canProcessModule(moduleId)).toBeTruthy();
    });

    it(`Can Process Module - Invalid no prefix`, () => {
        const moduleId = `simpleModules/textData`;
        expect(i18nPlugin.canProcessModule(moduleId)).toBeFalsy();
    });

    it(`Can Process Module - Invalid no wrong prefix`, () => {
        const moduleId = `test!simpleModules/textData`;
        expect(i18nPlugin.canProcessModule(moduleId)).toBeFalsy();
    });

    it(`Load Text Module (modulePath)`, async () => {
        const moduleId = `i18n!simpleModules/i18n.json`;

        const spyGetModuleContent = spyOn(fileLoader, "getModuleContent").and.returnValue(Promise.resolve("{}"));
        const content = await i18nPlugin.loadModule(moduleId);

        expect(content).toBeTruthy();
        const expectedCallData: IGetModuleContentConfig = {
            moduleId: `simpleModules/i18n.json`,
        };

        expect(spyGetModuleContent).toHaveBeenCalledWith(expectedCallData);
    });

    it(`Load translation text file`, async () => {
        const moduleId = `i18n!simpleModules/i18n.json`;
        const content: typeof import("i18n!simpleModules/i18n.json") = await i18nPlugin.loadModule(moduleId);

        expect(content.randomText).toBe("test string");
        expect(content.replacementText).toBe("random text about {subject}");
        const replacementText = content.replace(content.replacementText, {subject: "test"});
        expect(replacementText).toBe("random text about test");
    });
});
