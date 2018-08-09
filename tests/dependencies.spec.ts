import { dependencies, linkTaskExecutionChain, CyclicalDependencyError } from "../src";
import { EOL } from "os";

test("Calculates dependencies", () => {
    const graph = dependencies([["Clean", ["Build:Server", "Build:Client"], "Build"]]);

    expect(graph).toHaveLength(4);

    graph.forEach(task => {
        switch (task.name) {
            case "Clean":
                expect(task.dependsOn).toHaveLength(0);
                break;

            case "Build:Server":
                expect(task.dependsOn).toHaveLength(1);
                expect(task.dependsOn).toContainEqual("Clean");
                break;

            case "Build:Client":
                expect(task.dependsOn).toHaveLength(1);
                expect(task.dependsOn).toContainEqual("Clean");
                break;

            case "Build":
                expect(task.dependsOn).toHaveLength(2);
                expect(task.dependsOn).toContainEqual("Build:Server");
                expect(task.dependsOn).toContainEqual("Build:Client");
                break;

            default:
                throw new Error(`Unexpected task name ${task.name}`);
        }
    });
});

test("Calculates multiple dependency groups", () => {
    // Starting the second group off with a task that already has a dependency should NOT clear those dependencies.
    // This is just a way for the user to specify that this task is the parent task of another, although technically
    // they should have put the next dependent task in the first group (unless the parent task was in a soft dependency group,
    // in which case it makes sense to specify in another array :)
    const graph = dependencies([["Clean", "Build"], ["Build", "Publish"]]);

    expect(graph).toHaveLength(3);

    graph.forEach(task => {
        switch (task.name) {
            case "Clean":
                expect(task.dependsOn).toHaveLength(0);
                break;

            case "Build":
                expect(task.dependsOn).toHaveLength(1);
                expect(task.dependsOn).toContainEqual("Clean");
                break;

            case "Publish":
                expect(task.dependsOn).toHaveLength(1);
                expect(task.dependsOn).toContainEqual("Build");
                break;

            default:
                throw new Error(`Unexpected task name ${task.name}`);
        }
    });
});

test("Calculates dependencies that start with a soft dependency group", () => {
    const graph = dependencies([[["Restore:Client", "Restore:Server"], "Restore"], [["Restore", "Clean"], "Build"]]);

    expect(graph).toHaveLength(5);

    graph.forEach(task => {
        switch (task.name) {
            case "Restore:Client":
                expect(task.dependsOn).toHaveLength(0);
                break;

            case "Restore:Server":
                expect(task.dependsOn).toHaveLength(0);
                break;

            case "Restore":
                expect(task.dependsOn).toHaveLength(2);
                expect(task.dependsOn).toContainEqual("Restore:Client");
                expect(task.dependsOn).toContainEqual("Restore:Server");
                break;

            case "Clean":
                expect(task.dependsOn).toHaveLength(0);
                break;

            case "Build":
                expect(task.dependsOn).toHaveLength(2);
                expect(task.dependsOn).toContainEqual("Restore");
                expect(task.dependsOn).toContainEqual("Clean");
                break;

            default:
                throw new Error(`Unexpected task name ${task.name}`);
        }
    });
});

test("Reassigns dependencies", () => {
    const graph = dependencies([
        ["Clean", "Build"],
        [
            // Reassigning a task will clear its previous dependencies, as we have no idea where the
            // new task should fit in with the old task. In this case, we reassign "Build" to be dependent on
            // "Some:Task" and "Some:OtherTask".
            "Restore",
            "Build"
        ]
    ]);

    expect(graph).toHaveLength(3);

    graph.forEach(task => {
        switch (task.name) {
            case "Clean":
                expect(task.dependsOn).toHaveLength(0);
                break;

            case "Build":
                expect(task.dependsOn).toHaveLength(1);
                expect(task.dependsOn).toContainEqual("Restore");
                break;

            case "Restore":
                expect(task.dependsOn).toHaveLength(0);
                break;

            default:
                throw new Error(`Unexpected task name ${task.name}`);
        }
    });
});

test("Cyclical dependencies should throw an error", () => {
    // TSBS does not support cyclical dependencies. Build cannot depend on Clean which depends on Build.
    // An error should be thrown.
    const err = new CyclicalDependencyError("Clean", ["Clean", "Build", "Clean"]);

    expect(() => {
        dependencies([["Clean", "Build", "Clean"]]);
    }).toThrowError(err);
});

test("CyclicalDependencyError formats its message correctly", () => {
    const err = new CyclicalDependencyError("Clean", ["Clean", "Restore", "Clean"]);
    const expectedMessage = `Cyclical dependency detected: task "Clean" depends on itself.${EOL +
        EOL}Clean${EOL}  <== Restore${EOL}  <== Clean`;

    expect(err.message).toEqual(expectedMessage);
    expect(err.report()).toEqual(expectedMessage);
    expect(CyclicalDependencyError.report(err.cyclicalTaskName, err.taskNames)).toEqual(expectedMessage);
});

test("Should not throw a CyclicalDependencyError when adding a task twice just to add dependencies to it", () => {
    expect(() => {
        dependencies([["Clean", ["Build:Server", "Build:Client"], ["Build", "All"]], ["Build", "Publish"]]);
    }).not.toThrow();
});
