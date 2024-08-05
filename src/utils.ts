import { Obj } from "./types";

function getPromiseWithResolvers() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return { promise, reject, resolve };
}

function getType(o: unknown): string {
    const type = ({}).toString.call(o);

    return type.slice(type.indexOf(" ") + 1, -1);
}

function isFunction(f: unknown): f is Function {
    return getType(f) === "Function";
}

function isObject(o: unknown): o is Obj {
    return getType(o) === "Object";
}

function isUndefined(o: unknown): o is undefined {
    return getType(o) === "Undefined";
}

export {
    getPromiseWithResolvers,
    getType,
    isFunction,
    isObject,
    isUndefined
};
