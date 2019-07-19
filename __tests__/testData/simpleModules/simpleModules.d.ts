declare module "simpleModules/moduleA" {
    export const moduleName: string;
}

declare module "simpleModules/moduleB" {
    export const moduleName: string;
    export const dependency: string;
}


declare module "i18n!simpleModules/i18n.json" {
    export const randomText: string;
    export const replacementText: string;
    export const replace: (input: string, values: object) => string;
}
