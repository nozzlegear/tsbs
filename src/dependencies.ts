export type RawDependencies = (string | string[]) [] []

export type AddDependenciesFunction = (dependencyList: RawDependencies) => Dependency[];

export interface Dependency {
    
}

export type DependencyList = Dependency []

export const dependencies: AddDependenciesFunction = (dependencyList) => {
    console.log({dependencyList})

    return []
}