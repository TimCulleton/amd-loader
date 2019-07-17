// tslint:disable: no-console

/**
 * Enable Logging
 */
export let enableLogging = true;

/**
 * Enable debug logging
 */
export let debugLogging = true;

/**
 *
 * Print a debug message to the console
 * @export
 * @param {...any[]} args
 */
export function debug(...args: any[]): void {
    if (enableLogging && debugLogging) {
        console.debug(`${getTime()}: `, args);
    }
}

/**
 *
 * Log a message to the console
 * @export
 * @param {...any[]} args
 */
export function log(...args: any[]): void {
    if (enableLogging) {
        console.log(`${getTime()}: `, args);
    }
}

/**
 *
 * Log an error Message to the console
 * @export
 * @param {...any[]} args
 */
export function error(...args: any[]): void {
    console.error(`${getTime()}: `, args);
}

/**
 *
 * Get the current time in 24hr format
 * @export
 * @returns {string}
 */
export function getTime(): string {
    const date = new Date();
    const time = date.toTimeString().match(/^(\d+:\d+:\d+).+/);
    return  time ? `[${time[1]}]` : `[${date.toTimeString()}]`;
}
