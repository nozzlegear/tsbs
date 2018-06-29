export type TaskHandler = 
    () => void 
    | (() => Promise<void>)

export const Task: any = {
    create: (name: string, handler: TaskHandler) => {
        console.log("This version of TSBS is not functional.", {name, handler})
    },
    dependencies: (list: (string | string[])[]) => {
        console.log("This version of TSBS is not functiona.", {list})
    }
};