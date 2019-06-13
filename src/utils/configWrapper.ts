
/**
 * Simple type denoting a key value pair that can
 * be used to perform updates
 */
export type UpdateTuple<K, V> = [K, V];

export class ConfigWrapper<T extends object> {

    private config: T | undefined;

    constructor(data?: T) {
        this.config = data;
    }

    /**
     * Get the value currently assigned to the given property
     * @param {K extends keyof T} prop - property key to get the value for
     */
    public getValue<K extends keyof T>(prop: K): T[K] | undefined {
        if (this.config) {
            return this.config[prop];
        }
    }

    /**
     * Update the config with the supplied value
     * @param {keyof T} prop - property to update
     * @param {T[K]} value  - value to be assigned
     */
    public updateValue<K extends keyof T>(prop: K, value: T[K]): this;

    /**
     * Update the config given a single update tuple.
     * 
     * @param {UpdateTuple<K, T[K]>} values -
     * values[0] is the property key
     * values[1] is the value to assign to the property
     * 
     */
    public updateValue<K extends keyof T>(values: UpdateTuple<K, T[K]>): this;

    /**
     * Update the config given a collection of update tuples
     * @param {Array<UpdateTuple<K, T[K]>>} values - Array of update tuples
     */
    // tslint:disable-next-line: unified-signatures - it is clearly confused...
    public updateValue<K extends keyof T>(values: Array<UpdateTuple<K, T[K]>>): this;

    /**
     * Update the config by replacing the current config object with the new one
     */
    public updateValue(value: T): this;

    /**
     * Update value implementation.
     * This will parse the arguments to determine the update 'mode'
     * If arg[0] is a string it assumed that we are updating a single key/value
     * If arg[0] is a object we are replacing the current config with it
     * If arg[0] is an array and its first element is not an array we are
     * assuming its a single update tuple
     * If arg[0] is an array and its first element is also an array assuming
     * we have a collection of update tuples
     * @param {any} args - arguments that will be used to control the config update
     */
    public updateValue(...args: any[]): this {

        // Supplied a replacement object
        if (args.length === 1 && !Array.isArray(args[0])) {
            this.config = args[0];
            return this;
        }

        // Need to have a config exist to update individual values
        if (this.config) {

            // Key, Value supplied in - assign and bail out
            if (args.length === 2 && typeof args[0] === "string") {
                this.config[args[0]] = args[1];
                return this;
            }

            // update tuple mode
            let updatePairs: Array<[any, any]> = [];

            // Single Key, Value tuple
            if (Array.isArray(args[0]) && !Array.isArray(args[0][0])) {
                updatePairs.push(args[0]);
            // Array of Update Tuples
            } else if (Array.isArray(args[0]) && Array.isArray(args[0][0])) {
                updatePairs = args[0].slice(0);
            }

            // loop through and apply the updates
            for (const updateData of updatePairs) {
                this.config[updateData[0]] = updateData[1];
            }
        } else {
            throw new Error(`Can not update config as it is undefined`);
        }

        return this;
    }
}
