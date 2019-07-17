import log = require("../../../src/prototype/log/log");

describe(`log tests`, () => {

    beforeEach(() => {
        log.debugLogging = true;
        log.enableLogging = true;
    });

    afterAll(() => {
        log.debugLogging = true;
        log.enableLogging = true;
    });

    it(`Get Time`, () => {
        const timeStamp = log.getTime();
        expect(timeStamp.length > 2).toBeTruthy();
    });

    it(`Log message`, () => {
        const spyLog = spyOn(console, "log");
        log.log("test");
        expect(spyLog).toBeCalled();
    });

    it(`Log when logging disabled`, () => {
        log.enableLogging = false;
        const spyLog = spyOn(console, "log");
        log.log("test");
        expect(spyLog).not.toBeCalled();
    });

    it(`Debug log`, () => {
        const spyDebug = spyOn(console, "debug");
        log.debug("test");
        expect(spyDebug).toBeCalled();
    });

    it(`Debug log - logging disabled`, () => {
        log.enableLogging = false;
        const spyDebug = spyOn(console, "debug");
        log.debug("test");
        expect(spyDebug).not.toBeCalled();
    });

    it(`Debug log - debugLog disabled`, () => {
        log.debugLogging = false;
        const spyDebug = spyOn(console, "debug");
        log.debug("test");
        expect(spyDebug).not.toBeCalled();
    });

    it(`Error Log`, () => {
        const errorLog = spyOn(console, "error");
        log.error("test");
        expect(errorLog).toBeCalled();
    });

    /**
     * Will still log errors when disabled
     */
    it(`Error log, logging disabled`, () => {
        log.enableLogging = false;
        const errorLog = spyOn(console, "error");
        log.error("test");
        expect(errorLog).toBeCalled();
    });
});
