
/**
 *
 * Get the parent module name from the supplied moduleId.
 * This is used in situations where a module may belong to a concatenated
 * bundle.
 * @export
 * @param {string} moduleId - moduleId to get parent module from.
 * @param {string} [prefix] - Optional prefix to strip it out from the first result
 * @returns {string}
 *
 * @example
 * const parentModuleName = getParentModuleName('testModule/test/test1');
 * parentModuleName === 'testModule'
 *
 * @example
 * const parentModuleName = getParentModuleName('XZ/testModule/test/test1', 'XZ');
 * parentModuleName === 'testModule'
 */
export function getParentModuleName(moduleId: string, prefix?: string): string {
    const search = prefix
        ? new RegExp(`^${prefix}\/(\\w+)\/.+`)
        : /(\w+)\/.+/;

    const matches = moduleId.match(search);
    return matches ? matches[1] : "";
}

/**
 *
 * Get the path to the module resource based on its moduleId.
 * Module files can be stored based on its moduleId where the slashes
 * denote a folder with the final value been the actual file.
 * This will get the full path.
 * If a prefix is supplied then that will be omitted from the result
 * @export
 * @param {string} moduleId - moduleId to get parent module from.
 * @param {string} [prefix] - Optional prefix to strip it out from the first result
 * @returns {string}
 *
 * @example
 * const modulePath = getModulePath('testModule/test/test1');
 * modulePath === 'testModule/test/test1';
 *
 * @example
 * const modulePath = getModulePath('XZ/testModule/test/test1', 'XZ');
 * modulePath === 'testModule/test/test1';
 */
export function getModulePath(moduleId: string, prefix?: string): string {
    let modulePath = moduleId;

    if (prefix) {
        const search = new RegExp(`^${prefix}\/(.+)`);
        const matches = moduleId.match(search);
        modulePath = matches ? matches[1] : modulePath;
    }

    return modulePath;
}

export interface IModulePrefixData {

    /**
     *
     * Plugin prefix id
     * @type {string}
     * @memberof IModulePrefixData
     */
    prefix: string;

    /**
     *
     * Normalized module Id
     * @type {string}
     * @memberof IModulePrefixData
     */
    moduleId: string;
}

/**
 *
 *
 * @export
 * @param {string} moduleId
 * @returns {(IModulePrefixData | null)}
 */
export function getPrefixDataForModule(moduleId: string): IModulePrefixData | null {
    const matches = moduleId.match(/([^!].+)!(.+)/);
    if (matches) {
        return {
            prefix: matches[1],
            moduleId: matches[2],
        };
    } else {
        return matches;
    }
}

/**
 *
 *
 * @export
 * @param {string} moduleId
 * @returns {(string | null)}
 */
export function getFileExtensionForModule(moduleId: string): string | null {
    const matches = moduleId.match(/\.(.+)$/);
    if (matches) {
        return matches[1];
    } else {
        return matches;
    }
}
