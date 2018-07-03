import { dependencies } from "../src"

test("Calculates dependencies", () => {
    const graph = dependencies([
        [
            "Clean",
            ["Build:Server", "Build:Client"],
            "Build"
        ]
    ])
    
    expect(graph.length === 4)

    graph.forEach(task => {
        console.log("Checking task", task);
        switch (task.name) {
            case "Clean":
                expect(task.dependsOn).toHaveLength(0)
                break;
        
            case "Build:Server":
                expect(task.dependsOn).toHaveLength(1)
                expect(task.dependsOn[0]).toBe("Clean")
                break;
                
            case "Build:Client":
                expect(task.dependsOn).toHaveLength(1)
                expect(task.dependsOn[0]).toBe("Clean")
                break;
                
            case "Build":
                expect(task.dependsOn).toHaveLength(2)
                expect(task.dependsOn[0]).toBe("Build:Server")
                expect(task.dependsOn[1]).toBe("Build:Client")
                break;
        }
    })
});

test("Calculates multiple dependency groups", () => {
    const graph = dependencies([
        [
            "Clean",
            "Build"
        ],
        [
            "Build",
            "Publish"
        ]
    ])

    // Starting the second group off with a task that already has a dependency should NOT clear those dependencies.
    // This is just a way for the user to specify that this task is the parent task of another, although technically
    // they should have put the next dependent task in the first group (unless the parent task was in a soft dependency group,
    // in which case it makes sense to specify in another array :)
    console.log(JSON.stringify(graph, null, 4))
})

test("Calculates dependencies that start with a soft dependency group", () => {
    const graph = dependencies([
        [
            ["Restore:Client", "Restore:Server"],
            "Restore"
        ],
        [
            ["Restore", "Clean"],
            "Build"
        ]
    ])

    // Starting the second group off with a task that already has a dependency should NOT clear those dependencies.
    // This is just a way for the user to specify that this task is the parent task of another, although technically
    // they should have put the next dependent task in the first group (unless the parent task was in a soft dependency group,
    // in which case it makes sense to specify in another array :)
    console.log(JSON.stringify(graph, null, 4))
})

test("Reassigns dependencies", () => {
    const graph = dependencies([
        [
            "Clean",
            "Build"
        ],
        [
            // Reassigning a task will clear its previous dependencies, as we have no idea where the 
            // new task should fit in with the old task. In this case, we reassign "Build" to be dependent on 
            // "Some:Task" and "Some:OtherTask".
            "Restore",
            "Build"
        ]
    ])

    expect(graph).toHaveLength(3)
})