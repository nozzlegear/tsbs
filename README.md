# TSBS, the TypeScript Build System

This project was inspired by [FAKE (F# Make)](http://fake.build/index.html). I wanted a way to create arbitrary build tasks that would run pure TypeScript (or JavaScript), rather than relying on NPM's garbage package.json scripts. Gulp comes close to what I want, but specifying and running dependencies (tasks that depend on other tasks) is unintuitive, and the piping unnecessary.

This is an alpha project at the moment; the intended usage looks something like this:

```ts
import { Task } from "tsbs";

Task.create("Clean", () => {
    // Tool should have a built-in way to clean directories
})

Task.create("Restore", () => {
    // Tool should have a built-in way to restore packages via NPM or Yarn
})

Task.create("Build:Client", () => {
    // Tool should have a built-in way to run NPM scripts, webpack, or any executable
})

Task.create("Build:Server", () => {
    // Tool should have a built-in way to run NPM scripts, webpack, or any executable
})

// The dependency list will run "Build:Client" and "Build:Server" before running "Build". Since those
// two tasks will build the application, this one doesn't need to do anything.
Task.create("Build", Task.doNothing);

// Task "All" is just an alias for task "Build"
Task.create("All", Task.doNothing);

Task.create("Test", () => {
    // Tool should have a built-in way to run NPM scripts, webpack, or any executable
})

Task.create("Publish", () => {
    // Tool should have a built-in way to run NPM/Yarn publish
})

// Export tasks and their dependencies
export const Tasks = [
    // Dependency is as follows:
    // Task "Clean" has no dependencies
    // Task "Restore" depends on task "Clean" and will run that first
    // Tasks "Build:Client" and "Build:Server" do not depend on each other, but do depend on "Restore" (and its dependencies)
    // Tasks "Build" and "All" depend on both "Build:Client" and "Build:Server"
    Task.dependencies([
        "Clean", 
        "Restore",
        ["Build:Client", "Build:Server"],
        ["Build", "All"]
    ]),

    // Dependencies build on the ones already specified.
    // Task "Build" depends on everything configured previously.
    // Task "Publish" depends on task "Build" (but not task "All").
    Task.dependencies([
        "Build",
        "Publish"
    ]),
    
    // Again, building on the dependencies already specified.
    // Here we add "Clean" as a direct dependency of "Build".
    // At this point if we ran "Build", the task order would be:
    // "Clean"
    // |> "Restore"
    // |> "Build:Client" && "Build:Server"
    // |> "Clean"
    // |> "Build"
    Task.dependencies([
        "Clean",
        "Build"
    ])
]

// Export the default task. This will run if no task is specified. 
export default "All"
```
