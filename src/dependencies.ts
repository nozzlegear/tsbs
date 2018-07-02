export type RawDependencyGroup = (string | string[]) []

export type RawDependencies = RawDependencyGroup []

export type AddDependenciesFunction = (dependencyList: RawDependencies) => Dependency[];

type Dependency = SingleDependency | GroupDependency

export interface SingleDependency {
    type: "single"
    name: string 
    dependsOn: Dependency | undefined
}

export interface GroupDependency {
    type: "group"
    members: Dependency[]
}

function isSingle(obj: Dependency): obj is SingleDependency {
    return obj.type === "single"
}

function isGroup(obj: Dependency): obj is GroupDependency {
    return obj.type === "group"
}

export type DependencyList = Dependency []

export const dependencies: AddDependenciesFunction = (dependencyList) => {
    console.log({dependencyList})

    // TODO: Take the dependency list and determine which tasks depend on which. 
    // The algorithm used for this is a linked list.
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

    function mapDependency(rawDependencies: RawDependencyGroup): Dependency | undefined {
        if (rawDependencies.length === 0) {
            // We've reached the end of the list
            return undefined;
        }

        const deps = rawDependencies.slice()
        const task = deps.shift()

        if (task === undefined) {
            // A bad entry in the list
            return undefined
        }

        if (Array.isArray(task)) {
            const output: GroupDependency = {
                members: task.map<SingleDependency>(name => ({
                    name,
                    type: "single",
                    dependsOn: mapDependency(deps)
                })),
                type: "group"
            }

            return output
        } else {
            const output: SingleDependency = {
                type: "single",
                name: task,
                dependsOn: mapDependency(deps)
            }

            return output;
        }
    }

    // The dependency list is an array of arrays. We want to map each array to a single `Dependency` type (which itself is a linked list). 
    const mappedDeps = dependencyList.reduce((state, depGroup) => {
        // Our depGroup is one single array of either task names (strings) or soft dependency task groups (string arrays). 
        // Since the head of a dependency group is the start, we want to reverse the array and work from tail => head. 
        const dependency = mapDependency(depGroup)

        return dependency === undefined ? state : [...state, dependency]
    }, [] as Dependency[])

    return mappedDeps
}