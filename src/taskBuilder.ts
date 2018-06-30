import { 
    DependencyList, 
    createTask, 
    CreateTaskFunction ,
    AddDependenciesFunction,
    dependencies
} from ".";

export interface TaskBuilder {
    create: CreateTaskFunction
    dependencies: AddDependenciesFunction
    doNothing: (...args: any[]) => void
}

export type RunFunction = (defaultTaskName: string) => void

export function taskBuilder(configure: (builder: TaskBuilder) => DependencyList): RunFunction {
    const taskBuilder = {
        create: createTask,
        dependencies: dependencies,
        doNothing: (..._: any[]) => { }
    };

    const dependencyList = configure(taskBuilder)

    console.log({dependencyList})

    return (taskName: string) => {
        console.log("Running default task", {taskName})
    }
}