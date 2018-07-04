/**
 * Executes the @predicate on the list to find the index of the first element that returns true. 
 * Returns -1 if no item is found.
 */
export function findIndexOf<T>(predicate: (item: T) => boolean, list: T[]): number {
    for (let i = 0; i < list.length; i++) {
        const item = list[i]

        if (predicate(item)) {
            return i
        }
    }

    return -1
}