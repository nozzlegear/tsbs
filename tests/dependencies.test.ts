import { dependencies } from "../src"

test("Calculates dependencies", () => {
    const graph = dependencies([
        [
            "Clean",
            ["Build:Server", "Build:Client"],
            "Build"
        ],
        [
            "Build",
            "Publish"
        ],
        [
            // Reassigning a task will clear its previous dependencies, as we have no idea where the 
            // new task should fit in with the old task. In this case, we reassign "Build" to be dependent on 
            // "Some:Task" and "Some:OtherTask".
            ["Some:Task", "Some:OtherTask"],
            "Build"
        ]
    ])

    console.log(JSON.stringify(graph, undefined, 4))

    // expect(graph.some(d => d.name === "Clean")).toBe(true);
    // expect(graph.some(d => d.name === "Build")).toBe(true);
});