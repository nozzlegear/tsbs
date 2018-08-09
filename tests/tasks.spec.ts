import TSBS, { TaskBuilder, dependencies, linkTaskExecutionChain, LinkedTask } from "../src";

test("Task builder calls the configuration function", () => {
    const configFunction = jest.fn((task: TaskBuilder) => {
        return task.dependencies([["Clean", "Build"]]);
    });

    TSBS(configFunction);

    expect(configFunction).toBeCalled();
});

test("Adds tasks without dependencies to the final task list", () => {
    const deps = dependencies([["Clean", "Restore", ["Build:Server", "Build:Client"], "Build"], ["NoDeps"]]);

    expect(deps).toEqual([
        { name: "Clean", dependsOn: [] },
        { name: "Restore", dependsOn: ["Clean"] },
        { name: "Build:Server", dependsOn: ["Restore"] },
        { name: "Build:Client", dependsOn: ["Restore"] },
        { name: "Build", dependsOn: ["Build:Server", "Build:Client"] },
        { name: "NoDeps", dependsOn: [] }
    ]);
});

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

test.skip("Executes a task with no dependencies", () => {
    const task = jest.fn();
    const run = TSBS(builder => {
        builder.create("Build", task);

        return builder.dependencies([["Build"]]);
    });

    expect(() => run("build")).not.toThrow();
    expect(task).toBeCalled();
});

test.skip("Throws an error when trying to execute a task that doesn't exist", () => {
    const run = TSBS(builder => {
        builder.create("Build", () => {});

        return builder.dependencies([["Build"]]);
    });

    expect(() => run("something")).toThrow(`Task "something" does not exist.`);
});

test.skip("Executes a task's single dependency before the task itself", () => {
    const callOrder: string[] = [];
    const cleanTask = jest.fn(() => {
        callOrder.push("Clean");
    });
    const buildTask = jest.fn(() => {
        callOrder.push("Build");
    });
    const run = TSBS(builder => {
        builder.create("Clean", cleanTask);
        builder.create("Build", buildTask);

        return builder.dependencies([["Clean", "Build"]]);
    });

    expect(() => run("build")).not.toThrow();
    expect(cleanTask).toBeCalled();
    expect(buildTask).toBeCalled();
    expect(callOrder).toEqual(["Clean", "Build"]);
});

test.skip("Executes an entire task chain with groups before the task itself", () => {
    const callOrder: string[] = [];
    const cleanTask = jest.fn(() => {
        callOrder.push("Clean");
    });
    const beforeRestoreClientTask = jest.fn(() => {
        callOrder.push("Before Restore:Client");
    });
    const restoreClientTask = jest.fn(() => {
        callOrder.push("Restore:Client");
    });
    const restoreServerTask = jest.fn(() => {
        callOrder.push("Restore:Server");
    });
    const buildTask = jest.fn(() => {
        callOrder.push("Build");
    });
    const run = TSBS(builder => {
        builder.create("Clean", cleanTask);
        builder.create("Before Restore:Client", beforeRestoreClientTask);
        builder.create("Restore:Client", restoreClientTask);
        builder.create("Restore:Server", restoreServerTask);
        builder.create("Build", buildTask);

        return builder.dependencies([
            ["Clean", "Before Restore:Client", ["Restore:Client", "Restore:Server"], "Build"]
        ]);
    });

    expect(() => run("build")).not.toThrow();
    expect(cleanTask).toBeCalled();
    expect(beforeRestoreClientTask).toBeCalled();
    expect(restoreClientTask).toBeCalled();
    expect(restoreServerTask).toBeCalled();
    expect(buildTask).toBeCalled();
    expect(callOrder).toEqual(["Clean", "Before Restore:Client", "Restore:Client", "Restore:Server", "Build"]);
});

test.skip("A function prints the execution order for a task chain", () => {
    fail("Not yet implemented");

    // This should look similar to the task chain that gets printed with FAKE:
    // Clean
    //  ==> Before Restore:Client
    //   ==> Restore:Client
    //  ==> Restore:Server
    //  ==> Build

    // Where the dependency group looks like:
    ["Clean", ["Restore:Server", ["Before Restore:Client", "Restore:Client"]], "Build"];
});
