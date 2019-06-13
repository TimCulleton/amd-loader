import { ConfigWrapper } from "../../src/utils/configWrapper";

describe(`ConfigWrapper Tests`, () => {

    it(`Simple Object Type - Access Values`, () => {

        const initialObject = {
            name: `TestX`,
            items: []
        };

        const wrapper = new ConfigWrapper(initialObject);
        expect(wrapper.getValue("name")).toBe(initialObject.name);

        const items = wrapper.getValue("items");
        expect(items).toBeTruthy();
        if (items) {
            expect(items.length).toBe(initialObject.items.length);
        }
    });

    it(`Simple Object type - Update Values Key,Value`, () => {
        const initialObject = {
            name: `TestX`,
            items: []
        };

        const wrapper = new ConfigWrapper(initialObject);

        wrapper.updateValue("name", "updated");
        expect(wrapper.getValue("name")).toBe("updated");
    });

    it(`Simple Object type - Update Values single tuple`, () => {
        const initialObject = {
            name: `TestX`,
            items: [5],
        };

        const wrapper = new ConfigWrapper(initialObject);

        wrapper.updateValue(["items", [4, 4]]);
        const items = wrapper.getValue("items");

        expect(items).toBeTruthy();
        if (items) {
            expect(items.length).toBe(2);1
        }
    });

    it(`Simple Object type - Update Values multiple tuple`, () => {
        const initialObject = {
            name: `TestX`,
            items: [5],
        };

        const wrapper = new ConfigWrapper(initialObject);

        wrapper.updateValue([
            ["items", [4, 4]],
            ["name", "magic"],
        ]);

        expect(wrapper.getValue("name")).toBe("magic");
        const items = wrapper.getValue("items");
        expect(items).toBeTruthy();
        if (items) {
            expect(items.length).toBe(2);
        }
    });

    it(`Simple Object type - Update object`, () => {
        const initialObject = {
            name: `TestX`,
            items: [5],
        };

        const wrapper = new ConfigWrapper(initialObject);
        wrapper.updateValue({
            name: "0101",
            items: [],
        });

        expect(wrapper.getValue("name")).toBe("0101");

        const items = wrapper.getValue("items");
        expect(items).toBeTruthy();
        if (items) {
            expect(items.length).toBeFalsy();
        }
    });
});
