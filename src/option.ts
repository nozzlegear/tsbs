export type Option<T> = Some<T> | None;
export type Some<T> = T;
export type None = null | undefined;

// export class Option<T> {
//     constructor(private value?: T | None) {

//     }

//     public isNone = () => this.value === undefined || this.value === null

//     public isSome = () => !this.isNone()

//     static isNone(option: any): option is None {
//         if (option instanceof Option) {
//             return option.isNone()
//         }

//         const t = new Option("test")

//         if (Option.isNone(t)) {

//         }

//         return false
//     }

//     static isSome(option: Option<any>): boolean {
//         return !Option.isNone(option)
//     }
// }

export namespace Option {
    export function isNone(option: Option<any>): option is None {
        return option === null || option === undefined;
    }

    export function isSome<T>(option: Option<T>): option is Some<T> {
        return !isNone(option);
    }

    export function wrap<T>(value: T | None): Option<T> {
        // Default wrapped options to null rather than undefined
        return value === undefined ? null : value;
    }

    export function of<T>(value: T | None): Option<T> {
        return wrap(value);
    }

    export function some<T>(value: T | None): Option<T> {
        return wrap(value);
    }

    export function none(): Option<None> {
        return null;
    }

    export function get<T>(option: Option<T>): T {
        if (Option.isNone(option)) {
            throw new Error(`Could not get option value. Option was None.`);
        }

        return option;
    }

    export function map<Input, Output>(
        fn: (value: Input) => Output,
        option: Option<Input>
    ): Option<Output> {
        if (Option.isSome(option)) {
            return fn(Option.get(option));
        }

        return option;
    }

    export function iter<T>(fn: (value: T) => void, option: Option<T>): void {
        if (Option.isSome(option)) {
            fn(Option.get(option));
        }
    }
}
