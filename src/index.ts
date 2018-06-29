export type TaskHandler = 
    () => void 
    | (() => Promise<void>)

export const Task = {
    create: (name: string, handler: TaskHandler) => {
        console.log("This version of TSBS is not functional.", {name, handler})
    },
    dependencies: (list: (string | string[])[]) => {
        console.log("This version of TSBS is not functional.", {list})
    },
    doNothing: (...args: any[]) => {
        console.log("This version of TSBS is not functional.", {args})
    }
};