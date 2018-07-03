export type RawDependencyGroup = (string | string[]) []

export type RawDependencies = RawDependencyGroup []

export type AddDependenciesFunction = (dependencyList: RawDependencies) => TaskList;

type TaskName = string

type Task = {
    name: TaskName
    dependsOn: TaskName[]
}

export type TaskList = Task []

export function getNextDependencies(atPosition: number, list: RawDependencyGroup): string[] {
    const nextDependencySlice = list.slice(atPosition, atPosition + 1)

    if (nextDependencySlice.length === 0) {
        return []
    }

    const nextDependency = nextDependencySlice[0]

    return Array.isArray(nextDependency) ? nextDependency : [nextDependency] 
}

export function mapTasks(rawDependencies: RawDependencyGroup): Task[] {
    return rawDependencies.reduce<Task []>((state, task, index, list) => {
        const dependsOn = getNextDependencies(index + 1, list);

        if (Array.isArray(task)) {
            const tasks = task.map<Task>(name => ({
                name,
                dependsOn
            }))

            return [
                ...state,
                ...tasks
            ]   
        } else {
            const output: Task = {
                name: task,
                dependsOn
            }

            return [
                ...state,
                output
            ]
        }
    }, [])
}

export const dependencies: AddDependenciesFunction = (dependencyList) => {
    // Reduce dependencies into a flat linked list, where each link just contains a reference to its dependency, but not the dependency itself. 
    // Instead all tasks are stored in a flat array and we can just reduce over it to build the final task list.
    // [
    //     {
    //         taskName: "Build",
    //         dependsOn: ["Build:Client", "Build:Server"]
    //     },
    //     {
    //         taskName: "Build:Client",
    //         dependsOn: ["Clean"]
    //     },
    //     {
    //         taskName: "Build:Server",
    //         dependsOn: ["Clean"]
    //     },
    //     {
    //         taskName: "Clean",
    //         dependsOn: []
    //     }
    // ]

    // The dependency list is an array of arrays. We want to map each inner array to a single `Task` type. 
    // Since the head of the dependency group is the start, we want to reverse the array and work from the tail => head to determine which 
    // tasks a single task depends on.
    const tasks = dependencyList.reverse().reduce<Task []>((state, depGroup) => {
        // Our depGroup is one single array of either task names (strings) or soft dependency task groups (string arrays). 
        // Again, we want to reverse the array of tasks and work from tail => head
        const newTasks = mapTasks(depGroup.reverse());

        // If the mapped tasks contain any tasks that are already present in the state, we need to discard them before merging into the 
        // state, as their dependency was changed to whatever is already present in the list (remember that we're traversing the dependency list from bottom to top). 
        const filteredNewTasks = newTasks.filter(newTask => !state.some(stateTask => stateTask.name === newTask.name));

        return [...state, ...filteredNewTasks]
    }, [])

    return tasks
}