// Until actual tests are implemented, this file just details the intended tool usage
import TaskBuilder from "../src";

const runTaskOrDefault = TaskBuilder(Task => {
    Task.create("Clean", () => {
        // Tool should have a built-in way to clean directories
    });

    Task.create("Restore", () => {
        // Tool should have a built-in way to restore packages via NPM or Yarn
    });

    Task.create("Build:Client", () => {
        // Tool should have a built-in way to run NPM scripts, webpack, or any executable
    });

    Task.create("Build:Server", () => {
        // Tool should have a built-in way to run NPM scripts, webpack, or any executable
    });

    // The dependency list will run "Build:Client" and "Build:Server" before running "Build". Since those
    // two tasks will build the application, this one doesn't need to do anything.
    Task.create("Build", Task.doNothing);

    // Task "All" is just an alias for task "Build"
    Task.create("All", Task.doNothing);

    Task.create("Test", () => {
        // Tool should have a built-in way to run NPM scripts, webpack, or any executable
    });

    Task.create("Publish", () => {
        // Tool should have a built-in way to run NPM/Yarn publish
    });

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
        ["Build", "Publish"],

        // Again, building on the dependencies already specified.
        // Here we add "Clean" as a direct dependency of "Build".
        // At this point if we ran "Build", the task order would be:
        // "Clean"
        // => "Restore"
        // => "Build:Client" && "Build:Server"
        // => "Clean"
        // => "Build"
        ["Clean", "Build"]
    ]);
});

// Run whichever task was given to the CLI. If no task was given, run the "Clean" task instead.
runTaskOrDefault("Clean");
