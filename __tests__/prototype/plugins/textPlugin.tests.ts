import { FileLoader } from "../../../src/prototype/fileLoader";
import { TextPlugin } from "../../../src/prototype/plugins/textPlugin";

describe(`Text Plugin Tests`, () => {

    let fileLoader: FileLoader;
    let textPlugin: TextPlugin;

    beforeEach(() => {
        fileLoader = new FileLoader();
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
});
