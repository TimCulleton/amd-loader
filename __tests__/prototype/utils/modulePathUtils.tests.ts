import modulePathUtils = require("../../../src/prototype/utils/modulePathUtils");

describe(`ModulePathUtil Tests`, () => {

    it(`Get Parent Module name from path `, () => {
        const moduleId = `testModule/test/test1`;
        const parentModuleName = `testModule`;

        expect(modulePathUtils.getParentModuleName(moduleId)).toBe(parentModuleName);
    });

    it(`Get Parent Module name from path with prefix`, () => {
        const moduleId = `XZ/testModule/test/test1`;
        const parentModuleName = `testModule`;

        const actualModuleName = modulePathUtils.getParentModuleName(moduleId, "XZ");
        expect(actualModuleName).toBe(parentModuleName);
    });

    it(`Get Module Path from moduleId`, () => {
        const moduleId = `testModule/test/test1`;
        const modulePath = moduleId;

        expect(modulePathUtils.getModulePath(moduleId)).toBe(modulePath);
    });

    it(`Get Modue Path from moduleId with prefix`, () => {
        const moduleId = `XZ/testModule/test/test1`;
        const modulePath = `testModule/test/test1`;

        expect(modulePathUtils.getModulePath(moduleId, "XZ")).toBe(modulePath);
    });

    it(`Normalize Text ModuleID - prefix wrapped in !`, () => {
        const moduleId = `!text!simpleModules/textData`;
        const moduleNameData = modulePathUtils.getPrefixDataForModule(moduleId);
        expect(moduleNameData).toBeTruthy();
        if (moduleNameData) {
            expect(moduleNameData.prefix).toBe("text");
            expect(moduleNameData.moduleId).toBe("simpleModules/textData");
        }
    });

    it(`Normalize text ModuleID - not wrapped in !`, () => {
        const moduleId = `text!simpleModules/textData`;
        const moduleNameData = modulePathUtils.getPrefixDataForModule(moduleId);
        expect(moduleNameData).toBeTruthy();
        if (moduleNameData) {
            expect(moduleNameData.prefix).toBe("text");
            expect(moduleNameData.moduleId).toBe("simpleModules/textData");
        }
    });

    it(`Get File Extension from module`, () => {
        const moduleId = `XZ/testModule/test/test1.csv`;
        const fileExtension = modulePathUtils.getFileExtensionForModule(moduleId);
        expect(fileExtension).toBe("csv");
    });

    it(`Get File Extension from module with prefix`, () => {
        const moduleId = `XZ!testModule/test/test1.csv`;
        const fileExtension = modulePathUtils.getFileExtensionForModule(moduleId);
        expect(fileExtension).toBe("csv");
    });

    it(`Get file Extension from module with not file extension`, () => {
        const moduleId = `XZ/testModule/test/test1`;
        expect(modulePathUtils.getFileExtensionForModule(moduleId)).toBeFalsy();
    });
});
