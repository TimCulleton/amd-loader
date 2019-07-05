declare module "simpleModules/moduleA" {
    export const moduleName: string;
}

declare module "simpleModules/moduleB" {
    export const moduleName: string;
    export const dependency: string;
}
