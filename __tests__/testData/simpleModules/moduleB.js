
define("simpleModules/moduleB", ["simpleModules/moduleA"], function(moduleA) {
    return {
        moduleName: "moduleB",
        dependency: moduleA
    }
});
