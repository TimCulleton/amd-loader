import messages = require("../../../src/prototype/log/messages");

describe(`Messages Tests`, () => {

    it(`replace unable to find modules`, () => {
        const testData = {
            moduleId: "testData/SampleModule/test",
            modulePath: "D:\\somefolde\\testData\\sampleModule\\test.js",
        };

        const expectedMessage = `Unable to find file for module: ${testData.moduleId} path: ${testData.modulePath}`;
        const actualMessage = messages.replace(messages.ERROR_UNABLE_TO_FIND_FILE_FOR_MODULE, testData);
        expect(actualMessage).toBe(expectedMessage);
    });

    it(`replace unable to load module wrong plugin`, () => {
        const testData = {
            moduleId: "testData/SampleModule/test",
            plugin: "text",
        };

        const expectedMessage =
            `Unable to load module: ${testData.moduleId} as it can not be processed by plugin: ${testData.plugin}`;
        const actualMessage = messages.replace(messages.ERROR_UNABLE_TO_LOAD_MODULE_WRONG_PLUGIN, testData);
        expect(actualMessage).toBe(expectedMessage);
    });
});
