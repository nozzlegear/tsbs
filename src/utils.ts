import { Option } from "./option";

/**
 * Executes the @predicate on the list to find the index of the first element that returns true.
 * Returns -1 if no item is found.
 */
export function findIndexOf<T>(
    predicate: (item: T) => boolean,
    list: T[]
): number {
    for (let i = 0; i < list.length; i++) {
        const item = list[i];

        if (predicate(item)) {
            return i;
        }
    }

    return -1;
}

export function tryFind<T>(
    predicate: (item: T) => boolean,
    list: T[]
): Option<T> {
    const index = findIndexOf(predicate, list);

    return index === -1 ? Option.none() : Option.some(list[index]);
}

export function tryHead<T>(list: T[]): Option<T> {
    return list.length > 0 ? Option.some(list[0]) : Option.none();
}

export function tryTail<T>(list: T[]): Option<T> {
    return list.length > 0 ? Option.some(list[list.length - 1]) : Option.none();
}

export function contains<T>(targets: T[], list: T[]): boolean {
    return targets.every(target => list.some(listItem => listItem === target));
}

/**
 * Continues to call the accumulator function, passing in the value from the last run, until the `stop` function is called.
 */
export function accumulate<T>(
    accumulator: (accumulation: T | undefined, stop: () => void) => T,
    initialValue: T | undefined
): T {
    let accumulation = initialValue;
    let calledStop = false;
    const stop = () => {
        calledStop = true;
    };

    while (!calledStop) {
        accumulation = accumulator(accumulation, stop);
    }

    return accumulation as T;
}
