export type TaskHandler = 
    () => void 
    | (() => Promise<void>)

export type CreateTaskFunction = (taskName: string, handler: TaskHandler) => void 

export const createTask: CreateTaskFunction = (taskName: string, handler: TaskHandler) => {
    console.log({taskName, handler})
}