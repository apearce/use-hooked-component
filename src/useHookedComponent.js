import * as React from "react";
import { useState } from "react";

function isFunction(f) {
    return ({}).toString.call(f) === "[object Function]"
}

function isObject(o) {
    return ({}).toString.call(o) === "[object Object]"
}

function useHookedComponent(Component, initial, setters) {
    const [returnState] = useState(() => {
        let state;
        let setState = () => {};
        let returnSetters = [(v) => setState(v)];

        function getSetter(setter) {
            return (...args) => {
                return isFunction(args[0]) ? 
                    setState(current => setter(args[0](current))) : 
                    setState(current => setter(...args, current));
            }
        }

        if (Array.isArray(setters)) {
            returnSetters = setters.map(getSetter);
        } else if (isObject(setters)) {
            returnSetters = [Object.entries(setters).reduce((acc, [name, setter]) => {
                acc[name] = getSetter(setter);

                return acc;
            }, {})];
        } else if (isFunction(setters)) {
            returnSetters = [getSetter(setters)];
        }

        return [function HookedComponent(props) {
            [state, setState] = useState(initial);

            return (<Component {...props} {...state} />);
        }, ...returnSetters, () => state];
    });

    return returnState;
}

export default useHookedComponent;
