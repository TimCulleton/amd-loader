define("complicatedModules/concatModulesA/moduleA", [], function() {
    return {
        moduleName: "moduleA"
    }
});
define("complicatedModules/concatModulesA/moduleB", ["complicatedModules/concatModulesA/moduleA"], function(moduleA) {
    return {
        moduleName: "moduleB",
        dependency: moduleA
    }
});
