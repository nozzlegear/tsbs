export type RawDependencies = (string | string[]) [] []

export type AddDependenciesFunction = (dependencyList: RawDependencies) => Dependency[];

export interface Dependency {
    name: string, 
    dependsOn: Dependency[]
}

export type DependencyList = Dependency []

export const dependencies: AddDependenciesFunction = (dependencyList) => {
    console.log({dependencyList})

    // TODO: Take the dependency list and determine which tasks depend on which. 
    // I *believe* the correct term for this is reverse tree? or something. 
    // First, we'll take each task individually and turn it into a Dependency object. 
    // Second, we'll go through the original dependency list and determine which task is its parent. 
    // Using an F#-style recursive function, we'll continue up the chain and then find that task's parent until the final task has no parents. 
    // A dependency will look something like this:
    // {
    //     name: "Build",
    //     dependsOn: [
    //         {
    //             name: "Build:Client",
    //             dependsOn: [
    //                 {
    //                     name: "Restore",
    //                     dependsOn: [
    //                         {
    //                             name: "Clean",
    //                             dependsOn: []
    //                         }
    //                     ]
    //                 }
    //             ]
    //         },
    //         {
    //             name: "Build:Server",
    //             dependsOn: [
    //                 {
    //                     name: "Restore",
    //                     dependsOn: [
    //                         {
    //                             name: "Clean",
    //                             dependsOn: []
    //                         }
    //                     ]
    //                 }
    //             ]
    //         }
    //     ]
    // }

    return []
}