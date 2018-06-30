# TSBS, the TypeScript Build System

This project was inspired by [FAKE (F# Make)](http://fake.build/index.html). I wanted a way to create arbitrary build tasks that would run pure TypeScript (or JavaScript), rather than relying on NPM's garbage package.json scripts. Gulp comes close to what I want, but specifying and running dependencies (tasks that depend on other tasks) is unintuitive, creating "soft dependency task groups"[1] can't be done (easily) without a third-party package, and the piping is difficult to reason about.

With that said, this project is *not* meant to compete with any other build system. There may be identical or even better tools out there. It's just meant to scratch my own itch and perhaps be useful to other developers.

[1] "soft dependency" task group: a group of tasks that don't depend on each other, but do depend on all previously specified tasks, and further tasks depend on every task in the "soft dependency". For example, consider this group of tasks:

```ts
[
    "Clean",
    ["Build:Client", "Build:Server"],
    "Publish"
]
```

The tasks `"Build:Client"` and `"Build:Server"` are soft dependencies. Running `"Build:Client"` would run `"Clean" => "Build:Client"` but wouldn't run `"Build:Server"` at all. However, running task `"Publish"` would run `"Clean" => "Build:Client" => "Build:Server" => "Publish"`.

## Usage

This is an alpha project at the moment; the intended usage looks something like this:

```ts
import TaskBuilder from "tsbs"

const runTaskOrDefault = TaskBuilder((Task) => {
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

    // Return tasks and their dependencies
    return Task.dependencies([
        // Dependency is as follows:
        // Task "Clean" has no dependencies
        // Task "Restore" depends on task "Clean" and will run that first
        // Tasks "Build:Client" and "Build:Server" do not depend on each other, but do depend on "Restore" (and its dependencies)
        // Tasks "Build" and "All" depend on both "Build:Client" and "Build:Server"
        [
            "Clean",
            "Restore",
            ["Build:Client", "Build:Server"],
            ["Build", "All"]
        ],

        // Dependencies build on the ones already specified.
        // Task "Build" depends on everything configured previously.
        // Task "Publish" depends on task "Build" (but not task "All").
        [
            "Build",
            "Publish"
        ],
        
        // Again, building on the dependencies already specified.
        // Here we add "Clean" as a direct dependency of "Build".
        // At this point if we ran "Build", the task order would be:
        // "Clean"
        // => "Restore"
        // => "Build:Client" && "Build:Server"
        // => "Clean"
        // => "Build"
        [
            "Clean",
            "Build"
        ]
    ])
})

// Run whichever task was given to the CLI. If not ask was given, run the "Clean" task instead.
runTaskOrDefault("Clean")
```
