// ##################################
// ########### Message Types
// ##################################

export type T_ERROR_UNABLE_TO_FIND_FILE_FOR_MODULE =
    `Unable to find file for module: {moduleId} path: {modulePath}`;

export type T_ERROR_UNABLE_TO_LOAD_MODULE_WRONG_PLUGIN =
    `Unable to load module: {moduleId} as it can not be processed by plugin: {plugin}`;

// ##################################
// ########### Message Values
// ##################################

export const ERROR_UNABLE_TO_FIND_FILE_FOR_MODULE: T_ERROR_UNABLE_TO_FIND_FILE_FOR_MODULE =
    `Unable to find file for module: {moduleId} path: {modulePath}`;

export const ERROR_UNABLE_TO_LOAD_MODULE_WRONG_PLUGIN: T_ERROR_UNABLE_TO_LOAD_MODULE_WRONG_PLUGIN =
    `Unable to load module: {moduleId} as it can not be processed by plugin: {plugin}`;

// ##################################
// ########### Message Properties
// ##################################

export interface IErrorUnableToFindFileForModule {
    moduleId: string;
    modulePath: string;
}

export interface IErrorUnableToLoadModuleWrongPlugin {
    moduleId: string;
    plugin: string;
}

// ##################################
// ########### Message Value Types
// ##################################

/**
 * Conditional Value type that will be set to the correct Message Properties
 * This allows us to have a generic function that will set the associated value property
 * based on the message supplied.
 * Types safety :)
 * Bit of boilerplate but shrug
 */
export type ValueType<T> =
    T extends T_ERROR_UNABLE_TO_FIND_FILE_FOR_MODULE ? IErrorUnableToFindFileForModule :
    T extends T_ERROR_UNABLE_TO_LOAD_MODULE_WRONG_PLUGIN ? IErrorUnableToLoadModuleWrongPlugin :
    T extends string ? "object" : "undefined";

/**
 *
 * For the supplied message replace any values in the '{}' with values from the supplied values object.
 * @export
 * @template T extends string: typically this will be a defined message which will set the valueType
 * @param {T} message - Message that has properties to be replaced
 * @param {ValueType<T>} values - Object which contains values that will be inserted into the messag
 * @returns {string}
 */
export function replace<T extends string>(message: T, values: ValueType<T>): string {
    return message.replace(/\{([\w\-]+)\}/g, (m, name) => {
        return values[name] !== undefined ? values[name] : m;
    });
}
