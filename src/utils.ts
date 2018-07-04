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

export function tryFind<T>(predicate: (item: T) => boolean, list: T[]): Option<T> {
    const index = findIndexOf(predicate, list)

    return index === -1 ? Option.none() : Option.some(list[index])
}

export function tryHead<T>(list: T[]): Option<T> {
    return list.length > 0 ? Option.some(list[0]) : Option.none()
}

export function tryTail<T>(list: T[]): Option<T> {
    return list.length > 0 ? Option.some(list[list.length - 1]) : Option.none()
}