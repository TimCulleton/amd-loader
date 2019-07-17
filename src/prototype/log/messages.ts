
export const ERROR_UNABLE_TO_FIND_FILE_FOR_MODULE =
    `Unable to find file for module: {moduleId} path: {modulePath}`;

export const ERROR_UNABLE_TO_LOAD_MODULE_WRONG_PLUGIN =
    `Unable to load module: {moduleId} as it can not be processed by plugin: {plugin}`;

/**
 *
 *
 * @export
 * @param {string} message
 * @param {object} values
 * @returns {string}
 */
export function replace(message: string, values: object): string {
    return message.replace(/\{([\w\-]+)\}/g, (m, name) => {
        return values[name] !== undefined ? values[name] : m;
    });
}
