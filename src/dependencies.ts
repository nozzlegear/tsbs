import { findIndexOf, tryFind } from "./utils";
import { Task } from ".";
import { Option } from "./option";
import { EOL } from "os";

export type RawDependencyGroup = (string | string[])[];

export type RawDependencies = RawDependencyGroup[];

export class CyclicalDependencyError extends Error {
    constructor(public cyclicalTaskName: string, public taskNames: string[]) {
        super();
        this.message = CyclicalDependencyError.report(
            cyclicalTaskName,
            taskNames
        );
    }

    /**
     * Formats and reports the order of cyclical dependencies.
     */
    report = () =>
        CyclicalDependencyError.report(this.cyclicalTaskName, this.taskNames);

    /**
     * Formats and reports the order of cyclical dependencies.
     */
    static report = (cyclicalTaskName: string, cyclicalTasks: string[]) => {
        const taskOrder = cyclicalTasks
            .map((name, index) => (index === 0 ? name : `  <== ${name}`))
            .join(EOL);

        return `Cyclical dependency detected: task "${cyclicalTaskName}" depends on itself.${EOL +
            EOL}${taskOrder}`;
    };
}

/**
 * Checks a list of `Task` for cyclical dependencies, throwing a `CyclicalDependencyError` if one is detected.
 */
export function findCyclicalDependencies(tasks: Task[]): void {
    // Navigate the tree to find cyclical dependencies. A task is cyclical if its name appears more than once in a LinkedTask.
    function check(taskName: string, seen: string[]) {
        const seenIndex = seen.indexOf(taskName);

        if (seenIndex > -1) {
            // Trim the seen list down to just the cyclical tasks and those in between them
            const cyclicalTasks = [...seen.slice(seenIndex), taskName];

            throw new CyclicalDependencyError(taskName, cyclicalTasks);
        }

        // Find the task
        const findResult = tryFind(t => t.name === taskName, tasks);

        if (Option.isNone(findResult)) {
            throw new Error(
                `Task ${taskName} does not appear in the list of tasks.`
            );
        }

        const task = Option.get(findResult);

        task.dependsOn.forEach(task => check(task, [...seen, taskName]));
    }

    tasks.forEach(task => check(task.name, []));
}

/**
 * Gets a task of task group at the given position, ensuring they're returned as an array of task names.
 * @param atPosition The 0-based position of the desired task.
 * @param list The list of tasks to pull the task from.
 */
export function getTaskAtPosition(
    atPosition: number,
    list: RawDependencyGroup
): string[] {
    const nextDependencySlice = list.slice(atPosition, atPosition + 1);

    if (nextDependencySlice.length === 0) {
        return [];
    }

    const nextDependency = nextDependencySlice[0];

    return Array.isArray(nextDependency) ? nextDependency : [nextDependency];
}

/**
 * Reduces an array of RawDependencyGroups into a flat linked list, where each link contains the name of its dependency, but not the dependency iself.
 */
export function dependencies(dependencyList: RawDependencies): Task[] {
    const tasks =
        // The dependency list is an array of arrays. We want to map each inner array to a `Task` type.
        dependencyList
            .reduce<Task[]>((allTasks, depGroup) => {
                // Our depGroup is one single array of either task names (strings) or soft dependency task groups (string arrays).
                const newTasks = depGroup.reduce<Task[]>(
                    (state, newTask, index, list) => {
                        // Find this task's dependencies by looking up the previous element in the list. If this is the first element in the list, we'll find its dependencies later.
                        const dependsOn =
                            index === 0
                                ? []
                                : getTaskAtPosition(index - 1, list);
                        let output: Task[];

                        if (Array.isArray(newTask)) {
                            const tasks = newTask.map<Task>(name => ({
                                name,
                                dependsOn
                            }));

                            output = tasks;
                        } else {
                            output = [
                                {
                                    name: newTask,
                                    dependsOn
                                }
                            ];
                        }

                        return [...state, ...output];
                    },
                    []
                );

                return [...allTasks, ...newTasks];
            }, [])
            // Reduce over the flat task list and, if there are duplicate tasks, decide whether to take the newest or preserve the oldest, but ensure no duplicates.
            // This happens when the task is specified in a later group, meaning the dev has reassigned its dependencies:
            // [
            //     [
            //         "Clean",
            //         "Build"
            //     ],
            //     [
            //         "Restore",
            //         "Build"
            //     ]
            // ]
            // In this example, "Build" now depends on "Restore" instead of "Clean".
            // Here we want to replace the task at its previous position with the new version of this task.
            // **However,** if this version of the task has no dependencies, that means the developer had placed it at the top
            // of a new group to signify that something else depends on it:
            // [
            //     [
            //         "Clean",
            //         "Build"
            //     ],
            //     [
            //         "Build",
            //         "Publish"
            //     ]
            // ]
            // In this example, "Build" still depends on "Clean", and "Publish" depends on "Build".
            // Here we want to preserve the previous task and discard the new one because the previous task still has the correct dependencies
            // and the new version adds no new information.
            .reduce<Task[]>((state, task) => {
                const previousTaskIndex = findIndexOf(
                    t => t.name === task.name,
                    state
                );
                let output: Task[];

                if (previousTaskIndex > -1 && task.dependsOn.length > 0) {
                    // Replace the old version of the task
                    output = [
                        ...state.slice(0, previousTaskIndex),
                        task,
                        ...state.slice(previousTaskIndex + 1)
                    ];
                } else if (previousTaskIndex > -1) {
                    // Don't add the new task or replace the old one, as it adds no new information
                    output = state;
                } else {
                    output = [...state, task];
                }

                return output;
            }, []);

    // Finally, check each task for cyclical dependencies
    findCyclicalDependencies(tasks);

    return tasks;
}
