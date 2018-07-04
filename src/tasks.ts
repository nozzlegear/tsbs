import { dependencies } from ".";
import { tryFind } from "./utils";

export type TaskName = string

export type Task = {
    name: TaskName
    dependsOn: TaskName[]
}

export type TaskHandler = 
    () => void 
    | (() => Promise<void>)

export function createTask(taskName: string, handler: TaskHandler) {
    console.log({taskName, handler})
}

const TaskBuilder = {
    create: createTask,
    dependencies,
    doNothing: (..._: any[]) => {}
}

export type RunFunction = (defaultTaskName: string) => void

export function taskBuilder(configure: (builder: typeof TaskBuilder) => Task[]): RunFunction {
    const taskList = configure(TaskBuilder)

    console.log({taskList})

    // TODO: any tasks created with builder.create(taskName) that *doesn't* have dependencies should
    // be added to the task list as a task with no dependencies.

    return (taskName: string) => {
        console.log("Running default task", {taskName})
    }
}

/**
 * Determines the execution order of tasks, starting with the given task name.
 */
export function getTaskExecutionOrder(taskName: string, list: Task[]): Task[] {
    const firstTask = tryFind(task => task.name === taskName, list)

    if (Option.isNone(firstTask)) {
        throw new Error(`Task ${taskName} does not appear in the list of task dependencies.`)
    }
    
    let nextTasks: Task[] = Option.get(firstTask).dependencies
    let executionOrder: Task[] = [Option.get(currentTask)]

    // Iterate over the list of tasks, pushing to the output
    while (currentTask.dependsOn.length > 0) {
        // Find the dependencies for the current task

    }

    return []
}