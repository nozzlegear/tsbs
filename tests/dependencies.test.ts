import { dependencies } from "../src"

test("Calculates dependencies", () => {
    const graph = dependencies([
        [
            "Clean",
            ["Build:Server", "Build:Client"],
            "Build"
        ]
    ])

    console.log(JSON.stringify(graph, undefined, 4))

    // expect(graph.some(d => d.name === "Clean")).toBe(true);
    // expect(graph.some(d => d.name === "Build")).toBe(true);
});