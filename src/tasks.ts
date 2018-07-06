import { dependencies } from ".";
import { tryFind } from "./utils";
import { Option } from "./option";
import { findCyclicalDependencies } from "./dependencies";

export type TaskName = string;

export type Task = {
    name: TaskName;
    dependsOn: TaskName[];
};

export type TaskHandler = () => void | (() => Promise<void>);

export function createTask(taskName: string, handler: TaskHandler) {
    console.log({ taskName, handler });
}

const TaskBuilder = {
    create: createTask,
    dependencies,
    doNothing: (..._: any[]) => {}
};

export type RunFunction = (defaultTaskName: string) => void;

export function taskBuilder(
    configure: (builder: typeof TaskBuilder) => Task[]
): RunFunction {
    const taskList = configure(TaskBuilder);

    console.log({ taskList });

    // TODO: any tasks created with builder.create(taskName) that *doesn't* have dependencies should
    // be added to the task list as a task with no dependencies.

    return (taskName: string) => {
        console.log("Running default task", { taskName });
    };
}

export interface LinkedTask {
    name: TaskName;
    next: LinkedTask[];
}

/**
 * Determines the execution order of tasks, starting with the given task name, and returns a linked list of tasks.
 */
export function linkTaskExecutionChain(
    taskName: string,
    list: Task[]
): LinkedTask {
    // Find the task matching the task name
    const findResult = tryFind(task => task.name === taskName, list);

    if (Option.isNone(findResult)) {
        throw new Error(
            `Task ${taskName} does not appear in the list of task dependencies.`
        );
    }

    findCyclicalDependencies(list);

    const task: Task = Option.get(findResult);

    return {
        name: task.name,
        next: task.dependsOn.map(nextTaskName =>
            linkTaskExecutionChain(nextTaskName, list)
        )
    };
}
