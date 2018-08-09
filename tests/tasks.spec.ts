import TSBS, { TaskBuilder, dependencies, linkTaskExecutionChain, LinkedTask, Task } from "../src";

test("Task builder calls the configuration function", () => {
    const configFunction = jest.fn((task: TaskBuilder) => {
        return task.dependencies([["Clean", "Build"]]);
    });

    TSBS(configFunction);

    expect(configFunction).toBeCalled();
});

test.skip("Adds tasks without dependencies to the final task list", () => {});

test("Links task execution chain", () => {
    const deps = dependencies([["Clean", "Restore", ["Build:Server", "Build:Client"], "Build"]]);
    const linked = linkTaskExecutionChain("Build", deps);

    expect(linked).toEqual({
        name: "Build",
        next: [
            {
                name: "Build:Server",
                next: [
                    {
                        name: "Restore",
                        next: [
                            {
                                name: "Clean",
                                next: []
                            }
                        ]
                    }
                ]
            },
            {
                name: "Build:Client",
                next: [
                    {
                        name: "Restore",
                        next: [
                            {
                                name: "Clean",
                                next: []
                            }
                        ]
                    }
                ]
            }
        ]
    } as LinkedTask);
});

test("Links task execution chain when input task does not match casing", () => {
    const deps = dependencies([["Clean", "Restore", ["Build:Server", "Build:Client"], "Build"]]);
    const linked = linkTaskExecutionChain("build", deps);

    expect(linked).toEqual({
        name: "Build",
        next: [
            {
                name: "Build:Server",
                next: [
                    {
                        name: "Restore",
                        next: [
                            {
                                name: "Clean",
                                next: []
                            }
                        ]
                    }
                ]
            },
            {
                name: "Build:Client",
                next: [
                    {
                        name: "Restore",
                        next: [
                            {
                                name: "Clean",
                                next: []
                            }
                        ]
                    }
                ]
            }
        ]
    } as LinkedTask);
});
